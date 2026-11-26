/* ------------------------------------------------------------------ */
/*  PREVIEW BRANCH ONLY: 10 sample listings so the shop, part pages and  */
/*  cart can be seen before the parts database is connected.            */
/*  src/lib/supabase.ts uses this instead of Supabase when               */
/*  PREVIEW_NO_DB=1. Prices and stock are examples, not real offers.    */
/* ------------------------------------------------------------------ */
import type { Product } from "./types";

type Row = Record<string, unknown>;

const made = "2026-11-26T12:00:00Z";
const p = (
  id: number, part: string, title: string, mfr: string, mfrSlug: string, cat: string, catSlug: string,
  img: string, price: number | null, condition: string, stock: number | null, specs: string,
): Product => ({
  id, slug: `${mfrSlug}-${part.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, part_number: part, title, manufacturer: mfr, manufacturer_slug: mfrSlug,
  category_slug: catSlug, image_url: img, price, currency: "USD", price_display: price ? `US$${price.toLocaleString("en-US")}` : "Request a quote",
  condition, availability: price ? "https://schema.org/InStock" : null, stock_qty: stock,
  sku: part, brand: mfr, category: cat, breadcrumb: ["Shop", cat, mfr],
  description: `Sample listing for the website preview. ${title} (${part}), tested in our Grand Island, NY repair center and covered by our 1-year warranty. Price and stock shown are examples only.`,
  price_valid_until: null, rating_value: null, review_count: 0, best_rating: 5, turnaround: null, warranty: "1-year warranty",
  tab_specifications: specs, tab_common_faults: [], tab_repair_process: [], tab_faq: [], images: [img], image_source: "representative", updated_at: made,
});

export const demoProducts: Product[] = [
  p(1, "6SL3120-1TE21-0AA3", "SINAMICS S120 Single Motor Module", "Siemens", "siemens", "Servo Drives", "servo-drives", "/services/servo-drive.webp", 1450, "Refurbished", 2, "Series: SINAMICS S120 | Output current: 3 A | Voltage: 600 V DC"),
  p(2, "1FK7063-5AF71-1AA0", "1FK7 Servo Motor", "Siemens", "siemens", "Servo Motors", "servo-motors", "/products/motor-servo.webp", 1980, "New", 1, "Series: 1FK7 | Rated speed: 3,000 rpm | Encoder: Resolver"),
  p(3, "6AV2124-0GC01-0AX0", "TP700 Comfort HMI Panel", "Siemens", "siemens", "HMIs & Operator Panels", "hmis", "/services/hmi.webp", 1650, "New", 3, "Series: SIMATIC Comfort Panel | Screen: 7 in touch"),
  p(4, "2198-H015-ERS", "Kinetix 5500 Servo Drive", "Allen-Bradley", "allen-bradley", "Servo Drives", "servo-drives", "/products/servo-drives.webp", 1250, "Refurbished", 2, "Series: Kinetix 5500 | Network: EtherNet/IP"),
  p(5, "1756-L71", "ControlLogix Controller", "Allen-Bradley", "allen-bradley", "PLCs & I/O", "plcs", "/services/plc.webp", 3400, "New", 1, "Series: ControlLogix 5570 | Memory: 2 MB"),
  p(6, "MKD071B-061-KG1-KN", "MKD Servo Motor", "Rexroth Indramat", "rexroth-indramat", "Servo Motors", "servo-motors", "/products/motor-ms.webp", 890, "Refurbished", 4, "Series: MKD | Feedback: Resolver | Shaft: Keyed"),
  p(7, "DKC02.3-040-7-FW", "EcoDrive DKC Servo Drive", "Rexroth Indramat", "rexroth-indramat", "Servo Drives", "servo-drives", "/hero/servo-drives.webp", null, "Refurbished", null, "Series: EcoDrive 03 | Output current: 40 A"),
  p(8, "A06B-6114-H105", "Alpha i Servo Amplifier", "Fanuc", "fanuc", "Servo Drives", "servo-drives", "/services/servo-drive.webp", 1150, "Refurbished", 1, "Series: Alpha i SV | Axes: 1"),
  p(9, "A860-2000-T301", "Alpha i Pulse Coder Encoder", "Fanuc", "fanuc", "Encoders", "encoders", "/services/encoder.webp", null, "Refurbished", null, "Series: aiA1000 | Type: Absolute"),
  p(10, "SGMAH-04AAA41", "Sigma II Servo Motor", "Yaskawa", "yaskawa", "Servo Motors", "servo-motors", "/services/servo-motor.webp", 420, "Refurbished", 5, "Series: Sigma II | Power: 400 W | Speed: 3,000 rpm"),
];

const facets = (key: "manufacturer" | "category") => {
  const m = new Map<string, { slug: string; name: string; product_count: number }>();
  for (const r of demoProducts) {
    const slug = (key === "manufacturer" ? r.manufacturer_slug : r.category_slug) as string;
    const name = (key === "manufacturer" ? r.manufacturer : r.category) as string;
    const f = m.get(slug) ?? { slug, name, product_count: 0 };
    f.product_count++;
    m.set(slug, f);
  }
  return [...m.values()];
};

const tables: Record<string, () => Row[]> = {
  products: () => demoProducts as unknown as Row[],
  manufacturer_facets: () => facets("manufacturer"),
  category_facets: () => facets("category"),
};

const norm = (v: unknown) => String(v ?? "").toLowerCase();

/** Just enough of the Supabase query builder for the catalog reads in src/lib/catalog.ts and src/lib/search.ts. */
class Query implements PromiseLike<{ data: unknown; count: number | null; error: null }> {
  private rows: Row[];
  private one = false;
  private from = 0;
  private to = Infinity;
  private cols: string[] | null = null;
  private head = false;
  constructor(table: string) { this.rows = [...(tables[table]?.() ?? [])]; }
  select(cols?: string, opts?: { head?: boolean }) {
    if (cols && cols.trim() !== "*") this.cols = cols.split(",").map((c) => c.trim()).filter(Boolean);
    this.head = Boolean(opts?.head);
    return this;
  }
  eq(c: string, v: unknown) { this.rows = this.rows.filter((r) => r[c] === v); return this; }
  neq(c: string, v: unknown) { this.rows = this.rows.filter((r) => r[c] !== v); return this; }
  in(c: string, v: unknown[]) { this.rows = this.rows.filter((r) => v.includes(r[c])); return this; }
  ilike(c: string, v: string) { const t = norm(v).replace(/\\/g, ""); this.rows = this.rows.filter((r) => norm(r[c]) === t); return this; }
  gte(c: string, v: number) { this.rows = this.rows.filter((r) => Number(r[c]) >= v); return this; }
  lte(c: string, v: number) { this.rows = this.rows.filter((r) => Number(r[c]) <= v); return this; }
  is() { return this; }
  order(c: string, o?: { ascending?: boolean }) {
    const dir = o?.ascending === false ? -1 : 1;
    this.rows.sort((a, b) => (String(a[c]) > String(b[c]) ? dir : String(a[c]) < String(b[c]) ? -dir : 0));
    return this;
  }
  range(a: number, b: number) { this.from = a; this.to = b; return this; }
  limit(n: number) { this.to = this.from + n - 1; return this; }
  maybeSingle() { this.one = true; return this; }
  single() { this.one = true; return this; }
  then<A = { data: unknown; count: number | null; error: null }, B = never>(ok?: ((v: { data: unknown; count: number | null; error: null }) => A | PromiseLike<A>) | null, bad?: ((e: unknown) => B | PromiseLike<B>) | null) {
    const count = this.rows.length;
    let rows = this.rows.slice(this.from, this.to + 1);
    if (this.cols) rows = rows.map((r) => Object.fromEntries(this.cols!.map((c) => [c, r[c]])));
    const data = this.head ? null : this.one ? rows[0] ?? null : rows;
    return Promise.resolve({ data, count, error: null as null }).then(ok, bad);
  }
}

/** search_products: every word must appear in the part number, title, brand or category. */
function search(q: string, lim: number, off: number) {
  const words = norm(q).split(/\s+/).filter(Boolean);
  const hits = demoProducts.filter((r) => {
    const hay = norm(`${r.part_number} ${r.title} ${r.manufacturer} ${r.category} ${r.category_slug?.replace(/-/g, " ")}`);
    return words.every((w) => hay.includes(w) || hay.includes(w.replace(/s$/, "")));
  });
  return hits.slice(off, off + lim).map((r) => ({ ...r, total: hits.length }));
}

export const demoClient = {
  from: (table: string) => new Query(table),
  rpc: async (fn: string, args: { q?: string; lim?: number; off?: number }) =>
    fn === "search_products" ? { data: search(args.q ?? "", args.lim ?? 24, args.off ?? 0), error: null } : { data: true, error: null },
};
