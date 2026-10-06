"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { type Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import Drawer from "@/components/ui/Drawer";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
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
  formatDateTime,
  formatNumber,
  getStockStatus,
  STOCK_STATUS_LABEL,
  totalStock,
} from "@/lib/inventoryUtils";
import {
  IconArrowIn,
  IconArrowOut,
  IconClipboardCheck,
  IconEdit,
  IconEye,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconWrench,
} from "@/components/icons/Icons";

export default function SparepartsPage() {
  const { data: spareparts, loading, error, reload } = useSpareparts();
  const { data: categories } = useCategories("sparepart");
  const { data: suppliers } = useSuppliers();
  const { data: units } = useUnits();
  const warehouses = useWarehouses();

  // Filters
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>("all");

  // Modals & Drawers
  const [detailItem, setDetailItem] = useState<Sparepart | null>(null);
  const [editItem, setEditItem] = useState<Sparepart | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Sparepart | null>(null);

  // Mutation Modal
  const [mutationModal, setMutationModal] = useState<{
    open: boolean;
    type: MutationType;
    item: Sparepart | null;
  }>({ open: false, type: "IN", item: null });

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [machine, setMachine] = useState("");
  const [stockG1, setStockG1] = useState(0);
  const [stockG2, setStockG2] = useState(0);
  const [safetyStock, setSafetyStock] = useState(2);
  const [rop, setRop] = useState(5);
  const [supplierId, setSupplierId] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Detail movements
  const { data: movements } = useMovements("sparepart", detailItem?.id, 10);

  // Filtered dataset
  const filteredSpareparts = useMemo(() => {
    if (!spareparts) return [];
    return spareparts.filter((s) => {
      // Dynamic category filter (match ID or name)
      if (selectedCat !== "all") {
        const catObj = categories?.find((c) => c.id === selectedCat);
        const matchId = s.categoryId === selectedCat;
        const matchName =
          catObj &&
          (s.categoryId.toLowerCase().includes(catObj.name.toLowerCase().slice(0, 4)) ||
            catObj.name.toLowerCase().includes(s.categoryId.toLowerCase()));
        if (!matchId && !matchName) return false;
      }
      // Dynamic warehouse filter
      if (selectedWarehouse !== "all") {
        const wid = selectedWarehouse;
        const qty =
          (s.stock as any)[wid] ??
          (wid === "1" || wid === "g1" || wid === "WH-MAIN"
            ? s.stock.g1
            : wid === "2" || wid === "g2" || wid === "WH-RUKO"
            ? s.stock.g2
            : 0);
        if (qty <= 0) return false;
      }
      const total = totalStock(s.stock);
      const st = getStockStatus(total, s.rop);
      if (selectedStockStatus !== "all" && st !== selectedStockStatus) return false;
      return true;
    });
  }, [spareparts, selectedCat, selectedWarehouse, selectedStockStatus, categories]);

  const openAdd = () => {
    setCode("");
    setName("");
    setCategoryId(categories?.[0]?.id || "");
    setUnitId(units?.[0]?.id || "");
    setMachine("");
    setStockG1(0);
    setStockG2(0);
    setSafetyStock(2);
    setRop(5);
    setSupplierId(suppliers?.[0]?.id || "");
    setBatchNo("");
    setExpiryDate("");
    setFormError(null);
    setIsAddOpen(true);
  };

  const openEdit = (s: Sparepart) => {
    setEditItem(s);
    setCode(s.code);
    setName(s.name);
    setCategoryId(s.categoryId);
    setUnitId(s.unitId);
    setMachine(s.machine || "");
    setStockG1(s.stock.g1);
    setStockG2(s.stock.g2);
    setSafetyStock(s.safetyStock);
    setRop(s.rop);
    setSupplierId(s.supplierId);
    setBatchNo(s.batchNo || "");
    setExpiryDate(s.expiryDate || "");
    setFormError(null);
  };

  const handleSave = async () => {
    if (!code.trim() || !name.trim()) {
      setFormError("Kode Sparepart dan Nama wajib diisi.");
      return;
    }
    if (stockG1 < 0 || stockG2 < 0 || safetyStock < 0 || rop < 0) {
      setFormError("Stok, safety stock, dan ROP tidak boleh bernilai negatif.");
      return;
    }
    if (rop < safetyStock) {
      setFormError("Nilai ROP harus lebih besar atau sama dengan Safety Stock.");
      return;
    }

    setPending(true);
    setFormError(null);
    try {
      const payload: Omit<Sparepart, "id"> = {
        code: code.trim(),
        name: name.trim(),
        categoryId: categoryId || categories?.[0]?.id || "",
        unitId: unitId || units?.[0]?.id || "",
        machine: machine.trim() || undefined,
        stock: { g1: stockG1, g2: stockG2 },
        safetyStock,
        rop,
        supplierId: supplierId || suppliers?.[0]?.id || "",
        batchNo: batchNo.trim() || undefined,
        expiryDate: expiryDate || undefined,
      };

      if (editItem) {
        await sparepartService.update(editItem.id, payload);
        setEditItem(null);
      } else {
        await sparepartService.create(payload);
        setIsAddOpen(false);
      }
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan sparepart.");
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setPending(true);
    try {
      await sparepartService.remove(deleteItem.id);
      setDeleteItem(null);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus sparepart.");
    } finally {
      setPending(false);
    }
  };

  const columns: Column<Sparepart>[] = [
    {
      key: "code",
      header: "Kode",
      sortable: true,
      className: "font-mono font-medium text-[#2B5FC7] dark:text-[#93B4F5] whitespace-nowrap",
      render: (s) => s.code,
    },
    {
      key: "name",
      header: "Nama Sparepart & Mesin",
      sortable: true,
      render: (s) => (
        <div>
          <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{s.name}</div>
          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
            {s.machine ? `Mesin: ${s.machine}` : "Umum / Non-mesin"}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Kategori",
      render: (s) => categories?.find((c) => c.id === s.categoryId)?.name ?? "-",
    },
    {
      key: "machine",
      header: "Mesin Terkait",
      render: (s) =>
        s.machine ? (
          <span className="px-2 py-0.5 rounded text-[11px] bg-[#EFF4FE] text-[#2B5FC7] dark:bg-[#3B6FE0]/15 dark:text-[#93B4F5] border border-[#D6E3FC] dark:border-[#3B6FE0]/30">
            {s.machine}
          </span>
        ) : (
          <span className="text-[#6B7684] dark:text-[#8A94A6] text-[11px]">-</span>
        ),
    },
    {
      key: "unit",
      header: "Satuan",
      render: (s) => units?.find((u) => u.id === s.unitId)?.abbr ?? "-",
    },
    {
      key: "stock_g1",
      header: "G1",
      align: "right",
      sortable: true,
      sortValue: (s) => s.stock.g1,
      render: (s) => formatNumber(s.stock.g1),
    },
    {
      key: "stock_g2",
      header: "G2",
      align: "right",
      sortable: true,
      sortValue: (s) => s.stock.g2,
      render: (s) => formatNumber(s.stock.g2),
    },
    {
      key: "total_stock",
      header: "Total",
      align: "right",
      sortable: true,
      sortValue: (s) => totalStock(s.stock),
      render: (s) => <span className="font-bold">{formatNumber(totalStock(s.stock))}</span>,
    },
    {
      key: "rop",
      header: "ROP / Safety",
      align: "center",
      render: (s) => (
        <span className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
          {s.rop} / {s.safetyStock}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status Stok",
      align: "center",
      render: (s) => {
        const st = getStockStatus(totalStock(s.stock), s.rop);
        const tone = st === "below" ? "red" : st === "near" ? "yellow" : "green";
        return (
          <StatusBadge tone={tone} dot>
            {STOCK_STATUS_LABEL[st]}
          </StatusBadge>
        );
      },
    },
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      render: (s) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setDetailItem(s)}
            className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#2B5FC7] hover:bg-[#EFF4FE] dark:hover:bg-[#1B2A44] transition-colors"
            title="Detail & Riwayat Mutasi"
          >
            <IconEye size={16} />
          </button>
          <Can permission="inventory.spareparts.edit">
            <button
              type="button"
              onClick={() => openEdit(s)}
              className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#2B5FC7] hover:bg-[#EFF4FE] dark:hover:bg-[#1B2A44] transition-colors"
              title="Edit Sparepart"
            >
              <IconEdit size={16} />
            </button>
          </Can>
          <Can permission="inventory.spareparts.delete">
            <button
              type="button"
              onClick={() => setDeleteItem(s)}
              className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#7F1D1D]/30 transition-colors"
              title="Hapus Sparepart"
            >
              <IconTrash size={16} />
            </button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Inventori Sparepart">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          eyebrow="Inventori Gudang"
          title="Sparepart & Consumable Mesin"
          subtitle="Pemeliharaan suku cadang mesin offset, pisau potong, oli, blanket, dan perlengkapan produksi"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Can permission="inventory.spareparts.in">
                <button
                  type="button"
                  onClick={() =>
                    setMutationModal({
                      open: true,
                      type: "IN",
                      item: spareparts?.[0] || null,
                    })
                  }
                  className={btn.outline}
                >
                  <IconArrowIn size={14} />
                  <span>Barang Masuk</span>
                </button>
              </Can>
              <Can permission="inventory.spareparts.create">
                <button type="button" onClick={openAdd} className={btn.primary}>
                  <IconPlus size={14} strokeWidth={2.5} />
                  <span>Tambah Sparepart</span>
                </button>
              </Can>
            </div>
          }
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className={cx(inputBase, "w-48 text-xs h-9")}
            >
              <option value="all">Semua Kategori</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className={cx(inputBase, "w-40 text-xs h-9")}
            >
              <option value="all">Semua Gudang</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  Ada di {w.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStockStatus}
              onChange={(e) => setSelectedStockStatus(e.target.value)}
              className={cx(inputBase, "w-40 text-xs h-9")}
            >
              <option value="all">Semua Status ROP</option>
              <option value="below">Di Bawah ROP</option>
              <option value="near">Mendekati ROP</option>
              <option value="safe">Aman</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredSpareparts}
          keyExtractor={(s) => s.id}
          loading={loading}
          error={error}
          onRetry={reload}
          searchPlaceholder="Cari sparepart, kode, mesin..."
          searchFilter={(s, q) =>
            s.name.toLowerCase().includes(q) ||
            s.code.toLowerCase().includes(q) ||
            Boolean(s.machine && s.machine.toLowerCase().includes(q))
          }
          defaultSort={{ key: "code", direction: "asc" }}
          onRowClick={(s) => setDetailItem(s)}
          emptyTitle="Belum Ada Sparepart"
          emptySubtitle="Belum ada data sparepart yang sesuai dengan filter atau kata kunci."
        />

        {/* Drawer Detail */}
        <Drawer
          open={!!detailItem}
          onClose={() => setDetailItem(null)}
          title={detailItem?.name || "Detail Sparepart"}
          subtitle={`Kode: ${detailItem?.code} ${detailItem?.machine ? `· Mesin: ${detailItem.machine}` : ""}`}
          width="md"
          footer={
            detailItem && (
              <div className="flex flex-wrap gap-2 w-full justify-between items-center">
                <div className="flex gap-2">
                  <Can permission="inventory.spareparts.in">
                    <button
                      type="button"
                      onClick={() => setMutationModal({ open: true, type: "IN", item: detailItem })}
                      className={btn.outline}
                    >
                      <IconArrowIn size={14} />
                      <span>Masuk</span>
                    </button>
                  </Can>
                  <Can permission="inventory.spareparts.out">
                    <button
                      type="button"
                      onClick={() => setMutationModal({ open: true, type: "OUT", item: detailItem })}
                      className={btn.outline}
                    >
                      <IconArrowOut size={14} />
                      <span>Keluar</span>
                    </button>
                  </Can>
                </div>
                <div className="flex gap-2">
                  <Can permission="inventory.spareparts.transfer">
                    <button
                      type="button"
                      onClick={() => setMutationModal({ open: true, type: "TRANSFER", item: detailItem })}
                      className={btn.primary}
                    >
                      <IconRefresh size={14} />
                      <span>Transfer</span>
                    </button>
                  </Can>
                  <Can permission="inventory.spareparts.opname">
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
              {/* Stok Gudang */}
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

              {/* Detail Atribut */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7684] dark:text-[#8A94A6] mb-2">
                  Spesifikasi Teknis
                </h4>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <dt className="text-[#6B7684] dark:text-[#8A94A6]">Peruntukan Mesin</dt>
                    <dd className="font-medium mt-0.5">{detailItem.machine || "Umum / Bersama"}</dd>
                  </div>
                  <div>
                    <dt className="text-[#6B7684] dark:text-[#8A94A6]">Kategori</dt>
                    <dd className="font-medium mt-0.5">
                      {categories?.find((c) => c.id === detailItem.categoryId)?.name ?? "-"}
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
                  {detailItem.supplierId && (
                    <div className="col-span-2">
                      <dt className="text-[#6B7684] dark:text-[#8A94A6]">Supplier</dt>
                      <dd className="font-medium mt-0.5">
                        {suppliers?.find((s) => s.id === detailItem.supplierId)?.name ?? "-"}
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
                                  : "bg-[#EFF4FE] text-[#2B5FC7] dark:bg-[#1D4ED8]/25 dark:text-[#93C5FD]"
                              }`}
                            >
                              {m.type}
                            </span>
                            <span>{m.qty > 0 ? `+${m.qty}` : m.qty} unit</span>
                          </div>
                          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                            {m.note || m.reference || "Tanpa catatan"} · {m.user}
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
                    Belum ada riwayat mutasi untuk sparepart ini.
                  </p>
                )}
              </div>
            </div>
          )}
        </Drawer>

        {/* Modal Tambah / Edit Sparepart */}
        <FormModal
          open={isAddOpen || !!editItem}
          onClose={() => {
            setIsAddOpen(false);
            setEditItem(null);
          }}
          title={editItem ? "Edit Data Sparepart" : "Tambah Sparepart Baru"}
          subtitle="Masukkan data suku cadang, mesin terkait, dan ambang batas stok"
          icon={<IconWrench size={20} />}
          onSubmit={handleSave}
          submitLabel={editItem ? "Simpan Perubahan" : "Tambah Sparepart"}
          pending={pending}
          error={formError}
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Kode Sparepart <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Contoh: SP-BLK-SM74"
                  className={inputBase}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Nama Sparepart <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Blanket Offset SM74"
                  className={inputBase}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <label className="block text-xs font-semibold mb-1">Satuan Dasar</label>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Peruntukan Mesin (Opsional)</label>
                <input
                  type="text"
                  value={machine}
                  onChange={(e) => setMachine(e.target.value)}
                  placeholder="Contoh: Heidelberg SM74, Polar 115"
                  className={inputBase}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Supplier</label>
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
                    Safety Stock <span className="text-[#DC2626]">*</span>
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

        {/* Modal Mutasi Stok */}
        <StockMutationModal
          open={mutationModal.open}
          onClose={() => setMutationModal((m) => ({ ...m, open: false }))}
          type={mutationModal.type}
          item={mutationModal.item}
          kind="sparepart"
          onSuccess={reload}
        />

        {/* Dialog Hapus */}
        <ConfirmDialog
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleDelete}
          title="Hapus Sparepart"
          message={
            <span>
              Apakah Anda yakin ingin menghapus sparepart <strong>{deleteItem?.name}</strong> (
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
