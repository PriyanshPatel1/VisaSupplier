"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

// ── Types ─────────────────────────────────────────────────────────────────────

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  title: string;
  message?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastCtx = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const icons: Record<ToastVariant, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.645-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

const styles: Record<ToastVariant, { bar: string; icon: string; bg: string }> =
  {
    success: {
      bar: "bg-emerald-500",
      icon: "text-emerald-500",
      bg: "bg-white",
    },
    error: { bar: "bg-red-500", icon: "text-red-500", bg: "bg-white" },
    warning: { bar: "bg-amber-500", icon: "text-amber-500", bg: "bg-white" },
    info: { bar: "bg-blue-500", icon: "text-blue-500", bg: "bg-white" },
  };

// ── Single Toast Item ─────────────────────────────────────────────────────────

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration ?? 4500;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const step = 100 / (duration / 50);
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p <= 0) {
          clearInterval(intervalRef.current!);
          onDismiss();
          return 0;
        }
        return p - step;
      });
    }, 50);
    return () => clearInterval(intervalRef.current!);
  }, [duration, onDismiss]);

  const s = styles[toast.variant];

  return (
    <div
      className={[
        "relative flex items-start gap-3 w-80 rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-4",
        s.bg,
      ].join(" ")}
      style={{ animation: "toastIn 0.25s ease-out" }}
    >
      {/* Progress bar */}
      <div
        className={[
          "absolute bottom-0 left-0 h-0.5 transition-all",
          s.bar,
        ].join(" ")}
        style={{ width: `${progress}%` }}
      />

      {/* Icon */}
      <span className={["flex-shrink-0 mt-0.5", s.icon].join(" ")}>
        {icons[toast.variant]}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 leading-tight">
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={onDismiss}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [{ ...opts, id }, ...prev].slice(0, 5));
  }, []);

  const success = useCallback(
    (title: string, message?: string) =>
      toast({ variant: "success", title, message }),
    [toast],
  );
  const error = useCallback(
    (title: string, message?: string) =>
      toast({ variant: "error", title, message }),
    [toast],
  );
  const warning = useCallback(
    (title: string, message?: string) =>
      toast({ variant: "warning", title, message }),
    [toast],
  );
  const info = useCallback(
    (title: string, message?: string) =>
      toast({ variant: "info", title, message }),
    [toast],
  );

  return (
    <ToastCtx.Provider
      value={{ toast, dismiss, success, error, warning, info }}
    >
      {children}
      {typeof window !== "undefined" &&
        createPortal(
          <div className="fixed bottom-6 right-6 z-9999 flex flex-col gap-3 pointer-events-none">
            <style>{`
              @keyframes toastIn {
                from { opacity:0; transform: translateX(24px) scale(0.96); }
                to   { opacity:1; transform: translateX(0)    scale(1); }
              }
            `}</style>
            {toasts.map((t) => (
              <div key={t.id} className="pointer-events-auto">
                <ToastItem toast={t} onDismiss={() => dismiss(t.id)} />
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastCtx.Provider>
  );
}

export default ToastProvider;
