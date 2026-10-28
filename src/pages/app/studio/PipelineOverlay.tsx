import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { PIPELINE_STEPS } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/** Simulated AI pipeline. Owns its own animation frame loop so the studio doesn't re-render per frame. */
export function PipelineOverlay({ duration = 3000, onDone, label }: { duration?: number; onDone: () => void; label: string }) {
  const [progress, setProgress] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else done.current();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  const step = Math.min(PIPELINE_STEPS.length - 1, Math.floor(progress * PIPELINE_STEPS.length));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      className="absolute inset-0 z-20 overflow-hidden"
      role="status"
      aria-live="polite"
      aria-label={`Rendering ${label}: ${PIPELINE_STEPS[step].label}`}
    >
      <div className="absolute inset-0 bg-bg/30 backdrop-blur-[3px]" />
      <div className="absolute inset-0 grid-bg opacity-60 [mask-image:none]" />
      <div className="absolute inset-x-0 h-28 animate-scan bg-gradient-to-b from-transparent via-accent/30 to-transparent">
        <div className="absolute inset-x-0 top-1/2 h-px bg-accent shadow-[0_0_16px_2px_rgb(var(--accent))]" />
      </div>
      <div className="absolute inset-x-3 bottom-3 rounded-md border border-line bg-elevated/90 p-4 shadow-pop backdrop-blur-xl sm:inset-x-auto sm:left-1/2 sm:w-[340px] sm:-translate-x-1/2">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="font-medium">Rendering look</span>
          <span className="tabular-nums text-muted">{Math.round(progress * 100)}%</span>
        </div>
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-fg/10">
          <div className="h-full rounded-full bg-gradient-to-r from-accent to-highlight" style={{ width: `${progress * 100}%` }} />
        </div>
        <ol className="space-y-2">
          {PIPELINE_STEPS.map((s, i) => (
            <li key={s.label} className={cn("flex items-start gap-2.5 text-xs transition-opacity", i > step && "opacity-40")}>
              <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                {i < step ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : i === step ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-fg/30" />
                )}
              </span>
              <span className="min-w-0">
                <span className={cn("block font-medium", i === step ? "text-fg" : "text-muted")}>{s.label}</span>
                {i === step && <span className="block text-subtle">{s.detail}</span>}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </motion.div>
  );
}
