import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  trailing?: ReactNode;
}

export const fieldClasses =
  "h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-sm text-fg placeholder:text-subtle transition-[border-color,box-shadow] hover:border-fg/20 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15 disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, icon, trailing, ...props }, ref) {
  return (
    <div className="relative w-full">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle [&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">
          {icon}
        </span>
      )}
      <input ref={ref} className={cn(fieldClasses, icon && "pl-9", trailing && "pr-10", className)} {...props} />
      {trailing && <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</span>}
    </div>
  );
});

export function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-subtle">{hint}</p>}
    </div>
  );
}
