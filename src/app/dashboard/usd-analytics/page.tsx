"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  IconUsd,
  IconRefresh,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertCircle,
  IconSearch,
  IconDownload,
  IconSliders,
  IconCheckCircle,
  IconWarehouse,
  IconPackage,
} from "@/components/icons/Icons";

interface ImportedStockItem {
  id: string;
  sku: string;
  name: string;
  category: "Kertas Impor" | "Tinta & Kimia Impor" | "Foil & Finishing Impor" | "Sparepart Mesin Impor";
  originCountry: string;
  supplier: string;
  unit: string;
  currentStockQty: number;
  reorderTargetQty: number;
  warehouseLocation: "Gudang 1 (Pabrik)" | "Gudang 2 (Ruko)";
  purchasePriceUSD: number; // Harga beli dari luar negeri dalam USD per unit
  lastPurchaseRateIDR: number; // Kurs saat pembelian batch stok terakhir
}

const IMPORTED_STOCK_ITEMS: ImportedStockItem[] = [
  {
    id: "IMP-01",
    sku: "MAT-IMP-IV300",
    name: "Kertas Ivory Board 300 GSM Plano (Ningbo Star)",
    category: "Kertas Impor",
    originCountry: "China",
    supplier: "PT Paper Impexindo",
    unit: "Rim (500 Lbr)",
    currentStockQty: 45,
    reorderTargetQty: 30,
    warehouseLocation: "Gudang 1 (Pabrik)",
    purchasePriceUSD: 42.5,
    lastPurchaseRateIDR: 15650,
  },
  {
    id: "IMP-02",
    sku: "MAT-IMP-AC260",
    name: "Art Carton 260 GSM High Gloss Plano (Hansol)",
    category: "Kertas Impor",
    originCountry: "Korea Selatan",
    supplier: "PT Surya Kencana Paper",
    unit: "Rim (500 Lbr)",
    currentStockQty: 38,
    reorderTargetQty: 25,
    warehouseLocation: "Gudang 1 (Pabrik)",
    purchasePriceUSD: 39.0,
    lastPurchaseRateIDR: 15700,
  },
  {
    id: "IMP-03",
    sku: "MAT-IMP-INK01",
    name: "Tinta Offset Process Cyan & Magenta (Toyo Ink)",
    category: "Tinta & Kimia Impor",
    originCountry: "Jepang",
    supplier: "PT Toyo Ink Indonesia",
    unit: "Kaleng (1 Kg)",
    currentStockQty: 64,
    reorderTargetQty: 40,
    warehouseLocation: "Gudang 1 (Pabrik)",
    purchasePriceUSD: 8.5,
    lastPurchaseRateIDR: 15680,
  },
  {
    id: "IMP-04",
    sku: "MAT-IMP-FOIL04",
    name: "Hot Stamping Foil Gold Metallic 120m (Leonhard Kurz)",
    category: "Foil & Finishing Impor",
    originCountry: "Jerman",
    supplier: "PT Kurz Foil Asia",
    unit: "Roll",
    currentStockQty: 28,
    reorderTargetQty: 20,
    warehouseLocation: "Gudang 2 (Ruko)",
    purchasePriceUSD: 18.2,
    lastPurchaseRateIDR: 15600,
  },
  {
    id: "IMP-05",
    sku: "MAT-IMP-GLUE02",
    name: "Lem Hotmelt EVA Packaging Grade (Henkel Technomelt)",
    category: "Tinta & Kimia Impor",
    originCountry: "Jerman",
    supplier: "PT Henkel Adhesive",
    unit: "Sak (25 Kg)",
    currentStockQty: 16,
    reorderTargetQty: 15,
    warehouseLocation: "Gudang 2 (Ruko)",
    purchasePriceUSD: 94.0,
    lastPurchaseRateIDR: 15720,
  },
  {
    id: "IMP-06",
    sku: "SPR-IMP-HD74",
    name: "Rubber Blanket Compressible Mesin Cetak Heidelberg SM-74",
    category: "Sparepart Mesin Impor",
    originCountry: "Jerman",
    supplier: "Heidelberg Parts Asia",
    unit: "Lembar Set",
    currentStockQty: 6,
    reorderTargetQty: 4,
    warehouseLocation: "Gudang 1 (Pabrik)",
    purchasePriceUSD: 68.0,
    lastPurchaseRateIDR: 15650,
  },
  {
    id: "IMP-07",
    sku: "SPR-IMP-PLR92",
    name: "Pisau Potong Guillotine HSS Polar 92 High Precision",
    category: "Sparepart Mesin Impor",
    originCountry: "Jerman",
    supplier: "Polar Mohr Graphic",
    unit: "Unit",
    currentStockQty: 2,
    reorderTargetQty: 2,
    warehouseLocation: "Gudang 1 (Pabrik)",
    purchasePriceUSD: 215.0,
    lastPurchaseRateIDR: 15590,
  },
];

export default function UsdAnalyticsPage() {
  const [currentRate, setCurrentRate] = useState<number>(15865);
  const [predictedRate, setPredictedRate] = useState<number>(16250);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedItemForCalc, setSelectedItemForCalc] = useState<string>(IMPORTED_STOCK_ITEMS[0].id);
  const [restockSimQty, setRestockSimQty] = useState<number>(30);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const yesterdayRate = 15810;
  const rateChange = currentRate - yesterdayRate;
  const rateChangePercent = ((rateChange / yesterdayRate) * 100).toFixed(2);
  const isUp = rateChange >= 0;

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setCurrentRate(15880);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3500);
    }, 900);
  };

  const filteredStock = IMPORTED_STOCK_ITEMS.filter((item) => {
    if (selectedCategory !== "Semua" && item.category !== selectedCategory) return false;
    if (
      searchQuery &&
      !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.sku.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.originCountry.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Total valuasi stok barang impor di gudang saat ini
  const totalStockUSD = IMPORTED_STOCK_ITEMS.reduce(
    (sum, item) => sum + item.currentStockQty * item.purchasePriceUSD,
    0
  );
  const totalCurrentValuationIDR = Math.round(totalStockUSD * currentRate);
  const totalPredictedValuationIDR = Math.round(totalStockUSD * predictedRate);
  const totalRestockCostCurrentIDR = Math.round(
    IMPORTED_STOCK_ITEMS.reduce((sum, item) => sum + item.reorderTargetQty * item.purchasePriceUSD, 0) *
      currentRate
  );
  const totalRestockCostPredictedIDR = Math.round(
    IMPORTED_STOCK_ITEMS.reduce((sum, item) => sum + item.reorderTargetQty * item.purchasePriceUSD, 0) *
      predictedRate
  );

  const activeCalcItem =
    IMPORTED_STOCK_ITEMS.find((i) => i.id === selectedItemForCalc) || IMPORTED_STOCK_ITEMS[0];
  const unitPriceHistoricalIDR = Math.round(
    activeCalcItem.purchasePriceUSD * activeCalcItem.lastPurchaseRateIDR
  );
  const unitPriceCurrentIDR = Math.round(activeCalcItem.purchasePriceUSD * currentRate);
  const unitPricePredictedIDR = Math.round(activeCalcItem.purchasePriceUSD * predictedRate);

  return (
    <DashboardLayout title="Konversi & Prediksi Harga Stok Impor (USD)">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2E6ED] dark:border-[#26334D]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#2B5FC7] dark:bg-[#3B6FE0]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B5FC7] dark:text-[#3B6FE0]">
                MOD-06 · Valuasi & Prediksi Harga Stok Barang Impor (USD → IDR)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight flex items-center gap-2">
              Konversi & Prediksi Harga Stok Barang Impor
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
              Fokus pada stok barang gudang yang dibeli dari luar negeri (Kertas Impor, Tinta, Foil, dan Sparepart Mesin) untuk konversi harga stok riil & prediksi biaya restock.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] dark:hover:bg-[#2B5FC7] text-white transition-all shadow-sm disabled:opacity-50"
            >
              <IconRefresh size={14} className={isSyncing ? "animate-spin" : ""} />
              <span>{isSyncing ? "Menyinkronkan..." : "Update Kurs Spot USD"}</span>
            </button>
          </div>
        </div>

        {/* Notifikasi Sync */}
        {syncSuccess && (
          <div className="p-3 rounded-lg bg-[#065F46]/10 border border-[#065F46]/30 text-[#065F46] dark:text-[#34D399] text-xs flex items-center gap-2">
            <IconCheckCircle size={16} />
            <span>
              Kurs Spot USD berhasil diperbarui ke <strong>Rp {currentRate.toLocaleString("id-ID")}</strong>. Seluruh harga konversi stok barang impor di gudang telah dikalkulasi ulang otomatis.
            </span>
          </div>
        )}

        {/* 4 Top Summary Cards — Fokus Valuasi & Prediksi Stok Impor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Kurs Spot Saat Ini */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between text-[#6B7684] dark:text-[#8A94A6] text-xs">
              <span className="font-medium">Kurs Konversi Aktif (USD → IDR)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2B5FC7]/10 text-[#2B5FC7] dark:text-[#3B6FE0]">
                JISDOR BI
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] font-mono">
              Rp {currentRate.toLocaleString("id-ID")}
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
              <span className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] font-normal">hari ini</span>
            </div>
          </div>

          {/* Card 2: Total Valuasi Stok Impor di Gudang */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between text-[#6B7684] dark:text-[#8A94A6] text-xs">
              <span className="font-medium">Nilai Konversi Stok Impor Gudang</span>
              <IconWarehouse size={14} className="text-[#2B5FC7]" />
            </div>
            <div className="mt-2 text-xl font-bold text-[#2B5FC7] dark:text-[#60A5FA] font-mono">
              Rp {totalCurrentValuationIDR.toLocaleString("id-ID")}
            </div>
            <div className="mt-2 text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
              Setara nilai dasar: <strong className="font-mono text-[#1B2436] dark:text-[#E8ECF3]">${totalStockUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</strong>
            </div>
          </div>

          {/* Card 3: Kurs Prediksi Restock */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between text-[#6B7684] dark:text-[#8A94A6] text-xs">
              <span className="font-medium">Target Kurs Prediksi Restock</span>
              <IconSliders size={14} className="text-[#D97706]" />
            </div>
            <div className="mt-2 text-2xl font-bold text-[#92400E] dark:text-[#FBBF24] font-mono">
              Rp {predictedRate.toLocaleString("id-ID")}
            </div>
            <div className="mt-2 text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
              Selisih kurs:{" "}
              <strong className={predictedRate >= currentRate ? "text-[#991B1B] dark:text-[#F87171]" : "text-[#059669]"}>
                {predictedRate >= currentRate ? "+" : ""}
                Rp {(predictedRate - currentRate).toLocaleString("id-ID")} / USD
              </strong>
            </div>
          </div>

          {/* Card 4: Prediksi Anggaran Restock Batch Berikutnya */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between text-[#6B7684] dark:text-[#8A94A6] text-xs">
              <span className="font-medium">Prediksi Biaya Restock Impor</span>
              <IconPackage size={14} className="text-[#059669]" />
            </div>
            <div className="mt-2 text-xl font-bold text-[#1B2436] dark:text-[#E8ECF3] font-mono">
              Rp {totalRestockCostPredictedIDR.toLocaleString("id-ID")}
            </div>
            <div className="mt-2 text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
              Selisih vs kurs sekarang:{" "}
              <strong className={totalRestockCostPredictedIDR >= totalRestockCostCurrentIDR ? "text-[#991B1B] dark:text-[#F87171]" : "text-[#059669]"}>
                {totalRestockCostPredictedIDR >= totalRestockCostCurrentIDR ? "+" : ""}
                Rp {(totalRestockCostPredictedIDR - totalRestockCostCurrentIDR).toLocaleString("id-ID")}
              </strong>
            </div>
          </div>
        </div>

        {/* Panel Utama: Kalkulator Konversi & Prediksi Harga Beli Stok Barang Impor */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kiri: Kontrol Kurs Prediksi & Pilih Barang Stok Impor */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <IconSliders size={17} className="text-[#2B5FC7] dark:text-[#3B6FE0]" />
              <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                Simulator Konversi & Prediksi Stok
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1.5">
                Pilih Barang Stok Impor di Gudang
              </label>
              <select
                value={selectedItemForCalc}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedItemForCalc(id);
                  const found = IMPORTED_STOCK_ITEMS.find((i) => i.id === id);
                  if (found) setRestockSimQty(found.reorderTargetQty);
                }}
                className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-xs font-medium text-[#1B2436] dark:text-[#E8ECF3]"
              >
                {IMPORTED_STOCK_ITEMS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.sku} · {item.name} (${item.purchasePriceUSD}/{item.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                  Atur Kurs Prediksi (USD / IDR):
                </span>
                <span className="font-mono font-bold text-[#2B5FC7] dark:text-[#60A5FA]">
                  Rp {predictedRate.toLocaleString("id-ID")}
                </span>
              </div>
              <input
                type="range"
                min={14800}
                max={17500}
                step={25}
                value={predictedRate}
                onChange={(e) => setPredictedRate(Number(e.target.value))}
                className="w-full accent-[#2B5FC7] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#6B7684] dark:text-[#8A94A6] mt-1">
                <span> Optimis: Rp 14.800</span>
                <span>Spot: Rp {currentRate.toLocaleString("id-ID")}</span>
                <span>Pesimis: Rp 17.500</span>
              </div>
            </div>

            {/* Quick Scenario Buttons */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {[
                { label: "Kurs Turun (-2%)", val: Math.round(currentRate * 0.98) },
                { label: "Kurs Spot Riil", val: currentRate },
                { label: "Kurs Naik (+3%)", val: Math.round(currentRate * 1.03) },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setPredictedRate(preset.val)}
                  className="py-1.5 px-2 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA] dark:bg-[#0F1B2D] hover:border-[#2B5FC7] text-[10px] font-semibold text-[#1B2436] dark:text-[#E8ECF3] transition-colors"
                >
                  <div>{preset.label}</div>
                  <div className="font-mono text-[#2B5FC7] dark:text-[#60A5FA]">
                    Rp {preset.val.toLocaleString("id-ID")}
                  </div>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] mb-1">
                Rencana Kuantitas Restock ({activeCalcItem.unit})
              </label>
              <input
                type="number"
                min={1}
                value={restockSimQty}
                onChange={(e) => setRestockSimQty(Math.max(1, Number(e.target.value)))}
                className="w-full h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-xs font-mono text-[#1B2436] dark:text-[#E8ECF3]"
              />
            </div>
          </div>

          {/* Kanan: Hasil Konversi Harga Satuan & Prediksi Pembelian Stok */}
          <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#EFF4FE] text-[#2B5FC7] dark:bg-[#1D4ED8]/25 dark:text-[#93C5FD]">
                  {activeCalcItem.sku} · Impor dari {activeCalcItem.originCountry}
                </span>
                <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3] mt-1">
                  {activeCalcItem.name}
                </h3>
              </div>
              <div className="text-right text-xs">
                <div className="text-[#6B7684] dark:text-[#8A94A6]">Stok Fisik Saat Ini ({activeCalcItem.warehouseLocation}):</div>
                <div className="font-bold text-sm text-[#1B2436] dark:text-[#E8ECF3]">
                  {activeCalcItem.currentStockQty} {activeCalcItem.unit} (@ ${activeCalcItem.purchasePriceUSD.toFixed(2)} USD)
                </div>
              </div>
            </div>

            {/* 3 Kolom Perbandingan Harga Per Unit: Batch Lalu vs Konversi Hari Ini vs Prediksi Restock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-3.5 rounded-xl bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]">
                <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                  1. Harga Beli Stok Batch Lalu
                </div>
                <div className="text-base font-bold font-mono text-[#1B2436] dark:text-[#E8ECF3] mt-1">
                  Rp {unitPriceHistoricalIDR.toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                  Kurs PO lama: Rp {activeCalcItem.lastPurchaseRateIDR.toLocaleString("id-ID")} / {activeCalcItem.unit}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EFF4FE] dark:bg-[#1D4ED8]/20 border border-[#D6E3FC] dark:border-[#2563EB]/40">
                <div className="text-[11px] font-semibold text-[#2B5FC7] dark:text-[#60A5FA]">
                  2. Konversi Harga Hari Ini (Spot)
                </div>
                <div className="text-base font-bold font-mono text-[#2B5FC7] dark:text-[#60A5FA] mt-1">
                  Rp {unitPriceCurrentIDR.toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                  Kurs hari ini: Rp {currentRate.toLocaleString("id-ID")} / {activeCalcItem.unit}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FFFBEB] dark:bg-[#78350F]/25 border border-[#FDE68A] dark:border-[#92400E]/40">
                <div className="text-[11px] font-semibold text-[#92400E] dark:text-[#FBBF24]">
                  3. Prediksi Harga Beli Berikutnya
                </div>
                <div className="text-base font-bold font-mono text-[#92400E] dark:text-[#FBBF24] mt-1">
                  Rp {unitPricePredictedIDR.toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                  Pada kurs prediksi: Rp {predictedRate.toLocaleString("id-ID")} / {activeCalcItem.unit}
                </div>
              </div>
            </div>

            {/* Rincian Valuasi Stok & Prediksi PO Restock */}
            <div className="p-4 rounded-xl bg-[#F4F6FA]/70 dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6B7684] dark:text-[#8A94A6]">
                  Nilai Stok Tersimpan di Gudang ({activeCalcItem.currentStockQty} {activeCalcItem.unit}) pada Kurs Hari Ini:
                </span>
                <span className="font-mono font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                  Rp {(activeCalcItem.currentStockQty * unitPriceCurrentIDR).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7684] dark:text-[#8A94A6]">
                  Estimasi Belanja Restock ({restockSimQty} {activeCalcItem.unit}) dengan Kurs Hari Ini:
                </span>
                <span className="font-mono font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                  Rp {(restockSimQty * unitPriceCurrentIDR).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#E2E6ED] dark:border-[#26334D]">
                <span className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                  Prediksi Belanja Restock ({restockSimQty} {activeCalcItem.unit}) pada Kurs Rp {predictedRate.toLocaleString("id-ID")}:
                </span>
                <span className="font-mono font-bold text-sm text-[#2B5FC7] dark:text-[#60A5FA]">
                  Rp {(restockSimQty * unitPricePredictedIDR).toLocaleString("id-ID")} (
                  {unitPricePredictedIDR - unitPriceCurrentIDR >= 0 ? "+" : ""}
                  Rp {((unitPricePredictedIDR - unitPriceCurrentIDR) * restockSimQty).toLocaleString("id-ID")})
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#EFF4FE] dark:bg-[#1D4ED8]/20 border border-[#D6E3FC] dark:border-[#2563EB]/40 text-[11px] text-[#1B2436] dark:text-[#E8ECF3] flex items-center gap-2">
              <IconAlertCircle size={15} className="text-[#2B5FC7] shrink-0" />
              <span>
                <strong>Rekomendasi Harga Dasar HPP BOM:</strong> Gunakan harga konversi prediksi{" "}
                <strong className="font-mono text-[#2B5FC7] dark:text-[#60A5FA]">
                  Rp {unitPricePredictedIDR.toLocaleString("id-ID")} / {activeCalcItem.unit}
                </strong>{" "}
                sebagai acuan HPP pengganti (replacement cost) agar margin cetak aman saat restock berikutnya.
              </span>
            </div>
          </div>
        </section>

        {/* Tabel Daftar Seluruh Stok Barang Gudang yang Dibeli dari Luar (Impor) */}
        <section className="rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E2E6ED] dark:border-[#26334D] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                Daftar Stok Barang Gudang Asal Pembelian Luar Negeri / Impor ({filteredStock.length} Item)
              </h3>
              <p className="text-xs text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                Tabel konversi otomatis harga beli USD ke Rupiah (IDR), valuasi stok fisik gudang, dan prediksi harga restock.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7684]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari barang stok impor, negara, SKU..."
                  className="h-9 pl-8 pr-3 text-xs rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 px-3 text-xs rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] font-medium"
              >
                <option value="Semua">Semua Kategori Impor</option>
                <option value="Kertas Impor">Kertas Impor</option>
                <option value="Tinta & Kimia Impor">Tinta & Kimia Impor</option>
                <option value="Foil & Finishing Impor">Foil & Finishing Impor</option>
                <option value="Sparepart Mesin Impor">Sparepart Mesin Impor</option>
              </select>

              <button
                type="button"
                onClick={() => window.print()}
                className="h-9 px-3 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] hover:bg-[#F4F6FA] dark:hover:bg-[#1B2A44] flex items-center gap-1.5"
              >
                <IconDownload size={13} />
                <span>Cetak Valuasi</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA] dark:bg-[#1B2A44] text-[11px] font-semibold text-[#6B7684] dark:text-[#8A94A6]">
                  <th className="py-3 px-4">SKU & Nama Stok Barang Impor</th>
                  <th className="py-3 px-4">Asal & Supplier</th>
                  <th className="py-3 px-4 text-center">Stok Gudang</th>
                  <th className="py-3 px-4 text-right">Harga Beli (USD)</th>
                  <th className="py-3 px-4 text-right">Konversi Hari Ini (IDR)</th>
                  <th className="py-3 px-4 text-right">Total Nilai Stok (IDR)</th>
                  <th className="py-3 px-4 text-right">Prediksi Harga Unit (@Rp {predictedRate.toLocaleString("id-ID")})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D]">
                {filteredStock.map((item) => {
                  const convToday = Math.round(item.purchasePriceUSD * currentRate);
                  const totalStockVal = convToday * item.currentStockQty;
                  const predUnit = Math.round(item.purchasePriceUSD * predictedRate);
                  const diffUnit = predUnit - convToday;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => {
                        setSelectedItemForCalc(item.id);
                        setRestockSimQty(item.reorderTargetQty);
                      }}
                      className={`cursor-pointer transition-colors hover:bg-[#F4F6FA]/70 dark:hover:bg-[#1B2A44]/50 ${
                        selectedItemForCalc === item.id ? "bg-[#EFF4FE]/60 dark:bg-[#1D4ED8]/15" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{item.name}</div>
                        <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] font-mono">
                          {item.sku} · <span className="font-sans">{item.category}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#1B2436] dark:text-[#E8ECF3]">{item.originCountry}</div>
                        <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">{item.supplier}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                          {item.currentStockQty} {item.unit}
                        </div>
                        <div className="text-[10px] text-[#6B7684] dark:text-[#8A94A6]">{item.warehouseLocation}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#2B5FC7] dark:text-[#60A5FA]">
                        ${item.purchasePriceUSD.toFixed(2)}
                        <div className="text-[10px] font-normal text-[#6B7684]">per {item.unit}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                        Rp {convToday.toLocaleString("id-ID")}
                        <div className="text-[10px] font-normal text-[#6B7684]">
                          PO Lalu: Rp {Math.round(item.purchasePriceUSD * item.lastPurchaseRateIDR).toLocaleString("id-ID")}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#059669] dark:text-[#34D399]">
                        Rp {totalStockVal.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span className={diffUnit >= 0 ? "text-[#991B1B] dark:text-[#F87171]" : "text-[#059669] dark:text-[#34D399]"}>
                          Rp {predUnit.toLocaleString("id-ID")}
                        </span>
                        <div className="text-[10px] text-[#6B7684] dark:text-[#8A94A6]">
                          ({diffUnit >= 0 ? "+" : ""}Rp {diffUnit.toLocaleString("id-ID")} / {item.unit})
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
