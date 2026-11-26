"use client";

import { useSyncExternalStore } from "react";
import { usd, type CartItem } from "@/lib/cart";

/* The order just placed at checkout (saved to sessionStorage there), shown on /checkout/thank-you. */

/** sessionStorage key: the order just placed at checkout. */
export const PLACED_KEY = "iar_placed_order";

type Placed = { items: CartItem[]; subtotal: number };

const read = () => {
  try { return sessionStorage.getItem(PLACED_KEY); } catch { return null; }
};

export default function PlacedOrder() {
  const raw = useSyncExternalStore(() => () => {}, read, () => null);
  let placed: Placed | null = null;
  try { placed = raw ? (JSON.parse(raw) as Placed) : null; } catch {}
  if (!placed?.items?.length) return null;
  return (
    <div className="mb-7">
      <h2 className="text-[20px] font-extrabold text-[#131316] sm:text-[22px]">Your order</h2>
      <ul className="mt-4 divide-y divide-[#F3F3F4] rounded-2xl bg-[#FAFAFB] px-4 text-[14px] ring-1 ring-[#EAEAEC]">
        {placed.items.map((i) => (
          <li key={i.id} className="flex justify-between gap-3 py-2.5">
            <span className="min-w-0 truncate"><span className="font-semibold">{i.qty} ×</span> {i.manufacturer} <span className="font-mono">{i.partNumber}</span></span>
            <span className="font-semibold">{usd(Math.round(i.price * i.qty * 100) / 100)}</span>
          </li>
        ))}
        <li className="flex justify-between py-2.5 font-bold"><span>Subtotal (before shipping and tax)</span><span>{usd(placed.subtotal)} USD</span></li>
      </ul>
    </div>
  );
}
