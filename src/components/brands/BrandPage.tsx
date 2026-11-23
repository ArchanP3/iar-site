import Link from "next/link";
import WhatsAppButton, { WhatsAppCta } from "@/components/WhatsAppButton";
import { ArrowRight, ArrowUpRight, BadgeCheck, Bot, Check, ChevronRight, CircuitBoard, Clock, Cog, Cpu, Disc3, Gauge, Monitor, Power, Radar, RefreshCw, SlidersHorizontal, MessageCircleQuestion, Plus, ShieldCheck, Wrench, Zap, Binary } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { montserrat } from "@/lib/font";
import { brandFaqs, brandMakes, brands, brandUrl, type Brand } from "@/lib/brands";
import { services, serviceUrl } from "@/lib/services";
import { familyBySeries } from "@/lib/decoder/families";

/* Icons for the 12 repair categories. Same for every brand, so nothing is mislabelled.
   Later: when inventory photos exist for a brand + category, show those here instead. */
const catIcon: Record<string, React.ElementType> = {
  "servo-drive-repair": Cpu,
  "vfd-repair": SlidersHorizontal,
  "servo-motor-repair": Cog,
  "industrial-motor-repair": Disc3,
  "encoder-repair": Radar,
  "plc-repair": CircuitBoard,
  "hmi-repair": Monitor,
  "cnc-repair": Gauge,
  "power-supply-repair": Power,
  "controller-card-repair": CircuitBoard,
  "robotics-repair": Bot,
  exchange: RefreshCw,
};

const facts = [
  ["Free evaluation", ShieldCheck],
  ["24–72 hr typical", Clock],
  ["12-month warranty", BadgeCheck],
  ["Tested on our jigs", Gauge],
] as const;

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={`flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] sm:text-[12px] ${dark ? "text-[#7FD3FF]" : "text-[#005AE0]"}`}>
      <span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#0066FF] to-[#00B0FF]" />
      {children}
    </p>
  );
}

export default function BrandPage({ b }: { b: Brand }) {
  const q = `Do you repair ${b.name} equipment?`;
  // The short answer above already covers "Do you repair X?", so it isn't repeated in the FAQ list
  const faqs = (b.faqs ?? brandFaqs(b.name)).filter((f) => f.q !== q);
  const makes = brandMakes(b);
  const Makes = makes.charAt(0).toUpperCase() + makes.slice(1);
  const cats = services.filter((x) => b.categories.includes(x.slug));
  const answer = `Yes. ${b.intro} If it carries the ${b.name} name, send it in and we will repair it.`;
  const repairHref = `/request-repair?brand=${encodeURIComponent(b.name)}`;
  const others = brands.filter((x) => x.slug !== b.slug && x.core).slice(0, 4);
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${b.name} repair`,
      serviceType: `${b.name} drive, motor and control repair`,
      description: answer,
      provider: { "@type": "LocalBusiness", name: "AutomIQ Automation & Drive Services", address: { "@type": "PostalAddress", addressLocality: "Mississauga", addressRegion: "ON", addressCountry: "CA" } },
      areaServed: [{ "@type": "Country", name: "Canada" }, { "@type": "Country", name: "United States" }],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [{ q, a: answer }, ...faqs].map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <main className={`${montserrat.className} min-h-screen bg-[#F4F7FB] text-[#0B1A3C]`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Header />

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-[#050B18] pb-28 pt-8 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-115 w-155 rounded-full bg-[radial-gradient(closest-side,rgba(0,102,255,0.5),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-95 w-120 rounded-full blur-2xl" style={{ background: `radial-gradient(closest-side, ${b.color}55, transparent)` }} />
        <div className="relative mx-auto grid max-w-310 gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-white/60">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li aria-hidden="true"><ChevronRight size={13} /></li>
                <li><Link href="/brands" className="hover:text-white">Brands</Link></li>
                <li aria-hidden="true"><ChevronRight size={13} /></li>
                <li className="text-white/85">{b.name}</li>
              </ol>
            </nav>
            <h1 className="mt-5 text-[34px] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[48px]">
              {b.name} <span className="bg-linear-to-r from-[#7FD3FF] to-[#00B0FF] bg-clip-text text-transparent">Repair</span>
            </h1>
            <p className="mt-2 text-[15px] font-semibold text-[#7FD3FF] sm:text-[17px]">{Makes}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {facts.map(([t, I]) => (
                <li key={t} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/6 px-3 py-1.5 text-[12.5px] font-semibold text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                  <I size={13} className="text-[#7FD3FF]" aria-hidden="true" />{t}
                </li>
              ))}
            </ul>
            <div className="mt-6 grid grid-cols-[1fr_auto] gap-3 sm:flex sm:flex-wrap">
              <Link href={repairHref} className="col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-br sm:col-span-1 from-[#0066FF] to-[#00B0FF] px-6 text-[15px] font-semibold shadow-[0_14px_30px_-14px_rgba(0,176,255,0.9)] transition hover:-translate-y-0.5">
                <Wrench size={17} aria-hidden="true" /> Request a Repair <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href={`/request-quote?brand=${encodeURIComponent(b.name)}`} className="inline-flex h-12 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/20 bg-white/6 px-4 text-[14px] sm:px-6 sm:text-[15px] font-semibold transition hover:border-white/40">
                Request a Quote
              </Link>
              <WhatsAppButton tone="dark" size="lg" topic={b.name} kind="brand" label={`Ask about ${b.name} repair on WhatsApp`} />
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/5 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_30px_60px_-30px_rgba(0,102,255,0.9)] backdrop-blur-xl">
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.12)_0%,transparent_32%,transparent_70%,rgba(0,176,255,0.12)_100%)]" />
              <div className="relative flex h-42.5 items-center justify-center">
                <span aria-hidden="true" className="absolute h-40 w-40 rounded-full blur-xl" style={{ background: `radial-gradient(closest-side, ${b.color}88, transparent)` }} />
                <span className="relative flex h-28 w-28 items-center justify-center rounded-[28px] text-[34px] font-extrabold tracking-[-0.02em] text-white shadow-[0_24px_40px_-16px_rgba(0,0,0,0.7)] ring-1 ring-white/20" style={{ background: `linear-gradient(145deg, ${b.color}, #0B1A3C)` }}>
                  {b.initials}
                </span>
              </div>
              {b.core && <p className="relative mx-auto mt-1 w-fit rounded-full bg-linear-to-r from-[#0066FF] to-[#00B0FF] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">Core specialty</p>}
              <p className="relative mt-4 border-t border-white/10 pt-4 text-center text-[12.5px] leading-relaxed text-white/70">{b.card}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto -mt-20 max-w-310 space-y-14 px-5 pb-16 sm:px-8">
        {/* ---------- Short answer ---------- */}
        <section aria-labelledby="answer" className="rounded-[24px] border border-[#E3EAF3] bg-white p-6 shadow-[0_30px_70px_-45px_rgba(11,26,60,0.45)] sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#005AE0]">Short answer</p>
          <h2 id="answer" className="mt-1.5 text-[22px] font-extrabold sm:text-[26px]">{q}</h2>
          <p className="mt-2 max-w-225 text-[15px] leading-[1.7] text-[#52647F] sm:text-[16px]">{answer}</p>
        </section>

        {/* ---------- Everything we repair (all 12 categories, every brand) ---------- */}
        <section aria-labelledby="all">
          <Eyebrow>Everything {b.name}</Eyebrow>
          <h2 id="all" className="mt-3 text-[26px] font-extrabold leading-tight tracking-[-0.01em] sm:text-[34px]">Every {b.name} part we repair</h2>
          <p className="mt-2 max-w-190 text-[15px] leading-[1.7] text-[#52647F]">Every {b.name} product line: {makes}, current or obsolete.</p>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {cats.map((s) => (
              <li key={s.slug} className="max-sm:odd:last:col-span-2">
                <Link href={serviceUrl(s.slug)} className="group flex h-full flex-col items-start gap-2.5 rounded-2xl border border-[#E3EAF3] bg-white p-3.5 transition lg:flex-row lg:items-center lg:gap-3 lg:p-3 hover:-translate-y-0.5 hover:border-[#0066FF]/30 hover:shadow-[0_18px_40px_-26px_rgba(0,102,255,0.6)]">
                  {(() => {
                    const I = catIcon[s.slug] ?? Cpu;
                    return (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-[0_8px_18px_-10px_rgba(0,0,0,0.6)]" style={{ background: `linear-gradient(145deg, ${b.color}, #0B1A3C)` }}>
                        <I size={22} strokeWidth={1.8} aria-hidden="true" />
                      </span>
                    );
                  })()}
                  <span className="min-w-0 flex-1 text-[14px] font-bold leading-snug lg:text-[13.5px]">{b.name} {s.title.replace(/ Program$/, " Units")}</span>
                  <ArrowUpRight size={15} className="hidden shrink-0 text-[#005AE0] lg:block" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Series we see most ---------- */}
        <section aria-labelledby="series">
          <Eyebrow>Popular series</Eyebrow>
          <h2 id="series" className="mt-3 text-[26px] font-extrabold leading-tight tracking-[-0.01em] sm:text-[34px]">{b.name} series we see most often</h2>
          <p className="mt-2 text-[14px] text-[#52647F]">Examples only. If your {b.name} model isn&apos;t listed, we still repair it.</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {b.lines.map((l) => (
              <li key={l.t} className="flex flex-col rounded-2xl border border-[#E3EAF3] bg-white p-5">
                <h3 className="text-[16px] font-extrabold">{b.name} {l.t}</h3>
                <ul className="mt-2.5 flex flex-1 flex-wrap content-start gap-1.5">
                  {l.series.map((x) => {
                    // Series the model code decoder covers link straight to their section.
                    const fam = familyBySeries(x);
                    return fam && fam.brandSlug === b.slug ? (
                      <li key={x} className="h-fit"><Link href={`/resources/model-code-decoder#${fam.id}`} title={`Decode a ${x} model code`} className="inline-flex items-center gap-1 rounded-lg bg-[#EAF2FF] px-2.5 py-1 text-[12.5px] font-semibold text-[#0052CC] hover:bg-[#DCE9FF]">{x} <Binary size={12} aria-hidden="true" /><span className="sr-only">: decode a model code</span></Link></li>
                    ) : (
                      <li key={x} className="h-fit rounded-lg bg-[#F4F7FB] px-2.5 py-1 text-[12.5px] font-semibold text-[#52647F]">{x}</li>
                    );
                  })}
                </ul>
                <Link href={serviceUrl(l.service)} className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#005AE0]">How we repair them <ArrowRight size={14} aria-hidden="true" /></Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Fault codes ---------- */}
        {b.faultLibrary && (
          <section aria-labelledby="codes" className="relative overflow-hidden rounded-[28px] bg-[#050B18] p-6 text-white sm:p-10">
            <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(0,102,255,0.55),transparent)] blur-xl" />
            <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <Eyebrow dark>Fault code library</Eyebrow>
                <h2 id="codes" className="mt-3 text-[26px] font-extrabold leading-tight sm:text-[32px]">Showing a {b.name} fault code?</h2>
                <p className="mt-2 text-[15px] leading-[1.7] text-white/70">Look it up in plain English: what it means, common causes and safe checks.</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {b.faultLibrary.codes.map((c) => (
                    <li key={c.href}><Link href={c.href} className="inline-flex rounded-lg border border-white/15 bg-white/[0.07] px-3 py-1.5 font-mono text-[13px] font-bold text-[#7FD3FF] transition hover:border-[#7FD3FF]">{c.code}</Link></li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <Link href={b.faultLibrary.href} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-[#0B1A3C] transition hover:-translate-y-0.5">
                  All {b.faultLibrary.label} <ArrowRight size={16} aria-hidden="true" />
                </Link>
                {b.faultLibrary.more?.map((m) => (
                  <Link key={m.href} href={m.href} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/6 px-6 text-[15px] font-semibold transition hover:border-white/40">
                    {m.label} <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------- FAQ + other brands ---------- */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section aria-labelledby="faq">
            <Eyebrow>FAQ</Eyebrow>
            <h2 id="faq" className="mt-3 text-[26px] font-extrabold leading-tight tracking-[-0.01em] sm:text-[34px]">{b.name} repair questions</h2>
            <div className="mt-5 divide-y divide-[#E3EAF3] rounded-[22px] border border-[#E3EAF3] bg-white">
              {faqs.map((f, i) => (
                <details key={f.q} className="group px-5" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
                    <h3 className="text-[15px] font-bold">{f.q}</h3>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F4F7FB] text-[#005AE0] transition group-open:bg-[#0066FF] group-open:text-white"><Plus size={15} className="transition-transform group-open:rotate-45" aria-hidden="true" /></span>
                  </summary>
                  <p className="-mt-1 pb-4 pr-10 text-[14px] leading-[1.65] text-[#52647F]">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
          <aside className="space-y-3 lg:pt-15">
            <div className="rounded-[22px] border border-[#E3EAF3] bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#005AE0]">Other brands</p>
              <ul className="mt-3 space-y-1.5">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link href={brandUrl(o.slug)} className="group flex items-center gap-3 rounded-xl p-2 transition hover:bg-[#F4F7FB]">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg text-[12px] font-extrabold text-white" style={{ background: `linear-gradient(145deg, ${o.color}, #0B1A3C)` }}>{o.initials}</span>
                      <span className="flex-1 text-[14px] font-semibold">{o.name} Repair</span>
                      <ArrowRight size={15} className="text-[#005AE0] transition group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
                <li><Link href="/brands" className="block p-2 text-[13.5px] font-semibold text-[#005AE0]">All brands →</Link></li>
              </ul>
            </div>
            <Link href="/request-repair?service=question" className="group flex items-center gap-3 rounded-[22px] bg-[#050B18] p-4 text-white">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#0066FF] to-[#00B0FF]"><MessageCircleQuestion size={18} aria-hidden="true" /></span>
              <span className="flex-1"><b className="block text-[14px]">Not sure what&apos;s wrong?</b><span className="text-[12.5px] text-white/65">Ask a repair technician.</span></span>
              <ArrowRight size={16} className="text-[#7FD3FF]" aria-hidden="true" />
            </Link>
          </aside>
        </div>

        {/* ---------- Final CTA ---------- */}
        <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0047FF_0%,#0066FF_45%,#00B0FF_100%)] p-7 text-white sm:p-10">
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[26px] font-extrabold leading-tight sm:text-[32px]">{b.name} unit down? Let&apos;s get it running again.</h2>
              <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-white/85">
                {["Free evaluation", "No work without your approval", "12-month warranty"].map((t) => <span key={t} className="inline-flex items-center gap-1.5"><Check size={14} aria-hidden="true" />{t}</span>)}
              </p>
            </div>
            <div className="grid gap-3 sm:flex sm:flex-wrap lg:flex-nowrap">
              <Link href={repairHref} className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-6 text-[15px] font-semibold text-[#0B1A3C] transition hover:-translate-y-0.5"><Wrench size={17} aria-hidden="true" /> Request a Repair</Link>
              <Link href="/request-repair?service=exchange" className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/40 px-6 text-[15px] font-semibold transition hover:bg-white/10"><Zap size={17} aria-hidden="true" /> Get an Exchange Unit</Link>
              <WhatsAppCta topic={b.name} kind="brand" />
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
