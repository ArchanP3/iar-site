import "server-only";
import { q } from "./db";
import { siteUrls, type Group } from "./inventory";
import { computeAudit, type CrawlRow, type Issue } from "./crawl";
import type { PageSeo } from "./seo";

export type PageRow = {
  path: string; shown: string; group: Group; title: string; description: string; noindex: boolean; edited: boolean; score: number | null; status: number | null;
  issues: string[];
};

const W = { critical: 20, warning: 7, tip: 2 } as const;

export async function pagesOverview() {
  const [urls, crawl, seo, audit] = await Promise.all([
    siteUrls(),
    q<CrawlRow>(`SELECT path, status, title, description, robots FROM cms.cms_crawl`),
    q<PageSeo>(`SELECT * FROM cms.cms_page_seo`),
    computeAudit(),
  ]);
  const c = new Map(crawl.map((r) => [r.path, r]));
  const s = new Map(seo.map((r) => [r.path, r]));
  const pen = new Map<string, number>();
  const issuesOf = new Map<string, string[]>();
  audit.issues.forEach((i: Issue) => i.pages.forEach((p) => {
    pen.set(p, (pen.get(p) ?? 0) + W[i.severity]);
    issuesOf.set(p, [...(issuesOf.get(p) ?? []), i.id]);
  }));
  const rows: PageRow[] = urls.map((u) => {
    const cr = c.get(u.path);
    const o = s.get(u.path);
    return {
      path: u.path,
      shown: o?.public_path || u.path,
      group: u.group,
      title: o?.title || cr?.title || "",
      description: o?.description || cr?.description || "",
      noindex: o ? o.noindex : /noindex/i.test(cr?.robots ?? ""),
      edited: Boolean(o),
      score: cr && u.group !== "system" ? Math.max(0, 100 - (pen.get(u.path) ?? 0)) : null,
      status: cr?.status ?? null,
      issues: issuesOf.get(u.path) ?? [],
    };
  });
  return { rows, audit, scanned: crawl.length > 0 };
}
