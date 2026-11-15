"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { downloadCsvReport } from "@/utils/exportCsv";
import {
  IconClipboardCheck,
  IconDownload,
  IconPrinter,
  IconSearch,
  IconRefresh,
  IconCheckCircle,
  IconAlertTriangle,
} from "@/components/icons/Icons";

interface OpnameReportRow {
  id: string;
  opnameCode: string;
  date: string;
  warehouse: "Gudang 1 (Pabrik)" | "Gudang 2 (Ruko)";
  category: "Bahan Baku" | "Sparepart" | "Produk Jadi";
  sku: string;
  itemName: string;
  unit: string;
  systemStock: number;
  physicalStock: number;
  discrepancy: number;
  status: "Sesuai" | "Selisih Kurang" | "Selisih Lebih";
  auditor: string;
  notes: string;
}

const OPNAME_DATA: OpnameReportRow[] = [
  {
    id: "1",
    opnameCode: "OPN-2026-0901",
    date: "2026-09-24",
    warehouse: "Gudang 1 (Pabrik)",
    category: "Bahan Baku",
    sku: "MAT-IV-300",
    itemName: "Kertas Ivory Board 300 GSM Plano (79×109 cm)",
    unit: "Rim",
    systemStock: 40,
    physicalStock: 40,
    discrepancy: 0,
    status: "Sesuai",
    auditor: "Hendra Wijaya (Staf Gudang)",
    notes: "Fisik sesuai kartu stok rak A-01",
  },
  {
    id: "2",
    opnameCode: "OPN-2026-0902",
    date: "2026-09-24",
    warehouse: "Gudang 2 (Ruko)",
    category: "Bahan Baku",
    sku: "MAT-KRF-275",
    itemName: "Kraft Liner Brown 275 GSM Plano",
    unit: "Rim",
    systemStock: 17,
    physicalStock: 16,
    discrepancy: -1,
    status: "Selisih Kurang",
    auditor: "Hendra Wijaya & Dewi Rahayu",
    notes: "1 Rim lembab karena kebocoran atap sudut B-03",
  },
  {
    id: "3",
    opnameCode: "OPN-2026-0903",
    date: "2026-09-22",
    warehouse: "Gudang 1 (Pabrik)",
    category: "Bahan Baku",
    sku: "MAT-AC-260",
    itemName: "Art Carton 260 GSM High Gloss Plano",
    unit: "Rim",
    systemStock: 38,
    physicalStock: 38,
    discrepancy: 0,
    status: "Sesuai",
    auditor: "Hendra Wijaya (Staf Gudang)",
    notes: "Segel batch lengkap",
  },
  {
    id: "4",
    opnameCode: "OPN-2026-0904",
    date: "2026-09-20",
    warehouse: "Gudang 2 (Ruko)",
    category: "Produk Jadi",
    sku: "PRD-LBX-KRF",
    itemName: "[Produk Jadi] Lunch Box Eco-Kraft Laminated (M)",
    unit: "Pcs",
    systemStock: 14950,
    physicalStock: 15000,
    discrepancy: 50,
    status: "Selisih Lebih",
    auditor: "Hendra Wijaya (Staf Gudang)",
    notes: "Kelebihan hasil produksi batch SPK-INT-075",
  },
  {
    id: "5",
    opnameCode: "OPN-2026-0905",
    date: "2026-09-18",
    warehouse: "Gudang 1 (Pabrik)",
    category: "Sparepart",
    sku: "SPR-HD-BLK",
    itemName: "Rubber Blanket Compressible Heidelberg SM-74",
    unit: "Set",
    systemStock: 6,
    physicalStock: 6,
    discrepancy: 0,
    status: "Sesuai",
    auditor: "Rudi Hartono & Hendra Wijaya",
    notes: "Stok lemari sparepart mesin cetak",
  },
];

export default function StockOpnameReportPage() {
  const [warehouseFilter, setWarehouseFilter] = useState<string>("Semua");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [categoryFilter, setCategoryFilter] = useState<string>("Semua");
  const [search, setSearch] = useState<string>("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return OPNAME_DATA.filter((row) => {
      if (warehouseFilter !== "Semua" && row.warehouse !== warehouseFilter) return false;
      if (statusFilter !== "Semua" && row.status !== statusFilter) return false;
      if (categoryFilter !== "Semua" && row.category !== categoryFilter) return false;
      if (
        q &&
        !row.opnameCode.toLowerCase().includes(q) &&
        !row.sku.toLowerCase().includes(q) &&
        !row.itemName.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [warehouseFilter, statusFilter, categoryFilter, search]);

  const handleExportCsv = () => {
    downloadCsvReport(
      "Laporan_Stock_Opname.csv",
      [
        "Kode Opname",
        "Tanggal",
        "Gudang",
        "Kategori",
        "SKU",
        "Nama Barang",
        "Stok Sistem",
        "Stok Fisik",
        "Selisih",
        "Satuan",
        "Status",
        "Petugas Audit",
        "Catatan",
      ],
      filtered.map((r) => [
        r.opnameCode,
        r.date,
        r.warehouse,
        r.category,
        r.sku,
        r.itemName,
        r.systemStock,
        r.physicalStock,
        r.discrepancy,
        r.unit,
        r.status,
        r.auditor,
        r.notes,
      ])
    );
  };

  return (
    <DashboardLayout title="Laporan Stock Opname">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2E6ED] dark:border-[#26334D]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#2B5FC7]/10 text-[#2B5FC7] dark:text-[#60A5FA]">
                <IconClipboardCheck size={18} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B5FC7] dark:text-[#60A5FA]">
                Menu Laporan · Audit Fisik Gudang
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3]">
              Laporan Stock Opname
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
              Perbandingan stok tercatat di sistem dengan hasil perhitungan fisik riil beserta rekonsiliasi selisih.
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="text-xs text-[#6B7684]">Total Item Di-Opname</div>
            <div className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mt-1">
              {filtered.length} SKU
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#059669]">
              <span>Stok Fisik Sesuai (Akurat)</span>
              <IconCheckCircle size={15} />
            </div>
            <div className="text-2xl font-bold text-[#059669] dark:text-[#34D399] mt-1">
              {filtered.filter((r) => r.status === "Sesuai").length} SKU
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#D97706]">
              <span>Terdapat Selisih Fisik</span>
              <IconAlertTriangle size={15} />
            </div>
            <div className="text-2xl font-bold text-[#D97706] dark:text-[#FBBF24] mt-1">
              {filtered.filter((r) => r.status !== "Sesuai").length} SKU
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7684]" />
            <input
              type="text"
              placeholder="Cari kode opname, SKU, atau nama barang..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]"
            >
              <option value="Semua">Semua Gudang</option>
              <option value="Gudang 1 (Pabrik)">Gudang 1 (Pabrik)</option>
              <option value="Gudang 2 (Ruko)">Gudang 2 (Ruko)</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="Bahan Baku">Bahan Baku</option>
              <option value="Sparepart">Sparepart</option>
              <option value="Produk Jadi">Produk Jadi</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]"
            >
              <option value="Semua">Semua Status Selisih</option>
              <option value="Sesuai">Sesuai (0 Selisih)</option>
              <option value="Selisih Kurang">Selisih Kurang (-)</option>
              <option value="Selisih Lebih">Selisih Lebih (+)</option>
            </select>

            <button
              onClick={() => {
                setWarehouseFilter("Semua");
                setCategoryFilter("Semua");
                setStatusFilter("Semua");
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
                  <th className="py-3 px-4">Kode &amp; Tanggal</th>
                  <th className="py-3 px-4">Gudang</th>
                  <th className="py-3 px-4">SKU &amp; Nama Item</th>
                  <th className="py-3 px-4 text-right">Stok Sistem</th>
                  <th className="py-3 px-4 text-right">Stok Fisik</th>
                  <th className="py-3 px-4 text-right">Selisih</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Auditor &amp; Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/50">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-[#2B5FC7] dark:text-[#60A5FA]">{row.opnameCode}</div>
                      <div className="text-[10px] text-[#6B7684]">{row.date}</div>
                    </td>
                    <td className="py-3 px-4">{row.warehouse}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">{row.itemName}</div>
                      <div className="text-[10px] text-[#6B7684] font-mono">
                        {row.sku} · {row.category}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {row.systemStock.toLocaleString("id-ID")} {row.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {row.physicalStock.toLocaleString("id-ID")} {row.unit}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold ${
                        row.discrepancy < 0
                          ? "text-[#991B1B]"
                          : row.discrepancy > 0
                          ? "text-[#2B5FC7]"
                          : "text-[#059669]"
                      }`}
                    >
                      {row.discrepancy > 0 ? `+${row.discrepancy}` : row.discrepancy} {row.unit}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.status === "Sesuai"
                            ? "bg-[#ECFDF5] text-[#065F46]"
                            : row.status === "Selisih Kurang"
                            ? "bg-[#FEF2F2] text-[#991B1B]"
                            : "bg-[#EFF4FE] text-[#2B5FC7]"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{row.auditor}</div>
                      <div className="text-[10px] text-[#6B7684]">{row.notes}</div>
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

