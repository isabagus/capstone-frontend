"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  CustomerRecord,
  CustomerStatus,
  useCustomers,
} from "@/lib/customerData";

export default function CustomersPage() {
  const [customers] = useCustomers();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CustomerStatus | "Semua">("Semua");

  const [selectedCustomer, setSelectedCustomer] =
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

  return (
    <DashboardLayout title="Data Pelanggan">
      <div className="min-h-full bg-slate-50 px-5 py-6 dark:bg-[#0F1B2D]">
      <div className="mx-auto max-w-[1400px]">

        {/* HEADER */}
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-[#26334D] lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-[#3B6FE0]">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Master Data • Pelanggan
            </div>

            <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-[#E8ECF3]">
              Data Pelanggan
            </h1>

            <p className="mt-1 text-xs text-slate-600 dark:text-[#8A94A6]">
              Lihat informasi pelanggan, brand, kontak, dan riwayat order.
            </p>
          </div>
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
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#26334D] dark:bg-[#16223A] dark:shadow-none">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative w-full lg:max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-[#8A94A6]">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama pelanggan, perusahaan, PIC..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-700 outline-none placeholder:text-slate-500 focus:border-blue-500 dark:border-[#26334D] dark:bg-[#0F1B2D] dark:text-[#E8ECF3] dark:placeholder:text-[#8A94A6]"
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
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-500 dark:border-[#26334D] dark:bg-[#0F1B2D] dark:text-[#E8ECF3]"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>

          </div>
        </div>

        {/* TABLE */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#26334D] dark:bg-[#16223A] dark:shadow-none">

          <div className="border-b border-slate-200 px-4 py-4 dark:border-[#26334D]">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-[#E8ECF3]">
              Daftar Pelanggan
            </h2>

            <p className="mt-1 text-[11px] text-slate-500 dark:text-[#8A94A6]">
              Data pelanggan yang terdaftar pada sistem.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-[#26334D] dark:bg-[#1B2A44]">

                  <th className="px-4 py-3 text-[11px] font-medium text-slate-600 dark:text-[#8A94A6]">
                    Pelanggan
                  </th>

                  <th className="px-4 py-3 text-[11px] font-medium text-slate-600 dark:text-[#8A94A6]">
                    PIC & Kontak
                  </th>

                  <th className="px-4 py-3 text-[11px] font-medium text-slate-600 dark:text-[#8A94A6]">
                    Brand
                  </th>

                  <th className="px-4 py-3 text-[11px] font-medium text-slate-600 dark:text-[#8A94A6]">
                    Total Order
                  </th>

                  <th className="px-4 py-3 text-[11px] font-medium text-slate-600 dark:text-[#8A94A6]">
                    Order Aktif
                  </th>

                  <th className="px-4 py-3 text-[11px] font-medium text-slate-600 dark:text-[#8A94A6]">
                    Status
                  </th>

                  <th className="px-4 py-3 text-[11px] font-medium text-slate-600 dark:text-[#8A94A6]">
                    Aksi
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-slate-200 transition hover:bg-slate-50 dark:border-[#26334D] dark:hover:bg-[#1B2A44]"
                  >

                    <td className="px-4 py-4">
                      <p className="text-xs font-semibold text-slate-900 dark:text-[#E8ECF3]">
                        {customer.companyName}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-500 dark:text-[#8A94A6]">
                        {customer.id}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-xs text-slate-700 dark:text-[#E8ECF3]">
                        {customer.picName}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-500 dark:text-[#8A94A6]">
                        {customer.phone}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] text-blue-700 dark:bg-[#1D4ED8]/25 dark:text-[#93B4F5]">
                        {customer.brand}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-xs font-medium text-slate-700 dark:text-[#E8ECF3]">
                      {customer.totalOrders}
                    </td>

                    <td className="px-4 py-4 text-xs font-medium text-slate-700 dark:text-[#E8ECF3]">
                      {customer.activeOrders}
                    </td>

                    <td className="px-4 py-4">

                      <span
                        className={`rounded-md px-2 py-1 text-[10px] ${
                          customer.status === "Aktif"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-[#064E3B]/40 dark:text-[#34D399]"
                            : "bg-slate-200 text-slate-700 dark:bg-[#26334D] dark:text-[#8A94A6]"
                        }`}
                      >
                        {customer.status}
                      </span>

                    </td>

                    <td className="px-4 py-4">

                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-[#26334D] dark:bg-[#1B2A44] dark:text-[#E8ECF3] dark:hover:border-[#3B6FE0] dark:hover:text-[#93B4F5]"
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
                      className="px-4 py-10 text-center text-xs text-slate-500 dark:text-[#8A94A6]"
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
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 dark:bg-black/60">

          <div className="h-full w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white dark:border-[#26334D] dark:bg-[#16223A]">

            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-[#26334D] dark:bg-[#16223A]">

              <div>
                <p className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-[#3B6FE0]">
                  Detail Pelanggan
                </p>

                <h2 className="mt-1 text-sm font-semibold text-slate-900 dark:text-[#E8ECF3]">
                  {selectedCustomer.companyName}
                </h2>

                <p className="mt-1 text-[10px] text-slate-500 dark:text-[#8A94A6]">
                  {selectedCustomer.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 dark:border-[#26334D] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3]"
              >
                ×
              </button>

            </div>

            <div className="space-y-6 p-5">

              {/* INFO */}
              <div>

                <div className="flex items-center justify-between">

                  <h3 className="text-xs font-semibold text-slate-900 dark:text-[#E8ECF3]">
                    Informasi Pelanggan
                  </h3>

                  <span
                    className={`rounded-md px-2 py-1 text-[10px] ${
                      selectedCustomer.status === "Aktif"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-[#064E3B]/40 dark:text-[#34D399]"
                        : "bg-slate-200 text-slate-700 dark:bg-[#26334D] dark:text-[#8A94A6]"
                    }`}                   >
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

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-[#26334D] dark:bg-[#0F1B2D]">
                  <p className="text-[10px] text-slate-500 dark:text-[#8A94A6]">
                    Total Order
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-[#E8ECF3]">
                    {selectedCustomer.totalOrders}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-[#26334D] dark:bg-[#0F1B2D]">
                  <p className="text-[10px] text-slate-500 dark:text-[#8A94A6]">
                    Order Aktif
                  </p>

                  <p className="mt-1 text-lg font-bold text-blue-600 dark:text-[#3B6FE0]">
                    {selectedCustomer.activeOrders}
                  </p>
                </div>

              </div>

              {/* RIWAYAT ORDER */}
              <div>

                <h3 className="text-xs font-semibold text-slate-900 dark:text-[#E8ECF3]">
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

              <div className="border-t border-slate-200 pt-4 dark:border-[#26334D]">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-blue-500 dark:bg-[#3B6FE0] dark:hover:bg-[#2B5FC7]"
                >
                  Tutup
                </button>
              </div>

            </div>

          </div>

        </div>
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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#26334D] dark:bg-[#16223A] dark:shadow-none">

      <div className="flex items-center justify-between">

        <p className="text-xs text-slate-600 dark:text-[#8A94A6]">
          {title}
        </p>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-sm text-blue-600 dark:bg-[#1D4ED8]/25 dark:text-[#93B4F5]">
          {icon}
        </div>

      </div>

      <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-[#E8ECF3]">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-500 dark:text-[#8A94A6]">
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

      <p className="text-[10px] text-slate-500 dark:text-[#8A94A6]">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-700 dark:text-[#E8ECF3]">
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
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-[#26334D] dark:bg-[#0F1B2D]">

      <div className="flex items-center justify-between gap-3">

        <div>

          <p className="text-[10px] text-blue-600 dark:text-[#3B6FE0]">
            {id}
          </p>

          <p className="mt-1 text-xs font-medium text-slate-900 dark:text-[#E8ECF3]">
            {product}
          </p>

          <p className="mt-1 text-[10px] text-slate-500 dark:text-[#8A94A6]">
            {quantity}
          </p>

        </div>

        <span className="rounded-md bg-blue-100 px-2 py-1 text-[10px] text-blue-700 dark:bg-[#1D4ED8]/25 dark:text-[#93B4F5]">
          {status}
        </span>

      </div>

    </div>
  );
}
