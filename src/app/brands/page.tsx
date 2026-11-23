import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronRight, Wrench } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { brandFont } from "@/lib/font";
import WhatsAppButton from "@/components/WhatsAppButton";
import { brands, brandUrl } from "@/lib/brands";
import BrandDirectory from "@/components/brands/BrandDirectory";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/brands", {
  title: "Brands We Repair | Siemens, Indramat, Fanuc & More | IAR",
  description: "We repair every automation brand: Siemens, Indramat, Allen-Bradley, Fanuc, Yaskawa, Danfoss, KUKA and many more. Drives, motors, controls, HMIs and boards.",
});

export default function BrandsPage() {
  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Automation brands we repair",
    itemListElement: brands.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: `${b.name} repair`, url: brandUrl(b.slug) })),
  };
  const Card = ({ b, big = false }: { b: (typeof brands)[number]; big?: boolean }) => (
    <div className="relative h-full">
    <Link href={brandUrl(b.slug)} className="group relative flex h-full flex-col overflow-hidden rounded-[18px] border border-white/10 p-3.5 pb-15 text-white sm:rounded-[22px] sm:p-5 sm:pb-17 shadow-[0_22px_44px_-24px_rgba(28,28,32,0.8)] transition hover:-translate-y-1" style={{ background: `linear-gradient(155deg, #0F0F10 0%, #1A1A1E 50%, ${b.color}40 100%)` }}>
      <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-xl transition group-hover:scale-125" style={{ background: `radial-gradient(closest-side, ${b.color}77, transparent)` }} />
      <div className="relative flex items-start justify-between">
        <span className={`flex items-center justify-center rounded-2xl font-extrabold ring-1 ring-white/20 ${big ? "h-14 w-14 text-[18px]" : "h-12 w-12 text-[15px]"}`} style={{ background: `linear-gradient(145deg, ${b.color}, #131316)` }}>{b.initials}</span>
        <ArrowUpRight size={18} style={{ color: b.color }} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
      <h2 className={`relative mt-3 min-h-[2lh] font-extrabold leading-snug sm:mt-4 ${big ? "text-[17px] sm:text-[22px]" : "text-[15px] sm:text-[18px]"}`}>{b.name} Repair</h2>
      <p className="relative mt-1 line-clamp-3 min-h-[3lh] text-[11.5px] leading-normal text-white/70 sm:line-clamp-none sm:text-[13px]">{b.card}</p>
      {b.core && <span className="absolute bottom-3.5 left-3.5 flex h-9 items-center sm:bottom-5 sm:left-5"><span className="rounded-full bg-[#0A0A0C]/55 px-2 py-1 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#FF8A99] ring-1 ring-white/10 sm:px-2.5 sm:text-[10.5px] sm:tracking-[0.14em]">Core<span className="max-sm:hidden lg:max-xl:hidden"> specialty</span></span></span>}
    </Link>
    <WhatsAppButton tone="dark" size="sm" topic={b.name} kind="brand" url={brandUrl(b.slug)} label={`Ask about ${b.name} repair on WhatsApp`} className="absolute right-3.5 bottom-3.5 sm:right-5 sm:bottom-5" />
    </div>
  );
  return (
    <main className={`${brandFont.className} min-h-screen bg-[#F7F7F8] text-[#131316]`}>
      <PageExtras path="/brands" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }} />
      <Header />
      <section className="relative overflow-hidden bg-[#0A0A0C] pb-28 pt-8 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-115 w-155 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.5),transparent)] blur-2xl" />
        <div className="relative mx-auto max-w-310 px-5 sm:px-8">
          <nav aria-label="Breadcrumb"><ol className="flex items-center gap-1.5 text-[12.5px] text-white/60"><li><Link href="/" className="hover:text-white">Home</Link></li><li aria-hidden="true"><ChevronRight size={13} /></li><li className="text-white/85">Brands</li></ol></nav>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-190">
              <h1 className="text-[34px] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[48px]">Every brand. <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">Every part.</span></h1>
              <p className="mt-3 text-[15px] leading-[1.7] text-white/75 sm:text-[17px]">We repair drives, motors, controller cards, CNC controls, HMIs, PLCs, power supplies and circuit boards from every major automation brand, current or obsolete. Name any brand and we&apos;ll repair it.</p>
            </div>
            <Link href="/request-repair" className="inline-flex h-12 w-fit items-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-6 text-[15px] font-semibold shadow-[0_14px_30px_-14px_rgba(255,59,85,0.9)] transition hover:-translate-y-0.5"><Wrench size={17} aria-hidden="true" /> Request a Repair</Link>
          </div>
        </div>
      </section>
      <div className="relative mx-auto -mt-20 max-w-310 space-y-10 px-5 pb-16 sm:px-8">
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {brands.filter((b) => b.core).map((b) => <li key={b.slug} className="max-lg:odd:last:col-span-2"><Card b={b} big /></li>)}
        </ul>
        <BrandDirectory />

        <section aria-labelledby="any" className="relative overflow-hidden rounded-[28px] bg-[#0A0A0C] p-7 text-white sm:p-10">
          <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.6),transparent)] blur-xl" />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(255,59,85,0.3),transparent)] blur-xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_520px] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF8A99]">Every major brand</p>
              <h2 id="any" className="mt-2 text-[28px] font-extrabold leading-tight sm:text-[36px]">Name any brand. <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">We repair it.</span></h2>
              <p className="mt-2 text-[15px] leading-[1.7] text-white/70">Drives, motors, controller cards, HMIs, power supplies and circuit boards from any manufacturer, current or obsolete. Send the part number and we&apos;ll confirm.</p>
            </div>
            <form action="/request-repair" method="get" className="rounded-2xl border border-white/15 bg-white/6 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur">
              <label htmlFor="any-part" className="sr-only">Part number</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input id="any-part" name="part" required placeholder="Part or model number" className="h-14 w-full min-w-0 rounded-xl bg-white px-4 font-mono text-[16px] text-[#131316] outline-none placeholder:font-sans placeholder:text-[#696976]" />
                <button type="submit" className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-6 text-[15px] font-semibold">Send it <ArrowRight size={17} aria-hidden="true" /></button>
              </div>
            </form>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
