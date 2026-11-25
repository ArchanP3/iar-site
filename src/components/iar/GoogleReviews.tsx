import { ArrowUpRight, Star } from "lucide-react";
import { brandFont } from "@/lib/font";
import { FOUNDED, getGoogleReviews, googleProfileUrl } from "@/lib/googleReviews";

/* "Trusted since 2008" + live Google reviews (src/lib/googleReviews.ts).
   Until the Places API key and Place ID are set, it shows the history line and a link to the Google profile. */

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }} aria-hidden="true">
            <Star size={size} className="absolute inset-0 text-[#D4D4D8]" fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} className="text-[#F5A524]" fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default async function GoogleReviews({ tone = "light", embedded = false }: { tone?: "light" | "white"; embedded?: boolean }) {
  const data = await getGoogleReviews();
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
              See what our customers say on Google.
            </p>
          </div>

          <a href={url} target="_blank" rel="noopener" className="group flex items-center justify-between gap-5 rounded-[22px] border border-[#EAEAEC] bg-white p-5 shadow-[0_24px_50px_-40px_rgba(19,19,22,0.55)] transition hover:border-[#C8102E]/40 sm:p-6">
            {data ? (
              <div className="flex items-center gap-4">
                <span className="text-[44px] font-extrabold leading-none text-[#131316]">{data.rating.toFixed(1)}</span>
                <div>
                  <Stars value={data.rating} size={18} />
                  <p className="mt-1 text-[13.5px] text-[#5A5A66]">{data.count.toLocaleString("en-US")} reviews on Google</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[18px] font-extrabold text-[#131316]">Established in {FOUNDED}</p>
                <p className="mt-1 text-[13.5px] text-[#5A5A66]">Read our customer reviews on Google</p>
              </div>
            )}
            <span className="inline-flex h-11 flex-none items-center gap-2 rounded-xl bg-[#131316] px-4 text-[13.5px] font-semibold text-white transition group-hover:bg-[#C8102E]">
              {data ? "Read all reviews" : "View on Google"} <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          </a>
        </div>

        {data && data.reviews.length > 0 && (
          <>
            <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.reviews.slice(0, 3).map((r) => (
                <li key={r.author + r.when} className="flex flex-col rounded-[22px] border border-[#EAEAEC] bg-white p-6 shadow-[0_24px_50px_-42px_rgba(19,19,22,0.5)]">
                  <Stars value={r.rating} />
                  <p className="mt-3 line-clamp-6 flex-1 text-[14.5px] leading-[1.7] text-[#3F3F48]">{r.text}</p>
                  <div className="mt-5 flex items-center gap-3 border-t border-[#F0F0F2] pt-4">
                    {r.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- Google-hosted reviewer photo, shown as returned
                      <img src={r.photo} alt="" width={36} height={36} referrerPolicy="no-referrer" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#C8102E]/10 text-[14px] font-bold text-[#C8102E]">{r.author.charAt(0)}</span>
                    )}
                    <div className="min-w-0">
                      {r.authorUrl ? (
                        <a href={r.authorUrl} target="_blank" rel="noopener" className="block truncate text-[14px] font-bold text-[#131316] hover:text-[#C8102E]">{r.author}</a>
                      ) : (
                        <p className="truncate text-[14px] font-bold text-[#131316]">{r.author}</p>
                      )}
                      <p className="text-[12.5px] text-[#76767F]">{r.when}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-right text-[12px] text-[#76767F]">Reviews from Google Maps</p>
          </>
        )}
      </div>
    </section>
  );
}
