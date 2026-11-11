<?php

declare(strict_types=1);

namespace App\Service\Payment;

use App\Entity\SubscriptionPayment;
use Psr\Log\LoggerInterface;

final class FedaPayGateway implements PaymentGatewayInterface
{
    public function __construct(
        private readonly string $secretKey,
        private readonly string $apiBaseUrl,
        private readonly string $webhookSecret,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function getCode(): string
    {
        return 'fedapay';
    }

    /** @param array<string, mixed> $checkout */
    public function createCheckout(array $checkout): array
    {
        if ($this->secretKey === '') {
            throw new \RuntimeException('La clé secrète FedaPay n’est pas configurée.');
        }

        $customer = $checkout['customer'] ?? [];
        $payment = $checkout['payment'] ?? null;
        if (!$payment instanceof SubscriptionPayment) {
            throw new \InvalidArgumentException('Tentative de paiement Poulvia manquante.');
        }

        $created = $this->request('POST', '/transactions', [
            'description' => sprintf('Abonnement Poulvia %s (%s)', $payment->getPlanSku(), $payment->getBillingCycle()),
            'amount' => $payment->getAmount(),
            'currency' => ['iso' => $payment->getCurrency()],
            'callback_url' => $checkout['callbackUrl'] ?? null,
            'customer' => [
                'firstname' => $customer['firstname'] ?? 'Client',
                'lastname' => $customer['lastname'] ?? 'Poulvia',
                'email' => $customer['email'] ?? null,
                ...(!empty($customer['phone_number']) ? ['phone_number' => $customer['phone_number']] : []),
            ],
            'custom_metadata' => [
                'poulvia_payment_id' => $payment->getId()->toBase32(),
                'poulvia_reference' => $payment->getReference(),
                'organization_id' => $payment->getOrganization()->getId()?->toBase32(),
            ],
        ]);

        $transaction = $created['v1/transaction'] ?? $created['transaction'] ?? $created;
        $transactionId = (string) ($transaction['id'] ?? '');
        if ($transactionId === '') {
            throw new \RuntimeException('FedaPay n’a pas retourné d’identifiant de transaction.');
        }

        $tokenResponse = $this->request('POST', '/transactions/' . rawurlencode($transactionId) . '/token', []);
        $tokenData = $tokenResponse['v1/transaction/token'] ?? $tokenResponse;
        $checkoutUrl = (string) ($tokenData['url'] ?? '');
        if (!str_starts_with($checkoutUrl, 'https://')) {
            throw new \RuntimeException('FedaPay n’a pas retourné une URL de paiement sécurisée.');
        }

        return ['transactionId' => $transactionId, 'checkoutUrl' => $checkoutUrl];
    }

    public function retrieveTransaction(string $transactionId): array
    {
        if ($this->secretKey === '') {
            throw new \RuntimeException('La clé secrète FedaPay n’est pas configurée.');
        }

        $response = $this->request('GET', '/transactions/' . rawurlencode($transactionId));
        return $response['v1/transaction'] ?? $response['transaction'] ?? $response;
    }

    public function parseAndVerifyWebhook(string $rawPayload, array $headers): array
    {
        if ($this->webhookSecret === '') {
            throw new \RuntimeException('La clé de signature du webhook FedaPay n’est pas configurée.');
        }
        $signature = $headers['x-fedapay-signature'][0] ?? null;
        if (!is_string($signature) || trim($signature) === '') {
            throw new \UnexpectedValueException('Signature FedaPay absente.');
        }

        $timestamp = null;
        $signatures = [];
        foreach (explode(',', $signature) as $part) {
            [$key, $value] = array_pad(explode('=', trim($part), 2), 2, '');
            if ($key === 't' && ctype_digit($value)) {
                $timestamp = (int) $value;
            } elseif ($key === 's' && $value !== '') {
                $signatures[] = $value;
            }
        }
        if ($timestamp === null || abs(time() - $timestamp) > 300 || $signatures === []) {
            throw new \UnexpectedValueException('Signature FedaPay invalide ou expirée.');
        }

        $expected = hash_hmac('sha256', $timestamp . '.' . $rawPayload, $this->webhookSecret);
        $valid = false;
        foreach ($signatures as $candidate) {
            if (hash_equals($expected, $candidate)) {
                $valid = true;
                break;
            }
        }
        if (!$valid) {
            throw new \UnexpectedValueException('Signature FedaPay invalide.');
        }

        $event = json_decode($rawPayload, true);
        if (!is_array($event)) {
            throw new \UnexpectedValueException('Événement FedaPay invalide.');
        }
        return $event;
    }

    /** @param array<string, mixed>|null $payload @return array<string, mixed> */
    private function request(string $method, string $path, ?array $payload = null): array
    {
        $url = rtrim($this->apiBaseUrl, '/') . $path;
        $headers = [
            'Authorization: Bearer ' . $this->secretKey,
            'Accept: application/json',
            'Content-Type: application/json',
        ];
        $context = stream_context_create(['http' => [
            'method' => $method,
            'header' => implode("\r\n", $headers),
            'content' => $payload === null ? '' : json_encode($payload, JSON_THROW_ON_ERROR),
            'ignore_errors' => true,
            'timeout' => 20,
        ]]);

        $body = @file_get_contents($url, false, $context);
        $statusLine = $http_response_header[0] ?? '';
        preg_match('/\s(\d{3})\s/', $statusLine, $matches);
        $statusCode = (int) ($matches[1] ?? 0);
        if ($body === false || $statusCode < 200 || $statusCode >= 300) {
            $this->logger->error('Échec de l’appel à FedaPay.', [
                'path' => $path,
                'statusCode' => $statusCode,
                'response' => is_string($body) ? mb_substr($body, 0, 1000) : null,
            ]);
            throw new \RuntimeException('Le service de paiement est momentanément indisponible.');
        }

        $decoded = json_decode($body, true);
        if (!is_array($decoded)) {
            throw new \RuntimeException('Réponse FedaPay invalide.');
        }

        return $decoded;
    }
}
