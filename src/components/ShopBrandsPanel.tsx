import Link from "next/link";
import "./home/homeSections.css";
import { ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Edit the brands here. "series" = product lines we stock.           */
/* ------------------------------------------------------------------ */
export const shopBrands = [
  { name: "Siemens", initials: "S", series: "SINAMICS, SIMODRIVE, SINUMERIK", href: "/shop/brands/siemens" },
  { name: "Allen-Bradley", initials: "AB", series: "Kinetix, PowerFlex, PanelView", href: "/shop/brands/allen-bradley" },
  { name: "Fanuc", initials: "F", series: "Alpha i, Beta i, Series 0i / 30i", href: "/shop/brands/fanuc" },
  { name: "Rexroth Indramat", initials: "RI", series: "IndraDrive, EcoDrive, DIAX", href: "/shop/brands/rexroth-indramat" },
  { name: "Yaskawa", initials: "Y", series: "Sigma, SERVOPACK, GA700", href: "/shop/brands/yaskawa" },
  { name: "Mitsubishi Electric", initials: "ME", series: "MR-J, MELSEC, GOT", href: "/shop/brands/mitsubishi" },
  { name: "Moog", initials: "M", series: "DS2100, MSD", href: "/shop/brands/moog" },
  { name: "Parker", initials: "P", series: "Compax3, 590+, AC30", href: "/shop/brands/parker" },
  { name: "Schneider Electric", initials: "SE", series: "Lexium, Altivar, Modicon", href: "/shop/brands/schneider" },
  { name: "ABB", initials: "ABB", series: "ACS, DCS, MicroFlex", href: "/shop/brands/abb" },
  { name: "Kollmorgen", initials: "K", series: "AKD, AKM, Goldline", href: "/shop/brands/kollmorgen" },
  { name: "Beckhoff", initials: "B", series: "AX5000, CX, EtherCAT I/O", href: "/shop/brands/beckhoff" },
  { name: "Baldor", initials: "B", series: "BSM, MicroFlex", href: "/shop/brands/baldor" },
  { name: "Omron", initials: "O", series: "Sysmac, G5, MX2", href: "/shop/brands/omron" },
  { name: "Lenze", initials: "L", series: "9400, 8400, i700", href: "/shop/brands/lenze" },
  { name: "SEW-Eurodrive", initials: "SEW", series: "MOVIDRIVE, MOVITRAC, MOVIMOT", href: "/shop/brands/sew-eurodrive" },
];

/* "Shop by Brand" panel — shown inside the Parts section */
export default function ShopBrandsPanel() {
  return (
    <div className="aq-bpanel p-5 sm:p-7 lg:p-9">
      <div className="relative grid gap-7 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10">
        <div className="flex flex-col">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#FF5A6E] sm:text-[12px]">
            <span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#C8102E] to-[#FF3B55]" />
            Shop by Brand
          </p>
          <h3 className="mt-3 text-[26px] font-extrabold leading-[1.12] tracking-[-0.02em] text-white sm:text-[32px] lg:text-[34px]">
            Parts From Every Major Automation Brand
          </h3>
          <p className="mt-3 text-[14px] leading-[1.65] text-white/65 sm:text-[15px]">
            New, surplus, refurbished and obsolete parts from the brands that run your line.
          </p>
          <p className="mt-4 flex items-center gap-2 text-[13px] font-semibold text-white/85">
            <ShieldCheck size={16} className="shrink-0 text-[#FF5A6E]" />
            Every part tested before it ships
          </p>
          <Link
            href="/shop/brands"
            className="mt-5 inline-flex h-11 w-fit items-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-5 text-[14.5px] font-semibold text-white shadow-[0_12px_28px_-12px_rgba(255, 59, 85,0.8)] transition hover:-translate-y-0.5"
          >
            Shop all brands
            <ArrowRight size={17} />
          </Link>
        </div>

        <ul className="grid grid-cols-2 content-start gap-2.5 sm:gap-3 md:grid-cols-3 xl:grid-cols-4">
          {shopBrands.map((b, i) => (
            <li key={b.name} className={i >= 8 ? "hidden sm:block" : ""}>
              <Link
                href={b.href}
                aria-label={`Shop ${b.name} parts`}
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
                  <span className="mt-0.5 hidden text-[12px] leading-[1.4] text-white/55 sm:line-clamp-2">{b.series}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-6 flex flex-col gap-2 border-t border-white/10 pt-5 text-[13.5px] text-white/70 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-white">Don&apos;t see your brand?</span> We source parts from 1,000+
          brands.
        </p>
        <Link href="/request-quote" className="group inline-flex items-center gap-1.5 font-semibold text-[#FF5A6E] hover:text-white">
          Send us the part number
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
