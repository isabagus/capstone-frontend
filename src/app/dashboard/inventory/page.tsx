"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InventoryRootRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/inventory/materials");
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-10 h-10 rounded-full border-3 border-[#2B5FC7] border-t-transparent animate-spin mb-4" />
      <h2 className="text-sm font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
        Mengalihkan ke Inventori Bahan Baku...
      </h2>
      <p className="text-xs text-[#6B7684] dark:text-[#8A94A6] mt-1">
        Bahan baku adalah prioritas utama pengelolaan gudang.
      </p>
    </div>
  );
}
