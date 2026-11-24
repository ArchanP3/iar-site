"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export type PickerItem = { key: string; name: string; short: string; href: string; image: string; zoom?: boolean; equipment: string[] };

/* Simple industry picker: names on the left (a swipeable row on phones),
   the chosen industry's photo and details on the right. */
export default function IndustriesPicker({ items }: { items: PickerItem[] }) {
  const [active, setActive] = useState(0);
  const cur = items[active];

  return (
    <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[300px_1fr] lg:gap-7 lg:p-7">
      {/* list */}
      <div role="tablist" aria-label="Industries" aria-orientation="vertical"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:mx-0 lg:max-h-[440px] lg:flex-col lg:gap-1 lg:overflow-y-auto lg:overflow-x-visible lg:px-0 lg:pr-2 lg:[scrollbar-width:thin]">
        {items.map((it, i) => {
          const on = i === active;
          return (
            <button key={it.key} role="tab" aria-selected={on} onClick={() => setActive(i)}
              className={`group flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[14px] font-semibold transition lg:w-full ${
                on ? "bg-[#C8102E] text-white shadow-[0_10px_24px_-12px_rgba(200,16,46,0.9)]" : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white lg:bg-transparent"
              }`}>
              <span className={`hidden w-6 font-mono text-[11px] lg:inline ${on ? "text-white/80" : "text-white/35"}`}>{String(i + 1).padStart(2, "0")}</span>
              <span className="whitespace-nowrap lg:flex-1 lg:whitespace-normal">{it.name}</span>
              <ArrowRight size={15} aria-hidden="true" className={`hidden transition lg:block ${on ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0 group-hover:opacity-60"}`} />
            </button>
          );
        })}
      </div>

      {/* detail */}
      <div role="tabpanel" className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30">
        <div className="grid h-full md:grid-cols-[1.1fr_1fr]">
          <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[440px]">
            {items.map((it, i) => (
              <Image key={it.key} src={it.image} alt={i === active ? `${it.name} equipment we repair` : ""} fill
                sizes="(min-width: 1024px) 520px, 100vw"
                className={`object-cover transition duration-500 ${it.zoom ? "origin-top scale-[1.22]" : ""} ${i === active ? "opacity-100" : "opacity-0"}`} />
            ))}
            <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent md:bg-linear-to-r md:from-transparent md:via-transparent md:to-black/40" />
          </div>

          <div key={cur.key} className="iar-fade-up flex flex-col p-5 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF8A99]">Industry {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</p>
            <h3 className="mt-2 text-[26px] font-extrabold leading-tight text-white sm:text-[30px]">{cur.name}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-white/70">{cur.short}</p>

            <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/45">Equipment we repair</p>
            <ul className="mt-3 space-y-2">
              {cur.equipment.slice(0, 5).map((e) => (
                <li key={e} className="flex items-start gap-2 text-[14px] text-white/85">
                  <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[#FF3B55]" aria-hidden="true" />{e}
                </li>
              ))}
            </ul>

            <Link href={cur.href}
              className="group mt-auto inline-flex h-11 items-center gap-2 self-start rounded-xl bg-white px-5 pt-0 text-[14px] font-semibold text-[#131316] transition hover:bg-[#C8102E] hover:text-white max-md:mt-6">
              {cur.name} repair <ArrowRight size={16} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
