"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Farm, FarmRole, FarmSubscription, User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  activeFarm: Farm | null;
  activePlan: FarmSubscription | null;
  farms: Farm[];
  role: FarmRole | null;
  permissions: string[];
  token: string | null;
  isLoading: boolean;
  isOwner: boolean;
  isSubscriptionOwner: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    farmName?: string;
  }) => Promise<void>;
  logout: () => void;
  switchFarm: (farmId: string) => Promise<void>;
  hasPermission: (permissionKey: string) => boolean;
  hasModule: (moduleKey: string) => boolean;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeFarm, setActiveFarm] = useState<Farm | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [role, setRole] = useState<FarmRole | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("Poulvia_token");
    localStorage.removeItem("Poulvia_active_farm_id");
    setToken(null);
    setUser(null);
    setActiveFarm(null);
    setFarms([]);
    setRole(null);
    setPermissions([]);
    setIsLoading(false);
  }, []);

  const loadCurrentUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.auth.me();
      
      const mappedUser: User = {
        id: res.id,
        email: res.email,
        fullName: res.fullName || `${res.firstName} ${res.lastName}`,
        phone: res.phone || null,
        roles: res.roles || [],
      };
      setUser(mappedUser);

      const mappedFarms: Farm[] = (res.farms || []).map((f) => ({
        id: f.id,
        name: f.name,
        code: f.code,
        productionType: f.productionType,
        location: f.locationCity,
        locationCity: f.locationCity,
        locationCountry: f.locationCountry || "BJ",
        currency: f.currency || "XOF",
        phone: f.phone || null,
        email: f.email || null,
        address: f.address || null,
        ifu: f.ifu || null,
        rccm: f.rccm || null,
        description: f.description || null,
        surfaceAreaM2: f.surfaceAreaM2,
        status: "ACTIVE",
        createdAt: f.createdAt || new Date().toISOString(),
        userRole: f.role,
        roleName: f.roleName,
        permissions: f.permissions || [],
        subscription: f.subscription || null,
      }));
      setFarms(mappedFarms);

      const storedFarmId = localStorage.getItem("Poulvia_active_farm_id");
      const currentFarm =
        mappedFarms.find((f) => f.id === storedFarmId) || mappedFarms[0] || null;
      setActiveFarm(currentFarm);

      if (currentFarm) {
        setRole({
          id: currentFarm.id,
          name: currentFarm.roleName || currentFarm.userRole || "Collaborateur",
          isSystem: true,
          permissions: currentFarm.permissions || [],
          createdAt: new Date().toISOString(),
        });
      }

      // Les permissions retournées par l'API intègrent déjà la formule souscrite pour la ferme active
      if (Array.isArray(currentFarm?.permissions)) {
        const rawPerms: string[] = currentFarm.permissions;
        const permsSet = new Set<string>(rawPerms);
        rawPerms.forEach((p) => {
          if (p.endsWith(":view")) permsSet.add(p.replace(":view", ":read"));
          if (p.endsWith(":read")) permsSet.add(p.replace(":read", ":view"));
          if (p.endsWith(":manage")) {
            const prefix = p.replace(":manage", "");
            permsSet.add(`${prefix}:create`);
            permsSet.add(`${prefix}:update`);
            permsSet.add(`${prefix}:read`);
            permsSet.add(`${prefix}:view`);
          }
        });
        setPermissions(Array.from(permsSet));
      } else {
        setPermissions([]);
      }
    } catch {
      // Invalid or expired token
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedToken = localStorage.getItem("Poulvia_token");
      if (storedToken) {
        setToken(storedToken);
        void loadCurrentUser();
      } else {
        setIsLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadCurrentUser]);

  async function login(credentials: { email: string; password: string }) {
    setIsLoading(true);
    try {
      const res = await api.auth.login({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      });
      localStorage.setItem("Poulvia_token", res.token);
      setToken(res.token);
      await loadCurrentUser();
    } finally {
      setIsLoading(false);
    }
  }

  async function register(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    farmName?: string;
  }) {
    setIsLoading(true);
    try {
      const res = await api.auth.register({
        ...data,
        email: data.email.trim().toLowerCase(),
      });
      localStorage.setItem("Poulvia_token", res.token);
      setToken(res.token);
      await loadCurrentUser();
    } finally {
      setIsLoading(false);
    }
  }

  async function switchFarm(farmId: string) {
    localStorage.setItem("Poulvia_active_farm_id", farmId);
    const target = farms.find((f) => f.id === farmId);
    if (target) {
      setActiveFarm(target);
    }
    await loadCurrentUser();
  }

  const isSubscriptionOwner = Boolean(
    activeFarm?.userRole?.toUpperCase() === "OWNER" ||
    role?.name?.toUpperCase() === "OWNER" ||
    user?.roles?.includes("ROLE_ADMIN") ||
    user?.roles?.includes("ROLE_SUPER_ADMIN")
  );
  const trialExpired = activeFarm?.subscription?.trialExpired === true;
  const isOwner = isSubscriptionOwner;

  function hasModule(moduleKey: string): boolean {
    if (!activeFarm) return false;
    const modules = activeFarm.subscription?.modules;
    if (!Array.isArray(modules)) return false;
    return modules.includes(moduleKey);
  }

  function hasPermission(permissionKey: string): boolean {
    if (!activeFarm) return false;

    // L'essai expiré conserve la consultation, mais aucune permission d'écriture.
    const readOnlyAdministrativePermission = new Set([
      "member:manage",
      "role:manage",
      "building:manage",
    ]).has(permissionKey);
    const writePermission = /:(create|edit|update|delete|movement|manage)$/.test(permissionKey);
    if (trialExpired && writePermission && !readOnlyAdministrativePermission) return false;

    // Le propriétaire de l'exploitation ou administrateur dispose de toutes les permissions opérationnelles
    if (isOwner) return true;

    if (permissions.includes("*")) return true;
    if (permissions.includes(permissionKey)) return true;

    // Normalisation croisée view/read
    if (permissionKey.endsWith(":read") && permissions.includes(permissionKey.replace(":read", ":view"))) return true;
    if (permissionKey.endsWith(":view") && permissions.includes(permissionKey.replace(":view", ":read"))) return true;

    return false;
  }

  async function refreshMe() {
    await loadCurrentUser();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        activeFarm,
        activePlan: activeFarm?.subscription || null,
        farms,
        role,
        permissions,
        token,
        isLoading,
        isOwner,
        isSubscriptionOwner,
        login,
        register,
        logout,
        switchFarm,
        hasPermission,
        hasModule,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
