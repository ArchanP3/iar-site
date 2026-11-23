import ResourceShell from "@/components/resources/ResourceShell";
import RepairAdvisor from "@/components/resources/RepairAdvisor";
import { SITE_URL } from "@/lib/site";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/resources/repair-or-replace", {
  title: "Repair or Replace? Free Advisor | AutomIQ",
  description: "Answer five quick questions about your failed servo drive, motor or control and get a clear recommendation: repair, exchange unit or refurbished replacement.",
  alternates: { canonical: `${SITE_URL}/resources/repair-or-replace` },
});

export default function RepairOrReplacePage() {
  return (
    <ResourceShell crumb={[{ label: "Resources", href: "/resources" }, { label: "Repair or Replace Advisor" }]} title="Repair or replace?" accent="Find out in 30 seconds"
      text="Five quick questions about your failed unit. You get a clear recommendation, the reasons, and the right next step.">
      <PageExtras path="/resources/repair-or-replace" />
      <RepairAdvisor />
    </ResourceShell>
  );
}
