import { apiRequest } from "./client";
import { Contact, ContactType } from "../types";

type ContactPayload = Omit<Contact, "id" | "farmId" | "isActive" | "createdAt" | "updatedAt"> & {
  isActive?: boolean;
};

interface ContactResponse extends Partial<Contact> {
  id: string;
  name: string;
  type?: ContactType;
}

export const contactsApi = {
  list: async (params?: {
    farmId?: string;
    type?: string;
    search?: string;
    onlyActive?: boolean;
  }): Promise<Contact[]> => {
    if (!params?.farmId) return [];
    const q = new URLSearchParams();
    if (params?.type && params.type !== "ALL") q.append("type", params.type);
    if (params?.search) q.append("search", params.search);
    if (params?.onlyActive !== undefined) q.append("onlyActive", String(params.onlyActive));
    const res = await apiRequest<ContactResponse[] | { data?: ContactResponse[] }>(`/farms/${params.farmId}/contacts?${q.toString()}`);
    const rawList = Array.isArray(res) ? res : res.data || [];
    return rawList.map((c) => ({
      id: c.id,
      farmId: c.farmId || params.farmId!,
      name: c.name,
      type: c.type || "CLIENT",
      phone: c.phone,
      email: c.email,
      address: c.address,
      city: c.city,
      notes: c.notes,
      isActive: c.isActive !== undefined ? c.isActive : true,
      createdAt: c.createdAt || new Date().toISOString(),
      updatedAt: c.updatedAt,
    }));
  },

  create: async (
    farmId: string,
    data: ContactPayload
  ): Promise<Contact> => {
    const res = await apiRequest<Contact>(`/farms/${farmId}/contacts`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res;
  },

  get: async (id: string): Promise<Contact> => {
    return apiRequest<Contact>(`/contacts/${id}`);
  },

  update: async (
    id: string,
    data: ContactPayload
  ): Promise<Contact> => {
    const res = await apiRequest<Contact>(`/contacts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res;
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest<void>(`/contacts/${id}`, {
      method: "DELETE",
    });
  },
};
