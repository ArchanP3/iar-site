import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ChevronRight, ExternalLink } from "lucide-react";
import { can, requireUser } from "@/lib/cms/auth";
import { one, q } from "@/lib/cms/db";
import { normPath, type PageSeo } from "@/lib/cms/seo";
import { groupLabel, siteUrls } from "@/lib/cms/inventory";
import type { CrawlRow } from "@/lib/cms/crawl";
import { SITE_URL } from "@/lib/site";
import { getPart } from "@/lib/parts/repository";
import { PageHead, Pill } from "@/components/admin/ui";
import PageEditor from "@/components/admin/PageEditor";

type SP = Promise<{ path?: string }>;

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<p className="text-[#8494AB]">Loading…</p>}>
      <Edit searchParams={searchParams} />
    </Suspense>
  );
}

const STOP = new Set(["the", "and", "for", "with", "your", "from", "automiq", "automation", "drive", "services", "repair", "&", "|", "-", "a", "of", "in", "to"]);
const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w));

async function Edit({ searchParams }: { searchParams: SP }) {
  const u = await requireUser("pages");
  const path = normPath((await searchParams).path ?? "");
  const urls = await siteUrls();
  // Part pages aren't in the page list (they have their own sitemaps): accept any existing part.
  const part = path.match(/^\/parts\/([a-z0-9-]+)$/);
  const info = urls.find((x) => x.path === path) ?? (part && (await getPart(part[1])) ? { path, group: "shop" as const } : undefined);
  if (!info) notFound();
  const [o, cr, others] = await Promise.all([
    one<PageSeo>(`SELECT * FROM cms.cms_page_seo WHERE path = $1`, [path]),
    one<CrawlRow>(`SELECT * FROM cms.cms_crawl WHERE path = $1`, [path]),
    q<{ path: string; title: string; links: string[] }>(`SELECT path, title, links FROM cms.cms_crawl WHERE status = 200 AND path <> $1`, [path]),
  ]);
  const overrides = await q<{ path: string; title: string | null }>(`SELECT path, title FROM cms.cms_page_seo WHERE title IS NOT NULL AND path <> $1`, [path]);
  const titleOf = new Map(others.map((x) => [x.path, x.title]));
  overrides.forEach((x) => x.title && titleOf.set(x.path, x.title));
  const otherTitles = [...titleOf.values()].filter(Boolean);

  const base = words(`${o?.focus_keyword ?? ""} ${o?.title ?? cr?.title ?? ""}`);
  const suggestions = others
    .filter((x) => !x.links.includes(path))
    .map((x) => ({ path: x.path, title: x.title, score: words(x.title).filter((w) => base.includes(w)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const shown = o?.public_path || path;
  return (
    <>
      <PageHead
        crumb={<><Link href="/admin/pages" className="hover:text-[#0052CC]">Pages</Link><ChevronRight size={13} /><span>{groupLabel[info.group]}</span></>}
        title={cr?.headings.find((h) => h[0] === 1)?.[1] ?? (o?.title || cr?.title || path)}
        sub={
          <span className="flex flex-wrap items-center gap-2">
            {o ? <Pill tone="blue">Edited in CMS</Pill> : <Pill tone="ok">Website defaults</Pill>}
            <a href={shown} target="_blank" className="inline-flex items-center gap-1 font-mono text-[12.5px] hover:text-[#0052CC]">{SITE_URL.replace(/^https?:\/\//, "")}{shown} <ExternalLink size={12} /></a>
          </span>
        }
      />
      <PageEditor
        key={`${path}:${o ? "edited" : "default"}`}
        path={path}
        group={info.group}
        site={SITE_URL}
        saved={o}
        live={cr ? { title: cr.title, description: cr.description, canonical: cr.canonical, headings: cr.headings, images: cr.images, noalt: cr.images_noalt, inbound: cr.inbound, ld: cr.ld_types, words: cr.words, crawledAt: String(cr.crawled_at) } : null}
        otherTitles={otherTitles}
        suggestions={suggestions}
        canScripts={can(u.role, "tracking")}
      />
    </>
  );
}
