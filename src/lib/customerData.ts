"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

export type CustomerStatus = "Aktif" | "Nonaktif";

export type CustomerRecord = {
  id: string;
  companyName: string;
  picName: string;
  phone: string;
  email: string;
  brand: string;
  address: string;
  status: CustomerStatus;
  notes: string;
  totalOrders: number;
  activeOrders: number;
  joinedDate: string;
};

export type NewCustomerRecord = Pick<
  CustomerRecord,
  | "companyName"
  | "picName"
  | "phone"
  | "email"
  | "brand"
  | "address"
  | "status"
  | "notes"
>;

const STORAGE_KEY = "capstone_customers";

const DEMO_CUSTOMERS: CustomerRecord[] = [
  {
    id: "CUS-001",
    companyName: "PT Artha Boga Sejahtera",
    picName: "Budi Santoso",
    phone: "0812-3456-7890",
    email: "budi@arthaboga.example",
    brand: "Packsolution.id",
    address: "Jakarta",
    status: "Aktif",
    notes: "Pelanggan demo Front Office",
    totalOrders: 2,
    activeOrders: 1,
    joinedDate: "2026-09-01",
  },
  {
    id: "CUS-002",
    companyName: "Estella Glow Skincare",
    picName: "Sinta Maharani",
    phone: "0813-9876-5432",
    email: "sinta@estella.example",
    brand: "Estella",
    address: "Bandung",
    status: "Aktif",
    notes: "Pelanggan demo Front Office",
    totalOrders: 1,
    activeOrders: 1,
    joinedDate: "2026-09-03",
  },
  {
    id: "CUS-003",
    companyName: "Pepipapier Stationery",
    picName: "Nadia Putri",
    phone: "0811-2233-4455",
    email: "nadia@pepipapier.example",
    brand: "Pepipapier",
    address: "Surabaya",
    status: "Aktif",
    notes: "Pelanggan demo Front Office",
    totalOrders: 4,
    activeOrders: 1,
    joinedDate: "2026-09-05",
  },
  {
    id: "CUS-004",
    companyName: "Studio Foto Memoirs",
    picName: "Raka Pratama",
    phone: "0877-6655-4433",
    email: "raka@memoirs.example",
    brand: "memoirs.print",
    address: "Yogyakarta",
    status: "Aktif",
    notes: "Pelanggan demo Front Office",
    totalOrders: 2,
    activeOrders: 1,
    joinedDate: "2026-09-08",
  },
  {
    id: "CUS-005",
    companyName: "Pikpurry Pet Care",
    picName: "Dewi Anggraini",
    phone: "0856-7788-9900",
    email: "dewi@pikpurry.example",
    brand: "pikpurry",
    address: "Malang",
    status: "Aktif",
    notes: "Pelanggan demo Front Office",
    totalOrders: 1,
    activeOrders: 1,
    joinedDate: "2026-09-10",
  },
];

function isCustomerRecord(value: unknown): value is CustomerRecord {
  if (typeof value !== "object" || value === null) return false;
  const customer = value as Record<string, unknown>;
  return (
    typeof customer.id === "string" &&
    typeof customer.companyName === "string" &&
    typeof customer.picName === "string" &&
    typeof customer.phone === "string" &&
    typeof customer.email === "string" &&
    typeof customer.brand === "string" &&
    typeof customer.address === "string" &&
    (customer.status === "Aktif" || customer.status === "Nonaktif") &&
    typeof customer.notes === "string" &&
    typeof customer.totalOrders === "number" &&
    typeof customer.activeOrders === "number" &&
    typeof customer.joinedDate === "string"
  );
}

export function useCustomers(): [
  CustomerRecord[],
  Dispatch<SetStateAction<CustomerRecord[]>>,
] {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      const savedCustomers = window.localStorage.getItem(STORAGE_KEY);
      if (savedCustomers) {
        try {
          const parsed: unknown = JSON.parse(savedCustomers);
          if (Array.isArray(parsed) && parsed.every(isCustomerRecord)) {
            setCustomers(parsed.length > 0 ? parsed : DEMO_CUSTOMERS);
          } else {
            console.error("Format data pelanggan tersimpan tidak valid.");
          }
        } catch (error) {
          console.error("Data pelanggan tersimpan tidak dapat dibaca.", error);
        }
      } else {
        setCustomers(DEMO_CUSTOMERS);
      }
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loaded) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    }
  }, [customers, loaded]);

  return [customers, setCustomers];
}

export function createCustomerRecord(
  customer: NewCustomerRecord,
  existingCustomers: CustomerRecord[],
): CustomerRecord {
  const highestId = existingCustomers.reduce((highest, existingCustomer) => {
    const match = /^CUS-(\d+)$/.exec(existingCustomer.id);
    const idNumber = match ? Number(match[1]) : 0;
    return Number.isSafeInteger(idNumber) ? Math.max(highest, idNumber) : highest;
  }, 0);

  return {
    ...customer,
    id: `CUS-${String(highestId + 1).padStart(3, "0")}`,
    totalOrders: 0,
    activeOrders: 0,
    joinedDate: new Date().toISOString().slice(0, 10),
  };
}
