import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRightLeft, ChevronRight, Eye, Gauge, History, Inbox, Info, MapPin, MousePointerClick, Newspaper, PartyPopper, Plus, SearchCheck, Sparkles, TrendingDown, TrendingUp,
} from "lucide-react";
import { can, requireUser } from "@/lib/cms/auth";
import { one, q } from "@/lib/cms/db";
import { computeAudit } from "@/lib/cms/crawl";
import { searchData, vitals } from "@/lib/cms/google";
import { SITE_URL } from "@/lib/site";
import { Alert, Card, PageHead, Pill, Score, Table, ago, b } from "@/components/admin/ui";
import { Spark } from "@/components/admin/charts";
import ScanButton from "@/components/admin/ScanButton";
import { LEADS } from "@/lib/cms/leads";
import { activityMask } from "@/lib/cms/activity";

type SP = Promise<{ welcome?: string; denied?: string }>;

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<p className="text-[#8494AB]">Loading dashboard…</p>}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}

const fmt = (n: number) => (n >= 10_000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString("en-US"));
function Delta({ now, before, invert, suffix = "%" }: { now: number; before: number; invert?: boolean; suffix?: string }) {
  if (!before) return <span className="text-[12px] text-[#8494AB]">vs previous period</span>;
  const d = suffix === "%" ? ((now - before) / before) * 100 : before - now;
  const good = invert ? d > 0 : d >= 0;
  const Icon = good ? TrendingUp : TrendingDown;
  return <span className={`inline-flex items-center gap-1 text-[12px] font-bold ${good ? "text-[#12B76A]" : "text-[#EF4444]"}`}><Icon size={13} /> {d >= 0 ? "+" : ""}{d.toFixed(1)}{suffix === "%" ? "%" : ""} <span className="font-semibold text-[#8494AB]">vs previous 28 days</span></span>;
}

async function Dashboard({ searchParams }: { searchParams: SP }) {
  const u = await requireUser("dashboard");
  const sp = await searchParams;
  const [audit, activity, gsc, leads, { who, what }] = await Promise.all([
    computeAudit(),
    q<{ user_name: string; action: string; target: string; created_at: Date }>(`SELECT user_name, action, target, created_at FROM cms.cms_activity ORDER BY id DESC LIMIT 6`),
    searchData(28),
    can(u.role, "leads") ? one<{ month: number; prev: number; fresh: number }>(`SELECT count(*) FILTER (WHERE created_at > now() - interval '28 days')::int AS month, count(*) FILTER (WHERE created_at <= now() - interval '28 days' AND created_at > now() - interval '56 days')::int AS prev, count(*) FILTER (WHERE status = 'new')::int AS fresh FROM (${LEADS}) l WHERE status NOT IN ('spam', 'test')`) : null,
    activityMask(u.role),
  ]);
  const hour = new Date().toLocaleString("en-CA", { hour: "numeric", hour12: false, timeZone: "America/Toronto" });
  const greet = Number(hour) < 12 ? "Good morning" : Number(hour) < 18 ? "Good afternoon" : "Good evening";
  const first = u.name.split(" ")[0];
  const scanned = audit.summary.crawled > 0;

  return (
    <>
      {sp.welcome && <Alert tone="ok" icon={<PartyPopper size={16} />}><b>Welcome to the AutomIQ CMS.</b> Start with <b>Scan site now</b> so every screen fills with your pages. Then add your team under Users &amp; Activity.</Alert>}
      {sp.denied && <Alert tone="warn" icon={<Info size={16} />}>Your role doesn&apos;t include that screen. Ask a Super Admin or Admin if you need access.</Alert>}
      <PageHead title={`${greet}, ${first}`} sub="How automiqautomation.com is doing on Google and what needs attention." actions={can(u.role, "audit") ? <ScanButton /> : undefined} />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {gsc.configured && !gsc.error ? (
          <>
            <Kpi icon={<MousePointerClick size={15} />} label="Clicks from Google" value={fmt(gsc.totals.clicks)} delta={<Delta now={gsc.totals.clicks} before={gsc.prev.clicks} />} spark={gsc.daily.map((d) => d.clicks)} />
            <Kpi icon={<Eye size={15} />} label="Impressions" value={fmt(gsc.totals.impressions)} delta={<Delta now={gsc.totals.impressions} before={gsc.prev.impressions} />} spark={gsc.daily.map((d) => d.impressions)} />
            <Kpi icon={<Gauge size={15} />} label="Avg. position" value={gsc.totals.position.toFixed(1)} delta={<Delta now={gsc.totals.position} before={gsc.prev.position} suffix="" />} />
          </>
        ) : (
          <Card className="sm:col-span-2 xl:col-span-3">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FF] text-[#0066FF]"><TrendingUp size={20} /></div>
              <div className="min-w-0 flex-1">
                <b>{gsc.error ? "Google Search Console needs attention" : "Connect Google Search Console"}</b>
                <p className="text-[12.8px] text-[#5B6B84]">{gsc.error ?? "Clicks, impressions, rankings and keyword opportunities from Google appear here once it's connected. It's free."}</p>
              </div>
              {can(u.role, "performance") && <Link href="/admin/performance" className={b("dark")}>Set up</Link>}
            </div>
          </Card>
        )}
        {leads ? (
          <Kpi icon={<Inbox size={15} />} label="Leads (28 days)" value={String(leads.month)} delta={<span className="text-[12px] font-semibold text-[#8494AB]">{leads.fresh} not opened · {leads.prev} the 28 days before</span>} />
        ) : (
          <Kpi icon={<SearchCheck size={15} />} label="SEO health" value={scanned ? String(audit.score) : "—"} delta={<span className="text-[12px] font-semibold text-[#8494AB]">{scanned ? `${audit.summary.crawled} pages scanned` : "Run the first scan"}</span>} />
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <Card title="SEO health" icon={<SearchCheck size={17} />} right={can(u.role, "audit") && <Link href="/admin/audit" className={b("light", true)}>Open full audit</Link>} pad={false}>
          {scanned ? (
            <>
              <div className="flex flex-wrap items-center gap-5 border-b border-[#E3EAF3] p-4.5">
                <Score value={audit.score} />
                <div className="min-w-50 flex-1">
                  <b className="text-[15px]">{audit.score >= 85 ? "Healthy" : audit.score >= 65 ? "Good, with quick wins available" : "Needs work"}</b>
                  <p className="mt-0.5 text-[#5B6B84]">{audit.summary.crawled} pages scanned. Fix the issues below, top first.</p>
                </div>
                <div className="flex gap-5 text-center">
                  <div><b className="block text-[18px] text-[#EF4444]">{audit.summary.critical}</b><span className="text-[11.5px] text-[#8494AB]">Critical</span></div>
                  <div><b className="block text-[18px] text-[#F59E0B]">{audit.summary.warnings}</b><span className="text-[11.5px] text-[#8494AB]">Warnings</span></div>
                  <div><b className="block text-[18px] text-[#12B76A]">{audit.summary.healthy}</b><span className="text-[11.5px] text-[#8494AB]">Healthy pages</span></div>
                </div>
              </div>
              <Table head={["Severity", "Issue", "Pages", ""]}>
                {audit.issues.slice(0, 5).map((i) => (
                  <tr key={i.id}>
                    <td><Pill tone={i.severity === "critical" ? "bad" : i.severity === "warning" ? "warn" : "blue"}>{i.severity === "critical" ? "Critical" : i.severity === "warning" ? "Warning" : "Tip"}</Pill></td>
                    <td className="font-bold">{i.title}</td>
                    <td>{i.pages.length}</td>
                    <td className="text-right"><Link href={i.fixHref} className={b("light", true)}>{i.fix} <ChevronRight size={14} /></Link></td>
                  </tr>
                ))}
              </Table>
              {!audit.issues.length && <p className="p-6 text-center text-[#067647]">No issues found. Nice work.</p>}
            </>
          ) : (
            <div className="p-6 text-center text-[#5B6B84]">No scan yet. Press <b>Scan site now</b> at the top to check every page.</div>
          )}
        </Card>
        <Card title="Recent activity" icon={<History size={17} />} right={can(u.role, "activity") && <Link href="/admin/users#activity" className="text-[12.5px] font-semibold text-[#5B6B84]">View all</Link>}>
          {activity.length ? activity.map((a, i) => (
            <div key={i} className="flex items-center gap-2.5 border-b border-[#EEF3F9] py-2.5 last:border-0">
              <div className="flex h-7.5 w-7.5 flex-none items-center justify-center rounded-full bg-linear-to-br from-[#0066FF] to-[#00B0FF] text-[11px] font-bold text-white">{who(a.user_name).split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</div>
              <div className="min-w-0 flex-1 leading-snug"><b>{who(a.user_name)}</b> <span className="text-[#5B6B84]">{a.action}</span><div className="truncate font-mono text-[12px] text-[#5B6B84]">{what(a.target)}</div></div>
              <span className="whitespace-nowrap text-[12px] text-[#8494AB]">{ago(a.created_at)}</span>
            </div>
          )) : <p className="text-[#8494AB]">Nothing yet. Changes made in the CMS show here.</p>}
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <Card title="Top search queries" icon={<TrendingUp size={17} />} right={<Pill>Google Search Console</Pill>} pad={false}>
          {gsc.queries.length ? (
            <Table head={["Query", "Clicks", "Impressions", "Position"]}>
              {gsc.queries.slice(0, 8).map((r) => (
                <tr key={r.keys[0]}><td className="font-bold">{r.keys[0]}</td><td>{r.clicks}</td><td>{fmt(r.impressions)}</td><td>{r.position.toFixed(1)}</td></tr>
              ))}
            </Table>
          ) : <p className="p-6 text-center text-[#8494AB]">{gsc.configured ? "No search data for this period yet." : "Connect Search Console to see what people search to find you."}</p>}
        </Card>
        <div className="flex flex-col gap-5">
          <Suspense fallback={<Card title="Core Web Vitals" icon={<Gauge size={17} />}><p className="text-[#8494AB]">Checking with Google…</p></Card>}>
            <Vitals />
          </Suspense>
          <Card title="Quick actions" icon={<Sparkles size={17} />}>
            <div className="grid grid-cols-2 gap-2.5">
              {can(u.role, "blog") && <Link href="/admin/blog/new" className={b("light")}><Newspaper size={15} /> New blog post</Link>}
              {can(u.role, "landing") && <Link href="/admin/landing/new" className={b("light")}><Plus size={15} /> New page</Link>}
              {can(u.role, "redirects") && <Link href="/admin/redirects" className={b("light")}><ArrowRightLeft size={15} /> Add redirect</Link>}
              {can(u.role, "landing") && <Link href="/admin/landing?tab=templates" className={b("light")}><MapPin size={15} /> New city page</Link>}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function Kpi({ icon, label, value, delta, spark }: { icon: React.ReactNode; label: string; value: string; delta: React.ReactNode; spark?: number[] }) {
  return (
    <Card>
      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#5B6B84]">{icon}{label}</div>
      <div className="mt-1.5 flex items-center"><span className="text-[26px] font-extrabold tracking-[-0.02em]">{value}</span><span className="flex-1" />{spark && <Spark values={spark} />}</div>
      <div className="mt-1">{delta}</div>
    </Card>
  );
}

async function Vitals() {
  const v = await vitals(SITE_URL);
  const row = (k: string, name: string, val: string, good: boolean) => (
    <div className="flex items-center gap-2 py-2"><b className="w-10">{k}</b><span className="text-[12.5px] text-[#5B6B84]">{name}</span><span className="flex-1" /><b>{val}</b><Pill tone={good ? "ok" : "warn"}>{good ? "Good" : "Improve"}</Pill></div>
  );
  return (
    <Card title="Core Web Vitals" icon={<Gauge size={17} />} right={v.ok && <Pill tone={(v.score ?? 0) >= 90 ? "ok" : "warn"}>Score {v.score}</Pill>}>
      {v.ok ? (
        <>
          {row("LCP", "Largest Contentful Paint", `${v.lcp?.toFixed(1)} s`, (v.lcp ?? 9) <= 2.5)}
          {v.field ? row("INP", "Interaction to Next Paint", `${v.inp ?? "—"} ms`, (v.inp ?? 999) <= 200) : row("TBT", "Total Blocking Time", `${Math.round(v.inp ?? 0)} ms`, (v.inp ?? 999) <= 200)}
          {row("CLS", "Cumulative Layout Shift", (v.cls ?? 0).toFixed(2), (v.cls ?? 1) <= 0.1)}
          <p className="mt-1 text-[11.5px] text-[#8494AB]">Mobile · {v.field ? "real visitors (Chrome data)" : "lab test"} · from Google PageSpeed Insights</p>
        </>
      ) : <p className="text-[12.8px] text-[#8494AB]">Google PageSpeed couldn&apos;t check the site right now{v.error ? ` (${v.error})` : ""}. It runs again automatically.</p>}
    </Card>
  );
}
