import ResourceShell from "@/components/resources/ResourceShell";
import GlossaryList from "@/components/resources/GlossaryList";
import { glossary } from "@/lib/glossary";
import { SITE_URL } from "@/lib/site";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/resources/glossary", {
  title: "Industrial Automation Glossary | IAR",
  description: `${glossary.length} industrial automation terms in plain English: servo drive, encoder alignment, IGBT, DC link, resolver, line module, VFD and more.`,
  alternates: { canonical: `${SITE_URL}/resources/glossary` },
});

const url = `${SITE_URL}/resources/glossary`;
const schema = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name: "Industrial automation glossary",
  url,
  hasDefinedTerm: glossary.map((x) => ({ "@type": "DefinedTerm", name: x.term, description: x.def, url: `${url}#${x.slug}` })),
};

export default function GlossaryPage() {
  return (
    <ResourceShell crumb={[{ label: "Resources", href: "/resources" }, { label: "Glossary" }]} title="Automation terms," accent="in plain English"
      text="The words you will hear from drive manuals, fault codes and our technicians, explained simply." schema={schema}>
      <PageExtras path="/resources/glossary" />
      <GlossaryList terms={glossary} />
    </ResourceShell>
  );
}
