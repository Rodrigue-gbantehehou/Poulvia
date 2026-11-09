<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Organization;
use App\Enum\OrganizationStatus;
use App\Service\Admin\CommercialPlanService;

/**
 * Owns the trial lifecycle shared by registration and farm access checks.
 */
final class SubscriptionTrialService
{
    public function __construct(
        private readonly CommercialPlanService $commercialPlanService,
    ) {
    }

    public function startFor(Organization $organization): void
    {
        $plan = $this->commercialPlanService->getPlan('STANDARD');
        $trialDays = max(0, (int) ($plan['trialDays'] ?? 0));

        $organization
            ->setSubscriptionPlan('STANDARD')
            ->setSubscriptionBillingCycle('MONTHLY')
            ->setSubscriptionTrialEndsAt(new \DateTimeImmutable(sprintf('+%d days', $trialDays)))
            ->setStatus(OrganizationStatus::TRIAL);
    }

    public function isExpired(Organization $organization): bool
    {
        $trialEndsAt = $organization->getSubscriptionTrialEndsAt();

        return $organization->getStatus() === OrganizationStatus::TRIAL
            && $trialEndsAt !== null
            && $trialEndsAt <= new \DateTimeImmutable();
    }
}
