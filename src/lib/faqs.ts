/* ------------------------------------------------------------------ */
/*  FAQs used on the homepage and the Resources FAQ page.               */
/*  Edit questions here. Only facts IAR has confirmed.             */
/* ------------------------------------------------------------------ */
export type FaqGroup = { key: string; label: string; short?: string; items: { q: string; a: string }[] };

/* Also shown on /sell-surplus */
export const surplusFaqs: FaqGroup["items"] = [
  { q: "What surplus do you buy?", a: "Industrial automation parts: servo drives and motors, VFDs, PLCs and I/O, HMIs, CNC controls, encoders and power supplies, new or used, current or obsolete. Send the list and we tell you what we can take." },
  { q: "Do you buy used or obsolete parts?", a: "Often, yes. Obsolete parts can be exactly what another plant needs to keep a line running. Tell us the condition and we price it fairly." },
  { q: "How is the price decided?", a: "By the part, its condition, how many you have and current demand. Add an asking price if you have one; if not, we make an offer." },
  { q: "Who pays to ship the parts?", a: "We tell you in our offer. For accepted lots we can arrange the pickup and send you the waybill." },
  { q: "Do I have to accept the offer?", a: "No. Sending a list costs nothing and there is no obligation." },
];

export const faqGroups: FaqGroup[] = [
  {
    key: "repairs",
    label: "Repairs",
    items: [
      {
        q: "How long does a servo drive or servo motor repair take?",
        a: "Typical turnaround is 24–72 hours once you approve the quote. Exchange units usually ship within 1–2 business days of receiving your unit.",
      },
      {
        q: "How do I get a repair quote?",
        a: "Send the manufacturer, part number and fault description by phone, email or the request form — the evaluation is free. You get a written quote with the repair cost and lead time, and a repair is usually far cheaper than a new unit.",
      },
      {
        q: "Do you charge to look at a unit?",
        a: "No — the evaluation costs nothing and commits you to nothing. We inspect and test the unit, find the root cause and send a written quote with the lead time. No work starts without your approval.",
      },
      {
        q: "Can you fix a servo drive overcurrent fault?",
        a: "Usually. The cause is often a failed output stage or a shorted motor cable, and the free evaluation tells you which.",
      },
      {
        q: "Do you save drive settings?",
        a: "Yes. We take a drive parameter backup before work starts, where the drive allows it.",
      },
      {
        q: "What if my unit can't be repaired?",
        a: "We tell you before any repair work is done and offer the next best option: an exchange unit, a refurbished replacement or a sourced part.",
      },
      {
        q: "How do you test a repaired drive or motor?",
        a: "Every repaired unit is tested under real operating load on OEM-standard test equipment, including a SINUMERIK 840D test setup for Siemens units. Drives run a motor, motors run under drive control, and the results go into the test report that ships with the unit.",
      },
      {
        q: "Do you repair obsolete or discontinued equipment?",
        a: "Yes. Legacy and discontinued motors, drives and controls are a large part of our work. When the manufacturer stops support, repair is often the only option, and we also stock obsolete automation parts and offer a servo exchange on many models.",
      },
      {
        q: "Which brands do you repair?",
        a: "We specialize in Siemens (SINAMICS, SIMODRIVE, SINUMERIK), Bosch Rexroth Indramat and Allen-Bradley / Rockwell Automation, and routinely repair FANUC, ABB, Yaskawa, Mitsubishi, Panasonic, Kollmorgen, Parker, Baldor and Control Techniques equipment.",
      },
      {
        q: "Do you repair encoders and align them to the motor?",
        a: "Yes. We repair encoders and resolvers and align the encoder to the motor's commutation, then run the motor under drive control to confirm it. A wrong alignment can make a motor fault or run rough even when everything else is fine.",
      },
      {
        q: "What should I send with my unit?",
        a: "The full part number from the nameplate, the fault code if there is one, and a short note on what happened before it failed. It helps us find the root cause faster.",
      },
      {
        q: "Can I get a rush repair?",
        a: "Yes. Call or email us, or tell us your line is down when you request the repair. Rush handling is available for an extra fee, and we confirm the price and lead time with you before we start.",
      },
    ],
  },
  {
    key: "parts",
    label: "Parts",
    items: [
      {
        q: "What is the difference between new, surplus, refurbished and exchange parts?",
        a: "New is factory-new, in original packaging where available. Surplus is unused or lightly used stock, inspected before listing. Refurbished is repaired and refreshed by our technicians, then tested. Exchange is a tested replacement unit at a lower price: you buy it, ship us your unit, and we ship the replacement once yours arrives.",
      },
      {
        q: "Can you find obsolete or hard-to-find automation parts?",
        a: "Yes. Send us the part number and our team sources it from our stock and our surplus supplier network, including discontinued parts.",
      },
      {
        q: "How do I get a price for a part?",
        a: "Enter the part number in the part search or request a quote. We reply with price, condition and lead time.",
      },
      {
        q: "Will a replacement part work in my machine?",
        a: "We match the full part number and the hardware and firmware revision, and confirm compatibility with you before shipping.",
      },
      {
        q: "Can I make an offer or get bulk pricing?",
        a: "Yes. You can make an offer on surplus stock, and spares or multi-unit orders are quoted on request.",
      },
      {
        q: "Do you make custom cables?",
        a: "Yes. Request a custom cable with the drive and motor model numbers and the length you need. We confirm the connectors and pinout and send you a quote.",
      },
      {
        q: "Do you buy surplus parts?",
        a: "Yes. Send us your list of spare drives, motors, PLCs, HMIs or CNC parts on our Sell Your Surplus page. We reply with an offer, with no obligation, and can arrange the pickup.",
      },
      {
        q: "How do I check if you have a part?",
        a: "Type the part number in the part search or the Part Number Checker. It shows whether we stock it, offer it as an exchange or can repair your own unit.",
      },
    ],
  },
  {
    key: "service",
    label: "Shipping & Support",
    short: "Shipping",
    items: [
      {
        q: "How do I send my unit for repair?",
        a: "Request a repair, then ship it to us with any carrier or request a pickup from your facility with FedEx, UPS or DHL. Include the full part number and a short description of the fault.",
      },
      {
        q: "Do you serve customers in the United States?",
        a: "Yes. Plants anywhere in the USA ship straight to our Grand Island, NY repair centre, or we arrange a pickup from your facility.",
      },
      {
        q: "Do you ship parts outside the USA?",
        a: "Yes. We ship industrial automation parts worldwide by air, including to Canada, Mexico, Europe, Japan, South Korea and the rest of Asia. Customers in Canada can order online; customers in other countries request a quote on our International Orders page, or by phone or email, because shipping charges vary by country. The customer pays all duties, import taxes and brokerage fees. Repairs are available for customers in the USA.",
      },
      {
        q: "What warranty comes with a repair?",
        a: "Every repair is covered by our one-year warranty from the ship date, return shipping is free, and a test report ships with the unit.",
      },
      {
        q: "How does an exchange work?",
        a: "Buy an exchange unit on the part page or ask us for one. Ship us your failed unit and we ship a tested replacement, usually within 1–2 business days of receiving it (some units take 5–10 business days). Need it before you send yours? Contact us and we explain the options and pricing. The final price is confirmed when we check your unit and may be higher depending on its condition.",
      },
      {
        q: "Do you offer on-site service?",
        a: "Yes. Our technicians provide on-site service calls across the United States.",
      },
      {
        q: "Can I reach a technician outside business hours?",
        a: "Yes. Phone support is available 24/7 for line-down emergencies.",
      },
      {
        q: "Can I drop off a unit at your repair centre?",
        a: "Yes. Bring it to our repair centre in Grand Island, New York during business hours. No appointment is needed. You can also call us or request a repair online first if you want us to expect it.",
      },
      {
        q: "Do you have repair shops in other cities?",
        a: "No. Every repair is done at our one repair centre in Grand Island, New York. We serve all of the USA with pickups, ship-in and on-site service.",
      },
      {
        q: "Can you arrange a pickup from the USA?",
        a: "Yes. We arrange pickups from plants across the USA with FedEx, UPS or DHL and send you the waybill.",
      },
    ],
  },
];


/* Extra groups shown only on /resources/faqs (from the Terms, Warranty and checkout) */
export const moreFaqGroups: FaqGroup[] = [
  {
    key: "orders",
    label: "Orders & Payment",
    items: [
      { q: "What currency are your prices in?", a: "All prices on our website are in US dollars (USD). Shipping, taxes and duties are confirmed with your order." },
      { q: "How do I buy a part online?", a: "Press Buy Now on a refurbished or exchange unit to add it to your cart, then check out with your shipping details. We confirm stock, shipping and your invoice by email before you pay." },
      { q: "Can I pay by card on the website?", a: "We send payment details with your invoice once your order is confirmed. We accept Visa, Mastercard, American Express, Discover and PayPal." },
      { q: "How does Make an Offer work?", a: "On refurbished units you can type the price you want to pay per unit. We review every offer and reply to accept, counter or decline. No payment is taken with an offer." },
      { q: "How fast do you ship parts?", a: "Usually within 1–2 business days. Some units take 5–10 business days to test, prepare or bring in from our warehouse. We confirm the ship date with your order. Need it sooner? Call or email us: rush handling is available for an extra fee." },
      { q: "Why do new parts show Request a Quote instead of a price?", a: "Prices and lead times for new parts change often, so we confirm them for you. Send the part number and we reply with price and availability." },
    ],
  },
  {
    key: "shipping",
    label: "Shipping & Customs",
    short: "Customs",
    items: [
      { q: "Is shipping free?", a: "Return shipping is free on completed repairs, and we cover outbound shipping on in-stock orders. You can send units to us with any carrier, request a pickup or drop them off in Grand Island, NY." },
      { q: "Which carriers do you use?", a: "FedEx, UPS and DHL. You can also give us your own carrier account number at checkout or on a pickup request." },
      { q: "What do you need for shipments to Canada?", a: "Parts ship from our Grand Island, NY facility, so orders to Canada go through Canadian customs. We prepare the commercial invoice and export paperwork for each shipment." },
      { q: "Who pays duties and brokerage fees?", a: "For shipments between the USA and Canada, duties, taxes and brokerage fees are paid by the receiver unless we agree otherwise." },
      { q: "How should I pack a unit I send you?", a: "Use an anti-static bag, at least 5 cm (2 in) of padding on every side and a strong box. Our How to Ship Us a Unit guide has the full checklist." },
    ],
  },
  {
    key: "warranty",
    label: "Warranty & Returns",
    short: "Returns",
    items: [
      { q: "What warranty do refurbished parts and exchange units have?", a: "Repairs, refurbished parts and exchange units are all covered by our one-year warranty from the date we ship them." },
      { q: "What does the warranty not cover?", a: "Failures caused by incorrect installation, misuse, power surges, water or contamination, faults elsewhere in the machine, or opening of the unit by anyone else. Lost parameters and programs are not covered, so keep a backup." },
      { q: "Can I return a part I ordered by mistake?", a: "Yes, within 14 days of delivery if it is unused and in its original condition and packaging, less a 15% restocking fee. Contact us first for a return authorization." },
      { q: "What cannot be returned?", a: "Repairs, exchange units, custom cables and special-order or sourced parts cannot be returned unless they are faulty." },
    ],
  },
  {
    key: "surplus",
    label: "Selling Surplus",
    short: "Surplus",
    items: surplusFaqs,
  },
  {
    key: "tools",
    label: "Tools & Guides",
    short: "Tools",
    items: [
      { q: "What is the Fault Code Library?", a: "A free library of more than 2,000 servo drive, spindle, AC drive and power supply fault codes from Siemens, Fanuc, Rexroth Indramat, Yaskawa and Allen-Bradley, each explained in plain English with likely causes and safe checks." },
      { q: "What does the Downtime Cost Calculator show?", a: "Enter what an hour of downtime costs you and how long each option takes. It compares a new part, a repair and an exchange unit, and you can download the result as a PDF." },
      { q: "How does the Repair or Replace Advisor work?", a: "Answer five quick questions about your unit and your line. It suggests whether a repair, an exchange or a replacement makes the most sense, and explains why." },
      { q: "Are the tools free?", a: "Yes. All tools and guides are free to use, with no sign-up." },
    ],
  },
];
