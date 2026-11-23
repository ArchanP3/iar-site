import { brands, brandUrl, brandMakes } from "@/lib/brands";
import { allServices, serviceUrl } from "@/lib/services";
import { industries, industryUrl } from "@/lib/industries";
import { ALIAS } from "@/lib/parts/brandInQuery";
import { norm } from "@/lib/parts/search";

/* Brand, service and industry pages that match what someone typed in a search box,
   so "hsd" or "spindle" finds the right repair page even when no part matches. */
export type PageHit = { kind: "brand" | "service" | "industry"; label: string; note: string; href: string };

type Entry = PageHit & { keys: string[]; exact?: string[] };
let index: Entry[] | null = null;
/* words in brand names that are not brands on their own */
const GENERIC = new Set(["electric", "electronics", "electronic", "motion", "control", "controls", "drives", "drive", "automation", "systems", "motor", "sensors", "and", "the"]);

function entries(): Entry[] {
  if (index) return index;
  const list: Entry[] = [];
  for (const b of brands) {
    const aliases = Object.entries(ALIAS).filter(([, slug]) => slug === b.slug).map(([a]) => a);
    const exact = [b.name, b.slug, ...aliases, ...b.name.split("/")].map(norm).filter((k) => k.length >= 2);
    const parts = b.name.split(/[\s/&]+/).map(norm).filter((k) => k.length >= 3 && !GENERIC.has(k));
    list.push({ kind: "brand", label: `${b.name} repair`, note: brandMakes(b) || b.card, href: brandUrl(b.slug), keys: [...exact, ...parts], exact });
  }
  for (const s of allServices) {
    list.push({ kind: "service", label: s.title, note: s.short, href: serviceUrl(s.slug), keys: [s.title, s.noun, s.slug].map(norm).filter(Boolean) });
  }
  for (const i of industries) {
    list.push({ kind: "industry", label: `${i.name} equipment repair`, note: "Industry", href: industryUrl(i.slug), keys: [i.name, i.slug].map(norm).filter(Boolean) });
  }
  index = list;
  return list;
}

export function matchPages(q: string, limit = 4): PageHit[] {
  const n = norm(q);
  if (n.length < 2) return [];
  const words = q.toLowerCase().split(/[\s,/]+/).map(norm).filter((w) => w.length >= 2);
  const scored: { e: Entry; s: number }[] = [];
  for (const e of entries()) {
    let s = 0;
    for (const k of e.keys) {
      if (k === n) s = Math.max(s, 100);
      else if (k.startsWith(n) && n.length >= 3) s = Math.max(s, 60);
      else if (n.length >= 4 && k.includes(n)) s = Math.max(s, 40);
      else if (words.some((w) => w === k && w.length >= 3)) s = Math.max(s, 50);
      else if (words.some((w) => w.length >= 4 && k.startsWith(w))) s = Math.max(s, 25);
    }
    if (e.kind === "brand" && s < 40) continue; /* "servo motor" is not the brand Servotronix */
    if (s) scored.push({ e, s: s + (e.kind === "brand" ? 5 : 0) });
  }
  return scored
    .sort((a, b) => b.s - a.s || a.e.label.localeCompare(b.e.label))
    .slice(0, limit)
    .map(({ e }) => ({ kind: e.kind, label: e.label, note: e.note, href: e.href }));
}

/* A search that is exactly a brand name ("hsd", "allen bradley") */
export function exactBrand(q: string): PageHit | null {
  const n = norm(q);
  const hit = n.length >= 2 ? entries().find((e) => e.exact?.includes(n)) : undefined;
  return hit ? { kind: hit.kind, label: hit.label, note: hit.note, href: hit.href } : null;
}
