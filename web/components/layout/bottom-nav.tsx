"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Bird,
  Egg,
  Briefcase,
  Plus,
  Utensils,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  HeartPulse,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { hasModule, hasPermission, activeFarm, isOwner } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  function triggerAction(actionKey: string) {
    setSheetOpen(false);

    if (actionKey === "health") {
      router.push("/health");
      return;
    }

    if (pathname === "/") {
      window.dispatchEvent(
        new CustomEvent("open-dashboard-action", { detail: { action: actionKey } })
      );
    } else {
      router.push(`/?action=${actionKey}`);
    }
  }

  const isBroiler = activeFarm?.productionType === "BROILER";

  // ─── VÉRIFICATIONS STRICTES : ABONNEMENT DE LA FERME (MODULES) & DROITS UTILISATEUR ───
  const canCreateEgg = hasModule("eggs") && !isBroiler && (hasPermission("egg:create") || isOwner);
  const canFeed = (hasModule("inventory") || hasModule("feed_rationing")) && (hasPermission("inventory:movement") || hasPermission("flock:update") || isOwner);
  const canRecordMovement = hasPermission("flock:movement") || hasPermission("flock:create") || hasPermission("flock:update") || isOwner;
  const canCreateFinance = hasModule("finance") && (hasPermission("finance:create") || isOwner);
  const canManageHealth = hasModule("health") && (hasPermission("health:manage") || hasPermission("health:create") || isOwner);
  const isEggsPage = pathname.startsWith("/eggs");
  const isHealthPage = pathname.startsWith("/health");
  const isFlockDetailPage = /^\/flocks\/[^/]+$/.test(pathname);
  const showEggAction = canCreateEgg && !isEggsPage && !isFlockDetailPage;
  const showFeedAction = canFeed && !isFlockDetailPage;
  const showMovementAction = canRecordMovement && !isFlockDetailPage;
  const showHealthAction = canManageHealth && !isHealthPage;

  const canViewFlocks =
    hasModule("flocks") &&
    (hasPermission("flock:read") || hasPermission("flock:view") || isOwner);
  const canViewBuildings =
    hasModule("buildings") &&
    (hasPermission("building:manage") || hasPermission("farm:view") || isOwner);
  const canViewProduction =
    !isBroiler &&
    hasModule("eggs") &&
    (hasPermission("egg:read") || hasPermission("egg:view") || isOwner);
  const canViewHealth =
    hasModule("health") &&
    (hasPermission("health:view") || hasPermission("health:manage") || isOwner);
  const canViewManagement =
    (hasModule("finance") && (hasPermission("finance:read") || hasPermission("finance:view") || isOwner)) ||
    (hasModule("inventory") && (hasPermission("inventory:read") || hasPermission("inventory:view") || isOwner)) ||
    (hasModule("contacts") && (hasPermission("contact:read") || hasPermission("contact:view") || isOwner)) ||
    (hasModule("team") && (hasPermission("member:manage") || isOwner)) ||
    (hasModule("custom_roles") && (hasPermission("role:manage") || isOwner));

  const isHomeActive = pathname === "/";
  const isFlocksActive = pathname.startsWith("/flocks") || pathname.startsWith("/buildings");
  const isEggsActive = pathname.startsWith("/eggs");
  const isHealthActive = pathname.startsWith("/health");
  const isManagementActive =
    pathname.startsWith("/management") ||
    pathname.startsWith("/finances") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/contacts") ||
    pathname.startsWith("/settings/members") ||
    pathname.startsWith("/settings/roles");

  // Nombre d'actions permises dans la feuille
  const hasAnyAction = showEggAction || showFeedAction || showMovementAction || canCreateFinance || showHealthAction;

  return (
    <>
      {/* Navigation compacte à cinq espaces, filtrée selon l'exploitation et le profil. */}
      <div
        className="fixed bottom-2.5 left-1/2 z-40 flex w-[calc(100%-1rem)] max-w-[30rem] -translate-x-1/2 items-center gap-2 lg:hidden"
        style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <nav
          aria-label="Navigation mobile"
          className="flex h-14 min-w-0 flex-1 items-center rounded-full border border-[#e2e1dc] bg-[#eeede9] p-1 text-[#242820] shadow-card"
        >
          <MobileNavItem href="/" label="Accueil" icon={LayoutDashboard} active={isHomeActive} />
          {(canViewFlocks || canViewBuildings) && (
            <MobileNavItem href={canViewFlocks ? "/flocks" : "/buildings"} label="Élevage" icon={Bird} active={isFlocksActive} />
          )}
          {canViewProduction && (
            <MobileNavItem href="/eggs" label="Production" icon={Egg} active={isEggsActive} />
          )}
          {canViewHealth && (
            <MobileNavItem href="/health" label="Santé" icon={HeartPulse} active={isHealthActive} />
          )}
          {canViewManagement && (
            <MobileNavItem href="/management" label="Gestion" icon={Briefcase} active={isManagementActive} />
          )}
        </nav>

        {/* Action quotidienne séparée de la navigation, comme sur la référence. */}
        {hasAnyAction && (
          <button
            type="button"
            onClick={() => setSheetOpen(!sheetOpen)}
            aria-label={sheetOpen ? "Fermer les actions" : "Enregistrer une opération"}
            aria-expanded={sheetOpen}
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-card transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              sheetOpen && "rotate-45 bg-primary-hover",
            )}
          >
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* ─── ACTION SHEET MOBILE NATIVE TACTILE ─── */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setSheetOpen(false)}
          />

          <div
            className="relative z-10 w-full rounded-t-[32px] border-t border-border bg-surface p-5 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-250 max-h-[85vh] overflow-y-auto"
            style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom, 2rem))" }}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />

            <div className="flex items-center justify-between pb-3.5 border-b border-border">
              <div>
                <h3 className="text-base font-extrabold text-foreground tracking-tight flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Saisie rapide</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="rounded-full p-2 text-muted hover:bg-surface-muted hover:text-foreground transition-colors active:scale-90"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!hasAnyAction ? (
              <div className="py-8 text-center text-xs text-muted">
                Aucune action disponible selon votre profil
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {/* 1. Ponte (si autorisé et non-chair) */}
                {showEggAction && (
                  <button
                    type="button"
                    onClick={() => triggerAction("egg")}
                    className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-left transition-all active:scale-95 hover:bg-amber-500/10 cursor-pointer"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 border border-amber-500/20">
                      <Egg className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Ponte d&apos;œufs</div>
                      <div className="text-[10px] text-muted">Ramassage du lot</div>
                    </div>
                  </button>
                )}

                {/* 2. Alimentation */}
                {showFeedAction && (
                  <button
                    type="button"
                    onClick={() => triggerAction("feed")}
                    className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-left transition-all active:scale-95 hover:bg-emerald-500/10 cursor-pointer"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">
                      <Utensils className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Nourrir</div>
                      <div className="text-[10px] text-muted">Distribution aliment</div>
                    </div>
                  </button>
                )}

                {/* 3. Mortalité */}
                {showMovementAction && (
                  <button
                    type="button"
                    onClick={() => triggerAction("movement")}
                    className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3.5 text-left transition-all active:scale-95 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 border border-rose-500/20">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Mortalité</div>
                      <div className="text-[10px] text-muted">Perte ou sortie</div>
                    </div>
                  </button>
                )}

                {/* 4. Vente */}
                {canCreateFinance && (
                  <button
                    type="button"
                    onClick={() => triggerAction("income")}
                    className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3.5 text-left transition-all active:scale-95 hover:bg-primary/10 cursor-pointer"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary border border-primary/20">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Vente / Recette</div>
                      <div className="text-[10px] text-muted">Encaissement client</div>
                    </div>
                  </button>
                )}

                {/* 5. Dépense */}
                {canCreateFinance && (
                  <button
                    type="button"
                    onClick={() => triggerAction("expense")}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-surface-muted/60 p-3.5 text-left transition-all active:scale-95 hover:bg-surface-muted cursor-pointer"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-foreground border border-border">
                      <ArrowDownRight className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Dépense</div>
                      <div className="text-[10px] text-muted">Achat ou charge</div>
                    </div>
                  </button>
                )}

                {/* 6. Soin / Santé */}
                {showHealthAction && (
                  <button
                    type="button"
                    onClick={() => triggerAction("health")}
                    className="flex items-center gap-3 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-3.5 text-left transition-all active:scale-95 hover:bg-sky-500/10 cursor-pointer"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-600 border border-sky-500/20">
                      <HeartPulse className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Soin / Santé</div>
                      <div className="text-[10px] text-muted">Suivi vétérinaire</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function MobileNavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={label}
      className={cn(
        "group flex h-11 min-w-0 items-center justify-center gap-1 rounded-full px-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#73766f]",
        active ? "flex-[2]" : "flex-1",
        active ? "bg-white text-[#242820] shadow-sm" : "text-[#777970] hover:text-[#242820]",
      )}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span
        className={cn(
          "truncate text-[11px] leading-none",
          active ? "max-w-20 font-semibold text-[#242820]" : "sr-only",
        )}
      >
        {label}
      </span>
    </Link>
  );
}
