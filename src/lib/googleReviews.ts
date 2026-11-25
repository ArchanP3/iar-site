import { cacheLife } from "next/cache";

/* ------------------------------------------------------------------ */
/*  IAR's Google reviews, read live from the Google Places API (New). */
/*  Settings (Vercel → Settings → Environment Variables, server only):  */
/*    GOOGLE_PLACES_API_KEY  Places API key (Google Cloud, billing on)  */
/*    IAR_GOOGLE_PLACE_ID    optional, overrides PLACE_ID below          */
/*    IAR_GOOGLE_PROFILE_URL optional: the profile's Google Maps link   */
/*  Google's terms: show reviews as returned (no editing or filtering), */
/*  with Google attribution, and link back to Google.                  */
/*  Read at most once a day ("use cache" + cacheLife("days")).          */
/* ------------------------------------------------------------------ */

/** Year IAR was established (owner, Nov 2026). */
export const FOUNDED = 2008;

export type GoogleReview = {
  author: string;
  authorUrl?: string;
  photo?: string;
  rating: number;
  text: string;
  when: string;
};

export type GoogleReviews = {
  rating: number;
  count: number;
  url: string;
  reviews: GoogleReview[];
};

const NAME = "Industrial Automation Repair Inc.";
/** Share link to IAR's Google Business Profile (owner, Nov 2026). */
const PROFILE_URL = "https://share.google/Y64ld1uIo1cChbPeU";
/** Place ID of IAR's Google Business Profile (owner, Nov 2026). Not secret; the IAR_GOOGLE_PLACE_ID setting overrides it. */
const PLACE_ID = "ChIJf0c5Arw4K4gRBHR5a_Iq8s0";

/** Link to the Google profile: the IAR_GOOGLE_PROFILE_URL setting if set, else the profile's share link. */
export function googleProfileUrl(): string {
  return process.env.IAR_GOOGLE_PROFILE_URL || PROFILE_URL || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(NAME)}`;
}

type PlacesReview = {
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  relativePublishTimeDescription?: string;
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
};

/** Rating, review count and up to 5 reviews, or null when not configured or Google can't be reached. */
export async function getGoogleReviews(): Promise<GoogleReviews | null> {
  "use cache";
  cacheLife("days");
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const id = process.env.IAR_GOOGLE_PLACE_ID || PLACE_ID;
  if (!key || !id) return null;
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=en`, {
      headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri" },
    });
    if (!res.ok) {
      console.error("Google reviews: Places API returned", res.status);
      return null;
    }
    const p = (await res.json()) as { rating?: number; userRatingCount?: number; googleMapsUri?: string; reviews?: PlacesReview[] };
    if (!p.rating || !p.userRatingCount) return null;
    return {
      rating: p.rating,
      count: p.userRatingCount,
      url: process.env.IAR_GOOGLE_PROFILE_URL || PROFILE_URL || p.googleMapsUri || googleProfileUrl(),
      reviews: (p.reviews ?? [])
        .map((r) => ({
          author: r.authorAttribution?.displayName ?? "Google user",
          authorUrl: r.authorAttribution?.uri,
          photo: r.authorAttribution?.photoUri,
          rating: r.rating ?? 0,
          text: r.text?.text ?? r.originalText?.text ?? "",
          when: r.relativePublishTimeDescription ?? "",
        }))
        .filter((r) => r.text),
    };
  } catch (e) {
    console.error("Google reviews: request failed", e);
    return null;
  }
}
