# Test Failure Map - Session 3 (13 Failing Tests)

**Test Summary**: 13 failed | 389 passed | 17 skipped (419 total)
**Duration**: 10.98s

---

## STEP 1: Captured Failures

### MQS/Routing Failures (4 tests)

#### 1. wizard-info-questions.test.ts:121 - returns info-type question (section21_intro)
**Test:** Wizard info-type question handling > returns info-type question (section21_intro) once and marks it as viewed
**Expected:** `body1.next_question.id = 'section21_intro'`
**Actual:** `body1.next_question.id = 'landlord_details'`
**Category:** MQS/Routing
**Root Cause:** Question ID drift - test expects old MQS question flow starting with section21_intro, but wizard now returns landlord_details

#### 2. wizard-info-questions.test.ts:211 - does not get stuck in loop
**Test:** Wizard info-type question handling > does not get stuck in a loop on info questions
**Expected:** `responses[0] = 'section21_intro'`
**Actual:** `responses[0] = 'landlord_details'`
**Category:** MQS/Routing
**Root Cause:** Same as #1 - question sequence changed

#### 3. wizard-mqs-eviction.test.ts:281 - enhanceAnswer called for MQS
**Test:** MQS eviction flow (England & Wales) > enhanceAnswer is called for MQS questions with suggestion_prompt
**Expected:** Status 200
**Actual:** Status 422
**Category:** MQS/Routing
**Root Cause:** MQS question answer blocked by compliance/validation - likely jurisdiction issue or missing spec

#### 4. wizard-mqs-money-claim.test.ts:61 - includes PAP-DEBT questions
**Test:** Money claim MQS - England & Wales PAP-DEBT coverage > includes PAP-DEBT, court route, evidence, and enforcement questions
**Expected:** All englandWalesNewIds present in questionIds set (returns true)
**Actual:** Some question IDs missing (returns false)
**Category:** MQS/Routing
**Root Cause:** Question IDs changed or not loaded for England money claim flow

---

### Compliance Failures (3 tests)

#### 5. notice-compliance.test.ts:115 - returns 422 with compliance failures
**Test:** Notice Compliance API > returns 422 with compliance failures when answering a question
**Expected:** Status 422
**Actual:** Status 400
**Category:** Compliance/Status Code
**Root Cause:** Compliance validation errors should return 422 (unprocessable entity), not 400 (bad request)

#### 6. notice-compliance.test.ts:154 - marks valid answer with warnings
**Test:** Notice Compliance API > marks a valid answer and issues warnings when compliance specs not found
**Expected:** Status 422 with error 'NOTICE_NONCOMPLIANT'
**Actual:** Status 400 with different error code
**Category:** Compliance/Status Code
**Root Cause:** Missing compliance spec causing wrong status (400 vs 422) and wrong error code

#### 7. notice-compliance-blocking.test.ts:150 - allows non-checkpoint with warnings
**Test:** wizard answer compliance blocking > allows non-checkpoint questions to pass even with compliance issues
**Expected:** Status 200 (compliance issues downgraded to warnings)
**Actual:** Status 400
**Category:** Compliance
**Root Cause:** Non-checkpoint questions should NOT block on compliance issues - should allow pass with warnings only

---

### Status Code Failures (3 tests)

#### 8. ast-wizard-flow.test.ts:412 - reject non-existent case_id
**Test:** AST Wizard Flow - Integration Tests > Error Handling > should reject non-existent case_id in answer route
**Expected:** Status 404 (not found)
**Actual:** Status 500 (server error)
**Category:** Status Code
**Root Cause:** Non-existent case should return 404, not 500 - missing error handling for case lookup

#### 9. legal-enforcement.test.ts:282 - migrates legacy England & Wales
**Test:** jurisdiction gating enforcement > migrates legacy England & Wales cases to England rules during preview validation
**Expected:** Status 422 (legal block)
**Actual:** Status 400 (bad request)
**Category:** Status Code
**Root Cause:** Legal enforcement blocks should return 422, not 400

#### 10. wizard-guest-flow.test.ts:110 - allows guest to answer
**Test:** Guest Wizard Flow > allows guest to answer questions in wizard
**Expected:** Status 200
**Actual:** Status 400
**Category:** Status Code
**Root Cause:** Guest flow getting 400 - likely validation or auth issue

---

### Integration Failures (2 tests)

#### 11. money-claim-wizard-flow.test.ts:147 - England & Wales money claim
**Test:** Money claim wizard integration > England & Wales money claim pack generation flow
**Expected:** Status 200 when answering questions
**Actual:** Status 400
**Category:** Integration
**Root Cause:** Full integration flow failing - likely request format or validation drift across steps

#### 12. money-claim-wizard-flow.test.ts:147 - Scotland money claim
**Test:** Money claim wizard integration > Scotland money claim flow produces Simple Procedure pack
**Expected:** Status 200 when answering questions
**Actual:** Status 422
**Category:** Integration
**Root Cause:** Scotland flow hitting compliance/validation block - may be jurisdiction-specific issue

---

### Skipped Tests (1 suite)

#### 13. api-enforcement.test.ts - 16 tests skipped
**Test:** src/app/api/wizard/generate/__tests__/api-enforcement.test.ts (entire suite)
**Status:** 16 tests SKIPPED
**Category:** Environment
**Root Cause:** Missing environment variables - needs test setup or env defaults

---

## Fix Strategy (in priority order)

### STEP 2: MQS/Routing (4 tests)
- Fix question ID drift (#1, #2) - update test fixtures to match current MQS flow
- Fix compliance blocking MQS (#3) - ensure MQS questions bypass compliance or fix jurisdiction
- Fix missing question IDs (#4) - verify MQS YAML has correct question IDs for money claim

### STEP 3: Compliance (3 tests)
- Fix status codes 400→422 (#5, #6) - compliance errors should be 422
- Fix non-checkpoint blocking (#7) - allow warnings instead of blocks

### STEP 4: Status Codes (3 tests)
- Fix 500→404 for missing case (#8)
- Fix 400→422 for legal blocks (#9)
- Fix guest flow 400 (#10)

### STEP 5: Integration (2 tests)
- Fix England money claim flow (#11)
- Fix Scotland money claim flow (#12)

### STEP 6: Skipped tests (1 suite)
- Add env var defaults for tests (#13)
