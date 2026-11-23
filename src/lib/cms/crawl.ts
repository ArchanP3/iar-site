import "server-only";
import { q } from "./db";
import { siteUrls, type Group } from "./inventory";
import { normPath } from "./seo";

/* ------------------------------------------------------------------ */
/*  Site crawler + SEO audit. Fetches every public page of the site,    */
/*  reads what Google reads (title, description, headings, images,      */
/*  links, schema) and stores it in cms.cms_crawl. The audit is computed    */
/*  from those rows.                                                    */
/* ------------------------------------------------------------------ */

export type Heading = [level: number, text: string];
export type CrawlRow = {
  path: string; status: number; title: string; description: string; canonical: string; robots: string; headings: Heading[];
  images: number; images_noalt: number; words: number; links: string[]; inbound: number; ld_types: string[]; bytes: number; ms: number; crawled_at: Date;
};

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
const strip = (s: string) => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const attr = (tag: string, name: string) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
  return m ? decode(m[2] ?? m[3] ?? "") : null;
};

export function parse(html: string, origin: string) {
  const head = html.slice(0, html.search(/<body[\s>]/i) > 0 ? html.search(/<body[\s>]/i) : html.length);
  const title = strip(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const metas = head.match(/<meta\s[^>]*>/gi) ?? [];
  const meta = (n: string) => {
    const m = metas.find((t) => (attr(t, "name") ?? "").toLowerCase() === n);
    return m ? attr(m, "content") ?? "" : "";
  };
  const canonicalTag = (head.match(/<link\s[^>]*rel=["']canonical["'][^>]*>/i) ?? [])[0];
  const body = html.slice(Math.max(0, html.search(/<body[\s>]/i)));
  const clean = body.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<template[\s\S]*?<\/template>/gi, " ");
  const headings: Heading[] = [];
  for (const m of clean.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)) {
    const t = strip(m[2]);
    if (t) headings.push([Number(m[1]), t.slice(0, 160)]);
  }
  const imgs = clean.match(/<img\s[^>]*>/gi) ?? [];
  const noalt = imgs.filter((t) => {
    const a = attr(t, "alt");
    const decorative = /aria-hidden=["']true["']|role=["']presentation["']/i.test(t);
    return (a === null || a.trim() === "") && !decorative;
  }).length;
  const imageList: [string, string][] = [];
  for (const t of imgs) {
    let src = attr(t, "src") ?? "";
    const m = src.match(/\/_next\/image\?url=([^&]+)/);
    if (m) src = decodeURIComponent(m[1]);
    if (src.startsWith(origin)) src = src.slice(origin.length);
    if (!src || src.startsWith("data:") || imageList.some((x) => x[0] === src)) continue;
    imageList.push([src, (attr(t, "alt") ?? "").slice(0, 200)]);
    if (imageList.length >= 30) break;
  }
  const main = clean.match(/<main[\s\S]*<\/main>/i)?.[0] ?? clean;
  const text = strip(main.replace(/<(header|footer|nav)[\s\S]*?<\/\1>/gi, " "));
  const words = text ? text.split(" ").length : 0;
  const links = new Set<string>();
  for (const m of clean.matchAll(/<a\s[^>]*href=["']([^"'#]+)["'][^>]*>/gi)) {
    let h = decode(m[1]);
    if (h.startsWith(origin)) h = h.slice(origin.length) || "/";
    if (!h.startsWith("/") || h.startsWith("//") || /\.(pdf|png|jpe?g|webp|svg|zip|xml|txt)$/i.test(h) || h.startsWith("/admin") || h.startsWith("/api")) continue;
    links.add(normPath(h));
  }
  const ld: string[] = [];
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const walk = (v: unknown) => {
        if (Array.isArray(v)) v.forEach(walk);
        else if (v && typeof v === "object") {
          const t = (v as Record<string, unknown>)["@type"];
          if (typeof t === "string") ld.push(t);
          else if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && ld.push(x));
          const g = (v as Record<string, unknown>)["@graph"];
          if (g) walk(g);
        }
      };
      walk(JSON.parse(m[1]));
    } catch {}
  }
  return {
    title, description: meta("description"), robots: meta("robots"), canonical: canonicalTag ? attr(canonicalTag, "href") ?? "" : "",
    headings, images: imgs.length, images_noalt: noalt, words, links: [...links], ld_types: [...new Set(ld)], imageList,
  };
}

async function fetchPage(origin: string, path: string) {
  const t0 = Date.now();
  try {
    const res = await fetch(origin + path, { redirect: "manual", headers: { "user-agent": "IAR-CMS-Audit/1.0", accept: "text/html" }, signal: AbortSignal.timeout(20_000), cache: "no-store" });
    const html = res.status === 200 ? await res.text() : "";
    return { status: res.status, html, ms: Date.now() - t0, location: res.headers.get("location") ?? "" };
  } catch {
    return { status: 0, html: "", ms: Date.now() - t0, location: "" };
  }
}

async function pool<T>(items: T[], n: number, fn: (x: T) => Promise<void>, deadline: number) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length && Date.now() < deadline) await fn(items[i++]);
  }));
}

/** Crawl the site. Stops early (and saves what it has) if it runs out of time. */
export async function runCrawl(origin: string, opts: { maxMs?: number; parts?: string[] } = {}) {
  const deadline = Date.now() + (opts.maxMs ?? 50_000);
  const run = (await q<{ id: number }>(`INSERT INTO cms.cms_audit_runs DEFAULT VALUES RETURNING id`))[0];
  const urls = (await siteUrls()).map((u) => u.path).concat(opts.parts ?? []);
  const seen = new Map<string, Awaited<ReturnType<typeof parse>> & { status: number; ms: number; bytes: number }>();
  await pool(urls, 6, async (path) => {
    const r = await fetchPage(origin, path);
    const p = r.html ? parse(r.html, origin) : { title: "", description: "", robots: "", canonical: "", headings: [], images: 0, images_noalt: 0, words: 0, links: [], ld_types: [], imageList: [] as [string, string][] };
    seen.set(path, { ...p, status: r.status, ms: r.ms, bytes: r.html.length });
  }, deadline);

  // Links to pages we did not crawl: check they work
  const targets = new Set<string>();
  for (const v of seen.values()) v.links.forEach((l) => !seen.has(l) && targets.add(l));
  const extra = new Map<string, number>();
  await pool([...targets].slice(0, 300), 6, async (path) => {
    const r = await fetchPage(origin, path);
    extra.set(path, r.status);
  }, deadline + 8_000);

  const inbound = new Map<string, number>();
  for (const [from, v] of seen) v.links.forEach((l) => l !== from && inbound.set(l, (inbound.get(l) ?? 0) + 1));

  await q(`DELETE FROM cms.cms_crawl`);
  const rows = [...seen.entries()];
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const vals: unknown[] = [];
    const sql = chunk.map(([path, v], k) => {
      vals.push(path, v.status, v.title, v.description, v.canonical, v.robots, JSON.stringify(v.headings), v.images, v.images_noalt, v.words, JSON.stringify(v.links), inbound.get(path) ?? 0, v.ld_types, v.bytes, v.ms, JSON.stringify(v.imageList));
      const b = k * 16;
      return `(${Array.from({ length: 16 }, (_, j) => `$${b + j + 1}`).join(",")})`;
    });
    await q(`INSERT INTO cms.cms_crawl (path,status,title,description,canonical,robots,headings,images,images_noalt,words,links,inbound,ld_types,bytes,ms,image_list) VALUES ${sql.join(",")}`, vals);
  }
  const broken = [...extra.entries()].filter(([, s]) => s === 404 || s === 410 || s === 0).map(([p]) => p);
  const audit = await computeAudit(broken);
  await q(`UPDATE cms.cms_audit_runs SET finished_at = now(), pages = $2, score = $3, summary = $4 WHERE id = $1`, [run.id, seen.size, audit.score, JSON.stringify({ ...audit.summary, broken })]);
  return { pages: seen.size, score: audit.score, complete: seen.size === urls.length };
}

/* ------------------------------------------------------------------ */
/*  Audit rules                                                         */
/* ------------------------------------------------------------------ */
export type Severity = "critical" | "warning" | "tip";
export type Issue = { id: string; severity: Severity; title: string; pages: string[]; detail: string; fix: string; fixHref: string; category: Cat };
type Cat = "titles" | "indexing" | "links" | "images" | "schema" | "speed";
export const catLabel: Record<Cat, string> = { titles: "Titles & descriptions", indexing: "Indexing & canonicals", links: "Links", images: "Images", schema: "Schema", speed: "Speed" };

const CONTENT_GROUPS: Group[] = ["main", "services", "brands", "industries", "cities", "blog", "landing"];

export async function computeAudit(brokenTargets?: string[]) {
  const rows = await q<CrawlRow>(`SELECT * FROM cms.cms_crawl`);
  const urls = await siteUrls();
  const groupOf = new Map(urls.map((u) => [u.path, u.group]));
  const redirects = await q<{ from_path: string; to_path: string }>(`SELECT from_path, to_path FROM cms.cms_redirects WHERE active`);
  const latest = brokenTargets ?? ((await q<{ summary: { broken?: string[] } }>(`SELECT summary FROM cms.cms_audit_runs WHERE finished_at IS NOT NULL ORDER BY id DESC LIMIT 1`))[0]?.summary?.broken ?? []);
  const ok = rows.filter((r) => r.status === 200);
  const indexable = ok.filter((r) => !/noindex/i.test(r.robots) && groupOf.get(r.path) !== "system");
  const issues: Issue[] = [];
  const push = (i: Issue) => i.pages.length && issues.push(i);

  const byTitle = new Map<string, string[]>();
  indexable.forEach((r) => r.title && byTitle.set(r.title, [...(byTitle.get(r.title) ?? []), r.path]));
  const dup = [...byTitle.values()].filter((v) => v.length > 1).flat();
  push({ id: "dup-title", severity: "critical", category: "titles", title: "Duplicate title tag", pages: dup, detail: "Two or more pages share a title, so Google can't tell them apart.", fix: "Fix titles", fixHref: "/admin/pages?issue=dup-title" });
  push({ id: "no-title", severity: "critical", category: "titles", title: "Missing title tag", pages: indexable.filter((r) => !r.title).map((r) => r.path), detail: "Every page needs a title.", fix: "Add titles", fixHref: "/admin/pages?issue=no-title" });
  const brokenFrom = ok.filter((r) => r.links.some((l) => latest.includes(l))).map((r) => r.path);
  push({ id: "broken-link", severity: "critical", category: "links", title: "Broken internal link (404)", pages: brokenFrom, detail: latest.length ? `Links to ${latest.slice(0, 3).join(", ")}${latest.length > 3 ? "…" : ""}, which don't exist.` : "", fix: "Add redirect", fixHref: "/admin/redirects" });
  push({ id: "h1", severity: "critical", category: "titles", title: "Missing or multiple H1 headings", pages: indexable.filter((r) => r.headings.filter((h) => h[0] === 1).length !== 1).map((r) => r.path), detail: "Each page should have exactly one main heading (H1).", fix: "Review", fixHref: "/admin/pages?issue=h1" });
  push({ id: "long-title", severity: "warning", category: "titles", title: "Title longer than 60 characters", pages: indexable.filter((r) => r.title.length > 60).map((r) => r.path), detail: "Google shows about 60 characters and cuts the rest.", fix: "Shorten", fixHref: "/admin/pages?issue=long-title" });
  push({ id: "short-title", severity: "tip", category: "titles", title: "Title shorter than 30 characters", pages: indexable.filter((r) => r.title && r.title.length < 30).map((r) => r.path), detail: "Short titles waste space you could use for keywords.", fix: "Review", fixHref: "/admin/pages?issue=short-title" });
  push({ id: "no-desc", severity: "warning", category: "titles", title: "Missing meta description", pages: indexable.filter((r) => !r.description).map((r) => r.path), detail: "Google writes its own snippet when there is none.", fix: "Add", fixHref: "/admin/pages?issue=no-desc" });
  push({ id: "long-desc", severity: "warning", category: "titles", title: "Meta description over 160 characters", pages: indexable.filter((r) => r.description.length > 160).map((r) => r.path), detail: "Google shortens long descriptions.", fix: "Shorten", fixHref: "/admin/pages?issue=long-desc" });
  push({ id: "short-desc", severity: "tip", category: "titles", title: "Meta description under 70 characters", pages: indexable.filter((r) => r.description && r.description.length < 70).map((r) => r.path), detail: "A fuller description gets more clicks.", fix: "Review", fixHref: "/admin/pages?issue=short-desc" });
  push({ id: "alt", severity: "warning", category: "images", title: "Images without alt text", pages: ok.filter((r) => r.images_noalt > 0).map((r) => r.path), detail: `${ok.reduce((n, r) => n + r.images_noalt, 0)} images have no description for Google and screen readers.`, fix: "Review", fixHref: "/admin/pages?issue=alt" });
  const redirFrom = new Set(redirects.map((r) => r.from_path));
  const chains = redirects.filter((r) => redirFrom.has(normPath(r.to_path))).map((r) => r.from_path);
  push({ id: "chain", severity: "warning", category: "links", title: "Redirect chain", pages: chains, detail: "A redirect points to another redirect. Point it straight at the final page.", fix: "Flatten", fixHref: "/admin/redirects" });
  push({ id: "canonical-off", severity: "warning", category: "indexing", title: "Canonical points to another page", pages: indexable.filter((r) => r.canonical && normPath(new URL(r.canonical, "https://x").pathname) !== r.path).map((r) => r.path), detail: "These pages tell Google another URL is the main one.", fix: "Review", fixHref: "/admin/pages?issue=canonical-off" });
  push({ id: "status", severity: "critical", category: "indexing", title: "Page does not load (error)", pages: rows.filter((r) => r.status !== 200 && groupOf.get(r.path) !== "system").map((r) => r.path), detail: "These listed pages returned an error or a redirect.", fix: "Review", fixHref: "/admin/pages?issue=status" });
  push({ id: "thin", severity: "tip", category: "titles", title: "Thin content (under 300 words)", pages: indexable.filter((r) => CONTENT_GROUPS.includes(groupOf.get(r.path) as Group) && r.words < 300).map((r) => r.path), detail: "Pages with more useful text tend to rank better.", fix: "Review", fixHref: "/admin/pages?issue=thin" });
  push({ id: "orphan", severity: "tip", category: "links", title: "Orphan pages (no internal links in)", pages: indexable.filter((r) => r.inbound === 0 && r.path !== "/").map((r) => r.path), detail: "No other page links here, so Google finds it only through the sitemap.", fix: "Review", fixHref: "/admin/pages?issue=orphan" });
  push({ id: "schema", severity: "tip", category: "schema", title: "No structured data", pages: indexable.filter((r) => r.ld_types.length === 0 && groupOf.get(r.path) !== "legal").map((r) => r.path), detail: "Schema helps Google show rich results.", fix: "Add schema", fixHref: "/admin/schema" });
  push({ id: "slow", severity: "tip", category: "speed", title: "Slow server response (over 1.5 s)", pages: ok.filter((r) => r.ms > 1500).map((r) => r.path), detail: "Measured when the audit ran.", fix: "Review", fixHref: "/admin/pages?issue=slow" });

  const weight: Record<Severity, number> = { critical: 20, warning: 7, tip: 2 };
  const pen = new Map<string, number>();
  const catPen: Record<Cat, Map<string, number>> = { titles: new Map(), indexing: new Map(), links: new Map(), images: new Map(), schema: new Map(), speed: new Map() };
  issues.forEach((i) => i.pages.forEach((p) => {
    pen.set(p, (pen.get(p) ?? 0) + weight[i.severity]);
    catPen[i.category].set(p, (catPen[i.category].get(p) ?? 0) + weight[i.severity] * 2);
  }));
  const n = Math.max(1, indexable.length);
  const scoreOf = (m: Map<string, number>) => Math.round(indexable.reduce((s, r) => s + Math.max(0, 100 - (m.get(r.path) ?? 0)), 0) / n);
  const score = rows.length ? scoreOf(pen) : 0;
  const cats = Object.fromEntries(Object.entries(catPen).map(([k, m]) => [k, rows.length ? scoreOf(m) : 0])) as Record<Cat, number>;
  const healthy = indexable.filter((r) => !pen.has(r.path)).length;
  const count = (s: Severity) => issues.filter((i) => i.severity === s).length;
  return {
    score, cats, issues: issues.sort((a, b) => ["critical", "warning", "tip"].indexOf(a.severity) - ["critical", "warning", "tip"].indexOf(b.severity) || b.pages.length - a.pages.length),
    summary: { issues: issues.length, critical: count("critical"), warnings: count("warning"), tips: count("tip"), healthy, crawled: rows.length },
  };
}
