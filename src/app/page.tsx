"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Root page: redirect ke /dashboard jika sudah login, atau /login jika belum.
 */
export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [isLoading, user, router]);

  return (
    <div className="min-h-screen bg-[#F4F6FA] dark:bg-[#0F1B2D] flex items-center justify-center transition-colors">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-[#2B5FC7] dark:bg-[#3B6FE0] flex items-center justify-center font-bold text-white text-base shadow-sm animate-pulse">
          PS
        </div>
        <p className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
          Packsolution ERP — Memuat sistem...
        </p>
      </div>
    </div>
  );
}
