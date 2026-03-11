# High Intent Pages Depth Upgrade Report

## Audit outcome

The listed routes were audited. Most were template-thin wrappers over `EvictionIntentLandingPage` plus shared config in `src/lib/seo/eviction-intent-pages.ts`.

Template-thin pages (still requiring expansion in subsequent passes):

- `/tenant-abandoned-property`
- `/tenant-refusing-access`
- `/tenant-breach-of-tenancy`
- `/tenant-subletting-without-permission`
- `/tenant-refusing-inspection`
- `/tenant-anti-social-behaviour`
- `/how-long-does-eviction-take`
- `/eviction-timeline-uk`
- `/accelerated-possession-guide`
- `/warrant-of-possession-guide`
- `/court-bailiff-eviction-guide`
- `/section-21-notice-period`
- `/section-8-grounds-explained`
- `/notice-to-quit-guide`
- `/section-21-validity-checklist`
- `/section-8-eviction-process`
- `/rent-arrears-eviction-guide`
- `/landlord-eviction-checklist`
- `/court-possession-order-guide`
- `/n5b-possession-claim-guide`
- `/serve-section-21-notice`
- `/serve-section-8-notice`
- `/tenant-left-without-paying-rent`
- `/recover-rent-arrears-after-eviction`
- `/evict-tenant-for-damage`
- `/evict-tenant-anti-social-behaviour`
- `/eviction-court-hearing-guide`
- `/possession-order-timeline`

## Materially expanded in this change

### `/tenant-stopped-paying-rent`

- Replaced thin wrapper implementation with bespoke long-form body sections rendered directly through new page content structure.
- Added bespoke route-specific section composition for arrears diagnosis, evidence assembly, route selection, pre-court preparation, and post-possession recovery strategy.
- Preserved design system primitives (UniversalHero, transparent header config mode, card sections, FAQ pattern).
- Preserved SEO primitives (canonical metadata, OpenGraph, Article schema, FAQPage schema, BreadcrumbList schema).
- Internal linking includes product CTA path, related guides, a validator tool, and an adjacent landlord problem page.

Estimated rendered body word count for this page (scripted source-text estimate): ~1,112 words.

## Shared vs bespoke composition status

- New shared shell component: `src/components/seo/HighIntentPageShell.tsx` (layout + schema + hero + FAQ scaffold).
- Bespoke page body content currently implemented for:
  - `tenant-stopped-paying-rent` in `src/lib/seo/high-intent-pass1-pages.ts`.
- Remaining listed pages still use the previous shared monolithic renderer and require continuation work.

## Metadata / schema / sitemap / linking

- `/tenant-stopped-paying-rent` now has explicit metadata and canonical via helper and retains JSON-LD coverage (Article + FAQ + Breadcrumb).
- Sitemap entries for target routes remain present in `src/app/sitemap.ts`.
- Funnel rule respected on updated page: primary CTA points to product page, not direct wizard.

## Residual overlap / cannibalization risks

- High overlap remains across arrears and process routes until the remaining pages are moved off the shared renderer and given distinct content architecture.
- Cannibalization risk remains high between timeline/process/court-stage pages while their content body is still template-shared.
