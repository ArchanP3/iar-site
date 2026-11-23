import Link from "next/link";
import { MessageSquare, Wrench } from "lucide-react";
import ResourceShell from "@/components/resources/ResourceShell";
import FaqHub from "@/components/resources/FaqHub";
import { faqGroups, moreFaqGroups } from "@/lib/faqs";
import { SITE_URL } from "@/lib/site";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/resources/faqs", {
  title: "FAQs: Repairs, Parts, Exchange, Shipping & Warranty | AutomIQ",
  description: "Answers about servo drive and motor repair, parts, exchange units, shipping to the USA, warranty and returns, from the AutomIQ repair team.",
  alternates: { canonical: `${SITE_URL}/resources/faqs` },
});

const groups = [...faqGroups, ...moreFaqGroups];

const schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  url: `${SITE_URL}/resources/faqs`,
  mainEntity: groups.flatMap((g) => g.items).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function FaqsPage() {
  return (
    <ResourceShell crumb={[{ label: "Resources", href: "/resources" }, { label: "FAQs" }]} title="Frequently asked" accent="questions"
      text="Repairs, parts, exchange units, orders, shipping, customs and warranty: every common question in one place." schema={schema}>
      <PageExtras path="/resources/faqs" />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <FaqHub groups={groups} />
        <aside className="space-y-3 lg:sticky lg:top-28">
          <div className="relative overflow-hidden rounded-[22px] bg-[#050B18] p-6 text-white">
            <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(closest-side,rgba(0,102,255,0.55),transparent)] blur-xl" />
            <p className="relative text-[17px] font-extrabold">Still have a question?</p>
            <p className="relative mt-1 text-[13.5px] leading-relaxed text-white/70">Ask a technician. Send the part number and what the machine is doing.</p>
            <Link href="/request-repair?service=question" className="relative mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-[14px] font-semibold text-[#0B1A3C]">
              <Wrench size={16} aria-hidden="true" /> Ask a Technician
            </Link>
            <Link href="/contact" className="relative mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/20 text-[14px] font-semibold">
              <MessageSquare size={16} aria-hidden="true" /> Contact us
            </Link>
          </div>
          <div className="rounded-[22px] border border-[#E3EAF3] bg-white p-5 text-[13.5px]">
            <p className="font-extrabold">Related</p>
            <ul className="mt-2 space-y-1.5">
              {[["How to Ship Us a Unit", "/resources/shipping"], ["Warranty", "/warranty"], ["Terms & Conditions", "/terms"], ["Glossary", "/resources/glossary"]].map(([t, h]) => (
                <li key={h}><Link href={h} className="font-semibold text-[#0052CC] hover:underline">{t}</Link></li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </ResourceShell>
  );
}
