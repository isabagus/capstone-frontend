"use client";

import type { FormEvent, ReactNode } from "react";
import { IconAlertCircle, IconX } from "@/components/icons/Icons";
import { btn, cx, iconBtn } from "./styles";
import { useOverlay } from "./useOverlay";

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Jika diisi, konten dibungkus <form> dan tombol submit ditampilkan */
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  /** Error dari server/service (ditampilkan di atas footer) */
  error?: string | null;
  size?: "sm" | "md" | "lg";
  footer?: ReactNode;
  icon?: ReactNode;
  id?: string;
}

const SIZE = { sm: "sm:max-w-md", md: "sm:max-w-xl", lg: "sm:max-w-3xl" };

/**
 * Modal generik untuk form. Di mobile tampil sebagai bottom-sheet,
 * di tablet/desktop sebagai dialog di tengah.
 */
export default function FormModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  onSubmit,
  submitLabel = "Simpan",
  cancelLabel = "Batal",
  pending,
  error,
  size = "md",
  footer,
  icon,
  id,
}: FormModalProps) {
  const ref = useOverlay(open, onClose);
  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!pending) onSubmit?.();
  };

  const content = (
    <>
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-[#E2E6ED] dark:border-[#26334D]">
        <div className="flex items-start gap-3 min-w-0">
          {icon && (
            <span className="mt-0.5 p-2 rounded-lg bg-[#EFF4FE] text-[#2B5FC7] dark:bg-[#3B6FE0]/15 dark:text-[#93B4F5] flex-shrink-0">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <h2 id={id ? `${id}-title` : undefined} className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
              {title}
            </h2>
            {subtitle && <p className="text-xs text-[#6B7684] dark:text-[#8A94A6] mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <button type="button" onClick={onClose} className={cx(iconBtn, "-mr-2 -mt-1")} aria-label="Tutup">
          <IconX size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

      {error && (
        <div
          role="alert"
          className="mx-5 mb-3 flex items-start gap-2 p-3 rounded-lg text-xs bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] dark:bg-[#7F1D1D]/30 dark:text-[#FCA5A5] dark:border-[#991B1B]/60"
        >
          <IconAlertCircle size={16} className="flex-shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}

      <div className="px-5 py-3 border-t border-[#E2E6ED] dark:border-[#26334D] flex flex-col-reverse sm:flex-row sm:justify-end gap-2 safe-bottom">
        {footer ?? (
          <>
            <button type="button" onClick={onClose} className={btn.ghost} disabled={pending}>
              {cancelLabel}
            </button>
            {onSubmit && (
              <button type="submit" className={btn.primary} disabled={pending}>
                {pending && <Spinner />}
                {submitLabel}
              </button>
            )}
          </>
        )}
      </div>
    </>
  );

  const panelCls = cx(
    "relative w-full bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] shadow-xl flex flex-col",
    "max-h-[92vh] rounded-t-2xl sm:rounded-xl ps-slide-up",
    SIZE[size]
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm ps-fade-in" onClick={onClose} aria-hidden />
      <div ref={ref} className={panelCls} id={id}>
        {onSubmit ? (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col min-h-0 flex-1">
            {content}
          </form>
        ) : (
          content
        )}
      </div>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cx("animate-spin h-3.5 w-3.5", className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
