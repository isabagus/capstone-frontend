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

/** Mengambil nilai stok per gudang dengan aman, menangani variasi ID string ("1"/"g1") dan mencegah NaN */
export function getWarehouseStock(stock: StockByWarehouse | undefined | null, warehouseId: WarehouseId): number {
  if (!stock || typeof stock !== "object") return 0;
  const w = String(warehouseId);
  const val =
    (stock as any)[w] ??
    (w === "1" || w === "g1" ? stock.g1 ?? (stock as any)["1"] : undefined) ??
    (w === "2" || w === "g2" ? stock.g2 ?? (stock as any)["2"] : undefined);
  const num = Number(val);
  return Number.isFinite(num) ? num : 0;
}

/** Menghitung total stok dan memverifikasi konsistensi G1 + G2 (Bug #5) */
export function totalStock(stock: StockByWarehouse | undefined | null): number {
  if (!stock || typeof stock !== "object") return 0;
  const g1 = getWarehouseStock(stock, "g1");
  const g2 = getWarehouseStock(stock, "g2");
  const sumG1G2 = g1 + g2;

  // Cek konsistensi saat development
  if (process.env.NODE_ENV === "development") {
    const rawSum = Object.entries(stock).reduce((acc, [k, v]) => {
      // Abaikan alias duplicate ("1" vs "g1")
      if (k === "1" || k === "2") return acc;
      const n = Number(v);
      return acc + (Number.isFinite(n) ? n : 0);
    }, 0);
    if (sumG1G2 > 0 && rawSum > 0 && Math.abs(sumG1G2 - rawSum) > 0.001) {
      console.warn(`[Inventory Integrity] Total Stok mismatch: (Gudang 1 + Gudang 2 = ${sumG1G2}) !== (Raw Sum = ${rawSum})`, stock);
    }
  }

  return sumG1G2;
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
export function formatNumber(n: number | null | undefined): string {
  const val = Number(n);
  return nf.format(Number.isFinite(val) ? val : 0);
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

/** Format nama gudang ramah baca */
export function formatWarehouseName(wId?: string | null): string {
  if (!wId) return "-";
  const s = String(wId).trim();
  if (s === "g1" || s === "1" || s === "GD-01") return "Gudang 1 (Utama)";
  if (s === "g2" || s === "2" || s === "GD-02") return "Gudang 2 (Toko/Ruko)";
  return s;
}

/**
 * Format rute mutasi stok (Bug #3):
 * - Untuk TRANSFER: "Gudang 1 → Gudang 2"
 * - Untuk non-TRANSFER: "Gudang 1" (tanpa tanda panah / tanpa "→ undefined")
 */
export function formatMovementRoute(
  type: string,
  warehouse?: string | null,
  toWarehouse?: string | null
): string {
  const fromName = formatWarehouseName(warehouse);
  if (type === "TRANSFER") {
    const toName = toWarehouse ? formatWarehouseName(toWarehouse) : "Gudang 2";
    return `${fromName} → ${toName}`;
  }
  return fromName;
}

/**
 * Helper pencarian nama kategori yang fleksibel (Bug #2):
 * Mencocokkan ID (string/int), nama kategori, atau fallback ke ID asli jika data ada.
 * Tampilkan "-" hanya bila categoryId memang kosong.
 */
const FALLBACK_CATEGORIES: Record<string, string> = {
  "cs-blanket": "Blanket & Roller",
  "cs-blade": "Pisau & Pond",
  "cs-chem": "Bahan Kimia Mesin",
  "cs-elec": "Elektrikal",
  "cs-consumable": "Consumable Cetak",
  "cp-hardbox": "Hardbox / Rigid",
  "cp-softbox": "Softbox",
  "cp-card": "Kartu & Stationery",
  "cp-photobook": "Photobook",
  "cp-pouch": "Pouch & Flexible",
  "cp-semi": "Setengah Jadi",
  "cp-sticker": "Stiker & Label",
  "cm-paper": "Kertas Plano & Karton",
  "cm-board": "Greyboard / Tebal",
  "cm-ink": "Tinta & Kimia Cetak",
  "cm-finishing": "Finishing & Foil",
  "cm-adhesive": "Lem & Consumables",
};

const FALLBACK_UNITS: Record<string, string> = {
  "u-pcs": "Pcs",
  "u-ltr": "Liter",
  "u-kg": "Kg",
  "u-gr": "Gram",
  "u-rim": "Rim",
  "u-plano": "Plano",
  "u-lbr": "Lembar",
  "u-roll": "Roll",
  "u-pack": "Pack",
  "u-box": "Box",
  "u-mtr": "Meter",
  "u-kln": "Kaleng",
};

export function findCategoryName(
  categories: { id: string; name: string }[] | undefined | null,
  categoryId?: string | null
): string {
  if (!categoryId || categoryId === "") return "-";
  const target = String(categoryId).trim().toLowerCase();
  if (categories && categories.length > 0) {
    const match = categories.find(
      (c) =>
        c.id.toLowerCase() === target ||
        c.name.toLowerCase() === target ||
        c.name.toLowerCase().includes(target)
    );
    if (match) return match.name;
  }
  return FALLBACK_CATEGORIES[target] || String(categoryId);
}

/**
 * Helper pencarian singkatan satuan yang fleksibel (Bug #2):
 * Mencocokkan ID, singkatan, atau nama satuan. Tampilkan "-" hanya jika unitId kosong.
 */
export function findUnitAbbr(
  units: { id: string; name: string; abbr?: string }[] | undefined | null,
  unitId?: string | null
): string {
  if (!unitId || unitId === "") return "-";
  const target = String(unitId).trim().toLowerCase();
  if (units && units.length > 0) {
    const match = units.find(
      (u) =>
        u.id.toLowerCase() === target ||
        (u.abbr && u.abbr.toLowerCase() === target) ||
        (u.abbr && u.abbr.toLowerCase() === target.replace(/^u-/, "")) ||
        u.name.toLowerCase() === target ||
        u.name.toLowerCase() === target.replace(/^u-/, "")
    );
    if (match) return match.abbr || match.name;
  }
  return FALLBACK_UNITS[target] || target.replace(/^u-/, "").toUpperCase();
}

/**
 * Helper pencarian nama lengkap satuan (Bug #2).
 */
export function findUnitName(
  units: { id: string; name: string; abbr?: string }[] | undefined | null,
  unitId?: string | null
): string {
  if (!unitId || unitId === "") return "-";
  if (!units || units.length === 0) return String(unitId);
  const target = String(unitId).trim().toLowerCase();
  const match = units.find(
    (u) =>
      u.id.toLowerCase() === target ||
      u.name.toLowerCase() === target ||
      (u.abbr && u.abbr.toLowerCase() === target)
  );
  return match ? match.name : String(unitId);
}
