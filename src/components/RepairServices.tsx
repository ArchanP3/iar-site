"use client";

import Image from "next/image";
import Link from "next/link";
import { chipHref } from "@/lib/services";
import { montserrat } from "@/lib/font";
import { ArrowRight, ArrowUpRight, MapPin, PackageCheck, Wrench } from "lucide-react";
import BrandsRepairPanel, { repairBrands } from "./BrandsRepairPanel";
import SlidingTabs from "./home/SlidingTabs";
import { moveSpotlight } from "./home/spotlight";
import "./home/homeSections.css";
import { useState } from "react";


/* ------------------------------------------------------------------ */
/*  Edit the 12 cards here.                                            */
/*  When your own icons are ready, put them in public/services/ and    */
/*  change each `icon` to e.g. "/services/servo-drive.webp".            */
/* ------------------------------------------------------------------ */
const services = [
  {
    title: "Servo Drive Repair",
    text: "Power stage, control board and feedback repair for servo drives and amplifiers.",
    href: "/services/servo-drive-repair",
    icon: "/services/servo-drive.webp",
  },
  {
    title: "VFD & AC/DC Drive Repair",
    text: "Variable frequency drive repair for AC and DC drives, including PowerFlex, ACS and Altivar.",
    href: "/services/vfd-repair",
    icon: "/services/vfd-drive.webp",
  },
  {
    title: "Servo Motor Repair",
    text: "Bearings, seals, brakes, windings and complete rebuilds, with encoder alignment on every motor.",
    href: "/services/servo-motor-repair",
    icon: "/services/servo-motor.webp",
  },
  {
    title: "Spindle, AC & DC Motor Repair",
    text: "Spindle motor, AC induction and DC motor repair, rewinding and reconditioning.",
    href: "/services/industrial-motor-repair",
    icon: "/services/spindle-ac-dc-motor.webp",
  },
  {
    title: "Encoder Repair & Alignment",
    text: "Encoder repair, resolver repair and alignment to the motor's commutation offset.",
    href: "/services/encoder-repair",
    icon: "/services/encoder.webp",
  },
  {
    title: "PLC Repair",
    text: "PLC repair service for CPUs, I/O and communication modules.",
    href: "/services/plc-repair",
    icon: "/services/plc.webp",
  },
  {
    title: "HMI Repair",
    text: "HMI repair for touchscreens, displays, backlights and boards.",
    href: "/services/hmi-repair",
    icon: "/services/hmi.webp",
  },
  {
    title: "CNC Control Repair",
    text: "CNC control repair, spindle drives, boards and operator panels for machine tools.",
    href: "/services/cnc-repair",
    icon: "/services/cnc-control.webp",
  },
  {
    title: "Power Supply Repair",
    text: "Industrial power supply repair and load testing, including drive line modules.",
    href: "/services/power-supply-repair",
    icon: "/services/power-supply.webp",
  },
  {
    title: "Controller Card & PCB Repair",
    text: "Component-level repair of controller cards, I/O boards and machine circuit boards.",
    href: "/services/controller-card-repair",
    icon: "/services/controller-card-pcb.webp",
  },
  {
    title: "Robotics Repair",
    text: "Robot controllers, teach pendants and robot servo motor repair.",
    href: "/services/robotics-repair",
    icon: "/services/robotics.webp",
  },
  {
    title: "Exchange Program",
    text: "A tested replacement from stock while yours is repaired — the fastest route back online.",
    href: "/services/exchange",
    icon: "/services/exchange.webp",
  },
];


/* Scrolling rows — more repair work we do (edit freely) */
const repairsRow1 = [
  "Motor Rewinding", "Resolver Repair", "Pump Motor Repair", "Gearbox Repair", "Gear Reducer Rebuild",
  "Bearing Replacement", "Shaft Repair", "Shaft Seal Replacement", "Precision Machining", "Brake Repair",
  "Brake Coil Replacement", "Linear Motor Repair", "Stepper Motor Repair", "Fan Motor Repair", "Blower Motor Repair",
  "Hydraulic Pump Repair", "Vacuum Pump Repair", "Dynamic Balancing", "Vibration Analysis", "Motor Load Testing",
  "Winding Insulation Testing", "Rotor Repair", "Armature Repair", "Commutator Resurfacing",
  "Power Connector Repair", "Feedback Connector Repair", "Feedback Cable Repair", "Power Cable Repair",
];
const repairsRow2 = [
  "Spindle Amplifier Repair", "Servo Amplifier Repair", "Line Module Repair", "DC Bus Module Repair", "Regen Unit Repair",
  "Soft Starter Repair", "IGBT Module Replacement", "I/O Module Repair", "CPU Module Repair", "Fieldbus Card Repair",
  "Encoder Interface Card Repair", "Touchscreen Replacement", "LCD and Backlight Repair", "Membrane Keypad Repair",
  "Operator Panel Repair", "Teach Pendant Repair", "Robot Servo Motor Repair", "PCB Component Replacement",
  "Capacitor Replacement", "Cooling Fan Replacement", "Backup Battery Replacement", "Motion Controller Repair",
  "Network Card Repair", "Industrial PC Repair", "Firmware and Parameter Backup",
];

const marqueeCss = `
.aq-rmarquee { position: relative; overflow: hidden; content-visibility: auto; contain-intrinsic-size: auto 52px; }
.aq-rmarquee::before, .aq-rmarquee::after { content: ""; position: absolute; top: 0; bottom: 0; width: 8%; z-index: 1; pointer-events: none; }
.aq-rmarquee::before { left: 0; background: linear-gradient(90deg, var(--fade-bg, #fff), transparent); }
.aq-rmarquee::after { right: 0; background: linear-gradient(270deg, var(--fade-bg, #fff), transparent); }
.aq-rmarquee__track { display: flex; width: max-content; gap: 10px; animation: aq-rmarqueeMove 150s linear infinite; will-change: transform; }
.aq-rmarquee--reverse .aq-rmarquee__track { animation-direction: reverse; animation-duration: 170s; }
.aq-rmarquee:hover .aq-rmarquee__track { animation-play-state: paused; }
@keyframes aq-rmarqueeMove { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { .aq-rmarquee__track { animation: none; } }
`;

function RepairMarquee({ words, reverse = false, dark = false }: { words: string[]; reverse?: boolean; dark?: boolean }) {
  const chip = dark
    ? "border-[#0B1A3C]/10 bg-white text-[#0B1A3C] font-bold"
    : "border-[#0066FF]/15 bg-[#F4F7FB] text-[#005AE0] font-semibold";
  return (
    <div className={`aq-rmarquee ${reverse ? "aq-rmarquee--reverse" : ""}`}>
      <div className="aq-rmarquee__track py-1">
        {[...words, ...words].map((w, i) => {
          const cls = `whitespace-nowrap rounded-full border px-4 py-2 text-[13px] transition hover:border-[#0066FF] hover:text-[#005AE0] sm:text-[14px] ${chip}`;
          const slug = chipHref[w];
          const copy = i >= words.length;
          return slug ? (
            <Link key={i} href={`/services/${slug}`} className={cls} tabIndex={copy ? -1 : undefined} aria-hidden={copy || undefined}>{w}</Link>
          ) : (
            <span key={i} aria-hidden={i >= words.length} className={cls}>{w}</span>
          );
        })}
      </div>
    </div>
  );
}

/* Hidden data for Google + AI answer engines (SEO / AEO / GEO) */
const schema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AutomIQ Automation & Drive Services",
  alternateName: ["AutomIQ", "A&D AutomIQ", "AutomIQ Drive Services"],
  areaServed: [
    { "@type": "Country", name: "Canada" },
    { "@type": "Country", name: "United States" },
    { "@type": "AdministrativeArea", name: "Ontario" },
    { "@type": "City", name: "Montreal" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Industrial Repair Services",
    itemListElement: [
      ...services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title, description: s.text },
      })),
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "On-Site Industrial Repair Service Call",
          description: "On-site technician service calls across Canada and the United States.",
        },
      },
    ],
  },
};

const tabs = [
  { key: "services", label: "Repair Services", count: services.length },
  { key: "brands", label: "Brands We Repair", count: repairBrands.length },
] as const;

export default function RepairServices() {
  const [tab, setTab] = useState<"services" | "brands">("services");
  return (
    <section
      id="services"
      aria-labelledby="repair-services-heading"
      className={`${montserrat.className} relative bg-[#F7FAFE] py-10 sm:py-12 lg:py-14`}
    >
      <style dangerouslySetInnerHTML={{ __html: marqueeCss }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="mx-auto max-w-360 px-5 sm:px-8 lg:px-12">
        {/* ---------- Heading + two action cards ---------- */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12">
          <div className="min-w-0 max-w-190">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#005AE0] sm:text-[12px]">
              <span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#0066FF] to-[#00B0FF]" />
              Repair Services
            </p>
            <h2
              id="repair-services-heading"
              className="mt-3 text-[30px] font-extrabold leading-[1.08] tracking-[-0.025em] text-[#0B1A3C] sm:text-[36px] lg:text-[40px]"
            >
              Industrial Repair Services
            </h2>
            <p className="mt-2 text-[13px] font-semibold leading-relaxed text-[#005AE0] sm:text-[15px]">
              Operational testing · 12-month warranty · Free evaluation
            </p>
            <p className="mt-3 text-[14px] leading-[1.65] text-[#52647F] sm:text-[15px]">
              AutomIQ Automation & Drive Services provides servo motor, servo drive and industrial electronics repair for
              manufacturers across Canada and the United States, including VFDs, spindle motors, encoders, PLCs,
              HMIs, CNC controls, power supplies and circuit boards. Ship your unit for a free evaluation,
              component-level repair and operational testing, or book an on-site technician.
            </p>
          </div>

          {/* Send a job + Emergency: two buttons on the right */}
          <div className="flex flex-col gap-2.5 lg:items-end">
            <div className="flex flex-wrap gap-2.5 lg:w-75 lg:flex-col">
              <Link
                href="/request-repair"
                className="aq-shine group inline-flex h-12 flex-[1_1_220px] items-center justify-center gap-2.5 rounded-[14px] bg-linear-to-br from-[#0066FF] to-[#00B0FF] px-5 text-[15px] font-bold text-white shadow-[0_14px_30px_-14px_rgba(0,176,255,0.9)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-14px_rgba(0,176,255,1)] lg:flex-none"
              >
                <PackageCheck size={18} className="shrink-0" />
                Send Us a Repair Job
                <ArrowRight size={17} className="shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/request-repair?service=exchange"
                className="group inline-flex h-12 flex-[1_1_220px] items-center justify-center gap-2.5 rounded-[14px] border border-[#CFE0FF] bg-white px-5 text-[15px] font-bold text-[#0B1A3C] transition duration-300 hover:-translate-y-0.5 hover:border-[#0066FF] hover:shadow-[0_12px_24px_-16px_rgba(0,102,255,0.6)] lg:flex-none"
              >
                <span aria-hidden="true" className="relative flex h-2.25 w-2.25 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#12B76A] opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2.25 w-2.25 rounded-full bg-[#12B76A]" />
                </span>
                Line down? <span className="text-[#005AE0]">24/7 support</span>
                <ArrowRight size={17} className="shrink-0 text-[#005AE0] transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <p className="text-[12px] leading-snug text-[#5B6B84] lg:max-w-75 lg:text-right">
              Ship your unit for a free evaluation. Exchange units and urgent repairs.
            </p>
          </div>
        </div>

        {/* ---------- Tabs: Repair Services / Brands We Repair ---------- */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 sm:mt-8">
          <SlidingTabs label="Browse repairs by" idPrefix="repairs" tabs={tabs} value={tab} onChange={setTab} />
          <Link
            href={tab === "services" ? "/services" : "/brands"}
            className="group inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[#005AE0] sm:text-[14px]"
          >
            {tab === "services" ? "View all services" : "View all brands"}
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Brands We Repair (tab 2) */}
        <div
          id="repairs-panel-brands"
          role="tabpanel"
          aria-labelledby="repairs-tab-brands"
          className={`mt-4 ${tab === "brands" ? "aq-panel" : "hidden"}`}
        >
          <BrandsRepairPanel />
        </div>

        {/* ---------- 12 service cards (tab 1) ---------- */}
        <div
          id="repairs-panel-services"
          role="tabpanel"
          aria-labelledby="repairs-tab-services"
          className={`mt-4 ${tab === "services" ? "aq-panel" : "hidden"}`}
        >
          <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4" onPointerMove={moveSpotlight}>
            {services.map((s) => (
              <li key={s.title}>
                <Link
                  href={s.href}
                  className="aq-card group p-2 sm:flex sm:items-center sm:gap-1 sm:p-2.5"
                  aria-label={`${s.title} — learn more`}
                >
                  <span className="aq-stage relative block h-21 shrink-0 sm:h-22 sm:w-22">
                    <Image
                      src={s.icon}
                      alt={`${s.title} — AutomIQ Automation & Drive Services`}
                      fill
                      sizes="(max-width: 639px) 45vw, 88px"
                      className="object-contain p-2"
                    />
                  </span>
                  <span className="block min-w-0 flex-1 px-1.5 pb-1 pt-2.5 sm:py-1 sm:pl-2 sm:pr-9">
                    <h3 className="aq-card__title text-[13px] font-bold leading-snug text-[#0B1A3C] sm:text-[14.5px]">
                      {s.title}
                    </h3>
                    <p className="mt-1 hidden text-[12.5px] leading-[1.45] text-[#5B6B84] sm:line-clamp-2">{s.text}</p>
                  </span>
                  <span aria-hidden="true" className="aq-card__go sm:top-1/2 sm:-mt-3.5">
                    <ArrowUpRight size={15} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ---------- More repair services + on-site service in one card ---------- */}
        <div className="relative mt-5 overflow-hidden rounded-[22px] border border-[#E3EAF3] bg-white sm:mt-6">
          <div className="flex flex-col gap-3 px-5 pt-4 sm:px-7 sm:pt-5 lg:flex-row lg:items-center lg:justify-between">
            <h3 className="flex items-center gap-2 text-[16px] font-extrabold text-[#0B1A3C] sm:text-[18px]">
              <Wrench size={18} className="text-[#005AE0]" />
              More industrial repair services
            </h3>

            {/* On-site service pill */}
            <div className="relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-[#030817] p-2 pl-4 sm:flex-row sm:items-center sm:gap-4 sm:rounded-full">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_50%,#0066FF_0%,#0A2A6E_40%,transparent_75%)] opacity-80"
              />
              <span className="relative flex items-center gap-2.5 text-[13px] text-white/75">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00B0FF] opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00B0FF]" />
                </span>
                <span>
                  <b className="font-semibold text-white">Technician at your facility?</b>{" "}
                  <span className="hidden sm:inline">On-site across Canada &amp; USA</span>
                </span>
              </span>
              <Link
                href="/on-site-service"
                className="relative inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full bg-linear-to-br from-[#0066FF] to-[#00B0FF] px-4 text-[13px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(0,176,255,0.9)] transition hover:-translate-y-0.5"
              >
                <MapPin size={14} />
                Book On-Site Service
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div className="mt-3.5 flex flex-col gap-2.5 pb-4 [--fade-bg:#ffffff] sm:pb-5" aria-label="Industrial repair services we provide">
            <RepairMarquee words={repairsRow1} dark />
            <RepairMarquee words={repairsRow2} reverse />
          </div>
        </div>
      </div>
    </section>
  );
}
