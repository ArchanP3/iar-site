import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, PackageSearch, Search, Wrench } from "lucide-react";
import PartCard from "@/components/parts/PartCard";
import { PAGE_SIZE, SITE_URL } from "@/lib/site";
import { categoryUrl, getCategory, type PartCategory } from "@/lib/parts/categories";
import { closeMatches, listParts, partLabel, partUrl } from "@/lib/parts/repository";
import { brandInQuery } from "@/lib/parts/brandInQuery";
import { jsonLdString } from "@/lib/parts/seo";
import { getManufacturers } from "@/lib/catalog";
import FilterSheet from "@/components/parts/FilterSheet";
import { ActiveFilters, FilterPanel, type FilterState } from "@/components/parts/ShopFilters";

type SP = Promise<{ q?: string | string[]; page?: string | string[]; brand?: string | string[]; category?: string | string[] }>;
const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? "";

/* Shop Parts page, every /shop/<category> page and /shop/brands/<slug> share this layout.
   Header and Footer come from src/app/(catalog)/layout.tsx. */
export type ShopBrand = { slug: string; name: string };

/* `title`: the /shop list itself ("All Parts"); category and brand pages take their own name. */
export default function ShopListing({ cat, brand, title, searchParams }: { cat?: PartCategory; brand?: ShopBrand; title?: string; searchParams: SP }) {
  const base = cat ? categoryUrl(cat.slug) : brand ? `/shop/brands/${brand.slug}` : "/shop";
  const heading = cat?.name ?? (brand ? `${brand.name} Parts` : title ?? "");
  const intro = cat?.intro ?? (brand ? `New, refurbished and exchange ${brand.name} drives, motors, controls and boards, plus repair of your own ${brand.name} units.` : "");
  return (
    <div className="bg-[#F7F7F8] text-[#131316]">
      <section className="relative overflow-hidden bg-[#0A0A0C] pb-24 pt-7 text-white sm:pb-28">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-115 w-155 rounded-full bg-[radial-gradient(closest-side,rgba(200, 16, 46,0.5),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-80 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(255, 59, 85,0.22),transparent)] blur-2xl" />
        <div className="relative mx-auto max-w-310 px-4 sm:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-[12.5px] text-white/60">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true"><ChevronRight size={13} /></li>
              {heading ? (
                <>
                  <li><Link href="/shop" className="hover:text-white">Shop Parts</Link></li>
                  <li aria-hidden="true"><ChevronRight size={13} /></li>
                  <li className="text-white/85" aria-current="page">{heading}</li>
                </>
              ) : (
                <li className="text-white/85" aria-current="page">Shop Parts</li>
              )}
            </ol>
          </nav>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_460px] lg:items-end">
            <div className="max-w-180">
              <h1 className="text-[34px] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[48px]">
                {heading ? heading : <>Industrial parts. <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">Every condition.</span></>}
              </h1>
              <p className="mt-3 text-[15px] leading-[1.7] text-white/75 sm:text-[17px]">
                {intro || "New, refurbished and exchange servo drives, motors, PLCs, HMIs and CNC parts, or have your own unit repaired. Request a quote on any part."}
              </p>
            </div>
            <form action={base} method="get" role="search" className="rounded-2xl border border-white/15 bg-white/6 p-2 backdrop-blur">
              <label htmlFor="shop-q" className="sr-only">Search by part number, brand or name</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B30E29]" aria-hidden="true" />
                  <Suspense fallback={<input id="shop-q" name="q" placeholder="Part number, brand or name" className="h-14 w-full rounded-xl bg-white pl-11 pr-3 text-[16px] text-[#131316] outline-none" />}>
                    <SearchInput searchParams={searchParams} />
                  </Suspense>
                </div>
                <button type="submit" className="inline-flex h-14 shrink-0 items-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-5 text-[15px] font-semibold">Search</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="relative mx-auto -mt-16 max-w-310 px-4 pb-16 sm:px-8">
        <Suspense fallback={<GridSkeleton />}>
          <Results cat={cat} brand={brand} base={base} searchParams={searchParams} />
        </Suspense>

        <CantFind />
      </div>
    </div>
  );
}

/* "Can't find your part?" band: shop lists and the shop home page. */
export function CantFind() {
  return (
  <section aria-labelledby="cant-find" className="relative mt-12 overflow-hidden rounded-[28px] bg-[#0A0A0C] p-6 text-white sm:p-10">
    <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(200, 16, 46,0.6),transparent)] blur-xl" />
    <div className="relative grid gap-6 lg:grid-cols-[1fr_520px] lg:items-center">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF8A99]">Any part number</p>
        <h2 id="cant-find" className="mt-2 text-[26px] font-extrabold leading-tight sm:text-[34px]">Can&apos;t find your part? <span className="bg-gradient-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">Send the number.</span></h2>
        <p className="mt-2 text-[15px] leading-[1.7] text-white/70">We source new, surplus, refurbished and obsolete parts, or repair the unit you already have.</p>
      </div>
      <form action="/request-quote" method="get" className="rounded-2xl border border-white/15 bg-white/6 p-2 backdrop-blur">
        <label htmlFor="cf-part" className="sr-only">Part number</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="cf-part" name="part" required placeholder="Part or model number" className="h-14 w-full min-w-0 rounded-xl bg-white px-4 font-mono text-[16px] text-[#131316] outline-none placeholder:font-sans placeholder:text-[#696976]" />
          <button type="submit" className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-6 text-[15px] font-semibold">Get a quote <ArrowRight size={17} aria-hidden="true" /></button>
        </div>
      </form>
    </div>
  </section>
  );
}

async function SearchInput({ searchParams }: { searchParams: SP }) {
  const q = one((await searchParams).q).slice(0, 80);
  return <input id="shop-q" name="q" defaultValue={q} placeholder="Part number, brand or name" className="h-14 w-full rounded-xl bg-white pl-11 pr-3 text-[16px] text-[#131316] outline-none placeholder:text-[#696976]" />;
}

/* Quote form pre-filled from a search: brand split out when typed */
function quoteFor(q: string) {
  const { brand, rest } = brandInQuery(q);
  return `/request-quote?${new URLSearchParams({ part: rest, ...(brand ? { brand } : {}), from: "search", q })}`;
}

async function Results({ cat, brand, base, searchParams }: { cat?: PartCategory; brand?: ShopBrand; base: string; searchParams: SP }) {
  const sp = await searchParams;
  const q = one(sp.q).trim().slice(0, 80);
  const page = Math.max(1, parseInt(one(sp.page), 10) || 1);

  // Filters: the page's own category/brand, plus ?brand= / ?category= from the sidebar.
  const catSlug = cat?.slug ?? getCategory(one(sp.category))?.slug;
  const brandParam = one(sp.brand).toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 80);
  const makers = [...(await getManufacturers())].sort((a, b) => b.product_count - a.product_count);
  const brandSlug = brand?.slug ?? (brandParam || undefined);
  const brandName = brand?.name ?? makers.find((m) => m.slug === brandSlug)?.name;
  const state: FilterState = { category: catSlug, brand: brandSlug ? { slug: brandSlug, name: brandName ?? brandSlug } : undefined };
  const options = makers.slice(0, 150).map(({ slug, name }) => ({ slug, name }));
  const active = Number(Boolean(state.category)) + Number(Boolean(state.brand));

  const { items, total, pageCount: pages } = await listParts({ category: catSlug, manufacturer: brandSlug, manufacturerName: brandName, q: q || undefined, page });
  const near = !items.length && q ? await closeMatches(q, 4) : [];
  const keep = { ...(q ? { q } : {}), ...(!brand && state.brand && !q ? { brand: state.brand.slug } : {}), ...(!cat && catSlug && !q ? { category: catSlug } : {}) };
  const href = (n: number) => `${base}?${new URLSearchParams({ ...keep, ...(n > 1 || base === "/shop" ? { page: String(n) } : {}) })}`;
  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: cat ? `${cat.name} parts and repair` : brand ? `${brand.name} parts` : "Industrial automation parts",
    itemListElement: items.map((p, i) => ({ "@type": "ListItem", position: (page - 1) * PAGE_SIZE + i + 1, url: `${SITE_URL}${partUrl(p.slug)}`, name: partLabel(p) })),
  };
  const count = (
    <p className="text-[15px] text-[#696976]" aria-live="polite">
      <strong className="text-[18px] font-extrabold text-[#131316]">{total.toLocaleString("en-US")}</strong> {total === 1 ? "part" : "parts"}
      {q ? <> for <strong className="text-[#131316]">&ldquo;{q}&rdquo;</strong></> : null}
    </p>
  );

  const results = (
    <>
      {items.length ? (
        <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3">
          {items.map((p, i) => <li key={p.id}><PartCard p={p} priority={i < 4} /></li>)}
        </ul>
      ) : (
        <div className="mt-4 flex flex-col items-center rounded-[24px] border border-dashed border-[#D5D5DA] bg-white px-6 py-12 text-center">
          <PackageSearch size={36} className="text-[#B30E29]" aria-hidden="true" />
          <p className="mt-3 text-[18px] font-extrabold">Not listed yet. We can still get it.</p>
          <p className="mt-1 max-w-md text-[14px] text-[#696976]">Most parts we sell are not online yet. Send the part number and we&apos;ll reply with price, condition and lead time.</p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link href={q ? quoteFor(q) : "/request-quote"} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-5 text-[15px] font-semibold text-white">Request a quote{q ? " for this part" : ""} <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link href={`/request-repair${q ? `?part=${encodeURIComponent(q)}` : ""}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#F0DADD] bg-white px-5 text-[15px] font-semibold"><Wrench size={16} aria-hidden="true" /> Repair mine</Link>
          </div>
          {near.length > 0 && (
            <div className="mt-8 w-full text-left">
              <p className="text-center text-[12px] font-bold uppercase tracking-[0.12em] text-[#696976]">Close matches. Is one of these your part?</p>
              <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3">
                {near.map((p) => <li key={p.id}><PartCard p={p} /></li>)}
              </ul>
            </div>
          )}
        </div>
      )}
      {pages > 1 && (
        <nav aria-label="Pages" className="mt-6 flex items-center justify-center gap-2">
          {page > 1 && <Link href={href(page - 1)} className="inline-flex h-11 items-center gap-1 rounded-xl bg-white px-3 text-[14px] font-semibold ring-1 ring-[#EAEAEC]"><ChevronLeft size={16} aria-hidden="true" /> Previous</Link>}
          <span className="px-3 text-[13.5px] text-[#696976]">Page {page.toLocaleString("en-US")} of {pages.toLocaleString("en-US")}</span>
          {page < pages && <Link href={href(page + 1)} className="inline-flex h-11 items-center gap-1 rounded-xl bg-white px-3 text-[14px] font-semibold ring-1 ring-[#EAEAEC]">Next <ChevronRight size={16} aria-hidden="true" /></Link>}
        </nav>
      )}
    </>
  );

  // A search ignores the filters, so it gets the full width and a way back to browsing.
  if (q) {
    return (
      <section aria-label="Parts" className="relative">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(list) }} />
        <div className="flex flex-wrap items-center gap-3 rounded-[20px] border border-[#EAEAEC] bg-white px-4 py-3 shadow-[0_20px_45px_-38px_rgba(19, 19, 22,0.6)] sm:px-5">
          {count}
          <Link href="/shop" className="ml-auto inline-flex h-10 items-center gap-1.5 text-[13.5px] font-bold text-[#B30E29] hover:underline">Browse by category or brand <ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
        {results}
      </section>
    );
  }

  return (
    <div className="relative grid gap-5 lg:grid-cols-[272px_1fr] lg:items-start">
      <aside aria-label="Filters" className="hidden rounded-[20px] border border-[#EAEAEC] bg-white px-3 shadow-[0_20px_45px_-38px_rgba(19, 19, 22,0.6)] lg:block">
        <FilterPanel state={state} brands={options} />
      </aside>
      <section aria-label="Parts" className="min-w-0">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(list) }} />
        {/* Phones and tablets: count + Filters button stay in reach while scrolling. */}
        <div className="sticky top-18 z-30 -mx-4 border-b border-[#EAEAEC] bg-white/95 px-4 py-2.5 backdrop-blur sm:mx-0 sm:rounded-[20px] sm:border md:top-28 lg:static lg:rounded-[20px] lg:border lg:px-5 lg:py-3.5 lg:shadow-[0_20px_45px_-38px_rgba(19, 19, 22,0.6)]">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">{count}</div>
            <div className="flex w-36 lg:hidden">
              <FilterSheet active={active}><FilterPanel state={state} brands={options} /></FilterSheet>
            </div>
          </div>
          {active > 0 && <div className="mt-2.5"><ActiveFilters state={state} /></div>}
        </div>
        {results}
      </section>
    </div>
  );
}

function GridSkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:ml-[292px]" aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => <li key={i} className="h-80 animate-pulse rounded-[20px] bg-white ring-1 ring-[#EAEAEC]" />)}
    </ul>
  );
}
