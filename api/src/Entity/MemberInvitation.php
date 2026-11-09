<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\MemberInvitationRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UlidType;
use Symfony\Component\Uid\Ulid;

#[ORM\Entity(repositoryClass: MemberInvitationRepository::class)]
#[ORM\Table(name: 'member_invitations')]
#[ORM\Index(columns: ['membership_id'], name: 'idx_member_invitation_membership')]
class MemberInvitation
{
    #[ORM\Id]
    #[ORM\Column(type: UlidType::NAME, unique: true)]
    private Ulid $id;

    #[ORM\ManyToOne(targetEntity: FarmMembership::class)]
    #[ORM\JoinColumn(name: 'membership_id', nullable: false, onDelete: 'CASCADE')]
    private FarmMembership $membership;

    #[ORM\Column(type: Types::STRING, length: 64, unique: true)]
    private string $tokenHash;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $expiresAt;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $acceptedAt = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    public function __construct(FarmMembership $membership, string $tokenHash, \DateTimeImmutable $expiresAt)
    {
        $this->id = new Ulid();
        $this->membership = $membership;
        $this->tokenHash = $tokenHash;
        $this->expiresAt = $expiresAt;
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getMembership(): FarmMembership
    {
        return $this->membership;
    }

    public function getExpiresAt(): \DateTimeImmutable
    {
        return $this->expiresAt;
    }

    public function isValidAt(\DateTimeImmutable $now): bool
    {
        return $this->acceptedAt === null && $this->expiresAt >= $now;
    }

    public function markAccepted(\DateTimeImmutable $acceptedAt): self
    {
        $this->acceptedAt = $acceptedAt;

        return $this;
    }
}
