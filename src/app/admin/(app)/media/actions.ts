"use server";

import { updateTag } from "@/lib/cms/cache";
import { assertUser } from "@/lib/cms/auth";
import { one, q } from "@/lib/cms/db";
import { logActivity } from "@/lib/cms/activity";
import type { FormState } from "../../actions";

type Media = { id: number; filename: string; alt: string; caption: string; folder: string; aliases: string[] };

const MAX_BYTES = 15 * 1024 * 1024;
const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "image";

async function uniqueName(base: string, ext: string, ignoreId?: number): Promise<string> {
  for (let i = 0; i < 50; i++) {
    const name = `${base}${i ? `-${i + 1}` : ""}.${ext}`;
    const taken = await one(`SELECT 1 FROM cms.cms_media WHERE (filename = $1 OR $1 = ANY(aliases)) AND id <> $2`, [name, ignoreId ?? 0]);
    if (!taken) return name;
  }
  return `${base}-${Date.now()}.${ext}`;
}

/** Upload: resized to max 1600 px, converted to WebP (SVG and GIF kept as they are). */
export async function uploadMedia(_: FormState, fd: FormData): Promise<FormState> {
  const u = await assertUser("media");
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { error: "Choose one or more images." };
  const folder = String(fd.get("folder") ?? "General").trim().slice(0, 40) || "General";
  const sharp = (await import("sharp")).default;
  const done: string[] = [];
  for (const f of files.slice(0, 20)) {
    if (f.size > MAX_BYTES) return { error: `${f.name} is over 15 MB.` };
    const buf = Buffer.from(await f.arrayBuffer());
    let data = buf, mime = f.type, ext = (f.name.split(".").pop() ?? "").toLowerCase(), width: number | null = null, height: number | null = null;
    if (mime === "image/svg+xml") {
      const txt = buf.toString("utf8");
      if (/<script|on\w+=|javascript:/i.test(txt)) return { error: `${f.name}: SVG files with scripts are not allowed.` };
      ext = "svg";
    } else if (mime === "image/gif") {
      ext = "gif";
    } else if (/^image\/(jpeg|png|webp|avif|tiff)$/.test(mime)) {
      const img = sharp(buf, { failOn: "none" }).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true });
      const out = await img.webp({ quality: 80, effort: 4 }).toBuffer({ resolveWithObject: true });
      data = out.data; width = out.info.width; height = out.info.height; mime = "image/webp"; ext = "webp";
    } else if (mime === "application/pdf") {
      ext = "pdf";
    } else {
      return { error: `${f.name}: use JPG, PNG, WebP, GIF, SVG or PDF.` };
    }
    const name = await uniqueName(slugify(f.name), ext);
    await q(
      `INSERT INTO cms.cms_media (filename, mime, data, width, height, bytes, original_name, original_bytes, folder, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [name, mime, data, width, height, data.length, f.name.slice(0, 200), f.size, folder, u.name],
    );
    done.push(name);
  }
  await logActivity(u, { action: `uploaded ${done.length} file${done.length > 1 ? "s" : ""}`, target: done.join(", "), kind: "media", ref: "" });
  updateTag("cms:media");
  return { ok: `Uploaded ${done.length}. Add alt text to each image so Google understands it.` };
}

export async function saveMedia(_: FormState, fd: FormData): Promise<FormState> {
  const u = await assertUser("media");
  const id = Number(fd.get("id"));
  const before = await one<Media>(`SELECT id, filename, alt, caption, folder, aliases FROM cms.cms_media WHERE id = $1`, [id]);
  if (!before) return { error: "Not found." };
  const alt = String(fd.get("alt") ?? "").trim().slice(0, 250);
  const caption = String(fd.get("caption") ?? "").trim().slice(0, 400);
  const folder = String(fd.get("folder") ?? before.folder).trim().slice(0, 40) || "General";
  const ext = before.filename.split(".").pop()!;
  const want = slugify(String(fd.get("filename") ?? before.filename));
  let filename = before.filename;
  let aliases = before.aliases;
  if (`${want}.${ext}` !== before.filename) {
    filename = await uniqueName(want, ext, id);
    aliases = [...new Set([...before.aliases, before.filename])]; // old link keeps working
  }
  const after = await one<Media>(`UPDATE cms.cms_media SET alt=$2, caption=$3, folder=$4, filename=$5, aliases=$6 WHERE id=$1 RETURNING id, filename, alt, caption, folder, aliases`, [id, alt, caption, folder, filename, aliases]);
  await logActivity(u, { action: "updated image", target: filename, kind: "media", ref: String(id), before, after });
  updateTag("cms:media");
  return { ok: filename !== before.filename ? `Saved. Renamed to ${filename}; the old link redirects automatically.` : "Saved." };
}

export async function deleteMedia(id: number) {
  const u = await assertUser("media");
  const m = await one<Media>(`SELECT id, filename, alt, caption, folder, aliases FROM cms.cms_media WHERE id = $1`, [id]);
  if (!m) return;
  await q(`DELETE FROM cms.cms_media WHERE id = $1`, [id]);
  await logActivity(u, { action: "deleted image", target: m.filename, kind: "media", ref: String(id), before: m, after: null });
  updateTag("cms:media");
}
