import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronsUpDown, Globe, HelpCircle, LogOut, Menu, Plus, Search, Settings, ShoppingBag, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { Tooltip } from "@/components/ui/Tooltip";
import { useStore } from "@/context/storeContext";
import { useToast } from "@/context/toastContext";

export function TopBar({ onOpenNav }: { onOpenNav: () => void }) {
  const { workspace, bag } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/app/catalog${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-bg/80 px-3 backdrop-blur-xl sm:px-4">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-fg/[0.06] hover:text-fg lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <DropdownMenu
        align="start"
        header={<p className="text-xs text-subtle">Workspaces</p>}
        items={[
          { label: workspace, icon: <Check />, hint: "Current" },
          { label: "Demo Boutique", icon: <span className="h-4 w-4" />, onSelect: () => toast({ title: "Workspace switching is disabled in the demo", tone: "info" }) },
          { label: "", separator: true },
          { label: "Create workspace", icon: <Plus />, disabled: true },
        ]}
        trigger={(p) => (
          <button
            type="button"
            id={p.id}
            aria-expanded={p["aria-expanded"]}
            aria-haspopup={p["aria-haspopup"]}
            aria-controls={p["aria-controls"]}
            onClick={p.toggle}
            className="flex h-9 min-w-0 items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors hover:bg-fg/[0.06]"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-fg text-[11px] font-bold text-bg" aria-hidden="true">
              {workspace.slice(0, 1).toUpperCase()}
            </span>
            <span className="max-w-[120px] truncate sm:max-w-[180px]">{workspace}</span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden="true" />
          </button>
        )}
      />

      <form onSubmit={onSearch} role="search" className="relative ml-2 hidden max-w-sm flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search garments…"
          aria-label="Search garments"
          className="h-9 w-full rounded-md border border-line bg-fg/[0.03] pl-9 pr-12 text-sm placeholder:text-subtle transition-colors hover:border-line-strong focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-[4px] border border-line px-1.5 text-[10px] text-subtle">↵</kbd>
      </form>

      <div className="ml-auto flex items-center gap-1">
        <Tooltip content="Search" side="bottom">
          <button
            type="button"
            onClick={() => navigate("/app/catalog")}
            aria-label="Search garments"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-fg/[0.06] hover:text-fg md:hidden"
          >
            <Search className="h-4 w-4" />
          </button>
        </Tooltip>
        <ThemeToggle />
        <Tooltip content="Bag" side="bottom">
          <button
            type="button"
            aria-label={`Bag, ${bag.length} items`}
            onClick={() => toast({ title: `${bag.length} item${bag.length === 1 ? "" : "s"} in bag`, description: "Checkout hands off to the brand's store in production.", tone: "info" })}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-fg/[0.06] hover:text-fg"
          >
            <ShoppingBag className="h-4 w-4" />
            {bag.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-highlight px-1 text-[10px] font-semibold text-white">
                {bag.length}
              </span>
            )}
          </button>
        </Tooltip>
        <DropdownMenu
          header={
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Hira Naveed</p>
              <p className="truncate text-xs text-subtle">hira@outfitters.pk</p>
            </div>
          }
          items={[
            { label: "Profile", icon: <User />, onSelect: () => navigate("/app/settings") },
            { label: "Settings", icon: <Settings />, onSelect: () => navigate("/app/settings") },
            { label: "Help & docs", icon: <HelpCircle />, onSelect: () => toast({ title: "Docs open in production", tone: "info" }) },
            { label: "Marketing site", icon: <Globe />, onSelect: () => navigate("/") },
            { label: "", separator: true },
            { label: "Sign out", icon: <LogOut />, danger: true, onSelect: () => navigate("/") },
          ]}
          trigger={(p) => (
            <button
              type="button"
              id={p.id}
              aria-label="Account menu"
              aria-expanded={p["aria-expanded"]}
              aria-haspopup={p["aria-haspopup"]}
              aria-controls={p["aria-controls"]}
              onClick={p.toggle}
              className="ml-1 rounded-full"
            >
              <Avatar name="Hira Naveed" />
            </button>
          )}
        />
      </div>
    </header>
  );
}
