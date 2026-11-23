import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "./supabase";
import { PAGE_SIZE, SITEMAP_CHUNK } from "./site";
import type { Facet, Paged, Product, ProductCard } from "./types";

// All catalog reads are cached ("use cache") so pages render once and are
// served from the cache. Bust with revalidateTag("catalog") after an import.

const CARD_COLUMNS =
  "id, slug, part_number, title, manufacturer, manufacturer_slug, category_slug, image_url, price, currency, price_display, condition, availability, stock_qty";

function paged<T>(items: T[], total: number, page: number): Paged<T> {
  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

function range(page: number) {
  const from = (Math.max(1, page) - 1) * PAGE_SIZE;
  return [from, from + PAGE_SIZE - 1] as const;
}

export async function getProduct(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", `product:${slug}`);
  const { data, error } = await supabase
    .from("products")
    .select(
      `${CARD_COLUMNS}, sku, brand, category, breadcrumb, description, price_valid_until, rating_value, review_count, best_rating, turnaround,
       warranty, tab_specifications, tab_common_faults, tab_repair_process, tab_faq, images, image_source, updated_at`,
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function getRelatedProducts(
  manufacturerSlug: string,
  excludeId: number,
  limit = 8,
): Promise<ProductCard[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  const { data, error } = await supabase
    .from("products")
    .select(CARD_COLUMNS)
    .eq("manufacturer_slug", manufacturerSlug)
    .neq("id", excludeId)
    .order("part_number")
    .limit(limit);
  if (error) throw error;
  return data as ProductCard[];
}

export async function listProducts(opts: {
  manufacturerSlug?: string;
  categorySlug?: string;
  page?: number;
}): Promise<Paged<ProductCard>> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  const page = opts.page ?? 1;
  const filtered = Boolean(opts.manufacturerSlug || opts.categorySlug);
  // Exact counts over an unfiltered 1M-row table are slow; estimate instead.
  let query = supabase
    .from("products")
    .select(CARD_COLUMNS, { count: filtered ? "exact" : "estimated" })
    .order("part_number")
    .range(...range(page));
  if (opts.manufacturerSlug) query = query.eq("manufacturer_slug", opts.manufacturerSlug);
  if (opts.categorySlug) query = query.eq("category_slug", opts.categorySlug);
  const { data, count, error } = await query;
  if (error) throw error;
  return paged(data as ProductCard[], count ?? 0, page);
}

/** Exact part-number match (case-insensitive). Used by the site search box. */
export async function findByPartNumber(partNumber: string, limit = 2): Promise<ProductCard[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  const exact = partNumber.trim().replace(/[\\%_]/g, (c) => `\\${c}`);
  if (!exact) return [];
  const { data, error } = await supabase.from("products").select(CARD_COLUMNS).ilike("part_number", exact).limit(limit);
  if (error) throw error;
  return data as ProductCard[];
}

/** Slugs prerendered at build time; everything else renders on first visit. */
export async function getPrerenderProductSlugs(limit = 20): Promise<string[]> {
  "use cache";
  cacheLife("days");
  const { data, error } = await supabase.from("products").select("slug").order("id").limit(limit);
  if (error) throw error;
  return data.map((r) => r.slug);
}

// --- Facets ----------------------------------------------------------------

export async function getManufacturers(): Promise<Facet[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  const { data, error } = await supabase
    .from("manufacturer_facets")
    .select("slug, name, product_count")
    .order("name");
  if (error) throw error;
  return data as Facet[];
}

export async function getManufacturer(slug: string): Promise<Facet | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  const { data, error } = await supabase
    .from("manufacturer_facets")
    .select("slug, name, product_count")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as Facet | null;
}

export async function getCategories(): Promise<Facet[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  const { data, error } = await supabase
    .from("category_facets")
    .select("slug, name, product_count")
    .order("name");
  if (error) throw error;
  return data as Facet[];
}

export async function getCategory(slug: string): Promise<Facet | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  const { data, error } = await supabase
    .from("category_facets")
    .select("slug, name, product_count")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as Facet | null;
}

// --- Sitemaps ----------------------------------------------------------------

/** Number of product sitemap files, chunked by id range. */
export async function getProductSitemapCount(): Promise<number> {
  "use cache";
  cacheLife("hours");
  const { data, error } = await supabase
    .from("products")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return Math.max(1, Math.ceil((data?.id ?? 0) / SITEMAP_CHUNK));
}

/** Number of products (CMS screens). */
export async function getProductCount(): Promise<number> {
  "use cache";
  cacheLife("hours");
  const { count, error } = await supabase.from("products").select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

/** Up to 1,000 product slugs in id order, from `offset` (the CMS site scan). */
export async function getProductSlugs(offset: number, limit: number) {
  "use cache";
  cacheLife("hours");
  const { data, error } = await supabase
    .from("products")
    .select("slug, updated_at")
    .order("id")
    .range(offset, offset + Math.min(limit, 1000) - 1);
  if (error) throw error;
  return data as { slug: string; updated_at: string }[];
}

export async function getProductSitemapChunk(chunk: number) {
  "use cache";
  cacheLife("hours");
  const rows: { slug: string; updated_at: string }[] = [];
  const start = chunk * SITEMAP_CHUNK + 1;
  const end = start + SITEMAP_CHUNK - 1;
  // PostgREST caps responses at 1,000 rows by default, so page through.
  for (let from = start; from <= end; from += 1000) {
    const { data, error } = await supabase
      .from("products")
      .select("slug, updated_at")
      .gte("id", from)
      .lte("id", Math.min(from + 999, end))
      .order("id");
    if (error) throw error;
    rows.push(...data);
  }
  return rows;
}
