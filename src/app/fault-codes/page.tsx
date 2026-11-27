import Link from "next/link";
import { AlertTriangle, ArrowRight, Phone, Wrench } from "lucide-react";
import FaultCodeSearch from "@/components/fault-codes/FaultCodeSearch";
import { Breadcrumbs, JsonLd, LibraryShell, SafetyNote, breadcrumbSchema } from "@/components/fault-codes/LibraryShell";
import { codeUrl, families, familyUrl, popularEntries, totalCodes, totalGuides } from "@/lib/faultCodes";
import { PageExtras, seo } from "@/lib/cms/seo";
import { SITE_URL } from "@/lib/site";

export const generateMetadata = seo("/fault-codes", {
  title: "Servo Fault Code Guide | Drive & CNC Fault Codes | IAR",
  description: `A servo fault code guide with ${totalCodes.toLocaleString("en-US")} drive, spindle and power supply codes: SINAMICS, FANUC αi, Indramat DKC, Kinetix 6000 and Yaskawa.`,
});

const commonFaults = [
  {
    t: "Servo drive overcurrent fault",
    d: "The drive saw more current than it allows and shut down to protect itself. Common causes are a shorted motor winding, a damaged motor cable, a failed output transistor (IGBT) in the drive, or a load that has jammed. Check the motor and cable with an insulation tester before resetting. If the fault returns with the motor disconnected, the drive itself needs repair.",
  },
  {
    t: "Servo motor encoder error",
    d: "The drive lost or doubted the motor’s position signal. Look first at the encoder cable and connectors, then at the encoder itself. A replaced encoder must be aligned to the motor before it will run smoothly, which we do on the matching drive.",
  },
  {
    t: "Servo motor overheating",
    d: "A motor that runs hot is usually overloaded, short on cooling, dragging a worn bearing or brake, or has windings that are starting to break down. Our free evaluation finds the cause, and we test every repaired motor under load before it ships.",
  },
];

const crumbs = [{ label: "Home", href: "/" }, { label: "Fault Codes" }];

export default function FaultCodesPage() {
  const pop = popularEntries();
  return (
    <LibraryShell>
      <PageExtras path="/fault-codes" />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Servo drive and CNC fault code library",
          description: "Fault codes for servo drives, spindle amplifiers and power supplies, explained by Industrial Automation Repair Inc. repair technicians.",
          publisher: { "@type": "Organization", name: "Industrial Automation Repair Inc." },
          hasPart: families.map((f) => ({ "@type": "WebPage", name: `${f.short} fault codes`, url: `${SITE_URL}${familyUrl(f)}` })),
        }}
      />

      {/* ---------- Top: heading + search ---------- */}
      <section className="relative bg-[linear-gradient(150deg,#131316_0%,#1B1B1F_60%,#151518_100%)] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="absolute -right-40 -top-40 h-130 w-130 rounded-full bg-[radial-gradient(circle,rgba(200,16,46,0.45),transparent_65%)]" />
          <span className="absolute inset-0 bg-[linear-gradient(rgba(255,138,153,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,138,153,0.05)_1px,transparent_1px)] bg-size-[44px_44px]" />
        </div>
        <div className="relative mx-auto max-w-310 px-5 pb-12 pt-8 sm:px-8 lg:pb-14">
          <Breadcrumbs items={crumbs} dark />
          <p className="mt-6 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.28em] text-[#FF5A6E]">
            <span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#C8102E] to-[#FF3B55]" /> Fault Code Library
          </p>
          <h1 className="mt-3 max-w-205 text-[30px] font-extrabold leading-[1.08] tracking-[-0.02em] sm:text-[46px]">
            Servo Drive &amp; CNC Fault Codes,{" "}
            <span className="bg-linear-to-r from-[#FF5A6E] to-[#FF3B55] bg-clip-text text-transparent">Explained by Repair Technicians</span>
          </h1>
          <p className="mt-4 max-w-175 text-[15px] leading-[1.65] text-white/70 sm:text-[15.5px]">
            Our servo fault code guide covers the drive families we see most — SINAMICS S120, SIMODRIVE 611, FANUC alpha i, Indramat DKC and Kinetix: what the alarm means, what to check first and when the unit needs the bench, from a servo drive overcurrent fault to a servo motor encoder error or servo motor overheating.
          </p>
          <div className="mt-7 max-w-190">
            <FaultCodeSearch size="lg" button="Search" readUrl placeholder="Enter a fault code or name, e.g. F30001, SV0449, overcurrent" />
          </div>
          <dl className="mt-8 grid max-w-190 grid-cols-3 gap-2.5 sm:gap-3">
            {[
              [totalCodes.toLocaleString("en-US"), "Fault codes"],
              [String(new Set(families.map((f) => f.brand)).size), "Brands"],
              [String(totalGuides), "Technician guides"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 sm:px-4">
                <dt className="sr-only">{l}</dt>
                <dd className="text-[20px] font-extrabold sm:text-[24px]">{n}</dd>
                <dd className="text-[11.5px] text-white/60 sm:text-[12px]">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-310 px-5 py-10 sm:px-8 lg:py-12">
        {/* ---------- Brands ---------- */}
        <h2 className="text-[24px] font-extrabold tracking-[-0.02em] sm:text-[30px]">Browse by brand</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {families.map((f) => (
            <li key={f.seriesSlug} className="min-w-0">
              <Link
                href={familyUrl(f)}
                className="group flex items-center gap-4 rounded-2xl border border-[#EAEAEC] bg-[#FAFAFB] p-4 transition hover:-translate-y-0.5 hover:border-[#C8102E]/30 hover:bg-white hover:shadow-[0_18px_40px_-24px_rgba(200,16,46,0.6)]"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-[18px] font-extrabold text-white shadow-[0_10px_22px_-10px_rgba(200,16,46,0.8)]">
                  {f.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] font-extrabold">{f.brand}</span>
                  <span className="block line-clamp-2 text-[13px] text-[#62626F]">{f.series}</span>
                </span>
                <span className="text-right">
                  <span className="block text-[18px] font-extrabold text-[#B30E29]">{f.codes.length.toLocaleString("en-US")}</span>
                  <span className="block text-[11px] text-[#646471]">codes</span>
                </span>
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-4 rounded-2xl border border-dashed border-[#D6D6DB] p-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#131316] text-white">
              <Phone size={20} aria-hidden="true" />
            </span>
            <p className="text-[13.5px] leading-snug text-[#62626F]">
              <b className="text-[#131316]">Drive not listed?</b>{" "}
              <Link href="/request-repair?service=question" className="font-semibold text-[#B30E29] hover:underline">
                Send us the code and model.
              </Link>{" "}
              A technician will tell you what it means.
            </p>
          </li>
        </ul>

        {/* ---------- Most searched ---------- */}
        <h2 className="mt-12 text-[24px] font-extrabold tracking-[-0.02em] sm:text-[30px]">Most searched fault codes</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pop.map(({ f, c }) => (
            <li key={f.seriesSlug + c.code}>
              <Link
                href={codeUrl(f, c)}
                className="group flex h-full flex-col rounded-2xl border border-[#EAEAEC] bg-white p-4 transition hover:border-[#C8102E]/40 hover:shadow-[0_18px_40px_-26px_rgba(200,16,46,0.6)]"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2 py-0.5 font-mono text-[13.5px] font-bold text-amber-700">
                    <AlertTriangle size={13} aria-hidden="true" />
                    {c.code}
                  </span>
                  <span className="text-[11.5px] font-semibold text-[#646471]">{f.short}</span>
                </span>
                <span className="mt-3 text-[15px] font-bold leading-snug">{c.name}</span>
                <span className="mt-1 text-[12.5px] text-[#62626F]">{c.area}</span>
                <span className="mt-auto inline-flex items-center gap-1 pt-3 text-[13px] font-semibold text-[#B30E29]">
                  Read the guide <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* ---------- Common faults (symptom searches) ---------- */}
        <section aria-labelledby="common-faults" className="mt-12">
          <h2 id="common-faults" className="text-[24px] font-extrabold tracking-[-0.02em] sm:text-[30px]">Common servo faults and what they usually mean</h2>
          <ul className="mt-5 grid gap-3 lg:grid-cols-3">
            {commonFaults.map((f) => (
              <li key={f.t} className="flex flex-col rounded-2xl border border-[#EAEAEC] bg-white p-5">
                <h3 className="text-[17px] font-extrabold">{f.t}</h3>
                <p className="mt-2 flex-1 text-[14px] leading-[1.65] text-[#4A4A55]">{f.d}</p>
                <Link href="/request-repair" className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#B30E29]">
                  Send us the part number for a free evaluation <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Repair + safety ---------- */}
        <div className="mt-12 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col justify-between gap-5 rounded-[22px] bg-[linear-gradient(135deg,#C8102E,#FF3B55)] p-6 text-white sm:flex-row sm:items-center">
            <div>
              <p className="text-[22px] font-extrabold">Fault won&apos;t clear?</p>
              <p className="mt-1 text-[14.5px] text-white/85">
                Send the unit in for a free evaluation, component-level repair and load testing.
              </p>
            </div>
            <Link
              href="/request-repair"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-[#131316] transition hover:-translate-y-0.5"
            >
              <Wrench size={17} aria-hidden="true" /> Start a Repair
            </Link>
          </div>
          <SafetyNote />
        </div>
      </div>
    </LibraryShell>
  );
}
