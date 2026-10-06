import {
  BRAND_ITEMS,
  CATEGORIES,
  MATERIALS,
  PRODUCTION_QUEUE,
  PRODUCTS,
  SPAREPARTS,
  STOCK_MOVEMENTS,
  SUPPLIERS,
  UNITS,
  UNIT_CONVERSIONS,
  WAREHOUSES,
} from "@/mocks/inventory";

// =====================================================================
// In-memory mock database.
// HANYA dipakai oleh service layer. Saat integrasi backend, file ini
// dihapus dan service memanggil `apiClient` (src/lib/apiClient.ts).
// =====================================================================

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export const db = {
  products: clone(PRODUCTS),
  materials: clone(MATERIALS),
  spareparts: clone(SPAREPARTS),
  suppliers: clone(SUPPLIERS),
  units: clone(UNITS),
  conversions: clone(UNIT_CONVERSIONS),
  categories: clone(CATEGORIES),
  brands: clone(BRAND_ITEMS),
  warehouses: clone(WAREHOUSES),
  movements: clone(STOCK_MOVEMENTS),
  productionQueue: clone(PRODUCTION_QUEUE),
};

export type Topic =
  | "products"
  | "materials"
  | "spareparts"
  | "suppliers"
  | "units"
  | "categories"
  | "brands"
  | "warehouses"
  | "movements";

const listeners = new Map<Topic, Set<() => void>>();

export function subscribe(topics: Topic[], fn: () => void): () => void {
  topics.forEach((t) => {
    if (!listeners.has(t)) listeners.set(t, new Set());
    listeners.get(t)!.add(fn);
  });
  return () => topics.forEach((t) => listeners.get(t)?.delete(fn));
}

export function emit(...topics: Topic[]) {
  const fns = new Set<() => void>();
  topics.forEach((t) => listeners.get(t)?.forEach((f) => fns.add(f)));
  fns.forEach((f) => f());
}

/** Simulasi latensi jaringan */
export function delay(ms = 350): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Error domain dengan pesan yang siap ditampilkan ke pengguna */
export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceError";
  }
}

export { clone };
