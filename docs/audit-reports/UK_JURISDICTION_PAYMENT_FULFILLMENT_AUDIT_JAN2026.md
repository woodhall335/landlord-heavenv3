# UK Jurisdiction, Payment & Fulfillment Audit Report
## Date: January 2026

---

## Executive Summary

This audit examined the post-payment, entitlement, and fulfillment flow across all wizard products with strict jurisdiction correctness for England, Wales, and Scotland.

### Key Findings

| Category | Status | Critical Issues |
|----------|--------|-----------------|
| Single Source of Truth | **PARTIAL** | Dual pack contents definitions exist |
| Payment Idempotency | **PASS** | Correctly prevents double payment |
| Jurisdiction Correctness | **FAIL** | Legacy file contains Wales bugs |
| Fulfillment Validation | **FAIL** | Only checks for ANY document, not ALL |
| Preview/Download Match | **PASS** | UI uses canonical pack-contents.ts |
| Interest Rate Defaults | **WARNING** | Defaults to 8% without explicit user choice |

---

## 1. PACK CONTENTS & SINGLE SOURCE OF TRUTH

### Status: **PARTIAL COMPLIANCE**

### A. Primary Source (CANONICAL)
**File:** `src/lib/products/pack-contents.ts`

This is the intended single source of truth. The dashboard (`src/app/dashboard/cases/[id]/page.tsx`) correctly uses `getPackContents()` from this file.

**Jurisdiction Handling:**
- ✅ England: Section 8, Section 21, N5, N5B, N119
- ⚠️ Wales: Has `section_8` route handler (see Bug #2)
- ✅ Scotland: Notice to Leave, Form E Tribunal
- ✅ Northern Ireland: Tenancy agreements only (eviction not supported)

### B. Legacy Source (SHOULD BE REMOVED)
**File:** `src/lib/documents/eviction-pack-contents.ts`

This file exists in parallel and contains **critical jurisdiction bugs**.

**BUGS FOUND:**

#### BUG #1: Section 8 Incorrectly Includes Wales (Lines 47-51)
```typescript
const SECTION_8_NOTICE: PackDocument = {
  // ...
  conditions: {
    routes: ['section_8'],
    jurisdictions: ['england', 'wales'], // ❌ WRONG - Section 8 NOT valid in Wales
  },
};
```
**Legal Reality:** Section 8 (Housing Act 1988) does NOT apply to Wales for standard occupation contracts created after 1 December 2022. Wales uses the Renting Homes (Wales) Act 2016.

#### BUG #2: Section 21 Incorrectly Includes Wales (Lines 59-64)
```typescript
const SECTION_21_NOTICE: PackDocument = {
  // ...
  conditions: {
    routes: ['section_21', 'accelerated_possession', 'accelerated_section21'],
    jurisdictions: ['england', 'wales'], // ❌ WRONG - Section 21 NOT valid in Wales
  },
};
```
**Legal Reality:** Section 21 (no-fault eviction) does NOT apply to Wales. Wales uses Section 173 notices under the Renting Homes (Wales) Act 2016.

### C. Generator Logic (CORRECT)
**File:** `src/lib/documents/eviction-pack-generator.ts`

The actual generator **correctly** blocks Section 21 for Wales:
```typescript
// Lines 600-608
if (evictionCase.case_type === 'no_fault') {
  if (jurisdiction !== 'england') {
    throw new Error(
      `Section 21 (no-fault eviction) is not available in ${jurisdiction}. ` +
      `Wales uses Section 173 notices under the Renting Homes (Wales) Act 2016.`
    );
  }
}
```

### Recommendation

**CRITICAL ACTION REQUIRED:**
1. Delete `src/lib/documents/eviction-pack-contents.ts` OR refactor to import from `pack-contents.ts`
2. Update any components still importing from the legacy file
3. Remove or clarify the `route === 'section_8'` handling in Wales (pack-contents.ts lines 326-335)

---

## 2. DOCUMENT MATRIX BY (Product × Jurisdiction × Route)

### notice_only

| Jurisdiction | Route | Documents |
|--------------|-------|-----------|
| **England** | section_21 | section21_notice, service_instructions, service_checklist |
| **England** | section_8 | section8_notice, service_instructions, service_checklist, arrears_schedule* |
| **Wales** | section_173 | section173_notice, service_instructions (Wales), service_checklist (Wales) |
| **Wales** | fault_based | fault_notice (RHW23), service_instructions (Wales), service_checklist (Wales), arrears_schedule* |
| **Scotland** | notice_to_leave | notice_to_leave, service_instructions (Scotland), service_checklist (Scotland), arrears_schedule* |
| **N. Ireland** | - | NOT SUPPORTED |

*arrears_schedule included if `has_arrears=true` or `include_arrears_schedule=true`

### complete_pack

| Jurisdiction | Route | Notice | Court Forms | Evidence/Guidance |
|--------------|-------|--------|-------------|-------------------|
| **England** | section_21 | section21_notice | N5B (accelerated), N5, N119 | witness_statement, court_filing_guide, evidence_checklist, proof_of_service |
| **England** | section_8 | section8_notice | N5, N119 | witness_statement, court_filing_guide, evidence_checklist, proof_of_service, arrears_schedule* |
| **Wales** | section_173 | section173_notice | N5, N119 | witness_statement, court_filing_guide (Wales), evidence_checklist, proof_of_service |
| **Wales** | fault_based | fault_notice | N5, N119 | witness_statement, court_filing_guide (Wales), evidence_checklist, proof_of_service |
| **Scotland** | notice_to_leave | notice_to_leave | Form E (Tribunal) | witness_statement, tribunal_lodging_guide, evidence_checklist, proof_of_service |
| **N. Ireland** | - | NOT SUPPORTED | - | - |

### money_claim (England & Wales ONLY)

| Document | Description |
|----------|-------------|
| n1_claim | Form N1 - Money Claim Form (official PDF) |
| particulars_of_claim | Detailed claim narrative |
| arrears_schedule | Period-by-period breakdown |
| interest_calculation | Statutory interest workings |
| letter_before_claim | PAP-DEBT Letter Before Claim |
| defendant_info_sheet | Information Sheet for Defendants |
| reply_form | Reply Form for defendant |
| financial_statement | Financial Statement Form |
| filing_guide | MCOL / County Court filing guide |
| enforcement_guide | Post-judgment enforcement options |

### sc_money_claim (Scotland ONLY)

| Document | Description |
|----------|-------------|
| form_3a | Simple Procedure Claim Form (official PDF) |
| statement_of_claim | Detailed particulars |
| arrears_schedule | Period-by-period breakdown (if provided) |
| interest_calculation | Statutory interest (if applicable) |
| pre_action_letter | Pre-Action Letter (Rule 3.1 compliant) |
| filing_guide | Sheriff Court lodging instructions |
| enforcement_guide | Diligence options |

### ast_standard / ast_premium

| Jurisdiction | Standard Documents | Premium Extra |
|--------------|--------------------|---------------|
| **England** | ast_agreement, terms_schedule, model_clauses, inventory_template | key_schedule, maintenance_guide, checkout_procedure |
| **Wales** | soc_agreement, terms_schedule, model_clauses, inventory_template | key_schedule, maintenance_guide, checkout_procedure |
| **Scotland** | prt_agreement, terms_schedule, model_clauses (Scotland), inventory_template | key_schedule, maintenance_guide, checkout_procedure |
| **N. Ireland** | private_tenancy_agreement, terms_schedule, model_clauses (NI), inventory_template | key_schedule, maintenance_guide, checkout_procedure |

---

## 3. PAYMENT IDEMPOTENCY

### Status: **PASS**

**File:** `src/app/api/checkout/create/route.ts`

#### Verification Points:

1. **Database Constraint** (Migration 891b9a8):
   - Unique constraint on `(case_id, product_type)` for paid orders

2. **Application-Level Check** (Lines 357-376):
   ```typescript
   const paidOrder = existingOrders.find(o => o.payment_status === 'paid');
   if (paidOrder) {
     return { status: 'already_paid', ... };
   }
   ```

3. **Pending Session Reuse** (Lines 379-432):
   - Checks if existing Stripe session is still valid
   - Reuses valid sessions instead of creating duplicates
   - Marks expired sessions as failed

4. **Stripe Idempotency Keys** (Lines 440-442, 493-517):
   ```typescript
   const idempotencyKey = case_id
     ? generateIdempotencyKey(case_id, product_type, user.id)
     : undefined;
   ```

---

## 4. FULFILLMENT COMPLETION LOGIC

### Status: **FAIL - BUG FOUND**

**File:** `src/lib/payments/fulfillment.ts`

#### BUG #3: Fulfillment Marks Complete Without Validating All Documents

**Current Code (Lines 18-35):**
```typescript
const { data: existingDocs } = await supabase
  .from('documents')
  .select('id')
  .eq('case_id', caseId)
  .eq('is_preview', false)
  .limit(1);  // ❌ Only checks for 1 document

if (existingDocs && existingDocs.length > 0) {
  await supabase
    .from('orders')
    .update({
      fulfillment_status: 'fulfilled',  // ❌ Marks complete without validating ALL docs
      fulfilled_at: new Date().toISOString(),
    })
    .eq('id', orderId);
  return { status: 'already_fulfilled', documents: existingDocs.length };
}
```

**Audit Requirement Violation:**
> "Fulfillment must NEVER mark an order complete unless ALL expected documents exist."

**Recommendation:**
```typescript
// Get expected document count from pack-contents
import { getPackContents } from '@/lib/products';

const expectedDocs = getPackContents({
  product: productType,
  jurisdiction: caseData.jurisdiction,
  route: caseData.collected_facts?.route,
  has_arrears: caseData.collected_facts?.has_arrears,
});

const { count: actualCount } = await supabase
  .from('documents')
  .select('id', { count: 'exact' })
  .eq('case_id', caseId)
  .eq('is_preview', false);

if (actualCount < expectedDocs.length) {
  // DO NOT mark as fulfilled - documents missing
  throw new Error(`Incomplete fulfillment: ${actualCount}/${expectedDocs.length} documents`);
}
```

---

## 5. INTEREST RATE DEFAULTS

### Status: **WARNING**

**Files:**
- `src/lib/documents/money-claim-pack-generator.ts` (Line 196)
- `src/lib/documents/scotland-money-claim-pack-generator.ts` (Line 195)

**Current Code:**
```typescript
const interest_rate = claim.interest_rate ?? 8;
```

**Audit Requirement:**
> "No inferred or default legal values (e.g. interest rates) unless explicitly chosen by the user."

**Analysis:**
- 8% is the correct statutory interest rate for commercial debts in the UK (Late Payment of Commercial Debts Act 1998)
- However, the user should **explicitly confirm** this rate in the wizard

**Recommendation:**
- Add explicit confirmation step in money claim wizard: "Statutory interest rate of 8% will be applied. [Confirm] / [Use custom rate]"
- Log when default is applied: `console.log('Applied default statutory interest rate: 8%');`

---

## 6. UI JURISDICTION DISPLAY

### Status: **PASS**

**File:** `src/app/dashboard/cases/[id]/page.tsx`

The dashboard correctly:
1. Imports from canonical source: `import { getPackContents, getNextSteps } from '@/lib/products';` (Line 20)
2. Builds pack contents with jurisdiction: Lines 517-527
3. Displays "What's Included" section: Lines 953-968

---

## 7. PREVIEW VS POST-PAYMENT MATCH

### Status: **PASS (with caveat)**

The UI uses `getPackContents()` for both preview "What's Included" and post-payment display.

**Caveat:** The actual document generation happens in separate generator files. While the pack-contents.ts **should** match, there's no automated verification that generators produce exactly what pack-contents.ts promises.

**Recommendation:** Add integration test that:
1. Calls `getPackContents()` for a product/jurisdiction/route
2. Calls the corresponding generator
3. Asserts generated document keys match pack-contents keys

---

## 8. JURISDICTION CORRECTNESS SUMMARY

### England ✅
- Section 8: Grounds-based possession
- Section 21: No-fault possession (Form 6A)
- Court: County Court
- Forms: N5, N119, N5B (accelerated)

### Wales ⚠️ (Partial)
- **CORRECT:** Section 173 (no-fault, 6 months)
- **CORRECT:** Fault-based (RHW forms)
- **BUG:** Legacy file references Section 8/21
- Court: County Court (correct)
- Forms: N5, N119 (correct for court claims)

### Scotland ✅
- Notice to Leave: PRT eviction notice
- Tribunal: First-tier Tribunal for Scotland
- Form: Form E (tribunal application)
- Money Claims: Simple Procedure (Form 3A), Sheriff Court

---

## 9. ACTION ITEMS

### CRITICAL (Must Fix)

| # | Issue | File | Action |
|---|-------|------|--------|
| 1 | Dual source of truth | `eviction-pack-contents.ts` | Delete or deprecate |
| 2 | Section 8/21 jurisdiction | `eviction-pack-contents.ts` L47-64 | Remove Wales from conditions |
| 3 | Fulfillment validation | `fulfillment.ts` L18-35 | Validate ALL expected documents exist |

### HIGH (Should Fix)

| # | Issue | File | Action |
|---|-------|------|--------|
| 4 | Wales Section 8 route | `pack-contents.ts` L326-335 | Clarify or remove confusing code |
| 5 | Interest rate default | money-claim generators | Add explicit user confirmation |

### MEDIUM (Recommended)

| # | Issue | File | Action |
|---|-------|------|--------|
| 6 | Preview/download parity | - | Add integration test |
| 7 | AST jurisdiction defaults | `ast-generator.ts` L432-434 | Handle Scotland/NI explicitly |

---

## 10. FILES AUDITED

| File | Purpose | Issues Found |
|------|---------|--------------|
| `src/lib/products/pack-contents.ts` | Expected documents definition | Minor (Wales section_8 route) |
| `src/lib/documents/eviction-pack-contents.ts` | Legacy UI pack config | **CRITICAL** (Wales jurisdiction) |
| `src/lib/payments/fulfillment.ts` | Document generation orchestration | **CRITICAL** (incomplete validation) |
| `src/app/api/checkout/create/route.ts` | Checkout + idempotency | None |
| `src/lib/documents/eviction-pack-generator.ts` | Eviction document generation | None (correct) |
| `src/lib/documents/money-claim-pack-generator.ts` | Money claim generation | Minor (interest default) |
| `src/lib/documents/scotland-money-claim-pack-generator.ts` | Scotland money claim | Minor (interest default) |
| `src/lib/documents/ast-generator.ts` | Tenancy agreement generation | Minor (jurisdiction default) |
| `src/app/dashboard/cases/[id]/page.tsx` | Case dashboard UI | None |

---

## Audit Conducted By
Claude Code (claude-opus-4-5-20251101)

## Audit Date
2026-01-12
