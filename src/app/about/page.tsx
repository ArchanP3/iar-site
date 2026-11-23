import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Building2, Cable, ChevronRight, CircuitBoard, ClipboardCheck, Cpu, FileSearch, Gauge,
  Handshake, Lightbulb, MapPin, Package, Recycle, Zap, RefreshCw, Search, ShieldCheck, Truck, Wrench,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { montserrat } from "@/lib/font";
import { SITE_URL } from "@/lib/site";
import { getContact } from "@/lib/cms/business";
import { contact as place, directionsUrl, geo, openingHours, postalAddress } from "@/lib/contact";
import { brands } from "@/lib/brands";
import { industries } from "@/lib/industries";
import { totalCodes } from "@/lib/faultCodes";
import StatCounter from "@/components/about/StatCounter";
import { WhatsAppCta } from "@/components/WhatsAppButton";
import { PageExtras, seo } from "@/lib/cms/seo";

/* About page. Only facts the business has confirmed are used here:
   20+ years, Mississauga ON repair centre, Canada & USA, 1,000+ brands,
   free evaluation, written quote first, 24–72 hr typical turnaround, own test jigs,
   test report, 12-month warranty on repairs, on-site service. */

export const generateMetadata = seo("/about", {
  title: { absolute: "About AutomIQ | Industrial Repair in Mississauga, Ontario" },
  description: "20+ years repairing servo drives, motors, CNC controls, PLCs and HMIs at our Mississauga, Ontario repair centre for manufacturers across Canada and the USA.",
  alternates: { canonical: `${SITE_URL}/about` },
});

const stats: { value: number; to?: number; suffix: string; l: string }[] = [
  { value: 20, suffix: "+", l: "Years of experience" },
  { value: 1000, suffix: "+", l: "Brands we repair" },
  { value: 24, to: 72, suffix: " hr", l: "Typical turnaround" },
  { value: 12, suffix: "-month", l: "Warranty on repairs" },
];

const offer = [
  { icon: Wrench, color: "#3B82F6", t: "Component-level repair", d: "Servo drives, VFDs, motors, encoders, CNC controls, PLCs, HMIs, power supplies and circuit boards. Your own unit, repaired and returned.", href: "/services" },
  { icon: Package, color: "#22C55E", t: "Parts: new and refurbished", d: "Refurbished units you can buy online, new parts on request, and obsolete equipment sourced for you.", href: "/shop" },
  { icon: RefreshCw, color: "#F59E0B", t: "Exchange units", d: "A tested replacement at a lower price. Ship us your unit and we ship the replacement once it arrives.", href: "/services/exchange" },
  { icon: Truck, color: "#14B8A6", t: "Pickup and on-site service", d: "Book a pickup with FedEx, Purolator, UPS or DHL, or have a technician come to your facility in Canada or the USA.", href: "/request-pickup" },
  { icon: Cable, color: "#EC4899", t: "Custom cables", d: "Feedback, power and spare critical cables built to match your drive and motor.", href: "/services/custom-cables" },
  { icon: FileSearch, color: "#A855F7", t: "Fault code library", d: "Plain-English guides to drive and CNC alarms, written by repair technicians.", href: "/fault-codes" },
];

const process = [
  { icon: Truck, t: "Ship it or request a pickup", d: "Any carrier, or we arrange a pickup from your facility." },
  { icon: ClipboardCheck, t: "Check-in and condition report", d: "Every unit is logged with photos the day it arrives." },
  { icon: Search, t: "Free evaluation and written quote", d: "We find the root cause, then quote. No work starts without your approval." },
  { icon: CircuitBoard, t: "Component-level repair", d: "Your original unit is repaired at board and component level." },
  { icon: Gauge, t: "Operational testing", d: "Run under power on our own test jigs before it leaves the bench." },
  { icon: ShieldCheck, t: "Return with test report", d: "Packed securely, shipped back and covered by a 12-month warranty." },
];

const values = [
  { icon: ShieldCheck, color: "#3B82F6", t: "Ownership", d: "We treat every unit as if it came off our own line. If it is on our bench, it is our problem until it runs." },
  { icon: Handshake, color: "#22C55E", t: "Honesty", d: "Free evaluation, a written quote and your approval before any work. The price you approve is the price you pay." },
  { icon: Zap, color: "#F59E0B", t: "Urgency", d: "A stopped line costs money every hour. We move fast and tell you where your repair stands." },
  { icon: Gauge, color: "#06B6D4", t: "Quality", d: "Tested, not just fixed: drives run a motor, motors run under drive control, and every repair ships with a test report." },
  { icon: Recycle, color: "#14B8A6", t: "Repair first", d: "Repairing proven equipment keeps machines running longer and keeps good hardware out of the scrap bin." },
  { icon: Lightbulb, color: "#A855F7", t: "Always learning", d: "Every brand, current or obsolete. We keep learning new platforms so we can repair what others replace." },
];

export default async function AboutPage() {
  const contact = await getContact();
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        url: `${SITE_URL}/about`,
        name: "About AutomIQ Automation & Drive Services",
        mainEntity: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "AutomIQ Automation & Drive Services",
        url: SITE_URL,
        logo: `${SITE_URL}/automiq-logo-v2.png`,
        description: "Industrial electronics repair: servo drives, motors, CNC controls, PLCs and HMIs, plus new and refurbished automation parts.",
        address: postalAddress, geo, openingHoursSpecification: openingHours,
        areaServed: [{ "@type": "Country", name: "Canada" }, { "@type": "Country", name: "United States" }],
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
    <main className={`${montserrat.className} min-h-screen bg-[#F4F7FB] text-[#0B1A3C]`}>
      <PageExtras path="/about" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <Header />

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-[#050B18] pb-28 pt-8 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-120 w-160 rounded-full bg-[radial-gradient(closest-side,rgba(0,102,255,0.5),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-90 w-115 rounded-full bg-[radial-gradient(closest-side,rgba(0,176,255,0.22),transparent)] blur-2xl" />
        <div className="relative mx-auto max-w-310 px-5 sm:px-8">
          <nav aria-label="Breadcrumb"><ol className="flex items-center gap-1.5 text-[12.5px] text-white/60"><li><Link href="/" className="hover:text-white">Home</Link></li><li aria-hidden="true"><ChevronRight size={13} /></li><li className="text-white/85" aria-current="page">About</li></ol></nav>
          <div className="mt-6 max-w-205">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7FD3FF]"><span className="h-0.5 w-8 rounded bg-[#00B0FF]" aria-hidden="true" />About AutomIQ</p>
            <h1 className="mt-3 text-[36px] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[54px]">
              When the line stops, <span className="bg-linear-to-r from-[#7FD3FF] to-[#00B0FF] bg-clip-text text-transparent">we start.</span>
            </h1>
            <p className="mt-4 text-[15.5px] leading-[1.75] text-white/75 sm:text-[18px]">
              AutomIQ Automation & Drive Services repairs the drives, motors and controls that keep production running. From our repair centre in Mississauga, Ontario, we serve manufacturers across Canada and the USA, with more than 20 years of hands-on experience behind every repair.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/request-repair" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#0066FF] to-[#00B0FF] px-6 text-[15px] font-semibold shadow-[0_14px_30px_-14px_rgba(0,176,255,0.9)] transition hover:-translate-y-0.5"><Wrench size={17} aria-hidden="true" /> Request a Repair</Link>
              <Link href="/services" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-6 text-[15px] font-semibold hover:bg-white/10">Our repair services <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto -mt-16 max-w-310 space-y-14 px-5 pb-16 sm:px-8">
        {/* ---------- Stats ---------- */}
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <li key={s.l} className="rounded-[20px] border border-[#E3EAF3] bg-white px-3 py-5 text-center shadow-[0_25px_50px_-35px_rgba(11,26,60,0.6)] sm:p-6">
              <p className="whitespace-nowrap text-[clamp(20px,6.2vw,28px)] font-extrabold leading-none text-[#005AE0] sm:text-[38px]"><StatCounter value={s.value} to={s.to} suffix={s.suffix} /></p>
              <p className="mt-2 text-[12.5px] font-semibold text-[#4A5B76] sm:text-[14px]">{s.l}</p>
            </li>
          ))}
        </ul>

        {/* ---------- Story ---------- */}
        <section aria-labelledby="story" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <div className="rounded-[26px] border border-[#E3EAF3] bg-white p-6 sm:p-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#005AE0]">Who we are</p>
            <h2 id="story" className="mt-2 text-[26px] font-extrabold leading-tight sm:text-[34px]">Repair specialists for industrial automation</h2>
            <div className="mt-4 space-y-4 text-[15px] leading-[1.8] text-[#4A5B76] sm:text-[16px]">
              <p>A failed servo drive or CNC control can stop a whole line, and a replacement from the manufacturer can take weeks, if it is still made at all. Our work is to get that equipment back in service: repaired at component level, tested under real operating conditions and returned with a warranty.</p>
              <p>We work on servo drives, VFDs, servo and spindle motors, encoders, CNC controls, PLCs, HMIs, power supplies and circuit boards from Siemens, Rexroth Indramat, Allen-Bradley, Fanuc, Yaskawa and equipment from more than 1,000 brands, current and obsolete.</p>
              <p>Alongside repair, we supply new and refurbished automation parts and exchange units, so you can choose the fastest way back to production.</p>
            </div>
          </div>
          <div className="relative flex flex-col overflow-hidden rounded-[26px] bg-[#050B18] p-6 text-white sm:p-9">
            <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(0,102,255,0.6),transparent)] blur-xl" />
            <p className="relative text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7FD3FF]">Our promise</p>
            <ul className="relative mt-5 space-y-4">
              {["Free evaluation on every repair", "Written quote before any work starts", "24–72 hr typical turnaround once approved", "Operational testing on our own jigs", "Test report with every unit", "12-month warranty on repairs"].map((t) => (
                <li key={t} className="flex gap-3 text-[15px] text-white/85"><BadgeCheck size={20} className="mt-0.5 flex-none text-[#38BDF8]" aria-hidden="true" />{t}</li>
              ))}
            </ul>
            <p className="relative mt-6 flex items-center gap-2 border-t border-white/10 pt-5 text-[13.5px] text-white/65"><MapPin size={16} className="flex-none text-[#7FD3FF]" aria-hidden="true" /> <span><a href={directionsUrl} target="_blank" rel="noopener" className="underline-offset-2 hover:text-white hover:underline">{place.address}</a> · serving Canada &amp; USA</span></p>
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
            { k: "Our mission", t: "Keep production running", d: "Repair industrial electronics properly, test them like they will be used, and return them fast, so our customers lose as little production as possible.", color: "#0066FF" },
            { k: "Our vision", t: "Repair first, everywhere", d: "Be the first call for manufacturers across Canada and the USA when a drive, motor or control fails, whatever the brand and however old the machine.", color: "#00B0FF" },
          ].map((m) => (
            <div key={m.k} className="relative overflow-hidden rounded-[24px] border border-[#E3EAF3] bg-white p-6 sm:p-8">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${m.color}, transparent)` }} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: m.color === "#00B0FF" ? "#007ACC" : "#005AE0" }}>{m.k}</p>
              <h3 className="mt-2 text-[22px] font-extrabold sm:text-[26px]">{m.t}</h3>
              <p className="mt-2 text-[15px] leading-[1.7] text-[#4A5B76]">{m.d}</p>
            </div>
          ))}
        </section>

        {/* ---------- What we do ---------- */}
        <section aria-labelledby="do">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#005AE0]"><span className="h-0.5 w-8 rounded bg-[#0066FF]" aria-hidden="true" />What we do</p>
          <h2 id="do" className="mt-2 text-[26px] font-extrabold leading-tight sm:text-[34px]">One team for repair, parts and service</h2>
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {offer.map(({ icon: Icon, color, t, d, href }) => (
              <li key={t}>
                <Link href={href} className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-white/10 p-5 text-white shadow-[0_22px_44px_-24px_rgba(0,20,60,0.8)] transition hover:-translate-y-1 sm:p-6" style={{ background: `linear-gradient(155deg, #0B1020 0%, #121a33 50%, ${color}40 100%)` }}>
                  <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-xl transition group-hover:scale-125" style={{ background: `radial-gradient(closest-side, ${color}77, transparent)` }} />
                  <div className="relative flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-white/15" style={{ background: `linear-gradient(145deg, ${color}40, #0B1A3C)`, boxShadow: `0 10px 26px -12px ${color}` }}><Icon size={22} style={{ color }} aria-hidden="true" /></span>
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
        <section aria-labelledby="how" className="rounded-[26px] border border-[#E3EAF3] bg-white p-6 sm:p-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#005AE0]">How we work</p>
          <h2 id="how" className="mt-2 text-[26px] font-extrabold leading-tight sm:text-[34px]">Every repair, the same six steps</h2>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {process.map(({ icon: Icon, t, d }, i) => (
              <li key={t} className="relative rounded-2xl bg-[#F4F7FB] p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[#0066FF] to-[#00B0FF] text-white"><Icon size={18} aria-hidden="true" /></span>
                  <span className="text-[12px] font-bold tracking-[0.18em] text-[#5B6B84]">STEP {String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-3 text-[16px] font-extrabold">{t}</h3>
                <p className="mt-1 text-[14px] leading-[1.6] text-[#4A5B76]">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Repair centre ---------- */}
        <section aria-labelledby="bench" className="relative overflow-hidden rounded-[26px] bg-[#050B18] p-6 text-white sm:p-9">
          <span aria-hidden="true" className="pointer-events-none absolute -left-20 -bottom-24 h-80 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(0,176,255,0.35),transparent)] blur-xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7FD3FF]">Our repair centre</p>
              <h2 id="bench" className="mt-2 text-[26px] font-extrabold leading-tight sm:text-[34px]">Tested the way it will be used</h2>
              <p className="mt-3 text-[15px] leading-[1.75] text-white/70">Every unit is repaired and tested at our Mississauga, Ontario repair centre. A drive that only powers up on the bench is not finished. It has to run a motor under load before it ships.</p>
            </div>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {[
                { t: "Drives tested with a motor", d: "Run under power on our own test jigs." },
                { t: "Motors under drive control", d: "Checked the way your machine runs them." },
                { t: "Encoder alignment checked", d: "So the motor commutates correctly when installed." },
                { t: "Test report with every unit", d: "What we found, what we replaced, how it tested." },
              ].map((x) => (
                <li key={x.t} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="flex items-center gap-2 text-[14.5px] font-bold"><BadgeCheck size={17} className="text-[#38BDF8]" aria-hidden="true" />{x.t}</p>
                  <p className="mt-1 pl-6 text-[13px] text-white/65">{x.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Core values ---------- */}
        <section aria-labelledby="values">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#005AE0]"><span className="h-0.5 w-8 rounded bg-[#0066FF]" aria-hidden="true" />Core values</p>
          <h2 id="values" className="mt-2 text-[26px] font-extrabold leading-tight sm:text-[34px]">What we stand for</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {values.map(({ icon: Icon, color, t, d }) => (
              <li key={t} className="group relative overflow-hidden rounded-[22px] border border-[#E3EAF3] bg-white p-5 transition hover:-translate-y-1 hover:shadow-[0_25px_50px_-35px_rgba(11,26,60,0.6)] sm:p-6">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
                <span aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-60 blur-2xl transition group-hover:opacity-100" style={{ background: `radial-gradient(closest-side, ${color}40, transparent)` }} />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${color}18`, boxShadow: `inset 0 0 0 1px ${color}30` }}>
                  <Icon size={22} style={{ color }} aria-hidden="true" />
                </span>
                <h3 className="relative mt-4 text-[18px] font-extrabold">{t}</h3>
                <p className="relative mt-1.5 text-[14.5px] leading-[1.65] text-[#4A5B76]">{d}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Coverage ---------- */}
        <section aria-labelledby="coverage" className="grid gap-3 sm:grid-cols-3">
          <h2 id="coverage" className="sr-only">Brands, industries and fault codes</h2>
          {[
            { icon: Cpu, n: brands.length, sfx: "+", l: "Brand pages", d: "And equipment from 1,000+ brands", href: "/brands", color: "#3B82F6" },
            { icon: Building2, n: industries.length, sfx: "", l: "Industries served", d: "From automotive to water treatment", href: "/industries", color: "#22C55E" },
            { icon: FileSearch, n: totalCodes, sfx: "", l: "Fault codes explained", d: "Free guides from our technicians", href: "/fault-codes", color: "#A855F7" },
          ].map(({ icon: Icon, n, sfx, l, d, href, color }) => (
            <Link key={l} href={href} className="group flex items-center gap-4 rounded-[22px] border border-[#E3EAF3] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#0066FF]/40">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl" style={{ background: `${color}18` }}><Icon size={22} style={{ color }} aria-hidden="true" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[24px] font-extrabold leading-none"><StatCounter value={n} suffix={sfx} /></span>
                <span className="mt-1 block text-[14px] font-bold">{l}</span>
                <span className="block text-[12.5px] text-[#5B6B84]">{d}</span>
              </span>
              <ArrowUpRight size={18} className="flex-none text-[#005AE0]" aria-hidden="true" />
            </Link>
          ))}
        </section>

        {/* ---------- CTA ---------- */}
        <section aria-labelledby="cta" className="relative overflow-hidden rounded-[28px] bg-[#050B18] p-7 text-white sm:p-10">
          <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(0,102,255,0.6),transparent)] blur-xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 id="cta" className="text-[28px] font-extrabold leading-tight sm:text-[38px]">Machine down? <span className="bg-linear-to-r from-[#7FD3FF] to-[#00B0FF] bg-clip-text text-transparent">Let&apos;s get it running.</span></h2>
              <p className="mt-2 max-w-160 text-[15px] leading-[1.7] text-white/70">Send the part number or ship the unit. Evaluation is free, and you approve the quote before we start.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/request-repair" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#0066FF] to-[#00B0FF] px-6 text-[15px] font-semibold"><Wrench size={17} aria-hidden="true" /> Request a Repair</Link>
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
