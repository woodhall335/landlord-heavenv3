# New High-Intent SEO Pages Build Report

## 1) Pages Created

All requested routes now exist under `src/app/<slug>/page.tsx`.

### Tenant problem pages
- `/tenant-stopped-paying-rent`
- `/tenant-abandoned-property`
- `/tenant-damaging-property` (already existed; retained)
- `/tenant-refusing-access`
- `/tenant-breach-of-tenancy`
- `/tenant-subletting-without-permission`
- `/tenant-refusing-inspection`
- `/tenant-anti-social-behaviour`

### Process / timeline pages
- `/how-long-does-eviction-take`
- `/eviction-timeline-uk`

### Court-stage pages
- `/accelerated-possession-guide`
- `/warrant-of-possession-guide`
- `/court-bailiff-eviction-guide`

### Notice / legal explanation pages
- `/section-21-notice-period` (already present; retained)
- `/section-8-grounds-explained` (already present; retained)

### Additional high-impact pages
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

## 2) Word Counts (estimated rendered-page copy)

Generated intent pages are rendered via shared long-form `EvictionIntentLandingPage` sections + page-specific config content.

- Estimated range across new intent pages: **~2,080–2,110 words**
- Existing intent pages retained:
  - `/section-21-notice-period`: ~1,905 words
  - `/section-8-grounds-explained`: ~1,873 words

## 3) Primary keyword / intent mapping

All newly added config entries include:
- distinct primary keyword
- intent-specific page title/H1/description
- route-specific CTA positioning

Implemented centrally in `INTENT_PAGES` for consistency and anti-cannibalization control.

## 4) Metadata summary

For each new page:
- keyword-focused title
- practical meta description
- canonical via `getIntentPageMetadata`
- OpenGraph + Twitter metadata via shared metadata helper

## 5) Schema used per page

Shared rendering now outputs:
- `BreadcrumbList`
- `FAQPage`
- `Article`
- `WebPage`
- `Service`
- Optional `HowTo`/`ItemList` where applicable to specific slugs

## 6) Internal linking summary

Each new intent page includes links to:
- product pages (`/products/notice-only`, `/products/complete-pack`)
- related guides (`/how-to-evict-tenant`, `/tenant-wont-leave`, etc.)
- validator tool (`/tools/validators/eviction-notice`)
- related eviction route pages inside shared route scenario blocks

## 7) Sitemap additions

All newly created indexable routes were added to `pillarPages` in `src/app/sitemap.ts` with sensible weekly frequency and high-intent priorities.

## 8) CTA routing summary

Journey architecture retained:
- SEO page → Product page / guided eviction route → wizard flow (via product journey)
- No direct forced wizard jump from informational sections
- Primary/secondary CTA balance preserved by intent category

## 9) Image usage summary (`public/images/wizard-icons`)

New pages use existing wizard-icon assets through `config.icon` in `EvictionIntentLandingPage`, reusing the existing visual card pattern and maintaining native design consistency.

## 10) Overlap / cannibalization risks

Mitigations applied:
- distinct slugs and query framing
- unique metadata titles
- intent-specific H1s and intros
- category-based differentiation (problem vs process vs court vs notice)

Residual risk to monitor:
- close semantic neighbours (e.g., arrears pages, anti-social behaviour pages) may still require post-index CTR and query-map tuning after live Search Console data.

## 11) Special differentiation notes

Pages requiring strongest differentiation:
- `how-long-does-eviction-take` vs `eviction-timeline-uk`
- `accelerated-possession-guide` vs `n5b-possession-claim-guide`
- `serve-section-21-notice` vs `section-21-validity-checklist`

Handled by intent angle, CTA targeting, and section emphasis within per-page config.

## 12) Follow-up recommendations

1. Run post-deploy crawl to validate no duplicate canonicals and no orphaned routes.
2. Track query clusters for new pages in GSC for 2–4 weeks and tune title tags where impression overlap appears.
3. Add richer, page-specific scenario imagery over time (still using existing generic asset library first).
4. Add dedicated FAQ variants for top-converting pages once live query data emerges.
