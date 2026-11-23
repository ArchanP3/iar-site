import "server-only";
import { Marked } from "marked";
import sanitizeHtml from "sanitize-html";

/* Blog posts are written in Markdown in the CMS. This turns them into safe HTML,
   gives every H2/H3 an id (for the table of contents) and opens external links in a new tab. */

const slug = (s: string) => s.toLowerCase().replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

export function renderMarkdown(md: string): { html: string; toc: { id: string; text: string; level: number }[] } {
  const toc: { id: string; text: string; level: number }[] = [];
  const used = new Set<string>();
  const m = new Marked({ gfm: true, breaks: false });
  m.use({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const lvl = Math.min(Math.max(depth, 2), 4); // the post title is the only H1
        let id = slug(text) || `section-${toc.length + 1}`;
        while (used.has(id)) id += "-2";
        used.add(id);
        if (lvl <= 3) toc.push({ id, text: text.replace(/<[^>]+>/g, ""), level: lvl });
        return `<h${lvl} id="${id}">${text}</h${lvl}>`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const ext = /^https?:\/\//.test(href) && !/automiqautomation\.com/.test(href);
        return `<a href="${href}"${title ? ` title="${title}"` : ""}${ext ? ' target="_blank" rel="noopener"' : ""}>${text}</a>`;
      },
      image({ href, title, text }) {
        return `<figure><img src="${href}" alt="${text}" loading="lazy"${title ? ` title="${title}"` : ""} />${title ? `<figcaption>${title}</figcaption>` : ""}</figure>`;
      },
    },
  });
  const raw = m.parse(md || "", { async: false }) as string;
  const html = sanitizeHtml(raw, {
    allowedTags: ["h2", "h3", "h4", "p", "br", "hr", "strong", "em", "del", "a", "ul", "ol", "li", "blockquote", "code", "pre", "table", "thead", "tbody", "tr", "th", "td", "img", "figure", "figcaption", "span"],
    allowedAttributes: { a: ["href", "title", "target", "rel"], img: ["src", "alt", "title", "loading"], h2: ["id"], h3: ["id"], h4: ["id"], th: ["align"], td: ["align"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
  });
  return { html, toc };
}

export const plainText = (md: string) => md.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[#>*_`~|-]+/g, " ").replace(/\s+/g, " ").trim();
