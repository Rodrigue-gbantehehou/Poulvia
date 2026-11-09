<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261109181000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Adds single-use, expiring activation links for new farm member accounts.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE member_invitations (id BINARY(16) NOT NULL, membership_id BINARY(16) NOT NULL, token_hash VARCHAR(64) NOT NULL, expires_at DATETIME NOT NULL, accepted_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_MEMBER_INVITATION_TOKEN (token_hash), INDEX idx_member_invitation_membership (membership_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('ALTER TABLE member_invitations ADD CONSTRAINT FK_MEMBER_INVITATION_MEMBERSHIP FOREIGN KEY (membership_id) REFERENCES farm_memberships (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE member_invitations');
    }
}
