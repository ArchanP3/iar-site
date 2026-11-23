"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BadgeCheck, FileText, Loader2, RefreshCw, ScanSearch, ShoppingCart, Wrench } from "lucide-react";

type Item = {
  slug: string; manufacturer: string; partNumber: string; name: string; image: string | null;
  refurbished: { price: number | null; stock: number | null } | null;
  exchange: { price: number | null } | null; newUnit: boolean; repair: boolean; status: string | null;
};

const usd = (n: number) => `US$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function PartChecker() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[] | null>(null);
  const [exact, setExact] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<number | null>(null);
  const seq = useRef(0);

  // Part number in the link (?part=...) fills the box and checks it
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("part");
    if (v) onType(v);
  }, []);

  function onType(v: string) {
    setQ(v);
    if (timer.current) window.clearTimeout(timer.current);
    if (v.trim().length < 2) { setItems(null); return; }
    setLoading(true);
    timer.current = window.setTimeout(async () => {
      const n = ++seq.current;
      try {
        const res = await fetch(`/api/part-check?q=${encodeURIComponent(v.trim())}`);
        const data = await res.json();
        if (n !== seq.current) return;
        setItems(data.items); setExact(data.exact);
      } catch {
        if (n === seq.current) setItems([]);
      } finally {
        if (n === seq.current) setLoading(false);
      }
    }, 300);
  }

  const part = encodeURIComponent(q.trim());

  return (
    <div>
      <div className="rounded-[24px] bg-[#131316] p-4 shadow-[0_40px_80px_-45px_rgba(200,16,46,0.8)] sm:p-6">
        <label htmlFor="pc-q" className="text-[13px] font-semibold text-[#FF8A99]">Part or model number</label>
        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/8 p-1.5 pl-4 focus-within:border-[#FF3B55]/60">
          <ScanSearch size={20} className="flex-none text-[#FF8A99]" aria-hidden="true" />
          <input id="pc-q" value={q} onChange={(e) => onType(e.target.value)} autoComplete="off" spellCheck={false} placeholder="e.g. 6AV2124-0MC01-0AX0"
            className="h-12 w-full min-w-0 bg-transparent font-mono text-[16px] text-white outline-none placeholder:font-sans placeholder:text-white/60" />
          {loading && <Loader2 size={18} className="mr-3 flex-none animate-spin text-[#FF8A99]" aria-hidden="true" />}
        </div>
        <p className="mt-2 text-[12.5px] text-white/55">Spaces, dashes and the brand name are ignored. Results update as you type.</p>
      </div>

      <div aria-live="polite" className="mt-5">
        {items && items.length > 0 && (
          <>
            <p className="mb-3 text-[13.5px] font-semibold text-[#62626F]">{exact ? "Exact match in our catalogue" : `Parts matching "${q.trim()}"`}</p>
            <ul className="grid gap-3">
              {items.map((p) => (
                <li key={p.slug} className="rounded-[22px] border border-[#EAEAEC] bg-white p-4 sm:p-5">
                  <div className="flex gap-4">
                    <Link href={`/parts/${p.slug}`} className="relative h-20 w-20 flex-none overflow-hidden rounded-2xl bg-[#F7F7F8] ring-1 ring-[#EAEAEC]">
                      {p.image && <Image src={p.image} alt="" aria-hidden="true" fill sizes="80px" unoptimized={p.image.startsWith("http")} className="object-contain p-2" />}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-bold uppercase tracking-widest text-[#A50D25]">{p.manufacturer}</p>
                      <Link href={`/parts/${p.slug}`} className="block wrap-break-word font-mono text-[18px] font-bold hover:text-[#B30E29]">{p.partNumber}</Link>
                      <p className="line-clamp-1 text-[13px] text-[#696976]">{p.name}{p.status ? ` · ${p.status}` : ""}</p>
                    </div>
                  </div>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <li className="rounded-xl bg-[#FFF6F7] p-3 ring-1 ring-[#C8102E]/10">
                      <p className="flex items-center gap-1.5 text-[12px] font-bold text-[#A50D25]"><BadgeCheck size={14} aria-hidden="true" /> Refurbished</p>
                      <p className="mt-1 text-[14px] font-extrabold">{p.refurbished?.price != null ? usd(p.refurbished.price) : "Request a Quote"}</p>
                      {p.refurbished?.price != null && <p className="text-[11.5px] text-[#696976]">{p.refurbished.stock ? `${p.refurbished.stock} in stock · Buy Now` : "In stock · Buy Now"}</p>}
                    </li>
                    <li className="rounded-xl bg-[#F0FDF7] p-3 ring-1 ring-emerald-500/15">
                      <p className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-700"><RefreshCw size={14} aria-hidden="true" /> Exchange</p>
                      <p className="mt-1 text-[14px] font-extrabold">{p.exchange?.price != null ? usd(p.exchange.price) : "Request a Quote"}</p>
                      <p className="text-[11.5px] text-[#696976]">Send us your unit</p>
                    </li>
                    <li className="rounded-xl bg-[#F9F9F9] p-3 ring-1 ring-[#EAEAEC]">
                      <p className="flex items-center gap-1.5 text-[12px] font-bold text-[#5A5A66]"><Wrench size={14} aria-hidden="true" /> Repair</p>
                      <p className="mt-1 text-[14px] font-extrabold">Free evaluation</p>
                      <p className="text-[11.5px] text-[#696976]">24–72 hr typical · 12-mo warranty</p>
                    </li>
                    <li className="rounded-xl bg-[#F9F9F9] p-3 ring-1 ring-[#EAEAEC]">
                      <p className="flex items-center gap-1.5 text-[12px] font-bold text-[#5A5A66]"><FileText size={14} aria-hidden="true" /> New</p>
                      <p className="mt-1 text-[14px] font-extrabold">Request a Quote</p>
                      <p className="text-[11.5px] text-[#696976]">Price and lead time</p>
                    </li>
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/parts/${p.slug}`} className="inline-flex h-10 items-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-4 text-[13.5px] font-semibold text-white"><ShoppingCart size={15} aria-hidden="true" /> View options</Link>
                    <Link href={`/request-repair?part=${encodeURIComponent(p.partNumber)}&brand=${encodeURIComponent(p.manufacturer)}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#F0DADD] px-4 text-[13.5px] font-semibold hover:border-[#C8102E]"><Wrench size={15} aria-hidden="true" /> Repair mine</Link>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {items && items.length === 0 && !loading && (
          <div className="rounded-[22px] border border-[#EAEAEC] bg-white p-6 sm:p-7">
            <p className="text-[18px] font-extrabold">Not in our online catalogue yet</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-[#62626F]">We repair every major brand and source parts from our stock and suppliers. Send us the part number and we&apos;ll reply with your options.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/request-quote?part=${part}`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-5 text-[14px] font-semibold text-white"><FileText size={16} aria-hidden="true" /> Get a quote for {q.trim().slice(0, 24)}</Link>
              <Link href={`/request-repair?part=${part}`} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#F0DADD] px-5 text-[14px] font-semibold hover:border-[#C8102E]"><Wrench size={16} aria-hidden="true" /> Request a Repair</Link>
              <Link href={`/request-repair?part=${part}&service=exchange`} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#F0DADD] px-5 text-[14px] font-semibold hover:border-[#C8102E]"><RefreshCw size={16} aria-hidden="true" /> Ask About Exchange</Link>
            </div>
          </div>
        )}

        {!items && (
          <ul className="grid gap-3 sm:grid-cols-3">
            {[
              [BadgeCheck, "Buy refurbished", "Price, stock and Buy Now when we have it"],
              [RefreshCw, "Exchange", "A tested replacement for your failed unit"],
              [Wrench, "Repair", "Free evaluation and a written quote first"],
            ].map(([Icon, t, d]) => {
              const I = Icon as React.ElementType;
              return (
                <li key={t as string} className="rounded-[22px] border border-[#EAEAEC] bg-white p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C8102E]/8 text-[#B30E29]"><I size={18} aria-hidden="true" /></span>
                  <p className="mt-3 text-[15px] font-extrabold">{t as string}</p>
                  <p className="mt-1 text-[13px] text-[#62626F]">{d as string}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="mt-4 text-[12.5px] text-[#696976]">Looking for a fault code instead? <Link href="/fault-codes" className="font-semibold text-[#A50D25] hover:underline">Fault Code Library <ArrowRight size={12} className="inline" aria-hidden="true" /></Link></p>
    </div>
  );
}
