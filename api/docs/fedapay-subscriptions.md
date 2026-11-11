# Abonnements FedaPay

## Configuration

Configure ces variables côté API, sans les exposer au web ou à l’application mobile :

```dotenv
FEDAPAY_SECRET_KEY=<clé API sandbox ou live>
FEDAPAY_API_BASE_URL=https://sandbox-api.fedapay.com/v1
FEDAPAY_WEBHOOK_SECRET=<secret de signature du webhook correspondant>
SUBSCRIPTION_PAYMENT_PROVIDER=fedapay
FRONTEND_URL=<url-de-la-web-app>
```

Pour la production, utilise `https://api.fedapay.com/v1` et les clés live. La clé du webhook se copie dans les détails de ce webhook sur le tableau de bord FedaPay; elle est différente en sandbox et en live.

Dans le tableau de bord FedaPay, configure l’URL HTTPS suivante et active les événements `transaction.approved`, `transaction.declined` et `transaction.canceled` :

```text
https://api.poulvia.com/api/payments/webhooks/fedapay
```

Applique ensuite la migration Doctrine :

```sh
php bin/console doctrine:migrations:migrate
```

## Confirmation des paiements

L’API crée un paiement interne en attente, puis la transaction et le lien de règlement FedaPay. Au webhook, l’API vérifie la signature FedaPay sur le corps brut avec une tolérance de cinq minutes, relit la transaction auprès de FedaPay et compare son montant, sa devise et ses métadonnées Poulvia. Seule une transaction `approved` valide active l’abonnement. Le retour navigateur et les applications ne peuvent que lire l’état enregistré par le serveur.

La durée d’essai se règle dans le détail de l’organisation dans l’interface d’administration. Une valeur de zéro met immédiatement fin à l’essai.
