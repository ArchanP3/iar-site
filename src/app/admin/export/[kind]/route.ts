import { assertUser, type Perm } from "@/lib/cms/auth";
import { q } from "@/lib/cms/db";
import { LEADS } from "@/lib/cms/leads";

/* CSV downloads for spreadsheets, and a full JSON backup of everything in the CMS. */

const csv = (rows: Record<string, unknown>[]) => {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const cell = (v: unknown) => {
    const s = v == null ? "" : v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n\r]/.test(s) || /^[=+\-@]/.test(s) ? `"${(/^[=+\-@]/.test(s) ? "'" : "") + s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\r\n");
};

const NEED: Record<string, Perm> = { pages: "pages", redirects: "redirects", leads: "leads", "404s": "redirects", backup: "backup" };

export async function GET(_: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!NEED[kind]) return new Response("Not found", { status: 404 });
  try {
    await assertUser(NEED[kind]); // same rules as every action: password changed, two-step when required, role
  } catch {
    return new Response("Not allowed", { status: 403 });
  }
  const day = new Date().toISOString().slice(0, 10);
  const file = (name: string, body: string, type = "text/csv; charset=utf-8") =>
    new Response(body, { headers: { "Content-Type": type, "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "no-store" } });

  if (kind === "pages") {
    const rows = await q(`
      SELECT c.path, c.status, COALESCE(NULLIF(s.title,''), c.title) AS title, COALESCE(NULLIF(s.description,''), c.description) AS description,
             length(COALESCE(NULLIF(s.title,''), c.title)) AS title_length, length(COALESCE(NULLIF(s.description,''), c.description)) AS description_length,
             c.canonical, CASE WHEN s.noindex THEN 'noindex' ELSE 'index' END AS indexing, s.focus_keyword, c.words, c.images, c.images_noalt AS images_missing_alt,
             c.inbound AS internal_links_in, array_to_string(c.ld_types, ' ') AS schema_types, c.ms AS load_ms, CASE WHEN s.path IS NULL THEN 'default' ELSE 'edited' END AS seo, c.crawled_at
        FROM cms.cms_crawl c LEFT JOIN cms.cms_page_seo s ON s.path = c.path ORDER BY c.path`);
    return file(`iar-pages-${day}.csv`, csv(rows));
  }
  if (kind === "redirects") return file(`iar-redirects-${day}.csv`, csv(await q(`SELECT from_path AS "from", to_path AS "to", code, match, active, hits, last_hit, source, note, created_by, created_at FROM cms.cms_redirects ORDER BY from_path`)));
  if (kind === "404s") return file(`iar-404s-${day}.csv`, csv(await q(`SELECT path, hits, referrer, first_seen, last_seen, ignored FROM cms.cms_404 ORDER BY hits DESC`)));
  if (kind === "leads") return file(`iar-leads-${day}.csv`, csv(await q(`SELECT id, created_at, form, status, summary, source, landing, page, referrer, notes, data FROM (${LEADS}) l ORDER BY created_at DESC`)));

  const tables = ["cms.cms_page_seo", "cms.cms_redirects", "cms.cms_settings", "cms.cms_posts", "cms.cms_landing", "cms.lead_notes", "cms.cms_activity"];
  const out: Record<string, unknown> = { exported_at: new Date().toISOString(), note: "IAR CMS backup. Images are kept in the database (cms.cms_media) and are listed here without their file data." };
  for (const t of tables) out[t] = await q(`SELECT * FROM ${t}`);
  out.cms_media = await q(`SELECT id, filename, mime, width, height, bytes, alt, caption, folder, created_at, created_by FROM cms.cms_media`);
  out.cms_users = await q(`SELECT id, email, name, role, disabled, created_at FROM cms.cms_users`);
  return file(`iar-cms-backup-${day}.json`, JSON.stringify(out, null, 1), "application/json");
}
