import Link from "next/link";
import { ArrowUpRight, SearchX } from "lucide-react";
import { closeMatches, partUrl } from "@/lib/parts/repository";
import { canBuyOnline } from "@/lib/parts/rules";

/* Shown above the quote form when a site search found nothing: says so plainly,
   and lists close matches (same family, other suffix) in case one is the right part. */
export default async function SearchMiss({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  if (sp.from !== "search") return null;
  const q = String(sp.q ?? sp.part ?? "").trim().slice(0, 80);
  if (!q) return null;
  const near = await closeMatches(q, 4);
  return (
    <div className="lg:col-span-2">
      <div className="rounded-[22px] border border-[#FEDF89] bg-[#FFFCF2] p-4 shadow-[0_24px_50px_-40px_rgba(11,26,60,0.5)] sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[#FEF3C7] text-[#B45309]"><SearchX size={19} aria-hidden="true" /></span>
          <div className="min-w-0">
            <p className="text-[15.5px] font-extrabold text-[#0B1A3C]">&ldquo;{q}&rdquo; isn&apos;t listed online yet. We can still get it.</p>
            <p className="mt-0.5 text-[13.5px] leading-normal text-[#5B6B84]">We&apos;ve filled in the form below for you. Send it and we check our stock and 1,000+ brands, then reply with price, condition and lead time.</p>
          </div>
        </div>
        {near.length > 0 && (
          <div className="mt-4">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#5B6B84]">Close matches in our catalogue. Is one of these your part?</p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {near.map((p) => {
                const price = p.offers.find(canBuyOnline)?.price;
                return (
                  <li key={p.slug}>
                    <Link href={partUrl(p.slug)} className="group flex h-full items-start justify-between gap-2 rounded-xl border border-[#E3EAF3] bg-white p-3 transition hover:border-[#0066FF]/40">
                      <span className="min-w-0">
                        <span className="block truncate font-mono text-[13.5px] font-bold text-[#0B1A3C] group-hover:text-[#0052CC]">{p.partNumber}</span>
                        <span className="block truncate text-[12px] text-[#5B6B84]">{p.manufacturer} · {p.name}</span>
                        <span className="mt-1 block text-[12px] font-semibold text-[#0B1A3C]">{price !== undefined ? `From US$${price.toLocaleString("en-US")}` : "Request a quote"}</span>
                      </span>
                      <ArrowUpRight size={15} className="mt-0.5 flex-none text-[#B5C3D6] group-hover:text-[#005AE0]" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
