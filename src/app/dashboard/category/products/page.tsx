import CategoryManagement from "@/components/category/CategoryManagement";

export default function ProductCategoriesPage() {
  return (
    <CategoryManagement
      kind="product"
      title="Kategori Produk"
      subtitle="Klasifikasi produk kemasan jadi (hardbox, softbox, pouch, album) dan komponen setengah jadi"
      permissionPrefix="category.products"
    />
  );
}
