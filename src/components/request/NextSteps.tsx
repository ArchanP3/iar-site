import { Check, ClipboardCheck, MapPin, RefreshCw, Truck, Wrench, Zap } from "lucide-react";

import { directionsUrl, fullAddress, phoneHref } from "@/lib/contact";
import { getContact } from "@/lib/cms/business";
import { WhatsAppIcon, WhatsAppTrigger } from "@/components/WhatsAppButton";

/* Phone comes from the CMS (Locations) or src/lib/contact.ts; the line hides until it is set */

type StepList = readonly (readonly [string, React.ElementType])[];

const repairSteps: StepList = [
  ["We confirm your request and shipping", Truck],
  ["Free evaluation and written quote", ClipboardCheck],
  ["Component-level repair after you approve", Wrench],
  ["Load tested on our benches, returned with a test report", RefreshCw],
];
const repairPoints = ["1-year warranty", "24–72 hr typical", "Free evaluation", "Across the USA"];

export default async function NextSteps({
  title = "What happens next",
  steps = repairSteps,
  points = repairPoints,
  urgent = "Choose “Exchange unit now” and we’ll prioritise it.",
  urgentTitle = "Line down right now?",
}: { title?: string; steps?: StepList; points?: string[]; urgent?: string; urgentTitle?: string }) {
  const contact = await getContact();
  const phone = { label: contact.phone, href: contact.phone ? phoneHref(contact.phone) : "" };
  return (
    <aside className="space-y-3 lg:sticky lg:top-28 lg:self-start">
      <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0A0A0C] p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
        <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.55),transparent)] blur-xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(255,59,85,0.3),transparent)] blur-xl" />
        <h2 className="relative text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF8A99]">{title}</h2>
        <ol className="relative mt-4 space-y-3.5">
          {steps.map(([t, Icon], i) => (
            <li key={t} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.07]"><Icon size={16} className="text-[#FF8A99]" aria-hidden="true" /></span>
              <span className="text-[13.5px] font-semibold leading-snug"><span className="mr-1.5 text-white/50">0{i + 1}</span>{t}</span>
            </li>
          ))}
        </ol>
        <ul className="relative mt-5 grid grid-cols-2 gap-2 border-t border-white/10 pt-4 text-[12px]">
          {points.map((t) => (
            <li key={t} className="flex items-center gap-1.5 text-white/80"><Check size={13} className="shrink-0 text-emerald-400" aria-hidden="true" />{t}</li>
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white"><Zap size={18} aria-hidden="true" /></span>
        <p className="text-[13px] leading-snug text-[#5B4A1E]">
          <b className="block text-[14px] text-[#3D2F0A]">{urgentTitle}</b>
          {urgent}
          {phone.label && <> Or call us: <a href={phone.href} className="font-bold underline">{phone.label}</a></>}
        </p>
      </div>
      {/* walk-in drop-off */}
      <div className="flex items-center gap-3 rounded-2xl border border-[#E3E3E6] bg-[#FFF6F7] p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-white"><MapPin size={18} aria-hidden="true" /></span>
        <p className="text-[13px] leading-snug text-[#4B4B55]">
          <b className="block text-[14px] text-[#131316]">Prefer to drop it off?</b>
          {fullAddress(contact)} · business hours, no appointment.{" "}
          <a href={directionsUrl} target="_blank" rel="noopener" className="font-bold text-[#A50D25] hover:underline">Directions</a>
        </p>
      </div>
      {/* for people who would rather not fill in a long form */}
      <WhatsAppTrigger topic={title === "What happens next" ? "A repair request" : "A request from the website"} className="group flex w-full items-center gap-3 rounded-2xl border border-[#BFEBD0] bg-[#F0FBF4] p-4 text-left transition hover:border-[#25D366]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white"><WhatsAppIcon size={19} /></span>
        <span className="min-w-0 flex-1 text-[13px] leading-snug text-[#24533A]">
          <b className="block text-[14px] text-[#0B3B22]">Prefer WhatsApp?</b>
          Skip the long form. Leave your name and email and our team will reply.
        </span>
      </WhatsAppTrigger>
    </aside>
  );
}
