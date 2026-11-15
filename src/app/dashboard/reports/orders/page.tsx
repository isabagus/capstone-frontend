"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useBrands } from "@/hooks/useInventoryData";
import { calculatePriorityFromDeadline } from "@/services/partnerMasterStore";
import { downloadCsvReport } from "@/utils/exportCsv";
import {
  IconOrders,
  IconDownload,
  IconPrinter,
  IconSearch,
  IconRefresh,
  IconTrendingUp,
  IconTrendingDown,
  IconDollar,
} from "@/components/icons/Icons";

interface OrderReportRow {
  id: string;
  orderNumber: string;
  invoiceNo: string;
  orderDate: string;
  deadlineDate: string;
  client: string;
  customerType: "Repeat" | "Baru";
  brand: string;
  serviceType: "Jasa Cetak Custom" | "Beli Produk Jadi";
  product: string;
  qty: number;
  revenue: number;
  cogsTotal: number;
  netProfit: number;
  status: string;
}

const ORDER_REPORT_DATA: OrderReportRow[] = [
  {
    id: "1",
    orderNumber: "ORD-2026-0901",
    invoiceNo: "INV-2026-0901",
    orderDate: "2026-09-24",
    deadlineDate: "2026-11-16",
    client: "PT Artha Boga Sejahtera",
    customerType: "Repeat",
    brand: "Packsolution.id",
    serviceType: "Jasa Cetak Custom",
    product: "Hardbox Rigid Premium Magnetic Gold",
    qty: 2500,
    revenue: 42500000,
    cogsTotal: 25200000,
    netProfit: 17300000,
    status: "In-Production",
  },
  {
    id: "2",
    orderNumber: "ORD-2026-0902",
    invoiceNo: "INV-2026-0902",
    orderDate: "2026-09-22",
    deadlineDate: "2026-11-19",
    client: "Estella Glow Skincare",
    customerType: "Repeat",
    brand: "Estella",
    serviceType: "Jasa Cetak Custom",
    product: "Softbox Skincare Serum Matte Doff",
    qty: 5000,
    revenue: 28500000,
    cogsTotal: 16300000,
    netProfit: 12200000,
    status: "Queued for Design",
  },
  {
    id: "3",
    orderNumber: "ORD-2026-0903",
    invoiceNo: "INV-2026-0903",
    orderDate: "2026-09-19",
    deadlineDate: "2026-11-17",
    client: "Kopi Kenangan Senja",
    customerType: "Repeat",
    brand: "Packsolution.id",
    serviceType: "Beli Produk Jadi",
    product: "[READY STOCK] Lunch Box Eco-Kraft Laminated M",
    qty: 10000,
    revenue: 19500000,
    cogsTotal: 11800000,
    netProfit: 7700000,
    status: "Siap Kirim (Ready Stock)",
  },
  {
    id: "4",
    orderNumber: "ORD-2026-0904",
    invoiceNo: "INV-2026-0904",
    orderDate: "2026-09-15",
    deadlineDate: "2026-11-23",
    client: "Pepipapier Stationery",
    customerType: "Repeat",
    brand: "Pepipapier",
    serviceType: "Jasa Cetak Custom",
    product: "Greeting Card & Custom Envelope Foil",
    qty: 1200,
    revenue: 14800000,
    cogsTotal: 8800000,
    netProfit: 6000000,
    status: "Design Approved",
  },
  {
    id: "5",
    orderNumber: "ORD-2026-0905",
    invoiceNo: "INV-2026-0905",
    orderDate: "2026-09-11",
    deadlineDate: "2026-11-25",
    client: "Studio Foto Memoirs",
    customerType: "Baru",
    brand: "memoirs.print",
    serviceType: "Jasa Cetak Custom",
    product: "Photobook Hardcover Linen Series",
    qty: 350,
    revenue: 22400000,
    cogsTotal: 12700000,
    netProfit: 9700000,
    status: "In-Production",
  },
  {
    id: "6",
    orderNumber: "ORD-2026-0906",
    invoiceNo: "INV-2026-0906",
    orderDate: "2026-09-06",
    deadlineDate: "2026-11-28",
    client: "UMKM Roti Bakar Bandung",
    customerType: "Baru",
    brand: "Packsolution.id",
    serviceType: "Beli Produk Jadi",
    product: "[READY STOCK] Dus Kemasan Roti Kraft Polos",
    qty: 4000,
    revenue: 8800000,
    cogsTotal: 5200000,
    netProfit: 3600000,
    status: "Siap Kirim (Ready Stock)",
  },
];

export default function OrdersReportPage() {
  const dynamicBrands = useBrands();
  const brandOptions = ["Semua", ...dynamicBrands];

  const [brandFilter, setBrandFilter] = useState<string>("Semua");
  const [serviceFilter, setServiceFilter] = useState<string>("Semua");
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>("Semua");
  const [search, setSearch] = useState<string>("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ORDER_REPORT_DATA.filter((row) => {
      if (brandFilter !== "Semua" && row.brand.toLowerCase() !== brandFilter.toLowerCase()) return false;
      if (serviceFilter !== "Semua" && row.serviceType !== serviceFilter) return false;
      if (customerTypeFilter !== "Semua" && row.customerType !== customerTypeFilter) return false;
      if (
        q &&
        !row.orderNumber.toLowerCase().includes(q) &&
        !row.client.toLowerCase().includes(q) &&
        !row.product.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    }).sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate));
  }, [brandFilter, serviceFilter, customerTypeFilter, search]);

  const totalRevenue = filtered.reduce((s, r) => s + r.revenue, 0);
  const totalExpenses = filtered.reduce((s, r) => s + r.cogsTotal, 0);
  const totalProfit = filtered.reduce((s, r) => s + r.netProfit, 0);

  const handleExportCsv = () => {
    downloadCsvReport(
      "Laporan_Order_Penjualan.csv",
      [
        "No. Order",
        "No. Invoice",
        "Tanggal Order",
        "Deadline",
        "Prioritas Otomatis",
        "Pelanggan",
        "Tipe Pelanggan",
        "Brand",
        "Jenis Layanan",
        "Produk",
        "Qty",
        "Pemasukan (IDR)",
        "HPP & Pengeluaran (IDR)",
        "Profit Bersih (IDR)",
        "Status",
      ],
      filtered.map((r) => {
        const pInfo = calculatePriorityFromDeadline(r.deadlineDate);
        return [
          r.orderNumber,
          r.invoiceNo,
          r.orderDate,
          r.deadlineDate,
          pInfo.priority,
          r.client,
          r.customerType,
          r.brand,
          r.serviceType,
          r.product,
          r.qty,
          r.revenue,
          r.cogsTotal,
          r.netProfit,
          r.status,
        ];
      })
    );
  };

  return (
    <DashboardLayout title="Laporan Order">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2E6ED] dark:border-[#26334D]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#2B5FC7]/10 text-[#2B5FC7] dark:text-[#60A5FA]">
                <IconOrders size={18} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B5FC7] dark:text-[#60A5FA]">
                Menu Laporan · Rekapitulasi Order, Pemasukan, Pengeluaran &amp; Profit
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3]">
              Laporan Order &amp; Penjualan Bulanan
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
              Rekap pesanan pelanggan (diurutkan dari deadline paling mepet), jenis layanan Jasa Cetak vs Produk Jadi, serta kalkulasi Pemasukan, Pengeluaran &amp; Profit.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#2B5FC7] text-[#2B5FC7] hover:bg-[#2B5FC7]/10 dark:border-[#3B6FE0] dark:text-[#60A5FA] flex items-center gap-1.5 transition-colors"
            >
              <IconDownload size={14} />
              <span>Ekspor CSV / Excel</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <IconPrinter size={14} />
              <span>Cetak / Ekspor PDF</span>
            </button>
          </div>
        </div>

        {/* Summary Cards: Pemasukan, Pengeluaran, Profit */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#6B7684]">
              <span>Total Pemasukan Order (Omzet)</span>
              <IconTrendingUp size={15} className="text-[#2B5FC7]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#2B5FC7] dark:text-[#60A5FA] mt-1">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#991B1B] dark:text-[#F87171]">
              <span>Total Pengeluaran / HPP Order</span>
              <IconTrendingDown size={15} />
            </div>
            <div className="text-2xl font-bold font-mono text-[#991B1B] dark:text-[#F87171] mt-1">
              Rp {totalExpenses.toLocaleString("id-ID")}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#A7F3D0] dark:border-[#065F46] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#059669]">
              <span>Total Profit Bersih</span>
              <IconDollar size={15} />
            </div>
            <div className="text-2xl font-bold font-mono text-[#059669] dark:text-[#34D399] mt-1">
              +Rp {totalProfit.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7684]" />
            <input
              type="text"
              placeholder="Cari No. Order, nama pelanggan, atau produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]"
            >
              {brandOptions.map((b) => (
                <option key={b} value={b}>
                  {b === "Semua" ? "Semua Brand" : b}
                </option>
              ))}
            </select>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]"
            >
              <option value="Semua">Semua Jenis Layanan</option>
              <option value="Jasa Cetak Custom">Jasa Cetak Custom</option>
              <option value="Beli Produk Jadi">Beli Produk Jadi</option>
            </select>

            <select
              value={customerTypeFilter}
              onChange={(e) => setCustomerTypeFilter(e.target.value)}
              className="h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]"
            >
              <option value="Semua">Semua Tipe Pelanggan</option>
              <option value="Repeat">Pelanggan Repeat</option>
              <option value="Baru">Pelanggan Baru</option>
            </select>

            <button
              onClick={() => {
                setBrandFilter("Semua");
                setServiceFilter("Semua");
                setCustomerTypeFilter("Semua");
                setSearch("");
              }}
              className="text-xs font-medium text-[#2B5FC7] hover:underline flex items-center gap-1"
            >
              <IconRefresh size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F4F6FA] dark:bg-[#1B2A44] border-b border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">No. Order &amp; Tgl</th>
                  <th className="py-3 px-4">Deadline &amp; Prioritas</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Brand &amp; Layanan</th>
                  <th className="py-3 px-4">Produk &amp; Qty</th>
                  <th className="py-3 px-4 text-right">Pemasukan</th>
                  <th className="py-3 px-4 text-right">HPP / Biaya</th>
                  <th className="py-3 px-4 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]">
                {filtered.map((row) => {
                  const pInfo = calculatePriorityFromDeadline(row.deadlineDate);
                  return (
                    <tr key={row.id} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/50">
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-[#2B5FC7] dark:text-[#60A5FA]">{row.orderNumber}</div>
                        <div className="text-[10px] text-[#6B7684]">{row.orderDate}</div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div className="font-semibold">{row.deadlineDate}</div>
                        <span
                          className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            pInfo.priority === "Express"
                              ? "bg-[#FEF2F2] text-[#991B1B]"
                              : pInfo.priority === "High"
                              ? "bg-[#FFFBEB] text-[#92400E]"
                              : "bg-[#F4F6FA] text-[#6B7684]"
                          }`}
                        >
                          {pInfo.priority} ({pInfo.countdownLabel})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold">{row.client}</div>
                        <div className="text-[10px] text-[#6B7684]">Pelanggan {row.customerType}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold">{row.brand}</div>
                        <div className="text-[10px] text-[#2B5FC7]">{row.serviceType}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{row.product}</div>
                        <div className="text-[10px] text-[#6B7684]">
                          {row.qty.toLocaleString("id-ID")} pcs
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#2B5FC7] dark:text-[#60A5FA]">
                        Rp {row.revenue.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#6B7684]">
                        Rp {row.cogsTotal.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#059669] dark:text-[#34D399]">
                        +Rp {row.netProfit.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

