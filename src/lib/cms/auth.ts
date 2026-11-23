import "server-only";
import { createHash, createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cmsEnabled, one, q } from "./db";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;

/* ------------------------------------------------------------------ */
/*  Roles and what each one can do                                     */
/* ------------------------------------------------------------------ */
export type Role = "owner" | "admin" | "seo" | "writer" | "viewer";
export const roleLabel: Record<Role, string> = { owner: "Super Admin", admin: "Admin", seo: "SEO Editor", writer: "Writer", viewer: "Viewer" };

export type Perm =
  | "dashboard" | "pages" | "blog" | "blog.publish" | "landing" | "parts" | "media" | "audit" | "redirects" | "schema" | "sitemaps"
  | "locations" | "performance" | "leads" | "tracking" | "backup" | "settings" | "users" | "activity" | "checklist";

/* "backup" (lists every account) is Super Admin-only too.
   "tracking" (site-wide scripts, page scripts) stays Owner-only: a script saved there runs in
   every visitor's browser, including the Owner's, so it could act as the Owner.
   Admins have everything else, including users, but never see or touch Super Admin (owner)
   accounts (see isOwner). */
const PERMS: Record<Role, Perm[] | "all"> = {
  owner: "all",
  admin: ["dashboard", "pages", "blog", "blog.publish", "landing", "parts", "media", "audit", "redirects", "schema", "sitemaps", "locations", "performance", "leads", "settings", "users", "activity", "checklist"],
  seo: ["dashboard", "pages", "blog", "blog.publish", "landing", "parts", "media", "audit", "redirects", "schema", "sitemaps", "locations", "performance", "settings", "activity"],
  writer: ["dashboard", "blog", "media"],
  viewer: ["dashboard", "performance"],
};

export function can(role: Role, perm: Perm): boolean {
  const p = PERMS[role];
  return p === "all" || (p?.includes(perm) ?? false);
}

/** Only a Super Admin (role "owner") may see, create, change, reset or turn off a Super Admin
    account, or make someone Super Admin. */
export const isOwner = (role: Role) => role === "owner";

export type User = { id: number; email: string; name: string; role: Role; totpOn: boolean; mustChange: boolean };

/* ------------------------------------------------------------------ */
/*  Passwords                                                           */
/* ------------------------------------------------------------------ */
export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(pw, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function checkPassword(pw: string, stored: string): Promise<boolean> {
  const [kind, s, h] = stored.split("$");
  if (kind !== "scrypt" || !s || !h) return false;
  const key = await scrypt(pw, Buffer.from(s, "base64"), 64, { N: 16384, r: 8, p: 1 });
  const want = Buffer.from(h, "base64");
  return want.length === key.length && timingSafeEqual(want, key);
}

/** Same work as a real check, so a missing account takes as long as a wrong password. */
const DUMMY_HASH = "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$" + "A".repeat(86) + "==";
export const burnPasswordCheck = (pw: string) => checkPassword(pw, DUMMY_HASH);

export function passwordProblem(pw: string): string | null {
  if (pw.length < 10) return "Use at least 10 characters.";
  if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) return "Use letters and at least one number.";
  return null;
}

/* ------------------------------------------------------------------ */
/*  Sessions: random token in an httpOnly cookie, SHA-256 of it in DB  */
/* ------------------------------------------------------------------ */
const COOKIE = "aq_cms";
const sha = (t: string) => createHash("sha256").update(t).digest("hex");

export async function startSession(userId: number, remember: boolean, pending2fa: boolean) {
  const token = randomBytes(32).toString("base64url");
  const hours = pending2fa ? 0.25 : remember ? 24 * 30 : 12;
  await q(`INSERT INTO cms.cms_sessions (id, user_id, pending_2fa, expires_at) VALUES ($1,$2,$3, now() + ($4 || ' hours')::interval)`, [sha(token), userId, pending2fa, String(hours)]);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember && !pending2fa ? { maxAge: hours * 3600 } : {}),
  });
}

export async function endSession() {
  const jar = await cookies();
  const t = jar.get(COOKIE)?.value;
  if (t) await q(`DELETE FROM cms.cms_sessions WHERE id = $1`, [sha(t)]).catch(() => {});
  jar.delete(COOKIE);
}

type SessionRow = { user_id: number; pending_2fa: boolean; email: string; name: string; role: Role; totp_on: boolean; must_change_password: boolean; disabled: boolean };

async function readSession(): Promise<SessionRow | null> {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t || !cmsEnabled()) return null;
  const row = await one<SessionRow>(
    `SELECT s.user_id, s.pending_2fa, u.email, u.name, u.role, u.totp_on, u.must_change_password, u.disabled
       FROM cms.cms_sessions s JOIN cms.cms_users u ON u.id = s.user_id
      WHERE s.id = $1 AND s.expires_at > now()`,
    [sha(t)],
  ).catch(() => null); // database unreachable: treat as signed out; the sign-in page explains
  if (!row || row.disabled) return null;
  return row;
}

export async function pendingTwoFactorUser(): Promise<number | null> {
  const s = await readSession();
  return s?.pending_2fa ? s.user_id : null;
}

export async function promoteSession(remember: boolean) {
  const t = (await cookies()).get(COOKIE)?.value;
  const s = await readSession();
  if (!t || !s) return;
  await q(`DELETE FROM cms.cms_sessions WHERE id = $1`, [sha(t)]);
  await startSession(s.user_id, remember, false);
}

/** The signed-in user, or null. Never cached: reads the request cookie. */
export async function currentUser(): Promise<User | null> {
  const s = await readSession();
  if (!s || s.pending_2fa) return null;
  q(`UPDATE cms.cms_users SET last_active = now() WHERE id = $1 AND (last_active IS NULL OR last_active < now() - interval '2 minutes')`, [s.user_id]).catch(() => {});
  return { id: s.user_id, email: s.email, name: s.name, role: s.role, totpOn: s.totp_on, mustChange: s.must_change_password };
}

/** For admin pages: sends visitors without access to the sign-in page. */
export async function requireUser(perm?: Perm): Promise<User> {
  const u = await currentUser();
  if (!u) redirect("/admin/login");
  if (u.mustChange) redirect("/admin/account?first=1");
  if (!u.totpOn) {
    const sec = await one<{ value: { require2fa?: boolean } }>(`SELECT value FROM cms.cms_settings WHERE key = 'security'`).catch(() => null);
    if (sec?.value?.require2fa) redirect("/admin/account?setup2fa=1");
  }
  if (perm && !can(u.role, perm)) redirect("/admin?denied=1");
  return u;
}

async function twoStepRequired(): Promise<boolean> {
  const sec = await one<{ value: { require2fa?: boolean } }>(`SELECT value FROM cms.cms_settings WHERE key = 'security'`).catch(() => null);
  return Boolean(sec?.value?.require2fa);
}

/** For server actions and downloads: throws instead of redirecting. Applies the same
    rules as the pages (password change first, two-step sign-in when required). */
export async function assertUser(perm?: Perm): Promise<User> {
  const u = await currentUser();
  if (!u) throw new Error("Please sign in again.");
  if (u.mustChange) throw new Error("Change your password first (My Account).");
  if (!u.totpOn && (await twoStepRequired())) throw new Error("Turn on two-step sign-in first (My Account).");
  if (perm && !can(u.role, perm)) throw new Error("Your role can't do this.");
  return u;
}

/* ------------------------------------------------------------------ */
/*  Attempt limits, shared by every Postgres-backed server instance     */
/* ------------------------------------------------------------------ */

/** Hashed visitor IP (never stored in plain form). */
export async function clientKey(): Promise<string> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return createHash("sha256").update(`automiq-cms:${ip}`).digest("hex").slice(0, 32);
}

/** Counts one attempt for `key`; false once there were more than `limit` in the current window. */
export async function underLimit(key: string, limit: number, windowMinutes = 15): Promise<boolean> {
  const row = await one<{ hits: number }>(
    `INSERT INTO cms.cms_rate (key, window_start) VALUES ($1, date_bin(($2 || ' minutes')::interval, now(), timestamptz '2000-01-01'))
     ON CONFLICT (key, window_start) DO UPDATE SET hits = cms.cms_rate.hits + 1 RETURNING hits`,
    [key.slice(0, 120), String(windowMinutes)],
  );
  return (row?.hits ?? 0) <= limit;
}

/** Attempts already counted for `key` in the current window (does not count one). */
export async function hitsNow(key: string, windowMinutes = 15): Promise<number> {
  const row = await one<{ hits: number }>(
    `SELECT hits FROM cms.cms_rate WHERE key = $1 AND window_start = date_bin(($2 || ' minutes')::interval, now(), timestamptz '2000-01-01')`,
    [key.slice(0, 120), String(windowMinutes)],
  );
  return row?.hits ?? 0;
}

/** Constant-time comparison for secrets (setup code, cron secret). */
export function sameSecret(a: string, b: string): boolean {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y) && a.length === b.length;
}

/* ------------------------------------------------------------------ */
/*  Two-step sign-in with an authenticator app (TOTP, RFC 6238)         */
/* ------------------------------------------------------------------ */
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function newTotpSecret(): string {
  const bytes = randomBytes(20);
  let bits = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) out += B32[parseInt(bits.slice(i, i + 5), 2)];
  return out;
}

function b32decode(s: string): Buffer {
  let bits = "";
  for (const ch of s.replace(/=+$/, "").toUpperCase()) {
    const v = B32.indexOf(ch);
    if (v >= 0) bits += v.toString(2).padStart(5, "0");
  }
  const out: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(out);
}

function totpAt(secret: string, step: number): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(step));
  const h = createHmac("sha1", b32decode(secret)).update(buf).digest();
  const o = h[h.length - 1] & 15;
  const n = ((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1_000_000).padStart(6, "0");
}

/** The time step the code belongs to, or null. A step at or before `usedStep` is refused (no reuse). */
export function checkTotp(secret: string, code: string, usedStep: number | null = null): number | null {
  const c = code.replace(/\D/g, "");
  if (c.length !== 6) return null;
  const step = Math.floor(Date.now() / 30_000);
  for (const d of [-1, 0, 1]) {
    const want = Buffer.from(totpAt(secret, step + d));
    const got = Buffer.from(c);
    if (want.length === got.length && timingSafeEqual(want, got)) return usedStep !== null && step + d <= usedStep ? null : step + d;
  }
  return null;
}

export const totpUri = (secret: string, email: string) =>
  `otpauth://totp/${encodeURIComponent(`AutomIQ CMS:${email}`)}?secret=${secret}&issuer=${encodeURIComponent("AutomIQ CMS")}&digits=6&period=30`;

/** Signs this person out everywhere except this browser. */
export async function endOtherSessions(userId: number) {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return;
  await q(`DELETE FROM cms.cms_sessions WHERE user_id = $1 AND id <> $2`, [userId, sha(t)]);
}
