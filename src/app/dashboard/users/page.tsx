"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  IconUsers,
  IconUserPlus,
  IconSearch,
  IconShield,
  IconLock,
  IconEdit,
  IconTrash,
  IconCheckCircle,
  IconXCircle,
  IconInfo,
} from "@/components/icons/Icons";

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: "owner" | "manager" | "front_office" | "tim_design" | "kepala_produksi" | "quality_control" | "staf_gudang";
  roleName: string;
  status: "AKTIF" | "NONAKTIF";
  lastLogin: string;
  phone: string;
}

export default function UsersManagementPage() {
  const [activeTab, setActiveTab] = useState<"users" | "matrix">("users");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  // Form states for new user
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "front_office",
    phone: "",
    password: "",
  });

  const [users, setUsers] = useState<UserAccount[]>([
    {
      id: "USR-001",
      name: "Ricky Darmawan",
      email: "owner@packsolution.id",
      role: "owner",
      roleName: "Owner / Direktur",
      status: "AKTIF",
      lastLogin: "2026-09-24 14:15",
      phone: "+62 811-2345-6789",
    },
    {
      id: "USR-002",
      name: "Bambang Sudirman",
      email: "manager@packsolution.id",
      role: "manager",
      roleName: "Operational Manager",
      status: "AKTIF",
      lastLogin: "2026-09-24 12:40",
      phone: "+62 812-3456-7890",
    },
    {
      id: "USR-003",
      name: "Maya Indah",
      email: "maya@packsolution.id",
      role: "front_office",
      roleName: "Front Office & Sales",
      status: "AKTIF",
      lastLogin: "2026-09-24 15:02",
      phone: "+62 813-4567-8901",
    },
    {
      id: "USR-004",
      name: "Dimas Aditya",
      email: "dimas@packsolution.id",
      role: "tim_design",
      roleName: "Tim Design & Prepress",
      status: "AKTIF",
      lastLogin: "2026-09-24 11:20",
      phone: "+62 814-5678-9012",
    },
    {
      id: "USR-005",
      name: "Budi Prakoso",
      email: "budi@packsolution.id",
      role: "kepala_produksi",
      roleName: "Kepala Produksi",
      status: "AKTIF",
      lastLogin: "2026-09-24 13:10",
      phone: "+62 815-6789-0123",
    },
    {
      id: "USR-006",
      name: "Siti Rahmawati",
      email: "siti@packsolution.id",
      role: "quality_control",
      roleName: "Quality Control Officer",
      status: "AKTIF",
      lastLogin: "2026-09-24 14:35",
      phone: "+62 816-7890-1234",
    },
    {
      id: "USR-007",
      name: "Ahmad Fauzi",
      email: "ahmad@packsolution.id",
      role: "staf_gudang",
      roleName: "Staf Logistik & Gudang",
      status: "AKTIF",
      lastLogin: "2026-09-24 10:05",
      phone: "+62 817-8901-2345",
    },
  ]);

  // Permission Matrix Definition
  const permissionModules = [
    { name: "Inventori & Transfer Stok", code: "inventory" },
    { name: "Order Pelanggan & Intake", code: "orders" },
    { name: "BOM Calculator & Pola Potong", code: "bom" },
    { name: "Penerbitan SPK Digital", code: "spk" },
    { name: "Kanban Pengerjaan Mesin", code: "production" },
    { name: "Inspeksi Lembar QC", code: "qc" },
    { name: "Invoicing & Rekam Bayar", code: "invoices" },
    { name: "Laporan Finansial & Margin", code: "reports" },
    { name: "Audit Trail Forensik", code: "audit" },
    { name: "Manajemen User & RBAC", code: "users" },
  ];

  const rolePermissions: Record<string, string[]> = {
    owner: ["inventory", "orders", "bom", "spk", "production", "qc", "invoices", "reports", "audit", "users"],
    manager: ["inventory", "orders", "bom", "spk", "production", "qc", "invoices", "reports", "audit", "users"],
    front_office: ["orders"],
    tim_design: ["bom", "spk"],
    kepala_produksi: ["spk", "production", "qc"],
    quality_control: ["production", "qc"],
    staf_gudang: ["inventory"],
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === "ALL" || u.role === filterRole;
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.roleName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Nama dan email wajib diisi!");
      return;
    }

    const newUser: UserAccount = {
      id: `USR-00${users.length + 1}`,
      name: formData.name,
      email: formData.email,
      role: formData.role as any,
      roleName: formData.role.replace("_", " ").toUpperCase(),
      status: "AKTIF",
      lastLogin: "Belum Pernah",
      phone: formData.phone || "-",
    };

    setUsers([newUser, ...users]);
    setShowAddModal(false);
    setFormData({ name: "", email: "", role: "front_office", phone: "", password: "" });
  };

  const getRoleBadge = (role: UserAccount["role"]) => {
    switch (role) {
      case "owner":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#991B1B]/10 text-[#991B1B] dark:text-[#F87171]">OWNER</span>;
      case "manager":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#2B5FC7]/10 text-[#2B5FC7] dark:text-[#3B6FE0]">MANAGER</span>;
      case "front_office":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#854D0E]/10 text-[#854D0E] dark:text-[#FACC15]">FRONT OFFICE</span>;
      case "tim_design":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#065F46]/10 text-[#065F46] dark:text-[#34D399]">DESIGN & PREPRESS</span>;
      case "kepala_produksi":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#2B5FC7]/15 text-[#2B5FC7] dark:text-[#3B6FE0]">KEPALA PRODUKSI</span>;
      case "quality_control":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#059669]/10 text-[#059669]">QUALITY CONTROL</span>;
      case "staf_gudang":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#4B5563]/10 text-[#4B5563] dark:text-[#9CA3AF]">STAF GUDANG</span>;
    }
  };

  return (
    <DashboardLayout title="Manajemen Pengguna & Hak Akses (RBAC)">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#2B5FC7]/10 dark:bg-[#3B6FE0]/15 text-[#2B5FC7] dark:text-[#3B6FE0]">
              <IconUsers size={20} />
            </span>
            Manajemen Pengguna & Hak Akses (RBAC)
          </h1>
          <p className="text-xs text-[#6B7684] dark:text-[#8A94A6] mt-1">
            Konfigurasi 7 role percetakan, pembatasan otorisasi antar departemen, dan monitoring akun staf aktif
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] dark:hover:bg-[#2B5FC7] text-white transition-all shadow-sm"
          >
            <IconUserPlus size={14} />
            <span>Tambah Pengguna Baru</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E6ED] dark:border-[#26334D] gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 transition-colors relative ${
            activeTab === "users"
              ? "text-[#2B5FC7] dark:text-[#3B6FE0]"
              : "text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3]"
          }`}
        >
          Daftar Pengguna ({users.length})
          {activeTab === "users" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2B5FC7] dark:bg-[#3B6FE0] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("matrix")}
          className={`pb-3 transition-colors relative ${
            activeTab === "matrix"
              ? "text-[#2B5FC7] dark:text-[#3B6FE0]"
              : "text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3]"
          }`}
        >
          Matriks Hak Akses (7 Role)
          {activeTab === "matrix" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2B5FC7] dark:bg-[#3B6FE0] rounded-full" />
          )}
        </button>
      </div>

      {/* TAB 1: USERS LIST */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:outline-none"
              >
                <option value="ALL">Semua Role ({users.length})</option>
                <option value="owner">Owner</option>
                <option value="manager">Manager</option>
                <option value="front_office">Front Office</option>
                <option value="tim_design">Tim Design & Prepress</option>
                <option value="kepala_produksi">Kepala Produksi</option>
                <option value="quality_control">Quality Control</option>
                <option value="staf_gudang">Staf Gudang</option>
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
                placeholder="Cari nama, email, atau role..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:outline-none focus:border-[#2B5FC7]"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA] dark:bg-[#1B2A44] text-[11px] font-semibold text-[#6B7684] dark:text-[#8A94A6] uppercase tracking-wider">
                  <th className="py-3 px-4">Nama & Email Pengguna</th>
                  <th className="py-3 px-4">Role Sistem</th>
                  <th className="py-3 px-4">No. Telepon / Kontak</th>
                  <th className="py-3 px-4">Login Terakhir</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-xs">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[#2B5FC7] dark:bg-[#3B6FE0] text-white flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{u.name}</div>
                          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="mb-0.5">{getRoleBadge(u.role)}</div>
                      <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">{u.roleName}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#6B7684] dark:text-[#8A94A6]">{u.phone}</td>
                    <td className="py-3 px-4 font-mono text-[#6B7684] dark:text-[#8A94A6]">{u.lastLogin}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#065F46]/10 text-[#065F46] dark:text-[#34D399]">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => alert(`Reset password akun ${u.name} akan dikirimkan ke email ${u.email}`)}
                          title="Reset Password"
                          className="p-1.5 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] hover:text-[#2B5FC7] hover:border-[#2B5FC7] transition-colors"
                        >
                          <IconLock size={13} />
                        </button>
                        <button
                          onClick={() => alert(`Edit pengguna ${u.name}`)}
                          title="Edit Pengguna"
                          className="p-1.5 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] hover:text-[#1B2436] dark:hover:text-[#E8ECF3] transition-colors"
                        >
                          <IconEdit size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PERMISSION MATRIX */}
      {activeTab === "matrix" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#2B5FC7]/10 via-[#2B5FC7]/5 to-transparent border border-[#2B5FC7]/20 flex items-start gap-3">
            <IconShield size={18} className="text-[#2B5FC7] dark:text-[#3B6FE0] mt-0.5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-[#1B2436] dark:text-[#E8ECF3]">Matriks Otorisasi Berbasis Peran (RBAC):</span>
              <p className="text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                Setiap staf hanya diberikan izin akses fungsional sesuai alur operasional pencetakan, menjamin isolasi data antara sales front-office, operator lantai produksi, dan staf gudang logistik.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA] dark:bg-[#1B2A44] text-[11px] font-semibold text-[#6B7684] dark:text-[#8A94A6] uppercase tracking-wider">
                  <th className="py-3 px-4">Modul Sistem ERP</th>
                  <th className="py-3 px-2 text-center">Owner</th>
                  <th className="py-3 px-2 text-center">Manager</th>
                  <th className="py-3 px-2 text-center">Front Office</th>
                  <th className="py-3 px-2 text-center">Tim Design</th>
                  <th className="py-3 px-2 text-center">Kepala Prod.</th>
                  <th className="py-3 px-2 text-center">QC</th>
                  <th className="py-3 px-2 text-center">Gudang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-xs">
                {permissionModules.map((mod) => (
                  <tr key={mod.code} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-[#1B2436] dark:text-[#E8ECF3]">
                      {mod.name}
                    </td>
                    {["owner", "manager", "front_office", "tim_design", "kepala_produksi", "quality_control", "staf_gudang"].map((r) => {
                      const hasAccess = rolePermissions[r]?.includes(mod.code);
                      return (
                        <td key={r} className="py-3 px-2 text-center">
                          {hasAccess ? (
                            <span className="inline-flex p-1 rounded bg-[#065F46]/10 text-[#065F46] dark:text-[#34D399]">
                              <IconCheckCircle size={14} />
                            </span>
                          ) : (
                            <span className="inline-flex p-1 rounded text-[#E2E6ED] dark:text-[#26334D]">
                              &mdash;
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH USER */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
              <div className="flex items-center gap-2">
                <IconUserPlus size={18} className="text-[#2B5FC7] dark:text-[#3B6FE0]" />
                <h3 className="font-bold text-sm text-[#1B2436] dark:text-[#E8ECF3]">
                  Tambah Anggota Pengguna Baru
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#6B7684] hover:text-[#1B2436] dark:hover:text-[#E8ECF3]"
              >
                <IconXCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#6B7684] dark:text-[#8A94A6] mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Dimas Aditya"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:border-[#2B5FC7]"
                />
              </div>

              <div>
                <label className="block text-[#6B7684] dark:text-[#8A94A6] mb-1">Alamat Email:</label>
                <input
                  type="email"
                  required
                  placeholder="nama@packsolution.id"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:border-[#2B5FC7]"
                />
              </div>

              <div>
                <label className="block text-[#6B7684] dark:text-[#8A94A6] mb-1">Role / Peran:</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:border-[#2B5FC7]"
                >
                  <option value="front_office">Front Office & Sales</option>
                  <option value="tim_design">Tim Design & Prepress</option>
                  <option value="kepala_produksi">Kepala Produksi</option>
                  <option value="quality_control">Quality Control Officer</option>
                  <option value="staf_gudang">Staf Logistik & Gudang</option>
                  <option value="manager">Operational Manager</option>
                  <option value="owner">Owner / Direktur</option>
                </select>
              </div>

              <div>
                <label className="block text-[#6B7684] dark:text-[#8A94A6] mb-1">Nomor WhatsApp / HP:</label>
                <input
                  type="text"
                  placeholder="+62 812-XXXX-XXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:border-[#2B5FC7]"
                />
              </div>

              <div>
                <label className="block text-[#6B7684] dark:text-[#8A94A6] mb-1">Kata Sandi Awal:</label>
                <input
                  type="password"
                  placeholder="Min. 8 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:border-[#2B5FC7]"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E6ED] dark:border-[#26334D] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] hover:bg-[#F4F6FA] dark:hover:bg-[#1B2A44]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] text-white shadow-xs"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
