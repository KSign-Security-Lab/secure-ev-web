// components/Common/Modal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { XIcon } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    // Making this asynchronous to avoid "setState in effect" warnings and cascading renders
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (open) {
      timeout = setTimeout(() => setVisible(true), 10);
    } else {
      // Use short timeout to avoid synchronous setState in effect
      timeout = setTimeout(() => setVisible(false), 0);
    }
    return () => clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!mounted) return null;

  // Don't render anything if not open and animation finished (simplification: just relying on open for now or keep existing behavior?)
  // Existing behavior: relies on CSS classes for visibility. But if we want to Portal, we usually only render when open.
  // BUT the existing code rendered the div always but changed opacity.
  // To keep animation, we should render if (open || visible).
  // But simplisticly, let's render if open or visible.

  if (!open && !visible) return null;

  const modalContent = (
    <div
      className={clsx(
        "fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out",
        visible ? "opacity-100" : "opacity-0"
      )}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "relative w-full sm:w-[95%] md:w-[90%] lg:max-w-[1200px] bg-base-900 text-white rounded-md shadow-lg p-6 space-y-6 transition-all duration-300 ease-out transform-gpu max-h-[90vh] overflow-y-auto m-6",
          visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-12 scale-95",
          className
        )}
      >
        <div className="flex justify-between items-center border-b border-neutral-500 pb-6">
          <div className="text-lg font-semibold">{title}</div>
          <button onClick={onClose} className="text-xl">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="gap-4 flex flex-col">{children}</div>

        {footer && <div className="flex justify-end space-x-2">{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
