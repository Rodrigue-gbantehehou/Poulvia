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
  PanelLeftClose,
  PanelLeftOpen,
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
  const { state, isMobile, toggleSidebar } = useSidebar();
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
          "fixed top-0 bottom-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-[#e6e4dd] bg-[#f8f7f3] text-[#242820] shadow-xl transition-[width,transform] duration-200 ease-out lg:static lg:shadow-none lg:translate-x-0 lg:overflow-x-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-[72px]" : "lg:w-64",
        )}
      >
        {/* Header / Brand */}
        <div className={cn(
          "flex h-16 items-center border-b border-[#e6e4dd]",
          isCollapsed ? "justify-between gap-1 px-1.5" : "justify-between px-5",
        )}>
          <Link
            href="/"
            onClick={onClose}
            className={cn("flex min-w-0 items-center gap-3 text-lg font-semibold tracking-tight text-[#242820] group", isCollapsed && "gap-0")}
            aria-label="Poulvia, accueil"
            title={isCollapsed ? "Poulvia — Accueil" : undefined}
          >
            <div className={cn("relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-control bg-white p-1 border border-[#e6e4dd]", isCollapsed && "h-8 w-8")}>
              <Image src="/logo.png" alt="Poulvia" width={36} height={36} className="h-full w-full object-contain" priority />
            </div>
            <div className={cn("flex flex-col leading-tight", isCollapsed && "sr-only")}>
              <span className="text-base font-extrabold text-[#242820] tracking-tight">
                Poulvia
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              "hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#686b64] transition-colors hover:bg-[#eeede8] hover:text-[#242820] lg:inline-flex",
              isCollapsed && "h-7 w-7",
            )}
            aria-label={isCollapsed ? "Déplier le menu" : "Replier le menu"}
            title={isCollapsed ? "Déplier le menu" : "Replier le menu"}
          >
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-control p-1.5 text-[#686b64] hover:bg-[#eeede8] hover:text-[#242820] lg:hidden cursor-pointer"
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
            "pb-2 text-caption font-semibold tracking-wide uppercase text-[#777970]",
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
                      "pb-1 text-caption font-semibold text-[#777970]",
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
                            ? "text-[#242820] font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-[#a9aaa3]"
                            : "text-[#686b64] hover:bg-[#eeede8] hover:text-[#242820]",
                        )}
                      >
                        <ChildIcon
                          className={cn(
                            "h-5 w-5 shrink-0",
                            childActive ? "text-[#242820]" : "text-[#777970] group-hover:text-[#242820]",
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
                    ? "text-[#242820] font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-[#a9aaa3]"
                    : "text-[#686b64] hover:bg-[#eeede8] hover:text-[#242820]"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-[#242820]" : "text-[#777970] group-hover:text-[#242820]"
                  )}
                />
                <span className={cn("truncate", isCollapsed && "sr-only")}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#e6e4dd] p-3">
          <Link
            href="/settings"
            onClick={onClose}
            aria-label="Paramètres"
            title={isCollapsed ? "Paramètres" : undefined}
            className={cn(
              "group relative flex min-h-11 items-center rounded-control py-2.5 text-label font-medium text-[#686b64] transition-colors hover:bg-[#eeede8] hover:text-[#242820]",
              isCollapsed ? "justify-center px-0" : "gap-3 px-3.5",
              pathname.startsWith("/settings") && "text-[#242820] font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-[#a9aaa3]",
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
