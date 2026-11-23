import "server-only";
import { revalidateTag } from "@/lib/cms/cache";
import { q } from "./db";
import { resetRoutes } from "./routing";

/* Redirect bookkeeping shared by the Pages, Blog and Landing screens (and the publish job). */

/** A page moved from `from` to `to`: 301 the old address, point every earlier
    redirect at the new one (no chains), and drop any redirect away from the new
    address (no loops when a URL is changed back). */
export async function moveUrl(from: string, to: string, by: string) {
  if (from === to) return;
  await q(`DELETE FROM cms.cms_redirects WHERE from_path = $1`, [to]);
  await q(
    `INSERT INTO cms.cms_redirects (from_path, to_path, code, source, created_by) VALUES ($1,$2,301,'slug change',$3)
     ON CONFLICT (from_path) DO UPDATE SET to_path = EXCLUDED.to_path, code = 301, active = TRUE, source = 'slug change'`,
    [from, to, by],
  );
  await q(`UPDATE cms.cms_redirects SET to_path = $1 WHERE to_path = $2 AND source = 'slug change'`, [to, from]);
  resetRoutes();
  revalidateTag("cms:redirects", "max");
}

/** A published page was deleted: answer 410 Gone so search engines drop it quickly. */
export async function goneUrl(path: string, by: string) {
  await q(
    `INSERT INTO cms.cms_redirects (from_path, to_path, code, source, created_by) VALUES ($1,'',410,'deleted',$2)
     ON CONFLICT (from_path) DO NOTHING`,
    [path, by],
  );
  resetRoutes();
  revalidateTag("cms:redirects", "max");
}

/** The address is live again (republished, or a delete was undone): remove its 410. */
export async function clearGone(path: string) {
  const rows = await q(`DELETE FROM cms.cms_redirects WHERE from_path = $1 AND source = 'deleted' RETURNING id`, [path]);
  if (rows.length) {
    resetRoutes();
    revalidateTag("cms:redirects", "max"); // works from actions and the publish job alike
  }
}
