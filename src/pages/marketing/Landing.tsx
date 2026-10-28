import { Nav } from "./sections/Nav";
import { Hero } from "./sections/Hero";
import { LogoRow } from "./sections/LogoRow";
import { Features } from "./sections/Features";
import { HowItWorks } from "./sections/HowItWorks";
import { Metrics } from "./sections/Metrics";
import { Pricing } from "./sections/Pricing";
import { Faq } from "./sections/Faq";
import { CtaBand, Footer } from "./sections/Footer";
import { PageTransition } from "@/components/PageTransition";

export default function Landing() {
  return (
    <PageTransition className="min-h-screen overflow-x-clip">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <LogoRow />
        <Features />
        <HowItWorks />
        <Metrics />
        <Pricing />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
    </PageTransition>
  );
}
