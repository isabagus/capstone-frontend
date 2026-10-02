"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  IconUsd,
  IconRefresh,
  IconTrendingUp,
  IconTrendingDown,
  IconCalendar,
  IconAlertCircle,
  IconSearch,
  IconDownload,
  IconSliders,
  IconCheckCircle,
  IconInfo,
} from "@/components/icons/Icons";

interface MaterialPriceImpact {
  id: string;
  name: string;
  category: string;
  origin: string;
  baseCurrency: "USD" | "IDR";
  basePriceUSD: number;
  currentPriceIDR: number;
  sensitivity: "TINGGI" | "SEDANG" | "RENDAH";
  unit: string;
  lastUpdated: string;
  supplier: string;
}

export default function UsdAnalyticsPage() {
  const [period, setPeriod] = useState<"7D" | "30D" | "90D" | "1Y">("30D");
  const [simulatedRate, setSimulatedRate] = useState<number>(16000);
  const [activeTab, setActiveTab] = useState<"chart" | "simulation" | "materials">("chart");
  const [searchMaterial, setSearchMaterial] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Spot USD Data
  const currentRate = 15865;
  const yesterdayRate = 15810;
  const rateChange = currentRate - yesterdayRate;
  const rateChangePercent = ((rateChange / yesterdayRate) * 100).toFixed(2);
  const isUp = rateChange >= 0;

  // 30 Days mock trend data
  const historicalData = [
    { day: "01 Sep", rate: 15690, paperIndex: 100 },
    { day: "05 Sep", rate: 15720, paperIndex: 100.5 },
    { day: "09 Sep", rate: 15680, paperIndex: 100.2 },
    { day: "13 Sep", rate: 15750, paperIndex: 101.1 },
    { day: "17 Sep", rate: 15790, paperIndex: 101.8 },
    { day: "21 Sep", rate: 15810, paperIndex: 102.3 },
    { day: "24 Sep", rate: 15865, paperIndex: 103.1 },
  ];

  const materials: MaterialPriceImpact[] = [
    {
      id: "MAT-01",
      name: "Ivory Board 300gsm (Ningbo Star)",
      category: "Kertas Impor",
      origin: "China",
      baseCurrency: "USD",
      basePriceUSD: 0.92, // per kg
      currentPriceIDR: 14600,
      sensitivity: "TINGGI",
      unit: "Kg",
      lastUpdated: "2026-09-24",
      supplier: "PT Paper Impexindo",
    },
    {
      id: "MAT-02",
      name: "Art Carton 260gsm (Hansol)",
      category: "Kertas Impor",
      origin: "Korea",
      baseCurrency: "USD",
      basePriceUSD: 0.98,
      currentPriceIDR: 15550,
      sensitivity: "TINGGI",
      unit: "Kg",
      lastUpdated: "2026-09-23",
      supplier: "PT Surya Kencana Paper",
    },
    {
      id: "MAT-03",
      name: "Tinta Cetak Process Cyan (Toyo Ink)",
      category: "Tinta Offset",
      origin: "Jepang",
      baseCurrency: "USD",
      basePriceUSD: 8.5,
      currentPriceIDR: 134850,
      sensitivity: "SEDANG",
      unit: "Kaleng (1 Kg)",
      lastUpdated: "2026-09-20",
      supplier: "PT Toyo Ink Indonesia",
    },
    {
      id: "MAT-04",
      name: "Hot Stamping Foil Gold 120m (Kurz)",
      category: "Finishing Foil",
      origin: "Jerman",
      baseCurrency: "USD",
      basePriceUSD: 18.2,
      currentPriceIDR: 288750,
      sensitivity: "SEDANG",
      unit: "Roll",
      lastUpdated: "2026-09-18",
      supplier: "PT Kurz Foil Asia",
    },
    {
      id: "MAT-05",
      name: "Lem Hotmelt Spine Binding (Henkel)",
      category: "Lem Finishing",
      origin: "Jerman",
      baseCurrency: "USD",
      basePriceUSD: 4.6,
      currentPriceIDR: 72980,
      sensitivity: "RENDAH",
      unit: "Kg",
      lastUpdated: "2026-09-15",
      supplier: "PT Henkel Adhesive",
    },
    {
      id: "MAT-06",
      name: "Duplex Board Coated 350gsm",
      category: "Kertas Lokal",
      origin: "Lokal (ID)",
      baseCurrency: "IDR",
      basePriceUSD: 0.65,
      currentPriceIDR: 10300,
      sensitivity: "RENDAH",
      unit: "Kg",
      lastUpdated: "2026-09-22",
      supplier: "PT Pindo Deli Pulp",
    },
  ];

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 1200);
  };

  const filteredMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(searchMaterial.toLowerCase()) ||
      m.category.toLowerCase().includes(searchMaterial.toLowerCase()) ||
      m.supplier.toLowerCase().includes(searchMaterial.toLowerCase())
  );

  // Simulation calculations
  const simDeltaPct = (((simulatedRate - currentRate) / currentRate) * 100).toFixed(2);
  const sampleOrderPaperKg = 450; // 450 kg ivory for 5000 hardbox
  const baseOrderCost = sampleOrderPaperKg * materials[0].currentPriceIDR;
  const simulatedOrderCost = sampleOrderPaperKg * (materials[0].basePriceUSD * simulatedRate);
  const costDifference = simulatedOrderCost - baseOrderCost;

  return (
    <DashboardLayout title="Analitik Kurs USD & Sensitivitas Bahan">
      <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#2B5FC7]/10 dark:bg-[#3B6FE0]/15 text-[#2B5FC7] dark:text-[#3B6FE0]">
              <IconUsd size={20} />
            </span>
            Analitik Kurs USD & Sensitivitas Bahan Baku
          </h1>
          <p className="text-xs text-[#6B7684] dark:text-[#8A94A6] mt-1">
            Monitoring kurs valuta asing realtime terhadap HPP material impor (kertas, tinta, hot stamping foil)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] dark:hover:bg-[#2B5FC7] text-white transition-all shadow-sm disabled:opacity-50"
          >
            <IconRefresh size={14} className={isSyncing ? "animate-spin" : ""} />
            <span>{isSyncing ? "Menyinkronkan..." : "Sinkronisasi Kurs BI"}</span>
          </button>
        </div>
      </div>

      {/* Alert Notifikasi Sync */}
      {syncSuccess && (
        <div className="p-3 rounded-lg bg-[#065F46]/10 border border-[#065F46]/30 text-[#065F46] dark:text-[#34D399] text-xs flex items-center gap-2 animate-fadeIn">
          <IconCheckCircle size={16} />
          <span>Kurs USD berhasil disinkronkan langsung dari data referensi Jakarta Interbank Spot Dollar Rate (JISDOR) Bank Indonesia.</span>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Kurs Spot Terkini */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
          <div className="flex items-center justify-between text-[#6B7684] dark:text-[#8A94A6] text-xs">
            <span className="font-medium">Kurs Spot USD / IDR</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2B5FC7]/10 text-[#2B5FC7] dark:text-[#3B6FE0]">
              JISDOR BI
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight">
              Rp {currentRate.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
            {isUp ? (
              <span className="text-[#991B1B] dark:text-[#F87171] flex items-center gap-0.5">
                <IconTrendingUp size={14} /> +{rateChangePercent}% (+Rp {rateChange})
              </span>
            ) : (
              <span className="text-[#065F46] dark:text-[#34D399] flex items-center gap-0.5">
                <IconTrendingDown size={14} /> {rateChangePercent}%
              </span>
            )}
            <span className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] font-normal">vs kemarin</span>
          </div>
        </div>

        {/* Card 2: Rata-Rata 30 Hari */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
          <div className="flex items-center justify-between text-[#6B7684] dark:text-[#8A94A6] text-xs">
            <span className="font-medium">Rata-Rata 30 Hari</span>
            <IconCalendar size={14} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight">
              Rp 15.742
            </span>
          </div>
          <div className="mt-2 text-xs text-[#6B7684] dark:text-[#8A94A6]">
            Volatilitas standar: <span className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">± 1.15%</span>
          </div>
        </div>

        {/* Card 3: Indeks Kenaikan Kertas Impor */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
          <div className="flex items-center justify-between text-[#6B7684] dark:text-[#8A94A6] text-xs">
            <span className="font-medium">Indeks Kertas Impor</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#854D0E]/10 text-[#854D0E] dark:text-[#FACC15]">
              Fluktuatif
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight">
              +3.1%
            </span>
          </div>
          <div className="mt-2 text-xs text-[#6B7684] dark:text-[#8A94A6]">
            Dampak langsung pada Ivory & Art Carton
          </div>
        </div>

        {/* Card 4: Sensitivitas Margin Produksi */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
          <div className="flex items-center justify-between text-[#6B7684] dark:text-[#8A94A6] text-xs">
            <span className="font-medium">Sensitivitas Margin</span>
            <IconAlertCircle size={14} className="text-[#854D0E] dark:text-[#FACC15]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#991B1B] dark:text-[#F87171] tracking-tight">
              -0.42%
            </span>
          </div>
          <div className="mt-2 text-xs text-[#6B7684] dark:text-[#8A94A6]">
            Erosi margin kotor tiap kenaikan Rp 100 USD
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E2E6ED] dark:border-[#26334D] gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("chart")}
          className={`pb-3 transition-colors relative ${
            activeTab === "chart"
              ? "text-[#2B5FC7] dark:text-[#3B6FE0]"
              : "text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3]"
          }`}
        >
          Grafik Korelasi Kurs & Material
          {activeTab === "chart" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2B5FC7] dark:bg-[#3B6FE0] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("simulation")}
          className={`pb-3 transition-colors relative ${
            activeTab === "simulation"
              ? "text-[#2B5FC7] dark:text-[#3B6FE0]"
              : "text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3]"
          }`}
        >
          Simulator Dampak HPP & Margin
          {activeTab === "simulation" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2B5FC7] dark:bg-[#3B6FE0] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("materials")}
          className={`pb-3 transition-colors relative ${
            activeTab === "materials"
              ? "text-[#2B5FC7] dark:text-[#3B6FE0]"
              : "text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3]"
          }`}
        >
          Katalog Material Sensitif USD ({materials.length})
          {activeTab === "materials" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2B5FC7] dark:bg-[#3B6FE0] rounded-full" />
          )}
        </button>
      </div>

      {/* TAB 1: CHART VIEW */}
      {activeTab === "chart" && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                  Tren Nilai Tukar USD/IDR vs Indeks Harga Kertas Impor
                </h3>
                <p className="text-xs text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                  Visualisasi pergerakan harian kurs valuta asing terhadap penyesuaian harga supplier kertas
                </p>
              </div>

              {/* Range Selector */}
              <div className="inline-flex rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] p-1 border border-[#E2E6ED] dark:border-[#26334D] text-xs font-semibold">
                {(["7D", "30D", "90D", "1Y"] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => setPeriod(item)}
                    className={`px-3 py-1 rounded-md transition-all ${
                      period === item
                        ? "bg-white dark:bg-[#16223A] text-[#2B5FC7] dark:text-[#3B6FE0] shadow-xs"
                        : "text-[#6B7684] dark:text-[#8A94A6] hover:text-[#1B2436]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Clean SVG Vector Line Chart */}
            <div className="h-64 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 800 240" fill="none" preserveAspectRatio="none">
                {/* Horizontal Gridlines */}
                <line x1="0" y1="40" x2="800" y2="40" stroke="currentColor" className="text-[#E2E6ED] dark:text-[#26334D]" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="800" y2="100" stroke="currentColor" className="text-[#E2E6ED] dark:text-[#26334D]" strokeDasharray="3 3" />
                <line x1="0" y1="160" x2="800" y2="160" stroke="currentColor" className="text-[#E2E6ED] dark:text-[#26334D]" strokeDasharray="3 3" />
                <line x1="0" y1="220" x2="800" y2="220" stroke="currentColor" className="text-[#E2E6ED] dark:text-[#26334D]" />

                {/* Line 1: Kurs USD (Cobalt Blue) */}
                <path
                  d="M 50 180 Q 150 150 250 185 T 450 130 T 600 110 T 750 60"
                  fill="none"
                  stroke="#2B5FC7"
                  strokeWidth="3"
                  className="dark:stroke-[#3B6FE0]"
                />
                {/* Gradient area under Line 1 */}
                <path
                  d="M 50 180 Q 150 150 250 185 T 450 130 T 600 110 T 750 60 L 750 220 L 50 220 Z"
                  fill="url(#blueGradient)"
                  opacity="0.15"
                />

                {/* Line 2: Indeks Kertas Impor (Emerald) */}
                <path
                  d="M 50 195 Q 150 180 250 190 T 450 160 T 600 140 T 750 90"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />

                {/* Data Points */}
                <circle cx="50" cy="180" r="4" fill="#2B5FC7" className="dark:fill-[#3B6FE0]" />
                <circle cx="250" cy="185" r="4" fill="#2B5FC7" className="dark:fill-[#3B6FE0]" />
                <circle cx="450" cy="130" r="4" fill="#2B5FC7" className="dark:fill-[#3B6FE0]" />
                <circle cx="600" cy="110" r="4" fill="#2B5FC7" className="dark:fill-[#3B6FE0]" />
                <circle cx="750" cy="60" r="5" fill="#2B5FC7" stroke="#FFFFFF" strokeWidth="2" className="dark:fill-[#3B6FE0]" />

                {/* Gradients */}
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2B5FC7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#2B5FC7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-2 px-6">
                {historicalData.map((d) => (
                  <span key={d.day}>{d.day}</span>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-4 border-t border-[#E2E6ED] dark:border-[#26334D] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1 rounded-full bg-[#2B5FC7] dark:bg-[#3B6FE0]" />
                <span className="text-[#1B2436] dark:text-[#E8ECF3] font-medium">Kurs USD / IDR (JISDOR)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1 rounded-full bg-[#059669] border border-[#059669]" />
                <span className="text-[#1B2436] dark:text-[#E8ECF3] font-medium">Indeks Harga Kertas Impor (+3.1%)</span>
              </div>
              <div className="flex items-center gap-2 text-[#6B7684] dark:text-[#8A94A6]">
                <IconInfo size={14} />
                <span>Korelasi pearson: <strong className="text-[#1B2436] dark:text-[#E8ECF3]">0.89</strong> (Korelasi Sangat Kuat)</span>
              </div>
            </div>
          </div>

          {/* Actionable Insights */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#2B5FC7]/10 via-[#2B5FC7]/5 to-transparent border border-[#2B5FC7]/20 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#2B5FC7] text-white shrink-0 mt-0.5">
              <IconAlertCircle size={18} />
            </div>
            <div className="text-xs">
              <h4 className="font-bold text-[#1B2436] dark:text-[#E8ECF3]">Rekomendasi Kebijakan Procurement Percetakan:</h4>
              <p className="text-[#6B7684] dark:text-[#8A94A6] mt-1 leading-relaxed">
                Kurs USD mendekati batas resistensi Rp 15.900. Disarankan untuk segera melakukan <span className="font-semibold text-[#2B5FC7] dark:text-[#3B6FE0]">Lock PO Pembelian Kertas Ivory & Art Carton</span> untuk kebutuhan pesanan 2-3 bulan ke depan sebelum supplier menaikkan pricelist batch Oktober 2026.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WHAT-IF SIMULATOR */}
      {activeTab === "simulation" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Slider Controls */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <IconSliders size={18} className="text-[#2B5FC7] dark:text-[#3B6FE0]" />
                <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">Parameter Simulasi Kurs</h3>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-[#6B7684] dark:text-[#8A94A6]">Kurs Simulasi (USD / IDR):</span>
                  <span className="font-bold text-[#2B5FC7] dark:text-[#3B6FE0]">
                    Rp {simulatedRate.toLocaleString("id-ID")}
                  </span>
                </div>
                <input
                  type="range"
                  min="14500"
                  max="17500"
                  step="50"
                  value={simulatedRate}
                  onChange={(e) => setSimulatedRate(Number(e.target.value))}
                  className="w-full accent-[#2B5FC7] dark:accent-[#3B6FE0] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-1">
                  <span>Rp 14.500</span>
                  <span>Rp 16.000</span>
                  <span>Rp 17.500</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#6B7684] dark:text-[#8A94A6]">Kurs Riil Saat Ini:</span>
                  <span className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">Rp {currentRate.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7684] dark:text-[#8A94A6]">Perubahan Simulasi:</span>
                  <span className={`font-semibold ${Number(simDeltaPct) >= 0 ? "text-[#991B1B] dark:text-[#F87171]" : "text-[#065F46] dark:text-[#34D399]"}`}>
                    {Number(simDeltaPct) >= 0 ? `+${simDeltaPct}%` : `${simDeltaPct}%`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSimulatedRate(currentRate)}
                className="w-full py-2 text-xs font-semibold rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] hover:bg-[#F4F6FA] dark:hover:bg-[#1B2A44] transition-colors"
              >
                Reset ke Kurs Riil
              </button>
            </div>

            {/* Simulation Results Display */}
            <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3] flex items-center justify-between">
                <span>Studi Kasus: Produksi 5.000 Pcs Hardbox Premium (Ivory 300gsm)</span>
                <span className="text-xs font-normal text-[#6B7684] dark:text-[#8A94A6]">Kebutuhan Kertas: 450 Kg</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]">
                  <div className="text-xs text-[#6B7684] dark:text-[#8A94A6]">Biaya Bahan pada Kurs Riil</div>
                  <div className="text-lg font-bold text-[#1B2436] dark:text-[#E8ECF3] mt-1">
                    Rp {baseOrderCost.toLocaleString("id-ID")}
                  </div>
                  <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                    @ Rp {materials[0].currentPriceIDR.toLocaleString("id-ID")} / Kg
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#2B5FC7]/5 dark:bg-[#3B6FE0]/10 border border-[#2B5FC7]/20">
                  <div className="text-xs text-[#2B5FC7] dark:text-[#3B6FE0] font-medium">Biaya Bahan Kurs Simulasi</div>
                  <div className="text-lg font-bold text-[#2B5FC7] dark:text-[#3B6FE0] mt-1">
                    Rp {Math.round(simulatedOrderCost).toLocaleString("id-ID")}
                  </div>
                  <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                    @ Rp {Math.round(materials[0].basePriceUSD * simulatedRate).toLocaleString("id-ID")} / Kg
                  </div>
                </div>
              </div>

              {/* Impact Breakdown Table */}
              <div className="p-4 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#6B7684] dark:text-[#8A94A6]">Selisih Total Beban Pokok Produksi:</span>
                  <span className={`font-bold ${costDifference >= 0 ? "text-[#991B1B] dark:text-[#F87171]" : "text-[#065F46] dark:text-[#34D399]"}`}>
                    {costDifference >= 0 ? `+Rp ${Math.round(costDifference).toLocaleString("id-ID")}` : `-Rp ${Math.abs(Math.round(costDifference)).toLocaleString("id-ID")}`}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#6B7684] dark:text-[#8A94A6]">Kenaikan Beban Pokok per Pcs Box:</span>
                  <span className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                    +Rp {Math.round(costDifference / 5000).toLocaleString("id-ID")} / pcs
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#6B7684] dark:text-[#8A94A6]">Rekomendasi Penyesuaian Harga Jual:</span>
                  <span className="font-bold text-[#2B5FC7] dark:text-[#3B6FE0]">
                    Naikkan minimal +{(Number(simDeltaPct) * 0.4).toFixed(1)}% untuk menjaga margin 35%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MATERIALS CATALOG */}
      {activeTab === "materials" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B7684]">
                <IconSearch size={14} />
              </span>
              <input
                type="text"
                value={searchMaterial}
                onChange={(e) => setSearchMaterial(e.target.value)}
                placeholder="Cari material, vendor, atau kategori..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:outline-none focus:border-[#2B5FC7]"
              />
            </div>

            <button className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] text-[#1B2436] dark:text-[#E8ECF3] hover:bg-[#F4F6FA] dark:hover:bg-[#1B2A44] transition-colors">
              <IconDownload size={14} />
              <span>Ekspor Sensitivitas (CSV)</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA] dark:bg-[#1B2A44] text-[11px] font-semibold text-[#6B7684] dark:text-[#8A94A6] uppercase tracking-wider">
                  <th className="py-3 px-4">Kode & Material</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Asal & Vendor</th>
                  <th className="py-3 px-4">Harga Acuan (USD)</th>
                  <th className="py-3 px-4">Harga Terkini (IDR)</th>
                  <th className="py-3 px-4">Sensitivitas Kurs</th>
                  <th className="py-3 px-4">Estimasi jika USD +5%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-xs">
                {filteredMaterials.map((mat) => {
                  const projectedPrice = Math.round(mat.currentPriceIDR * 1.05);
                  return (
                    <tr key={mat.id} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{mat.name}</div>
                        <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">{mat.id}</div>
                      </td>
                      <td className="py-3 px-4 text-[#6B7684] dark:text-[#8A94A6]">{mat.category}</td>
                      <td className="py-3 px-4">
                        <div className="text-[#1B2436] dark:text-[#E8ECF3] font-medium">{mat.origin}</div>
                        <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">{mat.supplier}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-[#1B2436] dark:text-[#E8ECF3]">
                        {mat.baseCurrency === "USD" ? `$${mat.basePriceUSD.toFixed(2)}` : "-"}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                        Rp {mat.currentPriceIDR.toLocaleString("id-ID")} / {mat.unit}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                            mat.sensitivity === "TINGGI"
                              ? "bg-[#991B1B]/10 text-[#991B1B] dark:text-[#F87171]"
                              : mat.sensitivity === "SEDANG"
                              ? "bg-[#854D0E]/10 text-[#854D0E] dark:text-[#FACC15]"
                              : "bg-[#065F46]/10 text-[#065F46] dark:text-[#34D399]"
                          }`}
                        >
                          {mat.sensitivity}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#991B1B] dark:text-[#F87171] font-medium">
                        Rp {projectedPrice.toLocaleString("id-ID")}
                        <span className="text-[10px] block text-[#6B7684] dark:text-[#8A94A6]">(+Rp {(projectedPrice - mat.currentPriceIDR).toLocaleString("id-ID")})</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
