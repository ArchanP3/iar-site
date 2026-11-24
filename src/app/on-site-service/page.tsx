import Link from "next/link";
import { ArrowRight, ClipboardCheck, Cpu, FileText, MapPin, Phone, Plus, Search, Settings2, Truck, Wrench, Zap } from "lucide-react";
import ResourceShell from "@/components/resources/ResourceShell";
import OnSiteForm from "@/components/request/OnSiteForm";
import NextSteps from "@/components/request/NextSteps";
import { SITE_URL } from "@/lib/site";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/on-site-service", {
  title: "On-Site Industrial Repair Service | USA | IAR",
  description: "On-site technicians for servo drives, CNC controls, PLCs and VFDs across the USA. Troubleshooting, replacement and start-up at your plant.",
  alternates: { canonical: `${SITE_URL}/on-site-service` },
});

const steps = [
  ["Tell us about the machine", Phone],
  ["We confirm the visit and the cost", FileText],
  ["A technician works at your plant", Wrench],
  ["Failed units come to our repair center", Truck],
] as const;
const points = ["All 50 states", "Breakdowns & planned visits", "Quote before travel", "Repairs with 1-year warranty"];

const work = [
  [Search, "Troubleshooting", "Find the fault on the machine: drive, motor, feedback, wiring or control."],
  [Settings2, "Drive & motor swaps", "Install a repaired or exchange unit, set parameters and tune it."],
  [Cpu, "PLC, HMI & CNC", "Diagnose controls, restore backups and get the machine back in cycle."],
  [Zap, "Start-up & checks", "Commissioning help after a repair, move or planned shutdown."],
] as const;

const faqs: [string, string][] = [
  ["Where do you provide on-site service?", "Across the United States. Our repair center is in Grand Island, New York, and technicians travel to your plant."],
  ["How much does a service call cost?", "It depends on the location, the travel and the work. We send you the cost before anyone travels, so there are no surprises."],
  ["What if the part needs a bench repair?", "We bring the failed unit back to our Grand Island, NY repair center, repair it at component level and test it on our test benches. An exchange unit can keep you running in the meantime."],
  ["Can you help us before a planned shutdown?", "Yes. Book a planned visit, and tell us the machine and the date so the technician comes prepared."],
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Service", name: "On-site industrial repair service", serviceType: "Field service for industrial automation", url: `${SITE_URL}/on-site-service`, areaServed: [{ "@type": "Country", name: "United States" }], provider: { "@type": "Organization", name: "Industrial Automation Repair Inc.", url: SITE_URL, address: { "@type": "PostalAddress", addressLocality: "Grand Island", addressRegion: "NY", addressCountry: "US" } } },
    { "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ],
};

export default function OnSitePage() {
  return (
    <ResourceShell crumb={[{ label: "Services", href: "/services" }, { label: "On-site Service" }]} title="On-Site" accent="Service"
      text="Our on-site industrial repair service sends technicians to your plant for troubleshooting, replacement and start-up of servo drives, CNC controls, PLCs and VFDs, anywhere in the USA. If the part needs the bench, we bring it back to Grand Island, NY, repair it at component level and test it under load." schema={schema}>
      <PageExtras path="/on-site-service" />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <OnSiteForm />
        <NextSteps title="How on-site service works" steps={steps} points={points} urgent="Machine down? Choose “Machine is down” and we reply first to those." />
      </div>

      <section aria-labelledby="work" className="mt-12">
        <h2 id="work" className="text-[24px] font-extrabold tracking-[-0.015em] sm:text-[28px]">What we do on site</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {work.map(([Icon, t, d]) => (
            <li key={t} className="rounded-[22px] border border-[#EAEAEC] bg-white p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C8102E]/8 text-[#B30E29]"><Icon size={20} aria-hidden="true" /></span>
              <h3 className="mt-3 text-[15.5px] font-extrabold">{t}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[#62626F]">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq" className="mt-12 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 id="faq" className="text-[24px] font-extrabold tracking-[-0.015em] sm:text-[28px]">Questions about on-site service</h2>
          <div className="mt-4 divide-y divide-[#EAEAEC] overflow-hidden rounded-[22px] border border-[#EAEAEC] bg-white">
            {faqs.map(([q, a], i) => (
              <details key={q} className="group px-5 py-4" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                  <h3 className="text-[15px] font-bold">{q}</h3>
                  <Plus size={16} className="flex-none text-[#B30E29] transition group-open:rotate-45" aria-hidden="true" />
                </summary>
                <p className="mt-2 text-[14px] leading-relaxed text-[#62626F]">{a}</p>
              </details>
            ))}
          </div>
        </div>
        <div className="space-y-3 self-start">
          <div className="rounded-[22px] border border-[#EAEAEC] bg-white p-5">
            <p className="flex items-center gap-2 text-[15px] font-extrabold"><ClipboardCheck size={17} className="text-[#B30E29]" aria-hidden="true" /> Unit can travel?</p>
            <p className="mt-1 text-[13.5px] text-[#62626F]">A bench repair is usually faster and costs less. Ship it in or book a pickup.</p>
            <Link href="/request-repair" className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#A50D25] hover:underline">Request a repair <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
          <div className="rounded-[22px] border border-[#EAEAEC] bg-white p-5">
            <p className="flex items-center gap-2 text-[15px] font-extrabold"><MapPin size={17} className="text-[#B30E29]" aria-hidden="true" /> Where we work</p>
            <p className="mt-1 text-[13.5px] text-[#62626F]">Manufacturers in every state.</p>
            <Link href="/service-areas" className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#A50D25] hover:underline">Service areas <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </ResourceShell>
  );
}
