"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import type { Term } from "@/lib/glossary";

export default function GlossaryList({ terms }: { terms: Term[] }) {
  const [q, setQ] = useState("");
  const t = q.trim().toLowerCase();
  const list = t ? terms.filter((x) => `${x.term} ${x.def}`.toLowerCase().includes(t)) : terms;
  const letters = [...new Set(terms.map((x) => x.term[0].toUpperCase()))];
  const groups = letters.map((l) => [l, list.filter((x) => x.term[0].toUpperCase() === l)] as const).filter(([, g]) => g.length);

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-[22px] border border-[#E3EAF3] bg-white p-3 shadow-[0_30px_60px_-45px_rgba(11,26,60,0.5)] sm:flex-row sm:items-center sm:p-4">
        <label className="flex flex-1 items-center gap-2 rounded-xl border border-[#D9E4F1] bg-[#F9FBFE] px-4 focus-within:border-[#0066FF] focus-within:bg-white">
          <Search size={17} className="text-[#005AE0]" aria-hidden="true" />
          <span className="sr-only">Search the glossary</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${terms.length} terms, e.g. encoder`} className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-[#5B6B84]" />
        </label>
        <nav aria-label="Jump to letter" className="flex flex-wrap gap-1">
          {letters.map((l) => (
            <a key={l} href={`#g-${l}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-[13px] font-bold text-[#4A5B76] transition hover:bg-[#0066FF] hover:text-white">{l}</a>
          ))}
        </nav>
      </div>

      {groups.map(([l, g]) => (
        <section key={l} id={`g-${l}`} aria-label={`Terms starting with ${l}`} className="mt-8 scroll-mt-28">
          <h2 className="flex items-center gap-3 text-[22px] font-extrabold">{l}<span className="h-px flex-1 bg-[#E3EAF3]" aria-hidden="true" /></h2>
          <dl className="mt-4 grid gap-3 md:grid-cols-2">
            {g.map((x) => (
              <div key={x.slug} id={x.slug} className="scroll-mt-28 rounded-2xl border border-[#E3EAF3] bg-white p-5 target:border-[#0066FF] target:ring-4 target:ring-[#0066FF]/10">
                <dt className="text-[16px] font-extrabold">{x.term}</dt>
                <dd className="mt-1.5 text-[14px] leading-relaxed text-[#52647F]">{x.def}</dd>
                {x.link && (
                  <dd className="mt-3">
                    <Link href={x.link[1]} className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0052CC]">
                      {x.link[0]} <ArrowRight size={13} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </section>
      ))}
      {!list.length && <p className="mt-8 rounded-2xl border border-dashed border-[#C9D7E8] bg-white p-6 text-[14.5px] text-[#52647F]">No term matches that yet. <Link href="/contact" className="font-semibold text-[#0052CC] hover:underline">Ask us</Link> and we&apos;ll explain it.</p>}
    </div>
  );
}
