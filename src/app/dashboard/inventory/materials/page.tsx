"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { type Column } from "@/components/ui/DataTable";
import FilterChips from "@/components/ui/FilterChips";
import StatusBadge from "@/components/ui/StatusBadge";
import Drawer from "@/components/ui/Drawer";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StockMutationModal, { type MutationType } from "@/components/inventory/StockMutationModal";
import Can from "@/components/auth/Can";
import { btn, cx, inputBase } from "@/components/ui/styles";
import {
  useBrands,
  useCategories,
  useMaterials,
  useMovements,
  useSuppliers,
  useUnits,
  useWarehouses,
} from "@/hooks/useInventoryData";
import { materialService } from "@/services/inventoryService";
import type { BrandName, Material } from "@/types/inventory";
import {
  formatDate,
  formatDateTime,
  formatNumber,
  getExpiryStatus,
  getStockStatus,
  STOCK_STATUS_LABEL,
  totalStock,
} from "@/lib/inventoryUtils";
import {
  IconAlertTriangle,
  IconArrowIn,
  IconArrowOut,
  IconCalendar,
  IconClipboardCheck,
  IconEdit,
  IconEye,
  IconLayers,
  IconPlus,
  IconRefresh,
  IconTrash,
} from "@/components/icons/Icons";

function MaterialsContent() {
  const searchParams = useSearchParams();
  const { data: materials, loading, error, reload } = useMaterials();
  const { data: categories } = useCategories("material");
  const { data: suppliers } = useSuppliers();
  const { data: units } = useUnits();
  const brands = useBrands();
  const warehouses = useWarehouses();

  // Filters
  const [selectedBrand, setSelectedBrand] = useState<string>("Semua");
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>(() =>
    searchParams.get("status") === "below" ? "below" : "all"
  );
  const [filterExpiringOnly, setFilterExpiringOnly] = useState<boolean>(
    () => searchParams.get("filter") === "expiring"
  );

  // Modals & Drawers
  const [detailItem, setDetailItem] = useState<Material | null>(null);
  const [editItem, setEditItem] = useState<Material | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Material | null>(null);

  // Mutation Modal
  const [mutationModal, setMutationModal] = useState<{
    open: boolean;
    type: MutationType;
    item: Material | null;
  }>({ open: false, type: "IN", item: null });

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<BrandName[]>([]);
  const [unitId, setUnitId] = useState("");
  const [stockG1, setStockG1] = useState(0);
  const [stockG2, setStockG2] = useState(0);
  const [safetyStock, setSafetyStock] = useState(20);
  const [rop, setRop] = useState(40);
  const [supplierId, setSupplierId] = useState("");
  const [gramature, setGramature] = useState<string>("");
  const [dimension, setDimension] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Detail movements
  const { data: movements } = useMovements("material", detailItem?.id, 10);

  // Check URL query parameters for action or item detail
  useEffect(() => {
    const idParam = searchParams.get("id");
    const actionParam = searchParams.get("action");

    if (materials && materials.length > 0) {
      if (idParam) {
        const match = materials.find((m) => m.id === idParam);
        if (match) {
          queueMicrotask(() => setDetailItem(match));
        }
      } else if (actionParam) {
        if (actionParam === "stock_in") {
          queueMicrotask(() =>
            setMutationModal({ open: true, type: "IN", item: materials[0] })
          );
        } else if (actionParam === "transfer") {
          queueMicrotask(() =>
            setMutationModal({ open: true, type: "TRANSFER", item: materials[0] })
          );
        }
      }
    }
  }, [searchParams, materials]);

  // Filtered dataset
  const filteredMaterials = useMemo(() => {
    if (!materials) return [];
    return materials.filter((m) => {
      // Brand filter (pencocokan nama dinamis dari Master Brand)
      if (selectedBrand !== "Semua") {
        if (
          m.brands.length > 0 &&
          !m.brands.some((b) => b.toLowerCase() === selectedBrand.toLowerCase())
        ) {
          return false;
        }
      }
      // Category filter (pencocokan dinamis ID atau Nama Kategori)
      if (selectedCat !== "all") {
        const catObj = categories?.find((c) => c.id === selectedCat);
        const matchId = m.categoryId === selectedCat;
        const matchName =
          catObj &&
          (m.categoryId.toLowerCase().includes(catObj.name.toLowerCase().slice(0, 4)) ||
            catObj.name.toLowerCase().includes(m.categoryId.toLowerCase()));
        if (!matchId && !matchName) return false;
      }
      // Warehouse filter (mendukung ID dinamis maupun kode gudang)
      if (selectedWarehouse !== "all") {
        const wid = selectedWarehouse;
        const qty =
          (m.stock as any)[wid] ??
          (wid === "1" || wid === "g1" || wid === "WH-MAIN"
            ? m.stock.g1
            : wid === "2" || wid === "g2" || wid === "WH-RUKO"
            ? m.stock.g2
            : 0);
        if (qty <= 0) return false;
      }
      // Stock Status filter
      const total = totalStock(m.stock);
      const st = getStockStatus(total, m.rop);
      if (selectedStockStatus !== "all" && st !== selectedStockStatus) return false;
      // Expiring filter
      if (filterExpiringOnly) {
        const expStatus = getExpiryStatus(m.expiryDate);
        if (expStatus !== "soon" && expStatus !== "expired") return false;
      }
      return true;
    });
  }, [materials, selectedBrand, selectedCat, selectedWarehouse, selectedStockStatus, filterExpiringOnly, categories]);

  const openAdd = () => {
    setCode("");
    setName("");
    setCategoryId(categories?.[0]?.id || "");
    setSelectedBrands([]);
    setUnitId(units?.[0]?.id || "");
    setStockG1(0);
    setStockG2(0);
    setSafetyStock(15);
    setRop(30);
    setSupplierId(suppliers?.[0]?.id || "");
    setGramature("");
    setDimension("");
    setBatchNo("");
    setExpiryDate("");
    setFormError(null);
    setIsAddOpen(true);
  };

  const openEdit = (m: Material) => {
    setEditItem(m);
    setCode(m.code);
    setName(m.name);
    setCategoryId(m.categoryId);
    setSelectedBrands(m.brands);
    setUnitId(m.unitId);
    setStockG1(m.stock.g1);
    setStockG2(m.stock.g2);
    setSafetyStock(m.safetyStock);
    setRop(m.rop);
    setSupplierId(m.supplierId);
    setGramature(m.gramature ? String(m.gramature) : "");
    setDimension(m.dimension || "");
    setBatchNo(m.batchNo || "");
    setExpiryDate(m.expiryDate || "");
    setFormError(null);
  };

  const handleSave = async () => {
    if (!code.trim() || !name.trim()) {
      setFormError("Kode Bahan dan Nama Bahan wajib diisi.");
      return;
    }
    if (stockG1 < 0 || stockG2 < 0 || safetyStock < 0 || rop < 0) {
      setFormError("Stok, safety stock, dan ROP tidak boleh bernilai negatif.");
      return;
    }
    if (rop < safetyStock) {
      setFormError("Nilai ROP (Reorder Point) harus lebih besar atau sama dengan Safety Stock.");
      return;
    }

    setPending(true);
    setFormError(null);
    try {
      const payload: Omit<Material, "id"> = {
        code: code.trim(),
        name: name.trim(),
        categoryId: categoryId || categories?.[0]?.id || "",
        brands: selectedBrands,
        unitId: unitId || units?.[0]?.id || "",
        stock: { g1: stockG1, g2: stockG2 },
        safetyStock,
        rop,
        supplierId: supplierId || suppliers?.[0]?.id || "",
        gramature: gramature ? parseInt(gramature) : undefined,
        dimension: dimension.trim() || undefined,
        batchNo: batchNo.trim() || undefined,
        expiryDate: expiryDate || undefined,
      };

      if (editItem) {
        await materialService.update(editItem.id, payload);
        setEditItem(null);
      } else {
        await materialService.create(payload);
        setIsAddOpen(false);
      }
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan bahan baku.");
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setPending(true);
    try {
      await materialService.remove(deleteItem.id);
      setDeleteItem(null);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus bahan.");
    } finally {
      setPending(false);
    }
  };

  const columns: Column<Material>[] = [
    {
      key: "code",
      header: "Kode Bahan",
      sortable: true,
      className: "font-mono font-medium text-[#2B5FC7] dark:text-[#93B4F5] whitespace-nowrap",
      render: (m) => m.code,
    },
    {
      key: "name",
      header: "Nama Bahan & Spesifikasi",
      sortable: true,
      render: (m) => {
        const expStatus = getExpiryStatus(m.expiryDate);
        return (
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
              <span>{m.name}</span>
              {expStatus === "soon" && (
                <span
                  title={`Mendekati kedaluwarsa (${formatDate(m.expiryDate!)})`}
                  className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] dark:bg-[#7F1D1D]/40 dark:text-[#FCA5A5] flex items-center gap-1"
                >
                  <IconCalendar size={11} /> Exp
                </span>
              )}
              {expStatus === "expired" && (
                <span
                  title="Sudah Kedaluwarsa!"
                  className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#7F1D1D] text-white flex items-center gap-1"
                >
                  Expired
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] flex items-center gap-2 mt-0.5">
              {m.gramature && <span>{m.gramature} gsm</span>}
              {m.dimension && <span>{m.dimension}</span>}
              {m.batchNo && <span className="font-mono">{m.batchNo}</span>}
            </div>
          </div>
        );
      },
    },
    {
      key: "category",
      header: "Kategori",
      render: (m) => categories?.find((c) => c.id === m.categoryId)?.name ?? "-",
    },
    {
      key: "brands",
      header: "Brand Terkait",
      render: (m) => (
        <div className="flex flex-wrap gap-1">
          {m.brands.length === 0 ? (
            <span className="text-[10px] text-[#6B7684] dark:text-[#8A94A6] italic">Semua</span>
          ) : (
            m.brands.map((b) => (
              <span
                key={b}
                className="px-1.5 py-0.2 rounded text-[10px] bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]"
              >
                {b}
              </span>
            ))
          )}
        </div>
      ),
    },
    {
      key: "unit",
      header: "Satuan",
      render: (m) => units?.find((u) => u.id === m.unitId)?.abbr ?? "-",
    },
    {
      key: "stock_g1",
      header: "G1",
      align: "right",
      sortable: true,
      sortValue: (m) => m.stock.g1,
      render: (m) => formatNumber(m.stock.g1),
    },
    {
      key: "stock_g2",
      header: "G2",
      align: "right",
      sortable: true,
      sortValue: (m) => m.stock.g2,
      render: (m) => formatNumber(m.stock.g2),
    },
    {
      key: "total_stock",
      header: "Total",
      align: "right",
      sortable: true,
      sortValue: (m) => totalStock(m.stock),
      render: (m) => <span className="font-bold">{formatNumber(totalStock(m.stock))}</span>,
    },
    {
      key: "rop",
      header: "ROP / Safety",
      align: "center",
      render: (m) => (
        <span className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
          {m.rop} / {m.safetyStock}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status Stok",
      align: "center",
      render: (m) => {
        const st = getStockStatus(totalStock(m.stock), m.rop);
        const tone = st === "below" ? "red" : st === "near" ? "yellow" : "green";
        return (
          <StatusBadge tone={tone} dot>
            {STOCK_STATUS_LABEL[st]}
          </StatusBadge>
        );
      },
    },
    {
      key: "supplier",
      header: "Supplier Utama",
      render: (m) => suppliers?.find((s) => s.id === m.supplierId)?.name ?? "-",
    },
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      render: (m) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setDetailItem(m)}
            className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#2B5FC7] hover:bg-[#EFF4FE] dark:hover:bg-[#1B2A44] transition-colors"
            title="Detail & Riwayat Mutasi"
          >
            <IconEye size={16} />
          </button>
          <Can permission="inventory.materials.edit">
            <button
              type="button"
              onClick={() => openEdit(m)}
              className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#2B5FC7] hover:bg-[#EFF4FE] dark:hover:bg-[#1B2A44] transition-colors"
              title="Edit Data Bahan"
            >
              <IconEdit size={16} />
            </button>
          </Can>
          <Can permission="inventory.materials.delete">
            <button
              type="button"
              onClick={() => setDeleteItem(m)}
              className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#7F1D1D]/30 transition-colors"
              title="Hapus Bahan"
            >
              <IconTrash size={16} />
            </button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Inventori Bahan Baku">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          eyebrow="Inventori Gudang"
          title="Bahan Baku & Material Produksi"
          subtitle="Pemantauan stok kertas, board, tinta, lem, dan bahan sensitif dengan peringatan ROP & kedaluwarsa"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Can permission="inventory.materials.transfer">
                <button
                  type="button"
                  onClick={() =>
                    setMutationModal({
                      open: true,
                      type: "TRANSFER",
                      item: materials?.[0] || null,
                    })
                  }
                  className={btn.outline}
                >
                  <IconRefresh size={14} />
                  <span>Transfer Stok</span>
                </button>
              </Can>
              <Can permission="inventory.materials.in">
                <button
                  type="button"
                  onClick={() =>
                    setMutationModal({
                      open: true,
                      type: "IN",
                      item: materials?.[0] || null,
                    })
                  }
                  className={btn.primary}
                >
                  <IconArrowIn size={14} />
                  <span>Barang Masuk</span>
                </button>
              </Can>
              <Can permission="inventory.materials.create">
                <button type="button" onClick={openAdd} className={btn.primary}>
                  <IconPlus size={14} strokeWidth={2.5} />
                  <span>Tambah Bahan</span>
                </button>
              </Can>
            </div>
          }
        />

        {/* Filters Toolbar Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm space-y-3">
          {/* Baris 1: Filter Brand (Lega & Scrollbar tersembunyi) */}
          <div className="flex items-center justify-between gap-2 overflow-hidden">
            <FilterChips
              options={["Semua", ...brands]}
              value={selectedBrand}
              onChange={setSelectedBrand}
              label="Brand"
            />
          </div>

          {/* Baris 2: Dropdown Filters & Status Toggle */}
          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60">
            <div className="flex-1 min-w-[160px] sm:max-w-[200px]">
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className={cx(inputBase, "w-full text-xs h-9")}
                aria-label="Filter Kategori"
              >
                <option value="all">Semua Kategori</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[140px] sm:max-w-[180px]">
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className={cx(inputBase, "w-full text-xs h-9")}
                aria-label="Filter Gudang"
              >
                <option value="all">Semua Gudang</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[150px] sm:max-w-[180px]">
              <select
                value={selectedStockStatus}
                onChange={(e) => setSelectedStockStatus(e.target.value)}
                className={cx(inputBase, "w-full text-xs h-9")}
                aria-label="Filter Status ROP"
              >
                <option value="all">Semua Status ROP</option>
                <option value="below">Di Bawah ROP</option>
                <option value="near">Mendekati ROP</option>
                <option value="safe">Aman</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setFilterExpiringOnly((v) => !v)}
              className={`px-3 py-1.5 h-9 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                filterExpiringOnly
                  ? "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B] dark:bg-[#7F1D1D]/30 dark:border-[#991B1B]/60 dark:text-[#FCA5A5] ring-2 ring-rose-500/20"
                  : "bg-[#F4F6FA] dark:bg-[#1B2A44] border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6] hover:text-[#1B2436] dark:hover:text-white"
              }`}
            >
              <IconAlertTriangle size={13} className={filterExpiringOnly ? "text-rose-600 dark:text-rose-400" : ""} />
              <span>Hampir Expired</span>
            </button>

            {/* Reset Filter Button */}
            {(selectedBrand !== "Semua" || selectedCat !== "all" || selectedWarehouse !== "all" || selectedStockStatus !== "all" || filterExpiringOnly) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand("Semua");
                  setSelectedCat("all");
                  setSelectedWarehouse("all");
                  setSelectedStockStatus("all");
                  setFilterExpiringOnly(false);
                }}
                className="text-xs text-[#2B5FC7] dark:text-[#3B6FE0] hover:underline px-2 py-1.5 whitespace-nowrap font-medium"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredMaterials}
          keyExtractor={(m) => m.id}
          loading={loading}
          error={error}
          onRetry={reload}
          searchPlaceholder="Cari kode bahan, nama, nomor batch..."
          searchFilter={(m, q) =>
            m.name.toLowerCase().includes(q) ||
            m.code.toLowerCase().includes(q) ||
            Boolean(m.batchNo && m.batchNo.toLowerCase().includes(q))
          }
          defaultSort={{ key: "code", direction: "asc" }}
          onRowClick={(m) => setDetailItem(m)}
          emptyTitle="Belum Ada Bahan Baku"
          emptySubtitle="Belum ada data bahan baku yang sesuai dengan kriteria filter."
        />

        {/* Drawer Detail */}
        <Drawer
          open={!!detailItem}
          onClose={() => setDetailItem(null)}
          title={detailItem?.name || "Detail Bahan Baku"}
          subtitle={`Kode: ${detailItem?.code} · Satuan: ${units?.find((u) => u.id === detailItem?.unitId)?.name}`}
          width="lg"
          footer={
            detailItem && (
              <div className="flex flex-wrap gap-2 w-full justify-between items-center">
                <div className="flex gap-2">
                  <Can permission="inventory.materials.in">
                    <button
                      type="button"
                      onClick={() => setMutationModal({ open: true, type: "IN", item: detailItem })}
                      className={btn.outline}
                    >
                      <IconArrowIn size={14} />
                      <span>Barang Masuk</span>
                    </button>
                  </Can>
                  <Can permission="inventory.materials.out">
                    <button
                      type="button"
                      onClick={() => setMutationModal({ open: true, type: "OUT", item: detailItem })}
                      className={btn.outline}
                    >
                      <IconArrowOut size={14} />
                      <span>Barang Keluar</span>
                    </button>
                  </Can>
                </div>
                <div className="flex gap-2">
                  <Can permission="inventory.materials.transfer">
                    <button
                      type="button"
                      onClick={() => setMutationModal({ open: true, type: "TRANSFER", item: detailItem })}
                      className={btn.primary}
                    >
                      <IconRefresh size={14} />
                      <span>Transfer</span>
                    </button>
                  </Can>
                  <Can permission="inventory.materials.opname">
                    <button
                      type="button"
                      onClick={() => setMutationModal({ open: true, type: "OPNAME", item: detailItem })}
                      className={btn.ghost}
                    >
                      <IconClipboardCheck size={14} />
                      <span>Opname</span>
                    </button>
                  </Can>
                </div>
              </div>
            )
          }
        >
          {detailItem && (
            <div className="space-y-6">
              {/* Status ROP Banner */}
              {(() => {
                const total = totalStock(detailItem.stock);
                const st = getStockStatus(total, detailItem.rop);
                if (st === "below") {
                  return (
                    <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] dark:bg-[#7F1D1D]/30 dark:border-[#991B1B]/60 text-xs flex items-start gap-2.5">
                      <IconAlertTriangle size={18} className="text-[#991B1B] dark:text-[#F87171] flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-[#991B1B] dark:text-[#FCA5A5]">Stok Berada di Bawah ROP!</div>
                        <div className="text-[#7F1D1D] dark:text-[#FECACA] mt-0.5">
                          Total stok saat ini ({formatNumber(total)}) lebih kecil dari Reorder Point ({detailItem.rop}).
                          Segera buat Purchase Order (PO) ke supplier <strong>{suppliers?.find((s) => s.id === detailItem.supplierId)?.name}</strong>.
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Rincian Stok Multi-Gudang */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7684] dark:text-[#8A94A6] mb-3">
                  Rincian Stok Multi-Gudang
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {warehouses.map((w) => (
                    <div
                      key={w.id}
                      className="p-3 rounded-xl border border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA] dark:bg-[#1B2A44]"
                    >
                      <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">{w.name}</div>
                      <div className="text-xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mt-1">
                        {formatNumber(detailItem.stock[w.id])}{" "}
                        <span className="text-xs font-normal text-[#6B7684]">
                          {units?.find((u) => u.id === detailItem.unitId)?.abbr}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 rounded-lg border border-[#D6E3FC] dark:border-[#26334D] bg-[#EFF4FE] dark:bg-[#1D4ED8]/15 flex justify-between items-center text-xs">
                  <span className="text-[#2B5FC7] dark:text-[#93B4F5] font-medium">Total Stok Seluruh Gudang:</span>
                  <span className="font-bold text-sm text-[#2B5FC7] dark:text-[#93B4F5]">
                    {formatNumber(totalStock(detailItem.stock))}{" "}
                    {units?.find((u) => u.id === detailItem.unitId)?.abbr}
                  </span>
                </div>
              </div>

              {/* Parameter & Spesifikasi Bahan */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7684] dark:text-[#8A94A6] mb-2">
                  Spesifikasi & Parameter
                </h4>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                  <div>
                    <dt className="text-[#6B7684] dark:text-[#8A94A6]">Kategori</dt>
                    <dd className="font-medium mt-0.5">
                      {categories?.find((c) => c.id === detailItem.categoryId)?.name ?? "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#6B7684] dark:text-[#8A94A6]">Supplier Utama</dt>
                    <dd className="font-medium mt-0.5">
                      {suppliers?.find((s) => s.id === detailItem.supplierId)?.name ?? "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#6B7684] dark:text-[#8A94A6]">Reorder Point (ROP)</dt>
                    <dd className="font-medium mt-0.5">{detailItem.rop} {units?.find((u) => u.id === detailItem.unitId)?.abbr}</dd>
                  </div>
                  <div>
                    <dt className="text-[#6B7684] dark:text-[#8A94A6]">Safety Stock</dt>
                    <dd className="font-medium mt-0.5">{detailItem.safetyStock} {units?.find((u) => u.id === detailItem.unitId)?.abbr}</dd>
                  </div>
                  {detailItem.gramature && (
                    <div>
                      <dt className="text-[#6B7684] dark:text-[#8A94A6]">Gramatur Kertas</dt>
                      <dd className="font-medium mt-0.5">{detailItem.gramature} GSM</dd>
                    </div>
                  )}
                  {detailItem.dimension && (
                    <div>
                      <dt className="text-[#6B7684] dark:text-[#8A94A6]">Dimensi Potong / Plano</dt>
                      <dd className="font-medium mt-0.5">{detailItem.dimension}</dd>
                    </div>
                  )}
                  {detailItem.batchNo && (
                    <div>
                      <dt className="text-[#6B7684] dark:text-[#8A94A6]">Nomor Batch / Lot</dt>
                      <dd className="font-mono font-medium mt-0.5">{detailItem.batchNo}</dd>
                    </div>
                  )}
                  {detailItem.expiryDate && (
                    <div>
                      <dt className="text-[#6B7684] dark:text-[#8A94A6]">Kedaluwarsa</dt>
                      <dd className="font-medium mt-0.5 text-[#991B1B] dark:text-[#F87171]">
                        {formatDate(detailItem.expiryDate)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Riwayat Mutasi */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7684] dark:text-[#8A94A6] mb-2">
                  Riwayat Mutasi Terakhir
                </h4>
                {movements && movements.length > 0 ? (
                  <div className="space-y-2">
                    {movements.map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-xs flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-medium">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] ${
                                m.type === "IN"
                                  ? "bg-[#ECFDF5] text-[#065F46] dark:bg-[#064E3B]/30 dark:text-[#34D399]"
                                  : m.type === "OUT"
                                  ? "bg-[#FEF2F2] text-[#991B1B] dark:bg-[#7F1D1D]/30 dark:text-[#F87171]"
                                  : m.type === "TRANSFER"
                                  ? "bg-[#EFF4FE] text-[#2B5FC7] dark:bg-[#1D4ED8]/25 dark:text-[#93C5FD]"
                                  : "bg-[#FFFBEB] text-[#92400E] dark:bg-[#78350F]/30 dark:text-[#FBBF24]"
                              }`}
                            >
                              {m.type}
                            </span>
                            <span>{m.qty > 0 ? `+${m.qty}` : m.qty} {units?.find((u) => u.id === detailItem.unitId)?.abbr}</span>
                            <span className="text-[#6B7684] dark:text-[#8A94A6]">
                              ({warehouses.find((w) => w.id === m.warehouse)?.shortName}
                              {m.toWarehouse ? ` → ${warehouses.find((w) => w.id === m.toWarehouse)?.shortName}` : ""})
                            </span>
                          </div>
                          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                            {m.note || m.reference || "Tanpa keterangan"} · {m.user}
                          </div>
                        </div>
                        <div className="text-[10px] text-[#6B7684] dark:text-[#8A94A6] text-right">
                          {formatDateTime(m.date)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#6B7684] dark:text-[#8A94A6] italic py-2">
                    Belum ada riwayat mutasi untuk bahan ini.
                  </p>
                )}
              </div>
            </div>
          )}
        </Drawer>

        {/* Modal Tambah / Edit Bahan */}
        <FormModal
          open={isAddOpen || !!editItem}
          onClose={() => {
            setIsAddOpen(false);
            setEditItem(null);
          }}
          title={editItem ? "Edit Data Bahan Baku" : "Tambah Bahan Baku Baru"}
          subtitle="Masukkan data spesifikasi, ambang ROP, dan safety stock"
          icon={<IconLayers size={20} />}
          onSubmit={handleSave}
          submitLabel={editItem ? "Simpan Perubahan" : "Tambah Bahan"}
          pending={pending}
          error={formError}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Kode Bahan <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Contoh: BB-IVR-300"
                  className={inputBase}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Nama Bahan Baku <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Kertas Ivory 300gr"
                  className={inputBase}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Kategori</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={inputBase}
                >
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Satuan</label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className={inputBase}
                >
                  {units?.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.abbr})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Supplier Utama</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className={inputBase}
                >
                  {suppliers?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Spesifikasi Kertas / Kimia */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Gramatur (GSM)</label>
                <input
                  type="number"
                  min="0"
                  value={gramature}
                  onChange={(e) => setGramature(e.target.value)}
                  placeholder="300"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Dimensi / Ukuran</label>
                <input
                  type="text"
                  value={dimension}
                  onChange={(e) => setDimension(e.target.value)}
                  placeholder="79 x 109 cm"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Nomor Batch / Lot</label>
                <input
                  type="text"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  placeholder="LOT-2609-01"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Tgl Kedaluwarsa</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className={inputBase}
                />
              </div>
            </div>

            {/* Brand Terkait */}
            <div>
              <label className="block text-xs font-semibold mb-1">Brand Terkait (Multi-pilih)</label>
              <div className="flex flex-wrap gap-2">
                {brands.map((b) => {
                  const active = selectedBrands.includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setSelectedBrands((prev) =>
                          active ? prev.filter((x) => x !== b) : [...prev, b]
                        );
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                        active
                          ? "bg-[#2B5FC7] text-white border-[#2B5FC7] dark:bg-[#3B6FE0]"
                          : "bg-[#F4F6FA] dark:bg-[#1B2A44] border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6]"
                      }`}
                    >
                      {active ? `✓ ${b}` : b}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-1">
                * Kosongkan pilihan jika bahan baku ini dapat dipakai lintas semua brand.
              </p>
            </div>

            {/* Ambang Stok */}
            <div className="pt-2 border-t border-[#E2E6ED] dark:border-[#26334D]">
              <div className="text-xs font-semibold mb-2">Ambang Batas & Stok Awal</div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-[#6B7684] dark:text-[#8A94A6] mb-1">
                    Stok Gudang 1
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockG1}
                    onChange={(e) => setStockG1(parseInt(e.target.value) || 0)}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#6B7684] dark:text-[#8A94A6] mb-1">
                    Stok Gudang 2
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockG2}
                    onChange={(e) => setStockG2(parseInt(e.target.value) || 0)}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#6B7684] dark:text-[#8A94A6] mb-1">
                    Reorder Point (ROP) <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rop}
                    onChange={(e) => setRop(parseInt(e.target.value) || 0)}
                    className={inputBase}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#6B7684] dark:text-[#8A94A6] mb-1">
                    Safety Stock Minimal <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={safetyStock}
                    onChange={(e) => setSafetyStock(parseInt(e.target.value) || 0)}
                    className={inputBase}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </FormModal>

        {/* Modal Mutasi Stok (IN, OUT, TRANSFER, OPNAME) */}
        <StockMutationModal
          open={mutationModal.open}
          onClose={() => setMutationModal((m) => ({ ...m, open: false }))}
          type={mutationModal.type}
          item={mutationModal.item}
          kind="material"
          onSuccess={reload}
        />

        {/* Dialog Hapus */}
        <ConfirmDialog
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleDelete}
          title="Hapus Bahan Baku"
          message={
            <span>
              Apakah Anda yakin ingin menghapus bahan baku <strong>{deleteItem?.name}</strong> (
              {deleteItem?.code})?
            </span>
          }
          tone="danger"
          pending={pending}
        />
      </div>
    </DashboardLayout>
  );
}

export default function MaterialsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-[#8A94A6]">Memuat data bahan baku...</div>}>
      <MaterialsContent />
    </Suspense>
  );
}
