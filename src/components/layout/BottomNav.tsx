"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { IconDashboard, renderNavIcon } from "@/components/icons/Icons";

interface BottomNavProps {
  onOpenMenu: () => void;
  onOpenRopModal?: () => void;
}

export default function BottomNav({ onOpenMenu, onOpenRopModal }: BottomNavProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  const normalizedRole = (user?.role || "").toLowerCase().replace(/[\s-]+/g, "_");

  const getPrimaryModule = () => {
    switch (normalizedRole) {
      case "front_office":
        return { id: "orders", label: "Order", href: "/dashboard/orders" };
      case "tim_design":
        return { id: "bom", label: "BOM", href: "/dashboard/bom" };
      case "kepala_produksi":
        return { id: "production", label: "Kanban", href: "/dashboard/production" };
      case "quality_control":
        return { id: "qc", label: "QC", href: "/dashboard/qc" };
      case "staf_gudang":
        return { id: "inv-materials", label: "Bahan Baku", href: "/dashboard/inventory/materials" };
      case "manager":
      case "owner":
      default:
        return { id: "inventory", label: "Inventori", href: "/dashboard/inventory" };
    }
  };

  const primaryMod = getPrimaryModule();
  const isHomeActive = pathname === "/dashboard";
  const isPrimaryActive = pathname === primaryMod.href;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#16223A]/95 backdrop-blur-md border-t border-[#E2E6ED] dark:border-[#26334D] px-2 py-1.5 safe-bottom transition-colors duration-200"
    >
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* 1. Tab: Beranda */}
        <Link
          href="/dashboard"
          id="mobile-nav-home"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors active:scale-95 ${
            isHomeActive
              ? "text-[#2B5FC7] dark:text-[#3B6FE0] font-semibold"
              : "text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3]"
          }`}
        >
          <IconDashboard size={18} strokeWidth={isHomeActive ? 2.2 : 1.75} />
          <span className="text-[10px] mt-0.5">Beranda</span>
        </Link>

        {/* 2. Tab: Modul Utama */}
        <Link
          href={primaryMod.href}
          id="mobile-nav-primary"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors active:scale-95 ${
            isPrimaryActive
              ? "text-[#2B5FC7] dark:text-[#3B6FE0] font-semibold"
              : "text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3]"
          }`}
        >
          {renderNavIcon(primaryMod.id, undefined, 18)}
          <span className="text-[10px] mt-0.5">{primaryMod.label}</span>
        </Link>

        {/* 3. Center Action Button */}
        <div className="relative -top-3 flex flex-col items-center">
          <button
            onClick={onOpenMenu}
            id="mobile-center-fab"
            aria-label="Buka Semua Menu"
            className="w-11 h-11 rounded-lg bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] dark:hover:bg-[#2B5FC7] text-white flex items-center justify-center shadow-sm active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-[9px] text-[#2B5FC7] dark:text-[#3B6FE0] font-medium mt-0.5">Menu</span>
        </div>

        {/* 4. Tab: ROP Alerts */}
        <button
          onClick={onOpenRopModal || onOpenMenu}
          id="mobile-nav-alerts"
          aria-label="Alert ROP"
          className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3] transition-colors active:scale-95 relative"
        >
          <div className="relative">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#991B1B] dark:bg-[#F87171]" />
          </div>
          <span className="text-[10px] mt-0.5">Alert</span>
        </button>

        {/* 5. Tab: Akun / Profil */}
        <button
          onClick={onOpenMenu}
          id="mobile-nav-profile"
          aria-label="Profil Pengguna"
          className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3] transition-colors active:scale-95"
        >
          <div className="w-5 h-5 rounded-md bg-[#2B5FC7] dark:bg-[#3B6FE0] text-white flex items-center justify-center text-[9px] font-semibold">
            {user?.name?.charAt(0) ?? "U"}
          </div>
          <span className="text-[10px] mt-0.5">Profil</span>
        </button>
      </div>
    </nav>
  );
}
