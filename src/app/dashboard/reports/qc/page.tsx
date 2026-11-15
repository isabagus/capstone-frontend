"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useBrands } from "@/hooks/useInventoryData";
import { useQcStore } from "@/services/operationalStore";
import { downloadCsvReport } from "@/utils/exportCsv";
import {
  IconCheckCircle,
  IconDownload,
  IconPrinter,
  IconSearch,
  IconRefresh,
  IconAlertTriangle,
} from "@/components/icons/Icons";

interface QcReportRow {
  id: string;
  qcCode: string;
  date: string;
  spkNumber: string;
  brand: string;
  productName: string;
  sourceType: "Produksi Internal" | "Subkontrak Vendor Mitra";
  inspectedQty: number;
  passedQty: number;
  defectQty: number;
  decision: "Pass" | "Partial Pass" | "Reject / Rework";
  inspector: string;
  defectNotes: string;
}

const QC_REPORT_DATA: QcReportRow[] = [
  {
    id: "1",
    qcCode: "QC-2026-0912",
    date: "2026-09-24",
    spkNumber: "SPK-INT-2026-079",
    brand: "memoirs.print",
    productName: "Photobook Hardcover Linen Series",
    sourceType: "Produksi Internal",
    inspectedQty: 350,
    passedQty: 348,
    defectQty: 2,
    decision: "Pass",
    inspector: "Nina Sari (Quality Control)",
    defectNotes: "Presisi warna CMYK & lem punggung hardcover sangat rapi",
  },
  {
    id: "2",
    qcCode: "QC-2026-0911",
    date: "2026-09-23",
    spkNumber: "SPK-EKS-2026-042",
    brand: "Pepipapier",
    productName: "Greeting Card & Custom Envelope Foil",
    sourceType: "Subkontrak Vendor Mitra",
    inspectedQty: 1200,
    passedQty: 1185,
    defectQty: 15,
    decision: "Partial Pass",
    inspector: "Nina Sari (Quality Control)",
    defectNotes: "15 pcs foil agak miring 1.5mm dari Vendor Kurnia, sisanya lulus",
  },
  {
    id: "3",
    qcCode: "QC-2026-0910",
    date: "2026-09-21",
    spkNumber: "SPK-INT-2026-078",
    brand: "pikpurry",
    productName: "Packaging Snack Pouch Ziplock",
    sourceType: "Produksi Internal",
    inspectedQty: 10000,
    passedQty: 9960,
    defectQty: 40,
    decision: "Pass",
    inspector: "Nina Sari (Quality Control)",
    defectNotes: "Sealing ziplock rapat & lulus uji tekan",
  },
  {
    id: "4",
    qcCode: "QC-2026-0909",
    date: "2026-09-19",
    spkNumber: "SPK-EKS-2026-039",
    brand: "Packsolution.id",
    productName: "Hardbox Gift Magnetic Gold Batch Awal",
    sourceType: "Subkontrak Vendor Mitra",
    inspectedQty: 500,
    passedQty: 420,
    defectQty: 80,
    decision: "Reject / Rework",
    inspector: "Nina Sari (Quality Control)",
    defectNotes: "Sudut pond kurang siku dari Vendor Die-Cut Rigid, dikembalikan untuk rework",
  },
];

export default function QcReportPage() {
  const dynamicBrands = useBrands();
  const [liveQc] = useQcStore();
  const brandOptions = ["Semua", ...dynamicBrands];

  const [brandFilter, setBrandFilter] = useState<string>("Semua");
  const [decisionFilter, setDecisionFilter] = useState<string>("Semua");
  const [sourceFilter, setSourceFilter] = useState<string>("Semua");
  const [search, setSearch] = useState<string>("");

  const mergedQcRows = useMemo<QcReportRow[]>(() => {
    const liveMapped: QcReportRow[] = liveQc
      .filter((q) => q.result !== "Pending")
      .map((q, idx) => {
        const existing = QC_REPORT_DATA.find((r) => r.spkNumber === q.spkNumber);
        const isPass = q.result === "PASS";
        const defectQty = isPass ? existing?.defectQty ?? 0 : Math.max(25, Math.round(q.quantity * 0.05));
        return {
          id: q.id,
          qcCode: existing?.qcCode || `QC-2026-${String(920 + idx).padStart(4, "0")}`,
          date: q.rawInspectionDate || existing?.date || "2026-09-24",
          spkNumber: q.spkNumber,
          brand: q.brand,
          productName: q.productName,
          sourceType: q.spkNumber.includes("EKS") ? "Subkontrak Vendor Mitra" : "Produksi Internal",
          inspectedQty: q.quantity,
          passedQty: Math.max(0, q.quantity - defectQty),
          defectQty,
          decision: isPass ? "Pass" : "Reject / Rework",
          inspector: q.inspectorName,
          defectNotes:
            q.defectNotes ||
            existing?.defectNotes ||
            (isPass ? "Lulus seluruh parameter fisik & warna" : "Perlu rework"),
        };
      });

    const extraHistorical = QC_REPORT_DATA.filter(
      (r) => !liveMapped.some((l) => l.spkNumber === r.spkNumber)
    );
    return [...liveMapped, ...extraHistorical];
  }, [liveQc]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return mergedQcRows.filter((row) => {
      if (brandFilter !== "Semua" && row.brand.toLowerCase() !== brandFilter.toLowerCase()) return false;
      if (decisionFilter !== "Semua" && row.decision !== decisionFilter) return false;
      if (sourceFilter !== "Semua" && row.sourceType !== sourceFilter) return false;
      if (
        q &&
        !row.qcCode.toLowerCase().includes(q) &&
        !row.spkNumber.toLowerCase().includes(q) &&
        !row.productName.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [mergedQcRows, brandFilter, decisionFilter, sourceFilter, search]);

  const totalInspected = filtered.reduce((s, r) => s + r.inspectedQty, 0);
  const totalPassed = filtered.reduce((s, r) => s + r.passedQty, 0);
  const totalDefect = filtered.reduce((s, r) => s + r.defectQty, 0);

  const handleExportCsv = () => {
    downloadCsvReport(
      "Laporan_Quality_Control.csv",
      [
        "Kode QC",
        "Tanggal",
        "No. SPK",
        "Brand",
        "Produk",
        "Sumber Pengerjaan",
        "Jml Diperiksa",
        "Jml Lulus (Pass)",
        "Jml Defect/Reject",
        "Keputusan QC",
        "Pemeriksa",
        "Catatan Temuan",
      ],
      filtered.map((r) => [
        r.qcCode,
        r.date,
        r.spkNumber,
        r.brand,
        r.productName,
        r.sourceType,
        r.inspectedQty,
        r.passedQty,
        r.defectQty,
        r.decision,
        r.inspector,
        r.defectNotes,
      ])
    );
  };

  return (
    <DashboardLayout title="Laporan QC">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2E6ED] dark:border-[#26334D]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#2B5FC7]/10 text-[#2B5FC7] dark:text-[#60A5FA]">
                <IconCheckCircle size={18} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B5FC7] dark:text-[#60A5FA]">
                Menu Laporan · Inspeksi Mutu &amp; Evaluasi Defect
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3]">
              Laporan Quality Control (QC)
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
              Rekap hasil pemeriksaan kualitas cetakan internal maupun subkontrak vendor mitra beserta tingkat kelulusan (pass rate) dan catatan rework.
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
            <div className="text-xs text-[#6B7684]">Total Unit Diinspeksi</div>
            <div className="text-2xl font-bold font-mono text-[#1B2436] dark:text-[#E8ECF3] mt-1">
              {totalInspected.toLocaleString("id-ID")} pcs
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#059669]">
              <span>Unit Lulus QC (Good Output)</span>
              <IconCheckCircle size={15} />
            </div>
            <div className="text-2xl font-bold font-mono text-[#059669] dark:text-[#34D399] mt-1">
              {totalPassed.toLocaleString("id-ID")} pcs (
              {totalInspected ? ((totalPassed / totalInspected) * 100).toFixed(1) : "0"}%)
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#991B1B] dark:text-[#F87171]">
              <span>Unit Defect / Rework</span>
              <IconAlertTriangle size={15} />
            </div>
            <div className="text-2xl font-bold font-mono text-[#991B1B] dark:text-[#F87171] mt-1">
              {totalDefect.toLocaleString("id-ID")} pcs
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7684]" />
            <input
              type="text"
              placeholder="Cari kode QC, No. SPK, atau produk..."
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
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]"
            >
              <option value="Semua">Semua Sumber Pengerjaan</option>
              <option value="Produksi Internal">Produksi Internal</option>
              <option value="Subkontrak Vendor Mitra">Subkontrak Vendor Mitra</option>
            </select>

            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]"
            >
              <option value="Semua">Semua Keputusan QC</option>
              <option value="Pass">Pass (Lulus Penuh)</option>
              <option value="Partial Pass">Partial Pass (Lulus Sebagian)</option>
              <option value="Reject / Rework">Reject / Rework</option>
            </select>

            <button
              onClick={() => {
                setBrandFilter("Semua");
                setSourceFilter("Semua");
                setDecisionFilter("Semua");
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
                  <th className="py-3 px-4">Kode QC &amp; Tgl</th>
                  <th className="py-3 px-4">No. SPK &amp; Sumber</th>
                  <th className="py-3 px-4">Brand &amp; Produk</th>
                  <th className="py-3 px-4 text-right">Diperiksa</th>
                  <th className="py-3 px-4 text-right">Lulus / Defect</th>
                  <th className="py-3 px-4 text-center">Keputusan</th>
                  <th className="py-3 px-4">Pemeriksa &amp; Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/50">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-[#2B5FC7] dark:text-[#60A5FA]">{row.qcCode}</div>
                      <div className="text-[10px] text-[#6B7684]">{row.date}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold">{row.spkNumber}</div>
                      <div className="text-[10px] text-[#6B7684]">{row.sourceType}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">{row.productName}</div>
                      <div className="text-[10px] text-[#6B7684]">{row.brand}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {row.inspectedQty.toLocaleString("id-ID")} pcs
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span className="text-[#059669] font-bold">
                        {row.passedQty.toLocaleString("id-ID")}
                      </span>{" "}
                      /{" "}
                      <span className="text-[#991B1B] font-bold">
                        {row.defectQty.toLocaleString("id-ID")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.decision === "Pass"
                            ? "bg-[#ECFDF5] text-[#065F46]"
                            : row.decision === "Partial Pass"
                            ? "bg-[#FFFBEB] text-[#92400E]"
                            : "bg-[#FEF2F2] text-[#991B1B]"
                        }`}
                      >
                        {row.decision}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{row.inspector}</div>
                      <div className="text-[10px] text-[#6B7684]">{row.defectNotes}</div>
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

