import Link from "next/link";
import { Suspense } from "react";
import { BookOpen, CheckCircle2, Circle, ClipboardCheck, Clock } from "lucide-react";
import { requireUser } from "@/lib/cms/auth";
import { one, q } from "@/lib/cms/db";
import { computeAudit } from "@/lib/cms/crawl";
import { searchData } from "@/lib/cms/google";
import { readSetting } from "@/lib/cms/settings";
import { Bar, Card, PageHead, Pill, b } from "@/components/admin/ui";
import { toggleTask } from "./actions";
import { weekKey } from "./week";
import { LEADS } from "@/lib/cms/leads";

/* Owner-only: a plain-English list of the SEO jobs that matter this week, built from the site's own data. */

type Task = { id: string; title: string; why: string; how: string; href: string; cta: string; mins: number; pri: 1 | 2 | 3 };

export default function Page() {
  return (
    <Suspense fallback={<p className="text-[#91919E]">Building this week&apos;s list…</p>}>
      <Checklist />
    </Suspense>
  );
}

async function Checklist() {
  await requireUser("checklist");
  const [audit, gsc, st, nf, lastScan, lastPost, leads, noalt] = await Promise.all([
    computeAudit(),
    searchData(28),
    readSetting("checklist"),
    q<{ path: string; hits: number }>(`SELECT path, hits FROM cms.cms_404 WHERE NOT ignored AND last_seen > now() - interval '30 days' AND path NOT IN (SELECT from_path FROM cms.cms_redirects) ORDER BY hits DESC LIMIT 5`),
    one<{ finished_at: Date }>(`SELECT finished_at FROM cms.cms_audit_runs WHERE finished_at IS NOT NULL ORDER BY id DESC LIMIT 1`),
    one<{ d: Date }>(`SELECT max(COALESCE(publish_at, created_at)) AS d FROM cms.cms_posts WHERE status IN ('published','scheduled')`),
    one<{ n: number }>(`SELECT count(*)::int AS n FROM (${LEADS}) l WHERE status = 'new'`),
    one<{ n: number }>(`SELECT count(*)::int AS n FROM cms.cms_media WHERE alt = ''`),
  ]);
  const wk = weekKey();
  const done = new Set(st.week === wk ? st.done : []);
  const days = (d?: Date | null) => (d ? (Date.now() - new Date(d).getTime()) / 86400000 : Infinity);
  const t: Task[] = [];

  if (days(lastScan?.finished_at) > 6) t.push({ id: "scan", title: "Scan the website", why: "Every other task on this list comes from the scan. It checks all pages for problems Google cares about.", how: "Press Scan site now and wait about a minute.", href: "/admin/audit", cta: "Open SEO Audit", mins: 2, pri: 1 });
  if (leads?.n) t.push({ id: "leads", title: `Reply to ${leads.n} new request${leads.n > 1 ? "s" : ""}`, why: "SEO brings the visitor; a fast reply wins the job.", how: "Open each one, reply by email or phone, then set the status to Contacted.", href: "/admin/leads?status=new", cta: "Open Leads", mins: 10, pri: 1 });
  for (const i of audit.issues.filter((x) => x.severity === "critical").slice(0, 3)) t.push({ id: `issue:${i.id}`, title: i.title, why: i.detail, how: `${i.pages.length} page${i.pages.length > 1 ? "s" : ""}. Open the list, then fix each page in its editor.`, href: i.fixHref, cta: i.fix, mins: 5 * Math.min(6, i.pages.length), pri: 1 });
  if (nf.length) t.push({ id: "404s", title: `Fix ${nf.length} broken link${nf.length > 1 ? "s" : ""} visitors hit`, why: `People (and Google) tried to open pages that don't exist, for example ${nf[0].path} (${nf[0].hits} times). Each one is a lost visitor.`, how: "On Redirects & 404s, press Redirect next to each one and choose the closest matching page.", href: "/admin/redirects", cta: "Open 404s", mins: 5, pri: 1 });
  for (const o of gsc.opportunities.slice(0, 3)) t.push({ id: `kw:${o.keys[0]}`, title: `Push “${o.keys[0]}” onto page 1`, why: `Google showed the site ${o.impressions.toLocaleString()} times for this search, but at position ${o.position.toFixed(0)}. Most clicks go to the top 5.`, how: "Find the page that should rank (search the term in Search Performance → Top pages). Put the term in its SEO title and first paragraph, answer the question clearly, and link to that page from one related page or blog post.", href: "/admin/performance", cta: "Open Search Performance", mins: 20, pri: 2 });
  for (const i of audit.issues.filter((x) => x.severity === "warning").slice(0, 2)) t.push({ id: `issue:${i.id}`, title: i.title, why: i.detail, how: "Fix the pages at the top of the list first; they get the most visitors.", href: i.fixHref, cta: i.fix, mins: 15, pri: 2 });
  if (noalt?.n) t.push({ id: "alt", title: `Describe ${noalt.n} image${noalt.n > 1 ? "s" : ""} (alt text)`, why: "Alt text tells Google and screen readers what an image shows. It helps images rank in Google Images.", how: "Write what the photo shows, with the part number or brand if visible, e.g. “Siemens 6SL3120 motor module on the test bench”.", href: "/admin/media", cta: "Open Media Library", mins: 10, pri: 2 });
  if (days(lastPost?.d) > 7) t.push({ id: "post", title: "Publish one helpful blog post", why: "Regular, useful articles (fault codes, repair-or-replace guides, how to ship a drive) bring new searches to the site and give AI assistants something to quote.", how: "Pick a question a customer asked this week. Answer it in 600–1,200 words with real steps, add 3 FAQs, and link to the matching service page.", href: "/admin/blog/new", cta: "Write a post", mins: 60, pri: 3 });
  if (gsc.configured) {
    const low = gsc.pages.filter((p) => p.impressions > 200 && p.ctr < 0.015).slice(0, 1)[0];
    if (low) t.push({ id: `ctr:${low.keys[0]}`, title: "Rewrite one title that gets seen but not clicked", why: `${low.keys[0].replace(/^https?:\/\/[^/]+/, "")} was shown ${low.impressions.toLocaleString()} times but only ${(low.ctr * 100).toFixed(1)}% clicked.`, how: "Make the title say exactly what the page offers (brand, part type, “repair”, “in stock”) and the description why to choose you (free evaluation, warranty).", href: `/admin/pages/edit?path=${encodeURIComponent(low.keys[0].replace(/^https?:\/\/[^/]+/, "") || "/")}`, cta: "Edit page SEO", mins: 10, pri: 3 });
  } else t.push({ id: "gsc", title: "Connect Google Search Console", why: "Without it you can't see what people search to find the site, or which pages are close to page 1.", how: "Follow the steps on Search Performance. It's free and takes about 10 minutes.", href: "/admin/performance", cta: "Set up", mins: 10, pri: 2 });
  if (new Date().getDate() <= 7) t.push({ id: "backup", title: "Download the monthly backup", why: "A copy of all CMS content kept outside the server, in case anything goes wrong.", how: "Press Download backup and save the file to the company drive.", href: "/admin/users", cta: "Open backup", mins: 1, pri: 3 });

  const total = t.length, finished = t.filter((x) => done.has(x.id)).length;
  const priLabel = { 1: ["Do first", "bad"], 2: ["This week", "warn"], 3: ["If there's time", "blue"] } as const;
  return (
    <>
      <PageHead title="Weekly checklist" sub="The SEO jobs that matter most this week, in plain English, picked from your own website and Google data. Only Super Admins and Admins see this screen. The list starts fresh every Monday." />
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <ClipboardCheck size={22} className="text-[#C8102E]" />
          <div className="min-w-50 flex-1"><b className="text-[15px]">{finished} of {total} done this week</b><div className="mt-1.5"><Bar pct={total ? (finished / total) * 100 : 100} color="#12B76A" /></div></div>
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[#696976]"><Clock size={14} /> about {Math.round(t.filter((x) => !done.has(x.id)).reduce((s, x) => s + x.mins, 0) / 5) * 5} minutes left</span>
        </div>
      </Card>
      <div className="flex flex-col gap-3">
        {!t.length && <Card><p className="py-6 text-center text-[#067647]">Nothing urgent this week. Write a blog post or improve one service page.</p></Card>}
        {t.map((x) => {
          const on = done.has(x.id);
          return (
            <div key={x.id} className={`flex gap-4 rounded-2xl border bg-white p-4 sm:p-5 ${on ? "border-[#EAEAEC] opacity-60" : "border-[#EAEAEC]"}`}>
              <form action={toggleTask}><input type="hidden" name="id" value={x.id} /><button aria-label={on ? "Mark not done" : "Mark done"} className="mt-0.5 text-[#12B76A]">{on ? <CheckCircle2 size={22} /> : <Circle size={22} className="text-[#C4C4CA]" />}</button></form>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><b className={`text-[14.5px] ${on ? "line-through" : ""}`}>{x.title}</b><Pill tone={priLabel[x.pri][1]}>{priLabel[x.pri][0]}</Pill><span className="text-[12px] text-[#91919E]">~{x.mins} min</span></div>
                <p className="mt-1.5 text-[13px] text-[#45454D]"><b>Why:</b> {x.why}</p>
                <p className="mt-1 text-[13px] text-[#45454D]"><b>How:</b> {x.how}</p>
              </div>
              <Link href={x.href} className={`${b("light", true)} self-start`}>{x.cta}</Link>
            </div>
          );
        })}
      </div>
      <Card title="SEO in five sentences" icon={<BookOpen size={17} />}>
        <ol className="list-decimal space-y-1.5 pl-5 text-[13px] text-[#45454D]">
          <li>Each page should answer one search well: one clear topic, said in its title, H1 and first paragraph.</li>
          <li>The SEO title (under 60 characters) and description (under 160) are your ad in Google. Make people want to click.</li>
          <li>Never delete or rename a page without a redirect; this CMS adds one automatically when you change a URL.</li>
          <li>Link related pages to each other, so visitors and Google can find them.</li>
          <li>Publish real, specific help (part numbers, fault codes, steps) regularly. That is what ranks and what AI assistants quote.</li>
        </ol>
      </Card>
    </>
  );
}
