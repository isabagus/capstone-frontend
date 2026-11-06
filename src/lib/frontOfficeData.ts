"use client";

import { useEffect, useState } from "react";

export type FrontOfficeBrand =
  | "Packsolution.id"
  | "Estella"
  | "Pepipapier"
  | "memoirs.print"
  | "pikpurry";

export interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  brand: FrontOfficeBrand;
  productName: string;
  productDescription?: string;
  productType?: "Produk Jadi" | "Produk Custom";
  dimensions: string;
  paperType: string;
  quantity: number;
  finishing: string[];
  stockPreValidation: "Tersedia" | "Menipis" | "Kurang";
  priority: "Normal" | "High" | "Express";
  deadline: string;
  orderDate: string;
  status: "Order Placed" | "Queued for Design" | "Design Approved" | "In-Production";
  revisionCount: number;
  revisionHistory: { revNumber: number; date: string; notes: string }[];
  notes?: string;
}

export interface OrderActivity {
  id: string;
  orderNumber: string;
  customerName: string;
  action: string;
  detail: string;
  timestamp: string;
  actor: string;
}

const ORDERS_STORAGE_KEY = "capstone_front_office_orders";
const ACTIVITIES_STORAGE_KEY = "capstone_front_office_order_activities";

export const INITIAL_ORDERS: OrderItem[] = [
  {
    id: "1",
    orderNumber: "ORD-2026-0901",
    customerName: "PT Artha Boga Sejahtera",
    customerPhone: "0812-3456-7890",
    brand: "Packsolution.id",
    productName: "Hardbox Rigid Premium Magnetic Gold",
    dimensions: "25 × 20 × 8 cm",
    paperType: "Kertas Ivory 300 GSM + Greyboard 2mm",
    quantity: 2500,
    finishing: ["Laminasi Doff", "Foil Hot Print Gold", "Die-cut"],
    stockPreValidation: "Tersedia",
    priority: "Express",
    deadline: "25 Sep 2026 (18:00 WIB)",
    orderDate: "24 Sep 2026",
    status: "Queued for Design",
    revisionCount: 2,
    revisionHistory: [
      { revNumber: 1, date: "24 Sep 2026 10:00", notes: "Ubah posisi logo 2cm ke kanan" },
      { revNumber: 2, date: "24 Sep 2026 14:30", notes: "Penyesuaian warna foil ke Gold Shiny #4" },
    ],
    notes: "Pesanan express untuk launching produk minggu ini.",
  },
  {
    id: "2",
    orderNumber: "ORD-2026-0902",
    customerName: "Estella Glow Skincare",
    customerPhone: "0813-9876-5432",
    brand: "Estella",
    productName: "Softbox Skincare Serum Matte Doff",
    dimensions: "12 × 5 × 5 cm",
    paperType: "Kraft Liner Brown 275 GSM",
    quantity: 5000,
    finishing: ["Laminasi Doff", "Emboss Logo"],
    stockPreValidation: "Tersedia",
    priority: "High",
    deadline: "28 Sep 2026",
    orderDate: "24 Sep 2026",
    status: "Order Placed",
    revisionCount: 1,
    revisionHistory: [
      { revNumber: 1, date: "24 Sep 2026 11:20", notes: "Tambahkan QR Code BPOM pada sisi samping" },
    ],
    notes: "Warna kraft natural dengan tinta putih pekat.",
  },
  {
    id: "3",
    orderNumber: "ORD-2026-0903",
    customerName: "Pepipapier Stationery",
    customerPhone: "0811-2233-4455",
    brand: "Pepipapier",
    productName: "Greeting Card & Custom Envelope Foil",
    dimensions: "15 × 10 cm",
    paperType: "Art Paper 150 GSM",
    quantity: 1200,
    finishing: ["Foil Hot Print Gold", "Spot UV"],
    stockPreValidation: "Tersedia",
    priority: "Normal",
    deadline: "30 Sep 2026",
    orderDate: "23 Sep 2026",
    status: "Design Approved",
    revisionCount: 4,
    revisionHistory: [
      { revNumber: 1, date: "23 Sep 09:00", notes: "Koreksi font tulisan wedding" },
      { revNumber: 2, date: "23 Sep 13:00", notes: "Ubah background dari krem ke broken white" },
      { revNumber: 3, date: "23 Sep 16:30", notes: "Perbesar motif bunga di pojok kanan bawah" },
      { revNumber: 4, date: "24 Sep 09:15", notes: "Revisi final: penyesuaian margin amplop" },
    ],
    notes: "Mencapai batas 4x revisi desain. Desain telah di-ACC final.",
  },
  {
    id: "4",
    orderNumber: "ORD-2026-0904",
    customerName: "Studio Foto Memoirs",
    customerPhone: "0877-6655-4433",
    brand: "memoirs.print",
    productName: "Photobook Hardcover Linen Series",
    dimensions: "30 × 30 cm",
    paperType: "Art Paper 150 GSM",
    quantity: 350,
    finishing: ["Laminasi Doff", "Hardcover Board"],
    stockPreValidation: "Tersedia",
    priority: "High",
    deadline: "27 Sep 2026",
    orderDate: "23 Sep 2026",
    status: "Queued for Design",
    revisionCount: 0,
    revisionHistory: [],
    notes: "Foto resolusi tinggi sudah diunggah di drive.",
  },
  {
    id: "5",
    orderNumber: "ORD-2026-0905",
    customerName: "Pikpurry Pet Care",
    customerPhone: "0856-7788-9900",
    brand: "pikpurry",
    productName: "Packaging Snack Pouch Ziplock Cat Treats",
    dimensions: "20 × 12 cm",
    paperType: "Kertas Duplex Coated 350 GSM",
    quantity: 10000,
    finishing: ["Laminasi Glossy", "Ziplock Sealing"],
    stockPreValidation: "Menipis",
    priority: "Normal",
    deadline: "05 Okt 2026",
    orderDate: "22 Sep 2026",
    status: "Order Placed",
    revisionCount: 1,
    revisionHistory: [
      { revNumber: 1, date: "22 Sep 15:00", notes: "Ubah tabel nutrisi pakan kucing" },
    ],
    notes: "Stok duplex di Gudang 2 menipis, perlu koordinasi saat cetak.",
  },
];

function isOrderItem(value: unknown): value is OrderItem {
  if (typeof value !== "object" || value === null) return false;
  const order = value as Record<string, unknown>;
  return (
    typeof order.id === "string" &&
    typeof order.orderNumber === "string" &&
    typeof order.customerName === "string" &&
    typeof order.customerPhone === "string" &&
    typeof order.brand === "string" &&
    typeof order.productName === "string" &&
    (order.productDescription === undefined || typeof order.productDescription === "string") &&
    typeof order.dimensions === "string" &&
    typeof order.paperType === "string" &&
    typeof order.quantity === "number" &&
    Array.isArray(order.finishing) &&
    typeof order.stockPreValidation === "string" &&
    typeof order.priority === "string" &&
    typeof order.deadline === "string" &&
    typeof order.orderDate === "string" &&
    typeof order.status === "string" &&
    typeof order.revisionCount === "number" &&
    Array.isArray(order.revisionHistory)
  );
}

export function useOrders(): [OrderItem[], (orders: OrderItem[]) => void] {
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.resolve().then(() => {
      if (!active) return;
      const savedOrders = window.localStorage.getItem(ORDERS_STORAGE_KEY);
      if (savedOrders) {
        try {
          const parsed: unknown = JSON.parse(savedOrders);
          if (Array.isArray(parsed) && parsed.every(isOrderItem)) {
            setOrders(parsed);
          } else {
            console.error("Format data order Front Office tersimpan tidak valid.");
          }
        } catch (error) {
          console.error("Data order Front Office tersimpan tidak dapat dibaca.", error);
        }
      }
      setLoaded(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loaded) {
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    }
  }, [orders, loaded]);

  return [orders, setOrders];
}

export function recordOrderActivity(
  activity: Omit<OrderActivity, "id" | "timestamp">,
): void {
  const entry: OrderActivity = {
    ...activity,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };

  try {
    const saved = window.localStorage.getItem(ACTIVITIES_STORAGE_KEY);
    const activities: unknown = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(activities)) {
      throw new Error("Format riwayat aktivitas order tidak valid.");
    }
    window.localStorage.setItem(
      ACTIVITIES_STORAGE_KEY,
      JSON.stringify([entry, ...activities]),
    );
    window.dispatchEvent(new CustomEvent("front-office-activity-updated"));
  } catch (error) {
    console.error("Riwayat aktivitas order gagal disimpan.", error);
  }
}

export function readOrderActivities(): OrderActivity[] {
  const saved = window.localStorage.getItem(ACTIVITIES_STORAGE_KEY);
  if (!saved) return [];

  try {
    const parsed: unknown = JSON.parse(saved);
    if (
      !Array.isArray(parsed) ||
      !parsed.every(
        (activity) =>
          typeof activity === "object" &&
          activity !== null &&
          typeof activity.id === "string" &&
          typeof activity.orderNumber === "string" &&
          typeof activity.customerName === "string" &&
          typeof activity.action === "string" &&
          typeof activity.detail === "string" &&
          typeof activity.timestamp === "string" &&
          typeof activity.actor === "string",
      )
    ) {
      throw new Error("Format riwayat aktivitas order tidak valid.");
    }
    return parsed as OrderActivity[];
  } catch (error) {
    console.error("Riwayat aktivitas order tersimpan tidak dapat dibaca.", error);
    return [];
  }
}
