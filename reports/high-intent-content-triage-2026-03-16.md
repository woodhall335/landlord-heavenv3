# High-Intent Content Triage

Date: 2026-03-16

This triage was completed before expanding internal product-feed links for the money/debt cluster. The goal was to feed only pages that are meaningful, commercially aligned, distinct enough to deserve authority, and trust-ready inside the current blog data model.

## Gate

- Meaningful: contains concrete process detail such as forms, evidence, deadlines, checklists, comparisons, or worked examples
- Route-fit: primary CTA matches the main intent of the page
- Distinct: not mostly generic template prose repeated across other routes
- Trust-ready: reviewer and source metadata exists or can be added cleanly

## Feed Now

| Page | Why it passes |
| --- | --- |
| `/blog/england-money-claim-online` | Strong MCOL mechanics, pre-action protocol guidance, fees, judgment, and enforcement detail. Distinct enough to feed directly into debt-recovery routes. Reviewer and source metadata added in this sprint. |
| `/blog/england-particulars-of-claim` | Specific drafting guidance, examples, interest handling, and common mistake coverage. Clear debt-recovery intent and a strong fit for forms/process routes. Reviewer and source metadata added in this sprint. |
| `/blog/uk-money-claims-online-guide` | Practical landlord debt-recovery guide with prerequisites, letter before action guidance, claim limits, and enforcement context. Reviewer and source metadata added in this sprint. |
| `/money-claim-unpaid-rent` | Bespoke page with meaningful debt-recovery framing, evidence handling, and route clarity. Already a strong product-feed target. |
| `/claim-rent-arrears-tenant` | Strong practical money-claim content and the right primary intent. Secondary eviction CTA was corrected in this sprint from `notice_only` to `complete_pack`. |

## Fix Then Feed

| Page | Why it needed correction first |
| --- | --- |
| `/recover-rent-arrears-after-eviction` | Content is meaningful and debt-led, but the page previously surfaced possession-first product routes. Updated in this sprint to lead with `/products/money-claim` and keep `/products/complete-pack` secondary. |
| `/tenant-left-without-paying-rent` | Useful post-tenancy arrears content, but the visible CTA path was still possession-first. Updated in this sprint to lead with `/products/money-claim` and keep `/products/complete-pack` secondary. |

## Leave Eviction-First

| Page | Why it stays eviction-first |
| --- | --- |
| `/rent-arrears-eviction-guide` | Hybrid arrears/possession page where the user is still solving an active possession problem. Notice-first routing remains the right lead. |
| `/tenant-stopped-paying-rent` | Early-stage arrears page focused on control, notice sequencing, and possession decisions. Keep notice-first with court-pack secondary. |
| `/evict-tenant-not-paying-rent` | Explicit possession-intent page. Product routing should stay firmly eviction-first. |

## Notes

- The strongest pages in this cluster are bespoke blog and money-claim pages with concrete legal mechanics.
- A broader cleanup of templated pass2 / phase5 longform pages is still recommended, but it is outside this sprint.
- Internal-link expansion in this sprint was limited to pages that passed the content-value gate or were corrected to pass it first.
