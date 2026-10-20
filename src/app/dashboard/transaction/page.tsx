"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { type Column } from "@/components/ui/DataTable";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import FormModal from "@/components/ui/FormModal";
import StockMutationModal, { type MutationType } from "@/components/inventory/StockMutationModal";
import Can from "@/components/auth/Can";
import { btn, cx, inputBase } from "@/components/ui/styles";
import { useMaterials, useProducts, useSpareparts, useWarehouses } from "@/hooks/useInventoryData";
import { stockService } from "@/services/inventoryService";
import type { Material, Product, Sparepart, StockItemKind, StockMovement, MovementType } from "@/types/inventory";
import { formatDateTime, formatNumber, getWarehouseStock } from "@/lib/inventoryUtils";
import {
  IconArrowIn,
  IconArrowOut,
  IconClipboardCheck,
  IconLayers,
  IconPackage,
  IconRefresh,
  IconSearch,
  IconTransfer,
  IconTruck,
  IconWrench,
  IconBox,
} from "@/components/icons/Icons";

function TransactionContent() {
  const searchParams = useSearchParams();
  const { data: materials } = useMaterials();
  const { data: spareparts } = useSpareparts();
  const { data: products } = useProducts();
  const warehouses = useWarehouses();

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedKind, setSelectedKind] = useState<string>("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mutation Modal State
  const [mutationModal, setMutationModal] = useState<{
    open: boolean;
    type: MutationType;
    item: Material | Product | Sparepart | null;
    kind: StockItemKind;
  }>({ open: false, type: "IN", item: null, kind: "material" });

  // Quick Action Item Selector Modal
  const [itemSelectorModal, setItemSelectorModal] = useState<{
    open: boolean;
    type: MutationType;
  }>({ open: false, type: "IN" });

  const [selectorKind, setSelectorKind] = useState<StockItemKind>("material");
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  const loadMovements = async () => {
    setLoading(true);
    try {
      const data = await stockService.movements();
      setMovements(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, []);

  // Check URL param for default action (?action=in|out|transfer|opname)
  useEffect(() => {
    const action = searchParams.get("action");
    if (action) {
      const upper = action.toUpperCase() as MutationType;
      if (["IN", "OUT", "TRANSFER", "OPNAME"].includes(upper)) {
        setItemSelectorModal({ open: true, type: upper });
      }
    }
  }, [searchParams]);

  // Available items for selector
  const availableItems = useMemo(() => {
    if (selectorKind === "material") return materials || [];
    if (selectorKind === "sparepart") return spareparts || [];
    return products || [];
  }, [selectorKind, materials, spareparts, products]);

  // Set default selected item when available items change
  useEffect(() => {
    if (availableItems.length > 0) {
      setSelectedItemId(availableItems[0].id);
    } else {
      setSelectedItemId("");
    }
  }, [availableItems]);

  const handleOpenSelector = (type: MutationType) => {
    setSelectorKind("material"); // Prioritas Bahan Baku default
    setItemSelectorModal({ open: true, type });
  };

  const handleConfirmItemSelection = () => {
    const item = availableItems.find((i) => i.id === selectedItemId) || null;
    setItemSelectorModal({ open: false, type: "IN" });
    if (item) {
      setMutationModal({
        open: true,
        type: itemSelectorModal.type,
        item,
        kind: selectorKind,
      });
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const inCount = movements.filter((m) => m.type === "IN").length;
    const outCount = movements.filter((m) => m.type === "OUT").length;
    const transferCount = movements.filter((m) => m.type === "TRANSFER").length;
    const opnameCount = movements.filter((m) => m.type === "OPNAME").length;
    return {
      total: movements.length,
      inCount,
      outCount,
      transferCount,
      opnameCount,
    };
  }, [movements]);

  // Filtered movements
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      if (selectedType !== "all" && m.type !== selectedType) return false;
      if (selectedKind !== "all" && m.itemKind !== selectedKind) return false;
      if (selectedWarehouse !== "all") {
        const wMatch =
          m.warehouse === selectedWarehouse ||
          m.toWarehouse === selectedWarehouse ||
          (selectedWarehouse === "g1" && (m.warehouse === "1" || m.toWarehouse === "1")) ||
          (selectedWarehouse === "g2" && (m.warehouse === "2" || m.toWarehouse === "2"));
        if (!wMatch) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          m.itemName.toLowerCase().includes(q) ||
          m.user.toLowerCase().includes(q) ||
          (m.reference && m.reference.toLowerCase().includes(q)) ||
          (m.note && m.note.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [movements, selectedType, selectedKind, selectedWarehouse, searchQuery]);

  const renderMovementBadge = (type: MovementType) => {
    switch (type) {
      case "IN":
        return <StatusBadge tone="green">Masuk (IN)</StatusBadge>;
      case "OUT":
        return <StatusBadge tone="red">Keluar (OUT)</StatusBadge>;
      case "TRANSFER":
        return <StatusBadge tone="blue">Transfer G1 ⇄ G2</StatusBadge>;
      case "OPNAME":
        return <StatusBadge tone="yellow">Stock Opname</StatusBadge>;
      default:
        return <StatusBadge tone="gray">{type}</StatusBadge>;
    }
  };

  const getWarehouseName = (wId?: string) => {
    if (!wId) return "-";
    if (wId === "g1" || wId === "1" || wId.toLowerCase().includes("utama")) return "Gudang 1 (Pabrik)";
    if (wId === "g2" || wId === "2" || wId.toLowerCase().includes("ruko")) return "Gudang 2 (Ruko)";
    return wId;
  };

  const columns: Column<StockMovement>[] = [
    {
      key: "date",
      header: "Waktu Transaksi",
      sortable: true,
      sortValue: (m) => m.date,
      render: (m) => (
        <div>
          <div className="font-medium text-[#1B2436] dark:text-[#E8ECF3]">
            {formatDateTime(m.date)}
          </div>
          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
            Oleh: {m.user}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Jenis Mutasi",
      render: (m) => renderMovementBadge(m.type),
    },
    {
      key: "item",
      header: "Item & Kategori",
      sortable: true,
      sortValue: (m) => m.itemName,
      render: (m) => {
        const isMat = m.itemKind === "material";
        return (
          <div>
            <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3] flex items-center gap-1.5">
              <span>{m.itemName}</span>
              {isMat && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#EFF4FE] text-[#2B5FC7] dark:bg-[#3B6FE0]/20 dark:text-[#93B4F5]">
                  Bahan Baku
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] capitalize">
              {m.itemKind === "material" ? "Material / Kertas" : m.itemKind === "sparepart" ? "Sparepart Mesin" : "Produk Jadi"}
            </div>
          </div>
        );
      },
    },
    {
      key: "warehouse",
      header: "Lokasi Fisik",
      render: (m) => {
        if (m.type === "TRANSFER") {
          return (
            <div className="text-xs">
              <span className="font-medium text-[#1B2436] dark:text-[#E8ECF3]">{getWarehouseName(m.warehouse)}</span>
              <span className="mx-1 text-[#2B5FC7] dark:text-[#3B6FE0]">➔</span>
              <span className="font-medium text-[#1B2436] dark:text-[#E8ECF3]">{getWarehouseName(m.toWarehouse)}</span>
            </div>
          );
        }
        return (
          <span className="text-xs text-[#1B2436] dark:text-[#E8ECF3]">
            {getWarehouseName(m.warehouse)}
          </span>
        );
      },
    },
    {
      key: "qty",
      header: "Kuantitas",
      align: "right",
      sortable: true,
      sortValue: (m) => m.qty,
      render: (m) => {
        const isPos = m.type === "IN" || (m.type === "OPNAME" && m.qty > 0);
        const isNeg = m.type === "OUT" || (m.type === "OPNAME" && m.qty < 0);
        return (
          <span
            className={`font-mono font-bold text-xs ${
              isPos
                ? "text-[#065F46] dark:text-[#34D399]"
                : isNeg
                ? "text-[#991B1B] dark:text-[#F87171]"
                : "text-[#2B5FC7] dark:text-[#3B6FE0]"
            }`}
          >
            {isPos ? `+${formatNumber(m.qty)}` : isNeg ? formatNumber(m.qty) : formatNumber(m.qty)}
          </span>
        );
      },
    },
    {
      key: "reference",
      header: "Referensi & Catatan",
      render: (m) => (
        <div className="max-w-xs">
          {m.reference ? (
            <div className="font-mono text-xs font-medium text-[#2B5FC7] dark:text-[#3B6FE0]">
              {m.reference}
            </div>
          ) : (
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] italic">-</div>
          )}
          {m.note && (
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] truncate">
              {m.note}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Mutasi & Riwayat Stok">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          eyebrow="Logistik & Mutasi Stok"
          title="Mutasi & Riwayat Stok Gudang"
          subtitle="Buku besar mutasi fisik barang masuk, barang keluar, transfer antar-gudang (G1 ⇄ G2), dan penyesuaian stock opname"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenSelector("IN")}
                className={btn.primary}
              >
                <IconArrowIn size={14} />
                <span>+ Catat Masuk</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenSelector("OUT")}
                className={btn.outline}
              >
                <IconArrowOut size={14} />
                <span>− Catat Keluar</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenSelector("TRANSFER")}
                className={btn.outline}
              >
                <IconTransfer size={14} />
                <span>⇄ Transfer Gudang</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenSelector("OPNAME")}
                className={btn.outline}
              >
                <IconClipboardCheck size={14} />
                <span>✓ Stock Opname</span>
              </button>
            </div>
          }
        />

        {/* KPI StatCards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Pergerakan Stok"
            value={`${stats.total} Mutasi`}
            desc="Buku besar aktif gudang"
            icon={<IconRefresh size={18} />}
          />
          <StatCard
            title="Penerimaan Masuk (IN)"
            value={`${stats.inCount} Transaksi`}
            desc="Dari PO Supplier"
            icon={<IconArrowIn size={18} />}
          />
          <StatCard
            title="Pengeluaran (OUT)"
            value={`${stats.outCount} Transaksi`}
            desc="Potongan SPK Produksi"
            icon={<IconArrowOut size={18} />}
          />
          <StatCard
            title="Transfer G1 ⇄ G2"
            value={`${stats.transferCount} Transfer`}
            desc="Pabrik ⇄ Ruko"
            icon={<IconTransfer size={18} />}
          />
        </div>

        {/* Filter Bar Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm space-y-3">
          {/* Tipe Mutasi Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[#E2E6ED]/60 dark:border-[#26334D]/60">
            <span className="text-xs font-semibold text-[#6B7684] dark:text-[#8A94A6] mr-2">
              Jenis:
            </span>
            {[
              { id: "all", label: "Semua Mutasi" },
              { id: "IN", label: "Barang Masuk (IN)" },
              { id: "OUT", label: "Barang Keluar (OUT)" },
              { id: "TRANSFER", label: "Transfer Antar Gudang" },
              { id: "OPNAME", label: "Stock Opname" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(t.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedType === t.id
                    ? "bg-[#2B5FC7] text-white dark:bg-[#3B6FE0]"
                    : "bg-[#F4F6FA] text-[#6B7684] hover:text-[#1B2436] dark:bg-[#1B2A44] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Secondary Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex-1 min-w-[200px] relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7684]">
                <IconSearch size={14} />
              </span>
              <input
                type="text"
                placeholder="Cari item, no. PO/SPK, PIC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cx(inputBase, "pl-9 text-xs h-9 w-full")}
              />
            </div>

            <div className="w-[180px]">
              <select
                value={selectedKind}
                onChange={(e) => setSelectedKind(e.target.value)}
                className={cx(inputBase, "w-full text-xs h-9")}
              >
                <option value="all">Semua Kategori Item</option>
                <option value="material">Bahan Baku (Prioritas)</option>
                <option value="sparepart">Sparepart Mesin</option>
                <option value="product">Produk Jadi</option>
              </select>
            </div>

            <div className="w-[160px]">
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className={cx(inputBase, "w-full text-xs h-9")}
              >
                <option value="all">Semua Gudang</option>
                <option value="g1">Gudang 1 (Pabrik)</option>
                <option value="g2">Gudang 2 (Ruko)</option>
              </select>
            </div>

            {(selectedType !== "all" || selectedKind !== "all" || selectedWarehouse !== "all" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedType("all");
                  setSelectedKind("all");
                  setSelectedWarehouse("all");
                  setSearchQuery("");
                }}
                className="text-xs text-[#2B5FC7] dark:text-[#3B6FE0] font-medium hover:underline px-2"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* DataTable Riwayat */}
        <DataTable<StockMovement>
          columns={columns}
          data={filteredMovements}
          keyExtractor={(m) => m.id}
          loading={loading}
          emptyTitle="Belum Ada Riwayat Mutasi"
          emptySubtitle="Belum ada transaksi pergerakan barang yang sesuai dengan filter yang dipilih."
        />

        {/* Modal Pemilih Item Cepat untuk Mutasi */}
        <FormModal
          open={itemSelectorModal.open}
          onClose={() => setItemSelectorModal({ open: false, type: "IN" })}
          title={`Pilih Item untuk ${
            itemSelectorModal.type === "IN"
              ? "Barang Masuk"
              : itemSelectorModal.type === "OUT"
              ? "Barang Keluar"
              : itemSelectorModal.type === "TRANSFER"
              ? "Transfer Gudang"
              : "Stock Opname"
          }`}
          subtitle="Tentukan kategori dan item fisik yang akan dicatat mutasinya"
          onSubmit={handleConfirmItemSelection}
          submitLabel="Lanjutkan Formulir Mutasi →"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1.5">
                Kategori Item (Bahan Baku adalah Prioritas Utama Gudang)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectorKind("material")}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    selectorKind === "material"
                      ? "border-[#2B5FC7] bg-[#EFF4FE] dark:bg-[#3B6FE0]/15 dark:border-[#3B6FE0]"
                      : "border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A]"
                  }`}
                >
                  <IconLayers size={16} className="text-[#2B5FC7] dark:text-[#3B6FE0]" />
                  <div>
                    <div className="text-xs font-bold text-[#1B2436] dark:text-[#E8ECF3]">Bahan Baku</div>
                    <div className="text-[10px] text-[#2B5FC7] font-semibold">Prioritas</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectorKind("sparepart")}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    selectorKind === "sparepart"
                      ? "border-[#2B5FC7] bg-[#EFF4FE] dark:bg-[#3B6FE0]/15 dark:border-[#3B6FE0]"
                      : "border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A]"
                  }`}
                >
                  <IconWrench size={16} className="text-[#2B5FC7] dark:text-[#3B6FE0]" />
                  <div>
                    <div className="text-xs font-bold text-[#1B2436] dark:text-[#E8ECF3]">Sparepart</div>
                    <div className="text-[10px] text-[#6B7684]">Suku Cadang</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectorKind("product")}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    selectorKind === "product"
                      ? "border-[#2B5FC7] bg-[#EFF4FE] dark:bg-[#3B6FE0]/15 dark:border-[#3B6FE0]"
                      : "border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A]"
                  }`}
                >
                  <IconBox size={16} className="text-[#2B5FC7] dark:text-[#3B6FE0]" />
                  <div>
                    <div className="text-xs font-bold text-[#1B2436] dark:text-[#E8ECF3]">Produk Jadi</div>
                    <div className="text-[10px] text-[#6B7684]">Barang Siap Kirim</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                Pilih Item Spesifik
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className={cx(inputBase, "w-full text-xs h-9")}
              >
                {availableItems.map((item: any) => {
                  const code = "sku" in item ? item.sku : item.code;
                  return (
                    <option key={item.id} value={item.id}>
                      {code} — {item.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </FormModal>

        {/* Modal Formulir Mutasi Terpadu */}
        <StockMutationModal
          open={mutationModal.open}
          onClose={() => setMutationModal((prev) => ({ ...prev, open: false }))}
          type={mutationModal.type}
          item={mutationModal.item}
          kind={mutationModal.kind}
          onSuccess={() => {
            loadMovements();
            setMutationModal((prev) => ({ ...prev, open: false }));
          }}
        />
      </div>
    </DashboardLayout>
  );
}

export default function TransactionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#2B5FC7] border-t-transparent animate-spin" />
        </div>
      }
    >
      <TransactionContent />
    </Suspense>
  );
}
