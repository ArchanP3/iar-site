import { fullAddress } from "@/lib/contact";
import { readFileSync } from "node:fs";
import path from "node:path";
import { faqGroups, moreFaqGroups } from "@/lib/faqs";
import { allServices, serviceUrl } from "@/lib/services";
import { brands, brandMakes, brandUrl } from "@/lib/brands";
import { brandInQuery } from "@/lib/parts/brandInQuery";
import { listParts, partUrl } from "@/lib/parts/repository";
import { getContact } from "@/lib/cms/business";
import { families, familyUrl } from "@/lib/faultCodes";

/* ------------------------------------------------------------------ */
/*  The assistant's "brain": free, no AI service. It answers only from  */
/*  the website's own content (FAQs, services, brands, parts, fault     */
/*  codes), so it never invents prices, promises or facts.              */
/* ------------------------------------------------------------------ */

export type Action = "repair" | "quote" | "part" | "callback" | "fault" | "contact";
export type Link = { label: string; href: string; note?: string };
export type PartCard = { partNumber: string; manufacturer: string; name: string; href: string };
export type Reply = { text: string[]; links: Link[]; parts: PartCard[]; actions: Action[]; open?: "repair" | "quote" | "callback" };

const STOP = new Set("a an the and or but if of to in on at for with from by is are was were be been do does did can could would should will i me my we our you your it its this that these those what which who how why when where there here have has had any some please hi hello hey thanks thank ok okay get need want just about also not no yes".split(" "));
const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9.\- ]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));
const stem = (w: string) => w.replace(/(ing|ed|es|s)$/, "");

/* ---------- fault codes (the site's public index) ---------- */
type CodeRow = [code: string, title: string, family: string, href: string];
let codeIndex: Map<string, CodeRow[]> | null = null;
function codes() {
  if (codeIndex) return codeIndex;
  codeIndex = new Map();
  try {
    const rows = JSON.parse(readFileSync(path.join(process.cwd(), "public", "fault-code-index.json"), "utf8")) as CodeRow[];
    for (const r of rows) {
      const k = r[0].toUpperCase().replace(/[^A-Z0-9]/g, "");
      codeIndex.set(k, [...(codeIndex.get(k) ?? []), r]);
    }
  } catch {}
  return codeIndex;
}

/* ---------- FAQ + service knowledge ---------- */
type Fact = { q: string; a: string; href?: string; keys: Set<string> };
let facts: Fact[] | null = null;
function knowledge() {
  if (facts) return facts;
  const list: Fact[] = [];
  const add = (q: string, a: string, href?: string) => list.push({ q, a, href, keys: new Set(words(q).map(stem)) });
  for (const g of [...faqGroups, ...moreFaqGroups]) for (const f of g.items) add(f.q, f.a, "/resources/faqs");
  for (const s of allServices) {
    add(s.answerQ, s.answer, serviceUrl(s.slug));
    for (const f of s.faqs ?? []) add(f.q, f.a, serviceUrl(s.slug));
  }
  facts = list;
  return list;
}

function bestFact(msg: string): { f: Fact; score: number } | null {
  const q = words(msg).map(stem);
  if (!q.length) return null;
  let best: Fact | null = null;
  let score = 0;
  for (const f of knowledge()) {
    let s = 0;
    for (const w of q) if (f.keys.has(w)) s += w.length > 5 ? 1.5 : 1;
    const ratio = s / Math.max(3, q.length);
    if (s > score && s >= 1.5 && ratio >= 0.4) { score = s; best = f; }
  }
  return best ? { f: best, score } : null;
}

/* ---------- intents ---------- */
const has = (m: string, re: RegExp) => re.test(m);
const INTENT = {
  repair: /\b(repair|fix|broken|faulty|fault(y)?|not working|dead|failed|failing|burn(t|ed)|smok|send (it|my|in)|rma)\b/,
  quote: /\b(quote|price|pricing|cost|how much|buy|purchase|order|stock|availab)/,
  callback: /\b(call ?back|call me|phone me|ring me|speak|talk to|human|person|agent|someone|technician)\b/,
  whatsapp: /\bwhats ?app\b/,
  turnaround: /\b(how long|turnaround|lead ?time|how fast|urgent|rush|asap|same day|quick)\b/,
  warranty: /\b(warrant|guarantee)/,
  shipping: /\b(ship|shipping|pick ?up|pickup|courier|fedex|ups|dhl|purolator|send (it|my|the))\b/,
  location: /\b(where|location|located|address|mississauga|ontario|visit|drop ?off)\b/,
  hours: /\b(hours|open|closed|weekend|saturday|sunday)\b/,
  email: /\b(e-?mail)\b/,
  hello: /^(hi|hello|hey|good (morning|afternoon|evening))\b/,
  alarm: /\b(alarm|fault|error|code|trip|tripp|alm|err)\b/,
};

/* Common questions answered with a fixed FAQ (matched by its exact question), checked before anything else */
const TOPICS: { re: RegExp; faq: string; link?: Link; action?: Action }[] = [
  { re: /\b(sell|surplus|buy (my|our|used|old)|we have (spare|extra|old))\b/, faq: "Do you buy surplus parts?", link: { label: "Sell your surplus", href: "/sell-surplus" } },
  { re: /\b(how much|cost|price|expensive|cheap)\b.*\b(repair|fix)|\b(repair|fix)\b.*\b(how much|cost|price)\b/, faq: "How much does an industrial repair cost?", action: "repair" },
  { re: /\b(evaluation|diagnos|inspect)\w*\b.*\b(free|cost|charge)|\bfree\b.*\b(evaluation|diagnos|quote)/, faq: "Is the evaluation really free?", action: "repair" },
  { re: /\b(how long|turnaround|lead ?time|how fast|how quick)\b/, faq: "How long does a servo drive or servo motor repair take?", action: "repair" },
  { re: /\b(warrant|guarantee)/, faq: "What warranty comes with a repair?" },
];

/* A token that looks like a fault code: F30001, A.10, AL-16, E7, ALM 21 */
const codeLike = (t: string) => /^([a-z]{1,3}[.\-]?\d{1,5}|\d{3,5})$/i.test(t);
/* A token that looks like a part number: letters + digits, 5+ chars, or with dashes */
const partLike = (t: string) => t.replace(/[^a-z0-9]/gi, "").length >= 5 && /\d/.test(t) && /[a-z]/i.test(t);

export async function think(raw: string): Promise<Reply> {
  const msg = raw.trim().slice(0, 300);
  const m = msg.toLowerCase();
  const out: Reply = { text: [], links: [], parts: [], actions: [] };
  const act = (...a: Action[]) => a.forEach((x) => !out.actions.includes(x) && out.actions.push(x));
  const tokens = msg.split(/[\s,;]+/).filter(Boolean);

  if (!msg) return out;

  /* 0. common questions with a fixed answer */
  let topic = false;
  for (const t of TOPICS) {
    if (!t.re.test(m)) continue;
    const f = knowledge().find((k) => k.q === t.faq);
    if (!f) continue;
    out.text.push(f.a);
    if (t.link) out.links.push(t.link);
    if (t.action) act(t.action);
    topic = true;
    break;
  }

  /* 1. fault codes */
  for (const t of tokens) {
    if (!codeLike(t) && !(partLike(t) && t.replace(/[^a-z0-9]/gi, "").length <= 7)) continue;
    const rows = codes().get(t.toUpperCase().replace(/[^A-Z0-9]/g, "")) ?? [];
    if (!rows.length) continue;
    const brand = brandInQuery(msg).brand?.toLowerCase();
    const hit = rows.filter((r) => !brand || r[2].toLowerCase().includes(brand.split(" ")[0])).slice(0, 3);
    for (const r of hit.length ? hit : rows.slice(0, 3)) out.links.push({ label: `${r[0]}: ${r[1]}`, href: r[3], note: r[2] });
    out.text.push(`I found ${t.toUpperCase()} in our fault code library. Open it for the cause and the checks to try first.`);
    act("repair", "callback");
    break;
  }

  /* 1b. "alarm 9 on my Fanuc": point to that brand's fault code library */
  if (!out.links.length && has(m, INTENT.alarm)) {
    const br = brandInQuery(msg).brand?.toLowerCase().split(" ")[0];
    const fams = families.filter((f) => !br || f.brand.toLowerCase().includes(br) || f.brandSlug.includes(br));
    if (br && fams.length) {
      for (const f of fams.slice(0, 2)) out.links.push({ label: `${f.brand} ${f.series} fault codes`, href: familyUrl(f) });
      out.text.push("Here's our fault code library for that drive. Search the code there for the cause and first checks. If it keeps tripping, we can repair it.");
      act("repair", "callback");
    } else if (!br) {
      out.links.push({ label: "Fault code library", href: "/fault-codes" });
      out.text.push("Type the exact code and the brand (for example \"Siemens F30001\"), or browse the fault code library.");
      act("repair", "callback");
    }
  }

  /* 2. part numbers */
  const { brand, rest } = brandInQuery(msg);
  const pn = tokens.find(partLike);
  if (pn && !out.text.length) {
    const q = brand && rest !== msg ? rest : pn;
    try {
      const { total, ...found } = await listParts({ q, page: 1 });
      const items = found.items.slice(0, 4);
      for (const p of items) out.parts.push({ partNumber: p.partNumber, manufacturer: p.manufacturer, name: p.name, href: partUrl(p.slug) });
      if (items.length) {
        out.text.push(total > items.length ? `Here are the closest matches for ${pn.toUpperCase()} (${total} found).` : `Here's what we have for ${pn.toUpperCase()}.`);
        out.links.push({ label: `See all results for ${pn.toUpperCase()}`, href: `/search?q=${encodeURIComponent(pn)}` });
      } else {
        out.text.push(`${pn.toUpperCase()} isn't listed online yet, but we source and repair far more than we list. Send it as a quote request and we'll check for you.`);
      }
      act("quote", "repair");
    } catch {}
  }

  /* 3. brand mentioned */
  const b = brand ? brands.find((x) => x.name === brand) : undefined;
  if (b && !out.parts.length && !out.text.length) {
    out.text.push(`Yes, we repair ${b.name} ${brandMakes(b)}.`);
    out.links.push({ label: `${b.name} repair`, href: brandUrl(b.slug) });
    act("repair", "quote");
  }

  /* 4. what the visitor wants to do */
  if (has(m, INTENT.hello) && out.text.length === 0 && tokens.length <= 3) out.text.push("Hi! I can find parts, look up fault codes, or start a repair or quote. What do you need?");
  if (has(m, INTENT.repair)) act("repair");
  if (has(m, INTENT.quote) && !/surplus|sell/.test(m)) act("quote");
  if (has(m, INTENT.callback)) act("callback", "contact");
  if (has(m, INTENT.whatsapp)) act("contact");
  if (has(m, INTENT.shipping)) {
    out.links.push({ label: "Request a pickup", href: "/request-pickup" }, { label: "How to pack and ship", href: "/resources/shipping" });
  }
  if (has(m, INTENT.location) || has(m, INTENT.hours) || has(m, INTENT.email)) {
    const contact = await getContact();
    const bits = [`Our repair center is at ${fullAddress(contact)}. Drop-offs are welcome during business hours.`];
    if (contact.hours.length) bits.push(`Hours: ${contact.hours.map(([d, t]) => `${d} ${t}`).join(", ")}.`);
    if (contact.email) bits.push(`Email: ${contact.email}.`);
    out.text.push(bits.join(" "));
    act("contact");
  }

  /* 5. answer from FAQs and service pages */
  const hit = bestFact(msg);
  const wantsForm = has(m, INTENT.repair) || has(m, INTENT.quote) || has(m, INTENT.callback);
  const f = hit && (!wantsForm || hit.score >= 3) ? hit.f : null;
  if (f && !topic && out.text.length < 2 && !out.text.includes(f.a)) {
    out.text.push(f.a);
    if (f.href && !out.links.some((l) => l.href === f.href)) out.links.push({ label: "Read more", href: f.href });
  }

  /* 5b. a clear request with nothing else to say: offer the right form */
  if (!out.text.length) {
    if (has(m, INTENT.callback)) { out.text.push("Sure. Leave your name and number and our team will call you back."); out.open = "callback"; }
    else if (has(m, INTENT.repair)) { out.text.push("We can help. The evaluation is free and no work starts without your approval. Send the details below."); out.open = "repair"; }
    else if (has(m, INTENT.quote)) { out.text.push("Send the part number below and we'll come back with a quote."); out.open = "quote"; }
  }

  /* 6. nothing found: hand over honestly */
  if (!out.text.length && !out.parts.length && !out.links.length) {
    out.text.push("I don't have that answer on the website. Our team can help: send it as a question, or leave your number for a call back.");
    act("callback", "contact");
  }
  if (!out.actions.length) act("repair", "quote");
  out.links = out.links.slice(0, 5);
  return out;
}
