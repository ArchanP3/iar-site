import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight, SearchCheck } from "lucide-react";
import { requireUser } from "@/lib/cms/auth";
import { q } from "@/lib/cms/db";
import { catLabel, computeAudit } from "@/lib/cms/crawl";
import { Bar, Card, PageHead, Pill, Score, Seg, ago, b } from "@/components/admin/ui";
import { Spark } from "@/components/admin/charts";
import ScanButton from "@/components/admin/ScanButton";

type Props = { searchParams: Promise<{ cat?: string; sev?: string }> };

export default function Page(props: Props) {
  return (
    <Suspense fallback={<p className="text-[#8494AB]">Loading…</p>}>
      <Audit {...props} />
    </Suspense>
  );
}

const sevTone = { critical: "bad", warning: "warn", tip: "blue" } as const;
const sevLabel = { critical: "Critical", warning: "Warning", tip: "Tip" } as const;
const barColor = (n: number) => (n >= 85 ? "#12B76A" : n >= 65 ? "#F59E0B" : "#EF4444");

async function Audit({ searchParams }: Props) {
  await requireUser("audit");
  const sp = await searchParams;
  const [audit, runs] = await Promise.all([
    computeAudit(),
    q<{ score: number | null; finished_at: Date; pages: number }>(`SELECT score, finished_at, pages FROM cms.cms_audit_runs WHERE finished_at IS NOT NULL ORDER BY id DESC LIMIT 20`),
  ]);
  const last = runs[0];
  const issues = audit.issues.filter((i) => (!sp.cat || i.category === sp.cat) && (!sp.sev || i.severity === sp.sev));
  const qs = (o: Record<string, string | undefined>) => "?" + new URLSearchParams(Object.entries({ cat: sp.cat, sev: sp.sev, ...o }).filter(([, v]) => v) as [string, string][]).toString();
  return (
    <>
      <PageHead title="SEO Audit" sub="Every page of the website is checked for titles, descriptions, headings, canonicals, links, images, schema and speed. Each issue links straight to the fix." actions={<ScanButton />} />
      {!audit.summary.crawled ? (
        <Card><div className="flex flex-col items-center gap-2 p-8 text-center text-[#5B6B84]"><SearchCheck size={28} className="text-[#8494AB]" />No scan yet. Press <b>Scan site now</b>. It takes about a minute.</div></Card>
      ) : (
        <>
          <div className="grid items-start gap-5 xl:grid-cols-[320px_1fr]">
            <Card>
              <div className="flex items-center gap-4">
                <Score value={audit.score} size={84} />
                <div><b className="text-[16px]">{audit.score >= 85 ? "Healthy" : audit.score >= 65 ? "Good, quick wins available" : "Needs work"}</b><p className="text-[12.5px] text-[#5B6B84]">{audit.summary.crawled} pages · last scan {last ? ago(last.finished_at) : "—"}</p></div>
              </div>
              {runs.length > 1 && <div className="mt-4"><div className="mb-1 text-[11.5px] font-semibold text-[#8494AB]">Score over the last {runs.length} scans</div><Spark values={runs.map((r) => r.score ?? 0).reverse()} w={270} h={40} /></div>}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div><b className="block text-[18px] text-[#EF4444]">{audit.summary.critical}</b><span className="text-[11.5px] text-[#8494AB]">Critical</span></div>
                <div><b className="block text-[18px] text-[#F59E0B]">{audit.summary.warnings}</b><span className="text-[11.5px] text-[#8494AB]">Warnings</span></div>
                <div><b className="block text-[18px] text-[#12B76A]">{audit.summary.healthy}</b><span className="text-[11.5px] text-[#8494AB]">Healthy pages</span></div>
              </div>
            </Card>
            <Card title="By area">
              <div className="grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
                {Object.entries(audit.cats).map(([k, n]) => (
                  <Link key={k} href={qs({ cat: sp.cat === k ? undefined : k })} className={`block rounded-lg p-1.5 ${sp.cat === k ? "bg-[#EEF4FB]" : "hover:bg-[#F8FAFD]"}`}>
                    <div className="mb-1 flex text-[13px]"><span className="font-semibold">{catLabel[k as keyof typeof catLabel]}</span><b className="ml-auto" style={{ color: barColor(n) }}>{n}</b></div>
                    <Bar pct={n} color={barColor(n)} />
                  </Link>
                ))}
              </div>
            </Card>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Seg active={sp.sev ?? "all"} items={[{ key: "all", label: `All (${audit.issues.length})`, href: qs({ sev: undefined }) }, ...(["critical", "warning", "tip"] as const).map((s) => ({ key: s, label: `${sevLabel[s]} (${audit.issues.filter((i) => i.severity === s).length})`, href: qs({ sev: s }) }))]} />
            {sp.cat && <Link href={qs({ cat: undefined })} className="text-[12.5px] font-semibold text-[#0052CC]">Showing {catLabel[sp.cat as keyof typeof catLabel]} only · show all</Link>}
          </div>
          <Card pad={false}>
            {!issues.length && <p className="p-8 text-center text-[#067647]">No issues here. Nice work.</p>}
            {issues.map((i) => (
              <details key={i.id} className="group border-b border-[#E3EAF3] last:border-0">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-3.5 hover:bg-[#F8FAFD]">
                  <ChevronRight size={15} className="text-[#8494AB] transition group-open:rotate-90" />
                  <Pill tone={sevTone[i.severity]}>{sevLabel[i.severity]}</Pill>
                  <b className="min-w-0 flex-1 text-[13.5px]">{i.title}</b>
                  <span className="text-[12.5px] text-[#5B6B84]">{i.pages.length} page{i.pages.length === 1 ? "" : "s"}</span>
                  <Link href={i.fixHref} className={b("light", true)}>{i.fix}</Link>
                </summary>
                <div className="bg-[#FAFCFE] px-12 pb-4 pt-1 text-[12.8px]">
                  <p className="text-[#33445F]">{i.detail}</p>
                  <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                    {i.pages.slice(0, 40).map((p) => <li key={p} className="truncate"><Link href={`/admin/pages/edit?path=${encodeURIComponent(p)}`} className="font-mono text-[12px] text-[#0052CC] hover:underline">{p}</Link></li>)}
                  </ul>
                  {i.pages.length > 40 && <p className="mt-1 text-[#8494AB]">and {i.pages.length - 40} more</p>}
                </div>
              </details>
            ))}
          </Card>
        </>
      )}
    </>
  );
}
