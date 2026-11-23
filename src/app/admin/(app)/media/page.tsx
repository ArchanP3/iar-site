import { Suspense } from "react";
import { can, requireUser } from "@/lib/cms/auth";
import { q } from "@/lib/cms/db";
import { readSetting } from "@/lib/cms/settings";
import { PageHead } from "@/components/admin/ui";
import MediaLibrary, { type MediaItem } from "@/components/admin/MediaLibrary";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-[#91919E]">Loading…</p>}>
      <Media />
    </Suspense>
  );
}

async function Media() {
  const u = await requireUser("media");
  const [rows, posts, landing, seo, site] = await Promise.all([
    q<Omit<MediaItem, "used" | "created_at"> & { created_at: Date }>(`SELECT id, filename, mime, width, height, bytes, original_bytes, original_name, alt, caption, folder, created_at FROM cms.cms_media ORDER BY id DESC`),
    q<{ slug: string; title: string; body: string; cover: string | null }>(`SELECT slug, title, body, cover FROM cms.cms_posts`),
    q<{ name: string; blocks: unknown }>(`SELECT name, blocks FROM cms.cms_landing`),
    q<{ path: string; og_image: string | null; schema_json: string | null }>(`SELECT path, og_image, schema_json FROM cms.cms_page_seo WHERE og_image IS NOT NULL OR schema_json IS NOT NULL`),
    readSetting("site"),
  ]);
  const usedOn = (f: string) => {
    const u: string[] = [];
    posts.forEach((p) => (p.body.includes(f) || p.cover?.includes(f)) && u.push(`Blog: ${p.title}`));
    landing.forEach((l) => JSON.stringify(l.blocks).includes(f) && u.push(`Page: ${l.name}`));
    seo.forEach((s) => (s.og_image?.includes(f) || s.schema_json?.includes(f)) && u.push(s.path));
    if (site.ogImage.includes(f)) u.push("Default share image");
    return u;
  };
  const items: MediaItem[] = rows.map((r) => ({ ...r, created_at: String(r.created_at), used: usedOn(r.filename) }));
  const folders = [...new Set(["General", "Parts", "Services", "Blog", "Industries", ...rows.map((r) => r.folder)])];
  return (
    <>
      <PageHead title="Media Library" sub="Every upload is resized, compressed and converted to WebP automatically. Missing alt text is flagged." />
      <MediaLibrary items={items} folders={folders} canDelete={can(u.role, "pages")} />
    </>
  );
}
