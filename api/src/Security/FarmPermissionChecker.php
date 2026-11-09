<?php

declare(strict_types=1);

namespace App\Security;

use App\Entity\Farm;
use App\Entity\FarmMembership;
use App\Entity\Organization;
use App\Service\Admin\CommercialPlanService;
use App\Service\SubscriptionTrialService;

/**
 * Applies both the farm role and the subscribed module when checking access.
 */
final class FarmPermissionChecker
{
    public function __construct(
        private readonly CommercialPlanService $commercialPlanService,
        private readonly SubscriptionTrialService $subscriptionTrialService,
    ) {
    }

    public function allows(FarmMembership $membership, string $permission, bool $isWrite = true): bool
    {
        $organization = $membership->getFarm()->getOrganization();
        $trialAllowsAction = !$this->subscriptionTrialService->isExpired($organization)
            || (!$isWrite && in_array($permission, self::READ_PERMISSIONS, true));

        return $trialAllowsAction
            && $membership->hasPermission($permission)
            && $this->commercialPlanService->isPermissionAllowedForFarm($membership->getFarm(), $permission);
    }

    public function isTrialExpired(Organization $organization): bool
    {
        return $this->subscriptionTrialService->isExpired($organization);
    }

    public function moduleAllows(Farm $farm, string $permission): bool
    {
        return $this->commercialPlanService->isPermissionAllowedForFarm($farm, $permission);
    }

    public function moduleKeyAllows(Farm $farm, string $moduleKey): bool
    {
        return $this->commercialPlanService->isModuleAllowedForFarm($farm, $moduleKey);
    }

    private const READ_PERMISSIONS = [
        Permission::FARM_VIEW,
        Permission::FLOCK_VIEW,
        Permission::INVENTORY_VIEW,
        Permission::INVENTORY_VALUATION,
        Permission::EGG_VIEW,
        Permission::FINANCE_VIEW,
        Permission::FINANCE_MARGIN,
        Permission::CONTACT_VIEW,
        Permission::DASHBOARD_VIEW,
        Permission::DASHBOARD_FINANCIALS,
        Permission::HEALTH_VIEW,
        Permission::MEMBER_MANAGE,
        Permission::ROLE_MANAGE,
    ];
}
