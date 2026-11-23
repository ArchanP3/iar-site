"use client";

import { useState } from "react";
import { HelpCircle, Package, RefreshCw, Wrench } from "lucide-react";
import { Choice, DetailsFields, FormMeta, Step, SubmitBar, Thanks, input, label, useSend } from "./FormParts";

export default function ContactForm() {
  const [topic, setTopic] = useState("repair");
  const { status, send } = useSend();

  if (status === "sent") {
    return <Thanks title="Message received" text="Thank you. A member of our team will reply by email." />;
  }

  return (
    <form onSubmit={send} className="overflow-hidden rounded-[24px] border border-[#E3EAF3] bg-white shadow-[0_30px_70px_-45px_rgba(11,26,60,0.45)]">
      <FormMeta type="contact" subject="New message: AutomIQ website contact page" />

      <Step n={1} title="What is it about?">
        <Choice name="Topic" value={topic} onChange={setTopic} cols={2} options={[
          { v: "repair", t: "A repair", d: "Drive, motor, HMI, PLC or board", icon: Wrench },
          { v: "parts", t: "Buying a part", d: "Price, stock or an order", icon: Package },
          { v: "exchange", t: "An exchange unit", d: "Swap your failed unit", icon: RefreshCw },
          { v: "other", t: "Something else", d: "Any other question", icon: HelpCircle },
        ]} />
      </Step>

      <Step n={2} title="Your message">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
          <div>
            <label className={label} htmlFor="ct-part">Part / model number <span className="font-normal text-[#52647F]">(optional)</span></label>
            <input id="ct-part" name="Part number" className={`${input} font-mono`} placeholder="6SL3120-1TE21-0AA3" />
          </div>
          <div>
            <label className={label} htmlFor="ct-order">Order or quote number <span className="font-normal text-[#52647F]">(optional)</span></label>
            <input id="ct-order" name="Order or quote number" className={input} />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="ct-msg">Message *</label>
            <textarea id="ct-msg" name="Message" required rows={5} className={`${input} h-auto py-2.5`} placeholder="How can we help?" />
          </div>
        </div>
      </Step>

      <Step n={3} title="Your details"><DetailsFields prefix="ct" /></Step>

      <SubmitBar status={status} label="Send Message" note="Your details are used only to reply to you." />
    </form>
  );
}
