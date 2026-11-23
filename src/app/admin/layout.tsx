import type { Metadata } from "next";
import { montserrat } from "@/lib/font";

/* The CMS lives at /admin. It is never indexed by search engines. */
export const metadata: Metadata = {
  title: { absolute: "AutomIQ CMS" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className={`${montserrat.className} min-h-screen bg-[#F4F7FB] text-[13.5px] text-[#0B1A3C] antialiased`}>{children}</div>;
}
