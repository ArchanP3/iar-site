import type { Metadata } from "next";
import { brandFont } from "@/lib/font";

/* The CMS lives at /admin. It is never indexed by search engines. */
export const metadata: Metadata = {
  title: { absolute: "AutomIQ CMS" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className={`${brandFont.className} min-h-screen bg-[#F7F7F8] text-[13.5px] text-[#131316] antialiased`}>{children}</div>;
}
