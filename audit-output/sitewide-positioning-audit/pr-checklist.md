# PR-ready Checklist (grouped by file path)

## `src/app/page.tsx`
- [ ] Tighten hero to explain premium product in first 5 seconds.
- [ ] Add explicit “not just templates” comparison block.
- [ ] Promote one primary CTA to product selector/wizard start.

## `src/app/products/notice-only/page.tsx`
- [ ] Add deliverables list (documents + instructions + validation outcomes).
- [ ] Add explicit legal checks module.
- [ ] Add trust proof near primary CTA.

## `src/app/products/complete-pack/page.tsx`
- [ ] Clarify solicitor-replacement boundaries (what is and is not covered).
- [ ] Add court-bundle structure preview.
- [ ] Add “why workflow questions matter” snippet.

## `src/app/products/money-claim/page.tsx`
- [ ] Differentiate from `/money-claim` informational page.
- [ ] Add pre-action protocol and evidence logic summary.
- [ ] Clarify outputs and filing readiness.

## `src/app/products/ast/page.tsx`
- [ ] Differentiate from AST template landing pages.
- [ ] Add dynamic clause/jurisdiction logic examples.
- [ ] Add stronger premium trust indicators.

## `src/app/tools/page.tsx`
- [ ] Add clear “free tool vs paid workflow” branching UI.
- [ ] Add upgrade CTA modules on each tool card.

## `src/app/tools/free-section-21-notice-generator/page.tsx`
- [ ] Add paid-upgrade bridge after generation intent.
- [ ] Add legal-risk messaging for template-only usage.

## `src/app/tools/free-section-8-notice-generator/page.tsx`
- [ ] Add paid-upgrade bridge after generation intent.
- [ ] Add legal-risk messaging for template-only usage.

## `src/app/tools/validators/section-21/page.tsx`
- [ ] Connect validation output to paid remediation/product flow.
- [ ] Add persistent CTA once a risk is detected.

## `src/app/ask-heaven/page.tsx`
- [ ] Add contextual product CTA blocks under answers.
- [ ] Segment links by eviction vs money-claim vs tenancy intent.

## `src/app/wizard/flow/page.tsx`
- [ ] Add step-level microcopy explaining legal reason for each question.
- [ ] Add persistent trust panel (checks completed, jurisdiction selected).

## `src/app/wizard/review/page.tsx`
- [ ] Re-state bundle deliverables and passed checks before checkout.
- [ ] Add clear risk-reduction summary.

## Analytics instrumentation additions
- [ ] `landing_path_selected` (home/tools/template pages)
- [ ] `primary_cta_clicked` (all indexable pages)
- [ ] `product_page_viewed` (all `/products/*`)
- [ ] `wizard_started` (with `source_page`, `product_type`, `jurisdiction`)
- [ ] `wizard_completed` (before checkout)
- [ ] `checkout_started` (with `product_type`)
- [ ] `purchase_completed` (with attribution fields)
