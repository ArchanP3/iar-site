# AutomIQ Automation & Drive Services — Website

Marketing site (repair services, brands, fault-code library, request forms) plus a parts catalog
(`/shop`, `/parts`) of up to 1M+ part numbers, and a content/SEO CMS at `/admin`
(setup: [`docs/CMS-SETUP.md`](docs/CMS-SETUP.md)).

Next.js 16 (App Router) + TypeScript + Tailwind v4, backed by Supabase (Postgres + Storage),
with optional Typesense search. Deploys to Vercel: every merge to `main` goes live. Changes come in
as pull requests reviewed by Claude; see [`CONTRIBUTING.md`](CONTRIBUTING.md).

The marketing pages and the shop/part-page design were imported from the first contractor's
`automiq-website` repo (up to commit `7d8d8fb`; `da2e217` added the CMS); this repo is now the only
source of truth. Later contractor tweaks to the homepage/templates are absorbed by diffing from
`7d8d8fb`. Not taken from that repo: its `db/` folder (RDS/AWS hosting guide, own `cms_*` schema),
the file/postgres parts repositories and importer, FormSubmit sending, customer accounts, and the
ALL CAPS text boxes.

## Quick start

```bash
npm install
cp .env.example .env.local      # fill in keys (see below)
npm run dev                     # http://localhost:3000
```

Other scripts:

| Command | What it does |
|---|---|
| `npm run build && npm start` | Production build / serve |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc --noEmit` |
| `npm run import -- --dir <folder>` | Import products, images and fault codes (see *Data import*) |
| `npm run typesense:sync [-- --reset]` | Push products from Supabase into Typesense |

## Environment variables

See `.env.example`. Summary:

| Variable | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + local | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Vercel + local | Publishable/anon key. Safe in the browser — RLS restricts it. |
| `SUPABASE_SECRET_KEY` | **local/scripts only** | service_role/secret key. Never add to Vercel unless a server-only feature needs it. |
| `SUPABASE_DB_PASSWORD` | local only | For `supabase db push`. |
| `NEXT_PUBLIC_SITE_URL` | Vercel + local | Canonical origin, e.g. `https://www.automiq.com`. Used for canonicals, sitemaps, JSON-LD. |
| `NEXT_PUBLIC_COMPANY_NAME` | Vercel + local | Optional; defaults to `AutomIQ Automation & Drive Services`. Brand name in catalog titles/copy and the import rebrand. |
| `NEXT_PUBLIC_SHOW_RATINGS` | optional | `true` shows the star-rating element. Ratings are **never** emitted as schema.org markup (site-wide static ratings violate Google's review-snippet policy). |
| `TYPESENSE_HOST` / `_PORT` / `_PROTOCOL` | Vercel + local | Leave `TYPESENSE_HOST` blank to use Postgres search. |
| `NEXT_PUBLIC_TYPESENSE_SEARCH_KEY` | Vercel + local | **Search-only** scoped key. |
| `TYPESENSE_ADMIN_KEY` | **local/scripts only** | For `typesense:sync`. |
| `DATABASE_URL` | Vercel **Production** | CMS: the limited `cms_app` login via the Supabase pooler. Unset = CMS off. |
| `DATABASE_CA_CERT` | Vercel Production | Supabase CA certificate; the CMS always verifies the database certificate. |
| `CMS_SETUP_CODE`, `CRON_SECRET` | Vercel Production | One-time Owner setup; secret for the scheduled jobs. See `docs/CMS-SETUP.md`. |

## Project layout

```
src/app/
  page.tsx                          Home (marketing)
  services/, services/[slug]        Repair services
  brands/, brands/[slug]            Brands we repair (curated content in src/lib/brands.ts)
  fault-codes/[brand]/[series]/[code]
                                    Fault-code library (data: src/data/fault-codes/*.json)
  industries/, industries/[slug]    Industries we serve (content in src/lib/industries.ts)
  about/, contact/, international/, on-site-service/, sell-surplus/
  service-areas/, service-areas/[city]
  resources/                        Hub, blog, FAQs, glossary, shipping guide, downtime calculator,
                                    repair-or-replace advisor, part number checker
  warranty/, terms/, privacy/, site-map/
  request-quote/ request-repair/ request-pickup/ request-cable/
                                    Request forms -> Supabase (src/lib/requests.ts)
  cart/, checkout/                  Cart (browser localStorage, src/lib/cart.ts) and checkout: places
                                    an order request; no payment online
  api/part-suggest, api/part-check  Live part search (header) and Part Number Checker
  search/route.ts                   Site search box: exact part number -> part page, else /shop?q=
  api/revalidate/                   POST with x-revalidate-secret (REVALIDATE_SECRET) to refresh caches
  (catalog)/                        Parts catalog; layout adds Header/Footer + title template
    shop/                           All parts + search results (?q=), paginated
    shop/[category]                 Category pages (keyword fallback until data has categories)
    shop/brands/, shop/brands/[slug]
                                    Catalog by manufacturer (DB facets, keyword fallback)
    parts/[slug]                    Part page: gallery, buy box (New/Refurbished/Exchange/Repair:
                                    Buy Now for inventory items, otherwise Request a Quote),
                                    faults, repair process, specs, FAQ, related parts
    parts/sitemap.ts                /parts/sitemap/{n}.xml, 50k parts per file
  admin/                            CMS (docs/CMS-SETUP.md); api/cms/* its scheduled jobs + 404 log
  lp/[slug]                         CMS landing pages (served at their own address by the proxy)
  media/[file]                      CMS image library
  sitemap.xml/, sitemaps/[name]     Sitemap index -> pages, posts, locations, fault codes, images, parts
  robots.txt/                       Default rules or the CMS version; Disallow all until the site is live
  not-found.tsx
  proxy.ts (in src/)                Temporary redirects, CMS redirects, changed page URLs, landing pages
src/lib/
  catalog.ts                        All Supabase catalog reads (cached with "use cache")
  search.ts                         Typesense, falling back to Postgres search_products()
  requests.ts                       Server action: saves every form + checkout orders (re-priced
                                    from the catalog on the server)
  parts/                            Part view model for the shop + part pages:
    repository.ts                     maps catalog rows -> Part (pages call only this)
    categories.ts                     the 12 shop categories (keyword query + title matcher)
    rules.ts                          selling rules: Buy Now for inventory items, quote otherwise
    seo.ts                            part titles, descriptions, FAQs, JSON-LD
  brands.ts, services.ts, faultCodes.ts
                                    Marketing content (static, in code)
  cms/                              CMS: database (private `cms` schema), auth, settings, SEO
                                    overrides, sitemaps, redirects, leads, site scan
  site.ts                           Site config / constants
src/components/                     Marketing components; parts/ = shop + part page components
supabase/migrations/                Schema, indexes, RLS, storage bucket, search function
scripts/                            import-catalog.ts, sync-typesense.ts
```

Note: `/brands/<x>` is the **repair** page for a brand (marketing content); `/shop/brands/<x>` is the
**catalog** listing for that manufacturer.

### Branding

The marketing pages use the AutomIQ Drive Services palette directly (navy `#0B1A3C`, blue `#0066FF`)
and Montserrat (`src/lib/font.ts`). Catalog components use tokens in `src/app/globals.css`
(`bg-brand`, `text-ink`, `border-line`, `bg-cta`…) mapped to the same palette. Logo:
`public/automiq-logo.png`.

## Database (Supabase)

Project: **AutomIQ** (`ilbaoiwfsaarkzcmneqg`, East US / Ohio).

| Object | Purpose |
|---|---|
| `products` | Catalog. `slug` unique; generated `manufacturer_slug`, `category_slug`, and weighted `search` tsvector. Trigram index on `part_number` for partial part-number matches. |
| `fault_codes` | Unused by the site (the fault-code library is JSON in `src/data/`). Holds 25 sample rows. |
| `quote_requests` | Every website request. `request_type` = quote / offer / repair / pickup / cable / order / contact / onsite / surplus / international / whatsapp / chat (email or phone required); contact fields as columns; form-specific fields (pickup address, fault, box sizes…) in `details` (jsonb, capped at 16 KB). |
| `manufacturer_facets`, `category_facets` | Materialized counts for brand/category pages. **Refresh after imports:** `select public.refresh_catalog_facets();` (the import script does this). |
| `search_products(q, lim, off)` | Postgres search used when Typesense isn't configured. |
| Storage bucket `product-images` | Public product photos. |

**RLS:** anyone can read `products` / `fault_codes` / facets; anyone can **insert** into
`quote_requests` but nobody can read it with the public key. View requests in the Supabase dashboard
(Table Editor → `quote_requests`) or with the secret key. All catalog writes need the secret key.

Schema changes: add a file to `supabase/migrations/` then `supabase db push`.

## Data import

```bash
npm run import -- --dir /path/to/frontend-sample-pack            # products + images + fault codes
npm run import -- --dir /path/to/frontend-sample-pack --skip-images
```

Input format is the sample pack's `products.json` (see its `SCHEMA.md`). The import is idempotent
(upserts on `slug`), uploads images to Storage keeping the original filename/case, maps
`tabs.*` → `tab_*` columns, and refreshes the facet views.

**Rebranding:** the sample text came from a third-party site and names that company and its
location. `scripts/import-catalog.ts` (`REBRAND`) rewrites those references to
`NEXT_PUBLIC_COMPANY_NAME`. Extend the list if the production data contains other references.

### Content & claims policy (enforced on import)

Only claims the business has confirmed may appear on product pages:

| Claim | Status |
|---|---|
| 12-month warranty on repaired units | **Confirmed.** Set on every product; the sample's "6-month" text is rewritten. |
| Turnaround times ("5-7 working days", "emergency service") | Not confirmed; dropped. |
| "No-fix, no-fee" FAQ | Not confirmed; dropped. |
| "Significantly lower costs than OEM" | Not confirmed; dropped. |
| Condition / availability ("Refurbished", "In Stock") | Don't apply to repair-service rows; left empty until real inventory data. |

Change the rules in `applyClaimPolicy` / `REBRAND` in the import script and re-run with `--skip-images`.

For the full ~1M catalog, prefer `COPY` / `psql \copy` into a staging table and an
`INSERT … ON CONFLICT (slug) DO UPDATE` over the REST import, then
`select public.refresh_catalog_facets();` and `npm run typesense:sync`.

## Search

- **Typesense** (recommended at 1M rows): set `TYPESENSE_HOST` + `NEXT_PUBLIC_TYPESENSE_SEARCH_KEY`,
  then `npm run typesense:sync -- --reset` once (creates the `products` collection), and re-run after
  each import. Search switches over automatically.
- **Fallback:** Postgres full-text + trigram via `search_products()`.

## Rendering, caching and SEO

- Cache Components are on (`next.config.ts`). All catalog reads use `"use cache"` with `cacheLife("hours")`
  and the `catalog` tag. Only a handful of products are prerendered at build; every other part page
  renders on first visit and is then served from cache — no 1M-page builds.
- After a data import, pages refresh within the hour; for immediate refresh, call
  `revalidateTag("catalog")` from a protected route or redeploy.
- Catalog pages: `<title>` (template from `(catalog)/layout.tsx`), description, canonical, Open Graph.
  Part pages emit JSON-LD `Product` (no `Offer`: no prices yet), `BreadcrumbList`, `FAQPage` and
  `Service`; listings emit `ItemList`. Built in `src/lib/parts/seo.ts`.
- Marketing pages set full titles themselves (no template) plus their own JSON-LD
  (LocalBusiness, ItemList, FAQ, TechArticle). They do not set canonicals yet.
- Sitemaps: `/sitemap.xml` (marketing pages, fault codes with guides, shop landings) and
  `/parts/sitemap/{n}.xml` (50,000 parts each, by id range), all listed in `/robots.txt`.
  The number of part sitemap files is computed at build — **redeploy after large imports**.
- Shop categories / brands with no exact catalog match yet show keyword-search results and are
  `noindex` (see `src/lib/parts/categories.ts` and `src/lib/parts/repository.ts`).
- `/search` only redirects and is disallowed in robots; `/shop?q=` canonicalizes to `/shop`. Vercel preview deployments disallow all crawling.
- Unknown slugs render the 404 page with `noindex`; the status is 200 because the page streams
  (Next.js behaviour with Cache Components). Google treats `noindex` pages correctly.

## Deploying to Vercel

1. Import the GitHub repo in Vercel (framework: Next.js, defaults are fine).
2. Add the env vars marked "Vercel" above (Production + Preview). Set `NEXT_PUBLIC_SITE_URL` to the
   production domain **only at launch**: until it is set, robots.txt disallows all crawling and
   canonicals fall back to the `*.vercel.app` production URL.
3. Deploy, then submit `https://<domain>/robots.txt`'s sitemaps in Google Search Console.

Deploys run from GitHub Actions (`.github/workflows/deploy.yml`) with the Super Admin's Vercel
token, not Vercel's Git integration (`git.deploymentEnabled: false` in `vercel.json`), so
contributors don't need a Vercel seat. Each PR gets a preview (link posted on the PR); each push
to `main` deploys production. The token is the `VERCEL_TOKEN` secret in the `vercel-deploy`
GitHub environment (main only). When it expires, create a new one scoped to the team and replace
the secret. A manual `vercel deploy --prod` still works for emergencies.

Image optimization: product images go through `next/image`. At 1M products, watch Vercel's image
optimization usage; if it gets expensive, switch to a custom `loader` using Supabase image transforms
or serve pre-sized images.

## Known gaps / next steps

- **Data:** sample text and images were sourced from a third-party site; images carry its
  watermark. Production needs owned/licensed images and original copy.
- **Duplicates:** the sample contains ~93 duplicate part numbers (distinct slugs), and manufacturer
  names are inconsistent (`SCHNEIDER` vs `SCHNEIDER ELECTRIC`, several Mitsubishi variants). Normalize
  before the full load.
- **Scale numbers differ** across docs (brief ~1M, SCHEMA.md ~215k, plus 38k inventory). Schema and
  queries are designed for 1M+.
- `category` is empty in the sample, so `/shop/<category>` uses keyword fallback (noindex).
- **Selling model** (`src/lib/parts/rules.ts`): a part is an *inventory item* when its catalog row has
  a USD `price`, `availability` is in stock and `stock_qty` is not 0 (when set, the page shows
  "In stock · N available"). Its condition (New or Refurbished, from `condition`)
  shows the price with Buy Now / Add to Cart; every other option is Request a Quote. No sample part
  has a price yet, so Buy Now appears once inventory is loaded. Checkout saves an `order` request
  (re-priced server-side); the team confirms stock, shipping and invoice before payment.
  Priced items also show **Make an Offer** (opens the quote form in offer mode, saved as an `offer`
  request). Exchange is always by quote. Not imported from the contractor: exchange price at 85% of
  Refurbished, customer accounts (`/account` was a non-working sign-in mockup).
- **Contractor-written legal pages** (`/terms`, `/privacy`, `/warranty`) need review before launch.
- **Marketing claims.** Confirmed by the business (2026-11-01): 12-month warranty, free evaluation,
  jig-tested, 24–72 hr typical turnaround, 24/7 support, rush service after hours and weekends,
  1,000+ brands, test report with every repair, refurbished units usually ship in 1–2 business days,
  exchange units ship 1–2 business days after we receive the unit, and the repair
  centre address, phone/WhatsApp and hours in `src/lib/contact.ts`. "2,000+ codes" is true (2,089 in
  `src/data/fault-codes`). **Still unconfirmed** in imported copy: 20+ years,
  10,000+ manufacturers, "serving customers worldwide" / international orders (part pages and
  JSON-LD still say Canada & USA), 1–2 business-day handling / 5–10 days / rush fee
  (`src/lib/shipping.ts`), walk-in drop-off, on-site service, buying surplus, About-page counters,
  blog/FAQ/glossary copy, the brochure and line card PDFs.
- **Fault-code data provenance**: confirm the source of `src/data/fault-codes/*.json`.
- **Lint debt**: some imported components break React Compiler hook rules (downgraded to warnings in
  `eslint.config.mjs`); fix when touched.
- **Request notifications:** nothing emails the team about new requests yet (the contractor's
  FormSubmit.co sending was not imported). Planned: AWS SES, a team alert to info@ and a receipt to
  the customer. Until then, check the CMS Leads screen. AWS side is set up (account 535714707277,
  everything tagged `Project=automiq`): SES identity `automiqautomation.com` in **us-east-1** (that
  region already has production access), MAIL FROM `mail.automiqautomation.com`; IAM user
  `automiq-site` may only send `*@automiqautomation.com`.
- **Media storage:** S3 bucket `automiqautomation-media` (ca-central-1, private, versioned, old
  versions kept 90 days) behind CloudFront `E21580T56W5W4B` at `media.automiqautomation.com`
  (OAC; direct S3 URLs return 403). `automiq-site` can put/get/delete objects and invalidate the
  distribution. Upload code isn't written yet; CMS uploads still go to Supabase Storage. The WhatsApp buttons and the chat assistant
  save their requests like every other form (`request_type` whatsapp / chat).
- Request forms: honeypot + 10 per network per 10 minutes (`public.request_allowed`); no CAPTCHA.
- **CMS gaps before ad spend:** no conversion event on form success, the Google click ID is stored
  only as yes/no and attribution lasts one browser tab, no cookie consent / Consent Mode v2, no inline
  form block for landing pages. **Blog:** no pagination, category pages or RSS yet.
- **Missing posts/parts answer 200 with `noindex`** (Next.js streams the prerendered shell before
  the page can say "not found"). Deleted published posts and landing pages answer 410 via redirects.
- Deep pagination uses OFFSET; fine for browsing, but very deep pages on 1M rows will be slow.
