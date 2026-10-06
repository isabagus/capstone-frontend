import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Tombol aksi di kanan (bungkus dengan <Can>) */
  actions?: ReactNode;
  eyebrow?: string;
}

export default function PageHeader({ title, subtitle, actions, eyebrow }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-4 border-b border-[#E2E6ED] dark:border-[#26334D]">
      <div className="min-w-0">
        {eyebrow && (
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#2B5FC7] dark:bg-[#3B6FE0]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2B5FC7] dark:text-[#93B4F5]">
              {eyebrow}
            </span>
          </div>
        )}
        <h2 className="text-xl sm:text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs sm:text-sm text-[#6B7684] dark:text-[#8A94A6] mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
