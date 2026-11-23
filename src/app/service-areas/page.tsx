import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, ChevronRight, ClipboardCheck, Clock, FileText, Globe2, MapPin, PackageCheck, ShieldCheck, Truck, Wrench } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AreasMap from "@/components/serviceAreas/AreasMap";
import AreaDirectory from "@/components/serviceAreas/AreaDirectory";
import { brandFont } from "@/lib/font";
import { areasHere as areas, areaAbs, areaHref } from "@/lib/serviceAreas";
import { regionsIn } from "@/lib/areaRegions";
import { COUNTRY_SITES, SITE_COUNTRY, SITE_URL } from "@/lib/site";
import { PageExtras, seo } from "@/lib/cms/seo";

/* Each country site lists its own cities: .ca the Canadian ones, .com the US ones, with a link to
   the other site's list. Before the split (no NEXT_PUBLIC_SITE_COUNTRY) it lists both countries. */
const text = {
  CA: {
    title: "Service Areas: Industrial Repair Across Canada | IAR",
    description: "One repair centre in Mississauga, Ontario serving manufacturers across Canada: drop-off, pickup, ship-in and on-site service.",
    accent: "All of Canada.",
    intro: "Every repair is done at our repair centre in Mississauga, Ontario. Drop it off, ship it in, or let us arrange the pickup from your plant, from Vancouver to Halifax.",
    stats: [["provinces", "Provinces"], ["cities", "Canadian cities"]],
    everywhere: "Every city in Canada",
    anywhere: "Request a pickup from anywhere in Canada, or book a technician for on-site service at your plant.",
    other: { q: "In the USA?", label: "See our US service areas", href: `${COUNTRY_SITES.US}/service-areas` },
  },
  US: {
    title: "Service Areas: Industrial Repair for US Manufacturers | IAR",
    description: "Servo drive, motor and industrial electronics repair for US manufacturers: pickup from your plant with customs paperwork help, repaired at our centre in Mississauga, Ontario.",
    accent: "Serving the USA.",
    intro: "Every repair is done at our repair centre in Mississauga, Ontario. We arrange the pickup from your plant and help with the customs paperwork, from Chicago to Pittsburgh and across the USA.",
    stats: [["states", "States"], ["cities", "US cities"]],
    everywhere: "Every city in the USA",
    anywhere: "Request a pickup from anywhere in the USA, or book a technician for on-site service at your plant.",
    other: { q: "In Canada?", label: "See our Canadian service areas", href: `${COUNTRY_SITES.CA}/service-areas` },
  },
}[SITE_COUNTRY ?? "CA"];
const split = SITE_COUNTRY !== null;

export const generateMetadata = seo("/service-areas", {
  title: split ? text.title : "Service Areas: Industrial Repair Across Canada & USA | IAR",
  description: split ? text.description : "One repair centre in Mississauga, Ontario serving manufacturers across Canada and the USA: drop-off, pickup, ship-in and on-site service.",
  alternates: { canonical: `${SITE_URL}/service-areas` },
});

const urls = Object.fromEntries(areas.map((a) => [a.slug, areaHref(a)]));
const ca = areas.filter((a) => a.country === "CA").length;
const us = areas.filter((a) => a.country === "US").length;
const regionCount = new Set(areas.map((a) => a.regionCode)).size;
const stats: [string, string][] = split
  ? [[`${regionCount}`, text.stats[0][1]], [`${areas.length}`, text.stats[1][1]], ["24–72 hr", "typical turnaround"], ["1-year", "warranty"]]
  : [[`${ca}`, "Canadian cities"], [`${us}`, "US cities"], ["24–72 hr", "typical turnaround"], ["1-year", "warranty"]];
const regions = regionsIn(areas);

const dropOff = { icon: MapPin, t: "Drop-off in Mississauga", d: "Walk in during business hours. No appointment needed.", cta: "Contact us", href: "/contact", color: "#FF3B55" };
const pickupCA = { icon: PackageCheck, t: "Pickup across Canada", d: "We arrange the collection and send you the waybill.", cta: "Request a pickup", href: "/request-pickup", color: "#F31D3D" };
const pickupUS = { icon: Globe2, t: "Pickup across the USA", d: "Waybill and customs paperwork help included.", cta: "Request a pickup", href: "/request-pickup", color: "#F43F5E" };
const onSite = (where: string) => ({ icon: Wrench, t: "On-site service", d: `Technicians at your plant in ${where}.`, cta: "Book on-site service", href: "/on-site-service", color: "#F5A524" });
const ways =
  SITE_COUNTRY === "US" ? [pickupUS, onSite("the USA"), dropOff]
  : SITE_COUNTRY === "CA" ? [dropOff, pickupCA, onSite("Canada")]
  : [dropOff, pickupCA, pickupUS, onSite("Canada and the USA")];

const steps = [
  { icon: Truck, t: "Book the pickup", d: "Tell us what's failed and where it is. Pickup from your plant, or ship it in with any carrier." },
  { icon: ClipboardCheck, t: "We send the waybill", d: "We arrange the collection and send the paperwork. US shipments get customs paperwork help." },
  { icon: FileText, t: "Free evaluation & quote", d: "Root cause found and a written quote sent before any work starts." },
  { icon: ShieldCheck, t: "Tested & returned", d: "Repaired, load tested on our benches and shipped back with a test report and a 1-year warranty." },
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Service Areas", item: `${SITE_URL}/service-areas` },
    ] },
    { "@type": "ItemList", name: "Cities we serve", itemListElement: areas.map((a, i) => ({ "@type": "ListItem", position: i + 1, name: `${a.city}, ${a.regionCode}`, url: areaAbs(a) })) },
  ],
};

export default function ServiceAreasPage() {
  return (
    <main className={`${brandFont.className} min-h-screen bg-[#F7F7F8] text-[#131316]`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <PageExtras path="/service-areas" />
      <Header />

      {/* ---------- Hero with the animated map ---------- */}
      <section className="relative overflow-hidden bg-[#0A0A0C] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="absolute -left-40 -top-48 h-140 w-180 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.45),transparent)] blur-2xl" />
          <span className="absolute -right-32 top-1/3 h-120 w-160 rounded-full bg-[radial-gradient(closest-side,rgba(255,59,85,0.22),transparent)] blur-2xl" />
          <span className="absolute inset-0 bg-[linear-gradient(rgba(255,138,153,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,138,153,0.04)_1px,transparent_1px)] bg-size-[44px_44px] mask-[radial-gradient(90%_80%_at_60%_40%,#000,transparent)]" />
        </div>
        <div className="relative mx-auto grid max-w-360 items-center gap-8 px-5 pb-28 pt-8 sm:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-6 lg:px-12 lg:pb-32 lg:pt-10">
          <div>
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-white/60">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li className="flex items-center gap-1.5"><ChevronRight size={13} aria-hidden="true" /><span className="text-white/85">Service Areas</span></li>
              </ol>
            </nav>
            <p className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/6 px-3.5 py-1.5 text-[12px] font-semibold text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur">
              <span className="relative flex h-2 w-2"><span className="sa-ping absolute inset-0 rounded-full bg-[#FF3B55]" /><span className="relative h-2 w-2 rounded-full bg-[#FF3B55]" /></span>
              Repair centre · Mississauga, Ontario
            </p>
            <h1 className="mt-4 text-[34px] font-extrabold leading-[1.06] tracking-[-0.025em] sm:text-[48px] lg:text-[54px]">
              One repair centre.{" "}
              <span className="bg-linear-to-r from-[#FF8A99] via-[#FF5A6E] to-[#DA0B2A] bg-clip-text text-transparent">{split ? text.accent : "All of Canada & the USA."}</span>
            </h1>
            <p className="mt-4 max-w-140 text-[15px] leading-[1.7] text-white/72 sm:text-[16.5px]">
              {split
                ? text.intro
                : "Every repair is done at our repair centre in Mississauga, Ontario. Drop it off, ship it in, or let us arrange the pickup from your plant, from Vancouver to Halifax and Chicago to Pittsburgh."}
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link href="/request-pickup" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-6 text-[15px] font-semibold text-white shadow-[0_16px_34px_-14px_rgba(218,11,42,0.9)] transition hover:-translate-y-0.5">
                <Truck size={17} aria-hidden="true" /> Request a Pickup <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/request-repair" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 text-[15px] font-semibold text-white backdrop-blur transition hover:border-white/45">
                <Wrench size={17} aria-hidden="true" /> Request a Repair
              </Link>
            </div>
            <dl className="mt-8 grid max-w-140 grid-cols-2 gap-2.5 sm:grid-cols-4">
              {stats.map(([n, l]) => (
                <div key={l} className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  <dt className="sr-only">{l}</dt>
                  <dd className="text-[20px] font-extrabold leading-none">{n}</dd>
                  <dd className="mt-1 text-[11.5px] leading-tight text-white/55">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <AreasMap areas={areas} urls={urls} />
            <div className="mt-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[12px] font-semibold text-white/60 lg:justify-end">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2 border-[#FF3B55] bg-white" aria-hidden="true" />Our repair centre</span>
              {regions.map((r) => <span key={r.key} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2 bg-[#0A0A0C]" style={{ borderColor: r.color }} aria-hidden="true" />{r.label}</span>)}
              <span className="text-white/60"><span className="hidden sm:inline">Hover a city · </span>{split ? text.everywhere : "Every city in Canada & the USA"} served</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- How your unit reaches us ---------- */}
      <div className="relative mx-auto -mt-20 max-w-360 px-5 sm:px-8 lg:px-12">
        <ul className={`grid grid-cols-2 gap-2.5 sm:gap-3 ${ways.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
          {ways.map(({ icon: Icon, t, d, cta, href, color }) => (
            <li key={t}>
              <Link href={href} className="group relative flex h-full flex-col overflow-hidden rounded-[18px] border border-white/10 p-4 text-white shadow-[0_26px_50px_-24px_rgba(28,28,32,0.85)] transition duration-300 hover:-translate-y-1 sm:rounded-[22px] sm:p-5" style={{ background: `linear-gradient(155deg, #0F0F10 0%, #1A1A1E 50%, ${color}48 100%)` }}>
                <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-xl transition duration-500 group-hover:scale-125" style={{ background: `radial-gradient(closest-side, ${color}80, transparent)` }} />
                <span className="relative flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ring-white/20 sm:h-12 sm:w-12" style={{ background: `linear-gradient(145deg, ${color}, #131316)` }}><Icon size={20} aria-hidden="true" /></span>
                  <ArrowUpRight size={18} style={{ color }} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
                <span className="relative mt-3.5 text-[15px] font-extrabold leading-snug sm:mt-4 sm:text-[18px]">{t}</span>
                <span className="relative mt-1 text-[12px] leading-normal text-white/70 sm:text-[13.5px]">{d}</span>
                <span className="relative mt-auto pt-4"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#131316]/70 px-3 py-1.5 text-[12px] font-bold text-white ring-1 ring-white/15 backdrop-blur sm:text-[12.5px]">{cta} <ArrowRight size={14} style={{ color }} className="transition group-hover:translate-x-0.5" aria-hidden="true" /></span></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* ---------- City finder ---------- */}
      <section id="cities" aria-labelledby="cities-heading" className="mx-auto max-w-360 scroll-mt-28 px-5 pt-14 sm:px-8 lg:px-12 lg:pt-16">
        <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B30E29] sm:text-[12px]">
          <span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#C8102E] to-[#FF3B55]" /> Cities we serve
        </p>
        <h2 id="cities-heading" className="mt-3 text-[28px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[36px]">
          Find your city. <span className="bg-linear-to-r from-[#C8102E] to-[#FF3B55] bg-clip-text text-transparent">See how we reach you.</span>
        </h2>
        <p className="mt-3 max-w-180 text-[14.5px] leading-[1.65] text-[#62626F] sm:text-[16px]">
          Each city page explains drop-off or pickup from your area, the local industries we support and what we repair.
        </p>
        <div className="mt-7"><AreaDirectory areas={areas} urls={urls} /></div>
        {split && (
          <p className="mt-6 text-[14.5px] text-[#62626F]">
            {text.other.q}{" "}
            <a href={text.other.href} className="inline-flex items-center gap-1 font-semibold text-[#A50D25] hover:underline">{text.other.label} <ArrowUpRight size={14} aria-hidden="true" /></a>
          </p>
        )}
      </section>

      {/* ---------- How a pickup works ---------- */}
      <section aria-labelledby="pickup-heading" className="mx-auto max-w-360 px-5 pt-14 sm:px-8 lg:px-12 lg:pt-16">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0A0A0C] p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_40px_80px_-44px_rgba(200,16,46,0.75)] sm:p-9">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <span className="absolute -left-32 -top-40 h-105 w-150 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.4),transparent)] blur-2xl" />
            <span className="absolute -right-24 -bottom-30 h-105 w-150 rounded-full bg-[radial-gradient(closest-side,rgba(255,59,85,0.22),transparent)] blur-2xl" />
          </div>
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF8A99]">From your plant to our bench</p>
              <h2 id="pickup-heading" className="mt-2 text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em] sm:text-[32px]">How a pickup works</h2>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-white/60"><Clock size={15} className="text-[#FF8A99]" aria-hidden="true" /> 24–72 hr typical turnaround once we receive your unit</div>
          </div>
          <ol className="relative mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, t, d }, i) => (
              <li key={t} className="relative rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] shadow-[0_10px_24px_-10px_rgba(218,11,42,0.9)]"><Icon size={18} aria-hidden="true" /></span>
                  <span aria-hidden="true" data-n={String(i + 1).padStart(2, "0")} className="deco-num font-mono text-[28px] font-bold leading-none text-white/12" />
                </div>
                <p className="mt-4 text-[16px] font-extrabold">{t}</p>
                <p className="mt-1 text-[13px] leading-normal text-white/62">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- City not listed ---------- */}
      <section className="mx-auto max-w-360 px-5 pb-16 pt-14 sm:px-8 lg:px-12 lg:pb-20 lg:pt-16">
        <div className="relative overflow-hidden rounded-[28px] bg-linear-to-br from-[#C8102E] via-[#E30C2C] to-[#FF3B55] p-6 text-white shadow-[0_40px_80px_-40px_rgba(200,16,46,0.9)] sm:p-9">
          <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full border-[36px] border-white/8" />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-28 right-40 h-64 w-64 rounded-full border-[28px] border-white/6" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-160">
              <p className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/80"><BadgeCheck size={15} aria-hidden="true" /> {split ? text.everywhere : "Every city in Canada & the USA"}</p>
              <h2 className="mt-2 text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em] sm:text-[34px]">City not listed? We still come to you.</h2>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-white/85 sm:text-[16px]">{split ? text.anywhere : "Request a pickup from anywhere in Canada or the USA, or book a technician for on-site service at your plant."}</p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Link href="/request-pickup" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-[#131316] shadow-[0_14px_30px_-14px_rgba(0,0,0,0.5)] transition hover:-translate-y-0.5"><Truck size={17} aria-hidden="true" /> Request a Pickup</Link>
              <Link href="/on-site-service" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/40 px-6 text-[15px] font-semibold text-white transition hover:bg-white/10"><Wrench size={17} aria-hidden="true" /> Book On-site Service</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
