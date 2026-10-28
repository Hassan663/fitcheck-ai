import { createContext, useContext, type ReactNode } from "react";

export interface ToastInput {
  title: string;
  description?: string;
  tone?: "success" | "error" | "info";
  duration?: number;
  action?: ReactNode;
}

export const ToastContext = createContext<{ toast: (t: ToastInput) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx.toast;
}
