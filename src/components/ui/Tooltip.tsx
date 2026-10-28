import { cloneElement, useId, useState, type ReactElement } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: ReactElement<{ "aria-describedby"?: string }>;
  side?: "top" | "bottom" | "right";
  disabled?: boolean;
}

export function Tooltip({ content, children, side = "top", disabled }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const show = open && !disabled;
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      {cloneElement(children, { "aria-describedby": show ? id : undefined })}
      <span
        role="tooltip"
        id={id}
        className={cn(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-sm border border-line bg-elevated px-2 py-1 text-xs font-medium text-fg shadow-pop transition-[opacity,transform] duration-150",
          side === "top" && "bottom-full left-1/2 mb-2 -translate-x-1/2",
          side === "bottom" && "left-1/2 top-full mt-2 -translate-x-1/2",
          side === "right" && "left-full top-1/2 ml-2 -translate-y-1/2",
          show ? "opacity-100" : "opacity-0",
          show ? "scale-100" : "scale-95",
        )}
        aria-hidden={!show}
      >
        {content}
      </span>
    </span>
  );
}
