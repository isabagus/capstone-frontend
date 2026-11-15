"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useBrands } from "@/hooks/useInventoryData";
import {
  useCustomerMaster,
  useVendorMaster,
  useProductionPicMaster,
  getTodayIsoDate,
  getFutureIsoDate,
} from "@/services/partnerMasterStore";
import { syncSpkToKanban, appendAuditLog } from "@/services/operationalStore";
import apiClient from "@/lib/apiClient";
import { QrCodeSvg } from "@/utils/qrCodeGenerator";
import {
  IconSpk,
  IconWarehouse,
  IconCheck,
  IconX,
  IconGear,
  IconPrinter,
  IconEye,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
} from "@/components/icons/Icons";

export interface SpkWarehouseStockItem {
  sku: string;
  materialName: string;
  warehouseLocation: string;
  rackCode: string;
  qtyRequired: string;
  availableStock: string;
  prepared: boolean;
}

export interface SpkDocument {
  id: string;
  spkNumber: string;
  orderNumber: string;
  type: "Internal" | "Eksternal (Vendor Mitra)";
  targetVendor: string;
  brand: string;
  // Field sesuai Referensi SPK di folder SPK/
  folderName: string;
  customerName: string;
  jobName: string;
  specialMaterialBadge?: string; // misal: "ALUFOIL"
  orderDate: string;
  orderTime: string;
  deadline: string;
  pickupMethod: "Diambil" | "Dikirim ke Vendor";
  receiptNumber: string;
  operatorName: string;
  // Bagian BAHAN
  bahanSource: "Bahan Martin" | "Bahan Sendiri";
  jenisBahan: string;
  jumlahBahanPlano: number;
  jumlahKertasLembar: number;
  dipotongJadi: number; // misal 9 atau 4
  cutGridCols: number;
  cutGridRows: number;
  layoutMataLabel?: string; // misal "LAYOUT 1 MATA"
  ukuranJadi: string;
  ukuranFile: string;
  untukCetakan: string;
  untukCetakanSub?: string;
  strukPolicy: "Tidak Dibawa Pulang" | "Dibawa Pulang";
  // Bagian CETAK
  cetakMesin: string;
  cetakSet: number;
  cetakModel: string; // misal "4/0"
  cetakOrderLembar: string; // misal "1000 Lembar cetakan"
  cetakInsheet: number;
  cetakJumlahPlat: number;
  cetakKeterangan: string;
  acuanWarna: string;
  // Bagian LAMINASI
  jenisLaminasi: string;
  tipeLaminasi: string;
  laminasiMuka: string;
  laminasiKeterangan?: string;
  finishingCalloutBoxes: string[]; // misal ["+LAMINASI SPOT UV", "+FOIL RG 603"]
  // Bagian PACKING & BIAYA
  jenisPacking: string;
  rincianBiaya: {
    bahan: string;
    cetak: string;
    biayaPotongBahan: string;
    overprint: string;
    potong: string;
    laminasi: string;
    uvSpot: string;
    proff: string;
  };
  status: "Draft" | "Terbit" | "Stok Gudang Siap" | "In-Production" | "Selesai";
  warehouseChecklist: SpkWarehouseStockItem[];
}

const SPK_STORAGE_KEY = "sip_spk_documents_v1";

const REFERENCE_SPKS: SpkDocument[] = [
  {
    id: "1",
    spkNumber: "SPK-EKS-2026-0078",
    orderNumber: "INV20260078",
    type: "Eksternal (Vendor Mitra)",
    targetVendor: "Vendor Offset Komori",
    brand: "Pepipapier",
    folderName: "\\\\PPSgroup\\Pepipapier.id\\2026\\.JOB\\INV20260078 - SOFTBOX GIVRE - clara",
    customerName: "pepipapier",
    jobName: "pepipapier_LAYOUT_INV20260078 - SOFTBOX GIVRE - clara#310826",
    orderDate: "2026-08-31",
    orderTime: "09:30 WIB",
    deadline: getFutureIsoDate(2),
    pickupMethod: "Diambil",
    receiptNumber: "TT-2026-0078",
    operatorName: "Rudi Hartono",
    bahanSource: "Bahan Martin",
    jenisBahan: "Ivory 300gr (79x109)",
    jumlahBahanPlano: 123,
    jumlahKertasLembar: 1107,
    dipotongJadi: 9,
    cutGridCols: 3,
    cutGridRows: 3,
    ukuranJadi: "33 X 25",
    ukuranFile: "31 X 23.8",
    untukCetakan: "SOFTBOX GIVRE - clara#310826_uk 15 x 3.5 x 6 cm",
    strukPolicy: "Tidak Dibawa Pulang",
    cetakMesin: "SM 52",
    cetakSet: 1,
    cetakModel: "4/0",
    cetakOrderLembar: "1000 Lembar cetakan",
    cetakInsheet: 100,
    cetakJumlahPlat: 4,
    cetakKeterangan: "-",
    acuanWarna: "Standart Martin / Indicator",
    jenisLaminasi: "THERMAL",
    tipeLaminasi: "Laminasi DOFF",
    laminasiMuka: "2 Muka",
    laminasiKeterangan: "",
    finishingCalloutBoxes: [],
    jenisPacking: "Bungkus",
    rincianBiaya: {
      bahan: "Rp 1.845.000",
      cetak: "Rp 650.000",
      biayaPotongBahan: "Rp 120.000",
      overprint: "-",
      potong: "Rp 150.000",
      laminasi: "Rp 440.000",
      uvSpot: "-",
      proff: "Rp 75.000",
    },
    status: "Terbit",
    warehouseChecklist: [
      {
        sku: "MAT-IV-300",
        materialName: "Kertas Ivory 300gr Plano (79×109 cm)",
        warehouseLocation: "Gudang 1 (Pabrik Utama)",
        rackCode: "Rak A-01 (Baris Plano Ivory)",
        qtyRequired: "123 Lembar Plano (Dipotong 9 = 1.107 Lbr ukuran 33×25 cm)",
        availableStock: "40 Rim (20.000 Lbr Plano) — Tersedia",
        prepared: true,
      },
      {
        sku: "LAM-TH-DOFF",
        materialName: "Roll Film Laminasi Thermal Doff (2 Muka)",
        warehouseLocation: "Gudang 1 (Pabrik Utama)",
        rackCode: "Rak C-04 (Bahan Laminasi)",
        qtyRequired: "1 Roll (Alokasi 1.107 Lbr Cetak)",
        availableStock: "18 Roll — Tersedia",
        prepared: true,
      },
    ],
  },
  {
    id: "2",
    spkNumber: "SPK-EKS-2026-0813",
    orderNumber: "ORD-2026-0813",
    type: "Eksternal (Vendor Mitra)",
    targetVendor: "Vendor Foil & Emboss Kurnia",
    brand: "Packsolution.id",
    folderName: "GUSSET JAVANEGRA - 200GR",
    customerName: "sgp",
    jobName: "sgp_LAYOUT_ENREKANG BEANS 200GR#130826",
    specialMaterialBadge: "ALUFOIL",
    orderDate: "2026-08-13",
    orderTime: "10:15 WIB",
    deadline: getFutureIsoDate(3),
    pickupMethod: "Diambil",
    receiptNumber: "TT-2026-0813",
    operatorName: "Wahyu Pratama",
    bahanSource: "Bahan Sendiri",
    jenisBahan: "AP 100gr (65x100)",
    jumlahBahanPlano: 575,
    jumlahKertasLembar: 2300,
    dipotongJadi: 4,
    cutGridCols: 2,
    cutGridRows: 2,
    layoutMataLabel: "LAYOUT 1 MATA",
    ukuranJadi: "43x30",
    ukuranFile: "42x28.2",
    untukCetakan: "GFB ENREKANG BEANS 200GR 12.5x19.5x7.5 ALUFOIL",
    untukCetakanSub: "(Ziplock Pocket + Valve)",
    strukPolicy: "Dibawa Pulang",
    cetakMesin: "KOMORI",
    cetakSet: 1,
    cetakModel: "4/0",
    cetakOrderLembar: "2100 Lembar cetakan",
    cetakInsheet: 200,
    cetakJumlahPlat: 4,
    cetakKeterangan: "4 Varian (Enrekang Beans/Ground, Kintamani Beans/Ground)",
    acuanWarna: "Standart Martin / Indicator",
    jenisLaminasi: "THERMAL",
    tipeLaminasi: "Laminasi DOFF",
    laminasiMuka: "1 Muka",
    laminasiKeterangan: "+ WATERBASE GLOSSY",
    finishingCalloutBoxes: ["+LAMINASI SPOT UV", "+FOIL RG 603"],
    jenisPacking: "Bungkus",
    rincianBiaya: {
      bahan: "Rp 4.025.000",
      cetak: "Rp 1.250.000",
      biayaPotongBahan: "Rp 180.000",
      overprint: "Rp 350.000",
      potong: "Rp 200.000",
      laminasi: "Rp 690.000",
      uvSpot: "Rp 850.000",
      proff: "Rp 100.000",
    },
    status: "In-Production",
    warehouseChecklist: [
      {
        sku: "MAT-AP-100",
        materialName: "Art Paper 100gr Plano (65×100 cm)",
        warehouseLocation: "Gudang 1 (Pabrik Utama)",
        rackCode: "Rak A-03 (Baris Art Paper)",
        qtyRequired: "575 Lembar Plano (Dipotong 4 = 2.300 Lbr ukuran 43×30 cm)",
        availableStock: "32 Rim (16.000 Lbr Plano) — Tersedia",
        prepared: true,
      },
      {
        sku: "FOIL-RG-603",
        materialName: "Hot Stamping Foil RG 603 (Rose Gold Metallic)",
        warehouseLocation: "Gudang 2 (Ruko Transit)",
        rackCode: "Rak B-02 (Foil & Kimia)",
        qtyRequired: "2 Roll (Untuk Subkontrak Vendor Foil Kurnia)",
        availableStock: "28 Roll — Tersedia",
        prepared: true,
      },
      {
        sku: "ACC-ZPL-VLV",
        materialName: "Pouch Alufoil Gusset + Ziplock Pocket & Degassing Valve",
        warehouseLocation: "Gudang 2 (Ruko Transit)",
        rackCode: "Rak D-01 (Komponen Kemasan Kopi)",
        availableStock: "9.500 Pcs — Tersedia",
        qtyRequired: "2.100 Pcs (+200 Insheet)",
        prepared: false,
      },
    ],
  },
  {
    id: "3",
    spkNumber: "SPK-INT-2026-0082",
    orderNumber: "ORD-2026-0902",
    type: "Internal",
    targetVendor: "Produksi Mandiri (Internal)",
    brand: "Estella",
    folderName: "\\\\PPSgroup\\Estella\\2026\\.JOB\\ORD-2026-0902 - SOFTBOX SERUM",
    customerName: "Estella Glow Skincare",
    jobName: "estella_LAYOUT_ORD20260902 - SOFTBOX SERUM MATTE DOFF#240926",
    orderDate: "2026-09-24",
    orderTime: "11:00 WIB",
    deadline: getFutureIsoDate(4),
    pickupMethod: "Diambil",
    receiptNumber: "TT-2026-0902",
    operatorName: "Joko Santoso",
    bahanSource: "Bahan Sendiri",
    jenisBahan: "Kraft Liner 275gr (79x109)",
    jumlahBahanPlano: 650,
    jumlahKertasLembar: 5200,
    dipotongJadi: 8,
    cutGridCols: 4,
    cutGridRows: 2,
    ukuranJadi: "26 X 38",
    ukuranFile: "24 X 36",
    untukCetakan: "SOFTBOX SKINCARE SERUM MATTE DOFF_uk 12 x 5 x 5 cm",
    strukPolicy: "Tidak Dibawa Pulang",
    cetakMesin: "SM 74",
    cetakSet: 1,
    cetakModel: "4/0",
    cetakOrderLembar: "5000 Lembar cetakan",
    cetakInsheet: 200,
    cetakJumlahPlat: 4,
    cetakKeterangan: "Tinta putih pekat di atas permukaan Kraft",
    acuanWarna: "Standart Martin / Indicator",
    jenisLaminasi: "THERMAL",
    tipeLaminasi: "Laminasi DOFF",
    laminasiMuka: "1 Muka",
    laminasiKeterangan: "",
    finishingCalloutBoxes: ["+EMBOSS LOGO"],
    jenisPacking: "Bungkus",
    rincianBiaya: {
      bahan: "Rp 5.200.000",
      cetak: "Rp 1.800.000",
      biayaPotongBahan: "Rp 150.000",
      overprint: "-",
      potong: "Rp 200.000",
      laminasi: "Rp 950.000",
      uvSpot: "-",
      proff: "Rp 75.000",
    },
    status: "Terbit",
    warehouseChecklist: [
      {
        sku: "MAT-KRF-275",
        materialName: "Kraft Liner Brown 275gr Plano (79×109 cm)",
        warehouseLocation: "Gudang 2 (Ruko Transit)",
        rackCode: "Rak B-03 (Kraft & Duplex)",
        qtyRequired: "650 Lembar Plano (Dipotong 8 = 5.200 Lbr ukuran 26×38 cm)",
        availableStock: "16 Rim (8.000 Lbr Plano) — Tersedia",
        prepared: true,
      },
    ],
  },
];

function computeGridDimensions(dipotongJadi: number): { cols: number; rows: number } {
  if (dipotongJadi <= 1) return { cols: 1, rows: 1 };
  if (dipotongJadi === 2) return { cols: 2, rows: 1 };
  if (dipotongJadi === 4) return { cols: 2, rows: 2 };
  if (dipotongJadi === 6) return { cols: 3, rows: 2 };
  if (dipotongJadi === 8) return { cols: 4, rows: 2 };
  if (dipotongJadi === 9) return { cols: 3, rows: 3 };
  if (dipotongJadi === 12) return { cols: 4, rows: 3 };
  const cols = Math.ceil(Math.sqrt(dipotongJadi));
  const rows = Math.ceil(dipotongJadi / cols);
  return { cols, rows };
}

function buildAutoWarehouseChecklist(
  jenisBahan: string,
  jumlahBahanPlano: number,
  dipotongJadi: number,
  ukuranJadi: string,
  tipeLaminasi: string,
  laminasiMuka: string,
  calloutBoxes: string[]
): SpkWarehouseStockItem[] {
  const totalPotong = jumlahBahanPlano * dipotongJadi;
  const items: SpkWarehouseStockItem[] = [
    {
      sku: jenisBahan.toLowerCase().includes("ivory")
        ? "MAT-IV-300"
        : jenisBahan.toLowerCase().includes("kraft")
        ? "MAT-KRF-275"
        : "MAT-AP-150",
      materialName: `Kertas Plano ${jenisBahan}`,
      warehouseLocation: "Gudang 1 (Pabrik Utama)",
      rackCode: "Rak A-01 (Zona Plano Utama)",
      qtyRequired: `${jumlahBahanPlano} Lembar Plano (Dipotong ${dipotongJadi} = ${totalPotong.toLocaleString("id-ID")} Lbr ukuran ${ukuranJadi} cm)`,
      availableStock: "Stok Gudang Mencukupi — Tersedia",
      prepared: false,
    },
  ];

  if (tipeLaminasi && tipeLaminasi !== "Tanpa Laminasi") {
    items.push({
      sku: "LAM-TH-01",
      materialName: `Roll Film ${tipeLaminasi} (${laminasiMuka})`,
      warehouseLocation: "Gudang 1 (Pabrik Utama)",
      rackCode: "Rak C-04 (Bahan Laminasi)",
      qtyRequired: `1 Roll (Alokasi ${totalPotong.toLocaleString("id-ID")} Lbr Cetak)`,
      availableStock: "18 Roll — Tersedia",
      prepared: false,
    });
  }

  calloutBoxes.forEach((box, idx) => {
    if (box.trim()) {
      items.push({
        sku: `FIN-0${idx + 1}`,
        materialName: `Bahan Finishing ${box.replace("+", "")}`,
        warehouseLocation: "Gudang 2 (Ruko Transit)",
        rackCode: "Rak B-02 (Foil & Kimia Finishing)",
        qtyRequired: `Alokasi sesuai order (${totalPotong.toLocaleString("id-ID")} Lbr)`,
        availableStock: "Tersedia di Gudang 2",
        prepared: false,
      });
    }
  });

  return items;
}

export default function SpkDigitalPage() {
  const [spkList, setSpkList] = useState<SpkDocument[]>(() => {
    if (typeof window === "undefined") return REFERENCE_SPKS;
    try {
      const saved = localStorage.getItem(SPK_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return REFERENCE_SPKS;
  });

  const saveSpkList = (next: SpkDocument[]) => {
    setSpkList(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SPK_STORAGE_KEY, JSON.stringify(next));
      } catch {}
    }
  };

  const [selectedSpk, setSelectedSpk] = useState<SpkDocument>(REFERENCE_SPKS[0]);

  const dynamicBrands = useBrands();
  const { customers } = useCustomerMaster();
  const { vendors } = useVendorMaster();
  const { pics } = useProductionPicMaster();
  const activePics = pics.filter((p) => p.active);
  const activeVendors = vendors.filter((v) => v.active);

  // Filters
  const [filterType, setFilterType] = useState<string>("Semua");
  const [filterBrand, setFilterBrand] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals: Preview, QR Gudang, Create/Edit CRUD Modal, Confirm Delete
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showWarehouseQrModal, setShowWarehouseQrModal] = useState<boolean>(false);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingSpk, setEditingSpk] = useState<SpkDocument | null>(null);
  const [spkToDelete, setSpkToDelete] = useState<SpkDocument | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const todayIso = getTodayIsoDate();

  // State Form CRUD SPK (Create & Update)
  const [formData, setFormData] = useState({
    spkNumber: "",
    orderNumber: "",
    type: "Eksternal (Vendor Mitra)" as SpkDocument["type"],
    targetVendor: activeVendors[0]?.name || "Vendor Offset Komori",
    brand: "Pepipapier",
    folderName: "",
    customerName: "",
    jobName: "",
    specialMaterialBadge: "",
    orderDate: todayIso,
    orderTime: "09:30 WIB",
    deadline: getFutureIsoDate(3),
    pickupMethod: "Diambil" as SpkDocument["pickupMethod"],
    receiptNumber: "",
    operatorName: activePics[0]?.name || "Rudi Hartono",
    bahanSource: "Bahan Martin" as SpkDocument["bahanSource"],
    jenisBahan: "Ivory 300gr (79x109)",
    jumlahBahanPlano: 123,
    dipotongJadi: 9,
    layoutMataLabel: "LAYOUT 1 MATA",
    ukuranJadi: "33 X 25",
    ukuranFile: "31 X 23.8",
    untukCetakan: "",
    untukCetakanSub: "",
    strukPolicy: "Tidak Dibawa Pulang" as SpkDocument["strukPolicy"],
    cetakMesin: "SM 52",
    cetakSet: 1,
    cetakModel: "4/0",
    cetakOrderLembar: "1000 Lembar cetakan",
    cetakInsheet: 100,
    cetakJumlahPlat: 4,
    cetakKeterangan: "-",
    acuanWarna: "Standart Martin / Indicator",
    jenisLaminasi: "THERMAL",
    tipeLaminasi: "Laminasi DOFF",
    laminasiMuka: "2 Muka",
    laminasiKeterangan: "",
    finishingCalloutText: "+LAMINASI SPOT UV, +FOIL RG 603",
    jenisPacking: "Bungkus",
    biayaBahan: "Rp 1.845.000",
    biayaCetak: "Rp 650.000",
    biayaPotongBahan: "Rp 120.000",
    biayaOverprint: "-",
    biayaPotong: "Rp 150.000",
    biayaLaminasi: "Rp 440.000",
    biayaUvSpot: "-",
    biayaProff: "Rp 75.000",
    status: "Terbit" as SpkDocument["status"],
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Deteksi otomatis apabila URL dibuka dari hasil scan QR Code Staf Gudang (?qr_gudang=SPK-...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const qrSpkCode = params.get("qr_gudang");
    if (qrSpkCode) {
      const found = spkList.find(
        (s) => s.spkNumber.toLowerCase() === qrSpkCode.toLowerCase()
      );
      if (found) {
        setSelectedSpk(found);
        setShowWarehouseQrModal(true);
      }
    }
  }, [spkList]);

  const getWarehouseQrUrl = (spkNumber: string) => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    return `${origin}/dashboard/spk?qr_gudang=${encodeURIComponent(spkNumber)}`;
  };

  const openCreateModal = () => {
    setEditingSpk(null);
    const randomNum = Math.floor(Math.random() * 9000 + 1000);
    setFormData({
      spkNumber: `SPK-EKS-2026-${randomNum}`,
      orderNumber: `INV2026${randomNum}`,
      type: "Eksternal (Vendor Mitra)",
      targetVendor: activeVendors[0]?.name || "Vendor Offset Komori",
      brand: dynamicBrands[0] || "Pepipapier",
      folderName: `\\\\PPSgroup\\Pepipapier.id\\2026\\.JOB\\INV2026${randomNum} - SOFTBOX CUSTOM`,
      customerName: customers[0]?.name || "pepipapier",
      jobName: `pepipapier_LAYOUT_INV2026${randomNum} - SOFTBOX CUSTOM`,
      specialMaterialBadge: "",
      orderDate: todayIso,
      orderTime: "09:30 WIB",
      deadline: getFutureIsoDate(3),
      pickupMethod: "Diambil",
      receiptNumber: `TT-2026-${randomNum}`,
      operatorName: activePics[0]?.name || "Rudi Hartono",
      bahanSource: "Bahan Martin",
      jenisBahan: "Ivory 300gr (79x109)",
      jumlahBahanPlano: 123,
      dipotongJadi: 9,
      layoutMataLabel: "LAYOUT 1 MATA",
      ukuranJadi: "33 X 25",
      ukuranFile: "31 X 23.8",
      untukCetakan: "SOFTBOX CUSTOM_uk 15 x 3.5 x 6 cm",
      untukCetakanSub: "",
      strukPolicy: "Tidak Dibawa Pulang",
      cetakMesin: "SM 52",
      cetakSet: 1,
      cetakModel: "4/0",
      cetakOrderLembar: "1000 Lembar cetakan",
      cetakInsheet: 100,
      cetakJumlahPlat: 4,
      cetakKeterangan: "-",
      acuanWarna: "Standart Martin / Indicator",
      jenisLaminasi: "THERMAL",
      tipeLaminasi: "Laminasi DOFF",
      laminasiMuka: "2 Muka",
      laminasiKeterangan: "",
      finishingCalloutText: "+LAMINASI SPOT UV, +FOIL RG 603",
      jenisPacking: "Bungkus",
      biayaBahan: "Rp 1.845.000",
      biayaCetak: "Rp 650.000",
      biayaPotongBahan: "Rp 120.000",
      biayaOverprint: "-",
      biayaPotong: "Rp 150.000",
      biayaLaminasi: "Rp 440.000",
      biayaUvSpot: "-",
      biayaProff: "Rp 75.000",
      status: "Terbit",
    });
    setShowFormModal(true);
  };

  const openEditModal = (spk: SpkDocument) => {
    setEditingSpk(spk);
    setFormData({
      spkNumber: spk.spkNumber,
      orderNumber: spk.orderNumber,
      type: spk.type,
      targetVendor: spk.targetVendor,
      brand: spk.brand,
      folderName: spk.folderName,
      customerName: spk.customerName,
      jobName: spk.jobName,
      specialMaterialBadge: spk.specialMaterialBadge || "",
      orderDate: spk.orderDate,
      orderTime: spk.orderTime,
      deadline: spk.deadline,
      pickupMethod: spk.pickupMethod,
      receiptNumber: spk.receiptNumber,
      operatorName: spk.operatorName,
      bahanSource: spk.bahanSource,
      jenisBahan: spk.jenisBahan,
      jumlahBahanPlano: spk.jumlahBahanPlano,
      dipotongJadi: spk.dipotongJadi,
      layoutMataLabel: spk.layoutMataLabel || "",
      ukuranJadi: spk.ukuranJadi,
      ukuranFile: spk.ukuranFile,
      untukCetakan: spk.untukCetakan,
      untukCetakanSub: spk.untukCetakanSub || "",
      strukPolicy: spk.strukPolicy,
      cetakMesin: spk.cetakMesin,
      cetakSet: spk.cetakSet,
      cetakModel: spk.cetakModel,
      cetakOrderLembar: spk.cetakOrderLembar,
      cetakInsheet: spk.cetakInsheet,
      cetakJumlahPlat: spk.cetakJumlahPlat,
      cetakKeterangan: spk.cetakKeterangan,
      acuanWarna: spk.acuanWarna,
      jenisLaminasi: spk.jenisLaminasi,
      tipeLaminasi: spk.tipeLaminasi,
      laminasiMuka: spk.laminasiMuka,
      laminasiKeterangan: spk.laminasiKeterangan || "",
      finishingCalloutText: spk.finishingCalloutBoxes.join(", "),
      jenisPacking: spk.jenisPacking,
      biayaBahan: spk.rincianBiaya.bahan,
      biayaCetak: spk.rincianBiaya.cetak,
      biayaPotongBahan: spk.rincianBiaya.biayaPotongBahan,
      biayaOverprint: spk.rincianBiaya.overprint,
      biayaPotong: spk.rincianBiaya.potong,
      biayaLaminasi: spk.rincianBiaya.laminasi,
      biayaUvSpot: spk.rincianBiaya.uvSpot,
      biayaProff: spk.rincianBiaya.proff,
      status: spk.status,
    });
    setShowFormModal(true);
  };

  const handleSaveSpk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deadline || formData.deadline < todayIso) {
      alert("Tanggal deadline wajib diisi dan tidak boleh tanggal yang sudah lewat.");
      return;
    }

    const { cols, rows } = computeGridDimensions(Number(formData.dipotongJadi) || 1);
    const jumlahKertasLembar =
      (Number(formData.jumlahBahanPlano) || 1) * (Number(formData.dipotongJadi) || 1);
    const calloutBoxes = formData.finishingCalloutText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: SpkDocument = {
      id: editingSpk ? editingSpk.id : `spk-${Date.now()}`,
      spkNumber: formData.spkNumber,
      orderNumber: formData.orderNumber,
      type: formData.type,
      targetVendor:
        formData.type === "Internal" ? "Produksi Mandiri (Internal)" : formData.targetVendor,
      brand: formData.brand,
      folderName: formData.folderName,
      customerName: formData.customerName,
      jobName: formData.jobName,
      specialMaterialBadge: formData.specialMaterialBadge || undefined,
      orderDate: formData.orderDate,
      orderTime: formData.orderTime,
      deadline: formData.deadline,
      pickupMethod: formData.pickupMethod,
      receiptNumber: formData.receiptNumber,
      operatorName: formData.operatorName,
      bahanSource: formData.bahanSource,
      jenisBahan: formData.jenisBahan,
      jumlahBahanPlano: Number(formData.jumlahBahanPlano) || 1,
      jumlahKertasLembar,
      dipotongJadi: Number(formData.dipotongJadi) || 1,
      cutGridCols: cols,
      cutGridRows: rows,
      layoutMataLabel: formData.layoutMataLabel || undefined,
      ukuranJadi: formData.ukuranJadi,
      ukuranFile: formData.ukuranFile,
      untukCetakan: formData.untukCetakan,
      untukCetakanSub: formData.untukCetakanSub || undefined,
      strukPolicy: formData.strukPolicy,
      cetakMesin: formData.cetakMesin,
      cetakSet: Number(formData.cetakSet) || 1,
      cetakModel: formData.cetakModel,
      cetakOrderLembar: formData.cetakOrderLembar,
      cetakInsheet: Number(formData.cetakInsheet) || 0,
      cetakJumlahPlat: Number(formData.cetakJumlahPlat) || 4,
      cetakKeterangan: formData.cetakKeterangan,
      acuanWarna: formData.acuanWarna,
      jenisLaminasi: formData.jenisLaminasi,
      tipeLaminasi: formData.tipeLaminasi,
      laminasiMuka: formData.laminasiMuka,
      laminasiKeterangan: formData.laminasiKeterangan || undefined,
      finishingCalloutBoxes: calloutBoxes,
      jenisPacking: formData.jenisPacking,
      rincianBiaya: {
        bahan: formData.biayaBahan,
        cetak: formData.biayaCetak,
        biayaPotongBahan: formData.biayaPotongBahan,
        overprint: formData.biayaOverprint,
        potong: formData.biayaPotong,
        laminasi: formData.biayaLaminasi,
        uvSpot: formData.biayaUvSpot,
        proff: formData.biayaProff,
      },
      status: formData.status,
      warehouseChecklist: editingSpk
        ? editingSpk.warehouseChecklist
        : buildAutoWarehouseChecklist(
            formData.jenisBahan,
            Number(formData.jumlahBahanPlano) || 1,
            Number(formData.dipotongJadi) || 1,
            formData.ukuranJadi,
            formData.tipeLaminasi,
            formData.laminasiMuka,
            calloutBoxes
          ),
    };

    const parsedQty = Number(String(formData.cetakOrderLembar).replace(/\D/g, "")) || jumlahKertasLembar;
    syncSpkToKanban({
      spkNumber: payload.spkNumber,
      orderNumber: payload.orderNumber,
      customerName: payload.customerName,
      brand: payload.brand,
      productName: payload.untukCetakan,
      quantity: parsedQty,
      deadline: payload.deadline,
      machineOrVendor:
        payload.type === "Internal" ? `Mesin ${payload.cetakMesin}` : payload.targetVendor,
      picName: payload.operatorName,
      status: payload.status,
    });

    // Sinkronisasi ke Backend API (/api/v1/spk) secara asinkron (graceful fallback ke LocalStorage)
    const apiPayload = {
      spk_number: payload.spkNumber,
      order_number: payload.orderNumber,
      folder_name: payload.folderName,
      job_name: payload.jobName,
      customer_name: payload.customerName,
      type: payload.type === "Internal" ? "INTERNAL" : "EXTERNAL",
      delivery_type: payload.pickupMethod === "Dikirim ke Vendor" ? "DIKIRIM" : "DIAMBIL",
      receipt_number: payload.receiptNumber,
      color_standard: payload.acuanWarna,
      packing_type: payload.jenisPacking,
      order_quantity: parsedQty,
      publish_date: payload.orderDate,
      deadline: payload.deadline,
      status:
        payload.status === "Draft"
          ? "DRAFT"
          : payload.status === "In-Production"
          ? "IN_PRODUCTION"
          : payload.status === "Selesai"
          ? "SELESAI"
          : "TERBIT",
      finishing_details: {
        jenis_laminasi: payload.jenisLaminasi,
        tipe_laminasi: payload.tipeLaminasi,
        muka: payload.laminasiMuka,
        callout: payload.finishingCalloutBoxes,
      },
      cost_breakdown: payload.rincianBiaya,
      notes: payload.cetakKeterangan,
      materials: [
        {
          source_type: payload.bahanSource.includes("Konsumen") ? "BAHAN_KONSUMEN" : "GUDANG",
          material_name: payload.jenisBahan,
          plano_sheets: payload.jumlahBahanPlano,
          cuts_per_plano: payload.dipotongJadi,
          cut_sheets: payload.jumlahKertasLembar,
          cut_size: payload.ukuranJadi,
          file_size: payload.ukuranFile,
          target_product: payload.untukCetakan,
          total_quantity: payload.jumlahBahanPlano,
          unit: "Plano",
        },
      ],
    };

    if (editingSpk) {
      const next = spkList.map((s) => (s.id === editingSpk.id ? payload : s));
      saveSpkList(next);
      setSelectedSpk(payload);
      const numericId = Number(String(editingSpk.id).replace(/\D/g, ""));
      if (numericId) {
        apiClient.put(`/v1/spk/${numericId}`, apiPayload).catch(() => {});
      }
      appendAuditLog({
        module: "SPK",
        action: "UPDATE",
        recordId: payload.spkNumber,
        description: `Memperbarui Dokumen SPK ${payload.spkNumber} (${payload.untukCetakan}) & menyinkronkan ke Kanban Produksi`,
        beforeData: { status: editingSpk.status, vendor: editingSpk.targetVendor },
        afterData: { status: payload.status, vendor: payload.targetVendor, plano: payload.jumlahBahanPlano },
      });
      triggerToast(`SPK ${payload.spkNumber} berhasil diperbarui & disinkronkan ke Backend + Kanban Produksi!`);
    } else {
      const next = [payload, ...spkList];
      saveSpkList(next);
      setSelectedSpk(payload);
      apiClient.post("/v1/spk", apiPayload).catch(() => {});
      appendAuditLog({
        module: "SPK",
        action: "CREATE",
        recordId: payload.spkNumber,
        description: `Menerbitkan SPK Baru ${payload.spkNumber} (${payload.type}) untuk ${payload.customerName}`,
        beforeData: null,
        afterData: { spk_number: payload.spkNumber, order_number: payload.orderNumber, plano: payload.jumlahBahanPlano },
      });
      triggerToast(`SPK Baru ${payload.spkNumber} berhasil diterbitkan, tersimpan ke Backend & masuk Kanban Produksi!`);
    }
    setShowFormModal(false);
  };

  const handleDeleteSpk = () => {
    if (!spkToDelete) return;
    const next = spkList.filter((s) => s.id !== spkToDelete.id);
    saveSpkList(next);
    const numericId = Number(String(spkToDelete.id).replace(/\D/g, ""));
    if (numericId) {
      apiClient.delete(`/v1/spk/${numericId}`).catch(() => {});
    }
    appendAuditLog({
      module: "SPK",
      action: "DELETE",
      recordId: spkToDelete.spkNumber,
      description: `Menghapus Dokumen SPK ${spkToDelete.spkNumber} (${spkToDelete.untukCetakan})`,
      beforeData: { spk_number: spkToDelete.spkNumber, customer: spkToDelete.customerName },
      afterData: null,
    });
    triggerToast(`Dokumen SPK ${spkToDelete.spkNumber} berhasil dihapus.`);
    setSpkToDelete(null);
  };

  const filteredSpk = spkList
    .filter((s) => {
      if (filterType !== "Semua" && s.type !== filterType) return false;
      if (filterBrand !== "Semua" && s.brand.toLowerCase() !== filterBrand.toLowerCase())
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (
          !s.spkNumber.toLowerCase().includes(q) &&
          !s.orderNumber.toLowerCase().includes(q) &&
          !s.customerName.toLowerCase().includes(q) &&
          !s.jobName.toLowerCase().includes(q) &&
          !s.targetVendor.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => a.deadline.localeCompare(b.deadline));

  const toggleChecklistPrepared = (spkId: string, sku: string) => {
    const updatedList = spkList.map((spk) => {
      if (spk.id !== spkId) return spk;
      return {
        ...spk,
        warehouseChecklist: spk.warehouseChecklist.map((item) =>
          item.sku === sku ? { ...item, prepared: !item.prepared } : item
        ),
      };
    });
    saveSpkList(updatedList);
    const updatedSelected = updatedList.find((s) => s.id === spkId);
    if (updatedSelected) setSelectedSpk(updatedSelected);
  };

  const confirmHandoverToVendor = (spkId: string) => {
    const updatedList = spkList.map((spk) =>
      spk.id === spkId
        ? {
            ...spk,
            status: "Stok Gudang Siap" as const,
            warehouseChecklist: spk.warehouseChecklist.map((i) => ({ ...i, prepared: true })),
          }
        : spk
    );
    saveSpkList(updatedList);
    const updatedSelected = updatedList.find((s) => s.id === spkId);
    if (updatedSelected) setSelectedSpk(updatedSelected);
    setShowWarehouseQrModal(false);
    triggerToast(
      `Stok bahan untuk ${selectedSpk.spkNumber} telah diverifikasi Staf Gudang & siap diserahkan ke ${selectedSpk.targetVendor}!`
    );
  };

  return (
    <DashboardLayout title="SPK Digital & QR Persiapan Stok Gudang">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toast */}
        {toastMessage && (
          <div className="p-3 rounded-lg bg-[#EFF4FE] dark:bg-[#1D4ED8]/25 border border-[#D6E3FC] dark:border-[#2563EB]/40 text-[#2B5FC7] dark:text-[#93C5FD] text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <IconCheck size={16} strokeWidth={2} />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)}>
              <IconX size={14} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#2B5FC7] dark:bg-[#3B6FE0]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B5FC7] dark:text-[#3B6FE0]">
                MOD-04 · CRUD SPK Digital Referensi &amp; QR Code Persiapan Stok Gudang
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight">
              Manajemen SPK Digital (Internal &amp; Vendor Mitra)
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
              Buat, edit, cetak, dan hapus dokumen SPK sesuai format referensi pabrik beserta QR Code URL otomatis untuk Staf Gudang.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (!selectedSpk && spkList[0]) {
                  setSelectedSpk(spkList[0]);
                }
                setShowWarehouseQrModal(true);
              }}
              className="h-10 px-3.5 rounded-lg text-xs font-semibold border border-[#059669] bg-[#ECFDF5]/60 text-[#059669] hover:bg-[#ECFDF5] dark:bg-[#064E3B]/25 dark:border-[#34D399] dark:text-[#34D399] transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs"
            >
              <IconWarehouse size={14} className="shrink-0" />
              <span>Scan QR Gudang</span>
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="h-10 px-4 rounded-lg text-xs font-semibold bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] dark:hover:bg-[#2B5FC7] text-white transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <IconPlus size={14} strokeWidth={2.5} className="shrink-0" />
              <span>Tambah SPK Baru</span>
            </button>
          </div>
        </div>

        {/* 4 Cards Summary */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Total SPK Aktif</span>
              <IconSpk size={16} className="text-[#2B5FC7] shrink-0" />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3]">
              {spkList.length} Dokumen
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#6B7684] mt-1">
              Tersimpan otomatis &amp; siap cetak
            </div>
          </div>

          <div className="p-3 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">SPK Vendor Mitra</span>
              <IconWarehouse size={16} className="text-[#D97706] shrink-0" />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-[#D97706] dark:text-[#FBBF24]">
              {spkList.filter((s) => s.type !== "Internal").length} SPK Vendor
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#6B7684] mt-1">
              Terhubung ke {activeVendors.length} Master Vendor Maklon
            </div>
          </div>

          <div className="p-3 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">SPK Internal</span>
              <IconGear size={16} className="text-[#2B5FC7] shrink-0" />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-[#2B5FC7] dark:text-[#60A5FA]">
              {spkList.filter((s) => s.type === "Internal").length} SPK Internal
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#6B7684] mt-1">
              Terhubung ke {activePics.length} Master PIC Produksi
            </div>
          </div>

          <div className="p-3 sm:p-5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">Stok Gudang Siap</span>
              <IconCheck size={16} className="text-[#059669] shrink-0" />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-[#059669] dark:text-[#34D399]">
              {spkList.filter((s) => s.status === "Stok Gudang Siap").length} SPK
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#6B7684] mt-1">
              Terverifikasi lewat QR Code Gudang
            </div>
          </div>
        </section>

        {/* Filters & Search */}
        <section className="p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            <div className="relative w-full sm:w-64">
              <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7684]" />
              <input
                type="text"
                placeholder="Cari No. SPK, pelanggan, job, vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-8 pr-3 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D]"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-[#6B7684] dark:text-[#8A94A6]">Tipe:</span>
              {["Semua", "Internal", "Eksternal (Vendor Mitra)"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                    filterType === t
                      ? "bg-[#2B5FC7] text-white dark:bg-[#3B6FE0]"
                      : "bg-[#F4F6FA] text-[#6B7684] hover:text-[#1B2436] border border-[#E2E6ED] dark:bg-[#1B2A44] dark:text-[#8A94A6] dark:border-[#26334D]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#6B7684] dark:text-[#8A94A6]">Filter Brand:</span>
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="h-9 px-3 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] text-xs font-medium"
            >
              {["Semua", ...dynamicBrands].map((b) => (
                <option key={b} value={b}>
                  {b === "Semua" ? "Semua Brand" : b}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Table of SPK */}
        <section className="rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F4F6FA] dark:bg-[#1B2A44] border-b border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6] text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4 whitespace-nowrap">No. SPK &amp; Order</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Tipe &amp; Tujuan</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Pelanggan &amp; Brand</th>
                  <th className="py-3.5 px-4 min-w-[230px]">Nama Job &amp; Spesifikasi</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Bahan Plano &amp; Potong</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Deadline &amp; PIC</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]">
                {filteredSpk.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-[#F4F6FA]/70 dark:hover:bg-[#1B2A44]/50 transition-colors align-middle"
                  >
                    {/* 1. No. SPK & Order */}
                    <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                      <div className="font-bold text-[#2B5FC7] dark:text-[#60A5FA] text-xs">
                        {s.spkNumber}
                      </div>
                      <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                        {s.orderNumber}
                      </div>
                    </td>

                    {/* 2. Tipe & Tujuan */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          s.type === "Internal"
                            ? "bg-[#EFF4FE] text-[#2B5FC7] border border-[#D6E3FC] dark:bg-[#1D4ED8]/25 dark:text-[#93C5FD] dark:border-[#2563EB]/40"
                            : "bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] dark:bg-[#78350F]/30 dark:text-[#FBBF24] dark:border-[#92400E]/50"
                        }`}
                      >
                        {s.type === "Internal" ? "Internal" : "Vendor Mitra"}
                      </span>
                      <div className="text-[11px] font-medium text-[#1B2436] dark:text-[#E8ECF3] mt-1">
                        {s.targetVendor}
                      </div>
                    </td>

                    {/* 3. Pelanggan & Brand */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                        {s.customerName}
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#2B5FC7] dark:text-[#93C5FD]">
                        {s.brand}
                      </span>
                    </td>

                    {/* 4. Nama Job & Spesifikasi */}
                    <td className="py-3.5 px-4 min-w-[230px]">
                      <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3] leading-snug break-words">
                        {s.untukCetakan || s.jobName}
                      </div>
                      <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-1 flex flex-wrap items-center gap-1.5 font-mono">
                        <span>{s.cetakOrderLembar}</span>
                        <span>·</span>
                        <span>Cetak {s.cetakModel}</span>
                        {s.jenisLaminasi && s.jenisLaminasi !== "TANPA LAMINASI" && (
                          <>
                            <span>·</span>
                            <span>{s.jenisLaminasi}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* 5. Bahan Plano & Potong */}
                    <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                      <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                        {s.jenisBahan}
                      </div>
                      <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                        {s.jumlahBahanPlano} Plano →{" "}
                        <strong className="text-[#2B5FC7] dark:text-[#60A5FA]">
                          {s.jumlahKertasLembar.toLocaleString("id-ID")} Lbr
                        </strong>{" "}
                        (Potong {s.dipotongJadi})
                      </div>
                    </td>

                    {/* 6. Deadline & PIC */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-semibold text-[#991B1B] dark:text-[#F87171]">
                        📅 {s.deadline}
                      </div>
                      <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                        PIC: <strong className="text-[#1B2436] dark:text-[#E8ECF3]">{s.operatorName}</strong>
                      </div>
                    </td>

                    {/* 7. Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          s.status === "Stok Gudang Siap"
                            ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] dark:bg-[#064E3B]/30 dark:text-[#34D399] dark:border-[#059669]/50"
                            : "bg-[#EFF4FE] text-[#2B5FC7] border border-[#D6E3FC] dark:bg-[#1D4ED8]/25 dark:text-[#93C5FD] dark:border-[#2563EB]/40"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    {/* 8. Aksi (CRUD & QR) */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSpk(s);
                            setShowWarehouseQrModal(true);
                          }}
                          title="Lihat daftar persiapan stok gudang dari QR Code"
                          className="h-8 px-2.5 rounded-lg text-[11px] font-semibold border border-[#059669] text-[#059669] hover:bg-[#ECFDF5] dark:border-[#34D399] dark:text-[#34D399] dark:hover:bg-[#064E3B]/30 transition-colors inline-flex items-center gap-1"
                        >
                          <IconEye size={12} />
                          <span>QR Gudang</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSpk(s);
                            setShowPreviewModal(true);
                          }}
                          title="Pratinjau & Cetak Dokumen SPK Referensi"
                          className="h-8 px-2.5 rounded-lg text-[11px] font-semibold bg-[#2B5FC7] hover:bg-[#1D4FB8] text-white transition-colors inline-flex items-center gap-1"
                        >
                          <IconPrinter size={12} />
                          <span>SPK</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(s)}
                          title="Edit SPK"
                          className="h-8 px-2.5 rounded-lg text-[11px] font-medium border border-[#E2E6ED] dark:border-[#26334D] hover:bg-[#F4F6FA] dark:hover:bg-[#1B2A44] transition-colors inline-flex items-center gap-1"
                        >
                          <IconEdit size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSpkToDelete(s)}
                          title="Hapus SPK"
                          className="h-8 w-8 rounded-lg text-[11px] font-medium border border-[#FECACA] text-[#991B1B] hover:bg-[#FEF2F2] dark:border-[#7F1D1D] dark:text-[#F87171] transition-colors inline-flex items-center justify-center"
                        >
                          <IconTrash size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* =====================================================================
            MODAL CRUD: BUAT SPK BARU / EDIT SPK (SESUAI STRUKTUR REFERENSI SPK)
           ===================================================================== */}
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
            <form
              onSubmit={handleSaveSpk}
              className="w-full max-w-4xl rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
                <div>
                  <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3] flex items-center gap-1.5">
                    <IconSpk size={16} />
                    <span>
                      {editingSpk
                        ? `Edit Dokumen SPK (${editingSpk.spkNumber})`
                        : "Buat / Terbitkan Dokumen SPK Baru (Format Referensi)"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                    QR Code URL untuk Staf Gudang dan Diagram Potong 2D akan di-generate secara otomatis.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="p-1 rounded-lg text-[#6B7684] hover:text-[#1B2436]"
                >
                  <IconX size={16} />
                </button>
              </div>

              {/* 1. Identitas Header SPK */}
              <div className="p-3.5 rounded-xl bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] space-y-3">
                <div className="font-bold text-[#2B5FC7] dark:text-[#60A5FA] uppercase tracking-wider text-[11px]">
                  1. Identitas Header SPK, Vendor &amp; Penanggung Jawab
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Nomor SPK *</label>
                    <input
                      required
                      value={formData.spkNumber}
                      onChange={(e) => setFormData({ ...formData, spkNumber: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Nomor Order / Invoice *</label>
                    <input
                      required
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Tipe SPK</label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as SpkDocument["type"],
                        })
                      }
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    >
                      <option value="Eksternal (Vendor Mitra)">Eksternal (Vendor Mitra)</option>
                      <option value="Internal">Internal (Mesin Mandiri)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Target Vendor Mitra</label>
                    <select
                      disabled={formData.type === "Internal"}
                      value={formData.targetVendor}
                      onChange={(e) => setFormData({ ...formData, targetVendor: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] disabled:opacity-50"
                    >
                      {activeVendors.map((v) => (
                        <option key={v.id} value={v.name}>
                          {v.name} ({v.specialty})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Nama Pelanggan *</label>
                    <input
                      required
                      list="spk-customer-list"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    />
                    <datalist id="spk-customer-list">
                      {customers.map((c) => (
                        <option key={c.id} value={c.name} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Brand</label>
                    <select
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    >
                      {dynamicBrands.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Deadline Wajib *</label>
                    <input
                      type="date"
                      required
                      min={todayIso}
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Operator / PIC (Master PIC)</label>
                    <select
                      value={formData.operatorName}
                      onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    >
                      {activePics.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} ({p.division})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">NAMA FOLDER (Baris Atas SPK)</label>
                    <input
                      value={formData.folderName}
                      onChange={(e) => setFormData({ ...formData, folderName: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">NAMA JOB *</label>
                    <input
                      required
                      value={formData.jobName}
                      onChange={(e) => setFormData({ ...formData, jobName: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Badge Khusus (mis. ALUFOIL)</label>
                    <input
                      placeholder="Kosongkan jika tidak ada"
                      value={formData.specialMaterialBadge}
                      onChange={(e) =>
                        setFormData({ ...formData, specialMaterialBadge: e.target.value })
                      }
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Bagian BAHAN & Diagram Potong */}
              <div className="p-3.5 rounded-xl bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] space-y-3">
                <div className="font-bold text-[#2B5FC7] dark:text-[#60A5FA] uppercase tracking-wider text-[11px]">
                  2. Bagian BAHAN &amp; Kalkulasi Potong Plano Otomatis
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Asal Bahan</label>
                    <select
                      value={formData.bahanSource}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bahanSource: e.target.value as SpkDocument["bahanSource"],
                        })
                      }
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    >
                      <option value="Bahan Martin">Bahan Martin</option>
                      <option value="Bahan Sendiri">Bahan Sendiri</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Jenis Bahan Plano *</label>
                    <input
                      required
                      placeholder="Contoh: Ivory 300gr (79x109)"
                      value={formData.jenisBahan}
                      onChange={(e) => setFormData({ ...formData, jenisBahan: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Jumlah Bahan (Plano) *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={formData.jumlahBahanPlano}
                      onChange={(e) =>
                        setFormData({ ...formData, jumlahBahanPlano: Number(e.target.value) })
                      }
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">
                      Dipotong Jadi (Hasil:{" "}
                      {(formData.jumlahBahanPlano * formData.dipotongJadi).toLocaleString("id-ID")}{" "}
                      Lbr)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={36}
                      required
                      value={formData.dipotongJadi}
                      onChange={(e) =>
                        setFormData({ ...formData, dipotongJadi: Number(e.target.value) })
                      }
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Ukuran Jadi (cm)</label>
                    <input
                      value={formData.ukuranJadi}
                      onChange={(e) => setFormData({ ...formData, ukuranJadi: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Ukuran File (cm)</label>
                    <input
                      value={formData.ukuranFile}
                      onChange={(e) => setFormData({ ...formData, ukuranFile: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Untuk Cetakan *</label>
                    <input
                      required
                      value={formData.untukCetakan}
                      onChange={(e) => setFormData({ ...formData, untukCetakan: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Struk</label>
                    <select
                      value={formData.strukPolicy}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          strukPolicy: e.target.value as SpkDocument["strukPolicy"],
                        })
                      }
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    >
                      <option value="Tidak Dibawa Pulang">Tidak Dibawa Pulang</option>
                      <option value="Dibawa Pulang">Dibawa Pulang</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Bagian CETAK & LAMINASI */}
              <div className="p-3.5 rounded-xl bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] space-y-3">
                <div className="font-bold text-[#2B5FC7] dark:text-[#60A5FA] uppercase tracking-wider text-[11px]">
                  3. Bagian Tabel CETAK, LAMINASI &amp; PACKING
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Mesin Cetak</label>
                    <input
                      value={formData.cetakMesin}
                      onChange={(e) => setFormData({ ...formData, cetakMesin: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Model Cetak</label>
                    <input
                      value={formData.cetakModel}
                      onChange={(e) => setFormData({ ...formData, cetakModel: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Order Cetakan</label>
                    <input
                      value={formData.cetakOrderLembar}
                      onChange={(e) =>
                        setFormData({ ...formData, cetakOrderLembar: e.target.value })
                      }
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Insheet</label>
                    <input
                      type="number"
                      value={formData.cetakInsheet}
                      onChange={(e) =>
                        setFormData({ ...formData, cetakInsheet: Number(e.target.value) })
                      }
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Jumlah Plat</label>
                    <input
                      type="number"
                      value={formData.cetakJumlahPlat}
                      onChange={(e) =>
                        setFormData({ ...formData, cetakJumlahPlat: Number(e.target.value) })
                      }
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Jenis Laminasi</label>
                    <input
                      value={formData.jenisLaminasi}
                      onChange={(e) => setFormData({ ...formData, jenisLaminasi: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Tipe Laminasi</label>
                    <input
                      value={formData.tipeLaminasi}
                      onChange={(e) => setFormData({ ...formData, tipeLaminasi: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Muka Laminasi</label>
                    <select
                      value={formData.laminasiMuka}
                      onChange={(e) => setFormData({ ...formData, laminasiMuka: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    >
                      <option value="1 Muka">1 Muka</option>
                      <option value="2 Muka">2 Muka</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Kotak Callout (Pisah Koma)</label>
                    <input
                      placeholder="+LAMINASI SPOT UV, +FOIL RG 603"
                      value={formData.finishingCalloutText}
                      onChange={(e) =>
                        setFormData({ ...formData, finishingCalloutText: e.target.value })
                      }
                      className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E6ED] dark:border-[#26334D]">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] text-white font-semibold shadow-sm"
                >
                  {editingSpk ? "Simpan Perubahan SPK" : "Terbitkan SPK & Buat QR Gudang"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Confirm Delete SPK */}
        <ConfirmDialog
          open={Boolean(spkToDelete)}
          onClose={() => setSpkToDelete(null)}
          onConfirm={handleDeleteSpk}
          title="Hapus Dokumen SPK?"
          message={`Apakah Anda yakin ingin menghapus dokumen SPK "${spkToDelete?.spkNumber}" (${spkToDelete?.jobName})?`}
          confirmLabel="Ya, Hapus SPK"
        />

        {/* =====================================================================
            MODAL 1: DOKUMEN SPK VENDOR SESUAI REFERENSI FOLDER SPK/ + QR CODE
           ===================================================================== */}
        {showPreviewModal && selectedSpk && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
            <div className="w-full max-w-4xl rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-2xl p-5 space-y-4 max-h-[94vh] overflow-y-auto">
              {/* Top Modal Controls */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D] print:hidden">
                <div>
                  <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3] flex items-center gap-1.5">
                    <IconSpk size={16} />
                    <span>Dokumen SPK Digital — Format Standar Referensi ({selectedSpk.spkNumber})</span>
                  </h3>
                  <p className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
                    Barcode lama digantikan QR Code interaktif berisi URL persiapan stok untuk Staf Gudang.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPreviewModal(false);
                      setShowWarehouseQrModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-xs font-semibold hover:bg-[#D1FAE5]"
                  >
                    Simulasi Scan QR (Mode Staf Gudang) →
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <IconPrinter size={13} />
                    <span>Cetak / PDF</span>
                  </button>
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="p-1 rounded-lg text-[#6B7684] hover:text-[#1B2436]"
                  >
                    <IconX size={16} />
                  </button>
                </div>
              </div>

              {/* =================================================================
                  LEMBAR KERTAS SPK (100% MENGIKUTI LAYOUT REFERENSI PDF DI FOLDER SPK/)
                 ================================================================= */}
              <div className="p-6 rounded border border-gray-300 bg-white text-black shadow-sm text-xs font-sans space-y-3">
                {/* 1. Baris Abu-abu Atas: NAMA FOLDER */}
                <div className="bg-[#D9D9D9] px-3 py-1.5 text-[11px] font-bold flex items-center gap-6">
                  <span className="w-28 shrink-0">NAMA FOLDER</span>
                  <span className="font-mono">: {selectedSpk.folderName}</span>
                </div>

                {/* 2. Baris Hitam/Abu Tua: Judul SPK */}
                <div className="bg-[#4A4A4A] text-white text-center py-1 font-extrabold text-sm tracking-widest uppercase">
                  SPK
                </div>

                {/* 3. Bagian Header: Info Pelanggan, Tanggal/Operator & QR Code Gudang (Pengganti Barcode) */}
                <div className="grid grid-cols-12 gap-4 pt-1 items-start">
                  {/* Kolom Kiri (5 cols): NAMA PELANGGAN, NAMA JOB, Badge ALUFOIL */}
                  <div className="col-span-12 md:col-span-5 space-y-2">
                    <div className="grid grid-cols-12 text-[11px]">
                      <span className="col-span-5 font-bold">NAMA PELANGGAN</span>
                      <span className="col-span-7">: {selectedSpk.customerName}</span>
                    </div>
                    <div className="grid grid-cols-12 text-[11px]">
                      <span className="col-span-5 font-bold">NAMA JOB</span>
                      <span className="col-span-7 font-medium break-words">: {selectedSpk.jobName}</span>
                    </div>
                    {selectedSpk.specialMaterialBadge && (
                      <div className="pt-2 pl-4">
                        <span className="text-2xl font-black italic tracking-wider uppercase border-b-2 border-black">
                          {selectedSpk.specialMaterialBadge}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Kolom Tengah (4 cols): Tanggal Order, Jam, Deadline, Pengambilan, No. tanda terima, Operator */}
                  <div className="col-span-12 md:col-span-4 space-y-1 text-[11px]">
                    <div className="grid grid-cols-12">
                      <span className="col-span-6 font-bold">Tanggal Order</span>
                      <span className="col-span-6">: {selectedSpk.orderDate}</span>
                    </div>
                    <div className="grid grid-cols-12">
                      <span className="col-span-6 font-bold">Jam</span>
                      <span className="col-span-6">: {selectedSpk.orderTime}</span>
                    </div>
                    <div className="grid grid-cols-12">
                      <span className="col-span-6 font-bold">Deadline</span>
                      <span className="col-span-6 font-semibold text-red-700">: {selectedSpk.deadline}</span>
                    </div>
                    <div className="grid grid-cols-12">
                      <span className="col-span-6 font-bold">Pengambilan</span>
                      <span className="col-span-6">: {selectedSpk.pickupMethod}</span>
                    </div>
                    <div className="grid grid-cols-12">
                      <span className="col-span-6 font-bold">No. tanda terima</span>
                      <span className="col-span-6">: {selectedSpk.receiptNumber}</span>
                    </div>
                    <div className="grid grid-cols-12">
                      <span className="col-span-6 font-bold">Operator</span>
                      <span className="col-span-6">: {selectedSpk.operatorName}</span>
                    </div>
                  </div>

                  {/* Kolom Kanan (3 cols): QR CODE URL SPK DIGITAL (Pengganti Barcode Referensi) */}
                  <div className="col-span-12 md:col-span-3 flex flex-col items-center justify-center border border-gray-300 rounded p-2 bg-gray-50">
                    <QrCodeSvg value={getWarehouseQrUrl(selectedSpk.spkNumber)} size={104} />
                    <div className="text-[9px] font-bold uppercase tracking-wider mt-1 text-center">
                      QR STOK STAF GUDANG
                    </div>
                    <div className="text-[8px] font-mono text-gray-600 text-center break-all leading-tight mt-0.5">
                      {selectedSpk.spkNumber} · {selectedSpk.targetVendor}
                    </div>
                  </div>
                </div>

                {/* 4. Bagian BAHAN */}
                <div className="pt-2">
                  <div className="border-t-2 border-b-2 border-dashed border-black text-center font-extrabold text-[11px] py-0.5 tracking-widest uppercase">
                    BAHAN
                  </div>

                  <div className="pt-2 space-y-1 text-[11px]">
                    <div className="grid grid-cols-12">
                      <span className="col-span-2 font-bold">Bahan</span>
                      <span className="col-span-10">: {selectedSpk.bahanSource}</span>
                    </div>
                    <div className="grid grid-cols-12">
                      <span className="col-span-2 font-bold">Jenis Bahan</span>
                      <span className="col-span-4">: {selectedSpk.jenisBahan}</span>
                      <span className="col-span-6">
                        <strong className="font-bold">Jumlah bahan :</strong> &nbsp; {selectedSpk.jumlahBahanPlano}
                      </span>
                    </div>
                  </div>

                  {/* Grid Diagram Potong (Kiri) + Rincian Potong Kertas (Kanan) */}
                  <div className="grid grid-cols-12 gap-4 pt-3 items-center">
                    <div className="col-span-12 md:col-span-4 flex justify-center">
                      <div
                        className="w-48 h-36 border-2 border-black grid bg-white"
                        style={{
                          gridTemplateColumns: `repeat(${selectedSpk.cutGridCols}, minmax(0, 1fr))`,
                          gridTemplateRows: `repeat(${selectedSpk.cutGridRows}, minmax(0, 1fr))`,
                        }}
                      >
                        {Array.from({
                          length: selectedSpk.cutGridCols * selectedSpk.cutGridRows,
                        }).map((_, idx) => (
                          <div
                            key={idx}
                            className="border border-black/70 flex items-center justify-center text-[9px] font-mono text-gray-500"
                          >
                            {idx < selectedSpk.dipotongJadi ? idx + 1 : ""}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-12 md:col-span-8 space-y-1.5 text-[11px]">
                      <div className="grid grid-cols-12 items-center">
                        <span className="col-span-3 font-bold">Jumlah kertas</span>
                        <span className="col-span-5 font-bold">
                          : {selectedSpk.jumlahKertasLembar.toLocaleString("id-ID")} &nbsp; Lbr
                        </span>
                        <span className="col-span-4 text-right font-semibold">
                          {selectedSpk.layoutMataLabel || ""}
                        </span>
                      </div>
                      <div className="grid grid-cols-12">
                        <span className="col-span-3 font-bold">Dipotong jadi</span>
                        <span className="col-span-9">: {selectedSpk.dipotongJadi}</span>
                      </div>
                      <div className="grid grid-cols-12">
                        <span className="col-span-3 font-bold">Ukuran jadi</span>
                        <span className="col-span-9">: {selectedSpk.ukuranJadi}</span>
                      </div>
                      <div className="grid grid-cols-12">
                        <span className="col-span-3 font-bold">Ukuran file</span>
                        <span className="col-span-9">: {selectedSpk.ukuranFile}</span>
                      </div>
                      <div className="grid grid-cols-12">
                        <span className="col-span-3 font-bold">Untuk cetakan</span>
                        <div className="col-span-9">
                          <div>: {selectedSpk.untukCetakan}</div>
                          {selectedSpk.untukCetakanSub && (
                            <div className="pl-2 text-[10px] text-gray-700">
                              {selectedSpk.untukCetakanSub}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-12">
                        <span className="col-span-3 font-bold">Struk</span>
                        <span className="col-span-9 font-bold">: {selectedSpk.strukPolicy}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Bagian CETAK */}
                <div className="pt-2 space-y-2">
                  <div className="border-t-2 border-b-2 border-dashed border-black text-center font-extrabold text-[11px] py-0.5 tracking-widest uppercase">
                    CETAK
                  </div>

                  <div className="border-2 border-black p-0.5">
                    <table className="w-full border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-black text-left font-bold">
                          <th className="border border-black px-2 py-1 w-8">No</th>
                          <th className="border border-black px-2 py-1">Mesin</th>
                          <th className="border border-black px-2 py-1 w-12">Set</th>
                          <th className="border border-black px-2 py-1">Model Cetak</th>
                          <th className="border border-black px-2 py-1">Order</th>
                          <th className="border border-black px-2 py-1">Insheet</th>
                          <th className="border border-black px-2 py-1">Jumlah Plat</th>
                          <th className="border border-black px-2 py-1">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-black px-2 py-1">1</td>
                          <td className="border border-black px-2 py-1 font-semibold">
                            {selectedSpk.cetakMesin}
                          </td>
                          <td className="border border-black px-2 py-1">{selectedSpk.cetakSet}</td>
                          <td className="border border-black px-2 py-1">{selectedSpk.cetakModel}</td>
                          <td className="border border-black px-2 py-1">
                            {selectedSpk.cetakOrderLembar}
                          </td>
                          <td className="border border-black px-2 py-1">{selectedSpk.cetakInsheet}</td>
                          <td className="border border-black px-2 py-1">
                            {selectedSpk.cetakJumlahPlat}
                          </td>
                          <td className="border border-black px-2 py-1">
                            {selectedSpk.cetakKeterangan}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-12 text-[11px] pt-1">
                    <span className="col-span-2 font-bold">ACUAN WARNA</span>
                    <span className="col-span-10">: {selectedSpk.acuanWarna}</span>
                  </div>
                </div>

                {/* 6. Bagian LAMINASI */}
                <div className="pt-2">
                  <div className="border-t-2 border-b-2 border-dashed border-black text-center font-extrabold text-[11px] py-0.5 tracking-widest uppercase">
                    LAMINASI
                  </div>

                  <div className="grid grid-cols-12 gap-4 pt-2 items-start text-[11px]">
                    <div className="col-span-12 md:col-span-8 space-y-1">
                      <div className="grid grid-cols-12">
                        <span className="col-span-3 font-bold">Jenis Laminasi</span>
                        <span className="col-span-9">: {selectedSpk.jenisLaminasi}</span>
                      </div>
                      <div className="grid grid-cols-12">
                        <span className="col-span-3 font-bold">Tipe Laminasi</span>
                        <span className="col-span-4">: {selectedSpk.tipeLaminasi}</span>
                        <span className="col-span-5">{selectedSpk.laminasiMuka}</span>
                      </div>
                      <div className="grid grid-cols-12">
                        <span className="col-span-3 font-bold">Keterangan</span>
                        <span className="col-span-9 font-bold italic text-sm">
                          : {selectedSpk.laminasiKeterangan || ""}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-12 md:col-span-4 space-y-1.5 flex flex-col items-end">
                      {selectedSpk.finishingCalloutBoxes.map((box, i) => (
                        <div
                          key={i}
                          className="border-2 border-black px-3 py-1 font-extrabold text-sm uppercase tracking-wide"
                        >
                          {box}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 7. Bagian PACKING */}
                <div className="pt-2">
                  <div className="border-t-2 border-b-2 border-dashed border-black text-center font-extrabold text-[11px] py-0.5 tracking-widest uppercase">
                    PACKING
                  </div>
                  <div className="grid grid-cols-12 text-[11px] pt-2">
                    <span className="col-span-2 font-bold">Jenis Packing</span>
                    <span className="col-span-10">: {selectedSpk.jenisPacking}</span>
                  </div>
                </div>

                {/* 8. Bagian RINCIAN BIAYA & NB */}
                <div className="pt-2">
                  <div className="border-t-2 border-b-2 border-dashed border-black text-center font-extrabold text-[11px] py-0.5 tracking-widest uppercase">
                    RINCIAN BIAYA
                  </div>

                  <div className="grid grid-cols-12 gap-4 pt-2 text-[11px]">
                    <div className="col-span-12 md:col-span-7 space-y-1">
                      {[
                        ["Bahan", selectedSpk.rincianBiaya.bahan],
                        ["Cetak", selectedSpk.rincianBiaya.cetak],
                        ["Biaya Potong Bahan", selectedSpk.rincianBiaya.biayaPotongBahan],
                        ["Overprint", selectedSpk.rincianBiaya.overprint],
                        ["Potong", selectedSpk.rincianBiaya.potong],
                        ["Laminasi", selectedSpk.rincianBiaya.laminasi],
                        ["UV/Spot", selectedSpk.rincianBiaya.uvSpot],
                        ["Proff", selectedSpk.rincianBiaya.proff],
                      ].map(([label, val]) => (
                        <div key={label} className="grid grid-cols-12">
                          <span className="col-span-5 font-bold">{label}</span>
                          <span className="col-span-7 font-mono">: {val}</span>
                        </div>
                      ))}
                    </div>

                    <div className="col-span-12 md:col-span-5 pt-2">
                      <div className="font-bold mb-1">NB :</div>
                      <p className="font-bold leading-snug text-[11px]">
                        &ldquo;Dengan Menandatangani maka anda menyetujui SPK ini, kesalahan order diluar SPK bukan tanggung jawab Martin Multi Grafika / CV Solusi Inovasi Packaging&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* 9. Tabel Tanda Tangan: Layouter | Checker 1 | Checker 2 */}
                <div className="pt-3">
                  <table className="w-72 border-collapse border-2 border-black text-center text-[11px]">
                    <thead>
                      <tr className="font-bold border-b border-black">
                        <th className="border border-black py-1 px-3 w-24">Layouter</th>
                        <th className="border border-black py-1 px-3 w-24">Checker 1</th>
                        <th className="border border-black py-1 px-3 w-24">Checker 2</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black h-16" />
                        <td className="border border-black h-16" />
                        <td className="border border-black h-16" />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            MODAL 2: TAMPILAN HASIL SCAN QR CODE OLEH STAF GUDANG
           ===================================================================== */}
        {showWarehouseQrModal && selectedSpk && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#059669] dark:text-[#34D399]">
                    Hasil Scan QR Code SPK Digital · Mode Staf Gudang
                  </div>
                  <h3 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3] mt-0.5">
                    Daftar Persiapan Stok Barang Gudang untuk Vendor ({selectedSpk.spkNumber})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWarehouseQrModal(false)}
                  className="p-1 rounded-lg text-[#6B7684] hover:text-[#1B2436]"
                >
                  <IconX size={16} />
                </button>
              </div>

              {/* Pemilih / Simulasi Scan Kode QR SPK */}
              <div className="p-3 rounded-xl bg-[#ECFDF5]/60 dark:bg-[#064E3B]/20 border border-[#A7F3D0] dark:border-[#059669]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <span className="font-semibold text-[#065F46] dark:text-[#34D399]">
                  🔍 Pilih / Scan Dokumen SPK Aktif:
                </span>
                <select
                  value={selectedSpk.id}
                  onChange={(e) => {
                    const found = spkList.find((item) => item.id === e.target.value);
                    if (found) setSelectedSpk(found);
                  }}
                  className="h-9 px-3 rounded-lg bg-white dark:bg-[#16223A] border border-[#059669] text-[#1B2436] dark:text-[#E8ECF3] font-mono text-xs font-semibold"
                >
                  {spkList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.spkNumber} — {item.customerName} ({item.targetVendor})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div>
                    <span className="text-[#6B7684]">Target Vendor Penerima Bahan: </span>
                    <strong className="text-[#2B5FC7] dark:text-[#60A5FA]">{selectedSpk.targetVendor}</strong>
                  </div>
                  <div>
                    <span className="text-[#6B7684]">Nama Job / Cetakan: </span>
                    <strong className="text-[#1B2436] dark:text-[#E8ECF3]">{selectedSpk.untukCetakan}</strong>
                  </div>
                  <div>
                    <span className="text-[#6B7684]">URL SPK Digital pada QR: </span>
                    <code className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]">
                      {getWarehouseQrUrl(selectedSpk.spkNumber)}
                    </code>
                  </div>
                </div>
                <div className="shrink-0 bg-white p-1.5 rounded border border-[#E2E6ED]">
                  <QrCodeSvg value={getWarehouseQrUrl(selectedSpk.spkNumber)} size={72} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                  Item Bahan Baku &amp; Komponen yang Harus Disiapkan Staf Gudang:
                </div>
                <div className="space-y-2.5">
                  {selectedSpk.warehouseChecklist.map((item) => (
                    <div
                      key={item.sku}
                      onClick={() => toggleChecklistPrepared(selectedSpk.id, item.sku)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all text-xs flex items-start justify-between gap-3 ${
                        item.prepared
                          ? "bg-[#ECFDF5]/60 dark:bg-[#064E3B]/20 border-[#A7F3D0] dark:border-[#065F46]"
                          : "bg-white dark:bg-[#16223A] border-[#E2E6ED] dark:border-[#26334D]"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-[#1B2436] dark:text-[#E8ECF3] flex items-center gap-2">
                          <span className="font-mono text-[11px] text-[#2B5FC7] dark:text-[#60A5FA]">
                            [{item.sku}]
                          </span>
                          <span>{item.materialName}</span>
                        </div>
                        <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                          📍 Lokasi: <strong>{item.warehouseLocation}</strong> — {item.rackCode}
                        </div>
                        <div className="text-[11px] font-semibold text-[#92400E] dark:text-[#FBBF24]">
                          📦 Jumlah Wajib Disiapkan: {item.qtyRequired}
                        </div>
                        <div className="text-[11px] text-[#059669] dark:text-[#34D399]">
                          ✓ Ketersediaan Gudang: {item.availableStock}
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold shrink-0 ${
                          item.prepared
                            ? "bg-[#059669] text-white"
                            : "bg-[#F4F6FA] text-[#6B7684] border border-[#E2E6ED]"
                        }`}
                      >
                        {item.prepared ? "✓ Sudah Disiapkan" : "Tandai Siap"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E2E6ED] dark:border-[#26334D]">
                <button
                  type="button"
                  onClick={() => {
                    setShowWarehouseQrModal(false);
                    setShowPreviewModal(true);
                  }}
                  className="px-3.5 py-2 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-xs font-medium text-[#2B5FC7]"
                >
                  ← Lihat Lembar SPK Lengkap
                </button>
                <button
                  type="button"
                  onClick={() => confirmHandoverToVendor(selectedSpk.id)}
                  className="px-4 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold shadow-sm"
                >
                  Konfirmasi Stok Siap Diserahkan ke Vendor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
