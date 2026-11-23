"use client";

import { useActionState, useEffect } from "react";
import { CheckCircle2, KeyRound, LogOut, ShieldCheck, Smartphone, TriangleAlert, UserRound } from "lucide-react";
import { changePassword, confirmTwoStep, saveName, signOutOthers, startTwoStep, stopTwoStep } from "@/app/admin/(app)/account/actions";
import { Alert, Card, b, cx, input } from "./ui";

type S = { ok?: string; error?: string } | undefined;
function Status({ s }: { s: S }) {
  if (s?.error) return <Alert tone="bad" icon={<TriangleAlert size={16} />}>{s.error}</Alert>;
  if (s?.ok) return <Alert tone="ok" icon={<CheckCircle2 size={16} />}>{s.ok}</Alert>;
  return null;
}

export default function AccountForms({ name, mustChange, totpOn, required, pendingSecret, qr, notice }: {
  name: string; mustChange: boolean; totpOn: boolean; required: boolean; pendingSecret: string | null; qr: string | null; notice: "first" | "setup2fa" | "on" | "others" | null;
}) {
  const [pw, pwAction, pwPending] = useActionState(changePassword, undefined);
  const [nm, nmAction, nmPending] = useActionState(saveName, undefined);
  const [tc, tcAction, tcPending] = useActionState(confirmTwoStep, undefined);
  const [ts, tsAction, tsPending] = useActionState(stopTwoStep, undefined);
  useEffect(() => { if (pw?.go) window.location.assign(pw.go); }, [pw]);
  return (
    <div className="flex flex-col gap-5">
      {(mustChange || notice === "first") && <Alert tone="warn" icon={<KeyRound size={16} />}><b>Welcome.</b> Choose your own password to continue. Use the temporary password you were given as the current password.</Alert>}
      {notice === "setup2fa" && !totpOn && <Alert tone="warn" icon={<ShieldCheck size={16} />}>Two-step sign-in is required. Set it up below to continue.</Alert>}
      {notice === "on" && <Alert tone="ok" icon={<CheckCircle2 size={16} />}>Two-step sign-in is on. From now on you&apos;ll enter a code from your app when you sign in.</Alert>}
      {notice === "others" && <Alert tone="ok" icon={<CheckCircle2 size={16} />}>Signed out on every other device.</Alert>}
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <Card title="Password" icon={<KeyRound size={17} />}>
          <form action={pwAction} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">{mustChange ? "Temporary password" : "Current password"}</span><input name="current" type="password" autoComplete="current-password" required className={input} /></label>
            <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">New password</span><input name="password" type="password" autoComplete="new-password" required minLength={10} className={input} /><span className="text-[11.5px] text-[#91919E]">At least 10 characters, with letters and a number.</span></label>
            <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">New password again</span><input name="confirm" type="password" autoComplete="new-password" required className={input} /></label>
            <Status s={pw} />
            <div><button disabled={pwPending} className={b("primary")}>{pwPending ? "Saving…" : "Change password"}</button></div>
          </form>
        </Card>
        <Card title="Two-step sign-in" icon={<Smartphone size={17} />}>
          {totpOn ? (
            <form action={tsAction} className="flex flex-col gap-3">
              <Alert tone="ok" icon={<ShieldCheck size={16} />}>On. Your account needs your password and a code from your phone.</Alert>
              {!required && (
                <>
                  <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">Password, to turn it off</span><input name="current" type="password" className={input} /></label>
                  <Status s={ts} />
                  <div><button disabled={tsPending} className={b("light")}>Turn off two-step sign-in</button></div>
                </>
              )}
            </form>
          ) : pendingSecret && qr ? (
            <form action={tcAction} className="flex flex-col gap-3">
              <ol className="list-decimal space-y-1 pl-5 text-[12.8px] text-[#45454D]">
                <li>Open Google Authenticator or Microsoft Authenticator on your phone.</li>
                <li>Tap <b>+</b> and scan this code.</li>
                <li>Type the 6-digit code it shows.</li>
              </ol>
              <div className="flex flex-wrap items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="QR code for the authenticator app" width={168} height={168} className="rounded-xl border border-[#EAEAEC]" />
                <div className="text-[12px] text-[#696976]">Can&apos;t scan? Enter this key:<div className="mt-1 select-all break-all font-mono text-[12.5px] text-[#131316]">{pendingSecret.match(/.{1,4}/g)?.join(" ")}</div></div>
              </div>
              <input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} placeholder="123456" className={cx(input, "max-w-45 text-center font-mono text-[18px] tracking-[0.3em]")} />
              <Status s={tc} />
              <div><button disabled={tcPending} className={b("primary")}>{tcPending ? "Checking…" : "Turn on"}</button></div>
            </form>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-[12.8px] text-[#696976]">Protect your account with a code from your phone, so a stolen password alone can&apos;t get in.</p>
              <form action={startTwoStep}><button className={b("primary")}><ShieldCheck size={15} /> Set up two-step sign-in</button></form>
            </div>
          )}
        </Card>
        <Card title="Profile" icon={<UserRound size={17} />}>
          <form action={nmAction} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5"><span className="text-[12.5px] font-bold">Name shown in the activity log</span><input name="name" defaultValue={name} className={input} /></label>
            <Status s={nm} />
            <div><button disabled={nmPending} className={b("light")}>Save</button></div>
          </form>
        </Card>
        <Card title="Devices" icon={<LogOut size={17} />}>
          <p className="text-[12.8px] text-[#696976]">Signed in on a shared or lost computer? Sign out everywhere except here.</p>
          <form action={signOutOthers} className="mt-3"><button className={b("light")}>Sign out other devices</button></form>
        </Card>
      </div>
    </div>
  );
}
