import { Suspense } from "react";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { requireUser } from "@/lib/cms/auth";
import { one } from "@/lib/cms/db";
import type { CmsLanding } from "@/lib/cms/content";
import { Blocks } from "@/components/cms/Blocks";

/* Preview any landing page or template, including drafts. */
type Props = { params: Promise<{ id: string }> };

export default function Page(props: Props) {
  return (
    <Suspense>
      <Preview {...props} />
    </Suspense>
  );
}

async function Preview({ params }: Props) {
  await requireUser("landing");
  const page = await one<CmsLanding>(`SELECT * FROM cms.cms_landing WHERE id = $1`, [Number((await params).id) || 0]);
  if (!page) notFound();
  const tpl = page.template_id ? await one<CmsLanding>(`SELECT * FROM cms.cms_landing WHERE id = $1`, [page.template_id]) : null;
  const vars = { ...(tpl?.vars ?? {}), ...page.vars };
  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#131316]">
      <div className="sticky top-0 z-70 bg-[#F59E0B] px-4 py-2 text-center text-[13px] font-bold text-[#3B2500]">
        Preview{page.kind === "template" ? ` of template with sample city: ${vars.city ?? ""}` : page.status !== "published" ? " — this draft is not live yet" : ""}
      </div>
      <Header />
      <Blocks blocks={(tpl ?? page).blocks} vars={vars} />
      <Footer />
    </div>
  );
}
