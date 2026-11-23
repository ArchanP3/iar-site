"use server";

import { updateTag } from "@/lib/cms/cache";
import { assertUser } from "@/lib/cms/auth";
import { logActivity } from "@/lib/cms/activity";
import { readSetting, writeSetting, type Tracking } from "@/lib/cms/settings";
import type { FormState } from "../../actions";

const v = (fd: FormData, k: string, max = 300) => String(fd.get(k) ?? "").trim().slice(0, max);

export async function saveTracking(_: FormState, fd: FormData): Promise<FormState> {
  const u = await assertUser("tracking");
  const t: Tracking = {
    gtm: v(fd, "gtm").toUpperCase(), ga4: v(fd, "ga4").toUpperCase(), gscVerification: v(fd, "gscVerification"), gscVerificationCa: v(fd, "gscVerificationCa"), bingVerification: v(fd, "bingVerification"),
    clarity: v(fd, "clarity"), linkedin: v(fd, "linkedin"), headHtml: v(fd, "headHtml", 20_000), bodyHtml: v(fd, "bodyHtml", 20_000),
  };
  if (t.gtm && !/^GTM-[A-Z0-9]+$/.test(t.gtm)) return { error: "Tag Manager ID looks like GTM-XXXXXXX." };
  if (t.ga4 && !/^G-[A-Z0-9]+$/.test(t.ga4)) return { error: "GA4 Measurement ID looks like G-XXXXXXXXXX." };
  if (t.clarity && !/^[a-z0-9]{6,20}$/i.test(t.clarity)) return { error: "Clarity Project ID is letters and numbers only." };
  if (t.linkedin && !/^\d{4,12}$/.test(t.linkedin)) return { error: "LinkedIn Partner ID is numbers only." };
  const before = await readSetting("tracking");
  await writeSetting("tracking", t, u.name);
  const changed = (Object.keys(t) as (keyof Tracking)[]).filter((k) => t[k] !== before[k]);
  if (changed.length) await logActivity(u, { action: "changed tracking codes", target: changed.join(", "), kind: "setting", ref: "tracking", before, after: t });
  updateTag("cms:settings");
  return { ok: "Saved. Tags are live on the website within a minute." };
}
