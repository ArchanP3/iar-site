import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Building2, Cable, ChevronRight, CircuitBoard, ClipboardCheck, Cpu, FileSearch, Gauge,
  Handshake, Lightbulb, MapPin, Package, Recycle, Zap, RefreshCw, Search, ShieldCheck, Truck, Wrench,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { brandFont } from "@/lib/font";
import { SITE_URL } from "@/lib/site";
import { getContact } from "@/lib/cms/business";
import { contact as place, directionsUrl, geo, openingHours, postalAddress } from "@/lib/contact";
import { brands } from "@/lib/brands";
import { industries } from "@/lib/industries";
import { totalCodes } from "@/lib/faultCodes";
import StatCounter from "@/components/about/StatCounter";
import { WhatsAppCta } from "@/components/WhatsAppButton";
import { PageExtras, seo } from "@/lib/cms/seo";

/* About page. Only facts IAR has confirmed are used here:
   Grand Island, NY repair centre, the USA, free evaluation, written quote first,
   24–72 hr typical turnaround, load testing, test report, one-year warranty,
   free return shipping, 24/7 line, on-site service. */

export const generateMetadata = seo("/about", {
  title: { absolute: "About IAR | Industrial Repair in Grand Island, New York" },
  description: "Industrial Automation Repair Inc. (IAR) is a servo motor, servo drive and industrial electronics repair centre in Grand Island, New York, serving plants across the USA.",
  alternates: { canonical: `${SITE_URL}/about` },
});

const stats: { value: number; to?: number; suffix: string; l: string }[] = [
  { value: 100, suffix: "%", l: "Units load tested before they ship" },
  { value: 24, suffix: "/7", l: "Emergency repair line" },
  { value: 24, to: 72, suffix: " hr", l: "Typical turnaround" },
  { value: 1, suffix: "-year", l: "Warranty on every repair" },
];

const offer = [
  { icon: Wrench, color: "#E11D3A", t: "Component-level repair", d: "Servo drives, VFDs, motors, encoders, CNC controls, PLCs, HMIs, power supplies and circuit boards. Your own unit, repaired and returned.", href: "/services" },
  { icon: Package, color: "#E11D3A", t: "Parts: new and refurbished", d: "Refurbished units you can buy online, new parts on request, and obsolete equipment sourced for you.", href: "/shop" },
  { icon: RefreshCw, color: "#E11D3A", t: "Exchange units", d: "A tested replacement at a lower price. Ship us your unit and we ship the replacement once it arrives.", href: "/services/exchange" },
  { icon: Truck, color: "#E11D3A", t: "Pickup and on-site service", d: "Book a pickup with FedEx, UPS or DHL, or have a technician come to your facility in the USA.", href: "/request-pickup" },
  { icon: Cable, color: "#E11D3A", t: "Custom cables", d: "Feedback, power and spare critical cables built to match your drive and motor.", href: "/services/custom-cables" },
  { icon: FileSearch, color: "#E11D3A", t: "Fault code library", d: "Plain-English guides to drive and CNC alarms, written by repair technicians.", href: "/fault-codes" },
];

const process = [
  { icon: Truck, t: "Ship it or request a pickup", d: "Any carrier, or we arrange a pickup from your facility." },
  { icon: ClipboardCheck, t: "Check-in and condition report", d: "Every unit is logged with photos the day it arrives." },
  { icon: Search, t: "Free evaluation and written quote", d: "We find the root cause, then quote. No work starts without your approval." },
  { icon: CircuitBoard, t: "Component-level repair", d: "Your original unit is repaired at board and component level." },
  { icon: Gauge, t: "Load testing", d: "Run under power on our test benches before it leaves the bench." },
  { icon: ShieldCheck, t: "Return with test report", d: "Packed securely, shipped back and covered by a 1-year warranty." },
];

const values = [
  { icon: ShieldCheck, color: "#E11D3A", t: "Ownership", d: "We treat every unit as if it came off our own line. If it is on our bench, it is our problem until it runs." },
  { icon: Handshake, color: "#E11D3A", t: "Honesty", d: "Free evaluation, a written quote and your approval before any work. The price you approve is the price you pay." },
  { icon: Zap, color: "#E11D3A", t: "Urgency", d: "A stopped line costs money every hour. We move fast and tell you where your repair stands." },
  { icon: Gauge, color: "#E11D3A", t: "Quality", d: "Tested, not just fixed: drives run a motor, motors run under drive control, and every repair ships with a test report." },
  { icon: Recycle, color: "#E11D3A", t: "Repair first", d: "Repairing proven equipment keeps machines running longer and keeps good hardware out of the scrap bin." },
  { icon: Lightbulb, color: "#E11D3A", t: "Always learning", d: "Every brand, current or obsolete. We keep learning new platforms so we can repair what others replace." },
];

export default async function AboutPage() {
  const contact = await getContact();
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        url: `${SITE_URL}/about`,
        name: "About Industrial Automation Repair Inc.",
        mainEntity: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Industrial Automation Repair Inc.",
        url: SITE_URL,
        logo: `${SITE_URL}/iar-logo.png`,
        description: "Industrial electronics repair: servo drives, motors, CNC controls, PLCs and HMIs, plus new and refurbished automation parts.",
        address: postalAddress, geo, openingHoursSpecification: openingHours,
        areaServed: [{ "@type": "Country", name: "United States" }],
        ...(contact.phone ? { telephone: contact.phone } : {}),
        ...(contact.email ? { email: contact.email } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "About", item: `${SITE_URL}/about` },
        ],
      },
    ],
  };

  return (
    <main className={`${brandFont.className} min-h-screen bg-[#F7F7F8] text-[#131316]`}>
      <PageExtras path="/about" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <Header />

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-[#0A0A0C] pb-28 pt-8 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-120 w-160 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.5),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-90 w-115 rounded-full bg-[radial-gradient(closest-side,rgba(255,59,85,0.22),transparent)] blur-2xl" />
        <div className="relative mx-auto max-w-310 px-5 sm:px-8">
          <nav aria-label="Breadcrumb"><ol className="flex items-center gap-1.5 text-[12.5px] text-white/60"><li><Link href="/" className="hover:text-white">Home</Link></li><li aria-hidden="true"><ChevronRight size={13} /></li><li className="text-white/85" aria-current="page">About</li></ol></nav>
          <div className="mt-6 max-w-205">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#FF8A99]"><span className="h-0.5 w-8 rounded bg-[#FF3B55]" aria-hidden="true" />About IAR</p>
            <h1 className="mt-3 text-[36px] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[54px]">
              Your automation <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">repair partner.</span>
            </h1>
            <p className="mt-4 text-[15.5px] leading-[1.75] text-white/75 sm:text-[18px]">
              Industrial Automation Repair Inc. (IAR) is a full-service servo motor repair shop and industrial automation repair centre in Grand Island, New York. We repair servo motors, servo drives and industrial electronics for plant maintenance teams, OEMs and manufacturers across the USA.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/request-repair" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-6 text-[15px] font-semibold shadow-[0_14px_30px_-14px_rgba(255,59,85,0.9)] transition hover:-translate-y-0.5"><Wrench size={17} aria-hidden="true" /> Request a Repair</Link>
              <Link href="/services" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-6 text-[15px] font-semibold hover:bg-white/10">Our repair services <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto -mt-16 max-w-310 space-y-14 px-5 pb-16 sm:px-8">
        {/* ---------- Stats ---------- */}
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <li key={s.l} className="rounded-[20px] border border-[#EAEAEC] bg-white px-3 py-5 text-center shadow-[0_25px_50px_-35px_rgba(19,19,22,0.6)] sm:p-6">
              <p className="whitespace-nowrap text-[clamp(20px,6.2vw,28px)] font-extrabold leading-none text-[#B30E29] sm:text-[38px]"><StatCounter value={s.value} to={s.to} suffix={s.suffix} /></p>
              <p className="mt-2 text-[12.5px] font-semibold text-[#5A5A66] sm:text-[14px]">{s.l}</p>
            </li>
          ))}
        </ul>

        {/* ---------- Story ---------- */}
        <section aria-labelledby="story" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <div className="rounded-[26px] border border-[#EAEAEC] bg-white p-6 sm:p-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B30E29]">About IAR</p>
            <h2 id="story" className="mt-2 text-[26px] font-extrabold leading-tight sm:text-[34px]">A full-service servo repair shop in Grand Island, NY</h2>
            <div className="mt-4 space-y-4 text-[15px] leading-[1.8] text-[#5A5A66] sm:text-[16px]">
              <p>Our Grand Island, NY repair centre serves Buffalo, Niagara and Western New York, and plants across the USA ship units to our bench. Every repair follows our documented inspection, repair and testing process: failure analysis, a written quote with lead time, repair with genuine OEM components and full testing under load.</p>
              <p>We specialize in Siemens (SINAMICS, SIMODRIVE, SINUMERIK), Bosch Rexroth Indramat and Allen-Bradley / Rockwell Automation, and routinely repair FANUC, ABB, Yaskawa, Mitsubishi, Panasonic, Kollmorgen, Parker, Baldor and Control Techniques equipment.</p>
              <p>Legacy automation equipment support is a big share of our bench time. When a manufacturer stops supporting a motor or drive, repair is often the only option — so we rebuild discontinued units, stock obsolete parts and offer a servo exchange on many models.</p>
            </div>
          </div>
          <div className="relative flex flex-col overflow-hidden rounded-[26px] bg-[#0A0A0C] p-6 text-white sm:p-9">
            <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.6),transparent)] blur-xl" />
            <p className="relative text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF8A99]">Our promise</p>
            <ul className="relative mt-5 space-y-4">
              {["Free evaluation on every repair", "Written quote before any work starts", "24–72 hr typical turnaround once approved", "Load tested on OEM-standard equipment", "Test report with every unit", "One-year warranty and free return shipping"].map((t) => (
                <li key={t} className="flex gap-3 text-[15px] text-white/85"><BadgeCheck size={20} className="mt-0.5 flex-none text-[#FF5A6E]" aria-hidden="true" />{t}</li>
              ))}
            </ul>
            <p className="relative mt-6 flex items-center gap-2 border-t border-white/10 pt-5 text-[13.5px] text-white/65"><MapPin size={16} className="flex-none text-[#FF8A99]" aria-hidden="true" /> <span><a href={directionsUrl} target="_blank" rel="noopener" className="underline-offset-2 hover:text-white hover:underline">{place.address}</a> · serving the USA</span></p>
            {/* questions: two easy ways in, pinned to the bottom of the card */}
            <div className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:mt-auto lg:pt-6">
              <WhatsAppCta topic="A question from the About page" label="WhatsApp us" />
              <Link href="/contact" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-6 text-[15px] font-semibold hover:bg-white/10">Contact us <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </div>
        </section>

        {/* ---------- Mission & vision ---------- */}
        <section aria-labelledby="mission" className="grid gap-3 sm:grid-cols-2">
          <h2 id="mission" className="sr-only">Mission and vision</h2>
          {[
            { k: "Our mission", t: "Fix it, prove it, ship it back", d: "Repair motion control equipment at component level, prove it under load and send it back with a test report, so plants spend less on downtime and less on new hardware.", color: "#E11D3A" },
            { k: "Our vision", t: "The repair shop plants call first", d: "Be the shop maintenance teams across the USA trust with their Siemens, Indramat and Allen-Bradley equipment — and everything else on the floor, current or legacy.", color: "#E11D3A" },
          ].map((m) => (
            <div key={m.k} className="relative overflow-hidden rounded-[24px] border border-[#EAEAEC] bg-white p-6 sm:p-8">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${m.color}, transparent)` }} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: m.color === "#FF3B55" ? "#AE0922" : "#B30E29" }}>{m.k}</p>
              <h3 className="mt-2 text-[22px] font-extrabold sm:text-[26px]">{m.t}</h3>
              <p className="mt-2 text-[15px] leading-[1.7] text-[#5A5A66]">{m.d}</p>
            </div>
          ))}
        </section>

        {/* ---------- What we do ---------- */}
        <section aria-labelledby="do">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B30E29]"><span className="h-0.5 w-8 rounded bg-[#C8102E]" aria-hidden="true" />What we do</p>
          <h2 id="do" className="mt-2 text-[26px] font-extrabold leading-tight sm:text-[34px]">One team for repair, parts and service</h2>
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {offer.map(({ icon: Icon, color, t, d, href }) => (
              <li key={t}>
                <Link href={href} className="hexcard group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-white/10 p-5 text-white shadow-[0_22px_44px_-24px_rgba(28,28,32,0.8)] transition hover:-translate-y-1 sm:p-6">
                  <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-xl transition group-hover:scale-125" style={{ background: `radial-gradient(closest-side, #C8102E77, transparent)` }} />
                  <div className="relative flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-white/15" style={{ background: `linear-gradient(145deg, ${color}40, #131316)`, boxShadow: `0 10px 26px -12px ${color}` }}><Icon size={22} style={{ color }} aria-hidden="true" /></span>
                    <ArrowUpRight size={18} style={{ color }} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </div>
                  <h3 className="relative mt-4 text-[18px] font-extrabold">{t}</h3>
                  <p className="relative mt-1.5 text-[13.5px] leading-[1.6] text-white/70">{d}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- How we work ---------- */}
        <section aria-labelledby="how" className="rounded-[26px] border border-[#EAEAEC] bg-white p-6 sm:p-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B30E29]">How we work</p>
          <h2 id="how" className="mt-2 text-[26px] font-extrabold leading-tight sm:text-[34px]">Every repair, the same six steps</h2>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {process.map(({ icon: Icon, t, d }, i) => (
              <li key={t} className="relative rounded-2xl bg-[#F7F7F8] p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-white"><Icon size={18} aria-hidden="true" /></span>
                  <span className="text-[12px] font-bold tracking-[0.18em] text-[#696976]">STEP {String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-3 text-[16px] font-extrabold">{t}</h3>
                <p className="mt-1 text-[14px] leading-[1.6] text-[#5A5A66]">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Repair centre ---------- */}
        <section aria-labelledby="bench" className="relative overflow-hidden rounded-[26px] bg-[#0A0A0C] p-6 text-white sm:p-9">
          <span aria-hidden="true" className="pointer-events-none absolute -left-20 -bottom-24 h-80 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(255,59,85,0.35),transparent)] blur-xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF8A99]">Our repair centre</p>
              <h2 id="bench" className="mt-2 text-[26px] font-extrabold leading-tight sm:text-[34px]">Tested the way it will be used</h2>
              <p className="mt-3 text-[15px] leading-[1.75] text-white/70">Every unit is repaired and tested at our Grand Island, New York repair centre. A drive that only powers up on the bench is not finished. It has to run a motor under load before it ships.</p>
            </div>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {[
                { t: "Drives tested with a motor", d: "Run under power on our test benches." },
                { t: "Motors under drive control", d: "Checked the way your machine runs them." },
                { t: "Encoder alignment checked", d: "So the motor commutates correctly when installed." },
                { t: "Test report with every unit", d: "What we found, what we replaced, how it tested." },
              ].map((x) => (
                <li key={x.t} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="flex items-center gap-2 text-[14.5px] font-bold"><BadgeCheck size={17} className="text-[#FF5A6E]" aria-hidden="true" />{x.t}</p>
                  <p className="mt-1 pl-6 text-[13px] text-white/65">{x.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Core values ---------- */}
        <section aria-labelledby="values">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B30E29]"><span className="h-0.5 w-8 rounded bg-[#C8102E]" aria-hidden="true" />Core values</p>
          <h2 id="values" className="mt-2 text-[26px] font-extrabold leading-tight sm:text-[34px]">What we stand for</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {values.map(({ icon: Icon, color, t, d }) => (
              <li key={t} className="group relative overflow-hidden rounded-[22px] border border-[#EAEAEC] bg-white p-5 transition hover:-translate-y-1 hover:shadow-[0_25px_50px_-35px_rgba(19,19,22,0.6)] sm:p-6">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
                <span aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-60 blur-2xl transition group-hover:opacity-100" style={{ background: `radial-gradient(closest-side, #C8102E40, transparent)` }} />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${color}18`, boxShadow: `inset 0 0 0 1px ${color}30` }}>
                  <Icon size={22} style={{ color }} aria-hidden="true" />
                </span>
                <h3 className="relative mt-4 text-[18px] font-extrabold">{t}</h3>
                <p className="relative mt-1.5 text-[14.5px] leading-[1.65] text-[#5A5A66]">{d}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Coverage ---------- */}
        <section aria-labelledby="coverage" className="grid gap-3 sm:grid-cols-3">
          <h2 id="coverage" className="sr-only">Brands, industries and fault codes</h2>
          {[
            { icon: Cpu, n: brands.length, sfx: "+", l: "Brand pages", d: "And equipment from every major brand", href: "/brands", color: "#E11D3A" },
            { icon: Building2, n: industries.length, sfx: "", l: "Industries served", d: "From automotive to water treatment", href: "/industries", color: "#E11D3A" },
            { icon: FileSearch, n: totalCodes, sfx: "", l: "Fault codes explained", d: "Free guides from our technicians", href: "/fault-codes", color: "#E11D3A" },
          ].map(({ icon: Icon, n, sfx, l, d, href, color }) => (
            <Link key={l} href={href} className="group flex items-center gap-4 rounded-[22px] border border-[#EAEAEC] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#C8102E]/40">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl" style={{ background: `${color}18` }}><Icon size={22} style={{ color }} aria-hidden="true" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[24px] font-extrabold leading-none"><StatCounter value={n} suffix={sfx} /></span>
                <span className="mt-1 block text-[14px] font-bold">{l}</span>
                <span className="block text-[12.5px] text-[#696976]">{d}</span>
              </span>
              <ArrowUpRight size={18} className="flex-none text-[#B30E29]" aria-hidden="true" />
            </Link>
          ))}
        </section>

        {/* ---------- CTA ---------- */}
        <section aria-labelledby="cta" className="relative overflow-hidden rounded-[28px] bg-[#0A0A0C] p-7 text-white sm:p-10">
          <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.6),transparent)] blur-xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 id="cta" className="text-[28px] font-extrabold leading-tight sm:text-[38px]">Machine down? <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">Let&apos;s get it running.</span></h2>
              <p className="mt-2 max-w-160 text-[15px] leading-[1.7] text-white/70">Send the part number or ship the unit. Evaluation is free, and you approve the quote before we start.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/request-repair" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-6 text-[15px] font-semibold"><Wrench size={17} aria-hidden="true" /> Request a Repair</Link>
              <Link href="/request-quote" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-6 text-[15px] font-semibold hover:bg-white/10">Request a Quote <ArrowRight size={16} aria-hidden="true" /></Link>
              <WhatsAppCta topic="A question from the About page" />
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
