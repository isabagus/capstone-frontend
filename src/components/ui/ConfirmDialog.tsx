"use client";

import type { ReactNode } from "react";
import { IconAlertCircle, IconAlertTriangle } from "@/components/icons/Icons";
import { btn, cx } from "./styles";
import { useOverlay } from "./useOverlay";
import { Spinner } from "./FormModal";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  pending?: boolean;
  error?: string | null;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  tone = "danger",
  pending,
  error,
}: ConfirmDialogProps) {
  const ref = useOverlay(open, onClose);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm ps-fade-in" onClick={onClose} aria-hidden />
      <div ref={ref} className="relative w-full max-w-sm bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] rounded-xl shadow-xl p-5 ps-pop">
        <div className="flex gap-3">
          <span
            className={cx(
              "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
              tone === "danger"
                ? "bg-[#FEF2F2] text-[#B91C1C] dark:bg-[#7F1D1D]/30 dark:text-[#FCA5A5]"
                : "bg-[#EFF4FE] text-[#2B5FC7] dark:bg-[#3B6FE0]/15 dark:text-[#93B4F5]"
            )}
          >
            <IconAlertTriangle size={18} />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
              {title}
            </h2>
            <div id="confirm-desc" className="text-xs text-[#6B7684] dark:text-[#8A94A6] mt-1 leading-relaxed">
              {message}
            </div>
          </div>
        </div>

        {error && (
          <div role="alert" className="mt-4 flex items-start gap-2 p-3 rounded-lg text-xs bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] dark:bg-[#7F1D1D]/30 dark:text-[#FCA5A5] dark:border-[#991B1B]/60">
            <IconAlertCircle size={16} className="flex-shrink-0 mt-px" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button type="button" className={btn.ghost} onClick={onClose} disabled={pending} data-autofocus>
            {error ? "Tutup" : cancelLabel}
          </button>
          {!error && (
            <button type="button" className={tone === "danger" ? btn.danger : btn.primary} onClick={onConfirm} disabled={pending}>
              {pending && <Spinner />}
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
