import { NextResponse, type NextRequest } from "next/server";
import { findPartNumber, listParts } from "@/lib/parts/repository";
import { canBuyOnline } from "@/lib/parts/rules";
import type { PartSummary } from "@/lib/parts/types";

/* Part Number Checker: what we offer for a part number.
   Returns only what the website already shows (no internal factors). */
const summary = (p: PartSummary) => {
  const sale = p.offers.find(canBuyOnline);
  return {
    slug: p.slug,
    manufacturer: p.manufacturer,
    partNumber: p.partNumber,
    name: p.name,
    image: p.image?.src ?? null,
    refurbished: { price: sale?.condition === "refurbished" ? sale.price : null, stock: null },
    exchange: { price: null },
    newUnit: true,
    repair: true,
    status: null,
  };
};

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ q, exact: false, items: [] });
  const exact = await findPartNumber(q);
  const items = exact.length ? exact : (await listParts({ q, page: 1 })).items;
  return NextResponse.json({ q, exact: exact.length > 0, items: items.slice(0, 6).map(summary) });
}
