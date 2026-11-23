"use server";

import { updateTag } from "@/lib/cms/cache";
import { assertUser } from "@/lib/cms/auth";
import { logActivity } from "@/lib/cms/activity";
import { readSetting, writeSetting, type PartsMinPrice, type PartsSeo } from "@/lib/cms/settings";
import { FIELD_LABEL, bulkCategory, bulkPrice, getProductRow, parsePrice, readForm, saveProduct, unlockField } from "@/lib/cms/products";
import { categories } from "@/lib/parts/categories";
import { parseOp } from "@/lib/parts/bulkPrice";
import type { User } from "@/lib/cms/auth";
import type { FormState } from "../../actions";

export async function savePartsSeo(_: FormState, fd: FormData): Promise<FormState> {
  const u = await assertUser("parts");
  const next: PartsSeo = {
    on: fd.get("on") === "on",
    titleTemplate: String(fd.get("titleTemplate") ?? "").trim().slice(0, 200),
    descriptionTemplate: String(fd.get("descriptionTemplate") ?? "").trim().slice(0, 400),
  };
  if (next.on && !next.titleTemplate.includes("{part_number}")) return { error: "Keep {part_number} in the title. Buyers search by part number." };
  const before = await readSetting("partsSeo");
  await writeSetting("partsSeo", next, u.name);
  await logActivity(u, { action: "changed part page SEO templates", target: next.on ? "templates on" : "templates off", kind: "setting", ref: "partsSeo", before, after: next });
  updateTag("cms:settings");
  return { ok: next.on ? "Saved. Every part page now uses these templates." : "Saved. Part pages use the built-in titles." };
}

/* ---------------- Parts Catalog editor ---------------- */

/** Saves the edit form. Changed fields are locked against the imports. */
export async function saveProductForm(_: FormState, fd: FormData): Promise<FormState> {
  const u = await assertUser("parts");
  const id = Number(fd.get("id"));
  if (!id) return { error: "Missing product." };
  const read = readForm(fd);
  if ("error" in read) return { error: read.error };
  try {
    const changed = await saveProduct(u, id, read.values);
    if (!changed.length) return { ok: "Nothing changed." };
    return { ok: `Saved. ${changed.filter((f) => f !== "price_display").map((f) => FIELD_LABEL[f] ?? f).join(", ")} updated on both sites and locked against imports.` };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/** Quick price change from the list. "" = Request Quote. */
export async function setProductPrice(id: number, raw: string): Promise<{ error?: string; display?: string }> {
  const u = await assertUser("parts");
  const p = parsePrice(raw);
  if ("error" in p) return { error: p.error };
  try {
    await saveProduct(u, id, { price: p.price });
    const row = await getProductRow(id);
    return { display: row?.price_display ?? "" };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/** Lets the imports update a field again. */
export async function unlockProductField(id: number, field: string): Promise<{ error?: string }> {
  const u = await assertUser("parts");
  try {
    await unlockField(u, id, field);
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/* ---------------- Bulk changes and the Low price filter ---------------- */

/** Bulk price changes and minimum prices are for Admins (and the Super Admin), like deleting. */
const isAdmin = (u: User) => u.role === "owner" || u.role === "admin";

type BulkResult = { error?: string; ok?: string };

/** Changes the price of the ticked listings with one rule. Admins only. */
export async function bulkPriceAction(ids: number[], raw: { mode?: string; amount?: string; round?: string }): Promise<BulkResult> {
  const u = await assertUser("parts");
  if (!isAdmin(u)) return { error: "Only Admins can change many prices at once. Change one price by clicking it." };
  const op = parseOp(raw);
  if (!op) return { error: "Pick how to change the price." };
  try {
    const r = await bulkPrice(u, Array.isArray(ids) ? ids : [], op);
    if (!r.changed) return { ok: "Nothing changed: those prices already match." };
    return { ok: `Updated ${r.changed} price${r.changed > 1 ? "s" : ""} on both sites${r.skipped ? ` (${r.skipped} left as they were)` : ""}. Undo it in Users & Activity.` };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/** Moves the ticked listings to another shop category. */
export async function bulkCategoryAction(ids: number[], slug: string): Promise<BulkResult> {
  const u = await assertUser("parts");
  try {
    const r = await bulkCategory(u, Array.isArray(ids) ? ids : [], String(slug ?? ""));
    if (!r.changed) return { ok: "Nothing changed: those listings are already in that category." };
    return { ok: `Moved ${r.changed} listing${r.changed > 1 ? "s" : ""}${r.skipped ? ` (${r.skipped} were already there)` : ""}. Shop pages and counts are updated. Undo it in Users & Activity.` };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/** Saves the minimum expected price per category, used by the Low price filter. Admins only. */
export async function saveMinPrices(_: FormState, fd: FormData): Promise<FormState> {
  const u = await assertUser("parts");
  if (!isAdmin(u)) return { error: "Only Admins can set minimum prices." };
  const next: PartsMinPrice = {};
  for (const c of categories) {
    const raw = String(fd.get(`min_${c.slug}`) ?? "").replace(/[\s$,]/g, "");
    if (!raw) continue;
    if (!/^\d+(\.\d{1,2})?$/.test(raw)) return { error: `${c.name}: enter the minimum as a number, like 150, or leave it empty.` };
    const n = Number(raw);
    if (n > 1_000_000) return { error: `${c.name}: that minimum is too high.` };
    if (n > 0) next[c.slug] = n;
  }
  const before = await readSetting("partsMinPrice");
  await writeSetting("partsMinPrice", next, u.name);
  await logActivity(u, { action: "changed minimum prices", target: Object.keys(next).length ? `${Object.keys(next).length} categories` : "all cleared", kind: "setting", ref: "partsMinPrice", before, after: next });
  updateTag("cms:settings");
  return { ok: "Saved. The Low price filter uses these minimums now." };
}
