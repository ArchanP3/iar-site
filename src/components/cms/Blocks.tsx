import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, CheckCircle2, ChevronDown } from "lucide-react";
import { getService, serviceUrl } from "@/lib/services";
import { brandUrl, getBrand } from "@/lib/brands";
import { listParts } from "@/lib/parts/repository";
import PartCard from "@/components/parts/PartCard";
import { renderMarkdown } from "@/lib/cms/markdown";
import type { Block } from "@/lib/cms/content";

/* ------------------------------------------------------------------ */
/*  Landing-page blocks built in the CMS. Each block uses the website's */
/*  own look, so new pages always match the brand.                      */
/* ------------------------------------------------------------------ */

export const fill = (s: string | undefined, vars: Record<string, string>) =>
  (s ?? "").replace(/\{([a-z_]+)\}/gi, (m, k) => vars[k.toLowerCase()] ?? m);

const wrap = "mx-auto max-w-310 px-5 sm:px-8";
const md = "space-y-3 text-[15.5px] leading-[1.8] text-[#3E4F68] [&_a]:font-semibold [&_a]:text-[#0052CC] [&_h2]:mt-6 [&_h2]:text-[22px] [&_h2]:font-extrabold [&_h2]:text-[#0B1A3C] [&_h3]:mt-4 [&_h3]:text-[18px] [&_h3]:font-bold [&_h3]:text-[#0B1A3C] [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:text-[#0B1A3C] [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:marker:text-[#00B0FF]";

function Btn({ link, primary, dark }: { link?: { label: string; href: string }; primary?: boolean; dark?: boolean }) {
  if (!link?.label || !link.href) return null;
  return (
    <Link href={link.href} className={primary
      ? "inline-flex h-12 items-center gap-2 rounded-xl bg-linear-to-br from-[#0066FF] to-[#00B0FF] px-6 text-[15px] font-semibold text-white shadow-[0_14px_30px_-14px_rgba(0,102,255,0.9)] transition hover:brightness-110"
      : `inline-flex h-12 items-center gap-2 rounded-xl border px-6 text-[15px] font-semibold transition ${dark ? "border-white/25 text-white hover:bg-white/10" : "border-[#D9E4F1] bg-white text-[#0B1A3C] hover:border-[#0066FF]"}`}>
      {link.label} {primary && <ArrowRight size={16} aria-hidden="true" />}
    </Link>
  );
}

export async function Blocks({ blocks, vars }: { blocks: Block[]; vars: Record<string, string> }) {
  let h1Used = false;
  const out = [];
  for (const [i, raw] of blocks.entries()) {
    const b = raw;
    const H = (!h1Used && b.type === "hero" ? "h1" : "h2") as "h1" | "h2";
    if (b.type === "hero") h1Used = true;
    out.push(<Section key={i} b={b} vars={vars} H={H} />);
  }
  return <>{out}</>;
}

async function Section({ b, vars, H }: { b: Block; vars: Record<string, string>; H: "h1" | "h2" }) {
  const f = (s?: string) => fill(s, vars);
  switch (b.type) {
    case "hero": {
      const dark = b.tone !== "light";
      return (
        <section className={`relative overflow-hidden ${dark ? "bg-[#050B18] text-white" : "bg-white text-[#0B1A3C]"}`}>
          {dark && <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_15%_0%,rgba(0,102,255,0.45),transparent_60%),radial-gradient(50%_60%_at_100%_100%,rgba(0,176,255,0.2),transparent_60%)]" />}
          <div className={`${wrap} relative py-16 sm:py-20`}>
            {b.eyebrow && <p className={`flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.24em] ${dark ? "text-[#7FD3FF]" : "text-[#0066FF]"}`}><span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#0066FF] to-[#00B0FF]" />{f(b.eyebrow)}</p>}
            <H className="mt-4 max-w-205 text-[34px] font-extrabold leading-[1.08] tracking-[-0.02em] sm:text-[48px]">{f(b.heading)}</H>
            {b.text && <p className={`mt-5 max-w-160 text-[16px] leading-relaxed sm:text-[18px] ${dark ? "text-white/75" : "text-[#52647F]"}`}>{f(b.text)}</p>}
            <div className="mt-8 flex flex-wrap gap-3"><Btn link={b.primary && { label: f(b.primary.label), href: f(b.primary.href) }} primary /><Btn link={b.secondary && { label: f(b.secondary.label), href: f(b.secondary.href) }} dark={dark} /></div>
          </div>
        </section>
      );
    }
    case "text": {
      const { html } = renderMarkdown(f(b.body));
      return (
        <section className={`${wrap} py-12`}>
          <div className="mx-auto max-w-205">
            {b.heading && <H className="text-[26px] font-extrabold tracking-[-0.02em] text-[#0B1A3C] sm:text-[32px]">{f(b.heading)}</H>}
            <div className={`${md} mt-4`} dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </section>
      );
    }
    case "services": {
      const list = b.items.map(getService).filter((s): s is NonNullable<typeof s> => Boolean(s));
      return (
        <section className={`${wrap} py-12`}>
          {b.heading && <H className="text-[26px] font-extrabold tracking-[-0.02em] text-[#0B1A3C] sm:text-[32px]">{f(b.heading)}</H>}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <Link key={s.slug} href={serviceUrl(s.slug)} className="group flex gap-4 rounded-[22px] border border-[#E3EAF3] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#0066FF]/40">
                {s.icon && <Image src={s.icon} alt="" width={72} height={72} className="h-18 w-18 flex-none object-contain" />}
                <div><p className="font-extrabold text-[#0B1A3C] group-hover:text-[#0066FF]">{s.title}</p><p className="mt-1 text-[13.5px] leading-relaxed text-[#52647F]">{s.short}</p></div>
              </Link>
            ))}
          </div>
        </section>
      );
    }
    case "brands": {
      const list = b.items.map(getBrand).filter((x): x is NonNullable<typeof x> => Boolean(x));
      return (
        <section className={`${wrap} py-10`}>
          {b.heading && <H className="text-[22px] font-extrabold text-[#0B1A3C] sm:text-[26px]">{f(b.heading)}</H>}
          <div className="mt-5 flex flex-wrap gap-2.5">
            {list.map((x) => <Link key={x.slug} href={brandUrl(x.slug)} className="rounded-xl border border-[#E3EAF3] bg-white px-4 py-2.5 text-[14px] font-bold text-[#0B1A3C] hover:border-[#0066FF] hover:text-[#0052CC]">{x.name}</Link>)}
          </div>
        </section>
      );
    }
    case "steps":
      return (
        <section className={`${wrap} py-12`}>
          {b.heading && <H className="text-[26px] font-extrabold tracking-[-0.02em] text-[#0B1A3C] sm:text-[32px]">{f(b.heading)}</H>}
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {b.items.map((s, i) => (
              <li key={i} className="rounded-[22px] border border-[#E3EAF3] bg-white p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-[#0066FF] to-[#00B0FF] text-[14px] font-bold text-white">{i + 1}</span>
                <p className="mt-3 font-extrabold text-[#0B1A3C]">{f(s.t)}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-[#52647F]">{f(s.d)}</p>
              </li>
            ))}
          </ol>
        </section>
      );
    case "trust":
      return (
        <section className={`${wrap} py-8`}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {b.items.map((t, i) => (
              <div key={i} className="flex items-start gap-3 rounded-[20px] border border-[#E3EAF3] bg-white p-4">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[#0066FF]/8 text-[#0066FF]"><BadgeCheck size={19} aria-hidden="true" /></span>
                <div><p className="font-bold text-[#0B1A3C]">{f(t.t)}</p><p className="text-[13px] text-[#52647F]">{f(t.d)}</p></div>
              </div>
            ))}
          </div>
        </section>
      );
    case "faq":
      return (
        <section className={`${wrap} py-12`}>
          <div className="mx-auto max-w-215">
            <H className="text-[26px] font-extrabold tracking-[-0.02em] text-[#0B1A3C] sm:text-[32px]">{f(b.heading) || "Frequently asked questions"}</H>
            <div className="mt-5 divide-y divide-[#EEF3F9] rounded-[22px] border border-[#E3EAF3] bg-white">
              {b.items.map(([q, a], i) => (
                <details key={i} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-[#0B1A3C]">{f(q)}<ChevronDown size={18} className="flex-none text-[#8494AB] transition group-open:rotate-180" aria-hidden="true" /></summary>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#3E4F68]">{f(a)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      );
    case "imageText": {
      const { html } = renderMarkdown(f(b.body));
      return (
        <section className={`${wrap} grid items-center gap-8 py-12 lg:grid-cols-2`}>
          <div className={`flex min-h-65 items-center justify-center rounded-[24px] border border-[#E3EAF3] bg-[radial-gradient(120%_90%_at_30%_10%,#FFFFFF_0%,#EEF4FB_55%,#E2ECF8_100%)] p-6 ${b.side === "right" ? "lg:order-2" : ""}`}>
            {b.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.image} alt={f(b.alt)} loading="lazy" className="max-h-80 w-auto object-contain" />}
          </div>
          <div>
            <H className="text-[26px] font-extrabold tracking-[-0.02em] text-[#0B1A3C] sm:text-[32px]">{f(b.heading)}</H>
            <div className={`${md} mt-4`} dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </section>
      );
    }
    case "cta":
      return (
        <section className={`${wrap} py-12`}>
          <div className="relative overflow-hidden rounded-[28px] bg-linear-to-br from-[#0B1A3C] to-[#0A2A6E] p-8 text-white sm:p-12">
            <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(0,176,255,0.45),transparent)]" />
            <H className="relative max-w-170 text-[28px] font-extrabold leading-tight sm:text-[36px]">{f(b.heading)}</H>
            {b.text && <p className="relative mt-3 max-w-155 text-[15.5px] text-white/75">{f(b.text)}</p>}
            <div className="relative mt-7 flex flex-wrap gap-3"><Btn link={{ label: f(b.primary?.label), href: f(b.primary?.href) }} primary /><Btn link={b.secondary && { label: f(b.secondary.label), href: f(b.secondary.href) }} dark /></div>
            <ul className="relative mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] text-white/80">
              {["Free evaluation", "12-month warranty", "Canada & USA"].map((t) => <li key={t} className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-[#7FD3FF]" aria-hidden="true" />{t}</li>)}
            </ul>
          </div>
        </section>
      );
    case "parts": {
      const res = await listParts({ q: f(b.query), page: 1 }).catch(() => null);
      if (!res?.items.length) return null;
      res.items = res.items.slice(0, 6);
      return (
        <section className={`${wrap} py-12`}>
          <div className="flex items-end justify-between gap-4">
            <H className="text-[26px] font-extrabold tracking-[-0.02em] text-[#0B1A3C] sm:text-[32px]">{f(b.heading) || "Parts in stock"}</H>
            <Link href={`/shop?q=${encodeURIComponent(f(b.query))}`} className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#0052CC]">View all <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{res.items.map((p) => <PartCard key={p.slug} p={p} />)}</div>
        </section>
      );
    }
    default:
      return null;
  }
}

/** FAQ items across all blocks, for FAQ schema. */
export const blockFaqs = (blocks: Block[], vars: Record<string, string>) =>
  blocks.flatMap((b) => (b.type === "faq" ? b.items.map(([q, a]) => [fill(q, vars), fill(a, vars)] as [string, string]) : []));
