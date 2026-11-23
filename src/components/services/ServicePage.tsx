import Image from "next/image";
import WhatsAppButton, { WhatsAppCta } from "@/components/WhatsAppButton";
import Link from "next/link";
import {
  ArrowRight, BadgeCheck, Camera, Check, ChevronRight, CircuitBoard, Clock, Cpu, FileCheck2, Gauge,
  MessageCircleQuestion, Plus, Radio, RefreshCw, ScanSearch, ShieldCheck, Wrench, Zap,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { brandFont } from "@/lib/font";
import { getService, serviceUrl, type Service } from "@/lib/services";
import ServiceIcon from "./ServiceIcon";

const repairIcons = [Zap, Gauge, Cpu, Radio, CircuitBoard, RefreshCw];
const testIcons = [Camera, ScanSearch, Gauge, FileCheck2];
const factSets = {
  repair: [["Free evaluation", ShieldCheck], ["24–72 hr typical", Clock], ["1-year warranty", BadgeCheck], ["Load tested on our benches", Gauge]],
  service: [["Every brand", BadgeCheck], ["Canada & USA", ShieldCheck], ["Repair centre in Mississauga", Gauge]],
  cable: [["Any brand", BadgeCheck], ["Built to your length", Gauge], ["Canada & USA", ShieldCheck]],
} as const;

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={`flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] sm:text-[12px] ${dark ? "text-[#FF8A99]" : "text-[#B30E29]"}`}>
      <span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#C8102E] to-[#FF3B55]" />
      {children}
    </p>
  );
}

export default function ServicePage({ s }: { s: Service }) {
  const noun = s.noun;
  const Noun = noun.charAt(0).toUpperCase() + noun.slice(1);
  const an = /^(?:[aeiou]|HMI)/i.test(noun) ? "an" : "a";
  const isEx = s.slug === "exchange";
  const kind = s.kind ?? "repair";
  const facts = factSets[kind];
  const isCable = kind === "cable";
  const plural = noun.endsWith("y") ? noun.slice(0, -1) + "ies" : noun.endsWith("s") ? noun : `${noun}s`;
  const hasCodes = !!s.faults?.some((f) => f.codes?.length);
  const cols = hasCodes ? "md:grid-cols-[1.1fr_1fr_0.9fr]" : "md:grid-cols-[1fr_1.2fr]";
  const words = s.h1.split(" ");
  const lastWord = words.pop();
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: s.h1,
      serviceType: s.h1,
      description: s.answer,
      provider: { "@type": "LocalBusiness", name: "Industrial Automation Repair Inc.", address: { "@type": "PostalAddress", addressLocality: "Mississauga", addressRegion: "ON", addressCountry: "CA" } },
      areaServed: [{ "@type": "Country", name: "Canada" }, { "@type": "Country", name: "United States" }],
    },
    s.faqs?.length && {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [{ q: s.answerQ, a: s.answer }, ...s.faqs].map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ].filter(Boolean);
  const related = (s.related ?? []).map(getService).filter((x): x is Service => !!x);

  return (
    <main className={`${brandFont.className} min-h-screen bg-[#F7F7F8] text-[#131316]`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Header />

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-[#0A0A0C] pb-28 pt-8 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-115 w-155 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.5),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-95 w-120 rounded-full bg-[radial-gradient(closest-side,rgba(255,59,85,0.32),transparent)] blur-2xl" />
        <div className="relative mx-auto grid max-w-310 gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_400px] lg:items-center">
          <div>
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-white/60">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li aria-hidden="true"><ChevronRight size={13} /></li>
                <li><Link href="/services" className="hover:text-white">Repair Services</Link></li>
                <li aria-hidden="true"><ChevronRight size={13} /></li>
                <li className="text-white/85">{s.title}</li>
              </ol>
            </nav>
            <h1 className="mt-5 text-[34px] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[48px]">
              {words.join(" ")} <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">{lastWord}</span>
            </h1>
            <p className="mt-2 text-[15px] font-semibold text-[#FF8A99] sm:text-[17px]">{s.tagline}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {facts.map(([t, I]) => (
                <li key={t} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/6 px-3 py-1.5 text-[12.5px] font-semibold text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                  <I size={13} className="text-[#FF8A99]" aria-hidden="true" />{t}
                </li>
              ))}
            </ul>
            <div className="mt-6 grid grid-cols-[1fr_auto] gap-3 sm:flex sm:flex-wrap">
              <Link href={isCable ? "/request-cable" : isEx ? "/request-repair?service=exchange" : "/request-repair"} className="col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-br sm:col-span-1 from-[#C8102E] to-[#FF3B55] px-6 text-[15px] font-semibold shadow-[0_14px_30px_-14px_rgba(255,59,85,0.9)] transition hover:-translate-y-0.5">
                {isEx ? <Zap size={17} aria-hidden="true" /> : <Wrench size={17} aria-hidden="true" />} {isCable ? "Order a Custom Cable" : isEx ? "Get an Exchange Unit" : kind === "service" ? "Talk to a Technician" : "Request a Repair"} <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href={isEx ? "/request-repair" : "/request-repair?service=exchange"} className="inline-flex h-12 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/20 bg-white/6 px-4 text-[14px] sm:px-6 sm:text-[15px] font-semibold transition hover:border-white/40">
                {isEx ? <><Wrench size={17} aria-hidden="true" /> Repair my own unit</> : <><Zap size={17} aria-hidden="true" /> <span>Line down? <span className="sm:hidden">Exchange unit</span><span className="max-sm:hidden">Get an exchange unit</span></span></>}
              </Link>
              <WhatsAppButton tone="dark" size="lg" topic={s.title} kind="service" label={`Ask about ${s.title} on WhatsApp`} />
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/5 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_30px_60px_-30px_rgba(200,16,46,0.9)] backdrop-blur-xl">
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.12)_0%,transparent_32%,transparent_70%,rgba(255,59,85,0.12)_100%)]" />
              <div className="relative flex h-55 items-center justify-center">
                <span aria-hidden="true" className="absolute h-44 w-44 rounded-full bg-[radial-gradient(closest-side,rgba(255,59,85,0.45),transparent)] blur-lg" />
                {s.icon ? (
                  <Image src={s.icon} alt={`${s.h1} at Industrial Automation Repair Inc.`} width={260} height={260} priority className="relative h-50 w-auto object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,0.5)]" />
                ) : (
                  <ServiceIcon name={s.lucide} color={s.color} size={120} className="relative" />
                )}
              </div>
              {s.brands && (
                <p className="relative mt-2 border-t border-white/10 pt-4 text-[12.5px] leading-relaxed text-white/70">
                  <span className="font-semibold text-white">Brands we repair: </span>
                  {s.brands.filter((b) => b.name !== "And more").map((b) => b.name).join(" · ") || "Siemens · Allen-Bradley · Indramat · Fanuc · Yaskawa"}{isEx ? " and more" : " and every other make"}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto -mt-20 max-w-310 space-y-14 px-5 pb-16 sm:px-8">
        {/* ---------- Short answer (AEO) ---------- */}
        <section aria-labelledby="answer" className="rounded-[24px] border border-[#EAEAEC] bg-white p-6 shadow-[0_30px_70px_-45px_rgba(19,19,22,0.45)] sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B30E29]">Short answer</p>
              <h2 id="answer" className="mt-1.5 text-[22px] font-extrabold sm:text-[26px]">{s.answerQ}</h2>
              <p className="mt-2 max-w-205 text-[15px] leading-[1.7] text-[#62626F] sm:text-[16px]">{s.answer}</p>
            </div>
            <Link href={isCable ? "/request-cable" : isEx ? "/request-repair?service=exchange" : kind === "service" ? "/request-repair?service=question" : "/request-repair"} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#D6D6DB] px-5 text-[14.5px] font-semibold transition hover:border-[#C8102E] hover:text-[#B30E29]">
              {isCable ? "Send cable details" : isEx ? "Check exchange stock" : kind === "service" ? "Ask a technician" : "Get a free evaluation"} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* ---------- What we repair ---------- */}
        {s.repairs && (
          <section aria-labelledby="what">
            <Eyebrow>{s.repairsTitle ? "How it works" : "What we repair"}</Eyebrow>
            <h2 id="what" className="mt-3 text-[26px] font-extrabold leading-tight tracking-[-0.01em] sm:text-[34px]">{s.repairsTitle ?? `What we repair on ${an} ${noun}`}</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {s.repairs.map((r, i) => {
                const I = repairIcons[i % repairIcons.length];
                return (
                  <li key={r.t} className="group rounded-2xl border border-[#EAEAEC] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#C8102E]/30 hover:shadow-[0_18px_40px_-26px_rgba(200,16,46,0.6)]">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C8102E]/8 text-[#B30E29] transition group-hover:bg-linear-to-br group-hover:from-[#C8102E] group-hover:to-[#FF3B55] group-hover:text-white"><I size={18} aria-hidden="true" /></span>
                      <h3 className="text-[16px] font-bold">{r.t}</h3>
                    </div>
                    <p className="mt-2.5 text-[13.5px] leading-[1.6] text-[#62626F]">{r.d}</p>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* ---------- Common faults ---------- */}
        {s.faults && (
          <section aria-labelledby="faults">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Eyebrow>Diagnosis guide</Eyebrow>
                <h2 id="faults" className="mt-3 text-[26px] font-extrabold leading-tight tracking-[-0.01em] sm:text-[34px]">Common {noun} faults we fix</h2>
              </div>
              <Link href="/fault-codes" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#B30E29]">Look up any fault code <ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
            <div className="mt-5 overflow-hidden rounded-[22px] border border-[#EAEAEC] bg-white">
              <div className={`hidden gap-4 bg-[#131316] px-5 py-3 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-white/80 md:grid ${cols}`}>
                <span>Symptom</span><span>Likely cause</span>{hasCodes && <span>Related fault codes</span>}
              </div>
              <ul className="divide-y divide-[#F3F3F4]">
                {s.faults.map((f) => (
                  <li key={f.symptom} className={`grid gap-2 px-5 py-4 md:gap-4 ${cols}`}>
                    <h3 className="text-[14.5px] font-bold leading-snug">{f.symptom}</h3>
                    <p className="text-[13.5px] leading-[1.55] text-[#62626F]">{f.cause}</p>
                    {hasCodes && <div className="flex flex-wrap gap-1.5">
                      {f.codes?.map((c) => (
                        <Link key={c.href} href={c.href} className="rounded-lg bg-[#C8102E]/[0.07] px-2 py-1 font-mono text-[12px] font-bold text-[#A50D25] transition hover:bg-[#C8102E]/[0.14]">{c.code}</Link>
                      ))}
                    </div>}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ---------- How we test (dark liquid card) ---------- */}
        {s.testing && (
          <section aria-labelledby="test" className="relative overflow-hidden rounded-[28px] bg-[#0A0A0C] p-6 text-white sm:p-10">
            <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.55),transparent)] blur-xl" />
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(255,59,85,0.28),transparent)] blur-xl" />
            <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <Eyebrow dark>Quality</Eyebrow>
                <h2 id="test" className="mt-3 text-[26px] font-extrabold leading-tight sm:text-[34px]">{s.testingTitle ?? `How we test every repaired ${noun}`}</h2>
                <p className="mt-3 text-[15px] leading-[1.7] text-white/70">{kind !== "repair" ? "Checked before it leaves our Mississauga, Ontario repair centre." : isEx ? "An exchange unit has to work the moment you install it. Every one is checked and tested before it leaves our Mississauga, Ontario repair centre." : "Parts replaced is not the same as fixed. Every unit is proven under power before it leaves our Mississauga, Ontario repair centre."}</p>
              </div>
              <ol className="grid gap-3 sm:grid-cols-2">
                {s.testing.map((t, i) => {
                  const I = testIcons[i % testIcons.length];
                  return (
                    <li key={t} className="rounded-2xl border border-white/12 bg-white/6 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur">
                      <span className="flex items-center gap-2 text-[12px] font-semibold text-[#FF8A99]"><I size={15} aria-hidden="true" /> 0{i + 1}</span>
                      <p className="mt-2 text-[14.5px] font-semibold leading-snug">{t}</p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        )}

        {/* ---------- Brands ---------- */}
        {s.brands && (
          <section aria-labelledby="brands">
            <Eyebrow>{isEx ? "Brands & series" : "All makes & models"}</Eyebrow>
            <h2 id="brands" className="mt-3 text-[26px] font-extrabold leading-tight tracking-[-0.01em] sm:text-[34px]">{isEx ? "Exchange units by brand" : kind === "repair" ? `We repair every ${noun} brand` : "Every brand, every model"}</h2>
            {!isEx && (
              <p className="mt-2 max-w-190 text-[15px] leading-[1.7] text-[#62626F]">
                {kind === "repair" ? <>We repair {plural} from any manufacturer, current or obsolete.</> : <>For equipment from any manufacturer, current or obsolete.</>} These are some of the brands and series we see most often. If yours isn&apos;t listed, we still repair it.
              </p>
            )}
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {s.brands.filter((b) => isEx || b.name !== "And more").map((b) => (
                <li key={b.name} className="rounded-2xl border border-[#EAEAEC] bg-white p-5">
                  <h3 className="text-[16px] font-extrabold">{b.name}</h3>
                  <ul className="mt-2.5 flex flex-wrap gap-1.5">
                    {b.series.map((x) => <li key={x} className="rounded-lg bg-[#F7F7F8] px-2.5 py-1 text-[12.5px] font-semibold text-[#62626F]">{x}</li>)}
                  </ul>
                </li>
              ))}
              {!isEx && (
                <li className="relative overflow-hidden rounded-2xl bg-[#0A0A0C] p-5 text-white">
                  <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[radial-gradient(closest-side,rgba(218,11,42,0.6),transparent)] blur-lg" />
                  <h3 className="relative text-[16px] font-extrabold">Any brand. Any model.</h3>
                  <p className="relative mt-1.5 text-[13px] leading-[1.6] text-white/70">
                    {(s.brands.find((b) => b.name === "And more")?.series ?? []).concat("every major brand").join(" · ")}
                  </p>
                  <Link href="/request-repair?service=question" className="relative mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#FF8A99]">
                    Don&apos;t see yours? Ask a technician <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </li>
              )}
            </ul>
            {isEx && <p className="mt-3 text-[13px] text-[#62626F]">Availability depends on stock. Send us your part number and we&apos;ll check.</p>}
            <p className="mt-3 text-[12px] text-[#62626F]">Brand names are trademarks of their owners and are used only to identify the equipment we repair.</p>
          </section>
        )}

        {/* ---------- Repair vs exchange vs replace ---------- */}
        {kind === "repair" && <section aria-labelledby="options">
          <Eyebrow>Your options</Eyebrow>
          <h2 id="options" className="mt-3 text-[26px] font-extrabold leading-tight tracking-[-0.01em] sm:text-[34px]">Repair, exchange or replace?</h2>
          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            {[
              { t: "Repair your unit", tag: "Best value", d: "Your original unit, repaired at component level and tested. Usually a fraction of the price of new.", href: "/request-repair", cta: "Request a Repair", on: true },
              { t: "Exchange unit", tag: "Fastest", d: "A tested replacement at a lower price. Ship us your unit and we ship the replacement once it arrives.", href: "/request-repair?service=exchange", cta: "Ask About Exchange" },
              { t: "Replacement part", tag: "Hard to find", d: "New, surplus or refurbished, sourced from every major brand, including discontinued parts.", href: "/request-quote", cta: "Request a Quote" },
            ].map((o) => (
              <div key={o.t} className={`flex flex-col rounded-[22px] border p-6 ${o.on ? "border-[#C8102E]/40 bg-white shadow-[0_24px_50px_-30px_rgba(200,16,46,0.7)] ring-4 ring-[#C8102E]/6" : "border-[#EAEAEC] bg-white"}`}>
                <span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${o.on ? "bg-linear-to-r from-[#C8102E] to-[#FF3B55] text-white" : "bg-[#F7F7F8] text-[#62626F]"}`}>{o.tag}</span>
                <h3 className="mt-3 text-[19px] font-extrabold">{o.t}</h3>
                <p className="mt-1.5 flex-1 text-[14px] leading-[1.6] text-[#62626F]">{o.d}</p>
                <Link href={o.href} className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#B30E29]">{o.cta} <ArrowRight size={15} aria-hidden="true" /></Link>
              </div>
            ))}
          </div>
        </section>}

        {/* ---------- FAQ + related ---------- */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {s.faqs && (
            <section aria-labelledby="faq">
              <Eyebrow>FAQ</Eyebrow>
              <h2 id="faq" className="mt-3 text-[26px] font-extrabold leading-tight tracking-[-0.01em] sm:text-[34px]">{isEx ? "Exchange questions" : kind === "repair" ? `${Noun} repair questions` : `${s.title} questions`}</h2>
              <div className="mt-5 divide-y divide-[#EAEAEC] rounded-[22px] border border-[#EAEAEC] bg-white">
                {s.faqs.map((f, i) => (
                  <details key={f.q} className="group px-5" open={i === 0}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
                      <h3 className="text-[15px] font-bold">{f.q}</h3>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F7F7F8] text-[#B30E29] transition group-open:bg-[#C8102E] group-open:text-white"><Plus size={15} className="transition-transform group-open:rotate-45" aria-hidden="true" /></span>
                    </summary>
                    <p className="-mt-1 pb-4 pr-10 text-[14px] leading-[1.65] text-[#62626F]">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
          <aside className="space-y-3 lg:pt-15">
            {related.length > 0 && (
              <div className="rounded-[22px] border border-[#EAEAEC] bg-white p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B30E29]">Related services</p>
                <ul className="mt-3 space-y-1.5">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link href={serviceUrl(r.slug)} className="group flex items-center gap-3 rounded-xl p-2 transition hover:bg-[#F7F7F8]">
                        {r.icon ? <Image src={r.icon} alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10 rounded-lg bg-[#F7F7F8] object-contain p-1" /> : <ServiceIcon name={r.lucide} color={r.color} size={40} />}
                        <span className="flex-1 text-[14px] font-semibold">{r.title}</span>
                        <ArrowRight size={15} className="text-[#B30E29] transition group-hover:translate-x-0.5" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link href="/request-repair?service=question" className="group flex items-center gap-3 rounded-[22px] bg-[#0A0A0C] p-4 text-white">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55]"><MessageCircleQuestion size={18} aria-hidden="true" /></span>
              <span className="flex-1"><b className="block text-[14px]">Not sure what&apos;s wrong?</b><span className="text-[12.5px] text-white/65">Ask a repair technician.</span></span>
              <ArrowRight size={16} className="text-[#FF8A99]" aria-hidden="true" />
            </Link>
          </aside>
        </div>

        {/* ---------- Final CTA ---------- */}
        <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#DA0B2A_0%,#C8102E_45%,#FF3B55_100%)] p-7 text-white sm:p-10">
          <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-white/15 blur-2xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[26px] font-extrabold leading-tight sm:text-[32px]">{isCable ? "Need a cable? We'll build it to match." : kind === "service" ? "Let's keep your line running." : `${isEx ? "Line" : Noun} down? Let's get it running again.`}</h2>
              <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-white/85">
                {(kind === "repair" ? ["Free evaluation", "No work without your approval", "1-year warranty"] : ["Any brand", "Canada & USA", "We confirm details before we start"]).map((t) => <span key={t} className="inline-flex items-center gap-1.5"><Check size={14} aria-hidden="true" />{t}</span>)}
              </p>
            </div>
            <div className="grid gap-3 sm:flex sm:flex-wrap lg:flex-nowrap">
              <Link href={isCable ? "/request-cable" : "/request-repair"} className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-6 text-[15px] font-semibold text-[#131316] transition hover:-translate-y-0.5"><Wrench size={17} aria-hidden="true" /> {isCable ? "Order a Custom Cable" : "Request a Repair"}</Link>
              <Link href="/request-pickup" className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/40 px-6 text-[15px] font-semibold transition hover:bg-white/10">Request a Pickup</Link>
              <WhatsAppCta topic={s.title} kind="service" />
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
