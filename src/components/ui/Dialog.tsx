import { useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useFocusTrap, useScrollLock } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/utils";

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  hideHeader?: boolean;
}

function Panel({
  onClose,
  title,
  description,
  children,
  footer,
  className,
  hideHeader,
  side,
}: Omit<OverlayProps, "open"> & { side: "center" | "right" }) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  useFocusTrap(ref, true, onClose);
  useScrollLock(true);

  const panelMotion =
    side === "center"
      ? { initial: { opacity: 0, scale: 0.97, y: 8 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.98, y: 4 } }
      : { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } };

  return (
    <div className={cn("fixed inset-0 z-50 flex", side === "center" ? "items-end justify-center sm:items-center sm:p-6" : "justify-end")}>
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        {...panelMotion}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative flex max-h-[100dvh] w-full flex-col overflow-hidden border border-line bg-elevated shadow-pop focus:outline-none",
          side === "center" ? "max-h-[92dvh] rounded-t-xl sm:max-w-lg sm:rounded-xl" : "h-full max-w-md",
          className,
        )}
      >
        <div className={cn("flex items-start justify-between gap-4 p-5", hideHeader && "sr-only")}>
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-sm text-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-1 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-muted transition-colors hover:bg-fg/[0.06] hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children && <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>}
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-line bg-fg/[0.02] px-5 py-4 sm:flex-row sm:justify-end">{footer}</div>
        )}
      </motion.div>
    </div>
  );
}

export function Dialog({ open, ...props }: OverlayProps) {
  return createPortal(<AnimatePresence>{open && <Panel side="center" {...props} />}</AnimatePresence>, document.body);
}

export function Drawer({ open, ...props }: OverlayProps) {
  return createPortal(<AnimatePresence>{open && <Panel side="right" {...props} />}</AnimatePresence>, document.body);
}
