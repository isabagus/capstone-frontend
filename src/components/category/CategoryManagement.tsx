"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { type Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Can from "@/components/auth/Can";
import { btn, inputBase } from "@/components/ui/styles";
import { useCategories } from "@/hooks/useInventoryData";
import { categoryService, type CategoryWithCount } from "@/services/categoryService";
import type { CategoryKind } from "@/types/inventory";
import { IconEdit, IconFolder, IconPlus, IconTrash } from "@/components/icons/Icons";

interface CategoryManagementProps {
  kind: CategoryKind;
  title: string;
  subtitle: string;
  permissionPrefix: string;
}

export default function CategoryManagement({
  kind,
  title,
  subtitle,
  permissionPrefix,
}: CategoryManagementProps) {
  const { data: categories, loading, error, reload } = useCategories(kind);

  // Modals
  const [editCategory, setEditCategory] = useState<CategoryWithCount | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<CategoryWithCount | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openAdd = () => {
    setName("");
    setDescription("");
    setActive(true);
    setFormError(null);
    setIsAddOpen(true);
  };

  const openEdit = (cat: CategoryWithCount) => {
    setEditCategory(cat);
    setName(cat.name);
    setDescription(cat.description);
    setActive(cat.active);
    setFormError(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setFormError("Nama kategori wajib diisi.");
      return;
    }

    setPending(true);
    setFormError(null);
    try {
      const payload = {
        kind,
        name: name.trim(),
        description: description.trim(),
        active,
      };

      if (editCategory) {
        await categoryService.update(editCategory.id, payload);
        setEditCategory(null);
      } else {
        await categoryService.create(payload);
        setIsAddOpen(false);
      }
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan kategori.");
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;
    setPending(true);
    setDeleteError(null);
    try {
      await categoryService.remove(deleteCategory.id);
      setDeleteCategory(null);
      reload();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Gagal menghapus kategori.");
    } finally {
      setPending(false);
    }
  };

  const columns: Column<CategoryWithCount>[] = [
    {
      key: "name",
      header: "Nama Kategori",
      sortable: true,
      render: (cat) => (
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-[#F4F6FA] dark:bg-[#1B2A44] text-[#2B5FC7] dark:text-[#93B4F5]">
            <IconFolder size={14} />
          </span>
          <span className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{cat.name}</span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Deskripsi",
      render: (cat) => (
        <span className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
          {cat.description || "Tidak ada deskripsi"}
        </span>
      ),
    },
    {
      key: "itemCount",
      header: "Jumlah Item",
      align: "center",
      sortable: true,
      sortValue: (cat) => cat.itemCount,
      render: (cat) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            cat.itemCount > 0
              ? "bg-[#EFF4FE] text-[#2B5FC7] dark:bg-[#3B6FE0]/15 dark:text-[#93B4F5]"
              : "bg-[#F4F6FA] text-[#6B7684] dark:bg-[#1B2A44] dark:text-[#8A94A6]"
          }`}
        >
          {cat.itemCount} item
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (cat) => (
        <StatusBadge tone={cat.active ? "green" : "gray"} dot>
          {cat.active ? "Aktif" : "Nonaktif"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      render: (cat) => (
        <div className="flex items-center justify-end gap-1">
          <Can permission={`${permissionPrefix}.edit`}>
            <button
              type="button"
              onClick={() => openEdit(cat)}
              className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#2B5FC7] hover:bg-[#EFF4FE] dark:hover:bg-[#1B2A44] transition-colors"
              title="Edit Kategori"
            >
              <IconEdit size={16} />
            </button>
          </Can>
          <Can permission={`${permissionPrefix}.delete`}>
            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setDeleteCategory(cat);
              }}
              className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#7F1D1D]/30 transition-colors"
              title="Hapus Kategori"
            >
              <IconTrash size={16} />
            </button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title={title}>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          eyebrow="Manajemen Kategori"
          title={title}
          subtitle={subtitle}
          actions={
            <Can permission={`${permissionPrefix}.create`}>
              <button type="button" onClick={openAdd} className={btn.primary}>
                <IconPlus size={14} strokeWidth={2.5} />
                <span>Tambah Kategori</span>
              </button>
            </Can>
          }
        />

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={categories}
          keyExtractor={(c) => c.id}
          loading={loading}
          error={error}
          onRetry={reload}
          searchPlaceholder="Cari nama kategori, deskripsi..."
          searchFilter={(c, q) =>
            c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
          }
          defaultSort={{ key: "name", direction: "asc" }}
          emptyTitle="Belum Ada Kategori"
          emptySubtitle="Belum ada data kategori untuk jenis ini."
        />

        {/* Modal Tambah / Edit */}
        <FormModal
          open={isAddOpen || !!editCategory}
          onClose={() => {
            setIsAddOpen(false);
            setEditCategory(null);
          }}
          title={editCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
          subtitle="Tentukan nama kategori dan deskripsi cakupan barang"
          icon={<IconFolder size={20} />}
          onSubmit={handleSave}
          submitLabel={editCategory ? "Simpan Perubahan" : "Tambah Kategori"}
          pending={pending}
          error={formError}
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Nama Kategori <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Hardbox / Rigid Box"
                className={inputBase}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Deskripsi Cakupan</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Penjelasan jenis item dalam kategori ini..."
                className={inputBase}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="cat-active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded border-[#E2E6ED] text-[#2B5FC7]"
              />
              <label htmlFor="cat-active" className="text-xs font-medium cursor-pointer">
                Status Kategori Aktif
              </label>
            </div>
          </div>
        </FormModal>

        {/* Dialog Hapus Kategori (dengan blokir jika masih dipakai item) */}
        <ConfirmDialog
          open={!!deleteCategory}
          onClose={() => {
            setDeleteCategory(null);
            setDeleteError(null);
          }}
          onConfirm={handleDelete}
          title="Hapus Kategori"
          message={
            deleteCategory?.itemCount && deleteCategory.itemCount > 0 ? (
              <span className="text-[#991B1B] dark:text-[#F87171]">
                Kategori <strong>{deleteCategory.name}</strong> masih digunakan oleh{" "}
                <strong>{deleteCategory.itemCount} item</strong> inventori aktif. Anda tidak dapat
                menghapusnya sampai semua item dipindahkan ke kategori lain.
              </span>
            ) : (
              <span>
                Apakah Anda yakin ingin menghapus kategori <strong>{deleteCategory?.name}</strong>?
              </span>
            )
          }
          tone="danger"
          pending={pending}
          error={deleteError}
        />
      </div>
    </DashboardLayout>
  );
}
