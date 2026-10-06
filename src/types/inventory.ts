// =====================================================================
// Tipe domain Inventori & Master Data (Staf Gudang)
// Dipakai bersama oleh mock data, service layer, hooks, dan komponen UI.
// Saat backend siap, cukup sesuaikan mapping di service layer.
// =====================================================================

export type BrandName =
  | "Packsolution.id"
  | "Estella"
  | "Pepipapier"
  | "memoirs.print"
  | "pikpurry"
  | (string & {});

export interface Brand {
  id: string;
  name: string;
  code: string;
  slug?: string;
  description?: string;
  active: boolean;
  orderCount?: number;
  productCount?: number;
  materialCount?: number;
}

export type WarehouseId = "g1" | "g2" | string;

export interface Warehouse {
  id: WarehouseId;
  code?: string;
  name: string;
  shortName: string;
  type?: "MAIN_WAREHOUSE" | "STORE_WAREHOUSE" | "OTHER";
  address?: string;
  phone?: string;
  picName?: string;
  description: string;
  active?: boolean;
  totalSku?: number;
  totalStock?: number;
}

/** Stok per gudang */
export type StockByWarehouse = Record<WarehouseId, number>;

export type CategoryKind = "product" | "material" | "sparepart";

export interface Category {
  id: string;
  kind: CategoryKind;
  name: string;
  description: string;
  active: boolean;
}

export type UnitType = "Berat" | "Panjang" | "Lembar" | "Volume" | "Unit";

export interface Unit {
  id: string;
  name: string;
  abbr: string;
  type: UnitType;
  active: boolean;
}

/** 1 [fromUnit] = factor [toUnit]  — dipakai oleh BOM Engine */
export interface UnitConversion {
  id: string;
  fromUnitId: string;
  toUnitId: string;
  factor: number;
  note?: string;
}

export type SupplierType = "Domestik" | "Impor";

export interface Supplier {
  id: string;
  code: string;
  name: string;
  pic: string;
  phone: string;
  email: string;
  address: string;
  type: SupplierType;
  active: boolean;
}

export type ProductType = "Barang Jadi" | "Setengah Jadi";

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: BrandName;
  type: ProductType;
  categoryId: string;
  unitId: string;
  stock: StockByWarehouse;
  minStock: number;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  /** Brand terkait; array kosong = dipakai lintas brand */
  brands: BrandName[];
  unitId: string;
  stock: StockByWarehouse;
  safetyStock: number;
  rop: number;
  supplierId: string;
  /** Gramatur kertas (gsm) */
  gramature?: number;
  /** Dimensi, mis. "79 x 109 cm" */
  dimension?: string;
  batchNo?: string;
  /** ISO date (YYYY-MM-DD) untuk tinta / bahan sensitif */
  expiryDate?: string;
}

export interface Sparepart {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  unitId: string;
  stock: StockByWarehouse;
  safetyStock: number;
  rop: number;
  supplierId: string;
  machine?: string;
  batchNo?: string;
  expiryDate?: string;
}

export type StockItemKind = "product" | "material" | "sparepart";

export type MovementType = "IN" | "OUT" | "TRANSFER" | "OPNAME";

export interface StockMovement {
  id: string;
  itemKind: StockItemKind;
  itemId: string;
  itemName: string;
  type: MovementType;
  warehouse: WarehouseId;
  toWarehouse?: WarehouseId;
  /** Untuk OPNAME: selisih (positif/negatif) */
  qty: number;
  note?: string;
  reference?: string;
  user: string;
  date: string; // ISO datetime
}

export interface ProductionQueueItem {
  id: string;
  orderNumber: string;
  brand: BrandName;
  product: string;
  quantity: string;
  dueDate: string;
  priority: "Normal" | "High" | "Urgent";
  requirements: { materialId: string; qty: number }[];
}

export type StockStatus = "safe" | "near" | "below";
export type ExpiryStatus = "ok" | "soon" | "expired" | "none";
