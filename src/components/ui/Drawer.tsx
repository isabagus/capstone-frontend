"use client";

import type { ReactNode } from "react";
import { IconX } from "@/components/icons/Icons";
import { cx, iconBtn } from "./styles";
import { useOverlay } from "./useOverlay";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: "md" | "lg";
  id?: string;
}

/** Panel samping kanan (full-width di mobile) untuk detail item */
export default function Drawer({ open, onClose, title, subtitle, children, footer, width = "md", id }: DrawerProps) {
  const ref = useOverlay(open, onClose);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm ps-fade-in" onClick={onClose} aria-hidden />
      <aside
        ref={ref}
        id={id}
        className={cx(
          "relative h-full w-full bg-white dark:bg-[#16223A] border-l border-[#E2E6ED] dark:border-[#26334D] shadow-2xl flex flex-col ps-slide-left",
          width === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg"
        )}
      >
        <div className="flex items-start justify-between gap-3 px-5 h-16 flex-shrink-0 border-b border-[#E2E6ED] dark:border-[#26334D] items-center">
          <div className="min-w-0">
            <h2 id={id ? `${id}-title` : undefined} className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3] truncate">
              {title}
            </h2>
            {subtitle && <div className="text-xs text-[#6B7684] dark:text-[#8A94A6] truncate">{subtitle}</div>}
          </div>
          <button type="button" onClick={onClose} className={cx(iconBtn, "-mr-2")} aria-label="Tutup panel">
            <IconX size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-[#E2E6ED] dark:border-[#26334D] flex flex-wrap gap-2 justify-end safe-bottom">
            {footer}
          </div>
        )}
      </aside>
    </div>
  );
}
