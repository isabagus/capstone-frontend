"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CategoryManagement from "@/components/category/CategoryManagement";
import type { CategoryKind } from "@/types/inventory";
import { IconLayers, IconWrench, IconBox } from "@/components/icons/Icons";

function UnifiedCategoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = (searchParams.get("tab") || "material") as CategoryKind;
  const [activeTab, setActiveTab] = useState<CategoryKind>(
    ["material", "sparepart", "product"].includes(tabParam) ? tabParam : "material"
  );

  const handleTabChange = (kind: CategoryKind) => {
    setActiveTab(kind);
    router.replace(`/dashboard/category?tab=${kind}`);
  };

  const getTabConfig = () => {
    switch (activeTab) {
      case "material":
        return {
          title: "Kategori Bahan Baku",
          subtitle:
            "Klasifikasi material percetakan: Kertas Plano, Greyboard, Tinta UV/Solvent, Foil, Laminasi Doff/Glossy, dan Lem",
          permissionPrefix: "category.materials",
        };
      case "sparepart":
        return {
          title: "Kategori Sparepart Mesin",
          subtitle:
            "Suku cadang dan consumables mesin: Offset Heidelberg, Pon Roland, Polar Cutting, dan Laminating",
          permissionPrefix: "category.spareparts",
        };
      case "product":
        return {
          title: "Kategori Produk Jadi Kemasan",
          subtitle:
            "Segmentasi kemasan pesanan: Hardbox Premium, Softbox Kosmetik, Paperbag, Label Stiker, dan Stationery",
          permissionPrefix: "category.products",
        };
    }
  };

  const config = getTabConfig();

  const tabsSlot = (
    <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm w-fit">
      <button
        type="button"
        onClick={() => handleTabChange("material")}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          activeTab === "material"
            ? "bg-[#2B5FC7] text-white dark:bg-[#3B6FE0] shadow-sm"
            : "text-[#6B7684] hover:text-[#1B2436] hover:bg-[#F4F6FA] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3] dark:hover:bg-[#1B2A44]"
        }`}
      >
        <IconLayers size={14} />
        <span>Kategori Bahan Baku</span>
        <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-white/20 font-bold">
          Prioritas
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleTabChange("sparepart")}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          activeTab === "sparepart"
            ? "bg-[#2B5FC7] text-white dark:bg-[#3B6FE0] shadow-sm"
            : "text-[#6B7684] hover:text-[#1B2436] hover:bg-[#F4F6FA] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3] dark:hover:bg-[#1B2A44]"
        }`}
      >
        <IconWrench size={14} />
        <span>Kategori Sparepart</span>
      </button>

      <button
        type="button"
        onClick={() => handleTabChange("product")}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          activeTab === "product"
            ? "bg-[#2B5FC7] text-white dark:bg-[#3B6FE0] shadow-sm"
            : "text-[#6B7684] hover:text-[#1B2436] hover:bg-[#F4F6FA] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3] dark:hover:bg-[#1B2A44]"
        }`}
      >
        <IconBox size={14} />
        <span>Kategori Produk Jadi</span>
      </button>
    </div>
  );

  return (
    <CategoryManagement
      key={activeTab}
      kind={activeTab}
      title={config.title}
      subtitle={config.subtitle}
      permissionPrefix={config.permissionPrefix}
      tabsSlot={tabsSlot}
    />
  );
}

export default function UnifiedCategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#2B5FC7] border-t-transparent animate-spin" />
        </div>
      }
    >
      <UnifiedCategoryContent />
    </Suspense>
  );
}
