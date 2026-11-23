"use client";

import { useEffect } from "react";

/* Tells the CMS which missing address a visitor tried, so it shows in Redirects & 404s. */
export default function NotFoundBeacon() {
  useEffect(() => {
    try {
      const body = JSON.stringify({ path: location.pathname, ref: document.referrer || "" });
      navigator.sendBeacon?.("/api/cms/404", new Blob([body], { type: "application/json" }));
    } catch {}
  }, []);
  return null;
}
