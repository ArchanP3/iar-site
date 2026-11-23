import { Suspense } from "react";
import { requireUser } from "@/lib/cms/auth";
import { readSetting } from "@/lib/cms/settings";
import { PageHead } from "@/components/admin/ui";
import { SiteForm } from "@/components/admin/SettingsForms";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-[#91919E]">Loading…</p>}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  const u = await requireUser("settings");
  const [site, sec] = await Promise.all([readSetting("site"), readSetting("security")]);
  return (
    <>
      <PageHead title="Site Settings" sub="The top bar message, social profiles and the default image shown when a page is shared." />
      <SiteForm s={site} sec={sec} owner={u.role === "owner"} />
    </>
  );
}
