import Link from "next/link";
import { ChevronRight, FileText, PackageOpen, Plus, Tag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RepairForm from "@/components/request/RepairForm";
import NextSteps from "@/components/request/NextSteps";
import { brandFont } from "@/lib/font";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/request-repair", {
  title: "Request a Repair | Servo Drive, Motor & CNC Repair | IAR",
  description:
    "Send servo drives, motors, CNC and industrial electronics to our Mississauga repair centre. Free evaluation, 24–72 hr typical turnaround, 1-year warranty.",
});

const tips = [
  ["Include a note", "Part number, fault code and what happened before it failed. It speeds up diagnosis.", Tag],
  ["Pack it well", "Anti-static bag for electronics, at least 5 cm of padding on every side, sturdy box.", PackageOpen],
  ["Label the box", "Write your company name on the outside so we can match it to your request.", FileText],
] as const;

const faqs = [
  ["Is the evaluation really free?", "Yes. We test the unit, find the root cause and send a written quote. No work starts without your approval."],
  ["How long does a repair take?", "Typical turnaround is 24–72 hours once you approve the quote. Exchange units usually ship within 1–2 business days of receiving your unit."],
  ["What if my unit can't be repaired?", "We tell you before any repair work is done and offer an exchange unit, a refurbished replacement or a sourced part."],
];

/* FAQ rich results. Breadcrumb schema is added once the domain is live (it needs full URLs). */
const schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

export default function RequestRepairPage() {
  return (
    <main className={`${brandFont.className} min-h-screen bg-[#F7F7F8]`}>
      <PageExtras path="/request-repair" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Header />

      <section className="relative overflow-hidden bg-[#0A0A0C] pb-24 pt-8 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-105 w-140 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.5),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 h-80 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(255,59,85,0.3),transparent)] blur-2xl" />
        <div className="relative mx-auto max-w-310 px-5 sm:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-[12.5px] text-white/60">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true"><ChevronRight size={13} /></li>
              <li className="text-white/85">Request a Repair</li>
            </ol>
          </nav>
          <h1 className="mt-4 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[40px]">
            Request a <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">Repair</span>
          </h1>
          <p className="mt-2 max-w-160 text-[14.5px] leading-[1.6] text-white/75 sm:text-[16px]">
            Servo drives, motors, CNC controls and industrial electronics. Free evaluation and a written quote before any work starts.
          </p>
        </div>
      </section>

      <div className="relative mx-auto -mt-16 grid max-w-310 gap-5 px-5 sm:px-8 lg:grid-cols-[1fr_360px]">
        <RepairForm />
        <NextSteps />
      </div>

      <section aria-label="Shipping tips and questions" className="mx-auto grid max-w-310 gap-5 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="text-[20px] font-extrabold text-[#131316]">Before you ship</h2>
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
