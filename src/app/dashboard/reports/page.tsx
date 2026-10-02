"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  IconReport,
  IconDownload,
  IconCalendar,
  IconPackage,
  IconProduction,
  IconDollar,
  IconTrendingUp,
  IconCheckCircle,
  IconPrinter,
  IconFilter,
} from "@/components/icons/Icons";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<"material" | "production" | "financial">("material");
  const [dateRange, setDateRange] = useState<"7D" | "30D" | "THIS_MONTH" | "THIS_QUARTER">("THIS_MONTH");

  // Mock data for Material Usage
  const materialReport = [
    {
      code: "MAT-IV-300",
      name: "Ivory Board 300gsm (79x109 cm)",
      totalPlanoUsed: 1240,
      totalRim: 2.48,
      cutSheetsProduced: 9920,
      wasteActualPct: 4.8,
      wasteTolerancePct: 5.0,
      status: "EFISIEN",
    },
    {
      code: "MAT-AC-260",
      name: "Art Carton 260gsm (65x100 cm)",
      totalPlanoUsed: 850,
      totalRim: 1.7,
      cutSheetsProduced: 5100,
      wasteActualPct: 5.4,
      wasteTolerancePct: 5.0,
      status: "LEBIH_BATAS",
    },
    {
      code: "MAT-DX-350",
      name: "Duplex Board 350gsm (79x109 cm)",
      totalPlanoUsed: 2100,
      totalRim: 4.2,
      cutSheetsProduced: 12600,
      wasteActualPct: 3.9,
      wasteTolerancePct: 5.0,
      status: "EFISIEN",
    },
    {
      code: "FOIL-GLD-120",
      name: "Kurz Foil Emas Hot Stamping",
      totalPlanoUsed: 14, // Roll
      totalRim: 0,
      cutSheetsProduced: 8500, // Imprints
      wasteActualPct: 2.1,
      wasteTolerancePct: 3.0,
      status: "EFISIEN",
    },
  ];

  // Mock data for Production Performance
  const productionReport = [
    {
      machine: "Heidelberg Speedmaster SM 74 (4-Warna)",
      totalJobRuns: 42,
      totalImpressions: 185400,
      avgSetupMinutes: 32,
      uptimePct: 91.5,
      operator: "Joko Santoso & Tim A",
    },
    {
      machine: "Komori Lithrone L-428 (4-Warna)",
      totalJobRuns: 38,
      totalImpressions: 162100,
      avgSetupMinutes: 38,
      uptimePct: 88.2,
      operator: "Bambang & Tim B",
    },
    {
      machine: "Mesin Pond Die-cut Otomatis (Sanwa)",
      totalJobRuns: 56,
      totalImpressions: 142000,
      avgSetupMinutes: 45,
      uptimePct: 94.0,
      operator: "Ahmad Subagio",
    },
    {
      machine: "Mesin Lem Folding Gluer Box",
      totalJobRuns: 34,
      totalImpressions: 98000,
      avgSetupMinutes: 25,
      uptimePct: 96.4,
      operator: "Slamet Riyadi",
    },
  ];

  // Mock data for Financial Margins per Order
  const financialReport = [
    {
      orderId: "ORD-2026-0104",
      client: "PT Kuliner Nusantara Sejahtera",
      product: "Hardbox Ivory 300gsm (5.000 pcs)",
      revenue: 13250000,
      cogsMaterial: 6840000,
      cogsExternal: 1200000,
      grossProfit: 5210000,
      marginPct: 39.3,
    },
    {
      orderId: "ORD-2026-0102",
      client: "CV Herbal Alami Indonesia",
      product: "Box Obat Herbal Duplex 350gsm (3.000 pcs)",
      revenue: 6200000,
      cogsMaterial: 3100000,
      cogsExternal: 0,
      grossProfit: 3100000,
      marginPct: 50.0,
    },
    {
      orderId: "ORD-2026-0099",
      client: "PT Kosmetik Cantik Utama",
      product: "Sleeve Tube Lipcream (10.000 pcs)",
      revenue: 25600000,
      cogsMaterial: 14200000,
      cogsExternal: 2400000,
      grossProfit: 9000000,
      marginPct: 35.1,
    },
  ];

  const totalRevenue = financialReport.reduce((a, b) => a + b.revenue, 0);
  const totalGrossProfit = financialReport.reduce((a, b) => a + b.grossProfit, 0);
  const avgMargin = ((totalGrossProfit / totalRevenue) * 100).toFixed(1);

  return (
    <DashboardLayout title="Laporan Operasional & Analisis Bisnis">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#2B5FC7]/10 dark:bg-[#3B6FE0]/15 text-[#2B5FC7] dark:text-[#3B6FE0]">
              <IconReport size={20} />
            </span>
            Laporan Operasional & Analisis Bisnis
          </h1>
          <p className="text-xs text-[#6B7684] dark:text-[#8A94A6] mt-1">
            Rekapitulasi komprehensif pemakaian material plano, utilisasi mesin cetak, serta margin profitabilitas per pesanan
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <div className="inline-flex rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] p-1 text-xs font-semibold">
            {(["7D", "30D", "THIS_MONTH", "THIS_QUARTER"] as const).map((rng) => (
              <button
                key={rng}
                onClick={() => setDateRange(rng)}
                className={`px-3 py-1 rounded-md transition-all ${
                  dateRange === rng
                    ? "bg-[#2B5FC7] dark:bg-[#3B6FE0] text-white"
                    : "text-[#6B7684] dark:text-[#8A94A6] hover:text-[#1B2436]"
                }`}
              >
                {rng === "THIS_MONTH" ? "Bulan Ini" : rng === "THIS_QUARTER" ? "Kuartal Ini" : rng}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] dark:hover:bg-[#2B5FC7] text-white transition-colors shadow-xs"
          >
            <IconDownload size={14} />
            <span>Ekspor PDF / Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
          <div className="flex items-center justify-between text-[#6B7684] dark:text-[#8A94A6] text-xs">
            <span>Rata-Rata Waste Kertas</span>
            <IconPackage size={14} />
          </div>
          <div className="text-2xl font-bold text-[#065F46] dark:text-[#34D399] mt-2">
            4.2%
          </div>
          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-1">
            Di bawah batas toleransi max (5.0%)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
          <div className="flex items-center justify-between text-[#6B7684] dark:text-[#8A94A6] text-xs">
            <span>On-Time Delivery (OTD)</span>
            <IconProduction size={14} />
          </div>
          <div className="text-2xl font-bold text-[#2B5FC7] dark:text-[#3B6FE0] mt-2">
            96.8%
          </div>
          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-1">
            29 dari 30 order selesai tepat waktu
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
          <div className="flex items-center justify-between text-[#6B7684] dark:text-[#8A94A6] text-xs">
            <span>Reject / Rework QC Rate</span>
            <IconCheckCircle size={14} />
          </div>
          <div className="text-2xl font-bold text-[#065F46] dark:text-[#34D399] mt-2">
            1.4%
          </div>
          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-1">
            Standar industri packaging &lt; 3.0%
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
          <div className="flex items-center justify-between text-[#6B7684] dark:text-[#8A94A6] text-xs">
            <span>Rata-Rata Gross Margin</span>
            <IconDollar size={14} />
          </div>
          <div className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mt-2">
            {avgMargin}%
          </div>
          <div className="text-[11px] text-[#065F46] dark:text-[#34D399] mt-1 font-medium">
            Stabil di atas target minimum 35%
          </div>
        </div>
      </div>

      {/* Report Navigation Tabs */}
      <div className="flex border-b border-[#E2E6ED] dark:border-[#26334D] gap-6 text-xs font-semibold">
        <button
          onClick={() => setReportType("material")}
          className={`pb-3 transition-colors relative ${
            reportType === "material"
              ? "text-[#2B5FC7] dark:text-[#3B6FE0]"
              : "text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3]"
          }`}
        >
          Pemakaian Material & Waste Insheet
          {reportType === "material" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2B5FC7] dark:bg-[#3B6FE0] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setReportType("production")}
          className={`pb-3 transition-colors relative ${
            reportType === "production"
              ? "text-[#2B5FC7] dark:text-[#3B6FE0]"
              : "text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3]"
          }`}
        >
          Utilisasi Mesin & Efisiensi Operator
          {reportType === "production" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2B5FC7] dark:bg-[#3B6FE0] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setReportType("financial")}
          className={`pb-3 transition-colors relative ${
            reportType === "financial"
              ? "text-[#2B5FC7] dark:text-[#3B6FE0]"
              : "text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3]"
          }`}
        >
          Margin & Profitabilitas Order
          {reportType === "financial" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2B5FC7] dark:bg-[#3B6FE0] rounded-full" />
          )}
        </button>
      </div>

      {/* TAB 1: PEMAKAIAN MATERIAL */}
      {reportType === "material" && (
        <div className="overflow-x-auto rounded-xl border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA] dark:bg-[#1B2A44] text-[11px] font-semibold text-[#6B7684] dark:text-[#8A94A6] uppercase tracking-wider">
                <th className="py-3 px-4">Kode & Deskripsi Material</th>
                <th className="py-3 px-4">Konsumsi Plano</th>
                <th className="py-3 px-4">Lembar Potong Dihasilkan</th>
                <th className="py-3 px-4">Waste Aktual vs Toleransi</th>
                <th className="py-3 px-4 text-right">Status Efisiensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-xs">
              {materialReport.map((m) => (
                <tr key={m.code} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{m.name}</div>
                    <div className="text-[11px] font-mono text-[#6B7684] dark:text-[#8A94A6]">{m.code}</div>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                      {m.totalPlanoUsed.toLocaleString("id-ID")} {m.totalRim > 0 ? "Lembar" : "Roll"}
                    </div>
                    {m.totalRim > 0 && (
                      <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">~ {m.totalRim} Rim</div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-[#1B2436] dark:text-[#E8ECF3]">
                    {m.cutSheetsProduced.toLocaleString("id-ID")} Pcs
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold ${m.wasteActualPct > m.wasteTolerancePct ? "text-[#991B1B] dark:text-[#F87171]" : "text-[#065F46] dark:text-[#34D399]"}`}>
                        {m.wasteActualPct}%
                      </span>
                      <span className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                        (Max Tol: {m.wasteTolerancePct}%)
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.status === "EFISIEN"
                          ? "bg-[#065F46]/10 text-[#065F46] dark:text-[#34D399]"
                          : "bg-[#991B1B]/10 text-[#991B1B] dark:text-[#F87171]"
                      }`}
                    >
                      {m.status === "EFISIEN" ? "SESUAI TOLERANSI" : "MELEBIHI BATAS"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: UTILISASI MESIN */}
      {reportType === "production" && (
        <div className="overflow-x-auto rounded-xl border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA] dark:bg-[#1B2A44] text-[11px] font-semibold text-[#6B7684] dark:text-[#8A94A6] uppercase tracking-wider">
                <th className="py-3 px-4">Nama Mesin Cetak / Finishing</th>
                <th className="py-3 px-4">Total SPK Dikerjakan</th>
                <th className="py-3 px-4">Total Impressions (Druk)</th>
                <th className="py-3 px-4">Rata-Rata Setup (Make-Ready)</th>
                <th className="py-3 px-4">Uptime / Ketersediaan</th>
                <th className="py-3 px-4">Operator Bertanggung Jawab</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-xs">
              {productionReport.map((p) => (
                <tr key={p.machine} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{p.machine}</td>
                  <td className="py-3 px-4 font-mono font-medium">{p.totalJobRuns} Order</td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#2B5FC7] dark:text-[#3B6FE0]">
                    {p.totalImpressions.toLocaleString("id-ID")} druk
                  </td>
                  <td className="py-3 px-4 font-mono text-[#1B2436] dark:text-[#E8ECF3]">{p.avgSetupMinutes} Menit</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#065F46]/10 text-[#065F46] dark:text-[#34D399]">
                      {p.uptimePct}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#6B7684] dark:text-[#8A94A6]">{p.operator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: PROFITABILITAS ORDER */}
      {reportType === "financial" && (
        <div className="overflow-x-auto rounded-xl border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA] dark:bg-[#1B2A44] text-[11px] font-semibold text-[#6B7684] dark:text-[#8A94A6] uppercase tracking-wider">
                <th className="py-3 px-4">No. Order & Pelanggan</th>
                <th className="py-3 px-4">Deskripsi Produk</th>
                <th className="py-3 px-4">Nilai Omset (Revenue)</th>
                <th className="py-3 px-4">Beban Bahan Baku (COGS)</th>
                <th className="py-3 px-4">Biaya Maklon / Luar</th>
                <th className="py-3 px-4">Laba Kotor (Gross Profit)</th>
                <th className="py-3 px-4 text-right">Margin (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-xs">
              {financialReport.map((f) => (
                <tr key={f.orderId} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#2B5FC7] dark:text-[#3B6FE0]">{f.orderId}</div>
                    <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">{f.client}</div>
                  </td>
                  <td className="py-3 px-4 text-[#1B2436] dark:text-[#E8ECF3]">{f.product}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                    Rp {f.revenue.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#6B7684] dark:text-[#8A94A6]">
                    Rp {f.cogsMaterial.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#6B7684] dark:text-[#8A94A6]">
                    {f.cogsExternal > 0 ? `Rp ${f.cogsExternal.toLocaleString("id-ID")}` : "-"}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#065F46] dark:text-[#34D399]">
                    Rp {f.grossProfit.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#2B5FC7] dark:text-[#3B6FE0]">
                    {f.marginPct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
