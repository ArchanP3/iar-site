/**
 * Import a parts package (products.csv + images/<slug>-1.jpg) into public.products,
 * with photos on S3 + CloudFront (media.automiqautomation.com).
 *
 *   npm run import:csv -- --dir /path/to/package [--skip-images] [--dry-run]
 *
 * CSV columns: slug, part_number, manufacturer, title, description, category, sku, price,
 * currency, condition, availability, tab_specifications, tab_common_faults, tab_faq,
 * inventory_id, source (others are ignored). Empty price => quote-only.
 *
 * Images: images/<slug>-<n>.jpg is uploaded to s3://$MEDIA_BUCKET/parts/<slug>/<n>.jpg with the
 * local AWS CLI login (never the site's key). Photos are marked "representative" (catalogue
 * photo of the model), which the part page labels.
 *
 * Categories are mapped to the /shop categories (src/lib/parts/categories.ts); anything else is
 * "Other". Brand spellings are merged (MAKER). Brand/category counts are refreshed at the end.
 *
 * Idempotent: products upsert on `slug`, images overwrite.
 */
import { readFile, readdir, mkdir, link, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { categories } from "../src/lib/parts/categories";

const BATCH_SIZE = 500;
const BUCKET = process.env.MEDIA_BUCKET || "automiqautomation-media";
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL || "https://media.automiqautomation.com";

const args = process.argv.slice(2);
const dir = args[args.indexOf("--dir") + 1];
const skipImages = args.includes("--skip-images");
const dryRun = args.includes("--dry-run");
if (!args.includes("--dir") || !dir) {
  console.error("Usage: npm run import:csv -- --dir <package-folder> [--skip-images] [--dry-run]");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set (see .env.example).");
  process.exit(1);
}
const supabase = createClient(url, secret, { auth: { persistSession: false } });

/** RFC 4180 CSV: quoted fields may hold commas, quotes ("") and line breaks. */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  const keys = head.map((h) => h.replace(/^﻿/, "").trim());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i] ?? ""])));
}

const json = (s: string) => {
  try { const v = JSON.parse(s || "[]"); return Array.isArray(v) ? v : []; } catch { return []; }
};

const usdDisplay = (n: number) => `US$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Prices this low on industrial parts are data errors: import those rows as quote-only. */
const MIN_PRICE = 5;

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Package category -> text whose slug (category_slug) is a /shop category. Unknown -> "Other". */
const CATEGORY: Record<string, string> = {
  "HMIs & Operator Panels": "HMIs",
  "PLCs & I/O": "PLCs",
  "AC/DC & Spindle Motors": "Servo Motors",
};
const siteCategory = (c: string) => {
  const text = CATEGORY[c] ?? c;
  return categories.some((k) => k.slug === slugify(text)) ? text : "Other";
};

/** One spelling per brand, whose slug matches its /shop/brands/<slug> page (src/lib/brands.ts). */
const MAKER: Record<string, string> = {
  "Allen Bradley": "Allen-Bradley",
  "Mitsubishi Electric": "Mitsubishi",
  "Yaskawa Electric": "Yaskawa",
  "Schneider Electric": "Schneider",
  "Asea Brown Boveri": "ABB",
};

function toRow(r: Record<string, string>, photos: number) {
  const n = Number(r.price);
  const price = r.price.trim() && Number.isFinite(n) && n >= MIN_PRICE ? n : null;
  const gallery = Array.from({ length: photos }, (_, i) => `${MEDIA_URL}/parts/${r.slug}/${i + 1}.jpg`);
  const maker = MAKER[r.manufacturer] ?? r.manufacturer;
  return {
    slug: r.slug,
    sku: r.sku || null,
    part_number: r.part_number,
    manufacturer: maker || null,
    brand: maker || null,
    category: r.category ? siteCategory(r.category) : null,
    title: r.title || null,
    description: r.description || null,
    price,
    currency: r.currency || "USD",
    price_display: price === null ? "Request Quote" : usdDisplay(price),
    condition: r.condition || null,
    availability: r.availability || null,
    tab_specifications: r.tab_specifications || null,
    tab_common_faults: json(r.tab_common_faults),
    tab_faq: json(r.tab_faq),
    image_url: gallery[0] ?? null,
    images: gallery,
    image_source: gallery.length ? "representative" : "none",
    source: r.source || null,
    inventory_id: r.inventory_id ? Number(r.inventory_id) : null,
  };
}

async function main() {
  const rows = parseCsv(await readFile(path.join(dir, "products.csv"), "utf8"));
  const bad = rows.filter((r) => !/^[a-z0-9-]+$/.test(r.slug) || !r.part_number);
  if (bad.length) throw new Error(`${bad.length} rows with a bad slug or no part number, e.g. ${JSON.stringify(bad[0]).slice(0, 200)}`);

  // images/<slug>-<n>.jpg -> how many photos each slug has
  const files = (await readdir(path.join(dir, "images"))).filter((f) => /\.jpe?g$/i.test(f));
  const count = new Map<string, number>();
  for (const f of files) {
    const m = f.match(/^(.+)-(\d+)\.jpe?g$/i);
    if (m) count.set(m[1], Math.max(count.get(m[1]) ?? 0, Number(m[2])));
  }
  const products = rows.map((r) => toRow(r, count.get(r.slug) ?? 0));
  const quoteOnly = products.filter((p) => p.price === null).length;
  const byCategory = new Map<string, number>();
  for (const p of products) byCategory.set(p.category ?? "(none)", (byCategory.get(p.category ?? "(none)") ?? 0) + 1);
  const lowPriced = rows.filter((r) => r.price.trim() && Number(r.price) < MIN_PRICE).map((r) => `${r.slug} (${r.price})`);
  console.log(`Products: ${products.length} (${products.length - quoteOnly} priced, ${quoteOnly} quote-only), photos: ${files.length}`);
  console.log(`  Categories: ${[...byCategory].map(([c, n]) => `${c} ${n}`).join(", ")}`);
  if (lowPriced.length) console.log(`  Price under $${MIN_PRICE}, imported as quote-only: ${lowPriced.join(", ")}`);
  if (dryRun) { console.log(JSON.stringify(products[0], null, 2)); return; }

  if (!skipImages) {
    // Lay files out as parts/<slug>/<n>.jpg (hard links, no copying), then sync.
    const stage = path.join(tmpdir(), `aq-media-${process.pid}`);
    await rm(stage, { recursive: true, force: true });
    for (const f of files) {
      const m = f.match(/^(.+)-(\d+)\.jpe?g$/i);
      if (!m) continue;
      await mkdir(path.join(stage, "parts", m[1]), { recursive: true });
      await link(path.join(dir, "images", f), path.join(stage, "parts", m[1], `${m[2]}.jpg`));
    }
    console.log(`Uploading ${files.length} photos to s3://${BUCKET}/parts …`);
    execFileSync("aws", ["s3", "sync", path.join(stage, "parts"), `s3://${BUCKET}/parts`, "--only-show-errors",
      "--content-type", "image/jpeg", "--cache-control", "public, max-age=604800"], { stdio: "inherit" });
    await rm(stage, { recursive: true, force: true });
  }

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const { error } = await supabase.from("products").upsert(products.slice(i, i + BATCH_SIZE), { onConflict: "slug" });
    if (error) throw new Error(`products batch at ${i}: ${error.message}`);
    console.log(`  products: ${Math.min(i + BATCH_SIZE, products.length)}/${products.length}`);
  }
  const { error } = await supabase.rpc("refresh_catalog_facets");
  if (error) throw new Error(`refresh_catalog_facets: ${error.message}`);
  console.log("Done (brand and category counts refreshed). Part pages refresh within the hour (or redeploy).");
}

main().catch((e) => { console.error(e); process.exit(1); });
