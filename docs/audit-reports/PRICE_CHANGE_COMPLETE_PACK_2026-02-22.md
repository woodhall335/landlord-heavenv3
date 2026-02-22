# Complete Eviction Pack Price Change Audit (2026-02-22)

## Scope
Audit of Complete Eviction Pack pricing references before implementation and post-change verification for temporary change from **£199.99** to **£129.99**.

## Canonical Source Assessment
- **Primary canonical source for user-facing + SEO pricing:** `src/lib/pricing/products.ts` via `SEO_PRICES.evictionBundle` and `PRODUCTS.complete_pack`.
- **Secondary/legacy pricing source still in use by some backend/tests:** `src/lib/pricing.ts` (`REGIONAL_PRICING.complete_pack.england`, `PRICING.COMPLETE_EVICTION_PACK`).
- **Checkout safety source:** Stripe Price ID mapping in `src/app/api/checkout/create/route.ts` via `PRICE_IDS.EVICTION_PACK` from env (`STRIPE_PRICE_ID_EVICTION_PACK`).

## Findings (pre-change audit targets and disposition)

| File path | Current value | Source from central pricing config? | Visibility |
|---|---:|---|---|
| `src/lib/pricing/products.ts` | `SEO_PRICES.evictionBundle = 129.99 / £129.99` | **Yes (authoritative)** | User-visible + internal |
| `src/lib/pricing.ts` | `REGIONAL_PRICING.complete_pack.england = 129.99`, `PRICING.COMPLETE_EVICTION_PACK = 129.99` | Partially (duplicate legacy source) | Internal |
| `src/lib/checkout/cta-mapper.ts` | `complete_pack` CTA price pulled from `PRODUCTS.complete_pack.price` | **Yes** | User-visible |
| `src/app/(marketing)/products/complete-pack/page.tsx` | Uses `PRODUCTS.complete_pack` for metadata/schema price | **Yes** | User-visible SEO |
| `src/lib/seo/wizard-landing-content.ts` | `SEO_PRICES.evictionBundle.display` | **Yes** | User-visible SEO |
| `src/lib/seo/structured-data.tsx` | Product schema uses `PRODUCTS.complete_pack.price` | **Yes** | User-visible SEO |
| `src/app/(marketing)/pricing/page.tsx` | `£129.99` copy updated | No (literal copy) | User-visible |
| `src/app/section-21-ban/page.tsx` | `£129.99` copy + comparison rows updated | No (literal copy) | User-visible |
| `src/app/section-8-notice-template/page.tsx` | `£129.99` CTA/card copy updated | No (literal copy) | User-visible |
| `src/app/how-to-evict-tenant/page.tsx` | `£129.99` CTA/copy updated | No (literal copy) | User-visible |
| `src/app/warrant-of-possession/page.tsx` | `£129.99` CTA updated | No (literal copy) | User-visible |
| `src/app/possession-claim-guide/page.tsx` | `£129.99` CTA/copy updated | No (literal copy) | User-visible |
| `src/app/n5b-form-guide/page.tsx` | `£129.99` CTA updated | No (literal copy) | User-visible |
| `src/components/landing/HomeContent.tsx` | `£129.99` updated | No (literal copy) | User-visible |
| `src/components/landing/CostComparison.tsx` | `£129.99` updated | No (literal copy) | User-visible |
| `src/components/ask-heaven/AskHeavenNextStepsCards.tsx` | `£129.99` updated | No (literal copy) | User-visible |
| `src/data/faqs/eviction-process-faqs.ts` | `£129.99` updated | No (literal copy) | User-visible SEO |
| `src/app/api/checkout/create/route.ts` | `complete_pack -> PRICE_IDS.EVICTION_PACK` (env) | N/A (Stripe ID source) | Internal checkout-critical |
| `src/lib/stripe/index.ts` | Uses `process.env.STRIPE_PRICE_ID_EVICTION_PACK` | N/A (Stripe ID source) | Internal checkout-critical |
| `src/lib/pricing/__tests__/complete-pack-price-regression.test.ts` | Asserts 129.99 and no `£199.99` in user-facing text roots | Yes (test guard) | Internal test |
| `src/lib/documents/__tests__/england-complete-pack-fixes.test.ts` | Asserts cross-source pricing consistency | Yes | Internal test |
| `src/lib/payments/__tests__/safe-order-metadata.test.ts` | Order amount fixtures updated to 129.99 | No (fixtures) | Internal test |
| `src/app/api/orders/__tests__/order-status.test.ts` | Order amount fixtures updated to 129.99 | No (fixtures) | Internal test |

## Before/After Summary
- **Before:** Complete Eviction Pack appeared in many user-facing strings as **£199.99** and in central pricing config at 199.99.
- **After:** Central pricing source is **£129.99**; user-facing SEO/marketing references were updated to **£129.99**; checkout remains Stripe Price ID-based (env) with no hardcoded unit amounts for complete_pack.

## Validation Notes
- Lint and test suite executed after updates.
- Added regression coverage to catch stale `£199.99` in user-facing text sources and detect cross-source price drift.
