"use client";

import { useState, useEffect, useCallback } from "react";

export type SystemRoleKey =
  | "owner"
  | "manager"
  | "front_office"
  | "tim_design"
  | "kepala_produksi"
  | "quality_control"
  | "staf_gudang";

export interface RbacUserAccount {
  id: string;
  name: string;
  email: string;
  role: SystemRoleKey;
  roleName: string;
  status: "AKTIF" | "NONAKTIF";
  lastLogin: string;
  phone: string;
  password?: string;
}

export interface RbacModuleDefinition {
  code: string;
  name: string;
  category: "Operasional" | "Inventori & Master" | "Laporan" | "Manajerial & Sistem";
  description: string;
  /** NavItem IDs di sidebar yang dikendalikan oleh modul ini */
  navIds: string[];
  /** Permission strings yang diaktifkan oleh modul ini */
  permissions: string[];
}

export const ROLE_LABELS: Record<SystemRoleKey, string> = {
  owner: "Owner / Direktur",
  manager: "Operational Manager",
  front_office: "Front Office & Sales",
  tim_design: "Tim Design & Prepress",
  kepala_produksi: "Kepala Produksi",
  quality_control: "Quality Control",
  staf_gudang: "Staf Gudang",
};

export const RBAC_MODULES: RbacModuleDefinition[] = [
  {
    code: "orders",
    name: "Order Pelanggan & Intake",
    category: "Operasional",
    description: "Penerimaan pesanan baru, kalkulasi prioritas deadline, dan antrean order",
    navIds: ["orders"],
    permissions: ["order.view", "order.create", "order.update", "order.revision", "order.approve"],
  },
  {
    code: "bom",
    name: "BOM Calculator & Pola Potong",
    category: "Operasional",
    description: "Kalkulasi kebutuhan plano kertas, tinta, laminasi, dan visualisasi potong 2D",
    navIds: ["bom"],
    permissions: ["bom.view", "bom.calculate", "bom.manage"],
  },
  {
    code: "spk",
    name: "SPK Digital & Scan QR Gudang",
    category: "Operasional",
    description: "CRUD Surat Perintah Kerja internal/vendor dan checklist QR stok gudang",
    navIds: ["spk"],
    permissions: ["spk.view", "spk.issue", "spk.generate", "spk.download"],
  },
  {
    code: "production",
    name: "Kanban Pengerjaan Mesin",
    category: "Operasional",
    description: "Papan kanban status mesin cetak, finishing, subkontrak, dan alokasi PIC",
    navIds: ["production"],
    permissions: ["production.view", "production.update", "production.manage", "production.assign"],
  },
  {
    code: "qc",
    name: "Inspeksi Quality Control (QC)",
    category: "Operasional",
    description: "Pemeriksaan kualitas batch cetak, persentase lolos/reject, dan pengiriman",
    navIds: ["qc"],
    permissions: ["qc.view", "qc.inspect"],
  },
  {
    code: "inventory",
    name: "Inventori (Bahan, Sparepart, Produk Jadi)",
    category: "Inventori & Master",
    description: "Monitoring stok Gudang 1 & Gudang 2, status ROP, dan batch kedaluwarsa",
    navIds: ["inventory", "inv-materials", "inv-spareparts", "inv-products"],
    permissions: [
      "inventory.view",
      "inventory.create",
      "inventory.update",
      "inventory.delete",
      "inventory.materials.view",
      "inventory.materials.create",
      "inventory.materials.update",
      "inventory.materials.delete",
      "inventory.materials.transfer",
      "inventory.spareparts.view",
      "inventory.spareparts.create",
      "inventory.spareparts.update",
      "inventory.spareparts.delete",
      "inventory.products.view",
      "inventory.products.create",
      "inventory.products.update",
      "inventory.products.delete",
    ],
  },
  {
    code: "transactions",
    name: "Mutasi Stok & Stock Opname ACID",
    category: "Inventori & Master",
    description: "Pencatatan barang masuk, keluar, transfer antar-gudang, dan penyesuaian opname",
    navIds: ["trx-history"],
    permissions: ["inventory.transfer", "inventory.opname", "stock.transfer", "stock.opname", "batch.track"],
  },
  {
    code: "master_customers",
    name: "Master Data Pelanggan (Klien)",
    category: "Inventori & Master",
    description: "Database pelanggan B2B/ritel untuk form order dan SPK",
    navIds: ["master-customers"],
    permissions: ["master.customers.view", "master.customers.manage"],
  },
  {
    code: "master_vendors",
    name: "Master Data Vendor Mitra Maklon",
    category: "Inventori & Master",
    description: "Database mitra subkontrak cetak/finishing luar",
    navIds: ["master-vendors"],
    permissions: ["master.vendors.view", "master.vendors.manage"],
  },
  {
    code: "master_pic",
    name: "Master Data Penanggung Jawab (PIC)",
    category: "Inventori & Master",
    description: "Database operator mesin dan penanggung jawab kanban produksi",
    navIds: ["master-pic"],
    permissions: ["master.pic.view", "master.pic.manage"],
  },
  {
    code: "master",
    name: "Master Gudang (Supplier, Brand, Gudang, Satuan, Kategori)",
    category: "Inventori & Master",
    description: "Konfigurasi data master inventori, brand perusahaan, dan konversi satuan",
    navIds: ["master-suppliers", "master-brands", "master-warehouses", "master-units", "master-categories"],
    permissions: [
      "master.suppliers.view",
      "master.suppliers.create",
      "master.suppliers.update",
      "master.suppliers.deactivate",
      "master.brands.view",
      "master.brands.create",
      "master.brands.update",
      "master.brands.delete",
      "master.warehouses.view",
      "master.warehouses.create",
      "master.warehouses.update",
      "master.warehouses.delete",
      "master.units.view",
      "master.units.create",
      "master.units.update",
      "master.units.delete",
      "master.categories.view",
      "master.manage",
      "category.materials.create",
      "category.materials.update",
      "category.materials.delete",
      "category.spareparts.create",
      "category.spareparts.update",
      "category.spareparts.delete",
      "category.products.create",
      "category.products.update",
      "category.products.delete",
    ],
  },
  {
    code: "report_stock_mutation",
    name: "Laporan Mutasi Stock",
    category: "Laporan",
    description: "Laporan arus masuk, keluar, dan transfer stok bahan baku",
    navIds: ["report-stock-mutation"],
    permissions: ["report.stock_mutation.view", "report.export"],
  },
  {
    code: "report_stock_opname",
    name: "Laporan Stock Opname",
    category: "Laporan",
    description: "Laporan selisih stok sistem vs fisik gudang",
    navIds: ["report-stock-opname"],
    permissions: ["report.stock_opname.view", "report.export"],
  },
  {
    code: "report_material_brand",
    name: "Laporan Pemakaian Material Per Brand",
    category: "Laporan",
    description: "Laporan serapan kertas plano, tinta, dan biaya bahan per brand",
    navIds: ["report-material-brand"],
    permissions: ["report.material_brand.view", "report.export"],
  },
  {
    code: "report_orders",
    name: "Laporan Order",
    category: "Laporan",
    description: "Laporan rekap pesanan pelanggan, omzet, dan prioritas deadline",
    navIds: ["report-orders"],
    permissions: ["report.orders.view", "report.export"],
  },
  {
    code: "report_production",
    name: "Laporan Produksi",
    category: "Laporan",
    description: "Laporan realisasi output mesin cetak dan beban kerja PIC",
    navIds: ["report-production"],
    permissions: ["report.production.view", "report.export"],
  },
  {
    code: "report_qc",
    name: "Laporan QC",
    category: "Laporan",
    description: "Laporan hasil uji mutu kelayakan cetak dan analisis defect",
    navIds: ["report-qc"],
    permissions: ["report.qc.view", "report.export"],
  },
  {
    code: "usd",
    name: "Kurs USD & Analitik Harga Impor",
    category: "Manajerial & Sistem",
    description: "Pemantauan dampak fluktuasi USD terhadap bahan baku impor",
    navIds: ["usd-analytics"],
    permissions: ["usd.view", "usd.manage"],
  },
  {
    code: "invoices",
    name: "Invoice Penjualan & Penagihan",
    category: "Manajerial & Sistem",
    description: "Penerbitan tagihan pelanggan dan rekap status pembayaran",
    navIds: ["invoices"],
    permissions: ["invoice.view", "invoice.download"],
  },
  {
    code: "audit",
    name: "Audit Trail Forensik",
    category: "Manajerial & Sistem",
    description: "Log perubahan sistem bersegel SHA-256",
    navIds: ["audit"],
    permissions: ["audit.view"],
  },
  {
    code: "users",
    name: "Manajemen Pengguna & RBAC",
    category: "Manajerial & Sistem",
    description: "Kelola akun staf dan matriks hak akses 7 role",
    navIds: ["users"],
    permissions: ["user.view", "user.manage"],
  },
];

const ALL_MODULE_CODES = RBAC_MODULES.map((m) => m.code);

export const DEFAULT_ROLE_MATRIX: Record<SystemRoleKey, string[]> = {
  owner: [...ALL_MODULE_CODES],
  manager: [...ALL_MODULE_CODES],
  front_office: ["orders", "master_customers", "report_orders"],
  tim_design: ["bom", "spk", "master_vendors", "report_material_brand"],
  kepala_produksi: [
    "spk",
    "production",
    "qc",
    "master_pic",
    "master_vendors",
    "report_production",
    "report_material_brand",
    "report_qc",
  ],
  quality_control: ["production", "qc", "report_qc"],
  staf_gudang: [
    "inventory",
    "transactions",
    "spk",
    "master",
    "report_stock_mutation",
    "report_stock_opname",
    "report_material_brand",
  ],
};

export const DEFAULT_RBAC_USERS: RbacUserAccount[] = [
  {
    id: "USR-001",
    name: "Budi Santoso",
    email: "owner@packsolution.dev",
    role: "owner",
    roleName: ROLE_LABELS.owner,
    status: "AKTIF",
    lastLogin: "2026-11-15 09:15",
    phone: "+62 811-2345-6789",
    password: "password",
  },
  {
    id: "USR-002",
    name: "Dewi Rahayu",
    email: "manager@packsolution.dev",
    role: "manager",
    roleName: ROLE_LABELS.manager,
    status: "AKTIF",
    lastLogin: "2026-11-15 08:40",
    phone: "+62 812-3456-7890",
    password: "password",
  },
  {
    id: "USR-003",
    name: "Ahmad Fauzi",
    email: "fo@packsolution.dev",
    role: "front_office",
    roleName: ROLE_LABELS.front_office,
    status: "AKTIF",
    lastLogin: "2026-11-15 10:02",
    phone: "+62 813-4567-8901",
    password: "password",
  },
  {
    id: "USR-004",
    name: "Sari Indah",
    email: "design@packsolution.dev",
    role: "tim_design",
    roleName: ROLE_LABELS.tim_design,
    status: "AKTIF",
    lastLogin: "2026-11-15 09:20",
    phone: "+62 814-5678-9012",
    password: "password",
  },
  {
    id: "USR-005",
    name: "Rudi Hartono",
    email: "produksi@packsolution.dev",
    role: "kepala_produksi",
    roleName: ROLE_LABELS.kepala_produksi,
    status: "AKTIF",
    lastLogin: "2026-11-15 08:10",
    phone: "+62 815-6789-0123",
    password: "password",
  },
  {
    id: "USR-006",
    name: "Nina Sari",
    email: "qc@packsolution.dev",
    role: "quality_control",
    roleName: ROLE_LABELS.quality_control,
    status: "AKTIF",
    lastLogin: "2026-11-15 10:35",
    phone: "+62 816-7890-1234",
    password: "password",
  },
  {
    id: "USR-007",
    name: "Hendra Wijaya",
    email: "gudang@packsolution.dev",
    role: "staf_gudang",
    roleName: ROLE_LABELS.staf_gudang,
    status: "AKTIF",
    lastLogin: "2026-11-15 07:55",
    phone: "+62 817-8901-2345",
    password: "password",
  },
];

const USERS_STORAGE_KEY = "sip_rbac_users_v1";
const MATRIX_STORAGE_KEY = "sip_rbac_matrix_v1";
const RBAC_EVENT_NAME = "sip_rbac_updated";

export function getStoredRbacUsers(): RbacUserAccount[] {
  if (typeof window === "undefined") return DEFAULT_RBAC_USERS;
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_RBAC_USERS));
      return DEFAULT_RBAC_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_RBAC_USERS;
  } catch {
    return DEFAULT_RBAC_USERS;
  }
}

export function saveStoredRbacUsers(users: RbacUserAccount[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  window.dispatchEvent(new Event(RBAC_EVENT_NAME));
}

export function getStoredRoleMatrix(): Record<SystemRoleKey, string[]> {
  if (typeof window === "undefined") return DEFAULT_ROLE_MATRIX;
  try {
    const raw = localStorage.getItem(MATRIX_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MATRIX_STORAGE_KEY, JSON.stringify(DEFAULT_ROLE_MATRIX));
      return DEFAULT_ROLE_MATRIX;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_ROLE_MATRIX, ...parsed };
  } catch {
    return DEFAULT_ROLE_MATRIX;
  }
}

export function saveStoredRoleMatrix(matrix: Record<SystemRoleKey, string[]>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MATRIX_STORAGE_KEY, JSON.stringify(matrix));
  window.dispatchEvent(new Event(RBAC_EVENT_NAME));
}

/** Menghasilkan daftar permission string berdasarkan daftar modul yang aktif untuk suatu role */
export function getPermissionsForRole(role: string, matrix?: Record<SystemRoleKey, string[]>): string[] {
  const normalized = (role || "").toLowerCase().trim().replace(/[\s-]+/g, "_") as SystemRoleKey;
  const currentMatrix = matrix || getStoredRoleMatrix();
  const enabledCodes = currentMatrix[normalized] || [];
  const perms = new Set<string>();
  for (const mod of RBAC_MODULES) {
    if (enabledCodes.includes(mod.code)) {
      mod.permissions.forEach((p) => perms.add(p));
    }
  }
  return Array.from(perms);
}

/** Mengecek apakah suatu item navigasi (berdasarkan item.id) diizinkan untuk suatu role */
export function isNavItemAllowedForRole(navId: string, role: string, matrix?: Record<SystemRoleKey, string[]>): boolean {
  if (navId === "dashboard") return true;
  const normalized = (role || "").toLowerCase().trim().replace(/[\s-]+/g, "_") as SystemRoleKey;
  const currentMatrix = matrix || getStoredRoleMatrix();
  const enabledCodes = currentMatrix[normalized];
  if (!enabledCodes) return true;
  const matchingModule = RBAC_MODULES.find((m) => m.navIds.includes(navId));
  if (!matchingModule) return true;
  return enabledCodes.includes(matchingModule.code);
}

/** React Hook untuk membaca dan memodifikasi pengguna serta matriks RBAC secara reaktif */
export function useRbacStore() {
  const [users, setUsers] = useState<RbacUserAccount[]>(DEFAULT_RBAC_USERS);
  const [roleMatrix, setRoleMatrix] = useState<Record<SystemRoleKey, string[]>>(DEFAULT_ROLE_MATRIX);

  const syncFromStorage = useCallback(() => {
    setUsers(getStoredRbacUsers());
    setRoleMatrix(getStoredRoleMatrix());
  }, []);

  useEffect(() => {
    syncFromStorage();
    window.addEventListener(RBAC_EVENT_NAME, syncFromStorage);
    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener(RBAC_EVENT_NAME, syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, [syncFromStorage]);

  const updateUsers = useCallback((nextUsers: RbacUserAccount[]) => {
    setUsers(nextUsers);
    saveStoredRbacUsers(nextUsers);
  }, []);

  const updateRoleMatrix = useCallback((nextMatrix: Record<SystemRoleKey, string[]>) => {
    setRoleMatrix(nextMatrix);
    saveStoredRoleMatrix(nextMatrix);
  }, []);

  const toggleModulePermission = useCallback(
    (role: SystemRoleKey, moduleCode: string) => {
      // Proteksi agar Owner tidak kehilangan akses ke halaman Manajemen Pengguna & RBAC
      if (role === "owner" && moduleCode === "users") return;
      const currentList = roleMatrix[role] || [];
      const exists = currentList.includes(moduleCode);
      const updatedRoleModules = exists
        ? currentList.filter((c) => c !== moduleCode)
        : [...currentList, moduleCode];
      const nextMatrix = {
        ...roleMatrix,
        [role]: updatedRoleModules,
      };
      updateRoleMatrix(nextMatrix);
    },
    [roleMatrix, updateRoleMatrix]
  );

  const resetMatrixToDefault = useCallback(() => {
    updateRoleMatrix(DEFAULT_ROLE_MATRIX);
  }, [updateRoleMatrix]);

  return {
    users,
    roleMatrix,
    updateUsers,
    updateRoleMatrix,
    toggleModulePermission,
    resetMatrixToDefault,
  };
}
