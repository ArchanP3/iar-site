"use server";

import { revalidatePath } from "next/cache";
import { assertUser } from "@/lib/cms/auth";
import { readSetting, writeSetting } from "@/lib/cms/settings";
import { weekKey } from "./week";

export async function toggleTask(fd: FormData) {
  const u = await assertUser("checklist");
  const id = String(fd.get("id") ?? "").slice(0, 120);
  const cur = await readSetting("checklist");
  const wk = weekKey();
  const done = cur.week === wk ? cur.done : [];
  await writeSetting("checklist", { week: wk, done: done.includes(id) ? done.filter((x) => x !== id) : [...done, id] }, u.name);
  revalidatePath("/admin/checklist");
}
