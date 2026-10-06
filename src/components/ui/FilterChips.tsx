"use client";

import { cx } from "./styles";

export interface ChipOption<T extends string = string> {
  value: T;
  label: string;
  count?: number;
}

interface FilterChipsProps<T extends string> {
  options: (T | ChipOption<T>)[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  className?: string;
  /** Ukuran sentuh lebih besar (≥40px) untuk halaman operasional */
  size?: "sm" | "md";
  id?: string;
}

/**
 * Chip filter (diekstrak dari filter brand di Dashboard).
 * Ukuran "sm" identik dengan tampilan dashboard sebelumnya.
 */
export default function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
  size = "sm",
  id,
}: FilterChipsProps<T>) {
  const opts: ChipOption<T>[] = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <div
      id={id}
      role="group"
      className={cx(
        "flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {label && (
        <span className="text-xs text-[#6B7684] dark:text-[#8A94A6] mr-1 hidden sm:inline whitespace-nowrap">{label}:</span>
      )}
      {opts.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cx(
              "rounded-lg text-xs font-medium transition-colors flex-shrink-0 inline-flex items-center gap-1.5",
              size === "md" ? "px-3 min-h-[40px]" : "px-2.5 py-1",
              active
                ? "bg-[#2B5FC7] text-white dark:bg-[#3B6FE0]"
                : "bg-[#F4F6FA] text-[#6B7684] hover:text-[#1B2436] border border-[#E2E6ED] dark:bg-[#1B2A44] dark:text-[#8A94A6] dark:hover:text-[#E8ECF3] dark:border-[#26334D]"
            )}
          >
            {o.label}
            {o.count !== undefined && (
              <span
                className={cx(
                  "px-1.5 rounded text-[10px] font-semibold",
                  active ? "bg-white/20" : "bg-white dark:bg-[#16223A]"
                )}
              >
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
