import type { Metadata } from "next";
import { fitTitle } from "@/lib/seo";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Clock, Wrench } from "lucide-react";
import ResourceShell from "@/components/resources/ResourceShell";
import { getPost, posts, postUrl, prettyDate, tagInk } from "@/lib/blog";
import { absoluteFor, onThisSite, SITE_URL } from "@/lib/site";
import { PageExtras, withSeo } from "@/lib/cms/seo";
import { postBySlug, readMinutes, type CmsPost } from "@/lib/cms/content";
import { allPostCards } from "@/lib/cms/blog";
import { renderMarkdown } from "@/lib/cms/markdown";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const p = getPost(slug);
  if (p) {
    return withSeo(postUrl(p.slug), {
      title: { absolute: fitTitle(`${p.title} | IAR`) },
      description: p.description,
      alternates: { canonical: `${SITE_URL}${postUrl(p.slug)}` },
      openGraph: { type: "article", title: p.title, description: p.description, publishedTime: p.date, images: [{ url: `${SITE_URL}${p.image}`, alt: p.title }] },
    });
  }
  const d = await postBySlug(slug);
  if (!d || !onThisSite(d.site)) return {};
  const title = d.seo_title || `${d.title} | IAR`;
  const description = d.seo_description || d.excerpt;
  return withSeo(postUrl(d.slug), {
    title: { absolute: title },
    description,
    alternates: { canonical: `${SITE_URL}${postUrl(d.slug)}`, ...(d.site === "both" ? {} : { languages: {} }) },
    openGraph: { type: "article", title: d.title, description, publishedTime: new Date(d.publish_at ?? d.created_at).toISOString(), modifiedTime: new Date(d.updated_at).toISOString(), ...(d.cover ? { images: [{ url: d.cover, alt: d.cover_alt ?? d.title }] } : {}) },
  });
}

export default function Page({ params }: Props) {
  return (
    <Suspense>
      <Content params={params} />
    </Suspense>
  );
}

const prose = "space-y-3 text-[15.5px] leading-[1.8] text-[#4E4E58] [&_a]:font-semibold [&_a]:text-[#A50D25] hover:[&_a]:underline [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_strong]:text-[#131316] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-[#FF3B55]";

async function Content({ params }: Props) {
  const slug = (await params).slug;
  const p = getPost(slug);
  if (!p) {
    const d = await postBySlug(slug);
    if (!d) notFound();
    // Set to show on the other country site only (CMS "Show on"): send visitors there.
    if (!onThisSite(d.site)) permanentRedirect(absoluteFor(postUrl(d.slug), d.site as "CA" | "US"));
    return <CmsPostView d={d} />;
  }
  const url = `${SITE_URL}${postUrl(p.slug)}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.description,
    datePublished: p.date,
    dateModified: p.date,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "Industrial Automation Repair Inc.", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Industrial Automation Repair Inc.", logo: { "@type": "ImageObject", url: `${SITE_URL}/iar-logo.png` } },
  };
  const others = (await allPostCards()).filter((x) => x.slug !== p.slug).slice(0, 6);

  return (
    <ResourceShell wide={false} crumb={[{ label: "Resources", href: "/resources" }, { label: "Blog", href: "/resources/blog" }, { label: p.tag }]} title={p.title} accent="" text={p.description} schema={schema}>
      <PageExtras path={postUrl(p.slug)} />
      <article className="rounded-[24px] border border-[#EAEAEC] bg-white shadow-[0_30px_70px_-45px_rgba(19,19,22,0.45)]">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-[#F3F3F4] px-6 py-4 text-[13px] text-[#696976] sm:px-10">
          <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ background: `${p.color}14`, color: tagInk(p.color) }}>{p.tag}</span>
          <span>{prettyDate(p.date)}</span>
          <span className="flex items-center gap-1.5"><Clock size={13} aria-hidden="true" />{p.minutes} min read</span>
          <span>By the IAR repair team</span>
        </div>
        <div className="px-6 py-8 sm:px-10">
          {p.sections.map((s) => (
            <section key={s.h} className="mt-8 first:mt-0">
              <h2 className="text-[21px] font-extrabold leading-snug sm:text-[24px]">{s.h}</h2>
              <div className={`mt-3 ${prose}`}>{s.body}</div>
            </section>
          ))}
        </div>
        <Cta />
      </article>
      <Related related={p.related} others={others} />
    </ResourceShell>
  );
}

function Cta() {
  return (
    <div className="flex flex-col gap-3 rounded-b-[24px] bg-linear-to-br from-[#131316] to-[#5E0D1A] px-6 py-6 text-white sm:flex-row sm:items-center sm:justify-between sm:px-10">
      <div>
        <p className="text-[18px] font-extrabold">Need this unit looked at?</p>
        <p className="text-[13.5px] text-white/70">Free evaluation, written quote first, 1-year warranty.</p>
      </div>
      <Link href="/request-repair" className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-[14px] font-semibold text-[#131316]"><Wrench size={16} aria-hidden="true" /> Request a Repair</Link>
    </div>
  );
}

function Related({ related, others }: { related: [string, string][]; others: { slug: string; title: string }[] }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {related.length > 0 && (
        <div className="rounded-[22px] border border-[#EAEAEC] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#696976]">Related</p>
          <ul className="mt-2 space-y-1.5">
            {related.map(([t, h]) => (
              <li key={h}><Link href={h} className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#A50D25]">{t} <ArrowRight size={13} className="transition group-hover:translate-x-0.5" aria-hidden="true" /></Link></li>
            ))}
          </ul>
        </div>
      )}
      <div className="rounded-[22px] border border-[#EAEAEC] bg-white p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#696976]">More guides</p>
        <ul className="mt-2 space-y-2">
          {others.map((o) => (
            <li key={o.slug}><Link href={postUrl(o.slug)} className="text-[14px] font-semibold leading-snug text-[#131316] hover:text-[#B30E29]">{o.title}</Link></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* A post written in the CMS (Markdown) */
async function CmsPostView({ d }: { d: CmsPost }) {
  const url = `${SITE_URL}${postUrl(d.slug)}`;
  const { html, toc } = renderMarkdown(d.body);
  const date = new Date(d.publish_at ?? d.created_at);
  const faq = (d.faq ?? []).filter(([q, a]) => q && a);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: d.title,
        description: d.seo_description || d.excerpt,
        datePublished: date.toISOString(),
        dateModified: new Date(d.updated_at).toISOString(),
        mainEntityOfPage: url,
        ...(d.cover ? { image: d.cover.startsWith("http") ? d.cover : `${SITE_URL}${d.cover}` } : {}),
        author: d.author_name ? { "@type": "Person", name: d.author_name, ...(d.author_role ? { jobTitle: d.author_role } : {}), worksFor: { "@type": "Organization", name: "Industrial Automation Repair Inc." } } : { "@type": "Organization", name: "Industrial Automation Repair Inc.", url: SITE_URL },
        publisher: { "@type": "Organization", name: "Industrial Automation Repair Inc.", logo: { "@type": "ImageObject", url: `${SITE_URL}/iar-logo.png` } },
        ...(d.tags.length ? { keywords: d.tags.join(", ") } : {}),
      },
      ...(faq.length ? [{ "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }] : []),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE_URL}/resources` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/resources/blog` },
          { "@type": "ListItem", position: 3, name: d.title, item: url },
        ],
      },
    ],
  };
  const others = (await allPostCards()).filter((x) => x.slug !== d.slug).slice(0, 6);
  const tocItems = toc.filter((t) => t.level === 2);

  return (
    <ResourceShell wide={false} crumb={[{ label: "Resources", href: "/resources" }, { label: "Blog", href: "/resources/blog" }, { label: d.category || "Guide" }]} title={d.title} accent="" text={d.excerpt} schema={schema}>
      <PageExtras path={postUrl(d.slug)} />
      <article className="rounded-[24px] border border-[#EAEAEC] bg-white shadow-[0_30px_70px_-45px_rgba(19,19,22,0.45)]">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-[#F3F3F4] px-6 py-4 text-[13px] text-[#696976] sm:px-10">
          <span className="rounded-full bg-[#C8102E]/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#A50D25]">{d.category || "Guide"}</span>
          <span>{date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          <span className="flex items-center gap-1.5"><Clock size={13} aria-hidden="true" />{readMinutes(d.body)} min read</span>
          <span>{d.author_name ? `By ${d.author_name}${d.author_role ? `, ${d.author_role}` : ""}` : "By the IAR repair team"}</span>
        </div>
        {d.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={d.cover} alt={d.cover_alt ?? d.title} className="max-h-90 w-full bg-[#F4F4F5] object-contain p-6" />
        )}
        <div className="px-6 py-8 sm:px-10">
          {tocItems.length >= 3 && (
            <nav aria-label="On this page" className="mb-8 border-l-[3px] border-[#C8102E] pl-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#696976]">On this page</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-[14.5px] text-[#4E4E58]">
                {tocItems.map((t) => <li key={t.id}><a href={`#${t.id}`} className="hover:text-[#B30E29]">{t.text}</a></li>)}
              </ol>
            </nav>
          )}
          <div className={`${prose} [&_blockquote]:rounded-r-xl [&_blockquote]:border-l-4 [&_blockquote]:border-[#FF3B55] [&_blockquote]:bg-[#FFF6F7] [&_blockquote]:px-4 [&_blockquote]:py-2 [&_figcaption]:mt-1 [&_figcaption]:text-center [&_figcaption]:text-[13px] [&_figcaption]:text-[#696976] [&_figure]:my-5 [&_h2]:mt-8 [&_h2]:text-[21px] [&_h2]:font-extrabold [&_h2]:leading-snug [&_h2]:text-[#131316] sm:[&_h2]:text-[24px] [&_h3]:mt-6 [&_h3]:text-[18px] [&_h3]:font-bold [&_h3]:text-[#131316] [&_img]:mx-auto [&_img]:max-h-105 [&_img]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[#131316] [&_pre]:p-4 [&_pre]:text-[13px] [&_pre]:text-[#F7D3D9] [&_table]:w-full [&_table]:text-[14px] [&_td]:border-b [&_td]:border-[#F3F3F4] [&_td]:py-2 [&_th]:border-b [&_th]:border-[#EAEAEC] [&_th]:py-2 [&_th]:text-left`} dangerouslySetInnerHTML={{ __html: html }} />
          {faq.length > 0 && (
            <section className="mt-10">
              <h2 className="text-[21px] font-extrabold sm:text-[24px]">Frequently asked questions</h2>
              <div className="mt-3 divide-y divide-[#F3F3F4] rounded-2xl border border-[#EAEAEC]">
                {faq.map(([q, a]) => (
                  <details key={q} className="group px-5 py-4">
                    <summary className="cursor-pointer list-none font-bold text-[#131316]">{q}</summary>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#4E4E58]">{a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
          {d.author_bio && (
            <div className="mt-10 rounded-2xl bg-[#FFF6F7] p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#696976]">About the author</p>
              <p className="mt-1 font-bold">{d.author_name}{d.author_role ? ` · ${d.author_role}` : ""}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-[#4E4E58]">{d.author_bio}</p>
            </div>
          )}
        </div>
        <Cta />
      </article>
      <Related related={d.related ?? []} others={others} />
    </ResourceShell>
  );
}
