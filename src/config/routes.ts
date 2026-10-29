// =====================================================================
// Named routes (berkelompok) — gunakan `route("inventory.materials")`
// alih-alih menulis path literal di komponen.
// =====================================================================

export const ROUTES = {
  dashboard: "/dashboard",
  "inventory.materials": "/dashboard/inventory/materials",
  "inventory.spareparts": "/dashboard/inventory/spareparts",
  "inventory.products": "/dashboard/inventory/products",
  "transaction.history": "/dashboard/transaction",
  "transaction.in": "/dashboard/transaction/in",
  "transaction.out": "/dashboard/transaction/out",
  "transaction.transfer": "/dashboard/transaction/transfer",
  "transaction.opname": "/dashboard/transaction/opname",
  "master.suppliers": "/dashboard/master/suppliers",
  "master.brands": "/dashboard/master/brands",
  "master.warehouses": "/dashboard/master/warehouses",
  "master.units": "/dashboard/master/units",
  "master.categories": "/dashboard/category",
  "category.materials": "/dashboard/category/materials",
  "category.spareparts": "/dashboard/category/spareparts",
  "category.products": "/dashboard/category/products",
} as const;

export type RouteName = keyof typeof ROUTES;

export function route(
  name: RouteName,
  query?: Record<string, string | number | boolean | undefined>
): string {
  const base = ROUTES[name];
  if (!query) return base;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== false) params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
