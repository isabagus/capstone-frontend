import type {
  ExpiryStatus,
  StockByWarehouse,
  StockStatus,
  WarehouseId,
} from "@/types/inventory";

/** Hari peringatan sebelum kedaluwarsa */
export const EXPIRY_WARNING_DAYS = 45;

/** Batas "mendekati ROP": stok ≤ ROP × 1.25 */
export const NEAR_ROP_FACTOR = 1.25;

export const WAREHOUSE_IDS: WarehouseId[] = ["g1", "g2"];

export function totalStock(stock: StockByWarehouse): number {
  return WAREHOUSE_IDS.reduce((sum, w) => sum + (stock[w] ?? 0), 0);
}

export function getStockStatus(total: number, rop: number): StockStatus {
  if (total < rop) return "below";
  if (total <= Math.ceil(rop * NEAR_ROP_FACTOR)) return "near";
  return "safe";
}

export const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  safe: "Aman",
  near: "Mendekati ROP",
  below: "Di Bawah ROP",
};

export function daysUntil(isoDate: string, now: Date = new Date()): number {
  const target = new Date(isoDate + "T00:00:00");
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function getExpiryStatus(isoDate?: string): ExpiryStatus {
  if (!isoDate) return "none";
  const d = daysUntil(isoDate);
  if (d < 0) return "expired";
  if (d <= EXPIRY_WARNING_DAYS) return "soon";
  return "ok";
}

const nf = new Intl.NumberFormat("id-ID");
export function formatNumber(n: number): string {
  return nf.format(n);
}

export function formatDate(iso: string): string {
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
