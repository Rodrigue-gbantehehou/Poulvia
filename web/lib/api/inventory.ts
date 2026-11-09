import { apiRequest } from "./client";
import { InventoryCategory, InventoryItem, StockMovement } from "../types";

function normalizeCategory(value: string): InventoryCategory {
  const category = value === "MEDICATION" ? "MEDICINE" : value;
  return (["FEED", "VACCINE", "MEDICINE", "EQUIPMENT", "OTHER"] as const).includes(category as InventoryCategory)
    ? (category as InventoryCategory)
    : "OTHER";
}

interface InventoryResponse {
  id: string;
  farmId?: string;
  name: string;
  code?: string | null;
  sku?: string | null;
  category: string;
  customCategory?: string | null;
  unit: string;
  unitLabel?: string;
  unitShortLabel?: string;
  packageWeightKg?: number | null;
  alertThreshold?: number;
  minThreshold?: number;
  currentStock?: number;
  unitPrice?: number;
  unitCostFcfa?: number;
  estimatedTotalValue?: number;
  notes?: string | null;
  isActive?: boolean;
  isLowStock?: boolean;
  movements?: InventoryMovementResponse[];
}

interface InventoryMovementResponse {
  id: string;
  itemId?: string;
  itemName?: string;
  itemCategory?: string;
  type: StockMovement["type"];
  quantity: number;
  unit?: string;
  unitLabel?: string;
  unitShortLabel?: string;
  unitPrice?: number;
  unitPriceFcfa?: number;
  totalCost?: number;
  movementDate?: string;
  date?: string;
  reason?: string | null;
  flock?: StockMovement["flock"];
  recordedBy?: StockMovement["recordedBy"];
  createdAt: string;
}

interface CreateInventoryInput {
  farmId: string;
  name: string;
  sku?: string;
  category?: string;
  customCategory?: string;
  unit?: string;
  packageWeightKg?: number;
  initialStock?: number;
  currentStock?: number;
  alertThreshold?: number;
  minThreshold?: number;
  unitPrice?: number;
  unitCostFcfa?: number;
  notes?: string;
}

interface InventoryMovementInput {
  type?: string;
  quantity: number;
  unit?: string;
  movementDate?: string;
  date?: string;
  unitPrice?: number;
  unitPriceFcfa?: number;
  flockId?: string;
  reason?: string;
}

export const inventoryApi = {
  listItems: async (params?: { farmId?: string; category?: string; lowStockOnly?: boolean }) => {
    if (!params?.farmId) return [];
    const q = new URLSearchParams();
    if (params?.category && params.category !== "ALL") q.append("category", params.category);
    if (params?.lowStockOnly) q.append("lowStock", "true");
    const res = await apiRequest<InventoryResponse[]>(`/farms/${params.farmId}/inventory?${q.toString()}`);
    return (res || []).map((i) => ({
      id: i.id,
      farmId: params.farmId!,
      name: i.name,
      sku: i.code || i.sku || (i.name ? i.name.slice(0, 4).toUpperCase() : "ART"),
      category: normalizeCategory(i.category),
      customCategory: i.customCategory || undefined,
      unit: i.unit,
      packageWeightKg: i.packageWeightKg ? Number(i.packageWeightKg) : undefined,
      minThreshold: i.alertThreshold !== undefined ? i.alertThreshold : (i.minThreshold || 0),
      currentStock: i.currentStock || 0,
      unitCostFcfa: i.unitPrice !== undefined ? i.unitPrice : (i.unitCostFcfa || 0),
      notes: i.notes,
      isLowStock: i.isLowStock,
    }));
  },

  createItem: async (data: CreateInventoryInput) => {
    let category = data.category || "FEED";
    if (category === "MEDICINE") category = "MEDICATION";

    let unit = data.unit || "BAG_50KG";
    const u = String(unit).toLowerCase().trim();
    if (u === "bag" || u === "sac") unit = "BAG";
    else if (u.includes("50") || u.includes("sac 50")) unit = "BAG_50KG";
    else if (u.includes("25") || u.includes("sac 25")) unit = "BAG_25KG";
    else if (u.includes("kg") || u.includes("kilo")) unit = "KG";
    else if (u === "g" || u.includes("gramme")) unit = "G";
    else if (u === "t" || u.includes("tonne")) unit = "TON";
    else if (u.includes("dose") || u.includes("vaccin")) unit = "DOSE";
    else if (u.includes("flacon") || u.includes("vial")) unit = "VIAL";
    else if (u.includes("sachet")) unit = "SACHET";
    else if (u.includes("ml") || u.includes("milli")) unit = "ML";
    else if (u.includes("l") || u.includes("litre") || u.includes("liter")) unit = "LITER";
    else if (
      ["BAG", "BAG_50KG", "BAG_25KG", "KG", "G", "TON", "DOSE", "VIAL", "SACHET", "LITER", "ML", "UNIT"].includes(unit)
    ) {
      // valid
    } else {
      unit = "UNIT";
    }

    const payload = {
      name: data.name,
      code: data.sku || undefined,
      category,
      customCategory: data.customCategory || undefined,
      unit,
      packageWeightKg: data.packageWeightKg ? Number(data.packageWeightKg) : undefined,
      initialStock: Number(data.initialStock !== undefined ? data.initialStock : (data.currentStock || 0)),
      alertThreshold: Number(data.alertThreshold !== undefined ? data.alertThreshold : (data.minThreshold || 0)),
      unitPrice: Number(data.unitPrice !== undefined ? data.unitPrice : (data.unitCostFcfa || 0)),
      notes: data.notes || undefined,
    };

    return apiRequest<InventoryItem>(`/farms/${data.farmId}/inventory`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  addMovement: async (itemId: string, movement: InventoryMovementInput) => {
    let unit = movement.unit;
    if (
      !unit ||
      !["BAG_50KG", "BAG_25KG", "KG", "G", "TON", "DOSE", "VIAL", "SACHET", "LITER", "ML", "UNIT"].includes(unit)
    ) {
      unit = undefined;
    }

    let type = movement.type || "FEEDING";
    if (type === "OUT") type = "FEEDING";
    else if (type === "IN") type = "INCOMING";

    const payload = {
      type,
      quantity: Number(movement.quantity),
      movementDate: movement.movementDate || movement.date || new Date().toISOString().split("T")[0],
      unit,
      unitPrice: movement.unitPrice
        ? Number(movement.unitPrice)
        : movement.unitPriceFcfa
        ? Number(movement.unitPriceFcfa)
        : undefined,
      flockId: movement.flockId || undefined,
      reason: movement.reason || undefined,
    };
    return apiRequest<StockMovement>(`/inventory/${itemId}/movements`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  get: async (id: string): Promise<InventoryItem & { movements?: StockMovement[] }> => {
    const i = await apiRequest<InventoryResponse>(`/inventory/${id}`);
    return {
      id: i.id,
      name: i.name,
      sku: i.code || i.sku || (i.name ? i.name.slice(0, 4).toUpperCase() : "ART"),
      farmId: i.farmId || "",
      category: normalizeCategory(i.category),
      customCategory: i.customCategory || undefined,
      unit: i.unit,
      unitLabel: i.unitLabel,
      unitShortLabel: i.unitShortLabel,
      packageWeightKg: i.packageWeightKg ? Number(i.packageWeightKg) : undefined,
      minThreshold: i.alertThreshold !== undefined ? i.alertThreshold : (i.minThreshold || 0),
      currentStock: i.currentStock || 0,
      unitCostFcfa: i.unitPrice !== undefined ? i.unitPrice : (i.unitCostFcfa || 0),
      totalValueFcfa: i.estimatedTotalValue,
      notes: i.notes,
      isActive: i.isActive !== undefined ? i.isActive : true,
      isLowStock: i.isLowStock,
      movements: (i.movements || []).filter((m) => Boolean(m.movementDate || m.date)).map((m) => ({
        id: m.id,
        itemId: i.id,
        itemName: i.name,
        type: m.type,
        quantity: m.quantity,
        unit: m.unit,
        unitLabel: m.unitLabel,
        unitShortLabel: m.unitShortLabel,
        unitPriceFcfa: Number(m.unitPrice || 0),
        totalCostFcfa: Number(m.totalCost || 0),
        reason: m.reason,
        date: m.movementDate || m.date!,
        flock: m.flock,
        recordedBy: m.recordedBy,
        createdAt: m.createdAt,
      })),
    };
  },

  update: async (
    id: string,
    data: {
      name?: string;
      category?: string;
      customCategory?: string | null;
      unit?: string;
      packageWeightKg?: number | null;
      alertThreshold?: number;
      minThreshold?: number;
      unitPrice?: number;
      unitCostFcfa?: number;
      notes?: string | null;
      isActive?: boolean;
    }
  ): Promise<InventoryItem> => {
    const payload: {
      name?: string;
      category?: string;
      customCategory?: string | null;
      unit?: string;
      packageWeightKg?: number;
      clearPackageWeight?: boolean;
      alertThreshold?: number;
      unitPrice?: number;
      notes?: string | null;
      isActive?: boolean;
    } = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.category !== undefined) payload.category = data.category === "MEDICINE" ? "MEDICATION" : data.category;
    if (data.customCategory !== undefined) payload.customCategory = data.customCategory;
    if (data.unit !== undefined) payload.unit = data.unit;
    if (data.packageWeightKg !== undefined) {
      if (data.packageWeightKg === null || data.packageWeightKg === 0) {
        // Effacement explicite du poids de conditionnement personnalisé
        payload.clearPackageWeight = true;
      } else {
        payload.packageWeightKg = Number(data.packageWeightKg);
      }
    }
    if (data.alertThreshold !== undefined) payload.alertThreshold = Number(data.alertThreshold);
    else if (data.minThreshold !== undefined) payload.alertThreshold = Number(data.minThreshold);
    if (data.unitPrice !== undefined) payload.unitPrice = Number(data.unitPrice);
    else if (data.unitCostFcfa !== undefined) payload.unitPrice = Number(data.unitCostFcfa);
    if (data.notes !== undefined) payload.notes = data.notes;
    if (data.isActive !== undefined) payload.isActive = data.isActive;

    const res = await apiRequest<InventoryItem>(`/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res;
  },

  listMovements: async (itemId: string): Promise<StockMovement[]> => {
    const res = await apiRequest<InventoryMovementResponse[] | { data?: InventoryMovementResponse[] }>(`/inventory/${itemId}/movements`);
    const rawList = Array.isArray(res) ? res : res?.data || [];
    return rawList.filter((m) => Boolean(m.movementDate || m.date)).map((m) => ({
      id: m.id,
      itemId,
      type: m.type,
      quantity: m.quantity,
      unit: m.unit,
      unitLabel: m.unitLabel,
      unitShortLabel: m.unitShortLabel,
      unitPriceFcfa: Number(m.unitPrice || 0),
      totalCostFcfa: Number(m.totalCost || 0),
      reason: m.reason,
      date: m.movementDate || m.date!,
      flock: m.flock,
      recordedBy: m.recordedBy,
      createdAt: m.createdAt,
    }));
  },

  listFarmMovements: async (
    farmId: string,
    params?: { type?: string; itemId?: string; flockId?: string; sort?: string; limit?: number }
  ): Promise<StockMovement[]> => {
    const q = new URLSearchParams();
    if (params?.type && params.type !== "ALL") q.append("type", params.type);
    if (params?.itemId) q.append("itemId", params.itemId);
    if (params?.flockId) q.append("flockId", params.flockId);
    if (params?.sort) q.append("sort", params.sort);
    if (params?.limit) q.append("limit", String(params.limit));

    const res = await apiRequest<InventoryMovementResponse[] | { data?: InventoryMovementResponse[] }>(`/farms/${farmId}/inventory/movements?${q.toString()}`);
    const rawList = Array.isArray(res) ? res : res?.data || [];
    return rawList.filter((m) => Boolean(m.movementDate || m.date)).map((m) => ({
      id: m.id,
      itemId: m.itemId || "",
      itemName: m.itemName || "Article",
      itemCategory: m.itemCategory || "FEED",
      type: m.type,
      quantity: Number(m.quantity || 0),
      unit: m.unit,
      unitLabel: m.unitLabel,
      unitShortLabel: m.unitShortLabel,
      unitPriceFcfa: Number(m.unitPrice || 0),
      totalCostFcfa: Number(m.totalCost || 0),
      reason: m.reason,
      date: m.movementDate || m.date!,
      flock: m.flock,
      recordedBy: m.recordedBy,
      createdAt: m.createdAt,
    }));
  },
};
