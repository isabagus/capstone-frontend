# Product Requirement Document (PRD)
## Sistem Pengelolaan Inventori dan Pemantauan Produksi dengan Fitur Prediksi Harga Bahan Baku

---

## 1. Informasi Umum & Tujuan Produk
* **Nama Sistem:** Sistem Pengelolaan Inventori dan Pemantauan Produksi dengan Fitur Prediksi Harga Bahan Baku.
* **Klien / Mitra:** CV Solusi Inovasi Packaging.
* **Cakupan Brand (Lima Brand):** Packsolution.id, Estella Digital Printing, Pepipapier, memoirs.print, dan pikpurry.
* **Cakupan Lokasi (Dua Gudang):** Gudang 1 (Utama) dan Gudang 2 (Toko / Ruko).
* **Tujuan Utama:** Mengintegrasikan alur operasional dari penerimaan order penjualan, pengecekan ketersediaan stok bahan baku multi-gudang, otomatisasi perhitungan kebutuhan bahan (BOM Engine), pembuatan SPK internal/vendor, pemantauan status produksi & QC, hingga modul analisis prediksi harga bahan baku impor berbasis fluktuasi kurs USD.
* **Arsitektur & Tech Stack:**
  * **Arsitektur Sistem:** Microservices Architecture (Decoupled Frontend & Backend Services).
  * **Frontend Framework:** Next.js (React Framework, App Router, SSR & Client Components, Tailwind CSS).
  * **Backend Framework:** Laravel RESTful Microservices (Auth & Gateway, Inventory Service, Order Service, BOM Service, Production Service, Analytics & Billing Service).
  * **Komunikasi Antar-Service:** RESTful API via API Gateway & Event Bus (Redis Pub/Sub / Message Queue) untuk komunikasi asinkron.
  * **Database:** PostgreSQL (Schema Isolation / Database per Service dengan kepatuhan transaksi ACID pada batas domain servis).
  * **Integrasi Eksternal:** API Kurs USD/IDR eksternal (`fawazahmed0/currency-api`).

---

## 2. Matriks Hak Akses Pengguna (RBAC - Tujuh Roles)

| Peran (Role) | Tanggung Jawab Operasional | Hak Akses Utama Sistem (Next.js FE & API Gateway) |
| :--- | :--- | :--- |
| **Owner** | Pengawasan menyeluruh aktivitas bisnis dan evaluasi laporan eksekutif. | Full access ke seluruh dashboard Next.js, pemantauan transaksi inventori, dan audit log. |
| **Manager** | Pengawasan proses bisnis, persetujuan pesanan khusus, dan evaluasi stok opname. | Otorisasi pesanan khusus, evaluasi stok opname, dan penyesuaian batas safety stock/ROP. |
| **Front Office (FO)** | Pelayanan pelanggan, input order pesanan, dan verifikasi ketersediaan stok. | Form input order Next.js, verifikasi ketersediaan stok otomatis (Stock Pre-validation API). |
| **Tim Design** | Verifikasi spesifikasi cetak, perhitungan BOM, dan penerbitan SPK. | Modul BOM Engine Next.js, pembuat SPK Digital (Internal & External), pembatasan revisi (maksimal 4x). |
| **Kepala Produksi** | Pengaturan antrean produksi, alokasi mesin/teknisi, dan pemantauan tahapan. | Papan Kanban produksi interaktif Next.js, alokasi SPK ke teknisi, dan pembaruan status pengerjaan. |
| **Quality Control (QC)** | Pemeriksaan kualitas produk setengah jadi dan barang jadi. | Modul inspeksi QC Next.js, input status kelayakan (Pass/Fail), dan trigger event update status barang. |
| **Staf Gudang** | Pencatatan mutasi barang, pemindahan antar-gudang, dan stock opname. | Inventory ledger UI, transfer stok (Gudang 1 <-> Gudang 2), batch/lot tracker, dan konversi satuan. |

---

## 3. Spesifikasi Modul & Layanan Microservice

| Kode Modul | Nama Modul / Service | Deskripsi Kebutuhan & Fitur Utama |
| :--- | :--- | :--- |
| **MOD-01** | **Inventory Microservice** | • Pengelompokan stok: Bahan Baku Utama, Barang Setengah Jadi, Barang Jadi, Spare Part & Consumables.<br>• Filter dinamis stok dan riwayat pemakaian berbasis lima brand.<br>• Pencatatan mutasi barang dan transfer stok real-time antara Gudang 1 dan Gudang 2.<br>• Stock opname dan pelacakan nomor batch/lot (kadaluarsa tinta & kelembaban kertas). |
| **MOD-02** | **Order Intake Microservice** | • Antarmuka Next.js input pesanan pelanggan terintegrasi lima brand.<br>• Pengecekan ketersediaan bahan otomatis via inter-service call ke Inventory Service.<br>• Pembatasan revisi desain teknis maksimal empat kali per pesanan.<br>• Penentuan prioritas pengerjaan berbasis deadline pelanggan. |
| **MOD-03** | **BOM & Conversion Microservice** | • Perhitungan alokasi bersih kebutuhan bahan baku secara otomatis via REST API.<br>• Konversi otomatis satuan kertas (Plano, Rim, Lembar, Kg) berbasis ukuran potong & gramatur.<br>• Kalkulasi sisa bahan potongan (waste %) dan cadangan cetak (insheet). |
| **MOD-04** | **SPK Digital Microservice** | • Generasi dokumen SPK Digital terstandar (PDF) setelah spesifikasi teknis disetujui.<br>• Pemisahan struktur SPK Internal (produksi mandiri) dan SPK Eksternal (khusus empat vendor mitra terdaftar). |
| **MOD-05** | **Production & QC Microservice** | • Dasbor Kanban real-time (Next.js WebSocket / Polling): `Design Approved` -> `In-Progress Production` -> `Finishing` -> `QC Passed` -> `Ready to Deliver`.<br>• Input inspeksi fisik oleh QC dengan status Pass atau Fail.<br>• Alokasi mesin dan teknisi penanggung jawab oleh Kepala Produksi. |
| **MOD-06** | **ROP Alert Engine (Inventory Sub-Service)** | • Pemantauan safety stock minimum per jenis material.<br>• Pemicu notifikasi visual (alert warna merah di Next.js) saat stok mencapai Reorder Point. |
| **MOD-07** | **USD Analytics Microservice** | • Pencatatan histori harga beli bahan baku dari supplier.<br>• Integrasi harian API Kurs USD/IDR eksternal via Laravel Scheduled Task.<br>• Analisis estimasi tren perubahan harga bahan baku impor berbasis fluktuasi kurs. |
| **MOD-08** | **Billing & Audit Microservice** | • Generasi dokumen PDF Invoice otomatis setelah barang lulus QC (`QC_PASSED` event).<br>• Pencatatan Immutable Audit Log (riwayat mutasi stok & transaksi read-only).<br>• Ekspor laporan persediaan, pemakaian per brand, dan operasional ke format Excel & PDF. |
| **MOD-09** | **Auth & API Gateway Microservice** | • Sentralisasi autentikasi JWT / Laravel Sanctum, penanganan CORS, routing API, serta RBAC ketat untuk tujuh role pengguna. |

---

## 4. Kebutuhan Non-Fungsional (NFR)
* **Kinerja & Skalabilitas (NFR-01):** Response time REST API standar maksimal 2 detik, kalkulasi BOM Engine < 1 detik, generasi PDF SPK/Invoice maksimal 3 detik.
* **Keamanan & Akuntabilitas (NFR-02):** Akses endpoint API Gateway dikontrol ketat oleh JWT/Sanctum RBAC, kata sandi terenkripsi aman, log audit mutasi stok bersifat immutable (tidak dapat diubah/dihapus).
* **Keandalan Data (NFR-03):** PostgreSQL pada Inventory Service wajib menerapkan transaksi berprinsip ACID (`BEGIN...COMMIT` dengan Locking) untuk mencegah race condition stok, target ketersediaan sistem > 97% selama jam operasional.
* **Kebiasaan Penggunaan & UI (NFR-04):** Antarmuka Next.js responsive (desktop, laptop, tablet gudang, smartphone), dasbor menggunakan indikator warna visual (merah untuk ROP kritis, kuning/merah untuk pesanan urgent).
* **Arsitektur (NFR-05):** Decoupled architecture berbasis Next.js untuk Frontend dan Laravel Microservices untuk Backend.

---

## 5. Batasan Sistem (System Boundary)
* **In-Scope:** Pengelolaan stok terpusat dua gudang & lima brand, kalkulasi otomatis BOM, SPK Internal & Eksternal (empat vendor mitra), Kanban tracking produksi & QC, analitik prediksi harga berbasis kurs USD, otomasi Invoice PDF & Immutable Audit Trail.
* **Out-of-Scope:** Pengelolaan akuntansi/keuangan lengkap, perhitungan laba-rugi, penggajian (payroll), payment gateway, serta pemantauan langsung proses internal di lokasi vendor.