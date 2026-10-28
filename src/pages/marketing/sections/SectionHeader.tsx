import { motion } from "framer-motion";
import { reveal } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function SectionHeader({ eyebrow, title, sub, center = true }: { eyebrow: string; title: string; sub?: string; center?: boolean }) {
  return (
    <motion.div {...reveal} className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <p className="text-sm font-medium text-accent">{eyebrow}</p>
      <h2 className="mt-3 text-[32px] font-semibold leading-tight sm:text-3xl">{title}</h2>
      {sub && <p className="mt-4 text-base text-muted sm:text-lg">{sub}</p>}
    </motion.div>
  );
}
