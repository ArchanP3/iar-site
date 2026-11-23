export type ProductCard = {
  id: number;
  slug: string;
  part_number: string;
  title: string | null;
  manufacturer: string | null;
  manufacturer_slug: string | null;
  /** not returned by search results */
  category_slug?: string | null;
  image_url: string | null;
  price: number | null;
  currency: string;
  price_display: string;
  condition: string | null;
  availability: string | null;
  /** units in stock; null = not tracked */
  stock_qty: number | null;
};

export type Product = ProductCard & {
  sku: string | null;
  brand: string | null;
  category: string | null;
  category_slug: string | null;
  breadcrumb: string[] | null;
  description: string | null;
  price_valid_until: string | null;
  rating_value: number | null;
  review_count: number;
  best_rating: number;
  turnaround: string[] | null;
  warranty: string | null;
  tab_specifications: string | null;
  tab_common_faults: { fault: string; detail: string }[];
  tab_repair_process: { step: string; detail: string }[];
  tab_faq: { question: string; answer: string }[];
  images: string[];
  /** "representative" = catalogue photo of the model, not the actual unit */
  image_source: string | null;
  updated_at: string;
};

export type Facet = { slug: string; name: string; product_count: number };

export type Paged<T> = { items: T[]; total: number; page: number; pageCount: number };
