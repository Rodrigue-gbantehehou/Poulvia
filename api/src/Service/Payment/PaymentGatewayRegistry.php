<?php

declare(strict_types=1);

namespace App\Service\Payment;

use Symfony\Component\DependencyInjection\Attribute\AutowireIterator;

final class PaymentGatewayRegistry
{
    /** @var array<string, PaymentGatewayInterface> */
    private array $gateways = [];

    /** @param iterable<PaymentGatewayInterface> $gateways */
    public function __construct(#[AutowireIterator('app.payment_gateway')] iterable $gateways)
    {
        foreach ($gateways as $gateway) {
            $this->gateways[$gateway->getCode()] = $gateway;
        }
    }

    public function get(string $code): PaymentGatewayInterface
    {
        $gateway = $this->gateways[strtolower($code)] ?? null;
        if ($gateway === null) {
            throw new \InvalidArgumentException(sprintf('Passerelle de paiement inconnue : %s.', $code));
        }

        return $gateway;
    }
}
