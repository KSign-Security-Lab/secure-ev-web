"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { AlertTriangle, XIcon } from "lucide-react";
import { useI18n } from "~/i18n/I18nProvider";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  /** Rendered in a sticky footer bar that stays visible while the body scrolls. */
  footer?: React.ReactNode;
  /** Content rendered between the header and the scrolling body (e.g. tabs). */
  subHeader?: React.ReactNode;
  className?: string;
  /** Extra classes for the scrolling body (e.g. a fixed height). */
  bodyClassName?: string;
  hideHeader?: boolean;
  disableDefaultStyles?: boolean;
  /**
   * When true, ESC / backdrop / X ask "close without saving?" before closing.
   */
  confirmOnClose?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  subHeader,
  className,
  bodyClassName,
  hideHeader = false,
  disableDefaultStyles = false,
  confirmOnClose = false,
}) => {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(open);
  const [confirming, setConfirming] = useState(false);
  const mouseDownTarget = useRef<EventTarget | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(open);
      if (!open) setConfirming(false);
    }, open ? 10 : 0);
    return () => clearTimeout(timeout);
  }, [open]);

  const requestClose = useCallback(() => {
    if (confirmOnClose) setConfirming(true);
    else onClose();
  }, [confirmOnClose, onClose]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (confirming) setConfirming(false);
      else requestClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, confirming, requestClose]);

  if (!mounted) return null;
  if (!open && !visible) return null;

  const pad = !disableDefaultStyles;

  const modalContent = (
    <div
      className={clsx(
        "fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-out",
        visible ? "opacity-100" : "opacity-0"
      )}
      onMouseDown={(e) => {
        mouseDownTarget.current = e.target;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && mouseDownTarget.current === e.currentTarget) {
          requestClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className={clsx(
          "relative flex w-full flex-col overflow-hidden sm:w-[95%] md:w-[90%] lg:max-w-[1200px] bg-white text-neutral-900 rounded-lg border border-neutral-200 shadow-lg transition-all duration-300 ease-out transform-gpu",
          pad && "max-h-[90vh] m-6",
          visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-12 scale-95",
          className
        )}
      >
        {!hideHeader && (
          <div
            className={clsx(
              "flex shrink-0 items-center justify-between gap-4 border-b border-neutral-200",
              pad && "px-6 py-4"
            )}
          >
            <div className="min-w-0 truncate text-lg font-semibold text-neutral-950">{title}</div>
            <button
              type="button"
              onClick={requestClose}
              aria-label={t("common.close")}
              className="shrink-0 rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {subHeader && <div className={clsx("shrink-0", pad && "px-6")}>{subHeader}</div>}

        <div
          className={clsx(
            // flex: 0 1 auto — respects an explicit height (bodyClassName)
            // yet still shrinks under the panel's max-height.
            "flex min-h-0 shrink flex-col overflow-y-auto",
            pad && "gap-4 px-6 py-5",
            bodyClassName
          )}
        >
          {children}
        </div>

        {footer && (
          <div
            className={clsx(
              "sticky bottom-0 flex shrink-0 items-center justify-end gap-2 border-t border-neutral-200 bg-white",
              pad && "px-6 py-3"
            )}
          >
            {footer}
          </div>
        )}

        {confirming && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <div
              role="alertdialog"
              aria-labelledby="modal-discard-title"
              className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-5 shadow-xl"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-full bg-amber-50 p-2 text-amber-700">
                  <AlertTriangle className="h-5 w-5" aria-hidden />
                </div>
                <h2 id="modal-discard-title" className="text-base font-semibold text-neutral-950">
                  {t("common.discardChanges.title")}
                </h2>
              </div>
              <p className="mb-5 text-sm text-neutral-600">{t("common.discardChanges.description")}</p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setConfirming(false)}
                  className="h-9 rounded-md border border-neutral-200 px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  {t("common.discardChanges.keepEditing")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(false);
                    onClose();
                  }}
                  className="h-9 rounded-md bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-700"
                >
                  {t("common.discardChanges.confirm")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
