"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarClock, Clock, Search, Zap } from "lucide-react";
import { Choice, DetailsFields, FormMeta, Step, SubmitBar, Thanks, brands, fill, input, label, useSend } from "./FormParts";

const conditions = ["Any", "New", "Surplus", "Refurbished", "Used", "Exchange"];

/* Links from other pages pre-fill this form: ?part=…  ?brand=…  ?condition=…  ?item=<catalog slug> */
export default function QuoteForm() {
  const [condition, setCondition] = useState("Any");
  const [when, setWhen] = useState("week");
  const [offer, setOffer] = useState(false);
  const [amount, setAmount] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const { status, send } = useSend();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    fill(form.current, "Part number", q.get("part"));
    fill(form.current, "Manufacturer", q.get("brand"));
    fill(form.current, "_item", q.get("item"));
    if (q.get("offer")) setOffer(true);
    setAmount(q.get("amount") ?? "");
    fill(form.current, "Quantity", q.get("qty"));
    fill(form.current, "Notes", q.get("note"));
    const c = q.get("condition");
    const match = conditions.find((x) => x.toLowerCase() === c?.toLowerCase());
    if (match) setCondition(match);
  }, []);

  if (status === "sent") {
    return <Thanks title="Quote request received" text="Thank you. We will reply with price, condition and lead time for your part." />;
  }

  return (
    <form ref={form} onSubmit={send} className="overflow-hidden rounded-[24px] border border-[#EAEAEC] bg-white shadow-[0_30px_70px_-45px_rgba(19,19,22,0.45)]">
      <FormMeta type={offer ? "offer" : "quote"} subject={offer ? "New offer on parts: IAR website" : "New parts quote request: IAR website"} />
      <input type="hidden" name="_item" />

      <Step n={1} title={offer ? "Make an offer" : "The part you need"} hint={offer ? "Surplus and bulk orders: tell us the part and the price you want to pay." : "Copy the full part number from the nameplate or your BOM."}>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_140px]">
          <div>
            <label className={label} htmlFor="rq-part">Part / model number *</label>
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B30E29]" aria-hidden="true" />
              <input id="rq-part" name="Part number" required className={`${input} pl-9 font-mono`} placeholder="6SL3120-1TE21-0AA3" />
            </div>
          </div>
          <div>
            <label className={label} htmlFor="rq-brand">Manufacturer</label>
            <input id="rq-brand" name="Manufacturer" list="rq-brands" className={input} placeholder="e.g. Siemens" />
            <datalist id="rq-brands">{brands.map((b) => <option key={b} value={b} />)}</datalist>
          </div>
          <div>
            <label className={label} htmlFor="rq-qty">Quantity</label>
            <input id="rq-qty" name="Quantity" type="number" min={1} defaultValue={1} className={input} />
          </div>
        </div>
        <p className={`${label} mt-4`}>Condition</p>
        <input type="hidden" name="Condition" value={condition} />
        <div className="flex flex-wrap gap-2">
          {conditions.map((c) => (
            <button key={c} type="button" aria-pressed={condition === c} onClick={() => setCondition(c)}
              className={`rounded-xl border px-3.5 py-2 text-[13px] font-semibold transition ${condition === c ? "border-[#C8102E] bg-[#C8102E]/6 text-[#A50D25] ring-4 ring-[#C8102E]/10" : "border-[#E3E3E7] text-[#131316] hover:border-[#C8102E]/40"}`}>
              {c === "Any" ? "Any condition" : c}
            </button>
          ))}
        </div>
        {offer && (
          <div className="mt-4 max-w-[320px]">
            <label className={label} htmlFor="rq-offer">Your offer (price per unit) *</label>
            <input id="rq-offer" key={amount} defaultValue={amount} name="Offer per unit" required className={input} placeholder="e.g. $450 CAD" />
          </div>
        )}
        <div className="mt-4">
          <label className={label} htmlFor="rq-notes">Notes <span className="font-normal text-[#62626F]">(optional)</span></label>
          <textarea id="rq-notes" name="Notes" rows={2} className={`${input} h-auto py-2.5`} placeholder="Firmware version, alternates you accept, more part numbers…" />
        </div>
      </Step>

      <Step n={2} title="When do you need it?">
        <Choice name="Needed" value={when} onChange={setWhen} options={[
          { v: "urgent", t: "Urgent", d: "Machine is down", icon: Zap },
          { v: "week", t: "This week", d: "Planned repair or spare", icon: CalendarClock },
          { v: "flex", t: "Flexible", d: "Stocking spares, best price", icon: Clock },
        ]} />
      </Step>

      <Step n={3} title="Your details"><DetailsFields prefix="rq" /></Step>

      <SubmitBar status={status} label={offer ? "Send My Offer" : "Request a Quote"} note="No obligation. Your details are used only for this request." />
    </form>
  );
}
