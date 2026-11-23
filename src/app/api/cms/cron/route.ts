import { revalidateTag } from "@/lib/cms/cache";
import { sameSecret } from "@/lib/cms/auth";
import { cmsEnabled, q } from "@/lib/cms/db";
import { SITE_COUNTRY, SITE_URL } from "@/lib/site";
import { runCrawl } from "@/lib/cms/crawl";
import { partUrl, sitemapSlugs } from "@/lib/parts/repository";

/* Nightly job: re-scan the site for the SEO Audit, refresh scheduled posts and Google data,
   and clear expired sign-ins. Call it once a day with the CRON_SECRET:
     Vercel: vercel.json "crons" (sends the secret automatically)
     Any other server: curl -H "Authorization: Bearer $CRON_SECRET" https://<site>/api/cms/cron */

export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  // Header only: a secret in the URL ends up in logs.
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || !sameSecret(given, secret)) return new Response("Not allowed", { status: 401 });
  // .ca and .com share one database: scheduled jobs run on the .com site only (it refreshes .ca too).
  if (SITE_COUNTRY === "CA") return Response.json({ ok: true, skipped: "runs on the .com site" });
  if (!cmsEnabled()) return Response.json({ ok: false, reason: "no database" });
  revalidateTag("cms:posts", "max");
  revalidateTag("cms:google", "max");
  await q(`DELETE FROM cms.cms_sessions WHERE expires_at < now()`).catch(() => {});
  await q(`DELETE FROM cms.cms_crawl WHERE crawled_at < now() - interval '60 days'`).catch(() => {});
  // Keep the logs from growing without limit.
  await q(`DELETE FROM cms.cms_rate WHERE window_start < now() - interval '1 day'`).catch(() => {});
  await q(`DELETE FROM cms.cms_404 WHERE last_seen < now() - interval '180 days' OR path IN (SELECT path FROM cms.cms_404 ORDER BY last_seen DESC OFFSET 5000)`).catch(() => {});
  await q(`DELETE FROM cms.cms_activity WHERE created_at < now() - interval '400 days'`).catch(() => {});
  // Always our own site: never an address taken from the request.
  const origin = (process.env.CMS_CRAWL_ORIGIN || SITE_URL).replace(/\/$/, "");
  const parts = (await sitemapSlugs(0, 150).catch(() => [])).map((r) => partUrl(r.slug));
  const res = await runCrawl(origin, { parts, maxMs: 50_000 });
  await q(`INSERT INTO cms.cms_activity (user_name, action, target, kind, ref) VALUES ('Nightly check', 'ran the SEO scan', $1, 'audit', '')`, [`${res.pages} pages · score ${res.score}`]);
  revalidateTag("cms:audit", "max");
  return Response.json({ ok: true, pages: res.pages, score: res.score, complete: res.complete });
}
