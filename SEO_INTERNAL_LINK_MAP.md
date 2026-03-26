# SEO Internal Link Map (Phase 2)

## Linking spine standard
Every high-intent page now follows this pattern:
1. 1 primary product page link
2. 2–4 related guide links
3. 1 relevant tool link
4. 1 related landlord problem page link

## Pass 2 page map

| Page | Primary product | Related guides (2-4) | Tool link | Landlord problem link |
|---|---|---|---|---|
| /notice-to-quit-guide | /products/notice-only | /section-21-notice-template, /possession-claim-guide | /eviction-notice | /tenant-wont-leave |
| /section-21-validity-checklist | /products/notice-only | /serve-section-21-notice, /accelerated-possession-guide | /eviction-notice | /tenant-refusing-access |
| /section-8-eviction-process | /products/notice-only | /section-8-grounds-explained, /eviction-court-hearing-guide | /eviction-notice | /tenant-stopped-paying-rent |
| /rent-arrears-eviction-guide | /products/notice-only | /tenant-not-paying-rent, /money-claim-unpaid-rent | /tools/rent-arrears-calculator | /recover-rent-arrears-after-eviction |
| /landlord-eviction-checklist | /products/notice-only | /how-long-does-eviction-take, /eviction-timeline-uk | /eviction-notice | /tenant-anti-social-behaviour |
| /court-possession-order-guide | /products/complete-pack | /possession-claim-guide, /n5b-possession-claim-guide | /eviction-notice | /tenant-wont-leave |
| /n5b-possession-claim-guide | /products/complete-pack | /accelerated-possession-guide, /serve-section-21-notice | /eviction-notice | /tenant-refusing-access |
| /serve-section-21-notice | /products/notice-only | /section-21-validity-checklist, /n5b-possession-claim-guide | /eviction-notice | /tenant-wont-leave |
| /serve-section-8-notice | /products/notice-only | /section-8-eviction-process, /section-8-grounds-explained | /eviction-notice | /tenant-stopped-paying-rent |
| /tenant-left-without-paying-rent | /products/money-claim | /recover-rent-arrears-after-eviction, /money-claim-unpaid-rent | /tools/rent-arrears-calculator | /tenant-abandoned-property |
| /recover-rent-arrears-after-eviction | /products/money-claim | /money-claim-unpaid-rent, /court-possession-order-guide | /pre-action-protocol-debt (guide tooling intent) | /tenant-left-without-paying-rent |
| /evict-tenant-for-damage | /products/complete-pack | /tenant-damaging-property, /section-8-eviction-process | /eviction-notice | /tenant-damaging-property |
| /evict-tenant-anti-social-behaviour | /products/complete-pack | /tenant-anti-social-behaviour, /section-8-grounds-explained | /eviction-notice | /tenant-anti-social-behaviour |
| /eviction-court-hearing-guide | /products/complete-pack | /court-possession-order-guide, /possession-order-timeline | /eviction-notice | /tenant-refusing-access |
| /possession-order-timeline | /products/complete-pack | /how-long-does-eviction-take, /eviction-timeline-uk, /court-bailiff-eviction-guide | /eviction-notice | /tenant-wont-leave |

## Funnel guardrails implemented
- All audited broken pages now route **primary hero CTA** to product pages.
- Tool pages keep free preview access as secondary in-page CTA, not primary conversion CTA.
- In-content CTA links that previously pointed to wizard links on audited pages now resolve to product pages.
