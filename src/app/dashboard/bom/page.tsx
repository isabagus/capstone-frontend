"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  IconBom,
  IconOrders,
  IconPackage,
  IconGear,
  IconCheck,
  IconRefresh,
  IconPlus,
  IconSpk,
  IconX,
  IconWarehouse,
  IconTag,
  IconLayers,
} from "@/components/icons/Icons";

interface OrderForBom {
  id: string;
  orderNumber: string;
  customerName: string;
  brand: string;
  productName: string;
  orderQuantity: number; // pcs
  paperType: string;
  paperGsm: number;
  planoLengthCm: number;
  planoWidthCm: number;
  cutLengthCm: number;
  cutWidthCm: number;
  wastePercent: number;
  insheetQuantity: number; // lembar cadangan cetak
  status: "Belum Dihitung" | "BOM Selesai" | "SPK Terbit";
}

const SAMPLE_ORDERS_QUEUE: OrderForBom[] = [
  {
    id: "1",
    orderNumber: "ORD-2026-0901",
    customerName: "PT Artha Boga Sejahtera",
    brand: "Packsolution.id",
    productName: "Hardbox Rigid Premium Magnetic Gold",
    orderQuantity: 2500,
    paperType: "Kertas Ivory 300 GSM",
    paperGsm: 300,
    planoLengthCm: 79,
    planoWidthCm: 109,
    cutLengthCm: 38,
    cutWidthCm: 26,
    wastePercent: 5,
    insheetQuantity: 150,
    status: "Belum Dihitung",
  },
  {
    id: "2",
    orderNumber: "ORD-2026-0904",
    customerName: "Studio Foto Memoirs",
    brand: "memoirs.print",
    productName: "Photobook Hardcover Linen Series",
    orderQuantity: 350,
    paperType: "Art Paper 150 GSM",
    paperGsm: 150,
    planoLengthCm: 65,
    planoWidthCm: 100,
    cutLengthCm: 32,
    cutWidthCm: 22,
    wastePercent: 4,
    insheetQuantity: 50,
    status: "Belum Dihitung",
  },
  {
    id: "3",
    orderNumber: "ORD-2026-0902",
    customerName: "Estella Glow Skincare",
    brand: "Estella",
    productName: "Softbox Skincare Serum Matte Doff",
    orderQuantity: 5000,
    paperType: "Kraft Liner Brown 275 GSM",
    paperGsm: 275,
    planoLengthCm: 90,
    planoWidthCm: 120,
    cutLengthCm: 22,
    cutWidthCm: 14,
    wastePercent: 6,
    insheetQuantity: 250,
    status: "BOM Selesai",
  },
];

export default function BomCalculatorPage() {
  const { user } = useAuth();
  const [ordersQueue, setOrdersQueue] = useState<OrderForBom[]>(SAMPLE_ORDERS_QUEUE);
  const [selectedOrder, setSelectedOrder] = useState<OrderForBom>(SAMPLE_ORDERS_QUEUE[0]);

  // Interactive Calculator State
  const [planoLength, setPlanoLength] = useState<number>(selectedOrder.planoLengthCm);
  const [planoWidth, setPlanoWidth] = useState<number>(selectedOrder.planoWidthCm);
  const [cutLength, setCutLength] = useState<number>(selectedOrder.cutLengthCm);
  const [cutWidth, setCutWidth] = useState<number>(selectedOrder.cutWidthCm);
  const [targetQuantity, setTargetQuantity] = useState<number>(selectedOrder.orderQuantity);
  const [gsm, setGsm] = useState<number>(selectedOrder.paperGsm);
  const [wastePercent, setWastePercent] = useState<number>(selectedOrder.wastePercent);
  const [insheetQty, setInsheetQty] = useState<number>(selectedOrder.insheetQuantity);

  // Additional Materials
  const [inkEstimateKg, setInkEstimateKg] = useState<number>(2.5);
  const [glueEstimateKg, setGlueEstimateKg] = useState<number>(4.0);
  const [foilLengthM, setFoilLengthM] = useState<number>(120);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Calculation Logic (BOM Conversion Engine)
  const calculation = useMemo(() => {
    // 1. Hitung muat potong per lembar plano
    // Opsi A: searah (Panjang bagi Panjang, Lebar bagi Lebar)
    const cutsA = Math.floor(planoLength / cutLength) * Math.floor(planoWidth / cutWidth);
    // Opsi B: silang (Panjang bagi Lebar, Lebar bagi Panjang)
    const cutsB = Math.floor(planoLength / cutWidth) * Math.floor(planoWidth / cutLength);
    const cutsPerPlano = Math.max(cutsA, cutsB, 1);
    const orientation = cutsA >= cutsB ? "Searah (Standar)" : "Silang (Efisiensi Tinggi)";

    // 2. Total lembar bersih yang dibutuhkan
    const netSheets = Math.ceil(targetQuantity / cutsPerPlano);

    // 3. Cadangan mesin & waste
    const wasteSheets = Math.ceil(netSheets * (wastePercent / 100));
    const totalPlanoSheets = netSheets + wasteSheets + insheetQty;

    // 4. Konversi ke Rim (1 rim = 500 lembar plano)
    const totalRims = (totalPlanoSheets / 500).toFixed(2);

    // 5. Konversi berat ke Kg (rumus gramatur percetakan standar)
    // Berat (kg) = (P_meter * L_meter * GSM * totalLembar) / 1000
    const pMeter = planoLength / 100;
    const lMeter = planoWidth / 100;
    const totalWeightKg = ((pMeter * lMeter * gsm * totalPlanoSheets) / 1000).toFixed(1);

    // 6. Efisiensi luas bahan plano terpakai
    const usedArea = cutsPerPlano * (cutLength * cutWidth);
    const totalArea = planoLength * planoWidth;
    const efficiencyRate = Math.min(Math.round((usedArea / totalArea) * 100), 100);

    return {
      cutsPerPlano,
      orientation,
      netSheets,
      wasteSheets,
      totalPlanoSheets,
      totalRims,
      totalWeightKg,
      efficiencyRate,
    };
  }, [planoLength, planoWidth, cutLength, cutWidth, targetQuantity, gsm, wastePercent, insheetQty]);

  const selectOrderToCalculate = (o: OrderForBom) => {
    setSelectedOrder(o);
    setPlanoLength(o.planoLengthCm);
    setPlanoWidth(o.planoWidthCm);
    setCutLength(o.cutLengthCm);
    setCutWidth(o.cutWidthCm);
    setTargetQuantity(o.orderQuantity);
    setGsm(o.paperGsm);
    setWastePercent(o.wastePercent);
    setInsheetQty(o.insheetQuantity);
  };

  return (
    <DashboardLayout title="BOM & Conversion Engine">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toast */}
        {toastMessage && (
          <div className="p-3 rounded-lg bg-[#EFF4FE] dark:bg-[#1D4ED8]/25 border border-[#D6E3FC] dark:border-[#2563EB]/40 text-[#2B5FC7] dark:text-[#93C5FD] text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <IconCheck size={16} strokeWidth={2} />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-current opacity-70 hover:opacity-100">
              <IconX size={14} />
            </button>
          </div>
        )}

        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2E6ED] dark:border-[#26334D]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#2B5FC7] dark:bg-[#3B6FE0]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B5FC7] dark:text-[#3B6FE0]">
                MOD-03 · Bill of Materials Engine Tim Design
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight">
              Kalkulator Konversi Bahan Cetak & BOM
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
              Hitung otomatis konversi plano ke lembar potong, rim, kilogram (GSM), waste %, dan toleransi insheet &lt; 1 detik.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setOrdersQueue(
                  ordersQueue.map((o) =>
                    o.id === selectedOrder.id ? { ...o, status: "BOM Selesai" } : o
                  )
                );
                triggerToast(`Formula BOM untuk ${selectedOrder.orderNumber} berhasil disimpan dan siap diterbitkan ke SPK!`);
              }}
              className="px-3.5 py-2 rounded-lg text-xs font-medium bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] dark:hover:bg-[#2B5FC7] text-white shadow-sm transition-colors flex items-center gap-1.5"
            >
              <IconCheck size={14} strokeWidth={2.5} />
              <span>Simpan Rumus BOM</span>
            </button>
          </div>
        </div>

        {/* 4 Cards Summary of Calculation */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Muat Potong */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Muat Potong Plano</span>
              <span className="p-1.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#2B5FC7] dark:text-[#3B6FE0]">
                <IconLayers size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mb-1 tracking-tight">
              {calculation.cutsPerPlano} pcs / plano
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] flex items-center justify-between pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
              <span>Orientasi: {calculation.orientation}</span>
              <span className="text-[#065F46] dark:text-[#34D399] font-medium">{calculation.efficiencyRate}% Efisien</span>
            </div>
          </div>

          {/* Card 2: Kebutuhan Rim */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Total Kebutuhan Kertas</span>
              <span className="p-1.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#2B5FC7] dark:text-[#3B6FE0]">
                <IconPackage size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#2B5FC7] dark:text-[#3B6FE0] mb-1 tracking-tight">
              {calculation.totalRims} Rim
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] flex items-center justify-between pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
              <span>Total: {calculation.totalPlanoSheets.toLocaleString("id-ID")} Plano</span>
              <span>1 Rim = 500 Lbr</span>
            </div>
          </div>

          {/* Card 3: Berat Kertas Kg */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Estimasi Berat Bahan</span>
              <span className="p-1.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#2B5FC7] dark:text-[#3B6FE0]">
                <IconGear size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mb-1 tracking-tight">
              {calculation.totalWeightKg} Kg
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] flex items-center justify-between pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
              <span>Gramatur: {gsm} GSM</span>
              <span className="text-[#6B7684] dark:text-[#8A94A6]">Logistik Muat</span>
            </div>
          </div>

          {/* Card 4: Waste & Insheet */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Cadangan & Waste Potong</span>
              <span className="p-1.5 rounded-lg bg-[#FFFBEB] dark:bg-[#78350F]/20 border border-[#FDE68A] dark:border-[#92400E]/40 text-[#92400E] dark:text-[#FBBF24]">
                <IconRefresh size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#92400E] dark:text-[#FBBF24] mb-1 tracking-tight">
              +{calculation.wasteSheets + insheetQty} Lbr
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] flex items-center justify-between pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
              <span>Waste {wastePercent}% ({calculation.wasteSheets} lbr)</span>
              <span>Insheet: {insheetQty} lbr</span>
            </div>
          </div>
        </section>

        {/* Main Grid: Orders Queue (Left) & Interactive BOM Engine (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Queued Orders for BOM (5 cols) */}
          <div className="lg:col-span-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E6ED] dark:border-[#26334D]">
              <div className="text-xs font-bold text-[#1B2436] dark:text-[#E8ECF3] uppercase tracking-wider flex items-center gap-1.5">
                <IconOrders size={14} />
                <span>Antrean Desain ({ordersQueue.length})</span>
              </div>
              <span className="text-[10px] text-[#2B5FC7] dark:text-[#3B6FE0] font-semibold">Pilih Pesanan</span>
            </div>

            <div className="space-y-2">
              {ordersQueue.map((item) => {
                const isSelected = item.id === selectedOrder.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => selectOrderToCalculate(item)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "bg-[#EFF4FE] dark:bg-[#1D4ED8]/25 border-[#2B5FC7] dark:border-[#3B6FE0] shadow-sm"
                        : "bg-[#F4F6FA] dark:bg-[#0F1B2D] border-[#E2E6ED] dark:border-[#26334D] hover:border-[#2B5FC7]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-[#2B5FC7] dark:text-[#3B6FE0]">
                        {item.orderNumber}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                          item.status === "BOM Selesai"
                            ? "bg-[#ECFDF5] text-[#065F46] dark:bg-[#064E3B] dark:text-[#34D399]"
                            : "bg-[#FFFBEB] text-[#92400E] dark:bg-[#78350F] dark:text-[#FBBF24]"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="font-semibold text-xs text-[#1B2436] dark:text-[#E8ECF3] truncate">
                      {item.customerName}
                    </div>
                    <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] truncate mt-0.5">
                      {item.productName}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 text-[10px] text-[#6B7684] dark:text-[#8A94A6]">
                      <span>{item.brand}</span>
                      <span className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                        {item.orderQuantity.toLocaleString("id-ID")} pcs
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Calculator Inputs & Visual Sheet Cut (7 cols) */}
          <div className="lg:col-span-8 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
              <div>
                <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                  Parameter Teknis BOM: {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
                  {selectedOrder.customerName} · {selectedOrder.productName}
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#EFF4FE] text-[#2B5FC7] border border-[#D6E3FC] dark:bg-[#1D4ED8]/25 dark:text-[#60A5FA]">
                Target: {targetQuantity.toLocaleString("id-ID")} pcs
              </span>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Plano Size */}
              <div className="space-y-1.5 p-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]">
                <label className="font-bold text-[#1B2436] dark:text-[#E8ECF3] block">
                  1. Ukuran Kertas Plano (cm)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#6B7684] dark:text-[#8A94A6]">Panjang (cm)</span>
                    <input
                      type="number"
                      value={planoLength}
                      onChange={(e) => setPlanoLength(Number(e.target.value))}
                      className="w-full h-8 px-2 rounded border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6B7684] dark:text-[#8A94A6]">Lebar (cm)</span>
                    <input
                      type="number"
                      value={planoWidth}
                      onChange={(e) => setPlanoWidth(Number(e.target.value))}
                      className="w-full h-8 px-2 rounded border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Cutting Size */}
              <div className="space-y-1.5 p-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]">
                <label className="font-bold text-[#1B2436] dark:text-[#E8ECF3] block">
                  2. Ukuran Potong Jadi / Bentangan (cm)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#6B7684] dark:text-[#8A94A6]">Panjang (cm)</span>
                    <input
                      type="number"
                      value={cutLength}
                      onChange={(e) => setCutLength(Number(e.target.value))}
                      className="w-full h-8 px-2 rounded border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6B7684] dark:text-[#8A94A6]">Lebar (cm)</span>
                    <input
                      type="number"
                      value={cutWidth}
                      onChange={(e) => setCutWidth(Number(e.target.value))}
                      className="w-full h-8 px-2 rounded border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Gramatur & Target */}
              <div className="space-y-1.5 p-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]">
                <label className="font-bold text-[#1B2436] dark:text-[#E8ECF3] block">
                  3. Gramatur Kertas (GSM) & Kuantitas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#6B7684] dark:text-[#8A94A6]">Gramatur (GSM)</span>
                    <input
                      type="number"
                      value={gsm}
                      onChange={(e) => setGsm(Number(e.target.value))}
                      className="w-full h-8 px-2 rounded border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6B7684] dark:text-[#8A94A6]">Jumlah Target (pcs)</span>
                    <input
                      type="number"
                      value={targetQuantity}
                      onChange={(e) => setTargetQuantity(Number(e.target.value))}
                      className="w-full h-8 px-2 rounded border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Waste & Insheet */}
              <div className="space-y-1.5 p-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]">
                <label className="font-bold text-[#1B2436] dark:text-[#E8ECF3] block">
                  4. Toleransi Cadangan Mesin & Insheet
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#6B7684] dark:text-[#8A94A6]">Waste Potong (%)</span>
                    <input
                      type="number"
                      value={wastePercent}
                      onChange={(e) => setWastePercent(Number(e.target.value))}
                      className="w-full h-8 px-2 rounded border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6B7684] dark:text-[#8A94A6]">Insheet Mesin (Lembar)</span>
                    <input
                      type="number"
                      value={insheetQty}
                      onChange={(e) => setInsheetQty(Number(e.target.value))}
                      className="w-full h-8 px-2 rounded border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Visualizer Sheet Plano Cut */}
            <div className="p-4 rounded-xl border border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA]/50 dark:bg-[#0F1B2D]/50 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1B2436] dark:text-[#E8ECF3] flex items-center gap-1.5">
                  <IconLayers size={14} />
                  <span>Visualisasi Pola Potong Plano ({planoLength} × {planoWidth} cm)</span>
                </span>
                <span className="text-[#2B5FC7] dark:text-[#3B6FE0] font-semibold">
                  {calculation.cutsPerPlano} Pola Potongan
                </span>
              </div>

              {/* Simulated Sheet Visual Layout */}
              <div className="w-full h-32 p-2 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] flex items-center justify-center overflow-hidden">
                <div className="w-full h-full border border-dashed border-[#2B5FC7]/40 dark:border-[#3B6FE0]/40 rounded grid grid-cols-3 sm:grid-cols-6 gap-1 p-1">
                  {Array.from({ length: Math.min(calculation.cutsPerPlano, 12) }).map((_, idx) => (
                    <div
                      key={idx}
                      className="bg-[#EFF4FE] dark:bg-[#1D4ED8]/25 border border-[#2B5FC7]/40 dark:border-[#3B6FE0]/40 rounded text-[9px] font-mono text-[#2B5FC7] dark:text-[#93C5FD] flex items-center justify-center"
                    >
                      #{idx + 1}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[10px] text-[#6B7684] dark:text-[#8A94A6] text-center">
                Skema potongan efisien meminimalkan scrap pinggiran ({calculation.efficiencyRate}% bahan plano terpakai)
              </div>
            </div>

            {/* Supporting Consumables Calculation */}
            <div className="space-y-2 pt-2 border-t border-[#E2E6ED] dark:border-[#26334D]">
              <div className="text-xs font-bold text-[#1B2436] dark:text-[#E8ECF3] uppercase tracking-wider">
                Estimasi Bahan Pendukung & Consumables (Tinta, Lem, Foil):
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]">
                  <span className="text-[10px] text-[#6B7684] dark:text-[#8A94A6] block">Tinta Offset (Kg)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={inkEstimateKg}
                    onChange={(e) => setInkEstimateKg(Number(e.target.value))}
                    className="w-full h-7 px-1.5 mt-1 rounded border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] font-mono text-xs"
                  />
                </div>
                <div className="p-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]">
                  <span className="text-[10px] text-[#6B7684] dark:text-[#8A94A6] block">Lem Hotmelt (Kg)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={glueEstimateKg}
                    onChange={(e) => setGlueEstimateKg(Number(e.target.value))}
                    className="w-full h-7 px-1.5 mt-1 rounded border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] font-mono text-xs"
                  />
                </div>
                <div className="p-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]">
                  <span className="text-[10px] text-[#6B7684] dark:text-[#8A94A6] block">Foil Stamping (Meter)</span>
                  <input
                    type="number"
                    value={foilLengthM}
                    onChange={(e) => setFoilLengthM(Number(e.target.value))}
                    className="w-full h-7 px-1.5 mt-1 rounded border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E6ED] dark:border-[#26334D]">
              <button
                type="button"
                onClick={() => {
                  triggerToast(`Draft SPK untuk ${selectedOrder.orderNumber} berhasil diteruskan ke antrean Penerbitan SPK Digital (MOD-04)!`);
                }}
                className="px-4 py-2 rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] text-white text-xs font-medium shadow-sm flex items-center gap-1.5"
              >
                <IconSpk size={14} />
                <span>Teruskan ke SPK Digital (MOD-04)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
