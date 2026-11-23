import FamilyFilter from "./FamilyFilter";

/* [code, name, type, area, guide url or ""] */
export type TableRow = [string, string, string, string, string];

const PAGE = 60;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* All rows as one plain HTML string: phones don't have to "wake up" 1,500 React rows */
function rowsHtml(rows: TableRow[]) {
  return rows
    .map(
      (r, i) =>
        `<tr${i >= PAGE ? " hidden" : ""}><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[3])}</td><td>${
          r[4] ? `<a href="${esc(r[4])}">Full guide</a>` : `<button type="button">Ask a technician</button>`
        }</td></tr>`,
    )
    .join("");
}

/* The full list is rendered on the server so Google sees every code.
   Row markup is kept tiny (styles live on the table) because SINAMICS alone has ~1,500 rows.
   FamilyFilter, a small client script, only shows/hides rows. */
const tableStyles = [
  "w-full table-fixed border-collapse text-left text-[14px]",
  "[&_tbody_tr]:border-t [&_tbody_tr]:border-[#EEF3F9] [&_tbody_tr:nth-child(even)]:bg-[#F9FBFE]",
  "[&_td]:px-2 [&_td]:py-3 [&_td]:align-top",
  "[&_td:first-child]:pl-4 [&_td:first-child]:font-mono [&_td:first-child]:text-[13.5px] [&_td:first-child]:font-bold",
  "[&_td:nth-child(2)]:font-medium",
  "[&_td:nth-child(3)]:hidden [&_td:nth-child(3)]:text-[13px] [&_td:nth-child(3)]:text-[#52647F] md:[&_td:nth-child(3)]:table-cell",
  "[&_td:last-child]:pr-4 [&_td:last-child]:text-right",
  "[&_td_a]:inline-flex [&_td_a]:rounded-lg [&_td_a]:bg-[#0066FF]/8 [&_td_a]:px-2.5 [&_td_a]:py-1 [&_td_a]:text-[12.5px] [&_td_a]:font-semibold [&_td_a]:text-[#0052CC] [&_td_a:hover]:bg-[#0066FF]/[0.14]",
  "[&_td_button]:text-[12.5px] [&_td_button]:text-[#56677F] [&_td_button:hover]:text-[#005AE0]",
].join(" ");

export default function FamilyTable({ rows, label, askHref }: { rows: TableRow[]; label: string; askHref: string }) {
  const counts = new Map<string, number>();
  rows.forEach((r) => counts.set(r[3], (counts.get(r[3]) ?? 0) + 1));
  const areas = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const id = "fc-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div>
      <FamilyFilter tableId={id} label={label} total={rows.length} areas={areas} page={PAGE} askHref={askHref} />

      <div className="mt-4 overflow-hidden rounded-2xl border border-[#E3EAF3]">
        <table id={id} className={tableStyles}>
          <caption className="sr-only">{label} fault codes</caption>
          <thead className="bg-[#0B1A3C] text-[11.5px] font-semibold uppercase tracking-[0.12em] text-white/80">
            <tr>
              <th scope="col" className="w-23 px-4 py-3 sm:w-27.5">Code</th>
              <th scope="col" className="px-2 py-3">Name</th>
              <th scope="col" className="hidden w-42.5 px-2 py-3 md:table-cell">Area</th>
              <th scope="col" className="w-29.5 px-4 py-3 text-right sm:w-35">Guide</th>
            </tr>
          </thead>
          <tbody dangerouslySetInnerHTML={{ __html: rowsHtml(rows) }} />
        </table>
        <div className="flex items-center justify-between gap-3 border-t border-[#E3EAF3] bg-[#F7FAFE] px-4 py-3 text-[13px] text-[#52647F]">
          <span id={`${id}-status`}>
            Showing {Math.min(PAGE, rows.length)} of {rows.length.toLocaleString("en-US")} codes
          </span>
          {rows.length > PAGE && (
            <button id={`${id}-more`} type="button" className="font-semibold text-[#005AE0] hover:underline">
              Show all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
