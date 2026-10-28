import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "outline";
export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

const base =
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-fg shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_1px_2px_rgb(0_0_0/0.2)] hover:bg-accent/90",
  secondary: "bg-fg text-bg hover:bg-fg/90",
  outline: "border border-line-strong bg-surface text-fg hover:bg-fg/[0.04] hover:border-fg/20",
  ghost: "text-muted hover:bg-fg/[0.06] hover:text-fg",
  destructive: "bg-danger text-white hover:bg-danger/90",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 rounded-sm px-3 text-sm",
  md: "h-10 rounded-md px-4 text-sm",
  lg: "h-12 rounded-md px-6 text-base",
  icon: "h-10 w-10 rounded-md",
  "icon-sm": "h-8 w-8 rounded-sm",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}
