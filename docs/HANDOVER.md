# IAR USA website: handover and launch

Prepared Nov 27, 2026 for Gurvin. The same notes are in the shared handover doc.

## Overview

The new IAR USA website is built, tested and ready to launch on **www.servorepairusa.com** from the
**main** branch. The job: put it live on that domain and connect the database so the CMS works.
industrialautomationrepair.com stays IAR's separate Canadian site and is not touched.

| Item | Where |
|---|---|
| Code | GitHub `ArchanP3/iar-site` |
| Live branch | `main` (launch this one) |
| Review branch | `preview` (sample shop, sample data, forms don't save; never launch it) |
| Hosting | Vercel team `iar-website`, project `iar-site` |
| Preview link | https://iar-site-git-preview-iar-website.vercel.app |
| CMS setup guide | `docs/CMS-SETUP.md` |
| Settings list | `.env.example` |

Stack: Next.js 16.4.6 (App Router), React 19, Tailwind 4, Supabase (Postgres), Vercel. The site is
USA only: 3279 Grand Island Blvd, Grand Island, NY 14072. Canada is a parts-shipping destination only.

Already done and tested: all 455 pages load, 8 request forms reach their thank-you pages, checkout
works for US and Canadian addresses, lint and type checks are clean, and no secrets are in the code.

## Step 1: Vercel settings

Vercel's Git integration deploys the repo (push to `main` = production). In the project, check
**Settings → Git → Production Branch = main**, then add these under **Settings → Environment
Variables**, Production only. All are server-only except the two `NEXT_PUBLIC_` Supabase ones and
`NEXT_PUBLIC_SITE_URL`.

| Variable | Needed for | Value |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Required | `https://www.servorepairusa.com` (without it the site tells Google not to index it) |
| `NEXT_PUBLIC_SUPABASE_URL` | Shop, forms | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Shop, forms | Supabase publishable key |
| `DATABASE_URL` | CMS | Transaction pooler string for user `cms_app.<project-ref>` (Step 2) |
| `DATABASE_CA_CERT` | CMS | Contents of the Supabase CA certificate |
| `CMS_SETUP_CODE` | CMS | Long random text, used once to create the first login |
| `CRON_SECRET` | CMS | Long random text for the scheduled jobs |
| `RESEND_API_KEY` | Lead emails | Key from resend.com, with servorepairusa.com verified there as a sending domain |
| `LEADS_EMAIL_TO` | Lead emails | e.g. info@industrialautomationrepair.com (comma-separated for several) |
| `LEADS_EMAIL_FROM` | Optional | Sender; default `IAR Website <leads@servorepairusa.com>` |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Optional | Search Console and GA4 numbers inside the CMS |
| `PAGESPEED_API_KEY` | Optional | Core Web Vitals card on the CMS dashboard |

Leave these **unset**: `NEXT_PUBLIC_SITE_COUNTRY` (one US site), `PREVIEW_NO_DB` (preview only) and
`GOOGLE_PLACES_API_KEY` (the reviews section is switched off for now). Never put the Supabase secret
key or the main database password on Vercel.

## Step 2: Database and CMS

One Supabase project holds the parts catalog, the website requests (leads) and the CMS. Use a new
project for IAR USA. Supabase Pro (about $25/month) gives daily backups. Create it under a company
email. Full detail: `docs/CMS-SETUP.md`.

1. Create the Supabase project and link the repo: `supabase link --project-ref <ref>`.
2. Load every table: `supabase db push` (the migrations in `supabase/migrations`).
3. In the Supabase SQL editor: `alter role cms_app with password '<long random password>';`
4. Download the CA certificate (Project Settings → Database → SSL Configuration) and put its
   contents in `DATABASE_CA_CERT`.
5. Build `DATABASE_URL` from the transaction pooler string with user `cms_app.<project-ref>`, port 6543.
6. Check Supabase → Advisors → Security shows nothing flagged in `cms`.
7. Load the parts catalog: `npm run import -- --dir <folder with products.json and images>` or
   `npm run import:csv -- --dir <folder>` (needs `SUPABASE_SECRET_KEY` in your local `.env.local`
   only). Until parts are loaded, the Shop pages are empty.

Scheduled jobs are in `vercel.json`: a daily SEO scan and clean-up, and daily publishing of
scheduled blog posts. On Vercel Pro, change `/api/cms/publish` to `*/15 * * * *` so scheduled posts
go live within 15 minutes.

## Step 3: No redirects needed

servorepairusa.com is a new domain, so there are no old pages to carry over.
industrialautomationrepair.com keeps running as IAR's Canadian site; leave its DNS and hosting as they
are. (`docs/IAR-REDIRECTS.md` is from an earlier plan and is not used.)

## Step 4: Point the domain at Vercel

1. Vercel → iar-site → Settings → Domains: add `www.servorepairusa.com` and `servorepairusa.com`, and
   set the bare domain to redirect to www (matching `NEXT_PUBLIC_SITE_URL`).
2. At the registrar for servorepairusa.com, add the records Vercel shows on that screen (an A record
   for the bare domain, a CNAME for www).
3. If email will be sent from servorepairusa.com (the Resend sender), add Resend's DNS records too,
   and don't remove any existing email records.
4. Wait for Vercel to show both domains as valid and the SSL certificate as issued, then redeploy
   `main` once so the site picks up `NEXT_PUBLIC_SITE_URL`.

## Step 5: After launch

- [ ] Open `/admin/setup`, enter `CMS_SETUP_CODE` and create the Super Admin. Add the team in
      Users & Activity and turn on two-step sign-in in Site Settings.
- [ ] CMS → Locations: check the address, phone and hours; paste the Google Business Profile link
      once the US profile is ready.
- [ ] CMS → Site Settings: add the social profile links and a default share image.
- [ ] CMS → Tracking & Code: add Google Analytics 4 and the Search Console verification tag.
- [ ] Google Search Console: add servorepairusa.com as a domain property and submit
      `https://www.servorepairusa.com/sitemap.xml`.
- [ ] Send a test from the Contact form: thank-you page, CMS → Leads, and the email alert (then
      mark it Test).
- [ ] Place a test order in the shop: it should reach `/checkout/thank-you` and show in Leads.
- [ ] Open `https://www.servorepairusa.com/robots.txt`: it must allow crawling.
- [ ] Check the Contact page map pin lands on 3279 Grand Island Blvd.

## Later, and good to know

- **Google reviews:** switched off until the new Google Business Profile has real reviews. To turn
  back on: restore the commented lines in `src/app/page.tsx` and `src/app/about/page.tsx`, add the
  Customer Reviews link back in `src/components/Header.tsx`, and set `GOOGLE_PLACES_API_KEY`
  (update the Place ID in `src/lib/googleReviews.ts` to the US profile's).
- **Preview branch:** keeps preview-only changes (sample shop listings, forms that don't save,
  sample reviews). Merge `main` into `preview`, never `preview` into `main`.
- **Lead emails:** sent through Resend's API from `src/lib/requests.ts`; a failed email never loses
  the lead, which is still saved in the CMS.
- **Legal pages:** Terms use New York law and Erie County courts; the owner's lawyer will review
  Terms and Privacy.
- **Content to add over time:** 18 brands show a name instead of a logo; five industry photos are
  older ones.
- **Questions:** Archan for content and business details. The full change history is in the GitHub
  commits.
