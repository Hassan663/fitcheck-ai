import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, Search, SearchX } from "lucide-react";
import { GarmentArt } from "@/components/Svg";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { CATEGORIES, type Garment } from "@/lib/catalog";
import { cn, formatPKR } from "@/lib/utils";

interface Props {
  garments: Garment[];
  selectedId: string | null;
  compareIds: string[];
  onSelect: (g: Garment) => void;
  onToggleCompare: (g: Garment) => void;
}

export function CatalogPanel({ garments, selectedId, compareIds, onSelect, onToggleCompare }: Props) {
  const [cat, setCat] = useState<string>("All");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return garments.filter(
      (g) =>
        g.status !== "archived" &&
        (cat === "All" || g.category === cat) &&
        (!term || `${g.name} ${g.brand} ${g.tags.join(" ")}`.toLowerCase().includes(term)),
    );
  }, [garments, cat, q]);

  return (
    <section aria-labelledby="catalog-heading" className="rounded-lg border border-line bg-surface shadow-card">
      <div className="space-y-3 p-4 pb-3">
        <div className="flex items-center justify-between">
          <h2 id="catalog-heading" className="text-sm font-semibold">
            Catalog
          </h2>
          <span className="text-xs tabular-nums text-subtle">{list.length} items</span>
        </div>
        <Input icon={<Search />} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, brand, tag" aria-label="Search catalog" className="h-9" />
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 scrollbar-none" role="group" aria-label="Filter by category">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={cn(
                "h-7 shrink-0 rounded-full px-3 text-xs font-medium transition-colors",
                cat === c ? "bg-fg text-bg" : "bg-fg/[0.05] text-muted hover:bg-fg/[0.08] hover:text-fg",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="max-h-[520px] overflow-y-auto border-t border-line p-3 xl:max-h-[calc(100vh-460px)] xl:min-h-[280px]">
        {list.length === 0 ? (
          <EmptyState icon={<SearchX className="h-5 w-5" />} title="No garments found" description="Try a different search or category." className="border-0 py-10" />
        ) : (
          <motion.ul layout className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-2">
            <AnimatePresence initial={false} mode="popLayout">
              {list.map((g) => {
                const selected = g.id === selectedId;
                const inCompare = compareIds.includes(g.id);
                return (
                  <motion.li
                    layout
                    key={g.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="relative"
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(g)}
                      aria-pressed={selected}
                      aria-label={`Try on ${g.name}, ${formatPKR(g.price)}`}
                      className={cn(
                        "group block w-full rounded-md border p-2 text-left transition-[border-color,transform,box-shadow] duration-150 hover:-translate-y-0.5",
                        selected ? "border-accent ring-2 ring-accent/25" : "border-line hover:border-line-strong",
                      )}
                    >
                      <span className="block aspect-square rounded-sm bg-fg/[0.03] p-2">
                        <GarmentArt garment={g} className="h-full w-full transition-transform duration-200 group-hover:scale-[1.04]" />
                      </span>
                      <span className="mt-2 block truncate text-xs font-medium">{g.name}</span>
                      <span className="block truncate text-[11px] text-subtle">{formatPKR(g.price)}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleCompare(g)}
                      aria-pressed={inCompare}
                      aria-label={inCompare ? `Remove ${g.name} from compare` : `Add ${g.name} to compare`}
                      className={cn(
                        "absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full border shadow-sm transition-colors",
                        inCompare ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface/90 text-muted backdrop-blur hover:text-fg",
                      )}
                    >
                      {inCompare ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>
    </section>
  );
}
