"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export interface Toast {
  id: number;
  message: string;
  duration?: number;
  type?: "info" | "success" | "error" | "warning";
  className?: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Toast) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");

  const showToast = (
    message: string,
    options?: {
      duration?: number;
      type?: Toast["type"];
      className?: string;
    }
  ) => {
    context.addToast({
      id: Date.now(),
      message,
      ...options,
    });
  };

  return showToast;
};

const typeStyles: Record<NonNullable<Toast["type"]>, string> = {
  info: "bg-blue-500 text-white",
  success: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
  warning: "bg-yellow-500 text-black",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration ?? 3000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-999">
        {toasts.map((toast) => {
          const style =
            toast.className ||
            (toast.type ? typeStyles[toast.type] : "bg-black text-white");

          return (
            <div
              key={toast.id}
              className={`px-4 py-2 rounded shadow-md animate-slide-in ${style}`}
            >
              {toast.message}
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
