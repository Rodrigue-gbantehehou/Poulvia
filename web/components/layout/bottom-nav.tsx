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
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  onOpenMenu: () => void;
}

export function BottomNav({ onOpenMenu }: BottomNavProps) {
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

  const isHomeActive = pathname === "/";
  const isFlocksActive = pathname.startsWith("/flocks") || pathname.startsWith("/buildings");
  const isEggsActive = pathname.startsWith("/eggs");
  const isManagementActive =
    pathname.startsWith("/management") ||
    pathname.startsWith("/finances") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/contacts") ||
    pathname.startsWith("/settings/members") ||
    pathname.startsWith("/settings/roles");

  // Nombre d'actions permises dans la feuille
  const hasAnyAction = canCreateEgg || canFeed || canRecordMovement || canCreateFinance || canManageHealth;

  return (
    <>
      {/* ─── BARRE DE FOND INFÉRIEURE ANTI-DÉFILEMENT ─── */}
      <div
        aria-hidden="true"
        className="fixed bottom-0 left-0 right-0 z-38 lg:hidden pointer-events-none select-none"
      >
        <div className="h-6 w-full bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div
          className="w-full bg-surface border-t border-border/70"
          style={{ height: "calc(4.75rem + env(safe-area-inset-bottom, 0px))" }}
        />
      </div>

      {/* ─── BARRE INFÉRIEURE STABLE À 5 ÉLÉMENTS (Accueil, Élevage, (+), Production, Gestion) ─── */}
      <nav
        aria-label="Navigation mobile"
        className="fixed bottom-2.5 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-[450px] z-40 lg:hidden pointer-events-none"
        style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="pointer-events-auto flex h-16 items-center justify-between px-2.5 rounded-card bg-surface border border-border text-foreground shadow-card">
          {/* 1. Accueil */}
          <Link
            href="/"
            className={cn(
              "group relative flex flex-1 flex-col items-center justify-center py-1.5 transition-colors",
              isHomeActive ? "text-primary" : "text-muted hover:text-foreground"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-control transition-colors",
                isHomeActive
                  ? "bg-primary-soft text-primary"
                  : "bg-transparent text-muted group-hover:bg-surface-hover group-hover:text-foreground"
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <span
              className={cn(
                "text-caption leading-none mt-1",
                isHomeActive ? "font-semibold text-primary" : "font-medium text-muted"
              )}
            >
              Accueil
            </span>
            {isHomeActive && (
              <span className="h-1 w-1 rounded-full bg-primary mt-0.5" />
            )}
          </Link>

          {/* 2. Élevage */}
          <Link
            href="/flocks"
            className={cn(
              "group relative flex flex-1 flex-col items-center justify-center py-1.5 transition-colors",
              isFlocksActive ? "text-primary" : "text-muted hover:text-foreground"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-control transition-colors",
                isFlocksActive
                  ? "bg-primary-soft text-primary"
                  : "bg-transparent text-muted group-hover:bg-surface-hover group-hover:text-foreground"
              )}
            >
              <Bird className="h-5 w-5" />
            </div>
            <span
              className={cn(
                "text-caption leading-none mt-1",
                isFlocksActive ? "font-semibold text-primary" : "font-medium text-muted"
              )}
            >
              Élevage
            </span>
            {isFlocksActive && (
              <span className="h-1 w-1 rounded-full bg-primary mt-0.5" />
            )}
          </Link>

          {/* 3. Bouton Central Joyau (+) avec micro-rotation */}
          <div className="relative flex flex-1 items-center justify-center">
            <button
              type="button"
              onClick={() => setSheetOpen(!sheetOpen)}
              aria-label="Enregistrer une opération"
              className="relative -mt-6 flex flex-col items-center justify-center group active:scale-90 transition-transform cursor-pointer focus:outline-none"
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full text-white border-2 border-surface ring-1 ring-border transition-colors shadow-card",
                  sheetOpen
                    ? "rotate-45 bg-danger"
                    : "bg-accent group-hover:scale-105 group-hover:bg-accent-hover"
                )}
              >
                <Plus className="h-6 w-6 stroke-[2.5]" />
              </div>
              <span className="text-caption font-semibold text-foreground mt-1">
                Action
              </span>
            </button>
          </div>

          {/* 4. Production */}
          <Link
            href="/eggs"
            className={cn(
              "group relative flex flex-1 flex-col items-center justify-center py-1.5 transition-colors",
              isEggsActive ? "text-primary" : "text-muted hover:text-foreground"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-control transition-colors",
                isEggsActive
                  ? "bg-primary-soft text-primary"
                  : "bg-transparent text-muted group-hover:bg-surface-hover group-hover:text-foreground"
              )}
            >
              <Egg className="h-5 w-5" />
            </div>
            <span
              className={cn(
                "text-caption leading-none mt-1",
                isEggsActive ? "font-semibold text-primary" : "font-medium text-muted"
              )}
            >
              Production
            </span>
            {isEggsActive && (
              <span className="h-1 w-1 rounded-full bg-primary mt-0.5" />
            )}
          </Link>

          {/* 5. Gestion */}
          <Link
            href="/management"
            className={cn(
              "group relative flex flex-1 flex-col items-center justify-center py-1.5 transition-colors",
              isManagementActive ? "text-primary" : "text-muted hover:text-foreground"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-control transition-colors",
                isManagementActive
                  ? "bg-primary-soft text-primary"
                  : "bg-transparent text-muted group-hover:bg-surface-hover group-hover:text-foreground"
              )}
            >
              <Briefcase className="h-5 w-5" />
            </div>
            <span
              className={cn(
                "text-caption leading-none mt-1",
                isManagementActive ? "font-semibold text-primary" : "font-medium text-muted"
              )}
            >
              Gestion
            </span>
            {isManagementActive && (
              <span className="h-1 w-1 rounded-full bg-primary mt-0.5" />
            )}
          </Link>
        </div>
      </nav>

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
                {canCreateEgg && (
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
                {canFeed && (
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
                {canRecordMovement && (
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
                {canManageHealth && (
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
