import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { StudioMockup } from "@/components/StudioMockup";
import { buttonClasses } from "@/components/ui/variants";
import { EASE } from "@/lib/motion";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: EASE },
});

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-16 sm:pb-24 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute left-1/2 top-[-240px] h-[640px] w-[1000px] -translate-x-1/2 glow-accent" />
        <div className="absolute right-[-200px] top-[200px] h-[400px] w-[600px] glow-highlight" />
      </div>
      <div className="container text-center">
        <motion.a
          href="#product"
          {...fade(0)}
          className="group mx-auto inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 py-1 pl-1 pr-3 text-xs text-muted backdrop-blur transition-colors hover:border-line-strong hover:text-fg"
        >
          <span className="rounded-full bg-accent/15 px-2 py-0.5 font-medium text-accent">New</span>
          Live camera try-on is here
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </motion.a>
        <motion.h1 {...fade(0.05)} className="text-gradient mx-auto mt-6 max-w-3xl text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-3xl md:text-4xl">
          The fitting room, on every product page.
        </motion.h1>
        <motion.p {...fade(0.1)} className="mx-auto mt-6 max-w-xl text-base text-muted sm:text-lg">
          FitCheck AI lets shoppers see your clothes on themselves in seconds, from a photo or their camera. Fewer
          returns, more confident checkouts.
        </motion.p>
        <motion.div {...fade(0.15)} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/app/studio" className={buttonClasses("primary", "lg", "w-full sm:w-auto")}>
            Try the studio <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#how" className={buttonClasses("outline", "lg", "w-full sm:w-auto")}>
            <Play className="h-4 w-4" /> See how it works
          </a>
        </motion.div>
        <motion.p {...fade(0.2)} className="mt-4 text-xs text-subtle">
          No credit card required · Photos never leave the device in this demo
        </motion.p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
        className="container relative mt-14 sm:mt-20"
      >
        <div className="pointer-events-none absolute inset-x-12 -top-8 h-40 glow-accent blur-2xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1000px]">
          <StudioMockup />
        </div>
      </motion.div>
    </section>
  );
}
