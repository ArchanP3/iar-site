import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { brandFont } from "@/lib/font";

// Shared shell for the parts catalog (/shop, /parts, /search). The marketing
// pages render Header/Footer themselves; catalog pages get them from here.
export const metadata: Metadata = {
  title: { default: `Industrial Automation Parts | IAR`, template: `%s | IAR` },
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${brandFont.className} flex min-h-screen flex-col bg-white text-ink`}>
      <Header />
      <main id="main" className="flex-1">
        {/* PREVIEW BRANCH ONLY: the shop shows 10 sample listings (src/lib/demoCatalog.ts) until the parts database is connected. */}
        {process.env.PREVIEW_NO_DB === "1" && (
          <p className="bg-[#FBE9EC] px-5 py-2 text-center text-[13px] font-semibold text-[#A50D25]">Preview: these are 10 sample listings. Prices and stock are examples only.</p>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
}
