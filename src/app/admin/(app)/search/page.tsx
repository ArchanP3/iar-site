import Link from "next/link";
import { Suspense } from "react";
import { ArrowRightLeft, FileText, Image as ImageIcon, LayoutTemplate, Newspaper, Search } from "lucide-react";
import { can, requireUser } from "@/lib/cms/auth";
import { q } from "@/lib/cms/db";
import { siteUrls } from "@/lib/cms/inventory";
import { postUrl } from "@/lib/blog";
import { Card, PageHead } from "@/components/admin/ui";

type Props = { searchParams: Promise<{ q?: string }> };

export default function Page(props: Props) {
  return (
    <Suspense fallback={<p className="text-[#91919E]">Searching…</p>}>
      <Results {...props} />
    </Suspense>
  );
}

type Hit = { href: string; title: string; sub: string };

async function Results({ searchParams }: Props) {
  const u = await requireUser("dashboard");
  const term = ((await searchParams).q ?? "").trim().slice(0, 80);
  const like = `%${term.replace(/[%_\\]/g, (m) => "\\" + m)}%`;
  const groups: { label: string; icon: React.ReactNode; hits: Hit[] }[] = [];
  if (term) {
    const lc = term.toLowerCase();
    if (can(u.role, "pages")) {
      const titles = await q<{ path: string; title: string }>(`SELECT c.path, COALESCE(NULLIF(s.title,''), c.title) AS title FROM cms.cms_crawl c LEFT JOIN cms.cms_page_seo s ON s.path = c.path WHERE c.path ILIKE $1 OR c.title ILIKE $1 OR s.title ILIKE $1 OR c.description ILIKE $1 LIMIT 30`, [like]);
      const known = new Set(titles.map((t) => t.path));
      const more = (await siteUrls()).filter((x) => !known.has(x.path) && x.path.includes(lc)).slice(0, 30 - titles.length).map((x) => ({ path: x.path, title: "" }));
      groups.push({ label: "Pages", icon: <FileText size={15} />, hits: [...titles, ...more].map((t) => ({ href: `/admin/pages/edit?path=${encodeURIComponent(t.path)}`, title: t.title || t.path, sub: t.path })) });
    }
    if (can(u.role, "blog")) groups.push({ label: "Blog posts", icon: <Newspaper size={15} />, hits: (await q<{ id: number; title: string; slug: string; status: string }>(`SELECT id, title, slug, status FROM cms.cms_posts WHERE title ILIKE $1 OR slug ILIKE $1 OR body ILIKE $1 ORDER BY updated_at DESC LIMIT 15`, [like])).map((p) => ({ href: `/admin/blog/${p.id}`, title: p.title, sub: `${p.status} · ${postUrl(p.slug)}` })) });
    if (can(u.role, "landing")) groups.push({ label: "Landing pages", icon: <LayoutTemplate size={15} />, hits: (await q<{ id: number; name: string; path: string; kind: string }>(`SELECT id, name, path, kind FROM cms.cms_landing WHERE name ILIKE $1 OR path ILIKE $1 LIMIT 15`, [like])).map((p) => ({ href: `/admin/landing/${p.id}`, title: p.name, sub: p.kind === "template" ? "Template" : p.path })) });
    if (can(u.role, "redirects")) groups.push({ label: "Redirects", icon: <ArrowRightLeft size={15} />, hits: (await q<{ from_path: string; to_path: string; code: number }>(`SELECT from_path, to_path, code FROM cms.cms_redirects WHERE from_path ILIKE $1 OR to_path ILIKE $1 LIMIT 15`, [like])).map((r) => ({ href: `/admin/redirects?q=${encodeURIComponent(r.from_path)}`, title: r.from_path, sub: `${r.code} → ${r.to_path || "Gone"}` })) });
    if (can(u.role, "media")) groups.push({ label: "Images", icon: <ImageIcon size={15} />, hits: (await q<{ filename: string; alt: string }>(`SELECT filename, alt FROM cms.cms_media WHERE filename ILIKE $1 OR alt ILIKE $1 OR caption ILIKE $1 LIMIT 15`, [like])).map((m) => ({ href: "/admin/media", title: m.filename, sub: m.alt || "No alt text" })) });
  }
  const found = groups.filter((g) => g.hits.length);
  return (
    <>
      <PageHead title={term ? `Results for “${term}”` : "Search"} />
      <form className="flex max-w-140 items-center gap-2.5 rounded-[11px] border border-[#EAEAEC] bg-white px-3.5"><Search size={16} className="text-[#91919E]" /><input name="q" defaultValue={term} autoFocus placeholder="Search pages, posts, redirects, images…" className="h-11 flex-1 bg-transparent outline-none" /></form>
      {term && !found.length && <p className="text-[#696976]">Nothing found. Try a part of a URL, a word from a title, or a file name.</p>}
      <div className="grid items-start gap-5 xl:grid-cols-2">
        {found.map((g) => (
          <Card key={g.label} title={`${g.label} (${g.hits.length})`} icon={g.icon} pad={false}>
            {g.hits.map((h) => (
              <Link key={h.href + h.title} href={h.href} className="block border-b border-[#F3F3F4] px-5 py-2.5 last:border-0 hover:bg-[#FAFAFB]">
                <div className="truncate text-[13.5px] font-bold">{h.title}</div>
                <div className="truncate font-mono text-[12px] text-[#91919E]">{h.sub}</div>
              </Link>
            ))}
          </Card>
        ))}
      </div>
    </>
  );
}
