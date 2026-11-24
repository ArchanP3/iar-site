// Repair process ("Your Repair, Step by Step") — used on the home page and the Our Services page.
// Wording from IAR_Website_Page_Wording_SEO_Revised (Our Services → Our Repair Process, eight steps).
// Icons are names mapped in src/components/ProcessSection.tsx.

export type Step = { t: string; d: string; points: string[]; icon: string; status: string };

export const PROCESS: Step[] = [
  {
    t: "Request a Quote",
    d: "Send us the manufacturer, part number and fault description by phone, email or the quote form. We confirm we can help and tell you how to send it in.",
    points: ["Phone, email or quote form", "Manufacturer, part number and fault", "We tell you how to send it in"],
    icon: "quote", status: "Received",
  },
  {
    t: "Ship Your Unit",
    d: "Package the unit securely with your contact details and a short fault description, and ship it to our Grand Island, NY repair centre — or drop it off in person.",
    points: ["Packed securely", "Contact details and fault note inside", "Ship it in or drop it off"],
    icon: "truck", status: "In transit",
  },
  {
    t: "Free Evaluation",
    d: "Our technicians bench-test the unit and pinpoint why it failed. The evaluation is free, with no obligation.",
    points: ["Bench-tested by our technicians", "Root cause pinpointed", "Free, with no obligation"],
    icon: "search", status: "Evaluated",
  },
  {
    t: "Quote & Approval",
    d: "You receive a written quote with the repair cost and lead time. We only start once you sign off on it.",
    points: ["Repair cost in writing", "Lead time confirmed", "Work starts only after sign-off"],
    icon: "approve", status: "Quoted",
  },
  {
    t: "Expert Repair",
    d: "Our technicians complete the repair or rebuild using genuine OEM components — from bearings, encoders and windings to power and control boards.",
    points: ["Genuine OEM components", "Bearings, encoders and windings", "Power and control boards"],
    icon: "wrench", status: "In repair",
  },
  {
    t: "Load Testing",
    d: "Every repaired unit is tested under real operating load on OEM-standard test equipment, and the results are recorded in a test report.",
    points: ["Real operating load", "OEM-standard test equipment", "Results recorded in a test report"],
    icon: "gauge", status: "Tested",
  },
  {
    t: "Free Return Shipping",
    d: "Your unit is packed securely and shipped back to you at no charge, with the test report included.",
    points: ["Packed securely", "Shipped back at no charge", "Test report included"],
    icon: "package", status: "Shipped",
  },
  {
    t: "1-Year Warranty",
    d: "Every repair is backed by a one-year warranty, so your equipment is covered long after it is back in service.",
    points: ["Every repair covered", "One full year", "Covered long after it’s back in service"],
    icon: "shield", status: "Covered",
  },
];

// "How your unit reaches us" — wording from the Contact, Shipping & Warranty and Exchange Program pages.
export const INTAKE = [
  { t: "Drop-off in Grand Island, NY", d: "3279 Grand Island Blvd — bring units to our repair centre during business hours.", icon: "pin" },
  { t: "Ship from Anywhere in the USA", d: "Send it with any carrier — same lead times and reporting.", icon: "truck" },
  { t: "Book a Pickup", d: "We arrange collection from your facility with FedEx, UPS or DHL.", icon: "package" },
  { t: "Line Down? Exchange First", d: "A tested exchange unit ships first; your failed unit follows.", icon: "swap" },
];
