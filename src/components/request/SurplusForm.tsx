"use client";

import { useState } from "react";
import { Boxes, Factory, Package } from "lucide-react";
import { Choice, DetailsFields, FormMeta, Step, SubmitBar, Thanks, input, label, useSend } from "./FormParts";

const conditions = ["New, sealed", "New, open box", "Used, was working", "Not sure"];

export default function SurplusForm() {
  const [kind, setKind] = useState("parts");
  const [cond, setCond] = useState<string[]>([]);
  const { status, send } = useSend();

  if (status === "sent") {
    return <Thanks title="Surplus list received" text="Thank you. We review your list and reply with an offer or questions. Nothing is shipped or sold until you agree." />;
  }

  const toggle = (c: string) => setCond((x) => (x.includes(c) ? x.filter((y) => y !== c) : [...x, c]));

  return (
    <form onSubmit={send} className="overflow-hidden rounded-[24px] border border-[#EAEAEC] bg-white shadow-[0_30px_70px_-45px_rgba(19, 19, 22,0.45)]">
      <FormMeta type="surplus" subject="Surplus offer: AutomIQ website" />

      <Step n={1} title="What are you selling?">
        <Choice name="Surplus type" value={kind} onChange={setKind} options={[
          { v: "parts", t: "A few parts", d: "Spares, extras or units you no longer use", icon: Package },
          { v: "lot", t: "A full lot", d: "Shelves, a storeroom or a whole inventory", icon: Boxes },
          { v: "line", t: "A machine or line", d: "Equipment that is being removed or closed", icon: Factory },
        ]} />
      </Step>

      <Step n={2} title="Your list" hint="Part number and quantity on each line. Paste straight from your inventory sheet.">
        <div className="space-y-3">
          <div>
            <label className={label} htmlFor="sp-list">Part numbers and quantities *</label>
            <textarea id="sp-list" name="Parts list" required rows={5} className={`${input} h-auto py-2.5 font-mono`} placeholder={"6SL3120-1TE21-0AA3 × 2\n1FK7063-5AF71-1AG0 × 1\nKollmorgen AKD-P00606 × 4"} />
          </div>
          <div>
            <p className={label}>Condition <span className="font-normal text-[#62626F]">(choose all that apply)</span></p>
            <input type="hidden" name="Condition" value={cond.join(", ")} />
            <div className="flex flex-wrap gap-2">
              {conditions.map((c) => (
                <button key={c} type="button" aria-pressed={cond.includes(c)} onClick={() => toggle(c)}
                  className={`rounded-xl border px-3.5 py-2.5 text-[13px] font-semibold transition ${cond.includes(c) ? "border-[#C8102E] bg-[#C8102E]/6 text-[#A50D25] ring-4 ring-[#C8102E]/10" : "border-[#F0DADD] bg-white text-[#131316] hover:border-[#C8102E]/40"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className={label} htmlFor="sp-where">Where is it? <span className="font-normal text-[#62626F]">(city, province or state)</span></label><input id="sp-where" name="Location" className={input} placeholder="e.g. Brampton, ON" /></div>
            <div><label className={label} htmlFor="sp-price">Asking price <span className="font-normal text-[#62626F]">(optional)</span></label><input id="sp-price" name="Asking price" className={input} placeholder="Leave blank and we make an offer" /></div>
          </div>
          <div>
            <label className={label} htmlFor="sp-notes">Notes <span className="font-normal text-[#62626F]">(optional)</span></label>
            <textarea id="sp-notes" name="Notes" rows={2} className={`${input} h-auto py-2.5`} placeholder="Original boxes, date codes, deadline to clear the space…" />
          </div>
        </div>
      </Step>

      <Step n={3} title="Your company"><DetailsFields prefix="sp" /></Step>

      <SubmitBar status={status} label="Send My List" note="We reply with an offer or questions. You decide; nothing is final until you agree." />
    </form>
  );
}
