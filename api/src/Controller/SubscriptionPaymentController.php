<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Farm;
use App\Entity\SubscriptionPayment;
use App\Entity\User;
use App\Enum\FarmRole;
use App\Repository\FarmRepository;
use App\Service\Payment\PaymentGatewayRegistry;
use App\Service\Payment\SubscriptionPaymentService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

final class SubscriptionPaymentController extends AbstractController
{
    public function __construct(
        private readonly FarmRepository $farmRepository,
        private readonly SubscriptionPaymentService $paymentService,
        private readonly PaymentGatewayRegistry $gateways,
        #[Autowire('%env(FRONTEND_URL)%')]
        private readonly string $frontendUrl,
    ) {
    }

    #[Route('/api/subscriptions/checkout', name: 'api_subscription_checkout', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function checkout(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['status' => 'error', 'message' => 'Authentification requise.'], Response::HTTP_UNAUTHORIZED);
        }

        $body = $request->toArray();
        $farmId = trim((string) ($body['farmId'] ?? ''));
        $planSku = strtoupper(trim((string) ($body['plan'] ?? '')));
        $cycle = strtoupper(trim((string) ($body['billingCycle'] ?? 'MONTHLY')));
        if ($farmId === '' || $planSku === '' || !in_array($cycle, ['MONTHLY', 'ANNUALLY'], true)) {
            return $this->json(['status' => 'error', 'message' => 'Ferme, formule ou périodicité invalide.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $farm = $this->farmRepository->find($farmId);
        if (!$farm instanceof Farm) {
            return $this->json(['status' => 'error', 'message' => 'Ferme introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if (!$this->isOwner($farm, $user)) {
            return $this->json(['status' => 'error', 'message' => 'Seul le propriétaire peut payer l’abonnement.'], Response::HTTP_FORBIDDEN);
        }
        $organization = $farm->getOrganization();
        if ($organization === null) {
            return $this->json(['status' => 'error', 'message' => 'Organisation introuvable.'], Response::HTTP_NOT_FOUND);
        }

        try {
            $payment = $this->paymentService->start(
                $organization,
                $user,
                $planSku,
                $cycle,
                rtrim($this->frontendUrl, '/') . '/settings/subscription',
            );
        } catch (\InvalidArgumentException $exception) {
            return $this->json(['status' => 'error', 'message' => $exception->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Throwable $exception) {
            return $this->json(['status' => 'error', 'message' => $exception->getMessage()], Response::HTTP_BAD_GATEWAY);
        }

        return $this->json(['status' => 'success', 'data' => $payment], Response::HTTP_CREATED);
    }

    #[Route('/api/subscriptions/payments/{id}', name: 'api_subscription_payment_status', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function paymentStatus(string $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['status' => 'error', 'message' => 'Authentification requise.'], Response::HTTP_UNAUTHORIZED);
        }
        $payment = $this->paymentService->getForUser($id, $user);
        if (!$payment instanceof SubscriptionPayment) {
            return $this->json(['status' => 'error', 'message' => 'Paiement introuvable.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json(['status' => 'success', 'data' => $payment->toArray()]);
    }

    /**
     * FedaPay appelle ce webhook. Les données reçues ne sont jamais utilisées
     * pour activer une formule : le service relit la transaction via l'API FedaPay.
     */
    #[Route('/api/payments/webhooks/{provider}', name: 'api_payment_webhook', methods: ['POST'])]
    public function webhook(string $provider, Request $request): JsonResponse
    {
        try {
            $gateway = $this->gateways->get($provider);
            $event = $gateway->parseAndVerifyWebhook($request->getContent(), $request->headers->all());
            $result = $this->paymentService->processProviderEvent($provider, $event);
        } catch (\UnexpectedValueException) {
            return $this->json(['status' => 'error', 'message' => 'Signature ou événement de paiement invalide.'], Response::HTTP_BAD_REQUEST);
        } catch (\InvalidArgumentException) {
            return $this->json(['status' => 'error', 'message' => 'Passerelle inconnue.'], Response::HTTP_NOT_FOUND);
        } catch (\Throwable $exception) {
            // 5xx indique au fournisseur de réessayer après une panne réseau/API.
            return $this->json(['status' => 'error', 'message' => 'Vérification du paiement impossible.'], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        return $this->json(['status' => 'success', 'result' => $result]);
    }

    private function isOwner(Farm $farm, User $user): bool
    {
        foreach ($farm->getFarmMemberships() as $membership) {
            if ($membership->getUser() === $user && $membership->isActive() && $membership->getRole() === FarmRole::OWNER) {
                return true;
            }
        }
        return false;
    }
}
