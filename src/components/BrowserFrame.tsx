import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrowserFrame({ url, children, className }: { url: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-line-strong bg-surface shadow-[0_32px_80px_-24px_rgb(0_0_0/0.5)]", className)}>
      <div className="flex h-10 items-center gap-3 border-b border-line bg-fg/[0.02] px-4">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-fg/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-fg/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-fg/15" />
        </div>
        <div className="mx-auto flex h-6 min-w-0 max-w-xs flex-1 items-center justify-center gap-1.5 rounded-sm bg-fg/[0.05] px-3 text-xs text-subtle">
          <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{url}</span>
        </div>
        <div className="w-[42px]" aria-hidden="true" />
      </div>
      {children}
    </div>
  );
}
