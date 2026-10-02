"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  IconPackage,
  IconWarehouse,
  IconTag,
  IconAlertTriangle,
  IconPlus,
  IconTransfer,
  IconCheck,
  IconX,
  IconSearch,
  IconRefresh,
  IconCalendar,
  IconShield,
  IconLayers,
  IconFilter,
} from "@/components/icons/Icons";

interface MaterialItem {
  id: string;
  sku: string;
  name: string;
  category: "Bahan Baku Utama" | "Barang Setengah Jadi" | "Barang Jadi" | "Consumables & Tinta";
  brand: "Packsolution.id" | "Estella" | "Pepipapier" | "memoirs.print" | "pikpurry" | "Semua Brand";
  warehouse: "Gudang 1" | "Gudang 2";
  stock: number;
  unit: "Rim" | "Lembar" | "Kg" | "Kaleng" | "Roll" | "Pcs";
  rop: number;
  safetyStock: number;
  batchLot: string;
  expiryDate?: string;
  moisturePercent?: number;
  unitPrice: number;
}

const INITIAL_MATERIALS: MaterialItem[] = [
  {
    id: "1",
    sku: "MAT-IVR-300",
    name: "Kertas Ivory 300 GSM Plano (79 x 109 cm)",
    category: "Bahan Baku Utama",
    brand: "Packsolution.id",
    warehouse: "Gudang 1",
    stock: 45,
    unit: "Rim",
    rop: 60,
    safetyStock: 30,
    batchLot: "LOT-2026-IV300",
    moisturePercent: 5.8,
    unitPrice: 385000,
  },
  {
    id: "2",
    sku: "MAT-ART-150",
    name: "Art Paper 150 GSM Plano (65 x 100 cm)",
    category: "Bahan Baku Utama",
    brand: "memoirs.print",
    warehouse: "Gudang 1",
    stock: 120,
    unit: "Rim",
    rop: 50,
    safetyStock: 25,
    batchLot: "LOT-2026-AP150",
    moisturePercent: 5.2,
    unitPrice: 240000,
  },
  {
    id: "3",
    sku: "MAT-DUP-350",
    name: "Kertas Duplex Coated 350 GSM (79 x 109 cm)",
    category: "Bahan Baku Utama",
    brand: "pikpurry",
    warehouse: "Gudang 2",
    stock: 85,
    unit: "Rim",
    rop: 40,
    safetyStock: 20,
    batchLot: "LOT-2026-DP350",
    moisturePercent: 6.1,
    unitPrice: 310000,
  },
  {
    id: "4",
    sku: "MAT-KRFT-275",
    name: "Kraft Liner Brown 275 GSM (90 x 120 cm)",
    category: "Bahan Baku Utama",
    brand: "Estella",
    warehouse: "Gudang 2",
    stock: 38,
    unit: "Rim",
    rop: 35,
    safetyStock: 15,
    batchLot: "LOT-2026-KF275",
    moisturePercent: 6.4,
    unitPrice: 275000,
  },
  {
    id: "5",
    sku: "MAT-INK-CYAN",
    name: "Tinta UV Offset Cyan Premium",
    category: "Consumables & Tinta",
    brand: "Semua Brand",
    warehouse: "Gudang 1",
    stock: 4,
    unit: "Kaleng",
    rop: 10,
    safetyStock: 5,
    batchLot: "LOT-INK-CY26",
    expiryDate: "25 Okt 2026",
    unitPrice: 420000,
  },
  {
    id: "6",
    sku: "MAT-INK-BLK",
    name: "Tinta Offset Hitam Pekat Toyo Ink",
    category: "Consumables & Tinta",
    brand: "Semua Brand",
    warehouse: "Gudang 1",
    stock: 22,
    unit: "Kaleng",
    rop: 15,
    safetyStock: 8,
    batchLot: "LOT-INK-BK26",
    expiryDate: "15 Jan 2027",
    unitPrice: 350000,
  },
  {
    id: "7",
    sku: "MAT-FOL-GLD",
    name: "Foil Stamping Hot Print Shiny Gold 64cm",
    category: "Consumables & Tinta",
    brand: "Pepipapier",
    warehouse: "Gudang 1",
    stock: 6,
    unit: "Roll",
    rop: 5,
    safetyStock: 2,
    batchLot: "LOT-FOL-GD01",
    unitPrice: 580000,
  },
  {
    id: "8",
    sku: "MAT-HBX-P01",
    name: "Greyboard No. 30 Tebal 2.0mm Potong Hardbox",
    category: "Barang Setengah Jadi",
    brand: "Packsolution.id",
    warehouse: "Gudang 2",
    stock: 320,
    unit: "Lembar",
    rop: 200,
    safetyStock: 100,
    batchLot: "LOT-GB-200MM",
    moisturePercent: 7.0,
    unitPrice: 18500,
  },
  {
    id: "9",
    sku: "MAT-GLU-HOT",
    name: "Lem Panas Hotmelt EVA Pelapis Box",
    category: "Consumables & Tinta",
    brand: "Semua Brand",
    warehouse: "Gudang 2",
    stock: 50,
    unit: "Kg",
    rop: 25,
    safetyStock: 10,
    batchLot: "LOT-GLU-EVA26",
    unitPrice: 65000,
  },
  {
    id: "10",
    sku: "MAT-FIN-BX01",
    name: "Box Kemasan Lipat Finishing Matte Estella",
    category: "Barang Jadi",
    brand: "Estella",
    warehouse: "Gudang 2",
    stock: 1500,
    unit: "Pcs",
    rop: 500,
    safetyStock: 200,
    batchLot: "LOT-FIN-EST01",
    unitPrice: 4200,
  },
];

export default function InventoryPage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<MaterialItem[]>(INITIAL_MATERIALS);

  // Filters
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("Semua");
  const [selectedBrand, setSelectedBrand] = useState<string>("Semua");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [onlyRopCritical, setOnlyRopCritical] = useState<boolean>(false);

  // Modals state
  const [showInboundModal, setShowInboundModal] = useState<boolean>(false);
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [showOpnameModal, setShowOpnameModal] = useState<boolean>(false);
  const [showRopDrawer, setShowRopDrawer] = useState<boolean>(false);
  const [selectedMaterialForTransfer, setSelectedMaterialForTransfer] = useState<MaterialItem | null>(null);

  // Toast / Status notification
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const warehouses = ["Semua", "Gudang 1", "Gudang 2"];
  const brands = ["Semua", "Packsolution.id", "Estella", "Pepipapier", "memoirs.print", "pikpurry"];
  const categories = [
    "Semua",
    "Bahan Baku Utama",
    "Barang Setengah Jadi",
    "Barang Jadi",
    "Consumables & Tinta",
  ];

  // Filtered materials
  const filteredMaterials = materials.filter((m) => {
    if (selectedWarehouse !== "Semua" && m.warehouse !== selectedWarehouse) return false;
    if (selectedBrand !== "Semua" && m.brand !== selectedBrand && m.brand !== "Semua Brand") return false;
    if (selectedCategory !== "Semua" && m.category !== selectedCategory) return false;
    if (onlyRopCritical && m.stock > m.rop) return false;
    if (
      searchQuery &&
      !m.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !m.sku.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Critical ROP items
  const ropItems = materials.filter((m) => m.stock <= m.rop);

  // Calculations
  const totalSku = materials.length;
  const totalValuation = materials.reduce((acc, m) => acc + m.stock * m.unitPrice, 0);

  const triggerToast = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 4000);
  };

  // Stock Status Helper
  const getStockStatus = (m: MaterialItem) => {
    if (m.stock <= m.rop) {
      return {
        label: "KRITIS (≤ ROP)",
        badgeClass: "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA] dark:bg-[#7F1D1D]/30 dark:text-[#F87171] dark:border-[#991B1B]/60",
        barClass: "bg-[#991B1B] dark:bg-[#F87171]",
      };
    }
    if (m.stock <= m.rop * 1.25) {
      return {
        label: "Mendekati ROP",
        badgeClass: "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A] dark:bg-[#78350F]/30 dark:text-[#FBBF24] dark:border-[#92400E]/60",
        barClass: "bg-[#FBBF24]",
      };
    }
    return {
      label: "Aman",
      badgeClass: "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0] dark:bg-[#064E3B]/30 dark:text-[#34D399] dark:border-[#065F46]/60",
      barClass: "bg-[#065F46] dark:bg-[#34D399]",
    };
  };

  return (
    <DashboardLayout title="Manajemen Inventori & ROP">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toast Notification */}
        {alertMessage && (
          <div className="p-3 rounded-lg bg-[#EFF4FE] dark:bg-[#1D4ED8]/25 border border-[#D6E3FC] dark:border-[#2563EB]/40 text-[#2B5FC7] dark:text-[#93C5FD] text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <IconCheck size={16} strokeWidth={2} />
              <span>{alertMessage}</span>
            </div>
            <button onClick={() => setAlertMessage(null)} className="text-current opacity-70 hover:opacity-100">
              <IconX size={14} />
            </button>
          </div>
        )}

        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2E6ED] dark:border-[#26334D]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#2B5FC7] dark:bg-[#3B6FE0]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B5FC7] dark:text-[#3B6FE0]">
                MOD-01 & MOD-06 · Multi-Gudang & Multi-Brand
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight">
              Katalog Persediaan Material
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
              Kelola stok bahan baku 2 gudang (Gudang 1 Utama & Gudang 2 Ruko) untuk 5 brand secara akurat.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* ROP Alert Button */}
            <button
              onClick={() => setShowRopDrawer(true)}
              className="relative px-3 py-2 rounded-lg text-xs font-medium bg-[#FEF2F2] hover:bg-[#FEE2E2] dark:bg-[#7F1D1D]/20 dark:hover:bg-[#7F1D1D]/30 border border-[#FECACA] dark:border-[#7F1D1D]/40 text-[#991B1B] dark:text-[#F87171] transition-colors flex items-center gap-1.5"
            >
              <IconAlertTriangle size={14} />
              <span>ROP Alert</span>
              {ropItems.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#991B1B] text-white dark:bg-[#F87171] dark:text-black">
                  {ropItems.length}
                </span>
              )}
            </button>

            {/* Transfer Antar-Gudang */}
            <button
              onClick={() => {
                setSelectedMaterialForTransfer(materials[0]);
                setShowTransferModal(true);
              }}
              className="px-3 py-2 rounded-lg text-xs font-medium border border-[#2B5FC7] text-[#2B5FC7] hover:bg-[#2B5FC7]/10 dark:border-[#3B6FE0] dark:text-[#3B6FE0] dark:hover:bg-[#3B6FE0]/15 transition-colors flex items-center gap-1.5"
            >
              <IconTransfer size={14} />
              <span>Transfer Gudang</span>
            </button>

            {/* Stock Opname */}
            <button
              onClick={() => setShowOpnameModal(true)}
              className="px-3 py-2 rounded-lg text-xs font-medium border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] bg-white dark:bg-[#16223A] hover:border-[#2B5FC7] transition-colors flex items-center gap-1.5"
            >
              <IconCalendar size={14} />
              <span>Stock Opname</span>
            </button>

            {/* Inbound Material */}
            <button
              onClick={() => setShowInboundModal(true)}
              className="px-3.5 py-2 rounded-lg text-xs font-medium bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] dark:hover:bg-[#2B5FC7] text-white shadow-sm transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              <IconPlus size={14} strokeWidth={2.5} />
              <span>Inbound Bahan</span>
            </button>
          </div>
        </div>

        {/* Operational Metric Summary Cards (4 Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total SKU */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Total Katalog SKU</span>
              <span className="p-1.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#2B5FC7] dark:text-[#3B6FE0]">
                <IconPackage size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mb-1 tracking-tight">
              {totalSku} SKU
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] flex items-center justify-between pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
              <span>4 Kategori material</span>
              <span className="text-[#065F46] dark:text-[#34D399] font-medium">Terverifikasi</span>
            </div>
          </div>

          {/* Card 2: Valuasi Persediaan */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Estimasi Nilai Persediaan</span>
              <span className="p-1.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#2B5FC7] dark:text-[#3B6FE0]">
                <IconWarehouse size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mb-1 tracking-tight">
              Rp {(totalValuation / 1000000).toFixed(1)} Juta
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] flex items-center justify-between pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
              <span>Gudang 1 & Gudang 2</span>
              <span className="font-mono text-[10px]">Rp {totalValuation.toLocaleString("id-ID")}</span>
            </div>
          </div>

          {/* Card 3: ROP Ambang Kritis */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Item Di Bawah Ambang (ROP)</span>
              <span className="p-1.5 rounded-lg bg-[#FEF2F2] dark:bg-[#7F1D1D]/30 border border-[#FECACA] dark:border-[#991B1B]/40 text-[#991B1B] dark:text-[#F87171]">
                <IconAlertTriangle size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#991B1B] dark:text-[#F87171] mb-1 tracking-tight">
              {ropItems.length} Material
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] flex items-center justify-between pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
              <span>Perlu Purchase Order (PO)</span>
              <span className="text-[#991B1B] dark:text-[#F87171] font-semibold">Tindakan Segera</span>
            </div>
          </div>

          {/* Card 4: Status Mutasi ACID */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Integritas Transaksi</span>
              <span className="p-1.5 rounded-lg bg-[#ECFDF5] dark:bg-[#064E3B]/30 border border-[#A7F3D0] dark:border-[#065F46]/50 text-[#065F46] dark:text-[#34D399]">
                <IconShield size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mb-1 tracking-tight">
              ACID Locked
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] flex items-center justify-between pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
              <span>Anti Race Condition</span>
              <span className="text-[#065F46] dark:text-[#34D399] font-medium">100% Aman</span>
            </div>
          </div>
        </section>

        {/* Multi-Level Filter Controls & Search */}
        <section className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none space-y-3.5 transition-colors">
          {/* Row 1: Warehouse & Brand Tabs */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Warehouse Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-[#6B7684] dark:text-[#8A94A6] mr-1 flex items-center gap-1">
                <IconWarehouse size={13} />
                <span>Gudang:</span>
              </span>
              {warehouses.map((wh) => (
                <button
                  key={wh}
                  onClick={() => setSelectedWarehouse(wh)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                    selectedWarehouse === wh
                      ? "bg-[#2B5FC7] text-white dark:bg-[#3B6FE0]"
                      : "bg-[#F4F6FA] text-[#6B7684] hover:text-[#1B2436] border border-[#E2E6ED] dark:bg-[#1B2A44] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3] dark:border-[#26334D]"
                  }`}
                >
                  {wh}
                </button>
              ))}
            </div>

            {/* Brand Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-[#6B7684] dark:text-[#8A94A6] mr-1 flex items-center gap-1">
                <IconTag size={13} />
                <span>Brand:</span>
              </span>
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                    selectedBrand === b
                      ? "bg-[#2B5FC7] text-white dark:bg-[#3B6FE0]"
                      : "bg-[#F4F6FA] text-[#6B7684] hover:text-[#1B2436] border border-[#E2E6ED] dark:bg-[#1B2A44] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3] dark:border-[#26334D]"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Search, Category Selector & ROP Alert Toggle */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-[#E2E6ED] dark:border-[#26334D]">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <IconSearch
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7684] dark:text-[#8A94A6]"
                />
                <input
                  type="text"
                  placeholder="Cari nama material, nomor SKU, atau nomor batch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] placeholder:text-[#6B7684] text-xs focus:outline-none focus:border-[#2B5FC7] dark:focus:border-[#3B6FE0]"
                />
              </div>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-2 text-xs text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6]"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Category Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#6B7684] dark:text-[#8A94A6]">Kategori:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] text-xs focus:outline-none focus:border-[#2B5FC7]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* ROP Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  checked={onlyRopCritical}
                  onChange={(e) => setOnlyRopCritical(e.target.checked)}
                  className="rounded border-[#E2E6ED] text-[#2B5FC7] focus:ring-0"
                />
                <span
                  className={
                    onlyRopCritical
                      ? "text-[#991B1B] dark:text-[#F87171] font-semibold"
                      : "text-[#6B7684] dark:text-[#8A94A6]"
                  }
                >
                  Hanya Kritis (≤ ROP)
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* Main Materials Catalog Table */}
        <section className="rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-colors">
          <div className="p-4 border-b border-[#E2E6ED] dark:border-[#26334D] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                Daftar Bahan Baku ({filteredMaterials.length} item)
              </h3>
              <p className="text-xs text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                Stok fisik terkini, ambang batas pemesanan ulang (ROP), dan batch pelacak.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedWarehouse("Semua");
                setSelectedBrand("Semua");
                setSelectedCategory("Semua");
                setSearchQuery("");
                setOnlyRopCritical(false);
              }}
              className="text-xs font-medium text-[#2B5FC7] dark:text-[#3B6FE0] hover:underline flex items-center gap-1"
            >
              <IconRefresh size={12} />
              <span>Reset Filter</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F4F6FA] dark:bg-[#1B2A44] border-b border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6] font-semibold">
                  <th className="py-3 px-4">SKU / Kode</th>
                  <th className="py-3 px-4">Nama Material</th>
                  <th className="py-3 px-4">Kategori & Brand</th>
                  <th className="py-3 px-4">Lokasi</th>
                  <th className="py-3 px-4 text-right">Stok Fisik</th>
                  <th className="py-3 px-4 text-center">Tingkat Stok vs ROP</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Batch / Parameter</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#6B7684] dark:text-[#8A94A6]">
                      Tidak ada material yang cocok dengan kriteria filter saat ini.
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((m) => {
                    const status = getStockStatus(m);
                    const stockRatio = Math.min(Math.round((m.stock / (m.rop * 2)) * 100), 100);

                    return (
                      <tr
                        key={m.id}
                        className={`hover:bg-[#F4F6FA]/70 dark:hover:bg-[#1B2A44]/50 transition-colors ${
                          m.stock <= m.rop ? "bg-[#FEF2F2]/30 dark:bg-[#7F1D1D]/10" : ""
                        }`}
                      >
                        {/* SKU */}
                        <td className="py-3 px-4 font-mono font-medium text-[#2B5FC7] dark:text-[#3B6FE0] whitespace-nowrap">
                          {m.sku}
                        </td>

                        {/* Nama */}
                        <td className="py-3 px-4 font-medium max-w-xs">
                          <div className="truncate font-semibold">{m.name}</div>
                          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                            Harga Satuan: Rp {m.unitPrice.toLocaleString("id-ID")} / {m.unit}
                          </div>
                        </td>

                        {/* Kategori & Brand */}
                        <td className="py-3 px-4">
                          <div className="text-[11px] font-medium text-[#1B2436] dark:text-[#E8ECF3]">
                            {m.category}
                          </div>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6]">
                            {m.brand}
                          </span>
                        </td>

                        {/* Gudang */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-medium">{m.warehouse}</span>
                        </td>

                        {/* Stok Fisik */}
                        <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-bold text-sm">
                          {m.stock}{" "}
                          <span className="text-xs font-normal text-[#6B7684] dark:text-[#8A94A6]">
                            {m.unit}
                          </span>
                        </td>

                        {/* Progress Bar vs ROP */}
                        <td className="py-3 px-4 min-w-[130px]">
                          <div className="flex items-center justify-between text-[10px] text-[#6B7684] dark:text-[#8A94A6] mb-1">
                            <span>ROP: {m.rop} {m.unit}</span>
                            <span>{stockRatio}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#E2E6ED] dark:bg-[#26334D] overflow-hidden">
                            <div
                              className={`h-full rounded-full ${status.barClass}`}
                              style={{ width: `${stockRatio}%` }}
                            />
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${status.badgeClass}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        {/* Batch Lot & Parameter */}
                        <td className="py-3 px-4 text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                          <div className="font-mono text-[10px]">{m.batchLot}</div>
                          {m.expiryDate && (
                            <div className="text-[10px] text-[#991B1B] dark:text-[#F87171]">
                              Exp: {m.expiryDate}
                            </div>
                          )}
                          {m.moisturePercent && (
                            <div className="text-[10px] text-[#065F46] dark:text-[#34D399]">
                              Lembab: {m.moisturePercent}%
                            </div>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMaterialForTransfer(m);
                              setShowTransferModal(true);
                            }}
                            className="px-2.5 py-1 rounded-md text-[11px] font-medium border border-[#2B5FC7] text-[#2B5FC7] hover:bg-[#2B5FC7]/10 dark:border-[#3B6FE0] dark:text-[#3B6FE0] dark:hover:bg-[#3B6FE0]/15 transition-colors"
                          >
                            Transfer
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 sm:px-5 bg-white dark:bg-[#16223A] border-t border-[#E2E6ED] dark:border-[#26334D] flex items-center justify-between text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
            <span>Menampilkan {filteredMaterials.length} dari {materials.length} material</span>
            <span>CV Solusi Inovasi Packaging · Reorder Point Formula ROP = (d × L) + SS</span>
          </div>
        </section>

        {/* Modal 1: Inbound Kedatangan Material */}
        {showInboundModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
                <div>
                  <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                    Inbound Material / Penerimaan Bahan Baru
                  </h3>
                  <p className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
                    Catat nomor Batch/Lot, masa berlaku, dan kuantitas masuk
                  </p>
                </div>
                <button
                  onClick={() => setShowInboundModal(false)}
                  className="p-1 rounded-lg text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6]"
                >
                  <IconX size={16} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const sku = (form.elements.namedItem("sku") as HTMLInputElement).value;
                  const name = (form.elements.namedItem("name") as HTMLInputElement).value;
                  const qty = Number((form.elements.namedItem("qty") as HTMLInputElement).value);
                  const wh = (form.elements.namedItem("warehouse") as HTMLSelectElement).value as "Gudang 1" | "Gudang 2";
                  const unit = (form.elements.namedItem("unit") as HTMLSelectElement).value as any;
                  const lot = (form.elements.namedItem("batchLot") as HTMLInputElement).value;

                  const newItem: MaterialItem = {
                    id: String(Date.now()),
                    sku,
                    name,
                    category: "Bahan Baku Utama",
                    brand: "Packsolution.id",
                    warehouse: wh,
                    stock: qty,
                    unit,
                    rop: Math.round(qty * 0.4),
                    safetyStock: Math.round(qty * 0.2),
                    batchLot: lot,
                    unitPrice: 250000,
                  };

                  setMaterials([newItem, ...materials]);
                  setShowInboundModal(false);
                  triggerToast(`Inbound sukses: ${qty} ${unit} ${name} masuk ke ${wh}`);
                }}
                className="space-y-3 text-xs"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                      Nomor SKU
                    </label>
                    <input
                      name="sku"
                      required
                      placeholder="Contoh: MAT-IVR-350"
                      className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                      Gudang Tujuan
                    </label>
                    <select
                      name="warehouse"
                      className="w-full h-9 px-2 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                    >
                      <option value="Gudang 1">Gudang 1 (Utama)</option>
                      <option value="Gudang 2">Gudang 2 (Ruko)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                    Nama Material & Spesifikasi
                  </label>
                  <input
                    name="name"
                    required
                    placeholder="Contoh: Kertas Ivory 350 GSM Plano 79x109cm"
                    className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                      Jumlah Masuk
                    </label>
                    <input
                      name="qty"
                      type="number"
                      required
                      min={1}
                      defaultValue={50}
                      className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                      Satuan
                    </label>
                    <select
                      name="unit"
                      className="w-full h-9 px-2 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                    >
                      <option value="Rim">Rim</option>
                      <option value="Lembar">Lembar</option>
                      <option value="Kaleng">Kaleng (1kg)</option>
                      <option value="Roll">Roll</option>
                      <option value="Kg">Kg</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                      Nomor Batch / Lot
                    </label>
                    <input
                      name="batchLot"
                      required
                      defaultValue={`LOT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`}
                      className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                      Kelembaban Kertas (%)
                    </label>
                    <input
                      name="moisture"
                      type="number"
                      step="0.1"
                      defaultValue={5.5}
                      placeholder="Standar 5.0 - 6.5%"
                      className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E6ED] dark:border-[#26334D]">
                  <button
                    type="button"
                    onClick={() => setShowInboundModal(false)}
                    className="px-3.5 py-2 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] hover:text-[#1B2436]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white font-medium shadow-sm"
                  >
                    Simpan Inbound
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Transfer Antar-Gudang (Simulasi Mutasi ACID) */}
        {showTransferModal && selectedMaterialForTransfer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
                <div>
                  <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3] flex items-center gap-1.5">
                    <IconTransfer size={15} />
                    <span>Transfer Stok Antar-Gudang (ACID)</span>
                  </h3>
                  <p className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
                    Mutasi atomik aman dari race condition
                  </p>
                </div>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="p-1 rounded-lg text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6]"
                >
                  <IconX size={16} />
                </button>
              </div>

              <div className="p-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-xs space-y-1">
                <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                  {selectedMaterialForTransfer.name}
                </div>
                <div className="text-[#6B7684] dark:text-[#8A94A6]">
                  SKU: <span className="font-mono">{selectedMaterialForTransfer.sku}</span> · Asal:{" "}
                  <strong>{selectedMaterialForTransfer.warehouse}</strong>
                </div>
                <div className="text-[#2B5FC7] dark:text-[#3B6FE0] font-semibold">
                  Stok Tersedia: {selectedMaterialForTransfer.stock} {selectedMaterialForTransfer.unit}
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const transferQty = Number((form.elements.namedItem("qty") as HTMLInputElement).value);
                  const targetWarehouse = (form.elements.namedItem("targetWh") as HTMLSelectElement).value;

                  if (transferQty > selectedMaterialForTransfer.stock) {
                    alert("Kuantitas transfer melebihi stok yang tersedia!");
                    return;
                  }

                  // Update state
                  setMaterials(
                    materials.map((m) =>
                      m.id === selectedMaterialForTransfer.id
                        ? { ...m, stock: m.stock - transferQty }
                        : m
                    )
                  );

                  setShowTransferModal(false);
                  triggerToast(
                    `Transfer ${transferQty} ${selectedMaterialForTransfer.unit} dari ${selectedMaterialForTransfer.warehouse} ke ${targetWarehouse} berhasil tercatat!`
                  );
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                    Gudang Tujuan Transfer
                  </label>
                  <select
                    name="targetWh"
                    className="w-full h-9 px-2 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                  >
                    <option value={selectedMaterialForTransfer.warehouse === "Gudang 1" ? "Gudang 2" : "Gudang 1"}>
                      {selectedMaterialForTransfer.warehouse === "Gudang 1"
                        ? "Gudang 2 (Ruko)"
                        : "Gudang 1 (Utama)"}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                    Jumlah yang Ditransfer ({selectedMaterialForTransfer.unit})
                  </label>
                  <input
                    name="qty"
                    type="number"
                    required
                    min={1}
                    max={selectedMaterialForTransfer.stock}
                    defaultValue={Math.min(10, selectedMaterialForTransfer.stock)}
                    className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                    Catatan Surat Jalan / Alasan Transfer
                  </label>
                  <input
                    name="notes"
                    placeholder="Contoh: Kebutuhan cetak box pesanan Estella"
                    className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E6ED] dark:border-[#26334D]">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="px-3.5 py-2 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white font-medium shadow-sm"
                  >
                    Eksekusi Mutasi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 3: Stock Opname & Rekonsiliasi Selisih */}
        {showOpnameModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
                <div>
                  <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3] flex items-center gap-1.5">
                    <IconCalendar size={15} />
                    <span>Modul Stock Opname & Rekonsiliasi Fisik</span>
                  </h3>
                  <p className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
                    Freeze snapshot sistem dan input physical count untuk approval Manager
                  </p>
                </div>
                <button
                  onClick={() => setShowOpnameModal(false)}
                  className="p-1 rounded-lg text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6]"
                >
                  <IconX size={16} />
                </button>
              </div>

              <div className="text-xs space-y-3">
                <div className="p-3 rounded-lg bg-[#FFFBEB] dark:bg-[#78350F]/20 border border-[#FDE68A] dark:border-[#92400E]/40 text-[#92400E] dark:text-[#FBBF24]">
                  💡 <strong>Info Opname:</strong> Selisih perhitungan fisik akan dicatat ke audit trail dan membutuhkan persetujuan (Approval) Manager sebelum stok sistem diubah.
                </div>

                <div className="overflow-x-auto border border-[#E2E6ED] dark:border-[#26334D] rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F4F6FA] dark:bg-[#1B2A44] border-b border-[#E2E6ED] dark:border-[#26334D]">
                      <tr>
                        <th className="py-2.5 px-3">Nama Material</th>
                        <th className="py-2.5 px-3">Gudang</th>
                        <th className="py-2.5 px-3 text-right">Stok Sistem</th>
                        <th className="py-2.5 px-3 text-center">Hitungan Fisik</th>
                        <th className="py-2.5 px-3">Alasan Selisih</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D]">
                      {materials.slice(0, 5).map((m) => (
                        <tr key={m.id}>
                          <td className="py-2.5 px-3 font-medium">
                            <div>{m.name}</div>
                            <span className="font-mono text-[10px] text-[#6B7684] dark:text-[#8A94A6]">{m.sku}</span>
                          </td>
                          <td className="py-2.5 px-3 text-[#6B7684] dark:text-[#8A94A6]">{m.warehouse}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold">{m.stock} {m.unit}</td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              defaultValue={m.stock}
                              className="w-20 h-7 text-center rounded border border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA] dark:bg-[#0F1B2D]"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              placeholder="Kertas sobek / scrap..."
                              className="w-full h-7 px-2 text-[11px] rounded border border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA] dark:bg-[#0F1B2D]"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E6ED] dark:border-[#26334D]">
                <button
                  type="button"
                  onClick={() => setShowOpnameModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-xs text-[#6B7684]"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowOpnameModal(false);
                    triggerToast("Rekonsiliasi Stock Opname berhasil diajukan ke antrean Approval Manager!");
                  }}
                  className="px-4 py-2 rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white text-xs font-medium shadow-sm"
                >
                  Ajukan Approval Selisih
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 4 / Drawer: ROP Alert Notification Center */}
        {showRopDrawer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#FEF2F2] dark:bg-[#7F1D1D]/30 text-[#991B1B] dark:text-[#F87171]">
                    <IconAlertTriangle size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                      Peringatan Stok Kritis (ROP Alert Center)
                    </h3>
                    <p className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
                      {ropItems.length} item material berada pada atau di bawah Reorder Point
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRopDrawer(false)}
                  className="p-1 rounded-lg text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6]"
                >
                  <IconX size={16} />
                </button>
              </div>

              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
                {ropItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-lg bg-[#FEF2F2]/40 dark:bg-[#7F1D1D]/15 border border-[#FECACA] dark:border-[#7F1D1D]/40 text-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-[#991B1B] dark:text-[#F87171]">{item.name}</div>
                      <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                        SKU: <span className="font-mono">{item.sku}</span> · Lokasi: <strong>{item.warehouse}</strong>
                      </div>
                      <div className="text-[11px] text-[#1B2436] dark:text-[#E8ECF3] mt-1">
                        Sisa Fisik: <strong className="text-[#991B1B] dark:text-[#F87171]">{item.stock} {item.unit}</strong> (Batas ROP: {item.rop} {item.unit})
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowRopDrawer(false);
                        triggerToast(`Permintaan Purchase Order (PO) untuk ${item.sku} telah dikirim ke Manager.`);
                      }}
                      className="px-3 py-1.5 rounded-md bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-medium text-[11px] whitespace-nowrap shadow-sm"
                    >
                      Ajukan PO
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-[#E2E6ED] dark:border-[#26334D]">
                <button
                  type="button"
                  onClick={() => setShowRopDrawer(false)}
                  className="px-4 py-2 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-xs text-[#1B2436] dark:text-[#E8ECF3]"
                >
                  Tutup Notifikasi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
