import Link from "next/link";
import { Suspense } from "react";
import { LayoutTemplate, MapPin, Plus } from "lucide-react";
import { requireUser } from "@/lib/cms/auth";
import { q } from "@/lib/cms/db";
import { Card, PageHead, Pill, Seg, Table, ago, b } from "@/components/admin/ui";

type Props = { searchParams: Promise<{ tab?: string }> };

export default function Page(props: Props) {
  return (
    <Suspense fallback={<p className="text-[#91919E]">Loading…</p>}>
      <List {...props} />
    </Suspense>
  );
}

async function List({ searchParams }: Props) {
  await requireUser("landing");
  const tab = (await searchParams).tab === "templates" ? "templates" : "pages";
  const rows = await q<{ id: number; path: string; name: string; kind: string; status: string; template_id: number | null; tname: string | null; in_sitemap: string; vars: Record<string, string>; updated_at: Date; updated_by: string | null; used: number }>(
    `SELECT l.id, l.path, l.name, l.kind, l.status, l.template_id, t.name AS tname, l.in_sitemap, l.vars, l.updated_at, l.updated_by,
            (SELECT count(*)::int FROM cms.cms_landing x WHERE x.template_id = l.id) AS used
       FROM cms.cms_landing l LEFT JOIN cms.cms_landing t ON t.id = l.template_id
      WHERE l.kind = $1 ORDER BY l.updated_at DESC`,
    [tab === "templates" ? "template" : "page"],
  );
  const [counts] = await q<{ p: number; t: number }>(`SELECT count(*) FILTER (WHERE kind='page')::int AS p, count(*) FILTER (WHERE kind='template')::int AS t FROM cms.cms_landing`);
  return (
    <>
      <PageHead
        title="Landing Pages"
        sub="Build new pages from ready-made blocks in the website's design. Use a template to create city pages (for example servo drive repair in Burlington) in one go."
        actions={<>
          <Link href="/admin/landing/new?kind=template" className={b("light")}><LayoutTemplate size={16} /> New template</Link>
          <Link href="/admin/landing/new" className={b("primary")}><Plus size={16} /> New page</Link>
        </>}
      />
      <div><Seg active={tab} items={[{ key: "pages", label: `Pages (${counts?.p ?? 0})`, href: "/admin/landing" }, { key: "templates", label: `Templates (${counts?.t ?? 0})`, href: "/admin/landing?tab=templates" }]} /></div>
      <Card pad={false}>
        {tab === "pages" ? (
          <Table head={["Page", "Status", "Made from", "Sitemap", "Updated"]}>
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-[#FAFAFB]">
                <td className="max-w-105"><Link href={`/admin/landing/${r.id}`} className="block truncate font-bold hover:text-[#A50D25]">{r.name}</Link><span className="font-mono text-[12px] text-[#91919E]">{r.path}</span></td>
                <td><Pill tone={r.status === "published" ? "ok" : "warn"}>{r.status === "published" ? "Live" : "Draft"}</Pill></td>
                <td>{r.tname ? <Link href={`/admin/landing/${r.template_id}`} className="font-semibold text-[#A50D25]">{r.tname}</Link> : "Custom"}</td>
                <td className="capitalize">{r.in_sitemap}</td>
                <td className="whitespace-nowrap text-[#696976]">{ago(r.updated_at)}{r.updated_by ? ` · ${r.updated_by}` : ""}</td>
              </tr>
            ))}
          </Table>
        ) : (
          <Table head={["Template", "URL pattern", "Pages using it", "Updated"]}>
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-[#FAFAFB]">
                <td><Link href={`/admin/landing/${r.id}`} className="font-bold hover:text-[#A50D25]">{r.name}</Link></td>
                <td className="font-mono text-[12px] text-[#696976]">{r.vars?.path_pattern || "—"}</td>
                <td>{r.used}</td>
                <td className="whitespace-nowrap text-[#696976]">{ago(r.updated_at)}{r.updated_by ? ` · ${r.updated_by}` : ""}</td>
              </tr>
            ))}
          </Table>
        )}
        {!rows.length && (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-[#696976]">
            {tab === "pages" ? <LayoutTemplate size={26} className="text-[#91919E]" /> : <MapPin size={26} className="text-[#91919E]" />}
            {tab === "pages" ? "No landing pages yet. Start a new page, or make a template and create city pages from it." : "No templates yet. A template is one layout you can reuse for many cities."}
          </div>
        )}
      </Card>
    </>
  );
}
