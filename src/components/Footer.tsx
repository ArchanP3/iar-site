import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone, Wrench } from "lucide-react";
import { montserrat } from "@/lib/font";
import { totalCodes } from "@/lib/faultCodes";
import { directionsUrl, fullAddress, phoneHref as toTel } from "@/lib/contact";
import { getContact } from "@/lib/cms/business";
import { WhatsAppIcon, WhatsAppTrigger } from "@/components/WhatsAppButton";
import { COUNTRY_SITES, SITE_COUNTRY } from "@/lib/site";

/* Status pills: only true facts. The phone pill shows once a number is set
   (CMS > Locations, or src/lib/contact.ts). */
const baseVitals: [string, string, boolean?][] = [
  ["Turnaround", "24–72 hr typical"],
  ["Exchange units", "1–2 business days once yours arrives"],
  ["Fault codes", `${totalCodes.toLocaleString("en-US")} explained`],
];

const columns: { title: string; links: [string, string][] }[] = [
  {
    title: "Repair",
    links: [
      ["Servo Drive Repair", "/services/servo-drive-repair"],
      ["Servo Motor Repair", "/services/servo-motor-repair"],
      ["Encoder Repair", "/services/encoder-repair"],
      ["CNC Control Repair", "/services/cnc-repair"],
      ["Exchange Program", "/services/exchange"],
      ["On-site Service", "/on-site-service"],
    ],
  },
  {
    title: "Shop Parts",
    links: [
      ["Servo Drives", "/shop/servo-drives"],
      ["Servo Motors", "/shop/servo-motors"],
      ["PLCs & I/O", "/shop/plcs"],
      ["CNC Controls", "/shop/cnc-controls"],
      ["Legacy & Obsolete", "/shop/legacy"],
      ["Sell Your Surplus", "/sell-surplus"],
    ],
  },
  {
    title: "Brands",
    links: [
      ["Siemens", "/brands/siemens"],
      ["Rexroth Indramat", "/brands/rexroth-indramat"],
      ["Allen-Bradley", "/brands/allen-bradley"],
      ["Fanuc", "/brands/fanuc"],
      ["All brands", "/brands"],
    ],
  },
  {
    title: "Company",
    links: [
      ["Fault Code Library", "/fault-codes"],
      ["Industries", "/industries"],
      ["Service Areas", "/service-areas"],
      ["International Orders", "/international"],
      ["About", "/about"],
      ["Contact", "/contact"],
      ["Request a Quote", "/request-quote"],
    ],
  },
];

export default async function Footer() {
  const contact = await getContact();
  const phoneHref = toTel(contact.phone);
  const vitals: [string, string, boolean?][] = [...(contact.phone ? [["Calls & WhatsApp", contact.phone, true] as [string, string, boolean]] : []), ...baseVitals];
  return (
    <footer id="footer" className={`${montserrat.className} relative overflow-hidden bg-[#050B18] text-white`}>
      {/* liquid colour blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className="absolute -left-32 -top-40 h-105 w-130 rounded-full bg-[radial-gradient(closest-side,rgba(0,102,255,0.45),transparent)] blur-2xl" />
        <span className="absolute -right-24 top-10 h-90 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(0,176,255,0.28),transparent)] blur-2xl" />
        <span className="absolute -bottom-45 left-1/3 h-90 w-155 rounded-full bg-[radial-gradient(closest-side,rgba(64,72,255,0.22),transparent)] blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-360 px-5 pb-5 pt-8 sm:px-8 lg:px-12">
        {/* ---------- Glass panel ---------- */}
        <div className="relative overflow-hidden rounded-[22px] border border-white/15 bg-white/6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_20px_50px_-30px_rgba(0,102,255,0.8)] backdrop-blur-xl">
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.12)_0%,transparent_28%,transparent_70%,rgba(0,176,255,0.10)_100%)]" />
          <div className="relative grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8 lg:px-8">
            <div>
              <p className="text-[20px] font-extrabold leading-tight tracking-[-0.01em] sm:text-[24px]">
                Machine down?{" "}
                <span className="bg-linear-to-r from-[#7FD3FF] to-[#00B0FF] bg-clip-text text-transparent">Let&apos;s get it running again.</span>
              </p>
              <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
                <Link
                  href="/request-repair"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full sm:h-10 bg-white px-5 text-[13.5px] font-semibold text-[#0B1A3C] transition hover:-translate-y-0.5"
                >
                  <Wrench size={15} aria-hidden="true" /> Request a Repair <ArrowRight size={15} aria-hidden="true" />
                </Link>
                {contact.phone ? (
                  <a
                    href={phoneHref}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full sm:h-10 border border-white/20 bg-white/6 px-5 text-[13.5px] font-semibold transition hover:border-white/40"
                  >
                    <Phone size={15} aria-hidden="true" /> {contact.phone}
                  </a>
                ) : (
                  <Link
                    href="/request-repair?service=question"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full sm:h-10 border border-white/20 bg-white/6 px-5 text-[13.5px] font-semibold transition hover:border-white/40"
                  >
                    <Phone size={15} aria-hidden="true" /> Ask a Technician
                  </Link>
                )}
                <WhatsAppTrigger
                  topic="A question from the website"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full sm:h-10 bg-[#25D366] px-5 text-[13.5px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1FC15B]"
                >
                  <WhatsAppIcon size={15} /> WhatsApp
                </WhatsAppTrigger>
              </div>
            </div>

            <dl className={`grid grid-cols-2 gap-2 lg:w-155 ${vitals.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
              {vitals.map(([k, v, live]) => (
                <div key={k} className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 max-sm:odd:last:col-span-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">{k}</dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold [&:has(.animate-ping)]:whitespace-nowrap">
                    {live && (
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      </span>
                    )}
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* ---------- Links ---------- */}
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <Link href="/" aria-label="AutomIQ Automation & Drive Services home" className="inline-flex">
              <Image src="/automiq-logo-white-v2.png" alt="AutomIQ Automation & Drive Services" width={1100} height={206} sizes="256px" className="h-auto w-64" />
            </Link>
            <p className="mt-3 max-w-70 text-[12.5px] leading-[1.6] text-white/55">
              Servo drive, motor and industrial electronics repair for Canada and the USA.
            </p>
            <ul className="mt-3 space-y-1.5 text-[12.5px] text-white/75">
              {contact.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 hover:text-white">
                    <Mail size={13} className="text-[#4DB8FF]" aria-hidden="true" />
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.phone && (
                <li>
                  <a href={phoneHref} className="inline-flex items-center gap-2 hover:text-white">
                    <Phone size={13} className="text-[#4DB8FF]" aria-hidden="true" />
                    {contact.phone}
                  </a>
                </li>
              )}
              <li>
                <WhatsAppTrigger topic="A question from the website" className="inline-flex items-center gap-2 hover:text-white">
                  <WhatsAppIcon size={13} className="text-[#25D366]" />
                  {contact.phone ? `WhatsApp ${contact.phone}` : "WhatsApp us"}
                </WhatsAppTrigger>
              </li>
              <li className="flex items-start gap-2"><MapPin size={13} className="mt-0.5 flex-none text-[#4DB8FF]" aria-hidden="true" /><span>{fullAddress(contact)} <a href={directionsUrl} target="_blank" rel="noopener" className="ml-1 whitespace-nowrap font-semibold text-[#7FD3FF] hover:text-white">Directions</a></span></li>
            </ul>
          </div>
          {columns.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-white/60">{c.title}</p>
              <ul className="mt-3 space-y-1.5">
                {c.links.map(([l, h]) => (
                  <li key={h}>
                    <Link href={h} className="text-[13px] text-white/70 transition hover:text-white">{l}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* ---------- Bottom bar ---------- */}
        <div className="mt-7 border-t border-white/10 pt-4 text-[11.5px] text-white/60">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 AutomIQ Automation & Drive Services</p>
            <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-1">
              {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Warranty", "/warranty"], ["Sitemap", "/site-map"]].map(([l, h]) => (
                <Link key={h} href={h} className="hover:text-white">{l}</Link>
              ))}
              <a href="/downloads/AutomIQ-Brochure.pdf" download className="hover:text-white">Brochure</a>
              <a href="/downloads/AutomIQ-Line-Card.pdf" download className="hover:text-white">Line Card</a>
              {/* Country switch: link to the same site in the other country */}
              {SITE_COUNTRY === "CA" && <a href={`${COUNTRY_SITES.US}/`} hrefLang="en-US" className="hover:text-white">USA site</a>}
              {SITE_COUNTRY === "US" && <a href={`${COUNTRY_SITES.CA}/`} hrefLang="en-CA" className="hover:text-white">Canada site</a>}
            </nav>
          </div>
          <p className="mt-2 leading-[1.55] text-white/60">
            AutomIQ Automation & Drive Services is an independent repair and surplus parts provider. We are not affiliated with, authorized
            by, or endorsed by any manufacturer named on this site, and we are not an authorized distributor or service centre
            unless stated. All brand names, logos, model numbers and trademarks belong to their respective owners and are used
            only to identify compatible equipment. New and surplus parts sold by us may not include the manufacturer&apos;s
            warranty; our own warranty applies as stated. Product images may be representative.
          </p>
        </div>
      </div>
    </footer>
  );
}
