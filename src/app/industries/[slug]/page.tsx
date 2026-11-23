import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, BadgeCheck, ChevronDown, ChevronRight, FileText, Search, Wrench } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { WhatsAppCta } from "@/components/WhatsAppButton";
import ServiceIcon from "@/components/services/ServiceIcon";
import IndustryCard, { IndustryIcon } from "@/components/industries/IndustryCard";
import { montserrat } from "@/lib/font";
import { getIndustry, industries, industryUrl } from "@/lib/industries";
import { getService, serviceUrl } from "@/lib/services";
import { SITE_URL, shareImage, SHARE_URL } from "@/lib/site";
import { clip, fitTitle } from "@/lib/seo";
import { PageExtras, withSeo } from "@/lib/cms/seo";

type Props = { params: Promise<{ slug: string }> };

/* Every industry page is pre-built (generateStaticParams), so the page can wait for its URL
   before showing. This only turns off a development-mode navigation hint. */
export const instant = false;

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const i = getIndustry((await params).slug);
  if (!i) return {};
  return withSeo(industryUrl(i.slug), {
    title: { absolute: fitTitle(`${i.name} Equipment Repair | Drives, Motors & Controls | AutomIQ`) },
    description: clip(`${i.name} equipment repair: ${i.short} Servo drives, motors, PLCs and HMIs repaired with a free evaluation and 12-month warranty. Canada & USA.`),
    alternates: { canonical: `${SITE_URL}${industryUrl(i.slug)}` },
    openGraph: {
      type: "website", url: `${SHARE_URL}${industryUrl(i.slug)}`, siteName: "AutomIQ Automation & Drive Services",
      title: fitTitle(`${i.name} Equipment Repair | Drives, Motors & Controls | AutomIQ`),
      description: clip(`${i.name} equipment repair: ${i.short} Servo drives, motors, PLCs and HMIs repaired with a free evaluation and 12-month warranty. Canada & USA.`),
      images: [{ url: shareImage(i.image), alt: `${i.name} equipment repair` }],
    },
  });
}

const steps = ["Free evaluation", "Written quote before any work", "Component-level repair", "Tested on our jigs, test report included", "12-month warranty"];

export default async function IndustryPage({ params }: Props) {
  const i = getIndustry((await params).slug);
  if (!i) notFound();
  const services = i.services.map((s) => getService(s)).filter((s): s is NonNullable<typeof s> => Boolean(s));
  const others = industries.filter((x) => x.slug !== i.slug).slice(0, 4);
  const faqs = [
    { q: `What ${i.name.toLowerCase()} equipment do you repair?`, a: `We repair the servo drives, VFDs, motors, PLCs, HMIs, power supplies and circuit boards used in ${i.name.toLowerCase()} equipment, including ${i.equipment.slice(0, 3).join(", ").toLowerCase()}, from every major brand.` },
    { q: "How long does a repair take?", a: "Typical turnaround is 24–72 hours once you approve the quote. Evaluation is free and no work starts without your approval." },
    { q: "Is the repair covered by a warranty?", a: "Yes. Every repair is tested on our own jigs, ships with a test report and is covered by a 12-month warranty." },
    { q: "Do you serve plants outside Ontario?", a: "Yes. We serve manufacturers across Canada and the USA. Ship your unit to us, book a pickup with FedEx, Purolator, UPS or DHL, or ask about on-site service." },
  ];
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Service", name: `${i.name} equipment repair`, serviceType: "Industrial electronics repair", provider: { "@type": "Organization", name: "AutomIQ Automation & Drive Services", url: SITE_URL }, areaServed: [{ "@type": "Country", name: "Canada" }, { "@type": "Country", name: "United States" }], url: `${SITE_URL}${industryUrl(i.slug)}`, description: i.intro },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Industries", item: `${SITE_URL}/industries` },
        { "@type": "ListItem", position: 3, name: i.name, item: `${SITE_URL}${industryUrl(i.slug)}` },
      ] },
      { "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };

  return (
    <main className={`${montserrat.className} min-h-screen bg-[#F4F7FB] text-[#0B1A3C]`}>
      <PageExtras path={industryUrl(i.slug)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <Header />

      <section className="relative overflow-hidden bg-[#050B18] pb-14 pt-8 text-white sm:pb-16">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-115 w-155 rounded-full blur-2xl" style={{ background: `radial-gradient(closest-side, ${i.color}66, transparent)` }} />
        <div className="relative mx-auto max-w-310 px-5 sm:px-8">
          <nav aria-label="Breadcrumb"><ol className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-white/60">
            <li><Link href="/" className="hover:text-white">Home</Link></li><li aria-hidden="true"><ChevronRight size={13} /></li>
            <li><Link href="/industries" className="hover:text-white">Industries</Link></li><li aria-hidden="true"><ChevronRight size={13} /></li>
            <li className="text-white/85" aria-current="page">{i.name}</li>
          </ol></nav>
          <div className="mt-6 grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: i.color }}>Industry</p>
              <h1 className="mt-2 text-[32px] font-extrabold leading-[1.08] tracking-[-0.02em] sm:text-[46px]">{i.name} <span className="bg-linear-to-r from-[#7FD3FF] to-[#00B0FF] bg-clip-text text-transparent">Equipment Repair</span></h1>
              <p className="mt-4 max-w-155 text-[15px] leading-[1.75] text-white/75 sm:text-[17px]">{i.intro}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/request-repair" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#0066FF] to-[#00B0FF] px-6 text-[15px] font-semibold shadow-[0_14px_30px_-14px_rgba(0,176,255,0.9)] transition hover:-translate-y-0.5"><Wrench size={17} aria-hidden="true" /> Request a Repair</Link>
                <Link href="/request-quote" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-6 text-[15px] font-semibold hover:bg-white/10"><FileText size={17} aria-hidden="true" /> Request a Quote</Link>
                <WhatsAppCta topic={i.name} kind="brand" />
              </div>
            </div>
            <div className="relative aspect-4/3 overflow-hidden rounded-[26px] border border-white/10 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.8)]" style={{ background: `linear-gradient(150deg, #0B1020 0%, #121a33 55%, ${i.color}55 100%)` }}>
              {i.image ? (
                <Image src={i.image} alt={`${i.name} production line`} fill priority sizes="(min-width: 1024px) 520px, 100vw" className={i.zoom ? "scale-110 object-cover object-[50%_35%]" : "object-cover"} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-36 w-36 items-center justify-center rounded-[32px] ring-1 ring-white/15" style={{ background: `linear-gradient(145deg, ${i.color}40, #0B1A3C)`, boxShadow: `0 30px 60px -20px ${i.color}` }}>
                    <IndustryIcon name={i.icon} color={i.color} size={72} />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-310 space-y-12 px-5 py-12 sm:px-8">
        <section aria-labelledby="equipment" className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="rounded-[24px] border border-[#E3EAF3] bg-white p-6 sm:p-8">
            <h2 id="equipment" className="text-[22px] font-extrabold sm:text-[26px]">Equipment we keep running</h2>
            <p className="mt-1 text-[14.5px] text-[#4A5B76]">Drives, motors, controls and boards from these {i.name.toLowerCase()} machines come to us for repair.</p>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {i.equipment.map((e) => (
                <li key={e} className="flex items-center gap-2.5 rounded-xl bg-[#F4F7FB] px-3.5 py-3 text-[14.5px] font-semibold">
                  <BadgeCheck size={18} className="flex-none" style={{ color: i.color }} aria-hidden="true" /> {e}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-[24px] bg-[#050B18] p-6 text-white">
            <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full blur-xl" style={{ background: `radial-gradient(closest-side, ${i.color}88, transparent)` }} />
            <p className="relative text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7FD3FF]">Every repair</p>
            <ul className="relative mt-4 space-y-3 text-[14.5px] text-white/85">
              {steps.map((s) => <li key={s} className="flex gap-2.5"><BadgeCheck size={18} className="mt-0.5 flex-none text-[#38BDF8]" aria-hidden="true" />{s}</li>)}
            </ul>
            <p className="relative mt-4 text-[13px] text-white/60">24–72 hr typical turnaround once your quote is approved.</p>
            <Link href="/request-pickup" className="relative mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/20 text-[14.5px] font-semibold hover:bg-white/10">Request a Pickup <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </section>

        <section aria-labelledby="svc">
          <h2 id="svc" className="text-[22px] font-extrabold sm:text-[26px]">Repair services for {i.name.toLowerCase()}</h2>
          <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3">
            {services.map((s) => (
              <li key={s.slug} className="max-sm:odd:last:col-span-2">
                <Link href={serviceUrl(s.slug)} className="group relative flex h-full flex-col items-start gap-2.5 overflow-hidden rounded-[18px] border border-white/10 p-3.5 text-white sm:flex-row sm:items-center sm:gap-3 shadow-[0_22px_44px_-24px_rgba(0,20,60,0.8)] transition hover:-translate-y-1 sm:p-4" style={{ background: `linear-gradient(155deg, #0B1020 0%, #121a33 55%, ${s.color}40 100%)` }}>
                  <span className="relative flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/15 sm:h-14 sm:w-14">
                    {s.icon ? <Image src={s.icon} alt="" aria-hidden="true" fill sizes="56px" className="object-contain p-1.5" /> : <ServiceIcon name={s.lucide} color={s.color} size={48} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-bold leading-snug sm:text-[15.5px]">{s.title}</span>
                    <span className="mt-0.5 hidden text-[12.5px] text-white/65 sm:line-clamp-1">{s.short}</span>
                  </span>
                  <ArrowUpRight size={17} className="hidden flex-none sm:block" style={{ color: s.color }} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="faq" className="rounded-[24px] border border-[#E3EAF3] bg-white p-6 sm:p-8">
          <h2 id="faq" className="text-[22px] font-extrabold sm:text-[26px]">{i.name} repair questions</h2>
          <div className="mt-3 divide-y divide-[#E3EAF3]">
            {faqs.map((f, n) => (
              <details key={f.q} className="group py-3.5" open={n === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-bold [&::-webkit-details-marker]:hidden">
                  <h3>{f.q}</h3>
                  <ChevronDown size={18} className="flex-none text-[#005AE0] transition group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="mt-2 text-[14.5px] leading-[1.7] text-[#4A5B76]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby="others">
          <div className="flex items-end justify-between gap-4">
            <h2 id="others" className="text-[22px] font-extrabold sm:text-[26px]">Other industries</h2>
            <Link href="/industries" className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#0052CC] hover:underline">View all <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            {others.map((x) => <li key={x.slug}><IndustryCard i={x} /></li>)}
          </ul>
        </section>

        <section aria-labelledby="cta" className="relative overflow-hidden rounded-[28px] bg-[#050B18] p-7 text-white sm:p-10">
          <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(0,102,255,0.6),transparent)] blur-xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_520px] lg:items-center">
            <div>
              <h2 id="cta" className="text-[26px] font-extrabold leading-tight sm:text-[34px]">Have a part number? <span className="bg-linear-to-r from-[#7FD3FF] to-[#00B0FF] bg-clip-text text-transparent">Find it fast.</span></h2>
              <p className="mt-2 text-[15px] leading-[1.7] text-white/70">Open the part page, buy refurbished, or get a repair quote.</p>
            </div>
            <form action="/search" method="get" role="search" className="rounded-2xl border border-white/15 bg-white/6 p-2 backdrop-blur">
              <label htmlFor="ind-q" className="sr-only">Part number</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input id="ind-q" name="q" required placeholder="Part or model number" className="h-14 w-full min-w-0 rounded-xl bg-white px-4 font-mono text-[16px] text-[#0B1A3C] outline-none placeholder:font-sans placeholder:text-[#5B6B84]" />
                <button type="submit" className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#0066FF] to-[#00B0FF] px-6 text-[15px] font-semibold"><Search size={17} aria-hidden="true" /> Search</button>
              </div>
            </form>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
