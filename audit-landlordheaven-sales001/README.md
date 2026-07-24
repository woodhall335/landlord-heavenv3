# LandlordHeaven SALES-001 audit

Baseline period: supplied Google Search Console 28-day export dated 2026-07-23.

## Confirmed defects

- Organic traffic is concentrated on informational pages and tools; only a small share reaches product routes.
- Public blog output contained internal production copy: “The useful SEO value…” and an unfinished visual-production placeholder.
- Contextual CTA logic existed in multiple components and maps rather than one reusable source-route registry.
- Existing growth analytics used legacy event names and did not expose the complete requested canonical funnel vocabulary.
- Several source files contain mojibake sequences. Rendered output must be checked before treating every source match as a user-visible defect.

## Implemented improvements

- Added `src/lib/conversion/registry.ts` with source route, problem, product, CTA copy, destination, safe builder context, benefits, live price, preview status, and tracking ID.
- Applied exact mappings to the commercially relevant blog pages in the top-20 set.
- Added fixed-price and preview reassurance to contextual article cards without changing prices.
- Added canonical SALES-001 analytics event names and privacy-safe dimensions.
- Removed the confirmed public internal-production copy and placeholder section.
- Added an automated public-copy regression test.

## Hypotheses

- A problem-matched offer shown after the first useful answer will materially outperform generic product navigation.
- Explicit fixed price and preview availability will improve product-start confidence.
- HMO visitors will respond better to HMO/shared-house paperwork than to a generic tenancy agreement.

## Untested recommendations

- Securely carry non-sensitive calculator state into the builder.
- Add the canonical event calls to every builder, authentication, checkout, delivery and cross-sell transition after verifying the server-side event store contract.
- Test no more than three changes initially: contextual CTA copy, result placement, and product hero preview emphasis.

## Metrics awaiting 30-day data

Contextual CTA CTR; organic landing-to-product rate; product-to-builder rate; builder-to-preview rate; preview-to-checkout rate; checkout-to-payment rate; landing-to-sale rate; revenue by source, product, and device.

The site should not be described as conversion-optimised until post-release data supports that conclusion.
