"use client";

import type { ReactNode } from "react";

// =====================================================================
// <Can permission="..."> — pembungkus tombol aksi & menu.
//
// FASE SAAT INI: selalu mengizinkan (return true).
// FASE AKHIR (RBAC): ganti isi `useCan` dengan pengecekan
//   `useAuth().hasPermission(permission)` atau matriks role-permission
//   dari backend. Seluruh tombol yang sudah dibungkus otomatis ikut.
//
// Konvensi nama permission: "<grup>.<modul>.<aksi>"
//   mis. "inventory.materials.create", "master.suppliers.deactivate",
//        "category.products.delete", "inventory.materials.transfer"
// =====================================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useCan(permission: string | string[]): boolean {
  // TODO(RBAC): implementasi pengecekan permission sebenarnya.
  return true;
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
