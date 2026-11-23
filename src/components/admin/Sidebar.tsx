"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowRightLeft, Braces, ChartLine, ClipboardCheck, Code, FileText, Image as ImageIcon, Inbox, LayoutDashboard, LayoutTemplate, LogOut,
  Map, MapPin, Menu, Newspaper, Package, SearchCheck, Settings, Users, X,
} from "lucide-react";
import { signOut } from "@/app/admin/actions";

export type NavItem = { href: string; label: string; icon: keyof typeof ICONS; badge?: number; badgeTone?: "red" | "dim" };
export type NavGroup = { label: string; items: NavItem[] };

const ICONS = {
  dashboard: LayoutDashboard, checklist: ClipboardCheck, pages: FileText, blog: Newspaper, landing: LayoutTemplate, parts: Package, media: ImageIcon,
  audit: SearchCheck, redirects: ArrowRightLeft, schema: Braces, sitemaps: Map, locations: MapPin, performance: ChartLine, leads: Inbox,
  tracking: Code, settings: Settings, users: Users,
};

export default function Sidebar({ groups, user }: { groups: NavGroup[]; user: { name: string; role: string } }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const initials = user.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const isOn = (href: string) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(href + "/"));

  const body = (
    <>
      <div className="flex items-center gap-2.5 px-2 pb-4">
        <a href="/" target="_blank" rel="noopener" title="Open the website in a new tab" className="transition hover:opacity-85">
          <Image src="/iar-logo-white.png" alt="IAR — open the website" width={66} height={30} className="h-7.5 w-auto" priority />
        </a>
        <span className="rounded-md border border-[#FF8A99]/35 px-1.5 py-0.5 text-[10px] font-bold tracking-[0.14em] text-[#FF8A99]">CMS</span>
        <button type="button" onClick={() => setOpen(false)} className="ml-auto rounded-lg p-1 text-[#9494A0] lg:hidden" aria-label="Close menu"><X size={20} /></button>
      </div>
      <nav className="flex-1 overflow-y-auto pr-1">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="px-2.5 pb-1.5 pt-3.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#828290]">{g.label}</p>
            {g.items.map((i) => {
              const Icon = ICONS[i.icon];
              const on = isOn(i.href);
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.75 rounded-[10px] px-2.5 py-[8.5px] text-[13px] font-semibold ${on ? "bg-linear-to-r from-[#C8102E]/95 to-[#DA0B2A]/75 text-white shadow-[0_10px_24px_-12px_rgba(200,16,46,0.9)]" : "text-[#D6D6DB] hover:bg-white/6 hover:text-white"}`}
                >
                  <Icon size={17} className={on ? "text-white" : "text-[#9494A0]"} aria-hidden="true" />
                  <span>{i.label}</span>
                  {!!i.badge && <span className={`ml-auto rounded-full px-2 text-[11px] font-bold ${i.badgeTone === "red" ? "bg-[#EF4444] text-white" : "bg-white/10 text-white"}`}>{i.badge}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="mt-3 flex items-center gap-2.5 border-t border-white/8 px-2 pt-3.5">
        <div className="flex h-8.5 w-8.5 flex-none items-center justify-center rounded-full bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-[12.5px] font-bold text-white">{initials}</div>
        <Link href="/admin/account" className="min-w-0 leading-tight">
          <div className="truncate text-[12.5px] font-bold text-white">{user.name}</div>
          <div className="text-[11.5px] text-[#9494A0]">{user.role}</div>
        </Link>
        <form action={signOut} className="ml-auto">
          <button className="rounded-lg p-1.5 text-[#9494A0] hover:bg-white/10 hover:text-white" aria-label="Sign out" title="Sign out"><LogOut size={16} /></button>
        </form>
      </div>
    </>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="fixed left-3 top-3 z-40 rounded-xl bg-[#131316] p-2.5 text-white shadow-lg lg:hidden" aria-label="Open menu"><Menu size={20} /></button>
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-62 flex-col overflow-hidden bg-linear-to-b from-[#131316] to-[#1B1B1F] px-3.5 py-5 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 h-75 w-75 rounded-full bg-[radial-gradient(circle,rgba(200,16,46,0.35),transparent_65%)]" />
        <div className="relative flex min-h-0 flex-1 flex-col">{body}</div>
      </aside>
      {open && <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/40 lg:hidden" />}
    </>
  );
}
