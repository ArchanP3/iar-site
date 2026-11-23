"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import WhatsAppButton from "@/components/WhatsAppButton";
import { brandLogo, brands, brandUrl, groups } from "@/lib/brands";

/* Searchable brand list. All links are in the HTML, so Google sees every brand. */
export default function BrandDirectory() {
  const [q, setQ] = useState("");
  const [g, setG] = useState("all");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return brands
      .filter((b) => !b.core && (g === "all" || b.group === g) && (!t || `${b.name} ${b.card}`.toLowerCase().includes(t)))
      .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
  }, [q, g]);

  return (
    <section aria-labelledby="more">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 id="more" className="text-[22px] font-extrabold sm:text-[26px]">More brands we repair</h2>
          <p className="mt-1 text-[14px] text-[#62626F]">{brands.length} brands listed. Name any brand and we&apos;ll repair it.</p>
        </div>
        <label className="flex w-full items-center gap-2 rounded-2xl border border-[#E3E3E7] bg-white px-4 lg:w-85">
          <Search size={17} className="text-[#B30E29]" aria-hidden="true" />
          <span className="sr-only">Find a brand</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a brand or series…" className="h-11 w-full bg-transparent text-[14px] outline-none placeholder:text-[#696976]" />
        </label>
      </div>
      <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
        {[{ key: "all", label: "All" }, ...groups].map((x) => (
          <button key={x.key} type="button" aria-pressed={g === x.key} onClick={() => setG(x.key)}
            className={`shrink-0 rounded-xl border px-3.5 py-2 text-[13px] font-semibold transition ${g === x.key ? "border-transparent bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-white" : "border-[#E3E3E7] bg-white text-[#131316] hover:border-[#C8102E]/40"}`}>
            {x.label}
          </button>
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {list.map((b) => (
          <li key={b.slug} className="relative">
            <Link href={brandUrl(b.slug)} className="hexcard group relative flex h-full flex-col overflow-hidden rounded-[18px] border border-white/10 p-3.5 pb-15 sm:pb-17 sm:rounded-[22px] sm:p-5 text-white shadow-[0_22px_44px_-24px_rgba(28,28,32,0.8)] transition hover:-translate-y-1">
              <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-xl transition group-hover:scale-125" style={{ background: `radial-gradient(closest-side, #C8102E77, transparent)` }} />
              <span className="relative flex items-start justify-between">
                {brandLogo(b.slug) ? (
                  <span className="flex h-10 w-20 items-center justify-center rounded-xl bg-white px-1.5 ring-1 ring-white/20 sm:h-12 sm:w-24 sm:rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={brandLogo(b.slug)} alt="" className="max-h-[70%] w-full object-contain" />
                  </span>
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl text-[12px] font-extrabold ring-1 ring-white/20 sm:h-12 sm:w-12 sm:rounded-2xl sm:text-[14px]" style={{ background: `linear-gradient(145deg, #C8102E, #131316)` }}>{b.initials}</span>
                )}
                <ArrowUpRight size={18} className="text-[#FF5A6E] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
              <span className="relative mt-3 block min-h-[2lh] text-[15px] font-extrabold leading-snug sm:mt-4 sm:text-[18px]">{b.name} Repair</span>
              <span className="relative mt-1 line-clamp-2 block min-h-[2lh] text-[11.5px] leading-normal text-white/70 sm:line-clamp-none sm:min-h-[3lh] sm:text-[13px]">{b.card}</span>
            </Link>
            <WhatsAppButton tone="dark" size="sm" topic={b.name} kind="brand" url={brandUrl(b.slug)} label={`Ask about ${b.name} repair on WhatsApp`} className="absolute right-3.5 bottom-3.5 sm:right-5 sm:bottom-5" />
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="mt-4 rounded-2xl border border-dashed border-[#D6D6DB] p-5 text-[14px] text-[#62626F]">Not listed? We still repair it. Send us the part number below.</p>}
    </section>
  );
}
