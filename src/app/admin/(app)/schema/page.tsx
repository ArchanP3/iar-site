import Link from "next/link";
import { Suspense } from "react";
import { Braces, CheckCircle2, ExternalLink, Globe, Pencil } from "lucide-react";
import { requireUser } from "@/lib/cms/auth";
import { q } from "@/lib/cms/db";
import { readSetting } from "@/lib/cms/settings";
import { SITE_URL } from "@/lib/site";
import { Card, PageHead, Pill, Table, ago, b } from "@/components/admin/ui";
import SiteSchemaForm from "@/components/admin/SiteSchemaForm";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-[#91919E]">Loading…</p>}>
      <Schema />
    </Suspense>
  );
}

const WHERE: Record<string, string> = {
  Organization: "About, Contact", LocalBusiness: "Service areas", Service: "Service pages", Product: "Part pages", FAQPage: "Pages with FAQs",
  BreadcrumbList: "Most pages", Article: "Blog posts", BlogPosting: "Blog posts", ItemList: "Lists", AboutPage: "About", ContactPage: "Contact", WebPage: "Pages", TechArticle: "Fault-code guides", HowTo: "Guides",
};

async function Schema() {
  await requireUser("schema");
  const [types, custom, schema, biz, site] = await Promise.all([
    q<{ t: string; n: number }>(`SELECT t, count(*)::int AS n FROM cms.cms_crawl, unnest(ld_types) AS t WHERE status = 200 GROUP BY t ORDER BY n DESC`),
    q<{ path: string; schema_json: string; updated_at: Date; updated_by: string | null }>(`SELECT path, schema_json, updated_at, updated_by FROM cms.cms_page_seo WHERE schema_json IS NOT NULL AND schema_json <> '' ORDER BY updated_at DESC`),
    readSetting("schema"), readSetting("business"), readSetting("site"),
  ]);
  const sample = JSON.stringify({
    "@context": "https://schema.org", "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: biz.name, url: SITE_URL, logo: `${SITE_URL}/iar-logo.png`,
    ...(biz.phone ? { telephone: biz.phone } : {}), email: biz.email, sameAs: Object.values(site.social).filter(Boolean),
  }, null, 2);
  const typeOf = (s: string) => { try { const v = JSON.parse(s); return (Array.isArray(v) ? v : [v]).map((x) => x?.["@type"]).filter(Boolean).join(", "); } catch { return "invalid"; } };

  return (
    <>
      <PageHead
        title="Schema"
        sub="Structured data is added automatically to every page type. Add your own JSON-LD to any page (in its editor) or to every page (below)."
        actions={<a href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(SITE_URL)}`} target="_blank" rel="noopener" className={b("light")}><ExternalLink size={15} /> Test in Google Rich Results</a>}
      />
      <div className="grid items-start gap-5 xl:grid-cols-[340px_1fr]">
        <Card title="Automatic schema found" icon={<CheckCircle2 size={17} />}>
          {types.length ? types.map((t) => (
            <div key={t.t} className="flex items-center gap-2.5 border-b border-[#F3F3F4] py-2.5 last:border-0">
              <CheckCircle2 size={16} className="text-[#12B76A]" />
              <div className="min-w-0 flex-1"><b className="text-[13px]">{t.t}</b><div className="text-[12px] text-[#91919E]">{WHERE[t.t] ?? "Detected on the site"}</div></div>
              <Pill>{t.n} pages</Pill>
            </div>
          )) : <p className="text-[#91919E]">Run a site scan (Dashboard or Pages) to list the schema on every page.</p>}
        </Card>
        <div className="flex flex-col gap-5">
          <Card title="Custom schema on pages" icon={<Braces size={17} />} right={<Link href="/admin/pages" className={b("light", true)}><Pencil size={13} /> Add to a page</Link>} pad={false}>
            {custom.length ? (
              <Table head={["Page", "Type", "Edited", ""]}>
                {custom.map((c) => (
                  <tr key={c.path}>
                    <td className="font-mono text-[12.5px]">{c.path}</td>
                    <td><Pill tone={typeOf(c.schema_json) === "invalid" ? "bad" : "blue"}>{typeOf(c.schema_json) || "—"}</Pill></td>
                    <td className="text-[#696976]">{ago(c.updated_at)}{c.updated_by ? ` · ${c.updated_by}` : ""}</td>
                    <td className="text-right"><Link href={`/admin/pages/edit?path=${encodeURIComponent(c.path)}`} className={b("light", true)}>Edit</Link></td>
                  </tr>
                ))}
              </Table>
            ) : <p className="p-6 text-[#91919E]">No custom schema yet. Open a page in Pages, then the <b>Schema</b> tab, to add JSON-LD with templates and live validation.</p>}
          </Card>
          <Card title="Site-wide schema" icon={<Globe size={17} />}>
            <SiteSchemaForm value={schema.site} sample={sample} />
          </Card>
        </div>
      </div>
    </>
  );
}
