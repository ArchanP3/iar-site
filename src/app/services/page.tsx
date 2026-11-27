import Image from "next/image";
import { WhatsAppCta } from "@/components/WhatsAppButton";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, ChevronRight, Clock, History, MapPin, ShieldCheck, Wrench, Zap } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { brandFont } from "@/lib/font";
import { allServices, serviceUrl, services } from "@/lib/services";
import MoreServices from "@/components/services/MoreServices";
import { ProcessPlates } from "@/components/iar/ProcessSection";

/** Card headings on this hub that carry a search phrase (cards elsewhere keep the short title) */
const hubTitle: Record<string, string> = { "vfd-repair": "VFD & AC Drive Repair", "cnc-repair": "CNC Machine Electronics Repair" };
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/services", {
  title: "Industrial Repair Services | Servo, Drive & PLC Repair | IAR",
  description:
    "Servo motor, servo drive, VFD, PLC, HMI and CNC control repair for US plants. Send your part number for a free evaluation and a written quote.",
});

const whatWeRepair: { t: string; href: string; p?: string; points: string[] }[] = [
  { t: "Servo Motor Repair", href: "/services/servo-motor-repair", points: [
    "CNC servo motor repair, stepper motor repair and integrated servo motor repair",
    "Servo motor bearing replacement, servo motor brake repair and industrial motor winding repair",
    "Encoder repair, encoder alignment service and resolver repair",
    "Finished with servo motor testing under load.",
  ] },
  { t: "Servo Drive Repair", href: "/services/servo-drive-repair", points: [
    "AC servo drive repair for current platforms and DC servo drive repair for legacy machines",
    "Line module repair and servo motor controller repair",
    "Power-section, logic-board and feedback faults, with a drive parameter backup before work starts",
    "Every drive tested on a motor under load.",
  ] },
  { t: "VFD & DC Drives", href: "/services/vfd-repair", p: "Our VFD repair service covers AC drive repair and variable frequency drives, along with analog and digital DC drive repair.", points: [] },
  { t: "Industrial Electronics", href: "/services/plc-repair", points: [
    "PLC repair service and PLC module repair · Touch screen repair and operator panel repair",
    "CNC control repair and CNC machine electronics repair",
    "PCB repair: industrial circuit board repair, printed circuit board repair and circuit board refurbishing",
  ] },
];

const why = [
  { t: "Component-level repair", d: "We replace the failed parts, not the whole board, so the price stays a fraction of new.", I: Wrench },
  { t: "24–72 hr typical turnaround", d: "Once you approve the quote. Exchange units usually ship within 1–2 business days of receiving your unit.", I: Clock },
  { t: "Load tested on OEM-standard equipment", d: "Drives run with a motor, motors run under drive control. A test report ships with every unit.", I: ShieldCheck },
  { t: "Legacy & discontinued", d: "Proven machines keep running after the manufacturer stops support.", I: History },
];

export default function ServicesPage() {
  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Industrial repair services",
    itemListElement: allServices.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.title, url: serviceUrl(s.slug) })),
  };
  return (
    <main className={`${brandFont.className} min-h-screen bg-[#F7F7F8] text-[#131316]`}>
      <PageExtras path="/services" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }} />
      <Header />

      <section className="relative overflow-hidden bg-[#0A0A0C] pb-28 pt-8 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-115 w-155 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.5),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-95 w-120 rounded-full bg-[radial-gradient(closest-side,rgba(255,59,85,0.32),transparent)] blur-2xl" />
        <div className="relative mx-auto max-w-310 px-5 sm:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-[12.5px] text-white/60">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true"><ChevronRight size={13} /></li>
              <li className="text-white/85">Repair Services</li>
            </ol>
          </nav>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-190">
              <h1 className="text-[34px] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[48px]">
                Servo Motor Repair Service &amp; <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">Industrial Electronics Repair</span>
              </h1>
              <p className="mt-3 text-[15px] leading-[1.7] text-white/75 sm:text-[17px]">
                IAR provides industrial repair services across the USA for plants that run on motion control. As experienced servo motor rebuilders, our technicians repair, rebuild and test servo motors, servo drives and industrial electronics at the component level, returning them to OEM specification — a complete servo motor repair service under one roof. Every job follows our documented inspection, repair and testing process, with a test report for every unit. We repair factory automation equipment of every kind: motion control, industrial control systems, CNC machine electronics and integrated servo motors.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/request-repair" className="inline-flex h-12 items-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-6 text-[15px] font-semibold shadow-[0_14px_30px_-14px_rgba(255,59,85,0.9)] transition hover:-translate-y-0.5"><Wrench size={17} aria-hidden="true" /> Request a Repair</Link>
              <Link href="/on-site-service" className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/6 px-6 text-[15px] font-semibold transition hover:border-white/40"><MapPin size={17} aria-hidden="true" /> Book On-Site Service</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto -mt-20 max-w-310 space-y-14 px-5 pb-16 sm:px-8">
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {services.map((s) => (
            <li key={s.slug} className="relative">
              <Link href={serviceUrl(s.slug)} className="hexcard group relative flex h-full flex-col overflow-hidden rounded-[18px] border border-white/10 p-3.5 pb-15 text-white sm:pb-17 shadow-[0_22px_44px_-24px_rgba(28,28,32,0.8)] transition hover:-translate-y-1 sm:rounded-[22px] sm:p-5">
                <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-xl transition group-hover:scale-125" style={{ background: `radial-gradient(closest-side, #C8102E77, transparent)` }} />
                <span className="relative flex items-start justify-between">
                  <span className="relative flex h-21 w-21 items-center justify-center rounded-2xl bg-white/6 ring-1 ring-white/15 sm:h-26 sm:w-26">
                    <span aria-hidden="true" className="absolute inset-2 rounded-full blur-lg" style={{ background: `radial-gradient(closest-side, #C8102E66, transparent)` }} />
                    <Image src={s.icon} alt={`${s.title} at Industrial Automation Repair Inc.`} width={180} height={180} className="relative h-17.5 w-auto object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.6)] transition duration-500 group-hover:scale-110 sm:h-22" />
                  </span>
                  <ArrowUpRight size={18} className="text-[#FF5A6E] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
                <h2 className="relative mt-3 min-h-[2lh] text-[15px] font-extrabold leading-snug sm:mt-4 sm:text-[19px]">{hubTitle[s.slug] ?? s.title}</h2>
                <p className="relative mt-1 hidden min-h-[3lh] text-[13px] leading-[1.55] text-white/70 sm:block">{s.short}</p>
                {/* footer: tag on the left */}
                <span className="absolute bottom-3.5 left-3.5 flex h-9 items-center sm:bottom-5 sm:left-5">
                  {s.slug === "exchange" ? (
                    <span className="rounded-full bg-[#C8102E] px-1.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.04em] text-white sm:px-2.5 sm:text-[10px] sm:tracking-[0.14em]">Line down?</span>
                  ) : (
                    <span className="rounded-full bg-[#0A0A0C]/55 px-2 py-1 ring-1 ring-white/10 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#FF8A99] sm:px-2.5 sm:text-[10px] sm:tracking-[0.14em]">Core<span className="max-sm:hidden"> service</span></span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <MoreServices />

        <section aria-labelledby="what-we-repair" className="mb-8">
          <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#B30E29]">Repair Built Around Your Uptime</p>
          <h2 id="what-we-repair" className="mt-2 text-[26px] font-extrabold leading-tight sm:text-[32px]">What we repair</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {whatWeRepair.map((c) => (
              <div key={c.t} className="rounded-[22px] border border-[#EAEAEC] bg-white p-5 shadow-[0_24px_50px_-40px_rgba(19,19,22,0.5)] sm:p-6">
                <Link href={c.href} className="text-[18px] font-extrabold hover:text-[#B30E29]">{c.t}</Link>
                {c.p && <p className="mt-2 text-[14.5px] leading-[1.65] text-[#4A4A55]">{c.p}</p>}
                {c.points.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {c.points.map((p) => <li key={p} className="flex items-start gap-2 text-[14.5px] leading-snug text-[#4A4A55]"><BadgeCheck size={16} className="mt-0.5 flex-none text-[#C8102E]" aria-hidden="true" />{p}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-[22px] border border-[#EAEAEC] bg-white p-5 sm:p-6">
              <p className="text-[18px] font-extrabold">Brands we repair</p>
              <ul className="mt-2 space-y-2 text-[14.5px] leading-[1.6] text-[#4A4A55]">
                <li><b className="text-[#131316]">Core platforms</b> — <Link href="/brands/siemens" className="font-semibold text-[#A50D25] hover:underline">Siemens</Link>: 1FT/1FK servo motors, 1PH spindle motors, SINAMICS and SIMODRIVE drives, SINUMERIK controls · <Link href="/brands/rexroth-indramat" className="font-semibold text-[#A50D25] hover:underline">Bosch Rexroth Indramat</Link>: MKD/MHD motors, DKC/DDS drives, IndraDrive · <Link href="/brands/allen-bradley" className="font-semibold text-[#A50D25] hover:underline">Allen-Bradley</Link>: MPL/1326 motors, Kinetix and 1394 drives</li>
                <li><b className="text-[#131316]">Robotics &amp; CNC</b> — FANUC · ABB · Yaskawa · KUKA</li>
                <li><b className="text-[#131316]">Factory automation</b> — Mitsubishi · Panasonic · Omron · Schneider Electric</li>
                <li><b className="text-[#131316]">Motors &amp; drives</b> — Baldor · Parker · SEW-Eurodrive · Lenze · Control Techniques · Kollmorgen · Moog · <Link href="/brands" className="font-semibold text-[#A50D25] hover:underline">all brands</Link></li>
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <div className="rounded-[22px] border border-[#EAEAEC] bg-white p-5 sm:p-6">
                <p className="text-[18px] font-extrabold">Fast &amp; affordable</p>
                <p className="mt-2 text-[14.5px] leading-[1.65] text-[#4A4A55]">Fast repair without shortcuts, and an affordable alternative to new hardware — often the only route for discontinued units. Our 24/7 servo motor repair line is 1-877-904-6155.</p>
              </div>
              <div className="rounded-[22px] border border-[#EAEAEC] bg-white p-5 sm:p-6">
                <p className="text-[18px] font-extrabold">On-site &amp; pickup</p>
                <p className="mt-2 text-[14.5px] leading-[1.65] text-[#4A4A55]">Need a technician at the machine? Our <Link href="/on-site-service" className="font-semibold text-[#A50D25] hover:underline">on-site industrial repair</Link> service covers plants across the USA. Prefer to send it in? <Link href="/request-pickup" className="font-semibold text-[#A50D25] hover:underline">Book a pickup</Link> and we collect it from your dock.</p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="process" className="mb-8">
          <h2 id="process" className="text-[26px] font-extrabold leading-tight sm:text-[32px]">Your Repair, Step by Step</h2>
          <div className="mt-5"><ProcessPlates /></div>
        </section>

        <section aria-labelledby="why" className="relative overflow-hidden rounded-[28px] bg-[#0A0A0C] p-6 text-white sm:p-10">
          <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.55),transparent)] blur-xl" />
          <div className="relative">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#FF8A99]"><span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#C8102E] to-[#FF3B55]" />Why repair with IAR</p>
            <h2 id="why" className="mt-3 max-w-180 text-[26px] font-extrabold leading-tight sm:text-[34px]">What component-level repair means for your line</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {why.map(({ t, d, I }) => (
                <li key={t} className="rounded-2xl border border-white/12 bg-white/6 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  <I size={20} className="text-[#FF8A99]" aria-hidden="true" />
                  <h3 className="mt-3 text-[15.5px] font-bold">{t}</h3>
                  <p className="mt-1 text-[13px] leading-[1.6] text-white/65">{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#DA0B2A_0%,#C8102E_45%,#FF3B55_100%)] p-7 text-white sm:p-10">
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[26px] font-extrabold leading-tight sm:text-[32px]">Don&apos;t see your equipment?</h2>
              <p className="mt-1.5 text-[14.5px] text-white/85">Request a repair quote: call 1-877-904-6155 or email info@industrialautomationrepair.com with the manufacturer, part number and fault description.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/request-repair?service=question" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-[#131316] transition hover:-translate-y-0.5"><BadgeCheck size={17} aria-hidden="true" /> Ask a Technician</Link>
              <Link href="/request-repair?service=exchange" className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/40 px-6 text-[15px] font-semibold transition hover:bg-white/10"><Zap size={17} aria-hidden="true" /> Get an Exchange Unit</Link>
              <WhatsAppCta topic="A question from the Repair Services page" kind="service" label="Ask on WhatsApp" />
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
