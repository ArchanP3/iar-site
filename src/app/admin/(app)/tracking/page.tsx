import { Suspense } from "react";
import { requireUser } from "@/lib/cms/auth";
import { readSetting } from "@/lib/cms/settings";
import { PageHead } from "@/components/admin/ui";
import TrackingForm from "@/components/admin/TrackingForm";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-[#8494AB]">Loading…</p>}>
      <Tracking />
    </Suspense>
  );
}

async function Tracking() {
  await requireUser("tracking");
  const t = await readSetting("tracking");
  return (
    <>
      <PageHead title="Tracking & Code" sub="Add analytics, verification tags and scripts without touching the website's code. Per-page scripts are on each page's editor." />
      <TrackingForm t={t} />
    </>
  );
}
