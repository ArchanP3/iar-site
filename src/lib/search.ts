import { cacheLife } from "next/cache";
import { Client } from "typesense";
import { supabase } from "./supabase";
import { PAGE_SIZE } from "./site";
import type { Paged, ProductCard } from "./types";

export const TYPESENSE_COLLECTION = "products";

const typesense =
  process.env.TYPESENSE_HOST && process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_KEY
    ? new Client({
        nodes: [
          {
            host: process.env.TYPESENSE_HOST,
            port: Number(process.env.TYPESENSE_PORT || 443),
            protocol: process.env.TYPESENSE_PROTOCOL || "https",
          },
        ],
        apiKey: process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_KEY,
        connectionTimeoutSeconds: 5,
      })
    : null;

/**
 * Product search. Uses Typesense when configured (TYPESENSE_HOST +
 * NEXT_PUBLIC_TYPESENSE_SEARCH_KEY), otherwise the Postgres search_products RPC.
 */
export async function searchProducts(q: string, page = 1): Promise<Paged<ProductCard>> {
  "use cache";
  cacheLife("minutes");
  const query = q.trim().slice(0, 200);
  if (query.length < 2) return { items: [], total: 0, page, pageCount: 1 };
  return typesense ? searchTypesense(query, page) : searchPostgres(query, page);
}

async function searchPostgres(q: string, page: number): Promise<Paged<ProductCard>> {
  const { data, error } = await supabase.rpc("search_products", {
    q,
    lim: PAGE_SIZE,
    off: (page - 1) * PAGE_SIZE,
  });
  if (error) throw error;
  const rows = (data ?? []) as (ProductCard & { total?: number })[];
  const total = rows[0]?.total ?? 0;
  for (const row of rows) delete row.total;
  // search_products doesn't return the category, which names the part's type on its card.
  if (rows.length) {
    const { data: cats } = await supabase.from("products").select("id, category_slug").in("id", rows.map((r) => r.id));
    const bySlug = new Map((cats ?? []).map((c) => [c.id, c.category_slug as string | null]));
    for (const row of rows) row.category_slug = bySlug.get(row.id) ?? null;
  }
  return {
    items: rows,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

async function searchTypesense(q: string, page: number): Promise<Paged<ProductCard>> {
  const res = await typesense!
    .collections<ProductCard & { id: string }>(TYPESENSE_COLLECTION)
    .documents()
    .search({
      q,
      query_by: "part_number,manufacturer,title",
      query_by_weights: "4,2,1",
      // Substring matches on part_number (e.g. "7PF01"), like the Postgres trigram fallback.
      infix: ["fallback", "off", "off"],
      prefix: true,
      page,
      per_page: PAGE_SIZE,
    });
  const total = res.found;
  return {
    items: (res.hits ?? []).map(({ document }) => ({ ...document, id: Number(document.id) })),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
