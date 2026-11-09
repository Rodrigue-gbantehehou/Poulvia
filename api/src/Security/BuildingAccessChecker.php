<?php

declare(strict_types=1);

namespace App\Security;

use App\Entity\Building;
use App\Entity\Farm;
use App\Entity\FarmMembership;
use App\Entity\User;
use App\Repository\FarmMembershipRepository;
use App\Service\Admin\CommercialPlanService;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

final class BuildingAccessChecker
{
    public function __construct(
        private readonly FarmMembershipRepository $membershipRepository,
        private readonly CommercialPlanService $commercialPlanService,
    ) {
    }

    public function assertModuleAllowed(Farm $farm): void
    {
        $this->commercialPlanService->assertModuleAllowed($farm, 'buildings');
    }

    public function assertBuildingAssigned(User $user, Farm $farm, Building $building): void
    {
        $this->assertBuildingIdAssigned($user, $farm, $building->getId()?->toBase32());
    }

    public function assertBuildingIdAssigned(User $user, Farm $farm, ?string $buildingId): void
    {
        if ($buildingId === null || in_array('ROLE_ADMIN', $user->getRoles(), true)) {
            return;
        }

        $membership = $this->membershipRepository->findOneBy([
            'farm' => $farm,
            'user' => $user,
            'isActive' => true,
        ]);

        if (!$membership instanceof FarmMembership) {
            throw new AccessDeniedHttpException('Vous ne disposez pas d’un accès actif à cette exploitation.');
        }

        if ($membership->hasBuildingRestrictions() && !$membership->isBuildingAssignedId($buildingId)) {
            throw new AccessDeniedHttpException('Vous n’avez pas accès au bâtiment demandé.');
        }
    }
}
