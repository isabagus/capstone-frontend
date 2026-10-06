import type {
  Brand,
  BrandName,
  Category,
  Material,
  Product,
  ProductionQueueItem,
  Sparepart,
  StockMovement,
  Supplier,
  Unit,
  UnitConversion,
  Warehouse,
} from "@/types/inventory";

// =====================================================================
// MOCK DATA — Staf Gudang
// Satu-satunya sumber data dummy. Ganti dengan API di `src/services/*`
// tanpa perlu mengubah komponen UI.
// =====================================================================

export const BRANDS: BrandName[] = [
  "Packsolution.id",
  "Estella",
  "Pepipapier",
  "memoirs.print",
  "pikpurry",
];

export const BRAND_ITEMS: Brand[] = [
  {
    id: "b-pack",
    name: "Packsolution.id",
    code: "PACK",
    slug: "packsolution-id",
    description: "Brand utama packaging custom & box korporat (Hardbox, Corrugated, Food Box)",
    active: true,
  },
  {
    id: "b-est",
    name: "Estella Digital Printing",
    code: "EST",
    slug: "estella",
    description: "Layanan cetak cepat digital printing, marketing collaterals & merchandise",
    active: true,
  },
  {
    id: "b-pepi",
    name: "Pepipapier",
    code: "PEPI",
    slug: "pepipapier",
    description: "Stationery custom, paper goods, & wedding invitation eksklusif",
    active: true,
  },
  {
    id: "b-mem",
    name: "memoirs.print",
    code: "MEM",
    slug: "memoirs-print",
    description: "Photobook premium, kalender meja, & fine art archival prints",
    active: true,
  },
  {
    id: "b-pik",
    name: "pikpurry",
    code: "PIK",
    slug: "pikpurry",
    description: "Stiker vinyl custom, die-cut label waterproof, & packaging sleeve",
    active: true,
  },
];

export const WAREHOUSES: Warehouse[] = [
  {
    id: "g1",
    code: "GD-01",
    name: "Gudang 1 (Utama / Pabrik)",
    shortName: "Gudang 1",
    type: "MAIN_WAREHOUSE",
    address: "Kawasan Industri Packaging No. 12, Jawa Timur",
    phone: "031-8987654",
    picName: "Budi Santoso",
    description: "Gudang utama penerimaan bahan baku, penyimpanan mesin potong/cetak, dan logistik bahan plano.",
    active: true,
  },
  {
    id: "g2",
    code: "GD-02",
    name: "Gudang 2 (Toko / Ruko)",
    shortName: "Gudang 2",
    type: "STORE_WAREHOUSE",
    address: "Ruko Sentra Niaga Blok B-5, Jawa Timur",
    phone: "031-8987655",
    picName: "Agus Pratama",
    description: "Gudang penyangga untuk produk jadi, stok toko retail, dan display sampel kemasan.",
    active: true,
  },
];

// ---------------------------------------------------------------------
// Satuan & konversi
// ---------------------------------------------------------------------
export const UNITS: Unit[] = [
  { id: "u-plano", name: "Plano", abbr: "plano", type: "Lembar", active: true },
  { id: "u-rim", name: "Rim", abbr: "rim", type: "Lembar", active: true },
  { id: "u-lbr", name: "Lembar", abbr: "lbr", type: "Lembar", active: true },
  { id: "u-kg", name: "Kilogram", abbr: "kg", type: "Berat", active: true },
  { id: "u-gr", name: "Gram", abbr: "gr", type: "Berat", active: true },
  { id: "u-pcs", name: "Pcs", abbr: "pcs", type: "Unit", active: true },
  { id: "u-ltr", name: "Liter", abbr: "L", type: "Volume", active: true },
  { id: "u-roll", name: "Roll", abbr: "roll", type: "Panjang", active: true },
  { id: "u-pack", name: "Pack", abbr: "pack", type: "Unit", active: true },
  { id: "u-box", name: "Box", abbr: "box", type: "Unit", active: true },
  { id: "u-mtr", name: "Meter", abbr: "m", type: "Panjang", active: true },
  { id: "u-kln", name: "Kaleng", abbr: "kln", type: "Unit", active: false },
];

export const UNIT_CONVERSIONS: UnitConversion[] = [
  { id: "cv-1", fromUnitId: "u-rim", toUnitId: "u-lbr", factor: 500, note: "Standar rim kertas" },
  { id: "cv-2", fromUnitId: "u-plano", toUnitId: "u-lbr", factor: 1, note: "1 plano = 1 lembar besar" },
  { id: "cv-3", fromUnitId: "u-kg", toUnitId: "u-gr", factor: 1000 },
  { id: "cv-4", fromUnitId: "u-box", toUnitId: "u-pcs", factor: 100, note: "Box polybag standar" },
  { id: "cv-5", fromUnitId: "u-pack", toUnitId: "u-pcs", factor: 50 },
  { id: "cv-6", fromUnitId: "u-roll", toUnitId: "u-mtr", factor: 120, note: "Roll foil 64cm x 120m" },
];

// ---------------------------------------------------------------------
// Kategori
// ---------------------------------------------------------------------
export const CATEGORIES: Category[] = [
  // Produk
  { id: "cp-hardbox", kind: "product", name: "Hardbox / Rigid Box", description: "Kemasan rigid berbahan hardboard + wrapping", active: true },
  { id: "cp-softbox", kind: "product", name: "Softbox", description: "Kemasan lipat ivory / duplex", active: true },
  { id: "cp-card", kind: "product", name: "Kartu & Stationery", description: "Greeting card, hangtag, thank-you card", active: true },
  { id: "cp-photobook", kind: "product", name: "Photobook & Album", description: "Produk memoirs.print", active: true },
  { id: "cp-pouch", kind: "product", name: "Pouch & Flexible", description: "Standing pouch, ziplock", active: true },
  { id: "cp-semi", kind: "product", name: "Komponen Setengah Jadi", description: "Hasil cetak/potong yang belum dirakit", active: true },
  { id: "cp-sticker", kind: "product", name: "Sticker & Label", description: "Belum ada item", active: false },
  // Bahan baku
  { id: "cm-paper", kind: "material", name: "Kertas", description: "Ivory, art carton, art paper, duplex, kraft", active: true },
  { id: "cm-board", kind: "material", name: "Board / Karton Tebal", description: "Hardboard / greyboard untuk rigid box", active: true },
  { id: "cm-ink", kind: "material", name: "Tinta", description: "Tinta offset & UV (sensitif kedaluwarsa)", active: true },
  { id: "cm-finishing", kind: "material", name: "Finishing", description: "Foil, laminasi, varnish", active: true },
  { id: "cm-adhesive", kind: "material", name: "Perekat", description: "Lem kuning, hot melt, double tape", active: true },
  { id: "cm-flex", kind: "material", name: "Film Flexible", description: "Bahan pouch (PET/ALU/LLDPE)", active: true },
  { id: "cm-pack", kind: "material", name: "Material Packing", description: "Belum ada item", active: true },
  // Sparepart
  { id: "cs-blanket", kind: "sparepart", name: "Blanket & Roller", description: "Komponen mesin offset", active: true },
  { id: "cs-blade", kind: "sparepart", name: "Pisau & Pond", description: "Pisau potong, rubber pond, matras", active: true },
  { id: "cs-chem", kind: "sparepart", name: "Bahan Kimia Mesin", description: "Fountain solution, wash, oli", active: true },
  { id: "cs-elec", kind: "sparepart", name: "Elektrikal", description: "Lampu UV, sensor, fuse", active: true },
  { id: "cs-consumable", kind: "sparepart", name: "Consumable Produksi", description: "Lap majun, sarung tangan, masker", active: true },
];

// ---------------------------------------------------------------------
// Supplier
// ---------------------------------------------------------------------
export const SUPPLIERS: Supplier[] = [
  { id: "sp-1", code: "SUP-001", name: "PT Sinar Kertas Nusantara", pic: "Bpk. Hadi Gunawan", phone: "0812-3344-5566", email: "sales@sinarkertas.co.id", address: "Jl. Industri Raya No. 12, Tangerang", type: "Domestik", active: true },
  { id: "sp-2", code: "SUP-002", name: "CV Mitra Board Indonesia", pic: "Ibu Lestari", phone: "0813-2211-7788", email: "order@mitraboard.id", address: "Kawasan Industri Pulogadung Blok C3, Jakarta Timur", type: "Domestik", active: true },
  { id: "sp-3", code: "SUP-003", name: "Toyo Ink Indonesia", pic: "Mr. Kenji Watanabe", phone: "021-8990-1234", email: "cs@toyoink.co.id", address: "MM2100 Industrial Town, Bekasi", type: "Impor", active: true },
  { id: "sp-4", code: "SUP-004", name: "Kurz Foil Asia Pacific", pic: "Ms. Lim Wei Ling", phone: "+65-6789-1122", email: "apac@kurz.com", address: "Singapore 609916", type: "Impor", active: true },
  { id: "sp-5", code: "SUP-005", name: "UD Perekat Jaya", pic: "Bpk. Slamet", phone: "0857-1122-3344", email: "perekatjaya@gmail.com", address: "Jl. Kapuk Raya No. 88, Jakarta Utara", type: "Domestik", active: true },
  { id: "sp-6", code: "SUP-006", name: "Heidelberg Parts Center", pic: "Bpk. Andreas", phone: "021-5550-9090", email: "parts@heidelberg-id.com", address: "Jl. Gajah Mada No. 200, Jakarta Barat", type: "Impor", active: true },
  { id: "sp-7", code: "SUP-007", name: "PT Flexindo Film", pic: "Ibu Ratna", phone: "0821-7788-9900", email: "marketing@flexindo.co.id", address: "Jl. Raya Serang KM 24, Cikupa", type: "Domestik", active: true },
  { id: "sp-8", code: "SUP-008", name: "CV Graha Kimia Grafika", pic: "Bpk. Tono", phone: "0812-9090-1111", email: "grahakimia@yahoo.com", address: "Jl. Pangeran Jayakarta 45, Jakarta Pusat", type: "Domestik", active: false },
];

// ---------------------------------------------------------------------
// Bahan Baku
// ---------------------------------------------------------------------
export const MATERIALS: Material[] = [
  { id: "m-1", code: "BB-IVR-300", name: "Ivory 300gr", categoryId: "cm-paper", brands: ["Packsolution.id", "Estella"], unitId: "u-rim", stock: { g1: 28, g2: 12 }, safetyStock: 30, rop: 60, supplierId: "sp-1", gramature: 300, dimension: "79 x 109 cm", batchNo: "LOT-IV300-2609" },
  { id: "m-2", code: "BB-IVR-250", name: "Ivory 250gr", categoryId: "cm-paper", brands: ["Estella", "Pepipapier"], unitId: "u-rim", stock: { g1: 55, g2: 20 }, safetyStock: 25, rop: 50, supplierId: "sp-1", gramature: 250, dimension: "79 x 109 cm", batchNo: "LOT-IV250-2608" },
  { id: "m-3", code: "BB-ACT-260", name: "Art Carton 260gr", categoryId: "cm-paper", brands: ["Packsolution.id", "Pepipapier"], unitId: "u-rim", stock: { g1: 40, g2: 18 }, safetyStock: 20, rop: 45, supplierId: "sp-1", gramature: 260, dimension: "65 x 100 cm", batchNo: "LOT-AC260-2609" },
  { id: "m-4", code: "BB-APR-150", name: "Art Paper 150gr", categoryId: "cm-paper", brands: ["memoirs.print"], unitId: "u-rim", stock: { g1: 90, g2: 30 }, safetyStock: 25, rop: 50, supplierId: "sp-1", gramature: 150, dimension: "65 x 100 cm", batchNo: "LOT-AP150-2607" },
  { id: "m-5", code: "BB-DPX-350", name: "Duplex Coated 350gr", categoryId: "cm-paper", brands: ["pikpurry"], unitId: "u-rim", stock: { g1: 22, g2: 26 }, safetyStock: 20, rop: 40, supplierId: "sp-1", gramature: 350, dimension: "79 x 109 cm", batchNo: "LOT-DP350-2609" },
  { id: "m-6", code: "BB-KRF-275", name: "Kraft Liner Brown 275gr", categoryId: "cm-paper", brands: ["Estella", "pikpurry"], unitId: "u-rim", stock: { g1: 10, g2: 6 }, safetyStock: 15, rop: 35, supplierId: "sp-1", gramature: 275, dimension: "90 x 120 cm", batchNo: "LOT-KF275-2608" },
  { id: "m-7", code: "BB-HRD-2MM", name: "Hardboard 2mm", categoryId: "cm-board", brands: ["Packsolution.id"], unitId: "u-lbr", stock: { g1: 820, g2: 400 }, safetyStock: 300, rop: 600, supplierId: "sp-2", dimension: "80 x 110 cm", batchNo: "LOT-HB2-2609" },
  { id: "m-8", code: "BB-HRD-3MM", name: "Hardboard 3mm", categoryId: "cm-board", brands: ["Packsolution.id", "memoirs.print"], unitId: "u-lbr", stock: { g1: 260, g2: 120 }, safetyStock: 200, rop: 400, supplierId: "sp-2", dimension: "80 x 110 cm", batchNo: "LOT-HB3-2609" },
  { id: "m-9", code: "BB-INK-CYN", name: "Tinta UV Cyan", categoryId: "cm-ink", brands: [], unitId: "u-kg", stock: { g1: 6, g2: 0 }, safetyStock: 5, rop: 10, supplierId: "sp-3", batchNo: "LOT-UVC-2604", expiryDate: "2026-10-28" },
  { id: "m-10", code: "BB-INK-MGT", name: "Tinta UV Magenta", categoryId: "cm-ink", brands: [], unitId: "u-kg", stock: { g1: 14, g2: 2 }, safetyStock: 5, rop: 10, supplierId: "sp-3", batchNo: "LOT-UVM-2606", expiryDate: "2027-01-15" },
  { id: "m-11", code: "BB-INK-YLW", name: "Tinta UV Yellow", categoryId: "cm-ink", brands: [], unitId: "u-kg", stock: { g1: 11, g2: 0 }, safetyStock: 5, rop: 10, supplierId: "sp-3", batchNo: "LOT-UVY-2606", expiryDate: "2026-11-20" },
  { id: "m-12", code: "BB-INK-BLK", name: "Tinta Offset Hitam Toyo", categoryId: "cm-ink", brands: [], unitId: "u-kg", stock: { g1: 4, g2: 3 }, safetyStock: 8, rop: 15, supplierId: "sp-3", batchNo: "LOT-OBK-2607", expiryDate: "2027-03-10" },
  { id: "m-13", code: "BB-FOL-GLD", name: "Foil Hot Stamping Gold", categoryId: "cm-finishing", brands: ["Pepipapier", "Packsolution.id"], unitId: "u-roll", stock: { g1: 7, g2: 2 }, safetyStock: 3, rop: 6, supplierId: "sp-4", batchNo: "LOT-FG-2605" },
  { id: "m-14", code: "BB-FOL-SLV", name: "Foil Hot Stamping Silver", categoryId: "cm-finishing", brands: ["Pepipapier"], unitId: "u-roll", stock: { g1: 3, g2: 1 }, safetyStock: 2, rop: 4, supplierId: "sp-4", batchNo: "LOT-FS-2605" },
  { id: "m-15", code: "BB-LAM-DOF", name: "Laminasi Doff 32cm", categoryId: "cm-finishing", brands: ["Estella", "memoirs.print"], unitId: "u-roll", stock: { g1: 15, g2: 5 }, safetyStock: 4, rop: 8, supplierId: "sp-7", batchNo: "LOT-LD-2608" },
  { id: "m-16", code: "BB-VRN-UV", name: "Varnish UV Gloss", categoryId: "cm-finishing", brands: [], unitId: "u-ltr", stock: { g1: 18, g2: 0 }, safetyStock: 10, rop: 20, supplierId: "sp-3", batchNo: "LOT-VUV-2603", expiryDate: "2026-10-18" },
  { id: "m-17", code: "BB-LEM-KNG", name: "Lem Kuning Rigid Box", categoryId: "cm-adhesive", brands: ["Packsolution.id", "memoirs.print"], unitId: "u-kg", stock: { g1: 45, g2: 20 }, safetyStock: 15, rop: 30, supplierId: "sp-5", batchNo: "LOT-LK-2609", expiryDate: "2027-02-01" },
  { id: "m-18", code: "BB-HTM-001", name: "Hot Melt Glue Stick", categoryId: "cm-adhesive", brands: [], unitId: "u-kg", stock: { g1: 9, g2: 4 }, safetyStock: 5, rop: 10, supplierId: "sp-5", batchNo: "LOT-HM-2608" },
  { id: "m-19", code: "BB-FLX-ALU", name: "Film PET/ALU/LLDPE 100mic", categoryId: "cm-flex", brands: ["pikpurry"], unitId: "u-roll", stock: { g1: 2, g2: 3 }, safetyStock: 3, rop: 6, supplierId: "sp-7", dimension: "Lebar 60 cm", batchNo: "LOT-FLX-2609" },
];

// ---------------------------------------------------------------------
// Sparepart & Consumable
// ---------------------------------------------------------------------
export const SPAREPARTS: Sparepart[] = [
  { id: "s-1", code: "SP-BLK-SM74", name: "Blanket Offset SM74", categoryId: "cs-blanket", unitId: "u-pcs", stock: { g1: 4, g2: 0 }, safetyStock: 2, rop: 4, supplierId: "sp-6", machine: "Heidelberg SM74" },
  { id: "s-2", code: "SP-RLR-INK", name: "Roller Tinta Karet", categoryId: "cs-blanket", unitId: "u-pcs", stock: { g1: 1, g2: 0 }, safetyStock: 2, rop: 3, supplierId: "sp-6", machine: "Heidelberg SM74" },
  { id: "s-3", code: "SP-PSU-115", name: "Pisau Potong Polar 115", categoryId: "cs-blade", unitId: "u-pcs", stock: { g1: 3, g2: 1 }, safetyStock: 1, rop: 2, supplierId: "sp-6", machine: "Polar 115 Cutter" },
  { id: "s-4", code: "SP-RBR-PND", name: "Rubber Pond Die-Cut", categoryId: "cs-blade", unitId: "u-mtr", stock: { g1: 12, g2: 0 }, safetyStock: 5, rop: 10, supplierId: "sp-2", machine: "Die-Cut Bobst" },
  { id: "s-5", code: "SP-FNT-SOL", name: "Fountain Solution", categoryId: "cs-chem", unitId: "u-ltr", stock: { g1: 8, g2: 2 }, safetyStock: 5, rop: 10, supplierId: "sp-8", machine: "Heidelberg SM74", batchNo: "LOT-FS-2607", expiryDate: "2026-11-05" },
  { id: "s-6", code: "SP-BLW-001", name: "Blanket Wash", categoryId: "cs-chem", unitId: "u-ltr", stock: { g1: 20, g2: 5 }, safetyStock: 6, rop: 12, supplierId: "sp-8", batchNo: "LOT-BW-2608", expiryDate: "2027-04-01" },
  { id: "s-7", code: "SP-OLI-HDR", name: "Oli Hidrolik ISO 46", categoryId: "cs-chem", unitId: "u-ltr", stock: { g1: 16, g2: 0 }, safetyStock: 5, rop: 10, supplierId: "sp-6", machine: "Mesin Pond Otomatis" },
  { id: "s-8", code: "SP-LMP-UV", name: "Lampu UV Curing 5kW", categoryId: "cs-elec", unitId: "u-pcs", stock: { g1: 1, g2: 0 }, safetyStock: 1, rop: 2, supplierId: "sp-6", machine: "UV Coater" },
  { id: "s-9", code: "SP-SNS-PPR", name: "Sensor Kertas Feeder", categoryId: "cs-elec", unitId: "u-pcs", stock: { g1: 2, g2: 1 }, safetyStock: 1, rop: 2, supplierId: "sp-6", machine: "Heidelberg SM74" },
  { id: "s-10", code: "SP-MJN-001", name: "Lap Majun", categoryId: "cs-consumable", unitId: "u-kg", stock: { g1: 25, g2: 10 }, safetyStock: 10, rop: 20, supplierId: "sp-5" },
  { id: "s-11", code: "SP-SRT-NTR", name: "Sarung Tangan Nitril", categoryId: "cs-consumable", unitId: "u-box", stock: { g1: 3, g2: 2 }, safetyStock: 3, rop: 6, supplierId: "sp-5" },
];

// ---------------------------------------------------------------------
// Produk (barang jadi & setengah jadi)
// ---------------------------------------------------------------------
export const PRODUCTS: Product[] = [
  { id: "p-1", sku: "PS-HBX-GLD-01", name: "Hardbox Rigid Premium Gold 20x20", brand: "Packsolution.id", type: "Barang Jadi", categoryId: "cp-hardbox", unitId: "u-pcs", stock: { g1: 850, g2: 300 }, minStock: 500 },
  { id: "p-2", sku: "PS-HBX-MGN-02", name: "Hardbox Magnetic Closure Black", brand: "Packsolution.id", type: "Barang Jadi", categoryId: "cp-hardbox", unitId: "u-pcs", stock: { g1: 120, g2: 60 }, minStock: 300 },
  { id: "p-3", sku: "ES-SFB-MAT-01", name: "Softbox Skincare Matte Doff 30ml", brand: "Estella", type: "Barang Jadi", categoryId: "cp-softbox", unitId: "u-pcs", stock: { g1: 2400, g2: 1600 }, minStock: 1500 },
  { id: "p-4", sku: "ES-SFB-SRM-02", name: "Softbox Serum Kraft 15ml", brand: "Estella", type: "Barang Jadi", categoryId: "cp-softbox", unitId: "u-pcs", stock: { g1: 0, g2: 0 }, minStock: 1000 },
  { id: "p-5", sku: "PP-GRC-FOL-01", name: "Greeting Card Foil Emboss A6", brand: "Pepipapier", type: "Barang Jadi", categoryId: "cp-card", unitId: "u-pcs", stock: { g1: 980, g2: 220 }, minStock: 400 },
  { id: "p-6", sku: "PP-HTG-KRF-02", name: "Hangtag Kraft Custom Tali", brand: "Pepipapier", type: "Barang Jadi", categoryId: "cp-card", unitId: "u-pack", stock: { g1: 40, g2: 15 }, minStock: 30 },
  { id: "p-7", sku: "MP-PBK-LNN-01", name: "Photobook Hardcover Linen 20x30", brand: "memoirs.print", type: "Barang Jadi", categoryId: "cp-photobook", unitId: "u-pcs", stock: { g1: 35, g2: 10 }, minStock: 50 },
  { id: "p-8", sku: "MP-ALB-MNI-02", name: "Mini Album Polaroid Kraft", brand: "memoirs.print", type: "Barang Jadi", categoryId: "cp-photobook", unitId: "u-pcs", stock: { g1: 210, g2: 90 }, minStock: 100 },
  { id: "p-9", sku: "PK-PCH-ZIP-01", name: "Standing Pouch Ziplock Snack 250g", brand: "pikpurry", type: "Barang Jadi", categoryId: "cp-pouch", unitId: "u-pcs", stock: { g1: 5200, g2: 3000 }, minStock: 4000 },
  { id: "p-10", sku: "PS-SMI-WRP-01", name: "Wrapping Art Carton Tercetak (Hardbox Gold)", brand: "Packsolution.id", type: "Setengah Jadi", categoryId: "cp-semi", unitId: "u-lbr", stock: { g1: 1300, g2: 0 }, minStock: 500 },
  { id: "p-11", sku: "ES-SMI-DCT-01", name: "Lembar Die-Cut Softbox Skincare", brand: "Estella", type: "Setengah Jadi", categoryId: "cp-semi", unitId: "u-lbr", stock: { g1: 600, g2: 250 }, minStock: 800 },
  { id: "p-12", sku: "MP-SMI-CVR-01", name: "Cover Linen Photobook (belum rakit)", brand: "memoirs.print", type: "Setengah Jadi", categoryId: "cp-semi", unitId: "u-pcs", stock: { g1: 80, g2: 0 }, minStock: 40 },
];

// ---------------------------------------------------------------------
// Riwayat mutasi stok
// ---------------------------------------------------------------------
export const STOCK_MOVEMENTS: StockMovement[] = [
  { id: "mv-1", itemKind: "material", itemId: "m-1", itemName: "Ivory 300gr", type: "IN", warehouse: "g1", qty: 40, reference: "PO-2609-011", note: "Kedatangan dari PT Sinar Kertas", user: "Hendra Wijaya", date: "2026-10-01T09:15:00" },
  { id: "mv-2", itemKind: "material", itemId: "m-1", itemName: "Ivory 300gr", type: "OUT", warehouse: "g1", qty: 52, reference: "SPK-2609-044", note: "Produksi Hardbox Gold", user: "Hendra Wijaya", date: "2026-10-03T13:40:00" },
  { id: "mv-3", itemKind: "material", itemId: "m-1", itemName: "Ivory 300gr", type: "TRANSFER", warehouse: "g1", toWarehouse: "g2", qty: 10, note: "Penyangga order Estella", user: "Hendra Wijaya", date: "2026-10-04T10:05:00" },
  { id: "mv-4", itemKind: "material", itemId: "m-9", itemName: "Tinta UV Cyan", type: "OUT", warehouse: "g1", qty: 3, reference: "SPK-2609-046", user: "Hendra Wijaya", date: "2026-10-02T08:30:00" },
  { id: "mv-5", itemKind: "material", itemId: "m-9", itemName: "Tinta UV Cyan", type: "OPNAME", warehouse: "g1", qty: -1, note: "Selisih opname bulanan", user: "Hendra Wijaya", date: "2026-09-30T16:00:00" },
  { id: "mv-6", itemKind: "material", itemId: "m-7", itemName: "Hardboard 2mm", type: "IN", warehouse: "g1", qty: 500, reference: "PO-2609-008", user: "Hendra Wijaya", date: "2026-09-28T11:00:00" },
  { id: "mv-7", itemKind: "material", itemId: "m-12", itemName: "Tinta Offset Hitam Toyo", type: "OUT", warehouse: "g1", qty: 6, reference: "SPK-2609-040", user: "Hendra Wijaya", date: "2026-10-04T14:20:00" },
  { id: "mv-8", itemKind: "material", itemId: "m-6", itemName: "Kraft Liner Brown 275gr", type: "TRANSFER", warehouse: "g2", toWarehouse: "g1", qty: 8, user: "Hendra Wijaya", date: "2026-10-05T08:10:00" },
  { id: "mv-9", itemKind: "product", itemId: "p-1", itemName: "Hardbox Rigid Premium Gold 20x20", type: "IN", warehouse: "g1", qty: 400, reference: "QC-2610-003", note: "Hasil produksi lolos QC", user: "Hendra Wijaya", date: "2026-10-03T17:00:00" },
  { id: "mv-10", itemKind: "product", itemId: "p-1", itemName: "Hardbox Rigid Premium Gold 20x20", type: "OUT", warehouse: "g1", qty: 250, reference: "DO-2610-012", note: "Pengiriman PT Artha Boga", user: "Hendra Wijaya", date: "2026-10-04T09:00:00" },
  { id: "mv-11", itemKind: "product", itemId: "p-3", itemName: "Softbox Skincare Matte Doff 30ml", type: "TRANSFER", warehouse: "g1", toWarehouse: "g2", qty: 600, user: "Hendra Wijaya", date: "2026-10-02T15:30:00" },
  { id: "mv-12", itemKind: "sparepart", itemId: "s-2", itemName: "Roller Tinta Karet", type: "OUT", warehouse: "g1", qty: 1, note: "Penggantian roller unit 3", user: "Hendra Wijaya", date: "2026-10-01T10:00:00" },
  { id: "mv-13", itemKind: "sparepart", itemId: "s-5", itemName: "Fountain Solution", type: "IN", warehouse: "g1", qty: 10, reference: "PO-2609-015", user: "Hendra Wijaya", date: "2026-09-25T09:45:00" },
];

// ---------------------------------------------------------------------
// Antrean produksi (read-only, info kebutuhan bahan)
// ---------------------------------------------------------------------
export const PRODUCTION_QUEUE: ProductionQueueItem[] = [
  { id: "q-1", orderNumber: "ORD-2026-0901", brand: "Packsolution.id", product: "Hardbox Rigid Premium Gold", quantity: "2.500 pcs", dueDate: "2026-10-08", priority: "Urgent", requirements: [{ materialId: "m-7", qty: 650 }, { materialId: "m-3", qty: 12 }, { materialId: "m-13", qty: 2 }] },
  { id: "q-2", orderNumber: "ORD-2026-0902", brand: "Estella", product: "Softbox Skincare Matte Doff", quantity: "5.000 pcs", dueDate: "2026-10-10", priority: "High", requirements: [{ materialId: "m-1", qty: 20 }, { materialId: "m-15", qty: 3 }] },
  { id: "q-3", orderNumber: "ORD-2026-0903", brand: "Pepipapier", product: "Greeting Card Foil Emboss", quantity: "1.200 pcs", dueDate: "2026-10-12", priority: "Normal", requirements: [{ materialId: "m-2", qty: 4 }, { materialId: "m-13", qty: 1 }] },
  { id: "q-4", orderNumber: "ORD-2026-0904", brand: "memoirs.print", product: "Photobook Hardcover Linen", quantity: "350 pcs", dueDate: "2026-10-09", priority: "High", requirements: [{ materialId: "m-8", qty: 180 }, { materialId: "m-4", qty: 8 }, { materialId: "m-17", qty: 6 }] },
  { id: "q-5", orderNumber: "ORD-2026-0905", brand: "pikpurry", product: "Packaging Snack Pouch Ziplock", quantity: "10.000 pcs", dueDate: "2026-10-15", priority: "Normal", requirements: [{ materialId: "m-19", qty: 6 }, { materialId: "m-9", qty: 2 }] },
];
