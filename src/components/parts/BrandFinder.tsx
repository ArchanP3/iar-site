"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Search } from "lucide-react";

export type BrandOption = { slug: string; name: string };

/* Type-ahead over the catalog's manufacturers. Each match links to `${prefix}${slug}`. */
export default function BrandFinder({
  brands,
  prefix,
  placeholder = "Find a manufacturer",
  limit = 8,
  onPick,
}: {
  brands: BrandOption[];
  prefix: string;
  placeholder?: string;
  limit?: number;
  onPick?: () => void;
}) {
  const id = useId();
  const [q, setQ] = useState("");
  const t = q.trim().toLowerCase();
  const hits = t
    ? brands
        .filter((b) => b.name.toLowerCase().includes(t))
        .sort((a, b) => Number(!a.name.toLowerCase().startsWith(t)) - Number(!b.name.toLowerCase().startsWith(t)))
        .slice(0, limit)
    : [];
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">{placeholder}</label>
      <Search size={15} className="pointer-events-none absolute left-3 top-5.5 -translate-y-1/2 text-[#B30E29]" aria-hidden="true" />
      <input
        id={id}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-11 w-full rounded-xl border border-[#F0DADD] bg-white pl-9 pr-3 text-[16px] text-[#131316] outline-none placeholder:text-[#888895] focus:border-[#C8102E] sm:text-[14px]"
      />
      {t && (
        <ul className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-[#EAEAEC] bg-white shadow-[0_24px_48px_-24px_rgba(19,19,22,0.45)]" aria-label="Matching manufacturers">
          {hits.map((b) => (
            <li key={b.slug}>
              <Link href={`${prefix}${b.slug}`} onClick={onPick} rel={prefix.includes("?") ? "nofollow" : undefined} className="block px-3 py-2.5 text-[14px] font-semibold text-[#131316] hover:bg-[#F7F7F8] hover:text-[#B30E29]">
                {b.name}
              </Link>
            </li>
          ))}
          {!hits.length && <li className="px-3 py-2.5 text-[13.5px] text-[#696976]">No manufacturer matches &ldquo;{q.trim()}&rdquo;.</li>}
        </ul>
      )}
    </div>
  );
}
