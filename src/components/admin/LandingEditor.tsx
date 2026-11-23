"use client";

import { useActionState, useState, useTransition } from "react";
import {
  ArrowDown, ArrowUp, BadgeCheck, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Eye, Image as ImageIcon, LayoutTemplate, List, MapPin, Package, Plus, Send, Tag, Trash2, TriangleAlert, Type, Wrench,
} from "lucide-react";
import { deleteLanding, generatePages, saveLanding } from "@/app/admin/(app)/landing/actions";
import type { Block, CmsLanding } from "@/lib/cms/content";
import { SITE_CHOICES } from "@/lib/site";
import MediaPicker from "./MediaPicker";
import { Alert, Bar, Card, Pill, b, cx, input, lenColor } from "./ui";

type L = Omit<CmsLanding, "updated_at"> & { updated_at: string };

const LIB: { type: Block["type"]; label: string; icon: React.ElementType; make: (t: boolean) => Block }[] = [
  { type: "hero", label: "Hero", icon: LayoutTemplate, make: (t) => ({ type: "hero", eyebrow: t ? "{city}, {province}" : "Canada & USA", heading: t ? "Servo Drive & Motor Repair for {city} Manufacturers" : "Servo Drive & Motor Repair", text: t ? "Pickup from your plant in {city} or ship it in. Free evaluation, 12-month warranty." : "Free evaluation, written quote first, 12-month warranty.", primary: { label: "Request a Repair Quote", href: "/request-repair" }, secondary: { label: "Request a Pickup", href: "/request-pickup" }, tone: "navy" }) },
  { type: "services", label: "Service cards", icon: Wrench, make: () => ({ type: "services", heading: "What we repair", items: ["servo-drive-repair", "servo-motor-repair", "plc-repair"] }) },
  { type: "brands", label: "Brands strip", icon: Tag, make: () => ({ type: "brands", heading: "Brands we repair", items: ["siemens", "allen-bradley", "fanuc"] }) },
  { type: "steps", label: "How it works", icon: List, make: () => ({ type: "steps", heading: "How it works", items: [{ t: "Send it in", d: "Drop it off, ship it, or book a pickup." }, { t: "Free evaluation", d: "We find the root cause and send a written quote." }, { t: "Component-level repair", d: "Failed parts replaced, not a board swap." }, { t: "Tested & returned", d: "Run under power on our own jigs, 12-month warranty." }] }) },
  { type: "trust", label: "Trust badges", icon: BadgeCheck, make: () => ({ type: "trust", items: [{ t: "Free evaluation", d: "On every repair" }, { t: "12-month warranty", d: "On repairs" }, { t: "Tested on our jigs", d: "Test report included" }, { t: "Canada & USA", d: "Pickup or ship it in" }] }) },
  { type: "text", label: "Rich text", icon: Type, make: () => ({ type: "text", heading: "Section heading", body: "Write here. Use **bold**, lists and [links](/services)." }) },
  { type: "imageText", label: "Image + text", icon: ImageIcon, make: () => ({ type: "imageText", heading: "Heading", body: "Text next to the image.", image: "", alt: "", side: "left" }) },
  { type: "faq", label: "FAQ + schema", icon: CircleHelp, make: (t) => ({ type: "faq", heading: "Frequently asked questions", items: t ? [["Do you have a repair shop in {city}?", "Every repair is done at our repair centre in Mississauga, Ontario. We arrange the pickup from {city}."]] : [["Question customers ask", "A clear, specific answer."]] }) },
  { type: "parts", label: "Parts grid", icon: Package, make: () => ({ type: "parts", heading: "Parts in stock", query: "siemens" }) },
  { type: "cta", label: "Call to action", icon: Send, make: (t) => ({ type: "cta", heading: t ? "Line down in {city}? Let's get it running again." : "Line down? Let's get it running again.", text: "Free evaluation, written quote first, 12-month warranty.", primary: { label: "Request a Repair Quote", href: "/request-repair" }, secondary: { label: "Request a Pickup", href: "/request-pickup" } }) },
];

export default function LandingEditor({ page, isNew, templates, services, brands, site, saved, usedBy }: {
  page: L | null; isNew: boolean; templates: { id: number; name: string }[]; services: { slug: string; title: string }[]; brands: { slug: string; name: string }[];
  site: string; saved: boolean; usedBy: number;
}) {
  const kind = page?.kind ?? "page";
  const isTemplate = kind === "template";
  const [state, action, pending] = useActionState(saveLanding, saved ? { ok: "Saved." } : undefined);
  const [gen, genAction, generating] = useActionState(generatePages, undefined);
  const [blocks, setBlocks] = useState<Block[]>(page?.blocks?.length ? page.blocks : page?.template_id ? [] : [LIB[0].make(isTemplate), LIB[4].make(isTemplate), LIB[1].make(isTemplate), LIB[3].make(isTemplate), LIB[7].make(isTemplate), LIB[9].make(isTemplate)]);
  const [open, setOpen] = useState<number | null>(0);
  const [vars, setVars] = useState<Record<string, string>>(page?.vars ?? (isTemplate ? { city: "Burlington", province: "ON", path_pattern: "/servo-drive-repair-{city_slug}" } : {}));
  const [path, setPath] = useState(page?.path ?? "/");
  const [seoTitle, setSeoTitle] = useState(page?.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(page?.seo_description ?? "");
  const [picker, setPicker] = useState<number | null>(null);
  const [del, startDel] = useTransition();
  const fromTemplate = Boolean(page?.template_id);
  const live = page && !isNew ? page : null;
  const tName = templates.find((t) => t.id === page?.template_id)?.name;

  const set = (i: number, patch: Partial<Block>) => setBlocks(blocks.map((x, k) => (k === i ? ({ ...x, ...patch } as Block) : x)));
  const move = (i: number, d: number) => { const n = [...blocks]; const [x] = n.splice(i, 1); n.splice(i + d, 0, x); setBlocks(n); setOpen(i + d); };
  const fill = (s: string) => s.replace(/\{([a-z_]+)\}/gi, (m, k) => vars[k.toLowerCase()] ?? m);
  const tl = fill(seoTitle).length, dl = fill(seoDesc).length;

  return (
    <>
    <form action={action} className="grid items-start gap-5 xl:grid-cols-[230px_minmax(0,1fr)_330px]">
      <input type="hidden" name="id" value={live?.id ?? ""} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="blocks" value={JSON.stringify(blocks)} />
      <input type="hidden" name="vars" value={JSON.stringify(vars)} />
      <input type="hidden" name="path" value={path} />
      {picker !== null && <MediaPicker onClose={() => setPicker(null)} onPick={(m) => { set(picker, { image: m.url, alt: m.alt } as Partial<Block>); setPicker(null); }} />}

      <Card title="Add a block">
        {fromTemplate ? <p className="text-[12.5px] text-[#696976]">This page uses the <b>{tName}</b> template. Edit the template to change the layout of every page made from it.</p> : (
          <div className="flex flex-col gap-2">
            {LIB.map((l) => (
              <button type="button" key={l.type} onClick={() => { setBlocks([...blocks, l.make(isTemplate)]); setOpen(blocks.length); }} className="flex items-center gap-2.5 rounded-[10px] border border-[#EAEAEC] bg-white px-2.5 py-2 text-left text-[12.8px] font-semibold hover:border-[#C8102E]">
                <l.icon size={15} className="text-[#696976]" />{l.label}<Plus size={14} className="ml-auto text-[#91919E]" />
              </button>
            ))}
            <p className="mt-1 text-[11.5px] text-[#91919E]">Blocks use the website&apos;s own design, so new pages always match the brand.</p>
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-3">
        {fromTemplate ? (
          <Card title="Page details">
            <div className="grid gap-3 sm:grid-cols-3">
              {Object.keys({ city: "", province: "", region: "", ...vars }).filter((k) => k !== "path_pattern" && k !== "city_slug").map((k) => (
                <label key={k} className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold capitalize">{k}</span><input value={vars[k] ?? ""} onChange={(e) => setVars({ ...vars, [k]: e.target.value })} className={input} /></label>
              ))}
            </div>
          </Card>
        ) : blocks.length === 0 ? <Card><p className="py-8 text-center text-[#91919E]">Add blocks from the left to build the page.</p></Card> : blocks.map((bl, i) => {
          const L = LIB.find((l) => l.type === bl.type)!;
          const isOpen = open === i;
          return (
            <div key={i} className={cx("overflow-hidden rounded-2xl border bg-white", isOpen ? "border-[#C8102E]" : "border-[#EAEAEC]")}>
              <div className="flex items-center gap-2 px-4 py-2.5">
                <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}<L.icon size={15} className="text-[#C8102E]" /><b className="text-[13px]">{L.label}</b>
                  <span className="truncate text-[12.5px] text-[#91919E]">{"heading" in bl && bl.heading ? fill(bl.heading) : ""}</span>
                </button>
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1 text-[#91919E] hover:text-[#131316] disabled:opacity-30"><ArrowUp size={15} /></button>
                <button type="button" disabled={i === blocks.length - 1} onClick={() => move(i, 1)} className="rounded p-1 text-[#91919E] hover:text-[#131316] disabled:opacity-30"><ArrowDown size={15} /></button>
                <button type="button" onClick={() => { setBlocks(blocks.filter((_, k) => k !== i)); setOpen(null); }} className="rounded p-1 text-[#91919E] hover:text-[#B42318]"><Trash2 size={15} /></button>
              </div>
              {isOpen && <div className="border-t border-[#EAEAEC] bg-[#FCFCFC] p-4"><BlockFields b={bl} set={(p) => set(i, p)} services={services} brands={brands} pickImage={() => setPicker(i)} /></div>}
            </div>
          );
        })}
        {isTemplate && <Alert tone="blue" icon={<MapPin size={16} />}>Use <b>{"{city}"}</b>, <b>{"{province}"}</b> and <b>{"{region}"}</b> anywhere in the text. Each page made from this template fills them in, and gets LocalBusiness schema for its city.</Alert>}
      </div>

      <div className="flex flex-col gap-5 xl:sticky xl:top-20">
        <Card title={isTemplate ? "Template" : "Publish"} right={!isTemplate && live && <Pill tone={live.status === "published" ? "ok" : "warn"}>{live.status === "published" ? "Live" : "Draft"}</Pill>}>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">Name <span className="font-semibold text-[#91919E]">(for the CMS)</span></span><input name="name" defaultValue={page?.name ?? ""} required className={input} /></label>
            {isTemplate ? (
              <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">URL pattern for new pages</span><input value={vars.path_pattern ?? ""} onChange={(e) => setVars({ ...vars, path_pattern: e.target.value })} className={cx(input, "font-mono text-[12.5px]")} /></label>
            ) : (
              <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">Page URL</span><input value={path} onChange={(e) => setPath(e.target.value.toLowerCase().replace(/[^a-z0-9/-]/g, "-"))} placeholder="/servo-drive-repair-burlington" className={cx(input, "font-mono text-[12.5px]")} /></label>
            )}
            {state?.error && <Alert tone="bad" icon={<TriangleAlert size={16} />}>{state.error}</Alert>}
            {state?.ok && <Alert tone="ok" icon={<CheckCircle2 size={16} />}>{state.ok}</Alert>}
            {isTemplate ? <button name="intent" value="save" disabled={pending} className={b("primary")}>{pending ? "Saving…" : "Save template"}</button> : (
              <>
                <button name="intent" value="publish" disabled={pending} className={b("primary")}><Send size={15} /> {page?.status === "published" ? "Update" : "Publish"}</button>
                <button name="intent" value="draft" disabled={pending} className={b("light")}>{pending ? "Saving…" : "Save draft"}</button>
                {page?.status === "published" && <button name="intent" value="unpublish" disabled={pending} className={b("light", true)}>Unpublish</button>}
              </>
            )}
            {live && <a href={`/admin/preview/landing/${live.id}`} target="_blank" className={b("light", true)}><Eye size={13} /> Preview{isTemplate ? " with sample city" : ""}</a>}
            {page && !isTemplate && page.status === "published" && <a href={page.path} target="_blank" className="truncate text-[12.5px] font-semibold text-[#A50D25]">View live: {page.path}</a>}
          </div>
        </Card>
        <Card title="SEO">
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5"><span className="flex text-[12.5px] font-bold">SEO title <span className="ml-auto" style={{ color: lenColor(tl, 30, 60) }}>{tl} / 60</span></span><input name="seo_title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={isTemplate ? "Servo Drive Repair in {city}, {province} | AutomIQ" : ""} className={input} /><Bar pct={(tl / 60) * 100} color={lenColor(tl, 30, 60)} /></label>
            <label className="flex flex-col gap-1.5"><span className="flex text-[12.5px] font-bold">Meta description <span className="ml-auto" style={{ color: lenColor(dl, 70, 160) }}>{dl} / 160</span></span><textarea name="seo_description" value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={3} className={input} /><Bar pct={(dl / 160) * 100} color={lenColor(dl, 70, 160)} /></label>
            {fromTemplate && !seoTitle && <p className="text-[11.5px] text-[#91919E]">Empty = the template&apos;s title, filled in for this city.</p>}
            <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">Show on</span><select name="site" defaultValue={page?.site ?? "both"} className={input}>{SITE_CHOICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>{isTemplate && <span className="text-[11.5px] text-[#91919E]">Pages made from this template get the same setting.</span>}</label>
            <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">Sitemap</span><select name="in_sitemap" defaultValue={page?.in_sitemap ?? (isTemplate ? "locations" : "pages")} className={input}><option value="pages">Pages sitemap</option><option value="locations">Locations sitemap</option></select></label>
            <div className="rounded-xl border border-[#EAEAEC] p-3 font-[Arial,sans-serif]">
              <div className="text-[11.5px] text-[#4D4D56]">{site.replace(/^https?:\/\//, "")}{isTemplate ? fill((vars.path_pattern ?? "").replace("{city_slug}", (vars.city ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-"))) : path}</div>
              <div className="mt-1 text-[16px] leading-tight text-[#931326]">{fill(seoTitle) || page?.name || "Page title"}</div>
              <div className="mt-0.5 text-[12.5px] text-[#4D4D56]">{fill(seoDesc) || "Add a meta description."}</div>
            </div>
          </div>
        </Card>
        {isTemplate && live && (
          <Card title="Create pages from this template" icon={<MapPin size={16} />}>
            <div className="flex flex-col gap-2.5">
              <p className="text-[12.5px] text-[#696976]">One per line: <b>City, Province</b>. {usedBy > 0 && `${usedBy} pages already use this template.`}</p>
              <textarea form="gen" name="lines" rows={5} placeholder={"Burlington, ON\nGuelph, ON\nColumbus, OH"} className={input} />
              <label className="flex items-center gap-2 text-[12.5px]"><input form="gen" type="checkbox" name="publish" className="h-4 w-4 accent-[#C8102E]" /> Publish right away</label>
              <button form="gen" disabled={generating} className={b("dark")}>{generating ? "Creating…" : "Create pages"}</button>
              {gen?.ok && <Alert tone="ok" icon={<CheckCircle2 size={16} />}>{gen.ok}</Alert>}
              {gen?.error && <Alert tone="bad" icon={<TriangleAlert size={16} />}>{gen.error}</Alert>}
            </div>
          </Card>
        )}
        {live && <button type="button" disabled={del} onClick={() => confirm(isTemplate ? "Delete this template?" : "Delete this page? Add a redirect for its URL if it was live.") && startDel(async () => { const r = await deleteLanding(live.id); if (r?.error) alert(r.error); })} className={b("danger")}><Trash2 size={14} /> Delete</button>}
      </div>
    </form>
    {isTemplate && live && <GenForm id={live.id} action={genAction} />}
    </>
  );
}

function GenForm({ id, action }: { id: number; action: (fd: FormData) => void }) {
  return <form id="gen" action={action}><input type="hidden" name="template_id" value={id} /></form>;
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1.5"><span className="text-[12px] font-bold text-[#45454D]">{label}</span>{children}</label>;
}

function BlockFields({ b: bl, set, services, brands, pickImage }: { b: Block; set: (p: Partial<Block>) => void; services: { slug: string; title: string }[]; brands: { slug: string; name: string }[]; pickImage: () => void }) {
  const t = (k: string, v: string | undefined, area = false, rows = 3) => area
    ? <textarea value={v ?? ""} rows={rows} onChange={(e) => set({ [k]: e.target.value } as Partial<Block>)} className={input} />
    : <input value={v ?? ""} onChange={(e) => set({ [k]: e.target.value } as Partial<Block>)} className={input} />;
  const link = (k: "primary" | "secondary", v?: { label: string; href: string }) => (
    <div className="grid grid-cols-2 gap-2">
      <input value={v?.label ?? ""} placeholder="Button text" onChange={(e) => set({ [k]: { label: e.target.value, href: v?.href ?? "" } } as Partial<Block>)} className={input} />
      <input value={v?.href ?? ""} placeholder="/request-repair" onChange={(e) => set({ [k]: { label: v?.label ?? "", href: e.target.value } } as Partial<Block>)} className={cx(input, "font-mono text-[12px]")} />
    </div>
  );
  switch (bl.type) {
    case "hero":
      return <div className="grid gap-3"><F label="Small line above">{t("eyebrow", bl.eyebrow)}</F><F label="Main heading (H1)">{t("heading", bl.heading, true, 2)}</F><F label="Text">{t("text", bl.text, true, 2)}</F><F label="Main button">{link("primary", bl.primary)}</F><F label="Second button">{link("secondary", bl.secondary)}</F><F label="Background"><select value={bl.tone ?? "navy"} onChange={(e) => set({ tone: e.target.value as "navy" | "light" })} className={input}><option value="navy">Navy</option><option value="light">Light</option></select></F></div>;
    case "text":
      return <div className="grid gap-3"><F label="Heading">{t("heading", bl.heading)}</F><F label="Text (Markdown)">{t("body", bl.body, true, 8)}</F></div>;
    case "services":
      return <div className="grid gap-3"><F label="Heading">{t("heading", bl.heading)}</F><div className="grid max-h-56 grid-cols-2 gap-1.5 overflow-y-auto rounded-xl border border-[#EAEAEC] bg-white p-2">{services.map((s) => <label key={s.slug} className="flex items-center gap-2 text-[12.5px]"><input type="checkbox" checked={bl.items.includes(s.slug)} onChange={(e) => set({ items: e.target.checked ? [...bl.items, s.slug] : bl.items.filter((x) => x !== s.slug) })} className="accent-[#C8102E]" />{s.title}</label>)}</div></div>;
    case "brands":
      return <div className="grid gap-3"><F label="Heading">{t("heading", bl.heading)}</F><div className="grid max-h-56 grid-cols-3 gap-1.5 overflow-y-auto rounded-xl border border-[#EAEAEC] bg-white p-2">{brands.map((s) => <label key={s.slug} className="flex items-center gap-2 text-[12.5px]"><input type="checkbox" checked={bl.items.includes(s.slug)} onChange={(e) => set({ items: e.target.checked ? [...bl.items, s.slug] : bl.items.filter((x) => x !== s.slug) })} className="accent-[#C8102E]" />{s.name}</label>)}</div></div>;
    case "steps":
    case "trust":
      return (
        <div className="grid gap-2.5">
          {bl.type === "steps" && <F label="Heading">{t("heading", bl.heading)}</F>}
          {bl.items.map((it, i) => (
            <div key={i} className="grid grid-cols-[1fr_1.6fr_auto] gap-2">
              <input value={it.t} onChange={(e) => set({ items: bl.items.map((x, k) => (k === i ? { ...x, t: e.target.value } : x)) })} placeholder="Title" className={input} />
              <input value={it.d} onChange={(e) => set({ items: bl.items.map((x, k) => (k === i ? { ...x, d: e.target.value } : x)) })} placeholder="Text" className={input} />
              <button type="button" onClick={() => set({ items: bl.items.filter((_, k) => k !== i) })} className="text-[#91919E]"><Trash2 size={15} /></button>
            </div>
          ))}
          <button type="button" onClick={() => set({ items: [...bl.items, { t: "", d: "" }] })} className={b("light", true)}><Plus size={13} /> Add item</button>
        </div>
      );
    case "faq":
      return (
        <div className="grid gap-2.5">
          <F label="Heading">{t("heading", bl.heading)}</F>
          {bl.items.map(([q, a], i) => (
            <div key={i} className="grid gap-1.5 rounded-xl border border-[#EAEAEC] bg-white p-2.5">
              <div className="flex gap-2"><input value={q} onChange={(e) => set({ items: bl.items.map((x, k) => (k === i ? [e.target.value, x[1]] as [string, string] : x)) })} placeholder="Question" className={input} /><button type="button" onClick={() => set({ items: bl.items.filter((_, k) => k !== i) })} className="text-[#91919E]"><Trash2 size={15} /></button></div>
              <textarea value={a} rows={2} onChange={(e) => set({ items: bl.items.map((x, k) => (k === i ? [x[0], e.target.value] as [string, string] : x)) })} placeholder="Answer" className={input} />
            </div>
          ))}
          <button type="button" onClick={() => set({ items: [...bl.items, ["", ""]] })} className={b("light", true)}><Plus size={13} /> Add question</button>
        </div>
      );
    case "imageText":
      return (
        <div className="grid gap-3">
          <F label="Heading">{t("heading", bl.heading)}</F>
          <F label="Text (Markdown)">{t("body", bl.body, true, 5)}</F>
          <div className="flex items-center gap-3">{bl.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={bl.image} alt="" className="h-16 w-24 rounded-lg border border-[#EAEAEC] object-contain" /> : null}<button type="button" onClick={pickImage} className={b("light", true)}><ImageIcon size={13} /> {bl.image ? "Change image" : "Choose image"}</button></div>
          <F label="Image alt text">{t("alt", bl.alt)}</F>
          <F label="Image side"><select value={bl.side ?? "left"} onChange={(e) => set({ side: e.target.value as "left" | "right" })} className={input}><option value="left">Left</option><option value="right">Right</option></select></F>
        </div>
      );
    case "cta":
      return <div className="grid gap-3"><F label="Heading">{t("heading", bl.heading, true, 2)}</F><F label="Text">{t("text", bl.text)}</F><F label="Main button">{link("primary", bl.primary)}</F><F label="Second button">{link("secondary", bl.secondary)}</F></div>;
    case "parts":
      return <div className="grid gap-3"><F label="Heading">{t("heading", bl.heading)}</F><F label="Show parts matching (brand, part number or words)">{t("query", bl.query)}</F></div>;
  }
}
