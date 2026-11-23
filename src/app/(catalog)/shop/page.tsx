import { Suspense } from "react";
import ShopHub from "@/components/parts/ShopHub";
import ShopListing from "@/components/parts/ShopListing";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/shop", {
  title: "Shop Industrial Automation Parts | New, Refurbished & Exchange",
  description:
    "New, refurbished and exchange servo drives, motors, PLCs, HMIs and CNC parts, or have your own unit repaired. Request a quote. Canada & USA.",
  alternates: { canonical: "/shop" },
});

/* /shop opens on search, categories and brands. A search (?q=), a page number (?page=, "Browse all parts")
   or a filter (?category=, ?brand=) shows the parts list instead. */
export default function Page({ searchParams }: PageProps<"/shop">) {
  return (
    <>
      <PageExtras path="/shop" />
      <Suspense fallback={<div className="min-h-screen bg-[#F7F7F8]" />}>
        <Content searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Content({ searchParams }: Pick<PageProps<"/shop">, "searchParams">) {
  if (process.env.PREVIEW_NO_DB === "1") return null; // PREVIEW BRANCH ONLY
  const sp = await searchParams;
  const listing = ["q", "page", "category", "brand"].some((k) => sp[k] !== undefined);
  if (!listing) return <ShopHub />;
  return <ShopListing title={sp.q ? "Search Results" : "All Parts"} searchParams={searchParams} />;
}
