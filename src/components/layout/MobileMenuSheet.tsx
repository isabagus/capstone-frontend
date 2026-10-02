"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavItems } from "@/config/navigation";
import { renderNavIcon, IconLogOut, IconShield } from "@/components/icons/Icons";

const DEMO_ACCOUNTS = [
  { role: "Owner",          email: "owner@packsolution.dev" },
  { role: "Manager",        email: "manager@packsolution.dev" },
  { role: "Front Office",   email: "fo@packsolution.dev" },
  { role: "Tim Design",     email: "design@packsolution.dev" },
  { role: "Kepala Produksi",email: "produksi@packsolution.dev" },
  { role: "Quality Control",email: "qc@packsolution.dev" },
  { role: "Staf Gudang",    email: "gudang@packsolution.dev" },
];

interface MobileMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenuSheet({ isOpen, onClose }: MobileMenuSheetProps) {
  const { user, logout, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const navItems = useNavItems();

  if (!isOpen) return null;

  const handleQuickSwitch = async (email: string) => {
    try {
      await login(email, "password");
      onClose();
    } catch {
      alert("Gagal berganti akun demo.");
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Container */}
      <div className="relative w-full max-h-[85vh] bg-white dark:bg-[#16223A] border-t border-[#E2E6ED] dark:border-[#26334D] rounded-t-2xl flex flex-col z-10 shadow-lg overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Drag handle */}
        <div className="pt-2.5 pb-1 flex justify-center flex-shrink-0 cursor-pointer" onClick={onClose}>
          <div className="w-10 h-1 bg-[#E2E6ED] dark:bg-[#26334D] rounded-full" />
        </div>

        {/* User Card Header */}
        <div className="px-4 py-3 border-b border-[#E2E6ED] dark:border-[#26334D] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2B5FC7] dark:bg-[#3B6FE0] text-white font-semibold flex items-center justify-center text-sm shadow-sm">
              {user?.name?.charAt(0) ?? "U"}
            </div>
            <div>
              <div className="text-xs font-bold text-[#1B2436] dark:text-[#E8ECF3] leading-tight">
                {user?.name}
              </div>
              <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
                {user?.email}
              </div>
              <div className="inline-block px-1.5 py-0.2 mt-0.5 rounded text-[10px] font-medium bg-[#EFF4FE] text-[#2B5FC7] border border-[#D6E3FC] dark:bg-[#3B6FE0]/15 dark:text-[#93C5FD] dark:border-[#3B6FE0]/30">
                {user?.role_display}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3] bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]"
              title="Ganti Tema"
            >
              {theme === "dark" ? (
                <svg className="w-4 h-4 text-[#FBBF24]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-[#2B5FC7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3]"
              aria-label="Tutup"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* Navigation Modules */}
          <section>
            <div className="text-[11px] font-semibold text-[#6B7684] dark:text-[#8A94A6] uppercase tracking-wider mb-2">
              Modul Sistem ({navItems.length})
            </div>
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-colors active:scale-98 ${
                      isActive
                        ? "bg-[#2B5FC7] border-[#2B5FC7] text-white dark:bg-[#3B6FE0] dark:border-[#3B6FE0]"
                        : "bg-[#F4F6FA] dark:bg-[#1B2A44] border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] hover:border-[#2B5FC7]"
                    }`}
                  >
                    <span className="flex-shrink-0">
                      {renderNavIcon(item.id, isActive ? "text-white" : "text-[#2B5FC7] dark:text-[#3B6FE0]", 18)}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{item.label}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Quick Demo Role Switcher */}
          <section className="bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#1B2436] dark:text-[#E8ECF3] flex items-center gap-1.5">
                <IconShield size={14} className="text-[#2B5FC7] dark:text-[#3B6FE0]" />
                <span>Ganti Role Akun Demo</span>
              </span>
              <span className="text-[10px] text-[#2B5FC7] dark:text-[#3B6FE0] font-medium">1-Tap Switch</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const isCurrent = user?.email === acc.email;
                return (
                  <button
                    key={acc.email}
                    onClick={() => handleQuickSwitch(acc.email)}
                    disabled={isCurrent}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-colors ${
                      isCurrent
                        ? "bg-[#2B5FC7] text-white font-medium dark:bg-[#3B6FE0]"
                        : "bg-white dark:bg-[#16223A] text-[#1B2436] dark:text-[#E8ECF3] border border-[#E2E6ED] dark:border-[#26334D] hover:border-[#2B5FC7]"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2B5FC7] dark:bg-[#3B6FE0] flex-shrink-0" />
                    <span className="truncate text-[11px]">{acc.role}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] safe-bottom flex gap-2 flex-shrink-0">
          <button
            onClick={handleLogout}
            id="mobile-logout-btn"
            className="w-full py-2.5 px-4 rounded-lg bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] dark:bg-[#7F1D1D]/20 dark:border-[#7F1D1D]/40 dark:text-[#F87171] font-medium text-xs flex items-center justify-center gap-2 active:scale-98 transition-colors"
          >
            <IconLogOut size={16} />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </div>
    </div>
  );
}
