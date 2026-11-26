"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useContact } from "@/components/cms/ContactProvider";
import { brandFont } from "@/lib/font";
import { WhatsAppIcon, WhatsAppTrigger } from "@/components/WhatsAppButton";
import { contact, phoneHref } from "@/lib/contact";
import PartSuggest from "@/components/search/PartSuggest";
import {
  Mail,
  Phone,
  Search,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  ArrowUpRight,
  Wrench,
  FileText,
  Cpu,
  Gauge,
  Monitor,
  CircuitBoard,
  Zap,
  Cog,
  RefreshCcw,
  Layers,
  ShieldCheck,
  MapPin,
  BookOpen,
  BookText,
  HelpCircle,
  Calculator,
  Scale,
  ScanSearch,
  Route,
  PackageCheck,
  FileCheck2,
  AlertTriangle,
  ShoppingCart,
  HardHat,
  HandCoins,
  Globe2 } from "lucide-react";
import { cartCount, useCart } from "@/lib/cart";
import FaultCodeSearch from "@/components/fault-codes/FaultCodeSearch";
import { categoryIcon } from "@/components/parts/categoryIcons";
import { categories, categoryUrl } from "@/lib/parts/categories";


/* ------------------------------------------------------------------ */
/*  Menu content — edit text and links here                            */
/* ------------------------------------------------------------------ */

type MenuLink = { label: string; href: string; note?: string; icon?: React.ElementType; soon?: boolean };
type MenuGroup = {
  label: string;
  href: string;
  intro: string;
  links: MenuLink[];
  columns?: number;
  /** Headed columns instead of one list (used by Resources) */
  sections?: { title: string; links: MenuLink[] }[];
  /** Shop Parts: "Shop by manufacturer" column next to the categories */
  brands?: { links: MenuLink[]; all: MenuLink };
  /** search: the feature card holds the fault code search box */
  feature: { eyebrow: string; title: string; text: string; cta: string; href: string; search?: boolean; partSearch?: boolean };
};

const groups: MenuGroup[] = [
  {
    label: "Shop Parts",
    href: "/shop",
    intro: "New, surplus and refurbished industrial automation parts.",
    // Built from the shop categories, so new categories show up here too.
    links: [
      ...categories.map((c) => ({ label: c.name, href: categoryUrl(c.slug), icon: categoryIcon(c.slug) })),
      { label: "All parts", href: "/shop?page=1", icon: Layers },
    ],
    brands: {
      links: [
        { label: "Siemens", href: "/shop/brands/siemens" },
        { label: "Allen-Bradley", href: "/shop/brands/allen-bradley" },
        { label: "Rexroth Indramat", href: "/shop/brands/rexroth-indramat" },
        { label: "Fanuc", href: "/shop/brands/fanuc" },
        { label: "Yaskawa", href: "/shop/brands/yaskawa" },
        { label: "Mitsubishi Electric", href: "/shop/brands/mitsubishi" },
        { label: "ABB", href: "/shop/brands/abb" },
        { label: "Schneider Electric", href: "/shop/brands/schneider" },
        { label: "Omron", href: "/shop/brands/omron" },
        { label: "Beckhoff", href: "/shop/brands/beckhoff" },
        { label: "Kollmorgen", href: "/shop/brands/kollmorgen" },
        { label: "Lenze", href: "/shop/brands/lenze" },
      ],
      all: { label: "All manufacturers A–Z", href: "/shop/brands" },
    },
    feature: {
      eyebrow: "Shop online",
      title: "Find any part",
      text: "Search by manufacturer, model or part number. In-stock parts with a price can be bought online.",
      cta: "Browse all parts",
      href: "/shop?page=1",
      partSearch: true,
    },
  },
  {
    label: "Repair Services",
    href: "/services",
    intro: "Expert repair, testing and exchange for critical equipment. Every repair, load tested.",
    links: [
      { label: "Servo Drive Repair", href: "/services/servo-drive-repair", icon: Zap },
      { label: "Servo Motor Repair", href: "/services/servo-motor-repair", icon: Cog },
      { label: "Encoder Repair & Alignment", href: "/services/encoder-repair", icon: Gauge },
      { label: "HMI Repair", href: "/services/hmi-repair", icon: Monitor },
      { label: "PLC Repair", href: "/services/plc-repair", icon: Cpu },
      { label: "Power Supply Repair", href: "/services/power-supply-repair", icon: Zap },
      { label: "CNC Control Repair", href: "/services/cnc-repair", icon: CircuitBoard },
      { label: "Exchange Program", href: "/services/exchange", icon: RefreshCcw },
    ],
    feature: {
      eyebrow: "Free evaluation",
      title: "Equipment down?",
      text: "Send it in for a no-obligation assessment.",
      cta: "Request a repair",
      href: "/request-repair",
    },
  },
  {
    label: "Brands",
    href: "/brands",
    intro: "Multi-brand expertise from one trusted source.",
    columns: 4,
    links: [
      { label: "Siemens", href: "/brands/siemens" },
      { label: "Allen-Bradley", href: "/brands/allen-bradley" },
      { label: "Rexroth Indramat", href: "/brands/rexroth-indramat" },
      { label: "Fanuc", href: "/brands/fanuc" },
      { label: "Yaskawa", href: "/brands/yaskawa" },
      { label: "Mitsubishi Electric", href: "/brands/mitsubishi" },
      { label: "ABB", href: "/brands/abb" },
      { label: "Schneider Electric", href: "/brands/schneider" },
      { label: "Omron", href: "/brands/omron" },
      { label: "Beckhoff", href: "/brands/beckhoff" },
      { label: "Lenze", href: "/brands/lenze" },
      { label: "Kollmorgen", href: "/brands/kollmorgen" },
      { label: "Baldor", href: "/brands/baldor" },
      { label: "Parker", href: "/brands/parker" },
      { label: "Moog", href: "/brands/moog" },
      { label: "Pro-face", href: "/brands/pro-face" },
    ],
    feature: {
      eyebrow: "Don't see your brand?",
      title: "We work with more",
      text: "Tell us the model and we'll check it for you.",
      cta: "View all brands",
      href: "/brands",
    },
  },
  {
    label: "Industries",
    href: "/industries",
    intro: "Keeping production running across North America.",
    links: [
      { label: "Automotive", href: "/industries/automotive" },
      { label: "Packaging", href: "/industries/packaging" },
      { label: "Plastics & Thermoforming", href: "/industries/plastics" },
      { label: "Food & Beverage", href: "/industries/food-beverage" },
      { label: "Metalworking & CNC", href: "/industries/metalworking" },
      { label: "Printing", href: "/industries/printing" },
      { label: "Pharmaceutical", href: "/industries/pharmaceutical" },
      { label: "Material Handling", href: "/industries/material-handling" },
    ],
    feature: {
      eyebrow: "Your industry",
      title: "Reduce downtime",
      text: "Repair, replacement and sourcing for your line.",
      cta: "Ask a technician",
      href: "/request-repair?service=question",
    },
  },
];

/* Resources menu (add soon: true to a link to show a "Soon" badge instead of a link) */
groups.push({
  label: "Resources",
  href: "/resources",
  intro: "Guides, tools and answers from our repair technicians.",
  links: [],
  sections: [
    {
      title: "Learn",
      links: [
        { label: "Fault Code Library", href: "/fault-codes", note: "2,000+ codes explained", icon: AlertTriangle },
        { label: "Blog & Guides", href: "/resources/blog", note: "From our repair bench", icon: BookOpen },
        { label: "Glossary", href: "/resources/glossary", note: "Terms in plain English", icon: BookText },
        { label: "FAQs", href: "/resources/faqs", note: "Quick answers", icon: HelpCircle },
      ],
    },
    {
      title: "Tools",
      links: [
        { label: "Downtime Cost Calculator", href: "/resources/downtime-calculator", note: "What waiting really costs", icon: Calculator },
        { label: "Repair or Replace Advisor", href: "/resources/repair-or-replace", note: "Five quick questions", icon: Scale },
        { label: "Part Number Checker", href: "/resources/part-checker", note: "Stock, exchange & repair", icon: ScanSearch },
      ],
    },
    {
      title: "Working With Us",
      links: [
        { label: "Repair Process", href: "/#how-we-work", note: "From check-in to test report", icon: Route },
        { label: "How to Ship Us a Unit", href: "/resources/shipping", note: "Packing & pickups", icon: PackageCheck },
        { label: "Service Areas", href: "/service-areas", note: "All 50 states", icon: MapPin },
        { label: "International Orders", href: "/international", note: "Parts shipped worldwide", icon: Globe2 },
        { label: "On-site Service", href: "/on-site-service", note: "Technician at your plant", icon: HardHat },
        { label: "Sell Your Surplus", href: "/sell-surplus", note: "Send a list, get an offer", icon: HandCoins },
        { label: "Warranty, Terms & Privacy", href: "/warranty", note: "Our policies", icon: FileCheck2 },
      ],
    },
  ],
  feature: {
    eyebrow: "Machine down?",
    title: "Type your fault code",
    text: "Plain-English meaning, causes and safe checks.",
    cta: "Open the library",
    href: "/fault-codes",
    search: true,
  },
});

const simpleLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/* ------------------------------------------------------------------ */

export default function Header() {
  const { strip, email, phone } = useContact();
  const mail = email || contact.email;
  const [open, setOpen] = useState<string | null>(null); // which dropdown is open
  const [menuOpen, setMenuOpen] = useState(false); // mobile drawer
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const count = cartCount(useCart());
  const closeTimer = useRef<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Shrinks after 60px, grows back only near the very top (under 10px).
    // The gap stops the header shaking when it changes size.
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled((prev) => (y > 60 ? true : y < 10 ? false : prev));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // lock page scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const openMenu = (label: string) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(label);
  };
  const closeSoon = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(null), 140);
  };

  const active = groups.find((g) => g.label === open);

  // One link in the desktop mega menu. "soon" links show a badge and are not clickable yet.
  const menuItem = (l: MenuLink) => {
    const Icon = l.icon;
    const body = (
      <>
        {Icon && (
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F7F7F8] ring-1 ring-[#C8102E]/10 transition ${l.soon ? "text-[#696976]" : "text-[#B30E29] group-hover:bg-[#C8102E] group-hover:text-white"}`}>
            <Icon size={19} />
          </span>
        )}
        <span className="min-w-0">
          <span className={`flex items-center gap-2 text-[15px] font-semibold ${l.soon ? "text-[#696976]" : "text-[#131316] group-hover:text-[#B30E29]"}`}>
            {l.label}
            {l.soon && <span className="rounded-full bg-[#F5F5F6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#696976]">Soon</span>}
          </span>
          {l.note && <span className="block text-[13px] text-[#696976]">{l.note}</span>}
        </span>
      </>
    );
    return l.soon ? (
      <div key={l.label} className="flex cursor-default items-center gap-3.5 rounded-xl px-3 py-2.5" aria-disabled="true">{body}</div>
    ) : (
      <Link key={l.label} href={l.href} onClick={() => setOpen(null)} className="group flex items-center gap-3.5 rounded-xl px-3 py-2.5 transition hover:bg-[#F7F7F8]">
        {body}
      </Link>
    );
  };

  return (
    <header className={`${brandFont.className} sticky top-0 z-50`}>
      {/* ---------- TOP STRIP ---------- */}
      <div className="hidden bg-[#060607] text-[12.5px] text-white/70 md:block">
        <div className="mx-auto flex h-10 max-w-360 items-center justify-between px-5 sm:px-8 lg:px-12">
          <p className="mr-6 hidden items-center gap-2 whitespace-nowrap min-[1400px]:flex">
            {strip && <MapPin size={14} className="text-[#FF3B55]" />}
            {strip}
          </p>
          <div className="ml-auto flex items-center gap-5 whitespace-nowrap">
            <a href={`mailto:${mail}`} className="flex items-center gap-1.5 font-medium text-white/80 transition hover:text-white">
              <Mail size={13} className="text-[#FF3B55]" aria-hidden="true" />
              {mail}
            </a>
            {phone && (
              <a href={phoneHref(phone)} className="flex items-center gap-1.5 font-medium text-white/80 transition hover:text-white">
                <Phone size={13} className="text-[#FF3B55]" aria-hidden="true" />
                {phone}
              </a>
            )}
            <WhatsAppTrigger topic="A question from the website" label="Chat on WhatsApp" className="-mx-1 grid size-7 place-items-center rounded-md transition hover:bg-white/10">
              <WhatsAppIcon size={16} className="text-[#25D366]" />
            </WhatsAppTrigger>
            <span className="hidden h-3.5 w-px bg-white/15 xl:block" aria-hidden="true" />
            <span className="hidden items-center gap-2 xl:flex">
              <ShieldCheck size={14} className="text-[#FF3B55]" />
              Free evaluation on every repair
            </span>
          </div>
        </div>
      </div>

      {/* ---------- MAIN BAR ---------- */}
      <div
        className={`relative border-b transition-all duration-300 ${
          scrolled
            ? "border-[#EAEAEC] bg-white shadow-[0_10px_30px_-18px_rgba(19,19,22,0.35)]"
            : "border-transparent bg-white"
        }`}
        onMouseLeave={closeSoon}
      >
        <div
          className={`mx-auto flex max-w-360 items-center justify-between gap-3 px-5 sm:gap-6 xl:gap-3 min-[1440px]:gap-6 transition-all duration-300 sm:px-8 lg:px-12 ${
            scrolled ? "h-18" : "h-22"
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            aria-label="IAR Home"
            className="shrink-0"
            onMouseEnter={closeSoon}
            onClick={(e) => {
              if (window.location.pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
                history.replaceState(null, "", "/");
              }
            }}
          >
            <Image
              src="/iar-logo.png"
              alt="Industrial Automation Repair Inc."
              width={988}
              height={448}
              sizes="(max-width: 640px) 120px, 150px"
              className={`h-auto transition-all duration-300 ${scrolled ? "w-24 sm:w-28 lg:w-30" : "w-28 sm:w-32 lg:w-36"}`}
              priority
            />
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Main navigation" className="hidden h-full items-center xl:flex">
            {groups.map((g) => {
              const isOpen = open === g.label;
              return (
                <div key={g.label} className="flex h-full items-center" onMouseEnter={() => openMenu(g.label)}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : g.label)}
                    className={`group relative flex h-full items-center gap-1.5 whitespace-nowrap px-2 text-[14.5px] font-semibold xl:px-1.5 transition-colors min-[1440px]:px-3 min-[1440px]:text-[15px] ${
                      isOpen ? "text-[#B30E29]" : "text-[#131316] hover:text-[#B30E29]"
                    }`}
                  >
                    {g.label}
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                    <span
                      className={`absolute inset-x-2 bottom-0 h-0.75 rounded-t-full bg-linear-to-r from-[#C8102E] to-[#FF3B55] transition-transform duration-300 ${
                        isOpen ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
            {simpleLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onMouseEnter={closeSoon}
                className="group relative flex h-full items-center whitespace-nowrap px-2 text-[14.5px] font-semibold xl:px-1.5 text-[#131316] transition-colors hover:text-[#B30E29] min-[1440px]:px-3 min-[1440px]:text-[15px]"
              >
                {l.label}
                <span className="absolute inset-x-2 bottom-0 h-0.75 origin-left scale-x-0 rounded-t-full bg-linear-to-r from-[#C8102E] to-[#FF3B55] transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2" onMouseEnter={closeSoon}>
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search parts"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[#131316] transition hover:bg-[#F7F7F8] hover:text-[#B30E29]"
            >
              {searchOpen ? <X size={21} /> : <Search size={21} />}
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label={count ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart"}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl text-[#131316] transition hover:bg-[#F7F7F8] hover:text-[#B30E29]"
            >
              <ShoppingCart size={21} />
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4.75 min-w-4.75 items-center justify-center rounded-full bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-1 text-[11px] font-bold text-white ring-2 ring-white">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>

            <Link
              href="/request-quote"
              className="hidden h-11 items-center gap-2 whitespace-nowrap rounded-xl border border-[#D6D6DB] px-5 text-[15px] font-semibold text-[#131316] transition hover:border-[#C8102E] hover:text-[#B30E29] lg:inline-flex xl:hidden min-[1720px]:inline-flex"
            >
              <FileText size={17} />
              Request a Quote
            </Link>

            <Link
              href="/request-repair"
              className="hidden h-11 items-center gap-2 whitespace-nowrap rounded-xl bg-linear-to-br from-[#C8102E] to-[#E30C2C] px-5 text-[15px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(200,16,46,0.7)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-10px_rgba(200,16,46,0.8)] sm:inline-flex"
            >
              <Wrench size={17} />
              <span>
                <span className="xl:hidden min-[1536px]:inline">Request a </span>Repair
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[#131316] transition hover:bg-[#F7F7F8] xl:hidden"
            >
              <Menu size={26} />
            </button>
          </div>
        </div>

        {/* ---------- MEGA MENU (desktop) ---------- */}
        <div
          className={`absolute inset-x-0 top-full hidden origin-top transition-all duration-300 xl:block ${
            active ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
          }`}
          onMouseEnter={() => active && openMenu(active.label)}
          onMouseLeave={closeSoon}
        >
          {active && (
            <div className="border-b border-[#EAEAEC] bg-white shadow-[0_30px_60px_-30px_rgba(19,19,22,0.35)]">
              <div className="mx-auto grid max-w-360 grid-cols-[1fr_320px] gap-10 px-12 py-9">
                <div>
                  <div className="mb-6 flex items-end justify-between border-b border-[#F2F2F3] pb-5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B30E29]">
                        {active.label}
                      </p>
                      <p className="mt-1.5 text-[15px] text-[#62626F]">{active.intro}</p>
                    </div>
                    <Link
                      href={active.href}
                      onClick={() => setOpen(null)}
                      className="group flex items-center gap-1.5 text-sm font-semibold text-[#131316] hover:text-[#B30E29]"
                    >
                      View all
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>

                  {active.brands ? (
                    <div className="grid grid-cols-[1.55fr_1fr] gap-x-8">
                      <div>
                        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#696976]">Shop by category</p>
                        <div className="grid grid-cols-2 gap-x-2">
                          {active.links.map((l) => {
                            const Icon = l.icon;
                            return (
                              <Link key={l.label} href={l.href} onClick={() => setOpen(null)} className="group flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-[#F7F7F8]">
                                {Icon && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F7F7F8] text-[#B30E29] ring-1 ring-[#C8102E]/10 transition group-hover:bg-[#C8102E] group-hover:text-white"><Icon size={16} /></span>}
                                <span className="text-[14.5px] font-semibold text-[#131316] group-hover:text-[#B30E29]">{l.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                      <div className="border-l border-[#F2F2F3] pl-8">
                        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#696976]">Shop by manufacturer</p>
                        <div className="grid grid-cols-2 gap-x-2">
                          {active.brands.links.map((l) => (
                            <Link key={l.label} href={l.href} onClick={() => setOpen(null)} className="rounded-xl px-3 py-2.5 text-[14.5px] font-semibold text-[#131316] transition hover:bg-[#F7F7F8] hover:text-[#B30E29]">{l.label}</Link>
                          ))}
                        </div>
                        <Link href={active.brands.all.href} onClick={() => setOpen(null)} className="group mt-2 inline-flex items-center gap-1.5 px-3 text-sm font-bold text-[#B30E29]">
                          {active.brands.all.label}
                          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  ) : active.sections ? (
                    <div className="grid grid-cols-3 gap-x-6">
                      {active.sections.map((sec) => (
                        <div key={sec.title}>
                          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#696976]">{sec.title}</p>
                          <div className="grid gap-y-1">{sec.links.map(menuItem)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`grid gap-x-6 gap-y-1 ${active.columns === 4 ? "grid-cols-4" : "grid-cols-2"}`}>
                      {active.links.map(menuItem)}
                    </div>
                  )}
                </div>

                {/* Feature card */}
                {active.feature.partSearch ? (
                  <div className="relative flex flex-col justify-end rounded-2xl bg-[#060607] p-7 text-white">
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                      <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,#C8102E_0%,#5E0D1A_40%,transparent_75%)] opacity-90" />
                      <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-white/10" />
                    </span>
                    <span className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FF8A99]">{active.feature.eyebrow}</span>
                    <span className="relative mt-2 text-2xl font-extrabold leading-tight">{active.feature.title}</span>
                    <span className="relative mt-2 text-sm leading-relaxed text-white/70">{active.feature.text}</span>
                    <form action="/shop" method="get" role="search" onSubmit={() => setOpen(null)} className="relative mt-4 flex gap-2">
                      <label htmlFor="menu-part-search" className="sr-only">Part number or name</label>
                      <input id="menu-part-search" name="q" required minLength={2} placeholder="Part number or name" autoComplete="off" className="h-11 min-w-0 flex-1 rounded-xl bg-white px-3 text-[15px] text-[#131316] outline-none placeholder:text-[#888895]" />
                      <button type="submit" className="h-11 rounded-xl bg-[#C8102E] px-4 text-sm font-bold transition hover:bg-[#F31D3D]">Go</button>
                    </form>
                    <Link href={active.feature.href} onClick={() => setOpen(null)} className="relative mt-4 inline-flex items-center gap-2 text-sm font-semibold hover:text-[#FF8A99]">
                      {active.feature.cta} <ArrowUpRight size={16} />
                    </Link>
                  </div>
                ) : active.feature.search ? (
                  <div className="relative flex flex-col justify-end rounded-2xl bg-[#060607] p-7 text-white">
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                      <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,#C8102E_0%,#5E0D1A_40%,transparent_75%)] opacity-90" />
                      <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-white/10" />
                    </span>
                    <span className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FF8A99]">{active.feature.eyebrow}</span>
                    <span className="relative mt-2 text-2xl font-extrabold leading-tight">{active.feature.title}</span>
                    <span className="relative mt-2 text-sm leading-relaxed text-white/70">{active.feature.text}</span>
                    <div className="relative mt-4">
                      <FaultCodeSearch inputId="menu-fault-code-search" placeholder="e.g. F30001" button="Go" compact />
                    </div>
                    <Link href={active.feature.href} onClick={() => setOpen(null)} className="relative mt-4 inline-flex items-center gap-2 text-sm font-semibold hover:text-[#FF8A99]">
                      {active.feature.cta} <ArrowUpRight size={16} />
                    </Link>
                  </div>
                ) : (
                <Link
                  href={active.feature.href}
                  onClick={() => setOpen(null)}
                  className="group relative flex flex-col justify-end overflow-hidden rounded-2xl bg-[#060607] p-7 text-white"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,#C8102E_0%,#5E0D1A_40%,transparent_75%)] opacity-90 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-white/10"
                  />
                  <span className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FF8A99]">
                    {active.feature.eyebrow}
                  </span>
                  <span className="relative mt-2 text-2xl font-extrabold leading-tight">{active.feature.title}</span>
                  <span className="relative mt-2 text-sm leading-relaxed text-white/70">{active.feature.text}</span>
                  <span className="relative mt-5 inline-flex items-center gap-2 text-sm font-semibold">
                    {active.feature.cta}
                    <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ---------- SEARCH PANEL ---------- */}
        <div
          className={`absolute inset-x-0 top-full overflow-hidden border-b border-[#EAEAEC] bg-white transition-all duration-300 ${
            searchOpen ? "max-h-40 opacity-100" : "max-h-0 border-transparent opacity-0"
          }`}
        >
          <form
            action="/search"
            className="mx-auto flex max-w-225 items-center gap-3 px-5 py-6"
            onSubmit={() => setSearchOpen(false)}
          >
            <div data-suggest-anchor className="flex flex-1 items-center gap-3 rounded-2xl border border-[#E3E3E7] bg-[#FAFAFB] px-5 focus-within:border-[#C8102E]/60 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(200,16,46,0.1)]">
              <Search size={20} className="shrink-0 text-[#B30E29]" />
              <PartSuggest
                ref={searchRef}
                name="part"
                placeholder="Search manufacturer, model or part number"
                className="h-14 w-full bg-transparent text-base text-[#131316] outline-none placeholder:text-[#9D9DA8]"
              />
            </div>
            <button
              type="submit"
              className="h-14 rounded-2xl bg-[#131316] px-6 font-semibold text-white transition hover:bg-[#C8102E]"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* ---------- MOBILE DRAWER ---------- */}
      <div
        className={`fixed inset-0 z-60 xl:hidden ${menuOpen ? "visible" : "invisible"}`}
        aria-hidden={!menuOpen}
      >
        <div
          className={`absolute inset-0 bg-[#060607]/60 transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMenuOpen(false)}
        />
        <nav
          aria-label="Mobile navigation"
          className={`absolute inset-y-0 right-0 flex w-full max-w-105 flex-col bg-white shadow-2xl transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-19 items-center justify-between border-b border-[#F2F2F3] px-5">
            <Image src="/iar-logo.png" alt="Industrial Automation Repair Inc." width={988} height={448} sizes="140px" className="h-auto w-32" />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[#131316] hover:bg-[#F7F7F8]"
            >
              <X size={26} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between border-b border-[#F2F2F3] py-4 text-[17px] font-semibold text-[#131316]"
            >
              Home
            </Link>

            {groups.map((g) => {
              const isOpen = mobileGroup === g.label;
              return (
                <div key={g.label} className="border-b border-[#F2F2F3]">
                  <button
                    type="button"
                    onClick={() => setMobileGroup(isOpen ? null : g.label)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between py-4 text-left text-[17px] font-semibold text-[#131316]"
                  >
                    {g.label}
                    <ChevronDown
                      size={20}
                      className={`text-[#696976] transition-transform duration-300 ${isOpen ? "rotate-180 text-[#B30E29]" : ""}`}
                    />
                  </button>
                  <div
                    className={`grid overflow-hidden transition-all duration-300 ${
                      isOpen ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="min-h-0">
                      {g.sections?.map((sec) => (
                        <div key={sec.title} className="mb-2">
                          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#696976]">{sec.title}</p>
                          {sec.links.map((l) =>
                            l.soon ? (
                              <span key={l.label} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[15px] text-[#696976]">
                                {l.label}
                                <span className="rounded-full bg-[#F5F5F6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]">Soon</span>
                              </span>
                            ) : (
                              <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-[15px] text-[#62626F] hover:bg-[#F7F7F8] hover:text-[#B30E29]">
                                {l.label}
                              </Link>
                            ),
                          )}
                        </div>
                      ))}
                      {g.brands && <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#696976]">Shop by category</p>}
                      <div className={`grid gap-1 ${g.columns === 4 || g.brands ? "grid-cols-2" : "grid-cols-1"}`}>
                        {g.links.map((l) => (
                          <Link
                            key={l.label}
                            href={l.href}
                            onClick={() => setMenuOpen(false)}
                            className="rounded-lg px-3 py-2.5 text-[15px] text-[#62626F] hover:bg-[#F7F7F8] hover:text-[#B30E29]"
                          >
                            {l.label}
                          </Link>
                        ))}
                      </div>
                      {g.brands && (
                        <div className="mt-2">
                          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#696976]">Shop by manufacturer</p>
                          <div className="grid grid-cols-2 gap-1">
                            {[...g.brands.links, g.brands.all].map((l) => (
                              <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-[15px] text-[#62626F] hover:bg-[#F7F7F8] hover:text-[#B30E29]">
                                {l.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      <Link
                        href={g.href}
                        onClick={() => setMenuOpen(false)}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 text-sm font-semibold text-[#B30E29]"
                      >
                        View all {g.label.toLowerCase()}
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {simpleLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between border-b border-[#F2F2F3] py-4 text-[17px] font-semibold text-[#131316]"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="grid gap-3 border-t border-[#F2F2F3] p-5">
            <Link
              href="/request-repair"
              onClick={() => setMenuOpen(false)}
              className="flex h-13 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#E30C2C] font-semibold text-white"
            >
              <Wrench size={18} />
              Request a Repair
            </Link>
            <Link
              href="/request-quote"
              onClick={() => setMenuOpen(false)}
              className="flex h-13 items-center justify-center gap-2 rounded-xl border border-[#D6D6DB] font-semibold text-[#131316]"
            >
              <FileText size={18} />
              Request a Quote
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}