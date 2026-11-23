import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PartCard from "@/components/parts/PartCard";
import { categoryUrl, getCategory } from "@/lib/parts/categories";
import { relatedParts } from "@/lib/parts/repository";
import type { Part } from "@/lib/parts/types";

/* "Related parts" under a part page. It loads after the part itself (own <Suspense> on the page),
   so the photo, number and price never wait for this second lookup. */
export default async function RelatedParts({ p }: { p: Part }) {
  const related = await relatedParts(p, 4);
  if (!related.length) return null;
  const cat = getCategory(p.category);
  return (
    <section aria-labelledby="related" className="mt-12">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <h2 id="related" className="shrink-0 text-[22px] font-extrabold sm:text-[26px]">Related parts</h2>
        <Link href={cat ? categoryUrl(cat.slug) : "/shop"} className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#A50D25] hover:underline">
          View all {cat?.name ?? "parts"} <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {related.map((r) => <li key={r.id}><PartCard p={r} /></li>)}
      </ul>
    </section>
  );
}
