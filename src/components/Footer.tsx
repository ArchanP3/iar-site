import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { brandFont } from "@/lib/font";
import { directionsUrl, fullAddress, phoneHref as toTel } from "@/lib/contact";
import { getContact } from "@/lib/cms/business";
import { WhatsAppIcon, WhatsAppTrigger } from "@/components/WhatsAppButton";
import { COUNTRY_SITES, SITE_COUNTRY } from "@/lib/site";

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
  return (
    <footer id="footer" className={`${brandFont.className} relative overflow-hidden bg-[#0A0A0C] text-white`}>
      {/* liquid colour blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className="absolute -left-32 -top-40 h-105 w-130 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.45),transparent)] blur-2xl" />
        <span className="absolute -right-24 top-10 h-90 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(255,59,85,0.28),transparent)] blur-2xl" />
        <span className="absolute -bottom-45 left-1/3 h-90 w-155 rounded-full bg-[radial-gradient(closest-side,rgba(245,74,99,0.22),transparent)] blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-360 px-5 pb-5 pt-8 sm:px-8 lg:px-12">
        {/* ---------- Links ---------- */}
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <Link href="/" aria-label="Industrial Automation Repair Inc. home" className="inline-flex">
              <Image src="/iar-logo-white.png" alt="Industrial Automation Repair Inc." width={988} height={448} sizes="180px" className="h-auto w-44" />
            </Link>
            <p className="mt-3 max-w-70 text-[12.5px] leading-[1.6] text-white/55">
              Industrial Automation Repair Inc. is a Grand Island, New York repair center specializing in servo motor, servo drive, spindle and industrial electronics repair for plants across the United States.
            </p>
            <ul className="mt-3 space-y-1.5 text-[12.5px] text-white/75">
              {contact.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 hover:text-white">
                    <Mail size={13} className="text-[#FF5A6E]" aria-hidden="true" />
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.phone && (
                <li>
                  <a href={phoneHref} className="inline-flex items-center gap-2 hover:text-white">
                    <Phone size={13} className="text-[#FF5A6E]" aria-hidden="true" />
                    {contact.phone}
                  </a>
                </li>
              )}
              <li>
                <WhatsAppTrigger topic="A question from the website" className="inline-flex items-center gap-2 hover:text-white">
                  <WhatsAppIcon size={13} className="text-[#25D366]" />
                  Message us
                </WhatsAppTrigger>
              </li>
              <li className="flex items-start gap-2"><MapPin size={13} className="mt-0.5 flex-none text-[#FF5A6E]" aria-hidden="true" /><span>{fullAddress(contact)} <a href={directionsUrl} target="_blank" rel="noopener" className="ml-1 whitespace-nowrap font-semibold text-[#FF8A99] hover:text-white">Directions</a></span></li>
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
            <p>© 2026 Industrial Automation Repair Inc.</p>
            <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-1">
              {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Warranty", "/warranty"], ["Sitemap", "/site-map"]].map(([l, h]) => (
                <Link key={h} href={h} className="hover:text-white">{l}</Link>
              ))}
              {/* Country switch: link to the same site in the other country */}
              {SITE_COUNTRY === "CA" && <a href={`${COUNTRY_SITES.US}/`} hrefLang="en-US" className="hover:text-white">USA site</a>}
            </nav>
          </div>
          <p className="mt-2 leading-[1.55] text-white/60">
            IAR is an independent repair company. Manufacturer names and part numbers are used only to identify equipment; IAR is
            not affiliated with or authorized by those manufacturers. All brand names, logos, model numbers and trademarks belong to
            their respective owners. New and surplus parts sold by us may not include the manufacturer&apos;s
            warranty; our own warranty applies as stated. Product images may be representative.
          </p>
        </div>
      </div>
    </footer>
  );
}
