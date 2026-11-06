"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useBrands, useMaterials } from "@/hooks/useInventoryData";
import { getStockStatus, totalStock } from "@/lib/inventoryUtils";
import { useOrders } from "@/lib/frontOfficeData";
import type { Material } from "@/types/inventory";

const RESOLVED_STORAGE_KEY = "capstone_front_office_resolved_notifications";

type NotificationCategory = "Stok" | "Order" | "Invoice" | "QC";
type NotificationLevel = "Kritis" | "Perlu Tindak Lanjut" | "Informasi";

interface NotificationItem {
  id: string;
  category: NotificationCategory;
  level: NotificationLevel;
  title: string;
  detail: string;
  href: string;
}

const MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  mei: 4,
  may: 4,
  jun: 5,
  jul: 6,
  agu: 7,
  aug: 7,
  sep: 8,
  okt: 9,
  oct: 9,
  nov: 10,
  des: 11,
  dec: 11,
};

function parseDeadline(value: string): Date | null {
  const localized = value.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (localized) {
    const monthName = localized[2].slice(0, 3).toLowerCase();
    const month = MONTHS[monthName];
    if (month !== undefined) {
      return new Date(Number(localized[3]), month, Number(localized[1]));
    }
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getMaterialBrandLabel(material: Material, brands: string[]): string {
  if (material.brands.length === 0) return "Semua brand";
  return material.brands
    .map((brand) => brands.find((name) => name.toLowerCase() === brand.toLowerCase()) ?? brand)
    .join(", ");
}

export default function NotificationsPage() {
  const { data: materials, loading: materialsLoading, error: materialsError } = useMaterials();
  const brands = useBrands();
  const [orders] = useOrders();
  const [selectedCategory, setSelectedCategory] = useState<"Semua" | NotificationCategory>("Semua");
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  useEffect(() => {
    Promise.resolve().then(() => {
      const saved = window.localStorage.getItem(RESOLVED_STORAGE_KEY);
      if (!saved) return;
      try {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every((id) => typeof id === "string")) {
          setResolvedIds(parsed);
        } else {
          console.error("Format status tindak lanjut notifikasi tidak valid.");
        }
      } catch (error) {
        console.error("Status tindak lanjut notifikasi tidak dapat dibaca.", error);
      }
    });
  }, []);

  const notifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    (materials ?? []).forEach((material) => {
      const stock = totalStock(material.stock);
      const status = getStockStatus(stock, material.rop);
      if (status === "safe") return;
      items.push({
        id: `stock-${material.id}`,
        category: "Stok",
        level: status === "below" ? "Kritis" : "Perlu Tindak Lanjut",
        title: `${material.name} ${status === "below" ? "di bawah batas minimum" : "mendekati batas minimum"}`,
        detail: `Stok ${stock.toLocaleString("id-ID")} · batas minimum ${material.rop.toLocaleString("id-ID")} · ${getMaterialBrandLabel(material, brands)}`,
        href: `/dashboard/inventory/materials?id=${encodeURIComponent(material.id)}`,
      });
    });

    orders.forEach((order) => {
      if (order.revisionCount >= 4) {
        items.push({
          id: `revision-${order.id}`,
          category: "Order",
          level: "Perlu Tindak Lanjut",
          title: `Batas revisi tercapai · ${order.orderNumber}`,
          detail: `${order.customerName} telah menggunakan ${order.revisionCount}/4 revisi. Periksa status persetujuan desain.`,
          href: "/dashboard/orders",
        });
      }

      const deadline = parseDeadline(order.deadline);
      if (deadline) {
        const deadlineDay = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
        const daysRemaining = Math.ceil(
          (deadlineDay.getTime() - startOfToday.getTime()) / 86_400_000,
        );
        if (daysRemaining <= 3) {
          items.push({
            id: `deadline-${order.id}`,
            category: "Order",
            level: daysRemaining < 0 ? "Kritis" : "Perlu Tindak Lanjut",
            title:
              daysRemaining < 0
                ? `Deadline terlewati · ${order.orderNumber}`
                : `Deadline mendekat · ${order.orderNumber}`,
            detail:
              daysRemaining < 0
                ? `${order.customerName} · lewat ${Math.abs(daysRemaining)} hari · ${order.deadline}`
                : `${order.customerName} · ${daysRemaining === 0 ? "jatuh tempo hari ini" : `${daysRemaining} hari lagi`} · ${order.deadline}`,
            href: "/dashboard/orders",
          });
        }
      }
    });

    items.push(
      {
        id: "invoice-overdue-0087",
        category: "Invoice",
        level: "Kritis",
        title: "Invoice jatuh tempo · INV/2026/09/0087",
        detail: "PT Kosmetik Cantik Utama · belum ada pembayaran tercatat. Hubungi pelanggan untuk tindak lanjut.",
        href: "/dashboard/invoices",
      },
      {
        id: "invoice-dp-0089",
        category: "Invoice",
        level: "Perlu Tindak Lanjut",
        title: "Pelunasan invoice perlu dipantau · INV/2026/09/0089",
        detail: "PT Kuliner Nusantara Sejahtera · uang muka sudah diterima, pantau sisa pembayaran.",
        href: "/dashboard/invoices",
      },
      {
        id: "qc-result-0041",
        category: "QC",
        level: "Informasi",
        title: "Hasil inspeksi QC tersedia · QC-2026-0041",
        detail: "Hasil inspeksi tercatat untuk SPK-2026-0089. Periksa hasil dan tindak lanjut bila diperlukan.",
        href: "/dashboard/qc",
      },
    );

    return items;
  }, [materials, brands, orders]);

  const visibleNotifications = notifications.filter((item) => {
    const matchesCategory = selectedCategory === "Semua" || item.category === selectedCategory;
    return matchesCategory && !resolvedIds.includes(item.id);
  });

  const markResolved = (id: string) => {
    const updated = [...new Set([...resolvedIds, id])];
    setResolvedIds(updated);
    try {
      window.localStorage.setItem(RESOLVED_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Status tindak lanjut notifikasi gagal disimpan.", error);
    }
  };

  return (
    <DashboardLayout title="Notifikasi & Tindak Lanjut">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-3 border-b border-[#E2E6ED] pb-4 dark:border-[#26334D] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2B5FC7] dark:text-[#3B6FE0]">
              Front Office · Pusat Tindak Lanjut
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3]">
              Notifikasi & Tindak Lanjut
            </h1>
            <p className="mt-1 text-sm text-[#6B7684] dark:text-[#8A94A6]">
              Pantau stok, deadline order, revisi, invoice, dan hasil QC dari satu tempat.
            </p>
          </div>
          <Link href="/dashboard/orders" className="rounded-lg bg-[#2B5FC7] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1D4FB8]">
            Buka Order Pelanggan
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["Stok", "Order", "Invoice", "QC"] as const).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-xl border p-3 text-left text-xs font-semibold transition ${
                selectedCategory === category
                  ? "border-[#2B5FC7] bg-[#EFF4FE] text-[#2B5FC7] dark:border-[#3B6FE0] dark:bg-[#1D4ED8]/20 dark:text-[#93B4F5]"
                  : "border-[#E2E6ED] bg-white text-[#6B7684] dark:border-[#26334D] dark:bg-[#16223A] dark:text-[#8A94A6]"
              }`}
            >
              {category}
              <span className="mt-1 block text-[11px] font-normal">
                {notifications.filter((item) => item.category === category && !resolvedIds.includes(item.id)).length} perlu dicek
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSelectedCategory("Semua")}
          className={`rounded-lg px-3 py-2 text-xs font-medium ${
            selectedCategory === "Semua"
              ? "bg-[#2B5FC7] text-white"
              : "border border-[#E2E6ED] text-[#6B7684] dark:border-[#26334D] dark:text-[#8A94A6]"
          }`}
        >
          Semua kategori · {notifications.length - resolvedIds.length}
        </button>

        {materialsError && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            Gagal memuat status stok: {materialsError}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-[#E2E6ED] bg-white dark:border-[#26334D] dark:bg-[#16223A]">
          <div className="flex items-center justify-between border-b border-[#E2E6ED] px-4 py-4 dark:border-[#26334D]">
            <div>
              <h2 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">Daftar Tindak Lanjut</h2>
              <p className="mt-1 text-xs text-[#6B7684] dark:text-[#8A94A6]">
                {visibleNotifications.length} item belum ditandai selesai
              </p>
            </div>
            {materialsLoading && <span className="text-xs text-[#6B7684]">Memuat stok…</span>}
          </div>

          {visibleNotifications.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-[#6B7684] dark:text-[#8A94A6]">
              Tidak ada notifikasi untuk kategori ini.
            </p>
          ) : (
            <ul className="divide-y divide-[#E2E6ED] dark:divide-[#26334D]">
              {visibleNotifications.map((item) => (
                <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        item.level === "Kritis"
                          ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : item.level === "Perlu Tindak Lanjut"
                            ? "bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}>
                        {item.level}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7684] dark:text-[#8A94A6]">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{item.title}</h3>
                    <p className="mt-1 text-xs text-[#6B7684] dark:text-[#8A94A6]">{item.detail}</p>
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    <Link href={item.href} className="rounded-lg border border-[#2B5FC7] px-3 py-2 text-xs font-semibold text-[#2B5FC7] hover:bg-[#EFF4FE] dark:border-[#3B6FE0] dark:text-[#93B4F5]">
                      Buka
                    </Link>
                    <button type="button" onClick={() => markResolved(item.id)} className="rounded-lg bg-[#2B5FC7] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1D4FB8]">
                      Ditindaklanjuti
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
