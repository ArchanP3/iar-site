"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertUser, hashPassword, isOwner, type Perm, type Role } from "@/lib/cms/auth";
import { one, q } from "@/lib/cms/db";
import { logActivity } from "@/lib/cms/activity";
import { canUndo, undoActivity } from "@/lib/cms/undo";
import type { FormState } from "../../actions";

const ROLES: Role[] = ["owner", "admin", "seo", "writer", "viewer"];
const OWNERS_ONLY = "Only a Super Admin can do that to a Super Admin account.";
const tempPassword = () => randomBytes(9).toString("base64url").replace(/[-_]/g, "x") + "7";

export async function inviteUser(_: FormState, fd: FormData): Promise<FormState> {
  const u = await assertUser("users");
  const name = String(fd.get("name") ?? "").trim().slice(0, 80);
  const email = String(fd.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const role = String(fd.get("role")) as Role;
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a name and a valid email." };
  if (!ROLES.includes(role)) return { error: "Choose a role." };
  if (role === "owner" && !isOwner(u.role)) return { error: "Only a Super Admin can add another Super Admin." };
  if (await one(`SELECT 1 FROM cms.cms_users WHERE email = $1`, [email])) return { error: "That email already has an account." };
  const pw = tempPassword();
  const row = await one<{ id: number }>(`INSERT INTO cms.cms_users (email, name, role, password_hash, must_change_password) VALUES ($1,$2,$3,$4,TRUE) RETURNING id`, [email, name, role, await hashPassword(pw)]);
  await logActivity(u, { action: `added a user (${role})`, target: email, kind: "user", ref: String(row!.id) });
  revalidatePath("/admin/users");
  return { ok: `${name} can now sign in at /admin with ${email} and the temporary password ${pw} — they choose their own password at first sign-in. Send it to them privately; it is shown only once.` };
}

async function owners(except: number) {
  return (await one<{ n: number }>(`SELECT count(*)::int AS n FROM cms.cms_users WHERE role = 'owner' AND NOT disabled AND id <> $1`, [except]))?.n ?? 0;
}

export async function updateUser(fd: FormData) {
  const u = await assertUser("users");
  const id = Number(fd.get("id"));
  const target = await one<{ id: number; email: string; role: Role; disabled: boolean }>(`SELECT id, email, role, disabled FROM cms.cms_users WHERE id = $1`, [id]);
  if (!target) return;
  if (target.role === "owner" && !isOwner(u.role)) redirect("/admin/users?msg=" + encodeURIComponent(OWNERS_ONLY));
  const op = String(fd.get("op"));
  if (op === "role") {
    const role = String(fd.get("role")) as Role;
    if (!ROLES.includes(role) || role === target.role) return;
    if (role === "owner" && !isOwner(u.role)) redirect("/admin/users?msg=" + encodeURIComponent("Only a Super Admin can make someone a Super Admin."));
    if (target.role === "owner" && !(await owners(id))) redirect("/admin/users?msg=" + encodeURIComponent("Keep at least one Super Admin."));
    await q(`UPDATE cms.cms_users SET role = $2 WHERE id = $1`, [id, role]);
    await logActivity(u, { action: `changed role to ${role} for`, target: target.email, kind: "user", ref: String(id) });
  } else if (op === "toggle") {
    if (id === u.id) redirect("/admin/users?msg=" + encodeURIComponent("You can't turn off your own account."));
    if (!target.disabled && target.role === "owner" && !(await owners(id))) redirect("/admin/users?msg=" + encodeURIComponent("Keep at least one Super Admin."));
    await q(`UPDATE cms.cms_users SET disabled = NOT disabled WHERE id = $1`, [id]);
    if (!target.disabled) await q(`DELETE FROM cms.cms_sessions WHERE user_id = $1`, [id]);
    await logActivity(u, { action: target.disabled ? "turned on the account of" : "turned off the account of", target: target.email, kind: "user", ref: String(id) });
  } else if (op === "reset2fa") {
    await q(`UPDATE cms.cms_users SET totp_on = FALSE, totp_secret = NULL WHERE id = $1`, [id]);
    await logActivity(u, { action: "reset two-step sign-in for", target: target.email, kind: "user", ref: String(id) });
  }
  revalidatePath("/admin/users");
}

export async function resetPassword(_: FormState, fd: FormData): Promise<FormState> {
  const u = await assertUser("users");
  const id = Number(fd.get("id"));
  const target = await one<{ email: string; name: string; role: Role }>(`SELECT email, name, role FROM cms.cms_users WHERE id = $1`, [id]);
  if (!target) return { error: "Not found." };
  if (target.role === "owner" && !isOwner(u.role)) return { error: OWNERS_ONLY };
  const pw = tempPassword();
  await q(`UPDATE cms.cms_users SET password_hash = $2, must_change_password = TRUE, failed_logins = 0, locked_until = NULL WHERE id = $1`, [id, await hashPassword(pw)]);
  await q(`DELETE FROM cms.cms_sessions WHERE user_id = $1`, [id]);
  await logActivity(u, { action: "reset the password of", target: target.email, kind: "user", ref: String(id) });
  return { ok: `New temporary password for ${target.name}: ${pw}` };
}

const PERM_FOR = { page_seo: "pages", redirect: "redirects", post: "blog", landing: "landing", media: "media", setting: "users" } as const;

/** Undo needs the same right as the change it reverses, and more where undo could do more:
    tracking code and the two-step rule are Owner-only, and putting a post back live needs the
    right to publish. */
function undoPerm(a: { kind: string; ref: string; before: unknown; after: unknown }): Perm {
  if (a.kind === "setting") return a.ref === "tracking" || a.ref === "security" ? "tracking" : "settings";
  const live = (v: unknown) => ["published", "scheduled"].includes((v as { status?: string } | null)?.status ?? "");
  if (a.kind === "post" && (!a.before || live(a.before) || live(a.after))) return "blog.publish";
  if (a.kind === "landing" && (a.before as { status?: string } | null)?.status === "published") return "landing";
  return PERM_FOR[a.kind as keyof typeof PERM_FOR] ?? "users";
}

export async function undo(fd: FormData) {
  await assertUser(); // signed in before anything is read
  const id = Number(fd.get("id"));
  const a = await one<{ kind: keyof typeof PERM_FOR; ref: string; before: unknown; after: unknown; undone: boolean; action: string }>(`SELECT kind, ref, before, after, undone, action FROM cms.cms_activity WHERE id = $1`, [id]);
  if (!a || !canUndo(a as never)) return;
  const u = await assertUser(undoPerm(a));
  let msg: string;
  try {
    msg = await undoActivity(id, u.name);
  } catch (e) {
    msg = (e as Error).message || "Couldn't undo that.";
  }
  revalidatePath("/admin/users");
  redirect("/admin/users?msg=" + encodeURIComponent(msg) + "#activity");
}
