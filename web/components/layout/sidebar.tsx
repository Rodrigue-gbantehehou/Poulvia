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
  X,
  Settings,
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
  const { hasPermission, hasModule, activeFarm, isOwner } = useAuth();
  const { state, isMobile } = useSidebar();
  const isCollapsed = !isMobile && state === "collapsed";

  const canViewFlocks =
    hasModule("flocks") &&
    (hasPermission("flock:read") || hasPermission("flock:view") || isOwner);
  const canViewBuildings =
    hasModule("buildings") &&
    (hasPermission("building:manage") || hasPermission("farm:view") || isOwner);
  const canViewProduction =
    activeFarm?.productionType !== "BROILER" &&
    hasModule("eggs") &&
    (hasPermission("egg:read") || hasPermission("egg:view") || isOwner);
  const canViewHealth =
    hasModule("health") &&
    (hasPermission("health:view") || hasPermission("health:manage") || isOwner);
  const canViewFinance =
    hasModule("finance") &&
    (hasPermission("finance:read") || hasPermission("finance:view") || isOwner);
  const canViewInventory =
    hasModule("inventory") &&
    (hasPermission("inventory:read") || hasPermission("inventory:view") || isOwner);
  const canViewContacts =
    hasModule("contacts") &&
    (hasPermission("contact:read") || hasPermission("contact:view") || isOwner);
  const canViewMembers =
    hasModule("team") &&
    (hasPermission("member:manage") || isOwner);
  const canViewRoles =
    hasModule("custom_roles") &&
    (hasPermission("role:manage") || isOwner);
  const canViewManagement =
    canViewFinance || canViewInventory || canViewContacts || canViewMembers || canViewRoles;

  const navigation = [
    {
      name: "Accueil",
      href: "/",
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: "Élevage",
      href: canViewFlocks ? "/flocks" : "/buildings",
      icon: Bird,
      show: canViewFlocks || canViewBuildings,
      children: [
        ...(canViewFlocks ? [{ name: "Bandes", href: "/flocks", icon: Bird }] : []),
        ...(canViewBuildings ? [{ name: "Bâtiments", href: "/buildings", icon: Warehouse }] : []),
      ],
    },
    {
      name: "Production",
      href: "/eggs",
      icon: Egg,
      show: canViewProduction,
    },
    {
      name: "Santé",
      href: "/health",
      icon: HeartPulse,
      show: canViewHealth,
    },
    { name: "Gestion", href: "/management", icon: Settings, show: canViewManagement },
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
            if (!item.show) {
              return null;
            }

            if ("children" in item && item.children) {
              return (
                <div key={item.name} className="space-y-1">
                  <div
                    className={cn(
                      "pb-1 text-caption font-medium text-muted",
                      isCollapsed ? "sr-only" : "px-3.5 pt-2",
                    )}
                  >
                    {item.name}
                  </div>
                  {item.children.map((child) => {
                    const childActive = pathname.startsWith(child.href);
                    const ChildIcon = child.icon;

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onClose}
                        aria-label={`${item.name} — ${child.name}`}
                        aria-current={childActive ? "page" : undefined}
                        title={isCollapsed ? child.name : undefined}
                        className={cn(
                          "group relative flex min-h-11 items-center rounded-control py-2.5 text-label font-medium transition-colors",
                          isCollapsed ? "justify-center px-0" : "gap-3 px-3.5",
                          childActive
                            ? "bg-primary-soft text-primary font-semibold"
                            : "text-muted hover:bg-surface-hover hover:text-foreground",
                        )}
                      >
                        {childActive && (
                          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
                        )}
                        <ChildIcon
                          className={cn(
                            "h-5 w-5 shrink-0",
                            childActive ? "text-primary" : "text-muted group-hover:text-foreground",
                          )}
                          aria-hidden="true"
                        />
                        <span className={cn("truncate", isCollapsed && "sr-only")}>{child.name}</span>
                      </Link>
                    );
                  })}
                </div>
              );
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

        <div className="border-t border-border p-3">
          <Link
            href="/settings"
            onClick={onClose}
            aria-label="Paramètres"
            title={isCollapsed ? "Paramètres" : undefined}
            className={cn(
              "flex min-h-11 items-center rounded-control py-2.5 text-label font-medium text-muted transition-colors hover:bg-surface-hover hover:text-foreground",
              isCollapsed ? "justify-center px-0" : "gap-3 px-3.5",
              pathname.startsWith("/settings") && "bg-primary-soft text-primary",
            )}
          >
            <Settings className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className={cn(isCollapsed && "sr-only")}>Paramètres</span>
          </Link>
        </div>

      </aside>
    </>
  );
}
