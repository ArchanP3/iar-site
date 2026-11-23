import { cmsEnabled, one } from "@/lib/cms/db";

/* Files uploaded in the CMS Media Library: /media/<file name>.
   Cached for a year by browsers and the CDN (file names never change; renames keep the old name as an alias). */
export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  if (!cmsEnabled()) return new Response("Not found", { status: 404 });
  const name = decodeURIComponent((await params).file).toLowerCase();
  if (!/^[a-z0-9-]+\.(webp|gif|svg|pdf|jpe?g|png)$/.test(name)) return new Response("Not found", { status: 404 });
  const m = await one<{ filename: string; mime: string; data: Buffer }>(`SELECT filename, mime, data FROM cms.cms_media WHERE filename = $1`, [name]);
  if (!m) {
    const moved = await one<{ filename: string }>(`SELECT filename FROM cms.cms_media WHERE $1 = ANY(aliases)`, [name]);
    if (moved) return new Response(null, { status: 301, headers: { location: `/media/${moved.filename}` } });
    return new Response("Not found", { status: 404 });
  }
  return new Response(new Uint8Array(m.data), {
    headers: {
      "content-type": m.mime,
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
      ...(m.mime === "image/svg+xml" ? { "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'" } : {}),
    },
  });
}
