# Implementation Plan & Workflow Pengembangan Aplikasi (Per Sprint)
## Sistem Pengelolaan Inventori dan Pemantauan Produksi CV Solusi Inovasi Packaging

---

## 1. Alur Operasional Aplikasi & Komunikasi Microservices

[ Client: Next.js Frontend ]
          │
          ▼  (REST API / JWT Auth Header)
[ API Gateway / Auth Service (Laravel) ]
          │
  ┌───────┼───────────────────────────┬───────────────────────────┐
  ▼       ▼                           ▼                           ▼
[ Order Service ]           [ Inventory Service ]       [ BOM & SPK Service ]
  (FO Input & Validation)     (Multi-Warehouse & ROP)     (BOM Engine & SPK PDF)
          │                           │                           │
          └───────────────────────────┼───────────────────────────┘
                                      │ (Event Bus / API Call)
                                      ▼
                        [ Production & QC Service ]
                        (Kanban Board & QC Pass/Fail)
                                      │
                                      ▼ (QC Passed Event)
                        [ Billing & Analytics Service ]
                        (Invoice PDF, USD Analytics, & Audit Log)

---

## 2. Struktur Tim & Pembagian Dual-Role

Pengembangan dilakukan oleh tim yang terdiri dari empat anggota dengan penugasan *dual-role*:

| Anggota Tim | Peran Utama & Peran Kedua | Fokus Utama Pengerjaan |
| :--- | :--- | :--- |
| **Isa Bagus Prakoso** | Project Manager & Back-End Lead | Manajemen backlog, arsitektur API Gateway, Laravel Microservices (BOM Service, SPK Generator, Billing API). |
| **Samuel Dwi Saputro** | System Analyst & Back-End Developer | Analisis domain service, skema isolasi database PostgreSQL, JWT RBAC, mutasi stok ACID, dan USD Analytics Service. |
| **Candra Sutomo** | UI/UX Designer & Front-End Lead | Desain UI/UX Figma, arsitektur Next.js App Router, komponen UI Tailwind CSS, Papan Kanban Next.js, dan ROP Indicator. |
| **Mustafa Malik Ibrahim** | Database Engineer & Front-End Developer | Schema DDL PostgreSQL per service, API integration di Next.js (Form FO, Stock Opname UI, dan QC Inspection Board). |

---

## 3. Implementation Plan per Sprint (Agile Scrum-Kanban)

---

### **Sprint 1 (Minggu 1–2): Architecture Setup, API Gateway, Auth Service & Next.js Foundation**
* **Fokus Utama:** Inisialisasi arsitektur microservices, API Gateway, Auth Microservice (Laravel JWT/Sanctum), fondasi proyek Next.js, serta RBAC untuk tujuh role pengguna.
* **Modul Terkait:** **MOD-09 (Auth & API Gateway Microservice)** & Fondasi Arsitektur Sistem.
* **Detail Pekerjaan Modul & Fitur:**
  * **Infrastruktur & Arsitektur:** Setup repositori Git (Monorepo / Multi-repo), inisialisasi aplikasi Next.js (App Router, Tailwind CSS), setup Laravel API Gateway & Auth Service, serta basis data PostgreSQL.
  * **MOD-09 (Auth & API Gateway):**
    * *Database DDL:* Pembuatan tabel `users`, `roles`, `permissions`, dan `refresh_tokens`.
    * *Backend:* Implementasi REST API autentikasi (login/logout/refresh token) dan Middleware JWT RBAC rigid untuk tujuh role (*Owner*, *Manager*, *Front Office*, *Tim Design*, *Kepala Produksi*, *Quality Control*, *Staf Gudang*).
    * *Frontend (Next.js):* Setup Layout utama, NextAuth / Custom Auth Provider, Protected Routes, dan Navigasi Bar dinamis sesuai hak akses token login.
* **Pembagian Tugas Anggota Tim:**
  * **Isa Bagus Prakoso (PM & BE Lead):** Setup repositori Git, konfigurasi Laravel API Gateway, & pengerjaan Auth Microservice.
  * **Samuel Dwi Saputro (Analyst & BE):** Spesifikasi matriks otorisasi RBAC tujuh Role, token verification, & endpoint permission checker.
  * **Candra Sutomo (UI/UX & FE Lead):** Desain Figma UI Dashboard layout, Halaman Login Next.js, & komponen UI reusabel.
  * **Mustafa Malik Ibrahim (DB & FE):** Perancangan DDL PostgreSQL Auth DB, integrasi form Login di Next.js dengan API Auth.
* **Target Deliverable & Definition of Done (DoD):** Seluruh role dapat melakukan login via Next.js FE dan API Gateway berhasil memvalidasi JWT token serta membatasi akses menu/endpoint.

---

### **Sprint 2 (Minggu 3–4): Inventory Microservice, Multi-Gudang, Multi-Brand & ROP Alert Engine**
* **Fokus Utama:** REST API Pengelolaan data stok material di dua lokasi gudang, filter lima brand, mutasi aman berprinsip ACID, pemicu ROP Alert, serta UI Inventory di Next.js.
* **Modul Terkait:** **MOD-01 (Inventory Microservice)** & **MOD-06 (ROP Alert Engine)**.
* **Detail Pekerjaan Modul & Fitur:**
  * **MOD-01 (Inventory Microservice):**
    * *Database:* Pembuatan tabel `materials`, `warehouses` (Gudang 1 Utama & Gudang 2 Ruko), `brands` (Packsolution.id, Estella, Pepipapier, memoirs.print, pikpurry), `stock_mutations`, dan `batch_lots`.
    * *Backend Logic:* REST API CRUD material (empat kategori). Logika mutasi & transfer stok antar-gudang berbasis transaksi PostgreSQL (`BEGIN...COMMIT` dengan DB Locking `SELECT FOR UPDATE` untuk kepatuhan ACID).
    * *Fitur Khusus:* Modul Stock Opname API dan pelacakan nomor Batch/Lot (kadaluarsa tinta & kelembaban kertas).
  * **MOD-06 (ROP Alert Engine):**
    * REST API pemantauan *Safety Stock* minimum per item material.
    * Notifikasi visual (*alert* warna merah) pada dashboard Next.js Gudang dan Manager saat stok mencapai *Reorder Point*.
* **Pembagian Tugas Anggota Tim:**
  * **Isa Bagus Prakoso (PM & BE Lead):** Controller & REST API mutasi stok ACID, Service Transfer Stok antar-gudang.
  * **Samuel Dwi Saputro (Analyst & BE):** Analisis transaksi ACID PostgreSQL, logic penentuan ROP & alert checker API.
  * **Candra Sutomo (UI/UX & FE Lead):** UI Next.js Katalog Material, Filter lima Brand, Form Transfer Stok, dan komponen Badge Alert ROP Merah.
  * **Mustafa Malik Ibrahim (DB & FE):** Schema DB Material/Warehouse/Mutations, UI Next.js Stock Opname & Batch/Lot Tracker.
* **Target Deliverable & Definition of Done (DoD):** REST API Stok ter-update real-time tanpa *race condition*, dan UI Next.js menampilkan badge ROP warna merah otomatis jika stok $\le$ Safety Stock.

---

### **Sprint 3 (Minggu 5–6): Order Intake Microservice & BOM Engine Microservice**
* **Fokus Utama:** Layanan order pelanggan FO di Next.js, inter-service API call untuk validasi stok, pembatasan revisi desain, serta kalkulator konversi bahan baku.
* **Modul Terkait:** **MOD-02 (Order Intake Microservice)** & **MOD-03 (BOM & Conversion Microservice)**.
* **Detail Pekerjaan Modul & Fitur:**
  * **MOD-02 (Order Intake Microservice):**
    * *Database:* Pembuatan tabel `orders`, `order_items`, dan `order_revisions`.
    * Form Next.js *input* order pelanggan FO terintegrasi lima brand + penentuan prioritas pengerjaan berbasis *deadline*.
    * *Stock Pre-Validation Engine:* Pengecekan ketersediaan bahan baku via API call ke Inventory Service saat order di-input.
    * Aturan pembatasan revisi desain teknis antara pelanggan dan Tim Design maksimal empat kali per pesanan.
  * **MOD-03 (BOM & Conversion Microservice):**
    * *Database:* Pembuatan tabel `boms` dan `conversion_rules`.
    * Algoritma API konversi satuan kertas teknis (Plano, Rim, Lembar, Kg) berdasarkan ukuran potong dan gramatur.
    * Perhitungan otomatis sisa bahan potongan (*waste %*) dan cadangan lembar cetak (*insheet*).
* **Pembagian Tugas Anggota Tim:**
  * **Isa Bagus Prakoso (PM & BE Lead):** Logic Engine BOM Microservice, rumus matematika konversi kertas, waste %, dan insheet.
  * **Samuel Dwi Saputro (Analyst & BE):** Logic Stock Pre-Validation inter-service API call, counter revisi desain (max 4x), dan urutan prioritas deadline.
  * **Candra Sutomo (UI/UX & FE Lead):** UI Form Input Order FO di Next.js, UI Kalkulator BOM interaktif Tim Design, visual indikator prioritas order.
  * **Mustafa Malik Ibrahim (DB & FE):** Schema DB Orders & BOM, integrasi form detail spesifikasi cetak dengan Next.js.
* **Target Deliverable & Definition of Done (DoD):** FO dapat meng-input order di Next.js dengan validasi stok instan, BOM Engine API merespons $< 1$ detik, dan sistem mengunci revisi ke-5.

---

### **Sprint 4 (Minggu 7–8): SPK Digital Microservice, Production & QC Microservice (Kanban Next.js)**
* **Fokus Utama:** Generator PDF SPK (Internal & empat Vendor Mitra), papan pelacakan antrean produksi di Next.js, serta modul kontrol kualitas.
* **Modul Terkait:** **MOD-04 (SPK Digital Microservice)** & **MOD-05 (Production & QC Microservice)**.
* **Detail Pekerjaan Modul & Fitur:**
  * **MOD-04 (SPK Digital Microservice):**
    * *Database:* Pembuatan tabel `spks` dan `vendors` (terkunci khusus empat vendor mitra terdaftar).
    * Pemicu SPK otomatis terbit setelah spesifikasi desain disetujui (`Design Approved`).
    * Pemisahan struktur & format PDF SPK Internal (produksi mandiri) dan SPK Eksternal (ditujukan ke empat vendor mitra).
  * **MOD-05 (Production & QC Microservice):**
    * *Database:* Pembuatan tabel `production_stages`, `machine_allocations`, dan `qc_logs`.
    * Dasbor Kanban Next.js real-time (`Design Approved` $\rightarrow$ `In-Progress Production` $\rightarrow$ `Finishing` $\rightarrow$ `QC Passed` $\rightarrow$ `Ready to Deliver`).
    * Fitur alokasi teknisi/mesin oleh Kepala Produksi & urutan antrean berbasis *deadline*.
    * Form Next.js pencatatan inspeksi fisik QC dengan status Lolos (*Pass*) atau Tidak Lolos (*Fail*) & penanganan *re-work* jika Fail.
* **Pembagian Tugas Anggota Tim:**
  * **Isa Bagus Prakoso (PM & BE Lead):** Generator PDF SPK Service (Internal & Eksternal empat Vendor), API update status produksi.
  * **Samuel Dwi Saputro (Analyst & BE):** Logic workflow Kanban produksi API, pengalihan status QC Pass/Fail & trigger notification.
  * **Candra Sutomo (UI/UX & FE Lead):** UI Papan Kanban Interactive Board di Next.js, UI Modal Alokasi Mesin, Form Inspeksi QC.
  * **Mustafa Malik Ibrahim (DB & FE):** Schema DB SPK & Production Stages, UI Pratinjau & Download PDF SPK di Next.js.
* **Target Deliverable & Definition of Done (DoD):** PDF SPK terbit $< 3$ detik, Papan Kanban Next.js ter-update real-time, dan QC dapat meng-input hasil inspeksi via API.

---

### **Sprint 5 (Minggu 9–10): USD Analytics Microservice, Billing Microservice & Audit Trail**
* **Fokus Utama:** Integrasi API Kurs USD/IDR harian, analitik estimasi harga bahan baku impor, automasi faktur tagihan PDF, serta *immutable log*.
* **Modul Terkait:** **MOD-07 (USD Analytics Microservice)** & **MOD-08 (Billing & Audit Microservice)**.
* **Detail Pekerjaan Modul & Fitur:**
  * **MOD-07 (USD Analytics Microservice):**
    * *Database:* Pembuatan tabel `currency_logs` dan `supplier_price_histories`.
    * Integrasi HTTP Client ke API Kurs USD/IDR eksternal (`fawazahmed0/currency-api`) yang dijalankan harian via Laravel Scheduled Task.
    * Pencatatan riwayat harga beli dari supplier & REST API analitik estimasi tren fluktuasi harga bahan baku impor.
  * **MOD-08 (Billing & Audit Microservice):**
    * *Database:* Pembuatan tabel `invoices` dan `audit_logs` (diatur *read-only* tanpa fitur *delete/update*).
    * Generasi PDF Invoice otomatis saat menerima event `QC_PASSED`.
    * *Immutable Audit Log*: Pencatatan otomatis setiap pergerakan mutasi stok dan penyesuaian transaksi via middleware/event listener.
    * Fitur ekspor laporan persediaan, pemakaian material per brand, dan operasional ke format Excel & PDF.
* **Pembagian Tugas Anggota Tim:**
  * **Isa Bagus Prakoso (PM & BE Lead):** Generator PDF Invoice API, Exporter Service (Excel & PDF) via Laravel.
  * **Samuel Dwi Saputro (Analyst & BE):** Integrasi API Kurs USD/IDR, logic analytics tren harga, Middleware Immutable Audit Log.
  * **Candra Sutomo (UI/UX & FE Lead):** UI Dasbor Analitik Grafik Kurs & Tren Harga di Next.js (Chart.js/Recharts), UI Halaman Laporan & Audit Trail.
  * **Mustafa Malik Ibrahim (DB & FE):** Schema DB Currency & Audit Log, UI Invoice Preview & Export Buttons di Next.js.
* **Target Deliverable & Definition of Done (DoD):** Invoice PDF terbit otomatis setelah QC Pass, API Kurs USD ter-update harian, serta Audit Log tercatat otomatis tanpa bisa diubah/dihapus.

---

### **Sprint 6 (Minggu 11–12): Microservices Integration, Containerization (Docker), UAT & Cloud/VPS Deployment**
* **Fokus Utama:** Pengujian integrasi antar-microservice, kontainerisasi Docker, User Acceptance Testing (UAT), perbaikan bug, dan peluncuran ke server VPS.
* **Detail Pekerjaan:**
  * **Pengujian Fungsional & Non-Fungsional:**
    * *ACID & Inter-service Transaction Check:* Verifikasi komunikasi REST API/Event Bus antar-service bebas dari kebocoran data.
    * *Performance Test:* Response time API $< 2$s, BOM Engine $< 1$s, dan pembuatan PDF $< 3$s.
    * *Security Test:* Verifikasi pembatasan CORS, JWT Auth, dan RBAC tujuh Role di API Gateway.
  * **UAT & Bug Fixing:** Pengujian pengguna langsung menggunakan antarmuka Next.js bersama manajemen CV Solusi Inovasi Packaging.
  * **Deployment & Operational Setup:**
    * *Containerization & Orchestration:* Konfigurasi `Docker Compose` / Nginx Reverse Proxy untuk membungkus Next.js FE dan seluruh Laravel Microservices.
    * *Production Server Deployment:* Konfigurasi VPS Linux Ubuntu (Nginx, SSL Let's Encrypt, PostgreSQL multi-database, Supervisor Queue Worker).
    * *Data Seeding:* Pengisian data master awal (dua gudang, lima brand, material, supplier, empat vendor mitra).
    * *Documentation:* Penerbitan dokumen *API Documentation (Swagger/Postman)*, *User Manual*, dan *Release Notes*.
* **Pembagian Tugas Anggota Tim:**
  * **Isa Bagus Prakoso (PM & BE Lead):** Docker Compose setup, Nginx Reverse Proxy, Deployment VPS, & Koordinasi UAT.
  * **Samuel Dwi Saputro (Analyst & BE):** Integration testing microservices, ACID verification, & penyusunan API Documentation.
  * **Candra Sutomo (UI/UX & FE Lead):** Next.js Build Optimization, Responsive Design Check, Bug Fixing UI.
  * **Mustafa Malik Ibrahim (DB & FE):** Database Seeding per service, Indexing & Query Optimization, Backup Scripting.
* **Target Deliverable & Definition of Done (DoD):** Seluruh microservice dan Next.js FE aktif (*live*) di lingkungan produksi Docker VPS, lolos UAT mitra, dan siap digunakan untuk operasional harian CV Solusi Inovasi Packaging.

---

## 4. Matriks Ringkasan Pelaksanaan Sprint

| Sprint | Durasi | Fokus Pekerjaan Utama | Target Modul Selesai | Penanggung Jawab Utama |
| :--- | :--- | :--- | :--- | :--- |
| **Sprint 1** | Minggu 1–2 | Arsitektur Microservices, API Gateway, Auth Service (JWT), Next.js Setup & RBAC | MOD-09 | Tim Dev (Lead: Isa & Samuel) |
| **Sprint 2** | Minggu 3–4 | Inventory Microservice, Multi-Gudang (Dua Gudang), Lima Brand, Mutasi ACID, ROP Alert UI | MOD-01, MOD-06 | Mustafa & Samuel |
| **Sprint 3** | Minggu 5–6 | Order Intake Service, Stock Pre-Validation API, BOM Engine Microservice | MOD-02, MOD-03 | Isa & Candra |
| **Sprint 4** | Minggu 7–8 | SPK Digital Microservice (Internal/empat Vendor), Production Service, Kanban Next.js & QC | MOD-04, MOD-05 | Isa, Candra & Mustafa |
| **Sprint 5** | Minggu 9–10 | USD Analytics Microservice, Billing Service (Invoice PDF) & Immutable Audit Log | MOD-07, MOD-08 | Samuel & Isa |
| **Sprint 6** | Minggu 11–12 | Microservices Integration, Docker Setup, UAT Mitra & VPS Production Deployment | Final Release | Seluruh Anggota Tim |