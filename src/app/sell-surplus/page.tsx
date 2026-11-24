import Link from "next/link";
import { ArrowRight, ClipboardList, Cpu, FileText, HandCoins, Monitor, PackageCheck, Plus, Settings2, Zap } from "lucide-react";
import ResourceShell from "@/components/resources/ResourceShell";
import SurplusForm from "@/components/request/SurplusForm";
import NextSteps from "@/components/request/NextSteps";
import { SITE_URL } from "@/lib/site";
import { surplusFaqs } from "@/lib/faqs";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/sell-surplus", {
  title: "Sell Surplus Automation Parts | IAR Buys Surplus",
  description: "Sell surplus servo drives, motors, PLCs, HMIs and CNC parts. Send your list, get an offer, and we arrange the pickup anywhere in the USA.",
  alternates: { canonical: `${SITE_URL}/sell-surplus` },
});

const steps = [
  ["Send your part list", ClipboardList],
  ["We review it and make an offer", HandCoins],
  ["You accept, and we arrange the pickup", PackageCheck],
  ["We check the units when they arrive", FileText],
] as const;
const points = ["Single parts or full lots", "Pickup across the USA", "No obligation", "Every major brand"];

const buy = [
  [Settings2, "Servo drives & motors", "Siemens, Rexroth Indramat, Kollmorgen, Yaskawa and more"],
  [Cpu, "PLCs & I/O", "Processors, I/O cards, power supplies, communication modules"],
  [Monitor, "HMIs & operator panels", "Touch panels, keypads, industrial PCs"],
  [Zap, "CNC & VFDs", "CNC controls, spindle drives, variable frequency drives"],
] as const;

const faqs: [string, string][] = surplusFaqs.map((f) => [f.q, f.a]);

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Service", name: "Surplus industrial automation parts buying", serviceType: "Surplus equipment purchase", url: `${SITE_URL}/sell-surplus`, areaServed: [{ "@type": "Country", name: "United States" }], provider: { "@type": "Organization", name: "Industrial Automation Repair Inc.", url: SITE_URL } },
    { "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ],
};

export default function SellSurplusPage() {
  return (
    <ResourceShell crumb={[{ label: "Shop", href: "/shop" }, { label: "Sell Your Surplus" }]} title="Sell Your" accent="Surplus"
      text="Spare drives on the shelf? A line being removed? Sell surplus automation parts to IAR: send us the list and we make an offer on parts from every major brand, then arrange the pickup anywhere in the USA." schema={schema}>
      <PageExtras path="/sell-surplus" />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <SurplusForm />
        <NextSteps title="How selling works" steps={steps} points={points} urgentTitle="Clearing space on a deadline?" urgent="Add the date in the notes and we plan around it." />
      </div>

      <section aria-labelledby="buy" className="mt-12">
        <h2 id="buy" className="text-[24px] font-extrabold tracking-[-0.015em] sm:text-[28px]">What we buy</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {buy.map(([Icon, t, d]) => (
            <li key={t} className="rounded-[22px] border border-[#EAEAEC] bg-white p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C8102E]/8 text-[#B30E29]"><Icon size={20} aria-hidden="true" /></span>
              <h3 className="mt-3 text-[15.5px] font-extrabold">{t}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[#62626F]">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq" className="mt-12 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 id="faq" className="text-[24px] font-extrabold tracking-[-0.015em] sm:text-[28px]">Questions about selling</h2>
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
        <div className="self-start rounded-[22px] border border-[#EAEAEC] bg-white p-5">
          <p className="text-[15px] font-extrabold">Buying, not selling?</p>
          <p className="mt-1 text-[13.5px] text-[#62626F]">Search new, surplus and refurbished parts, or make an offer on a bulk order.</p>
          <Link href="/shop" className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#A50D25] hover:underline">Shop parts <ArrowRight size={14} aria-hidden="true" /></Link>
          <Link href="/request-quote?offer=1" className="mt-1 flex items-center gap-1.5 text-[13.5px] font-semibold text-[#A50D25] hover:underline">Make an offer <ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
      </section>
    </ResourceShell>
  );
}
