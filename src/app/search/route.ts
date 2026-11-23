import { NextResponse, type NextRequest } from "next/server";
import { findPartNumber, listParts, partUrl } from "@/lib/parts/repository";
import { brandInQuery } from "@/lib/parts/brandInQuery";
import { exactBrand } from "@/lib/siteMatch";

/* Every site search box sends people here:
   exact part number  -> that part's page
   anything matching  -> Shop Parts results
   nothing found      -> Request a Quote with the part (and brand) filled in,
                         plus close matches from our catalogue */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = (params.get("q") ?? params.get("part") ?? "").trim().slice(0, 80);
  const go = (path: string) => NextResponse.redirect(new URL(path, request.url), 303);
  if (!q) return go("/shop");

  const exact = await findPartNumber(q);
  if (exact.length === 1) return go(partUrl(exact[0].slug));
  if (exact.length > 1) return go(`/shop?q=${encodeURIComponent(q)}`);

  const { total, items } = await listParts({ q, page: 1 });
  if (total === 1 && items[0]) return go(partUrl(items[0].slug));
  if (total > 0) return go(`/shop?q=${encodeURIComponent(q)}`);
  // Just a brand name ("hsd"): that brand's repair page
  const b = exactBrand(q);
  if (b) return go(b.href);
  // Nothing online: open the quote form already filled in (brand split out when typed)
  const { brand, rest } = brandInQuery(q);
  return go(`/request-quote?${new URLSearchParams({ part: rest, ...(brand ? { brand } : {}), from: "search", q })}`);
}
