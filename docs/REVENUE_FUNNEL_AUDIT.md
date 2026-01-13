# Revenue Funnel Audit Report

**Date:** January 2026
**Auditor:** Claude (Opus 4.5)
**Scope:** Full revenue funnel analysis of Landlord Heaven v3

---

## Executive Summary

This audit reveals **CRITICAL revenue leakage** through pricing inconsistencies, missing upsell opportunities, and incomplete remarketing infrastructure. Estimated monthly revenue impact: **£5,000-15,000+** in potential recovered/increased revenue.

### Priority Classification
- **P0** = Critical revenue leak, fix immediately
- **P1** = High-impact fix, implement this sprint
- **P2** = Medium impact, schedule for next sprint
- **P3** = Low priority, backlog

---

## 1. Funnel Map: Entry → Action → Conversion

```
                    ┌─────────────────┐
                    │   TRAFFIC IN    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│     BLOG      │   │  FREE TOOLS   │   │  ASK HEAVEN   │
│  (100+ posts) │   │  (validators, │   │  (AI Q&A)     │
│               │   │   generators) │   │               │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        │     [WEAK CTAs]   │   [Email Gate]    │  [Topic Detection]
        │                   │                   │
        └────────────┬──────┴───────────────────┘
                     ▼
           ┌─────────────────┐
           │  PRODUCT PAGES  │
           │  /pricing       │
           │  /products/*    │
           └────────┬────────┘
                    │
                    ▼
           ┌─────────────────┐
           │    WIZARD       │
           │  (Q&A Flow)     │
           └────────┬────────┘
                    │
            [PREVIEW]│[BLOCKERS?]
                    │
                    ▼
           ┌─────────────────┐
           │   CHECKOUT      │
           │   (Stripe)      │
           └────────┬────────┘
                    │
                    ▼
           ┌─────────────────┐
           │   DASHBOARD     │
           │  [NO UPSELLS]   │ ← P1 LEAK
           └─────────────────┘
```

---

## 2. CRITICAL REVENUE LEAKS (P0)

### 2.1 MULTIPLE CONFLICTING PRICE SOURCES

**Impact:** High - Users may see incorrect prices, causing trust issues and refund requests.

| File | Notice Only | Complete Pack | Money Claim | Status |
|------|-------------|---------------|-------------|--------|
| `src/lib/pricing.ts` | £29.99 | £149.99 | £179.99 | **OLD** |
| `src/lib/pricing/products.ts` | £39.99 | £199.99 | £199.99 | **CURRENT** |
| `src/lib/checkout/cta-mapper.ts` | £29.99 | £149.99 | £179.99 | **OLD** |
| `src/lib/ask-heaven/topic-detection.ts` | £29.99 | £149.99 | £179.99 | **OLD** |
| UI Pages (all) | £39.99 | £199.99 | £199.99 | **CORRECT** |

**Files to fix:**
1. `src/lib/pricing.ts:10-14` - Update to current prices
2. `src/lib/checkout/cta-mapper.ts:31-37` - Update PRICE_MAP
3. `src/lib/ask-heaven/topic-detection.ts:99-116` - Update CTA_CONFIGS prices

### 2.2 WRONG PRICE IN PDF PREVIEW

**File:** `src/lib/documents/notice-only-preview-merger.ts:305`

```typescript
// CURRENT (WRONG)
tocPage.drawText('Complete purchase (£29.99) to download full unredacted documents.', {

// SHOULD BE
tocPage.drawText('Complete purchase (£39.99) to download full unredacted documents.', {
```

**Impact:** Every preview PDF shows wrong price. Users expect £29.99 but charged £39.99.

### 2.3 HARDCODED BLOG CTA PRICES

**File:** `src/components/blog/BlogCTA.tsx:56`

```typescript
// CURRENT (HARDCODED)
Get Section 21 Notice — £39.99

// SHOULD USE
import { PRODUCTS } from '@/lib/pricing/products';
// ...
Get Section 21 Notice — {PRODUCTS.notice_only.displayPrice}
```

**Other hardcoded price locations:**
- `src/app/blog/[slug]/page.tsx:606` - "Get Section 21 — £39.99"
- `src/app/blog/page.tsx:217` - "Section 21 Notice — £39.99"
- 50+ other files with hardcoded prices

---

## 3. HIGH-IMPACT FIXES (P1)

### 3.1 MISSING POST-PURCHASE UPSELLS

**Current state:** Success page redirects to `/dashboard/cases/[id]` with no upsell logic.

**Revenue opportunity:**
- Notice Only (£39.99) → Upsell to Complete Pack (£199.99) = +£160
- Notice Only (£39.99) → Cross-sell Money Claim (£199.99) = +£199.99
- Standard AST (£9.99) → Upsell to Premium AST (£14.99) = +£5

**Recommended implementation:**

```typescript
// src/app/dashboard/cases/[id]/page.tsx

// After purchase, show contextual upsell
function PostPurchaseUpsell({ productType, caseData }) {
  const upsells = {
    notice_only: {
      title: "Need Court Forms?",
      description: "Upgrade to Complete Pack for N5, N5B, and witness statement.",
      cta: "Upgrade for £160 more",
      product: "complete_pack",
      savings: "Save £40 vs buying separately"
    },
    notice_only_with_arrears: {
      title: "Also Claiming Rent Arrears?",
      description: "Get the Money Claim Pack to recover what you're owed.",
      cta: "Add Money Claim Pack — £199.99",
      product: "money_claim"
    }
  };
  // ...
}
```

**Estimated impact:** If 10% of Notice Only buyers upgrade → 100 sales/month × 10% × £160 = £1,600/month

### 3.2 MISSING ABANDONED CART EMAILS

**Current state:** Stripe sessions expire with no follow-up.

**Database tables exist:**
- `email_subscribers` - captured leads
- `email_events` - event tracking
- `orders` - includes `payment_status: 'pending'`

**Missing:**
1. Abandoned checkout detection (order created, payment never completed)
2. Email trigger at 1hr, 24hr, 48hr
3. Recovery email template with discount code option

**Implementation location:** Create `src/app/api/cron/abandoned-checkout/route.ts`

### 3.3 NO CROSS-SELL EMAIL SEQUENCE

**Current state:** Purchase confirmation emails sent, but no follow-up nurture.

**Recommended sequences:**
1. **Notice Only buyers:** Day 3: "Tenant still there? Complete Pack includes court forms"
2. **Eviction buyers:** Day 7: "Recovering arrears too? Money Claim Pack"
3. **AST buyers:** Day 14: "Need to evict later? Save 10% on Notice Pack"

---

## 4. MEDIUM IMPACT FIXES (P2)

### 4.1 JURISDICTION CTA LEAKAGE

**Issue:** Users in Northern Ireland can see eviction product CTAs before selecting jurisdiction.

**Files affected:**
- `src/components/ask-heaven/NextBestActionCard.tsx` - Handles this correctly
- `src/lib/ask-heaven/topic-detection.ts:106-107` - Has `excludeJurisdictions`
- Homepage / pricing page - Shows all products regardless of user jurisdiction

**Fix:** Add jurisdiction detection cookie/localStorage and personalize CTAs.

### 4.2 BLOG NEXT STEPS NOT CONTEXTUAL ENOUGH

**File:** `src/components/blog/NextSteps.tsx`

**Current:** Uses `getNextStepsCTAs()` which is tag-based but not jurisdiction-aware.

**Missing:**
- Jurisdiction-specific CTAs (e.g., Wales posts should show Section 173, not Section 21)
- Price display in next steps (currently just labels)

### 4.3 FREE TOOL → PAID CONVERSION PATH

**Current tools:**
- Free Section 21 Generator
- Free Section 8 Generator
- Free Rent Demand Letter
- Rent Arrears Calculator
- HMO License Checker

**Good:** Email gate exists (`useEmailGate.ts`)

**Missing:**
- Post-email nurture for tool users
- Contextual upsell based on tool output
- "Your notice has X issues, fix them with Notice Pack" flow

---

## 5. TRACKING & ATTRIBUTION ANALYSIS

### What IS Tracked (Good)

| Event | GA4 | Facebook | Vercel |
|-------|-----|----------|--------|
| wizard_entry_view | ✅ | ✅ | ✅ |
| wizard_start | ✅ | ✅ | ✅ |
| wizard_step_complete | ✅ | ❌ | ✅ |
| wizard_review_view | ✅ | ✅ | ✅ |
| wizard_abandon | ✅ | ❌ | ✅ |
| purchase | ✅ | ✅ | ✅ |
| validator_result | ✅ | ✅ | ✅ |
| validator_cta_click | ✅ | ✅ | ✅ |
| ask_heaven_* | ✅ | ✅ | ✅ |

### What Is NOT Tracked (Gaps)

| Missing Event | Impact | Priority |
|---------------|--------|----------|
| blog_cta_click | Can't attribute blog→conversion | P2 |
| product_page_scroll_depth | Don't know engagement | P3 |
| upsell_shown / upsell_clicked | Can't measure upsell effectiveness | P1 |
| cross_sell_shown / cross_sell_clicked | Can't measure cross-sell | P1 |
| email_opened (post-capture) | Can't measure email effectiveness | P2 |

### Attribution Gaps

**Cannot currently answer:**
1. Which blog posts drive the most revenue?
2. What % of validator users convert to paid?
3. What's the Ask Heaven → purchase conversion rate?

**Fix:** Add `src` parameter tracking consistently through entire funnel.

---

## 6. EMAIL & REMARKETING INFRASTRUCTURE

### Current State

| Capability | Status | Notes |
|------------|--------|-------|
| Lead capture | ✅ | `email_subscribers` table |
| Email sending | ✅ | Resend integration |
| Purchase confirmation | ✅ | Sent on webhook |
| Welcome email | ✅ | On signup |
| Trial reminder | ✅ | HMO Pro only |
| Compliance reminder | ✅ | HMO Pro only |
| Abandoned cart | ❌ | **MISSING** |
| Nurture sequence | ❌ | **MISSING** |
| Cross-sell emails | ❌ | **MISSING** |
| Re-engagement | ❌ | **MISSING** |

### Recommended Email Flows

```
[Lead Captured]
    │
    ├─ (Ask Heaven) → Day 1: "Here's a summary of your questions"
    │                 Day 3: "Ready to take action?" + product CTA
    │
    ├─ (Validator)  → Day 1: "Your validation report"
    │                 Day 3: "Fix the issues with Notice Pack"
    │
    └─ (Free Tool)  → Day 1: "Your results are attached"
                      Day 5: "Take it further with our paid tools"

[Abandoned Checkout]
    │
    ├─ Hour 1:  "You left something behind"
    ├─ Day 1:   "Your documents are waiting"
    └─ Day 3:   "Last chance" + optional 10% discount

[Post-Purchase]
    │
    ├─ Notice Only → Day 3: "Need court forms too?"
    ├─ AST         → Day 14: "Having tenant issues? Eviction packs"
    └─ Any         → Day 30: "How was your experience?" + review ask
```

---

## 7. RECOMMENDED FIXES - PRIORITIZED

### Immediate (This Week) - P0

| # | Issue | File(s) | Effort | Impact |
|---|-------|---------|--------|--------|
| 1 | Fix pricing.ts to match products.ts | `src/lib/pricing.ts` | 5 min | HIGH |
| 2 | Fix cta-mapper.ts prices | `src/lib/checkout/cta-mapper.ts` | 5 min | HIGH |
| 3 | Fix topic-detection.ts prices | `src/lib/ask-heaven/topic-detection.ts` | 5 min | HIGH |
| 4 | Fix PDF preview price | `src/lib/documents/notice-only-preview-merger.ts:305` | 5 min | HIGH |

### This Sprint - P1

| # | Issue | File(s) | Effort | Impact |
|---|-------|---------|--------|--------|
| 5 | Add post-purchase upsell component | New: `src/components/upsells/PostPurchaseUpsell.tsx` | 2 hrs | £1,600+/mo |
| 6 | Add upsell to dashboard case page | `src/app/dashboard/cases/[id]/page.tsx` | 1 hr | HIGH |
| 7 | Create abandoned checkout cron | New: `src/app/api/cron/abandoned-checkout/route.ts` | 4 hrs | £2,000+/mo |
| 8 | Add abandoned checkout email template | `src/lib/email/resend.ts` | 2 hrs | HIGH |
| 9 | Track upsell/cross-sell events | `src/lib/analytics.ts` | 1 hr | MEDIUM |

### Next Sprint - P2

| # | Issue | File(s) | Effort | Impact |
|---|-------|---------|--------|--------|
| 10 | Blog CTA use products.ts prices | `src/components/blog/BlogCTA.tsx` + 50 files | 4 hrs | MEDIUM |
| 11 | Add blog_cta_click tracking | `src/components/blog/BlogCTA.tsx` | 30 min | MEDIUM |
| 12 | Cross-sell email sequence | `src/app/api/cron/cross-sell-emails/route.ts` | 4 hrs | £1,000+/mo |
| 13 | Jurisdiction-aware homepage CTAs | `src/app/page.tsx` | 2 hrs | LOW |

---

## 8. CODE-LEVEL FIXES

### Fix 1: Update src/lib/pricing.ts

```typescript
// BEFORE
export const PRICING = {
  NOTICE_ONLY: 29.99,
  COMPLETE_EVICTION_PACK: 149.99,
  MONEY_CLAIM_PACK: 179.99,
  // ...
}

// AFTER
export const PRICING = {
  NOTICE_ONLY: 39.99,
  COMPLETE_EVICTION_PACK: 199.99,
  MONEY_CLAIM_PACK: 199.99,
  // ...
}
```

### Fix 2: Update src/lib/checkout/cta-mapper.ts

```typescript
// BEFORE (lines 31-37)
const PRICE_MAP: Record<ProductKey, number> = {
  notice_only: 29.99,
  complete_pack: 149.99,
  money_claim: 179.99,
  ast_standard: 9.99,
  ast_premium: 14.99,
};

// AFTER
const PRICE_MAP: Record<ProductKey, number> = {
  notice_only: 39.99,
  complete_pack: 199.99,
  money_claim: 199.99,
  ast_standard: 9.99,
  ast_premium: 14.99,
};
```

### Fix 3: Update src/lib/ask-heaven/topic-detection.ts

```typescript
// BEFORE (lines 99-116)
const CTA_CONFIGS: TopicCTAConfig[] = [
  {
    topics: ['eviction'],
    ctas: [
      { label: 'Notice Only', href: '/products/notice-only', price: 29.99, ... },
      { label: 'Complete Pack', href: '/products/complete-pack', price: 149.99, ... },
    ],
  },
  {
    topics: ['arrears'],
    ctas: [
      { label: 'Money Claim Pack', href: '/products/money-claim', price: 179.99, ... },
      { label: 'Notice Only', href: '/products/notice-only', price: 29.99, ... },
    ],
  },
  // ...

// AFTER
const CTA_CONFIGS: TopicCTAConfig[] = [
  {
    topics: ['eviction'],
    ctas: [
      { label: 'Notice Only', href: '/products/notice-only', price: 39.99, ... },
      { label: 'Complete Pack', href: '/products/complete-pack', price: 199.99, ... },
    ],
  },
  {
    topics: ['arrears'],
    ctas: [
      { label: 'Money Claim Pack', href: '/products/money-claim', price: 199.99, ... },
      { label: 'Notice Only', href: '/products/notice-only', price: 39.99, ... },
    ],
  },
  // ...
```

### Fix 4: Update src/lib/documents/notice-only-preview-merger.ts

```typescript
// BEFORE (line 305)
tocPage.drawText('Complete purchase (£29.99) to download full unredacted documents.', {

// AFTER
tocPage.drawText('Complete purchase (£39.99) to download full unredacted documents.', {
```

---

## 9. SUCCESS METRICS

After implementing fixes, track:

| Metric | Current (Est.) | Target | Measurement |
|--------|----------------|--------|-------------|
| Price display accuracy | 60% | 100% | Manual audit |
| Notice Only → Complete Pack upsell rate | 0% | 10% | GA4 upsell_clicked / notice_only_purchased |
| Abandoned cart recovery rate | 0% | 15% | recovered_orders / abandoned_orders |
| Email capture → purchase rate | ~2% | 5% | orders / email_subscribers |
| Revenue per visitor | £X | +20% | revenue / sessions |

---

## 10. APPENDIX: All Price Locations Found

Files containing hardcoded prices that should be audited:

```
src/app/tenancy-agreement-template/page.tsx
src/app/page-redesign.tsx
src/app/help/page.tsx
src/components/blog/BlogCTA.tsx
src/app/section-8-notice-template/page.tsx
src/components/value-proposition/ComparisonTables.tsx
src/components/landing/HomeContent.tsx
src/components/landing/CostComparison.tsx
src/components/tools/FreeToolLayout.tsx
src/app/about/page.tsx
src/app/money-claim-unpaid-rent/page.tsx
src/app/eviction-notice-template/page.tsx
src/app/pricing/page.tsx
src/app/tools/rent-arrears-calculator/page.tsx
src/app/tenancy-agreements/england/page.tsx
src/app/tools/validators/section-21/page.tsx
src/app/section-21-notice-template/page.tsx
src/app/tenancy-agreements/scotland/page.tsx
src/app/tools/validators/section-8/page.tsx
src/app/tools/free-rent-demand-letter/page.tsx
src/lib/blog/posts.tsx
src/lib/seo/internal-links.ts
src/app/tenancy-agreements/northern-ireland/page.tsx
src/app/tools/hmo-license-checker/page.tsx
src/app/tenancy-agreements/wales/page.tsx
src/app/section-21-ban/page.tsx
src/lib/documents/notice-only-preview-merger.ts
src/app/blog/[slug]/page.tsx
src/app/blog/page.tsx
src/lib/documents/eviction-pack-generator.ts
src/lib/pricing/products.ts
src/app/rent-arrears-letter-template/page.tsx
src/app/scotland-eviction-notices/page.tsx
src/lib/documents/document-configs.ts
src/app/wizard/page.tsx
src/app/wizard/review/page.tsx
src/app/wales-eviction-notices/page.tsx
src/app/how-to-evict-tenant/page.tsx
```

---

## End of Audit Report

**Recommended next steps:**
1. Fix P0 pricing issues immediately (30 minutes)
2. Implement post-purchase upsell this sprint (1 day)
3. Set up abandoned cart emails this sprint (1 day)
4. Schedule P2 items for next sprint

**Total estimated revenue impact:** £5,000-15,000/month when fully implemented.
