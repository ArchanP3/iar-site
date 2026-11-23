import {
  findByPartNumber,
  getCategory as getCatalogCategory,
  getManufacturer,
  getProduct,
  getProductCount,
  getProductSlugs,
  getRelatedProducts,
  listProducts,
} from "@/lib/catalog";
import { searchProducts } from "@/lib/search";
import type { Paged, Product, ProductCard } from "@/lib/types";
import { getCategory, guessCategory, type PartCategory } from "./categories";
import { sellingOffers } from "./rules";
import { prefixes } from "./search";
import type { Part, PartList, PartQuery, PartSummary } from "./types";

/* ------------------------------------------------------------------ */
/*  Parts data for the shop and part pages, built from the Supabase    */
/*  catalog (src/lib/catalog.ts, src/lib/search.ts, both cached).       */
/*  Pages call ONLY the functions below.                                */
/* ------------------------------------------------------------------ */

export const partUrl = (slug: string) => `/parts/${slug}`;

/** "Siemens" + "6SL3120-1TE21-0AA3" -> "Siemens 6SL3120-1TE21-0AA3", without repeating a brand the part number already starts with. */
export function partLabel(p: Pick<PartSummary, "manufacturer" | "partNumber">) {
  const m = p.manufacturer.trim();
  return !m || p.partNumber.toLowerCase().startsWith(m.toLowerCase()) ? p.partNumber : `${m} ${p.partNumber}`;
}

/** Short product name: the title without brand, part number or the "Repair Service" suffix.
    Titles that are only brand + part number fall back to the part's type ("Servo Motor"). */
function partName(c: ProductCard, manufacturer: string, cat: PartCategory | undefined) {
  const t = (c.title ?? "").trim();
  let name = t.replace(/\s*repair service$/i, "").replace(c.part_number, "").trim();
  if (manufacturer && name.toLowerCase().startsWith(manufacturer.toLowerCase())) name = name.slice(manufacturer.length).trim();
  if (name) return name;
  if (/repair service$/i.test(t)) return "Repair service";
  return cat?.label ?? "Industrial automation part";
}

function toSummary(c: ProductCard): PartSummary {
  const manufacturer = c.manufacturer ?? "";
  const label = partLabel({ manufacturer, partNumber: c.part_number });
  const cat = getCategory(c.category_slug) ?? guessCategory(`${c.title ?? ""} ${c.part_number}`);
  return {
    id: c.id,
    slug: c.slug,
    manufacturer,
    manufacturerSlug: c.manufacturer_slug,
    partNumber: c.part_number,
    name: partName(c, manufacturer, cat),
    category: cat?.slug,
    image: c.image_url ? { src: c.image_url, alt: label } : undefined,
    // Cards carry no condition/availability: a price alone marks an inventory item here;
    // the part page re-checks with the full row.
    offers: sellingOffers(c),
  };
}

function toPart(p: Product): Part {
  const base = toSummary(p);
  const label = partLabel(base);
  const cat = getCategory(p.category_slug) ?? guessCategory(`${p.title ?? ""} ${p.part_number}`);
  const urls = p.images.length ? p.images : p.image_url ? [p.image_url] : [];
  const specs: Part["specs"] = [];
  if (cat) specs.push(["Product type", cat.noun.charAt(0).toUpperCase() + cat.noun.slice(1)]);
  if (p.sku && p.sku !== p.part_number) specs.push(["SKU", p.sku]);
  if (p.warranty) specs.push(["Repair warranty", p.warranty]);
  // Imported spec lines: "Series: MELSERVO HC-PQ | Power: 0.2 kW | Voltage: 120 V"
  for (const line of p.tab_specifications?.split("|") ?? []) {
    const i = line.indexOf(":");
    if (i > 0 && line.slice(i + 1).trim()) specs.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]);
  }
  return {
    ...base,
    offers: sellingOffers(p),
    category: cat?.slug,
    description: p.description ?? undefined,
    images: urls.map((src, i) => ({ src, alt: i ? `${label} photo ${i + 1}` : label, generic: p.image_source === "representative" })),
    specs,
    faults: p.tab_common_faults ?? [],
    repairProcess: p.tab_repair_process ?? [],
    faqs: p.tab_faq ?? [],
    serviceSlug: cat?.service,
    updatedAt: p.updated_at,
  };
}

export async function getPart(slug: string): Promise<Part | null> {
  const p = await getProduct(slug);
  return p ? toPart(p) : null;
}

export async function relatedParts(part: Part, limit = 4): Promise<PartSummary[]> {
  if (!part.manufacturerSlug) return [];
  return (await getRelatedProducts(part.manufacturerSlug, part.id, limit)).map(toSummary);
}

/** Search box: exact part number -> that part, otherwise none. */
export async function findPartNumber(text: string): Promise<PartSummary[]> {
  return (await findByPartNumber(text.slice(0, 200))).map(toSummary);
}

const list = (r: Paged<ProductCard>, exact: boolean): PartList => ({
  items: r.items.map(toSummary),
  total: r.total,
  page: r.page,
  pageCount: r.pageCount,
  exact,
});

/**
 * Shop listings. A search (`q`) always wins. Category and brand pages list the
 * real catalog facet when it exists, otherwise keyword-search results with
 * `exact: false` so the page can be kept out of the index.
 */
export async function listParts(query: PartQuery): Promise<PartList> {
  const page = Math.max(1, Math.min(10_000, Math.floor(query.page ?? 1)));
  const q = query.q?.trim().slice(0, 80);
  if (q) return list(await searchProducts(q, page), false);

  // Real catalog facets only; a slug without parts falls back to keyword search below.
  const [mfr, catFacet] = await Promise.all([
    query.manufacturer ? getManufacturer(query.manufacturer) : null,
    query.category ? getCatalogCategory(query.category) : null,
  ]);

  if (query.manufacturer) {
    const kw = query.category && !catFacet ? getCategory(query.category) : undefined;
    if (mfr && !kw) {
      // Brand alone, or brand + category together (shop filters): both are indexed columns.
      return list(await listProducts({ manufacturerSlug: mfr.slug, categorySlug: catFacet?.slug, page }), true);
    }
    if (mfr && kw) return list(await searchProducts(`${mfr.name} ${kw.query}`, page), false);
    return list(await searchProducts(query.manufacturerName ?? query.manufacturer.replace(/-/g, " "), page), false);
  }

  if (query.category) {
    if (catFacet) {
      return list(await listProducts({ categorySlug: query.category, page }), true);
    }
    const cat = getCategory(query.category);
    return list(cat ? await searchProducts(cat.query, page) : { items: [], total: 0, page, pageCount: 1 }, false);
  }

  return list(await listProducts({ page }), true);
}

/** Does /shop/<slug> or /shop/brands/<slug> list a real catalog facet (indexable)? */
export async function hasCategoryFacet(slug: string) {
  return Boolean(await getCatalogCategory(slug));
}
export async function hasManufacturerFacet(slug: string) {
  return Boolean(await getManufacturer(slug));
}

/** For the CMS: how many part pages exist, and their slugs in a stable order. */
export const countIndexableParts = () => getProductCount();
export async function sitemapSlugs(offset: number, limit: number) {
  return (await getProductSlugs(offset, limit)).map((r) => ({ slug: r.slug, updatedAt: r.updated_at }));
}

/** No match for the whole number? Parts whose number starts the same way (e.g. same family, other suffix). */
export async function closeMatches(text: string, limit = 4): Promise<PartSummary[]> {
  for (const p of prefixes(text)) {
    const { items } = await searchProducts(p, 1);
    if (items.length) return items.slice(0, limit).map(toSummary);
  }
  return [];
}
