"use client";

import type { ReactNode } from "react";
import { IconX } from "@/components/icons/Icons";
import { cx, iconBtn } from "./styles";
import { useOverlay } from "./useOverlay";

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  badge?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  id?: string;
}

const SIZE = { sm: "sm:max-w-md", md: "sm:max-w-[560px]", lg: "sm:max-w-2xl" };

/**
 * Modal pop-up generik untuk menampilkan detail (read-only).
 * - Desktop: dialog 560px di tengah layar
 * - Mobile: hampir penuh layar (bottom-sheet style)
 * - Tutup: klik overlay, tombol X, atau Esc
 * - Focus trap via useOverlay
 */
export default function DetailModal({
  open,
  onClose,
  title,
  subtitle,
  badge,
  icon,
  actions,
  children,
  footer,
  size = "md",
  id,
}: DetailModalProps) {
  const ref = useOverlay(open, onClose);
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      {/* Overlay gelap */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm ps-fade-in"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel Modal */}
      <div
        ref={ref}
        id={id}
        className={cx(
          "relative w-full bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-xl flex flex-col",
          "max-h-[92vh] rounded-t-2xl sm:rounded-xl ps-slide-up",
          SIZE[size]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-[#E2E6ED] dark:border-[#26334D] flex-shrink-0">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {icon && (
              <span className="p-2 rounded-lg bg-[#EFF4FE] dark:bg-[#3B6FE0]/15 text-[#2B5FC7] dark:text-[#93B4F5] flex-shrink-0 mt-0.5">
                {icon}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id={id ? `${id}-title` : undefined}
                  className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]"
                >
                  {title}
                </h2>
                {badge}
              </div>
              {subtitle && (
                <div className="text-xs text-[#6B7684] dark:text-[#8A94A6] mt-0.5">{subtitle}</div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cx(iconBtn, "-mr-2 -mt-1")}
            aria-label="Tutup"
            data-autofocus
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Content (scrollable) */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {/* Footer (optional) */}
        {(footer || actions) && (
          <div className="px-5 py-3 border-t border-[#E2E6ED] dark:border-[#26334D] flex flex-wrap gap-2 justify-end safe-bottom flex-shrink-0">
            {footer || actions}
          </div>
        )}
      </div>
    </div>
  );
}
