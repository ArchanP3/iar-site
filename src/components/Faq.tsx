"use client";

import Link from "next/link";
import { brandFont } from "@/lib/font";
import { faqGroups } from "@/lib/faqs";
import { useState } from "react";
import { ArrowRight, MessageCircleQuestion, Plus, Wrench } from "lucide-react";

/* Questions live in src/lib/faqs.ts (also used by /resources/faqs) */
const groups = faqGroups;

const schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: groups.flatMap((g) => g.items).map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function Faq() {
  const [tab, setTab] = useState("repairs");
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <section id="faq" aria-labelledby="faq-heading" className={`${brandFont.className} bg-[#FAFAFB] py-10 lg:py-12`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="mx-auto grid max-w-360 gap-5 px-5 sm:px-8 lg:grid-cols-[340px_1fr] lg:gap-12 lg:px-12">
        {/* Left: heading + topic tabs */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B30E29] sm:text-[12px]">
            <span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#C8102E] to-[#FF3B55]" />
            FAQ
          </p>
          <h2 id="faq-heading" className="mt-3 text-[28px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#131316] sm:text-[34px]">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-[14px] leading-[1.6] text-[#62626F] sm:text-[15px]">
            {total} straight answers about industrial repair, parts, shipping and warranty.
          </p>

          <div role="tablist" aria-label="FAQ topics" className="mt-4 flex gap-1 rounded-xl border border-[#E3E3E7] bg-white p-1 lg:flex-col">
            {groups.map((g) => (
              <button
                key={g.key}
                type="button"
                role="tab"
                aria-selected={tab === g.key}
                onClick={() => setTab(g.key)}
                className={`flex flex-1 items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-semibold transition sm:text-[14px] ${
                  tab === g.key ? "bg-[#C8102E]/[0.07] text-[#B30E29] shadow-[0_4px_12px_-6px_rgba(200,16,46,0.45)]" : "text-[#62626F] hover:text-[#131316]"
                }`}
              >
                <span>
                  <span className="sm:hidden">{g.short ?? g.label}</span>
                  <span className="hidden sm:inline">{g.label}</span>
                </span>
                <span className={`hidden rounded-md px-1.5 text-[11px] lg:inline ${tab === g.key ? "bg-[#C8102E]/10" : "bg-[#F5F5F6]"}`}>{g.items.length}</span>
              </button>
            ))}
          </div>

          <Link
            href="/request-repair?service=question"
            className="group mt-4 hidden items-center gap-3 rounded-2xl bg-[#060607] p-3.5 text-white lg:flex"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55]">
              <MessageCircleQuestion size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold">Still have a question?</span>
              <span className="block text-[12.5px] text-white/65">Ask a repair technician.</span>
            </span>
            <ArrowRight size={16} className="text-[#FF8A99] transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Right: questions (all tabs stay in the page for Google) */}
        <div>
          {groups.map((g) => (
            <div
              key={g.key}
              role="tabpanel"
              className={`divide-y divide-[#EAEAEC] rounded-2xl border border-[#EAEAEC] bg-white ${tab === g.key ? "" : "hidden"}`}
            >
              {g.items.map((f, i) => (
                <details key={f.q} className="group px-4 sm:px-5" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 text-left [&::-webkit-details-marker]:hidden">
                    <h3 className="text-[14.5px] font-bold leading-snug text-[#131316] sm:text-[15.5px]">{f.q}</h3>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F6] text-[#B30E29] ring-1 ring-[#EAEAEC] transition group-open:bg-[#C8102E] group-open:text-white group-open:ring-[#C8102E]">
                      <Plus size={15} className="transition-transform group-open:rotate-45" />
                    </span>
                  </summary>
                  <p className="-mt-0.5 pb-3.5 pr-10 text-[13.5px] leading-[1.65] text-[#62626F] sm:text-[14.5px]">{f.a}</p>
                </details>
              ))}
            </div>
          ))}
          <Link href="/request-repair?service=question" className="mt-3 flex items-center justify-between rounded-xl border border-[#EAEAEC] px-4 py-3 text-[13.5px] lg:hidden">
            <span className="font-semibold text-[#131316]">Still have a question?</span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#B30E29]">
              <Wrench size={14} /> Ask a technician
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
