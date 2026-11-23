"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, Braces, CheckCircle2, Code, Globe, Info, Link2, ListTree, Monitor, RotateCcw, Save, SearchCheck, Smartphone, Tag,
} from "lucide-react";
import { resetPageSeo, savePageSeo } from "@/app/admin/(app)/pages/actions";
import type { PageSeo } from "@/lib/cms/seo";
import { Alert, Bar, Card, Pill, Score, b, cx, input, lenColor } from "./ui";

type Live = { title: string; description: string; canonical: string; headings: [number, string][]; images: number; noalt: number; inbound: number; ld: string[]; words: number; crawledAt: string } | null;

export const SCHEMA_TEMPLATES: Record<string, (url: string) => object> = {
  Service: (url) => ({ "@context": "https://schema.org", "@type": "Service", name: "", serviceType: "", url, provider: { "@type": "LocalBusiness", name: "Industrial Automation Repair Inc." }, areaServed: ["CA", "US"] }),
  Product: (url) => ({ "@context": "https://schema.org", "@type": "Product", name: "", brand: { "@type": "Brand", name: "" }, mpn: "", url, offers: { "@type": "Offer", priceCurrency: "USD", price: "", availability: "https://schema.org/InStock" } }),
  FAQ: () => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "", acceptedAnswer: { "@type": "Answer", text: "" } }] }),
  HowTo: () => ({ "@context": "https://schema.org", "@type": "HowTo", name: "", step: [{ "@type": "HowToStep", name: "", text: "" }] }),
  Video: (url) => ({ "@context": "https://schema.org", "@type": "VideoObject", name: "", description: "", thumbnailUrl: "", uploadDate: "", contentUrl: "", embedUrl: "", url }),
  Event: () => ({ "@context": "https://schema.org", "@type": "Event", name: "", startDate: "", location: { "@type": "Place", name: "", address: "" } }),
  LocalBusiness: (url) => ({ "@context": "https://schema.org", "@type": "LocalBusiness", name: "Industrial Automation Repair Inc.", url, address: { "@type": "PostalAddress", addressLocality: "Mississauga", addressRegion: "ON", addressCountry: "CA" } }),
};

export default function PageEditor({ path, group, site, saved, live, otherTitles, suggestions, canScripts }: {
  path: string; group: string; site: string; saved: PageSeo | null; live: Live; otherTitles: string[];
  suggestions: { path: string; title: string }[]; canScripts: boolean;
}) {
  const [state, action, pending] = useActionState(savePageSeo, undefined);
  const [tab, setTab] = useState<"seo" | "social" | "schema" | "headings" | "scripts">("seo");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [resetting, startReset] = useTransition();
  const router = useRouter();

  const [focus, setFocus] = useState(saved?.focus_keyword ?? "");
  const [title, setTitle] = useState(saved?.title ?? "");
  const [desc, setDesc] = useState(saved?.description ?? "");
  const [caTitle, setCaTitle] = useState(saved?.ca_title ?? "");
  const [caDesc, setCaDesc] = useState(saved?.ca_description ?? "");
  const [caSchema, setCaSchema] = useState(saved?.ca_schema_json ?? "");
  const [url, setUrl] = useState(saved?.public_path ?? path);
  const [canonical, setCanonical] = useState(saved?.canonical ?? "");
  const [index, setIndex] = useState(!(saved?.noindex ?? false));
  const [follow, setFollow] = useState(!(saved?.nofollow ?? false));
  const [ogTitle, setOgTitle] = useState(saved?.og_title ?? "");
  const [ogDesc, setOgDesc] = useState(saved?.og_description ?? "");
  const [ogImage, setOgImage] = useState(saved?.og_image ?? "");
  const [schema, setSchema] = useState(saved?.schema_json ?? "");
  const [head, setHead] = useState(saved?.head_html ?? "");
  const [body, setBody] = useState(saved?.body_html ?? "");

  const effTitle = title || live?.title || "";
  const effDesc = desc || live?.description || "";
  const tl = effTitle.length, dl = effDesc.length;
  const dup = Boolean(effTitle) && otherTitles.some((t) => t.trim().toLowerCase() === effTitle.trim().toLowerCase());
  const originalUrl = saved?.public_path || path;
  const urlChanged = url.trim() && url.trim().toLowerCase().replace(/\/+$/, "") !== originalUrl;
  const schemaErr = useMemo(() => {
    if (!schema.trim()) return null;
    try {
      const v = JSON.parse(schema);
      return typeof v === "object" && v ? null : "Must be a JSON object.";
    } catch (e) {
      return (e as Error).message;
    }
  }, [schema]);
  const schemaType = useMemo(() => {
    try {
      const v = JSON.parse(schema);
      return Array.isArray(v) ? v.map((x) => x?.["@type"]).filter(Boolean).join(", ") : v?.["@type"];
    } catch {
      return null;
    }
  }, [schema]);

  const fk = focus.trim().toLowerCase();
  // every word of the keyword appears (order and small words like "in" don't matter)
  const has = (text: string) => fk.split(/[^a-z0-9]+/).filter((w) => w.length > 2).every((w) => text.toLowerCase().includes(w));
  const h1s = live ? live.headings.filter((h) => h[0] === 1).length : 0;
  const checks: [boolean | null, string][] = [
    [fk ? has(effTitle) : null, "Focus keyword in title"],
    [fk ? has(effDesc) : null, "Focus keyword in description"],
    [fk ? has(url.replace(/[-/]/g, " ")) : null, "Focus keyword in URL"],
    [tl >= 30 && tl <= 60, `Title length ${tl} (30–60)`],
    [dl >= 70 && dl <= 160, `Description length ${dl} (70–160)`],
    [!dup, dup ? "Another page uses this title" : "Title is unique"],
    [live ? h1s === 1 : null, live ? `${h1s} × H1 heading` : "Headings: scan to check"],
    [live ? live.noalt === 0 : null, live ? (live.noalt ? `${live.noalt} of ${live.images} images have no alt text` : `All ${live.images} images have alt text`) : "Images: scan to check"],
    [live ? live.inbound >= 3 : null, live ? `${live.inbound} internal links point here` : "Links: scan to check"],
    [live ? live.ld.length > 0 || Boolean(schema && !schemaErr) : null, live ? `Schema: ${[...live.ld, ...(schemaType ? [schemaType] : [])].join(", ") || "none"}` : "Schema: scan to check"],
    [index, index ? "Indexable by Google" : "Hidden from Google (noindex)"],
  ];
  const scored = checks.filter((c) => c[0] !== null);
  const score = scored.length ? Math.round((scored.filter((c) => c[0]).length / scored.length) * 100) : 0;
  const scoreTone = score >= 85 ? "ok" : score >= 65 ? "warn" : "bad";

  const host = site.replace(/^https?:\/\//, "");
  const crumbs = (url || path).split("/").filter(Boolean).join(" › ");
  type TabKey = "seo" | "social" | "schema" | "headings" | "scripts";
  const tabs: [TabKey, string, typeof SearchCheck][] = [
    ["seo", "SEO", SearchCheck], ["social", "Social", Globe], ["schema", "Schema", Braces], ["headings", "Headings & links", ListTree],
    ...(canScripts ? [["scripts", "Page scripts", Code] as [TabKey, string, typeof SearchCheck]] : []),
  ];

  return (
    <form action={action} className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <input type="hidden" name="path" value={path} />
      <input type="hidden" name="public_path" value={url} />
      <input type="hidden" name="noindex" value={index ? "" : "on"} />
      <input type="hidden" name="nofollow" value={follow ? "" : "on"} />
      <Card pad={false}>
        <div className="flex gap-1 overflow-x-auto border-b border-[#EAEAEC] px-4">
          {tabs.map(([k, l, Icon]) => (
            <button type="button" key={k} onClick={() => setTab(k)} className={cx("flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-[13px] font-semibold", tab === k ? "border-[#C8102E] text-[#C8102E]" : "border-transparent text-[#696976] hover:text-[#131316]")}>
              <Icon size={15} /> {l}
            </button>
          ))}
        </div>

        {/* SEO */}
        <div className={cx("flex flex-col gap-5 p-5 sm:p-6", tab !== "seo" && "hidden")}>
          <Field label={<>Focus keyword <span className="font-semibold text-[#91919E]">· the search you want this page to rank for</span></>}>
            <div className="relative"><Tag size={15} className="absolute left-3 top-3 text-[#91919E]" /><input name="focus_keyword" value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g. servo drive repair" className={cx(input, "pl-9")} /></div>
          </Field>
          <Field label="SEO title" right={<span style={{ color: lenColor(tl, 30, 60) }}>{tl} / 60{tl > 60 ? " · Too long" : tl && tl < 30 ? " · Too short" : tl ? " · Good length" : ""}</span>}>
            <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={live?.title || "Page title"} className={input} />
            <Bar pct={(tl / 60) * 100} color={lenColor(tl, 30, 60)} />
            {dup ? <Hint bad>Another page already uses this title. Make it unique.</Hint> : !title && live?.title ? <Hint>Empty = the website&apos;s own title (shown in grey).</Hint> : null}
          </Field>
          <Field label="Meta description" right={<span style={{ color: lenColor(dl, 70, 160) }}>{dl} / 160{dl > 160 ? " · Too long" : dl && dl < 70 ? " · Too short" : dl ? " · Good length" : ""}</span>}>
            <textarea name="description" value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder={live?.description || "Short summary shown under the title in Google"} className={input} />
            <Bar pct={(dl / 160) * 100} color={lenColor(dl, 70, 160)} />
          </Field>
          <details open={!!(caTitle || caDesc)} className="rounded-xl border border-[#EAEAEC] bg-[#FAFAFB] p-4">
            <summary className="cursor-pointer text-[13px] font-bold">Canada site (industrialautomationrepair.com) <span className="font-semibold text-[#91919E]">· optional: different title and description for Canada</span></summary>
            <div className="mt-3 flex flex-col gap-4">
              <Field label="Canada SEO title" right={<span style={{ color: lenColor(caTitle.length, 30, 60) }}>{caTitle.length} / 60</span>}>
                <input name="ca_title" value={caTitle} onChange={(e) => setCaTitle(e.target.value)} placeholder={title || live?.title || "Same as the SEO title"} className={input} />
              </Field>
              <Field label="Canada meta description" right={<span style={{ color: lenColor(caDesc.length, 70, 160) }}>{caDesc.length} / 160</span>}>
                <textarea name="ca_description" value={caDesc} onChange={(e) => setCaDesc(e.target.value)} rows={2} placeholder={desc || live?.description || "Same as the meta description"} className={input} />
              </Field>
              <Hint>Used on industrialautomationrepair.com only. Empty = the SEO title and meta description above, on both sites. industrialautomationrepair.com always uses the fields above.</Hint>
            </div>
          </details>
          <Field label="Page URL">
            <input value={url} onChange={(e) => setUrl(e.target.value.toLowerCase().replace(/[^a-z0-9/-]/g, "-"))} className={cx(input, "font-mono text-[12.8px]")} />
            {urlChanged && (
              <Alert tone="warn" icon={<AlertTriangle size={16} />}>
                <b>You changed this page&apos;s URL.</b> When you save, a <b>301 redirect</b> is added automatically from <span className="font-mono">{originalUrl}</span> to the new URL, and the sitemap uses the new one.
              </Alert>
            )}
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Canonical URL">
              <input name="canonical" value={canonical} onChange={(e) => setCanonical(e.target.value)} placeholder={`Automatic: ${site}${originalUrl === "/" ? "" : originalUrl}`} className={cx(input, "text-[12.8px]")} />
              <Hint>Leave empty for this page&apos;s own URL. Override only for duplicates.</Hint>
            </Field>
            <Field label="Search engines">
              <Toggle on={index} set={setIndex} label="Index this page" />
              <Toggle on={follow} set={setFollow} label="Follow links on this page" />
            </Field>
          </div>
          <Field label="Google preview" right={
            <span className="inline-flex rounded-[9px] bg-[#F2F2F3] p-0.75">
              <button type="button" onClick={() => setDevice("desktop")} className={cx("flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-semibold", device === "desktop" ? "bg-white shadow" : "text-[#696976]")}><Monitor size={13} /> Desktop</button>
              <button type="button" onClick={() => setDevice("mobile")} className={cx("flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-semibold", device === "mobile" ? "bg-white shadow" : "text-[#696976]")}><Smartphone size={13} /> Mobile</button>
            </span>
          }>
            <div className={cx("rounded-[14px] border border-[#EAEAEC] bg-white px-4.5 py-4 font-[Arial,sans-serif]", device === "mobile" && "max-w-95")}>
              <div className="flex items-center gap-2 text-[12.5px] text-[#202024]">
                <span className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-[#F2F2F3] text-[11px] font-bold text-[#C8102E]">A</span>
                <div className="leading-tight"><div className="text-[13.5px]">Industrial Automation Repair Inc.</div><div className="text-[#4D4D56]">{site} {crumbs && `› ${crumbs}`}</div></div>
              </div>
              <div className={cx("mt-2 mb-1 leading-tight text-[#931326]", device === "mobile" ? "text-[17px]" : "text-[19px]")}>{trim(effTitle || "Page title", device === "mobile" ? 70 : 60)}</div>
              <div className="text-[13.5px] leading-normal text-[#4D4D56]">{trim(effDesc || "Add a meta description so Google shows your words here.", device === "mobile" ? 120 : 158)}</div>
            </div>
          </Field>
        </div>

        {/* Social */}
        <div className={cx("flex flex-col gap-5 p-5 sm:p-6", tab !== "social" && "hidden")}>
          <Hint>What people see when this page is shared on LinkedIn, Facebook, WhatsApp or X. Empty = same as the SEO title and description.</Hint>
          <Field label="Share title"><input name="og_title" value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} placeholder={effTitle} className={input} /></Field>
          <Field label="Share description"><textarea name="og_description" value={ogDesc} onChange={(e) => setOgDesc(e.target.value)} rows={2} placeholder={effDesc} className={input} /></Field>
          <Field label="Share image URL"><input name="og_image" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="/media/your-image.webp (from the Media Library) — empty = site default" className={input} /><Hint>Best size: 1200 × 630 pixels.</Hint></Field>
          <div className="max-w-130 overflow-hidden rounded-xl border border-[#EAEAEC]">
            <div className="flex aspect-1200/630 items-center justify-center bg-[#131316] bg-cover bg-center text-[13px] font-semibold text-white/60" style={ogImage ? { backgroundImage: `url(${ogImage})` } : undefined}>{!ogImage && "Default share image"}</div>
            <div className="bg-[#F3F3F4] px-3.5 py-2.5"><div className="text-[11px] uppercase text-[#65656B]">{host}</div><div className="font-bold">{trim(ogTitle || effTitle, 90)}</div><div className="text-[12.5px] text-[#65656B]">{trim(ogDesc || effDesc, 110)}</div></div>
          </div>
        </div>

        {/* Schema */}
        <div className={cx("flex flex-col gap-4 p-5 sm:p-6", tab !== "schema" && "hidden")}>
          <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
            <span className="font-semibold text-[#696976]">Already on this page:</span>
            {live?.ld.length ? live.ld.map((t) => <Pill key={t} tone="ok">{t}</Pill>) : <span className="text-[#91919E]">{live ? "none" : "scan the site to see"}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12.5px] font-semibold text-[#696976]">Start from a template:</span>
            {Object.keys(SCHEMA_TEMPLATES).map((k) => (
              <button type="button" key={k} onClick={() => setSchema(JSON.stringify(SCHEMA_TEMPLATES[k](`${site}${originalUrl}`), null, 2))} className={b("light", true)}>{k}</button>
            ))}
          </div>
          <textarea name="schema_json" value={schema} onChange={(e) => setSchema(e.target.value)} rows={16} spellCheck={false} placeholder='{ "@context": "https://schema.org", "@type": "Service", ... }' className="w-full rounded-xl bg-[#131316] p-4 font-mono text-[12.5px] leading-relaxed text-[#F7D3D9] outline-none placeholder:text-[#828290]" />
          {schema.trim() && (schemaErr
            ? <Alert tone="bad" icon={<AlertTriangle size={16} />}><b>Not valid JSON yet:</b> {schemaErr}</Alert>
            : <Alert tone="ok" icon={<CheckCircle2 size={16} />}><b>Valid JSON-LD.</b> {schemaType ? `${schemaType} schema recognised.` : ""} It is added to this page when you save. Test it with Google&apos;s Rich Results Test after publishing.</Alert>)}
          <details open={!!caSchema} className="rounded-xl border border-[#EAEAEC] bg-[#FAFAFB] p-4">
            <summary className="cursor-pointer text-[13px] font-bold">Canada site schema (industrialautomationrepair.com) <span className="font-semibold text-[#91919E]">· optional</span></summary>
            <textarea name="ca_schema_json" value={caSchema} onChange={(e) => setCaSchema(e.target.value)} rows={10} spellCheck={false} placeholder="Empty = the schema above on both sites. Filled in = used instead of it on industrialautomationrepair.com." className="mt-3 w-full rounded-xl bg-[#131316] p-4 font-mono text-[12.5px] leading-relaxed text-[#F7D3D9] outline-none placeholder:text-[#828290]" />
          </details>
        </div>

        {/* Headings & links */}
        <div className={cx("grid gap-6 p-5 sm:p-6 md:grid-cols-2", tab !== "headings" && "hidden")}>
          <div>
            <h3 className="mb-2 font-bold">Heading outline</h3>
            {live ? live.headings.length ? live.headings.map(([l, t], i) => (
              <div key={i} className="flex items-center gap-2 py-1 text-[12.5px]" style={{ paddingLeft: (l - 1) * 16 }}>
                <span className={cx("rounded px-1.5 text-[10.5px] font-bold", l === 1 ? "bg-[#FBE7EA] text-[#A50D25]" : "bg-[#F2F2F3] text-[#5A5A66]")}>H{l}</span>{t}
              </div>
            )) : <p className="text-[#91919E]">No headings found.</p> : <p className="text-[#91919E]">Scan the site to see the headings.</p>}
            <Hint>Headings come from the page design. Each page should have one H1, then H2 sections and H3 sub-sections.</Hint>
          </div>
          <div>
            <h3 className="mb-2 font-bold">Internal links</h3>
            <p className="text-[12.8px] text-[#696976]">{live ? <><b className="text-[#131316]">{live.inbound}</b> pages link here. {live.words.toLocaleString()} words on the page.</> : "Scan the site to count links."}</p>
            {suggestions.length > 0 && (
              <>
                <p className="mt-3 text-[12.5px] font-bold">Related pages that don&apos;t link here yet</p>
                {suggestions.map((s) => (
                  <a key={s.path} href={`/admin/pages/edit?path=${encodeURIComponent(s.path)}`} className="mt-1.5 flex items-center gap-2 rounded-lg border border-[#EAEAEC] px-3 py-2 text-[12.5px] hover:border-[#C8102E]">
                    <Link2 size={14} className="text-[#91919E]" /><span className="truncate">{s.title || s.path}</span>
                  </a>
                ))}
                <Hint>Adding a link from these pages helps Google find and rank this one. Blog posts and landing pages can link here directly.</Hint>
              </>
            )}
          </div>
        </div>

        {/* Scripts */}
        {canScripts && (
          <div className={cx("flex flex-col gap-4 p-5 sm:p-6", tab !== "scripts" && "hidden")}>
            <Alert tone="warn" icon={<AlertTriangle size={16} />}>Only for this page, e.g. a conversion event on a thank-you page. Site-wide tags go in Tracking &amp; Code.</Alert>
            <Field label="Head (loads early)"><textarea name="head_html" value={head} onChange={(e) => setHead(e.target.value)} rows={6} spellCheck={false} className="w-full rounded-xl bg-[#131316] p-4 font-mono text-[12.5px] text-[#F7D3D9] outline-none" /></Field>
            <Field label="Body (end of page)"><textarea name="body_html" value={body} onChange={(e) => setBody(e.target.value)} rows={6} spellCheck={false} className="w-full rounded-xl bg-[#131316] p-4 font-mono text-[12.5px] text-[#F7D3D9] outline-none" /></Field>
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-5 xl:sticky xl:top-20">
        <Card title="SEO score" right={<Pill tone={scoreTone}>{score >= 85 ? "Great" : score >= 65 ? "Good" : "Needs work"}</Pill>}>
          <div className="flex items-center gap-4"><Score value={score} /><p className="text-[12.8px] text-[#696976]">{scored.filter((c) => c[0]).length} of {scored.length} checks pass.{!fk && " Add a focus keyword for more checks."}</p></div>
          <div className="mt-3">
            {checks.map(([ok, t], i) => (
              <div key={i} className="flex items-start gap-2 py-1.25 text-[12.8px]">
                <span className="mt-px" style={{ color: ok === null ? "#D0D0D5" : ok ? "#12B76A" : "#F59E0B" }}>{ok === false ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}</span>
                <span className={ok === null ? "text-[#91919E]" : ""}>{t}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          {state?.error && <div className="mb-3"><Alert tone="bad" icon={<AlertTriangle size={16} />}>{state.error}</Alert></div>}
          {state?.ok && <div className="mb-3"><Alert tone="ok" icon={<CheckCircle2 size={16} />}>{state.ok}</Alert></div>}
          <button disabled={pending || Boolean(schemaErr)} className={cx(b("primary"), "w-full")}><Save size={15} /> {pending ? "Saving…" : "Save & publish"}</button>
          {saved && (
            <button type="button" disabled={resetting} onClick={() => confirm("Remove all CMS changes for this page and go back to the website's own title, description and settings?") && startReset(async () => { await resetPageSeo(path); router.refresh(); })} className={cx(b("light"), "mt-2 w-full")}>
              <RotateCcw size={14} /> Reset to website defaults
            </button>
          )}
          <p className="mt-3 flex items-start gap-1.5 text-[12px] text-[#91919E]"><Info size={13} className="mt-0.5 flex-none" /> Changes go live within seconds and are saved in the activity log, where they can be undone.{saved?.updated_by && ` Last edit: ${saved.updated_by}.`}</p>
          <p className="mt-1 text-[11.5px] text-[#91919E]">Type: {group}{live && ` · Scanned ${new Date(live.crawledAt).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}`}</p>
        </Card>
      </div>
    </form>
  );
}

const trim = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + " …" : s);

function Field({ label, right, children }: { label: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-[12.5px] font-bold">{label}{right && <span className="ml-auto text-[12px] font-semibold">{right}</span>}</div>
      {children}
    </div>
  );
}
function Hint({ children, bad }: { children: React.ReactNode; bad?: boolean }) {
  return <p className={cx("flex items-start gap-1.5 text-[12px]", bad ? "text-[#B42318]" : "text-[#696976]")}><Info size={13} className="mt-0.5 flex-none" />{children}</p>;
}
function Toggle({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => set(!on)} className="flex h-10 items-center justify-between rounded-[10px] border border-[#E2E2E6] bg-white px-3 text-[13px]">
      {label}
      <span className={cx("relative h-5.25 w-9 rounded-full transition", on ? "bg-[#C8102E]" : "bg-[#D9D9DD]")}><span className={cx("absolute top-0.75 h-3.75 w-3.75 rounded-full bg-white shadow transition-all", on ? "left-4.5" : "left-0.75")} /></span>
    </button>
  );
}
