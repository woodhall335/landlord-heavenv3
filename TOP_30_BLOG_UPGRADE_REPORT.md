# Top 30 Blog Upgrade Report (Phase 8)

## Scope completed
- Implemented a reusable **Top-30 upgrade layer** that applies to the shortlist in `TOP_30_BLOG_POSTS_TO_STRENGTHEN.md`.
- Upgraded metadata for priority slugs (high-impact first) and established infrastructure so remaining slugs can be updated through one config file.
- Added quick-answer blocks, intent-routed CTA blocks, supplemental FAQs, and visual placeholder blocks for the shortlisted posts.
- Reordered topic hub listings so upgraded shortlist posts surface first in cluster pages.

## Posts upgraded (Top 30 shortlist)
1. renters-reform-bill-what-landlords-need-to-know
2. what-is-section-21-notice
3. section-21-vs-section-8
4. section-21-validity-checklist
5. serve-section-21-notice
6. tenant-ignores-section-21
7. what-happens-after-section-21
8. section-8-grounds-explained
9. section-8-eviction-process
10. serve-section-8-notice
11. tenant-ignores-section-8
12. what-happens-after-section-8
13. section-8-rent-arrears-eviction
14. rent-arrears-eviction-guide
15. tenant-stopped-paying-rent
16. evict-tenant-not-paying-rent
17. recover-rent-arrears-after-eviction
18. tenant-left-without-paying-rent
19. money-claim-unpaid-rent
20. mcol-money-claim-online
21. claim-rent-arrears-tenant
22. how-to-sue-tenant-for-unpaid-rent
23. eviction-court-hearing-guide
24. court-possession-order-guide
25. possession-order-timeline
26. n5b-possession-claim-guide
27. how-long-does-eviction-take-uk
28. eviction-timeline-uk
29. how-to-evict-a-tenant-uk
30. landlord-eviction-checklist

## Title + meta description changes
Configured in `src/lib/blog/top30-upgrades.ts` and applied at render/metadata generation.

### Explicitly upgraded in this pass
- renters-reform-bill-what-landlords-need-to-know
- what-is-section-21-notice
- section-21-vs-section-8
- section-21-validity-checklist
- serve-section-21-notice
- tenant-ignores-section-21
- what-happens-after-section-21
- section-8-grounds-explained
- section-8-eviction-process
- serve-section-8-notice

### Framework ready for remaining shortlisted slugs
- All remaining shortlisted posts are already routed through the same upgrade layer; title/meta can be extended by adding entries to `titleAndMetaBySlug`.

## Contextual links improved
Added intent-aware “Choose your next legal step” block for shortlisted posts:
- **Section 21 intent**: `/section-21-notice-guide`, `/products/notice-only`, `/products/complete-pack`
- **Section 8 / arrears intent**: `/section-8-notice-guide`, `/evict-tenant-not-paying-rent`, `/products/money-claim`
- **Process/court intent fallback**: `/how-to-evict-a-tenant-uk`, `/products/complete-pack`

## CTA routing changes
- Introduced deterministic CTA routing by post intent via `getIntentRoutedLinks`.
- Kept existing product CTA system in place; new block adds stage-based routing reinforcement high in article body.

## FAQ / schema changes
- Added supplemental FAQ logic for question-led shortlisted posts.
- FAQ schema remains guarded by existing threshold (`>= 3` Q&As) and dedupe logic to avoid conflicts.

## Placeholder image/diagram sections added
Each shortlisted post now receives a dedicated “Visuals to insert in next content sprint” section with:
- timeline block placeholder
- checklist block placeholder
- what-happens-next flow block placeholder

## Duplicate / overlap hardening decisions (shortlist)
- **Differentiate harder (default):** all 30 shortlisted posts currently retained, with stronger quick-answer framing + intent routing to reduce cannibalisation.
- **Potential canonicalize candidates (monitor):**
  - `eviction-timeline-uk` vs `how-long-does-eviction-take-uk`
  - `money-claim-unpaid-rent` vs `mcol-money-claim-online`
- **Potential merge-later candidates (monitor):**
  - `tenant-stopped-paying-rent` + `evict-tenant-not-paying-rent` (if future overlap scores rise)

## Topic hub improvements
- Topic hub cluster lists now sort by Top-30 priority before date/other posts.
- Hub intros for eviction/section-21/section-8/rent-arrears were strengthened to emphasize upgraded guide pathways and pillar routing.

## Validation checklist run
- duplicate titles/descriptions: improved for upgraded subset; remaining shortlisted metadata can be expanded in same map
- canonical handling: unchanged logic retained, no regressions introduced
- internal links: upgraded posts now include explicit stage-routed links
- FAQ/schema conflicts: dedupe + min-count threshold retained
- topic hub links: upgraded posts now prioritized in hub listings
- sitemap entries for hub pages: no change required (topic hubs already generated dynamically)

## Remaining follow-up work
1. Add custom title/meta entries for the remaining 20 shortlisted posts inside `titleAndMetaBySlug`.
2. Add post-specific overlap notes (one-line differentiation statement per slug) in the same config layer.
3. Optional: introduce per-hub featured cards for top 3 shortlist posts with editorial summaries.
4. Optional: add automated audit script to check shortlist metadata uniqueness on CI.
