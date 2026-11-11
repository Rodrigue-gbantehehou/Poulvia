"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Warehouse,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  Users,
  CheckCircle2,
  Bird,
  AlertCircle,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { CreateBuildingModal } from "@/components/farms/create-building-modal";
import { EditBuildingModal } from "@/components/farms/edit-building-modal";
import { ModuleLockedState } from "@/components/ui/module-locked-state";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api-client";
import { formatNumber } from "@/lib/utils";

interface Building {
  id: string;
  name: string;
  type: "POULTRY_HOUSE" | "BROODER" | "STORAGE" | "OTHER";
  capacity: number;
  surfaceArea?: number | null;
  isActive: boolean;
  createdAt?: string;
}

export default function BuildingsPage() {
  const { activeFarm, hasPermission, hasModule, isOwner } = useAuth();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const canViewBuildings = hasModule("buildings") &&
    (hasPermission("building:manage") || hasPermission("farm:view") || isOwner);

  useEffect(() => {
    if (activeFarm?.id && canViewBuildings) {
      loadBuildings();
    }
  }, [activeFarm?.id, canViewBuildings]);

  async function loadBuildings() {
    if (!activeFarm?.id || !canViewBuildings) return;
    setIsLoading(true);
    setLoadError(false);
    try {
      const data = await api.farms.listBuildings(activeFarm.id);
      setBuildings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement bâtiments:", err);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!activeFarm?.id) return;
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce poulailler / bâtiment ?")) return;
    setDeletingId(id);
    try {
      await api.farms.deleteBuilding(activeFarm.id, id);
      await loadBuildings();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur lors de la suppression du bâtiment.");
    } finally {
      setDeletingId(null);
    }
  }

  const typeLabels: Record<string, string> = {
    POULTRY_HOUSE: "Poulailler de ponte / chair",
    BROODER: "Poussinière (Démarrage)",
    STORAGE: "Magasin d'aliment & Intrants",
    OTHER: "Bâtiment annexe",
  };

  const totalCapacity = buildings.reduce((sum, b) => sum + (Number(b.capacity) || 0), 0);

  if (!hasModule("buildings")) {
    return (
      <Shell>
        <ModuleLockedState
          moduleName="Poulaillers & Bâtiments d'élevage"
          description="La gestion avancée des poulaillers, bâtiments et capacités d'accueil n'est pas incluse dans votre formule actuelle."
        />
      </Shell>
    );
  }

  if (!canViewBuildings) {
    return (
      <Shell>
        <div className="mx-auto max-w-lg py-16 text-center" role="alert">
          <h1 className="text-xl font-semibold text-foreground">Accès non autorisé</h1>
          <p className="mt-2 text-sm text-muted">Votre rôle ne permet pas de consulter les bâtiments de cette exploitation.</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <PageHeader
        title="Poulaillers"
        inlineOnMobile
        subtitle={`${buildings.length} bâtiment(s) enregistrés`}
        icon={<Warehouse className="h-4 w-4" />}
        actions={
          <div className="flex items-center gap-1.5">
            <Link
              href="/flocks"
              className="hidden h-8 items-center justify-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-semibold text-foreground hover:bg-surface-hover shadow-2xs active:scale-95 transition-all sm:inline-flex"
              title="Retour aux bandes d'élevage"
            >
              <Bird className="h-3.5 w-3.5 text-primary" />
              <span>Bandes</span>
            </Link>

            <button
              type="button"
              onClick={loadBuildings}
              title="Actualiser"
              className="hidden h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-xs hover:bg-surface-hover active:scale-95 transition-all sm:inline-flex"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-primary" : "text-muted"}`} />
            </button>

            {(hasPermission("farm:update") || hasPermission("building:create")) && (
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-xs font-bold text-white shadow-xs hover:bg-primary-hover active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nouveau</span>
              </button>
            )}
          </div>
        }
      />

      {loadError && (
        <div role="alert" className="mt-4 flex flex-col gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-sm text-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
            <p>Impossible de charger les bâtiments. Aucune donnée n’a été remplacée par un état vide.</p>
          </div>
          <button type="button" onClick={() => void loadBuildings()} disabled={isLoading} className="min-h-10 rounded-control border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-hover disabled:opacity-60">
            {isLoading ? "Chargement…" : "Réessayer"}
          </button>
        </div>
      )}

      {/* KPI Stats */}
      {!loadError && <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          title="Bâtiments"
          value={buildings.length}
          accent="primary"
          icon={<Warehouse className="h-5 w-5" />}
          className="col-span-2 sm:col-span-1"
        />

        <StatCard
          title="Capacité totale"
          value={`${formatNumber(totalCapacity)} places`}
          accent="amber"
          icon={<Users className="h-5 w-5" />}
        />

        <StatCard
          title="En service"
          value={buildings.filter((b) => b.isActive).length}
          accent="sky"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>}

      {/* Buildings List */}
      {!loadError && <div className="mt-8">
        {buildings.length === 0 ? (
          <EmptyState
            icon={<Warehouse className="h-10 w-10 text-primary" />}
            title="Aucun bâtiment créé"
            description="Créez votre premier poulailler pour y loger vos poussins et suivre vos bandes de volailles."
            actionLabel="Créer un poulailler"
            onAction={() => setCreateModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {buildings.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-border/70 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Warehouse className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">
                          {b.name}
                        </h3>
                        <span className="text-[11px] text-muted block">
                          {typeLabels[b.type] || b.type}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        b.isActive
                          ? "bg-success/15 text-success"
                          : "bg-surface-muted text-muted"
                      }`}
                    >
                      {b.isActive ? "En service" : "Désactivé"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted">Capacité maximale :</span>
                      <span className="font-mono font-bold text-foreground">
                        {formatNumber(b.capacity)} volailles
                      </span>
                    </div>
                    {b.surfaceArea && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted">Superficie :</span>
                        <span className="font-mono text-foreground">
                          {b.surfaceArea} m²
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {(hasPermission("farm:update") || hasPermission("building:update") || hasPermission("building:delete")) && (
                  <div className="mt-5 pt-3 border-t border-border/70 flex items-center justify-end gap-2">
                    {(hasPermission("farm:update") || hasPermission("building:update")) && (
                      <button
                        type="button"
                        onClick={() => setEditingBuilding(b)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-muted px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-hover hover:border-primary/40 transition-colors cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Modifier</span>
                      </button>
                    )}

                    {(hasPermission("farm:update") || hasPermission("building:delete")) && (
                      <button
                        type="button"
                        disabled={deletingId === b.id}
                        onClick={() => handleDelete(b.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-danger/20 bg-danger/10 px-2.5 py-1.5 text-xs font-semibold text-danger hover:bg-danger hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{deletingId === b.id ? "..." : "Supprimer"}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>}

      {/* Modales */}
      <CreateBuildingModal
        key={`${createModalOpen}-${buildings.length}`}
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={loadBuildings}
      />

      {editingBuilding && (
        <EditBuildingModal
          key={editingBuilding.id}
          isOpen={true}
          building={editingBuilding}
          onClose={() => setEditingBuilding(null)}
          onSuccess={loadBuildings}
        />
      )}

    </Shell>
  );
}
