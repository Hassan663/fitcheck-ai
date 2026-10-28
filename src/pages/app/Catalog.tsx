import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, ChevronsUpDown, PackageSearch, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { AddGarmentDrawer } from "./catalog/AddGarmentDrawer";
import { PageHeader } from "./PageHeader";
import { GarmentArt } from "@/components/Svg";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tooltip } from "@/components/ui/Tooltip";
import { useStore } from "@/context/storeContext";
import { useToast } from "@/context/toastContext";
import { useSimulatedLoad } from "@/hooks/useSimulatedLoad";
import type { Garment, GarmentStatus } from "@/lib/catalog";
import { cn, formatPKR, hashString } from "@/lib/utils";

type SortKey = "name" | "category" | "price" | "status" | "tryons";
type StatusFilter = "all" | GarmentStatus;

const STATUS_TONE = { active: "success", draft: "warning", archived: "neutral" } as const;
const STATUS_LABEL = { active: "Active", draft: "Draft", archived: "Archived" } as const;
const tryons = (g: Garment) => (g.custom ? 0 : 180 + (hashString(g.id) % 1400));

function SortHeader({ label, k, sort, onSort, align = "left" }: { label: string; k: SortKey; sort: { key: SortKey; dir: 1 | -1 }; onSort: (k: SortKey) => void; align?: "left" | "right" }) {
  const active = sort.key === k;
  const Icon = !active ? ChevronsUpDown : sort.dir === 1 ? ArrowUp : ArrowDown;
  return (
    <th scope="col" aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className={cn("px-4 py-3 font-medium", align === "right" && "text-right")}>
      <button type="button" onClick={() => onSort(k)} className={cn("inline-flex items-center gap-1 rounded-sm transition-colors hover:text-fg", active && "text-fg")}>
        {label}
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </th>
  );
}

export default function CatalogPage() {
  const { garments, removeGarment } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const loading = useSimulatedLoad();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "name", dir: 1 });
  const [drawer, setDrawer] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Garment | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = garments.filter(
      (g) => (status === "all" || g.status === status) && (!term || `${g.name} ${g.brand} ${g.category} ${g.tags.join(" ")}`.toLowerCase().includes(term)),
    );
    const val = (g: Garment): string | number => (sort.key === "tryons" ? tryons(g) : g[sort.key]);
    return [...list].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * sort.dir;
    });
  }, [garments, q, status, sort]);

  const onSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));
  const counts = useMemo(() => ({ active: garments.filter((g) => g.status === "active").length, total: garments.length }), [garments]);

  return (
    <div className="mx-auto w-full max-w-content space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Catalog"
        description={`${counts.total} garments · ${counts.active} live in the try-on widget`}
        actions={
          <Button onClick={() => setDrawer(true)}>
            <Plus className="h-4 w-4" /> Add garment
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <Input icon={<Search />} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search garments" aria-label="Search garments" />
        </div>
        <SegmentedControl<StatusFilter>
          label="Filter by status"
          value={status}
          onChange={setStatus}
          className="w-full sm:w-auto"
          options={[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "draft", label: "Draft" },
            { value: "archived", label: "Archived" },
          ]}
        />
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="divide-y divide-line" role="status" aria-label="Loading catalog">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-11 w-11 rounded-sm" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="hidden h-6 w-16 rounded-full sm:block" />
                <Skeleton className="hidden h-3.5 w-20 md:block" />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            className="m-4 border-0"
            icon={<PackageSearch className="h-5 w-5" />}
            title={q || status !== "all" ? "No garments match" : "Your catalog is empty"}
            description={q || status !== "all" ? "Try clearing the search or switching the status filter." : "Add your first garment to make it available for try-on."}
            action={
              q || status !== "all" ? (
                <Button variant="outline" onClick={() => { setQ(""); setStatus("all"); }}>
                  Clear filters
                </Button>
              ) : (
                <Button onClick={() => setDrawer(true)}>
                  <Plus className="h-4 w-4" /> Add garment
                </Button>
              )
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <caption className="sr-only">Garments, sortable by column</caption>
                <thead className="border-b border-line bg-fg/[0.02] text-left text-xs text-muted">
                  <tr>
                    <SortHeader label="Garment" k="name" sort={sort} onSort={onSort} />
                    <SortHeader label="Category" k="category" sort={sort} onSort={onSort} />
                    <SortHeader label="Status" k="status" sort={sort} onSort={onSort} />
                    <SortHeader label="Try-ons (30d)" k="tryons" sort={sort} onSort={onSort} align="right" />
                    <SortHeader label="Price" k="price" sort={sort} onSort={onSort} align="right" />
                    <th scope="col" className="w-24 px-4 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <motion.tbody layout className="divide-y divide-line">
                  <AnimatePresence initial={false}>
                    {rows.map((g) => (
                      <motion.tr layout key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="group transition-colors hover:bg-fg/[0.02]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="h-11 w-11 shrink-0 rounded-sm border border-line bg-fg/[0.03] p-1">
                              <GarmentArt garment={g} className="h-full w-full" />
                            </span>
                            <div className="min-w-0">
                              <p className="flex items-center gap-2 truncate font-medium">
                                {g.name}
                                {g.custom && <Badge tone="accent">New</Badge>}
                              </p>
                              <p className="truncate text-xs text-subtle">{g.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted">{g.category}</td>
                        <td className="px-4 py-3">
                          <Badge tone={STATUS_TONE[g.status]} dot>
                            {STATUS_LABEL[g.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted">{tryons(g).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums">{formatPKR(g.price)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                            <Tooltip content="Try in studio">
                              <Button size="icon-sm" variant="ghost" aria-label={`Try ${g.name} in studio`} onClick={() => navigate(`/app/studio?garment=${g.id}`)}>
                                <Sparkles className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                            {g.custom && (
                              <Tooltip content="Delete">
                                <Button size="icon-sm" variant="ghost" aria-label={`Delete ${g.name}`} onClick={() => setPendingDelete(g)} className="hover:text-danger">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </motion.tbody>
              </table>
            </div>
            {/* Mobile list */}
            <ul className="divide-y divide-line md:hidden">
              {rows.map((g) => (
                <li key={g.id} className="flex items-center gap-3 p-3">
                  <span className="h-14 w-14 shrink-0 rounded-sm border border-line bg-fg/[0.03] p-1.5">
                    <GarmentArt garment={g} className="h-full w-full" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{g.name}</p>
                    <p className="truncate text-xs text-subtle">
                      {g.brand} · {g.category}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Badge tone={STATUS_TONE[g.status]} dot>
                        {STATUS_LABEL[g.status]}
                      </Badge>
                      <span className="text-xs font-medium tabular-nums">{formatPKR(g.price)}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <Link to={`/app/studio?garment=${g.id}`} aria-label={`Try ${g.name} in studio`} className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-muted hover:bg-fg/[0.06] hover:text-fg">
                      <Sparkles className="h-4 w-4" />
                    </Link>
                    {g.custom && (
                      <button type="button" aria-label={`Delete ${g.name}`} onClick={() => setPendingDelete(g)} className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-muted hover:bg-fg/[0.06] hover:text-danger">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <AddGarmentDrawer
        open={drawer}
        onClose={() => setDrawer(false)}
        onSaved={(g) => {
          setDrawer(false);
          toast({ title: `${g.name} added`, description: g.status === "active" ? "It's live in the studio catalog." : "Saved as a draft." });
        }}
      />
      <Dialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete garment?"
        description={pendingDelete ? `${pendingDelete.name} and any saved looks using it will be removed. This can't be undone.` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              data-autofocus
              onClick={() => {
                if (pendingDelete) {
                  removeGarment(pendingDelete.id);
                  toast({ title: "Garment deleted", tone: "info" });
                }
                setPendingDelete(null);
              }}
            >
              Delete
            </Button>
          </>
        }
      />
    </div>
  );
}
