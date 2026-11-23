import { Suspense } from "react";
import { DatabaseBackup, Download, History, Info, ShieldCheck, Undo2, Users } from "lucide-react";
import { can, isOwner, requireUser, roleLabel, type Role } from "@/lib/cms/auth";
import { q } from "@/lib/cms/db";
import { canUndo } from "@/lib/cms/undo";
import { activityMask } from "@/lib/cms/activity";
import { Alert, Card, PageHead, Pill, Table, ago, b, input } from "@/components/admin/ui";
import { InviteForm, ResetPasswordButton } from "@/components/admin/UserForms";
import { undo, updateUser } from "./actions";

type Props = { searchParams: Promise<{ msg?: string; who?: string; kind?: string }> };

export default function Page(props: Props) {
  return (
    <Suspense fallback={<p className="text-[#8494AB]">Loading…</p>}>
      <UsersPage {...props} />
    </Suspense>
  );
}

const ROLE_HELP: [Role, string][] = [
  ["owner", "Everything, including users, leads and backups."],
  ["admin", "Everything except Super Admin accounts, tracking code and page scripts, and the two-step sign-in rule. Adds and manages the team."],
  ["seo", "All SEO and content tools: pages, blog, landing pages, redirects, schema, sitemaps, settings. No leads or users."],
  ["writer", "Writes blog posts and uploads images. Posts go to review for an editor to publish."],
  ["viewer", "Can look at the dashboard and search performance. Changes nothing."],
];
const KINDS: [string, string][] = [["", "Everything"], ["page_seo", "Page SEO"], ["redirect", "Redirects"], ["post", "Blog"], ["landing", "Landing pages"], ["media", "Images"], ["product", "Parts"], ["setting", "Settings"], ["user", "Users"], ["undo", "Undos"]];

async function UsersPage({ searchParams }: Props) {
  const me = await requireUser("activity");
  const sp = await searchParams;
  const owner = can(me.role, "users");
  // Only Super Admins see Super Admin accounts: everyone else gets no row, no filter entry,
  // and "Super Admin" in place of their name and email in the activity list.
  const superAdmin = isOwner(me.role);
  const roles = ROLE_HELP.map(([r]) => r).filter((r) => r !== "owner" || superAdmin);
  const where: string[] = [];
  const args: string[] = [];
  if (sp.who) { args.push(sp.who); where.push(`user_name = $${args.length}`); }
  if (sp.kind) { args.push(sp.kind); where.push(`kind = $${args.length}`); }
  const [users, activity, people, { who, what }] = await Promise.all([
    owner ? q<{ id: number; name: string; email: string; role: Role; totp_on: boolean; disabled: boolean; last_active: Date | null; must_change_password: boolean }>(`SELECT id, name, email, role, totp_on, disabled, last_active, must_change_password FROM cms.cms_users ${superAdmin ? "" : "WHERE role <> 'owner'"} ORDER BY disabled, role, name`) : Promise.resolve([]),
    q<{ id: number; user_name: string; action: string; target: string; kind: string; before: unknown; after: unknown; undone: boolean; created_at: Date }>(`SELECT * FROM cms.cms_activity ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY id DESC LIMIT 150`, args),
    q<{ user_name: string }>(`SELECT DISTINCT user_name FROM cms.cms_activity ${superAdmin ? "" : "WHERE user_name NOT IN (SELECT name FROM cms.cms_users WHERE role = 'owner')"} ORDER BY 1`),
    activityMask(me.role),
  ]);
  return (
    <>
      <PageHead title={owner ? "Users & Activity" : "Activity"} sub={owner ? "Who can sign in, what each person can do, and every change made in the CMS, with undo." : "Every change made in the CMS, with undo."} />
      {sp.msg && <Alert tone="blue" icon={<Info size={16} />}>{sp.msg}</Alert>}
      {owner && (
        <>
          <div className="grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]">
            <Card title="People" icon={<Users size={17} />} pad={false}>
              <Table head={["Name", "Role", "Two-step", "Last active", ""]}>
                {users.map((x) => (
                  <tr key={x.id} className={x.disabled ? "opacity-55" : ""}>
                    <td><b>{x.name}</b>{x.id === me.id && <span className="ml-1.5 text-[12px] text-[#8494AB]">(you)</span>}<div className="text-[12.5px] text-[#5B6B84]">{x.email}</div></td>
                    <td>
                      <form action={updateUser} className="flex items-center gap-1.5">
                        <input type="hidden" name="id" value={x.id} /><input type="hidden" name="op" value="role" />
                        <select name="role" defaultValue={x.role} className={`${input} h-8! w-32.5! py-0! text-[12.5px]`}>{roles.map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}</select>
                        <button className={b("light", true)}>Save</button>
                      </form>
                    </td>
                    <td>{x.totp_on ? <Pill tone="ok">On</Pill> : <Pill>Off</Pill>}</td>
                    <td className="whitespace-nowrap text-[12.5px] text-[#5B6B84]">{x.disabled ? "Turned off" : x.must_change_password ? "Not signed in yet" : x.last_active ? ago(x.last_active) : "—"}</td>
                    <td>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <ResetPasswordButton id={x.id} />
                        {x.totp_on && <form action={updateUser}><input type="hidden" name="id" value={x.id} /><input type="hidden" name="op" value="reset2fa" /><button className={b("light", true)} title="If they lost their phone">Reset two-step</button></form>}
                        {x.id !== me.id && <form action={updateUser}><input type="hidden" name="id" value={x.id} /><input type="hidden" name="op" value="toggle" /><button className={b(x.disabled ? "light" : "danger", true)}>{x.disabled ? "Turn on" : "Turn off"}</button></form>}
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>
            </Card>
            <div className="flex flex-col gap-5">
              <InviteForm canOwner={superAdmin} />
              <Card title="What each role can do" icon={<ShieldCheck size={17} />}>
                <dl className="flex flex-col gap-2.5 text-[12.8px]">{ROLE_HELP.map(([r, d]) => <div key={r}><dt className="font-bold">{roleLabel[r]}</dt><dd className="text-[#5B6B84]">{d}</dd></div>)}</dl>
              </Card>
              {can(me.role, "backup") && <Card title="Backup" icon={<DatabaseBackup size={17} />}>
                <p className="text-[12.8px] text-[#5B6B84]">Download everything in the CMS (page SEO, redirects, posts, landing pages, settings, leads, activity) as one file. Keep a copy each month.</p>
                <a href="/admin/export/backup" className={`${b("light")} mt-3`}><Download size={15} /> Download backup</a>
              </Card>}
            </div>
          </div>
        </>
      )}
      <Card title="Activity" icon={<History size={17} />} pad={false} right={
        <form className="flex gap-2" id="activity">
          <select name="who" defaultValue={sp.who ?? ""} className={`${input} h-8! w-auto! min-w-32.5 py-0! text-[12.5px]`}><option value="">Everyone</option>{people.map((p) => <option key={p.user_name}>{p.user_name}</option>)}</select>
          <select name="kind" defaultValue={sp.kind ?? ""} className={`${input} h-8! w-auto! min-w-32.5 py-0! text-[12.5px]`}>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <button className={b("light", true)}>Filter</button>
        </form>
      }>
        {!activity.length && <p className="p-6 text-center text-[#8494AB]">No changes yet.</p>}
        {activity.map((a) => (
          <div key={a.id} className="flex items-center gap-3 border-b border-[#EEF3F9] px-5 py-2.5 last:border-0">
            <div className="flex h-7.5 w-7.5 flex-none items-center justify-center rounded-full bg-linear-to-br from-[#0066FF] to-[#00B0FF] text-[11px] font-bold text-white">{who(a.user_name).split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</div>
            <div className="min-w-0 flex-1 text-[13px] leading-snug"><b>{who(a.user_name)}</b> <span className="text-[#5B6B84]">{a.action}</span> <span className="break-all font-mono text-[12px]">{what(a.target)}</span>{a.undone && <span className="ml-2"><Pill>Undone</Pill></span>}</div>
            <span className="whitespace-nowrap text-[12px] text-[#8494AB]" title={new Date(a.created_at).toLocaleString("en-CA")}>{ago(a.created_at)}</span>
            {canUndo(a as never) ? <form action={undo}><input type="hidden" name="id" value={a.id} /><button className={b("light", true)}><Undo2 size={13} /> Undo</button></form> : <span className="w-17" />}
          </div>
        ))}
      </Card>
    </>
  );
}
