"use client";

import { createContext, useContext } from "react";
import { contact as fallback } from "@/lib/contact";

type C = { phone: string; email: string; address: string; hours: [string, string][]; strip?: string };
const Ctx = createContext<C>({ ...fallback, strip: "Repairs across the USA · Free evaluation on every repair · 24/7 line 1-877-904-6155" });

/* Makes the business phone, email and address from the CMS available to interactive parts of the site. */
export function ContactProvider({ value, children }: { value: C; children: React.ReactNode }) {
  return <Ctx value={value}>{children}</Ctx>;
}

export const useContact = () => useContext(Ctx);
