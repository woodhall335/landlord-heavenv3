# Pillar Page Build Report (Phase 4)

## 1) Rendered word counts
Rendered word counts were calculated from the visible content model used by `PillarPageShell` (hero copy, quick answer, route explanation, process steps, checklists, comparison table, decision guide, deep sections, supporting links context copy, and FAQ entries).

| Pillar page | Approx. rendered words |
|---|---:|
| `/how-to-evict-a-tenant-uk` | 3,995 |
| `/section-21-notice-guide` | 3,881 |
| `/section-8-notice-guide` | 3,900 |
| `/rent-arrears-landlord-guide` | 3,957 |
| `/eviction-process-england` | 3,938 |

All five pages are in the 3,000–4,000 target range.

## 2) Internal link structure
Each pillar page includes:
- **8 supporting cluster links**
- **2 tool links**
- **1 product page link**

### `/how-to-evict-a-tenant-uk`
- Supporting links: `/section-21-notice-template`, `/section-8-notice-template`, `/how-long-does-eviction-take`, `/eviction-timeline-uk`, `/accelerated-possession-guide`, `/warrant-of-possession-guide`, `/court-bailiff-eviction-guide`, `/eviction-cost-uk`
- Tools: `/tools/validators/section-21`, `/tools/validators/section-8`
- Product: `/products/complete-pack`

### `/section-21-notice-guide`
- Supporting links: `/section-21-notice-template`, `/serve-section-21-notice`, `/section-21-validity-checklist`, `/section-21-checklist`, `/accelerated-possession-guide`, `/n5b-possession-claim-guide`, `/section-21-vs-section-8`, `/section-21-court-pack`
- Tools: `/tools/free-section-21-notice-generator`, `/tools/validators/section-21`
- Product: `/products/notice-only`

### `/section-8-notice-guide`
- Supporting links: `/section-8-notice-template`, `/serve-section-8-notice`, `/section-8-grounds-explained`, `/section-8-eviction-process`, `/section-8-court-pack`, `/n5-n119-possession-claim`, `/tenant-anti-social-behaviour`, `/evict-tenant-not-paying-rent`
- Tools: `/tools/free-section-8-notice-generator`, `/tools/validators/section-8`
- Product: `/products/complete-pack`

### `/rent-arrears-landlord-guide`
- Supporting links: `/rent-arrears-eviction-guide`, `/tenant-stopped-paying-rent`, `/recover-rent-arrears-after-eviction`, `/tenant-left-without-paying-rent`, `/how-to-sue-tenant-for-unpaid-rent`, `/claim-rent-arrears-tenant`, `/money-claim-unpaid-rent`, `/rent-arrears-letter-template`
- Tools: `/tools/rent-arrears-calculator`, `/tools/free-rent-demand-letter`
- Product: `/products/money-claim`

### `/eviction-process-england`
- Supporting links: `/eviction-timeline-england`, `/possession-order-process`, `/court-possession-order-guide`, `/bailiff-eviction-process`, `/warrant-of-possession-guide`, `/court-bailiff-eviction-guide`, `/eviction-court-hearing-guide`, `/landlord-eviction-checklist`
- Tools: `/tools/validators/section-21`, `/tools/validators/section-8`
- Product: `/products/complete-pack`

## 3) Schema validation
Each pillar page emits the required schema blocks from `PillarPageShell`:
- **Article** via `articleSchema(...)`
- **FAQPage** via `faqPageSchema(...)`
- **BreadcrumbList** via `breadcrumbSchema(...)`

Conflict prevention:
- `FAQSection` is rendered with `includeSchema={false}` on pillar pages to avoid duplicate FAQ schema output.

## 4) Sitemap confirmation
Added high-priority sitemap entries (`priority: 0.95`, `weekly`) for:
- `/how-to-evict-a-tenant-uk`
- `/section-21-notice-guide`
- `/section-8-notice-guide`
- `/rent-arrears-landlord-guide`
- `/eviction-process-england`

## 5) Cluster integration notes
- Added a new reusable `PillarPageShell` that keeps visual and interaction consistency with existing high-intent pages:
  - `UniversalHero`
  - `HeaderConfig mode="autoOnScroll"`
  - existing colour tokens and container widths
  - existing SEO wrappers/components
- Added five dedicated route files mapped to a centralized content model in `src/lib/seo/pillar-pages-content.ts`.
- Updated `/eviction-guides` to surface these new pages at the top under **Core Eviction Guides** before cluster cards.
