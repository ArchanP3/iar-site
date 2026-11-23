"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Cable, Check, Search } from "lucide-react";
import { moreServices, serviceGroups, serviceUrl } from "@/lib/services";
import ServiceIcon from "./ServiceIcon";
import WhatsAppButton from "@/components/WhatsAppButton";

/* Short tag in each card footer */
const groupTag: Record<string, string> = { cables: "Cables", drives: "Drives", motors: "Motors", controls: "Controls", services: "Support" };

/* Second section on /services: every other repair and service, grouped. 2 columns on phones. */
export default function MoreServices() {
  const [q, setQ] = useState("");
  const [g, setG] = useState("all");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return moreServices.filter((x) => (g === "all" || x.group === g) && (!t || `${x.title} ${x.short}`.toLowerCase().includes(t)));
  }, [q, g]);
  return (
    <section aria-labelledby="more-svc" className="space-y-10">
      {/* Custom cables feature band */}
      <div className="relative overflow-hidden rounded-[28px] bg-[#0A0A0C] p-6 text-white sm:p-10">
        <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(217,28,56,0.5),transparent)] blur-xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.35),transparent)] blur-xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF8A99]"><Cable size={15} aria-hidden="true" /> Custom cables for every brand</p>
            <h2 className="mt-2 text-[26px] font-extrabold leading-tight sm:text-[34px]">Spare critical cables, <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">built to match.</span></h2>
            <p className="mt-2 max-w-160 text-[14.5px] leading-[1.7] text-white/70">Servo power, feedback and brake cables for any drive and motor. Send the models, connector photos, pinout and length.</p>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-white/80">
              {["Any brand", "Any length", "Feedback, power & brake", "Cable & connector repair"].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-400" aria-hidden="true" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/request-cable" className="inline-flex h-12 items-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-6 text-[15px] font-semibold shadow-[0_14px_30px_-14px_rgba(255,59,85,0.9)] transition hover:-translate-y-0.5">Order a Custom Cable <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link href={serviceUrl("custom-cables")} className="inline-flex h-12 items-center rounded-xl border border-white/20 px-6 text-[15px] font-semibold transition hover:border-white/40">Learn more</Link>
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="more-svc" className="text-[22px] font-extrabold sm:text-[26px]">More repair services</h2>
            <p className="mt-1 text-[14px] text-[#62626F]">Our team repairs it all. Don&apos;t see your job? <Link href="/request-repair?service=question" className="font-semibold text-[#B30E29]">Ask a technician</Link>.</p>
          </div>
          <label className="flex w-full items-center gap-2 rounded-2xl border border-[#E3E3E7] bg-white px-4 lg:w-85">
            <Search size={17} className="text-[#B30E29]" aria-hidden="true" />
            <span className="sr-only">Find a service</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a repair or service…" className="h-11 w-full bg-transparent text-[14px] outline-none placeholder:text-[#696976]" />
          </label>
        </div>
        <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
          {[{ key: "all", label: "All" }, ...serviceGroups].map((x) => (
            <button key={x.key} type="button" aria-pressed={g === x.key} onClick={() => setG(x.key)}
              className={`shrink-0 rounded-xl border px-3.5 py-2 text-[13px] font-semibold transition ${g === x.key ? "border-transparent bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-white" : "border-[#E3E3E7] bg-white text-[#131316] hover:border-[#C8102E]/40"}`}>
              {x.label}
            </button>
          ))}
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {list.map((s) => (
            <li key={s.slug} className="relative">
              <Link href={serviceUrl(s.slug)} className="hexcard group relative flex h-full flex-col overflow-hidden rounded-[18px] border border-white/10 p-3.5 pb-15 text-white sm:pb-17 shadow-[0_22px_44px_-24px_rgba(28,28,32,0.8)] transition hover:-translate-y-1 sm:rounded-[22px] sm:p-5">
                <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-xl transition group-hover:scale-125" style={{ background: `radial-gradient(closest-side, #C8102E77, transparent)` }} />
                <span className="relative flex items-start justify-between">
                  <ServiceIcon name={s.lucide} color={s.color} size={44} />
                  <ArrowUpRight size={18} className="text-[#FF5A6E] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
                <span className="relative mt-3 block min-h-[2lh] text-[14.5px] font-extrabold leading-snug sm:mt-4 sm:text-[17px]">{s.title}</span>
                <span className="relative mt-1 hidden min-h-[3lh] text-[13px] leading-normal text-white/70 sm:block">{s.short}</span>
                <span className="absolute bottom-3.5 left-3.5 flex h-9 items-center sm:bottom-5 sm:left-5">
                  <span className="rounded-full bg-[#0A0A0C]/55 px-2 py-1 ring-1 ring-white/10 text-[9.5px] font-bold uppercase tracking-[0.08em] sm:px-2.5 sm:text-[10px] sm:tracking-[0.14em]" style={{ color: s.color }}>{groupTag[s.group ?? ""] ?? "Repair"}</span>
                </span>
              </Link>
              <WhatsAppButton tone="dark" size="sm" topic={s.title} kind="service" url={serviceUrl(s.slug)} label={`Ask about ${s.title} on WhatsApp`} className="absolute right-3.5 bottom-3.5 sm:right-5 sm:bottom-5" />
            </li>
          ))}
        </ul>
        {list.length === 0 && <p className="mt-4 rounded-2xl border border-dashed border-[#D6D6DB] p-5 text-[14px] text-[#62626F]">Not listed? We still do it. <Link href="/request-repair?service=question" className="font-semibold text-[#B30E29]">Ask a technician</Link>.</p>}
      </div>
    </section>
  );
}
