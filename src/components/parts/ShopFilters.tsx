import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import BrandFinder, { type BrandOption } from "@/components/parts/BrandFinder";
import { categoryIcon } from "@/components/parts/categoryIcons";
import { categories, getCategory } from "@/lib/parts/categories";

/* Shop filters: category + manufacturer. Every choice is a plain link, so filtered lists can be shared
   and work without JavaScript. One URL per combination:
     /shop?page=1                    all parts
     /shop/<category>                one category (indexed)
     /shop/brands/<brand>            one manufacturer (indexed)
     /shop/<category>?brand=<brand>  both (canonical stays /shop/<category>) */
export function shopHref(category?: string, brand?: string) {
  if (category && brand) return `/shop/${category}?brand=${encodeURIComponent(brand)}`;
  if (category) return `/shop/${category}`;
  if (brand) return `/shop/brands/${brand}`;
  return "/shop?page=1";
}

export type FilterState = { category?: string; brand?: BrandOption };

const row = "flex min-h-11 lg:min-h-9 items-center gap-2.5 rounded-xl px-2.5 text-[14px] font-semibold transition";
const on = "bg-[#C8102E]/[0.08] text-[#A50D25]";
const off = "text-[#43434C] hover:bg-[#F7F7F8] hover:text-[#B30E29]";

function Dot({ checked }: { checked: boolean }) {
  return (
    <span aria-hidden="true" className={`flex h-4.5 w-4.5 flex-none items-center justify-center rounded-full border-2 ${checked ? "border-[#C8102E]" : "border-[#C5C5CB]"}`}>
      {checked && <span className="h-2 w-2 rounded-full bg-[#C8102E]" />}
    </span>
  );
}

export function FilterPanel({ state, brands }: { state: FilterState; brands: BrandOption[] }) {
  const { category, brand } = state;
  // Selected brand first, then the biggest ones.
  const top = [...(brand ? [brand] : []), ...brands.filter((b) => b.slug !== brand?.slug)].slice(0, 8);
  const nofollow = (both: boolean) => (both ? "nofollow" : undefined);
  return (
    <div className="divide-y divide-[#F3F3F4]">
      <nav aria-label="Filter by category" className="py-4">
        <p className="mb-2 px-1 text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#696976]">Category</p>
        <ul className="grid gap-0.5">
          <li>
            <Link href={shopHref(undefined, brand?.slug)} aria-current={!category ? "true" : undefined} className={`${row} ${!category ? on : off}`}>
              <Dot checked={!category} /> All categories
            </Link>
          </li>
          {categories.map((c) => {
            const Icon = categoryIcon(c.slug);
            const checked = c.slug === category;
            return (
              <li key={c.slug}>
                <Link href={shopHref(c.slug, brand?.slug)} rel={nofollow(Boolean(brand))} aria-current={checked ? "true" : undefined} className={`${row} ${checked ? on : off}`}>
                  <Dot checked={checked} />
                  <Icon size={16} className="flex-none text-[#B30E29]" aria-hidden="true" />
                  {c.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav aria-label="Filter by manufacturer" className="py-4">
        <p className="mb-2 px-1 text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#696976]">Manufacturer</p>
        <BrandFinder brands={brands} prefix={category ? `/shop/${category}?brand=` : "/shop/brands/"} />
        <ul className="mt-2 grid gap-0.5">
          <li>
            <Link href={shopHref(category, undefined)} aria-current={!brand ? "true" : undefined} className={`${row} ${!brand ? on : off}`}>
              <Dot checked={!brand} /> All manufacturers
            </Link>
          </li>
          {top.map((b) => {
            const checked = b.slug === brand?.slug;
            return (
              <li key={b.slug}>
                <Link href={shopHref(category, b.slug)} rel={nofollow(Boolean(category))} aria-current={checked ? "true" : undefined} className={`${row} ${checked ? on : off}`}>
                  <Dot checked={checked} /> {b.name}
                </Link>
              </li>
            );
          })}
        </ul>
        <Link href="/shop/brands" className="mt-2 inline-flex min-h-11 items-center gap-1.5 px-2.5 text-[13.5px] font-bold text-[#B30E29] hover:underline">
          All manufacturers A–Z <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </nav>
    </div>
  );
}

/* "Servo Drives ×  Siemens ×  Clear all" above the results. */
export function ActiveFilters({ state }: { state: FilterState }) {
  const { category, brand } = state;
  const cat = getCategory(category);
  if (!cat && !brand) return null;
  const chip = "inline-flex h-9 items-center gap-1.5 rounded-full bg-[#131316] pl-3.5 pr-2.5 text-[13px] font-semibold text-white transition hover:bg-[#C8102E]";
  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {cat && (
        <li>
          <Link href={shopHref(undefined, brand?.slug)} className={chip} aria-label={`Remove filter: ${cat.name}`}>
            {cat.name} <X size={14} aria-hidden="true" />
          </Link>
        </li>
      )}
      {brand && (
        <li>
          <Link href={shopHref(category, undefined)} className={chip} aria-label={`Remove filter: ${brand.name}`}>
            {brand.name} <X size={14} aria-hidden="true" />
          </Link>
        </li>
      )}
      <li>
        <Link href="/shop?page=1" className="inline-flex h-9 items-center px-2 text-[13px] font-bold text-[#BE123C] hover:underline">Clear all</Link>
      </li>
    </ul>
  );
}
