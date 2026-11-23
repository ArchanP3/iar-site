import Link from "next/link";
import "./home/homeSections.css";
import { ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Edit the brands here. "repairs" = what we fix for that brand.      */
/* ------------------------------------------------------------------ */
export const repairBrands = [
  { name: "Siemens", initials: "S", repairs: "SINAMICS drives, 1FK7 motors", href: "/brands/siemens" },
  { name: "Allen-Bradley", initials: "AB", repairs: "Kinetix, PowerFlex, PanelView", href: "/brands/allen-bradley" },
  { name: "Rexroth Indramat", initials: "RI", repairs: "IndraDrive, DKC, MKD motors", href: "/brands/rexroth-indramat" },
  { name: "Fanuc", initials: "F", repairs: "Alpha i amplifiers, spindle motors", href: "/brands/fanuc" },
  { name: "Yaskawa", initials: "Y", repairs: "SERVOPACK drives, Sigma motors", href: "/brands/yaskawa" },
  { name: "Mitsubishi Electric", initials: "ME", repairs: "MR-J amplifiers, FR inverters", href: "/brands/mitsubishi" },
  { name: "ABB", initials: "ABB", repairs: "ACS and DCS drives, motors", href: "/brands/abb" },
  { name: "Schneider Electric", initials: "SE", repairs: "Altivar drives, Lexium servos", href: "/brands/schneider" },
  { name: "Kollmorgen", initials: "K", repairs: "AKD drives, Goldline motors", href: "/brands/kollmorgen" },
  { name: "Beckhoff", initials: "B", repairs: "AX5000 drives, AM servo motors", href: "/brands/beckhoff" },
  { name: "Parker", initials: "P", repairs: "Compax3, 590 DC drives", href: "/brands/parker" },
  { name: "Moog", initials: "M", repairs: "Servo drives, servo motors", href: "/brands/moog" },
  { name: "Lenze", initials: "L", repairs: "9400 and 8200 inverters", href: "/brands/lenze" },
  { name: "SEW-Eurodrive", initials: "SEW", repairs: "MOVIDRIVE, gearmotors", href: "/brands/sew-eurodrive" },
  { name: "Omron", initials: "O", repairs: "G5 servos, HMIs, PLCs", href: "/brands/omron" },
  { name: "Baldor", initials: "B", repairs: "AC and DC motors, drives", href: "/brands/baldor" },
];

/* Hidden data for Google + AI answer engines (SEO / AEO / GEO) */
const schema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Industrial automation brands we repair",
  itemListElement: repairBrands.map((b, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Service",
      name: `${b.name} repair`,
      description: `${b.name} repair: ${b.repairs}.`,
      provider: { "@type": "Organization", name: "AutomIQ Automation & Drive Services" },
    },
  })),
};

/* "Brands We Repair" panel — shown inside the Repair Services section */
export default function BrandsRepairPanel() {
  return (
    <div id="brands">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="aq-bpanel p-5 sm:p-7 lg:p-9">
        <div className="relative grid gap-7 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10">
          <div className="flex flex-col">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#FF5A6E] sm:text-[12px]">
              <span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#C8102E] to-[#FF3B55]" />
              Brands We Repair
            </p>
            <h3
              id="brands-heading"
              className="mt-3 text-[26px] font-extrabold leading-[1.12] tracking-[-0.02em] text-white sm:text-[32px] lg:text-[34px]"
            >
              Repair Experts for Every Automation Brand
            </h3>
            <p className="mt-3 text-[14px] leading-[1.65] text-white/65 sm:text-[15px]">
              Servo drives, motors, HMIs and controls from the brands that run your line, repaired and tested in-house.
            </p>
            <p className="mt-4 flex items-center gap-2 text-[13px] font-semibold text-white/85">
              <ShieldCheck size={16} className="shrink-0 text-[#FF5A6E]" />
              12-month warranty on every repair
            </p>
            <Link
              href="/brands"
              className="mt-5 inline-flex h-11 w-fit items-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-5 text-[14.5px] font-semibold text-white shadow-[0_12px_28px_-12px_rgba(255, 59, 85,0.8)] transition hover:-translate-y-0.5"
            >
              View all brands we repair
              <ArrowRight size={17} />
            </Link>
          </div>

          <ul className="grid grid-cols-2 content-start gap-2.5 sm:gap-3 md:grid-cols-3 xl:grid-cols-4">
            {repairBrands.map((b, i) => (
              <li key={b.name} className={i >= 8 ? "hidden sm:block" : ""}>
                <Link
                  href={b.href}
                  aria-label={`${b.name} repair services`}
                  className="aq-btile group flex h-full items-center gap-3 rounded-[15px] p-2.5 sm:p-3"
                >
                  <span
                    aria-hidden="true"
                    className="aq-btile__mark flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-white shadow-[0_10px_20px_-10px_rgba(200, 16, 46,0.9),inset_0_1px_0_rgba(255,255,255,0.3)] sm:h-11 sm:w-11"
                  >
                    <span className={`font-extrabold tracking-tight ${b.initials.length > 2 ? "text-[12px] sm:text-[13px]" : "text-[15px] sm:text-[17px]"}`}>
                      {b.initials}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-1.5">
                      <h4 className="text-[13px] font-bold leading-snug text-white transition-colors group-hover:text-[#FF5A6E] sm:text-[14px]">
                        {b.name}
                      </h4>
                      <ArrowUpRight size={14} className="mt-0.5 hidden shrink-0 text-[#FF3B55] opacity-0 transition duration-300 group-hover:opacity-100 sm:block" />
                    </span>
                    <span className="mt-0.5 hidden text-[12px] leading-[1.4] text-white/55 sm:line-clamp-2">{b.repairs}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-6 flex flex-col gap-2 border-t border-white/10 pt-5 text-[13.5px] text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-semibold text-white">We repair 1,000+ brands.</span> Name any brand and we&apos;ll
            repair it.
          </p>
          <Link href="/request-repair?service=question" className="group inline-flex items-center gap-1.5 font-semibold text-[#FF5A6E] hover:text-white">
            Send us the model number
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
