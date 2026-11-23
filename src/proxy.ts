import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { countHit, landingRoute, routes } from "@/lib/cms/routing";
import { areaHere, areaHref, getArea } from "@/lib/serviceAreas";
import { COUNTRY_SITES, SITE_COUNTRY } from "@/lib/site";

/* Temporary redirects for pages that are not built yet, so menu and footer links
   never land on a 404. Delete a line here when its real page goes live. */
const temporary: [prefix: string, to: string][] = [
  ["/shop/categories", "/shop"],
];

/* Order: temporary redirects -> other country's city pages -> CMS redirects -> changed page URLs -> CMS landing pages. */
export async function proxy(request: NextRequest, event: NextFetchEvent) {
  return withVisitorCountry(request, await route(request, event));
}

async function route(request: NextRequest, event: NextFetchEvent) {
  const raw = request.nextUrl.pathname;
  // Never touch files (photos like /industries/automotive.jpg, icons, PDFs)
  if (/\.[a-z0-9]+$/i.test(raw)) return NextResponse.next();

  const hit = temporary.find(([prefix]) => raw === prefix || raw.startsWith(prefix + "/"));
  if (hit) return go(request, hit[1], 307);

  const path = raw.length > 1 ? raw.replace(/\/+$/, "").toLowerCase() : raw;
  if (path.startsWith("/lp/")) {
    let to = "/";
    try {
      to = "/" + decodeURIComponent(path.slice(4));
    } catch {} // malformed address: send to the home page instead of failing
    return go(request, to, 301);
  }

  // .ca and .com: a city page lives on its own country's site only (see src/lib/site.ts)
  const city = path.match(/^\/service-areas\/([^/]+)$/)?.[1];
  const area = city ? getArea(city) : undefined;
  if (area && !areaHere(area)) return go(request, areaHref(area), 301);

  const r = await routes();
  const red = r.exact.get(path) ?? r.prefix.find((p) => path === p.from || path.startsWith(p.from + "/"));
  if (red && (!red.expires || red.expires > Date.now())) {
    event.waitUntil(countHit(red.id));
    if (red.code === 410) return new NextResponse("Gone", { status: 410, headers: { "content-type": "text/plain" } });
    const to = red.prefix && red.to && !/^https?:/.test(red.to) ? red.to + path.slice(red.from.length) : red.to || "/";
    return go(request, to, red.code === 302 || red.code === 307 ? red.code : 301);
  }

  const real = r.alias.get(path);
  if (real) return rewrite(request, real);
  if (r.landing.has(path)) return rewrite(request, landingRoute(path));
  const there = r.elsewhere.get(path); // CMS landing page set to the other country site only
  if (there) return go(request, `${COUNTRY_SITES[there]}${path}`, 301);
  return NextResponse.next();
}

/* .ca / .com: nobody is redirected by location (Google advises against it). The visitor's country
   goes into a cookie instead, and src/components/CountrySuggest.tsx shows a bar suggesting the
   other site to visitors on the "wrong" one. Not httpOnly: the bar reads it in the browser. */
function withVisitorCountry(request: NextRequest, res: NextResponse) {
  if (!SITE_COUNTRY) return res;
  const from = request.headers.get("x-vercel-ip-country");
  if (from && /^[A-Z]{2}$/.test(from) && request.cookies.get("visitor_country")?.value !== from) {
    res.cookies.set("visitor_country", from, { maxAge: 60 * 60 * 24, path: "/", sameSite: "lax", secure: true });
  }
  return res;
}

/* Redirects keep the visitor's query string (gclid, utm_* ...) so ad clicks stay attributed;
   parameters written in the redirect target win. */
function go(request: NextRequest, to: string, code: number) {
  const url = /^https?:\/\//.test(to) ? new URL(to) : new URL(to, request.nextUrl.origin);
  request.nextUrl.searchParams.forEach((v, k) => {
    if (!url.searchParams.has(k)) url.searchParams.append(k, v);
  });
  return NextResponse.redirect(url, code);
}

function rewrite(request: NextRequest, to: string) {
  const url = request.nextUrl.clone();
  url.pathname = to;
  return NextResponse.rewrite(url);
}

export const config = {
  // Every page, but not Next.js files, API routes, the CMS or files with an extension
  matcher: ["/((?!_next/|api/|admin|.*\\.[a-zA-Z0-9]+$).*)"],
};
