import Link from "next/link";
import { ArrowRight, ArrowUpRight, Truck, Wrench } from "lucide-react";
import { brandFont } from "@/lib/font";
import { areasHere as areas, areaHref } from "@/lib/serviceAreas";
import { SITE_COUNTRY } from "@/lib/site";
import { NA_DOTS, NA_MAP, naPoint } from "@/lib/naMap";
import { regionColor, regionsIn } from "@/lib/areaRegions";

/* Homepage: one repair centre in Mississauga serving every city in Canada & the USA.
   Static SVG map (no script), real <a> links for every city page (local SEO). */
const HUB: [number, number] = [43.589, -79.644];
const LABELS = new Set(["vancouver", "calgary", "edmonton", "saskatoon", "winnipeg", "montreal", "quebec-city", "halifax", "chicago", "pittsburgh"]);
/* Each country site shows its own cities (.ca Canada, .com USA); both before the split. */
const where = SITE_COUNTRY === "US" ? "the USA" : SITE_COUNTRY === "CA" ? "Canada" : "Canada & the USA";
const span = SITE_COUNTRY === "US" ? "from Chicago to Pittsburgh and across the USA" : SITE_COUNTRY === "CA" ? "from Vancouver to Halifax" : "from Vancouver to Halifax and Chicago to Pittsburgh";
/* label position tweaks so names never overlap: [dx, dy, anchor] */
const NUDGE: Record<string, [number, number, "start" | "middle" | "end"]> = {
  pittsburgh: [0, 34, "middle"], chicago: [-14, -12, "end"], halifax: [14, -12, "start"], "quebec-city": [0, -36, "middle"], montreal: [12, 26, "start"],
};
/* map pin (teardrop) whose tip sits on the city */
const pin = (x: number, y: number) =>
  `M${x} ${y} C${x - 3} ${y - 6} ${x - 10} ${y - 11} ${x - 10} ${y - 19} A10 10 0 1 1 ${x + 10} ${y - 19} C${x + 10} ${y - 11} ${x + 3} ${y - 6} ${x} ${y} Z`;

export default function ServiceAreasBand() {
  const [hx, hy] = naPoint(...HUB);
  const pts = areas.map((a) => ({ a, p: naPoint(...a.at) }));
  const groups = ([["Canada", areas.filter((a) => a.country === "CA")], ["United States", areas.filter((a) => a.country === "US")]] as const).filter(([, list]) => list.length);

  return (
    <section id="service-areas" aria-labelledby="service-areas-heading" className={`${brandFont.className} bg-white py-10 lg:py-14`}>
      <div className="mx-auto max-w-360 px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-200">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B30E29] sm:text-[12px]">
              <span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#C8102E] to-[#FF3B55]" />
              Service Areas
            </p>
            <h2 id="service-areas-heading" className="mt-3 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#131316] sm:text-[36px] lg:text-[40px]">
              One Repair Centre.{" "}
              <span className="bg-linear-to-r from-[#C8102E] to-[#FF3B55] bg-clip-text text-transparent">Every City in {where}.</span>
            </h2>
            <p className="mt-3 text-[14px] leading-[1.65] text-[#62626F] sm:text-[16px]">
              Servo drive, motor and industrial electronics repair for manufacturers {span}. Every repair is done at our repair
              centre in Mississauga, Ontario.
            </p>
          </div>
          <Link
            href="/service-areas"
            className="group inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-xl bg-[#131316] px-5 text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-16px_rgba(19, 19, 22,0.8)] transition hover:-translate-y-0.5 hover:bg-[#A50D25] lg:self-auto"
          >
            View all service areas <ArrowRight size={16} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="relative mt-7 overflow-hidden rounded-[28px] border border-white/10 bg-[#0A0A0C] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_40px_80px_-44px_rgba(200, 16, 46,0.75)]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <span className="absolute -left-32 -top-40 h-115 w-160 rounded-full bg-[radial-gradient(closest-side,rgba(200, 16, 46,0.38),transparent)] blur-2xl" />
            <span className="absolute -right-24 top-1/3 h-105 w-140 rounded-full bg-[radial-gradient(closest-side,rgba(255, 59, 85,0.2),transparent)] blur-2xl" />
            <span className="absolute inset-0 bg-[linear-gradient(rgba(255, 138, 153,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255, 138, 153,0.04)_1px,transparent_1px)] bg-size-[44px_44px]" />
          </div>
          <div className="relative grid lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
            {/* Map */}
            <div className="relative border-b border-white/10 p-4 sm:p-6 lg:border-b-0 lg:border-r">
              <div className="mb-2 inline-flex items-center gap-2.5 rounded-xl border sm:absolute sm:left-7 sm:top-7 sm:z-10 sm:mb-0 sm:flex border-white/12 bg-white/[0.07] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur">
                <span className="relative flex h-2.5 w-2.5"><span className="sa-ping absolute inset-0 rounded-full bg-[#FF3B55]" /><span className="relative h-2.5 w-2.5 rounded-full bg-[#FF3B55]" /></span>
                <span className="text-[12px] font-bold text-white">Repair centre · <span className="font-semibold text-white/65">Mississauga, ON</span></span>
              </div>
              <svg viewBox={`0 0 ${NA_MAP.width} ${NA_MAP.height}`} className="sa-map sa-dark h-auto w-full overflow-visible" role="group" aria-label="Map of Canada and the USA with routes from our Mississauga repair centre to the cities we serve">
                <defs>
                  <linearGradient id="sa-route" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#C8102E" stopOpacity="0.15" />
                    <stop offset="1" stopColor="#FF3B55" stopOpacity="0.9" />
                  </linearGradient>
                  <radialGradient id="sa-hub">
                    <stop offset="0" stopColor="#FF3B55" stopOpacity="0.35" />
                    <stop offset="1" stopColor="#FF3B55" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <path d={NA_DOTS} stroke="rgba(255, 138, 153,0.24)" strokeWidth="5.2" strokeLinecap="round" fill="none" />
                <circle cx={hx} cy={hy} r="120" fill="url(#sa-hub)" />
                {pts.map(({ a, p: [x, y] }, i) => {
                  const mx = (hx + x) / 2, my = (hy + y) / 2 - Math.min(140, Math.hypot(x - hx, y - hy) * 0.28);
                  return <path key={a.slug} d={`M${hx} ${hy} Q${mx} ${my} ${x} ${y}`} className="sa-route" style={{ animationDelay: `${(i % 8) * 0.45}s` }} />;
                })}
                {pts.map(({ a, p: [x, y] }) => {
                  const c = regionColor(a);
                  const big = LABELS.has(a.slug);
                  return (
                    <a key={a.slug} href={areaHref(a)} aria-label={`${a.city}, ${a.regionCode}`} className="sa-city">
                      <circle cx={x} cy={y} r="14" fill="transparent" />
                      {big ? (
                        <>
                          <ellipse cx={x} cy={y} rx="8" ry="3" fill={c} opacity="0.35" />
                          <path d={pin(x, y)} fill={c} stroke="#0A0A0C" strokeWidth="2" />
                          <circle cx={x} cy={y - 19} r="4" fill="#0A0A0C" />
                        </>
                      ) : (
                        <>
                          <circle cx={x} cy={y} r="10" fill={c} opacity="0.22" />
                          <circle cx={x} cy={y} r="6" fill="#0A0A0C" stroke={c} strokeWidth="3" />
                        </>
                      )}
                      {big && (
                        <text x={x + (NUDGE[a.slug]?.[0] ?? 0)} y={y + (NUDGE[a.slug]?.[1] ?? -36)} textAnchor={NUDGE[a.slug]?.[2] ?? "middle"} className="sa-label">{a.city}</text>
                      )}
                    </a>
                  );
                })}
                <circle cx={hx} cy={hy} r="11" fill="#ffffff" stroke="#FF3B55" strokeWidth="5" />
                <circle cx={hx} cy={hy} r="11" className="sa-pulse" />
              </svg>
              <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1.5 px-1 text-[12px] font-semibold text-white/65">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2 border-[#FF3B55] bg-white" aria-hidden="true" />Our repair centre</span>
                {regionsIn(areas).map((r) => <span key={r.key} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2 bg-[#0A0A0C]" style={{ borderColor: r.color }} aria-hidden="true" />{r.label}</span>)}
                <span className="text-white/60">{areas.length} featured cities · every city served</span>
              </div>
            </div>

            {/* Cities we serve */}
            <div className="flex flex-col p-5 sm:p-7">
              {groups.map(([label, list]) => (
                <div key={label} className="mb-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF8A99]">{label}</p>
                  <ul className="mt-1.5 grid grid-cols-2 gap-x-4">
                    {list.map((a) => (
                      <li key={a.slug}>
                        <Link href={areaHref(a)} aria-label={`Servo drive and motor repair in ${a.city}, ${a.regionCode}`} className="group flex items-center justify-between gap-2 border-b border-white/10 py-1.5 text-[13.5px] font-semibold text-white/90 transition hover:text-[#FF8A99]">
                          <span>{a.city} <span className="text-[11px] font-bold" style={{ color: regionColor(a) }}>{a.regionCode}</span></span>
                          <ArrowUpRight size={14} className="flex-none text-white/25 transition group-hover:text-[#FF8A99]" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="text-[13px] text-white/60">City not listed? We serve every city in {where === "Canada & the USA" ? "Canada and the USA" : where}.</p>
              <div className="mt-auto grid gap-2 pt-4 sm:grid-cols-2">
                <Link href="/request-pickup" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-14px_rgba(200, 16, 46,0.9)] transition hover:-translate-y-0.5">
                  <Truck size={17} aria-hidden="true" /> Request a Pickup
                </Link>
                <Link href="/on-site-service" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 text-[14.5px] font-semibold text-white transition hover:border-white/45">
                  <Wrench size={17} aria-hidden="true" /> Book On-site Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
