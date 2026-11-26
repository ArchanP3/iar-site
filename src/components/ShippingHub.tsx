import Image from "next/image";
import { MapPin } from "lucide-react";

/* Right side of "Parts Shipped Nationwide & Worldwide" (GlobalReach):
   our real parts inventory photo, then Grand Island, NY as a hub with routes to the regions we ship to.
   Animations are CSS only (globals.css: route-dash, hub-ring, live-dot). Regions match src/lib/globalRoutes.ts. */

const nodes: { t: string; s: string; x: number; y: number }[] = [
  { t: "Canada", s: "Courier", x: 20, y: 18 },
  { t: "USA", s: "All 50 states", x: 80, y: 18 },
  { t: "Mexico", s: "Air freight", x: 15, y: 82 },
  { t: "Europe", s: "5 countries", x: 85, y: 78 },
  { t: "Asia", s: "4 countries", x: 50, y: 90 },
];

const route = (x: number, y: number, i: number) => {
  const cx = (50 + x) / 2 + (i % 2 ? 8 : -8);
  const cy = (50 + y) / 2 - 10;
  return `M50 50 Q${cx} ${cy} ${x} ${y}`;
};

export default function ShippingHub() {
  return (
    <div className="grid gap-4">
      {/* Real photo */}
      <div className="relative aspect-4/3 overflow-hidden rounded-[22px] border border-white/10 sm:aspect-video">
        <Image src="/facility/parts-inventory.webp" alt="Industrial Automation Repair parts inventory shelves" fill sizes="(min-width:1024px) 560px, 100vw" className="object-cover" />
        <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,12,0.05)_35%,rgba(10,10,12,0.9)),linear-gradient(90deg,rgba(200,16,46,0.35),transparent_60%)]" />
        <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0A0A0C]/75 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] backdrop-blur">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-[#2EE06C]" aria-hidden="true" /> In stock, ready to ship
        </span>
        <div className="absolute inset-x-4 bottom-4 grid gap-2">
          <span className="flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-[#0A0A0C]/75 py-1 pl-1.5 pr-3 text-[12.5px] font-bold backdrop-blur">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#C8102E]"><MapPin size={12} aria-hidden="true" /></span>
            Ships from Grand Island, NY
          </span>
          <p className="text-[16px] font-extrabold leading-snug sm:text-[20px]">Thousands of parts on our shelves, packed and shipped by air.</p>
        </div>
      </div>

      {/* Hub and routes */}
      <div className="relative aspect-square w-full rounded-[22px] sm:aspect-[1.9] border border-white/10 bg-white/3" role="img" aria-label="Parts ship from Grand Island, NY to the USA, Canada, Mexico, Europe and Asia">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          {nodes.map((n, i) => (
            <g key={n.t}>
              <path d={route(n.x, n.y, i)} fill="none" stroke="rgba(255,138,153,0.35)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
              <path d={route(n.x, n.y, i)} fill="none" stroke="#FF3B55" strokeWidth={2.2} strokeLinecap="round" pathLength={300} vectorEffect="non-scaling-stroke" className="route-dash" style={{ animationDelay: `-${i * 0.6}s` }} />
            </g>
          ))}
        </svg>
        <span aria-hidden="true" className="hub-ring absolute left-1/2 top-1/2 -ml-12 -mt-12 h-24 w-24 rounded-full border border-[#FF3B55]/50" />
        <span aria-hidden="true" className="hub-ring absolute left-1/2 top-1/2 -ml-12 -mt-12 h-24 w-24 rounded-full border border-[#FF3B55]/50 [animation-delay:1.5s]" />
        <div aria-hidden="true" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-2xl bg-linear-to-br from-[#C8102E] to-[#8E0B20] px-4 py-2.5 text-center shadow-[0_0_0_8px_rgba(200,16,46,0.15),0_0_0_18px_rgba(200,16,46,0.07)]">
          <p className="text-[13.5px] font-extrabold sm:text-[15px]">Grand Island, NY</p>
          <p className="text-[10.5px] text-white/80 sm:text-[11px]">Ships from here</p>
        </div>
        {nodes.map((n) => (
          <div key={n.t} aria-hidden="true" className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/15 bg-[#121216]/90 px-2.5 py-1.5 text-center sm:px-3" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
            <p className="text-[12.5px] font-bold sm:text-[13.5px]">{n.t}</p>
            <p className="text-[10px] text-white/60 sm:text-[11px]">{n.s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
