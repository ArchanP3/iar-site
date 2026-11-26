import Link from "next/link";
import { ArrowRight, Globe2, PackageCheck, Plane } from "lucide-react";
import { brandFont } from "@/lib/font";
import { destinations } from "@/lib/globalRoutes";
import ShippingHub from "@/components/ShippingHub";

/* Homepage: parts ship worldwide by air. Online ordering is for the USA & Canada, repairs for the USA;
   other countries contact us for a quote. The customer pays duties, import taxes and brokerage. */
const features = [
  { icon: Plane, t: "Air Freight", d: "Priority air shipping to Mexico, Europe and Asia." },
  { icon: PackageCheck, t: "Express Courier", d: "Door-to-door delivery with FedEx, UPS and DHL." },
  { icon: Globe2, t: "Worldwide Shipping", d: "Shipping quoted per country, delivered to your plant." },
];
const steps = [
  ["Send us the part number", "With our international quote form, or by phone or email."],
  ["Get your quote", "Price, shipping charges and lead time for your country."],
  ["We ship it by air", "Duties, import taxes and brokerage are paid by you."],
];
const regions = ["North America", "Europe", "Asia"] as const;

export default function GlobalReach() {
  return (
    <section id="worldwide" aria-labelledby="worldwide-heading" className={`${brandFont.className} bg-[#FAFAFB] py-10 lg:py-14`}>
      <div className="mx-auto max-w-360 px-5 sm:px-8 lg:px-12">
        {/* Heading on white */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-195">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B30E29] sm:text-[12px]">
              <span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#C8102E] to-[#FF3B55]" />
              Global Reach
            </p>
            <h2 id="worldwide-heading" className="mt-3 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#131316] sm:text-[36px] lg:text-[40px]">
              Parts Shipped{" "}
              <span className="bg-linear-to-r from-[#C8102E] to-[#FF3B55] bg-clip-text text-transparent">Nationwide &amp; Worldwide</span>
            </h2>
            <p className="mt-3 text-[14px] leading-[1.65] text-[#62626F] sm:text-[16px]">
              Repairs are for customers in the United States. Parts ship by air from Grand Island, NY to plants across the
              USA and to Canada, Mexico, Europe and Asia. Buying from outside the USA? Send your part numbers and we quote
              price, shipping and lead time.
            </p>
          </div>
          <Link
            href="/international"
            className="group inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-xl bg-[#131316] px-5 text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-16px_rgba(19,19,22,0.8)] transition hover:-translate-y-0.5 hover:bg-[#A50D25] lg:self-auto"
          >
            Request an International Quote <ArrowRight size={16} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Dark glass box */}
        <div className="relative mt-7 overflow-hidden rounded-[28px] border border-white/10 bg-[#0A0A0C] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_40px_80px_-44px_rgba(200,16,46,0.75)]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <span className="absolute -left-32 -top-40 h-105 w-150 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.4),transparent)] blur-2xl" />
            <span className="absolute -right-24 -bottom-30 h-120 w-155 rounded-full bg-[radial-gradient(closest-side,rgba(255,59,85,0.24),transparent)] blur-2xl" />
            <span className="absolute inset-0 bg-[linear-gradient(rgba(255,138,153,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,138,153,0.045)_1px,transparent_1px)] bg-size-[44px_44px]" />
            <span className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.08)_0%,transparent_30%,transparent_70%,rgba(255,59,85,0.08)_100%)]" />
          </div>

          <div className="relative grid gap-x-10 gap-y-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:p-10">
            {/* Features */}
            <ul className="grid gap-3 sm:grid-cols-3 lg:self-end">
              {features.map(({ icon: Icon, t, d }) => (
                <li key={t} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] sm:block sm:p-4">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] shadow-[0_10px_24px_-10px_rgba(218,11,42,0.9)]"><Icon size={17} aria-hidden="true" /></span>
                  <span className="block"><span className="block text-[14.5px] font-extrabold sm:mt-3">{t}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-white/60">{d}</span></span>
                </li>
              ))}
            </ul>

            {/* Inventory photo + shipping hub */}
            <div className="relative mx-auto w-full max-w-140 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
              <ShippingHub />
            </div>

            {/* Destinations + how it works */}
            <div className="min-w-0 space-y-6 lg:self-start">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FF8A99]">Where we ship</p>
                <div className="mt-3 space-y-2.5">
                  {regions.map((r) => (
                    <div key={r} className="flex flex-wrap items-center gap-1.5">
                      <span className="w-full flex-none text-[11.5px] sm:w-28 font-semibold uppercase tracking-[0.12em] text-white/60">{r}</span>
                      {[...new Set(destinations.filter((d) => d.region === r).map((d) => d.country))].map((c) => (
                        <span key={c} className="rounded-lg border border-white/10 bg-white/6 px-2.5 py-1 text-[12.5px] font-semibold text-white/90">{c}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/4 p-4 sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FF8A99]">Ordering from outside the USA &amp; Canada</p>
                <ol className="mt-3 grid gap-3 sm:grid-cols-3">
                  {steps.map(([t, d], i) => (
                    <li key={t} className="flex gap-2.5 sm:block">
                      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#C8102E] text-[11px] font-bold">{i + 1}</span>
                      <span>
                        <span className="block text-[13.5px] font-bold sm:mt-2">{t}</span>
                        <span className="block text-[12px] leading-snug text-white/55">{d}</span>
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 border-t border-white/10 pt-3 text-[12.5px] text-white/60">
                  <Link href="/international" className="font-semibold text-[#FF8A99] hover:text-white">How international orders work</Link>.{" "}
                  In the USA or Canada? <Link href="/shop" className="font-semibold text-[#FF8A99] hover:text-white">Buy parts online</Link> or{" "}
                  <Link href="/request-repair" className="font-semibold text-[#FF8A99] hover:text-white">request a repair</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
