import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { brandFont } from "@/lib/font";

/* Shared frame for the cart, checkout and account pages */
export default function ShopShell({ crumb, title, accent, text, secure, children }: {
  crumb: string; title: string; accent: string; text: string; secure?: boolean; children: React.ReactNode;
}) {
  return (
    <main className={`${brandFont.className} flex min-h-screen flex-col bg-[#F7F7F8] text-[#131316]`}>
      <Header />
      <section className="relative overflow-hidden bg-[#0A0A0C] pb-24 pt-8 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-105 w-140 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.5),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 h-80 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(255,59,85,0.3),transparent)] blur-2xl" />
        <div className="relative mx-auto flex max-w-310 flex-wrap items-end justify-between gap-4 px-5 sm:px-8">
          <div>
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5 text-[12.5px] text-white/60">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li aria-hidden="true"><ChevronRight size={13} /></li>
                <li className="text-white/85">{crumb}</li>
              </ol>
            </nav>
            <h1 className="mt-4 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[40px]">
              {title} <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">{accent}</span>
            </h1>
            <p className="mt-2 max-w-160 text-[14.5px] leading-[1.6] text-white/75 sm:text-[16px]">{text}</p>
          </div>
          {secure && (
            <p className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[12.5px] font-semibold text-white/85 ring-1 ring-white/15">
              <Lock size={13} className="text-[#FF8A99]" aria-hidden="true" /> No payment taken online yet
            </p>
          )}
        </div>
      </section>
      <div className="relative mx-auto -mt-16 w-full max-w-310 flex-1 px-5 pb-14 sm:px-8">{children}</div>
      <Footer />
    </main>
  );
}
