"use server";

import { updateTag } from "@/lib/cms/cache";
import { redirect } from "next/navigation";
import { assertUser } from "@/lib/cms/auth";
import { one, q } from "@/lib/cms/db";
import { logActivity } from "@/lib/cms/activity";
import { resetRoutes } from "@/lib/cms/routing";
import { siteUrls } from "@/lib/cms/inventory";
import { normPath } from "@/lib/cms/seo";
import type { Block, CmsLanding } from "@/lib/cms/content";
import type { FormState } from "../../actions";
import { clearGone, goneUrl, moveUrl } from "@/lib/cms/redirects";
import { siteChoice } from "@/lib/site";

const RESERVED = new Set(["admin", "api", "parts", "services", "brands", "shop", "resources", "fault-codes", "industries", "service-areas", "request-repair", "request-pickup", "request-quote", "request-cable", "cart", "checkout", "account", "media", "sitemaps", "lp", "_next", "search", "about", "contact", "terms", "privacy", "warranty", "site-map", "international", "on-site-service", "sell-surplus"]);
const citySlug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function pathProblem(path: string, id: number): Promise<string | null> {
  if (!/^\/[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)*$/.test(path)) return "The page URL can only use lower-case letters, numbers and dashes, like /servo-drive-repair-burlington.";
  if (RESERVED.has(path.split("/")[1])) return `URLs starting with /${path.split("/")[1]} belong to the website. Choose another URL.`;
  if ((await siteUrls()).some((u) => u.path === path && u.group !== "landing")) return "That URL is already a page on the website.";
  if (await one(`SELECT 1 FROM cms.cms_landing WHERE path = $1 AND id <> $2`, [path, id])) return "Another landing page uses that URL.";
  if (await one(`SELECT 1 FROM cms.cms_page_seo WHERE public_path = $1`, [path])) return "That URL is used by a page whose address was changed.";
  return null;
}

function done(path?: string) {
  resetRoutes();
  updateTag("cms:landing");
  if (path) updateTag(`cms:landing:${path}`);
  updateTag("cms:seo");
}

export async function saveLanding(_: FormState, fd: FormData): Promise<FormState> {
  const u = await assertUser("landing");
  const id = Number(fd.get("id") || 0);
  const kind = fd.get("kind") === "template" ? "template" : "page";
  const name = String(fd.get("name") ?? "").trim().slice(0, 120);
  if (!name) return { error: "Give the page a name." };
  let blocks: Block[] = [];
  let vars: Record<string, string> = {};
  try {
    blocks = JSON.parse(String(fd.get("blocks") || "[]"));
    vars = JSON.parse(String(fd.get("vars") || "{}"));
  } catch {
    return { error: "Something went wrong reading the blocks. Reload and try again." };
  }
  const intent = String(fd.get("intent") ?? "draft");
  const before = id ? await one<CmsLanding>(`SELECT * FROM cms.cms_landing WHERE id = $1`, [id]) : null;
  let path = kind === "template" ? `/__template-${id || Date.now()}` : normPath(String(fd.get("path") ?? ""));
  if (kind === "page") {
    const bad = await pathProblem(path, id);
    if (bad) return { error: bad };
  } else if (before) path = before.path;
  const status = kind === "template" ? "template" : intent === "publish" ? "published" : intent === "unpublish" ? "draft" : before?.status ?? "draft";
  const vals = [path, name, kind, JSON.stringify(blocks), JSON.stringify(vars), status, String(fd.get("seo_title") ?? "").trim().slice(0, 200) || null, String(fd.get("seo_description") ?? "").trim().slice(0, 400) || null, fd.get("in_sitemap") === "locations" ? "locations" : "pages", u.name, siteChoice(fd.get("site"))];
  const row = id
    ? await one<CmsLanding>(`UPDATE cms.cms_landing SET path=$1,name=$2,kind=$3,blocks=$4,vars=$5,status=$6,seo_title=$7,seo_description=$8,in_sitemap=$9,updated_by=$10,site=$11,updated_at=now() WHERE id=$12 RETURNING *`, [...vals, id])
    : await one<CmsLanding>(`INSERT INTO cms.cms_landing (path,name,kind,blocks,vars,status,seo_title,seo_description,in_sitemap,updated_by,site) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`, vals);
  if (before && before.path !== path && before.status === "published") await moveUrl(before.path, path, u.name);
  if (status === "published") await clearGone(path);
  await logActivity(u, { action: `${!before ? "created" : status !== before.status ? status : "edited"} ${kind === "template" ? "template" : "landing page"}`, target: kind === "template" ? name : path, kind: "landing", ref: String(row!.id), before, after: row });
  done(path);
  if (before?.path) updateTag(`cms:landing:${before.path}`);
  if (row && kind === "template") updateTag(`cms:template:${row.id}`);
  if (!id) redirect(`/admin/landing/${row!.id}?saved=1`);
  return { ok: status === "published" ? "Published. The page is live." : kind === "template" ? "Template saved. Pages made from it update too." : "Saved as draft." };
}

export async function deleteLanding(id: number): Promise<{ error?: string } | void> {
  const u = await assertUser("landing");
  const before = await one<CmsLanding>(`SELECT * FROM cms.cms_landing WHERE id = $1`, [id]);
  if (!before) return { error: "Already deleted." };
  if (before.kind === "template") {
    const n = await one<{ n: number }>(`SELECT count(*)::int AS n FROM cms.cms_landing WHERE template_id = $1`, [id]);
    if (n?.n) return { error: `${n.n} pages use this template. Delete those pages first.` };
  }
  await q(`DELETE FROM cms.cms_landing WHERE id = $1`, [id]);
  if (before.kind === "page" && before.status === "published") await goneUrl(before.path, u.name);
  await logActivity(u, { action: `deleted ${before.kind === "template" ? "template" : "landing page"}`, target: before.kind === "template" ? before.name : before.path, kind: "landing", ref: String(id), before, after: null });
  done(before.path);
  redirect("/admin/landing" + (before.kind === "template" ? "?tab=templates" : ""));
}

/** One page per line: "City, Province" (or "City, State"). */
export async function generatePages(_: FormState, fd: FormData): Promise<FormState> {
  const u = await assertUser("landing");
  const tid = Number(fd.get("template_id"));
  const tpl = await one<CmsLanding>(`SELECT * FROM cms.cms_landing WHERE id = $1 AND kind = 'template'`, [tid]);
  if (!tpl) return { error: "Template not found." };
  const pattern = (tpl.vars.path_pattern || "/servo-drive-repair-{city_slug}").trim();
  const publish = fd.get("publish") === "on";
  const made: string[] = [];
  const skipped: string[] = [];
  for (const line of String(fd.get("lines") ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 100)) {
    const [city, province = "", region = ""] = line.split(",").map((x) => x.trim());
    if (!city) continue;
    const vars: Record<string, string> = { city, province, region: region || province, city_slug: citySlug(city) };
    const path = normPath(pattern.replace(/\{([a-z_]+)\}/g, (m, k) => vars[k] ?? m));
    const bad = await pathProblem(path, 0);
    if (bad) { skipped.push(`${city} (${bad.split(".")[0]})`); continue; }
    await q(
      `INSERT INTO cms.cms_landing (path, name, kind, blocks, vars, template_id, status, in_sitemap, updated_by, site) VALUES ($1,$2,'page','[]',$3,$4,$5,'locations',$6,$7)`,
      [path, `${tpl.name}: ${city}`, JSON.stringify(vars), tid, publish ? "published" : "draft", u.name, siteChoice(tpl.site)],
    );
    made.push(path);
  }
  if (made.length) await logActivity(u, { action: `created ${made.length} pages from template`, target: tpl.name, kind: "landing", ref: String(tid), after: made });
  done();
  return made.length
    ? { ok: `Created ${made.length} page${made.length > 1 ? "s" : ""}${publish ? " (live)" : " as drafts"}: ${made.slice(0, 4).join(", ")}${made.length > 4 ? "…" : ""}.${skipped.length ? ` Skipped: ${skipped.join("; ")}.` : ""}` }
    : { error: skipped.length ? `Nothing created. ${skipped.join("; ")}` : "Add at least one line like: Burlington, ON" };
}
