<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\SubscriptionPayment;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<SubscriptionPayment> */
class SubscriptionPaymentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, SubscriptionPayment::class);
    }

    public function findByProviderTransaction(string $provider, string $transactionId): ?SubscriptionPayment
    {
        return $this->findOneBy([
            'provider' => strtolower($provider),
            'providerTransactionId' => $transactionId,
        ]);
    }
}
