"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, FileText, ImageIcon, Sparkles, Trash2, TriangleAlert, Upload, X } from "lucide-react";
import { deleteMedia, saveMedia, uploadMedia } from "@/app/admin/(app)/media/actions";
import { Alert, Pill, b, cx, input } from "./ui";

export type MediaItem = { id: number; filename: string; mime: string; width: number | null; height: number | null; bytes: number; original_bytes: number | null; original_name: string | null; alt: string; caption: string; folder: string; used: string[]; created_at: string };

const kb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/* Shrinks big photos in the browser before upload (keeps uploads fast and under the server limit). */
async function shrink(f: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(f.type) || f.size < 1.5 * 1024 * 1024) return f;
  const bmp = await createImageBitmap(f);
  const s = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/webp", 0.9));
  return blob ? new File([blob], f.name.replace(/\.[a-z0-9]+$/i, "") + ".webp", { type: "image/webp" }) : f;
}

export default function MediaLibrary({ items, folders, canDelete }: { items: MediaItem[]; folders: string[]; canDelete: boolean }) {
  const [filter, setFilter] = useState<"all" | "noalt" | "unused" | "big">("all");
  const [folder, setFolder] = useState("");
  const [selId, setSelId] = useState<number | null>(null);
  const sel = items.find((i) => i.id === selId) ?? null;
  const [up, upAction, uploading] = useActionState(uploadMedia, undefined);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [prep, setPrep] = useState(false);
  const router = useRouter();

  useEffect(() => { if (up?.ok) router.refresh(); }, [up, router]);

  const list = items.filter((i) => (folder ? i.folder === folder : true) && (filter === "noalt" ? !i.alt && i.mime.startsWith("image/") : filter === "unused" ? !i.used.length : filter === "big" ? i.bytes > 200 * 1024 : true));
  const counts = { noalt: items.filter((i) => !i.alt && i.mime.startsWith("image/")).length, unused: items.filter((i) => !i.used.length).length, big: items.filter((i) => i.bytes > 200 * 1024).length };

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPrep(true);
    const dt = new DataTransfer();
    for (const f of files) dt.items.add(await shrink(f));
    e.target.files = dt.files;
    setPrep(false);
    formRef.current?.requestSubmit();
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="inline-flex flex-wrap rounded-[10px] bg-[#F2F2F3] p-0.75">
          {([["all", `All ${items.length}`], ["noalt", `Missing alt ${counts.noalt}`], ["unused", `Not used ${counts.unused}`], ["big", `Over 200 KB ${counts.big}`]] as const).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setFilter(k)} className={cx("rounded-lg px-3 py-1.5 text-[12.5px] font-semibold", filter === k ? "bg-white shadow-[0_1px_3px_rgba(19, 19, 22,0.12)]" : "text-[#696976]")}>{l}</button>
          ))}
        </div>
        <select value={folder} onChange={(e) => setFolder(e.target.value)} className="h-8 rounded-[9px] border border-[#EAEAEC] bg-white px-2 text-[12.5px]">
          <option value="">All folders</option>{folders.map((f) => <option key={f}>{f}</option>)}
        </select>
        <span className="flex-1" />
        <form ref={formRef} action={upAction} className="flex items-center gap-2">
          <input list="folders" name="folder" defaultValue={folder || "General"} className="h-9.5 w-36 rounded-[10px] border border-[#EEDADD] px-2.5 text-[12.5px]" title="Folder" />
          <datalist id="folders">{folders.map((f) => <option key={f} value={f} />)}</datalist>
          <input ref={fileRef} type="file" name="files" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf" onChange={onPick} className="hidden" />
          <button type="button" disabled={uploading || prep} onClick={() => fileRef.current?.click()} className={b("primary")}><Upload size={15} /> {prep ? "Preparing…" : uploading ? "Uploading…" : "Upload"}</button>
        </form>
      </div>
      {up?.ok && <Alert tone="ok" icon={<CheckCircle2 size={16} />}>{up.ok}</Alert>}
      {up?.error && <Alert tone="bad" icon={<TriangleAlert size={16} />}>{up.error}</Alert>}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        {list.length ? (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {list.map((i) => (
              <button type="button" key={i.id} onClick={() => setSelId(i.id)} className={cx("overflow-hidden rounded-2xl border bg-white text-left", sel?.id === i.id ? "border-[#C8102E] ring-2 ring-[#C8102E]/30" : "border-[#EAEAEC] hover:border-[#E2BBC1]")}>
                <div className="relative flex h-30 items-center justify-center border-b border-[#EAEAEC] bg-[radial-gradient(120%_90%_at_30%_10%,#FFFFFF_0%,#F4F4F5_55%,#F7E3E6_100%)]">
                  {i.mime.startsWith("image/") ? <img src={`/media/${i.filename}`} alt="" loading="lazy" className="max-h-[78%] max-w-[78%] object-contain" /> : <FileText size={34} className="text-[#91919E]" />}
                  {!i.alt && i.mime.startsWith("image/") && <span className="absolute left-2 top-2"><Pill tone="bad"><TriangleAlert size={11} /> No alt</Pill></span>}
                </div>
                <div className="px-2.5 py-2"><div className="truncate font-mono text-[11.5px]">{i.filename}</div><div className="mt-0.5 text-[11px] text-[#91919E]">{i.mime.split("/")[1].toUpperCase()} · {kb(i.bytes)}</div></div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#FDD1D8] bg-white py-16 text-center text-[#696976]">
            <ImageIcon size={30} className="text-[#91919E]" /><b className="text-[#131316]">{items.length ? "Nothing matches this filter" : "No images yet"}</b>
            <span className="max-w-sm text-[13px]">Upload photos and they are resized, compressed and converted to WebP automatically.</span>
          </div>
        )}
        {sel ? <Details key={sel.id} m={sel} close={() => setSelId(null)} canDelete={canDelete} /> : (
          <div className="hidden rounded-2xl border border-[#EAEAEC] bg-white p-5 text-[13px] text-[#696976] xl:block">Click an image to edit its alt text, caption and file name.</div>
        )}
      </div>
    </>
  );
}

function Details({ m, close, canDelete }: { m: MediaItem; close: () => void; canDelete: boolean }) {
  const [state, action, pending] = useActionState(saveMedia, undefined);
  const [del, start] = useTransition();
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const base = m.filename.replace(/\.[a-z0-9]+$/, "");
  const nonDescriptive = /^(img|dsc|image|photo|screenshot|pxl|whatsapp)[-_ ]?\d*/i.test(base) || /^\d+$/.test(base);
  useEffect(() => { if (state?.ok) router.refresh(); }, [state, router]);
  return (
    <form action={action} className="flex flex-col gap-3.5 rounded-2xl border border-[#EAEAEC] bg-white p-4.5 xl:sticky xl:top-20">
      <input type="hidden" name="id" value={m.id} />
      <div className="flex items-center"><b className="text-[14.5px]">Image details</b><button type="button" onClick={close} className="ml-auto text-[#91919E]"><X size={16} /></button></div>
      <div className="flex h-37.5 items-center justify-center rounded-xl border border-[#EAEAEC] bg-[radial-gradient(120%_90%_at_30%_10%,#FFFFFF_0%,#F4F4F5_55%,#F7E3E6_100%)]">
        {m.mime.startsWith("image/") ? <img src={`/media/${m.filename}`} alt="" className="max-h-[80%] max-w-[80%] object-contain" /> : <FileText size={40} className="text-[#91919E]" />}
      </div>
      <label className="flex flex-col gap-1.5"><span className="flex text-[12.5px] font-bold">File name {nonDescriptive && <span className="ml-auto text-[12px] text-[#B45309]">Not descriptive</span>}</span><input name="filename" defaultValue={base} className={cx(input, "font-mono text-[12.5px]")} /><span className="flex gap-1.5 text-[11.5px] text-[#696976]"><Sparkles size={13} /> Describe the photo, e.g. siemens-sinamics-s120-repair. Renaming keeps the old link working.</span></label>
      {m.mime.startsWith("image/") && <label className="flex flex-col gap-1.5"><span className="flex text-[12.5px] font-bold">Alt text {!m.alt && <span className="ml-auto text-[12px] text-[#B42318]">Required</span>}</span><textarea name="alt" defaultValue={m.alt} rows={2} placeholder="What is in the picture, in a few words" className={input} /></label>}
      <label className="flex flex-col gap-1.5"><span className="flex text-[12.5px] font-bold">Caption <span className="ml-auto text-[12px] font-semibold text-[#91919E]">Optional</span></span><input name="caption" defaultValue={m.caption} className={input} /></label>
      <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">Folder</span><input name="folder" defaultValue={m.folder} className={input} /></label>
      <div className="flex flex-col gap-1 text-[12.5px]">
        {m.original_bytes ? <div className="flex justify-between"><span className="text-[#696976]">Original</span><b>{kb(m.original_bytes)}{m.original_name ? ` · ${m.original_name.split(".").pop()?.toUpperCase()}` : ""}</b></div> : null}
        <div className="flex justify-between"><span className="text-[#696976]">Optimized</span><b className="text-[#067647]">{kb(m.bytes)} {m.mime.split("/")[1].toUpperCase()}{m.width ? ` · ${m.width}×${m.height}` : ""}</b></div>
        <div className="flex justify-between gap-3"><span className="text-[#696976]">Used on</span><b className="text-right">{m.used.length ? m.used.slice(0, 3).join(", ") + (m.used.length > 3 ? "…" : "") : "Not used yet"}</b></div>
      </div>
      {state?.error && <Alert tone="bad" icon={<TriangleAlert size={16} />}>{state.error}</Alert>}
      {state?.ok && <Alert tone="ok" icon={<CheckCircle2 size={16} />}>{state.ok}</Alert>}
      <button disabled={pending} className={b("primary")}>{pending ? "Saving…" : "Save"}</button>
      <div className="flex gap-2">
        <button type="button" onClick={() => { navigator.clipboard.writeText(`/media/${m.filename}`); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className={cx(b("light", true), "flex-1")}><Copy size={13} /> {copied ? "Copied" : "Copy link"}</button>
        {canDelete && <button type="button" disabled={del} onClick={() => confirm(m.used.length ? `This file is used on ${m.used.length} page(s). Delete anyway? Those pages will show a broken image.` : "Delete this file?") && start(async () => { await deleteMedia(m.id); close(); router.refresh(); })} className={b("danger", true)}><Trash2 size={13} /> Delete</button>}
      </div>
    </form>
  );
}
