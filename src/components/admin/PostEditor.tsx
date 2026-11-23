"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import {
  Bold, Calendar, CheckCircle2, CircleHelp, Eye, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Minus, Plus, Quote, Send, Table2, Trash2, TriangleAlert,
} from "lucide-react";
import { deletePost, previewPost, savePost } from "@/app/admin/(app)/blog/actions";
import type { CmsPost } from "@/lib/cms/content";
import { SITE_CHOICES } from "@/lib/site";
import MediaPicker from "./MediaPicker";
import { Alert, Bar, Card, Pill, b, cx, input, lenColor } from "./ui";

type P = Omit<CmsPost, "publish_at" | "created_at" | "updated_at"> & { publish_at: string | null; created_at: string; updated_at: string };
/** While typing, keep a trailing dash so "repair-" can become "repair-guide" (the server trims it on save). */
const typingSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-{2,}/g, "-").replace(/^-+/, "").slice(0, 90);
const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);

/** "2026-11-02T14:00:00.000Z" -> "2026-11-02T09:00" in the browser's time zone (for datetime-local). */
const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

export default function PostEditor({ post, categories, canPublish, me, site, saved, otherTitles }: {
  post: P | null; categories: string[]; canPublish: boolean; me: string; site: string; saved: boolean; otherTitles: string[];
}) {
  const [state, action, pending] = useActionState(savePost, saved ? { ok: "Saved." } : undefined);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "## First section\n\nStart writing here. Use **## headings** for sections and keep paragraphs short.\n");
  const [preview, setPreview] = useState(false);
  const [cover, setCover] = useState(post?.cover ?? "");
  const [coverAlt, setCoverAlt] = useState(post?.cover_alt ?? "");
  const [faq, setFaq] = useState<[string, string][]>(post?.faq?.length ? post.faq : []);
  const [related, setRelated] = useState<[string, string][]>(post?.related?.length ? post.related : []);
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(post?.seo_description ?? "");
  // The date box shows the editor's own local time; the server gets an exact ISO time.
  const [publishAt, setPublishAt] = useState(post?.publish_at && post.status === "scheduled" ? toLocalInput(post.publish_at) : "");
  const [picker, setPicker] = useState<null | "cover" | "body">(null);
  const [deleting, startDelete] = useTransition();
  const [html, setHtml] = useState("");
  const [, startPreview] = useTransition();
  // Rendered and cleaned on the server, exactly like the live post (never raw HTML in the CMS).
  const showPreview = () => {
    setPreview(true);
    setHtml("");
    startPreview(async () => setHtml(await previewPost(body)));
  };
  const ta = useRef<HTMLTextAreaElement>(null);

  const effSlug = slugTouched ? slug : slugify(title);
  const effTitle = seoTitle || (title ? `${title} | IAR` : "");
  const effDesc = seoDesc || excerpt;
  const words = body.split(/\s+/).filter(Boolean).length;
  const h2 = (body.match(/^##\s/gm) ?? []).length;
  const imgs = body.match(/!\[([^\]]*)\]\(/g) ?? [];
  const noAlt = imgs.filter((x) => x === "![](").length;
  const links = (body.match(/\]\(\/(?!media)/g) ?? []).length;
  const dup = otherTitles.some((t) => t.trim().toLowerCase() === title.trim().toLowerCase());

  const checks: [boolean, string][] = [
    [effTitle.length >= 30 && effTitle.length <= 60, `SEO title ${effTitle.length} characters (30–60)`],
    [effDesc.length >= 70 && effDesc.length <= 160, `Description ${effDesc.length} characters (70–160)`],
    [words >= 600, `${words.toLocaleString()} words (600+ ranks better)`],
    [h2 >= 2, `${h2} section headings (H2)`],
    [links >= 2, `${links} links to other IAR pages`],
    [Boolean(cover) && Boolean(coverAlt), cover ? (coverAlt ? "Cover image with alt text" : "Cover image needs alt text") : "Add a cover image"],
    [noAlt === 0, noAlt ? `${noAlt} images in the text have no alt text` : "Images in the text have alt text"],
    [faq.length > 0, faq.length ? `${faq.length} FAQ (shown in Google)` : "Add an FAQ for rich results"],
    [!dup, dup ? "Another post has this title" : "Title is unique"],
  ];
  const score = Math.round((checks.filter((c) => c[0]).length / checks.length) * 100);

  function wrap(before: string, after = "", placeholder = "") {
    const el = ta.current;
    if (!el) return;
    const [s, e] = [el.selectionStart, el.selectionEnd];
    const sel = body.slice(s, e) || placeholder;
    const next = body.slice(0, s) + before + sel + after + body.slice(e);
    setBody(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + before.length, s + before.length + sel.length); });
  }
  function line(prefix: string, placeholder: string) {
    const el = ta.current;
    if (!el) return;
    const s = el.selectionStart;
    const start = body.lastIndexOf("\n", s - 1) + 1;
    const needsNl = start > 0 && body[start - 1] !== "\n" ? "\n" : "";
    const text = body.slice(start, el.selectionEnd) || placeholder;
    setBody(body.slice(0, start) + needsNl + text.split("\n").map((l) => prefix + l).join("\n") + body.slice(el.selectionEnd));
    requestAnimationFrame(() => el.focus());
  }
  const tools: [React.ElementType, string, () => void][] = [
    [Heading2, "Section heading", () => line("## ", "Section heading")],
    [Heading3, "Sub-heading", () => line("### ", "Sub-heading")],
    [Bold, "Bold", () => wrap("**", "**", "bold text")],
    [Italic, "Italic", () => wrap("_", "_", "italic text")],
    [List, "Bullet list", () => line("- ", "List item")],
    [ListOrdered, "Numbered list", () => line("1. ", "Step")],
    [Quote, "Highlight box", () => line("> ", "Tip or important note")],
    [Link2, "Link", () => wrap("[", "](/services/servo-drive-repair)", "link text")],
    [ImagePlus, "Image from Media Library", () => setPicker("body")],
    [Table2, "Table", () => wrap("\n| Column | Column |\n| --- | --- |\n| Value | Value |\n")],
    [Minus, "Divider", () => wrap("\n---\n")],
  ];

  return (
    <form action={action} className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <input type="hidden" name="id" value={post?.id ?? ""} />
      <input type="hidden" name="slug" value={effSlug} />
      <input type="hidden" name="cover" value={cover} />
      <input type="hidden" name="faq" value={JSON.stringify(faq)} />
      <input type="hidden" name="related" value={JSON.stringify(related)} />
      <input type="hidden" name="body" value={body} />
      {picker && <MediaPicker onClose={() => setPicker(null)} onPick={(m) => { if (picker === "cover") { setCover(m.url); if (!coverAlt) setCoverAlt(m.alt); } else wrap(`![${m.alt || "Describe the image"}](${m.url})`); setPicker(null); }} />}

      <Card pad={false}>
        <div className="flex flex-wrap items-center gap-0.5 border-b border-[#EAEAEC] px-3 py-2">
          {/* eslint-disable-next-line react-hooks/refs -- toolbar buttons only read the textarea when clicked */}
          {tools.map(([Icon, label, fn]) => <button type="button" key={label} title={label} onClick={fn} disabled={preview} className="rounded-lg p-2 text-[#696976] hover:bg-[#F5F5F6] hover:text-[#131316] disabled:opacity-40"><Icon size={17} /></button>)}
          <span className="flex-1" />
          <span className="inline-flex rounded-[9px] bg-[#F2F2F3] p-0.75">
            <button type="button" onClick={() => setPreview(false)} className={cx("rounded-md px-3 py-1 text-[12px] font-semibold", !preview ? "bg-white shadow" : "text-[#696976]")}>Write</button>
            <button type="button" onClick={showPreview} className={cx("flex items-center gap-1 rounded-md px-3 py-1 text-[12px] font-semibold", preview ? "bg-white shadow" : "text-[#696976]")}><Eye size={13} /> Preview</button>
          </span>
        </div>
        <div className="flex flex-col gap-4 px-5 py-6 sm:px-10">
          <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" className="w-full border-0 text-[26px] font-extrabold leading-tight tracking-[-0.02em] outline-none placeholder:text-[#D0D0D5] sm:text-[28px]" />
          <textarea name="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} placeholder="One or two sentences shown under the title and on the blog list" className="w-full resize-none border-0 text-[15px] leading-relaxed text-[#696976] outline-none placeholder:text-[#D0D0D5]" />
          {preview ? (
            <div className="min-h-105 space-y-3 text-[15.5px] leading-[1.8] text-[#4E4E58] [&_a]:font-semibold [&_a]:text-[#A50D25] [&_blockquote]:rounded-r-xl [&_blockquote]:border-l-4 [&_blockquote]:border-[#FF3B55] [&_blockquote]:bg-[#FFF6F7] [&_blockquote]:px-4 [&_blockquote]:py-2 [&_h2]:mt-6 [&_h2]:text-[22px] [&_h2]:font-extrabold [&_h2]:text-[#131316] [&_h3]:mt-4 [&_h3]:text-[18px] [&_h3]:font-bold [&_img]:max-h-90 [&_img]:rounded-xl [&_ol]:list-decimal [&_ol]:pl-5 [&_table]:w-full [&_td]:border-b [&_td]:py-1.5 [&_th]:text-left [&_ul]:list-disc [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <textarea ref={ta} value={body} onChange={(e) => setBody(e.target.value)} rows={24} spellCheck className="min-h-105 w-full resize-y rounded-xl border border-[#EAEAEC] bg-[#FCFCFC] p-4 font-mono text-[13.5px] leading-relaxed outline-none focus:border-[#C8102E]" />
          )}
          <p className="text-[12px] text-[#91919E]">Markdown: <b>## Heading</b>, <b>**bold**</b>, <b>- list</b>, <b>[text](/link)</b>. The toolbar adds these for you.</p>

          <div className="mt-2 rounded-2xl border border-dashed border-[#FDD1D8] bg-[#FCFCFC] p-4">
            <div className="flex items-center gap-2"><CircleHelp size={17} className="text-[#C8102E]" /><b>FAQ</b><span className="text-[12.5px] text-[#696976]">Shown at the end of the post and added to FAQ schema automatically.</span></div>
            {faq.map(([qq, a], i) => (
              <div key={i} className="mt-3 grid gap-2 rounded-xl border border-[#EAEAEC] bg-white p-3">
                <div className="flex gap-2"><input value={qq} onChange={(e) => setFaq(faq.map((f, k) => (k === i ? [e.target.value, f[1]] : f)))} placeholder="Question" className={input} /><button type="button" onClick={() => setFaq(faq.filter((_, k) => k !== i))} className="text-[#91919E] hover:text-[#B42318]"><Trash2 size={16} /></button></div>
                <textarea value={a} onChange={(e) => setFaq(faq.map((f, k) => (k === i ? [f[0], e.target.value] : f)))} rows={2} placeholder="Answer" className={input} />
              </div>
            ))}
            <button type="button" onClick={() => setFaq([...faq, ["", ""]])} className={cx(b("light", true), "mt-3")}><Plus size={13} /> Add question</button>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-5 xl:sticky xl:top-20">
        <Card title="Publish" right={post && <Pill tone={post.status === "published" ? "ok" : post.status === "scheduled" ? "blue" : post.status === "review" ? "violet" : "warn"}>{post.status}</Pill>}>
          {state?.error && <div className="mb-3"><Alert tone="bad" icon={<TriangleAlert size={16} />}>{state.error}</Alert></div>}
          {state?.ok && <div className="mb-3"><Alert tone="ok" icon={<CheckCircle2 size={16} />}>{state.ok}</Alert></div>}
          <div className="flex flex-col gap-2">
            {canPublish ? (
              <>
                <button name="intent" value="publish" disabled={pending} className={b("primary")}><Send size={15} /> {post?.status === "published" ? "Update" : "Publish now"}</button>
                <div className="flex gap-2">
                  <input type="datetime-local" aria-label="Publish date and time (your time zone)" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} suppressHydrationWarning className={cx(input, "h-9.5 py-1 text-[12.5px]")} />
                  <input type="hidden" name="publish_at" value={publishAt ? new Date(publishAt).toISOString() : ""} suppressHydrationWarning />
                  <button name="intent" value="schedule" disabled={pending || !publishAt} className={b("light")}><Calendar size={14} /> Schedule</button>
                </div>
              </>
            ) : (
              <button name="intent" value="review" disabled={pending} className={b("primary")}><Send size={15} /> Send for review</button>
            )}
            <button name="intent" value="draft" disabled={pending} className={b("light")}>{pending ? "Saving…" : post?.status === "published" ? "Save changes" : "Save draft"}</button>
            {post?.status === "published" && canPublish && <button name="intent" value="unpublish" disabled={pending} className={b("light", true)}>Unpublish</button>}
          </div>
          {post?.status === "published" && <a href={`/resources/blog/${post.slug}`} target="_blank" className="mt-3 block truncate text-[12.5px] font-semibold text-[#A50D25]">View live post →</a>}
          <p className="mt-2 text-[11.5px] text-[#91919E]">{post ? `Last saved ${new Date(post.updated_at).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}${post.updated_by ? ` by ${post.updated_by}` : ""}` : `Author: ${me}`}</p>
        </Card>

        <Card title="SEO" right={<Pill tone={score >= 85 ? "ok" : score >= 60 ? "warn" : "bad"}>{score}</Pill>}>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5"><span className="flex text-[12.5px] font-bold">URL <span className="ml-auto font-mono text-[11px] font-semibold text-[#91919E]">/resources/blog/</span></span><input value={effSlug} onChange={(e) => { setSlugTouched(true); setSlug(typingSlug(e.target.value)); }} className={cx(input, "font-mono text-[12.5px]")} /></label>
            <label className="flex flex-col gap-1.5"><span className="flex text-[12.5px] font-bold">SEO title <span className="ml-auto" style={{ color: lenColor(effTitle.length, 30, 60) }}>{effTitle.length} / 60</span></span><input name="seo_title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={effTitle || "Same as the post title"} className={input} /><Bar pct={(effTitle.length / 60) * 100} color={lenColor(effTitle.length, 30, 60)} /></label>
            <label className="flex flex-col gap-1.5"><span className="flex text-[12.5px] font-bold">Meta description <span className="ml-auto" style={{ color: lenColor(effDesc.length, 70, 160) }}>{effDesc.length} / 160</span></span><textarea name="seo_description" value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={3} placeholder={excerpt || "Defaults to the summary"} className={input} /><Bar pct={(effDesc.length / 160) * 100} color={lenColor(effDesc.length, 70, 160)} /></label>
            <div className="rounded-xl border border-[#EAEAEC] p-3 font-[Arial,sans-serif]">
              <div className="text-[11.5px] text-[#4D4D56]">{site.replace(/^https?:\/\//, "")} › resources › blog</div>
              <div className="mt-1 text-[16px] leading-tight text-[#931326]">{(effTitle || "Post title").slice(0, 62)}</div>
              <div className="mt-0.5 text-[12.5px] text-[#4D4D56]">{(effDesc || "Add a summary so Google shows your words.").slice(0, 158)}</div>
            </div>
            <div>
              {checks.map(([ok, t], i) => <div key={i} className="flex items-start gap-2 py-1 text-[12.5px]"><span style={{ color: ok ? "#12B76A" : "#F59E0B" }}>{ok ? <CheckCircle2 size={14} /> : <TriangleAlert size={14} />}</span>{t}</div>)}
            </div>
          </div>
        </Card>

        <Card title="Post settings">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-bold">Cover image</span>
              {cover ? (
                <div className="relative flex h-32 items-center justify-center rounded-xl border border-[#EAEAEC] bg-[#F4F4F5]">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={cover} alt="" className="max-h-[85%] max-w-[85%] object-contain" /><button type="button" onClick={() => setCover("")} className="absolute right-2 top-2 rounded-lg bg-white p-1 text-[#91919E] shadow"><Trash2 size={14} /></button></div>
              ) : <button type="button" onClick={() => setPicker("cover")} className={b("light")}><ImagePlus size={15} /> Choose from Media Library</button>}
              {cover && <input name="cover_alt" value={coverAlt} onChange={(e) => setCoverAlt(e.target.value)} placeholder="Alt text for the cover" className={input} />}
            </div>
            <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">Show on</span><select name="site" defaultValue={post?.site ?? "both"} className={input}>{SITE_CHOICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">Category</span><input name="category" list="cats" defaultValue={post?.category ?? ""} placeholder="e.g. Repair guides" className={input} /><datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist></label>
            <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">Tags <span className="font-semibold text-[#91919E]">comma separated</span></span><input name="tags" defaultValue={post?.tags?.join(", ") ?? ""} placeholder="SINAMICS S120, F30001, Siemens" className={input} /></label>
            <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">Author</span><input name="author_name" defaultValue={post?.author_name ?? me} className={input} /></label>
            <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">Author role</span><input name="author_role" defaultValue={post?.author_role ?? ""} placeholder="e.g. Repair technician, 15 years on Siemens drives" className={input} /></label>
            <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">Author bio <span className="font-semibold text-[#91919E]">shows real expertise to Google</span></span><textarea name="author_bio" defaultValue={post?.author_bio ?? ""} rows={3} className={input} /></label>
            <div className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-bold">Related links</span>
              {related.map(([t, h], i) => (
                <div key={i} className="flex gap-1.5"><input value={t} onChange={(e) => setRelated(related.map((r, k) => (k === i ? [e.target.value, r[1]] : r)))} placeholder="Label" className={cx(input, "py-1.5")} /><input value={h} onChange={(e) => setRelated(related.map((r, k) => (k === i ? [r[0], e.target.value] : r)))} placeholder="/services/..." className={cx(input, "py-1.5 font-mono text-[12px]")} /><button type="button" onClick={() => setRelated(related.filter((_, k) => k !== i))} className="text-[#91919E]"><Trash2 size={15} /></button></div>
              ))}
              <button type="button" onClick={() => setRelated([...related, ["", ""]])} className={b("light", true)}><Plus size={13} /> Add link</button>
            </div>
          </div>
        </Card>
        {post && canPublish && <button type="button" disabled={deleting} onClick={() => confirm("Delete this post for good? If it was published, add a redirect for its URL.") && startDelete(() => deletePost(post.id))} className={b("danger")}><Trash2 size={14} /> Delete post</button>}
      </div>
    </form>
  );
}
