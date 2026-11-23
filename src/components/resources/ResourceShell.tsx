import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { brandFont } from "@/lib/font";

/* Shared frame for Resources pages: dark hero with breadcrumb, then content pulled up over it */
export default function ResourceShell({ crumb, title, accent, text, schema, children, wide = true }: {
  crumb: { label: string; href?: string }[]; title: string; accent: string; text: string; schema?: unknown; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <main className={`${brandFont.className} min-h-screen bg-[#F7F7F8] text-[#131316]`}>
      {schema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} /> : null}
      <Header />
      <section className="relative overflow-hidden bg-[#0A0A0C] pb-24 pt-8 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-105 w-140 rounded-full bg-[radial-gradient(closest-side,rgba(200, 16, 46,0.5),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 h-80 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(255, 59, 85,0.3),transparent)] blur-2xl" />
        <div className={`relative mx-auto px-5 sm:px-8 ${wide ? "max-w-310" : "max-w-225"}`}>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-white/60">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              {crumb.map((c) => (
                <li key={c.label} className="flex items-center gap-1.5">
                  <ChevronRight size={13} aria-hidden="true" />
                  {c.href ? <Link href={c.href} className="hover:text-white">{c.label}</Link> : <span className="text-white/85">{c.label}</span>}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="mt-4 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[44px]">
            {title} <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">{accent}</span>
          </h1>
          <p className="mt-3 max-w-170 text-[14.5px] leading-[1.65] text-white/75 sm:text-[16px]">{text}</p>
        </div>
      </section>
      <div className={`relative mx-auto -mt-14 px-5 pb-14 sm:px-8 ${wide ? "max-w-310" : "max-w-225"}`}>{children}</div>
      <Footer />
    </main>
  );
}
