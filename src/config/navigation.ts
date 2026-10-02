"use client";

import { useAuth } from "@/contexts/AuthContext";

// Interface NavItem
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  roles: string[];
  permission: string | null;
}

// Navigasi yang tersedia per role (TSK-S1-06: Navigasi Dinamis 7-Role RBAC)
export const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: "🏠",
    roles: ["owner", "manager", "front_office", "tim_design", "kepala_produksi", "quality_control", "staf_gudang"],
    permission: null,
  },
  {
    id: "inventory",
    label: "Inventori Multi-Gudang",
    href: "/dashboard/inventory",
    icon: "📦",
    roles: ["owner", "manager", "staf_gudang"],
    permission: "inventory.view",
  },
  {
    id: "orders",
    label: "Order Pelanggan",
    href: "/dashboard/orders",
    icon: "📋",
    roles: ["owner", "manager", "front_office"],
    permission: "order.view",
  },
  {
    id: "bom",
    label: "BOM Calculator",
    href: "/dashboard/bom",
    icon: "⚙️",
    roles: ["owner", "manager", "tim_design"],
    permission: "bom.view",
  },
  {
    id: "spk",
    label: "SPK Digital",
    href: "/dashboard/spk",
    icon: "📄",
    roles: ["owner", "manager", "tim_design", "kepala_produksi"],
    permission: "spk.view",
  },
  {
    id: "production",
    label: "Kanban Produksi",
    href: "/dashboard/production",
    icon: "🏭",
    roles: ["owner", "manager", "kepala_produksi", "quality_control"],
    permission: "production.view",
  },
  {
    id: "qc",
    label: "Quality Control",
    href: "/dashboard/qc",
    icon: "✅",
    roles: ["owner", "manager", "kepala_produksi", "quality_control"],
    permission: "qc.inspect",
  },
  {
    id: "usd-analytics",
    label: "Kurs USD & Harga",
    href: "/dashboard/usd-analytics",
    icon: "📈",
    roles: ["owner", "manager"],
    permission: "usd.view",
  },
  {
    id: "invoices",
    label: "Invoice Penjualan",
    href: "/dashboard/invoices",
    icon: "🧾",
    roles: ["owner", "manager"],
    permission: "invoice.view",
  },
  {
    id: "reports",
    label: "Laporan Bisnis",
    href: "/dashboard/reports",
    icon: "📊",
    roles: ["owner", "manager"],
    permission: "report.view",
  },
  {
    id: "audit",
    label: "Audit Trail Forensik",
    href: "/dashboard/audit",
    icon: "🔍",
    roles: ["owner", "manager"],
    permission: "audit.view",
  },
  {
    id: "users",
    label: "Manajemen Pengguna",
    href: "/dashboard/users",
    icon: "👥",
    roles: ["owner", "manager"],
    permission: "user.view",
  },
];

export function useNavItems() {
  const { user, hasPermission } = useAuth();

  if (!user) return [];

  // Normalisasi user.role (contoh: "front-office" -> "front_office", "Front Office" -> "front_office")
  const currentRole = (user.role || "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");

  return NAV_ITEMS.filter((item) => {
    // 1. Role matching
    const matchesRole = item.roles.some((r) => {
      const normalizedR = r.toLowerCase().replace(/[\s-]+/g, "_");
      return normalizedR === currentRole;
    });

    // Owner dan Manager selalu memiliki hak akses ke seluruh modul yang tertera
    if (currentRole === "owner" || currentRole === "manager") {
      return true;
    }

    if (!matchesRole) {
      return false;
    }

    // 2. Permission check
    if (item.permission) {
      if (hasPermission(item.permission)) return true;
      if (hasPermission(item.permission.replace(".", ":"))) return true;
      // Jika role cocok, izinkan akses secara default
      return true;
    }

    return true;
  });
}
