import { apiRequest } from "./client";

export interface PublicPlan {
  id: string;
  sku: string;
  name: string;
  tier: string;
  badge?: string | null;
  description?: string | null;
  priceMonthly: number;
  priceAnnually: number;
  currency: string;
  status: string;
  isAvailable: boolean;
  isVisibilityPublic: boolean;
  trialDays: number;
  allowedBillingCycles: string[];
  modules: string[];
  quotas: {
    maxFarms: number;
    maxFlocks: number;
    maxMembers: number;
    maxBuildings: number;
    retentionMonths: number;
  };
  features: string[];
  flags: {
    accountingExports: boolean;
    healthAlerts: boolean;
    iotSensors: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
  };
  isPopular: boolean;
  isRecommended: boolean;
  subscribersCount: number;
}

export interface UpgradeRequestPayload {
  farmId: string;
  targetPlan: string;
  message?: string;
}

export interface UpgradeRequestResult {
  farmId: string;
  farmName: string;
  currentPlan: string;
  requestedPlan: string;
  requestedPlanName: string;
  userEmail: string | null;
  message: string;
}

export interface PlansResponse {
  /** Offres publiques : visibles dans le catalogue tarifaire. */
  publicPlans: PublicPlan[];
  /** Offres privées / sur devis : affichées avec un CTA "Contacter" (isVisibilityPublic = false). */
  privatePlans: PublicPlan[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPublicPlan(value: unknown): value is PublicPlan {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.sku === "string" &&
    typeof value.name === "string" &&
    typeof value.tier === "string" &&
    typeof value.priceMonthly === "number" &&
    typeof value.priceAnnually === "number" &&
    typeof value.currency === "string" &&
    Array.isArray(value.modules) &&
    Array.isArray(value.quotas) === false &&
    isRecord(value.quotas) &&
    Array.isArray(value.features) &&
    isRecord(value.flags)
  );
}

export const subscriptionsApi = {
  /**
   * Catalogue complet des offres : publiques (catalogue) + privées (sur devis).
   */
  async getPlans(): Promise<PlansResponse> {
    const raw: unknown = await apiRequest<unknown>("/subscriptions/plans");

    // Cas 1 : payload objet { publicPlans: [...] }
    if (isRecord(raw)) {
      if (Array.isArray(raw.publicPlans)) {
        return {
          publicPlans: raw.publicPlans.filter(isPublicPlan).filter(
            (p) => p.isVisibilityPublic !== false
          ),
          privatePlans: [],
        };
      }
      // Cas 2 : payload non déballé { data: [...] }
      if (Array.isArray(raw.data)) {
        const publicPlans = raw.data.filter(isPublicPlan).filter(
          (p) => p.isVisibilityPublic !== false
        );
        return { publicPlans, privatePlans: [] };
      }
    }

    // Cas 3 : tableau direct de plans (si apiRequest a déballé body.data qui était un tableau)
    if (Array.isArray(raw)) {
      const publicPlans = raw.filter(isPublicPlan).filter(
        (p) => p.isVisibilityPublic !== false
      );
      return { publicPlans, privatePlans: [] };
    }

    return { publicPlans: [], privatePlans: [] };
  },

  /**
   * @deprecated Utiliser getPlans() — retourne uniquement les plans publics pour rétrocompatibilité.
   */
  async getPublicPlans(): Promise<PublicPlan[]> {
    const { publicPlans } = await subscriptionsApi.getPlans();
    return publicPlans;
  },

  /**
   * Soumet une demande de changement d'offre par le propriétaire de la ferme.
   */
  async requestUpgrade(
    payload: UpgradeRequestPayload
  ): Promise<{ message: string; data: UpgradeRequestResult }> {
    return await apiRequest<{ message: string; data: UpgradeRequestResult }>(
      "/subscriptions/request-upgrade",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },
};
