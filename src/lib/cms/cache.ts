import "server-only";
import { revalidateTag as nextRevalidateTag, updateTag as nextUpdateTag } from "next/cache";
import { after } from "next/server";
import { PARTNER_URL } from "@/lib/site";

/* ------------------------------------------------------------------ */
/*  Cache refresh for CMS changes, on both country sites.               */
/*  .ca and .com are separate deployments with separate caches but one  */
/*  database. The CMS runs on one of them, so after each change the     */
/*  same cache tags are also refreshed on the other site through its    */
/*  /api/revalidate (needs the same REVALIDATE_SECRET on both).         */
/*  Use these instead of the next/cache versions anywhere CMS content   */
/*  changes. Before the .ca split there is no partner and they behave   */
/*  exactly like next/cache.                                            */
/* ------------------------------------------------------------------ */

/** Same as next/cache updateTag (Server Actions only), plus the other country site. */
export function updateTag(tag: string) {
  nextUpdateTag(tag);
  tellPartner(tag);
}

/** Same as next/cache revalidateTag, plus the other country site. */
export function revalidateTag(tag: string, profile: string | { expire?: number }) {
  nextRevalidateTag(tag, profile);
  tellPartner(tag);
}

const pending = new Set<string>();
let scheduled = false;

function tellPartner(tag: string) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!PARTNER_URL || !secret) return;
  pending.add(tag);
  if (scheduled) return; // one call, sent after the response with every tag collected
  scheduled = true;
  try {
    after(() => send(secret));
  } catch {
    scheduled = false; // outside a request: nothing to wait for, send now
    void send(secret);
  }
}

async function send(secret: string) {
  const tags = [...pending];
  pending.clear();
  scheduled = false;
  if (!tags.length) return;
  try {
    const res = await fetch(`${PARTNER_URL}/api/revalidate`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-revalidate-secret": secret },
      body: JSON.stringify({ tags }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error(`[cms] other site refresh failed: ${res.status}`, tags);
  } catch (e) {
    console.error("[cms] other site refresh failed", tags, e);
  }
}
