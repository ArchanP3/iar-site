"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, CheckCircle2, Loader2, Minus, Plus, ShieldCheck } from "lucide-react";
import { submitServiceRequest } from "@/lib/requests";

export const input =
  "h-11 w-full rounded-xl border border-[#F0DADD] bg-[#FBFBFC] px-3.5 text-[14px] text-[#131316] outline-none transition placeholder:text-[#90909C] focus:border-[#C8102E] focus:bg-white focus:ring-4 focus:ring-[#C8102E]/10";
export const label = "mb-1.5 block text-[12.5px] font-semibold text-[#131316]";
export const brands = ["Siemens", "Rexroth Indramat", "Allen-Bradley", "Fanuc", "Yaskawa", "Mitsubishi", "Kollmorgen", "Schneider Electric", "Omron", "ABB", "Other"];

export function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-[#F3F3F4] px-5 py-5 first:border-t-0 sm:px-7">
      <legend className="sr-only">{title}</legend>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-[12px] font-bold text-white">{n}</span>
        <div>
          <p className="text-[15.5px] font-extrabold text-[#131316]">{title}</p>
          {hint && <p className="text-[12.5px] text-[#646471]">{hint}</p>}
        </div>
      </div>
      {children}
    </fieldset>
  );
}

export type Opt = { v: string; t: string; d: string; icon: React.ElementType };

export function Choice({ name, options, value, onChange, cols = 3 }: { name: string; value: string; onChange: (v: string) => void; options: Opt[]; cols?: 2 | 3 }) {
  return (
    <div className={`grid gap-2 ${cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
      {options.map(({ v, t, d, icon: Icon }) => {
        const on = value === v;
        return (
          <label key={v} className={`relative flex cursor-pointer gap-3 rounded-2xl border p-3.5 transition has-focus-visible:ring-4 has-focus-visible:ring-[#C8102E]/25 ${on ? "border-[#C8102E] bg-[#C8102E]/5 ring-4 ring-[#C8102E]/10" : "border-[#F0DADD] hover:border-[#C8102E]/40"}`}>
            <input type="radio" name={name} value={t} checked={on} onChange={() => onChange(v)} className="sr-only" />
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${on ? "bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-white" : "bg-[#C8102E]/8 text-[#B30E29]"}`}>
              <Icon size={17} aria-hidden="true" />
            </span>
            <span className="min-w-0 pr-4">
              <span className="block text-[13.5px] font-bold text-[#131316]">{t}</span>
              <span className="block text-[12px] leading-snug text-[#646471]">{d}</span>
            </span>
            {on && <Check size={15} className="absolute right-3 top-3 text-[#B30E29]" aria-hidden="true" />}
          </label>
        );
      })}
    </div>
  );
}

/* Contact block used by every request form. location=false hides country/postal (when an address is asked separately) */
export function DetailsFields({ prefix, location = true }: { prefix: string; location?: boolean }) {
  const f = (id: string) => `${prefix}-${id}`;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div><label className={label} htmlFor={f("company")}>Company *</label><input id={f("company")} name="Company" required className={input} autoComplete="organization" /></div>
      <div><label className={label} htmlFor={f("name")}>Contact name *</label><input id={f("name")} name="Name" required className={input} autoComplete="name" /></div>
      <div><label className={label} htmlFor={f("email")}>Work email *</label><input id={f("email")} name="Email" type="email" required className={input} autoComplete="email" /></div>
      <div><label className={label} htmlFor={f("phone")}>Phone *</label><input id={f("phone")} name="Phone" type="tel" required className={input} autoComplete="tel" /></div>
      {location && (
        <>
          <div>
            <label className={label} htmlFor={f("country")}>Country</label>
            <select id={f("country")} name="Country" className={input}><option>Canada</option><option>United States</option></select>
          </div>
          <div><label className={label} htmlFor={f("postal")}>Postal / ZIP code</label><input id={f("postal")} name="Postal code" className={input} autoComplete="postal-code" /></div>
        </>
      )}
    </div>
  );
}

/* Pickup address */
export function AddressFields({ prefix }: { prefix: string }) {
  const f = (id: string) => `${prefix}-${id}`;
  return (
    <div className="grid gap-3 sm:grid-cols-6">
      <div className="sm:col-span-4"><label className={label} htmlFor={f("street")}>Street address *</label><input id={f("street")} name="Pickup street" required className={input} autoComplete="address-line1" /></div>
      <div className="sm:col-span-2"><label className={label} htmlFor={f("suite")}>Unit / dock <span className="font-normal text-[#62626F]">(optional)</span></label><input id={f("suite")} name="Pickup unit or dock" className={input} autoComplete="address-line2" /></div>
      <div className="sm:col-span-2"><label className={label} htmlFor={f("city")}>City *</label><input id={f("city")} name="Pickup city" required className={input} autoComplete="address-level2" /></div>
      <div className="sm:col-span-2"><label className={label} htmlFor={f("region")}>Province / State *</label><input id={f("region")} name="Pickup province or state" required className={input} autoComplete="address-level1" /></div>
      <div className="sm:col-span-2"><label className={label} htmlFor={f("postal")}>Postal / ZIP *</label><input id={f("postal")} name="Pickup postal code" required className={input} autoComplete="postal-code" /></div>
      <div className="sm:col-span-3">
        <label className={label} htmlFor={f("country")}>Country</label>
        <select id={f("country")} name="Pickup country" className={input} autoComplete="country-name"><option>Canada</option><option>United States</option></select>
      </div>
    </div>
  );
}

/* Preferred carrier: names only, no logos */
const carriers = ["FedEx", "Purolator", "UPS", "DHL", "No preference"];

export function CarrierPicker({ prefix, value, onChange }: { prefix: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <p className={label}>Preferred carrier</p>
        <input type="hidden" name="Preferred carrier" value={value} />
        <div className="flex flex-wrap gap-2">
          {carriers.map((c) => (
            <button key={c} type="button" aria-pressed={value === c} onClick={() => onChange(c)}
              className={`min-w-24 rounded-xl border px-4 py-2.5 text-[13.5px] font-bold transition ${value === c ? "border-[#C8102E] bg-[#C8102E]/6 text-[#A50D25] ring-4 ring-[#C8102E]/10" : "border-[#F0DADD] bg-white text-[#131316] hover:border-[#C8102E]/40"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
      {value !== "No preference" && (
        <div className="max-w-90">
          <label className={label} htmlFor={`${prefix}-acct`}>Your {value} account number <span className="font-normal text-[#62626F]">(optional)</span></label>
          <input id={`${prefix}-acct`} name="Carrier account number" className={input} placeholder="If you want it billed to your account" />
        </div>
      )}
    </div>
  );
}

export type SendStatus = "idle" | "sending" | "sent" | "error" | "closed";

/* Saves a request that isn't a <form> post (WhatsApp dialog, chat assistant), with where the visitor came from. */
export async function sendLead(fields: Record<string, FormDataEntryValue>): Promise<boolean> {
  const data: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields)) if (typeof v === "string" && v) data[k] = v;
  data._page = location.pathname;
  try { data._src = sessionStorage.getItem("aq_src") ?? ""; } catch {}
  try {
    return (await submitServiceRequest(data)).ok;
  } catch {
    return false;
  }
}

/* Sends the form to Supabase via a server action (src/lib/requests.ts). */
export function useSend() {
  const [status, setStatus] = useState<SendStatus>("idle");
  /** Resolves true when the request was saved (checkout clears the cart on true). */
  async function send(e: React.FormEvent<HTMLFormElement>): Promise<boolean> {
    e.preventDefault();
    setStatus("sending");
    try {
      const data: Record<string, string> = {};
      for (const [k, v] of new FormData(e.currentTarget).entries()) {
        if (typeof v === "string") data[k] = data[k] ? `${data[k]}, ${v}` : v;
      }
      // Where the visitor came from (set by components/cms/Tracking), for the Leads screen.
      data._page = location.pathname;
      try { data._src = sessionStorage.getItem("aq_src") ?? ""; } catch {}
      const res = await submitServiceRequest(data);
      setStatus(res.ok ? "sent" : "error");
      if (res.ok) window.scrollTo({ top: 0, behavior: "smooth" });
      return res.ok;
    } catch {
      setStatus("error");
      return false;
    }
  }
  return { status, send };
}

/* Hidden fields: request type, subject line, spam trap */
export type RequestType = "quote" | "offer" | "repair" | "pickup" | "cable" | "order" | "contact" | "onsite" | "surplus" | "international" | "whatsapp" | "chat";

export function FormMeta({ type, subject }: { type: RequestType; subject: string }) {
  return (
    <>
      <input type="hidden" name="_type" value={type} />
      <input type="hidden" name="_subject" value={subject} />
      <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
    </>
  );
}

export function Thanks({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[24px] border border-[#EAEAEC] bg-white p-7 text-center shadow-[0_30px_70px_-45px_rgba(19, 19, 22,0.45)] sm:p-10">
      <CheckCircle2 size={48} className="mx-auto text-emerald-500" aria-hidden="true" />
      <h2 className="mt-4 text-[24px] font-extrabold text-[#131316]">{title}</h2>
      <p className="mx-auto mt-2 max-w-115 text-[14.5px] leading-[1.6] text-[#62626F]">{text}</p>
      <Link href="/" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl border border-[#F0DADD] px-5 text-[14px] font-semibold text-[#131316] hover:border-[#C8102E]">
        Back to home <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </div>
  );
}

export function SubmitBar({ status, label: text, note }: { status: SendStatus; label: string; note: string }) {
  return (
    <>
      {status === "error" && (
        <p role="alert" className="mx-5 mb-1 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700 sm:mx-7">
          Sorry, your request could not be sent. Please try again in a minute.
        </p>
      )}
      <div className="flex flex-col gap-3 border-t border-[#F3F3F4] bg-[#FAFAFB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <p className="flex items-center gap-2 text-[12.5px] text-[#646471]">
          <ShieldCheck size={15} className="shrink-0 text-[#B30E29]" aria-hidden="true" /> {note}
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-6 text-[15px] font-semibold text-white shadow-[0_14px_30px_-14px_rgba(200, 16, 46,0.9)] transition hover:-translate-y-0.5 disabled:opacity-70"
        >
          {status === "sending" ? <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Sending…</> : <>{text} <ArrowRight size={16} aria-hidden="true" /></>}
        </button>
      </div>
    </>
  );
}

/* Fill a named field from the page link, e.g. ?part=6SL3120… */
export function fill(form: HTMLFormElement | null, name: string, v: string | null) {
  const el = form?.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
  if (el && v) el.value = v;
}

/* Package + timing for a pickup: used on the pickup page and inside the repair form */
export function PackageFields({ prefix }: { prefix: string }) {
  const [boxes, setBoxes] = useState(1);
  const [slot, setSlot] = useState("Anytime");
  const f = (id: string) => `${prefix}-${id}`;
  const narrow = `${input.replace("w-full ", "")} w-19 shrink-0 px-2`;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div>
        <p className={label}>Boxes</p>
        <input type="hidden" name="Boxes" value={boxes} />
        <div className="flex h-11 items-center justify-between rounded-xl border border-[#F0DADD] bg-[#FBFBFC] px-1.5">
          <button type="button" aria-label="Fewer boxes" onClick={() => setBoxes((b) => Math.max(1, b - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#131316] ring-1 ring-[#EAEAEC]"><Minus size={14} /></button>
          <span className="text-[14px] font-bold text-[#131316]">{boxes}</span>
          <button type="button" aria-label="More boxes" onClick={() => setBoxes((b) => b + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#131316] ring-1 ring-[#EAEAEC]"><Plus size={14} /></button>
        </div>
      </div>
      <div>
        <label className={label} htmlFor={f("weight")}>Total weight <span className="font-normal text-[#62626F]">(approx.)</span></label>
        <div className="flex gap-2">
          <input id={f("weight")} name="Weight" inputMode="decimal" className={input} placeholder="e.g. 12" />
          <select name="Weight unit" aria-label="Weight unit" className={narrow}><option>kg</option><option>lb</option></select>
        </div>
      </div>
      <div>
        <label className={label} htmlFor={f("size")}>Box size <span className="font-normal text-[#62626F]">(L × W × H)</span></label>
        <div className="flex gap-2">
          <input id={f("size")} name="Box size" className={input} placeholder="e.g. 40 × 30 × 20" />
          <select name="Box size unit" aria-label="Size unit" className={narrow}><option>cm</option><option>in</option></select>
        </div>
      </div>
      <div>
        <label className={label} htmlFor={f("date")}>Ready for pickup on</label>
        <input id={f("date")} name="Ready date" type="date" className={input} />
      </div>
      <div className="sm:col-span-2">
        <p className={label}>Time slot</p>
        <input type="hidden" name="Time slot" value={slot} />
        <div className="flex flex-wrap items-center gap-2">
          {["Morning 8–12", "Afternoon 12–5", "Anytime", "Exact time"].map((t) => (
            <button key={t} type="button" aria-pressed={slot === t} onClick={() => setSlot(t)}
              className={`rounded-xl border px-3 py-2.5 text-[13px] font-semibold transition ${slot === t ? "border-[#C8102E] bg-[#C8102E]/6 text-[#A50D25] ring-4 ring-[#C8102E]/10" : "border-[#F0DADD] bg-white text-[#131316] hover:border-[#C8102E]/40"}`}>
              {t}
            </button>
          ))}
          {slot === "Exact time" && (
            <span className="flex items-center gap-2">
              <input name="From" type="time" aria-label="From" className={`${input.replace("w-full ", "")} w-32.5`} />
              <span className="text-[13px] text-[#646471]">to</span>
              <input name="To" type="time" aria-label="To" className={`${input.replace("w-full ", "")} w-32.5`} />
            </span>
          )}
        </div>
      </div>
      <div className="sm:col-span-3">
        <label className={label} htmlFor={f("dock")}>Dock / driver notes <span className="font-normal text-[#62626F]">(optional)</span></label>
        <input id={f("dock")} name="Dock notes" className={input} placeholder="e.g. Shipping door 3, call on arrival" />
      </div>
    </div>
  );
}
