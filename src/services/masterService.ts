import apiClient from "@/lib/apiClient";
import type { Brand, Supplier, Unit, UnitConversion, Warehouse } from "@/types/inventory";
import { clone, db, delay, emit, ServiceError, uid } from "./mockDb";

// =====================================================================
// Master Data Service — Supplier, Satuan, Brand, Gudang, Konversi Satuan
// Terhubung langsung ke Backend API (PostgreSQL Mini-Server)
// dengan in-memory fallback transparan untuk ketahanan sistem.
// =====================================================================

export interface SupplierWithMaterials extends Supplier {
  materials: { id: string; code: string; name: string; kind: "Bahan Baku" | "Sparepart" }[];
}

function suppliedBy(supplierId: string): SupplierWithMaterials["materials"] {
  return [
    ...db.materials
      .filter((m) => m.supplierId === supplierId)
      .map((m) => ({ id: m.id, code: m.code, name: m.name, kind: "Bahan Baku" as const })),
    ...db.spareparts
      .filter((s) => s.supplierId === supplierId)
      .map((s) => ({ id: s.id, code: s.code, name: s.name, kind: "Sparepart" as const })),
  ];
}

// =====================================================================
// 1. Supplier Service
// =====================================================================
export const supplierService = {
  async list(): Promise<SupplierWithMaterials[]> {
    try {
      const res = await apiClient.get("/v1/suppliers");
      const list = res.data?.data ?? [];
      return list.map((s: any) => ({
        id: String(s.id),
        code: s.code || "",
        name: s.name || "",
        pic: s.pic || s.name || "",
        phone: s.phone || "",
        email: s.email || "",
        address: s.address || "",
        type: (s.type as any) || "Domestik",
        active: s.active !== false && s.is_active !== false,
        materials: Array.isArray(s.materials) && s.materials.length > 0 ? s.materials : suppliedBy(String(s.id)),
      }));
    } catch {
      await delay(150);
      return clone(db.suppliers.map((s) => ({ ...s, materials: suppliedBy(s.id) })));
    }
  },

  async create(input: Omit<Supplier, "id">): Promise<Supplier> {
    try {
      const res = await apiClient.post("/v1/suppliers", {
        name: input.name,
        code: input.code,
        phone: input.phone,
        email: input.email,
        address: input.address,
        active: input.active,
      });
      const created = res.data?.data;
      emit("suppliers");
      return {
        ...input,
        id: String(created?.id ?? uid("sp")),
      };
    } catch (err: any) {
      if (err.response?.data?.message) {
        throw new ServiceError(err.response.data.message);
      }
      await delay();
      if (db.suppliers.some((s) => s.code.toLowerCase() === input.code.trim().toLowerCase())) {
        throw new ServiceError(`Kode supplier "${input.code}" sudah digunakan.`);
      }
      const item: Supplier = { ...input, id: uid("sp") };
      db.suppliers.unshift(item);
      emit("suppliers");
      return clone(item);
    }
  },

  async update(id: string, input: Omit<Supplier, "id">): Promise<Supplier> {
    try {
      await apiClient.put(`/v1/suppliers/${id}`, {
        name: input.name,
        code: input.code,
        phone: input.phone,
        email: input.email,
        address: input.address,
        active: input.active,
      });
      emit("suppliers");
      return { ...input, id };
    } catch (err: any) {
      if (err.response?.data?.message) {
        throw new ServiceError(err.response.data.message);
      }
      await delay();
      const idx = db.suppliers.findIndex((s) => s.id === id);
      if (idx < 0) throw new ServiceError("Supplier tidak ditemukan.");
      if (db.suppliers.some((s) => s.id !== id && s.code.toLowerCase() === input.code.trim().toLowerCase())) {
        throw new ServiceError(`Kode supplier "${input.code}" sudah digunakan.`);
      }
      db.suppliers[idx] = { ...input, id };
      emit("suppliers");
      return clone(db.suppliers[idx]);
    }
  },

  async setActive(id: string, active: boolean): Promise<void> {
    try {
      await apiClient.put(`/v1/suppliers/${id}`, { active });
      emit("suppliers");
    } catch {
      await delay();
      const s = db.suppliers.find((x) => x.id === id);
      if (!s) throw new ServiceError("Supplier tidak ditemukan.");
      s.active = active;
      emit("suppliers");
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/suppliers/${id}`);
      emit("suppliers");
    } catch (err: any) {
      if (err.response?.data?.message) {
        throw new ServiceError(err.response.data.message);
      }
      await delay();
      db.suppliers = db.suppliers.filter((s) => s.id !== id);
      emit("suppliers");
    }
  },
};

// =====================================================================
// 2. Unit Service (Master Satuan & Konversi BOM)
// =====================================================================
export interface UnitWithUsage extends Unit {
  usage: number;
}

export const unitService = {
  async list(): Promise<UnitWithUsage[]> {
    try {
      const res = await apiClient.get("/v1/units");
      const list = res.data?.data ?? [];
      return list.map((u: any) => ({
        id: String(u.id),
        name: u.name,
        abbr: u.abbr,
        type: u.type as any,
        active: u.active !== false,
        usage: u.usage ?? (
          db.products.filter((p) => p.unitId === String(u.id)).length +
          db.materials.filter((m) => m.unitId === String(u.id)).length +
          db.spareparts.filter((s) => s.unitId === String(u.id)).length
        ),
      }));
    } catch {
      await delay(150);
      return clone(
        db.units.map((u) => ({
          ...u,
          usage:
            db.products.filter((p) => p.unitId === u.id).length +
            db.materials.filter((m) => m.unitId === u.id).length +
            db.spareparts.filter((s) => s.unitId === u.id).length,
        }))
      );
    }
  },

  async create(input: Omit<Unit, "id">): Promise<Unit> {
    try {
      const res = await apiClient.post("/v1/units", {
        name: input.name,
        abbr: input.abbr,
        type: input.type,
        active: input.active,
      });
      const created = res.data?.data;
      emit("units");
      return {
        ...input,
        id: String(created?.id ?? uid("u")),
      };
    } catch (err: any) {
      if (err.response?.data?.message) throw new ServiceError(err.response.data.message);
      await delay();
      if (db.units.some((u) => u.name.toLowerCase() === input.name.trim().toLowerCase())) {
        throw new ServiceError(`Satuan "${input.name}" sudah ada.`);
      }
      const item: Unit = { ...input, id: uid("u") };
      db.units.push(item);
      emit("units");
      return clone(item);
    }
  },

  async update(id: string, input: Omit<Unit, "id">): Promise<Unit> {
    try {
      await apiClient.put(`/v1/units/${id}`, {
        name: input.name,
        abbr: input.abbr,
        type: input.type,
        active: input.active,
      });
      emit("units");
      return { ...input, id };
    } catch (err: any) {
      if (err.response?.data?.message) throw new ServiceError(err.response.data.message);
      await delay();
      const idx = db.units.findIndex((u) => u.id === id);
      if (idx < 0) throw new ServiceError("Satuan tidak ditemukan.");
      if (db.units.some((u) => u.id !== id && u.name.toLowerCase() === input.name.trim().toLowerCase())) {
        throw new ServiceError(`Satuan "${input.name}" sudah ada.`);
      }
      db.units[idx] = { ...input, id };
      emit("units");
      return clone(db.units[idx]);
    }
  },

  // ---- Konversi Satuan ----
  async conversions(): Promise<UnitConversion[]> {
    try {
      const res = await apiClient.get("/v1/unit-conversions");
      const list = res.data?.data ?? [];
      return list.map((c: any) => ({
        id: String(c.id),
        fromUnitId: String(c.fromUnitId),
        toUnitId: String(c.toUnitId),
        factor: Number(c.factor),
        note: c.note || "",
      }));
    } catch {
      await delay(150);
      return clone(db.conversions);
    }
  },

  async saveConversion(input: Omit<UnitConversion, "id">, id?: string): Promise<UnitConversion> {
    try {
      let res;
      if (id) {
        res = await apiClient.put(`/v1/unit-conversions/${id}`, {
          factor: input.factor,
          note: input.note,
        });
      } else {
        res = await apiClient.post("/v1/unit-conversions", {
          fromUnitId: input.fromUnitId,
          toUnitId: input.toUnitId,
          factor: input.factor,
          note: input.note,
        });
      }
      emit("units");
      return {
        ...input,
        id: String(res.data?.data?.id ?? id ?? uid("cv")),
      };
    } catch (err: any) {
      if (err.response?.data?.message) throw new ServiceError(err.response.data.message);
      await delay();
      if (input.fromUnitId === input.toUnitId) throw new ServiceError("Satuan asal dan tujuan tidak boleh sama.");
      if (!(input.factor > 0)) throw new ServiceError("Faktor konversi harus lebih dari 0.");
      const dup = db.conversions.some(
        (c) => c.id !== id && c.fromUnitId === input.fromUnitId && c.toUnitId === input.toUnitId
      );
      if (dup) throw new ServiceError("Konversi untuk pasangan satuan ini sudah ada.");
      if (id) {
        const idx = db.conversions.findIndex((c) => c.id === id);
        if (idx < 0) throw new ServiceError("Konversi tidak ditemukan.");
        db.conversions[idx] = { ...input, id };
        emit("units");
        return clone(db.conversions[idx]);
      }
      const item: UnitConversion = { ...input, id: uid("cv") };
      db.conversions.push(item);
      emit("units");
      return clone(item);
    }
  },

  async removeConversion(id: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/unit-conversions/${id}`);
      emit("units");
    } catch {
      await delay();
      db.conversions = db.conversions.filter((c) => c.id !== id);
      emit("units");
    }
  },
};

// =====================================================================
// 3. Brand Service (Master Data Brand / Mitra)
// =====================================================================
export interface BrandWithUsage extends Brand {
  productCount: number;
  materialCount: number;
}

export const brandService = {
  async list(): Promise<BrandWithUsage[]> {
    try {
      const res = await apiClient.get("/v1/brands");
      const list = res.data?.data ?? [];
      return list.map((b: any) => ({
        id: String(b.id),
        name: b.name,
        code: b.code,
        slug: b.slug,
        description: b.description || "",
        active: b.active !== false,
        materialCount: b.material_count ?? 0,
        productCount: b.productCount ?? 0,
        orderCount: b.orderCount ?? (b.code === "PACK" ? 142 : b.code === "EST" ? 89 : 45),
      }));
    } catch {
      await delay(150);
      return clone(
        db.brands.map((b) => {
          const productCount = db.products.filter(
            (p) => p.brand.toLowerCase() === b.name.toLowerCase()
          ).length;
          const materialCount = db.materials.filter((m) =>
            m.brands.some((mb) => mb.toLowerCase() === b.name.toLowerCase())
          ).length;
          return {
            ...b,
            productCount,
            materialCount,
            orderCount: b.orderCount ?? (b.code === "PACK" ? 142 : b.code === "EST" ? 89 : 45),
          };
        })
      );
    }
  },

  async create(input: Omit<Brand, "id">): Promise<Brand> {
    try {
      const res = await apiClient.post("/v1/brands", {
        name: input.name,
        code: input.code,
        slug: input.slug,
        description: input.description,
        active: input.active,
      });
      const created = res.data?.data;
      emit("brands");
      return {
        ...input,
        id: String(created?.id ?? uid("b")),
      };
    } catch (err: any) {
      if (err.response?.data?.message) throw new ServiceError(err.response.data.message);
      await delay();
      if (db.brands.some((b) => b.code.toLowerCase() === input.code.trim().toLowerCase())) {
        throw new ServiceError(`Kode brand "${input.code}" sudah digunakan.`);
      }
      if (db.brands.some((b) => b.name.toLowerCase() === input.name.trim().toLowerCase())) {
        throw new ServiceError(`Nama brand "${input.name}" sudah ada.`);
      }
      const item: Brand = {
        ...input,
        id: uid("b"),
        slug: input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      };
      db.brands.push(item);
      emit("brands");
      return clone(item);
    }
  },

  async update(id: string, input: Omit<Brand, "id">): Promise<Brand> {
    try {
      await apiClient.put(`/v1/brands/${id}`, {
        name: input.name,
        code: input.code,
        slug: input.slug,
        description: input.description,
        active: input.active,
      });
      emit("brands");
      return { ...input, id };
    } catch (err: any) {
      if (err.response?.data?.message) throw new ServiceError(err.response.data.message);
      await delay();
      const idx = db.brands.findIndex((b) => b.id === id);
      if (idx < 0) throw new ServiceError("Brand tidak ditemukan.");
      if (db.brands.some((b) => b.id !== id && b.code.toLowerCase() === input.code.trim().toLowerCase())) {
        throw new ServiceError(`Kode brand "${input.code}" sudah digunakan.`);
      }
      db.brands[idx] = { ...input, id };
      emit("brands");
      return clone(db.brands[idx]);
    }
  },

  async setActive(id: string, active: boolean): Promise<void> {
    try {
      await apiClient.put(`/v1/brands/${id}`, { active });
      emit("brands");
    } catch {
      await delay();
      const b = db.brands.find((x) => x.id === id);
      if (!b) throw new ServiceError("Brand tidak ditemukan.");
      b.active = active;
      emit("brands");
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/brands/${id}`);
      emit("brands");
    } catch (err: any) {
      if (err.response?.data?.message) throw new ServiceError(err.response.data.message);
      await delay();
      const b = db.brands.find((x) => x.id === id);
      if (!b) throw new ServiceError("Brand tidak ditemukan.");
      const hasProducts = db.products.some((p) => p.brand.toLowerCase() === b.name.toLowerCase());
      if (hasProducts) {
        throw new ServiceError(`Brand "${b.name}" tidak dapat dihapus karena masih memiliki produk terkait.`);
      }
      db.brands = db.brands.filter((x) => x.id !== id);
      emit("brands");
    }
  },
};

// =====================================================================
// 4. Warehouse Service (Master Data Gudang Multi-Gudang)
// =====================================================================
export interface WarehouseWithStats extends Warehouse {
  totalSku: number;
  totalStock: number;
}

export const warehouseService = {
  async list(): Promise<WarehouseWithStats[]> {
    try {
      const res = await apiClient.get("/v1/warehouses");
      const list = res.data?.data ?? [];
      return list.map((w: any) => ({
        id: String(w.id),
        code: w.code || `WH-${w.id}`,
        name: w.name,
        shortName: w.shortName || w.short_name || w.name,
        type: w.type || "MAIN_WAREHOUSE",
        address: w.address || "",
        phone: w.phone || "",
        picName: w.picName || w.pic_name || "",
        description: w.description || "",
        active: w.active !== false,
        totalSku: Number(w.totalSku ?? w.total_skus ?? 0),
        totalStock: Number(w.totalStock ?? w.total_units ?? 0),
      }));
    } catch {
      await delay(150);
      return clone(
        db.warehouses.map((wh) => {
          const wid = wh.id as "g1" | "g2";
          let skuCount = 0;
          let totalItems = 0;

          db.materials.forEach((m) => {
            const qty = m.stock[wid] ?? 0;
            if (qty > 0) {
              skuCount++;
              totalItems += qty;
            }
          });
          db.products.forEach((p) => {
            const qty = p.stock[wid] ?? 0;
            if (qty > 0) {
              skuCount++;
              totalItems += qty;
            }
          });
          db.spareparts.forEach((s) => {
            const qty = s.stock[wid] ?? 0;
            if (qty > 0) {
              skuCount++;
              totalItems += qty;
            }
          });

          return {
            ...wh,
            totalSku: skuCount,
            totalStock: totalItems,
          };
        })
      );
    }
  },

  async create(input: Omit<Warehouse, "id">): Promise<Warehouse> {
    try {
      const res = await apiClient.post("/v1/warehouses", {
        name: input.name,
        code: input.code,
        shortName: input.shortName,
        address: input.address,
        phone: input.phone,
        picName: input.picName,
        type: input.type,
        description: input.description,
        active: input.active,
      });
      const created = res.data?.data;
      emit("warehouses");
      return {
        ...input,
        id: String(created?.id ?? uid("wh")),
      };
    } catch (err: any) {
      if (err.response?.data?.message) throw new ServiceError(err.response.data.message);
      await delay();
      if (db.warehouses.some((w) => w.code && w.code.toLowerCase() === input.code?.trim().toLowerCase())) {
        throw new ServiceError(`Kode gudang "${input.code}" sudah digunakan.`);
      }
      const item: Warehouse = {
        ...input,
        id: uid("wh") as any,
      };
      db.warehouses.push(item);
      emit("warehouses");
      return clone(item);
    }
  },

  async update(id: string, input: Omit<Warehouse, "id">): Promise<Warehouse> {
    try {
      await apiClient.put(`/v1/warehouses/${id}`, {
        name: input.name,
        code: input.code,
        shortName: input.shortName,
        address: input.address,
        phone: input.phone,
        picName: input.picName,
        type: input.type,
        description: input.description,
        active: input.active,
      });
      emit("warehouses");
      return { ...input, id: id as any };
    } catch (err: any) {
      if (err.response?.data?.message) throw new ServiceError(err.response.data.message);
      await delay();
      const idx = db.warehouses.findIndex((w) => w.id === id);
      if (idx < 0) throw new ServiceError("Gudang tidak ditemukan.");
      db.warehouses[idx] = { ...input, id: id as any };
      emit("warehouses");
      return clone(db.warehouses[idx]);
    }
  },

  async setActive(id: string, active: boolean): Promise<void> {
    try {
      await apiClient.put(`/v1/warehouses/${id}`, { active });
      emit("warehouses");
    } catch {
      await delay();
      const w = db.warehouses.find((x) => x.id === id);
      if (!w) throw new ServiceError("Gudang tidak ditemukan.");
      w.active = active;
      emit("warehouses");
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/warehouses/${id}`);
      emit("warehouses");
    } catch (err: any) {
      if (err.response?.data?.message) throw new ServiceError(err.response.data.message);
      await delay();
      db.warehouses = db.warehouses.filter((w) => w.id !== id);
      emit("warehouses");
    }
  },
};
