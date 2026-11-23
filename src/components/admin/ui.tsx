import Link from "next/link";
import type { ReactNode } from "react";

/* Shared building blocks for the CMS screens (server-safe, no hooks). */

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export const btn = {
  base: "inline-flex h-9.5 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] px-4 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
  primary: "bg-linear-to-br from-[#C8102E] to-[#DA0B2A] text-white shadow-[0_12px_26px_-14px_rgba(200,16,46,0.9)] hover:brightness-110",
  dark: "bg-[#131316] text-white hover:bg-[#A50D25]",
  light: "border border-[#EAEAEC] bg-white text-[#131316] hover:border-[#C8102E] hover:text-[#A50D25]",
  danger: "border border-[#FECDCA] bg-white text-[#B42318] hover:bg-[#FEF3F2]",
  sm: "h-8 rounded-[9px] px-3 text-[12.5px]",
};
export const b = (kind: "primary" | "dark" | "light" | "danger" = "light", sm = false) => cx(btn.base, btn[kind], sm && btn.sm);

export const input =
  "w-full rounded-[10px] border border-[#EEDADD] bg-white px-3 py-2.5 text-[13.5px] text-[#131316] outline-none transition placeholder:text-[#91919E] focus:border-[#C8102E] focus:ring-4 focus:ring-[#C8102E]/12";
export const mono = "font-mono text-[12.5px]";

export function PageHead({ title, sub, crumb, actions }: { title: ReactNode; sub?: ReactNode; crumb?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1">
        {crumb && <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[12px] font-semibold text-[#91919E]">{crumb}</div>}
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-[#131316] sm:text-[24px]">{title}</h1>
        {sub && <div className="mt-1 text-[13.5px] text-[#696976]">{sub}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </div>
  );
}

export function Card({ title, icon, right, children, className, pad = true }: { title?: ReactNode; icon?: ReactNode; right?: ReactNode; children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={cx("min-w-0 rounded-2xl border border-[#EAEAEC] bg-white shadow-[0_1px_2px_rgba(19,19,22,0.04)]", className)}>
      {(title || right) && (
        <div className="flex items-center gap-2.5 border-b border-[#EAEAEC] px-4.5 py-3.5">
          {icon && <span className="text-[#131316]">{icon}</span>}
          {title && <h2 className="text-[14.5px] font-bold text-[#131316]">{title}</h2>}
          {right && <div className="ml-auto flex flex-wrap items-center gap-2">{right}</div>}
        </div>
      )}
      <div className={pad ? "p-4.5" : ""}>{children}</div>
    </section>
  );
}

const pillTone = {
  ok: "bg-[#E7F8EF] text-[#067647]",
  warn: "bg-[#FEF3C7] text-[#B45309]",
  bad: "bg-[#FEE4E2] text-[#B42318]",
  blue: "bg-[#FBE7EA] text-[#A50D25]",
  gray: "bg-[#F2F2F3] text-[#5A5A66]",
  violet: "bg-[#EEEAFE] text-[#5B3FD6]",
};
export function Pill({ tone = "gray", children }: { tone?: keyof typeof pillTone; children: ReactNode }) {
  return <span className={cx("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.75 text-[11.5px] font-bold", pillTone[tone])}>{children}</span>;
}

export function Alert({ tone = "blue", icon, children }: { tone?: "blue" | "warn" | "ok" | "bad"; icon?: ReactNode; children: ReactNode }) {
  const t = { blue: "border-[#FDD1D8] bg-[#FDF1F3] text-[#78101F]", warn: "border-[#FEDF89] bg-[#FFFAEB] text-[#93370D]", ok: "border-[#ABEFC6] bg-[#ECFDF3] text-[#05603A]", bad: "border-[#FECDCA] bg-[#FEF3F2] text-[#912018]" }[tone];
  return <div className={cx("flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[12.8px] leading-relaxed", t)}>{icon}<div className="min-w-0">{children}</div></div>;
}

export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>{head.map((h, i) => <th key={i} className="whitespace-nowrap border-b border-[#EAEAEC] bg-[#FCFCFC] px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#91919E]">{h}</th>)}</tr>
        </thead>
        <tbody className="[&>tr:last-child>td]:border-0 [&>tr>td]:border-b [&>tr>td]:border-[#F3F3F4] [&>tr>td]:px-3.5 [&>tr>td]:py-2.5 [&>tr>td]:align-middle [&>tr>td]:text-[13px]">{children}</tbody>
      </table>
    </div>
  );
}

export function Empty({ icon, title, text, action }: { icon?: ReactNode; title: string; text?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      {icon && <div className="text-[#91919E]">{icon}</div>}
      <p className="font-bold text-[#131316]">{title}</p>
      {text && <p className="max-w-md text-[13px] text-[#696976]">{text}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Seg({ items, active }: { items: { label: ReactNode; href: string; key: string }[]; active: string }) {
  return (
    <div className="inline-flex flex-wrap rounded-[10px] bg-[#F2F2F3] p-0.75">
      {items.map((i) => (
        <Link key={i.key} href={i.href} className={cx("rounded-lg px-3 py-1.5 text-[12.5px] font-semibold", i.key === active ? "bg-white text-[#131316] shadow-[0_1px_3px_rgba(19,19,22,0.12)]" : "text-[#696976] hover:text-[#131316]")}>
          {i.label}
        </Link>
      ))}
    </div>
  );
}

export function Score({ value, size = 64 }: { value: number; size?: number }) {
  const c = value >= 85 ? "#12B76A" : value >= 65 ? "#F59E0B" : "#EF4444";
  const inner = size - 12;
  return (
    <div className="flex flex-none items-center justify-center rounded-full" style={{ width: size, height: size, background: `conic-gradient(${c} 0 ${value}%, #F2F2F3 ${value}% 100%)` }}>
      <div className="flex items-center justify-center rounded-full bg-white font-extrabold text-[#131316]" style={{ width: inner, height: inner, fontSize: size / 3.6 }}>{value}</div>
    </div>
  );
}

export function Bar({ pct, color }: { pct: number; color: string }) {
  return <div className="h-1.25 overflow-hidden rounded-full bg-[#F2F2F3]"><i className="block h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} /></div>;
}

export function ago(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const t = new Date(d).getTime();
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  if (s < 172800) return "Yesterday";
  return new Date(d).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

export const lenColor = (n: number, lo: number, hi: number) => (n === 0 ? "#91919E" : n < lo ? "#F59E0B" : n > hi ? "#EF4444" : "#12B76A");
