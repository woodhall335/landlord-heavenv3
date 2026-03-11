# High Intent Cluster Audit (Phase 2)

## Scope audited
- /section-21-notice-template
- /section-8-notice-template
- /eviction-notice-template
- /tenant-not-paying-rent
- /tenant-wont-leave
- /money-claim-unpaid-rent
- /eviction-cost-uk
- /possession-claim-guide
- /tools/free-section-21-notice-generator
- /tools/free-section-8-notice-generator

## Funnel compliance table

| Page | Current role | Primary CTA route | Funnel status | Fix applied |
|---|---|---|---|---|
| /section-21-notice-template | Notice-intent SEO guide | Product-first | ✅ Compliant | No structural change required |
| /section-8-notice-template | Notice-intent SEO guide | Product-first | ✅ Compliant | No structural change required |
| /eviction-notice-template | Broad notice SEO guide | Product-first | ✅ Compliant | No structural change required |
| /tenant-not-paying-rent | Problem page (arrears) | Wizard-first before fix | ❌ Broken (SEO→wizard) | Hero + in-content CTA moved to /products/money-claim and /products/notice-only |
| /tenant-wont-leave | Problem page (possession) | Wizard-first before fix | ❌ Broken (SEO→wizard) | Hero + in-content CTA moved to /products/notice-only |
| /money-claim-unpaid-rent | Debt recovery SEO page | Wizard-first before fix | ❌ Broken (SEO→wizard) | Hero + in-content CTA moved to /products/money-claim |
| /eviction-cost-uk | Cost/education page | Product-first | ✅ Compliant | No structural change required |
| /possession-claim-guide | Process page | Product-first | ✅ Compliant | No structural change required |
| /tools/free-section-21-notice-generator | Tool landing page | In-page generator first before fix | ⚠️ Partial | Hero primary CTA moved to /products/notice-only, free preview retained as secondary |
| /tools/free-section-8-notice-generator | Tool landing page | In-page generator first before fix | ⚠️ Partial | Hero primary CTA moved to /products/notice-only, free preview retained as secondary |

## Page role classification
- **Problem pages:** /tenant-not-paying-rent, /tenant-wont-leave
- **Process pages:** /possession-claim-guide, /eviction-cost-uk
- **Notice pages:** /section-21-notice-template, /section-8-notice-template, /eviction-notice-template
- **Debt recovery pages:** /money-claim-unpaid-rent
- **Tools (TOFU/MOFU assist pages):** /tools/free-section-21-notice-generator, /tools/free-section-8-notice-generator

## Overlap and cannibalization risks
1. **Section 21 overlap** between /section-21-notice-template, /serve-section-21-notice, and /section-21-validity-checklist.
   - Mitigation: assign distinct intent layers (template vs execution vs validation checklist).
2. **Section 8 overlap** between /section-8-notice-template, /serve-section-8-notice, and /section-8-eviction-process.
   - Mitigation: template page targets drafting intent, service page targets delivery proof, process page targets end-to-end litigation flow.
3. **Arrears overlap** between /tenant-not-paying-rent, /rent-arrears-eviction-guide, /money-claim-unpaid-rent, /recover-rent-arrears-after-eviction.
   - Mitigation: split by tenant-in-property vs tenant-left + possession-first vs debt-first outcomes.

## Recommended canonical hierarchy

### Notice cluster
- Canonical parent: /section-21-notice-template
- Supporting children: /section-21-validity-checklist, /serve-section-21-notice, /n5b-possession-claim-guide

- Canonical parent: /section-8-notice-template
- Supporting children: /serve-section-8-notice, /section-8-eviction-process, /section-8-grounds-explained

### Court/process cluster
- Canonical parent: /possession-claim-guide
- Supporting children: /court-possession-order-guide, /eviction-court-hearing-guide, /possession-order-timeline

### Arrears and recovery cluster
- Canonical parent: /tenant-not-paying-rent
- Supporting children: /rent-arrears-eviction-guide, /money-claim-unpaid-rent, /recover-rent-arrears-after-eviction, /tenant-left-without-paying-rent

### Behaviour/damage cluster
- Canonical parents: /tenant-damaging-property and /tenant-anti-social-behaviour
- Supporting children: /evict-tenant-for-damage, /evict-tenant-anti-social-behaviour
