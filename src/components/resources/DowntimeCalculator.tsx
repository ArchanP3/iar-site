"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Clock, Download, Loader2, RefreshCw, TrendingDown, Truck, Wrench } from "lucide-react";
import { useContact } from "@/components/cms/ContactProvider";

/* Downtime Cost Calculator.
   Uses only the visitor's own numbers plus confirmed AutomIQ facts:
   repair 24–72 hr typical once the quote is approved (we use 72 hr to stay conservative),
   exchange units usually ship 1–2 business days after the failed unit arrives (we use 2).
   Shipping time is entered by the visitor. */

const REPAIR_DAYS = 3; // 72 hr, the top of the typical 24–72 hr range
const EXCHANGE_DAYS = 2; // top of the usual 1–2 business day handling
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const plural = (n: number, w: string) => `${n % 1 === 0 ? n : n.toFixed(1)} ${w}${n === 1 ? "" : "s"}`;

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13.5px] font-bold text-[#131316]">{label}</label>
        {hint && <span className="text-[12px] text-[#696976]">{hint}</span>}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Slider({ id, value, min, max, step, onChange, suffix }: { id: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; suffix: string }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-3">
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full accent-[#C8102E]"
        style={{ background: `linear-gradient(90deg, #C8102E ${pct}%, #EAEAEC ${pct}%)` }} />
      <span className="w-21.5 flex-none rounded-lg bg-[#F5F5F6] px-2 py-1.5 text-center text-[13.5px] font-bold tabular-nums text-[#131316]">{value} {suffix}</span>
    </div>
  );
}

export default function DowntimeCalculator() {
  const contact = useContact();
  const [cost, setCost] = useState(1000);
  const [hoursPerDay, setHoursPerDay] = useState(16);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [wait, setWait] = useState(3);
  const [waitUnit, setWaitUnit] = useState<"weeks" | "days">("weeks");
  const [ship, setShip] = useState(2);
  const [part, setPart] = useState("");
  const [busy, setBusy] = useState(false);

  const r = useMemo(() => {
    const perDay = hoursPerDay * (daysPerWeek / 7); // production hours per calendar day
    const row = (days: number) => ({ days, hours: days * perDay, cost: days * perDay * cost });
    const waitDays = waitUnit === "weeks" ? wait * 7 : wait;
    const newUnit = row(waitDays);
    const repair = row(REPAIR_DAYS + ship * 2);
    const exchange = row(EXCHANGE_DAYS + ship * 2);
    return { newUnit, repair, exchange, saveRepair: Math.max(0, newUnit.cost - repair.cost), saveExchange: Math.max(0, newUnit.cost - exchange.cost) };
  }, [cost, hoursPerDay, daysPerWeek, wait, waitUnit, ship]);

  const max = Math.max(r.newUnit.cost, r.repair.cost, r.exchange.cost, 1);
  const scenarios = [
    { key: "new", icon: Clock, t: "Wait for a new unit", d: `${plural(r.newUnit.days, "day")} until it arrives`, v: r.newUnit, bar: "from-[#F87171] to-[#FB923C]" },
    { key: "repair", icon: Wrench, t: "Repair with AutomIQ", d: `72 hr repair + ${plural(ship, "day")} shipping each way`, v: r.repair, bar: "from-[#C8102E] to-[#FF3B55]" },
    { key: "exchange", icon: RefreshCw, t: "AutomIQ exchange unit", d: `Your unit to us + 1–2 business days + ${plural(ship, "day")} back`, v: r.exchange, bar: "from-[#10B981] to-[#34D399]" },
  ];

  const summary = `Downtime estimate: waiting for a new unit ${usd(r.newUnit.cost)}, repair ${usd(r.repair.cost)}, exchange ${usd(r.exchange.cost)} (at ${usd(cost)}/hr)`;
  const q = (extra: Record<string, string>) => {
    const p = new URLSearchParams({ ...(part.trim() ? { part: part.trim() } : {}), note: summary, ...extra });
    return `/request-repair?${p.toString()}`;
  };

  async function downloadPdf() {
    setBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const W = doc.internal.pageSize.getWidth();
      const M = 48;
      doc.setFillColor(10, 10, 12); doc.rect(0, 0, W, 96, "F");
      try {
        const blob = await (await fetch("/iar-logo-white.png")).blob();
        const data = await new Promise<string>((ok) => { const fr = new FileReader(); fr.onload = () => ok(String(fr.result)); fr.readAsDataURL(blob); });
        doc.addImage(data, "PNG", M, 18, 132, 60);
      } catch { /* logo is optional */ }
      doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(18);
      doc.text("Downtime cost summary", W - M, 50, { align: "right" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(228, 182, 189);
      doc.text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), W - M, 68, { align: "right" });

      let y = 132;
      doc.setTextColor(19, 19, 22);
      if (part.trim()) { doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.text(`Part / machine: ${part.trim()}`, M, y); y += 26; }
      doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.text("Your numbers", M, y); y += 18;
      doc.setFont("helvetica", "normal"); doc.setFontSize(11);
      const inputs: [string, string][] = [
        ["Downtime cost per hour", usd(cost)],
        ["Production hours per day", `${hoursPerDay}`],
        ["Production days per week", `${daysPerWeek}`],
        ["Wait for a new unit", `${wait} ${waitUnit}`],
        ["Shipping time each way", plural(ship, "day")],
      ];
      for (const [k, v] of inputs) { doc.setTextColor(98, 98, 111); doc.text(k, M, y); doc.setTextColor(19, 19, 22); doc.text(v, W - M, y, { align: "right" }); y += 18; }

      y += 14; doc.setDrawColor(234, 234, 236); doc.line(M, y, W - M, y); y += 26;
      doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.text("Estimated cost of downtime", M, y); y += 22;
      const colors: [number, number, number][] = [[248, 113, 113], [200, 16, 46], [16, 185, 129]];
      scenarios.forEach((s, i) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(19, 19, 22); doc.text(s.t, M, y);
        doc.text(usd(s.v.cost), W - M, y, { align: "right" });
        doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(136, 136, 149);
        doc.text(`${s.d} · ${Math.round(s.v.hours)} production hours lost`, M, y + 14);
        doc.setFillColor(245, 245, 246); doc.roundedRect(M, y + 22, W - 2 * M, 8, 4, 4, "F");
        doc.setFillColor(...colors[i]); doc.roundedRect(M, y + 22, Math.max(8, (W - 2 * M) * (s.v.cost / max)), 8, 4, 4, "F");
        y += 52;
      });

      y += 6; doc.setFillColor(247, 247, 248); doc.roundedRect(M, y, W - 2 * M, 64, 10, 10, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(165, 13, 37);
      doc.text(`Repair instead of waiting: save about ${usd(r.saveRepair)}`, M + 16, y + 26);
      doc.setTextColor(5, 150, 105); doc.text(`Exchange unit instead of waiting: save about ${usd(r.saveExchange)}`, M + 16, y + 46);
      y += 92;

      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(136, 136, 149);
      const note = "Estimate based on the numbers entered above. Repair uses 72 hours, the top of our typical 24 to 72 hour turnaround once a quote is approved; times are typical, not guaranteed. Exchange uses 2 business days after your unit arrives, the top of our usual 1–2 days; some units take longer. Rush handling is available for an extra fee. Free evaluation and a written quote before any work starts. 12-month warranty on repairs.";
      doc.text(doc.splitTextToSize(note, W - 2 * M), M, y);
      y += 52;
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(19, 19, 22);
      const site = window.location.origin.replace(/^https?:\/\//, "");
      doc.text(["AutomIQ Automation & Drive Services · Mississauga, Ontario · Canada & USA", [site, contact.phone, contact.email].filter(Boolean).join(" · ")], M, y);
      doc.save(`downtime-cost-${part.trim().replace(/[^a-z0-9]+/gi, "-") || "summary"}.pdf`);
    } finally {
      setBusy(false);
    }
  }

  const num = "h-11 w-full rounded-xl border border-[#F0DADD] bg-[#FBFBFC] px-3.5 text-[15px] font-semibold text-[#131316] outline-none focus:border-[#C8102E] focus:bg-white focus:ring-4 focus:ring-[#C8102E]/10";

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* ---------- Inputs ---------- */}
      <section aria-label="Your numbers" className="rounded-[24px] border border-[#EAEAEC] bg-white p-5 shadow-[0_30px_70px_-45px_rgba(19, 19, 22,0.45)] sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B30E29]">Your numbers</p>
        <div className="mt-5 space-y-6">
          <Field id="dc-cost" label="What does one hour of downtime cost you?" hint="Lost output, labour, penalties">
            <div className="flex h-12 items-center rounded-xl border border-[#F0DADD] bg-[#FBFBFC] px-3.5 focus-within:border-[#C8102E] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#C8102E]/10">
              <span className="text-[16px] font-bold text-[#696976]">$</span>
              <input id="dc-cost" type="number" inputMode="numeric" min={0} step={50} value={cost} onChange={(e) => setCost(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-transparent pl-1.5 text-[18px] font-extrabold tabular-nums text-[#131316] outline-none" />
              <span className="whitespace-nowrap text-[13px] font-semibold text-[#696976]">USD / hour</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[250, 500, 1000, 2500, 5000, 10000].map((v) => (
                <button key={v} type="button" onClick={() => setCost(v)} aria-pressed={cost === v}
                  className={`rounded-lg px-2.5 py-1 text-[12.5px] font-semibold transition ${cost === v ? "bg-[#C8102E] text-white" : "bg-[#F5F5F6] text-[#5A5A66] hover:bg-[#EEEEF0]"}`}>{usd(v)}</button>
              ))}
            </div>
          </Field>
          <Field id="dc-hours" label="Production hours per day"><Slider id="dc-hours" value={hoursPerDay} min={1} max={24} step={1} onChange={setHoursPerDay} suffix="hrs" /></Field>
          <Field id="dc-days" label="Production days per week"><Slider id="dc-days" value={daysPerWeek} min={1} max={7} step={1} onChange={setDaysPerWeek} suffix="days" /></Field>
          <Field id="dc-wait" label="How long would a new unit take?" hint="Your supplier's lead time">
            <div className="flex gap-2">
              <input id="dc-wait" type="number" inputMode="numeric" min={0} value={wait} onChange={(e) => setWait(Math.max(0, Number(e.target.value) || 0))} className={`${num.replace("w-full ", "")} w-24 flex-none`} />
              <div className="grid h-11 min-w-0 flex-1 grid-cols-2 gap-1.5 rounded-xl bg-[#F5F5F6] p-1">
                {(["days", "weeks"] as const).map((u) => (
                  <button key={u} type="button" onClick={() => setWaitUnit(u)} aria-pressed={waitUnit === u}
                    className={`rounded-lg text-[13.5px] font-semibold capitalize transition ${waitUnit === u ? "bg-white text-[#A50D25] shadow-sm ring-1 ring-[#C8102E]/20" : "text-[#5A5A66]"}`}>{u}</button>
                ))}
              </div>
            </div>
          </Field>
          <Field id="dc-ship" label="Shipping time to and from us" hint="Each way"><Slider id="dc-ship" value={ship} min={1} max={7} step={1} onChange={setShip} suffix={ship === 1 ? "day" : "days"} /></Field>
          <Field id="dc-part" label="Part number or machine" hint="Optional, for your PDF">
            <input id="dc-part" value={part} onChange={(e) => setPart(e.target.value)} placeholder="e.g. 6SL3120-1TE21-0AA3" className={`${num} font-mono`} />
          </Field>
        </div>
      </section>

      {/* ---------- Results ---------- */}
      <section aria-label="Results" aria-live="polite" className="lg:sticky lg:top-28">
        <div className="relative overflow-hidden rounded-[24px] bg-[#0A0A0C] p-5 text-white shadow-[0_40px_80px_-40px_rgba(200, 16, 46,0.7)] sm:p-7">
          <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(248,113,113,0.35),transparent)] blur-xl" />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(200, 16, 46,0.45),transparent)] blur-xl" />
          <p className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FCA5A5]">Waiting for a new unit costs you</p>
          <p className="relative mt-2 text-[40px] font-extrabold leading-none tracking-[-0.03em] tabular-nums sm:text-[54px]">{usd(r.newUnit.cost)}</p>
          <p className="relative mt-2 text-[13.5px] text-white/65">{Math.round(r.newUnit.hours).toLocaleString("en-US")} production hours lost over {plural(r.newUnit.days, "day")}</p>

          <ul className="relative mt-6 space-y-4">
            {scenarios.map(({ key, icon: Icon, t, d, v, bar }) => (
              <li key={key}>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex min-w-0 items-start gap-2.5">
                    <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white/10"><Icon size={16} aria-hidden="true" /></span>
                    <span className="min-w-0"><span className="block text-[14.5px] font-bold">{t}</span><span className="block text-[12px] text-white/55">{d}</span></span>
                  </span>
                  <span className="text-[17px] font-extrabold tabular-nums">{usd(v.cost)}</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full bg-linear-to-r ${bar} transition-[width] duration-500 ease-out`} style={{ width: `${Math.max(2, (v.cost / max) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>

          <div className="relative mt-6 grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#C8102E]/15 p-4 ring-1 ring-[#C8102E]/30">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[#FF8A99]"><TrendingDown size={14} aria-hidden="true" /> Repair saves about</p>
              <p className="mt-1 text-[24px] font-extrabold tabular-nums">{usd(r.saveRepair)}</p>
            </div>
            <div className="rounded-2xl bg-emerald-400/10 p-4 ring-1 ring-emerald-400/30">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-300"><TrendingDown size={14} aria-hidden="true" /> Exchange saves about</p>
              <p className="mt-1 text-[24px] font-extrabold tabular-nums">{usd(r.saveExchange)}</p>
            </div>
          </div>

          <div className="relative mt-5 grid gap-2.5 sm:grid-cols-2">
            <Link href={q({})} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white text-[14.5px] font-semibold text-[#131316] transition hover:-translate-y-0.5">
              <Wrench size={16} aria-hidden="true" /> Request a Repair
            </Link>
            <Link href={q({ service: "exchange" })} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-[14.5px] font-semibold transition hover:-translate-y-0.5">
              <RefreshCw size={16} aria-hidden="true" /> Ask About Exchange
            </Link>
          </div>
          <button type="button" onClick={downloadPdf} disabled={busy}
            className="relative mt-2.5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/6 text-[14.5px] font-semibold transition hover:border-white/40 disabled:opacity-70">
            {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Download size={16} aria-hidden="true" />} Download PDF summary
          </button>
          <p className="relative mt-2 text-center text-[12px] text-white/50">Send it to your manager or purchasing team.</p>
        </div>

        <p className="mt-3 flex items-start gap-2 px-1 text-[12px] leading-relaxed text-[#696976]">
          <Truck size={14} className="mt-0.5 flex-none text-[#B30E29]" aria-hidden="true" />
          Estimate only, based on your numbers. Repair uses 72 hr, the top of our typical 24–72 hr turnaround once a quote is approved. Exchange uses 2 business days after your unit arrives. Need it sooner? Rush handling is available for an extra fee.
        </p>
      </section>
    </div>
  );
}
