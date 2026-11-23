"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

const norm = (s: string) => s.toLowerCase().replace(/[\s.\-_]/g, "");

/* Search box + area buttons. Shows/hides the server-rendered rows directly (fast, even with 1,500 codes). */
export default function FamilyFilter({
  tableId,
  label,
  total,
  areas,
  page,
  askHref,
}: {
  askHref: string;
  tableId: string;
  label: string;
  total: number;
  areas: [string, number][];
  page: number;
}) {
  const [q, setQ] = useState("");
  const [area, setArea] = useState("All");
  const [all, setAll] = useState(false);
  const first = useRef(true);

  // "/fault-codes/...?q=F30006" opens the list filtered to that code
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("q");
    if (v) setQ(v);
    const more = document.getElementById(`${tableId}-more`);
    const onMore = () => setAll(true);
    more?.addEventListener("click", onMore);
    // "Ask a technician" buttons in the table: send the code with the request
    const table = document.getElementById(tableId);
    const onAsk = (e: Event) => {
      const b = (e.target as HTMLElement).closest("td button");
      const code = b?.closest("tr")?.cells[0]?.textContent;
      if (code) window.location.href = `${askHref}?fault=${encodeURIComponent(code)}`;
    };
    table?.addEventListener("click", onAsk);
    return () => {
      more?.removeEventListener("click", onMore);
      table?.removeEventListener("click", onAsk);
    };
  }, [tableId, askHref]);

  useEffect(() => {
    if (first.current && !q && area === "All" && !all) {
      first.current = false;
      return; // server already rendered the first page
    }
    first.current = false;
    const nq = norm(q);
    const lq = q.trim().toLowerCase();
    const limited = !all && !nq && area === "All";
    const rows = document.querySelectorAll<HTMLTableRowElement>(`#${tableId} tbody tr`);
    let n = 0;
    rows.forEach((tr) => {
      const [c, name, a] = tr.cells;
      const ok =
        (area === "All" || a.textContent === area) &&
        (!nq || norm(c.textContent ?? "").includes(nq) || (name.textContent ?? "").toLowerCase().includes(lq));
      if (ok) n++;
      tr.hidden = !ok || (limited && n > page);
    });
    const status = document.getElementById(`${tableId}-status`);
    if (status)
      status.textContent =
        n === 0 ? "No codes match your search." : `Showing ${limited ? Math.min(page, n) : n} of ${n.toLocaleString("en-US")} codes`;
    const more = document.getElementById(`${tableId}-more`);
    if (more) more.hidden = !(limited && n > page);
  }, [q, area, all, tableId, page]);

  const top = areas.slice(0, 5);
  const rest = areas.slice(5);
  const chip = (a: string, c: number) => (
    <button
      key={a}
      type="button"
      aria-pressed={a === area}
      onClick={() => setArea(a)}
      className={`shrink-0 rounded-xl border px-3.5 py-2 text-[13px] font-semibold transition ${
        a === area
          ? "border-transparent bg-linear-to-br from-[#0066FF] to-[#00B0FF] text-white"
          : "border-[#D9E4F1] bg-white text-[#0B1A3C] hover:border-[#0066FF]/40"
      }`}
    >
      {a} <span className={a === area ? "text-white/75" : "text-[#52647F]"}>· {c.toLocaleString("en-US")}</span>
    </button>
  );

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 rounded-2xl border border-[#D9E4F1] bg-[#F7FAFE] p-1.5 pl-4">
        <Search size={17} className="text-[#005AE0]" aria-hidden="true" />
        <span className="sr-only">Search {label} codes</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${label} codes…`}
          autoComplete="off"
          className="h-10 w-full min-w-0 bg-transparent text-[14.5px] outline-none placeholder:text-[#52647F]"
        />
      </label>
      <div className="-mx-5 flex items-center gap-2 overflow-x-auto px-5 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
        {chip("All", total)}
        {top.map(([a, c]) => chip(a, c))}
        {rest.length > 0 && (
          <select
            aria-label="More areas"
            value={rest.some(([a]) => a === area) ? area : ""}
            onChange={(e) => setArea(e.target.value || "All")}
            className={`h-9.5 shrink-0 rounded-xl border px-3 text-[13px] font-semibold outline-none ${
              rest.some(([a]) => a === area) ? "border-[#0066FF] text-[#005AE0]" : "border-[#D9E4F1] text-[#0B1A3C]"
            } bg-white`}
          >
            <option value="">More areas ({rest.length})</option>
            {rest.map(([a, c]) => (
              <option key={a} value={a}>
                {a} · {c}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
