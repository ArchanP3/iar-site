"use client";

import { useActionState, useState } from "react";
import { ChevronRight, Eye, EyeOff, KeyRound, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { createOwner, signIn, verifyTwoStep, type FormState } from "@/app/admin/actions";

const box = "w-full max-w-105 rounded-[22px] border border-[#EAEAEC] bg-white p-7 shadow-[0_40px_80px_-40px_rgba(19,19,22,0.35)] sm:p-8.5";
const field = "flex h-11 items-center gap-2 rounded-[10px] border border-[#E2E2E6] bg-white px-3 focus-within:border-[#C8102E] focus-within:ring-4 focus-within:ring-[#C8102E]/12";
const inp = "h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#91919E]";
const submit = "mt-5 flex h-11 w-full items-center justify-center gap-1.5 rounded-[10px] bg-linear-to-br from-[#C8102E] to-[#DA0B2A] text-[14px] font-semibold text-white shadow-[0_12px_26px_-14px_rgba(200,16,46,0.9)] disabled:opacity-60";

function Err({ s }: { s: FormState }) {
  if (!s?.error) return null;
  return <p role="alert" className="mt-4 rounded-xl border border-[#FECDCA] bg-[#FEF3F2] px-3.5 py-2.5 text-[12.8px] text-[#912018]">{s.error}</p>;
}

function Password({ name = "password", label = "Password", auto = "current-password" }: { name?: string; label?: string; auto?: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="mt-3.5 block">
      <span className="mb-1.5 block text-[12.5px] font-bold">{label}</span>
      <span className={field}>
        <Lock size={16} className="text-[#91919E]" />
        <input name={name} type={show ? "text" : "password"} required autoComplete={auto} className={inp} />
        <button type="button" onClick={() => setShow(!show)} className="text-[#91919E]" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
      </span>
    </label>
  );
}

export function LoginForm({ enabled, problem }: { enabled: boolean; problem?: string | null }) {
  const [state, action, pending] = useActionState(signIn, undefined);
  return (
    <form action={action} className={box}>
      <h2 className="text-[22px] font-extrabold">Sign in</h2>
      <p className="mt-1.5 text-[#696976]">Use your IAR team account.</p>
      {!enabled && <p className="mt-4 rounded-xl border border-[#FEDF89] bg-[#FFFAEB] px-3.5 py-2.5 text-[12.8px] text-[#93370D]">{problem ?? "The CMS database is not connected yet. Add DATABASE_URL on the server to turn the CMS on."}</p>}
      <label className="mt-5 block">
        <span className="mb-1.5 block text-[12.5px] font-bold">Email</span>
        <span className={field}><Mail size={16} className="text-[#91919E]" /><input name="email" type="email" required autoComplete="username" className={inp} /></span>
      </label>
      <Password />
      <label className="mt-3.5 flex items-center gap-2 text-[12.5px]"><input type="checkbox" name="remember" defaultChecked className="h-4 w-4 accent-[#C8102E]" /> Keep me signed in on this device</label>
      <Err s={state} />
      <button disabled={pending || !enabled} className={submit}>{pending ? "Signing in…" : <>Sign in <ChevronRight size={16} /></>}</button>
      <p className="mt-4 text-center text-[12px] text-[#91919E]">Forgot your password? Ask a Super Admin or Admin to reset it.</p>
    </form>
  );
}

export function TwoStepForm({ remember }: { remember: boolean }) {
  const [state, action, pending] = useActionState(verifyTwoStep, undefined);
  return (
    <form action={action} className={box}>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBE7EA] text-[#C8102E]"><ShieldCheck size={22} /></div>
      <h2 className="mt-4 text-[22px] font-extrabold">Two-step sign-in</h2>
      <p className="mt-1.5 text-[#696976]">Open your authenticator app and enter the 6-digit code for IAR CMS.</p>
      <input type="hidden" name="remember" value={remember ? "1" : ""} />
      <label className="mt-5 block">
        <span className={field}><KeyRound size={16} className="text-[#91919E]" /><input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} required autoFocus className={`${inp} tracking-[0.4em]`} placeholder="123456" /></span>
      </label>
      <Err s={state} />
      <button disabled={pending} className={submit}>{pending ? "Checking…" : "Continue"}</button>
    </form>
  );
}

export function SetupForm() {
  const [state, action, pending] = useActionState(createOwner, undefined);
  return (
    <form action={action} className={box}>
      <h2 className="text-[22px] font-extrabold">Create the Super Admin account</h2>
      <p className="mt-1.5 text-[#696976]">This is done once. The Super Admin can then add the rest of the team.</p>
      <label className="mt-5 block">
        <span className="mb-1.5 block text-[12.5px] font-bold">Setup code</span>
        <span className={field}><KeyRound size={16} className="text-[#91919E]" /><input name="code" required autoComplete="off" className={inp} placeholder="CMS_SETUP_CODE from the server settings" /></span>
      </label>
      <label className="mt-3.5 block">
        <span className="mb-1.5 block text-[12.5px] font-bold">Your name</span>
        <span className={field}><User size={16} className="text-[#91919E]" /><input name="name" required autoComplete="name" className={inp} /></span>
      </label>
      <label className="mt-3.5 block">
        <span className="mb-1.5 block text-[12.5px] font-bold">Email</span>
        <span className={field}><Mail size={16} className="text-[#91919E]" /><input name="email" type="email" required autoComplete="username" className={inp} /></span>
      </label>
      <Password label="Password (10+ characters, with a number)" auto="new-password" />
      <Err s={state} />
      <button disabled={pending} className={submit}>{pending ? "Creating…" : "Create Super Admin account"}</button>
    </form>
  );
}
