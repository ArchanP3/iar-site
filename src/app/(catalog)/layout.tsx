import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { brandFont } from "@/lib/font";
import { site } from "@/lib/site";

// Shared shell for the parts catalog (/shop, /parts, /search). The marketing
// pages render Header/Footer themselves; catalog pages get them from here.
export const metadata: Metadata = {
  title: { default: `Industrial Automation Parts | ${site.name}`, template: `%s | ${site.name}` },
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${brandFont.className} flex min-h-screen flex-col bg-white text-ink`}>
      <Header />
      <main id="main" className="flex-1">
        {/* PREVIEW BRANCH ONLY: shop and part pages wait for the parts database. */}
        {process.env.PREVIEW_NO_DB === "1" ? (
          <section className="mx-auto max-w-3xl px-5 py-24 text-center">
            <h1 className="text-3xl font-extrabold">The online shop is coming soon</h1>
            <p className="mt-3 text-[#5A5A66]">This preview is not connected to the parts database yet. Call 1-877-904-6155 or request a quote for any part number.</p>
          </section>
        ) : children}
      </main>
      <Footer />
    </div>
  );
}
