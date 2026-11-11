"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings,
  Trash2,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api-client";
import { Farm } from "@/lib/types";

type FarmSettingsValues = {
  name: string;
  code: string;
  productionType: NonNullable<Farm["productionType"]>;
  locationCity: string;
  locationCountry: string;
  phone: string;
  email: string;
  address: string;
  ifu: string;
  rccm: string;
  description: string;
};

function getFarmSettingsValues(farm: Farm | null): FarmSettingsValues {
  return {
    name: farm?.name || "",
    code: farm?.code || "",
    productionType: farm?.productionType || "LAYER",
    locationCity: farm?.locationCity || farm?.location || "",
    locationCountry: farm?.locationCountry || "BJ",
    phone: farm?.phone || "",
    email: farm?.email || "",
    address: farm?.address || "",
    ifu: farm?.ifu || "",
    rccm: farm?.rccm || "",
    description: farm?.description || "",
  };
}

const inputClass =
  "w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:bg-surface focus:outline-hidden transition-colors";

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[11px] leading-5 text-muted">{hint}</p>}
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3 border-b border-border pb-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
        {icon}
      </span>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
      </div>
    </div>
  );
}

export default function FarmSettingsPage() {
  const router = useRouter();
  const { activeFarm, refreshMe, isOwner } = useAuth();
  const [farmDraft, setFarmDraft] = useState(() => ({
    farmId: activeFarm?.id ?? null,
    values: getFarmSettingsValues(activeFarm),
  }));
  const farmValues =
    farmDraft.farmId === (activeFarm?.id ?? null)
      ? farmDraft.values
      : getFarmSettingsValues(activeFarm);
  const {
    name,
    code,
    productionType,
    locationCity,
    locationCountry,
    phone,
    email,
    address,
    ifu,
    rccm,
    description,
  } = farmValues;

  function setFarmField<Key extends keyof FarmSettingsValues>(
    key: Key,
    value: FarmSettingsValues[Key],
  ) {
    setFarmDraft({
      farmId: activeFarm?.id ?? null,
      values: { ...farmValues, [key]: value },
    });
  }

  const setProductionType = (value: FarmSettingsValues["productionType"]) =>
    setFarmField("productionType", value);
  const [savingFarm, setSavingFarm] = useState(false);
  const [farmSuccessMsg, setFarmSuccessMsg] = useState<string | null>(null);
  const [farmErrorMsg, setFarmErrorMsg] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [deletingFarm, setDeletingFarm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleSaveFarm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeFarm?.id || !name.trim()) return;

    setSavingFarm(true);
    setFarmSuccessMsg(null);
    setFarmErrorMsg(null);
    try {
      await api.farms.update(activeFarm.id, {
        name: name.trim(),
        code: code.trim() || undefined,
        productionType,
        locationCity: locationCity.trim() || undefined,
        locationCountry,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        ifu: ifu.trim() || undefined,
        rccm: rccm.trim() || undefined,
        description: description.trim() || undefined,
      });
      await refreshMe();
      setFarmSuccessMsg("Les informations de l’exploitation ont été enregistrées.");
      setTimeout(() => setFarmSuccessMsg(null), 4000);
    } catch (error) {
      setFarmErrorMsg(
        error instanceof Error
          ? error.message
          : "Impossible de mettre à jour cette exploitation.",
      );
    } finally {
      setSavingFarm(false);
    }
  }

  async function handleDeleteFarm() {
    if (!activeFarm?.id) return;
    if (deleteConfirmName.trim() !== activeFarm.name.trim()) {
      setDeleteError("Le nom saisi ne correspond pas au nom de l’exploitation.");
      return;
    }

    setDeletingFarm(true);
    setDeleteError(null);
    try {
      await api.farms.delete(activeFarm.id);
      await refreshMe();
      setDeleteModalOpen(false);
      router.push("/");
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer cette exploitation.",
      );
    } finally {
      setDeletingFarm(false);
    }
  }

  return (
    <Shell>
      <PageHeader
        title="Paramètres de l’exploitation"
        subtitle={
          activeFarm
            ? `Informations générales de ${activeFarm.name}`
            : "Configurez les informations de votre ferme."
        }
        icon={<Settings className="h-4 w-4" />}
        backHref="/settings"
        actions={
          activeFarm ? (
            <button
              type="submit"
              form="farm-settings-form"
              disabled={savingFarm}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {savingFarm ? "Enregistrement…" : "Enregistrer"}
            </button>
          ) : undefined
        }
      />

      {!activeFarm ? (
        <section className="mx-auto max-w-xl border-y border-border py-12 text-center">
          <Building2 className="mx-auto h-9 w-9 text-muted" />
          <h2 className="mt-4 text-base font-semibold text-foreground">Aucune exploitation active</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            Sélectionnez ou créez une exploitation depuis le menu en haut de page pour accéder à ses paramètres.
          </p>
        </section>
      ) : (
        <div className="mx-auto max-w-6xl space-y-6">
          <form id="farm-settings-form" onSubmit={handleSaveFarm} className="space-y-5">
            {(farmSuccessMsg || farmErrorMsg) && (
              <div
                role={farmErrorMsg ? "alert" : "status"}
                className={
                  farmErrorMsg
                    ? "flex items-start gap-2.5 rounded-xl border border-danger/20 bg-danger-soft p-3.5 text-sm text-danger"
                    : "flex items-start gap-2.5 rounded-xl border border-success/20 bg-success-soft p-3.5 text-sm text-success"
                }
              >
                {farmErrorMsg ? (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <span>{farmErrorMsg || farmSuccessMsg}</span>
              </div>
            )}

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-5">
                <section className="rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-6">
                  <SectionHeading
                    icon={<Building2 className="h-4 w-4" />}
                    title="Identité de l’exploitation"
                    description="Nom et activité principale de la ferme."
                  />
                  <div className="space-y-4">
                    <Field label="Nom de l’exploitation *" htmlFor="farm-name">
                      <input
                        id="farm-name"
                        type="text"
                        required
                        value={name}
                        onChange={(event) => setFarmField("name", event.target.value)}
                        placeholder="Ex. Ferme avicole de Calavi"
                        className={inputClass}
                      />
                    </Field>
                    <Field
                      label="Activité de l’exploitation"
                      htmlFor="farm-description"
                      hint="Ce texte peut apparaître sur les reçus et documents PDF."
                    >
                      <input
                        id="farm-description"
                        type="text"
                        value={description}
                        onChange={(event) => setFarmField("description", event.target.value)}
                        placeholder="Ex. Production d’œufs et poulets de chair"
                        className={inputClass}
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Code de la ferme"
                        htmlFor="farm-code"
                        hint="Utilisé comme préfixe pour identifier les bandes."
                      >
                        <input
                          id="farm-code"
                          type="text"
                          value={code}
                          onChange={(event) => setFarmField("code", event.target.value)}
                          placeholder="Ex. FRM-CAL1"
                          className={`${inputClass} font-mono`}
                        />
                      </Field>
                      <Field label="Type de production" htmlFor="farm-production-type">
                        <select
                          id="farm-production-type"
                          value={productionType}
                          onChange={(event) => {
                            const value = event.target.value;
                            if (value === "LAYER" || value === "BROILER" || value === "MIXED") {
                              setProductionType(value);
                            }
                          }}
                          className={inputClass}
                        >
                          <option value="LAYER">Poules pondeuses</option>
                          <option value="BROILER">Poulets de chair</option>
                          <option value="MIXED">Élevage mixte</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-6">
                  <SectionHeading
                    icon={<MapPin className="h-4 w-4" />}
                    title="Localisation"
                    description="Lieu d’implantation de l’exploitation."
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Commune ou ville" htmlFor="farm-city">
                      <input
                        id="farm-city"
                        type="text"
                        value={locationCity}
                        onChange={(event) => setFarmField("locationCity", event.target.value)}
                        placeholder="Ex. Calavi, Allada, Parakou"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Pays" htmlFor="farm-country">
                      <select
                        id="farm-country"
                        value={locationCountry}
                        onChange={(event) => setFarmField("locationCountry", event.target.value)}
                        className={inputClass}
                      >
                        <option value="BJ">Bénin</option>
                        <option value="TG">Togo</option>
                        <option value="CI">Côte d’Ivoire</option>
                        <option value="SN">Sénégal</option>
                        <option value="NG">Nigeria</option>
                      </select>
                    </Field>
                  </div>
                </section>
              </div>

              <div className="space-y-5">
                <section className="rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-6">
                  <SectionHeading
                    icon={<FileText className="h-4 w-4" />}
                    title="Coordonnées et documents"
                    description="Informations qui peuvent figurer sur les reçus et documents officiels."
                  />
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Téléphone" htmlFor="farm-phone">
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted" aria-hidden="true" />
                          <input
                            id="farm-phone"
                            type="tel"
                            value={phone}
                            onChange={(event) => setFarmField("phone", event.target.value)}
                            placeholder="+229 97 00 00 00"
                            className={`${inputClass} pl-9`}
                          />
                        </div>
                      </Field>
                      <Field label="E-mail de facturation" htmlFor="farm-email">
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted" aria-hidden="true" />
                          <input
                            id="farm-email"
                            type="email"
                            value={email}
                            onChange={(event) => setFarmField("email", event.target.value)}
                            placeholder="contact@ferme.bj"
                            className={`${inputClass} pl-9`}
                          />
                        </div>
                      </Field>
                    </div>
                    <Field label="Adresse physique" htmlFor="farm-address">
                      <input
                        id="farm-address"
                        type="text"
                        value={address}
                        onChange={(event) => setFarmField("address", event.target.value)}
                        placeholder="Quartier, rue ou repère"
                        className={inputClass}
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="N° IFU" htmlFor="farm-ifu">
                        <input
                          id="farm-ifu"
                          type="text"
                          value={ifu}
                          onChange={(event) => setFarmField("ifu", event.target.value)}
                          placeholder="Identifiant fiscal unique"
                          className={`${inputClass} font-mono`}
                        />
                      </Field>
                      <Field label="N° RCCM" htmlFor="farm-rccm">
                        <input
                          id="farm-rccm"
                          type="text"
                          value={rccm}
                          onChange={(event) => setFarmField("rccm", event.target.value)}
                          placeholder="Référence au registre du commerce"
                          className={`${inputClass} font-mono`}
                        />
                      </Field>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-6">
                  <h2 className="text-sm font-semibold text-foreground">Devise de référence</h2>
                  <p className="mt-1 text-xs leading-5 text-muted">Utilisée pour les montants enregistrés dans cette exploitation.</p>
                  <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
                    <span className="text-sm font-semibold text-foreground">Franc CFA</span>
                    <span className="rounded-lg bg-surface-muted px-2.5 py-1 font-mono text-xs font-semibold text-muted">XOF</span>
                  </div>
                </section>
              </div>
            </div>

            <div className="flex justify-end border-t border-border pt-4">
              <button
                type="submit"
                disabled={savingFarm}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-xs transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {savingFarm ? "Enregistrement…" : "Enregistrer les modifications"}
              </button>
            </div>
          </form>

          {isOwner && (
            <section className="border-t border-danger/30 pt-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-danger">
                    <AlertTriangle className="h-4 w-4" />
                    Supprimer cette exploitation
                  </h2>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
                    La suppression est définitive et efface les données associées à cette ferme.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmName("");
                    setDeleteError(null);
                    setDeleteModalOpen(true);
                  }}
                  className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-danger/30 px-4 text-xs font-semibold text-danger transition hover:bg-danger-soft"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer l’exploitation
                </button>
              </div>
            </section>
          )}

          <Modal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            title="Suppression définitive de l’exploitation"
          >
            <div className="space-y-4">
              <div className="space-y-1 rounded-xl border border-danger/20 bg-danger-soft p-3.5 text-xs text-danger">
                <p className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Cette action ne peut pas être annulée.
                </p>
                <p className="leading-relaxed">
                  Saisissez le nom exact de l’exploitation pour confirmer sa suppression :{" "}
                  <strong className="font-bold">{activeFarm.name}</strong>
                </p>
              </div>
              {deleteError && (
                <p role="alert" className="rounded-xl border border-danger/20 bg-danger-soft p-2.5 text-xs text-danger">
                  {deleteError}
                </p>
              )}
              <div>
                <label htmlFor="delete-farm-name" className="mb-1 block text-xs font-semibold text-foreground">
                  Nom de confirmation
                </label>
                <input
                  id="delete-farm-name"
                  type="text"
                  value={deleteConfirmName}
                  onChange={(event) => setDeleteConfirmName(event.target.value)}
                  placeholder={activeFarm.name}
                  className={`${inputClass} focus:border-danger focus:ring-danger/15`}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted hover:bg-surface-muted"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={deletingFarm || deleteConfirmName.trim() !== activeFarm.name.trim()}
                  onClick={handleDeleteFarm}
                  className="inline-flex items-center gap-2 rounded-xl bg-danger px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {deletingFarm ? "Suppression…" : "Confirmer la suppression"}
                </button>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </Shell>
  );
}
