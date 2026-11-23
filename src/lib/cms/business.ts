import "server-only";
import { contact as fallback } from "@/lib/contact";
import { SITE_COUNTRY } from "@/lib/site";
import { setting } from "./settings";

export type Contact = { phone: string; email: string; address: string; hours: [string, string][]; street: string; city: string; region: string; postal: string };

/** Phone, email, address and hours: from the CMS (Locations), else src/lib/contact.ts. Cached. */
export async function getContact(): Promise<Contact> {
  const b = await setting("business");
  const city = [b.city, b.region].filter(Boolean).join(", ");
  return {
    phone: b.phone || fallback.phone,
    email: siteEmail(b.email),
    address: b.street ? `${b.street}, ${city}` : b.city ? `${b.city}, ${b.region === "ON" ? "Ontario" : b.region}` : fallback.address,
    hours: b.hours?.length ? b.hours : fallback.hours,
    street: b.street, city: b.city, region: b.region, postal: b.postal,
  };
}

/* Both sites share the CMS settings. The .ca site shows info@automiqautomation.ca in place of the
   .com info address; any other address typed in the CMS shows as is on both sites. */
function siteEmail(cms: string | undefined) {
  const e = cms?.trim() || "";
  if (!e) return fallback.email;
  if (SITE_COUNTRY === "CA" && e.toLowerCase() === "info@automiqautomation.com") return fallback.email;
  return e;
}
