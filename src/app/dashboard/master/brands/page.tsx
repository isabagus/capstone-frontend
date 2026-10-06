"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { type Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import StatCard from "@/components/ui/StatCard";
import Drawer from "@/components/ui/Drawer";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Can from "@/components/auth/Can";
import { btn, inputBase } from "@/components/ui/styles";
import { useBrandList } from "@/hooks/useInventoryData";
import { brandService, type BrandWithUsage } from "@/services/masterService";
import {
  IconBox,
  IconEdit,
  IconEye,
  IconLayers,
  IconPlus,
  IconPower,
  IconTag,
} from "@/components/icons/Icons";

export default function BrandsPage() {
  const { data: brands, loading, error, reload } = useBrandList();

  // Modals & Drawers
  const [detailBrand, setDetailBrand] = useState<BrandWithUsage | null>(null);
  const [editBrand, setEditBrand] = useState<BrandWithUsage | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toggleBrand, setToggleBrand] = useState<BrandWithUsage | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const openAdd = () => {
    setName("");
    setCode("");
    setSlug("");
    setDescription("");
    setActive(true);
    setFormError(null);
    setIsAddOpen(true);
  };

  const openEdit = (b: BrandWithUsage) => {
    setEditBrand(b);
    setName(b.name);
    setCode(b.code);
    setSlug(b.slug || "");
    setDescription(b.description || "");
    setActive(b.active);
    setFormError(null);
  };

  const handleSave = async () => {
    if (!name.trim() || !code.trim()) {
      setFormError("Nama Brand dan Kode Brand wajib diisi.");
      return;
    }
    setPending(true);
    setFormError(null);
    try {
      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        slug: slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: description.trim(),
        active,
      };

      if (editBrand) {
        await brandService.update(editBrand.id, payload);
        setEditBrand(null);
      } else {
        await brandService.create(payload);
        setIsAddOpen(false);
      }
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan data brand.");
    } finally {
      setPending(false);
    }
  };

  const handleToggleActive = async () => {
    if (!toggleBrand) return;
    setPending(true);
    try {
      await brandService.setActive(toggleBrand.id, !toggleBrand.active);
      setToggleBrand(null);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengubah status brand.");
    } finally {
      setPending(false);
    }
  };

  // Stat calculations
  const totalBrands = brands?.length ?? 0;
  const activeBrands = brands?.filter((b) => b.active).length ?? 0;
  const totalProducts = brands?.reduce((acc, b) => acc + (b.productCount || 0), 0) ?? 0;
  const totalMaterials = brands?.reduce((acc, b) => acc + (b.materialCount || 0), 0) ?? 0;

  // Table Columns
  const columns: Column<BrandWithUsage>[] = [
    {
      key: "code",
      header: "Kode",
      sortable: true,
      className: "w-28",
      render: (b) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-[#EEF2F6] dark:bg-[#1E293B] text-[#1E293B] dark:text-[#E2E8F0] border border-[#CBD5E1] dark:border-[#334155]">
          {b.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Nama Brand",
      sortable: true,
      render: (b) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] dark:bg-[#1E2A4A] border border-[#BFDBFE] dark:border-[#2563EB]/40 flex items-center justify-center text-[#2563EB] dark:text-[#60A5FA] flex-shrink-0 font-bold text-xs">
            {b.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-xs text-[#1E293B] dark:text-[#F1F5F9]">
              {b.name}
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono">
              slug: {b.slug || b.name.toLowerCase()}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Fokus / Deskripsi",
      render: (b) => (
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm line-clamp-1">
          {b.description || "—"}
        </p>
      ),
    },
    {
      key: "catalog",
      header: "Katalog Terkait",
      sortable: true,
      render: (b) => (
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            <IconBox size={12} /> {b.productCount || 0} Produk
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            <IconLayers size={12} /> {b.materialCount || 0} Material
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      className: "w-28",
      render: (b) => (
        <StatusBadge tone={b.active ? "green" : "gray"} dot>
          {b.active ? "Aktif" : "Nonaktif"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      className: "text-right w-32",
      align: "right",
      render: (b) => (
        <div
          className="flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setDetailBrand(b)}
            title="Lihat Detail"
            className="p-1.5 rounded text-[#64748B] hover:text-[#2563EB] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
          >
            <IconEye size={15} />
          </button>
          <Can permission="master.brands.edit">
            <button
              type="button"
              onClick={() => openEdit(b)}
              title="Edit Brand"
              className="p-1.5 rounded text-[#64748B] hover:text-[#2563EB] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
            >
              <IconEdit size={15} />
            </button>
          </Can>
          <Can permission="master.brands.delete">
            <button
              type="button"
              onClick={() => setToggleBrand(b)}
              title={b.active ? "Nonaktifkan Brand" : "Aktifkan Brand"}
              className={`p-1.5 rounded transition-colors ${
                b.active
                  ? "text-[#64748B] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  : "text-[#64748B] hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              }`}
            >
              <IconPower size={15} />
            </button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Master Brand">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <PageHeader
          eyebrow="Master Data"
          title="Master Data Brand"
          subtitle="Manajemen 5 brand percetakan & lini produk resmi CV Solusi Inovasi Packaging"
          actions={
            <Can permission="master.brands.create">
              <button type="button" onClick={openAdd} className={btn.primary}>
                <IconPlus size={14} strokeWidth={2.5} />
                <span>Tambah Brand</span>
              </button>
            </Can>
          }
        />

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Brand"
            value={totalBrands}
            icon={<IconTag size={18} />}
            desc="Portofolio resmi perusahaan"
          />
          <StatCard
            title="Brand Aktif"
            value={activeBrands}
            icon={<IconTag size={18} />}
            desc="Dapat digunakan pada order"
          />
          <StatCard
            title="Total SKU Produk"
            value={totalProducts}
            icon={<IconBox size={18} />}
            desc="Katalog produk jadi terdaftar"
          />
          <StatCard
            title="Bahan Baku Terhubung"
            value={totalMaterials}
            icon={<IconLayers size={18} />}
            desc="Material spesifik per brand"
          />
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={brands}
          keyExtractor={(b) => b.id}
          loading={loading}
          error={error}
          onRetry={reload}
          searchPlaceholder="Cari brand, kode, atau slug..."
          searchFilter={(b, q) =>
            b.name.toLowerCase().includes(q) ||
            b.code.toLowerCase().includes(q) ||
            Boolean(b.slug && b.slug.toLowerCase().includes(q)) ||
            Boolean(b.description && b.description.toLowerCase().includes(q))
          }
          defaultSort={{ key: "name", direction: "asc" }}
          onRowClick={(b) => setDetailBrand(b)}
          emptyTitle="Belum Ada Brand"
          emptySubtitle="Tambahkan brand resmi perusahaan untuk mengelompokkan katalog produk dan alokasi pesanan."
        />

        {/* Modal Form Tambah / Edit */}
        <FormModal
          open={isAddOpen || !!editBrand}
          onClose={() => {
            setIsAddOpen(false);
            setEditBrand(null);
          }}
          title={editBrand ? "Edit Data Brand" : "Tambah Brand Baru"}
          subtitle="Pastikan kode brand unik dan mudah diidentifikasi pada SPK dan invoice."
          icon={<IconTag size={20} />}
          onSubmit={handleSave}
          pending={pending}
          submitLabel={editBrand ? "Simpan Perubahan" : "Tambah Brand"}
          error={formError}
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0] mb-1.5">
                  Kode Brand <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: PACK, EST, PEPI"
                  className={inputBase}
                  maxLength={10}
                  required
                />
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 font-mono">
                  Maksimal 10 karakter kapital.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0] mb-1.5">
                  Nama Brand <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editBrand && !slug) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }
                  }}
                  placeholder="Contoh: Packsolution.id"
                  className={inputBase}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0] mb-1.5">
                Slug (URL Identifier)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="packsolution-id"
                className={inputBase}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0] mb-1.5">
                Deskripsi & Fokus Segmen Pasar
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Spesialisasi brand (misal: packaging custom makanan, digital print merch, undangan pernikahan)..."
                className={inputBase}
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#334155]">
              <input
                type="checkbox"
                id="brand-active-toggle"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-[#CBD5E1] dark:border-[#475569]"
              />
              <label
                htmlFor="brand-active-toggle"
                className="text-xs font-medium text-[#1E293B] dark:text-[#E2E8F0] cursor-pointer"
              >
                Brand Aktif (Dapat dipilih saat membuat pesanan, SPK, dan filter katalog)
              </label>
            </div>
          </div>
        </FormModal>

        {/* Drawer Detail */}
        <Drawer
          open={!!detailBrand}
          onClose={() => setDetailBrand(null)}
          title={detailBrand?.name || "Detail Brand"}
          subtitle={`Kode: ${detailBrand?.code} · ${detailBrand?.active ? "Status Aktif" : "Status Nonaktif"}`}
          width="md"
          footer={
            detailBrand && (
              <div className="flex justify-between items-center w-full">
                <Can permission="master.brands.delete">
                  <button
                    type="button"
                    onClick={() => {
                      const b = detailBrand;
                      setDetailBrand(null);
                      setToggleBrand(b);
                    }}
                    className={btn.ghost}
                  >
                    {detailBrand.active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                </Can>
                <Can permission="master.brands.edit">
                  <button
                    type="button"
                    onClick={() => {
                      const b = detailBrand;
                      setDetailBrand(null);
                      openEdit(b);
                    }}
                    className={btn.primary}
                  >
                    <IconEdit size={14} />
                    <span>Edit Brand</span>
                  </button>
                </Can>
              </div>
            )
          }
        >
          {detailBrand && (
            <div className="space-y-6">
              {/* Info Card */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/70 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">Kode Brand</span>
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-[#F1F5F9]">
                    {detailBrand.code}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">Slug</span>
                  <span className="font-mono text-xs text-[#334155] dark:text-[#CBD5E1]">
                    {detailBrand.slug || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">Status Operasional</span>
                  <StatusBadge tone={detailBrand.active ? "green" : "gray"} dot>
                    {detailBrand.active ? "Aktif" : "Nonaktif"}
                  </StatusBadge>
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <h4 className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                  Fokus & Keterangan
                </h4>
                <div className="p-3.5 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs text-[#334155] dark:text-[#E2E8F0] leading-relaxed">
                  {detailBrand.description || "Tidak ada keterangan tambahan."}
                </div>
              </div>

              {/* Statistik Terkait */}
              <div>
                <h4 className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                  Statistik Portofolio
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#EFF6FF] dark:bg-[#1E2A4A] border border-[#BFDBFE] dark:border-[#2563EB]/40">
                    <div className="text-[11px] text-[#2563EB] dark:text-[#93C5FD]">Total SKU Produk</div>
                    <div className="text-lg font-bold text-[#1E3A8A] dark:text-[#BFDBFE]">
                      {detailBrand.productCount || 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FFFBEB] dark:bg-[#2A2415] border border-[#FDE68A] dark:border-[#D97706]/40">
                    <div className="text-[11px] text-[#D97706] dark:text-[#FCD34D]">Bahan Baku Terhubung</div>
                    <div className="text-lg font-bold text-[#78350F] dark:text-[#FDE68A]">
                      {detailBrand.materialCount || 0}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                💡 Brand ini otomatis terintegrasi ke seluruh modul FO (Front Office Order), perhitungan BOM, dan SPK Percetakan.
              </div>
            </div>
          )}
        </Drawer>

        {/* Confirm Dialog Toggle Status */}
        <ConfirmDialog
          open={!!toggleBrand}
          onClose={() => setToggleBrand(null)}
          onConfirm={handleToggleActive}
          title={toggleBrand?.active ? "Nonaktifkan Brand?" : "Aktifkan Brand?"}
          message={
            <span>
              Brand <strong>{toggleBrand?.name}</strong> akan{" "}
              {toggleBrand?.active
                ? "disembunyikan dari pilihan pesanan baru. Data riwayat transaksi tetap aman."
                : "diaktifkan kembali dan dapat dipilih pada pesanan dan filter katalog."}
            </span>
          }
          confirmLabel={toggleBrand?.active ? "Ya, Nonaktifkan" : "Ya, Aktifkan"}
          tone={toggleBrand?.active ? "danger" : "primary"}
          pending={pending}
        />
      </div>
    </DashboardLayout>
  );
}
