"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import RawHtml from "./RawHtml";

export type TrackingCfg = { gtm: string; ga4: string; clarity: string; linkedin: string; headHtml: string; bodyHtml: string };

/* Site-wide tags saved in the CMS (Tracking & Code). They load after the page is
   interactive, so they never slow the first paint, and never run inside the CMS. */
export default function Tracking({ cfg }: { cfg: TrackingCfg }) {
  const path = usePathname();
  useEffect(() => {
    // Remember how the visitor first arrived, for the Leads screen
    try {
      if (!sessionStorage.getItem("aq_src")) {
        const u = new URL(location.href);
        sessionStorage.setItem("aq_src", JSON.stringify({
          landing: u.pathname,
          referrer: document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : "",
          utm: ["utm_source", "utm_medium", "utm_campaign"].map((k) => u.searchParams.get(k)).filter(Boolean).join(" / "),
          gclid: u.searchParams.has("gclid"),
        }));
      }
    } catch {}
  }, []);
  if (path?.startsWith("/admin")) return null;
  const gtm = /^GTM-[A-Z0-9]+$/i.test(cfg.gtm) ? cfg.gtm.toUpperCase() : "";
  const ga4 = /^G-[A-Z0-9]+$/i.test(cfg.ga4) ? cfg.ga4.toUpperCase() : "";
  const clarity = /^[a-z0-9]{6,20}$/i.test(cfg.clarity) ? cfg.clarity : "";
  const linkedin = /^\d{4,12}$/.test(cfg.linkedin) ? cfg.linkedin : "";
  return (
    <>
      {gtm && (
        <>
          <Script id="aq-gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}</Script>
          <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${gtm}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} /></noscript>
        </>
      )}
      {ga4 && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} strategy="afterInteractive" />
          <Script id="aq-ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');`}</Script>
        </>
      )}
      {clarity && <Script id="aq-clarity" strategy="lazyOnload">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarity}");`}</Script>}
      {linkedin && <Script id="aq-li" strategy="lazyOnload">{`_linkedin_partner_id="${linkedin}";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s);})(window.lintrk);`}</Script>}
      {cfg.headHtml && <RawHtml html={cfg.headHtml} where="head" id="site-head" />}
      {cfg.bodyHtml && <RawHtml html={cfg.bodyHtml} where="body" id="site-body" />}
    </>
  );
}
