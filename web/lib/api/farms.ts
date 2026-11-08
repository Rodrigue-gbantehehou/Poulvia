import { apiRequest } from "./client";
import { authApi } from "./auth";
import { Building, Farm } from "../types";

export const farmsApi = {
  list: async (): Promise<Farm[]> => {
    const me = await authApi.me();
    return (me.farms || []).map((f) => ({
      id: f.id,
      name: f.name,
      location: f.locationCity,
      surfaceAreaM2: f.surfaceAreaM2,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      userRole: f.role,
    }));
  },

  create: async (data: {
    name: string;
    productionType?: "LAYER" | "BROILER" | "MIXED";
    locationCity?: string;
    locationCountry?: string;
    code?: string;
  }): Promise<Farm> => {
    const res = await apiRequest<Farm>("/farms", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res;
  },

  get: async (id: string): Promise<Farm> => {
    const res = await apiRequest<Farm>(`/farms/${id}`);
    return res;
  },

  update: async (
    id: string,
    data: {
      name: string;
      productionType?: "LAYER" | "BROILER" | "MIXED";
      locationCity?: string;
      locationCountry?: string;
      code?: string;
      phone?: string;
      email?: string;
      address?: string;
      ifu?: string;
      rccm?: string;
      description?: string;
    }
  ): Promise<Farm> => {
    const res = await apiRequest<Farm>(`/farms/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res;
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest<void>(`/farms/${id}`, {
      method: "DELETE",
    });
  },

  listBuildings: async (
    farmId: string,
    params?: { onlyActive?: boolean },
  ): Promise<Array<Building & { capacity: number; isActive: boolean }>> => {
    const q = new URLSearchParams();
    if (params?.onlyActive !== undefined) q.append("onlyActive", String(params.onlyActive));
    const query = q.toString() ? `?${q.toString()}` : "";
    const res = await apiRequest<Building[]>(`/farms/${farmId}/buildings${query}`);
    const buildingTypes = ["POULTRY_HOUSE", "BROODER", "STORAGE", "OTHER"] as const;
    return (res || []).map((building) => ({
      ...building,
      farmId: building.farmId || farmId,
      type: buildingTypes.includes(building.type as (typeof buildingTypes)[number])
        ? (building.type as (typeof buildingTypes)[number])
        : "OTHER",
      capacity: building.capacity ?? building.capacityBirds ?? 0,
      capacityBirds: building.capacityBirds ?? building.capacity ?? 0,
      isActive: building.isActive ?? true,
    }));
  },

  createBuilding: async (
    farmId: string,
    data: {
      name: string;
      type: "POULTRY_HOUSE" | "BROODER" | "STORAGE" | "OTHER";
      capacity: number;
      surfaceArea?: number;
    }
  ): Promise<Building> => {
    const res = await apiRequest<Building>(`/farms/${farmId}/buildings`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res;
  },

  updateBuilding: async (
    farmId: string,
    buildingId: string,
    data: {
      name?: string;
      type?: "POULTRY_HOUSE" | "BROODER" | "STORAGE" | "OTHER";
      capacity?: number;
      surfaceArea?: number;
      isActive?: boolean;
    }
  ): Promise<Building> => {
    const res = await apiRequest<Building>(`/farms/${farmId}/buildings/${buildingId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res;
  },

  deleteBuilding: async (farmId: string, buildingId: string): Promise<void> => {
    await apiRequest<void>(`/farms/${farmId}/buildings/${buildingId}`, {
      method: "DELETE",
    });
  },
};
