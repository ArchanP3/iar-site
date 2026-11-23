import Link from "next/link";
import { ArrowRight, MousePointerClick } from "lucide-react";
import { montserrat } from "@/lib/font";
import { industries as all, industryUrl } from "@/lib/industries";
import IndustriesCarousel from "./IndustriesCarousel";

/* Card photos live in public/industries/<slug>.jpg (600x760, title on the photo).
   An industry shows in the carousel once its card file exists in this list. */
const withCard = new Set([
  "automotive", "packaging", "plastics", "food-beverage", "metalworking", "printing", "pharmaceutical", "material-handling",
  "steel-metals", "pulp-paper", "tire-rubber", "aerospace", "electronics", "water-wastewater", "mining", "oil-gas", "glass", "textiles", "machine-builders",
]);
const items = all.filter((i) => withCard.has(i.slug)).map((i) => ({ key: i.slug, name: i.name, href: industryUrl(i.slug) }));

export default function Industries() {
  return (
    <section id="industries" aria-labelledby="industries-heading" className={`${montserrat.className} bg-white py-10 lg:py-14`}>
      <div className="relative mx-auto max-w-360 px-5 sm:px-8 lg:px-12">
        {/* Heading on white */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-190">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#005AE0] sm:text-[12px]">
              <span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#0066FF] to-[#00B0FF]" />
              Industries We Serve
            </p>
            <h2 id="industries-heading" className="mt-3 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#0B1A3C] sm:text-[36px] lg:text-[40px]">
              Built for the Lines{" "}
              <span className="bg-linear-to-r from-[#0066FF] to-[#00B0FF] bg-clip-text text-transparent">That Never Stop</span>
            </h2>
            <p className="mt-3 text-[14px] leading-[1.65] text-[#52647F] sm:text-[16px]">
              Servo drive, motor and control repair for manufacturers across Canada and the USA, from automotive
              and packaging lines to steel mills, mines and aerospace plants.
            </p>
          </div>
          <Link
            href="/industries"
            className="group inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-xl bg-[#0B1A3C] px-5 text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-16px_rgba(11,26,60,0.8)] transition hover:-translate-y-0.5 hover:bg-[#0052CC] lg:self-auto"
          >
            View all industries <ArrowRight size={16} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Dark glass panel with the carousel */}
        <div className="relative mt-7 overflow-hidden rounded-[24px] border border-white/10 bg-[#050B18] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_30px_60px_-36px_rgba(0,102,255,0.7)]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <span className="absolute -left-24 -top-40 h-95 w-140 rounded-full bg-[radial-gradient(closest-side,rgba(0,102,255,0.45),transparent)] blur-2xl" />
            <span className="absolute -right-20 -top-10 h-80 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(0,176,255,0.28),transparent)] blur-2xl" />
            <span className="absolute -bottom-44 left-1/3 h-80 w-150 rounded-full bg-[radial-gradient(closest-side,rgba(64,72,255,0.22),transparent)] blur-2xl" />
          </div>
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.10)_0%,transparent_30%,transparent_70%,rgba(0,176,255,0.10)_100%)]" />

          <div className="relative flex items-center justify-between gap-3 px-5 pt-4 sm:px-7 sm:pt-5">
            <p className="flex items-center gap-2 text-[12px] font-semibold text-white/65">
              <MousePointerClick size={15} className="text-[#7FD3FF]" aria-hidden="true" />
              Drag to explore · Click an industry to open it
            </p>
            <span className="hidden shrink-0 rounded-full border border-white/15 bg-white/6 px-3.5 py-1.5 text-[12px] font-semibold text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:inline-flex">
              Canada &amp; USA
            </span>
          </div>

          <div className="relative h-65 sm:h-87.5">
            <IndustriesCarousel items={items} />
          </div>

          {/* For Google, keyboards and screen readers */}
          <ul className="sr-only">
            {items.map((i) => (
              <li key={i.key}><Link href={i.href}>{i.name} repair</Link></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
