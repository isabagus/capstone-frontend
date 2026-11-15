"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

// =====================================================================
// <Can permission="..."> — pembungkus tombol aksi & menu berbasis RBAC.
// Mengecek izin aktif role pengguna melalui `useAuth().hasPermission`
// yang tersinkronisasi langsung dengan Matriks Hak Akses (RBAC).
// =====================================================================

export function useCan(permission: string | string[]): boolean {
  const { user, hasPermission } = useAuth();
  if (!user) return false;
  if (Array.isArray(permission)) {
    return permission.some((p) => hasPermission(p));
  }
  return hasPermission(permission);
}

interface CanProps {
  permission: string | string[];
  children: ReactNode;
  /** Ditampilkan bila tidak berizin (default: tidak merender apa pun) */
  fallback?: ReactNode;
}

export default function Can({ permission, children, fallback = null }: CanProps) {
  const allowed = useCan(permission);
  return <>{allowed ? children : fallback}</>;
}
