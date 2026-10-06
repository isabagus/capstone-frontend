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
import { useUnitConversions, useUnits } from "@/hooks/useInventoryData";
import { unitService, type UnitWithUsage } from "@/services/masterService";
import type { UnitConversion, UnitType } from "@/types/inventory";
import { formatNumber } from "@/lib/inventoryUtils";
import {
  IconEdit,
  IconPlus,
  IconPower,
  IconRefresh,
  IconRuler,
  IconTrash,
} from "@/components/icons/Icons";

export default function UnitsPage() {
  const { data: units, loading: loadingUnits, error: errorUnits, reload: reloadUnits } = useUnits();
  const {
    data: conversions,
    loading: loadingConversions,
    error: errorConversions,
    reload: reloadConversions,
  } = useUnitConversions();

  // Tab
  const [activeTab, setActiveTab] = useState<"units" | "conversions">("units");

  // Modals for Satuan
  const [editUnit, setEditUnit] = useState<UnitWithUsage | null>(null);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [toggleUnit, setToggleUnit] = useState<UnitWithUsage | null>(null);

  // Form State Satuan
  const [unitName, setUnitName] = useState("");
  const [unitAbbr, setUnitAbbr] = useState("");
  const [unitType, setUnitType] = useState<UnitType>("Unit");
  const [unitActive, setUnitActive] = useState(true);

  // Modals for Konversi
  const [editConversion, setEditConversion] = useState<UnitConversion | null>(null);
  const [isAddConvOpen, setIsAddConvOpen] = useState(false);
  const [deleteConv, setDeleteConv] = useState<UnitConversion | null>(null);

  // Form State Konversi
  const [fromUnitId, setFromUnitId] = useState("");
  const [toUnitId, setToUnitId] = useState("");
  const [factor, setFactor] = useState<string>("1");
  const [note, setNote] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Handlers Satuan
  const openAddUnit = () => {
    setUnitName("");
    setUnitAbbr("");
    setUnitType("Unit");
    setUnitActive(true);
    setFormError(null);
    setIsAddUnitOpen(true);
  };

  const openEditUnit = (u: UnitWithUsage) => {
    setEditUnit(u);
    setUnitName(u.name);
    setUnitAbbr(u.abbr);
    setUnitType(u.type);
    setUnitActive(u.active);
    setFormError(null);
  };

  const handleSaveUnit = async () => {
    if (!unitName.trim() || !unitAbbr.trim()) {
      setFormError("Nama satuan dan singkatan wajib diisi.");
      return;
    }
    setPending(true);
    setFormError(null);
    try {
      const payload = {
        name: unitName.trim(),
        abbr: unitAbbr.trim(),
        type: unitType,
        active: unitActive,
      };
      if (editUnit) {
        await unitService.update(editUnit.id, payload);
        setEditUnit(null);
      } else {
        await unitService.create(payload);
        setIsAddUnitOpen(false);
      }
      reloadUnits();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan satuan.");
    } finally {
      setPending(false);
    }
  };

  const handleToggleUnit = async () => {
    if (!toggleUnit) return;
    setPending(true);
    try {
      await unitService.update(toggleUnit.id, {
        name: toggleUnit.name,
        abbr: toggleUnit.abbr,
        type: toggleUnit.type,
        active: !toggleUnit.active,
      });
      setToggleUnit(null);
      reloadUnits();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengubah status satuan.");
    } finally {
      setPending(false);
    }
  };

  // Handlers Konversi
  const openAddConv = () => {
    setFromUnitId(units?.[0]?.id || "");
    setToUnitId(units?.[1]?.id || units?.[0]?.id || "");
    setFactor("1");
    setNote("");
    setFormError(null);
    setIsAddConvOpen(true);
  };

  const openEditConv = (c: UnitConversion) => {
    setEditConversion(c);
    setFromUnitId(c.fromUnitId);
    setToUnitId(c.toUnitId);
    setFactor(String(c.factor));
    setNote(c.note || "");
    setFormError(null);
  };

  const handleSaveConv = async () => {
    const numFactor = parseFloat(factor);
    if (isNaN(numFactor) || numFactor <= 0) {
      setFormError("Faktor konversi harus berupa angka positif lebih dari 0.");
      return;
    }
    if (fromUnitId === toUnitId) {
      setFormError("Satuan asal dan tujuan tidak boleh sama.");
      return;
    }

    setPending(true);
    setFormError(null);
    try {
      await unitService.saveConversion(
        {
          fromUnitId,
          toUnitId,
          factor: numFactor,
          note: note.trim() || undefined,
        },
        editConversion?.id
      );
      setIsAddConvOpen(false);
      setEditConversion(null);
      reloadConversions();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan konversi satuan.");
    } finally {
      setPending(false);
    }
  };

  const handleDeleteConv = async () => {
    if (!deleteConv) return;
    setPending(true);
    try {
      await unitService.removeConversion(deleteConv.id);
      setDeleteConv(null);
      reloadConversions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus konversi.");
    } finally {
      setPending(false);
    }
  };

  // Unit Columns
  const unitColumns: Column<UnitWithUsage>[] = [
    {
      key: "name",
      header: "Nama Satuan",
      sortable: true,
      render: (u) => (
        <div>
          <span className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{u.name}</span>
          <span className="ml-2 font-mono text-[11px] text-[#6B7684] dark:text-[#8A94A6]">({u.abbr})</span>
        </div>
      ),
    },
    {
      key: "abbr",
      header: "Singkatan",
      sortable: true,
      className: "font-mono font-medium text-[#2B5FC7] dark:text-[#93B4F5]",
      render: (u) => u.abbr,
    },
    {
      key: "type",
      header: "Tipe Satuan",
      sortable: true,
      render: (u) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D]">
          {u.type}
        </span>
      ),
    },
    {
      key: "usage",
      header: "Digunakan Oleh",
      align: "center",
      render: (u) => (
        <span className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
          {u.usage > 0 ? `${u.usage} item` : "Belum dipakai"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (u) => (
        <StatusBadge tone={u.active ? "green" : "gray"} dot>
          {u.active ? "Aktif" : "Nonaktif"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      render: (u) => (
        <div className="flex items-center justify-end gap-1">
          <Can permission="master.units.edit">
            <button
              type="button"
              onClick={() => openEditUnit(u)}
              className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#2B5FC7] hover:bg-[#EFF4FE] dark:hover:bg-[#1B2A44] transition-colors"
              title="Edit Satuan"
            >
              <IconEdit size={16} />
            </button>
          </Can>
          <Can permission="master.units.deactivate">
            <button
              type="button"
              onClick={() => setToggleUnit(u)}
              className={`p-1.5 rounded-lg transition-colors ${
                u.active
                  ? "text-[#6B7684] hover:text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#7F1D1D]/30"
                  : "text-[#6B7684] hover:text-[#059669] hover:bg-[#ECFDF5] dark:hover:bg-[#064E3B]/30"
              }`}
              title={u.active ? "Nonaktifkan" : "Aktifkan"}
            >
              <IconPower size={16} />
            </button>
          </Can>
        </div>
      ),
    },
  ];

  // Conversion Columns
  const convColumns: Column<UnitConversion>[] = [
    {
      key: "formula",
      header: "Formula Konversi",
      render: (c) => {
        const from = units?.find((u) => u.id === c.fromUnitId);
        const to = units?.find((u) => u.id === c.toUnitId);
        return (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-[#2B5FC7] dark:text-[#93B4F5]">
              1 {from?.name} ({from?.abbr})
            </span>
            <span className="text-[#6B7684] dark:text-[#8A94A6]">=</span>
            <span className="font-bold text-sm text-[#1B2436] dark:text-[#E8ECF3]">
              {formatNumber(c.factor)} {to?.name} ({to?.abbr})
            </span>
          </div>
        );
      },
    },
    {
      key: "factor",
      header: "Nilai Pengali",
      align: "right",
      className: "font-mono font-bold text-sm",
      render: (c) => formatNumber(c.factor),
    },
    {
      key: "note",
      header: "Catatan BOM Engine",
      render: (c) => (
        <span className="text-xs text-[#6B7684] dark:text-[#8A94A6]">
          {c.note || "Standar konversi"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <Can permission="master.units.edit">
            <button
              type="button"
              onClick={() => openEditConv(c)}
              className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#2B5FC7] hover:bg-[#EFF4FE] dark:hover:bg-[#1B2A44] transition-colors"
              title="Edit Konversi"
            >
              <IconEdit size={16} />
            </button>
          </Can>
          <Can permission="master.units.delete">
            <button
              type="button"
              onClick={() => setDeleteConv(c)}
              className="p-1.5 rounded-lg text-[#6B7684] hover:text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#7F1D1D]/30 transition-colors"
              title="Hapus Konversi"
            >
              <IconTrash size={16} />
            </button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Master Satuan & Konversi">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          eyebrow="Master Data"
          title="Satuan & Rasio Konversi BOM"
          subtitle="Standarisasi satuan kuantitas inventori dan aturan konversi matematis untuk kalkulator BOM percetakan"
          actions={
            <div className="flex items-center gap-2">
              {activeTab === "units" ? (
                <Can permission="master.units.create">
                  <button type="button" onClick={openAddUnit} className={btn.primary}>
                    <IconPlus size={14} strokeWidth={2.5} />
                    <span>Tambah Satuan</span>
                  </button>
                </Can>
              ) : (
                <Can permission="master.units.create">
                  <button type="button" onClick={openAddConv} className={btn.primary}>
                    <IconPlus size={14} strokeWidth={2.5} />
                    <span>Tambah Konversi</span>
                  </button>
                </Can>
              )}
            </div>
          }
        />

        {/* Tab Selection */}
        <div className="flex border-b border-[#E2E6ED] dark:border-[#26334D] gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("units")}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "units"
                ? "border-[#2B5FC7] text-[#2B5FC7] dark:border-[#3B6FE0] dark:text-[#93B4F5]"
                : "border-transparent text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3]"
            }`}
          >
            <IconRuler size={16} />
            <span>Daftar Satuan ({units?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("conversions")}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "conversions"
                ? "border-[#2B5FC7] text-[#2B5FC7] dark:border-[#3B6FE0] dark:text-[#93B4F5]"
                : "border-transparent text-[#6B7684] hover:text-[#1B2436] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3]"
            }`}
          >
            <IconRefresh size={16} />
            <span>Konfigurasi Konversi BOM ({conversions?.length || 0})</span>
          </button>
        </div>

        {/* Tab 1: Satuan */}
        {activeTab === "units" && (
          <DataTable
            columns={unitColumns}
            data={units}
            keyExtractor={(u) => u.id}
            loading={loadingUnits}
            error={errorUnits}
            onRetry={reloadUnits}
            searchPlaceholder="Cari satuan, singkatan, tipe..."
            searchFilter={(u, q) =>
              u.name.toLowerCase().includes(q) ||
              u.abbr.toLowerCase().includes(q) ||
              u.type.toLowerCase().includes(q)
            }
            defaultSort={{ key: "name", direction: "asc" }}
            emptyTitle="Belum Ada Satuan"
            emptySubtitle="Belum ada satuan kuantitas yang terdaftar."
          />
        )}

        {/* Tab 2: Konversi */}
        {activeTab === "conversions" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#EFF4FE] dark:bg-[#1D4ED8]/15 border border-[#D6E3FC] dark:border-[#26334D] text-xs flex items-start gap-3">
              <IconRuler size={20} className="text-[#2B5FC7] dark:text-[#93B4F5] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#2B5FC7] dark:text-[#93B4F5] block mb-0.5">
                  Integrasi Otomatis dengan BOM Engine (Bill of Materials)
                </span>
                <p className="text-[#1E4FB0] dark:text-[#DBEAFE] leading-relaxed">
                  Rasio konversi di bawah digunakan saat menghitung kebutuhan plano kertas menjadi lembar jadi, konversi roll foil, dan gramatur tinta. Perubahan rasio akan langsung mempengaruhi rumus kalkulasi SPK.
                </p>
              </div>
            </div>

            <DataTable
              columns={convColumns}
              data={conversions}
              keyExtractor={(c) => c.id}
              loading={loadingConversions}
              error={errorConversions}
              onRetry={reloadConversions}
              searchPlaceholder="Cari formula konversi..."
              searchFilter={(c, q) => {
                const from = units?.find((u) => u.id === c.fromUnitId)?.name || "";
                const to = units?.find((u) => u.id === c.toUnitId)?.name || "";
                return (
                  from.toLowerCase().includes(q) ||
                  to.toLowerCase().includes(q) ||
                  Boolean(c.note && c.note.toLowerCase().includes(q))
                );
              }}
              emptyTitle="Belum Ada Aturan Konversi"
              emptySubtitle="Tambahkan aturan konversi pertama seperti 1 Rim = 500 Lembar."
            />
          </div>
        )}

        {/* Modal Tambah/Edit Satuan */}
        <FormModal
          open={isAddUnitOpen || !!editUnit}
          onClose={() => {
            setIsAddUnitOpen(false);
            setEditUnit(null);
          }}
          title={editUnit ? "Edit Satuan" : "Tambah Satuan Baru"}
          subtitle="Tentukan nama satuan, singkatan baku, dan tipe kuantitas"
          icon={<IconRuler size={20} />}
          onSubmit={handleSaveUnit}
          submitLabel={editUnit ? "Simpan Perubahan" : "Tambah Satuan"}
          pending={pending}
          error={formError}
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Nama Satuan <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder="Contoh: Rim, Plano, Kg, Lembar"
                className={inputBase}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Singkatan <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={unitAbbr}
                  onChange={(e) => setUnitAbbr(e.target.value)}
                  placeholder="Contoh: rim, lbr, kg"
                  className={inputBase}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Tipe Satuan</label>
                <select
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value as UnitType)}
                  className={inputBase}
                >
                  <option value="Lembar">Lembar</option>
                  <option value="Berat">Berat</option>
                  <option value="Panjang">Panjang</option>
                  <option value="Volume">Volume</option>
                  <option value="Unit">Unit</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="unit-active"
                checked={unitActive}
                onChange={(e) => setUnitActive(e.target.checked)}
                className="rounded border-[#E2E6ED] text-[#2B5FC7]"
              />
              <label htmlFor="unit-active" className="text-xs font-medium cursor-pointer">
                Satuan Aktif & Dapat Dipakai
              </label>
            </div>
          </div>
        </FormModal>

        {/* Modal Tambah/Edit Konversi */}
        <FormModal
          open={isAddConvOpen || !!editConversion}
          onClose={() => {
            setIsAddConvOpen(false);
            setEditConversion(null);
          }}
          title={editConversion ? "Edit Konversi Satuan" : "Tambah Formula Konversi"}
          subtitle="Contoh: 1 Rim = 500 Lembar untuk perhitungan BOM"
          icon={<IconRefresh size={20} />}
          onSubmit={handleSaveConv}
          submitLabel={editConversion ? "Simpan Perubahan" : "Simpan Formula"}
          pending={pending}
          error={formError}
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  1 Satuan Asal <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  value={fromUnitId}
                  onChange={(e) => setFromUnitId(e.target.value)}
                  className={inputBase}
                >
                  {units?.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.abbr})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Sama Dengan (=) <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="number"
                  min="0.0001"
                  step="any"
                  value={factor}
                  onChange={(e) => setFactor(e.target.value)}
                  placeholder="500"
                  className={inputBase}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Satuan Target <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  value={toUnitId}
                  onChange={(e) => setToUnitId(e.target.value)}
                  className={inputBase}
                >
                  {units?.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.abbr})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Catatan Tambahan</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Standar rim kertas percetakan"
                className={inputBase}
              />
            </div>
          </div>
        </FormModal>

        {/* Dialog Hapus Konversi */}
        <ConfirmDialog
          open={!!deleteConv}
          onClose={() => setDeleteConv(null)}
          onConfirm={handleDeleteConv}
          title="Hapus Formula Konversi"
          message="Apakah Anda yakin ingin menghapus formula konversi ini? Perhitungan BOM yang membutuhkan konversi ini mungkin akan terpengaruh."
          tone="danger"
          pending={pending}
        />

        {/* Dialog Toggle Satuan */}
        <ConfirmDialog
          open={!!toggleUnit}
          onClose={() => setToggleUnit(null)}
          onConfirm={handleToggleUnit}
          title={toggleUnit?.active ? "Nonaktifkan Satuan" : "Aktifkan Satuan"}
          message={
            <span>
              Apakah Anda yakin ingin {toggleUnit?.active ? "menonaktifkan" : "mengaktifkan"} satuan{" "}
              <strong>{toggleUnit?.name}</strong>?
            </span>
          }
          tone={toggleUnit?.active ? "danger" : "primary"}
          confirmLabel={toggleUnit?.active ? "Nonaktifkan" : "Aktifkan"}
          pending={pending}
        />
      </div>
    </DashboardLayout>
  );
}
