import { motion } from "framer-motion";
import { Camera, Check, Columns3, Gauge, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SectionHeader } from "./SectionHeader";
import { ModelArt } from "@/components/Svg";
import { Badge } from "@/components/ui/Badge";
import { GARMENTS, MODELS } from "@/lib/catalog";
import { reveal } from "@/lib/motion";
import { cn } from "@/lib/utils";

const STAGE = { plain: true };
const byId = (id: string) => GARMENTS.find((g) => g.id === id) ?? GARMENTS[0];

function VisualFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-line bg-surface p-6 shadow-card sm:p-8", className)}>
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 glow-accent" aria-hidden="true" />
      <div className="relative">{children}</div>
    </div>
  );
}

function CameraVisual() {
  return (
    <VisualFrame>
      <div className="relative mx-auto aspect-[3/4] max-w-[280px] overflow-hidden rounded-lg bg-gradient-to-b from-zinc-700 to-zinc-900">
        <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path
            d="M150 50c24 0 40 18 40 42s-16 44-40 44-40-20-40-44 16-42 40-42Zm-70 110c20-14 46-18 70-18s50 4 70 18l22 110-28 6-8-60v170H94V206l-8 60-28-6Z"
            fill="none"
            stroke="white"
            strokeOpacity=".7"
            strokeWidth="2"
            strokeDasharray="6 6"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-[96px] font-semibold text-white/90"
            animate={{ scale: [1, 0.9, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            3
          </motion.span>
        </div>
        <div className="absolute inset-x-0 bottom-4 flex justify-center">
          <span className="h-14 w-14 rounded-full border-4 border-white/80 bg-white/20" />
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white">Align with the outline</span>
      </div>
    </VisualFrame>
  );
}

function InsightsVisual() {
  const rows = [
    ["Fit score", 92],
    ["Color harmony", 86],
    ["Occasion match", 78],
  ] as const;
  return (
    <VisualFrame>
      <div className="mx-auto max-w-sm space-y-5 rounded-lg border border-line bg-bg/50 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">AI insights</p>
          <Badge tone="success" dot>
            Great match
          </Badge>
        </div>
        {rows.map(([label, v], i) => (
          <div key={label}>
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="text-muted">{label}</span>
              <span className="tabular-nums font-medium">{v}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-fg/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-accent to-highlight"
                initial={{ width: 0 }}
                whileInView={{ width: `${v}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.15 * i, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        ))}
        <div>
          <p className="mb-2 text-sm text-muted">Recommended size</p>
          <div className="flex gap-2">
            {["S", "M", "L", "XL"].map((s) => (
              <span
                key={s}
                className={cn(
                  "inline-flex h-9 w-11 items-center justify-center rounded-sm border text-sm font-medium",
                  s === "M" ? "border-accent bg-accent/10 text-accent" : "border-line text-muted",
                )}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}

function CompareVisual() {
  const looks = [
    { m: MODELS[2], g: byId("g8"), fit: 84 },
    { m: MODELS[2], g: byId("g16"), fit: 95, best: true },
    { m: MODELS[2], g: byId("g7"), fit: 81 },
  ];
  return (
    <VisualFrame>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {looks.map((l) => (
          <div key={l.g.id} className={cn("relative overflow-hidden rounded-md border stage-bg", l.best ? "border-accent ring-2 ring-accent/30" : "border-line")}>
            {l.best && <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">Best</span>}
            <div className="aspect-[3/4] p-1.5">
              <ModelArt model={l.m} garment={l.g} options={STAGE} className="h-full" />
            </div>
            <div className="border-t border-line bg-surface/80 px-2 py-1.5 text-[11px]">
              <p className="truncate font-medium">{l.g.name}</p>
              <p className="text-subtle">Fit {l.fit}%</p>
            </div>
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}

interface Feature {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  visual: ReactNode;
}

const FEATURES: Feature[] = [
  {
    icon: Camera,
    eyebrow: "Capture",
    title: "Any photo, or the camera in their pocket",
    body: "Shoppers upload a photo or take one with a guided camera: a body outline, a countdown and an instant retake. No app to install.",
    bullets: ["Works on desktop and mobile web", "Front/back camera switch", "Photos stay on the device"],
    visual: <CameraVisual />,
  },
  {
    icon: Gauge,
    eyebrow: "Insights",
    title: "Fit guidance that sells the right size",
    body: "Every render comes with a fit score, a color-harmony read and a size recommendation, so shoppers check out with confidence and keep what they buy.",
    bullets: ["Size recommendation per shopper", "Occasion and color matching", "Smart “pairs well with” upsell"],
    visual: <InsightsVisual />,
  },
  {
    icon: Columns3,
    eyebrow: "Compare",
    title: "Side by side, so they don't have to guess",
    body: "Shoppers line up three looks and FitCheck highlights the best match. They decide faster and abandon fewer carts.",
    bullets: ["Up to 3 looks at once", "Best-match highlighting", "Save and share looks"],
    visual: <CompareVisual />,
  },
];

export function Features() {
  return (
    <section id="product" className="scroll-mt-20 py-24 sm:py-32">
      <div className="container">
        <SectionHeader
          eyebrow="Product"
          title="Everything a fitting room does. None of the queue."
          sub="A drop-in try-on experience that fits your storefront, built for how people actually shop on their phones."
        />
        <div className="mt-16 space-y-20 sm:mt-24 sm:space-y-32">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
              <motion.div {...reveal} className={cn(i % 2 === 1 && "lg:order-2")}>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-muted">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-line bg-surface text-accent">
                    <f.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {f.eyebrow}
                </div>
                <h3 className="mt-5 text-xl font-semibold sm:text-2xl">{f.title}</h3>
                <p className="mt-4 text-base text-muted sm:text-lg">{f.body}</p>
                <ul className="mt-6 space-y-3">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div {...reveal} className={cn(i % 2 === 1 && "lg:order-1")}>
                {f.visual}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
