# Product, Tools & AI SEO Audit — Landlord Heaven (UK)

**Audit Date:** January 2026
**Auditor:** Claude AI
**Scope:** Revenue-first SEO + UX plan for UK landlord legal documents platform

---

## Executive Summary

Landlord Heaven serves UK landlords with court-ready legal documents across four distinct jurisdictions (England, Wales, Scotland, Northern Ireland). This audit evaluates all indexable pages for SEO optimization, jurisdiction correctness, and conversion funnel effectiveness.

### Key Findings

| Category | Status | Priority |
|----------|--------|----------|
| Jurisdiction correctness | ✅ Good | - |
| Product landing pages SEO | ⚠️ Needs improvement | HIGH |
| Free tools → paid upsell | ⚠️ Needs improvement | HIGH |
| Ask Heaven indexability | ⚠️ Review needed | MEDIUM |
| Validator coverage | ⚠️ Incomplete | MEDIUM |
| Analytics funnel tracking | ⚠️ Missing events | MEDIUM |
| Internal linking | ⚠️ Needs enhancement | HIGH |
| Cannibalization risk | ⚠️ Several issues | HIGH |

### Top 10 Revenue Opportunities

1. **Scotland landing pages** - Missing `/scotland-notice-to-leave` dedicated product page
2. **Wales eviction product page** - `/wales-eviction-notices` links to generic product, needs dedicated flow
3. **Money claim calculator upsell** - Strong traffic to calculator, weak conversion to paid pack
4. **Tenancy agreement hub page** - `/tenancy-agreements` redirects to pricing, loses SEO juice
5. **Validator completion → product upsell** - No clear CTA after validation completes
6. **Ask Heaven → wizard routing** - AI answers don't consistently route to products
7. **Section 21 urgency pages** - Countdown feature underutilized on landing pages
8. **Northern Ireland eviction content** - No dedicated eviction notices page
9. **Free generator watermark upgrade** - Clear upsell opportunity from watermarked docs
10. **Blog → tool internal linking** - Blog posts don't consistently link to relevant tools

### Top 10 Quick Wins (<2 hours each)

1. Add FAQ schema to all product pages
2. Add canonical URLs to remaining landing pages
3. Fix Section 21 Validator title (add "Free" + jurisdiction)
4. Add upsell CTAs to rent arrears calculator results
5. Add breadcrumb schema to Scotland/Wales jurisdiction pages
6. Add "England only" badge to Section 21/8 landing pages
7. Add internal links from `/how-to-evict-tenant` to all jurisdiction pages
8. Add noindex to wizard preview pages
9. Add Ask Heaven CTA to all validator completion screens
10. Add structured data Product schema to AST pages

---

## STEP 1: Page Inventory

### Complete Page Inventory

#### Paid Product Landing Pages

| URL | Source File | Type | Jurisdictions | Primary CTA | Conversion Goal | Indexable |
|-----|-------------|------|---------------|-------------|-----------------|-----------|
| `/products/notice-only` | `src/app/products/notice-only/page.tsx` | paid_tool | England, Wales, Scotland, NI | Start Wizard | wizard_started | ✅ Yes |
| `/products/complete-pack` | `src/app/products/complete-pack/page.tsx` | paid_tool | England, Wales, Scotland | Start Wizard | wizard_started | ✅ Yes |
| `/products/money-claim` | `src/app/products/money-claim/page.tsx` | paid_tool | England, Wales, Scotland | Start Wizard | wizard_started | ✅ Yes |
| `/products/ast` | `src/app/products/ast/page.tsx` | paid_tool | England, Wales, Scotland, NI | Start Wizard | wizard_started | ✅ Yes |

#### Tenancy Agreement Pages (Jurisdiction-Specific)

| URL | Source File | Type | Jurisdictions | Primary CTA | Indexable |
|-----|-------------|------|---------------|-------------|-----------|
| `/tenancy-agreements/england` | `src/app/tenancy-agreements/england/page.tsx` | paid_tool | England | Create AST | ✅ Yes |
| `/tenancy-agreements/wales` | `src/app/tenancy-agreements/wales/page.tsx` | paid_tool | Wales | Create Occupation Contract | ✅ Yes |
| `/tenancy-agreements/scotland` | `src/app/tenancy-agreements/scotland/page.tsx` | paid_tool | Scotland | Create PRT | ✅ Yes |
| `/tenancy-agreements/northern-ireland` | `src/app/tenancy-agreements/northern-ireland/page.tsx` | paid_tool | Northern Ireland | Create Agreement | ✅ Yes |
| `/tenancy-agreements/england-wales` | `src/app/tenancy-agreements/england-wales/page.tsx` | selector | England, Wales | Select Jurisdiction | ❌ noindex |

#### Free Tools

| URL | Source File | Type | Jurisdictions | Primary CTA | Upsell Target | Indexable |
|-----|-------------|------|---------------|-------------|---------------|-----------|
| `/tools` | `src/app/tools/page.tsx` | hub | UK | Explore Tools | Various | ✅ Yes |
| `/tools/validators` | `src/app/tools/validators/page.tsx` | hub | UK | Select Validator | Notice Packs | ✅ Yes |
| `/tools/validators/section-21` | `src/app/tools/validators/section-21/page.tsx` | validator | England | Validate Notice | notice_only | ✅ Yes |
| `/tools/validators/section-8` | `src/app/tools/validators/section-8/page.tsx` | validator | England | Validate Notice | notice_only | ✅ Yes |
| `/tools/free-section-21-notice-generator` | `src/app/tools/free-section-21-notice-generator/page.tsx` | generator | England | Generate Free | notice_only | ✅ Yes |
| `/tools/free-section-8-notice-generator` | `src/app/tools/free-section-8-notice-generator/page.tsx` | generator | England | Generate Free | notice_only | ✅ Yes |
| `/tools/rent-arrears-calculator` | `src/app/tools/rent-arrears-calculator/page.tsx` | calculator | UK | Calculate | money_claim | ✅ Yes |
| `/tools/hmo-license-checker` | `src/app/tools/hmo-license-checker/page.tsx` | checker | UK | Check HMO | AST Premium | ✅ Yes |
| `/tools/free-rent-demand-letter` | `src/app/tools/free-rent-demand-letter/page.tsx` | generator | UK | Generate Letter | money_claim | ✅ Yes |

#### Ask Heaven AI

| URL | Source File | Type | Jurisdictions | Primary CTA | Upsell Target | Indexable |
|-----|-------------|------|---------------|-------------|---------------|-----------|
| `/ask-heaven` | `src/app/ask-heaven/page.tsx` | ai_guidance | UK (all) | Ask Question | Context-dependent | ✅ Yes |

#### SEO Landing Pages (Template/Guide Pages)

| URL | Source File | Type | Jurisdictions | Primary CTA | Conversion Goal | Indexable |
|-----|-------------|------|---------------|-------------|-----------------|-----------|
| `/section-21-notice-template` | `src/app/section-21-notice-template/page.tsx` | landing | England | Get Court-Ready | notice_only | ✅ Yes |
| `/section-8-notice-template` | `src/app/section-8-notice-template/page.tsx` | landing | England | Get Court-Ready | notice_only | ✅ Yes |
| `/eviction-notice-template` | `src/app/eviction-notice-template/page.tsx` | landing | UK | Select Jurisdiction | notice_only | ✅ Yes |
| `/rent-arrears-letter-template` | `src/app/rent-arrears-letter-template/page.tsx` | landing | UK | Generate Letter | money_claim | ✅ Yes |
| `/tenancy-agreement-template` | `src/app/tenancy-agreement-template/page.tsx` | landing | UK | Create Agreement | ast | ✅ Yes |

#### Jurisdiction-Specific Guide Pages

| URL | Source File | Type | Jurisdictions | Primary CTA | Indexable |
|-----|-------------|------|---------------|-------------|-----------|
| `/wales-eviction-notices` | `src/app/wales-eviction-notices/page.tsx` | guide | Wales | Get Wales Notice | ✅ Yes |
| `/scotland-eviction-notices` | `src/app/scotland-eviction-notices/page.tsx` | guide | Scotland | Get Scotland Notice | ✅ Yes |
| `/section-21-ban` | `src/app/section-21-ban/page.tsx` | guide | England | Act Before Deadline | ✅ Yes |
| `/how-to-evict-tenant` | `src/app/how-to-evict-tenant/page.tsx` | guide | UK | Select Jurisdiction | ✅ Yes |
| `/money-claim-unpaid-rent` | `src/app/money-claim-unpaid-rent/page.tsx` | guide | UK | Start Money Claim | ✅ Yes |

#### Dashboard/Auth (noindex)

| URL | Type | Indexable |
|-----|------|-----------|
| `/dashboard/*` | dashboard | ❌ Blocked by robots.txt |
| `/auth/*` | auth | ❌ Blocked by robots.txt |
| `/wizard/*` | wizard | ❌ Blocked by robots.txt |
| `/admin/*` | admin | ❌ Blocked by robots.txt |

#### Blog

| URL | Source File | Type | Indexable |
|-----|-------------|------|-----------|
| `/blog` | `src/app/blog/page.tsx` | blog_index | ✅ Yes |
| `/blog/[slug]` | `src/app/blog/[slug]/page.tsx` | blog_post | ✅ Yes |

### Missing Pages Identified

| Suggested URL | Jurisdiction | Purpose | Priority |
|---------------|--------------|---------|----------|
| `/scotland-notice-to-leave` | Scotland | Direct product landing for Notice to Leave | HIGH |
| `/northern-ireland-eviction-notices` | Northern Ireland | NI-specific eviction guide | MEDIUM |
| `/tools/validators/wales-notice` | Wales | Wales notice validator | MEDIUM |
| `/tools/validators/scotland-notice-to-leave` | Scotland | Scotland notice validator | MEDIUM |
| `/tools/validators/tenancy-agreement` | UK | Agreement validator | LOW |
| `/tools/validators/money-claim` | UK | Money claim form validator | LOW |

---

## STEP 2: Master Product + Tool SEO Matrix

### Query Cluster Analysis

See companion file: `product-tools-ai-matrix.csv`

### Key Intent Mappings

#### Transactional Intent (Buy Now)

| Query Pattern | Jurisdiction | Target Page | Monetisation |
|---------------|--------------|-------------|--------------|
| "section 21 notice" | England | `/section-21-notice-template` | notice_only (£39.99) |
| "section 8 notice" | England | `/section-8-notice-template` | notice_only (£39.99) |
| "eviction notice template" | UK | `/eviction-notice-template` | notice_only (£39.99) |
| "notice to leave scotland" | Scotland | `/scotland-eviction-notices` | notice_only (£39.99) |
| "section 173 notice wales" | Wales | `/wales-eviction-notices` | notice_only (£39.99) |
| "tenancy agreement" | UK | `/tenancy-agreement-template` | ast (£9.99-£14.99) |
| "AST template" | England | `/tenancy-agreements/england` | ast (£9.99-£14.99) |
| "PRT scotland" | Scotland | `/tenancy-agreements/scotland` | ast (£9.99-£14.99) |
| "money claim rent arrears" | UK | `/money-claim-unpaid-rent` | money_claim (£199.99) |

#### Validation Intent (Check/Verify)

| Query Pattern | Jurisdiction | Target Page | Upsell Path |
|---------------|--------------|-------------|-------------|
| "section 21 validity checker" | England | `/tools/validators/section-21` | Invalid → notice_only |
| "is my section 21 valid" | England | `/tools/validators/section-21` | Invalid → notice_only |
| "section 8 notice checker" | England | `/tools/validators/section-8` | Invalid → notice_only |
| "rent arrears calculator" | UK | `/tools/rent-arrears-calculator` | Complete → money_claim |
| "hmo license check" | UK | `/tools/hmo-license-checker` | Needs licence → AST Premium |

#### Guidance Intent (Learn/Understand)

| Query Pattern | Jurisdiction | Target Page | Upsell Path |
|---------------|--------------|-------------|-------------|
| "how to evict tenant" | UK | `/how-to-evict-tenant` | Guide → notice_only |
| "section 21 or section 8" | England | `/how-to-evict-tenant` | Decision → notice_only |
| "eviction process wales" | Wales | `/wales-eviction-notices` | Guide → notice_only |
| "eviction scotland" | Scotland | `/scotland-eviction-notices` | Guide → notice_only |
| "section 21 ban 2026" | England | `/section-21-ban` | Urgency → notice_only |
| "can landlord evict me" | UK | `/ask-heaven` | Q&A → context-based |

#### AI Assistance Intent

| Query Pattern | Jurisdiction | Target Page | Upsell Path |
|---------------|--------------|-------------|-------------|
| "landlord legal advice" | UK | `/ask-heaven` | Q&A → relevant product |
| "eviction help" | UK | `/ask-heaven` | Q&A → notice_only |
| "deposit protection question" | UK | `/ask-heaven` | Q&A → ast |

---

## STEP 3: Free Tools, Validators & Ask Heaven Audit

### Validators Audit

#### Section 21 Validator (`/tools/validators/section-21`)

| Aspect | Current State | Recommendation | Priority |
|--------|---------------|----------------|----------|
| Indexable | ✅ Yes | Keep | - |
| Title | "Section 21 Notice Validator" | Add "Free" + "England" → "Free Section 21 Notice Validator - England" | HIGH |
| H1 | Generic | Match title | HIGH |
| Jurisdiction clarity | ⚠️ Implicit | Add prominent "England only" badge | MEDIUM |
| Next-step CTA | ✅ Present | Strengthen "Get Court-Ready Notice" after validation | HIGH |
| Upsell jurisdiction-correct | ✅ Yes | - | - |
| Cannibalization risk | ⚠️ Could outrank generator | Add internal link priority to generator | MEDIUM |

#### Section 8 Validator (`/tools/validators/section-8`)

| Aspect | Current State | Recommendation | Priority |
|--------|---------------|----------------|----------|
| Indexable | ✅ Yes | Keep | - |
| Title | "Section 8 Notice Validator" | Add "Free" + "England" | HIGH |
| H1 | Generic | Match title | HIGH |
| Jurisdiction clarity | ⚠️ Implicit | Add prominent "England only" badge | MEDIUM |
| Next-step CTA | ✅ Present | Enhance with grounds-specific suggestions | MEDIUM |

#### Missing Validators (Planned in Code)

| Route | Status | Priority |
|-------|--------|----------|
| `/tools/validators/wales-notice` | ❌ Not built | MEDIUM |
| `/tools/validators/scotland-notice-to-leave` | ❌ Not built | MEDIUM |
| `/tools/validators/tenancy-agreement` | ❌ Not built | LOW |
| `/tools/validators/money-claim` | ❌ Not built | LOW |

### Free Generators Audit

#### Section 21 Free Generator (`/tools/free-section-21-notice-generator`)

| Aspect | Current State | Recommendation | Priority |
|--------|---------------|----------------|----------|
| Indexable | ✅ Yes | Keep | - |
| Title | Contains "Free" | Good | - |
| Watermark | ✅ Yes | Clear upsell messaging | - |
| Upsell CTA | ⚠️ Below fold | Add inline upsell after form completion | HIGH |
| Jurisdiction | ⚠️ Implicit | Add "England only" badge above form | MEDIUM |

#### Section 8 Free Generator (`/tools/free-section-8-notice-generator`)

| Aspect | Current State | Recommendation | Priority |
|--------|---------------|----------------|----------|
| Indexable | ✅ Yes | Keep | - |
| Grounds selection | ✅ Present | Good | - |
| Upsell CTA | ⚠️ Weak | Add comparison table (free vs paid) | HIGH |

#### Rent Arrears Calculator (`/tools/rent-arrears-calculator`)

| Aspect | Current State | Recommendation | Priority |
|--------|---------------|----------------|----------|
| Indexable | ✅ Yes | Keep | - |
| Interest calculation | ✅ 8% p.a. | Compliant | - |
| Email gate for PDF | ✅ Yes | Good lead capture | - |
| Money claim upsell | ✅ Present | Add more prominent "File in Court" CTA | HIGH |
| Jurisdiction | ✅ UK-wide | Good | - |
| Scotland routing | ⚠️ Present but weak | Strengthen Simple Procedure CTA | MEDIUM |

### Ask Heaven AI Audit

| Aspect | Current State | Recommendation | Priority |
|--------|---------------|----------------|----------|
| Indexable | ✅ Yes | Keep (good for brand queries) | - |
| Title | "Ask Heaven" | Add "Free Landlord Legal Q&A" | MEDIUM |
| Topic detection | ✅ Present | Route to relevant products | - |
| Product CTAs in answers | ⚠️ Inconsistent | Ensure every answer has relevant product CTA | HIGH |
| Jurisdiction detection | ⚠️ Manual | Auto-detect from question content | MEDIUM |
| noindex consideration | ⚠️ Individual Q&A could dilute | Keep main page indexed, consider noindex for ephemeral Q&A | LOW |

### Cannibalization Flags

| Issue | Pages Affected | Risk Level | Resolution |
|-------|----------------|------------|------------|
| Validator vs Generator for "section 21" | `/tools/validators/section-21` vs `/tools/free-section-21-notice-generator` | MEDIUM | Differentiate titles clearly (Validator = "Check" vs Generator = "Create") |
| Template page vs Product page | `/section-21-notice-template` vs `/products/notice-only` | LOW | Template = informational, Product = buy intent (currently good) |
| Wales guide vs product | `/wales-eviction-notices` vs `/products/notice-only` | LOW | Guide provides jurisdiction-specific context before purchase |

---

## STEP 4: Landing Page & Tool On-Page SEO Audit

### Product Landing Pages

#### `/products/notice-only` (Notice Only Pack)

| Element | Current | Recommendation |
|---------|---------|----------------|
| Title | Generic product title | "Eviction Notice Pack - Section 21 & Section 8 - £39.99" |
| H1 | Present | Include year: "2026 Court-Ready Eviction Notice Pack" |
| Jurisdiction selector | ✅ Present | Good |
| FAQ Schema | ⚠️ Check if present | Add FAQ schema with 5-8 common questions |
| Trust block | ⚠️ Could be stronger | Add "10,000+ landlords" + "Court-accepted" badges |
| Internal links | ⚠️ Missing | Add links to validators, Ask Heaven, related blog posts |
| Canonical | ✅ Present | Good |
| Sitemap | ✅ Included | Good |

#### `/products/complete-pack` (Complete Eviction Pack)

| Element | Current | Recommendation |
|---------|---------|----------------|
| Title | Generic | "Complete Eviction Pack - Court Forms & Guidance - £199.99" |
| Value differentiation | ⚠️ Unclear vs notice_only | Create clear comparison table |
| FAQ Schema | ⚠️ Check if present | Add FAQ schema |
| Internal links | ⚠️ Missing | Link to money claim, AST for cross-sell |

#### `/products/money-claim` (Money Claim Pack)

| Element | Current | Recommendation |
|---------|---------|----------------|
| Title | Generic | "Money Claim Pack for Rent Arrears - Court Forms - £199.99" |
| Calculator link | ⚠️ Weak | Prominent link to rent arrears calculator |
| Jurisdiction routing | ⚠️ Review | Ensure Scotland routes to Simple Procedure variant |
| FAQ Schema | ⚠️ Check if present | Add FAQ schema |

#### `/products/ast` (Tenancy Agreements)

| Element | Current | Recommendation |
|---------|---------|----------------|
| Title | Generic | "Tenancy Agreement Template - AST, PRT, Occupation Contract" |
| Jurisdiction routing | ✅ Good | Links to jurisdiction-specific pages |
| Price display | ✅ Present | Good (£9.99-£14.99 range) |
| FAQ Schema | ⚠️ Check if present | Add FAQ schema |

### Jurisdiction-Specific Landing Pages

#### `/section-21-notice-template` (England)

| Element | Current | Recommendation |
|---------|---------|----------------|
| Title | ✅ Good | "Section 21 Notice Template - Form 6A Free" |
| H1 | ✅ Good | "Section 21 Notice Template" |
| Jurisdiction warning | ✅ Excellent | "England only" with links to Wales/Scotland |
| Countdown | ✅ Present | Section 21 ban countdown |
| FAQ Schema | ✅ Present | Good |
| Free vs Paid comparison | ✅ Excellent | Clear table |
| Internal links | ✅ Good | Links to validator, Ask Heaven, related content |

#### `/wales-eviction-notices` (Wales)

| Element | Current | Recommendation |
|---------|---------|----------------|
| Title | ✅ Good | "Eviction Notices in Wales - Renting Homes (Wales) Act Guide" |
| Section 21/8 warning | ✅ Excellent | Clear "does NOT apply" messaging |
| FAQ Schema | ✅ Present | Good |
| Internal links | ✅ Present | Good cross-jurisdiction links |
| CTA | ⚠️ Generic | Create Wales-specific wizard entry point |

#### `/scotland-eviction-notices` (Scotland)

| Element | Current | Recommendation |
|---------|---------|----------------|
| Title | ✅ Good | "Eviction Notices in Scotland - Notice to Leave & PRT Guide" |
| 18 grounds table | ✅ Excellent | Comprehensive |
| Tribunal info | ✅ Present | Good First-tier Tribunal guidance |
| FAQ Schema | ✅ Present | Good |
| CTA | ⚠️ Generic | Create Scotland-specific wizard entry point |

### Missing Northern Ireland Coverage

| Issue | Impact | Priority |
|-------|--------|----------|
| No `/northern-ireland-eviction-notices` page | Missing jurisdiction coverage | MEDIUM |
| NI tenancy agreement page exists but eviction guide missing | Incomplete funnel | MEDIUM |

---

## STEP 5: Cannibalization & Routing Fixes

### Identified Cannibalization Issues

#### Issue 1: Blog Posts Ranking for Tool Queries

| Query | Current Ranking Page | Should Rank | Fix |
|-------|---------------------|-------------|-----|
| "section 21 notice" | May rank blog post | `/section-21-notice-template` | Add canonical, internal links from blog to template page |
| "rent arrears letter" | May rank blog post | `/rent-arrears-letter-template` | Consolidate content, add internal links |
| "how to evict tenant" | `/blog/how-to-evict-tenant-...` vs `/how-to-evict-tenant` | `/how-to-evict-tenant` | Ensure guide page is primary, blog supports |

#### Issue 2: Multiple Pages Targeting Same Query

| Query | Competing Pages | Resolution |
|-------|-----------------|------------|
| "section 21 validity" | `/tools/validators/section-21` + blog posts | Validator should rank, differentiate titles |
| "tenancy agreement template" | `/tenancy-agreement-template` vs `/products/ast` | Template = informational, Product = transactional (OK) |
| "eviction notice" | `/eviction-notice-template` vs product pages | Template = generic, products = specific (OK) |

### Internal Link Routing Recommendations

#### Priority Re-routing

| From Page | Add Links To | Purpose |
|-----------|--------------|---------|
| `/how-to-evict-tenant` | All 4 jurisdiction pages | Funnel to correct jurisdiction |
| `/blog/*` eviction posts | Relevant product/template pages | Capture commercial intent |
| `/tools/validators/*` | Corresponding generators + products | Upsell from validation |
| `/tools/rent-arrears-calculator` | `/products/money-claim` (prominent) | Clear conversion path |
| `/ask-heaven` | Dynamic based on topic | Context-aware product CTAs |

#### Canonical Consolidation Needed

| Page | Set Canonical To | Reason |
|------|------------------|--------|
| `/tenancy-agreements/england-wales` | `/tenancy-agreements/england` or noindex | Selector page, no unique content |
| Blog category pages | Review for duplicates | May create thin content |

---

## STEP 6: Analytics & Funnel Visibility Audit

### Current Analytics Events

| Event | Implemented | Location |
|-------|-------------|----------|
| `wizard_preview_viewed` | ✅ Yes | `src/lib/analytics/track.ts` |
| `checkout_started` | ✅ Yes | `src/lib/analytics/track.ts` |
| `payment_success_landed` | ✅ Yes | `src/lib/analytics/track.ts` |
| `document_download_clicked` | ✅ Yes | `src/lib/analytics/track.ts` |
| `case_archived` | ✅ Yes | `src/lib/analytics/track.ts` |

### Missing Analytics Events (Recommended)

| Event | Purpose | Priority | Implementation Location |
|-------|---------|----------|------------------------|
| `free_tool_viewed` | Track free tool engagement | HIGH | Each free tool page |
| `validator_completed` | Track validation funnel | HIGH | Validator completion handler |
| `validator_result` | Pass/fail with reason | HIGH | Validation result display |
| `ai_question_asked` | Track Ask Heaven usage | MEDIUM | Ask Heaven chat handler |
| `ai_topic_detected` | Track AI topic routing | LOW | Topic detection handler |
| `wizard_started` | Distinguish from preview | HIGH | Wizard start page |
| `email_captured` | Track lead generation | HIGH | Email gate modal |
| `upsell_clicked` | Track free→paid conversion | HIGH | All upsell CTAs |
| `jurisdiction_selected` | Track user jurisdiction | MEDIUM | Jurisdiction selectors |

### Proposed Event Schema

```typescript
// Free tool funnel
track('free_tool_viewed', {
  tool_type: 'calculator' | 'generator' | 'checker' | 'validator',
  tool_name: string,
  jurisdiction: string | null,
});

track('validator_completed', {
  validator_type: 'section-21' | 'section-8' | 'wales-notice' | 'scotland-notice',
  result: 'valid' | 'invalid' | 'needs_review',
  issues_count: number,
});

track('upsell_clicked', {
  source_tool: string,
  target_product: string,
  source_page: string,
});

// AI funnel
track('ai_question_asked', {
  topic: string,
  jurisdiction: string | null,
  has_context: boolean,
});
```

### Attribution Tracking

| Path | Current Tracking | Gap |
|------|------------------|-----|
| Free tool → Paid product | ⚠️ Partial | Add `source_tool` parameter to wizard entry |
| Blog → Product | ⚠️ Partial | Add UTM tracking on blog CTAs |
| Ask Heaven → Product | ⚠️ Partial | Add `ai_source` parameter to wizard |
| Validator → Generator → Product | ❌ Missing | Track full multi-step funnel |

---

## STEP 7: PR Plan (Implementation)

### PR 1: Core Eviction Landing Pages by Jurisdiction

**Priority:** HIGH
**Estimated Effort:** 4-6 hours

**Files to Create/Modify:**
- `src/app/scotland-notice-to-leave/page.tsx` (NEW)
- `src/app/northern-ireland-eviction-notices/page.tsx` (NEW)
- `src/app/sitemap.ts` (update)

**Changes:**
- Create dedicated `/scotland-notice-to-leave` page matching `/section-21-notice-template` structure
- Create dedicated `/northern-ireland-eviction-notices` guide page
- Add both to sitemap with priority 0.8

**Titles/H1:**
- Scotland: "Notice to Leave Scotland - PRT Eviction Notice | 2026 Guide"
- NI: "Eviction Notices in Northern Ireland - Private Tenancy Guide"

**Internal Links:**
- Link from `/scotland-eviction-notices` to new page
- Link from `/how-to-evict-tenant` to both new pages
- Link from `/products/notice-only` to jurisdiction-specific pages

**Acceptance Criteria:**
- [ ] Pages render with correct jurisdiction content
- [ ] FAQ schema implemented
- [ ] Breadcrumb schema implemented
- [ ] Internal links added
- [ ] Sitemap updated
- [ ] No Section 21/8 references on these pages

---

### PR 2: Validators SEO Cleanup + Upsell CTAs

**Priority:** HIGH
**Estimated Effort:** 3-4 hours

**Files to Modify:**
- `src/app/tools/validators/section-21/page.tsx`
- `src/app/tools/validators/section-8/page.tsx`
- `src/components/validators/ValidationReport.tsx`
- `src/lib/seo/metadata.ts`

**Changes:**
- Update titles to include "Free" and jurisdiction
- Add "England only" badge above validator form
- Enhance post-validation CTA with comparison table
- Add "Get Court-Ready Notice" prominent button after invalid result
- Add link to Ask Heaven for compliance questions

**Meta Examples:**
```
Title: Free Section 21 Notice Validator - Check Validity | England
H1: Free Section 21 Notice Validator
Description: Check if your Section 21 notice is valid for court. Free instant validation for England landlords. Upload or enter details to verify compliance.
```

**Acceptance Criteria:**
- [ ] Titles include "Free" + jurisdiction
- [ ] "England only" badge visible
- [ ] Upsell CTA appears after validation
- [ ] Invalid notices show "Generate New Notice" button
- [ ] Valid notices show "Download & Serve" guidance

---

### PR 3: Ask Heaven SEO & Routing Strategy

**Priority:** MEDIUM
**Estimated Effort:** 2-3 hours

**Files to Modify:**
- `src/app/ask-heaven/page.tsx`
- `src/app/ask-heaven/AskHeavenPageClient.tsx`
- `src/lib/ask-heaven/topic-detection.ts`
- `src/lib/seo/metadata.ts`

**Changes:**
- Update page title to "Ask Heaven - Free Landlord Legal Q&A | UK"
- Add structured FAQ about common topics
- Ensure every AI response includes relevant product CTA
- Add topic-specific landing page links in responses
- Consider noindex for individual Q&A URLs (if created)

**Meta Examples:**
```
Title: Ask Heaven - Free Landlord Legal Q&A | UK
H1: Ask Heaven
Description: Get instant answers to landlord legal questions. Free AI-powered guidance on eviction, deposits, tenancy agreements, and more. UK-wide coverage.
```

**Acceptance Criteria:**
- [ ] Title updated with "Free" + "UK"
- [ ] Responses include product CTAs
- [ ] Topic detection routes to correct jurisdiction
- [ ] FAQ section added below chat

---

### PR 4: Money Claim Tools & Calculators Funnel

**Priority:** HIGH
**Estimated Effort:** 3-4 hours

**Files to Modify:**
- `src/app/tools/rent-arrears-calculator/page.tsx`
- `src/app/tools/rent-arrears-calculator/layout.tsx`
- `src/app/money-claim-unpaid-rent/page.tsx`
- `src/components/ui/ToolEmailGate.tsx`

**Changes:**
- Add prominent "File Money Claim" CTA after calculation
- Create comparison section: DIY Calculator vs Court Pack
- Add Scotland Simple Procedure CTA with equal prominence
- Strengthen internal links to money claim product
- Add "What Happens Next" section after PDF download

**Internal Links to Add:**
- Calculator → `/products/money-claim`
- Calculator → `/money-claim-unpaid-rent`
- Calculator → `/tools/free-rent-demand-letter`

**Acceptance Criteria:**
- [ ] Money claim CTA visible after calculation
- [ ] Scotland routing to Simple Procedure
- [ ] Email capture before PDF works
- [ ] Internal links to related content present
- [ ] FAQ schema updated

---

### PR 5: Tenancy Agreement Landing Pages by Jurisdiction

**Priority:** MEDIUM
**Estimated Effort:** 2-3 hours

**Files to Modify:**
- `src/app/tenancy-agreements/england/page.tsx`
- `src/app/tenancy-agreements/wales/page.tsx`
- `src/app/tenancy-agreements/scotland/page.tsx`
- `src/app/tenancy-agreements/northern-ireland/page.tsx`

**Changes:**
- Add Product schema JSON-LD (already partially present)
- Standardize FAQ schema across all pages
- Add canonical URLs where missing
- Add cross-jurisdiction internal links section
- Ensure AST wizard link uses correct jurisdiction parameter

**Meta Examples (Scotland):**
```
Title: PRT Agreement Scotland - Private Residential Tenancy | £9.99
H1: Private Residential Tenancy Agreement (PRT) - Scotland
Description: Create a legally compliant Private Residential Tenancy for Scotland. Complies with 2016 Act. Standard £9.99, Premium £14.99. Instant download.
```

**Acceptance Criteria:**
- [ ] All pages have Product schema
- [ ] FAQ schema consistent
- [ ] Canonical URLs present
- [ ] Cross-jurisdiction links work
- [ ] Wizard links include jurisdiction parameter

---

### PR 6: Internal Linking Sweep (Free → Paid)

**Priority:** HIGH
**Estimated Effort:** 4-5 hours

**Files to Modify:**
- All tool pages in `src/app/tools/`
- `src/components/seo/RelatedLinks.tsx`
- `src/lib/seo/internal-links.ts`
- Selected blog posts

**Changes:**
- Audit all free tool pages for product links
- Add consistent "Upgrade to Court-Ready" CTAs
- Add RelatedLinks component to all tool pages
- Update internal-links.ts with complete link registry
- Add product links to 10 highest-traffic blog posts

**Link Registry Additions:**
```typescript
// Add to internal-links.ts
export const freeToolToProductLinks = {
  'section-21-validator': productLinks.noticeOnly,
  'section-8-validator': productLinks.noticeOnly,
  'section-21-generator': productLinks.noticeOnly,
  'section-8-generator': productLinks.noticeOnly,
  'rent-arrears-calculator': productLinks.moneyClaim,
  'rent-demand-letter': productLinks.moneyClaim,
  'hmo-checker': productLinks.astPremium,
};
```

**Acceptance Criteria:**
- [ ] Every free tool has product upsell link
- [ ] RelatedLinks component on all tool pages
- [ ] Blog posts link to relevant tools/products
- [ ] No orphan pages in sitemap

---

### PR 7: FAQ Schema + Metadata Improvements

**Priority:** MEDIUM
**Estimated Effort:** 3-4 hours

**Files to Modify:**
- `src/app/products/notice-only/page.tsx`
- `src/app/products/complete-pack/page.tsx`
- `src/app/products/money-claim/page.tsx`
- `src/app/products/ast/page.tsx`
- `src/lib/seo/structured-data.tsx`

**Changes:**
- Add FAQPage schema to all product pages
- Create reusable FAQ data for each product
- Add BreadcrumbList schema to product pages
- Update meta descriptions with pricing
- Add Product schema with AggregateRating

**FAQ Examples (Notice Only):**
```javascript
const faqData = [
  {
    question: "What's included in the Notice Only Pack?",
    answer: "Official Form 6A (Section 21), Form 3 (Section 8), serving instructions, and compliance checklist. Valid for England."
  },
  {
    question: "Is this valid for court?",
    answer: "Yes. Our notices use the official prescribed forms and are designed for court acceptance."
  },
  // ... more FAQs
];
```

**Acceptance Criteria:**
- [ ] All product pages have FAQ schema
- [ ] Breadcrumb schema on product pages
- [ ] Product schema with pricing
- [ ] Meta descriptions include price
- [ ] Schema validates in Google Rich Results Test

---

### PR 8: Sitemap + Indexability Corrections

**Priority:** MEDIUM
**Estimated Effort:** 2-3 hours

**Files to Modify:**
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- Various page metadata

**Changes:**
- Add missing pages to sitemap
- Remove noindex from any incorrectly blocked pages
- Add noindex to wizard preview URLs
- Verify robots.txt blocks correct paths
- Add lastmod dates where missing

**Sitemap Additions:**
```typescript
// Add to sitemap.ts
const additionalPages = [
  { url: '/scotland-notice-to-leave', priority: 0.8 },
  { url: '/northern-ireland-eviction-notices', priority: 0.7 },
  { url: '/tools/validators/wales-notice', priority: 0.7 },
  { url: '/tools/validators/scotland-notice-to-leave', priority: 0.7 },
];
```

**Acceptance Criteria:**
- [ ] All marketing pages in sitemap
- [ ] No dashboard/wizard pages in sitemap
- [ ] robots.txt blocks correct paths
- [ ] Priority values reflect page importance
- [ ] lastmod dates accurate

---

### PR 9: Analytics Event Tracking Enhancement

**Priority:** MEDIUM
**Estimated Effort:** 3-4 hours

**Files to Modify:**
- `src/lib/analytics/track.ts`
- `src/app/tools/*/page.tsx` (all tool pages)
- `src/components/validators/ValidationReport.tsx`
- `src/app/ask-heaven/AskHeavenPageClient.tsx`
- `src/app/wizard/page.tsx`

**Changes:**
- Add new event types to track.ts
- Implement `free_tool_viewed` on all tool pages
- Implement `validator_completed` with result
- Implement `ai_question_asked` in Ask Heaven
- Implement `wizard_started` separate from preview
- Add `upsell_clicked` to all upgrade CTAs

**Event Implementation:**
```typescript
// Add to track.ts
export function trackFreeToolViewed(props: {
  tool_type: 'calculator' | 'generator' | 'checker' | 'validator';
  tool_name: string;
  jurisdiction: string | null;
}): void {
  if (!isBrowser()) return;
  vercelTrack('free_tool_viewed', props);
}

export function trackValidatorCompleted(props: {
  validator_type: string;
  result: 'valid' | 'invalid' | 'needs_review';
  issues_count: number;
}): void {
  if (!isBrowser()) return;
  vercelTrack('validator_completed', props);
}
```

**Acceptance Criteria:**
- [ ] New events defined in track.ts
- [ ] All free tools fire `free_tool_viewed`
- [ ] Validators fire `validator_completed`
- [ ] Ask Heaven fires `ai_question_asked`
- [ ] Events visible in Vercel Analytics

---

### PR 10: Wales & Scotland Validator Pages

**Priority:** MEDIUM
**Estimated Effort:** 4-5 hours

**Files to Create:**
- `src/app/tools/validators/wales-notice/page.tsx` (NEW)
- `src/app/tools/validators/scotland-notice-to-leave/page.tsx` (NEW)

**Changes:**
- Create Wales notice validator (Renting Homes Act compliant)
- Create Scotland Notice to Leave validator
- Add to sitemap
- Add to tools hub page
- Update `src/lib/tools/tools.ts` validatorToolRoutes

**Meta Examples (Wales):**
```
Title: Free Wales Notice Validator - Renting Homes Act | Landlord Heaven
H1: Wales Notice Validator
Description: Check if your Wales eviction notice is valid under the Renting Homes (Wales) Act 2016. Free instant validation for Welsh landlords.
```

**Acceptance Criteria:**
- [ ] Wales validator checks occupation contract requirements
- [ ] Scotland validator checks Notice to Leave grounds
- [ ] No Section 21/8 references
- [ ] Correct tribunal/court information
- [ ] Upsell to relevant product

---

## Jurisdiction Risk Checklist

### England
- [x] Section 21 clearly marked "ends May 2026"
- [x] Form 6A referenced correctly
- [x] Housing Act 1988 cited
- [x] Deposit protection requirements mentioned
- [ ] How to Rent guide requirement referenced

### Wales
- [x] Section 21/8 marked as NOT applicable
- [x] Renting Homes (Wales) Act 2016 referenced
- [x] "Occupation contract" terminology used
- [x] "Contract holder" instead of "tenant" where appropriate
- [ ] Welsh Government guidance linked

### Scotland
- [x] Notice to Leave terminology used
- [x] 18 eviction grounds referenced
- [x] First-tier Tribunal (not county court) mentioned
- [x] PRT (not AST) for tenancy agreements
- [x] Landlord registration requirement mentioned
- [ ] Scottish Government guidance linked

### Northern Ireland
- [ ] Private tenancy terminology
- [ ] Correct tribunal/court referenced
- [ ] NI-specific legislation cited
- [ ] Deposit protection NI rules

---

## SEO vs Legal Risk Notes

### Legal Disclaimers Required

All pages should include:
```
This information is not legal advice. For specific legal guidance, consult a qualified solicitor.
Laws vary by jurisdiction and change regularly. Always check current government guidance.
```

### gov.uk References

| Jurisdiction | Reference Link |
|--------------|----------------|
| England | gov.uk/evicting-tenants |
| Wales | gov.wales/renting-homes-wales |
| Scotland | gov.scot/private-renting |
| Northern Ireland | nidirect.gov.uk/housing |

### Risk Areas

| Risk | Current Mitigation | Additional Recommendation |
|------|--------------------|-----------------------------|
| Outdated information | Manual updates | Add lastmod dates, regular audit schedule |
| Jurisdiction confusion | Badges + warnings | Add postcode lookup for auto-detection |
| Legal advice claims | Disclaimer text | Review all CTAs for "advice" language |
| Form accuracy | Using official forms | Add version numbers to forms |

---

## Appendix: File Path Reference

### Product Pages
- `/products/notice-only` → `src/app/products/notice-only/page.tsx`
- `/products/complete-pack` → `src/app/products/complete-pack/page.tsx`
- `/products/money-claim` → `src/app/products/money-claim/page.tsx`
- `/products/ast` → `src/app/products/ast/page.tsx`

### Tenancy Pages
- `/tenancy-agreements/england` → `src/app/tenancy-agreements/england/page.tsx`
- `/tenancy-agreements/wales` → `src/app/tenancy-agreements/wales/page.tsx`
- `/tenancy-agreements/scotland` → `src/app/tenancy-agreements/scotland/page.tsx`
- `/tenancy-agreements/northern-ireland` → `src/app/tenancy-agreements/northern-ireland/page.tsx`

### Tools
- `/tools` → `src/app/tools/page.tsx`
- `/tools/validators` → `src/app/tools/validators/page.tsx`
- `/tools/validators/section-21` → `src/app/tools/validators/section-21/page.tsx`
- `/tools/validators/section-8` → `src/app/tools/validators/section-8/page.tsx`
- `/tools/free-section-21-notice-generator` → `src/app/tools/free-section-21-notice-generator/page.tsx`
- `/tools/free-section-8-notice-generator` → `src/app/tools/free-section-8-notice-generator/page.tsx`
- `/tools/rent-arrears-calculator` → `src/app/tools/rent-arrears-calculator/page.tsx`
- `/tools/hmo-license-checker` → `src/app/tools/hmo-license-checker/page.tsx`
- `/tools/free-rent-demand-letter` → `src/app/tools/free-rent-demand-letter/page.tsx`

### Landing Pages
- `/section-21-notice-template` → `src/app/section-21-notice-template/page.tsx`
- `/section-8-notice-template` → `src/app/section-8-notice-template/page.tsx`
- `/eviction-notice-template` → `src/app/eviction-notice-template/page.tsx`
- `/rent-arrears-letter-template` → `src/app/rent-arrears-letter-template/page.tsx`
- `/tenancy-agreement-template` → `src/app/tenancy-agreement-template/page.tsx`
- `/wales-eviction-notices` → `src/app/wales-eviction-notices/page.tsx`
- `/scotland-eviction-notices` → `src/app/scotland-eviction-notices/page.tsx`
- `/section-21-ban` → `src/app/section-21-ban/page.tsx`
- `/how-to-evict-tenant` → `src/app/how-to-evict-tenant/page.tsx`
- `/money-claim-unpaid-rent` → `src/app/money-claim-unpaid-rent/page.tsx`

### Ask Heaven
- `/ask-heaven` → `src/app/ask-heaven/page.tsx`

### Configuration
- Sitemap → `src/app/sitemap.ts`
- Robots → `src/app/robots.ts`
- SEO Metadata → `src/lib/seo/metadata.ts`
- Internal Links → `src/lib/seo/internal-links.ts`
- Tools Registry → `src/lib/tools/tools.ts`
- Analytics → `src/lib/analytics/track.ts`

---

*Audit complete. See `product-tools-ai-matrix.csv` for detailed query mapping.*
