"use client";

import { useState } from "react";
import FormModal from "@/components/ui/FormModal";
import { inputBase } from "@/components/ui/styles";
import { stockService } from "@/services/inventoryService";
import type { Material, Product, Sparepart, StockItemKind, WarehouseId } from "@/types/inventory";
import { useWarehouses } from "@/hooks/useInventoryData";
import { formatNumber } from "@/lib/inventoryUtils";
import { IconArrowIn, IconArrowOut, IconTransfer, IconClipboardCheck } from "@/components/icons/Icons";

export type MutationType = "IN" | "OUT" | "TRANSFER" | "OPNAME";

interface StockMutationModalProps {
  open: boolean;
  onClose: () => void;
  type: MutationType;
  item: Material | Product | Sparepart | null;
  kind: StockItemKind;
  onSuccess?: () => void;
}

export default function StockMutationModal({
  open,
  onClose,
  type,
  item,
  kind,
  onSuccess,
}: StockMutationModalProps) {
  const warehouses = useWarehouses();
  const [warehouse, setWarehouse] = useState<WarehouseId>("g1");
  const [toWarehouse, setToWarehouse] = useState<WarehouseId>("g2");
  const [qty, setQty] = useState<string>("");
  const [physicalQty, setPhysicalQty] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [batchNo, setBatchNo] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!item) return null;

  const itemName = item.name;
  const itemCode = "sku" in item ? item.sku : item.code;
  const currentStockOrigin =
    item.stock[warehouse] ??
    (warehouse === "1" || warehouse === "g1" ? item.stock.g1 : warehouse === "2" || warehouse === "g2" ? item.stock.g2 : 0);

  const getTitleAndIcon = () => {
    switch (type) {
      case "IN":
        return {
          title: "Catat Barang Masuk",
          subtitle: `Penerimaan stok untuk ${itemCode} - ${itemName}`,
          icon: <IconArrowIn size={20} />,
          submitLabel: "Simpan Penerimaan",
        };
      case "OUT":
        return {
          title: "Catat Barang Keluar",
          subtitle: `Pengeluaran stok untuk ${itemCode} - ${itemName}`,
          icon: <IconArrowOut size={20} />,
          submitLabel: "Konfirmasi Pengeluaran",
        };
      case "TRANSFER":
        return {
          title: "Transfer Antar Gudang",
          subtitle: `Pemindahan stok untuk ${itemCode} - ${itemName}`,
          icon: <IconTransfer size={20} />,
          submitLabel: "Proses Transfer",
        };
      case "OPNAME":
        return {
          title: "Stock Opname Fisik",
          subtitle: `Penyesuaian stok fisik aktual untuk ${itemCode} - ${itemName}`,
          icon: <IconClipboardCheck size={20} />,
          submitLabel: "Simpan Penyesuaian",
        };
    }
  };

  const { title, subtitle, icon, submitLabel } = getTitleAndIcon();

  const handleSubmit = async () => {
    setError(null);
    const numQty = parseFloat(qty);
    const numPhysical = parseFloat(physicalQty);

    try {
      setPending(true);
      if (type === "OPNAME") {
        if (isNaN(numPhysical) || numPhysical < 0) {
          throw new Error("Stok fisik harus diisi dengan angka positif atau 0.");
        }
        await stockService.opname(kind, item.id, {
          warehouse,
          physicalQty: numPhysical,
          note: note.trim() || undefined,
        });
      } else if (type === "TRANSFER") {
        if (isNaN(numQty) || numQty <= 0) {
          throw new Error("Jumlah transfer harus lebih dari 0.");
        }
        if (warehouse === toWarehouse) {
          throw new Error("Gudang asal dan gudang tujuan tidak boleh sama.");
        }
        if (numQty > currentStockOrigin) {
          throw new Error(
            `Stok gudang asal tidak mencukupi (Tersedia: ${formatNumber(currentStockOrigin)}).`
          );
        }
        await stockService.transfer(kind, item.id, {
          from: warehouse,
          to: toWarehouse,
          qty: numQty,
          note: note.trim() || undefined,
        });
      } else if (type === "OUT") {
        if (isNaN(numQty) || numQty <= 0) {
          throw new Error("Jumlah pengeluaran harus lebih dari 0.");
        }
        if (numQty > currentStockOrigin) {
          throw new Error(
            `Stok di gudang tidak mencukupi (Tersedia: ${formatNumber(currentStockOrigin)}).`
          );
        }
        await stockService.stockOut(kind, item.id, {
          warehouse,
          qty: numQty,
          reference: reference.trim() || undefined,
          note: note.trim() || undefined,
        });
      } else {
        // IN
        if (isNaN(numQty) || numQty <= 0) {
          throw new Error("Jumlah penerimaan harus lebih dari 0.");
        }
        await stockService.stockIn(kind, item.id, {
          warehouse,
          qty: numQty,
          reference: reference.trim() || undefined,
          note: note.trim() || undefined,
          batchNo: batchNo.trim() || undefined,
          expiryDate: expiryDate || undefined,
        });
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memproses stok.");
    } finally {
      setPending(false);
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={icon}
      submitLabel={submitLabel}
      onSubmit={handleSubmit}
      pending={pending}
      error={error}
      size="md"
    >
      <div className="space-y-4">
        {/* Info Box Item */}
        <div className="p-3 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] flex justify-between items-center text-xs">
          <div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">Item Terpilih</div>
            <div className="font-bold text-[#1B2436] dark:text-[#E8ECF3]">{itemName}</div>
            <div className="text-[11px] font-mono text-[#2B5FC7] dark:text-[#3B6FE0]">{itemCode}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">Stok Saat Ini</div>
            <div className="font-bold text-[#1B2436] dark:text-[#E8ECF3]">
              G1: {formatNumber(item.stock.g1)} | G2: {formatNumber(item.stock.g2)}
            </div>
            <div className="text-[11px] text-[#059669] dark:text-[#34D399]">
              Total: {formatNumber(item.stock.g1 + item.stock.g2)}
            </div>
          </div>
        </div>

        {/* Warehouse Selection */}
        {type === "TRANSFER" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                Gudang Asal <span className="text-[#DC2626]">*</span>
              </label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value as WarehouseId)}
                className={inputBase}
              >
                {warehouses.map((w) => {
                  const s = item.stock[w.id] ?? (w.id === "1" || w.id === "g1" ? item.stock.g1 : w.id === "2" || w.id === "g2" ? item.stock.g2 : 0);
                  return (
                    <option key={w.id} value={w.id}>
                      {w.name} (Tersedia: {s})
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                Gudang Tujuan <span className="text-[#DC2626]">*</span>
              </label>
              <select
                value={toWarehouse}
                onChange={(e) => setToWarehouse(e.target.value as WarehouseId)}
                className={inputBase}
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
              Lokasi Gudang <span className="text-[#DC2626]">*</span>
            </label>
            <select
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value as WarehouseId)}
              className={inputBase}
            >
              {warehouses.map((w) => {
                const s = item.stock[w.id] ?? (w.id === "1" || w.id === "g1" ? item.stock.g1 : w.id === "2" || w.id === "g2" ? item.stock.g2 : 0);
                return (
                  <option key={w.id} value={w.id}>
                    {w.name} (Stok: {s})
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Qty Input */}
        {type === "OPNAME" ? (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                Hasil Hitung Fisik Aktual <span className="text-[#DC2626]">*</span>
              </label>
              <span className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                Stok Sistem: {formatNumber(currentStockOrigin)}
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="any"
              value={physicalQty}
              onChange={(e) => setPhysicalQty(e.target.value)}
              placeholder="Masukkan jumlah fisik aktual..."
              className={inputBase}
              required
            />
            {physicalQty !== "" && !isNaN(parseFloat(physicalQty)) && (
              <p
                className={`text-[11px] mt-1 ${
                  parseFloat(physicalQty) - currentStockOrigin >= 0
                    ? "text-[#059669] dark:text-[#34D399]"
                    : "text-[#DC2626] dark:text-[#F87171]"
                }`}
              >
                Selisih: {parseFloat(physicalQty) - currentStockOrigin > 0 ? "+" : ""}
                {formatNumber(parseFloat(physicalQty) - currentStockOrigin)} unit
              </p>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                Jumlah {type === "IN" ? "Masuk" : type === "OUT" ? "Keluar" : "Transfer"}{" "}
                <span className="text-[#DC2626]">*</span>
              </label>
              {(type === "OUT" || type === "TRANSFER") && (
                <span className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                  Maksimal: {formatNumber(currentStockOrigin)}
                </span>
              )}
            </div>
            <input
              type="number"
              min="1"
              step="any"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="Contoh: 10"
              className={inputBase}
              required
            />
          </div>
        )}

        {/* Extra inputs for IN */}
        {type === "IN" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                Nomor Batch / Lot
              </label>
              <input
                type="text"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                placeholder="Contoh: LOT-2026-X1"
                className={inputBase}
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
                className={inputBase}
              />
            </div>
          </div>
        )}

        {/* Reference */}
        {type !== "TRANSFER" && type !== "OPNAME" && (
          <div>
            <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
              Nomor Referensi (PO / SPK / DO)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Contoh: PO-2610-099"
              className={inputBase}
            />
          </div>
        )}

        {/* Note */}
        <div>
          <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
            Catatan Tambahan
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Keterangan peruntukan, kondisi barang, dll..."
            className={inputBase}
          />
        </div>
      </div>
    </FormModal>
  );
}
