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
      <Search size={15} className="pointer-events-none absolute left-3 top-5.5 -translate-y-1/2 text-[#005AE0]" aria-hidden="true" />
      <input
        id={id}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-11 w-full rounded-xl border border-[#D9E4F1] bg-white pl-9 pr-3 text-[16px] text-[#0B1A3C] outline-none placeholder:text-[#7A8BA3] focus:border-[#0066FF] sm:text-[14px]"
      />
      {t && (
        <ul className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-[#E3EAF3] bg-white shadow-[0_24px_48px_-24px_rgba(11,26,60,0.45)]" aria-label="Matching manufacturers">
          {hits.map((b) => (
            <li key={b.slug}>
              <Link href={`${prefix}${b.slug}`} onClick={onPick} rel={prefix.includes("?") ? "nofollow" : undefined} className="block px-3 py-2.5 text-[14px] font-semibold text-[#0B1A3C] hover:bg-[#F4F7FB] hover:text-[#005AE0]">
                {b.name}
              </Link>
            </li>
          ))}
          {!hits.length && <li className="px-3 py-2.5 text-[13.5px] text-[#5B6B84]">No manufacturer matches &ldquo;{q.trim()}&rdquo;.</li>}
        </ul>
      )}
    </div>
  );
}
