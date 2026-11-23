"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Globe2, CheckCircle2, Landmark, Package, RefreshCw, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import AddressBlock, { type Country } from "./AddressBlock";
import { handling } from "@/lib/shipping";
import { CarrierPicker, Choice, DetailsFields, FormMeta, Step, SubmitBar, input, label, useSend } from "@/components/request/FormParts";
import { conditionLabel } from "@/lib/parts/types";
import { cartCount, cartSubtotal, clearCart, usd, useCart, type CartItem } from "@/lib/cart";

const lineText = (i: CartItem) =>
  `${i.qty} x ${i.manufacturer} ${i.partNumber} (${conditionLabel[i.condition]}) at ${usd(i.price)} = ${usd(Math.round(i.price * i.qty * 100) / 100)}`;

export default function CheckoutForm() {
  const items = useCart();
  const { status, send } = useSend();
  const [carrier, setCarrier] = useState("No preference");
  const [unitReturn, setUnitReturn] = useState("ship");
  const [shipCountry, setShipCountry] = useState<Country>("Canada");
  const [billCountry, setBillCountry] = useState<Country>("Canada");
  const [sameBilling, setSameBilling] = useState(true);
  const [ein, setEin] = useState("");
  const toUS = shipCountry === "United States";
  const abroad = shipCountry === "Other";
  const quoteHref = `/international?${new URLSearchParams({ parts: items.map((i) => `${i.manufacturer} ${i.partNumber} × ${i.qty} (${conditionLabel[i.condition]})`).join("\n") })}#quote`;
  const [placed, setPlaced] = useState<{ items: CartItem[]; subtotal: number } | null>(null);
  const hasExchange = items.some((i) => i.condition === "exchange");
  const subtotal = cartSubtotal(items);
  const count = cartCount(items);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const snapshot = { items, subtotal };
    if (await send(e)) {
      setPlaced(snapshot);
      clearCart();
    }
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-180 rounded-[24px] border border-[#EAEAEC] bg-white p-7 text-center shadow-[0_30px_70px_-45px_rgba(19,19,22,0.45)] sm:p-10">
        <CheckCircle2 size={52} className="mx-auto text-emerald-500" aria-hidden="true" />
        <h2 className="mt-4 text-[26px] font-extrabold text-[#131316]">Order received</h2>
        <p className="mx-auto mt-2 max-w-120 text-[14.5px] leading-[1.6] text-[#62626F]">
          Thank you. We will confirm stock, shipping and your invoice by email before you pay.
        </p>
        <ul className="mx-auto mt-6 max-w-120 divide-y divide-[#F3F3F4] rounded-2xl bg-[#FAFAFB] px-4 text-left text-[13.5px] ring-1 ring-[#EAEAEC]">
          {placed.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3 py-2.5">
              <span className="min-w-0 truncate"><span className="font-semibold">{i.qty} ×</span> <span className="font-mono">{i.partNumber}</span></span>
              <span className="font-semibold">{usd(Math.round(i.price * i.qty * 100) / 100)}</span>
            </li>
          ))}
          <li className="flex justify-between py-2.5 font-bold"><span>Subtotal</span><span>{usd(placed.subtotal)}</span></li>
        </ul>
        <Link href="/shop" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl border border-[#E3E3E7] px-5 text-[14px] font-semibold text-[#131316] hover:border-[#C8102E]">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-[24px] border border-[#EAEAEC] bg-white px-6 py-14 text-center">
        <ShoppingCart size={34} className="mx-auto text-[#B30E29]" aria-hidden="true" />
        <h2 className="mt-4 text-[22px] font-extrabold text-[#131316]">Your cart is empty</h2>
        <Link href="/shop" className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#131316] px-5 text-[14px] font-semibold text-white hover:bg-[#C8102E]">Shop Parts</Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      <form onSubmit={onSubmit} className="overflow-hidden rounded-[24px] border border-[#EAEAEC] bg-white shadow-[0_30px_70px_-45px_rgba(19,19,22,0.45)]">
        <FormMeta type="order" subject="New order: IAR website" />
        {/* What the server re-prices from the catalog; the Order text below is for people. */}
        <input type="hidden" name="_cart" value={JSON.stringify(items.map(({ slug, condition, qty }) => ({ slug, condition, qty })))} />
        <input type="hidden" name="Order" value={items.map(lineText).join("\n")} />
        <input type="hidden" name="Subtotal" value={`${usd(subtotal)} USD (before shipping and tax)`} />

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F3F3F4] bg-[#FAFAFB] px-5 py-3 text-[13px] sm:px-7">
          <span className="text-[#62626F]">No account needed</span>
        </div>

        <Step n={1} title="Your details" hint="We send your order confirmation and invoice here.">
          <DetailsFields prefix="co" location={false} />
        </Step>

        <Step n={2} title="Shipping address">
          <AddressBlock prefix="co-ship" name="Ship" section="shipping" country={shipCountry} onCountry={setShipCountry} />
          {!abroad && <div className="mt-5"><CarrierPicker prefix="co" value={carrier} onChange={setCarrier} /></div>}
          {abroad && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-[#DDDDE1] bg-[#FFF6F7]">
              <div className="flex items-start gap-3.5 p-4 sm:p-5">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-white"><Globe2 size={20} aria-hidden="true" /></span>
                <div>
                  <p className="text-[15.5px] font-extrabold text-[#131316]">International orders are quoted first</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#5A5A66]">Shipping charges and lead times change by country, so we confirm them before you order. Your cart items are added to the quote request for you. No payment now.</p>
                  <ul className="mt-3 grid gap-1.5 text-[12.5px] text-[#4E4E58] sm:grid-cols-2">
                    {["Price, shipping and lead time for your country", "Shipped by air with DHL, FedEx or UPS", "Commercial invoice with every shipment", "Duties, import taxes and brokerage paid by you"].map((t) => (
                      <li key={t} className="flex items-start gap-1.5"><CheckCircle2 size={14} className="mt-0.5 flex-none text-[#B30E29]" aria-hidden="true" />{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex flex-col gap-2 border-t border-[#E9E9EC] bg-white/70 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <span className="text-[12.5px] text-[#62626F]">{count} item{count === 1 ? "" : "s"} · {usd(subtotal)} USD before shipping</span>
                <Link href={quoteHref} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-5 text-[14px] font-semibold text-white shadow-[0_14px_30px_-14px_rgba(200,16,46,0.9)] transition hover:-translate-y-0.5">
                  Request an International Quote <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </Step>

        {!abroad && (<>

        {/* Only for shipments to the USA: who clears US customs */}
        {toUS && (
          <Step n={3} title="US customs" hint="Parts ship from Canada, so US customs needs your company's tax number.">
            <div className="overflow-hidden rounded-2xl border border-[#E3E3E7]">
              <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:p-5">
                <div>
                  <label className={label} htmlFor="co-ein">Business EIN (IRS number) *</label>
                  <div className="relative">
                    <Landmark size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B30E29]" aria-hidden="true" />
                    <input id="co-ein" name="US importer EIN" required inputMode="numeric" autoComplete="off" pattern="\d{2}-\d{7}" title="9-digit EIN, e.g. 12-3456789" placeholder="12-3456789"
                      value={ein} onChange={(e) => { const d = e.target.value.replace(/\D/g, "").slice(0, 9); setEin(d.length > 2 ? `${d.slice(0, 2)}-${d.slice(2)}` : d); }}
                      className={`${input} h-12 pl-10 font-mono text-[16px] tracking-[0.08em]`} />
                  </div>
                  <p className="mt-1.5 text-[12px] text-[#62626F]">The 9-digit Employer Identification Number from your company&apos;s IRS letter.</p>
                </div>
                <ul className="space-y-2 self-center rounded-xl bg-[#FFF6F7] p-3.5 text-[12.5px] text-[#4E4E58]">
                  {["Printed on the customs invoice for faster clearance", "Used only for this shipment's paperwork", "Duties, taxes and brokerage are paid by the receiver"].map((t) => (
                    <li key={t} className="flex items-start gap-2"><ShieldCheck size={14} className="mt-0.5 flex-none text-[#B30E29]" aria-hidden="true" />{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Step>
        )}

        {hasExchange && (
          <Step n={toUS ? 4 : 3} title="Your exchange unit" hint="We ship the replacement once your unit reaches us, usually within 1–2 business days.">
            <Choice name="Exchange unit return" value={unitReturn} onChange={setUnitReturn} cols={2} options={[
              { v: "ship", t: "I will ship it", d: "Send it with any carrier", icon: Package },
              { v: "pickup", t: "Book a pickup", d: "We arrange it from your site", icon: Truck },
            ]} />
          </Step>
        )}

        <Step n={3 + (toUS ? 1 : 0) + (hasExchange ? 1 : 0)} title="Billing and order details">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E3E3E7] bg-[#FBFBFC] px-3.5 py-3 text-[14px] font-semibold text-[#131316]">
            <input type="checkbox" checked={sameBilling} onChange={(e) => { setSameBilling(e.target.checked); setBillCountry(shipCountry); }} className="h-4 w-4 accent-[#C8102E]" />
            Billing address is the same as shipping
          </label>
          <input type="hidden" name="Billing address" value={sameBilling ? "Same as shipping" : "See billing fields"} />
          {!sameBilling && (
            <div className="mt-4"><AddressBlock prefix="co-bill" name="Bill" section="billing" country={billCountry} onCountry={setBillCountry} /></div>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div><label className={label} htmlFor="co-ap">Send invoice to <span className="font-normal text-[#62626F]">(accounts payable email, optional)</span></label><input id="co-ap" name="Invoice email" type="email" className={input} placeholder="ap@yourcompany.com" /></div>
            <div><label className={label} htmlFor="co-po">PO number <span className="font-normal text-[#62626F]">(optional)</span></label><input id="co-po" name="PO number" className={input} /></div>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-3 sm:col-span-2">
              <input type="checkbox" name="Rush handling" value="Yes, call me with rush price and lead time" className="mt-0.5 h-4 w-4 flex-none accent-[#F59E0B]" />
              <span>
                <span className="block text-[14px] font-semibold text-[#131316]">I need rush handling</span>
                <span className="block text-[12.5px] leading-snug text-[#78350F]">Extra fee. We call or email you with the price and lead time before anything is charged. Standard: {handling.short.toLowerCase()}.</span>
              </span>
            </label>
            <div className="sm:col-span-2"><label className={label} htmlFor="co-notes">Notes <span className="font-normal text-[#62626F]">(optional)</span></label><input id="co-notes" name="Notes" className={input} placeholder="Receiving hours, firmware version, anything else" /></div>
          </div>
        </Step>

        <SubmitBar status={status} label="Place Order" note="No payment now. We confirm stock, shipping and your invoice first." />
        </>)}
      </form>

      <aside aria-label="Your order" className="lg:sticky lg:top-28">
        <div className="overflow-hidden rounded-[24px] border border-[#EAEAEC] bg-white shadow-[0_30px_70px_-45px_rgba(19,19,22,0.45)]">
          <div className="flex items-center justify-between border-b border-[#F3F3F4] px-5 py-4">
            <h2 className="text-[17px] font-extrabold text-[#131316]">Your order <span className="font-semibold text-[#696976]">({count})</span></h2>
            <Link href="/cart" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#A50D25] hover:underline"><ArrowLeft size={13} aria-hidden="true" /> Edit cart</Link>
          </div>
          <ul className="divide-y divide-[#F3F3F4] px-5">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-3.5">
                <span className="relative h-14 w-14 flex-none overflow-hidden rounded-xl bg-[#F7F7F8] ring-1 ring-[#EAEAEC]">
                  {i.image && <Image src={i.image} alt="" aria-hidden="true" fill sizes="56px" loading="eager" unoptimized={i.image.startsWith("http")} className="object-contain p-1.5" />}
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#131316] px-1 text-[10.5px] font-bold text-white">{i.qty}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-[13.5px] font-bold text-[#131316]">{i.partNumber}</span>
                  <span className="flex items-center gap-1 text-[12px] text-[#696976]">
                    {i.condition === "exchange" ? <RefreshCw size={11} aria-hidden="true" /> : <Building2 size={11} aria-hidden="true" />}
                    {i.manufacturer} · {conditionLabel[i.condition]}
                  </span>
                </span>
                <span className="text-[14px] font-bold text-[#131316]">{usd(Math.round(i.price * i.qty * 100) / 100)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-2.5 border-t border-[#F3F3F4] bg-[#FAFAFB] px-5 py-4 text-[13.5px]">
            <div className="flex justify-between"><dt className="text-[#62626F]">Subtotal</dt><dd className="font-semibold">{usd(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-[#62626F]">Shipping & tax</dt><dd className="text-[#62626F]">Confirmed with your order</dd></div>
            <div className="flex items-end justify-between border-t border-[#EAEAEC] pt-3"><dt className="font-bold">Estimated total</dt><dd className="text-[22px] font-extrabold leading-none">{usd(subtotal)} <span className="text-[12px] font-bold text-[#696976]">USD</span></dd></div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
