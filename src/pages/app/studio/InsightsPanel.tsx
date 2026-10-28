import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { GarmentArt } from "@/components/Svg";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tooltip } from "@/components/ui/Tooltip";
import type { Garment } from "@/lib/catalog";
import { SIZES, type Scores, type Size } from "@/lib/scoring";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface Props {
  garment: Garment | null;
  loading: boolean;
  scores: Scores | null;
  size: Size;
  pairs: Garment[];
  onPick: (g: Garment) => void;
}

function Bar({ label, value, delay }: { label: string; value: number; delay: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-medium tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-fg/10" role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent to-highlight"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, delay, ease: EASE }}
        />
      </div>
    </div>
  );
}

export function InsightsPanel({ garment, loading, scores, size, pairs, onPick }: Props) {
  const verdict = scores ? (scores.fit >= 90 ? { t: "Excellent fit", tone: "success" as const } : scores.fit >= 82 ? { t: "Great fit", tone: "accent" as const } : { t: "Good fit", tone: "neutral" as const }) : null;
  return (
    <section aria-labelledby="insights-heading" className="rounded-lg border border-line bg-surface p-4 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 id="insights-heading" className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" /> AI insights
        </h2>
        {verdict && !loading && (
          <Badge tone={verdict.tone} dot>
            {verdict.t}
          </Badge>
        )}
      </div>
      {!garment ? (
        <EmptyState icon={<Sparkles className="h-5 w-5" />} title="No look yet" description="Try on a garment to see fit, color and size guidance." className="border-0 py-8" />
      ) : loading || !scores ? (
        <div className="space-y-5" aria-label="Analysing look" role="status">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-8" />
              </div>
              <Skeleton className="h-1.5 w-full" />
            </div>
          ))}
          <Skeleton className="h-9 w-full" />
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        </div>
      ) : (
        <div key={garment.id} className="space-y-5">
          <Bar label="Fit score" value={scores.fit} delay={0} />
          <Bar label="Color harmony" value={scores.color} delay={0.08} />
          <Bar label="Occasion match" value={scores.occasion} delay={0.16} />
          <div>
            <p className="mb-2 text-sm text-muted">Recommended size</p>
            <div className="grid grid-cols-5 gap-1.5" role="list">
              {SIZES.map((s) => (
                <span
                  role="listitem"
                  key={s}
                  aria-current={s === size ? "true" : undefined}
                  className={cn(
                    "inline-flex h-9 items-center justify-center rounded-sm border text-sm font-medium transition-colors",
                    s === size ? "border-accent bg-accent/10 text-accent" : "border-line text-subtle",
                  )}
                >
                  {s}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-subtle">Based on body proportions and this garment's {garment.cut === "kurta" ? "relaxed" : "regular"} cut.</p>
          </div>
          {pairs.length > 0 && (
            <div>
              <p className="mb-2 text-sm text-muted">Pairs well with</p>
              <div className="grid grid-cols-4 gap-2">
                {pairs.map((p) => (
                  <Tooltip key={p.id} content={p.name}>
                    <button
                      type="button"
                      onClick={() => onPick(p)}
                      aria-label={`Try on ${p.name}`}
                      className="aspect-square w-full rounded-sm border border-line bg-fg/[0.03] p-1.5 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-line-strong"
                    >
                      <GarmentArt garment={p} className="h-full w-full" />
                    </button>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
