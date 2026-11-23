"use client";

import { useEffect, useRef, useState } from "react";
import { AddressFields, CarrierPicker, DetailsFields, FormMeta, PackageFields, Step, SubmitBar, Thanks, fill, input, label, useSend } from "./FormParts";

/* Links can pre-fill: ?part=…  ?carrier=FedEx */
export default function PickupForm() {
  const [carrier, setCarrier] = useState("No preference");
  const form = useRef<HTMLFormElement>(null);
  const { status, send } = useSend();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    fill(form.current, "Part numbers", q.get("part"));
    const c = q.get("carrier");
    if (c) setCarrier(c);
  }, []);

  if (status === "sent") {
    return <Thanks title="Pickup request received" text="Thank you. We will book the pickup with your preferred carrier and send you the details. Your unit gets a free evaluation when it arrives." />;
  }

  return (
    <form ref={form} onSubmit={send} className="overflow-hidden rounded-[24px] border border-[#EAEAEC] bg-white shadow-[0_30px_70px_-45px_rgba(19, 19, 22,0.45)]">
      <FormMeta type="pickup" subject="New pickup request: AutomIQ website" />

      <Step n={1} title="Your company"><DetailsFields prefix="pu" location={false} /></Step>

      <Step n={2} title="Pickup address" hint="Where the carrier should collect the unit."><AddressFields prefix="pu" /></Step>

      <Step n={3} title="Carrier"><CarrierPicker prefix="pu" value={carrier} onChange={setCarrier} /></Step>

      <Step n={4} title="What we're picking up">
        <div className="space-y-3">
          <div>
            <label className={label} htmlFor="pu-parts">Part number(s) *</label>
            <input id="pu-parts" name="Part numbers" required className={`${input} font-mono`} placeholder="6SL3120-1TE21-0AA3" />
          </div>
          <PackageFields prefix="pu" />
          <div>
            <label className={label} htmlFor="pu-notes">Fault or notes <span className="font-normal text-[#62626F]">(optional)</span></label>
            <textarea id="pu-notes" name="Notes" rows={2} className={`${input} h-auto py-2.5`} placeholder="Fault code, symptoms, anything the driver should know…" />
          </div>
        </div>
      </Step>

      <SubmitBar status={status} label="Request a Pickup" note="We confirm the booking with you. No repair work starts without your approval." />
    </form>
  );
}
