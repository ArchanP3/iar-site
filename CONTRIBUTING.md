# Working on the IAR USA website

This repo is the live site for www.servorepairusa.com. Blog posts, page titles and descriptions,
redirects and landing pages are edited in the CMS at `/admin`, not in code.

## Set up

1. Clone `ArchanP3/iar-site` and run `npm install` (Node 22+).
2. Create `.env.local` from `.env.example`. For front-end work you only need
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Never commit `.env*` files.
3. `npm run dev` → http://localhost:3000.

This is **Next.js 16** with Cache Components. APIs differ from older versions: read the guide in
`node_modules/next/dist/docs/` before using an API you haven't used here, and follow the patterns in
the existing code.

## How a change goes live

1. Branch from `main` (`git switch -c fix/short-name`).
2. Run `npm run lint && npm run typecheck` before pushing.
3. Push and open a pull request. Vercel posts a preview link; check the change on a phone and desktop.
4. Merge into `main`: Vercel deploys it to production. Then merge `main` into `preview` so the review
   site stays current (never merge `preview` into `main`: it has sample data and preview-only settings).

## Rules

- USA spelling and wording. The site is for US customers; Canada is a parts-shipping destination only.
- No new customer-facing claims (warranty, turnaround, pricing) without the owner's sign-off.
- Keep page addresses: a changed or removed page needs a redirect (CMS → Redirects & 404s).
- Real logos and photos only; no placeholder or imitation brand logos.
- No secrets in the code. Server keys go in Vercel's environment variables.
