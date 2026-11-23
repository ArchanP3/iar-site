"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, Lock, Pencil, TriangleAlert, Unlock, X } from "lucide-react";
import { saveMinPrices, saveProductForm, setProductPrice, unlockProductField } from "@/app/admin/(app)/parts/actions";
import { Alert, b, cx, input } from "./ui";

/** Price in the list: click to change, Enter to save, Esc to cancel. Empty = Request Quote. */
export function PriceCell({ id, price, display, locked }: { id: number; price: string | null; display: string; locked: boolean }) {
  const [editing, setEditing] = useState(false);
  const [shown, setShown] = useState(display);
  // Show the server's latest price after a bulk change, Undo or refresh (not the first one seen).
  const [lastDisplay, setLastDisplay] = useState(display);
  if (display !== lastDisplay) {
    setLastDisplay(display);
    setShown(display);
  }
  const [err, setErr] = useState<string>();
  const [pending, start] = useTransition();
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const save = () =>
    start(async () => {
      const r = await setProductPrice(id, ref.current?.value ?? "");
      if (r.error) return setErr(r.error);
      setErr(undefined);
      setShown(r.display ?? shown);
      setEditing(false);
      router.refresh();
    });
  if (!editing)
    return (
      <button type="button" onClick={() => setEditing(true)} className="group inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-left hover:bg-[#F0F6FF]" title="Change price" aria-label={`Change price, now ${shown}`}>
        <span className={cx("text-[13px] font-bold", price == null && "font-semibold text-[#5B6B84]")}>{shown}</span>
        {locked && <Lock size={11} className="text-[#B45309]" aria-label="Edited in the CMS: imports won't change it" />}
        <Pencil size={11} className="text-[#8494AB] opacity-0 group-hover:opacity-100" />
      </button>
    );
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <span className="text-[12px] font-semibold text-[#5B6B84]">US$</span>
        <input
          ref={ref}
          autoFocus
          defaultValue={price ? Number(price).toFixed(2) : ""}
          placeholder="Quote"
          inputMode="decimal"
          aria-label="New price in US dollars"
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); save(); }
            if (e.key === "Escape") { setEditing(false); setErr(undefined); }
          }}
          className={cx(input, "h-8! w-24! py-1! text-[12.8px] font-semibold")}
        />
        <button type="button" disabled={pending} onClick={save} className="flex h-7 w-7 items-center justify-center rounded-md bg-[#12B76A] text-white disabled:opacity-50" title="Save" aria-label="Save price"><Check size={14} /></button>
        <button type="button" onClick={() => { setEditing(false); setErr(undefined); }} className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EEF2F7] text-[#5B6B84]" title="Cancel" aria-label="Cancel"><X size={14} /></button>
      </div>
      <span className={cx("max-w-56 text-[11.5px]", err ? "font-semibold text-[#B42318]" : "text-[#8494AB]")}>{err ?? "Enter to save · empty = Request Quote"}</span>
    </div>
  );
}

/** "Locked" mark with an Unlock button, shown next to a field edited in the CMS. */
export function LockMark({ id, field, bare = false }: { id: number; field: string; bare?: boolean }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string>();
  const router = useRouter();
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#B45309]">
      {!bare && <><Lock size={11} /> Locked</>}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await unlockProductField(id, field);
            if (r.error) setErr(r.error);
            else router.refresh();
          })
        }
        className="inline-flex items-center gap-1 rounded-md border border-[#FEDF89] bg-white px-1.5 py-0.5 text-[11px] font-bold text-[#93370D] hover:bg-[#FFFAEB] disabled:opacity-50"
        title="Let the CSV and catalog imports update this field again"
        aria-label={bare ? `Unlock ${field.replace(/_/g, " ")}` : undefined}
      >
        <Unlock size={10} /> Unlock
      </button>
      {err && <span className="text-[#B42318]">{err}</span>}
    </span>
  );
}

export type EditorProduct = {
  id: number;
  title: string | null;
  description: string | null;
  sku: string | null;
  price: string | null;
  condition: string | null;
  availability: string | null;
  stock_qty: number | null;
  warranty: string | null;
  ebay_item_id: string | null;
  tab_specifications: string | null;
  category: string | null;
  category_slug: string | null;
  cms_locked: string[];
};

const CONDITIONS = ["New", "Refurbished", "Used", "New Surplus"];
const AVAILABILITY: [string, string][] = [["InStock", "In stock"], ["LimitedAvailability", "Limited availability"], ["OutOfStock", "Out of stock"], ["PreOrder", "Pre-order"], ["BackOrder", "Back order"]];

/** Edit form for one product. Only the fields that change are saved (and locked). */
export function ProductEditor({ p, cats }: { p: EditorProduct; cats: { slug: string; name: string }[] }) {
  const [state, action, pending] = useActionState(saveProductForm, undefined);
  const locked = new Set(p.cms_locked);
  /* The field name is the <label>; the Locked mark and its Unlock button sit next to it, outside
     the label, so clicking Unlock never focuses the input and screen readers read them apart. */
  const label = (f: string, name: string) => (
    <span className="flex min-h-6 flex-wrap items-center gap-2">
      <label htmlFor={`f-${f}`} className="text-[12.5px] font-bold">{name}</label>
      {locked.has(f) && <LockMark id={p.id} field={f} />}
    </span>
  );
  const hint = (t: string) => <span className="text-[11.5px] text-[#8494AB]">{t}</span>;
  const withCurrent = (opts: string[], cur: string | null) => (cur && !opts.includes(cur) ? [cur, ...opts] : opts);
  // After a save the page gets the new values; remounting the fields shows them (inputs keep
  // their first defaultValue otherwise). The success message lives outside, so it stays.
  const version = JSON.stringify(p);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={p.id} />
      <div key={version} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">{label("title", "Title")}<input id="f-title" name="title" required defaultValue={p.title ?? ""} className={input} /></div>
      <div className="flex flex-col gap-1.5">
        {label("category", "Category")}
        <select id="f-category" name="category" defaultValue={p.category_slug ?? ""} className={input}>
          <option value="">No category</option>
          {p.category_slug && !cats.some((c) => c.slug === p.category_slug) && <option value={p.category_slug}>{p.category}</option>}
          {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        {hint("Moves the listing to another shop category. The page URL stays the same.")}
      </div>
      <div className="grid items-start gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          {label("price", "Price (US$)")}
          <input id="f-price" name="price" defaultValue={p.price ? Number(p.price).toFixed(2) : ""} inputMode="decimal" placeholder="Request Quote" className={input} />
          {hint("Empty = Request Quote")}
        </div>
        <div className="flex flex-col gap-1.5">
          {label("condition", "Condition")}
          <select id="f-condition" name="condition" defaultValue={p.condition ?? ""} className={input}>
            <option value="">Not set</option>
            {withCurrent(CONDITIONS, p.condition).map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          {label("availability", "Availability")}
          <select id="f-availability" name="availability" defaultValue={p.availability ?? ""} className={input}>
            <option value="">Not set</option>
            {(p.availability && !AVAILABILITY.some(([v]) => v === p.availability) ? [[p.availability, p.availability] as [string, string], ...AVAILABILITY] : AVAILABILITY).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>
      <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">{label("stock_qty", "Stock")}<input id="f-stock_qty" name="stock_qty" defaultValue={p.stock_qty ?? ""} inputMode="numeric" className={input} />{hint("Empty = not tracked")}</div>
        <div className="flex flex-col gap-1.5">{label("warranty", "Warranty")}<input id="f-warranty" name="warranty" defaultValue={p.warranty ?? ""} placeholder="12 months" className={input} /></div>
        <div className="flex flex-col gap-1.5">{label("sku", "SKU")}<input id="f-sku" name="sku" defaultValue={p.sku ?? ""} className={cx(input, "font-mono text-[12.8px]")} /></div>
        <div className="flex flex-col gap-1.5">{label("ebay_item_id", "eBay item ID")}<input id="f-ebay_item_id" name="ebay_item_id" defaultValue={p.ebay_item_id ?? ""} className={cx(input, "font-mono text-[12.8px]")} /></div>
      </div>
      <div className="flex flex-col gap-1.5">{label("description", "Description")}<textarea id="f-description" name="description" defaultValue={p.description ?? ""} rows={5} className={input} /></div>
      <div className="flex flex-col gap-1.5">
        {label("tab_specifications", "Specifications")}
        <textarea id="f-tab_specifications" name="tab_specifications" defaultValue={(p.tab_specifications ?? "").split("|").map((l) => l.trim()).filter(Boolean).join("\n")} rows={4} className={cx(input, "font-mono text-[12.5px]")} />
        {hint("One per line, like Series: 1FK7")}
      </div>
      </div>
      {state?.error && <Alert tone="bad" icon={<TriangleAlert size={16} />}>{state.error}</Alert>}
      {state?.ok && <Alert tone="ok" icon={<CheckCircle2 size={16} />}>{state.ok}</Alert>}
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className={b("primary")}>{pending ? "Saving…" : "Save changes"}</button>
        <span className="text-[12.5px] text-[#5B6B84]">Fields you change get a <Lock size={11} className="inline text-[#B45309]" /> lock, so the CSV and catalog imports won&apos;t overwrite them.</span>
      </div>
    </form>
  );
}

/** Minimum expected price per category, for the Low price filter. Admins only. */
export function MinPricesForm({ cats, mins }: { cats: { slug: string; name: string }[]; mins: Record<string, number> }) {
  const [state, action, pending] = useActionState(saveMinPrices, undefined);
  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-col">
        {cats.map((c) => (
          <label key={c.slug} className="flex items-center justify-between gap-3 border-t border-[#EEF3F9] py-2 text-[13px] font-semibold first:border-t-0">
            <span className="min-w-0">{c.name}</span>
            <span className="flex shrink-0 items-center gap-1.5">
              <span className="text-[11.5px] font-semibold text-[#8494AB]">US$</span>
              <input name={`min_${c.slug}`} defaultValue={mins[c.slug] ?? ""} inputMode="decimal" placeholder="None" aria-label={`Minimum price for ${c.name}`} className={cx(input, "h-8! w-24! py-1! text-right font-bold")} />
            </span>
          </label>
        ))}
      </div>
      {state?.error && <Alert tone="bad" icon={<TriangleAlert size={16} />}>{state.error}</Alert>}
      {state?.ok && <Alert tone="ok" icon={<CheckCircle2 size={16} />}>{state.ok}</Alert>}
      <button disabled={pending} className={cx(b("primary"), "w-full justify-center")}>{pending ? "Saving…" : "Save minimums"}</button>
    </form>
  );
}
