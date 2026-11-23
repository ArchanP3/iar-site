import Link from "next/link";
import { ArrowRight, ChevronRight, Wrench } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import IndustryCard from "@/components/industries/IndustryCard";
import { montserrat } from "@/lib/font";
import { industries, industryUrl } from "@/lib/industries";
import { SITE_URL } from "@/lib/site";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/industries", {
  title: { absolute: "Industries We Serve | Industrial Repair | AutomIQ" },
  description: "Servo drive, motor, PLC, HMI and CNC repair for automotive, packaging, plastics, food, metalworking, printing, pharma and 12 more industries. Canada & USA.",
  alternates: { canonical: `${SITE_URL}/industries` },
});

export default function IndustriesPage() {
  const core = industries.filter((i) => i.core);
  const more = industries.filter((i) => !i.core);
  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Industries we serve",
    itemListElement: industries.map((i, n) => ({ "@type": "ListItem", position: n + 1, name: `${i.name} equipment repair`, url: `${SITE_URL}${industryUrl(i.slug)}` })),
  };
  return (
    <main className={`${montserrat.className} min-h-screen bg-[#F4F7FB] text-[#0B1A3C]`}>
      <PageExtras path="/industries" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(list).replace(/</g, "\\u003c") }} />
      <Header />
      <section className="relative overflow-hidden bg-[#050B18] pb-28 pt-8 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-115 w-155 rounded-full bg-[radial-gradient(closest-side,rgba(0,102,255,0.5),transparent)] blur-2xl" />
        <div className="relative mx-auto max-w-310 px-5 sm:px-8">
          <nav aria-label="Breadcrumb"><ol className="flex items-center gap-1.5 text-[12.5px] text-white/60"><li><Link href="/" className="hover:text-white">Home</Link></li><li aria-hidden="true"><ChevronRight size={13} /></li><li className="text-white/85" aria-current="page">Industries</li></ol></nav>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-190">
              <h1 className="text-[34px] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[48px]">Industries <span className="bg-linear-to-r from-[#7FD3FF] to-[#00B0FF] bg-clip-text text-transparent">We Serve</span></h1>
              <p className="mt-3 text-[15px] leading-[1.7] text-white/75 sm:text-[17px]">Every plant runs on drives, motors and controls. We repair them for manufacturers across Canada and the USA, whatever you make.</p>
            </div>
            <div className="flex gap-3">
            <Link href="/request-repair" className="inline-flex h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap sm:flex-none rounded-xl bg-linear-to-br from-[#0066FF] to-[#00B0FF] px-6 text-[15px] font-semibold shadow-[0_14px_30px_-14px_rgba(0,176,255,0.9)] transition hover:-translate-y-0.5"><Wrench size={17} aria-hidden="true" /> Request a Repair</Link>
            <WhatsAppButton tone="dark" size="lg" topic="A question from the Industries page" label="Chat on WhatsApp" />
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto -mt-20 max-w-310 space-y-10 px-5 pb-16 sm:px-8">
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {core.map((i) => <li key={i.slug}><IndustryCard i={i} big /></li>)}
        </ul>

        <section aria-labelledby="more">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#005AE0]"><span className="h-0.5 w-8 rounded bg-[#0066FF]" aria-hidden="true" />More industries</p>
          <h2 id="more" className="mt-2 text-[26px] font-extrabold leading-tight sm:text-[32px]">Wherever there&apos;s a drive, motor or control</h2>
          <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {more.map((i) => <li key={i.slug}><IndustryCard i={i} /></li>)}
          </ul>
        </section>

        <section aria-labelledby="any" className="relative overflow-hidden rounded-[28px] bg-[#050B18] p-7 text-white sm:p-10">
          <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(0,102,255,0.6),transparent)] blur-xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_520px] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7FD3FF]">1,000+ brands</p>
              <h2 id="any" className="mt-2 text-[28px] font-extrabold leading-tight sm:text-[36px]">Don&apos;t see your industry? <span className="bg-linear-to-r from-[#7FD3FF] to-[#00B0FF] bg-clip-text text-transparent">We repair everything.</span></h2>
              <p className="mt-2 text-[15px] leading-[1.7] text-white/70">Send the part number of the drive, motor or control and we&apos;ll confirm.</p>
            </div>
            <form action="/request-repair" method="get" className="rounded-2xl border border-white/15 bg-white/6 p-2 backdrop-blur">
              <label htmlFor="ind-part" className="sr-only">Part number</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input id="ind-part" name="part" required placeholder="Part or model number" className="h-14 w-full min-w-0 rounded-xl bg-white px-4 font-mono text-[16px] text-[#0B1A3C] outline-none placeholder:font-sans placeholder:text-[#5B6B84]" />
                <button type="submit" className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#0066FF] to-[#00B0FF] px-6 text-[15px] font-semibold">Send it <ArrowRight size={17} aria-hidden="true" /></button>
              </div>
            </form>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
