import type {
  Material,
  Product,
  ProductionQueueItem,
  Sparepart,
  StockItemKind,
  StockMovement,
  WarehouseId,
} from "@/types/inventory";
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

export const productService = makeCrud<Product>("product", "p");
export const materialService = makeCrud<Material>("material", "m");
export const sparepartService = makeCrud<Sparepart>("sparepart", "s");

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
    await delay();
    positive(input.qty);
    const item = findItem(kind, id);
    item.stock[input.warehouse] += input.qty;
    if (kind !== "product") {
      const it = item as Material | Sparepart;
      if (input.batchNo) it.batchNo = input.batchNo;
      if (input.expiryDate) it.expiryDate = input.expiryDate;
    }
    logMovement({ itemKind: kind, itemId: id, itemName: item.name, type: "IN", warehouse: input.warehouse, qty: input.qty, reference: input.reference, note: input.note });
    emit(TOPIC[kind], "movements");
  },

  async stockOut(kind: StockItemKind, id: string, input: StockOutInput) {
    await delay();
    positive(input.qty);
    const item = findItem(kind, id);
    if (item.stock[input.warehouse] < input.qty) {
      throw new ServiceError(`Stok di gudang tidak mencukupi (tersedia ${item.stock[input.warehouse]}).`);
    }
    item.stock[input.warehouse] -= input.qty;
    logMovement({ itemKind: kind, itemId: id, itemName: item.name, type: "OUT", warehouse: input.warehouse, qty: input.qty, reference: input.reference, note: input.note });
    emit(TOPIC[kind], "movements");
  },

  async transfer(kind: StockItemKind, id: string, input: TransferInput) {
    await delay();
    positive(input.qty);
    if (input.from === input.to) throw new ServiceError("Gudang asal dan tujuan tidak boleh sama.");
    const item = findItem(kind, id);
    if (item.stock[input.from] < input.qty) {
      throw new ServiceError(`Stok gudang asal tidak mencukupi (tersedia ${item.stock[input.from]}).`);
    }
    // Atomic: kedua sisi diubah bersamaan
    item.stock[input.from] -= input.qty;
    item.stock[input.to] += input.qty;
    logMovement({ itemKind: kind, itemId: id, itemName: item.name, type: "TRANSFER", warehouse: input.from, toWarehouse: input.to, qty: input.qty, note: input.note });
    emit(TOPIC[kind], "movements");
  },

  async opname(kind: StockItemKind, id: string, input: OpnameInput) {
    await delay();
    if (!Number.isFinite(input.physicalQty) || input.physicalQty < 0) {
      throw new ServiceError("Stok fisik tidak boleh negatif.");
    }
    const item = findItem(kind, id);
    const diff = input.physicalQty - item.stock[input.warehouse];
    item.stock[input.warehouse] = input.physicalQty;
    logMovement({ itemKind: kind, itemId: id, itemName: item.name, type: "OPNAME", warehouse: input.warehouse, qty: diff, note: input.note });
    emit(TOPIC[kind], "movements");
  },

  async movements(filter?: { itemKind?: StockItemKind; itemId?: string; limit?: number }): Promise<StockMovement[]> {
    await delay(250);
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
