import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { BrowserFrame } from "./BrowserFrame";
import { GarmentArt, ModelArt } from "./Svg";
import { GARMENTS, MODELS } from "@/lib/catalog";
import { scoreFor } from "@/lib/scoring";
import { cn, formatPKR } from "@/lib/utils";
import { EASE } from "@/lib/motion";

const CYCLE = ["g4", "g10", "g7", "g2", "g16", "g13"].map((id) => GARMENTS.find((g) => g.id === id) ?? GARMENTS[0]);
const STAGE = { bgTop: "transparent", bgBottom: "transparent", plain: true };

/** Animated, non-interactive replica of the Try-On Studio for the hero. */
export function StudioMockup() {
  const [i, setI] = useState(0);
  const [modelIdx, setModelIdx] = useState(0);
  const g = CYCLE[i];
  const model = MODELS[modelIdx];
  const s = scoreFor(g, model.id);

  useEffect(() => {
    const t = window.setInterval(() => {
      setI((x) => {
        const next = (x + 1) % CYCLE.length;
        if (next === 0) setModelIdx((m) => (m + 1) % MODELS.length);
        return next;
      });
    }, 2800);
    return () => window.clearInterval(t);
  }, []);

  return (
    <BrowserFrame url="app.fitcheck.ai/studio">
      <div className="grid grid-cols-1 sm:grid-cols-[132px_1fr_200px] md:grid-cols-[156px_1fr_232px]" aria-hidden="true">
        {/* Subjects */}
        <div className="hidden space-y-2 border-r border-line p-3 sm:block">
          <p className="px-1 text-[10px] font-medium uppercase tracking-wider text-subtle">Subject</p>
          {MODELS.map((m, idx) => (
            <div
              key={m.id}
              className={cn(
                "flex items-center gap-2 rounded-sm border p-1.5 transition-colors duration-300",
                idx === modelIdx ? "border-accent/50 bg-accent/10" : "border-transparent",
              )}
            >
              <div className="h-9 w-7 overflow-hidden rounded-[4px] stage-bg">
                <ModelArt model={m} garment={null} options={STAGE} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{m.name}</p>
                <p className="truncate text-[10px] text-subtle">{m.meta}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stage */}
        <div className="relative aspect-[4/5] overflow-hidden stage-bg sm:aspect-auto sm:h-[400px] md:h-[440px]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={`${model.id}-${g.id}`}
              className="absolute inset-0 p-6"
              initial={{ opacity: 0, filter: "blur(8px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <ModelArt model={model} garment={g} options={STAGE} className="h-full" />
            </motion.div>
          </AnimatePresence>
          <motion.div
            key={`scan-${i}-${modelIdx}`}
            className="pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-accent/25 to-transparent"
            initial={{ top: "-25%" }}
            animate={{ top: "110%" }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
          />
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
            <Sparkles className="h-3 w-3 text-accent" />
            Rendered in 2.4s
          </div>
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-md border border-line bg-surface/85 p-2.5 backdrop-blur sm:hidden">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">{g.name}</p>
              <p className="text-[11px] text-subtle">{formatPKR(g.price)}</p>
            </div>
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">Fit {s.fit}%</span>
          </div>
        </div>

        {/* Catalog + insights */}
        <div className="hidden flex-col gap-3 border-l border-line p-3 sm:flex">
          <p className="px-1 text-[10px] font-medium uppercase tracking-wider text-subtle">Catalog</p>
          <div className="grid grid-cols-3 gap-1.5">
            {CYCLE.map((x, idx) => (
              <div
                key={x.id}
                className={cn(
                  "aspect-square rounded-sm border bg-fg/[0.03] p-1.5 transition-colors duration-300",
                  idx === i ? "border-accent ring-2 ring-accent/30" : "border-line",
                )}
              >
                <GarmentArt garment={x} className="h-full" />
              </div>
            ))}
          </div>
          <div className="mt-auto space-y-2.5 rounded-md border border-line bg-fg/[0.02] p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-subtle">AI insights</p>
            {[
              ["Fit score", s.fit],
              ["Color harmony", s.color],
              ["Occasion", s.occasion],
            ].map(([label, v]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="text-muted">{label}</span>
                  <span className="tabular-nums font-medium">{v}%</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-fg/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-highlight"
                    animate={{ width: `${v}%` }}
                    transition={{ duration: 0.8, ease: EASE }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}
