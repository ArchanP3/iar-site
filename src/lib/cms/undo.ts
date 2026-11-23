import "server-only";
import { updateTag } from "@/lib/cms/cache";
import { one, q } from "./db";
import { writeSetting, DEFAULTS, type SettingKey } from "./settings";
import { resetRoutes } from "./routing";
import { clearGone } from "./redirects";
import { postUrl } from "@/lib/blog";
import { restoreProduct, restoreProducts } from "./products";

/* Puts back what a change in the activity log replaced. Each undo is logged as well. */

type Act = { id: number; kind: string; ref: string; action: string; target: string; before: Record<string, unknown> | null; after: unknown; undone: boolean };

const TABLES: Record<string, { table: string; key: string; json: string[] }> = {
  page_seo: { table: "cms.cms_page_seo", key: "path", json: [] },
  redirect: { table: "cms.cms_redirects", key: "id", json: [] },
  post: { table: "cms.cms_posts", key: "id", json: ["faq", "related"] },
  landing: { table: "cms.cms_landing", key: "id", json: ["blocks", "vars"] },
};

export function canUndo(a: Pick<Act, "kind" | "before" | "after" | "undone" | "action">): boolean {
  if (a.undone) return false;
  if (a.kind === "setting") return a.before != null;
  if (a.kind === "media") return a.before != null && a.after != null; // edits only; a deleted file is gone
  if (a.kind === "landing" && Array.isArray(a.after)) return true; // pages created from a template
  if (a.kind === "product") return a.before != null; // edits and unlocks; puts the old values back
  return a.kind in TABLES && (a.before != null || (a.after != null && typeof a.after === "object"));
}

const ident = (s: string) => {
  if (!/^[a-z_]+$/.test(s)) throw new Error("bad column");
  return s;
};

async function restoreRow(kind: string, before: Record<string, unknown> | null, after: Record<string, unknown> | null) {
  const t = TABLES[kind];
  if (!before) {
    if (after?.[t.key] != null) await q(`DELETE FROM ${t.table} WHERE ${t.key} = $1`, [after[t.key]]);
    return;
  }
  const cols = Object.keys(before).map(ident);
  const vals = cols.map((c) => (t.json.includes(c) ? JSON.stringify(before[c]) : before[c]));
  await q(
    `INSERT INTO ${t.table} (${cols.join(",")}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(",")})
     ON CONFLICT (${t.key}) DO UPDATE SET ${cols.filter((c) => c !== t.key).map((c) => `${c} = EXCLUDED.${c}`).join(", ")}`,
    vals,
  );
}

export async function undoActivity(id: number, by: string): Promise<string> {
  const a = await one<Act>(`SELECT * FROM cms.cms_activity WHERE id = $1`, [id]);
  if (!a) throw new Error("Not found.");
  if (!canUndo(a)) throw new Error("This change can't be undone.");
  let note = "";
  {
    if (a.kind === "setting") {
      if (!(a.ref in DEFAULTS)) throw new Error("Unknown setting.");
      await writeSetting(a.ref as SettingKey, a.before as never, by);
    } else if (a.kind === "media") {
      const b = a.before as { id: number; filename: string; alt: string; caption: string; folder: string; aliases: string[] };
      const clash = await one(`SELECT 1 FROM cms.cms_media WHERE filename = $1 AND id <> $2`, [b.filename, b.id]);
      if (clash) throw new Error("Another image now uses that file name.");
      await q(`UPDATE cms.cms_media SET filename=$2, alt=$3, caption=$4, folder=$5, aliases=$6 WHERE id=$1`, [b.id, b.filename, b.alt, b.caption, b.folder, b.aliases.filter((x) => x !== b.filename)]);
    } else if (a.kind === "product") {
      // A bulk change (many listings) is logged as { items: [...] } and undone in one go.
      if (Array.isArray((a.before as { items?: unknown }).items)) {
        const r = await restoreProducts(a.before as { items: unknown }, (a.after as { items?: unknown } | null) ?? null);
        if (r.failed || r.missing)
          note = ` (${r.restored} put back${r.missing ? `, ${r.missing} no longer exist` : ""}${r.failed ? `, ${r.failed} couldn't be put back: check them in Parts Catalog` : ""})`;
      }
      else await restoreProduct(a.before as Record<string, unknown>, (a.after as Record<string, unknown> | null) ?? null);
    } else if (a.kind === "landing" && Array.isArray(a.after)) {
      await q(`DELETE FROM cms.cms_landing WHERE template_id = $1 AND path = ANY($2::text[])`, [Number(a.ref), a.after]);
    } else {
      await restoreRow(a.kind, a.before, (a.after as Record<string, unknown> | null) ?? null);
      // A deleted post or landing page that comes back must not keep answering 410.
      const b = a.before as { slug?: string; path?: string } | null;
      if (a.kind === "post" && b?.slug) await clearGone(postUrl(b.slug));
      if (a.kind === "landing" && b?.path) await clearGone(b.path);
    }
    await q(`UPDATE cms.cms_activity SET undone = TRUE WHERE id = $1`, [id]);
    await q(`INSERT INTO cms.cms_activity (user_name, action, target, kind, ref, before, after) VALUES ($1,$2,$3,'undo',$4,NULL,NULL)`, [by, `undid “${a.action}”`, a.target, String(id)]);
  }
  for (const tag of ["cms:settings", "cms:seo", "cms:posts", "cms:landing", "cms:media"]) updateTag(tag);
  if (a.kind === "page_seo") updateTag(`cms:seo:${a.ref}`);
  const slug = (a.before as { slug?: string } | null)?.slug ?? (a.after as { slug?: string } | null)?.slug;
  if (a.kind === "post" && slug) updateTag(`cms:post:${slug}`);
  for (const p of [(a.before as { path?: string } | null)?.path, (a.after as { path?: string } | null)?.path]) if (a.kind === "landing" && p) updateTag(`cms:landing:${p}`);
  resetRoutes();
  return `Undone: ${a.action} ${a.target}`.trim() + note;
}
