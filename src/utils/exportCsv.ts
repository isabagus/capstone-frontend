"use client";

/**
 * Mengunduh data tabel dalam bentuk file CSV (UTF-8 dengan BOM agar terbaca rapi di Microsoft Excel).
 */
export function downloadCsvReport(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
) {
  if (typeof window === "undefined") return;
  const escapeCell = (val: string | number) => {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const csvLines = [
    headers.map(escapeCell).join(","),
    ...rows.map((r) => r.map(escapeCell).join(",")),
  ];
  const csvContent = "\uFEFF" + csvLines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

