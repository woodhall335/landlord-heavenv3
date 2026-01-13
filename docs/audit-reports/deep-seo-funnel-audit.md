# Deep SEO + Funnel Audit Report

**Date:** 2026-01-13
**Repository:** landlord-heavenv3
**Auditor:** Claude Code
**Status:** COMPLETE - All P0 issues resolved

---

## Executive Summary

This audit addressed critical SEO and conversion funnel issues across the Landlord Heaven platform, focusing on blog CTAs, dead internal links, and jurisdiction-correct routing.

### Top 5 Revenue Opportunities Identified & Addressed

1. **Blog CTA Coverage Gap** - Fixed: All 105 blog posts now have context-aware CTAs (was 79%, now 100%)
2. **Missing Validator References** - Fixed: Removed all references to 4 non-existent validator pages that were causing 404s in sitemap
3. **General Content Funnel Gaps** - Fixed: 22 UK-wide landlord guide posts now route to Ask Heaven + Tenancy Agreement + Eviction Guide
4. **Wales Content Routing** - Fixed: `rent-smart-wales` now correctly routes to Wales-specific CTAs
5. **Canonical Hierarchy** - Verified: No keyword cannibalization detected; clear pillar/cluster structure in place

### Key Metrics (Post-Fix)

| Metric | Before | After |
|--------|--------|-------|
| Blog posts with meaningful CTAs | 83 (79%) | 105 (100%) |
| Posts linking to missing validators | Unknown | 0 |
| Missing validator references in code | 6+ | 0 |
| Sitemap entries for non-existent pages | 4 | 0 |

---

## P0 Issues (Critical - Fixed)

### 1. Missing Validator References

**Issue:** Code referenced 4 validator routes that don't exist as actual pages.

**Files affected:**
- `src/components/blog/NextSteps.tsx:174,185,163-168`
- `src/lib/tools/tools.ts:59-62`
- `scripts/sitemap-audit.ts:144-148`

**Missing routes:**
- `/tools/validators/wales-notice`
- `/tools/validators/scotland-notice-to-leave`
- `/tools/validators/tenancy-agreement`
- `/tools/validators/money-claim`

**Resolution:**
1. Removed from `validatorToolRoutes` in `src/lib/tools/tools.ts`
2. Updated `NextSteps.tsx` to use existing alternatives:
   - Wales: `/wales-eviction-notices` + Ask Heaven for Wales
   - Scotland: `/scotland-eviction-notices` + Ask Heaven for Scotland
   - Tenancy: `/tenancy-agreement-template` + `/products/ast`
3. Updated `sitemap-audit.ts` to only expect validators that exist

**Verification:**
```bash
grep -r "/tools/validators/wales-notice" src/
# Result: No matches found (clean)
```

### 2. Blog NextSteps CTA Coverage

**Issue:** Claim that "only 15 of 106 posts have context-aware CTAs" was investigated.

**Finding:** Claim was INCORRECT. Pre-fix coverage was 79% (83/105 posts). Post-fix is 100%.

**Gap Analysis:**
- 22 posts in "General" cluster lacked specific CTAs
- These were UK-wide guides about insurance, tax, property management, etc.
- `rent-smart-wales` was misclassified (doesn't start with `wales-`)

**Resolution:**
1. Added enhanced fallback logic in `NextSteps.tsx`:
   - Ask Heaven as primary CTA for general posts
   - Tenancy Agreement Generator as secondary
   - UK Eviction Guide as tertiary
2. Added specific handling for `rent-smart-wales`

---

## P1 Issues (Important - Addressed)

### 3. Jurisdiction-Correct CTAs

**Issue:** Ensure no England-only tools appear for Wales/Scotland/NI content.

**Finding:** NextSteps component correctly routes:
- Wales posts → Wales Eviction Guide + Ask Heaven (Wales jurisdiction)
- Scotland posts → Scotland Eviction Guide + Ask Heaven (Scotland jurisdiction)
- NI posts → Ask Heaven (NI jurisdiction) + NI Tenancy Agreement
- Section 21/8 posts → England-specific templates and validators

**No changes needed** - logic already correct.

### 4. Canonicalization & Internal Link Hierarchy

**Finding:** No keyword cannibalization issues detected.

**Cluster Analysis:**

| Cluster | Pillar Page | Supporting Content |
|---------|-------------|-------------------|
| Section 21 | `/section-21-notice-template` | `what-is-section-21-notice`, `section-21-vs-section-8`, `england-section-21-process` |
| Section 8 | `/section-8-notice-template` | `england-section-8-process`, ground-specific posts |
| Money Claim | `/money-claim-unpaid-rent` | `england-money-claim-online`, `uk-money-claims-online-guide` |
| Tenancy | `/tenancy-agreement-template` | `uk-tenancy-agreements-guide`, jurisdiction-specific posts |
| Wales | `/wales-eviction-notices` | 17 wales-prefixed posts |
| Scotland | `/scotland-eviction-notices` | 17 scotland-prefixed posts |

**canonicalSlug Usage:**
- Field exists in `BlogPost` type
- Currently unused (no posts set it)
- Recommend using for near-duplicate content if added in future

---

## Data Tables

### CTA Coverage by Cluster (Post-Fix)

| Cluster | Total Posts | With CTAs | Coverage |
|---------|-------------|-----------|----------|
| General | 26 | 26 | 100% |
| Scotland | 17 | 17 | 100% |
| Wales | 17 | 17 | 100% |
| Section 8 | 12 | 12 | 100% |
| Section 21 | 5 | 5 | 100% |
| HMO | 5 | 5 | 100% |
| Money/Arrears | 5 | 5 | 100% |
| Compliance | 5 | 5 | 100% |
| Eviction | 4 | 4 | 100% |
| Deposit | 4 | 4 | 100% |
| NI | 4 | 4 | 100% |
| Tenancy | 1 | 1 | 100% |
| **Total** | **105** | **105** | **100%** |

### Existing Validator Pages (2 total)

| Route | Status | Priority |
|-------|--------|----------|
| `/tools/validators/section-21` | EXISTS | High |
| `/tools/validators/section-8` | EXISTS | High |

### Removed Validator References (4 total)

| Route | Previously Referenced In | Replacement |
|-------|-------------------------|-------------|
| `/tools/validators/wales-notice` | NextSteps, tools.ts | `/wales-eviction-notices` + Ask Heaven |
| `/tools/validators/scotland-notice-to-leave` | NextSteps, tools.ts | `/scotland-eviction-notices` + Ask Heaven |
| `/tools/validators/tenancy-agreement` | NextSteps, tools.ts | `/tenancy-agreement-template` + `/products/ast` |
| `/tools/validators/money-claim` | tools.ts | `/products/money-claim` |

---

## NextSteps Mapping Rules

The `NextSteps` component in `src/components/blog/NextSteps.tsx` now follows these rules:

### Priority 1 - Specific Content Detection

1. **Section 21 content** → Template + Product + Validator
2. **Section 8 content** → Template + Product + Validator
3. **Rent arrears** → Money Claim Product + Calculator
4. **Tenancy agreement** → AST Product + Template + Ask Heaven
5. **Wales content** → Wales Guide + Ask Heaven + Product
6. **Scotland content** → Scotland Guide + Ask Heaven + Product
7. **NI content** → Ask Heaven + AST Product

### Priority 2 - Compliance Topics

8. **Deposit** → Ask Heaven (deposit topic)
9. **Gas safety** → Ask Heaven (gas_safety topic)
10. **EPC** → Ask Heaven (epc topic)
11. **EICR/Electrical** → Ask Heaven (eicr topic)
12. **Fire/Smoke alarms** → Ask Heaven (smoke_alarms topic)
13. **Right to rent** → Ask Heaven (right_to_rent topic)
14. **Inventory** → Ask Heaven (general topic)
15. **HMO** → Ask Heaven + HMO checker (if available)

### Priority 3 - Enhanced Fallback

16. **General UK guides** → Ask Heaven + Tenancy Agreement + Eviction Guide

### Always Present

17. **Pricing fallback** → Only if no other CTAs apply

---

## Files Changed

### Source Code
- `src/components/blog/NextSteps.tsx` - Fixed Wales/Scotland/tenancy CTAs, added enhanced fallback
- `src/lib/tools/tools.ts` - Removed non-existent validators from `validatorToolRoutes`
- `scripts/sitemap-audit.ts` - Removed expectations for validators we won't build

### New Files Created
- `scripts/blog-cta-coverage.ts` - CTA coverage analysis script
- `docs/audit-reports/blog-cta-coverage.csv` - Per-post CTA coverage data
- `docs/audit-reports/deep-seo-funnel-audit.md` - This report

---

## Verification Commands

### Confirm No Missing Validator References
```bash
grep -r "/tools/validators/wales-notice" src/
grep -r "/tools/validators/scotland-notice-to-leave" src/
grep -r "/tools/validators/tenancy-agreement" src/
grep -r "/tools/validators/money-claim" src/
# All should return: No matches found
```

### Re-run CTA Coverage Analysis
```bash
npx tsx scripts/blog-cta-coverage.ts
# Should show: 105 posts, 100% coverage, 0 missing routes
```

### Validate Sitemap (after build)
```bash
npm run build
npx tsx scripts/sitemap-audit.ts
# Should pass without validator warnings
```

---

## Recommendations for Future Work

### P2 - Nice to Have

1. **Add topic-specific Ask Heaven prompts** for general UK guides based on their content
2. **Implement canonicalSlug** for any near-duplicate content added in future
3. **Add HMO License Checker** CTA to HMO-related posts
4. **Consider jurisdiction-specific product landing pages** (e.g., `/scotland-eviction-pack`)

### Not Recommended

- **DO NOT** create new validators (Wales, Scotland, tenancy, money claim) - constraint from requirements
- **DO NOT** add validators to sitemap until pages exist

---

## Acceptance Criteria Status

| Criterion | Status |
|-----------|--------|
| 0 references to non-existent validator routes | PASS |
| blog-cta-coverage.csv generated | PASS |
| deep-seo-funnel-audit.md written | PASS |
| NextSteps coverage improved without validators | PASS (100%) |
| No jurisdiction-incorrect CTAs | PASS |
| Tests updated/passing | PENDING (deps not installed) |

---

## PR Description

### Summary
- Fixed dead internal links to non-existent validator routes
- Improved blog CTA coverage from 79% to 100%
- Added enhanced fallback CTAs for general UK landlord guides
- Created audit tooling for ongoing CTA coverage monitoring

### Test Plan
- [ ] Run `npx tsx scripts/blog-cta-coverage.ts` - should show 100% coverage
- [ ] Verify no 404s on blog post pages
- [ ] Check Wales/Scotland posts show correct jurisdiction CTAs
- [ ] Verify sitemap audit passes without missing validator warnings
