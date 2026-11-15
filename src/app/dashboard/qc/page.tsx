"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useBrands } from "@/hooks/useInventoryData";
import DataFilterBar from "@/components/ui/DataFilterBar";
import {
  IconQc,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconOrders,
  IconSpk,
  IconRefresh,
  IconWarehouse,
  IconTag,
  IconTruck,
} from "@/components/icons/Icons";

interface InspectionTask {
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

const SAMPLE_QC_TASKS: InspectionTask[] = [
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

export default function QualityControlPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<InspectionTask[]>(SAMPLE_QC_TASKS);
  const [selectedTask, setSelectedTask] = useState<InspectionTask>(SAMPLE_QC_TASKS[0]);

  // Filter States
  const [selectedBrand, setSelectedBrand] = useState<string>("Semua");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const dynamicBrands = useBrands();
  const brands = ["Semua", ...dynamicBrands];

  // Modal Checklist
  const [showChecklistModal, setShowChecklistModal] = useState<boolean>(false);
  const [decision, setDecision] = useState<"PASS" | "FAIL">("PASS");
  const [defectReason, setDefectReason] = useState<string>("");
  const [checklistState, setChecklistState] = useState({
    dimensions: true,
    colorAccuracy: true,
    glueAdhesion: true,
    foilEmbossQuality: true,
    cleanliness: true,
  });

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenInspect = (t: InspectionTask) => {
    setSelectedTask(t);
    setChecklistState(t.checklist);
    setDefectReason(t.defectNotes || "");
    setDecision(t.result === "FAIL" ? "FAIL" : "PASS");
    setShowChecklistModal(true);
  };

  const handleSaveInspection = () => {
    const isAllChecked = Object.values(checklistState).every(Boolean);
    const finalDecision = isAllChecked && decision === "PASS" ? "PASS" : "FAIL";

    setTasks(
      tasks.map((t) =>
        t.id === selectedTask.id
          ? {
              ...t,
              result: finalDecision,
              checklist: checklistState,
              defectNotes: finalDecision === "FAIL" ? defectReason || "Cacat dimensi / fisik" : undefined,
              reworkCount: finalDecision === "FAIL" ? t.reworkCount + 1 : t.reworkCount,
            }
          : t
      )
    );

    setShowChecklistModal(false);

    if (finalDecision === "PASS") {
      triggerToast(
        `✅ SPK ${selectedTask.spkNumber} dinyatakan LOLOS QC (PASS)! Status berubah ke Ready to Deliver & stok terpotong otomatis.`
      );
    } else {
      triggerToast(
        `⚠️ SPK ${selectedTask.spkNumber} TIDAK LOLOS (FAIL). Pesanan otomatis dialihkan kembali ke antrean Re-work!`
      );
    }
  };

  // Filter Logic
  const filteredTasks = tasks.filter((t) => {
    // 1. Filter Brand
    if (selectedBrand !== "Semua" && t.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
      return false;
    }

    // 2. Filter Rentang Tanggal Inspeksi QC
    if (startDate && t.rawInspectionDate && t.rawInspectionDate < startDate) {
      return false;
    }
    if (endDate && t.rawInspectionDate && t.rawInspectionDate > endDate) {
      return false;
    }

    // 3. Filter Pencarian Text
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      const matchSpk = t.spkNumber.toLowerCase().includes(q);
      const matchOrder = t.orderNumber.toLowerCase().includes(q);
      const matchCustomer = t.customerName.toLowerCase().includes(q);
      const matchProduct = t.productName.toLowerCase().includes(q);
      const matchBrand = t.brand.toLowerCase().includes(q);
      const matchInspector = t.inspectorName.toLowerCase().includes(q);
      if (!matchSpk && !matchOrder && !matchCustomer && !matchProduct && !matchBrand && !matchInspector) {
        return false;
      }
    }

    return true;
  });

  const passedCount = tasks.filter((t) => t.result === "PASS").length;
  const failedCount = tasks.filter((t) => t.result === "FAIL").length;
  const pendingCount = tasks.filter((t) => t.result === "Pending").length;

  return (
    <DashboardLayout title="Quality Control & Inspeksi Produk">
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
                MOD-05 · Quality Control Inspection &amp; Re-work Loop
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight">
              Inspeksi Kualitas Fisik Produk
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
              Checklist fisik produk cetak. Keputusan PASS memicu status Ready to Deliver &amp; pemotongan stok otomatis; FAIL dialihkan ke re-work.
            </p>
          </div>
        </div>

        {/* 4 Cards Summary */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Antrean Inspeksi Hari Ini</span>
              <span className="p-1.5 rounded-lg bg-[#EFF4FE] dark:bg-[#1D4ED8]/25 border border-[#D6E3FC] dark:border-[#2563EB]/40 text-[#2B5FC7] dark:text-[#3B6FE0]">
                <IconQc size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#2B5FC7] dark:text-[#3B6FE0] mb-1 tracking-tight">
              {pendingCount} Batch
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
              Finishing selesai siap cek
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Lolos Uji Kualitas (PASS)</span>
              <span className="p-1.5 rounded-lg bg-[#ECFDF5] dark:bg-[#064E3B]/30 border border-[#A7F3D0] dark:border-[#065F46]/50 text-[#065F46] dark:text-[#34D399]">
                <IconCheck size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#065F46] dark:text-[#34D399] mb-1 tracking-tight">
              {passedCount} Batch
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
              Status: Ready to Deliver
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Defect &amp; Re-work (FAIL)</span>
              <span className="p-1.5 rounded-lg bg-[#FEF2F2] dark:bg-[#7F1D1D]/30 border border-[#FECACA] dark:border-[#991B1B]/40 text-[#991B1B] dark:text-[#F87171]">
                <IconAlertTriangle size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#991B1B] dark:text-[#F87171] mb-1 tracking-tight">
              {failedCount} Batch
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
              Kembali ke antrean produksi
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Tingkat Kelayakan (Yield)</span>
              <span className="p-1.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#2B5FC7] dark:text-[#3B6FE0]">
                <IconTruck size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mb-1 tracking-tight">
              {tasks.length > 0 ? Math.round((passedCount / (passedCount + failedCount || 1)) * 100) : 100}%
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
              Target toleransi ≥ 95%
            </div>
          </div>
        </section>

        {/* DataFilterBar Component (Disesuaikan khusus untuk Quality Control) */}
        <DataFilterBar
          categoryLabel="Brand / Klien Pemesan"
          categoryOptions={brands}
          selectedCategory={selectedBrand}
          allCategoryLabel="Semua Brand / Klien"
          dateLabel="Rentang Tanggal Inspeksi QC"
          startDate={startDate}
          endDate={endDate}
          searchLabel="Pencarian SPK / Produk / Inspector"
          searchPlaceholder="Cari No. SPK, No. Order, Produk, Klien..."
          keyword={searchQuery}
          filteredCount={filteredTasks.length}
          onFilterChange={(filters) => {
            setSelectedBrand(filters.category || "Semua");
            setStartDate(filters.startDate || "");
            setEndDate(filters.endDate || "");
            setSearchQuery(filters.keyword || "");
          }}
          onReset={() => {
            setSelectedBrand("Semua");
            setStartDate("");
            setEndDate("");
            setSearchQuery("");
          }}
        />

        {/* QC Tasks Table */}
        <section className="rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-colors">
          <div className="p-4 border-b border-[#E2E6ED] dark:border-[#26334D] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                Daftar Pemeriksaan Batch Produksi
              </h3>
              <p className="text-xs text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                Checklist fisik kualitas cetak, foil, pengeleman, dan dimensi box
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EFF4FE] dark:bg-[#1D4ED8]/25 text-[#2B5FC7] dark:text-[#60A5FA]">
              {filteredTasks.length} SPK Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F4F6FA] dark:bg-[#1B2A44] border-b border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6] font-semibold">
                  <th className="py-3 px-4">No. SPK</th>
                  <th className="py-3 px-4">No. Order</th>
                  <th className="py-3 px-4">Brand &amp; Pelanggan</th>
                  <th className="py-3 px-4">Produk &amp; Jumlah</th>
                  <th className="py-3 px-4">Tgl Inspeksi</th>
                  <th className="py-3 px-4">Checklist Parameter Fisik</th>
                  <th className="py-3 px-4">Keputusan QC</th>
                  <th className="py-3 px-4">Catatan Re-work</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-[#6B7684] dark:text-[#8A94A6]">
                      Tidak ada data pemeriksaan QC yang cocok dengan kriteria filter.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-[#F4F6FA]/70 dark:hover:bg-[#1B2A44]/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#2B5FC7] dark:text-[#3B6FE0] whitespace-nowrap">
                        {t.spkNumber}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#6B7684] dark:text-[#8A94A6]">
                        {t.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold">{t.customerName}</div>
                        <div className="text-[10px] text-[#6B7684] dark:text-[#8A94A6]">{t.brand}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium truncate">{t.productName}</div>
                        <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                          {t.quantity.toLocaleString("id-ID")} pcs
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-[#6B7684] dark:text-[#8A94A6]">
                        {t.inspectionDate}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] ${t.checklist.dimensions ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                            Dimensi
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] ${t.checklist.colorAccuracy ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                            Warna
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] ${t.checklist.glueAdhesion ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                            Lem
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {t.result === "PASS" ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] dark:bg-[#064E3B]/30 dark:text-[#34D399]">
                            PASS (Ready Deliver)
                          </span>
                        ) : t.result === "FAIL" ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] dark:bg-[#7F1D1D]/30 dark:text-[#F87171]">
                            FAIL (Re-work #{t.reworkCount})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] dark:bg-[#78350F]/30 dark:text-[#FBBF24]">
                            Menunggu Cek
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-xs text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                        {t.defectNotes || "—"}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenInspect(t)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white shadow-sm transition-colors"
                        >
                          Form Inspeksi
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modal Form Inspeksi QC (TSK-S4-07 & TSK-S4-08) */}
        {showChecklistModal && selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
                <div>
                  <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3] flex items-center gap-1.5">
                    <IconQc size={16} />
                    <span>Checklist Inspeksi Kualitas Fisik</span>
                  </h3>
                  <p className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
                    SPK: {selectedTask.spkNumber} ({selectedTask.productName})
                  </p>
                </div>
                <button
                  onClick={() => setShowChecklistModal(false)}
                  className="p-1 rounded-lg text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6]"
                >
                  <IconX size={16} />
                </button>
              </div>

              {/* Detail Ringkas SPK */}
              <div className="p-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-xs grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#6B7684] dark:text-[#8A94A6] block text-[10px]">Pelanggan / Brand:</span>
                  <span className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{selectedTask.customerName} ({selectedTask.brand})</span>
                </div>
                <div>
                  <span className="text-[#6B7684] dark:text-[#8A94A6] block text-[10px]">Jumlah Batch:</span>
                  <span className="font-semibold text-[#2B5FC7] dark:text-[#3B6FE0]">{selectedTask.quantity.toLocaleString("id-ID")} pcs</span>
                </div>
              </div>

              {/* 5 Parameter Checklist QC */}
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                  Verifikasi 5 Parameter Mutu Fisik:
                </div>

                <label className="flex items-center gap-2 p-2 rounded border border-[#E2E6ED] dark:border-[#26334D] cursor-pointer hover:bg-[#F4F6FA] dark:hover:bg-[#0F1B2D]">
                  <input
                    type="checkbox"
                    checked={checklistState.dimensions}
                    onChange={(e) => setChecklistState({ ...checklistState, dimensions: e.target.checked })}
                    className="rounded text-[#2B5FC7] focus:ring-[#2B5FC7]"
                  />
                  <span>1. Presisi Dimensi Sesuai Spesifikasi SPK (Toleransi &lt; 0.5 mm)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded border border-[#E2E6ED] dark:border-[#26334D] cursor-pointer hover:bg-[#F4F6FA] dark:hover:bg-[#0F1B2D]">
                  <input
                    type="checkbox"
                    checked={checklistState.colorAccuracy}
                    onChange={(e) => setChecklistState({ ...checklistState, colorAccuracy: e.target.checked })}
                    className="rounded text-[#2B5FC7] focus:ring-[#2B5FC7]"
                  />
                  <span>2. Akurasi Warna Cetak (Delta E ≤ 2.0 vs Proofing Approval)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded border border-[#E2E6ED] dark:border-[#26334D] cursor-pointer hover:bg-[#F4F6FA] dark:hover:bg-[#0F1B2D]">
                  <input
                    type="checkbox"
                    checked={checklistState.glueAdhesion}
                    onChange={(e) => setChecklistState({ ...checklistState, glueAdhesion: e.target.checked })}
                    className="rounded text-[#2B5FC7] focus:ring-[#2B5FC7]"
                  />
                  <span>3. Kekuatan Daya Rekat Lem / Hotmelt (Fiber Tear Test Lolos)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded border border-[#E2E6ED] dark:border-[#26334D] cursor-pointer hover:bg-[#F4F6FA] dark:hover:bg-[#0F1B2D]">
                  <input
                    type="checkbox"
                    checked={checklistState.foilEmbossQuality}
                    onChange={(e) => setChecklistState({ ...checklistState, foilEmbossQuality: e.target.checked })}
                    className="rounded text-[#2B5FC7] focus:ring-[#2B5FC7]"
                  />
                  <span>4. Kualitas Foil &amp; Emboss (Rapi, Tidak Rontok / Pecah)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded border border-[#E2E6ED] dark:border-[#26334D] cursor-pointer hover:bg-[#F4F6FA] dark:hover:bg-[#0F1B2D]">
                  <input
                    type="checkbox"
                    checked={checklistState.cleanliness}
                    onChange={(e) => setChecklistState({ ...checklistState, cleanliness: e.target.checked })}
                    className="rounded text-[#2B5FC7] focus:ring-[#2B5FC7]"
                  />
                  <span>5. Kebersihan Produk (Bebas Noda Minyak Mesin, Debu, &amp; Goresan)</span>
                </label>
              </div>

              {/* Keputusan Inspeksi & Alasan Defect jika Fail */}
              <div className="space-y-3 pt-2 border-t border-[#E2E6ED] dark:border-[#26334D] text-xs">
                <div>
                  <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                    Keputusan Inspektur QC
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDecision("PASS")}
                      className={`p-2 rounded-lg border font-bold text-center transition-all ${
                        decision === "PASS"
                          ? "bg-[#ECFDF5] border-[#059669] text-[#065F46] dark:bg-[#064E3B]/40 dark:text-[#34D399]"
                          : "border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684]"
                      }`}
                    >
                      ✓ PASS (Lolos Siap Kirim)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecision("FAIL")}
                      className={`p-2 rounded-lg border font-bold text-center transition-all ${
                        decision === "FAIL"
                          ? "bg-[#FEF2F2] border-[#DC2626] text-[#991B1B] dark:bg-[#7F1D1D]/40 dark:text-[#F87171]"
                          : "border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684]"
                      }`}
                    >
                      ✕ FAIL (Re-work Produksi)
                    </button>
                  </div>
                </div>

                {decision === "FAIL" && (
                  <div className="space-y-1">
                    <label className="block font-semibold text-[#991B1B] dark:text-[#F87171]">
                      Catatan Defect &amp; Instruksi Re-work:
                    </label>
                    <textarea
                      rows={2}
                      value={defectReason}
                      onChange={(e) => setDefectReason(e.target.value)}
                      placeholder="Contoh: Lipatan pinggir miring 2mm, lem hotmelt kurang matang..."
                      className="w-full p-2 rounded-lg bg-[#FEF2F2]/50 dark:bg-[#7F1D1D]/20 border border-[#FECACA] dark:border-[#991B1B]/40 text-[#1B2436] dark:text-[#E8ECF3] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E6ED] dark:border-[#26334D]">
                <button
                  type="button"
                  onClick={() => setShowChecklistModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-xs text-[#6B7684]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveInspection}
                  className="px-4 py-2 rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white text-xs font-medium shadow-sm transition-colors"
                >
                  Simpan Hasil Inspeksi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
