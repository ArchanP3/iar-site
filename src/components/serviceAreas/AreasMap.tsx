"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Area } from "@/lib/serviceAreas";
import { NA_DOTS, NA_MAP, naPoint } from "@/lib/naMap";
import { regionColor } from "@/lib/areaRegions";

/* Animated map for the Service Areas page: routes draw in from our Mississauga repair centre,
   then flow. Every city dot is a real link; hovering (or focusing) one shows a small card. */
const HUB: [number, number] = [43.589, -79.644];
const LABELS = new Set(["vancouver", "calgary", "edmonton", "saskatoon", "winnipeg", "montreal", "quebec-city", "halifax", "chicago", "pittsburgh"]);
const NUDGE: Record<string, [number, number, "start" | "middle" | "end"]> = {
  pittsburgh: [0, 34, "middle"], chicago: [-14, 6, "end"], halifax: [14, 6, "start"], "quebec-city": [0, -15, "middle"],
  montreal: [12, 24, "start"],
};

export default function AreasMap({ areas, urls }: { areas: Area[]; urls: Record<string, string> }) {
  const [hx, hy] = naPoint(...HUB);
  const [on, setOn] = useState<string | null>(null);
  const pts = areas.map((a) => ({ a, p: naPoint(...a.at) }));
  const cur = pts.find((x) => x.a.slug === on);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${NA_MAP.width} ${NA_MAP.height}`} className="sa-map sa-dark sa-hero h-auto w-full overflow-visible" role="group" aria-label="Map of Canada and the USA with routes from our Mississauga repair centre to the cities we serve">
        <defs>
          <linearGradient id="sah-route" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#C8102E" stopOpacity="0.2" />
            <stop offset="1" stopColor="#FF3B55" stopOpacity="0.95" />
          </linearGradient>
          <radialGradient id="sah-hub">
            <stop offset="0" stopColor="#FF3B55" stopOpacity="0.45" />
            <stop offset="1" stopColor="#FF3B55" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d={NA_DOTS} stroke="rgba(255, 138, 153,0.22)" strokeWidth="5.2" strokeLinecap="round" fill="none" />
        <circle cx={hx} cy={hy} r="150" fill="url(#sah-hub)" />
        {pts.map(({ a, p: [x, y] }, i) => {
          const mx = (hx + x) / 2, my = (hy + y) / 2 - Math.min(140, Math.hypot(x - hx, y - hy) * 0.28);
          const d = `M${hx} ${hy} Q${mx} ${my} ${x} ${y}`;
          const hot = on === a.slug;
          return (
            <g key={a.slug}>
              <path d={d} className="sah-draw" pathLength={1} style={{ animationDelay: `${0.15 + i * 0.06}s` }} />
              <path d={d} className="sah-flow" style={{ animationDelay: `1.8s, ${(i % 8) * 0.45}s`, strokeOpacity: on && !hot ? 0.2 : 1, strokeWidth: hot ? 4 : undefined }} />
            </g>
          );
        })}
        {pts.map(({ a, p: [x, y] }, i) => (
          <a
            key={a.slug}
            href={urls[a.slug]}
            aria-label={`${a.city}, ${a.regionCode}`}
            className="sah-dot"
            style={{ animationDelay: `${0.5 + i * 0.06}s` }}
            onMouseEnter={() => setOn(a.slug)}
            onMouseLeave={() => setOn(null)}
            onFocus={() => setOn(a.slug)}
            onBlur={() => setOn(null)}
          >
            <circle cx={x} cy={y} r="16" fill="transparent" />
            <circle cx={x} cy={y} r={on === a.slug ? 13 : 10} fill={regionColor(a)} opacity="0.22" />
            <circle cx={x} cy={y} r={on === a.slug ? 9 : 6} fill={on === a.slug ? regionColor(a) : "#0A0A0C"} stroke={regionColor(a)} strokeWidth="3" />
            {LABELS.has(a.slug) && (
              <text x={x + (NUDGE[a.slug]?.[0] ?? 0)} y={y + (NUDGE[a.slug]?.[1] ?? -15)} textAnchor={NUDGE[a.slug]?.[2] ?? "middle"} className="sa-label">{a.city}</text>
            )}
          </a>
        ))}
        <circle cx={hx} cy={hy} r="12" fill="#ffffff" stroke="#FF3B55" strokeWidth="5" />
        <circle cx={hx} cy={hy} r="12" className="sa-pulse" />
        <circle cx={hx} cy={hy} r="12" className="sa-pulse" style={{ animationDelay: "1.2s" }} />
      </svg>

      {cur && (
        <div
          className="pointer-events-none absolute z-10 hidden w-56 -translate-x-1/2 -translate-y-[calc(100%+18px)] rounded-2xl border border-white/15 bg-[#131316]/90 p-3.5 text-white shadow-[0_24px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur sm:block"
          style={{ left: `${(cur.p[0] / NA_MAP.width) * 100}%`, top: `${(cur.p[1] / NA_MAP.height) * 100}%` }}
        >
          <p className="flex items-center justify-between text-[15px] font-extrabold">{cur.a.city}<ArrowUpRight size={15} className="text-[#FF8A99]" aria-hidden="true" /></p>
          <p className="text-[12px] text-white/55">{cur.a.region}</p>
          <p className="mt-2 flex flex-wrap gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.06em]">
            {cur.a.dropOff && <span className="rounded-full bg-[#FF3B55]/20 px-2 py-0.5 text-[#FF8A99]">Drop-off</span>}
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-white/80">Pickup</span>
            {cur.a.country === "US" && <span className="rounded-full bg-white/10 px-2 py-0.5 text-white/80">Customs help</span>}
          </p>
        </div>
      )}
      <Link href="#cities" className="sr-only">Skip to the city list</Link>
    </div>
  );
}
