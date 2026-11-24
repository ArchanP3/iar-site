import Link from "next/link";
import { seo } from "@/lib/cms/seo";
import LegalPage, { type LegalSection } from "@/components/legal/LegalPage";
import { SITE_URL } from "@/lib/site";
import { legal } from "@/lib/legal";

export const generateMetadata = seo("/terms", {
  title: "Terms & Conditions | IAR",
  description: "Terms for repairs, parts orders, exchange units, shipping, returns and use of the Industrial Automation Repair Inc. website.",
  alternates: { canonical: `${SITE_URL}/terms` },
});

const n = legal.name;

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    body: (
      <>
        <p>These terms apply to every quote, order, repair, exchange and sale by {n} (&quot;we&quot;, &quot;us&quot;), and to your use of this website. By requesting a quote, placing an order, sending us a unit or using this website, you agree to them.</p>
        <p>If a signed agreement or your accepted quote says something different, that document applies for that order. We do not accept terms printed on purchase orders or other customer documents unless we agree to them in writing.</p>
      </>
    ),
  },
  {
    id: "quotes",
    title: "Quotes, prices and orders",
    body: (
      <>
        <ul>
          <li>All prices are in <strong>US dollars (USD)</strong> and do not include shipping, taxes, duties or brokerage fees unless stated.</li>
          <li>A quote is valid for the period shown on it. Prices and stock on this website can change without notice.</li>
          <li>An order placed on this website is a request. It becomes a contract only when we confirm it in writing and send your invoice. We confirm stock, shipping and your invoice before you pay.</li>
          <li>We may decline or cancel any order, for example if a part is no longer available or a price was shown in error. If you have already paid, we refund you in full.</li>
          <li>An offer made with &quot;Make an Offer&quot; is not binding on us until we accept it in writing.</li>
        </ul>
      </>
    ),
  },
  {
    id: "repairs",
    title: "Repairs",
    body: (
      <>
        <ul>
          <li>Every repair starts with a free evaluation. We then send you a written quote, and no repair work is done until you approve it.</li>
          <li>Turnaround times we give, such as 24 to 72 hours, are typical times once a quote is approved. They are estimates, not guarantees.</li>
          <li>Some units cannot be repaired economically, or need parts that are no longer available. We will tell you before doing any work.</li>
          <li>If you decline a quote, we return your unit at your shipping cost, or dispose of it if you ask us to in writing.</li>
          <li>Units left with us for 90 days after we contact you about a quote or a completed repair, without a reply or payment, may be treated as abandoned and disposed of or sold to cover our costs, after written notice to you.</li>
          <li>We record the condition of every unit when it arrives. Please remove any data you need and keep a backup of parameters and programs before sending a unit in. We are not responsible for lost data, parameters or programs.</li>
        </ul>
      </>
    ),
  },
  {
    id: "exchange",
    title: "Exchange units",
    body: (
      <>
        <ul>
          <li>When you buy an exchange unit, you agree to send us your unit of the same part number. We ship the replacement once your unit reaches us, unless we agree otherwise in writing.</li>
          <li>Ship and handling times shown on our website are typical estimates, not guarantees. Rush handling is available on request for an extra fee, quoted to you before we start.</li>
          <li>The exchange price assumes your unit can be repaired. The final price is confirmed when we check your unit and may be higher depending on its condition. We tell you before charging any difference.</li>
          <li>If your unit does not reach us, or is a different part number, we may charge the difference up to our refurbished price for that part.</li>
          <li>Units you send in exchange become our property once the exchange is complete.</li>
        </ul>
      </>
    ),
  },
  {
    id: "shipping",
    title: "Shipping and pickups",
    body: (
      <>
        <ul>
          <li>Return shipping is free on completed repairs, and we cover outbound shipping on in-stock orders within the USA and Canada. Shipping units to us is at your cost: send them with any carrier, request a pickup (added to your invoice or billed to your carrier account) or drop them off in Grand Island, NY.</li>
          <li>Risk of loss or damage passes to you when we hand the shipment to the carrier. Please inspect deliveries and report visible damage to the carrier and to us right away.</li>
          <li>Pack units you send us carefully. We are not responsible for damage caused in transit to us.</li>
          <li>For shipments between the USA and Canada, any duties, taxes and brokerage fees are your responsibility unless we agree otherwise.</li>
          <li>Online orders are for delivery in the USA and Canada. For delivery to other countries, contact us for a quote. International shipping charges vary by country, and all duties, import taxes, brokerage fees and other import charges are paid by you. Repair services are offered to customers in the USA.</li>
          <li>Delivery dates are estimates. We are not responsible for carrier delays.</li>
        </ul>
      </>
    ),
  },
  {
    id: "returns",
    title: "Returns",
    body: (
      <>
        <ul>
          <li>You may return a part you bought from us within <strong>{legal.returnDays} days</strong> of delivery if it is unused, uninstalled and in its original condition and packaging.</li>
          <li>Contact us first for a return authorization. Returns sent without one may be refused.</li>
          <li>Approved returns are refunded less a <strong>{legal.restockingFee} restocking fee</strong>. You pay the shipping cost of the return.</li>
          <li>Repairs, exchange units, custom cables and special-order or sourced parts cannot be returned unless they are faulty.</li>
          <li>Faulty units are handled under our <Link href="/warranty">warranty</Link>.</li>
        </ul>
      </>
    ),
  },
  {
    id: "payment",
    title: "Payment",
    body: (
      <ul>
        <li>Payment is due as shown on your invoice. We may require payment before shipping.</li>
        <li>We may hold units and parts until invoices are paid in full.</li>
        <li>Online card payment is not available yet. We send payment details with your invoice.</li>
      </ul>
    ),
  },
  {
    id: "use",
    title: "Installation and safe use",
    body: (
      <p>Industrial electrical equipment must be installed, configured and commissioned by qualified personnel following the manufacturer&apos;s instructions and the safety rules where you are. You are responsible for checking that a unit is the correct part, revision and setting for your machine before you install and run it. Information on this website, including fault code guides, is general guidance only and does not replace the manufacturer&apos;s manuals or a qualified technician.</p>
    ),
  },
  {
    id: "warranty",
    title: "Warranty",
    body: (
      <p>Repairs, refurbished parts and exchange units are covered by our one-year warranty, as set out on our <Link href="/warranty">Warranty page</Link>. Except for that warranty and to the fullest extent allowed by law, units and parts are supplied without any other warranty or condition, written or implied.</p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <>
        <p>To the fullest extent allowed by law, we are not liable for any indirect, incidental, special or consequential loss, including downtime, lost production, lost profit, lost data, or damage to other equipment, even if we were told it was possible.</p>
        <p>Our total liability for any claim relating to an order, repair or exchange is limited to the amount you paid us for that order, repair or exchange.</p>
      </>
    ),
  },
  {
    id: "brands",
    title: "Brands and trademarks",
    body: (
      <p>{n} is an independent repair and surplus parts provider. We are not affiliated with, authorized by, or endorsed by any manufacturer named on this website, and we are not an authorized distributor or service center unless stated. Brand names, model numbers and trademarks belong to their owners and are used only to identify compatible equipment. Product images may be representative.</p>
    ),
  },
  {
    id: "website",
    title: "Using this website",
    body: (
      <ul>
        <li>The content and design of this website belong to us. You may not copy or reuse them for commercial purposes without our written permission.</li>
        <li>You agree not to misuse the website, including sending false requests, trying to break its security, or collecting data from it with automated tools.</li>
        <li>We try to keep information accurate, but it may contain errors and may change without notice.</li>
        <li>How we handle your information is explained in our <Link href="/privacy">Privacy Policy</Link>.</li>
      </ul>
    ),
  },
  {
    id: "general",
    title: "General",
    body: (
      <ul>
        <li>These terms are governed by the laws of {legal.law}, and the courts of Ontario have jurisdiction over any dispute.</li>
        <li>We are not responsible for delays or failures caused by events outside our reasonable control, such as carrier delays, supply shortages, severe weather or power outages.</li>
        <li>If any part of these terms cannot be enforced, the rest still applies.</li>
        <li>We may update these terms. The version on this page on the date of your order applies to that order.</li>
      </ul>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      path="/terms"
      crumb="Terms & Conditions"
      title="Terms &"
      accent="Conditions"
      intro="The rules for quotes, orders, repairs, exchange units, shipping and returns, written in plain English."
      sections={sections}
    />
  );
}
