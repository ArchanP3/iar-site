import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

/* Refreshes cached pages on this site. Needs REVALIDATE_SECRET set in Vercel (same value on
   the .ca and .com projects) and in your .env.local.
     - The importer calls it with no body after a database import: part pages show new prices.
     - The CMS on the other country site sends { tags: [...] } after each change (src/lib/cms/cache.ts). */
const ALLOWED = /^(parts|catalog|cms:[\w:/.\-]{1,200})$/;

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const asked = Array.isArray(body?.tags) ? body.tags.filter((t): t is string => typeof t === "string" && ALLOWED.test(t)).slice(0, 50) : [];
  if (!asked.length) {
    revalidateTag("parts", "max");
    return NextResponse.json({ ok: true, tags: ["parts"] });
  }
  // CMS edits: show the change on the next visit, like updateTag does on the site that made it.
  for (const t of asked) revalidateTag(t, { expire: 0 });
  return NextResponse.json({ ok: true, tags: asked });
}
