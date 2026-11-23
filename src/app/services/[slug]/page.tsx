import type { Metadata } from "next";
import { SITE_URL, shareImage, SHARE_URL } from "@/lib/site";
import { fitTitle } from "@/lib/seo";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ServicePage from "@/components/services/ServicePage";
import { allServices, getService } from "@/lib/services";
import { PageExtras, withSeo } from "@/lib/cms/seo";

type Props = { params: Promise<{ slug: string }> };

/* Only services with written content get a page */
export function generateStaticParams() {
  return allServices.filter((s) => s.answer).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = getService((await params).slug);
  if (!s?.answer) return {};
  return withSeo(`/services/${s.slug}`, {
    title: { absolute: fitTitle(s.metaTitle) },
    description: s.metaDescription,
    openGraph: { type: "website", url: `${SHARE_URL}/services/${s.slug}`, title: fitTitle(s.metaTitle), description: s.metaDescription, siteName: "AutomIQ Automation & Drive Services", images: [{ url: shareImage(s.icon || undefined), alt: s.title }] },
  });
}

export default function Page({ params }: Props) {
  return (
    <Suspense>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Props) {
  const s = getService((await params).slug);
  if (!s?.answer) notFound();
  return (
    <>
      <PageExtras path={`/services/${s.slug}`} />
      <ServicePage s={s} />
    </>
  );
}
