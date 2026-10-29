"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StockTransferRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/transaction?action=transfer");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#2B5FC7] border-t-transparent animate-spin" />
    </div>
  );
}
