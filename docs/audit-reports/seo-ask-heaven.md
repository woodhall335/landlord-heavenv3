# SEO Audit Report: Ask Heaven

**Date:** 2026-01-13
**Auditor:** Claude Code
**Status:** Complete

---

## Part 0 — Audit Summary

### Route Structure

| Route | Type | Purpose |
|-------|------|---------|
| `/ask-heaven` | SSR Page | Main Q&A chat interface |
| `/api/ask-heaven/chat` | POST API | Answer generation via GPT-4o-mini |
| `/api/ask-heaven/case` | GET API | Load case-specific context |
| `/api/ask-heaven/enhance-answer` | POST API | Wizard answer enhancement |

**Finding:** Single page architecture. No individual Q&A pages (e.g., `/ask-heaven/[questionId]`). All Q&A handled through conversational chat interface.

### Answer Generation Flow

```
User Question → /api/ask-heaven/chat → GPT-4o-mini → Structured JSON Response
                                                         ↓
                                        {
                                          reply: string,
                                          suggested_product: enum | null,
                                          suggested_next_step: 'wizard' | 'checklist' | 'guide' | 'none',
                                          suggested_topic: enum,
                                          follow_up_questions: string[],
                                          sources: string[]
                                        }
```

**Key Files:**
- `src/app/ask-heaven/page.tsx` (SSR page with metadata + FAQ schema)
- `src/app/ask-heaven/AskHeavenPageClient.tsx` (Chat interface)
- `src/app/api/ask-heaven/chat/route.ts` (API endpoint)
- `src/lib/ask-heaven/topic-detection.ts` (CTA mapping)
- `src/components/ask-heaven/NextBestActionCard.tsx` (CTA component - **NOT CURRENTLY USED**)

### Individual Q&A Pages Analysis

**Finding:** No individual Q&A pages exist.

- No dynamic route at `/ask-heaven/[id]` or similar
- All Q&A is ephemeral within chat session
- No persistent Q&A content to index

**Recommendation:** No noindex strategy needed since no individual Q&A pages exist. If individual Q&A pages are added in the future, they should be:
- `noindex` by default to prevent thin content issues
- Only indexed if they meet quality thresholds (engagement metrics, content length)

### Current Metadata

**Current Title:** `Ask Heaven – Free UK Landlord Q&A Tool`
**Current Description:** `Free landlord advice for England, Wales, Scotland and NI. Get answers on evictions, deposit protection, EPC rules, gas safety, EICR, smoke alarms and right to rent.`

**Assessment:**
- ✅ Includes "Free" keyword
- ✅ Mentions UK jurisdictions
- ✅ Lists key topics
- ⚠️ Could be more specific about "Legal Q&A" nature
- ⚠️ Title doesn't match requested format

**Recommended Title:** `Free Landlord Legal Q&A | UK | Ask Heaven`
**Recommended Description:** `Free legal Q&A for UK landlords covering England, Wales, Scotland & Northern Ireland. Get instant answers on evictions, rent arrears, tenancy agreements, and compliance.`

### Current CTAs in Answers

**What exists:**
1. **Product CTA from API response** (`src/app/ask-heaven/AskHeavenPageClient.tsx:995-1022`)
   - Renders when `suggestedProduct` is returned by API
   - Maps to `ASK_HEAVEN_RECOMMENDATION_MAP` for display
   - Shows product label, description, and price

2. **Follow-up Question Buttons** (`src/app/ask-heaven/AskHeavenPageClient.tsx:978-992`)
   - Renders 2-3 clickable follow-up questions
   - Submits question directly when clicked

3. **NextBestActionCard Component** (`src/components/ask-heaven/NextBestActionCard.tsx`)
   - Full-featured CTA component with 3 modes: action, checklist, tenancy
   - Jurisdiction-aware copy and product recommendations
   - **NOT CURRENTLY INTEGRATED** in the chat interface

**Gap Identified:** The `NextBestActionCard` component exists but is not used in `AskHeavenPageClient.tsx`. CTAs are only shown when the API suggests a product, but there's no fallback or enhancement layer.

### Jurisdiction Detection

**Current Implementation:** ✅ Full jurisdiction support

| Jurisdiction | Eviction Products | Money Claim | Tenancy Agreement |
|--------------|-------------------|-------------|-------------------|
| England | ✅ Section 21/8 | ✅ MCOL | ✅ AST |
| Wales | ✅ Section 173 | ✅ MCOL | ✅ Occupation Contract |
| Scotland | ✅ Notice to Leave | ✅ Simple Procedure | ✅ PRT |
| Northern Ireland | ❌ (info only) | ❌ (info only) | ✅ Tenancy Agreement |

**Where enforced:**
- `src/app/api/ask-heaven/chat/route.ts:239-248` (API-level NI filtering)
- `src/lib/ask-heaven/topic-detection.ts:175-201` (CTA filtering)
- `src/components/ask-heaven/NextBestActionCard.tsx:74-86` (UI handling)

---

## Part 1 — Issues & Recommendations

### Issue 1: Metadata Not Optimized

**Current State:**
```typescript
title: 'Ask Heaven – Free UK Landlord Q&A Tool'
```

**Recommendation:**
```typescript
title: 'Free Landlord Legal Q&A | UK | Ask Heaven'
description: 'Free legal Q&A for UK landlords covering England, Wales, Scotland & Northern Ireland. Get instant answers on evictions, rent arrears, tenancy agreements, and compliance.'
```

### Issue 2: FAQ Section Already Exists But Could Be Enhanced

**Current State:** FAQ section exists with 6 questions covering:
- Eviction notices
- Rent arrears
- Tenancy agreements
- Illegal eviction risks
- Jurisdiction coverage
- Document generation

**FAQPage Schema:** ✅ Already implemented via `faqPageSchema(faqItems)`

**Recommendation:** Current FAQ is good. No changes needed unless specific questions are required.

### Issue 3: NextBestActionCard Not Integrated

**Current State:** The `NextBestActionCard` component provides:
- Jurisdiction-aware wizard CTAs
- Compliance checklist mode
- Validator/guide secondary links

But it's **not rendered** in the chat interface.

**Recommendation:** Integrate `NextBestActionCard` into the answer display to ensure consistent CTAs after every answer.

### Issue 4: No "Start the right wizard" CTA Enforcement

**Current State:** CTAs depend entirely on API returning `suggested_product`. No client-side enforcement.

**Recommendation:** Add client-side CTA enforcement:
1. Detect eviction/money claim/tenancy agreement intent from detected topic
2. Show "Start the right wizard" CTA for matching intents
3. Use jurisdiction-appropriate copy

---

## Part 2 — Implementation Plan

### 2.1 Update Metadata

**File:** `src/app/ask-heaven/page.tsx`

Update `metadata` export:
```typescript
export const metadata: Metadata = {
  title: 'Free Landlord Legal Q&A | UK | Ask Heaven',
  description: 'Free legal Q&A for UK landlords covering England, Wales, Scotland & Northern Ireland. Get instant answers on evictions, rent arrears, tenancy agreements, and compliance.',
  // ... rest unchanged
};
```

### 2.2 Integrate NextBestActionCard

**File:** `src/app/ask-heaven/AskHeavenPageClient.tsx`

Import and render `NextBestActionCard` after assistant messages when topic is detected.

### 2.3 Enforce Response CTAs

Add logic to always show a CTA when:
- `detectedTopic` is `eviction`, `arrears`, or `tenancy`
- `suggestedNextStep` is `wizard`
- Question matches eviction/money claim/tenancy agreement patterns

---

## Part 3 — Test Requirements

### 3.1 FAQ Schema Test

Test that `/ask-heaven` page renders FAQPage structured data.

### 3.2 CTA Rendering Test

Test that CTAs are rendered in answer component when:
- Topic is eviction → Show eviction wizard CTA
- Topic is arrears → Show money claim CTA
- Topic is tenancy → Show tenancy agreement CTA
- Jurisdiction is NI → Only show tenancy CTA for eviction/arrears topics

---

## Acceptance Criteria

| Criterion | Status | Notes |
|-----------|--------|-------|
| Ask Heaven is indexable | ✅ | Already indexable, no robots restrictions |
| Metadata optimized | ⏳ | Needs update |
| FAQ schema present | ✅ | Already implemented |
| CTAs are consistent | ⏳ | Need NextBestActionCard integration |
| CTAs are jurisdiction-safe | ✅ | Already enforced in topic-detection.ts |
| Tests pass | ⏳ | Need to add new tests |

---

## Files to Modify

1. `src/app/ask-heaven/page.tsx` - Update metadata
2. `src/app/ask-heaven/AskHeavenPageClient.tsx` - Integrate NextBestActionCard
3. `tests/seo/ask-heaven.test.tsx` - Add new tests (create)
