import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { isPreview, LOCALE, SHARE_URL, SITE_COUNTRY } from "@/lib/site";
import { setting } from "@/lib/cms/settings";
import { getContact } from "@/lib/cms/business";
import { fullAddress } from "@/lib/contact";
import Tracking from "@/components/cms/Tracking";
import { safeJson } from "@/lib/cms/seo";
import { ContactProvider } from "@/components/cms/ContactProvider";
import ChatLauncher from "@/components/assistant/ChatLauncher";
import CountrySuggest from "@/components/CountrySuggest";
import WhatsAppDialog from "@/components/WhatsAppDialog";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const base: Metadata = {
  metadataBase: new URL(SHARE_URL),
  title: "Industrial Automation Repair | Servo Motor & Drive Repair USA",
  description:
    "Industrial automation repair for US plants: servo motor, servo drive and industrial electronics repair in Grand Island, NY. Free evaluation, 1-year warranty.",
  applicationName: "Industrial Automation Repair Inc.",
  openGraph: {
    title: "Industrial Automation Repair | Servo Motor & Drive Repair USA",
    description:
      "Servo motor, servo drive and industrial electronics repair for US plants. Free evaluation, 1-year warranty, free return shipping.",
    siteName: "Industrial Automation Repair Inc.",
    locale: LOCALE === "en" ? "en_US" : LOCALE.replace("-", "_"),
    type: "website",
  },
};

/* Site-wide defaults, plus verification codes and the share image set in the CMS. */
export async function generateMetadata(): Promise<Metadata> {
  const [t, site] = await Promise.all([setting("tracking"), setting("site")]);
  const other: Record<string, string> = {};
  if (t.bingVerification) other["msvalidate.01"] = t.bingVerification.replace(/.*content=["']?([^"'>\s]+).*/i, "$1");
  // Each country site shows only its own Search Console code (CMS Tracking screen: .com and .ca fields).
  const gsc = SITE_COUNTRY === "CA" ? t.gscVerificationCa : t.gscVerification;
  const google = gsc ? gsc.replace(/.*content=["']?([^"'>\s]+).*/i, "$1").replace(/^google-site-verification=/, "") : undefined;
  return {
    ...base,
    ...(google || Object.keys(other).length ? { verification: { ...(google ? { google } : {}), other } } : {}),
    ...(site.ogImage ? { openGraph: { ...base.openGraph, images: [{ url: site.ogImage }] }, twitter: { card: "summary_large_image", images: [site.ogImage] } } : {}),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [tracking, contact, schema, site] = await Promise.all([setting("tracking"), getContact(), setting("schema"), setting("site")]);
  const siteLd = safeJson(schema.site);
  return (
    <html
      lang={LOCALE}
      className={`${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}><CountrySuggest /></Suspense>
        <ContactProvider value={{ phone: contact.phone, email: contact.email, address: fullAddress(contact), hours: contact.hours, strip: site.announcement.on ? site.announcement.text : "" }}>{children}<Suspense fallback={null}><ChatLauncher /></Suspense><WhatsAppDialog /></ContactProvider>
        {/* Preview deploys never load the live tracking tags */}
        {!isPreview && <Suspense fallback={null}><Tracking cfg={tracking} /></Suspense>}
        {siteLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: siteLd }} />}
      </body>
    </html>
  );
}
