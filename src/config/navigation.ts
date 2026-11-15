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
    href: "/dashboard/inventory/materials",
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
    id: "master-customers",
    label: "Master Pelanggan",
    href: ROUTES["master.customers"],
    icon: "customers",
    roles: ["owner", "manager", "front_office"],
    permission: null,
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
    id: "master-vendors",
    label: "Master Vendor Maklon",
    href: ROUTES["master.vendors"],
    icon: "vendors",
    roles: ["owner", "manager", "tim_design", "kepala_produksi"],
    permission: null,
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
// Menu berkelompok khusus per role.
// Manager & Owner mendapatkan akses penuh ke seluruh fitur operasional,
// inventori, transaksi mutasi, seluruh Master Data, serta Laporan & Analitik.
// =====================================================================
const SG = ["staf_gudang"];
const MGR_OWN = ["manager", "owner"];

const FULL_ACCESS_NAV_GROUPS: NavGroup[] = [
  {
    id: "main",
    label: null,
    items: [
      { id: "dashboard", label: "Dashboard", href: ROUTES.dashboard, icon: "dashboard", roles: MGR_OWN, permission: null },
    ],
  },
  {
    id: "reports-analytics",
    label: "Laporan & Manajerial",
    items: [
      { id: "reports", label: "Laporan Bisnis", href: "/dashboard/reports", icon: "reports", roles: MGR_OWN, permission: "report.view" },
      { id: "usd-analytics", label: "Kurs USD & Harga", href: "/dashboard/usd-analytics", icon: "usd-analytics", roles: MGR_OWN, permission: "usd.view" },
      { id: "invoices", label: "Invoice Penjualan", href: "/dashboard/invoices", icon: "invoices", roles: MGR_OWN, permission: "invoice.view" },
      { id: "audit", label: "Audit Trail Forensik", href: "/dashboard/audit", icon: "audit", roles: MGR_OWN, permission: "audit.view" },
      { id: "users", label: "Manajemen Pengguna", href: "/dashboard/users", icon: "users", roles: MGR_OWN, permission: "user.view" },
    ],
  },
  {
    id: "operational",
    label: "Operasional & Produksi",
    items: [
      { id: "orders", label: "Order Pelanggan", href: "/dashboard/orders", icon: "orders", roles: MGR_OWN, permission: "order.view" },
      { id: "bom", label: "BOM Calculator", href: "/dashboard/bom", icon: "bom", roles: MGR_OWN, permission: "bom.view" },
      { id: "spk", label: "SPK Digital", href: "/dashboard/spk", icon: "spk", roles: MGR_OWN, permission: "spk.view" },
      { id: "production", label: "Kanban Produksi", href: "/dashboard/production", icon: "production", roles: MGR_OWN, permission: "production.view" },
      { id: "qc", label: "Quality Control", href: "/dashboard/qc", icon: "qc", roles: MGR_OWN, permission: "qc.inspect" },
    ],
  },
  {
    id: "inventory",
    label: "Inventori & Transaksi",
    items: [
      { id: "inv-materials", label: "Bahan Baku", href: ROUTES["inventory.materials"], icon: "materials", roles: MGR_OWN, permission: "inventory.materials.view" },
      { id: "inv-spareparts", label: "Sparepart", href: ROUTES["inventory.spareparts"], icon: "spareparts", roles: MGR_OWN, permission: "inventory.spareparts.view" },
      { id: "inv-products", label: "Produk Jadi", href: ROUTES["inventory.products"], icon: "products", roles: MGR_OWN, permission: "inventory.products.view" },
      { id: "trx-history", label: "Mutasi & Riwayat Stok", href: ROUTES["transaction.history"], icon: "trx-history", roles: MGR_OWN, permission: null },
    ],
  },
  {
    id: "master",
    label: "Master Data",
    items: [
      { id: "master-customers", label: "Pelanggan (Klien)", href: ROUTES["master.customers"], icon: "customers", roles: MGR_OWN, permission: null },
      { id: "master-vendors", label: "Vendor Mitra Maklon", href: ROUTES["master.vendors"], icon: "vendors", roles: MGR_OWN, permission: null },
      { id: "master-suppliers", label: "Supplier Bahan", href: ROUTES["master.suppliers"], icon: "suppliers", roles: MGR_OWN, permission: "master.suppliers.view" },
      { id: "master-brands", label: "Brand", href: ROUTES["master.brands"], icon: "brands", roles: MGR_OWN, permission: "master.brands.view" },
      { id: "master-warehouses", label: "Gudang", href: ROUTES["master.warehouses"], icon: "warehouses", roles: MGR_OWN, permission: "master.warehouses.view" },
      { id: "master-units", label: "Satuan & Konversi", href: ROUTES["master.units"], icon: "units", roles: MGR_OWN, permission: "master.units.view" },
      { id: "master-categories", label: "Kategori", href: ROUTES["master.categories"], icon: "master-categories", roles: MGR_OWN, permission: null },
    ],
  },
];

export const ROLE_NAV_GROUPS: Record<string, NavGroup[]> = {
  manager: FULL_ACCESS_NAV_GROUPS,
  owner: FULL_ACCESS_NAV_GROUPS,
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
        { id: "inv-materials", label: "Bahan Baku", href: ROUTES["inventory.materials"], icon: "materials", roles: SG, permission: "inventory.materials.view" },
        { id: "inv-spareparts", label: "Sparepart", href: ROUTES["inventory.spareparts"], icon: "spareparts", roles: SG, permission: "inventory.spareparts.view" },
        { id: "inv-products", label: "Produk Jadi", href: ROUTES["inventory.products"], icon: "products", roles: SG, permission: "inventory.products.view" },
      ],
    },
    {
      id: "transaction",
      label: "Transaksi",
      items: [
        { id: "trx-history", label: "Mutasi & Riwayat Stok", href: ROUTES["transaction.history"], icon: "trx-history", roles: SG, permission: null },
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
        { id: "master-categories", label: "Kategori", href: ROUTES["master.categories"], icon: "master-categories", roles: SG, permission: null },
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
