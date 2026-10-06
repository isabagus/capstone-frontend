"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { subscribe, type Topic } from "@/services/mockDb";
import type { CategoryKind, StockItemKind, Warehouse } from "@/types/inventory";
import {
  materialService,
  productService,
  productionService,
  sparepartService,
  stockService,
} from "@/services/inventoryService";
import { brandService, supplierService, unitService, warehouseService } from "@/services/masterService";
import { categoryService } from "@/services/categoryService";
import { BRANDS, WAREHOUSES } from "@/mocks/inventory";

// =====================================================================
// Data hooks — satu-satunya jembatan antara komponen UI dan service.
// Komponen tidak pernah mengimpor mock data / service secara langsung
// (kecuali konstanta statis seperti BRANDS & WAREHOUSES).
// =====================================================================

export interface ResourceState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Hook generik: memanggil `fetcher`, mengelola loading/error, dan
 * otomatis refetch saat topik terkait berubah (setelah mutasi).
 */
export function useResource<T>(fetcher: () => Promise<T>, topics: Topic[] = [], deps: unknown[] = []): ResourceState<T> {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const load = useCallback(async (silent = false) => {
    const id = ++reqId.current;
    if (!silent) {
      // Async state update avoids synchronous setState inside effect body
      queueMicrotask(() => setLoading(true));
    }
    try {
      const res = await fetcherRef.current();
      if (id === reqId.current) {
        setData(res);
        setError(null);
      }
    } catch (e: unknown) {
      if (id === reqId.current) {
        setError(e instanceof Error ? e.message : "Gagal memuat data.");
      }
    } finally {
      if (id === reqId.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    const id = ++reqId.current;
    
    fetcherRef
      .current()
      .then((res) => {
        if (active && id === reqId.current) {
          setData(res);
          setError(null);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (active && id === reqId.current) {
          setError(e instanceof Error ? e.message : "Gagal memuat data.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const topicKey = topics.join(",");
  useEffect(() => {
    if (!topicKey) return;
    return subscribe(topicKey.split(",") as Topic[], () => {
      load(true);
    });
  }, [topicKey, load]);

  return { data, loading, error, reload: () => load() };
}

// ---- Inventori ----
export const useProducts = () => useResource(productService.list, ["products"]);
export const useMaterials = () => useResource(materialService.list, ["materials"]);
export const useSpareparts = () => useResource(sparepartService.list, ["spareparts"]);
export const useProductionQueue = () => useResource(productionService.queue, []);

export function useMovements(itemKind?: StockItemKind, itemId?: string, limit?: number) {
  return useResource(
    () => stockService.movements({ itemKind, itemId, limit }),
    ["movements"],
    [itemKind, itemId, limit]
  );
}

// ---- Master ----
export const useSuppliers = () => useResource(supplierService.list, ["suppliers", "materials", "spareparts"]);
export const useBrandList = () => useResource(brandService.list, ["brands", "products", "materials"]);
export const useWarehouseList = () => useResource(warehouseService.list, ["warehouses", "materials", "products", "spareparts"]);
export const useUnits = () => useResource(unitService.list, ["units", "products", "materials", "spareparts"]);
export const useUnitConversions = () => useResource(unitService.conversions, ["units"]);

// ---- Kategori ----
export function useCategories(kind: CategoryKind) {
  return useResource(() => categoryService.list(kind), ["categories", "products", "materials", "spareparts"], [kind]);
}

// ---- Master Referensi Dinamis (Terhubung ke Master Data Live) ----
export function useBrands(): string[] {
  const { data } = useBrandList();
  return useMemo(() => {
    if (data && data.length > 0) {
      return data.filter((b) => b.active !== false).map((b) => b.name);
    }
    return BRANDS;
  }, [data]);
}

export function useWarehouses(): Warehouse[] {
  const { data } = useWarehouseList();
  return useMemo(() => {
    if (data && data.length > 0) {
      return data.filter((w) => w.active !== false);
    }
    return WAREHOUSES;
  }, [data]);
}

/**
 * Helper mutasi: menjalankan aksi async dengan state `pending` & `error`.
 */
export function useMutation<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(
    async (...args: A): Promise<R | undefined> => {
      setPending(true);
      setError(null);
      try {
        return await fn(...args);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
        return undefined;
      } finally {
        setPending(false);
      }
    },
    [fn]
  );
  return { run, pending, error, setError };
}
