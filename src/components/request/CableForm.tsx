"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { DetailsFields, FormMeta, Step, SubmitBar, Thanks, brands, fill, input, label, useSend } from "./FormParts";

const types = ["Feedback / encoder", "Motor power", "Brake", "Hybrid (power + feedback)", "Communication", "Other"];
const chip = (on: boolean) =>
  `rounded-xl border px-3 py-2.5 text-[13px] font-semibold transition ${on ? "border-[#C8102E] bg-[#C8102E]/6 text-[#A50D25] ring-4 ring-[#C8102E]/10" : "border-[#F0DADD] bg-white text-[#131316] hover:border-[#C8102E]/40"}`;

/* Custom / spare cable order. Links can pre-fill: ?drive=…  ?motor=…  ?type=… */
export default function CableForm() {
  const [type, setType] = useState("Feedback / encoder");
  const [pinout, setPinout] = useState("No, please work it out");
  const [flex, setFlex] = useState("Standard");
  const form = useRef<HTMLFormElement>(null);
  const { status, send } = useSend();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    fill(form.current, "Drive model", q.get("drive"));
    fill(form.current, "Motor model", q.get("motor"));
    const t = q.get("type");
    if (t && types.includes(t)) setType(t);
  }, []);

  if (status === "sent") {
    return <Thanks title="Cable request received" text="Thank you. We'll confirm the cable details and send your quote. If we need connector photos or a pinout, we'll ask by email." />;
  }

  return (
    <form ref={form} onSubmit={send} className="overflow-hidden rounded-[24px] border border-[#EAEAEC] bg-white shadow-[0_30px_70px_-45px_rgba(19,19,22,0.45)]">
      <FormMeta type="cable" subject="New custom cable request: IAR website" />

      <Step n={1} title="What it connects" hint="The drive and motor model numbers tell us the connectors and pinout.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="cb-drive">Drive model *</label>
            <input id="cb-drive" name="Drive model" required className={`${input} font-mono`} placeholder="e.g. 6SL3120-1TE21-0AA3" />
          </div>
          <div>
            <label className={label} htmlFor="cb-motor">Motor model *</label>
            <input id="cb-motor" name="Motor model" required className={`${input} font-mono`} placeholder="e.g. 1FK7063-5AF71-1EG0" />
          </div>
          <div>
            <label className={label} htmlFor="cb-brand">Manufacturer</label>
            <input id="cb-brand" name="Manufacturer" list="cb-brands" className={input} placeholder="e.g. Siemens" />
            <datalist id="cb-brands">{brands.map((b) => <option key={b} value={b} />)}</datalist>
          </div>
          <div>
            <label className={label} htmlFor="cb-old">Original cable part number <span className="font-normal text-[#62626F]">(if known)</span></label>
            <input id="cb-old" name="Original cable part number" className={`${input} font-mono`} placeholder="e.g. 6FX5002-2DC10" />
          </div>
        </div>
      </Step>

      <Step n={2} title="The cable">
        <p className={label}>Cable type</p>
        <input type="hidden" name="Cable type" value={type} />
        <div className="flex flex-wrap gap-2">
          {types.map((t) => <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(t)} className={chip(type === t)}>{t}</button>)}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <label className={label} htmlFor="cb-len">Length *</label>
            <div className="flex gap-2">
              <input id="cb-len" name="Length" required inputMode="decimal" className={input} placeholder="e.g. 10" />
              <select name="Length unit" aria-label="Length unit" className={`${input.replace("w-full ", "")} w-19 shrink-0 px-2`}><option>m</option><option>ft</option></select>
            </div>
          </div>
          <div>
            <label className={label} htmlFor="cb-qty">Quantity</label>
            <input id="cb-qty" name="Quantity" type="number" min={1} defaultValue={1} className={input} />
          </div>
          <div>
            <p className={label}>Use</p>
            <input type="hidden" name="Flex" value={flex} />
            <div className="flex gap-2">
              {["Standard", "Drag chain"].map((t) => <button key={t} type="button" aria-pressed={flex === t} onClick={() => setFlex(t)} className={`${chip(flex === t)} flex-1`}>{t}</button>)}
            </div>
          </div>
          <div>
            <label className={label} htmlFor="cb-c1">Drive-end connector</label>
            <input id="cb-c1" name="Drive-end connector" className={input} placeholder="e.g. 15-pin D-sub" />
          </div>
          <div>
            <label className={label} htmlFor="cb-c2">Motor-end connector</label>
            <input id="cb-c2" name="Motor-end connector" className={input} placeholder="e.g. 17-pin round, angled" />
          </div>
          <div>
            <p className={label}>Do you have a pinout?</p>
            <select name="Pinout" aria-label="Pinout" value={pinout} onChange={(e) => setPinout(e.target.value)} className={input}>
              <option>No, please work it out</option><option>Yes, I&apos;ll email it</option><option>Yes, I have the old cable</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className={label} htmlFor="cb-notes">Notes <span className="font-normal text-[#62626F]">(optional)</span></label>
          <textarea id="cb-notes" name="Notes" rows={2} className={`${input} h-auto py-2.5`} placeholder="Spare for a critical axis, connector angle, cable entry direction…" />
        </div>
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-dashed border-[#E6CBCF] bg-[#FBFBFC] p-3.5 text-[13px]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C8102E]/8 text-[#B30E29]"><Camera size={17} aria-hidden="true" /></span>
          <span className="text-[#62626F]">
            <b className="block text-[#131316]">Connector photos and pinout</b>
            After you send this, reply to our email with photos of both connectors (straight on, showing the pins) and the pinout if you have one.
          </span>
        </div>
      </Step>

      <Step n={3} title="Your details"><DetailsFields prefix="cb" /></Step>

      <SubmitBar status={status} label="Request Cable Quote" note="No obligation. We confirm the details with you before building." />
    </form>
  );
}
