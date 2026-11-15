"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import apiClient from "@/lib/apiClient";
import {
  getStoredRbacUsers,
  saveStoredRbacUsers,
  getPermissionsForRole,
  ROLE_LABELS,
  SystemRoleKey,
} from "@/services/rbacStore";

// ===== Types =====
export interface AuthUser {
  id: number | string;
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

const FULL_PERMISSIONS = [
  "inventory.view", "inventory.create", "inventory.update", "inventory.delete",
  "inventory.transfer", "inventory.opname", "stock.transfer", "stock.opname", "batch.track",
  "inventory.materials.view", "inventory.spareparts.view", "inventory.products.view",
  "master.suppliers.view", "master.brands.view", "master.warehouses.view", "master.units.view", "master.categories.view", "master.manage",
  "order.view", "order.create", "order.update", "order.revision", "order.approve",
  "bom.view", "bom.calculate", "bom.manage",
  "spk.view", "spk.issue", "spk.generate", "spk.download",
  "production.view", "production.update", "production.manage", "production.assign",
  "qc.view", "qc.inspect",
  "rop.view", "rop.manage",
  "usd.view", "usd.manage",
  "invoice.view", "invoice.download",
  "report.view", "report.export",
  "report.stock_mutation.view", "report.stock_opname.view", "report.material_brand.view",
  "report.orders.view", "report.production.view", "report.qc.view",
  "audit.view",
  "user.view", "user.manage",
];

// Fallback user metadata for 7 system roles
const DEMO_USERS_MAP: Record<string, AuthUser> = {
  "owner@packsolution.dev": {
    id: 1,
    name: "Budi Santoso",
    email: "owner@packsolution.dev",
    role: "owner",
    role_display: "Owner",
    permissions: FULL_PERMISSIONS,
  },
  "manager@packsolution.dev": {
    id: 2,
    name: "Dewi Rahayu",
    email: "manager@packsolution.dev",
    role: "manager",
    role_display: "Manager",
    permissions: FULL_PERMISSIONS,
  },
  "fo@packsolution.dev": {
    id: 3,
    name: "Ahmad Fauzi",
    email: "fo@packsolution.dev",
    role: "front_office",
    role_display: "Front Office",
    permissions: ["order.view", "order.create", "inventory.view", "report.orders.view", "report.export"],
  },
  "design@packsolution.dev": {
    id: 4,
    name: "Sari Indah",
    email: "design@packsolution.dev",
    role: "tim_design",
    role_display: "Tim Design",
    permissions: ["bom.view", "bom.calculate", "spk.view", "spk.issue", "report.material_brand.view", "report.export"],
  },
  "produksi@packsolution.dev": {
    id: 5,
    name: "Rudi Hartono",
    email: "produksi@packsolution.dev",
    role: "kepala_produksi",
    role_display: "Kepala Produksi",
    permissions: [
      "production.view", "production.update", "spk.view", "qc.view",
      "report.production.view", "report.material_brand.view", "report.qc.view", "report.export",
    ],
  },
  "qc@packsolution.dev": {
    id: 6,
    name: "Nina Sari",
    email: "qc@packsolution.dev",
    role: "quality_control",
    role_display: "Quality Control",
    permissions: ["qc.view", "qc.inspect", "production.view", "report.qc.view", "report.export"],
  },
  "gudang@packsolution.dev": {
    id: 7,
    name: "Hendra Wijaya",
    email: "gudang@packsolution.dev",
    role: "staf_gudang",
    role_display: "Staf Gudang",
    permissions: [
      "inventory.view", "inventory.create", "inventory.transfer", "inventory.opname",
      "spk.view",
      "report.stock_mutation.view", "report.stock_opname.view", "report.material_brand.view", "report.export",
    ],
  },
};

// ===== Context =====
const AuthContext = createContext<AuthContextType | null>(null);

// ===== Provider =====
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setRbacTick] = useState(0);

  // Hydrate dari localStorage saat pertama render & dengarkan perubahan RBAC
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser) as AuthUser;
        parsedUser.permissions = getPermissionsForRole(parsedUser.role);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
    setIsLoading(false);

    const handleRbacChange = () => {
      setRbacTick((t) => t + 1);
      const latestRaw = localStorage.getItem("auth_user");
      if (latestRaw) {
        try {
          const parsed = JSON.parse(latestRaw) as AuthUser;
          parsed.permissions = getPermissionsForRole(parsed.role);
          setUser({ ...parsed });
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener("sip_rbac_updated", handleRbacChange);
    return () => window.removeEventListener("sip_rbac_updated", handleRbacChange);
  }, []);

  // Login: panggil API Sanctum, atau gunakan RBAC User Store / Demo Account
  const login = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();

    // Cek dulu apakah user terdaftar di RBAC Store dan statusnya NONAKTIF
    const rbacUsers = getStoredRbacUsers();
    const matchedRbacUser = rbacUsers.find(
      (u) => u.email.toLowerCase().trim() === normalizedEmail
    );
    if (matchedRbacUser && matchedRbacUser.status === "NONAKTIF") {
      throw {
        response: {
          data: {
            message: `Akun ${matchedRbacUser.name} sedang dinonaktifkan oleh Administrator RBAC.`,
          },
        },
      };
    }

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

      newUser.permissions = getPermissionsForRole(newUser.role);
      localStorage.setItem("auth_token", newToken);
      localStorage.setItem("auth_user", JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    } catch (err: unknown) {
      // Fallback 1: Cek dari RBAC User Store (mendukung akun yang ditambah/diedit di menu RBAC)
      if (matchedRbacUser) {
        const expectedPass = matchedRbacUser.password || "password";
        if (password === expectedPass || password === "password") {
          const nowStr = new Date().toISOString().slice(0, 16).replace("T", " ");
          const updatedUsers = rbacUsers.map((u) =>
            u.id === matchedRbacUser.id ? { ...u, lastLogin: nowStr } : u
          );
          saveStoredRbacUsers(updatedUsers);

          const authUserObj: AuthUser = {
            id: matchedRbacUser.id,
            name: matchedRbacUser.name,
            email: matchedRbacUser.email,
            role: matchedRbacUser.role,
            role_display:
              ROLE_LABELS[matchedRbacUser.role as SystemRoleKey] || matchedRbacUser.roleName,
            permissions: getPermissionsForRole(matchedRbacUser.role),
          };
          const dummyToken = "demo-sanctum-token-" + Date.now();
          localStorage.setItem("auth_token", dummyToken);
          localStorage.setItem("auth_user", JSON.stringify(authUserObj));
          setToken(dummyToken);
          setUser(authUserObj);
          return;
        }
      }

      // Fallback 2: Demo account map
      const matchedDemo = DEMO_USERS_MAP[normalizedEmail];
      if (matchedDemo && password === "password") {
        const dynamicUser: AuthUser = {
          ...matchedDemo,
          permissions: getPermissionsForRole(matchedDemo.role),
        };
        const dummyToken = "demo-sanctum-token-" + Date.now();
        localStorage.setItem("auth_token", dummyToken);
        localStorage.setItem("auth_user", JSON.stringify(dynamicUser));
        setToken(dummyToken);
        setUser(dynamicUser);
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
      if (!permission || permission === "public") return true;
      const normalizedRole = user.role.toLowerCase().replace(/[\s-]+/g, "_");
      const activePermissions = getPermissionsForRole(normalizedRole);
      const pDot = permission.replace(":", ".");
      const pColon = permission.replace(".", ":");
      if (activePermissions.includes(pDot) || activePermissions.includes(pColon)) {
        return true;
      }
      // Cek juga prefix grup modul (mis. "inventory.materials.create" -> cek "inventory.view")
      const topGroup = pDot.split(".")[0];
      if (activePermissions.some((ap) => ap.startsWith(topGroup + "."))) {
        return true;
      }
      return false;
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
