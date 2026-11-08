"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bird,
  Warehouse,
  Egg,
  HeartPulse,
  Package,
  Wallet,
  ContactRound,
  ShieldCheck,
  Users,
  X,
  Settings,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission, hasModule, activePlan, isOwner } = useAuth();
  const { state, isMobile } = useSidebar();
  const isCollapsed = !isMobile && state === "collapsed";

  const navigation = [
    {
      name: "Tableau de bord",
      href: "/",
      icon: LayoutDashboard,
      module: undefined,
      show: true,
    },
    {
      name: "Poulaillers & Bâtiments",
      href: "/buildings",
      icon: Warehouse,
      module: "buildings",
      show: hasPermission("building:manage") || hasPermission("farm:view"),
    },
    {
      name: "Bandes de volailles",
      href: "/flocks",
      icon: Bird,
      module: "flocks",
      show: hasPermission("flock:read") || hasPermission("flock:view"),
    },
    {
      name: "Pontes d'œufs",
      href: "/eggs",
      icon: Egg,
      module: "eggs",
      show: hasPermission("egg:read") || hasPermission("egg:view"),
    },
    {
      name: "Santé & Soins",
      href: "/health",
      icon: HeartPulse,
      module: "health",
      show: hasPermission("health:view") || hasPermission("health:manage"),
    },
    {
      name: "Stocks & Intrants",
      href: "/inventory",
      icon: Package,
      module: "inventory",
      show: hasPermission("inventory:read") || hasPermission("inventory:view"),
    },
    {
      name: "Trésorerie & Ventes",
      href: "/finances",
      icon: Wallet,
      module: "finance",
      show: hasPermission("finance:read") || hasPermission("finance:view"),
    },
    {
      name: "Contacts & Tiers",
      href: "/contacts",
      icon: ContactRound,
      module: "contacts",
      show: hasPermission("contact:read") || hasPermission("contact:view"),
    },
    {
      name: "Équipe & Accès",
      href: "/settings/members",
      icon: Users,
      module: "team",
      show: hasPermission("member:manage") || hasPermission("member:read"),
    },
    {
      name: "Rôles & Permissions",
      href: "/settings/roles",
      icon: ShieldCheck,
      module: "custom_roles",
      show: hasPermission("role:manage") || hasPermission("role:read"),
    },
    {
      name: "Mon abonnement",
      href: "/settings/subscription",
      icon: CreditCard,
      module: undefined,
      show: isOwner,
    },
    {
      name: "Paramètres de la ferme",
      href: "/settings/farm",
      icon: Settings,
      module: undefined,
      show: true,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-border bg-surface text-foreground shadow-xl transition-[width,transform] duration-200 ease-out lg:static lg:shadow-none lg:translate-x-0 lg:overflow-x-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-[72px]" : "lg:w-64",
        )}
      >
        {/* Header / Brand */}
        <div className={cn(
          "flex h-16 items-center border-b border-border",
          isCollapsed ? "justify-center px-2" : "justify-between px-6",
        )}>
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 text-lg font-semibold tracking-tight text-foreground group"
            aria-label="Poulvia, accueil"
            title={isCollapsed ? "Poulvia — Accueil" : undefined}
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-control bg-primary-soft p-1 border border-border">
              <Image src="/logo.png" alt="Poulvia" width={36} height={36} className="h-full w-full object-contain" priority />
            </div>
            <div className={cn("flex flex-col leading-tight", isCollapsed && "sr-only")}>
              <span className="text-base font-extrabold text-white tracking-tight">
                Poulvia
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-control p-1.5 text-muted hover:bg-surface-hover hover:text-foreground lg:hidden cursor-pointer"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav
          className={cn(
            "flex-1 space-y-1 overflow-y-auto py-4 scrollbar-thin",
            isCollapsed ? "px-2" : "px-3.5",
          )}
          aria-label="Navigation principale"
        >
          <div className={cn(
            "pb-2 text-caption font-medium tracking-wide uppercase text-muted",
            isCollapsed ? "sr-only" : "px-3",
          )}>
            Exploitation
          </div>
          {navigation.map((item) => {
            const isModuleAllowed = item.module ? hasModule(item.module) : true;

            // Ne pas afficher les modules non concernés par l'offre ou non autorisés par le rôle
            if (!isModuleAllowed || !item.show) {
              return null;
            }

            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                aria-label={item.name}
                aria-current={isActive ? "page" : undefined}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  "group relative flex min-h-11 items-center rounded-control py-2.5 text-label font-medium transition-colors",
                  isCollapsed ? "justify-center px-0" : "gap-3 px-3.5",
                  isActive
                    ? "bg-primary-soft text-primary font-semibold"
                    : "text-muted hover:bg-surface-hover hover:text-foreground"
                )}
              >
                {/* Indicateur vertical d'onglet actif */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-primary" />
                )}

                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted group-hover:text-foreground"
                  )}
                />
                <span className={cn("truncate", isCollapsed && "sr-only")}>{item.name}</span>

                {isActive && !isCollapsed && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer avec formule active (réservé au propriétaire) */}
        {isOwner && (
          <div className={cn(
            "border-t border-border pb-[max(1rem,env(safe-area-inset-bottom))]",
            isCollapsed ? "p-2" : "p-4",
          )}>
            {isCollapsed ? (
              <Link
                href="/settings/subscription"
                onClick={onClose}
                aria-label={`Abonnement ${activePlan?.planName || "Formule Starter"}`}
                title={`Abonnement : ${activePlan?.planName || "Formule Starter"}`}
                className="flex h-11 w-11 items-center justify-center rounded-control bg-surface-muted text-primary hover:bg-surface-hover transition-colors"
              >
                <CreditCard className="h-5 w-5" aria-hidden="true" />
              </Link>
            ) : (
              <Link
                href="/settings/subscription"
                onClick={onClose}
                className="block rounded-control bg-surface-muted border border-border p-3.5 hover:bg-surface-hover transition-colors group"
              >
                <div className="text-caption font-medium uppercase tracking-wide text-muted group-hover:text-primary transition-colors">
                  Formule de la ferme
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-label font-semibold text-foreground truncate">
                    {activePlan?.planName || "Formule Starter"}
                  </span>
                  <span className="rounded-control bg-primary-soft text-primary px-2 py-1 text-caption font-medium">
                    {activePlan?.badge || activePlan?.plan || "Gratuit"}
                  </span>
                </div>
                <div className="mt-1.5 text-caption text-muted group-hover:text-primary transition-colors flex items-center gap-1 font-medium">
                  <CreditCard className="h-3.5 w-3.5 text-primary" />
                  Gérer mon abonnement →
                </div>
              </Link>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
