"use client";

import { useState } from "react";
import { CalendarClock, Siren, Wrench } from "lucide-react";
import { Choice, DetailsFields, FormMeta, Step, SubmitBar, Thanks, input, label, useSend } from "./FormParts";

export default function OnSiteForm() {
  const [when, setWhen] = useState("down");
  const { status, send } = useSend();

  if (status === "sent") {
    return <Thanks title="On-site request received" text="Thank you. We contact you to go over the machine, confirm the visit and send a quote for the service call before anyone travels." />;
  }

  return (
    <form onSubmit={send} className="overflow-hidden rounded-[24px] border border-[#EAEAEC] bg-white shadow-[0_30px_70px_-45px_rgba(19,19,22,0.45)]">
      <FormMeta type="onsite" subject="On-site service request: IAR website" />

      <Step n={1} title="How urgent is it?">
        <Choice name="Urgency" value={when} onChange={setWhen} options={[
          { v: "down", t: "Machine is down", d: "Production stopped, we need help now", icon: Siren },
          { v: "soon", t: "This week", d: "Running, but something is failing", icon: Wrench },
          { v: "planned", t: "Planned visit", d: "Shutdown, commissioning or checkup", icon: CalendarClock },
        ]} />
        {when === "planned" && (
          <div className="mt-3 max-w-65">
            <label className={label} htmlFor="os-date">Preferred date</label>
            <input id="os-date" name="Preferred date" type="date" className={input} />
          </div>
        )}
      </Step>

      <Step n={2} title="The machine" hint="The more we know before we travel, the faster we fix it on site.">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className={label} htmlFor="os-machine">Machine or line *</label><input id="os-machine" name="Machine" required className={input} placeholder="e.g. CNC lathe, packaging line 2" /></div>
            <div><label className={label} htmlFor="os-control">Control / drive brands</label><input id="os-control" name="Control brands" className={input} placeholder="e.g. Fanuc 0i, Siemens S120" /></div>
          </div>
          <div>
            <label className={label} htmlFor="os-fault">What is happening? *</label>
            <textarea id="os-fault" name="Problem" required rows={3} className={`${input} h-auto py-2.5`} placeholder="Fault codes on the screen, when it started, what you have tried…" />
          </div>
        </div>
      </Step>

      <Step n={3} title="Site location">
        <div className="grid gap-3 sm:grid-cols-3">
          <div><label className={label} htmlFor="os-city">City *</label><input id="os-city" name="Site city" required className={input} autoComplete="address-level2" /></div>
          <div><label className={label} htmlFor="os-region">State *</label><input id="os-region" name="Site province or state" required className={input} autoComplete="address-level1" /></div>
          <div>
            <label className={label} htmlFor="os-country">Country</label>
            <select id="os-country" name="Site country" className={input}><option>United States</option></select>
          </div>
        </div>
      </Step>

      <Step n={4} title="Your company"><DetailsFields prefix="os" location={false} /></Step>

      <SubmitBar status={status} label="Request On-site Service" note="We confirm the visit and the cost with you before anyone travels." />
    </form>
  );
}
