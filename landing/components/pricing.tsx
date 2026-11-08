"use client";

import React, { useEffect, useState } from "react";
import { Check, ArrowRight, Shield } from "lucide-react";

interface PublicPlan {
  id?: string;
  sku: string;
  name: string;
  tier?: string;
  badge?: string | null;
  description?: string | null;
  priceMonthly: number;
  priceAnnually?: number;
  currency?: string;
  features?: string[];
  isRecommended?: boolean;
  isPopular?: boolean;
}

const DEFAULT_PLANS: PublicPlan[] = [
  {
    sku: "FREE",
    name: "Formule Gratuite",
    tier: "Pour démarrer",
    description: "Idéal pour découvrir l'application et sécuriser le suivi de vos premières volailles.",
    priceMonthly: 0,
    features: [
      "1 exploitation avicole",
      "Jusqu'à 2 bandes (pondeuses ou chair)",
      "Comptage des ramassages en plateaux de 30",
      "Suivi de l'aliment et des mortalités",
      "Caisse simple en FCFA",
    ],
    isRecommended: false,
  },
  {
    sku: "PRO",
    name: "Formule Complète",
    tier: "Pour les fermes professionnelles",
    description: "Pour les éleveurs qui souhaitent un suivi rigoureux de leur santé et de leurs finances.",
    priceMonthly: 9500,
    badge: "Recommandé",
    features: [
      "Autant de bandes et de bâtiments que vous voulez",
      "Rappels de vaccins et soins automatiques",
      "Validation du vaccin du jour en 1 clic dans l'eau",
      "Alertes avant que vos sacs d'aliments ne manquent",
      "Accès direct pour votre vétérinaire",
      "Caisse séparée : MTN MoMo, Moov Money et Espèces",
    ],
    isRecommended: true,
  },
];

export function Pricing() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.poulvia.com";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.poulvia.com";

  const [plans, setPlans] = useState<PublicPlan[]>(DEFAULT_PLANS);

  useEffect(() => {
    let isMounted = true;

    async function loadLandingPlans() {
      try {
        const response = await fetch(`${apiUrl}/api/public/plans`, {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) return;

        const result = await response.json();
        if (
          isMounted &&
          result?.status === "success" &&
          Array.isArray(result?.data) &&
          result.data.length > 0
        ) {
          setPlans(result.data);
        }
      } catch {
        // En cas d'indisponibilité temporaire, les plans de secours restent affichés
      }
    }

    loadLandingPlans();

    return () => {
      isMounted = false;
    };
  }, [apiUrl]);

  return (
    <section id="pricing" className="py-16 md:py-24 bg-background border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            <span>Tarifs simples et transparents</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Des tarifs clairs, sans surprise
          </h2>

          <p className="text-sm sm:text-base text-muted leading-relaxed">
            Tarifs en Francs CFA. Pas besoin de carte bancaire : vous pouvez régler simplement par
            MTN Mobile Money ou Moov Money.
          </p>
        </div>

        {/* Dynamic Cards Grid */}
        <div
          className={`grid grid-cols-1 ${
            plans.length === 1
              ? "max-w-md mx-auto"
              : plans.length === 2
              ? "md:grid-cols-2 max-w-4xl mx-auto"
              : "md:grid-cols-3"
          } gap-8 items-stretch`}
        >
          {plans.map((plan) => {
            const isHighlight = !!plan.isRecommended || !!plan.isPopular;
            const badgeLabel =
              plan.badge || (plan.isRecommended ? "Recommandé" : plan.isPopular ? "Populaire" : null);

            const formattedPrice =
              plan.priceMonthly === 0
                ? "0 FCFA"
                : `${plan.priceMonthly.toLocaleString("fr-FR")} FCFA`;

            const subPriceLabel =
              plan.priceMonthly === 0
                ? "Gratuit pour toujours"
                : "par mois • Sans engagement";

            return (
              <div
                key={plan.sku}
                className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative transition-all ${
                  isHighlight
                    ? "border-2 border-primary bg-surface shadow-sm"
                    : "border border-border bg-surface shadow-xs"
                }`}
              >
                {badgeLabel && (
                  <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-primary text-white text-[11px] font-semibold shadow-xs">
                    {badgeLabel}
                  </div>
                )}

                <div>
                  <span
                    className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md mb-3 ${
                      isHighlight
                        ? "text-primary bg-primary-soft"
                        : "text-muted bg-surface-muted"
                    }`}
                  >
                    {plan.tier || (plan.priceMonthly === 0 ? "Pour démarrer" : "Pour les fermes")}
                  </span>

                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>

                  {plan.description && (
                    <p className="text-xs sm:text-sm text-muted mt-2 leading-relaxed">
                      {plan.description}
                    </p>
                  )}

                  <div className="my-5">
                    <span
                      className={`text-3xl font-bold ${
                        isHighlight ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {formattedPrice}
                    </span>
                    <span className="text-xs text-muted block mt-1">{subPriceLabel}</span>
                  </div>

                  {Array.isArray(plan.features) && plan.features.length > 0 && (
                    <ul className="space-y-3 text-xs text-foreground border-t border-border pt-5">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary shrink-0 stroke-[2.5] mt-0.5" />
                          <span className="leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-6">
                  <a
                    href={`${appUrl}/register?plan=${encodeURIComponent(plan.sku.toLowerCase())}`}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-xs font-semibold transition-colors ${
                      isHighlight
                        ? "bg-primary hover:bg-primary-hover text-white shadow-xs"
                        : "border border-border bg-surface-muted hover:bg-surface-hover text-foreground"
                    }`}
                  >
                    <span>
                      {plan.priceMonthly === 0
                        ? "Créer mon compte gratuit"
                        : `Démarrer avec ${plan.name}`}
                    </span>
                    {isHighlight && <ArrowRight className="h-4 w-4" />}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reassurance note */}
        <div className="mt-8 text-center text-xs text-muted flex items-center justify-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span>Règlement mensuel par MTN MoMo ou Moov Money. Vous pouvez arrêter à tout moment.</span>
        </div>
      </div>
    </section>
  );
}
