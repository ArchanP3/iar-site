"use client";

import { ArrowUp, BadgeCheck, Clock, Gauge, PackageOpen, RotateCcw, ShieldCheck, Tag, Wrench } from "lucide-react";
import { canBuyOnline, usd, WARRANTY } from "@/lib/parts/rules";
import { conditionLabel, type Condition, type Offer } from "@/lib/parts/types";

/* Side-by-side comparison of the four ways to get this part. Wording comes only from the
   company's own FAQ, warranty page and selling rules. "Choose" switches the buy box above. */
const COLOR: Record<Condition, string> = { new: "#F31D3D", refurbished: "#12B76A", exchange: "#9B5CF6", repair: "#F5A524" };

const ROWS: { key: string; label: string; icon: React.ElementType; v: Record<Condition, string> }[] = [
  { key: "what", label: "What you get", icon: PackageOpen, v: {
    new: "Factory-new, in original packaging where available",
    refurbished: "Repaired and refreshed by our technicians, then tested",
    exchange: "A tested replacement unit at a lower price",
    repair: "Your own unit, repaired at component level",
  } },
  { key: "test", label: "Testing", icon: Gauge, v: {
    new: "Factory-new condition",
    refurbished: "Tested under power on our own jigs",
    exchange: "Tested before it ships",
    repair: "Tested on our jigs, test report included",
  } },
  { key: "warranty", label: "Warranty", icon: ShieldCheck, v: {
    new: "As stated on your quote; may not include the manufacturer's warranty",
    refurbished: WARRANTY,
    exchange: WARRANTY,
    repair: `${WARRANTY} on the repair`,
  } },
  { key: "speed", label: "How fast", icon: Clock, v: {
    new: "Lead time confirmed by email",
    refurbished: "Usually ships in 1–2 business days",
    exchange: "Usually ships 1–2 business days after we receive your unit",
    repair: "24–72 hr typical once you approve the quote",
  } },
  { key: "send", label: "You send us your unit", icon: RotateCcw, v: {
    new: "No",
    refurbished: "No",
    exchange: "Yes, your failed unit",
    repair: "Yes, or we arrange a pickup",
  } },
  { key: "best", label: "Best when", icon: BadgeCheck, v: {
    new: "You need factory-new stock or 5+ units",
    refurbished: "You need a tested unit quickly",
    exchange: "You can send yours in and want a lower price",
    repair: "You want to keep your own unit",
  } },
];


export default function ConditionCompare({ offers }: { offers: Offer[] }) {
  const priceOf = (c: Condition) => {
    const o = offers.find((x) => x.condition === c);
    if (c === "repair") return "Free evaluation, then a written quote";
    return o && canBuyOnline(o) && o.price !== undefined && (c === "new" || c === "refurbished") ? usd(o.price) : "Request a quote";
  };
  const choose = (c: Condition) => {
    window.dispatchEvent(new CustomEvent("aq:choose-condition", { detail: c }));
    document.getElementById("buy")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const conds = offers.map((o) => o.condition);

  return (
    <section aria-labelledby="compare-heading" className="mt-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B30E29]">
            <span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#C8102E] to-[#FF3B55]" /> Compare options
          </p>
          <h2 id="compare-heading" className="mt-2 text-[22px] font-extrabold sm:text-[26px]">New, refurbished, exchange or repair?</h2>
        </div>
        <p className="text-[13px] text-[#696976]">Same part, four ways to get it. Pick what fits your downtime and budget.</p>
      </div>

      {/* Desktop: table */}
      <div className="mt-5 hidden overflow-hidden rounded-[22px] border border-[#EAEAEC] bg-white shadow-[0_30px_60px_-50px_rgba(19, 19, 22,0.6)] lg:block">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr>
              <th scope="col" className="w-[17%] p-4"><span className="sr-only">Compare</span></th>
              {conds.map((c) => (
                <th key={c} scope="col" className="p-3 align-top">
                  <div className="relative flex min-h-21 flex-col justify-center overflow-hidden rounded-2xl p-3.5 text-white" style={{ background: `linear-gradient(150deg, #0F0F10 0%, #1A1A1E 55%, ${COLOR[c]}55 100%)` }}>
                    <span aria-hidden="true" className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-xl" style={{ background: `radial-gradient(closest-side, ${COLOR[c]}88, transparent)` }} />
                    <span className="relative block text-[17px] font-extrabold">{conditionLabel[c]}</span>
                    <span className="relative mt-0.5 flex items-start gap-1.5 text-[13px] font-semibold leading-snug text-white/85"><Tag size={13} style={{ color: COLOR[c] }} className="mt-0.5 flex-none" aria-hidden="true" />{priceOf(c)}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={r.key} className={i % 2 ? "bg-[#FCFCFC]" : ""}>
                <th scope="row" className="border-t border-[#F3F3F4] p-4 align-top text-[13px] font-bold text-[#45454D]">
                  <span className="flex items-center gap-2"><r.icon size={16} className="flex-none text-[#B30E29]" aria-hidden="true" />{r.label}</span>
                </th>
                {conds.map((c) => (
                  <td key={c} className="border-t border-[#F3F3F4] px-4 py-3.5 align-top text-[13.5px] leading-snug text-[#131316]">{r.v[c]}</td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="border-t border-[#F3F3F4] p-4" />
              {conds.map((c) => (
                <td key={c} className="border-t border-[#F3F3F4] px-4 py-4">
                  <button type="button" onClick={() => choose(c)} className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border text-[13.5px] font-semibold transition hover:-translate-y-0.5" style={{ borderColor: `${COLOR[c]}66`, color: "#131316", background: `${COLOR[c]}12` }}>
                    {c === "repair" ? <Wrench size={15} aria-hidden="true" /> : <ArrowUp size={15} aria-hidden="true" />} Choose {conditionLabel[c]}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Phone and tablet: swipeable cards */}
      <ul className="-mx-4 mt-5 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:hidden">
        {conds.map((c) => (
          <li key={c} className="w-[82%] shrink-0 snap-start sm:w-auto">
            <div className="flex h-full flex-col overflow-hidden rounded-[20px] border border-[#EAEAEC] bg-white">
              <div className="relative overflow-hidden p-4 text-white" style={{ background: `linear-gradient(150deg, #0F0F10 0%, #1A1A1E 55%, ${COLOR[c]}55 100%)` }}>
                <span className="block text-[17px] font-extrabold">{conditionLabel[c]}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-white/85"><Tag size={13} style={{ color: COLOR[c] }} aria-hidden="true" />{priceOf(c)}</span>
              </div>
              <dl className="flex-1 divide-y divide-[#F3F3F4] px-4">
                {ROWS.map((r) => (
                  <div key={r.key} className="py-2.5">
                    <dt className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[#696976]"><r.icon size={13} className="text-[#B30E29]" aria-hidden="true" />{r.label}</dt>
                    <dd className="mt-0.5 text-[13.5px] leading-snug text-[#131316]">{r.v[c]}</dd>
                  </div>
                ))}
              </dl>
              <div className="p-4 pt-1">
                <button type="button" onClick={() => choose(c)} className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl text-[14px] font-semibold text-white" style={{ background: `linear-gradient(135deg, ${COLOR[c]}, #131316)` }}>
                  Choose {conditionLabel[c]}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
