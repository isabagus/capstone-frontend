"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useBrands } from "@/hooks/useInventoryData";
import {
  useProductionPicMaster,
  calculatePriorityFromDeadline,
} from "@/services/partnerMasterStore";
import {
  useKanbanStore,
  syncKanbanTaskToQc,
  appendAuditLog,
  type KanbanTask,
} from "@/services/operationalStore";
import {
  IconGear,
  IconCheck,
  IconX,
  IconZap,
  IconUsers,
} from "@/components/icons/Icons";

const COLUMNS: { key: KanbanTask["stage"]; label: string; countBadgeColor: string }[] = [
  {
    key: "Design Approved",
    label: "Antrean SPK Terbit",
    countBadgeColor: "bg-[#EFF4FE] text-[#2B5FC7] dark:bg-[#1D4ED8]/25 dark:text-[#60A5FA]",
  },
  {
    key: "In-Progress",
    label: "Cetak Mesin (In-Progress)",
    countBadgeColor: "bg-[#FFFBEB] text-[#92400E] dark:bg-[#78350F]/30 dark:text-[#FBBF24]",
  },
  {
    key: "Finishing",
    label: "Finishing / Subkontrak",
    countBadgeColor: "bg-[#F4F6FA] text-[#2B5FC7] dark:bg-[#1B2A44] dark:text-[#E8ECF3]",
  },
  {
    key: "QC Pending",
    label: "Menunggu Inspeksi QC",
    countBadgeColor: "bg-[#ECFDF5] text-[#065F46] dark:bg-[#064E3B]/30 dark:text-[#34D399]",
  },
];

export default function ProductionKanbanPage() {
  const [tasks, setTasks] = useKanbanStore();
  const [selectedBrand, setSelectedBrand] = useState<string>("Semua");
  const [selectedPicFilter, setSelectedPicFilter] = useState<string>("Semua");

  // Master Data Penanggung Jawab (PIC Produksi) — Revisi 3
  const { pics } = useProductionPicMaster();
  const activePics = useMemo(() => pics.filter((p) => p.active), [pics]);

  // Modal Alokasi Mesin & Penanggung Jawab
  const [showAllocateModal, setShowAllocateModal] = useState<boolean>(false);
  const [taskToAllocate, setTaskToAllocate] = useState<KanbanTask | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string>("Heidelberg SM-74 (4 Warna)");
  const [selectedPicId, setSelectedPicId] = useState<string>("");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const moveTask = (taskId: string, targetStage: KanbanTask["stage"]) => {
    const found = tasks.find((t) => t.id === taskId);
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, stage: targetStage } : t)));
    if (found) {
      if (targetStage === "QC Pending") {
        syncKanbanTaskToQc({ ...found, stage: targetStage });
      }
      appendAuditLog({
        module: "PRODUCTION",
        action: "UPDATE",
        recordId: found.spkNumber,
        description: `Memindahkan kartu Kanban ${found.spkNumber} (${found.productName}) dari '${found.stage}' ke '${targetStage}'`,
        beforeData: { stage: found.stage },
        afterData: { stage: targetStage },
      });
    }
    triggerToast(
      targetStage === "QC Pending"
        ? `Status ${found?.spkNumber || "kartu"} masuk tahap QC Pending & otomatis diteruskan ke antrean Quality Control!`
        : `Status kartu berhasil diperbarui ke tahap ${targetStage}!`
    );
  };

  const dynamicBrands = useBrands();
  const brands = ["Semua", ...dynamicBrands];

  // Hitung prioritas otomatis dari deadline dan urutkan berdasar deadline paling mepet (Revisi 2)
  const enrichedTasks = useMemo(() => {
    return tasks
      .map((t) => {
        const pInfo = calculatePriorityFromDeadline(t.deadline);
        return {
          ...t,
          priority: pInfo.priority,
          deadlineInfo: pInfo,
        };
      })
      .filter((t) => {
        if (selectedBrand !== "Semua" && t.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }
        if (
          selectedPicFilter !== "Semua" &&
          !(t.operatorAssigned || "").toLowerCase().includes(selectedPicFilter.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.deadline.localeCompare(b.deadline));
  }, [tasks, selectedBrand, selectedPicFilter]);

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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-[#E2E6ED] dark:border-[#26334D]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#2B5FC7] dark:bg-[#3B6FE0]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B5FC7] dark:text-[#3B6FE0]">
                MOD-05 · Antrean Berbasis Deadline Terdekat &amp; Master Penanggung Jawab
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight">
              Papan Kanban Produksi Real-Time
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
              Antrean produksi diurutkan otomatis dari deadline paling mepet, dilengkapi penugasan Penanggung Jawab (PIC) dari Master Data.
            </p>
          </div>

          {/* Filter Brand, Filter PIC & Link Master Penanggung Jawab */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#6B7684] dark:text-[#8A94A6]">Brand:</span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] text-xs font-medium focus:outline-none focus:border-[#2B5FC7]"
              >
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b === "Semua" ? "Semua Brand" : b}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#6B7684] dark:text-[#8A94A6]">
                Penanggung Jawab:
              </span>
              <select
                value={selectedPicFilter}
                onChange={(e) => setSelectedPicFilter(e.target.value)}
                className="h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] text-xs font-medium focus:outline-none focus:border-[#2B5FC7]"
              >
                <option value="Semua">Semua PIC ({activePics.length})</option>
                {activePics.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.code} · {p.name}
                  </option>
                ))}
              </select>
            </div>

            <Link
              href="/dashboard/master/pic"
              className="h-9 px-3 rounded-lg bg-[#EFF4FE] hover:bg-[#D6E3FC] dark:bg-[#1D4ED8]/25 text-[#2B5FC7] dark:text-[#93C5FD] border border-[#D6E3FC] dark:border-[#2563EB]/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <IconUsers size={13} />
              <span>Kelola Master PIC</span>
            </Link>
          </div>
        </div>

        {/* Kanban Board Grid (4 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colTasks = enrichedTasks.filter((t) => t.stage === col.key);

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
                    colTasks.map((t, index) => (
                      <div
                        key={t.id}
                        className={`p-3.5 rounded-xl border bg-[#F4F6FA] dark:bg-[#0F1B2D] border-[#E2E6ED] dark:border-[#26334D] shadow-sm space-y-2 transition-all ${
                          t.priority === "Express"
                            ? "border-l-4 border-l-[#991B1B] dark:border-l-[#F87171]"
                            : t.priority === "High"
                            ? "border-l-4 border-l-[#D97706] dark:border-l-[#FBBF24]"
                            : ""
                        }`}
                      >
                        {/* Top: Queue Rank, SPK & Auto Priority Badge */}
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-[#2B5FC7]/10 text-[#2B5FC7] dark:text-[#60A5FA] font-mono font-bold text-[10px]">
                              #{index + 1}
                            </span>
                            <span className="font-mono font-bold text-[#2B5FC7] dark:text-[#3B6FE0]">
                              {t.spkNumber}
                            </span>
                          </div>
                          {t.priority === "Express" ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] animate-pulse">
                              <IconZap size={10} strokeWidth={2.5} />
                              <span>Express</span>
                            </span>
                          ) : t.priority === "High" ? (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]">
                              High
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6]">
                              Normal
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

                        {/* Machine & Penanggung Jawab (PIC) Info */}
                        <div className="p-2 rounded bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[10px] space-y-1">
                          <div className="text-[#1B2436] dark:text-[#E8ECF3] font-medium truncate">
                            ⚙️ {t.machineAssigned || "Belum Alokasi"}
                          </div>
                          <div className="text-[#2B5FC7] dark:text-[#93C5FD] font-semibold truncate">
                            👤 PIC: {t.operatorAssigned || "Belum Ditugaskan"}
                          </div>
                          <div className="text-[#991B1B] dark:text-[#F87171] font-mono pt-0.5 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 font-semibold flex items-center justify-between">
                            <span>⏰ {t.deadlineInfo.formattedDeadline}</span>
                            <span>{t.deadlineInfo.countdownLabel}</span>
                          </div>
                        </div>

                        {/* State Transition Actions (Mundur & Maju) */}
                        <div className="pt-2 border-t border-[#E2E6ED] dark:border-[#26334D] space-y-1.5 text-[11px]">
                          {col.key === "Design Approved" && (
                            <button
                              type="button"
                              onClick={() => {
                                setTaskToAllocate(t);
                                const firstPic = activePics[0];
                                if (firstPic) {
                                  setSelectedPicId(firstPic.id);
                                  setSelectedMachine(firstPic.defaultMachine);
                                }
                                setShowAllocateModal(true);
                              }}
                              className="w-full py-1.5 px-2 rounded-md bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white font-medium shadow-sm transition-colors text-center"
                            >
                              Pilih PIC, Mesin &amp; Mulai →
                            </button>
                          )}

                          {col.key === "In-Progress" && (
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => moveTask(t.id, "Design Approved")}
                                title="Kembalikan ke tahap Antrean Cetak jika salah klik"
                                className="py-1.5 px-2 rounded-md bg-white dark:bg-[#16223A] hover:bg-[#F4F6FA] dark:hover:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6] hover:text-[#1B2436] dark:hover:text-[#E8ECF3] font-medium transition-colors text-center"
                              >
                                ← Mundur
                              </button>
                              <button
                                type="button"
                                onClick={() => moveTask(t.id, "Finishing")}
                                className="py-1.5 px-2 rounded-md bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white font-medium shadow-sm transition-colors text-center"
                              >
                                Maju (Finishing) →
                              </button>
                            </div>
                          )}

                          {col.key === "Finishing" && (
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => moveTask(t.id, "In-Progress")}
                                title="Kembalikan ke tahap Sedang Dikerjakan (Cetak) jika salah klik"
                                className="py-1.5 px-2 rounded-md bg-white dark:bg-[#16223A] hover:bg-[#F4F6FA] dark:hover:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6] hover:text-[#1B2436] dark:hover:text-[#E8ECF3] font-medium transition-colors text-center"
                              >
                                ← Mundur
                              </button>
                              <button
                                type="button"
                                onClick={() => moveTask(t.id, "QC Pending")}
                                className="py-1.5 px-2 rounded-md bg-[#065F46] hover:bg-[#064E3B] text-white font-medium shadow-sm transition-colors text-center"
                              >
                                Maju (Ke QC) →
                              </button>
                            </div>
                          )}

                          {col.key === "QC Pending" && (
                            <div className="space-y-1.5">
                              <div className="w-full text-center py-1 text-[10px] font-semibold text-[#065F46] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[#064E3B]/20 rounded border border-[#A7F3D0] dark:border-[#065F46]/50">
                                Antrean Checklist QC (MOD-05)
                              </div>
                              <button
                                type="button"
                                onClick={() => moveTask(t.id, "Finishing")}
                                title="Kembalikan ke tahap Finishing jika salah klik"
                                className="w-full py-1 px-2 rounded-md bg-white dark:bg-[#16223A] hover:bg-[#F4F6FA] dark:hover:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6] hover:text-[#1B2436] dark:hover:text-[#E8ECF3] font-medium transition-colors text-center"
                              >
                                ← Mundur ke Finishing
                              </button>
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

        {/* Modal Alokasi Mesin & Penanggung Jawab (Terhubung ke Master PIC) */}
        {showAllocateModal && taskToAllocate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
                <div>
                  <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3] flex items-center gap-1.5">
                    <IconGear size={15} />
                    <span>Alokasi Mesin &amp; Penanggung Jawab (PIC)</span>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                      Pilih Penanggung Jawab (dari Master PIC) *
                    </label>
                    <Link
                      href="/dashboard/master/pic"
                      className="text-[11px] font-medium text-[#2B5FC7] hover:underline"
                    >
                      + Tambah/Kelola Master PIC →
                    </Link>
                  </div>
                  <select
                    value={selectedPicId}
                    onChange={(e) => {
                      const pid = e.target.value;
                      setSelectedPicId(pid);
                      const foundPic = activePics.find((p) => p.id === pid);
                      if (foundPic) {
                        setSelectedMachine(foundPic.defaultMachine);
                      }
                    }}
                    className="w-full h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] font-medium"
                  >
                    {activePics.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} · {p.name} ({p.roleTitle} — {p.shift})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                    Pilih Mesin Produksi / Stasiun Kerja
                  </label>
                  <select
                    value={selectedMachine}
                    onChange={(e) => setSelectedMachine(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                  >
                    <option value="Heidelberg SM-74 (4 Warna)">Heidelberg SM-74 (4 Warna Utama)</option>
                    <option value="Heidelberg SM-52 / SM-74">Heidelberg SM-52 / SM-74</option>
                    <option value="Oliver 58 / Komori L-428">Oliver 58 / Komori L-428</option>
                    <option value="Mesin Pond & Die-Cut Bobst">Mesin Pond &amp; Die-Cut Bobst</option>
                    <option value="Mesin Pengeleman Hotmelt Otomatis">Mesin Pengeleman Hotmelt Otomatis</option>
                    <option value="Vendor Foil & Emboss Kurnia / Komori">Vendor Foil &amp; Emboss Kurnia / Komori</option>
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
                    const chosenPic = activePics.find((p) => p.id === selectedPicId) || activePics[0];
                    const picLabel = chosenPic
                      ? `${chosenPic.name} (${chosenPic.roleTitle})`
                      : "Rudi Hartono (Kepala Produksi)";

                    setTasks(
                      tasks.map((t) =>
                        t.id === taskToAllocate.id
                          ? {
                              ...t,
                              machineAssigned: selectedMachine,
                              operatorAssigned: picLabel,
                              stage: "In-Progress",
                            }
                          : t
                      )
                    );
                    appendAuditLog({
                      module: "PRODUCTION",
                      action: "UPDATE",
                      recordId: taskToAllocate.spkNumber,
                      description: `Alokasi mesin ${selectedMachine} & PIC ${picLabel} untuk ${taskToAllocate.spkNumber}`,
                      beforeData: {
                        stage: taskToAllocate.stage,
                        machine: taskToAllocate.machineAssigned,
                        pic: taskToAllocate.operatorAssigned,
                      },
                      afterData: {
                        stage: "In-Progress",
                        machine: selectedMachine,
                        pic: picLabel,
                      },
                    });
                    setShowAllocateModal(false);
                    triggerToast(
                      `SPK ${taskToAllocate.spkNumber} ditugaskan ke ${picLabel} dan masuk tahap In-Progress!`
                    );
                  }}
                  className="px-4 py-2 rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white text-xs font-medium shadow-sm"
                >
                  Tetapkan PIC &amp; Mulai Pengerjaan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
