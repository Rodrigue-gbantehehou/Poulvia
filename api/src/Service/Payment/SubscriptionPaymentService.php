<?php

declare(strict_types=1);

namespace App\Service\Payment;

use App\Entity\Organization;
use App\Entity\SubscriptionPayment;
use App\Entity\User;
use App\Enum\OrganizationStatus;
use App\Repository\SubscriptionPaymentRepository;
use App\Service\Admin\AdminAuditService;
use App\Service\Admin\CommercialPlanService;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\DBAL\LockMode;

final class SubscriptionPaymentService
{
    public function __construct(
        private readonly PaymentGatewayRegistry $gateways,
        private readonly SubscriptionPaymentRepository $payments,
        private readonly CommercialPlanService $plans,
        private readonly EntityManagerInterface $entityManager,
        private readonly AdminAuditService $auditService,
        private readonly string $defaultProvider,
    ) {
    }

    /** @return array<string, mixed> */
    public function start(Organization $organization, User $user, string $planSku, string $cycle, string $callbackUrl): array
    {
        $planSku = strtoupper(trim($planSku));
        $cycle = strtoupper(trim($cycle));
        $plan = $this->plans->getPlan($planSku);
        if ($plan === null
            || ($plan['status'] ?? 'PUBLISHED') !== 'PUBLISHED'
            || !($plan['isAvailable'] ?? true)
            || !($plan['isVisibilityPublic'] ?? true)
            || !in_array($cycle, $plan['allowedBillingCycles'] ?? ['MONTHLY', 'ANNUALLY'], true)
        ) {
            throw new \InvalidArgumentException('Cette formule ou cette périodicité n’est pas disponible.');
        }

        $priceKey = $cycle === 'ANNUALLY' ? 'priceAnnually' : 'priceMonthly';
        $amount = (int) ($plan[$priceKey] ?? 0);
        $currency = strtoupper((string) ($plan['currency'] ?? 'XOF'));
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Cette formule ne peut pas être payée en ligne.');
        }

        $reference = 'pvl_' . strtolower(bin2hex(random_bytes(12)));
        $gateway = $this->gateways->get($this->defaultProvider);
        $payment = new SubscriptionPayment(
            organization: $organization,
            user: $user,
            provider: $gateway->getCode(),
            reference: $reference,
            planSku: $planSku,
            billingCycle: $cycle,
            amount: $amount,
            currency: $currency,
        );
        $this->entityManager->persist($payment);
        $this->entityManager->flush();

        try {
            $callback = $callbackUrl . (str_contains($callbackUrl, '?') ? '&' : '?')
                . http_build_query(['paymentId' => $payment->getId()->toBase32()]);
            $phone = $this->customerPhone($user);
            $created = $gateway->createCheckout([
                'payment' => $payment,
                'callbackUrl' => $callback,
                'customer' => [
                    'firstname' => $user->getFirstName(),
                    'lastname' => $user->getLastName(),
                    'email' => $user->getEmail(),
                    ...($phone !== null ? ['phone_number' => $phone] : []),
                ],
            ]);
            $payment
                ->setProviderTransactionId((string) $created['transactionId'])
                ->setCheckoutUrl((string) $created['checkoutUrl']);
            $this->entityManager->flush();
        } catch (\Throwable $exception) {
            $payment->markFailed();
            $this->entityManager->flush();
            throw $exception;
        }

        return $payment->toArray();
    }

    public function getForUser(string $paymentId, User $user): ?SubscriptionPayment
    {
        try {
            $payment = $this->payments->find(\Symfony\Component\Uid\Ulid::fromBase32($paymentId));
        } catch (\InvalidArgumentException) {
            return null;
        }

        if (!$payment instanceof SubscriptionPayment || !$this->ownsOrganization($payment->getOrganization(), $user)) {
            return null;
        }

        return $payment;
    }

    /** Process a provider event only after retrieving the transaction from the provider API. */
    public function processProviderEvent(string $provider, array $event): string
    {
        $gateway = $this->gateways->get($provider);
        $entity = $event['entity'] ?? $event['data'] ?? [];
        if (is_string($entity)) {
            $entity = json_decode($entity, true) ?: [];
        }
        if (isset($entity['data']) && is_array($entity['data'])) {
            $entity = $entity['data'];
        }

        $transactionId = trim((string) ($entity['id'] ?? $event['transaction_id'] ?? ''));
        if ($transactionId === '') {
            return 'ignored';
        }

        $payment = $this->payments->findByProviderTransaction($gateway->getCode(), $transactionId);
        if (!$payment instanceof SubscriptionPayment) {
            return 'ignored';
        }
        if ($payment->getStatus() === 'PAID') {
            return 'already_processed';
        }

        $transaction = $gateway->retrieveTransaction($transactionId);
        if (!$this->matchesPayment($transaction, $payment)) {
            return 'mismatch';
        }

        $status = strtolower((string) ($transaction['status'] ?? ''));
        if ($status === 'approved') {
            return $this->applyPayment($payment) ? 'paid' : 'already_processed';
        }
        if (in_array($status, ['declined', 'canceled', 'cancelled', 'refunded'], true)) {
            $payment->markFailed();
            $this->entityManager->flush();
            return 'failed';
        }

        return 'pending';
    }

    /** @param array<string, mixed> $transaction */
    private function matchesPayment(array $transaction, SubscriptionPayment $payment): bool
    {
        $currency = $transaction['currency'] ?? [];
        if (is_array($currency)) {
            $currency = $currency['iso'] ?? $currency['code'] ?? '';
        }
        $metadata = $transaction['custom_metadata'] ?? $transaction['metadata'] ?? [];
        if (is_string($metadata)) {
            $metadata = json_decode($metadata, true) ?: [];
        }

        return (int) ($transaction['amount'] ?? -1) === $payment->getAmount()
            && strtoupper((string) $currency) === $payment->getCurrency()
            && is_array($metadata)
            && hash_equals($payment->getId()->toBase32(), (string) ($metadata['poulvia_payment_id'] ?? ''))
            && hash_equals($payment->getReference(), (string) ($metadata['poulvia_reference'] ?? ''));
    }

    private function applyPayment(SubscriptionPayment $payment): bool
    {
        return $this->entityManager->wrapInTransaction(function () use ($payment): bool {
            $lockedPayment = $this->payments->find($payment->getId(), LockMode::PESSIMISTIC_WRITE);
            if (!$lockedPayment instanceof SubscriptionPayment || $lockedPayment->getStatus() === 'PAID') {
                return false;
            }
            $organization = $lockedPayment->getOrganization();
            $this->entityManager->lock($organization, LockMode::PESSIMISTIC_WRITE);
            $now = new \DateTimeImmutable();
            $baseDate = $organization->getSubscriptionRenewalDate();
            if ($baseDate === null || $baseDate < $now || $organization->getStatus() === OrganizationStatus::TRIAL) {
                $baseDate = $now;
            }
            $renewal = $baseDate->modify($lockedPayment->getBillingCycle() === 'ANNUALLY' ? '+1 year' : '+1 month');

            $organization
                ->setSubscriptionPlan($lockedPayment->getPlanSku())
                ->setSubscriptionBillingCycle($lockedPayment->getBillingCycle())
                ->setSubscriptionTrialEndsAt(null)
                ->setSubscriptionRenewalDate($renewal)
                ->setStatus(OrganizationStatus::ACTIVE);
            $lockedPayment->markPaid($now);
            $this->entityManager->flush();

            $this->auditService->log(
                action: 'SUBSCRIPTION_PAYMENT_CONFIRMED',
                label: 'Paiement d’abonnement confirmé',
                targetType: 'ORGANIZATION',
                targetId: $organization->getId()?->toBase32() ?? '',
                targetName: $organization->getName(),
                details: sprintf(
                    'Paiement %s de %d %s confirmé via %s. Formule %s (%s), échéance %s.',
                    $lockedPayment->getReference(),
                    $lockedPayment->getAmount(),
                    $lockedPayment->getCurrency(),
                    $lockedPayment->getProvider(),
                    $lockedPayment->getPlanSku(),
                    $lockedPayment->getBillingCycle(),
                    $renewal->format(\DateTimeInterface::ATOM),
                ),
            );
            return true;
        });
    }

    private function ownsOrganization(Organization $organization, User $user): bool
    {
        foreach ($organization->getFarms() as $farm) {
            foreach ($farm->getFarmMemberships() as $membership) {
                if ($membership->isActive()
                    && $membership->getUser() === $user
                    && $membership->getRole() === \App\Enum\FarmRole::OWNER
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    private function customerPhone(User $user): ?array
    {
        $phone = trim((string) $user->getPhone());
        if ($phone === '') {
            return null;
        }

        return ['number' => $phone, 'country' => 'BJ'];
    }
}
