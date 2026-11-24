import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsEnabled, q } from "./db";
import { contact } from "@/lib/contact";

/* ------------------------------------------------------------------ */
/*  Site-wide settings stored in cms.cms_settings (one JSON value per key). */
/*  Every key has a default so the site works with no database.         */
/* ------------------------------------------------------------------ */

export type Tracking = {
  gtm: string; ga4: string; gscVerification: string; bingVerification: string; clarity: string; linkedin: string;
  headHtml: string; bodyHtml: string;
  /** Search Console HTML-tag code for industrialautomationrepair.com (gscVerification is the .com one). */
  gscVerificationCa?: string;
};
export type Business = {
  name: string; street: string; city: string; region: string; postal: string; country: string;
  phone: string; email: string; hours: [string, string][]; gbp: string; dropOff: string; serviceArea: string;
};
export type SiteSettings = {
  announcement: { on: boolean; text: string };
  social: { linkedin: string; youtube: string; facebook: string; instagram: string; x: string };
  titleSuffix: string;
  ogImage: string;
  sitemaps: { pages: boolean; posts: boolean; locations: boolean; faultCodes: boolean; images: boolean; parts: boolean };
};
export type PartsSeo = { on: boolean; titleTemplate: string; descriptionTemplate: string };
export type GoogleCfg = { gscSite: string; ga4Property: string };
export type Security = { require2fa: boolean };
/** Parts Catalog "Low price" filter: minimum expected price (US$) per shop category slug. */
export type PartsMinPrice = Record<string, number>;

export const DEFAULTS = {
  tracking: { gtm: "", ga4: "", gscVerification: "", gscVerificationCa: "", bingVerification: "", clarity: "", linkedin: "", headHtml: "", bodyHtml: "" } as Tracking,
  business: {
    name: "Industrial Automation Repair Inc.", street: "3279 Grand Island Blvd", city: "Grand Island", region: "NY", postal: "14072", country: "US",
    phone: contact.phone, email: contact.email, hours: contact.hours, gbp: "", dropOff: "Drop off during business hours, no appointment needed.",
    serviceArea: "Repairs across the USA. Parts shipped to the USA, Canada and worldwide.",
  } as Business,
  site: {
    announcement: { on: true, text: "Repairs across the USA · Free evaluation on every repair · 24/7 line 1-877-904-6155" },
    social: { linkedin: "", youtube: "", facebook: "", instagram: "", x: "" },
    titleSuffix: "IAR",
    ogImage: "",
    sitemaps: { pages: true, posts: true, locations: true, faultCodes: true, images: true, parts: true },
  } as SiteSettings,
  robots: { custom: "" },
  partsSeo: {
    on: false,
    titleTemplate: "{brand} {part_number} {name} | Buy & Repair",
    descriptionTemplate: "{brand} {part_number} {name}. {availability} {repair} Ships to the USA & Canada.",
  } as PartsSeo,
  google: { gscSite: "", ga4Property: "" } as GoogleCfg,
  security: { require2fa: false } as Security,
  partsMinPrice: {} as PartsMinPrice,
  schema: { site: "" },
  checklist: { week: "", done: [] as string[] },
};
export type SettingKey = keyof typeof DEFAULTS;

/** Uncached read, for admin screens. */
export async function readSetting<K extends SettingKey>(key: K): Promise<(typeof DEFAULTS)[K]> {
  if (!cmsEnabled()) return DEFAULTS[key];
  const rows = await q<{ value: unknown }>(`SELECT value FROM cms.cms_settings WHERE key = $1`, [key]);
  return merge(DEFAULTS[key], rows[0]?.value);
}

async function settingCached<K extends SettingKey>(key: K): Promise<(typeof DEFAULTS)[K]> {
  "use cache";
  cacheLife("max");
  cacheTag("cms:settings", `cms:setting:${key}`);
  return readSetting(key);
}

const lastGoodSetting = new Map<SettingKey, unknown>();

/** Cached read, for the public website. Refreshed by updateTag("cms:settings").
    A database error is never cached: the last good value (or the default) is used. */
export async function setting<K extends SettingKey>(key: K): Promise<(typeof DEFAULTS)[K]> {
  try {
    const v = await settingCached(key);
    lastGoodSetting.set(key, v);
    return v;
  } catch {
    return (lastGoodSetting.get(key) as (typeof DEFAULTS)[K] | undefined) ?? DEFAULTS[key];
  }
}

export async function writeSetting<K extends SettingKey>(key: K, value: (typeof DEFAULTS)[K], by: string) {
  await q(
    `INSERT INTO cms.cms_settings (key, value, updated_at, updated_by) VALUES ($1, $2, now(), $3)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by`,
    [key, JSON.stringify(value), by],
  );
}

function merge<T>(base: T, v: unknown): T {
  if (!v || typeof v !== "object" || Array.isArray(v) || typeof base !== "object" || base === null || Array.isArray(base)) return (v as T) ?? base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    const b = (base as Record<string, unknown>)[k];
    out[k] = b && typeof b === "object" && !Array.isArray(b) ? merge(b, val) : val ?? b;
  }
  return out as T;
}
