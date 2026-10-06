"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNavGroups, isNavActive } from "@/config/navigation";
import { renderNavIcon, IconLogOut } from "@/components/icons/Icons";
import Can from "@/components/auth/Can";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const navGroups = useNavGroups();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white dark:bg-[#16223A] border-r border-[#E2E6ED] dark:border-[#26334D]
          flex flex-col z-40 transition-transform duration-200 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo & Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-[#E2E6ED] dark:border-[#26334D] flex-shrink-0">
          <div className="h-9 w-9 rounded-lg bg-[#2B5FC7] dark:bg-[#3B6FE0] flex items-center justify-center font-bold text-white text-sm shadow-sm flex-shrink-0">
            ERP
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[#1B2436] dark:text-[#E8ECF3] text-sm truncate leading-tight tracking-tight">
              ERP Percetakan
            </div>
            <div className="text-[11px] font-medium text-[#2B5FC7] dark:text-[#3B6FE0]">
              CV Solusi Inovasi Packaging
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="mx-3 mt-3 mb-2 p-2.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#2B5FC7] dark:bg-[#3B6FE0] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {user?.name?.charAt(0) ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-[#1B2436] dark:text-[#E8ECF3] truncate">
                {user?.name}
              </div>
              <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6] truncate">
                {user?.role_display}
              </div>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1" aria-label="Menu utama">
          {navGroups.map((group, gi) => (
            <div key={group.id} className={group.label ? (gi > 0 ? "pt-3" : "") : "space-y-1"}>
              {group.label && (
                <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#6B7684] dark:text-[#8A94A6]">
                  {group.label}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = isNavActive(pathname, item.href);

                  const link = (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onClose}
                      id={`nav-${item.id}`}
                      aria-current={isActive ? "page" : undefined}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                        ${
                          isActive
                            ? "bg-[#2B5FC7] text-white dark:bg-[#3B6FE0] dark:text-white shadow-sm"
                            : "text-[#6B7684] hover:text-[#1B2436] hover:bg-[#F4F6FA] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3] dark:hover:bg-[#1B2A44]"
                        }
                      `}
                    >
                      <span className="flex-shrink-0">
                        {renderNavIcon(item.id, isActive ? "text-white" : "text-current", 16)}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );

                  return item.permission ? (
                    <Can key={item.id} permission={item.permission}>
                      {link}
                    </Can>
                  ) : (
                    link
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-[#E2E6ED] dark:border-[#26334D] flex-shrink-0">
          <button
            onClick={handleLogout}
            id="sidebar-logout-btn"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#6B7684] hover:text-[#991B1B] hover:bg-[#FEF2F2] dark:text-[#8A94A6] dark:hover:text-[#F87171] dark:hover:bg-[#7F1D1D]/20 transition-colors"
          >
            <IconLogOut size={16} className="flex-shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
