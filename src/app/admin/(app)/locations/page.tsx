import Link from "next/link";
import { Suspense } from "react";
import { MapPin } from "lucide-react";
import { requireUser } from "@/lib/cms/auth";
import { q } from "@/lib/cms/db";
import { readSetting } from "@/lib/cms/settings";
import { areaAbs, areas, areaUrl } from "@/lib/serviceAreas";
import { Card, PageHead, Pill, Table, b } from "@/components/admin/ui";
import { BusinessForm } from "@/components/admin/SettingsForms";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-[#91919E]">Loading…</p>}>
      <Locations />
    </Suspense>
  );
}

async function Locations() {
  await requireUser("locations");
  const [biz, pages] = await Promise.all([
    readSetting("business"),
    q<{ id: number; path: string; name: string; status: string }>(`SELECT id, path, name, status FROM cms.cms_landing WHERE kind = 'page' AND in_sitemap = 'locations' ORDER BY path`),
  ]);
  return (
    <>
      <PageHead title="Locations" sub="Your business name, address and phone (NAP) in one place. They feed the footer, Contact page and LocalBusiness schema, so they always match your Google Business Profile." actions={<Link href="/admin/landing?tab=templates" className={b("light")}><MapPin size={15} /> City page templates</Link>} />
      <BusinessForm b={biz} />
      <Card title="Location pages" pad={false}>
        <Table head={["Page", "Type", "Status"]}>
          {areas.map((a) => (
            <tr key={a.slug}><td><a href={areaAbs(a)} target="_blank" className="font-bold hover:text-[#A50D25]">{a.city}, {a.regionCode}</a><div className="font-mono text-[12px] text-[#91919E]">{areaUrl(a.slug)}</div></td><td>Built into the site{a.country === "US" ? " · USA site" : " · Canada site"}</td><td><Pill tone="ok">Live</Pill></td></tr>
          ))}
          {pages.map((p) => (
            <tr key={p.id}><td><Link href={`/admin/landing/${p.id}`} className="font-bold hover:text-[#A50D25]">{p.name}</Link><div className="font-mono text-[12px] text-[#91919E]">{p.path}</div></td><td>Landing page</td><td><Pill tone={p.status === "published" ? "ok" : "warn"}>{p.status === "published" ? "Live" : "Draft"}</Pill></td></tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
