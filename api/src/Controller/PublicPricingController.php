<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\Admin\CommercialPlanService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Endpoint public (sans authentification) pour afficher le catalogue
 * des offres choisies et publiées depuis l'espace Admin sur la Landing Page.
 */
#[Route('/api/public', name: 'api_public_')]
class PublicPricingController extends AbstractController
{
    public function __construct(
        private readonly CommercialPlanService $planService,
    ) {
    }

    /**
     * Retourne uniquement les offres :
     * 1. Publiées (status === 'PUBLISHED')
     * 2. Disponibles (isAvailable === true)
     * 3. Publiques (isVisibilityPublic === true)
     * 4. Sélectionnées pour la landing (flags.showOnLanding !== false)
     *
     * GET /api/public/plans
     */
    #[Route('/plans', name: 'plans', methods: ['GET'])]
    public function plans(): JsonResponse
    {
        $allPlans = array_values($this->planService->getPlans());

        $landingPlans = array_values(array_filter($allPlans, static function (array $plan): bool {
            $isPublished = ($plan['status'] ?? 'PUBLISHED') === 'PUBLISHED';
            $isAvailable = ($plan['isAvailable'] ?? true) === true;
            $isPublic = ($plan['isVisibilityPublic'] ?? true) === true;

            $flags = $plan['flags'] ?? [];
            $showOnLanding = $flags['showOnLanding'] ?? $flags['show_on_landing'] ?? null;

            // Si explicitement désactivé pour la landing par l'admin
            if ($showOnLanding === false) {
                return false;
            }

            return $isPublished && $isAvailable && $isPublic;
        }));

        // Trier par prix mensuel croissant (ex: Gratuit en premier, puis payants)
        usort($landingPlans, static function (array $a, array $b): int {
            $priceA = (int) ($a['priceMonthly'] ?? 0);
            $priceB = (int) ($b['priceMonthly'] ?? 0);
            return $priceA <=> $priceB;
        });

        return $this->json([
            'status' => 'success',
            'data'   => $landingPlans,
            'count'  => count($landingPlans),
        ]);
    }
}
