import Link from "next/link";
import type { ReactNode } from "react";
import { card, cx } from "./styles";

interface StatCardProps {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  desc?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  /** Jika diisi, kartu menjadi tautan */
  href?: string;
  id?: string;
}

export default function StatCard({ title, value, icon, desc, change, changeType = "neutral", href, id }: StatCardProps) {
  const body = (
    <>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#6B7684] dark:text-[#8A94A6] flex items-center gap-1.5">
          {title}
          {href && (
            <span className="text-[#2B5FC7] dark:text-[#93B4F5] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 transition-all" aria-hidden>
              →
            </span>
          )}
        </span>
        <span className="p-1.5 rounded-lg bg-[#F4F6FA] dark:bg-[#1B2A44] border border-[#E2E6ED] dark:border-[#26334D] flex items-center justify-center">
          {icon}
        </span>
      </div>
      <div className="text-2xl font-bold text-[#1B2436] dark:text-[#E8ECF3] mb-1 tracking-tight">{value}</div>
      <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-[#E2E6ED]/60 dark:border-[#26334D]/60 mt-2">
        <span className="text-[#6B7684] dark:text-[#8A94A6] text-[11px] truncate">{desc}</span>
        {change && (
          <span
            className={cx(
              "text-[11px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap",
              changeType === "positive"
                ? "bg-[#ECFDF5] text-[#065F46] dark:bg-[#064E3B]/30 dark:text-[#34D399]"
                : changeType === "negative"
                  ? "bg-[#FEF2F2] text-[#991B1B] dark:bg-[#7F1D1D]/30 dark:text-[#F87171]"
                  : "bg-[#F4F6FA] text-[#6B7684] dark:bg-[#1B2A44] dark:text-[#8A94A6]"
            )}
          >
            {change}
          </span>
        )}
      </div>
    </>
  );

  const cls = cx(card, "relative block p-4 sm:p-5");

  if (href) {
    return (
      <Link
        id={id}
        href={href}
        className={cx(cls, "group hover:border-[#2B5FC7] dark:hover:border-[#3B6FE0] hover:shadow-md")}
        aria-label={`${title}: lihat detail`}
      >
        {body}
      </Link>
    );
  }
  return (
    <div id={id} className={cls}>
      {body}
    </div>
  );
}
