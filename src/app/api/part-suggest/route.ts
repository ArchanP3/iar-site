import { NextResponse, type NextRequest } from "next/server";
import { listParts, partUrl } from "@/lib/parts/repository";
import { canBuyOnline } from "@/lib/parts/rules";
import { matchPages } from "@/lib/siteMatch";

/* Search-as-you-type: up to 7 parts whose number, brand or name contains the text.
   Part numbers that START with the text come first. Price only for inventory items. */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);
  if (norm(q).length < 2) return NextResponse.json({ q, items: [], pages: [] });
  const pages = matchPages(q, 4);
  if (norm(q).length < 3) return NextResponse.json({ q, items: [], total: 0, pages });
  const { items, total } = await listParts({ q, page: 1 });
  const n = norm(q);
  const rank = (pn: string) => (norm(pn).startsWith(n) ? 0 : norm(pn).includes(n) ? 1 : 2);
  const sorted = [...items].sort((a, b) => rank(a.partNumber) - rank(b.partNumber) || a.partNumber.localeCompare(b.partNumber));
  return NextResponse.json(
    {
      q,
      total,
      pages,
      items: sorted.slice(0, 7).map((p) => ({
        href: partUrl(p.slug),
        partNumber: p.partNumber,
        manufacturer: p.manufacturer,
        name: p.name,
        image: p.image?.src ?? null,
        price: p.offers.find(canBuyOnline)?.price ?? null,
        status: null,
      })),
    },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } },
  );
}
