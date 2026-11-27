# IAR USA Website (www.servorepairusa.com)

The US website of **Industrial Automation Repair Inc. (IAR)**: servo motor, servo drive and industrial
electronics repair from the repair center at 3279 Grand Island Blvd, Grand Island, NY 14072.
Repairs, pickups and on-site service are USA only; parts also ship to Canada and worldwide.

It includes the marketing pages (services, brands, industries, 100 US city pages, fault-code library,
request forms), a parts shop (`/shop`, `/parts`) with cart and checkout (order requests, no online
payment), and a content/SEO CMS at `/admin`.

industrialautomationrepair.com is IAR's separate Canadian site. It is **not** run from this repo.

**Launching or taking over this site? Start with [docs/HANDOVER.md](docs/HANDOVER.md).**

| | |
|---|---|
| Live branch | `main` (production on Vercel) |
| Review branch | `preview` (sample shop and reviews, forms don't save; never launch it) |
| Hosting | Vercel team `iar-website`, project `iar-site` |
| Database | Supabase (Postgres): parts catalog, website requests (leads), CMS |
| CMS setup | [docs/CMS-SETUP.md](docs/CMS-SETUP.md) |
| Settings | [.env.example](.env.example) |

Stack: Next.js 16 (App Router, Cache Components) + TypeScript + Tailwind v4 + React 19, backed by
Supabase, with optional Typesense search. Deploys through Vercel's Git integration: every push to
`main` goes to production, every other branch gets a preview link.

## Quick start

```
npm install
cp .env.example .env.local      # fill in keys (see below)
npm run dev                     # http://localhost:3000
```

To run without a database (like the preview site), set `PREVIEW_NO_DB=1` and use placeholder
Supabase values. That only works on the `preview` branch, which has the sample data.

Other scripts:

| Command | What it does |
|---|---|
| `npm run build && npm start` | Production build / serve |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc --noEmit` |
| `npm run import -- --dir <folder>` | Import products (+ images, fault codes) from `products.json` |
| `npm run import:csv -- --dir <folder>` | Import products from `products.csv` |
| `npm run typesense:sync [-- --reset]` | Push products from Supabase into Typesense |

## Environment variables

See `.env.example`. Summary:

| Variable | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Vercel Production | `https://www.servorepairusa.com`. Canonicals, sitemaps, JSON-LD. Until set, robots.txt blocks crawling. |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + local | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Vercel + local | Publishable key; safe in the browser (row level security). |
| `SUPABASE_SECRET_KEY` | local/scripts only | For imports. Never on Vercel. |
| `DATABASE_URL`, `DATABASE_CA_CERT` | Vercel Production | CMS: the limited `cms_app` login via the Supabase pooler. Unset = CMS off. |
| `CMS_SETUP_CODE`, `CRON_SECRET` | Vercel Production | One-time Super Admin setup; secret for the scheduled jobs. |
| `RESEND_API_KEY`, `LEADS_EMAIL_TO`, `LEADS_EMAIL_FROM` | Vercel Production | Email alert for each new request (Resend). Off until the first two are set. |
| `GOOGLE_PLACES_API_KEY` | optional | Google reviews section (currently switched off in the code). |
| `GOOGLE_SERVICE_ACCOUNT_JSON`, `PAGESPEED_API_KEY` | optional | Search Console / GA4 / Core Web Vitals inside the CMS. |
| `TYPESENSE_*`, `NEXT_PUBLIC_TYPESENSE_SEARCH_KEY` | optional | Leave `TYPESENSE_HOST` blank to use Postgres search. |
| `NEXT_PUBLIC_MEDIA_URL`, `MEDIA_BUCKET` | optional | S3/CloudFront host for part photos, if used instead of Supabase Storage. |
| `NEXT_PUBLIC_SITE_COUNTRY` | leave unset | The site is one US site. |
| `PREVIEW_NO_DB` | preview only | Never set on production. |

## Project layout

```
src/app/
  page.tsx                          Home
  services/, services/[slug]        Repair services (content in src/lib/services.ts)
  brands/, brands/[slug]            Brands we repair (src/lib/brands.ts)
  industries/, industries/[slug]    Industries (src/lib/industries.ts)
  service-areas/, service-areas/[city]
                                    100 US city pages (src/lib/serviceAreas.ts)
  fault-codes/...                   Fault-code library (data: src/data/fault-codes/*.json)
  about/, contact/, international/, on-site-service/, sell-surplus/
  resources/                        Blog, FAQs, glossary, shipping guide, tools
  request-quote/ request-repair/ request-pickup/ request-cable/
                                    Request forms -> Supabase (src/lib/requests.ts); each has /thank-you
  cart/, checkout/, checkout/thank-you
                                    Cart (browser storage) and checkout: places an order request
  (catalog)/shop, (catalog)/parts   Parts catalog and part pages
  admin/                            CMS (docs/CMS-SETUP.md); api/cms/* its scheduled jobs
  sitemap.xml/, sitemaps/, robots.txt/
src/lib/
  contact.ts                        Address, phones, WhatsApp, hours
  site.ts                           Site config (name, URL, indexing rules)
  catalog.ts, parts/                Catalog reads and the part view model
  requests.ts                       Saves every form and order; emails the team (Resend)
  googleReviews.ts                  Google reviews (switched off for now)
  cms/                              CMS: database, auth, settings, SEO, sitemaps, redirects, leads
src/components/                     Site components (iar/ = home-page sections, parts/ = shop)
supabase/migrations/                Schema, row level security, search function, CMS schema
scripts/                            Catalog import and Typesense sync
docs/                               HANDOVER.md, CMS-SETUP.md, us-city-pages.md
```

`/brands/<x>` is the repair page for a brand; `/shop/brands/<x>` is the catalog listing for that
manufacturer.

### Branding

IAR red (`#C8102E`, `#E11D3A`, `#FF3B55`) on near-black and white, Inter for text and Saira for
headings (`src/lib/font.ts`). Logos: `public/iar-logo.png`, `public/iar-logo-white.png`. Share
images: `src/app/opengraph-image.png` and `public/og/`.

## Database (Supabase)

| Object | Purpose |
|---|---|
| `products` | Catalog. `slug` unique; generated `manufacturer_slug`, `category_slug` and search vector. |
| `quote_requests` | Every website request and order (`request_type` = quote, repair, pickup, order, contact…). Shown in CMS → Leads. |
| `manufacturer_facets`, `category_facets` | Counts for brand/category pages. Refresh after imports: `select public.refresh_catalog_facets();` (the import scripts do this). |
| `search_products(q, lim, off)` | Postgres search used when Typesense isn't configured. |
| `cms` schema | CMS data, reached only by the `cms_app` login. |

Anyone can read the catalog and insert requests; nobody can read requests with the public key.
Schema changes: add a file to `supabase/migrations/`, then `supabase db push`.

## Data import

```bash
npm run import -- --dir /path/to/package            # products.json + images + fault codes
npm run import:csv -- --dir /path/to/package --skip-images
```

Both are idempotent (upsert on `slug`) and refresh the facet counts. Until parts are loaded, the
Shop pages are empty. After a large import, redeploy so the parts sitemaps are rebuilt.

## Rendering, caching and SEO

- Catalog reads use `"use cache"`; part pages render on first visit and are then cached.
- Marketing pages set their own titles and JSON-LD (LocalBusiness, FAQ, etc.); catalog titles end in ` | IAR`.
- `/sitemap.xml` lists pages, posts, locations, fault codes and the parts sitemaps.
- Vercel preview deployments and the bare `*.vercel.app` address are never indexed.

## Deploying

Vercel's Git integration deploys this repo: push to `main` = production, any other branch = preview.
The `preview` branch is kept for review with sample data; merge `main` into `preview`, never the
other way. Scheduled jobs are in `vercel.json` (daily SEO scan and clean-up, daily publishing of
scheduled posts; change `/api/cms/publish` to `*/15 * * * *` on a Vercel Pro plan). GitHub Actions
only runs lint and type checks (`.github/workflows/ci.yml`).

## Known gaps

- Google reviews section is switched off until the new US Google Business Profile has reviews
  (see docs/HANDOVER.md to turn it back on).
- Legal pages (`/terms`, `/privacy`, `/warranty`) are waiting for the lawyer's review.
- 18 brands show a name instead of a logo; five industry photos are older ones.
- Request forms: honeypot + rate limit (`public.request_allowed`); no CAPTCHA.
