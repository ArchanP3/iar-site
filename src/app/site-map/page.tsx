import Link from "next/link";
import { BookOpen, Building2, ChevronRight, Factory, FileText, MapPin, Package, Search, Wrench } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { montserrat } from "@/lib/font";
import { SITE_URL } from "@/lib/site";
import { allServices, serviceUrl } from "@/lib/services";
import { brands, brandUrl } from "@/lib/brands";
import { industries, industryUrl } from "@/lib/industries";
import { categories, categoryUrl } from "@/lib/parts/categories";
import { families, familyUrl } from "@/lib/faultCodes";
import { posts, postUrl } from "@/lib/blog";
import { areasHere, areaHref } from "@/lib/serviceAreas";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/site-map", {
  title: "Sitemap | AutomIQ",
  description: "Every page on the AutomIQ Automation & Drive Services website: repair services, brands, industries, parts, fault codes and company pages.",
  alternates: { canonical: `${SITE_URL}/site-map` },
});

type Group = { title: string; icon: React.ElementType; href?: string; links: [string, string][]; wide?: boolean };

/* Built from the same data as the pages, so new services, brands or industries appear here automatically */
const groups: Group[] = [
  { title: "Repair Services", icon: Wrench, href: "/services", wide: true, links: allServices.map((s) => [s.title, serviceUrl(s.slug)]) },
  { title: "Brands", icon: Building2, href: "/brands", wide: true, links: brands.map((b) => [b.name, brandUrl(b.slug)]) },
  { title: "Service Areas", icon: MapPin, href: "/service-areas", wide: true, links: areasHere.map((a) => [`${a.city}, ${a.regionCode}`, areaHref(a)]) },
  { title: "Industries", icon: Factory, href: "/industries", wide: true, links: industries.map((i) => [i.name, industryUrl(i.slug)]) },
  { title: "Shop Parts", icon: Package, href: "/shop", links: categories.map((c) => [c.name, categoryUrl(c.slug)]) },
  { title: "Fault Code Library", icon: Search, href: "/fault-codes", links: families.map((f) => [`${f.brand} ${f.series}`, familyUrl(f)]) },
  {
    title: "Resources", icon: BookOpen, href: "/resources", wide: true, links: [
      ["Fault Code Library", "/fault-codes"], ["Blog & Guides", "/resources/blog"], ...posts.map((p) => [p.title, postUrl(p.slug)] as [string, string]),
      ["Glossary", "/resources/glossary"], ["FAQs", "/resources/faqs"], ["Downtime Cost Calculator", "/resources/downtime-calculator"],
      ["Repair or Replace Advisor", "/resources/repair-or-replace"], ["Part Number Checker", "/resources/part-checker"], ["Model Code Decoder", "/resources/model-code-decoder"], ["How to Ship Us a Unit", "/resources/shipping"],
    ],
  },
  {
    title: "Get Help", icon: FileText, links: [
      ["Shop by Brand", "/shop/brands"], ["Request a Repair", "/request-repair"], ["Request a Quote", "/request-quote"], ["Request a Pickup", "/request-pickup"], ["On-site Service", "/on-site-service"], ["International Orders", "/international"], ["Sell Your Surplus", "/sell-surplus"],
      ["Request a Custom Cable", "/request-cable"], ["Contact", "/contact"], ["Cart", "/cart"],
    ],
  },
  {
    title: "Company", icon: BookOpen, links: [
      ["Home", "/"], ["About", "/about"], ["Warranty", "/warranty"], ["Terms & Conditions", "/terms"], ["Privacy Policy", "/privacy"],
    ],
  },
];

export default function SiteMapPage() {
  const total = groups.reduce((n, g) => n + g.links.length + (g.href ? 1 : 0), 0);
  return (
    <main className={`${montserrat.className} min-h-screen bg-[#F4F7FB] text-[#0B1A3C]`}>
      <PageExtras path="/site-map" />
      <Header />
      <section className="relative overflow-hidden bg-[#050B18] pb-24 pt-8 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-105 w-140 rounded-full bg-[radial-gradient(closest-side,rgba(0,102,255,0.5),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 h-80 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(0,176,255,0.3),transparent)] blur-2xl" />
        <div className="relative mx-auto max-w-310 px-5 sm:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-[12.5px] text-white/60">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true"><ChevronRight size={13} /></li>
              <li className="text-white/85">Sitemap</li>
            </ol>
          </nav>
          <h1 className="mt-4 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[44px]">
            Site<span className="bg-linear-to-r from-[#7FD3FF] to-[#00B0FF] bg-clip-text text-transparent">map</span>
          </h1>
          <p className="mt-3 max-w-160 text-[14.5px] leading-[1.65] text-white/75 sm:text-[16px]">
            Every main page on our website in one place: {total} pages across repairs, parts, brands, industries and fault codes.
          </p>
          <form action="/search" className="mt-6 flex max-w-140 items-center gap-2 rounded-2xl bg-white/[0.07] p-1.5 ring-1 ring-white/15 focus-within:ring-[#00B0FF]/60">
            <Search size={18} className="ml-3 flex-none text-[#7FD3FF]" aria-hidden="true" />
            <input name="part" type="search" aria-label="Search parts" placeholder="Search a part number" className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/60" />
            <button type="submit" className="h-11 rounded-xl bg-white px-5 text-[14px] font-semibold text-[#0B1A3C] hover:bg-[#E6F4FF]">Search</button>
          </form>
        </div>
      </section>

      <div className="relative mx-auto -mt-14 max-w-310 px-5 pb-14 sm:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {groups.map(({ title, icon: Icon, href, links, wide }) => (
            <section key={title} aria-labelledby={`sm-${title}`} className={`min-w-0 rounded-[22px] border border-[#E3EAF3] bg-white p-5 shadow-[0_30px_60px_-45px_rgba(11,26,60,0.5)] sm:p-6 ${wide ? "md:col-span-2 lg:col-span-4" : ""}`}>
              <div className="flex items-center justify-between gap-3 border-b border-[#EEF3F9] pb-3">
                <h2 id={`sm-${title}`} className="flex items-center gap-2.5 text-[17px] font-extrabold">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-[#0066FF] to-[#00B0FF] text-white"><Icon size={17} aria-hidden="true" /></span>
                  {href ? <Link href={href} className="hover:text-[#005AE0]">{title}</Link> : title}
                </h2>
                <span className="rounded-full bg-[#F1F5FA] px-2.5 py-0.5 text-[12px] font-bold text-[#5B6B84]">{links.length}</span>
              </div>
              <ul className={`mt-3 grid gap-x-6 gap-y-0.5 ${wide ? "sm:grid-cols-2 lg:grid-cols-4" : ""}`}>
                {links.map(([label, to]) => (
                  <li key={to}>
                    <Link href={to} className="group flex items-start gap-1.5 rounded-lg py-1.5 text-[14px] leading-snug text-[#3E4F68] transition hover:text-[#005AE0]">
                      <ChevronRight size={13} className="mt-[3px] flex-none text-[#B5C3D6] transition group-hover:translate-x-0.5 group-hover:text-[#005AE0]" aria-hidden="true" />
                      <span className="min-w-0">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="mt-6 text-center text-[12.5px] text-[#5B6B84]">
          Individual part and fault code pages are listed in our <a href="/sitemap.xml" className="font-semibold text-[#0052CC] hover:underline">XML sitemap</a> for search engines.
        </p>
      </div>
      <Footer />
    </main>
  );
}
