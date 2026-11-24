import Link from "next/link";
import { ArrowRight, MousePointerClick } from "lucide-react";
import { brandFont } from "@/lib/font";
import { industries as all, industryUrl } from "@/lib/industries";
import IndustriesPicker from "./IndustriesPicker";

/* Card photos live in public/industries/<slug>.jpg (600x760, title on the photo).
   An industry shows in the carousel once its card file exists in this list. */
const withCard = new Set([
  "automotive", "packaging", "plastics", "food-beverage", "metalworking", "printing", "pharmaceutical", "material-handling",
  "steel-metals", "pulp-paper", "tire-rubber", "aerospace", "electronics", "water-wastewater", "mining", "oil-gas", "glass", "textiles", "machine-builders",
]);
const items = all.filter((i) => withCard.has(i.slug) && i.image).map((i) => ({
  key: i.slug, name: i.name, short: i.short, href: industryUrl(i.slug), image: i.image, zoom: i.zoom, equipment: i.equipment,
}));

export default function Industries() {
  return (
    <section id="industries" aria-labelledby="industries-heading" className={`${brandFont.className} bg-white py-10 lg:py-14`}>
      <div className="relative mx-auto max-w-360 px-5 sm:px-8 lg:px-12">
        {/* Heading on white */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-190">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B30E29] sm:text-[12px]">
              <span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#C8102E] to-[#FF3B55]" />
              Industries We Serve
            </p>
            <h2 id="industries-heading" className="mt-3 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#131316] sm:text-[36px] lg:text-[40px]">
              Built for the Lines{" "}
              <span className="bg-linear-to-r from-[#C8102E] to-[#FF3B55] bg-clip-text text-transparent">That Never Stop</span>
            </h2>
            <p className="mt-3 text-[14px] leading-[1.65] text-[#62626F] sm:text-[16px]">
              Servo drive, motor and control repair for manufacturers across Canada and the USA, from automotive
              and packaging lines to steel mills, mines and aerospace plants.
            </p>
          </div>
          <Link
            href="/industries"
            className="group inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-xl bg-[#131316] px-5 text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-16px_rgba(19,19,22,0.8)] transition hover:-translate-y-0.5 hover:bg-[#A50D25] lg:self-auto"
          >
            View all industries <ArrowRight size={16} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Dark glass panel with the carousel */}
        <div className="relative mt-7 overflow-hidden rounded-[24px] border border-white/10 bg-[#0A0A0C] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_30px_60px_-36px_rgba(200,16,46,0.7)]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <span className="absolute -left-24 -top-40 h-95 w-140 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.45),transparent)] blur-2xl" />
            <span className="absolute -right-20 -top-10 h-80 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(255,59,85,0.28),transparent)] blur-2xl" />
            <span className="absolute -bottom-44 left-1/3 h-80 w-150 rounded-full bg-[radial-gradient(closest-side,rgba(245,74,99,0.22),transparent)] blur-2xl" />
          </div>
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.10)_0%,transparent_30%,transparent_70%,rgba(255,59,85,0.10)_100%)]" />

          <div className="relative flex items-center justify-between gap-3 px-5 pt-4 sm:px-7 sm:pt-5">
            <p className="flex items-center gap-2 text-[12px] font-semibold text-white/65">
              <MousePointerClick size={15} className="text-[#FF8A99]" aria-hidden="true" />
              Pick an industry to see what we repair
            </p>
            <span className="hidden shrink-0 rounded-full border border-white/15 bg-white/6 px-3.5 py-1.5 text-[12px] font-semibold text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:inline-flex">
              Canada &amp; USA
            </span>
          </div>

          <div className="relative">
            <IndustriesPicker items={items} />
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
