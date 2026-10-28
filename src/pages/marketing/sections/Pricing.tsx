import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { buttonClasses } from "@/components/ui/variants";
import { stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Billing = "monthly" | "yearly";

const PLANS = [
  {
    name: "Starter",
    monthly: 49,
    desc: "For new stores validating try-on.",
    features: ["1,000 try-ons / month", "Up to 100 SKUs", "Web widget", "Email support"],
    cta: "Start free trial",
  },
  {
    name: "Growth",
    monthly: 199,
    desc: "For brands scaling online revenue.",
    features: ["10,000 try-ons / month", "Unlimited SKUs", "Camera capture + compare", "Analytics dashboard", "Priority support"],
    cta: "Start free trial",
    featured: true,
  },
  {
    name: "Enterprise",
    monthly: null,
    desc: "For retailers with custom needs.",
    features: ["Unlimited try-ons", "Dedicated GPU capacity", "SSO and audit logs", "Custom model tuning", "99.9% uptime SLA"],
    cta: "Talk to sales",
  },
];

export function Pricing() {
  const [billing, setBilling] = useState<Billing>("monthly");
  return (
    <section id="pricing" className="scroll-mt-20 py-24 sm:py-32">
      <div className="container">
        <SectionHeader eyebrow="Pricing" title="Simple pricing that scales with you" sub="Start free for 14 days. Pay as you grow." />
        <div className="mt-10 flex justify-center">
          <SegmentedControl<Billing>
            label="Billing period"
            value={billing}
            onChange={setBilling}
            options={[
              { value: "monthly", label: "Monthly" },
              {
                value: "yearly",
                label: (
                  <>
                    Yearly <span className="rounded-full bg-success/15 px-1.5 text-[11px] font-semibold text-success">−20%</span>
                  </>
                ),
              },
            ]}
          />
        </div>
        <motion.div
          variants={stagger.container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid gap-4 lg:grid-cols-3"
        >
          {PLANS.map((p) => {
            const price = p.monthly === null ? null : billing === "monthly" ? p.monthly : Math.round(p.monthly * 0.8);
            return (
              <motion.div
                key={p.name}
                variants={stagger.item}
                className={cn(
                  "relative flex flex-col rounded-xl border bg-surface p-8 shadow-card",
                  p.featured ? "border-accent/50 shadow-glow" : "border-line",
                )}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-8 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-fg">Most popular</span>
                )}
                <h3 className="text-base font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted">{p.desc}</p>
                <div className="mt-6 flex h-12 items-end gap-1">
                  {price === null ? (
                    <span className="text-2xl font-semibold">Custom</span>
                  ) : (
                    <>
                      <span className="text-2xl font-semibold">$</span>
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={price}
                          initial={{ y: 12, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -12, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-3xl font-semibold tabular-nums"
                        >
                          {price}
                        </motion.span>
                      </AnimatePresence>
                      <span className="mb-1.5 text-sm text-muted">/mo</span>
                    </>
                  )}
                </div>
                <p className="mt-1 h-5 text-xs text-subtle">{price !== null && billing === "yearly" ? `Billed $${price * 12} yearly` : " "}</p>
                <Link
                  to="/app/studio"
                  className={buttonClasses(p.featured ? "primary" : "outline", "md", "mt-6 w-full")}
                >
                  {p.cta}
                </Link>
                <ul className="mt-8 space-y-3 border-t border-line pt-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
