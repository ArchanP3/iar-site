"use server";

import { assertUser } from "@/lib/cms/auth";
import { q } from "@/lib/cms/db";
import { logActivity } from "@/lib/cms/activity";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/cms/leads";
import { revalidatePath } from "next/cache";


export async function updateLead(fd: FormData) {
  const u = await assertUser("leads");
  const id = Number(fd.get("id"));
  const status = String(fd.get("status") ?? "");
  const notes = String(fd.get("notes") ?? "").slice(0, 4000);
  if (!id || !LEAD_STATUSES.includes(status as LeadStatus)) return;
  await q(
    `INSERT INTO cms.lead_notes (request_id, status, notes, updated_by) VALUES ($1, $2, $3, $4)
     ON CONFLICT (request_id) DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes, updated_at = now(), updated_by = EXCLUDED.updated_by`,
    [id, status, notes, u.name],
  );
  await logActivity(u, { action: `marked lead ${status}`, target: `#${id}`, kind: "lead", ref: String(id), before: null, after: null });
  revalidatePath("/admin/leads");
}
