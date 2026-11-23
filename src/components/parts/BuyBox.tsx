"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/cart";
import { ArrowLeft, BadgeCheck, Info, Mail, Phone, X, BadgeDollarSign, Layers, Zap, Clock, FileText, Minus, Plus, Send, ShoppingCart, Truck, Wrench } from "lucide-react";
import { canBuyOnline, usd, WARRANTY } from "@/lib/parts/rules";
import { phoneHref } from "@/lib/contact";
import { useContact } from "@/components/cms/ContactProvider";
import WhatsAppButton from "@/components/WhatsAppButton";
import { conditionLabel, type Condition, type Offer } from "@/lib/parts/types";

type Props = { slug: string; name: string; image?: string; manufacturer: string; partNumber: string; offers: Offer[] };


/* Only claims the business has confirmed (README, "Marketing claims"). */
/* Longer text shown in the Details overlay */
const details_note: Record<Condition, string> = {
  new: "Factory-new parts are quoted with current price and lead time. Ask for volume pricing on 5 or more units. No payment until you confirm the quote.",
  refurbished: `Usually ships in 1–2 business days. We confirm stock, shipping and your invoice before you pay. Every unit carries a ${WARRANTY}.`,
  exchange: "Request an exchange quote. Need the replacement before you send yours? Contact us and we explain the options and pricing. The final price is confirmed when we check your unit and may be higher depending on its condition.",
  repair: `Free evaluation and a written quote before any work. Typical turnaround is 24–72 hours once you approve. Every repair is load tested on our benches and returned with a test report and ${WARRANTY}.`,
};

const info: Record<Condition, { title: string; lines: [string, string, string]; steps?: boolean; note: string }> = {
  new: { title: "Factory new", lines: ["Original packaging where available", "Price and lead time confirmed by email", "Volume pricing for 5 or more units"], note: "No payment now. We reply with price and lead time." },
  refurbished: { title: "Refurbished by IAR", lines: ["Tested under power on our test benches", WARRANTY, "Usually ships in 1–2 business days"], note: "We confirm stock and your invoice before you pay." },
  exchange: { title: "How exchange works", steps: true, lines: ["Request an exchange quote", "Send us your unit, or book a pickup", "We ship yours, usually in 1–2 business days"], note: "Final price confirmed when we check your unit." },
  repair: { title: "Repair by IAR", lines: ["Free evaluation and written quote", "Load tested on our benches, test report included", WARRANTY], note: "No work starts until you approve the quote." },
};



const round2 = (n: number) => Math.round(n * 100) / 100;

const link = (path: string, params: Record<string, string | number | undefined>) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") q.set(k, String(v));
  return `${path}?${q.toString()}`;
};

const primary =
  "inline-flex h-11 w-full min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-2 text-[13px] min-[400px]:text-[14px] sm:gap-2 sm:px-3 sm:text-[14.5px] [&>svg]:max-[439px]:hidden font-semibold text-white shadow-[0_14px_30px_-14px_rgba(218,11,42,0.9)] transition hover:-translate-y-0.5";
const secondary =
  "inline-flex h-11 w-full min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[#E3E3E7] bg-white px-2 text-[13px] min-[400px]:text-[14px] sm:gap-2 sm:px-3 sm:text-[14.5px] [&>svg]:max-[439px]:hidden font-semibold text-[#131316] transition hover:border-[#C8102E]/50 hover:text-[#A50D25]";


/* Selling rules live in src/lib/parts/rules.ts:
   inventory item with a price (New or Refurbished) -> price + Buy Now + Make an Offer (customer types their offer)
   anything else                                    -> Request a Quote (exchange is always quoted)
   Quotes carry ?item=<slug> so the request is linked to this catalog part. */
export default function BuyBox({ slug, name, image, manufacturer, partNumber, offers }: Props) {
  const contact = useContact();
  const router = useRouter();
  const first = offers.find(canBuyOnline) ?? offers[0];
  const [sel, setSel] = useState<Condition>(first?.condition ?? "new");
  const [qty, setQty] = useState(1);

  const [offering, setOffering] = useState(false);
  const [details, setDetails] = useState(false);
  const [offerText, setOfferText] = useState("");

  // "Choose" buttons in the comparison table switch the option here
  useEffect(() => {
    const pick = (e: Event) => {
      const c = (e as CustomEvent<Condition>).detail;
      if (offers.some((x) => x.condition === c)) { setSel(c); setOffering(false); setDetails(false); }
    };
    window.addEventListener("aq:choose-condition", pick);
    return () => window.removeEventListener("aq:choose-condition", pick);
  }, [offers]);


  const o = offers.find((x) => x.condition === sel) ?? offers[0];
  if (!o) return null;

  const label = conditionLabel[o.condition];
  const base = { part: partNumber, brand: manufacturer, item: slug };
  const price = o.price ?? 0;
  const priced = canBuyOnline(o) && (o.condition === "new" || o.condition === "refurbished");

  // Make an Offer (like eBay): the customer types the price they want to pay per unit.
  const offerEach = round2(parseFloat(offerText) || 0);
  const offerOk = priced && offerEach > 0 && offerEach <= price;
  const offerTotal = round2(offerEach * qty);


  const status =
    o.condition === "repair"
      ? { dot: "bg-[#22C55E]", text: "24–72 hr typical turnaround once your quote is approved" }
      : priced
        ? { dot: "bg-[#22C55E]", text: o.stock ? `In stock · ${o.stock} available` : "In stock" }
        : { dot: "bg-[#A1A1AB]", text: "Ask for current availability" };

  // Buy Now: put the unit in the cart and open the cart
  const buyNow = () => {
    if (!priced || (o.condition !== "new" && o.condition !== "refurbished")) return;
    addToCart({ slug, manufacturer, partNumber, name, condition: o.condition, price, qty, image });
    router.push("/cart");
  };

  const quoteHref =
    o.condition === "repair"
      ? link("/request-repair", base)
      : o.condition === "exchange"
        ? link("/request-repair", { ...base, service: "exchange" })
        : link("/request-quote", { ...base, condition: label, qty });

  return (
    <div id="buy" className="relative scroll-mt-28 rounded-[22px] border border-[#EAEAEC] bg-white p-4 shadow-[0_30px_70px_-45px_rgba(19,19,22,0.45)] sm:p-4.5">
      <div role="tablist" aria-label="Choose how you want it" className="grid grid-cols-4 gap-1 rounded-xl bg-[#F5F5F6] p-1">
        {offers.map((x) => {
          const on = x.condition === sel;
          return (
            <button
              key={x.condition}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => {
                setSel(x.condition);
                setOffering(false);
                setDetails(false);
              }}
              className={`h-9 rounded-lg text-[12.5px] font-semibold transition sm:text-[13px] ${on ? "bg-white text-[#A50D25] shadow-[0_6px_16px_-8px_rgba(19,19,22,0.45)] ring-1 ring-[#C8102E]/25" : "text-[#5A5A66] hover:text-[#131316]"}`}
            >
              {conditionLabel[x.condition]}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="mt-3 flex flex-col">
        {/* Price row: same height for every option */}
        <div className="flex min-h-14.5 items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11.5px] font-semibold text-[#696976]">{priced ? `${label} price` : `${label} · price on request`}</p>
            {priced ? (
              <p className="text-[27px] font-extrabold leading-tight tracking-[-0.02em] text-[#131316]">
                {usd(price)} <span className="text-[13px] font-bold text-[#696976]">USD</span>
              </p>
            ) : (
              <p className="text-[24px] font-extrabold leading-tight text-[#131316]">Request a Quote</p>
            )}
          </div>
          {o.condition !== "repair" && (
            <div className="flex h-10 flex-none items-center rounded-xl border border-[#E3E3E7]" aria-label="Quantity">
              <button type="button" aria-label="Less" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-full w-9 items-center justify-center text-[#5A5A66] hover:text-[#B30E29]"><Minus size={14} /></button>
              <span className="w-7 text-center text-[14.5px] font-semibold tabular-nums" aria-live="polite">{qty}</span>
              <button type="button" aria-label="More" onClick={() => setQty((q) => Math.min(999, q + 1))} className="flex h-full w-9 items-center justify-center text-[#5A5A66] hover:text-[#B30E29]"><Plus size={14} /></button>
            </div>
          )}
        </div>

        <p className="mt-1 flex items-center gap-2 text-[12.5px] font-medium text-[#131316]">
          <span className={`h-2 w-2 flex-none rounded-full ${status.dot}`} aria-hidden="true" />
          {status.text}
        </p>

        {offering && priced ? (
          <div className="mt-4"><div className="rounded-2xl border border-[#C8102E]/20 bg-[#FFF6F7] p-4">
            <div className="flex items-center justify-between">
              <label htmlFor="offer-amount" className="text-[14px] font-bold text-[#131316]">Your offer per unit</label>
              <button type="button" onClick={() => setOffering(false)} className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#A50D25] hover:underline">
                <ArrowLeft size={13} aria-hidden="true" /> Back
              </button>
            </div>
            <span className="mt-2 flex h-12 items-center rounded-xl border border-[#E3E3E7] bg-white px-3 focus-within:border-[#C8102E] focus-within:ring-4 focus-within:ring-[#C8102E]/10">
              <span className="text-[15px] font-semibold text-[#696976]">US$</span>
              <input
                id="offer-amount"
                type="number"
                inputMode="decimal"
                min={1}
                step={0.01}
                autoFocus
                onFocus={(e) => e.currentTarget.select()}
                placeholder="0.00"
                value={offerText}
                onChange={(e) => setOfferText(e.target.value)}
                className="w-full min-w-0 bg-transparent pl-1.5 text-[17px] font-semibold outline-none"
              />
            </span>
            {qty > 1 && offerEach > 0 && (
              <p className="mt-2 text-[13px] text-[#131316]">{qty} units = <strong>{usd(offerTotal)}</strong></p>
            )}
            {priced && offerEach > price && (
              <p className="mt-2 text-[12.5px] font-semibold text-[#B45309]">Your offer is above our price. Use Buy Now instead.</p>
            )}
            {offerOk ? (
              <Link
                href={link("/request-quote", {
                  ...base,
                  condition: label,
                  qty,
                  offer: 1,
                  amount: `${usd(offerEach)} USD`,
                  note: `Offer: ${usd(offerEach)} USD per unit${qty > 1 ? ` x ${qty} = ${usd(offerTotal)} USD` : ""}`,
                })}
                className={`${primary} mt-3`}
              >
                <Send size={17} aria-hidden="true" /> Send Offer
              </Link>
            ) : (
              <span aria-disabled="true" className={`${primary} mt-3 cursor-not-allowed opacity-50`}>
                <Send size={17} aria-hidden="true" /> Send Offer
              </span>
            )}
            <p className="mt-2 text-[12px] text-[#696976]">We review every offer and reply to accept, counter or decline. No payment is taken with an offer.</p>
          </div></div>
        ) : (
          <>
            {/* Info: title + 3 short points, same size for every option */}
            <div className="relative mt-2.5 rounded-xl bg-[#FFF6F7] px-3.5 py-2.5 ring-1 ring-[#C8102E]/12">
              <button type="button" onClick={() => setDetails(true)} aria-expanded={details} className="absolute right-2.5 top-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-semibold text-[#A50D25] hover:bg-white">
                <Info size={13} aria-hidden="true" /> <span className="max-[419px]:sr-only">Details</span>
              </button>
              <ul className="space-y-1 pr-8 min-[420px]:pr-16">
                {info[o.condition].lines.map((t, i) => (
                  <li key={t} className="flex items-center gap-2 text-[12.5px] text-[#131316]">
                    {info[o.condition].steps ? (
                      <span className="flex h-4 w-4 flex-none items-center justify-center rounded-full bg-[#C8102E] text-[9.5px] font-bold text-white">{i + 1}</span>
                    ) : (
                      <BadgeCheck size={14} className="flex-none text-[#B30E29]" aria-hidden="true" />
                    )}
                    <span className="min-w-0 sm:truncate">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Two buttons for every option */}
            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2">
              {priced ? (
                <button type="button" onClick={buyNow} className={primary}><ShoppingCart size={17} aria-hidden="true" /> Buy Now</button>
              ) : (
                <Link href={quoteHref} className={primary}>{o.condition === "repair" ? <Wrench size={17} aria-hidden="true" /> : <FileText size={17} aria-hidden="true" />} Request a Quote</Link>
              )}
              {priced ? (
                <button type="button" onClick={() => { setOfferText(price.toFixed(2)); setOffering(true); }} className={secondary}><BadgeDollarSign size={17} aria-hidden="true" /> Make an Offer</button>
              ) : o.condition === "new" || o.condition === "refurbished" ? (
                <Link href={link("/request-quote", { ...base, condition: label, qty: 5 })} className={secondary}><Layers size={17} aria-hidden="true" /> Volume Quote</Link>
              ) : (
                <Link href={link("/request-pickup", { part: partNumber })} className={secondary}><Truck size={17} aria-hidden="true" /> Request a Pickup</Link>
              )}
              <WhatsAppButton topic={`${manufacturer} ${partNumber} · ${label}`} kind="part" label={`Ask about ${partNumber} on WhatsApp`} />
            </div>

            {/* Details: opens over the box, so the box keeps its size */}
            {details && (
              <div role="dialog" aria-label={`${label} details`} className="absolute inset-0 z-20 flex flex-col overflow-y-auto rounded-[22px] bg-white p-4 shadow-[0_30px_70px_-30px_rgba(19,19,22,0.6)] ring-1 ring-[#EAEAEC] sm:p-4.5">
                <div className="flex items-center justify-between">
                  <p className="text-[15px] font-extrabold text-[#131316]">{info[o.condition].title}</p>
                  <button type="button" onClick={() => setDetails(false)} aria-label="Close details" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5A5A66] hover:bg-[#F5F5F6]"><X size={17} /></button>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {info[o.condition].lines.map((t, i) => (
                    <li key={t} className="flex items-start gap-2.5 text-[13.5px] text-[#131316]">
                      {info[o.condition].steps ? (
                        <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#C8102E] text-[10.5px] font-bold text-white">{i + 1}</span>
                      ) : (
                        <BadgeCheck size={16} className="mt-0.5 flex-none text-[#B30E29]" aria-hidden="true" />
                      )}
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 rounded-xl bg-[#FFF6F7] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#5A5A66] ring-1 ring-[#C8102E]/12">
                  <strong className="text-[#131316]">Note:</strong> {details_note[o.condition]}
                </p>
                <div className="mt-auto border-t border-[#F3F3F4] pt-3">
                  <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#131316]"><Zap size={15} className="text-[#F59E0B]" aria-hidden="true" /> Need it sooner? Call or email us about rush service.</p>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-semibold">
                    {contact.email && <a href={`mailto:${contact.email}?subject=${encodeURIComponent(`${label}: ${manufacturer} ${partNumber}`)}`} className="inline-flex items-center gap-1.5 text-[#A50D25] hover:underline"><Mail size={14} aria-hidden="true" />{contact.email}</a>}
                    {contact.phone && <a href={phoneHref(contact.phone)} className="inline-flex items-center gap-1.5 text-[#A50D25] hover:underline"><Phone size={14} aria-hidden="true" />{contact.phone}</a>}
                  </div>
                </div>
              </div>
            )}

            {/* One-line footnote */}
            <p className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-[#696976]">
              <Clock size={13} className="flex-none self-start mt-px" aria-hidden="true" />
              <span className="line-clamp-2 sm:line-clamp-1">{info[o.condition].note}{" "}
                <Zap size={12} className="mb-0.5 inline text-[#F59E0B]" aria-hidden="true" /> Rush?{" "}
                {contact.email ? <a href={`mailto:${contact.email}?subject=${encodeURIComponent(`Rush: ${manufacturer} ${partNumber}`)}`} className="font-semibold text-[#A50D25] hover:underline">Email us</a> : "Contact us"}
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
