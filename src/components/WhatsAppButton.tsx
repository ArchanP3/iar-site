"use client";

/* WhatsApp glyph from Simple Icons (CC0) */
const PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";

export function WhatsAppIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" className={className}>
      <path d={PATH} />
    </svg>
  );
}

/** url: the page this button is about (cards); empty = the page the visitor is on */
export type WhatsAppAsk = { topic: string; kind?: "part" | "brand" | "service"; url?: string };
export const WA_EVENT = "aq-wa-open";

/* Square WhatsApp button for cards and button rows. It opens the WhatsApp dialog
   (name + email first, so a lead is never lost), which then continues on WhatsApp. */
export default function WhatsAppButton({
  topic,
  kind,
  url,
  label = "Chat on WhatsApp",
  tone = "light",
  size = "md",
  className = "",
}: WhatsAppAsk & {
  label?: string;
  tone?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const box = size === "lg" ? "size-12 rounded-xl" : size === "sm" ? "size-9 rounded-lg" : "size-11 rounded-xl";
  const look =
    tone === "dark"
      ? "bg-[#25D366] text-white shadow-[0_8px_20px_-6px_rgba(37,211,102,0.75)] ring-1 ring-white/25 hover:scale-105 hover:bg-[#2BE06F]"
      : "bg-[#25D366] text-white shadow-[0_8px_18px_-8px_rgba(29,168,81,0.8)] hover:scale-105 hover:bg-[#1FC15B]";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent<WhatsAppAsk>(WA_EVENT, { detail: { topic, kind, url } }));
      }}
      aria-label={label}
      title={label}
      className={`inline-grid flex-none place-items-center transition ${box} ${look} ${className}`}
    >
      <WhatsAppIcon size={size === "lg" ? 22 : size === "sm" ? 17 : 19} />
    </button>
  );
}

/* Any element styled by the caller (a text link, a wide button) that opens the same WhatsApp dialog. */
export function WhatsAppTrigger({
  topic,
  kind,
  url,
  className = "",
  children,
  label,
}: WhatsAppAsk & { className?: string; children: React.ReactNode; label?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent<WhatsAppAsk>(WA_EVENT, { detail: { topic, kind, url } }));
      }}
      className={className}
    >
      {children}
    </button>
  );
}

/* Wide "WhatsApp" button for call-to-action rows, same height as the site's other CTA buttons. */
export function WhatsAppCta({ topic, kind, url, label = "WhatsApp", className = "" }: WhatsAppAsk & { label?: string; className?: string }) {
  return (
    <WhatsAppTrigger
      topic={topic}
      kind={kind}
      url={url}
      className={`inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#25D366] px-6 text-[15px] font-semibold text-white shadow-[0_14px_30px_-14px_rgba(37,211,102,0.9)] transition hover:-translate-y-0.5 hover:bg-[#1FC15B] ${className}`}
    >
      <WhatsAppIcon size={18} /> {label}
    </WhatsAppTrigger>
  );
}
