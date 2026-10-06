"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/config/routes";

// Interface NavItem
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  roles: string[];
  permission: string | null;
}

// Grup menu sidebar (label kecil di atas item). label null = tanpa judul grup.
export interface NavGroup {
  id: string;
  label: string | null;
  items: NavItem[];
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

// =====================================================================
// Menu berkelompok khusus per role. Role yang terdaftar di sini memakai
// struktur grup ini; role lain tetap memakai NAV_ITEMS (flat) di atas.
// =====================================================================
const SG = ["staf_gudang"];

export const ROLE_NAV_GROUPS: Record<string, NavGroup[]> = {
  staf_gudang: [
    {
      id: "main",
      label: null,
      items: [
        { id: "dashboard", label: "Dashboard", href: ROUTES.dashboard, icon: "dashboard", roles: SG, permission: null },
      ],
    },
    {
      id: "inventory",
      label: "Inventori",
      items: [
        { id: "inv-products", label: "Produk", href: ROUTES["inventory.products"], icon: "products", roles: SG, permission: "inventory.products.view" },
        { id: "inv-materials", label: "Bahan Baku", href: ROUTES["inventory.materials"], icon: "materials", roles: SG, permission: "inventory.materials.view" },
        { id: "inv-spareparts", label: "Sparepart", href: ROUTES["inventory.spareparts"], icon: "spareparts", roles: SG, permission: "inventory.spareparts.view" },
      ],
    },
    {
      id: "master",
      label: "Master Data",
      items: [
        { id: "master-suppliers", label: "Supplier", href: ROUTES["master.suppliers"], icon: "suppliers", roles: SG, permission: "master.suppliers.view" },
        { id: "master-brands", label: "Brand", href: ROUTES["master.brands"], icon: "brands", roles: SG, permission: "master.brands.view" },
        { id: "master-warehouses", label: "Gudang", href: ROUTES["master.warehouses"], icon: "warehouses", roles: SG, permission: "master.warehouses.view" },
        { id: "master-units", label: "Satuan & Konversi", href: ROUTES["master.units"], icon: "units", roles: SG, permission: "master.units.view" },
      ],
    },
    {
      id: "category",
      label: "Kategori",
      items: [
        { id: "cat-products", label: "Kategori Produk", href: ROUTES["category.products"], icon: "category", roles: SG, permission: "category.products.view" },
        { id: "cat-materials", label: "Kategori Bahan Baku", href: ROUTES["category.materials"], icon: "category", roles: SG, permission: "category.materials.view" },
        { id: "cat-spareparts", label: "Kategori Sparepart", href: ROUTES["category.spareparts"], icon: "category", roles: SG, permission: "category.spareparts.view" },
      ],
    },
  ],
};

function normalizeRole(role: string | undefined | null): string {
  return (role || "").toLowerCase().trim().replace(/[\s-]+/g, "_");
}

/** Menentukan apakah item menu aktif untuk pathname saat ini */
export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
}

/**
 * Mengembalikan menu berkelompok. Untuk role tanpa konfigurasi grup,
 * dikembalikan satu grup tanpa label berisi NAV_ITEMS hasil filter
 * (tampilan role lain tidak berubah).
 */
export function useNavGroups(): NavGroup[] {
  const { user } = useAuth();
  const flat = useFlatNavItems();
  if (!user) return [];
  const groups = ROLE_NAV_GROUPS[normalizeRole(user.role)];
  if (groups) return groups;
  return [{ id: "default", label: null, items: flat }];
}

export function useNavItems() {
  const { user } = useAuth();
  const flat = useFlatNavItems();
  const groups = ROLE_NAV_GROUPS[normalizeRole(user?.role)];
  if (user && groups) return groups.flatMap((g) => g.items);
  return flat;
}

function useFlatNavItems() {
  const { user, hasPermission } = useAuth();

  if (!user) return [];

  // Normalisasi user.role (contoh: "front-office" -> "front_office", "Front Office" -> "front_office")
  const currentRole = normalizeRole(user.role);

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
