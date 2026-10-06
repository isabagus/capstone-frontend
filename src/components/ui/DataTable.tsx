"use client";

import { useMemo, useState, type ReactNode } from "react";
import { IconChevron, IconSearch, IconSort, IconRefresh } from "@/components/icons/Icons";
import { btn, cx, iconBtn, inputBase } from "./styles";

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** Function or property to render cell */
  render?: (row: T, index: number) => ReactNode;
  /** Sort accessor */
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  className?: string;
  headerClassName?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[] | undefined;
  keyExtractor: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  searchPlaceholder?: string;
  searchFilter?: (row: T, query: string) => boolean;
  defaultSort?: { key: string; direction: "asc" | "desc" };
  pageSize?: number;
  emptyTitle?: string;
  emptySubtitle?: string;
  emptyAction?: ReactNode;
  headerSlot?: ReactNode;
  actionsSlot?: ReactNode;
  id?: string;
  onRowClick?: (row: T) => void;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  error = null,
  onRetry,
  searchPlaceholder = "Cari data...",
  searchFilter,
  defaultSort,
  pageSize = 10,
  emptyTitle = "Tidak ada data ditemukan",
  emptySubtitle = "Coba ubah kata kunci pencarian atau filter yang aktif.",
  emptyAction,
  headerSlot,
  actionsSlot,
  id,
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | undefined>(defaultSort?.key);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSort?.direction || "asc");

  // Filtering
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!search.trim() || !searchFilter) return data;
    const q = search.trim().toLowerCase();
    return data.filter((row) => searchFilter(row, q));
  }, [data, search, searchFilter]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const col = columns.find((c) => c.key === sortKey);
    if (!col || !col.sortable) return filteredData;

    return [...filteredData].sort((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";

      if (col.sortValue) {
        valA = col.sortValue(a);
        valB = col.sortValue(b);
      } else {
        const rawA = (a as Record<string, unknown>)[sortKey];
        const rawB = (b as Record<string, unknown>)[sortKey];
        valA = typeof rawA === "number" || typeof rawA === "string" ? rawA : "";
        valB = typeof rawB === "number" || typeof rawB === "string" ? rawB : "";
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      return sortDir === "asc"
        ? String(valA).localeCompare(String(valB), "id")
        : String(valB).localeCompare(String(valA), "id");
    });
  }, [filteredData, sortKey, sortDir, columns]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (colKey: string) => {
    if (sortKey === colKey) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortKey(undefined);
        setSortDir("asc");
      }
    } else {
      setSortKey(colKey);
      setSortDir("asc");
    }
  };

  return (
    <div className="rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-colors" id={id}>
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-[#E2E6ED] dark:border-[#26334D] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
          {searchFilter && (
            <div className="relative max-w-sm w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B7684] dark:text-[#8A94A6]">
                <IconSearch size={15} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
                className={cx(inputBase, "pl-9")}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-[#8A94A6] hover:text-[#1B2436] dark:hover:text-[#E8ECF3]"
                >
                  ✕
                </button>
              )}
            </div>
          )}
          {headerSlot}
        </div>

        {actionsSlot && <div className="flex items-center gap-2 flex-shrink-0">{actionsSlot}</div>}
      </div>

      {/* Table Responsive Container */}
      <div className="overflow-x-auto min-h-[300px] relative">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F4F6FA] dark:bg-[#1B2A44] border-b border-[#E2E6ED] dark:border-[#26334D] text-[#6B7684] dark:text-[#8A94A6] font-semibold">
              {columns.map((col) => {
                const alignClass =
                  col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left";
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={cx("py-3 px-4 select-none whitespace-nowrap", alignClass, col.headerClassName)}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.key)}
                        className={cx(
                          "inline-flex items-center gap-1 font-semibold hover:text-[#1B2436] dark:hover:text-[#E8ECF3] transition-colors",
                          alignClass === "text-right" ? "ml-auto" : ""
                        )}
                      >
                        <span>{col.header}</span>
                        <span className="text-[#8A94A6]">
                          {sortKey === col.key ? (
                            sortDir === "asc" ? (
                              <IconChevron direction="up" size={13} className="text-[#2B5FC7] dark:text-[#3B6FE0]" />
                            ) : (
                              <IconChevron direction="down" size={13} className="text-[#2B5FC7] dark:text-[#3B6FE0]" />
                            )
                          ) : (
                            <IconSort size={12} />
                          )}
                        </span>
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E2E6ED] dark:divide-[#26334D] text-[#1B2436] dark:text-[#E8ECF3]">
            {loading ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`skel-${rIdx}`}>
                  {columns.map((col, cIdx) => (
                    <td key={`skel-c-${cIdx}`} className="py-3.5 px-4">
                      <div
                        className="ps-skeleton h-4 w-full"
                        style={{ maxWidth: `${Math.max(40, 100 - (cIdx * 15) % 60)}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              // Error State
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <div className="w-10 h-10 rounded-full bg-[#FEF2F2] dark:bg-[#7F1D1D]/30 text-[#991B1B] dark:text-[#F87171] flex items-center justify-center font-bold">
                      !
                    </div>
                    <div className="font-semibold text-sm text-[#1B2436] dark:text-[#E8ECF3]">
                      Gagal Memuat Data
                    </div>
                    <div className="text-xs text-[#6B7684] dark:text-[#8A94A6]">{error}</div>
                    {onRetry && (
                      <button type="button" onClick={onRetry} className={cx(btn.outline, "mt-2")}>
                        <IconRefresh size={14} />
                        <span>Coba Lagi</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="py-14 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-xl bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] flex items-center justify-center text-[#8A94A6]">
                      📦
                    </div>
                    <div className="font-bold text-sm text-[#1B2436] dark:text-[#E8ECF3]">{emptyTitle}</div>
                    <div className="text-xs text-[#6B7684] dark:text-[#8A94A6] leading-relaxed">
                      {emptySubtitle}
                    </div>
                    {emptyAction && <div className="mt-3">{emptyAction}</div>}
                  </div>
                </td>
              </tr>
            ) : (
              // Rows
              paginatedData.map((row, idx) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cx(
                    "hover:bg-[#F4F6FA]/70 dark:hover:bg-[#1B2A44]/50 transition-colors",
                    onRowClick ? "cursor-pointer" : ""
                  )}
                >
                  {columns.map((col) => {
                    const alignClass =
                      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left";
                    return (
                      <td key={col.key} className={cx("py-3 px-4", alignClass, col.className)}>
                        {col.render
                          ? col.render(row, (currentPage - 1) * pageSize + idx)
                          : String((row as Record<string, unknown>)[col.key] ?? "-")}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && !error && sortedData.length > 0 && (
        <div className="p-3 sm:px-5 bg-white dark:bg-[#16223A] border-t border-[#E2E6ED] dark:border-[#26334D] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7684] dark:text-[#8A94A6]">
          <div>
            Menampilkan{" "}
            <span className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
              {(currentPage - 1) * pageSize + 1}
            </span>{" "}
            -{" "}
            <span className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">{sortedData.length}</span> data
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className={cx(iconBtn, "h-8 w-8 rounded-md")}
              aria-label="Halaman sebelumnya"
            >
              <IconChevron direction="left" size={14} />
            </button>

            <span className="px-2 font-medium">
              Hal {currentPage} dari {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className={cx(iconBtn, "h-8 w-8 rounded-md")}
              aria-label="Halaman berikutnya"
            >
              <IconChevron direction="right" size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
