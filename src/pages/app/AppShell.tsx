import { Suspense, useEffect, useRef, useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { RouteFallback } from "@/components/RouteFallback";
import { useFocusTrap, useScrollLock } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/utils";

const COLLAPSE_KEY = "fitcheck:sidebar-collapsed";

function MobileNav({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, onClose);
  useScrollLock(true);
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <motion.div className="absolute inset-0 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden="true" />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-y-0 left-0 w-[272px] max-w-[85vw] border-r border-line bg-surface"
      >
        <Sidebar collapsed={false} onNavigate={onClose} mobile />
      </motion.div>
    </div>
  );
}

export default function AppShell() {
  const location = useLocation();
  const outlet = useOutlet();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === "1");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <div className="min-h-screen">
      <a href="#app-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg">
        Skip to content
      </a>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-line bg-surface/60 backdrop-blur-xl transition-[width] duration-200 ease-out lg:block",
          collapsed ? "w-[57px]" : "w-[240px]",
        )}
      >
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </aside>
      <AnimatePresence>{mobileOpen && <MobileNav onClose={() => setMobileOpen(false)} />}</AnimatePresence>

      <div className={cn("flex min-h-screen flex-col transition-[padding] duration-200 ease-out", collapsed ? "lg:pl-[57px]" : "lg:pl-[240px]")}>
        <TopBar onOpenNav={() => setMobileOpen(true)} />
        <main id="app-main" className="min-w-0 flex-1">
          <Suspense fallback={<RouteFallback />}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                {outlet}
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
