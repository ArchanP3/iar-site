"use server";

import { updateTag } from "@/lib/cms/cache";
import { assertUser } from "@/lib/cms/auth";
import { logActivity } from "@/lib/cms/activity";
import { readSetting, writeSetting } from "@/lib/cms/settings";
import type { FormState } from "../../actions";

export async function saveSiteSchema(_: FormState, fd: FormData): Promise<FormState> {
  const u = await assertUser("schema");
  const site = String(fd.get("site") ?? "").trim().slice(0, 30_000);
  if (site) {
    try {
      const v = JSON.parse(site);
      if (typeof v !== "object" || !v) throw new Error();
    } catch {
      return { error: "Not valid JSON. Fix it or clear the box." };
    }
  }
  const before = await readSetting("schema");
  await writeSetting("schema", { site }, u.name);
  await logActivity(u, { action: site ? "updated site-wide schema" : "removed site-wide schema", target: "All pages", kind: "setting", ref: "schema", before, after: { site } });
  updateTag("cms:settings");
  return { ok: "Saved. Added to every page of the website." };
}
