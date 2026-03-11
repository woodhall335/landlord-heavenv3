# High Intent Pages Pass 1 Completion Report

## Rendered word counts (current)

| Page | Current rendered word count | Threshold | Status |
|---|---:|---:|---|
| `/tenant-stopped-paying-rent` | 1022 | 1800 | ❌ Below target |
| `/tenant-abandoned-property` | 850 | 1800 | ❌ Below target |
| `/tenant-damaging-property` | Not re-measured in this pass | 1800 | ⚠️ Pending |
| `/tenant-refusing-access` | 533 | 1800 | ❌ Below target |
| `/tenant-anti-social-behaviour` | Shared renderer page (not bespoke yet) | 1800 | ❌ Not complete |
| `/how-long-does-eviction-take` | Shared renderer page (not bespoke yet) | 2200 | ❌ Not complete |
| `/eviction-timeline-uk` | Shared renderer page (not bespoke yet) | 2200 | ❌ Not complete |
| `/section-8-grounds-explained` | Shared renderer page (not bespoke yet) | 1800 | ❌ Not complete |
| `/accelerated-possession-guide` | Shared renderer page (not bespoke yet) | 2000 | ❌ Not complete |
| `/warrant-of-possession-guide` | Shared renderer page (not bespoke yet) | 2000 | ❌ Not complete |

> Counting method for updated pages in this pass: source-level extraction of visible page body text blocks under `data-page-body` sections.

## Bespoke vs shared

### Bespoke in current state
- `/tenant-stopped-paying-rent` (rewritten into bespoke page body)
- `/tenant-abandoned-property` (rewritten into bespoke page body)
- `/tenant-refusing-access` (rewritten into bespoke page body)
- `/tenant-damaging-property` (already bespoke before this pass)

### Still shared renderer
- `/tenant-anti-social-behaviour`
- `/how-long-does-eviction-take`
- `/eviction-timeline-uk`
- `/section-8-grounds-explained`
- `/accelerated-possession-guide`
- `/warrant-of-possession-guide`

## Remaining blockers

1. Six Pass 1 pages still route through `EvictionIntentLandingPage` and require complete bespoke body migration.
2. Three newly bespoke pages remain below required rendered word thresholds.
3. `/tenant-damaging-property` requires a fresh rendered count and likely expansion to meet threshold certainty.
4. Additional FAQ depth and route-specific CTA logic is still required to fully separate SERP intent across the cluster.

## Overlap / cannibalization risks

- Access vs abandonment intent can blur when occupancy uncertainty and denied inspections appear together; internal-link role needs stronger branch logic.
- Arrears vs timeline pages can cannibalize if route-selection language is reused without stage-specific differentiation.
- Court-stage pages remain at risk of overlap until accelerated possession and warrant pages are bespoke and independently deep.

## CTA route summary

- Updated pages use product-first CTA routes:
  - Primary: `/products/notice-only?...`
  - Secondary: `/products/complete-pack?...`
- No direct wizard primary CTA added in this pass.

## Schema, metadata, and sitemap confirmation

- Updated pages include `Article`, `FAQPage`, and `BreadcrumbList` schema components.
- Updated pages preserve canonical and OG via existing metadata helpers (`getPass1Metadata` / `getIntentPageMetadata`).
- Sitemap entries for all 10 Pass 1 paths remain present in `src/app/sitemap.ts`.
