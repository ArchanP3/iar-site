"use server";

import { updateTag } from "@/lib/cms/cache";
import { assertUser } from "@/lib/cms/auth";
import { logActivity } from "@/lib/cms/activity";
import { readSetting, writeSetting } from "@/lib/cms/settings";
import { defaultRobots, indexableUrls, robotsProblem, robotsVerdict } from "@/lib/cms/sitemaps";
import { normPath } from "@/lib/cms/seo";
import type { FormState } from "../../actions";

export async function saveRobots(_: FormState, fd: FormData): Promise<FormState> {
  const u = await assertUser("sitemaps");
  const txt = String(fd.get("robots") ?? "").replace(/\r\n/g, "\n").trim().slice(0, 20_000);
  const bad = robotsProblem(txt);
  if (bad) return { error: bad };
  const before = await readSetting("robots");
  const custom = txt === defaultRobots().trim() ? "" : txt;
  await writeSetting("robots", { custom }, u.name);
  await logActivity(u, { action: custom ? "edited" : "reset", target: "robots.txt", kind: "setting", ref: "robots", before, after: { custom } });
  updateTag("cms:settings");
  return { ok: "robots.txt saved and live." };
}

export async function saveSitemapToggles(fd: FormData) {
  const u = await assertUser("sitemaps");
  const before = await readSetting("site");
  const keys = ["pages", "posts", "locations", "faultCodes", "images", "parts"] as const;
  const after = { ...before, sitemaps: Object.fromEntries(keys.map((k) => [k, fd.get(k) === "on"])) as typeof before.sitemaps };
  await writeSetting("site", after, u.name);
  await logActivity(u, { action: "changed which sitemaps are published", target: "Sitemaps", kind: "setting", ref: "site", before, after });
  updateTag("cms:settings");
}

export async function testUrl(txt: string, raw: string) {
  await assertUser("sitemaps");
  const path = normPath(raw.replace(/^https?:\/\/[^/]+/, ""));
  const v = robotsVerdict(txt, path);
  const inMap = (await indexableUrls()).find((u) => u.loc.endsWith(path === "/" ? "" : path) || (path === "/" && u.path === "/"));
  return { path, ...v, sitemap: inMap?.sitemap ?? null };
}
