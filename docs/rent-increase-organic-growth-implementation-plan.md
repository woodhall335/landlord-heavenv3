# Rent increase organic growth and sales plan

Date: 14 October 2026  
Baseline revision: `37ac573b418abf5c83027883833530c6f85e3e6d`

## Search-intent ownership

- `/rent-increase` owns broad England rent-increase, Section 13 and Form 4A comparison intent.
- `/products/section-13-standard` owns the normal evidence-supported rent-increase product journey.
- `/products/section-13-defence` owns challenge-risk and tribunal-preparation product intent.
- The individual `/rent-increase/[slug]` pages remain informational guides and should support, not replace, these commercial owners.

## Controlled implementation

1. Present the Supported Pack first and make its £24.99 price visible in the hub title and hero.
2. Present the £34.99 Tribunal-Ready Pack as the deliberate higher-risk alternative.
3. Add an early side-by-side decision block so landlords do not need to read the full guide before choosing a route.
4. Preserve the detailed evidence and educational content below the decision block.
5. Pass the canonical product price into `view_item` on both product pages.
6. Emit GA4 `add_to_cart` when a product-page primary CTA starts its wizard, using the same canonical SKU used at checkout and purchase.
7. Preserve prices, URLs, canonicals, Form 4A generation, legal wording, checkout and fulfilment.

## Measurement

Review a complete 28-day post-release window:

- Search Console impressions, clicks, CTR and position for `/rent-increase` and both product pages.
- Query ownership for `rent increase`, `section 13 notice`, `form 4a` and challenge/tribunal variants.
- `view_item` → `add_to_cart` → `begin_checkout` → `purchase` by `section13_standard` and `section13_defensive`.
- Supported versus Tribunal-Ready product selection.
- Revenue and conversion rate by organic landing page.

## Next batch

- Review page-filtered queries before changing individual rent-increase guide titles or metas.
- Add contextual internal links from relevant rent tools only where the result supports the product route.
- Investigate checkout abandonment after the corrected product funnel has accumulated enough traffic.

## Release boundary

Local implementation only. No legal wording, document generation, pricing, payment, customer data, fulfilment, URL or canonical changes. Deployment requires a separate release approval.
