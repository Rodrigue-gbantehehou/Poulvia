<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\MemberInvitation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<MemberInvitation> */
class MemberInvitationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MemberInvitation::class);
    }

    public function findByPlainToken(string $token): ?MemberInvitation
    {
        return $this->findOneBy(['tokenHash' => hash('sha256', $token)]);
    }

    /** @return list<MemberInvitation> */
    public function findAllForMembership(\App\Entity\FarmMembership $membership): array
    {
        return $this->findBy(['membership' => $membership]);
    }
}
