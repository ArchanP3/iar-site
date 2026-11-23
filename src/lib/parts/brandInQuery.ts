import { brands } from "@/lib/brands";
import { norm } from "./search";

/* Finds a brand name inside a search ("siemens 6sl3120-1te21-0aa3"), so the quote form can be
   pre-filled with Manufacturer = Siemens and Part number = 6sl3120-1te21-0aa3. */
export const ALIAS: Record<string, string> = { ab: "allen-bradley", rockwell: "allen-bradley", indramat: "rexroth-indramat", rexroth: "rexroth-indramat", boschrexroth: "rexroth-indramat", sew: "sew-eurodrive", amk: "amk", amkmotion: "amk", elmo: "elmo-motion-control", siebmeyer: "sieb-meyer", lust: "lust-lti", lti: "lust-lti", ltimotion: "lust-lti", hubner: "baumer-hubner", bei: "bei-sensors", vacon: "danfoss", yasnac: "yaskawa", ssd: "parker", stegmann: "sick", teco: "teco", tecowestinghouse: "teco", amc: "advanced-motion-controls", copley: "copley-controls", invertek: "invertek-drives", nord: "nord-drivesystems", baumer: "baumer-hubner", kubler: "kubler", maple: "maple-systems", bwo: "bwo-elektronik" };

export function brandInQuery(q: string): { brand?: string; rest: string } {
  const words = q.trim().split(/\s+/).filter(Boolean);
  for (let len = Math.min(3, words.length); len >= 1; len--) {
    for (let i = 0; i + len <= words.length; i++) {
      const key = norm(words.slice(i, i + len).join(""));
      if (!key) continue;
      const b = brands.find((x) => norm(x.name) === key || norm(x.slug) === key) ?? (ALIAS[key] ? brands.find((x) => x.slug === ALIAS[key]) : undefined);
      if (b) {
        const rest = [...words.slice(0, i), ...words.slice(i + len)].join(" ").trim();
        return { brand: b.name, rest: rest || q.trim() };
      }
    }
  }
  return { rest: q.trim() };
}
