"use client";

import { useState, useEffect, useCallback } from "react";
import {
  calculatePriorityFromDeadline,
  getTodayIsoDate,
  getFutureIsoDate,
} from "@/services/partnerMasterStore";

// =====================================================================
// SHARED OPERATIONAL STORE (LocalStorage + Real-Time Cross-Page Sync)
// Menghubungkan alur hulu ke hilir:
// Order Pelanggan -> BOM Calculator -> SPK Digital -> Kanban Produksi
// -> Quality Control (QC) -> Invoice Penjualan -> Audit Trail & Laporan
// =====================================================================

export interface OrderRevisionItem {
  revNumber: number;
  date: string;
  notes: string;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerMode?: "Repeat" | "Baru";
  orderServiceType?: "Jasa Cetak Custom" | "Beli Produk Jadi";
  brand: string;
  productName: string;
  dimensions: string;
  paperType: string;
  quantity: number;
  finishing: string[];
  stockPreValidation: "Tersedia" | "Menipis" | "Kurang";
  priority: "Normal" | "High" | "Express";
  deadline: string;
  orderDate: string;
  status:
    | "Order Placed"
    | "Queued for Design"
    | "Design Approved"
    | "In-Production"
    | "Siap Kirim (Ready Stock)";
  revisionCount: number;
  revisionHistory: OrderRevisionItem[];
  notes?: string;
  designFileName?: string;
}

export interface OrderForBom {
  id: string;
  orderNumber: string;
  customerName: string;
  brand: string;
  productName: string;
  orderQuantity: number;
  paperType: string;
  paperGsm: number;
  planoLengthCm: number;
  planoWidthCm: number;
  cutLengthCm: number;
  cutWidthCm: number;
  wastePercent: number;
  insheetQuantity: number;
  status: "Belum Dihitung" | "BOM Selesai" | "SPK Terbit";
}

export interface KanbanTask {
  id: string;
  spkNumber: string;
  orderNumber: string;
  customerName: string;
  brand: string;
  productName: string;
  quantity: number;
  priority: "Normal" | "High" | "Express";
  orderDate?: string;
  rawOrderDate?: string;
  deadline: string;
  rawDeadline?: string;
  stage: "Design Approved" | "In-Progress" | "Finishing" | "QC Pending";
  machineAssigned?: string;
  operatorAssigned?: string;
}

export interface InspectionTask {
  id: string;
  spkNumber: string;
  orderNumber: string;
  brand: string;
  customerName: string;
  productName: string;
  quantity: number;
  inspectorName: string;
  inspectionDate: string;
  rawInspectionDate?: string;
  result: "PASS" | "FAIL" | "Pending";
  defectNotes?: string;
  reworkCount: number;
  checklist: {
    dimensions: boolean;
    colorAccuracy: boolean;
    glueAdhesion: boolean;
    foilEmbossQuality: boolean;
    cleanliness: boolean;
  };
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  customerName: string;
  customerCompany: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: "LUNAS" | "DP_DITERIMA" | "BELUM_BAYAR" | "JATUH_TEMPO";
  itemsSummary: string;
  unitPrice?: number;
  quantity?: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  module: "INVENTORY" | "ORDERS" | "BOM" | "SPK" | "PRODUCTION" | "QC" | "INVOICES" | "USERS";
  action: "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "TRANSFER" | "INSPECT";
  description: string;
  recordId: string;
  hashChecksum: string;
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
}

// Storage Keys
export const ORDERS_STORAGE_KEY = "sip_orders_v1";
export const BOM_QUEUE_STORAGE_KEY = "sip_bom_queue_v1";
export const KANBAN_STORAGE_KEY = "sip_kanban_tasks_v1";
export const QC_STORAGE_KEY = "sip_qc_batches_v1";
export const INVOICES_STORAGE_KEY = "sip_invoices_v1";
export const AUDIT_STORAGE_KEY = "sip_audit_logs_v1";

const SYNC_EVENT = "sip_operational_store_sync";

// ===== INITIAL DEFAULT DATA =====

export const INITIAL_ORDERS: OrderItem[] = [
  {
    id: "1",
    orderNumber: "ORD-2026-0901",
    customerName: "PT Artha Boga Sejahtera",
    customerPhone: "0812-3456-7890",
    customerMode: "Repeat",
    orderServiceType: "Jasa Cetak Custom",
    brand: "Packsolution.id",
    productName: "Hardbox Rigid Premium Magnetic Gold",
    dimensions: "25 × 20 × 8 cm",
    paperType: "Kertas Ivory 300 GSM + Greyboard 2mm",
    quantity: 2500,
    finishing: ["Laminasi Doff", "Foil Hot Print Gold", "Die-cut"],
    stockPreValidation: "Tersedia",
    priority: "Express",
    deadline: getFutureIsoDate(1),
    orderDate: getTodayIsoDate(),
    status: "Queued for Design",
    revisionCount: 2,
    revisionHistory: [
      { revNumber: 1, date: "10:00 WIB", notes: "Ubah posisi logo 2cm ke kanan" },
      { revNumber: 2, date: "14:30 WIB", notes: "Penyesuaian warna foil ke Gold Shiny #4" },
    ],
    notes: "Pesanan express untuk launching produk minggu ini.",
  },
  {
    id: "2",
    orderNumber: "ORD-2026-0902",
    customerName: "Estella Glow Skincare",
    customerPhone: "0813-9876-5432",
    customerMode: "Repeat",
    orderServiceType: "Jasa Cetak Custom",
    brand: "Estella",
    productName: "Softbox Skincare Serum Matte Doff",
    dimensions: "12 × 5 × 5 cm",
    paperType: "Kraft Liner Brown 275 GSM",
    quantity: 5000,
    finishing: ["Laminasi Doff", "Emboss Logo"],
    stockPreValidation: "Tersedia",
    priority: "High",
    deadline: getFutureIsoDate(4),
    orderDate: getTodayIsoDate(),
    status: "Order Placed",
    revisionCount: 1,
    revisionHistory: [
      { revNumber: 1, date: "11:20 WIB", notes: "Tambahkan QR Code BPOM pada sisi samping" },
    ],
    notes: "Warna kraft natural dengan tinta putih pekat.",
  },
  {
    id: "3",
    orderNumber: "ORD-2026-0903",
    customerName: "Pepipapier Stationery",
    customerPhone: "0811-2233-4455",
    customerMode: "Repeat",
    orderServiceType: "Jasa Cetak Custom",
    brand: "Pepipapier",
    productName: "Greeting Card & Custom Envelope Foil",
    dimensions: "15 × 10 cm",
    paperType: "Art Paper 150 GSM",
    quantity: 1200,
    finishing: ["Foil Hot Print Gold", "Spot UV"],
    stockPreValidation: "Tersedia",
    priority: "Normal",
    deadline: getFutureIsoDate(7),
    orderDate: getTodayIsoDate(),
    status: "Design Approved",
    revisionCount: 4,
    revisionHistory: [
      { revNumber: 1, date: "09:00 WIB", notes: "Koreksi font tulisan wedding" },
      { revNumber: 2, date: "13:00 WIB", notes: "Ubah background dari krem ke broken white" },
      { revNumber: 3, date: "16:30 WIB", notes: "Perbesar motif bunga di pojok kanan bawah" },
      { revNumber: 4, date: "09:15 WIB", notes: "Revisi final: penyesuaian margin amplop" },
    ],
    notes: "Mencapai batas 4x revisi desain. Desain telah di-ACC final.",
  },
  {
    id: "4",
    orderNumber: "ORD-2026-0904",
    customerName: "Studio Foto Memoirs",
    customerPhone: "0877-6655-4433",
    customerMode: "Baru",
    orderServiceType: "Jasa Cetak Custom",
    brand: "memoirs.print",
    productName: "Photobook Hardcover Linen Series",
    dimensions: "30 × 30 cm",
    paperType: "Art Paper 150 GSM",
    quantity: 350,
    finishing: ["Laminasi Doff", "Hardcover Board"],
    stockPreValidation: "Tersedia",
    priority: "Express",
    deadline: getFutureIsoDate(2),
    orderDate: getTodayIsoDate(),
    status: "Queued for Design",
    revisionCount: 0,
    revisionHistory: [],
    notes: "Foto resolusi tinggi sudah diunggah di drive.",
  },
  {
    id: "5",
    orderNumber: "ORD-2026-0905",
    customerName: "Pikpurry Pet Care",
    customerPhone: "0856-7788-9900",
    customerMode: "Repeat",
    orderServiceType: "Jasa Cetak Custom",
    brand: "pikpurry",
    productName: "Packaging Snack Pouch Ziplock Cat Treats",
    dimensions: "20 × 12 cm",
    paperType: "Kertas Duplex Coated 350 GSM",
    quantity: 10000,
    finishing: ["Laminasi Glossy", "Ziplock Sealing"],
    stockPreValidation: "Menipis",
    priority: "Normal",
    deadline: getFutureIsoDate(10),
    orderDate: getTodayIsoDate(),
    status: "Order Placed",
    revisionCount: 1,
    revisionHistory: [
      { revNumber: 1, date: "22 Sep 15:00", notes: "Ubah tabel nutrisi pakan kucing" },
    ],
    notes: "Stok duplex di Gudang 2 menipis, perlu koordinasi saat cetak.",
  },
];

export const INITIAL_BOM_QUEUE: OrderForBom[] = [
  {
    id: "1",
    orderNumber: "ORD-2026-0901",
    customerName: "PT Artha Boga Sejahtera",
    brand: "Packsolution.id",
    productName: "Hardbox Rigid Premium Magnetic Gold",
    orderQuantity: 2500,
    paperType: "Kertas Ivory 300 GSM",
    paperGsm: 300,
    planoLengthCm: 109,
    planoWidthCm: 79,
    cutLengthCm: 48,
    cutWidthCm: 33,
    wastePercent: 5,
    insheetQuantity: 150,
    status: "Belum Dihitung",
  },
  {
    id: "2",
    orderNumber: "ORD-2026-0904",
    customerName: "Studio Foto Memoirs",
    brand: "memoirs.print",
    productName: "Photobook Hardcover Linen Series",
    orderQuantity: 350,
    paperType: "Art Paper 150 GSM",
    paperGsm: 150,
    planoLengthCm: 100,
    planoWidthCm: 65,
    cutLengthCm: 32,
    cutWidthCm: 22,
    wastePercent: 4,
    insheetQuantity: 50,
    status: "Belum Dihitung",
  },
  {
    id: "3",
    orderNumber: "ORD-2026-0902",
    customerName: "Estella Glow Skincare",
    brand: "Estella",
    productName: "Softbox Skincare Serum Matte Doff",
    orderQuantity: 5000,
    paperType: "Kraft Liner Brown 275 GSM",
    paperGsm: 275,
    planoLengthCm: 120,
    planoWidthCm: 90,
    cutLengthCm: 22,
    cutWidthCm: 14,
    wastePercent: 6,
    insheetQuantity: 250,
    status: "BOM Selesai",
  },
];

export const INITIAL_KANBAN_TASKS: KanbanTask[] = [
  {
    id: "1",
    spkNumber: "SPK-INT-2026-081",
    orderNumber: "ORD-2026-0901",
    customerName: "PT Artha Boga Sejahtera",
    brand: "Packsolution.id",
    productName: "Hardbox Rigid Premium Magnetic Gold",
    quantity: 2500,
    priority: "Express",
    orderDate: getTodayIsoDate(),
    rawOrderDate: getTodayIsoDate(),
    deadline: getFutureIsoDate(1),
    rawDeadline: getFutureIsoDate(1),
    stage: "In-Progress",
    machineAssigned: "Heidelberg SM-74 (4 Warna)",
    operatorAssigned: "Rudi Hartono (Kepala Produksi)",
  },
  {
    id: "2",
    spkNumber: "SPK-EKS-2026-042",
    orderNumber: "ORD-2026-0903",
    customerName: "Pepipapier Stationery",
    brand: "Pepipapier",
    productName: "Greeting Card & Custom Envelope Foil",
    quantity: 1200,
    priority: "Normal",
    orderDate: getTodayIsoDate(),
    rawOrderDate: getTodayIsoDate(),
    deadline: getFutureIsoDate(6),
    rawDeadline: getFutureIsoDate(6),
    stage: "Finishing",
    machineAssigned: "Vendor Foil Kurnia",
    operatorAssigned: "Wahyu Pratama (Koordinator Subkontrak & QC Bahan)",
  },
  {
    id: "3",
    spkNumber: "SPK-INT-2026-082",
    orderNumber: "ORD-2026-0902",
    customerName: "Estella Glow Skincare",
    brand: "Estella",
    productName: "Softbox Skincare Serum Matte Doff",
    quantity: 5000,
    priority: "High",
    orderDate: getTodayIsoDate(),
    rawOrderDate: getTodayIsoDate(),
    deadline: getFutureIsoDate(4),
    rawDeadline: getFutureIsoDate(4),
    stage: "Design Approved",
    machineAssigned: "Belum Dialokasikan",
    operatorAssigned: "Belum Ditugaskan",
  },
  {
    id: "4",
    spkNumber: "SPK-INT-2026-079",
    orderNumber: "ORD-2026-0899",
    customerName: "Studio Foto Memoirs",
    brand: "memoirs.print",
    productName: "Photobook Hardcover Linen Series",
    quantity: 350,
    priority: "Express",
    orderDate: getTodayIsoDate(),
    rawOrderDate: getTodayIsoDate(),
    deadline: getFutureIsoDate(2),
    rawDeadline: getFutureIsoDate(2),
    stage: "QC Pending",
    machineAssigned: "Mesin Lem Hardcover",
    operatorAssigned: "Slamet Riyadi (Supervisor Finishing & Die-Cut)",
  },
  {
    id: "5",
    spkNumber: "SPK-INT-2026-078",
    orderNumber: "ORD-2026-0895",
    customerName: "Pikpurry Pet Care",
    brand: "pikpurry",
    productName: "Packaging Snack Pouch Ziplock",
    quantity: 10000,
    priority: "Normal",
    orderDate: getTodayIsoDate(),
    rawOrderDate: getTodayIsoDate(),
    deadline: getFutureIsoDate(8),
    rawDeadline: getFutureIsoDate(8),
    stage: "Finishing",
    machineAssigned: "Mesin Ziplock Sealing",
    operatorAssigned: "Ahmad Subagio (Operator Cetak Offset Senior)",
  },
];

export const INITIAL_QC_TASKS: InspectionTask[] = [
  {
    id: "1",
    spkNumber: "SPK-INT-2026-079",
    orderNumber: "ORD-2026-0899",
    brand: "memoirs.print",
    customerName: "Studio Foto Memoirs",
    productName: "Photobook Hardcover Linen Series",
    quantity: 350,
    inspectorName: "Nina Sari (QC Inspector)",
    inspectionDate: "24 Sep 2026",
    rawInspectionDate: "2026-09-24",
    result: "Pending",
    reworkCount: 0,
    checklist: {
      dimensions: true,
      colorAccuracy: true,
      glueAdhesion: true,
      foilEmbossQuality: false,
      cleanliness: true,
    },
  },
  {
    id: "2",
    spkNumber: "SPK-INT-2026-076",
    orderNumber: "ORD-2026-0888",
    brand: "Packsolution.id",
    customerName: "PT Artha Boga Sejahtera",
    productName: "Box Kemasan Kue Lapis Legit Premium",
    quantity: 1000,
    inspectorName: "Nina Sari (QC Inspector)",
    inspectionDate: "24 Sep 2026",
    rawInspectionDate: "2026-09-24",
    result: "PASS",
    reworkCount: 0,
    checklist: {
      dimensions: true,
      colorAccuracy: true,
      glueAdhesion: true,
      foilEmbossQuality: true,
      cleanliness: true,
    },
  },
  {
    id: "3",
    spkNumber: "SPK-EKS-2026-039",
    orderNumber: "ORD-2026-0875",
    brand: "Estella",
    customerName: "Estella Glow Skincare",
    productName: "Kemasan Lipat Serum Retinol",
    quantity: 3000,
    inspectorName: "Nina Sari (QC Inspector)",
    inspectionDate: "23 Sep 2026",
    rawInspectionDate: "2026-09-23",
    result: "FAIL",
    defectNotes: "Potongan pond pinggir bergeser 2.5mm di atas toleransi standar vendor.",
    reworkCount: 1,
    checklist: {
      dimensions: false,
      colorAccuracy: true,
      glueAdhesion: true,
      foilEmbossQuality: true,
      cleanliness: true,
    },
  },
  {
    id: "4",
    spkNumber: "SPK-INT-2026-074",
    orderNumber: "ORD-2026-0862",
    brand: "Pepipapier",
    customerName: "Pepipapier Stationery",
    productName: "Envelope Foil Gold Emboss Custom",
    quantity: 1500,
    inspectorName: "Rudi Hartono (Kepala Produksi)",
    inspectionDate: "22 Sep 2026",
    rawInspectionDate: "2026-09-22",
    result: "PASS",
    reworkCount: 0,
    checklist: {
      dimensions: true,
      colorAccuracy: true,
      glueAdhesion: true,
      foilEmbossQuality: true,
      cleanliness: true,
    },
  },
];

export const INITIAL_INVOICES: InvoiceItem[] = [
  {
    id: "INV-2026-0089",
    invoiceNumber: "INV/2026/09/0089",
    orderNumber: "ORD-2026-0104",
    customerName: "Budi Santoso",
    customerCompany: "PT Kuliner Nusantara Sejahtera",
    issueDate: "2026-09-24",
    dueDate: "2026-10-08",
    amount: 14707500,
    paidAmount: 7000000,
    status: "DP_DITERIMA",
    itemsSummary: "5.000 Pcs Hardbox Premium Ivory 300gsm (Foil Emas)",
    quantity: 5000,
    unitPrice: 2650,
  },
  {
    id: "INV-2026-0088",
    invoiceNumber: "INV/2026/09/0088",
    orderNumber: "ORD-2026-0102",
    customerName: "Siti Aminah",
    customerCompany: "CV Herbal Alami Indonesia",
    issueDate: "2026-09-22",
    dueDate: "2026-10-06",
    amount: 6882000,
    paidAmount: 6882000,
    status: "LUNAS",
    itemsSummary: "3.000 Pcs Box Obat Herbal Duplex 350gsm + Doff",
    quantity: 3000,
    unitPrice: 2066,
  },
  {
    id: "INV-2026-0087",
    invoiceNumber: "INV/2026/09/0087",
    orderNumber: "ORD-2026-0099",
    customerName: "Hendra Wijaya",
    customerCompany: "PT Kosmetik Cantik Utama",
    issueDate: "2026-09-20",
    dueDate: "2026-09-24",
    amount: 28416000,
    paidAmount: 0,
    status: "JATUH_TEMPO",
    itemsSummary: "10.000 Pcs Sleeve Tube Lipcream Hot Stamping",
    quantity: 10000,
    unitPrice: 2560,
  },
  {
    id: "INV-2026-0086",
    invoiceNumber: "INV/2026/09/0086",
    orderNumber: "ORD-2026-0098",
    customerName: "Rian Pratama",
    customerCompany: "Kopi Senja Bahagia",
    issueDate: "2026-09-23",
    dueDate: "2026-10-07",
    amount: 4995000,
    paidAmount: 0,
    status: "BELUM_BAYAR",
    itemsSummary: "2.000 Pcs Paper Bag Craft Coklat 150gsm",
    quantity: 2000,
    unitPrice: 2250,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "AUD-99120",
    timestamp: "2026-09-24 14:32:10",
    userName: "Nina Sari",
    userRole: "Quality Control",
    ipAddress: "192.168.1.45",
    module: "QC",
    action: "INSPECT",
    recordId: "QC-2026-0041",
    description: "Menyelesaikan inspeksi QC SPK-2026-0089: Status PASSED (5.000 Box Hardbox Ivory)",
    hashChecksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    beforeData: { status: "IN_INSPECTION", verified_by: null },
    afterData: { status: "PASSED", verified_by: "Nina Sari", defective_count: 12, rework: false },
  },
  {
    id: "AUD-99119",
    timestamp: "2026-09-24 11:15:02",
    userName: "Rudi Hartono",
    userRole: "Kepala Produksi",
    ipAddress: "192.168.1.30",
    module: "PRODUCTION",
    action: "UPDATE",
    recordId: "PRD-2026-0089",
    description: "Memindahkan status Kanban SPK-2026-0089 dari 'Cetak Offset' ke 'Finishing & Pond'",
    hashChecksum: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
    beforeData: { stage: "PRINTING", machine: "Heidelberg SM 74", status: "RUNNING" },
    afterData: { stage: "FINISHING", machine: "Sanwa Die-cut", status: "PENDING_SETUP" },
  },
  {
    id: "AUD-99118",
    timestamp: "2026-09-24 09:45:18",
    userName: "Hendra Wijaya",
    userRole: "Staf Gudang",
    ipAddress: "192.168.1.52",
    module: "INVENTORY",
    action: "TRANSFER",
    recordId: "TRF-2026-0023",
    description: "Transfer ACID 500 plano Ivory Board 300gsm dari Gudang Bahan Baku ke Gudang Produksi",
    hashChecksum: "5d41402abc4b2a76b9719d911017c592b02a927a7183e8b088b488730b923157",
    beforeData: { origin_qty: 3200, destination_qty: 150 },
    afterData: { origin_qty: 2700, destination_qty: 650 },
  },
  {
    id: "AUD-99117",
    timestamp: "2026-09-23 16:20:00",
    userName: "Ahmad Fauzi",
    userRole: "Front Office",
    ipAddress: "192.168.1.18",
    module: "ORDERS",
    action: "CREATE",
    recordId: "ORD-2026-0104",
    description: "Input Order Baru: 5.000 Pcs Hardbox Premium PT Kuliner Nusantara Sejahtera",
    hashChecksum: "cf51a84f3f4c1e4c92a95e7d58d929497d519b7a3a9686016c90538a7989d98e",
    beforeData: null,
    afterData: { order_number: "ORD-2026-0104", qty: 5000, is_express: false, revisions_used: 1 },
  },
  {
    id: "AUD-99116",
    timestamp: "2026-09-23 14:10:55",
    userName: "Sari Indah",
    userRole: "Tim Design",
    ipAddress: "192.168.1.25",
    module: "BOM",
    action: "CREATE",
    recordId: "BOM-2026-0089",
    description: "Kalkulasi konversi plano ke potong & approval toleransi waste 4.8% untuk ORD-2026-0104",
    hashChecksum: "8a6358ff05e3f4c398327150117079e000494cf5bb6ec5bb72199b0c9f13615e",
    beforeData: null,
    afterData: { sheet_cut: 4, plano_needed: 1250, waste_pct: 4.8, insheet_sheets: 60 },
  },
];

// ===== LOW-LEVEL STORAGE HELPERS =====

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { key } }));
  } catch {
    // ignore storage quota errors
  }
}

function generateHash(seed: string): string {
  let h1 = 0xdeadbeef ^ seed.length;
  let h2 = 0x41c6ce57 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const hex2 = (h2 >>> 0).toString(16).padStart(8, "0");
  const hex3 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, "0");
  const hex4 = ((h1 + h2) >>> 0).toString(16).padStart(8, "0");
  return `${hex1}${hex2}${hex3}${hex4}${hex1}${hex2}${hex3}${hex4}`;
}

export function appendAuditLog(params: {
  userName?: string;
  userRole?: string;
  module: AuditLogEntry["module"];
  action: AuditLogEntry["action"];
  recordId: string;
  description: string;
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
}): void {
  const logs = readJson<AuditLogEntry[]>(AUDIT_STORAGE_KEY, INITIAL_AUDIT_LOGS);
  const now = new Date();
  const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  const id = `AUD-${Math.floor(10000 + Math.random() * 90000)}`;
  const entry: AuditLogEntry = {
    id,
    timestamp: ts,
    userName: params.userName || "Operator Sistem",
    userRole: params.userRole || "Manager",
    ipAddress: "192.168.1.10",
    module: params.module,
    action: params.action,
    recordId: params.recordId,
    description: params.description,
    hashChecksum: generateHash(`${id}-${ts}-${params.recordId}-${params.description}`),
    beforeData: params.beforeData ?? null,
    afterData: params.afterData ?? null,
  };
  writeJson(AUDIT_STORAGE_KEY, [entry, ...logs]);
}

// ===== CROSS-MODULE SYNCHRONIZATION HELPERS =====

/**
 * Saat Order di-ACC Desain (atau Order Cetak Custom baru masuk),
 * otomatis tambahkan ke antrean BOM Calculator jika belum ada.
 */
export function syncOrderToBomQueue(order: OrderItem): void {
  if (order.orderServiceType === "Beli Produk Jadi") {
    // Jika beli produk jadi (Ready Stock), langsung terbitkan Invoice otomatis
    createInvoiceFromOrder({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerCompany: order.customerName,
      productName: order.productName,
      quantity: order.quantity,
    });
    return;
  }

  const queue = readJson<OrderForBom[]>(BOM_QUEUE_STORAGE_KEY, INITIAL_BOM_QUEUE);
  const exists = queue.some((q) => q.orderNumber === order.orderNumber);
  if (exists) return;

  // Parse GSM dari paperType (misal "Kertas Ivory 300 GSM" -> 300)
  const gsmMatch = order.paperType.match(/(\d{2,3})\s*GSM/i);
  const parsedGsm = gsmMatch ? Number(gsmMatch[1]) : 300;

  // Parse dimensi (misal "25 × 20 × 8 cm" -> cutLength & cutWidth)
  const nums = (order.dimensions.match(/\d+(\.\d+)?/g) || []).map(Number);
  const cutL = nums[0] ? Math.min(Math.max(nums[0] * 1.8, 18), 54) : 36;
  const cutW = nums[1] ? Math.min(Math.max(nums[1] * 1.6, 14), 40) : 24;

  const newBomItem: OrderForBom = {
    id: `bom-${Date.now()}`,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    brand: order.brand,
    productName: order.productName,
    orderQuantity: order.quantity,
    paperType: order.paperType,
    paperGsm: parsedGsm,
    planoLengthCm: 109,
    planoWidthCm: 79,
    cutLengthCm: Math.round(cutL),
    cutWidthCm: Math.round(cutW),
    wastePercent: 5,
    insheetQuantity: Math.max(50, Math.round(order.quantity * 0.04)),
    status: "Belum Dihitung",
  };

  writeJson(BOM_QUEUE_STORAGE_KEY, [newBomItem, ...queue]);
}

/**
 * Saat BOM selesai dihitung & disimpan, otomatis perbarui status Order
 * menjadi "In-Production" dan tambahkan ke antrean Kanban Produksi.
 */
export function syncBomToDownstream(params: {
  bomOrder: OrderForBom;
  totalPlanoSheets: number;
  cutsPerPlano: number;
  userName?: string;
  userRole?: string;
}): string {
  const { bomOrder, totalPlanoSheets, cutsPerPlano, userName, userRole } = params;
  const spkNo = `SPK-INT-2026-${Math.floor(100 + Math.random() * 899)}`;

  // 1. Update status di BOM Queue -> "BOM Selesai"
  const queue = readJson<OrderForBom[]>(BOM_QUEUE_STORAGE_KEY, INITIAL_BOM_QUEUE);
  writeJson(
    BOM_QUEUE_STORAGE_KEY,
    queue.map((q) => (q.orderNumber === bomOrder.orderNumber ? { ...q, status: "BOM Selesai" } : q))
  );

  // 2. Update status di Orders -> "In-Production"
  const orders = readJson<OrderItem[]>(ORDERS_STORAGE_KEY, INITIAL_ORDERS);
  const matchedOrder = orders.find((o) => o.orderNumber === bomOrder.orderNumber);
  if (matchedOrder) {
    writeJson(
      ORDERS_STORAGE_KEY,
      orders.map((o) =>
        o.orderNumber === bomOrder.orderNumber ? { ...o, status: "In-Production" } : o
      )
    );
  }

  // 3. Tambahkan ke Kanban Produksi jika belum ada untuk orderNumber tersebut
  const kanban = readJson<KanbanTask[]>(KANBAN_STORAGE_KEY, INITIAL_KANBAN_TASKS);
  const existingKanban = kanban.find((k) => k.orderNumber === bomOrder.orderNumber);
  const deadlineIso = matchedOrder?.deadline || getFutureIsoDate(4);
  const priorityInfo = calculatePriorityFromDeadline(deadlineIso);

  if (!existingKanban) {
    const newTask: KanbanTask = {
      id: `kb-${Date.now()}`,
      spkNumber: spkNo,
      orderNumber: bomOrder.orderNumber,
      customerName: bomOrder.customerName,
      brand: bomOrder.brand,
      productName: bomOrder.productName,
      quantity: bomOrder.orderQuantity,
      priority: priorityInfo.priority,
      orderDate: matchedOrder?.orderDate || getTodayIsoDate(),
      rawOrderDate: matchedOrder?.orderDate || getTodayIsoDate(),
      deadline: deadlineIso,
      rawDeadline: deadlineIso,
      stage: "Design Approved",
      machineAssigned: "Belum Dialokasikan",
      operatorAssigned: "Belum Ditugaskan",
    };
    writeJson(KANBAN_STORAGE_KEY, [newTask, ...kanban]);
  }

  // 4. Catat ke Audit Trail
  appendAuditLog({
    userName,
    userRole,
    module: "BOM",
    action: "CREATE",
    recordId: bomOrder.orderNumber,
    description: `Menyimpan kalkulasi BOM (${totalPlanoSheets} lembar plano, ${cutsPerPlano} potong/plano) & meneruskan ke antrean SPK/Kanban (${spkNo})`,
    beforeData: { status: "Belum Dihitung" },
    afterData: {
      status: "BOM Selesai",
      plano_needed: totalPlanoSheets,
      cuts_per_plano: cutsPerPlano,
      generated_spk: spkNo,
    },
  });

  return spkNo;
}

/**
 * Saat SPK baru ditambahkan atau diterbitkan dari halaman SPK Digital,
 * sinkronkan otomatis ke papan Kanban Produksi.
 */
export function syncSpkToKanban(params: {
  spkNumber: string;
  orderNumber: string;
  customerName: string;
  brand: string;
  productName: string;
  quantity: number;
  deadline: string;
  machineOrVendor?: string;
  picName?: string;
  status: string;
  userName?: string;
  userRole?: string;
}): void {
  const kanban = readJson<KanbanTask[]>(KANBAN_STORAGE_KEY, INITIAL_KANBAN_TASKS);
  const priorityInfo = calculatePriorityFromDeadline(params.deadline);
  const exists = kanban.find(
    (t) => t.spkNumber === params.spkNumber || (params.orderNumber && t.orderNumber === params.orderNumber)
  );

  const mappedStage: KanbanTask["stage"] =
    params.status === "In-Production"
      ? "In-Progress"
      : params.status === "Selesai"
      ? "QC Pending"
      : "Design Approved";

  if (exists) {
    writeJson(
      KANBAN_STORAGE_KEY,
      kanban.map((t) =>
        t.id === exists.id
          ? {
              ...t,
              spkNumber: params.spkNumber,
              customerName: params.customerName,
              brand: params.brand,
              productName: params.productName,
              quantity: params.quantity,
              deadline: params.deadline,
              rawDeadline: params.deadline,
              priority: priorityInfo.priority,
              machineAssigned: params.machineOrVendor || t.machineAssigned,
              operatorAssigned: params.picName || t.operatorAssigned,
            }
          : t
      )
    );
  } else {
    const newTask: KanbanTask = {
      id: `kb-${Date.now()}`,
      spkNumber: params.spkNumber,
      orderNumber: params.orderNumber || `ORD-2026-${Math.floor(1000 + Math.random() * 8999)}`,
      customerName: params.customerName,
      brand: params.brand,
      productName: params.productName,
      quantity: params.quantity,
      priority: priorityInfo.priority,
      orderDate: getTodayIsoDate(),
      rawOrderDate: getTodayIsoDate(),
      deadline: params.deadline,
      rawDeadline: params.deadline,
      stage: mappedStage,
      machineAssigned: params.machineOrVendor || "Belum Dialokasikan",
      operatorAssigned: params.picName || "Belum Ditugaskan",
    };
    writeJson(KANBAN_STORAGE_KEY, [newTask, ...kanban]);
  }
}

/**
 * Saat kartu Kanban dipindahkan ke tahap "QC Pending",
 * otomatis tambahkan batch tersebut ke halaman Quality Control (QC).
 */
export function syncKanbanTaskToQc(task: KanbanTask): void {
  const qcList = readJson<InspectionTask[]>(QC_STORAGE_KEY, INITIAL_QC_TASKS);
  const exists = qcList.find(
    (q) => q.spkNumber === task.spkNumber || q.orderNumber === task.orderNumber
  );

  const todayIso = getTodayIsoDate();
  if (exists) {
    writeJson(
      QC_STORAGE_KEY,
      qcList.map((q) =>
        q.id === exists.id ? { ...q, result: "Pending", rawInspectionDate: todayIso } : q
      )
    );
  } else {
    const newQc: InspectionTask = {
      id: `qc-${Date.now()}`,
      spkNumber: task.spkNumber,
      orderNumber: task.orderNumber,
      brand: task.brand,
      customerName: task.customerName,
      productName: task.productName,
      quantity: task.quantity,
      inspectorName: "Nina Sari (QC Inspector)",
      inspectionDate: new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      rawInspectionDate: todayIso,
      result: "Pending",
      reworkCount: 0,
      checklist: {
        dimensions: true,
        colorAccuracy: true,
        glueAdhesion: true,
        foilEmbossQuality: true,
        cleanliness: true,
      },
    };
    writeJson(QC_STORAGE_KEY, [newQc, ...qcList]);
  }
}

/**
 * Membuat Invoice otomatis dari Order atau hasil QC PASS.
 */
export function createInvoiceFromOrder(params: {
  orderNumber: string;
  customerName: string;
  customerCompany?: string;
  productName: string;
  quantity: number;
  unitPrice?: number;
}): InvoiceItem {
  const invoices = readJson<InvoiceItem[]>(INVOICES_STORAGE_KEY, INITIAL_INVOICES);
  const existing = invoices.find((inv) => inv.orderNumber === params.orderNumber);
  if (existing) return existing;

  const unitPrice = params.unitPrice || 2650;
  const subtotal = params.quantity * unitPrice;
  const totalWithPpn = Math.round(subtotal * 1.11); // PPN 11%
  const seq = String(invoices.length + 86).padStart(4, "0");

  const newInv: InvoiceItem = {
    id: `INV-2026-${seq}`,
    invoiceNumber: `INV/2026/11/${seq}`,
    orderNumber: params.orderNumber,
    customerName: params.customerName,
    customerCompany: params.customerCompany || params.customerName,
    issueDate: getTodayIsoDate(),
    dueDate: getFutureIsoDate(14),
    amount: totalWithPpn,
    paidAmount: 0,
    status: "BELUM_BAYAR",
    itemsSummary: `${params.quantity.toLocaleString("id-ID")} Pcs ${params.productName}`,
    quantity: params.quantity,
    unitPrice,
  };

  writeJson(INVOICES_STORAGE_KEY, [newInv, ...invoices]);
  return newInv;
}

/**
 * Saat hasil inspeksi QC disimpan (PASS atau FAIL):
 * - Jika PASS: terbitkan Invoice otomatis & ubah status Order jadi "Siap Kirim (Ready Stock)"
 * - Jika FAIL: kembalikan kartu Kanban ke tahap "Finishing" untuk rework
 */
export function syncQcDecisionToDownstream(params: {
  task: InspectionTask;
  decision: "PASS" | "FAIL";
  defectNotes?: string;
  userName?: string;
  userRole?: string;
}): void {
  const { task, decision, defectNotes, userName, userRole } = params;

  if (decision === "PASS") {
    // 1. Buat Invoice otomatis jika belum ada
    createInvoiceFromOrder({
      orderNumber: task.orderNumber,
      customerName: task.customerName,
      customerCompany: task.customerName,
      productName: task.productName,
      quantity: task.quantity,
    });

    // 2. Update status Order jadi "Siap Kirim (Ready Stock)"
    const orders = readJson<OrderItem[]>(ORDERS_STORAGE_KEY, INITIAL_ORDERS);
    writeJson(
      ORDERS_STORAGE_KEY,
      orders.map((o) =>
        o.orderNumber === task.orderNumber ? { ...o, status: "Siap Kirim (Ready Stock)" } : o
      )
    );
  } else {
    // Jika FAIL -> kembalikan kartu Kanban ke tahap "Finishing" untuk re-work
    const kanban = readJson<KanbanTask[]>(KANBAN_STORAGE_KEY, INITIAL_KANBAN_TASKS);
    writeJson(
      KANBAN_STORAGE_KEY,
      kanban.map((k) =>
        k.spkNumber === task.spkNumber || k.orderNumber === task.orderNumber
          ? { ...k, stage: "Finishing" }
          : k
      )
    );
  }

  // Catat ke Audit Trail
  appendAuditLog({
    userName: userName || task.inspectorName,
    userRole: userRole || "Quality Control",
    module: "QC",
    action: "INSPECT",
    recordId: task.spkNumber,
    description:
      decision === "PASS"
        ? `Inspeksi QC ${task.spkNumber} (${task.productName}): PASSED. Otomatis menerbitkan Invoice & status Ready to Deliver.`
        : `Inspeksi QC ${task.spkNumber} (${task.productName}): FAIL / RE-WORK (${defectNotes || "Cacat fisik"}). Dikembalikan ke produksi.`,
    beforeData: { result: task.result, rework_count: task.reworkCount },
    afterData: {
      result: decision,
      defect_notes: defectNotes || null,
      rework_count: decision === "FAIL" ? task.reworkCount + 1 : task.reworkCount,
    },
  });
}

// ===== REACTIVE HOOKS =====

function useSyncedStorage<T>(key: string, initialData: T) {
  const [data, setData] = useState<T>(initialData);

  useEffect(() => {
    setData(readJson<T>(key, initialData));

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ key?: string }>;
      if (!customEvent.detail?.key || customEvent.detail.key === key) {
        setData(readJson<T>(key, initialData));
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === key) {
        setData(readJson<T>(key, initialData));
      }
    };

    window.addEventListener(SYNC_EVENT, handleSync);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(SYNC_EVENT, handleSync);
      window.removeEventListener("storage", handleStorage);
    };
  }, [key, initialData]);

  const updateData = useCallback(
    (next: T | ((prev: T) => T)) => {
      const current = readJson<T>(key, initialData);
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(current) : next;
      setData(resolved);
      writeJson<T>(key, resolved);
    },
    [key, initialData]
  );

  return [data, updateData] as const;
}

export function useOrdersStore() {
  return useSyncedStorage<OrderItem[]>(ORDERS_STORAGE_KEY, INITIAL_ORDERS);
}

export function useBomQueueStore() {
  return useSyncedStorage<OrderForBom[]>(BOM_QUEUE_STORAGE_KEY, INITIAL_BOM_QUEUE);
}

export function useKanbanStore() {
  return useSyncedStorage<KanbanTask[]>(KANBAN_STORAGE_KEY, INITIAL_KANBAN_TASKS);
}

export function useQcStore() {
  return useSyncedStorage<InspectionTask[]>(QC_STORAGE_KEY, INITIAL_QC_TASKS);
}

export function useInvoicesStore() {
  return useSyncedStorage<InvoiceItem[]>(INVOICES_STORAGE_KEY, INITIAL_INVOICES);
}

export function useAuditLogsStore() {
  return useSyncedStorage<AuditLogEntry[]>(AUDIT_STORAGE_KEY, INITIAL_AUDIT_LOGS);
}
