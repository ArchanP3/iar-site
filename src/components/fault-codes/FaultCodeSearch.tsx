"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Search } from "lucide-react";

/* [code, name, family label, url] — loaded only when someone starts typing */
type Row = [string, string, string, string];
let cache: Promise<Row[]> | null = null;
const loadIndex = () => (cache ??= fetch("/fault-code-index.json").then((r) => r.json()));

const norm = (s: string) => s.toLowerCase().replace(/[\s.\-_]/g, "");

function find(rows: Row[], q: string) {
  const n = norm(q);
  if (!n) return [];
  const starts: Row[] = [];
  const named: Row[] = [];
  for (const r of rows) {
    const c = norm(r[0]);
    if (c.startsWith(n)) starts.push(r);
    else if (n.length > 2 && (c.includes(n) || r[1].toLowerCase().includes(q.trim().toLowerCase()))) named.push(r);
    if (starts.length >= 60) break;
  }
  // codes with a full guide first
  const guide = (r: Row) => Number(!r[3].includes("?q="));
  const byGuide = (a: Row, b: Row) => guide(b) - guide(a);
  return [...starts.sort(byGuide), ...named.sort(byGuide)].slice(0, 6);
}

export default function FaultCodeSearch({
  placeholder = "Enter a fault code, e.g. F30001",
  button = "Look up",
  size = "md",
  readUrl = false,
  inputId = "fault-code-search",
  compact = false,
}: {
  placeholder?: string;
  button?: string;
  size?: "md" | "lg";
  readUrl?: boolean;
  inputId?: string;
  /** narrow boxes (header menu): hide the family name so the code name fits */
  compact?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [hits, setHits] = useState<Row[]>([]);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [noMatch, setNoMatch] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // On the library page, "/fault-codes?q=F300" fills in the search box
  useEffect(() => {
    if (!readUrl) return;
    const v = new URLSearchParams(window.location.search).get("q");
    if (v) update(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readUrl]);

  const update = async (value: string) => {
    setQ(value);
    setActive(0);
    const data = rows.length ? rows : await loadIndex();
    if (!rows.length) setRows(data);
    const h = find(data, value);
    setHits(h);
    setNoMatch(value.trim().length > 1 && h.length === 0);
    setOpen(true);
  };

  const go = (r?: Row) => {
    if (r) router.push(r[3]);
    else if (q.trim()) router.push(`/fault-codes?q=${encodeURIComponent(q.trim())}`);
  };

  const h = size === "lg" ? "h-12 sm:h-13" : "h-12";

  return (
    <div
      ref={boxRef}
      className="relative"
      onBlur={(e) => {
        if (!boxRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <form
        role="search"
        className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/8 p-1.5 pl-4 shadow-[0_24px_60px_-30px_rgba(200, 16, 46,0.9)]"
        onSubmit={(e) => {
          e.preventDefault();
          go(hits[active]);
        }}
      >
        <Search size={19} className="shrink-0 text-[#FF8A99]" aria-hidden="true" />
        <label htmlFor={inputId} className="sr-only">
          Search fault codes
        </label>
        <input
          id={inputId}
          value={q}
          onFocus={() => {
            loadIndex();
            if (hits.length) setOpen(true);
          }}
          onChange={(e) => update(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, hits.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Escape") setOpen(false);
          }}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          className={`${h} w-full min-w-0 bg-transparent text-[15px] text-white outline-none placeholder:text-white/60`}
        />
        <button
          type="submit"
          className={`inline-flex ${h} shrink-0 items-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-4 text-[14.5px] font-semibold text-white sm:px-5`}
        >
          {button} <ArrowRight size={16} aria-hidden="true" />
        </button>
      </form>

      {open && (hits.length > 0 || noMatch) && (
        <ul className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#242429] text-white shadow-[0_24px_50px_-20px_rgba(0,0,0,0.8)]">
          {hits.map((r, i) => (
            <li key={r[3]} className={i ? "border-t border-white/6" : ""}>
              <Link
                href={r[3]}
                onMouseEnter={() => setActive(i)}
                className={`flex items-center gap-3 px-4 py-2.5 text-[13.5px] ${i === active ? "bg-white/[0.07]" : ""}`}
              >
                <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-400/15 px-2 py-0.5 font-mono text-[12.5px] font-bold text-amber-300">
                  <AlertTriangle size={12} aria-hidden="true" />
                  {r[0]}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">{r[1]}</span>
                {!compact && <span className="hidden shrink-0 text-[12px] text-white/60 sm:block">{r[2]}</span>}
              </Link>
            </li>
          ))}
          {noMatch && (
            <li className="px-4 py-3 text-[13.5px] text-white/75">
              No match yet.{" "}
              <Link href={`/request-repair?service=question&fault=${encodeURIComponent(q.trim())}`} className="font-semibold text-[#FF5A6E]">
                Send the code to a technician
              </Link>{" "}
              and we&apos;ll tell you what it means.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
