import { SectionHeader } from "./SectionHeader";
import { Accordion } from "@/components/ui/Accordion";

const FAQ = [
  {
    q: "How realistic are the try-on results?",
    a: "Production renders use a diffusion-based try-on model that preserves the shopper's pose, skin tone and lighting while draping your garment's real fabric. This demo uses illustrations to show the experience.",
  },
  {
    q: "What happens to shopper photos?",
    a: "Photos are processed for the render only and deleted after 24 hours by default. You can configure zero retention. In this demo, photos never leave the browser at all.",
  },
  {
    q: "Do I need special product photos?",
    a: "No. A standard flat-lay or on-model packshot is enough. We handle garment segmentation automatically when you sync your catalog.",
  },
  {
    q: "Which platforms do you support?",
    a: "Shopify, WooCommerce and custom storefronts via a JavaScript widget or REST API. Native mobile SDKs are on the roadmap.",
  },
  {
    q: "How fast is a render?",
    a: "Under 10 seconds at p95 on our GPU fleet, with results cached per photo and garment so repeat views are instant.",
  },
  {
    q: "Can I try it before committing?",
    a: "Yes. Every plan starts with a 14-day free trial, and Growth customers get a guided onboarding call.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-line py-24 sm:py-32">
      <div className="container grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <SectionHeader eyebrow="FAQ" title="Questions, answered" sub="Can't find what you need? Our team replies within a day." center={false} />
        <Accordion items={FAQ} />
      </div>
    </section>
  );
}
