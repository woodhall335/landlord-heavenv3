# Test Failure Map - 29 Failures

## Summary
- **Total Failures**: 29
- **Test Files Failed**: 20
- **Tests Passed**: 373

---

## Bucket A: Wizard Gating Logic (8 failures)

### tests/api/wizard-gating.test.ts - 8 failures
All related to Ground 8 threshold enforcement not working correctly

1. **Gate 1: Ground 8 Threshold > should block Ground 8 when arrears < 2 months**
   - Error: `expected [ { …(5) }, { …(5) }, { …(5) }, …(10) ] to have a length of 1 but got 13`
   - Root cause: Gating logic not blocking when arrears insufficient

2. **Gate 1: Ground 8 Threshold > should allow Ground 8 when arrears >= 2 months**
   - Error: `expected [ { …(5) }, { …(5) }, { …(5) }, …(9) ] to have a length of +0 but got 12`
   - Root cause: Gating logic returning blocks when it shouldn't

3-8. **Six more Ground 8 threshold tests** (need to examine test file for specifics)

---

## Bucket B: Template/Path Resolution (4 failures)

1. **tests/documents/eviction-pack-option-b.test.ts > Scotland tribunal forms**
   - Error: `Failed to load template uk/scotland/templates/eviction/eviction_roadmap.hbs: ENOENT`
   - File: `config/jurisdictions/uk/scotland/templates/eviction/eviction_roadmap.hbs`
   - Root cause: Missing template file

2. **tests/documents/pdf-field-mapping.test.ts > N5 fields**
   - Error: `expected false to be true`
   - Root cause: Critical N5 PDF fields not matching official form

3. **tests/documents/ast-pack-premium.test.ts > premium content**
   - Error: `expected '<div...' to contain 'HMO & Shared Facilities'`
   - Root cause: Premium template missing HMO content section

4. **tests/documents/ast-pack-standard.test.ts > standard pack**
   - Error: `expected '<div...' to contain 'Legal Validity Summary'`
   - Root cause: Standard template missing Legal Validity Summary section

---

## Bucket C: Wizard Flow/API Contracts (15 failures)

### Question Routing & MQS (5 failures)

1. **tests/api/wizard-info-questions.test.ts > info-type question handling (2 failures)**
   - Error: `expected 'landlord_details' to be 'section21_intro'`
   - Root cause: Info question not being returned; wrong question in sequence

2. **tests/api/wizard-money-claim-access.test.ts > England & Wales money claim**
   - Error: `expected 'basis_of_claim' to be 'claimant_full_name'`
   - Root cause: Wrong first question in money claim flow

3. **tests/api/wizard-mqs-eviction.test.ts > enhanceAnswer called**
   - Error: `expected 422 to be 200`
   - Root cause: API returning error instead of success for MQS questions

4. **tests/api/wizard-mqs-money-claim.test.ts > PAP-DEBT coverage**
   - Error: `expected false to be true`
   - Root cause: MQS missing required PAP-DEBT questions

### Error Handling & Status Codes (6 failures)

5. **tests/integration/ast-wizard-flow.test.ts > non-existent case_id**
   - Error: `expected 500 to be 404`
   - Root cause: Wrong HTTP status code for missing resource

6. **tests/api/wizard-guest-flow.test.ts > guest answer questions**
   - Error: `expected 400 to be 200`
   - Root cause: Guest flow incorrectly rejecting valid requests

7. **tests/api/notice-compliance-blocking.test.ts > compliance checkpoint (2 failures)**
   - Error: `expected 'WIZARD_GATING_BLOCKED' to be 'NOTICE_NONCOMPLIANT'`
   - Error: `expected 400 to be 200`
   - Root cause: Wrong error code/type for compliance failures

8. **tests/lib/jurisdictions/legal-enforcement.test.ts > legacy migration**
   - Error: `expected 400 to be 422`
   - Root cause: Wrong HTTP status for validation error

9. **tests/api/documents-ni-gating.test.ts > NI eviction rejection**
   - Error: `expected 'NI_EVICTION_MONEY_CLAIM_NOT_SUPPORTED' to be 'Northern Ireland only supports tenanc…'`
   - Root cause: Error message format mismatch (code vs string)

### Money Claim Integration (2 failures)

10. **tests/integration/money-claim-wizard-flow.test.ts (2 failures)**
    - Error: `expected 400 to be 200` (England & Wales)
    - Error: `expected 422 to be 200` (Scotland)
    - Root cause: Money claim flow broken; Unknown question_id errors

### Compliance Specs (2 failures)

11. **tests/notice-compliance-mqs-ids.test.ts > MQS ID coverage**
    - Error: `expected [ Array(1) ] to deeply equal []`
    - Root cause: compliance spec references question_id that doesn't exist in MQS

12. **tests/notice-compliance-spec.test.ts > hard bars and inline validations**
    - Error: `expected 0 to be greater than 0`
    - Root cause: Some notice types missing compliance rules

---

## Bucket D: Scotland Date Validation (1 failure)

1. **src/lib/documents/__tests__/template-rendering.test.ts > Scotland Notice to Leave**
   - Error: `The proposed leaving date is too early. The earliest legally valid date is 09 April 2025 (84 days from service date)`
   - Root cause: Date validation logic embedded in template rendering; likely timezone/UTC handling issue

---

## Bucket E: Misc Integration (1 failure)

1. **tests/bundles/bundle-generator.test.ts > minimal case bundle**
   - Error: `expected 'england-wales' to be 'england'`
   - Root cause: Bundle generator not migrating legacy jurisdiction to canonical form

---

## Skipped Tests (Not Counted in Failures)

- **src/app/api/wizard/generate/__tests__/api-enforcement.test.ts** - 16 skipped
  - Error: `Test environment not configured. Missing: SUPABASE_URL_TEST, SUPABASE_SERVICE_ROLE_KEY_TEST, TEST_BASE_URL`
  - Note: Environment setup issue, not a code bug

---

## Fix Priority Order

1. **Bucket B** (4 tests) - Simple path/template issues
2. **Bucket A** (8 tests) - Gating logic contract fixes
3. **Bucket C** (15 tests) - API contracts and flow
4. **Bucket D** (1 test) - Scotland date validation
5. **Bucket E** (1 test) - Bundle jurisdiction migration
