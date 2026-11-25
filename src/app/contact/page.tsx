import Link from "next/link";
import {
  ArrowRight, BadgeCheck, ChevronRight, Clock, ClipboardCheck, Cpu, FileText, Gauge, Globe2, Mail, MapPin, MessageSquare,
  Monitor, Package, Phone, RefreshCw, Search, ShieldCheck, Truck, Wrench, Zap,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/request/ContactForm";
import StatCounter from "@/components/about/StatCounter";
import { brandFont } from "@/lib/font";
import { SITE_URL } from "@/lib/site";
import { contact as place, directionsUrl, fullAddress, geo, mapEmbedUrl, mapsUrl, openingHours, phoneHref, postalAddress } from "@/lib/contact";
import { WhatsAppIcon, WhatsAppTrigger } from "@/components/WhatsAppButton";
import { getContact, type Contact } from "@/lib/cms/business";
import { PageExtras, seo } from "@/lib/cms/seo";

/* Contact page. Confirmed facts only: Grand Island, NY repair center, the USA incl. on-site,
   free evaluation, written quote first, 24–72 hr typical
   turnaround once approved, 1-year warranty on repairs, test report, load tested on OEM-standard equipment.
   Phone, email and hours come from src/lib/contact.ts and stay hidden until they are filled in. */

export const generateMetadata = seo("/contact", {
  title: "Contact IAR | Repair Quote | Grand Island, NY",
  description:
    "Contact IAR in Grand Island, NY about servo motor, drive and electronics repair, parts and exchange units. Free evaluation on every repair.",
  alternates: { canonical: `${SITE_URL}/contact` },
});

const stats = [
  { value: 100, suffix: "%", l: "Units load tested before they ship" },
  { value: 24, suffix: "/7", l: "Emergency repair line" },
  { value: 24, to: 72, suffix: " hr", l: "Typical turnaround once approved" },
  { value: 1, suffix: "-year", l: "Warranty on every repair" },
];

/* Who to talk to: each desk goes to the form that already asks the right questions */
const desks = [
  {
    icon: Wrench, t: "Repairs", d: "Drives, motors, HMIs, PLCs, power supplies and boards.",
    bring: ["Part number from the nameplate", "What the machine is doing", "Fault code, if any"],
    cta: "Request a Repair", href: "/request-repair",
  },
  {
    icon: Package, t: "Parts & orders", d: "New, surplus, refurbished and obsolete parts.",
    bring: ["Full part number", "Quantity", "Condition you accept"],
    cta: "Request a Quote", href: "/request-quote",
  },
  {
    icon: RefreshCw, t: "Exchange units", d: "A tested replacement while your unit comes to us.",
    bring: ["Part number of the failed unit", "When you need it", "Ship it or book a pickup"],
    cta: "Ask About Exchange", href: "/request-repair?service=exchange",
  },
  {
    icon: Truck, t: "Pickups & shipping", d: "Send it with any carrier, or we arrange a pickup.",
    bring: ["Pickup address and dock", "Number of boxes", "Ready date and time"],
    cta: "Request a Pickup", href: "/request-pickup",
  },
];

const after = [
  { icon: MessageSquare, t: "We review your message", d: "Our team looks at your unit or part and replies with next steps." },
  { icon: ClipboardCheck, t: "Free evaluation", d: "For repairs we evaluate your unit for free and find the fault." },
  { icon: FileText, t: "Written quote first", d: "You approve the price before any work starts." },
  { icon: BadgeCheck, t: "Tested and returned", d: "24–72 hr typical turnaround, test report and 1-year warranty." },
];

const quick = [
  { t: "Servo Drive Repair", href: "/services/servo-drive-repair", icon: Zap },
  { t: "Servo Motor Repair", href: "/services/servo-motor-repair", icon: Cpu },
  { t: "Encoder Repair", href: "/services/encoder-repair", icon: Gauge },
  { t: "HMI Repair", href: "/services/hmi-repair", icon: Monitor },
  { t: "PLC Repair", href: "/services/plc-repair", icon: Cpu },
  { t: "Fault Code Library", href: "/fault-codes", icon: Search },
];

const faqs = [
  ["Is the evaluation really free?", "Yes. Every repair starts with a free evaluation, and you get a written quote to approve before any work starts."],
  ["How long does a repair take?", "Typical turnaround is 24 to 72 hours once you approve the quote. If you need it faster, ask about an exchange unit."],
  ["Which areas do you serve?", "Customers across the USA, with on-site service anywhere in the country."],
  ["How do I send you my unit?", "Ship it with any carrier such as FedEx, UPS or DHL, or request a pickup."],
  ["What warranty do repairs come with?", "Every repaired unit is load tested on OEM-standard equipment, comes with a test report and is covered by a 1-year warranty."],
];

const schemaFor = (contact: Contact) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      url: `${SITE_URL}/contact`,
      name: "Contact Industrial Automation Repair Inc.",
      about: {
        "@type": "Organization",
        name: "Industrial Automation Repair Inc.",
        url: SITE_URL,
        address: postalAddress, geo, openingHoursSpecification: openingHours,
        areaServed: [{ "@type": "Country", name: "United States" }],
        ...(contact.phone ? { telephone: contact.phone } : {}),
        ...(contact.email ? { email: contact.email } : {}),
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ],
});

type Card = { icon: React.ElementType; k: string; v: string; note: string; href?: string; wa?: boolean };

export default async function ContactPage() {
  const contact = await getContact();
  const schema = schemaFor(contact);
  const cards = ([
    contact.phone && { icon: Phone, k: "Call us", v: contact.phone, note: "Toll-free, 24/7 for line-down emergencies", href: phoneHref(contact.phone) },
    contact.email && { icon: Mail, k: "Email us", v: contact.email, note: "Attach photos of the nameplate", href: `mailto:${contact.email}` },
    { icon: WhatsAppIcon, k: "Chat with us", v: place.whatsapp ? place.whatsapp.replace(/^\+1\s*/, "") : "Message our team", note: "WhatsApp us, send nameplate photos", wa: true },
    { icon: MessageSquare, k: "Send a message", v: "Use the form below", note: "Repairs, parts or anything else", href: "#message" },
    { icon: Wrench, k: "Equipment down?", v: "Request a Repair", note: "Free evaluation, quote first", href: "/request-repair" },
    { icon: MapPin, k: "Repair center", v: fullAddress(contact), note: "Serving the USA", href: "#visit" },
  ].filter(Boolean) as Card[]).slice(0, 4);

  return (
    <main className={`${brandFont.className} min-h-screen bg-[#F7F7F8] text-[#131316]`}>
      <PageExtras path="/contact" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <Header />

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-[#0A0A0C] pb-28 pt-8 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-115 w-155 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.5),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-95 w-120 rounded-full bg-[radial-gradient(closest-side,rgba(255,59,85,0.28),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[44px_44px] mask-[radial-gradient(ellipse_at_30%_0%,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-310 px-5 sm:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-[12.5px] text-white/60">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true"><ChevronRight size={13} /></li>
              <li className="text-white/85">Contact</li>
            </ol>
          </nav>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3.5 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-[#FF8A99] ring-1 ring-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF3B55]" aria-hidden="true" /> Talk to a technician
          </p>
          <h1 className="mt-4 max-w-190 text-[34px] font-extrabold leading-[1.05] tracking-tight sm:text-[52px]">
            Let&apos;s get your <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">machine running</span> again.
          </h1>
          <p className="mt-4 max-w-155 text-[15px] leading-[1.65] text-white/75 sm:text-[17px]">
            Questions about a repair, a part or an exchange unit? Tell us the manufacturer, part number and the fault you’re seeing, and our team in Grand Island, NY will reply with next steps and a quote.
          </p>
        </div>
      </section>

      {/* ---------- Contact method cards ---------- */}
      <section aria-label="Ways to reach us" className="relative mx-auto -mt-16 max-w-310 px-5 sm:px-8">
        <ul className={`grid gap-3 sm:grid-cols-2 ${cards.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {cards.map(({ icon: Icon, k, v, note, href, wa }) => {
            const inner = (
              <>
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white ${wa ? "bg-linear-to-br from-[#25D366] to-[#128C7E] shadow-[0_12px_24px_-12px_rgba(37,211,102,0.9)]" : "bg-linear-to-br from-[#C8102E] to-[#FF3B55] shadow-[0_12px_24px_-12px_rgba(200,16,46,0.9)]"}`}>
                  <Icon size={21} aria-hidden="true" />
                </span>
                <span className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#696976]">{k}</span>
                <span className={`mt-1 block wrap-break-word font-extrabold leading-snug ${v.includes("@") ? "text-[15.5px] tracking-[-0.01em]" : "text-[17px]"}`}>
                  {v.includes("@") ? <>{v.split("@")[0]}@<wbr />{v.split("@")[1]}</> : v}
                </span>
                <span className="mt-1 block text-[13px] text-[#696976]">{note}</span>
                {(href || wa) && <ArrowRight size={17} className="absolute right-5 top-6 text-[#C2C2C9] transition group-hover:translate-x-0.5 group-hover:text-[#B30E29]" aria-hidden="true" />}
              </>
            );
            const cls = "group relative block h-full rounded-[22px] border border-[#EAEAEC] bg-white p-5 shadow-[0_30px_60px_-45px_rgba(19,19,22,0.5)] transition";
            return (
              <li key={k}>
                {wa ? (
                  <WhatsAppTrigger topic="A question from the contact page" className={`${cls} flex w-full flex-col items-start text-left hover:-translate-y-0.5 hover:border-[#25D366]/50`}>{inner}</WhatsAppTrigger>
                ) : href ? (
                  href.startsWith("/") ? <Link href={href} className={`${cls} hover:-translate-y-0.5 hover:border-[#C8102E]/40`}>{inner}</Link>
                    : <a href={href} className={`${cls} hover:-translate-y-0.5 hover:border-[#C8102E]/40`}>{inner}</a>
                ) : <div className={cls}>{inner}</div>}
              </li>
            );
          })}
        </ul>

        {/* Stats */}
        <ul className="mt-3 grid grid-cols-2 overflow-hidden rounded-[22px] border border-[#EAEAEC] bg-white lg:grid-cols-4">
          {stats.map((s, i) => (
            <li key={s.l} className={`px-5 py-5 sm:px-6 ${i % 2 ? "border-l border-[#F3F3F4]" : ""} ${i > 1 ? "border-t border-[#F3F3F4] lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
              <p className="whitespace-nowrap text-[clamp(21px,6.4vw,26px)] font-extrabold leading-none tracking-[-0.02em] text-[#B30E29] sm:text-[32px]"><StatCounter value={s.value} to={s.to} suffix={s.suffix} /></p>
              <p className="mt-2 text-[12.5px] font-semibold text-[#5A5A66] sm:text-[13.5px]">{s.l}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Visit us: address, hours, map ---------- */}
      <section id="visit" aria-labelledby="visit-h" className="mx-auto max-w-310 scroll-mt-28 px-5 pt-14 sm:px-8">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.22em] text-[#B30E29]">Visit us</p>
        <h2 id="visit-h" className="mt-2 text-[26px] font-extrabold tracking-[-0.015em] sm:text-[32px]">Our repair center in Grand Island, NY</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-[400px_1fr]">
          <div className="relative overflow-hidden rounded-[24px] bg-[#0A0A0C] p-6 text-white sm:p-7">
            <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.55),transparent)] blur-xl" />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-[#C8102E] to-[#FF3B55]"><MapPin size={21} aria-hidden="true" /></span>
            <p className="relative mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF8A99]">Address</p>
            <address className="relative mt-1 text-[19px] font-extrabold not-italic leading-snug sm:text-[20px]">
              {place.street}<br />{place.city}, {place.region} {place.postal}<br />USA
            </address>
            <p className="relative mt-3 flex items-start gap-2.5 text-[13.5px] text-white/80"><Truck size={16} className="mt-0.5 flex-none text-[#FF8A99]" aria-hidden="true" />For servo repair in Buffalo, NY, Niagara Falls and Western New York, bring the unit in with your company name, contact details and a short fault description. No appointment needed.</p>
            {contact.hours.length > 0 && (
              <div className="relative mt-5 border-t border-white/10 pt-4">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF8A99]"><Clock size={14} aria-hidden="true" /> Business hours</p>
                <dl className="mt-2 divide-y divide-white/10 text-[14px]">
                  {contact.hours.map(([d, t]) => (
                    <div key={d} className="flex justify-between gap-4 py-2"><dt className="text-white/70">{d}</dt><dd className={`font-semibold ${t === "Closed" ? "text-white/55" : ""}`}>{t}</dd></div>
                  ))}
                </dl>
                {place.afterHours && (
                  <p className="mt-2 flex items-start gap-2.5 rounded-xl bg-amber-400/12 px-3 py-2.5 text-[13px] leading-snug text-amber-100 ring-1 ring-amber-300/25">
                    <Zap size={15} className="mt-0.5 flex-none text-amber-300" aria-hidden="true" /><span>{place.afterHours}{contact.phone && <> <a href={phoneHref(contact.phone)} className="font-bold text-white underline-offset-2 hover:underline">{contact.phone}</a></>}</span>
                  </p>
                )}
              </div>
            )}
            <div className="relative mt-5 grid gap-2.5">
              <a href={directionsUrl} target="_blank" rel="noopener" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-[15px] font-semibold shadow-[0_14px_30px_-14px_rgba(255,59,85,0.9)] transition hover:-translate-y-0.5"><MapPin size={17} aria-hidden="true" /> Get directions</a>
              <div className="grid grid-cols-2 gap-2.5">
                {contact.phone && <a href={phoneHref(contact.phone)} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 text-[15px] font-semibold transition hover:border-white/40"><Phone size={16} aria-hidden="true" /> Call us</a>}
                <WhatsAppTrigger topic="A question from the contact page" className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-[15px] font-semibold transition hover:bg-[#1FC15B] ${contact.phone ? "" : "col-span-2"}`}><WhatsAppIcon size={17} /> WhatsApp</WhatsAppTrigger>
              </div>
            </div>
          </div>
          <div className="relative min-h-80 overflow-hidden rounded-[24px] border border-[#EAEAEC] bg-[#EEEEF0] sm:min-h-105">
            <iframe
              title={`Map: IAR repair center, ${place.address}`}
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
            />
            <a href={mapsUrl} target="_blank" rel="noopener" className="absolute bottom-4 right-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-white px-3.5 text-[13.5px] font-bold text-[#A50D25] shadow-[0_14px_30px_-14px_rgba(19,19,22,0.6)] hover:bg-[#FFF6F7]">Open in Google Maps <ArrowRight size={14} aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      {/* ---------- Who do you need ---------- */}
      <section aria-labelledby="desks" className="mx-auto max-w-310 px-5 pt-14 sm:px-8">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.22em] text-[#B30E29]">Fastest answer</p>
        <h2 id="desks" className="mt-2 text-[26px] font-extrabold tracking-[-0.015em] sm:text-[32px]">Who do you need?</h2>
        <p className="mt-2 max-w-155 text-[14.5px] text-[#62626F]">Pick the right desk and have these details ready. It saves a round of emails.</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {desks.map(({ icon: Icon, t, d, bring, cta, href }) => (
            <li key={t} className="flex flex-col rounded-[22px] border border-[#EAEAEC] bg-white p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C8102E]/8 text-[#B30E29] ring-1 ring-[#C8102E]/10"><Icon size={20} aria-hidden="true" /></span>
              <p className="mt-4 text-[17px] font-extrabold">{t}</p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-[#62626F]">{d}</p>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#696976]">Have ready</p>
              <ul className="mt-2 flex-1 space-y-1.5">
                {bring.map((b) => (
                  <li key={b} className="flex gap-2 text-[13px] text-[#131316]"><span className="mt-1.75 h-1.5 w-1.5 flex-none rounded-full bg-[#FF3B55]" aria-hidden="true" />{b}</li>
                ))}
              </ul>
              <Link href={href} className="group mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E3E3E7] text-[14px] font-semibold transition hover:border-[#C8102E] hover:bg-[#C8102E] hover:text-white">
                {cta} <ArrowRight size={15} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Form + location ---------- */}
      <section id="message" aria-labelledby="msg" className="mx-auto max-w-310 scroll-mt-28 px-5 pt-14 sm:px-8">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.22em] text-[#B30E29]">Send a message</p>
        <h2 id="msg" className="mt-2 text-[26px] font-extrabold tracking-[-0.015em] sm:text-[32px]">Tell us what you have</h2>
        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[1fr_380px]">
          <ContactForm />
          <aside className="space-y-3 lg:sticky lg:top-28">
            <div className="relative overflow-hidden rounded-[24px] bg-[#0A0A0C] p-6 text-white">
              <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.55),transparent)] blur-xl" />
              {/* coverage graphic: Grand Island, NY hub reaching the USA */}
              <svg aria-hidden="true" viewBox="0 0 320 120" className="relative h-auto w-full">
                <defs>
                  <linearGradient id="arc" x1="0" x2="1"><stop offset="0" stopColor="#FF3B55" stopOpacity="0" /><stop offset="1" stopColor="#FF3B55" /></linearGradient>
                </defs>
                {[[40, 30], [70, 92], [270, 26], [292, 88], [150, 108], [210, 14]].map(([x, y]) => (
                  <g key={`${x}-${y}`}>
                    <path d={`M182 62 Q ${(182 + x) / 2} ${Math.min(y, 62) - 34} ${x} ${y}`} fill="none" stroke="url(#arc)" strokeWidth="1.4" strokeDasharray="3 4" />
                    <circle cx={x} cy={y} r="3" fill="#FF8A99" opacity="0.8" />
                  </g>
                ))}
                <circle cx="182" cy="62" r="16" fill="#C8102E" opacity="0.18" />
                <circle cx="182" cy="62" r="9" fill="#C8102E" opacity="0.35" />
                <circle cx="182" cy="62" r="4.5" fill="#fff" />
              </svg>
              <p className="relative mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF8A99]">Repair center</p>
              <p className="relative mt-1 text-[20px] font-extrabold">{fullAddress(contact)}</p>
              <ul className="relative mt-4 space-y-2.5 text-[13.5px] text-white/80">
                <li className="flex items-start gap-2.5"><Globe2 size={16} className="mt-0.5 flex-none text-[#FF8A99]" aria-hidden="true" />Serving customers across the USA</li>
                <li className="flex items-start gap-2.5"><Truck size={16} className="mt-0.5 flex-none text-[#FF8A99]" aria-hidden="true" />Ship it in with any carrier, or request a pickup</li>
                <li className="flex items-start gap-2.5"><MapPin size={16} className="mt-0.5 flex-none text-[#FF8A99]" aria-hidden="true" />On-site service anywhere in the USA</li>
              </ul>
              {(contact.phone || contact.email) && (
                <div className="relative mt-5 space-y-2 border-t border-white/10 pt-4 text-[14px] font-semibold">
                  {contact.phone && <a href={phoneHref(contact.phone)} className="flex items-center gap-2.5 hover:text-[#FF8A99]"><Phone size={16} aria-hidden="true" />{contact.phone}</a>}
                  {contact.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-2.5 break-all hover:text-[#FF8A99]"><Mail size={16} aria-hidden="true" />{contact.email}</a>}
                  <WhatsAppTrigger topic="A question from the contact page" className="flex items-center gap-2.5 hover:text-[#FF8A99]"><WhatsAppIcon size={16} className="text-[#25D366]" />WhatsApp{place.whatsapp ? ` ${place.whatsapp.replace(/^\+1\s*/, "")}` : " us"}</WhatsAppTrigger>
                </div>
              )}
            </div>

            <div className="rounded-[24px] border border-[#EAEAEC] bg-white p-5">
              <p className="flex items-center gap-2 text-[15px] font-extrabold"><ShieldCheck size={17} className="text-[#B30E29]" aria-hidden="true" /> Our promise</p>
              <ul className="mt-3 space-y-2 text-[13.5px] text-[#5A5A66]">
                {["Free evaluation on every repair", "Written quote before any work", "Load tested on OEM-standard equipment", "1-year warranty and test report"].map((x) => (
                  <li key={x} className="flex gap-2"><BadgeCheck size={16} className="mt-0.5 flex-none text-[#B30E29]" aria-hidden="true" />{x}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------- What happens next ---------- */}
      <section aria-labelledby="next" className="mx-auto max-w-310 px-5 pt-14 sm:px-8">
        <div className="text-center">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.22em] text-[#B30E29]">After you get in touch</p>
          <h2 id="next" className="mt-2 text-[26px] font-extrabold tracking-[-0.015em] sm:text-[32px]">What happens next</h2>
        </div>
        <ol className="relative mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <span aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-8.5 hidden h-px bg-linear-to-r from-[#C8102E]/0 via-[#C8102E]/40 to-[#C8102E]/0 lg:block" />
          {after.map(({ icon: Icon, t, d }, i) => (
            <li key={t} className="relative rounded-[22px] border border-[#EAEAEC] bg-white p-5 text-center">
              <span className="relative mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-white shadow-[0_14px_28px_-14px_rgba(200,16,46,0.9)]">
                <Icon size={22} aria-hidden="true" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#131316] text-[11px] font-bold ring-2 ring-white">{String(i + 1).padStart(2, "0")}</span>
              </span>
              <p className="mt-4 text-[16px] font-extrabold">{t}</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#62626F]">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- FAQ + quick links ---------- */}
      <section aria-labelledby="faq" className="mx-auto grid max-w-310 gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 id="faq" className="text-[24px] font-extrabold tracking-[-0.015em] sm:text-[28px]">Common questions</h2>
          <div className="mt-5 divide-y divide-[#EAEAEC] overflow-hidden rounded-[22px] border border-[#EAEAEC] bg-white">
            {faqs.map(([q, a]) => (
              <details key={q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-bold">
                  {q}
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-[#F5F5F6] text-[#B30E29] transition group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-2.5 text-[14px] leading-relaxed text-[#62626F]">{a}</p>
              </details>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-[24px] font-extrabold tracking-[-0.015em] sm:text-[28px]">Popular pages</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {quick.map(({ t, href, icon: Icon }) => (
              <li key={href}>
                <Link href={href} className="inline-flex h-11 items-center gap-2 rounded-full border border-[#E3E3E7] bg-white px-4 text-[13.5px] font-semibold transition hover:border-[#C8102E] hover:text-[#B30E29]">
                  <Icon size={15} className="text-[#B30E29]" aria-hidden="true" /> {t}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row lg:flex-col">
            <Link href="/request-repair" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-br sm:flex-1 lg:flex-none from-[#C8102E] to-[#FF3B55] text-[15px] font-semibold text-white shadow-[0_14px_30px_-14px_rgba(200,16,46,0.9)] transition hover:-translate-y-0.5">
              <Wrench size={16} aria-hidden="true" /> Request a Repair
            </Link>
            <Link href="/request-quote" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border sm:flex-1 lg:flex-none border-[#E3E3E7] bg-white text-[15px] font-semibold transition hover:border-[#C8102E] hover:text-[#B30E29]">
              <FileText size={16} aria-hidden="true" /> Request a Quote
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
