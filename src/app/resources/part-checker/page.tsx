import ResourceShell from "@/components/resources/ResourceShell";
import PartChecker from "@/components/resources/PartChecker";
import { SITE_URL } from "@/lib/site";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/resources/part-checker", {
  title: "Part Number Checker: Stock, Exchange & Repair | AutomIQ",
  description: "Type any automation part number to see refurbished stock and price, exchange and repair options, or get a quote if it is not listed yet.",
  alternates: { canonical: `${SITE_URL}/resources/part-checker` },
});

export default function PartCheckerPage() {
  return (
    <ResourceShell wide={false} crumb={[{ label: "Resources", href: "/resources" }, { label: "Part Number Checker" }]} title="Part number" accent="checker"
      text="Type a part number and see everything we can do for it: refurbished stock, exchange, repair and new.">
      <PageExtras path="/resources/part-checker" />
      <PartChecker />
    </ResourceShell>
  );
}
