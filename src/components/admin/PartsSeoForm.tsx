"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import { savePartsSeo } from "@/app/admin/(app)/parts/actions";
import type { PartsSeo } from "@/lib/cms/settings";
import { Alert, Card, b, cx, input, lenColor } from "./ui";

const fill = (t: string, v: Record<string, string>) => t.replace(/\{([a-z_]+)\}/g, (m, k) => v[k] ?? m).replace(/\s+/g, " ").replace(/\s+([.,])/g, "$1").trim();
const VARS = ["brand", "part_number", "name", "category", "series", "availability", "repair"];

export default function PartsSeoForm({ cfg, samples }: { cfg: PartsSeo; samples: { label: string; vars: Record<string, string> }[] }) {
  const [state, action, pending] = useActionState(savePartsSeo, undefined);
  const [on, setOn] = useState(cfg.on);
  const [t, setT] = useState(cfg.titleTemplate);
  const [d, setD] = useState(cfg.descriptionTemplate);
  const [s, setS] = useState(0);
  const v = samples[s]?.vars ?? {};
  const ft = fill(t, v), fd = fill(d, v);
  return (
    <form action={action} className="grid items-start gap-5 xl:grid-cols-[1.2fr_1fr]">
      <Card title="Title & description pattern for every part page">
        <div className="flex flex-col gap-3.5">
          <label className="flex items-center gap-2.5 text-[13px] font-semibold"><input type="checkbox" name="on" checked={on} onChange={(e) => setOn(e.target.checked)} className="h-4 w-4 accent-[#0066FF]" /> Use these patterns (off = the website&apos;s built-in titles)</label>
          <label className={cx("flex flex-col gap-1.5", !on && "opacity-50")}><span className="text-[12.5px] font-bold">Title pattern</span><input name="titleTemplate" value={t} onChange={(e) => setT(e.target.value)} className={cx(input, "font-mono text-[12.5px]")} /></label>
          <label className={cx("flex flex-col gap-1.5", !on && "opacity-50")}><span className="text-[12.5px] font-bold">Description pattern</span><textarea name="descriptionTemplate" value={d} onChange={(e) => setD(e.target.value)} rows={3} className={cx(input, "font-mono text-[12.5px]")} /></label>
          <div className="flex flex-wrap gap-1.5">{VARS.map((x) => <code key={x} className="rounded-md bg-[#EEF4FB] px-1.5 py-0.5 text-[11.5px] text-[#0052CC]">{`{${x}}`}</code>)}</div>
          {state?.error && <Alert tone="bad" icon={<TriangleAlert size={16} />}>{state.error}</Alert>}
          {state?.ok && <Alert tone="ok" icon={<CheckCircle2 size={16} />}>{state.ok}</Alert>}
          <div><button disabled={pending} className={b("primary")}>{pending ? "Saving…" : "Save"}</button></div>
        </div>
      </Card>
      <Card title="Google preview" right={samples.length > 1 && <select value={s} onChange={(e) => setS(Number(e.target.value))} className={cx(input, "h-8! w-auto! py-0! text-[12px]")}>{samples.map((x, i) => <option key={i} value={i}>{x.label}</option>)}</select>}>
        <div className="rounded-xl border border-[#E3EAF3] p-4 font-[Arial,sans-serif]">
          <div className="text-[12px] text-[#4D5156]">automiqautomation.com › parts</div>
          <div className="mt-1 text-[18px] leading-tight text-[#1A0DAB]">{ft}</div>
          <div className="mt-1 text-[13px] text-[#4D5156]">{fd}</div>
        </div>
        <div className="mt-3 flex gap-4 text-[12px] font-semibold"><span style={{ color: lenColor(ft.length, 30, 65) }}>Title {ft.length} chars</span><span style={{ color: lenColor(fd.length, 70, 160) }}>Description {fd.length} chars</span></div>
      </Card>
    </form>
  );
}
