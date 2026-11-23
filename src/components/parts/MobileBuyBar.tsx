"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, X } from "lucide-react";
import { contact as site, phoneHref } from "@/lib/contact";
import { addToCart } from "@/lib/cart";
import { canBuyOnline, usd, WARRANTY } from "@/lib/parts/rules";
import { useContact } from "@/components/cms/ContactProvider";
import WhatsAppButton, { WhatsAppIcon, WhatsAppTrigger } from "@/components/WhatsAppButton";
import { conditionLabel, type Condition, type Offer } from "@/lib/parts/types";

type Props = { slug: string; name: string; image?: string; manufacturer: string; partNumber: string; offers: Offer[] };

const blurb: Record<Condition, string> = {
  refurbished: `Tested · ${WARRANTY}`,
  exchange: "Send us your failed unit, we ship a tested one",
  new: "Factory-new, lead time confirmed by email",
  repair: "Written quote before any work",
};
const order: Condition[] = ["refurbished", "new", "exchange", "repair"];
const link = (path: string, params: Record<string, string | number | undefined>) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") q.set(k, String(v));
  return `${path}?${q.toString()}`;
};

/* Phones and tablets: sticky bar at the bottom. "See options" opens a panel from the bottom
   with every option and its own button, so the page never jumps. */
export default function MobileBuyBar({ slug, name, image, manufacturer, partNumber, offers }: Props) {
  const router = useRouter();
  const contact = useContact();
  const [open, setOpen] = useState(false);
  const startY = useRef<number | null>(null);
  const [drag, setDrag] = useState(0);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    document.documentElement.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.documentElement.style.overflow = ""; };
  }, [open]);

  const rows = order
    .map((c) => offers.find((o) => o.condition === c))
    .filter((o): o is Offer => Boolean(o))
    .map((o) => {
      // Same rule as the buy box: only new / refurbished inventory items are bought online
      const priced = canBuyOnline(o) && (o.condition === "new" || o.condition === "refurbished");
      return { o, price: o.price, priced, inStock: priced };
    });
  const lead = rows.find((r) => r.priced);
  const base = { part: partNumber, brand: manufacturer, item: slug };

  const action = (r: (typeof rows)[number]) => {
    const c = r.o.condition;
    if (r.priced && (c === "new" || c === "refurbished")) {
      return { label: "Buy Now", go: () => { addToCart({ slug, manufacturer, partNumber, name, condition: c, price: r.price!, qty: 1, image }); router.push("/cart"); } };
    }
    if (c === "repair") return { label: "Request Repair", href: link("/request-repair", base) };
    if (c === "exchange") return { label: "Get Exchange", href: link("/request-repair", { ...base, service: "exchange" }) };
    return { label: "Get Quote", href: link("/request-quote", { ...base, condition: conditionLabel[c], qty: 1 }) };
  };

  const btn = "inline-flex h-10 flex-none items-center whitespace-nowrap rounded-xl px-3.5 text-[13.5px] font-bold transition";
  const close = () => { setOpen(false); setDrag(0); };

  return (
    <>
      {/* ---------- sticky bar (always on, phones and tablets) ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#EAEAEC] bg-white/95 px-4 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-160 items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-extrabold">{partNumber}</p>
            <p className="truncate text-[11.5px] text-[#696976]">{lead ? `From ${usd(lead.price!)}` : `${manufacturer} · ${rows.length} options`}</p>
          </div>
          <WhatsAppButton topic={`${manufacturer} ${partNumber}`} kind="part" label={`Ask about ${partNumber} on WhatsApp`} />
          <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className="inline-flex h-11 flex-none items-center gap-1.5 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-5 text-[14px] font-semibold text-white">See options</button>
        </div>
      </div>

      {/* ---------- panel ---------- */}
      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button type="button" aria-label="Close" onClick={close} className="absolute inset-0 bg-[#060607]/55 backdrop-blur-[2px]" />
          <div
            role="dialog" aria-modal="true" aria-labelledby="bo-title"
            style={{ transform: `translateY(${drag}px)` }}
            className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto overscroll-contain rounded-t-[26px] bg-white px-4 pt-2.5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-30px_60px_-20px_rgba(6, 6, 7,0.5)] transition-transform duration-150"
          >
            <div
              className="-mx-4 -mt-2.5 px-4 pt-2.5 pb-2"
              onTouchStart={(e) => { startY.current = e.touches[0].clientY; }}
              onTouchMove={(e) => { if (startY.current !== null) setDrag(Math.max(0, e.touches[0].clientY - startY.current)); }}
              onTouchEnd={() => { if (drag > 90) close(); else setDrag(0); startY.current = null; }}
            >
              <span aria-hidden="true" className="mx-auto block h-1.25 w-10.5 rounded-full bg-[#DDDDE0]" />
              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold text-[#696976]">{manufacturer} · {partNumber}</p>
                  <h2 id="bo-title" className="mt-0.5 text-[18px] font-extrabold text-[#131316]">Choose how you want it</h2>
                </div>
                <button type="button" onClick={close} aria-label="Close" className="grid size-8 flex-none place-items-center rounded-[10px] bg-[#F5F5F6] text-[#5A5A66]"><X size={17} aria-hidden="true" /></button>
              </div>
            </div>

            <ul className="space-y-2">
              {rows.map((r) => {
                const a = action(r);
                const best = r === lead;
                return (
                  <li key={r.o.condition} className={`flex items-center gap-3 rounded-2xl border p-3 ${best ? "border-[#C8102E] bg-[#FFF6F7] ring-3 ring-[#C8102E]/8" : "border-[#EAEAEC]"}`}>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-1.5 text-[14.5px] font-extrabold text-[#131316]">
                        {r.o.condition === "repair" ? "Repair your unit" : conditionLabel[r.o.condition]}
                        {r.inStock && r.o.condition !== "repair" && <span className="rounded-md bg-[#DCFCE7] px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-[0.08em] text-[#15803D]">In stock</span>}
                      </p>
                      <p className="text-[13px] font-bold text-[#131316]">{r.priced ? usd(r.price!) : r.o.condition === "repair" ? "Free evaluation" : "Price on request"}</p>
                      <p className="text-[11.5px] leading-snug text-[#696976]">{blurb[r.o.condition]}</p>
                    </div>
                    {"go" in a ? (
                      <button type="button" onClick={a.go} className={`${btn} ${best ? "bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-white" : "border border-[#F0DADD] bg-white text-[#131316]"}`}>{a.label}</button>
                    ) : (
                      <Link href={a.href!} onClick={close} className={`${btn} ${best ? "bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-white" : "border border-[#F0DADD] bg-white text-[#131316]"}`}>{a.label}</Link>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className={`mt-3 grid gap-2 ${contact.phone ? "grid-cols-3" : "grid-cols-2"}`}>
              <WhatsAppTrigger topic={`${manufacturer} ${partNumber}`} kind="part" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#E7F8EE] text-[14px] font-bold text-[#128C4A]">
                <WhatsAppIcon size={16} className="text-[#1DA851]" /> WhatsApp
              </WhatsAppTrigger>
              {contact.phone && (
                <a href={phoneHref(contact.phone)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#F0DADD] text-[14px] font-bold text-[#131316]">
                  <Phone size={16} aria-hidden="true" /> Call
                </a>
              )}
              <a href={`mailto:${contact.email || site.email}?subject=${encodeURIComponent(`${manufacturer} ${partNumber}`)}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#F0DADD] text-[14px] font-bold text-[#131316]">
                <Mail size={16} aria-hidden="true" /> Email
              </a>
            </div>
            <p className="mt-2.5 text-center text-[11.5px] text-[#696976]">Not sure which one? Our team will help.</p>
          </div>
        </div>
      )}
    </>
  );
}
