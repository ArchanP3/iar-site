"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, CheckCircle2, Pause, Pencil, Play, Trash2, TriangleAlert, Upload, X } from "lucide-react";
import { deleteRedirect, ignore404, importRedirects, saveRedirect, toggleRedirect } from "@/app/admin/(app)/redirects/actions";
import { Alert, b, cx, input } from "./ui";

export type Editing = { id?: number; from?: string; to?: string; code?: number; match?: string; note?: string | null; expires?: string | null };

export function RedirectForm({ initial }: { initial?: Editing }) {
  const [state, action, pending] = useActionState(saveRedirect, undefined);
  const [code, setCode] = useState(initial?.code ?? 301);
  return (
    <form action={action} key={JSON.stringify(initial ?? {})} className="flex flex-col gap-3">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <div className="grid items-end gap-3 lg:grid-cols-[1.2fr_auto_1.2fr_190px_170px_auto]">
        <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">From</span><input name="from" required defaultValue={initial?.from} placeholder="/old-page" className={cx(input, "font-mono text-[12.8px]")} /></label>
        <span className="hidden pb-3 text-[#8494AB] lg:block"><ArrowRightLeft size={18} /></span>
        <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">To</span><input name="to" defaultValue={initial?.to} disabled={code === 410} placeholder={code === 410 ? "Removed page (410 Gone)" : "/new-page or https://…"} className={cx(input, "font-mono text-[12.8px]")} /></label>
        <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">Type</span>
          <select name="code" value={code} onChange={(e) => setCode(Number(e.target.value))} className={input}>
            <option value={301}>301 Permanent</option><option value={302}>302 Temporary</option><option value={410}>410 Gone (removed)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">Match</span>
          <select name="match" defaultValue={initial?.match ?? "exact"} className={input}><option value="exact">Exact path</option><option value="prefix">Path and everything under it</option></select>
        </label>
        <button disabled={pending} className={b("primary")}>{pending ? "Saving…" : initial?.id ? "Update" : "Save"}</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">Note <span className="font-semibold text-[#8494AB]">optional</span></span><input name="note" defaultValue={initial?.note ?? ""} placeholder="Why this redirect exists" className={input} /></label>
        <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">Ends on <span className="font-semibold text-[#8494AB]">optional, for temporary promos</span></span><input type="date" name="expires" defaultValue={initial?.expires ?? ""} className={input} /></label>
      </div>
      {state?.error && <Alert tone="bad" icon={<TriangleAlert size={16} />}>{state.error}</Alert>}
      {state?.ok && <Alert tone="ok" icon={<CheckCircle2 size={16} />}>{state.ok} Chains and loops are checked automatically.</Alert>}
    </form>
  );
}

export function RowActions({ id, active }: { id: number; active: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <span className="flex items-center gap-1 text-[#8494AB]">
      <a href={`/admin/redirects?edit=${id}#form`} className="rounded p-1 hover:text-[#0052CC]" title="Edit"><Pencil size={15} /></a>
      <button disabled={pending} onClick={() => start(async () => { await toggleRedirect(id, !active); router.refresh(); })} className="rounded p-1 hover:text-[#0052CC]" title={active ? "Pause" : "Turn on"}>{active ? <Pause size={15} /> : <Play size={15} />}</button>
      <button disabled={pending} onClick={() => confirm("Delete this redirect?") && start(async () => { await deleteRedirect(id); router.refresh(); })} className="rounded p-1 hover:text-[#B42318]" title="Delete"><Trash2 size={15} /></button>
    </span>
  );
}

export function Fix404({ path, suggestion }: { path: string; suggestion: string | null }) {
  const [state, action, pending] = useActionState(saveRedirect, undefined);
  const [ig, start] = useTransition();
  const router = useRouter();
  if (state?.ok) return <span className="text-[12.5px] font-semibold text-[#067647]">Redirect added</span>;
  return (
    <form action={action} className="flex flex-wrap items-center justify-end gap-2">
      <input type="hidden" name="from" value={path} />
      <input type="hidden" name="code" value="301" />
      <input name="to" defaultValue={suggestion ?? ""} placeholder="/send-it-here" className={cx(input, "h-8 w-56 py-1 font-mono text-[12px]")} />
      <button disabled={pending} className={b("dark", true)}>Create 301</button>
      <button type="button" disabled={ig} onClick={() => start(async () => { await ignore404(path); router.refresh(); })} className={b("light", true)} title="Ignore"><X size={13} /></button>
      {state?.error && <span className="w-full text-right text-[12px] text-[#B42318]">{state.error}</span>}
    </form>
  );
}

export function ImportCsv() {
  const [state, action, pending] = useActionState(importRedirects, undefined);
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="file" name="file" accept=".csv,text/csv" className="max-w-55 text-[12px]" />
      <button disabled={pending} className={b("light", true)}><Upload size={13} /> {pending ? "Importing…" : "Import CSV"}</button>
      {state?.ok && <span className="text-[12px] font-semibold text-[#067647]">{state.ok}</span>}
      {state?.error && <span className="text-[12px] font-semibold text-[#B42318]">{state.error}</span>}
    </form>
  );
}
