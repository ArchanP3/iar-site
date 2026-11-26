import { ArrowUpRight } from "lucide-react";
import ReviewSlider, { Stars } from "./ReviewSlider";
import { brandFont } from "@/lib/font";
import { FOUNDED, getGoogleReviews, googleProfileUrl, type GoogleReviews as Reviews } from "@/lib/googleReviews";

/* PREVIEW BRANCH ONLY: placeholder reviews so the slideshow can be seen before the Google key is added. Clearly labelled as samples. */
const SAMPLE: Reviews = {
  rating: 5, count: 5, url: googleProfileUrl(),
  reviews: [
    { author: "Sample reviewer", rating: 5, when: "Preview only", text: "Sample review for the preview. Your real Google reviews will appear here, one at a time, once the Google key is added." },
    { author: "Sample reviewer", rating: 5, when: "Preview only", text: "Second sample slide. Reviews change every 7 seconds, and visitors can use the arrows, the dots or swipe on a phone." },
    { author: "Sample reviewer", rating: 5, when: "Preview only", text: "Third sample slide. Long reviews get a Read more link that opens the full text right here on the page, so nobody has to leave the site to read it. ".repeat(3).trim() },
  ],
};

/* "Trusted since 2008" + live Google reviews (src/lib/googleReviews.ts).
   Until the Places API key and Place ID are set, it shows the history line and a link to the Google profile. */


export default async function GoogleReviews({ tone = "light", embedded = false }: { tone?: "light" | "white"; embedded?: boolean }) {
  const live = await getGoogleReviews();
  const sample = !live && process.env.PREVIEW_NO_DB === "1";
  const data = live ?? (sample ? SAMPLE : null);
  const url = data?.url ?? googleProfileUrl();

  return (
    <section aria-labelledby="reviews-heading" className={embedded ? "rounded-[28px] border border-[#EAEAEC] bg-white p-7 sm:p-10" : `${brandFont.className} ${tone === "white" ? "bg-white" : "bg-[#F7F7F8]"} py-12 lg:py-16`}>
      <div className={embedded ? "" : "mx-auto max-w-360 px-5 sm:px-8 lg:px-12"}>
        <div className="grid items-end gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B30E29] sm:text-[12px]">
              <span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#C8102E] to-[#FF3B55]" />
              Customer reviews
            </p>
            <h2 id="reviews-heading" className="mt-3 text-[28px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#131316] sm:text-[34px]">
              Trusted by manufacturers{" "}
              <span className="bg-linear-to-r from-[#C8102E] to-[#FF3B55] bg-clip-text text-transparent">since {FOUNDED}</span>
            </h2>
            <p className="mt-3 max-w-180 text-[15px] leading-[1.7] text-[#4A4A55]">
              Industrial Automation Repair has repaired servo motors, drives and industrial electronics for manufacturers since {FOUNDED}.
              Here is what our customers say.
            </p>
          </div>

          {data ? (
            <div className="flex items-center gap-4 rounded-[22px] border border-[#EAEAEC] bg-white p-5 shadow-[0_24px_50px_-40px_rgba(19,19,22,0.55)] sm:p-6">
              <span className="text-[44px] font-extrabold leading-none text-[#131316]">{data.rating.toFixed(1)}</span>
              <div>
                <Stars value={data.rating} size={18} />
                <p className="mt-1 text-[13.5px] text-[#5A5A66]">Based on {data.count.toLocaleString("en-US")} Google reviews</p>
              </div>
            </div>
          ) : (
            <a href={url} target="_blank" rel="noopener" className="group flex items-center justify-between gap-5 rounded-[22px] border border-[#EAEAEC] bg-white p-5 shadow-[0_24px_50px_-40px_rgba(19,19,22,0.55)] transition hover:border-[#C8102E]/40 sm:p-6">
              <div>
                <p className="text-[18px] font-extrabold text-[#131316]">Established in {FOUNDED}</p>
                <p className="mt-1 text-[13.5px] text-[#5A5A66]">Read our customer reviews on Google</p>
              </div>
              <span className="inline-flex h-11 flex-none items-center gap-2 rounded-xl bg-[#131316] px-4 text-[13.5px] font-semibold text-white transition group-hover:bg-[#C8102E]">
                View on Google <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </a>
          )}
        </div>

        {data && data.reviews.length > 0 && (
          <div className="mt-8">
            {sample && <p className="mb-3 text-center text-[12.5px] font-semibold text-[#B30E29]">Preview: sample reviews. The real Google reviews appear here once the Google key is added.</p>}
            <ReviewSlider reviews={data.reviews} />
            <p className="mt-4 text-center text-[12px] text-[#76767F]">
              Reviews from Google Maps ·{" "}
              <a href={url} target="_blank" rel="noopener" className="underline-offset-2 hover:text-[#C8102E] hover:underline">See all on Google</a>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
