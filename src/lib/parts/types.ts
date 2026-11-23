/* ------------------------------------------------------------------ */
/*  Part view model. Pages and components read only these types;       */
/*  src/lib/parts/repository.ts builds them from the Supabase catalog. */
/* ------------------------------------------------------------------ */

export type Condition = "new" | "refurbished" | "exchange" | "repair";

export const conditionOrder: Condition[] = ["new", "refurbished", "exchange", "repair"];

export const conditionLabel: Record<Condition, string> = {
  new: "New",
  refurbished: "Refurbished",
  exchange: "Exchange",
  repair: "Repair",
};

/** One way to get the part. An offer with a price can be bought online (see rules.ts); without one it is quote-only. */
export type Offer = {
  condition: Condition;
  /** USD per unit. Set only for inventory items we have in stock. */
  price?: number;
  /** units in stock, when the catalog tracks it */
  stock?: number;
  warranty?: string;
};

export type PartImage = {
  src: string;
  alt: string;
  /** true = category illustration, not a photo of this exact unit */
  generic?: boolean;
};

/** What a shop tile needs. */
export type PartSummary = {
  /** PartCategory slug: the catalog's category, or a guess from the title */
  category?: string;
  id: number;
  /** URL key from the catalog (products.slug) */
  slug: string;
  manufacturer: string;
  manufacturerSlug: string | null;
  partNumber: string;
  name: string;
  image?: PartImage;
  offers: Offer[];
};

export type Part = PartSummary & {
  description?: string;
  images: PartImage[];
  specs: [label: string, value: string][];
  faults: { fault: string; detail: string }[];
  repairProcess: { step: string; detail: string }[];
  /** Q&A from the catalog row (already filtered by the import's claims policy) */
  faqs: { question: string; answer: string }[];
  /** /services/<slug> repair page for this kind of unit */
  serviceSlug?: string;
  updatedAt: string;
};

export type PartQuery = {
  /** PartCategory slug */
  category?: string;
  /** manufacturer slug (/shop/brands/<slug>) */
  manufacturer?: string;
  /** brand display name, used for keyword search when the catalog has no exact manufacturer match */
  manufacturerName?: string;
  q?: string;
  page?: number;
};

export type PartList = {
  items: PartSummary[];
  total: number;
  page: number;
  pageCount: number;
  /** false = keyword-search fallback (no real category/brand match): keep the page out of the index */
  exact: boolean;
};
