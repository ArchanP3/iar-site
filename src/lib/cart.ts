"use client";

import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/*  Shopping cart, saved in the customer's browser (no account needed). */
/*  Only inventory items with a price can go in the cart (rules.ts).    */
/*  Prices here are for display: every order is confirmed by our team   */
/*  (stock, shipping, invoice) before the customer pays.                */
/* ------------------------------------------------------------------ */

export type CartCondition = "new" | "refurbished" | "exchange";

export type CartItem = {
  /** slug + condition, so the same part can be in the cart as Refurbished and as Exchange */
  id: string;
  slug: string;
  manufacturer: string;
  partNumber: string;
  name: string;
  condition: CartCondition;
  /** USD per unit */
  price: number;
  qty: number;
  image?: string;
};

const KEY = "aq-cart-v1";
const EVENT = "aq-cart";
const MAX_QTY = 999;
const EMPTY: CartItem[] = [];

let cacheRaw: string | null = null;
let cacheItems: CartItem[] = EMPTY;

function read(): CartItem[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return cacheItems; // storage blocked (private mode): keep what we have in memory
  }
  if (raw === cacheRaw) return cacheItems;
  cacheRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
    cacheItems = Array.isArray(parsed)
      ? parsed.filter((i) => i && typeof i.id === "string" && typeof i.price === "number" && i.qty > 0)
      : EMPTY;
  } catch {
    cacheItems = EMPTY;
  }
  return cacheItems;
}

function write(items: CartItem[]) {
  const raw = JSON.stringify(items);
  cacheRaw = raw;
  cacheItems = items;
  try {
    window.localStorage.setItem(KEY, raw);
  } catch {
    // storage blocked: the cart still works until the tab is closed
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage); // other open tabs
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** Cart items; empty on the server and on first paint, then the saved cart. */
export function useCart() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.qty, 0);
export const cartSubtotal = (items: CartItem[]) => Math.round(items.reduce((s, i) => s + i.price * i.qty, 0) * 100) / 100;

export function addToCart(item: Omit<CartItem, "id">) {
  const id = `${item.slug}:${item.condition}`;
  const items = read();
  const found = items.find((i) => i.id === id);
  write(
    found
      ? items.map((i) => (i.id === id ? { ...i, ...item, id, qty: Math.min(MAX_QTY, i.qty + item.qty) } : i))
      : [...items, { ...item, id, qty: Math.min(MAX_QTY, item.qty) }],
  );
}

export function setQty(id: string, qty: number) {
  write(read().map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(MAX_QTY, Math.floor(qty) || 1)) } : i)));
}

export function removeFromCart(id: string) {
  write(read().filter((i) => i.id !== id));
}

export function clearCart() {
  write([]);
}

export { usd } from "@/lib/parts/rules";
