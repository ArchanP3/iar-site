import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Anvil, Beef, Car, CircleDot, CircuitBoard, Cog, Droplets, Factory, Flame, Forklift, GlassWater, Package, Pickaxe, Pill, Plane, Printer, ScrollText, Shirt, TreePine, Wrench } from "lucide-react";
import { industryUrl, type Industry } from "@/lib/industries";

const icons = { Anvil, Beef, Car, CircleDot, CircuitBoard, Cog, Droplets, Factory, Flame, Forklift, GlassWater, Package, Pickaxe, Pill, Plane, Printer, ScrollText, Shirt, TreePine, Wrench } as const;

export function IndustryIcon({ name, color, size = 26 }: { name: string; color: string; size?: number }) {
  const Icon = icons[name as keyof typeof icons] ?? Factory;
  return <Icon size={size} style={{ color }} strokeWidth={1.8} aria-hidden="true" />;
}

/* Dark, colourful card in the same style as the Repair Services and Brands pages */
export default function IndustryCard({ i, big = false }: { i: Industry; big?: boolean }) {
  return (
    <Link
      href={industryUrl(i.slug)}
      className="group relative flex h-full flex-col overflow-hidden rounded-[18px] border border-white/10 p-3.5 text-white shadow-[0_22px_44px_-24px_rgba(28, 28, 32,0.8)] transition hover:-translate-y-1 sm:rounded-[22px] sm:p-5"
      style={{ background: `linear-gradient(155deg, #0F0F10 0%, #1A1A1E 50%, ${i.color}40 100%)` }}
    >
      <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-xl transition group-hover:scale-125" style={{ background: `radial-gradient(closest-side, ${i.color}77, transparent)` }} />
      <div className="relative flex items-start justify-between">
        <span
          className={`relative flex flex-none items-center justify-center overflow-hidden rounded-2xl ring-1 ring-white/15 ${big ? "h-21 w-21 sm:h-26 sm:w-26" : "h-12 w-12 sm:h-14 sm:w-14"}`}
          style={{ background: `linear-gradient(145deg, ${i.color}33, #131316)`, boxShadow: `0 10px 26px -12px ${i.color}` }}
        >
          {i.image ? (
            <Image src={i.image} alt="" aria-hidden="true" fill sizes="(min-width: 640px) 104px, 84px" className={`object-cover transition duration-300 ${i.zoom ? "scale-[1.35] object-[50%_30%] group-hover:scale-[1.5]" : "group-hover:scale-110"}`} />
          ) : (
            <IndustryIcon name={i.icon} color={i.color} size={big ? 34 : 24} />
          )}
        </span>
        <ArrowUpRight size={18} style={{ color: i.color }} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
      <h2 className={`relative mt-3 mb-3 min-h-[2lh] font-extrabold sm:mb-0 leading-snug sm:mt-4 ${big ? "text-[16px] sm:text-[21px]" : "text-[15px] sm:text-[17px]"}`}>{i.name}</h2>
      <p className="relative mt-1 mb-3 hidden min-h-[2lh] text-[13px] leading-normal text-white/70 sm:block">{i.short}</p>
      <span className="relative mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-[#0A0A0C]/55 ring-1 ring-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/85 sm:text-[10.5px]">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: i.color }} aria-hidden="true" /> Repair & parts
      </span>
    </Link>
  );
}
