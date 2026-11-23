"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageIcon } from "lucide-react";
import type { PartImage } from "@/lib/parts/types";

/* Product photos: big image + thumbnails. Stock photos get a "Representative image" tag; every part with a photo
   gets one line underneath saying the photo is for reference and what the customer receives. */
export default function PartGallery({ images, title }: { images: PartImage[]; title: string }) {
  const [i, setI] = useState(0);
  const img = images[i];
  return (
    <div className="flex h-full flex-col">
      {/* Main photo box is 4:3 on every screen: a 1600×1200 photo fills it edge to edge; other shapes sit on white, never cropped. */}
      <div className={`relative aspect-4/3 overflow-hidden rounded-[24px] border border-[#EAEAEC] shadow-[0_30px_70px_-50px_rgba(19,19,22,0.55)] ${img ? "bg-white" : "bg-[radial-gradient(120%_90%_at_30%_10%,#FFFFFF_0%,#F4F4F5_55%,#F7E3E6_100%)]"}`}>
        {!img && <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(19,19,22,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(19,19,22,0.035)_1px,transparent_1px)] bg-size-[28px_28px]" />}
        {img ? (
          <Image
            src={img.src}
            alt={img.alt || title}
            fill
            priority
            sizes="(min-width: 1024px) 560px, 100vw"
            unoptimized={img.src.startsWith("http")}
            className="object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#696976]">
            <ImageIcon size={34} aria-hidden="true" />
            <span className="text-[13px] font-semibold">Photo coming soon</span>
          </div>
        )}
        {img?.generic && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#5A5A66] ring-1 ring-[#EAEAEC] backdrop-blur">
            Representative image
          </span>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {images.map((m, n) => (
            <button
              key={m.src + n}
              type="button"
              onClick={() => setI(n)}
              aria-label={`Show image ${n + 1}`}
              aria-pressed={n === i}
              className={`relative aspect-4/3 w-24 flex-none overflow-hidden rounded-xl border bg-white transition ${n === i ? "border-brand ring-4 ring-brand/10" : "border-line hover:border-brand/40"}`}
            >
              <Image src={m.src} alt="" aria-hidden="true" fill sizes="96px" className="object-contain" />
            </button>
          ))}
        </div>
      )}
      {images.length > 0 && (
        <p className="mt-2.5 text-[12px] leading-relaxed text-[#696976]">
          *Photo for reference only. You&rsquo;ll receive the exact part number you ordered; refurbished units may show signs of use.
        </p>
      )}
    </div>
  );
}
