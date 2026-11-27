"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { getProduct } from "@/lib/catalog";
import { inventoryOffer, usd } from "@/lib/parts/rules";
import { supabase } from "@/lib/supabase";
import { isPreview, SITE_COUNTRY, SITE_URL } from "@/lib/site";

/**
 * Saves a website request (quote / offer / repair / pickup / cable / order /
 * contact / onsite / surplus / international) to Supabase.
 *
 * The forms in src/components/request post their fields keyed by human
 * labels ("Part number", "Pickup city", …). Core contact fields are mapped to
 * columns; everything else is stored in `details`.
 */

export type RequestResult = { ok: true } | { ok: false; message: string };

const TYPES = ["quote", "offer", "repair", "pickup", "cable", "order", "contact", "onsite", "surplus", "international", "whatsapp", "chat"] as const;
const MAX_ORDER_LINES = 50;
const MAX_DETAIL_KEYS = 40;
const MAX_VALUE_LENGTH = 2000;

const Core = z.object({
  type: z.enum(TYPES),
  name: z.string().trim().min(1).max(200),
  email: z.email().max(320).optional(),
  phone: z.string().trim().max(50).optional(),
  company: z.string().trim().max(200).optional(),
  part_number: z.string().trim().max(500).optional(),
  manufacturer: z.string().trim().max(200).optional(),
  quantity: z.coerce.number().int().min(1).max(100000).optional(),
  message: z.string().trim().max(5000).optional(),
  subject: z.string().trim().max(200).optional(),
}).refine((r) => r.email || (r.phone?.replace(/\D/g, "").length ?? 0) >= 7); // a chat call back may have only a phone

// Form label -> column. Labels not listed here go into `details`.
const COLUMNS: Record<string, keyof z.infer<typeof Core>> = {
  Name: "name",
  Email: "email",
  Phone: "phone",
  Company: "company",
  "Part number": "part_number",
  "Part numbers": "part_number",
  Manufacturer: "manufacturer",
  Quantity: "quantity",
  Notes: "message",
  Fault: "message",
  Message: "message",
  Problem: "message",
  _subject: "subject",
  _type: "type",
};

export async function submitServiceRequest(fields: Record<string, string>): Promise<RequestResult> {
  // Spam trap: real visitors never fill this hidden field. Pretend success.
  if (fields._honey) return { ok: true };
  if (!(await allowed())) return { ok: false, message: "Too many requests from your network. Please try again in a few minutes, or call or email us." };

  const core: Record<string, string> = {};
  const details: Record<string, string> = {};
  for (const [key, raw] of Object.entries(fields)) {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value || key === "_honey" || key === "_item" || key === "_cart" || key === "_src" || key === "_page") continue;
    const column = COLUMNS[key];
    if (column) core[column] = value;
    else if (!key.startsWith("_") && Object.keys(details).length < MAX_DETAIL_KEYS) {
      details[key.slice(0, 100)] = value.slice(0, MAX_VALUE_LENGTH);
    }
  }

  const parsed = Core.safeParse(core);
  if (!parsed.success) {
    return { ok: false, message: "Please check your name, email (or phone) and the highlighted fields." };
  }

  // Orders: re-price every line from the catalog. The cart lives in the browser,
  // so its prices are never trusted; the team still confirms before invoicing.
  if (parsed.data.type === "order") {
    const checked = await priceOrder(fields._cart);
    if (!checked) return { ok: false, message: "Your cart has changed or is empty. Please review it and try again." };
    details.Order = checked.lines.join("\n");
    details.Subtotal = `${usd(checked.subtotal)} USD (before shipping and tax)`;
  }

  Object.assign(details, attribution(fields._src, fields._page));
  // .ca or .com: which country site the request came from (shown in Leads).
  if (SITE_COUNTRY) details.Website = new URL(SITE_URL).host;
  // Sent from a preview build (contractor testing): saved, but Leads files it under "Test".
  if (isPreview) details.Test = `Preview build${process.env.VERCEL_GIT_COMMIT_REF ? ` (${process.env.VERCEL_GIT_COMMIT_REF})` : ""}`;

  // Link to the catalog product when the request came from a part page.
  const product = fields._item ? await getProduct(fields._item.slice(0, 300)) : null;

  // Insert only: RLS allows anon INSERT but not SELECT, so don't chain .select().
  const { type, ...rest } = parsed.data;
  const { error } = await supabase.from("quote_requests").insert({
    ...rest,
    request_type: type,
    product_id: product?.id ?? null,
    part_number: rest.part_number ?? product?.part_number ?? null,
    details,
  });
  if (error) {
    console.error("request insert failed", error);
    return { ok: false, message: "Sorry, your request could not be sent. Please try again in a minute." };
  }
  // Email the team so new leads are seen right away (the request is already saved; a failed email never fails it).
  await notifyTeam(type, rest, details).catch((e) => console.error("lead email failed", e));
  return { ok: true };
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/**
 * New-lead email through Resend's HTTP API (no package needed). Off until both settings are set (Vercel, server only):
 *   RESEND_API_KEY   API key from resend.com (the sending domain must be verified there)
 *   LEADS_EMAIL_TO   who gets the alerts, comma-separated, e.g. info@industrialautomationrepair.com
 *   LEADS_EMAIL_FROM optional sender, default "IAR Website <leads@servorepairusa.com>" (domain verified in Resend)
 */
async function notifyTeam(type: string, core: Omit<z.infer<typeof Core>, "type">, details: Record<string, string>) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEADS_EMAIL_TO?.split(",").map((s) => s.trim()).filter(Boolean);
  if (!key || !to?.length) return;
  const rows: [string, string][] = [
    ["Type", type],
    ["Name", core.name],
    ["Company", core.company ?? ""],
    ["Email", core.email ?? ""],
    ["Phone", core.phone ?? ""],
    ["Part number", core.part_number ?? ""],
    ["Manufacturer", core.manufacturer ?? ""],
    ["Quantity", core.quantity ? String(core.quantity) : ""],
    ["Message", core.message ?? ""],
    ...Object.entries(details),
  ];
  const html = `<h2 style="font-family:Arial,sans-serif">New website ${esc(type)} request</h2><table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#555;vertical-align:top;white-space:nowrap"><b>${esc(k)}</b></td><td style="padding:6px 0;white-space:pre-wrap">${esc(v)}</td></tr>`)
    .join("")}</table><p style="font-family:Arial,sans-serif;font-size:13px;color:#777">Also saved in the CMS: Leads.</p>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.LEADS_EMAIL_FROM || "IAR Website <leads@servorepairusa.com>",
      to,
      reply_to: core.email || undefined,
      subject: `New ${type} request: ${core.company || core.name}${core.part_number ? ` (${core.part_number.slice(0, 60)})` : ""}`,
      html,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) console.error("lead email failed", res.status, await res.text().catch(() => ""));
}

/** At most 10 requests per network per 10 minutes (public.request_allowed in the database). */
async function allowed() {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = createHash("sha256").update(`iar:${ip}`).digest("hex").slice(0, 32);
  const { data, error } = await supabase.rpc("request_allowed", { key });
  return error ? true : data !== false; // never block real requests because the check failed
}

const Src = z.object({
  landing: z.string().max(300).optional(),
  referrer: z.string().max(500).optional(),
  utm: z.string().max(200).optional(),
  gclid: z.boolean().optional(),
});

/** Source / Campaign / Landing page / Referrer / Sent from, as shown on the CMS Leads screen. */
function attribution(raw: string | undefined, page: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (page?.startsWith("/")) out["Sent from"] = page.slice(0, 300);
  let src: z.infer<typeof Src> = {};
  try {
    src = Src.parse(JSON.parse(raw || "{}"));
  } catch {}
  if (src.landing?.startsWith("/")) out["Landing page"] = src.landing;
  if (src.referrer) out.Referrer = src.referrer;
  if (src.utm) out.Campaign = src.utm;
  out.Source = src.gclid ? "Google Ads" : sourceOf(src.referrer);
  return out;
}

function sourceOf(referrer?: string) {
  if (!referrer) return "Direct";
  try {
    const h = new URL(referrer).hostname.replace(/^www\./, "");
    if (/google\./.test(h)) return "Google (organic)";
    if (/bing\.com/.test(h)) return "Bing (organic)";
    if (/linkedin\./.test(h)) return "LinkedIn";
    if (/chatgpt|openai|perplexity|claude|gemini|copilot/.test(h)) return `AI assistant (${h})`;
    return h;
  } catch {
    return "Referral";
  }
}

const CartLine = z.object({
  slug: z.string().min(1).max(300),
  condition: z.enum(["new", "refurbished", "exchange"]),
  qty: z.coerce.number().int().min(1).max(999),
});

/** Checkout lines priced from the catalog; null when any line is no longer for sale. */
async function priceOrder(raw: string | undefined) {
  let json: unknown;
  try {
    json = JSON.parse(raw ?? "");
  } catch {
    return null;
  }
  const cart = z.array(CartLine).min(1).max(MAX_ORDER_LINES).safeParse(json);
  if (!cart.success) return null;
  const lines: string[] = [];
  let subtotal = 0;
  for (const { slug, condition, qty } of cart.data) {
    const product = await getProduct(slug);
    const offer = product ? inventoryOffer(product) : null;
    if (!product || !offer || offer.condition !== condition) return null;
    const total = Math.round(offer.price * qty * 100) / 100;
    subtotal += total;
    const label = condition.charAt(0).toUpperCase() + condition.slice(1);
    lines.push(`${qty} x ${product.manufacturer ?? ""} ${product.part_number} (${label}) at ${usd(offer.price)} = ${usd(total)}`.replace(/ {2,}/g, " "));
  }
  return { lines, subtotal: Math.round(subtotal * 100) / 100 };
}
