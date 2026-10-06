import apiClient from "@/lib/apiClient";
import type { Category, CategoryKind } from "@/types/inventory";
import { clone, db, delay, emit, ServiceError, uid } from "./mockDb";

// =====================================================================
// Category Service — satu service untuk 3 jenis kategori (Bahan, Produk, Sparepart).
// Terhubung langsung ke PostgreSQL API (/v1/categories?kind=product|material|sparepart)
// =====================================================================

export interface CategoryWithCount extends Category {
  itemCount: number;
}

function countItems(cat: Category): number {
  switch (cat.kind) {
    case "product":
      return db.products.filter((p) => p.categoryId === cat.id).length;
    case "material":
      return db.materials.filter((m) => m.categoryId === cat.id).length;
    case "sparepart":
      return db.spareparts.filter((s) => s.categoryId === cat.id).length;
  }
}

export const categoryService = {
  async list(kind: CategoryKind): Promise<CategoryWithCount[]> {
    try {
      const res = await apiClient.get(`/v1/categories?kind=${kind}`);
      const list = res.data?.data ?? [];
      return list.map((c: any) => ({
        id: String(c.id),
        name: c.name,
        kind: (c.kind as CategoryKind) || kind,
        description: c.description || "",
        active: c.active !== false && c.is_active !== false,
        itemCount: Number(c.itemCount ?? c.materials_count ?? 0),
      }));
    } catch {
      await delay(150);
      return clone(
        db.categories.filter((c) => c.kind === kind).map((c) => ({ ...c, itemCount: countItems(c) }))
      );
    }
  },

  async create(input: Omit<Category, "id">): Promise<Category> {
    try {
      const res = await apiClient.post("/v1/categories", {
        name: input.name,
        kind: input.kind,
        description: input.description,
        active: input.active,
      });
      const c = res.data?.data;
      emit("categories");
      return {
        ...input,
        id: String(c?.id ?? uid("c")),
      };
    } catch (err: any) {
      if (err.response?.data?.message) throw new ServiceError(err.response.data.message);
      await delay();
      const dup = db.categories.some(
        (c) => c.kind === input.kind && c.name.toLowerCase() === input.name.trim().toLowerCase()
      );
      if (dup) throw new ServiceError(`Kategori "${input.name}" sudah ada.`);
      const item: Category = { ...input, id: uid("c") };
      db.categories.push(item);
      emit("categories");
      return clone(item);
    }
  },

  async update(id: string, input: Omit<Category, "id">): Promise<Category> {
    try {
      await apiClient.put(`/v1/categories/${id}`, {
        name: input.name,
        kind: input.kind,
        description: input.description,
        active: input.active,
      });
      emit("categories");
      return { ...input, id };
    } catch (err: any) {
      if (err.response?.data?.message) throw new ServiceError(err.response.data.message);
      await delay();
      const idx = db.categories.findIndex((c) => c.id === id);
      if (idx < 0) throw new ServiceError("Kategori tidak ditemukan.");
      const dup = db.categories.some(
        (c) => c.id !== id && c.kind === input.kind && c.name.toLowerCase() === input.name.trim().toLowerCase()
      );
      if (dup) throw new ServiceError(`Kategori "${input.name}" sudah ada.`);
      db.categories[idx] = { ...input, id };
      emit("categories");
      return clone(db.categories[idx]);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/categories/${id}`);
      emit("categories");
    } catch (err: any) {
      if (err.response?.data?.message) throw new ServiceError(err.response.data.message);
      await delay();
      const cat = db.categories.find((c) => c.id === id);
      if (!cat) throw new ServiceError("Kategori tidak ditemukan.");
      const used = countItems(cat);
      if (used > 0) {
        throw new ServiceError(
          `Kategori "${cat.name}" masih dipakai oleh ${used} item. Pindahkan item ke kategori lain atau nonaktifkan kategori ini.`
        );
      }
      db.categories = db.categories.filter((c) => c.id !== id);
      emit("categories");
    }
  },
};
