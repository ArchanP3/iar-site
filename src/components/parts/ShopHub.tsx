import Link from "next/link";
import { ArrowRight, ChevronRight, FileText, Layers, RefreshCcw, Search } from "lucide-react";
import BrandFinder, { type BrandOption } from "@/components/parts/BrandFinder";
import { categoryIcon } from "@/components/parts/categoryIcons";
import { CantFind } from "@/components/parts/ShopListing";
import { brands as ourBrands } from "@/lib/brands";
import { getCategories, getManufacturers } from "@/lib/catalog";
import { categories, categoryUrl } from "@/lib/parts/categories";
import { listParts } from "@/lib/parts/repository";

/* /shop home: search first, then category or manufacturer. The full list sits behind "Browse all parts".
   Every number on this page comes from the catalog, so it updates after each import. */

const notes: Record<string, string> = {
  "servo-drives": "Amplifiers & drive modules",
  "servo-motors": "AC & DC servo motors",
  encoders: "Feedback & position",
  hmis: "Touch screens & keypads",
  plcs: "CPUs, cards & modules",
  "power-supplies": "Industrial power units",
  "cnc-controls": "Controllers & boards",
  legacy: "Discontinued equipment",
  sensors: "Proximity, vision & process",
  safety: "Relays, light curtains & switches",
  gearboxes: "Planetary & servo reducers",
  "pneumatics-hydraulics": "Valves, cylinders & pumps",
  other: "VFDs, cables & accessories",
};

const popular = ["6SN1123", "1FK7", "MKD", "PowerFlex", "A06B", "SGDV"];

export type HubData = {
  total: number;
  catCounts: Record<string, number>;
  topBrands: (BrandOption & { count: number })[];
  allBrands: BrandOption[];
  letters: string[];
};

export default async function ShopHub() {
  const [cats, makers, all] = await Promise.all([getCategories(), getManufacturers(), listParts({ page: 1 })]);
  const sorted = [...makers].sort((a, b) => b.product_count - a.product_count);
  const names = [...ourBrands.map((b) => b.name), ...makers.map((m) => m.name)];
  return (
    <ShopHubView
      data={{
        total: all.total,
        catCounts: Object.fromEntries(cats.map((c) => [c.slug, c.product_count])),
        topBrands: sorted.slice(0, 12).map((m) => ({ slug: m.slug, name: m.name, count: m.product_count })),
        allBrands: sorted.map(({ slug, name }) => ({ slug, name })),
        // Same letters as the /shop/brands directory, so every jump lands on a section.
        letters: [...new Set(names.map((n) => n[0]?.toUpperCase()).filter(Boolean))].sort() as string[],
      }}
    />
  );
}

const fmt = (n: number) => n.toLocaleString("en-US");

export function ShopHubView({ data }: { data: HubData }) {
  const { total, catCounts, topBrands, allBrands, letters } = data;
  return (
    <div className="bg-[#F4F7FB] text-[#0B1A3C]">
      <section className="relative overflow-hidden bg-[#050B18] pb-10 pt-7 text-white sm:pb-14">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-115 w-155 rounded-full bg-[radial-gradient(closest-side,rgba(0,102,255,0.5),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-80 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(0,176,255,0.22),transparent)] blur-2xl" />
        <div className="relative mx-auto max-w-310 px-4 sm:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-[12.5px] text-white/60">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true"><ChevronRight size={13} /></li>
              <li className="text-white/85" aria-current="page">Shop Parts</li>
            </ol>
          </nav>
          <h1 className="mt-5 max-w-200 text-[34px] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[52px]">
            Find your part <span className="bg-linear-to-r from-[#7FD3FF] to-[#00B0FF] bg-clip-text text-transparent">by number, type or brand.</span>
          </h1>
          <p className="mt-3 max-w-180 text-[15px] leading-[1.7] text-white/75 sm:text-[17px]">
            New, refurbished and exchange servo drives, motors, PLCs, HMIs and CNC parts, or have your own unit repaired. Request a quote on any part.
          </p>

          <form action="/shop" method="get" role="search" className="mt-6 max-w-215 rounded-2xl border border-white/15 bg-white/6 p-2 backdrop-blur">
            <label htmlFor="hub-q" className="sr-only">Search by part number, brand or name</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#005AE0]" aria-hidden="true" />
                <input id="hub-q" name="q" required minLength={2} placeholder="Part number, brand or name" autoComplete="off" className="h-14 w-full rounded-xl bg-white pl-11 pr-3 text-[16px] text-[#0B1A3C] outline-none placeholder:text-[#5B6B84]" />
              </div>
              <button type="submit" className="inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#0066FF] to-[#00B0FF] px-7 text-[15px] font-bold sm:h-14">Search</button>
            </div>
          </form>
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-[13px] text-white/60 [scrollbar-width:none]">
            <span className="flex-none">Popular:</span>
            {popular.map((p) => (
              <Link key={p} href={`/shop?q=${encodeURIComponent(p)}`} rel="nofollow" className="flex-none rounded-full border border-white/15 bg-white/6 px-3 py-1.5 font-semibold text-white/90 transition hover:border-[#7FD3FF] hover:text-white">{p}</Link>
            ))}
          </div>

          <ul className="mt-6 grid gap-2 sm:grid-cols-3">
            {[
              { href: "/shop?page=1", icon: Layers, title: `Browse all ${fmt(total)} parts`, text: "With category and brand filters" },
              { href: "/services/exchange", icon: RefreshCcw, title: "Exchange Program", text: "See how exchange units work" },
              { href: "/request-quote", icon: FileText, title: "Request a quote", text: "Send any part number" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="group flex h-full items-center gap-2.5 rounded-2xl border border-white/12 bg-white/5 p-3.5 transition hover:border-[#7FD3FF]/60 hover:bg-white/10">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-white/10 text-[#7FD3FF]"><l.icon size={18} aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-bold">{l.title}</span>
                    <span className="block text-[12.5px] text-white/60">{l.text}</span>
                  </span>
                  <ArrowRight size={16} className="flex-none text-white/50 transition group-hover:translate-x-0.5 group-hover:text-white" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mx-auto max-w-310 px-4 pb-16 sm:px-8">
        <section aria-labelledby="by-category" className="pt-10 sm:pt-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#005AE0]">Shop by category</p>
              <h2 id="by-category" className="mt-1.5 text-[24px] font-extrabold tracking-[-0.01em] sm:text-[30px]">What are you looking for?</h2>
            </div>
            <Link href="/shop?page=1" className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#005AE0] hover:underline">All parts with filters <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
          {/* 13 categories + "All parts" = 14: two even rows of 7 on wide screens, 7 rows of 2 on phones. */}
          <ul className="mt-5 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-7">
            {categories.map((c) => {
              const Icon = categoryIcon(c.slug);
              const n = catCounts[c.slug];
              return (
                <li key={c.slug}>
                  <Link href={categoryUrl(c.slug)} className="group flex h-full items-center gap-2.5 rounded-2xl border border-[#E3EAF3] bg-white p-3 transition hover:-translate-y-0.5 hover:border-[#0066FF]/40 hover:shadow-[0_20px_40px_-28px_rgba(0,102,255,0.6)] sm:p-4 lg:flex-col lg:items-start lg:gap-3">
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-[#0066FF]/[0.08] sm:h-11 sm:w-11 text-[#0066FF] transition group-hover:bg-[#0066FF] group-hover:text-white"><Icon size={21} aria-hidden="true" /></span>
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-extrabold leading-tight sm:text-[15px]">{c.name}</span>
                      <span className="mt-0.5 hidden text-[12.5px] leading-snug text-[#5B6B84] sm:block">{notes[c.slug]}</span>
                      {n ? <span className="mt-1 block text-[12px] font-semibold text-[#005AE0]">{fmt(n)} parts</span> : null}
                    </span>
                  </Link>
                </li>
              );
            })}
            <li>
              <Link href="/shop?page=1" className="group flex h-full items-center gap-2.5 rounded-2xl bg-[#0B1A3C] p-3 text-white transition hover:-translate-y-0.5 hover:bg-[#0052CC] sm:p-4 lg:flex-col lg:items-start lg:gap-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-white/10 text-[#7FD3FF] sm:h-11 sm:w-11"><Layers size={21} aria-hidden="true" /></span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-extrabold leading-tight sm:text-[15px]">All parts</span>
                  <span className="mt-0.5 hidden text-[12.5px] leading-snug text-white/65 sm:block">Filter by category &amp; brand</span>
                  <span className="mt-1 block text-[12px] font-semibold text-[#7FD3FF]">{fmt(total)} parts</span>
                </span>
              </Link>
            </li>
          </ul>
        </section>

        <section aria-labelledby="by-brand" className="pt-12 sm:pt-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#005AE0]">Shop by manufacturer</p>
              <h2 id="by-brand" className="mt-1.5 text-[24px] font-extrabold tracking-[-0.01em] sm:text-[30px]">Pick a brand</h2>
            </div>
            <div className="w-full sm:w-72">
              <BrandFinder brands={allBrands} prefix="/shop/brands/" placeholder="Find a manufacturer" />
            </div>
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-6">
            {topBrands.map((b) => (
              <li key={b.slug}>
                <Link href={`/shop/brands/${b.slug}`} className="group flex h-full flex-col justify-center rounded-2xl border border-[#E3EAF3] bg-white px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-[#0066FF]/40 hover:shadow-[0_20px_40px_-28px_rgba(0,102,255,0.6)]">
                  <span className="block truncate text-[15px] font-extrabold group-hover:text-[#005AE0]">{b.name}</span>
                  <span className="block text-[12.5px] text-[#5B6B84]">{fmt(b.count)} parts</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-1">
            <span className="mr-1 text-[13px] font-semibold text-[#5B6B84]">A–Z:</span>
            {letters.map((l) => (
              <Link key={l} href={`/shop/brands#letter-${l}`} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[13px] font-bold text-[#4A5B76] ring-1 ring-[#E3EAF3] transition hover:bg-[#0066FF] hover:text-white">{l}</Link>
            ))}
            <Link href="/shop/brands" className="ml-2 inline-flex h-9 items-center gap-1.5 text-[13.5px] font-bold text-[#005AE0] hover:underline">All manufacturers A–Z <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
        </section>

        <CantFind />
      </div>
    </div>
  );
}
