"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ClipboardCheck, MapPin, PackageCheck, Search, Truck, Wrench, Zap } from "lucide-react";
import { uploadsOn } from "@/lib/forms";
import { AddressFields, CarrierPicker, Choice, PackageFields, DetailsFields, FormMeta, Step, SubmitBar, Thanks, brands, fill, input, label, useSend } from "./FormParts";

/* Links from other pages pre-fill this form:
   ?part=…  ?brand=…  ?fault=…  ?pickup=1  ?item=<catalog slug>
   ?service=exchange | on-site | question */
export default function RepairForm() {
  const [need, setNeed] = useState("repair");
  const [ship, setShip] = useState("self");
  const [carrier, setCarrier] = useState("No preference");
  const [files, setFiles] = useState(0);
  const form = useRef<HTMLFormElement>(null);
  const { status, send } = useSend();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const f = form.current;
    fill(f, "Part number", q.get("part"));
    fill(f, "Manufacturer", q.get("brand"));
    fill(f, "_item", q.get("item"));
    const fault = q.get("fault");
    const service = q.get("service");
    if (q.get("pickup")) setShip("pickup");
    if (service === "exchange") setNeed("exchange");
    if (service === "on-site") setNeed("on-site");
    if (service === "question") setNeed("unsure");
    const note = [fault && `Fault code ${fault}`, service === "question" && "Question for a technician", q.get("note")].filter(Boolean).join(" · ");
    if (note) fill(f, "Fault", `${note}: `);
  }, []);

  if (status === "sent") {
    return <Thanks title="Repair request received" text="Thank you. Our team will contact you to confirm the details and your shipping option. No work starts without your approval." next="/request-repair/thank-you" />;
  }

  return (
    <form ref={form} onSubmit={send} className="overflow-hidden rounded-[24px] border border-[#EAEAEC] bg-white shadow-[0_30px_70px_-45px_rgba(19,19,22,0.45)]">
      <FormMeta type="repair" subject="New repair request: IAR website" />
      <input type="hidden" name="_item" />

      <Step n={1} title="Your unit" hint="The full part number from the nameplate helps us quote faster.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="rr-brand">Manufacturer</label>
            <input id="rr-brand" name="Manufacturer" list="rr-brands" className={input} placeholder="e.g. Siemens" />
            <datalist id="rr-brands">{brands.map((b) => <option key={b} value={b} />)}</datalist>
          </div>
          <div>
            <label className={label} htmlFor="rr-part">Part / model number {need === "unsure" ? <span className="font-normal text-[#62626F]">(if you have it)</span> : "*"}</label>
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B30E29]" aria-hidden="true" />
              <input id="rr-part" name="Part number" required={need !== "unsure"} className={`${input} pl-9 font-mono`} placeholder="6SL3120-1TE21-0AA3" />
            </div>
          </div>
          <div>
            <label className={label} htmlFor="rr-serial">Serial number <span className="font-normal text-[#62626F]">(optional)</span></label>
            <input id="rr-serial" name="Serial number" className={input} placeholder="From the nameplate" />
          </div>
          <div>
            <label className={label} htmlFor="rr-qty">Quantity</label>
            <input id="rr-qty" name="Quantity" type="number" min={1} defaultValue={1} className={input} />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="rr-fault">What&apos;s wrong with it?</label>
            <textarea id="rr-fault" name="Fault" rows={3} className={`${input} h-auto py-2.5`} placeholder="Fault code on the display, symptoms, when it fails…" />
          </div>
          {uploadsOn && (
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[#D6D6DB] bg-[#FBFBFC] p-3.5 transition hover:border-[#C8102E] sm:col-span-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C8102E]/8 text-[#B30E29]"><Camera size={17} aria-hidden="true" /></span>
              <span className="text-[13px]">
                <span className="block font-semibold text-[#131316]">{files ? `${files} photo${files > 1 ? "s" : ""} added` : "Add photos"} <span className="font-normal text-[#62626F]">(optional)</span></span>
                <span className="text-[#646471]">Nameplate and fault display · JPG, PNG or PDF</span>
              </span>
              <input type="file" name="Photos" multiple accept="image/*,.pdf" className="sr-only" onChange={(e) => setFiles(e.target.files?.length ?? 0)} />
            </label>
          )}
        </div>
      </Step>

      <Step n={2} title="What do you need?">
        <Choice name="Service" value={need} onChange={setNeed} options={[
          { v: "repair", t: "Repair my unit", d: "Free evaluation and quote first", icon: Wrench },
          { v: "exchange", t: "Exchange unit now", d: "Ship us your unit, we ship a tested replacement", icon: Zap },
          need === "on-site"
            ? { v: "on-site", t: "On-site service", d: "Technician at your facility, the USA", icon: MapPin }
            : { v: "unsure", t: "Not sure yet", d: "A technician will advise you", icon: ClipboardCheck },
        ]} />
      </Step>

      <Step n={3} title="Getting it to us">
        <Choice name="Shipping" cols={2} value={ship} onChange={setShip} options={[
            { v: "self", t: "I'll ship it myself", d: "Any carrier. We send you our address", icon: PackageCheck },
            { v: "pickup", t: "Request a pickup", d: "From your facility with FedEx, UPS or DHL", icon: Truck },
          ]} />
        {ship === "pickup" && (
          <div className="mt-4 space-y-4 rounded-2xl border border-[#EAEAEC] bg-[#FBFBFC] p-4">
            <p className="text-[13px] font-extrabold text-[#131316]">Pickup address</p>
            <AddressFields prefix="rr-pu" />
            <div className="border-t border-[#EAEAEC] pt-4"><CarrierPicker prefix="rr-pu" value={carrier} onChange={setCarrier} /></div>
            <div className="border-t border-[#EAEAEC] pt-4">
              <p className="mb-3 text-[13px] font-extrabold text-[#131316]">Package &amp; pickup time</p>
              <PackageFields prefix="rr-pu" />
            </div>
          </div>
        )}
      </Step>

      <Step n={4} title="Your details"><DetailsFields prefix="rr" location={ship !== "pickup"} /></Step>

      <SubmitBar status={status} label="Submit Repair Request" note="No work starts without your approval. Your details are used only for this request." />
    </form>
  );
}
