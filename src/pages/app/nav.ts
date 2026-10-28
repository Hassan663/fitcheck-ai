import { BarChart3, Heart, LayoutGrid, Settings, Sparkles, type LucideIcon } from "lucide-react";

export const APP_NAV: { to: string; label: string; icon: LucideIcon; shortcut: string }[] = [
  { to: "/app/studio", label: "Studio", icon: Sparkles, shortcut: "G S" },
  { to: "/app/catalog", label: "Catalog", icon: LayoutGrid, shortcut: "G C" },
  { to: "/app/looks", label: "Looks", icon: Heart, shortcut: "G L" },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3, shortcut: "G A" },
  { to: "/app/settings", label: "Settings", icon: Settings, shortcut: "G ," },
];
