/* ------------------------------------------------------------------ */
/*  How part searches are read. Used by the parts file, the parts       */
/*  database and the search box, so every search behaves the same:      */
/*   - dashes, spaces, dots and slashes are ignored (6SL3120-1TE21 =     */
/*     6sl3120 1te21 = 6SL31201TE21)                                     */
/*   - words can come in any order (siemens tp1200 = tp1200 siemens)     */
/*   - filler words are skipped (repair, price, buy, part …)             */
/*   - if nothing matches, letters often mistaken for digits are        */
/*     tried as digits: O -> 0, I and L -> 1 (6AV2124-OMC01)              */
/* ------------------------------------------------------------------ */

export const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

/** O->0, I/L->1. Applied to both the search and the catalogue, so it stays consistent. */
export const fold = (n: string) => n.replace(/o/g, "0").replace(/[il]/g, "1");

const STOP = new Set([
  "a", "an", "and", "the", "for", "of", "with", "to", "in", "on", "my", "i", "need",
  "repair", "repairs", "part", "parts", "price", "prices", "buy", "sell", "quote", "cost",
  "new", "used", "refurbished", "refurb", "surplus", "exchange", "replacement", "spare", "unit", "number", "pn", "model",
]);

/** The words to match: each one must appear in the part's brand, number, name or description. */
export function tokens(q: string): string[] {
  const words = q.split(/[\s,;|+]+/).map((w) => w.trim()).filter(Boolean);
  // a single long part number with spaces inside ("6SL3120 1TE21 0AA3") is matched as one piece too
  const out = words.map(norm).filter((t) => t && !STOP.has(t));
  return [...new Set(out)];
}

/** True when a word looks like part of a part number (has a digit). Only those get the O/0, I/1 retry. */
export const hasDigit = (t: string) => /\d/.test(t);

/** Every word found in the text (both already normalised). */
export const matchesAll = (hay: string, words: string[]) => words.every((w) => hay.includes(w));

/** Shorter and shorter beginnings of the longest part-number word, to find close matches. */
export function prefixes(q: string, min = 5): string[] {
  const t = tokens(q).filter(hasDigit).sort((a, b) => b.length - a.length)[0];
  if (!t || t.length < min) return [];
  const out: string[] = [];
  for (let n = t.length - 1; n >= min; n -= n > 10 ? 3 : 2) out.push(t.slice(0, n));
  return out;
}
