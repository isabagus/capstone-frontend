"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useBrands } from "@/hooks/useInventoryData";
import {
  IconProduction,
  IconOrders,
  IconSpk,
  IconGear,
  IconCheck,
  IconRefresh,
  IconPlus,
  IconX,
  IconTag,
  IconZap,
  IconWarehouse,
  IconAlertTriangle,
} from "@/components/icons/Icons";

interface KanbanTask {
  id: string;
  spkNumber: string;
  orderNumber: string;
  customerName: string;
  brand: string;
  productName: string;
  quantity: number;
  priority: "Normal" | "High" | "Express";
  deadline: string;
  stage: "Design Approved" | "In-Progress" | "Finishing" | "QC Pending";
  machineAssigned?: string;
  operatorAssigned?: string;
}

const INITIAL_TASKS: KanbanTask[] = [
  {
    id: "1",
    spkNumber: "SPK-INT-2026-081",
    orderNumber: "ORD-2026-0901",
    customerName: "PT Artha Boga Sejahtera",
    brand: "Packsolution.id",
    productName: "Hardbox Rigid Premium Magnetic Gold",
    quantity: 2500,
    priority: "Express",
    deadline: "25 Sep 18:00 WIB",
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
    deadline: "30 Sep 2026",
    stage: "Finishing",
    machineAssigned: "Vendor Foil Kurnia",
    operatorAssigned: "Vendor Mitra",
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
    deadline: "28 Sep 2026",
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
    priority: "High",
    deadline: "26 Sep 2026",
    stage: "QC Pending",
    machineAssigned: "Mesin Lem Hardcover",
    operatorAssigned: "Teknisi Finishing B",
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
    deadline: "02 Okt 2026",
    stage: "Finishing",
    machineAssigned: "Mesin Ziplock Sealing",
    operatorAssigned: "Operator C",
  },
];

const COLUMNS: { key: KanbanTask["stage"]; label: string; countBadgeColor: string }[] = [
  { key: "Design Approved", label: "Antrean SPK Terbit", countBadgeColor: "bg-[#EFF4FE] text-[#2B5FC7] dark:bg-[#1D4ED8]/25 dark:text-[#60A5FA]" },
  { key: "In-Progress", label: "Cetak Mesin (In-Progress)", countBadgeColor: "bg-[#FFFBEB] text-[#92400E] dark:bg-[#78350F]/30 dark:text-[#FBBF24]" },
  { key: "Finishing", label: "Finishing / Subkontrak", countBadgeColor: "bg-[#F4F6FA] text-[#2B5FC7] dark:bg-[#1B2A44] dark:text-[#E8ECF3]" },
  { key: "QC Pending", label: "Menunggu Inspeksi QC", countBadgeColor: "bg-[#ECFDF5] text-[#065F46] dark:bg-[#064E3B]/30 dark:text-[#34D399]" },
];

export default function ProductionKanbanPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<KanbanTask[]>(INITIAL_TASKS);
  const [selectedBrand, setSelectedBrand] = useState<string>("Semua");

  // Modal Alokasi Mesin
  const [showAllocateModal, setShowAllocateModal] = useState<boolean>(false);
  const [taskToAllocate, setTaskToAllocate] = useState<KanbanTask | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string>("Heidelberg SM-74 (4 Warna)");
  const [selectedOperator, setSelectedOperator] = useState<string>("Rudi Hartono (Kepala Produksi)");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const moveTask = (taskId: string, targetStage: KanbanTask["stage"]) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, stage: targetStage } : t))
    );
    triggerToast(`Status kartu berhasil diperbarui ke tahap ${targetStage}!`);
  };

  const dynamicBrands = useBrands();
  const brands = ["Semua", ...dynamicBrands];

  const filteredTasks = tasks.filter((t) => {
    if (selectedBrand !== "Semua" && t.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
    return true;
  });

  return (
    <DashboardLayout title="Papan Kanban Produksi">
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
                MOD-05 · Pelacakan Alur Kerja Produksi & Alokasi Mesin
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight">
              Papan Kanban Produksi Real-Time
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
              Pantau antrean pesanan berdasarkan prioritas deadline, alokasikan mesin, dan teruskan ke tahap inspeksi QC.
            </p>
          </div>

          {/* Filter Brand */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedBrand === b
                    ? "bg-[#2B5FC7] text-white dark:bg-[#3B6FE0]"
                    : "bg-[#F4F6FA] text-[#6B7684] hover:text-[#1B2436] border border-[#E2E6ED] dark:bg-[#1B2A44] dark:text-[#8A94A6] dark:border-[#26334D]"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Kanban Board Grid (4 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.stage === col.key);

            return (
              <div
                key={col.key}
                className="rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none p-3.5 space-y-3 min-h-[500px] flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E6ED] dark:border-[#26334D]">
                  <h3 className="text-xs font-bold text-[#1B2436] dark:text-[#E8ECF3] truncate">
                    {col.label}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col.countBadgeColor}`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 flex-1">
                  {colTasks.length === 0 ? (
                    <div className="h-28 border-2 border-dashed border-[#E2E6ED] dark:border-[#26334D] rounded-lg flex items-center justify-center text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                      Tidak ada antrean
                    </div>
                  ) : (
                    colTasks.map((t) => (
                      <div
                        key={t.id}
                        className={`p-3.5 rounded-xl border bg-[#F4F6FA] dark:bg-[#0F1B2D] border-[#E2E6ED] dark:border-[#26334D] shadow-sm space-y-2 transition-all ${
                          t.priority === "Express" ? "border-l-4 border-l-[#991B1B] dark:border-l-[#F87171]" : ""
                        }`}
                      >
                        {/* Top: SPK & Priority Badge */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-[#2B5FC7] dark:text-[#3B6FE0]">
                            {t.spkNumber}
                          </span>
                          {t.priority === "Express" ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] animate-pulse">
                              <IconZap size={10} strokeWidth={2.5} />
                              <span>Express</span>
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6]">
                              {t.priority}
                            </span>
                          )}
                        </div>

                        {/* Customer & Product */}
                        <div>
                          <div className="text-xs font-bold text-[#1B2436] dark:text-[#E8ECF3] leading-tight">
                            {t.customerName}
                          </div>
                          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] line-clamp-2 mt-0.5">
                            {t.productName}
                          </div>
                          <div className="text-[10px] text-[#2B5FC7] dark:text-[#3B6FE0] font-semibold mt-1">
                            {t.quantity.toLocaleString("id-ID")} pcs · {t.brand}
                          </div>
                        </div>

                        {/* Machine & Operator Info */}
                        <div className="p-2 rounded bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[10px] space-y-0.5">
                          <div className="text-[#1B2436] dark:text-[#E8ECF3] font-medium truncate">
                            ⚙️ {t.machineAssigned || "Belum Alokasi"}
                          </div>
                          <div className="text-[#6B7684] dark:text-[#8A94A6] truncate">
                            👤 {t.operatorAssigned || "Belum Teknisi"}
                          </div>
                          <div className="text-[#991B1B] dark:text-[#F87171] font-mono mt-1 font-semibold">
                            ⏰ Deadline: {t.deadline}
                          </div>
                        </div>

                        {/* State Transition Actions */}
                        <div className="pt-2 border-t border-[#E2E6ED] dark:border-[#26334D] flex items-center justify-between gap-1 text-[11px]">
                          {col.key === "Design Approved" && (
                            <button
                              type="button"
                              onClick={() => {
                                setTaskToAllocate(t);
                                setShowAllocateModal(true);
                              }}
                              className="w-full py-1.5 px-2 rounded-md bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white font-medium shadow-sm transition-colors text-center"
                            >
                              Alokasi Mesin &amp; Mulai
                            </button>
                          )}

                          {col.key === "In-Progress" && (
                            <button
                              type="button"
                              onClick={() => moveTask(t.id, "Finishing")}
                              className="w-full py-1.5 px-2 rounded-md bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white font-medium shadow-sm transition-colors text-center"
                            >
                              Selesai Cetak → Finishing
                            </button>
                          )}

                          {col.key === "Finishing" && (
                            <button
                              type="button"
                              onClick={() => moveTask(t.id, "QC Pending")}
                              className="w-full py-1.5 px-2 rounded-md bg-[#065F46] hover:bg-[#064E3B] text-white font-medium shadow-sm transition-colors text-center"
                            >
                              Serahkan ke Inspeksi QC →
                            </button>
                          )}

                          {col.key === "QC Pending" && (
                            <div className="w-full text-center py-1 text-[11px] font-semibold text-[#065F46] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[#064E3B]/20 rounded border border-[#A7F3D0] dark:border-[#065F46]/50">
                              Antrean Checklist QC (MOD-05)
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Alokasi Mesin & Teknisi */}
        {showAllocateModal && taskToAllocate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
                <div>
                  <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3] flex items-center gap-1.5">
                    <IconGear size={15} />
                    <span>Alokasi Mesin &amp; Teknisi Produksi</span>
                  </h3>
                  <p className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
                    SPK: {taskToAllocate.spkNumber} ({taskToAllocate.productName})
                  </p>
                </div>
                <button
                  onClick={() => setShowAllocateModal(false)}
                  className="p-1 rounded-lg text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6]"
                >
                  <IconX size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                    Pilih Mesin Produksi
                  </label>
                  <select
                    value={selectedMachine}
                    onChange={(e) => setSelectedMachine(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                  >
                    <option value="Heidelberg SM-74 (4 Warna)">Heidelberg SM-74 (4 Warna Utama)</option>
                    <option value="Oliver 58 (1 Warna / Cetak Khusus)">Oliver 58 (1 Warna / Khusus)</option>
                    <option value="Mesin Pond & Die-Cut Bobst">Mesin Pond &amp; Die-Cut Bobst</option>
                    <option value="Mesin Pengeleman Hotmelt Otomatis">Mesin Pengeleman Hotmelt Otomatis</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                    Teknisi Penanggung Jawab
                  </label>
                  <select
                    value={selectedOperator}
                    onChange={(e) => setSelectedOperator(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                  >
                    <option value="Rudi Hartono (Kepala Produksi)">Rudi Hartono (Kepala Produksi)</option>
                    <option value="Teknisi Cetak Senior A">Teknisi Cetak Senior A</option>
                    <option value="Teknisi Finishing B">Teknisi Finishing B</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E6ED] dark:border-[#26334D]">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-xs text-[#6B7684]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTasks(
                      tasks.map((t) =>
                        t.id === taskToAllocate.id
                          ? {
                              ...t,
                              machineAssigned: selectedMachine,
                              operatorAssigned: selectedOperator,
                              stage: "In-Progress",
                            }
                          : t
                      )
                    );
                    setShowAllocateModal(false);
                    triggerToast(`Tugas ${taskToAllocate.spkNumber} berhasil dialokasikan dan status berpindah ke In-Progress!`);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white text-xs font-medium shadow-sm"
                >
                  Tetapkan &amp; Mulai Pengerjaan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
