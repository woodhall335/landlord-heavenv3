# Tenancy agreement organic growth and sales plan

Date: 14 October 2026  
Baseline revision: `37ac573b418abf5c83027883833530c6f85e3e6d`

## Evidence baseline

For the 28-day Search Console period ending 11 October 2026, tenancy-related URLs recorded 48 clicks from 5,670 impressions (0.8% CTR) at an average position of 16.1. Several useful landing pages already rank on page one or two, but the generic England tenancy page presented Premium as the default and obscured the lower-priced Standard route.

GA4 recorded five purchases and £188.95 revenue in the latest comparable 28-day window, but the closed purchase funnel did not connect those purchases to product views and checkout steps. Product landing pages therefore need canonical SKU-based view and CTA events before conversion-rate conclusions can be trusted.

## Controlled implementation batch

1. Make `/tenancy-agreement-template` a neutral England decision page rather than a Premium-first sample page.
2. Present Standard first for straightforward lets, show its £14.99 price above the fold, and retain Premium as the fuller £24.99 alternative.
3. Keep the Premium golden pack as proof lower on the page rather than the default purchase route.
4. Show fixed prices in the hero CTA on Standard, Premium, Student, HMO and Lodger product pages.
5. Emit `view_item` with the canonical product SKU and price on all five England tenancy product pages.
6. Track hero CTA selection through the shared tracked-link component so wizard clicks emit `add_to_cart` using the same SKU later used by checkout and purchase events.
7. Preserve existing URLs, canonicals, legal-document generation, pricing, checkout and fulfilment.

## Measurement gates

Review after 28 complete days using both landing-page and query-filtered Search Console data.

- Generic tenancy-page organic CTR and clicks.
- Standard versus Premium product-page entrances.
- `view_item` → `add_to_cart` → `begin_checkout` → `purchase` counts by canonical SKU.
- Purchase revenue and conversion rate by landing page.
- Search-query ownership between the generic page, Standard, Premium and legacy AST/periodic guides.

Do not interpret a conversion-rate change until the funnel contains consistent product events for a complete measurement window.

## Next evidence-led batches

- Improve snippets on high-impression, low-CTR HMO, joint-tenancy and assured-periodic pages only after page-filtered query review.
- Strengthen links from high-traffic landlord tools and guides when the tool result clearly implies a matching tenancy product.
- Resolve the known redirect-error and duplicate-canonical URLs as a separate technical SEO batch after verifying each live redirect target.
- Investigate checkout abandonment only after the corrected funnel confirms where users actually stop.

## Release boundary

This batch is local only. It does not change legal wording, generated documents, prices, payments, customer records, fulfilment, URLs or canonicals. Deployment requires a separate approval and release check.
