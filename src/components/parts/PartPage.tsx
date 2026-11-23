import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowRight, ArrowUpRight, BadgeCheck, ChevronDown, ChevronRight, ClipboardCheck, FileSearch, Gauge, MapPin, MessageSquare, Package, ShieldCheck, Truck, Wrench } from "lucide-react";
import ServiceIcon from "@/components/services/ServiceIcon";
import BuyBox from "@/components/parts/BuyBox";
import MobileBuyBar from "@/components/parts/MobileBuyBar";
import ConditionCompare from "@/components/parts/ConditionCompare";
import PartGallery from "@/components/parts/PartGallery";
import PartTabs from "@/components/parts/PartTabs";
import { getBrand, brandUrl } from "@/lib/brands";
import { families, familyUrl } from "@/lib/faultCodes";
import { getService, serviceUrl } from "@/lib/services";
import { getCategory, categoryUrl } from "@/lib/parts/categories";
import { partLabel } from "@/lib/parts/repository";
import { WARRANTY } from "@/lib/parts/rules";
import { hasOffer, jsonLdString, offersOf, partFaqs, partJsonLd } from "@/lib/parts/seo";
import type { Part } from "@/lib/parts/types";

// Confirmed facts only (see README "Content & claims policy").
const trust = [
  { icon: ClipboardCheck, t: "Free evaluation", d: "On every repair" },
  { icon: ShieldCheck, t: "1-year warranty", d: "On repairs" },
  { icon: Gauge, t: "Load tested on our benches", d: "Test report included" },
  { icon: MapPin, t: "Canada & USA", d: "Pickup or ship it in" },
];

// Used when the catalog has no repair steps for this part.
const defaultProcess = [
  { step: "Send it in", detail: "Ship your unit to us, or book a pickup in Canada and the USA." },
  { step: "Quote first", detail: "We check the unit and send a quote. No work starts until you approve it." },
  { step: "Repair", detail: "Your own unit is repaired and returned to you." },
  { step: "Warranty", detail: `Every repair carries a ${WARRANTY}.` },
];

const brandFamilies = (manufacturer: string) => families.filter((f) => f.brand.toLowerCase() === manufacturer.toLowerCase());

/* `related`: the "Related parts" block, streamed in separately (see RelatedParts) so the part itself shows first. */
export default function PartPage({ p, related }: { p: Part; related?: React.ReactNode }) {
  const cat = getCategory(p.category);
  const brand = p.manufacturerSlug ? getBrand(p.manufacturerSlug) : undefined;
  // Our brand page when we have one, otherwise the catalog listing for this manufacturer.
  const brandHref = brand ? brandUrl(brand.slug) : p.manufacturerSlug ? `/shop/brands/${p.manufacturerSlug}` : undefined;
  const offers = offersOf(p);
  const faqs = partFaqs(p);
  const title = partLabel(p);
  const services = [p.serviceSlug ?? cat?.service, "failure-analysis", "parameter-backup"]
    .map((s) => (s ? getService(s) : undefined))
    .filter((s, i, a): s is NonNullable<typeof s> => Boolean(s?.answer) && a.findIndex((x) => x?.slug === s?.slug) === i)
    .slice(0, 3);
  const repairable = hasOffer(p, "repair");
  const process = p.repairProcess.length ? p.repairProcess : defaultProcess;
  const fams = brandFamilies(p.manufacturer);
  const quote = new URLSearchParams({ part: p.partNumber, brand: p.manufacturer, item: p.slug });
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "specs", label: "Specs" },
    ...(repairable ? [{ id: "repair", label: "Repair" }] : []),
    ...(fams.length ? [{ id: "codes", label: "Fault codes" }] : []),
    { id: "shipping", label: "Shipping" },
    { id: "faq", label: "FAQ" },
  ];

  return (
    <div className="bg-[#F7F7F8] pb-20 text-[#131316] lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(partJsonLd(p)) }} />
      <div className="mx-auto max-w-310 px-4 pt-4 sm:px-8 sm:pt-5">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-[#696976]">
            <li><Link href="/" className="hover:text-[#B30E29]">Home</Link></li>
            <li aria-hidden="true"><ChevronRight size={13} /></li>
            <li><Link href="/shop" className="hover:text-[#B30E29]">Shop Parts</Link></li>
            {cat && (
              <>
                <li aria-hidden="true"><ChevronRight size={13} /></li>
                <li><Link href={categoryUrl(cat.slug)} className="hover:text-[#B30E29]">{cat.name}</Link></li>
              </>
            )}
            <li aria-hidden="true"><ChevronRight size={13} /></li>
            <li aria-current="page" className="font-mono font-semibold text-[#131316]">{p.partNumber}</li>
          </ol>
        </nav>

        {/* ---------- Top: photos + buy box (equal columns) ---------- */}
        <section className="mt-4 grid gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-10">
          <div className="min-w-0">
            <PartGallery images={p.images} title={title} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {brandHref ? (
                <Link href={brandHref} className="rounded-full bg-[#C8102E]/8 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em] text-[#A50D25] hover:bg-[#C8102E]/15">{p.manufacturer}</Link>
              ) : p.manufacturer ? (
                <span className="rounded-full bg-[#C8102E]/8 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em] text-[#A50D25]">{p.manufacturer}</span>
              ) : null}
              {cat && <Link href={categoryUrl(cat.slug)} className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-[#5A5A66] ring-1 ring-[#EAEAEC] hover:text-[#C8102E]">{cat.name}</Link>}
            </div>

            <h1 className="mt-2.5 text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[32px]">
              {title !== p.partNumber && <span className="sr-only">{p.manufacturer} </span>}
              <span className="wrap-break-word">{p.partNumber}</span>
              <span className="mt-1 block text-[15.5px] font-semibold leading-snug tracking-normal text-[#5A5A66] sm:text-[17px]">{p.name}</span>
            </h1>

            <div className="mt-3.5">
              <BuyBox manufacturer={p.manufacturer} partNumber={p.partNumber} slug={p.slug} name={p.name} image={p.images[0]?.src} offers={offers} />
            </div>
          </div>
        </section>

        {/* ---------- Promise strip: full width under both columns ---------- */}
        <ul className="mt-6 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-4">
          {trust.map(({ icon: Icon, t, d }) => (
            <li key={t} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-[#EAEAEC] sm:p-4">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[#C8102E]/8 text-[#B30E29] sm:h-11 sm:w-11"><Icon size={20} aria-hidden="true" /></span>
              <span className="min-w-0 leading-tight"><span className="block text-[13.5px] font-bold sm:text-[14.5px]">{t}</span><span className="text-[12px] text-[#696976] sm:text-[12.5px]">{d}</span></span>
            </li>
          ))}
        </ul>

        {/* ---------- Details ---------- */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-stretch">
          <PartTabs
            tabs={tabs}
            footer={
              <div className="flex flex-col gap-3 border-t border-[#EAEAEC] bg-[#FAFAFB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[#C8102E]/8 text-[#B30E29]"><MessageSquare size={18} aria-hidden="true" /></span>
                  <div className="leading-tight">
                    <p className="text-[14.5px] font-bold">Questions about the {p.partNumber}?</p>
                    <p className="text-[12.5px] text-[#696976]">Ask us about compatibility, condition or availability.</p>
                  </div>
                </div>
                <div className="flex flex-none gap-2">
                  <Link href="/contact" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#131316] px-4 text-[13.5px] font-semibold text-white hover:bg-[#A50D25]">Contact Us</Link>
                  <Link href={`/request-quote?${quote}`} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#F0DADD] bg-white px-4 text-[13.5px] font-semibold hover:border-[#C8102E] hover:text-[#A50D25]">Get a Quote</Link>
                </div>
              </div>
            }
          >
            {/* Overview */}
            <div>
              <h2 className="text-[20px] font-extrabold sm:text-[22px]">About the {p.partNumber}</h2>
              <p className="mt-3 text-[15px] leading-[1.75] text-[#5A5A66]">
                {p.description ?? `${title}: request a quote for a new, refurbished or exchange unit, or have yours repaired.`}
              </p>
              {p.faults.length > 0 && (
                <>
                  <h3 className="mt-6 text-[16px] font-extrabold">Common {p.partNumber} faults</h3>
                  <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                    {p.faults.map((f) => (
                      <li key={f.fault} className="flex gap-2.5 rounded-2xl bg-[#FAFAFA] p-3.5">
                        <AlertTriangle size={17} className="mt-0.5 flex-none text-[#F59E0B]" aria-hidden="true" />
                        <span><span className="block text-[14.5px] font-bold">{f.fault}</span><span className="text-[13.5px] leading-relaxed text-[#5A5A66]">{f.detail}</span></span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Specifications */}
            <div>
              <h2 className="text-[20px] font-extrabold sm:text-[22px]">Specifications</h2>
              <div className="mt-3 overflow-hidden rounded-2xl ring-1 ring-[#EAEAEC]">
                <table className="w-full text-left text-[14px]">
                  <tbody>
                    {[["Manufacturer", p.manufacturer], ["Part number", p.partNumber], ...(cat ? [["Category", cat.name]] : []), ...p.specs].filter(([, v]) => v).map(([k, v], i) => (
                      <tr key={k} className={i % 2 ? "bg-white" : "bg-[#FAFAFA]"}>
                        <th scope="row" className="w-[42%] px-4 py-3 font-semibold text-[#696976] sm:px-5">{k}</th>
                        <td className="px-4 py-3 font-semibold sm:px-5">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[12.5px] text-[#696976]">Check the nameplate on your unit. Send us a photo if you are not sure it matches.</p>
            </div>

            {/* Repair process */}
            {repairable && (
              <div>
                <h2 className="text-[20px] font-extrabold sm:text-[22px]">How the {p.partNumber} repair works</h2>
                <ol className="relative mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {process.map((s, i) => (
                    <li key={s.step} className="relative rounded-2xl bg-[#FAFAFB] p-4 ring-1 ring-[#EAEAEC]">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-[13px] font-extrabold text-white">{i + 1}</span>
                      <p className="mt-3 text-[14px] font-bold leading-snug">{s.step}</p>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-[#696976]">{s.detail}</p>
                    </li>
                  ))}
                </ol>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Link href={`/request-repair?${quote}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-6 text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-14px_rgba(200,16,46,0.9)]"><Wrench size={17} aria-hidden="true" /> Request a Repair Quote</Link>
                  <Link href={`/request-pickup?part=${encodeURIComponent(p.partNumber)}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#F0DADD] px-6 text-[14.5px] font-semibold hover:border-[#C8102E] hover:text-[#A50D25]"><Truck size={17} aria-hidden="true" /> Request a Pickup</Link>
                </div>
              </div>
            )}

            {/* Fault codes */}
            {fams.length > 0 && (
              <div>
                <h2 className="text-[20px] font-extrabold sm:text-[22px]">{p.manufacturer} fault codes</h2>
                <p className="mt-2 text-[14.5px] leading-[1.7] text-[#5A5A66]">Drive showing an alarm? Look up the code: plain-English meaning, likely causes and safe checks.</p>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {fams.map((f) => (
                    <li key={f.seriesSlug}>
                      <Link href={familyUrl(f)} className="group flex items-center gap-3 rounded-2xl p-3 ring-1 ring-[#EAEAEC] transition hover:ring-[#C8102E]/40">
                        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-[13px] font-extrabold text-white">{f.initials}</span>
                        <span className="min-w-0 flex-1"><span className="block text-[14.5px] font-bold group-hover:text-[#A50D25]">{f.brand} {f.short}</span><span className="text-[12.5px] text-[#696976]">{f.codes.length.toLocaleString("en-US")} codes explained</span></span>
                        <ArrowUpRight size={16} className="flex-none text-[#B30E29]" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/fault-codes" className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#A50D25] hover:underline"><FileSearch size={16} aria-hidden="true" /> Open the Fault Code Library</Link>
              </div>
            )}

            {/* Shipping & warranty */}
            <div>
              <h2 className="text-[20px] font-extrabold sm:text-[22px]">Shipping &amp; warranty</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: Truck, t: "Canada & USA", d: "We ship across Canada and the USA. We confirm the ship date and shipping cost with your order." },
                  { icon: MapPin, t: "Pickup available", d: "Ship your unit in, or book a pickup for repairs and exchanges." },
                  { icon: ShieldCheck, t: WARRANTY, d: "On every repair." },
                  { icon: Package, t: "No payment online", d: "We confirm stock, shipping and your invoice before you pay." },
                ].map(({ icon: Icon, t, d }) => (
                  <li key={t} className="flex gap-3 rounded-2xl bg-[#FAFAFB] p-4 ring-1 ring-[#EAEAEC]">
                    <Icon size={19} className="mt-0.5 flex-none text-[#C8102E]" aria-hidden="true" />
                    <span><span className="block text-[14.5px] font-bold">{t}</span><span className="mt-0.5 block text-[13px] leading-relaxed text-[#696976]">{d}</span></span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[12.5px] text-[#696976]">Full details: <Link href="/warranty" className="font-semibold text-[#A50D25] hover:underline">Warranty</Link> · <Link href="/terms" className="font-semibold text-[#A50D25] hover:underline">Terms</Link> · <Link href="/resources/shipping" className="font-semibold text-[#A50D25] hover:underline">Shipping guide</Link></p>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-[20px] font-extrabold sm:text-[22px]">Questions about the {p.partNumber}</h2>
              <div className="mt-3 divide-y divide-[#EAEAEC]">
                {faqs.map((f, i) => (
                  <details key={f.q} className="group py-3.5" open={i === 0}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-bold [&::-webkit-details-marker]:hidden">
                      <h3>{f.q}</h3>
                      <ChevronDown size={18} className="flex-none text-[#B30E29] transition group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <p className="mt-2 text-[14.5px] leading-[1.7] text-[#5A5A66]">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </PartTabs>

          <aside className="flex flex-col gap-6">
            {repairable && (
              <section aria-labelledby="repair" className="relative overflow-hidden rounded-[24px] bg-[#0A0A0C] p-6 text-white">
                <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.6),transparent)] blur-xl" />
                <p className="relative text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF8A99]">Repair service</p>
                <h2 id="repair" className="relative mt-2 text-[22px] font-extrabold leading-tight">Repair your <span className="wrap-break-word">{p.partNumber}</span></h2>
                <ul className="relative mt-4 space-y-2.5 text-[14px] text-white/85">
                  {["Price depends on the fault: you get a quote before any work starts", "Ship it in, or we arrange a pickup in Canada & USA", `${WARRANTY} on the repair`].map((t) => (
                    <li key={t} className="flex gap-2.5"><BadgeCheck size={17} className="mt-0.5 flex-none text-[#FF5A6E]" aria-hidden="true" />{t}</li>
                  ))}
                </ul>
                <div className="relative mt-5 grid gap-2">
                  <Link href={`/request-repair?${quote}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] text-[15px] font-semibold"><Wrench size={17} aria-hidden="true" /> Request a Repair Quote</Link>
                </div>
              </section>
            )}

            {services.length > 0 && (
              <section aria-labelledby="svc" className="flex-1 rounded-[24px] border border-[#EAEAEC] bg-white p-5">
                <h2 id="svc" className="text-[17px] font-extrabold">Related repair services</h2>
                <ul className="mt-3 space-y-2">
                  {services.map((s) => (
                    <li key={s.slug}>
                      <Link href={serviceUrl(s.slug)} className="group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-[#F7F7F8]">
                        <span className="relative flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-xl bg-[#0F0F10]" style={{ boxShadow: `0 8px 20px -10px ${s.color}` }}>
                          {s.icon ? <Image src={s.icon} alt="" aria-hidden="true" fill sizes="48px" className="object-contain p-1.5" /> : <ServiceIcon name={s.lucide} color={s.color} size={48} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-bold group-hover:text-[#A50D25]">{s.title}</span>
                          <span className="line-clamp-1 text-[12.5px] text-[#696976]">{s.short}</span>
                        </span>
                        <ArrowUpRight size={16} className="flex-none text-[#B30E29]" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>

        {/* ---------- Compare the four options ---------- */}
        <ConditionCompare offers={offers} />

        {/* ---------- Related parts ---------- */}
        {related}

        {/* ---------- Not the right part ---------- */}
        <section aria-labelledby="other" className="relative mb-14 mt-12 overflow-hidden rounded-[28px] bg-[#0A0A0C] p-6 text-white sm:p-10">
          <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(200,16,46,0.6),transparent)] blur-xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_520px] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF8A99]">Any part number</p>
              <h2 id="other" className="mt-2 text-[26px] font-extrabold leading-tight sm:text-[34px]">Not the exact part? <span className="bg-linear-to-r from-[#FF8A99] to-[#FF3B55] bg-clip-text text-transparent">Send the number.</span></h2>
              <p className="mt-2 text-[15px] leading-[1.7] text-white/70">New, surplus, refurbished and obsolete parts sourced for you, or your own unit repaired.</p>
            </div>
            <form action="/request-quote" method="get" className="rounded-2xl border border-white/15 bg-white/6 p-2 backdrop-blur">
              <label htmlFor="other-part" className="sr-only">Part number</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input id="other-part" name="part" required placeholder="Part or model number" className="h-14 w-full min-w-0 rounded-xl bg-white px-4 font-mono text-[16px] text-[#131316] outline-none placeholder:font-sans placeholder:text-[#696976]" />
                <button type="submit" className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#C8102E] to-[#FF3B55] px-6 text-[15px] font-semibold">Get a quote <ArrowRight size={17} aria-hidden="true" /></button>
              </div>
            </form>
          </div>
        </section>
      </div>

      {/* Phones and tablets: sticky bar; "See options" opens the options panel */}
      <MobileBuyBar slug={p.slug} name={p.name} image={p.images[0]?.src} manufacturer={p.manufacturer} partNumber={p.partNumber} offers={offers} />
    </div>
  );
}
