import type { Metadata } from "next";
import { SITE_URL, shareImage, SHARE_URL } from "@/lib/site";
import { fitTitle } from "@/lib/seo";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import BrandPage from "@/components/brands/BrandPage";
import { brandMakes, brands, getBrand } from "@/lib/brands";
import { PageExtras, withSeo } from "@/lib/cms/seo";

type Props = { params: Promise<{ slug: string }> };

/* Short title words for what a brand makes, e.g. "Encoders & Boards" */
const titleWord: Record<string, string> = {
  "servo-drive-repair": "Servo Drives", "vfd-repair": "Drives", "servo-motor-repair": "Servo Motors", "industrial-motor-repair": "Spindle Motors",
  "encoder-repair": "Encoders", "plc-repair": "PLCs", "hmi-repair": "HMIs", "cnc-repair": "CNC Controls", "power-supply-repair": "Power Supplies",
  "controller-card-repair": "Boards", "robotics-repair": "Robots",
};
const makesTitle = (categories: string[]) => {
  if (categories.length > 4) return "Drives, Motors & Controls";
  const w = categories.map((c) => titleWord[c]).filter(Boolean).slice(0, 2);
  return w.length ? w.join(" & ") : "Repair & Exchange";
};

export function generateStaticParams() {
  return brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const b = getBrand((await params).slug);
  if (!b) return {};
  const title = fitTitle(`${b.name} Repair | ${makesTitle(b.categories)} | IAR`);
  const full = `${b.name} repair at component level: ${brandMakes(b)}. Free evaluation, 1-year warranty. Serving the USA.`;
  const description = full.length <= 160 ? full : `${b.name} repair at component level: drives, motors, controls, HMIs, power supplies and boards. Free evaluation, 1-year warranty.`;
  return withSeo(`/brands/${b.slug}`, {
    title: { absolute: title },
    description,
    openGraph: { type: "website", url: `${SHARE_URL}/brands/${b.slug}`, title, description, siteName: "Industrial Automation Repair Inc.", images: [{ url: shareImage(), alt: `${b.name} repair at IAR` }] },
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
  const b = getBrand((await params).slug);
  if (!b) notFound();
  return (
    <>
      <PageExtras path={`/brands/${b.slug}`} />
      <BrandPage b={b} />
    </>
  );
}
