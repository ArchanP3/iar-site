import { Suspense } from "react";
import ShopHub from "@/components/parts/ShopHub";
import ShopListing from "@/components/parts/ShopListing";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/shop", {
  title: "Servo Motors, Drives & Automation Parts | IAR",
  description:
    "Buy new, surplus and refurbished servo motors, drives, PLCs and HMIs by brand or part number. Tested in-house, 1-year warranty.",
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
  const sp = await searchParams;
  const listing = ["q", "page", "category", "brand"].some((k) => sp[k] !== undefined);
  if (!listing) return <ShopHub />;
  return <ShopListing title={sp.q ? "Search Results" : "All Parts"} searchParams={searchParams} />;
}
