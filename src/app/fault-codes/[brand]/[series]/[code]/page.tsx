import { withTail, fitTitle } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AlertTriangle, ArrowRight, BadgeCheck, Check, ClipboardList, Phone, Search, Stethoscope, Wrench } from "lucide-react";
import { Breadcrumbs, JsonLd, LibraryShell, SafetyNote, breadcrumbSchema } from "@/components/fault-codes/LibraryShell";
import { codeUrl, families, familyUrl, getFamily, hasGuide, toList } from "@/lib/faultCodes";
import { PageExtras, withSeo } from "@/lib/cms/seo";

type Props = { params: Promise<{ brand: string; series: string; code: string }> };

/* Only codes with a technician-approved guide get their own page (others show "not found") */
export function generateStaticParams() {
  return families.flatMap((f) =>
    f.codes.filter(hasGuide).map((c) => ({ brand: f.brandSlug, series: f.seriesSlug, code: c.slug })),
  );
}

function load(brand: string, series: string, code: string) {
  const f = getFamily(brand, series);
  const c = f?.codes.find((x) => x.slug === code && hasGuide(x));
  return f && c ? { f, c } : null;
}

const title = (s: string) => s.replace(/(^|[\s(/-])([a-z])/g, (_, a, b) => a + b.toUpperCase());

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand, series, code } = await params;
  const d = load(brand, series, code);
  if (!d) return {};
  const { f, c } = d;
  return withSeo(codeUrl(f, c), {
    title: { absolute: fitTitle(`${f.short} ${c.code}: ${title(c.name.replace(/: /g, " "))} | Causes & Fix`) },
    description: withTail(`${f.short} ${c.code} (${c.name}): ${c.meaning}`, "Causes, safe checks and repair."),
  });
}

/* Wrapped in Suspense so page changes stay instant */
export default function CodePage({ params }: Props) {
  return (
    <Suspense>
      <CodePageContent params={params} />
    </Suspense>
  );
}

async function CodePageContent({ params }: Props) {
  const { brand, series, code } = await params;
  const d = load(brand, series, code);
  if (!d) notFound();
  const { f, c } = d;

  const heading = `${f.short} ${c.code}: ${title(c.name.replace(/: /g, " "))}`;
  const related = f.codes.filter((x) => hasGuide(x) && x.code !== c.code).slice(0, 6);
  const services = toList(c.service);
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Fault Codes", href: "/fault-codes" },
    { label: f.short, href: familyUrl(f) },
    { label: c.code },
  ];

  return (
    <LibraryShell>
      <PageExtras path={codeUrl(f, c)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: heading,
          about: `${f.brand} ${f.series} fault ${c.code}`,
          author: { "@type": "Organization", name: "Industrial Automation Repair Inc." },
          publisher: { "@type": "Organization", name: "Industrial Automation Repair Inc." },
          description: c.meaning,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { q: `What does ${f.short} fault ${c.code} mean?`, a: c.meaning },
            { q: `What causes ${f.short} ${c.code}?`, a: c.causes },
            { q: `Can a unit showing ${c.code} be repaired?`, a: c.repairable },
          ].map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })),
        }}
      />

      <div className="mx-auto max-w-310 px-5 py-8 sm:px-8">
        <Breadcrumbs items={crumbs} />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <article className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1 font-mono text-[15px] font-bold text-amber-700">
                <AlertTriangle size={15} aria-hidden="true" /> {c.code}
              </span>
              <span className="rounded-lg bg-[#F5F5F7] px-2.5 py-1 text-[12.5px] font-semibold text-[#62626F]">
                {c.type} · {c.area}
              </span>
              {/^yes/i.test(c.repairable ?? "") && (
                <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[12.5px] font-semibold text-emerald-700">Usually repairable</span>
              )}
            </div>
            <h1 className="mt-4 text-[28px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[40px]">{heading}</h1>
            {c.also && <p className="mt-2 text-[13px] text-[#646471]">Also shown as: {c.also}</p>}

            <div className="mt-5 rounded-2xl border-l-4 border-[#C8102E] bg-[#F9F9FA] p-5">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#B30E29]">What {c.code} means</h2>
              <p className="mt-2 text-[15.5px] leading-[1.65] sm:text-[16px]">{c.meaning}</p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <section className="rounded-2xl border border-[#EAEAEC] p-5">
                <h2 className="flex items-center gap-2 text-[17px] font-extrabold">
                  <Stethoscope size={18} className="text-[#B30E29]" aria-hidden="true" /> Symptoms
                </h2>
                <p className="mt-2 text-[14px] leading-[1.6] text-[#62626F]">{c.symptoms}</p>
              </section>
              <section className="rounded-2xl border border-[#EAEAEC] p-5">
                <h2 className="flex items-center gap-2 text-[17px] font-extrabold">
                  <Wrench size={18} className="text-[#B30E29]" aria-hidden="true" /> Is it repairable?
                </h2>
                <p className="mt-2 text-[14px] leading-[1.6] text-[#62626F]">{c.repairable}</p>
              </section>
              <section className="rounded-2xl border border-[#EAEAEC] p-5">
                <h2 className="flex items-center gap-2 text-[17px] font-extrabold">
                  <ClipboardList size={18} className="text-[#B30E29]" aria-hidden="true" /> Common causes
                </h2>
                <ul className="mt-2 space-y-1.5">
                  {toList(c.causes).map((x) => (
                    <li key={x} className="flex gap-2 text-[14px] leading-normal text-[#62626F]">
                      <Check size={15} className="mt-0.5 shrink-0 text-[#B30E29]" aria-hidden="true" />
                      {x}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="rounded-2xl border border-[#EAEAEC] p-5">
                <h2 className="flex items-center gap-2 text-[17px] font-extrabold">
                  <Search size={18} className="text-[#B30E29]" aria-hidden="true" /> Safe checks
                </h2>
                <ol className="mt-2 space-y-1.5">
                  {toList(c.checks).map((x, i) => (
                    <li key={x} className="flex gap-2 text-[14px] leading-normal text-[#62626F]">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C8102E] text-[11px] font-bold text-white">
                        {i + 1}
                      </span>
                      {x}
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <div className="mt-3">
              <SafetyNote />
            </div>

            <p className="mt-4 flex items-start gap-2 text-[12.5px] text-[#646471]">
              <BadgeCheck size={15} className="mt-0.5 shrink-0 text-[#B30E29]" aria-hidden="true" />
              Reviewed by IAR repair technicians. Code and name from the {f.source}.
            </p>

            {related.length > 0 && (
              <>
                <h2 className="mt-8 text-[20px] font-extrabold">Related {f.short} faults</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {related.map((x) => (
                    <li key={x.code}>
                      <Link
                        href={codeUrl(f, x)}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#EAEAEC] px-3 py-2 text-[13px] transition hover:border-[#C8102E]/40"
                      >
                        <span className="font-mono font-bold">{x.code}</span>
                        <span className="text-[#62626F]">{x.name.replace(/^(Power unit|Drive|Inverter|Converter): /, "")}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={familyUrl(f)} className="mt-4 inline-flex items-center gap-1 text-[13.5px] font-semibold text-[#B30E29]">
                  All {f.codes.length.toLocaleString("en-US")} {f.short} codes <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </>
            )}
          </article>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(150deg,#131316_0%,#1B1B1F_60%,#151518_100%)] p-6 text-white">
              <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(200,16,46,0.45),transparent_65%)]" />
              <p className="relative text-[12px] font-semibold uppercase tracking-[0.2em] text-[#FF8A99]">Still showing {c.code}?</p>
              <p className="relative mt-1 text-[22px] font-extrabold leading-tight">{f.repairLabel}</p>
              <ul className="relative mt-4 space-y-2 text-[13.5px] text-white/85">
                {["Free evaluation and written quote", "Component-level repair", "Tested under power on our test benches", "1-year warranty"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check size={15} className="text-emerald-400" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                href={`/request-repair?fault=${encodeURIComponent(c.code)}`}
                className="relative mt-5 flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-[15px] font-semibold"
              >
                <Wrench size={17} aria-hidden="true" /> Send this unit in
              </Link>
              <Link
                href={`/request-repair?service=question&fault=${encodeURIComponent(c.code)}`}
                className="relative mt-2 flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 text-[15px] font-semibold hover:border-white/40"
              >
                <Phone size={17} aria-hidden="true" /> Ask a technician
              </Link>
            </div>
            {services.length > 0 && (
              <p className="mt-3 px-1 text-[12.5px] text-[#646471]">
                Related services: <span className="font-semibold text-[#131316]">{services.join(" · ")}</span>
              </p>
            )}
          </aside>
        </div>
      </div>
    </LibraryShell>
  );
}
