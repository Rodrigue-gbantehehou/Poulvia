<?php

declare(strict_types=1);

namespace App\Service\Payment;

use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;

#[AutoconfigureTag('app.payment_gateway')]
interface PaymentGatewayInterface
{
    public function getCode(): string;

    /** @param array<string, mixed> $checkout */
    public function createCheckout(array $checkout): array;

    /** @return array<string, mixed> */
    public function retrieveTransaction(string $transactionId): array;

    /** Verify and decode a raw provider webhook payload before processing it. @return array<string, mixed> */
    public function parseAndVerifyWebhook(string $rawPayload, array $headers): array;
}
