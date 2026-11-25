"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import type { GoogleReview } from "@/lib/googleReviews";

/* Google reviews as a slideshow on the page: one review at a time, auto-advancing,
   with arrows, dots and swipe. Long reviews expand in place ("Read more"), so visitors
   can read everything without leaving the site. */

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }} aria-hidden="true">
            <Star size={size} className="absolute inset-0 text-[#D4D4D8]" fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} className="text-[#F5A524]" fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

const LONG = 320;
const EVERY = 7000;

export default function ReviewSlider({ reviews }: { reviews: GoogleReview[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState(false);
  const touch = useRef<number | null>(null);
  const n = reviews.length;

  const go = useCallback((to: number) => {
    setOpen(false);
    setI(((to % n) + n) % n);
  }, [n]);

  useEffect(() => {
    if (paused || open || n < 2) return;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setTimeout(() => go(i + 1), EVERY);
    return () => clearTimeout(t);
  }, [i, paused, open, n, go]);

  if (n === 0) return null;
  const r = reviews[i];
  const long = r.text.length > LONG;

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Customer reviews from Google"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
        touch.current = null;
      }}
    >
      <div className="hexcard relative overflow-hidden rounded-[26px] px-6 py-8 text-white sm:px-12 sm:py-11">
        <Quote size={64} className="absolute right-6 top-5 text-white/10 sm:right-10" aria-hidden="true" />
        <div key={i} className="iar-fade-up relative" aria-live={paused ? "polite" : "off"} aria-roledescription="slide" aria-label={`${i + 1} of ${n}`}>
          <Stars value={r.rating} size={20} />
          <p className={`mt-5 max-w-240 text-[17px] leading-[1.75] text-white/90 sm:text-[19px] ${long && !open ? "line-clamp-5" : ""}`}>“{r.text}”</p>
          {long && (
            <button type="button" onClick={() => setOpen((o) => !o)} className="mt-2 text-[14px] font-semibold text-[#FF8A99] hover:text-white">
              {open ? "Show less" : "Read more"}
            </button>
          )}
          <div className="mt-7 flex items-center gap-3">
            {r.photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- Google-hosted reviewer photo, shown as returned
              <img src={r.photo} alt="" width={44} height={44} referrerPolicy="no-referrer" className="h-11 w-11 rounded-full object-cover ring-2 ring-white/15" />
            ) : (
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#C8102E] text-[16px] font-bold">{r.author.charAt(0)}</span>
            )}
            <div>
              <p className="text-[15px] font-bold">{r.author}</p>
              <p className="text-[13px] text-white/55">{r.when} · Google review</p>
            </div>
          </div>
        </div>
      </div>

      {n > 1 && (
        <div className="mt-5 flex items-center justify-center gap-4">
          <button type="button" onClick={() => go(i - 1)} aria-label="Previous review" className="grid h-10 w-10 place-items-center rounded-full border border-[#DADADF] bg-white text-[#131316] transition hover:border-[#C8102E] hover:text-[#C8102E]">
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            {reviews.map((_, k) => (
              <button
                key={k}
                type="button"
                onClick={() => go(k)}
                aria-label={`Show review ${k + 1}`}
                aria-current={k === i}
                className={`h-2.5 rounded-full transition-all ${k === i ? "w-7 bg-[#C8102E]" : "w-2.5 bg-[#D4D4D8] hover:bg-[#A1A1AA]"}`}
              />
            ))}
          </div>
          <button type="button" onClick={() => go(i + 1)} aria-label="Next review" className="grid h-10 w-10 place-items-center rounded-full border border-[#DADADF] bg-white text-[#131316] transition hover:border-[#C8102E] hover:text-[#C8102E]">
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
