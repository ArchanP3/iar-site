import Link from "next/link";
import { ChevronRight, ShieldAlert } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { montserrat } from "@/lib/font";
import { SITE_URL } from "@/lib/site";

export type Crumb = { label: string; href?: string };

/* Header, breadcrumb trail and footer shared by every fault code page */
export function LibraryShell({ children }: { children: React.ReactNode }) {
  return (
    <main className={`${montserrat.className} min-h-screen bg-white text-[#0B1A3C]`}>
      <Header />
      {children}
      <Footer />
    </main>
  );
}

export function Breadcrumbs({ items, dark = false }: { items: Crumb[]; dark?: boolean }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={`flex flex-wrap items-center gap-1.5 text-[12.5px] ${dark ? "text-white/55" : "text-[#56677F]"}`}>
        {items.map((c, i) => (
          <li key={c.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={13} aria-hidden="true" />}
            {c.href ? (
              <Link href={c.href} className={dark ? "hover:text-white" : "hover:text-[#005AE0]"}>
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className={`font-semibold ${dark ? "text-white/85" : "text-[#0B1A3C]"}`}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* Hidden data for Google: breadcrumb trail. Google needs full addresses in "item", so paths get the site in front. */
const full = (href: string) => (/^https?:\/\//.test(href) ? href : `${SITE_URL}${href === "/" ? "" : href}`);
export function breadcrumbSchema(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: full(c.href) } : {}),
    })),
  };
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function SafetyNote({ text }: { text?: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[13px] leading-[1.55] text-amber-900">
      <ShieldAlert size={20} className="shrink-0 text-amber-600" aria-hidden="true" />
      <p>
        {text ??
          "Drives hold dangerous voltage after power-off. Checks should only be done by qualified personnel, with power isolated and the DC link discharged."}
      </p>
    </div>
  );
}
