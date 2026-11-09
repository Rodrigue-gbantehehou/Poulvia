"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Lock } from "lucide-react";
import { api } from "@/lib/api-client";

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-background p-4 text-sm text-muted">Chargement de l’invitation…</main>}>
      <AcceptInvitationForm />
    </Suspense>
  );
}

function AcceptInvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!token) {
      setError("Ce lien d’invitation est incomplet. Demandez une nouvelle invitation à votre responsable.");
      return;
    }
    if (password.length < 8) {
      setError("Choisissez un mot de passe d’au moins 8 caractères.");
      return;
    }
    if (password !== confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    try {
      await api.auth.acceptMemberInvitation({ token, password });
      setIsAccepted(true);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Cette invitation est invalide ou a expiré.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
      <section className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            {isAccepted ? <CheckCircle2 className="h-7 w-7" /> : <KeyRound className="h-7 w-7" />}
          </div>
          <h1 className="mt-4 text-xl font-semibold text-foreground">
            {isAccepted ? "Votre compte est activé" : "Rejoindre une exploitation"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {isAccepted
              ? "Vous pouvez maintenant vous connecter avec votre adresse e-mail et votre nouveau mot de passe."
              : "Définissez un mot de passe pour activer votre compte et rejoindre l’exploitation qui vous a invité."}
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-soft/70 p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isAccepted ? (
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Aller à la connexion
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!token && (
              <p className="rounded-lg bg-surface-muted p-3 text-sm text-muted">
                Vérification du lien d’invitation… Si cette page reste affichée, demandez un nouvel e-mail d’invitation.
              </p>
            )}
            <label className="block space-y-1.5 text-sm font-medium text-foreground">
              <span>Nouveau mot de passe</span>
              <span className="relative block">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted" aria-hidden="true" />
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={255}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-h-11 w-full rounded-lg border border-border bg-surface-muted pl-10 pr-3 text-sm text-foreground focus:border-primary focus:outline-hidden"
                />
              </span>
              <span className="block text-xs font-normal text-muted">Au moins 8 caractères.</span>
            </label>
            <label className="block space-y-1.5 text-sm font-medium text-foreground">
              <span>Confirmer le mot de passe</span>
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={255}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className="min-h-11 w-full rounded-lg border border-border bg-surface-muted px-3 text-sm text-foreground focus:border-primary focus:outline-hidden"
              />
            </label>
            <button
              type="submit"
              disabled={isLoading || !token}
              className="flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Activation en cours…" : "Activer mon compte"}
            </button>
          </form>
        )}

        <div className="mt-5 border-t border-border pt-4 text-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Retour à la connexion
          </Link>
        </div>
      </section>
    </main>
  );
}
