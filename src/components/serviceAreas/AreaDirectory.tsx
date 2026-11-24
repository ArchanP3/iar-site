"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Search, Truck } from "lucide-react";
import type { Area } from "@/lib/serviceAreas";
import { regionColor, regionsIn, type Region } from "@/lib/areaRegions";

/* City finder: colour-coded region cards (same style as the Brands page), search and region filter.
   Every city card is in the page HTML; filtering only hides cards. */
const ALL: Region = { key: "all", label: "All cities", color: "#131316", match: () => true };
const colorOf = regionColor;
const initials = (city: string) => city.split(/[\s-]+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export default function AreaDirectory({ areas, urls }: { areas: Area[]; urls: Record<string, string> }) {
  const [g, setG] = useState("all");
  const [q, setQ] = useState("");
  const tabs = [ALL, ...regionsIn(areas)];
  const group = tabs.find((x) => x.key === g) ?? ALL;
  const term = q.trim().toLowerCase();
  const shown = new Set(areas.filter((a) => group.match(a) && (!term || `${a.city} ${a.region} ${a.regionCode}`.toLowerCase().includes(term))).map((a) => a.slug));

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {tabs.map((x) => {
            const n = areas.filter(x.match).length;
            const act = g === x.key;
            return (
              <button key={x.key} type="button" onClick={() => setG(x.key)} aria-pressed={act}
                style={act ? { background: x.key === "all" ? "#131316" : `linear-gradient(135deg, ${x.color}, #131316)`, borderColor: "transparent" } : undefined}
                className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[13.5px] font-semibold transition ${act ? "text-white shadow-[0_10px_22px_-12px_rgba(19,19,22,0.9)]" : "border-[#E6E6E8] bg-white text-[#4E4E58] hover:border-[#CCCCD1]"}`}>
                {x.key !== "all" && <span className="h-2.5 w-2.5 rounded-full" style={{ background: x.color, boxShadow: `0 0 0 3px ${x.color}33` }} aria-hidden="true" />}
                {x.label}
                <span className={`rounded-full px-1.5 text-[11px] font-bold ${act ? "bg-white/20" : "bg-[#F4F4F5] text-[#A50D25]"}`}>{n}</span>
              </button>
            );
          })}
        </div>
        <label className="flex h-11 w-full items-center gap-2.5 rounded-xl border border-[#E6E6E8] bg-white px-3.5 text-[#696976] focus-within:border-[#C8102E] focus-within:ring-4 focus-within:ring-[#C8102E]/10 lg:w-72">
          <Search size={16} aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find your city" aria-label="Find your city" className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-[#131316] outline-none placeholder:text-[#91919E]" />
        </label>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {areas.map((a) => {
          const c = colorOf(a);
          return (
            <li key={a.slug} hidden={!shown.has(a.slug)}>
              <Link href={urls[a.slug]} className="hexcard group relative flex h-full flex-col overflow-hidden rounded-[18px] border border-white/10 p-3.5 text-white shadow-[0_22px_44px_-24px_rgba(28,28,32,0.8)] transition duration-300 hover:-translate-y-1 sm:rounded-[22px] sm:p-5">
                <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-xl transition duration-500 group-hover:scale-125" style={{ background: `radial-gradient(closest-side, #C8102E77, transparent)` }} />
                <span className="relative flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-[14px] font-extrabold ring-1 ring-white/20 sm:h-12 sm:w-12 sm:text-[15px]" style={{ background: `linear-gradient(145deg, #C8102E, #131316)` }}>{initials(a.city)}</span>
                  <ArrowUpRight size={18} className="text-[#FF5A6E] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
                <span className="relative mt-3 block text-[15px] font-extrabold leading-snug sm:mt-4 sm:text-[18px]">{a.city}</span>
                <span className="relative block text-[11.5px] text-white/55 sm:text-[12.5px]">{a.region} · {a.country === "CA" ? "Canada" : "USA"}</span>
                <span className="relative mt-2 hidden flex-1 text-[12.5px] leading-normal text-white/70 sm:line-clamp-3">{a.local}</span>
                <span className="relative mt-auto flex flex-wrap gap-1.5 pt-3 text-[10px] font-bold uppercase tracking-[0.1em] sm:text-[10.5px]">
                  {a.dropOff && <span className="rounded-full px-2 py-1 text-white" style={{ background: `${c}55` }}>Drop-off</span>}
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[#FF8A99]">Pickup</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {shown.size === 0 && (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-[20px] border border-dashed border-[#D6D6DB] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14.5px] text-[#4E4E58]"><b className="text-[#131316]">{q ? `“${q}” isn’t on the list yet` : "No cities here"}</b>, but we serve every city in the USA.</p>
          <Link href="/request-pickup" className="inline-flex h-11 items-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-5 text-[14px] font-semibold text-white"><Truck size={16} aria-hidden="true" /> Request a Pickup</Link>
        </div>
      )}
    </div>
  );
}
