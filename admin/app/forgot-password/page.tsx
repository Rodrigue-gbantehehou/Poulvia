"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"request" | "reset" | "success">("request");
  const [message, setMessage] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const errorMessage = (reason: unknown, fallback: string) => {
    if (reason instanceof ApiError) {
      const payload = reason.data as { detail?: unknown; message?: unknown } | null;
      if (typeof payload?.detail === "string") return payload.detail;
      if (typeof payload?.message === "string") return payload.message;
    }
    return reason instanceof Error ? reason.message : fallback;
  };

  const handleRequestCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const result = await authApi.requestPasswordReset(email);
      setMessage(result.message);
      setDevCode(result.devCode ?? null);
      if (result.devCode) setCode(result.devCode);
      setStep("reset");
    } catch (reason: unknown) {
      setError(errorMessage(reason, "Impossible de traiter la demande. Réessayez."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(code.trim())) {
      setError("Saisissez le code à 6 chiffres reçu par e-mail.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit comporter au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({ email, code, newPassword });
      setStep("success");
      setMessage("Votre mot de passe a été modifié. Vous pouvez maintenant vous reconnecter.");
      setDevCode(null);
    } catch (reason: unknown) {
      setError(errorMessage(reason, "Le code est invalide ou a expiré. Vérifiez-le et réessayez."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await authApi.requestPasswordReset(email);
      setMessage(result.message);
      setDevCode(result.devCode ?? null);
      if (result.devCode) setCode(result.devCode);
    } catch (reason: unknown) {
      setError(errorMessage(reason, "Impossible de renvoyer le code. Réessayez."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        <header className="space-y-2 text-center">
          <div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-2xl border border-border bg-surface p-1 shadow-md">
            <Image src="/logo.png" alt="Poulvia" width={56} height={56} className="h-full w-full object-contain" priority />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Poulvia</h1>
          <p className="mt-1 text-xs text-muted">Récupération de l’accès à la console d’administration</p>
        </header>

        <section className="space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-xl sm:p-8" aria-labelledby="reset-title">
          <div>
            <h2 id="reset-title" className="text-lg font-semibold text-foreground">
              {step === "request" && "Mot de passe oublié ?"}
              {step === "reset" && "Saisir le code reçu"}
              {step === "success" && "Mot de passe modifié"}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {step === "request" && "Nous enverrons un code de vérification à l’adresse associée à votre compte."}
              {step === "reset" && "Le code reçu par e-mail est valable 15 minutes."}
              {step === "success" && "Vous pouvez revenir à la page de connexion."}
            </p>
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-soft/70 p-3.5 text-xs text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && !error && step !== "success" && (
            <div role="status" className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary-soft/60 p-3.5 text-xs text-foreground">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{message}</span>
            </div>
          )}

          {step === "request" && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <label className="block space-y-1.5 text-xs font-semibold text-foreground" htmlFor="email">
                <span>Adresse e-mail</span>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted" aria-hidden="true" />
                  <Input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@poulvia.com" className="pl-9 text-sm" />
                </div>
              </label>
              <Button type="submit" size="lg" className="w-full text-sm" isLoading={isLoading}>
                Envoyer le code
              </Button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <label className="block space-y-1.5 text-xs font-semibold text-foreground" htmlFor="email-confirm">
                <span>Adresse e-mail du compte</span>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted" aria-hidden="true" />
                  <Input id="email-confirm" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="pl-9 text-sm" />
                </div>
              </label>

              <label className="block space-y-1.5 text-xs font-semibold text-foreground" htmlFor="code">
                <span>Code à 6 chiffres</span>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted" aria-hidden="true" />
                  <Input id="code" inputMode="numeric" autoComplete="one-time-code" required maxLength={6} pattern="[0-9]{6}" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" className="pl-9 text-sm tracking-[0.25em]" />
                </div>
              </label>

              <label className="block space-y-1.5 text-xs font-semibold text-foreground" htmlFor="new-password">
                <span>Nouveau mot de passe (8 caractères minimum)</span>
                <Input id="new-password" type="password" autoComplete="new-password" required minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="text-sm" />
              </label>

              <label className="block space-y-1.5 text-xs font-semibold text-foreground" htmlFor="confirm-password">
                <span>Confirmer le nouveau mot de passe</span>
                <Input id="confirm-password" type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="text-sm" />
              </label>

              {devCode && (
                <div role="note" className="rounded-lg border border-info/30 bg-info-soft p-3 text-xs text-foreground">
                  Code de test local : <strong className="font-mono tracking-widest">{devCode}</strong>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full text-sm" isLoading={isLoading}>
                Modifier le mot de passe
              </Button>
              <Button type="button" variant="link" className="mx-auto flex text-xs" onClick={handleResend} isLoading={isLoading}>
                Renvoyer un code
              </Button>
            </form>
          )}

          {step === "success" && (
            <div className="space-y-4">
              <div role="status" className="flex items-start gap-2 rounded-xl border border-success/30 bg-success-soft p-3.5 text-xs text-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{message}</span>
              </div>
              <Link href="/login" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-xs hover:bg-primary-hover">
                <ArrowLeft className="h-4 w-4" /> Retour à la connexion
              </Link>
            </div>
          )}

          {step !== "success" && (
            <div className="border-t border-border/70 pt-4 text-center">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground">
                <ArrowLeft className="h-3.5 w-3.5" /> Retour à la connexion
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
