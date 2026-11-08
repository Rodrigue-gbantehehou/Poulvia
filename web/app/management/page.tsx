"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Package,
  ContactRound,
  Users,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Boxes,
  UserCheck,
  Lock,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api-client";
import { formatFcfa } from "@/lib/utils";

interface ManagementSummary {
  cashBalance?: number;
  stockCount?: number;
  contactCount?: number;
  memberCount?: number;
}

export default function ManagementPage() {
  const { activeFarm, hasPermission, hasModule, isOwner } = useAuth();
  const [summary, setSummary] = useState<ManagementSummary>({});
  const [isLoading, setIsLoading] = useState(true);

  // Permissions
  const canViewFinance =
    hasModule("finance") &&
    (hasPermission("finance:read") || hasPermission("finance:view") || isOwner);
  const canViewInventory =
    hasModule("inventory") &&
    (hasPermission("inventory:read") || hasPermission("inventory:view") || isOwner);
  const canViewContacts =
    hasModule("contacts") &&
    (hasPermission("contact:read") || hasPermission("contact:view") || isOwner);
  const canManageMembers =
    hasPermission("member:manage") || hasPermission("member:read") || isOwner;
  const canManageRoles =
    hasPermission("role:manage") || hasPermission("role:read") || isOwner;

  useEffect(() => {
    async function loadQuickStats() {
      if (!activeFarm?.id) return;
      try {
        setIsLoading(true);
        const [transactions, invItems, contactsList] = await Promise.all([
          canViewFinance
            ? api.finance.listTransactions({ farmId: activeFarm.id }).catch(() => [])
            : Promise.resolve([]),
          canViewInventory
            ? api.inventory.listItems({ farmId: activeFarm.id }).catch(() => [])
            : Promise.resolve([]),
          canViewContacts
            ? api.contacts.list({ farmId: activeFarm.id }).catch(() => [])
            : Promise.resolve([]),
        ]);

        setSummary({
          cashBalance: canViewFinance
            ? transactions.reduce(
                (balance, transaction) =>
                  balance + (transaction.type === "INCOME" ? transaction.amountFcfa : -transaction.amountFcfa),
                0,
              )
            : undefined,
          stockCount: canViewInventory ? invItems.length : undefined,
          contactCount: canViewContacts ? contactsList.length : undefined,
        });
      } catch {
        // Ignorer les erreurs d'indicateurs
      } finally {
        setIsLoading(false);
      }
    }

    loadQuickStats();
  }, [activeFarm?.id, canViewFinance, canViewInventory, canViewContacts]);

  const managementModules = [
    {
      title: "Trésorerie & Ventes",
      description:
        "Tenue de la caisse en FCFA, encaissements de ventes (œufs, poulets), achats d'aliments et dépenses d'exploitation.",
      href: "/finances",
      icon: Wallet,
      badgeText: "Caisse & Finances",
      badgeVariant: "success" as const,
      stat:
        summary.cashBalance !== undefined
          ? `Solde : ${formatFcfa(summary.cashBalance)}`
          : undefined,
      allowed: canViewFinance,
      buttonLabel: "Accéder à la caisse",
    },
    {
      title: "Stocks & Intrants",
      description:
        "Gestion des sacs de provende (50 kg / kg), produits vétérinaires, emballages et suivi des distributions alimentaires.",
      href: "/inventory",
      icon: Package,
      badgeText: "Matières & Provende",
      badgeVariant: "info" as const,
      stat:
        summary.stockCount !== undefined
          ? `${summary.stockCount} article${summary.stockCount > 1 ? "s" : ""} référencé${summary.stockCount > 1 ? "s" : ""}`
          : undefined,
      allowed: canViewInventory,
      buttonLabel: "Gérer les stocks",
    },
    {
      title: "Répertoire & Contacts",
      description:
        "Annuaire centralisé des clients acheteurs, grossistes, provendiers, techniciens et vétérinaires de la ferme.",
      href: "/contacts",
      icon: ContactRound,
      badgeText: "Clients & Fournisseurs",
      badgeVariant: "neutral" as const,
      stat:
        summary.contactCount !== undefined
          ? `${summary.contactCount} contact${summary.contactCount > 1 ? "s" : ""}`
          : undefined,
      allowed: canViewContacts,
      buttonLabel: "Consulter l'annuaire",
    },
    {
      title: "Équipe & Collaborateurs",
      description:
        "Gestion des employés de ferme, invitation de nouveaux collaborateurs et affectation des accès opérationnels.",
      href: "/settings/members",
      icon: Users,
      badgeText: "Ressources Humaines",
      badgeVariant: "warning" as const,
      stat: undefined,
      allowed: canManageMembers,
      buttonLabel: "Gérer les membres",
    },
    {
      title: "Rôles & Permissions",
      description:
        "Personnalisation fine des rôles d'accès (Gérant, Vétérinaire, Ouvrier avicole, etc.) et sécurisation des actions.",
      href: "/settings/roles",
      icon: ShieldCheck,
      badgeText: "Gouvernance & Sécurité",
      badgeVariant: "neutral" as const,
      stat: undefined,
      allowed: canManageRoles,
      buttonLabel: "Configurer les rôles",
    },
  ];

  return (
    <Shell>
      <div className="space-y-6">
        {/* En-tête de la page */}
        <PageHeader
          title="Espace Gestion"
          subtitle="Pilotage financier, logistique, partenarial et humain de votre exploitation avicole."
        />

        {/* Grille principale des modules de gestion */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {managementModules.map((item) => {
            const Icon = item.icon;

            if (!item.allowed) {
              return null;
            }

            return (
              <div
                key={item.title}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant={item.badgeVariant} size="sm">
                      {item.badgeText}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs text-muted leading-relaxed">
                    {item.description}
                  </p>

                  {item.stat && (
                    <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-semibold text-foreground">
                      <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{item.stat}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border/80">
                  <Link
                    href={item.href}
                    className="inline-flex w-full items-center justify-between rounded-xl bg-surface-muted/60 px-3.5 py-2 text-xs font-bold text-foreground hover:bg-primary hover:text-white transition-all group/btn"
                  >
                    <span>{item.buttonLabel}</span>
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
