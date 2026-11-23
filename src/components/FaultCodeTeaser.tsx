import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { montserrat } from "@/lib/font";
import { families, familyUrl, totalCodes } from "@/lib/faultCodes";
import FaultCodeSearch from "@/components/fault-codes/FaultCodeSearch";

const quick: [string, string][] = [
  ["F30001", "/fault-codes/siemens/sinamics-s120/f30001"],
  ["SV0449", "/fault-codes/fanuc/alpha-i/sv0449"],
  ["F860", "/fault-codes/indramat/ecodrive-dkc/f860"],
  ["A.C9", "/fault-codes/yaskawa/sigma-ii-sgdh/a-c9"],
];

/* Small fault code section for the homepage */
export default function FaultCodeTeaser() {
  return (
    <section
      id="fault-codes"
      aria-labelledby="fault-codes-heading"
      className={`${montserrat.className} bg-[#F7FAFE] py-10 lg:py-14`}
    >
      <div className="mx-auto max-w-360 px-5 sm:px-8 lg:px-12">
        {/* Heading on white */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-190">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#005AE0] sm:text-[12px]">
              <span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#0066FF] to-[#00B0FF]" />
              Fault Code Library
            </p>
            <h2
              id="fault-codes-heading"
              className="mt-3 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#0B1A3C] sm:text-[36px] lg:text-[40px]"
            >
              What Is Your Drive{" "}
              <span className="bg-linear-to-r from-[#0066FF] to-[#00B0FF] bg-clip-text text-transparent">Telling You?</span>
            </h2>
            <p className="mt-3 text-[14px] leading-[1.65] text-[#52647F] sm:text-[16px]">
              Look up {totalCodes.toLocaleString("en-US")} servo drive, spindle and power supply fault codes, explained in
              plain English by our repair technicians, with likely causes and safe checks.
            </p>
          </div>
          <Link
            href="/fault-codes"
            className="group inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-xl bg-[#0B1A3C] px-5 text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-16px_rgba(11,26,60,0.8)] transition hover:-translate-y-0.5 hover:bg-[#0052CC] lg:self-auto"
          >
            Browse all fault codes <ArrowRight size={16} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Dark panel: search + drive families */}
        <div className="relative mt-7 rounded-[24px] bg-[linear-gradient(150deg,#0B1A3C_0%,#0A1530_60%,#071026_100%)] p-6 text-white shadow-[0_30px_60px_-36px_rgba(0,102,255,0.7)] sm:p-8 lg:p-10">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
            <span className="absolute -right-32 -top-32 h-105 w-105 rounded-full bg-[radial-gradient(circle,rgba(0,102,255,0.45),transparent_65%)]" />
            <span className="absolute inset-0 bg-[linear-gradient(rgba(127,211,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(127,211,255,0.05)_1px,transparent_1px)] bg-size-[44px_44px]" />
          </div>

          <div className="relative grid grid-cols-1 gap-7 lg:grid-cols-[1fr_1.05fr] lg:items-center">
            <div className="min-w-0 lg:order-2">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7FD3FF]">Type your fault code</p>
              <FaultCodeSearch />
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[12.5px]">
                <span className="text-white/50">Popular:</span>
                {quick.map(([c, href]) => (
                  <Link
                    key={c}
                    href={href}
                    className="rounded-lg border border-white/15 px-2.5 py-1 font-mono font-semibold text-white/80 transition hover:border-[#4DB8FF] hover:text-white"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </div>

            <div className="min-w-0 lg:order-1">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7FD3FF]">Browse by drive</p>
              <ul className="flex flex-wrap gap-2">
                {families.map((f) => (
                  <li key={f.seriesSlug}>
                    <Link
                      href={familyUrl(f)}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1 pl-1 pr-2.5 text-[12px] transition hover:border-[#4DB8FF]/50 sm:py-1.5 sm:pl-1.5 sm:pr-3 sm:text-[12.5px]"
                    >
                      <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-[#0066FF] to-[#00B0FF] text-[10.5px] font-extrabold sm:h-7 sm:w-7 sm:text-[11px]">
                        {f.initials}
                      </span>
                      <span className="font-semibold">{f.short}</span>
                      <span className="text-white/60">{f.codes.length.toLocaleString("en-US")}<span className="sr-only"> fault codes</span></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
