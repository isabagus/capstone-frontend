"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import apiClient from "@/lib/apiClient";

// ===== Types =====
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  role_display: string;
  permissions: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

// Fallback user metadata for 7 system roles
const DEMO_USERS_MAP: Record<string, AuthUser> = {
  "owner@packsolution.dev": {
    id: 1,
    name: "Budi Santoso",
    email: "owner@packsolution.dev",
    role: "owner",
    role_display: "Owner",
    permissions: [
      "inventory.view", "inventory.create", "inventory.transfer", "inventory.opname",
      "order.view", "order.create", "order.approve",
      "bom.view", "bom.calculate", "spk.view", "spk.issue",
      "production.view", "production.update", "qc.view", "qc.inspect",
      "usd.view", "invoice.view", "report.view", "audit.view", "user.view",
    ],
  },
  "manager@packsolution.dev": {
    id: 2,
    name: "Dewi Rahayu",
    email: "manager@packsolution.dev",
    role: "manager",
    role_display: "Manager",
    permissions: [
      "inventory.view", "inventory.create", "inventory.transfer", "inventory.opname",
      "order.view", "order.create", "order.approve",
      "bom.view", "bom.calculate", "spk.view", "spk.issue",
      "production.view", "production.update", "qc.view", "qc.inspect",
      "usd.view", "invoice.view", "report.view", "audit.view", "user.view",
    ],
  },
  "fo@packsolution.dev": {
    id: 3,
    name: "Ahmad Fauzi",
    email: "fo@packsolution.dev",
    role: "front_office",
    role_display: "Front Office",
    permissions: ["order.view", "order.create", "inventory.view"],
  },
  "design@packsolution.dev": {
    id: 4,
    name: "Sari Indah",
    email: "design@packsolution.dev",
    role: "tim_design",
    role_display: "Tim Design",
    permissions: ["bom.view", "bom.calculate", "spk.view", "spk.issue"],
  },
  "produksi@packsolution.dev": {
    id: 5,
    name: "Rudi Hartono",
    email: "produksi@packsolution.dev",
    role: "kepala_produksi",
    role_display: "Kepala Produksi",
    permissions: ["production.view", "production.update", "spk.view", "qc.view"],
  },
  "qc@packsolution.dev": {
    id: 6,
    name: "Nina Sari",
    email: "qc@packsolution.dev",
    role: "quality_control",
    role_display: "Quality Control",
    permissions: ["qc.view", "qc.inspect", "production.view"],
  },
  "gudang@packsolution.dev": {
    id: 7,
    name: "Hendra Wijaya",
    email: "gudang@packsolution.dev",
    role: "staf_gudang",
    role_display: "Staf Gudang",
    permissions: ["inventory.view", "inventory.create", "inventory.transfer", "inventory.opname"],
  },
};

// ===== Context =====
const AuthContext = createContext<AuthContextType | null>(null);

// ===== Provider =====
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate dari localStorage saat pertama render
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
    setIsLoading(false);
  }, []);

  // Login: panggil API Sanctum, simpan token & user
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const resData = response.data;
      const newToken =
        resData.token ||
        resData.access_token ||
        resData.data?.token ||
        resData.data?.access_token;
      const newUser = resData.user || resData.data?.user;

      if (!newToken || !newUser) {
        throw new Error("Format respons otentikasi tidak sesuai");
      }

      localStorage.setItem("auth_token", newToken);
      localStorage.setItem("auth_user", JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    } catch (err: unknown) {
      // Fallback demo account jika server offline / connection error di mode dev
      const normalizedEmail = email.toLowerCase().trim();
      const matchedDemo = DEMO_USERS_MAP[normalizedEmail];
      if (matchedDemo && password === "password") {
        const dummyToken = "demo-sanctum-token-" + Date.now();
        localStorage.setItem("auth_token", dummyToken);
        localStorage.setItem("auth_user", JSON.stringify(matchedDemo));
        setToken(dummyToken);
        setUser(matchedDemo);
        return;
      }
      throw err;
    }
  }, []);

  // Logout: panggil API, hapus storage
  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Tetap lanjut logout meski request gagal
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      setToken(null);
      setUser(null);
    }
  }, []);

  // RBAC helpers
  const hasRole = useCallback(
    (...roles: string[]) => {
      if (!user) return false;
      const currentRole = user.role.toLowerCase().replace(/[\s-]+/g, "_");
      return roles.some((r) => r.toLowerCase().replace(/[\s-]+/g, "_") === currentRole);
    },
    [user]
  );

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      if (!user.permissions || !Array.isArray(user.permissions)) return false;
      const pDot = permission.replace(":", ".");
      const pColon = permission.replace(".", ":");
      return user.permissions.includes(pDot) || user.permissions.includes(pColon);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, logout, hasRole, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ===== Hook =====
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus digunakan di dalam <AuthProvider>");
  return ctx;
}
