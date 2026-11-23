import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ResourceShell from "@/components/resources/ResourceShell";
import ModelCodeDecoder from "@/components/resources/ModelCodeDecoder";
import { families, familyService, type Family } from "@/lib/decoder/families";
import { brandUrl } from "@/lib/brands";
import { serviceUrl } from "@/lib/services";
import { SITE_URL } from "@/lib/site";
import { PageExtras, seo } from "@/lib/cms/seo";

const PATH = "/resources/model-code-decoder";

export const generateMetadata = seo(PATH, {
  title: "Servo Model Code Decoder: MKD, 1FK7, MPL, Yaskawa SGDV | AutomIQ",
  description: "Decode a servo motor or drive model code from the nameplate. Covers Rexroth MKD, Siemens 1FK7, Allen-Bradley MPL and Yaskawa Sigma-5 drives and motors.",
  alternates: { canonical: `${SITE_URL}${PATH}` },
});

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Servo Model Code Decoder",
      url: `${SITE_URL}${PATH}`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      provider: { "@type": "Organization", name: "AutomIQ Automation & Drive Services", url: SITE_URL },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Resources", item: `${SITE_URL}/resources` },
        { "@type": "ListItem", position: 3, name: "Model Code Decoder", item: `${SITE_URL}${PATH}` },
      ],
    },
  ],
};

function Reference({ f }: { f: Family }) {
  const table = (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-[#EAEAEC] bg-white">
      <table className="w-full min-w-120 border-collapse text-left text-[13.5px]">
        <thead className="bg-[#131316] text-white">
          <tr>{f.reference.columns.map((c) => <th key={c} scope="col" className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em]">{c}</th>)}</tr>
        </thead>
        <tbody>
          {f.reference.rows.map((r) => (
            <tr key={r[0]} className="border-t border-[#F3F3F4]">
              {r.map((c, i) => i === 0 ? <th key={i} scope="row" className="px-4 py-2.5 font-mono font-bold">{c}</th> : <td key={i} className="px-4 py-2.5 text-[#44444D]">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  return (
    <>
      {f.reference.rows.length > 12 ? (
        <details className="group mt-4">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[14px] font-semibold text-[#A50D25] ring-1 ring-[#EAEAEC] hover:ring-[#C8102E]/40">
            {f.reference.title} ({f.reference.rows.length}) <span aria-hidden="true" className="transition group-open:rotate-90">›</span>
          </summary>
          {table}
        </details>
      ) : (
        <>
          <h3 className="mt-5 text-[17px] font-extrabold">{f.reference.title}</h3>
          {table}
        </>
      )}
      {f.reference.note && <p className="mt-2 text-[12.5px] text-[#696976]">{f.reference.note}</p>}
    </>
  );
}

export default function ModelCodeDecoderPage() {
  return (
    <ResourceShell
      schema={schema}
      crumb={[{ label: "Resources", href: "/resources" }, { label: "Model Code Decoder" }]}
      title="Servo model code,"
      accent="decoded."
      text="Type the code from a servo motor or drive nameplate and see what every part means: size, power, voltage, feedback, shaft, brake and options."
    >
      <PageExtras path={PATH} />
      <ModelCodeDecoder />

      <nav aria-label="Product families" className="mt-8 flex flex-wrap gap-2">
        {families.map((f) => (
          <a key={f.id} href={`#${f.id}`} className="inline-flex h-10 items-center rounded-xl bg-white px-4 text-[13.5px] font-semibold ring-1 ring-[#EAEAEC] hover:text-[#A50D25]">{f.brand} {f.series}</a>
        ))}
      </nav>

      <div className="mt-4 space-y-12">
        {families.map((f) => (
          <section key={f.id} id={f.id} aria-labelledby={`${f.id}-h`} className="scroll-mt-28">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#B30E29]"><span aria-hidden="true" className="h-0.75 w-6.5 rounded bg-linear-to-r from-[#C8102E] to-[#FF3B55]" />{f.brand}</p>
            <h2 id={`${f.id}-h`} className="mt-2 text-[24px] font-extrabold leading-tight tracking-[-0.01em] sm:text-[30px]">{f.brand} {f.series} model code</h2>
            <p className="mt-2 max-w-190 text-[14.5px] leading-relaxed text-[#5A5A66]">
              {f.name}. Example: <span className="font-mono font-semibold text-[#131316]">{f.examples[0]}</span>.
            </p>

            <Reference f={f} />

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {f.keys.map((k) => (
                <div key={k.title} className="rounded-2xl border border-[#EAEAEC] bg-white p-4">
                  <h3 className="text-[15px] font-extrabold">{k.title}</h3>
                  <dl className="mt-2 divide-y divide-[#F3F3F4] text-[13.5px]">
                    {k.rows.map(([c, t]) => (
                      <div key={c} className="flex gap-3 py-2">
                        <dt className="w-24 flex-none font-mono font-bold">{c}</dt>
                        <dd className="text-[#44444D]">{t}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[14px] font-semibold text-[#B30E29]">
              <Link href={serviceUrl(familyService(f))} className="inline-flex items-center gap-1.5 hover:text-[#131316]">{f.series} {f.kind} repair <ArrowRight size={14} aria-hidden="true" /></Link>
              <Link href={`/shop?q=${encodeURIComponent(f.shopQuery ?? f.series)}`} className="inline-flex items-center gap-1.5 hover:text-[#131316]">Browse {f.series} parts <ArrowRight size={14} aria-hidden="true" /></Link>
              <Link href={brandUrl(f.brandSlug)} className="inline-flex items-center gap-1.5 hover:text-[#131316]">{f.brand} <ArrowRight size={14} aria-hidden="true" /></Link>
            </div>
            <p className="mt-3 text-[12px] text-[#696976]">Based on: {f.source}. Newer {f.kind}s may have options not shown here.</p>
          </section>
        ))}
      </div>

      <p className="mt-12 border-t border-[#EAEAEC] pt-5 text-[12px] leading-relaxed text-[#696976]">
        Explanations are based on the manufacturers&apos; published type codes, written in our own words. When planning a new installation, always check the manufacturer&apos;s current documentation.
        AutomIQ is an independent repair and parts provider, not affiliated with or authorized by the manufacturers listed. Brand names identify compatible equipment.
      </p>
    </ResourceShell>
  );
}
