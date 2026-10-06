"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { type Column } from "@/components/ui/DataTable";
import FilterChips from "@/components/ui/FilterChips";
import StatusBadge from "@/components/ui/StatusBadge";
import Drawer from "@/components/ui/Drawer";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Can from "@/components/auth/Can";
import { btn, cx, inputBase } from "@/components/ui/styles";
import { useBrands, useCategories, useMovements, useProducts, useUnits, useWarehouses } from "@/hooks/useInventoryData";
import { productService } from "@/services/inventoryService";
import type { BrandName, Product, ProductType } from "@/types/inventory";
import { formatDateTime, formatNumber, totalStock } from "@/lib/inventoryUtils";
import { IconBox, IconEdit, IconEye, IconPlus, IconTrash } from "@/components/icons/Icons";

export default function ProductsPage() {
  const { data: products, loading, error, reload } = useProducts();
  const { data: categories } = useCategories("product");
  const { data: units } = useUnits();
  const brands = useBrands();
  const warehouses = useWarehouses();

  // Filters
  const [selectedBrand, setSelectedBrand] = useState<string>("Semua");
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");

  // Selection & Modals
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  // Form State
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState<BrandName>("Packsolution.id");
  const [type, setType] = useState<ProductType>("Barang Jadi");
  const [categoryId, setCategoryId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [stockG1, setStockG1] = useState(0);
  const [stockG2, setStockG2] = useState(0);
  const [minStock, setMinStock] = useState(100);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Detail movements
  const { data: movements } = useMovements("product", detailProduct?.id, 10);

  // Filtered dataset
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      // Dynamic brand filter
      if (selectedBrand !== "Semua") {
        if (p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
      }
      // Dynamic category filter (match ID or name)
      if (selectedCat !== "all") {
        const catObj = categories?.find((c) => c.id === selectedCat);
        const matchId = p.categoryId === selectedCat;
        const matchName =
          catObj &&
          (p.categoryId.toLowerCase().includes(catObj.name.toLowerCase().slice(0, 4)) ||
            catObj.name.toLowerCase().includes(p.categoryId.toLowerCase()));
        if (!matchId && !matchName) return false;
      }
      // Dynamic warehouse filter
      if (selectedWarehouse !== "all") {
        const wid = selectedWarehouse;
        const qty =
          (p.stock as any)[wid] ??
          (wid === "1" || wid === "g1" || wid === "WH-MAIN"
            ? p.stock.g1
            : wid === "2" || wid === "g2" || wid === "WH-RUKO"
            ? p.stock.g2
            : 0);
        if (qty <= 0) return false;
      }
      return true;
    });
  }, [products, selectedBrand, selectedCat, selectedWarehouse, categories]);

  const openAdd = () => {
    setSku("");
    setName("");
    setBrand("Packsolution.id");
    setType("Barang Jadi");
    setCategoryId(categories?.[0]?.id || "");
    setUnitId(units?.[0]?.id || "");
    setStockG1(0);
    setStockG2(0);
    setMinStock(100);
    setFormError(null);
    setIsAddOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setSku(p.sku);
    setName(p.name);
    setBrand(p.brand);
    setType(p.type);
    setCategoryId(p.categoryId);
    setUnitId(p.unitId);
    setStockG1(p.stock.g1);
    setStockG2(p.stock.g2);
    setMinStock(p.minStock);
    setFormError(null);
  };

  const handleSave = async () => {
    if (!sku.trim() || !name.trim()) {
      setFormError("Kode SKU dan Nama Produk wajib diisi.");
      return;
    }
    if (stockG1 < 0 || stockG2 < 0 || minStock < 0) {
      setFormError("Stok dan minimum stok tidak boleh bernilai negatif.");
      return;
    }

    setPending(true);
    setFormError(null);
    try {
      if (editProduct) {
        await productService.update(editProduct.id, {
          sku: sku.trim(),
          name: name.trim(),
          brand,
          type,
          categoryId: categoryId || categories?.[0]?.id || "",
          unitId: unitId || units?.[0]?.id || "",
          stock: { g1: stockG1, g2: stockG2 },
          minStock,
        });
        setEditProduct(null);
      } else {
        await productService.create({
          sku: sku.trim(),
          name: name.trim(),
          brand,
          type,
          categoryId: categoryId || categories?.[0]?.id || "",
          unitId: unitId || units?.[0]?.id || "",
          stock: { g1: stockG1, g2: stockG2 },
          minStock,
        });
        setIsAddOpen(false);
      }
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan produk.");
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    setPending(true);
    try {
      await productService.remove(deleteProduct.id);
      setDeleteProduct(null);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus produk.");
    } finally {
      setPending(false);
    }
  };

  const columns: Column<Product>[] = [
    {
      key: "sku",
      header: "Kode / SKU",
      sortable: true,
      className: "font-mono font-medium text-[#2B5FC7] dark:text-[#93B4F5] whitespace-nowrap",
      render: (p) => p.sku,
    },
    {
      key: "name",
      header: "Nama Produk",
      sortable: true,
      render: (p) => (
        <div>
          <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{p.name}</div>
          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">{p.type}</div>
        </div>
      ),
    },
    {
      key: "brand",
      header: "Brand",
      sortable: true,
      render: (p) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]">
          {p.brand}
        </span>
      ),
    },
    {
      key: "category",
      header: "Kategori",
      render: (p) => categories?.find((c) => c.id === p.categoryId)?.name ?? "-",
    },
    {
      key: "unit",
      header: "Satuan",
      render: (p) => units?.find((u) => u.id === p.unitId)?.abbr ?? "-",
    },
    {
      key: "stock_g1",
      header: "Gudang 1",
      align: "right",
      sortable: true,
      sortValue: (p) => p.stock.g1,
      render: (p) => formatNumber(p.stock.g1),
    },
    {
      key: "stock_g2",
      header: "Gudang 2",
      align: "right",
      sortable: true,
      sortValue: (p) => p.stock.g2,
      render: (p) => formatNumber(p.stock.g2),
    },
    {
      key: "total_stock",
      header: "Total Stok",
      align: "right",
      sortable: true,
      sortValue: (p) => totalStock(p.stock),
      render: (p) => <span className="font-bold">{formatNumber(totalStock(p.stock))}</span>,
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (p) => {
        const total = totalStock(p.stock);
        if (total === 0) return <StatusBadge tone="red" dot>Habis</StatusBadge>;
        if (total < p.minStock) return <StatusBadge tone="yellow" dot>Stok Rendah</StatusBadge>;
        return <StatusBadge tone="green" dot>Tersedia</StatusBadge>;
      },
    },
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      render: (p) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setDetailProduct(p)}
            className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#2B5FC7] hover:bg-[#EFF4FE] dark:hover:bg-[#1B2A44] transition-colors"
            title="Lihat Detail"
          >
            <IconEye size={16} />
          </button>
          <Can permission="inventory.products.edit">
            <button
              type="button"
              onClick={() => openEdit(p)}
              className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#2B5FC7] hover:bg-[#EFF4FE] dark:hover:bg-[#1B2A44] transition-colors"
              title="Edit Produk"
            >
              <IconEdit size={16} />
            </button>
          </Can>
          <Can permission="inventory.products.delete">
            <button
              type="button"
              onClick={() => setDeleteProduct(p)}
              className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#7F1D1D]/30 transition-colors"
              title="Hapus Produk"
            >
              <IconTrash size={16} />
            </button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Inventori Produk">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          eyebrow="Inventori Gudang"
          title="Produk Jadi & Setengah Jadi"
          subtitle="Manajemen stok produk jadi kemasan dan komponen setengah jadi multi-gudang"
          actions={
            <Can permission="inventory.products.create">
              <button type="button" onClick={openAdd} className={btn.primary}>
                <IconPlus size={15} strokeWidth={2.5} />
                <span>Tambah Produk</span>
              </button>
            </Can>
          }
        />

        {/* Brand & Category Filters Toolbar Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2 overflow-hidden">
            <FilterChips
              options={["Semua", ...brands]}
              value={selectedBrand}
              onChange={setSelectedBrand}
              label="Brand"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60">
            <div className="flex-1 min-w-[160px] sm:max-w-[220px]">
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className={cx(inputBase, "w-full text-xs h-9")}
                aria-label="Filter Kategori Produk"
              >
                <option value="all">Semua Kategori</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[140px] sm:max-w-[180px]">
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className={cx(inputBase, "w-full text-xs h-9")}
                aria-label="Filter Gudang"
              >
                <option value="all">Semua Gudang</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {(selectedBrand !== "Semua" || selectedCat !== "all" || selectedWarehouse !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand("Semua");
                  setSelectedCat("all");
                  setSelectedWarehouse("all");
                }}
                className="text-xs text-[#2B5FC7] dark:text-[#3B6FE0] hover:underline px-2 py-1.5 whitespace-nowrap font-medium"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredProducts}
          keyExtractor={(p) => p.id}
          loading={loading}
          error={error}
          onRetry={reload}
          searchPlaceholder="Cari nama produk, SKU, brand..."
          searchFilter={(p, q) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q)
          }
          defaultSort={{ key: "sku", direction: "asc" }}
          onRowClick={(p) => setDetailProduct(p)}
          emptyTitle="Belum Ada Produk"
          emptySubtitle="Belum ada produk yang sesuai dengan filter atau kata kunci pencarian."
        />

        {/* Drawer Detail */}
        <Drawer
          open={!!detailProduct}
          onClose={() => setDetailProduct(null)}
          title={detailProduct?.name || "Detail Produk"}
          subtitle={`SKU: ${detailProduct?.sku} · ${detailProduct?.brand}`}
          width="md"
        >
          {detailProduct && (
            <div className="space-y-6">
              {/* Ringkasan Stok Gudang */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7684] dark:text-[#8A94A6] mb-3">
                  Rincian Stok Multi-Gudang
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {warehouses.map((w) => (
                    <div
                      key={w.id}
                      className="p-3 rounded-xl border border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA] dark:bg-[#1B2A44]"
                    >
                      <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">{w.name}</div>
                      <div className="text-xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mt-1">
                        {formatNumber(detailProduct.stock[w.id])}{" "}
                        <span className="text-xs font-normal text-[#6B7684]">
                          {units?.find((u) => u.id === detailProduct.unitId)?.abbr}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 rounded-lg border border-[#D6E3FC] dark:border-[#26334D] bg-[#EFF4FE] dark:bg-[#1D4ED8]/15 flex justify-between items-center text-xs">
                  <span className="text-[#2B5FC7] dark:text-[#93B4F5] font-medium">Total Stok Seluruh Gudang:</span>
                  <span className="font-bold text-sm text-[#2B5FC7] dark:text-[#93B4F5]">
                    {formatNumber(totalStock(detailProduct.stock))}{" "}
                    {units?.find((u) => u.id === detailProduct.unitId)?.abbr}
                  </span>
                </div>
              </div>

              {/* Atribut Produk */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7684] dark:text-[#8A94A6] mb-2">
                  Informasi Produk
                </h4>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <dt className="text-[#6B7684] dark:text-[#8A94A6]">Tipe Produk</dt>
                    <dd className="font-medium mt-0.5">{detailProduct.type}</dd>
                  </div>
                  <div>
                    <dt className="text-[#6B7684] dark:text-[#8A94A6]">Kategori</dt>
                    <dd className="font-medium mt-0.5">
                      {categories?.find((c) => c.id === detailProduct.categoryId)?.name ?? "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#6B7684] dark:text-[#8A94A6]">Minimum Safety Stock</dt>
                    <dd className="font-medium mt-0.5">
                      {formatNumber(detailProduct.minStock)}{" "}
                      {units?.find((u) => u.id === detailProduct.unitId)?.abbr}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#6B7684] dark:text-[#8A94A6]">Satuan Dasar</dt>
                    <dd className="font-medium mt-0.5">
                      {units?.find((u) => u.id === detailProduct.unitId)?.name ?? "-"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Riwayat Mutasi Singkat */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7684] dark:text-[#8A94A6] mb-2">
                  Riwayat Mutasi Terakhir
                </h4>
                {movements && movements.length > 0 ? (
                  <div className="space-y-2">
                    {movements.map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-xs flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-medium">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] ${
                                m.type === "IN"
                                  ? "bg-[#ECFDF5] text-[#065F46] dark:bg-[#064E3B]/30 dark:text-[#34D399]"
                                  : m.type === "OUT"
                                  ? "bg-[#FEF2F2] text-[#991B1B] dark:bg-[#7F1D1D]/30 dark:text-[#F87171]"
                                  : "bg-[#EFF4FE] text-[#2B5FC7] dark:bg-[#1D4ED8]/25 dark:text-[#93C5FD]"
                              }`}
                            >
                              {m.type}
                            </span>
                            <span>{m.qty > 0 ? `+${m.qty}` : m.qty} unit</span>
                            <span className="text-[#6B7684] dark:text-[#8A94A6]">
                              ({warehouses.find((w) => w.id === m.warehouse)?.shortName}
                              {m.toWarehouse ? ` → ${warehouses.find((w) => w.id === m.toWarehouse)?.shortName}` : ""})
                            </span>
                          </div>
                          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                            {m.note || m.reference || "Tanpa catatan"} · {m.user}
                          </div>
                        </div>
                        <div className="text-[10px] text-[#6B7684] dark:text-[#8A94A6] text-right">
                          {formatDateTime(m.date)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#6B7684] dark:text-[#8A94A6] italic py-2">
                    Belum ada riwayat mutasi untuk produk ini.
                  </p>
                )}
              </div>
            </div>
          )}
        </Drawer>

        {/* Modal Tambah / Edit Produk */}
        <FormModal
          open={isAddOpen || !!editProduct}
          onClose={() => {
            setIsAddOpen(false);
            setEditProduct(null);
          }}
          title={editProduct ? "Edit Data Produk" : "Tambah Produk Baru"}
          subtitle="Lengkapi data spesifikasi dan alokasi stok produk"
          icon={<IconBox size={20} />}
          onSubmit={handleSave}
          submitLabel={editProduct ? "Simpan Perubahan" : "Tambah Produk"}
          pending={pending}
          error={formError}
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Kode / SKU <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Contoh: PS-HBX-GLD-01"
                  className={inputBase}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Brand Terkait <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value as BrandName)}
                  className={inputBase}
                >
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Nama Produk <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Hardbox Rigid Premium Gold 20x20"
                className={inputBase}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Tipe Produk</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ProductType)}
                  className={inputBase}
                >
                  <option value="Barang Jadi">Barang Jadi</option>
                  <option value="Setengah Jadi">Setengah Jadi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Kategori</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={inputBase}
                >
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Satuan Dasar</label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className={inputBase}
                >
                  {units?.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.abbr})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E2E6ED] dark:border-[#26334D]">
              <div className="text-xs font-semibold mb-2">Alokasi Stok Fisik Awal</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-[#6B7684] dark:text-[#8A94A6] mb-1">
                    Stok Gudang 1 (Utama)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockG1}
                    onChange={(e) => setStockG1(parseInt(e.target.value) || 0)}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#6B7684] dark:text-[#8A94A6] mb-1">
                    Stok Gudang 2 (Ruko)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockG2}
                    onChange={(e) => setStockG2(parseInt(e.target.value) || 0)}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#6B7684] dark:text-[#8A94A6] mb-1">
                    Safety Stock Minimal
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minStock}
                    onChange={(e) => setMinStock(parseInt(e.target.value) || 0)}
                    className={inputBase}
                  />
                </div>
              </div>
            </div>
          </div>
        </FormModal>

        {/* Dialog Konfirmasi Hapus */}
        <ConfirmDialog
          open={!!deleteProduct}
          onClose={() => setDeleteProduct(null)}
          onConfirm={handleDelete}
          title="Hapus Produk"
          message={
            <span>
              Apakah Anda yakin ingin menghapus produk <strong>{deleteProduct?.name}</strong> (
              {deleteProduct?.sku})? Tindakan ini tidak dapat dibatalkan.
            </span>
          }
          tone="danger"
          pending={pending}
        />
      </div>
    </DashboardLayout>
  );
}
