"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { type Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { btn, inputBase } from "@/components/ui/styles";
import {
  useVendorMaster,
  type VendorMasterItem,
} from "@/services/partnerMasterStore";
import {
  IconEdit,
  IconPlus,
  IconPower,
  IconProduction,
  IconTrash,
} from "@/components/icons/Icons";

const SPECIALTIES: VendorMasterItem["specialty"][] = [
  "Cetak Offset Skala Besar",
  "Hot Print Foil & Emboss",
  "Die-Cut Pond & Rigid Box",
  "UV Spot & Laminasi",
  "Lainnya",
];

export default function VendorsMasterPage() {
  const { vendors, updateVendors } = useVendorMaster();

  const [editItem, setEditItem] = useState<VendorMasterItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toggleItem, setToggleItem] = useState<VendorMasterItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<VendorMasterItem | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState<VendorMasterItem["specialty"]>("Hot Print Foil & Emboss");
  const [pic, setPic] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [slaLeadTimeDays, setSlaLeadTimeDays] = useState(3);
  const [defectRatePercent, setDefectRatePercent] = useState(1.0);
  const [capacityPerDay, setCapacityPerDay] = useState("10.000 Lembar / Hari");
  const [active, setActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const openAdd = () => {
    const nextNum = vendors.length + 1;
    setCode(`VND-${String(nextNum).padStart(3, "0")}`);
    setName("");
    setSpecialty("Hot Print Foil & Emboss");
    setPic("");
    setPhone("");
    setEmail("");
    setAddress("");
    setSlaLeadTimeDays(3);
    setDefectRatePercent(1.0);
    setCapacityPerDay("10.000 Lembar / Hari");
    setActive(true);
    setFormError(null);
    setIsAddOpen(true);
  };

  const openEdit = (v: VendorMasterItem) => {
    setEditItem(v);
    setCode(v.code);
    setName(v.name);
    setSpecialty(v.specialty);
    setPic(v.pic);
    setPhone(v.phone);
    setEmail(v.email);
    setAddress(v.address);
    setSlaLeadTimeDays(v.slaLeadTimeDays);
    setDefectRatePercent(v.defectRatePercent);
    setCapacityPerDay(v.capacityPerDay);
    setActive(v.active);
    setFormError(null);
  };

  const handleSave = () => {
    if (!code.trim() || !name.trim()) {
      setFormError("Kode Vendor dan Nama Workshop Vendor wajib diisi.");
      return;
    }

    if (editItem) {
      updateVendors(
        vendors.map((v) =>
          v.id === editItem.id
            ? {
                ...v,
                code: code.trim(),
                name: name.trim(),
                specialty,
                pic: pic.trim(),
                phone: phone.trim(),
                email: email.trim(),
                address: address.trim(),
                slaLeadTimeDays: Number(slaLeadTimeDays) || 2,
                defectRatePercent: Number(defectRatePercent) || 0,
                capacityPerDay: capacityPerDay.trim(),
                active,
              }
            : v
        )
      );
      setEditItem(null);
    } else {
      const newVendor: VendorMasterItem = {
        id: `vnd-${Date.now()}`,
        code: code.trim(),
        name: name.trim(),
        specialty,
        pic: pic.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        slaLeadTimeDays: Number(slaLeadTimeDays) || 2,
        defectRatePercent: Number(defectRatePercent) || 0,
        capacityPerDay: capacityPerDay.trim() || "10.000 Lembar / Hari",
        active,
      };
      updateVendors([...vendors, newVendor]);
      setIsAddOpen(false);
    }
  };

  const columns: Column<VendorMasterItem>[] = [
    {
      key: "code",
      header: "Kode",
      sortable: true,
      className: "font-mono font-medium text-[#2B5FC7] dark:text-[#93B4F5] whitespace-nowrap",
      render: (v) => v.code,
    },
    {
      key: "name",
      header: "Nama Vendor Mitra & Workshop",
      sortable: true,
      render: (v) => (
        <div>
          <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{v.name}</div>
          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
            PIC: {v.pic || "-"} · {v.address || "-"}
          </div>
        </div>
      ),
    },
    {
      key: "specialty",
      header: "Spesialisasi Maklon",
      sortable: true,
      render: (v) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] dark:bg-[#78350F]/30 dark:text-[#FBBF24]">
          {v.specialty}
        </span>
      ),
    },
    {
      key: "contact",
      header: "Kontak",
      render: (v) => (
        <div className="text-[11px]">
          <div className="font-mono font-medium">{v.phone}</div>
          <div className="text-[#6B7684] dark:text-[#8A94A6]">{v.email}</div>
        </div>
      ),
    },
    {
      key: "sla",
      header: "Kapasitas & SLA",
      render: (v) => (
        <div className="text-[11px]">
          <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{v.capacityPerDay}</div>
          <div className="text-[#6B7684] dark:text-[#8A94A6]">
            Lead Time: <strong>{v.slaLeadTimeDays} Hari</strong> · Defect: <strong>{v.defectRatePercent}%</strong>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (v) => (
        <StatusBadge tone={v.active ? "green" : "gray"} dot>
          {v.active ? "Mitra Aktif" : "Nonaktif"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      render: (v) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => openEdit(v)}
            className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#2B5FC7] hover:bg-[#EFF4FE] dark:hover:bg-[#1B2A44] transition-colors"
            title="Edit Vendor"
          >
            <IconEdit size={16} />
          </button>
          <button
            type="button"
            onClick={() => setToggleItem(v)}
            className={`p-1.5 rounded-lg transition-colors ${
              v.active
                ? "text-[#6B7684] hover:text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#7F1D1D]/30"
                : "text-[#6B7684] hover:text-[#059669] hover:bg-[#ECFDF5] dark:hover:bg-[#064E3B]/30"
            }`}
            title={v.active ? "Nonaktifkan Vendor" : "Aktifkan Vendor"}
          >
            <IconPower size={16} />
          </button>
          {!v.active && (
            <button
              type="button"
              onClick={() => setDeleteItem(v)}
              className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#7F1D1D]/30 transition-colors"
              title="Hapus Vendor"
            >
              <IconTrash size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Master Vendor Mitra Maklon">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          eyebrow="Master Data · Subkontrak Produksi (SPK Eksternal)"
          title="Master Data Vendor Mitra Maklon"
          subtitle="Daftar workshop rekanan subkontrak cetak offset, hot print foil, emboss, die-cut rigid box, dan UV varnish yang terhubung ke SPK Eksternal & Kanban Produksi"
          actions={
            <button type="button" onClick={openAdd} className={btn.primary}>
              <IconPlus size={14} strokeWidth={2.5} />
              <span>Tambah Vendor Maklon</span>
            </button>
          }
        />

        {/* Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]">
            <div className="flex items-center justify-between text-xs text-[#6B7684] dark:text-[#8A94A6] mb-1">
              <span>Total Vendor Mitra Terdaftar</span>
              <IconProduction size={15} className="text-[#2B5FC7]" />
            </div>
            <div className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3]">
              {vendors.length} Workshop Mitra
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]">
            <div className="text-xs text-[#6B7684] dark:text-[#8A94A6] mb-1">Rata-rata SLA Lead Time</div>
            <div className="text-2xl font-bold text-[#2B5FC7] dark:text-[#60A5FA]">
              {(vendors.reduce((acc, v) => acc + v.slaLeadTimeDays, 0) / Math.max(1, vendors.length)).toFixed(1)} Hari Kerja
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]">
            <div className="text-xs text-[#6B7684] dark:text-[#8A94A6] mb-1">Rata-rata Defect Rate Subkontrak</div>
            <div className="text-2xl font-bold text-[#059669] dark:text-[#34D399]">
              {(vendors.reduce((acc, v) => acc + v.defectRatePercent, 0) / Math.max(1, vendors.length)).toFixed(2)}% (Terkendali)
            </div>
          </div>
        </section>

        <DataTable
          columns={columns}
          data={vendors}
          keyExtractor={(v) => v.id}
          loading={false}
          error={null}
          searchPlaceholder="Cari kode vendor, nama workshop, spesialisasi maklon, atau PIC..."
          searchFilter={(v, q) =>
            v.name.toLowerCase().includes(q) ||
            v.code.toLowerCase().includes(q) ||
            v.specialty.toLowerCase().includes(q) ||
            v.pic.toLowerCase().includes(q)
          }
          defaultSort={{ key: "code", direction: "asc" }}
          emptyTitle="Belum Ada Vendor Maklon"
          emptySubtitle="Tambahkan mitra vendor untuk kebutuhan SPK Eksternal."
        />

        {/* Modal Form */}
        <FormModal
          open={isAddOpen || !!editItem}
          onClose={() => {
            setIsAddOpen(false);
            setEditItem(null);
          }}
          title={editItem ? `Edit Vendor Maklon · ${editItem.code}` : "Tambah Vendor Mitra Maklon"}
          subtitle="Perbedaan dengan Supplier: Supplier menyuplai bahan baku (kertas/tinta), sedangkan Vendor Mitra mengerjakan subkontrak jasa produksi/finishing (SPK Eksternal)."
          icon={<IconProduction size={20} />}
          onSubmit={handleSave}
          submitLabel={editItem ? "Simpan Perubahan" : "Simpan Vendor"}
          error={formError}
          size="md"
        >
          <div className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1.5">
                  Kode Vendor *
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="VND-005"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1.5">
                  Spesialisasi Jasa Maklon
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value as VendorMasterItem["specialty"])}
                  className={inputBase}
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1.5">
                Nama Vendor Mitra / Workshop *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Vendor Foil & Emboss Kurnia"
                className={inputBase}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1.5">
                  Nama PIC Workshop
                </label>
                <input
                  value={pic}
                  onChange={(e) => setPic(e.target.value)}
                  placeholder="Nama penanggung jawab produksi"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1.5">
                  No. WhatsApp / Telepon
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className={inputBase}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1.5">
                  SLA Lead Time (Hari)
                </label>
                <input
                  type="number"
                  min={1}
                  value={slaLeadTimeDays}
                  onChange={(e) => setSlaLeadTimeDays(Number(e.target.value))}
                  className={inputBase}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1.5">
                  Est. Defect Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  value={defectRatePercent}
                  onChange={(e) => setDefectRatePercent(Number(e.target.value))}
                  className={inputBase}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1.5">
                  Kapasitas Harian
                </label>
                <input
                  value={capacityPerDay}
                  onChange={(e) => setCapacityPerDay(e.target.value)}
                  placeholder="12.000 Lembar / Hari"
                  className={inputBase}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1.5">
                Alamat Workshop
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Lokasi pengiriman bahan maklon"
                className={inputBase}
              />
            </div>
          </div>
        </FormModal>

        {/* Confirm Toggle */}
        <ConfirmDialog
          open={!!toggleItem}
          onClose={() => setToggleItem(null)}
          onConfirm={() => {
            if (!toggleItem) return;
            updateVendors(
              vendors.map((v) => (v.id === toggleItem.id ? { ...v, active: !v.active } : v))
            );
            setToggleItem(null);
          }}
          title={toggleItem?.active ? "Nonaktifkan Vendor Mitra?" : "Aktifkan Vendor Mitra?"}
          message={`Status vendor "${toggleItem?.name}" akan diubah.`}
          confirmLabel={toggleItem?.active ? "Nonaktifkan" : "Aktifkan"}
          tone={toggleItem?.active ? "danger" : "primary"}
        />

        {/* Confirm Delete */}
        <ConfirmDialog
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={() => {
            if (!deleteItem) return;
            updateVendors(vendors.filter((v) => v.id !== deleteItem.id));
            setDeleteItem(null);
          }}
          title="Hapus Permanen Vendor?"
          message={`Data vendor "${deleteItem?.name}" akan dihapus dari Master Vendor.`}
          confirmLabel="Hapus Permanen"
          tone="danger"
        />
      </div>
    </DashboardLayout>
  );
}

