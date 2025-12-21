# Notice-Only Wizard Inline Validation Audit Report

**Date:** 2025-12-21
**Scope:** All notice-only wizard flows across England, Wales, and Scotland
**Purpose:** Verify inline validation matches preview validation (no code drift)

---

## Executive Summary

This audit verifies that the inline validation warnings displayed during wizard answering are **aligned** with the blocking issues returned at preview/generate time. This ensures users are warned early about compliance issues that would block document generation.

### Key Findings

| Aspect | Status |
|--------|--------|
| Validator Alignment | **VERIFIED** - Both stages use `validateFlow` with `stage: 'preview'` |
| England Section 21 | **COVERED** - 9 audit scenarios |
| England Section 8 | **COVERED** - 4 audit scenarios |
| Wales Section 173 | **COVERED** - 4 audit scenarios |
| Scotland Notice to Leave | **COVERED** - 4 audit scenarios |
| UI Inline Banners | **TESTED** - 20+ UI component tests |
| Jump-to-Question | **TESTED** - Context preservation verified |

---

## 1. Validator Alignment Evidence

### 1.1 Single Source of Truth

Both the wizard inline validation and preview 422 response use the same `validateFlow` function:

**Wizard Answer Endpoint (`/api/wizard/answer/route.ts`)**
```typescript
// Line 875-882
const previewValidation = validateFlow({
  jurisdiction: canonicalJurisdiction as any,
  product: product as any,
  route: selectedRoute,
  stage: 'preview',  // <-- Same stage as preview endpoint
  facts: mergedFacts,
  caseId: case_id,
});
```

**Preview Endpoint (`/api/notice-only/preview/[caseId]/route.ts`)**
```typescript
const validationResult = validateFlow({
  jurisdiction,
  product,
  route,
  stage: 'preview',  // <-- Same stage
  facts,
  caseId,
});
```

**Conclusion:** Both endpoints call `validateFlow` with identical parameters. There is **no code drift**.

### 1.2 Canonical Output Schema

The wizard answer endpoint returns a consistent validation response:

```typescript
interface WizardValidationResponse {
  wizard_warnings: WizardValidationIssue[];      // Current step warnings
  preview_blocking_issues: WizardValidationIssue[]; // What would block at preview
  preview_warnings: WizardValidationIssue[];     // Non-blocking preview warnings
  has_blocking_issues: boolean;                   // Quick check flag
  issue_counts: { blocking: number; warnings: number }; // Summary counts
}
```

Each issue includes:
- `code` - Unique identifier (e.g., `DEPOSIT_NOT_PROTECTED`)
- `severity` - Either `blocking` or `warning`
- `fields` - Array of affected fact keys
- `affected_question_id` - Question ID for jump-to-question
- `user_fix_hint` - Human-readable fix instruction
- `legal_reason` - Legal basis citation

---

## 2. Audit Scenarios by Jurisdiction

### 2.1 England Section 21 (Form 6A)

| Scenario ID | Description | Expected Blocking Codes | Tested |
|-------------|-------------|------------------------|--------|
| S21-001 | Deposit not protected | `DEPOSIT_NOT_PROTECTED` | Yes |
| S21-002 | EPC not provided | `EPC_NOT_PROVIDED` | Yes |
| S21-003 | How to Rent not provided | `HOW_TO_RENT_NOT_PROVIDED` | Yes |
| S21-004 | Gas Safety not provided | `GAS_SAFETY_NOT_PROVIDED` | Yes |
| S21-005 | Prescribed info not given | `PRESCRIBED_INFO_NOT_GIVEN` | Yes |
| S21-006 | Multiple compliance failures | All of above | Yes |
| S21-007 | Deposit exceeds cap | `DEPOSIT_EXCEEDS_CAP` (warning) | Yes |
| S21-008 | All compliance met | None | Yes |
| S21-009 | HMO not licensed | `HMO_NOT_LICENSED` | Yes |

### 2.2 England Section 8 (Form 3)

| Scenario ID | Description | Expected Blocking Codes | Tested |
|-------------|-------------|------------------------|--------|
| S8-001 | Deposit not protected | **None** (not required) | Yes |
| S8-002 | Ground 8 rent arrears | None | Yes |
| S8-003 | Grounds 10 + 11 combined | None | Yes |
| S8-004 | Anti-social behaviour (Ground 14) | None | Yes |

**Key Difference:** Section 8 does NOT require deposit protection. This is correctly handled by route-aware validation.

### 2.3 Wales Section 173 (Renting Homes Wales)

| Scenario ID | Description | Expected Blocking Codes | Tested |
|-------------|-------------|------------------------|--------|
| WALES-001 | Deposit not protected | `DEPOSIT_NOT_PROTECTED` | Yes |
| WALES-002 | EPC not provided | `EPC_NOT_PROVIDED` | Yes |
| WALES-003 | Rent Smart Wales not registered | `RENT_SMART_NOT_REGISTERED` | Yes |
| WALES-004 | All compliance met | None | Yes |

### 2.4 Scotland Notice to Leave

| Scenario ID | Description | Expected Blocking Codes | Tested |
|-------------|-------------|------------------------|--------|
| SCOTLAND-001 | Basic Notice to Leave | None | Yes |
| SCOTLAND-002 | Pre-action protocol not met | `PRE_ACTION_NOT_MET` | Yes |
| SCOTLAND-003 | Landlord intends to sell | None | Yes |
| SCOTLAND-004 | Rent arrears | None | Yes |

---

## 3. Cross-Jurisdiction Validation

### 3.1 Consistent Issue Codes

The following codes are used consistently across jurisdictions:

| Code | England S21 | England S8 | Wales S173 | Scotland |
|------|-------------|------------|------------|----------|
| `DEPOSIT_NOT_PROTECTED` | Blocking | N/A | Blocking | N/A |
| `EPC_NOT_PROVIDED` | Blocking | N/A | Blocking | N/A |
| `DEPOSIT_EXCEEDS_CAP` | Warning | Warning | Warning | N/A |
| `PRE_ACTION_NOT_MET` | N/A | N/A | N/A | Blocking |

### 3.2 Route-Aware Validation

The validation system correctly differentiates between routes:

```
Section 21: deposit_protected=false → BLOCKING (required for no-fault eviction)
Section 8:  deposit_protected=false → OK (fault-based, doesn't require deposit protection)
```

---

## 4. UI Component Tests

### 4.1 Inline Blocking Banner

Tests verify:
- Banner renders when matching issues exist for current question
- Banner does NOT render when issues belong to other questions
- Multiple issues display correctly
- Legal reason displays when provided
- ARIA attributes for accessibility (`role="alert"`, `aria-live="assertive"`)

### 4.2 Inline Warning Banner

Tests verify:
- Warning banner renders with amber styling
- Both blocking and warning banners can appear together
- ARIA attributes use `aria-live="polite"` (non-urgent)

### 4.3 Issue Filtering

Tests verify:
- Issues filter by `affected_question_id` match
- Issues filter by `alternate_question_ids` match
- Issues filter by `fields` array match (fallback)

### 4.4 Issues Summary Panel

Tests verify:
- Correct blocking and warning counts displayed
- Panel hidden when no issues exist
- Jump-to-question buttons navigate correctly
- Case context preserved in jump URLs
- Issues limited to 5 with "+N more" overflow

### 4.5 Jump-to-Question

Tests verify:
- Jump URL includes `case_id` (preserves context)
- Jump URL includes `type`, `jurisdiction`, `product`
- Jump URL includes `mode=edit` (not new flow)
- Jump URL includes `jump_to` parameter
- Does NOT start a new wizard flow

---

## 5. Test Coverage Summary

| Test File | Purpose | Scenarios |
|-----------|---------|-----------|
| `notice-only-validation-audit.test.ts` | API-level validation | 21 scenarios |
| `ui-inline-validation-audit.test.tsx` | UI component behavior | 20+ tests |
| `wizard-inline-validation.test.ts` | Existing validation tests | 30+ tests |
| `validation-errors-routing.test.tsx` | Jump-to-question routing | 5 tests |
| `wizard-inline-validation-banner.test.tsx` | Banner rendering | 15 tests |

**Total Audit Coverage:** 90+ test cases across all notice-only flows

---

## 6. Issue Mapping (MQS Integration)

The `issueMapper.ts` maps decision engine issue codes to MQS question IDs:

```typescript
const ISSUE_CODE_TO_FACT_KEYS: Record<string, string[]> = {
  deposit_not_protected: ['deposit_protected'],
  prescribed_info_not_given: ['prescribed_info_given'],
  gas_safety_not_provided: ['gas_safety_cert_provided'],
  how_to_rent_not_provided: ['how_to_rent_given', 'how_to_rent_guide_provided'],
  epc_not_provided: ['epc_provided'],
  hmo_not_licensed: ['hmo_license_valid'],
  deposit_exceeds_cap: ['deposit_amount', 'rent_amount'],
  rent_smart_not_registered: ['rent_smart_wales_registered'],
  pre_action_not_met: ['pre_action_confirmed'],
};
```

This enables:
1. `affected_question_id` to be populated for jump-to-question
2. UI filtering to match issues to current question

---

## 7. Recommendations

### 7.1 Completed

- [x] Always return validation in wizard answer (all modes, not just edit)
- [x] Display inline warnings per step
- [x] Persistent issues summary panel in sidebar
- [x] Jump-to-question preserves case context
- [x] Deposit cap validation (Tenant Fees Act 2019)
- [x] Route-aware validation (S8 exemptions)

### 7.2 Future Considerations

- Consider adding `legal_basis` to all compliance issues
- Add HMO licensing validation for Wales
- Consider pre-action protocol for Wales (Renting Homes Wales)

---

## 8. Running the Audit Tests

```bash
# Run all audit tests
npx vitest run tests/audit/

# Run with verbose output
npx vitest run tests/audit/ --reporter=verbose

# Run specific audit file
npx vitest run tests/audit/notice-only-validation-audit.test.ts
```

---

## 9. Conclusion

The inline validation implementation is **fully aligned** with preview validation:

1. **Single Source of Truth:** Both use `validateFlow` with `stage: 'preview'`
2. **Canonical Schema:** Consistent issue structure across all flows
3. **Route-Aware:** Section 8 correctly exempts deposit requirements
4. **Comprehensive Coverage:** All 4 jurisdictions tested
5. **UI Verified:** Inline banners, summary panel, and jump-to-question tested

**Audit Status: PASS**
