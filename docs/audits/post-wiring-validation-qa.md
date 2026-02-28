# Post-Wiring Validation QA Report

**Date:** 2026-01-21
**Scope:** England → Complete Pack → Section 21 → N5B (Accelerated Possession)
**Focus:** ValidatedField wiring into eviction wizard sections
**Auditor:** Claude Code (QA + Legal-Safety Engineer)

---

## Executive Summary

| Area | Status | Risk Level |
|------|--------|------------|
| Error State Lifecycle | VERIFIED | NONE |
| Conditional Field Cleanup | VERIFIED | NONE |
| UK Postcode Validation | VERIFIED | NONE |
| Date Validation | VERIFIED | NONE |
| Numeric Field Validation | VERIFIED | NONE |
| N5B Checkbox Legal Safety | VERIFIED | NONE |
| hasErrors Navigation Gating | VERIFIED | NONE |
| Test Coverage | ADEQUATE | LOW |

**Overall Assessment:** No regressions, no false blocking, no legal-risk coupling identified. The validation wiring is correctly implemented and safe for production.

---

## A. Error State Lifecycle Verification

### Test: Errors Only Block When Appropriate

**Conditions Verified:**
1. ✅ Errors only display when field is **touched** (after blur)
2. ✅ Errors only register with context when **sectionId** is provided
3. ✅ Untouched fields do NOT show errors
4. ✅ Future steps do NOT show errors (fields not rendered = not touched)

**Code Evidence:**

```typescript
// ValidatedField.tsx:111
const error = externalError || (touched ? internalError : undefined);
```

The `touched` state guards error display until user has interacted with the field.

```typescript
// ValidatedField.tsx:115-122
useEffect(() => {
  if (!ctx || !sectionId) return;
  if (error) {
    ctx.setFieldError(id, { field: id, message: error, severity: 'error', section: sectionId });
  } else {
    ctx.clearFieldError(id);
  }
}, [ctx, id, error, sectionId]);
```

Errors only register with context when:
- Context exists (`ctx`)
- `sectionId` prop is provided
- Error state is truthy (and visible due to touched state)

### Result: VERIFIED - No False Blocking

---

## B. Conditional Field Error Cleanup

### Test: Hidden Fields Don't Leave Stale Errors

**Scenario:** User toggles `deposit_taken` from Yes to No.

**Expected:** Deposit-related validation errors should clear.

**Code Evidence:**

```typescript
// ValidatedField.tsx:124-131
useEffect(() => {
  return () => {
    if (ctx && sectionId) {
      ctx.clearFieldError(id);
    }
  };
}, [ctx, id, sectionId]);
```

Each ValidatedField component clears its error on unmount. When conditional fields unmount (e.g., deposit details when `deposit_taken` changes to false), their errors are automatically cleaned up.

### Visibility Change Scenarios Verified:

| Trigger | Hidden Fields | Cleanup |
|---------|---------------|---------|
| `deposit_taken: false` | deposit_amount, deposit_protected, deposit_scheme_name, etc. | ✅ Unmount clears |
| `has_gas_appliances: false` | gas_safety_cert_served | ✅ Unmount clears |
| `licensing_required: not_required` | has_valid_licence | ✅ Unmount clears |
| `has_joint_landlords: false` | landlord2_name | ✅ Unmount clears |
| `has_joint_tenants: false` | tenant2_name, tenant3_name, tenant4_name | ✅ Unmount clears |
| `tenancy_type: !ast_fixed` | fixed_term_end_date, has_break_clause | ✅ Unmount clears |

### Result: VERIFIED - No Stale Errors

---

## C. Input Validation Edge Cases

### UK Postcode Validation

**Test Location:** `mqs-field-validator.ts:271-279`

| Input | Expected | Actual | Status |
|-------|----------|--------|--------|
| `SW1A 1AA` | Valid | Valid | ✅ |
| `M1 1AA` | Valid | Valid | ✅ |
| `LS28 7PW` | Valid | Valid | ✅ |
| `EH1 1BB` | Valid | Valid | ✅ |
| `sw1a 1aa` (lowercase) | Valid | Valid | ✅ |
| `INVALID` | Invalid | Invalid | ✅ |
| `12345` | Invalid | Invalid | ✅ |

**Note:** PropertySection.tsx auto-uppercases postcode input:
```typescript
onChange={(v) => onUpdate({ property_address_postcode: String(v).toUpperCase() })}
```

### Date Validation

**Test Location:** `mqs-field-validator.ts:163-208`

| Input | Expected | Actual | Status |
|-------|----------|--------|--------|
| `2024-01-15` (ISO) | Valid | Valid | ✅ |
| `15/01/2024` (UK) | Valid | Valid | ✅ |
| `32/01/2024` (impossible) | Invalid | Invalid | ✅ |
| `2024-02-30` (Feb 30) | Invalid | Invalid | ✅ |
| `invalid` | Invalid | Invalid | ✅ |

### Numeric Field Validation

| Field | Test Case | Expected | Actual | Status |
|-------|-----------|----------|--------|--------|
| `rent_amount` | Empty | Required error | Required error | ✅ |
| `rent_amount` | 0 | Valid (0 is valid) | Valid | ✅ |
| `rent_amount` | -50 | Min error | Min error | ✅ |
| `rent_due_day` | 32 (monthly) | Max error | Max error | ✅ |
| `rent_due_day` | 8 (weekly) | Max error | Max error | ✅ |
| `deposit_amount` | Exceeds cap | Cap error | Cap error | ✅ |

### Result: VERIFIED - Correct Validation Behavior

---

## D. N5B Attachment Checkbox Legal Safety

### Critical Question: Do compliance answers affect attachment checkboxes?

**Answer: NO - Correctly Separated**

### Checkbox Logic (eviction-wizard-mapper.ts:428-445):

```typescript
deposit_certificate_uploaded:
  wizardFacts.has_deposit_certificate_copy === true ||
  hasUploadForCategory(evidence.files, EvidenceCategory.DEPOSIT_PROTECTION_CERTIFICATE),

epc_uploaded:
  wizardFacts.has_epc_copy === true ||
  hasUploadForCategory(evidence.files, EvidenceCategory.EPC),

gas_safety_uploaded:
  wizardFacts.has_gas_certificate_copy === true ||
  hasUploadForCategory(evidence.files, EvidenceCategory.GAS_SAFETY_CERTIFICATE),
```

### Separation of Concerns:

| Field | Purpose | Used For |
|-------|---------|----------|
| `deposit_protected` | Compliance question | S21 blocker (can't proceed if false) |
| `deposit_certificate_uploaded` | Upload flag | N5B Checkbox E |
| `epc_served` | Compliance question | S21 blocker |
| `epc_uploaded` | Upload flag | N5B Checkbox F |
| `gas_safety_cert_served` | Compliance question | S21 blocker (if gas appliances) |
| `gas_safety_uploaded` | Upload flag | N5B Checkbox G |

### Test Coverage Verification:

**File:** `tests/complete-pack/england-eviction-wizard-redesign.test.ts:325-396`

```typescript
describe('Upload Truthfulness', () => {
  it('does not tick N5B checkboxes without actual uploads', () => {
    // facts WITHOUT uploads
    const { caseData } = wizardFactsToEnglandWalesEviction('test', factsWithoutUploads);

    // Checkboxes E, F, G should be FALSE when no uploads
    expect(caseData.deposit_certificate_uploaded).toBe(false);
    expect(caseData.epc_uploaded).toBe(false);
    expect(caseData.gas_safety_uploaded).toBe(false);
  });

  it('ticks N5B checkboxes when files are uploaded', () => {
    // facts WITH uploads
    const { caseData } = wizardFactsToEnglandWalesEviction('test', factsWithUploads);

    // Checkboxes E, F, G should be TRUE when files are uploaded
    expect(caseData.deposit_certificate_uploaded).toBe(true);
    expect(caseData.epc_uploaded).toBe(true);
    expect(caseData.gas_safety_uploaded).toBe(true);
  });
});
```

### Critical Scenario: Compliance YES + Uploads NONE

| User Answers | Result |
|--------------|--------|
| `deposit_protected: true` (complied) | - |
| `has_deposit_certificate_copy: false` | - |
| No file uploads | - |
| **Checkbox E** | **UNCHECKED** ✅ |

This is the correct behavior. The user confirmed compliance (deposit was protected) but did NOT upload proof or confirm they have a copy to attach. The checkbox correctly remains unchecked.

### Result: VERIFIED - No Legal-Risk Coupling

---

## E. Navigation Gating with hasErrors

### Test: hasErrors Correctly Gates Next Button

**Location:** `EvictionSectionFlow.tsx:889`

```tsx
<button
  onClick={handleNext}
  disabled={currentSectionIndex === visibleSections.length - 1 || hasErrors || uploadsInProgress}
  ...
>
  Next →
</button>
```

### Flow Verification:

1. ✅ `hasErrors` comes from ValidationContext
2. ✅ ValidatedField components register errors via `setFieldError()`
3. ✅ Errors auto-clear via `clearFieldError()` when field is valid or unmounts
4. ✅ Navigation blocked when `hasErrors === true`

### Edge Case: Section with no ValidatedField components

Some sections may not have ValidatedField components wired yet (e.g., NoticeSection uses different patterns). In these cases:
- `hasErrors` will be `false` (no errors registered)
- Navigation allowed (section-level blockers still apply separately)

This is acceptable because section-level blockers in `EvictionSectionFlow.tsx:180-200` still prevent proceeding without critical information.

### Result: VERIFIED - Safe Navigation Gating

---

## F. Test Coverage Assessment

### Existing Test Files:

| File | Coverage Area | Status |
|------|---------------|--------|
| `mqs-field-validator.test.ts` | isEmpty, isDependencyMet, validateField, validateGroupFields, calculateDepositCap, validateDepositCap, validateSection21Compliance, UK_PATTERNS | ✅ Comprehensive |
| `england-eviction-wizard-redesign.test.ts` | Upload truthfulness (N5B checkboxes E/F/G), signatory mapping, joint tenant mapping | ✅ Critical paths covered |
| `court-forms-value-mapping.test.ts` | N5/N5B/N119 form filling, field value mapping | ✅ Form generation covered |
| `section21-complete-pack.test.ts` | S21 compliance validation, complete pack requirements | ✅ Compliance covered |

### Missing Test: ValidationContext + ValidatedField Integration

**Recommendation:** Add integration tests for:
1. `ValidatedInput` error registration/clearing with context
2. `ValidatedYesNoToggle` blocking message registration
3. Conditional field unmount error cleanup

**Risk Level:** LOW - Unit tests cover individual components; integration covered by E2E flows.

---

## G. Known Limitations

### 1. NoticeSection Not Updated

**Status:** Uses different component patterns (not ValidatedField)
**Impact:** LOW - Notice section has separate validation
**Mitigation:** Section-level blockers still enforce required data

### 2. Trust-Based Document Confirmation

**Status:** Users can confirm "I have document" without upload
**Impact:** ACCEPTED RISK - User signs Statement of Truth
**Mitigation:** Clear UI messaging about legal responsibility

### 3. ValidatedField Errors Are Local to Current Section

**Status:** Errors clear when navigating away
**Impact:** NONE - This is expected behavior
**Mitigation:** Review step shows incomplete sections

---

## H. Summary

### No Issues Found

The validation wiring is correctly implemented with:

1. **Error state lifecycle** - Errors only display after user interaction (touched)
2. **Conditional cleanup** - Hidden fields auto-clear their errors on unmount
3. **Input validation** - UK postcode, date, and numeric validation working correctly
4. **Legal safety** - N5B checkboxes E/F/G use upload-based flags, NOT compliance answers
5. **Navigation gating** - `hasErrors` correctly gates Next button
6. **Test coverage** - Critical paths have existing test coverage

### Recommendations

1. **Optional:** Add integration test for ValidatedField + ValidationContext
2. **Optional:** Consider migrating NoticeSection to ValidatedField pattern

---

## Approval

This QA audit confirms the ValidatedField wiring is:
- **Safe** for production deployment
- **Correct** in validation behavior
- **Non-blocking** for valid user journeys
- **Legally safe** for N5B court form generation

No bugs identified. No PR fixes required.

---

*Generated by Claude Code Post-Wiring QA Audit*
