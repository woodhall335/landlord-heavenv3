# Session 3 Test Fix Progress

## Summary
- **Starting:** 13 failing tests
- **Current:** 11 failing tests  
- **Fixed:** 2 tests
- **Remaining:** 11 tests

## Fixed Tests

### ✅ Test #4: wizard-mqs-money-claim.test.ts
**Category:** MQS/Routing
**Issue:** Test expected 21 outdated question IDs that didn't exist in current MQS
**Fix:** Updated test to use actual question IDs from current england.yaml and scotland.yaml MQS files
**Files Changed:** 
- `tests/api/wizard-mqs-money-claim.test.ts`

### ✅ Test #8: ast-wizard-flow.test.ts (500→404)
**Category:** Status Code
**Issue:** Test mocks threw `Error('Not found')` which wasn't classified as 404
**Fix:** Added check for "not found" in error message to `classifyDatabaseError()` function
**Files Changed:**
- `src/lib/api/error-handling.ts`

## Tests Still Failing (11 remaining)

### Complex (defer to later)
- **#1, #2:** wizard-info-questions.test.ts - Complex mock setup issues with multiple database queries

### Medium Priority
- **#3:** wizard-mqs-eviction.test.ts - Status 422 vs 200
- **#5, #6, #7:** Compliance tests - Status code 400→422 mismatches
- **#9:** legal-enforcement.test.ts - Status 400→422
- **#10:** wizard-guest-flow.test.ts - Status 400→200
- **#11, #12:** Integration tests - money claim flows failing
- **#13:** api-enforcement.test.ts - Skipped due to missing env vars

## Next Steps
1. Focus on simple status code fixes (#9, #10)
2. Tackle compliance tests (#5, #6, #7)  
3. Fix integration tests (#11, #12)
4. Handle skipped test (#13)
5. Return to complex tests (#1, #2, #3) if time permits

## Files Modified
- FAILURE_MAP.md (created)
- tests/api/wizard-info-questions.test.ts (partial fix, still failing)
- tests/api/wizard-mqs-money-claim.test.ts (FIXED ✅)
- src/lib/api/error-handling.ts (FIXED ✅)
