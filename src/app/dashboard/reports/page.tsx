"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useBrands } from "@/hooks/useInventoryData";
import {
  IconReport,
  IconDownload,
  IconPackage,
  IconProduction,
  IconDollar,
  IconTrendingUp,
  IconTrendingDown,
  IconCheckCircle,
  IconWarehouse,
  IconOrders,
} from "@/components/icons/Icons";

type ReportTabKey =
  | "cashflow_profit"
  | "sales_recap"
  | "warehouse_recap"
  | "material"
  | "production";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportTabKey>("cashflow_profit");
  const [dateRange, setDateRange] = useState<"7D" | "30D" | "THIS_MONTH" | "THIS_QUARTER">("THIS_MONTH");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("Semua");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("Semua");

  const dynamicBrands = useBrands();
  const brandOptions = ["Semua", ...dynamicBrands];

  // =====================================================================
  // 1. DATA REKAP LAPORAN PENJUALAN (PEMASUKAN BULANAN: JASA CETAK & PRODUK JADI)
  // =====================================================================
  const salesReport = [
    {
      invoiceNo: "INV-2026-0901",
      orderId: "ORD-2026-0901",
      date: "24 Sep 2026",
      client: "PT Artha Boga Sejahtera",
      customerType: "Repeat",
      brand: "Packsolution.id",
      serviceType: "Jasa Cetak Custom",
      product: "Hardbox Rigid Premium Magnetic Gold (2.500 pcs)",
      qty: 2500,
      revenue: 42500000,
      cogsMaterial: 21400000,
      cogsVendorMaklon: 3800000,
      netProfit: 17300000,
      paymentStatus: "Lunas",
    },
    {
      invoiceNo: "INV-2026-0902",
      orderId: "ORD-2026-0902",
      date: "22 Sep 2026",
      client: "Estella Glow Skincare",
      customerType: "Repeat",
      brand: "Estella",
      serviceType: "Jasa Cetak Custom",
      product: "Softbox Skincare Serum Matte Doff (5.000 pcs)",
      qty: 5000,
      revenue: 28500000,
      cogsMaterial: 14200000,
      cogsVendorMaklon: 2100000,
      netProfit: 12200000,
      paymentStatus: "Lunas",
    },
    {
      invoiceNo: "INV-2026-0903",
      orderId: "ORD-2026-0903",
      date: "19 Sep 2026",
      client: "Kopi Kenangan Senja",
      customerType: "Repeat",
      brand: "Packsolution.id",
      serviceType: "Beli Produk Jadi",
      product: "[READY STOCK] Lunch Box Eco-Kraft Laminated M (10.000 pcs)",
      qty: 10000,
      revenue: 19500000,
      cogsMaterial: 11800000,
      cogsVendorMaklon: 0,
      netProfit: 7700000,
      paymentStatus: "Lunas",
    },
    {
      invoiceNo: "INV-2026-0904",
      orderId: "ORD-2026-0904",
      date: "15 Sep 2026",
      client: "Pepipapier Stationery",
      customerType: "Repeat",
      brand: "Pepipapier",
      serviceType: "Jasa Cetak Custom",
      product: "Greeting Card & Custom Envelope Foil (1.200 pcs)",
      qty: 1200,
      revenue: 14800000,
      cogsMaterial: 6400000,
      cogsVendorMaklon: 2400000,
      netProfit: 6000000,
      paymentStatus: "Lunas",
    },
    {
      invoiceNo: "INV-2026-0905",
      orderId: "ORD-2026-0905",
      date: "11 Sep 2026",
      client: "Studio Foto Memoirs",
      customerType: "Baru",
      brand: "memoirs.print",
      serviceType: "Jasa Cetak Custom",
      product: "Photobook Hardcover Linen Series (350 pcs)",
      qty: 350,
      revenue: 22400000,
      cogsMaterial: 11200000,
      cogsVendorMaklon: 1500000,
      netProfit: 9700000,
      paymentStatus: "DP 50%",
    },
    {
      invoiceNo: "INV-2026-0906",
      orderId: "ORD-2026-0906",
      date: "06 Sep 2026",
      client: "UMKM Roti Bakar Bandung",
      customerType: "Baru",
      brand: "Packsolution.id",
      serviceType: "Beli Produk Jadi",
      product: "[READY STOCK] Dus Kemasan Roti Kraft Polos (4.000 pcs)",
      qty: 4000,
      revenue: 8800000,
      cogsMaterial: 5200000,
      cogsVendorMaklon: 0,
      netProfit: 3600000,
      paymentStatus: "Lunas",
    },
  ];

  // =====================================================================
  // 2. DATA PENGELUARAN BULANAN PABRIK (EXPENSES SEBULAN)
  // =====================================================================
  const monthlyExpenses = [
    {
      id: "EXP-0901",
      date: "03 Sep 2026",
      category: "Belanja Bahan Baku (Supplier)",
      partner: "PT Paper Impexindo (Impor)",
      description: "Restock Kertas Ivory 300 GSM Plano (45 Rim) & Art Carton 260 GSM (30 Rim)",
      amount: 46800000,
      status: "Terbayar",
    },
    {
      id: "EXP-0902",
      date: "08 Sep 2026",
      category: "Belanja Bahan Baku (Supplier)",
      partner: "PT Pindo Deli Pulp (Domestik)",
      description: "Pembelian Kertas Kraft Liner 275 GSM & Duplex 350 GSM (60 Rim)",
      amount: 23400000,
      status: "Terbayar",
    },
    {
      id: "EXP-0903",
      date: "14 Sep 2026",
      category: "Belanja Tinta & Foil (Supplier)",
      partner: "PT Toyo Ink & PT Kurz Foil Asia",
      description: "Pembelian Tinta Offset Process CMYK (24 Kg) & Foil Gold Metallic (10 Roll)",
      amount: 9800000,
      status: "Terbayar",
    },
    {
      id: "EXP-0904",
      date: "18 Sep 2026",
      category: "Biaya Subkontrak (Vendor Mitra Maklon)",
      partner: "Vendor Foil & Emboss Kurnia + Vendor Die-Cut Rigid",
      description: "Tagihan SPK Eksternal Hot Print Foil, Emboss, dan Pond Rigid Box Bulan September",
      amount: 9800000,
      status: "Terbayar",
    },
    {
      id: "EXP-0905",
      date: "21 Sep 2026",
      category: "Sparepart & Maintenance Mesin",
      partner: "Heidelberg Parts Asia",
      description: "Penggantian Rubber Blanket Heidelberg SM-74 & Asah Pisau Polar 92",
      amount: 4900000,
      status: "Terbayar",
    },
  ];

  // =====================================================================
  // 3. DATA REKAP LAPORAN GUDANG (STOK AWAL, MASUK, KELUAR, OPNAME, STOK AKHIR)
  // =====================================================================
  const warehouseRecap = [
    {
      code: "MAT-IV-300",
      name: "Kertas Ivory Board 300 GSM Plano (79×109 cm)",
      category: "Bahan Baku",
      warehouse: "Gudang 1 (Pabrik)",
      unit: "Rim",
      initialStock: 25,
      stockIn: 45,
      stockOut: 28,
      transferNet: -2,
      opnameDiff: 0,
      finalStock: 40,
      rop: 30,
      valuationIDR: 29920000,
    },
    {
      code: "MAT-AC-260",
      name: "Art Carton 260 GSM High Gloss Plano",
      category: "Bahan Baku",
      warehouse: "Gudang 1 (Pabrik)",
      unit: "Rim",
      initialStock: 20,
      stockIn: 30,
      stockOut: 12,
      transferNet: 0,
      opnameDiff: 0,
      finalStock: 38,
      rop: 25,
      valuationIDR: 23560000,
    },
    {
      code: "MAT-KRF-275",
      name: "Kraft Liner Brown 275 GSM Plano",
      category: "Bahan Baku",
      warehouse: "Gudang 2 (Ruko)",
      unit: "Rim",
      initialStock: 30,
      stockIn: 20,
      stockOut: 33,
      transferNet: 0,
      opnameDiff: -1,
      finalStock: 16,
      rop: 25,
      valuationIDR: 8320000,
    },
    {
      code: "FOIL-GLD-04",
      name: "Hot Stamping Foil Gold Metallic 120m (Kurz)",
      category: "Bahan Baku",
      warehouse: "Gudang 2 (Ruko)",
      unit: "Roll",
      initialStock: 22,
      stockIn: 15,
      stockOut: 9,
      transferNet: 0,
      opnameDiff: 0,
      finalStock: 28,
      rop: 15,
      valuationIDR: 8085000,
    },
    {
      code: "SPR-HD-BLK",
      name: "Rubber Blanket Compressible Heidelberg SM-74",
      category: "Sparepart Mesin",
      warehouse: "Gudang 1 (Pabrik)",
      unit: "Set",
      initialStock: 4,
      stockIn: 4,
      stockOut: 2,
      transferNet: 0,
      opnameDiff: 0,
      finalStock: 6,
      rop: 3,
      valuationIDR: 6480000,
    },
    {
      code: "PRD-LBX-KRF",
      name: "[Produk Jadi] Lunch Box Eco-Kraft Laminated (M)",
      category: "Produk Jadi",
      warehouse: "Gudang 2 (Ruko)",
      unit: "Pcs",
      initialStock: 8500,
      stockIn: 15000,
      stockOut: 10000,
      transferNet: +1500,
      opnameDiff: 0,
      finalStock: 15000,
      rop: 5000,
      valuationIDR: 17700000,
    },
    {
      code: "PRD-HBX-GLD",
      name: "[Produk Jadi] Hardbox Gift Magnetic Ready Stock",
      category: "Produk Jadi",
      warehouse: "Gudang 1 (Pabrik)",
      unit: "Pcs",
      initialStock: 1200,
      stockIn: 2000,
      stockOut: 1400,
      transferNet: 0,
      opnameDiff: 0,
      finalStock: 1800,
      rop: 500,
      valuationIDR: 21600000,
    },
  ];

  // Mock data for Material Usage & Waste
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
      totalPlanoUsed: 14,
      totalRim: 0,
      cutSheetsProduced: 8500,
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

  const masterSummary = [
    { label: "Master Pelanggan (Klien)", count: "Database Repeat & Baru", desc: "Klien B2B, Skincare, F&B & UMKM", href: "/dashboard/master/customers" },
    { label: "Master Vendor Mitra Maklon", count: "4 Workshop Subkontrak", desc: "Offset Komori, Foil Kurnia, Die-Cut, UV", href: "/dashboard/master/vendors" },
    { label: "Master Supplier Bahan", count: "4 Supplier Aktif", desc: "Kertas, Tinta, Foil & Bahan Kimia", href: "/dashboard/master/suppliers" },
    { label: "Master Brand Kemasan", count: `${dynamicBrands.length || 5} Brand Aktif`, desc: dynamicBrands.join(", ") || "Packsolution, Estella, dll", href: "/dashboard/master/brands" },
    { label: "Master Lokasi Gudang", count: "2 Fasilitas Gudang", desc: "Gudang 1 (Pabrik) & Gudang 2 (Ruko)", href: "/dashboard/master/warehouses" },
    { label: "Master Satuan & Konversi", count: "6 Satuan & Rasio BOM", desc: "Plano, Rim, Lembar, Kg, Roll, Box", href: "/dashboard/master/units" },
    { label: "Katalog Bahan Baku", count: "Inventori Multi-Gudang", desc: "Pelacakan Batch/Lot & Status ROP", href: "/dashboard/inventory/materials" },
    { label: "Katalog Produk Jadi", count: "Barang Jadi & WIP", desc: "Stok transit siap kirim per Brand", href: "/dashboard/inventory/products" },
  ];

  // Kalkulasi Keuangan Sebulan (Pemasukan, Pengeluaran, Profit)
  const totalMonthlyIncome = salesReport.reduce((sum, s) => sum + s.revenue, 0);
  const totalMonthlyExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalMonthlyNetProfit = totalMonthlyIncome - totalMonthlyExpenses;
  const netProfitMarginPct = ((totalMonthlyNetProfit / totalMonthlyIncome) * 100).toFixed(1);

  const totalCustomServiceIncome = salesReport
    .filter((s) => s.serviceType === "Jasa Cetak Custom")
    .reduce((sum, s) => sum + s.revenue, 0);
  const totalReadyStockIncome = salesReport
    .filter((s) => s.serviceType === "Beli Produk Jadi")
    .reduce((sum, s) => sum + s.revenue, 0);

  const totalWarehouseValuation = warehouseRecap.reduce((sum, w) => sum + w.valuationIDR, 0);

  const filteredSales =
    selectedBrandFilter === "Semua"
      ? salesReport
      : salesReport.filter((s) => s.brand.toLowerCase() === selectedBrandFilter.toLowerCase());

  const filteredWarehouse =
    warehouseFilter === "Semua"
      ? warehouseRecap
      : warehouseRecap.filter((w) => w.warehouse === warehouseFilter);

  return (
    <DashboardLayout title="Laporan Keuangan, Penjualan & Gudang">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2E6ED] dark:border-[#26334D]">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#2B5FC7]/10 dark:bg-[#3B6FE0]/15 text-[#2B5FC7] dark:text-[#3B6FE0]">
                <IconReport size={20} />
              </span>
              Pusat Laporan Manajerial (Keuangan, Penjualan & Gudang)
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7684] dark:text-[#8A94A6] mt-1">
              Rekapitulasi Pemasukan Sebulan, Pengeluaran Sebulan, Profit Bersih, Rekap Penjualan Multi-Brand, dan Rekap Mutasi Gudang
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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
                  {rng === "THIS_MONTH" ? "Bulan Ini (Sep 2026)" : rng === "THIS_QUARTER" ? "Kuartal Ini" : rng}
                </button>
              ))}
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] dark:hover:bg-[#2B5FC7] text-white transition-colors shadow-sm"
            >
              <IconDownload size={14} />
              <span>Cetak / Ekspor Laporan (PDF)</span>
            </button>
          </div>
        </div>

        {/* 4 Kartu Utama Manajerial: Pemasukan Sebulan, Pengeluaran Sebulan, Profit Sebulan, Valuasi Gudang */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Pemasukan Sebulan */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between text-[#6B7684] dark:text-[#8A94A6] text-xs font-medium">
              <span>Pemasukan Sebulan (Omzet)</span>
              <span className="p-1.5 rounded-lg bg-[#EFF4FE] dark:bg-[#1D4ED8]/25 text-[#2B5FC7] dark:text-[#60A5FA]">
                <IconTrendingUp size={15} />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#2B5FC7] dark:text-[#60A5FA] mt-2">
              Rp {totalMonthlyIncome.toLocaleString("id-ID")}
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-1.5 pt-1.5 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60">
              Jasa Cetak: <strong>Rp {(totalCustomServiceIncome / 1000000).toFixed(1)} Jt</strong> · Produk Jadi: <strong>Rp {(totalReadyStockIncome / 1000000).toFixed(1)} Jt</strong>
            </div>
          </div>

          {/* Card 2: Total Pengeluaran Sebulan */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between text-[#6B7684] dark:text-[#8A94A6] text-xs font-medium">
              <span>Pengeluaran Sebulan (Biaya)</span>
              <span className="p-1.5 rounded-lg bg-[#FEF2F2] dark:bg-[#7F1D1D]/30 text-[#991B1B] dark:text-[#F87171]">
                <IconTrendingDown size={15} />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#991B1B] dark:text-[#F87171] mt-2">
              Rp {totalMonthlyExpenses.toLocaleString("id-ID")}
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-1.5 pt-1.5 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60">
              Bahan Baku Supplier, Vendor Maklon & Sparepart
            </div>
          </div>

          {/* Card 3: Profit Bersih Sebulan */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#A7F3D0] dark:border-[#065F46] shadow-sm">
            <div className="flex items-center justify-between text-[#065F46] dark:text-[#34D399] text-xs font-semibold">
              <span>Profit Bersih Sebulan (Laba)</span>
              <span className="p-1.5 rounded-lg bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#34D399]">
                <IconDollar size={15} />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#059669] dark:text-[#34D399] mt-2">
              +Rp {totalMonthlyNetProfit.toLocaleString("id-ID")}
            </div>
            <div className="text-[11px] text-[#065F46] dark:text-[#34D399] mt-1.5 pt-1.5 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 font-medium">
              Net Profit Margin: <strong>{netProfitMarginPct}%</strong> (+14.2% vs Bulan Lalu)
            </div>
          </div>

          {/* Card 4: Nilai Valuasi Stok Gudang */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between text-[#6B7684] dark:text-[#8A94A6] text-xs font-medium">
              <span>Total Valuasi Stok Gudang</span>
              <span className="p-1.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] text-[#2B5FC7] dark:text-[#60A5FA]">
                <IconWarehouse size={15} />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#1B2436] dark:text-[#E8ECF3] mt-2">
              Rp {totalWarehouseValuation.toLocaleString("id-ID")}
            </div>
            <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-1.5 pt-1.5 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60">
              Akumulasi Gudang 1 (Pabrik) & Gudang 2 (Ruko)
            </div>
          </div>
        </section>

        {/* Navigasi 5 Tab Laporan */}
        <div className="flex overflow-x-auto border-b border-[#E2E6ED] dark:border-[#26334D] gap-6 text-xs font-semibold">
          {[
            { key: "cashflow_profit", label: "1. Arus Kas Bulanan (Pemasukan, Pengeluaran & Profit)" },
            { key: "sales_recap", label: "2. Rekap Laporan Penjualan" },
            { key: "warehouse_recap", label: "3. Rekap Laporan Gudang & Stok" },
            { key: "material", label: "4. Efisiensi Bahan & Waste BOM" },
            { key: "production", label: "5. Utilisasi Mesin Produksi" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setReportType(tab.key as ReportTabKey)}
              className={`pb-3 whitespace-nowrap transition-colors relative ${
                reportType === tab.key
                  ? "text-[#2B5FC7] dark:text-[#60A5FA]"
                  : "text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3]"
              }`}
            >
              {tab.label}
              {reportType === tab.key && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2B5FC7] dark:bg-[#60A5FA] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* =====================================================================
            TAB 1: ARUS KAS BULANAN (PEMASUKAN SEBULAN, PENGELUARAN SEBULAN & PROFIT)
           ===================================================================== */}
        {reportType === "cashflow_profit" && (
          <div className="space-y-6">
            {/* Perbandingan Komposisi Pemasukan vs Pengeluaran */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] space-y-2.5 text-xs">
                <div className="font-bold text-[#1B2436] dark:text-[#E8ECF3] uppercase tracking-wider text-[11px]">
                  Rincian Sumber Pemasukan Sebulan
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E2E6ED]/60 dark:border-[#26334D]/60">
                  <span className="text-[#6B7684] dark:text-[#8A94A6]">🖨️ Jasa Cetak Custom (Make-to-Order)</span>
                  <span className="font-mono font-bold text-[#2B5FC7] dark:text-[#60A5FA]">
                    Rp {totalCustomServiceIncome.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E2E6ED]/60 dark:border-[#26334D]/60">
                  <span className="text-[#6B7684] dark:text-[#8A94A6]">📦 Penjualan Produk Jadi (Ready Stock)</span>
                  <span className="font-mono font-bold text-[#059669] dark:text-[#34D399]">
                    Rp {totalReadyStockIncome.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-sm text-[#1B2436] dark:text-[#E8ECF3]">
                  <span>Total Pemasukan:</span>
                  <span className="font-mono text-[#2B5FC7] dark:text-[#60A5FA]">
                    Rp {totalMonthlyIncome.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] space-y-2.5 text-xs">
                <div className="font-bold text-[#1B2436] dark:text-[#E8ECF3] uppercase tracking-wider text-[11px]">
                  Rincian Pos Pengeluaran Sebulan
                </div>
                <div className="flex justify-between py-1 border-b border-[#E2E6ED]/60 dark:border-[#26334D]/60">
                  <span className="text-[#6B7684] dark:text-[#8A94A6]">Belanja Kertas, Tinta & Foil (Supplier)</span>
                  <span className="font-mono font-semibold text-[#991B1B] dark:text-[#F87171]">Rp 80.000.000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E2E6ED]/60 dark:border-[#26334D]/60">
                  <span className="text-[#6B7684] dark:text-[#8A94A6]">Tagihan Subkontrak (Vendor Maklon)</span>
                  <span className="font-mono font-semibold text-[#991B1B] dark:text-[#F87171]">Rp 9.800.000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E2E6ED]/60 dark:border-[#26334D]/60">
                  <span className="text-[#6B7684] dark:text-[#8A94A6]">Sparepart & Perawatan Mesin Cetak</span>
                  <span className="font-mono font-semibold text-[#991B1B] dark:text-[#F87171]">Rp 4.900.000</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-sm text-[#1B2436] dark:text-[#E8ECF3]">
                  <span>Total Pengeluaran:</span>
                  <span className="font-mono text-[#991B1B] dark:text-[#F87171]">
                    Rp {totalMonthlyExpenses.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#ECFDF5]/60 dark:bg-[#064E3B]/20 border border-[#A7F3D0] dark:border-[#065F46] flex flex-col justify-between text-xs">
                <div>
                  <div className="font-bold text-[#065F46] dark:text-[#34D399] uppercase tracking-wider text-[11px]">
                    Kalkulasi Profit Bersih Bulan Ini
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#059669] dark:text-[#34D399] mt-2">
                    Rp {totalMonthlyNetProfit.toLocaleString("id-ID")}
                  </div>
                  <p className="text-[11px] text-[#065F46] dark:text-[#34D399] mt-1 leading-relaxed">
                    Selisih bersih antara total pemasukan order (Rp 136,5 Jt) dikurangi seluruh pengeluaran pembelian stok bahan baku, maklon, dan sparepart (Rp 94,7 Jt).
                  </p>
                </div>
                <div className="pt-2 border-t border-[#A7F3D0] dark:border-[#065F46] flex items-center justify-between font-semibold text-[#065F46] dark:text-[#34D399]">
                  <span>Rasio Profit Bersih:</span>
                  <span className="font-mono text-sm">{netProfitMarginPct}% (Sehat)</span>
                </div>
              </div>
            </div>

            {/* Tabel Daftar Pengeluaran Bulanan (Expenses Log) */}
            <div className="rounded-xl border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#E2E6ED] dark:border-[#26334D] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                    Daftar Rincian Pengeluaran Pabrik Bulan Ini ({monthlyExpenses.length} Transaksi Pengeluaran)
                  </h3>
                  <p className="text-xs text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                    Catatan pengeluaran kas untuk pembelian stok bahan baku ke Supplier, subkontrak ke Vendor Maklon, dan perawatan mesin.
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA] dark:bg-[#1B2A44] text-[11px] font-semibold text-[#6B7684] dark:text-[#8A94A6] uppercase">
                      <th className="py-3 px-4">No. Bukti & Tanggal</th>
                      <th className="py-3 px-4">Kategori Pengeluaran</th>
                      <th className="py-3 px-4">Mitra Supplier / Vendor</th>
                      <th className="py-3 px-4">Keterangan Pembelian / Tagihan</th>
                      <th className="py-3 px-4 text-right">Nominal Pengeluaran</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D]">
                    {monthlyExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/50">
                        <td className="py-3 px-4 font-mono">
                          <div className="font-semibold text-[#2B5FC7] dark:text-[#60A5FA]">{exp.id}</div>
                          <div className="text-[10px] text-[#6B7684] dark:text-[#8A94A6]">{exp.date}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] dark:bg-[#7F1D1D]/30 dark:text-[#F87171]">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{exp.partner}</td>
                        <td className="py-3 px-4 text-[#6B7684] dark:text-[#8A94A6] max-w-md">{exp.description}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#991B1B] dark:text-[#F87171]">
                          -Rp {exp.amount.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#065F46] dark:bg-[#064E3B]/40 dark:text-[#34D399]">
                            {exp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 2: REKAP LAPORAN PENJUALAN (JASA CETAK CUSTOM & PRODUK JADI)
           ===================================================================== */}
        {reportType === "sales_recap" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                  Rekapitulasi Laporan Penjualan Bulanan ({filteredSales.length} Transaksi)
                </h3>
                <p className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
                  Rincian omzet pemasukan dari layanan Jasa Cetak Custom maupun penjualan Produk Jadi (Ready Stock) beserta profit per order.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Filter Brand:</span>
                <select
                  value={selectedBrandFilter}
                  onChange={(e) => setSelectedBrandFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-xs font-medium text-[#1B2436] dark:text-[#E8ECF3]"
                >
                  {brandOptions.map((b) => (
                    <option key={b} value={b}>
                      {b === "Semua" ? "Semua Brand" : b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA] dark:bg-[#1B2A44] text-[11px] font-semibold text-[#6B7684] dark:text-[#8A94A6] uppercase">
                    <th className="py-3 px-4">No. Invoice & Order</th>
                    <th className="py-3 px-4">Pelanggan & Tipe</th>
                    <th className="py-3 px-4">Brand & Jenis Layanan</th>
                    <th className="py-3 px-4">Produk & Kuantitas</th>
                    <th className="py-3 px-4 text-right">Pemasukan (Omzet)</th>
                    <th className="py-3 px-4 text-right">HPP Bahan + Maklon</th>
                    <th className="py-3 px-4 text-right">Profit Order</th>
                    <th className="py-3 px-4 text-center">Status Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D]">
                  {filteredSales.map((s) => (
                    <tr key={s.invoiceNo} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/50">
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-[#2B5FC7] dark:text-[#60A5FA]">{s.invoiceNo}</div>
                        <div className="text-[10px] text-[#6B7684] dark:text-[#8A94A6]">{s.orderId} · {s.date}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{s.client}</div>
                        <span
                          className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            s.customerType === "Repeat"
                              ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                              : "bg-[#EFF4FE] text-[#2B5FC7] border border-[#D6E3FC]"
                          }`}
                        >
                          Pelanggan {s.customerType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{s.brand}</div>
                        <span
                          className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                            s.serviceType === "Beli Produk Jadi"
                              ? "bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]"
                              : "bg-[#EFF4FE] text-[#2B5FC7] border border-[#D6E3FC]"
                          }`}
                        >
                          {s.serviceType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#1B2436] dark:text-[#E8ECF3]">{s.product}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#2B5FC7] dark:text-[#60A5FA]">
                        Rp {s.revenue.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#6B7684] dark:text-[#8A94A6]">
                        Rp {(s.cogsMaterial + s.cogsVendorMaklon).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#059669] dark:text-[#34D399]">
                        +Rp {s.netProfit.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.paymentStatus === "Lunas"
                              ? "bg-[#ECFDF5] text-[#065F46] dark:bg-[#064E3B]/40 dark:text-[#34D399]"
                              : "bg-[#FFFBEB] text-[#92400E] dark:bg-[#78350F]/40 dark:text-[#FBBF24]"
                          }`}
                        >
                          {s.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: REKAP LAPORAN GUDANG (MUTASI STOK, OPNAME & VALUASI MULTI-GUDANG)
           ===================================================================== */}
        {reportType === "warehouse_recap" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                  Rekapitulasi Laporan Gudang Bulanan (Stok Awal, Masuk, Keluar, Opname & Stok Akhir)
                </h3>
                <p className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
                  Pantau pergerakan stok Bahan Baku, Sparepart, dan Produk Jadi di Gudang 1 (Pabrik) & Gudang 2 (Ruko).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Lokasi Gudang:</span>
                <select
                  value={warehouseFilter}
                  onChange={(e) => setWarehouseFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-xs font-medium text-[#1B2436] dark:text-[#E8ECF3]"
                >
                  <option value="Semua">Semua Gudang (G1 & G2)</option>
                  <option value="Gudang 1 (Pabrik)">Gudang 1 (Pabrik)</option>
                  <option value="Gudang 2 (Ruko)">Gudang 2 (Ruko)</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA] dark:bg-[#1B2A44] text-[11px] font-semibold text-[#6B7684] dark:text-[#8A94A6] uppercase">
                    <th className="py-3 px-4">Kode & Nama Item</th>
                    <th className="py-3 px-4">Kategori & Gudang</th>
                    <th className="py-3 px-3 text-center">Stok Awal</th>
                    <th className="py-3 px-3 text-center">Masuk (+)</th>
                    <th className="py-3 px-3 text-center">Keluar (-)</th>
                    <th className="py-3 px-3 text-center">Transfer / Opname</th>
                    <th className="py-3 px-3 text-center">Stok Akhir</th>
                    <th className="py-3 px-4 text-right">Valuasi Stok (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D]">
                  {filteredWarehouse.map((item) => {
                    const isBelowRop = item.finalStock <= item.rop;
                    return (
                      <tr key={item.code} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/50">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{item.name}</div>
                          <div className="text-[11px] font-mono text-[#2B5FC7] dark:text-[#60A5FA]">{item.code}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#1B2436] dark:text-[#E8ECF3]">{item.category}</div>
                          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">{item.warehouse}</div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {item.initialStock.toLocaleString("id-ID")} {item.unit}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-[#059669] dark:text-[#34D399]">
                          +{item.stockIn.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-[#991B1B] dark:text-[#F87171]">
                          -{item.stockOut.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-[#6B7684] dark:text-[#8A94A6]">
                          {item.transferNet !== 0 ? `Trf: ${item.transferNet > 0 ? `+${item.transferNet}` : item.transferNet}` : ""}
                          {item.opnameDiff !== 0 ? ` Opn: ${item.opnameDiff}` : ""}
                          {item.transferNet === 0 && item.opnameDiff === 0 ? "0" : ""}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="font-mono font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                            {item.finalStock.toLocaleString("id-ID")} {item.unit}
                          </div>
                          {isBelowRop && (
                            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]">
                              Di Bawah ROP ({item.rop})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#2B5FC7] dark:text-[#60A5FA]">
                          Rp {item.valuationIDR.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Shortcut Akses Cepat ke Seluruh Modul Master Data & Inventori Gudang */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7684] dark:text-[#8A94A6] mb-3">
                Akses Cepat Kelola Master Data & Inventori Gudang (Full Manager Access)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {masterSummary.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group p-3.5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] hover:border-[#2B5FC7] dark:hover:border-[#3B6FE0] shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-[#2B5FC7] dark:text-[#60A5FA] mb-1">
                        <span>{item.label}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">Buka →</span>
                      </div>
                      <div className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">{item.count}</div>
                      <p className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-0.5">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 4: PEMAKAIAN MATERIAL & WASTE INSHEET
           ===================================================================== */}
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

        {/* =====================================================================
            TAB 5: UTILISASI MESIN PRODUKSI
           ===================================================================== */}
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
      </div>
    </DashboardLayout>
  );
}
