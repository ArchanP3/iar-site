"use server";

import { redirect } from "next/navigation";
import { cmsEnabled, one, q } from "@/lib/cms/db";
import {
  burnPasswordCheck, checkPassword, checkTotp, clientKey, endSession, hashPassword, passwordProblem, pendingTwoFactorUser, promoteSession,
  hitsNow, sameSecret, startSession, underLimit,
} from "@/lib/cms/auth";
import { readSetting } from "@/lib/cms/settings";
import { logActivity } from "@/lib/cms/activity";

export type FormState = { error?: string; ok?: string; go?: string } | undefined;

/* Only failed sign-ins count. An account locks for 15 minutes after 5 failures from the same
   network, so a stranger elsewhere can't lock the owner out; a network that fails 20 times
   is blocked for every account. */
const LOCK_AFTER = 5;
const NET_LIMIT = 20;
const WRONG = "Email or password is not right, or the account is locked for a few minutes.";
const BUSY = "Too many attempts from your network. Try again in 15 minutes.";

export async function signIn(_: FormState, fd: FormData): Promise<FormState> {
  if (!cmsEnabled()) return { error: "The CMS database is not connected yet." };
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const remember = fd.get("remember") === "on";
  const ip = await clientKey();
  if ((await hitsNow(`login:ip:${ip}`)) >= NET_LIMIT) return { error: BUSY };
  const u = await one<{ id: number; password_hash: string; totp_on: boolean; disabled: boolean; locked_until: Date | null; failed_logins: number; name: string }>(
    `SELECT id, password_hash, totp_on, disabled, locked_until, failed_logins, name FROM cms.cms_users WHERE email = $1`,
    [email],
  );
  // Same message and the same password work whether or not the account exists or is locked.
  if (!u) {
    await burnPasswordCheck(password);
    await underLimit(`login:ip:${ip}`, NET_LIMIT);
    return { error: WRONG };
  }
  const ok = await checkPassword(password, u.password_hash);
  const acct = `login:acct:${u.id}:${ip}`;
  if ((await hitsNow(acct)) >= LOCK_AFTER) return { error: WRONG };
  if (u.disabled || !ok) {
    await underLimit(acct, LOCK_AFTER);
    await underLimit(`login:ip:${ip}`, NET_LIMIT);
    return { error: WRONG };
  }
  await startSession(u.id, remember, u.totp_on);
  if (u.totp_on) redirect(`/admin/two-step${remember ? "?r=1" : ""}`);
  const sec = await readSetting("security");
  redirect(sec.require2fa ? "/admin/account?setup2fa=1" : "/admin");
}

export async function verifyTwoStep(_: FormState, fd: FormData): Promise<FormState> {
  const userId = await pendingTwoFactorUser();
  if (!userId) redirect("/admin/login");
  // 5 wrong codes per account per 15 minutes, then the sign-in has to start again later.
  if (!(await underLimit(`2fa:${userId}`, 5))) {
    await endSession();
    return { error: "Too many wrong codes. Wait 15 minutes, then sign in again." };
  }
  const u = await one<{ totp_secret: string; totp_last_step: string | null }>(`SELECT totp_secret, totp_last_step FROM cms.cms_users WHERE id = $1`, [userId]);
  const step = u?.totp_secret ? checkTotp(u.totp_secret, String(fd.get("code") ?? ""), u.totp_last_step === null ? null : Number(u.totp_last_step)) : null;
  if (step === null) return { error: "That code didn't work. Check your app and try again." };
  // Each code works once.
  await q(`UPDATE cms.cms_users SET totp_last_step = $2 WHERE id = $1`, [userId, step]);
  await promoteSession(fd.get("remember") === "1");
  redirect("/admin");
}

export async function signOut() {
  await endSession();
  redirect("/admin/login");
}

/* First owner account. Only works while there are no users, and needs CMS_SETUP_CODE. */
export async function createOwner(_: FormState, fd: FormData): Promise<FormState> {
  if (!cmsEnabled()) return { error: "The CMS database is not connected yet." };
  const code = process.env.CMS_SETUP_CODE;
  if (!code) return { error: "CMS_SETUP_CODE is not set on the server." };
  if (!(await underLimit(`setup:${await clientKey()}`, 5, 60))) return { error: "Too many attempts. Try again in an hour." };
  if (!sameSecret(String(fd.get("code") ?? ""), code)) return { error: "The setup code is not right." };
  const count = await one<{ n: number }>(`SELECT count(*)::int AS n FROM cms.cms_users`);
  if ((count?.n ?? 0) > 0) return { error: "The Super Admin account already exists. Please sign in." };
  const name = String(fd.get("name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter your name and a valid email." };
  const bad = passwordProblem(password);
  if (bad) return { error: bad };
  const row = await one<{ id: number }>(`INSERT INTO cms.cms_users (email, name, role, password_hash) VALUES ($1,$2,'owner',$3) RETURNING id`, [email, name, await hashPassword(password)]);
  await logActivity({ name }, { action: "created the Super Admin account", target: email, kind: "user", ref: String(row!.id) });
  await startSession(row!.id, true, false);
  redirect("/admin?welcome=1");
}
