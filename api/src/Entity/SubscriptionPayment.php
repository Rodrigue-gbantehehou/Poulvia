<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\SubscriptionPaymentRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UlidType;
use Symfony\Component\Uid\Ulid;

#[ORM\Entity(repositoryClass: SubscriptionPaymentRepository::class)]
#[ORM\Table(name: 'subscription_payments')]
#[ORM\UniqueConstraint(name: 'uniq_subscription_payment_reference', columns: ['reference'])]
#[ORM\UniqueConstraint(name: 'uniq_subscription_payment_provider_transaction', columns: ['provider', 'provider_transaction_id'])]
#[ORM\Index(columns: ['organization_id', 'created_at'], name: 'idx_subscription_payment_org_created')]
#[ORM\Index(columns: ['status'], name: 'idx_subscription_payment_status')]
class SubscriptionPayment
{
    #[ORM\Id]
    #[ORM\Column(type: UlidType::NAME, unique: true)]
    private Ulid $id;

    #[ORM\ManyToOne(targetEntity: Organization::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Organization $organization;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $user;

    #[ORM\Column(type: Types::STRING, length: 40)]
    private string $provider;

    #[ORM\Column(type: Types::STRING, length: 80)]
    private string $reference;

    #[ORM\Column(name: 'provider_transaction_id', type: Types::STRING, length: 80, nullable: true)]
    private ?string $providerTransactionId = null;

    #[ORM\Column(type: Types::STRING, length: 50)]
    private string $planSku;

    #[ORM\Column(type: Types::STRING, length: 20)]
    private string $billingCycle;

    #[ORM\Column(type: Types::INTEGER)]
    private int $amount;

    #[ORM\Column(type: Types::STRING, length: 3)]
    private string $currency;

    #[ORM\Column(type: Types::STRING, length: 20)]
    private string $status = 'PENDING';

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $checkoutUrl = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $paidAt = null;

    public function __construct(
        Organization $organization,
        User $user,
        string $provider,
        string $reference,
        string $planSku,
        string $billingCycle,
        int $amount,
        string $currency = 'XOF',
    ) {
        $this->id = new Ulid();
        $this->organization = $organization;
        $this->user = $user;
        $this->provider = strtolower(trim($provider));
        $this->reference = trim($reference);
        $this->planSku = strtoupper(trim($planSku));
        $this->billingCycle = strtoupper(trim($billingCycle));
        $this->amount = $amount;
        $this->currency = strtoupper(trim($currency));
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): Ulid { return $this->id; }
    public function getOrganization(): Organization { return $this->organization; }
    public function getUser(): User { return $this->user; }
    public function getProvider(): string { return $this->provider; }
    public function getReference(): string { return $this->reference; }
    public function getProviderTransactionId(): ?string { return $this->providerTransactionId; }
    public function getPlanSku(): string { return $this->planSku; }
    public function getBillingCycle(): string { return $this->billingCycle; }
    public function getAmount(): int { return $this->amount; }
    public function getCurrency(): string { return $this->currency; }
    public function getStatus(): string { return $this->status; }
    public function getCheckoutUrl(): ?string { return $this->checkoutUrl; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getPaidAt(): ?\DateTimeImmutable { return $this->paidAt; }

    public function setProviderTransactionId(string $id): self
    {
        $this->providerTransactionId = trim($id);
        return $this;
    }

    public function setCheckoutUrl(string $url): self
    {
        $this->checkoutUrl = trim($url);
        return $this;
    }

    public function markPaid(\DateTimeImmutable $paidAt): self
    {
        $this->status = 'PAID';
        $this->paidAt = $paidAt;
        return $this;
    }

    public function markFailed(): self
    {
        if ($this->status === 'PENDING') {
            $this->status = 'FAILED';
        }
        return $this;
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'id' => $this->id->toBase32(),
            'reference' => $this->reference,
            'provider' => $this->provider,
            'plan' => $this->planSku,
            'billingCycle' => $this->billingCycle,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'status' => $this->status,
            'checkoutUrl' => $this->checkoutUrl,
            'createdAt' => $this->createdAt->format(\DateTimeInterface::ATOM),
            'paidAt' => $this->paidAt?->format(\DateTimeInterface::ATOM),
        ];
    }
}
