"use server";

import { updateTag } from "@/lib/cms/cache";
import { SITE_URL } from "@/lib/site";
import { assertUser, can } from "@/lib/cms/auth";
import { one, q } from "@/lib/cms/db";
import { logActivity } from "@/lib/cms/activity";
import { normPath, type PageSeo } from "@/lib/cms/seo";
import { resetRoutes } from "@/lib/cms/routing";
import { runCrawl } from "@/lib/cms/crawl";
import { moveUrl } from "@/lib/cms/redirects";
import { partUrl, sitemapSlugs } from "@/lib/parts/repository";
import type { FormState } from "../../actions";

const clean = (v: FormDataEntryValue | null, max = 500) => {
  const s = String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
  return s || null;
};
const raw = (v: FormDataEntryValue | null, max = 20_000) => {
  const s = String(v ?? "").trim().slice(0, max);
  return s || null;
};

export async function savePageSeo(_: FormState, fd: FormData): Promise<FormState> {
  const u = await assertUser("pages");
  const path = normPath(String(fd.get("path") ?? ""));
  const before = await one<PageSeo>(`SELECT * FROM cms.cms_page_seo WHERE path = $1`, [path]);

  const schema = raw(fd.get("schema_json"));
  const caSchema = raw(fd.get("ca_schema_json"));
  for (const [v, which] of [[schema, "custom schema"], [caSchema, "Canada site schema"]] as const) {
    if (!v) continue;
    try {
      const j = JSON.parse(v);
      if (typeof j !== "object" || j === null) throw new Error();
    } catch {
      return { error: `The ${which} is not valid JSON. Fix it or clear the box, then save again.` };
    }
  }
  const canonical = clean(fd.get("canonical"), 400);
  if (canonical && !/^(https?:\/\/|\/)/.test(canonical)) return { error: "Canonical URL must start with / or https://" };

  let publicPath = clean(fd.get("public_path"), 200);
  if (publicPath) {
    publicPath = normPath(publicPath);
    if (!/^\/[a-z0-9][a-z0-9/-]*$/.test(publicPath)) return { error: "The URL can only use lower-case letters, numbers, dashes and slashes." };
    if (publicPath === path) publicPath = null;
  }
  if (publicPath) {
    const taken = await one(`SELECT 1 FROM cms.cms_page_seo WHERE public_path = $1 AND path <> $2 UNION SELECT 1 FROM cms.cms_landing WHERE path = $1`, [publicPath, path]);
    if (taken) return { error: `${publicPath} is already used by another page.` };
  }

  const scriptsAllowed = can(u.role, "tracking");
  const vals = {
    title: clean(fd.get("title"), 200), description: clean(fd.get("description"), 400), focus_keyword: clean(fd.get("focus_keyword"), 120),
    canonical, noindex: fd.get("noindex") === "on", nofollow: fd.get("nofollow") === "on",
    og_title: clean(fd.get("og_title"), 200), og_description: clean(fd.get("og_description"), 400), og_image: clean(fd.get("og_image"), 400),
    schema_json: schema,
    head_html: scriptsAllowed ? raw(fd.get("head_html")) : before?.head_html ?? null,
    body_html: scriptsAllowed ? raw(fd.get("body_html")) : before?.body_html ?? null,
    public_path: publicPath,
    ca_title: clean(fd.get("ca_title"), 200), ca_description: clean(fd.get("ca_description"), 400), ca_schema_json: caSchema,
  };
  const row = await one<PageSeo>(
    `INSERT INTO cms.cms_page_seo (path, title, description, focus_keyword, canonical, noindex, nofollow, og_title, og_description, og_image, schema_json, head_html, body_html, public_path, updated_at, updated_by, ca_title, ca_description, ca_schema_json)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, now(), $15, $16, $17, $18)
     ON CONFLICT (path) DO UPDATE SET title=$2, description=$3, focus_keyword=$4, canonical=$5, noindex=$6, nofollow=$7, og_title=$8, og_description=$9, og_image=$10,
       schema_json=$11, head_html=$12, body_html=$13, public_path=$14, updated_at=now(), updated_by=$15, ca_title=$16, ca_description=$17, ca_schema_json=$18
     RETURNING *`,
    [path, vals.title, vals.description, vals.focus_keyword, vals.canonical, vals.noindex, vals.nofollow, vals.og_title, vals.og_description, vals.og_image, vals.schema_json, vals.head_html, vals.body_html, vals.public_path, u.name, vals.ca_title, vals.ca_description, vals.ca_schema_json],
  );

  // URL changed: send the old address (and any earlier one) to the new one with a 301
  const oldPublic = before?.public_path || path;
  const newPublic = publicPath || path;
  if (oldPublic !== newPublic) {
    await moveUrl(oldPublic, newPublic, u.name);
  }

  const changed = Object.entries(vals).filter(([k, v]) => JSON.stringify(v) !== JSON.stringify((before as Record<string, unknown> | null)?.[k] ?? null)).map(([k]) => k);
  if (changed.length) await logActivity(u, { action: `updated ${changed.map((c) => c.replace(/_/g, " ")).join(", ")} of`, target: path, kind: "page_seo", ref: path, before, after: row });
  updateTag(`cms:seo:${path}`);
  updateTag("cms:seo");
  return { ok: "Saved and published." };
}

export async function resetPageSeo(path: string) {
  const u = await assertUser("pages");
  const p = normPath(path);
  const before = await one<PageSeo>(`SELECT * FROM cms.cms_page_seo WHERE path = $1`, [p]);
  if (!before) return;
  await q(`DELETE FROM cms.cms_page_seo WHERE path = $1`, [p]);
  if (before.public_path) {
    await q(`DELETE FROM cms.cms_redirects WHERE from_path = $1 AND source = 'slug change'`, [p]);
    resetRoutes();
  }
  await logActivity(u, { action: "reset SEO to the website defaults for", target: p, kind: "page_seo", ref: p, before, after: null });
  updateTag(`cms:seo:${p}`);
  updateTag("cms:seo");
}

export async function bulkIndex(paths: string[], noindex: boolean) {
  const u = await assertUser("pages");
  for (const raw of paths.slice(0, 500)) {
    const p = normPath(raw);
    const before = await one<PageSeo>(`SELECT * FROM cms.cms_page_seo WHERE path = $1`, [p]);
    const after = await one<PageSeo>(
      `INSERT INTO cms.cms_page_seo (path, noindex, updated_by) VALUES ($1,$2,$3) ON CONFLICT (path) DO UPDATE SET noindex = $2, updated_at = now(), updated_by = $3 RETURNING *`,
      [p, noindex, u.name],
    );
    await logActivity(u, { action: noindex ? "set noindex on" : "set index on", target: p, kind: "page_seo", ref: p, before, after });
    updateTag(`cms:seo:${p}`);
  }
  updateTag("cms:seo");
}

/** The scan always crawls our own site, never an address taken from the request headers. */
const siteOrigin = () => (process.env.CMS_CRAWL_ORIGIN || SITE_URL).replace(/\/$/, "");

export async function scanSite(): Promise<FormState> {
  const u = await assertUser("audit");
  const parts = (await sitemapSlugs(0, 150).catch(() => [])).map((r) => partUrl(r.slug));
  const res = await runCrawl(siteOrigin(), { parts });
  await logActivity(u, { action: "ran the SEO scan", target: `${res.pages} pages · score ${res.score}`, kind: "audit", ref: "" });
  updateTag("cms:audit");
  return { ok: res.complete ? `Scanned ${res.pages} pages. Score ${res.score}.` : `Scanned ${res.pages} pages before the time limit. Run it again to finish.` };
}
