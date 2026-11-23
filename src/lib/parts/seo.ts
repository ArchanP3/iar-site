import type { Metadata } from "next";
import { clip } from "@/lib/seo";
import { site, SITE_URL } from "@/lib/site";
import { getCategory } from "./categories";
import { partLabel, partUrl } from "./repository";
import { canBuyOnline, WARRANTY } from "./rules";
import { conditionOrder, type Offer, type Part, type PartSummary } from "./types";

/* Titles, descriptions, FAQs and JSON-LD for part pages.
   Content rule: only confirmed company facts (the 12-month repair warranty,
   Canada & USA, pickup) plus the part's own data. No turnaround times, free
   evaluations or prices until they are confirmed. */

const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

/** Conditions in a fixed order: New, Refurbished, Exchange, Repair */
export const offersOf = (p: Pick<PartSummary, "offers">): Offer[] =>
  conditionOrder.flatMap((c) => p.offers.filter((o) => o.condition === c));

export const hasOffer = (p: Pick<PartSummary, "offers">, c: Offer["condition"]) => p.offers.some((o) => o.condition === c);

/** "Siemens 6SL3120-1TE21-0AA3 Servo drive module", without the generic "Repair service" name. */
const fullName = (p: Part) => (p.name === "Repair service" ? partLabel(p) : `${partLabel(p)} ${p.name}`);

export function partTitle(p: Part) {
  // The (catalog) layout appends " | Industrial Automation Repair".
  const base = fullName(p);
  const tail = " Repair & Parts";
  return base.length + tail.length <= 50 ? base + tail : base;
}

export function partDescription(p: Part) {
  return clip(
    `${fullName(p)}. Request a quote for a new, refurbished or exchange unit, or have yours repaired with a ${WARRANTY}. Canada & USA.`,
  );
}

/** Words the CMS title/description templates can use for a part. */
export function partVars(p: PartSummary & { category?: string }): Record<string, string> {
  return {
    brand: p.manufacturer, part_number: p.partNumber, name: p.name, category: (p.category && getCategory(p.category)?.label) || p.category || "", series: "",
    availability: p.offers.some(canBuyOnline) ? "In stock, buy online." : "",
    repair: `Repair with a ${WARRANTY}.`,
  };
}

/** Fill a CMS template like "{brand} {part_number} {name} Repair & Parts". */
export const fillPart = (tpl: string, p: Part) =>
  tpl.replace(/\{([a-z_]+)\}/g, (m, k) => partVars(p)[k] ?? m).replace(/\s+/g, " ").replace(/\s+([.,])/g, "$1").trim();

export function partMetadata(p: Part, tpl?: { title: string; description: string }): Metadata {
  const url = partUrl(p.slug);
  const title = tpl?.title ? fillPart(tpl.title, p) : partTitle(p);
  const description = tpl?.description ? clip(fillPart(tpl.description, p)) : partDescription(p);
  const image = p.images[0];
  return {
    // A CMS pattern is the whole title, as its Google preview shows (no " | IAR…" suffix).
    title: tpl?.title ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: site.name,
      images: image ? [{ url: abs(image.src), alt: image.alt }] : undefined,
    },
  };
}

/** The part's own Q&A from the catalog first, then a few generated from the part data. */
export function partFaqs(p: Part): { q: string; a: string }[] {
  const label = partLabel(p);
  const noun = getCategory(p.category)?.noun ?? "unit";
  const faqs = p.faqs.map((f) => ({ q: f.question, a: f.answer }));
  if (p.description) faqs.unshift({ q: `What is the ${label}?`, a: p.description });
  faqs.push(
    {
      q: `Can I buy a new, refurbished or exchange ${label}?`,
      a: `Send us a quote request for the ${label} and choose the condition you need. We reply with price, condition and availability.`,
    },
    {
      q: `How does an exchange ${label} work?`,
      a: `You send us your failed ${noun} and we supply a replacement unit in exchange. Request a quote and we confirm the price and how the exchange works for this part.`,
    },
    {
      q: `Do you ship to Canada and the USA?`,
      a: "Yes. We serve customers across Canada and the USA, and can arrange a pickup of your unit.",
    },
  );
  // Drop repeated questions (catalog Q&A can overlap the generated ones).
  return faqs.filter((f, i) => faqs.findIndex((x) => x.q.toLowerCase() === f.q.toLowerCase()) === i);
}

/** BreadcrumbList + FAQPage (+ Service when repairable), plus Product for parts with a price to buy online. Built only from real fields. */
export function partJsonLd(p: Part) {
  const url = abs(partUrl(p.slug));
  const sale = offersOf(p).find(canBuyOnline);
  const cat = getCategory(p.category);
  const seller = { "@type": "Organization", name: site.name, url: SITE_URL };
  // Google only accepts Product markup with an offer, review or rating. Quote-only parts have
  // none of these, so they get breadcrumbs + FAQ (+ Service) but no Product block.
  const graph: (Record<string, unknown> | false | undefined)[] = [
    sale && {
      "@type": "Product",
      "@id": `${url}#product`,
      name: fullName(p),
      mpn: p.partNumber,
      ...(p.manufacturer ? { brand: { "@type": "Brand", name: p.manufacturer } } : {}),
      ...(cat ? { category: cat.name } : {}),
      description: p.description ?? partDescription(p),
      ...(p.images.length ? { image: p.images.map((i) => abs(i.src)) } : {}),
      url,
      ...(p.specs.length ? { additionalProperty: p.specs.map(([name, value]) => ({ "@type": "PropertyValue", name, value })) } : {}),
      offers: {
        "@type": "Offer",
        price: sale.price.toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        itemCondition: sale.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/RefurbishedCondition",
        seller,
        url,
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
        { "@type": "ListItem", position: 2, name: "Shop Parts", item: abs("/shop") },
        ...(cat ? [{ "@type": "ListItem", position: 3, name: cat.name, item: abs(`/shop/${cat.slug}`) }] : []),
        { "@type": "ListItem", position: cat ? 4 : 3, name: partLabel(p), item: url },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: partFaqs(p).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];
  if (hasOffer(p, "repair")) {
    graph.push({
      "@type": "Service",
      name: `${partLabel(p)} repair`,
      serviceType: `${cat?.noun ?? "Industrial electronics"} repair`,
      provider: seller,
      areaServed: [
        { "@type": "Country", name: "Canada" },
        { "@type": "Country", name: "United States" },
      ],
      url,
    });
  }
  return { "@context": "https://schema.org", "@graph": graph.filter(Boolean) };
}

/** Safe to put inside <script>: no way to close the tag from data. */
export const jsonLdString = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
