import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/themeContext";
import { Tooltip } from "./ui/Tooltip";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  return (
    <Tooltip content={label} side="bottom">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={label}
        className={cn(
          "relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-md text-muted transition-colors hover:bg-fg/[0.06] hover:text-fg",
          className,
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ y: -12, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 12, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.18 }}
          >
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </motion.span>
        </AnimatePresence>
      </button>
    </Tooltip>
  );
}
