"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavItems, NavItem } from "@/config/navigation";
import { useBrands } from "@/hooks/useInventoryData";
import {
  IconTag,
  IconWarehouse,
  IconGear,
  IconZap,
  IconOrders,
  IconAlertTriangle,
  IconUsd,
  IconInvoice,
  IconPackage,
  IconPalette,
  IconSpk,
  IconRefresh,
  IconProduction,
  IconQc,
  IconCheck,
  IconTruck,
  IconCalendar,
  IconEdit,
  IconX,
  IconPlus,
  IconShield,
  renderNavIcon,
} from "@/components/icons/Icons";

interface StatWidget {
  title: string;
  value: string;
  desc: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  iconKey: string;
  href?: string;
}

const ROLE_WIDGETS: Record<string, StatWidget[]> = {
  owner: [
    { title: "Total Brand Aktif", value: "5 Brand", desc: "Packsolution, Estella, dll", change: "Stabil", changeType: "neutral", iconKey: "tag" },
    { title: "Kapasitas Gudang", value: "2 Unit", desc: "Gudang 1 & Gudang 2 Ruko", change: "84% terpakai", changeType: "neutral", iconKey: "warehouse" },
    { title: "Efisiensi Produksi", value: "96.4%", desc: "Bulan berjalan", change: "+2.1%", changeType: "positive", iconKey: "gear" },
    { title: "Valuasi Stok Material", value: "Rp 128.5 jt", desc: "Total 4 Kategori Bahan Baku", change: "+4.2%", changeType: "positive", iconKey: "invoice" },
  ],
  manager: [
    { title: "Antrean Pesanan", value: "18 SPK", desc: "Sedang dalam alur pengerjaan", change: "+4 baru", changeType: "positive", iconKey: "orders" },
    { title: "Peringatan Ambang (ROP)", value: "3 Bahan", desc: "Perlu reorder segera", change: "Kritis", changeType: "negative", iconKey: "alert" },
    { title: "Estimasi Kurs USD", value: "Rp 15.820", desc: "Update Bank Indonesia", change: "-0.15%", changeType: "positive", iconKey: "usd" },
    { title: "Faktur Siap Terbit", value: "7 Invoice", desc: "Setelah QC Pass", change: "Rp 42.8 jt", changeType: "positive", iconKey: "invoice" },
  ],
  front_office: [
    { title: "Pesanan Masuk Hari Ini", value: "12 Order", desc: "5 Brand terintegrasi", change: "+3 express", changeType: "positive", iconKey: "orders" },
    { title: "Kesiapan Stok Material", value: "Tersedia", desc: "Pre-validation otomatis", change: "92% siap", changeType: "positive", iconKey: "package" },
    { title: "Pesanan Prioritas", value: "4 Order", desc: "Deadline < 24 jam", change: "Urgent", changeType: "negative", iconKey: "zap" },
    { title: "Limit Revisi Desain", value: "1 Order", desc: "Mencapai revisi ke-4/4", change: "Perlu Review", changeType: "neutral", iconKey: "edit" },
  ],
  tim_design: [
    { title: "Antrean Desain Cetak", value: "9 Desain", desc: "Menunggu approval FO", change: "Prioritas aktif", changeType: "positive", iconKey: "palette" },
    { title: "Kalkulasi BOM Selesai", value: "14 Item", desc: "Engine konversi plano", change: "< 1 detik", changeType: "positive", iconKey: "gear" },
    { title: "Draft SPK Siap Terbit", value: "6 SPK", desc: "Menunggu ACC Manager", change: "Siap cetak", changeType: "positive", iconKey: "spk" },
    { title: "Revisi Pelanggan", value: "2 Pending", desc: "Rata-rata 1.8x revisi", change: "Aman", changeType: "neutral", iconKey: "refresh" },
  ],
  kepala_produksi: [
    { title: "Pekerjaan In-Progress", value: "8 Batch", desc: "Cetak & finishing", change: "Kapasitas 80%", changeType: "positive", iconKey: "production" },
    { title: "Mesin Aktif Beroperasi", value: "5 Mesin", desc: "Offset & Die-cutting", change: "Normal", changeType: "positive", iconKey: "gear" },
    { title: "Antrean Alokasi SPK", value: "4 SPK", desc: "Siap dialokasikan teknisi", change: "2 Prioritas", changeType: "neutral", iconKey: "orders" },
    { title: "Menunggu Inspeksi QC", value: "3 Batch", desc: "Finishing selesai", change: "Perlu cek", changeType: "neutral", iconKey: "qc" },
  ],
  quality_control: [
    { title: "Inspeksi Hari Ini", value: "11 Batch", desc: "Uji warna & dimensi", change: "+5 batch", changeType: "positive", iconKey: "qc" },
    { title: "Tingkat Lolos (PASS)", value: "94.8%", desc: "Sesuai toleransi cetak", change: "+1.2%", changeType: "positive", iconKey: "check" },
    { title: "Re-work / Defect", value: "1 Batch", desc: "Potongan miring (Vendor)", change: "Tindak lanjut", changeType: "negative", iconKey: "x" },
    { title: "Ready to Deliver", value: "9 Order", desc: "Siap packing & kirim", change: "Gudang 1", changeType: "positive", iconKey: "truck" },
  ],
  staf_gudang: [
    { title: "Item di Bawah ROP", value: "3 SKU", desc: "Ivory 300gr & Tinta Hitam", change: "Perlu PO", changeType: "negative", iconKey: "alert", href: "/dashboard/inventory/materials?status=below" },
    { title: "Total SKU Material", value: "48 SKU", desc: "4 Kategori material", change: "Aktif", changeType: "neutral", iconKey: "package", href: "/dashboard/inventory/materials" },
    { title: "Transfer Antar-Gudang", value: "2 Mutasi", desc: "Gudang 1 -> Gudang 2", change: "ACID Locked", changeType: "positive", iconKey: "refresh", href: "/dashboard/inventory/materials?tab=movements" },
    { title: "Batch Mendekati Exp.", value: "1 Lot", desc: "Tinta UV Cyan (30 hari)", change: "Pantau", changeType: "neutral", iconKey: "calendar", href: "/dashboard/inventory/materials?filter=expiring" },
  ],
};

function renderWidgetIcon(key: string) {
  const cls = "text-[#2B5FC7] dark:text-[#3B6FE0]";
  switch (key) {
    case "tag": return <IconTag size={17} className={cls} />;
    case "warehouse": return <IconWarehouse size={17} className={cls} />;
    case "gear": return <IconGear size={17} className={cls} />;
    case "zap": return <IconZap size={17} className="text-[#FBBF24] dark:text-[#FBBF24]" />;
    case "orders": return <IconOrders size={17} className={cls} />;
    case "alert": return <IconAlertTriangle size={17} className="text-[#991B1B] dark:text-[#F87171]" />;
    case "usd": return <IconUsd size={17} className={cls} />;
    case "invoice": return <IconInvoice size={17} className={cls} />;
    case "package": return <IconPackage size={17} className={cls} />;
    case "palette": return <IconPalette size={17} className={cls} />;
    case "spk": return <IconSpk size={17} className={cls} />;
    case "refresh": return <IconRefresh size={17} className={cls} />;
    case "production": return <IconProduction size={17} className={cls} />;
    case "qc": return <IconQc size={17} className={cls} />;
    case "check": return <IconCheck size={17} className="text-[#065F46] dark:text-[#34D399]" />;
    case "x": return <IconX size={17} className="text-[#991B1B] dark:text-[#F87171]" />;
    case "truck": return <IconTruck size={17} className={cls} />;
    case "calendar": return <IconCalendar size={17} className={cls} />;
    case "edit": return <IconEdit size={17} className={cls} />;
    default: return <IconGear size={17} className={cls} />;
  }
}

interface OrderData {
  id: string;
  orderNumber: string;
  customer: string;
  brand: string;
  product: string;
  quantity: string;
  priority: "Normal" | "High" | "Urgent";
  status: "Selesai" | "Proses" | "Menunggu" | "Kritis";
  warehouse: "Gudang 1" | "Gudang 2";
  date: string;
  materialReqs?: string;
}

const SAMPLE_ORDERS: OrderData[] = [
  {
    id: "1",
    orderNumber: "ORD-2026-0901",
    customer: "PT Artha Boga Sejahtera",
    brand: "Packsolution.id",
    product: "Hardbox Rigid Premium Gold",
    quantity: "2.500 pcs",
    priority: "Urgent",
    status: "Proses",
    warehouse: "Gudang 1",
    date: "24 Sep 2026",
    materialReqs: "Hardboard 2mm (650 lbr), Art Carton 260gr (12 rim), Foil Gold (2 roll)",
  },
  {
    id: "2",
    orderNumber: "ORD-2026-0902",
    customer: "Estella Glow Skincare",
    brand: "Estella",
    product: "Softbox Skincare Matte Doff",
    quantity: "5.000 pcs",
    priority: "High",
    status: "Menunggu",
    warehouse: "Gudang 2",
    date: "24 Sep 2026",
    materialReqs: "Ivory 300gr (20 rim), Laminasi Doff (3 roll)",
  },
  {
    id: "3",
    orderNumber: "ORD-2026-0903",
    customer: "Pepipapier Stationery",
    brand: "Pepipapier",
    product: "Greeting Card Foil Emboss",
    quantity: "1.200 pcs",
    priority: "Normal",
    status: "Selesai",
    warehouse: "Gudang 1",
    date: "23 Sep 2026",
    materialReqs: "Ivory 250gr (4 rim), Foil Gold (1 roll)",
  },
  {
    id: "4",
    orderNumber: "ORD-2026-0904",
    customer: "Studio Foto Memoirs",
    brand: "memoirs.print",
    product: "Photobook Hardcover Linen",
    quantity: "350 pcs",
    priority: "High",
    status: "Proses",
    warehouse: "Gudang 2",
    date: "23 Sep 2026",
    materialReqs: "Hardboard 3mm (180 lbr), Art Paper 150gr (8 rim), Lem Kuning (6 kg)",
  },
  {
    id: "5",
    orderNumber: "ORD-2026-0905",
    customer: "Pikpurry Pet Care",
    brand: "pikpurry",
    product: "Packaging Snack Pouch Ziplock",
    quantity: "10.000 pcs",
    priority: "Normal",
    status: "Kritis",
    warehouse: "Gudang 1",
    date: "22 Sep 2026",
    materialReqs: "Film ALU (6 roll), Tinta UV Cyan (2 kg)",
  },
];

const ROP_WARNINGS = [
  { id: "m-1", code: "BB-IVR-300", name: "Ivory 300gr", stock: 40, rop: 60, unit: "Rim", status: "Kritis" },
  { id: "m-6", code: "BB-KRF-275", name: "Kraft Liner Brown 275gr", stock: 16, rop: 35, unit: "Rim", status: "Kritis" },
  { id: "m-9", code: "BB-INK-CYN", name: "Tinta UV Cyan", stock: 6, rop: 10, unit: "Kg", status: "Mendekati ROP" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navItems = useNavItems();
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("Semua");

  const normalizedRole = (user?.role || "").toLowerCase().trim().replace(/[\s-]+/g, "_");
  const isGudang = normalizedRole === "staf_gudang";

  const widgets = ROLE_WIDGETS[normalizedRole] ?? ROLE_WIDGETS.owner;

  const dynamicBrands = useBrands();
  const brands = ["Semua", ...dynamicBrands];

  const filteredOrders =
    selectedBrandFilter === "Semua"
      ? SAMPLE_ORDERS
      : SAMPLE_ORDERS.filter((o) => o.brand.toLowerCase() === selectedBrandFilter.toLowerCase());

  const renderPriorityBadge = (priority: "Normal" | "High" | "Urgent") => {
    switch (priority) {
      case "Urgent":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] dark:bg-[#7F1D1D]/30 dark:text-[#F87171] dark:border-[#991B1B]/60">
            Urgent
          </span>
        );
      case "High":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] dark:bg-[#78350F]/30 dark:text-[#FBBF24] dark:border-[#92400E]/60">
            High
          </span>
        );
      case "Normal":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F4F6FA] text-[#6B7684] border border-[#E2E6ED] dark:bg-[#1B2A44] dark:text-[#8A94A6] dark:border-[#26334D]">
            Normal
          </span>
        );
    }
  };

  const renderStatusBadge = (status: "Selesai" | "Proses" | "Menunggu" | "Kritis") => {
    switch (status) {
      case "Selesai":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] dark:bg-[#064E3B]/30 dark:text-[#34D399] dark:border-[#065F46]/60">
            Selesai
          </span>
        );
      case "Proses":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#EFF4FE] text-[#2B5FC7] border border-[#D6E3FC] dark:bg-[#1D4ED8]/25 dark:text-[#60A5FA] dark:border-[#2563EB]/40">
            In-Progress
          </span>
        );
      case "Menunggu":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] dark:bg-[#78350F]/30 dark:text-[#FBBF24] dark:border-[#92400E]/60">
            Antrean
          </span>
        );
      case "Kritis":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] dark:bg-[#7F1D1D]/30 dark:text-[#F87171] dark:border-[#991B1B]/60">
            Stok ROP
          </span>
        );
    }
  };

  return (
    <DashboardLayout title="Ringkasan Operasional">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Greeting Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2E6ED] dark:border-[#26334D]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#2B5FC7] dark:bg-[#3B6FE0]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B5FC7] dark:text-[#3B6FE0]">
                Sistem ERP / CRM CV Solusi Inovasi Packaging
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight">
              Selamat bertugas, {user?.name || "Pengguna"}!
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
              Anda masuk sebagai <strong className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{user?.role_display}</strong>.
              Semua modul operasional terhubung real-time.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {isGudang ? (
              <>
                <Link
                  href="/dashboard/inventory/materials?action=transfer"
                  className="px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-medium border border-[#2B5FC7] text-[#2B5FC7] hover:bg-[#2B5FC7]/10 dark:border-[#3B6FE0] dark:text-[#93B4F5] dark:hover:bg-[#3B6FE0]/15 transition-colors flex items-center gap-1.5"
                >
                  <IconRefresh size={14} />
                  <span>Transfer Stok</span>
                </Link>
                <Link
                  href="/dashboard/inventory/materials?action=stock_in"
                  className="px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-medium bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] dark:hover:bg-[#2B5FC7] text-white shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <IconPlus size={14} strokeWidth={2.5} />
                  <span>Catat Barang Masuk</span>
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-medium border border-[#2B5FC7] text-[#2B5FC7] hover:bg-[#2B5FC7]/10 dark:border-[#3B6FE0] dark:text-[#3B6FE0] dark:hover:bg-[#3B6FE0]/15 transition-colors flex items-center gap-1.5"
                >
                  <IconRefresh size={13} />
                  <span>Refresh Data</span>
                </button>
                <button
                  type="button"
                  className="px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-medium bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] dark:hover:bg-[#2B5FC7] text-white shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <IconPlus size={13} strokeWidth={2.5} />
                  <span>Buat Pesanan Baru</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Operational Summary Cards */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-[#6B7684] dark:text-[#8A94A6] uppercase tracking-wider">
              Metrik Inti — {user?.role_display}
            </h3>
            <span className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
              Pembaruan otomatis per menit
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {widgets.map((w, i) => {
              const cardContent = (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6] flex items-center gap-1">
                      {w.title}
                      {w.href && (
                        <span className="text-[#2B5FC7] dark:text-[#93B4F5] opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </span>
                      )}
                    </span>
                    <span className="p-1.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] flex items-center justify-center">
                      {renderWidgetIcon(w.iconKey)}
                    </span>
                  </div>

                  <div className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mb-1 tracking-tight">
                    {w.value}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
                    <span className="text-[#6B7684] dark:text-[#8A94A6] text-[11px] truncate">
                      {w.desc}
                    </span>
                    {w.change && (
                      <span
                        className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${w.changeType === "positive"
                            ? "bg-[#ECFDF5] text-[#065F46] dark:bg-[#064E3B]/30 dark:text-[#34D399]"
                            : w.changeType === "negative"
                              ? "bg-[#FEF2F2] text-[#991B1B] dark:bg-[#7F1D1D]/30 dark:text-[#F87171]"
                              : "bg-[#F4F6FA] text-[#6B7684] dark:bg-[#1B2A44] dark:text-[#8A94A6]"
                          }`}
                      >
                        {w.change}
                      </span>
                    )}
                  </div>
                </>
              );

              return w.href ? (
                <Link
                  key={i}
                  href={w.href}
                  className="group block p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-[#2B5FC7] dark:hover:border-[#3B6FE0] transition-all"
                >
                  {cardContent}
                </Link>
              ) : (
                <div
                  key={i}
                  className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors"
                >
                  {cardContent}
                </div>
              );
            })}
          </div>
        </section>

        {/* Staf Gudang: Panel Peringatan Stok & Antrean Produksi */}
        {isGudang && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel Peringatan Stok */}
            <div className="lg:col-span-1 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D] mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-[#FEF2F2] dark:bg-[#7F1D1D]/30 text-[#991B1B] dark:text-[#F87171]">
                      <IconAlertTriangle size={15} />
                    </span>
                    <h3 className="text-xs font-bold text-[#1B2436] dark:text-[#E8ECF3] uppercase tracking-wider">
                      Peringatan Stok ROP
                    </h3>
                  </div>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#FEF2F2] text-[#991B1B] dark:bg-[#7F1D1D]/40 dark:text-[#F87171]">
                    {ROP_WARNINGS.length} Bahan
                  </span>
                </div>

                <div className="space-y-3">
                  {ROP_WARNINGS.map((mat) => (
                    <div
                      key={mat.id}
                      className="p-3 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA]/60 dark:bg-[#1B2A44]/60 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] truncate">
                          {mat.name}
                        </div>
                        <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                          Stok: <strong className="text-[#991B1B] dark:text-[#F87171]">{mat.stock} {mat.unit}</strong> / ROP: {mat.rop} {mat.unit}
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/inventory/materials?id=${mat.id}`}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-[#2B5FC7] text-[#2B5FC7] hover:bg-[#2B5FC7]/10 dark:border-[#3B6FE0] dark:text-[#93B4F5] dark:hover:bg-[#3B6FE0]/15 flex-shrink-0"
                      >
                        Detail
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E2E6ED] dark:border-[#26334D]">
                <Link
                  href="/dashboard/inventory/materials?status=below"
                  className="w-full py-2 px-3 text-xs font-medium text-center rounded-lg bg-[#EFF4FE] text-[#2B5FC7] hover:bg-[#D6E3FC] dark:bg-[#3B6FE0]/15 dark:text-[#93B4F5] dark:hover:bg-[#3B6FE0]/25 transition-colors block"
                >
                  Lihat Semua Bahan Di Bawah ROP →
                </Link>
              </div>
            </div>

            {/* Antrean Kebutuhan Bahan Produksi (Read-Only) */}
            <div className="lg:col-span-2 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#E2E6ED] dark:border-[#26334D] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                    Kebutuhan Bahan Antrean Produksi
                  </h3>
                  <p className="text-xs text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                    Informasi read-only untuk persiapan material gudang
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6]">
                  Read-Only Info
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F4F6FA] dark:bg-[#1B2A44] border-b border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6] font-semibold">
                      <th className="py-2.5 px-4">No. Order</th>
                      <th className="py-2.5 px-4">Brand / Produk</th>
                      <th className="py-2.5 px-4">Kebutuhan Bahan Pokok</th>
                      <th className="py-2.5 px-4">Prioritas</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]">
                    {SAMPLE_ORDERS.slice(0, 4).map((row) => (
                      <tr key={row.id} className="hover:bg-[#F4F6FA]/70 dark:hover:bg-[#1B2A44]/50">
                        <td className="py-3 px-4 font-mono font-medium text-[#2B5FC7] dark:text-[#3B6FE0]">
                          {row.orderNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{row.product}</div>
                          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">{row.brand} ({row.quantity})</div>
                        </td>
                        <td className="py-3 px-4 text-[#6B7684] dark:text-[#8A94A6] max-w-xs text-[11px]">
                          {row.materialReqs || "-"}
                        </td>
                        <td className="py-3 px-4">{renderPriorityBadge(row.priority)}</td>
                        <td className="py-3 px-4">{renderStatusBadge(row.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Data Table Section (Antrean Pesanan Umum jika bukan Staf Gudang) */}
        {!isGudang && (
        <section className="rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-colors">
          {/* Table Header & Brand Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-[#E2E6ED] dark:border-[#26334D] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                Antrean Produksi & Pesanan Aktif
              </h3>
              <p className="text-xs text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                Monitoring status alur FO → Tim Design → SPK Produksi → QC
              </p>
            </div>

            {/* Filter 5 Brand Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-[#6B7684] dark:text-[#8A94A6] mr-1 hidden sm:inline">
                Filter Brand:
              </span>
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrandFilter(brand)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${selectedBrandFilter === brand
                      ? "bg-[#2B5FC7] text-white dark:bg-[#3B6FE0]"
                      : "bg-[#F4F6FA] text-[#6B7684] hover:text-[#1B2436] border border-[#E2E6ED] dark:bg-[#1B2A44] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3] dark:border-[#26334D]"
                    }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F4F6FA] dark:bg-[#1B2A44] border-b border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6] font-semibold">
                  <th className="py-3 px-4">No. Order</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Spesifikasi Produk</th>
                  <th className="py-3 px-4">Jumlah</th>
                  <th className="py-3 px-4">Lokasi Gudang</th>
                  <th className="py-3 px-4">Prioritas</th>
                  <th className="py-3 px-4">Status Alur</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]">
                {filteredOrders.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#F4F6FA]/70 dark:hover:bg-[#1B2A44]/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-[#2B5FC7] dark:text-[#3B6FE0]">
                      {row.orderNumber}
                    </td>
                    <td className="py-3 px-4 font-medium">{row.customer}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]">
                        {row.brand}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#6B7684] dark:text-[#8A94A6] max-w-xs truncate">
                      {row.product}
                    </td>
                    <td className="py-3 px-4 font-semibold">{row.quantity}</td>
                    <td className="py-3 px-4 text-[#6B7684] dark:text-[#8A94A6]">
                      {row.warehouse}
                    </td>
                    <td className="py-3 px-4">{renderPriorityBadge(row.priority)}</td>
                    <td className="py-3 px-4">{renderStatusBadge(row.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium border border-[#2B5FC7] text-[#2B5FC7] hover:bg-[#2B5FC7]/10 dark:border-[#3B6FE0] dark:text-[#3B6FE0] dark:hover:bg-[#3B6FE0]/15 transition-colors"
                      >
                        Detail SPK
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer info */}
          <div className="p-3 sm:px-5 bg-white dark:bg-[#16223A] border-t border-[#E2E6ED] dark:border-[#26334D] flex items-center justify-between text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
            <span>Menampilkan {filteredOrders.length} dari {SAMPLE_ORDERS.length} pesanan aktif</span>
            <span>CV Solusi Inovasi Packaging · ACID Inventory Integrity</span>
          </div>
        </section>
        )}

        {/* Quick Operational Modules Access */}
        <section className="rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                Pintasan Cepat Modul Operasional
              </h3>
              <p className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
                Akses langsung ke alur kerja aktif sesuai wewenang {user?.role_display}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#EFF4FE] text-[#2B5FC7] border border-[#D6E3FC] dark:bg-[#1D4ED8]/25 dark:text-[#60A5FA] dark:border-[#2563EB]/40 flex items-center gap-1">
              <IconCheck size={12} strokeWidth={2.5} />
              <span>{navItems.filter((i: NavItem) => i.href !== "/dashboard").length} Modul Terhubung</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {navItems
              .filter((item: NavItem) => item.href !== "/dashboard")
              .map((item: NavItem) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="p-3.5 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA]/60 hover:bg-[#EFF4FE] dark:bg-[#1B2A44]/60 dark:hover:bg-[#1B2A44] transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#2B5FC7] dark:text-[#3B6FE0] group-hover:scale-105 transition-transform">
                      {renderNavIcon(item.id, undefined, 18)}
                    </span>
                    <span className="text-xs text-[#2B5FC7] dark:text-[#3B6FE0] opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      Buka →
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[#1B2436] dark:text-[#E8ECF3] group-hover:text-[#2B5FC7] dark:group-hover:text-[#3B6FE0] transition-colors">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                      Klik untuk membuka modul
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
