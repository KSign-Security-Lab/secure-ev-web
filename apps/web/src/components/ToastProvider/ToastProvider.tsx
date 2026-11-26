"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { X } from "lucide-react";
import { useI18n } from "~/i18n/I18nProvider";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: number;
  message: string;
  duration?: number;
  type?: "info" | "success" | "error" | "warning";
  className?: string;
  action?: ToastAction;
  /** Toasts sharing a key replace each other instead of stacking. */
  key?: string;
}

export type ShowToastOptions = Omit<Toast, "id" | "message">;

interface ToastContextType {
  showToast: (message: string, options?: ShowToastOptions) => number;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

/** Returns a stable `showToast(message, options)` function. */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context.showToast;
};

export const useToastControls = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToastControls must be used within ToastProvider");
  return context;
};

const typeStyles: Record<NonNullable<Toast["type"]>, string> = {
  info: "bg-blue-600 text-white",
  success: "bg-green-600 text-white",
  error: "bg-rose-600 text-white",
  warning: "bg-amber-500 text-black",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, options?: ShowToastOptions) => {
      const id = nextId.current++;
      const toast: Toast = { id, message, ...options };
      setToasts((prev) => [
        ...prev.filter((t) => !toast.key || t.key !== toast.key),
        toast,
      ]);
      const duration = toast.duration ?? 3000;
      if (duration > 0) setTimeout(() => removeToast(id), duration);
      return id;
    },
    [removeToast]
  );

  const [value] = useState(() => ({ showToast, removeToast }));

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-999 flex flex-col items-end gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const style =
            toast.className ||
            (toast.type ? typeStyles[toast.type] : "bg-black text-white");

          return (
            <div
              key={toast.id}
              className={`flex max-w-sm items-center gap-3 rounded px-4 py-2 text-sm shadow-md animate-slide-in ${style}`}
            >
              <span className="min-w-0 flex-1">{toast.message}</span>
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick();
                    removeToast(toast.id);
                  }}
                  className="shrink-0 rounded border border-current/40 px-2 py-0.5 text-xs font-semibold hover:bg-white/15"
                >
                  {toast.action.label}
                </button>
              )}
              {(toast.action || (toast.duration ?? 3000) <= 0) && (
                <button
                  type="button"
                  aria-label={t("common.close")}
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 opacity-70 hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </ToastContext.Provider>
  );
}
