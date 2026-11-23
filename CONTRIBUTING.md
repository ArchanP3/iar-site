# Working on the AutomIQ website

This repo **is** the live site: https://automiqautomation.com. Work here only (not in a copy
or another repo). Blog posts, page titles/descriptions, redirects and landing pages are edited
in the CMS at `/admin` by the SEO team, not in code.

## Access you get

| You get | You don't get (not needed for frontend work) |
|---|---|
| Write access to this repo | Supabase secret key, database password |
| `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Vercel, Supabase or AWS accounts |
| Preview links for every PR | The CMS (ask the owner for an account if you need one) |

The publishable key can only **read** the catalog and **insert** requests (enforced by the
database). Schema or data changes go through the owner.

## Set up

1. Clone `Groovez2020/automiq` and run `npm install` (Node 22+).
2. Create `.env.local` with the two values the owner sends you privately:
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Nothing else is needed;
   never commit `.env*` files. The CMS (`/admin`) is off locally, which is expected.
3. `npm run dev` → http://localhost:3000.

This is **Next.js 16** with Cache Components. APIs differ from older versions: read the guide in
`node_modules/next/dist/docs/` before using an API you haven't used here, and follow the
patterns in the existing code.

## How a change goes live

1. Branch from `main` (`git switch -c fix/short-name`). You can't push to `main` directly.
2. Push and open a pull request. Open it as a **Draft** while you're still working: drafts get a
   preview link but no review.
3. Click **Ready for review**. Three checks run:
   - **check**: lint and type check (`npm run lint && npm run typecheck`; run them locally first).
   - **preview**: builds a preview site on Vercel and posts the link on the PR (updated on every
     push). Check your change there on a phone and desktop. If the build fails, the Vercel build
     log is in this check's log on GitHub; you don't need a Vercel account.
   - **claude-review**: Claude reviews the change and comments on the PR.
4. If all three pass, the PR **merges by itself and goes live** in about two minutes.
   If Claude asks for changes, push a fix to the same branch; it's reviewed again.

Changes to some files also need the owner's approval before they can merge (listed in
`.github/CODEOWNERS`): the database, the admin area and leads, request forms, prices and the
cart, server endpoints, dependencies, build settings and the review workflow itself. Keep those
in a separate PR from page/design work so the rest isn't held up. The owner merges those PRs.

## Rules the review checks

- No new or changed customer-facing claims (prices, warranty, turnaround, stock, years, customer
  counts) unless the owner has confirmed them in writing.
- No secrets, no new third-party scripts, iframes, trackers or external calls. Tracking tags are
  managed in the CMS.
- Keep SEO intact: titles, descriptions, canonicals, and a redirect for any changed URL.
- Accessible: alt text on images, labels on inputs and buttons, keyboard-friendly.
- Works at 375px wide and on desktop. Use `next/image` for images.
- One purpose per PR, described in the PR text. Ask before adding a dependency.

## Conventions

- **Next.js 16 with Cache Components.** APIs differ from older Next versions. Check
  `node_modules/next/dist/docs/` (see `AGENTS.md`). In particular:
  - `params` / `searchParams` are Promises. Await them inside a `<Suspense>` boundary.
  - Shop and part pages read parts through `src/lib/parts/repository.ts`, which uses
    `src/lib/catalog.ts` (`"use cache"` + `cacheLife`). Don't call
    Supabase directly from components.
  - Don't use `export const revalidate` / `dynamic`. They don't apply with Cache Components.
- **Styling:** match the AutomIQ Drive Services look (navy `#0B1A3C`, blue `#0066FF`, Montserrat via
  `src/lib/font.ts`). In catalog code use the tokens from `src/app/globals.css` (`bg-brand`,
  `text-ink`, `border-line`, `bg-cta`…) rather than raw hex values.
- **Layouts:** catalog pages get Header/Footer from `src/app/(catalog)/layout.tsx`; marketing pages
  render `<Header />` / `<Footer />` themselves. Don't add a header to the root layout.
- **Titles:** catalog pages return a short `title` (the layout appends " | AutomIQ Drive Services");
  marketing pages set the full title.
- **Forms:** request forms submit through `useSend()` → `submitServiceRequest` (`src/lib/requests.ts`).
  New form fields are saved automatically (into `details`); no backend change needed.
- **SEO is a requirement, not polish:** keep `generateMetadata` (title/description/canonical),
  JSON-LD, breadcrumbs and sitemaps working on every page you touch. Product content must stay
  server-rendered (no client-only fetching of product data).
- **Performance:** use `next/image` with `sizes`; keep client components small (`"use client"`
  only where interaction is needed); never load the catalog client-side.
- **Mobile first:** check every page at 375px width.
- **Secrets:** never commit `.env*` files or keys. Only `NEXT_PUBLIC_*` values may reach the browser.

## Content rules

- Don't add or change claims about warranty, turnaround, pricing, stock, certifications or OEM
  relationships without written sign-off from the owner. See README → "Content & claims".
- Product photos and data come from the owner's catalog imports (`scripts/`); don't hand-edit
  catalog content in code.

## Testing forms

Forms on preview sites save real requests, marked **Test** in the CMS Leads screen. Forms sent
from your own machine (`npm run dev`) are **not** marked, so test those with obviously fake details
(name "TEST", email `test@example.test`).

## If something breaks on the live site

Tell the owner straight away. Vercel can roll back to the previous version in one click while the
fix goes through a normal PR.
