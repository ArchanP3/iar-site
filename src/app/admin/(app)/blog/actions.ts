"use server";

import { updateTag } from "@/lib/cms/cache";
import { redirect } from "next/navigation";
import { assertUser, can } from "@/lib/cms/auth";
import { one, q } from "@/lib/cms/db";
import { logActivity } from "@/lib/cms/activity";
import { posts as codePosts, postUrl } from "@/lib/blog";
import type { CmsPost } from "@/lib/cms/content";
import { renderMarkdown } from "@/lib/cms/markdown";
import { clearGone, goneUrl, moveUrl } from "@/lib/cms/redirects";
import type { FormState } from "../../actions";
import { siteChoice } from "@/lib/site";

const s = (fd: FormData, k: string, max = 300) => String(fd.get(k) ?? "").trim().slice(0, max);
const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);

export async function savePost(_: FormState, fd: FormData): Promise<FormState> {
  const u = await assertUser("blog");
  const id = Number(fd.get("id") || 0);
  const intent = s(fd, "intent", 20) as "draft" | "review" | "publish" | "schedule" | "unpublish";
  const title = s(fd, "title", 200);
  if (!title) return { error: "Add a title." };
  const slug = slugify(s(fd, "slug", 120) || title);
  if (!slug) return { error: "Add a URL slug." };
  if (codePosts.some((p) => p.slug === slug)) return { error: "That URL is used by an existing guide. Choose another slug." };
  const taken = await one(`SELECT 1 FROM cms.cms_posts WHERE slug = $1 AND id <> $2`, [slug, id]);
  if (taken) return { error: "Another post already uses that URL." };

  let faq: [string, string][] = [];
  let related: [string, string][] = [];
  try {
    faq = (JSON.parse(String(fd.get("faq") || "[]")) as [string, string][]).filter((x) => x[0]?.trim() && x[1]?.trim()).slice(0, 20);
    related = (JSON.parse(String(fd.get("related") || "[]")) as [string, string][]).filter((x) => x[0]?.trim() && x[1]?.trim()).slice(0, 10);
  } catch {}
  const tags = s(fd, "tags", 400).split(",").map((t) => t.trim()).filter(Boolean).slice(0, 12);
  const publishAt = s(fd, "publish_at", 40);

  const before = id ? await one<CmsPost>(`SELECT * FROM cms.cms_posts WHERE id = $1`, [id]) : null;
  let status = before?.status ?? "draft";
  if (intent === "draft") status = before?.status === "published" ? "published" : "draft";
  if (intent === "review") status = "review";
  if (intent === "publish" || intent === "schedule") {
    if (!can(u.role, "blog.publish")) status = "review";
    else status = intent === "schedule" && publishAt && new Date(publishAt) > new Date() ? "scheduled" : "published";
  }
  if (intent === "unpublish" && can(u.role, "blog.publish")) status = "draft";
  // "Publish now" on a scheduled post publishes now, not at the old scheduled time.
  const pubAt = status === "scheduled" ? new Date(publishAt) : status === "published" ? (before?.status === "published" ? before.publish_at ?? new Date() : new Date()) : before?.publish_at ?? null;

  const vals = [
    slug, title, s(fd, "excerpt", 400), String(fd.get("body") ?? "").slice(0, 200_000), s(fd, "cover", 400) || null, s(fd, "cover_alt", 200) || null,
    s(fd, "category", 60), tags, s(fd, "author_name", 80), s(fd, "author_role", 80), s(fd, "author_bio", 600), status, pubAt,
    s(fd, "seo_title", 200) || null, s(fd, "seo_description", 400) || null, JSON.stringify(faq), JSON.stringify(related), u.name, siteChoice(fd.get("site")),
  ];
  const row = id
    ? await one<CmsPost>(
        `UPDATE cms.cms_posts SET slug=$1,title=$2,excerpt=$3,body=$4,cover=$5,cover_alt=$6,category=$7,tags=$8,author_name=$9,author_role=$10,author_bio=$11,status=$12,publish_at=$13,
         seo_title=$14,seo_description=$15,faq=$16,related=$17,updated_by=$18,site=$19,updated_at=now() WHERE id=$20 RETURNING *`, [...vals, id])
    : await one<CmsPost>(
        `INSERT INTO cms.cms_posts (slug,title,excerpt,body,cover,cover_alt,category,tags,author_name,author_role,author_bio,status,publish_at,seo_title,seo_description,faq,related,updated_by,site)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *`, vals);

  // A published post that changes URL keeps its old link working
  if (before && before.slug !== slug && (before.status === "published" || before.status === "scheduled")) await moveUrl(postUrl(before.slug), postUrl(slug), u.name);
  if (status === "published" || status === "scheduled") await clearGone(postUrl(slug));
  const verb = !before ? "created" : status !== before.status ? (status === "published" ? "published" : status === "scheduled" ? "scheduled" : status === "review" ? "sent for review" : "unpublished") : "edited";
  await logActivity(u, { action: `${verb} blog post`, target: title, kind: "post", ref: String(row!.id), before, after: row });
  updateTag("cms:posts");
  updateTag(`cms:post:${slug}`);
  if (before) updateTag(`cms:post:${before.slug}`);
  updateTag("cms:seo");
  if (!id) redirect(`/admin/blog/${row!.id}?saved=1`);
  return { ok: status === "published" ? "Published. It's live on the blog." : status === "scheduled" ? `Scheduled for ${new Date(publishAt).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Toronto" })} Toronto time.` : status === "review" ? "Sent for review. An editor can now publish it." : "Draft saved." };
}

/** Preview for the editor: the same safe HTML the live post gets. */
export async function previewPost(body: string): Promise<string> {
  await assertUser("blog");
  return renderMarkdown(String(body).slice(0, 200_000)).html;
}

export async function deletePost(id: number) {
  const u = await assertUser("blog.publish");
  const before = await one<CmsPost>(`SELECT * FROM cms.cms_posts WHERE id = $1`, [id]);
  if (!before) return;
  await q(`DELETE FROM cms.cms_posts WHERE id = $1`, [id]);
  if (before.status === "published") await goneUrl(postUrl(before.slug), u.name);
  await logActivity(u, { action: "deleted blog post", target: before.title, kind: "post", ref: String(id), before, after: null });
  updateTag("cms:posts");
  updateTag(`cms:post:${before.slug}`);
  redirect("/admin/blog");
}

export async function mediaForPicker() {
  await assertUser("media");
  return q<{ filename: string; alt: string; width: number | null }>(`SELECT filename, alt, width FROM cms.cms_media WHERE mime LIKE 'image/%' ORDER BY id DESC LIMIT 200`);
}
