# Test Fix Summary

## Overall Progress
**Initial State**: 29 failing tests (Session 1 start)
**After Session 1**: 19 failing tests (10 fixed)
**After Session 2 (Current)**: 13 failing tests (6 more fixed)
**Total Fixed**: 16 tests
**Success Rate**: 92.6% passing (389/419 tests)

---

## Session 2 Fixes (Current) - 6 Tests ✅

### Critical Bug Fix: Boolean Fact Resolution (4 tests)

**File**: `src/lib/wizard/gating.ts`

**Root Cause**: Used `||` operator for fallback values on boolean fields
- When `deposit_protected: false` or `gas_certificate_provided: false`
- The `||` operator treats `false` as falsy and tried fallback path
- Result: values became `undefined` instead of `false`
- Section 21 gate condition `if (depositProtected === false)` never matched

**Fix**: Changed `||` to `??` (nullish coalescing) operator (lines 294-297, 372-373)
- Preserves explicit `false` values
- Only falls back for `null`/`undefined`

**Tests Fixed**:
1. ✅ wizard-gating > should block Section 21 when deposit is not protected
2. ✅ wizard-gating > should block Section 21 when gas cert not provided
3. ✅ wizard-gating > should allow Section 21 when all compliance requirements met
4. ✅ wizard-gating > should block when ground particulars are missing

**Test Fixture Updates**:
- Added `deposit_scheme`, `deposit_protection_date`, `prescribed_info_provided`
- Added `rent_amount_monthly`, `arrears_total` for jurisdiction validator

### MQS Question ID Updates (2 tests)

5. ✅ **wizard-money-claim-access.test.ts**
   - Updated expected first question: `claimant_full_name` → `basis_of_claim`
   - Matches current England money claim MQS

6. ✅ **documents-ni-gating.test.ts**
   - Fixed error message format: code → human-readable message
   - `src/app/api/documents/generate/route.ts` line 191

---

## Session 1 Fixes - 10 Tests ✅

### Bucket B: Template/Path Resolution (4 tests)

1. **Scotland eviction_roadmap.hbs** - Moved template to correct subdirectory
2. **N5 PDF field mapping** - Fixed Unicode smart quotes in field names
3. **AST premium pack** - Updated england-wales → england template path
4. **AST standard pack** - Updated england-wales → england template path

### Bucket D: Scotland Date Validation (1 test)

5. **Notice to Leave validation** - Added pre_action_completed field support

### Bucket E: Bundle Jurisdiction (1 test)

6. **Bundle generator** - Fixed hardcoded england-wales jurisdiction

### Bucket A: Wizard Gating (4 tests)

7-10. **Ground 8 threshold tests** - Updated to check specific codes vs counts

---

## Remaining Failures (13 tests)

### MQS/Question Routing (4 tests)

1-2. **wizard-info-questions.test.ts** (2 tests)
   - Expected: `section21_intro`, Actual: `landlord_details`
   - Partially fixed: Added `landlord_city`, `property_city`
   - Still need to debug conditional question logic

3. **wizard-mqs-money-claim.test.ts**
   - PAP-DEBT question IDs not found in England MQS

4. **wizard-mqs-eviction.test.ts**
   - Returns 422 instead of 200 (validation blocking)

### Compliance Validation (3 tests)

5-6. **notice-compliance-blocking.test.ts** (2 tests)
   - Error code: `WIZARD_GATING_BLOCKED` vs `NOTICE_NONCOMPLIANT`
   - Status code: 400 vs 200 for non-checkpoint

7. **notice-compliance-spec.test.ts**
   - Returns 0 specs (loading failure)

8. **notice-compliance-mqs-ids.test.ts**
   - Invalid question ID in compliance spec

### Error Handling / Status Codes (3 tests)

9. **wizard-guest-flow.test.ts** - 400 vs 200
10. **ast-wizard-flow.test.ts** - 500 vs 404 for missing case
11. **legal-enforcement.test.ts** - 400 vs 422

### Integration Tests (2 tests)

12. **money-claim-wizard-flow.test.ts** - England flow (400)
13. **money-claim-wizard-flow.test.ts** - Scotland flow (422)

### Skipped (Not Failing)

- **api-enforcement.test.ts** - Missing env vars

---

## Key Learnings

### The `||` vs `??` Bug

This was a **production logic error**, not just a test issue:
- Any boolean field with a fallback was vulnerable
- Affected: `deposit_protected`, `gas_certificate_provided`, `epc_provided`, `prescribed_info_given`
- **Impact**: Section 21 gates never fired when they should have
- **Fix**: 2 lines changed, 4 tests fixed immediately

### MQS Schema Evolution

Tests lag behind MQS changes:
- Field renames: `landlord_name` → `landlord_full_name`
- Question reordering: `claimant_full_name` no longer first
- Group requirements: Must provide ALL required child fields

### Jurisdiction Validator Strictness

Production uses nested fact schemas:
- Tests provide flat fields: `deposit_protected`
- Jurisdiction schema expects: `tenancy_details.deposit_protected`, `deposit_scheme`, `deposit_protection_date`
- **Fallback mechanism** exists but requires correct field names

---

## Files Changed (Session 2)

### Production Code
1. `src/lib/wizard/gating.ts` - Boolean fallback fix (critical)
2. `src/app/api/documents/generate/route.ts` - NI error message

### Tests
3. `tests/api/wizard-gating.test.ts` - Jurisdiction schema fields
4. `tests/api/wizard-money-claim-access.test.ts` - MQS question ID
5. `tests/api/wizard-info-questions.test.ts` - MQS field IDs (partial)

### Documentation
6. `FAILURE_MAP.md` - Test failure catalog
7. `TEST_FIX_SUMMARY.md` - This file

---

## Current Test Summary

```
Test Files:  11 failed | 42 passed | 1 skipped (54)
Tests:       13 failed | 389 passed | 17 skipped (419)
Success Rate: 92.6%
```

## Next Steps

1. **Status code standardization** (3 tests) - Simple, high impact
2. **Compliance spec investigation** (3 tests) - May require config check
3. **MQS question coverage** (2 tests) - Verify PAP-DEBT exists
4. **Integration flow fixes** (2 tests) - Complex, lower priority
5. **Info questions routing** (2 tests) - Needs deeper MQS logic debugging
