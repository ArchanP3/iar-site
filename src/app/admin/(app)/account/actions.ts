"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, checkTotp, currentUser, endOtherSessions, hashPassword, newTotpSecret, passwordProblem, underLimit } from "@/lib/cms/auth";
import { one, q } from "@/lib/cms/db";
import { readSetting } from "@/lib/cms/settings";
import { logActivity } from "@/lib/cms/activity";
import type { FormState } from "../../actions";

async function me() {
  const u = await currentUser();
  if (!u) redirect("/admin/login");
  return u;
}

const TOO_MANY = "Too many attempts. Wait 15 minutes and try again.";

export async function changePassword(_: FormState, fd: FormData): Promise<FormState> {
  const u = await me();
  if (!(await underLimit(`pw:${u.id}`, 10))) return { error: TOO_MANY };
  const row = await one<{ password_hash: string }>(`SELECT password_hash FROM cms.cms_users WHERE id = $1`, [u.id]);
  if (!row || !(await checkPassword(String(fd.get("current") ?? ""), row.password_hash))) return { error: "Your current password is not right." };
  const pw = String(fd.get("password") ?? "");
  if (pw !== String(fd.get("confirm") ?? "")) return { error: "The two new passwords don't match." };
  const bad = passwordProblem(pw);
  if (bad) return { error: bad };
  if (await checkPassword(pw, row.password_hash)) return { error: "Choose a password different from the current one." };
  await q(`UPDATE cms.cms_users SET password_hash = $2, must_change_password = FALSE WHERE id = $1`, [u.id, await hashPassword(pw)]);
  await endOtherSessions(u.id); // anyone signed in with the old password is signed out
  await logActivity(u, { action: "changed their password", target: u.email, kind: "user", ref: String(u.id) });
  if (u.mustChange) {
    const sec = await readSetting("security");
    // A full page load afterwards, so every screen sees the new password state.
    return { ok: "Password saved.", go: sec.require2fa && !u.totpOn ? "/admin/account?setup2fa=1" : "/admin" } as FormState;
  }
  return { ok: "Password changed." };
}

export async function saveName(_: FormState, fd: FormData): Promise<FormState> {
  const u = await me();
  const name = String(fd.get("name") ?? "").trim().slice(0, 80);
  if (!name) return { error: "Enter your name." };
  await q(`UPDATE cms.cms_users SET name = $2 WHERE id = $1`, [u.id, name]);
  revalidatePath("/admin", "layout");
  return { ok: "Saved." };
}

export async function startTwoStep() {
  const u = await me();
  if (u.totpOn) return;
  await q(`UPDATE cms.cms_users SET totp_secret = $2 WHERE id = $1 AND NOT totp_on`, [u.id, newTotpSecret()]);
  revalidatePath("/admin/account");
}

export async function confirmTwoStep(_: FormState, fd: FormData): Promise<FormState> {
  const u = await me();
  const row = await one<{ totp_secret: string | null }>(`SELECT totp_secret FROM cms.cms_users WHERE id = $1`, [u.id]);
  if (!row?.totp_secret) return { error: "Start again." };
  if (!(await underLimit(`2fa:${u.id}`, 5))) return { error: TOO_MANY };
  const step = checkTotp(row.totp_secret, String(fd.get("code") ?? ""));
  if (step === null) return { error: "That code didn't work. Codes change every 30 seconds; enter the current one." };
  await q(`UPDATE cms.cms_users SET totp_on = TRUE, totp_last_step = $2 WHERE id = $1`, [u.id, step]);
  await logActivity(u, { action: "turned on two-step sign-in", target: u.email, kind: "user", ref: String(u.id) });
  redirect("/admin/account?twostep=on");
}

export async function stopTwoStep(_: FormState, fd: FormData): Promise<FormState> {
  const u = await me();
  if ((await readSetting("security")).require2fa) return { error: "Two-step sign-in is required for everyone on this CMS." };
  if (!(await underLimit(`pw:${u.id}`, 10))) return { error: TOO_MANY };
  const row = await one<{ password_hash: string }>(`SELECT password_hash FROM cms.cms_users WHERE id = $1`, [u.id]);
  if (!row || !(await checkPassword(String(fd.get("current") ?? ""), row.password_hash))) return { error: "Your password is not right." };
  await q(`UPDATE cms.cms_users SET totp_on = FALSE, totp_secret = NULL, totp_last_step = NULL WHERE id = $1`, [u.id]);
  await logActivity(u, { action: "turned off two-step sign-in", target: u.email, kind: "user", ref: String(u.id) });
  redirect("/admin/account");
}

export async function signOutOthers() {
  const u = await me();
  await endOtherSessions(u.id);
  redirect("/admin/account?others=1");
}
