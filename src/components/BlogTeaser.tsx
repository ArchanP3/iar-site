import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Clock } from "lucide-react";
import { montserrat } from "@/lib/font";
import { postUrl, prettyDate, tagInk } from "@/lib/blog";
import { allPostCards } from "@/lib/cms/blog";

/* Homepage: latest guides from the blog. Newest post is featured; the next two sit beside it. */
export default async function BlogTeaser() {
  const latest = (await allPostCards()).slice(0, 3);
  if (!latest.length) return null;
  const [first, ...rest] = latest;

  return (
    <section id="guides" aria-labelledby="guides-heading" className={`${montserrat.className} bg-white py-10 lg:py-14`}>
      <div className="mx-auto max-w-360 px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-190">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#005AE0] sm:text-[12px]">
              <span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#0066FF] to-[#00B0FF]" />
              Blog &amp; Guides
            </p>
            <h2 id="guides-heading" className="mt-3 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#0B1A3C] sm:text-[36px] lg:text-[40px]">
              From Our{" "}
              <span className="bg-linear-to-r from-[#0066FF] to-[#00B0FF] bg-clip-text text-transparent">Repair Bench</span>
            </h2>
            <p className="mt-3 text-[14px] leading-[1.65] text-[#52647F] sm:text-[16px]">
              Plain-English guides from the technicians who repair and test servo drives, motors and encoders every day.
            </p>
          </div>
          <Link
            href="/resources/blog"
            className="group inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-xl bg-[#0B1A3C] px-5 text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-16px_rgba(11,26,60,0.8)] transition hover:-translate-y-0.5 hover:bg-[#0052CC] lg:self-auto"
          >
            <BookOpen size={16} aria-hidden="true" /> View all guides <ArrowRight size={16} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          {/* Featured */}
          <article className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#050B18] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_40px_80px_-44px_rgba(0,102,255,0.75)]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <span className="absolute -left-24 -top-32 h-95 w-130 rounded-full bg-[radial-gradient(closest-side,rgba(0,102,255,0.42),transparent)] blur-2xl" />
              <span className="absolute -bottom-24 -right-15 h-105 w-130 rounded-full bg-[radial-gradient(closest-side,rgba(0,176,255,0.3),transparent)] blur-2xl" />
              <span className="absolute inset-0 bg-[linear-gradient(rgba(127,211,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(127,211,255,0.04)_1px,transparent_1px)] bg-size-[44px_44px]" />
            </div>
            <Link href={postUrl(first.slug)} className="group relative flex h-full flex-col p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#0066FF] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">Latest</span>
                <span className="rounded-full border border-white/15 bg-white/6 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7FD3FF]">{first.tag}</span>
              </div>
              <h3 className="mt-5 max-w-140 text-[24px] font-extrabold leading-[1.15] tracking-[-0.015em] sm:text-[32px]">{first.title}</h3>
              <p className="mt-3 max-w-130 text-[14.5px] leading-relaxed text-white/70">{first.description}</p>
              <div className="relative my-6 flex flex-1 items-center justify-center">
                <span aria-hidden="true" className="absolute h-[70%] w-[80%] rounded-full bg-[radial-gradient(closest-side,rgba(0,176,255,0.35),transparent)]" />
                <Image src={first.image} alt="" aria-hidden="true" width={1700} height={925} sizes="(min-width: 1024px) 560px, 90vw" className="relative h-auto w-full max-w-140 object-contain transition duration-500 group-hover:scale-[1.03]" />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                <p className="flex items-center gap-4 text-[12.5px] text-white/55">
                  <span>{prettyDate(first.date)}</span>
                  <span className="flex items-center gap-1.5"><Clock size={13} aria-hidden="true" />{first.minutes} min read</span>
                </p>
                <span className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-[14px] font-semibold text-[#0B1A3C]">
                  Read the guide <ArrowRight size={15} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </div>
            </Link>
          </article>

          {/* Two more */}
          <div className="grid gap-5">
            {rest.map((p) => (
              <article key={p.slug} className="overflow-hidden rounded-[24px] border border-[#E3EAF3] bg-white shadow-[0_30px_60px_-48px_rgba(11,26,60,0.6)] transition hover:-translate-y-0.5 hover:border-[#0066FF]/35 hover:shadow-[0_34px_70px_-44px_rgba(0,82,204,0.5)]">
                <Link href={postUrl(p.slug)} className="group grid h-full sm:grid-cols-[200px_minmax(0,1fr)]">
                  <div className="relative flex min-h-37.5 items-center justify-center overflow-hidden bg-[radial-gradient(120%_90%_at_30%_10%,#FFFFFF_0%,#EEF4FB_60%,#E2ECF8_100%)] p-4">
                    <span aria-hidden="true" className="absolute inset-x-6 bottom-3 h-6 rounded-full bg-[#0B1A3C]/10 blur-md" />
                    <Image src={p.image} alt="" aria-hidden="true" width={1700} height={925} sizes="200px" className="relative h-auto w-full max-w-52.5 object-contain transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="flex flex-col p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em]" style={{ background: `${p.color}14`, color: tagInk(p.color) }}>{p.tag}</span>
                      <ArrowUpRight size={18} className="flex-none text-[#B5C3D6] transition group-hover:text-[#005AE0]" aria-hidden="true" />
                    </div>
                    <h3 className="mt-3 text-[17.5px] font-extrabold leading-snug text-[#0B1A3C] group-hover:text-[#005AE0]">{p.title}</h3>
                    <p className="mt-1.5 line-clamp-3 text-[13.5px] leading-relaxed text-[#52647F]">{p.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0052CC]">Read guide <ArrowRight size={14} className="transition group-hover:translate-x-0.5" aria-hidden="true" /></span>
                    <p className="mt-auto flex items-center gap-4 pt-3 text-[12px] text-[#5B6B84]">
                      <span>{prettyDate(p.date)}</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} aria-hidden="true" />{p.minutes} min read</span>
                    </p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
