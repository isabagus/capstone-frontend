"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import MobileMenuSheet from "@/components/layout/MobileMenuSheet";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Guard: Redirect ke login jika belum auth
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6FA] dark:bg-[#0F1B2D] flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#2B5FC7] dark:bg-[#3B6FE0] flex items-center justify-center font-bold text-white shadow-sm animate-pulse">
            PS
          </div>
          <div className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6]">
            Memuat sistem...
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#F4F6FA] dark:bg-[#0F1B2D] text-[#1B2436] dark:text-[#E8ECF3] overflow-hidden transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar isOpen={false} onClose={() => {}} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <Header
          onMenuToggle={() => setMobileMenuOpen(true)}
          title={title}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav onOpenMenu={() => setMobileMenuOpen(true)} />

        {/* Mobile Menu Drawer */}
        <MobileMenuSheet
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>
    </div>
  );
}
