"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

export default function Header({ onMenuToggle, title = "Dashboard" }: HeaderProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-white/95 dark:bg-[#16223A]/95 backdrop-blur-md border-b border-[#E2E6ED] dark:border-[#26334D] flex items-center justify-between px-4 sm:px-6 flex-shrink-0 sticky top-0 z-20 transition-colors duration-200">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onMenuToggle}
          id="mobile-menu-toggle"
          className="lg:hidden p-2 rounded-lg text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3] bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] active:scale-95 transition-all"
          aria-label="Buka Menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-[#1B2436] dark:text-[#E8ECF3] leading-tight tracking-tight">
              {title}
            </h1>
            {/* Mobile Role Badge */}
            <span className="lg:hidden px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#EFF4FE] text-[#2B5FC7] border border-[#D6E3FC] dark:bg-[#3B6FE0]/15 dark:text-[#93C5FD] dark:border-[#3B6FE0]/30">
              {user?.role_display}
            </span>
          </div>
          <p className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] hidden sm:block">
            CV Solusi Inovasi Packaging
          </p>
        </div>
      </div>

      {/* Right: Actions, Theme Toggle & User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          id="theme-toggle-btn"
          aria-label="Ganti Mode Tampilan"
          title={theme === "dark" ? "Beralih ke Light Mode" : "Beralih ke Dark Mode"}
          className="p-2 rounded-lg text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3] bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] hover:border-[#2B5FC7] dark:hover:border-[#3B6FE0] active:scale-95 transition-all"
        >
          {theme === "dark" ? (
            /* Sun Icon */
            <svg className="w-4 h-4 text-[#FBBF24]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            /* Moon Icon */
            <svg className="w-4 h-4 text-[#2B5FC7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* ROP Alert Bell */}
        <button
          id="header-rop-alert-btn"
          className="relative p-2 rounded-lg text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3] bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] hover:border-[#2B5FC7] dark:hover:border-[#3B6FE0] active:scale-95 transition-all"
          title="Notifikasi & Peringatan ROP"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#991B1B] dark:bg-[#F87171]" />
        </button>

        {/* Desktop Role Pill */}
        <div className="hidden lg:flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#EFF4FE] text-[#2B5FC7] border border-[#D6E3FC] dark:bg-[#3B6FE0]/15 dark:text-[#93C5FD] dark:border-[#3B6FE0]/30">
          {user?.role_display}
        </div>

        {/* User Monogram Avatar */}
        <button
          onClick={onMenuToggle}
          className="h-8 w-8 rounded-lg bg-[#2B5FC7] dark:bg-[#3B6FE0] flex items-center justify-center text-xs font-semibold text-white shadow-sm active:scale-95 transition-all"
          aria-label="Profil Pengguna"
        >
          {user?.name?.charAt(0) ?? "?"}
        </button>
      </div>
    </header>
  );
}
