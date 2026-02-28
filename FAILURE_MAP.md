# Test Failure Map - Session 3 (Post-revert snapshot)

**Test Summary**: 9 failed | 36 passed | 0 skipped (focused subset)
**Duration**: 7.39s (focused subset run via `npm test -- <failing files>`)

---

## Captured Failures

### 1) tests/api/notice-compliance-blocking.test.ts > wizard answer compliance blocking > returns 422 with failures and no next_question when noncompliant at checkpoint
- **Expected:** Status 422 with `error: 'NOTICE_NONCOMPLIANT'`
- **Actual:** Status 422 with `error: 'WIZARD_GATING_BLOCKED'`
- **First Failing Assertion:** `tests/api/notice-compliance-blocking.test.ts:116` (`expect(body.error).toBe('NOTICE_NONCOMPLIANT')`)
- **Stack (top frames):** tests/api/notice-compliance-blocking.test.ts:116:24
- **Suspected Owner:** `/api/wizard/answer` compliance error mapping (notice checkpoint vs wizard gating)

### 2) tests/api/notice-compliance-blocking.test.ts > wizard answer compliance blocking > allows non-checkpoint questions to pass even with compliance issues (downgrades to warnings)
- **Expected:** Status 200 with `answer_saved: true`
- **Actual:** Status 400
- **First Failing Assertion:** `tests/api/notice-compliance-blocking.test.ts:150` (`expect(response.status).toBe(200)`)
- **Stack (top frames):** tests/api/notice-compliance-blocking.test.ts:150:29
- **Suspected Owner:** `/api/wizard/answer` non-checkpoint downgrade logic

### 3) tests/api/wizard-guest-flow.test.ts > Guest Wizard Flow > allows guest to answer questions in wizard
- **Expected:** Status 200, answer saved
- **Actual:** Status 400
- **First Failing Assertion:** `tests/api/wizard-guest-flow.test.ts:111` (`expect(response.status).toBe(200)`)
- **Stack (top frames):** tests/api/wizard-guest-flow.test.ts:111:29
- **Suspected Owner:** Guest answer pathway validation/gating

### 4) tests/api/wizard-info-questions.test.ts > Wizard info-type question handling > returns info-type question (section21_intro) once and marks it as viewed
- **Expected:** `next_question.id === 'section21_intro'`
- **Actual:** `next_question.id === 'landlord_details'`
- **First Failing Assertion:** `tests/api/wizard-info-questions.test.ts:137` (`expect(body1.next_question.id).toBe('section21_intro')`)
- **Stack (top frames):** tests/api/wizard-info-questions.test.ts:137:36
- **Suspected Owner:** MQS routing/info question sequencing for Section 21 intro

### 5) tests/api/wizard-info-questions.test.ts > Wizard info-type question handling > does not get stuck in a loop on info questions
- **Expected:** first question `section21_intro`; subsequent questions differ
- **Actual:** first question `landlord_details`
- **First Failing Assertion:** `tests/api/wizard-info-questions.test.ts:231` (`expect(responses[0]).toBe('section21_intro')`)
- **Stack (top frames):** tests/api/wizard-info-questions.test.ts:231:26
- **Suspected Owner:** MQS routing/info question sequencing for Section 21 intro

### 6) tests/api/wizard-mqs-eviction.test.ts > MQS eviction flow (England & Wales) > enhanceAnswer is called for MQS questions with suggestion_prompt
- **Expected:** Status 200 and enhanceAnswer invoked
- **Actual:** Status 422 (compliance block)
- **First Failing Assertion:** `tests/api/wizard-mqs-eviction.test.ts:284` (`expect(response.status).toBe(200)`)
- **Stack (top frames):** tests/api/wizard-mqs-eviction.test.ts:284:29
- **Suspected Owner:** MQS answer handler compliance gating vs enhancement flow

### 7) tests/integration/money-claim-wizard-flow.test.ts > Money claim wizard integration > England & Wales money claim pack generation flow
- **Expected:** 200 when answering wizard question
- **Actual:** 400 (`Answer failed validation` for `property_address`)
- **First Failing Assertion:** `tests/integration/money-claim-wizard-flow.test.ts:147` (`expect(res.status).toBe(200)`)
- **Stack (top frames):** tests/integration/money-claim-wizard-flow.test.ts:147:22
- **Suspected Owner:** Money-claim wizard answer validation/fixtures

### 8) tests/integration/money-claim-wizard-flow.test.ts > Money claim wizard integration > Scotland money claim flow produces Simple Procedure pack
- **Expected:** Tenant name `Rob Renter`
- **Actual:** Tenant name `Placeholder Tenant`
- **First Failing Assertion:** `tests/integration/money-claim-wizard-flow.test.ts:341` (`expect(caseFacts.parties.tenants[0]?.name).toBe('Rob Renter')`)
- **Stack (top frames):** tests/integration/money-claim-wizard-flow.test.ts:341:48
- **Suspected Owner:** Scotland money-claim fixtures/mapping in integration flow

### 9) tests/lib/jurisdictions/legal-enforcement.test.ts > jurisdiction gating enforcement > migrates legacy England & Wales cases to England rules during preview validation
- **Expected:** Status 422 with `blocking_issues`
- **Actual:** Status 400
- **First Failing Assertion:** `tests/lib/jurisdictions/legal-enforcement.test.ts:282` (`expect(response.status).toBe(422)`)
- **Stack (top frames):** tests/lib/jurisdictions/legal-enforcement.test.ts:282:29
- **Suspected Owner:** Notice preview validation/migration handling for legacy `england-wales` cases

---

## Notes
- Commands run per instructions: `npm test -- --runInBand --verbose` and subset equivalents are unsupported by Vitest; used `npm test -- <failing files>` to capture full failure detail.
- API enforcement integration tests now run via in-memory case store and mocked case retrieval; remaining failures unchanged.
