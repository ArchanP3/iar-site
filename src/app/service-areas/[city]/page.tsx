import type { Metadata } from "next";
import { fitTitle } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, BadgeCheck, Building2, ClipboardCheck, FileText, MapPin, PackageCheck, Truck, Wrench } from "lucide-react";
import ResourceShell from "@/components/resources/ResourceShell";
import { areaHere, areas, areaUrl, getArea, type Area } from "@/lib/serviceAreas";
import { getIndustry, industryUrl } from "@/lib/industries";
import { getService, serviceUrl } from "@/lib/services";
import { SITE_URL } from "@/lib/site";
import { PageExtras, withSeo } from "@/lib/cms/seo";

type Props = { params: Promise<{ city: string }> };

const repairs = ["servo-drive-repair", "servo-motor-repair", "vfd-repair", "encoder-repair", "plc-repair", "hmi-repair", "cnc-repair", "power-supply-repair", "controller-card-repair", "exchange"];

/* Only this country's cities: the other country's city pages are 301'd to their own domain in src/proxy.ts. */
export function generateStaticParams() {
  return areas.filter(areaHere).map((a) => ({ city: a.slug }));
}

const place = (a: Area) => `${a.city}, ${a.regionCode}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = getArea((await params).city);
  if (!a || !areaHere(a)) return {};
  return withSeo(areaUrl(a.slug), {
    title: { absolute: fitTitle(`Servo Drive & Motor Repair for ${place(a)} | IAR`) },
    description: `Servo drive, motor and electronics repair for ${a.city} plants at our Grand Island, NY centre. Pickup or ship-in. Free evaluation, 1-year warranty.`,
    // City pages are on one country site only, so no .ca/.com hreflang pair.
    alternates: { canonical: `${SITE_URL}${areaUrl(a.slug)}`, languages: {} },
  });
}

function faqs(a: Area): [string, string][] {
  return [
    [`Do you have a repair shop in ${a.city}?`, `No. Every repair is done at our repair centre in Grand Island, New York. ${a.dropOff ? "You can drop units off there, or we" : "We"} arrange a pickup from your plant in ${a.city} and ship the unit back when it is done.`],
    [`How long does a repair take for ${a.city} customers?`, "Typical turnaround is 24 to 72 hours once you approve the quote, plus shipping time each way. Need it sooner? Call or email us: rush handling is available for an extra fee."],
    [`Can a technician come to our plant in ${a.city}?`, "Yes. Our technicians provide on-site service calls across the United States. Tell us about the machine and we will plan the visit."],
    ["Is the evaluation free?", "Yes. Every repair starts with a free evaluation and a written quote. No work starts until you approve it, and every repair comes with a test report and a 1-year warranty."],
  ];
}

export default function Page({ params }: Props) {
  return (
    <Suspense>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Props) {
  const a = getArea((await params).city);
  if (!a || !areaHere(a)) notFound();
  const us = a.country === "US";
  const url = `${SITE_URL}${areaUrl(a.slug)}`;
  const q = faqs(a);
  const inds = a.industries.map(getIndustry).filter((x): x is NonNullable<typeof x> => Boolean(x));
  const svc = repairs.map(getService).filter((x): x is NonNullable<typeof x> => Boolean(x));
  const nearby = areas.filter((x) => x.slug !== a.slug && x.region === a.region).slice(0, 6);

  const ways: { icon: React.ElementType; t: string; d: string; href?: string }[] = [
    ...(a.dropOff ? [{ icon: MapPin, t: "Drop it off", d: "Bring it to our Grand Island, NY repair centre during business hours. No appointment needed." }] : []),
    { icon: PackageCheck, t: "Request a pickup", d: `We arrange collection from your dock in ${a.city} and send you the waybill.` },
    { icon: Truck, t: "Ship it in", d: "Send it with FedEx, UPS, DHL or your own carrier account." },
    { icon: Wrench, t: "On-site service", d: "Technicians across the USA for jobs that can't leave the machine.", href: "/on-site-service" },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: `Servo drive and motor repair for ${a.city}`,
        serviceType: "Industrial electronics repair",
        url,
        areaServed: { "@type": "City", name: a.city, containedInPlace: { "@type": us ? "State" : "AdministrativeArea", name: a.region } },
        provider: {
          "@type": "Organization",
          name: "Industrial Automation Repair Inc.",
          url: SITE_URL,
          address: { "@type": "PostalAddress", addressLocality: "Grand Island", addressRegion: "NY", addressCountry: "US" },
        },
      },
      { "@type": "FAQPage", mainEntity: q.map(([n, t]) => ({ "@type": "Question", name: n, acceptedAnswer: { "@type": "Answer", text: t } })) },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Service Areas", item: `${SITE_URL}/service-areas` },
          { "@type": "ListItem", position: 3, name: a.city, item: url },
        ],
      },
    ],
  };

  return (
    <ResourceShell crumb={[{ label: "Service Areas", href: "/service-areas" }, { label: a.city }]} title="Servo drive & motor repair" accent={`for ${a.city}`}
      text={`Repaired at our Grand Island, New York repair centre for manufacturers in ${place(a)}. ${a.dropOff ? "Drop it off, ship it in or request a pickup." : "Ship it in or request a pickup."}`} schema={schema}>
      <PageExtras path={areaUrl(a.slug)} />
      {/* How it gets to us */}
      <div className={`grid gap-3 sm:grid-cols-2 ${ways.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        {ways.map(({ icon: Icon, t, d, href }, i) => (
          <div key={t} className={`rounded-[22px] p-5 ${i === 0 ? "bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-white shadow-[0_30px_60px_-35px_rgba(200,16,46,0.9)]" : "border border-[#EAEAEC] bg-white shadow-[0_30px_60px_-45px_rgba(19,19,22,0.5)]"}`}>
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${i === 0 ? "bg-white/15 ring-1 ring-white/25" : "bg-[#C8102E]/8 text-[#B30E29]"}`}><Icon size={20} aria-hidden="true" /></span>
            <p className="mt-4 text-[16.5px] font-extrabold">{t}</p>
            <p className={`mt-1 text-[13.5px] leading-relaxed ${i === 0 ? "text-white/85" : "text-[#62626F]"}`}>{d}</p>
            {href && <Link href={href} className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-[#A50D25] hover:underline">Learn more <ArrowRight size={13} aria-hidden="true" /></Link>}
          </div>
        ))}
      </div>

      <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-10">
          {/* Local industry */}
          <section aria-labelledby="local">
            <h2 id="local" className="text-[24px] font-extrabold tracking-[-0.015em] sm:text-[28px]">Keeping {a.city} lines running</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-[#4E4E58]">{a.local} When a servo drive, motor or control fails, we repair it at component level, test it on our test benches and send it back with a test report.</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {inds.map((i) => (
                <li key={i.slug}>
                  <Link href={industryUrl(i.slug)} className="inline-flex h-10 items-center gap-2 rounded-full border border-[#E3E3E7] bg-white px-4 text-[13.5px] font-semibold transition hover:border-[#C8102E] hover:text-[#B30E29]">
                    <span className="h-2 w-2 rounded-full" style={{ background: i.color }} aria-hidden="true" />{i.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* What we repair */}
          <section aria-labelledby="repairs">
            <h2 id="repairs" className="text-[24px] font-extrabold tracking-[-0.015em] sm:text-[28px]">What we repair for {a.city} plants</h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {svc.map((s) => (
                <li key={s.slug}>
                  <Link href={serviceUrl(s.slug)} className="group flex items-center justify-between gap-3 rounded-2xl border border-[#EAEAEC] bg-white px-4 py-3.5 transition hover:border-[#C8102E]/40">
                    <span className="text-[14.5px] font-bold group-hover:text-[#B30E29]">{s.title}</span>
                    <ArrowRight size={15} className="flex-none text-[#C2C2C9] transition group-hover:translate-x-0.5 group-hover:text-[#B30E29]" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13.5px] text-[#62626F]">From every major brand, including Siemens, Rexroth Indramat, Allen-Bradley, Fanuc and Yaskawa. <Link href="/brands" className="font-semibold text-[#A50D25] hover:underline">See all brands</Link>.</p>
          </section>


          {/* FAQ */}
          <section aria-labelledby="faq">
            <h2 id="faq" className="text-[24px] font-extrabold tracking-[-0.015em] sm:text-[28px]">Questions from {a.city} customers</h2>
            <div className="mt-4 divide-y divide-[#EAEAEC] overflow-hidden rounded-[22px] border border-[#EAEAEC] bg-white">
              {q.map(([n, t]) => (
                <details key={n} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-bold">
                    {n}<span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-[#F5F5F6] text-[#B30E29] transition group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-[#62626F]">{t}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-28">
          <div className="relative overflow-hidden rounded-[24px] bg-[#0A0A0C] p-6 text-white">
            <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.55),transparent)] blur-xl" />
            <p className="relative flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF8A99]"><Building2 size={14} aria-hidden="true" /> Our repair centre</p>
            <p className="relative mt-2 text-[20px] font-extrabold">Grand Island, New York</p>
            <p className="relative mt-1 text-[13.5px] leading-relaxed text-white/70">Serving {a.city} and every city in the USA.</p>
            <ul className="relative mt-4 space-y-2 text-[13.5px] text-white/85">
              {[[BadgeCheck, "Free evaluation"], [FileText, "Written quote before any work"], [ClipboardCheck, "Test report with every unit"], [BadgeCheck, "1-year warranty"]].map(([I, t]) => {
                const Icon = I as React.ElementType;
                return <li key={t as string} className="flex items-center gap-2"><Icon size={15} className="text-[#34D399]" aria-hidden="true" />{t as string}</li>;
              })}
            </ul>
            <Link href="/request-repair" className="relative mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-[14px] font-semibold text-[#131316]"><Wrench size={16} aria-hidden="true" /> Request a Repair</Link>
            <Link href="/request-pickup" className="relative mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/20 text-[14px] font-semibold"><Truck size={16} aria-hidden="true" /> Request a Pickup</Link>
            <Link href="/on-site-service" className="relative mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/20 text-[14px] font-semibold"><MapPin size={16} aria-hidden="true" /> On-site Service</Link>
          </div>
          {nearby.length > 0 && (
            <div className="rounded-[22px] border border-[#EAEAEC] bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#696976]">Also in {a.region}</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {nearby.map((n) => (
                  <li key={n.slug}><Link href={areaUrl(n.slug)} className="inline-flex rounded-lg bg-[#F5F5F6] px-2.5 py-1.5 text-[13px] font-semibold text-[#4E4E58] hover:bg-[#C8102E] hover:text-white">{n.city}</Link></li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </ResourceShell>
  );
}
