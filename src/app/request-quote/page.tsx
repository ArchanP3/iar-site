import Link from "next/link";
import { Suspense } from "react";
import SearchMiss from "@/components/request/SearchMiss";
import { BadgeCheck, ChevronRight, Cpu, Layers, ListPlus, Package, Plus, RefreshCw, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteForm from "@/components/request/QuoteForm";
import NextSteps from "@/components/request/NextSteps";
import { brandFont } from "@/lib/font";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/request-quote", {
  title: "Request a Quote | Drives, Motors, PLC & CNC Parts | IAR",
  description:
    "Price, condition and lead time for new, surplus, refurbished and obsolete servo drives, motors, PLCs, HMIs and CNC parts from every major brand.",
});

const quoteSteps = [
  ["Send your part number", Package],
  ["We check our stock and our supplier network", Search],
  ["You get price, condition and lead time", BadgeCheck],
  ["Tested before it ships", RefreshCw],
] as const;
const quotePoints = ["New, surplus & refurbished", "Obsolete parts sourced", "Tested before shipping", "Canada & USA"];

const tips = [
  ["Use the full part number", "Include every suffix, e.g. 6SL3120-1TE21-0AA3, not just 6SL3120.", Cpu],
  ["Add the revision", "Hardware or firmware version helps us match a drop-in replacement.", Layers],
  ["List every part", "Need several? Put the other part numbers in Notes, one quote covers all.", ListPlus],
] as const;

/* Same answers as the homepage FAQ: confirmed facts only */
const faqs = [
  ["What is the difference between new, surplus, refurbished and exchange?", "New is factory-new, in original packaging where available. Surplus is unused or lightly used stock, inspected before listing. Refurbished is repaired and refreshed by our technicians, then tested. Exchange is a tested replacement unit at a lower price: you buy it, ship us your unit, and we ship the replacement once yours arrives."],
  ["Can you find obsolete or hard-to-find parts?", "Yes. Send us the part number and our team sources it from our stock and our surplus supplier network, including discontinued parts."],
  ["Will a replacement part work in my machine?", "We match the full part number and the hardware and firmware revision, and confirm compatibility with you before shipping."],
];

const schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

export default function RequestQuotePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <main className={`${brandFont.className} min-h-screen bg-[#F7F7F8]`}>
      <PageExtras path="/request-quote" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Header />

      <section className="relative overflow-hidden bg-[#0A0A0C] pb-24 pt-8 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-105 w-140 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.5),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 h-80 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(255,59,85,0.3),transparent)] blur-2xl" />
        <div className="relative mx-auto max-w-310 px-5 sm:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-[12.5px] text-white/60">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true"><ChevronRight size={13} /></li>
              <li className="text-white/85">Request a Quote</li>
            </ol>
          </nav>
          <h1 className="mt-4 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[40px]">
            Request a <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">Quote</span>
          </h1>
          <p className="mt-2 max-w-160 text-[14.5px] leading-[1.6] text-white/75 sm:text-[16px]">
            New, surplus, refurbished and obsolete automation parts. Send the part number and get price, condition and lead time.
          </p>
        </div>
      </section>

      <div className="relative mx-auto -mt-16 grid max-w-310 gap-5 px-5 sm:px-8 lg:grid-cols-[1fr_360px]">
        <Suspense fallback={null}><SearchMiss searchParams={searchParams} /></Suspense>
        <QuoteForm />
        <NextSteps title="How quotes work" steps={quoteSteps} points={quotePoints} urgent="Choose “Urgent” and we’ll prioritise it, or ask about an exchange unit." />
      </div>

      <section aria-label="Quote tips and questions" className="mx-auto grid max-w-310 gap-5 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="text-[20px] font-extrabold text-[#131316]">Tips for a fast quote</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {tips.map(([t, d, Icon]) => (
              <li key={t} className="rounded-2xl border border-[#EAEAEC] bg-white p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C8102E]/8 text-[#B30E29]"><Icon size={17} aria-hidden="true" /></span>
                <h3 className="mt-2.5 text-[14px] font-bold text-[#131316]">{t}</h3>
                <p className="mt-0.5 text-[12.5px] leading-[1.55] text-[#646471]">{d}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-[20px] font-extrabold text-[#131316]">Quick answers</h2>
          <div className="mt-3 divide-y divide-[#EAEAEC] rounded-2xl border border-[#EAEAEC] bg-white">
            {faqs.map(([q, a], i) => (
              <details key={q} className="group px-4" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 [&::-webkit-details-marker]:hidden">
                  <h3 className="text-[13.5px] font-bold text-[#131316]">{q}</h3>
                  <Plus size={15} className="shrink-0 text-[#B30E29] transition group-open:rotate-45" aria-hidden="true" />
                </summary>
                <p className="-mt-1 pb-3 text-[12.5px] leading-[1.6] text-[#646471]">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
