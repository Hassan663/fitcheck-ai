import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  danger?: boolean;
  hint?: string;
  separator?: boolean;
}

interface DropdownMenuProps {
  trigger: (props: { open: boolean; toggle: () => void; id: string; "aria-expanded": boolean; "aria-haspopup": "menu"; "aria-controls": string }) => ReactNode;
  items: MenuItem[];
  header?: ReactNode;
  align?: "start" | "end";
  className?: string;
}

export function DropdownMenu({ trigger, items, header, align = "end", className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        root.current?.querySelector<HTMLElement>("[aria-haspopup]")?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => menu.current?.querySelector<HTMLElement>("[role=menuitem]:not([disabled])")?.focus());
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onMenuKey = (e: React.KeyboardEvent) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const els = Array.from(menu.current?.querySelectorAll<HTMLElement>("[role=menuitem]:not([disabled])") ?? []);
    const i = els.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === "Home" ? 0 : e.key === "End" ? els.length - 1 : (i + (e.key === "ArrowDown" ? 1 : -1) + els.length) % els.length;
    els[next]?.focus();
  };

  return (
    <div ref={root} className={cn("relative", className)}>
      {trigger({
        open,
        toggle: () => setOpen((o) => !o),
        id: `${id}-trigger`,
        "aria-expanded": open,
        "aria-haspopup": "menu",
        "aria-controls": `${id}-menu`,
      })}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menu}
            id={`${id}-menu`}
            role="menu"
            aria-labelledby={`${id}-trigger`}
            onKeyDown={onMenuKey}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className={cn(
              "absolute top-full z-50 mt-2 min-w-[220px] origin-top rounded-md border border-line bg-elevated p-1 shadow-pop",
              align === "end" ? "right-0" : "left-0",
            )}
          >
            {header && <div className="border-b border-line px-2.5 pb-2 pt-1.5">{header}</div>}
            {items.map((item, i) =>
              item.separator ? (
                <div key={`sep-${i}`} className="my-1 h-px bg-line" role="separator" />
              ) : (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false);
                    item.onSelect?.();
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-sm outline-none transition-colors focus:bg-fg/[0.06] disabled:opacity-40 [&>svg]:h-4 [&>svg]:w-4",
                    item.danger ? "text-danger" : "text-fg hover:bg-fg/[0.06]",
                  )}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {item.hint && <span className="text-xs text-subtle">{item.hint}</span>}
                </button>
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
