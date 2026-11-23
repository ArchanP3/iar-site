import Link from "next/link";
import type { ReactNode } from "react";

/* Shared building blocks for the CMS screens (server-safe, no hooks). */

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export const btn = {
  base: "inline-flex h-9.5 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] px-4 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
  primary: "bg-linear-to-br from-[#0066FF] to-[#00A3FF] text-white shadow-[0_12px_26px_-14px_rgba(0,102,255,0.9)] hover:brightness-110",
  dark: "bg-[#0B1A3C] text-white hover:bg-[#0052CC]",
  light: "border border-[#E3EAF3] bg-white text-[#0B1A3C] hover:border-[#0066FF] hover:text-[#0052CC]",
  danger: "border border-[#FECDCA] bg-white text-[#B42318] hover:bg-[#FEF3F2]",
  sm: "h-8 rounded-[9px] px-3 text-[12.5px]",
};
export const b = (kind: "primary" | "dark" | "light" | "danger" = "light", sm = false) => cx(btn.base, btn[kind], sm && btn.sm);

export const input =
  "w-full rounded-[10px] border border-[#D9E3EF] bg-white px-3 py-2.5 text-[13.5px] text-[#0B1A3C] outline-none transition placeholder:text-[#8494AB] focus:border-[#0066FF] focus:ring-4 focus:ring-[#0066FF]/12";
export const mono = "font-mono text-[12.5px]";

export function PageHead({ title, sub, crumb, actions }: { title: ReactNode; sub?: ReactNode; crumb?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1">
        {crumb && <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[12px] font-semibold text-[#8494AB]">{crumb}</div>}
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-[#0B1A3C] sm:text-[24px]">{title}</h1>
        {sub && <div className="mt-1 text-[13.5px] text-[#5B6B84]">{sub}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </div>
  );
}

export function Card({ title, icon, right, children, className, pad = true }: { title?: ReactNode; icon?: ReactNode; right?: ReactNode; children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={cx("min-w-0 rounded-2xl border border-[#E3EAF3] bg-white shadow-[0_1px_2px_rgba(11,26,60,0.04)]", className)}>
      {(title || right) && (
        <div className="flex items-center gap-2.5 border-b border-[#E3EAF3] px-4.5 py-3.5">
          {icon && <span className="text-[#0B1A3C]">{icon}</span>}
          {title && <h2 className="text-[14.5px] font-bold text-[#0B1A3C]">{title}</h2>}
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
  blue: "bg-[#E8F1FF] text-[#0052CC]",
  gray: "bg-[#EEF2F7] text-[#4A5B76]",
  violet: "bg-[#EEEAFE] text-[#5B3FD6]",
};
export function Pill({ tone = "gray", children }: { tone?: keyof typeof pillTone; children: ReactNode }) {
  return <span className={cx("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.75 text-[11.5px] font-bold", pillTone[tone])}>{children}</span>;
}

export function Alert({ tone = "blue", icon, children }: { tone?: "blue" | "warn" | "ok" | "bad"; icon?: ReactNode; children: ReactNode }) {
  const t = { blue: "border-[#CFE0FF] bg-[#F0F6FF] text-[#0B3A8C]", warn: "border-[#FEDF89] bg-[#FFFAEB] text-[#93370D]", ok: "border-[#ABEFC6] bg-[#ECFDF3] text-[#05603A]", bad: "border-[#FECDCA] bg-[#FEF3F2] text-[#912018]" }[tone];
  return <div className={cx("flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[12.8px] leading-relaxed", t)}>{icon}<div className="min-w-0">{children}</div></div>;
}

export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>{head.map((h, i) => <th key={i} className="whitespace-nowrap border-b border-[#E3EAF3] bg-[#FAFCFE] px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8494AB]">{h}</th>)}</tr>
        </thead>
        <tbody className="[&>tr:last-child>td]:border-0 [&>tr>td]:border-b [&>tr>td]:border-[#EEF3F9] [&>tr>td]:px-3.5 [&>tr>td]:py-2.5 [&>tr>td]:align-middle [&>tr>td]:text-[13px]">{children}</tbody>
      </table>
    </div>
  );
}

export function Empty({ icon, title, text, action }: { icon?: ReactNode; title: string; text?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      {icon && <div className="text-[#8494AB]">{icon}</div>}
      <p className="font-bold text-[#0B1A3C]">{title}</p>
      {text && <p className="max-w-md text-[13px] text-[#5B6B84]">{text}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Seg({ items, active }: { items: { label: ReactNode; href: string; key: string }[]; active: string }) {
  return (
    <div className="inline-flex flex-wrap rounded-[10px] bg-[#EEF2F7] p-0.75">
      {items.map((i) => (
        <Link key={i.key} href={i.href} className={cx("rounded-lg px-3 py-1.5 text-[12.5px] font-semibold", i.key === active ? "bg-white text-[#0B1A3C] shadow-[0_1px_3px_rgba(11,26,60,0.12)]" : "text-[#5B6B84] hover:text-[#0B1A3C]")}>
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
    <div className="flex flex-none items-center justify-center rounded-full" style={{ width: size, height: size, background: `conic-gradient(${c} 0 ${value}%, #EEF2F7 ${value}% 100%)` }}>
      <div className="flex items-center justify-center rounded-full bg-white font-extrabold text-[#0B1A3C]" style={{ width: inner, height: inner, fontSize: size / 3.6 }}>{value}</div>
    </div>
  );
}

export function Bar({ pct, color }: { pct: number; color: string }) {
  return <div className="h-1.25 overflow-hidden rounded-full bg-[#EEF2F7]"><i className="block h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} /></div>;
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

export const lenColor = (n: number, lo: number, hi: number) => (n === 0 ? "#8494AB" : n < lo ? "#F59E0B" : n > hi ? "#EF4444" : "#12B76A");
