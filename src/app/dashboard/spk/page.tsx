"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
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
    deadline: "28 Sep 2026",
    status: "Draft",
    finishingInstructions: ["Laminasi Doff", "Emboss Logo Estella", "Lipat Lem Samping"],
    notes: "Menunggu approval Manager untuk penerbitan resmi.",
  },
];

export default function SpkDigitalPage() {
  const { user } = useAuth();
  const [spkList, setSpkList] = useState<SpkDocument[]>(SAMPLE_SPKS);
  const [selectedSpk, setSelectedSpk] = useState<SpkDocument>(SAMPLE_SPKS[0]);

  // Filters
  const [filterType, setFilterType] = useState<string>("Semua");
  const [filterBrand, setFilterBrand] = useState<string>("Semua");

  // Modals
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredSpk = spkList.filter((s) => {
    if (filterType !== "Semua" && s.type !== filterType) return false;
    if (filterBrand !== "Semua" && s.brand !== filterBrand) return false;
    return true;
  });

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

        {/* Filters */}
        <section className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#6B7684] dark:text-[#8A94A6]">Tipe Dokumen:</span>
            {["Semua", "Internal", "Eksternal (Vendor Mitra)"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterType === t
                    ? "bg-[#2B5FC7] text-white dark:bg-[#3B6FE0]"
                    : "bg-[#F4F6FA] text-[#6B7684] hover:text-[#1B2436] border border-[#E2E6ED] dark:bg-[#1B2A44] dark:text-[#8A94A6] dark:border-[#26334D]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#6B7684] dark:text-[#8A94A6]">Brand:</span>
            {["Semua", "Packsolution.id", "Estella", "Pepipapier", "memoirs.print"].map((b) => (
              <button
                key={b}
                onClick={() => setFilterBrand(b)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterBrand === b
                    ? "bg-[#2B5FC7] text-white dark:bg-[#3B6FE0]"
                    : "bg-[#F4F6FA] text-[#6B7684] hover:text-[#1B2436] border border-[#E2E6ED] dark:bg-[#1B2A44] dark:text-[#8A94A6] dark:border-[#26334D]"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </section>

        {/* Table of SPK */}
        <section className="rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F4F6FA] dark:bg-[#1B2A44] border-b border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6] font-semibold">
                  <th className="py-3 px-4">No. SPK</th>
                  <th className="py-3 px-4">No. Order</th>
                  <th className="py-3 px-4">Tipe & Tujuan</th>
                  <th className="py-3 px-4">Brand & Pelanggan</th>
                  <th className="py-3 px-4">Produk</th>
                  <th className="py-3 px-4">Kebutuhan Bahan</th>
                  <th className="py-3 px-4">Status SPK</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]">
                {filteredSpk.map((s) => (
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
                        {s.targetVendor}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">{s.customerName}</div>
                      <div className="text-[10px] text-[#6B7684] dark:text-[#8A94A6]">{s.brand}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="truncate font-medium">{s.productName}</div>
                      <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                        {s.orderQuantity.toLocaleString("id-ID")} pcs
                      </div>
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
                ))}
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
                      <div className="font-extrabold text-sm uppercase">CV Solusi Inovasi Packaging</div>
                      <div className="text-[10px] text-gray-500">Percetakan & Kemasan Karton Rigid Box · Jawa Timur</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-[#2B5FC7]">{selectedSpk.spkNumber}</div>
                    <div className="text-[10px] text-gray-500">Tanggal: {selectedSpk.publishDate}</div>
                  </div>
                </div>

                <div className="text-center py-1">
                  <div className="font-black text-sm uppercase tracking-wide">
                    SURAT PERINTAH KERJA ({selectedSpk.type.toUpperCase()})
                  </div>
                  <div className="text-[10px] text-gray-500">Target Pelaksana: {selectedSpk.targetVendor}</div>
                </div>

                {/* Details Table */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <div>
                    <span className="text-[10px] text-gray-500 block">Nomor Order Pelanggan:</span>
                    <strong className="font-mono">{selectedSpk.orderNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Unit Bisnis / Brand:</span>
                    <strong>{selectedSpk.brand}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Pelanggan:</span>
                    <strong>{selectedSpk.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Deadline Siap Kirim:</span>
                    <strong className="text-red-700">{selectedSpk.deadline}</strong>
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <div className="font-bold text-xs uppercase mb-1.5 pb-1 border-b border-gray-200">
                    Spesifikasi Produk & Kebutuhan Bahan Baku (BOM Engine):
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-gray-500 block">Produk:</span>
                      <strong>{selectedSpk.productName}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Jumlah Order:</span>
                      <strong>{selectedSpk.orderQuantity.toLocaleString("id-ID")} pcs</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Dimensi Jadi:</span>
                      <strong>{selectedSpk.dimensions}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Jenis Kertas:</span>
                      <strong>{selectedSpk.paperType}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Bahan Plano Dibutuhkan:</span>
                      <strong>{selectedSpk.totalRims} Rim ({selectedSpk.totalPlanoSheets} lbr)</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Insheet Cadangan:</span>
                      <strong>+{selectedSpk.insheetQuantity} Lembar</strong>
                    </div>
                  </div>
                </div>

                {/* Finishing Instruction */}
                <div>
                  <div className="font-bold text-xs uppercase mb-1.5 pb-1 border-b border-gray-200">
                    Instruksi Finishing & Pengerjaan Khusus:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {selectedSpk.finishingInstructions.map((ins, idx) => (
                      <li key={idx}>{ins}</li>
                    ))}
                  </ul>
                  {selectedSpk.notes && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-[11px] text-yellow-900">
                      <strong>Catatan Khusus:</strong> {selectedSpk.notes}
                    </div>
                  )}
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 text-center text-[10px]">
                  <div>
                    <div className="text-gray-400">Dibuat Oleh:</div>
                    <div className="h-10" />
                    <div className="font-bold">Tim Design CV SIP</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Disetujui Oleh:</div>
                    <div className="h-10" />
                    <div className="font-bold">Manager Operasional</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Diterima Pelaksana:</div>
                    <div className="h-10" />
                    <div className="font-bold">{selectedSpk.targetVendor}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E2E6ED] dark:border-[#26334D]">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-xs text-[#6B7684]"
                >
                  Tutup
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerToast(`Mengunduh berkas PDF untuk ${selectedSpk.spkNumber} (Render < 1.2 detik)...`);
                    }}
                    className="px-4 py-2 rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white text-xs font-medium shadow-sm flex items-center gap-1.5"
                  >
                    <span>Unduh Dokumen PDF</span>
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
