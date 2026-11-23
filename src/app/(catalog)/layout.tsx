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
        {children}
      </main>
      <Footer />
    </div>
  );
}
