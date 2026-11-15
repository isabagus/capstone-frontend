"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useBrands } from "@/hooks/useInventoryData";
import DataFilterBar from "@/components/ui/DataFilterBar";
import {
  IconSpk,
  IconOrders,
  IconProduction,
  IconWarehouse,
  IconCheck,
  IconRefresh,
  IconPlus,
  IconX,
  IconTag,
  IconGear,
  IconCalendar,
} from "@/components/icons/Icons";

interface SpkDocument {
  id: string;
  spkNumber: string;
  orderNumber: string;
  type: "Internal" | "Eksternal (Vendor Mitra)";
  targetVendor?: "Vendor Offset Komori" | "Vendor Foil & Emboss Kurnia" | "Vendor Die-Cut Rigid" | "Vendor UV Varnish" | "Produksi Mandiri (Internal)";
  brand: string;
  customerName: string;
  productName: string;
  dimensions: string;
  paperType: string;
  totalPlanoSheets: number;
  totalRims: number;
  orderQuantity: number;
  insheetQuantity: number;
  machineAllocation?: string;
  operatorName?: string;
  publishDate: string;
  rawPublishDate?: string;
  deadline: string;
  status: "Draft" | "Terbit" | "In-Production" | "Selesai";
  finishingInstructions: string[];
  notes?: string;
}

const SAMPLE_SPKS: SpkDocument[] = [
  {
    id: "1",
    spkNumber: "SPK-INT-2026-081",
    orderNumber: "ORD-2026-0901",
    type: "Internal",
    targetVendor: "Produksi Mandiri (Internal)",
    brand: "Packsolution.id",
    customerName: "PT Artha Boga Sejahtera",
    productName: "Hardbox Rigid Premium Magnetic Gold",
    dimensions: "25 × 20 × 8 cm",
    paperType: "Kertas Ivory 300 GSM Plano",
    totalPlanoSheets: 442,
    totalRims: 0.88,
    orderQuantity: 2500,
    insheetQuantity: 150,
    machineAllocation: "Mesin Cetak Heidelberg SM-74 (4 Warna)",
    operatorName: "Rudi Hartono (Kepala Produksi) & Tim",
    publishDate: "24 Sep 2026",
    rawPublishDate: "2026-09-24",
    deadline: "25 Sep 2026 (18:00 WIB)",
    status: "Terbit",
    finishingInstructions: ["Laminasi Doff 30 Micron", "Foil Stamping Gold Shiny #4", "Die-Cut Presisi Pond", "Pengeleman Hotmelt Otomatis"],
    notes: "Pesanan express! Pastikan cetakan kering sebelum proses foil.",
  },
  {
    id: "2",
    spkNumber: "SPK-EKS-2026-042",
    orderNumber: "ORD-2026-0903",
    type: "Eksternal (Vendor Mitra)",
    targetVendor: "Vendor Foil & Emboss Kurnia",
    brand: "Pepipapier",
    customerName: "Pepipapier Stationery",
    productName: "Greeting Card & Custom Envelope Foil",
    dimensions: "15 × 10 cm",
    paperType: "Art Paper 150 GSM",
    totalPlanoSheets: 160,
    totalRims: 0.32,
    orderQuantity: 1200,
    insheetQuantity: 50,
    publishDate: "23 Sep 2026",
    rawPublishDate: "2026-09-23",
    deadline: "30 Sep 2026",
    status: "In-Production",
    finishingInstructions: ["Subkontrak Foil Hot Print Gold", "Subkontrak Emboss Tekstur Floral"],
    notes: "Bahan kertas sudah dikirim dari Gudang 1 ke workshop Vendor Kurnia.",
  },
  {
    id: "3",
    spkNumber: "SPK-INT-2026-082",
    orderNumber: "ORD-2026-0902",
    type: "Internal",
    targetVendor: "Produksi Mandiri (Internal)",
    brand: "Estella",
    customerName: "Estella Glow Skincare",
    productName: "Softbox Skincare Serum Matte Doff",
    dimensions: "12 × 5 × 5 cm",
    paperType: "Kraft Liner Brown 275 GSM",
    totalPlanoSheets: 885,
    totalRims: 1.77,
    orderQuantity: 5000,
    insheetQuantity: 250,
    machineAllocation: "Mesin Pond & Die-Cut Bobst",
    operatorName: "Teknisi Finishing A",
    publishDate: "24 Sep 2026",
    rawPublishDate: "2026-09-24",
    deadline: "28 Sep 2026",
    status: "Draft",
    finishingInstructions: ["Laminasi Doff", "Emboss Logo Estella", "Lipat Lem Samping"],
    notes: "Menunggu approval Manager untuk penerbitan resmi.",
  },
  {
    id: "4",
    spkNumber: "SPK-INT-2026-079",
    orderNumber: "ORD-2026-0899",
    type: "Internal",
    targetVendor: "Produksi Mandiri (Internal)",
    brand: "memoirs.print",
    customerName: "Studio Foto Memoirs",
    productName: "Photobook Hardcover Linen Series",
    dimensions: "30 × 21 cm",
    paperType: "Art Paper 210 GSM & Board No. 30",
    totalPlanoSheets: 350,
    totalRims: 0.7,
    orderQuantity: 350,
    insheetQuantity: 20,
    machineAllocation: "Mesin Lem Hardcover",
    operatorName: "Teknisi Finishing B",
    publishDate: "21 Sep 2026",
    rawPublishDate: "2026-09-21",
    deadline: "26 Sep 2026",
    status: "In-Production",
    finishingInstructions: ["Hardcover Wrapping Linen", "Emboss Foil Silver", "Jahit Benang & Lem Panas"],
    notes: "Proses jahit benang harus rapi, pastikan cover presisi.",
  },
];

export default function SpkDigitalPage() {
  const { user } = useAuth();
  const [spkList, setSpkList] = useState<SpkDocument[]>(SAMPLE_SPKS);
  const [selectedSpk, setSelectedSpk] = useState<SpkDocument>(SAMPLE_SPKS[0]);

  // Filters State
  const [filterType, setFilterType] = useState<string>("Semua");
  const [filterBrand, setFilterBrand] = useState<string>("Semua");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const dynamicBrands = useBrands();
  const brands = ["Semua", ...dynamicBrands];

  // Modals
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter Logic
  const filteredSpk = spkList.filter((s) => {
    // 1. Tipe SPK (Internal vs Eksternal)
    if (filterType !== "Semua" && s.type !== filterType) return false;

    // 2. Brand Pemesan
    if (filterBrand !== "Semua" && s.brand.toLowerCase() !== filterBrand.toLowerCase()) return false;

    // 3. Rentang Tanggal Terbit SPK
    if (startDate && s.rawPublishDate && s.rawPublishDate < startDate) return false;
    if (endDate && s.rawPublishDate && s.rawPublishDate > endDate) return false;

    // 4. Pencarian Teks
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      const matchSpk = s.spkNumber.toLowerCase().includes(q);
      const matchOrder = s.orderNumber.toLowerCase().includes(q);
      const matchCustomer = s.customerName.toLowerCase().includes(q);
      const matchProduct = s.productName.toLowerCase().includes(q);
      const matchBrand = s.brand.toLowerCase().includes(q);
      const matchVendor = (s.targetVendor || "").toLowerCase().includes(q);
      if (!matchSpk && !matchOrder && !matchCustomer && !matchProduct && !matchBrand && !matchVendor) {
        return false;
      }
    }

    return true;
  });

  const handleResetAll = () => {
    setFilterType("Semua");
    setFilterBrand("Semua");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
  };

  return (
    <DashboardLayout title="Penerbitan SPK Digital">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toast */}
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

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2E6ED] dark:border-[#26334D]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#2B5FC7] dark:bg-[#3B6FE0]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B5FC7] dark:text-[#3B6FE0]">
                MOD-04 · Surat Perintah Kerja Digital (Internal & 4 Vendor Mitra)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight">
              Manajemen SPK Produksi
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
              Pemisahan SPK Internal (mesin mandiri) dan SPK Eksternal untuk 4 vendor mitra terdaftar. Render PDF &lt; 3 detik.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedSpk(spkList[0]);
                setShowPreviewModal(true);
              }}
              className="px-3.5 py-2 rounded-lg text-xs font-medium border border-[#2B5FC7] text-[#2B5FC7] hover:bg-[#2B5FC7]/10 dark:border-[#3B6FE0] dark:text-[#3B6FE0] dark:hover:bg-[#3B6FE0]/15 transition-colors flex items-center gap-1.5"
            >
              <IconSpk size={14} />
              <span>Pratinjau Dokumen SPK</span>
            </button>
          </div>
        </div>

        {/* 4 Cards Summary */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Total SPK Aktif</span>
              <span className="p-1.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#2B5FC7] dark:text-[#3B6FE0]">
                <IconSpk size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mb-1 tracking-tight">
              {spkList.length} Dokumen
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
              Berdasarkan BOM terverifikasi
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">SPK Internal</span>
              <span className="p-1.5 rounded-lg bg-[#EFF4FE] dark:bg-[#1D4ED8]/25 border border-[#D6E3FC] dark:border-[#2563EB]/40 text-[#2B5FC7] dark:text-[#3B6FE0]">
                <IconGear size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#2B5FC7] dark:text-[#3B6FE0] mb-1 tracking-tight">
              {spkList.filter((s) => s.type === "Internal").length} SPK
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
              Alokasi mesin mandiri CV SIP
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">SPK Eksternal Subkontrak</span>
              <span className="p-1.5 rounded-lg bg-[#FFFBEB] dark:bg-[#78350F]/20 border border-[#FDE68A] dark:border-[#92400E]/40 text-[#92400E] dark:text-[#FBBF24]">
                <IconWarehouse size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#92400E] dark:text-[#FBBF24] mb-1 tracking-tight">
              {spkList.filter((s) => s.type !== "Internal").length} SPK
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
              Khusus 4 vendor mitra terdaftar
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Kecepatan Render PDF</span>
              <span className="p-1.5 rounded-lg bg-[#ECFDF5] dark:bg-[#064E3B]/30 border border-[#A7F3D0] dark:border-[#065F46]/50 text-[#065F46] dark:text-[#34D399]">
                <IconCheck size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#065F46] dark:text-[#34D399] mb-1 tracking-tight">
              &lt; 3.0 Detik
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
              Memenuhi target NFR produksi
            </div>
          </div>
        </section>

        {/* Tab Filter Tipe Dokumen SPK (Internal vs Eksternal) - Kontras Jelas & Badge Count */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-xs text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[#6B7684] dark:text-[#8A94A6] text-[11px] flex items-center gap-1.5 mr-1">
              <IconGear size={14} className="text-[#2B5FC7] dark:text-[#3B6FE0]" />
              <span>Tipe Penerbitan SPK:</span>
            </span>
            <div className="flex items-center gap-1.5">
              {[
                { label: "Semua SPK", value: "Semua", count: spkList.length },
                { label: "Internal (Mesin Mandiri)", value: "Internal", count: spkList.filter((s) => s.type === "Internal").length },
                { label: "Eksternal (Vendor Maklon)", value: "Eksternal (Vendor Mitra)", count: spkList.filter((s) => s.type !== "Internal").length },
              ].map((t) => {
                const isActive = filterType === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setFilterType(t.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[#2B5FC7] text-white dark:bg-[#3B6FE0] shadow-sm font-semibold border border-[#2B5FC7] dark:border-[#3B6FE0]"
                        : "bg-[#F4F6FA] dark:bg-[#0F1B2D] text-[#6B7684] dark:text-[#8A94A6] border border-[#E2E6ED] dark:border-[#26334D] hover:bg-[#EAEFF8] dark:hover:bg-[#1B2A44] hover:text-[#1B2436] dark:hover:text-[#E8ECF3]"
                    }`}
                  >
                    <span>{t.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#E2E6ED] dark:bg-[#26334D] text-[#6B7684] dark:text-[#8A94A6]"
                      }`}
                    >
                      {t.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] hidden md:block">
            Menampilkan: <strong className="text-[#2B5FC7] dark:text-[#3B6FE0]">{filterType}</strong>
          </div>
        </div>

        {/* Reusable DataFilterBar Component (Disesuaikan untuk SPK Digital) */}
        <DataFilterBar
          categoryLabel="Brand / Klien Pemesan"
          categoryOptions={brands}
          selectedCategory={filterBrand}
          allCategoryLabel="Semua Brand"
          dateLabel="Rentang Tanggal Terbit SPK"
          startDate={startDate}
          endDate={endDate}
          searchLabel="Pencarian SPK / No. Order / Klien"
          searchPlaceholder="Cari No. SPK, No. Order, Produk, Pelanggan, Vendor..."
          keyword={searchQuery}
          filteredCount={filteredSpk.length}
          onFilterChange={(filters) => {
            setFilterBrand(filters.category || "Semua");
            setStartDate(filters.startDate || "");
            setEndDate(filters.endDate || "");
            setSearchQuery(filters.keyword || "");
          }}
          onReset={handleResetAll}
        />

        {/* Table of SPK */}
        <section className="rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-colors">
          <div className="p-4 border-b border-[#E2E6ED] dark:border-[#26334D] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                Daftar Dokumen Surat Perintah Kerja
              </h3>
              <p className="text-xs text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                Dokumen instruksi teknis produksi bahan plano, alokasi mesin, dan finishing
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EFF4FE] dark:bg-[#1D4ED8]/25 text-[#2B5FC7] dark:text-[#60A5FA]">
              {filteredSpk.length} SPK Ditemukan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F4F6FA] dark:bg-[#1B2A44] border-b border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6] font-semibold">
                  <th className="py-3 px-4">No. SPK</th>
                  <th className="py-3 px-4">No. Order</th>
                  <th className="py-3 px-4">Tipe & Tujuan</th>
                  <th className="py-3 px-4">Brand & Pelanggan</th>
                  <th className="py-3 px-4">Produk</th>
                  <th className="py-3 px-4">Tgl Terbit</th>
                  <th className="py-3 px-4">Kebutuhan Bahan</th>
                  <th className="py-3 px-4">Status SPK</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]">
                {filteredSpk.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-[#6B7684] dark:text-[#8A94A6]">
                      Tidak ada dokumen SPK yang cocok dengan kriteria filter.
                    </td>
                  </tr>
                ) : (
                  filteredSpk.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F4F6FA]/70 dark:hover:bg-[#1B2A44]/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#2B5FC7] dark:text-[#3B6FE0] whitespace-nowrap">
                        {s.spkNumber}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#6B7684] dark:text-[#8A94A6]">
                        {s.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            s.type === "Internal"
                              ? "bg-[#EFF4FE] text-[#2B5FC7] border border-[#D6E3FC] dark:bg-[#1D4ED8]/25 dark:text-[#60A5FA]"
                              : "bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] dark:bg-[#78350F]/30 dark:text-[#FBBF24]"
                          }`}
                        >
                          {s.type}
                        </span>
                        <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-0.5 truncate max-w-[150px]">
                          {s.targetVendor || s.machineAllocation}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold">{s.customerName}</div>
                        <div className="text-[10px] text-[#6B7684] dark:text-[#8A94A6]">{s.brand}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium truncate">{s.productName}</div>
                        <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                          {s.orderQuantity.toLocaleString("id-ID")} pcs
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-[#6B7684] dark:text-[#8A94A6]">
                        {s.publishDate}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div>{s.totalRims} Rim ({s.totalPlanoSheets} Plano)</div>
                        <div className="text-[10px] text-[#6B7684] dark:text-[#8A94A6]">Insheet: +{s.insheetQuantity}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            s.status === "Terbit" || s.status === "In-Production"
                              ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] dark:bg-[#064E3B]/30 dark:text-[#34D399]"
                              : "bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] dark:bg-[#78350F]/30 dark:text-[#FBBF24]"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#6B7684] dark:text-[#8A94A6] whitespace-nowrap">
                        {s.deadline}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSpk(s);
                            setShowPreviewModal(true);
                          }}
                          className="px-2.5 py-1 rounded-md text-[11px] font-medium border border-[#2B5FC7] text-[#2B5FC7] hover:bg-[#2B5FC7]/10 dark:border-[#3B6FE0] dark:text-[#3B6FE0] dark:hover:bg-[#3B6FE0]/15 transition-colors"
                        >
                          Cetak PDF
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modal Pratinjau Dokumen SPK Digital (PDF Sheet Simulator) */}
        {showPreviewModal && selectedSpk && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
                <div>
                  <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3] flex items-center gap-1.5">
                    <IconSpk size={16} />
                    <span>Pratinjau Dokumen Cetak SPK Digital</span>
                  </h3>
                  <p className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
                    Format standar operasional CV Solusi Inovasi Packaging
                  </p>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1 rounded-lg text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6]"
                >
                  <IconX size={16} />
                </button>
              </div>

              {/* Document Sheet Layout (White Paper Look) */}
              <div className="p-5 rounded-lg border border-[#E2E6ED] bg-white text-[#1B2436] shadow-sm text-xs space-y-4">
                {/* Letterhead */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-black/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded bg-[#2B5FC7] text-white flex items-center justify-center font-bold text-sm">
                      PS
                    </div>
                    <div>
                      <div className="font-bold text-sm leading-tight">CV SOLUSI INOVASI PACKAGING</div>
                      <div className="text-[10px] text-gray-600">Jl. Industri Percetakan No. 88, Sidoarjo - Jawa Timur</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-[#2B5FC7]">{selectedSpk.spkNumber}</div>
                    <div className="text-[10px] text-gray-500">Ref: {selectedSpk.orderNumber}</div>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded border border-gray-200 text-[11px]">
                  <div>
                    <div className="text-gray-500">Pelanggan / Klien:</div>
                    <div className="font-bold">{selectedSpk.customerName} ({selectedSpk.brand})</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Tanggal Terbit:</div>
                    <div className="font-semibold">{selectedSpk.publishDate}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Target Pengerjaan:</div>
                    <div className="font-semibold text-[#2B5FC7]">
                      {selectedSpk.type} - {selectedSpk.targetVendor || selectedSpk.machineAllocation}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Batas Waktu (Deadline):</div>
                    <div className="font-bold text-[#991B1B]">{selectedSpk.deadline}</div>
                  </div>
                </div>

                {/* Spesifikasi Produk & Kebutuhan Bahan (BOM Hasil Hitung) */}
                <div className="space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wide border-b pb-1">
                    Spesifikasi Produk &amp; Bahan Baku
                  </div>
                  <table className="w-full text-left text-[11px] border">
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2 font-medium bg-gray-50 w-1/3">Nama Produk</td>
                        <td className="p-2 font-semibold">{selectedSpk.productName}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium bg-gray-50">Ukuran Jadi Box</td>
                        <td className="p-2 font-mono">{selectedSpk.dimensions}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium bg-gray-50">Jenis Bahan Kertas</td>
                        <td className="p-2 font-semibold">{selectedSpk.paperType}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium bg-gray-50">Jumlah Order Bersih</td>
                        <td className="p-2 font-bold text-[#2B5FC7]">{selectedSpk.orderQuantity.toLocaleString("id-ID")} pcs</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium bg-gray-50">Kebutuhan Plano (Termasuk Insheet)</td>
                        <td className="p-2 font-mono">
                          {selectedSpk.totalPlanoSheets} Lembar Plano (~{selectedSpk.totalRims} Rim)
                          <span className="text-gray-500 ml-1">(Toleransi Insheet: +{selectedSpk.insheetQuantity})</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Finishing Instruction Checklist */}
                <div className="space-y-1.5">
                  <div className="font-bold text-xs uppercase tracking-wide border-b pb-1">
                    Instruksi Finishing &amp; Pasca Cetak
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {selectedSpk.finishingInstructions.map((inst, i) => (
                      <div key={i} className="flex items-center gap-1.5 p-1.5 rounded bg-gray-50 border border-gray-200">
                        <span className="w-3.5 h-3.5 rounded-full bg-[#2B5FC7] text-white flex items-center justify-center text-[9px] font-bold">
                          {i + 1}
                        </span>
                        <span>{inst}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Catatan Khusus */}
                {selectedSpk.notes && (
                  <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                    <strong>Catatan Khusus Produksi:</strong> {selectedSpk.notes}
                  </div>
                )}

                {/* Tanda Tangan Pengesahan (3 Pihak Sesuai PRD) */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t text-center text-[10px]">
                  <div>
                    <div className="text-gray-500 mb-8">Dibuat Oleh (Desain/BOM):</div>
                    <div className="font-bold underline">Sari Indah</div>
                    <div className="text-gray-500">Tim Desain &amp; Pre-press</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-8">Disetujui Oleh (Produksi):</div>
                    <div className="font-bold underline">Rudi Hartono</div>
                    <div className="text-gray-500">Kepala Produksi</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-8">Diterima Vendor / Operator:</div>
                    <div className="font-bold underline">
                      {selectedSpk.targetVendor || "Teknisi Mesin"}
                    </div>
                    <div className="text-gray-500">Pelaksana Pengerjaan</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                  ⚡ Kecepatan render dokumen: ~0.4 detik (Target NFR: &lt; 3.0 detik)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-xs text-[#6B7684]"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerToast(`🖨️ Mengirim perintah cetak SPK ${selectedSpk.spkNumber} ke printer...`);
                      setShowPreviewModal(false);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white text-xs font-medium shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <IconSpk size={13} />
                    <span>Cetak PDF Sekarang</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
