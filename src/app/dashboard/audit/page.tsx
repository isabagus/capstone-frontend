"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  IconAudit,
  IconSearch,
  IconFilter,
  IconEye,
  IconShield,
  IconDownload,
  IconXCircle,
  IconInfo,
} from "@/components/icons/Icons";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  module: "INVENTORY" | "ORDERS" | "BOM" | "SPK" | "PRODUCTION" | "QC" | "INVOICES" | "USERS";
  action: "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "TRANSFER" | "INSPECT";
  description: string;
  recordId: string;
  hashChecksum: string;
  beforeData?: Record<string, any> | null;
  afterData?: Record<string, any> | null;
}

export default function AuditTrailPage() {
  const [filterModule, setFilterModule] = useState<string>("ALL");
  const [filterAction, setFilterAction] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const logs: AuditLogEntry[] = [
    {
      id: "AUD-99120",
      timestamp: "2026-09-24 14:32:10",
      userName: "Siti Rahmawati",
      userRole: "Quality Control",
      ipAddress: "192.168.1.45",
      module: "QC",
      action: "INSPECT",
      recordId: "QC-2026-0041",
      description: "Menyelesaikan inspeksi QC SPK-2026-0089: Status PASSED (5.000 Box Hardbox Ivory)",
      hashChecksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      beforeData: { status: "IN_INSPECTION", verified_by: null },
      afterData: { status: "PASSED", verified_by: "Siti Rahmawati", defective_count: 12, rework: false },
    },
    {
      id: "AUD-99119",
      timestamp: "2026-09-24 11:15:02",
      userName: "Budi Prakoso",
      userRole: "Kepala Produksi",
      ipAddress: "192.168.1.30",
      module: "PRODUCTION",
      action: "UPDATE",
      recordId: "PRD-2026-0089",
      description: "Memindahkan status Kanban SPK-2026-0089 dari 'Cetak Offset' ke 'Finishing & Pond'",
      hashChecksum: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
      beforeData: { stage: "PRINTING", machine: "Heidelberg SM 74", status: "RUNNING" },
      afterData: { stage: "FINISHING", machine: "Sanwa Die-cut", status: "PENDING_SETUP" },
    },
    {
      id: "AUD-99118",
      timestamp: "2026-09-24 09:45:18",
      userName: "Ahmad Fauzi",
      userRole: "Staf Gudang",
      ipAddress: "192.168.1.52",
      module: "INVENTORY",
      action: "TRANSFER",
      recordId: "TRF-2026-0023",
      description: "Transfer ACID 500 plano Ivory Board 300gsm dari Gudang Bahan Baku ke Gudang Produksi",
      hashChecksum: "5d41402abc4b2a76b9719d911017c592b02a927a7183e8b088b488730b923157",
      beforeData: { origin_qty: 3200, destination_qty: 150 },
      afterData: { origin_qty: 2700, destination_qty: 650 },
    },
    {
      id: "AUD-99117",
      timestamp: "2026-09-23 16:20:00",
      userName: "Maya Indah",
      userRole: "Front Office",
      ipAddress: "192.168.1.18",
      module: "ORDERS",
      action: "CREATE",
      recordId: "ORD-2026-0104",
      description: "Input Order Baru: 5.000 Pcs Hardbox Premium PT Kuliner Nusantara Sejahtera",
      hashChecksum: "cf51a84f3f4c1e4c92a95e7d58d929497d519b7a3a9686016c90538a7989d98e",
      beforeData: null,
      afterData: { order_number: "ORD-2026-0104", qty: 5000, is_express: false, revisions_used: 1 },
    },
    {
      id: "AUD-99116",
      timestamp: "2026-09-23 14:10:55",
      userName: "Dimas Aditya",
      userRole: "Tim Design & Prepress",
      ipAddress: "192.168.1.25",
      module: "BOM",
      action: "CREATE",
      recordId: "BOM-2026-0089",
      description: "Kalkulasi konversi plano ke potong & approval toleransi waste 4.8% untuk ORD-2026-0104",
      hashChecksum: "8a6358ff05e3f4c398327150117079e000494cf5bb6ec5bb72199b0c9f13615e",
      beforeData: null,
      afterData: { sheet_cut: 4, plano_needed: 1250, waste_pct: 4.8, insheet_sheets: 60 },
    },
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesModule = filterModule === "ALL" || log.module === filterModule;
    const matchesAction = filterAction === "ALL" || log.action === filterAction;
    const matchesSearch =
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesModule && matchesAction && matchesSearch;
  });

  const getActionBadge = (action: AuditLogEntry["action"]) => {
    switch (action) {
      case "CREATE":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#065F46]/10 text-[#065F46] dark:text-[#34D399]">CREATE</span>;
      case "UPDATE":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#2B5FC7]/10 text-[#2B5FC7] dark:text-[#3B6FE0]">UPDATE</span>;
      case "DELETE":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#991B1B]/10 text-[#991B1B] dark:text-[#F87171]">DELETE</span>;
      case "TRANSFER":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#854D0E]/10 text-[#854D0E] dark:text-[#FACC15]">TRANSFER</span>;
      case "INSPECT":
      case "APPROVE":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#2B5FC7]/15 text-[#2B5FC7] dark:text-[#3B6FE0]">VERIFIED</span>;
    }
  };

  return (
    <DashboardLayout title="Audit Trail & Log Forensik Sistem">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#2B5FC7]/10 dark:bg-[#3B6FE0]/15 text-[#2B5FC7] dark:text-[#3B6FE0]">
              <IconAudit size={20} />
            </span>
            Audit Trail & Log Transaksi Sistem
          </h1>
          <p className="text-xs text-[#6B7684] dark:text-[#8A94A6] mt-1">
            Rekam jejak forensik seluruh mutasi data operasional percetakan yang bersifat permanen, aman, dan tersinkronisasi SHA-256
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#065F46]/10 text-[#065F46] dark:text-[#34D399] text-xs font-semibold">
            <IconShield size={14} />
            <span>Immutable Ledger (SHA-256 Valid)</span>
          </div>

          <button className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] text-[#1B2436] dark:text-[#E8ECF3] hover:bg-[#F4F6FA] dark:hover:bg-[#1B2A44] transition-colors shadow-xs">
            <IconDownload size={14} />
            <span>Ekspor Audit Log</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Module Selector */}
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:outline-none"
          >
            <option value="ALL">Semua Modul</option>
            <option value="INVENTORY">Inventori & Stok</option>
            <option value="ORDERS">Order Pelanggan</option>
            <option value="BOM">BOM Calculator</option>
            <option value="SPK">SPK Digital</option>
            <option value="PRODUCTION">Produksi / Mesin</option>
            <option value="QC">Quality Control</option>
            <option value="INVOICES">Invoicing</option>
            <option value="USERS">Manajemen User</option>
          </select>

          {/* Action Selector */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:outline-none"
          >
            <option value="ALL">Semua Aksi</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="TRANSFER">TRANSFER</option>
            <option value="INSPECT">INSPECT / VERIFIED</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        <div className="relative max-w-xs w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B7684]">
            <IconSearch size={14} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari user, record ID, atau deskripsi..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:outline-none focus:border-[#2B5FC7]"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA] dark:bg-[#1B2A44] text-[11px] font-semibold text-[#6B7684] dark:text-[#8A94A6] uppercase tracking-wider">
              <th className="py-3 px-4">Waktu (WIB) & Log ID</th>
              <th className="py-3 px-4">Aktor Pengguna</th>
              <th className="py-3 px-4">Modul & Aksi</th>
              <th className="py-3 px-4">Deskripsi Aktivitas</th>
              <th className="py-3 px-4">Target Record</th>
              <th className="py-3 px-4 text-right">Detail Diff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-xs">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-mono font-medium text-[#1B2436] dark:text-[#E8ECF3]">{log.timestamp}</div>
                  <div className="text-[11px] font-mono text-[#6B7684] dark:text-[#8A94A6]">{log.id}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{log.userName}</div>
                  <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                    {log.userRole} &bull; <span className="font-mono">{log.ipAddress}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#2B5FC7] dark:text-[#3B6FE0] text-[11px]">{log.module}</span>
                    {getActionBadge(log.action)}
                  </div>
                </td>
                <td className="py-3 px-4 text-[#1B2436] dark:text-[#E8ECF3] max-w-md">
                  {log.description}
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-[#2B5FC7] dark:text-[#3B6FE0]">
                  {log.recordId}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => setSelectedLog(log)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] hover:text-[#2B5FC7] hover:border-[#2B5FC7] dark:text-[#8A94A6] dark:hover:text-[#3B6FE0] transition-colors"
                  >
                    <IconEye size={12} />
                    <span>Diff</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DIFF COMPARISON */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
              <div>
                <h3 className="font-bold text-sm text-[#1B2436] dark:text-[#E8ECF3] flex items-center gap-2">
                  <IconShield size={16} className="text-[#2B5FC7] dark:text-[#3B6FE0]" />
                  Detail Audit Trail: {selectedLog.id}
                </h3>
                <p className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                  Record ID: <strong className="font-mono text-[#2B5FC7] dark:text-[#3B6FE0]">{selectedLog.recordId}</strong> &bull; Aktor: {selectedLog.userName} ({selectedLog.userRole})
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-[#6B7684] hover:text-[#1B2436] dark:hover:text-[#E8ECF3]"
              >
                <IconXCircle size={18} />
              </button>
            </div>

            {/* SHA-256 Fingerprint */}
            <div className="p-3 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-xs">
              <span className="text-[#6B7684] dark:text-[#8A94A6] block text-[10px] uppercase font-semibold">
                SHA-256 Cryptographic Signature:
              </span>
              <span className="font-mono text-[11px] text-[#1B2436] dark:text-[#E8ECF3] break-all select-all">
                {selectedLog.hashChecksum}
              </span>
            </div>

            {/* Before vs After Diff Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Before */}
              <div className="p-3.5 rounded-xl border border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA]/50 dark:bg-[#1B2A44]/50 space-y-2">
                <span className="text-[11px] font-bold text-[#991B1B] dark:text-[#F87171] uppercase tracking-wide">
                  Keadaan Sebelum Perubahan (Before):
                </span>
                <pre className="font-mono text-[11px] bg-white dark:bg-[#16223A] p-3 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] overflow-x-auto text-[#1B2436] dark:text-[#E8ECF3]">
                  {selectedLog.beforeData
                    ? JSON.stringify(selectedLog.beforeData, null, 2)
                    : "-- Null (Data Baru Dibuat) --"}
                </pre>
              </div>

              {/* After */}
              <div className="p-3.5 rounded-xl border border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA]/50 dark:bg-[#1B2A44]/50 space-y-2">
                <span className="text-[11px] font-bold text-[#065F46] dark:text-[#34D399] uppercase tracking-wide">
                  Keadaan Sesudah Perubahan (After):
                </span>
                <pre className="font-mono text-[11px] bg-white dark:bg-[#16223A] p-3 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] overflow-x-auto text-[#1B2436] dark:text-[#E8ECF3]">
                  {selectedLog.afterData
                    ? JSON.stringify(selectedLog.afterData, null, 2)
                    : "-- Kosong --"}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
