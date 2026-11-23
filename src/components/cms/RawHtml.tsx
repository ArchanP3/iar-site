"use client";

import { useEffect } from "react";

/* Adds HTML snippets saved in the CMS (tracking tags, verification meta tags, custom scripts)
   to the page head or body after it loads, so they run without slowing the first paint. */
export default function RawHtml({ html, where = "body", id }: { html: string; where?: "head" | "body"; id: string }) {
  useEffect(() => {
    if (!html.trim()) return;
    const host = where === "head" ? document.head : document.body;
    const tpl = document.createElement("template");
    tpl.innerHTML = html;
    const added: Node[] = [];
    for (const node of Array.from(tpl.content.childNodes)) {
      let n: Node = node;
      if (node instanceof HTMLScriptElement) {
        const s = document.createElement("script");
        for (const a of Array.from(node.attributes)) s.setAttribute(a.name, a.value);
        s.text = node.text;
        n = s;
      }
      if (n instanceof Element) n.setAttribute("data-cms", id);
      host.appendChild(n);
      added.push(n);
    }
    return () => added.forEach((n) => n.parentNode?.removeChild(n));
  }, [html, where, id]);
  return null;
}
