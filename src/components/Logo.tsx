import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7 shrink-0", className)} aria-hidden="true">
      <defs>
        <linearGradient id="fc-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgb(var(--accent))" />
          <stop offset="1" stopColor="rgb(var(--highlight))" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#fc-logo)" />
      <path d="M11 8c1.6 2.2 8.4 2.2 10 0l5 2.6-1.6 5-2.4-1V24H10v-9.4l-2.4 1L6 10.6Z" fill="#fff" />
    </svg>
  );
}

export function Logo({ className, collapsed }: { className?: string; collapsed?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {!collapsed && (
        <span className="text-[15px] font-semibold tracking-tight">
          FitCheck<span className="text-muted"> AI</span>
        </span>
      )}
    </span>
  );
}
