"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, FileText, HelpCircle, Loader2, Lock, ShoppingCart, Wrench, X } from "lucide-react";
import { montserrat } from "@/lib/font";
import { contact } from "@/lib/contact";
import { sendLead } from "@/components/request/FormParts";
import { WA_EVENT, WhatsAppIcon, type WhatsAppAsk } from "@/components/WhatsAppButton";

const NEEDS = [
  { v: "Repair", icon: Wrench },
  { v: "Buy", icon: ShoppingCart },
  { v: "Quote", icon: FileText },
  { v: "Question", icon: HelpCircle },
] as const;
type Need = (typeof NEEDS)[number]["v"];
const KEY = "aq_wa_me";

/* One dialog for every WhatsApp button on the site.
   Name and email come first, so the request reaches us even if the WhatsApp chat never starts. */
export default function WhatsAppDialog() {
  const [ask, setAsk] = useState<WhatsAppAsk | null>(null);
  const [need, setNeed] = useState<Need>("Repair");
  const [me, setMe] = useState({ name: "", company: "", email: "", phone: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const first = useRef<HTMLInputElement>(null);
  const back = useRef<HTMLElement | null>(null);
  const number = contact.whatsapp.replace(/[^\d]/g, "");

  useEffect(() => {
    const open = (e: Event) => {
      const d = (e as CustomEvent<WhatsAppAsk>).detail;
      back.current = document.activeElement as HTMLElement | null;
      setAsk(d);
      setNeed(d.kind === "part" ? "Buy" : d.kind ? "Repair" : "Question");
      setState("idle");
      try { setMe((m) => ({ ...m, ...JSON.parse(sessionStorage.getItem(KEY) || "{}") })); } catch {}
    };
    window.addEventListener(WA_EVENT, open);
    return () => window.removeEventListener(WA_EVENT, open);
  }, []);

  useEffect(() => {
    if (!ask) return;
    /* phones: no keyboard popping up over the dialog straight away */
    const t = setTimeout(() => { if (matchMedia("(hover: hover) and (pointer: fine)").matches) first.current?.focus(); }, 50);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", esc);
    document.documentElement.style.overflow = "hidden";
    return () => { clearTimeout(t); document.removeEventListener("keydown", esc); document.documentElement.style.overflow = ""; };
  }, [ask]);

  function close() {
    setAsk(null);
    back.current?.focus?.();
  }

  if (!ask) return null;
  const t = ask.topic;
  const want: Record<Need, string> =
    ask.kind === "brand"
      ? { Repair: `a repair for my ${t} equipment`, Buy: `to buy ${t} parts`, Quote: `a quote for ${t} parts`, Question: `to ask about ${t} equipment` }
      : ask.kind === "service"
        ? { Repair: `help with ${t}`, Buy: `to buy a replacement (${t})`, Quote: `a quote for ${t}`, Question: `to ask about ${t}` }
        : ask.kind === "part"
          ? { Repair: `a repair for ${t}`, Buy: `to buy ${t}`, Quote: `a quote for ${t}`, Question: `to ask about ${t}` }
          : { Repair: "help with a repair", Buy: "to buy a part", Quote: "a quote", Question: "to ask a question" };
  const greeting = `Hi AutomIQ, I'm ${me.name || "…"}${me.company ? ` from ${me.company}` : ""}. I'd like ${want[need]}.`;
  /* link to the part / brand / service page: WhatsApp shows its photo and title as a preview card */
  const pageLink = ask.kind ? new URL(ask.url || location.pathname, location.origin).href : "";
  const message = pageLink ? `${greeting}\n${pageLink}` : greeting;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ask) return;
    try { sessionStorage.setItem(KEY, JSON.stringify(me)); } catch {}
    setState("sending");
    const fields = {
      Name: me.name, Company: me.company, Email: me.email, Phone: me.phone, Need: need, About: ask.topic, ...(pageLink ? { Page: pageLink } : {}),
      Channel: number ? "WhatsApp" : "WhatsApp button (no number yet, reply by email)",
      _type: "whatsapp", _subject: `Website WhatsApp: ${need} · ${ask.topic}`,
    };
    const delivered = await sendLead(fields);
    if (number) {
      window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
      setState("sent");
      return;
    }
    setState(delivered ? "sent" : "error");
  }

  const field = "h-12 w-full rounded-xl border border-[#D6E1EE] bg-[#F7FAFD] px-4 text-[15px] text-[#0B1A3C] outline-none transition placeholder:text-[#7C8BA1] focus:border-[#0066FF] focus:bg-white focus:ring-4 focus:ring-[#0066FF]/10";
  const lab = "mb-1.5 block text-[12px] font-bold uppercase tracking-[0.12em] text-[#3A4B66]";

  return (
    <div className={`${montserrat.className} fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6`}>
      <button type="button" aria-label="Close" onClick={close} className="absolute inset-0 bg-[#030817]/70 backdrop-blur-sm" />
      <div role="dialog" aria-modal="true" aria-labelledby="wa-title" className="relative flex max-h-[calc(100dvh-0.75rem)] w-full max-w-[460px] flex-col overflow-hidden rounded-t-[24px] bg-white sm:max-h-[calc(100dvh-3rem)] shadow-[0_50px_120px_-30px_rgba(0,0,0,0.75)] sm:rounded-[28px]">
        {/* header */}
        <div className="relative flex-none overflow-hidden bg-[#030817] px-5 pt-4 pb-4 text-white sm:px-6 sm:pt-6 sm:pb-5">
          <span aria-hidden="true" className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-[radial-gradient(closest-side,rgba(37,211,102,0.35),transparent)]" />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-[radial-gradient(closest-side,rgba(0,102,255,0.45),transparent)]" />
          <div className="relative flex items-center gap-3 sm:items-start sm:gap-4">
            <span className="relative grid size-11 flex-none place-items-center rounded-xl sm:size-13 sm:rounded-2xl bg-linear-to-br from-[#25D366] to-[#128C7E] shadow-[0_12px_28px_-10px_rgba(37,211,102,0.8)]">
              <WhatsAppIcon size={23} className="text-white" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="wa-title" className="text-[17px] font-extrabold leading-tight sm:text-[19px]">Connect with our team</h2>
              <p className="mt-0.5 text-[12.5px] leading-snug text-white/70 sm:mt-1 sm:text-[13px]">{number ? `We'll continue on WhatsApp at ${contact.whatsapp}.` : "WhatsApp is coming soon. We'll reply by email for now."}</p>
            </div>
            <button type="button" onClick={close} aria-label="Close" className="grid size-9 flex-none place-items-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="relative mt-3 flex items-center gap-2 rounded-xl border sm:mt-4 border-white/10 bg-white/6 px-3 py-2">
            <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#7FD3FF]">About</span>
            <span className="min-w-0 truncate text-[13.5px] font-semibold">{ask.topic}</span>
          </div>
        </div>

        {state === "sent" ? (
          <div className="overflow-y-auto px-6 py-10 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={30} aria-hidden="true" /></span>
            <p className="mt-4 text-[19px] font-extrabold text-[#0B1A3C]">{number ? "WhatsApp is opening" : "Request received"}</p>
            <p className="mx-auto mt-2 max-w-80 text-[14px] leading-relaxed text-[#52647F]">
              {number ? "Your details are saved with us too, so we can follow up by email if the chat doesn't connect." : "Thank you. A member of our team will reply by email."}
            </p>
            <button type="button" onClick={close} className="mt-6 inline-flex h-11 items-center rounded-xl border border-[#D9E4F1] px-5 text-[14px] font-semibold text-[#0B1A3C] hover:border-[#0066FF]">Done</button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto overscroll-contain px-5 pt-4 pb-1 sm:space-y-4 sm:px-6 sm:pt-5">
            <fieldset>
              <legend className={lab}>I need</legend>
              <div className="grid grid-cols-4 gap-1.5">
                {NEEDS.map(({ v, icon: I }) => (
                  <label key={v} className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-[12px] font-semibold transition has-focus-visible:ring-2 has-focus-visible:ring-[#0066FF] ${need === v ? "border-[#0066FF] bg-[#0066FF]/6 text-[#0052CC]" : "border-[#D6E1EE] text-[#3A4B66] hover:border-[#0066FF]/50"}`}>
                    <input type="radio" name="Need" value={v} checked={need === v} onChange={() => setNeed(v)} className="sr-only" />
                    <I size={17} aria-hidden="true" /> {v}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="wa-name" className={lab}>Your name *</label>
                <input ref={first} id="wa-name" name="Name" required autoComplete="name" value={me.name} onChange={(e) => setMe({ ...me, name: e.target.value })} className={field} />
              </div>
              <div>
                <label htmlFor="wa-company" className={lab}>Company <span className="font-medium normal-case tracking-normal text-[#7C8BA1]">optional</span></label>
                <input id="wa-company" name="Company" autoComplete="organization" value={me.company} onChange={(e) => setMe({ ...me, company: e.target.value })} className={field} />
              </div>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
              <div>
                <label htmlFor="wa-email" className={lab}>Email *</label>
                <input id="wa-email" type="email" required autoComplete="email" value={me.email} onChange={(e) => setMe({ ...me, email: e.target.value })} className={field} />
              </div>
              <div>
                <label htmlFor="wa-phone" className={lab}>Phone <span className="font-medium normal-case tracking-normal text-[#7C8BA1]">optional</span></label>
                <input id="wa-phone" type="tel" autoComplete="tel" value={me.phone} onChange={(e) => setMe({ ...me, phone: e.target.value })} className={field} />
              </div>
            </div>

            {number && (
              <div className="rounded-xl bg-[#E7F8EE] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#128C4A]">Your first message</p>
                <p className="mt-1 text-[13.5px] leading-snug text-[#0B3B22]">{greeting}</p>
                {pageLink && <p className="mt-1 truncate text-[12.5px] text-[#128C4A]">{pageLink.replace(/^https?:\/\//, "")}</p>}
              </div>
            )}
            {state === "error" && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700">
                That didn&apos;t send. Please try again{contact.email ? ` or email ${contact.email}` : ""}.
              </p>
            )}

            </div>
            {/* always on screen, above the phone's browser bar */}
            <div className="flex-none border-t border-[#EEF3F9] bg-white px-5 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:border-0 sm:px-6 sm:pt-2 sm:pb-6">
            <button type="submit" disabled={state === "sending"} className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl sm:h-13 bg-linear-to-br from-[#25D366] to-[#1DA851] text-[16px] font-bold text-white shadow-[0_16px_34px_-14px_rgba(29,168,81,0.9)] transition hover:-translate-y-0.5 disabled:opacity-70">
              {state === "sending" ? <Loader2 size={19} className="animate-spin" aria-hidden="true" /> : <WhatsAppIcon size={20} />}
              {number ? "Continue on WhatsApp" : "Send to our team"} {state !== "sending" && <ArrowRight size={17} aria-hidden="true" />}
            </button>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[12px] text-[#5B6B84]">
              <Lock size={12} aria-hidden="true" /> Used only to reply to this request.
            </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
