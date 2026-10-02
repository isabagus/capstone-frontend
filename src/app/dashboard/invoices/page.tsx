"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  IconInvoice,
  IconSearch,
  IconFilter,
  IconEye,
  IconDownload,
  IconPrinter,
  IconCheckCircle,
  IconXCircle,
  IconDollar,
  IconPlus,
} from "@/components/icons/Icons";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  customerName: string;
  customerCompany: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: "LUNAS" | "DP_DITERIMA" | "BELUM_BAYAR" | "JATUH_TEMPO";
  itemsSummary: string;
}

export default function InvoicesPage() {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("BCA_TRANSFER");
  const [paymentNotes, setPaymentNotes] = useState<string>("");

  const invoices: InvoiceItem[] = [
    {
      id: "INV-2026-0089",
      invoiceNumber: "INV/2026/09/0089",
      orderNumber: "ORD-2026-0104",
      customerName: "Budi Santoso",
      customerCompany: "PT Kuliner Nusantara Sejahtera",
      issueDate: "2026-09-24",
      dueDate: "2026-10-08",
      amount: 14707500, // Rp 13.250.000 + PPN 11%
      paidAmount: 7000000,
      status: "DP_DITERIMA",
      itemsSummary: "5.000 Pcs Hardbox Premium Ivory 300gsm (Foil Emas)",
    },
    {
      id: "INV-2026-0088",
      invoiceNumber: "INV/2026/09/0088",
      orderNumber: "ORD-2026-0102",
      customerName: "Siti Aminah",
      customerCompany: "CV Herbal Alami Indonesia",
      issueDate: "2026-09-22",
      dueDate: "2026-10-06",
      amount: 6882000,
      paidAmount: 6882000,
      status: "LUNAS",
      itemsSummary: "3.000 Pcs Box Obat Herbal Duplex 350gsm + Doff",
    },
    {
      id: "INV-2026-0087",
      invoiceNumber: "INV/2026/09/0087",
      orderNumber: "ORD-2026-0099",
      customerName: "Hendra Wijaya",
      customerCompany: "PT Kosmetik Cantik Utama",
      issueDate: "2026-09-20",
      dueDate: "2026-09-24",
      amount: 28416000,
      paidAmount: 0,
      status: "JATUH_TEMPO",
      itemsSummary: "10.000 Pcs Sleeve Tube Lipcream Hot Stamping",
    },
    {
      id: "INV-2026-0086",
      invoiceNumber: "INV/2026/09/0086",
      orderNumber: "ORD-2026-0098",
      customerName: "Rian Pratama",
      customerCompany: "Kopi Senja Bahagia",
      issueDate: "2026-09-23",
      dueDate: "2026-10-07",
      amount: 4995000,
      paidAmount: 0,
      status: "BELUM_BAYAR",
      itemsSummary: "2.000 Pcs Paper Bag Craft Coklat 150gsm",
    },
  ];

  const filteredInvoices = invoices.filter((inv) => {
    const matchesFilter = filterStatus === "ALL" || inv.status === filterStatus;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerCompany.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPiutang = invoices.reduce((acc, curr) => acc + (curr.amount - curr.paidAmount), 0);
  const totalTerbayar = invoices.reduce((acc, curr) => acc + curr.paidAmount, 0);

  const getStatusBadge = (status: InvoiceItem["status"]) => {
    switch (status) {
      case "LUNAS":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#065F46]/10 text-[#065F46] dark:text-[#34D399]">LUNAS</span>;
      case "DP_DITERIMA":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#2B5FC7]/10 text-[#2B5FC7] dark:text-[#3B6FE0]">DP DITERIMA</span>;
      case "BELUM_BAYAR":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#854D0E]/10 text-[#854D0E] dark:text-[#FACC15]">BELUM BAYAR</span>;
      case "JATUH_TEMPO":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#991B1B]/10 text-[#991B1B] dark:text-[#F87171]">JATUH TEMPO</span>;
    }
  };

  return (
    <DashboardLayout title="Manajemen Invoice & Penagihan">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#2B5FC7]/10 dark:bg-[#3B6FE0]/15 text-[#2B5FC7] dark:text-[#3B6FE0]">
              <IconInvoice size={20} />
            </span>
            Manajemen Invoice & Penagihan
          </h1>
          <p className="text-xs text-[#6B7684] dark:text-[#8A94A6] mt-1">
            Faktur penjualan otomatis pasca inspeksi QC Passed dengan kalkulasi PPN 11% dan termin pembayaran
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] text-[#1B2436] dark:text-[#E8ECF3] hover:bg-[#F4F6FA] dark:hover:bg-[#1B2A44] transition-colors shadow-xs">
            <IconDownload size={14} />
            <span>Ekspor Rekap (Excel)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
          <div className="text-xs text-[#6B7684] dark:text-[#8A94A6]">Total Piutang Belum Lunas</div>
          <div className="text-xl font-bold text-[#991B1B] dark:text-[#F87171] mt-1 tracking-tight">
            Rp {totalPiutang.toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-1">Dari 3 faktur aktif</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
          <div className="text-xs text-[#6B7684] dark:text-[#8A94A6]">Total Kas Diterima (Bulan Ini)</div>
          <div className="text-xl font-bold text-[#065F46] dark:text-[#34D399] mt-1 tracking-tight">
            Rp {totalTerbayar.toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-[#065F46] dark:text-[#34D399] mt-1 font-medium">98% tepat waktu</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
          <div className="text-xs text-[#6B7684] dark:text-[#8A94A6]">Faktur Jatuh Tempo</div>
          <div className="text-xl font-bold text-[#854D0E] dark:text-[#FACC15] mt-1 tracking-tight">
            1 Faktur
          </div>
          <div className="text-[11px] text-[#854D0E] dark:text-[#FACC15] mt-1 font-medium">Perlu follow-up penagihan</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
          <div className="text-xs text-[#6B7684] dark:text-[#8A94A6]">Rata-rata Termin Pembayaran</div>
          <div className="text-xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mt-1 tracking-tight">
            14 Hari
          </div>
          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-1">Kebijakan standard B2B</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "DP_DITERIMA", "BELUM_BAYAR", "JATUH_TEMPO", "LUNAS"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === st
                  ? "bg-[#2B5FC7] dark:bg-[#3B6FE0] text-white shadow-xs"
                  : "bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6] hover:text-[#1B2436]"
              }`}
            >
              {st === "ALL" ? "Semua Status" : st.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B7684]">
            <IconSearch size={14} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari no invoice, pelanggan, atau SPK..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:outline-none focus:border-[#2B5FC7]"
          />
        </div>
      </div>

      {/* Invoice Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA] dark:bg-[#1B2A44] text-[11px] font-semibold text-[#6B7684] dark:text-[#8A94A6] uppercase tracking-wider">
              <th className="py-3 px-4">No. Invoice & Ref Order</th>
              <th className="py-3 px-4">Pelanggan / Perusahaan</th>
              <th className="py-3 px-4">Tanggal Terbit & Jatuh Tempo</th>
              <th className="py-3 px-4">Nilai Total (Inc. PPN)</th>
              <th className="py-3 px-4">Sisa Tagihan</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-xs">
            {filteredInvoices.map((inv) => {
              const sisa = inv.amount - inv.paidAmount;
              return (
                <tr key={inv.id} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#2B5FC7] dark:text-[#3B6FE0]">{inv.invoiceNumber}</div>
                    <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">{inv.orderNumber}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-[#1B2436] dark:text-[#E8ECF3]">{inv.customerCompany}</div>
                    <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">{inv.customerName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-[#1B2436] dark:text-[#E8ECF3]">{inv.issueDate}</div>
                    <div className="text-[11px] text-[#991B1B] dark:text-[#F87171]">JT: {inv.dueDate}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                    Rp {inv.amount.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold">
                    <span className={sisa > 0 ? "text-[#991B1B] dark:text-[#F87171]" : "text-[#065F46] dark:text-[#34D399]"}>
                      {sisa === 0 ? "LUNAS" : `Rp ${sisa.toLocaleString("id-ID")}`}
                    </span>
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(inv.status)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        title="Lihat Pratinjau Invoice"
                        className="p-1.5 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] hover:text-[#2B5FC7] hover:border-[#2B5FC7] transition-colors"
                      >
                        <IconEye size={14} />
                      </button>
                      {sisa > 0 && (
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setPaymentAmount(sisa);
                            setShowPaymentModal(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] text-white transition-colors"
                        >
                          Catat Bayar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL PREVIEW INVOICE */}
      {selectedInvoice && !showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#E2E6ED] dark:border-[#26334D] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconInvoice size={18} className="text-[#2B5FC7] dark:text-[#3B6FE0]" />
                <span className="font-bold text-sm text-[#1B2436] dark:text-[#E8ECF3]">
                  Pratinjau Faktur Penjualan: {selectedInvoice.invoiceNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E2E6ED] dark:border-[#26334D] hover:bg-[#F4F6FA] dark:hover:bg-[#1B2A44] transition-colors"
                >
                  <IconPrinter size={14} />
                  <span>Cetak</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 rounded-lg text-[#6B7684] hover:text-[#1B2436] dark:hover:text-[#E8ECF3]"
                >
                  <IconXCircle size={18} />
                </button>
              </div>
            </div>

            {/* Document Sheet Simulation */}
            <div className="p-8 overflow-y-auto space-y-6 text-[#1B2436] dark:text-[#E8ECF3] text-xs">
              {/* Kop Perusahaan */}
              <div className="flex justify-between items-start border-b border-[#E2E6ED] dark:border-[#26334D] pb-6">
                <div>
                  <div className="text-lg font-bold text-[#2B5FC7] dark:text-[#3B6FE0]">
                    CV SOLUSI INOVASI PACKAGING
                  </div>
                  <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-1 leading-relaxed">
                    Kawasan Industri Percetakan & Kemasan No. 18, Surabaya<br />
                    NPWP: 01.345.678.9-604.000 | Email: billing@packsolution.id
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-[#1B2436] dark:text-[#E8ECF3]">INVOICE</div>
                  <div className="text-xs font-mono font-semibold text-[#2B5FC7] dark:text-[#3B6FE0] mt-0.5">
                    {selectedInvoice.invoiceNumber}
                  </div>
                  <div className="mt-2">{getStatusBadge(selectedInvoice.status)}</div>
                </div>
              </div>

              {/* Tagihan Kepada & Tanggal */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-[11px] font-semibold text-[#6B7684] dark:text-[#8A94A6] uppercase">Ditujukan Kepada:</div>
                  <div className="font-bold text-sm mt-1">{selectedInvoice.customerCompany}</div>
                  <div className="text-[#6B7684] dark:text-[#8A94A6]">U.p. {selectedInvoice.customerName}</div>
                  <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-1">Ref No. Order: {selectedInvoice.orderNumber}</div>
                </div>
                <div className="space-y-1 text-right">
                  <div>
                    <span className="text-[#6B7684] dark:text-[#8A94A6]">Tanggal Terbit: </span>
                    <span className="font-semibold">{selectedInvoice.issueDate}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7684] dark:text-[#8A94A6]">Jatuh Tempo: </span>
                    <span className="font-bold text-[#991B1B] dark:text-[#F87171]">{selectedInvoice.dueDate}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7684] dark:text-[#8A94A6]">Termin Pembayaran: </span>
                    <span className="font-semibold">Net 14 Days</span>
                  </div>
                </div>
              </div>

              {/* Rincian Item */}
              <table className="w-full text-left border-collapse border border-[#E2E6ED] dark:border-[#26334D]">
                <thead>
                  <tr className="bg-[#F4F6FA] dark:bg-[#1B2A44] border-b border-[#E2E6ED] dark:border-[#26334D] text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                    <th className="p-3">Deskripsi Barang / Jasa Percetakan</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Harga Satuan</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D]">
                  <tr>
                    <td className="p-3">
                      <div className="font-semibold">{selectedInvoice.itemsSummary}</div>
                      <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                        Cetak Offset 4/0 Full Color, Laminasi Doff, Pond Die-cut, Perakitan Presisi
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono">5.000 Pcs</td>
                    <td className="p-3 text-right font-mono">Rp 2.650</td>
                    <td className="p-3 text-right font-mono font-semibold">Rp 13.250.000</td>
                  </tr>
                </tbody>
              </table>

              {/* Total Calculation */}
              <div className="flex justify-end">
                <div className="w-72 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#6B7684] dark:text-[#8A94A6]">Subtotal:</span>
                    <span className="font-mono font-medium">Rp 13.250.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7684] dark:text-[#8A94A6]">PPN 11%:</span>
                    <span className="font-mono font-medium">Rp 1.457.500</span>
                  </div>
                  <div className="border-t border-[#E2E6ED] dark:border-[#26334D] pt-2 flex justify-between font-bold text-sm text-[#2B5FC7] dark:text-[#3B6FE0]">
                    <span>Total Tagihan:</span>
                    <span className="font-mono">Rp {selectedInvoice.amount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#065F46] dark:text-[#34D399]">
                    <span>Uang Muka / DP Diterima:</span>
                    <span className="font-mono">- Rp {selectedInvoice.paidAmount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="border-t border-dashed border-[#E2E6ED] dark:border-[#26334D] pt-2 flex justify-between font-bold text-sm text-[#991B1B] dark:text-[#F87171]">
                    <span>Sisa Pelunasan:</span>
                    <span className="font-mono">
                      Rp {(selectedInvoice.amount - selectedInvoice.paidAmount).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rekening Pembayaran */}
              <div className="p-4 rounded-xl bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-xs">
                <div className="font-bold text-[#1B2436] dark:text-[#E8ECF3] mb-1">Instruksi Pembayaran Transfer:</div>
                <div className="text-[#6B7684] dark:text-[#8A94A6] leading-relaxed">
                  Bank BCA Rekening: <strong className="text-[#1B2436] dark:text-[#E8ECF3]">8290-192-888</strong> a.n CV Solusi Inovasi Packaging<br />
                  Bank Mandiri Rekening: <strong className="text-[#1B2436] dark:text-[#E8ECF3]">141-00-9821-4321</strong> a.n CV Solusi Inovasi Packaging<br />
                  Harap menyertakan nomor referensi invoice saat melakukan konfirmasi pembayaran.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CATAT PEMBAYARAN */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
              <div className="flex items-center gap-2">
                <IconDollar size={18} className="text-[#065F46] dark:text-[#34D399]" />
                <h3 className="font-bold text-sm text-[#1B2436] dark:text-[#E8ECF3]">
                  Catat Penerimaan Pembayaran
                </h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-[#6B7684] hover:text-[#1B2436] dark:hover:text-[#E8ECF3]"
              >
                <IconXCircle size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#6B7684] dark:text-[#8A94A6] mb-1">Faktur Invoice:</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedInvoice.invoiceNumber} (${selectedInvoice.customerCompany})`}
                  className="w-full px-3 py-2 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] font-medium text-[#1B2436] dark:text-[#E8ECF3]"
                />
              </div>

              <div>
                <label className="block text-[#6B7684] dark:text-[#8A94A6] mb-1">Nominal Pembayaran (Rp):</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] font-mono font-bold text-[#1B2436] dark:text-[#E8ECF3] focus:border-[#2B5FC7]"
                />
              </div>

              <div>
                <label className="block text-[#6B7684] dark:text-[#8A94A6] mb-1">Kanal / Rekening Bank:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]"
                >
                  <option value="BCA_TRANSFER">Bank BCA (8290-192-888)</option>
                  <option value="MANDIRI_TRANSFER">Bank Mandiri (141-00-9821-4321)</option>
                  <option value="KAS_TUNAI">Kas Tunai Kantor</option>
                </select>
              </div>

              <div>
                <label className="block text-[#6B7684] dark:text-[#8A94A6] mb-1">Catatan / No. Bukti Mutasi:</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Misal: Pelunasan via KlikBCA Ref #849102"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:border-[#2B5FC7]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E6ED] dark:border-[#26334D] flex justify-end gap-2">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] hover:bg-[#F4F6FA] dark:hover:bg-[#1B2A44]"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  alert(`Pembayaran Rp ${paymentAmount.toLocaleString("id-ID")} berhasil dibukukan!`);
                  setShowPaymentModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#065F46] hover:bg-[#047857] text-white shadow-xs"
              >
                Konfirmasi Simpan
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
