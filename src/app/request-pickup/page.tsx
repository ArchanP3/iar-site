import Link from "next/link";
import { CalendarCheck, ChevronRight, ClipboardCheck, PackageOpen, Plus, Tag, Truck, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PickupForm from "@/components/request/PickupForm";
import NextSteps from "@/components/request/NextSteps";
import { brandFont } from "@/lib/font";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/request-pickup", {
  title: "Request a Pickup | Servo Drive & Motor Repair | AutomIQ",
  description:
    "Book a pickup for your servo drive, motor or industrial electronics repair with FedEx, Purolator, UPS or DHL. Free evaluation. Canada & USA.",
});

const pickupSteps = [
  ["Send your pickup details", ClipboardCheck],
  ["We book it with your preferred carrier", Truck],
  ["You get the pickup confirmation", CalendarCheck],
  ["Free evaluation when it arrives", FileText],
] as const;
const pickupPoints = ["FedEx · Purolator · UPS · DHL", "Canada & USA", "Free evaluation", "12-month warranty"];

const tips = [
  ["Pack it well", "Anti-static bag for electronics, at least 5 cm of padding on every side, sturdy box.", PackageOpen],
  ["Include a note", "Part number, fault code and what happened before it failed. It speeds up diagnosis.", Tag],
  ["Be ready at the dock", "Have the box sealed and labelled with your company name by your pickup time.", Truck],
] as const;

const faqs = [
  ["Which carriers can pick up my unit?", "FedEx, Purolator, UPS or DHL. Choose the one you prefer, or let us pick."],
  ["Do you pick up in the United States?", "Yes. We arrange pickups from facilities across Canada and the United States."],
  ["Is the evaluation free?", "Yes. When your unit arrives we test it, find the root cause and send a written quote. No work starts without your approval."],
];

const schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

export default function RequestPickupPage() {
  return (
    <main className={`${brandFont.className} min-h-screen bg-[#F7F7F8]`}>
      <PageExtras path="/request-pickup" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Header />

      <section className="relative overflow-hidden bg-[#0A0A0C] pb-24 pt-8 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-105 w-140 rounded-full bg-[radial-gradient(closest-side,rgba(200, 16, 46,0.5),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 h-80 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(255, 59, 85,0.3),transparent)] blur-2xl" />
        <div className="relative mx-auto max-w-310 px-5 sm:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-[12.5px] text-white/60">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true"><ChevronRight size={13} /></li>
              <li className="text-white/85">Request a Pickup</li>
            </ol>
          </nav>
          <h1 className="mt-4 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[40px]">
            Request a <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">Pickup</span>
          </h1>
          <p className="mt-2 max-w-160 text-[14.5px] leading-[1.6] text-white/75 sm:text-[16px]">
            We collect your servo drive, motor or control from your facility with FedEx, Purolator, UPS or DHL and bring it to our Mississauga repair centre for a free evaluation.
          </p>
        </div>
      </section>

      <div className="relative mx-auto -mt-16 grid max-w-310 gap-5 px-5 sm:px-8 lg:grid-cols-[1fr_360px]">
        <PickupForm />
        <NextSteps title="How pickups work" steps={pickupSteps} points={pickupPoints} urgent="Ask for an exchange unit in the notes, and we’ll prioritise it." />
      </div>

      <section aria-label="Pickup tips and questions" className="mx-auto grid max-w-310 gap-5 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="text-[20px] font-extrabold text-[#131316]">Before the pickup</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {tips.map(([t, d, Icon]) => (
              <li key={t} className="rounded-2xl border border-[#EAEAEC] bg-white p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C8102E]/8 text-[#B30E29]"><Icon size={17} aria-hidden="true" /></span>
                <h3 className="mt-2.5 text-[14px] font-bold text-[#131316]">{t}</h3>
                <p className="mt-0.5 text-[12.5px] leading-[1.55] text-[#646471]">{d}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-[20px] font-extrabold text-[#131316]">Quick answers</h2>
          <div className="mt-3 divide-y divide-[#EAEAEC] rounded-2xl border border-[#EAEAEC] bg-white">
            {faqs.map(([q, a], i) => (
              <details key={q} className="group px-4" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 [&::-webkit-details-marker]:hidden">
                  <h3 className="text-[13.5px] font-bold text-[#131316]">{q}</h3>
                  <Plus size={15} className="shrink-0 text-[#B30E29] transition group-open:rotate-45" aria-hidden="true" />
                </summary>
                <p className="-mt-1 pb-3 text-[12.5px] leading-[1.6] text-[#646471]">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
