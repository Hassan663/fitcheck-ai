import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabItem<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}

/** Underline tabs with roving focus and an animated indicator. */
export function Tabs<T extends string>({ items, value, onChange, label, className }: TabsProps<T>) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent, i: number) => {
    const enabled = items.map((t, idx) => (t.disabled ? -1 : idx)).filter((x) => x >= 0);
    const pos = enabled.indexOf(i);
    let next = -1;
    if (e.key === "ArrowRight") next = enabled[(pos + 1) % enabled.length];
    if (e.key === "ArrowLeft") next = enabled[(pos - 1 + enabled.length) % enabled.length];
    if (e.key === "Home") next = enabled[0];
    if (e.key === "End") next = enabled[enabled.length - 1];
    if (next >= 0) {
      e.preventDefault();
      refs.current[next]?.focus();
      onChange(items[next].value);
    }
  };

  return (
    <div role="tablist" aria-label={label} className={cn("flex items-center gap-1 border-b border-line", className)}>
      {items.map((t, i) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            disabled={t.disabled}
            onClick={() => onChange(t.value)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              "relative -mb-px inline-flex h-10 items-center gap-2 px-3 text-sm font-medium transition-colors disabled:opacity-40",
              active ? "text-fg" : "text-muted hover:text-fg",
            )}
          >
            {t.icon}
            {t.label}
            {active && (
              <motion.span
                layoutId={`${id}-tab`}
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-fg"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
