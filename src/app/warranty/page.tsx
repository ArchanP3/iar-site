import Link from "next/link";
import { BadgeCheck, ClipboardCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { seo } from "@/lib/cms/seo";
import LegalPage, { type LegalSection } from "@/components/legal/LegalPage";
import { SITE_URL } from "@/lib/site";
import { legal } from "@/lib/legal";

export const generateMetadata = seo("/warranty", {
  title: "1-Year Warranty on Repairs & Parts | IAR",
  description:
    "Every repair, refurbished part and exchange unit from IAR is tested and covered by a 1-year warranty. What is covered and how to make a claim.",
  alternates: { canonical: `${SITE_URL}/warranty` },
});

const m = legal.warrantyMonths;

const sections: LegalSection[] = [
  {
    id: "coverage",
    title: "What is covered",
    body: (
      <>
        <p>{legal.name} (&quot;we&quot;, &quot;us&quot;) warrants the following against failure in normal use for <strong>{m} months</strong> from the date we ship the unit to you:</p>
        <ul>
          <li><strong>Repairs:</strong> the repair we carried out on your unit, including the parts we replaced.</li>
          <li><strong>Refurbished parts:</strong> the refurbished unit you bought from us.</li>
          <li><strong>Exchange units:</strong> the replacement unit we supplied to you.</li>
        </ul>
        <p>New parts carry the warranty stated on your quote or order confirmation. New and surplus parts sold by us may not include the original manufacturer&apos;s warranty.</p>
      </>
    ),
  },
  {
    id: "remedy",
    title: "What we will do",
    body: (
      <>
        <p>If a covered unit fails during the warranty period, we will evaluate it free of charge. If the failure is covered, we will, at our choice:</p>
        <ul>
          <li>repair the unit,</li>
          <li>replace it with an equivalent unit, or</li>
          <li>refund the price you paid for the repair, part or exchange unit.</li>
        </ul>
        <p>A repaired or replaced unit is covered for the rest of the original warranty period. This is the complete remedy under this warranty.</p>
      </>
    ),
  },
  {
    id: "exclusions",
    title: "What is not covered",
    body: (
      <>
        <p>This warranty does not cover failures caused by:</p>
        <ul>
          <li>incorrect installation, wiring, setup or programming, or installation by unqualified personnel;</li>
          <li>misuse, overload, operation outside the manufacturer&apos;s ratings, or use in an application the unit was not designed for;</li>
          <li>external causes such as power surges, lightning, poor supply quality, water, coolant, oil, dust, contamination, fire, impact or physical damage;</li>
          <li>faults elsewhere in your machine, such as a failing motor, cable, encoder, drive or power supply connected to the unit;</li>
          <li>repairs, modifications or opening of the unit by anyone other than us, or removal of our warranty seal or label;</li>
          <li>normal wear of consumable items such as fans, batteries, brushes, bearings, seals and display backlights, unless we replaced them in our repair;</li>
          <li>damage in transit caused by poor packaging when the unit is sent to us.</li>
        </ul>
        <p>The warranty also does not cover parameters, programs or data stored in the unit. Please keep a backup of your settings before sending a unit in.</p>
      </>
    ),
  },
  {
    id: "claim",
    title: "How to make a claim",
    body: (
      <>
        <ul>
          <li>Contact us through our <Link href="/contact">contact page</Link> with your order or repair number, the part number and a short description of the fault.</li>
          <li>Tell us how the unit was installed and what the machine was doing when it failed. Fault codes and photos help.</li>
          <li>We confirm the claim and arrange how the unit comes back to us. Shipping for warranty claims is agreed with you when you open the claim.</li>
          <li>We evaluate the unit for free and tell you the result before any work is done.</li>
        </ul>
        <p>If we find the failure is not covered, we will send you a written quote for the repair. Nothing is charged unless you approve it.</p>
      </>
    ),
  },
  {
    id: "limits",
    title: "Limits of this warranty",
    body: (
      <>
        <p>To the fullest extent allowed by law, this warranty replaces all other warranties and conditions, written or implied, including any implied warranty of merchantability or fitness for a particular purpose.</p>
        <p>We are not responsible for downtime, lost production, lost profit, labour to remove or install units, damage to other equipment, or any other indirect or consequential loss. Our total responsibility under this warranty is limited to the amount you paid for the repair, part or exchange unit concerned.</p>
        <p>Some laws do not allow certain limits, so some of these may not apply to you. This warranty gives you specific rights, and you may also have other rights under the law where you are.</p>
      </>
    ),
  },
  {
    id: "more",
    title: "Related terms",
    body: (
      <p>
        This warranty is part of our <Link href="/terms">Terms &amp; Conditions</Link>, which also cover orders, shipping, exchange units and returns.
      </p>
    ),
  },
];

const highlights = [
  { icon: ShieldCheck, t: `${m}-month warranty`, d: "On repairs, refurbished parts and exchange units." },
  { icon: ClipboardCheck, t: "Test report included", d: "Every repaired unit ships with its test report." },
  { icon: BadgeCheck, t: "Load tested on OEM-standard equipment", d: "Drives with a motor, motors under drive control." },
  { icon: RefreshCw, t: "Free warranty evaluation", d: "We check any claim free and tell you first." },
];

export default function WarrantyPage() {
  return (
    <LegalPage
      path="/warranty"
      crumb="Warranty"
      title="Our"
      accent="Warranty"
      intro={`Every repair, refurbished part and exchange unit we ship is tested and covered for ${m} months. Here is exactly what that means.`}
      sections={sections}
      highlights={highlights}
    />
  );
}
