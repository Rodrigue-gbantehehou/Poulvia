"use client";

import React, { useEffect, useState } from "react";
import { Check, ArrowRight } from "lucide-react";

interface PublicPlan {
  sku: string;
  name: string;
  description?: string | null;
  priceMonthly: number;
  priceAnnually: number;
  currency?: string;
  features?: string[];
  trialDays?: number;
  allowedBillingCycles?: Array<"MONTHLY" | "ANNUALLY">;
}

type BillingCycle = "MONTHLY" | "ANNUALLY";

export function Pricing() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.poulvia.com";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.poulvia.com";
  const [plan, setPlan] = useState<PublicPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTHLY");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadLandingPlan() {
      try {
        const response = await fetch(`${apiUrl}/api/public/plans`, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Impossible de charger l’offre");

        const result: unknown = await response.json();
        if (typeof result !== "object" || result === null || !("data" in result)) {
          throw new Error("Réponse d’offre invalide");
        }
        const data = (result as { data?: unknown }).data;
        if (!Array.isArray(data)) throw new Error("Liste d’offres invalide");

        const standard = data.find(
          (item): item is PublicPlan =>
            typeof item === "object" &&
            item !== null &&
            "sku" in item &&
            String(item.sku).toUpperCase() === "STANDARD" &&
            "priceMonthly" in item,
        );

        if (isMounted) {
          setPlan(standard ?? null);
          if (
            standard?.allowedBillingCycles?.includes("ANNUALLY") &&
            standard.priceAnnually > 0
          ) {
            setBillingCycle("MONTHLY");
          }
        }
      } catch {
        if (isMounted) setPlan(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadLandingPlan();
    return () => {
      isMounted = false;
    };
  }, [apiUrl]);

  const annualAvailable = plan !== null &&
    plan.priceAnnually > 0 &&
    (plan.allowedBillingCycles?.includes("ANNUALLY") ?? true);
  const selectedCycle = billingCycle === "ANNUALLY" && annualAvailable
    ? "ANNUALLY"
    : "MONTHLY";
  const selectedPrice = selectedCycle === "ANNUALLY"
    ? plan?.priceAnnually
    : plan?.priceMonthly;
  const currencyLabel = plan?.currency === "XOF" || !plan?.currency
    ? "FCFA"
    : plan.currency;
  const formattedPrice = selectedPrice === undefined
    ? ""
    : new Intl.NumberFormat("fr-FR").format(selectedPrice);

  return (
    <section id="pricing" className="py-16 md:py-24 bg-background border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            <span>Une offre, deux périodicités</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            L’offre Poulvia, au rythme qui vous convient
          </h2>
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            L’abonnement mensuel et l’abonnement annuel donnent accès aux mêmes modules. Seule la périodicité change.
          </p>
        </div>

        {isLoading ? (
          <div className="mx-auto h-72 max-w-md animate-pulse rounded-2xl bg-surface" role="status" aria-label="Chargement de l’offre" />
        ) : !plan ? (
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-6 text-center shadow-xs" role="status">
            <h3 className="text-lg font-bold text-foreground">Tarifs momentanément indisponibles</h3>
            <p className="mt-2 text-sm text-muted">
              Contactez l’équipe Poulvia pour connaître les conditions de l’offre.
            </p>
            <a
              href="#contact"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Contacter l’équipe
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <div className="mx-auto max-w-md rounded-2xl border-2 border-primary bg-surface p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">Offre Poulvia</h3>
                {plan.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">{plan.description}</p>
                )}
              </div>

              {annualAvailable && (
                <div
                  className="inline-flex shrink-0 rounded-lg border border-border bg-surface-muted p-1"
                  role="group"
                  aria-label="Périodicité de l’abonnement"
                >
                  {(["MONTHLY", "ANNUALLY"] as const).map((cycle) => (
                    <button
                      key={cycle}
                      type="button"
                      aria-pressed={selectedCycle === cycle}
                      onClick={() => setBillingCycle(cycle)}
                      className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                        selectedCycle === cycle
                          ? "bg-primary text-white shadow-xs"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      {cycle === "MONTHLY" ? "Mensuel" : "Annuel"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="my-6 border-y border-border py-5">
              <p className="text-3xl font-bold text-primary">
                {formattedPrice} {currencyLabel}
                <span className="ml-1 text-sm font-medium text-muted">
                  / {selectedCycle === "ANNUALLY" ? "an" : "mois"}
                </span>
              </p>
              {plan.trialDays !== undefined && plan.trialDays > 0 && (
                <p className="mt-2 text-sm font-medium text-primary">
                  Essai gratuit de {plan.trialDays} jours
                </p>
              )}
            </div>

            {Array.isArray(plan.features) && plan.features.length > 0 && (
              <ul className="space-y-3 text-sm text-foreground">
                {plan.features.map((feature, index) => (
                  <li key={`${index}-${feature}`} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            <a
              href={`${appUrl}/register`}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-primary-hover"
            >
              Créer mon compte
              <ArrowRight className="h-4 w-4" />
            </a>
            <p className="mt-3 text-center text-xs text-muted">
              La périodicité choisie ne modifie pas les modules inclus.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
