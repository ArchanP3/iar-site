"use client";

import { useEffect } from "react";

/* Opening a part from a long list used to land on the footer: the part streams in after the
   page has already been scrolled. This puts a newly opened part at the top (photo first).
   Back/Forward keeps the browser's own scroll position, and #links still jump to their section.

   Back/Forward is decided per navigation: the popstate time is recorded, and only a part page
   that mounts right after it counts as Back/Forward. A later link click never matches, even if
   the visitor pressed Back on a page without this component (e.g. the shop list). */
const HISTORY_WINDOW_MS = 1500;
let lastPopstate = 0;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    lastPopstate = Date.now();
  });
}

export default function ScrollTopOnOpen({ id }: { id: string }) {
  useEffect(() => {
    const fromHistory = Date.now() - lastPopstate < HISTORY_WINDOW_MS;
    lastPopstate = 0;
    if (fromHistory || window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [id]);
  return null;
}
