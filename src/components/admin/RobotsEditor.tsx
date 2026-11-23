"use client";

import { useActionState, useState, useTransition } from "react";
import { CheckCircle2, RotateCcw, Save, Search, TriangleAlert, XCircle } from "lucide-react";
import { saveRobots, testUrl } from "@/app/admin/(app)/sitemaps/actions";
import { Alert, b, cx, input } from "./ui";

export default function RobotsEditor({ current, fallback }: { current: string; fallback: string }) {
  const [state, action, pending] = useActionState(saveRobots, undefined);
  const [txt, setTxt] = useState(current);
  const [url, setUrl] = useState("/checkout");
  const [res, setRes] = useState<Awaited<ReturnType<typeof testUrl>> | null>(null);
  const [testing, start] = useTransition();
  const wholeSite = /user-agent:\s*\*[\s\S]*?\n\s*disallow:\s*\/\s*(\n|$)/i.test(txt + "\n");
  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
      <form action={action} className="flex flex-col gap-3">
        <textarea name="robots" value={txt} onChange={(e) => setTxt(e.target.value)} rows={14} spellCheck={false} className="min-h-65 w-full rounded-xl bg-[#131316] p-4 font-mono text-[12.5px] leading-relaxed text-[#F7D3D9] outline-none" />
        {wholeSite && <Alert tone="bad" icon={<XCircle size={16} />}>This rule hides the whole website from Google. Saving will be blocked.</Alert>}
        {state?.error && <Alert tone="bad" icon={<TriangleAlert size={16} />}>{state.error}</Alert>}
        {state?.ok && <Alert tone="ok" icon={<CheckCircle2 size={16} />}>{state.ok}</Alert>}
        <div className="flex flex-wrap gap-2">
          <button disabled={pending} className={b("primary")}><Save size={15} /> {pending ? "Saving…" : "Save robots.txt"}</button>
          <button type="button" onClick={() => setTxt(fallback)} className={b("light")}><RotateCcw size={14} /> Restore default</button>
        </div>
      </form>
      <div className="flex flex-col gap-3">
        <p className="font-bold">Test a URL</p>
        <div className="flex gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} className={cx(input, "font-mono text-[12.8px]")} />
          <button type="button" disabled={testing} onClick={() => start(async () => setRes(await testUrl(txt, url)))} className={b("dark")}><Search size={14} /> Test</button>
        </div>
        {res && (res.allowed
          ? <Alert tone="ok" icon={<CheckCircle2 size={16} />}><b>Allowed</b> for Google{res.rule ? ` (${res.rule})` : ""}. {res.sitemap ? `Listed in the ${res.sitemap} sitemap.` : "Not in a sitemap (noindex, redirected or not a page)."}</Alert>
          : <Alert tone="bad" icon={<XCircle size={16} />}><b>Blocked</b> for all crawlers by <span className="font-mono">{res.rule}</span></Alert>)}
        <Alert tone="warn" icon={<TriangleAlert size={16} />}>Safety check: saving is blocked if a rule would hide the whole site (for example <span className="font-mono">Disallow: /</span>). Tests use the text in the editor, saved or not.</Alert>
      </div>
    </div>
  );
}
