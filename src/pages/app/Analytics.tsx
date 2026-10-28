import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, BarChart3, Table2 } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from "recharts";
import { PageHeader } from "./PageHeader";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Skeleton } from "@/components/ui/Skeleton";
import { useStore } from "@/context/storeContext";
import { useTheme } from "@/context/themeContext";
import { useSimulatedLoad } from "@/hooks/useSimulatedLoad";
import { stagger } from "@/lib/motion";
import { cn, hashString } from "@/lib/utils";

type Range = "7d" | "30d" | "90d";
const DAYS: Record<Range, number> = { "7d": 7, "30d": 30, "90d": 90 };
const dayFmt = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
const num = new Intl.NumberFormat("en");

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function buildSeries(days: number) {
  const rand = seeded(days * 97);
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const weekly = [0.82, 0.9, 0.95, 1, 1.08, 1.28, 1.22][d.getDay()];
    const trend = 1 + (i / days) * 0.35;
    return { date: dayFmt.format(d), tryons: Math.round(190 * weekly * trend * (0.88 + rand() * 0.24)) };
  });
}

function useChartColors() {
  const { theme, accent } = useTheme();
  return {
    accent,
    grid: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(10,10,11,0.06)",
    axis: theme === "dark" ? "#71717a" : "#71717a",
    surface: theme === "dark" ? "#111113" : "#ffffff",
  };
}

function ChartTooltip({ active, payload, label, unit }: TooltipProps<number, string> & { unit: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line bg-elevated px-3 py-2 text-xs shadow-pop">
      <p className="text-subtle">{label}</p>
      <p className="mt-0.5 font-semibold tabular-nums text-fg">
        {num.format(Number(payload[0].value))} {unit}
      </p>
    </div>
  );
}

function ChartCard({ title, description, children, table, className }: { title: string; description: string; children: ReactNode; table: { head: [string, string]; rows: [string, string][] }; className?: string }) {
  const [mode, setMode] = useState<"chart" | "table">("chart");
  return (
    <Card className={cn("flex flex-col p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-0.5 text-xs text-subtle">{description}</p>
        </div>
        <SegmentedControl<"chart" | "table">
          label={`${title} view`}
          size="sm"
          value={mode}
          onChange={setMode}
          options={[
            { value: "chart", label: <BarChart3 className="h-3.5 w-3.5" />, ariaLabel: "Chart view" },
            { value: "table", label: <Table2 className="h-3.5 w-3.5" />, ariaLabel: "Table view" },
          ]}
        />
      </div>
      {mode === "chart" ? (
        <div className="min-h-0 flex-1">{children}</div>
      ) : (
        <div className="max-h-[280px] flex-1 overflow-y-auto rounded-md border border-line">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-elevated text-left text-xs text-muted">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">{table.head[0]}</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">{table.head[1]}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {table.rows.map(([a, b]) => (
                <tr key={a}>
                  <td className="px-3 py-2 text-muted">{a}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function Kpi({ label, value, delta, good, hint }: { label: string; value: string; delta: string; good: boolean; hint: string }) {
  const up = delta.startsWith("+");
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <motion.div variants={stagger.item}>
      <Card className="h-full p-5">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
        <p className="mt-2 flex items-center gap-1.5 text-xs">
          <span className={cn("inline-flex items-center gap-0.5 font-medium", good ? "text-success" : "text-danger")}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {delta}
            <span className="sr-only">{good ? "(improvement)" : "(decline)"}</span>
          </span>
          <span className="text-subtle">{hint}</span>
        </p>
      </Card>
    </motion.div>
  );
}

export default function Analytics() {
  const loading = useSimulatedLoad(650);
  const { garments } = useStore();
  const c = useChartColors();
  const [range, setRange] = useState<Range>("30d");
  const series = useMemo(() => buildSeries(DAYS[range]), [range]);
  const total = series.reduce((a, d) => a + d.tryons, 0);

  const top = useMemo(
    () =>
      garments
        .filter((g) => !g.custom)
        .map((g) => ({ name: g.name, value: Math.round(((hashString(g.id + range) % 900) + 300) * (DAYS[range] / 30)) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6),
    [garments, range],
  );

  const funnel = useMemo(() => {
    const views = Math.round(total * 3.4);
    const steps = [
      ["Product views", views],
      ["Try-on started", Math.round(total * 1.18)],
      ["Try-on completed", total],
      ["Added to bag", Math.round(total * 0.21)],
      ["Purchased", Math.round(total * 0.112)],
    ] as const;
    return steps.map(([stage, value]) => ({ stage, value, pct: `${((value / views) * 100).toFixed(value / views < 0.1 ? 1 : 0)}%` }));
  }, [total]);

  const conv = ((funnel[4].value / funnel[2].value) * 100).toFixed(1);

  return (
    <div className="mx-auto w-full max-w-content space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Analytics"
        description="How shoppers use try-on across your storefront."
        actions={
          <SegmentedControl<Range>
            label="Date range"
            value={range}
            onChange={setRange}
            options={[
              { value: "7d", label: "7 days" },
              { value: "30d", label: "30 days" },
              { value: "90d", label: "90 days" },
            ]}
          />
        }
      />

      {loading ? (
        <div className="space-y-4" role="status" aria-label="Loading analytics">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[124px] rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-[360px] rounded-lg" />
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-[340px] rounded-lg" />
            <Skeleton className="h-[340px] rounded-lg" />
          </div>
        </div>
      ) : (
        <>
          <motion.div key={range} variants={stagger.container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Kpi label="Try-ons" value={num.format(total)} delta="+18.2%" good hint="vs prev." />
            <Kpi label="Try-on conversion" value={`${conv}%`} delta="+2.4pt" good hint="vs prev." />
            <Kpi label="Return rate" value="8.6%" delta="−3.1pt" good hint="vs prev." />
            <Kpi label="Avg. render time" value="6.4s" delta="−0.8s" good hint="p50" />
          </motion.div>

          <ChartCard
            title="Try-ons over time"
            description={`Daily completed try-ons, last ${DAYS[range]} days`}
            table={{ head: ["Date", "Try-ons"], rows: series.map((d) => [d.date, num.format(d.tryons)]) }}
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                  <defs>
                    <linearGradient id="tryonFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor={c.accent} stopOpacity={0.28} />
                      <stop offset="1" stopColor={c.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={c.grid} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: c.axis, fontSize: 12 }} minTickGap={28} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: c.axis, fontSize: 12 }} width={44} />
                  <Tooltip content={<ChartTooltip unit="try-ons" />} cursor={{ stroke: c.axis, strokeWidth: 1, strokeDasharray: "3 3" }} />
                  <Area
                    type="monotone"
                    dataKey="tryons"
                    stroke={c.accent}
                    strokeWidth={2}
                    fill="url(#tryonFill)"
                    activeDot={{ r: 5, stroke: c.surface, strokeWidth: 2, fill: c.accent }}
                    animationDuration={700}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard
              title="Top garments"
              description="Most tried-on items in this period"
              table={{ head: ["Garment", "Try-ons"], rows: top.map((t) => [t.name, num.format(t.value)]) }}
            >
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top} layout="vertical" margin={{ top: 0, right: 48, bottom: 0, left: 0 }} barCategoryGap={6}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fill: c.axis, fontSize: 12 }} width={128} />
                    <Tooltip content={<ChartTooltip unit="try-ons" />} cursor={{ fill: c.grid }} />
                    <Bar dataKey="value" fill={c.accent} radius={[0, 4, 4, 0]} maxBarSize={22} animationDuration={700}>
                      <LabelList dataKey="value" position="right" formatter={(v: number) => num.format(v)} style={{ fill: c.axis, fontSize: 12 }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title="Conversion funnel"
              description="Share of product views reaching each stage"
              table={{ head: ["Stage", "Shoppers"], rows: funnel.map((f) => [f.stage, `${num.format(f.value)} (${f.pct})`]) }}
            >
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnel} layout="vertical" margin={{ top: 0, right: 48, bottom: 0, left: 0 }} barCategoryGap={6}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="stage" tickLine={false} axisLine={false} tick={{ fill: c.axis, fontSize: 12 }} width={128} />
                    <Tooltip content={<ChartTooltip unit="shoppers" />} cursor={{ fill: c.grid }} />
                    <Bar dataKey="value" fill={c.accent} radius={[0, 4, 4, 0]} maxBarSize={22} animationDuration={700}>
                      <LabelList dataKey="pct" position="right" style={{ fill: c.axis, fontSize: 12 }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
          <p className="text-center text-xs text-subtle">Demo data, generated deterministically per date range.</p>
        </>
      )}
    </div>
  );
}
