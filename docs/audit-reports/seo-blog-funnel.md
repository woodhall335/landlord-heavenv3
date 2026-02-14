# SEO Audit Report: Blog Funnel & Cannibalisation Control

**Date:** 2026-01-13
**Auditor:** Claude Code
**Status:** Complete

---

## Part 0 — Audit Summary

### Blog Storage System

| Aspect | Implementation |
|--------|----------------|
| **Storage Type** | Static TypeScript array in `src/lib/blog/posts.tsx` |
| **Format** | Raw JSX content embedded in TypeScript objects |
| **Total Posts** | 100+ blog posts (37,519 lines) |
| **CMS Integration** | None (no Contentlayer, Sanity, or headless CMS) |
| **Deployment** | Build-time static generation |

**Key Files:**
- `src/lib/blog/posts.tsx` - All blog post data (content + metadata)
- `src/lib/blog/types.ts` - BlogPost interface definition
- `src/lib/blog/categories.ts` - Region/category utilities
- `src/app/blog/[slug]/page.tsx` - Dynamic blog page template

### Metadata Handling

**Blog Post Metadata Structure:**
```typescript
interface BlogPost {
  slug: string;
  title: string;
  description: string;
  metaDescription: string;      // SEO-optimized (150-160 chars)
  date: string;
  updatedDate?: string;
  category: string;
  tags: string[];
  targetKeyword: string;        // Primary SEO keyword
  secondaryKeywords: string[];
  faqs?: FAQItem[];             // For FAQ schema
  sources?: SourceLink[];       // For EEAT credibility
  // ... additional fields
}
```

**SEO Features Already Implemented:**
- ✅ Canonical URLs via `generateMetadata()` function
- ✅ Open Graph tags (title, description, image, type)
- ✅ Twitter card metadata
- ✅ Article schema (JSON-LD)
- ✅ Breadcrumb schema
- ✅ FAQ schema (when FAQs present)
- ✅ Keywords from targetKeyword + secondaryKeywords

### Internal Links Handling

**Current Internal Linking Mechanisms:**

1. **NextSteps Component** (`src/components/blog/NextSteps.tsx`)
   - Context-aware CTA links based on slug/category/tags
   - Currently covers: Section 21, Section 8, rent arrears, tenancy agreements, Wales, Scotland, eviction
   - Returns 3-4 prioritized links to products/tools

2. **Related Guides Carousel** (`src/components/blog/RelatedGuidesCarousel.tsx`)
   - Algorithm matches by category first, then shared tags
   - Sorts by recency, limits to 12 guides
   - Horizontal scrollable display

3. **Ask Heaven Widget** (sidebar + mobile)
   - COMPLIANCE_TOPIC_MAP for compliance posts
   - Links to AI-powered Q&A

4. **Sidebar CTA**
   - Static "Get Section 21 — £39.99" CTA
   - Links to `/products/notice-only`

---

## Top "Money" Clusters Analysis

### Cluster 1: Section 21 (High Priority)

| Post Slug | Status |
|-----------|--------|
| `what-is-section-21-notice` | General explainer |
| `section-21-vs-section-8` | Comparison |
| `england-section-21-process` | Process guide |

**Target Products:** Section 21 Notice Template, Section 21 Notice Pack, Section 21 Validator
**NextSteps Coverage:** ✅ Fully covered

### Cluster 2: Section 8 (High Priority)

| Post Slug | Status |
|-----------|--------|
| `section-21-vs-section-8` | Comparison |
| `england-section-8-process` | Process guide |
| `england-section-8-ground-8` | Serious rent arrears |
| `england-section-8-ground-10-11` | Some rent due |
| `england-section-8-ground-14` | Antisocial behaviour |
| `england-section-8-ground-17` | False statements |
| `england-section-8-ground-1` | Landlord occupation |
| `england-section-8-ground-2` | Mortgagee possession |
| `england-section-8-ground-7` | Death of periodic tenant |
| `england-section-8-ground-12` | Tenant breach |

**Target Products:** Section 8 Notice Template, Complete Eviction Pack, Section 8 Validator
**NextSteps Coverage:** ✅ Fully covered

### Cluster 3: Rent Arrears & Money Claims (High Priority)

| Post Slug | Status |
|-----------|--------|
| `rent-arrears-eviction-guide` | General guide |
| `uk-rent-arrears-guide` | UK-wide guide |
| `england-money-claim-online` | MCOL guide |
| `england-particulars-of-claim` | Court documents |
| `uk-money-claims-online-guide` | General MCOL |

**Target Products:** Money Claim Pack, Rent Arrears Calculator
**NextSteps Coverage:** ✅ Fully covered

### Cluster 4: Tenancy Agreements (High Priority)

| Post Slug | Status |
|-----------|--------|
| `england-assured-shorthold-tenancy-guide` | AST guide |
| `uk-tenancy-agreements-guide` | UK-wide guide |
| `scotland-private-residential-tenancy` | Scotland PRT |
| `wales-standard-occupation-contract` | Wales contracts |

**Target Products:** Tenancy Agreement Generator, Agreement Validator
**NextSteps Coverage:** ✅ Fully covered

### Cluster 5: Deposit Protection (Medium Priority)

| Post Slug | Status |
|-----------|--------|
| `uk-deposit-protection-guide` | UK-wide |
| `england-deposit-protection` | England |
| `scotland-deposit-protection` | Scotland |
| `wales-deposit-protection` | Wales |
| `northern-ireland-deposit-protection` | NI |

**Target Products:** Ask Heaven (deposit topic)
**NextSteps Coverage:** ⚠️ NOT COVERED - needs enhancement

### Cluster 6: Safety & Compliance (Medium Priority)

| Post Slug | Topic |
|-----------|-------|
| `uk-gas-safety-landlords` | Gas safety |
| `uk-electrical-safety-landlords` | Electrical/EICR |
| `uk-fire-safety-landlords` | Fire safety |
| `uk-smoke-co-alarm-regulations-guide` | Smoke/CO alarms |
| `uk-epc-requirements-guide` | EPC |
| `uk-right-to-rent-checks` | Right to rent |
| `uk-right-to-rent-guide` | Right to rent |

**Target Products:** Ask Heaven (various compliance topics)
**NextSteps Coverage:** ⚠️ NOT COVERED - needs enhancement

### Cluster 7: Property Inventories (Low Priority)

| Post Slug | Status |
|-----------|--------|
| `uk-property-inventory-guide` | Inventory guide |

**Target Products:** None currently (potential upsell)
**NextSteps Coverage:** ⚠️ NOT COVERED

### Cluster 8: Scotland-Specific (Medium Priority)

| Post Slug | Status |
|-----------|--------|
| `scotland-eviction-process` | Process guide |
| `scotland-notice-to-leave` | Notice guide |
| `scotland-first-tier-tribunal` | Tribunal guide |
| `scotland-eviction-ground-*` | Multiple grounds |
| `scotland-simple-procedure` | Simple procedure |

**Target Products:** Scotland Notice Validator
**NextSteps Coverage:** ✅ Partially covered (only validator)

### Cluster 9: Wales-Specific (Medium Priority)

| Post Slug | Status |
|-----------|--------|
| `wales-renting-homes-act` | Act overview |
| `wales-eviction-process` | Eviction guide |
| `wales-standard-occupation-contract` | Contract guide |
| `rent-smart-wales` | Registration |

**Target Products:** Wales Notice Validator
**NextSteps Coverage:** ✅ Partially covered (only validator)

### Cluster 10: Northern Ireland (Low Priority)

| Post Slug | Status |
|-----------|--------|
| `northern-ireland-private-tenancies-order` | Tenancies |
| `northern-ireland-landlord-registration` | Registration |
| `northern-ireland-eviction-process` | Eviction |
| `northern-ireland-deposit-protection` | Deposit |

**Target Products:** Limited (NI products not fully supported)
**NextSteps Coverage:** ⚠️ NOT COVERED

---

## Part 1 — Gaps & Recommendations

### Gap 1: NextSteps Missing Compliance Coverage

**Current State:** NextSteps only covers eviction-related topics.

**Missing:**
- Deposit protection posts → No link to Ask Heaven
- Gas safety posts → No link to Ask Heaven
- EPC posts → No link to Ask Heaven
- Smoke/CO alarm posts → No link to Ask Heaven
- Right to rent posts → No link to Ask Heaven
- Electrical safety posts → No link to Ask Heaven

**Recommendation:** Enhance `NextSteps.tsx` to detect compliance topics and link to:
1. Ask Heaven with pre-filled topic
2. Related compliance checklist pages (if they exist)

### Gap 2: Northern Ireland Posts Have No CTAs

**Current State:** NI posts don't match any NextSteps conditions.

**Recommendation:** Add NI detection with:
- Ask Heaven CTA (generic)
- Tenancy Agreement product (only product available for NI)

### Gap 3: Scotland/Wales Posts Missing Product CTAs

**Current State:** Only validator links, no product links.

**Recommendation:** Add appropriate product CTAs:
- Scotland → Notice to Leave products
- Wales → Section 173 products

### Gap 4: No Ask Heaven CTA in NextSteps

**Current State:** Ask Heaven widget exists in sidebar but not in NextSteps.

**Recommendation:** Add Ask Heaven as a secondary CTA for all compliance-related posts.

---

## Part 2 — Near-Duplicate Content Analysis

### Potential Duplicate Clusters

| Primary Post | Similar Post | Overlap | Action |
|--------------|--------------|---------|--------|
| `uk-right-to-rent-checks` | `uk-right-to-rent-guide` | High | Consider merge or canonical |
| `uk-electrical-safety-landlords` | `uk-electrical-safety-guide` | High | Consider merge or canonical |
| `what-is-section-21-notice` | `england-section-21-process` | Medium | Different intent - OK |
| `rent-arrears-eviction-guide` | `uk-rent-arrears-guide` | Medium | Different scope - OK |

### Canonical Strategy

**Current Implementation:** ✅ Each post has its own canonical URL set in `generateMetadata()`.

**Recommendation for Duplicates:**
1. Don't delete content
2. Add `rel="canonical"` to secondary posts pointing to primary
3. Add "Updated guide available" banner linking to canonical version

**Files to Update:**
- `uk-right-to-rent-guide` → canonical to `uk-right-to-rent-checks`
- `uk-electrical-safety-guide` → canonical to `uk-electrical-safety-landlords`

---

## Part 3 — Implementation Plan

### 3.1 Enhance NextSteps Component

Add detection for:
- Deposit protection posts → Ask Heaven + deposit topic
- Gas safety posts → Ask Heaven + gas_safety topic
- EPC posts → Ask Heaven + epc topic
- Smoke/CO posts → Ask Heaven + smoke_alarms topic
- Right to rent posts → Ask Heaven + right_to_rent topic
- EICR posts → Ask Heaven + eicr topic
- Northern Ireland posts → Generic Ask Heaven + tenancy agreement
- Inventory posts → Ask Heaven + general guidance

### 3.2 Update Blog Post Types

Add optional `canonicalSlug` field to BlogPost interface for cross-reference.

### 3.3 Add Tests

Test that:
- NextSteps renders for each money cluster
- At least one product/tool link appears for key categories
- Compliance posts get Ask Heaven CTAs

---

## Acceptance Criteria

| Criterion | Current Status | After Implementation |
|-----------|----------------|---------------------|
| Blog posts funnel to money pages | ⚠️ Partial | ✅ All clusters covered |
| Section 21/8 posts have CTAs | ✅ Yes | ✅ Yes |
| Rent arrears posts have CTAs | ✅ Yes | ✅ Yes |
| Tenancy agreement posts have CTAs | ✅ Yes | ✅ Yes |
| Compliance posts have CTAs | ❌ No | ✅ Ask Heaven CTAs |
| Deposit posts have CTAs | ❌ No | ✅ Ask Heaven CTAs |
| NI posts have CTAs | ❌ No | ✅ Generic CTAs |
| Near-duplicates handled | ⚠️ Separate | ✅ Canonical strategy |
| Tests pass | ⚠️ Minimal | ✅ Comprehensive |

---

## Files to Modify

1. `src/components/blog/NextSteps.tsx` - Add compliance topic detection
2. `src/lib/blog/types.ts` - Add canonicalSlug field (optional)
3. `src/lib/blog/posts.tsx` - Add canonical references to duplicate posts
4. `tests/blog/next-steps.test.tsx` - Add tests (create)
