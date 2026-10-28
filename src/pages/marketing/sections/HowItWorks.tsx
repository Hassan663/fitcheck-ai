import { motion } from "framer-motion";
import { Code2, ScanFace, ShoppingBag, Wand2 } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { stagger } from "@/lib/motion";

const STEPS = [
  { icon: Code2, title: "Add one snippet", body: "Drop our widget on your product page, or sync your catalog through the API." },
  { icon: ScanFace, title: "Shopper takes a photo", body: "A guided camera or a quick upload. Pose and body shape are detected on the spot." },
  { icon: Wand2, title: "AI renders the look", body: "Our try-on model drapes the garment, matches the lighting and renders in under 10 seconds." },
  { icon: ShoppingBag, title: "They buy with confidence", body: "Size advice and look comparisons turn browsers into buyers who keep what they order." },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 border-t border-line py-24 sm:py-32">
      <div className="container">
        <SectionHeader eyebrow="How it works" title="Live in an afternoon" sub="No photoshoots, no 3D scans, no new app for your customers." />
        <motion.ol
          variants={stagger.container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="relative mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STEPS.map((s, i) => (
            <motion.li key={s.title} variants={stagger.item} className="relative rounded-lg border border-line bg-surface p-6 shadow-card">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent">
                  <s.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="font-mono text-xs text-subtle">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-base font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.body}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
