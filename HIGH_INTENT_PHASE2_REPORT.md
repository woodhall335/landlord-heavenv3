# High Intent SEO Phase 2 Report

## 1) Pages created/upgraded to bespoke HighIntentPageShell
1. /notice-to-quit-guide
2. /section-21-validity-checklist
3. /section-8-eviction-process
4. /rent-arrears-eviction-guide
5. /landlord-eviction-checklist
6. /court-possession-order-guide
7. /n5b-possession-claim-guide
8. /serve-section-21-notice
9. /serve-section-8-notice
10. /tenant-left-without-paying-rent
11. /recover-rent-arrears-after-eviction
12. /evict-tenant-for-damage
13. /evict-tenant-anti-social-behaviour
14. /eviction-court-hearing-guide
15. /possession-order-timeline

All pages now use the bespoke long-form model via `HighIntentPageShell` + `PASS2_LONGFORM_PAGES`.

## 2) Rendered word-count summary
- Content model: 9 sections × 3 long paragraphs + hero bullets + FAQ block per page.
- Estimated rendered word count per page: **~2,300–2,600 words**, satisfying all listed minimum thresholds (1800/2000/2200 tiers).

## 3) Metadata summary
- Every pass 2 page now ships unique metadata through `getPass2Metadata()`:
  - unique title
  - unique meta description
  - canonical URL (`https://landlordheaven.co.uk/<slug>`)
  - OpenGraph title/description/url

## 4) Structured data validation coverage
Via `HighIntentPageShell`, each page outputs:
- `Article`
- `FAQPage`
- `BreadcrumbList`

## 5) Sitemap confirmation
All 15 pass 2 routes are present in `src/app/sitemap.ts` under high-intent landing pages with weekly changefreq and high-intent priorities.

## 6) CTA route validation (funnel compliance)
Audited and corrected pages now respect:
- SEO page → product page → wizard → checkout

Fixed:
- /tenant-not-paying-rent (hero/in-content CTA routes corrected)
- /tenant-wont-leave (hero/in-content CTA routes corrected)
- /money-claim-unpaid-rent (hero/in-content CTA routes corrected)
- /tools/free-section-21-notice-generator (hero primary CTA corrected)
- /tools/free-section-8-notice-generator (hero primary CTA corrected)

## 7) Internal linking map
See `SEO_INTERNAL_LINK_MAP.md` for full page-by-page spine matrix (product + guides + tool + related problem page).

## 8) Cannibalization risk review
Main overlaps were reduced by role separation:
- template pages = drafting intent
- service pages = delivery/proof intent
- process pages = court workflow intent
- problem pages = scenario diagnosis intent
- money claim pages = debt recovery intent

See `HIGH_INTENT_CLUSTER_AUDIT.md` for canonical hierarchy recommendations.
