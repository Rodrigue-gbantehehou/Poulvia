"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CreditCard,
  LockKeyhole,
  Settings,
  UserRound,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/context/auth-context";

function SettingsLinkCard({
  href,
  title,
  description,
  icon,
  detail,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-36 items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-xs transition-colors hover:border-primary/40 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="mt-1 block text-xs leading-relaxed text-muted">{description}</span>
        <span className="mt-3 block truncate text-xs font-medium text-foreground">{detail}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

function RestrictedSettingsCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <section className="flex min-h-36 items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-xs">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="mt-1 block text-xs leading-relaxed text-muted">{description}</span>
        <span className="mt-3 block text-xs font-medium text-muted">Accès réservé au propriétaire</span>
      </span>
      <LockKeyhole className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
    </section>
  );
}

export default function SettingsPage() {
  const { user, activeFarm, isOwner, isSubscriptionOwner } = useAuth();
  const subscription = activeFarm?.subscription;

  return (
    <Shell>
      <PageHeader
        title="Paramètres"
        subtitle="Paramètres de votre exploitation et de son abonnement."
        icon={<Settings className="h-4 w-4" />}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <SettingsLinkCard
          href="/account"
          title="Mon compte"
          description="Consulter vos informations personnelles et gérer la sécurité de votre accès."
          icon={<UserRound className="h-5 w-5" />}
          detail={user?.email || "Informations du compte"}
        />

        {isOwner ? (
          <SettingsLinkCard
            href="/settings/farm"
            title="Ma ferme"
            description="Consulter et modifier les informations de l’exploitation active."
            icon={<Building2 className="h-5 w-5" />}
            detail={activeFarm?.name || "Aucune exploitation active"}
          />
        ) : (
          <RestrictedSettingsCard
            title="Ma ferme"
            description={activeFarm?.name || "Informations de l’exploitation active."}
            icon={<Building2 className="h-5 w-5" />}
          />
        )}

        {isSubscriptionOwner ? (
          <SettingsLinkCard
            href="/settings/subscription"
            title="Abonnement"
            description="Consulter l’offre et choisir une périodicité de paiement."
            icon={<CreditCard className="h-5 w-5" />}
            detail={subscription?.planName || subscription?.plan || "Offre Poulvia"}
          />
        ) : (
          <RestrictedSettingsCard
            title="Abonnement"
            description="Offre et périodicité de paiement."
            icon={<CreditCard className="h-5 w-5" />}
          />
        )}
      </div>
    </Shell>
  );
}
