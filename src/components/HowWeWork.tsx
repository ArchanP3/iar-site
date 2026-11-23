"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { montserrat } from "@/lib/font";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ClipboardCheck,
  Clock,
  FileText,
  Gauge,
  Globe2,
  MapPin,
  PackageCheck,
  Phone,
  Truck,
  Wrench,
} from "lucide-react";
import dynamic from "next/dynamic";

// The shiny cards are desktop-only and switched on after load, so their code loads then too
const ReflectiveCard = dynamic(() => import("./ReflectiveCard"), { ssr: false });


/* ------------------------------------------------------------------ */
/*  Edit the 6 steps here.                                             */
/* ------------------------------------------------------------------ */
const steps = [
  {
    icon: Truck,
    title: "Ship It or Request a Pickup",
    text: "Ship it to us with any carrier, or request a pickup from your facility.",
    points: ["FedEx, Purolator, UPS or DHL", "Pickup from your facility", "Canada and USA"],
  },
  {
    icon: ClipboardCheck,
    title: "Check-In & Condition Report",
    text: "Every unit is logged in our system the day it arrives.",
    points: ["Photos on arrival", "Model and serial number logged", "Wear and damage recorded"],
  },
  {
    icon: FileText,
    title: "Free Evaluation & Written Quote",
    text: "We find the root cause, then quote before any work starts.",
    points: ["Root-cause diagnosis", "Cost and lead time in writing", "No work without your approval"],
  },
  {
    icon: Wrench,
    title: "Component-Level Repair",
    text: "Your original unit is repaired at board and component level.",
    points: ["Failed components replaced", "Capacitors, fans and bearings refreshed", "Repaired, not just swapped"],
  },
  {
    icon: Gauge,
    title: "Operational Testing",
    text: "Run under power on our test jigs before it leaves the bench.",
    points: ["Drives tested with a motor", "Motors tested under drive control", "Encoder alignment checked"],
  },
  {
    icon: PackageCheck,
    title: "Return with Test Report",
    text: "Packed securely and shipped back, ready to install.",
    points: ["Test report included", "Secure, protective packing", "12-month warranty"],
  },
];

/* Ways to get a unit to us (shown above the steps) */
const ways = [
  { icon: MapPin, t: "Drop-off in Mississauga", d: "Walk in during business hours. No appointment needed.", href: "/contact" },
  { icon: PackageCheck, t: "Pickup across Canada", d: "We arrange the collection and send you the waybill.", href: "/request-pickup" },
  { icon: Globe2, t: "Pickup across the USA", d: "Waybill and customs paperwork help included.", href: "/request-pickup" },
  { icon: Wrench, t: "On-site service", d: "Technicians at your plant in Canada and the USA.", href: "/on-site-service" },
];

/* Trust strip */
const facts = [
  { icon: MapPin, label: "Repair centre", value: "Mississauga, Ontario, Canada" },
  { icon: BadgeCheck, label: "Experience", value: "20+ years" },
  { icon: Clock, label: "Turnaround", value: "24–72 hr typical" },
  { icon: PackageCheck, label: "Shipping", value: "Ship It or Request a Pickup" },
  { icon: Truck, label: "Exchange units", value: "Once we receive yours" },
  { icon: Phone, label: "Support", value: "24/7 phone line" },
];

/* Hidden data for Google + AI answer engines (SEO / AEO / GEO) */
const schema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How the AutomIQ Automation & Drive Services repair process works",
  description:
    "Servo drive, servo motor and industrial electronics repair process: shipping or pickup, check-in, free evaluation and quote, component-level repair, operational testing and return with a test report.",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: `${s.text} ${s.points.join(". ")}.`,
  })),
};

const pad = (n: number) => String(n).padStart(2, "0");

/* Colour of each "Step 01–06" label */
const stepColors = [
  "from-[#7DB7FF] to-[#2F7BFF]", // blue
  "from-[#D4A5FF] to-[#9B5CF6]", // purple
  "from-[#FF8FA0] to-[#F43F5E]", // pink-red
  "from-[#B8C2FF] to-[#6A6CF6]", // indigo
  "from-[#FFD27A] to-[#FF8A3D]", // orange
  "from-[#7FF0C0] to-[#22C55E]", // green
];
/* One step card: shiny Reflective Card on computers, a light look-alike on phones (keeps the site fast) */
function StepCard({ index, rich }: { index: number; rich: boolean }) {
  const s = steps[index];
  const Icon = s.icon;
  const last = index === steps.length - 1;

  const content = (
    <>
      {/* soft shade so the text is always readable over the reflection */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-linear-to-t from-[#030817]/80 via-[#030817]/35 to-transparent"
      />
      <div className="relative flex items-center gap-3 text-[12px] leading-5">
        <span className="inline-flex items-center gap-1.5 font-semibold text-white">
          <BadgeCheck size={16} strokeWidth={1.8} />
          <span className={`bg-linear-to-r ${stepColors[index]} bg-clip-text text-[13px] font-extrabold tracking-[0.02em] text-transparent`}>
            Step {pad(index + 1)}
          </span>
        </span>
        <span className="ml-auto inline-flex items-center gap-2 text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
          {last ? "Done" : "Tracked"}
        </span>
      </div>

      <span
        aria-hidden="true"
        data-n={pad(index + 1)}
        className="deco-num relative mt-1 block select-none font-mono text-[40px] font-bold leading-none tracking-[-0.04em] text-white/13 sm:text-[46px]"
      />

      <div className="relative mt-auto">
        <h3 className={`w-fit bg-linear-to-r ${stepColors[index]} bg-clip-text pb-0.5 text-[18px] font-bold leading-[1.15] tracking-[-0.015em] text-transparent text-balance sm:text-[19px]`}>
          {s.title}
        </h3>
        <p className="mt-1.5 text-[12.5px] leading-[1.45] text-white/80">{s.text}</p>
        <ul className="mt-2 space-y-1">
          {s.points.map((pt) => (
            <li key={pt} className="flex items-center gap-2 text-[12.5px] font-medium text-white/90">
              <Check size={14} strokeWidth={2.4} className="shrink-0 text-[#5CC8FF]" />
              {pt}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-3 flex items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[11.5px] text-white/55">AutomIQ repair</span>
          <span className="font-mono text-[13px] tracking-[0.04em] text-white">
            RMA · {pad(index + 1)} / {pad(steps.length)}
          </span>
        </div>
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-linear-to-b from-[#3a3644] to-[#27242f] text-white/75 shadow-[0_4px_10px_-4px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
          <Icon size={17} strokeWidth={1.7} />
        </span>
      </div>
    </>
  );

  if (rich) {
    return (
      <ReflectiveCard
        videoSrc="/videos/test-bench.mp4"
        theme="dark"
        tint="#5AB4FF"
        grayscale={0.6}
        metalness={1}
        roughness={0.3}
        glare={0.45}
        tiltStrength={6}
        intro={false}
        width="100%"
        height={285}
        radius={18}
        style={{ userSelect: "text", WebkitUserSelect: "text" }}
      >
        {content}
      </ReflectiveCard>
    );
  }

  return (
    <div className="relative flex min-h-71.25 w-full flex-col overflow-hidden rounded-[18px] bg-[radial-gradient(90%_70%_at_45%_0%,#1E4C8A_0%,transparent_70%),linear-gradient(160deg,#121A2C_0%,#0E1626_55%,#0A101C_100%)] p-4 text-white shadow-[0_22px_44px_-20px_rgba(0,40,120,0.6)] ring-1 ring-inset ring-white/10">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,transparent_25%,rgba(120,170,230,0.14)_42%,transparent_60%)]"
      />
      {content}
    </div>
  );
}

export default function HowWeWork() {
// Shiny cards only on computers with a mouse, switched on just after the page has loaded
  const [rich, setRich] = useState(false);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) return;
    const t = window.setTimeout(() => setRich(true), 100);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section
      id="how-we-work"
      aria-labelledby="how-we-work-heading"
      className={`${montserrat.className} relative bg-[#F7FAFE] py-10 sm:py-12 lg:py-14`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="mx-auto max-w-360 px-5 sm:px-8 lg:px-12">
        {/* ---------- Heading + buttons ---------- */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-195">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#005AE0] sm:text-[12px]">
              <span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#0066FF] to-[#00B0FF]" />
              How We Work
            </p>
            <h2
              id="how-we-work-heading"
              className="mt-3 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#0B1A3C] sm:text-[36px] lg:text-[40px]"
            >
              How Our Repair Process Works
            </h2>
            <p className="mt-3 text-[14px] leading-[1.65] text-[#52647F] sm:text-[16px]">
              A free evaluation and a written quote before any work starts. Every servo drive, servo
              motor and industrial electronics repair at our Mississauga, Ontario repair centre is tracked step by
              step, from pickup to tested return.
            </p>
            <p className="mt-2 hidden text-[14px] leading-[1.65] text-[#52647F] sm:block sm:text-[16px]">
              Whether it&apos;s a failed VFD, a spindle motor or an obsolete CNC control, you get photos at check-in, a
              clear repair quote, component-level repair, operational testing on our jigs and a test report with
              every unit, backed by a 12-month warranty.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row">
            <Link
              href="/request-repair"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#0066FF] to-[#00B0FF] px-6 text-[15px] font-semibold text-white shadow-[0_12px_28px_-12px_rgba(0,176,255,0.8)] transition hover:-translate-y-0.5"
            >
              <Wrench size={17} />
              Request a Repair
              <ArrowRight size={17} />
            </Link>
            <Link
              href="/request-pickup"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#C9D7E8] bg-white px-6 text-[15px] font-semibold text-[#0B1A3C] transition hover:border-[#0066FF] hover:text-[#005AE0]"
            >
              <Truck size={17} />
              Request a Pickup
            </Link>
          </div>
        </div>

        {/* ---------- How your unit reaches us ---------- */}
        <div className="mt-7">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#005AE0]">How your unit reaches us</h3>
          <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
            {ways.map(({ icon: Icon, t, d, href }, i) => (
              <li key={t}>
                <Link
                  href={href}
                  className="group flex h-full flex-col gap-2 rounded-2xl border border-[#E3EAF3] bg-white p-3.5 transition hover:-translate-y-0.5 hover:border-[#0066FF]/40 hover:shadow-[0_16px_30px_-22px_rgba(0,102,255,0.6)] sm:flex-row sm:items-start sm:gap-3 sm:p-4"
                >
                  <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${i === 0 ? "bg-linear-to-br from-[#0066FF] to-[#00B0FF] text-white shadow-[0_10px_22px_-10px_rgba(0,102,255,0.9)]" : "bg-[#EEF4FB] text-[#005AE0]"}`}>
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-[14px] font-extrabold leading-snug text-[#0B1A3C] group-hover:text-[#0052CC]">{t}</span>
                    <span className="mt-0.5 block text-[12.5px] leading-snug text-[#52647F]">{d}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ---------- 6 step cards (swipe sideways on phones) ---------- */}
        <ol tabIndex={0} aria-label="Repair process steps" className="-mx-5 mt-6 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex w-[80%] max-w-80 shrink-0 snap-start sm:w-auto sm:max-w-none">
              <StepCard index={i} rich={rich} />
            </li>
          ))}
        </ol>

        {/* ---------- Trust strip ---------- */}
        <div className="mt-8 rounded-2xl border border-[#E3EAF3] bg-white px-5 py-4 sm:px-7">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#005AE0]">
            Why Manufacturers Choose AutomIQ
          </h3>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
            {facts.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.label} className="flex items-start gap-2.5">
                  <Icon size={17} className="mt-0.5 shrink-0 text-[#005AE0]" />
                  <span>
                    <span className="block text-[11.5px] text-[#5B6B84]">{f.label}</span>
                    <span className="block text-[13px] font-bold leading-snug text-[#0B1A3C]">{f.value}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}