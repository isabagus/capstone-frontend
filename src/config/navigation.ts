"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/config/routes";
import { isNavItemAllowedForRole, useRbacStore } from "@/services/rbacStore";

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

// =====================================================================
// Daftar 6 Menu Laporan Terpisah (Revisi 1)
// Masing-masing dikonfigurasi per role agar sidebar memunculkan
// hanya menu laporan yang sesuai dengan tanggung jawab role tersebut.
// =====================================================================
export const REPORT_NAV_ITEMS: NavItem[] = [
  {
    id: "report-stock-mutation",
    label: "Laporan Mutasi Stock",
    href: ROUTES["report.stockMutation"],
    icon: "report-stock-mutation",
    roles: ["owner", "manager", "staf_gudang"],
    permission: "report.stock_mutation.view",
  },
  {
    id: "report-stock-opname",
    label: "Stock Opname",
    href: ROUTES["report.stockOpname"],
    icon: "report-stock-opname",
    roles: ["owner", "manager", "staf_gudang"],
    permission: "report.stock_opname.view",
  },
  {
    id: "report-material-brand",
    label: "Pemakaian Material Per Brand",
    href: ROUTES["report.materialByBrand"],
    icon: "report-material-brand",
    roles: ["owner", "manager", "tim_design", "kepala_produksi", "staf_gudang"],
    permission: "report.material_brand.view",
  },
  {
    id: "report-orders",
    label: "Laporan Order",
    href: ROUTES["report.orders"],
    icon: "report-orders",
    roles: ["owner", "manager", "front_office"],
    permission: "report.orders.view",
  },
  {
    id: "report-production",
    label: "Laporan Produksi",
    href: ROUTES["report.production"],
    icon: "report-production",
    roles: ["owner", "manager", "kepala_produksi"],
    permission: "report.production.view",
  },
  {
    id: "report-qc",
    label: "Laporan QC",
    href: ROUTES["report.qc"],
    icon: "report-qc",
    roles: ["owner", "manager", "quality_control", "kepala_produksi"],
    permission: "report.qc.view",
  },
];

// Navigasi daftar datar (fallback & mobile bottom nav)
export const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    roles: ["owner", "manager", "front_office", "tim_design", "kepala_produksi", "quality_control", "staf_gudang"],
    permission: null,
  },
  {
    id: "inventory",
    label: "Inventori Multi-Gudang",
    href: "/dashboard/inventory/materials",
    icon: "inventory",
    roles: ["owner", "manager", "staf_gudang"],
    permission: "inventory.view",
  },
  {
    id: "orders",
    label: "Order Pelanggan",
    href: "/dashboard/orders",
    icon: "orders",
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
    icon: "bom",
    roles: ["owner", "manager", "tim_design"],
    permission: "bom.view",
  },
  {
    id: "spk",
    label: "SPK Digital",
    href: "/dashboard/spk",
    icon: "spk",
    roles: ["owner", "manager", "tim_design", "kepala_produksi", "staf_gudang"],
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
    id: "master-pic",
    label: "Master Penanggung Jawab",
    href: ROUTES["master.pic"],
    icon: "master-pic",
    roles: ["owner", "manager", "kepala_produksi"],
    permission: null,
  },
  {
    id: "production",
    label: "Kanban Produksi",
    href: "/dashboard/production",
    icon: "production",
    roles: ["owner", "manager", "kepala_produksi", "quality_control"],
    permission: "production.view",
  },
  {
    id: "qc",
    label: "Quality Control",
    href: "/dashboard/qc",
    icon: "qc",
    roles: ["owner", "manager", "kepala_produksi", "quality_control"],
    permission: "qc.inspect",
  },
  ...REPORT_NAV_ITEMS,
  {
    id: "usd-analytics",
    label: "Kurs USD & Harga",
    href: "/dashboard/usd-analytics",
    icon: "usd-analytics",
    roles: ["owner", "manager"],
    permission: "usd.view",
  },
  {
    id: "invoices",
    label: "Invoice Penjualan",
    href: "/dashboard/invoices",
    icon: "invoices",
    roles: ["owner", "manager"],
    permission: "invoice.view",
  },
  {
    id: "audit",
    label: "Audit Trail Forensik",
    href: "/dashboard/audit",
    icon: "audit",
    roles: ["owner", "manager"],
    permission: "audit.view",
  },
  {
    id: "users",
    label: "Manajemen User & RBAC",
    href: "/dashboard/users",
    icon: "users",
    roles: ["owner", "manager"],
    permission: "user.view",
  },
];

// =====================================================================
// Helper untuk menyaring menu Laporan sesuai role
// =====================================================================
function getReportItemsForRole(role: string): NavItem[] {
  return REPORT_NAV_ITEMS.filter((item) => item.roles.includes(role));
}

const MGR_OWN = ["manager", "owner"];
const FO = ["front_office"];
const TD = ["tim_design"];
const KP = ["kepala_produksi"];
const QC = ["quality_control"];
const SG = ["staf_gudang"];

const FULL_ACCESS_NAV_GROUPS: NavGroup[] = [
  {
    id: "main",
    label: null,
    items: [
      { id: "dashboard", label: "Dashboard", href: ROUTES.dashboard, icon: "dashboard", roles: MGR_OWN, permission: null },
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
    id: "laporan",
    label: "Laporan",
    items: REPORT_NAV_ITEMS,
  },
  {
    id: "manajerial",
    label: "Manajerial & Sistem",
    items: [
      { id: "usd-analytics", label: "Kurs USD & Harga", href: "/dashboard/usd-analytics", icon: "usd-analytics", roles: MGR_OWN, permission: "usd.view" },
      { id: "invoices", label: "Invoice Penjualan", href: "/dashboard/invoices", icon: "invoices", roles: MGR_OWN, permission: "invoice.view" },
      { id: "audit", label: "Audit Trail Forensik", href: "/dashboard/audit", icon: "audit", roles: MGR_OWN, permission: "audit.view" },
      { id: "users", label: "Manajemen User & RBAC", href: "/dashboard/users", icon: "users", roles: MGR_OWN, permission: "user.view" },
    ],
  },
  {
    id: "master",
    label: "Master Data",
    items: [
      { id: "master-customers", label: "Pelanggan (Klien)", href: ROUTES["master.customers"], icon: "customers", roles: MGR_OWN, permission: null },
      { id: "master-vendors", label: "Vendor Mitra Maklon", href: ROUTES["master.vendors"], icon: "vendors", roles: MGR_OWN, permission: null },
      { id: "master-pic", label: "Penanggung Jawab (PIC)", href: ROUTES["master.pic"], icon: "master-pic", roles: MGR_OWN, permission: null },
      { id: "master-suppliers", label: "Supplier Bahan", href: ROUTES["master.suppliers"], icon: "suppliers", roles: MGR_OWN, permission: "master.suppliers.view" },
      { id: "master-brands", label: "Brand", href: ROUTES["master.brands"], icon: "brands", roles: MGR_OWN, permission: "master.brands.view" },
      { id: "master-warehouses", label: "Gudang", href: ROUTES["master.warehouses"], icon: "warehouses", roles: MGR_OWN, permission: "master.warehouses.view" },
      { id: "master-units", label: "Satuan & Konversi", href: ROUTES["master.units"], icon: "units", roles: MGR_OWN, permission: "master.units.view" },
      { id: "master-categories", label: "Kategori", href: ROUTES["master.categories"], icon: "master-categories", roles: MGR_OWN, permission: null },
    ],
  },
];

// =====================================================================
// Konfigurasi Menu Sidebar Berkelompok untuk Seluruh 7 Role
// Setiap role memiliki grup "Laporan" tersendiri sesuai kewenangannya.
// =====================================================================
export const ROLE_NAV_GROUPS: Record<string, NavGroup[]> = {
  owner: FULL_ACCESS_NAV_GROUPS,
  manager: FULL_ACCESS_NAV_GROUPS,

  front_office: [
    {
      id: "main",
      label: null,
      items: [
        { id: "dashboard", label: "Dashboard", href: ROUTES.dashboard, icon: "dashboard", roles: FO, permission: null },
      ],
    },
    {
      id: "operational",
      label: "Penerimaan Pesanan",
      items: [
        { id: "orders", label: "Order Pelanggan", href: "/dashboard/orders", icon: "orders", roles: FO, permission: "order.view" },
      ],
    },
    {
      id: "master",
      label: "Master Data",
      items: [
        { id: "master-customers", label: "Master Pelanggan", href: ROUTES["master.customers"], icon: "customers", roles: FO, permission: null },
      ],
    },
    {
      id: "laporan",
      label: "Laporan",
      items: getReportItemsForRole("front_office"),
    },
  ],

  tim_design: [
    {
      id: "main",
      label: null,
      items: [
        { id: "dashboard", label: "Dashboard", href: ROUTES.dashboard, icon: "dashboard", roles: TD, permission: null },
      ],
    },
    {
      id: "design-prep",
      label: "Pra-Cetak & Teknik",
      items: [
        { id: "bom", label: "BOM Calculator", href: "/dashboard/bom", icon: "bom", roles: TD, permission: "bom.view" },
        { id: "spk", label: "SPK Digital", href: "/dashboard/spk", icon: "spk", roles: TD, permission: "spk.view" },
      ],
    },
    {
      id: "master",
      label: "Master Data",
      items: [
        { id: "master-vendors", label: "Master Vendor Maklon", href: ROUTES["master.vendors"], icon: "vendors", roles: TD, permission: null },
      ],
    },
    {
      id: "laporan",
      label: "Laporan",
      items: getReportItemsForRole("tim_design"),
    },
  ],

  kepala_produksi: [
    {
      id: "main",
      label: null,
      items: [
        { id: "dashboard", label: "Dashboard", href: ROUTES.dashboard, icon: "dashboard", roles: KP, permission: null },
      ],
    },
    {
      id: "production-ops",
      label: "Lantai Produksi",
      items: [
        { id: "spk", label: "SPK Digital", href: "/dashboard/spk", icon: "spk", roles: KP, permission: "spk.view" },
        { id: "production", label: "Kanban Produksi", href: "/dashboard/production", icon: "production", roles: KP, permission: "production.view" },
        { id: "qc", label: "Quality Control", href: "/dashboard/qc", icon: "qc", roles: KP, permission: "qc.inspect" },
      ],
    },
    {
      id: "master",
      label: "Master Data",
      items: [
        { id: "master-pic", label: "Master Penanggung Jawab", href: ROUTES["master.pic"], icon: "master-pic", roles: KP, permission: null },
        { id: "master-vendors", label: "Master Vendor Maklon", href: ROUTES["master.vendors"], icon: "vendors", roles: KP, permission: null },
      ],
    },
    {
      id: "laporan",
      label: "Laporan",
      items: getReportItemsForRole("kepala_produksi"),
    },
  ],

  quality_control: [
    {
      id: "main",
      label: null,
      items: [
        { id: "dashboard", label: "Dashboard", href: ROUTES.dashboard, icon: "dashboard", roles: QC, permission: null },
      ],
    },
    {
      id: "qc-ops",
      label: "Inspeksi & Mutu",
      items: [
        { id: "production", label: "Kanban Produksi", href: "/dashboard/production", icon: "production", roles: QC, permission: "production.view" },
        { id: "qc", label: "Quality Control", href: "/dashboard/qc", icon: "qc", roles: QC, permission: "qc.inspect" },
      ],
    },
    {
      id: "laporan",
      label: "Laporan",
      items: getReportItemsForRole("quality_control"),
    },
  ],

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
      label: "Transaksi & Persiapan SPK",
      items: [
        { id: "trx-history", label: "Mutasi & Riwayat Stok", href: ROUTES["transaction.history"], icon: "trx-history", roles: SG, permission: null },
        { id: "spk", label: "Scan QR SPK Vendor", href: "/dashboard/spk", icon: "spk", roles: SG, permission: "spk.view" },
      ],
    },
    {
      id: "laporan",
      label: "Laporan",
      items: getReportItemsForRole("staf_gudang"),
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
 * Mengembalikan menu berkelompok sesuai role pengguna dan matriks RBAC aktif.
 */
export function useNavGroups(): NavGroup[] {
  const { user } = useAuth();
  const { roleMatrix } = useRbacStore();
  if (!user) return [];

  const role = normalizeRole(user.role);
  const baseGroups = ROLE_NAV_GROUPS[role] || FULL_ACCESS_NAV_GROUPS;

  // Saring item di dalam baseGroups berdasarkan matriks RBAC aktif
  const filteredGroups: NavGroup[] = baseGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => isNavItemAllowedForRole(item.id, role, roleMatrix)),
    }))
    .filter((g) => g.items.length > 0);

  // Jika admin mengaktifkan modul baru di RBAC yang belum ada di baseGroups role tersebut,
  // tambahkan secara dinamis dari FULL_ACCESS_NAV_GROUPS agar langsung muncul di sidebar.
  const existingIds = new Set(filteredGroups.flatMap((g) => g.items.map((i) => i.id)));
  const extraItems: NavItem[] = [];
  for (const fg of FULL_ACCESS_NAV_GROUPS) {
    for (const item of fg.items) {
      if (!existingIds.has(item.id) && isNavItemAllowedForRole(item.id, role, roleMatrix)) {
        extraItems.push(item);
        existingIds.add(item.id);
      }
    }
  }

  if (extraItems.length > 0) {
    filteredGroups.push({
      id: "rbac-extra",
      label: "Modul Tambahan (RBAC)",
      items: extraItems,
    });
  }

  return filteredGroups;
}

export function useNavItems() {
  const groups = useNavGroups();
  return groups.flatMap((g) => g.items);
}

function useFlatNavItems() {
  const { user, hasPermission } = useAuth();

  if (!user) return [];

  const currentRole = normalizeRole(user.role);

  return NAV_ITEMS.filter((item) => {
    const matchesRole = item.roles.some((r) => {
      const normalizedR = r.toLowerCase().replace(/[\s-]+/g, "_");
      return normalizedR === currentRole;
    });

    if (currentRole === "owner" || currentRole === "manager") {
      return true;
    }

    if (!matchesRole) {
      return false;
    }

    if (item.permission) {
      if (hasPermission(item.permission)) return true;
      if (hasPermission(item.permission.replace(".", ":"))) return true;
      return true;
    }

    return true;
  });
}
