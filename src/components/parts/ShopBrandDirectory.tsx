"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import WhatsAppButton from "@/components/WhatsAppButton";

type B = { slug: string; name: string; initials: string; color: string; card: string };

/* Every brand A to Z with a search box. All links are in the page, so Google sees each shop brand page. */
export default function ShopBrandDirectory({ brands }: { brands: B[] }) {
  const [q, setQ] = useState("");
  const sorted = useMemo(() => [...brands].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })), [brands]);
  const t = q.trim().toLowerCase();
  const list = t ? sorted.filter((b) => `${b.name} ${b.card}`.toLowerCase().includes(t)) : sorted;
  const letters = [...new Set(sorted.map((b) => b.name[0].toUpperCase()))];
  const groups = letters.map((l) => [l, list.filter((b) => b.name[0].toUpperCase() === l)] as const).filter(([, g]) => g.length);

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-[22px] border border-[#EAEAEC] bg-white p-3 shadow-[0_30px_60px_-45px_rgba(19,19,22,0.5)] sm:flex-row sm:items-center sm:p-4">
        <label className="flex flex-1 items-center gap-2 rounded-xl border border-[#E3E3E7] bg-[#FBFBFC] px-4 focus-within:border-[#C8102E] focus-within:bg-white">
          <Search size={17} className="text-[#B30E29]" aria-hidden="true" />
          <span className="sr-only">Find a brand</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a brand or series, e.g. Kinetix" className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-[#696976]" />
        </label>
        <nav aria-label="Jump to letter" className="-mx-1 flex flex-wrap gap-1 px-1">
          {letters.map((l) => (
            <a key={l} href={`#letter-${l}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-[13px] font-bold text-[#5A5A66] transition hover:bg-[#C8102E] hover:text-white">{l}</a>
          ))}
        </nav>
      </div>

      {groups.map(([l, g]) => (
        <section key={l} id={`letter-${l}`} aria-label={`Brands starting with ${l}`} className="mt-8 scroll-mt-28">
          <h2 className="flex items-center gap-3 text-[22px] font-extrabold text-[#131316]">
            {l}<span className="h-px flex-1 bg-[#EAEAEC]" aria-hidden="true" />
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {g.map((b) => (
              <li key={b.slug} className="relative">
                <Link href={`/shop/brands/${b.slug}`} className="group flex h-full items-center gap-3.5 rounded-2xl border border-[#EAEAEC] bg-white p-4 pr-16 transition hover:-translate-y-0.5 hover:border-[#C8102E]/40 hover:shadow-[0_20px_40px_-28px_rgba(200,16,46,0.6)]">
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl text-[13px] font-extrabold text-white" style={{ background: `linear-gradient(145deg, #C8102E, #131316)` }}>{b.initials}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15.5px] font-extrabold text-[#131316] group-hover:text-[#B30E29]">{b.name}</span>
                    <span className="line-clamp-2 block text-[12.5px] leading-snug text-[#696976]">{b.card}</span>
                  </span>
                </Link>
                <WhatsAppButton size="sm" topic={b.name} kind="brand" url={`/shop/brands/${b.slug}`} label={`Ask about ${b.name} parts on WhatsApp`} className="absolute top-1/2 right-4 -translate-y-1/2 hover:-translate-y-1/2" />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {list.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-[#D6D6DB] bg-white p-6 text-[14.5px] text-[#62626F]">
          Not listed? We still source it. <Link href={`/request-quote${q ? `?brand=${encodeURIComponent(q)}` : ""}`} className="font-semibold text-[#A50D25] hover:underline">Send us the part number</Link> and we&apos;ll quote it.
        </p>
      )}
    </div>
  );
}
