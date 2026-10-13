"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  createCustomerRecord,
  CustomerRecord,
  CustomerStatus,
  NewCustomerRecord,
  useCustomers,
} from "@/lib/customerData";

export default function CustomersPage() {
  const [customers, setCustomers] = useCustomers();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CustomerStatus | "Semua">("Semua");

  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerRecord | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [editingCustomer, setEditingCustomer] =
    useState<CustomerRecord | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        customer.companyName.toLowerCase().includes(searchValue) ||
        customer.picName.toLowerCase().includes(searchValue) ||
        customer.phone.toLowerCase().includes(searchValue) ||
        customer.brand.toLowerCase().includes(searchValue);

      const matchesStatus =
        status === "Semua" || customer.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, status]);

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Aktif"
  ).length;

  const inactiveCustomers = customers.filter(
    (customer) => customer.status === "Nonaktif"
  ).length;

  const activeOrders = customers.reduce(
    (total, customer) => total + customer.activeOrders,
    0
  );

  const handleSaveCustomer = (
    customer: NewCustomerRecord,
  ) => {
    if (editingCustomer) {
      setCustomers((current) =>
        current.map((customerItem) =>
          customerItem.id === editingCustomer.id
            ? {
                ...customerItem,
                ...customer,
              }
            : customerItem
        )
      );
    } else {
      const newCustomer = createCustomerRecord(customer, customers);

      setCustomers((current) => [...current, newCustomer]);
    }

    setShowForm(false);
    setEditingCustomer(null);
  };

  return (
    <DashboardLayout title="Data Pelanggan">
      <div className="min-h-full bg-[#0f1b2d] px-5 py-6">
      <div className="mx-auto max-w-[1400px]">

        {/* HEADER */}
        <div className="flex flex-col gap-4 border-b border-slate-700 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Master Data • Pelanggan
            </div>

            <h1 className="mt-2 text-2xl font-bold text-white">
              Data Pelanggan
            </h1>

            <p className="mt-1 text-xs text-slate-400">
              Kelola informasi pelanggan, brand, kontak, dan riwayat order.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingCustomer(null);
              setShowForm(true);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500"
          >
            + Tambah Pelanggan
          </button>
        </div>

        {/* STATISTICS */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total Pelanggan"
            value={totalCustomers}
            description="Pelanggan terdaftar"
            icon="◉"
          />

          <StatCard
            title="Pelanggan Aktif"
            value={activeCustomers}
            description="Masih aktif"
            icon="✓"
          />

          <StatCard
            title="Pelanggan Nonaktif"
            value={inactiveCustomers}
            description="Tidak aktif"
            icon="−"
          />

          <StatCard
            title="Order Aktif"
            value={activeOrders}
            description="Sedang berjalan"
            icon="▣"
          />

        </div>

        {/* FILTER */}
        <div className="mt-4 rounded-xl border border-slate-700/70 bg-[#17243b] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative w-full lg:max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama pelanggan, perusahaan, PIC..."
                className="w-full rounded-lg border border-slate-700 bg-[#101b2e] py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            <select
              value={status}
              onChange={(event) => {
                const value = event.target.value;
                if (
                  value === "Semua" ||
                  value === "Aktif" ||
                  value === "Nonaktif"
                ) {
                  setStatus(value);
                }
              }}
              className="rounded-lg border border-slate-700 bg-[#101b2e] px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>

          </div>
        </div>

        {/* TABLE */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-700/70 bg-[#17243b]">

          <div className="border-b border-slate-700 px-4 py-4">
            <h2 className="text-sm font-semibold text-white">
              Daftar Pelanggan
            </h2>

            <p className="mt-1 text-[11px] text-slate-500">
              Data pelanggan yang terdaftar pada sistem.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">

              <thead>
                <tr className="border-b border-slate-700 bg-[#1c2a43]">

                  <th className="px-4 py-3 text-[11px] font-medium text-slate-400">
                    Pelanggan
                  </th>

                  <th className="px-4 py-3 text-[11px] font-medium text-slate-400">
                    PIC & Kontak
                  </th>

                  <th className="px-4 py-3 text-[11px] font-medium text-slate-400">
                    Brand
                  </th>

                  <th className="px-4 py-3 text-[11px] font-medium text-slate-400">
                    Total Order
                  </th>

                  <th className="px-4 py-3 text-[11px] font-medium text-slate-400">
                    Order Aktif
                  </th>

                  <th className="px-4 py-3 text-[11px] font-medium text-slate-400">
                    Status
                  </th>

                  <th className="px-4 py-3 text-[11px] font-medium text-slate-400">
                    Aksi
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-slate-800 transition hover:bg-[#1b2942]"
                  >

                    <td className="px-4 py-4">
                      <p className="text-xs font-semibold text-white">
                        {customer.companyName}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-500">
                        {customer.id}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-xs text-slate-200">
                        {customer.picName}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-500">
                        {customer.phone}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-md bg-blue-500/10 px-2 py-1 text-[10px] text-blue-300">
                        {customer.brand}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-xs font-medium text-white">
                      {customer.totalOrders}
                    </td>

                    <td className="px-4 py-4 text-xs font-medium text-white">
                      {customer.activeOrders}
                    </td>

                    <td className="px-4 py-4">

                      <span
                        className={`rounded-md px-2 py-1 text-[10px] ${
                          customer.status === "Aktif"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-slate-500/10 text-slate-400"
                        }`}
                      >
                        {customer.status}
                      </span>

                    </td>

                    <td className="px-4 py-4">

                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="rounded-md border border-slate-600 px-3 py-1.5 text-[10px] font-medium text-slate-300 transition hover:border-blue-500 hover:text-blue-400"
                      >
                        Detail
                      </button>

                    </td>

                  </tr>
                ))}

                {filteredCustomers.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-xs text-slate-500"
                    >
                      Tidak ada pelanggan yang ditemukan.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>
          </div>

        </div>

      </div>

      {/* DETAIL DRAWER */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50">

          <div className="h-full w-full max-w-md overflow-y-auto border-l border-slate-700 bg-[#101b2e]">

            <div className="sticky top-0 flex items-center justify-between border-b border-slate-700 bg-[#101b2e] px-5 py-4">

              <div>
                <p className="text-[10px] uppercase tracking-wider text-blue-400">
                  Detail Pelanggan
                </p>

                <h2 className="mt-1 text-sm font-semibold text-white">
                  {selectedCustomer.companyName}
                </h2>

                <p className="mt-1 text-[10px] text-slate-500">
                  {selectedCustomer.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:text-white"
              >
                ×
              </button>

            </div>

            <div className="space-y-6 p-5">

              {/* INFO */}
              <div>

                <div className="flex items-center justify-between">

                  <h3 className="text-xs font-semibold text-white">
                    Informasi Pelanggan
                  </h3>

                  <span
                    className={`rounded-md px-2 py-1 text-[10px] ${
                      selectedCustomer.status === "Aktif"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-slate-500/10 text-slate-400"
                    }`}
                  >
                    {selectedCustomer.status}
                  </span>

                </div>

                <div className="mt-4 space-y-4">

                  <InfoItem
                    label="Nama Perusahaan"
                    value={selectedCustomer.companyName}
                  />

                  <InfoItem
                    label="PIC"
                    value={selectedCustomer.picName}
                  />

                  <InfoItem
                    label="WhatsApp"
                    value={selectedCustomer.phone}
                  />

                  <InfoItem
                    label="Email"
                    value={selectedCustomer.email}
                  />

                  <InfoItem
                    label="Brand"
                    value={selectedCustomer.brand}
                  />

                  <InfoItem
                    label="Alamat"
                    value={selectedCustomer.address}
                  />

                  <InfoItem
                    label="Tanggal Bergabung"
                    value={selectedCustomer.joinedDate}
                  />

                  <InfoItem
                    label="Catatan"
                    value={selectedCustomer.notes}
                  />

                </div>

              </div>

              {/* SUMMARY */}
              <div className="grid grid-cols-2 gap-3">

                <div className="rounded-lg border border-slate-700 bg-[#17243b] p-3">
                  <p className="text-[10px] text-slate-500">
                    Total Order
                  </p>

                  <p className="mt-1 text-lg font-bold text-white">
                    {selectedCustomer.totalOrders}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-700 bg-[#17243b] p-3">
                  <p className="text-[10px] text-slate-500">
                    Order Aktif
                  </p>

                  <p className="mt-1 text-lg font-bold text-blue-400">
                    {selectedCustomer.activeOrders}
                  </p>
                </div>

              </div>

              {/* RIWAYAT ORDER */}
              <div>

                <h3 className="text-xs font-semibold text-white">
                  Riwayat Order
                </h3>

                <div className="mt-3 space-y-2">

                  <OrderHistory
                    id="ORD-2026-0981"
                    product="Hardbox Premium"
                    quantity="2.500 pcs"
                    status="Selesai"
                  />

                  <OrderHistory
                    id="ORD-2026-0992"
                    product="Packaging Box"
                    quantity="5.000 pcs"
                    status="Produksi"
                  />

                  <OrderHistory
                    id="ORD-2026-0104"
                    product="Paper Bag"
                    quantity="3.000 pcs"
                    status="Order Placed"
                  />

                </div>

              </div>

              {/* ACTION */}
              <div className="flex gap-2 border-t border-slate-700 pt-4">

                <button
                  onClick={() => {
                    setEditingCustomer(selectedCustomer);
                    setSelectedCustomer(null);
                    setShowForm(true);
                  }}
                  className="flex-1 rounded-lg border border-slate-600 px-4 py-2.5 text-xs font-medium text-slate-300 hover:border-blue-500 hover:text-blue-400"
                >
                  Edit Pelanggan
                </button>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-blue-500"
                >
                  Tutup
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* FORM TAMBAH / EDIT */}
      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onClose={() => {
            setShowForm(false);
            setEditingCustomer(null);
          }}
          onSave={handleSaveCustomer}
        />
      )}

      </div>
    </DashboardLayout>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-slate-700/70 bg-[#17243b] p-4">

      <div className="flex items-center justify-between">

        <p className="text-xs text-slate-400">
          {title}
        </p>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-sm text-blue-400">
          {icon}
        </div>

      </div>

      <p className="mt-3 text-2xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* ============================================================
   INFO ITEM
============================================================ */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-[10px] text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-200">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   ORDER HISTORY
============================================================ */

function OrderHistory({
  id,
  product,
  quantity,
  status,
}: {
  id: string;
  product: string;
  quantity: string;
  status: string;
}) {
  return (
    <div className="rounded-lg border border-slate-700 bg-[#101b2e] p-3">

      <div className="flex items-center justify-between gap-3">

        <div>

          <p className="text-[10px] text-blue-400">
            {id}
          </p>

          <p className="mt-1 text-xs font-medium text-white">
            {product}
          </p>

          <p className="mt-1 text-[10px] text-slate-500">
            {quantity}
          </p>

        </div>

        <span className="rounded-md bg-blue-500/10 px-2 py-1 text-[10px] text-blue-300">
          {status}
        </span>

      </div>

    </div>
  );
}

/* ============================================================
   CUSTOMER FORM
============================================================ */

function CustomerForm({
  customer,
  onClose,
  onSave,
}: {
  customer: CustomerRecord | null;
  onClose: () => void;
  onSave: (customer: NewCustomerRecord) => void;
}) {
  const [form, setForm] = useState<NewCustomerRecord>({
    companyName: customer?.companyName || "",
    picName: customer?.picName || "",
    phone: customer?.phone || "",
    email: customer?.email || "",
    brand: customer?.brand || "",
    address: customer?.address || "",
    status: customer?.status || "Aktif",
    notes: customer?.notes || "",
  });

  const updateField = <K extends keyof NewCustomerRecord>(
    field: K,
    value: NewCustomerRecord[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.companyName || !form.picName || !form.phone) {
      alert("Nama perusahaan, PIC, dan nomor WhatsApp wajib diisi.");
      return;
    }

    onSave({
      ...form,
      status: form.status,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">

      <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-[#101b2e] shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">

          <div>

            <p className="text-[10px] uppercase tracking-wider text-blue-400">
              Master Data
            </p>

            <h2 className="mt-1 text-sm font-semibold text-white">
              {customer ? "Edit Pelanggan" : "Tambah Pelanggan"}
            </h2>

          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:text-white"
          >
            ×
          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="max-h-[75vh] overflow-y-auto p-5"
        >

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <InputField
              label="Nama Perusahaan *"
              value={form.companyName}
              onChange={(value) =>
                updateField("companyName", value)
              }
              placeholder="Contoh: PT Artha Boga Sejahtera"
            />

            <InputField
              label="Nama PIC *"
              value={form.picName}
              onChange={(value) =>
                updateField("picName", value)
              }
              placeholder="Nama penanggung jawab"
            />

            <InputField
              label="Nomor WhatsApp *"
              value={form.phone}
              onChange={(value) =>
                updateField("phone", value)
              }
              placeholder="08xxxxxxxxxx"
            />

            <InputField
              label="Email"
              value={form.email}
              onChange={(value) =>
                updateField("email", value)
              }
              placeholder="customer@email.com"
            />

            <InputField
              label="Brand"
              value={form.brand}
              onChange={(value) =>
                updateField("brand", value)
              }
              placeholder="Nama brand"
            />

            <div>
              <label className="mb-1.5 block text-[10px] text-slate-400">
                Status
              </label>

              <select
                value={form.status}
                onChange={(event) =>
                  updateField("status", event.target.value as CustomerStatus)
                }
                className="w-full rounded-lg border border-slate-700 bg-[#17243b] px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500"
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[10px] text-slate-400">
                Alamat
              </label>

              <textarea
                value={form.address}
                onChange={(event) =>
                  updateField("address", event.target.value)
                }
                placeholder="Alamat perusahaan"
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-700 bg-[#17243b] px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[10px] text-slate-400">
                Catatan
              </label>

              <textarea
                value={form.notes}
                onChange={(event) =>
                  updateField("notes", event.target.value)
                }
                placeholder="Catatan tambahan mengenai pelanggan"
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-700 bg-[#17243b] px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

          </div>

          {/* BUTTON */}

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-700 pt-4">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-600 px-4 py-2.5 text-xs font-medium text-slate-300 hover:border-slate-500"
            >
              Batal
            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500"
            >
              {customer ? "Simpan Perubahan" : "Simpan Pelanggan"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

/* ============================================================
   INPUT FIELD
============================================================ */

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>

      <label className="mb-1.5 block text-[10px] text-slate-400">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-700 bg-[#17243b] px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
      />

    </div>
  );
}