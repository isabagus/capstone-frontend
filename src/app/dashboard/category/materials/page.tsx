import CategoryManagement from "@/components/category/CategoryManagement";

export default function MaterialCategoriesPage() {
  return (
    <CategoryManagement
      kind="material"
      title="Kategori Bahan Baku"
      subtitle="Klasifikasi material dasar percetakan: kertas plano, greyboard, tinta sensitif, foil, laminasi, dan lem"
      permissionPrefix="category.materials"
    />
  );
}
