import type {
  BrandName,
  Material,
  Product,
  ProductType,
  ProductionQueueItem,
  Sparepart,
  StockItemKind,
  StockMovement,
  WarehouseId,
} from "@/types/inventory";
import apiClient from "@/lib/apiClient";
import { clone, db, delay, emit, ServiceError, Topic, uid } from "./mockDb";

// =====================================================================
// Inventory Service — Produk, Bahan Baku, Sparepart & mutasi stok.
// Semua fungsi async & mengembalikan salinan data, sehingga kontraknya
// identik dengan pemanggilan REST nantinya:
//   GET    /inventory/{kind}          -> list()
//   POST   /inventory/{kind}          -> create()
//   PUT    /inventory/{kind}/{id}     -> update()
//   DELETE /inventory/{kind}/{id}     -> remove()
//   POST   /inventory/{kind}/{id}/in|out|transfer|opname
// =====================================================================

type StockEntity = Product | Material | Sparepart;

const COLLECTION: Record<StockItemKind, () => StockEntity[]> = {
  product: () => db.products,
  material: () => db.materials,
  sparepart: () => db.spareparts,
};

const TOPIC: Record<StockItemKind, Topic> = {
  product: "products",
  material: "materials",
  sparepart: "spareparts",
};

const CURRENT_USER = "Hendra Wijaya";

function codeOf(item: StockEntity): string {
  return "sku" in item ? item.sku : item.code;
}

function findItem(kind: StockItemKind, id: string): StockEntity {
  const item = COLLECTION[kind]().find((i) => i.id === id);
  if (!item) throw new ServiceError("Item tidak ditemukan atau sudah dihapus.");
  return item;
}

function assertUniqueCode(kind: StockItemKind, code: string, exceptId?: string) {
  const dup = COLLECTION[kind]().some(
    (i) => i.id !== exceptId && codeOf(i).toLowerCase() === code.trim().toLowerCase()
  );
  if (dup) throw new ServiceError(`Kode "${code}" sudah digunakan item lain.`);
}

function makeCrud<T extends StockEntity>(kind: StockItemKind, prefix: string) {
  const col = () => COLLECTION[kind]() as T[];
  return {
    async list(): Promise<T[]> {
      await delay();
      return clone(col());
    },
    async get(id: string): Promise<T> {
      await delay(150);
      return clone(findItem(kind, id) as T);
    },
    async create(input: Omit<T, "id">): Promise<T> {
      await delay();
      assertUniqueCode(kind, codeOf(input as T));
      const item = { ...clone(input), id: uid(prefix) } as T;
      col().unshift(item);
      emit(TOPIC[kind], "categories", "suppliers", "units");
      return clone(item);
    },
    async update(id: string, input: Omit<T, "id">): Promise<T> {
      await delay();
      assertUniqueCode(kind, codeOf(input as T), id);
      const idx = col().findIndex((i) => i.id === id);
      if (idx < 0) throw new ServiceError("Item tidak ditemukan.");
      col()[idx] = { ...clone(input), id } as T;
      emit(TOPIC[kind], "categories", "suppliers", "units");
      return clone(col()[idx]);
    },
    async remove(id: string): Promise<void> {
      await delay();
      const idx = col().findIndex((i) => i.id === id);
      if (idx < 0) throw new ServiceError("Item tidak ditemukan.");
      col().splice(idx, 1);
      emit(TOPIC[kind], "categories", "suppliers", "units");
    },
  };
}

const baseProductCrud = makeCrud<Product>("product", "p");

export const productService = {
  ...baseProductCrud,

  async list(): Promise<Product[]> {
    try {
      const res = await apiClient.get("/v1/products");
      const list = res.data?.data;
      if (Array.isArray(list) && list.length > 0) {
        return list.map((item: any) => {
          const stock = { g1: 0, g2: 0 } as any;
          if (Array.isArray(item.warehouse_stocks)) {
            item.warehouse_stocks.forEach((ws: any) => {
              const wId = String(ws.warehouse_id);
              const qty = Number(ws.qty_available) || 0;
              if (wId === "1" || ws.warehouse_name?.includes("1") || ws.warehouse_type === "MAIN_WAREHOUSE") {
                stock.g1 = (stock.g1 || 0) + qty;
              } else if (wId === "2" || ws.warehouse_name?.includes("2") || ws.warehouse_type === "STORE_WAREHOUSE") {
                stock.g2 = (stock.g2 || 0) + qty;
              }
              stock[wId] = qty;
            });
          }

          return {
            id: String(item.id),
            sku: item.sku,
            name: item.name,
            brand: (item.brand || "Packsolution.id") as BrandName,
            type: (item.type || "Barang Jadi") as ProductType,
            categoryId: String(item.category_id || "cp-hardbox"),
            unitId: item.unit || "Pcs",
            stock,
            minStock: Number(item.min_stock) || 0,
          };
        });
      }
      return clone(db.products);
    } catch {
      await delay(150);
      return clone(db.products);
    }
  },

  async create(input: Omit<Product, "id">): Promise<Product> {
    try {
      const res = await apiClient.post("/v1/products", {
        sku: input.sku,
        name: input.name,
        brand_id: BRAND_MAP[String(input.brand).toLowerCase().trim()] || 1,
        type: input.type,
        category_id: resolveCategoryId(input.categoryId),
        unit: resolveUnit(input.unitId),
        min_stock: Number(input.minStock) || 0,
        initial_stocks: [
          { warehouse_id: 1, qty_available: Number(input.stock?.g1) || 0 },
          { warehouse_id: 2, qty_available: Number(input.stock?.g2) || 0 },
        ],
      });
      const created = res.data?.data;
      emit("products", "categories");
      return {
        ...input,
        id: String(created?.id ?? uid("p")),
      };
    } catch {
      return baseProductCrud.create(input);
    }
  },

  async update(id: string, input: Omit<Product, "id">): Promise<Product> {
    try {
      const numericId = parseInt(id.replace(/^[a-z]+-/i, ""), 10);
      await apiClient.put(`/v1/products/${numericId || id}`, {
        sku: input.sku,
        name: input.name,
        brand_id: BRAND_MAP[String(input.brand).toLowerCase().trim()] || 1,
        type: input.type,
        category_id: resolveCategoryId(input.categoryId),
        unit: resolveUnit(input.unitId),
        min_stock: Number(input.minStock) || 0,
      });
      emit("products", "categories");
      return { ...input, id };
    } catch {
      return baseProductCrud.update(id, input);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      const numericId = parseInt(id.replace(/^[a-z]+-/i, ""), 10);
      await apiClient.delete(`/v1/products/${numericId || id}`);
      emit("products", "categories");
    } catch (err: any) {
      if (err?.response?.data?.message) {
        throw new ServiceError(err.response.data.message);
      }
      return baseProductCrud.remove(id);
    }
  },
};

const baseMaterialCrud = makeCrud<Material>("material", "m");
const BRAND_MAP: Record<string, number> = {
  "packsolution.id": 1,
  "packsolution": 1,
  "pack": 1,
  "estella digital printing": 2,
  "estella": 2,
  "est": 2,
  "pepipapier": 3,
  "pepi": 3,
  "memoirs.print": 4,
  "memoirs": 4,
  "mem": 4,
  "pixpurry": 5,
  "pikpurry": 5,
  "pix": 5,
};

function resolveBrandIds(brands?: string[]): number[] {
  if (!Array.isArray(brands) || brands.length === 0) return [1, 2, 3, 4, 5];
  const ids = new Set<number>();
  brands.forEach((b) => {
    const key = String(b).toLowerCase().trim();
    if (BRAND_MAP[key]) {
      ids.add(BRAND_MAP[key]);
    } else if (/^\d+$/.test(key)) {
      ids.add(parseInt(key, 10));
    }
  });
  return ids.size > 0 ? Array.from(ids) : [1, 2, 3, 4, 5];
}

function resolveCategoryId(catId?: string | number): number {
  if (!catId) return 1;
  const num = parseInt(String(catId).replace(/^[a-z]+-/i, ""), 10);
  return isNaN(num) || num <= 0 ? 1 : num;
}

function resolveSupplierId(supId?: string | number): number | null {
  if (!supId) return null;
  const num = parseInt(String(supId).replace(/^[a-z]+-/i, ""), 10);
  return isNaN(num) || num <= 0 ? null : num;
}

function resolveUnit(unit?: string): string {
  if (!unit) return "Rim";
  const map: Record<string, string> = {
    "u-plano": "Plano",
    "u-rim": "Rim",
    "u-sheet": "Lembar",
    "u-roll": "Roll",
    "u-kg": "Kg",
    "u-meter": "Meter",
    "u-pcs": "Pcs",
    "u-box": "Box",
  };
  return map[unit.toLowerCase()] || unit;
}

export const materialService = {
  ...baseMaterialCrud,

  async list(): Promise<Material[]> {
    try {
      const res = await apiClient.get("/v1/materials");
      const list = res.data?.data;
      if (Array.isArray(list) && list.length > 0) {
        return list.map((item: any) => {
          const stock = { g1: 0, g2: 0 } as any;
          if (Array.isArray(item.warehouse_stocks)) {
            item.warehouse_stocks.forEach((ws: any) => {
              const wId = String(ws.warehouse_id);
              const qty = Number(ws.qty_available) || 0;
              if (wId === "1" || ws.warehouse_name?.includes("1") || ws.warehouse_type === "MAIN_WAREHOUSE") {
                stock.g1 = (stock.g1 || 0) + qty;
              } else if (wId === "2" || ws.warehouse_name?.includes("2") || ws.warehouse_type === "STORE_WAREHOUSE") {
                stock.g2 = (stock.g2 || 0) + qty;
              }
              stock[wId] = qty;
            });
          }

          const brandNames = Array.isArray(item.brands)
            ? item.brands.map((b: any) => b.name)
            : [];

          return {
            id: String(item.id),
            code: item.sku || item.code || `MAT-${item.id}`,
            name: item.name,
            categoryId: String(item.category_id),
            brands: brandNames,
            unitId: item.unit || "Rim",
            stock,
            safetyStock: Number(item.safety_stock) || 0,
            rop: Number(item.reorder_point) || 0,
            supplierId: String(item.supplier_id || "sp-1"),
            gramature: item.gramature ? Number(item.gramature) : undefined,
            dimension: item.dimension || undefined,
            batchNo: item.batch_no || undefined,
            expiryDate: item.expiry_date || undefined,
          };
        });
      }
      return clone(db.materials);
    } catch {
      await delay(150);
      return clone(db.materials);
    }
  },

  async create(input: Omit<Material, "id">): Promise<Material> {
    try {
      const res = await apiClient.post("/v1/materials", {
        sku: input.code,
        name: input.name,
        category_id: resolveCategoryId(input.categoryId),
        supplier_id: resolveSupplierId(input.supplierId),
        unit: resolveUnit(input.unitId),
        gramature: input.gramature ? Number(input.gramature) : null,
        dimension: input.dimension || null,
        batch_no: input.batchNo || null,
        expiry_date: input.expiryDate || null,
        safety_stock: Number(input.safetyStock) || 0,
        reorder_point: Number(input.rop) || 0,
        brand_ids: resolveBrandIds(input.brands as any),
        initial_stocks: [
          { warehouse_id: 1, qty_available: Number(input.stock?.g1) || 0 },
          { warehouse_id: 2, qty_available: Number(input.stock?.g2) || 0 },
        ],
      });
      const created = res.data?.data;
      emit("materials", "categories");
      return {
        ...input,
        id: String(created?.id ?? uid("m")),
      };
    } catch {
      return baseMaterialCrud.create(input);
    }
  },

  async update(id: string, input: Omit<Material, "id">): Promise<Material> {
    try {
      const numericId = parseInt(id.replace(/^[a-z]+-/i, ""), 10);
      await apiClient.put(`/v1/materials/${numericId || id}`, {
        sku: input.code,
        name: input.name,
        category_id: resolveCategoryId(input.categoryId),
        supplier_id: resolveSupplierId(input.supplierId),
        unit: resolveUnit(input.unitId),
        gramature: input.gramature ? Number(input.gramature) : null,
        dimension: input.dimension || null,
        batch_no: input.batchNo || null,
        expiry_date: input.expiryDate || null,
        safety_stock: Number(input.safetyStock) || 0,
        reorder_point: Number(input.rop) || 0,
        brand_ids: resolveBrandIds(input.brands as any),
      });
      emit("materials", "categories");
      return { ...input, id };
    } catch {
      return baseMaterialCrud.update(id, input);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      const numericId = parseInt(id.replace(/^[a-z]+-/i, ""), 10);
      await apiClient.delete(`/v1/materials/${numericId || id}`);
      emit("materials", "categories");
    } catch (err: any) {
      if (err?.response?.data?.message) {
        throw new ServiceError(err.response.data.message);
      }
      return baseMaterialCrud.remove(id);
    }
  },
};

const baseSparepartCrud = makeCrud<Sparepart>("sparepart", "s");

export const sparepartService = {
  ...baseSparepartCrud,

  async list(): Promise<Sparepart[]> {
    try {
      const res = await apiClient.get("/v1/spareparts");
      const list = res.data?.data;
      if (Array.isArray(list) && list.length > 0) {
        return list.map((item: any) => {
          const stock = { g1: 0, g2: 0 } as any;
          if (Array.isArray(item.warehouse_stocks)) {
            item.warehouse_stocks.forEach((ws: any) => {
              const wId = String(ws.warehouse_id);
              const qty = Number(ws.qty_available) || 0;
              if (wId === "1" || ws.warehouse_name?.includes("1") || ws.warehouse_type === "MAIN_WAREHOUSE") {
                stock.g1 = (stock.g1 || 0) + qty;
              } else if (wId === "2" || ws.warehouse_name?.includes("2") || ws.warehouse_type === "STORE_WAREHOUSE") {
                stock.g2 = (stock.g2 || 0) + qty;
              }
              stock[wId] = qty;
            });
          }

          return {
            id: String(item.id),
            code: item.code,
            name: item.name,
            categoryId: String(item.category_id || "cs-consumable"),
            unitId: item.unit || "Pcs",
            machine: item.machine || undefined,
            supplierId: String(item.supplier_id || "sp-1"),
            stock,
            safetyStock: Number(item.safety_stock) || 0,
            rop: Number(item.reorder_point) || 0,
            batchNo: item.batch_no || undefined,
            expiryDate: item.expiry_date || undefined,
          };
        });
      }
      return clone(db.spareparts);
    } catch {
      await delay(150);
      return clone(db.spareparts);
    }
  },

  async create(input: Omit<Sparepart, "id">): Promise<Sparepart> {
    try {
      const res = await apiClient.post("/v1/spareparts", {
        code: input.code,
        name: input.name,
        category_id: resolveCategoryId(input.categoryId),
        unit: resolveUnit(input.unitId),
        machine: input.machine || null,
        supplier_id: resolveSupplierId(input.supplierId),
        safety_stock: Number(input.safetyStock) || 0,
        reorder_point: Number(input.rop) || 0,
        batch_no: input.batchNo || null,
        expiry_date: input.expiryDate || null,
        initial_stocks: [
          { warehouse_id: 1, qty_available: Number(input.stock?.g1) || 0 },
          { warehouse_id: 2, qty_available: Number(input.stock?.g2) || 0 },
        ],
      });
      const created = res.data?.data;
      emit("spareparts", "categories");
      return {
        ...input,
        id: String(created?.id ?? uid("s")),
      };
    } catch {
      return baseSparepartCrud.create(input);
    }
  },

  async update(id: string, input: Omit<Sparepart, "id">): Promise<Sparepart> {
    try {
      const numericId = parseInt(id.replace(/^[a-z]+-/i, ""), 10);
      await apiClient.put(`/v1/spareparts/${numericId || id}`, {
        code: input.code,
        name: input.name,
        category_id: resolveCategoryId(input.categoryId),
        unit: resolveUnit(input.unitId),
        machine: input.machine || null,
        supplier_id: resolveSupplierId(input.supplierId),
        safety_stock: Number(input.safetyStock) || 0,
        reorder_point: Number(input.rop) || 0,
        batch_no: input.batchNo || null,
        expiry_date: input.expiryDate || null,
      });
      emit("spareparts", "categories");
      return { ...input, id };
    } catch {
      return baseSparepartCrud.update(id, input);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      const numericId = parseInt(id.replace(/^[a-z]+-/i, ""), 10);
      await apiClient.delete(`/v1/spareparts/${numericId || id}`);
      emit("spareparts", "categories");
    } catch (err: any) {
      if (err?.response?.data?.message) {
        throw new ServiceError(err.response.data.message);
      }
      return baseSparepartCrud.remove(id);
    }
  },
};

// ---------------------------------------------------------------------
// Mutasi stok
// ---------------------------------------------------------------------
export interface StockInInput {
  warehouse: WarehouseId;
  qty: number;
  reference?: string;
  note?: string;
  batchNo?: string;
  expiryDate?: string;
}

export interface StockOutInput {
  warehouse: WarehouseId;
  qty: number;
  reference?: string;
  note?: string;
}

export interface TransferInput {
  from: WarehouseId;
  to: WarehouseId;
  qty: number;
  note?: string;
}

export interface OpnameInput {
  warehouse: WarehouseId;
  physicalQty: number;
  note?: string;
}

function logMovement(m: Omit<StockMovement, "id" | "date" | "user">) {
  db.movements.unshift({
    ...m,
    id: uid("mv"),
    user: CURRENT_USER,
    date: new Date().toISOString(),
  });
}

function positive(qty: number) {
  if (!Number.isFinite(qty) || qty <= 0) throw new ServiceError("Jumlah harus lebih dari 0.");
}

export const stockService = {
  async stockIn(kind: StockItemKind, id: string, input: StockInInput) {
    positive(input.qty);
    if (kind === "material") {
      try {
        const res = await apiClient.post("/v1/inventory/in", {
          material_id: id,
          warehouse_id: input.warehouse,
          qty: input.qty,
          reference: input.reference,
          batch_no: input.batchNo,
          expiry_date: input.expiryDate,
          note: input.note,
        });
        emit(TOPIC[kind], "movements");
        return res.data;
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message;
        throw new ServiceError(msg || "Gagal mencatat barang masuk ke server.");
      }
    }

    await delay();
    const item = findItem(kind, id);
    item.stock[input.warehouse] = (item.stock[input.warehouse] || 0) + input.qty;
    if (kind !== "product") {
      const it = item as Material | Sparepart;
      if (input.batchNo) it.batchNo = input.batchNo;
      if (input.expiryDate) it.expiryDate = input.expiryDate;
    }
    logMovement({ itemKind: kind, itemId: id, itemName: item.name, type: "IN", warehouse: input.warehouse, qty: input.qty, reference: input.reference, note: input.note });
    emit(TOPIC[kind], "movements");
  },

  async stockOut(kind: StockItemKind, id: string, input: StockOutInput) {
    positive(input.qty);
    if (kind === "material") {
      try {
        const res = await apiClient.post("/v1/inventory/out", {
          material_id: id,
          warehouse_id: input.warehouse,
          qty: input.qty,
          reference: input.reference,
          note: input.note,
        });
        emit(TOPIC[kind], "movements");
        return res.data;
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message;
        throw new ServiceError(msg || "Gagal mencatat pengeluaran barang ke server.");
      }
    }

    await delay();
    const item = findItem(kind, id);
    if (item.stock[input.warehouse] < input.qty) {
      throw new ServiceError(`Stok di gudang tidak mencukupi (tersedia ${item.stock[input.warehouse]}).`);
    }
    item.stock[input.warehouse] -= input.qty;
    logMovement({ itemKind: kind, itemId: id, itemName: item.name, type: "OUT", warehouse: input.warehouse, qty: input.qty, reference: input.reference, note: input.note });
    emit(TOPIC[kind], "movements");
  },

  async transfer(kind: StockItemKind, id: string, input: TransferInput) {
    positive(input.qty);
    if (input.from === input.to) throw new ServiceError("Gudang asal dan tujuan tidak boleh sama.");

    if (kind === "material") {
      try {
        const res = await apiClient.post("/v1/inventory/transfer", {
          material_id: id,
          origin_warehouse_id: input.from,
          target_warehouse_id: input.to,
          qty: input.qty,
          note: input.note,
        });
        emit(TOPIC[kind], "movements");
        return res.data;
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message;
        throw new ServiceError(msg || "Gagal melakukan transfer stok antar gudang di server.");
      }
    }

    await delay();
    const item = findItem(kind, id);
    if (item.stock[input.from] < input.qty) {
      throw new ServiceError(`Stok gudang asal tidak mencukupi (tersedia ${item.stock[input.from]}).`);
    }
    item.stock[input.from] -= input.qty;
    item.stock[input.to] += input.qty;
    logMovement({ itemKind: kind, itemId: id, itemName: item.name, type: "TRANSFER", warehouse: input.from, toWarehouse: input.to, qty: input.qty, note: input.note });
    emit(TOPIC[kind], "movements");
  },

  async opname(kind: StockItemKind, id: string, input: OpnameInput) {
    if (!Number.isFinite(input.physicalQty) || input.physicalQty < 0) {
      throw new ServiceError("Stok fisik tidak boleh negatif.");
    }

    if (kind === "material") {
      try {
        const res = await apiClient.post("/v1/inventory/opname", {
          material_id: id,
          warehouse_id: input.warehouse,
          physical_qty: input.physicalQty,
          note: input.note,
        });
        emit(TOPIC[kind], "movements");
        return res.data;
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message;
        throw new ServiceError(msg || "Gagal menyimpan hasil stock opname ke server.");
      }
    }

    await delay();
    const item = findItem(kind, id);
    const diff = input.physicalQty - item.stock[input.warehouse];
    item.stock[input.warehouse] = input.physicalQty;
    logMovement({ itemKind: kind, itemId: id, itemName: item.name, type: "OPNAME", warehouse: input.warehouse, qty: diff, note: input.note });
    emit(TOPIC[kind], "movements");
  },

  async movements(filter?: { itemKind?: StockItemKind; itemId?: string; limit?: number }): Promise<StockMovement[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.limit) params.set("limit", String(filter.limit));
      if (filter?.itemId) params.set("material_id", String(filter.itemId));

      const res = await apiClient.get(`/v1/inventory/movements?${params.toString()}`);
      const list = res.data?.data;
      if (Array.isArray(list) && list.length > 0) {
        return list as StockMovement[];
      }
    } catch {
      // Backend unreachable or offline, fallback to local mock
    }

    await delay(150);
    let rows = db.movements;
    if (filter?.itemKind) rows = rows.filter((m) => m.itemKind === filter.itemKind);
    if (filter?.itemId) rows = rows.filter((m) => m.itemId === filter.itemId);
    rows = [...rows].sort((a, b) => b.date.localeCompare(a.date));
    return clone(filter?.limit ? rows.slice(0, filter.limit) : rows);
  },
};

export const productionService = {
  async queue(): Promise<ProductionQueueItem[]> {
    await delay();
    return clone(db.productionQueue);
  },
};
