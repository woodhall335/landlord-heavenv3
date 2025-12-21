# Notice-Only Validation Audit Report - HARDENED v2

**Audit Date:** December 2024
**Test Suite Version:** Hardened v2
**Status:** ✅ PASS (248 tests passing)

---

## Executive Summary

This audit report documents the comprehensive test coverage for notice-only wizard validation flows. The test suite has been **hardened** to ensure:

1. **Inline validation uses the same stage as preview (`stage:'preview'`)** - no drift between what users see during wizard flow and what they see at preview
2. **All supported routes from capability matrix are covered** - no hardcoded route lists
3. **Minimal compliant `ok:true` scenarios exist for every route** - proving happy paths work
4. **Route-aware validation is tested** - e.g., Section 8 doesn't require deposit protection
5. **Deposit cap (Tenant Fees Act 2019) validation is properly surfaced**

---

## Critical Design Decision (December 2024)

### Inline Validation == Preview Validation

**Key insight:** Both endpoints now use `stage:'preview'`:
- `/api/wizard/answer` runs `validateFlow` with `stage:'preview'` for inline warnings
- `/api/notice-only/preview/:caseId` also runs `validateFlow` with `stage:'preview'`

**Therefore:** Inline validation codes **MUST EQUAL** preview validation codes. The tests verify this with strict equality assertions.

### Validation Stages

| Stage | Usage | Enforcement Level |
|-------|-------|-------------------|
| `wizard` | Legacy (not used for inline) | Soft warnings |
| `preview` | Inline + Preview endpoint | Warnings + some blocking (e.g., deposit_not_protected) |
| `generate` | Final document generation | Full blocking enforcement |

---

## Route Coverage from Capability Matrix

Routes are enumerated dynamically from `getCapabilityMatrix()`, not hardcoded:

```typescript
function getSupportedNoticeOnlyRoutes(): SupportedRoute[] {
  const matrix = getCapabilityMatrix();
  const routes: SupportedRoute[] = [];
  for (const jurisdiction of jurisdictions) {
    const capability = matrix[jurisdiction]?.notice_only;
    if (capability?.status === 'supported') {
      for (const route of capability.routes) {
        routes.push({ jurisdiction, route });
      }
    }
  }
  return routes;
}
```

| Jurisdiction | Route | ok:true Scenario | Blocking/Warning Scenario | Scenario IDs |
|--------------|-------|------------------|---------------------------|--------------|
| England | section_21 | ✓ | ✓ (deposit_not_protected) | S21-001 to S21-006 |
| England | section_8 | ✓ | ✓ (warnings) | S8-001 to S8-004 |
| Wales | wales_section_173 | ✓ | ✓ (warnings) | WALES-001, WALES-001B |
| Wales | wales_fault_based | ✓ | ✓ (warnings) | WALES-002 to WALES-004 |
| Scotland | notice_to_leave | ✓ | ✓ (warnings) | SCOT-001, SCOT-002 |

---

## Test File Structure

### 1. `notice-only-validation-audit.test.ts` (Primary Audit)

**Purpose:** Comprehensive validation of inline == preview alignment

**Key Tests:**
- ✅ Minimal compliant `ok:true` scenarios for each route
- ✅ Blocking scenarios (deposit_not_protected for S21)
- ✅ Warning scenarios (EPC, How to Rent, Gas Safety at preview)
- ✅ Inline == Preview code alignment assertions
- ✅ Route coverage gate (fails if any route from matrix lacks coverage)
- ✅ Deposit cap warning detection

### 2. `notice-only-inline-step-flow.test.ts` (Step Flow)

**Purpose:** Simulate real wizard behavior with incremental facts

**Key Tests:**
- ✅ Issue counts decrease as valid facts are added
- ✅ Deposit issue appears when `deposit_protected=false`
- ✅ Deposit issue disappears when `deposit_protected=true`
- ✅ Each route has step-by-step flow tests
- ✅ Uses `stage:'preview'` (matching real inline behavior)

### 3. `notice-only-template-parity.test.ts` (Template Output)

**Purpose:** Verify template variable wiring and computed fields

**Key Tests:**
- ✅ Section 8 `earliest_possession_date` appears correctly
- ✅ Scotland `earliest_leaving_date` appears correctly
- ✅ No `[object Object]` or undefined in output
- ✅ Party names and addresses correctly placed
- ✅ DD/MM/YYYY date format used

---

## Scenario Details

### England Section 21 Scenarios

| ID | Name | Expected Result | Description |
|----|------|-----------------|-------------|
| S21-001 | Minimal compliant | ok:true | All compliance met |
| S21-002 | Deposit not protected | ok:false (blocking) | Deposit_not_protected blocks at preview |
| S21-003 | EPC not provided | ok:true (warning) | EPC enforced at generate |
| S21-004 | How to Rent not provided | ok:true (warning) | How to Rent enforced at generate |
| S21-005 | Gas Safety not provided | ok:true (warning) | Gas Safety enforced at generate |
| S21-006 | Deposit exceeds cap | ok:true (warning) | Deposit cap is warning, not blocking |

### England Section 8 Scenarios

| ID | Name | Expected Result | Description |
|----|------|-----------------|-------------|
| S8-001 | Minimal compliant (Ground 8) | ok:true | Valid with grounds |
| S8-002 | Deposit not protected | ok:true | S8 doesn't require deposit protection |
| S8-003 | Multiple grounds | ok:true | Multiple grounds accepted |
| S8-004 | No grounds | ok:true (warning) | Grounds enforced at generate |

### Wales Scenarios

| ID | Name | Expected Result | Description |
|----|------|-----------------|-------------|
| WALES-001 | S173 minimal compliant | ok:true | Valid Wales S173 |
| WALES-001B | S173 deposit not protected | ok:true (warning) | Wales deposit at generate |
| WALES-002 | Fault-based minimal | ok:true | Valid fault-based |
| WALES-003 | Fault-based deposit not protected | ok:true | Fault-based like S8 |
| WALES-004 | Fault-based no grounds | ok:true (warning) | Grounds at generate |

### Scotland Scenarios

| ID | Name | Expected Result | Description |
|----|------|-----------------|-------------|
| SCOT-001 | NTL minimal compliant | ok:true | Valid Notice to Leave |
| SCOT-002 | Pre-action not confirmed | ok:true (warning) | Pre-action at generate |

---

## Deposit Cap Validation (Tenant Fees Act 2019)

The audit verifies deposit cap calculation:

```
Rent: £1000/month
Annual Rent: £12,000
Weekly Rent: £230.77
Maximum Deposit (5 weeks): £1,153.85
```

**Test Scenarios:**
- ✅ Deposit £3000 with rent £1000/mo → Warning surfaced
- ✅ Deposit £1000 with rent £1000/mo → No warning (within limit)
- ✅ Deposit cap is a **warning**, not blocking

---

## Coverage Gate Requirements

The audit **FAILS** if:

1. Any supported route from capability matrix lacks an `ok:true` scenario
2. Section 21 lacks a blocking scenario (deposit_not_protected)
3. Any supported route has fewer than 2 scenarios

The audit **PASSES** when all routes have comprehensive coverage.

---

## Inline == Preview Alignment Verification

```typescript
// CRITICAL TEST: Both use stage:'preview'
it('inline codes EQUAL preview codes', () => {
  const inlineCodes = inlineResult.blocking_issues.map(i => i.code).sort();
  const previewCodes = previewResult.blocking_issues.map(i => i.code).sort();

  expect(inlineCodes).toEqual(previewCodes);
  expect(inlineResult.blocking_issues.length).toBe(previewResult.blocking_issues.length);
  expect(inlineResult.warnings.length).toBe(previewResult.warnings.length);
});
```

---

## Test Results Summary

```
 Test Files  4 passed (4)
      Tests  248 passed (248)
```

**Files Tested:**
- `notice-only-validation-audit.test.ts` - Validation alignment
- `notice-only-inline-step-flow.test.ts` - Step flow simulation
- `notice-only-template-parity.test.ts` - Template output
- `ui-inline-validation-audit.test.tsx` - UI component behavior

---

## Audit PASS Confirmation

✅ **Routes discovered from matrix:** england:section_21, england:section_8, wales:wales_section_173, wales:wales_fault_based, scotland:notice_to_leave

✅ **Scenario IDs per route:**
- england:section_21: S21-001, S21-002, S21-003, S21-004, S21-005, S21-006
- england:section_8: S8-001, S8-002, S8-003, S8-004
- wales:wales_section_173: WALES-001, WALES-001B
- wales:wales_fault_based: WALES-002, WALES-003, WALES-004
- scotland:notice_to_leave: SCOT-001, SCOT-002

✅ **Inline == Preview validation uses stage:'preview' everywhere for notice_only**

---

## Recommendations

1. **Future routes** added to capability matrix will automatically be detected by coverage gate
2. **Blocking enforcement** at preview is currently limited to deposit_not_protected for S21
3. **Generate stage** tests should be added for full enforcement verification
4. **Consider** adding E2E tests that actually call API endpoints

---

*Report generated by hardened audit suite v2*
