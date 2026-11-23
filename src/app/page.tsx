import Header from "@/components/Header";
import HeroShowcase from "@/components/iar/HeroShowcase";
import TrustStrip from "@/components/iar/TrustStrip";
import BrandLogos from "@/components/iar/BrandLogos";
import RepairServices from "@/components/RepairServices";
import PartsSection from "@/components/PartsSection";
import HowWeWork from "@/components/HowWeWork";
import FaultCodeTeaser from "@/components/FaultCodeTeaser";
import Industries from "@/components/Industries";
import GlobalReach from "@/components/GlobalReach";
import ServiceAreasBand from "@/components/ServiceAreasBand";
import BlogTeaser from "@/components/BlogTeaser";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import { PageExtras, seo } from "@/lib/cms/seo";
import { SITE_URL } from "@/lib/site";
import { contact, geo, openingHours, postalAddress } from "@/lib/contact";

/* Tells Google the site's name (shown above results) and the company behind it, with its logo. */
const siteLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: "IAR", alternateName: ["Industrial Automation Repair Inc.", "Industrial Automation Repair"], publisher: { "@id": `${SITE_URL}/#organization` }, inLanguage: "en" },
    {
      "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "Industrial Automation Repair Inc.", alternateName: "IAR", url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/iar-logo.png` },
      ...(contact.email ? { email: contact.email } : {}), ...(contact.phone ? { telephone: contact.phone } : {}),
      address: postalAddress, geo, openingHoursSpecification: openingHours,
      areaServed: [{ "@type": "Country", name: "Canada" }, { "@type": "Country", name: "United States" }],
    },
  ],
};

/* Title and description come from the root layout; the CMS can override them. */
export const generateMetadata = seo("/", {});

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F7F8]">
      <PageExtras path="/" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd).replace(/</g, "\\u003c") }} />
      <Header />
      {/* IAR hero (rotating repair categories), trust strip and manufacturer logo strip */}
      <HeroShowcase />
      <TrustStrip />
      <BrandLogos />
      {/* Sections below the first screen are only laid out when scrolled near (faster first load, same look) */}
      <div className="cv-auto"><RepairServices /></div>
      <div className="cv-auto"><PartsSection /></div>
      <div className="cv-auto"><HowWeWork /></div>
      <div className="cv-auto"><ServiceAreasBand /></div>
      <div className="cv-auto"><GlobalReach /></div>
      <div className="cv-auto"><Industries /></div>
      <div className="cv-auto"><FaultCodeTeaser /></div>
      <div className="cv-auto"><BlogTeaser /></div>
      <div className="cv-auto"><Faq /></div>
      <Footer />
    </main>
  );
}
