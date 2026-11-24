"use client";

import { useEffect, useState } from "react";
import { Boxes, PackageCheck, Wrench } from "lucide-react";
import { Choice, FormMeta, Step, SubmitBar, Thanks, input, label, useSend } from "./FormParts";

/* Quote request for buyers outside the USA. They cannot check out online. */
const countries: [string, string[]][] = [
  ["North & Latin America", ["Mexico"]],
  ["Europe", ["United Kingdom", "Ireland", "France", "Germany", "Spain", "Portugal", "Italy", "Netherlands", "Belgium", "Switzerland", "Austria", "Poland", "Czech Republic", "Sweden", "Denmark", "Norway", "Finland"]],
  ["Asia", ["Japan", "South Korea", "India", "Singapore", "Malaysia", "Thailand", "Vietnam", "Indonesia", "Philippines", "Taiwan"]],
];
const couriers = ["No preference", "DHL", "FedEx", "UPS", "My own courier account"];

export default function InternationalQuoteForm() {
  const [cond, setCond] = useState("any");
  const [courier, setCourier] = useState("No preference");
  const { status, send } = useSend();

  /* Coming from checkout: the cart items arrive as ?parts= */
  useEffect(() => {
    const parts = new URLSearchParams(window.location.search).get("parts");
    const el = document.getElementById("iq-parts") as HTMLTextAreaElement | null;
    if (parts && el && !el.value) el.value = parts;
  }, []);

  if (status === "sent") {
    return <Thanks title="International quote request received" text="Thank you. We check availability and reply by email with the price, shipping charges and lead time for your country." />;
  }

  return (
    <form onSubmit={send} className="overflow-hidden rounded-[24px] border border-[#EAEAEC] bg-white shadow-[0_30px_70px_-45px_rgba(19,19,22,0.45)]">
      <FormMeta type="international" subject="International quote request: IAR website" />

      <Step n={1} title="The parts you need" hint="Part number and quantity on each line. Copy the full number from the nameplate.">
        <div className="space-y-4">
          <div>
            <label className={label} htmlFor="iq-parts">Part numbers and quantities *</label>
            <textarea id="iq-parts" name="Parts" required rows={4} className={`${input} h-auto py-2.5 font-mono`} placeholder={"6SL3120-1TE21-0AA3 × 2\n1FK7063-5AF71-1AG0 × 1"} />
          </div>
          <Choice name="Condition wanted" value={cond} onChange={setCond} options={[
            { v: "any", t: "Best option", d: "New, refurbished or surplus", icon: Boxes },
            { v: "refurb", t: "Refurbished", d: "Load tested on our benches", icon: Wrench },
            { v: "new", t: "New", d: "Factory new where available", icon: PackageCheck },
          ]} />
        </div>
      </Step>

      <Step n={2} title="Delivery" hint="Shipping charges are quoted for your country.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="iq-country">Country *</label>
            <select id="iq-country" name="Country" required defaultValue="" className={input} autoComplete="country-name">
              <option value="" disabled>Choose your country</option>
              {countries.map(([g, list]) => (
                <optgroup key={g} label={g}>
                  {list.map((c) => <option key={c}>{c}</option>)}
                </optgroup>
              ))}
              <option>Other country (tell us in the notes)</option>
            </select>
          </div>
          <div><label className={label} htmlFor="iq-city">City *</label><input id="iq-city" name="City" required className={input} autoComplete="address-level2" /></div>
          <div className="sm:col-span-2">
            <p className={label}>Preferred courier</p>
            <input type="hidden" name="Preferred courier" value={courier} />
            <div className="flex flex-wrap gap-2">
              {couriers.map((c) => (
                <button key={c} type="button" aria-pressed={courier === c} onClick={() => setCourier(c)}
                  className={`rounded-xl border px-3.5 py-2.5 text-[13px] font-semibold transition ${courier === c ? "border-[#C8102E] bg-[#C8102E]/6 text-[#A50D25] ring-4 ring-[#C8102E]/10" : "border-[#E3E3E7] bg-white text-[#131316] hover:border-[#C8102E]/40"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          {courier === "My own courier account" && (
            <div className="sm:col-span-2 sm:max-w-90"><label className={label} htmlFor="iq-acct">Courier and account number</label><input id="iq-acct" name="Courier account" className={input} placeholder="e.g. DHL 123456789" /></div>
          )}
        </div>
      </Step>

      <Step n={3} title="Your company">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className={label} htmlFor="iq-company">Company *</label><input id="iq-company" name="Company" required className={input} autoComplete="organization" /></div>
          <div><label className={label} htmlFor="iq-name">Contact name *</label><input id="iq-name" name="Name" required className={input} autoComplete="name" /></div>
          <div><label className={label} htmlFor="iq-email">Work email *</label><input id="iq-email" name="Email" type="email" required className={input} autoComplete="email" /></div>
          <div><label className={label} htmlFor="iq-phone">Phone, with country code *</label><input id="iq-phone" name="Phone" type="tel" required className={input} autoComplete="tel" placeholder="+49 …" /></div>
          <div className="sm:col-span-2"><label className={label} htmlFor="iq-tax">VAT / tax or importer number <span className="font-normal text-[#62626F]">(optional)</span></label><input id="iq-tax" name="Tax or importer number" className={input} placeholder="Helps your customs clearance" /></div>
          <div className="sm:col-span-2"><label className={label} htmlFor="iq-notes">Notes <span className="font-normal text-[#62626F]">(optional)</span></label><textarea id="iq-notes" name="Notes" rows={2} className={`${input} h-auto py-2.5`} placeholder="Deadline, machine model, anything else" /></div>
        </div>
      </Step>

      <SubmitBar status={status} label="Request My Quote" note="No payment now. We reply with price, shipping and lead time." />
    </form>
  );
}
