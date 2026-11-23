import Link from "next/link";
import { Suspense } from "react";
import { Lock, Newspaper, Plus } from "lucide-react";
import { requireUser } from "@/lib/cms/auth";
import { q } from "@/lib/cms/db";
import { posts as codePosts, postUrl } from "@/lib/blog";
import { Card, PageHead, Pill, Table, ago, b } from "@/components/admin/ui";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-[#8494AB]">Loading…</p>}>
      <Blog />
    </Suspense>
  );
}

const tone = { published: "ok", scheduled: "blue", review: "violet", draft: "warn" } as const;

async function Blog() {
  await requireUser("blog");
  const rows = await q<{ id: number; slug: string; title: string; status: keyof typeof tone; category: string; author_name: string; publish_at: Date | null; updated_at: Date; updated_by: string | null; body: string }>(
    `SELECT id, slug, title, status, category, author_name, publish_at, updated_at, updated_by, body FROM cms.cms_posts ORDER BY updated_at DESC`,
  );
  return (
    <>
      <PageHead title="Blog" sub="Write, schedule and publish posts. Each one gets its own page, Article and FAQ schema, and a place in the posts sitemap." actions={<Link href="/admin/blog/new" className={b("primary")}><Plus size={16} /> New post</Link>} />
      <Card pad={false}>
        <Table head={["Title", "Status", "Category", "Author", "Words", "Updated"]}>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-[#F8FAFD]">
              <td className="max-w-105"><Link href={`/admin/blog/${r.id}`} className="block truncate font-bold hover:text-[#0052CC]">{r.title}</Link><span className="font-mono text-[12px] text-[#8494AB]">{postUrl(r.slug)}</span></td>
              <td><Pill tone={tone[r.status] ?? "gray"}>{r.status === "scheduled" && r.publish_at ? `Scheduled · ${new Date(r.publish_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}` : r.status[0].toUpperCase() + r.status.slice(1)}</Pill></td>
              <td>{r.category || "—"}</td>
              <td>{r.author_name || "—"}</td>
              <td>{r.body.split(/\s+/).filter(Boolean).length.toLocaleString()}</td>
              <td className="whitespace-nowrap text-[#5B6B84]">{ago(r.updated_at)}{r.updated_by ? ` · ${r.updated_by}` : ""}</td>
            </tr>
          ))}
          {codePosts.map((p) => (
            <tr key={p.slug} className="bg-[#FAFCFE]">
              <td className="max-w-105"><a href={postUrl(p.slug)} target="_blank" className="block truncate font-bold">{p.title}</a><span className="font-mono text-[12px] text-[#8494AB]">{postUrl(p.slug)}</span></td>
              <td><Pill tone="ok">Published</Pill></td>
              <td>{p.tag}</td>
              <td>AutomIQ team</td>
              <td>—</td>
              <td className="text-[#8494AB]"><span className="inline-flex items-center gap-1"><Lock size={12} /> Built into the site · SEO in <Link href={`/admin/pages/edit?path=${encodeURIComponent(postUrl(p.slug))}`} className="font-semibold text-[#0052CC]">Pages</Link></span></td>
            </tr>
          ))}
        </Table>
        {!rows.length && <p className="flex items-center justify-center gap-2 border-t border-[#E3EAF3] p-5 text-[#5B6B84]"><Newspaper size={15} /> Your first CMS post will appear above the built-in guides.</p>}
      </Card>
    </>
  );
}
