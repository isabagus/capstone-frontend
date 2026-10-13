"use client";

import { useState, type Dispatch, type SetStateAction } from "react";

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

export function useCustomers(): [
  CustomerRecord[],
  Dispatch<SetStateAction<CustomerRecord[]>>,
] {
  return useState<CustomerRecord[]>([]);
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
