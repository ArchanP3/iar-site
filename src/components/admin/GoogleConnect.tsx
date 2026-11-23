"use client";

import { useActionState } from "react";
import { CheckCircle2, Plug, TriangleAlert } from "lucide-react";
import { saveGoogle } from "@/app/admin/(app)/performance/actions";
import type { GoogleCfg } from "@/lib/cms/settings";
import { Alert, Card, b, cx, input } from "./ui";

export default function GoogleConnect({ cfg, email, compact }: { cfg: GoogleCfg; email: string | null; compact?: boolean }) {
  const [state, action, pending] = useActionState(saveGoogle, undefined);
  return (
    <Card title={compact ? "Google connection" : "Connect Google (free)"} icon={<Plug size={17} />}>
      <form action={action} className="grid items-start gap-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">Search Console property</span><input name="gscSite" defaultValue={cfg.gscSite} placeholder="sc-domain:automiqautomation.com" className={cx(input, "font-mono text-[12.5px]")} /></label>
          <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">GA4 Property ID</span><input name="ga4Property" defaultValue={cfg.ga4Property} placeholder="123456789" className={cx(input, "font-mono text-[12.5px]")} /></label>
          {state?.error && <Alert tone="bad" icon={<TriangleAlert size={16} />}>{state.error}</Alert>}
          {state?.ok && <Alert tone="ok" icon={<CheckCircle2 size={16} />}>{state.ok}</Alert>}
          <div><button disabled={pending} className={b("primary")}>{pending ? "Saving…" : "Save"}</button></div>
        </div>
        <div className="rounded-xl bg-[#F8FAFD] p-4 text-[12.8px] leading-[1.65] text-[#33445F]">
          {email ? (
            <>
              <b>Give the website read access</b>
              <ol className="mt-1.5 list-decimal space-y-1 pl-5">
                <li>Search Console → Settings → Users and permissions → Add user: <code className="break-all rounded bg-white px-1 text-[#0052CC]">{email}</code> as <b>Restricted</b>.</li>
                <li>Google Analytics → Admin → Property access management → add the same email as <b>Viewer</b>.</li>
                <li>Enter the property names on the left and save.</li>
              </ol>
            </>
          ) : (
            <>
              <b>One-time server setup (website administrator)</b>
              <p className="mt-1">The server needs a free Google Cloud service account key in the setting <code className="rounded bg-white px-1">GOOGLE_SERVICE_ACCOUNT_JSON</code>. The setup guide explains it step by step. After that, this box shows the email to add in Search Console and Analytics.</p>
            </>
          )}
        </div>
      </form>
    </Card>
  );
}
