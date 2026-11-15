"use client";

import { useCallback, useEffect, useState } from "react";

// =====================================================================
// Master Data Pelanggan (Customers) & Master Vendor Mitra Maklon (Vendors)
// Disimpan di localStorage agar tersinkronisasi antara:
// - /dashboard/master/customers <-> /dashboard/orders (Repeat vs Baru)
// - /dashboard/master/vendors   <-> /dashboard/spk & /dashboard/production
// =====================================================================

export type CustomerSegment = "Korporat B2B" | "Brand Skincare / Kosmetik" | "F&B / Kuliner" | "UMKM / Retail";

export interface CustomerMasterItem {
  id: string;
  code: string;
  name: string;
  pic: string;
  phone: string;
  email: string;
  address: string;
  segment: CustomerSegment;
  preferredBrand: string;
  lastProductSpec?: string;
  lastDimensions?: string;
  lastPaperType?: string;
  lastFinishing?: string[];
  totalRepeatOrders: number;
  active: boolean;
}

export interface VendorMasterItem {
  id: string;
  code: string;
  name: string;
  specialty: "Cetak Offset Skala Besar" | "Hot Print Foil & Emboss" | "Die-Cut Pond & Rigid Box" | "UV Spot & Laminasi" | "Lainnya";
  pic: string;
  phone: string;
  email: string;
  address: string;
  slaLeadTimeDays: number;
  defectRatePercent: number;
  capacityPerDay: string;
  active: boolean;
}

export type PicDivision =
  | "Cetak Offset"
  | "Pond & Die-Cut"
  | "Laminasi & Foil"
  | "Finishing & Lem"
  | "Subkontrak Vendor";

export interface ProductionPicMasterItem {
  id: string;
  code: string;
  name: string;
  roleTitle: string;
  division: PicDivision;
  defaultMachine: string;
  shift: "Shift Pagi" | "Shift Siang" | "Reguler";
  phone: string;
  activeJobs: number;
  active: boolean;
}

export type AutoPriorityLevel = "Express" | "High" | "Normal";

export interface DeadlinePriorityInfo {
  priority: AutoPriorityLevel;
  daysRemaining: number;
  hoursRemaining: number;
  formattedDeadline: string;
  countdownLabel: string;
}

/**
 * Menghitung tingkat prioritas secara otomatis berdasarkan selisih waktu menuju tanggal deadline:
 * - <= 2 hari (<= 48 jam) : Express
 * - 3 s/d 5 hari          : High
 * - > 5 hari              : Normal
 */
export function calculatePriorityFromDeadline(
  deadlineIso: string,
  referenceDateStr?: string
): DeadlinePriorityInfo {
  const now = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const parsed = new Date(deadlineIso);
  if (Number.isNaN(parsed.getTime())) {
    return {
      priority: "Normal",
      daysRemaining: 7,
      hoursRemaining: 168,
      formattedDeadline: deadlineIso || "-",
      countdownLabel: "7 hari lagi",
    };
  }

  const targetDate = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const diffMs = targetDate.getTime() - todayStart.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.max(0, daysRemaining * 24);

  let priority: AutoPriorityLevel = "Normal";
  if (daysRemaining <= 2) {
    priority = "Express";
  } else if (daysRemaining <= 5) {
    priority = "High";
  }

  const formattedDeadline = targetDate.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const countdownLabel =
    daysRemaining < 0
      ? `Terlewat ${Math.abs(daysRemaining)} hari`
      : daysRemaining === 0
      ? "Hari ini (Kritis <24 Jam)"
      : daysRemaining === 1
      ? "Besok (H-1)"
      : `H-${daysRemaining} (${daysRemaining} hari lagi)`;

  return {
    priority,
    daysRemaining,
    hoursRemaining,
    formattedDeadline,
    countdownLabel,
  };
}

/** Mengembalikan tanggal hari ini dalam format YYYY-MM-DD (waktu lokal) */
export function getTodayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Mengembalikan tanggal H+offsetDays dari hari ini dalam format YYYY-MM-DD */
export function getFutureIsoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const CUSTOMERS_STORAGE_KEY = "sip_master_customers_v1";
const VENDORS_STORAGE_KEY = "sip_master_vendors_v1";
const PICS_STORAGE_KEY = "sip_master_production_pics_v1";

export const INITIAL_CUSTOMERS: CustomerMasterItem[] = [
  {
    id: "cust-1",
    code: "CUST-001",
    name: "PT Artha Boga Sejahtera",
    pic: "Bpk. Hendra Wijaya",
    phone: "0812-3456-7890",
    email: "purchasing@arthaboga.co.id",
    address: "Kawasan Industri Pulogadung Blok J-12, Jakarta Timur",
    segment: "Korporat B2B",
    preferredBrand: "Packsolution.id",
    lastProductSpec: "Hardbox Rigid Premium Magnetic Gold",
    lastDimensions: "25 × 20 × 8 cm",
    lastPaperType: "Kertas Ivory 300 GSM Plano",
    lastFinishing: ["Laminasi Doff", "Foil Gold/Silver", "Die-Cut / Pond"],
    totalRepeatOrders: 14,
    active: true,
  },
  {
    id: "cust-2",
    code: "CUST-002",
    name: "Estella Glow Skincare",
    pic: "Ibu Clarissa Putri",
    phone: "0811-9876-5432",
    email: "supplychain@estellaglow.id",
    address: "Jl. Sunset Road No. 88, Denpasar, Bali",
    segment: "Brand Skincare / Kosmetik",
    preferredBrand: "Estella",
    lastProductSpec: "Softbox Skincare Serum Matte Doff",
    lastDimensions: "12 × 5 × 5 cm",
    lastPaperType: "Kraft Liner Brown 275 GSM",
    lastFinishing: ["Laminasi Doff", "Emboss / Deboss", "Die-Cut / Pond"],
    totalRepeatOrders: 9,
    active: true,
  },
  {
    id: "cust-3",
    code: "CUST-003",
    name: "Pepipapier Stationery",
    pic: "Kak Nadia Kusuma",
    phone: "0857-1122-3344",
    email: "hello@pepipapier.com",
    address: "Jl. Dago Asri No. 21, Bandung",
    segment: "UMKM / Retail",
    preferredBrand: "Pepipapier",
    lastProductSpec: "Greeting Card & Custom Envelope Foil",
    lastDimensions: "15 × 10 cm",
    lastPaperType: "Art Paper 150 GSM",
    lastFinishing: ["Foil Gold/Silver", "Emboss / Deboss"],
    totalRepeatOrders: 6,
    active: true,
  },
  {
    id: "cust-4",
    code: "CUST-004",
    name: "Kopi Kenangan Senja",
    pic: "Bpk. Antonius Pratama",
    phone: "0813-5566-7788",
    email: "procurement@kopisenja.id",
    address: "Jl. Senopati No. 45, Jakarta Selatan",
    segment: "F&B / Kuliner",
    preferredBrand: "Packsolution.id",
    lastProductSpec: "Lunch Box Eco-Kraft Laminated (M)",
    lastDimensions: "18 × 12 × 5 cm",
    lastPaperType: "Kraft Liner Brown 275 GSM",
    lastFinishing: ["Laminasi Glossy", "Die-Cut / Pond"],
    totalRepeatOrders: 21,
    active: true,
  },
  {
    id: "cust-5",
    code: "CUST-005",
    name: "Studio Memoirs Photobook",
    pic: "Bpk. Kevin Adrian",
    phone: "0818-2233-4455",
    email: "order@memoirsprint.id",
    address: "Jl. Mayjen Sungkono No. 110, Surabaya",
    segment: "UMKM / Retail",
    preferredBrand: "memoirs.print",
    lastProductSpec: "Custom Photobook Hardcover Linen",
    lastDimensions: "30 × 21 × 2 cm",
    lastPaperType: "Art Carton 260 GSM Plano",
    lastFinishing: ["Laminasi Doff", "Spot UV"],
    totalRepeatOrders: 5,
    active: true,
  },
];

export const INITIAL_VENDORS: VendorMasterItem[] = [
  {
    id: "vnd-1",
    code: "VND-001",
    name: "Vendor Offset Komori",
    specialty: "Cetak Offset Skala Besar",
    pic: "Bpk. Bambang Suryono",
    phone: "0812-8800-1122",
    email: "produksi@offsetkomori-mitra.co.id",
    address: "Jl. Raya Kaligawe KM 5, Semarang",
    slaLeadTimeDays: 3,
    defectRatePercent: 1.2,
    capacityPerDay: "25.000 Plano / Hari",
    active: true,
  },
  {
    id: "vnd-2",
    code: "VND-002",
    name: "Vendor Foil & Emboss Kurnia",
    specialty: "Hot Print Foil & Emboss",
    pic: "Koh Hendry Kurnia",
    phone: "0811-2700-3344",
    email: "order@kurniafoil.com",
    address: "Kawasan Industri Candi Blok B-7, Semarang",
    slaLeadTimeDays: 2,
    defectRatePercent: 0.8,
    capacityPerDay: "12.000 Lembar / Hari",
    active: true,
  },
  {
    id: "vnd-3",
    code: "VND-003",
    name: "Vendor Die-Cut Rigid",
    specialty: "Die-Cut Pond & Rigid Box",
    pic: "Bpk. Wahyu Hidayat",
    phone: "0813-9090-5566",
    email: "admin@rigidpond-maklon.id",
    address: "Jl. Majapahit No. 214, Semarang",
    slaLeadTimeDays: 4,
    defectRatePercent: 1.5,
    capacityPerDay: "8.000 Box / Hari",
    active: true,
  },
  {
    id: "vnd-4",
    code: "VND-004",
    name: "Vendor UV Varnish",
    specialty: "UV Spot & Laminasi",
    pic: "Ibu Ratna Sari",
    phone: "0856-4000-7788",
    email: "cs@uvvarnish-coating.co.id",
    address: "Jl. Gatot Subroto Kav. 19, Semarang",
    slaLeadTimeDays: 2,
    defectRatePercent: 0.6,
    capacityPerDay: "18.000 Lembar / Hari",
    active: true,
  },
];

export const INITIAL_PRODUCTION_PICS: ProductionPicMasterItem[] = [
  {
    id: "pic-1",
    code: "PIC-001",
    name: "Rudi Hartono",
    roleTitle: "Kepala Produksi & Koordinator Mesin",
    division: "Cetak Offset",
    defaultMachine: "Heidelberg SM-74 (4 Warna)",
    shift: "Shift Pagi",
    phone: "0812-3000-1101",
    activeJobs: 2,
    active: true,
  },
  {
    id: "pic-2",
    code: "PIC-002",
    name: "Joko Santoso",
    roleTitle: "Operator Cetak Offset Senior A",
    division: "Cetak Offset",
    defaultMachine: "Heidelberg SM-52 / SM-74",
    shift: "Shift Pagi",
    phone: "0813-3000-1102",
    activeJobs: 1,
    active: true,
  },
  {
    id: "pic-3",
    code: "PIC-003",
    name: "Bambang Supriyadi",
    roleTitle: "Operator Cetak Offset Senior B",
    division: "Cetak Offset",
    defaultMachine: "Oliver 58 / Komori L-428",
    shift: "Shift Siang",
    phone: "0812-3000-1103",
    activeJobs: 1,
    active: true,
  },
  {
    id: "pic-4",
    code: "PIC-004",
    name: "Ahmad Subagio",
    roleTitle: "Teknisi Pond & Die-Cut Presisi",
    division: "Pond & Die-Cut",
    defaultMachine: "Mesin Pond & Die-Cut Bobst",
    shift: "Shift Pagi",
    phone: "0857-3000-1104",
    activeJobs: 1,
    active: true,
  },
  {
    id: "pic-5",
    code: "PIC-005",
    name: "Slamet Riyadi",
    roleTitle: "Teknisi Finishing, Laminasi & Lem",
    division: "Finishing & Lem",
    defaultMachine: "Mesin Pengeleman Hotmelt Otomatis",
    shift: "Shift Pagi",
    phone: "0815-3000-1105",
    activeJobs: 2,
    active: true,
  },
  {
    id: "pic-6",
    code: "PIC-006",
    name: "Wahyu Pratama",
    roleTitle: "PIC Pengawasan Subkontrak Vendor Mitra",
    division: "Subkontrak Vendor",
    defaultMachine: "Vendor Foil & Emboss Kurnia / Komori",
    shift: "Reguler",
    phone: "0811-3000-1106",
    activeJobs: 1,
    active: true,
  },
];

export function loadCustomersFromStorage(): CustomerMasterItem[] {
  if (typeof window === "undefined") return INITIAL_CUSTOMERS;
  try {
    const raw = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_CUSTOMERS;
}

export function saveCustomersToStorage(list: CustomerMasterItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("sip-customers-updated"));
  } catch {}
}

export function loadVendorsFromStorage(): VendorMasterItem[] {
  if (typeof window === "undefined") return INITIAL_VENDORS;
  try {
    const raw = localStorage.getItem(VENDORS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_VENDORS;
}

export function saveVendorsToStorage(list: VendorMasterItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("sip-vendors-updated"));
  } catch {}
}

export function useCustomerMaster() {
  const [customers, setCustomers] = useState<CustomerMasterItem[]>(() => loadCustomersFromStorage());

  useEffect(() => {
    const sync = () => setCustomers(loadCustomersFromStorage());
    window.addEventListener("sip-customers-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("sip-customers-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const updateCustomers = useCallback((next: CustomerMasterItem[]) => {
    setCustomers(next);
    saveCustomersToStorage(next);
  }, []);

  return { customers, updateCustomers };
}

export function useVendorMaster() {
  const [vendors, setVendors] = useState<VendorMasterItem[]>(() => loadVendorsFromStorage());

  useEffect(() => {
    const sync = () => setVendors(loadVendorsFromStorage());
    window.addEventListener("sip-vendors-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("sip-vendors-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const updateVendors = useCallback((next: VendorMasterItem[]) => {
    setVendors(next);
    saveVendorsToStorage(next);
  }, []);

  return { vendors, updateVendors };
}

export function loadProductionPicsFromStorage(): ProductionPicMasterItem[] {
  if (typeof window === "undefined") return INITIAL_PRODUCTION_PICS;
  try {
    const raw = localStorage.getItem(PICS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_PRODUCTION_PICS;
}

export function saveProductionPicsToStorage(list: ProductionPicMasterItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PICS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("sip-production-pics-updated"));
  } catch {}
}

export function useProductionPicMaster() {
  const [pics, setPics] = useState<ProductionPicMasterItem[]>(() => loadProductionPicsFromStorage());

  useEffect(() => {
    const sync = () => setPics(loadProductionPicsFromStorage());
    window.addEventListener("sip-production-pics-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("sip-production-pics-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const updatePics = useCallback((next: ProductionPicMasterItem[]) => {
    setPics(next);
    saveProductionPicsToStorage(next);
  }, []);

  return { pics, updatePics };
}

