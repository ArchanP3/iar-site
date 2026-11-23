import Image from "next/image";
import WhatsAppButton from "@/components/WhatsAppButton";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, ChevronRight, Clock, History, MapPin, ShieldCheck, Wrench, Zap } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { brandFont } from "@/lib/font";
import { allServices, serviceUrl, services } from "@/lib/services";
import MoreServices from "@/components/services/MoreServices";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/services", {
  title: "Industrial Repair Services | Servo, VFD, PLC & CNC | AutomIQ",
  description:
    "Servo drive, VFD, servo motor, encoder, PLC, HMI, CNC and power supply repair in Mississauga. Free evaluation, 12-month warranty. Canada & USA.",
});

const why = [
  { t: "Component-level repair", d: "We replace the failed parts, not the whole board, so the price stays a fraction of new.", I: Wrench },
  { t: "24–72 hr typical turnaround", d: "Once you approve the quote. Exchange units usually ship within 1–2 business days of receiving your unit.", I: Clock },
  { t: "Tested on our own jigs", d: "Drives run with a motor, motors run under drive control. A test report ships with every unit.", I: ShieldCheck },
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
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-115 w-155 rounded-full bg-[radial-gradient(closest-side,rgba(200, 16, 46,0.5),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-95 w-120 rounded-full bg-[radial-gradient(closest-side,rgba(255, 59, 85,0.32),transparent)] blur-2xl" />
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
                Industrial <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">Repair Services</span>
              </h1>
              <p className="mt-3 text-[15px] leading-[1.7] text-white/75 sm:text-[17px]">
                Component-level repair of servo drives, VFDs, servo and spindle motors, encoders, PLCs, HMIs, CNC controls, power supplies, circuit boards and robotics, at our Mississauga, Ontario repair centre for manufacturers across Canada and the USA.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/request-repair" className="inline-flex h-12 items-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-6 text-[15px] font-semibold shadow-[0_14px_30px_-14px_rgba(255, 59, 85,0.9)] transition hover:-translate-y-0.5"><Wrench size={17} aria-hidden="true" /> Request a Repair</Link>
              <Link href="/on-site-service" className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/6 px-6 text-[15px] font-semibold transition hover:border-white/40"><MapPin size={17} aria-hidden="true" /> Book On-Site Service</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto -mt-20 max-w-310 space-y-14 px-5 pb-16 sm:px-8">
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {services.map((s) => (
            <li key={s.slug} className="relative">
              <Link href={serviceUrl(s.slug)} className="group relative flex h-full flex-col overflow-hidden rounded-[18px] border border-white/10 p-3.5 pb-15 text-white sm:pb-17 shadow-[0_22px_44px_-24px_rgba(28, 28, 32,0.8)] transition hover:-translate-y-1 sm:rounded-[22px] sm:p-5" style={{ background: `linear-gradient(155deg, #0F0F10 0%, #1A1A1E 50%, ${s.color}40 100%)` }}>
                <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-xl transition group-hover:scale-125" style={{ background: `radial-gradient(closest-side, ${s.color}77, transparent)` }} />
                <span className="relative flex items-start justify-between">
                  <span className="relative flex h-21 w-21 items-center justify-center rounded-2xl bg-white/6 ring-1 ring-white/15 sm:h-26 sm:w-26">
                    <span aria-hidden="true" className="absolute inset-2 rounded-full blur-lg" style={{ background: `radial-gradient(closest-side, ${s.color}66, transparent)` }} />
                    <Image src={s.icon} alt={`${s.title} at AutomIQ Automation & Drive Services`} width={180} height={180} className="relative h-17.5 w-auto object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.6)] transition duration-500 group-hover:scale-110 sm:h-22" />
                  </span>
                  <ArrowUpRight size={18} style={{ color: s.color }} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
                <h2 className="relative mt-3 min-h-[2lh] text-[15px] font-extrabold leading-snug sm:mt-4 sm:text-[19px]">{s.title}</h2>
                <p className="relative mt-1 hidden min-h-[3lh] text-[13px] leading-[1.55] text-white/70 sm:block">{s.short}</p>
                {/* footer: tag on the left, WhatsApp (outside the link) on the right, same line on every card */}
                <span className="absolute bottom-3.5 left-3.5 flex h-9 items-center sm:bottom-5 sm:left-5">
                  {s.slug === "exchange" ? (
                    <span className="rounded-full bg-amber-400 px-1.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.04em] text-[#3D2F0A] sm:px-2.5 sm:text-[10px] sm:tracking-[0.14em]">Line down?</span>
                  ) : (
                    <span className="rounded-full bg-[#0A0A0C]/55 px-2 py-1 ring-1 ring-white/10 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#FF8A99] sm:px-2.5 sm:text-[10px] sm:tracking-[0.14em]">Core<span className="max-sm:hidden"> service</span></span>
                  )}
                </span>
              </Link>
              <WhatsAppButton tone="dark" size="sm" topic={s.title} kind="service" url={serviceUrl(s.slug)} label={`Ask about ${s.title} on WhatsApp`} className="absolute right-3.5 bottom-3.5 sm:right-5 sm:bottom-5" />
            </li>
          ))}
        </ul>

        <MoreServices />

        <section aria-labelledby="why" className="relative overflow-hidden rounded-[28px] bg-[#0A0A0C] p-6 text-white sm:p-10">
          <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(200, 16, 46,0.55),transparent)] blur-xl" />
          <div className="relative">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#FF8A99]"><span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#C8102E] to-[#FF3B55]" />Why repair with AutomIQ</p>
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
              <p className="mt-1.5 text-[14.5px] text-white/85">We repair equipment from 1,000+ brands. Send the part number and we&apos;ll tell you what we can do.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/request-repair?service=question" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-[#131316] transition hover:-translate-y-0.5"><BadgeCheck size={17} aria-hidden="true" /> Ask a Technician</Link>
              <Link href="/request-repair?service=exchange" className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/40 px-6 text-[15px] font-semibold transition hover:bg-white/10"><Zap size={17} aria-hidden="true" /> Get an Exchange Unit</Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
