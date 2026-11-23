import { NextResponse, type NextRequest } from "next/server";
import { think } from "@/lib/assistant/brain";

/* The website assistant: answers from the site's own content. Free, no AI service. */
export async function POST(request: NextRequest) {
  let message = "";
  try {
    const body = await request.json();
    message = String(body?.message ?? "").slice(0, 300);
  } catch {}
  if (!message.trim()) return NextResponse.json({ text: [], links: [], parts: [], actions: [] });
  const reply = await think(message);
  return NextResponse.json(reply, { headers: { "Cache-Control": "no-store" } });
}
