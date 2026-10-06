import CategoryManagement from "@/components/category/CategoryManagement";

export default function SparepartCategoriesPage() {
  return (
    <CategoryManagement
      kind="sparepart"
      title="Kategori Sparepart & Consumable"
      subtitle="Klasifikasi suku cadang mesin, blanket offset, pisau pond, bahan kimia cetak, dan perlengkapan teknisi"
      permissionPrefix="category.spareparts"
    />
  );
}
