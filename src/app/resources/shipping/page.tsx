import Link from "next/link";
import { AlertTriangle, ArrowRight, Box, Camera, CheckCircle2, ClipboardList, FileText, Globe2, HardDrive, PackageCheck, Truck, Wrench, XCircle } from "lucide-react";
import ResourceShell from "@/components/resources/ResourceShell";
import { SITE_URL } from "@/lib/site";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/resources/shipping", {
  title: "How to Ship a Servo Motor or Drive for Repair | IAR",
  description: "How to pack and ship a servo motor or drive to IAR in Grand Island, NY, free return shipping on completed repairs and pickup options.",
  alternates: { canonical: `${SITE_URL}/resources/shipping` },
});

const steps = [
  { icon: ClipboardList, t: "Request a repair", d: "Send us the part number and what the machine is doing. We reply with your repair confirmation and the shipping details." },
  { icon: HardDrive, t: "Back up your settings", d: "Save parameters and programs before the unit leaves your site. They are not covered by our warranty if they are lost." },
  { icon: Box, t: "Pack it well", d: "Follow the checklist below. Most transit damage comes from too little padding or a weak box." },
  { icon: FileText, t: "Add the paperwork", d: "Put a note inside with your company, contact, part number and the fault." },
  { icon: Truck, t: "Ship it or book a pickup", d: "Send it with FedEx, UPS, DHL or any carrier, or request a pickup and we arrange collection." },
  { icon: Camera, t: "We check it in", d: "On arrival your unit is logged, photographed and its condition recorded before the free evaluation starts." },
];

const pack = [
  ["Electronics in an anti-static bag", "Drives, boards, HMIs, PLCs and power supplies go in an anti-static bag before any padding."],
  ["5 cm (2 in) of padding on every side", "Foam or tightly packed bubble wrap. The unit must not move when you shake the box."],
  ["A strong, double-wall box", "Use a new box if you can. Heavy units travel best double-boxed."],
  ["Protect motor shafts and connectors", "Cap open connectors and protect the shaft and encoder. Strap heavy motors to a pallet."],
  ["Clean off coolant and oil", "Wipe the unit and seal it in a plastic bag so liquids cannot leak in transit."],
  ["Screens face up and padded", "HMIs and operator panels need extra padding over the glass."],
];

const avoid = [
  "Loose packing peanuts around heavy units: they shift and the unit hits the box wall",
  "Shipping without a note inside the box",
  "Removing a memory battery from a unit that holds parameters, unless you have a backup",
  "Sending cables or accessories we did not ask for",
];

const schema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to ship a unit to IAR for repair",
  description: "Pack and ship a servo drive, servo motor, HMI or circuit board for repair.",
  step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.t, text: s.d })),
};

export default function ShippingGuidePage() {
  return (
    <ResourceShell crumb={[{ label: "Resources", href: "/resources" }, { label: "How to Ship Us a Unit" }]} title="Shipping, Packing" accent="& Pickup"
      text="Ship from anywhere in the USA with any carrier, book a pickup, or drop it off at 3279 Grand Island Blvd, Grand Island, NY. Return shipping is free on completed repairs, packed for the trip with the test report inside." schema={schema}>
      <PageExtras path="/resources/shipping" />
      {/* Two ways */}
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { icon: Truck, t: "Ship it yourself", d: "Send it with FedEx, UPS, DHL or any carrier you use. Use the address in your repair confirmation.", cta: "Request a Repair", href: "/request-repair" },
          { icon: PackageCheck, t: "Request a pickup", d: "Tell us where and when. We send a waybill and arrange collection from your dock, billed to your invoice or your carrier account.", cta: "Request a Pickup", href: "/request-pickup" },
        ].map(({ icon: Icon, t, d, cta, href }, i) => (
          <div key={t} className={`rounded-[24px] p-6 sm:p-7 ${i ? "bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-white" : "border border-[#EAEAEC] bg-white shadow-[0_30px_70px_-45px_rgba(19,19,22,0.45)]"}`}>
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${i ? "bg-white/15 ring-1 ring-white/25" : "bg-[#C8102E]/8 text-[#B30E29]"}`}><Icon size={22} aria-hidden="true" /></span>
            <h2 className="mt-4 text-[22px] font-extrabold">{t}</h2>
            <p className={`mt-1.5 text-[14.5px] leading-relaxed ${i ? "text-white/85" : "text-[#62626F]"}`}>{d}</p>
            <Link href={href} className={`mt-5 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-[14px] font-semibold transition hover:-translate-y-0.5 ${i ? "bg-white text-[#A50D25]" : "bg-[#131316] text-white hover:bg-[#C8102E]"}`}>
              {cta} <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        ))}
      </div>

      {/* Steps */}
      <section aria-labelledby="steps" className="mt-12">
        <h2 id="steps" className="text-[24px] font-extrabold tracking-[-0.015em] sm:text-[28px]">Six steps from your dock to our bench</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(({ icon: Icon, t, d }, i) => (
            <li key={t} className="relative rounded-[22px] border border-[#EAEAEC] bg-white p-5">
              <span aria-hidden="true" data-n={String(i + 1).padStart(2, "0")} className="deco-num absolute right-5 top-5 text-[28px] font-extrabold leading-none text-[#F3F3F4]" />
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-white"><Icon size={20} aria-hidden="true" /></span>
              <p className="mt-4 text-[16.5px] font-extrabold">{t}</p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-[#62626F]">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Packing checklist */}
      <section aria-labelledby="pack" className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="rounded-[24px] border border-[#EAEAEC] bg-white p-6 sm:p-7">
          <h2 id="pack" className="text-[22px] font-extrabold">Packing checklist</h2>
          <ul className="mt-4 space-y-4">
            {pack.map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <CheckCircle2 size={20} className="mt-0.5 flex-none text-emerald-500" aria-hidden="true" />
                <span><span className="block text-[15px] font-bold">{t}</span><span className="block text-[13.5px] leading-relaxed text-[#62626F]">{d}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <div className="rounded-[24px] border border-[#FECACA] bg-[#FFF7F7] p-6">
            <h3 className="flex items-center gap-2 text-[17px] font-extrabold text-[#991B1B]"><AlertTriangle size={18} aria-hidden="true" /> Please avoid</h3>
            <ul className="mt-3 space-y-2.5">
              {avoid.map((a) => (
                <li key={a} className="flex gap-2.5 text-[13.5px] leading-relaxed text-[#7F1D1D]"><XCircle size={16} className="mt-0.5 flex-none text-[#EF4444]" aria-hidden="true" />{a}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[24px] bg-[#0A0A0C] p-6 text-white">
            <h3 className="flex items-center gap-2 text-[17px] font-extrabold"><FileText size={18} className="text-[#FF8A99]" aria-hidden="true" /> Note to put in the box</h3>
            <ul className="mt-3 space-y-1.5 text-[13.5px] text-white/80">
              {["Company name and contact", "Phone and email", "Full part number and serial number", "What the machine was doing when it failed", "Fault code, if any", "Your repair request or PO number"].map((x) => (
                <li key={x} className="flex gap-2"><span className="mt-1.75 h-1.5 w-1.5 flex-none rounded-full bg-[#FF3B55]" aria-hidden="true" />{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Parts to Canada */}
      <section aria-labelledby="canada" className="mt-12 rounded-[24px] border border-[#EAEAEC] bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-[#C8102E]/8 text-[#B30E29]"><Globe2 size={22} aria-hidden="true" /></span>
          <div>
            <h2 id="canada" className="text-[22px] font-extrabold">Shipping parts to Canada</h2>
            <p className="mt-1.5 max-w-190 text-[14.5px] leading-relaxed text-[#62626F]">
              Parts ship from our Grand Island, New York facility, so orders to Canada cross the border. Every shipment goes out with:
            </p>
            <ul className="mt-3 grid gap-2 text-[14px] text-[#131316] sm:grid-cols-2">
              {["A commercial invoice prepared by us", "Part number, description and quantity", "Value and country of origin", "Your company, address and contact"].map((x) => (
                <li key={x} className="flex gap-2"><CheckCircle2 size={17} className="mt-0.5 flex-none text-[#B30E29]" aria-hidden="true" />{x}</li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] text-[#696976]">Duties, taxes and brokerage fees on shipments to Canada are paid by the receiver unless we agree otherwise. Repair services are for customers in the USA.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="intl" className="mt-5 rounded-[24px] border border-[#EAEAEC] bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-[#C8102E]/8 text-[#B30E29]"><Globe2 size={22} aria-hidden="true" /></span>
          <div>
            <h2 id="intl" className="text-[22px] font-extrabold">Ordering parts from outside the USA and Canada</h2>
            <p className="mt-1.5 max-w-190 text-[14.5px] leading-relaxed text-[#62626F]">
              We ship industrial automation parts worldwide by air, including to Canada, Mexico, Europe, Japan, South Korea and the rest of Asia. Online ordering is for the USA and Canada, so customers in other countries send us an <Link href="/international" className="font-semibold text-[#A50D25] hover:underline">international quote request</Link>.
            </p>
            <ul className="mt-3 grid gap-2 text-[14px] text-[#131316] sm:grid-cols-2">
              {["Shipping charges vary by country and are quoted with your order", "You pay all duties, import taxes and brokerage fees", "We prepare the commercial invoice and export paperwork", "Repairs are for customers in the USA"].map((x) => (
                <li key={x} className="flex gap-2"><CheckCircle2 size={17} className="mt-0.5 flex-none text-[#B30E29]" aria-hidden="true" />{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="mt-10 flex flex-col gap-3 rounded-[24px] bg-linear-to-br from-[#131316] to-[#5E0D1A] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <p className="text-[19px] font-extrabold">Ready to send it?</p>
          <p className="text-[13.5px] text-white/70">Free evaluation and a written quote before any work starts.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/request-repair" className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-[14px] font-semibold text-[#131316]"><Wrench size={16} aria-hidden="true" /> Request a Repair</Link>
          <Link href="/request-pickup" className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/25 px-5 text-[14px] font-semibold"><Truck size={16} aria-hidden="true" /> Request a Pickup</Link>
        </div>
      </div>
    </ResourceShell>
  );
}
