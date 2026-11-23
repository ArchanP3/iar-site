import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import ResourceShell from "@/components/resources/ResourceShell";
import { postUrl, prettyDate, tagInk } from "@/lib/blog";
import { allPostCards } from "@/lib/cms/blog";
import { SITE_URL } from "@/lib/site";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/resources/blog", {
  title: "Blog & Guides: Servo Drive, Motor & Encoder Repair | IAR",
  description: "Practical guides from our repair bench: repair vs replace a servo drive, how we test motors and drives on our test benches, encoder alignment explained.",
  alternates: { canonical: `${SITE_URL}/resources/blog` },
});

export default async function BlogIndex() {
  const [first, ...rest] = await allPostCards();
  return (
    <ResourceShell crumb={[{ label: "Resources", href: "/resources" }, { label: "Blog & Guides" }]} title="Blog &" accent="guides"
      text="Practical, plain-English guides from our repair bench: how to decide, what to check and how we work.">
      <PageExtras path="/resources/blog" />
      <Link href={postUrl(first.slug)} className="group relative block overflow-hidden rounded-[26px] bg-[#131316] p-6 text-white shadow-[0_40px_80px_-45px_rgba(200,16,46,0.8)] transition hover:-translate-y-0.5 sm:p-9">
        <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full blur-xl" style={{ background: `radial-gradient(closest-side, ${first.color}88, transparent)` }} />
        <span className="relative inline-flex rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#FF8A99]">Featured · {first.tag}</span>
        <h2 className="relative mt-4 max-w-190 text-[26px] font-extrabold leading-tight sm:text-[36px]">{first.title}</h2>
        <p className="relative mt-3 max-w-170 text-[15px] leading-relaxed text-white/75">{first.description}</p>
        <p className="relative mt-5 flex items-center gap-4 text-[13px] text-white/60">
          <span>{prettyDate(first.date)}</span><span className="flex items-center gap-1.5"><Clock size={13} aria-hidden="true" />{first.minutes} min read</span>
        </p>
        <span className="relative mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-[14px] font-semibold text-[#131316]">Read the guide <ArrowRight size={15} className="transition group-hover:translate-x-0.5" aria-hidden="true" /></span>
      </Link>

      <ul className="mt-5 grid gap-4 md:grid-cols-2">
        {rest.map((p) => (
          <li key={p.slug}>
            <Link href={postUrl(p.slug)} className="group flex h-full flex-col rounded-[22px] border border-[#EAEAEC] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#C8102E]/40">
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ background: `${p.color}14`, color: tagInk(p.color) }}>{p.tag}</span>
                <ArrowUpRight size={18} className="text-[#C2C2C9] transition group-hover:text-[#B30E29]" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-[20px] font-extrabold leading-snug group-hover:text-[#B30E29]">{p.title}</h2>
              <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[#62626F]">{p.description}</p>
              <p className="mt-4 flex items-center gap-4 text-[12.5px] text-[#696976]"><span>{prettyDate(p.date)}</span><span className="flex items-center gap-1.5"><Clock size={13} aria-hidden="true" />{p.minutes} min read</span></p>
            </Link>
          </li>
        ))}
      </ul>
    </ResourceShell>
  );
}
