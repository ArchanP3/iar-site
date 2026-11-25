import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Home, Mail, Phone, Wrench } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { brandFont } from "@/lib/font";
import { contact, phoneHref } from "@/lib/contact";

/* Shown after the contact form is sent (src/components/request/ContactForm.tsx).
   The message itself is saved by the form to the leads table, where the CMS picks it up. */
export const metadata: Metadata = {
  title: "Message Sent | IAR",
  description: "Thank you for contacting Industrial Automation Repair. Our team will reply by email.",
  robots: { index: false, follow: true },
};

const next = [
  { icon: Mail, t: "We review your message", d: "Our team reads every message and checks the part number and details you sent." },
  { icon: CheckCircle2, t: "We reply by email", d: `You'll hear from us at the email address you gave us. Our office hours are ${contact.hours[0][0]}, ${contact.hours[0][1]}.` },
  { icon: Wrench, t: "Next steps for your unit", d: "If it's a repair, we tell you how to send it in or arrange a pickup. The evaluation is free." },
];

export default function ContactThankYou() {
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
            <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.25em] text-[#FF8A99]">Message sent</p>
            <h1 className="mt-3 text-[32px] font-extrabold leading-tight sm:text-[44px]">
              Thank you. <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">We&apos;ve got your message.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed text-white/75">
              Your enquiry has reached the Industrial Automation Repair team. A member of our team will reply by email with next steps.
            </p>
          </div>
        </section>

        <section className="relative mx-auto -mt-14 max-w-5xl px-4 pb-16 sm:px-6">
          <div className="rounded-[24px] border border-[#EAEAEC] bg-white p-6 shadow-[0_30px_70px_-45px_rgba(19,19,22,0.45)] sm:p-8">
            <h2 className="text-[20px] font-extrabold text-[#131316] sm:text-[22px]">What happens next</h2>
            <ol className="mt-5 grid gap-4 md:grid-cols-3">
              {next.map((s, i) => (
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
                  <p className="text-[14px] text-white/85">Don&apos;t wait for our reply. Call our 24/7 line and tell us your message is already in.</p>
                </div>
              </div>
              <a href={phoneHref(contact.phone)} className="inline-flex h-11 flex-none items-center justify-center gap-2 rounded-xl bg-white px-5 text-[14px] font-semibold text-[#131316] transition hover:bg-[#131316] hover:text-white">
                <Phone size={16} aria-hidden="true" /> {contact.phone}
              </a>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#131316] px-5 text-[14px] font-semibold text-white transition hover:bg-[#C8102E]">
                <Home size={16} aria-hidden="true" /> Back to home
              </Link>
              <Link href="/services" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#DADADF] px-5 text-[14px] font-semibold text-[#131316] transition hover:border-[#C8102E] hover:text-[#C8102E]">
                Repair services <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/shop" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#DADADF] px-5 text-[14px] font-semibold text-[#131316] transition hover:border-[#C8102E] hover:text-[#C8102E]">
                Shop parts <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
