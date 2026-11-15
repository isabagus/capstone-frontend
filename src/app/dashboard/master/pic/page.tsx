"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  useProductionPicMaster,
  type ProductionPicMasterItem,
  type PicDivision,
} from "@/services/partnerMasterStore";
import {
  IconUsers,
  IconPlus,
  IconSearch,
  IconEdit,
  IconPower,
  IconCheck,
  IconX,
  IconProduction,
  IconGear,
  IconPhone,
  IconUser,
} from "@/components/icons/Icons";

const DIVISIONS: PicDivision[] = [
  "Cetak Offset",
  "Pond & Die-Cut",
  "Laminasi & Foil",
  "Finishing & Lem",
  "Subkontrak Vendor",
];

const SHIFTS: ProductionPicMasterItem["shift"][] = ["Shift Pagi", "Shift Siang", "Reguler"];

const MACHINES = [
  "Heidelberg SM-74 (4 Warna)",
  "Heidelberg SM-52 / SM-74",
  "Oliver 58 / Komori L-428",
  "Mesin Pond & Die-Cut Bobst",
  "Mesin Pengeleman Hotmelt Otomatis",
  "Mesin Laminasi Thermal & Spot UV",
  "Vendor Foil & Emboss Kurnia / Komori",
];

const EMPTY_FORM: Omit<ProductionPicMasterItem, "id" | "code"> = {
  name: "",
  roleTitle: "Operator Cetak Offset Senior",
  division: "Cetak Offset",
  defaultMachine: "Heidelberg SM-74 (4 Warna)",
  shift: "Shift Pagi",
  phone: "",
  activeJobs: 0,
  active: true,
};

export default function MasterProductionPicPage() {
  const { pics, updatePics } = useProductionPicMaster();
  const [search, setSearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState<string>("Semua");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Aktif" | "Nonaktif">("Semua");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductionPicMasterItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmToggle, setConfirmToggle] = useState<ProductionPicMasterItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return pics.filter((p) => {
      if (divisionFilter !== "Semua" && p.division !== divisionFilter) return false;
      if (statusFilter === "Aktif" && !p.active) return false;
      if (statusFilter === "Nonaktif" && p.active) return false;
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.code.toLowerCase().includes(q) &&
        !p.roleTitle.toLowerCase().includes(q) &&
        !p.defaultMachine.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [pics, search, divisionFilter, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (item: ProductionPicMasterItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      roleTitle: item.roleTitle,
      division: item.division,
      defaultMachine: item.defaultMachine,
      shift: item.shift,
      phone: item.phone,
      activeJobs: item.activeJobs,
      active: item.active,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      const next = pics.map((p) => (p.id === editing.id ? { ...p, ...form } : p));
      updatePics(next);
      showToast(`Data Penanggung Jawab "${form.name}" berhasil diperbarui.`);
    } else {
      const nextCode = `PIC-${String(pics.length + 1).padStart(3, "0")}`;
      const created: ProductionPicMasterItem = {
        id: `pic-${Date.now()}`,
        code: nextCode,
        ...form,
      };
      updatePics([created, ...pics]);
      showToast(`Penanggung Jawab baru "${form.name}" (${nextCode}) berhasil ditambahkan.`);
    }
    setModalOpen(false);
  };

  const handleToggleActive = () => {
    if (!confirmToggle) return;
    const next = pics.map((p) =>
      p.id === confirmToggle.id ? { ...p, active: !p.active } : p
    );
    updatePics(next);
    showToast(
      `Status Penanggung Jawab "${confirmToggle.name}" diubah menjadi ${
        !confirmToggle.active ? "Aktif" : "Nonaktif"
      }.`
    );
    setConfirmToggle(null);
  };

  const activeCount = pics.filter((p) => p.active).length;
  const totalAssignedSpk = pics.reduce((sum, p) => sum + (p.active ? p.activeJobs : 0), 0);

  return (
    <DashboardLayout title="Master Data Penanggung Jawab Produksi">
      <div className="max-w-7xl mx-auto space-y-6">
        {toast && (
          <div className="p-3 rounded-lg bg-[#EFF4FE] dark:bg-[#1D4ED8]/25 border border-[#D6E3FC] dark:border-[#2563EB]/40 text-[#2B5FC7] dark:text-[#93C5FD] text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <IconCheck size={15} />
              <span>{toast}</span>
            </div>
            <button onClick={() => setToast(null)}>
              <IconX size={14} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2E6ED] dark:border-[#26334D]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#2B5FC7] dark:bg-[#3B6FE0]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B5FC7] dark:text-[#3B6FE0]">
                Master Data Operasional · PIC &amp; Operator Produksi
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight">
              Master Penanggung Jawab (PIC Produksi)
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
              Daftar kepala produksi, operator mesin cetak, teknisi pond/finishing, dan koordinator subkontrak yang terhubung langsung ke Kanban Produksi &amp; SPK.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/production"
              className="px-3 py-2 rounded-lg text-xs font-medium border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] text-[#1B2436] dark:text-[#E8ECF3] hover:bg-[#F4F6FA] transition-colors flex items-center gap-1.5"
            >
              <IconProduction size={14} />
              <span>Ke Kanban Produksi</span>
            </Link>
            <button
              onClick={openCreate}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white shadow-sm transition-colors flex items-center gap-1.5"
            >
              <IconPlus size={14} strokeWidth={2.5} />
              <span>Tambah Penanggung Jawab</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="text-xs text-[#6B7684] dark:text-[#8A94A6] font-medium">Total Terdaftar</div>
            <div className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mt-1">
              {pics.length} Personel
            </div>
            <div className="text-[11px] text-[#059669] dark:text-[#34D399] mt-1 font-medium">
              {activeCount} Personel Aktif Bertugas
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="text-xs text-[#6B7684] dark:text-[#8A94A6] font-medium">Divisi Cetak &amp; Pond</div>
            <div className="text-2xl font-bold text-[#2B5FC7] dark:text-[#60A5FA] mt-1">
              {pics.filter((p) => p.division === "Cetak Offset" || p.division === "Pond & Die-Cut").length} Operator
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-1">
              Heidelberg, Oliver, Komori &amp; Bobst
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="text-xs text-[#6B7684] dark:text-[#8A94A6] font-medium">Finishing &amp; Subkontrak</div>
            <div className="text-2xl font-bold text-[#059669] dark:text-[#34D399] mt-1">
              {pics.filter((p) => p.division === "Finishing & Lem" || p.division === "Laminasi & Foil" || p.division === "Subkontrak Vendor").length} Teknisi
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-1">
              Laminasi, Hotmelt &amp; PIC Vendor
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="text-xs text-[#6B7684] dark:text-[#8A94A6] font-medium">Beban Kerja Aktif</div>
            <div className="text-2xl font-bold text-[#D97706] dark:text-[#FBBF24] mt-1">
              {totalAssignedSpk} SPK Berjalan
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-1">
              Tersinkronisasi dengan Kanban Produksi
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7684]" />
            <input
              type="text"
              placeholder="Cari kode PIC, nama personel, jabatan, atau mesin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-xs text-[#1B2436] dark:text-[#E8ECF3]"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#6B7684] dark:text-[#8A94A6]">Divisi:</span>
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] font-medium"
              >
                <option value="Semua">Semua Divisi</option>
                {DIVISIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[#6B7684] dark:text-[#8A94A6]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "Semua" | "Aktif" | "Nonaktif")}
                className="h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] font-medium"
              >
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F4F6FA] dark:bg-[#1B2A44] border-b border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6] font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">Kode PIC</th>
                  <th className="py-3 px-4">Nama Penanggung Jawab &amp; Jabatan</th>
                  <th className="py-3 px-4">Divisi Kerja</th>
                  <th className="py-3 px-4">Mesin Utama / Stasiun Kerja</th>
                  <th className="py-3 px-4">Shift &amp; Kontak</th>
                  <th className="py-3 px-4 text-center">Beban SPK</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#6B7684]">
                      Tidak ada data penanggung jawab yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/50">
                      <td className="py-3 px-4 font-mono font-bold text-[#2B5FC7] dark:text-[#60A5FA]">
                        {item.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold flex items-center gap-1.5">
                          <IconUser size={13} className="text-[#2B5FC7]" />
                          <span>{item.name}</span>
                        </div>
                        <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                          {item.roleTitle}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#EFF4FE] text-[#2B5FC7] border border-[#D6E3FC] dark:bg-[#1D4ED8]/25 dark:text-[#93C5FD]">
                          {item.division}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium">
                          <IconGear size={13} className="text-[#6B7684]" />
                          <span>{item.defaultMachine}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{item.shift}</div>
                        <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] font-mono flex items-center gap-1">
                          <IconPhone size={11} />
                          <span>{item.phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        {item.activeJobs} SPK
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.active
                              ? "bg-[#ECFDF5] text-[#065F46] dark:bg-[#064E3B]/40 dark:text-[#34D399]"
                              : "bg-[#F4F6FA] text-[#6B7684] dark:bg-[#1B2A44] dark:text-[#8A94A6]"
                          }`}
                        >
                          {item.active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openEdit(item)}
                          className="px-2.5 py-1 rounded-md border border-[#E2E6ED] dark:border-[#26334D] hover:bg-[#F4F6FA] dark:hover:bg-[#1B2A44] text-xs inline-flex items-center gap-1"
                        >
                          <IconEdit size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setConfirmToggle(item)}
                          className={`px-2.5 py-1 rounded-md border text-xs inline-flex items-center gap-1 ${
                            item.active
                              ? "border-[#FECACA] text-[#991B1B] hover:bg-[#FEF2F2]"
                              : "border-[#A7F3D0] text-[#065F46] hover:bg-[#ECFDF5]"
                          }`}
                        >
                          <IconPower size={12} />
                          <span>{item.active ? "Nonaktifkan" : "Aktifkan"}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Tambah / Edit */}
        <FormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editing ? `Edit Penanggung Jawab (${editing.code})` : "Tambah Penanggung Jawab Produksi Baru"}
          subtitle="Personel aktif akan otomatis muncul pada pilihan Penanggung Jawab di Kanban Produksi dan SPK Digital."
          onSubmit={handleSave}
          submitLabel={editing ? "Simpan Perubahan" : "Tambahkan PIC"}
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                Nama Lengkap Penanggung Jawab *
              </label>
              <input
                required
                placeholder="Contoh: Hendra Saputra"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                  Jabatan / Spesialisasi Peran
                </label>
                <input
                  placeholder="Contoh: Operator Cetak Offset Senior"
                  value={form.roleTitle}
                  onChange={(e) => setForm({ ...form, roleTitle: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                  Divisi Produksi
                </label>
                <select
                  value={form.division}
                  onChange={(e) => setForm({ ...form, division: e.target.value as PicDivision })}
                  className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]"
                >
                  {DIVISIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                Mesin Utama / Stasiun Kerja Default
              </label>
              <select
                value={form.defaultMachine}
                onChange={(e) => setForm({ ...form, defaultMachine: e.target.value })}
                className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]"
              >
                {MACHINES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                  Jadwal Shift Kerja
                </label>
                <select
                  value={form.shift}
                  onChange={(e) =>
                    setForm({ ...form, shift: e.target.value as ProductionPicMasterItem["shift"] })
                  }
                  className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]"
                >
                  {SHIFTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  placeholder="Contoh: 0812-3000-1199"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]"
                />
              </div>
            </div>
          </div>
        </FormModal>

        {/* Confirm Toggle Dialog */}
        <ConfirmDialog
          open={Boolean(confirmToggle)}
          onClose={() => setConfirmToggle(null)}
          onConfirm={handleToggleActive}
          title={
            confirmToggle?.active
              ? "Nonaktifkan Penanggung Jawab?"
              : "Aktifkan Kembali Penanggung Jawab?"
          }
          message={
            confirmToggle?.active
              ? `Penanggung Jawab "${confirmToggle?.name}" tidak akan muncul pada pilihan penugasan baru di Kanban Produksi selama berstatus nonaktif.`
              : `Aktifkan kembali "${confirmToggle?.name}" agar dapat ditugaskan pada Kanban Produksi & SPK Digital.`
          }
          confirmLabel={confirmToggle?.active ? "Ya, Nonaktifkan" : "Ya, Aktifkan"}
        />
      </div>
    </DashboardLayout>
  );
}

