# N5B Wizard Completeness Audit

**Date:** 2026-01-21
**Scope:** England → Complete Pack → Section 21 → N5B (Accelerated Possession)
**Auditor:** Claude Code (Product + Legal-Safety Engineer)

---

## Executive Summary

| Area | Status | Risk Level |
|------|--------|------------|
| Required Fields | **GAPS FOUND** | **MEDIUM** |
| Statement of Truth Fields | GAPS FOUND | **HIGH** |
| Attachment Checkboxes | VERIFIED | NONE |
| Compliance Questions | PARTIAL GAP | MEDIUM |

**Overall Assessment:** The wizard does NOT collect all information required for a legally complete N5B form. Several N5B questions will have incorrect or missing answers, which could invalidate the claim.

---

## Critical Findings

### 🔴 HIGH PRIORITY - Missing Questions

| N5B Question | Field Required | Wizard Asks? | Current Default | Risk |
|--------------|----------------|--------------|-----------------|------|
| Q8: Subsequent tenancy | `subsequent_tenancy` | **NO** | `false` | Form may be FALSE |
| Q13: Deposit returned | `deposit_returned` | **NO** | `false` | Form may be FALSE |
| Q14a: Prescribed info given | `deposit_prescribed_info_given` | **NO** (mapping broken) | `undefined` (left blank) | Form INCOMPLETE |
| Q7: Tenancy agreement date | `tenancy_agreement_date` | **NO** | Fallback to `tenancy_start_date` | May be INACCURATE |

### Legal Risk Analysis

#### Q8: Subsequent Tenancy Agreement

**N5B Question:** "Has any subsequent written tenancy agreement been entered into?"

**Issue:** The wizard never asks this question. The mapper defaults to `false`.

**Legal Risk:** If a landlord has signed a renewal or new tenancy agreement with the same tenant, the answer should be "Yes". Claiming "No" when it's actually "Yes" is a **false statement on a court document**.

**Impact:**
- Could invalidate the claim if discovered
- Statement of Truth is signed declaring facts are true
- Court may strike out the claim

---

#### Q13: Deposit Returned

**N5B Question:** "Has the deposit been returned to the Defendant?"

**Issue:** The wizard never asks this question. The mapper defaults to `false`.

**Legal Risk:** If the deposit HAS been returned (e.g., at end of fixed term, before periodic tenancy), the answer should be "Yes". Claiming "No" when it's actually "Yes" is a **false statement**.

**Impact:**
- This affects Q14a logic (prescribed info only applies if deposit NOT returned)
- Could lead to improper strike-out arguments from defendant

---

#### Q14a: Prescribed Information Given

**N5B Question:** "Has the Claimant given to the Defendant... the prescribed information?"

**Issue:** The wizard DOES ask `prescribed_info_served` in Section21ComplianceSection, but this is:
1. Used as a **blocker** (can't proceed if "No")
2. **NOT mapped** to `deposit_prescribed_info_given` for N5B population

**Current Behavior:**
- `prescribed_info_served: true` → Section 21 proceeds
- `deposit_prescribed_info_given: undefined` → Q14a left blank on N5B

**Legal Risk:** Q14a will be **blank or unchecked** even when the landlord has confirmed prescribed info was served. This is incomplete and may delay or invalidate the claim.

---

#### Q7: Tenancy Agreement Date

**N5B Question:** "The tenancy agreement is dated..."

**Issue:** The wizard asks `tenancy_start_date` (Q6) but NOT `tenancy_agreement_date` (Q7). The mapper uses tenancy_start_date as fallback.

**Legal Risk:** If the tenancy agreement was signed BEFORE the tenancy started (common practice), the dates differ. Using the wrong date could:
- Make the form technically inaccurate
- Be challenged by a pedantic defendant

**Example:**
- Agreement signed: 15 December 2023
- Tenancy started: 1 January 2024
- Q6 should be: 1 January 2024 ✅
- Q7 should be: 15 December 2023 (but wizard shows 1 January 2024) ❌

---

## Complete N5B Field Mapping

### Fields with Complete Mapping ✅

| N5B Question/Field | Wizard Question | Section |
|-------------------|-----------------|---------|
| Claimant names | `landlord_full_name`, `landlord2_name` | PartiesSection |
| Defendant names | `tenant_full_name`, `tenant2_name` | PartiesSection |
| Court name | `court_name` | CourtSigningSection |
| Property address | `property_address_*` | PropertySection |
| Q5: Dwelling house | Auto "Yes" | N/A |
| Q6: Tenancy let date | `tenancy_start_date` | TenancySection |
| Q10a: Notice service method | `notice_service_method` | NoticeSection |
| Q10b: Notice served date | `notice_served_date` | NoticeSection |
| Q10c: Who served notice | Auto (landlord name) | N/A |
| Q10d: Notice served on | Auto (tenant name) | N/A |
| Q10e: Notice expiry date | `notice_expiry_date` | NoticeSection |
| Q12: Deposit paid | `deposit_amount > 0` | Section21ComplianceSection |
| Q14b: Prescribed info date | `deposit_protection_date` | Section21ComplianceSection |
| Q21: Order possession | Auto "Yes" | N/A |
| Statement of Truth | `signatory_name`, `signature_date` | CourtSigningSection |
| Attachments E, F, G | Upload-based flags | EvidenceSection |

### Fields with Gaps ❌

| N5B Question/Field | Wizard Question | Issue |
|-------------------|-----------------|-------|
| Q7: Agreement date | `tenancy_agreement_date` | **Not asked** - uses `tenancy_start_date` fallback |
| Q8: Subsequent tenancy | `subsequent_tenancy` | **Not asked** - defaults to `false` |
| Q13: Deposit returned | `deposit_returned` | **Not asked** - defaults to `false` |
| Q14a: Prescribed info | `deposit_prescribed_info_given` | **Mapping broken** - `prescribed_info_served` not mapped |

---

## Recommendations

### Immediate Fixes (P0 - Legal Safety)

#### 1. Add `deposit_prescribed_info_given` Mapping

**File:** `src/lib/documents/eviction-wizard-mapper.ts`

**Change:** Add mapping from `prescribed_info_served` to `deposit_prescribed_info_given`:

```typescript
// In caseData object:
deposit_prescribed_info_given:
  wizardFacts.prescribed_info_served ??
  facts.tenancy.prescribed_info_given ??
  undefined,
```

**Rationale:** The wizard already asks this question. We just need to map it correctly.

---

#### 2. Add Q8: Subsequent Tenancy Question

**File:** `src/components/wizard/sections/eviction/TenancySection.tsx`

**Add Question:**
```
"Has any subsequent written tenancy agreement been entered into since the original agreement?"

- Yes → Need details
- No → Continue
```

**Wizard Location:** TenancySection (after tenancy_type)

**Rationale:** Required N5B question. Defaulting to "No" is legally dangerous.

---

#### 3. Add Q13: Deposit Returned Question

**File:** `src/components/wizard/sections/eviction/Section21ComplianceSection.tsx`

**Add Question (conditional on deposit_taken=true):**
```
"Has the deposit been returned to the tenant?"

- Yes → Q14 not applicable, checkboxes may differ
- No → Continue to Q14
```

**Wizard Location:** Section21ComplianceSection (after deposit_protection questions)

**Rationale:** Required N5B question. Affects Q14a/Q14b applicability.

---

#### 4. Add Q7: Tenancy Agreement Date Question

**File:** `src/components/wizard/sections/eviction/TenancySection.tsx`

**Add Question:**
```
"What date is on your tenancy agreement?"

Helper text: "This may be different from when the tenancy actually started.
If the agreement was signed before the tenancy began, enter the signature date.
If unsure, use the tenancy start date."
```

**Default:** Pre-fill with `tenancy_start_date`, allow override.

**Rationale:** N5B Q6 and Q7 can have different dates. Accuracy matters.

---

### Future Improvements (P1)

1. **Add inline validation** for date logic:
   - `tenancy_agreement_date` should be <= `tenancy_start_date` (typically)
   - Show warning if dates are >1 year apart (likely error)

2. **Conditional Q14 section:**
   - If `deposit_returned = true`, Q14a/Q14b may not be applicable
   - Show helper explaining this

3. **Review page summary:**
   - Show N5B-specific answers in review
   - Highlight any auto-defaulted values

---

## Verification Matrix

### Current State vs. N5B Requirements (UPDATED)

| N5B Section | Questions | Wizard Coverage | Legal Safety |
|-------------|-----------|-----------------|--------------|
| Header | Parties, Court | ✅ Complete | ✅ Safe |
| Q3 Costs | Solicitor costs | ✅ Auto-derived | ✅ Safe |
| Q5 Dwelling | Is dwelling | ✅ Auto "Yes" | ✅ Safe |
| Q6 Let date | Tenancy start | ✅ Asked | ✅ Safe |
| Q7 Agreement date | Agreement date | ✅ **Now asked** | ✅ Safe |
| Q8 Subsequent | Subsequent tenancy | ✅ **Now asked** | ✅ Safe |
| Q10 Notice | Service details | ✅ Complete | ✅ Safe |
| Q12 Deposit | Deposit paid | ✅ Derived | ✅ Safe |
| Q13 Returned | Deposit returned | ✅ **Now asked** | ✅ Safe |
| Q14 Prescribed | Prescribed info | ✅ **Now mapped** | ✅ Safe |
| Q21 Orders | Possession/costs | ✅ Auto | ✅ Safe |
| Statement of Truth | Signature | ✅ Complete | ✅ Safe |
| Attachments A, B, B1 | Docs | ✅ Trust-based | ✅ Safe |
| Attachments E, F, G | Compliance docs | ✅ Upload-based | ✅ Safe |

---

## Conclusion

**UPDATE 2026-01-21: All P0 fixes have been implemented.**

### Fixes Applied

1. ✅ **deposit_prescribed_info_given mapping** - Added to eviction-wizard-mapper.ts
   - Now maps `prescribed_info_served` → `deposit_prescribed_info_given`

2. ✅ **Q8: Subsequent tenancy question** - Added to TenancySection.tsx
   - Shows for England Section 21 only
   - Asks: "Has any subsequent written tenancy agreement been entered into?"

3. ✅ **Q13: Deposit returned question** - Added to Section21ComplianceSection.tsx
   - Shows when deposit_taken is true
   - Asks: "Has the deposit been returned to the tenant?"

4. ✅ **Q7: Tenancy agreement date question** - Added to TenancySection.tsx
   - Shows for England Section 21 only
   - Pre-fills with tenancy_start_date, allows override

### Files Modified

- `src/lib/documents/eviction-wizard-mapper.ts` - Added `deposit_prescribed_info_given` mapping
- `src/components/wizard/sections/eviction/TenancySection.tsx` - Added N5B Q7 and Q8 questions
- `src/components/wizard/sections/eviction/Section21ComplianceSection.tsx` - Added N5B Q13 question

**The wizard is now COMPLETE for N5B generation.**

---

*Generated by Claude Code N5B Completeness Audit*
*Updated 2026-01-21 with fix implementation status*
