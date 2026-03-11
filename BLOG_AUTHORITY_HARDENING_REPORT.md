# Blog Authority Hardening Report (Phase 7)

## Summary
- **Total blog posts audited:** 115
- **Contextual internal-link system:** implemented at shared prose level for full archive coverage
- **Topic clusters reviewed:** rent arrears, Section 21, Section 8, UK compliance repeats, jurisdiction repeats
- **Category/hub architecture:** expanded with dedicated topic hubs under `/blog/*`

## 1) Contextual links added
Implemented rule-based in-body contextual links for eviction authority pathways:
- `/section-21-notice-guide`
- `/section-8-notice-guide`
- `/how-to-evict-a-tenant-uk`
- `/evict-tenant-not-paying-rent`
- `/tenant-stopped-paying-rent`
- `/money-claim-unpaid-rent`

These now trigger from natural topic phrases in paragraph/list text across the archive.

## 2) Consolidation recommendations
See: `BLOG_TOPIC_CONSOLIDATION_PLAN.md`
- keep strategic pillars distinct
- merge/canonicalize near-duplicate child pages
- retain jurisdiction-specific legal explainers as separate clusters

## 3) Category hub architecture created/improved
Implemented topic hubs:
- `/blog/eviction-guides`
- `/blog/rent-arrears`
- `/blog/section-21`
- `/blog/section-8`
- `/blog/landlord-compliance`
- `/blog/wales-landlord-guides`
- `/blog/scotland-landlord-guides`
- `/blog/northern-ireland-landlord-guides`

Plus `/blog` now links into these hubs as cluster navigation.

## 4) CTA / conversion routing improvements
- Authority routing improved by contextual links inside body copy.
- Hubs include pillar links to push users from information to next-step pages.
- Existing product CTA logic remains intact and now sits behind stronger topical context.

## 5) Sitemap additions
Added topic hub URLs into sitemap generation so crawlers can discover hub architecture quickly.

## 6) Top 30 posts shortlist
See: `TOP_30_BLOG_POSTS_TO_STRENGTHEN.md`

## 7) Remaining risks
- Some high-traffic posts still benefit from manual paragraph-level editorial anchor tuning.
- Metadata/FAQ quality still requires post-by-post quality pass for best SERP lift.
- Duplicate resolution (merge vs canonical) should be finalized with Search Console + performance data.
