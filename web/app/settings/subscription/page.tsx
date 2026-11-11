"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  MessageSquare,
  ArrowUpRight,
  Star,
  X,
  Check,
  Shield,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/context/auth-context";
import { api, PublicPlan } from "@/lib/api-client";
import { cn } from "@/lib/utils";

/* ─── Constantes ─── */

// Les fonctions avancées ne sont pas présentées dans le catalogue standard au client.
const ADVANCED_PLAN_MODULES = new Set([
  "health_alerts",
  "prophylaxis_program",
  "inventory_valuation",
  "feed_rationing",
  "finance_margin",
  "credit_debt",
  "reports_accounting",
  "performance_benchmark",
  "dashboard_advanced",
  "api_iot",
]);

const STANDARD_OFFER_FEATURES = [
  "Bandes, effectifs, mortalités et bâtiments",
  "Production adaptée au type d’exploitation",
  "Suivi sanitaire et traitements",
  "Stocks, dépenses, recettes et ventes",
  "Contacts, membres et rôles personnalisés",
];

function getStandardModules(modules: string[]) {
  return modules.filter((module) => !ADVANCED_PLAN_MODULES.has(module));
}

const PLAN_ACCENT: Record<string, { tier: string; ring: string; cta: string }> = {
  FREE: {
    tier: "text-muted",
    ring: "border-border",
    cta: "bg-surface-hover hover:bg-surface-muted text-foreground border border-border",
  },
  STANDARD: {
    tier: "text-info",
    ring: "border-info/30",
    cta: "bg-primary hover:bg-primary-hover text-white",
  },
  PRO: {
    tier: "text-primary",
    ring: "border-primary/30",
    cta: "bg-primary hover:bg-primary-hover text-white",
  },
};

function getAccent(sku: string) {
  return PLAN_ACCENT[sku] ?? PLAN_ACCENT.FREE;
}

/* ─── Sous-composant PlanCard ─── */

interface PlanCardProps {
  plan: PublicPlan;
  currentSku: string;
  billingCycle: "MONTHLY" | "ANNUALLY";
  onSelect: (plan: PublicPlan) => void;
}

function PlanCard({ plan, currentSku, billingCycle, onSelect }: PlanCardProps) {
  const accent = getAccent(plan.sku);
  const isCurrent = plan.sku === currentSku;

  const useAnnualPrice =
    billingCycle === "ANNUALLY" &&
    plan.allowedBillingCycles.includes("ANNUALLY") &&
    plan.priceAnnually > 0;
  const price = useAnnualPrice ? plan.priceAnnually : plan.priceMonthly;
  const priceLabel = useAnnualPrice ? "/ an" : "/ mois";

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-surface p-5 transition-all duration-150",
        isCurrent ? "border-primary ring-1 ring-primary/20 shadow-xs" : accent.ring,
        plan.isRecommended && !isCurrent && "shadow-xs"
      )}
    >
      {/* Badge flottant */}
      {isCurrent && (
        <div className="absolute -top-3 left-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
            <Check className="h-2.5 w-2.5" />
            Offre active
          </span>
        </div>
      )}
      {plan.isRecommended && !isCurrent && (
        <div className="absolute -top-3 left-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold text-primary shadow-xs">
            <Star className="h-2.5 w-2.5" />
            Recommandé
          </span>
        </div>
      )}

      {/* En-tête */}
      <div className="mb-4 space-y-1">
        <div className="flex items-center justify-between">
          <span className={cn("text-[10px] font-bold uppercase tracking-wider", accent.tier)}>
            {isCurrent ? "Offre actuelle" : "Offre Poulvia"}
          </span>
          {plan.badge && (
            <Badge variant="neutral" className="text-[10px] font-bold">
              {plan.badge}
            </Badge>
          )}
        </div>
        <h3 className="text-sm font-bold text-foreground">
          {plan.sku === "STANDARD" ? "Poulvia" : plan.name}
        </h3>
        {plan.description && (
          <p className="text-xs text-muted leading-relaxed line-clamp-2">{plan.description}</p>
        )}
      </div>

      {/* Prix */}
      <div className="mb-4 pb-4 border-b border-border">
        {plan.priceMonthly === 0 ? (
          <span className="text-2xl font-extrabold text-foreground">Gratuit</span>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-foreground">
              {new Intl.NumberFormat("fr-FR").format(price)}
            </span>
            <span className="text-xs text-muted">FCFA {priceLabel}</span>
          </div>
        )}
        {plan.trialDays > 0 && !isCurrent && (
          <p className="text-[11px] text-success mt-1 font-medium flex items-center gap-1">
            <Check className="h-3 w-3" />
            {plan.trialDays} jours d&apos;essai gratuit
          </p>
        )}
      </div>

      {/* Modules inclus */}
      <div className="flex-1 space-y-1.5 mb-4">
        {STANDARD_OFFER_FEATURES.map((feature) => (
          <div key={feature} className="flex items-center gap-2 text-xs">
            <Check className="h-3.5 w-3.5 shrink-0 text-success" />
            <span className="text-muted truncate">{feature}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => onSelect(plan)}
        className={cn(
          "flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer",
          accent.cta
        )}
      >
        {isCurrent ? "Choisir cette périodicité" : "Choisir l’offre Poulvia"}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ─── Page principale ─── */

export default function SubscriptionPage() {
  const { activeFarm, activePlan, isSubscriptionOwner, isLoading: authLoading, refreshMe } = useAuth();

  const [publicPlans, setPublicPlans] = useState<PublicPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const showLoading = isLoading && isSubscriptionOwner;
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUALLY">(() =>
    activeFarm?.subscription?.billingCycle === "ANNUALLY" ? "ANNUALLY" : "MONTHLY"
  );

  const [upgradeTarget, setUpgradeTarget] = useState<PublicPlan | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      const result = await api.subscriptions.getPlans();
      setError(null);
      setPublicPlans(result.publicPlans);
      if (activeFarm?.id) {
        try {
          const farmSubscription = await api.subscriptions.getFarmPlan(activeFarm.id);
          if (farmSubscription.billingCycle === "MONTHLY" || farmSubscription.billingCycle === "ANNUALLY") {
            setBillingCycle(farmSubscription.billingCycle);
          }
        } catch {
          // Le catalogue reste utilisable si les détails du cycle courant ne sont pas disponibles.
        }
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Impossible de charger les offres.");
    } finally {
      setIsLoading(false);
    }
  }, [activeFarm]);

  useEffect(() => {
    if (isSubscriptionOwner) window.setTimeout(() => void fetchPlans(), 0);
  }, [isSubscriptionOwner, fetchPlans]);

  useEffect(() => {
    const paymentId = new URLSearchParams(window.location.search).get("paymentId");
    if (!paymentId) return;
    let stopped = false;
    let attempts = 0;
    const checkPayment = async () => {
      try {
        const payment = await api.subscriptions.getPayment(paymentId);
        if (stopped) return;
        if (payment.status === "PAID") {
          setPaymentNotice("Paiement confirmé. Votre abonnement est maintenant actif.");
          setSuccessMsg(null);
          stopped = true;
          window.history.replaceState({}, "", window.location.pathname);
          void fetchPlans();
          void refreshMe();
        } else if (payment.status === "FAILED") {
          setPaymentNotice("Le paiement n’a pas été confirmé. Vous pouvez réessayer.");
          stopped = true;
          window.history.replaceState({}, "", window.location.pathname);
        } else if (++attempts >= 30) {
          setPaymentNotice("Le paiement est en attente de confirmation. Cette page se mettra à jour dès réception du webhook.");
          stopped = true;
        }
      } catch {
        if (++attempts >= 30) stopped = true;
      }
    };
    void checkPayment();
    const timer = window.setInterval(() => { if (!stopped) void checkPayment(); }, 3000);
    return () => { stopped = true; window.clearInterval(timer); };
  }, [fetchPlans, refreshMe]);

  async function handleRequestUpgrade(e: React.FormEvent) {
    e.preventDefault();
    if (!activeFarm || !upgradeTarget) return;
    setIsSending(true);
    setUpgradeError(null);
    try {
      const payment = await api.subscriptions.createCheckout({
        farmId: activeFarm.id,
        plan: upgradeTarget.sku,
        billingCycle,
      });
      if (!payment.checkoutUrl) throw new Error("Le lien de paiement n’a pas été créé.");
      window.location.assign(payment.checkoutUrl);
    } catch (err: unknown) {
      setUpgradeError((err as Error).message || "Erreur lors de l'envoi de la demande.");
    } finally {
      setIsSending(false);
    }
  }

  const currentSku = activePlan?.plan?.toUpperCase() ?? "";
  const currentStatus = activePlan?.status?.toUpperCase() ?? "ACTIVE";
  const trialEndsAt = activeFarm?.subscription?.trialEndsAt;
  const trialExpired =
    (currentStatus === "TRIAL" || currentStatus === "SUSPENDED") &&
    !!trialEndsAt &&
    // eslint-disable-next-line react-hooks/purity
    new Date(trialEndsAt).getTime() <= Date.now();
  const singlePaidOffer = publicPlans.filter((plan) => plan.sku === "STANDARD");
  const standardPlan = singlePaidOffer[0];
  const annualAllowed = !!standardPlan &&
    standardPlan.allowedBillingCycles.includes("ANNUALLY") &&
    standardPlan.priceAnnually > 0;
  const annualDiscount = standardPlan && standardPlan.priceMonthly > 0 && standardPlan.priceAnnually > 0
    ? Math.round((1 - standardPlan.priceAnnually / (standardPlan.priceMonthly * 12)) * 100)
    : 0;
  const currentPlanName = currentSku === "STANDARD"
    ? "Poulvia"
    : activePlan?.planName || "Offre Poulvia";
  const displayedModulesCount = getStandardModules(activePlan?.modules ?? []).length;
  const statusLabel = trialExpired
    ? "Essai terminé"
    : currentStatus === "TRIAL"
      ? "Essai en cours"
      : currentStatus === "SUSPENDED"
        ? "Suspendu"
        : "Actif";

  function openUpgrade(plan: PublicPlan) {
    setUpgradeTarget(plan);
    setUpgradeError(null);
    setSuccessMsg(null);
  }

  if (!authLoading && !isSubscriptionOwner) {
    return (
      <Shell>
        <div className="max-w-md mx-auto mt-12 sm:mt-16 rounded-3xl border border-border bg-surface p-8 text-center space-y-4 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft text-danger">
            <Shield className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Accès réservé</h2>
          <p className="text-xs text-muted leading-relaxed">
            Seul le propriétaire de l&apos;exploitation avicole est autorisé à consulter et gérer l&apos;abonnement de la ferme.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition-all"
            >
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-8 pb-16">

        <PageHeader
          title="Mon abonnement"
          subtitle={`Offre ${currentPlanName}`}
          icon={<CreditCard className="h-4 w-4" />}
          backHref="/settings/farm"
        />

        {trialExpired && (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-foreground">
            <p className="font-semibold">Votre période d’essai est terminée.</p>
            <p className="mt-1 text-xs text-muted">
              Vos données restent consultables. Choisissez une périodicité pour demander l’activation de l’offre Poulvia.
            </p>
          </div>
        )}

        {paymentNotice && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground" role="status">
            {paymentNotice}
          </div>
        )}

        {currentSku !== "" && currentSku !== "STANDARD" && (
          <div className="rounded-xl border border-border bg-surface-muted p-4 text-xs text-muted">
            {currentSku === "FREE"
              ? "Votre formule actuelle est une offre historique gratuite. Elle n’est plus proposée aux nouvelles souscriptions."
              : `Votre formule actuelle (${activePlan?.planName ?? currentSku}) est une offre historique. Elle reste consultable ici, mais n’est plus proposée aux nouvelles souscriptions.`}
          </div>
        )}

        {/* Alerte succès */}
        {successMsg && (
          <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-success">Information</p>
              <p className="text-xs text-muted mt-0.5">{successMsg}</p>
            </div>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-muted hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* KPI — récapitulatif de l'offre active */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            title="Formule"
            value={currentPlanName}
            accent="primary"
            icon={<CreditCard className="h-5 w-5" />}
            className="col-span-2 sm:col-span-1"
          />
          <StatCard
            title="Modules inclus"
            value={displayedModulesCount}
            accent="amber"
            icon={<Sparkles className="h-5 w-5" />}
          />
          <StatCard
            title="Statut"
            value={statusLabel}
            accent={trialExpired || currentStatus === "SUSPENDED" ? "amber" : "primary"}
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
        </div>

        {/* Toggle facturation + Titre du catalogue */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Offre unique Poulvia</h2>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-border bg-surface-muted p-1 self-start sm:self-auto">
            <button
              onClick={() => setBillingCycle("MONTHLY")}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                billingCycle === "MONTHLY"
                  ? "bg-surface text-foreground shadow-xs border border-border"
                  : "text-muted hover:text-foreground"
              )}
            >
              Mensuel
            </button>
            <button
              disabled={!annualAllowed}
              onClick={() => setBillingCycle("ANNUALLY")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                billingCycle === "ANNUALLY"
                  ? "bg-surface text-foreground shadow-xs border border-border"
                  : annualAllowed ? "text-muted hover:text-foreground" : "text-muted/50 cursor-not-allowed"
              )}
            >
              Annuel
              {annualDiscount > 0 && (
                <span className="rounded bg-success/15 px-1 py-0.5 text-[10px] font-bold text-success">
                  −{annualDiscount}%
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Grille du catalogue */}
        {showLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4">
            <AlertTriangle className="h-5 w-5 text-danger shrink-0" />
            <p className="text-sm text-danger flex-1">{error}</p>
            <button
              onClick={fetchPlans}
              className="text-xs text-danger underline hover:text-danger/80 cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        ) : singlePaidOffer.length > 0 ? (
          <div className="mx-auto grid w-full max-w-xl grid-cols-1 gap-6">
            {singlePaidOffer.map((plan) => (
              <PlanCard
                key={plan.sku}
                plan={plan}
                currentSku={currentSku}
                billingCycle={billingCycle}
                onSelect={openUpgrade}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-border bg-surface">
            <CreditCard className="h-10 w-10 text-muted mb-3" />
            <p className="text-sm font-semibold text-foreground">Aucune offre disponible</p>
            <p className="text-xs text-muted mt-1">
              Aucune offre publiée pour le moment. Réessayez ultérieurement.
            </p>
            <button
              onClick={fetchPlans}
              className="mt-4 rounded-xl border border-border bg-surface-hover px-4 py-2 text-xs font-semibold text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Actualiser
            </button>
          </div>
        )}

        {/* Note informative sur la démarche */}
        <div className="rounded-xl border border-border bg-surface-hover p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Comment fonctionne le changement d&apos;offre ?
              </p>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Le paiement est traité par FedaPay. Poulvia active l’abonnement uniquement après confirmation serveur du paiement.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ── Modale de demande de changement d'offre ── */}
      {upgradeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl">
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <p className="text-xs text-primary font-medium uppercase tracking-wider mb-0.5">
                  Paiement sécurisé
                </p>
                <h3 className="text-base font-bold text-foreground">
                  Choisir l&apos;offre{" "}
                  <span className="text-primary">Poulvia</span>
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Pour l&apos;exploitation : <strong>{activeFarm?.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setUpgradeTarget(null)}
                className="rounded-xl p-1.5 text-muted hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRequestUpgrade} className="p-5 space-y-4">
              {upgradeError && (
                <div className="rounded-xl border border-danger/30 bg-danger/5 p-3 text-xs text-danger">
                  {upgradeError}
                </div>
              )}

              {/* Récapitulatif offre cible */}
              <div className="rounded-xl border border-border bg-surface-muted p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Formule demandée</span>
                  <span className="font-bold text-foreground">Poulvia</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Tarif ({billingCycle === "ANNUALLY" ? "Annuel" : "Mensuel"})</span>
                  <span className="font-bold text-foreground">
                    {upgradeTarget.priceMonthly === 0
                      ? "Gratuit"
                      : `${new Intl.NumberFormat("fr-FR").format(
                          billingCycle === "ANNUALLY"
                            ? upgradeTarget.priceAnnually
                            : upgradeTarget.priceMonthly
                        )} FCFA`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Modules inclus</span>
                  <span className="font-semibold text-primary">
                    Socle standard et gestion des rôles personnalisés
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setUpgradeTarget(null)}
                  className="flex-1 rounded-xl border border-border bg-surface-hover py-2.5 text-xs font-semibold text-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-60 transition-all cursor-pointer"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                  Continuer vers FedaPay
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
