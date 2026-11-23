"use server";

import { updateTag } from "@/lib/cms/cache";
import { assertUser } from "@/lib/cms/auth";
import { logActivity } from "@/lib/cms/activity";
import { readSetting, writeSetting } from "@/lib/cms/settings";
import type { FormState } from "../../actions";

export async function saveGoogle(_: FormState, fd: FormData): Promise<FormState> {
  const u = await assertUser("performance");
  const gscSite = String(fd.get("gscSite") ?? "").trim().slice(0, 200);
  const ga4Property = String(fd.get("ga4Property") ?? "").trim().replace(/^properties\//, "").slice(0, 40);
  if (gscSite && !/^(sc-domain:[a-z0-9.-]+|https?:\/\/[^\s]+\/)$/.test(gscSite)) return { error: "Search Console property is sc-domain:automiqautomation.com or a full URL ending with /." };
  if (ga4Property && !/^\d{6,12}$/.test(ga4Property)) return { error: "GA4 Property ID is numbers only (Admin → Property details). It is not the G-… Measurement ID." };
  const before = await readSetting("google");
  await writeSetting("google", { gscSite, ga4Property }, u.name);
  await logActivity(u, { action: "connected Google data", target: [gscSite, ga4Property].filter(Boolean).join(" · ") || "disconnected", kind: "setting", ref: "google", before, after: { gscSite, ga4Property } });
  updateTag("cms:settings");
  updateTag("cms:google");
  return { ok: "Saved. Data loads within a minute." };
}

export async function refreshGoogle() {
  await assertUser("performance");
  updateTag("cms:google");
}
