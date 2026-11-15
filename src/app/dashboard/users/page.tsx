"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  useRbacStore,
  RBAC_MODULES,
  ROLE_LABELS,
  RbacUserAccount,
  SystemRoleKey,
} from "@/services/rbacStore";
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
  IconRefresh,
  IconCheck,
} from "@/components/icons/Icons";

const ROLE_ORDER: SystemRoleKey[] = [
  "owner",
  "manager",
  "front_office",
  "tim_design",
  "kepala_produksi",
  "quality_control",
  "staf_gudang",
];

const ROLE_SHORT_HEADERS: Record<SystemRoleKey, string> = {
  owner: "Owner",
  manager: "Manager",
  front_office: "Front Office",
  tim_design: "Tim Design",
  kepala_produksi: "Kepala Prod.",
  quality_control: "QC",
  staf_gudang: "Gudang",
};

export default function UsersManagementPage() {
  const { user: currentUser, login } = useAuth();
  const {
    users,
    roleMatrix,
    updateUsers,
    toggleModulePermission,
    resetMatrixToDefault,
  } = useRbacStore();

  const [activeTab, setActiveTab] = useState<"users" | "matrix">("users");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [matrixCategory, setMatrixCategory] = useState<string>("Semua");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal Tambah / Edit User
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<RbacUserAccount | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "front_office" as SystemRoleKey,
    phone: "",
    status: "AKTIF" as "AKTIF" | "NONAKTIF",
    password: "",
  });

  // Modal Reset Password
  const [resetTarget, setResetTarget] = useState<RbacUserAccount | null>(null);
  const [newPassword, setNewPassword] = useState<string>("");

  // Modal Konfirmasi Hapus User & Reset Matrix
  const [userToDelete, setUserToDelete] = useState<RbacUserAccount | null>(null);
  const [confirmResetMatrix, setConfirmResetMatrix] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      role: "front_office",
      phone: "",
      status: "AKTIF",
      password: "password",
    });
    setShowUserModal(true);
  };

  const openEditModal = (u: RbacUserAccount) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      status: u.status,
      password: u.password || "password",
    });
    setShowUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim().toLowerCase();
    if (!cleanName || !cleanEmail) {
      alert("Nama lengkap dan email wajib diisi.");
      return;
    }

    const duplicate = users.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.id !== editingUser?.id
    );
    if (duplicate) {
      alert(`Email ${cleanEmail} sudah digunakan oleh ${duplicate.name}.`);
      return;
    }

    if (editingUser) {
      const updated = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: cleanName,
              email: cleanEmail,
              role: formData.role,
              roleName: ROLE_LABELS[formData.role],
              phone: formData.phone.trim() || "-",
              status: formData.status,
              password: formData.password || u.password || "password",
            }
          : u
      );
      updateUsers(updated);
      showToast(`Data pengguna ${cleanName} (${ROLE_LABELS[formData.role]}) berhasil diperbarui.`);
    } else {
      const nextNum = users.length + 1;
      const newUser: RbacUserAccount = {
        id: `USR-${String(nextNum).padStart(3, "0")}`,
        name: cleanName,
        email: cleanEmail,
        role: formData.role,
        roleName: ROLE_LABELS[formData.role],
        status: formData.status,
        lastLogin: "Belum Pernah",
        phone: formData.phone.trim() || "-",
        password: formData.password || "password",
      };
      updateUsers([newUser, ...users]);
      showToast(`Pengguna baru ${cleanName} berhasil ditambahkan.`);
    }

    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleToggleUserStatus = (u: RbacUserAccount) => {
    if (u.role === "owner" && u.id === "USR-001") {
      alert("Akun Owner utama tidak dapat dinonaktifkan.");
      return;
    }
    const nextStatus = u.status === "AKTIF" ? "NONAKTIF" : "AKTIF";
    const updated = users.map((item) =>
      item.id === u.id ? { ...item, status: nextStatus } : item
    );
    updateUsers(updated as RbacUserAccount[]);
    showToast(`Status akun ${u.name} diubah menjadi ${nextStatus}.`);
  };

  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    if (!newPassword || newPassword.trim().length < 4) {
      alert("Kata sandi baru minimal 4 karakter.");
      return;
    }
    const updated = users.map((u) =>
      u.id === resetTarget.id ? { ...u, password: newPassword.trim() } : u
    );
    updateUsers(updated);
    showToast(`Kata sandi untuk ${resetTarget.name} berhasil direset.`);
    setResetTarget(null);
    setNewPassword("");
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    if (userToDelete.id === "USR-001") {
      alert("Akun Owner utama tidak boleh dihapus.");
      setUserToDelete(null);
      return;
    }
    updateUsers(users.filter((u) => u.id !== userToDelete.id));
    showToast(`Pengguna ${userToDelete.name} telah dihapus.`);
    setUserToDelete(null);
  };

  const handleSimulateLogin = async (u: RbacUserAccount) => {
    if (u.status === "NONAKTIF") {
      alert(`Akun ${u.name} berstatus NONAKTIF. Aktifkan terlebih dahulu untuk uji login.`);
      return;
    }
    try {
      await login(u.email, u.password || "password");
      showToast(`Berhasil beralih ke akun ${u.name} (${u.roleName}). Menu sidebar telah disesuaikan.`);
    } catch {
      alert("Gagal beralih akun.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === "ALL" || u.role === filterRole;
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.roleName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const filteredModules = RBAC_MODULES.filter(
    (m) => matrixCategory === "Semua" || m.category === matrixCategory
  );

  const getRoleBadge = (role: SystemRoleKey) => {
    switch (role) {
      case "owner":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#991B1B]/10 text-[#991B1B] dark:text-[#F87171]">OWNER</span>;
      case "manager":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#2B5FC7]/10 text-[#2B5FC7] dark:text-[#60A5FA]">MANAGER</span>;
      case "front_office":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#854D0E]/10 text-[#854D0E] dark:text-[#FACC15]">FRONT OFFICE</span>;
      case "tim_design":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#065F46]/10 text-[#065F46] dark:text-[#34D399]">DESIGN &amp; PREPRESS</span>;
      case "kepala_produksi":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#2B5FC7]/15 text-[#2B5FC7] dark:text-[#93C5FD]">KEPALA PRODUKSI</span>;
      case "quality_control":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#059669]/10 text-[#059669] dark:text-[#34D399]">QUALITY CONTROL</span>;
      case "staf_gudang":
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#4B5563]/10 text-[#4B5563] dark:text-[#9CA3AF]">STAF GUDANG</span>;
    }
  };

  const activeUserCount = users.filter((u) => u.status === "AKTIF").length;

  return (
    <DashboardLayout title="Manajemen Pengguna & Hak Akses (RBAC)">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Toast Feedback */}
        {toastMsg && (
          <div className="p-3 rounded-xl bg-[#ECFDF5] dark:bg-[#064E3B]/40 border border-[#A7F3D0] dark:border-[#059669] text-[#065F46] dark:text-[#34D399] text-xs font-medium flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <IconCheck size={15} strokeWidth={2.5} />
              <span>{toastMsg}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-xs font-bold px-1.5">
              ✕
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2E6ED] dark:border-[#26334D]">
          <div>
            <h1 className="text-xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#2B5FC7]/10 dark:bg-[#3B6FE0]/15 text-[#2B5FC7] dark:text-[#3B6FE0]">
                <IconUsers size={20} />
              </span>
              Manajemen Pengguna &amp; Hak Akses (RBAC)
            </h1>
            <p className="text-xs text-[#6B7684] dark:text-[#8A94A6] mt-1">
              Kelola akun staf (CRUD), ubah matriks otorisasi 7 role secara interaktif, dan uji hak akses sidebar secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {activeTab === "matrix" && (
              <button
                type="button"
                onClick={() => setConfirmResetMatrix(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-white transition-colors"
              >
                <IconRefresh size={13} />
                <span>Reset Matriks Default</span>
              </button>
            )}
            <button
              type="button"
              onClick={openCreateModal}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] dark:hover:bg-[#2B5FC7] text-white transition-all shadow-sm"
            >
              <IconUserPlus size={14} />
              <span>Tambah Pengguna Baru</span>
            </button>
          </div>
        </div>

        {/* Summary Cards (Grid 2 kolom di Mobile, 4 di Desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="text-[11px] font-medium text-[#6B7684] dark:text-[#8A94A6]">Total Akun Staf</div>
            <div className="text-lg sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mt-1">
              {users.length} Akun
            </div>
            <div className="text-[10px] text-[#6B7684] mt-1">Tersimpan di sistem RBAC</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="text-[11px] font-medium text-[#6B7684] dark:text-[#8A94A6]">Status Akun Aktif</div>
            <div className="text-lg sm:text-2xl font-bold text-[#059669] dark:text-[#34D399] mt-1">
              {activeUserCount} Aktif
            </div>
            <div className="text-[10px] text-[#6B7684] mt-1">
              {users.length - activeUserCount} Nonaktif
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="text-[11px] font-medium text-[#6B7684] dark:text-[#8A94A6]">Konfigurasi Role</div>
            <div className="text-lg sm:text-2xl font-bold text-[#2B5FC7] dark:text-[#60A5FA] mt-1">
              7 Role
            </div>
            <div className="text-[10px] text-[#6B7684] mt-1">Aktif: {currentUser?.role_display}</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm">
            <div className="text-[11px] font-medium text-[#6B7684] dark:text-[#8A94A6]">Modul Terproteksi</div>
            <div className="text-lg sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mt-1">
              {RBAC_MODULES.length} Modul
            </div>
            <div className="text-[10px] text-[#059669] dark:text-[#34D399] mt-1 font-medium">
              Klik matriks untuk ubah izin
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E2E6ED] dark:border-[#26334D] gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`pb-3 transition-colors relative ${
              activeTab === "users"
                ? "text-[#2B5FC7] dark:text-[#3B6FE0]"
                : "text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3]"
            }`}
          >
            1. Daftar Pengguna &amp; Akun ({users.length})
            {activeTab === "users" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2B5FC7] dark:bg-[#3B6FE0] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("matrix")}
            className={`pb-3 transition-colors relative ${
              activeTab === "matrix"
                ? "text-[#2B5FC7] dark:text-[#3B6FE0]"
                : "text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3]"
            }`}
          >
            2. Matriks Hak Akses Interaktif (7 Role × {RBAC_MODULES.length} Modul)
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
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:outline-none"
                >
                  <option value="ALL">Semua Role ({users.length})</option>
                  <option value="owner">Owner / Direktur</option>
                  <option value="manager">Operational Manager</option>
                  <option value="front_office">Front Office &amp; Sales</option>
                  <option value="tim_design">Tim Design &amp; Prepress</option>
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
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:outline-none focus:border-[#2B5FC7]"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA] dark:bg-[#1B2A44] text-[11px] font-semibold text-[#6B7684] dark:text-[#8A94A6] uppercase tracking-wider">
                    <th className="py-3 px-4">Nama &amp; Email Pengguna</th>
                    <th className="py-3 px-4">Role Sistem</th>
                    <th className="py-3 px-4">Hak Akses Modul</th>
                    <th className="py-3 px-4">No. Telepon</th>
                    <th className="py-3 px-4">Status (Klik Ubah)</th>
                    <th className="py-3 px-4 text-right">Aksi (CRUD &amp; Uji Role)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-xs">
                  {filteredUsers.map((u) => {
                    const isCurrentUser = currentUser?.email?.toLowerCase() === u.email.toLowerCase();
                    const moduleCount = (roleMatrix[u.role] || []).length;
                    return (
                      <tr key={u.id} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/50 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-[#2B5FC7] dark:bg-[#3B6FE0] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3] flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {isCurrentUser && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#EFF4FE] text-[#2B5FC7] border border-[#D6E3FC]">
                                    Sedang Login
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="mb-0.5">{getRoleBadge(u.role)}</div>
                          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">{u.roleName}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setActiveTab("matrix")}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold bg-[#EFF4FE] text-[#2B5FC7] hover:bg-[#D6E3FC] dark:bg-[#1D4ED8]/25 dark:text-[#93C5FD] transition-colors"
                          >
                            {moduleCount} / {RBAC_MODULES.length} Modul Aktif →
                          </button>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#6B7684] dark:text-[#8A94A6] whitespace-nowrap">
                          <div>{u.phone}</div>
                          <div className="text-[10px]">Login: {u.lastLogin}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(u)}
                            title="Klik untuk mengaktifkan / menonaktifkan akun"
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors ${
                              u.status === "AKTIF"
                                ? "bg-[#065F46]/10 text-[#065F46] hover:bg-[#065F46]/20 dark:text-[#34D399]"
                                : "bg-[#991B1B]/10 text-[#991B1B] hover:bg-[#991B1B]/20 dark:text-[#F87171]"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === "AKTIF" ? "bg-[#059669]" : "bg-[#DC2626]"}`} />
                            <span>{u.status}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isCurrentUser && (
                              <button
                                type="button"
                                onClick={() => handleSimulateLogin(u)}
                                title={`Uji masuk sebagai ${u.name} (${u.roleName})`}
                                className="px-2 py-1 rounded-lg text-[11px] font-semibold border border-[#2B5FC7] text-[#2B5FC7] hover:bg-[#EFF4FE] dark:border-[#3B6FE0] dark:text-[#93C5FD] transition-colors"
                              >
                                Uji Role
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setResetTarget(u);
                                setNewPassword(u.password || "password");
                              }}
                              title="Reset Kata Sandi"
                              className="p-1.5 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] hover:text-[#2B5FC7] hover:border-[#2B5FC7] transition-colors"
                            >
                              <IconLock size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(u)}
                              title="Edit Pengguna"
                              className="p-1.5 rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] hover:text-[#1B2436] dark:hover:text-[#E8ECF3] transition-colors"
                            >
                              <IconEdit size={13} />
                            </button>
                            {u.id !== "USR-001" && (
                              <button
                                type="button"
                                onClick={() => setUserToDelete(u)}
                                title="Hapus Pengguna"
                                className="p-1.5 rounded-lg border border-[#FECACA] text-[#991B1B] hover:bg-[#FEF2F2] transition-colors"
                              >
                                <IconTrash size={13} />
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
          </div>
        )}

        {/* TAB 2: INTERACTIVE PERMISSION MATRIX */}
        {activeTab === "matrix" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#2B5FC7]/10 via-[#2B5FC7]/5 to-transparent border border-[#2B5FC7]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <IconShield size={18} className="text-[#2B5FC7] dark:text-[#3B6FE0] mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                    Matriks Otorisasi Berbasis Peran (RBAC Interaktif):
                  </span>
                  <p className="text-[#6B7684] dark:text-[#8A94A6] mt-0.5">
                    Klik pada kotak centang di bawah untuk <strong>mengaktifkan</strong> atau <strong>menonaktifkan</strong> akses modul per role. Perubahan otomatis tersimpan dan langsung mengatur menu Sidebar yang tampil untuk masing-masing role.
                  </p>
                </div>
              </div>

              {/* Filter Kategori Modul */}
              <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                {["Semua", "Operasional", "Inventori & Master", "Laporan", "Manajerial & Sistem"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMatrixCategory(cat)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                      matrixCategory === cat
                        ? "bg-[#2B5FC7] text-white"
                        : "bg-white dark:bg-[#16223A] text-[#6B7684] border border-[#E2E6ED] dark:border-[#26334D]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E6ED] dark:border-[#26334D] bg-[#F4F6FA] dark:bg-[#1B2A44] text-[11px] font-semibold text-[#6B7684] dark:text-[#8A94A6] uppercase tracking-wider">
                    <th className="py-3 px-4 min-w-[240px]">Modul Sistem ERP &amp; Laporan</th>
                    <th className="py-3 px-3">Kategori</th>
                    {ROLE_ORDER.map((r) => (
                      <th key={r} className="py-3 px-2.5 text-center whitespace-nowrap">
                        {ROLE_SHORT_HEADERS[r]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-xs">
                  {filteredModules.map((mod) => (
                    <tr key={mod.code} className="hover:bg-[#F4F6FA]/60 dark:hover:bg-[#1B2A44]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{mod.name}</div>
                        <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">{mod.description}</div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6]">
                          {mod.category}
                        </span>
                      </td>
                      {ROLE_ORDER.map((r) => {
                        const hasAccess = roleMatrix[r]?.includes(mod.code);
                        const isLockedOwnerUsers = r === "owner" && mod.code === "users";
                        return (
                          <td key={r} className="py-3 px-2.5 text-center">
                            <button
                              type="button"
                              disabled={isLockedOwnerUsers}
                              onClick={() => {
                                toggleModulePermission(r, mod.code);
                                showToast(
                                  `Akses "${mod.name}" untuk ${ROLE_LABELS[r]} ${
                                    hasAccess ? "dinonaktifkan" : "diaktifkan"
                                  }.`
                                );
                              }}
                              title={
                                isLockedOwnerUsers
                                  ? "Akses RBAC Owner dikunci agar tidak terkunci dari sistem"
                                  : `Klik untuk ${hasAccess ? "menonaktifkan" : "mengaktifkan"} akses ${mod.name} pada role ${ROLE_LABELS[r]}`
                              }
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                                hasAccess
                                  ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#059669] hover:bg-[#D1FAE5] dark:bg-[#064E3B]/40 dark:border-[#059669] dark:text-[#34D399]"
                                  : "bg-[#F4F6FA] border-[#E2E6ED] text-[#9CA3AF] hover:border-[#2B5FC7] hover:text-[#2B5FC7] dark:bg-[#1B2A44] dark:border-[#26334D]"
                              } ${isLockedOwnerUsers ? "opacity-60 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
                            >
                              {hasAccess ? <IconCheckCircle size={15} /> : <span className="text-xs font-bold">—</span>}
                            </button>
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

        {/* MODAL TAMBAH / EDIT USER */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
                <div className="flex items-center gap-2">
                  <IconUserPlus size={18} className="text-[#2B5FC7] dark:text-[#3B6FE0]" />
                  <h3 className="font-bold text-sm text-[#1B2436] dark:text-[#E8ECF3]">
                    {editingUser ? `Edit Pengguna — ${editingUser.name}` : "Tambah Anggota Pengguna Baru"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="text-[#6B7684] hover:text-[#1B2436] dark:hover:text-[#E8ECF3]"
                >
                  <IconXCircle size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#6B7684] dark:text-[#8A94A6] font-semibold mb-1">
                    Nama Lengkap <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Dimas Aditya"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:border-[#2B5FC7]"
                  />
                </div>

                <div>
                  <label className="block text-[#6B7684] dark:text-[#8A94A6] font-semibold mb-1">
                    Alamat Email Login <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@packsolution.dev"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:border-[#2B5FC7]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#6B7684] dark:text-[#8A94A6] font-semibold mb-1">
                      Role / Peran Sistem
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as SystemRoleKey })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:border-[#2B5FC7]"
                    >
                      <option value="front_office">Front Office &amp; Sales</option>
                      <option value="tim_design">Tim Design &amp; Prepress</option>
                      <option value="kepala_produksi">Kepala Produksi</option>
                      <option value="quality_control">Quality Control Officer</option>
                      <option value="staf_gudang">Staf Logistik &amp; Gudang</option>
                      <option value="manager">Operational Manager</option>
                      <option value="owner">Owner / Direktur</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#6B7684] dark:text-[#8A94A6] font-semibold mb-1">
                      Status Akun
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as "AKTIF" | "NONAKTIF" })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:border-[#2B5FC7]"
                    >
                      <option value="AKTIF">AKTIF</option>
                      <option value="NONAKTIF">NONAKTIF</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#6B7684] dark:text-[#8A94A6] font-semibold mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    placeholder="+62 812-XXXX-XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:border-[#2B5FC7]"
                  />
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-[#6B7684] dark:text-[#8A94A6] font-semibold mb-1">
                      Kata Sandi Awal
                    </label>
                    <input
                      type="text"
                      placeholder="Default: password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] focus:border-[#2B5FC7]"
                    />
                  </div>
                )}

                <div className="pt-3 border-t border-[#E2E6ED] dark:border-[#26334D] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] hover:bg-[#F4F6FA] dark:hover:bg-[#1B2A44]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] text-white shadow-xs"
                  >
                    {editingUser ? "Simpan Perubahan" : "Simpan Pengguna"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL RESET PASSWORD */}
        {resetTarget && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <form
              onSubmit={handleConfirmResetPassword}
              className="bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
                <div className="flex items-center gap-2">
                  <IconLock size={16} className="text-[#2B5FC7]" />
                  <h3 className="font-bold text-sm text-[#1B2436] dark:text-[#E8ECF3]">
                    Reset Kata Sandi
                  </h3>
                </div>
                <button type="button" onClick={() => setResetTarget(null)}>
                  <IconXCircle size={18} className="text-[#6B7684]" />
                </button>
              </div>

              <p className="text-[#6B7684] dark:text-[#8A94A6]">
                Atur kata sandi baru untuk akun <strong>{resetTarget.name}</strong> ({resetTarget.email}):
              </p>

              <div>
                <label className="block font-semibold mb-1">Kata Sandi Baru</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#F4F6FA] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E6ED] dark:border-[#26334D]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-[#2B5FC7] text-white font-semibold"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        )}

        {/* DIALOG KONFIRMASI HAPUS USER */}
        <ConfirmDialog
          open={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleConfirmDeleteUser}
          title="Hapus Akun Pengguna"
          message={
            userToDelete
              ? `Apakah Anda yakin ingin menghapus akun "${userToDelete.name}" (${userToDelete.email}) dari sistem RBAC?`
              : ""
          }
          confirmLabel="Ya, Hapus Akun"
        />

        {/* DIALOG KONFIRMASI RESET MATRIKS RBAC */}
        <ConfirmDialog
          open={confirmResetMatrix}
          onClose={() => setConfirmResetMatrix(false)}
          onConfirm={() => {
            resetMatrixToDefault();
            setConfirmResetMatrix(false);
            showToast("Matriks Hak Akses (RBAC) berhasil dikembalikan ke pengaturan default 7 role.");
          }}
          title="Reset Matriks Hak Akses ke Default?"
          message="Seluruh perubahan izin modul pada ke-7 role akan dikembalikan ke konfigurasi standar pabrik."
          confirmLabel="Ya, Reset ke Default"
        />
      </div>
    </DashboardLayout>
  );
}
