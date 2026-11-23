"use server";

import { updateTag } from "@/lib/cms/cache";
import { assertUser } from "@/lib/cms/auth";
import { logActivity } from "@/lib/cms/activity";
import { readSetting, writeSetting, type Business, type SiteSettings, type Security } from "@/lib/cms/settings";
import type { FormState } from "../../actions";

const v = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? "").trim().slice(0, max);
const url = (s: string) => !s || /^https:\/\/[^\s]+$/.test(s);

export async function saveBusiness(_: FormState, fd: FormData): Promise<FormState> {
  const u = await assertUser("locations");
  const days = fd.getAll("h_days").map(String);
  const times = fd.getAll("h_time").map(String);
  const hours = days.map((d, i) => [d.trim().slice(0, 40), (times[i] ?? "").trim().slice(0, 60)] as [string, string]).filter(([d, t]) => d && t);
  const b: Business = {
    name: v(fd, "name") || "Industrial Automation Repair Inc.", street: v(fd, "street"), city: v(fd, "city"), region: v(fd, "region", 40), postal: v(fd, "postal", 20), country: v(fd, "country", 2).toUpperCase() || "CA",
    phone: v(fd, "phone", 40), email: v(fd, "email"), hours, gbp: v(fd, "gbp", 500), dropOff: v(fd, "dropOff", 300), serviceArea: v(fd, "serviceArea", 300),
  };
  if (b.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) return { error: "That email address doesn't look right." };
  if (b.phone && b.phone.replace(/\D/g, "").length < 10) return { error: "Phone number needs at least 10 digits." };
  if (!url(b.gbp)) return { error: "Google Business Profile link must start with https://" };
  const before = await readSetting("business");
  await writeSetting("business", b, u.name);
  await logActivity(u, { action: "changed business details", target: "Name, address, phone & hours", kind: "setting", ref: "business", before, after: b });
  updateTag("cms:settings");
  return { ok: "Saved. The footer, Contact page and LocalBusiness schema now use these details." };
}

export async function saveSite(_: FormState, fd: FormData): Promise<FormState> {
  const u = await assertUser("settings");
  const before = await readSetting("site");
  const social = { linkedin: v(fd, "linkedin", 300), youtube: v(fd, "youtube", 300), facebook: v(fd, "facebook", 300), instagram: v(fd, "instagram", 300), x: v(fd, "x", 300) };
  if (!Object.values(social).every(url)) return { error: "Social links must be full addresses starting with https://" };
  const ogImage = v(fd, "ogImage", 300);
  if (ogImage && !/^(\/|https:\/\/)/.test(ogImage)) return { error: "Share image must be a Media Library address (/media/…) or a full https:// link." };
  const next: SiteSettings = { ...before, announcement: { on: fd.get("announcement_on") === "on", text: v(fd, "announcement", 140) }, social, ogImage };
  await writeSetting("site", next, u.name);
  let secMsg = "";
  if (u.role === "owner") {
    const sec: Security = { require2fa: fd.get("require2fa") === "on" };
    const old = await readSetting("security");
    if (old.require2fa !== sec.require2fa) {
      await writeSetting("security", sec, u.name);
      await logActivity(u, { action: sec.require2fa ? "required two-step sign-in" : "made two-step sign-in optional", target: "Security", kind: "setting", ref: "security", before: old, after: sec });
      secMsg = sec.require2fa ? " Everyone will set up two-step sign-in at their next sign-in." : "";
    }
  }
  await logActivity(u, { action: "changed site settings", target: "Top bar, social links, share image", kind: "setting", ref: "site", before, after: next });
  updateTag("cms:settings");
  return { ok: "Saved." + secMsg };
}
