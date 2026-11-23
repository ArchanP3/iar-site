"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { COUNTRY_SITES, SITE_COUNTRY } from "@/lib/site";
import { montserrat } from "@/lib/font";

/* ------------------------------------------------------------------ */
/*  .ca / .com: a visitor on the "wrong" country site sees a bar that   */
/*  suggests the other site. Nobody is redirected (Google recommends     */
/*  this over location redirects), both sites stay open to everyone,     */
/*  and closing the bar hides it for a year on that site.                */
/*  The visitor's country comes from the visitor_country cookie, set by  */
/*  src/proxy.ts from Vercel's location header.                          */
/* ------------------------------------------------------------------ */

const HIDE = "country_bar_off";
const readCookies = () => document.cookie;
const noCookies = () => "";
const subscribe = () => () => {};
const cookie = (all: string, name: string) => all.match(new RegExp(`(?:^|; )${name}=([^;]*)`))?.[1];

export default function CountrySuggest() {
  const all = useSyncExternalStore(subscribe, readCookies, noCookies);
  const path = usePathname();
  const [closed, setClosed] = useState(false);
  if (!SITE_COUNTRY || closed || path.startsWith("/admin")) return null;
  const from = cookie(all, "visitor_country");
  if (!from || cookie(all, HIDE)) return null;
  const inCanada = from === "CA";
  if (SITE_COUNTRY === "US" ? !inCanada : inCanada) return null; // already on their country's site

  const toCa = SITE_COUNTRY === "US";
  // A city page exists on one site only (the other 301s back), so city pages point at the city list.
  const target = `${COUNTRY_SITES[toCa ? "CA" : "US"]}${/^\/service-areas\/./.test(path) ? "/service-areas" : path}`;
  const hide = () => {
    document.cookie = `${HIDE}=1; Max-Age=${60 * 60 * 24 * 365}; Path=/; SameSite=Lax; Secure`;
    setClosed(true);
  };

  return (
    <div role="region" aria-label="Country site suggestion" className={`${montserrat.className} relative z-60 bg-[#0B1A3C] text-white`}>
      <div className="mx-auto flex max-w-360 flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5 pr-12 text-[13.5px] sm:px-8 lg:px-12">
        <p className="min-w-0">
          {toCa ? (
            <>Looks like you&apos;re in Canada. Visit our Canadian site, <b>automiqautomation.ca</b>.</>
          ) : (
            <>Looks like you&apos;re outside Canada. Visit <b>automiqautomation.com</b>, our site for the USA and international customers.</>
          )}
        </p>
        <span className="flex items-center gap-2">
          <a href={target} hrefLang={toCa ? "en-CA" : "en-US"} className="inline-flex h-8 items-center rounded-lg bg-linear-to-br from-[#0066FF] to-[#00B0FF] px-3.5 text-[13px] font-semibold">
            Go to {toCa ? "automiqautomation.ca" : "automiqautomation.com"}
          </a>
          <button type="button" onClick={hide} className="h-8 rounded-lg px-3 text-[13px] font-semibold text-white/75 hover:text-white">
            Stay here
          </button>
        </span>
        <button type="button" onClick={hide} aria-label="Close" className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white">
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
