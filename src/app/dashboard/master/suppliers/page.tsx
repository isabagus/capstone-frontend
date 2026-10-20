"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { type Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Can from "@/components/auth/Can";
import { btn, inputBase } from "@/components/ui/styles";
import { useSuppliers } from "@/hooks/useInventoryData";
import { supplierService, type SupplierWithMaterials } from "@/services/masterService";
import type { SupplierType } from "@/types/inventory";
import {
  IconEdit,
  IconEye,
  IconPlus,
  IconPower,
  IconTrash,
  IconTruck,
} from "@/components/icons/Icons";

export default function SuppliersPage() {
  const router = useRouter();
  const { data: suppliers, loading, error, reload } = useSuppliers();

  // Modals
  const [editSupplier, setEditSupplier] = useState<SupplierWithMaterials | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toggleSupplier, setToggleSupplier] = useState<SupplierWithMaterials | null>(null);
  const [deleteSupplier, setDeleteSupplier] = useState<SupplierWithMaterials | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [pic, setPic] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState<SupplierType>("Domestik");
  const [active, setActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const openAdd = () => {
    setCode("");
    setName("");
    setPic("");
    setPhone("");
    setEmail("");
    setAddress("");
    setType("Domestik");
    setActive(true);
    setFormError(null);
    setIsAddOpen(true);
  };

  const openEdit = (s: SupplierWithMaterials) => {
    setEditSupplier(s);
    setCode(s.code);
    setName(s.name);
    setPic(s.pic);
    setPhone(s.phone);
    setEmail(s.email);
    setAddress(s.address);
    setType(s.type);
    setActive(s.active);
    setFormError(null);
  };

  const handleSave = async () => {
    if (!code.trim() || !name.trim()) {
      setFormError("Kode Supplier dan Nama Perusahaan wajib diisi.");
      return;
    }
    setPending(true);
    setFormError(null);
    try {
      const payload = {
        code: code.trim(),
        name: name.trim(),
        pic: pic.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        type,
        active,
      };

      if (editSupplier) {
        await supplierService.update(editSupplier.id, payload);
        setEditSupplier(null);
      } else {
        await supplierService.create(payload);
        setIsAddOpen(false);
      }
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan data supplier.");
    } finally {
      setPending(false);
    }
  };

  const handleToggleActive = async () => {
    if (!toggleSupplier) return;
    setPending(true);
    try {
      await supplierService.setActive(toggleSupplier.id, !toggleSupplier.active);
      setToggleSupplier(null);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengubah status supplier.");
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteSupplier) return;
    setPending(true);
    setDeleteError(null);
    try {
      await supplierService.delete(deleteSupplier.id);
      setDeleteSupplier(null);
      reload();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Gagal menghapus supplier.");
    } finally {
      setPending(false);
    }
  };

  const columns: Column<SupplierWithMaterials>[] = [
    {
      key: "code",
      header: "Kode",
      sortable: true,
      className: "font-mono font-medium text-[#2B5FC7] dark:text-[#93B4F5] whitespace-nowrap",
      render: (s) => s.code,
    },
    {
      key: "name",
      header: "Nama Supplier & PIC",
      sortable: true,
      render: (s) => (
        <div>
          <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{s.name}</div>
          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">PIC: {s.pic || "-"}</div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Kontak",
      render: (s) => (
        <div className="text-[11px]">
          <div>{s.phone}</div>
          <div className="text-[#6B7684] dark:text-[#8A94A6]">{s.email}</div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Jenis",
      sortable: true,
      render: (s) => (
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
            s.type === "Domestik"
              ? "bg-[#EFF4FE] text-[#2B5FC7] border-[#D6E3FC] dark:bg-[#1D4ED8]/25 dark:text-[#93C5FD]"
              : "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A] dark:bg-[#78350F]/30 dark:text-[#FBBF24]"
          }`}
        >
          {s.type}
        </span>
      ),
    },
    {
      key: "materials_count",
      header: "Bahan Disuplai",
      align: "center",
      render: (s) => (
        <button
          type="button"
          onClick={() => router.push(`/dashboard/master/suppliers/${s.id}`)}
          className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] hover:border-[#2B5FC7] transition-colors"
        >
          {s.materials.length} item
        </button>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (s) => (
        <StatusBadge tone={s.active ? "green" : "gray"} dot>
          {s.active ? "Aktif" : "Nonaktif"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      render: (s) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/master/suppliers/${s.id}`)}
            className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#2B5FC7] hover:bg-[#EFF4FE] dark:hover:bg-[#1B2A44] transition-colors"
            title="Detail Supplier"
          >
            <IconEye size={16} />
          </button>
          <Can permission="master.suppliers.edit">
            <button
              type="button"
              onClick={() => openEdit(s)}
              className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#2B5FC7] hover:bg-[#EFF4FE] dark:hover:bg-[#1B2A44] transition-colors"
              title="Edit Supplier"
            >
              <IconEdit size={16} />
            </button>
          </Can>
          <Can permission="master.suppliers.deactivate">
            <button
              type="button"
              onClick={() => setToggleSupplier(s)}
              className={`p-1.5 rounded-lg transition-colors ${
                s.active
                  ? "text-[#6B7684] hover:text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#7F1D1D]/30"
                  : "text-[#6B7684] hover:text-[#059669] hover:bg-[#ECFDF5] dark:hover:bg-[#064E3B]/30"
              }`}
              title={s.active ? "Nonaktifkan Supplier" : "Aktifkan Supplier"}
            >
              <IconPower size={16} />
            </button>
          </Can>
          {!s.active && (
            <Can permission="master.suppliers.deactivate">
              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setDeleteSupplier(s);
                }}
                className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#7F1D1D]/30 transition-colors"
                title="Hapus Permanen Supplier"
              >
                <IconTrash size={16} />
              </button>
            </Can>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Master Supplier">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          eyebrow="Master Data"
          title="Daftar Mitra Supplier"
          subtitle="Data vendor kertas, tinta, hardboard, foil, dan suku cadang mesin percetakan"
          actions={
            <Can permission="master.suppliers.create">
              <button type="button" onClick={openAdd} className={btn.primary}>
                <IconPlus size={14} strokeWidth={2.5} />
                <span>Tambah Supplier</span>
              </button>
            </Can>
          }
        />

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={suppliers}
          keyExtractor={(s) => s.id}
          loading={loading}
          error={error}
          onRetry={reload}
          searchPlaceholder="Cari kode, nama supplier, PIC, email..."
          searchFilter={(s, q) =>
            s.name.toLowerCase().includes(q) ||
            s.code.toLowerCase().includes(q) ||
            s.pic.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q)
          }
          defaultSort={{ key: "code", direction: "asc" }}
          onRowClick={(s) => router.push(`/dashboard/master/suppliers/${s.id}`)}
          emptyTitle="Belum Ada Supplier"
          emptySubtitle="Belum ada data supplier yang terdaftar."
        />


        {/* Modal Tambah / Edit Supplier */}
        <FormModal
          open={isAddOpen || !!editSupplier}
          onClose={() => {
            setIsAddOpen(false);
            setEditSupplier(null);
          }}
          title={editSupplier ? "Edit Data Supplier" : "Tambah Supplier Baru"}
          subtitle="Masukkan data kontak, penanggung jawab, dan domisili supplier"
          icon={<IconTruck size={20} />}
          onSubmit={handleSave}
          submitLabel={editSupplier ? "Simpan Perubahan" : "Tambah Supplier"}
          pending={pending}
          error={formError}
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Kode Supplier <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Contoh: SUP-009"
                  className={inputBase}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Jenis Pengadaan <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as SupplierType)}
                  className={inputBase}
                >
                  <option value="Domestik">Domestik</option>
                  <option value="Impor">Impor</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Nama Perusahaan / Vendor <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: PT Sinar Kertas Nusantara"
                className={inputBase}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Nama PIC</label>
                <input
                  type="text"
                  value={pic}
                  onChange={(e) => setPic(e.target.value)}
                  placeholder="Bpk. Hadi"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">No. Telepon / WA</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sales@vendor.co.id"
                  className={inputBase}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Alamat Lengkap</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Kawasan Industri / Alamat Kantor..."
                className={inputBase}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="supplier-active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded border-[#E2E6ED] text-[#2B5FC7] focus:ring-[#2B5FC7]"
              />
              <label htmlFor="supplier-active" className="text-xs font-medium cursor-pointer">
                Status Supplier Aktif
              </label>
            </div>
          </div>
        </FormModal>

        {/* Confirm Dialog Nonaktifkan / Aktifkan */}
        <ConfirmDialog
          open={!!toggleSupplier}
          onClose={() => setToggleSupplier(null)}
          onConfirm={handleToggleActive}
          title={toggleSupplier?.active ? "Nonaktifkan Supplier" : "Aktifkan Supplier"}
          message={
            <span>
              Apakah Anda yakin ingin {toggleSupplier?.active ? "menonaktifkan" : "mengaktifkan kembali"} supplier{" "}
              <strong>{toggleSupplier?.name}</strong>?
            </span>
          }
          tone={toggleSupplier?.active ? "danger" : "primary"}
          confirmLabel={toggleSupplier?.active ? "Nonaktifkan" : "Aktifkan"}
          pending={pending}
        />

        {/* Confirm Dialog Hapus Permanen */}
        <ConfirmDialog
          open={!!deleteSupplier}
          onClose={() => {
            setDeleteSupplier(null);
            setDeleteError(null);
          }}
          onConfirm={handleDelete}
          title="Hapus Permanen Supplier"
          message={
            <span>
              Apakah Anda yakin ingin <strong>menghapus permanen</strong> supplier{" "}
              <strong>{deleteSupplier?.name}</strong>? Data yang sudah dihapus tidak dapat dikembalikan.
            </span>
          }
          tone="danger"
          confirmLabel="Ya, Hapus Permanen"
          pending={pending}
          error={deleteError}
        />
      </div>
    </DashboardLayout>
  );
}
