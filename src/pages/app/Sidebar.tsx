import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, Zap } from "lucide-react";
import { APP_NAV } from "./nav";
import { Logo } from "@/components/Logo";
import { Tooltip } from "@/components/ui/Tooltip";
import { useStore } from "@/context/storeContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
  mobile?: boolean;
}

export function Sidebar({ collapsed, onToggle, onNavigate, mobile }: SidebarProps) {
  const { looks } = useStore();
  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-14 items-center border-b border-line", collapsed ? "justify-center px-2" : "px-4")}>
        <NavLink to="/" aria-label="FitCheck AI home" className="rounded-sm" onClick={onNavigate}>
          <Logo collapsed={collapsed} />
        </NavLink>
      </div>
      <nav aria-label="App" className="flex-1 space-y-0.5 p-2">
        {APP_NAV.map((item) => {
          const link = (
            <NavLink
              to={item.to}
              onClick={onNavigate}
              aria-label={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  "group relative flex h-9 items-center gap-3 rounded-sm text-sm font-medium transition-colors",
                  collapsed ? "w-10 justify-center" : "px-2.5",
                  isActive ? "text-fg" : "text-muted hover:bg-fg/[0.04] hover:text-fg",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId={mobile ? "nav-active-m" : "nav-active"}
                      className="absolute inset-0 rounded-sm bg-fg/[0.07] ring-1 ring-inset ring-line"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <item.icon className={cn("relative h-4 w-4 shrink-0", isActive && "text-accent")} aria-hidden="true" />
                  {!collapsed && <span className="relative flex-1 truncate">{item.label}</span>}
                  {!collapsed && item.label === "Looks" && looks.length > 0 && (
                    <span className="relative rounded-full bg-fg/[0.08] px-1.5 text-[11px] tabular-nums text-muted">{looks.length}</span>
                  )}
                </>
              )}
            </NavLink>
          );
          return (
            <div key={item.to}>
              {collapsed ? (
                <Tooltip content={item.label} side="right">
                  {link}
                </Tooltip>
              ) : (
                link
              )}
            </div>
          );
        })}
      </nav>
      {!collapsed && (
        <div className="m-2 rounded-md border border-line bg-fg/[0.02] p-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Zap className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            Growth plan
          </div>
          <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-fg/10">
            <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-accent to-highlight" />
          </div>
          <p className="mt-2 text-[11px] text-subtle">6,240 of 10,000 try-ons this month</p>
        </div>
      )}
      {onToggle && (
        <div className={cn("border-t border-line p-2", collapsed && "flex justify-center")}>
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex h-9 items-center gap-3 rounded-sm text-sm text-muted transition-colors hover:bg-fg/[0.04] hover:text-fg",
              collapsed ? "w-10 justify-center" : "w-full px-2.5",
            )}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      )}
    </div>
  );
}
