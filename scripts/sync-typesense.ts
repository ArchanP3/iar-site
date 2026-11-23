/**
 * Push the Supabase products table into Typesense.
 *
 *   npm run typesense:sync            # upsert all products
 *   npm run typesense:sync -- --reset # drop and recreate the collection first
 *
 * Requires TYPESENSE_HOST + TYPESENSE_ADMIN_KEY (admin key: scripts only)
 * and SUPABASE_SECRET_KEY.
 */
import { Client } from "typesense";
import type { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";
import { createClient } from "@supabase/supabase-js";

const COLLECTION = "products";
const PAGE = 1000;

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
  "TYPESENSE_HOST",
  "TYPESENSE_ADMIN_KEY",
] as const;
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing env: ${missing.join(", ")} (see .env.example)`);
  process.exit(1);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false },
});
const typesense = new Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST!,
      port: Number(process.env.TYPESENSE_PORT || 443),
      protocol: process.env.TYPESENSE_PROTOCOL || "https",
    },
  ],
  apiKey: process.env.TYPESENSE_ADMIN_KEY!,
  connectionTimeoutSeconds: 30,
});

const schema: CollectionCreateSchema = {
  name: COLLECTION,
  fields: [
    { name: "slug", type: "string", index: false },
    { name: "part_number", type: "string", infix: true },
    { name: "title", type: "string", optional: true },
    { name: "manufacturer", type: "string", facet: true, optional: true },
    { name: "manufacturer_slug", type: "string", facet: true, optional: true },
    { name: "category", type: "string", facet: true, optional: true },
    { name: "image_url", type: "string", index: false, optional: true },
    { name: "price", type: "float", optional: true },
    { name: "currency", type: "string", index: false, optional: true },
    { name: "price_display", type: "string", index: false, optional: true },
    { name: "condition", type: "string", index: false, optional: true },
    { name: "availability", type: "string", index: false, optional: true },
    { name: "stock_qty", type: "int32", index: false, optional: true },
  ],
  token_separators: ["-", "/", "."],
};

async function ensureCollection(reset: boolean) {
  const exists = await typesense
    .collections(COLLECTION)
    .retrieve()
    .then(() => true)
    .catch(() => false);
  if (exists && reset) {
    await typesense.collections(COLLECTION).delete();
    console.log(`Dropped collection "${COLLECTION}"`);
  }
  if (!exists || reset) {
    await typesense.collections().create(schema);
    console.log(`Created collection "${COLLECTION}"`);
  }
}

async function main() {
  await ensureCollection(process.argv.includes("--reset"));
  let lastId = 0;
  let synced = 0;
  for (;;) {
    // Keyset pagination: stable and fast at 1M+ rows.
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, slug, part_number, title, manufacturer, manufacturer_slug, category, image_url, price, currency, price_display, condition, availability, stock_qty",
      )
      .gt("id", lastId)
      .order("id")
      .limit(PAGE);
    if (error) throw error;
    if (!data.length) break;
    const docs = data.map(({ id, ...rest }) => ({
      id: String(id),
      ...Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== null && v !== "")),
    }));
    const results = await typesense
      .collections(COLLECTION)
      .documents()
      .import(docs, { action: "upsert" });
    const failed = results.filter((r) => !r.success);
    if (failed.length) console.warn(`  ${failed.length} failed, e.g. ${JSON.stringify(failed[0])}`);
    synced += docs.length - failed.length;
    lastId = data[data.length - 1].id;
    console.log(`  synced ${synced}`);
  }
  console.log(`Done: ${synced} documents in "${COLLECTION}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
