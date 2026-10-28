import { useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Columns3, GitCompareArrows, ImageIcon, Plus, X } from "lucide-react";
import { PhotoComposite } from "./PhotoComposite";
import { PipelineOverlay } from "./PipelineOverlay";
import type { OverlayTransform, StudioView } from "./types";
import { ModelArt } from "@/components/Svg";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tabs } from "@/components/ui/Tabs";
import type { Garment, SampleModel } from "@/lib/catalog";
import { scoreFor } from "@/lib/scoring";
import { cn, formatPKR } from "@/lib/utils";

const STAGE_OPTS = { plain: true };

export interface Subject {
  id: string;
  model: SampleModel | null;
  photo: string | null;
}

interface StageProps {
  view: StudioView;
  onViewChange: (v: StudioView) => void;
  subject: Subject;
  garment: Garment | null;
  running: { id: number; garment: Garment } | null;
  onPipelineDone: () => void;
  transform: OverlayTransform;
  onTransform: (t: OverlayTransform) => void;
  smooth: boolean;
  compare: Garment[];
  onRemoveCompare: (id: string) => void;
  onPick: (g: Garment) => void;
}

function SubjectRender({ subject, garment, transform, onTransform, smooth, compact }: {
  compact?: boolean;
  subject: Subject;
  garment: Garment | null;
  transform: OverlayTransform;
  onTransform?: (t: OverlayTransform) => void;
  smooth?: boolean;
}) {
  if (subject.photo) {
    return <PhotoComposite photo={subject.photo} garment={garment} transform={transform} onChange={onTransform} smooth={smooth} />;
  }
  if (!subject.model) return null;
  return (
    <div className={cn("h-full w-full", compact ? "p-2" : "p-4 sm:p-8")}>
      <ModelArt model={subject.model} garment={garment} options={STAGE_OPTS} className="h-full w-full" />
    </div>
  );
}

function BeforeAfter({ subject, garment, transform }: { subject: Subject; garment: Garment; transform: OverlayTransform }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative h-full w-full select-none">
      <div className="absolute inset-0">
        <SubjectRender subject={subject} garment={null} transform={transform} />
      </div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <SubjectRender subject={subject} garment={garment} transform={transform} />
      </div>
      <div className="pointer-events-none absolute inset-y-0 z-10 w-px bg-white shadow-[0_0_12px_rgb(0_0_0/0.4)]" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-zinc-900 shadow-lg">
          <GitCompareArrows className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">Before</span>
      <span className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">After</span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Before and after comparison position"
        className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
        style={{ touchAction: "pan-y" } as CSSProperties}
      />
    </div>
  );
}

function CompareGrid({ subject, compare, transform, onRemove, onPick }: {
  subject: Subject;
  compare: Garment[];
  transform: OverlayTransform;
  onRemove: (id: string) => void;
  onPick: (g: Garment) => void;
}) {
  if (!compare.length) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <EmptyState
          className="w-full max-w-md bg-surface/60 backdrop-blur"
          icon={<Columns3 className="h-5 w-5" />}
          title="Nothing to compare yet"
          description="Press + on up to three garments in the catalog to see them side by side."
        />
      </div>
    );
  }
  const scores = compare.map((g) => scoreFor(g, subject.id).fit);
  const best = scores.indexOf(Math.max(...scores));
  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4">
      <motion.div layout className={cn("grid h-full gap-3", compare.length === 1 ? "grid-cols-1" : compare.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3")}>
        <AnimatePresence mode="popLayout">
          {compare.map((g, i) => (
            <motion.div
              layout
              key={g.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={cn(
                "group relative flex min-h-[260px] flex-col overflow-hidden rounded-md border bg-surface/70",
                i === best && compare.length > 1 ? "border-accent ring-2 ring-accent/30" : "border-line",
              )}
            >
              {i === best && compare.length > 1 && (
                <Badge tone="accent" className="absolute left-2 top-2 z-10 bg-accent text-accent-fg ring-0">
                  Best match
                </Badge>
              )}
              <button
                type="button"
                onClick={() => onRemove(g.id)}
                aria-label={`Remove ${g.name} from compare`}
                className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-100 transition-opacity hover:bg-black/70 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="min-h-0 flex-1">
                <SubjectRender subject={subject} garment={g} transform={transform} compact />
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-line p-2.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium sm:text-sm">{g.name}</p>
                  <p className="text-[11px] text-subtle sm:text-xs">
                    {formatPKR(g.price)} · Fit {scores[i]}%
                  </p>
                </div>
                <Button size="icon-sm" variant="ghost" onClick={() => onPick(g)} aria-label={`Try on ${g.name}`} className="hidden sm:inline-flex">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {compare.length < 3 && compare.length !== 2 && (
          <div className="hidden min-h-[260px] items-center justify-center rounded-md border border-dashed border-line-strong text-center text-xs text-subtle sm:flex">
            <span className="inline-flex flex-col items-center gap-2 p-4">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add up to {3 - compare.length} more from the catalog
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function Stage(p: StageProps) {
  const showPipeline = Boolean(p.running);
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between gap-2 px-3 pt-1 sm:px-4">
        <Tabs<StudioView>
          label="Studio view"
          value={p.view}
          onChange={p.onViewChange}
          className="flex-1 overflow-x-auto border-b-0 scrollbar-none"
          items={[
            { value: "result", label: "Result" },
            { value: "beforeafter", label: "Before / After", disabled: !p.garment },
            { value: "compare", label: `Compare${p.compare.length ? ` (${p.compare.length})` : ""}` },
          ]}
        />
      </div>
      <div className="relative h-[460px] border-t border-line stage-bg sm:h-[600px] xl:h-[min(68vh,700px)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={p.view}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {p.view === "result" && (
              <SubjectRender
                subject={p.subject}
                garment={p.running ? null : p.garment}
                transform={p.transform}
                onTransform={p.subject.photo && !p.running ? p.onTransform : undefined}
                smooth={p.smooth}
              />
            )}
            {p.view === "beforeafter" && p.garment && !p.running && <BeforeAfter subject={p.subject} garment={p.garment} transform={p.transform} />}
            {p.view === "beforeafter" && p.running && <SubjectRender subject={p.subject} garment={null} transform={p.transform} />}
            {p.view === "compare" && (
              <CompareGrid subject={p.subject} compare={p.compare} transform={p.transform} onRemove={p.onRemoveCompare} onPick={p.onPick} />
            )}
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {showPipeline && p.running && <PipelineOverlay key={p.running.id} label={p.running.garment.name} onDone={p.onPipelineDone} />}
        </AnimatePresence>
        {!p.garment && !p.running && p.view === "result" && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
            <span className="rounded-full border border-line bg-surface/90 px-3 py-1.5 text-xs text-muted backdrop-blur">Pick a garment from the catalog to try it on</span>
          </div>
        )}
      </div>
    </div>
  );
}
