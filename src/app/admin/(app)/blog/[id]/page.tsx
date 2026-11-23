import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { can, requireUser } from "@/lib/cms/auth";
import { one, q } from "@/lib/cms/db";
import type { CmsPost } from "@/lib/cms/content";
import { SITE_URL } from "@/lib/site";
import { PageHead } from "@/components/admin/ui";
import PostEditor from "@/components/admin/PostEditor";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export default function Page(props: Props) {
  return (
    <Suspense fallback={<p className="text-[#8494AB]">Loading…</p>}>
      <Edit {...props} />
    </Suspense>
  );
}

async function Edit({ params, searchParams }: Props) {
  const u = await requireUser("blog");
  const { id } = await params;
  const post = id === "new" ? null : await one<CmsPost>(`SELECT * FROM cms.cms_posts WHERE id = $1`, [Number(id) || 0]);
  if (id !== "new" && !post) notFound();
  const [cats, others] = await Promise.all([
    q<{ category: string }>(`SELECT DISTINCT category FROM cms.cms_posts WHERE category <> '' ORDER BY 1`),
    q<{ title: string }>(`SELECT title FROM cms.cms_posts WHERE id <> $1`, [post?.id ?? 0]),
  ]);
  const categories = [...new Set(["Fault codes & troubleshooting", "Repair guides", "Decision guide", "How we work", "Industry", ...cats.map((c) => c.category)])];
  return (
    <>
      <PageHead crumb={<><Link href="/admin/blog" className="hover:text-[#0052CC]">Blog</Link><ChevronRight size={13} /><span>{post ? post.status : "New post"}</span></>} title={post?.title || "New blog post"} />
      <PostEditor
        post={post ? { ...post, publish_at: post.publish_at ? new Date(post.publish_at).toISOString() : null, created_at: String(post.created_at), updated_at: String(post.updated_at) } : null}
        categories={categories}
        canPublish={can(u.role, "blog.publish")}
        me={u.name}
        site={SITE_URL}
        saved={(await searchParams).saved === "1"}
        otherTitles={others.map((o) => o.title)}
      />
    </>
  );
}
