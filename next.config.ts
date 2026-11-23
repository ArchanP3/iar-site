import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" },
      // Part photos and CMS uploads (S3 + CloudFront)
      { protocol: "https", hostname: "media.automiqautomation.com" },
    ],
    // Product photos are immutable once uploaded; cache optimized variants for 30 days.
    minimumCacheTTL: 2592000,
  },
  // CMS uploads (images are shrunk in the browser first; Vercel caps requests at 4.5 MB)
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
    // Put the CSS inside the page so the browser can paint without waiting for extra files
    inlineCss: true,
  },
  // .ca site: one CMS for both country sites, on the .com site (see src/lib/site.ts)
  async redirects() {
    if (process.env.NEXT_PUBLIC_SITE_COUNTRY?.trim().toUpperCase() !== "CA") return [];
    const us = (process.env.NEXT_PUBLIC_US_SITE_URL || "https://automiqautomation.com").replace(/\/$/, "");
    return [
      { source: "/admin", destination: `${us}/admin`, permanent: false },
      { source: "/admin/:path*", destination: `${us}/admin/:path*`, permanent: false },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
