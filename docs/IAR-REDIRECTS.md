# Old IAR site addresses → new addresses (301 redirects)

> **Not used (Nov 2026):** the new site launches on www.servorepairusa.com, and industrialautomationrepair.com stays IAR's Canadian site, so no redirects from the old site are needed. Kept for reference only.

The current industrialautomationrepair.com runs on Shopify. When the domain moves to this site,
add these as permanent (301) redirects in the CMS (Admin → Redirects) or in `vercel.json`.
Shopify also creates `/products/<handle>` pages for every listed item: export the product list
from Shopify and redirect each one to its matching `/parts/<slug>` page (or to `/shop`).

| Old address | New address |
|---|---|
| `/pages/our-services` | `/services` |
| `/pages/contact-us` | `/contact` |
| `/pages/exchange-program` | `/services/exchange` |
| `/pages/encoder-feedback-repair` | `/services/encoder-repair` |
| `/pages/industries` | `/industries` |
| `/pages/shipping-warranty` | `/resources/shipping` |
| `/pages/faq` | `/resources/faqs` |
| `/pages/employment` | `/about` (no careers page yet — confirm with the owner) |
| `/pages/servo-drives-servo-motors-manufacturer-series` | `/brands` |
| `/pages/servo-valve-repair` | `/services/valve-amplifier-repair` |
| `/collections/all-products` | `/shop` |
| `/collections/our-inventory` | `/shop` |
| `/collections/servo-drives` | `/services/servo-drive-repair` |
| `/collections/industrial-servo-motor-repairs` | `/services/servo-motor-repair` |
| `/collections/ac-drive-repair` | `/services/vfd-repair` |
| `/collections/industrial-electronics-repair` | `/services` |
| `/collections/siemens-servo-motors-drives-repair` | `/brands/siemens` |
| `/collections/indramat-servo-drives-servo-motors` | `/brands/rexroth-indramat` |
| `/collections/allen-bradley-servo-drives-servo-motors` | `/brands/allen-bradley` |
| `/collections/fanuc-servo-drives-servo-motors` | `/brands/fanuc` |
| `/collections/abb-servo-motors-drives-repair` | `/brands/abb` |
| `/blogs/iar-blogs` | `/resources/blog` |
| `/blogs/iar-blogs/<article>` | `/resources/blog/<article>` once each post is moved into the CMS |
| `/collections/<other>` | `/shop` |
| `/products/<handle>` | matching `/parts/<slug>`, else `/shop` |
