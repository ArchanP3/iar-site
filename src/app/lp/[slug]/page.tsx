import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { brandFont } from "@/lib/font";
import { onThisSite, SITE_URL } from "@/lib/site";
import { landingByPath, landingTemplate, type CmsLanding } from "@/lib/cms/content";
import { PageExtras, withSeo } from "@/lib/cms/seo";
import { getContact } from "@/lib/cms/business";
import { Blocks, blockFaqs, fill } from "@/components/cms/Blocks";

/* Landing pages built in the CMS. Visitors see them at their own address
   (e.g. /servo-drive-repair-burlington); the proxy routes that address here. */

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const path = "/" + decodeURIComponent(slug);
  const page = await landingByPath(path);
  // Pages set to the other country site only are redirected there by the proxy.
  if (!page || !onThisSite(page.site)) return null;
  const tpl = page.template_id ? await landingTemplate(page.template_id) : null;
  return { page, blocks: (tpl ?? page).blocks, vars: { ...(tpl?.vars ?? {}), ...page.vars }, tpl };
}

const seoTitle = (d: { page: CmsLanding; tpl: CmsLanding | null; vars: Record<string, string> }) => fill(d.page.seo_title || d.tpl?.seo_title || d.page.name, d.vars);
const seoDesc = (d: { page: CmsLanding; tpl: CmsLanding | null; vars: Record<string, string> }) => fill(d.page.seo_description || d.tpl?.seo_description || "", d.vars);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await load((await params).slug);
  if (!d) return {};
  return withSeo(d.page.path, { title: { absolute: seoTitle(d) }, description: seoDesc(d) || undefined, alternates: { canonical: `${SITE_URL}${d.page.path}`, ...(d.page.site === "both" ? {} : { languages: {} }) } });
}

export default function Page({ params }: Props) {
  return (
    <Suspense>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Props) {
  const d = await load((await params).slug);
  if (!d) notFound();
  const url = `${SITE_URL}${d.page.path}`;
  const faqs = blockFaqs(d.blocks, d.vars);
  const c = await getContact();
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", url, name: seoTitle(d), ...(seoDesc(d) ? { description: seoDesc(d) } : {}) },
      ...(faqs.length ? [{ "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }] : []),
      ...(d.vars.city
        ? [{
            "@type": "LocalBusiness",
            name: "AutomIQ Automation & Drive Services",
            url: SITE_URL,
            image: `${SITE_URL}/iar-logo.png`,
            ...(c.phone ? { telephone: c.phone } : {}),
            email: c.email,
            address: { "@type": "PostalAddress", ...(c.street ? { streetAddress: c.street } : {}), addressLocality: c.city || "Mississauga", addressRegion: c.region || "ON", addressCountry: "CA" },
            areaServed: { "@type": "City", name: [d.vars.city, d.vars.province].filter(Boolean).join(", ") },
          }]
        : []),
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` }, { "@type": "ListItem", position: 2, name: seoTitle(d), item: url }] },
    ],
  };
  return (
    <main className={`${brandFont.className} min-h-screen bg-[#F7F7F8] text-[#131316]`}>
      <PageExtras path={d.page.path} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <Header />
      <Blocks blocks={d.blocks} vars={d.vars} />
      <Footer />
    </main>
  );
}
