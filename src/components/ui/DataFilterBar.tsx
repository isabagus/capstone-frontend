"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  IconStore,
  IconCalendar,
  IconSearch,
  IconX,
  IconRefresh,
} from "@/components/icons/Icons";

export interface FilterValues {
  category?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

export interface CategoryOption {
  label: string;
  value: string;
}

export interface DataFilterBarProps {
  /** Menampilkan atau menyembunyikan filter kategori/brand/toko (default: true) */
  showCategory?: boolean;
  /** Label untuk dropdown kategori (default: "Brand / Toko Pemesan") */
  categoryLabel?: string;
  /** Daftar pilihan kategori (bisa array string atau array object {label, value}) */
  categoryOptions?: (string | CategoryOption)[];
  selectedCategory?: string;
  categoryIcon?: React.ReactNode;
  allCategoryLabel?: string;

  /** Menampilkan atau menyembunyikan filter rentang tanggal (default: true) */
  showDateRange?: boolean;
  dateLabel?: string;
  startDate?: string;
  endDate?: string;

  showSearch?: boolean;
  searchLabel?: string;
  searchPlaceholder?: string;
  /** Kata kunci pencarian awal */
  keyword?: string;

  /** Jumlah total data hasil filter (opsional, untuk indikator feedback hasil query) */
  filteredCount?: number;

  /** Callback yang dipanggil saat ada perubahan nilai filter */
  onFilterChange: (filters: FilterValues) => void;
  /** Callback saat tombol Reset Filter ditekan */
  onReset?: () => void;

  /** Delay debounce pencarian teks dalam milidetik (default: 300ms) */
  debounceMs?: number;

  /** ClassName kustom untuk container utama */
  className?: string;
}

export default function DataFilterBar({
  showCategory = true,
  categoryLabel = "Brand / Toko Pemesan",
  categoryOptions = [],
  selectedCategory = "Semua",
  categoryIcon,
  allCategoryLabel = "Semua Brand / Toko",

  showDateRange = true,
  dateLabel = "Rentang Tanggal Masuk (Order Diterima)",
  startDate: propStartDate = "",
  endDate: propEndDate = "",

  showSearch = true,
  searchLabel = "Pencarian SPK / Pemesan",
  searchPlaceholder = "Cari No. SPK, Order, atau Nama...",
  keyword: propKeyword = "",

  filteredCount,
  onFilterChange,
  onReset,
  debounceMs = 300,
  className = "",
}: DataFilterBarProps) {
  // Local states
  const [category, setCategory] = useState<string>(selectedCategory);
  const [startDate, setStartDate] = useState<string>(propStartDate);
  const [endDate, setEndDate] = useState<string>(propEndDate);
  const [keyword, setKeyword] = useState<string>(propKeyword);

  // Sync state if props change externally
  useEffect(() => {
    setCategory(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    setStartDate(propStartDate);
  }, [propStartDate]);

  useEffect(() => {
    setEndDate(propEndDate);
  }, [propEndDate]);

  useEffect(() => {
    setKeyword(propKeyword);
  }, [propKeyword]);

  // Debounced callback caller for text input
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      onFilterChange({
        category,
        startDate,
        endDate,
        keyword,
      });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [category, startDate, endDate, keyword, debounceMs, onFilterChange]);

  // Check if any filter is actively applied
  const isFilterActive =
    (category !== "" && category !== "Semua") ||
    startDate !== "" ||
    endDate !== "" ||
    keyword.trim() !== "";

  // Reset handler
  const handleReset = () => {
    setCategory("Semua");
    setStartDate("");
    setEndDate("");
    setKeyword("");
    if (onReset) {
      onReset();
    } else {
      onFilterChange({
        category: "Semua",
        startDate: "",
        endDate: "",
        keyword: "",
      });
    }
  };

  // Normalisasi opsi kategori
  const normalizedOptions: CategoryOption[] = categoryOptions.map((opt) => {
    if (typeof opt === "string") {
      return {
        label: opt === "Semua" ? allCategoryLabel : opt,
        value: opt,
      };
    }
    return opt;
  });

  // Pastikan opsi 'Semua' ada di paling depan jika belum ada
  const hasSemua = normalizedOptions.some((o) => o.value === "Semua" || o.value === "");
  const finalOptions: CategoryOption[] = hasSemua
    ? normalizedOptions
    : [{ label: allCategoryLabel, value: "Semua" }, ...normalizedOptions];

  return (
    <div
      className={`p-3.5 rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-sm space-y-3 ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        {/* 1. Category / Brand Dropdown */}
        {showCategory && (
          <div className="md:col-span-3 space-y-1">
            <label className="block text-[11px] font-semibold text-[#6B7684] dark:text-[#8A94A6]">
              {categoryLabel}
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-[#2B5FC7] dark:text-[#3B6FE0] pointer-events-none">
                {categoryIcon || <IconStore size={15} />}
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 pl-8 pr-7 rounded-lg bg-[#F8FAFC] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] text-xs font-medium focus:outline-none focus:border-[#2B5FC7] dark:focus:border-[#3B6FE0] appearance-none cursor-pointer transition-colors"
              >
                {finalOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-2.5 text-[#6B7684] dark:text-[#8A94A6] pointer-events-none text-[10px]">
                ▼
              </div>
            </div>
          </div>
        )}

        {/* 2. Date Range Input (Start Date s/d End Date) */}
        {showDateRange && (
          <div
            className={`${
              showCategory ? "md:col-span-5" : "md:col-span-6"
            } space-y-1`}
          >
            <label className="block text-[11px] font-semibold text-[#6B7684] dark:text-[#8A94A6]">
              {dateLabel}
            </label>
            <div className="flex items-center gap-1.5">
              {/* Start Date */}
              <div className="relative flex-1">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#2B5FC7] dark:text-[#3B6FE0] pointer-events-none">
                  <IconCalendar size={13} />
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-9 pl-7 pr-2 rounded-lg bg-[#F8FAFC] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] text-xs font-medium focus:outline-none focus:border-[#2B5FC7] dark:focus:border-[#3B6FE0] transition-colors"
                />
              </div>

              <span className="text-xs font-bold text-[#8A94A6] flex-shrink-0 px-0.5">
                s/d
              </span>

              {/* End Date */}
              <div className="relative flex-1">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#2B5FC7] dark:text-[#3B6FE0] pointer-events-none">
                  <IconCalendar size={13} />
                </div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-9 pl-7 pr-2 rounded-lg bg-[#F8FAFC] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] text-xs font-medium focus:outline-none focus:border-[#2B5FC7] dark:focus:border-[#3B6FE0] transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Search Input */}
        {showSearch && (
          <div
            className={`${
              showCategory ? "md:col-span-4" : showDateRange ? "md:col-span-6" : "md:col-span-12"
            } space-y-1`}
          >
            <label className="block text-[11px] font-semibold text-[#6B7684] dark:text-[#8A94A6]">
              {searchLabel}
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-[#6B7684] dark:text-[#8A94A6] pointer-events-none">
                <IconSearch size={14} />
              </div>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-9 pl-8 pr-7 rounded-lg bg-[#F8FAFC] dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] text-xs font-medium focus:outline-none focus:border-[#2B5FC7] dark:focus:border-[#3B6FE0] placeholder:text-[#8A94A6] transition-colors"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="absolute right-2.5 text-[#8A94A6] hover:text-[#1B2436] dark:hover:text-[#E8ECF3]"
                  title="Hapus kata kunci"
                >
                  <IconX size={13} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Active Filter Indicator & Reset Action */}
      {isFilterActive && (
        <div className="flex items-center justify-between pt-2 border-t border-[#E2E6ED] dark:border-[#26334D] text-xs">
          <div className="text-[11px] text-[#6B7684] dark:text-[#8A94A6]">
            {filteredCount !== undefined ? (
              <>
                Menampilkan <strong className="text-[#1B2436] dark:text-[#E8ECF3]">{filteredCount}</strong> data yang sesuai kriteria filter
              </>
            ) : (
              <span>Filter sedang aktif</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2B5FC7] hover:text-[#1D4FB8] dark:text-[#60A5FA] dark:hover:text-[#93C5FD] transition-colors"
          >
            <IconRefresh size={12} />
            <span>Reset Filter</span>
          </button>
        </div>
      )}
    </div>
  );
}
