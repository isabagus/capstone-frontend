"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useBrands } from "@/hooks/useInventoryData";
import { downloadCsvReport } from "@/utils/exportCsv";
import {
  IconLayers,
  IconDownload,
  IconPrinter,
  IconSearch,
  IconRefresh,
  IconTag,
} from "@/components/icons/Icons";

interface MaterialBrandRow {
  id: string;
  brand: string;
  materialCode: string;
  materialName: string;
  totalSpkCount: number;
  planoUsed: number;
  rimUsed: number;
  cutSheetsProduced: number;
  wasteActualPct: number;
  wasteTolerancePct: number;
  materialCostIDR: number;
  status: "Efisien" | "Melebihi Toleransi";
}

const MATERIAL_BRAND_DATA: MaterialBrandRow[] = [
  {
    id: "1",
    brand: "Packsolution.id",
    materialCode: "MAT-IV-300",
    materialName: "Kertas Ivory Board 300 GSM Plano (79×109 cm)",
    totalSpkCount: 14,
    planoUsed: 1240,
    rimUsed: 2.48,
    cutSheetsProduced: 11160,
    wasteActualPct: 4.5,
    wasteTolerancePct: 5.0,
    materialCostIDR: 21400000,
    status: "Efisien",
  },
  {
    id: "2",
    brand: "Estella",
    materialCode: "MAT-KRF-275",
    materialName: "Kraft Liner Brown 275 GSM Plano",
    totalSpkCount: 9,
    planoUsed: 885,
    rimUsed: 1.77,
    cutSheetsProduced: 5310,
    wasteActualPct: 4.2,
    wasteTolerancePct: 5.0,
    materialCostIDR: 14200000,
    status: "Efisien",
  },
  {
    id: "3",
    brand: "Pepipapier",
    materialCode: "MAT-AP-150",
    materialName: "Art Paper 150 GSM Plano (65×100 cm)",
    totalSpkCount: 6,
    planoUsed: 520,
    rimUsed: 1.04,
    cutSheetsProduced: 4680,
    wasteActualPct: 5.4,
    wasteTolerancePct: 5.0,
    materialCostIDR: 6400000,
    status: "Melebihi Toleransi",
  },
  {
    id: "4",
    brand: "memoirs.print",
    materialCode: "MAT-AC-260",
    materialName: "Art Carton 260 GSM High Gloss Plano",
    totalSpkCount: 5,
    planoUsed: 640,
    rimUsed: 1.28,
    cutSheetsProduced: 2560,
    wasteActualPct: 3.8,
    wasteTolerancePct: 5.0,
    materialCostIDR: 11200000,
    status: "Efisien",
  },
  {
    id: "5",
    brand: "pikpurry",
    materialCode: "MAT-DX-350",
    materialName: "Kertas Duplex Coated 350 GSM Plano",
    totalSpkCount: 7,
    planoUsed: 1100,
    rimUsed: 2.2,
    cutSheetsProduced: 8800,
    wasteActualPct: 4.1,
    wasteTolerancePct: 5.0,
    materialCostIDR: 13800000,
    status: "Efisien",
  },
];

export default function MaterialByBrandReportPage() {
  const dynamicBrands = useBrands();
  const brandOptions = ["Semua", ...dynamicBrands];

  const [brandFilter, setBrandFilter] = useState<string>("Semua");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [search, setSearch] = useState<string>("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return MATERIAL_BRAND_DATA.filter((row) => {
      if (brandFilter !== "Semua" && row.brand.toLowerCase() !== brandFilter.toLowerCase()) return false;
      if (statusFilter !== "Semua" && row.status !== statusFilter) return false;
      if (
        q &&
        !row.materialCode.toLowerCase().includes(q) &&
        !row.materialName.toLowerCase().includes(q) &&
        !row.brand.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [brandFilter, statusFilter, search]);

  const totalPlano = filtered.reduce((s, r) => s + r.planoUsed, 0);
  const totalCost = filtered.reduce((s, r) => s + r.materialCostIDR, 0);

  const handleExportCsv = () => {
    downloadCsvReport(
      "Laporan_Pemakaian_Material_Per_Brand.csv",
      [
        "Brand",
        "Kode Material",
        "Nama Material",
        "Jumlah SPK",
        "Plano Terpakai",
        "Rim Terpakai",
        "Hasil Potong (Lbr)",
        "Waste Aktual (%)",
        "Toleransi Waste (%)",
        "Nilai Pemakaian (IDR)",
        "Status Efisiensi",
      ],
      filtered.map((r) => [
        r.brand,
        r.materialCode,
        r.materialName,
        r.totalSpkCount,
        r.planoUsed,
        r.rimUsed,
        r.cutSheetsProduced,
        r.wasteActualPct,
        r.wasteTolerancePct,
        r.materialCostIDR,
        r.status,
      ])
    );
  };

  return (
    <DashboardLayout title="Pemakaian Material Per Brand">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2E6ED] dark:border-[#26334D]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#2B5FC7]/10 text-[#2B5FC7] dark:text-[#60A5FA]">
                <IconLayers size={18} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B5FC7] dark:text-[#60A5FA]">
                Menu Laporan · Konsumsi BOM &amp; Efisiensi Bahan
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3]">
              Laporan Pemakaian Material Per Brand
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
              Analisis serapan kertas plano, rasio konversi potong, dan evaluasi persentase waste BOM untuk masing-masing unit brand.
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
            <div className="text-xs text-[#6B7684]">Total Kertas Plano Terpakai</div>
            <div className="text-2xl font-bold text-[#2B5FC7] dark:text-[#60A5FA] mt-1 font-mono">
              {totalPlano.toLocaleString("id-ID")} Plano
            </div>
            <div className="text-[11px] text-[#6B7684] mt-1">
              Setara {(totalPlano / 500).toFixed(2)} Rim
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="text-xs text-[#6B7684]">Nilai HPP Bahan Terpakai</div>
            <div className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mt-1 font-mono">
              Rp {totalCost.toLocaleString("id-ID")}
            </div>
            <div className="text-[11px] text-[#6B7684] mt-1">
              Akumulasi sesuai filter brand aktif
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="text-xs text-[#6B7684]">Rata-rata Waste Aktual</div>
            <div className="text-2xl font-bold text-[#059669] dark:text-[#34D399] mt-1 font-mono">
              {filtered.length
                ? (filtered.reduce((s, r) => s + r.wasteActualPct, 0) / filtered.length).toFixed(2)
                : "0"}
              %
            </div>
            <div className="text-[11px] text-[#059669] mt-1">Ambang toleransi standar: 5.0%</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7684]" />
            <input
              type="text"
              placeholder="Cari nama bahan kertas, kode material, atau brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <IconTag size={13} className="text-[#6B7684]" />
              <span className="text-[#6B7684]">Brand:</span>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] font-medium"
              >
                {brandOptions.map((b) => (
                  <option key={b} value={b}>
                    {b === "Semua" ? "Semua Brand" : b}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]"
            >
              <option value="Semua">Semua Status Efisiensi</option>
              <option value="Efisien">Efisien (≤ 5%)</option>
              <option value="Melebihi Toleransi">Melebihi Toleransi (&gt; 5%)</option>
            </select>

            <button
              onClick={() => {
                setBrandFilter("Semua");
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
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Kode &amp; Jenis Material</th>
                  <th className="py-3 px-4 text-center">Jml SPK</th>
                  <th className="py-3 px-4 text-right">Plano Terpakai</th>
                  <th className="py-3 px-4 text-right">Hasil Potong</th>
                  <th className="py-3 px-4 text-right">Waste Aktual</th>
                  <th className="py-3 px-4 text-right">Nilai Bahan (IDR)</th>
                  <th className="py-3 px-4 text-center">Status Waste</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/50">
                    <td className="py-3 px-4 font-semibold">{row.brand}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">{row.materialName}</div>
                      <div className="text-[10px] text-[#6B7684] font-mono">{row.materialCode}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">{row.totalSpkCount} SPK</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {row.planoUsed.toLocaleString("id-ID")} Lbr ({row.rimUsed} Rim)
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {row.cutSheetsProduced.toLocaleString("id-ID")} Lbr
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {row.wasteActualPct}% / {row.wasteTolerancePct}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-[#2B5FC7] dark:text-[#60A5FA]">
                      Rp {row.materialCostIDR.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.status === "Efisien"
                            ? "bg-[#ECFDF5] text-[#065F46]"
                            : "bg-[#FEF2F2] text-[#991B1B]"
                        }`}
                      >
                        {row.status}
                      </span>
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

