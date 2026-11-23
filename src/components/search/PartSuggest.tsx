"use client";

import Image from "next/image";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Cog, Factory, FileText, Search, Wrench } from "lucide-react";
import { brandFont } from "@/lib/font";

/* Search box with live part-number suggestions (from 3 characters).
   Drop-in replacement for <input name="part">: the form still submits to /search.
   The list is drawn in a portal, so it is never cut off by the box it sits in.
   Put data-suggest-anchor on the element the list should line up under. */
type Item = { href: string; partNumber: string; manufacturer: string; name: string; image: string | null; price: number | null; status: string | null };
type Page = { kind: "brand" | "service" | "industry"; label: string; note: string; href: string };
type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { ref?: React.Ref<HTMLInputElement> };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const usd = (n: number) => `US$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

/* Highlight the typed characters inside the part number (ignores dashes and spaces) */
function Mark({ text, q }: { text: string; q: string }) {
  const n = norm(q);
  if (!n) return <>{text}</>;
  for (let s = 0; s < text.length; s++) {
    if (!/[a-z0-9]/i.test(text[s])) continue;
    let k = 0, i = s;
    for (; i < text.length && k < n.length; i++) {
      if (!/[a-z0-9]/i.test(text[i])) continue;
      if (text[i].toLowerCase() !== n[k]) break;
      k++;
    }
    if (k === n.length) {
      return <>{text.slice(0, s)}<mark className="rounded-[3px] bg-[#C8102E]/12 px-px text-[#A50D25]">{text.slice(s, i)}</mark>{text.slice(i)}</>;
    }
  }
  return <>{text}</>;
}

export default function PartSuggest({ className, onKeyDown, onChange, onFocus, onBlur, ref: outerRef, ...input }: Props) {
  const ref = useRef<HTMLInputElement | null>(null);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(-1);
  const [box, setBox] = useState<{ left: number; top: number; width: number } | null>(null);
  const listId = useId();

  /* fetch, debounced */
  useEffect(() => {
    if (norm(q).length < 2) return;
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      setBusy(true);
      try {
        const r = await fetch(`/api/part-suggest?q=${encodeURIComponent(q)}`, { signal: ctl.signal });
        const j = await r.json();
        setItems(j.items ?? []);
        setPages(j.pages ?? []);
        setTotal(j.total ?? 0);
        setActive(-1);
      } catch {}
      setBusy(false);
    }, 160);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [q]);

  /* line the list up under the search box */
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const el = ref.current?.closest("[data-suggest-anchor]") ?? ref.current?.parentElement;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setBox({ left: r.left, top: r.bottom + 8, width: r.width });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  const show = open && (norm(q).length >= 3 || (norm(q).length >= 2 && pages.length > 0)) && box;
  /* arrow keys move through repair pages first, then parts */
  const nav = [...pages.map((p) => p.href), ...items.map((it) => it.href)];
  const go = (href: string) => {
    window.location.href = href;
  };

  const key = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.key === "Escape") setOpen(false);
    if (!show || !nav.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % nav.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? nav.length - 1 : a - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      go(nav[active]);
    }
  };

  const setRef = (el: HTMLInputElement | null) => {
    ref.current = el;
    if (typeof outerRef === "function") outerRef(el);
    else if (outerRef) (outerRef as React.RefObject<HTMLInputElement | null>).current = el;
  };

  return (
    <>
      <input
        {...input}
        ref={setRef}
        type="search"
        autoComplete="off"
        role="combobox"
        aria-expanded={Boolean(show)}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={show && active >= 0 ? `${listId}-${active}` : undefined}
        className={className}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          onChange?.(e);
        }}
        onFocus={(e) => {
          setOpen(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setTimeout(() => setOpen(false), 150);
          onBlur?.(e);
        }}
        onKeyDown={key}
      />
      {show &&
        createPortal(
          <div
            id={listId}
            role="listbox"
            style={{ position: "fixed", left: box.left, top: box.top, width: Math.max(box.width, 300) }}
            className={`${brandFont.className} z-80 overflow-hidden rounded-2xl border border-[#EAEAEC] bg-white text-left text-[#131316] shadow-[0_30px_70px_-20px_rgba(19,19,22,0.45)]`}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#F3F3F4] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#696976]">
              <span>{busy && !items.length && !pages.length ? "Searching…" : items.length ? "Matching parts" : pages.length ? "Repair services" : "No match in our online catalogue yet"}</span>
              {total > items.length && <span className="normal-case tracking-normal">{total.toLocaleString("en-US")} results</span>}
            </div>
            {pages.length > 0 && (
              <ul className={`py-1 ${items.length ? "border-b border-[#F3F3F4]" : ""}`}>
                {pages.map((pg, i) => {
                  const I = pg.kind === "brand" ? Wrench : pg.kind === "industry" ? Factory : Cog;
                  return (
                    <li key={pg.href} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                      <a href={pg.href} onMouseEnter={() => setActive(i)} className={`flex items-center gap-3 px-3 py-2.5 transition ${i === active ? "bg-[#F7F7F7]" : ""}`}>
                        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-[#C8102E]/8 text-[#B30E29] ring-1 ring-[#F5D8DC]"><I size={18} aria-hidden="true" /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-bold">{pg.label}</span>
                          <span className="block truncate text-[12px] text-[#62626F]">{pg.note}</span>
                        </span>
                        <ArrowRight size={15} className="flex-none text-[#B30E29]" aria-hidden="true" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
            {items.length > 0 && (
              <ul className="max-h-90 overflow-y-auto py-1">
                {items.map((it, j) => {
                  const i = j + pages.length;
                  return (
                  <li key={it.href} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                    <a href={it.href} onMouseEnter={() => setActive(i)} className={`flex items-center gap-3 px-3 py-2.5 transition ${i === active ? "bg-[#F7F7F7]" : ""}`}>
                      <span className="flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-xl bg-[#F7F7F8] ring-1 ring-[#EAEAEC]">
                        {it.image ? (
                          <Image src={it.image} alt="" aria-hidden="true" width={44} height={44} className="h-9 w-9 object-contain" unoptimized={it.image.startsWith("http")} />
                        ) : (
                          <Search size={16} className="text-[#696976]" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-mono text-[14px] font-bold"><Mark text={it.partNumber} q={q} /></span>
                        <span className="block truncate text-[12px] text-[#62626F]">
                          <span className="font-semibold uppercase tracking-[0.04em] text-[#4E4E58]">{it.manufacturer}</span> · {it.name}
                        </span>
                      </span>
                      {it.price != null ? (
                        <span className="flex-none text-right text-[13px] font-extrabold">
                          {usd(it.price)}
                          <span className="block text-[10.5px] font-medium text-[#696976]">Refurbished</span>
                        </span>
                      ) : (
                        <span className="flex-none rounded-lg bg-[#F5F5F6] px-2 py-1 text-[11px] font-semibold text-[#5A5A66]">Quote</span>
                      )}
                    </a>
                  </li>
                  );
                })}
              </ul>
            )}
            <div className="grid border-t border-[#F3F3F4] sm:grid-cols-2">
              <a href={`/search?part=${encodeURIComponent(q.trim())}`} className="flex items-center gap-2 px-4 py-3 text-[13px] font-semibold text-[#A50D25] hover:bg-[#FAFAFB]">
                <Search size={14} aria-hidden="true" /> <span className="truncate">All results for “{q.trim()}”</span> <ArrowRight size={13} className="ml-auto flex-none" aria-hidden="true" />
              </a>
              <a href={`/request-quote?${new URLSearchParams({ part: q.trim(), from: "search", q: q.trim() })}`} className="flex items-center gap-2 border-t border-[#F3F3F4] px-4 py-3 text-[13px] font-semibold text-[#131316] hover:bg-[#FAFAFB] sm:border-l sm:border-t-0">
                <FileText size={14} className="text-[#B30E29]" aria-hidden="true" /> Not listed? Request a quote
              </a>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
