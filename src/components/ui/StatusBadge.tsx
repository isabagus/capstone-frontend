import type { ReactNode } from "react";
import { cx } from "./styles";

export type BadgeTone = "red" | "yellow" | "green" | "blue" | "gray";

// Palet mengikuti badge yang sudah ada di dashboard (light & dark)
const TONE: Record<BadgeTone, string> = {
  red: "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA] dark:bg-[#7F1D1D]/30 dark:text-[#FCA5A5] dark:border-[#991B1B]/60",
  yellow: "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A] dark:bg-[#78350F]/30 dark:text-[#FCD34D] dark:border-[#92400E]/60",
  green: "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0] dark:bg-[#064E3B]/30 dark:text-[#6EE7B7] dark:border-[#065F46]/60",
  blue: "bg-[#EFF4FE] text-[#1E4FB0] border-[#D6E3FC] dark:bg-[#1D4ED8]/25 dark:text-[#93C5FD] dark:border-[#2563EB]/40",
  gray: "bg-[#F4F6FA] text-[#4B5563] border-[#E2E6ED] dark:bg-[#1B2A44] dark:text-[#A3ADBF] dark:border-[#26334D]",
};

const DOT: Record<BadgeTone, string> = {
  red: "bg-[#DC2626] dark:bg-[#F87171]",
  yellow: "bg-[#D97706] dark:bg-[#FBBF24]",
  green: "bg-[#059669] dark:bg-[#34D399]",
  blue: "bg-[#2B5FC7] dark:bg-[#60A5FA]",
  gray: "bg-[#9CA3AF] dark:bg-[#6B7684]",
};

interface StatusBadgeProps {
  tone: BadgeTone;
  children: ReactNode;
  dot?: boolean;
  icon?: ReactNode;
  className?: string;
  title?: string;
}

export default function StatusBadge({ tone, children, dot, icon, className, title }: StatusBadgeProps) {
  return (
    <span
      title={title}
      className={cx(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border whitespace-nowrap",
        TONE[tone],
        className
      )}
    >
      {dot && <span className={cx("w-1.5 h-1.5 rounded-full", DOT[tone])} aria-hidden />}
      {icon}
      {children}
    </span>
  );
}
