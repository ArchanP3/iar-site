import { clip } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AlertTriangle, ArrowRight, Check, Phone, Wrench } from "lucide-react";
import FamilyTable, { type TableRow } from "@/components/fault-codes/FamilyTable";
import { Breadcrumbs, JsonLd, LibraryShell, SafetyNote, breadcrumbSchema } from "@/components/fault-codes/LibraryShell";
import { codeUrl, families, familyUrl, getFamily, hasGuide } from "@/lib/faultCodes";
import { SITE_URL } from "@/lib/site";
import { PageExtras, withSeo } from "@/lib/cms/seo";

type Props = { params: Promise<{ brand: string; series: string }> };

export function generateStaticParams() {
  return families.map((f) => ({ brand: f.brandSlug, series: f.seriesSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand, series } = await params;
  const f = getFamily(brand, series);
  if (!f) return {};
  return withSeo(familyUrl(f), {
    title: `${f.short} Fault Codes & Alarms List | IAR`,
    description: clip(`All ${f.codes.length.toLocaleString("en-US")} ${f.brand} ${f.series} fault and alarm codes in plain English, from repair technicians. ${f.short} repair in Grand Island, NY.`),
  });
}

/* Wrapped in Suspense so page changes stay instant */
export default function FamilyPage({ params }: Props) {
  return (
    <Suspense>
      <FamilyPageContent params={params} />
    </Suspense>
  );
}

async function FamilyPageContent({ params }: Props) {
  const { brand, series } = await params;
  const f = getFamily(brand, series);
  if (!f) notFound();

  const rows: TableRow[] = f.codes.map((c) => [c.code, c.name, c.type, c.area, hasGuide(c) ? codeUrl(f, c) : ""]);
  const guides = f.codes.filter(hasGuide);
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Fault Codes", href: "/fault-codes" },
    { label: `${f.short}` },
  ];

  return (
    <LibraryShell>
      <PageExtras path={familyUrl(f)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${f.short} fault codes and alarms`,
          description: f.intro,
          // Not "Product": Google treats any Product block as a listing and wants a price, reviews or ratings.
          about: { "@type": "Thing", name: `${f.brand} ${f.series}` },
          publisher: { "@type": "Organization", name: "Industrial Automation Repair Inc." },
          hasPart: guides.map((c) => ({ "@type": "TechArticle", name: `${f.short} ${c.code}: ${c.name}`, url: `${SITE_URL}${codeUrl(f, c)}` })),
        }}
      />

      <div className="mx-auto max-w-310 px-5 py-8 sm:px-8">
        <Breadcrumbs items={crumbs} />

        <div className="mt-6 flex items-start gap-4">
          <span className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-[22px] font-extrabold text-white shadow-[0_12px_26px_-12px_rgba(200,16,46,0.8)] sm:flex">
            {f.initials}
          </span>
          <div>
            <h1 className="text-[28px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[40px]">{f.short} Fault Codes &amp; Alarms</h1>
            <p className="mt-2 max-w-190 text-[14.5px] leading-[1.65] text-[#62626F] sm:text-[15px]">
              All {f.codes.length.toLocaleString("en-US")} codes. {f.intro}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <FamilyTable rows={rows} label={f.short} askHref="/request-repair" />
            <p className="mt-3 text-[12px] text-[#62626F]">Codes and names from the {f.source}. Guides written and reviewed by IAR repair technicians.</p>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-28 lg:self-start">
            <div className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(150deg,#131316_0%,#1B1B1F_60%,#151518_100%)] p-5 text-white">
              <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(200,16,46,0.45),transparent_65%)]" />
              <p className="relative text-[12px] font-semibold uppercase tracking-[0.2em] text-[#FF8A99]">{f.short} repair</p>
              <p className="relative mt-1 text-[20px] font-extrabold leading-tight">{f.repairLabel}</p>
              <ul className="relative mt-3 space-y-1.5 text-[13px] text-white/85">
                {["Free evaluation and written quote", "Tested on our test benches", "Exchange units when in stock"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                href="/request-repair"
                className="relative mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-[14px] font-semibold"
              >
                <Wrench size={16} aria-hidden="true" /> Send this unit in
              </Link>
              <Link
                href="/request-repair?service=question"
                className="relative mt-2 flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 text-[14px] font-semibold hover:border-white/40"
              >
                <Phone size={16} aria-hidden="true" /> Ask a technician
              </Link>
            </div>

            {guides.length > 0 && (
              <div className="rounded-[22px] border border-[#EAEAEC] p-5">
                <p className="text-[14px] font-extrabold">{f.short} fault guides</p>
                <ul className="mt-2 space-y-2 text-[13px]">
                  {guides.slice(0, 8).map((c) => (
                    <li key={c.code}>
                      <Link href={codeUrl(f, c)} className="flex items-center gap-2 hover:text-[#B30E29]">
                        <AlertTriangle size={13} className="shrink-0 text-amber-500" aria-hidden="true" />
                        <span className="font-mono font-bold">{c.code}</span>
                        <span className="truncate text-[#62626F]">{c.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/fault-codes" className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-[#B30E29]">
                  All brands <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            )}
            <SafetyNote />
          </aside>
        </div>
      </div>
    </LibraryShell>
  );
}
