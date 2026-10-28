import { motion } from "framer-motion";
import { stagger } from "@/lib/motion";

const METRICS = [
  { value: "−25%", label: "Returns", note: "Average drop in size-related returns across pilot brands" },
  { value: "+30%", label: "Conversion", note: "Lift for shoppers who used try-on vs. those who didn't" },
  { value: "<10s", label: "Render time", note: "From photo to photorealistic look, p95 on GPU" },
];

export function Metrics() {
  return (
    <section aria-label="Results" className="relative overflow-hidden border-y border-line py-20">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[900px] -translate-x-1/2 -translate-y-1/2 glow-accent opacity-60" aria-hidden="true" />
      <motion.div
        variants={stagger.container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="container relative grid gap-10 sm:grid-cols-3 sm:gap-6"
      >
        {METRICS.map((m) => (
          <motion.div key={m.label} variants={stagger.item} className="text-center">
            <p className="text-gradient text-3xl font-semibold tabular-nums sm:text-4xl">{m.value}</p>
            <p className="mt-2 text-sm font-medium">{m.label}</p>
            <p className="mx-auto mt-1 max-w-[240px] text-sm text-subtle">{m.note}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
