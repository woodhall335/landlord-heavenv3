# SEO Internal Link Authority Map (Phase 3)

## Routing chain enforced
Problem pages → Notice pages → Process pages → Court pages → Product pages

## Cluster map

### 1) Tenant problems
- Canonical parent: `/evict-tenant-not-paying-rent`
- Supports: scenario pages (non-payment, access, anti-social behaviour, etc.)
- Tool: `/tools/validators/section-8`
- Product: `/products/notice-only`

### 2) Eviction notices
- Canonical parent: `/eviction-notice-england`
- Supports: Section 21/Section 8 generators, checklists, period and validity guides
- Tool: `/tools/validators/section-21`
- Product: `/products/notice-only`

### 3) Court process
- Canonical parent: `/eviction-court-forms-england`
- Supports: N5B/N5+N119, possession-order process/timeline, hearing guides
- Tool: `/tools/validators/section-8`
- Product: `/products/complete-pack`

### 4) Rent arrears
- Canonical parent: `/rent-arrears-eviction-guide`
- Supports: arrears eviction and post-eviction recovery pages
- Tool: `/tools/rent-arrears-calculator`
- Product: `/products/money-claim`

### 5) Possession enforcement
- Canonical parent: `/eviction-timeline-england`
- Supports: accelerated possession, warrant, bailiff, timeline, checklist pages
- Tool: `/tools/validators/section-21`
- Product: `/products/complete-pack`

## Template enforcement
For each high-intent page, templates now emit:
- 1 canonical parent link
- 2 supporting cluster links
- 1 tool page link
- 1 product page link

This is now generated from `getAuthorityLinks()` in `src/lib/seo/eviction-authority.ts`.
