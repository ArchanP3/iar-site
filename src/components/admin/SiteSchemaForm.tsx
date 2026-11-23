"use client";

import { useActionState, useMemo, useState } from "react";
import { CheckCircle2, Save, TriangleAlert } from "lucide-react";
import { saveSiteSchema } from "@/app/admin/(app)/schema/actions";
import { Alert, b } from "./ui";

export default function SiteSchemaForm({ value, sample }: { value: string; sample: string }) {
  const [state, action, pending] = useActionState(saveSiteSchema, undefined);
  const [txt, setTxt] = useState(value);
  const err = useMemo(() => {
    if (!txt.trim()) return null;
    try { JSON.parse(txt); return null; } catch (e) { return (e as Error).message; }
  }, [txt]);
  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setTxt(sample)} className={b("light", true)}>Start from Organization template</button></div>
      <textarea name="site" value={txt} onChange={(e) => setTxt(e.target.value)} rows={14} spellCheck={false} placeholder="Optional. JSON-LD added to every page." className="w-full rounded-xl bg-[#0B1A3C] p-4 font-mono text-[12.5px] leading-relaxed text-[#CFE3FF] outline-none placeholder:text-[#6F82A3]" />
      {txt.trim() && (err ? <Alert tone="bad" icon={<TriangleAlert size={16} />}><b>Not valid JSON yet:</b> {err}</Alert> : <Alert tone="ok" icon={<CheckCircle2 size={16} />}>Valid JSON-LD.</Alert>)}
      {state?.error && <Alert tone="bad" icon={<TriangleAlert size={16} />}>{state.error}</Alert>}
      {state?.ok && <Alert tone="ok" icon={<CheckCircle2 size={16} />}>{state.ok}</Alert>}
      <div><button disabled={pending || Boolean(err)} className={b("primary")}><Save size={15} /> {pending ? "Saving…" : "Save site-wide schema"}</button></div>
    </form>
  );
}
