import "server-only";
import { one, q } from "./db";
import { logActivity } from "./activity";
import { updateTag } from "./cache";
import { usd } from "@/lib/parts/rules";
import { categories, getCategory } from "@/lib/parts/categories";
import { BULK_MAX, BULK_MIN_PRICE, nextPrice, opError, type PriceOp } from "@/lib/parts/bulkPrice";
import type { User } from "./auth";

/* ------------------------------------------------------------------ */
/*  Parts Catalog editor: reads and writes public.products as cms_app   */
/*  (supabase/migrations/20261120120000_cms_products_editor.sql).       */
/*  Every field edited here is added to cms_locked, so the CSV and      */
/*  catalog imports leave it alone (enforced by a database trigger).    */
/*  Every change is logged in cms_activity with before/after and can be */
/*  undone, and refreshes the "catalog" cache on .com and .ca.          */
/* ------------------------------------------------------------------ */

/** Fields the database accepts in cms_locked (same list as the migration's check). */
export const LOCKABLE = [
  "price", "price_display", "currency", "condition", "availability", "stock_qty", "warranty",
  "category", "manufacturer", "brand", "sku", "title", "description", "ebay_item_id",
  "image_url", "images", "image_source",
  "tab_specifications", "tab_common_faults", "tab_repair_process", "tab_faq",
] as const;
export type Lockable = (typeof LOCKABLE)[number];

/** Fields the editor can change in this version. */
export const EDITABLE = ["title", "description", "sku", "price", "condition", "availability", "stock_qty", "warranty", "ebay_item_id", "tab_specifications", "category"] as const;
export type Editable = (typeof EDITABLE)[number];

export const FIELD_LABEL: Record<string, string> = {
  title: "Title", description: "Description", sku: "SKU", price: "Price", price_display: "Price label", condition: "Condition",
  availability: "Availability", stock_qty: "Stock", warranty: "Warranty", ebay_item_id: "eBay item ID", tab_specifications: "Specifications",
  category: "Category", manufacturer: "Manufacturer", brand: "Brand", currency: "Currency", image_url: "Main photo", images: "Photos",
  image_source: "Photo type", tab_common_faults: "Common faults", tab_repair_process: "Repair process", tab_faq: "FAQ",
};

/** Same rule as the CSV import: prices this low on industrial parts are data errors. */
export const MIN_PRICE = 5;

export type ProductRow = {
  id: number;
  slug: string;
  part_number: string;
  manufacturer: string | null;
  category: string | null;
  category_slug: string | null;
  title: string | null;
  description: string | null;
  sku: string | null;
  price: string | null; // numeric comes back as text
  price_display: string;
  currency: string;
  condition: string | null;
  availability: string | null;
  stock_qty: number | null;
  warranty: string | null;
  ebay_item_id: string | null;
  tab_specifications: string | null;
  image_url: string | null;
  status: "published" | "draft" | "hidden";
  cms_locked: string[];
  updated_at: Date;
};

const COLS =
  "id, slug, part_number, manufacturer, category, category_slug, title, description, sku, price, price_display, currency, condition, availability, stock_qty, warranty, ebay_item_id, tab_specifications, image_url, status, cms_locked, updated_at";

export const PAGE_SIZE = 50;

/* ---------------------------------------------------------------- */
/*  Categories                                                        */
/* ---------------------------------------------------------------- */

/** Same as the database's public.slugify (category_slug is generated from category with it). */
export const slugify = (v: string | null | undefined) => (v ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Text stored for each shop category when nothing in the catalog uses it yet. Its slug is the
    category's slug, which is what the shop pages, filters and counts read. */
const CATEGORY_TEXT: Record<string, string> = { hmis: "HMIs", plcs: "PLCs", legacy: "Legacy", safety: "Safety", other: "Other" };

/** The category text to save for a shop category: the spelling the catalog already uses for that
    slug (so imported and CMS-set listings match), or a default whose slug is the category's slug. */
export async function categoryText(slug: string): Promise<string> {
  const c = getCategory(slug);
  if (!c) throw new Error("Unknown category.");
  const row = await one<{ category: string }>(`SELECT category FROM public.products WHERE category_slug = $1 LIMIT 1`, [slug]);
  const text = row?.category ?? CATEGORY_TEXT[slug] ?? c.name;
  if (slugify(text) !== slug) throw new Error("Category name doesn't match its page.");
  return text;
}

/** Shop and brand counts (materialized views) are rebuilt after a category change. A failure
    here never undoes the change: the counts catch up on the next refresh. */
async function refreshFacets() {
  await q(`SELECT public.refresh_catalog_facets()`).catch(() => undefined);
}

/* ---------------------------------------------------------------- */
/*  List                                                              */
/* ---------------------------------------------------------------- */

export type ListFilter = { q?: string; page: number; cat?: string; low?: boolean; edited?: boolean; mins?: Record<string, number> };

/** Valid per-category minimums, as [slug, min] pairs. */
const minPairs = (mins: Record<string, number> | undefined) =>
  Object.entries(mins ?? {}).filter(([slug, n]) => getCategory(slug) && Number.isFinite(n) && n > 0);

/** WHERE clause and params for the list filters. */
function where(f: ListFilter) {
  const params: unknown[] = [];
  const parts: string[] = [];
  const t = (f.q ?? "").trim().slice(0, 80);
  if (t) {
    const like = t.replace(/[\\%_]/g, (c) => "\\" + c);
    params.push(`%${like}%`, t);
    parts.push(`(p.part_number ILIKE $${params.length - 1} OR p.search @@ websearch_to_tsquery('simple', $${params.length}))`);
  }
  if (f.cat === "none") parts.push(`p.category_slug IS NULL`);
  else if (f.cat && getCategory(f.cat)) {
    params.push(f.cat);
    parts.push(`p.category_slug = $${params.length}`);
  }
  if (f.edited) parts.push(`cardinality(p.cms_locked) > 0`);
  let join = "";
  if (f.low) {
    const pairs = minPairs(f.mins);
    if (!pairs.length) parts.push("FALSE");
    else {
      params.push(pairs.map(([s]) => s), pairs.map(([, n]) => n));
      join = `JOIN unnest($${params.length - 1}::text[], $${params.length}::numeric[]) AS m(slug, min) ON m.slug = p.category_slug`;
      parts.push(`p.price IS NOT NULL AND p.price < m.min`);
    }
  }
  return { join, sql: parts.length ? `WHERE ${parts.join(" AND ")}` : "", params, text: t };
}

/** One page of products for the CMS list, any status. Part number matches first; the Low price
    filter lists the cheapest first. */
export async function listProducts(f: ListFilter) {
  const off = (Math.max(1, f.page) - 1) * PAGE_SIZE;
  const w = where(f);
  const params = [...w.params];
  let order = "p.part_number";
  if (f.low) order = "p.price, p.part_number";
  else if (w.text) {
    params.push(`${w.text.replace(/[\\%_]/g, (c) => "\\" + c)}%`);
    order = `(p.part_number ILIKE $${params.length}) DESC, p.part_number`;
  }
  params.push(PAGE_SIZE + 1, off);
  const rows = await q<ProductRow>(
    `SELECT ${COLS.split(", ").map((c) => `p.${c}`).join(", ")} FROM public.products p ${w.join} ${w.sql}
     ORDER BY ${order} LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return { items: rows.slice(0, PAGE_SIZE), hasNext: rows.length > PAGE_SIZE };
}

/** How many listings have fields edited (locked) in the CMS. */
export async function countEdited(): Promise<number> {
  const row = await one<{ n: string }>(`SELECT count(*) AS n FROM public.products WHERE cardinality(cms_locked) > 0`);
  return Number(row?.n ?? 0);
}

/** How many listings are under their category's minimum price (the "Low price" filter count). */
export async function countLowPrice(mins: Record<string, number>): Promise<number> {
  if (!minPairs(mins).length) return 0;
  const w = where({ page: 1, low: true, mins });
  const row = await one<{ n: string }>(`SELECT count(*) AS n FROM public.products p ${w.join} ${w.sql}`, w.params);
  return Number(row?.n ?? 0);
}

export const getProductRow = (id: number) => one<ProductRow>(`SELECT ${COLS} FROM public.products WHERE id = $1`, [id]);

/* ---------------------------------------------------------------- */
/*  Reading form values                                               */
/* ---------------------------------------------------------------- */

type Value = string | number | null;
/** Line breaks as \n and no outer spaces; "" = empty. Never shortens the text. */
const clean = (v: unknown) => String(v ?? "").replace(/\r\n?/g, "\n").trim();

/** Spec lines as stored ("Series: 1FK7 | Rated torque: 11 Nm"): split on | or new lines, trimmed, empties dropped. */
const specLines = (v: unknown) => String(v ?? "").split(/\r\n?|\n|\|/).map((l) => l.trim()).filter(Boolean);

/** Longest value each text field accepts. Longer values are rejected, never cut. */
const MAX_LEN: Partial<Record<Editable, number>> = { title: 200, sku: 120, warranty: 200, ebay_item_id: 40, condition: 60, availability: 60, description: 8000, tab_specifications: 8000 };

/** Parses "1,850.00" / "$1850" / "" into a price; "" = quote only. */
export function parsePrice(raw: string): { price: number | null } | { error: string } {
  const s = raw.replace(/[\s$,]|US/gi, "");
  if (!s) return { price: null };
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return { error: "Enter the price as a number, like 1850 or 1850.00. Leave it empty for Request Quote." };
  const n = Number(s);
  if (n < MIN_PRICE) return { error: `Prices under US$${MIN_PRICE} are treated as mistakes. Leave it empty for Request Quote.` };
  if (n > 10_000_000) return { error: "That price is too high." };
  return { price: n };
}

/** The editable values from the edit form, cleaned. */
export function readForm(fd: FormData): { values: Partial<Record<Editable, Value>> } | { error: string } {
  const values: Partial<Record<Editable, Value>> = {};
  for (const f of EDITABLE) {
    if (!fd.has(f)) continue;
    const v = fd.get(f);
    if (f === "price") {
      const p = parsePrice(String(v ?? ""));
      if ("error" in p) return p;
      values.price = p.price;
    } else if (f === "stock_qty") {
      const s = String(v ?? "").trim();
      if (s && !/^\d{1,6}$/.test(s)) return { error: "Stock must be a whole number, or empty if it isn't tracked." };
      values.stock_qty = s ? Number(s) : null;
    } else if (f === "category") {
      // The form sends a shop category slug; "" = no category. A listing imported with a category
      // that isn't a shop category sends its own slug back unchanged, so it still saves; only a
      // real change has to be a shop category (checked in saveProduct).
      const slug = String(v ?? "").trim();
      if (slug && !/^[a-z0-9-]{1,80}$/.test(slug)) return { error: "Pick a category from the list." };
      values.category = slug || null;
    } else if (f === "tab_specifications") {
      // Stored as "Series: 1FK7 | Rated torque: 11 Nm" (the part page splits on |).
      values.tab_specifications = specLines(v).join(" | ") || null;
    } else {
      const t = clean(v);
      if (f === "title" && !t) return { error: "The title can't be empty." };
      values[f] = t || null;
    }
  }
  return { values };
}

/* ---------------------------------------------------------------- */
/*  Saving                                                            */
/* ---------------------------------------------------------------- */

const same = (a: unknown, b: unknown) => (a == null && b == null) || (a != null && b != null && String(a) === String(b));

/** Compares a stored value with a form value the way the form shows them, so a field the user
    didn't touch never counts as changed (CRLF vs LF, outer spaces, spec separators). */
function unchanged(f: Editable, stored: unknown, next: Value): boolean {
  if (f === "price" || f === "stock_qty") return same(stored == null ? null : Number(stored), next);
  if (f === "category") return (slugify(stored as string | null) || null) === (next || null);
  if (f === "tab_specifications") return specLines(stored).join("\n") === specLines(next).join("\n");
  return clean(stored) === clean(next);
}
const num = (v: unknown) => (v == null ? null : Number(v));

/** Saves the changed fields, locks them against imports, logs the change and refreshes both sites.
    Returns the names of the fields that changed. */
export async function saveProduct(user: Pick<User, "name">, id: number, values: Partial<Record<Editable, Value>>): Promise<string[]> {
  const cur = await getProductRow(id);
  if (!cur) throw new Error("This product doesn't exist any more.");
  const set: Record<string, Value> = {};
  for (const [f, v] of Object.entries(values) as [Editable, Value][]) {
    if (!unchanged(f, cur[f], v)) set[f] = v;
  }
  // Length is checked only on fields that changed, so an imported value that is already long
  // never blocks saving another field. Too long is rejected, never cut.
  for (const f of Object.keys(set) as Editable[]) {
    const max = MAX_LEN[f];
    const len = typeof set[f] === "string" ? (set[f] as string).length : 0;
    if (max && len > max) throw new Error(`${FIELD_LABEL[f] ?? f} is too long (${len.toLocaleString()} characters, the limit is ${max.toLocaleString()}).`);
  }
  if ("price" in set) set.price_display = set.price == null ? "Request Quote" : usd(Number(set.price));
  if ("category" in set && set.category != null) {
    if (!getCategory(String(set.category))) throw new Error("Pick a category from the list.");
    set.category = await categoryText(String(set.category));
  }
  const changed = Object.keys(set);
  if (!changed.length) return [];

  const locked = [...new Set([...cur.cms_locked, ...changed])].filter((f) => (LOCKABLE as readonly string[]).includes(f));
  const cols = [...changed, "cms_locked"];
  const params = [...changed.map((f) => set[f]), locked];
  try {
    await q(`UPDATE public.products SET ${cols.map((c, i) => `${ident(c)} = $${i + 1}`).join(", ")} WHERE id = $${cols.length + 1}`, [...params, id]);
  } catch (e) {
    if ((e as { code?: string }).code === "23505") throw new Error("Another product already uses that SKU.");
    throw e;
  }

  const before: Record<string, unknown> = { id, cms_locked: cur.cms_locked };
  const after: Record<string, unknown> = { id, cms_locked: locked };
  for (const f of changed) {
    before[f] = f === "price" ? num(cur.price) : cur[f as keyof ProductRow];
    after[f] = set[f];
  }
  const what = changed.includes("price") && changed.length <= 2 ? `changed the price of` : changed.length === 1 && changed[0] === "category" ? "changed the category of" : `edited`;
  const detail = changed.includes("price") ? ` (${cur.price_display} → ${set.price_display})` : ` (${changed.filter((f) => f !== "price_display").map((f) => FIELD_LABEL[f] ?? f).join(", ")})`;
  await logActivity(user, { action: what, target: `${cur.manufacturer ?? ""} ${cur.part_number}`.trim() + detail, kind: "product", ref: String(id), before, after });
  if (changed.includes("category")) await refreshFacets();
  updateTag("catalog");
  return changed;
}

/** Lets the imports update this field again. */
export async function unlockField(user: Pick<User, "name">, id: number, field: string) {
  if (!(LOCKABLE as readonly string[]).includes(field)) throw new Error("Unknown field.");
  const cur = await getProductRow(id);
  if (!cur) throw new Error("This product doesn't exist any more.");
  // Price and its label always go together.
  const drop = field === "price" || field === "price_display" ? ["price", "price_display"] : [field];
  const next = cur.cms_locked.filter((f) => !drop.includes(f));
  if (next.length === cur.cms_locked.length) return;
  await q(`UPDATE public.products SET cms_locked = $1 WHERE id = $2`, [next, id]);
  await logActivity(user, {
    action: "unlocked",
    target: `${FIELD_LABEL[field] ?? field} on ${`${cur.manufacturer ?? ""} ${cur.part_number}`.trim()} (imports can update it again)`,
    kind: "product",
    ref: String(id),
    before: { id, cms_locked: cur.cms_locked },
    after: { id, cms_locked: next },
  });
}

/* ---------------------------------------------------------------- */
/*  Undo (called from undo.ts)                                        */
/* ---------------------------------------------------------------- */

const RESTORABLE = new Set<string>([...LOCKABLE, "cms_locked", "status"]);
const JSON_COLS = new Set(["images", "tab_common_faults", "tab_repair_process", "tab_faq"]);

function ident(c: string) {
  if (!RESTORABLE.has(c)) throw new Error("bad column");
  return c;
}

/** Puts back the fields a logged product change replaced. Locks are undone the same way:
    locks that change added are removed, locks it removed come back, and locks added
    by later changes stay. */
export async function restoreProduct(before: Record<string, unknown>, after: Record<string, unknown> | null, opts?: { batch?: boolean }) {
  const id = Number(before.id);
  if (!id) throw new Error("Nothing to restore.");
  const cur = await getProductRow(id);
  if (!cur) throw new Error("This product doesn't exist any more.");
  const set: Record<string, unknown> = {};
  for (const c of Object.keys(before)) if (c !== "id" && c !== "cms_locked") set[ident(c)] = JSON_COLS.has(c) ? JSON.stringify(before[c]) : before[c];
  if (Array.isArray(before.cms_locked)) {
    const was = new Set(before.cms_locked as string[]);
    const now = new Set(Array.isArray(after?.cms_locked) ? (after.cms_locked as string[]) : cur.cms_locked);
    const added = [...now].filter((f) => !was.has(f));
    const removed = [...was].filter((f) => !now.has(f));
    set.cms_locked = [...new Set([...cur.cms_locked.filter((f) => !added.includes(f)), ...removed])];
  }
  const cols = Object.keys(set);
  if (!cols.length) return;
  try {
    await q(`UPDATE public.products SET ${cols.map((c, i) => `${c} = $${i + 1}`).join(", ")} WHERE id = $${cols.length + 1}`, [...cols.map((c) => set[c]), id]);
  } catch (e) {
    if ((e as { code?: string }).code === "23505")
      throw new Error(`Another product now uses the SKU “${String(before.sku ?? "")}”. Change that product's SKU first, then undo this.`);
    throw e;
  }
  if (!opts?.batch) {
    if ("category" in before) await refreshFacets();
    updateTag("catalog");
  }
}

/** Undo for a bulk change: puts every listing back, then refreshes counts and both sites once. */
export async function restoreProducts(before: { items?: unknown }, after: { items?: unknown } | null) {
  const items = Array.isArray(before.items) ? (before.items as Record<string, unknown>[]) : [];
  if (!items.length) throw new Error("Nothing to restore.");
  const later = new Map((Array.isArray(after?.items) ? (after.items as Record<string, unknown>[]) : []).map((a) => [Number(a.id), a]));
  // Every listing is tried, even if one fails, so a bad row never leaves the rest half undone.
  let missing = 0;
  const failed: string[] = [];
  for (const b of items) {
    try {
      await restoreProduct(b, later.get(Number(b.id)) ?? null, { batch: true });
    } catch (e) {
      if ((e as Error).message === "This product doesn't exist any more.") missing++;
      else failed.push(String(b.id));
    }
  }
  if (items.some((b) => "category" in b)) await refreshFacets();
  updateTag("catalog");
  if (failed.length === items.length) throw new Error("Nothing could be put back. Try again in a minute.");
  return { restored: items.length - missing - failed.length, missing, failed: failed.length };
}

/* ---------------------------------------------------------------- */
/*  Bulk changes (one page of the list at a time)                     */
/* ---------------------------------------------------------------- */

const label = (r: Pick<ProductRow, "manufacturer" | "part_number">) => `${r.manufacturer ?? ""} ${r.part_number}`.trim();

function checkIds(ids: number[]) {
  const clean = [...new Set(ids.map(Number).filter((n) => Number.isInteger(n) && n > 0))];
  if (!clean.length) throw new Error("Tick at least one listing.");
  if (clean.length > BULK_MAX) throw new Error(`Change up to ${BULK_MAX} listings at a time.`);
  return clean;
}

/** Changes the price of many listings with one rule, locks price against imports, and logs it
    as one change that Undo puts back in one click. */
export async function bulkPrice(user: Pick<User, "name">, ids: number[], op: PriceOp) {
  const err = opError(op);
  if (err) throw new Error(err);
  const rows = await q<ProductRow>(`SELECT ${COLS} FROM public.products WHERE id = ANY($1::bigint[]) ORDER BY part_number`, [checkIds(ids)]);
  if (!rows.length) throw new Error("Those listings don't exist any more.");
  const changes: { row: ProductRow; price: number | null }[] = [];
  const tooLow: string[] = [];
  for (const r of rows) {
    const n = nextPrice(r.price == null ? null : Number(r.price), op);
    if (n === undefined || same(r.price == null ? null : Number(r.price), n)) continue;
    if (n != null && n < BULK_MIN_PRICE) tooLow.push(r.part_number);
    changes.push({ row: r, price: n });
  }
  if (tooLow.length)
    throw new Error(`${tooLow.length} listing${tooLow.length > 1 ? "s" : ""} would go under US$${BULK_MIN_PRICE} (${tooLow.slice(0, 3).join(", ")}${tooLow.length > 3 ? "…" : ""}). Untick ${tooLow.length > 1 ? "them" : "it"} or use a smaller change.`);
  if (!changes.length) return { changed: 0, skipped: rows.length };

  const lock = (cur: string[]) => [...new Set([...cur, "price", "price_display"])];
  await q(
    `UPDATE public.products p SET price = t.price, price_display = t.display, cms_locked = string_to_array(t.locked_csv, ',')
     FROM unnest($1::bigint[], $2::numeric[], $3::text[], $4::text[]) AS t(id, price, display, locked_csv)
     WHERE p.id = t.id`,
    [
      changes.map((c) => c.row.id),
      changes.map((c) => c.price),
      changes.map((c) => (c.price == null ? "Request Quote" : usd(c.price))),
      changes.map((c) => lock(c.row.cms_locked).join(",")),
    ],
  );
  const rule =
    op.mode === "quote" ? "made Request Quote"
    : op.mode === "set" ? `set to ${usd(op.amount)}`
    : op.mode === "pct_up" ? `raised ${op.amount}%`
    : op.mode === "pct_down" ? `lowered ${op.amount}%`
    : op.mode === "amt_up" ? `raised ${usd(op.amount)}`
    : `lowered ${usd(op.amount)}`;
  await logActivity(user, {
    action: `changed ${changes.length} price${changes.length > 1 ? "s" : ""}`,
    target: `${rule}${op.round ? `, rounded to $${op.round}` : ""}: ${changes.slice(0, 3).map((c) => label(c.row)).join(", ")}${changes.length > 3 ? ` and ${changes.length - 3} more` : ""}`,
    kind: "product",
    ref: "bulk",
    before: { items: changes.map((c) => ({ id: c.row.id, price: num(c.row.price), price_display: c.row.price_display, cms_locked: c.row.cms_locked })) },
    after: { items: changes.map((c) => ({ id: c.row.id, price: c.price, price_display: c.price == null ? "Request Quote" : usd(c.price), cms_locked: lock(c.row.cms_locked) })) },
  });
  updateTag("catalog");
  return { changed: changes.length, skipped: rows.length - changes.length };
}

/** Moves listings to another shop category (for listings imported into the wrong one). The URL
    stays the same; shop pages, filters and counts follow the new category. */
export async function bulkCategory(user: Pick<User, "name">, ids: number[], slug: string) {
  const text = await categoryText(slug);
  const rows = await q<ProductRow>(`SELECT ${COLS} FROM public.products WHERE id = ANY($1::bigint[]) ORDER BY part_number`, [checkIds(ids)]);
  const move = rows.filter((r) => r.category_slug !== slug);
  if (!move.length) return { changed: 0, skipped: rows.length };
  const lock = (cur: string[]) => [...new Set([...cur, "category"])];
  await q(
    `UPDATE public.products p SET category = $1, cms_locked = string_to_array(t.locked_csv, ',')
     FROM unnest($2::bigint[], $3::text[]) AS t(id, locked_csv)
     WHERE p.id = t.id`,
    [text, move.map((r) => r.id), move.map((r) => lock(r.cms_locked).join(","))],
  );
  const from = [...new Set(move.map((r) => (r.category_slug && getCategory(r.category_slug)?.name) || r.category || "no category"))];
  await logActivity(user, {
    action: `moved ${move.length} listing${move.length > 1 ? "s" : ""} to ${getCategory(slug)?.name ?? text}`,
    target: `from ${from.slice(0, 3).join(", ")}${from.length > 3 ? "…" : ""}: ${move.slice(0, 3).map(label).join(", ")}${move.length > 3 ? ` and ${move.length - 3} more` : ""}`,
    kind: "product",
    ref: "bulk",
    before: { items: move.map((r) => ({ id: r.id, category: r.category, cms_locked: r.cms_locked })) },
    after: { items: move.map((r) => ({ id: r.id, category: text, cms_locked: lock(r.cms_locked) })) },
  });
  await refreshFacets();
  updateTag("catalog");
  return { changed: move.length, skipped: rows.length - move.length };
}

/** Shop categories, for the category pickers. */
export const categoryOptions = categories.map((c) => ({ slug: c.slug, name: c.name }));
