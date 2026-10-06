// Kumpulan class Tailwind yang dipakai ulang agar gaya konsisten dengan
// tema "Tech Cobalt" yang sudah ada (lihat globals.css).

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export const card =
  "rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors";

export const textPrimary = "text-[#1B2436] dark:text-[#E8ECF3]";
export const textMuted = "text-[#6B7684] dark:text-[#8A94A6]";
export const borderBase = "border-[#E2E6ED] dark:border-[#26334D]";
export const surfaceMuted = "bg-[#F4F6FA] dark:bg-[#1B2A44]";

const btnBase =
  "inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 rounded-lg text-xs font-medium transition-colors active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

export const btn = {
  primary: `${btnBase} bg-[#2B5FC7] hover:bg-[#1D4FB8] dark:bg-[#3B6FE0] dark:hover:bg-[#2B5FC7] text-white shadow-sm`,
  outline: `${btnBase} border border-[#2B5FC7] text-[#2B5FC7] hover:bg-[#2B5FC7]/10 dark:border-[#3B6FE0] dark:text-[#93B4F5] dark:hover:bg-[#3B6FE0]/15`,
  ghost: `${btnBase} border border-[#E2E6ED] dark:border-[#26334D] bg-white dark:bg-[#16223A] text-[#1B2436] dark:text-[#E8ECF3] hover:bg-[#F4F6FA] dark:hover:bg-[#1B2A44]`,
  danger: `${btnBase} bg-[#B91C1C] hover:bg-[#991B1B] text-white shadow-sm dark:bg-[#DC2626] dark:hover:bg-[#B91C1C]`,
};

/** Tombol ikon persegi 40×40 (target sentuh minimal) */
export const iconBtn =
  "inline-flex items-center justify-center h-10 w-10 rounded-lg text-[#6B7684] hover:text-[#1B2436] hover:bg-[#F4F6FA] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3] dark:hover:bg-[#1B2A44] transition-colors disabled:opacity-40 disabled:pointer-events-none";

export const inputBase =
  "w-full min-h-[40px] px-3 rounded-lg text-xs bg-white dark:bg-[#0F1B2D] border border-[#E2E6ED] dark:border-[#26334D] text-[#1B2436] dark:text-[#E8ECF3] placeholder:text-[#8A94A6] focus:outline-none focus:border-[#2B5FC7] dark:focus:border-[#3B6FE0] focus:ring-2 focus:ring-[#2B5FC7]/20 transition-colors disabled:opacity-60";

export const inputError = "border-[#DC2626] dark:border-[#F87171] focus:border-[#DC2626] focus:ring-[#DC2626]/20";
