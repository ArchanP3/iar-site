"use client";

import { useActionState, useState } from "react";
import { ChartLine, CheckCircle2, Code, Save, ShieldCheck, TriangleAlert } from "lucide-react";
import { saveTracking } from "@/app/admin/(app)/tracking/actions";
import type { Tracking } from "@/lib/cms/settings";
import { Alert, Card, b, cx, input } from "./ui";

const FIELDS: [keyof Tracking, string, string, string][] = [
  ["gtm", "Google Tag Manager", "GTM-XXXXXXX", "Container ID from tagmanager.google.com"],
  ["ga4", "Google Analytics 4", "G-XXXXXXXXXX", "Measurement ID (Admin → Data streams). Skip if GA4 is set up inside Tag Manager."],
  ["gscVerification", "Search Console verification (industrialautomationrepair.com)", "google-site-verification=… or the content value", "HTML tag method. Paste the whole tag or just the code."],
  ["gscVerificationCa", "Search Console verification (industrialautomationrepair.com)", "google-site-verification=… or the content value", "Same, for the Canadian site. Each site shows only its own code."],
  ["bingVerification", "Bing Webmaster verification", "msvalidate.01 code", "Meta tag method."],
  ["clarity", "Microsoft Clarity (free heatmaps)", "Project ID", "From clarity.microsoft.com → Settings."],
  ["linkedin", "LinkedIn Insight Tag", "Partner ID", "Numbers only, from Campaign Manager."],
];

export default function TrackingForm({ t }: { t: Tracking }) {
  const [state, action, pending] = useActionState(saveTracking, undefined);
  const [where, setWhere] = useState<"head" | "body">("head");
  return (
    <form action={action} className="grid items-start gap-5 xl:grid-cols-[1fr_1.1fr]">
      <Card title="Integrations" icon={<ChartLine size={17} />}>
        <div className="flex flex-col gap-4">
          {FIELDS.map(([k, label, ph, hint]) => (
            <label key={k} className="flex flex-col gap-1.5">
              <span className="flex items-center gap-2 text-[12.5px] font-bold">{label}{t[k] && <span className="ml-auto inline-flex items-center gap-1 text-[11.5px] font-bold text-[#067647]"><CheckCircle2 size={13} /> Active</span>}</span>
              <input name={k} defaultValue={t[k]} placeholder={ph} className={cx(input, "font-mono text-[12.5px]")} />
              <span className="text-[11.5px] text-[#91919E]">{hint}</span>
            </label>
          ))}
          <Alert tone="ok" icon={<ShieldCheck size={16} />}>Tags load after the page is visible, so tracking never slows the site or hurts Core Web Vitals. They never run inside the CMS.</Alert>
        </div>
      </Card>
      <div className="flex flex-col gap-5">
        <Card title="Custom site-wide code" icon={<Code size={17} />} right={
          <span className="inline-flex rounded-[9px] bg-[#F2F2F3] p-0.75">
            {(["head", "body"] as const).map((w) => <button type="button" key={w} onClick={() => setWhere(w)} className={cx("rounded-md px-3 py-1 text-[12px] font-semibold", where === w ? "bg-white shadow" : "text-[#696976]")}>{w === "head" ? "Header" : "Footer"}</button>)}
          </span>
        }>
          <textarea name="headHtml" defaultValue={t.headHtml} rows={12} spellCheck={false} placeholder="<!-- e.g. a verification meta tag or a chat widget script -->" className={cx("w-full rounded-xl bg-[#131316] p-4 font-mono text-[12.5px] text-[#F7D3D9] outline-none placeholder:text-[#828290]", where !== "head" && "hidden")} />
          <textarea name="bodyHtml" defaultValue={t.bodyHtml} rows={12} spellCheck={false} placeholder="<!-- Loaded at the end of every page -->" className={cx("w-full rounded-xl bg-[#131316] p-4 font-mono text-[12.5px] text-[#F7D3D9] outline-none placeholder:text-[#828290]", where !== "body" && "hidden")} />
          <p className="mt-2 text-[12px] text-[#696976]">Runs on every page of the website. For one page only, use the Page scripts tab in that page&apos;s editor.</p>
        </Card>
        <Card>
          {state?.error && <div className="mb-3"><Alert tone="bad" icon={<TriangleAlert size={16} />}>{state.error}</Alert></div>}
          {state?.ok && <div className="mb-3"><Alert tone="ok" icon={<CheckCircle2 size={16} />}>{state.ok}</Alert></div>}
          <button disabled={pending} className={cx(b("primary"), "w-full")}><Save size={15} /> {pending ? "Saving…" : "Save"}</button>
          <p className="mt-2 text-[12px] text-[#91919E]">Only roles with Tracking access can see this screen. Every change is logged and can be undone.</p>
        </Card>
      </div>
    </form>
  );
}
