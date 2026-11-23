import { Suspense } from "react";
import { ArrowDownRight, ArrowUpRight, Gauge, Lightbulb } from "lucide-react";
import { requireUser } from "@/lib/cms/auth";
import { readSetting } from "@/lib/cms/settings";
import { ga4Leads, searchData, serviceAccountEmail, vitals, type GscRow } from "@/lib/cms/google";
import { SITE_URL } from "@/lib/site";
import { Alert, Bar, Card, PageHead, Seg, Table } from "@/components/admin/ui";
import { LineChart } from "@/components/admin/charts";
import GoogleConnect from "@/components/admin/GoogleConnect";

type Props = { searchParams: Promise<{ days?: string }> };

export default function Page(props: Props) {
  return (
    <Suspense fallback={<p className="text-[#91919E]">Loading Google data…</p>}>
      <Perf {...props} />
    </Suspense>
  );
}

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const short = (u: string) => u.replace(/^https?:\/\/[^/]+/, "") || "/";

function Delta({ a, b, invert }: { a: number; b: number; invert?: boolean }) {
  if (!b) return null;
  const d = (a - b) / b;
  const good = invert ? d < 0 : d > 0;
  return <span className={`inline-flex items-center text-[12px] font-bold ${good ? "text-[#067647]" : "text-[#B42318]"}`}>{d > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{Math.abs(d * 100).toFixed(0)}%</span>;
}

function Rows({ rows, page }: { rows: GscRow[]; page?: boolean }) {
  return (
    <Table head={[page ? "Page" : "Search term", "Clicks", "Impressions", "CTR", "Position"]}>
      {rows.map((r) => (
        <tr key={r.keys[0]}>
          <td className="max-w-90 truncate font-semibold">{page ? <a href={r.keys[0]} target="_blank" className="font-mono text-[12px] hover:text-[#A50D25]">{short(r.keys[0])}</a> : r.keys[0]}</td>
          <td>{r.clicks.toLocaleString()}</td><td>{r.impressions.toLocaleString()}</td><td>{pct(r.ctr)}</td><td>{r.position.toFixed(1)}</td>
        </tr>
      ))}
    </Table>
  );
}

async function Perf({ searchParams }: Props) {
  await requireUser("performance");
  const days = [7, 28, 90].includes(Number((await searchParams).days)) ? Number((await searchParams).days) : 28;
  const [cfg, s, ga, v] = await Promise.all([readSetting("google"), searchData(days), ga4Leads(days), vitals(SITE_URL)]);
  const email = serviceAccountEmail();
  const tiles = [
    ["Clicks from Google", s.totals.clicks.toLocaleString(), <Delta key="c" a={s.totals.clicks} b={s.prev.clicks} />],
    ["Times shown in Google", s.totals.impressions.toLocaleString(), <Delta key="i" a={s.totals.impressions} b={s.prev.impressions} />],
    ["Click-through rate", pct(s.totals.ctr), <Delta key="r" a={s.totals.ctr} b={s.prev.ctr} />],
    ["Average position", s.totals.position ? s.totals.position.toFixed(1) : "—", <Delta key="p" a={s.totals.position} b={s.prev.position} invert />],
  ] as const;
  return (
    <>
      <PageHead title="Search Performance" sub="How the website does in Google: clicks, search terms, pages and speed. Data comes free from Google Search Console, Google Analytics and PageSpeed." actions={<Seg active={String(days)} items={[7, 28, 90].map((d) => ({ key: String(d), label: `${d} days`, href: `?days=${d}` }))} />} />
      {!s.configured && <GoogleConnect cfg={cfg} email={email} />}
      {s.error && <Alert tone="bad">{s.error}</Alert>}
      {s.configured && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {tiles.map(([l, n, d]) => <Card key={l}><div className="text-[12.5px] font-semibold text-[#696976]">{l}</div><div className="mt-1 flex items-baseline gap-2"><span className="text-[26px] font-extrabold">{n}</span>{d}</div><div className="text-[11.5px] text-[#91919E]">vs previous {days} days</div></Card>)}
          </div>
          <Card title="Clicks and impressions"><LineChart a={s.daily.map((d) => d.clicks)} b={s.daily.map((d) => d.impressions)} labels={s.daily.map((d) => d.date.slice(5))} /></Card>
          {!!s.opportunities.length && (
            <Card title="Quick wins: terms on page 1–2 of Google" icon={<Lightbulb size={17} />} pad={false}>
              <p className="px-5 pb-2 pt-3 text-[12.5px] text-[#696976]">People already see the site for these, ranked 8–25. A better title, a paragraph that answers the search, or an internal link can move them to the top of page 1.</p>
              <Rows rows={s.opportunities} />
            </Card>
          )}
          <div className="grid items-start gap-5 xl:grid-cols-2">
            <Card title="Top search terms" pad={false}><Rows rows={s.queries} /></Card>
            <Card title="Top pages" pad={false}><Rows rows={s.pages} page /></Card>
          </div>
        </>
      )}
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <Card title="Visitors by channel (Google Analytics)">
          {!ga.configured ? <p className="text-[12.5px] text-[#696976]">Add the GA4 Property ID in the Google connection box to see where visitors come from.</p> : ga.error ? <Alert tone="bad">{ga.error}</Alert> : (
            <div className="flex flex-col gap-3">
              <p className="text-[13px]"><b>{ga.sessions?.toLocaleString()}</b> visits · <b>{ga.users?.toLocaleString()}</b> people in the last {days} days</p>
              {ga.channels?.slice(0, 8).map((c) => <div key={c.name}><div className="mb-1 flex text-[12.5px]"><span className="font-semibold">{c.name}</span><b className="ml-auto">{c.sessions.toLocaleString()}</b></div><Bar pct={(c.sessions / (ga.channels?.[0]?.sessions || 1)) * 100} color="#7C3AED" /></div>)}
            </div>
          )}
        </Card>
        <Card title="Speed (Core Web Vitals, mobile)" icon={<Gauge size={17} />}>
          {!v.ok ? <p className="text-[12.5px] text-[#696976]">{v.error && !/fetch failed|ENOTFOUND|ECONN/i.test(v.error) ? v.error : "Couldn't reach Google PageSpeed right now. Try again later."}</p> : (
            <div className="grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-4">
              {[["Score", v.score != null ? String(v.score) : "—", (v.score ?? 0) >= 90], ["LCP", v.lcp != null ? `${(v.lcp / 1000).toFixed(1)} s` : "—", (v.lcp ?? 9e9) <= 2500], ["INP", v.inp != null ? `${v.inp} ms` : "—", (v.inp ?? 9e9) <= 200], ["CLS", v.cls != null ? v.cls.toFixed(2) : "—", (v.cls ?? 9) <= 0.1]].map(([l, n, ok]) => (
                <div key={String(l)}><div className="text-[12px] font-semibold text-[#696976]">{l}</div><div className={`text-[22px] font-extrabold ${ok ? "text-[#067647]" : "text-[#B45309]"}`}>{n}</div></div>
              ))}
              <p className="col-span-full text-[11.5px] text-[#91919E]">{v.field ? "From real visitors in Chrome (last 28 days)." : "Lab test. Real-visitor data appears once the site has enough traffic."} Home page.</p>
            </div>
          )}
        </Card>
      </div>
      {s.configured && <GoogleConnect cfg={cfg} email={email} compact />}
    </>
  );
}
