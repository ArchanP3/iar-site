"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Info, Search, Wrench } from "lucide-react";
import { WhatsAppCta } from "@/components/WhatsAppButton";
import { decodeCode, families, normalize } from "@/lib/decoder/families";

/* Colour per position in the code, so each part is easy to match on the nameplate. */
const tones = [
  "bg-[#131316] text-white",
  "bg-[#FBE5E8] text-[#A50D25]",
  "bg-[#EFEFF0] text-[#8A0A1D]",
  "bg-[#EDE9FE] text-[#6D28D9]",
  "bg-[#DCFCE7] text-[#15803D]",
  "bg-[#FEF3C7] text-[#B45309]",
  "bg-[#FFE4E6] text-[#BE123C]",
  "bg-[#F4F4F6] text-[#404048]",
  "bg-[#E8E8EA] text-[#2A2A2F]",
  "bg-[#ECFEFF] text-[#7C1222]",
  "bg-[#FCE7F3] text-[#9D174D]",
];

const noop = () => () => {};
const readCode = () => new URLSearchParams(window.location.search).get("code");

export default function ModelCodeDecoder() {
  // Start from ?code= so a decoded code can be shared or linked from a part page (server render shows the example).
  const fromUrl = useSyncExternalStore(noop, readCode, () => null);
  const [typed, setRaw] = useState<string | null>(null);
  const raw = typed ?? fromUrl ?? families[0].examples[0];

  // Keep ?code= in step with the box without adding history entries.
  useEffect(() => {
    if (typed === null) return;
    const url = new URL(window.location.href);
    url.searchParams.set("code", normalize(raw));
    window.history.replaceState(null, "", url);
  }, [raw, typed]);

  const code = normalize(raw);
  const { family, result } = useMemo(() => decodeCode(raw), [raw]);
  const valid = Boolean(result && result.complete && result.problems.length === 0);

  return (
    <section aria-labelledby="decoder-title" className="rounded-[24px] border border-[#EAEAEC] bg-white p-4 shadow-[0_40px_80px_-50px_rgba(19,19,22,0.6)] sm:p-6">
      <h2 id="decoder-title" className="sr-only">Decode a model code</h2>
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2.5 sm:flex-row">
        <label htmlFor="model-code" className="sr-only">Model code from the motor or drive nameplate</label>
        <div className="relative flex-1">
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#696976]" />
          <input
            id="model-code"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="e.g. MKD112B-048-KG1-AN"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="h-14 w-full rounded-2xl border-2 border-[#C8102E] bg-white pl-11 pr-4 font-mono text-[17px] font-bold tracking-[0.04em] text-[#131316] outline-none ring-[#C8102E]/10 placeholder:font-sans placeholder:text-[15px] placeholder:font-medium placeholder:tracking-normal placeholder:text-[#A8A8B1] focus:ring-4 sm:text-[19px]"
          />
        </div>
        <button type="submit" className="h-12 rounded-2xl bg-linear-to-r from-[#C8102E] to-[#F31D3D] px-7 text-[15px] font-bold text-white shadow-[0_14px_30px_-14px_rgba(200,16,46,0.8)] sm:h-14">Decode</button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[12.5px] text-[#696976]">
        <span className="mr-1">Try:</span>
        {families.map((f) => (
          <button key={f.id} type="button" onClick={() => setRaw(f.examples[0])} className="rounded-lg bg-[#F5F5F6] px-2 py-1 font-mono text-[12px] font-semibold text-[#131316] hover:bg-[#FBE5E8]">
            {f.examples[0]}
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {!code ? null : !family || !result ? (
          <div className="mt-5 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4 text-[14px] text-[#5B4A1E]">
            <p className="flex items-center gap-2 font-bold text-[#3D2F0A]"><Info size={17} aria-hidden="true" /> We don&apos;t recognise this code yet.</p>
            <p className="mt-1.5 leading-relaxed">
              The decoder covers {families.map((f) => `${f.brand} ${f.series}`).join(", ")}. Check the code on the nameplate, or send it to us and we&apos;ll look it up.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/shop?q=${encodeURIComponent(code)}`} className="inline-flex h-10 items-center rounded-xl bg-white px-4 text-[13.5px] font-semibold ring-1 ring-[#EAEAEC] hover:text-[#A50D25]">Search the shop</Link>
              <Link href={`/request-repair?part=${encodeURIComponent(code)}`} className="inline-flex h-10 items-center rounded-xl bg-white px-4 text-[13.5px] font-semibold ring-1 ring-[#EAEAEC] hover:text-[#A50D25]">Request a repair quote</Link>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.16em] text-[#B30E29]">{family.brand} · {family.name}</p>
            <ol aria-label="Parts of the code" className="mt-2 flex flex-wrap gap-1.5">
              {result.segments.map((s, i) => (
                <li key={`${s.label}-${i}`} className={`rounded-xl px-2.5 py-1.5 text-center sm:px-3 ${tones[i % tones.length]}`}>
                  <span className="block font-mono text-[17px] font-bold tracking-[0.04em] sm:text-[20px]">{s.code}</span>
                  <span className="block text-[9.5px] font-bold uppercase tracking-[0.12em] opacity-85">{s.label}</span>
                </li>
              ))}
            </ol>

            {result.problems.length > 0 && (
              <div className="mt-4 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4 text-[13.5px] text-[#5B4A1E]">
                <p className="flex items-center gap-2 font-bold text-[#3D2F0A]"><AlertTriangle size={16} aria-hidden="true" /> Check this code</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5">{result.problems.map((p) => <li key={p}>{p}</li>)}</ul>
              </div>
            )}
            {result.fields.length > 0 && (
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {result.fields.map((f) => (
                  <li key={`${f.label}-${f.code}`} className="rounded-2xl border border-[#EAEAEC] bg-[#FCFCFD] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#696976]">{f.label} <span className="ml-1 font-mono normal-case tracking-normal text-[#A50D25]">{f.code}</span></p>
                    <p className="mt-1.5 text-[16px] font-extrabold leading-snug">{f.value}</p>
                    {f.detail && <p className="mt-1 text-[13px] leading-relaxed text-[#5A5A66]">{f.detail}</p>}
                  </li>
                ))}
              </ul>
            )}

            {valid && (
              <p className="mt-3 flex items-center gap-2 rounded-2xl border border-[#E3E3E6] bg-[#FFF6F7] px-4 py-3 text-[13.5px] text-[#131316]">
                <CheckCircle2 size={17} aria-hidden="true" className="text-[#C8102E]" /> Every part of this code is a listed option for this {family.kind}.
              </p>
            )}
            {!result.complete && result.problems.length === 0 && (
              <p className="mt-3 text-[13px] text-[#696976]">Keep typing: the rest of the code will be explained as you go.</p>
            )}
            {result.notes.map((n) => <p key={n} className="mt-2 text-[12.5px] text-[#696976]">{n}</p>)}

            <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-[#0A0A0C] p-4 text-white lg:flex-row lg:items-center">
              <div className="flex-1">
                <p className="text-[15px] font-bold">Working on a {family.brand} {family.series} {family.kind}?</p>
                <p className="mt-0.5 text-[13px] text-white/70">Request a repair quote, or check the part in our shop.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <Link href={`/request-repair?part=${encodeURIComponent(code)}&brand=${encodeURIComponent(family.brand)}`} className="col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#C8102E] to-[#F31D3D] px-5 text-[14px] font-semibold sm:col-span-1">
                  <Wrench size={16} aria-hidden="true" /> Request a Repair Quote
                </Link>
                <Link href={`/shop?q=${encodeURIComponent(code)}`} className="inline-flex h-12 items-center justify-center rounded-xl border border-white/25 px-5 text-[14px] font-semibold hover:bg-white/10">Find this part</Link>
                <WhatsAppCta topic={`${family.brand} ${code}`} className="h-12! px-5! text-[14px]!" />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
