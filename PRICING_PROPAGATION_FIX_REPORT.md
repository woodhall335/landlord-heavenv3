# PRICING_PROPAGATION_FIX_REPORT

## Root cause
`/pricing` and multiple marketing/SEO surfaces had hardcoded legacy literals (`£29.99`, `£69.99`, `£45.99`) instead of reading from the canonical pricing source (`src/lib/pricing/products.ts`). This caused UI and SEO drift when prices changed in the canonical pricing layer.

## Why `/pricing` displayed £29.99 / £69.99 / £45.99
The page `src/app/(marketing)/pricing/page.tsx` contained inline static JSX literals for the product columns and mobile cards. Those values were not bound to `PRODUCTS`.

## SEO and marketing stale-price surfaces fixed
Audited and updated stale literals across app/lib/component marketing + SEO content surfaces, including:
- pricing page cards/table copy
- landing page CTA copy and comparison copy
- wizard/validator tool page CTA blocks
- FAQ/marketing snippets
- structured-data comments and related regression expectations
- document config display pricing references
- blog post CTA literals in `src/lib/blog/posts.tsx`

## Canonical pricing architecture chosen
**Option A (App config source of truth)** retained and enforced:
- Canonical source: `src/lib/pricing/products.ts`
- Checkout `src/app/api/checkout/create/route.ts` continues to use `PRODUCTS[sku].price` to set Stripe `unit_amount`
- UI/SEO copy values aligned to canonical prices

## Schema fixes
- Added/kept schema consistency checks to ensure `Product.offers.price` matches canonical product price and uses `GBP`.
- Added stale-price regression scan for app/lib/components source.

## Files modified
Large cross-repo pass across marketing, landing, tool, blog, SEO, pricing, validator, checkout-adjacent tests.

## Validation performed
- Pricing consistency tests (canonical values and cross-source consistency)
- Checkout create tests
- Schema pricing consistency test
- Pricing propagation + stale price scan regression test

