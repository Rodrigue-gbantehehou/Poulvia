<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261111120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Adds provider-independent subscription payment attempts.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE subscription_payments (id BINARY(16) NOT NULL, organization_id BINARY(16) NOT NULL, user_id BINARY(16) NOT NULL, provider VARCHAR(40) NOT NULL, reference VARCHAR(80) NOT NULL, provider_transaction_id VARCHAR(80) DEFAULT NULL, plan_sku VARCHAR(50) NOT NULL, billing_cycle VARCHAR(20) NOT NULL, amount INT NOT NULL, currency VARCHAR(3) NOT NULL, status VARCHAR(20) NOT NULL, checkout_url LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, paid_at DATETIME DEFAULT NULL, UNIQUE INDEX uniq_subscription_payment_reference (reference), UNIQUE INDEX uniq_subscription_payment_provider_transaction (provider, provider_transaction_id), INDEX idx_subscription_payment_org_created (organization_id, created_at), INDEX idx_subscription_payment_status (status), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('ALTER TABLE subscription_payments ADD CONSTRAINT FK_SUBSCRIPTION_PAYMENT_ORG FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE subscription_payments ADD CONSTRAINT FK_SUBSCRIPTION_PAYMENT_USER FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE subscription_payments');
    }
}
