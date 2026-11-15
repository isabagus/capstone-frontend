"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useBrands } from "@/hooks/useInventoryData";
import { useProductionPicMaster } from "@/services/partnerMasterStore";
import { useKanbanStore } from "@/services/operationalStore";
import { downloadCsvReport } from "@/utils/exportCsv";
import {
  IconProduction,
  IconDownload,
  IconPrinter,
  IconSearch,
  IconRefresh,
} from "@/components/icons/Icons";

interface ProductionReportRow {
  id: string;
  spkNumber: string;
  orderNumber: string;
  brand: string;
  productName: string;
  machineOrVendor: string;
  picName: string;
  targetQty: number;
  goodOutputQty: number;
  setupTimeMinutes: number;
  deadlineDate: string;
  stage: "Antrean SPK" | "Cetak Mesin" | "Finishing / Subkontrak" | "Menunggu QC" | "Selesai";
}

const PRODUCTION_REPORT_DATA: ProductionReportRow[] = [
  {
    id: "1",
    spkNumber: "SPK-INT-2026-081",
    orderNumber: "ORD-2026-0901",
    brand: "Packsolution.id",
    productName: "Hardbox Rigid Premium Magnetic Gold",
    machineOrVendor: "Heidelberg SM-74 (4 Warna)",
    picName: "Rudi Hartono",
    targetQty: 2500,
    goodOutputQty: 2500,
    setupTimeMinutes: 30,
    deadlineDate: "2026-11-16",
    stage: "Cetak Mesin",
  },
  {
    id: "2",
    spkNumber: "SPK-INT-2026-079",
    orderNumber: "ORD-2026-0899",
    brand: "memoirs.print",
    productName: "Photobook Hardcover Linen Series",
    machineOrVendor: "Mesin Pengeleman Hotmelt Otomatis",
    picName: "Slamet Riyadi",
    targetQty: 350,
    goodOutputQty: 350,
    setupTimeMinutes: 25,
    deadlineDate: "2026-11-17",
    stage: "Menunggu QC",
  },
  {
    id: "3",
    spkNumber: "SPK-INT-2026-082",
    orderNumber: "ORD-2026-0902",
    brand: "Estella",
    productName: "Softbox Skincare Serum Matte Doff",
    machineOrVendor: "Mesin Pond & Die-Cut Bobst",
    picName: "Ahmad Subagio",
    targetQty: 5000,
    goodOutputQty: 4980,
    setupTimeMinutes: 40,
    deadlineDate: "2026-11-19",
    stage: "Antrean SPK",
  },
  {
    id: "4",
    spkNumber: "SPK-EKS-2026-042",
    orderNumber: "ORD-2026-0903",
    brand: "Pepipapier",
    productName: "Greeting Card & Custom Envelope Foil",
    machineOrVendor: "Vendor Foil & Emboss Kurnia",
    picName: "Wahyu Pratama",
    targetQty: 1200,
    goodOutputQty: 1200,
    setupTimeMinutes: 20,
    deadlineDate: "2026-11-23",
    stage: "Finishing / Subkontrak",
  },
  {
    id: "5",
    spkNumber: "SPK-INT-2026-078",
    orderNumber: "ORD-2026-0895",
    brand: "pikpurry",
    productName: "Packaging Snack Pouch Ziplock",
    machineOrVendor: "Heidelberg SM-52 / SM-74",
    picName: "Joko Santoso",
    targetQty: 10000,
    goodOutputQty: 10000,
    setupTimeMinutes: 35,
    deadlineDate: "2026-11-25",
    stage: "Selesai",
  },
];

export default function ProductionReportPage() {
  const dynamicBrands = useBrands();
  const { pics } = useProductionPicMaster();
  const [liveKanban] = useKanbanStore();
  const brandOptions = ["Semua", ...dynamicBrands];

  const [brandFilter, setBrandFilter] = useState<string>("Semua");
  const [picFilter, setPicFilter] = useState<string>("Semua");
  const [stageFilter, setStageFilter] = useState<string>("Semua");
  const [search, setSearch] = useState<string>("");

  const mergedProductionRows = useMemo<ProductionReportRow[]>(() => {
    const stageMap: Record<string, ProductionReportRow["stage"]> = {
      "Design Approved": "Antrean SPK",
      "In-Progress": "Cetak Mesin",
      Finishing: "Finishing / Subkontrak",
      "QC Pending": "Menunggu QC",
    };

    const liveMapped: ProductionReportRow[] = liveKanban.map((k) => {
      const existing = PRODUCTION_REPORT_DATA.find((r) => r.spkNumber === k.spkNumber);
      const rawPic = (k.operatorAssigned || "").split("(")[0].trim();
      return {
        id: k.id,
        spkNumber: k.spkNumber,
        orderNumber: k.orderNumber,
        brand: k.brand,
        productName: k.productName,
        machineOrVendor: k.machineAssigned || existing?.machineOrVendor || "Belum Dialokasikan",
        picName: rawPic && rawPic !== "Belum Ditugaskan" ? rawPic : existing?.picName || "Rudi Hartono",
        targetQty: k.quantity,
        goodOutputQty: existing?.goodOutputQty ?? k.quantity,
        setupTimeMinutes: existing?.setupTimeMinutes ?? 30,
        deadlineDate: k.deadline,
        stage: stageMap[k.stage] || "Antrean SPK",
      };
    });

    const extraHistorical = PRODUCTION_REPORT_DATA.filter(
      (r) => !liveMapped.some((l) => l.spkNumber === r.spkNumber)
    );
    return [...liveMapped, ...extraHistorical];
  }, [liveKanban]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return mergedProductionRows.filter((row) => {
      if (brandFilter !== "Semua" && row.brand.toLowerCase() !== brandFilter.toLowerCase()) return false;
      if (picFilter !== "Semua" && row.picName !== picFilter) return false;
      if (stageFilter !== "Semua" && row.stage !== stageFilter) return false;
      if (
        q &&
        !row.spkNumber.toLowerCase().includes(q) &&
        !row.productName.toLowerCase().includes(q) &&
        !row.machineOrVendor.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    }).sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate));
  }, [mergedProductionRows, brandFilter, picFilter, stageFilter, search]);

  const handleExportCsv = () => {
    downloadCsvReport(
      "Laporan_Produksi_SPK.csv",
      [
        "No. SPK",
        "No. Order",
        "Brand",
        "Produk",
        "Mesin / Vendor",
        "Penanggung Jawab (PIC)",
        "Target (Pcs)",
        "Output Baik (Pcs)",
        "Waktu Setup (Menit)",
        "Deadline",
        "Tahap Produksi",
      ],
      filtered.map((r) => [
        r.spkNumber,
        r.orderNumber,
        r.brand,
        r.productName,
        r.machineOrVendor,
        r.picName,
        r.targetQty,
        r.goodOutputQty,
        r.setupTimeMinutes,
        r.deadlineDate,
        r.stage,
      ])
    );
  };

  return (
    <DashboardLayout title="Laporan Produksi">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2E6ED] dark:border-[#26334D]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#2B5FC7]/10 text-[#2B5FC7] dark:text-[#60A5FA]">
                <IconProduction size={18} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B5FC7] dark:text-[#60A5FA]">
                Menu Laporan · Utilisasi Mesin &amp; Realisasi SPK
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3]">
              Laporan Produksi &amp; Kinerja Mesin
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
              Pantau realisasi output SPK, waktu setup mesin, serta beban kerja Penanggung Jawab (PIC Produksi) berdasarkan urutan deadline.
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

        {/* Filter Bar */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7684]" />
            <input
              type="text"
              placeholder="Cari No. SPK, produk, atau nama mesin..."
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
              value={picFilter}
              onChange={(e) => setPicFilter(e.target.value)}
              className="h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]"
            >
              <option value="Semua">Semua Penanggung Jawab (PIC)</option>
              {pics.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.division})
                </option>
              ))}
            </select>

            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="h-9 px-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]"
            >
              <option value="Semua">Semua Tahap</option>
              <option value="Antrean SPK">Antrean SPK</option>
              <option value="Cetak Mesin">Cetak Mesin</option>
              <option value="Finishing / Subkontrak">Finishing / Subkontrak</option>
              <option value="Menunggu QC">Menunggu QC</option>
              <option value="Selesai">Selesai</option>
            </select>

            <button
              onClick={() => {
                setBrandFilter("Semua");
                setPicFilter("Semua");
                setStageFilter("Semua");
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
                  <th className="py-3 px-4">No. SPK &amp; Order</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Brand &amp; Produk</th>
                  <th className="py-3 px-4">Mesin / Vendor</th>
                  <th className="py-3 px-4">Penanggung Jawab (PIC)</th>
                  <th className="py-3 px-4 text-right">Target / Output</th>
                  <th className="py-3 px-4 text-center">Tahap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/50">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-[#2B5FC7] dark:text-[#60A5FA]">{row.spkNumber}</div>
                      <div className="text-[10px] text-[#6B7684]">{row.orderNumber}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#991B1B] dark:text-[#F87171]">
                      {row.deadlineDate}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">{row.productName}</div>
                      <div className="text-[10px] text-[#6B7684]">{row.brand}</div>
                    </td>
                    <td className="py-3 px-4 font-medium">{row.machineOrVendor}</td>
                    <td className="py-3 px-4 font-semibold">{row.picName}</td>
                    <td className="py-3 px-4 text-right font-mono">
                      <div>
                        {row.goodOutputQty.toLocaleString("id-ID")} / {row.targetQty.toLocaleString("id-ID")} pcs
                      </div>
                      <div className="text-[10px] text-[#6B7684]">Setup: {row.setupTimeMinutes} mnt</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF4FE] text-[#2B5FC7] dark:bg-[#1D4ED8]/25 dark:text-[#93C5FD]">
                        {row.stage}
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

