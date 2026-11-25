import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, BadgeCheck, CalendarCheck, CheckCircle2, ClipboardList, Clock, FileText, Globe2, Home, Mail, MapPin, Package,
  Phone, Search, Truck, Wrench, type LucideIcon,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { brandFont } from "@/lib/font";
import { contact, phoneHref } from "@/lib/contact";

/* Thank-you pages shown after a request form is saved (see Thanks in ./FormParts.tsx).
   The request itself is saved by the form to the requests table, where the CMS Leads screen picks it up.
   One entry per form; each route is src/app/<form page>/thank-you/page.tsx. */

type Step = { icon: LucideIcon; t: string; d: string };
type Kind = { eyebrow: string; title: string; text: string; steps: Step[]; links: { href: string; label: string }[] };

const hours = `${contact.hours[0][0]}, ${contact.hours[0][1]}`;

export const THANK_YOU = {
  contact: {
    eyebrow: "Message sent", title: "We've got your message.",
    text: "Your enquiry has reached the Industrial Automation Repair team. A member of our team will reply by email with next steps.",
    steps: [
      { icon: Mail, t: "We review your message", d: "Our team reads every message and checks the part number and details you sent." },
      { icon: CheckCircle2, t: "We reply by email", d: `You'll hear from us at the email address you gave us. Our office hours are ${hours}.` },
      { icon: Wrench, t: "Next steps for your unit", d: "If it's a repair, we tell you how to send it in or arrange a pickup. The evaluation is free." },
    ],
    links: [{ href: "/services", label: "Repair services" }, { href: "/shop", label: "Shop parts" }],
  },
  repair: {
    eyebrow: "Repair request sent", title: "Your repair request is in.",
    text: "Thank you. Our team will contact you to confirm the details and your shipping option. No work starts without your approval.",
    steps: [
      { icon: ClipboardList, t: "We review your request", d: "We check the part number and fault description, and tell you if we need anything else." },
      { icon: Truck, t: "Send us the unit", d: "Ship it in with any carrier, drop it off in Grand Island, NY, or we arrange a pickup from your facility." },
      { icon: FileText, t: "Free evaluation and quote", d: "We find the root cause and send a written quote with the lead time. Nothing is repaired until you approve it." },
    ],
    links: [{ href: "/resources/shipping", label: "How to pack and ship" }, { href: "/request-pickup", label: "Request a pickup" }],
  },
  pickup: {
    eyebrow: "Pickup request sent", title: "We'll book your pickup.",
    text: "Thank you. We will book the pickup with your preferred carrier and send you the details. Your unit gets a free evaluation when it arrives.",
    steps: [
      { icon: CalendarCheck, t: "We book the pickup", d: "We arrange the collection with FedEx, UPS or DHL for the date and address you gave us." },
      { icon: Package, t: "Pack the unit", d: "We email you the waybill. Pack the unit securely with a short note on the fault." },
      { icon: FileText, t: "Free evaluation and quote", d: "When it arrives in Grand Island, NY, we evaluate it for free and send a written quote." },
    ],
    links: [{ href: "/resources/shipping", label: "How to pack a unit" }, { href: "/services", label: "Repair services" }],
  },
  quote: {
    eyebrow: "Quote request sent", title: "Your quote request is in.",
    text: "Thank you. We will reply with price, condition and lead time for your part.",
    steps: [
      { icon: Search, t: "We check the part", d: "We look for it in our stock and supplier network, including obsolete and hard-to-find parts." },
      { icon: Mail, t: "We send your quote", d: "You get the price, condition and lead time by email." },
      { icon: BadgeCheck, t: "Tested before it ships", d: "Every part is tested before shipping and covered by our one-year warranty." },
    ],
    links: [{ href: "/shop", label: "Shop parts" }, { href: "/services/exchange", label: "Exchange program" }],
  },
  cable: {
    eyebrow: "Cable request sent", title: "Your cable request is in.",
    text: "Thank you. We'll confirm the cable details and send your quote. If we need connector photos or a pinout, we'll ask by email.",
    steps: [
      { icon: ClipboardList, t: "We review the details", d: "We check the drive and motor models and the length you need." },
      { icon: Search, t: "We confirm connectors and pinout", d: "If anything is unclear, we ask for connector photos or a pinout by email." },
      { icon: Mail, t: "You get a quote", d: "We send the price and lead time, then build the cable to your length once you approve it." },
    ],
    links: [{ href: "/shop", label: "Shop parts" }, { href: "/services", label: "Repair services" }],
  },
  onsite: {
    eyebrow: "On-site request sent", title: "Your on-site request is in.",
    text: "Thank you. We contact you to go over the machine, confirm the visit and send a quote for the service call before anyone travels.",
    steps: [
      { icon: Phone, t: "We call you", d: "We go over the machine, the fault and what has been tried so far." },
      { icon: FileText, t: "Quote before travel", d: "We confirm the visit and send a quote for the service call before anyone travels." },
      { icon: Wrench, t: "On-site and on the bench", d: "If a part needs the bench, we bring it back to Grand Island, NY, repair it and test it under load." },
    ],
    links: [{ href: "/services", label: "Repair services" }, { href: "/services/exchange", label: "Exchange program" }],
  },
  surplus: {
    eyebrow: "Surplus list sent", title: "We've got your surplus list.",
    text: "Thank you. We review your list and reply with an offer or questions. Nothing is shipped or sold until you agree.",
    steps: [
      { icon: ClipboardList, t: "We review your list", d: "We check each part number, its condition and the quantity." },
      { icon: Mail, t: "You get an offer", d: "We reply by email with an offer or any questions. There is no obligation." },
      { icon: Truck, t: "Pickup if you accept", d: "If you accept, we arrange the pickup anywhere in the USA. Nothing ships until you agree." },
    ],
    links: [{ href: "/shop", label: "Shop parts" }, { href: "/services", label: "Repair services" }],
  },
  international: {
    eyebrow: "Quote request sent", title: "Your international quote request is in.",
    text: "Thank you. We check availability and reply by email with the price, shipping charges and lead time for your country.",
    steps: [
      { icon: Search, t: "We check availability", d: "We look for each part number in our stock and supplier network." },
      { icon: Globe2, t: "We quote shipping to you", d: "You get the price, shipping charges and lead time for your country by email." },
      { icon: Package, t: "Shipped by air", d: "Once you confirm, parts ship by air from Grand Island, NY. Duties and taxes are paid by the buyer." },
    ],
    links: [{ href: "/shop", label: "Shop parts" }, { href: "/resources/shipping", label: "Shipping information" }],
  },
} satisfies Record<string, Kind>;

export type ThankYouKind = keyof typeof THANK_YOU;

export const thankYouMetadata = (kind: ThankYouKind): Metadata => ({
  title: `${THANK_YOU[kind].eyebrow} | IAR`,
  description: THANK_YOU[kind].text,
  robots: { index: false, follow: true },
});

export default function ThankYouPage({ kind }: { kind: ThankYouKind }) {
  const k: Kind = THANK_YOU[kind];
  return (
    <div className={`${brandFont.className} flex min-h-screen flex-col bg-[#F7F7F8]`}>
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-[#0A0A0C] px-4 pb-24 pt-20 text-white sm:pt-24">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_0%,rgba(200,16,46,0.38),transparent)]" />
          <div className="relative mx-auto max-w-2xl text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-linear-to-br from-[#FF3B55] to-[#C8102E] shadow-[0_16px_40px_-12px_rgba(227,12,44,0.85)]">
              <CheckCircle2 size={32} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.25em] text-[#FF8A99]">{k.eyebrow}</p>
            <h1 className="mt-3 text-[32px] font-extrabold leading-tight sm:text-[44px]">
              Thank you. <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">{k.title}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed text-white/75">{k.text.replace(/^Thank you\.\s*/, "")}</p>
          </div>
        </section>

        <section className="relative mx-auto -mt-14 max-w-5xl px-4 pb-16 sm:px-6">
          <div className="rounded-[24px] border border-[#EAEAEC] bg-white p-6 shadow-[0_30px_70px_-45px_rgba(19,19,22,0.45)] sm:p-8">
            <h2 className="text-[20px] font-extrabold text-[#131316] sm:text-[22px]">What happens next</h2>
            <ol className="mt-5 grid gap-4 md:grid-cols-3">
              {k.steps.map((s, i) => (
                <li key={s.t} className="rounded-2xl border border-[#EAEAEC] bg-[#FAFAFB] p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#C8102E]/10 text-[#C8102E]"><s.icon size={19} aria-hidden="true" /></span>
                    <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#B30E29]">Step {i + 1}</span>
                  </div>
                  <p className="mt-3 font-bold text-[#131316]">{s.t}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-[#5A5A66]">{s.d}</p>
                </li>
              ))}
            </ol>

            <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-linear-to-br from-[#C8102E] to-[#8E0B20] p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-3">
                <Clock size={20} className="mt-0.5 flex-none" aria-hidden="true" />
                <div>
                  <p className="font-bold">Machine down right now?</p>
                  <p className="text-[14px] text-white/85">Don&apos;t wait for our reply. Call our 24/7 line and tell us your request is already in.</p>
                </div>
              </div>
              <a href={phoneHref(contact.phone)} className="inline-flex h-11 flex-none items-center justify-center gap-2 rounded-xl bg-white px-5 text-[14px] font-semibold text-[#131316] transition hover:bg-[#131316] hover:text-white">
                <Phone size={16} aria-hidden="true" /> {contact.phone}
              </a>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link href="/" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#131316] px-5 text-[14px] font-semibold text-white transition hover:bg-[#C8102E]">
                <Home size={16} aria-hidden="true" /> Back to home
              </Link>
              {k.links.map((l) => (
                <Link key={l.href} href={l.href} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#DADADF] px-5 text-[14px] font-semibold text-[#131316] transition hover:border-[#C8102E] hover:text-[#C8102E]">
                  {l.label} <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ))}
              <span className="flex items-center gap-2 text-[13px] text-[#646471] sm:ml-auto">
                <MapPin size={15} className="text-[#C8102E]" aria-hidden="true" /> {contact.address}
              </span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
