import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/cms/auth";
import { one, q } from "@/lib/cms/db";
import type { CmsLanding } from "@/lib/cms/content";
import { allServices } from "@/lib/services";
import { brands } from "@/lib/brands";
import { SITE_URL } from "@/lib/site";
import { PageHead } from "@/components/admin/ui";
import LandingEditor from "@/components/admin/LandingEditor";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; kind?: string }> };

export default function Page(props: Props) {
  return (
    <Suspense fallback={<p className="text-[#91919E]">Loading…</p>}>
      <Edit {...props} />
    </Suspense>
  );
}

async function Edit({ params, searchParams }: Props) {
  await requireUser("landing");
  const { id } = await params;
  const sp = await searchParams;
  const row = id === "new" ? null : await one<CmsLanding>(`SELECT * FROM cms.cms_landing WHERE id = $1`, [Number(id) || 0]);
  if (id !== "new" && !row) notFound();
  const kind = row?.kind ?? (sp.kind === "template" ? "template" : "page");
  const [templates, used] = await Promise.all([
    q<{ id: number; name: string }>(`SELECT id, name FROM cms.cms_landing WHERE kind = 'template' ORDER BY name`),
    row && kind === "template" ? one<{ n: number }>(`SELECT count(*)::int AS n FROM cms.cms_landing WHERE template_id = $1`, [row.id]) : null,
  ]);
  const page = row
    ? { ...row, updated_at: String(row.updated_at) }
    : kind === "template"
      ? { id: 0, path: "", name: "", kind: "template" as const, blocks: [], vars: { city: "Burlington", province: "ON", path_pattern: "/servo-drive-repair-{city_slug}" }, template_id: null, status: "template", seo_title: "Servo Drive Repair in {city}, {province} | IAR", seo_description: null, in_sitemap: "locations", site: "both" as const, updated_at: "" }
      : null;
  const label = kind === "template" ? "Templates" : "Pages";
  return (
    <>
      <PageHead
        crumb={<><Link href={`/admin/landing${kind === "template" ? "?tab=templates" : ""}`} className="hover:text-[#A50D25]">Landing Pages</Link><ChevronRight size={13} /><span>{label}</span></>}
        title={row?.name || (kind === "template" ? "New city template" : "New landing page")}
      />
      <LandingEditor
        key={row ? `${row.id}` : `new-${kind}`}
        page={page}
        isNew={!row}
        templates={templates}
        services={allServices.map((s) => ({ slug: s.slug, title: s.title }))}
        brands={brands.map((x) => ({ slug: x.slug, name: x.name }))}
        site={SITE_URL}
        saved={sp.saved === "1"}
        usedBy={used?.n ?? 0}
      />
    </>
  );
}
