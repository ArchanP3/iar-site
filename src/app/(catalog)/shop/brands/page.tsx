import Link from "next/link";
import { ArrowRight, ChevronRight, FileText, Wrench } from "lucide-react";
import ShopBrandDirectory from "@/components/parts/ShopBrandDirectory";
import { brands } from "@/lib/brands";
import { getManufacturers } from "@/lib/catalog";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/shop/brands", {
  title: "Shop Parts by Brand",
  description: "Shop new, surplus and refurbished automation parts by brand: Siemens, Allen-Bradley, Fanuc, Rexroth Indramat, Yaskawa and 1,000+ more. Canada & USA.",
  alternates: { canonical: "/shop/brands" },
});

const initialsOf = (name: string) =>
  name.split(/[\s-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";

export default async function ShopBrandsPage() {
  // Our brand list, plus every other manufacturer that has parts in the catalog.
  const known = new Set(brands.map((b) => b.slug));
  const list = [
    ...brands.map(({ slug, name, initials, color, card }) => ({ slug, name, initials, color, card })),
    ...(await getManufacturers())
      .filter((m) => !known.has(m.slug))
      .map((m) => ({ slug: m.slug, name: m.name, initials: initialsOf(m.name), color: "#43434C", card: `${m.product_count.toLocaleString("en-US")} parts in our catalog` })),
  ];
  return (
    <div className="bg-[#F7F7F8] text-[#131316]">
      <PageExtras path="/shop/brands" />
      <section className="relative overflow-hidden bg-[#0A0A0C] pb-24 pt-8 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-[420px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(200, 16, 46,0.5),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 h-[320px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(255, 59, 85,0.3),transparent)] blur-2xl" />
        <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-[12.5px] text-white/60">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true"><ChevronRight size={13} /></li>
              <li><Link href="/shop" className="hover:text-white">Shop Parts</Link></li>
              <li aria-hidden="true"><ChevronRight size={13} /></li>
              <li className="text-white/85">Brands</li>
            </ol>
          </nav>
          <h1 className="mt-4 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[44px]">
            Shop parts <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">by brand</span>
          </h1>
          <p className="mt-3 max-w-[660px] text-[14.5px] leading-[1.65] text-white/75 sm:text-[16px]">
            New, surplus and refurbished parts from {list.length.toLocaleString("en-US")} brands. Pick a brand to see its parts, or send us any part number.
          </p>
        </div>
      </section>

      <div className="relative mx-auto -mt-14 max-w-[1240px] px-5 pb-14 sm:px-8">
        <ShopBrandDirectory brands={list} />

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <Link href="/request-quote" className="group flex items-center gap-4 rounded-[22px] bg-[#0A0A0C] p-5 text-white transition hover:-translate-y-0.5">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white/10 text-[#FF8A99]"><FileText size={19} aria-hidden="true" /></span>
            <span className="min-w-0 flex-1"><span className="block text-[16px] font-extrabold">Can&apos;t find your part?</span><span className="block text-[13px] text-white/65">Send the part number and we&apos;ll quote it.</span></span>
            <ArrowRight size={17} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <Link href="/brands" className="group flex items-center gap-4 rounded-[22px] border border-[#EAEAEC] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#C8102E]/40">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-[#C8102E]/[0.08] text-[#C8102E]"><Wrench size={19} aria-hidden="true" /></span>
            <span className="min-w-0 flex-1"><span className="block text-[16px] font-extrabold">Need a repair instead?</span><span className="block text-[13px] text-[#696976]">See the brands we repair.</span></span>
            <ArrowRight size={17} className="text-[#C8102E] transition group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
