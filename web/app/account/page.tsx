"use client";

import React, { useState } from "react";
import { KeyRound, UserRound } from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { api } from "@/lib/api-client";

export default function AccountPage() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handlePasswordChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("La confirmation ne correspond pas au nouveau mot de passe.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Le nouveau mot de passe doit comporter au moins 8 caractères.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await api.auth.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success(result.message || "Votre mot de passe a été modifié.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de modifier le mot de passe.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Shell>
      <PageHeader
        title="Mon compte"
        subtitle="Vos informations personnelles et la sécurité de votre accès."
        icon={<UserRound className="h-4 w-4" />}
        backHref="/"
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-base font-semibold text-foreground">Mes informations</h2>
            <p className="mt-1 text-xs text-muted">Informations associées à votre compte Poulvia.</p>
          </div>

          <dl className="divide-y divide-border">
            <div className="py-4">
              <dt className="text-xs font-medium text-muted">Nom complet</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">{user?.fullName || "—"}</dd>
            </div>
            <div className="py-4">
              <dt className="text-xs font-medium text-muted">Adresse e-mail</dt>
              <dd className="mt-1 break-all text-sm font-semibold text-foreground">{user?.email || "—"}</dd>
            </div>
            <div className="py-4">
              <dt className="text-xs font-medium text-muted">Téléphone</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">{user?.phone || "Non renseigné"}</dd>
            </div>
            <div className="py-4">
              <dt className="text-xs font-medium text-muted">Rôle dans la ferme active</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">{role?.name || "Aucune ferme active"}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-6">
          <div className="flex items-start gap-3 border-b border-border pb-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <KeyRound className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-foreground">Sécurité</h2>
              <p className="mt-1 text-xs text-muted">Modifiez le mot de passe de votre compte.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="mt-5 space-y-4">
            <div>
              <label htmlFor="current-password" className="mb-1.5 block text-xs font-medium text-foreground">Mot de passe actuel</label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:bg-surface focus:outline-hidden transition-colors"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="mb-1.5 block text-xs font-medium text-foreground">Nouveau mot de passe</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:bg-surface focus:outline-hidden transition-colors"
              />
              <p className="mt-1 text-[11px] text-muted">Au moins 8 caractères.</p>
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-medium text-foreground">Confirmer le nouveau mot de passe</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:bg-surface focus:outline-hidden transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Enregistrement…" : "Modifier le mot de passe"}
            </button>
          </form>
        </section>
      </div>
    </Shell>
  );
}
