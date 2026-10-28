import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { buttonClasses } from "@/components/ui/variants";

const COLUMNS = [
  { title: "Product", links: [["Studio", "/app/studio"], ["Catalog", "/app/catalog"], ["Analytics", "/app/analytics"], ["Pricing", "#pricing"]] },
  { title: "Company", links: [["About", "#"], ["Careers", "#"], ["Blog", "#"], ["Contact", "#"]] },
  { title: "Resources", links: [["Docs", "#"], ["API reference", "#"], ["Status", "#"], ["Changelog", "#"]] },
  { title: "Legal", links: [["Privacy", "#"], ["Terms", "#"], ["DPA", "#"], ["Security", "#"]] },
];

export function CtaBand() {
  return (
    <section className="py-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-xl border border-line bg-surface px-6 py-16 text-center shadow-card sm:px-16">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" aria-hidden="true" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[700px] -translate-x-1/2 -translate-y-1/2 glow-accent" aria-hidden="true" />
          <h2 className="relative text-[32px] font-semibold leading-tight sm:text-3xl">Give every shopper a fitting room.</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-muted">See your catalog on real people in minutes. No integration needed to try the studio.</p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/app/studio" className={buttonClasses("primary", "lg")}>
              Open the studio <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#pricing" className={buttonClasses("outline", "lg")}>
              View pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line py-16">
      <div className="container grid gap-12 md:grid-cols-[1.5fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">AI virtual try-on for fashion brands. Built in Lahore, for shoppers everywhere.</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:col-span-4">
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <h3 className="text-sm font-medium">{c.title}</h3>
              <ul className="mt-4 space-y-3">
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    {href.startsWith("/") ? (
                      <Link to={href} className="text-sm text-muted transition-colors hover:text-fg">
                        {label}
                      </Link>
                    ) : (
                      <a href={href} className="text-sm text-muted transition-colors hover:text-fg">
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="container mt-16 flex flex-col justify-between gap-4 border-t border-line pt-8 text-xs text-subtle sm:flex-row">
        <p>© {new Date().getFullYear()} FitCheck AI. All rights reserved.</p>
        <p>Concept demo. All data is simulated.</p>
      </div>
    </footer>
  );
}
