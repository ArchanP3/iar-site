import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Clock } from "lucide-react";
import { brandFont } from "@/lib/font";
import { postUrl, prettyDate, tagInk } from "@/lib/blog";
import { allPostCards } from "@/lib/cms/blog";

/* Homepage: latest guides from the blog. Newest post is featured; the next two sit beside it. */
export default async function BlogTeaser() {
  const latest = (await allPostCards()).slice(0, 3);
  if (!latest.length) return null;
  const [first, ...rest] = latest;

  return (
    <section id="guides" aria-labelledby="guides-heading" className={`${brandFont.className} bg-white py-10 lg:py-14`}>
      <div className="mx-auto max-w-360 px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-190">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B30E29] sm:text-[12px]">
              <span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#C8102E] to-[#FF3B55]" />
              Blog &amp; Guides
            </p>
            <h2 id="guides-heading" className="mt-3 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#131316] sm:text-[36px] lg:text-[40px]">
              From Our{" "}
              <span className="bg-linear-to-r from-[#C8102E] to-[#FF3B55] bg-clip-text text-transparent">Repair Bench</span>
            </h2>
            <p className="mt-3 text-[14px] leading-[1.65] text-[#62626F] sm:text-[16px]">
              Plain-English guides from the technicians who repair and test servo drives, motors and encoders every day.
            </p>
          </div>
          <Link
            href="/resources/blog"
            className="group inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-xl bg-[#131316] px-5 text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-16px_rgba(19, 19, 22,0.8)] transition hover:-translate-y-0.5 hover:bg-[#A50D25] lg:self-auto"
          >
            <BookOpen size={16} aria-hidden="true" /> View all guides <ArrowRight size={16} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          {/* Featured */}
          <article className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0A0A0C] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_40px_80px_-44px_rgba(200, 16, 46,0.75)]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <span className="absolute -left-24 -top-32 h-95 w-130 rounded-full bg-[radial-gradient(closest-side,rgba(200, 16, 46,0.42),transparent)] blur-2xl" />
              <span className="absolute -bottom-24 -right-15 h-105 w-130 rounded-full bg-[radial-gradient(closest-side,rgba(255, 59, 85,0.3),transparent)] blur-2xl" />
              <span className="absolute inset-0 bg-[linear-gradient(rgba(255, 138, 153,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255, 138, 153,0.04)_1px,transparent_1px)] bg-size-[44px_44px]" />
            </div>
            <Link href={postUrl(first.slug)} className="group relative flex h-full flex-col p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#C8102E] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">Latest</span>
                <span className="rounded-full border border-white/15 bg-white/6 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#FF8A99]">{first.tag}</span>
              </div>
              <h3 className="mt-5 max-w-140 text-[24px] font-extrabold leading-[1.15] tracking-[-0.015em] sm:text-[32px]">{first.title}</h3>
              <p className="mt-3 max-w-130 text-[14.5px] leading-relaxed text-white/70">{first.description}</p>
              <div className="relative my-6 flex flex-1 items-center justify-center">
                <span aria-hidden="true" className="absolute h-[70%] w-[80%] rounded-full bg-[radial-gradient(closest-side,rgba(255, 59, 85,0.35),transparent)]" />
                <Image src={first.image} alt="" aria-hidden="true" width={1700} height={925} sizes="(min-width: 1024px) 560px, 90vw" className="relative h-auto w-full max-w-140 object-contain transition duration-500 group-hover:scale-[1.03]" />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                <p className="flex items-center gap-4 text-[12.5px] text-white/55">
                  <span>{prettyDate(first.date)}</span>
                  <span className="flex items-center gap-1.5"><Clock size={13} aria-hidden="true" />{first.minutes} min read</span>
                </p>
                <span className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-[14px] font-semibold text-[#131316]">
                  Read the guide <ArrowRight size={15} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </div>
            </Link>
          </article>

          {/* Two more */}
          <div className="grid gap-5">
            {rest.map((p) => (
              <article key={p.slug} className="overflow-hidden rounded-[24px] border border-[#EAEAEC] bg-white shadow-[0_30px_60px_-48px_rgba(19, 19, 22,0.6)] transition hover:-translate-y-0.5 hover:border-[#C8102E]/35 hover:shadow-[0_34px_70px_-44px_rgba(165, 13, 37,0.5)]">
                <Link href={postUrl(p.slug)} className="group grid h-full sm:grid-cols-[200px_minmax(0,1fr)]">
                  <div className="relative flex min-h-37.5 items-center justify-center overflow-hidden bg-[radial-gradient(120%_90%_at_30%_10%,#FFFFFF_0%,#F4F4F5_60%,#F7E3E6_100%)] p-4">
                    <span aria-hidden="true" className="absolute inset-x-6 bottom-3 h-6 rounded-full bg-[#131316]/10 blur-md" />
                    <Image src={p.image} alt="" aria-hidden="true" width={1700} height={925} sizes="200px" className="relative h-auto w-full max-w-52.5 object-contain transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="flex flex-col p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em]" style={{ background: `${p.color}14`, color: tagInk(p.color) }}>{p.tag}</span>
                      <ArrowUpRight size={18} className="flex-none text-[#C2C2C9] transition group-hover:text-[#B30E29]" aria-hidden="true" />
                    </div>
                    <h3 className="mt-3 text-[17.5px] font-extrabold leading-snug text-[#131316] group-hover:text-[#B30E29]">{p.title}</h3>
                    <p className="mt-1.5 line-clamp-3 text-[13.5px] leading-relaxed text-[#62626F]">{p.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#A50D25]">Read guide <ArrowRight size={14} className="transition group-hover:translate-x-0.5" aria-hidden="true" /></span>
                    <p className="mt-auto flex items-center gap-4 pt-3 text-[12px] text-[#696976]">
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
