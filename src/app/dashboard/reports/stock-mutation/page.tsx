"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { downloadCsvReport } from "@/utils/exportCsv";
import {
  IconReport,
  IconDownload,
  IconPrinter,
  IconSearch,
  IconWarehouse,
  IconArrowIn,
  IconArrowOut,
  IconTransfer,
  IconRefresh,
} from "@/components/icons/Icons";

interface StockMutationRow {
  id: string;
  mutationCode: string;
  date: string;
  warehouse: "Gudang 1 (Pabrik)" | "Gudang 2 (Ruko)";
  mutationType: "Barang Masuk" | "Barang Keluar" | "Transfer Gudang";
  category: "Bahan Baku" | "Sparepart" | "Produk Jadi";
  sku: string;
  itemName: string;
  qty: number;
  unit: string;
  referenceDoc: string;
  pic: string;
  balanceAfter: number;
}

const MUTATION_DATA: StockMutationRow[] = [
  {
    id: "1",
    mutationCode: "MUT-2026-0918",
    date: "2026-09-24",
    warehouse: "Gudang 1 (Pabrik)",
    mutationType: "Barang Masuk",
    category: "Bahan Baku",
    sku: "MAT-IV-300",
    itemName: "Kertas Ivory Board 300 GSM Plano (79×109 cm)",
    qty: 45,
    unit: "Rim",
    referenceDoc: "PO-SUP-2026-041 (PT Paper Impexindo)",
    pic: "Hendra Wijaya (Staf Gudang)",
    balanceAfter: 40,
  },
  {
    id: "2",
    mutationCode: "MUT-2026-0917",
    date: "2026-09-24",
    warehouse: "Gudang 1 (Pabrik)",
    mutationType: "Barang Keluar",
    category: "Bahan Baku",
    sku: "MAT-IV-300",
    itemName: "Kertas Ivory Board 300 GSM Plano (79×109 cm)",
    qty: 12,
    unit: "Rim",
    referenceDoc: "SPK-INT-2026-081 (Hardbox Rigid Magnetic)",
    pic: "Hendra Wijaya (Staf Gudang)",
    balanceAfter: 28,
  },
  {
    id: "3",
    mutationCode: "MUT-2026-0916",
    date: "2026-09-23",
    warehouse: "Gudang 1 (Pabrik)",
    mutationType: "Barang Keluar",
    category: "Bahan Baku",
    sku: "MAT-AP-150",
    itemName: "Art Paper 150 GSM Plano (65×100 cm)",
    qty: 4,
    unit: "Rim",
    referenceDoc: "SPK-EKS-2026-042 (Kirim ke Vendor Foil Kurnia)",
    pic: "Hendra Wijaya (Staf Gudang)",
    balanceAfter: 18,
  },
  {
    id: "4",
    mutationCode: "MUT-2026-0915",
    date: "2026-09-22",
    warehouse: "Gudang 2 (Ruko)",
    mutationType: "Transfer Gudang",
    category: "Produk Jadi",
    sku: "PRD-LBX-KRF",
    itemName: "[Produk Jadi] Lunch Box Eco-Kraft Laminated (M)",
    qty: 1500,
    unit: "Pcs",
    referenceDoc: "TRF-G1-G2-019 (Dari Gudang 1 ke Gudang 2)",
    pic: "Hendra Wijaya (Staf Gudang)",
    balanceAfter: 15000,
  },
  {
    id: "5",
    mutationCode: "MUT-2026-0914",
    date: "2026-09-21",
    warehouse: "Gudang 1 (Pabrik)",
    mutationType: "Barang Keluar",
    category: "Sparepart",
    sku: "SPR-HD-BLK",
    itemName: "Rubber Blanket Compressible Heidelberg SM-74",
    qty: 2,
    unit: "Set",
    referenceDoc: "MNT-2026-009 (Maintenance Mesin SM-74)",
    pic: "Rudi Hartono (Kepala Produksi)",
    balanceAfter: 6,
  },
  {
    id: "6",
    mutationCode: "MUT-2026-0913",
    date: "2026-09-19",
    warehouse: "Gudang 2 (Ruko)",
    mutationType: "Barang Keluar",
    category: "Produk Jadi",
    sku: "PRD-LBX-KRF",
    itemName: "[Produk Jadi] Lunch Box Eco-Kraft Laminated (M)",
    qty: 10000,
    unit: "Pcs",
    referenceDoc: "ORD-2026-0903 (Kopi Kenangan Senja)",
    pic: "Hendra Wijaya (Staf Gudang)",
    balanceAfter: 13500,
  },
];

export default function StockMutationReportPage() {
  const [warehouseFilter, setWarehouseFilter] = useState<string>("Semua");
  const [mutationTypeFilter, setMutationTypeFilter] = useState<string>("Semua");
  const [categoryFilter, setCategoryFilter] = useState<string>("Semua");
  const [startDate, setStartDate] = useState<string>("2026-09-01");
  const [endDate, setEndDate] = useState<string>("2026-09-30");
  const [search, setSearch] = useState<string>("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return MUTATION_DATA.filter((row) => {
      if (warehouseFilter !== "Semua" && row.warehouse !== warehouseFilter) return false;
      if (mutationTypeFilter !== "Semua" && row.mutationType !== mutationTypeFilter) return false;
      if (categoryFilter !== "Semua" && row.category !== categoryFilter) return false;
      if (startDate && row.date < startDate) return false;
      if (endDate && row.date > endDate) return false;
      if (
        q &&
        !row.mutationCode.toLowerCase().includes(q) &&
        !row.sku.toLowerCase().includes(q) &&
        !row.itemName.toLowerCase().includes(q) &&
        !row.referenceDoc.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [warehouseFilter, mutationTypeFilter, categoryFilter, startDate, endDate, search]);

  const handleExportCsv = () => {
    downloadCsvReport(
      `Laporan_Mutasi_Stock_${startDate}_sd_${endDate}.csv`,
      [
        "Kode Mutasi",
        "Tanggal",
        "Gudang",
        "Jenis Mutasi",
        "Kategori",
        "SKU",
        "Nama Barang",
        "Kuantitas",
        "Satuan",
        "Dokumen Referensi",
        "PIC",
        "Saldo Akhir",
      ],
      filtered.map((r) => [
        r.mutationCode,
        r.date,
        r.warehouse,
        r.mutationType,
        r.category,
        r.sku,
        r.itemName,
        r.qty,
        r.unit,
        r.referenceDoc,
        r.pic,
        r.balanceAfter,
      ])
    );
  };

  return (
    <DashboardLayout title="Laporan Mutasi Stock">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Tombol Ekspor */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2E6ED] dark:border-[#26334D]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#2B5FC7]/10 text-[#2B5FC7] dark:text-[#60A5FA]">
                <IconReport size={18} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B5FC7] dark:text-[#60A5FA]">
                Menu Laporan · Inventori Multi-Gudang
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3]">
              Laporan Mutasi Stock
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
              Rekapitulasi keluar-masuk dan transfer stok Bahan Baku, Sparepart, dan Produk Jadi antar Gudang 1 &amp; Gudang 2.
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

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#6B7684]">
              <span>Total Transaksi Mutasi</span>
              <IconWarehouse size={15} className="text-[#2B5FC7]" />
            </div>
            <div className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mt-1">
              {filtered.length} Mutasi
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#059669]">
              <span>Barang Masuk (Inbound)</span>
              <IconArrowIn size={15} />
            </div>
            <div className="text-2xl font-bold text-[#059669] dark:text-[#34D399] mt-1">
              {filtered.filter((r) => r.mutationType === "Barang Masuk").length} Transaksi
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#991B1B] dark:text-[#F87171]">
              <span>Barang Keluar (SPK / Order)</span>
              <IconArrowOut size={15} />
            </div>
            <div className="text-2xl font-bold text-[#991B1B] dark:text-[#F87171] mt-1">
              {filtered.filter((r) => r.mutationType === "Barang Keluar").length} Transaksi
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#2B5FC7] dark:text-[#60A5FA]">
              <span>Transfer Antar Gudang</span>
              <IconTransfer size={15} />
            </div>
            <div className="text-2xl font-bold text-[#2B5FC7] dark:text-[#60A5FA] mt-1">
              {filtered.filter((r) => r.mutationType === "Transfer Gudang").length} Transfer
            </div>
          </div>
        </div>

        {/* Dedicated Filter Bar */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <label className="block font-semibold text-[#6B7684] mb-1">Cari SKU / Barang / Referensi</label>
              <div className="relative">
                <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7684]" />
                <input
                  type="text"
                  placeholder="Ketik SKU, nama, SPK..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-8 pr-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#6B7684] mb-1">Filter Gudang</label>
              <select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]"
              >
                <option value="Semua">Semua Gudang</option>
                <option value="Gudang 1 (Pabrik)">Gudang 1 (Pabrik)</option>
                <option value="Gudang 2 (Ruko)">Gudang 2 (Ruko)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#6B7684] mb-1">Jenis Mutasi</label>
              <select
                value={mutationTypeFilter}
                onChange={(e) => setMutationTypeFilter(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]"
              >
                <option value="Semua">Semua Jenis Mutasi</option>
                <option value="Barang Masuk">Barang Masuk</option>
                <option value="Barang Keluar">Barang Keluar</option>
                <option value="Transfer Gudang">Transfer Gudang</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#6B7684] mb-1">Kategori Item</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]"
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Bahan Baku">Bahan Baku</option>
                <option value="Sparepart">Sparepart</option>
                <option value="Produk Jadi">Produk Jadi</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#6B7684] mb-1">Rentang Tanggal</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[11px]"
                />
                <span>-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[11px]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                setWarehouseFilter("Semua");
                setMutationTypeFilter("Semua");
                setCategoryFilter("Semua");
                setStartDate("2026-09-01");
                setEndDate("2026-09-30");
                setSearch("");
              }}
              className="text-xs font-medium text-[#2B5FC7] hover:underline flex items-center gap-1"
            >
              <IconRefresh size={12} />
              <span>Reset Filter</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F4F6FA] dark:bg-[#1B2A44] border-b border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">No. Mutasi &amp; Tanggal</th>
                  <th className="py-3 px-4">Gudang</th>
                  <th className="py-3 px-4">Jenis Mutasi</th>
                  <th className="py-3 px-4">SKU &amp; Nama Item</th>
                  <th className="py-3 px-4 text-right">Kuantitas</th>
                  <th className="py-3 px-4 text-right">Saldo Akhir</th>
                  <th className="py-3 px-4">Dokumen Referensi &amp; PIC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/50">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-[#2B5FC7] dark:text-[#60A5FA]">{row.mutationCode}</div>
                      <div className="text-[10px] text-[#6B7684]">{row.date}</div>
                    </td>
                    <td className="py-3 px-4">{row.warehouse}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.mutationType === "Barang Masuk"
                            ? "bg-[#ECFDF5] text-[#065F46]"
                            : row.mutationType === "Barang Keluar"
                            ? "bg-[#FEF2F2] text-[#991B1B]"
                            : "bg-[#EFF4FE] text-[#2B5FC7]"
                        }`}
                      >
                        {row.mutationType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">{row.itemName}</div>
                      <div className="text-[10px] text-[#6B7684] font-mono">
                        {row.sku} · {row.category}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {row.mutationType === "Barang Keluar" ? "-" : "+"}
                      {row.qty.toLocaleString("id-ID")} {row.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {row.balanceAfter.toLocaleString("id-ID")} {row.unit}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{row.referenceDoc}</div>
                      <div className="text-[10px] text-[#6B7684]">{row.pic}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

