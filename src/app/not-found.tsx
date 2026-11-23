import Link from "next/link";
import { ArrowRight, Search, Wrench } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { montserrat } from "@/lib/font";
import NotFoundBeacon from "@/components/cms/NotFoundBeacon";

export default function NotFound() {
  return (
    <div className={`${montserrat.className} flex min-h-screen flex-col`}>
      <Header />
      <main className="relative flex-1 overflow-hidden bg-[#050B18] px-4 py-24 text-white sm:py-32">
        <NotFoundBeacon />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(0,102,255,0.35),transparent)]" />
      <div className="relative mx-auto max-w-xl text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-[#5AB4FF]">Error 404</p>
        <h1 className="mt-3 text-[34px] font-bold leading-tight sm:text-[44px]">This page isn&apos;t here</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-white/70">
          The link may be old or the page has moved. Your repair, part or fault code is still a click away.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/request-repair" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A6CFF] px-5 py-3 text-[15px] font-semibold shadow-[0_10px_30px_-10px_rgba(10,108,255,0.8)] hover:bg-[#2B80FF]">
            <Wrench size={17} /> Request a Repair
          </Link>
          <Link href="/services" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-[15px] font-semibold hover:bg-white/10">
            Repair services <ArrowRight size={16} />
          </Link>
          <Link href="/fault-codes" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-[15px] font-semibold hover:bg-white/10">
            <Search size={16} /> Fault codes
          </Link>
        </div>
      </div>
    </main>
      <Footer />
    </div>
  );
}
