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
import { useWarehouseList } from "@/hooks/useInventoryData";
import { warehouseService, type WarehouseWithStats } from "@/services/masterService";
import {
  IconBox,
  IconEdit,
  IconEye,
  IconLayers,
  IconPlus,
  IconPower,
  IconWarehouse,
} from "@/components/icons/Icons";

export default function WarehousesPage() {
  const { data: warehouses, loading, error, reload } = useWarehouseList();

  // Modals & Drawers
  const [detailWarehouse, setDetailWarehouse] = useState<WarehouseWithStats | null>(null);
  const [editWarehouse, setEditWarehouse] = useState<WarehouseWithStats | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toggleWarehouse, setToggleWarehouse] = useState<WarehouseWithStats | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [type, setType] = useState<"MAIN_WAREHOUSE" | "STORE_WAREHOUSE" | "OTHER">("MAIN_WAREHOUSE");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [picName, setPicName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const openAdd = () => {
    setCode("");
    setName("");
    setShortName("");
    setType("MAIN_WAREHOUSE");
    setAddress("");
    setPhone("");
    setPicName("");
    setDescription("");
    setActive(true);
    setFormError(null);
    setIsAddOpen(true);
  };

  const openEdit = (w: WarehouseWithStats) => {
    setEditWarehouse(w);
    setCode(w.code || "");
    setName(w.name);
    setShortName(w.shortName);
    setType(w.type || "MAIN_WAREHOUSE");
    setAddress(w.address || "");
    setPhone(w.phone || "");
    setPicName(w.picName || "");
    setDescription(w.description || "");
    setActive(w.active !== false);
    setFormError(null);
  };

  const handleSave = async () => {
    if (!name.trim() || !shortName.trim()) {
      setFormError("Nama Gudang dan Nama Singkat wajib diisi.");
      return;
    }
    setPending(true);
    setFormError(null);
    try {
      const payload = {
        code: code.trim().toUpperCase() || undefined,
        name: name.trim(),
        shortName: shortName.trim(),
        type,
        address: address.trim(),
        phone: phone.trim(),
        picName: picName.trim(),
        description: description.trim(),
        active,
      };

      if (editWarehouse) {
        await warehouseService.update(editWarehouse.id, payload);
        setEditWarehouse(null);
      } else {
        await warehouseService.create(payload);
        setIsAddOpen(false);
      }
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan data gudang.");
    } finally {
      setPending(false);
    }
  };

  const handleToggleActive = async () => {
    if (!toggleWarehouse) return;
    setPending(true);
    try {
      await warehouseService.setActive(toggleWarehouse.id, !(toggleWarehouse.active !== false));
      setToggleWarehouse(null);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengubah status gudang.");
    } finally {
      setPending(false);
    }
  };

  // Stat calculations
  const totalGudang = warehouses?.length ?? 0;
  const activeGudang = warehouses?.filter((w) => w.active !== false).length ?? 0;
  const totalSku = warehouses?.reduce((acc, w) => acc + (w.totalSku || 0), 0) ?? 0;
  const totalStockItems = warehouses?.reduce((acc, w) => acc + (w.totalStock || 0), 0) ?? 0;

  // Table Columns
  const columns: Column<WarehouseWithStats>[] = [
    {
      key: "code",
      header: "Kode",
      sortable: true,
      className: "w-28",
      render: (w) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-[#EEF2F6] dark:bg-[#1E293B] text-[#1E293B] dark:text-[#E2E8F0] border border-[#CBD5E1] dark:border-[#334155]">
          {w.code || w.id.toUpperCase()}
        </span>
      ),
    },
    {
      key: "name",
      header: "Nama Gudang",
      sortable: true,
      render: (w) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
            <IconWarehouse size={16} />
          </div>
          <div>
            <div className="font-semibold text-xs text-[#1E293B] dark:text-[#F1F5F9]">
              {w.name}
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Alias: <span className="font-medium text-[#334155] dark:text-[#CBD5E1]">{w.shortName}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Tipe / Peruntukan",
      sortable: true,
      className: "w-40",
      render: (w) => {
        const isMain = w.type === "MAIN_WAREHOUSE" || w.id === "g1";
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
              isMain
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900"
                : "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900"
            }`}
          >
            {isMain ? "Pabrik / Utama" : "Toko / Ruko"}
          </span>
        );
      },
    },
    {
      key: "address",
      header: "Lokasi & PIC",
      render: (w) => (
        <div>
          <p className="text-xs text-[#1E293B] dark:text-[#E2E8F0] line-clamp-1">
            {w.address || "—"}
          </p>
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            PIC: <span className="font-medium">{w.picName || "Staff Gudang"}</span>
            {w.phone && ` · ${w.phone}`}
          </p>
        </div>
      ),
    },
    {
      key: "stock",
      header: "Kapasitas & Stok",
      sortable: true,
      render: (w) => (
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <IconBox size={12} /> {w.totalSku || 0} SKU
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            <IconLayers size={12} /> {(w.totalStock || 0).toLocaleString("id-ID")} Unit/Pcs
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      className: "w-28",
      render: (w) => (
        <StatusBadge tone={w.active !== false ? "green" : "gray"} dot>
          {w.active !== false ? "Aktif" : "Nonaktif"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      className: "text-right w-32",
      align: "right",
      render: (w) => (
        <div
          className="flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setDetailWarehouse(w)}
            title="Lihat Detail"
            className="p-1.5 rounded text-[#64748B] hover:text-[#2563EB] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
          >
            <IconEye size={15} />
          </button>
          <Can permission="master.warehouses.edit">
            <button
              type="button"
              onClick={() => openEdit(w)}
              title="Edit Gudang"
              className="p-1.5 rounded text-[#64748B] hover:text-[#2563EB] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
            >
              <IconEdit size={15} />
            </button>
          </Can>
          <Can permission="master.warehouses.delete">
            <button
              type="button"
              onClick={() => setToggleWarehouse(w)}
              title={w.active !== false ? "Nonaktifkan Gudang" : "Aktifkan Gudang"}
              className={`p-1.5 rounded transition-colors ${
                w.active !== false
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
    <DashboardLayout title="Master Gudang">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <PageHeader
          eyebrow="Master Data"
          title="Master Data Gudang"
          subtitle="Manajemen lokasi pergudangan fisik (Pabrik & Ruko) untuk pencatatan mutasi multi-gudang"
          actions={
            <Can permission="master.warehouses.create">
              <button type="button" onClick={openAdd} className={btn.primary}>
                <IconPlus size={14} strokeWidth={2.5} />
                <span>Tambah Gudang</span>
              </button>
            </Can>
          }
        />

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Gudang"
            value={totalGudang}
            icon={<IconWarehouse size={18} />}
            desc="Lokasi fisik pergudangan"
          />
          <StatCard
            title="Gudang Beroperasi"
            value={activeGudang}
            icon={<IconWarehouse size={18} />}
            desc="Aktif melayani mutasi"
          />
          <StatCard
            title="Total Jenis SKU"
            value={totalSku}
            icon={<IconBox size={18} />}
            desc="Ragam SKU tersebar di gudang"
          />
          <StatCard
            title="Total Volume Stok"
            value={totalStockItems.toLocaleString("id-ID")}
            icon={<IconLayers size={18} />}
            desc="Fisik unit barang tersimpan"
          />
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={warehouses}
          keyExtractor={(w) => w.id}
          loading={loading}
          error={error}
          onRetry={reload}
          searchPlaceholder="Cari gudang, alamat, PIC..."
          searchFilter={(w, q) =>
            w.name.toLowerCase().includes(q) ||
            w.shortName.toLowerCase().includes(q) ||
            Boolean(w.code && w.code.toLowerCase().includes(q)) ||
            Boolean(w.address && w.address.toLowerCase().includes(q)) ||
            Boolean(w.picName && w.picName.toLowerCase().includes(q))
          }
          defaultSort={{ key: "name", direction: "asc" }}
          onRowClick={(w) => setDetailWarehouse(w)}
          emptyTitle="Belum Ada Gudang"
          emptySubtitle="Tambahkan gudang fisik untuk memulai pencatatan mutasi dan transfer antar-gudang."
        />

        {/* Modal Form Tambah / Edit */}
        <FormModal
          open={isAddOpen || !!editWarehouse}
          onClose={() => {
            setIsAddOpen(false);
            setEditWarehouse(null);
          }}
          title={editWarehouse ? "Edit Data Gudang" : "Tambah Gudang Baru"}
          subtitle="Informasi lokasi dan PIC penanggung jawab operasional gudang."
          icon={<IconWarehouse size={20} />}
          onSubmit={handleSave}
          pending={pending}
          submitLabel={editWarehouse ? "Simpan Perubahan" : "Tambah Gudang"}
          error={formError}
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0] mb-1.5">
                  Kode Gudang
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: GD-01, GD-02"
                  className={inputBase}
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0] mb-1.5">
                  Tipe Fasilitas <span className="text-rose-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className={inputBase}
                >
                  <option value="MAIN_WAREHOUSE">Gudang Pabrik / Utama</option>
                  <option value="STORE_WAREHOUSE">Gudang Toko / Ruko Penyangga</option>
                  <option value="OTHER">Fasilitas Lainnya</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0] mb-1.5">
                  Nama Lengkap Gudang <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Gudang 1 (Utama / Pabrik)"
                  className={inputBase}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0] mb-1.5">
                  Nama Singkat (Label Tab) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="Contoh: Gudang 1"
                  className={inputBase}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0] mb-1.5">
                  Nama PIC Penanggung Jawab
                </label>
                <input
                  type="text"
                  value={picName}
                  onChange={(e) => setPicName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className={inputBase}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0] mb-1.5">
                  No. Telepon / WhatsApp Gudang
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 031-8987654 / 08123456789"
                  className={inputBase}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0] mb-1.5">
                Alamat Fisik Gudang
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat lengkap, kawasan industri / ruko, kota..."
                className={inputBase}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0] mb-1.5">
                Deskripsi & Peruntukan
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jenis material yang disimpan, akses kendaraan, dll..."
                className={inputBase}
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#334155]">
              <input
                type="checkbox"
                id="warehouse-active-toggle"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-[#CBD5E1] dark:border-[#475569]"
              />
              <label
                htmlFor="warehouse-active-toggle"
                className="text-xs font-medium text-[#1E293B] dark:text-[#E2E8F0] cursor-pointer"
              >
                Gudang Aktif Beroperasi (Dapat dipilih pada mutasi masuk, keluar, dan transfer)
              </label>
            </div>
          </div>
        </FormModal>

        {/* Drawer Detail */}
        <Drawer
          open={!!detailWarehouse}
          onClose={() => setDetailWarehouse(null)}
          title={detailWarehouse?.name || "Detail Gudang"}
          subtitle={`Kode: ${detailWarehouse?.code || detailWarehouse?.id.toUpperCase()} · ${detailWarehouse?.active !== false ? "Status Aktif" : "Status Nonaktif"}`}
          width="md"
          footer={
            detailWarehouse && (
              <div className="flex justify-between items-center w-full">
                <Can permission="master.warehouses.delete">
                  <button
                    type="button"
                    onClick={() => {
                      const w = detailWarehouse;
                      setDetailWarehouse(null);
                      setToggleWarehouse(w);
                    }}
                    className={btn.ghost}
                  >
                    {detailWarehouse.active !== false ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                </Can>
                <Can permission="master.warehouses.edit">
                  <button
                    type="button"
                    onClick={() => {
                      const w = detailWarehouse;
                      setDetailWarehouse(null);
                      openEdit(w);
                    }}
                    className={btn.primary}
                  >
                    <IconEdit size={14} />
                    <span>Edit Gudang</span>
                  </button>
                </Can>
              </div>
            )
          }
        >
          {detailWarehouse && (
            <div className="space-y-6">
              {/* Info Card */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/70 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">Kode Gudang</span>
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-[#F1F5F9]">
                    {detailWarehouse.code || detailWarehouse.id.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">Tipe Fasilitas</span>
                  <span className="text-xs font-semibold text-[#1E293B] dark:text-[#E2E8F0]">
                    {detailWarehouse.type === "MAIN_WAREHOUSE" || detailWarehouse.id === "g1"
                      ? "Pabrik / Gudang Utama"
                      : "Toko / Ruko Penyangga"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">PIC Operasional</span>
                  <span className="text-xs font-medium text-[#1E293B] dark:text-[#E2E8F0]">
                    {detailWarehouse.picName || "Staff Gudang"} {detailWarehouse.phone && `(${detailWarehouse.phone})`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">Status Operasional</span>
                  <StatusBadge tone={detailWarehouse.active !== false ? "green" : "gray"} dot>
                    {detailWarehouse.active !== false ? "Aktif" : "Nonaktif"}
                  </StatusBadge>
                </div>
              </div>

              {/* Alamat Fisik */}
              <div>
                <h4 className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                  Alamat Fisik
                </h4>
                <div className="p-3.5 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs text-[#334155] dark:text-[#E2E8F0] leading-relaxed">
                  {detailWarehouse.address || "Belum ada alamat terdaftar."}
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <h4 className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                  Keterangan & Peruntukan
                </h4>
                <div className="p-3.5 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs text-[#334155] dark:text-[#E2E8F0] leading-relaxed">
                  {detailWarehouse.description || "Tidak ada keterangan tambahan."}
                </div>
              </div>

              {/* Statistik Stok */}
              <div>
                <h4 className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                  Statistik Persediaan
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#EFF6FF] dark:bg-[#1E2A4A] border border-[#BFDBFE] dark:border-[#2563EB]/40">
                    <div className="text-[11px] text-[#2563EB] dark:text-[#93C5FD]">Total Ragam SKU</div>
                    <div className="text-lg font-bold text-[#1E3A8A] dark:text-[#BFDBFE]">
                      {detailWarehouse.totalSku || 0} SKU
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#ECFDF5] dark:bg-[#064E3B]/30 border border-[#A7F3D0] dark:border-[#059669]/40">
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400">Total Fisik Barang</div>
                    <div className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                      {(detailWarehouse.totalStock || 0).toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                💡 Seluruh mutasi barang masuk, barang keluar, dan transfer stok otomatis terekam dalam kartu stok gudang ini.
              </div>
            </div>
          )}
        </Drawer>

        {/* Confirm Dialog Toggle Status */}
        <ConfirmDialog
          open={!!toggleWarehouse}
          onClose={() => setToggleWarehouse(null)}
          onConfirm={handleToggleActive}
          title={toggleWarehouse?.active !== false ? "Nonaktifkan Gudang?" : "Aktifkan Gudang?"}
          message={
            <span>
              Gudang <strong>{toggleWarehouse?.name}</strong> akan{" "}
              {toggleWarehouse?.active !== false
                ? "dinonaktifkan dari pilihan transfer stok baru. Data persediaan yang ada tetap tercatat aman."
                : "diaktifkan kembali untuk operasional mutasi stok."}
            </span>
          }
          confirmLabel={toggleWarehouse?.active !== false ? "Ya, Nonaktifkan" : "Ya, Aktifkan"}
          tone={toggleWarehouse?.active !== false ? "danger" : "primary"}
          pending={pending}
        />
      </div>
    </DashboardLayout>
  );
}
