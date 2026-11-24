import Link from "next/link";
import { BadgeCheck, Cable, Camera, ChevronRight, ClipboardCheck, Ruler } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CableForm from "@/components/request/CableForm";
import NextSteps from "@/components/request/NextSteps";
import { brandFont } from "@/lib/font";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/request-cable", {
  title: "Order a Custom Servo Cable | Feedback & Power Cables | IAR",
  description: "Order custom servo feedback, power and brake cables for any drive and motor brand, built to your length. Spare critical cables. Ships to the USA & Canada.",
});

const steps = [
  ["Send drive & motor models", ClipboardCheck],
  ["Email connector photos & pinout", Camera],
  ["We confirm details and quote", BadgeCheck],
  ["Built to your length", Ruler],
] as const;

export default function RequestCablePage() {
  return (
    <main className={`${brandFont.className} min-h-screen bg-[#F7F7F8]`}>
      <PageExtras path="/request-cable" />
      <Header />
      <section className="relative overflow-hidden bg-[#0A0A0C] pb-24 pt-8 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-105 w-140 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.5),transparent)] blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 h-80 w-105 rounded-full bg-[radial-gradient(closest-side,rgba(217,28,56,0.3),transparent)] blur-2xl" />
        <div className="relative mx-auto max-w-310 px-5 sm:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-white/60">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true"><ChevronRight size={13} /></li>
              <li><Link href="/services/custom-cables" className="hover:text-white">Custom Cables</Link></li>
              <li aria-hidden="true"><ChevronRight size={13} /></li>
              <li className="text-white/85">Order</li>
            </ol>
          </nav>
          <h1 className="mt-4 flex items-center gap-3 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[40px]">
            <Cable className="hidden text-[#FF8A99] sm:block" size={36} aria-hidden="true" />
            Order a <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">Custom Cable</span>
          </h1>
          <p className="mt-2 max-w-160 text-[14.5px] leading-[1.6] text-white/75 sm:text-[16px]">
            Servo feedback, power and brake cables for any drive and motor, built to your length. Keep a spare for every critical axis.
          </p>
        </div>
      </section>
      <div className="relative mx-auto -mt-16 grid max-w-310 gap-5 px-5 pb-14 sm:px-8 lg:grid-cols-[1fr_360px]">
        <CableForm />
        <NextSteps title="How cable orders work" steps={steps} points={["Any brand", "Any length", "Drag-chain options", "Ships to USA & Canada"]} urgent="Cable damaged and the axis is down? Say so in the notes and we'll prioritise it." />
      </div>
      <Footer />
    </main>
  );
}
