const LOGOS = [
  { name: "NORTHWEAVE", className: "font-bold tracking-[0.2em]" },
  { name: "Kasba", className: "font-serif italic text-[22px]" },
  { name: "loom&co", className: "font-semibold lowercase tracking-tight" },
  { name: "ATELIER 9", className: "font-light tracking-[0.3em]" },
  { name: "Saffron Lane", className: "font-medium" },
  { name: "MERIDIAN", className: "font-black tracking-tight" },
];

export function LogoRow() {
  return (
    <section aria-label="Trusted by" className="border-y border-line py-10">
      <div className="container">
        <p className="text-center text-sm text-subtle">Trusted by fast-growing fashion brands across South Asia</p>
        <ul className="mt-6 grid grid-cols-2 items-center gap-x-6 gap-y-6 text-muted sm:grid-cols-3 lg:grid-cols-6">
          {LOGOS.map((l) => (
            <li key={l.name} className={`text-center text-lg opacity-70 transition-opacity hover:opacity-100 ${l.className}`}>
              {l.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
