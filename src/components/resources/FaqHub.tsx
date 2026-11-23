"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import type { FaqGroup } from "@/lib/faqs";

/* Every FAQ in one place: search box + category chips. All answers are in the HTML for Google. */
export default function FaqHub({ groups }: { groups: FaqGroup[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const t = q.trim().toLowerCase();
  const shown = useMemo(
    () => groups
      .filter((g) => cat === "all" || g.key === cat)
      .map((g) => ({ ...g, items: g.items.filter((f) => !t || `${f.q} ${f.a}`.toLowerCase().includes(t)) }))
      .filter((g) => g.items.length),
    [groups, cat, t],
  );
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="min-w-0">
      <div className="rounded-[22px] border border-[#EAEAEC] bg-white p-3 shadow-[0_30px_60px_-45px_rgba(19,19,22,0.5)] sm:p-4">
        <label className="flex items-center gap-2 rounded-xl border border-[#F0DADD] bg-[#FBFBFC] px-4 focus-within:border-[#C8102E] focus-within:bg-white">
          <Search size={17} className="text-[#B30E29]" aria-hidden="true" />
          <span className="sr-only">Search questions</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${total} questions, e.g. warranty, exchange, EIN`} className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-[#696976]" />
        </label>
        <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 scrollbar-none sm:flex-wrap">
          {[{ key: "all", label: "All" }, ...groups].map((g) => (
            <button key={g.key} type="button" onClick={() => setCat(g.key)} aria-pressed={cat === g.key}
              className={`shrink-0 rounded-xl border px-3.5 py-2 text-[13px] font-semibold transition ${cat === g.key ? "border-transparent bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-white" : "border-[#F0DADD] bg-white text-[#131316] hover:border-[#C8102E]/40"}`}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {shown.map((g) => (
        <section key={g.key} aria-labelledby={`faq-${g.key}`} className="mt-8">
          <h2 id={`faq-${g.key}`} className="text-[20px] font-extrabold sm:text-[22px]">{g.label}</h2>
          <div className="mt-3 divide-y divide-[#EAEAEC] overflow-hidden rounded-[22px] border border-[#EAEAEC] bg-white">
            {g.items.map((f) => (
              <details key={f.q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden" open={Boolean(t)}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-bold">
                  {f.q}
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-[#F5F5F6] text-[#B30E29] transition group-open:rotate-45" aria-hidden="true"><Plus size={15} /></span>
                </summary>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#62626F]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      {!shown.length && (
        <p className="mt-8 rounded-2xl border border-dashed border-[#E6CBCF] bg-white p-6 text-[14.5px] text-[#62626F]">
          No answer for that yet. <Link href="/contact" className="font-semibold text-[#A50D25] hover:underline">Ask us directly</Link> and a technician will reply.
        </p>
      )}
    </div>
  );
}
