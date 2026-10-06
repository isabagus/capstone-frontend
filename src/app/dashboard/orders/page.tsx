"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useBrands } from "@/hooks/useInventoryData";
import {
  IconOrders,
  IconTag,
  IconPlus,
  IconCheck,
  IconX,
  IconSearch,
  IconRefresh,
  IconCalendar,
  IconZap,
  IconAlertTriangle,
  IconEdit,
  IconWarehouse,
  IconShield,
  IconPalette,
} from "@/components/icons/Icons";

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  brand: "Packsolution.id" | "Estella" | "Pepipapier" | "memoirs.print" | "pikpurry";
  productName: string;
  dimensions: string;
  paperType: string;
  quantity: number;
  finishing: string[];
  stockPreValidation: "Tersedia" | "Menipis" | "Kurang";
  priority: "Normal" | "High" | "Express";
  deadline: string;
  orderDate: string;
  status: "Order Placed" | "Queued for Design" | "Design Approved" | "In-Production";
  revisionCount: number; // Max 4
  revisionHistory: { revNumber: number; date: string; notes: string }[];
  notes?: string;
}

const INITIAL_ORDERS: OrderItem[] = [
  {
    id: "1",
    orderNumber: "ORD-2026-0901",
    customerName: "PT Artha Boga Sejahtera",
    customerPhone: "0812-3456-7890",
    brand: "Packsolution.id",
    productName: "Hardbox Rigid Premium Magnetic Gold",
    dimensions: "25 × 20 × 8 cm",
    paperType: "Kertas Ivory 300 GSM + Greyboard 2mm",
    quantity: 2500,
    finishing: ["Laminasi Doff", "Foil Hot Print Gold", "Die-cut"],
    stockPreValidation: "Tersedia",
    priority: "Express",
    deadline: "25 Sep 2026 (18:00 WIB)",
    orderDate: "24 Sep 2026",
    status: "Queued for Design",
    revisionCount: 2,
    revisionHistory: [
      { revNumber: 1, date: "24 Sep 2026 10:00", notes: "Ubah posisi logo 2cm ke kanan" },
      { revNumber: 2, date: "24 Sep 2026 14:30", notes: "Penyesuaian warna foil ke Gold Shiny #4" },
    ],
    notes: "Pesanan express untuk launching produk minggu ini.",
  },
  {
    id: "2",
    orderNumber: "ORD-2026-0902",
    customerName: "Estella Glow Skincare",
    customerPhone: "0813-9876-5432",
    brand: "Estella",
    productName: "Softbox Skincare Serum Matte Doff",
    dimensions: "12 × 5 × 5 cm",
    paperType: "Kraft Liner Brown 275 GSM",
    quantity: 5000,
    finishing: ["Laminasi Doff", "Emboss Logo"],
    stockPreValidation: "Tersedia",
    priority: "High",
    deadline: "28 Sep 2026",
    orderDate: "24 Sep 2026",
    status: "Order Placed",
    revisionCount: 1,
    revisionHistory: [
      { revNumber: 1, date: "24 Sep 2026 11:20", notes: "Tambahkan QR Code BPOM pada sisi samping" },
    ],
    notes: "Warna kraft natural dengan tinta putih pekat.",
  },
  {
    id: "3",
    orderNumber: "ORD-2026-0903",
    customerName: "Pepipapier Stationery",
    customerPhone: "0811-2233-4455",
    brand: "Pepipapier",
    productName: "Greeting Card & Custom Envelope Foil",
    dimensions: "15 × 10 cm",
    paperType: "Art Paper 150 GSM",
    quantity: 1200,
    finishing: ["Foil Hot Print Gold", "Spot UV"],
    stockPreValidation: "Tersedia",
    priority: "Normal",
    deadline: "30 Sep 2026",
    orderDate: "23 Sep 2026",
    status: "Design Approved",
    revisionCount: 4,
    revisionHistory: [
      { revNumber: 1, date: "23 Sep 09:00", notes: "Koreksi font tulisan wedding" },
      { revNumber: 2, date: "23 Sep 13:00", notes: "Ubah background dari krem ke broken white" },
      { revNumber: 3, date: "23 Sep 16:30", notes: "Perbesar motif bunga di pojok kanan bawah" },
      { revNumber: 4, date: "24 Sep 09:15", notes: "Revisi final: penyesuaian margin amplop" },
    ],
    notes: "Mencapai batas 4x revisi desain. Desain telah di-ACC final.",
  },
  {
    id: "4",
    orderNumber: "ORD-2026-0904",
    customerName: "Studio Foto Memoirs",
    customerPhone: "0877-6655-4433",
    brand: "memoirs.print",
    productName: "Photobook Hardcover Linen Series",
    dimensions: "30 × 30 cm",
    paperType: "Art Paper 150 GSM",
    quantity: 350,
    finishing: ["Laminasi Doff", "Hardcover Board"],
    stockPreValidation: "Tersedia",
    priority: "High",
    deadline: "27 Sep 2026",
    orderDate: "23 Sep 2026",
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
    brand: "pikpurry",
    productName: "Packaging Snack Pouch Ziplock Cat Treats",
    dimensions: "20 × 12 cm",
    paperType: "Kertas Duplex Coated 350 GSM",
    quantity: 10000,
    finishing: ["Laminasi Glossy", "Ziplock Sealing"],
    stockPreValidation: "Menipis",
    priority: "Normal",
    deadline: "05 Okt 2026",
    orderDate: "22 Sep 2026",
    status: "Order Placed",
    revisionCount: 1,
    revisionHistory: [
      { revNumber: 1, date: "22 Sep 15:00", notes: "Ubah tabel nutrisi pakan kucing" },
    ],
    notes: "Stok duplex di Gudang 2 menipis, perlu koordinasi saat cetak.",
  },
];

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);

  // Filters
  const [selectedBrand, setSelectedBrand] = useState<string>("Semua");
  const [selectedStatus, setSelectedStatus] = useState<string>("Semua");
  const [selectedPriority, setSelectedPriority] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [showNewOrderModal, setShowNewOrderModal] = useState<boolean>(false);
  const [showRevisionModal, setShowRevisionModal] = useState<boolean>(false);
  const [selectedOrderForRevision, setSelectedOrderForRevision] = useState<OrderItem | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Multi-step form state for new order
  const [formStep, setFormStep] = useState<number>(1);
  const [newOrderData, setNewOrderData] = useState({
    customerName: "",
    customerPhone: "",
    brand: "Packsolution.id" as OrderItem["brand"],
    productName: "",
    dimensions: "",
    paperType: "Kertas Ivory 300 GSM Plano (79 x 109 cm)",
    quantity: 1000,
    finishing: ["Laminasi Doff"],
    priority: "Normal" as OrderItem["priority"],
    deadline: "",
    notes: "",
  });

  const dynamicBrands = useBrands();
  const brands = ["Semua", ...dynamicBrands];
  const statuses = ["Semua", "Order Placed", "Queued for Design", "Design Approved", "In-Production"];
  const priorities = ["Semua", "Normal", "High", "Express"];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (selectedBrand !== "Semua" && o.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
    if (selectedStatus !== "Semua" && o.status !== selectedStatus) return false;
    if (selectedPriority !== "Semua" && o.priority !== selectedPriority) return false;
    if (
      searchQuery &&
      !o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !o.productName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Calculations
  const totalOrders = orders.length;
  const queuedForDesign = orders.filter((o) => o.status === "Queued for Design").length;
  const expressOrders = orders.filter((o) => o.priority === "Express").length;
  const maxRevisionOrders = orders.filter((o) => o.revisionCount >= 4).length;

  // Helper for priority badges
  const renderPriorityBadge = (priority: OrderItem["priority"]) => {
    switch (priority) {
      case "Express":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] dark:bg-[#7F1D1D]/30 dark:text-[#F87171] dark:border-[#991B1B]/60 animate-pulse">
            <IconZap size={11} strokeWidth={2.5} />
            <span>Express (&lt;24 Jam)</span>
          </span>
        );
      case "High":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] dark:bg-[#78350F]/30 dark:text-[#FBBF24] dark:border-[#92400E]/60">
            High Priority
          </span>
        );
      case "Normal":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F4F6FA] text-[#6B7684] border border-[#E2E6ED] dark:bg-[#1B2A44] dark:text-[#8A94A6] dark:border-[#26334D]">
            Normal
          </span>
        );
    }
  };

  // Helper for status badges
  const renderStatusBadge = (status: OrderItem["status"]) => {
    switch (status) {
      case "Design Approved":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] dark:bg-[#064E3B]/30 dark:text-[#34D399] dark:border-[#065F46]/60">
            Design Approved
          </span>
        );
      case "Queued for Design":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#EFF4FE] text-[#2B5FC7] border border-[#D6E3FC] dark:bg-[#1D4ED8]/25 dark:text-[#60A5FA] dark:border-[#2563EB]/40">
            Antrean Desain
          </span>
        );
      case "Order Placed":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] dark:bg-[#78350F]/30 dark:text-[#FBBF24] dark:border-[#92400E]/60">
            Order Placed
          </span>
        );
      case "In-Production":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F4F6FA] text-[#2B5FC7] border border-[#2B5FC7] dark:bg-[#1B2A44] dark:text-[#3B6FE0] dark:border-[#3B6FE0]">
            In-Production
          </span>
        );
    }
  };

  return (
    <DashboardLayout title="Front Office & Input Order">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3 rounded-lg bg-[#EFF4FE] dark:bg-[#1D4ED8]/25 border border-[#D6E3FC] dark:border-[#2563EB]/40 text-[#2B5FC7] dark:text-[#93C5FD] text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <IconCheck size={16} strokeWidth={2} />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-current opacity-70 hover:opacity-100">
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
                MOD-02 · Front Office Intake & Rule Revisi
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight">
              Penerimaan Order Pelanggan
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
              Input pesanan 5 brand, validasi ketersediaan stok instan, dan batasan revisi teknis maks. 4x.
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => {
                setFormStep(1);
                setShowNewOrderModal(true);
              }}
              className="px-3.5 py-2 rounded-lg text-xs font-medium bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] dark:hover:bg-[#2B5FC7] text-white shadow-sm transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              <IconPlus size={14} strokeWidth={2.5} />
              <span>Input Order Baru</span>
            </button>
          </div>
        </div>

        {/* Operational Metric Cards (4 Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Order */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Total Order Aktif</span>
              <span className="p-1.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#2B5FC7] dark:text-[#3B6FE0]">
                <IconOrders size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mb-1 tracking-tight">
              {totalOrders} Pesanan
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] flex items-center justify-between pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
              <span>5 Brand terintegrasi</span>
              <span className="text-[#065F46] dark:text-[#34D399] font-medium">Aktif</span>
            </div>
          </div>

          {/* Card 2: Queued for Design */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Antrean Tim Design</span>
              <span className="p-1.5 rounded-lg bg-[#EFF4FE] dark:bg-[#1D4ED8]/25 border border-[#D6E3FC] dark:border-[#2563EB]/40 text-[#2B5FC7] dark:text-[#3B6FE0]">
                <IconPalette size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#2B5FC7] dark:text-[#3B6FE0] mb-1 tracking-tight">
              {queuedForDesign} Desain
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] flex items-center justify-between pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
              <span>Menunggu kalkulasi BOM</span>
              <span className="text-[#2B5FC7] dark:text-[#3B6FE0] font-medium">BOM Engine Siap</span>
            </div>
          </div>

          {/* Card 3: Express Orders */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Prioritas Express (&lt;24h)</span>
              <span className="p-1.5 rounded-lg bg-[#FEF2F2] dark:bg-[#7F1D1D]/30 border border-[#FECACA] dark:border-[#991B1B]/40 text-[#991B1B] dark:text-[#F87171]">
                <IconZap size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#991B1B] dark:text-[#F87171] mb-1 tracking-tight">
              {expressOrders} Pesanan
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] flex items-center justify-between pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
              <span>Deadline kritis hari ini</span>
              <span className="text-[#991B1B] dark:text-[#F87171] font-semibold">Prioritas Utama</span>
            </div>
          </div>

          {/* Card 4: Limit Revisi 4x */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Limit Revisi (Maks 4x)</span>
              <span className="p-1.5 rounded-lg bg-[#FFFBEB] dark:bg-[#78350F]/20 border border-[#FDE68A] dark:border-[#92400E]/40 text-[#92400E] dark:text-[#FBBF24]">
                <IconEdit size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mb-1 tracking-tight">
              {maxRevisionOrders} Order Kunci
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] flex items-center justify-between pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
              <span>Approval Manager</span>
              <span className="text-[#92400E] dark:text-[#FBBF24] font-medium">Terkunci (4/4)</span>
            </div>
          </div>
        </section>

        {/* Filter Bar & Search */}
        <section className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none space-y-3.5 transition-colors">
          {/* Brand Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-[#6B7684] dark:text-[#8A94A6] mr-1 flex items-center gap-1">
              <IconTag size={13} />
              <span>Brand:</span>
            </span>
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                  selectedBrand === b
                    ? "bg-[#2B5FC7] text-white dark:bg-[#3B6FE0]"
                    : "bg-[#F4F6FA] text-[#6B7684] hover:text-[#1B2436] border border-[#E2E6ED] dark:bg-[#1B2A44] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3] dark:border-[#26334D]"
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Row 2: Search, Status, Priority */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-[#E2E6ED] dark:border-[#26334D]">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <IconSearch
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7684] dark:text-[#8A94A6]"
                />
                <input
                  type="text"
                  placeholder="Cari No. Order, nama pelanggan, atau nama produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] placeholder:text-[#6B7684] text-xs focus:outline-none focus:border-[#2B5FC7]"
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
              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#6B7684] dark:text-[#8A94A6]">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] text-xs focus:outline-none focus:border-[#2B5FC7]"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#6B7684] dark:text-[#8A94A6]">Prioritas:</span>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] text-xs focus:outline-none focus:border-[#2B5FC7]"
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Orders Intake Table */}
        <section className="rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-colors">
          <div className="p-4 border-b border-[#E2E6ED] dark:border-[#26334D] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                Daftar Pesanan Masuk ({filteredOrders.length} order)
              </h3>
              <p className="text-xs text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                Alur Front Office intake, verifikasi stok instan, dan pelacakan limit revisi desain.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedBrand("Semua");
                setSelectedStatus("Semua");
                setSelectedPriority("Semua");
                setSearchQuery("");
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
                  <th className="py-3 px-4">No. Order</th>
                  <th className="py-3 px-4">Pelanggan & Kontak</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Spesifikasi Produk</th>
                  <th className="py-3 px-4">Jumlah</th>
                  <th className="py-3 px-4">Stok Bahan</th>
                  <th className="py-3 px-4">Prioritas & Deadline</th>
                  <th className="py-3 px-4">Status Alur</th>
                  <th className="py-3 px-4 text-center">Revisi Desain</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-[#6B7684] dark:text-[#8A94A6]">
                      Tidak ada pesanan yang sesuai dengan filter yang dipilih.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr
                      key={o.id}
                      className={`hover:bg-[#F4F6FA]/70 dark:hover:bg-[#1B2A44]/50 transition-colors ${
                        o.priority === "Express" ? "bg-[#FEF2F2]/20 dark:bg-[#7F1D1D]/10" : ""
                      }`}
                    >
                      {/* No Order */}
                      <td className="py-3 px-4 font-mono font-medium text-[#2B5FC7] dark:text-[#3B6FE0] whitespace-nowrap">
                        {o.orderNumber}
                        <div className="text-[10px] text-[#6B7684] dark:text-[#8A94A6]">{o.orderDate}</div>
                      </td>

                      {/* Pelanggan */}
                      <td className="py-3 px-4 max-w-[180px]">
                        <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3] truncate">
                          {o.customerName}
                        </div>
                        <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] font-mono">
                          {o.customerPhone}
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]">
                          {o.brand}
                        </span>
                      </td>

                      {/* Produk */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium truncate">{o.productName}</div>
                        <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] truncate">
                          {o.dimensions} · {o.paperType}
                        </div>
                      </td>

                      {/* Qty */}
                      <td className="py-3 px-4 font-semibold whitespace-nowrap">
                        {o.quantity.toLocaleString("id-ID")} pcs
                      </td>

                      {/* Stock Pre-Validation */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {o.stockPreValidation === "Tersedia" ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] dark:bg-[#064E3B]/30 dark:text-[#34D399]">
                            <IconCheck size={10} strokeWidth={2.5} />
                            <span>Stok Siap</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] dark:bg-[#78350F]/30 dark:text-[#FBBF24]">
                            <IconAlertTriangle size={10} strokeWidth={2} />
                            <span>Menipis</span>
                          </span>
                        )}
                      </td>

                      {/* Prioritas & Deadline */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div>{renderPriorityBadge(o.priority)}</div>
                        <div className="text-[10px] text-[#6B7684] dark:text-[#8A94A6] mt-0.5 font-mono">
                          {o.deadline}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {renderStatusBadge(o.status)}
                      </td>

                      {/* Counter Revisi (1/4 - 4/4) */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <span
                            className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                              o.revisionCount >= 4
                                ? "bg-[#FEF2F2] text-[#991B1B] dark:bg-[#7F1D1D]/30 dark:text-[#F87171] border border-[#FECACA] dark:border-[#991B1B]/40"
                                : "bg-[#F4F6FA] dark:bg-[#1B2A44] text-[#1B2436] dark:text-[#E8ECF3] border border-[#E2E6ED] dark:border-[#26334D]"
                            }`}
                          >
                            {o.revisionCount}/4
                          </span>
                        </div>
                        {o.revisionCount >= 4 && (
                          <div className="text-[9px] text-[#991B1B] dark:text-[#F87171] font-semibold mt-0.5">
                            🔒 Kunci Revisi
                          </div>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrderForRevision(o);
                            setShowRevisionModal(true);
                          }}
                          className="px-2 py-1 rounded-md text-[11px] font-medium border border-[#2B5FC7] text-[#2B5FC7] hover:bg-[#2B5FC7]/10 dark:border-[#3B6FE0] dark:text-[#3B6FE0] dark:hover:bg-[#3B6FE0]/15 transition-colors"
                        >
                          Kelola Revisi
                        </button>
                        {o.status === "Order Placed" && (
                          <button
                            type="button"
                            onClick={() => {
                              setOrders(
                                orders.map((ord) =>
                                  ord.id === o.id ? { ...ord, status: "Queued for Design" } : ord
                                )
                              );
                              triggerToast(`Order ${o.orderNumber} berhasil diteruskan ke Antrean Tim Design!`);
                            }}
                            className="px-2 py-1 rounded-md text-[11px] font-medium bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white shadow-sm transition-colors"
                          >
                            Kirim ke Desain
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 sm:px-5 bg-white dark:bg-[#16223A] border-t border-[#E2E6ED] dark:border-[#26334D] flex items-center justify-between text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
            <span>Menampilkan {filteredOrders.length} dari {orders.length} pesanan</span>
            <span>CV Solusi Inovasi Packaging · Aturan Pembatasan Maksimal 4x Revisi Desain Teknis</span>
          </div>
        </section>

        {/* Modal 1: Input Order Multi-Step Form (TSK-S3-05) */}
        {showNewOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-xl p-5 space-y-4 max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
                <div>
                  <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3] flex items-center gap-1.5">
                    <IconOrders size={16} />
                    <span>Formulir Penerimaan Pesanan Baru (Front Office)</span>
                  </h3>
                  <p className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
                    Langkah {formStep} dari 3:{" "}
                    {formStep === 1
                      ? "Informasi Pelanggan & Brand"
                      : formStep === 2
                      ? "Spesifikasi Produk & Pre-Validation Stok"
                      : "Upload Desain & Prioritas Deadline"}
                  </p>
                </div>
                <button
                  onClick={() => setShowNewOrderModal(false)}
                  className="p-1 rounded-lg text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6]"
                >
                  <IconX size={16} />
                </button>
              </div>

              {/* Multi-step Progress Indicator */}
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex-1">
                    <div
                      className={`h-1.5 rounded-full transition-colors ${
                        step <= formStep
                          ? "bg-[#2B5FC7] dark:bg-[#3B6FE0]"
                          : "bg-[#E2E6ED] dark:bg-[#26334D]"
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Step 1: Customer & Brand */}
              {formStep === 1 && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                      Pilih Brand Unit Bisnis
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Packsolution.id", "Estella", "Pepipapier", "memoirs.print", "pikpurry"].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setNewOrderData({ ...newOrderData, brand: b as OrderItem["brand"] })}
                          className={`p-2 rounded-lg border text-left transition-colors ${
                            newOrderData.brand === b
                              ? "bg-[#2B5FC7] border-[#2B5FC7] text-white dark:bg-[#3B6FE0]"
                              : "bg-[#F4F6FA] dark:bg-[#0F1B2D] border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                          }`}
                        >
                          <div className="font-semibold text-[11px] truncate">{b}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                      Nama Perusahaan / Pelanggan
                    </label>
                    <input
                      required
                      placeholder="Contoh: PT Sumber Pangan Makmur"
                      value={newOrderData.customerName}
                      onChange={(e) => setNewOrderData({ ...newOrderData, customerName: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                      Nomor Telepon / WhatsApp
                    </label>
                    <input
                      required
                      placeholder="Contoh: 0812-3456-7890"
                      value={newOrderData.customerPhone}
                      onChange={(e) => setNewOrderData({ ...newOrderData, customerPhone: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Product Spec & Stock Pre-Validation */}
              {formStep === 2 && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                      Nama / Tipe Produk
                    </label>
                    <input
                      required
                      placeholder="Contoh: Hardbox Rigid Eksklusif Custom"
                      value={newOrderData.productName}
                      onChange={(e) => setNewOrderData({ ...newOrderData, productName: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                        Dimensi (P × L × T cm)
                      </label>
                      <input
                        placeholder="Contoh: 20 × 15 × 7 cm"
                        value={newOrderData.dimensions}
                        onChange={(e) => setNewOrderData({ ...newOrderData, dimensions: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                        Jumlah Pesanan (pcs)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={newOrderData.quantity}
                        onChange={(e) => setNewOrderData({ ...newOrderData, quantity: Number(e.target.value) })}
                        className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                      Pilihan Bahan Baku Kertas
                    </label>
                    <select
                      value={newOrderData.paperType}
                      onChange={(e) => setNewOrderData({ ...newOrderData, paperType: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                    >
                      <option value="Kertas Ivory 300 GSM Plano (79 x 109 cm)">Kertas Ivory 300 GSM Plano (Gudang 1)</option>
                      <option value="Art Paper 150 GSM Plano (65 x 100 cm)">Art Paper 150 GSM Plano (Gudang 1)</option>
                      <option value="Kertas Duplex Coated 350 GSM">Kertas Duplex Coated 350 GSM (Gudang 2)</option>
                      <option value="Kraft Liner Brown 275 GSM">Kraft Liner Brown 275 GSM (Gudang 2)</option>
                    </select>
                  </div>

                  {/* Stock Pre-Validation Alert Box */}
                  <div className="p-3 rounded-lg bg-[#ECFDF5] dark:bg-[#064E3B]/20 border border-[#A7F3D0] dark:border-[#065F46]/50 text-[#065F46] dark:text-[#34D399]">
                    <div className="flex items-center gap-1.5 font-bold mb-0.5">
                      <IconCheck size={14} strokeWidth={2.5} />
                      <span>Stock Pre-Validation: Stok Bahan Tersedia</span>
                    </div>
                    <p className="text-[11px] opacity-90">
                      Sistem memeriksa ketersediaan material di gudang secara otomatis. Bahan baku cukup untuk kuantitas pesanan ini.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Upload & Priority Deadline */}
              {formStep === 3 && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                      Tingkat Prioritas Pengerjaan
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Normal", "High", "Express"] as OrderItem["priority"][]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setNewOrderData({ ...newOrderData, priority: p })}
                          className={`p-2.5 rounded-lg border text-center font-medium transition-colors ${
                            newOrderData.priority === p
                              ? p === "Express"
                                ? "bg-[#991B1B] text-white border-[#991B1B] dark:bg-[#F87171] dark:text-black font-bold"
                                : "bg-[#2B5FC7] text-white border-[#2B5FC7] dark:bg-[#3B6FE0]"
                              : "bg-[#F4F6FA] dark:bg-[#0F1B2D] border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                          }`}
                        >
                          {p === "Express" ? "⚡ Express (<24 Jam)" : p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                      Batas Waktu Pengiriman (Deadline)
                    </label>
                    <input
                      placeholder="Contoh: 28 Sep 2026, 17:00 WIB"
                      value={newOrderData.deadline}
                      onChange={(e) => setNewOrderData({ ...newOrderData, deadline: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                      Upload File Desain Awal Pelanggan
                    </label>
                    <div className="p-4 border-2 border-dashed border-[#E2E6ED] dark:border-[#26334D] rounded-lg text-center bg-[#F4F6FA]/50 dark:bg-[#0F1B2D]/50">
                      <div className="text-xs text-[#2B5FC7] dark:text-[#3B6FE0] font-semibold">
                        Pilih file PDF / AI / ZIP
                      </div>
                      <div className="text-[10px] text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                        Maksimal ukuran file 100MB
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                      Catatan Tambahan untuk Tim Desain / Finishing
                    </label>
                    <input
                      placeholder="Contoh: Mohon perhatikan kerapian lem hotmelt"
                      value={newOrderData.notes}
                      onChange={(e) => setNewOrderData({ ...newOrderData, notes: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                    />
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E2E6ED] dark:border-[#26334D]">
                {formStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setFormStep(formStep - 1)}
                    className="px-3.5 py-2 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-xs text-[#6B7684]"
                  >
                    Sebelumnya
                  </button>
                ) : (
                  <div />
                )}

                {formStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (formStep === 1 && !newOrderData.customerName) {
                        alert("Harap isi nama pelanggan.");
                        return;
                      }
                      setFormStep(formStep + 1);
                    }}
                    className="px-4 py-2 rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white text-xs font-medium shadow-sm"
                  >
                    Lanjut ke Spesifikasi
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const newOrder: OrderItem = {
                        id: String(Date.now()),
                        orderNumber: `ORD-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
                        customerName: newOrderData.customerName || "Pelanggan Baru",
                        customerPhone: newOrderData.customerPhone || "0812-0000-0000",
                        brand: newOrderData.brand,
                        productName: newOrderData.productName || "Custom Packaging Box",
                        dimensions: newOrderData.dimensions || "20 × 15 × 5 cm",
                        paperType: newOrderData.paperType,
                        quantity: newOrderData.quantity || 1000,
                        finishing: newOrderData.finishing,
                        stockPreValidation: "Tersedia",
                        priority: newOrderData.priority,
                        deadline: newOrderData.deadline || "30 Sep 2026",
                        orderDate: "24 Sep 2026",
                        status: "Order Placed",
                        revisionCount: 0,
                        revisionHistory: [],
                        notes: newOrderData.notes,
                      };

                      setOrders([newOrder, ...orders]);
                      setShowNewOrderModal(false);
                      triggerToast(`Pesanan ${newOrder.orderNumber} berhasil dibuat dengan status Order Placed!`);
                    }}
                    className="px-4 py-2 rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white text-xs font-medium shadow-sm"
                  >
                    Simpan & Terbitkan Order
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Manajemen Revisi Desain (TSK-S3-06 - Rule Maksimal 4x) */}
        {showRevisionModal && selectedOrderForRevision && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
                <div>
                  <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3] flex items-center gap-1.5">
                    <IconEdit size={15} />
                    <span>Log Riwayat Revisi Desain Teknis</span>
                  </h3>
                  <p className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
                    Order: {selectedOrderForRevision.orderNumber} ({selectedOrderForRevision.customerName})
                  </p>
                </div>
                <button
                  onClick={() => setShowRevisionModal(false)}
                  className="p-1 rounded-lg text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6]"
                >
                  <IconX size={16} />
                </button>
              </div>

              {/* Status Counter */}
              <div className="p-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                    Status Penggunaan Revisi:
                  </div>
                  <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                    Batas maksimal sistem: 4 kali revisi per pesanan
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded font-mono font-bold text-sm ${
                    selectedOrderForRevision.revisionCount >= 4
                      ? "bg-[#FEF2F2] text-[#991B1B] dark:bg-[#7F1D1D]/40 dark:text-[#F87171] border border-[#FECACA]"
                      : "bg-[#EFF4FE] text-[#2B5FC7] dark:bg-[#1D4ED8]/25 dark:text-[#60A5FA]"
                  }`}
                >
                  {selectedOrderForRevision.revisionCount} / 4 Revisi
                </div>
              </div>

              {/* Riwayat Catatan Revisi */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#6B7684] dark:text-[#8A94A6] uppercase tracking-wider">
                  Riwayat Revisi ({selectedOrderForRevision.revisionHistory.length}):
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1.5 text-xs">
                  {selectedOrderForRevision.revisionHistory.length === 0 ? (
                    <div className="p-3 text-center text-[#6B7684] dark:text-[#8A94A6] bg-[#F4F6FA] dark:bg-[#0F1B2D] rounded-lg">
                      Belum ada revisi yang diajukan untuk pesanan ini.
                    </div>
                  ) : (
                    selectedOrderForRevision.revisionHistory.map((rev) => (
                      <div
                        key={rev.revNumber}
                        className="p-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]"
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-0.5">
                          <span>Revisi ke-{rev.revNumber}</span>
                          <span className="text-[#6B7684] dark:text-[#8A94A6] font-mono text-[10px]">{rev.date}</span>
                        </div>
                        <p className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">{rev.notes}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Form Tambah Revisi atau Peringatan Terkunci */}
              {selectedOrderForRevision.revisionCount >= 4 ? (
                <div className="p-3.5 rounded-lg bg-[#FEF2F2] dark:bg-[#7F1D1D]/20 border border-[#FECACA] dark:border-[#7F1D1D]/40 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#991B1B] dark:text-[#F87171]">
                    <IconAlertTriangle size={15} />
                    <span>Batas Revisi Tercapai (4/4) — Form Terkunci</span>
                  </div>
                  <p className="text-[11px] text-[#991B1B] dark:text-[#F87171] leading-relaxed">
                    Sesuai PRD MOD-02, revisi ke-5 tidak diizinkan tanpa persetujuan dari Manager untuk mencegah pemborosan waktu Tim Design.
                  </p>
                  <button
                    onClick={() => {
                      setShowRevisionModal(false);
                      triggerToast("Permohonan pembukaan revisi ke-5 telah diajukan ke Manager!");
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-medium text-xs shadow-sm transition-colors"
                  >
                    Ajukan Permohonan Tambahan Revisi ke Manager
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const notes = (form.elements.namedItem("revNotes") as HTMLInputElement).value;

                    const newRev = {
                      revNumber: selectedOrderForRevision.revisionCount + 1,
                      date: `${new Date().toLocaleDateString("id-ID")} ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`,
                      notes,
                    };

                    setOrders(
                      orders.map((o) =>
                        o.id === selectedOrderForRevision.id
                          ? {
                              ...o,
                              revisionCount: o.revisionCount + 1,
                              revisionHistory: [...o.revisionHistory, newRev],
                            }
                          : o
                      )
                    );

                    setShowRevisionModal(false);
                    triggerToast(`Revisi ke-${newRev.revNumber} untuk ${selectedOrderForRevision.orderNumber} berhasil dicatat.`);
                  }}
                  className="space-y-3 text-xs pt-2 border-t border-[#E2E6ED] dark:border-[#26334D]"
                >
                  <div>
                    <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                      Instruksi Revisi ke-{selectedOrderForRevision.revisionCount + 1}
                    </label>
                    <input
                      name="revNotes"
                      required
                      placeholder="Contoh: Perubahan ukuran font nama pelanggan..."
                      className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRevisionModal(false)}
                      className="px-3 py-1.5 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684]"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white font-medium shadow-sm"
                    >
                      Simpan Catatan Revisi
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
