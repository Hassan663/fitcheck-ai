import { useId, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  hideLabel?: boolean;
  className?: string;
}

export function Slider({ label, value, min, max, step = 1, onChange, format, hideLabel, className }: SliderProps) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn("w-full", className)}>
      <div className={cn("mb-1.5 flex items-center justify-between text-xs", hideLabel && "sr-only")}>
        <label htmlFor={id} className="font-medium text-muted">
          {label}
        </label>
        <span className="tabular-nums text-subtle">{format ? format(value) : value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range"
        style={{ "--fill": `${fill}%` } as CSSProperties}
        aria-valuetext={format ? format(value) : undefined}
      />
    </div>
  );
}
