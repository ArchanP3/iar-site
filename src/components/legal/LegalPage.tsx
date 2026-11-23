import Link from "next/link";
import { ChevronRight, FileText, Mail, MessageSquare } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { brandFont } from "@/lib/font";
import { contact } from "@/lib/contact";
import { legal } from "@/lib/legal";
import { PageExtras } from "@/lib/cms/seo";

export type LegalSection = { id: string; title: string; body: React.ReactNode };

const others = [
  { href: "/warranty", t: "Warranty" },
  { href: "/terms", t: "Terms & Conditions" },
  { href: "/privacy", t: "Privacy Policy" },
];

/* Shared layout for Privacy, Terms and Warranty: hero, contents list, numbered sections */
export default function LegalPage({ crumb, title, accent, intro, sections, path, highlights }: {
  crumb: string; title: string; accent: string; intro: string; sections: LegalSection[]; path: string;
  highlights?: { icon: React.ElementType; t: string; d: string }[];
}) {
  return (
    <main className={`${brandFont.className} min-h-screen bg-[#F7F7F8] text-[#131316]`}>
      <PageExtras path={path} />
      <Header />
      <section className="relative overflow-hidden bg-[#0A0A0C] pb-24 pt-8 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-105 w-140 rounded-full bg-[radial-gradient(closest-side,rgba(200, 16, 46,0.5),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 h-80 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(255, 59, 85,0.3),transparent)] blur-2xl" />
        <div className="relative mx-auto max-w-310 px-5 sm:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-[12.5px] text-white/60">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true"><ChevronRight size={13} /></li>
              <li className="text-white/85">{crumb}</li>
            </ol>
          </nav>
          <h1 className="mt-4 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[44px]">
            {title} <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">{accent}</span>
          </h1>
          <p className="mt-3 max-w-170 text-[14.5px] leading-[1.65] text-white/75 sm:text-[16px]">{intro}</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3.5 py-1.5 text-[12px] font-semibold text-white/75 ring-1 ring-white/10">
            <FileText size={13} className="text-[#FF8A99]" aria-hidden="true" /> Last updated {legal.updated}
          </p>
        </div>
      </section>

      <div className="relative mx-auto -mt-14 max-w-310 px-5 pb-14 sm:px-8">
        {highlights && (
          <ul className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map(({ icon: Icon, t, d }) => (
              <li key={t} className="rounded-[22px] border border-[#EAEAEC] bg-white p-5 shadow-[0_30px_60px_-45px_rgba(19, 19, 22,0.5)]">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-white"><Icon size={19} aria-hidden="true" /></span>
                <p className="mt-3 text-[16px] font-extrabold">{t}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-[#62626F]">{d}</p>
              </li>
            ))}
          </ul>
        )}

        <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-3 lg:sticky lg:top-28">
            <nav aria-label="On this page" className="rounded-[22px] border border-[#EAEAEC] bg-white p-4">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#696976]">On this page</p>
              <ol className="mt-2 space-y-0.5">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="flex gap-2.5 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-[#5A5A66] transition hover:bg-[#F7F7F8] hover:text-[#B30E29]">
                      <span className="w-5 flex-none text-right tabular-nums text-[#696976]">{i + 1}.</span>{s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="rounded-[22px] border border-[#EAEAEC] bg-white p-4">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#696976]">Policies</p>
              <ul className="mt-2">
                {others.map((o) => (
                  <li key={o.href}>
                    <Link href={o.href} aria-current={o.href === path ? "page" : undefined}
                      className={`block rounded-lg px-2 py-1.5 text-[13.5px] font-semibold transition ${o.href === path ? "bg-[#C8102E]/8 text-[#A50D25]" : "text-[#5A5A66] hover:bg-[#F7F7F8] hover:text-[#B30E29]"}`}>
                      {o.t}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <article className="rounded-[24px] border border-[#EAEAEC] bg-white shadow-[0_30px_70px_-45px_rgba(19, 19, 22,0.45)]">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-28 border-t border-[#F3F3F4] px-5 py-6 first:border-t-0 sm:px-9 sm:py-7">
                <h2 id={`${s.id}-h`} className="flex items-baseline gap-3 text-[19px] font-extrabold sm:text-[21px]">
                  <span className="text-[14px] font-bold tabular-nums text-[#B30E29]">{String(i + 1).padStart(2, "0")}</span>{s.title}
                </h2>
                <div className="legal mt-3 space-y-3 text-[14.5px] leading-[1.75] text-[#4E4E58] [&_li]:pl-1 [&_strong]:text-[#131316] [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:marker:text-[#FF3B55] [&_a]:font-semibold [&_a]:text-[#A50D25] hover:[&_a]:underline">
                  {s.body}
                </div>
              </section>
            ))}
            <div className="flex flex-col gap-3 rounded-b-[24px] border-t border-[#F3F3F4] bg-[#FAFAFB] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-9">
              <p className="text-[13.5px] text-[#62626F]">Questions about this page?</p>
              <div className="flex flex-wrap gap-2">
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#F0DADD] bg-white px-4 text-[13.5px] font-semibold hover:border-[#C8102E] hover:text-[#B30E29]"><Mail size={15} aria-hidden="true" />{contact.email}</a>
                )}
                <Link href="/contact" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#131316] px-4 text-[13.5px] font-semibold text-white hover:bg-[#C8102E]"><MessageSquare size={15} aria-hidden="true" /> Contact us</Link>
              </div>
            </div>
          </article>
        </div>
      </div>
      <Footer />
    </main>
  );
}
