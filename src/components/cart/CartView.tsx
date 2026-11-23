"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, FileText, Lock, Mail, Minus, Phone, Plus, RefreshCw, ShieldCheck, ShoppingCart, Trash2, Truck, Wrench, Zap } from "lucide-react";
import { cartCount, cartSubtotal, removeFromCart, setQty, usd, useCart } from "@/lib/cart";
import { phoneHref } from "@/lib/contact";
import { useContact } from "@/components/cms/ContactProvider";
import { handling } from "@/lib/shipping";

const partUrl = (slug: string) => `/parts/${slug}`;

const badge = {
  new: { text: "New", cls: "bg-[#15803D]/[0.1] text-[#15803D]", icon: BadgeCheck },
  refurbished: { text: "Refurbished", cls: "bg-[#0066FF]/[0.08] text-[#0052CC]", icon: Wrench },
  exchange: { text: "Exchange", cls: "bg-[#F59E0B]/[0.12] text-[#92400E]", icon: RefreshCw },
};

export default function CartView() {
  const contact = useContact();
  const items = useCart();
  const count = cartCount(items);
  const subtotal = cartSubtotal(items);
  const hasExchange = items.some((i) => i.condition === "exchange");

  if (!items.length) {
    return (
      <div className="rounded-[24px] border border-[#E3EAF3] bg-white px-6 py-14 text-center shadow-[0_30px_70px_-45px_rgba(11,26,60,0.45)]">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-[#0066FF]/10 to-[#00B0FF]/10 text-[#005AE0] ring-1 ring-[#0066FF]/15">
          <ShoppingCart size={28} aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-[24px] font-extrabold text-[#0B1A3C]">Your cart is empty</h2>
        <p className="mx-auto mt-2 max-w-[420px] text-[14.5px] leading-[1.6] text-[#52647F]">
          Find an in-stock part and press Buy Now, or send us a part number and we will quote it.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/shop" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#0066FF] to-[#00B0FF] px-6 text-[15px] font-semibold text-white shadow-[0_14px_30px_-14px_rgba(0,102,255,0.9)] transition hover:-translate-y-0.5">
            Shop Parts <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/request-quote" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#D9E4F1] bg-white px-6 text-[15px] font-semibold text-[#0B1A3C] transition hover:border-[#0066FF]/50 hover:text-[#0052CC]">
            <FileText size={16} aria-hidden="true" /> Request a Quote
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* ---------- Items ---------- */}
      <section aria-label="Items in your cart" className="space-y-4">
        {items.map((i) => {
          const b = badge[i.condition];
          return (
            <article key={i.id} className="rounded-[22px] border border-[#E3EAF3] bg-white p-4 shadow-[0_24px_60px_-48px_rgba(11,26,60,0.5)] sm:p-5">
              <div className="flex gap-4">
                <Link href={partUrl(i.slug)} className="relative h-24 w-24 flex-none overflow-hidden rounded-2xl bg-[#F4F7FB] ring-1 ring-[#E3EAF3] sm:h-28 sm:w-28">
                  {i.image ? (
                    <Image src={i.image} alt="" aria-hidden="true" fill sizes="112px" loading="eager" unoptimized={i.image.startsWith("http")} className="object-contain p-2.5" />
                  ) : (
                    <ShoppingCart size={26} className="absolute inset-0 m-auto text-[#5B6B84]" aria-hidden="true" />
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold ${b.cls}`}>
                        <b.icon size={12} aria-hidden="true" /> {b.text}
                      </span>
                      <Link href={partUrl(i.slug)} className="mt-1.5 block wrap-break-word font-mono text-[18px] font-bold text-[#0B1A3C] hover:text-[#005AE0] sm:text-[20px]">
                        {i.partNumber}
                      </Link>
                      <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#4A5B76]">{i.manufacturer}</p>
                      <p className="mt-0.5 line-clamp-1 text-[13px] text-[#5B6B84]">{i.name}</p>
                    </div>
                    <button type="button" onClick={() => removeFromCart(i.id)} aria-label={`Remove ${i.partNumber}`} className="flex h-9 w-9 flex-none items-center justify-center rounded-xl text-[#5B6B84] transition hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF3F9] pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 items-center rounded-xl border border-[#D9E4F1]" aria-label="Quantity">
                    <button type="button" aria-label="Less" onClick={() => setQty(i.id, i.qty - 1)} disabled={i.qty <= 1} className="flex h-full w-10 items-center justify-center text-[#4A5B76] hover:text-[#005AE0] disabled:opacity-35"><Minus size={15} /></button>
                    <span className="w-9 text-center text-[15px] font-semibold tabular-nums" aria-live="polite">{i.qty}</span>
                    <button type="button" aria-label="More" onClick={() => setQty(i.id, i.qty + 1)} className="flex h-full w-10 items-center justify-center text-[#4A5B76] hover:text-[#005AE0]"><Plus size={15} /></button>
                  </div>
                  <span className="text-[13px] text-[#5B6B84]">× {usd(i.price)}</span>
                </div>
                <p className="text-[22px] font-extrabold tracking-[-0.01em] text-[#0B1A3C]">{usd(Math.round(i.price * i.qty * 100) / 100)}</p>
              </div>

              {i.condition === "exchange" && (
                <p className="mt-3 rounded-xl bg-[#FFFBEB] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#78350F] ring-1 ring-[#FDE68A]">
                  <strong>Exchange:</strong> ship us your unit or book a pickup. {handling.exchange} {handling.exchangeEarly} The final price is confirmed when we check your unit and may be higher depending on its condition.
                </p>
              )}
            </article>
          );
        })}

        <div className="flex flex-col gap-3 rounded-[22px] border border-[#E3EAF3] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <p className="flex items-start gap-2 text-[13px] font-semibold text-[#0B1A3C]">
            <Zap size={16} className="mt-0.5 flex-none text-[#F59E0B]" aria-hidden="true" />
            Need it sooner? Call or email us. Rush handling is available for an extra fee.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-semibold">
            {contact.phone && <a href={phoneHref(contact.phone)} className="inline-flex items-center gap-1.5 text-[#0052CC] hover:underline"><Phone size={14} aria-hidden="true" />{contact.phone}</a>}
            {contact.email && <a href={`mailto:${contact.email}?subject=Rush%20order`} className="inline-flex items-center gap-1.5 text-[#0052CC] hover:underline"><Mail size={14} aria-hidden="true" />{contact.email}</a>}
            <Link href="/shop" className="text-[#0052CC] hover:underline">Continue shopping</Link>
          </div>
        </div>
      </section>

      {/* ---------- Summary ---------- */}
      <aside aria-label="Order summary" className="lg:sticky lg:top-28">
        <div className="overflow-hidden rounded-[24px] border border-[#E3EAF3] bg-white shadow-[0_30px_70px_-45px_rgba(11,26,60,0.45)]">
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-extrabold text-[#0B1A3C]">Order summary</h2>
              <span className="rounded-lg bg-[#F1F5FA] px-2.5 py-1 text-[12px] font-bold text-[#4A5B76]">USD</span>
            </div>
            <dl className="mt-5 space-y-3 text-[14px]">
              <div className="flex justify-between"><dt className="text-[#52647F]">Subtotal ({count} item{count === 1 ? "" : "s"})</dt><dd className="font-semibold text-[#0B1A3C]">{usd(subtotal)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[#52647F]">Shipping</dt><dd className="text-right text-[#52647F]">Confirmed with your order</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[#52647F]">Tax</dt><dd className="text-right text-[#52647F]">Confirmed with your order</dd></div>
            </dl>
            <div className="mt-5 flex items-end justify-between border-t border-[#EEF3F9] pt-4">
              <p className="text-[15px] font-bold text-[#0B1A3C]">Estimated total</p>
              <p className="text-[26px] font-extrabold leading-none tracking-[-0.02em] text-[#0B1A3C]">{usd(subtotal)}</p>
            </div>
            <p className="mt-1 text-right text-[12px] text-[#5B6B84]">plus shipping and tax</p>

            <Link href="/checkout" className="mt-5 flex h-13.5 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#0066FF] to-[#00B0FF] text-[16px] font-semibold text-white shadow-[0_14px_30px_-14px_rgba(0,140,255,0.9)] transition hover:-translate-y-0.5">
              <Lock size={17} aria-hidden="true" /> Proceed to Checkout
            </Link>
          </div>
          <ul className="space-y-2.5 border-t border-[#EEF3F9] bg-[#F7FAFE] px-5 py-4 text-[12.5px] text-[#4A5B76] sm:px-6">
            <li className="flex items-start gap-2"><ShieldCheck size={15} className="mt-0.5 flex-none text-[#005AE0]" aria-hidden="true" />We confirm stock, shipping and your invoice before you pay.</li>
            <li className="flex items-start gap-2"><Wrench size={15} className="mt-0.5 flex-none text-[#005AE0]" aria-hidden="true" />Tested on our own jigs before it ships.</li>
            <li className="flex items-start gap-2"><Truck size={15} className="mt-0.5 flex-none text-[#005AE0]" aria-hidden="true" />{handling.short}. Shipping across Canada and the USA.</li>
          </ul>
        </div>
        {hasExchange && (
          <p className="mt-3 px-1 text-[12px] leading-relaxed text-[#5B6B84]">Exchange units ship once your unit reaches us, usually within 1–2 business days.</p>
        )}
      </aside>
    </div>
  );
}
