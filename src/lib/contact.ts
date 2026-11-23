import { SITE_COUNTRY } from "@/lib/site";

/* ------------------------------------------------------------------ */
/*  ONE place for the business phone and email.                         */
/*  Leave a value as "" and it is hidden everywhere on the site.        */
/*  Example: phone: "+1 (905) 555-0123", email: "sales@yourdomain.com"  */
/*  Used by: header-free pages, footer, contact page, part pages, cart. */
/* ------------------------------------------------------------------ */
export const contact = {
  phone: "+1 343-507-0006",
  /** Each country site shows its own address; the phone is the same on both. */
  email: SITE_COUNTRY === "CA" ? "info@automiqautomation.ca" : "info@automiqautomation.com",
  address: "1301 Matheson Blvd E, Mississauga, ON L4W 1R1",
  /** Address parts for Google (structured data) and the map */
  street: "1301 Matheson Blvd E",
  city: "Mississauga",
  region: "ON",
  postal: "L4W 1R1",
  geo: { lat: 43.6390196, lng: -79.6355506 },
  /** WhatsApp number with country code, e.g. "+1 905 555 0123". Empty = WhatsApp buttons open the website chat instead. */
  whatsapp: "+1 343-507-0006",
  /** Opening hours for the Contact page, e.g. [["Mon – Fri", "8:00 am – 5:00 pm"], ["Sat – Sun", "Closed"]].
      Empty = the hours card is hidden. */
  hours: [["Mon – Fri", "8:00 am – 6:00 pm"], ["Saturday", "9:00 am – 12:00 pm"], ["Sunday", "Closed"]] as [days: string, time: string][],
  /** Shown under the hours */
  afterHours: "Rush service after hours and on weekends. Just call us.",
};

export const phoneHref = (p: string) => "tel:" + p.replace(/[^+\d]/g, "");

/** Google Maps links for the repair centre */
export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${contact.street}, ${contact.city}, ${contact.region} ${contact.postal}`)}`;
export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${contact.street}, ${contact.city}, ${contact.region} ${contact.postal}`)}`;
export const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(`${contact.street}, ${contact.city}, ${contact.region} ${contact.postal}`)}&z=16&output=embed`;

/** Google (schema.org) address and opening hours for the repair centre */
export const postalAddress = { "@type": "PostalAddress", streetAddress: contact.street, addressLocality: contact.city, addressRegion: contact.region, postalCode: contact.postal, addressCountry: "CA" };
export const openingHours = [
  { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "18:00" },
  { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "12:00" },
];
export const geo = { "@type": "GeoCoordinates", latitude: contact.geo.lat, longitude: contact.geo.lng };

/** Street address to show: the CMS one when it has a street, else the repair centre above. */
export const fullAddress = (c: { street?: string; address: string }) => (c.street ? c.address : contact.address);
