# Phase 5 Long-Tail Expansion + Revenue Pages Report

## Scope completed
Phase 5 implementation delivered:
- Revenue-page deep optimisation across 10 priority URLs
- Creation of 10 new long-tail eviction intent pages
- JSON-LD schema consistency (Article + FAQPage + BreadcrumbList)
- Internal-link pathway requirements (pillar + 2 cluster + product + tool)
- Sitemap coverage with `priority: 0.8` and `changeFrequency: monthly` for all new long-tail pages

## Pages created (new)
1. `/can-a-landlord-evict-for-noise-complaints`
2. `/can-a-landlord-evict-for-pets`
3. `/can-you-evict-a-tenant-for-property-damage`
4. `/what-happens-after-section-21`
5. `/what-happens-after-section-8`
6. `/how-long-does-bailiff-eviction-take`
7. `/how-long-after-court-order-do-bailiffs-evict`
8. `/tenant-ignores-section-21`
9. `/tenant-ignores-section-8`
10. `/how-to-speed-up-eviction-uk`

## Priority revenue pages optimised
1. `/evict-tenant-not-paying-rent`
2. `/tenant-stopped-paying-rent`
3. `/section-21-notice-guide`
4. `/section-8-notice-guide`
5. `/how-to-evict-a-tenant-uk`
6. `/eviction-process-england`
7. `/eviction-timeline-uk`
8. `/section-8-grounds-explained`
9. `/accelerated-possession-guide`
10. `/money-claim-unpaid-rent`

## Rendered word counts (content-model estimate)
> Note: content is generated from a shared Phase 5 long-form model with per-page intent customisation.

- Revenue pages: **~2,100–2,500 words** per page target (5 required sections, deeper revenue paragraph set, FAQ set, hero content).
- Long-tail pages: **~1,250–1,550 words** per page target (5 required sections, long-tail paragraph set, FAQ set, hero content).

## Internal linking confirmation
Each Phase 5 page includes exactly these strategic links in the “Related guides and next steps” block:
- **1 pillar page**
- **2 cluster pages**
- **1 product page**
- **1 tool page**

Implementation source: each page’s `relatedLinks` are generated from structured `links` seeds in `src/lib/seo/phase5-pages.ts` and rendered by `HighIntentPageShell`.

## Schema confirmation
Every Phase 5 page now renders:
- **Article JSON-LD**
- **FAQPage JSON-LD**
- **BreadcrumbList JSON-LD**

All three schemas are emitted in the shared `HighIntentPageShell` used by both the optimised revenue pages and new long-tail pages.

## Sitemap additions
Added all 10 new long-tail pages in `src/app/sitemap.ts` with:
- `priority: 0.8`
- `changeFrequency: 'monthly'`

## Cluster integration notes
- Phase 5 pages are integrated into the existing product-first funnel architecture by default CTAs:
  - Primary CTA to `/products/complete-pack`
  - Secondary CTA to `/tools/validators`
- Diagram blocks were added near the top of pages to support topical authority and engagement:
  - Eviction process timeline
  - Section 21 vs Section 8 comparison
  - Notice → court → bailiff flow
- Design system alignment maintained through existing shells/components:
  - `UniversalHero`
  - `HeaderConfig mode="autoOnScroll"`
  - `HighIntentPageShell` containers and color tokens
