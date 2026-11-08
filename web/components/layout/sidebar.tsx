"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bird,
  Egg,
  HeartPulse,
  Briefcase,
  X,
  Settings,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import {
  Sidebar as SidebarContainer,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

export function Sidebar() {
  const pathname = usePathname();
  const { hasPermission, hasModule, activePlan, activeFarm, isOwner } = useAuth();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  const closeMobile = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isBroiler = activeFarm?.productionType === "BROILER";

  // ─── 5 ESPACES PRINCIPAUX STANDARDISÉS ───
  const mainNavigation = [
    {
      name: "Accueil",
      href: "/",
      icon: LayoutDashboard,
      isActive: pathname === "/",
      show: true,
    },
    {
      name: "Élevage",
      href: "/flocks",
      icon: Bird,
      isActive: pathname.startsWith("/flocks") || pathname.startsWith("/buildings"),
      show:
        hasPermission("flock:read") ||
        hasPermission("flock:view") ||
        hasPermission("building:manage") ||
        isOwner,
    },
    {
      name: "Production",
      href: "/eggs",
      icon: Egg,
      isActive: pathname.startsWith("/eggs"),
      // Si la ferme est strictement BROILER (chair), la ponte peut être masquée ou désactivée
      show:
        !isBroiler &&
        hasModule("eggs") &&
        (hasPermission("egg:read") || hasPermission("egg:view") || isOwner),
    },
    {
      name: "Santé",
      href: "/health",
      icon: HeartPulse,
      isActive: pathname.startsWith("/health"),
      show:
        hasModule("health") &&
        (hasPermission("health:view") || hasPermission("health:manage") || isOwner),
    },
    {
      name: "Gestion",
      href: "/management",
      icon: Briefcase,
      isActive:
        pathname.startsWith("/management") ||
        pathname.startsWith("/finances") ||
        pathname.startsWith("/inventory") ||
        pathname.startsWith("/contacts") ||
        pathname.startsWith("/settings/members") ||
        pathname.startsWith("/settings/roles"),
      show: true,
    },
  ];

  // ─── NAVIGATION SECONDAIRE (PARAMÈTRES FERME) ───
  const secondaryNavigation = [
    {
      name: "Paramètres de la ferme",
      href: "/settings/farm",
      icon: Settings,
      isActive: pathname.startsWith("/settings/farm"),
      show: isOwner || hasPermission("farm:edit"),
    },
  ];

  return (
    <SidebarContainer collapsible="icon">
      {/* ─── En-tête / Brand ─── */}
      <SidebarHeader
        className={cn(
          "flex-row items-center transition-all duration-300 h-16 p-0",
          isCollapsed ? "justify-center px-2" : "justify-between px-5"
        )}
      >
        <Link
          href="/"
          onClick={closeMobile}
          className="flex items-center gap-3 text-lg font-bold tracking-tight text-white group min-w-0"
          title="Poulvia"
        >
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 p-1 shadow-md border border-white/20 group-hover:scale-105 transition-transform backdrop-blur-xs">
            <Image
              src="/logo.png"
              alt="Poulvia"
              width={36}
              height={36}
              className="h-full w-full object-contain"
              priority
            />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col leading-tight min-w-0 transition-opacity duration-200">
              <span className="text-base font-extrabold text-white tracking-tight truncate">
                Poulvia
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-white/60 truncate">
                Bénin &amp; Ouest-Afrik
              </span>
            </div>
          )}
        </Link>

        {/* Fermeture sur mobile */}
        {isMobile && (
          <button
            type="button"
            onClick={closeMobile}
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white cursor-pointer"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Bouton de repli shadcn (desktop) */}
        {!isCollapsed && !isMobile && (
          <SidebarTrigger />
        )}
      </SidebarHeader>

      {/* ─── 5 Espaces Principaux ─── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => {
                if (!item.show) return null;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      tooltip={item.name}
                      onClick={closeMobile}
                    >
                      <Link
                        href={item.href}
                        className="flex w-full items-center gap-3"
                      >
                        <Icon
                          className={cn(
                            "shrink-0 transition-colors",
                            isCollapsed ? "h-5 w-5" : "h-4 w-4",
                            item.isActive
                              ? "text-accent"
                              : "text-white/70 group-hover:text-white"
                          )}
                        />
                        {!isCollapsed && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ─── Section Paramètres Secondaire ─── */}
        <SidebarGroup className="mt-auto pt-3">
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavigation.map((item) => {
                if (!item.show) return null;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      tooltip={item.name}
                      onClick={closeMobile}
                    >
                      <Link
                        href={item.href}
                        className="flex w-full items-center gap-3"
                      >
                        <Icon
                          className={cn(
                            "shrink-0 transition-colors",
                            isCollapsed ? "h-5 w-5" : "h-4 w-4",
                            item.isActive
                              ? "text-accent"
                              : "text-white/70 group-hover:text-white"
                          )}
                        />
                        {!isCollapsed && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ─── Bouton de repli/dépli bas de page (desktop) ─── */}
      {!isMobile && (
        <div className="border-t border-white/10 p-2">
          <SidebarTrigger
            className={cn(
              "w-full h-10 gap-3 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all",
              isCollapsed && "justify-center p-0"
            )}
          />
        </div>
      )}

      {/* ─── Footer Abonnement ─── */}
      {isOwner && (
        <SidebarFooter
          className={cn(
            "transition-all duration-300",
            isCollapsed ? "p-2" : "p-4"
          )}
        >
          {!isCollapsed ? (
            <Link
              href="/settings/subscription"
              onClick={closeMobile}
              className="block rounded-2xl bg-white/10 border border-white/15 p-3.5 hover:bg-white/15 hover:border-accent/40 transition-all group shadow-2xs"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/60 group-hover:text-accent transition-colors">
                Formule de la ferme
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate">
                  {activePlan?.planName || "Formule Starter"}
                </span>
                <span className="rounded-full bg-accent text-white px-2 py-0.5 text-[10px] font-bold shadow-2xs">
                  {activePlan?.badge || activePlan?.plan || "Gratuit"}
                </span>
              </div>
              <div className="mt-1.5 text-[10px] text-white/70 group-hover:text-accent transition-colors flex items-center gap-1 font-medium">
                <CreditCard className="h-3 w-3 text-accent" />
                Gérer mon abonnement →
              </div>
            </Link>
          ) : (
            <div className="flex justify-center">
              <Link
                href="/settings/subscription"
                onClick={closeMobile}
                title={`Formule: ${activePlan?.planName || "Starter"}`}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-accent transition-all cursor-pointer"
              >
                <CreditCard className="h-5 w-5" />
              </Link>
            </div>
          )}
        </SidebarFooter>
      )}
    </SidebarContainer>
  );
}
