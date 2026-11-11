"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  HeartPulse,
  Plus,
  Zap,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Syringe,
  Pill,
  Droplet,
  Sparkles,
  ShieldAlert,
  Trash2,
  Check,
  Coins,
  AlertCircle,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { api } from "@/lib/api-client";
import {
  Flock,
  HealthTreatment,
  HealthTreatmentType,
  AdministrationMethod,
  InventoryItem,
} from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";
import { ModuleLockedState } from "@/components/ui/module-locked-state";

export default function HealthPage() {
  const { activeFarm, hasModule, hasPermission, isOwner } = useAuth();
  const { toast } = useToast();

  const canViewHealth = hasModule("health") &&
    (hasPermission("health:view") || hasPermission("health:manage") || isOwner);
  const canViewFlocks = hasModule("flocks") &&
    (hasPermission("flock:read") || hasPermission("flock:view") || isOwner);
  const canViewInventory = hasModule("inventory") &&
    (hasPermission("inventory:read") || hasPermission("inventory:view") || isOwner);
  const canManageHealth = hasPermission("health:manage") || hasPermission("health:create") || isOwner;
  const canDeleteHealth = hasPermission("health:delete") || hasPermission("health:manage") || isOwner;

  const [treatments, setTreatments] = useState<HealthTreatment[]>([]);
  const [flocks, setFlocks] = useState<Flock[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [meta, setMeta] = useState<{ totalItems: number; overdueCount: number; upcomingCount: number }>({
    totalItems: 0,
    overdueCount: 0,
    upcomingCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const showLoading = isLoading && Boolean(activeFarm?.id && hasModule("health"));

  // Filtres
  const [selectedFlockId, setSelectedFlockId] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Modale Nouveau Soin
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createFlockId, setCreateFlockId] = useState("");
  const [createTitle, setCreateTitle] = useState("");
  const [createType, setCreateType] = useState<HealthTreatmentType>("VACCINATION");
  const [createCustomType, setCreateCustomType] = useState("");
  const [createMethod, setCreateMethod] = useState<AdministrationMethod>("DRINKING_WATER");
  const [createCustomMethod, setCreateCustomMethod] = useState("");
  const [createScheduledDate, setCreateScheduledDate] = useState("");
  const [createTargetAgeDays, setCreateTargetAgeDays] = useState<number | string>("");
  const [createInventoryItemId, setCreateInventoryItemId] = useState("");
  const [createQuantityUsed, setCreateQuantityUsed] = useState("");
  const [createCostFcfa, setCreateCostFcfa] = useState<number | string>("");
  const [createVeterinarian, setCreateVeterinarian] = useState("");
  const [createNotes, setCreateNotes] = useState("");
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Modale Génération Programme Automatique
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [programError, setProgramError] = useState<string | null>(null);
  const [programFlockId, setProgramFlockId] = useState("");
  const [programType, setProgramType] = useState("AUTO");
  const [generatingProgram, setGeneratingProgram] = useState(false);

  // Modale Valider l'administration
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<HealthTreatment | null>(null);
  const [completeDate, setCompleteDate] = useState("");
  const [completeCostFcfa, setCompleteCostFcfa] = useState<number | string>("");
  const [completeQuantityUsed, setCompleteQuantityUsed] = useState("");
  const [completeVeterinarian, setCompleteVeterinarian] = useState("");
  const [completeNotes, setCompleteNotes] = useState("");
  const [completeInventoryItemId, setCompleteInventoryItemId] = useState("");
  const [completeDeductStock, setCompleteDeductStock] = useState(true);
  const [submittingComplete, setSubmittingComplete] = useState(false);

  const loadData = useCallback(async () => {
    if (!activeFarm?.id || !canViewHealth) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(false);
    try {
      const treatmentsRes = await api.health.list(activeFarm.id, {
          flockId: selectedFlockId !== "ALL" ? selectedFlockId : undefined,
          status: selectedStatus !== "ALL" ? selectedStatus : undefined,
        });
      const [flocksResult, itemsResult] = await Promise.allSettled([
        canViewFlocks ? api.flocks.list({ farmId: activeFarm.id }) : Promise.resolve([]),
        canViewInventory ? api.inventory.listItems({ farmId: activeFarm.id }) : Promise.resolve([]),
      ]);
      const flocksRes = flocksResult.status === "fulfilled" ? flocksResult.value : [];
      const itemsRes = itemsResult.status === "fulfilled" ? itemsResult.value : [];

      setTreatments(treatmentsRes.data || []);
      setMeta(treatmentsRes.meta || { totalItems: 0, overdueCount: 0, upcomingCount: 0 });
      setFlocks(flocksRes || []);
      setInventoryItems(itemsRes || []);

      if (flocksRes?.length > 0 && !createFlockId) {
        setCreateFlockId(flocksRes[0].id);
        setProgramFlockId(flocksRes[0].id);
      }
    } catch (err) {
      console.error("Erreur chargement données santé:", err);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [activeFarm, canViewHealth, canViewFlocks, canViewInventory, selectedFlockId, selectedStatus, createFlockId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  function handleOpenCreateModal() {
    setCreateTitle("");
    setCreateType("VACCINATION");
    setCreateMethod("DRINKING_WATER");
    setCreateScheduledDate(new Date().toISOString().split("T")[0]);
    setCreateTargetAgeDays("");
    setCreateInventoryItemId("");
    setCreateQuantityUsed("");
    setCreateCostFcfa("");
    setCreateVeterinarian("");
    setCreateNotes("");
    if (flocks.length > 0 && !createFlockId) {
      setCreateFlockId(flocks[0].id);
    }
    setCreateModalOpen(true);
  }

  async function handleCreateTreatment(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    if (!activeFarm?.id || !createFlockId || !createTitle || !createScheduledDate) {
      const msg = "Veuillez remplir les champs obligatoires (bande, titre, date prévue).";
      setCreateError(msg);
      toast.warning(msg);
      return;
    }

    setSubmittingCreate(true);
    try {
      await api.health.create(activeFarm.id, {
        flockId: createFlockId,
        title: createTitle,
        type: createType,
        administrationMethod: createMethod,
        scheduledDate: createScheduledDate,
        targetAgeDays: createTargetAgeDays !== "" ? Number(createTargetAgeDays) : undefined,
        inventoryItemId: createInventoryItemId || undefined,
        quantityUsed: createQuantityUsed || undefined,
        costFcfa: createCostFcfa !== "" ? Number(createCostFcfa) : undefined,
        veterinarian: createVeterinarian || undefined,
        notes: [
          createType === "OTHER" && createCustomType ? `Intervention: ${createCustomType.trim()}` : "",
          createMethod === "OTHER" && createCustomMethod ? `Méthode: ${createCustomMethod.trim()}` : "",
          createNotes,
        ].filter(Boolean).join(" | ") || undefined,
      });

      setCreateModalOpen(false);
      setCreateCustomType("");
      setCreateCustomMethod("");
      toast.success("Soin planifié avec succès !");
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la planification du soin.";
      setCreateError(msg);
      toast.error(msg);
    } finally {
      setSubmittingCreate(false);
    }
  }

  async function handleGenerateProgram(e: React.FormEvent) {
    e.preventDefault();
    setProgramError(null);
    if (!activeFarm?.id || !programFlockId) {
      const msg = "Veuillez sélectionner une bande.";
      setProgramError(msg);
      toast.warning(msg);
      return;
    }

    setGeneratingProgram(true);
    try {
      const res = await api.health.generateProgram(activeFarm.id, {
        flockId: programFlockId,
        programType: programType !== "AUTO" ? programType : undefined,
      });

      toast.success(`${res.length} interventions programmées avec succès pour cette bande !`);
      setProgramModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la génération du programme.";
      setProgramError(msg);
      toast.error(msg);
    } finally {
      setGeneratingProgram(false);
    }
  }

  function handleOpenComplete(t: HealthTreatment) {
    setSelectedTreatment(t);
    setCompleteDate(new Date().toISOString().split("T")[0]);
    setCompleteCostFcfa(t.costFcfa || "");
    setCompleteQuantityUsed(t.quantityUsed || "");
    setCompleteVeterinarian(t.veterinarian || "");
    setCompleteNotes(t.notes || "");
    setCompleteInventoryItemId(t.inventoryItem?.id || "");
    setCompleteDeductStock(true);
    setCompleteModalOpen(true);
  }

  async function handleCompleteTreatment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTreatment) return;

    setSubmittingComplete(true);
    try {
      await api.health.complete(selectedTreatment.id, {
        administeredDate: completeDate,
        costFcfa: completeCostFcfa !== "" ? Number(completeCostFcfa) : undefined,
        quantityUsed: completeQuantityUsed || undefined,
        veterinarian: completeVeterinarian || undefined,
        notes: completeNotes || undefined,
        inventoryItemId: completeInventoryItemId || undefined,
        deductFromStock: completeDeductStock,
      });

      setCompleteModalOpen(false);
      toast.success("Administration du soin validée avec succès !");
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la validation du soin.";
      setCompleteError(msg);
      toast.error(msg);
    } finally {
      setSubmittingComplete(false);
    }
  }

  async function handleDeleteTreatment(id: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette intervention ?")) return;
    try {
      await api.health.delete(id);
      toast.success("Intervention supprimée avec succès.");
      await loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression.");
    }
  }

  // Filtrage local additionnel
  const filteredTreatments = treatments.filter((t) => {
    if (selectedType !== "ALL" && t.type !== selectedType) return false;
    return true;
  });

  // Calculs synthétiques
  const completedCount = treatments.filter((t) => t.status === "COMPLETED").length;
  const totalCost = treatments.reduce((acc, t) => acc + (t.costFcfa || 0), 0);
  const activeFilterCount = [selectedStatus !== "ALL", selectedFlockId !== "ALL", selectedType !== "ALL"].filter(Boolean).length;

  if (!hasModule("health")) {
    return (
      <Shell>
        <ModuleLockedState
          moduleName="Santé & Vaccins"
          description="Le suivi des soins et interventions sanitaires n'est pas inclus dans votre formule actuelle."
        />
      </Shell>
    );
  }

  if (!canViewHealth) {
    return (
      <Shell>
        <div className="mx-auto max-w-lg py-16 text-center" role="alert">
          <h1 className="text-xl font-semibold text-foreground">Accès non autorisé</h1>
          <p className="mt-2 text-sm text-muted">Votre rôle ne permet pas de consulter le suivi sanitaire de cette exploitation.</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-3.5 sm:space-y-4">
        {/* En-tête mobile natif */}
        <PageHeader
          title="Santé & Soins"
          mobileTitle="Santé"
          inlineOnMobile
          subtitle={loadError ? "Données momentanément indisponibles" : `${meta.totalItems} soin(s) planifié(s)`}
          icon={<HeartPulse className="h-4 w-4 text-accent" />}
          actions={
            canManageHealth && (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-hover active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nouveau soin</span>
              </button>
            )
          }
        />

        {/* Cartes KPI */}
        {!loadError && <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          <StatCard
            title="Interventions"
            value={meta.totalItems}
            icon={<Calendar className="h-5 w-5" />}
            accent="sky"
          />
          <StatCard
            title="En retard"
            value={meta.overdueCount}
            subtitle={meta.overdueCount > 0 ? "Action requise" : undefined}
            icon={<AlertTriangle className="h-5 w-5" />}
            accent={meta.overdueCount > 0 ? "rose" : "zinc"}
          />
          <StatCard
            title="Administrés"
            value={completedCount}
            subtitle={meta.totalItems > 0 ? `${Math.round((completedCount / meta.totalItems) * 100)}% réalisé` : undefined}
            icon={<CheckCircle2 className="h-5 w-5" />}
            accent="primary"
          />
          <StatCard
            title="Coût des soins"
            value={totalCost > 0 ? `${formatNumber(totalCost)} F` : "0 F"}
            icon={<Coins className="h-5 w-5" />}
            accent="amber"
          />
        </div>}

        {!loadError && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-foreground">Interventions</p>
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-foreground hover:bg-surface-hover"
              >
                <Filter className="h-3.5 w-3.5 text-primary" />
                Filtres{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </button>
            </div>

            {filtersOpen && (
              <div className="grid grid-cols-1 gap-2 rounded-xl border border-border bg-surface p-3 sm:grid-cols-3">
                <label className="space-y-1 text-[11px] font-semibold text-muted">
                  Statut
                  <select
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden"
                  >
                    <option value="ALL">Tous les statuts</option>
                    <option value="SCHEDULED">À venir</option>
                    <option value="COMPLETED">Administrés</option>
                    <option value="MISSED">En retard</option>
                  </select>
                </label>

                {flocks.length > 1 && (
                  <label className="space-y-1 text-[11px] font-semibold text-muted">
                    Bande
                    <select
                      value={selectedFlockId}
                      onChange={(event) => setSelectedFlockId(event.target.value)}
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden"
                    >
                      <option value="ALL">Toutes les bandes</option>
                      {flocks.map((flock) => <option key={flock.id} value={flock.id}>{flock.name}</option>)}
                    </select>
                  </label>
                )}

                <label className="space-y-1 text-[11px] font-semibold text-muted">
                  Type de soin
                  <select
                    value={selectedType}
                    onChange={(event) => setSelectedType(event.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden"
                  >
                    <option value="ALL">Tous les types</option>
                    <option value="VACCINATION">Vaccination</option>
                    <option value="TREATMENT">Traitement</option>
                    <option value="DEWORMING">Déparasitage</option>
                    <option value="VITAMIN">Vitamine</option>
                    <option value="DISINFECTION">Désinfection</option>
                  </select>
                </label>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus("ALL");
                      setSelectedFlockId("ALL");
                      setSelectedType("ALL");
                    }}
                    className="justify-self-start text-xs font-semibold text-primary hover:underline sm:col-span-3"
                  >
                    Effacer les filtres
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Liste des interventions */}
        {showLoading ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-surface">
            <div className="flex items-center gap-3 text-muted">
              <Clock className="h-5 w-5 animate-spin text-accent" />
              <span>Chargement du suivi sanitaire...</span>
            </div>
          </div>
        ) : loadError ? (
          <div role="alert" className="flex flex-col gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-danger">Impossible de charger le suivi sanitaire. Aucune donnée n’a été remplacée par un état vide.</p>
            <button type="button" onClick={() => void loadData()} disabled={isLoading} className="min-h-10 rounded-control border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-hover disabled:opacity-60">
              {isLoading ? "Chargement…" : "Réessayer"}
            </button>
          </div>
        ) : filteredTreatments.length === 0 ? (
          <EmptyState
            title="Aucune intervention sanitaire trouvée"
            description="Enregistrez un soin ou une intervention pour commencer le suivi sanitaire de votre ferme."
            actionLabel={canManageHealth ? "Créer une intervention" : undefined}
            onAction={handleOpenCreateModal}
          />
        ) : (
          <div className="space-y-3">
            {filteredTreatments.map((t) => {
              const isScheduled = t.status === "SCHEDULED";
              const isCompleted = t.status === "COMPLETED";

              // Style badges
              const typeIcon = {
                VACCINATION: Syringe,
                TREATMENT: Pill,
                DEWORMING: Droplet,
                VITAMIN: Sparkles,
                DISINFECTION: ShieldAlert,
                OTHER: HeartPulse,
              }[t.type] || HeartPulse;

              const TypeIconComp = typeIcon;

              return (
                <div
                  key={t.id}
                  className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between transition-all ${
                    t.isOverdue
                      ? "border-danger/40 bg-danger/5 shadow-sm"
                      : isCompleted
                      ? "border-border bg-surface/60 opacity-90"
                      : "border-border bg-surface hover:border-primary/30 shadow-sm"
                  }`}
                >
                  {/* Gauche : Infos principales */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                        t.type === "VACCINATION"
                          ? "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/40 dark:bg-purple-950/30 dark:text-purple-300"
                          : t.type === "VITAMIN"
                          ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300"
                          : t.type === "DEWORMING"
                          ? "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900/40 dark:bg-cyan-950/30 dark:text-cyan-300"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                      }`}
                    >
                      <TypeIconComp className="h-5 w-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground text-base">
                          {t.title}
                        </span>

                        {t.isOverdue && (
                          <Badge variant="danger" size="sm">
                            ⚠️ En retard
                          </Badge>
                        )}

                        {isCompleted && (
                          <Badge variant="success" size="sm">
                            ✓ Administré
                          </Badge>
                        )}

                        {!t.isOverdue && isScheduled && (
                          <Badge variant="info" size="sm">
                            Planifié
                          </Badge>
                        )}

                        <Badge variant="neutral" size="sm">
                          {t.typeLabel}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                        <span className="font-medium text-foreground">
                          Bande : {t.flock?.name} ({t.flock?.code || "Lot"})
                        </span>
                        <span>•</span>
                        <span>Âge cible : <strong className="text-foreground">J{t.targetAgeDays}</strong></span>
                        <span>•</span>
                        <span>Mode : {t.administrationMethodLabel}</span>
                        {t.veterinarian && (
                          <>
                            <span>•</span>
                            <span>Véto : {t.veterinarian}</span>
                          </>
                        )}
                        {t.costFcfa !== null && t.costFcfa !== undefined && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-foreground">
                              {formatNumber(t.costFcfa)} FCFA
                            </span>
                          </>
                        )}
                      </div>

                      {t.notes && (
                        <p className="mt-1 text-xs text-muted/90 italic">
                          &quot;{t.notes}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Droite : Dates & Actions */}
                  <div className="flex shrink-0 flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                    <div className="text-right text-xs">
                      <div className="text-muted">Prévu le :</div>
                      <div className="font-semibold text-foreground">
                        {formatDate(t.scheduledDate)}
                      </div>
                      {t.administeredDate && (
                        <div className="text-[11px] text-success">
                          Fait le {formatDate(t.administeredDate)}
                        </div>
                      )}
                    </div>

                    {(canManageHealth || canDeleteHealth) && (
                      <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-border/60">
                        {isScheduled && canManageHealth && (
                          <button
                            type="button"
                            onClick={() => handleOpenComplete(t)}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-success px-3.5 py-2.5 sm:py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-success-hover active:scale-95 transition-all cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Valider
                          </button>
                        )}

                        {canDeleteHealth && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTreatment(t.id)}
                            className="rounded-lg border border-border p-2 sm:p-1.5 text-muted hover:border-danger hover:text-danger active:scale-95 transition-all cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODALE 1 : PLANIFIER UN SOIN */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Planifier un soin"
        description="Vaccin ou traitement"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateTreatment} className="space-y-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Bande *
              </label>
              <select
                value={createFlockId}
                onChange={(e) => setCreateFlockId(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                {flocks.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.currentQuantity} têtes)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Titre du soin *
              </label>
              <input
                type="text"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                placeholder="Ex: Vaccin Gumboro J7"
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Catégorie de soin *
              </label>
              <select
                value={createType}
                onChange={(e) => setCreateType(e.target.value as HealthTreatmentType)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="VACCINATION">Vaccination</option>
                <option value="TREATMENT">Traitement curatif (antibiotique...)</option>
                <option value="DEWORMING">Déparasitage / Vermifugation</option>
                <option value="VITAMIN">Vitamines & Fortifiants</option>
                <option value="DISINFECTION">Désinfection des locaux</option>
                <option value="OTHER">Autre intervention</option>
              </select>
              {createType === "OTHER" && (
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    value={createCustomType}
                    onChange={(e) => setCreateCustomType(e.target.value)}
                    placeholder="Précisez l'intervention (ex. Épointage, Pesée...)"
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Mode d&apos;administration *
              </label>
              <select
                value={createMethod}
                onChange={(e) => setCreateMethod(e.target.value as AdministrationMethod)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="DRINKING_WATER">Eau de boisson</option>
                <option value="INJECTION">Injection sous-cutanée / musculaire</option>
                <option value="OCULAR_NASAL">Goutte oculaire ou nasale</option>
                <option value="SPRAY">Nébulisation / Spray</option>
                <option value="FEED">Mélange dans l&apos;aliment</option>
                <option value="TOPICAL">Application alaire / cutanée</option>
                <option value="OTHER">Autre méthode</option>
              </select>
              {createMethod === "OTHER" && (
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    value={createCustomMethod}
                    onChange={(e) => setCreateCustomMethod(e.target.value)}
                    placeholder="Précisez la méthode (ex. Sonde, Gavage...)"
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Date prévue *
              </label>
              <input
                type="date"
                value={createScheduledDate}
                onChange={(e) => setCreateScheduledDate(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Âge cible (en jours)
              </label>
              <input
                type="number"
                min="0"
                value={createTargetAgeDays}
                onChange={(e) => {
                  const val = e.target.value;
                  setCreateTargetAgeDays(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                }}
                onFocus={(e) => e.target.select()}
                placeholder="Ex: 7, 14, 21..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Coût estimé (FCFA)
              </label>
              <input
                type="number"
                min="0"
                value={createCostFcfa}
                onChange={(e) => {
                  const val = e.target.value;
                  setCreateCostFcfa(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                }}
                onFocus={(e) => e.target.select()}
                placeholder="0"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Article de stock associé (optionnel)
              </label>
              <select
                value={createInventoryItemId}
                onChange={(e) => setCreateInventoryItemId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">Aucun article lié</option>
                {inventoryItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.currentStock} {item.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Vétérinaire / Opérateur
              </label>
              <input
                type="text"
                value={createVeterinarian}
                onChange={(e) => setCreateVeterinarian(e.target.value)}
                placeholder="Ex: Dr. Dossou / Chef élevage"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Instructions & Remarques
            </label>
            <textarea
              rows={2}
              value={createNotes}
              onChange={(e) => setCreateNotes(e.target.value)}
              placeholder="Ex: Assoiffer les poules 2h avant la distribution dans l'eau..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {createError && (
            <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{createError}</div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setCreateModalOpen(false);
                setCreateError(null);
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submittingCreate}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm"
            >
              {submittingCreate ? "Planification..." : "Planifier l'intervention"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Générateur avancé conservé pour activation sur demande, absent du parcours standard. */}
      {hasModule("prophylaxis_program") && (
      <Modal
        isOpen={programModalOpen}
        onClose={() => setProgramModalOpen(false)}
        title="Programme 1-Clic"
        description="Chronologie vaccinale"
      >
        <form onSubmit={handleGenerateProgram} className="space-y-3.5">
          <div className="rounded-xl border border-accent/25 bg-accent/5 p-2.5 text-xs text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent shrink-0" />
            <span className="text-[11px] text-muted">Génère les vaccins et soins recommandés selon le type de bande.</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Bande *
            </label>
            <select
              value={programFlockId}
              onChange={(e) => setProgramFlockId(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {flocks.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.breed} - {f.currentQuantity} têtes)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Protocole
            </label>
            <select
              value={programType}
              onChange={(e) => setProgramType(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="AUTO">Automatique (selon le type)</option>
              <option value="STANDARD_BROILER">Poulet de chair (45 jours)</option>
              <option value="STANDARD_LAYER">Pondeuses (démarrage à ponte)</option>
            </select>
          </div>

          {programError && (
            <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{programError}</div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setProgramModalOpen(false);
                setProgramError(null);
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={generatingProgram}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm"
            >
              {generatingProgram ? "Génération..." : "Générer"}
            </button>
          </div>
        </form>
      </Modal>
      )}

      {/* MODALE 3 : VALIDER L'ADMINISTRATION D'UN SOIN */}
      <Modal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title="Valider le soin"
        description={selectedTreatment?.title || "Confirmation"}
      >
        <form onSubmit={handleCompleteTreatment} className="space-y-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Date *
              </label>
              <input
                type="date"
                value={completeDate}
                onChange={(e) => setCompleteDate(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Coût réel engagé (FCFA)
              </label>
              <input
                type="number"
                min="0"
                value={completeCostFcfa}
                onChange={(e) => {
                  const val = e.target.value;
                  setCompleteCostFcfa(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                }}
                onFocus={(e) => e.target.select()}
                placeholder="0"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Quantité / Doses utilisées
              </label>
              <input
                type="text"
                value={completeQuantityUsed}
                onChange={(e) => setCompleteQuantityUsed(e.target.value)}
                placeholder="Ex: 1 flacon, 500 ml..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Vétérinaire / Responsable
              </label>
              <input
                type="text"
                value={completeVeterinarian}
                onChange={(e) => setCompleteVeterinarian(e.target.value)}
                placeholder="Ex: Dr. Dossou"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Déduire du stock du magasin
            </label>
            <select
              value={completeInventoryItemId}
              onChange={(e) => setCompleteInventoryItemId(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">Ne pas déduire de stock</option>
              {inventoryItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.currentStock} {item.unit} dispo)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Observations / Numéro de lot
            </label>
            <textarea
              rows={2}
              value={completeNotes}
              onChange={(e) => setCompleteNotes(e.target.value)}
              placeholder="Ex: Lot vaccin #VAC2026-09, bonne prise par les volailles..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {completeError && (
            <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{completeError}</div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setCompleteModalOpen(false);
                setCompleteError(null);
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submittingComplete}
              className="rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white hover:bg-success-hover disabled:opacity-50 transition-colors shadow-sm"
            >
              {submittingComplete ? "Validation..." : "Confirmer l'administration"}
            </button>
          </div>
        </form>
      </Modal>

    </Shell>
  );
}
