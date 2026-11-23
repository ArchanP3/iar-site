"use client";

import { useActionState } from "react";
import { CheckCircle2, KeyRound, TriangleAlert, UserPlus } from "lucide-react";
import { inviteUser, resetPassword } from "@/app/admin/(app)/users/actions";
import { Alert, Card, b, input } from "./ui";

export function InviteForm({ canOwner }: { canOwner: boolean }) {
  const [state, action, pending] = useActionState(inviteUser, undefined);
  return (
    <Card title="Add a person" icon={<UserPlus size={17} />}>
      <form action={action} className="flex flex-col gap-3">
        <input name="name" placeholder="Full name" required className={input} />
        <input name="email" type="email" placeholder="Work email" required className={input} />
        <select name="role" defaultValue="seo" className={input}><option value="seo">SEO Editor</option><option value="writer">Writer</option><option value="viewer">Viewer</option><option value="admin">Admin</option>{canOwner && <option value="owner">Super Admin</option>}</select>
        {state?.error && <Alert tone="bad" icon={<TriangleAlert size={16} />}>{state.error}</Alert>}
        {state?.ok && <Alert tone="ok" icon={<CheckCircle2 size={16} />}><span className="select-all">{state.ok}</span></Alert>}
        <div><button disabled={pending} className={b("primary")}>{pending ? "Adding…" : "Add person"}</button></div>
      </form>
    </Card>
  );
}

export function ResetPasswordButton({ id }: { id: number }) {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  return (
    <form action={action} onSubmit={(e) => { if (!confirm("Give this person a new temporary password? They will be signed out.")) e.preventDefault(); }} className="flex items-center gap-1.5">
      <input type="hidden" name="id" value={id} />
      {state?.ok ? <code className="select-all rounded bg-[#E7F8EF] px-1.5 py-1 text-[11.5px] text-[#067647]">{state.ok.split(": ").pop()}</code> : <button disabled={pending} className={b("light", true)}><KeyRound size={13} /> Reset password</button>}
    </form>
  );
}
