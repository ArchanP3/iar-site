# AutomIQ CMS: setup and hosting

The CMS lives inside the website at **/admin**. Its data is in a private `cms` schema in the
same Supabase project as the parts catalog, reached by its own limited login (`cms_app`).

Without `DATABASE_URL` the public website works exactly as before (all pages, titles and schema
come from the code) and /admin shows how to connect it. Preview deploys never connect: the CMS
and the tracking tags are off there, and robots.txt blocks crawling.

## 1. Database (once)

1. Push the migrations: `supabase db push` (adds `supabase/migrations/20261028120000_cms_schema.sql`).
   It creates the `cms` schema, the `cms_app` role (no password yet), row level security on every
   CMS table, read access to `public.quote_requests` for the Leads screen, and the request rate limit.
2. In the Supabase SQL editor, give the role a long random password:
   `alter role cms_app with password '<long random password>';`
3. Download the CA certificate: Project Settings → Database → SSL Configuration.

Check in Supabase → Advisors → Security that nothing in `cms` is flagged.

## 2. Environment variables (Vercel → Production only)

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | The **transaction pooler** string, user `cms_app.<project-ref>`, e.g. `postgres://cms_app.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres` |
| `DATABASE_CA_CERT` | The contents of the CA certificate file (the database certificate is always verified) |
| `CMS_SETUP_CODE` | Any long random text; used once to create the Owner account |
| `CRON_SECRET` | Any long random text; Vercel sends it to the scheduled jobs |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Optional: Search Console and GA4 numbers inside the CMS |
| `CMS_CRAWL_ORIGIN` | Optional: the address the SEO scan crawls (defaults to `NEXT_PUBLIC_SITE_URL`) |

Never put the Supabase secret key or the main database password on Vercel: the CMS doesn't need them.

## 3. Turn it on

Deploy, open `https://<site>/admin/setup`, enter the setup code and create the **Super Admin** (stored as role `owner`).
Then: Users & Activity → add people (Super Admin, Admin, SEO Editor, Writer, Viewer), and turn on
"require two-step sign-in" in Site Settings.

## 4. Scheduled jobs (`vercel.json`)

* `/api/cms/publish` every 15 minutes: scheduled posts go live on time (needs Vercel Pro for
  15-minute crons; on Hobby only daily crons run).
* `/api/cms/cron` daily: SEO scan, Google data refresh, and clean-up of old sign-ins, rate-limit
  rows, the 404 log (capped) and activity older than 400 days.

Both need `Authorization: Bearer $CRON_SECRET` (Vercel adds it).

## 5. What the CMS controls on the live site

* Per page: SEO title, description, URL (old URL redirects 301, no chains or loops), canonical,
  index/follow, Open Graph, custom JSON-LD. Page scripts: Owner only.
* Site-wide (Owner only): GTM / GA4 / Search Console / Bing / Clarity / LinkedIn tags and custom
  head/footer code. Everyone with Settings: robots.txt (ignored until the site is live), sitemaps,
  business details, announcement bar, social profiles, share image.
* Redirects (301/302/410, prefix rules, CSV import/export) and a log of missing pages.
  Deleting a published post or landing page answers 410 Gone.
* Sitemaps: `/sitemap.xml` → pages, posts, locations, fault codes, images, and the parts sitemaps.
* Blog posts and landing pages (block builder, city templates, preview, schedule, review).
* Media library: images resized to WebP on upload, stored in the database, cached for a year.
* Leads: the website requests themselves (`public.quote_requests`) with where the visitor came
  from; the CMS keeps status and notes per request. There is no email alert yet.

## 6. Security

* Passwords hashed with scrypt. Sign-in: same message for every failure; only failures count.
  An account locks for 15 minutes after 5 failures from the same network (a stranger elsewhere
  can't lock the Owner out), and a network with 20 failures is blocked for 15 minutes.
* Two-step sign-in (authenticator app): 5 tries per 15 minutes, each code works once.
  Required-two-step and forced password change apply to every action and download.
* Roles: Super Admin (role `owner` in the database), Admin, SEO Editor, Writer, Viewer. An Admin can do everything except see or change Super Admin
  accounts (they're hidden from Admins, and shown as "Super Admin" in the activity list), make anyone
  Super Admin, edit tracking code or page scripts, or change the two-step rule.
  Undo needs the same right as the change it reverses.
* Every change is in the activity log; most can be undone.
* `/admin` is noindex and blocked in robots.txt.

## 7. Backups

Supabase Pro takes daily backups of the whole database, including the `cms` schema and images.
Owners can also download a JSON export (no passwords, sign-in secrets or image data) in Users & Activity.

## 8. Files

| Path | What |
| --- | --- |
| `src/app/admin/` | CMS screens |
| `src/lib/cms/` | Database, auth, settings, SEO, sitemaps, redirects, leads, crawl, Google |
| `src/components/admin/` | CMS UI components |
| `src/components/cms/` | Public-site pieces the CMS feeds (tracking, landing blocks) |
| `src/proxy.ts` | Redirects, changed page URLs and landing pages, before a page renders |
| `supabase/migrations/20261028120000_cms_schema.sql` | Schema, role, policies |
