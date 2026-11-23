import Link from "next/link";
import { Suspense } from "react";
import { Download, Eye, EyeOff, Filter, Info, Pencil, Search } from "lucide-react";
import { requireUser } from "@/lib/cms/auth";
import { pagesOverview } from "@/lib/cms/pages-data";
import { groupLabel, type Group } from "@/lib/cms/inventory";
import { Alert, Bar, Card, PageHead, Pill, Table, b, lenColor } from "@/components/admin/ui";
import ScanButton from "@/components/admin/ScanButton";
import BulkBar from "@/components/admin/BulkBar";

type SP = Promise<{ g?: string; q?: string; issue?: string; edited?: string }>;

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<p className="text-[#91919E]">Loading pages…</p>}>
      <Pages searchParams={searchParams} />
    </Suspense>
  );
}

async function Pages({ searchParams }: { searchParams: SP }) {
  await requireUser("pages");
  const sp = await searchParams;
  const { rows, audit, scanned } = await pagesOverview();
  const groups = Object.keys(groupLabel).filter((g) => rows.some((r) => r.group === g)) as Group[];
  const issue = audit.issues.find((i) => i.id === sp.issue);
  let list = rows;
  if (sp.g) list = list.filter((r) => r.group === sp.g);
  if (issue) list = list.filter((r) => issue.pages.includes(r.path));
  if (sp.edited) list = list.filter((r) => r.edited);
  if (sp.q) {
    const k = sp.q.toLowerCase();
    list = list.filter((r) => r.path.includes(k) || r.title.toLowerCase().includes(k));
  }
  const qs = (o: Record<string, string | undefined>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, ...o }).filter(([, v]) => v) as [string, string][]);
    const s = p.toString();
    return `/admin/pages${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHead
        title="Pages"
        sub="Every page on the site with its SEO status. Click a page to edit its title, description, URL, schema and more."
        actions={<><a href="/admin/export/pages" className={b()}><Download size={15} /> Export CSV</a><ScanButton /></>}
      />
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="inline-flex flex-wrap rounded-[10px] bg-[#F2F2F3] p-0.75">
          <Link href={qs({ g: undefined })} className={`rounded-lg px-3 py-1.5 text-[12.5px] font-semibold ${!sp.g ? "bg-white shadow-[0_1px_3px_rgba(19,19,22,0.12)]" : "text-[#696976]"}`}>All {rows.length}</Link>
          {groups.map((g) => (
            <Link key={g} href={qs({ g })} className={`rounded-lg px-3 py-1.5 text-[12.5px] font-semibold ${sp.g === g ? "bg-white shadow-[0_1px_3px_rgba(19,19,22,0.12)]" : "text-[#696976]"}`}>
              {groupLabel[g]} {rows.filter((r) => r.group === g).length}
            </Link>
          ))}
        </div>
        <div className="flex-1" />
        <Link href={qs({ edited: sp.edited ? undefined : "1" })} className={b(sp.edited ? "dark" : "light", true)}><Pencil size={13} /> Edited only</Link>
        <form className="flex h-8 items-center gap-2 rounded-[9px] border border-[#EAEAEC] bg-white px-2.5">
          {sp.g && <input type="hidden" name="g" value={sp.g} />}
          <Search size={14} className="text-[#91919E]" />
          <input name="q" defaultValue={sp.q} placeholder="Filter" className="w-36 bg-transparent text-[12.5px] outline-none" />
        </form>
      </div>
      {!scanned && (
        <Alert tone="warn" icon={<Info size={16} />}>
          <b>Run the first scan</b> to see each page&apos;s current title, description and SEO score. It reads every page the way Google does and takes about a minute.
        </Alert>
      )}
      {issue && (
        <Alert icon={<Filter size={16} />}>
          Showing pages with: <b>{issue.title}</b> ({issue.pages.length}). {issue.detail} <Link href={qs({ issue: undefined })} className="font-bold text-[#A50D25]">Show all</Link>
        </Alert>
      )}
      <Card pad={false}>
        <BulkBar paths={list.map((r) => r.path)}>
          <Table head={["", "Page", "Type", "Title", "Description", "Indexing", "SEO score"]}>
            {list.map((r) => {
              const tl = r.title.length, dl = r.description.length;
              const sc = r.score;
              const scColor = sc === null ? "#91919E" : sc >= 85 ? "#12B76A" : sc >= 65 ? "#F59E0B" : "#EF4444";
              return (
                <tr key={r.path} className="hover:bg-[#FAFAFB]">
                  <td className="w-8.5"><input type="checkbox" name="sel" value={r.path} className="h-4 w-4 accent-[#C8102E]" /></td>
                  <td className="max-w-105">
                    <Link href={`/admin/pages/edit?path=${encodeURIComponent(r.path)}`} className="block">
                      <span className="block truncate font-bold hover:text-[#A50D25]">{r.title || <span className="font-semibold text-[#91919E]">{scanned ? "No title" : "Not scanned yet"}</span>}</span>
                      <span className="mt-0.5 block truncate font-mono text-[12px] text-[#91919E]">{r.shown}{r.shown !== r.path && <span className="ml-1.5 font-sans text-[11px] font-bold text-[#A50D25]">URL changed</span>}</span>
                    </Link>
                  </td>
                  <td><Pill>{groupLabel[r.group]}</Pill>{r.edited && <span className="ml-1.5"><Pill tone="blue">Edited</Pill></span>}</td>
                  <td className="whitespace-nowrap"><b style={{ color: lenColor(tl, 30, 60) }}>{tl}</b><span className="text-[#91919E]"> / 60</span></td>
                  <td className="whitespace-nowrap"><b style={{ color: lenColor(dl, 70, 160) }}>{dl}</b><span className="text-[#91919E]"> / 160</span></td>
                  <td>{r.noindex ? <Pill><EyeOff size={12} /> noindex</Pill> : <Pill tone="ok"><Eye size={12} /> index</Pill>}</td>
                  <td>{sc === null ? <span className="text-[#91919E]">n/a</span> : <div className="flex items-center gap-2"><b className="w-7" style={{ color: scColor }}>{sc}</b><div className="w-16"><Bar pct={sc} color={scColor} /></div></div>}</td>
                </tr>
              );
            })}
          </Table>
        </BulkBar>
        {!list.length && <p className="px-5 py-10 text-center text-[#91919E]">No pages match.</p>}
      </Card>
      <p className="text-[12px] text-[#91919E]">Google shows about 60 title characters and 160 description characters.</p>
    </>
  );
}
