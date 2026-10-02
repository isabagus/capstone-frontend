"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
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
];

export default function QualityControlPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<InspectionTask[]>(SAMPLE_QC_TASKS);
  const [selectedTask, setSelectedTask] = useState<InspectionTask>(SAMPLE_QC_TASKS[0]);

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

        {/* QC Tasks Table */}
        <section className="rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-colors">
          <div className="p-4 border-b border-[#E2E6ED] dark:border-[#26334D]">
            <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
              Daftar Pemeriksaan Batch Produksi
            </h3>
            <p className="text-xs text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
              Checklist fisik kualitas cetak, foil, pengeleman, dan dimensi box
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F4F6FA] dark:bg-[#1B2A44] border-b border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6] font-semibold">
                  <th className="py-3 px-4">No. SPK</th>
                  <th className="py-3 px-4">No. Order</th>
                  <th className="py-3 px-4">Brand &amp; Pelanggan</th>
                  <th className="py-3 px-4">Produk &amp; Jumlah</th>
                  <th className="py-3 px-4">Checklist Parameter Fisik</th>
                  <th className="py-3 px-4">Keputusan QC</th>
                  <th className="py-3 px-4">Catatan Re-work</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]">
                {tasks.map((t) => (
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
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] ${t.checklist.dimensions ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                          Dimensi
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] ${t.checklist.colorAccuracy ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                          Warna
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] ${t.checklist.glueAdhesion ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
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
                ))}
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
                    <span>Lembar Checklist Inspeksi Kualitas Fisik</span>
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

              {/* Checklist Parameters */}
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                  Checklist Parameter Kualitas Fisik:
                </div>

                <div className="space-y-1.5 p-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.dimensions}
                      onChange={(e) => setChecklistState({ ...checklistState, dimensions: e.target.checked })}
                      className="rounded border-[#E2E6ED] text-[#2B5FC7]"
                    />
                    <span>Presisi Ukuran &amp; Dimensi Box (Toleransi &le; 1mm)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.colorAccuracy}
                      onChange={(e) => setChecklistState({ ...checklistState, colorAccuracy: e.target.checked })}
                      className="rounded border-[#E2E6ED] text-[#2B5FC7]"
                    />
                    <span>Akurasi Warna Cetak &amp; Densitas Tinta (Delta E &le; 2.0)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.glueAdhesion}
                      onChange={(e) => setChecklistState({ ...checklistState, glueAdhesion: e.target.checked })}
                      className="rounded border-[#E2E6ED] text-[#2B5FC7]"
                    />
                    <span>Daya Rekat Lem Hotmelt / Samping (Kuat &amp; Rapi)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.foilEmbossQuality}
                      onChange={(e) => setChecklistState({ ...checklistState, foilEmbossQuality: e.target.checked })}
                      className="rounded border-[#E2E6ED] text-[#2B5FC7]"
                    />
                    <span>Kerapian Foil Stamping &amp; Tekstur Emboss</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.cleanliness}
                      onChange={(e) => setChecklistState({ ...checklistState, cleanliness: e.target.checked })}
                      className="rounded border-[#E2E6ED] text-[#2B5FC7]"
                    />
                    <span>Kebersihan Permukaan Box (Bebas Noda Lem / Debu Kertas)</span>
                  </label>
                </div>
              </div>

              {/* Keputusan PASS / FAIL */}
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                  Keputusan Akhir Quality Control:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision("PASS")}
                    className={`py-2 px-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                      decision === "PASS"
                        ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0] dark:bg-[#064E3B] dark:text-[#34D399]"
                        : "bg-[#F4F6FA] dark:bg-[#0F1B2D] border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684]"
                    }`}
                  >
                    <IconCheck size={14} />
                    <span>LOLOS (PASS)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision("FAIL")}
                    className={`py-2 px-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                      decision === "FAIL"
                        ? "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA] dark:bg-[#7F1D1D] dark:text-[#F87171]"
                        : "bg-[#F4F6FA] dark:bg-[#0F1B2D] border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684]"
                    }`}
                  >
                    <IconX size={14} />
                    <span>TIDAK LOLOS (FAIL)</span>
                  </button>
                </div>

                {decision === "FAIL" && (
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-[11px] font-semibold text-[#991B1B] dark:text-[#F87171]">
                      Catatan Cacat &amp; Instruksi Re-work (Wajib):
                    </label>
                    <input
                      required
                      placeholder="Contoh: Warna tidak sesuai proof, perlu cetak ulang lembar cover..."
                      value={defectReason}
                      onChange={(e) => setDefectReason(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-[#FEF2F2]/30 dark:bg-[#7F1D1D]/20 border border-[#FECACA] dark:border-[#7F1D1D]/40 text-[#991B1B] dark:text-[#F87171] text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
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
                  className="px-4 py-2 rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white text-xs font-medium shadow-sm"
                >
                  Simpan Keputusan QC
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
