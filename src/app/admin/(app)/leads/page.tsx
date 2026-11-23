import Link from "next/link";
import { Fragment, Suspense } from "react";
import { Download, Inbox } from "lucide-react";
import { requireUser } from "@/lib/cms/auth";
import { q } from "@/lib/cms/db";
import { LEADS, type Lead } from "@/lib/cms/leads";
import { Bar, Card, PageHead, Pill, Seg, ago, b, input } from "@/components/admin/ui";
import { updateLead } from "./actions";

type Props = { searchParams: Promise<{ status?: string; open?: string }> };
const tone = { new: "bad", contacted: "blue", quoted: "violet", won: "ok", lost: "gray", spam: "gray", test: "gray" } as const;

export default function Page(props: Props) {
  return (
    <Suspense fallback={<p className="text-[#91919E]">Loading…</p>}>
      <Leads {...props} />
    </Suspense>
  );
}

async function Leads({ searchParams }: Props) {
  await requireUser("leads");
  const sp = await searchParams;
  const st = Object.keys(tone).includes(sp.status ?? "") ? sp.status! : "all";
  const [rows, bySource, counts] = await Promise.all([
    q<Lead>(`SELECT * FROM (${LEADS}) l ${st === "all" ? "WHERE status NOT IN ('spam', 'test')" : "WHERE status = $1"} ORDER BY created_at DESC LIMIT 200`, st === "all" ? [] : [st]),
    q<{ source: string; n: number }>(`SELECT source, count(*)::int AS n FROM (${LEADS}) l WHERE status NOT IN ('spam', 'test') AND created_at > now() - interval '90 days' GROUP BY source ORDER BY n DESC LIMIT 8`),
    q<{ status: string; n: number }>(`SELECT status, count(*)::int AS n FROM (${LEADS}) l GROUP BY status`),
  ]);
  const n = (s: string) => counts.find((c) => c.status === s)?.n ?? 0;
  const max = Math.max(1, ...bySource.map((s) => s.n));
  const openId = Number(sp.open) || 0;
  return (
    <>
      <PageHead title="Leads" sub="Every request sent from the website, with the page the visitor first landed on and where they came from." actions={<a href="/admin/export/leads" className={b("light")}><Download size={15} /> Export CSV</a>} />
      <div className="grid items-start gap-5 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          <div><Seg active={st} items={[{ key: "all", label: "All", href: "/admin/leads" }, ...Object.keys(tone).map((k) => ({ key: k, label: `${k[0].toUpperCase()}${k.slice(1)} (${n(k)})`, href: `/admin/leads?status=${k}` }))]} /></div>
          <Card pad={false}>
            {!rows.length && <div className="flex flex-col items-center gap-2 p-10 text-center text-[#696976]"><Inbox size={26} className="text-[#91919E]" />No requests here yet. They appear the moment a visitor sends a form.</div>}
            {rows.map((r) => {
              const open = Number(r.id) === openId; // request ids are bigint, read as strings
              return (
                <div key={r.id} className="border-b border-[#EAEAEC] last:border-0">
                  <Link href={`?${new URLSearchParams({ ...(st !== "all" ? { status: st } : {}), ...(open ? {} : { open: String(r.id) }) })}`} scroll={false} className="flex items-center gap-3 px-5 py-3 hover:bg-[#FAFAFB]">
                    <Pill tone={tone[r.status] ?? "gray"}>{r.status}</Pill>
                    <div className="min-w-0 flex-1"><b className="text-[13.5px]">{r.form}</b><div className="truncate text-[12.5px] text-[#696976]">{r.summary || "—"}</div></div>
                    <div className="hidden text-right text-[12px] text-[#696976] sm:block"><div className="font-semibold text-[#45454D]">{r.source}</div><div className="font-mono">{r.landing || r.page}</div></div>
                    <div className="w-20 text-right text-[12px] text-[#91919E]">{ago(r.created_at)}</div>
                  </Link>
                  {open && (
                    <div className="grid gap-4 bg-[#FCFCFC] px-5 py-4 lg:grid-cols-[1.4fr_1fr]">
                      <dl className="grid grid-cols-[150px_1fr] gap-x-3 gap-y-1.5 text-[12.8px]">
                        {Object.entries(r.data).map(([k, v]) => <Fragment key={k}><dt className="font-semibold text-[#696976]">{k}</dt><dd className="whitespace-pre-wrap wrap-break-word">{v}</dd></Fragment>)}
                        <dt className="font-semibold text-[#696976]">Sent from</dt><dd className="font-mono">{r.page}</dd>
                        <dt className="font-semibold text-[#696976]">First landed on</dt><dd className="font-mono">{r.landing || "—"}</dd>
                        <dt className="font-semibold text-[#696976]">Referrer</dt><dd className="break-all">{r.referrer || "—"}</dd>
                        <dt className="font-semibold text-[#696976]">Received</dt><dd>{new Date(r.created_at).toLocaleString("en-CA")}</dd>
                      </dl>
                      <form action={updateLead} className="flex flex-col gap-2.5">
                        <input type="hidden" name="id" value={r.id} />
                        <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">Status</span><select name="status" defaultValue={r.status} className={input}>{Object.keys(tone).map((k) => <option key={k} value={k}>{k[0].toUpperCase() + k.slice(1)}</option>)}</select></label>
                        <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">Notes</span><textarea name="notes" defaultValue={r.notes} rows={4} className={input} /></label>
                        <div><button className={b("primary", true)}>Save</button></div>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </Card>
        </div>
        <Card title="Where leads come from" right={<span className="text-[12px] text-[#91919E]">90 days</span>}>
          {!bySource.length ? <p className="text-[12.5px] text-[#91919E]">No data yet.</p> : (
            <div className="flex flex-col gap-3">
              {bySource.map((s) => <div key={s.source}><div className="mb-1 flex text-[12.5px]"><span className="truncate font-semibold">{s.source}</span><b className="ml-auto">{s.n}</b></div><Bar pct={(s.n / max) * 100} color="#C8102E" /></div>)}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
