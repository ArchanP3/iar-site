import { clientKey, underLimit } from "@/lib/cms/auth";
import { cmsEnabled, q } from "@/lib/cms/db";

/* Records a missing page that a visitor tried to open (see NotFoundBeacon). */
export async function POST(req: Request) {
  if (!cmsEnabled()) return new Response(null, { status: 204 });
  try {
    // At most 30 reports per network per 15 minutes; the nightly job also caps the table.
    if (!(await underLimit(`404:${await clientKey()}`, 30))) return new Response(null, { status: 204 });
    const raw = await req.text();
    if (raw.length > 2_000) return new Response(null, { status: 204 });
    const { path, ref } = JSON.parse(raw) as { path?: string; ref?: string };
    const p = String(path ?? "").slice(0, 300).toLowerCase().replace(/\/+$/, "") || "/";
    if (!p.startsWith("/") || /^\/(admin|_next|api)\b/.test(p)) return new Response(null, { status: 204 });
    const ua = req.headers.get("user-agent") ?? "";
    if (/bot|crawler|spider|curl|python/i.test(ua) && !/googlebot|bingbot/i.test(ua)) return new Response(null, { status: 204 });
    await q(
      `INSERT INTO cms.cms_404 (path, referrer) VALUES ($1, $2)
       ON CONFLICT (path) DO UPDATE SET hits = cms.cms_404.hits + 1, last_seen = now(), referrer = COALESCE(NULLIF($2, ''), cms.cms_404.referrer)`,
      [p, String(ref ?? "").slice(0, 300)],
    );
  } catch {}
  return new Response(null, { status: 204 });
}
