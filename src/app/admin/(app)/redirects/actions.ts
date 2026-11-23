"use server";

import { updateTag } from "@/lib/cms/cache";
import { assertUser } from "@/lib/cms/auth";
import { one, q } from "@/lib/cms/db";
import { logActivity } from "@/lib/cms/activity";
import { normPath } from "@/lib/cms/seo";
import { resetRoutes } from "@/lib/cms/routing";
import { siteUrls } from "@/lib/cms/inventory";
import type { FormState } from "../../actions";

type Row = { id: number; from_path: string; to_path: string; code: number; match: string; source: string; note: string | null; active: boolean; expires_at: Date | null };

const fromOk = (p: string) => /^\/[A-Za-z0-9._~!$&'()*+,;=:@%/-]*$/.test(p) && !p.startsWith("/admin") && !p.startsWith("/_next") && !p.startsWith("/api");

async function check(from: string, to: string, code: number, ignoreId?: number): Promise<string | null> {
  if (!fromOk(from) || from === "/") return "“From” must be a path on this site, like /old-page.";
  if (code === 410) return null;
  if (!to) return "Add where it should go.";
  if (/^https?:\/\//.test(to)) return null;
  if (!to.startsWith("/")) return "“To” must start with / or https://";
  if (normPath(to) === from) return "A page can't redirect to itself.";
  // walk the chain to catch loops
  let cur = normPath(to);
  for (let i = 0; i < 10; i++) {
    const next = await one<{ to_path: string; id: number }>(`SELECT id, to_path FROM cms.cms_redirects WHERE from_path = $1 AND active`, [cur]);
    if (!next || next.id === ignoreId) break;
    if (normPath(next.to_path) === from) return "This would create a redirect loop.";
    cur = normPath(next.to_path);
  }
  return null;
}

/** Point new redirects straight at the final page instead of creating a chain. */
async function finalTarget(to: string): Promise<string> {
  let cur = to;
  for (let i = 0; i < 10; i++) {
    if (/^https?:/.test(cur)) return cur;
    const n = await one<{ to_path: string; code: number }>(`SELECT to_path, code FROM cms.cms_redirects WHERE from_path = $1 AND active AND code IN (301,308)`, [normPath(cur)]);
    if (!n) return cur;
    cur = n.to_path;
  }
  return cur;
}

function done() {
  resetRoutes();
  updateTag("cms:redirects");
  updateTag("cms:seo");
}

export async function saveRedirect(_: FormState, fd: FormData): Promise<FormState> {
  const u = await assertUser("redirects");
  const id = Number(fd.get("id") || 0) || undefined;
  const from = normPath(String(fd.get("from") ?? ""));
  const code = [301, 302, 307, 308, 410].includes(Number(fd.get("code"))) ? Number(fd.get("code")) : 301;
  const match = fd.get("match") === "prefix" ? "prefix" : "exact";
  const rawTo = String(fd.get("to") ?? "").trim();
  const err = await check(from, rawTo, code, id);
  if (err) return { error: err };
  const to = code === 410 ? "" : await finalTarget(rawTo);
  const expires = String(fd.get("expires") ?? "").trim() || null;
  const note = String(fd.get("note") ?? "").trim().slice(0, 300) || null;
  const before = id ? await one<Row>(`SELECT * FROM cms.cms_redirects WHERE id = $1`, [id]) : await one<Row>(`SELECT * FROM cms.cms_redirects WHERE from_path = $1`, [from]);
  const row = await one<Row>(
    `INSERT INTO cms.cms_redirects (from_path, to_path, code, match, note, expires_at, source, created_by) VALUES ($1,$2,$3,$4,$5,$6,'manual',$7)
     ON CONFLICT (from_path) DO UPDATE SET to_path=$2, code=$3, match=$4, note=$5, expires_at=$6, active=TRUE
     RETURNING *`,
    [from, to, code, match, note, expires, u.name],
  );
  if (id && before && before.from_path !== from) await q(`DELETE FROM cms.cms_redirects WHERE id = $1`, [id]);
  await q(`UPDATE cms.cms_404 SET ignored = TRUE WHERE path = $1`, [from]);
  await logActivity(u, { action: before ? "changed redirect" : "added redirect", target: code === 410 ? `${from} → 410 Gone` : `${from} → ${to}`, kind: "redirect", ref: String(row!.id), before, after: row });
  done();
  const exists = /^https?:/.test(to) || code === 410 || (await siteUrls()).some((x) => x.path === normPath(to));
  return { ok: exists ? `Saved. ${from} now goes to ${to || "410 Gone"}.` : `Saved. Note: ${to} isn't a page we know of. Check it opens.` };
}

export async function deleteRedirect(id: number) {
  const u = await assertUser("redirects");
  const before = await one<Row>(`SELECT * FROM cms.cms_redirects WHERE id = $1`, [id]);
  if (!before) return;
  await q(`DELETE FROM cms.cms_redirects WHERE id = $1`, [id]);
  await logActivity(u, { action: "deleted redirect", target: `${before.from_path} → ${before.to_path || "410"}`, kind: "redirect", ref: String(id), before, after: null });
  done();
}

export async function toggleRedirect(id: number, active: boolean) {
  const u = await assertUser("redirects");
  const before = await one<Row>(`SELECT * FROM cms.cms_redirects WHERE id = $1`, [id]);
  const after = await one<Row>(`UPDATE cms.cms_redirects SET active = $2 WHERE id = $1 RETURNING *`, [id, active]);
  if (after) await logActivity(u, { action: active ? "turned on redirect" : "paused redirect", target: after.from_path, kind: "redirect", ref: String(id), before, after });
  done();
}

export async function ignore404(path: string, ignored = true) {
  await assertUser("redirects");
  await q(`UPDATE cms.cms_404 SET ignored = $2 WHERE path = $1`, [path, ignored]);
  updateTag("cms:redirects");
}

export async function importRedirects(_: FormState, fd: FormData): Promise<FormState> {
  const u = await assertUser("redirects");
  const file = fd.get("file");
  if (!(file instanceof File) || !file.size) return { error: "Choose a CSV file." };
  if (file.size > 2_000_000) return { error: "That file is too big (2 MB max)." };
  const text = await file.text();
  let added = 0;
  const problems: string[] = [];
  for (const [n, line] of text.split(/\r?\n/).entries()) {
    const cols = line.split(/[,;\t]/).map((c) => c.trim().replace(/^"|"$/g, ""));
    if (!cols[0] || /^from/i.test(cols[0])) continue;
    const from = normPath(cols[0].replace(/^https?:\/\/[^/]+/, ""));
    const to = (cols[1] ?? "").replace(/^https?:\/\/(www\.)?automiqautomation\.com/, "") || "/";
    const code = [301, 302, 410].includes(Number(cols[2])) ? Number(cols[2]) : 301;
    const err = await check(from, to, code);
    if (err) {
      problems.push(`Line ${n + 1}: ${err}`);
      continue;
    }
    await q(
      `INSERT INTO cms.cms_redirects (from_path, to_path, code, source, created_by) VALUES ($1,$2,$3,'imported',$4)
       ON CONFLICT (from_path) DO UPDATE SET to_path=$2, code=$3, active=TRUE`,
      [from, code === 410 ? "" : to, code, u.name],
    );
    added++;
  }
  await logActivity(u, { action: `imported ${added} redirects`, target: file.name, kind: "redirect", ref: "" });
  done();
  return problems.length ? { ok: `Imported ${added}. Skipped ${problems.length}: ${problems.slice(0, 3).join(" ")}` } : { ok: `Imported ${added} redirects.` };
}
