import { Suspense } from "react";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { currentUser, roleLabel, totpUri } from "@/lib/cms/auth";
import { one } from "@/lib/cms/db";
import { readSetting } from "@/lib/cms/settings";
import { PageHead } from "@/components/admin/ui";
import AccountForms from "@/components/admin/AccountForms";

type Props = { searchParams: Promise<{ first?: string; setup2fa?: string; twostep?: string; others?: string }> };

export default function Page(props: Props) {
  return (
    <Suspense fallback={<p className="text-[#91919E]">Loading…</p>}>
      <Account {...props} />
    </Suspense>
  );
}

async function Account({ searchParams }: Props) {
  const u = await currentUser();
  if (!u) redirect("/admin/login");
  const sp = await searchParams;
  const [row, sec] = await Promise.all([
    one<{ totp_secret: string | null; created_at: Date }>(`SELECT totp_secret, created_at FROM cms.cms_users WHERE id = $1`, [u.id]),
    readSetting("security"),
  ]);
  const pending = !u.totpOn && row?.totp_secret ? row.totp_secret : null;
  const qr = pending ? await QRCode.toDataURL(totpUri(pending, u.email), { margin: 1, width: 200, color: { dark: "#131316", light: "#FFFFFF" } }) : null;
  return (
    <>
      <PageHead title="My account" sub={`${u.email} · ${roleLabel[u.role]}`} />
      <AccountForms
        name={u.name}
        mustChange={u.mustChange}
        totpOn={u.totpOn}
        required={sec.require2fa}
        pendingSecret={pending}
        qr={qr}
        notice={sp.first ? "first" : sp.setup2fa ? "setup2fa" : sp.twostep === "on" ? "on" : sp.others ? "others" : null}
      />
    </>
  );
}
