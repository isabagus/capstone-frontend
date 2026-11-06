"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { readOrderActivities, type OrderActivity } from "@/lib/frontOfficeData";

export default function OrderActivityPage() {
  const [activities, setActivities] = useState<OrderActivity[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadActivities = () => {
      queueMicrotask(() => setActivities(readOrderActivities()));
    };
    loadActivities();
    window.addEventListener("front-office-activity-updated", loadActivities);
    window.addEventListener("storage", loadActivities);
    return () => {
      window.removeEventListener("front-office-activity-updated", loadActivities);
      window.removeEventListener("storage", loadActivities);
    };
  }, []);

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return activities;
    return activities.filter(
      (activity) =>
        activity.orderNumber.toLowerCase().includes(query) ||
        activity.customerName.toLowerCase().includes(query) ||
        activity.action.toLowerCase().includes(query) ||
        activity.detail.toLowerCase().includes(query) ||
        activity.actor.toLowerCase().includes(query),
    );
  }, [activities, search]);

  return (
    <DashboardLayout title="Riwayat Aktivitas Order">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-3 border-b border-[#E2E6ED] pb-4 dark:border-[#26334D] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2B5FC7] dark:text-[#3B6FE0]">
              Front Office · Audit Order
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3]">
              Riwayat Aktivitas Order
            </h1>
            <p className="mt-1 text-sm text-[#6B7684] dark:text-[#8A94A6]">
              Catatan order baru, perubahan status, revisi, dan permohonan tindak lanjut.
            </p>
          </div>
          <Link href="/dashboard/orders" className="rounded-lg bg-[#2B5FC7] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1D4FB8]">
            Kembali ke Order
          </Link>
        </div>

        <div className="rounded-xl border border-[#E2E6ED] bg-white p-4 dark:border-[#26334D] dark:bg-[#16223A]">
          <label htmlFor="activity-search" className="mb-2 block text-xs font-semibold text-[#6B7684] dark:text-[#8A94A6]">
            Cari aktivitas berdasarkan order, pelanggan, tindakan, atau pengguna
          </label>
          <input
            id="activity-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Contoh: ORD-2026-0901"
            className="w-full rounded-lg border border-[#E2E6ED] bg-transparent px-3 py-2.5 text-sm text-[#1B2436] outline-none focus:border-[#2B5FC7] dark:border-[#26334D] dark:text-[#E8ECF3]"
          />
        </div>

        <section className="overflow-hidden rounded-xl border border-[#E2E6ED] bg-white dark:border-[#26334D] dark:bg-[#16223A]">
          <div className="border-b border-[#E2E6ED] px-4 py-4 dark:border-[#26334D]">
            <h2 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
              Aktivitas terbaru
            </h2>
            <p className="mt-1 text-xs text-[#6B7684] dark:text-[#8A94A6]">
              {filteredActivities.length} catatan
            </p>
          </div>
          {filteredActivities.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-medium text-[#1B2436] dark:text-[#E8ECF3]">
                {activities.length === 0 ? "Belum ada aktivitas order tercatat." : "Tidak ada aktivitas yang cocok."}
              </p>
              <p className="mt-1 text-xs text-[#6B7684] dark:text-[#8A94A6]">
                Aktivitas akan tercatat saat order dibuat, dikirim ke desain, atau diperbarui.
              </p>
            </div>
          ) : (
            <ol className="divide-y divide-[#E2E6ED] dark:divide-[#26334D]">
              {filteredActivities.map((activity) => (
                <li key={activity.id} className="grid gap-2 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#2B5FC7] dark:text-[#93B4F5]">
                        {activity.orderNumber}
                      </span>
                      <span className="text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                        {activity.action}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#6B7684] dark:text-[#8A94A6]">
                      {activity.customerName} · {activity.detail}
                    </p>
                    <p className="mt-1 text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                      Oleh {activity.actor}
                    </p>
                  </div>
                  <time className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]" dateTime={activity.timestamp}>
                    {new Date(activity.timestamp).toLocaleString("id-ID")}
                  </time>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
