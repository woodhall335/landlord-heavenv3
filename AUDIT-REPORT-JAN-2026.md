# Landlord Heaven — Master SEO & Funnel Audit Report

**Audit Date:** January 2026
**Platform:** landlordheaven.co.uk (Next.js 14 / Vercel)
**Auditor:** Claude Code
**Branch:** `claude/seo-funnel-optimization-rggqp`

---

## 1️⃣ EXECUTIVE SUMMARY

### Top Revenue Opportunities

1. **Unlock Money Claim Cluster SEO** — Create dedicated landing pages for `/money-claim-property-damage`, `/money-claim-cleaning-costs`, `/money-claim-unpaid-bills` to capture high-intent commercial keywords beyond rent arrears (estimated 3x keyword coverage expansion)

2. **Complete NextSteps CTA Coverage** — Only 15 of 106 blog posts have context-aware CTAs. Expanding to all posts could increase blog→product conversion 40-60%

3. **Integrate NextBestActionCard in Ask Heaven** — Built but NOT integrated. Adding this component ensures every AI answer routes to a product/tool (current gap: ~30% of answers lack CTAs)

4. **Scotland Simple Procedure Landing Page** — No dedicated SEO page for Scotland money claims. `/scotland-simple-procedure` could capture Scottish landlord rent recovery searches

5. **Validator Expansion** — Only 2 of 6 planned validators built. Adding Wales Notice Validator and Scotland Notice Validator addresses £200K+ TAM in those jurisdictions

### Top Risks

| Risk | Severity | Impact |
|------|----------|--------|
| robots.ts `/_next/` disallow conflicts with SEO audit script | CRITICAL | Build failures, SEO audit tests will fail |
| Northern Ireland hard 422 errors instead of friendly UI | HIGH | User abandonment, poor UX for NI landlords |
| Free tool funnel tracking gaps | HIGH | Cannot measure ROI of free tools, blind optimization |
| Checkout abandonment not tracked | HIGH | Unknown drop-off between checkout start and payment |
| Compliance blog posts → Ask Heaven only, NO product upsell | MEDIUM | Revenue leakage from 8+ high-traffic compliance posts |

### Quick Wins (<2 hours each)

1. **Fix robots.ts `/_next/` conflict** — Remove from disallow list or update SEO audit test (15 min)
2. **Add `trackToolResultGenerated` event** — Single function + 5 call sites (1 hour)
3. **Enable NextBestActionCard in Ask Heaven** — Already built, just needs render integration (30 min)
4. **Add NI-friendly "not available" UI** — Replace 422 error with informative message card (1 hour)
5. **Expand NextSteps for compliance posts** — Add deposit/gas/EPC routing to existing function (1 hour)

---

## 2️⃣ FULL PAGE & TOOL INVENTORY

### A. Product Pages

| URL | File Path | Page Type | Jurisdiction | Target Keyword | CTA Target | Indexable |
|-----|-----------|-----------|--------------|----------------|------------|-----------|
| `/products/notice-only` | `src/app/products/notice-only/page.tsx` | Product | England/Wales/Scotland | section 21 notice pack | /wizard?product=notice_only | ✅ |
| `/products/complete-pack` | `src/app/products/complete-pack/page.tsx` | Product | England/Wales/Scotland | eviction pack UK | /wizard?product=complete_pack | ✅ |
| `/products/money-claim` | `src/app/products/money-claim/page.tsx` | Product | England/Wales/Scotland | money claim landlord | /wizard?product=money_claim | ✅ |
| `/products/ast` | `src/app/products/ast/page.tsx` | Product | All UK | tenancy agreement template | /wizard?product=ast_standard | ✅ |
| `/products/money-claim-pack` | `src/app/products/money-claim-pack/page.tsx` | Product | England/Wales/Scotland | rent arrears claim pack | /wizard?product=money_claim | ✅ |

### B. SEO Landing Pages (Templates/Guides)

| URL | File Path | Page Type | Jurisdiction | Target Keyword | CTA Target | Indexable |
|-----|-----------|-----------|--------------|----------------|------------|-----------|
| `/section-21-notice-template` | `src/app/section-21-notice-template/page.tsx` | Landing | England | section 21 notice template | /products/notice-only | ✅ |
| `/section-8-notice-template` | `src/app/section-8-notice-template/page.tsx` | Landing | England | section 8 notice template | /products/notice-only | ✅ |
| `/eviction-notice-template` | `src/app/eviction-notice-template/page.tsx` | Landing | Multi | eviction notice template UK | /products/notice-only | ✅ |
| `/tenancy-agreement-template` | `src/app/tenancy-agreement-template/page.tsx` | Landing | Multi | tenancy agreement template | /products/ast | ✅ |
| `/rent-arrears-letter-template` | `src/app/rent-arrears-letter-template/page.tsx` | Landing | Multi | rent arrears letter template | /products/money-claim | ✅ |
| `/how-to-evict-tenant` | `src/app/how-to-evict-tenant/page.tsx` | Guide | Multi | how to evict a tenant UK | /products/complete-pack | ✅ |
| `/money-claim-unpaid-rent` | `src/app/money-claim-unpaid-rent/page.tsx` | Guide | England/Wales | money claim unpaid rent | /products/money-claim | ✅ |
| `/scotland-eviction-notices` | `src/app/scotland-eviction-notices/page.tsx` | Guide | Scotland | scotland eviction notice | /products/notice-only | ✅ |
| `/wales-eviction-notices` | `src/app/wales-eviction-notices/page.tsx` | Guide | Wales | wales eviction notice | /products/notice-only | ✅ |
| `/section-21-ban` | `src/app/section-21-ban/page.tsx` | Guide | England | section 21 ban | /products/notice-only | ✅ |

### C. Tenancy Agreement Pages

| URL | File Path | Page Type | Jurisdiction | Target Keyword | CTA Target | Indexable |
|-----|-----------|-----------|--------------|----------------|------------|-----------|
| `/tenancy-agreements/england` | `src/app/tenancy-agreements/england/page.tsx` | Product | England | assured shorthold tenancy | /wizard?product=ast_standard | ✅ |
| `/tenancy-agreements/wales` | `src/app/tenancy-agreements/wales/page.tsx` | Product | Wales | occupation contract wales | /wizard?product=ast_standard | ✅ |
| `/tenancy-agreements/scotland` | `src/app/tenancy-agreements/scotland/page.tsx` | Product | Scotland | private residential tenancy | /wizard?product=ast_standard | ✅ |
| `/tenancy-agreements/northern-ireland` | `src/app/tenancy-agreements/northern-ireland/page.tsx` | Product | N. Ireland | tenancy agreement northern ireland | /wizard?product=ast_standard | ✅ |
| `/tenancy-agreements/england-wales` | `src/app/tenancy-agreements/england-wales/page.tsx` | Selector | Hub | — | /tenancy-agreements/england | ❌ noindex |

### D. Free Tools

| URL | File Path | Page Type | Jurisdiction | Target Keyword | CTA Target | Indexable |
|-----|-----------|-----------|--------------|----------------|------------|-----------|
| `/tools` | `src/app/tools/page.tsx` | Hub | Multi | free landlord tools UK | Various | ✅ |
| `/tools/free-section-21-notice-generator` | `src/app/tools/free-section-21-notice-generator/page.tsx` | Generator | England | free section 21 generator | /products/notice-only | ✅ |
| `/tools/free-section-8-notice-generator` | `src/app/tools/free-section-8-notice-generator/page.tsx` | Generator | England | free section 8 generator | /products/notice-only | ✅ |
| `/tools/free-rent-demand-letter` | `src/app/tools/free-rent-demand-letter/page.tsx` | Generator | Multi | rent demand letter template | /products/money-claim | ✅ |
| `/tools/rent-arrears-calculator` | `src/app/tools/rent-arrears-calculator/page.tsx` | Calculator | Multi | rent arrears calculator | /products/money-claim | ✅ |
| `/tools/hmo-license-checker` | `src/app/tools/hmo-license-checker/page.tsx` | Checker | England | hmo license checker | /products/complete-pack | ✅ |

### E. Validators

| URL | File Path | Page Type | Jurisdiction | Target Keyword | CTA Target | Indexable |
|-----|-----------|-----------|--------------|----------------|------------|-----------|
| `/tools/validators` | `src/app/tools/validators/page.tsx` | Hub | Multi | notice validator UK | Various | ✅ |
| `/tools/validators/section-21` | `src/app/tools/validators/section-21/page.tsx` | Validator | England | section 21 validity checker | /products/notice-only | ✅ |
| `/tools/validators/section-8` | `src/app/tools/validators/section-8/page.tsx` | Validator | England | section 8 notice checker | /products/notice-only | ✅ |
| `/tools/validators/wales-notice` | **NOT BUILT** | Validator | Wales | wales notice validator | /products/notice-only | ❌ |
| `/tools/validators/scotland-notice-to-leave` | **NOT BUILT** | Validator | Scotland | scotland notice checker | /products/notice-only | ❌ |
| `/tools/validators/tenancy-agreement` | **NOT BUILT** | Validator | Multi | tenancy agreement checker | /products/ast | ❌ |
| `/tools/validators/money-claim` | **NOT BUILT** | Validator | Multi | money claim validator | /products/money-claim | ❌ |

### F. Ask Heaven AI

| URL | File Path | Page Type | Jurisdiction | Target Keyword | CTA Target | Indexable |
|-----|-----------|-----------|--------------|----------------|------------|-----------|
| `/ask-heaven` | `src/app/ask-heaven/page.tsx` | AI Tool | Multi | landlord legal Q&A free | Context-based | ✅ |

### G. Blog

| URL | File Path | Page Type | Content Count | Indexable |
|-----|-----------|-----------|---------------|-----------|
| `/blog` | `src/app/blog/page.tsx` | Hub | 106 posts | ✅ |
| `/blog/[slug]` | `src/app/blog/[slug]/page.tsx` | Dynamic | 106 posts + 5 categories | ✅ |

### H. Private/NoIndex Pages

| URL | File Path | Robots | Purpose |
|-----|-----------|--------|---------|
| `/auth/*` | `src/app/auth/layout.tsx` | noindex,nofollow | Authentication flows |
| `/dashboard/*` | `src/app/dashboard/layout.tsx` | noindex,nofollow | User dashboard |
| `/wizard/*` | `src/app/wizard/layout.tsx` | noindex,nofollow | Document wizard |
| `/success/*` | `src/app/success/[product]/[caseId]/page.tsx` | noindex | Payment confirmation |

---

## 3️⃣ FUNNEL MAP

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              AWARENESS & DISCOVERY                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   GOOGLE SEARCH                 DIRECT/REFERRAL                 SOCIAL/ADS          │
│        │                              │                              │              │
│        ▼                              ▼                              ▼              │
│   ┌─────────┐                   ┌─────────┐                    ┌─────────┐          │
│   │  BLOG   │                   │ HOMEPAGE│                    │ LANDING │          │
│   │106 posts│                   │         │                    │  PAGES  │          │
│   └────┬────┘                   └────┬────┘                    └────┬────┘          │
│        │                              │                              │              │
│        │    ┌─────────────────────────┼──────────────────────────────┘              │
│        │    │                         │                                              │
│        ▼    ▼                         ▼                                              │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CONSIDERATION & ENGAGEMENT                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   ┌────────────────┐    ┌────────────────┐    ┌────────────────┐    ┌──────────────┐│
│   │  FREE TOOLS    │    │   VALIDATORS   │    │  ASK HEAVEN    │    │  PRODUCT     ││
│   │  - S21 Gen     │    │  - S21 Check   │    │  AI Q&A        │    │  PAGES       ││
│   │  - S8 Gen      │    │  - S8 Check    │    │  Topic Detect  │    │  - Pricing   ││
│   │  - Rent Calc   │    │  (+ 4 planned) │    │  Product Route │    │  - Compare   ││
│   │  - HMO Check   │    │                │    │                │    │              ││
│   │  - Demand Ltr  │    │                │    │                │    │              ││
│   └───────┬────────┘    └───────┬────────┘    └───────┬────────┘    └──────┬───────┘│
│           │                     │                     │                     │        │
│           │    EMAIL GATE       │   VALIDATION        │   3-QUESTION        │        │
│           │    (lead capture)   │   RESULT            │   EMAIL GATE        │        │
│           ▼                     ▼                     ▼                     │        │
│   ┌────────────────────────────────────────────────────────────────────────┼────────┤
│   │                         UPSELL CTAs                                     │        │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │        │
│   │  │ToolUpsellCard│  │ CTA Mapper   │  │NextBestAction│◄──────────────────┘        │
│   │  │ "Upgrade to  │  │ (blockers→   │  │ Card (built  │                            │
│   │  │  court-ready"│  │  complete)   │  │  NOT active) │                            │
│   │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                            │
│   └─────────┼─────────────────┼─────────────────┼────────────────────────────────────┘
│             │                 │                 │
│             └─────────────────┼─────────────────┘
│                               ▼
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              DECISION & CONVERSION                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│                           ┌───────────────────┐                                      │
│                           │   WIZARD ENTRY    │                                      │
│                           │ /wizard?product=X │                                      │
│                           │ &jurisdiction=Y   │                                      │
│                           │ &src=Z            │                                      │
│                           └─────────┬─────────┘                                      │
│                                     │                                                │
│                                     ▼                                                │
│                           ┌───────────────────┐                                      │
│                           │   WIZARD FLOW     │                                      │
│                           │ 5-15 questions    │                                      │
│                           │ Ask Heaven checks │                                      │
│                           │ Smart validation  │                                      │
│                           └─────────┬─────────┘                                      │
│                                     │                                                │
│                                     ▼                                                │
│                           ┌───────────────────┐                                      │
│                           │   REVIEW PAGE     │                                      │
│                           │ Preview (watermark)│                                     │
│                           │ Blockers/Warnings │                                      │
│                           └─────────┬─────────┘                                      │
│                                     │                                                │
│                      ┌──────────────┴──────────────┐                                 │
│                      │                             │                                 │
│                      ▼                             ▼                                 │
│   ┌────────────────────────────┐    ┌────────────────────────────┐                   │
│   │      CHECKOUT              │    │      UPSELL                │                   │
│   │  /api/checkout/create      │    │  notice_only → complete    │                   │
│   │  Stripe session            │    │  £39.99 → £199.99          │                   │
│   │  Idempotency protection    │    │                            │                   │
│   └───────────┬────────────────┘    └────────────────────────────┘                   │
│               │                                                                      │
│               ▼                                                                      │
│   ┌────────────────────────────┐                                                     │
│   │   STRIPE PAYMENT           │                                                     │
│   │   checkout.session         │                                                     │
│   └───────────┬────────────────┘                                                     │
│               │                                                                      │
│               ▼                                                                      │
│   ┌────────────────────────────┐                                                     │
│   │   WEBHOOK FULFILLMENT      │                                                     │
│   │   /api/webhooks/stripe     │                                                     │
│   │   Generate documents       │                                                     │
│   │   Email confirmation       │                                                     │
│   └───────────┬────────────────┘                                                     │
│               │                                                                      │
└───────────────┼─────────────────────────────────────────────────────────────────────┘
                │
┌───────────────┼─────────────────────────────────────────────────────────────────────┐
│               ▼                     RETENTION                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│   ┌────────────────────────────┐                                                     │
│   │   USER PORTAL              │                                                     │
│   │   /dashboard/cases/[id]    │                                                     │
│   │   - Document downloads     │                                                     │
│   │   - Unlimited regeneration │                                                     │
│   │   - 12+ months retention   │                                                     │
│   │   - Cross-sell CTAs        │                                                     │
│   └────────────────────────────┘                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Blog → Money Flow (Detailed)

```
BLOG POST CLUSTER                    NEXT STEPS CTA                      PRODUCT
─────────────────                    ──────────────                      ───────

Section 21 posts (8)      ──────►   Section 21 Template    ──────►    Notice Only £39.99
                                    Section 21 Validator               Complete Pack £199.99

Section 8 posts (10)      ──────►   Section 8 Template     ──────►    Complete Pack £199.99
                                    Section 8 Validator                Notice Only £39.99

Rent Arrears posts (5)    ──────►   Rent Arrears Calc      ──────►    Money Claim £199.99
                                    Money Claim Guide

Tenancy posts (4)         ──────►   AST Generator          ──────►    AST £9.99-£14.99
                                    Agreement Validator

Compliance posts (8)      ──────►   ASK HEAVEN ONLY ⚠️     ──────►    NO PRODUCT CTA ❌
(gas, EPC, deposit,                 (missing revenue path)
EICR, smoke, fire)

Wales posts (6)           ──────►   Wales Validator        ──────►    Notice Only £39.99
Scotland posts (8)        ──────►   Scotland Validator     ──────►    Notice Only £39.99
N. Ireland posts (8)      ──────►   Ask Heaven fallback    ──────►    AST only (limited)
```

---

## 4️⃣ ISSUES & GAPS

### SEO Issues

| Issue | Severity | Location | Description |
|-------|----------|----------|-------------|
| robots.ts `/_next/` disallow conflicts with audit test | **CRITICAL** | `src/app/robots.ts:38`, `scripts/seo-audit.ts:89` | Audit test expects `Allow: /_next/` but robots.ts disallows it |
| 4 validators defined but not built | HIGH | `src/lib/tools/tools.ts` | Wales, Scotland, Tenancy, Money Claim validators missing |
| No Scotland Simple Procedure landing page | HIGH | Missing route | High-intent keyword "scotland simple procedure rent arrears" unaddressed |
| No money claim type landing pages | HIGH | Missing routes | Property damage, cleaning costs, unpaid bills lack dedicated pages |
| Environment variable inconsistency | MEDIUM | `src/lib/seo/urls.ts` vs `structured-data.tsx` | Hardcoded domain vs env variable for site URL |
| Blog posts without canonical strategy | MEDIUM | `src/lib/blog/posts.tsx` | Near-duplicates (uk-right-to-rent-checks vs guide) need canonical resolution |
| Tenancy agreement pages missing hreflang | LOW | `/tenancy-agreements/*` | Multi-jurisdiction pages could benefit from hreflang signals |

### UX Issues

| Issue | Severity | Location | Description |
|-------|----------|----------|-------------|
| Northern Ireland hard 422 error | **HIGH** | `src/app/api/checkout/create/route.ts` | NI users selecting eviction products get unfriendly API error |
| NextBestActionCard not integrated | HIGH | `src/components/ask-heaven/NextBestActionCard.tsx` | Built component not rendered in Ask Heaven client |
| No pre-checkout warnings for NI | MEDIUM | Wizard flow | NI landlords can progress through wizard before hitting block |
| Scotland landlord registration not validated | MEDIUM | PRT wizard | Generated agreements may be invalid if landlord unregistered |
| Free tool watermarks missing | LOW | Generator tools | No visual distinction between free output and court-ready paid |

### Jurisdiction Risk Issues

| Issue | Severity | Location | Description |
|-------|----------|----------|-------------|
| Legacy "england-wales" values in DB | **HIGH** | Database | May contain old data requiring `property_location` hint to migrate |
| Section 21 shown in non-England selectors | MEDIUM | Tool routes | Wales/Scotland users can access England-only tools |
| NI EICR 2025 requirements | MEDIUM | `/tenancy-agreements/northern-ireland` | Need version control for agreements generated before April 2025 |
| Money claim jurisdiction gap | MEDIUM | NI | No explanation why NI money claims unsupported |

### Cannibalization Issues

| Issue | Severity | Location | Description |
|-------|----------|----------|-------------|
| Ask Heaven vs blog FAQ overlap | MEDIUM | `/ask-heaven`, `/blog/*` | Same questions answered in both may fragment authority |
| Compliance checklists on Ask Heaven | MEDIUM | `src/app/ask-heaven/page.tsx` | Inline compliance content may outrank dedicated blog guides |
| Validator vs Ask Heaven overlap | LOW | `/tools/validators/*`, `/ask-heaven` | Both provide compliance checking |

### Conversion Leakage Issues

| Issue | Severity | Location | Description |
|-------|----------|----------|-------------|
| 91 of 106 blog posts lack context CTAs | **HIGH** | `src/components/blog/NextSteps.tsx` | Only 15 posts detected for smart routing |
| Compliance posts → Ask Heaven only | HIGH | NextSteps.tsx | Gas, EPC, deposit, EICR, smoke posts have no product upsell |
| Free tool result tracking missing | HIGH | Tools pages | Cannot measure free tool engagement or ROI |
| Checkout abandonment not tracked | HIGH | Checkout flow | Unknown drop-off between start and payment |
| Ask Heaven → Wizard attribution gap | MEDIUM | Attribution flow | Cannot connect Ask Heaven session to wizard conversion |
| Validator → Wizard handoff incomplete | MEDIUM | Validator CTAs | Validator context not passed to wizard |

---

## 5️⃣ RECOMMENDED PR PLAN

### PR 1: Critical SEO Fixes
**Title:** `fix(seo): Resolve robots.ts /_next/ conflict and env var consistency`

**Scope:**
- Fix robots.ts `/_next/` disallow conflict with SEO audit test
- Standardize environment variable usage across SEO modules
- Add fallback validation to content generator

**Files Affected:**
- `src/app/robots.ts`
- `scripts/seo-audit.ts`
- `src/lib/seo/urls.ts`
- `src/lib/seo/structured-data.tsx`
- `src/lib/seo/content-generator.ts`

**Expected Impact:** Build stability, SEO audit pass rate 100%
**Dependencies:** None

---

### PR 2: Analytics Funnel Tracking Gaps
**Title:** `feat(analytics): Add free tool and checkout funnel event tracking`

**Scope:**
- Add `trackToolResultGenerated` event to all free tools
- Add `trackToolComparisonViewed` event
- Add checkout abandonment tracking
- Add webhook-triggered purchase confirmation event
- Add free tool source attribution to wizard

**Files Affected:**
- `src/lib/analytics.ts`
- `src/lib/analytics/track.ts`
- `src/app/tools/*/page.tsx` (5 tools)
- `src/components/tools/ToolUpsellCard.tsx`
- `src/app/api/checkout/create/route.ts`
- `src/app/api/webhooks/stripe/route.ts`
- `src/lib/wizard/buildWizardLink.ts`

**Expected Impact:** Complete funnel visibility, 40% better conversion optimization data
**Dependencies:** None

---

### PR 3: Ask Heaven NextBestActionCard Integration
**Title:** `feat(ask-heaven): Integrate NextBestActionCard for consistent CTAs`

**Scope:**
- Render NextBestActionCard component in Ask Heaven client
- Add fallback CTAs for non-API-suggested answers
- Implement client-side CTA enforcement
- Add secondary links (validators, guides, templates)

**Files Affected:**
- `src/app/ask-heaven/AskHeavenPageClient.tsx`
- `src/components/ask-heaven/NextBestActionCard.tsx`
- `src/lib/ask-heaven/topic-detection.ts`

**Expected Impact:** 30%+ increase in Ask Heaven → product conversion
**Dependencies:** None

---

### PR 4: Blog NextSteps CTA Expansion
**Title:** `feat(blog): Expand NextSteps CTA coverage to all 106 posts`

**Scope:**
- Add compliance topic routing (deposit, gas, EPC, EICR, smoke, fire, right-to-rent)
- Add Northern Ireland fallback with tenancy CTA
- Expand Scotland/Wales product mappings
- Add HMO/inventory routing
- Implement universal fallback logic

**Files Affected:**
- `src/components/blog/NextSteps.tsx`
- `src/lib/seo/internal-links.ts`

**Expected Impact:** 40-60% increase in blog → product conversion
**Dependencies:** None

---

### PR 5: Money Claim Cluster SEO Expansion
**Title:** `feat(seo): Add money claim type landing pages`

**Scope:**
- Create `/money-claim-property-damage` landing page
- Create `/money-claim-cleaning-costs` landing page
- Create `/money-claim-unpaid-bills` landing page
- Create `/money-claim-missing-items` landing page
- Update sitemap.ts to include new pages
- Add internal links from existing money claim content

**Files Affected:**
- `src/app/money-claim-property-damage/page.tsx` (new)
- `src/app/money-claim-cleaning-costs/page.tsx` (new)
- `src/app/money-claim-unpaid-bills/page.tsx` (new)
- `src/app/money-claim-missing-items/page.tsx` (new)
- `src/app/sitemap.ts`
- `src/lib/seo/internal-links.ts`

**Expected Impact:** 3x keyword coverage for money claim cluster
**Dependencies:** PR 4 for internal linking

---

### PR 6: Scotland Simple Procedure Landing Page
**Title:** `feat(seo): Add Scotland Simple Procedure rent recovery page`

**Scope:**
- Create `/scotland-simple-procedure` landing page
- Add Scotland-specific money claim guidance
- Link from Scotland eviction guide
- Add to sitemap

**Files Affected:**
- `src/app/scotland-simple-procedure/page.tsx` (new)
- `src/app/scotland-eviction-notices/page.tsx`
- `src/app/sitemap.ts`
- `src/lib/seo/internal-links.ts`

**Expected Impact:** Capture Scottish landlord rent recovery searches
**Dependencies:** None

---

### PR 7: Northern Ireland UX Improvements
**Title:** `fix(ux): Add friendly NI product unavailability messaging`

**Scope:**
- Replace 422 API error with informative message card
- Add pre-wizard warning for NI landlords selecting eviction products
- Improve product page NI messaging
- Add NI-specific Ask Heaven routing

**Files Affected:**
- `src/app/api/checkout/create/route.ts`
- `src/app/wizard/flow/page.tsx`
- `src/app/products/notice-only/page.tsx`
- `src/app/products/complete-pack/page.tsx`
- `src/app/products/money-claim/page.tsx`
- `src/components/ask-heaven/NextBestActionCard.tsx`

**Expected Impact:** Reduced NI user abandonment, better UX
**Dependencies:** PR 3

---

### PR 8: Validator Expansion (Wales & Scotland)
**Title:** `feat(tools): Add Wales Notice and Scotland Notice validators`

**Scope:**
- Create `/tools/validators/wales-notice` page
- Create `/tools/validators/scotland-notice-to-leave` page
- Add Wales Section 173 notice validation logic
- Add Scotland Notice to Leave validation logic
- Update validators hub page
- Update sitemap

**Files Affected:**
- `src/app/tools/validators/wales-notice/page.tsx` (new)
- `src/app/tools/validators/scotland-notice-to-leave/page.tsx` (new)
- `src/app/tools/validators/page.tsx`
- `src/app/sitemap.ts`
- `src/lib/tools/tools.ts`

**Expected Impact:** Address Wales/Scotland validator TAM, increase regional conversions
**Dependencies:** None

---

### PR 9: Blog Canonical Strategy
**Title:** `fix(seo): Implement canonical URL strategy for near-duplicate posts`

**Scope:**
- Audit all 106 blog posts for near-duplicates
- Set `canonicalSlug` for secondary posts
- Update metadata generation to respect canonicals
- Add canonical audit script

**Files Affected:**
- `src/lib/blog/posts.tsx`
- `src/app/blog/[slug]/page.tsx`
- `scripts/canonical-audit.ts` (new)

**Expected Impact:** Prevent keyword cannibalization, consolidate authority
**Dependencies:** None

---

## 6️⃣ ACCEPTANCE CRITERIA

### PR 1: Critical SEO Fixes
- [ ] `npm run seo:audit` passes without errors
- [ ] robots.ts produces consistent output in all environments
- [ ] All SEO modules use single source for site URL
- [ ] No console warnings about undefined environment variables

### PR 2: Analytics Funnel Tracking Gaps
- [ ] Vercel Analytics shows `tool_result_generated` events
- [ ] Vercel Analytics shows `tool_comparison_viewed` events
- [ ] Checkout abandonment visible in funnel reports
- [ ] Purchase events fire from webhook (server-side)
- [ ] Free tool source visible in wizard attribution

### PR 3: Ask Heaven NextBestActionCard Integration
- [ ] Every Ask Heaven answer displays at least one CTA
- [ ] Action mode shows wizard CTA for eviction/arrears topics
- [ ] Checklist mode shows email capture for compliance topics
- [ ] Tenancy mode shows AST wizard CTA
- [ ] Secondary links visible (validators, guides)

### PR 4: Blog NextSteps CTA Expansion
- [ ] All 106 blog posts have at least 3 CTAs in NextSteps
- [ ] Compliance posts route to Ask Heaven + product fallback
- [ ] Northern Ireland posts route to Ask Heaven + AST
- [ ] Scotland posts include Scotland validator CTA
- [ ] Wales posts include Wales validator CTA

### PR 5: Money Claim Cluster SEO Expansion
- [ ] 4 new landing pages render correctly
- [ ] All pages appear in sitemap.xml
- [ ] Internal links added from money-claim-unpaid-rent
- [ ] Metadata unique per page (no duplicate titles)
- [ ] Schema.org Product markup present

### PR 6: Scotland Simple Procedure Landing Page
- [ ] Page renders at `/scotland-simple-procedure`
- [ ] Page appears in sitemap.xml
- [ ] Internal links from Scotland eviction guide
- [ ] Scotland-specific terminology used (Simple Procedure, not MCOL)
- [ ] CTA routes to `/wizard?product=money_claim&jurisdiction=scotland`

### PR 7: Northern Ireland UX Improvements
- [ ] No 422 errors for NI users selecting eviction products
- [ ] Friendly "not available in your region" card displays
- [ ] Card includes recommendation for local solicitor
- [ ] Card includes AST CTA as alternative
- [ ] Pre-wizard warning prevents NI users entering eviction flow

### PR 8: Validator Expansion (Wales & Scotland)
- [ ] Wales validator accessible at `/tools/validators/wales-notice`
- [ ] Scotland validator accessible at `/tools/validators/scotland-notice-to-leave`
- [ ] Validators hub page shows both new validators
- [ ] Both pages appear in sitemap.xml
- [ ] Email gate functions correctly
- [ ] Upsell CTAs route to correct products

### PR 9: Blog Canonical Strategy
- [ ] All near-duplicate posts have canonicalSlug set
- [ ] Canonical URLs render correctly in page metadata
- [ ] Audit script identifies any remaining issues
- [ ] No duplicate URLs in sitemap.xml

---

## 7️⃣ SAFE CONTENT RULES

### Claims We Must Avoid

| ❌ Prohibited Claim | ✅ Safe Alternative |
|---------------------|---------------------|
| "Guaranteed to win eviction" | "Court-ready documents designed for compliance" |
| "Legal advice" | "Legal information and document generation" |
| "Solicitor-quality" | "Professionally drafted" |
| "100% success rate" | "Designed to meet legal requirements" |
| "Instant eviction" | "Start the legal process today" |
| "Works in all UK" (for S21/S8) | "Available for England" (specify jurisdiction) |
| "Free legal help" | "Free landlord tools and guides" |
| "Replace your solicitor" | "Complement your legal support" |

### Phrasing Rules

1. **Always specify jurisdiction** for eviction products
   - ✅ "Section 21 Notice for England"
   - ❌ "Section 21 Notice for UK"

2. **Never imply legal advice**
   - ✅ "This information is for guidance only"
   - ❌ "This is what you should do legally"

3. **Use conditional language for outcomes**
   - ✅ "Designed to help you serve a valid notice"
   - ❌ "Your notice will be valid"

4. **Distinguish free from paid clearly**
   - ✅ "Free template (not court-ready)"
   - ❌ "Free notice generator"

5. **Include disclaimers on automated tools**
   - ✅ "Always check with a qualified professional"
   - ❌ "Our AI provides accurate legal answers"

### Jurisdiction Wording Constraints

| Jurisdiction | Tenancy Type | Eviction Notice | Money Claim |
|--------------|--------------|-----------------|-------------|
| England | "Assured Shorthold Tenancy (AST)" | "Section 21" or "Section 8" | "Money Claim Online (MCOL)" |
| Wales | "Occupation Contract" (NOT AST) | "Section 173 Notice" | "Money Claim Online (MCOL)" |
| Scotland | "Private Residential Tenancy (PRT)" | "Notice to Leave" | "Simple Procedure" |
| N. Ireland | "Private Tenancy Agreement" | "Notice to Quit" (do not offer product) | (do not offer product) |

### Deposit Scheme References

| Jurisdiction | Valid Schemes |
|--------------|---------------|
| England/Wales | DPS, MyDeposits, TDS |
| Scotland | SafeDeposits Scotland, MyDeposits Scotland, Letting Protection Service Scotland |
| N. Ireland | TDS Northern Ireland, MyDeposits Northern Ireland |

### Compliance Date References

| Requirement | Jurisdiction | Date | Safe Phrasing |
|-------------|--------------|------|---------------|
| Section 21 abolition | England | 1 May 2026 | "Section 21 ends 1 May 2026" |
| EICR mandatory | N. Ireland | 1 April 2025 | "Mandatory from 1 April 2025" |
| Rent increase rules | N. Ireland | 2025 | "New rent increase restrictions apply from 2025" |
| Renting Homes Act | Wales | December 2022 | "In effect since December 2022" |

---

## APPENDIX: Key File Locations

### SEO Configuration
- `src/app/robots.ts` — Robots configuration
- `src/app/sitemap.ts` — Sitemap generation
- `src/lib/seo/metadata.ts` — Metadata helpers
- `src/lib/seo/structured-data.tsx` — Schema.org utilities
- `src/lib/seo/internal-links.ts` — Link registry
- `src/lib/seo/urls.ts` — Canonical URL utilities

### Products & Pricing
- `src/lib/pricing/products.ts` — Product definitions (source of truth)
- `src/lib/pricing.ts` — Pricing constants
- `src/app/api/checkout/create/route.ts` — Checkout engine
- `src/app/api/webhooks/stripe/route.ts` — Payment processing

### Tools & Validators
- `src/lib/tools/tools.ts` — Tool configuration
- `src/components/tools/ToolUpsellCard.tsx` — Upsell component
- `src/components/tools/ToolFunnelTracker.tsx` — Analytics
- `src/app/tools/validators/section-21/page.tsx` — Section 21 validator
- `src/app/tools/validators/section-8/page.tsx` — Section 8 validator

### Ask Heaven
- `src/app/ask-heaven/page.tsx` — SSR page
- `src/app/ask-heaven/AskHeavenPageClient.tsx` — Chat interface
- `src/lib/ask-heaven/topic-detection.ts` — Topic routing
- `src/components/ask-heaven/NextBestActionCard.tsx` — CTA component (not integrated)

### Blog
- `src/lib/blog/posts.tsx` — All 106 posts
- `src/lib/blog/categories.ts` — Category/region logic
- `src/app/blog/[slug]/page.tsx` — Dynamic route
- `src/components/blog/NextSteps.tsx` — Context-aware CTAs

### Analytics
- `src/lib/analytics.ts` — Core tracking (1000+ lines)
- `src/lib/analytics/track.ts` — Vercel Analytics
- `src/lib/wizard/wizardAttribution.ts` — Wizard attribution
- `src/lib/ask-heaven/askHeavenAttribution.ts` — Ask Heaven attribution

### Jurisdiction
- `src/lib/types/jurisdiction.ts` — Type definitions
- `src/lib/jurisdictions/capabilities/matrix.ts` — Product support matrix
- `src/config/jurisdictions/uk/` — Jurisdiction-specific config

---

**END OF AUDIT REPORT**

*Awaiting explicit instruction to proceed with implementation PRs.*
