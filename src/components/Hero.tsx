"use client";

import Image from "next/image";
import { brandFont } from "@/lib/font";
import PartSuggest from "@/components/search/PartSuggest";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  Wrench,
  ShieldCheck,
  FileText,
  Clock,
  Headphones,
  CircuitBoard,
  BadgeCheck,
} from "lucide-react";
import dynamic from "next/dynamic";

// The live 3D waves load only after the page is ready (the still image shows until then)
const GradientWaves = dynamic(() => import("./GradientWaves"), { ssr: false });
import { canRun3D } from "@/lib/gpu";
import BorderGlow from "./BorderGlow";

/* ------------------------------------------------------------------ */
/*  Brand tokens (Industrial Automation Repair Inc.)                              */
/* ------------------------------------------------------------------ */
/*  Primary Blue  #C8102E   Accent Blue  #FF3B55                       */
/*  Navy          #131316   Deep Navy    #121215 (panel base)          */
/*  Light         #F7F7F8   Text muted   #62626F                       */

/** How long each scene stays on screen (ms). Also drives the progress bar. */
const SCENE_DURATION = 3500;

const scenes = [
  {
    title: "Servo Drive",
    message: "From Fault Code to Full Power.",
    image: "/hero/servo-drives.webp",
    description:
      "Component-level servo drive repair, replacement drives and exchange solutions for Siemens, Allen-Bradley, Fanuc and more. Load testing on our test benches before return.",
  },
  {
    title: "Servo Motor",
    message: "Rebuilt to Spec. Back to Work.",
    image: "/hero/servo-motors.webp",
    description:
      "Servo motor repair and complete rebuilding — bearings, brakes, windings and encoder alignment — plus replacement motors for leading industrial brands.",
  },
  {
    title: "Encoder",
    message: "Precise Alignment. Accurate Position.",
    image: "/hero/encoders.webp",
    description:
      "Encoder and resolver repair, replacement and precision alignment to restore reliable motor position feedback.",
  },
  {
    title: "HMI",
    message: "Dead Screen? Back in Control.",
    image: "/hero/hmis.webp",
    description:
      "Industrial HMI and operator panel repair for touchscreens, displays, backlights and circuit boards, plus replacement panels for current and legacy machines.",
  },
  {
    title: "PLC",
    message: "The Brain of Your Line, Restored.",
    image: "/hero/plcs.webp",
    description:
      "Industrial PLC repair, replacement modules and sourcing for CPUs, I/O and communication cards, with load testing appropriate to the equipment.",
  },
  {
    title: "Industrial Controls",
    message: "Every Control. One Repair Partner.",
    image: "/hero/industrial-controls.webp",
    description:
      "CNC controls, robot teach pendants, industrial power supplies and electronics — repair, replacement and exchange solutions from one team.",
  },
  {
    title: "Legacy Equipment",
    message: "Discontinued by the OEM. Not by Us.",
    image: "/hero/obsolete-equipment.webp",
    description:
      "Obsolete industrial drives, servo motors and controls repaired, sourced or exchanged to keep proven manufacturing equipment running.",
  },
  {
    title: "Global Brands",
    message: "Every Major Brand. One Trusted Source.",
    image: "/hero/manufacturers.webp",
    description:
      "Industrial automation repairs, replacement parts and exchange solutions for Siemens, Allen-Bradley, Fanuc, Yaskawa, Rexroth Indramat and more.",
  },
];

const benefits = [
  { icon: ShieldCheck, title: "1-Year Warranty", detail: "Confidence in Every Repair" },
  { icon: Clock, title: "24–72 Hr Turnaround", detail: "Fast Repair Solutions" },
  { icon: Headphones, title: "24/7 Support", detail: "We're Here When You Need Us" },
  { icon: CircuitBoard, title: "Component-Level Repair", detail: "Precision Repairs. Less Waste." },
  { icon: Wrench, title: "Free Evaluation", detail: "No-Obligation Assessment" },
  { icon: BadgeCheck, title: "Operational Testing", detail: "Tested Before Return" },
];

const heroCss = `
/* IAR — Hero animations & decorative layers
   Brand: #C8102E primary · #FF3B55 accent · #131316 navy · #121215 deep navy */

.aq-hero {
  --aq-blue: #C8102E;
  --aq-cyan: #FF3B55;
  --aq-navy: #131316;
  --aq-deep: #121215;
  --aq-ease: cubic-bezier(0.22, 1, 0.36, 1);
}

/* ---------- Background detail ---------- */
.aq-grid {
  background-image:
    linear-gradient(rgba(255,138,153, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,138,153, 0.05) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse 70% 60% at 30% 35%, #000 0%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 30% 35%, #000 0%, transparent 75%);
}

/* Moving gradient on the headline message */
.aq-shimmer {
  background-image: linear-gradient(90deg, #FF3B55 0%, #FF8A99 25%, #ffffff 45%, #FF8A99 60%, #E30C2C 100%);
  background-size: 250% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.aq-copy-enter .aq-shimmer {
  animation: aqRise 0.9s var(--aq-ease) 0.22s both, aqShimmer 6s linear 1s infinite;
}
@keyframes aqShimmer {
  from { background-position: 100% 0; }
  to { background-position: -150% 0; }
}

/* ---------- Stacked crossfade layers ---------- */
.aq-stack {
  grid-area: 1 / 1;
}

.aq-copy-enter .aq-rise {
  animation: aqRise 0.9s var(--aq-ease) both;
}
.aq-d0 { animation-delay: 0.05s !important; }
.aq-d1 { animation-delay: 0.12s !important; }
.aq-d2 { animation-delay: 0.22s !important; }
.aq-d3 { animation-delay: 0.32s !important; }

.aq-copy-exit {
  animation: aqFadeUp 0.5s var(--aq-ease) both;
  pointer-events: none;
}

@keyframes aqRise {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: none; }
}

@keyframes aqFadeUp {
  to { opacity: 0; transform: translateY(-14px); }
}

/* ---------- Product stage ---------- */
.aq-product-enter {
  animation: aqProductIn 1s var(--aq-ease) both;
}
.aq-product-exit {
  animation: aqProductOut 0.6s var(--aq-ease) both;
}

@keyframes aqProductIn {
  from { opacity: 0; transform: translateX(70px) scale(0.86) rotate(-4deg); }
  to { opacity: 1; transform: none; }
}

@keyframes aqProductOut {
  to { opacity: 0; transform: translateX(-70px) scale(0.9) rotate(3deg); }
}

.aq-float {
  animation: aqFloat 7s ease-in-out infinite;
}

@keyframes aqFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-14px) rotate(0.8deg); }
  50% { transform: translateY(-22px) rotate(0deg); }
  75% { transform: translateY(-10px) rotate(-0.8deg); }
}

.aq-tilt {
  transform: translate(calc(var(--aq-tx, 0) * 22px), calc(var(--aq-ty, 0) * 14px)) rotate(calc(var(--aq-tx, 0) * 2deg));
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
/* phones/tablets have no mouse: no tilt */
@media (hover: none) {
  .aq-tilt { transform: none !important; }
}

.aq-glow {
  position: absolute;
  transition: translate 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  width: 62%;
  aspect-ratio: 1;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(255,59,85, 0.4) 0%, rgba(200,16,46, 0.18) 40%, rgba(200,16,46, 0) 70%);
  translate: calc(var(--aq-tx, 0) * 40px) calc(var(--aq-ty, 0) * 30px);
  animation: aqPulse 5s ease-in-out infinite;
}

@keyframes aqPulse {
  0%, 100% { opacity: 0.85; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.06); }
}

.aq-plinth {
  position: absolute;
  left: 50%;
  bottom: 12%;
  width: 58%;
  height: 34px;
  transform: translateX(-50%);
  border-radius: 9999px;
  background: radial-gradient(ellipse at center, rgba(255,59,85, 0.6) 0%, rgba(200,16,46, 0.2) 45%, transparent 72%);
  pointer-events: none;
}

/* Still image of the waves: shows instantly, and stays on devices that skip live 3D */
.aq-waves-still {
  background: #060607;
}
.aq-waves-still img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center bottom;
}

/* Live waves fade in over the still image once the page has loaded */
.aq-waves {
  opacity: 0;
  transition: opacity 1.2s ease;
}
.aq-waves.is-on {
  opacity: 1;
}

/* ---------- Scene progress / timer ---------- */
.aq-progress {
  position: absolute;
  inset: 0;
  transform-origin: left center;
  background: linear-gradient(90deg, var(--aq-blue), var(--aq-cyan));
  animation-name: aqProgress;
  animation-timing-function: linear;
  animation-fill-mode: both;
}

.aq-timer {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
  animation-name: aqProgress;
  animation-timing-function: linear;
}

@keyframes aqProgress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* ---------- Primary CTA ---------- */
.aq-cta {
  position: relative;
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  overflow: hidden;
  border-radius: 0.75rem;
  padding: 0 1.5rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, var(--aq-blue) 0%, #E30C2C 55%, var(--aq-cyan) 130%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255, 0.25),
    0 14px 30px -12px rgba(200,16,46, 0.65);
  transition: transform 0.3s var(--aq-ease), box-shadow 0.3s var(--aq-ease);
}
.aq-cta::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255,255,255, 0.35) 50%, transparent 70%);
  transform: translateX(-120%);
  transition: transform 0.8s var(--aq-ease);
}
.aq-cta:hover {
  transform: translateY(-2px);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255, 0.25),
    0 20px 38px -12px rgba(200,16,46, 0.75);
}
.aq-cta:hover::after {
  transform: translateX(120%);
}

/* ---------- Accessibility ---------- */
@media (prefers-reduced-motion: reduce) {
  .aq-copy-enter .aq-rise,
  .aq-copy-exit,
  .aq-product-enter,
  .aq-product-exit {
    animation-name: aqFadeOnly;
    animation-duration: 0.3s;
  }
  .aq-copy-exit,
  .aq-product-exit {
    animation-direction: reverse;
  }
  .aq-cta,
  .aq-cta::after {
    transition: none;
  }
}

@keyframes aqFadeOnly {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;


const pad = (n: number) => String(n).padStart(2, "0");

export default function Hero() {
  // `current` is the scene on screen; `previous` is kept briefly so it can animate out
  const [{ current, previous }, setScene] = useState<{
    current: number;
    previous: number | null;
  }>({ current: 0, previous: null });
  const paused = false;
  const heroRef = useRef<HTMLElement>(null);
  const tiltFrame = useRef(0);

  // Speed: start the waves just after the page has loaded, at a lighter resolution on phones
  const [waves, setWaves] = useState<{ on: boolean; dpr: number }>({ on: false, dpr: 1.5 });
  useEffect(() => {
    // Weak or software-rendered devices keep the still wave image (fast phones, good PageSpeed)
    if (!canRun3D()) return;
    const phone = window.matchMedia("(pointer: coarse)").matches;
    let t = 0;
    const start = () => {
      t = window.setTimeout(() => setWaves({ on: true, dpr: phone ? 1.25 : 1.5 }), phone ? 900 : 300);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", start);
    };
  }, []);

  // Mouse tilt: updates CSS variables directly instead of re-rendering the whole hero
  const setTilt = (x: number, y: number) => {
    cancelAnimationFrame(tiltFrame.current);
    tiltFrame.current = requestAnimationFrame(() => {
      heroRef.current?.style.setProperty("--aq-tx", String(x));
      heroRef.current?.style.setProperty("--aq-ty", String(y));
    });
  };

  const goTo = useCallback((next: number) => {
    setScene((s) =>
      next === s.current ? s : { current: next, previous: s.current }
    );
  }, []);

  const advance = useCallback(() => {
    setScene((s) => ({
      current: (s.current + 1) % scenes.length,
      previous: s.current,
    }));
  }, []);

  // Drop the outgoing layer once its exit animation is finished
  useEffect(() => {
    if (previous === null) return;
    const t = window.setTimeout(
      () => setScene((s) => ({ ...s, previous: null })),
      700
    );
    return () => window.clearTimeout(t);
  }, [previous, current]);

  const scene = scenes[current];
  const layers = previous === null ? [current] : [previous, current];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: heroCss }} />
      <section
        ref={heroRef}
        className={`${brandFont.className} aq-hero relative overflow-hidden bg-[#060607] text-white`}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setTilt((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
        }}
        onMouseLeave={() => setTilt(0, 0)}
        aria-label="Industrial Automation Repair Inc.: industrial repair and parts"
      >
        {/* ---------- FULL-WIDTH WAVE BACKGROUND ---------- */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <picture className="aq-waves-still absolute inset-0 block">
            <source media="(max-width: 640px)" srcSet="/hero-waves-phone.webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hero-waves-desk.webp" alt="" aria-hidden="true" fetchPriority="high" decoding="async" />
          </picture>
          <div className={`aq-waves absolute inset-0 ${waves.on ? "is-on" : ""}`}>
          {waves.on && (
          <GradientWaves
            backgroundColor="#060607"
            horizonColor="#DA0B2A"
            waveColor="#ED0C2E"
            crestColor="#FBACB8"
            speed={0.15}
            amplitude={2.6}
            waveScale={0.6}
            waveRatio={0.9}
            swell={35}
            turbulence={18}
            tilt={66}
            zoom={1}
            height={5.5}
            fogDepth={15}
            relief={1}
            lightAngle={120}
            sheen={0.5}
            brightness={1.2}
            opacity={1}
            grain={0.12}
            quality="high"
            intro
            mouseInteraction
            mouseStrength={0.6}
            parallaxStrength={0.5}
            swellOnClick
            dpr={waves.dpr}
            style={{}}
          />
          )}
          </div>
          {/* readability: darker on the left where the text sits, fade at top */}
          <div className="absolute inset-0 bg-linear-to-r from-[#060607]/85 via-[#060607]/35 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-[#060607] to-transparent" />
          <div className="aq-grid absolute inset-0" />
        </div>

        {/* ---------- CONTENT ---------- */}
        <div className="relative z-10 mx-auto grid w-full max-w-360 grid-cols-1 items-center gap-6 px-5 pb-16 pt-10 sm:px-8 lg:min-h-152.5 lg:grid-cols-[52%_48%] lg:gap-0 lg:px-12 lg:pb-20 lg:pt-12">
          {/* ================= LEFT ================= */}
          <div className="relative z-20 min-w-0 lg:pr-8">
            <div className="mb-5 flex items-center gap-4">
              <span className="h-0.75 w-10 shrink-0 rounded-full bg-linear-to-r from-[#C8102E] to-[#FF3B55]" />
              {/* Main page heading for Google (fixed, never changes) */}
              <h1 className="text-[13px] font-semibold leading-snug tracking-[0.01em] text-white/90 sm:text-[15px]">
                Servo Drive, Motor &amp; Industrial Electronics Repair in Canada &amp; USA
              </h1>
            </div>

            {/* Rotating headline block */}
            <div className="grid" aria-live="off">
              {/* invisible copies reserve exactly the tallest scene's height */}
              {scenes.map((s) => (
                <div key={`ghost-${s.title}`} className="aq-stack invisible" aria-hidden="true">
                  <p className="mb-5 py-1 text-[11px]">&nbsp;</p>
                  <div className="max-w-170 text-[clamp(2rem,3.4vw,3.2rem)] font-extrabold leading-[1.04] tracking-[-0.03em]">
                    <span className="block">{s.title}</span>
                    <span className="mt-1 block pb-1">{s.message}</span>
                  </div>
                  <p className="mt-5 max-w-130 text-[14px] leading-[1.7] sm:text-[15px]">{s.description}</p>
                </div>
              ))}
              {layers.map((i) => {
                const s = scenes[i];
                const leaving = i === previous;
                return (
                  <div
                    key={`copy-${i}`}
                    className={`aq-stack ${leaving ? "aq-copy-exit" : "aq-copy-enter"}`}
                    aria-hidden={leaving}
                  >
                    <p className="aq-rise aq-d0 mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#131316]/60 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF8A99]">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF3B55] shadow-[0_0_10px_2px_rgba(255,59,85,0.8)]" />
                      Buy · Repair · Exchange
                    </p>

                    <p className="max-w-170 text-[clamp(2rem,3.4vw,3.2rem)] font-extrabold leading-[1.04] tracking-[-0.03em]">
                      <span className="aq-rise aq-d1 block text-white">{s.title}</span>
                      <span className="aq-rise aq-d2 aq-shimmer mt-1 block pb-1">{s.message}</span>
                    </p>

                    <p className="aq-rise aq-d3 mt-5 max-w-130 text-[14px] leading-[1.7] text-[#C8C8CF] sm:text-[15px]">
                      {s.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Search (glass) */}
            <div className="mt-6 max-w-140">
              <form action="/search" method="get" role="search" aria-label="Find a part" data-suggest-anchor className="flex items-center gap-2 rounded-2xl border border-white/15 bg-[#131316]/70 p-1.5 pl-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] transition focus-within:border-[#FF3B55]/60 focus-within:bg-[#131316]/85 focus-within:shadow-[0_0_0_4px_rgba(255,59,85,0.15)]">
                <Search size={19} className="shrink-0 text-[#FF8A99]" />
                <PartSuggest
                  name="part"
                  required
                  aria-label="Search industrial equipment"
                  placeholder="Manufacturer, model or part number"
                  className="h-10 w-full min-w-0 bg-transparent text-[14px] text-white outline-none placeholder:text-white/60"
                />
                <button
                  type="submit"
                  aria-label="Search Parts"
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#131316] sm:px-5"
                >
                  <span className="hidden sm:inline">Search Parts</span>
                  <ArrowRight size={16} />
                </button>
              </form>
              <p className="mt-2.5 pl-1 text-xs text-white/50">
                Start typing a part number to see matching parts. Not listed yet? We&apos;ll quote it for you.
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/request-repair" className="aq-cta group w-full sm:w-auto">
                <Wrench size={18} />
                Request a Repair
                <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="/request-quote"
                className="group inline-flex min-h-11.5 w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-[#131316]/55 px-6 font-semibold text-white transition hover:border-[#FF3B55] hover:bg-[#131316]/80 sm:w-auto"
              >
                <FileText size={18} />
                Request a Quote
                <ArrowUpRight size={17} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>

            {/* Scene navigator */}
            <div className="mt-8 hidden max-w-140 lg:block">
              <div className="flex items-center gap-4">
                <span className="shrink-0 font-mono text-xs tabular-nums text-white/60">
                  <span className="text-white">{pad(current + 1)}</span> / {pad(scenes.length)}
                </span>
                <div className="grid flex-1 grid-cols-8 gap-1.5" role="tablist" aria-label="Choose equipment category">
                  {scenes.map((s, i) => (
                    <button
                      key={s.title}
                      type="button"
                      role="tab"
                      aria-selected={i === current}
                      aria-label={s.title}
                      title={s.title}
                      onClick={() => goTo(i)}
                      className="group relative h-6 cursor-pointer"
                    >
                      <span className="absolute inset-x-0 top-1/2 h-0.75 -translate-y-1/2 overflow-hidden rounded-full bg-white/15 transition group-hover:bg-white/30">
                        {i < current && <span className="absolute inset-0 bg-[#FF3B55]/50" />}
                        {i === current && (
                          <span
                            key={`bar-${current}`}
                            className="aq-progress"
                            style={{
                              animationDuration: `${SCENE_DURATION}ms`,
                              animationPlayState: paused ? "paused" : "running",
                            }}
                            onAnimationEnd={advance}
                          />
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT: PRODUCT STAGE ================= */}
          <div className="relative z-10 min-w-0">
            <div className="relative mx-auto h-72.5 w-full max-w-145 sm:h-93.75 lg:h-123.75">
              {/* Tagline */}
              <p className="absolute right-2 top-0 z-20 hidden text-right text-[10px] font-medium uppercase leading-[1.9] tracking-[0.34em] text-white/60 sm:block">
                 When the line
                <br />
                stops,
                <br />
                we start.
                <span className="mt-2 ml-auto block h-0.5 w-8 bg-[#FF3B55]" />
              </p>

              {/* Glow + rings */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="aq-glow" />
              </div>

              <div aria-hidden="true" className="aq-plinth" />

              {/* Product layers */}
              {layers.map((i) => {
                const s = scenes[i];
                const leaving = i === previous;
                return (
                  <div
                    key={`img-${i}`}
                    className={`absolute inset-[9%] z-10 ${leaving ? "aq-product-exit" : "aq-product-enter"}`}
                    aria-hidden={leaving}
                  >
                    <div className="aq-tilt relative h-full w-full">
                      <div className="aq-float relative h-full w-full">
                        <Image
                          src={s.image}
                          alt={`${s.title} repair and replacement — Industrial Automation Repair Inc.`}
                          fill
                          priority={i === 0}
                          sizes="(max-width: 640px) 320px, (max-width: 1024px) 60vw, 480px"
                          quality={75}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Next picture loads quietly in the background, so the switch is instant */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-[9%] opacity-0">
                <Image
                  src={scenes[(current + 1) % scenes.length].image}
                  alt="" aria-hidden="true"
                  fill
                  sizes="(max-width: 640px) 320px, (max-width: 1024px) 60vw, 480px"
                  quality={75}
                  className="object-contain"
                />
              </div>

              {/* Floating scene chip */}
              <div className="absolute bottom-2 left-2 z-20 hidden sm:block lg:bottom-8 lg:left-6">
                <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-[#131316]/75 px-4 py-3 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.7)]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] font-mono text-xs font-bold">
                    {pad(current + 1)}
                  </span>
                  <div className="leading-tight">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FF8A99]">Now showing</p>
                    <p className="text-sm font-semibold">{scene.title}</p>
                  </div>
                </div>
              </div>

              {/* Mobile progress dots */}
              <div className="absolute bottom-0 left-1/2 z-20 flex -translate-x-1/2 lg:hidden" role="tablist" aria-label="Choose equipment category">
                {scenes.map((s, i) => (
                  <button
                    key={s.title}
                    type="button"
                    role="tab"
                    aria-selected={i === current}
                    aria-label={s.title}
                    onClick={() => goTo(i)}
                    className="flex h-7 min-w-6 items-center justify-center"
                  >
                    <span className={`block h-1.5 rounded-full transition-all duration-500 ${i === current ? "w-6 bg-[#FF3B55]" : "w-1.5 bg-white/30"}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile autoplay driver (desktop uses the progress bar) */}
        <span
          key={`m-${current}`}
          aria-hidden="true"
          className="aq-timer lg:hidden"
          style={{
            animationDuration: `${SCENE_DURATION}ms`,
            animationPlayState: paused ? "paused" : "running",
          }}
          onAnimationEnd={advance}
        />

        {/* Soft fade into the benefits strip */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-[#FF3B55]/70 to-transparent" />
      </section>
      {/* ---------- BENEFITS STRIP ---------- */}
      <section className={`${brandFont.className} relative z-10 border-b border-[#EAEAEC] bg-white`}>
        <div className="mx-auto max-w-360 px-5 pb-6 pt-5 sm:px-8 sm:pb-7 sm:pt-6 lg:px-12">
          <div className="mb-4 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-linear-to-r from-transparent to-[#C8102E]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B30E29] sm:text-[12px] sm:tracking-[0.32em]">
              The IAR Commitment
            </p>
            <span className="h-px w-10 bg-linear-to-l from-transparent to-[#C8102E]" />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 xl:grid-cols-6">
            {benefits.map((item) => {
              const Icon = item.icon;
              return (
                <BorderGlow
                  key={item.title}
                  className="group h-full"
                  backgroundColor="#FFFFFF"
                  glowColor="230 100 62"
                  colors={["#C8102E", "#DA0B2A", "#7C5CFF"]}
                  borderRadius={12}
                  glowRadius={45}
                  glowIntensity={3}
                  edgeSensitivity={8}
                  coneSpread={40}
                  fillOpacity={0.7}
                >
                  <div className="flex h-full items-center gap-2.5 rounded-[12px] bg-linear-to-br from-[#F1F1F2]/90 via-[#F5F5F6]/90 to-[#F1E6FF]/90 px-2.5 py-2.5 sm:px-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-white text-[#B30E29] ring-1 ring-[#C8102E]/10 transition duration-300 group-hover:bg-[#C8102E] group-hover:text-white group-hover:shadow-[0_10px_24px_-8px_rgba(200,16,46,0.6)]">
                      <Icon size={18} strokeWidth={1.9} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-bold leading-tight text-[#131316] sm:text-[13px]">{item.title}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-[#696976] sm:text-[11.5px]">{item.detail}</p>
                    </div>
                  </div>
                </BorderGlow>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}