import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ShopListing from "@/components/parts/ShopListing";
import { categories, getCategory } from "@/lib/parts/categories";
import { hasCategoryFacet } from "@/lib/parts/repository";
import { clip } from "@/lib/seo";
import { PageExtras, withSeo } from "@/lib/cms/seo";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[category]">): Promise<Metadata> {
  const c = getCategory((await params).category);
  if (!c) return { title: "Category not found", robots: { index: false } };
  return withSeo(`/shop/${c.slug}`, {
    title: `${c.name} | Quote & Repair`,
    description: clip(`${c.intro} Request a quote for new, refurbished or exchange units, or have yours repaired. Canada & USA.`),
    alternates: { canonical: `/shop/${c.slug}` },
    // Until products carry this category the page lists keyword matches: useful, too thin to index.
    ...((await hasCategoryFacet(c.slug)) ? {} : { robots: { index: false, follow: true } }),
  });
}

export default function Page({ params, searchParams }: PageProps<"/shop/[category]">) {
  return (
    <Suspense>
      <Content params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Content({ params, searchParams }: PageProps<"/shop/[category]">) {
  const c = getCategory((await params).category);
  if (!c) notFound();
  return (
    <>
      <PageExtras path={`/shop/${c.slug}`} />
      <ShopListing cat={c} searchParams={searchParams} />
    </>
  );
}
