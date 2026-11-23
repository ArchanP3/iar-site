"use client";

import Image from "next/image";
import PartSuggest from "@/components/search/PartSuggest";
import Link from "next/link";
import { montserrat } from "@/lib/font";
import { BadgeCheck, Factory } from "lucide-react";
import { ArrowRight, ArrowUpRight, Cog, HandCoins, Radar, Search, ShieldCheck, ShoppingCart, Wind, Zap } from "lucide-react";
import { useState } from "react";
import ShopBrandsPanel, { shopBrands } from "./ShopBrandsPanel";
import SlidingTabs from "./home/SlidingTabs";
import { moveSpotlight } from "./home/spotlight";
import "./home/homeSections.css";


/* ------------------------------------------------------------------ */
/*  Edit the 8 part categories here.                                   */
/*  When your own pictures are ready, put them in public/parts/ and    */
/*  change each `icon` to e.g. "/parts/servo-drives.png".              */
/*  A card with icon: "" shows a simple outline icon until then.       */
/* ------------------------------------------------------------------ */
const categories = [
  { title: "Servo Drives", text: "Drives and amplifiers for current and legacy machines.", href: "/shop/servo-drives", icon: "/services/servo-drive.webp" },
  { title: "Servo Motors", text: "AC, DC and spindle motors.", href: "/shop/servo-motors", icon: "/services/servo-motor.webp" },
  { title: "Encoders", text: "Replacement encoders and feedback devices.", href: "/shop/encoders", icon: "/services/encoder.webp" },
  { title: "HMIs & Operator Panels", text: "Touch panels and operator stations.", href: "/shop/hmis", icon: "/services/hmi.webp" },
  { title: "PLCs & I/O", text: "CPUs, I/O and communication modules.", href: "/shop/plcs", icon: "/services/plc.webp" },
  { title: "Power Supplies", text: "Supplies, DC bus and line modules.", href: "/shop/power-supplies", icon: "/services/power-supply.webp" },
  { title: "CNC Controls", text: "Controls, panels and boards for machine tools.", href: "/shop/cnc-controls", icon: "/services/cnc-control.webp" },
  { title: "Legacy & Obsolete", text: "Discontinued components for older lines.", href: "/shop/legacy", icon: "/services/exchange.webp" },
  { title: "Sensors", text: "Proximity, photoelectric, vision and process sensors.", href: "/shop/sensors", icon: "/services/sensor.webp" },
  { title: "Safety Equipment", text: "Safety relays, light curtains, switches and controllers.", href: "/shop/safety", icon: "/services/safety.webp" },
  { title: "Gearboxes", text: "Planetary, servo and industrial gear reducers.", href: "/shop/gearboxes", icon: "/services/gearboxes.webp" },
  { title: "Pneumatics & Hydraulics", text: "Valves, cylinders, pumps and fittings.", href: "/shop/pneumatics-hydraulics", icon: "/services/pneumatics-hydraulics.webp" },
];

const fallbackIcons: Record<string, React.ElementType> = {
  Sensors: Radar,
  "Safety Equipment": ShieldCheck,
  Gearboxes: Cog,
  "Pneumatics & Hydraulics": Wind,
};

/* Scrolling row 1 — more manufacturers */
/* (The 16 main brands already have their own tiles in the Shop by Brand tab) */
const brands = [
  "Control Techniques", "Heidenhain", "Pro-face", "KUKA", "Danfoss", "Delta Electronics", "Panasonic", "Keyence",
  "B&R Automation", "Bosch Rexroth", "Emerson", "GE Fanuc", "Hitachi", "Toshiba", "WEG", "Nidec",
  "Sanyo Denki", "Pilz", "Phoenix Contact", "SICK", "Festo", "Pepperl+Fuchs", "Okuma", "Mazak",
  "Haas", "Fuji Electric", "Eaton", "Rockwell Automation", "Honeywell", "Banner Engineering", "Balluff", "IFM",
  "Turck", "Wago", "Weidmüller", "Lika", "Stegmann", "Renishaw", "Elau", "Indramat",
  "Reliance Electric", "Unico", "Kuka Roboter", "Yokogawa",
];

/* Scrolling row 2 — part types */
const items = [
  "Servo Motors", "Servo Drives", "AC Motors", "DC Motors", "VFDs", "Encoders", "Resolvers", "Feedback Cables",
  "Power Cables", "Sensors", "PLC Modules", "I/O Cards", "HMIs", "Power Supplies", "Spindle Motors",
  "Spindle Drives", "Controller Cards", "Line Modules", "Brake Resistors", "Teach Pendants", "Circuit Boards",
  "Gearboxes", "Linear Motors", "Stepper Motors", "Stepper Drives", "Soft Starters", "Contactors",
  "Circuit Breakers", "Relays", "Proximity Sensors", "Photoelectric Sensors", "Safety Relays",
  "Communication Modules", "Operator Panels", "CNC Keyboards", "Touch Screens", "Cooling Fans",
  "Capacitors", "Transformers", "Line Filters", "Servo Amplifiers", "Motion Controllers", "CPU Modules",
  "Analog Modules", "Digital I/O Modules", "Network Cards", "Fieldbus Modules", "Rotary Encoders",
  "Linear Encoders", "Absolute Encoders", "Servo Cables", "DC Bus Modules", "Regen Units", "Robot Controllers",
  "Robot Servo Motors", "Pneumatic Valves", "Limit Switches", "Barcode Readers", "Vision Sensors", "Thermocouples",
];

const conditions = [
  { label: "New", text: "Factory-new, in original packaging where available." },
  { label: "Surplus", text: "Unused or lightly used stock, inspected before listing." },
  { label: "Refurbished", text: "Repaired and refreshed by our technicians, then tested." },
  { label: "Exchange", text: "A tested replacement once we receive your unit." },
];

const css = `
.aq-marquee { position: relative; overflow: hidden; content-visibility: auto; contain-intrinsic-size: auto 52px; }
.aq-marquee::before, .aq-marquee::after { content: ""; position: absolute; top: 0; bottom: 0; width: 8%; z-index: 1; pointer-events: none; }
.aq-marquee::before { left: 0; background: linear-gradient(90deg, var(--fade-bg, #fff), transparent); }
.aq-marquee::after { right: 0; background: linear-gradient(270deg, var(--fade-bg, #fff), transparent); }
.aq-marquee__track { display: flex; width: max-content; gap: 10px; animation: aq-marqueeMove 160s linear infinite; will-change: transform; }
.aq-marquee--reverse .aq-marquee__track { animation-direction: reverse; animation-duration: 180s; }
.aq-marquee:hover .aq-marquee__track { animation-play-state: paused; }
@keyframes aq-marqueeMove { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { .aq-marquee__track { animation: none; } }
`;

/* Hidden data for Google + AI answer engines (SEO / AEO / GEO) */
const schema = {
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  name: "Industrial Automation Parts",
  description: "New, surplus, refurbished and obsolete industrial automation parts for all major brands.",
  itemListElement: categories.map((c) => ({
    "@type": "OfferCatalog",
    name: c.title,
    description: c.text,
    url: c.href,
  })),
};

function Marquee({ words, reverse = false, tone }: { words: string[]; reverse?: boolean; tone: "brand" | "item" }) {
  const chip =
    tone === "brand"
      ? "border-[#0B1A3C]/10 bg-white text-[#0B1A3C] font-bold"
      : "border-[#0066FF]/15 bg-[#F4F7FB] text-[#005AE0] font-semibold";
  return (
    <div className={`aq-marquee ${reverse ? "aq-marquee--reverse" : ""}`}>
      <div className="aq-marquee__track py-1">
        {[...words, ...words].map((w, i) => (
          <span
            key={i}
            aria-hidden={i >= words.length}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-[13px] sm:text-[14px] ${chip}`}
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

/* A way-to-buy tile: a link when the page exists, a plain card ("opening soon") when it doesn't */
function Tile({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  if (href) return <Link href={href} className={className}>{children}</Link>;
  return <div aria-disabled="true" className={`${className} cursor-default opacity-80 hover:translate-y-0`}>{children}</div>;
}

const tabs = [
  { key: "category", label: "Shop by Category", count: categories.length },
  { key: "brand", label: "Shop by Brand", count: shopBrands.length },
] as const;

export default function PartsSection() {
  const [tab, setTab] = useState<"category" | "brand">("category");
  return (
    <section
      id="parts"
      aria-labelledby="parts-heading"
      className={`${montserrat.className} relative bg-white py-10 sm:py-12 lg:py-14`}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="mx-auto max-w-360 px-5 sm:px-8 lg:px-12">
        {/* ---------- Navy panel: heading + part number search ---------- */}
        <div className="aq-shop-hero relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-[#0B1A3C] to-[#030817] p-5 text-white sm:p-8 lg:p-10">
          <span aria-hidden="true" className="aq-shop-glow pointer-events-none absolute -right-40 -top-56 -z-10 h-105 w-170 rounded-full bg-[radial-gradient(closest-side,rgba(0,102,255,0.65),transparent)]" />
          <span aria-hidden="true" className="aq-shop-glow aq-shop-glow--b pointer-events-none absolute -bottom-52 -left-44 -z-10 h-75 w-130 rounded-full bg-[radial-gradient(closest-side,rgba(0,176,255,0.3),transparent)]" />
          <span aria-hidden="true" className="aq-shop-grid pointer-events-none absolute inset-0 -z-10" />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-10">
            <div className="min-w-0">
              <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7FD3FF] sm:text-[12px]">
                <span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#0066FF] to-[#00B0FF]" />
                Shop Parts
              </p>
              <h2
                id="parts-heading"
                className="mt-3 text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] text-white sm:text-[32px] lg:text-[34px]"
              >
                Buy Industrial Automation Parts: New, Refurbished, Surplus &amp; Obsolete
              </h2>
              <p className="mt-2 text-[14px] font-semibold text-[#4DB8FF] sm:text-[15px]">
                Hard-to-find parts for current and legacy machines · Tested before it ships
              </p>
              <p className="mt-3 text-[14px] leading-[1.7] text-[#B7C5DC] sm:text-[15px]">
                AutomIQ Automation & Drive Services supplies new, surplus, refurbished and obsolete industrial automation parts for
                manufacturers across Canada and the United States, including servo drives, servo motors, encoders, PLCs,
                HMIs, CNC controls, power supplies, sensors and gearboxes. Send a part number for price, condition and lead
                time, or let our team source hard-to-find and discontinued parts from 1,000+ brands.
              </p>
            </div>

            <form action="/search" method="get" className="rounded-[22px] border border-white/12 bg-white/5 p-4 backdrop-blur-md sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7FD3FF]">Part number search</p>
              <label htmlFor="part-search" className="mt-1 block text-[20px] font-extrabold leading-tight sm:text-[22px]">Have a part number?</label>
              <div data-suggest-anchor className="mt-4 flex items-center gap-3 rounded-2xl bg-white px-4 transition-shadow focus-within:ring-4 focus-within:ring-[#00B0FF]/35">
                <Search size={21} className="shrink-0 text-[#005AE0]" />
                <PartSuggest id="part-search" name="part" required placeholder="e.g. 6SL3120-1TE21-0AA3" className="h-14 w-full min-w-0 bg-transparent font-mono text-[16.5px] text-[#0B1A3C] outline-none placeholder:font-sans placeholder:text-[#5B6B84]" />
              </div>
              <button type="submit" className="aq-shine mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-br from-[#0066FF] to-[#00B0FF] text-[16px] font-semibold shadow-[0_14px_30px_-14px_rgba(0,176,255,0.9)] transition hover:-translate-y-0.5">
                Check Availability <ArrowRight size={18} />
              </button>
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-white/75">
                {([["Price, condition & lead time", BadgeCheck], ["Obsolete & discontinued sourced", Radar], ["1,000+ brands", Factory]] as const).map(([t, I]) => (
                  <li key={t} className="flex items-center gap-1.5"><I size={14} className="shrink-0 text-[#7FD3FF]" />{t}</li>
                ))}
              </ul>
            </form>
          </div>
        </div>

        {/* ---------- Tabs: Shop by Category / Shop by Brand ---------- */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 sm:mt-8">
          <SlidingTabs label="Shop parts by" idPrefix="parts" tabs={tabs} value={tab} onChange={setTab} />
          <Link
            href={tab === "category" ? "/shop" : "/shop/brands"}
            className="group inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[#005AE0] sm:text-[14px]"
          >
            {tab === "category" ? "View all categories" : "View all brands"}
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Shop by Brand tab */}
        <div
          id="parts-panel-brand"
          role="tabpanel"
          aria-labelledby="parts-tab-brand"
          className={`mt-4 ${tab === "brand" ? "aq-panel" : "hidden"}`}
        >
          <ShopBrandsPanel />
        </div>

        {/* Category cards (Shop by Category tab) */}
        <div
          id="parts-panel-category"
          role="tabpanel"
          aria-labelledby="parts-tab-category"
          className={`mt-4 ${tab === "category" ? "aq-panel" : "hidden"}`}
        >
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-6" onPointerMove={moveSpotlight}>
            {categories.map((c) => (
              <li key={c.title}>
                <Link href={c.href} className="aq-card group p-2" aria-label={`Shop ${c.title}`}>
                  <span className="aq-stage relative flex h-22 items-center justify-center sm:h-26">
                    {c.icon ? (
                      <Image
                        src={c.icon}
                        alt={`${c.title} — industrial automation parts, AutomIQ Automation & Drive Services`}
                        fill
                        sizes="(max-width: 639px) 45vw, (max-width: 1279px) 30vw, 200px"
                        className="object-contain p-2.5"
                      />
                    ) : (
                      (() => {
                        const Icon = fallbackIcons[c.title] ?? Cog;
                        return <Icon size={30} strokeWidth={1.7} className="relative z-1 text-[#005AE0]" />;
                      })()
                    )}
                  </span>
                  <span className="block px-1.5 pb-1.5 pt-3">
                    <h3 className="aq-card__title pr-1 text-[13px] font-bold leading-snug text-[#0B1A3C] sm:text-[14px]">
                      {c.title}
                    </h3>
                    <p className="mt-1 hidden text-[12px] leading-[1.45] text-[#5B6B84] sm:line-clamp-2">{c.text}</p>
                  </span>
                  <span aria-hidden="true" className="aq-card__go">
                    <ArrowUpRight size={15} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ---------- Critical / spare / rush parts + 2 scrolling rows ---------- */}
        <div className="mt-6 rounded-[22px] border border-[#E3EAF3] bg-[#F7FAFE] py-5 [contain-intrinsic-size:auto_300px] [content-visibility:auto] sm:py-6">
          <div className="flex flex-col gap-2 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p className="flex items-center gap-2 text-[16px] font-extrabold text-[#0B1A3C] sm:text-[18px]">
              <Zap size={18} className="text-[#005AE0]" />
              Critical, spare and rush parts for all major brands
            </p>
            <p className="text-[13px] font-semibold text-[#52647F] sm:text-[14px]">
              Sourcing from <span className="text-[#005AE0]">1,000+ brands</span>
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-2.5 [--fade-bg:#F7FAFE]" aria-label="Manufacturers and part types we supply">
            <Marquee words={brands} tone="brand" />
            <Marquee words={items} tone="item" reverse />
          </div>


          {/* Condition + availability */}
          <div className="mt-5 flex flex-col gap-3 px-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {conditions.map((c) => (
                <span
                  key={c.label}
                  title={c.text}
                  className="group/chip relative cursor-default rounded-lg border border-[#0B1A3C]/10 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-[#0B1A3C]"
                >
                  {c.label}
                  <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-56 rounded-lg bg-[#0B1A3C] px-3 py-2 text-[12px] font-medium leading-snug text-white shadow-lg group-hover/chip:block">
                    {c.text}
                  </span>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[12.5px] text-[#52647F]">
              <span className="flex items-start gap-2">
                <span className="mt-1.25 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <span><b className="text-[#0B1A3C]">In stock</b> · tested in-house, ready to ship</span>
              </span>
              <span className="flex items-start gap-2">
                <span className="mt-1.25 h-2 w-2 shrink-0 rounded-full bg-[#0066FF]" />
                <span><b className="text-[#0B1A3C]">Sourced to order</b> · lead time confirmed on your quote</span>
              </span>
            </div>
          </div>
        </div>

        {/* ---------- Ways to buy + sourcing ---------- */}
        <div className="relative mt-5 overflow-hidden rounded-[22px] bg-[#030817] p-3 sm:p-4">
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,#0066FF_0%,#0A2A6E_35%,transparent_70%)] opacity-80" />
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.06)_0%,transparent_30%)]" />
          <div className="relative grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-[1fr_1fr_1.55fr]">
            {[
              { icon: ShoppingCart, t: "Buy Now", d: "In-stock parts, tested and ready to ship.", href: "", tag: "Online shop opening soon" },
              { icon: HandCoins, t: "Make an Offer", d: "Name your price on surplus and bulk orders.", href: "/request-quote?offer=1", tag: "Surplus & bulk" },
            ].map(({ icon: I, t, d, href, tag }) => (
              <Tile
                key={t}
                href={href}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/4 p-3 text-center sm:flex-row sm:items-start sm:gap-3 sm:p-3.5 sm:text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:-translate-y-0.5 hover:border-[#00B0FF]/50 hover:bg-white/[0.07]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#0066FF] to-[#00B0FF] text-white shadow-[0_10px_22px_-10px_rgba(0,176,255,0.9)]">
                  <I size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="w-full text-[13px] font-bold leading-tight text-white sm:w-auto sm:text-[15px]">{t}</span>
                    {href && <ArrowUpRight size={15} className="hidden shrink-0 text-[#4DB8FF] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:block" />}
                  </span>
                  <span className="mt-0.5 hidden text-[12.5px] leading-snug text-white/60 sm:block">{d}</span>
                  <span className="mt-2 hidden rounded-md bg-white/[0.07] sm:inline-flex px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#7FD3FF]">{tag}</span>
                </span>
              </Tile>
            ))}

            {/* Can't find it? */}
            <form action="/request-quote" method="get" className="rounded-2xl border border-[#00B0FF]/30 bg-[linear-gradient(135deg,rgba(0,102,255,0.22),rgba(0,176,255,0.08))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] col-span-2 lg:col-span-1">
              <p className="flex items-center gap-2 text-[15px] font-bold text-white">
                <Radar size={17} className="text-[#7FD3FF]" />
                Can&apos;t find your part? We&apos;ll source it.
              </p>
              <p className="mt-0.5 text-[12.5px] text-white/65">Our team searches 1,000+ brands and surplus stock for you.</p>
              <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-white/15 bg-[#030817]/60 p-1 pl-3">
                <label htmlFor="source-part" className="sr-only">Part number</label>
                <input id="source-part" name="part" placeholder="Part number or model" className="h-9 w-full min-w-0 bg-transparent text-[13.5px] text-white outline-none placeholder:text-white/60" />
                <button type="submit" className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-white px-3.5 text-[13px] font-semibold text-[#0B1A3C] transition hover:bg-[#EAF2FF]">
                  Find It <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
