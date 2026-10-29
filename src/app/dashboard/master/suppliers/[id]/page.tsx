"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatusBadge from "@/components/ui/StatusBadge";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Can from "@/components/auth/Can";
import { btn, cx, inputBase } from "@/components/ui/styles";
import { useSuppliers } from "@/hooks/useInventoryData";
import { supplierService, type SupplierWithMaterials } from "@/services/masterService";
import type { SupplierType } from "@/types/inventory";
import { formatNumber } from "@/lib/inventoryUtils";
import {
  IconArrowLeft,
  IconBox,
  IconBuilding,
  IconEdit,
  IconMail,
  IconMapPin,
  IconPhone,
  IconPower,
  IconTruck,
  IconUser,
} from "@/components/icons/Icons";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SupplierDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: suppliers, loading, error, reload } = useSuppliers();
  const supplier = useMemo(() => suppliers?.find((s) => s.id === id), [suppliers, id]);

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
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

  // Toggle active dialog
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);

  useEffect(() => {
    if (supplier) {
      setCode(supplier.code);
      setName(supplier.name);
      setPic(supplier.pic);
      setPhone(supplier.phone);
      setEmail(supplier.email);
      setAddress(supplier.address);
      setType(supplier.type);
      setActive(supplier.active);
    }
  }, [supplier]);

  const handleSaveEdit = async () => {
    if (!code.trim() || !name.trim()) {
      setFormError("Kode Supplier dan Nama Perusahaan wajib diisi.");
      return;
    }
    if (!supplier) return;

    setPending(true);
    setFormError(null);
    try {
      await supplierService.update(supplier.id, {
        code: code.trim(),
        name: name.trim(),
        pic: pic.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        type,
        active,
      });
      setIsEditOpen(false);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal memperbarui supplier.");
    } finally {
      setPending(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!supplier) return;
    setPending(true);
    try {
      await supplierService.update(supplier.id, {
        code: supplier.code,
        name: supplier.name,
        pic: supplier.pic,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        type: supplier.type,
        active: !supplier.active,
      });
      setToggleConfirmOpen(false);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengubah status supplier.");
    } finally {
      setPending(false);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <DashboardLayout title="Memuat Detail Supplier...">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-28 bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] rounded-xl p-6 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] rounded-xl animate-pulse" />
            <div className="h-96 bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] rounded-xl animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <DashboardLayout title="Kesalahan Memuat Supplier">
        <div className="max-w-3xl mx-auto p-8 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center font-bold text-xl">
            !
          </div>
          <h2 className="text-lg font-bold text-[#1B2436] dark:text-[#E8ECF3]">Gagal Memuat Data Supplier</h2>
          <p className="text-sm text-[#6B7684] dark:text-[#8A94A6]">{error}</p>
          <div className="flex justify-center gap-3 pt-2">
            <button type="button" onClick={() => router.back()} className={btn.outline}>
              ← Kembali
            </button>
            <button type="button" onClick={reload} className={btn.primary}>
              Coba Lagi
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 3. Not Found State
  if (!supplier) {
    return (
      <DashboardLayout title="Supplier Tidak Ditemukan">
        <div className="max-w-2xl mx-auto py-16 px-6 text-center bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] rounded-xl space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center text-2xl font-bold">
            ?
          </div>
          <h2 className="text-xl font-bold text-[#1B2436] dark:text-[#E8ECF3]">Supplier Tidak Ditemukan</h2>
          <p className="text-sm text-[#6B7684] dark:text-[#8A94A6]">
            Supplier dengan ID <span className="font-mono font-semibold">{id}</span> tidak ditemukan atau telah dihapus.
          </p>
          <div className="pt-2">
            <button type="button" onClick={() => router.back()} className={btn.primary}>
              ← Kembali ke Daftar Supplier
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Detail: ${supplier.name}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Back & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2B5FC7] dark:text-[#93B4F5] hover:underline cursor-pointer py-1 self-start"
          >
            <IconArrowLeft size={14} />
            <span>← Kembali</span>
          </button>
          <nav aria-label="Breadcrumb" className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span className="mx-1.5">/</span>
            <Link href="/dashboard/master/suppliers" className="hover:underline">Master Data</Link>
            <span className="mx-1.5">/</span>
            <Link href="/dashboard/master/suppliers" className="hover:underline">Supplier</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#1B2436] dark:text-[#E8ECF3] font-medium">{supplier.name}</span>
          </nav>
        </div>

        {/* Header Supplier Card */}
        <div className="p-6 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded font-semibold bg-[#EFF4FE] dark:bg-[#1D4ED8]/20 text-[#2B5FC7] dark:text-[#93B4F5] border border-[#D6E3FC] dark:border-[#2563EB]/40">
                {supplier.code}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-medium border ${
                  supplier.type === "Domestik"
                    ? "bg-[#EFF4FE] text-[#2B5FC7] border-[#D6E3FC] dark:bg-[#1D4ED8]/25 dark:text-[#93C5FD]"
                    : "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A] dark:bg-[#78350F]/30 dark:text-[#FBBF24]"
                }`}
              >
                Supplier {supplier.type}
              </span>
              <StatusBadge tone={supplier.active ? "green" : "gray"} dot>
                {supplier.active ? "Aktif" : "Nonaktif"}
              </StatusBadge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight">
              {supplier.name}
            </h1>
            <p className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
              PIC: <span className="font-medium text-[#1B2436] dark:text-[#E8ECF3]">{supplier.pic || "-"}</span> · Telp:{" "}
              <span className="font-medium text-[#1B2436] dark:text-[#E8ECF3]">{supplier.phone || "-"}</span> · Email:{" "}
              <span className="font-medium text-[#1B2436] dark:text-[#E8ECF3]">{supplier.email || "-"}</span>
            </p>
          </div>

          {/* Action Buttons wrapped in Can */}
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <Can permission="master.suppliers.edit">
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className={btn.outline}
              >
                <IconEdit size={14} />
                <span>Edit Supplier</span>
              </button>
            </Can>
            <Can permission="master.suppliers.deactivate">
              <button
                type="button"
                onClick={() => setToggleConfirmOpen(true)}
                className={cx(
                  btn.outline,
                  supplier.active
                    ? "text-[#DC2626] border-[#FECACA] hover:bg-[#FEF2F2] dark:border-[#991B1B]/40 dark:hover:bg-[#7F1D1D]/20"
                    : "text-[#059669] border-[#A7F3D0] hover:bg-[#ECFDF5] dark:border-[#065F46]/40 dark:hover:bg-[#064E3B]/20"
                )}
              >
                <IconPower size={14} />
                <span>{supplier.active ? "Nonaktifkan" : "Aktifkan"}</span>
              </button>
            </Can>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (Left - 2 Cols): Daftar Bahan yang Disuplai */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#EFF4FE] dark:bg-[#1B2A44] text-[#2B5FC7] dark:text-[#93B4F5]">
                    <IconBox size={16} />
                  </span>
                  <h2 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3] uppercase tracking-wider">
                    Bahan & Sparepart yang Disuplai ({supplier.materials.length})
                  </h2>
                </div>
                <span className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
                  Katalog Bahan Aktif
                </span>
              </div>

              {supplier.materials.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#6B7684] dark:text-[#8A94A6]">
                  Belum ada bahan baku atau sparepart yang terdaftar untuk supplier ini.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6] font-semibold">
                        <th className="py-2.5 px-3">Kode Item</th>
                        <th className="py-2.5 px-3">Nama Bahan / Sparepart</th>
                        <th className="py-2.5 px-3">Jenis</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]">
                      {supplier.materials.map((m) => (
                        <tr key={m.id} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/40">
                          <td className="py-2.5 px-3 font-mono font-medium text-[#2B5FC7] dark:text-[#93B4F5] whitespace-nowrap">
                            {m.code}
                          </td>
                          <td className="py-2.5 px-3 font-semibold">
                            {m.name}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]">
                              {m.kind}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <Link
                              href={
                                m.kind === "Bahan Baku"
                                  ? `/dashboard/inventory/materials/${m.id}`
                                  : `/dashboard/inventory/spareparts/${m.id}`
                              }
                              className="text-xs font-semibold text-[#2B5FC7] dark:text-[#93B4F5] hover:underline"
                            >
                              Lihat Item →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1 Col): Informasi Kontak & Alamat Lengkap */}
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
                <span className="p-1.5 rounded-lg bg-[#EFF4FE] dark:bg-[#1B2A44] text-[#2B5FC7] dark:text-[#93B4F5]">
                  <IconBuilding size={16} />
                </span>
                <h2 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3] uppercase tracking-wider">
                  Informasi Kontak
                </h2>
              </div>

              <dl className="space-y-3.5 text-xs">
                <div>
                  <dt className="text-[#6B7684] dark:text-[#8A94A6] flex items-center gap-1.5">
                    <IconUser size={13} />
                    <span>Person in Charge (PIC)</span>
                  </dt>
                  <dd className="font-semibold text-sm text-[#1B2436] dark:text-[#E8ECF3] mt-0.5">
                    {supplier.pic || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6B7684] dark:text-[#8A94A6] flex items-center gap-1.5">
                    <IconPhone size={13} />
                    <span>Telepon / WhatsApp</span>
                  </dt>
                  <dd className="font-semibold text-sm text-[#1B2436] dark:text-[#E8ECF3] mt-0.5">
                    {supplier.phone || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6B7684] dark:text-[#8A94A6] flex items-center gap-1.5">
                    <IconMail size={13} />
                    <span>Email Perusahaan</span>
                  </dt>
                  <dd className="font-semibold text-sm text-[#1B2436] dark:text-[#E8ECF3] mt-0.5">
                    {supplier.email || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6B7684] dark:text-[#8A94A6] flex items-center gap-1.5">
                    <IconMapPin size={13} />
                    <span>Alamat Operasional</span>
                  </dt>
                  <dd className="font-medium text-[#1B2436] dark:text-[#E8ECF3] mt-1 leading-relaxed">
                    {supplier.address || "Belum ada alamat terdaftar."}
                  </dd>
                </div>
                <div className="pt-2 border-t border-[#E2E6ED] dark:border-[#26334D]">
                  <dt className="text-[#6B7684] dark:text-[#8A94A6]">Jenis Kemitraan</dt>
                  <dd className="font-semibold text-[#1B2436] dark:text-[#E8ECF3] mt-0.5">
                    Supplier {supplier.type}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <FormModal
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Data Supplier"
          subtitle={`Perbarui profil kemitraan vendor ${supplier.code}`}
          onSubmit={handleSaveEdit}
          pending={pending}
          error={formError}
          submitLabel="Simpan Perubahan"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                  Kode Supplier <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={cx(inputBase, "w-full font-mono text-xs")}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                  Jenis Supplier
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as SupplierType)}
                  className={cx(inputBase, "w-full text-xs")}
                >
                  <option value="Domestik">Domestik</option>
                  <option value="Impor">Impor</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                Nama Perusahaan Supplier <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cx(inputBase, "w-full text-xs")}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                  Person in Charge (PIC)
                </label>
                <input
                  type="text"
                  value={pic}
                  onChange={(e) => setPic(e.target.value)}
                  className={cx(inputBase, "w-full text-xs")}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                  Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={cx(inputBase, "w-full text-xs")}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                Email Resmi
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cx(inputBase, "w-full text-xs")}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                Alamat Operasional
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className={cx(inputBase, "w-full text-xs resize-none")}
              />
            </div>
          </div>
        </FormModal>

        {/* Toggle Status Confirmation Dialog */}
        <ConfirmDialog
          open={toggleConfirmOpen}
          onClose={() => setToggleConfirmOpen(false)}
          title={supplier.active ? "Nonaktifkan Supplier?" : "Aktifkan Supplier?"}
          message={
            supplier.active
              ? `Supplier "${supplier.name}" akan dinonaktifkan dari daftar mitra aktif.`
              : `Supplier "${supplier.name}" akan diaktifkan kembali.`
          }
          onConfirm={handleToggleStatus}
          confirmLabel={supplier.active ? "Nonaktifkan" : "Aktifkan"}
          tone={supplier.active ? "danger" : "primary"}
          pending={pending}
        />
      </div>
    </DashboardLayout>
  );
}
