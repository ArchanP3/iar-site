import { Suspense } from "react";
import { ExternalLink, FileCode, Map as MapIcon, Save } from "lucide-react";
import { requireUser } from "@/lib/cms/auth";
import { readSetting } from "@/lib/cms/settings";
import { defaultRobots, indexableUrls } from "@/lib/cms/sitemaps";
import { countIndexableParts } from "@/lib/parts/repository";
import { one } from "@/lib/cms/db";
import { SITE_URL } from "@/lib/site";
import { Card, PageHead, Pill, Table, b } from "@/components/admin/ui";
import RobotsEditor from "@/components/admin/RobotsEditor";
import { saveSitemapToggles } from "./actions";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-[#8494AB]">Loading…</p>}>
      <Sitemaps />
    </Suspense>
  );
}

async function Sitemaps() {
  await requireUser("sitemaps");
  const [site, robots, urls, parts, media, images] = await Promise.all([
    readSetting("site"), readSetting("robots"), indexableUrls(), countIndexableParts().catch(() => 0),
    one<{ n: number }>(`SELECT count(*)::int AS n FROM cms.cms_media`), one<{ n: number }>(`SELECT COALESCE(sum(jsonb_array_length(image_list)),0)::int AS n FROM cms.cms_crawl`),
  ]);
  const count = (k: string) => urls.filter((u) => u.sitemap === k).length;
  const rows = [
    { key: "pages", file: "/sitemaps/pages.xml", what: "Main pages, services, brands, industries, shop, landing pages", n: `${count("pages")} URLs` },
    { key: "posts", file: "/sitemaps/posts.xml", what: "Blog posts", n: `${count("posts")} URLs` },
    { key: "locations", file: "/sitemaps/locations.xml", what: "City and service-area pages", n: `${count("locations")} URLs` },
    { key: "faultCodes", file: "/sitemaps/fault-codes.xml", what: "Fault-code families and guides", n: `${count("faultCodes")} URLs` },
    { key: "images", file: "/sitemaps/images.xml", what: "Images with titles", n: `${(images?.n ?? 0) + (media?.n ?? 0)} images` },
    { key: "parts", file: "/parts/sitemap/0.xml …", what: "Part pages (45,000 per file)", n: `${parts.toLocaleString()} URLs` },
  ] as const;
  const gscHost = SITE_URL.replace(/^https?:\/\//, "");

  return (
    <>
      <PageHead
        title="Sitemaps & Robots"
        sub="Sitemaps rebuild themselves whenever a page is published, changed or removed."
        actions={<>
          <a href="/sitemap.xml" target="_blank" className={b("light")}><ExternalLink size={15} /> Open sitemap.xml</a>
          <a href={`https://search.google.com/search-console/sitemaps?resource_id=sc-domain:${gscHost}`} target="_blank" rel="noopener" className={b("primary")}><ExternalLink size={15} /> Submit in Search Console</a>
        </>}
      />
      <Card title="XML sitemaps" icon={<MapIcon size={17} />} right={<span className="text-[12px] text-[#8494AB]">Index: /sitemap.xml</span>} pad={false}>
        <form action={saveSitemapToggles}>
          <Table head={["File", "Contains", "Size", "Published"]}>
            {rows.map((r) => (
              <tr key={r.key}>
                <td className="font-mono text-[12.5px] font-bold">{r.key === "parts" ? r.file : <a href={r.file} target="_blank" className="hover:text-[#0052CC]">{r.file}</a>}</td>
                <td className="text-[#5B6B84]">{r.what}</td>
                <td>{r.n}</td>
                <td><label className="inline-flex items-center gap-2"><input type="checkbox" name={r.key} defaultChecked={site.sitemaps[r.key]} className="h-4 w-4 accent-[#0066FF]" /> <Pill tone={site.sitemaps[r.key] ? "ok" : "gray"}>{site.sitemaps[r.key] ? "On" : "Off"}</Pill></label></td>
              </tr>
            ))}
          </Table>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#E3EAF3] px-4.5 py-3.5 text-[12.8px]">
            <b>Always left out:</b>
            {["Drafts", "Noindex pages", "Redirected URLs", "Pages with a canonical pointing elsewhere", "404 / 410 pages"].map((t) => <span key={t} className="text-[#5B6B84]">✓ {t}</span>)}
            <span className="flex-1" />
            <button className={b("dark", true)}><Save size={13} /> Save</button>
          </div>
        </form>
      </Card>
      <Card title="robots.txt" icon={<FileCode size={17} />} right={<a href="/robots.txt" target="_blank" className={b("light", true)}><ExternalLink size={13} /> View live</a>}>
        <RobotsEditor current={robots.custom || defaultRobots()} fallback={defaultRobots()} />
      </Card>
    </>
  );
}
