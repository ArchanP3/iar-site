import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DowntimeCalculator from "@/components/resources/DowntimeCalculator";
import { brandFont } from "@/lib/font";
import { SITE_URL } from "@/lib/site";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/resources/downtime-calculator", {
  title: "Downtime Cost Calculator: Repair vs New | AutomIQ",
  description: "Work out what a failed servo drive, motor or control costs you while you wait, and how much a 24–72 hr repair or an exchange unit saves. Free PDF summary.",
  alternates: { canonical: `${SITE_URL}/resources/downtime-calculator` },
});

const faqs = [
  ["How is the downtime cost calculated?", "Cost per hour of downtime × production hours lost. Production hours lost = days the line is down × production hours per day × production days per week ÷ 7, so weekends and idle shifts are not counted."],
  ["What repair time does the calculator use?", "72 hours, the top of our typical 24 to 72 hour turnaround once you approve the quote, plus the shipping time you enter, each way. Turnaround times are typical, not guaranteed."],
  ["How does an exchange unit cut downtime?", "You get a tested unit without waiting for your own unit to be repaired. Send us your failed unit and we usually ship the replacement within 1–2 business days of receiving it. Need it before you send yours? Contact us and we explain the options and pricing."],
  ["What should I include in my cost per hour?", "Lost production or margin per hour, idle labour, overtime to catch up, expedite fees and any late-delivery penalties. If you are unsure, start with lost output per hour."],
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Downtime Cost Calculator",
      url: `${SITE_URL}/resources/downtime-calculator`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      provider: { "@type": "Organization", name: "AutomIQ Automation & Drive Services", url: SITE_URL },
    },
    { "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Resources", item: `${SITE_URL}/resources` },
        { "@type": "ListItem", position: 3, name: "Downtime Cost Calculator", item: `${SITE_URL}/resources/downtime-calculator` },
      ],
    },
  ],
};

export default function DowntimeCalculatorPage() {
  return (
    <main className={`${brandFont.className} min-h-screen bg-[#F7F7F8] text-[#131316]`}>
      <PageExtras path="/resources/downtime-calculator" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <Header />
      <section className="relative overflow-hidden bg-[#0A0A0C] pb-24 pt-8 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-105 w-140 rounded-full bg-[radial-gradient(closest-side,rgba(200, 16, 46,0.5),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 h-80 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(248,113,113,0.25),transparent)] blur-2xl" />
        <div className="relative mx-auto max-w-310 px-5 sm:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-[12.5px] text-white/60">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true"><ChevronRight size={13} /></li>
              <li><Link href="/resources" className="hover:text-white">Resources</Link></li>
              <li aria-hidden="true"><ChevronRight size={13} /></li>
              <li className="text-white/85">Downtime Cost Calculator</li>
            </ol>
          </nav>
          <h1 className="mt-4 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[44px]">
            What is downtime <span className="bg-linear-to-r from-[#FCA5A5] to-[#FB923C] bg-clip-text text-transparent">really costing you?</span>
          </h1>
          <p className="mt-3 max-w-170 text-[14.5px] leading-[1.65] text-white/75 sm:text-[16px]">
            Enter your own numbers and compare waiting for a new unit with a 24–72 hr repair or an exchange unit. Download the result as a PDF for your manager.
          </p>
        </div>
      </section>

      <div className="relative mx-auto -mt-14 max-w-310 px-5 pb-14 sm:px-8">
        <DowntimeCalculator />

        <section aria-labelledby="dc-faq" className="mt-12 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <h2 id="dc-faq" className="text-[24px] font-extrabold tracking-[-0.015em] sm:text-[28px]">How this calculator works</h2>
            <div className="mt-5 divide-y divide-[#EAEAEC] overflow-hidden rounded-[22px] border border-[#EAEAEC] bg-white">
              {faqs.map(([q, a]) => (
                <details key={q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-bold">
                    {q}
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-[#F5F5F6] text-[#B30E29] transition group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-[#62626F]">{a}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="rounded-[22px] border border-[#EAEAEC] bg-white p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B30E29]">Every repair includes</p>
            <ul className="mt-3 space-y-2.5 text-[14px] text-[#4E4E58]">
              {["Free evaluation", "Written quote before any work starts", "Tested on our own jigs", "Test report with every unit", "12-month warranty on repairs"].map((x) => (
                <li key={x} className="flex gap-2"><span className="mt-1.75 h-1.5 w-1.5 flex-none rounded-full bg-[#FF3B55]" aria-hidden="true" />{x}</li>
              ))}
            </ul>
            <Link href="/request-repair" className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#131316] text-[14px] font-semibold text-white hover:bg-[#C8102E]">Request a Repair</Link>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
