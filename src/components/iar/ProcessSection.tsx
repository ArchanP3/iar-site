import Link from "next/link";
import {
  ArrowRight, ArrowLeftRight, Check, CircleCheck, ClipboardCheck, FileSignature, Gauge, Globe, MapPin, MessageSquareText, PackageCheck, ScanSearch, ShieldCheck, Truck, Wrench, type LucideIcon,
} from "lucide-react";
import { brandFont } from "@/lib/font";
import { INTAKE, PROCESS, type Step } from "./process";

const ICONS: Record<string, LucideIcon> = {
  truck: Truck, clipboard: ClipboardCheck, quote: MessageSquareText, approve: FileSignature, shield: ShieldCheck, swap: ArrowLeftRight, search: ScanSearch, wrench: Wrench, gauge: Gauge, package: PackageCheck, pin: MapPin, globe: Globe,
};

function StepIcon({ name, className }: { name: string; className?: string }) {
  if (name === "leaf") return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden><path d="M12 2l1.6 3.6 2.4-1-.6 4 2.6-1.6.6 2.2 3-.6-1.6 3 1 1.2-4.6 3.4.6 2-4.8-.8V22h-1.2v-4.6l-4.8.8.6-2-4.6-3.4 1-1.2-1.6-3 3 .6.6-2.2L8.6 8.6 8 4.6l2.4 1L12 2Z" /></svg>;
  const C = ICONS[name] ?? Check;
  return <C className={className} strokeWidth={1.8} aria-hidden />;
}

/** One stamped-metal "nameplate" card. */
function Plate({ s, i }: { s: Step; i: number }) {
  const n = String(i + 1).padStart(2, "0");
  const last = i === PROCESS.length - 1;
  return (
    <li style={{ transitionDelay: `${(i % 4) * 90}ms` }} className="plate group relative flex flex-col overflow-hidden rounded-2xl p-6 text-white transition duration-300 hover:-translate-y-1.5">
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-brand to-brand-dark" />

      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="flex items-center gap-1.5 font-display uppercase tracking-[0.2em] text-brand"><CircleCheck className="h-4 w-4" strokeWidth={2} aria-hidden />Step {n}</span>
        <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-white/70">
          <span className={`h-1.5 w-1.5 rounded-full ${last ? "bg-brand" : "bg-emerald-400"}`} />{s.status}
        </span>
      </div>

      <div className="mt-4 flex items-start gap-4">
        <span className="plate-icon grid h-14 w-14 shrink-0 place-items-center rounded-xl text-white transition duration-300 group-hover:scale-105">
          <StepIcon name={s.icon} className="h-7 w-7" />
        </span>
        <div className="min-w-0">
          <span aria-hidden className="block font-display text-5xl font-extrabold leading-none text-white">{n}</span>
        </div>
      </div>

      <h3 className="mt-4 font-display text-xl font-bold leading-snug">{s.t}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-white/65">{s.d}</p>
      <ul className="mb-6 mt-4 space-y-2 text-sm">
        {s.points.map((p) => (
          <li key={p} className="flex items-start gap-2 text-white/85"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2.5} aria-hidden />{p}</li>
        ))}
      </ul>

      <div className="mt-auto flex items-end justify-between border-t border-white/10 pt-4">
        <div className="font-mono text-[11px] uppercase leading-relaxed tracking-widest text-white/45">
          IAR repair<br /><span className="text-sm font-bold text-white/85">RMA · {n} / {String(PROCESS.length).padStart(2, "0")}</span>
        </div>
        <span aria-hidden className="hex-tile grid h-9 w-9 place-items-center bg-brand/90 text-white"><StepIcon name={s.icon} className="h-4 w-4" /></span>
      </div>
    </li>
  );
}

export function ProcessPlates({ compact = false }: { compact?: boolean }) {
  return (
    <ol className={`grid gap-5 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
      {PROCESS.map((s, i) => <Plate key={s.t} s={s} i={i} />)}
    </ol>
  );
}

export function IntakeOptions({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`grid gap-4 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-4"}`}>
      {INTAKE.map((o, i) => (
        <li key={o.t} style={{ transitionDelay: `${i * 70}ms` }} className="group flex items-start gap-4 rounded-xl border border-line bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg transition ${i === 0 ? "bg-brand text-white shadow-md shadow-brand/30" : "bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white"}`}>
            <StepIcon name={o.icon} className="h-5 w-5" />
          </span>
          <div><p className="font-display font-bold">{o.t}</p><p className="mt-0.5 text-sm leading-snug text-ink/60">{o.d}</p></div>
        </li>
      ))}
    </ul>
  );
}

export default function ProcessSection() {
  return (
    <section className={`${brandFont.className} relative overflow-hidden bg-[#f3f4f6] text-ink`}>
      <div aria-hidden className="hex-grid absolute -inset-10 opacity-[.035] [filter:invert(1)]" />
      <div className="relative mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24 2xl:px-16">
        <div className="grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.25em] text-brand"><span className="inline-block h-0.5 w-8 bg-brand" />How it works</p>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl xl:text-5xl">How Our Repair Process Works</h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-ink/70">
              Every repair follows our documented inspection, repair and testing process: inspection and failure analysis, a written quote with lead time, repair with genuine OEM components, and full testing under load. Nothing is repaired until you approve the quote, and every unit ships back with a test report.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link href="/request-repair" className="group inline-flex items-center justify-center gap-2 rounded-md bg-brand px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand/25 transition hover:-translate-y-0.5 hover:bg-brand-dark">
              <Wrench className="h-5 w-5" aria-hidden />Request a Repair Quote<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link href="/resources/shipping" className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-ink/80 bg-white px-6 py-3 font-semibold transition hover:-translate-y-0.5 hover:bg-ink hover:text-white">
              <Truck className="h-5 w-5" aria-hidden />Shipping &amp; Packing
            </Link>
          </div>
        </div>

        <p className="mt-12 font-display text-xs font-bold uppercase tracking-[0.25em] text-ink/50">How your unit reaches us</p>
        <div className="mt-4"><IntakeOptions /></div>

        <div className="mt-8"><ProcessPlates /></div>
      </div>
    </section>
  );
}
