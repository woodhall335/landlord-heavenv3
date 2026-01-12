# Payment & Fulfillment Flow Audit Report

**Date:** 2026-01-12
**Scope:** All wizard products, payment, fulfillment, and document delivery flows

---

## Executive Summary

This audit examines the post-payment and fulfillment flows across all wizard products. Critical issues were identified in:

1. **Double-payment vulnerability** - No idempotency check prevents paying twice for the same (case_id, product_type)
2. **Document count mismatch** - Preview "What's included" can differ from actually generated documents
3. **State inconsistency** - Case status can contradict order/payment/fulfillment state
4. **UI confusion** - Several UI elements create confusion for paid users
5. **Ask Heaven defaults** - Shows inferred values (e.g., 8% interest) not explicitly provided by user

---

## 1. State Machine: Payment → Fulfillment → Documents

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ORDER STATE MACHINE                              │
└─────────────────────────────────────────────────────────────────────────┘

                      ┌──────────────────────┐
                      │   ORDER NOT EXISTS   │
                      │   (User in wizard)   │
                      └──────────┬───────────┘
                                 │
                    User clicks "Buy" / "Get Documents"
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  payment_status: pending                                                 │
│  fulfillment_status: pending                                            │
│  Order created in DB, Stripe session created                            │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                    User completes Stripe Checkout
                               │
        ┌──────────────────────┴───────────────────────┐
        │                                               │
        ▼                                               ▼
┌─────────────────────┐                      ┌─────────────────────┐
│  payment_status:    │                      │  payment_status:    │
│    FAILED           │                      │    PAID             │
│  fulfillment_status:│                      │  fulfillment_status:│
│    failed           │                      │    ready_to_generate│
└─────────────────────┘                      └──────────┬──────────┘
                                                        │
                                            Webhook triggers fulfillment
                                                        │
                                                        ▼
                                             ┌─────────────────────┐
                                             │  fulfillment_status:│
                                             │    PROCESSING       │
                                             └──────────┬──────────┘
                                                        │
                    ┌───────────────────────────────────┴───────────────────┐
                    │                                                       │
                    ▼                                                       ▼
         ┌─────────────────────┐                             ┌─────────────────────┐
         │  fulfillment_status:│                             │  fulfillment_status:│
         │    FULFILLED        │                             │    FAILED           │
         │  Documents created  │                             │  No documents       │
         │  in DB + storage    │                             │  User can retry     │
         └─────────────────────┘                             └─────────────────────┘
```

### Current State Values

| Field | Values | Notes |
|-------|--------|-------|
| `payment_status` | `pending`, `paid`, `failed`, `refunded`, `partially_refunded` | |
| `fulfillment_status` | `pending`, `ready_to_generate`, `processing`, `fulfilled`, `failed` | |
| `case.status` | `draft`, `in_progress`, `completed` | **Separate from order - can be inconsistent** |

---

## 2. "What's Included" Definition Locations

### A) Primary Source (for Preview UI)
**File:** `src/lib/products/pack-contents.ts`

Exports `getPackContents()` function - **intended single source of truth** for what documents are included in each product.

### B) Legacy Source (for Eviction UI components)
**File:** `src/lib/documents/eviction-pack-contents.ts`

Exports `getEvictionPackContents()` - **duplicate definition** with slightly different structure. Used by some older UI components.

### C) Actual Generator Logic
Each generator independently decides what documents to produce:

| Generator | Location | Products |
|-----------|----------|----------|
| `generateNoticeOnlyPack` | `eviction-pack-generator.ts:1040` | `notice_only` |
| `generateCompleteEvictionPack` | `eviction-pack-generator.ts:799` | `complete_pack` |
| `generateMoneyClaimPack` | `money-claim-pack-generator.ts:561` | `money_claim` |
| `generateScotlandMoneyClaim` | `scotland-money-claim-pack-generator.ts:505` | `sc_money_claim` |
| `generateStandardASTDocuments` | `ast-generator.ts:579` | `ast_standard` |
| `generatePremiumASTDocuments` | `ast-generator.ts:713` | `ast_premium` |

### D) Preview UI Usage
**File:** `src/components/preview/PreviewPageLayout.tsx`

Receives `documents: DocumentInfo[]` prop - populated by preview page which should call `getPackContents()`.

---

## 3. Document Generation vs Expected: Product Table

### Notice Only (England, Section 8)

| Expected (pack-contents.ts) | Actually Generated (eviction-pack-generator.ts) |
|-----------------------------|------------------------------------------------|
| Section 8 Notice | ✅ Section 8 Notice |
| Service Instructions | ✅ Service Instructions |
| Service & Validity Checklist | ✅ Service & Validity Checklist |
| Rent Arrears Schedule (if arrears) | ❌ Pre-Service Compliance Declaration (not in pack-contents) |

**Discrepancy:** Compliance Declaration generated but not listed in pack-contents.

### Complete Pack (England, Section 8)

| Expected (pack-contents.ts) | Actually Generated (eviction-pack-generator.ts) |
|-----------------------------|------------------------------------------------|
| Section 8 Notice | ✅ Section 8 Notice |
| Form N5 - Claim for Possession | ✅ N5 Claim Form |
| Form N119 - Particulars | ✅ N119 Particulars |
| Witness Statement | ✅ Witness Statement (AI-generated) |
| Court Filing Guide | ❌ NOT GENERATED (only comment says removed) |
| Evidence Collection Checklist | ✅ Evidence Checklist |
| Proof of Service Template | ✅ Proof of Service |
| Service Instructions | ❓ NOT EXPLICITLY GENERATED (inherited from notice-only call) |
| Service & Validity Checklist | ❓ NOT EXPLICITLY GENERATED |
| Rent Arrears Schedule (if arrears) | ✅ Generated conditionally |

**Discrepancies:**
- Court Filing Guide listed in pack-contents but removed in Jan 2026 restructure
- Service Instructions/Checklist not explicitly generated in complete pack

### Money Claim (England/Wales)

| Expected (pack-contents.ts) | Actually Generated (money-claim-pack-generator.ts) |
|-----------------------------|---------------------------------------------------|
| Form N1 - Money Claim Form | ✅ Form N1 (official PDF) |
| Particulars of Claim | ✅ Particulars of Claim |
| Schedule of Arrears | ✅ Schedule of Arrears |
| Interest Calculation | ✅ Interest Calculation |
| Letter Before Claim | ✅ Letter Before Claim |
| Defendant Information Sheet | ✅ Information Sheet for Defendants |
| Court Filing Guide | ✅ Money Claims Filing Guide |
| Enforcement Guide | ✅ Enforcement Guide |
| N/A | ✅ Reply Form (not in pack-contents) |
| N/A | ✅ Financial Statement Form (not in pack-contents) |

**Discrepancies:** Reply Form and Financial Statement Form generated but not listed in pack-contents.

### Scotland Money Claim (`sc_money_claim`)

| Expected (pack-contents.ts) | Actually Generated (scotland-money-claim-pack-generator.ts) |
|-----------------------------|-------------------------------------------------------------|
| Form 3A - Simple Procedure | ✅ Simple Procedure Claim Form |
| Statement of Claim | ✅ Statement of Claim (Particulars) |
| Schedule of Arrears | ✅ Schedule of Arrears (if provided) |
| Interest Calculation | ✅ Interest Calculation (if > 0) |
| Pre-Action Letter | ✅ Pre-Action Letter |
| Filing Guide | ✅ Simple Procedure Filing Guide |
| Enforcement Guide | ✅ Enforcement Guide (Diligence) |

**Status:** ✅ Well-aligned

### AST Standard

| Expected (pack-contents.ts) | Actually Generated (ast-generator.ts) |
|-----------------------------|---------------------------------------|
| AST Agreement | ✅ Assured Shorthold Tenancy Agreement |
| Terms & Conditions Schedule | ✅ Terms & Conditions Schedule |
| Government Model Clauses | ✅ Government Model Clauses |
| Inventory Template | ✅ Inventory Template |

**Status:** ✅ Well-aligned

### AST Premium

| Expected (pack-contents.ts) | Actually Generated (ast-generator.ts) |
|-----------------------------|---------------------------------------|
| All Standard docs | ✅ All Standard docs |
| Key Schedule | ✅ Key Schedule |
| Property Maintenance Guide | ✅ Property Maintenance Guide |
| Checkout Procedure | ✅ Checkout Procedure |

**Status:** ✅ Well-aligned

---

## 4. Checkout/Payment Trigger Points

### A) API Endpoint
**File:** `src/app/api/checkout/create/route.ts`

Creates Stripe checkout session and order record. **Does NOT check for existing paid order.**

### B) UI Flows That Can Trigger Payment

| Location | Component/Button | Notes |
|----------|------------------|-------|
| `src/components/preview/PreviewPageLayout.tsx` | "Get Your Documents" button | Main checkout trigger |
| `src/app/wizard/preview/[caseId]/page.tsx` | Uses PreviewPageLayout | |
| `src/app/wizard/review/page.tsx` | Checkout flow | |
| `src/app/dashboard/cases/[id]/page.tsx` | "Continue Wizard" button | Can lead back to checkout |
| `src/components/value-proposition/WhatYouGet.tsx` | CTA buttons | Marketing pages |
| `src/app/wizard/flow/page.tsx` | Wizard completion | |

---

## 5. Critical Bugs Found

### BUG-1: Double Payment Vulnerability (CRITICAL)

**Location:** `src/app/api/checkout/create/route.ts:270-284`

**Issue:** Checkout creates a new order every time without checking if a paid order already exists for the same (case_id, product_type).

```typescript
// Current code - NO CHECK FOR EXISTING PAID ORDER
const { data: order, error: orderError } = await adminSupabase
  .from('orders')
  .insert({
    user_id: user.id,
    case_id: case_id || null,
    product_type,
    // ... creates new order every time
  })
```

**Impact:** User can pay multiple times for the same product on the same case.

**Fix:** Add idempotency check before creating order:
```typescript
// Check for existing paid order
const { data: existingOrder } = await adminSupabase
  .from('orders')
  .select('id, payment_status')
  .eq('case_id', case_id)
  .eq('product_type', product_type)
  .eq('payment_status', 'paid')
  .maybeSingle();

if (existingOrder) {
  return NextResponse.json(
    { error: 'ALREADY_PURCHASED', message: 'You have already purchased this product for this case.' },
    { status: 409 }
  );
}
```

### BUG-2: Document Count Mismatch (MEDIUM)

**Issue:** Pack-contents.ts defines expected documents, but generators produce different sets.

**Impact:** Preview shows X documents, user receives Y documents.

**Examples:**
- Money Claim: Pack-contents lists 8 docs, generator produces 10 docs (includes Reply Form, Financial Statement)
- Complete Pack: Pack-contents lists Court Filing Guide, but it's not generated

**Fix:** Align pack-contents.ts with actual generator output, or make generators consume pack-contents definitions.

### BUG-3: Fulfillment Idempotency Gap (LOW)

**Location:** `src/lib/payments/fulfillment.ts:18-35`

**Issue:** Idempotency check only looks for ANY final documents, not for the specific product type's expected documents.

```typescript
// Current - checks for any documents
const { data: existingDocs } = await supabase
  .from('documents')
  .select('id')
  .eq('case_id', caseId)
  .eq('is_preview', false)
  .limit(1);

if (existingDocs && existingDocs.length > 0) {
  // Returns early - but what if only partial documents exist?
}
```

**Impact:** If fulfillment partially completed, retry won't generate missing documents.

### BUG-4: Case Status Inconsistency (MEDIUM)

**Issue:** Case status (`draft`, `in_progress`, `completed`) is managed separately from order/payment status.

**Impact:** Case can show `in_progress` even when order is `paid` and `fulfilled`.

**Location:** No code updates case status after payment/fulfillment.

### BUG-5: Ask Heaven Default Values (LOW)

**Location:** `src/app/dashboard/cases/[id]/page.tsx:1209`

```tsx
<p className="text-sm text-gray-600">
  Interest: {analysis?.case_summary?.interest_rate ?? 8}%
</p>
```

**Issue:** Shows 8% interest as default even if user never specified interest rate.

**Also in:** `src/lib/documents/money-claim-pack-generator.ts:196`
```typescript
const interest_rate = claim.interest_rate ?? 8;
```

---

## 6. UI Issues Identified

### Issue 1: "Collected Information" Section
**Location:** `src/app/dashboard/cases/[id]/page.tsx:1150-1174`

Shows raw wizard facts as key-value pairs. Confusing for users who don't understand internal field names.

**Recommendation:** Remove or replace with structured summary.

### Issue 2: "Edit Case Details" Button
**Location:** `src/app/dashboard/cases/[id]/page.tsx:824-831`

Allows editing even after payment (within 30-day window). While gated by edit window, the prominence is confusing.

**Recommendation:** Make less prominent, or hide for fulfilled orders.

### Issue 3: "View Preview" Button
**Location:** `src/app/dashboard/cases/[id]/page.tsx:848-852`

Links to preview page even after purchase - confusing since user already has final documents.

**Recommendation:** Remove for fulfilled orders, or relabel.

### Issue 4: Prominent "Regenerate Documents" Button
**Location:** `src/app/dashboard/cases/[id]/page.tsx:842-847`

Always visible and prominent. Could cause confusion or accidental clicks.

**Recommendation:** Make secondary/less prominent, or only show if edits were made.

---

## 7. Proposed Solution: Single Source of Truth

### A) `getExpectedDocuments(caseId, productType)` Function

Create unified function that returns what documents SHOULD exist:

```typescript
// src/lib/products/expected-documents.ts

export interface ExpectedDocument {
  key: string;
  title: string;
  description: string;
  category: string;
  required: boolean;
  condition?: (facts: CaseFacts) => boolean;
}

export async function getExpectedDocuments(
  caseId: string,
  productType: string
): Promise<ExpectedDocument[]> {
  // 1. Get case facts from DB
  const { data: caseData } = await supabase
    .from('cases')
    .select('collected_facts, jurisdiction')
    .eq('id', caseId)
    .single();

  // 2. Call pack-contents with case facts
  const packContents = getPackContents({
    product: productType,
    jurisdiction: caseData.jurisdiction,
    route: caseData.collected_facts.route,
    has_arrears: caseData.collected_facts.has_arrears,
    // ... other conditional params
  });

  return packContents;
}
```

### B) `getEntitlementState(caseId, userId)` Function

Create unified entitlement checker:

```typescript
// src/lib/payments/entitlement-state.ts

export interface EntitlementState {
  // Payment
  hasPaidOrder: boolean;
  paidProducts: string[];
  latestOrderId: string | null;
  paymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded';

  // Fulfillment
  fulfillmentStatus: 'pending' | 'ready' | 'processing' | 'fulfilled' | 'failed';

  // Documents
  expectedDocumentCount: number;
  actualDocumentCount: number;
  isFulfillmentComplete: boolean;
  missingDocuments: string[];

  // Edit Window
  editWindowOpen: boolean;
  editWindowEndsAt: string | null;
}

export async function getEntitlementState(
  caseId: string,
  userId: string
): Promise<EntitlementState> {
  // Query orders, documents, compare with expected
  // Return unified state object
}
```

---

## 8. Refactor Plan (Prioritized PRs)

### PR 1: Idempotent Checkout (CRITICAL - Day 1)
**Files:**
- `src/app/api/checkout/create/route.ts`

**Changes:**
1. Add check for existing paid order before creating new order
2. Return 409 Conflict if already purchased
3. Add UI handling in preview page for already-purchased state

**Risk:** Low - additive check
**Testing:** Unit test for duplicate payment prevention

---

### PR 2: Align Pack Contents with Generators (Day 2-3)
**Files:**
- `src/lib/products/pack-contents.ts`
- `src/lib/documents/eviction-pack-contents.ts` (deprecate)

**Changes:**
1. Update pack-contents.ts to match actual generator output
2. Add missing documents: Reply Form, Financial Statement, Compliance Declaration
3. Remove or mark as deprecated: eviction-pack-contents.ts
4. Update all imports to use pack-contents.ts

**Risk:** Medium - affects preview UI
**Testing:** Visual comparison of preview vs generated

---

### PR 3: Fulfillment Completeness Check (Day 3-4)
**Files:**
- `src/lib/payments/fulfillment.ts`
- `src/lib/products/expected-documents.ts` (new)

**Changes:**
1. Create getExpectedDocuments() function
2. Modify fulfillment to compare actual vs expected
3. Regenerate only missing documents on retry
4. Update order metadata with document manifest

**Risk:** Medium - affects regeneration logic
**Testing:** Simulate partial fulfillment, verify retry completes

---

### PR 4: Unified Entitlement State (Day 4-5)
**Files:**
- `src/lib/payments/entitlement-state.ts` (new)
- `src/app/api/orders/status/route.ts`
- `src/app/dashboard/cases/[id]/page.tsx`

**Changes:**
1. Create getEntitlementState() function
2. Update order status API to use it
3. Update case page to consume unified state
4. Add document completeness indicator

**Risk:** Low - mostly refactoring
**Testing:** Verify all status combinations display correctly

---

### PR 5: UI Simplification (Day 5-6)
**Files:**
- `src/app/dashboard/cases/[id]/page.tsx`

**Changes:**
1. Remove "Collected Information" accordion for paid orders
2. Rename "Edit Case Details" → "Update Details" and make less prominent
3. Hide "View Preview" for fulfilled orders
4. Move "Regenerate" to overflow menu or make secondary button
5. Fix Ask Heaven to only show explicitly-provided values

**Risk:** Low - UI only
**Testing:** Manual visual review

---

### PR 6: Case Status Sync (Day 6-7)
**Files:**
- `src/lib/payments/fulfillment.ts`
- `src/app/api/webhooks/stripe/route.ts`

**Changes:**
1. Update case.status to 'completed' when fulfillment succeeds
2. Add status sync in webhook handler
3. Ensure case status never contradicts order status

**Risk:** Medium - affects data model
**Testing:** End-to-end payment flow

---

## 9. Testing Checklist

- [ ] Double-payment blocked with 409 response
- [ ] Preview document count matches generated document count
- [ ] All expected documents are generated for each product
- [ ] Partial fulfillment retry generates missing docs
- [ ] Case status updates to 'completed' after fulfillment
- [ ] Edit window correctly gates editing
- [ ] Regeneration respects edit window
- [ ] Ask Heaven shows only explicitly-provided values
- [ ] UI hides confusing elements for paid orders

---

## 10. Appendix: File Reference Table

| File | Purpose | Key Functions |
|------|---------|---------------|
| `src/lib/products/pack-contents.ts` | Expected documents definition | `getPackContents()` |
| `src/lib/products/next-steps.ts` | Post-purchase guidance | `getNextSteps()` |
| `src/lib/payments/fulfillment.ts` | Document generation orchestration | `fulfillOrder()` |
| `src/lib/payments/entitlement.ts` | Payment status checks | `assertPaidEntitlement()`, `checkPaidEntitlement()` |
| `src/app/api/checkout/create/route.ts` | Stripe checkout creation | POST handler |
| `src/app/api/webhooks/stripe/route.ts` | Payment webhook | POST handler |
| `src/app/api/orders/status/route.ts` | Order status query | GET handler |
| `src/app/api/orders/regenerate/route.ts` | Document regeneration | POST handler |
| `src/app/api/orders/fulfill/route.ts` | Manual fulfillment retry | POST handler |
| `src/app/dashboard/cases/[id]/page.tsx` | Case detail page | React component |
| `src/components/preview/PreviewPageLayout.tsx` | Preview/checkout UI | React component |
| `src/lib/documents/eviction-pack-generator.ts` | Eviction document generation | `generateNoticeOnlyPack()`, `generateCompleteEvictionPack()` |
| `src/lib/documents/ast-generator.ts` | AST document generation | `generateStandardASTDocuments()`, `generatePremiumASTDocuments()` |
| `src/lib/documents/money-claim-pack-generator.ts` | Money claim generation | `generateMoneyClaimPack()` |
| `src/lib/documents/scotland-money-claim-pack-generator.ts` | Scotland money claim | `generateScotlandMoneyClaim()` |
