import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-lg border border-dashed border-line-strong px-6 py-14 text-center", className)}>
      <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-line bg-surface text-muted shadow-card">
        <div className="absolute inset-0 -z-10 scale-150 rounded-full glow-accent" aria-hidden="true" />
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
