import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PartPage from "@/components/parts/PartPage";
import RelatedParts from "@/components/parts/RelatedParts";
import ScrollTopOnOpen from "@/components/parts/ScrollTopOnOpen";
import { getPrerenderProductSlugs } from "@/lib/catalog";
import { getPart } from "@/lib/parts/repository";
import { partMetadata } from "@/lib/parts/seo";
import { PageExtras, withSeo } from "@/lib/cms/seo";
import { setting } from "@/lib/cms/settings";

/* Only a handful of parts are built ahead of time. Every other part number
   renders on its first visit and is then cached, so 1,000,000+ parts never
   slow down the build. */
export async function generateStaticParams() {
  // PREVIEW BRANCH ONLY: no database yet, so pre-build no part pages.
  if (process.env.PREVIEW_NO_DB === "1") return [{ slug: "preview" }];
  return (await getPrerenderProductSlugs(20)).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/parts/[slug]">): Promise<Metadata> {
  if (process.env.PREVIEW_NO_DB === "1") return { title: "Part pages connect to the database", robots: { index: false } }; // PREVIEW BRANCH ONLY
  const p = await getPart((await params).slug);
  if (!p) return { title: "Part not found", robots: { index: false } };
  const t = await setting("partsSeo");
  return withSeo(`/parts/${p.slug}`, partMetadata(p, t.on ? { title: t.titleTemplate, description: t.descriptionTemplate } : undefined));
}

export default function Page({ params }: PageProps<"/parts/[slug]">) {
  return (
    // A page-tall placeholder while the part loads, so the browser never lands on the footer.
    <Suspense fallback={<PartSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Pick<PageProps<"/parts/[slug]">, "params">) {
  if (process.env.PREVIEW_NO_DB === "1") return <PreviewNotice />; // PREVIEW BRANCH ONLY
  const p = await getPart((await params).slug);
  if (!p) notFound();
  // Related parts stream in on their own, so the part shows after one lookup instead of two.
  return (
    <>
      <ScrollTopOnOpen id={p.slug} />
      <PageExtras path={`/parts/${p.slug}`} />
      <PartPage
        p={p}
        related={
          <Suspense fallback={null}>
            <RelatedParts p={p} />
          </Suspense>
        }
      />
    </>
  );
}

/* Same layout as the real part page (breadcrumb, photo, chips, number, buy box), so nothing jumps when it arrives. */
function PartSkeleton() {
  const bar = "animate-pulse rounded-lg bg-line";
  return (
    <div role="status" className="min-h-screen bg-surface">
      <span className="sr-only">Loading part…</span>
      <div aria-hidden="true" className="mx-auto max-w-310 px-4 pt-4 sm:px-8 sm:pt-5">
        <div className="flex items-center gap-2">
          <div className={`${bar} h-3.5 w-12`} />
          <div className={`${bar} h-3.5 w-20`} />
          <div className={`${bar} h-3.5 w-24`} />
        </div>
        <div className="mt-4 grid gap-6 lg:grid-cols-2 lg:gap-10">
          <div className="aspect-4/3 animate-pulse rounded-[24px] border border-line bg-white" />
          <div>
            <div className="flex gap-2">
              <div className={`${bar} h-7 w-24 rounded-full`} />
              <div className={`${bar} h-7 w-28 rounded-full`} />
            </div>
            <div className={`${bar} mt-3 h-8 w-4/5 sm:h-9`} />
            <div className={`${bar} mt-2.5 h-5 w-2/5`} />
            <div className="mt-4 h-72 animate-pulse rounded-[20px] border border-line bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* PREVIEW BRANCH ONLY: shown on part pages until the database is connected. */
function PreviewNotice() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-24 text-center">
      <h1 className="text-3xl font-extrabold">Part pages are coming soon</h1>
      <p className="mt-3 text-[#5A5A66]">This preview is not connected to the parts database yet. Call 1-877-904-6155 or request a quote for any part number.</p>
    </main>
  );
}
