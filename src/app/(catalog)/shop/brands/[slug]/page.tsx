import type { Metadata } from "next";
import { Suspense } from "react";
import ShopListing from "@/components/parts/ShopListing";
import { brands, getBrand } from "@/lib/brands";
import { getManufacturer, getManufacturers } from "@/lib/catalog";
import { clip } from "@/lib/seo";
import { PageExtras, withSeo } from "@/lib/cms/seo";

export async function generateStaticParams() {
  if (process.env.PREVIEW_NO_DB === "1") return brands.map((b) => ({ slug: b.slug })); // PREVIEW BRANCH ONLY
  const top = [...(await getManufacturers())].sort((a, b) => b.product_count - a.product_count).slice(0, 20);
  return [...new Set([...top.map((m) => m.slug), ...brands.map((b) => b.slug)])].map((slug) => ({ slug }));
}

/** "sew-eurodrive" -> "Sew Eurodrive" for brands not in the catalog yet. */
const nameFromSlug = (slug: string) => slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Catalog manufacturer first (exact listing), then our brand pages, then the slug itself. */
async function resolveBrand(slug: string) {
  const facet = await getManufacturer(slug);
  const name = facet?.name ?? getBrand(slug)?.name ?? nameFromSlug(slug);
  return { slug, name, exact: Boolean(facet) };
}

export async function generateMetadata({ params }: PageProps<"/shop/brands/[slug]">): Promise<Metadata> {
  if (process.env.PREVIEW_NO_DB === "1") return { title: "Shop", robots: { index: false } }; // PREVIEW BRANCH ONLY
  const b = await resolveBrand((await params).slug);
  return withSeo(`/shop/brands/${b.slug}`, {
    title: `${b.name} Parts | Quote & Repair`,
    description: clip(`New, refurbished and exchange ${b.name} drives, motors, controls and boards, or have your ${b.name} unit repaired. Request a quote. Canada & USA.`),
    alternates: { canonical: `/shop/brands/${b.slug}` },
    // Brands without a catalog match list keyword results: keep them out of the index.
    ...(b.exact ? {} : { robots: { index: false, follow: true } }),
  });
}

export default function Page({ params, searchParams }: PageProps<"/shop/brands/[slug]">) {
  return (
    <Suspense>
      <Content params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Content({ params, searchParams }: PageProps<"/shop/brands/[slug]">) {
  if (process.env.PREVIEW_NO_DB === "1") return null; // PREVIEW BRANCH ONLY
  const b = await resolveBrand((await params).slug);
  return (
    <>
      <PageExtras path={`/shop/brands/${b.slug}`} />
      <ShopListing brand={{ slug: b.slug, name: b.name }} searchParams={searchParams} />
    </>
  );
}
