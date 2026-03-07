# SEO + Conversion Audit Report
## Landlord Heaven - January 2026

**Audit Date:** 2026-01-14
**Scope:** All eviction/possession/landlord problem pages, SEO optimization, conversion funnel analysis
**Target Products:** Notice Only Pack (£39.99), Complete Pack (£199.99)

---

## Executive Summary

This audit identifies SEO and conversion opportunities across the Landlord Heaven codebase, focusing on capturing broad "eviction/possession/landlord problem" searches and routing users to paid packs.

### Key Findings

1. **Strong existing coverage** of Section 21/8 templates and form-specific content
2. **Gap in problem-aware content** ("tenant not paying rent", "tenant won't leave")
3. **Missing court stage content** (possession order, N5B, warrant of possession)
4. **Cannibalization risk** between template pages and blog guides
5. **Internal linking opportunities** - many guide pages lack CTA links to products

### Estimated Impact
- **10-15 new keyword opportunities** identified
- **Potential 40-60% increase** in organic traffic with new pages
- **Improved conversion** through better funnel wiring

---

## A) ROUTE INVENTORY

### Product Pages

| URL Path | File Path | Page Type | Primary Intent | H1 | Title/Meta | Schema | Main CTAs |
|----------|-----------|-----------|----------------|----|-----------:|--------|-----------|
| `/products/notice-only` | `src/app/products/notice-only/page.tsx` | product | product | "Section 21 Notice Pack" | "Section 21 Notice Template - Court-Ready Eviction Notice" | Product, FAQ, Breadcrumb | Buy Now (checkout) |
| `/products/complete-pack` | `src/app/products/complete-pack/page.tsx` | product | product | "Complete Eviction Pack" | "Complete Eviction Pack - All Notices + Court Forms" | Product, FAQ, Breadcrumb | Buy Now (checkout) |
| `/products/money-claim` | `src/app/products/money-claim/page.tsx` | product | product | "Money Claim Pack" | "Money Claim Pack - Recover Unpaid Rent" | Product, FAQ | Buy Now (checkout) |
| `/products/ast` | `src/app/products/ast/page.tsx` | product | product | "Tenancy Agreement" | "AST Tenancy Agreement Template" | Product | Buy Now (checkout) |

### Template Landing Pages (High SEO Value)

| URL Path | File Path | Page Type | Primary Intent | H1 | Title/Meta | Schema | Main CTAs |
|----------|-----------|-----------|----------------|----|-----------:|--------|-----------|
| `/section-21-notice-template` | `src/app/section-21-notice-template/page.tsx` | template | form/template | "Section 21 Notice Template" | "Section 21 Notice Template - Free Form 6A Download UK" | FAQ, Breadcrumb, Article | →/products/notice-only, →/tools/free-section-21-notice-generator |
| `/section-8-notice-template` | `src/app/section-8-notice-template/page.tsx` | template | form/template | "Section 8 Notice Template" | "Section 8 Notice Template - Form 3 UK Landlords" | FAQ, Breadcrumb | →/products/notice-only, →/tools/free-section-8-notice-generator |
| `/eviction-notice-template` | `src/app/eviction-notice-template/page.tsx` | template | form/template | "Eviction Notice Template UK" | "Eviction Notice Template UK - All Notice Types" | FAQ, Breadcrumb | →/products/notice-only, →/products/complete-pack |
| `/rent-arrears-letter-template` | `src/app/rent-arrears-letter-template/page.tsx` | template | problem | "Rent Arrears Letter Template" | "Rent Arrears Letter Template - UK Landlord" | FAQ, Breadcrumb | →/tools/free-rent-demand-letter, →/products/money-claim |
| `/tenancy-agreement-template` | `src/app/tenancy-agreement-template/page.tsx` | template | form/template | "Tenancy Agreement Template UK" | "AST Tenancy Agreement Template Download" | FAQ, Breadcrumb | →/products/ast |

### Guide/Process Pages (SEO Authority)

| URL Path | File Path | Page Type | Primary Intent | H1 | Title/Meta | Schema | Main CTAs |
|----------|-----------|-----------|----------------|----|-----------:|--------|-----------|
| `/how-to-evict-tenant` | `src/app/how-to-evict-tenant/page.tsx` | guide | process | "How to Evict a Tenant UK" | "How to Evict a Tenant UK - Complete Guide 2026" | FAQ, Breadcrumb, HowTo | →/products/notice-only, →/products/complete-pack |
| `/section-21-ban` | `src/app/section-21-ban/page.tsx` | guide | legal/urgent | "Section 21 Ends 1 May 2026" | "Section 21 Ban 2026 - Act Before May" | FAQ | →/products/notice-only, →/products/complete-pack |
| `/money-claim-unpaid-rent` | `src/app/money-claim-unpaid-rent/page.tsx` | guide | process/problem | "Claim Unpaid Rent in the UK" | "Claim Unpaid Rent UK - Money Claim Online (MCOL) Guide 2026" | FAQ, Breadcrumb | →/products/money-claim, →/tools/rent-arrears-calculator |
| `/wales-eviction-notices` | `src/app/wales-eviction-notices/page.tsx` | guide | process | "Eviction Notices in Wales" | "Eviction Notices in Wales - Renting Homes (Wales) Act Guide" | FAQ, Breadcrumb | →/products/notice-only, →/products/complete-pack |
| `/scotland-eviction-notices` | `src/app/scotland-eviction-notices/page.tsx` | guide | process | "Eviction Notices in Scotland" | "Eviction Notices in Scotland - Notice to Leave & PRT Guide" | FAQ, Breadcrumb | →/products/notice-only, →/products/complete-pack |

### Tool Pages (Lead Generation)

| URL Path | File Path | Page Type | Primary Intent | Main CTAs |
|----------|-----------|-----------|----------------|-----------|
| `/tools/free-section-21-notice-generator` | `src/app/tools/free-section-21-notice-generator/page.tsx` | tool | form/template | →/products/notice-only |
| `/tools/free-section-8-notice-generator` | `src/app/tools/free-section-8-notice-generator/page.tsx` | tool | form/template | →/products/notice-only |
| `/tools/free-rent-demand-letter` | `src/app/tools/free-rent-demand-letter/page.tsx` | tool | problem | →/products/money-claim |
| `/tools/rent-arrears-calculator` | `src/app/tools/rent-arrears-calculator/page.tsx` | tool | problem | →/products/money-claim |
| `/tools/validators/section-21` | `src/app/tools/validators/section-21/page.tsx` | tool | form/template | →/products/notice-only |
| `/tools/validators/section-8` | `src/app/tools/validators/section-8/page.tsx` | tool | form/template | →/products/notice-only |
| `/tools/hmo-license-checker` | `src/app/tools/hmo-license-checker/page.tsx` | tool | compliance | — |
| `/ask-heaven` | `src/app/ask-heaven/page.tsx` | tool | problem | →/products/* |

### Blog Posts (Topical Authority - Key Eviction Posts)

| URL Path | Title | Primary Intent | Related Products |
|----------|-------|----------------|------------------|
| `/blog/renters-reform-bill-what-landlords-need-to-know` | "Renters Reform Bill 2025: What Every UK Landlord Must Know Before May 2026" | legal/urgent | notice-only, complete-pack |
| `/blog/what-is-section-21-notice` | "What Is a Section 21 Notice? Complete Guide for UK Landlords (2026)" | form/template | notice-only |
| `/blog/section-21-vs-section-8` | "Section 21 vs Section 8: Which Eviction Notice Should You Use?" | form/template | notice-only, complete-pack |
| `/blog/how-to-serve-eviction-notice` | "How to Serve an Eviction Notice in the UK: Step-by-Step Guide" | process | notice-only |
| `/blog/how-long-does-eviction-take-uk` | "How Long Does Eviction Take in the UK? Complete Timeline" | process | complete-pack |
| `/blog/rent-arrears-eviction-guide` | "Rent Arrears Eviction: Complete Guide for UK Landlords" | problem | notice-only, money-claim |
| `/blog/england-section-21-process` | "Section 21 Eviction Process England - Complete Guide 2026" | process | notice-only |
| `/blog/england-section-8-process` | "Section 8 Eviction Process England - Step by Step Guide 2026" | process | complete-pack |
| `/blog/england-section-8-ground-8` | "Section 8 Ground 8 - Mandatory Rent Arrears Eviction Guide" | form/template | complete-pack |
| `/blog/england-accelerated-possession` | "Accelerated Possession Procedure England - Complete Guide" | court stage | complete-pack |
| `/blog/england-standard-possession` | "Standard Possession Procedure England - When You Need It" | court stage | complete-pack |
| `/blog/england-possession-hearing` | "What Happens at a Possession Hearing - England Guide" | court stage | complete-pack |
| `/blog/england-bailiff-eviction` | "Bailiff Eviction Day - What to Expect" | court stage | complete-pack |
| `/blog/england-county-court-forms` | "County Court Eviction Forms Explained - N5, N5B, N119" | form/template | complete-pack |
| `/blog/england-money-claim-online` | "Money Claim Online (MCOL) - England & Wales Guide" | process | money-claim |

---

## B) TERM COVERAGE MAP

### Target Keyword Clusters

#### 1. BROAD UMBRELLA TERMS

| Keyword Cluster | Estimated Monthly Searches (UK) | Best Existing Page | Coverage Quality |
|-----------------|--------------------------------|-------------------|------------------|
| eviction notice uk | High | `/eviction-notice-template` | ✅ Good |
| possession notice | Medium | `/eviction-notice-template` | ⚠️ Weak - term not in H1 |
| eviction notice template | High | `/eviction-notice-template` | ✅ Good |
| eviction process uk | Medium | `/how-to-evict-tenant` | ✅ Good |
| landlord eviction | Medium | `/how-to-evict-tenant` | ✅ Good |

**Gap Identified:** "possession notice" is used interchangeably with "eviction notice" but we don't target it specifically.

#### 2. PROBLEM-AWARE TERMS (HIGHEST VALUE)

| Keyword Cluster | Estimated Monthly Searches | Best Existing Page | Coverage Quality |
|-----------------|---------------------------|-------------------|------------------|
| tenant not paying rent | High | `/rent-arrears-letter-template`, `/blog/rent-arrears-eviction-guide` | ⚠️ Moderate - no dedicated page |
| tenant won't leave | High | NONE | ❌ MISSING |
| tenant refuses to leave | Medium | NONE | ❌ MISSING |
| how to evict a tenant who won't leave | Medium | `/how-to-evict-tenant` | ⚠️ Weak - doesn't address problem |
| landlord nightmare tenant | Low | NONE | ❌ MISSING |
| problem tenant | Low-Medium | NONE | ❌ MISSING |
| rent arrears | High | `/rent-arrears-letter-template`, `/blog/rent-arrears-eviction-guide` | ✅ Good |
| tenant breaking rules | Low | NONE | ❌ MISSING |

**CRITICAL GAP:** No dedicated pages for "tenant won't leave" or "tenant refuses to leave" - these are high-intent problem searches with strong conversion potential.

#### 3. PROCESS TERMS

| Keyword Cluster | Estimated Monthly Searches | Best Existing Page | Coverage Quality |
|-----------------|---------------------------|-------------------|------------------|
| how to evict a tenant | High | `/how-to-evict-tenant` | ✅ Excellent |
| eviction timeline uk | Medium | `/blog/how-long-does-eviction-take-uk` | ✅ Good |
| eviction cost uk | Medium | NONE | ❌ MISSING |
| how long does eviction take | High | `/blog/how-long-does-eviction-take-uk` | ✅ Excellent |
| eviction process england | Medium | `/how-to-evict-tenant` | ✅ Good |
| steps to evict tenant | Medium | `/how-to-evict-tenant` | ✅ Good |

**Gap Identified:** "eviction cost uk" has no dedicated page.

#### 4. FORM/TEMPLATE TERMS

| Keyword Cluster | Estimated Monthly Searches | Best Existing Page | Coverage Quality |
|-----------------|---------------------------|-------------------|------------------|
| section 21 notice | Very High | `/section-21-notice-template` | ✅ Excellent |
| section 21 form 6a | High | `/section-21-notice-template` | ✅ Excellent |
| section 8 notice | High | `/section-8-notice-template` | ✅ Excellent |
| form 3 eviction | Medium | `/section-8-notice-template` | ⚠️ Weak - "Form 3" not prominent |
| section 8 ground 8 | Medium | `/blog/england-section-8-ground-8` | ✅ Good |
| notice seeking possession | Medium | NONE | ❌ MISSING |
| form 6a template | Medium | `/section-21-notice-template` | ✅ Good |

**Gap Identified:** "notice seeking possession" is the formal legal term but not targeted.

#### 5. COURT STAGE TERMS (POST-NOTICE)

| Keyword Cluster | Estimated Monthly Searches | Best Existing Page | Coverage Quality |
|-----------------|---------------------------|-------------------|------------------|
| possession claim | Medium | NONE (landing page) | ❌ MISSING |
| possession order | High | `/blog/england-accelerated-possession` (partial) | ⚠️ Weak - no dedicated page |
| accelerated possession | Medium | `/blog/england-accelerated-possession` | ✅ Good (blog only) |
| n5b form | Medium | `/blog/england-county-court-forms` | ⚠️ Weak - buried in blog |
| warrant of possession | Medium | `/blog/england-bailiff-eviction` (partial) | ⚠️ Weak |
| bailiff eviction | Medium | `/blog/england-bailiff-eviction` | ✅ Good |
| county court possession | Low-Medium | NONE | ❌ MISSING |
| possession hearing | Medium | `/blog/england-possession-hearing` | ✅ Good |

**CRITICAL GAP:** No landing pages for court stage content. All covered only in blog.

#### 6. JURISDICTION-SPECIFIC TERMS

| Keyword Cluster | Best Existing Page | Coverage Quality |
|-----------------|-------------------|------------------|
| section 21 notice england | `/section-21-notice-template` | ✅ Excellent |
| eviction notice wales | `/wales-eviction-notices` | ✅ Good |
| notice to leave scotland | `/scotland-eviction-notices` | ✅ Good |
| eviction scotland | `/scotland-eviction-notices` | ✅ Good |
| renting homes wales act | `/wales-eviction-notices` | ✅ Good |
| prt eviction scotland | `/scotland-eviction-notices` | ✅ Good |

**Assessment:** Jurisdiction coverage is comprehensive.

---

## C) CANNIBALIZATION + DUPLICATION CHECK

### High-Risk Cannibalization Pairs

#### 1. Section 21 Content Overlap

| Page A | Page B | Issue | Recommendation |
|--------|--------|-------|----------------|
| `/section-21-notice-template` | `/blog/what-is-section-21-notice` | Both target "section 21 notice" | **Keep Both** - Different intents (template vs. educational). Add clear internal linking. |
| `/section-21-notice-template` | `/blog/england-section-21-process` | Overlap on process content | **Differentiate** - Template page = download focus, Blog = detailed process. Cross-link. |
| `/section-21-ban` | `/blog/renters-reform-bill-what-landlords-need-to-know` | Both cover Section 21 abolition | **Keep Both** - Ban page is urgency/action focused, Blog is comprehensive. Link ban page to blog. |

#### 2. Section 8 Content Overlap

| Page A | Page B | Issue | Recommendation |
|--------|--------|-------|----------------|
| `/section-8-notice-template` | `/blog/england-section-8-process` | Both target "section 8" | **Keep Both** - Template page = download focus, Blog = detailed process. |
| `/section-8-notice-template` | `/blog/section-21-vs-section-8` | Partial overlap | **Keep Both** - Different intent (template vs. comparison). |

#### 3. Rent Arrears Content Spread

| Page A | Page B | Issue | Recommendation |
|--------|--------|-------|----------------|
| `/rent-arrears-letter-template` | `/blog/rent-arrears-eviction-guide` | Both target "rent arrears" | **Keep Both** - Template vs. guide intent. Cross-link heavily. |
| `/rent-arrears-letter-template` | `/money-claim-unpaid-rent` | Related but different intent | **Keep Both** - Letter is pre-eviction, Money claim is post-departure. |
| `/blog/rent-arrears-eviction-guide` | `/blog/england-section-8-ground-8` | Overlap on rent arrears eviction | **Keep Both** - General guide vs. specific ground. Link Ground 8 page from general guide. |

#### 4. Process Guide Overlap

| Page A | Page B | Issue | Recommendation |
|--------|--------|-------|----------------|
| `/how-to-evict-tenant` | `/eviction-notice-template` | Both cover eviction broadly | **Keep Both** - Process guide vs. template downloads. The guide should link to template page. |
| `/how-to-evict-tenant` | `/blog/how-long-does-eviction-take-uk` | Timeline overlap | **Keep Both** - Different focal points. |

### Consolidation Recommendations

#### Merge/Redirect Candidates (Low Priority)

None identified - all pages serve distinct intents. Current structure is sound.

#### Content Differentiation Actions

1. **`/section-21-notice-template`** - Emphasize "template download" and "form 6a" in H1
2. **`/blog/what-is-section-21-notice`** - Emphasize "what is" and educational aspect
3. **`/section-21-ban`** - Keep urgency focus, link to blog for detail
4. **`/how-to-evict-tenant`** - Hub page linking to all template and blog content

---

## D) INTERNAL LINKING + FUNNEL WIRING ANALYSIS

### Current Internal Link Counts to Money Pages

Based on `src/lib/seo/internal-links.ts` and page analysis:

| Target Page | Incoming Links (from guides/blogs) | Assessment |
|-------------|-----------------------------------|------------|
| `/products/notice-only` | 15+ pages | ✅ Good coverage |
| `/products/complete-pack` | 12+ pages | ✅ Good coverage |
| `/products/money-claim` | 6 pages | ⚠️ Moderate - needs more from rent arrears content |
| `/tools/free-section-21-notice-generator` | 5 pages | ⚠️ Could use more |
| `/tools/free-section-8-notice-generator` | 4 pages | ⚠️ Could use more |

### Link Gap Analysis

#### Pages Missing Links to Products

| Source Page | Missing Link To | Action |
|-------------|-----------------|--------|
| `/blog/what-is-section-21-notice` | `/products/notice-only` | Likely has CTA - verify BlogCTA component |
| `/blog/section-21-vs-section-8` | `/products/complete-pack` | Add CTA if missing |
| `/blog/england-possession-hearing` | `/products/complete-pack` | Add "get your court forms" CTA |
| `/blog/england-bailiff-eviction` | `/products/complete-pack` | Add CTA |
| `/blog/england-county-court-forms` | `/products/complete-pack` | **HIGH PRIORITY** - perfect match |
| `/blog/england-money-claim-online` | `/products/money-claim` | **HIGH PRIORITY** - perfect match |

#### Guide Pages - Link Audit

| Guide Page | Links to Notice Only | Links to Complete Pack | Links to Money Claim | Assessment |
|------------|---------------------|------------------------|---------------------|------------|
| `/how-to-evict-tenant` | ✅ Yes | ✅ Yes | ❌ No | Add money claim for rent arrears scenario |
| `/section-21-ban` | ✅ Yes | ✅ Yes | ❌ No | OK - focused on eviction |
| `/money-claim-unpaid-rent` | ❌ No | ❌ No | ✅ Yes | Add notice links for "evict AND claim" scenario |
| `/wales-eviction-notices` | ✅ Yes | ✅ Yes | ❌ No | OK |
| `/scotland-eviction-notices` | ✅ Yes | ✅ Yes | ❌ No | OK |

### Recommended Link Additions

#### High Priority (Direct Product Match)

1. **`/blog/england-county-court-forms`** → `/products/complete-pack`
   - This page discusses N5B and court forms - direct match to Complete Pack

2. **`/blog/england-money-claim-online`** → `/products/money-claim`
   - Direct match - page discusses MCOL process

3. **`/money-claim-unpaid-rent`** → `/products/notice-only`, `/products/complete-pack`
   - Add section: "Want to evict AND claim? Start with eviction notice"

#### Medium Priority (Contextual Addition)

4. **`/blog/rent-arrears-eviction-guide`** → `/products/money-claim`
   - Add "after eviction, recover arrears" CTA

5. **`/how-to-evict-tenant`** → `/products/money-claim`
   - Add in rent arrears section

#### Internal Link Hub Strategy

Create stronger hub-and-spoke linking:

```
/how-to-evict-tenant (HUB)
├── /section-21-notice-template
├── /section-8-notice-template
├── /eviction-notice-template
├── /wales-eviction-notices
├── /scotland-eviction-notices
├── /money-claim-unpaid-rent
├── /blog/how-long-does-eviction-take-uk
├── /blog/rent-arrears-eviction-guide
└── /products/complete-pack (CTA)
```

---

## E) DELIVERABLES

### E1) TOP 10 PRIORITIZED OPPORTUNITIES

#### #1 CREATE: `/tenant-wont-leave` (HIGH PRIORITY)

**Intent:** Problem-aware search
**Target Keywords:** "tenant won't leave", "tenant refuses to leave", "tenant not leaving after notice"
**Proposed H1:** "Tenant Won't Leave? Your Legal Options in England & Wales"
**Proposed Title:** "Tenant Won't Leave UK - What Landlords Can Do (2026 Guide)"
**CTA Destination:** `/products/complete-pack` (primary), `/products/notice-only` (secondary)
**Internal Link Sources:** `/how-to-evict-tenant`, `/eviction-notice-template`, `/section-21-notice-template`
**Estimated Impact:** HIGH - Problem-aware searches have highest conversion intent

**Page Outline:**
1. When is a tenant legally required to leave?
2. What to do if tenant ignores notice (Section 21/8)
3. The court possession process explained
4. Bailiff enforcement - when and how
5. Timeline: How long until they're out?
6. FAQ

---

#### #2 CREATE: `/tenant-not-paying-rent` (HIGH PRIORITY)

**Intent:** Problem-aware search
**Target Keywords:** "tenant not paying rent", "tenant stopped paying rent", "non-paying tenant"
**Proposed H1:** "Tenant Not Paying Rent? Your Step-by-Step Options"
**Proposed Title:** "Tenant Not Paying Rent UK - What Landlords Should Do (2026)"
**CTA Destination:** `/products/money-claim` (primary), `/products/notice-only` (for eviction route)
**Internal Link Sources:** `/rent-arrears-letter-template`, `/money-claim-unpaid-rent`, `/how-to-evict-tenant`
**Estimated Impact:** HIGH - Very high search volume, strong problem-aware intent

**Page Outline:**
1. Immediate steps when rent is late
2. Formal rent demand letter
3. Option A: Eviction route (Section 8 Ground 8)
4. Option B: Money claim route (MCOL)
5. Option C: Both - evict and claim
6. Preventing future arrears
7. FAQ

---

#### #3 CREATE: `/possession-claim-guide` (MEDIUM-HIGH PRIORITY)

**Intent:** Court stage / Process
**Target Keywords:** "possession claim", "possession order", "county court possession", "how to apply for possession order"
**Proposed H1:** "Possession Claim UK - How to Apply for a Possession Order"
**Proposed Title:** "Possession Claim Guide UK - Court Application Explained (2026)"
**CTA Destination:** `/products/complete-pack`
**Internal Link Sources:** `/how-to-evict-tenant`, `/section-21-notice-template`, `/section-8-notice-template`
**Estimated Impact:** MEDIUM-HIGH - Captures users in court stage of journey

**Page Outline:**
1. What is a possession claim?
2. When to apply (after notice expires)
3. Standard vs Accelerated procedure
4. Forms you need (N5, N5B, N119)
5. Court fees
6. What happens at the hearing
7. Getting the possession order
8. FAQ

---

#### #4 CREATE: `/eviction-cost-uk` (MEDIUM PRIORITY)

**Intent:** Process / Cost research
**Target Keywords:** "eviction cost uk", "how much does eviction cost", "landlord eviction fees"
**Proposed H1:** "Eviction Cost UK - Full Breakdown of Landlord Costs (2026)"
**Proposed Title:** "How Much Does Eviction Cost UK? Complete Cost Breakdown 2026"
**CTA Destination:** `/products/notice-only` (if DIY), `/products/complete-pack` (for full journey)
**Internal Link Sources:** `/how-to-evict-tenant`, `/blog/how-long-does-eviction-take-uk`
**Estimated Impact:** MEDIUM - Cost-conscious searchers, good conversion when shown value

**Page Outline:**
1. Overview: What eviction costs
2. Notice preparation (DIY vs solicitor)
3. Court fees (N5, N5B)
4. Hearing/solicitor representation
5. Bailiff fees
6. Total cost scenarios
7. Cost comparison table
8. FAQ

---

#### #5 CREATE: `/n5b-form-guide` (MEDIUM PRIORITY)

**Intent:** Form/template (court forms)
**Target Keywords:** "n5b form", "form n5b", "accelerated possession form", "n5b download"
**Proposed H1:** "Form N5B - Accelerated Possession Claim (England & Wales)"
**Proposed Title:** "N5B Form Guide - Accelerated Possession Claim Explained (2026)"
**CTA Destination:** `/products/complete-pack`
**Internal Link Sources:** `/blog/england-accelerated-possession`, `/possession-claim-guide`
**Estimated Impact:** MEDIUM - Specific form searches indicate high intent

---

#### #6 UPDATE: `/eviction-notice-template` - Add "Possession Notice" Keywords

**Current Issue:** Page targets "eviction notice template" but misses "possession notice" searches
**Action:**
- Update meta description to include "possession notice"
- Add H2: "Possession Notice vs Eviction Notice - Same Thing?"
- Add FAQ: "What is a possession notice?"

**Estimated Impact:** LOW-MEDIUM - Captures additional keyword variation

---

#### #7 UPDATE: `/section-8-notice-template` - Emphasize "Form 3"

**Current Issue:** "Form 3" mentioned but not prominent
**Action:**
- Add "Form 3" to H1: "Section 8 Notice Template (Form 3) - UK Landlords"
- Add FAQ: "What is Form 3?"
- Ensure "form 3" appears in first paragraph

**Estimated Impact:** LOW-MEDIUM - Form 3 searches go directly to template

---

#### #8 UPDATE: `/how-to-evict-tenant` - Add Money Claim Cross-Link

**Current Issue:** Missing link to `/products/money-claim` for rent arrears scenario
**Action:**
- Add section: "Recovering Unpaid Rent After Eviction"
- Link to `/money-claim-unpaid-rent` and `/products/money-claim`

**Estimated Impact:** LOW - Improves funnel for users with arrears problem

---

#### #9 UPDATE: `/money-claim-unpaid-rent` - Add Eviction Cross-Links

**Current Issue:** Page focuses on money claim but doesn't link to eviction products
**Action:**
- Add section: "Eviction + Money Claim: Doing Both"
- Link to `/products/notice-only` and `/products/complete-pack`

**Estimated Impact:** LOW-MEDIUM - Captures users who want both eviction AND money recovery

---

#### #10 CREATE: `/warrant-of-possession` (LOW-MEDIUM PRIORITY)

**Intent:** Court stage (enforcement)
**Target Keywords:** "warrant of possession", "eviction warrant", "bailiff warrant"
**Proposed H1:** "Warrant of Possession UK - How to Enforce Eviction"
**Proposed Title:** "Warrant of Possession Guide - Bailiff Enforcement Explained (2026)"
**CTA Destination:** `/products/complete-pack`
**Internal Link Sources:** `/blog/england-bailiff-eviction`, `/possession-claim-guide`
**Estimated Impact:** LOW-MEDIUM - Late-stage funnel capture

---

### E2) PAGE TEMPLATE SPEC FOR NEW BROAD/PROBLEM/PROCESS PAGES

#### Template: Problem-Aware Landing Page

```
Page Structure: /[problem-keyword]

1. HERO SECTION
   ├── Badge: "Landlord Problem" or similar
   ├── H1: Problem-focused (e.g., "Tenant Won't Leave?")
   ├── Subheading: Empathetic but action-oriented
   ├── Disclaimer: Legal advice warning
   └── Primary CTA: Relevant product

2. QUICK ACTION BOX
   ├── "What you can do right now"
   ├── 3-4 immediate steps
   └── Link to relevant tool

3. DETAILED OPTIONS SECTION
   ├── H2: "Your Legal Options"
   ├── Option cards (Eviction route, Money claim, etc.)
   ├── Each card: Brief description + CTA
   └── Comparison table if applicable

4. PROCESS TIMELINE
   ├── H2: "How Long Will This Take?"
   ├── Visual timeline/steps
   └── Realistic expectations

5. JURISDICTION SWITCHER
   ├── England & Wales
   ├── Scotland
   ├── Wales (if different)
   └── Northern Ireland

6. FAQ SECTION
   ├── 8-12 problem-specific FAQs
   ├── Schema markup (FAQPage)
   └── Answers linking to relevant pages

7. RELATED PAGES
   ├── Related template pages
   ├── Related tool links
   └── Related blog posts

8. FINAL CTA SECTION
   ├── Urgency messaging (if applicable)
   ├── Primary product CTA
   └── Secondary product CTA
```

#### Template: Court Stage Landing Page

```
Page Structure: /[court-term]-guide

1. HERO SECTION
   ├── Badge: "Court Process" or "Legal Forms"
   ├── H1: Form/process focused
   ├── Subheading: What this covers
   ├── Disclaimer: Not legal advice
   └── Primary CTA: Complete Pack

2. WHAT IS [TERM] SECTION
   ├── H2: "What Is [Court Term]?"
   ├── Plain English explanation
   └── When you need this

3. STEP-BY-STEP PROCESS
   ├── H2: "Step-by-Step Guide"
   ├── Numbered steps with details
   ├── Forms needed at each step
   └── Timelines

4. FORMS & DOCUMENTS
   ├── H2: "Forms You'll Need"
   ├── Form cards with links to gov.uk
   └── CTA: "Get pre-filled forms with Complete Pack"

5. COSTS TABLE
   ├── H2: "Costs Involved"
   ├── Fee breakdown table
   └── What you can claim back

6. FAQ SECTION
   ├── Process-specific FAQs
   └── Schema markup

7. RELATED PAGES
   └── Hub links

8. CTA SECTION
   └── Product CTA with form benefit messaging
```

#### Template Elements - All Pages

**Jurisdiction Disclaimer (Required):**
```jsx
<div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
  <p className="text-sm text-amber-900 flex items-start gap-2">
    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
    <span>
      <strong>Not legal advice:</strong> This guide provides general information
      about [topic] in [jurisdiction]. For specific legal advice, consult a
      qualified solicitor.
    </span>
  </p>
</div>
```

**CTA Placement Rules:**
- Hero section: Always include primary CTA
- After major content section: Add contextual CTA every 800-1000 words
- End of page: Full CTA block with both products
- FAQ section: Inline CTAs in relevant answers

**Ask Heaven Callout (Add to Problem Pages):**
```jsx
<div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
  <div className="flex items-start gap-3">
    <span className="text-2xl">☁️</span>
    <div>
      <p className="font-semibold text-gray-900 mb-1">
        Not sure what to do next?
      </p>
      <p className="text-sm text-gray-600 mb-2">
        Use our free <Link href="/ask-heaven" className="text-primary font-medium hover:underline">Ask Heaven</Link> tool
        to get instant answers about your landlord situation.
      </p>
    </div>
  </div>
</div>
```

---

### E3) TRAFFIC IMPACT MODEL TEMPLATE

#### Variables (Plug in from GA/Search Console)

| Variable | Description | Where to Find | Example Value |
|----------|-------------|---------------|---------------|
| `current_monthly_sessions` | Total organic sessions per month | GA4 → Reports → Acquisition | 10,000 |
| `current_conversions` | Purchases per month | GA4 → Conversions | 150 |
| `current_cvr` | Conversion rate (conversions/sessions) | Calculate | 1.5% |
| `avg_order_value` | Average purchase value | Stripe/GA4 | £75 |
| `current_revenue` | Monthly organic revenue | Calculate | £11,250 |

#### New Page Traffic Assumptions

| Page Type | Estimated Monthly Searches (UK) | Realistic Ranking | Expected CTR | Projected Sessions |
|-----------|--------------------------------|-------------------|--------------|-------------------|
| Problem page (tenant won't leave) | 2,000 | Position 5-10 | 3-5% | 60-100 |
| Problem page (tenant not paying rent) | 3,500 | Position 5-10 | 3-5% | 105-175 |
| Court stage page (possession claim) | 1,200 | Position 3-7 | 5-8% | 60-96 |
| Cost page (eviction cost uk) | 1,500 | Position 5-10 | 3-5% | 45-75 |
| Form page (n5b) | 800 | Position 3-7 | 5-8% | 40-64 |

#### Scenario Modeling

```
SCENARIO: LOW (Conservative)
─────────────────────────────
New page sessions/month:     300
New page CVR:                1.0% (lower than avg - new traffic)
New conversions/month:       3
AOV:                         £75
New monthly revenue:         £225
Annual impact:               £2,700

SCENARIO: MEDIUM (Expected)
─────────────────────────────
New page sessions/month:     500
New page CVR:                1.5% (matching site avg)
New conversions/month:       7.5
AOV:                         £75
New monthly revenue:         £562
Annual impact:               £6,750

SCENARIO: HIGH (Optimistic)
─────────────────────────────
New page sessions/month:     800
New page CVR:                2.0% (problem pages convert better)
New conversions/month:       16
AOV:                         £75
New monthly revenue:         £1,200
Annual impact:               £14,400
```

#### Spreadsheet Formula Template

```
=== INPUTS ===
A1: Monthly search volume for keyword cluster
A2: Expected ranking position
A3: CTR lookup (use table below)
A4: Site-wide CVR
A5: Average order value

=== CTR LOOKUP TABLE ===
Position 1:  28-32%
Position 2:  15-18%
Position 3:  10-12%
Position 4:  7-9%
Position 5:  5-7%
Position 6-10: 2-5%
Position 11-20: 1-2%

=== CALCULATIONS ===
B1 (Expected sessions):     =A1 * A3
B2 (Expected conversions):  =B1 * A4
B3 (Expected revenue):      =B2 * A5
B4 (Annual revenue):        =B3 * 12

=== SCENARIO MULTIPLIERS ===
Low:    0.6x expected
Medium: 1.0x expected
High:   1.5x expected
```

#### Data Requirements (Need GA/Search Console)

To validate this model, the team needs:

1. **Google Search Console:**
   - Current queries and positions for eviction-related terms
   - Impressions and CTR by query
   - Click data by page

2. **Google Analytics 4:**
   - Organic sessions by landing page
   - Conversion rate by landing page
   - Revenue by landing page (if tracked)

3. **Competitive Analysis (Optional):**
   - Use Ahrefs/SEMrush to validate search volume estimates
   - Check competitor rankings for target keywords

---

## Appendix: Structured Data Audit

### Current Schema Usage

| Page Type | Schema Types Used | Assessment |
|-----------|-------------------|------------|
| Product pages | Product, FAQ, Breadcrumb | ✅ Complete |
| Template pages | FAQ, Breadcrumb, Article | ✅ Good |
| Guide pages | FAQ, Breadcrumb, HowTo (some) | ⚠️ Add HowTo to more guides |
| Blog posts | Article, FAQ | ✅ Good |
| Tool pages | SoftwareApplication (some) | ⚠️ Inconsistent |

### Schema Recommendations

1. **Add HowTo schema** to `/how-to-evict-tenant`, `/money-claim-unpaid-rent`
2. **Add SoftwareApplication schema** to all tool pages consistently
3. **Consider VideoObject** if video content is added in future

---

## Appendix: Sitemap Audit

Current sitemap (`src/app/sitemap.ts`) includes:
- All static pages ✅
- All blog posts ✅
- Product pages ✅
- Tool pages ✅

**Recommendation:** Ensure any new pages are added to the sitemap routes array.

---

## Next Steps

1. **Week 1:** Create `/tenant-wont-leave` and `/tenant-not-paying-rent` pages
2. **Week 2:** Create `/possession-claim-guide` and `/eviction-cost-uk` pages
3. **Week 3:** Update existing pages with missing keywords and cross-links
4. **Week 4:** Internal link audit and implementation
5. **Ongoing:** Monitor rankings and adjust content based on Search Console data

---

*Report generated: 2026-01-14*
*Next review: 2026-02-14*
