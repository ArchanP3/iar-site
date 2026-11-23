/**
 * Import products (+ images) and fault codes from a sample-pack style folder.
 *
 *   npm run import -- --dir /path/to/frontend-sample-pack [--skip-images]
 *
 * Expects:
 *   <dir>/products.json                       array of product records (see SCHEMA.md)
 *   <dir>/images/*                            files referenced by product.image_filename
 *   <dir>/fault-codes/fault_codes_sample.json optional
 *
 * Idempotent: products upsert on `slug`, fault codes on `slug`, images overwrite.
 * Requires SUPABASE_SECRET_KEY (server-side only, never shipped to the browser).
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "product-images";
const BATCH_SIZE = 500;
const UPLOAD_CONCURRENCY = 4;

type SourceProduct = {
  sku?: string;
  slug: string;
  part_number: string;
  manufacturer?: string;
  brand?: string;
  category?: string;
  title?: string;
  breadcrumb?: string[];
  description?: string;
  price?: number | null;
  currency?: string;
  price_display?: string;
  condition?: string;
  availability?: string;
  price_valid_until?: string;
  rating_value?: number;
  review_count?: number;
  best_rating?: number;
  turnaround?: string[];
  warranty?: string;
  tabs?: {
    specifications?: string;
    common_faults?: unknown[];
    repair_process?: unknown[];
    faq?: unknown[];
  };
  image_filename?: string;
  images?: string[];
  source_url?: string;
};

type SourceFaultCode = {
  slug: string;
  title: string;
  description?: string;
  severity?: string;
  keywords?: string;
  symptoms?: string[];
  causes?: string[];
  repair_steps?: string[];
  affected_models?: string[];
  manufacturer?: string;
};

const args = process.argv.slice(2);
const dir = args[args.indexOf("--dir") + 1];
const skipImages = args.includes("--skip-images");
if (!args.includes("--dir") || !dir) {
  console.error("Usage: npm run import -- --dir <sample-pack-folder> [--skip-images]");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set (see .env.example).");
  process.exit(1);
}
const supabase = createClient(url, secret, { auth: { persistSession: false } });

const company = process.env.NEXT_PUBLIC_COMPANY_NAME || "AutomIQ";

// The sample data was sourced from a third-party site and names that company
// and its location. Rewrite those references to our own brand on import.
const REBRAND: [RegExp, string][] = [
  [/Synchronics Electronics Pvt\. Ltd\.,? Vadodara/g, company],
  [/Synchronics/g, company],
  [/ based in Vadodara, India/g, ""],
  [/our Vadodara facility/g, "our repair facility"],
  [/ in India/g, ""],
  // Catch-alls, incl. rows with whitespace stripped ("fromanywhereinIndia").
  [/\s?in\s?India/g, ""],
  [/our\s?Vadodara\s?facility/g, "ourrepairfacility"],
  [/,?\s?Vadodara/g, ""],
  // Confirmed company policy: 12-month warranty on repairs.
  [/\b6[- ]months? warranty/gi, "12-month warranty"],
];

const WARRANTY = "12-month warranty on all repaired units";

// FAQ entries whose claims are not confirmed company policy (dropped on import).
const UNCONFIRMED_FAQ = [/what if you cannot repair/i];

type Faq = { question: string; answer: string };

/** Keep only claims the business has confirmed. See README "Content & claims". */
function applyClaimPolicy(faq: unknown[]): Faq[] {
  return (faq as Faq[])
    .filter((f) => !UNCONFIRMED_FAQ.some((re) => re.test(f.question)))
    .map((f) => {
      if (/authori[sz]ed service cent/i.test(f.question)) {
        // Drop the unconfirmed "significantly lower costs than OEM" claim.
        return { ...f, answer: "No. We are an independent industrial electronics repair company, not affiliated with any OEM." };
      }
      if (/how long is the warranty/i.test(f.question)) {
        return {
          ...f,
          answer: "Every repaired unit carries a 12-month warranty. If the same fault recurs within the warranty period, we repair it again at no charge.",
        };
      }
      return f;
    });
}

function rebrand<T>(value: T): T {
  if (typeof value === "string") {
    return REBRAND.reduce<string>((s, [re, to]) => s.replace(re, to), value) as T;
  }
  if (Array.isArray(value)) return value.map(rebrand) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rebrand(v)])) as T;
  }
  return value;
}

function publicImageUrl(file: string) {
  return supabase.storage.from(BUCKET).getPublicUrl(file).data.publicUrl;
}

function contentType(file: string) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

async function uploadImages(files: string[]) {
  let done = 0;
  let failed = 0;
  const queue = [...files];
  async function worker() {
    for (let file = queue.shift(); file; file = queue.shift()) {
      const local = path.join(dir, "images", file);
      if (!existsSync(local)) {
        failed++;
        console.warn(`  missing image: ${local}`);
        continue;
      }
      const body = await readFile(local);
      let error: Error | null = null;
      for (let attempt = 0; attempt < 4; attempt++) {
        ({ error } = await supabase.storage.from(BUCKET).upload(file, body, {
          contentType: contentType(file),
          cacheControl: "31536000",
          upsert: true,
        }));
        if (!error) break;
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      }
      if (error) {
        failed++;
        console.warn(`  upload failed ${file}: ${error.message}`);
      }
      if (++done % 100 === 0) console.log(`  images: ${done}/${files.length}`);
    }
  }
  await Promise.all(Array.from({ length: UPLOAD_CONCURRENCY }, worker));
  console.log(`  images: ${done - failed} uploaded, ${failed} failed`);
}

/** Some source rows have whitespace stripped ("Whatifyoucannot…"): unusable. */
const isMalformed = (text: string) => !/\s/.test(text.trim());

function toRow(p: SourceProduct) {
  // Check the original text: rebranding inserts spaces into malformed strings.
  const faq = (p.tabs?.faq ?? []) as Faq[];
  const r = rebrand({ ...p, tabs: { ...p.tabs, faq: faq.filter((f) => !isMalformed(f.question)) } });
  const files = (r.images?.length ? r.images : r.image_filename ? [r.image_filename] : []).map(
    (f) => path.basename(f),
  );
  const gallery = files.map(publicImageUrl);
  return {
    slug: r.slug,
    sku: r.sku || null,
    part_number: r.part_number,
    manufacturer: r.manufacturer || r.brand || null,
    brand: r.brand || r.manufacturer || null,
    category: r.category || null,
    title: r.title || null,
    breadcrumb: r.breadcrumb ?? null,
    description: r.description || null,
    price: r.price ?? null,
    currency: r.currency || "USD",
    price_display: r.price_display || "Request Quote",
    // Sample rows are repair services, so "Refurbished" / "InStock" don't
    // apply; leave unset until real inventory data provides them.
    condition: null,
    availability: null,
    price_valid_until: r.price_valid_until || null,
    rating_value: r.rating_value ?? null,
    review_count: r.review_count ?? 0,
    best_rating: r.best_rating ?? 5,
    // Sample turnaround ("5-7 working days", "emergency service") is not
    // confirmed policy; omit until the business supplies real figures.
    turnaround: null,
    warranty: WARRANTY,
    tab_specifications: r.tabs?.specifications || null,
    tab_common_faults: r.tabs?.common_faults ?? [],
    tab_repair_process: r.tabs?.repair_process ?? [],
    tab_faq: applyClaimPolicy(r.tabs?.faq ?? []),
    image_url: gallery[0] ?? null,
    images: gallery,
    source: "sample",
    source_url: p.source_url || null, // provenance only, never rendered
    image_source: files.length ? "storage" : "none",
  };
}

async function upsertInBatches(table: string, rows: object[]) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const { error } = await supabase
      .from(table)
      .upsert(rows.slice(i, i + BATCH_SIZE), { onConflict: "slug" });
    if (error) throw new Error(`${table} batch at ${i}: ${error.message}`);
    console.log(`  ${table}: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
  }
}

async function main() {
  const products: SourceProduct[] = JSON.parse(
    await readFile(path.join(dir, "products.json"), "utf8"),
  );
  console.log(`Products: ${products.length}`);

  if (!skipImages) {
    const files = [
      ...new Set(
        products.flatMap((p) =>
          (p.images?.length ? p.images : p.image_filename ? [p.image_filename] : []).map((f) =>
            path.basename(f),
          ),
        ),
      ),
    ];
    console.log(`Uploading ${files.length} images to bucket "${BUCKET}"…`);
    await uploadImages(files);
  }

  await upsertInBatches("products", products.map(toRow));

  const faultFile = path.join(dir, "fault-codes", "fault_codes_sample.json");
  if (existsSync(faultFile)) {
    const faults: SourceFaultCode[] = JSON.parse(await readFile(faultFile, "utf8"));
    const rows = faults.map((f) => {
      const r = rebrand(f);
      return {
        slug: r.slug,
        title: r.title,
        description: r.description ?? null,
        severity: r.severity ?? null,
        keywords: r.keywords ?? null,
        symptoms: r.symptoms ?? null,
        causes: r.causes ?? null,
        repair_steps: r.repair_steps ?? null,
        affected_models: r.affected_models ?? null,
        // Titles look like "ABB AC Drive / VFD Error F0001: …"
        manufacturer: r.manufacturer ?? r.title.split(" ")[0] ?? null,
      };
    });
    console.log(`Fault codes: ${rows.length}`);
    await upsertInBatches("fault_codes", rows);
  }

  const { error } = await supabase.rpc("refresh_catalog_facets");
  if (error) throw new Error(`refresh_catalog_facets: ${error.message}`);
  console.log("Facets refreshed. Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
