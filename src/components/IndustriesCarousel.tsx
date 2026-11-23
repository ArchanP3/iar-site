"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { canRun3D } from "@/lib/gpu";

/* WebGL gallery loads in the browser only, so it never slows the first paint */
const CircularGallery = dynamic(() => import("./CircularGallery"), { ssr: false });

type Item = { key: string; name: string; href: string };

/* Plain photo cards: shown first (Google sees them), and kept if the browser can't run 3D */
function CardStrip({ items }: { items: Item[] }) {
  return (
    <ul className="flex h-full items-center gap-3 overflow-x-auto px-4 scrollbar-none snap-x snap-mandatory scroll-px-4 sm:px-6 sm:scroll-px-6">
      {items.map((i) => (
        <li key={i.key} className="shrink-0 snap-start overflow-hidden rounded-[16px] ring-1 ring-white/15 transition hover:ring-[#FF8A99]/60">
          <Link href={i.href} aria-label={`${i.name} repair`} className="block">
          <Image
            src={`/industries/${i.key}.jpg`}
            alt={`${i.name} servo drive and motor repair`}
            width={600}
            height={760}
            sizes="200px"
            className="h-57.5 w-45.5 object-cover sm:h-65 sm:w-51.25"
          />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function IndustriesCarousel({ items }: { items: Item[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [use3d, setUse3d] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (canRun3D()) setUse3d(true);
  }, []);

  // If the graphics card drops the 3D canvas, fall back to the photo cards
  useEffect(() => {
    const el = box.current;
    if (!el || !use3d) return;
    const lost = () => setUse3d(false);
    el.addEventListener("webglcontextlost", lost, true);
    return () => el.removeEventListener("webglcontextlost", lost, true);
  }, [use3d]);

  return (
    <div ref={box} className="h-full">
      {use3d ? (
        <CircularGallery
          items={items.map((i) => ({ image: `/industries/${i.key}.jpg`, text: i.name, alt: `${i.name} servo drive and motor repair` }))}
          bend={3}
          borderRadius={0.06}
          showTitles={false}
          scrollEase={0.05}
          autoScroll={0.4}
          fadeEdges={0.12}
          shadow={0.4}
          dpr={1.5}
          openOnClick={false}
          onItemClick={(_, index) => router.push(items[index].href)}
        />
      ) : (
        <CardStrip items={items} />
      )}
    </div>
  );
}
