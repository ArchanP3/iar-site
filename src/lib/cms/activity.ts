import "server-only";
import { q } from "./db";
import type { User } from "./auth";

/* Every change made in the CMS is written here with the value before and after,
   so it shows in Users & Activity and can be undone. */
export type Kind = "page_seo" | "redirect" | "setting" | "post" | "landing" | "media" | "user" | "lead" | "audit" | "product";

export async function logActivity(
  user: Pick<User, "name">,
  e: { action: string; target: string; kind: Kind; ref: string; before?: unknown; after?: unknown },
) {
  await q(
    `INSERT INTO cms.cms_activity (user_name, action, target, kind, ref, before, after) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [user.name, e.action, e.target, e.kind, e.ref, e.before === undefined ? null : JSON.stringify(e.before), e.after === undefined ? null : JSON.stringify(e.after)],
  );
}

/** Super Admin accounts are hidden from everyone else: their name and email in the activity
    list read "Super Admin" instead. */
export async function activityMask(role: User["role"]) {
  const hidden = role === "owner" ? [] : await q<{ name: string; email: string }>(`SELECT name, email FROM cms.cms_users WHERE role = 'owner'`);
  const names = new Set(hidden.map((h) => h.name));
  const emails = new Set(hidden.map((h) => h.email));
  return {
    who: (n: string) => (names.has(n) ? "Super Admin" : n),
    what: (t: string) => (emails.has(t) ? "a Super Admin account" : t),
  };
}
