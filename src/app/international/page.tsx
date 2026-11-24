import Link from "next/link";
import { ArrowRight, BadgeCheck, ClipboardList, FileText, Globe2, Landmark, MailCheck, PackageCheck, Plane, Plus, ShoppingCart, Truck, Wrench } from "lucide-react";
import ResourceShell from "@/components/resources/ResourceShell";
import InternationalQuoteForm from "@/components/request/InternationalQuoteForm";
import RouteGlobe from "@/components/globe/RouteGlobe";
import { destinations, origin } from "@/lib/globalRoutes";
import { SITE_URL } from "@/lib/site";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/international", {
  title: "International Parts Orders | Servo Drives & Motors | IAR",
  description: "Servo drives, motors, PLCs and CNC parts shipped by air from the USA. Get price, shipping and lead time for your country.",
  alternates: { canonical: `${SITE_URL}/international` },
});

const abroad = destinations.filter((d) => d.country !== "USA");
const routes = abroad.map((d) => ({ id: d.id, to: d.at, label: d.city }));
const regions = [
  ["North America", abroad.filter((d) => d.region === "North America")],
  ["Europe", abroad.filter((d) => d.region === "Europe")],
  ["Asia", abroad.filter((d) => d.region === "Asia")],
] as const;

const steps = [
  ["Send your part numbers", ClipboardList],
  ["We quote price, shipping and lead time", FileText],
  ["You confirm and pay the invoice", MailCheck],
  ["We ship by air to your plant", Plane],
] as const;

const good = [
  [Plane, "Air freight & express courier", "Shipped by air with DHL, FedEx or UPS, or on your own courier account."],
  [FileText, "Commercial invoice included", "Every shipment travels with a commercial invoice for your customs clearance."],
  [Landmark, "Duties & import charges", "You pay all duties, import taxes, brokerage and other import charges in your country."],
  [BadgeCheck, "Tested before it ships", "Refurbished units are load tested on OEM-standard equipment before they leave our bench."],
] as const;

const faqs: [string, string][] = [
  ["Which countries do you ship to?", "We ship industrial automation parts by air to Mexico, Europe and Asia, including the United Kingdom, France, Germany, Spain, Italy, Japan, South Korea, India and Singapore. For other countries, send a quote request and we will tell you what is possible."],
  ["Why can't I check out online from my country?", "Online checkout is for the USA and Canada. Shipping charges, lead times and customs rules change by country, so we quote international orders individually."],
  ["Who pays duties and import taxes?", "You do. All duties, import taxes, brokerage fees and other import charges in your country are paid by the buyer."],
  ["How long does international shipping take?", "Parts usually ship from us in 1–2 business days; some units take 5–10 business days to test, prepare or bring in from our warehouse. Transit time depends on your country and courier, and we include it in your quote."],
  ["Can you repair units from outside the USA?", "Our repair service is for customers in the USA. Elsewhere we supply parts, including refurbished units load tested on OEM-standard equipment."],
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "International industrial automation parts supply",
      serviceType: "Industrial automation parts export",
      url: `${SITE_URL}/international`,
      areaServed: [...new Set(abroad.map((d) => d.country))].map((c) => ({ "@type": "Country", name: c })),
      provider: { "@type": "Organization", name: "Industrial Automation Repair Inc.", url: SITE_URL, address: { "@type": "PostalAddress", addressLocality: "Grand Island", addressRegion: "NY", addressCountry: "US" } },
    },
    { "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ],
};

export default function InternationalPage() {
  return (
    <ResourceShell crumb={[{ label: "International Orders" }]} title="Parts Shipped" accent="Worldwide"
      text="Industrial automation parts shipped by air from Grand Island, New York. Send us your part numbers and we quote the price, shipping and lead time for your country. Repairs are for customers in the USA only." schema={schema}>
      <PageExtras path="/international" />

      {/* For USA & Canada buyers */}
      <div className="flex flex-col gap-3 rounded-[22px] border border-[#DDDDE1] bg-white p-4 shadow-[0_24px_60px_-45px_rgba(165,13,37,0.6)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[#C8102E]/8 text-[#B30E29]"><ShoppingCart size={19} aria-hidden="true" /></span>
          <div>
            <p className="text-[15px] font-extrabold">In the USA or Canada? You don&apos;t need a quote.</p>
            <p className="text-[13.5px] text-[#62626F]">Buy parts online with Buy Now and check out directly, or request a repair.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/shop" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#131316] px-4 text-[13.5px] font-semibold text-white hover:bg-[#A50D25]"><ShoppingCart size={15} aria-hidden="true" /> Shop Parts</Link>
          <Link href="/request-repair" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#E3E3E7] px-4 text-[13.5px] font-semibold hover:border-[#C8102E] hover:text-[#A50D25]"><Wrench size={15} aria-hidden="true" /> Request a Repair</Link>
        </div>
      </div>

      {/* Form + how it works */}
      <div id="quote" className="mt-6 grid scroll-mt-28 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <InternationalQuoteForm />
        <aside className="space-y-3 lg:sticky lg:top-28">
          <div className="relative overflow-hidden rounded-[24px] bg-[#0A0A0C] p-6 text-white">
            <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.55),transparent)] blur-xl" />
            <p className="relative text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF8A99]">How international orders work</p>
            <ol className="relative mt-4 space-y-3.5">
              {steps.map(([t, Icon], i) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15"><Icon size={16} className="text-[#FF8A99]" aria-hidden="true" /></span>
                  <span className="text-[13.5px] font-semibold"><span className="mr-1.5 text-white/60">0{i + 1}</span>{t}</span>
                </li>
              ))}
            </ol>
            <ul className="relative mt-5 grid grid-cols-2 gap-2 border-t border-white/10 pt-4 text-[12px] text-white/75">
              {["Shipped by air", "Quote per country", "No payment to quote", "Every major brand"].map((p) => (
                <li key={p} className="flex items-center gap-1.5"><BadgeCheck size={13} className="flex-none text-[#34D399]" aria-hidden="true" />{p}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[22px] border border-[#FDE68A] bg-[#FFFBEB] p-5">
            <p className="flex items-center gap-2 text-[14px] font-extrabold text-[#3D2F0A]"><Landmark size={16} className="text-[#B45309]" aria-hidden="true" /> Import charges</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#78350F]">All duties, import taxes, brokerage and other import charges in your country are paid by you. Shipping charges vary by country and are shown in your quote.</p>
          </div>
        </aside>
      </div>

      {/* Where we ship */}
      <section aria-labelledby="where" className="relative mt-12 overflow-hidden rounded-[28px] border border-white/10 bg-[#0A0A0C] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_40px_80px_-44px_rgba(200,16,46,0.75)]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="absolute -left-32 -top-40 h-105 w-150 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.4),transparent)] blur-2xl" />
          <span className="absolute inset-0 bg-[linear-gradient(rgba(255,138,153,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,138,153,0.045)_1px,transparent_1px)] bg-size-[44px_44px]" />
        </div>
        <div className="relative grid items-center gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:p-10">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF8A99]"><Globe2 size={15} aria-hidden="true" /> Where we ship</p>
            <h2 id="where" className="mt-2 text-[26px] font-extrabold leading-tight sm:text-[32px]">From Grand Island, NY to plants across three continents</h2>
            <div className="mt-6 space-y-4">
              {regions.map(([r, list]) => (
                <div key={r}>
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white/60">{r}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[...new Set(list.map((d) => d.country))].map((c) => (
                      <span key={c} className="rounded-lg border border-white/10 bg-white/6 px-2.5 py-1 text-[13px] font-semibold">{c}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[13px] text-white/60">Country not listed? Send a quote request and we will tell you what is possible.</p>
          </div>
          <div className="mx-auto w-full max-w-130">
            <RouteGlobe origin={origin.at} routes={routes} fallbackSrc="/globe/globe-still.webp" fallbackAlt="Globe showing air routes from Grand Island, New York to Canada, Mexico, Europe and Asia" />
            <p className="-mt-2 text-center text-[11.5px] text-white/60">Routes are illustrative, not live shipment tracking.</p>
          </div>
        </div>
      </section>

      {/* Good to know */}
      <section aria-labelledby="know" className="mt-12">
        <h2 id="know" className="text-[24px] font-extrabold tracking-[-0.015em] sm:text-[28px]">Good to know before you order</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {good.map(([Icon, t, d]) => (
            <li key={t} className="rounded-[22px] border border-[#EAEAEC] bg-white p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C8102E]/8 text-[#B30E29]"><Icon size={20} aria-hidden="true" /></span>
              <h3 className="mt-3 text-[15.5px] font-extrabold">{t}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[#62626F]">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section aria-labelledby="ifaq" className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <h2 id="ifaq" className="text-[24px] font-extrabold tracking-[-0.015em] sm:text-[28px]">International questions</h2>
          <div className="mt-4 divide-y divide-[#EAEAEC] overflow-hidden rounded-[22px] border border-[#EAEAEC] bg-white">
            {faqs.map(([q, a], i) => (
              <details key={q} className="group px-5 py-4" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                  <h3 className="text-[15px] font-bold">{q}</h3>
                  <Plus size={16} className="flex-none text-[#B30E29] transition group-open:rotate-45" aria-hidden="true" />
                </summary>
                <p className="mt-2 text-[14px] leading-relaxed text-[#62626F]">{a}</p>
              </details>
            ))}
          </div>
        </div>
        <div className="self-start rounded-[22px] bg-linear-to-br from-[#131316] to-[#5E0D1A] p-6 text-white">
          <Truck size={22} className="text-[#FF8A99]" aria-hidden="true" />
          <p className="mt-3 text-[18px] font-extrabold">Ready for a quote?</p>
          <p className="mt-1 text-[13.5px] text-white/70">Send your part numbers. No payment until you confirm the quote.</p>
          <a href="#quote" className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-[14px] font-semibold text-[#131316]">Request a Quote <ArrowRight size={15} aria-hidden="true" /></a>
          <p className="mt-4 flex items-center gap-1.5 text-[12.5px] text-white/60"><PackageCheck size={14} aria-hidden="true" /> <Link href="/resources/shipping" className="hover:text-white">Shipping guide</Link></p>
        </div>
      </section>
    </ResourceShell>
  );
}
