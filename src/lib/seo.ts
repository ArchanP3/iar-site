/* Meta descriptions: Google shows about 155-160 characters, so cut longer text at a word. */
export function clip(text: string, max = 158): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), 40)).replace(/[\s,;:.(–-]+$/, "") + "…";
}

/* Add a closing line only when it still fits. */
export function withTail(base: string, tail: string, max = 158): string {
  const b = base.replace(/\s+/g, " ").trim();
  return b.length + tail.length + 1 <= max ? `${b} ${tail}` : clip(b, max);
}

/* Titles: Google shows about 60 characters. Long titles drop their middle " | " parts first
   (keeping the main words and the brand), then cut the main part at a word. */
export function fitTitle(title: string, max = 60): string {
  const t = title.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const parts = t.split(" | ");
  while (parts.length > 2 && parts.join(" | ").length > max) parts.splice(parts.length - 2, 1);
  let out = parts.join(" | ");
  if (out.length <= max) return out;
  const tail = parts.length > 1 ? ` | ${parts[parts.length - 1]}` : "";
  const head = parts.length > 1 ? parts.slice(0, -1).join(" | ") : out;
  const room = max - tail.length;
  if (room < 25) return clipTitle(head, max);
  out = clipTitle(head, room) + tail;
  return out;
}
function clipTitle(s: string, max: number) {
  if (s.length <= max) return s;
  // Prefer ending at a natural break: "Topic: detail" (if the topic is 25+ characters) or a comma
  const colon = s.indexOf(": ");
  if (colon >= 25 && colon <= max) return s.slice(0, colon);
  const comma = s.slice(0, max + 1).lastIndexOf(", ");
  if (comma >= max * 0.6) return s.slice(0, comma);
  const cut = s.slice(0, max + 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), 20)).replace(/[\s,;:(–-]+$/, "");
}
