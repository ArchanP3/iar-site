"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, Calculator, CheckCircle2, RefreshCw, RotateCcw, ShoppingCart, Wrench } from "lucide-react";

/* Repair or Replace Advisor: five questions, then a recommendation built only from the answers. */

type Q = { key: string; q: string; hint?: string; options: { v: string; t: string; d?: string }[] };

const questions: Q[] = [
  { key: "state", q: "What is the unit doing?", options: [
    { v: "dead", t: "Completely dead", d: "No power, no display" },
    { v: "fault", t: "Faulting or intermittent", d: "Trips, alarms, works sometimes" },
    { v: "damaged", t: "Physically damaged", d: "Burnt, wet, cracked or crashed" },
  ] },
  { key: "made", q: "Is it still made by the manufacturer?", options: [
    { v: "yes", t: "Yes, available new" },
    { v: "no", t: "Discontinued or hard to find" },
    { v: "unsure", t: "Not sure" },
  ] },
  { key: "urgency", q: "How soon do you need the machine running?", options: [
    { v: "now", t: "Now: the line is down" },
    { v: "week", t: "Within a week" },
    { v: "flex", t: "Flexible", d: "Stocking a spare or planned work" },
  ] },
  { key: "spare", q: "Do you have a spare unit on the shelf?", options: [
    { v: "yes", t: "Yes" },
    { v: "no", t: "No" },
  ] },
  { key: "history", q: "Has this position failed before?", options: [
    { v: "first", t: "First time" },
    { v: "repeat", t: "It has failed before" },
  ] },
];

type A = Record<string, string>;

function advise(a: A) {
  const why: string[] = [];
  let primary: "repair" | "exchange" | "evaluate" = "repair";
  let backup: "refurbished" | "exchange" | "repair" | null = null;

  if (a.state === "damaged") {
    primary = "evaluate";
    backup = "refurbished";
    why.push("Physical damage can sometimes be beyond economic repair, so a free evaluation tells you first, before you spend anything.");
  }
  if (a.urgency === "now" && a.spare === "no" && primary !== "evaluate") {
    primary = "exchange";
    backup = "repair";
    why.push("Your line is down with no spare: an exchange unit gets you a tested replacement without waiting for your own repair. Call or email us for rush handling.");
  }
  if (a.made === "no") {
    why.push("The unit is discontinued, so repair keeps your exact part number running without a retrofit or reprogramming.");
    if (primary === "repair") backup = "exchange";
  }
  if (a.made === "yes" && primary === "repair") {
    why.push("Even when new units exist, a repair returns your exact unit, with the same hardware and settings, typically in 24 to 72 hours once the quote is approved.");
  }
  if (a.spare === "yes") {
    why.push("You have a spare running, so repair the failed unit at component level and put it back on the shelf as your next spare.");
  }
  if (a.spare === "no" && a.urgency !== "now") {
    why.push("You have no spare: consider a refurbished unit for the shelf, so the next failure costs minutes, not days.");
    if (!backup) backup = "refurbished";
  }
  if (a.history === "repeat") {
    why.push("This position has failed before: check the motor, cable and supply too, as the cause may be outside the unit. Tell us the history and we will look for it.");
  }
  if (a.state === "fault") why.push("Intermittent faults are often a component starting to fail. Our test benches run the unit under power to find it.");
  return { primary, backup, why };
}

const info = {
  repair: { icon: Wrench, t: "Repair your unit", d: "Free evaluation, written quote first, 24–72 hr typical turnaround once approved, 1-year warranty.", cta: "Request a Repair", href: "/request-repair", color: "from-[#C8102E] to-[#FF3B55]" },
  exchange: { icon: RefreshCw, t: "Get an exchange unit", d: "A tested replacement, usually shipped within 1–2 business days of receiving your failed unit. Rush available on request.", cta: "Ask About Exchange", href: "/request-repair?service=exchange", color: "from-[#059669] to-[#10B981]" },
  evaluate: { icon: BadgeCheck, t: "Start with a free evaluation", d: "We find out what failed and whether it is worth repairing, then quote you before any work starts.", cta: "Request a Free Evaluation", href: "/request-repair", color: "from-[#C8102E] to-[#FF3B55]" },
  refurbished: { icon: ShoppingCart, t: "Buy a refurbished unit", d: "Inspected, repaired and tested stock, with Buy Now when we have it.", cta: "Check refurbished stock", href: "/resources/part-checker", color: "" },
};

export default function RepairAdvisor() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<A>({});
  const [part, setPart] = useState("");
  const done = step >= questions.length;

  const pick = (key: string, v: string) => {
    setA((x) => ({ ...x, [key]: v }));
    setTimeout(() => setStep((s) => s + 1), 160);
  };

  if (done) {
    const r = advise(a);
    const P = info[r.primary];
    const B = r.backup ? info[r.backup] : null;
    const answers = questions.map((q) => `${q.q} ${q.options.find((o) => o.v === a[q.key])?.t ?? ""}`).join(" | ");
    const withPart = (href: string) => {
      const u = new URL(href, "https://x");
      if (part.trim()) u.searchParams.set("part", part.trim());
      if (u.pathname === "/request-repair") u.searchParams.set("note", `Repair or Replace Advisor: ${answers}`);
      return u.pathname + u.search;
    };
    return (
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="relative overflow-hidden rounded-[26px] bg-[#0A0A0C] p-6 text-white shadow-[0_40px_80px_-40px_rgba(200,16,46,0.7)] sm:p-8">
          <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(255,59,85,0.45),transparent)] blur-xl" />
          <p className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF8A99]">Our recommendation</p>
          <div className="relative mt-3 flex items-center gap-3">
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br ${P.color}`}><P.icon size={22} aria-hidden="true" /></span>
            <h2 className="text-[26px] font-extrabold leading-tight sm:text-[32px]">{P.t}</h2>
          </div>
          <p className="relative mt-3 text-[14.5px] leading-relaxed text-white/75">{P.d}</p>
          <ul className="relative mt-5 space-y-3">
            {r.why.map((w) => (
              <li key={w} className="flex gap-2.5 text-[14px] leading-relaxed text-white/85"><CheckCircle2 size={17} className="mt-0.5 flex-none text-[#34D399]" aria-hidden="true" />{w}</li>
            ))}
          </ul>
          <div className="relative mt-6">
            <label htmlFor="ra-part" className="text-[12.5px] font-semibold text-white/70">Part number (optional, we fill it in for you)</label>
            <input id="ra-part" value={part} onChange={(e) => setPart(e.target.value)} placeholder="e.g. 6SL3120-1TE21-0AA3" className="mt-1.5 h-11 w-full rounded-xl border border-white/15 bg-white/8 px-3.5 font-mono text-[14.5px] text-white outline-none placeholder:font-sans placeholder:text-white/60 focus:border-[#FF3B55]/60" />
          </div>
          <div className="relative mt-4 grid gap-2.5 sm:grid-cols-2">
            <Link href={withPart(P.href)} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white text-[14.5px] font-semibold text-[#131316] transition hover:-translate-y-0.5">{P.cta} <ArrowRight size={16} aria-hidden="true" /></Link>
            {B && <Link href={withPart(B.href)} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/6 text-[14.5px] font-semibold transition hover:border-white/40"><B.icon size={16} aria-hidden="true" /> {B.cta}</Link>}
          </div>
        </div>
        <div className="space-y-3">
          {B && (
            <div className="rounded-[22px] border border-[#EAEAEC] bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#696976]">Also worth considering</p>
              <p className="mt-2 flex items-center gap-2 text-[16px] font-extrabold"><B.icon size={18} className="text-[#B30E29]" aria-hidden="true" /> {B.t}</p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-[#62626F]">{B.d}</p>
            </div>
          )}
          <Link href="/resources/downtime-calculator" className="group flex items-center gap-3 rounded-[22px] border border-[#EAEAEC] bg-white p-5 transition hover:border-[#C8102E]/40">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[#C8102E]/8 text-[#B30E29]"><Calculator size={18} aria-hidden="true" /></span>
            <span className="min-w-0 flex-1"><span className="block text-[15px] font-extrabold group-hover:text-[#B30E29]">Put a number on it</span><span className="block text-[13px] text-[#62626F]">See what waiting costs vs repair or exchange.</span></span>
            <ArrowRight size={16} className="text-[#B30E29]" aria-hidden="true" />
          </Link>
          <button type="button" onClick={() => { setA({}); setStep(0); }} className="inline-flex items-center gap-2 px-1 text-[13.5px] font-semibold text-[#A50D25] hover:underline">
            <RotateCcw size={14} aria-hidden="true" /> Start again
          </button>
        </div>
      </div>
    );
  }

  const cur = questions[step];
  return (
    <div className="mx-auto max-w-190 rounded-[26px] border border-[#EAEAEC] bg-white p-5 shadow-[0_30px_70px_-45px_rgba(19,19,22,0.45)] sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12.5px] font-bold text-[#B30E29]">Question {step + 1} of {questions.length}</p>
        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#62626F] hover:text-[#B30E29]"><ArrowLeft size={14} aria-hidden="true" /> Back</button>
        )}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#F3F3F4]">
        <div className="h-full rounded-full bg-linear-to-r from-[#C8102E] to-[#FF3B55] transition-[width] duration-300" style={{ width: `${(step / questions.length) * 100}%` }} />
      </div>
      <h2 className="mt-6 text-[22px] font-extrabold sm:text-[26px]">{cur.q}</h2>
      <div className="mt-5 grid gap-2.5">
        {cur.options.map((o) => {
          const on = a[cur.key] === o.v;
          return (
            <button key={o.v} type="button" onClick={() => pick(cur.key, o.v)}
              className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition ${on ? "border-[#C8102E] bg-[#C8102E]/5 ring-4 ring-[#C8102E]/10" : "border-[#F0DADD] hover:border-[#C8102E]/50 hover:bg-[#FBFBFC]"}`}>
              <span><span className="block text-[15.5px] font-bold">{o.t}</span>{o.d && <span className="block text-[13px] text-[#696976]">{o.d}</span>}</span>
              <ArrowRight size={17} className={on ? "text-[#B30E29]" : "text-[#C2C2C9]"} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
