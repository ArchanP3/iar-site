"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, DollarSign, ExternalLink, FolderInput, Lock, Pencil, TriangleAlert, X } from "lucide-react";
import { bulkCategoryAction, bulkPriceAction } from "@/app/admin/(app)/parts/actions";
import { BULK_MIN_PRICE, PRICE_MODES, nextPrice, opError, parseOp, type PriceMode } from "@/lib/parts/bulkPrice";
import { LockMark, PriceCell } from "./ProductForms";
import { Alert, b, cx, input } from "./ui";

export type ListRow = {
  id: number;
  label: string;
  brand: string | null;
  partNumber: string;
  title: string | null;
  category: string | null;
  categorySlug: string | null;
  price: string | null;
  display: string;
  status: "published" | "draft" | "hidden";
  locked: string[];
  url: string;
};
type Cat = { slug: string; name: string };

const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Field names for the "Edited fields" column. */
const FIELD_NAMES: Record<string, string> = { title: "Title", description: "Description", sku: "SKU", price: "Price", price_display: "Price label", condition: "Condition", availability: "Availability", stock_qty: "Stock", warranty: "Warranty", ebay_item_id: "eBay ID", tab_specifications: "Specs", category: "Category" };

/** The parts list: tick rows for bulk price or category changes. `showLocks` lists each edited
    field with its Unlock button (the "Edited in CMS" tab). */
export function PartsTable({ rows, cats, mins, canBulkPrice, empty, showLocks = false }: { rows: ListRow[]; cats: Cat[]; mins: Record<string, number>; canBulkPrice: boolean; empty: string; showLocks?: boolean }) {
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [dialog, setDialog] = useState<"price" | "category" | null>(null);
  const [done, setDone] = useState<string>();
  // A new page or filter starts with nothing ticked.
  const key = rows.map((r) => r.id).join(",");
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    setSel(new Set());
  }
  const picked = rows.filter((r) => sel.has(r.id));
  const all = rows.length > 0 && sel.size === rows.length;
  const toggle = (id: number) => setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const low = (r: ListRow) => r.price != null && r.categorySlug != null && mins[r.categorySlug] != null && Number(r.price) < mins[r.categorySlug];

  const statusDot = { published: ["#12B76A", "Published"], draft: ["#F59E0B", "Draft"], hidden: ["#94A3B8", "Hidden"] } as const;
  const th = "whitespace-nowrap border-b border-[#E3EAF3] bg-[#FAFCFE] px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8494AB]";

  return (
    <>
      {done && (
        <div className="px-4 pt-3">
          <Alert tone="ok" icon={<CheckCircle2 size={16} />}>
            <span className="flex items-start gap-3">{done}<button type="button" onClick={() => setDone(undefined)} className="ml-auto text-[#05603A]" aria-label="Close message"><X size={14} /></button></span>
          </Alert>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className={cx(th, "w-10 pl-4")}>
                <input type="checkbox" checked={all} onChange={() => setSel(all ? new Set() : new Set(rows.map((r) => r.id)))} aria-label="Select every listing on this page" className="h-4 w-4 accent-[#0066FF] align-middle" disabled={!rows.length} />
              </th>
              <th className={th}>Part</th>
              <th className={cx(th, "max-md:hidden")}>Category</th>
              <th className={th}>Price</th>
              <th className={cx(th, !showLocks && "max-sm:hidden")}>{showLocks ? "Edited fields" : "Status"}</th>
              <th className={cx(th, "max-sm:hidden")}><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className={cx("group border-b border-[#EEF3F9] transition-colors last:border-0 hover:bg-[#F8FBFF]", sel.has(p.id) && "bg-[#F2F7FF] hover:bg-[#F2F7FF]")}>
                <td className="w-10 py-3 pl-4 pr-2 align-middle"><input type="checkbox" checked={sel.has(p.id)} onChange={() => toggle(p.id)} aria-label={`Select ${p.label}`} className="h-4 w-4 accent-[#0066FF] align-middle" /></td>
                <td className="px-3 py-3 align-middle max-sm:min-w-40">
                  <Link href={`/admin/parts/edit?id=${p.id}`} className="block min-w-0 hover:text-[#0052CC]">
                    <span className="block truncate text-[13.5px] font-extrabold tracking-[-0.01em] tabular-nums">
                      {p.brand && <span className="mr-1.5 text-[12px] font-semibold text-[#5B6B84]">{p.brand}</span>}
                      {p.partNumber}
                    </span>
                    <span className="block max-w-90 truncate text-[12.5px] text-[#5B6B84] max-sm:max-w-40">{p.title}</span>
                  </Link>
                </td>
                <td className="px-3 py-3 align-middle text-[12.8px] font-semibold max-md:hidden">
                  <span className="inline-flex items-center gap-1.5">
                    {p.category ?? <span className="font-medium text-[#8494AB]">No category</span>}
                    {p.locked.includes("category") && <Lock size={11} className="text-[#B45309]" aria-label="Category edited in the CMS: imports won't change it" />}
                  </span>
                </td>
                <td className="px-3 py-3 align-middle">
                  <div className="flex items-center gap-1.5">
                    <PriceCell id={p.id} price={p.price} display={p.display} locked={p.locked.includes("price")} />
                    {low(p) && <span className="rounded bg-[#FEF3F2] px-1.5 py-0.5 text-[10px] font-extrabold tracking-[0.06em] text-[#B42318]" title={`Under the ${usd(mins[p.categorySlug!])} minimum for this category`}>LOW</span>}
                  </div>
                </td>
                <td className={cx("px-3 py-3 align-middle", !showLocks && "max-sm:hidden")}>
                  {showLocks ? (
                    <span className="flex flex-wrap gap-x-3 gap-y-1">{p.locked.map((f) => <span key={f} className="inline-flex items-center gap-1 rounded-lg bg-[#FFFAEB] py-0.5 pl-2 pr-0.5 text-[12px] font-semibold text-[#93370D]"><Lock size={10} />{FIELD_NAMES[f] ?? f} <LockMark id={p.id} field={f} bare /></span>)}</span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold">
                      <i className="h-2 w-2 rounded-full" style={{ background: statusDot[p.status][0] }} aria-hidden="true" />
                      {statusDot[p.status][1]}
                      {p.locked.length > 0 && <span className="inline-flex items-center gap-0.5 text-[11px] text-[#B45309]" title={`Edited in the CMS: ${p.locked.join(", ")}`}><Lock size={10} />{p.locked.length}</span>}
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap py-3 pl-2 pr-4 text-right align-middle max-sm:hidden">
                  <span className="inline-flex gap-1 opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <Link href={`/admin/parts/edit?id=${p.id}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#5B6B84] hover:bg-[#F4F7FB] hover:text-[#0052CC]" title="Edit" aria-label={`Edit ${p.label}`}><Pencil size={15} /></Link>
                    <a href={p.url} target="_blank" rel="noopener" className="grid h-8 w-8 place-items-center rounded-lg text-[#5B6B84] hover:bg-[#F4F7FB] hover:text-[#0052CC]" title="View on the site" aria-label={`View ${p.label} on the site`}><ExternalLink size={15} /></a>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <p className="px-5 py-8 text-center text-[13px] text-[#5B6B84]">{empty}</p>}

      {/* Floating bar: appears at the bottom of the screen when rows are ticked */}
      <div
        role="region"
        aria-label="Bulk actions"
        aria-hidden={!sel.size}
        inert={!sel.size}
        className={cx(
          "fixed bottom-[calc(20px+env(safe-area-inset-bottom,0px))] max-sm:bottom-[calc(76px+env(safe-area-inset-bottom,0px))] left-1/2 z-40 flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-1.5 rounded-2xl bg-[#0B1A3C] py-2 pl-4 pr-2 text-white shadow-[0_24px_50px_-20px_rgba(11,26,60,0.8)] transition-all duration-300",
          sel.size ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
        )}
      >
        <span className="mr-1.5 whitespace-nowrap text-[13px] font-bold">{sel.size}<span className="max-sm:hidden"> selected</span></span>
        {canBulkPrice && <button type="button" tabIndex={sel.size ? 0 : -1} onClick={() => setDialog("price")} className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/15 bg-white/8 px-2.5 text-[12.5px] font-bold hover:border-[#00B0FF] hover:bg-white/14"><DollarSign size={13} /> <span className="max-sm:hidden">Change</span> price</button>}
        <button type="button" tabIndex={sel.size ? 0 : -1} onClick={() => setDialog("category")} className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/15 bg-white/8 px-2.5 text-[12.5px] font-bold hover:border-[#00B0FF] hover:bg-white/14"><FolderInput size={13} /> <span className="max-sm:hidden">Change</span> category</button>
        <button type="button" tabIndex={sel.size ? 0 : -1} onClick={() => setSel(new Set())} className="px-2 text-[12.5px] font-semibold text-[#9FB2D3] hover:text-white">Clear</button>
      </div>

      {dialog === "price" && <PriceDialog rows={picked} mins={mins} onClose={() => setDialog(null)} onDone={(m) => { setDialog(null); setSel(new Set()); setDone(m); }} />}
      {dialog === "category" && <CategoryDialog rows={picked} cats={cats} onClose={() => setDialog(null)} onDone={(m) => { setDialog(null); setSel(new Set()); setDone(m); }} />}
    </>
  );
}

/* ---------------- Dialog frame ---------------- */

function Dialog({ title, sub, onClose, children }: { title: string; sub: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  // On open: focus the first field, close on Esc, and give focus back to the page on close.
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    (ref.current?.querySelector<HTMLElement>("select, input") ?? ref.current?.querySelector<HTMLElement>("button"))?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close.current(); };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); prev?.focus(); };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0B1A3C]/40 p-4 sm:items-center" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="bulk-title" className="w-full max-w-140 rounded-2xl bg-white p-5 shadow-[0_30px_80px_-30px_rgba(11,26,60,0.6)] sm:p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 id="bulk-title" className="text-[17px] font-extrabold text-[#0B1A3C]">{title}</h2>
            <p className="mt-0.5 text-[12.5px] text-[#5B6B84]">{sub}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-[#8494AB] hover:bg-[#F4F7FB] hover:text-[#0B1A3C]" aria-label="Close"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------------- Change price ---------------- */

function PriceDialog({ rows, mins, onClose, onDone }: { rows: ListRow[]; mins: Record<string, number>; onClose: () => void; onDone: (msg: string) => void }) {
  const [mode, setMode] = useState<PriceMode>("pct_up");
  const [amount, setAmount] = useState("");
  const [round, setRound] = useState("0");
  const [err, setErr] = useState<string>();
  const [pending, start] = useTransition();
  const router = useRouter();
  const op = parseOp({ mode, amount, round })!;
  const invalid = amount.trim() || mode === "quote" ? opError(op) : null;

  const plan = useMemo(
    () =>
      rows.map((r) => {
        const cur = r.price == null ? null : Number(r.price);
        const n = invalid || (!amount.trim() && mode !== "quote") ? undefined : nextPrice(cur, op);
        const min = r.categorySlug ? mins[r.categorySlug] : undefined;
        return { r, cur, n, tooLow: n != null && n < BULK_MIN_PRICE, underMin: n != null && min != null && n < min };
      }),
    // op is rebuilt from these three on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, mins, mode, amount, round, invalid],
  );
  const changes = plan.filter((x) => x.n !== undefined && x.n !== x.cur);
  const tooLow = plan.filter((x) => x.tooLow);
  const underMin = plan.filter((x) => x.underMin && !x.tooLow);
  const pct = mode === "pct_up" || mode === "pct_down";

  const submit = () =>
    start(async () => {
      const r = await bulkPriceAction(rows.map((x) => x.id), { mode, amount, round });
      if (r.error) return setErr(r.error);
      router.refresh();
      onDone(r.ok ?? "Saved.");
    });

  return (
    <Dialog title={`Change price · ${rows.length} listing${rows.length > 1 ? "s" : ""}`} sub="Updates both sites. The prices are locked against imports, and Undo in Users & Activity puts them all back." onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr]">
        <label className="flex flex-col gap-1.5 text-[12.5px] font-bold">How to change
          <select value={mode} onChange={(e) => { setMode(e.target.value as PriceMode); setErr(undefined); }} className={input}>
            {PRICE_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </label>
        {mode !== "quote" && (
          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold">{pct ? "Percent" : "Amount (US$)"}
            <input value={amount} onChange={(e) => { setAmount(e.target.value); setErr(undefined); }} inputMode="decimal" placeholder={pct ? "10" : "100"} className={input} />
          </label>
        )}
        {mode !== "quote" && (
          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold">Round to
            <select value={round} onChange={(e) => setRound(e.target.value)} className={input}>
              <option value="0">Cents (no rounding)</option>
              <option value="1">Nearest $1</option>
              <option value="5">Nearest $5</option>
              <option value="10">Nearest $10</option>
            </select>
          </label>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-[#E3EAF3]">
        <div className="border-b border-[#E3EAF3] bg-[#FAFCFE] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8494AB]">Preview</div>
        <ul className="max-h-56 divide-y divide-[#EEF3F9] overflow-y-auto">
          {plan.map(({ r, cur, n, tooLow: tl, underMin: um }) => (
            <li key={r.id} className="flex items-center gap-2 px-3.5 py-2 text-[12.8px]">
              <span className="min-w-0 flex-1 truncate font-semibold">{r.label}</span>
              <span className="text-[#5B6B84]">{cur == null ? "Request Quote" : usd(cur)}</span>
              <ArrowRight size={13} className="text-[#8494AB]" />
              <span className={cx("min-w-24 text-right font-bold", tl ? "text-[#B42318]" : um ? "text-[#B45309]" : n === undefined || n === cur ? "font-semibold text-[#8494AB]" : "text-[#0B1A3C]")}>
                {n === undefined || n === cur ? "no change" : n == null ? "Request Quote" : usd(n)}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {pct || mode === "amt_up" || mode === "amt_down" ? <p className="mt-2 text-[11.5px] text-[#8494AB]">Request Quote listings stay Request Quote.</p> : null}
      {invalid && <div className="mt-3"><Alert tone="bad" icon={<TriangleAlert size={16} />}>{invalid}</Alert></div>}
      {tooLow.length > 0 && <div className="mt-3"><Alert tone="bad" icon={<TriangleAlert size={16} />}>{tooLow.length} listing{tooLow.length > 1 ? "s" : ""} would go under US${BULK_MIN_PRICE}. Untick {tooLow.length > 1 ? "them" : "it"} or use a smaller change.</Alert></div>}
      {underMin.length > 0 && <div className="mt-3"><Alert tone="warn" icon={<TriangleAlert size={16} />}>{underMin.length} listing{underMin.length > 1 ? "s" : ""} would be under the minimum price for {underMin.length > 1 ? "their categories" : "its category"} (marked in orange). Check before saving.</Alert></div>}
      {err && <div className="mt-3"><Alert tone="bad" icon={<TriangleAlert size={16} />}>{err}</Alert></div>}
      <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
        <button type="button" onClick={onClose} className={b("light")}>Cancel</button>
        <button type="button" onClick={submit} disabled={pending || !!invalid || !changes.length || tooLow.length > 0} className={b("primary")}>
          {pending ? "Saving…" : changes.length ? `Update ${changes.length} price${changes.length > 1 ? "s" : ""}` : "Update prices"}
        </button>
      </div>
    </Dialog>
  );
}

/* ---------------- Change category ---------------- */

function CategoryDialog({ rows, cats, onClose, onDone }: { rows: ListRow[]; cats: Cat[]; onClose: () => void; onDone: (msg: string) => void }) {
  const [to, setTo] = useState("");
  const [err, setErr] = useState<string>();
  const [pending, start] = useTransition();
  const router = useRouter();
  const from = [...new Set(rows.map((r) => r.category ?? "No category"))];
  const moving = rows.filter((r) => r.categorySlug !== to).length;

  const submit = () =>
    start(async () => {
      const r = await bulkCategoryAction(rows.map((x) => x.id), to);
      if (r.error) return setErr(r.error);
      router.refresh();
      onDone(r.ok ?? "Saved.");
    });

  return (
    <Dialog title={`Change category · ${rows.length} listing${rows.length > 1 ? "s" : ""}`} sub="For listings that were imported into the wrong category." onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 text-[12.5px] font-bold">From
          <div className="rounded-[10px] border border-[#E3EAF3] bg-[#F8FAFD] px-3 py-2.5 text-[13px] font-semibold text-[#5B6B84]">{from.slice(0, 3).join(", ")}{from.length > 3 ? ` +${from.length - 3}` : ""}</div>
        </div>
        <label className="flex flex-col gap-1.5 text-[12.5px] font-bold">To
          <select value={to} onChange={(e) => { setTo(e.target.value); setErr(undefined); }} className={input}>
            <option value="">Choose a category</option>
            {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </label>
      </div>
      <ul className="mt-4 flex flex-col gap-1.5 text-[12.5px] text-[#5B6B84]">
        <li className="flex gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#12B76A]" />The part page URL stays the same, so no links break.</li>
        <li className="flex gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#12B76A]" />Shop category pages, filters and counts follow the new category.</li>
        <li className="flex gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#12B76A]" />The category is locked against imports. Undo in Users &amp; Activity moves them all back.</li>
      </ul>
      {err && <div className="mt-3"><Alert tone="bad" icon={<TriangleAlert size={16} />}>{err}</Alert></div>}
      <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
        <button type="button" onClick={onClose} className={b("light")}>Cancel</button>
        <button type="button" onClick={submit} disabled={pending || !to || !moving} className={b("primary")}>
          {pending ? "Moving…" : !to ? "Move listings" : moving ? `Move ${moving} listing${moving > 1 ? "s" : ""}` : "Already in that category"}
        </button>
      </div>
    </Dialog>
  );
}

/** Press "/" anywhere on the page to jump to the parts search box. */
export function SlashFocus({ target }: { target: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      const box = document.getElementById(target) as HTMLInputElement | null;
      if (!box) return;
      e.preventDefault();
      box.focus();
      box.select();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target]);
  return null;
}
