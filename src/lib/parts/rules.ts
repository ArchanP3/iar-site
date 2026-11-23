import type { Condition, Offer } from "./types";

/* ------------------------------------------------------------------ */
/*  Selling rules: the ONE place that decides what a buyer can do.      */
/*  Every part shows New, Refurbished, Exchange and Repair.             */
/*    Inventory item (catalog row has a USD price and is in stock)      */
/*      -> its condition (New or Refurbished) shows the price + Buy Now */
/*    Everything else -> Request a Quote                                */
/*  Orders are confirmed by our team (stock, shipping, invoice) before  */
/*  the customer pays: no payment is taken online.                      */
/* ------------------------------------------------------------------ */

export const WARRANTY = "1-year warranty";

/** The catalog fields that make a part an inventory item. */
export type Stock = { price: number | null; currency?: string | null; condition?: string | null; availability?: string | null; stock_qty?: number | null };

/** Conditions that can be bought online. Exchange stays quote-only until exchange pricing is approved. */
const buyable: Condition[] = ["new", "refurbished"];

const toCondition = (c: string | null | undefined): Condition => {
  const t = (c ?? "").toLowerCase();
  return t.includes("new") && !t.includes("renew") ? "new" : "refurbished";
};

const inStock = (a: string | null | undefined) => !a || /instock|in stock|limitedavailability/i.test(a.replace(/^https?:\/\/schema\.org\//, ""));

/** The condition and USD price of an inventory item, or null when the part is quote-only. */
export function inventoryOffer(s?: Stock): { condition: Condition; price: number; stock?: number } | null {
  if (!s || s.price === null || !(s.price > 0)) return null;
  if (s.currency && s.currency.toUpperCase() !== "USD") return null;
  if (!inStock(s.availability) || s.stock_qty === 0) return null;
  const condition = toCondition(s.condition);
  if (!buyable.includes(condition)) return null;
  return { condition, price: Number(s.price), ...(s.stock_qty ? { stock: s.stock_qty } : {}) };
}

export const canBuyOnline = (o: Offer): o is Offer & { price: number } => o.price !== undefined;

export function sellingOffers(s?: Stock): Offer[] {
  const inv = inventoryOffer(s);
  const priced = (c: Condition): Offer => (inv?.condition === c ? { condition: c, price: inv.price, ...(inv.stock ? { stock: inv.stock } : {}) } : { condition: c });
  return [priced("new"), priced("refurbished"), { condition: "exchange" }, { condition: "repair", warranty: `${WARRANTY} on the repair` }];
}

export const usd = (n: number) =>
  `US$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
