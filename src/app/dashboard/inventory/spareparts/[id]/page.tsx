"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatusBadge from "@/components/ui/StatusBadge";
import FormModal from "@/components/ui/FormModal";
import StockMutationModal, { type MutationType } from "@/components/inventory/StockMutationModal";
import Can from "@/components/auth/Can";
import { btn, cx, inputBase } from "@/components/ui/styles";
import {
  useCategories,
  useMovements,
  useSpareparts,
  useSuppliers,
  useUnits,
  useWarehouses,
} from "@/hooks/useInventoryData";
import { sparepartService } from "@/services/inventoryService";
import type { Sparepart } from "@/types/inventory";
import {
  findCategoryName,
  findUnitAbbr,
  findUnitName,
  formatDate,
  formatDateTime,
  formatMovementRoute,
  formatNumber,
  getExpiryStatus,
  getStockStatus,
  getWarehouseStock,
  STOCK_STATUS_LABEL,
  totalStock,
} from "@/lib/inventoryUtils";
import {
  IconAlertTriangle,
  IconArrowIn,
  IconArrowLeft,
  IconArrowOut,
  IconCalendar,
  IconClock,
  IconEdit,
  IconFilter,
  IconGear,
  IconRefresh,
  IconTruck,
  IconWarehouse,
} from "@/components/icons/Icons";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SparepartDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: spareparts, loading: loadingSpareparts, error: errorSpareparts, reload: reloadSpareparts } = useSpareparts();
  const { data: categories } = useCategories("sparepart");
  const { data: suppliers } = useSuppliers();
  const { data: units } = useUnits();
  const warehouses = useWarehouses();
  const { data: allMovements, loading: loadingMovements, reload: reloadMovements } = useMovements("sparepart", id);

  const sparepart = useMemo(() => spareparts?.find((s) => s.id === id), [spareparts, id]);

  // Mutation modal state
  const [mutationModal, setMutationModal] = useState<{
    open: boolean;
    type: MutationType;
  }>({ open: false, type: "IN" });

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [safetyStock, setSafetyStock] = useState(5);
  const [rop, setRop] = useState(10);
  const [supplierId, setSupplierId] = useState("");
  const [machine, setMachine] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Movements filter & pagination
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    if (sparepart) {
      setCode(sparepart.code);
      setName(sparepart.name);
      setCategoryId(sparepart.categoryId);
      setUnitId(sparepart.unitId);
      setSafetyStock(sparepart.safetyStock);
      setRop(sparepart.rop);
      setSupplierId(sparepart.supplierId);
      setMachine(sparepart.machine || "");
      setBatchNo(sparepart.batchNo || "");
      setExpiryDate(sparepart.expiryDate || "");
    }
  }, [sparepart]);

  const filteredMovements = useMemo(() => {
    if (!allMovements) return [];
    if (typeFilter === "ALL") return allMovements;
    return allMovements.filter((m) => m.type === typeFilter);
  }, [allMovements, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMovements.length / pageSize));
  const paginatedMovements = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredMovements.slice(start, start + pageSize);
  }, [filteredMovements, page]);

  const handleSaveEdit = async () => {
    if (!code.trim() || !name.trim()) {
      setFormError("Kode dan Nama Sparepart wajib diisi.");
      return;
    }
    if (safetyStock < 0 || rop < 0) {
      setFormError("Safety stock dan ROP tidak boleh bernilai negatif.");
      return;
    }
    if (!sparepart) return;

    setPending(true);
    setFormError(null);
    try {
      await sparepartService.update(sparepart.id, {
        code: code.trim(),
        name: name.trim(),
        categoryId: categoryId || sparepart.categoryId,
        unitId: unitId || sparepart.unitId,
        stock: sparepart.stock,
        safetyStock,
        rop,
        supplierId: supplierId || sparepart.supplierId,
        machine: machine.trim() || undefined,
        batchNo: batchNo.trim() || undefined,
        expiryDate: expiryDate || undefined,
      });
      setIsEditOpen(false);
      reloadSpareparts();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal memperbarui sparepart.");
    } finally {
      setPending(false);
    }
  };

  // 1. Loading State
  if (loadingSpareparts) {
    return (
      <DashboardLayout title="Memuat Detail Sparepart...">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-28 bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] rounded-xl p-6 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] rounded-xl animate-pulse" />
            <div className="h-96 bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] rounded-xl animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 2. Error State
  if (errorSpareparts) {
    return (
      <DashboardLayout title="Kesalahan Memuat Sparepart">
        <div className="max-w-3xl mx-auto p-8 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center font-bold text-xl">
            !
          </div>
          <h2 className="text-lg font-bold text-[#1B2436] dark:text-[#E8ECF3]">Gagal Memuat Data Sparepart</h2>
          <p className="text-sm text-[#6B7684] dark:text-[#8A94A6]">{errorSpareparts}</p>
          <div className="flex justify-center gap-3 pt-2">
            <button type="button" onClick={() => router.back()} className={btn.outline}>
              ← Kembali
            </button>
            <button type="button" onClick={reloadSpareparts} className={btn.primary}>
              Coba Lagi
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 3. Not Found State
  if (!sparepart) {
    return (
      <DashboardLayout title="Sparepart Tidak Ditemukan">
        <div className="max-w-2xl mx-auto py-16 px-6 text-center bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] rounded-xl space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center text-2xl font-bold">
            ?
          </div>
          <h2 className="text-xl font-bold text-[#1B2436] dark:text-[#E8ECF3]">Sparepart Tidak Ditemukan</h2>
          <p className="text-sm text-[#6B7684] dark:text-[#8A94A6]">
            Item sparepart dengan ID <span className="font-mono font-semibold">{id}</span> tidak ditemukan atau telah dihapus.
          </p>
          <div className="pt-2">
            <button type="button" onClick={() => router.back()} className={btn.primary}>
              ← Kembali ke Daftar Sparepart
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const currentTotal = totalStock(sparepart.stock);
  const unitAbbr = findUnitAbbr(units, sparepart.unitId);
  const unitFullName = findUnitName(units, sparepart.unitId);
  const categoryName = findCategoryName(categories, sparepart.categoryId);
  const supplierName = suppliers?.find((s) => s.id === sparepart.supplierId)?.name ?? "-";

  const stockStatus = getStockStatus(currentTotal, sparepart.rop);
  const stockTone =
    stockStatus === "safe" ? ("green" as const) : stockStatus === "near" ? ("yellow" as const) : ("red" as const);
  const expiryStatus = getExpiryStatus(sparepart.expiryDate);

  return (
    <DashboardLayout title={`Detail: ${sparepart.name}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Back & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2B5FC7] dark:text-[#93B4F5] hover:underline cursor-pointer py-1 self-start"
          >
            <IconArrowLeft size={14} />
            <span>← Kembali</span>
          </button>
          <nav aria-label="Breadcrumb" className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span className="mx-1.5">/</span>
            <Link href="/dashboard/inventory/spareparts" className="hover:underline">Inventori</Link>
            <span className="mx-1.5">/</span>
            <Link href="/dashboard/inventory/spareparts" className="hover:underline">Sparepart & Consumable</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#1B2436] dark:text-[#E8ECF3] font-medium">{sparepart.name}</span>
          </nav>
        </div>

        {/* Header Item Card */}
        <div className="p-6 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded font-semibold bg-[#EFF4FE] dark:bg-[#1D4ED8]/20 text-[#2B5FC7] dark:text-[#93B4F5] border border-[#D6E3FC] dark:border-[#2563EB]/40">
                {sparepart.code}
              </span>
              {sparepart.machine && (
                <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#2B5FC7] dark:text-[#93B4F5]">
                  Mesin: {sparepart.machine}
                </span>
              )}
              <StatusBadge tone={stockTone} dot>
                {STOCK_STATUS_LABEL[stockStatus]}
              </StatusBadge>
              {expiryStatus === "expired" && <StatusBadge tone="red">Kedaluwarsa</StatusBadge>}
              {expiryStatus === "soon" && <StatusBadge tone="yellow">Mendekati Exp</StatusBadge>}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight">
              {sparepart.name}
            </h1>
            <p className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
              Kategori: <span className="font-medium text-[#1B2436] dark:text-[#E8ECF3]">{categoryName}</span> · Supplier:{" "}
              <span className="font-medium text-[#1B2436] dark:text-[#E8ECF3]">{supplierName}</span>
            </p>
          </div>

          {/* Action Buttons wrapped in Can */}
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <Can permission="inventory.spareparts.edit">
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className={btn.outline}
              >
                <IconEdit size={14} />
                <span>Edit Sparepart</span>
              </button>
            </Can>
            <Can permission="inventory.stock.transfer">
              <button
                type="button"
                onClick={() => setMutationModal({ open: true, type: "TRANSFER" })}
                className={btn.outline}
              >
                <IconRefresh size={14} />
                <span>Transfer</span>
              </button>
            </Can>
            <Can permission="inventory.stock.in">
              <button
                type="button"
                onClick={() => setMutationModal({ open: true, type: "IN" })}
                className={btn.primary}
              >
                <IconArrowIn size={14} />
                <span>Barang Masuk</span>
              </button>
            </Can>
            <Can permission="inventory.stock.out">
              <button
                type="button"
                onClick={() => setMutationModal({ open: true, type: "OUT" })}
                className={cx(btn.outline, "text-[#DC2626] border-[#FECACA] hover:bg-[#FEF2F2] dark:border-[#991B1B]/40 dark:hover:bg-[#7F1D1D]/20")}
              >
                <IconArrowOut size={14} />
                <span>Barang Keluar</span>
              </button>
            </Can>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (Left - 2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Rincian Stok Multi-Gudang */}
            <div className="p-6 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#EFF4FE] dark:bg-[#1B2A44] text-[#2B5FC7] dark:text-[#93B4F5]">
                    <IconWarehouse size={16} />
                  </span>
                  <h2 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3] uppercase tracking-wider">
                    Rincian Stok Multi-Gudang
                  </h2>
                </div>
                <span className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
                  Sinkronisasi Gudang
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {warehouses.map((w) => {
                  const stockVal = getWarehouseStock(sparepart.stock, w.id);
                  return (
                    <div
                      key={w.id}
                      className="p-4 rounded-xl border border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA]/70 dark:bg-[#1B2A44]/70 space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs text-[#6B7684] dark:text-[#8A94A6]">
                        <span>{w.name}</span>
                        <span className="font-mono text-[11px]">{w.code || w.id}</span>
                      </div>
                      <div className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight">
                        {formatNumber(stockVal)}{" "}
                        <span className="text-xs font-normal text-[#6B7684] dark:text-[#8A94A6]">
                          {unitAbbr}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] truncate">
                        {w.description || "Gudang penyimpanan aktif"}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Stock Banner + SS & ROP */}
              <div className="p-4 rounded-xl border border-[#D6E3FC] dark:border-[#2563EB]/40 bg-[#EFF4FE] dark:bg-[#1D4ED8]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[#2B5FC7] dark:text-[#93B4F5]">
                    Total Stok Seluruh Gudang (Gudang 1 + Gudang 2)
                  </div>
                  <div className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
                    Safety Stock: <strong className="text-[#1B2436] dark:text-[#E8ECF3]">{formatNumber(sparepart.safetyStock)} {unitAbbr}</strong> · Reorder Point (ROP):{" "}
                    <strong className="text-[#1B2436] dark:text-[#E8ECF3]">{formatNumber(sparepart.rop)} {unitAbbr}</strong>
                  </div>
                </div>
                <div className="text-2xl font-black text-[#2B5FC7] dark:text-[#93B4F5]">
                  {formatNumber(currentTotal)}{" "}
                  <span className="text-xs font-semibold">{unitAbbr}</span>
                </div>
              </div>
            </div>

            {/* 3. Riwayat Mutasi */}
            <div className="p-6 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#EFF4FE] dark:bg-[#1B2A44] text-[#2B5FC7] dark:text-[#93B4F5]">
                    <IconClock size={16} />
                  </span>
                  <h2 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3] uppercase tracking-wider">
                    Riwayat Mutasi Stok
                  </h2>
                </div>

                {/* Filter Mutasi */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <IconFilter size={13} className="text-[#6B7684] mr-1 hidden sm:inline" />
                  {["ALL", "IN", "OUT", "TRANSFER", "OPNAME"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTypeFilter(t);
                        setPage(1);
                      }}
                      className={cx(
                        "px-2.5 py-1 text-xs rounded-lg font-medium transition-colors whitespace-nowrap",
                        typeFilter === t
                          ? "bg-[#2B5FC7] text-white dark:bg-[#3B6FE0]"
                          : "bg-[#F4F6FA] text-[#6B7684] hover:text-[#1B2436] dark:bg-[#1B2A44] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3]"
                      )}
                    >
                      {t === "ALL" ? "Semua" : t}
                    </button>
                  ))}
                </div>
              </div>

              {loadingMovements ? (
                <div className="py-8 text-center text-xs text-[#6B7684]">Memuat riwayat mutasi...</div>
              ) : paginatedMovements.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#6B7684] dark:text-[#8A94A6]">
                  Belum ada catatan mutasi untuk sparepart ini.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6] font-semibold">
                        <th className="py-2.5 px-3">Tanggal & Waktu</th>
                        <th className="py-2.5 px-3">Jenis</th>
                        <th className="py-2.5 px-3 text-right">Jumlah</th>
                        <th className="py-2.5 px-3">Asal → Tujuan</th>
                        <th className="py-2.5 px-3">Catatan</th>
                        <th className="py-2.5 px-3">Petugas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]">
                      {paginatedMovements.map((m) => {
                        const typeBadgeTone =
                          m.type === "IN"
                            ? ("green" as const)
                            : m.type === "OUT"
                            ? ("red" as const)
                            : m.type === "TRANSFER"
                            ? ("blue" as const)
                            : ("yellow" as const);

                        return (
                          <tr key={m.id} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/40">
                            <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                              {formatDateTime(m.date)}
                            </td>
                            <td className="py-2.5 px-3">
                              <StatusBadge tone={typeBadgeTone}>{m.type}</StatusBadge>
                            </td>
                            <td className="py-2.5 px-3 text-right font-semibold whitespace-nowrap">
                              {m.qty > 0 && m.type !== "OUT" ? `+${formatNumber(m.qty)}` : formatNumber(m.qty)}{" "}
                              <span className="text-[10px] font-normal text-[#6B7684]">{unitAbbr}</span>
                            </td>
                            <td className="py-2.5 px-3 font-medium whitespace-nowrap">
                              {/* Bug #3 fix: formatMovementRoute handles Transfer vs Non-Transfer correctly */}
                              {formatMovementRoute(m.type, m.warehouse, m.toWarehouse)}
                            </td>
                            <td className="py-2.5 px-3 max-w-[200px]">
                              {/* Bug #4 fix: Tanpa catatan bergaya abu miring terpisah */}
                              {m.note && m.note.trim() ? (
                                <span className="text-[#1B2436] dark:text-[#E8ECF3]">{m.note}</span>
                              ) : (
                                <span className="text-[#8A94A6] dark:text-[#6B7684] italic">Tanpa catatan</span>
                              )}
                              {m.reference && (
                                <div className="text-[10px] text-[#2B5FC7] dark:text-[#93B4F5] font-mono">
                                  Ref: {m.reference}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap text-[#6B7684] dark:text-[#8A94A6]">
                              {/* Bug #4 fix: Petugas terpisah tidak digabung */}
                              {m.user || "Staf Gudang"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-3 border-t border-[#E2E6ED] dark:border-[#26334D] text-xs">
                  <span className="text-[#6B7684] dark:text-[#8A94A6]">
                    Halaman {page} dari {totalPages} ({filteredMovements.length} mutasi)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={cx(btn.outline, "h-8 px-2.5 text-xs", page <= 1 && "opacity-50 cursor-not-allowed")}
                    >
                      Sebelumnya
                    </button>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className={cx(btn.outline, "h-8 px-2.5 text-xs", page >= totalPages && "opacity-50 cursor-not-allowed")}
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary & Sparepart Info */}
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
                <span className="p-1.5 rounded-lg bg-[#EFF4FE] dark:bg-[#1B2A44] text-[#2B5FC7] dark:text-[#93B4F5]">
                  <IconGear size={16} />
                </span>
                <h2 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3] uppercase tracking-wider">
                  Informasi Sparepart
                </h2>
              </div>

              <dl className="space-y-3 text-xs">
                <div>
                  <dt className="text-[#6B7684] dark:text-[#8A94A6]">Kategori</dt>
                  <dd className="font-semibold text-sm text-[#1B2436] dark:text-[#E8ECF3] mt-0.5">
                    {categoryName}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6B7684] dark:text-[#8A94A6]">Satuan Dasar</dt>
                  <dd className="font-semibold text-sm text-[#1B2436] dark:text-[#E8ECF3] mt-0.5">
                    {unitFullName} ({unitAbbr})
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6B7684] dark:text-[#8A94A6]">Supplier Mitra</dt>
                  <dd className="font-semibold text-sm text-[#1B2436] dark:text-[#E8ECF3] mt-0.5">
                    {supplierName}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6B7684] dark:text-[#8A94A6]">Peruntukan Mesin</dt>
                  <dd className="font-semibold text-sm text-[#1B2436] dark:text-[#E8ECF3] mt-0.5">
                    {sparepart.machine || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6B7684] dark:text-[#8A94A6]">Nomor Batch / Lot</dt>
                  <dd className="font-semibold font-mono text-sm text-[#1B2436] dark:text-[#E8ECF3] mt-0.5">
                    {sparepart.batchNo || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6B7684] dark:text-[#8A94A6]">Tanggal Kedaluwarsa</dt>
                  <dd className="font-semibold text-sm text-[#1B2436] dark:text-[#E8ECF3] mt-0.5">
                    {sparepart.expiryDate ? formatDate(sparepart.expiryDate) : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6B7684] dark:text-[#8A94A6]">Safety Stock / ROP</dt>
                  <dd className="font-semibold text-sm text-[#1B2436] dark:text-[#E8ECF3] mt-0.5">
                    {formatNumber(sparepart.safetyStock)} / {formatNumber(sparepart.rop)} {unitAbbr}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Mutation Modal */}
        <StockMutationModal
          open={mutationModal.open}
          onClose={() => setMutationModal((m) => ({ ...m, open: false }))}
          type={mutationModal.type}
          item={sparepart}
          kind="sparepart"
          onSuccess={() => {
            reloadSpareparts();
            reloadMovements();
          }}
        />

        {/* Edit Modal */}
        <FormModal
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Data Sparepart"
          subtitle={`Perbarui atribut sparepart ${sparepart.code}`}
          onSubmit={handleSaveEdit}
          pending={pending}
          error={formError}
          submitLabel="Simpan Perubahan"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                Kode Sparepart <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={cx(inputBase, "w-full font-mono text-xs")}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                Nama Sparepart / Consumable <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cx(inputBase, "w-full text-xs")}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                  Kategori
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={cx(inputBase, "w-full text-xs")}
                >
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                  Satuan Dasar
                </label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className={cx(inputBase, "w-full text-xs")}
                >
                  {units?.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.abbr})</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                Peruntukan Mesin
              </label>
              <input
                type="text"
                value={machine}
                onChange={(e) => setMachine(e.target.value)}
                placeholder="Contoh: Heidelberg SM74"
                className={cx(inputBase, "w-full text-xs")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                  Nomor Batch / Lot
                </label>
                <input
                  type="text"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  className={cx(inputBase, "w-full font-mono text-xs")}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                  Tanggal Kedaluwarsa
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className={cx(inputBase, "w-full text-xs")}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                  Safety Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={safetyStock}
                  onChange={(e) => setSafetyStock(Number(e.target.value))}
                  className={cx(inputBase, "w-full text-xs")}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                  Reorder Point (ROP)
                </label>
                <input
                  type="number"
                  min="0"
                  value={rop}
                  onChange={(e) => setRop(Number(e.target.value))}
                  className={cx(inputBase, "w-full text-xs")}
                />
              </div>
            </div>
          </div>
        </FormModal>
      </div>
    </DashboardLayout>
  );
}
