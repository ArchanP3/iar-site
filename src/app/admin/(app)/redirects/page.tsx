import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight, Download, Info, TriangleAlert } from "lucide-react";
import { requireUser } from "@/lib/cms/auth";
import { one, q } from "@/lib/cms/db";
import { siteUrls } from "@/lib/cms/inventory";
import { Card, PageHead, Pill, Table, ago, b } from "@/components/admin/ui";
import { Fix404, ImportCsv, RedirectForm, RowActions } from "@/components/admin/RedirectForms";

type SP = Promise<{ edit?: string; q?: string }>;

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<p className="text-[#8494AB]">Loading…</p>}>
      <Redirects searchParams={searchParams} />
    </Suspense>
  );
}

const tokens = (p: string) => p.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1);

async function Redirects({ searchParams }: { searchParams: SP }) {
  await requireUser("redirects");
  const sp = await searchParams;
  const [list, nf, urls] = await Promise.all([
    q<{ id: number; from_path: string; to_path: string; code: number; match: string; source: string; note: string | null; active: boolean; hits: number; last_hit: Date | null; expires_at: Date | null }>(
      `SELECT * FROM cms.cms_redirects ${sp.q ? "WHERE from_path ILIKE $1 OR to_path ILIKE $1" : ""} ORDER BY created_at DESC LIMIT 500`, sp.q ? [`%${sp.q}%`] : [],
    ),
    q<{ path: string; hits: number; last_seen: Date; referrer: string | null }>(
      `SELECT path, hits, last_seen, referrer FROM cms.cms_404 WHERE NOT ignored AND path NOT IN (SELECT from_path FROM cms.cms_redirects) ORDER BY last_seen DESC LIMIT 100`,
    ),
    siteUrls(),
  ]);
  const editing = sp.edit ? await one<{ id: number; from_path: string; to_path: string; code: number; match: string; note: string | null; expires_at: Date | null }>(`SELECT * FROM cms.cms_redirects WHERE id = $1`, [Number(sp.edit)]) : null;
  const suggest = (path: string) => {
    if (/wp-|\.php|xmlrpc|\.env/.test(path)) return null;
    const t = tokens(path);
    let best: { p: string; s: number } | null = null;
    for (const u of urls) {
      const s = tokens(u.path).filter((x) => t.includes(x)).length;
      if (s && (!best || s > best.s || (s === best.s && u.path.length < best.p.length))) best = { p: u.path, s };
    }
    return best?.p ?? null;
  };

  return (
    <>
      <PageHead
        title="Redirects & 404s"
        sub="Create, edit or remove redirects yourself. Missing pages that visitors hit are caught below and fixed in one click."
        actions={<><ImportCsv /><a href="/admin/export/redirects" className={b("light", true)}><Download size={13} /> Export CSV</a></>}
      />
      <Card title={editing ? "Edit redirect" : "Add a redirect"} right={editing && <Link href="/admin/redirects" className={b("light", true)}>Cancel</Link>}>
        <div id="form">
          <RedirectForm initial={editing ? { id: editing.id, from: editing.from_path, to: editing.to_path, code: editing.code, match: editing.match, note: editing.note, expires: editing.expires_at ? new Date(editing.expires_at).toISOString().slice(0, 10) : null } : undefined} />
        </div>
      </Card>

      <Card title="404 monitor" icon={<TriangleAlert size={17} />} right={<><Pill tone={nf.length ? "bad" : "ok"}>{nf.length} to fix</Pill><span className="text-[12px] text-[#8494AB]">Pages visitors tried to open that don&apos;t exist</span></>} pad={false}>
        {nf.length ? (
          <Table head={["Missing URL", "Hits", "Last seen", "Came from", "Fix"]}>
            {nf.map((r) => (
              <tr key={r.path}>
                <td className="max-w-65 truncate font-mono text-[12.5px]">{r.path}</td>
                <td className="font-bold">{r.hits}</td>
                <td className="whitespace-nowrap text-[#5B6B84]">{ago(r.last_seen)}</td>
                <td className="max-w-50 truncate text-[12px] text-[#8494AB]">{r.referrer || "direct / unknown"}</td>
                <td><Fix404 path={r.path} suggestion={suggest(r.path)} /></td>
              </tr>
            ))}
          </Table>
        ) : <p className="p-6 text-center text-[#8494AB]">No broken links visited in the last weeks.</p>}
      </Card>

      <Card title="Redirects" right={<><Pill>{list.length}</Pill><form><input name="q" defaultValue={sp.q} placeholder="Search" className="h-8 w-40 rounded-[9px] border border-[#E3EAF3] px-2.5 text-[12.5px] outline-none" /></form></>} pad={false}>
        {list.length ? (
          <Table head={["From", "", "To", "Type", "Source", "Hits", ""]}>
            {list.map((r) => (
              <tr key={r.id} className={r.active ? "" : "opacity-50"}>
                <td className="font-mono text-[12.5px]">{r.from_path}{r.match === "prefix" && <span className="text-[#8494AB]">{"/*"}</span>}</td>
                <td className="text-[#8494AB]"><ChevronRight size={14} /></td>
                <td className="font-mono text-[12.5px]">{r.code === 410 ? "—" : r.to_path}</td>
                <td><Pill tone={r.code === 410 ? "bad" : r.code === 301 || r.code === 308 ? "ok" : "warn"}>{r.code}</Pill></td>
                <td><Pill tone={r.source === "slug change" ? "blue" : "gray"}>{r.source === "slug change" ? "Auto · URL change" : r.source[0].toUpperCase() + r.source.slice(1)}{r.expires_at ? ` · ends ${new Date(r.expires_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}` : ""}</Pill></td>
                <td className="font-bold" title={r.last_hit ? `Last used ${ago(r.last_hit)}` : "Not used yet"}>{r.hits}</td>
                <td><RowActions id={r.id} active={r.active} /></td>
              </tr>
            ))}
          </Table>
        ) : <p className="flex items-center justify-center gap-2 p-6 text-[#8494AB]"><Info size={15} /> No redirects yet.</p>}
      </Card>
    </>
  );
}
