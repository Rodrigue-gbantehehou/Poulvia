import { apiRequest } from "./client";

export interface SuperAdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: string[];
  adminRole?: {
    id: string;
    name: string;
    code: string;
  } | null;
  adminPermissions?: string[];
}

export const authApi = {
  /**
   * Authentification auprès du firewall Lexik JWT Symfony
   */
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<{ token: string }> => {
    return apiRequest<{ token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  requestPasswordReset: async (email: string): Promise<{ message: string; devCode?: string }> => {
    const response = await apiRequest<{
      data?: { message?: string; devCode?: string };
    }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ identifier: email.trim(), channel: "email" }),
    });

    return {
      message: response.data?.message ?? "Si un compte correspond à cette adresse, un code vient de lui être envoyé.",
      devCode: response.data?.devCode,
    };
  },

  resetPassword: async (payload: {
    email: string;
    code: string;
    newPassword: string;
  }): Promise<void> => {
    await apiRequest("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        identifier: payload.email.trim(),
        code: payload.code.trim(),
        newPassword: payload.newPassword,
      }),
    });
  },

  /**
   * Récupération du profil connecté et validation des rôles
   */
  me: async (): Promise<SuperAdminUser> => {
    const res = await apiRequest<{ data: SuperAdminUser }>("/api/auth/me");
    return res.data;
  },
};
