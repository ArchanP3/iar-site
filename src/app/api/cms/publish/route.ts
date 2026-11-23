import { revalidateTag } from "@/lib/cms/cache";
import { sameSecret } from "@/lib/cms/auth";
import { cmsEnabled, q } from "@/lib/cms/db";
import { postUrl } from "@/lib/blog";
import { clearGone } from "@/lib/cms/redirects";
import { SITE_COUNTRY } from "@/lib/site";

/* Every 15 minutes (vercel.json): scheduled posts whose time has come are marked
   published and the blog list, the post and the sitemaps are refreshed, so a post
   goes live on time instead of when the hourly cache next expires. */

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || !sameSecret(given, secret)) return new Response("Not allowed", { status: 401 });
  // .ca and .com share one database: scheduled jobs run on the .com site only (it refreshes .ca too).
  if (SITE_COUNTRY === "CA") return Response.json({ ok: true, skipped: "runs on the .com site" });
  if (!cmsEnabled()) return Response.json({ ok: false, reason: "no database" });
  const due = await q<{ slug: string }>(
    `UPDATE cms.cms_posts SET status = 'published', updated_at = now()
      WHERE status = 'scheduled' AND publish_at <= now() RETURNING slug`,
  );
  if (due.length) {
    revalidateTag("cms:posts", "max");
    revalidateTag("cms:sitemaps", "max");
    for (const p of due) {
      revalidateTag(`cms:post:${p.slug}`, "max");
      await clearGone(postUrl(p.slug));
    }
  }
  return Response.json({ ok: true, published: due.map((p) => p.slug) });
}
