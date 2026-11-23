import Link from "next/link";
import {
  AlertTriangle, ArrowRight, ArrowUpRight, BookOpen, BookText, Calculator, ChevronRight, FileCheck2, HelpCircle,
  PackageCheck, Route, Scale, ScanSearch, Binary } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FaultCodeSearch from "@/components/fault-codes/FaultCodeSearch";
import { brandFont } from "@/lib/font";
import { SITE_URL } from "@/lib/site";
import { families, totalCodes } from "@/lib/faultCodes";
import { posts } from "@/lib/blog";
import { glossary } from "@/lib/glossary";
import { faqGroups, moreFaqGroups } from "@/lib/faqs";
import { PageExtras, seo } from "@/lib/cms/seo";

const faqCount = [...faqGroups, ...moreFaqGroups].reduce((n, g) => n + g.items.length, 0);

export const generateMetadata = seo("/resources", {
  title: "Resources: Fault Codes, Guides & Tools | AutomIQ",
  description: `Free resources from our repair technicians: ${totalCodes.toLocaleString("en-US")} fault codes explained, a downtime cost calculator, repair guides and our policies.`,
  alternates: { canonical: `${SITE_URL}/resources` },
});

/* One live tile linking to a Resources page */
function Tile({ icon: Icon, t, d, href, accent = false }: { icon: React.ElementType; t: string; d: string; href: string; accent?: boolean }) {
  return (
    <Link href={href} className="group flex h-full flex-col rounded-[22px] border border-[#EAEAEC] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#C8102E]/40 hover:shadow-[0_24px_48px_-32px_rgba(200, 16, 46,0.6)]">
      <div className="flex items-start justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent ? "bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-white" : "bg-[#C8102E]/8 text-[#B30E29]"}`}><Icon size={20} aria-hidden="true" /></span>
        <ArrowUpRight size={18} className="text-[#C2C2C9] transition group-hover:text-[#B30E29]" aria-hidden="true" />
      </div>
      <p className="mt-4 text-[16.5px] font-extrabold group-hover:text-[#B30E29]">{t}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-[#696976]">{d}</p>
    </Link>
  );
}

export default function ResourcesPage() {
  return (
    <main className={`${brandFont.className} min-h-screen bg-[#F7F7F8] text-[#131316]`}>
      <PageExtras path="/resources" />
      <Header />
      <section className="relative overflow-hidden bg-[#0A0A0C] pb-24 pt-8 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-105 w-140 rounded-full bg-[radial-gradient(closest-side,rgba(200, 16, 46,0.5),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 h-80 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(255, 59, 85,0.3),transparent)] blur-2xl" />
        <div className="relative mx-auto max-w-310 px-5 sm:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-[12.5px] text-white/60">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true"><ChevronRight size={13} /></li>
              <li className="text-white/85">Resources</li>
            </ol>
          </nav>
          <h1 className="mt-4 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[44px]">
            Resources from <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">our repair bench</span>
          </h1>
          <p className="mt-3 max-w-165 text-[14.5px] leading-[1.65] text-white/75 sm:text-[16px]">
            Look up a fault code, work out what downtime is costing you, and see exactly how we work. Free, written by our technicians.
          </p>
        </div>
      </section>

      <div className="relative mx-auto -mt-14 max-w-310 space-y-10 px-5 pb-14 sm:px-8">
        {/* ---------- Featured: fault codes + calculator ---------- */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="relative rounded-[26px] bg-[#131316] p-6 text-white shadow-[0_40px_80px_-45px_rgba(200, 16, 46,0.8)] sm:p-8">
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[26px]">
              <span className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(255, 59, 85,0.45),transparent)] blur-xl" />
              <span className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[36px_36px] mask-[radial-gradient(ellipse_at_20%_0%,black,transparent_70%)]" />
            </span>
            <div className="relative flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/30"><AlertTriangle size={22} aria-hidden="true" /></span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF8A99]">Fault Code Library</p>
            </div>
            <h2 className="relative mt-4 text-[26px] font-extrabold leading-tight sm:text-[32px]">{totalCodes.toLocaleString("en-US")} fault codes, explained</h2>
            <p className="relative mt-2 max-w-115 text-[14.5px] leading-relaxed text-white/70">Plain-English meaning, common causes and safe first checks for {families.map((f) => f.short).join(", ")}.</p>
            <div className="relative mt-5"><FaultCodeSearch inputId="hub-fault-code-search" button="Look up" /></div>
            <Link href="/fault-codes" className="relative mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-[#FF8A99] hover:text-white">
              Browse the full library <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <Link href="/resources/downtime-calculator" className="group relative overflow-hidden rounded-[26px] bg-linear-to-br from-[#C8102E] to-[#FF3B55] p-6 text-white shadow-[0_40px_80px_-45px_rgba(200, 16, 46,0.9)] transition hover:-translate-y-0.5 sm:p-8">
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-16 h-72 w-72 rounded-full border border-white/20" />
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-8 -right-4 h-44 w-44 rounded-full border border-white/15" />
            <div className="relative flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25"><Calculator size={22} aria-hidden="true" /></span>
              <ArrowUpRight size={22} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </div>
            <p className="relative mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">Free tool</p>
            <h2 className="relative mt-1 text-[26px] font-extrabold leading-tight sm:text-[32px]">Downtime Cost Calculator</h2>
            <p className="relative mt-2 max-w-110 text-[14.5px] leading-relaxed text-white/85">See what waiting for a new unit costs, and how much a 24–72 hr repair or an exchange unit saves. Download the result as a PDF.</p>
            <div className="relative mt-6 grid max-w-105 grid-cols-3 gap-2 text-center">
              {[["New unit", "w-full", "bg-[#FCA5A5]"], ["Repair", "w-1/3", "bg-white"], ["Exchange", "w-1/6", "bg-[#6EE7B7]"]].map(([l, w, c]) => (
                <div key={l} className="rounded-xl bg-white/10 p-2.5">
                  <div className="h-1.5 rounded-full bg-white/15"><div className={`h-full rounded-full ${w} ${c}`} /></div>
                  <p className="mt-1.5 text-[11.5px] font-semibold text-white/85">{l}</p>
                </div>
              ))}
            </div>
            <span className="relative mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-[14px] font-semibold text-[#A50D25]">Work it out <ArrowRight size={15} aria-hidden="true" /></span>
          </Link>
        </div>

        {/* ---------- Learn ---------- */}
        <section aria-labelledby="learn">
          <h2 id="learn" className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[#B30E29]">Learn</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/resources/blog" className="group rounded-[22px] border border-[#EAEAEC] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#C8102E]/40 sm:col-span-2">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C8102E]/8 text-[#B30E29]"><BookOpen size={20} aria-hidden="true" /></span>
                <ArrowUpRight size={18} className="text-[#C2C2C9] transition group-hover:text-[#B30E29]" aria-hidden="true" />
              </div>
              <p className="mt-4 text-[16.5px] font-extrabold group-hover:text-[#B30E29]">Blog &amp; Guides</p>
              <ul className="mt-2 space-y-1.5 text-[13.5px] text-[#4E4E58]">
                {posts.map((p) => (
                  <li key={p.slug} className="flex gap-2"><span className="mt-1.75 h-1.5 w-1.5 flex-none rounded-full bg-[#FF3B55]" aria-hidden="true" />{p.title}</li>
                ))}
              </ul>
            </Link>
            <Tile icon={BookText} t="Glossary" d={`${glossary.length} terms in plain English: encoder, resolver, IGBT, DC link, VFD and more.`} href="/resources/glossary" />
            <Tile icon={HelpCircle} t="FAQs" d={`${faqCount} answers about repairs, parts, exchange, shipping, customs and warranty.`} href="/resources/faqs" />
          </div>
        </section>

        {/* ---------- Tools ---------- */}
        <section aria-labelledby="tools">
          <h2 id="tools" className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[#B30E29]">Tools</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Tile accent icon={Calculator} t="Downtime Cost Calculator" d="Waiting vs repair vs exchange, with a PDF summary for your manager." href="/resources/downtime-calculator" />
            <Tile accent icon={Scale} t="Repair or Replace Advisor" d="Five quick questions, then a clear recommendation and the right next step." href="/resources/repair-or-replace" />
            <Tile accent icon={ScanSearch} t="Part Number Checker" d="Type a part number to see refurbished stock, exchange and repair options." href="/resources/part-checker" />
            <Tile accent icon={Binary} t="Model Code Decoder" d="Decode a servo motor or drive code: Rexroth MKD, Siemens 1FK7, Allen-Bradley MPL, Yaskawa Sigma-5." href="/resources/model-code-decoder" />
          </div>
        </section>

        {/* ---------- Working with us ---------- */}
        <section aria-labelledby="work">
          <h2 id="work" className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[#B30E29]">Working with us</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Tile icon={Route} t="Repair Process" d="From check-in and free evaluation to test report and return." href="/#how-we-work" />
            <Tile icon={PackageCheck} t="How to Ship Us a Unit" d="Packing checklist, carriers, pickups and paperwork for the USA." href="/resources/shipping" />
            <div className="rounded-[22px] border border-[#EAEAEC] bg-white p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C8102E]/8 text-[#B30E29]"><FileCheck2 size={20} aria-hidden="true" /></span>
              <p className="mt-4 text-[16.5px] font-extrabold">Policies</p>
              <ul className="mt-2 space-y-1">
                {[["Warranty", "/warranty"], ["Terms & Conditions", "/terms"], ["Privacy Policy", "/privacy"]].map(([t, h]) => (
                  <li key={h}>
                    <Link href={h} className="group flex items-center justify-between rounded-lg py-1.5 text-[14px] font-semibold text-[#4E4E58] hover:text-[#B30E29]">
                      {t}<ArrowRight size={14} className="text-[#C2C2C9] transition group-hover:translate-x-0.5 group-hover:text-[#B30E29]" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
