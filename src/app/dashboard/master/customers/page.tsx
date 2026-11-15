"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { type Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { btn, inputBase } from "@/components/ui/styles";
import { useBrands } from "@/hooks/useInventoryData";
import {
  useCustomerMaster,
  type CustomerMasterItem,
  type CustomerSegment,
} from "@/services/partnerMasterStore";
import {
  IconEdit,
  IconPlus,
  IconPower,
  IconTrash,
  IconUsers,
} from "@/components/icons/Icons";

const SEGMENTS: CustomerSegment[] = [
  "Korporat B2B",
  "Brand Skincare / Kosmetik",
  "F&B / Kuliner",
  "UMKM / Retail",
];

export default function CustomersMasterPage() {
  const { customers, updateCustomers } = useCustomerMaster();
  const brandList = useBrands();

  // Modal state
  const [editItem, setEditItem] = useState<CustomerMasterItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toggleItem, setToggleItem] = useState<CustomerMasterItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<CustomerMasterItem | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [pic, setPic] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [segment, setSegment] = useState<CustomerSegment>("Korporat B2B");
  const [preferredBrand, setPreferredBrand] = useState("Packsolution.id");
  const [lastProductSpec, setLastProductSpec] = useState("");
  const [lastDimensions, setLastDimensions] = useState("");
  const [lastPaperType, setLastPaperType] = useState("Kertas Ivory 300 GSM Plano");
  const [active, setActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const openAdd = () => {
    const nextNum = customers.length + 1;
    setCode(`CUST-${String(nextNum).padStart(3, "0")}`);
    setName("");
    setPic("");
    setPhone("");
    setEmail("");
    setAddress("");
    setSegment("Korporat B2B");
    setPreferredBrand(brandList[0] || "Packsolution.id");
    setLastProductSpec("");
    setLastDimensions("");
    setLastPaperType("Kertas Ivory 300 GSM Plano");
    setActive(true);
    setFormError(null);
    setIsAddOpen(true);
  };

  const openEdit = (c: CustomerMasterItem) => {
    setEditItem(c);
    setCode(c.code);
    setName(c.name);
    setPic(c.pic);
    setPhone(c.phone);
    setEmail(c.email);
    setAddress(c.address);
    setSegment(c.segment);
    setPreferredBrand(c.preferredBrand);
    setLastProductSpec(c.lastProductSpec || "");
    setLastDimensions(c.lastDimensions || "");
    setLastPaperType(c.lastPaperType || "Kertas Ivory 300 GSM Plano");
    setActive(c.active);
    setFormError(null);
  };

  const handleSave = () => {
    if (!code.trim() || !name.trim() || !phone.trim()) {
      setFormError("Kode Pelanggan, Nama Perusahaan/Pelanggan, dan No. WhatsApp wajib diisi.");
      return;
    }

    if (editItem) {
      const next = customers.map((c) =>
        c.id === editItem.id
          ? {
              ...c,
              code: code.trim(),
              name: name.trim(),
              pic: pic.trim(),
              phone: phone.trim(),
              email: email.trim(),
              address: address.trim(),
              segment,
              preferredBrand,
              lastProductSpec: lastProductSpec.trim(),
              lastDimensions: lastDimensions.trim(),
              lastPaperType,
              active,
            }
          : c
      );
      updateCustomers(next);
      setEditItem(null);
    } else {
      const newCust: CustomerMasterItem = {
        id: `cust-${Date.now()}`,
        code: code.trim(),
        name: name.trim(),
        pic: pic.trim() || name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        segment,
        preferredBrand,
        lastProductSpec: lastProductSpec.trim() || "Custom Packaging Order",
        lastDimensions: lastDimensions.trim() || "20 × 15 × 5 cm",
        lastPaperType,
        lastFinishing: ["Laminasi Doff", "Die-Cut / Pond"],
        totalRepeatOrders: 1,
        active,
      };
      updateCustomers([newCust, ...customers]);
      setIsAddOpen(false);
    }
  };

  const columns: Column<CustomerMasterItem>[] = [
    {
      key: "code",
      header: "Kode",
      sortable: true,
      className: "font-mono font-medium text-[#2B5FC7] dark:text-[#93B4F5] whitespace-nowrap",
      render: (c) => c.code,
    },
    {
      key: "name",
      header: "Nama Pelanggan & PIC",
      sortable: true,
      render: (c) => (
        <div>
          <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{c.name}</div>
          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
            PIC: {c.pic || "-"} · <span className="truncate">{c.address || "-"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Kontak WhatsApp & Email",
      render: (c) => (
        <div className="text-[11px]">
          <div className="font-mono font-medium text-[#1B2436] dark:text-[#E8ECF3]">{c.phone}</div>
          <div className="text-[#6B7684] dark:text-[#8A94A6]">{c.email || "-"}</div>
        </div>
      ),
    },
    {
      key: "segment",
      header: "Segmen & Brand Utama",
      sortable: true,
      render: (c) => (
        <div className="space-y-1">
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-[#EFF4FE] text-[#2B5FC7] border border-[#D6E3FC] dark:bg-[#1D4ED8]/25 dark:text-[#93C5FD]">
            {c.segment}
          </span>
          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
            Brand: <strong className="text-[#1B2436] dark:text-[#E8ECF3]">{c.preferredBrand}</strong>
          </div>
        </div>
      ),
    },
    {
      key: "lastSpec",
      header: "Spesifikasi Repeat Terakhir",
      render: (c) => (
        <div className="text-[11px] max-w-[230px]">
          <div className="font-medium text-[#1B2436] dark:text-[#E8ECF3] truncate">
            {c.lastProductSpec || "-"}
          </div>
          <div className="text-[#6B7684] dark:text-[#8A94A6] font-mono text-[10px]">
            {c.lastDimensions || "-"} · {c.lastPaperType || "-"}
          </div>
        </div>
      ),
    },
    {
      key: "repeatCount",
      header: "Frekuensi Order",
      align: "center",
      sortable: true,
      render: (c) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] dark:bg-[#064E3B]/40 dark:text-[#34D399]">
          {c.totalRepeatOrders}x Order
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (c) => (
        <StatusBadge tone={c.active ? "green" : "gray"} dot>
          {c.active ? "Aktif" : "Nonaktif"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      render: (c) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => openEdit(c)}
            className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#2B5FC7] hover:bg-[#EFF4FE] dark:hover:bg-[#1B2A44] transition-colors"
            title="Edit Pelanggan"
          >
            <IconEdit size={16} />
          </button>
          <button
            type="button"
            onClick={() => setToggleItem(c)}
            className={`p-1.5 rounded-lg transition-colors ${
              c.active
                ? "text-[#6B7684] hover:text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#7F1D1D]/30"
                : "text-[#6B7684] hover:text-[#059669] hover:bg-[#ECFDF5] dark:hover:bg-[#064E3B]/30"
            }`}
            title={c.active ? "Nonaktifkan Pelanggan" : "Aktifkan Pelanggan"}
          >
            <IconPower size={16} />
          </button>
          {!c.active && (
            <button
              type="button"
              onClick={() => setDeleteItem(c)}
              className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#7F1D1D]/30 transition-colors"
              title="Hapus Pelanggan"
            >
              <IconTrash size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Master Pelanggan">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          eyebrow="Master Data · CRM & Repeat Order"
          title="Master Data Pelanggan (Klien)"
          subtitle="Database pelanggan B2B, Brand Skincare, F&B, dan UMKM yang terhubung langsung ke pilihan Pelanggan Repeat di Form Input Order"
          actions={
            <button type="button" onClick={openAdd} className={btn.primary}>
              <IconPlus size={14} strokeWidth={2.5} />
              <span>Tambah Pelanggan Baru</span>
            </button>
          }
        />

        {/* KPI Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]">
            <div className="flex items-center justify-between text-xs text-[#6B7684] dark:text-[#8A94A6] mb-1">
              <span>Total Pelanggan Terdaftar</span>
              <IconUsers size={15} className="text-[#2B5FC7]" />
            </div>
            <div className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3]">
              {customers.length} Klien
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]">
            <div className="text-xs text-[#6B7684] dark:text-[#8A94A6] mb-1">Pelanggan Aktif Repeat</div>
            <div className="text-2xl font-bold text-[#059669] dark:text-[#34D399]">
              {customers.filter((c) => c.active && c.totalRepeatOrders > 1).length} Klien
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]">
            <div className="text-xs text-[#6B7684] dark:text-[#8A94A6] mb-1">Total Akumulasi Repeat Order</div>
            <div className="text-2xl font-bold text-[#2B5FC7] dark:text-[#60A5FA]">
              {customers.reduce((acc, c) => acc + c.totalRepeatOrders, 0)} Pesanan
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]">
            <div className="text-xs text-[#6B7684] dark:text-[#8A94A6] mb-1">Segmen Dominan</div>
            <div className="text-base font-bold text-[#1B2436] dark:text-[#E8ECF3] mt-1">
              Korporat B2B & Skincare
            </div>
          </div>
        </section>

        <DataTable
          columns={columns}
          data={customers}
          keyExtractor={(c) => c.id}
          loading={false}
          error={null}
          searchPlaceholder="Cari kode pelanggan, nama perusahaan, PIC, nomor WA, atau spesifikasi produk..."
          searchFilter={(c, q) =>
            c.name.toLowerCase().includes(q) ||
            c.code.toLowerCase().includes(q) ||
            c.pic.toLowerCase().includes(q) ||
            c.phone.toLowerCase().includes(q) ||
            (c.lastProductSpec || "").toLowerCase().includes(q)
          }
          defaultSort={{ key: "code", direction: "asc" }}
          emptyTitle="Belum Ada Data Pelanggan"
          emptySubtitle="Tambahkan pelanggan baru atau input dari menu Order Pelanggan."
        />

        {/* Modal Tambah / Edit */}
        <FormModal
          open={isAddOpen || !!editItem}
          onClose={() => {
            setIsAddOpen(false);
            setEditItem(null);
          }}
          title={editItem ? `Edit Pelanggan · ${editItem.code}` : "Tambah Pelanggan Baru"}
          subtitle="Data pelanggan ini otomatis muncul pada opsi Pelanggan Repeat di Form Input Order Front Office."
          icon={<IconUsers size={20} />}
          onSubmit={handleSave}
          submitLabel={editItem ? "Simpan Perubahan" : "Simpan Pelanggan"}
          error={formError}
          size="md"
        >
          <div className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1.5">
                  Kode Pelanggan *
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="CUST-006"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1.5">
                  Segmen Klien
                </label>
                <select
                  value={segment}
                  onChange={(e) => setSegment(e.target.value as CustomerSegment)}
                  className={inputBase}
                >
                  {SEGMENTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1.5">
                Nama Perusahaan / Pelanggan *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: PT Kosmetik Nusantara"
                className={inputBase}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1.5">
                  Nama Kontak PIC
                </label>
                <input
                  value={pic}
                  onChange={(e) => setPic(e.target.value)}
                  placeholder="Contoh: Ibu Diana"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1.5">
                  No. WhatsApp / Telepon *
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className={inputBase}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1.5">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="purchasing@perusahaan.co.id"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1.5">
                  Brand Utama yang Dipesan
                </label>
                <select
                  value={preferredBrand}
                  onChange={(e) => setPreferredBrand(e.target.value)}
                  className={inputBase}
                >
                  {brandList.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1.5">
                Alamat Pengiriman
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat gudang / kantor tujuan pengiriman"
                className={inputBase}
              />
            </div>

            <div className="p-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] space-y-3">
              <div className="text-[11px] font-bold text-[#2B5FC7] dark:text-[#60A5FA] uppercase tracking-wider">
                Template Spesifikasi Repeat Order (Opsional)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#6B7684] dark:text-[#8A94A6] mb-1">
                    Produk Cetak Langganan
                  </label>
                  <input
                    value={lastProductSpec}
                    onChange={(e) => setLastProductSpec(e.target.value)}
                    placeholder="Contoh: Hardbox Serum 30ml"
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#6B7684] dark:text-[#8A94A6] mb-1">
                    Ukuran Default (P × L × T)
                  </label>
                  <input
                    value={lastDimensions}
                    onChange={(e) => setLastDimensions(e.target.value)}
                    placeholder="Contoh: 15 × 10 × 5 cm"
                    className={inputBase}
                  />
                </div>
              </div>
            </div>
          </div>
        </FormModal>

        {/* Confirm Toggle */}
        <ConfirmDialog
          open={!!toggleItem}
          onClose={() => setToggleItem(null)}
          onConfirm={() => {
            if (!toggleItem) return;
            updateCustomers(
              customers.map((c) => (c.id === toggleItem.id ? { ...c, active: !c.active } : c))
            );
            setToggleItem(null);
          }}
          title={toggleItem?.active ? "Nonaktifkan Pelanggan?" : "Aktifkan Pelanggan?"}
          message={`Status pelanggan "${toggleItem?.name}" akan diubah.`}
          confirmLabel={toggleItem?.active ? "Nonaktifkan" : "Aktifkan"}
          tone={toggleItem?.active ? "danger" : "primary"}
        />

        {/* Confirm Delete */}
        <ConfirmDialog
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={() => {
            if (!deleteItem) return;
            updateCustomers(customers.filter((c) => c.id !== deleteItem.id));
            setDeleteItem(null);
          }}
          title="Hapus Permanen Pelanggan?"
          message={`Data pelanggan "${deleteItem?.name}" akan dihapus dari Master Pelanggan.`}
          confirmLabel="Hapus Permanen"
          tone="danger"
        />
      </div>
    </DashboardLayout>
  );
}

