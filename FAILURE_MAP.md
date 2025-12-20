# Test Failure Map - 19 Failing Tests (Current Run)

**Test Summary**: 19 failed | 383 passed | 14 test files failed

---

## PHASE 1: BUCKET A - Gating Tests (8 failures from wizard-gating.test.ts)

### A1. Ground 8 Threshold Gating (4 tests - Gate 1)

1. **should block Ground 8 when arrears < 2 months**
   - Expected: 1 blocking issue
   - Actual: 13 blocking issues
   - Root cause: Ground 8 gate not firing; all other validations failing instead

2. **should allow Ground 8 when arrears >= 2 months**
   - Expected: 0 blocking issues
   - Actual: 12 blocking issues
   - Root cause: Gate not recognizing Ground 8 scenario

3. **should warn when arrears are borderline (2-3 months)**
   - Expected: 0 blocking issues (with warnings)
   - Actual: 12 blocking issues
   - Root cause: Same as above

4. **should allow weekly rent with sufficient arrears**
   - Expected: 0 blocking issues
   - Actual: 12 blocking issues
   - Root cause: Same as above

### A2. Section 21 Route Blockers (3 tests - Gate 3)

5. **should block Section 21 when deposit is not protected**
   - Expected: true (isBlocked)
   - Actual: false
   - Root cause: Section 21 gate not firing; not recognizing section_21 route

6. **should block Section 21 when gas cert not provided**
   - Expected: true (isBlocked)
   - Actual: false
   - Root cause: Same as above

7. **should allow Section 21 when all compliance requirements met**
   - Expected: 0 blocking issues
   - Actual: 3 blocking issues
   - Root cause: Even compliant Section 21 shows blocks

### A3. Ground Particulars Completeness (1 test - Gate 4)

8. **should block when ground particulars are missing for selected grounds**
   - Expected message: "Ground(s): 8, 11"
   - Actual message: "Ground 8 is missing required fact: rent_amount_monthly"
   - Root cause: Message format changed or only checking first ground

---

## PHASE 2: BUCKET C - Wizard Flow / API Contract Tests (11 failures)

### C1. MQS Question ID / Routing Issues (6 tests)

9. **wizard-info-questions.test.ts > returns info-type question (section21_intro) once**
   - Expected: "section21_intro"
   - Actual: "landlord_details"
   - Root cause: section21_intro not in MQS or skipped in routing

10. **wizard-info-questions.test.ts > does not get stuck in loop on info questions**
    - Expected: "section21_intro"
    - Actual: "landlord_details"
    - Root cause: Same as #9

11. **wizard-money-claim-access.test.ts > allows England & Wales money claim cases**
    - Expected: "claimant_full_name" (first question)
    - Actual: "basis_of_claim"
    - Root cause: MQS question order changed

12. **wizard-mqs-money-claim.test.ts > includes PAP-DEBT questions**
    - Expected: true (question IDs exist)
    - Actual: false
    - Root cause: MQS question IDs changed or not loaded for England

13. **notice-compliance-mqs-ids.test.ts > all affected_question_id values exist in MQS**
    - Expected: [] (no missing IDs)
    - Actual: Array(1) (one missing ID)
    - Root cause: Compliance spec references non-existent question_id

14. **notice-compliance-spec.test.ts > defines hard bars and inline validations**
    - Expected: > 0 specs
    - Actual: 0 specs
    - Root cause: Spec loading failure or jurisdiction mismatch

### C2. Error Code / Status Code Mismatches (5 tests)

15. **notice-compliance-blocking.test.ts > returns 422 with NOTICE_NONCOMPLIANT**
    - Expected error code: "NOTICE_NONCOMPLIANT"
    - Actual error code: "WIZARD_GATING_BLOCKED"
    - Root cause: Wrong error code for compliance vs gating

16. **notice-compliance-blocking.test.ts > allows non-checkpoint questions with warnings**
    - Expected status: 200
    - Actual status: 400
    - Root cause: Non-checkpoint validation too strict

17. **wizard-mqs-eviction.test.ts > enhanceAnswer is called for MQS questions**
    - Expected status: 200
    - Actual status: 422
    - Root cause: Validation blocking MQS question answer

18. **wizard-guest-flow.test.ts > allows guest to answer questions**
    - Expected status: 200
    - Actual status: 400
    - Root cause: Guest validation too strict or auth issue

19. **legal-enforcement.test.ts > migrates legacy England & Wales cases**
    - Expected status: 422
    - Actual status: 400
    - Root cause: Status code inconsistency for legal blocks

---

## Additional Failures Not in Main Buckets

### Document Generation Tests (5 tests)

20. **documents-ni-gating.test.ts > rejects NI eviction document generation**
    - Expected: "Northern Ireland only supports tenancy agreement documents"
    - Actual: "NI_EVICTION_MONEY_CLAIM_NOT_SUPPORTED"
    - Root cause: Error message is code instead of user message

21. **bundles/bundle-generator.test.ts > should generate bundle for minimal case**
    - Expected: "england"
    - Actual: "england-wales"
    - Root cause: CRITICAL - Legacy "england-wales" in fixture/code

22. **ast-pack-premium.test.ts > renders premium-only content**
    - Expected: contains "HMO & Shared Facilities"
    - Actual: missing
    - Root cause: Template path or fixture issue

23. **ast-pack-standard.test.ts > renders standard AST pack**
    - Expected: contains "Legal Validity Summary"
    - Actual: missing
    - Root cause: Template path or fixture issue

24. **pdf-field-mapping.test.ts > matches critical N5 fields**
    - Expected: true (fields match)
    - Actual: false
    - Root cause: PDF fixture or field mapping drift

### Integration Flow Tests (5 tests)

25. **ast-wizard-flow.test.ts > should reject non-existent case_id**
    - Expected status: 404
    - Actual status: 500
    - Root cause: Error handling returns 500 instead of 404

26. **money-claim-wizard-flow.test.ts > England & Wales money claim pack generation**
    - Expected status: 200
    - Actual status: 400
    - Root cause: Question answer validation or MQS issue

27. **money-claim-wizard-flow.test.ts > Scotland money claim flow**
    - Expected status: 200
    - Actual status: 422
    - Root cause: Validation blocking answer

28. **eviction-pack-option-b.test.ts > produces Scotland tribunal forms**
    - Expected: (not shown in grep)
    - Actual: (not shown)
    - Root cause: Template rendering or path issue

29. **template-rendering.test.ts > No raw markdown tokens in Scotland Notice to Leave**
    - Expected: (not shown in grep)
    - Actual: (not shown)
    - Root cause: Template compilation issue

30. **api-enforcement.test.ts > API Enforcement - Real Pattern (Integration)**
    - Status: 16 tests SKIPPED (not failed)
    - Root cause: Missing env vars (SUPABASE_URL_TEST, etc.)

---

## Fix Strategy Summary

**PHASE 1 - Bucket A (8 gating tests)**:
- Fix Section 21 route recognition (tests 5-7)
- Fix Ground 8 threshold gating (tests 1-4)
- Fix Ground Particulars message (test 8)

**PHASE 2 - Bucket C (11 main wizard/API tests)**:
- Fix MQS question routing (#9-14)
- Fix error codes and status codes (#15-19)

**Additional fixes** (if time permits):
- Critical: Fix "england-wales" → "england" (#21)
- Document generation tests (#20, #22-24)
- Integration flow tests (#25-29)
