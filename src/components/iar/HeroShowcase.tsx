"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Phone } from "lucide-react";
import { contact, phoneHref } from "@/lib/contact";
import { brandFont } from "@/lib/font";

export type Product = { src: string; label: string; w: number; h: number };

export const PRODUCTS: Product[] = [
  { src: "/products/motor-large.webp", label: "Large servo & spindle motors", w: 900, h: 612 },
  { src: "/products/servo-drives.webp", label: "Servo drives & amplifiers", w: 529, h: 567 },
  { src: "/products/motor-parker-smb.webp", label: "Parker SMB servo motors", w: 900, h: 618 },
  { src: "/products/motor-ms.webp", label: "Servo motors with MS connectors", w: 900, h: 596 },
  { src: "/products/motor-cable.webp", label: "Compact servo motors", w: 900, h: 581 },
  { src: "/products/motor-compumotor.webp", label: "Parker Compumotor servo motors", w: 900, h: 596 },
  { src: "/products/motor-servo.webp", label: "AC servo motors", w: 582, h: 524 },
];

// Rotating hero slides — image + title + short description. Edit wording here.
type Slide = { src: string; title: string; text: string; href: string; w: number; h: number };
const SLIDES: Slide[] = [
  {
    src: "/iar-hero/servo-motors.webp", title: "Servo Motors", w: 1100, h: 1012,
    text: "AC, DC, spindle and robot servo motors repaired to spec — new bearings and seals, winding tests, encoder alignment and a full load test on our bench.",
    href: "/services/servo-motor-repair",
  },
  {
    src: "/iar-hero/servo-drives.webp", title: "Servo Drives", w: 1100, h: 1099,
    text: "Servo amplifiers and spindle drives diagnosed to component level, repaired and powered up under load with a matching motor before they ship back.",
    href: "/services/servo-drive-repair",
  },
  {
    src: "/iar-hero/hmi-screens.webp", title: "HMI Screens", w: 1100, h: 1095,
    text: "Touch screens, operator panels and displays — we fix dead touch, dim or failed backlights, cracked screens and boot faults, and keep your program intact.",
    href: "/services/hmi-repair",
  },
  {
    src: "/iar-hero/motor-overhaul-encoders.webp", title: "Motor Overhaul & Encoder Alignment", w: 1100, h: 844,
    text: "Complete motor overhauls — rewinds, shafts, bearings and housings — plus encoder and resolver replacement with precise commutation alignment.",
    href: "/services/encoder-repair",
  },
  {
    src: "/iar-hero/power-supplies.webp", title: "Power Supplies", w: 1050, h: 1100,
    text: "Drive power supply modules and 24 V DIN-rail supplies repaired and tested for clean, stable output — so the whole cabinet runs reliably again.",
    href: "/services/power-supply-repair",
  },
];

export default function HeroShowcase() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // auto-rotate the featured product
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), 4200);
    return () => clearInterval(t);
  }, [paused]);

  // pointer parallax: write CSS variables, no re-render
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
        el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
        el.style.setProperty("--px", (x - 0.5).toFixed(3));
        el.style.setProperty("--py", (y - 0.5).toFixed(3));
      });
    };
    const leave = () => { el.style.setProperty("--px", "0"); el.style.setProperty("--py", "0"); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); cancelAnimationFrame(raf); };
  }, []);

  const feat = SLIDES[active];

  return (
    <section ref={ref} className={`${brandFont.className} hero-iar relative isolate overflow-hidden bg-ink text-white`}>
      {/* background layers */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-glow absolute inset-0" />
        <div className="hex-grid absolute -inset-10 opacity-[.08]" />
        <div className="hero-band absolute -right-[18%] top-0 hidden h-full w-[46%] bg-gradient-to-b from-brand/90 via-brand-dark/80 to-[#5c050a]/90 lg:block" />
        <div className="hero-band absolute -right-[18%] top-0 hidden h-full w-[46%] bg-gradient-to-r from-black/55 to-transparent to-30% lg:block" />
        <svg className="circuit absolute bottom-24 left-0 hidden h-24 w-[55%] text-brand/40 lg:block" viewBox="0 0 600 100" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M0 70h180l30-30h160l20 20h210" /><circle cx="570" cy="60" r="4" fill="currentColor" />
          <path d="M0 88h240l22-22h120" /><circle cx="385" cy="66" r="3" fill="currentColor" />
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="mx-auto grid min-h-[620px] max-w-[1600px] items-center gap-10 px-4 pb-8 pt-14 sm:px-6 lg:min-h-[680px] lg:grid-cols-[1.05fr_1fr] lg:px-10 lg:pt-16 2xl:px-16">
        {/* text — swap wording here */}
        <div className="relative z-10">
          <p className="iar-fade-up flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.25em] text-white/70">
            <span className="inline-block h-0.5 w-8 bg-brand" />Industrial Automation Repair · Mississauga, Ontario
          </p>
          <h1 className="iar-fade-up mt-5 font-display text-4xl font-extrabold leading-[1.05] [animation-delay:.1s] sm:text-5xl xl:text-6xl">
            Servo Motor Repair &amp; <span className="text-brand">Servo Drive Repair</span> Canada &amp; USA
          </h1>
          <p className="iar-fade-up mt-4 text-xs font-medium uppercase tracking-[0.4em] text-white/55 [animation-delay:.2s]">Your Automation Repair Partner</p>
          <p className="iar-fade-up mt-5 max-w-xl text-lg leading-relaxed text-white/75 [animation-delay:.3s]">
            Component-level motion control repair, load testing and a one-year warranty for servo motors, drives and industrial electronics — plus surplus servo motors and replacement parts when you can’t wait.
          </p>
          <div className="iar-fade-up mt-8 flex flex-col gap-3 [animation-delay:.4s] sm:flex-row">
            <Link href="/request-repair" className="group inline-flex items-center justify-center gap-2 rounded-md bg-brand px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand/30 transition hover:-translate-y-0.5 hover:bg-brand-dark">Request a Repair Quote <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" aria-hidden /></Link>
            <Link href="/shop" className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-white/70 px-6 py-3 font-semibold transition hover:-translate-y-0.5 hover:bg-white hover:text-ink">Shop Parts</Link>
          </div>
          <a href={phoneHref(contact.phone)} className="iar-fade-up mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/80 [animation-delay:.5s] hover:text-white"><Phone className="h-4 w-4 text-brand" aria-hidden />24/7 line: {contact.phone}</a>
        </div>

        {/* featured product stage */}
        <div className="relative z-10 mx-auto w-full max-w-[640px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="relative aspect-[5/4] [perspective:1200px]">
            <div aria-hidden className="hex-ring absolute left-1/2 top-1/2 h-[82%] w-[82%]" />
            <div aria-hidden className="absolute bottom-[6%] left-1/2 h-8 w-[60%] -translate-x-1/2 rounded-[50%] bg-black/60 blur-xl" />
            {SLIDES.map((p, i) => (
              <div key={p.src} className={`absolute inset-[4%] transition-all duration-700 ease-out ${i === active ? "opacity-100 [transform:scale(1)_translateX(0)]" : "pointer-events-none opacity-0 [transform:scale(.9)_translateX(40px)]"}`}>
                <div className="float-y h-full w-full"><div className="hero-tilt relative h-full w-full">
                  <Image src={p.src} alt={`${p.title} repair`} fill sizes="(min-width:1024px) 600px, 90vw" priority={i === 0} className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,.55)]" />
                </div></div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl border border-white/10 bg-white/[.04] p-5 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div key={feat.title} className="iar-fade-up min-h-[7.5rem]">
                <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand">We repair</p>
                <h2 className="mt-1 font-display text-2xl font-bold leading-tight">{feat.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{feat.text}</p>
                <Link href={feat.href} className="group mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-brand">Learn more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden /></Link>
              </div>
              <div className="flex shrink-0 gap-2 pt-1" role="tablist" aria-label="Repair categories">
                {SLIDES.map((p, i) => (
                  <button key={p.src} role="tab" aria-selected={i === active} aria-label={p.title} onClick={() => setActive(i)} className={`h-2.5 rounded-full transition-all ${i === active ? "w-8 bg-brand" : "w-2.5 bg-white/30 hover:bg-white/60"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
