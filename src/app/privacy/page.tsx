import Link from "next/link";
import { seo } from "@/lib/cms/seo";
import LegalPage, { type LegalSection } from "@/components/legal/LegalPage";
import { SITE_URL } from "@/lib/site";
import { legal } from "@/lib/legal";
import { contact, fullAddress } from "@/lib/contact";

export const generateMetadata = seo("/privacy", {
  title: "Privacy Policy | IAR",
  description: "How Industrial Automation Repair Inc. collects, uses and protects the information you share through our website, quotes, orders and repairs.",
  alternates: { canonical: `${SITE_URL}/privacy` },
});

const n = legal.name;
const reach = (
  <>
    {contact.email ? <>email <a href={`mailto:${contact.email}`}>{contact.email}</a> or use </> : <>use </>}
    our <Link href="/contact">contact page</Link>
  </>
);

const sections: LegalSection[] = [
  {
    id: "who",
    title: "Who we are",
    body: (
      <p>{n} (&quot;we&quot;, &quot;us&quot;) repairs and supplies industrial automation equipment from our repair center at {fullAddress(contact)}, for customers across the USA. This policy explains what personal information we collect, why, and the choices you have. We handle personal information in line with Canada&apos;s Personal Information Protection and Electronic Documents Act (PIPEDA).</p>
    ),
  },
  {
    id: "collect",
    title: "Information we collect",
    body: (
      <>
        <p><strong>Information you give us</strong> when you request a repair, quote, pickup or cable, place an order, make an offer or contact us:</p>
        <ul>
          <li>your name, company, work email and phone number;</li>
          <li>shipping, billing and pickup addresses, carrier account numbers and purchase order numbers;</li>
          <li>for shipments outside the USA, your tax or importer number if you give it, used only for customs paperwork;</li>
          <li>details about your equipment, such as part numbers, fault descriptions and photos;</li>
          <li>anything else you write in a form or message.</li>
        </ul>
        <p><strong>Information collected automatically</strong> when you visit the website: basic technical data such as your IP address, browser type, pages visited and the time of the visit. Our hosting provider records this in server logs for security and to keep the site running.</p>
        <p><strong>Your cart</strong> is saved in your own browser on your device. It is not sent to us until you place an order.</p>
        <p>We do not collect payment card details on this website.</p>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use it",
    body: (
      <ul>
        <li>to reply to your requests and send quotes, order confirmations and invoices;</li>
        <li>to carry out repairs, ship units and parts, and arrange pickups;</li>
        <li>to handle warranty claims, returns and support;</li>
        <li>to keep records required for accounting, tax and legal reasons;</li>
        <li>to keep the website secure and working, and to improve it;</li>
        <li>to send you information about our services only if you ask for it or agree to it. You can opt out at any time.</li>
      </ul>
    ),
  },
  {
    id: "share",
    title: "Who we share it with",
    body: (
      <>
        <p>We do not sell or rent your personal information. We share it only as needed to do business with you:</p>
        <ul>
          <li><strong>Shipping carriers</strong> such as FedEx, UPS and DHL, to deliver or collect your units;</li>
          <li><strong>Service providers</strong> who help us run the business, such as our website host, the service that delivers website form messages to our inbox, email, accounting and, when it is added, payment processing;</li>
          <li><strong>Authorities</strong> when the law requires it, or to protect our rights and safety.</li>
        </ul>
        <p>Our service providers may store or process information in the United States, Canada or other countries, where it may be subject to the laws of those countries.</p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and browser storage",
    body: (
      <p>The website uses your browser&apos;s storage to remember your cart. We do not currently use advertising or tracking cookies. If we add analytics or similar tools, we will update this policy first.</p>
    ),
  },
  {
    id: "keep",
    title: "How long we keep it",
    body: (
      <p>We keep personal information only as long as we need it for the purposes above, including warranty periods and the time required by tax and accounting rules. After that, we delete it or make it anonymous.</p>
    ),
  },
  {
    id: "security",
    title: "How we protect it",
    body: (
      <p>The website uses encrypted connections (HTTPS), and access to customer information is limited to people who need it to do their work. No method of sending or storing data is completely secure, so we cannot guarantee absolute security, but we take reasonable steps to protect your information.</p>
    ),
  },
  {
    id: "rights",
    title: "Your choices and rights",
    body: (
      <>
        <p>You can ask us to:</p>
        <ul>
          <li>tell you what personal information we hold about you and give you a copy;</li>
          <li>correct information that is wrong or out of date;</li>
          <li>delete your information, where we are not required to keep it;</li>
          <li>stop using your information for marketing.</li>
        </ul>
        <p>To make a request, {reach}. We may need to confirm your identity first. If you are not satisfied with our answer, please tell us and we will review it.</p>
      </>
    ),
  },
  {
    id: "children",
    title: "Business use only",
    body: <p>Our website and services are for businesses and are not directed to children. We do not knowingly collect information from anyone under 18.</p>,
  },
  {
    id: "changes",
    title: "Changes and contact",
    body: (
      <p>We may update this policy as our business or the law changes. The date at the top of this page shows the latest version. For any question about privacy, {reach}.</p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      path="/privacy"
      crumb="Privacy Policy"
      title="Privacy"
      accent="Policy"
      intro="What we collect when you request a repair, a quote or an order, why we collect it, and how we protect it."
      sections={sections}
    />
  );
}
