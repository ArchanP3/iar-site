import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import { partUrl } from "@/lib/parts/repository";
import { canBuyOnline, usd } from "@/lib/parts/rules";
import { offersOf } from "@/lib/parts/seo";
import { conditionLabel, type PartSummary } from "@/lib/parts/types";
import WhatsAppButton from "@/components/WhatsAppButton";

/* Part tile for the shop grid and "related parts". */
export default function PartCard({ p, priority = false }: { p: PartSummary; priority?: boolean }) {
  const offers = offersOf(p);
  const img = p.image;
  const priced = offers.find(canBuyOnline);
  return (
    <div className="relative h-full">
    <Link
      href={partUrl(p.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-[#EAEAEC] bg-white shadow-[0_20px_45px_-38px_rgba(19,19,22,0.6)] transition hover:-translate-y-1 hover:border-[#C8102E]/40 hover:shadow-[0_30px_60px_-36px_rgba(165,13,37,0.45)]"
    >
      {/* Photo box is 4:3: a 1600×1200 photo fills it edge to edge; other shapes sit on white, never cropped. */}
      <div className={`relative aspect-4/3 overflow-hidden border-b border-[#F3F3F4] ${img ? "bg-white" : "bg-[radial-gradient(120%_90%_at_30%_10%,#FFFFFF_0%,#F4F4F5_60%,#F7E3E6_100%)]"}`}>
        {img ? (
          <Image src={img.src} alt={img.alt} fill priority={priority} sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw" className="object-contain transition duration-300 group-hover:scale-[1.03]" />
        ) : (
          <ImageIcon size={28} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#A8A8B1]" aria-hidden="true" />
        )}
        <ArrowUpRight size={18} className="absolute right-3 top-3 text-[#C8102E] opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
      </div>
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {p.manufacturer && <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#C8102E]">{p.manufacturer}</p>}
        <p className="mt-1 break-words text-[14.5px] font-extrabold leading-snug tracking-[-0.01em] text-[#131316] sm:text-[15.5px]">{p.partNumber}</p>
        <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-[#5A5A66] sm:text-[13px]">{p.name}</p>
        <ul className="mt-2.5 flex flex-wrap gap-1" aria-label="Available as">
          {offers.map((o) => (
            <li key={o.condition} className="rounded-md bg-[#F5F5F6] px-1.5 py-0.5 text-[10.5px] font-semibold text-[#5A5A66]">{conditionLabel[o.condition]}</li>
          ))}
        </ul>
        {priced ? (
          <p className="mt-auto pt-3 pr-11 text-[14px] font-extrabold text-[#131316]">
            {usd(priced.price)} <span className="text-[11px] font-bold text-[#696976]">USD</span>
            <span className="ml-1.5 text-[12.5px] text-[#A50D25]">Buy now</span>
          </p>
        ) : (
          <p className="mt-auto pt-3 pr-11 text-[14px] font-extrabold text-[#A50D25]">Request a quote</p>
        )}
      </div>
    </Link>
    <WhatsAppButton size="sm" topic={`${p.manufacturer} ${p.partNumber}`} kind="part" url={partUrl(p.slug)} label={`Ask about ${p.partNumber} on WhatsApp`} className="absolute right-3 bottom-2.5 sm:right-3.5" />
    </div>
  );
}
