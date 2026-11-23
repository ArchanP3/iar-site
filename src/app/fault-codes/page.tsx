import Link from "next/link";
import { AlertTriangle, ArrowRight, Phone, Wrench } from "lucide-react";
import FaultCodeSearch from "@/components/fault-codes/FaultCodeSearch";
import { Breadcrumbs, JsonLd, LibraryShell, SafetyNote, breadcrumbSchema } from "@/components/fault-codes/LibraryShell";
import { codeUrl, families, familyUrl, popularEntries, totalCodes, totalGuides } from "@/lib/faultCodes";
import { PageExtras, seo } from "@/lib/cms/seo";
import { SITE_URL } from "@/lib/site";

export const generateMetadata = seo("/fault-codes", {
  title: "Servo Drive & CNC Fault Codes Explained | IAR",
  description: `Look up ${totalCodes.toLocaleString("en-US")} servo drive, spindle amplifier and power supply fault codes: SINAMICS, Fanuc αi, Indramat DKC, Kinetix 6000 and Yaskawa SGDH.`,
});

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
            Look up your alarm, see what it means and the likely cause, then decide: reset it, fix it on site, or send the unit in for repair.
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
