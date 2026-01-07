# Legal Validators Audit Report

**Date:** 2026-01-07
**Auditor:** Claude Code
**Branch:** claude/audit-legal-validators-Mj7Iy
**Scope:** All 6 legal document validators

---

## Executive Summary

This audit traces the full execution path and validates the implementation of all 6 legal document validators in Landlord Heaven. All validators have **real validation logic** implemented - there are no placeholder or stub implementations. However, validation accuracy is heavily dependent on AI/LLM field extraction, which introduces non-deterministic behavior.

### Key Findings

| Validator | Coverage Score | Logic Status | Risk Level |
|-----------|----------------|--------------|------------|
| Section 21 Notice | 8/10 | ✅ Real | Medium |
| Section 8 Notice | 7/10 | ✅ Real | Medium |
| Wales Notice | 6/10 | ✅ Real | High |
| Scotland Notice to Leave | 6/10 | ✅ Real | High |
| Tenancy Agreement | 5/10 | ✅ Real | High |
| Money Claim | 4/10 | ✅ Real | High |

---

## Full Execution Path (All Validators)

```
User Uploads Document
        ↓
src/app/tools/validators/<validator>/page.tsx
        ↓ (renders)
src/components/validators/ValidatorPage.tsx
        ↓ (creates case via POST /api/wizard/start)
        ↓ (user uploads file via)
src/components/wizard/fields/UploadField.tsx
        ↓ (sends file to)
POST /api/wizard/upload-evidence/route.ts [lines 121-613]
        ↓ (calls)
src/lib/evidence/analyze-evidence.ts [analyzeEvidence(), lines 1598-1959]
        ↓ (extracts text via pdf-parse, then calls OpenAI GPT-4o-mini)
        ↓ (also runs regex extraction for S21/S8/Wales/Scotland)
        ↓
src/lib/evidence/classify-document.ts [classifyDocument()]
        ↓
src/lib/evidence/merge-extracted-facts.ts [mergeExtractedFacts()]
        ↓
src/lib/validators/run-legal-validator.ts [runLegalValidator(), lines 403-564]
        ↓ (routes to appropriate validator based on product/jurisdiction)
        ↓
src/lib/validators/legal-validators.ts [validate<X>(), lines 215-938]
        ↓
Returns: ValidatorResult { status, blockers, warnings, upsell }
```

---

## 1. Section 21 Notice Validator

### Validator Summary Card

| Attribute | Value |
|-----------|-------|
| **Validator Key** | `section_21` |
| **Function** | `validateSection21Notice()` |
| **Location** | `src/lib/validators/legal-validators.ts:215-353` |
| **Jurisdiction** | England only |
| **Inputs** | PDF/image of Section 21 Form 6A |
| **Evidence Category** | `notice_s21` |
| **Extraction Method** | Regex (baseline) + LLM (GPT-4o-mini) |

**Extracted Fields** (from `analyze-evidence.ts:115-137`):
- `notice_type`, `date_served`, `service_date`, `expiry_date`
- `property_address`, `tenant_names`, `landlord_name`
- `signature_present`, `form_6a_used`, `section_21_detected`
- `deposit_protected`, `prescribed_info_served`, `gas_safety_mentioned`
- `epc_mentioned`, `how_to_rent_mentioned`

**Output Schema**:
```typescript
{
  status: 'pass' | 'warning' | 'invalid' | 'unsupported',
  blockers: ValidationIssue[],
  warnings: ValidationIssue[],
  upsell?: { product: string, reason: string, price: number }
}
```

**CTA/Upsell Logic** (lines 338-352):
- `invalid` → `complete_eviction_pack` @ £149.99
- `warning` → `complete_eviction_pack` @ £149.99
- `pass` → `notice_only_or_pack` (user choice)

**Confidence Rating**: **MEDIUM-HIGH**
- Regex provides deterministic baseline for form detection
- LLM extraction adds richness but is non-deterministic
- Compliance checks depend on user-provided answers

### Rules Table - Section 21

| Rule Name | Severity | Code | Trigger Condition | Location | Fix Guidance |
|-----------|----------|------|-------------------|----------|--------------|
| Wrong Jurisdiction | Blocker | `S21-JURISDICTION-UNSUPPORTED` | `jurisdiction !== 'england'` | lines 216-228 | Use Wales/Scotland validator |
| Wrong Form Type | Blocker | `S21-WRONG-FORM` | Notice type doesn't contain 'section 21', 's21', 'form 6a' | lines 234-248 | Use correct Form 6A |
| Notice Period Too Short | Blocker | `S21-NOTICE-PERIOD` | `expiryDate < serviceDate + 2 months` | lines 261-266 | Extend expiry date to 2+ months |
| Signature Missing | Blocker | `S21-SIGNATURE-MISSING` | `signature_present === 'no'` | lines 292-297 | Sign the notice |
| Deposit Not Protected | Blocker | `S21-DEPOSIT-PROTECTION` | `deposit_protected === 'no'` (from answers) | lines 299-315 | Protect deposit in approved scheme |
| Prescribed Info Missing | Blocker | `S21-PRESCRIBED-INFO` | `prescribed_info_served === 'no'` | lines 299-315 | Serve prescribed info |
| Gas Safety Missing | Blocker | `S21-GAS-SAFETY` | `gas_safety_pre_move_in === 'no'` | lines 299-315 | Provide gas safety cert |
| EPC Not Provided | Blocker | `S21-EPC` | `epc_provided === 'no'` | lines 299-315 | Provide valid EPC |
| How to Rent Missing | Blocker | `S21-HOW-TO-RENT` | `how_to_rent_provided === 'no'` | lines 299-315 | Provide How to Rent guide |
| Licensing Issue | Blocker | `S21-LICENSING` | `property_licensed === 'no'` | lines 299-315 | Confirm licensing position |
| Service Date Missing | Warning | `S21-SERVICE-DATE-MISSING` | Date not extracted | lines 254-255 | Check notice has clear date |
| Expiry Date Missing | Warning | `S21-EXPIRY-DATE-MISSING` | Date not extracted | lines 257-259 | Check notice has expiry |
| Property Address Missing | Warning | `S21-PROPERTY-ADDRESS-MISSING` | Not extracted | lines 273-275 | Verify address on notice |
| Tenant Name Missing | Warning | `S21-TENANT-NAME-MISSING` | Not extracted | lines 282-284 | Verify tenant names |
| Landlord Name Missing | Warning | `S21-LANDLORD-NAME-MISSING` | Not extracted | lines 288-290 | Verify landlord name |
| Signature Unknown | Warning | `S21-SIGNATURE-UNKNOWN` | `signature_present === 'unknown'` | lines 295-297 | Confirm signature present |
| Retaliatory Eviction | Warning | `S21-RETALIATORY` | `retaliatory_eviction === 'yes'` | lines 317-320 | May be blocked by council |
| Arrears Exist | Warning | `S21-ARREARS` | `rent_arrears_exist === 'yes'` | lines 322-325 | Consider Section 8 |
| Fixed Term Unknown | Warning | `S21-FIXED-TERM-UNKNOWN` | `fixed_term_status` is missing | lines 327-330 | Confirm tenancy status |

### UI Promise Match - Section 21

| UI Feature Claimed | Status | Implementation |
|-------------------|--------|----------------|
| Deposit protection verification | ✅ Implemented | Checks `deposit_protected` answer (line 300) |
| Prescribed information check | ✅ Implemented | Checks `prescribed_info_served` answer (line 301) |
| How to Rent guide compliance | ✅ Implemented | Checks `how_to_rent_provided` answer (line 304) |
| Notice period calculation | ✅ Implemented | Compares service/expiry dates (lines 261-266) |
| Form 6A compliance | ✅ Implemented | Regex + LLM detection (lines 234-248) |
| Gas safety certificate check | ✅ Implemented | Checks `gas_safety_pre_move_in` answer (line 302) |
| EPC validity check | ✅ Implemented | Checks `epc_provided` answer (line 303) |
| EICR requirements (post-2020) | ❌ Not Implemented | No EICR check exists in code |

### Test Matrix - Section 21

**Should Pass (3 scenarios)**:
1. Valid Form 6A with all compliance answers = 'yes', valid dates (2+ month period), signature present
2. Notice uploaded with minimal extraction but user confirms all requirements via follow-up questions
3. Periodic tenancy with proper Form 6A and all documentation confirmed

**Should Fail (5 scenarios)**:
| Scenario | Expected Codes |
|----------|----------------|
| Upload Scotland notice to S21 validator | `S21-JURISDICTION-UNSUPPORTED` |
| Upload random PDF (not S21) | `S21-WRONG-FORM` |
| Form 6A with expiry date < 2 months from service | `S21-NOTICE-PERIOD` |
| Deposit not protected (answer = 'no') | `S21-DEPOSIT-PROTECTION` |
| Scanned image with poor extraction, no user answers | Multiple warnings: `S21-SERVICE-DATE-MISSING`, `S21-TENANT-NAME-MISSING`, etc. |

---

## 2. Section 8 Notice Validator

### Validator Summary Card

| Attribute | Value |
|-----------|-------|
| **Validator Key** | `section_8` |
| **Function** | `validateSection8Notice()` |
| **Location** | `src/lib/validators/legal-validators.ts:355-474` |
| **Jurisdiction** | England only |
| **Inputs** | PDF/image of Section 8 Form 3 |
| **Evidence Category** | `notice_s8` |

**Extracted Fields** (from `analyze-evidence.ts:145-163`):
- `notice_type`, `grounds_cited`, `date_served`
- `notice_period`, `expiry_date`, `property_address`
- `tenant_names`, `tenant_details`, `rent_arrears_stated`
- `rent_amount`, `rent_frequency`, `mandatory_grounds`, `discretionary_grounds`

**CTA/Upsell Logic** (lines 459-473):
- `ground_8_satisfied` → `complete_eviction_pack` @ £149.99
- `discretionary_only` → `money_claim_pack` @ £179.99
- `high_risk` → `money_claim_pack` @ £179.99

**Confidence Rating**: **MEDIUM**
- Ground 8 calculation is deterministic IF values extracted correctly
- Extraction of grounds_cited array is non-deterministic

### Rules Table - Section 8

| Rule Name | Severity | Code | Trigger Condition | Location | Fix Guidance |
|-----------|----------|------|-------------------|----------|--------------|
| Wrong Jurisdiction | Blocker | `S8-JURISDICTION-UNSUPPORTED` | `jurisdiction !== 'england'` | lines 356-368 | Use correct validator |
| No Grounds Cited | Blocker | `S8-GROUNDS-MISSING` | `grounds_cited` empty or not found | lines 374-377 | Cite at least one ground |
| Service Date Missing | Warning | `S8-SERVICE-DATE-MISSING` | Not extracted | lines 379-381 | Verify date on notice |
| Notice Period Missing | Warning | `S8-NOTICE-PERIOD-MISSING` | Not extracted | lines 383-385 | Verify notice period |
| Arrears Amount Missing | Warning | `S8-ARREARS-MISSING` | Not extracted | lines 387-389 | State arrears clearly |
| Tenant Details Missing | Warning | `S8-TENANT-DETAILS-MISSING` | Not extracted | lines 391-393 | Include tenant details |
| Required Info Missing | Warning | `S8-REQUIRED-MISSING` | Any of rent_frequency/current_arrears/payment_history/joint_tenants missing | lines 395-400 | Answer follow-up questions |
| Ground 8 Incomplete | Warning | `S8-GROUND8-INCOMPLETE` | Ground 8 cited but missing rent/arrears info | lines 419-422 | Provide rent details |
| Benefit Delays | Warning | `S8-BENEFIT-DELAYS` | `benefit_delays === 'yes'` | lines 424-427 | May affect timeline |
| Disrepair Counterclaims | Warning | `S8-DISREPAIR` | `disrepair_counterclaims === 'yes'` | lines 429-432 | May reduce arrears |
| Payment Since Notice | Warning | `S8-PAYMENT-SINCE` | `payment_since_notice === 'yes'` | lines 434-437 | May affect Ground 8 |

**Ground 8 Calculation Logic** (lines 406-422):
```typescript
// Threshold calculation based on rent frequency:
if (frequency === 'weekly') threshold = rentAmount * 8;      // 8 weeks
if (frequency === 'fortnightly') threshold = rentAmount * 4; // 8 weeks
if (frequency === 'monthly') threshold = rentAmount * 2;     // 2 months
if (frequency === 'quarterly') threshold = rentAmount * 2;
if (frequency === 'yearly') threshold = rentAmount * (2/12);

ground8Satisfied = arrearsAmount >= threshold;
```

### UI Promise Match - Section 8

| UI Feature Claimed | Status | Implementation |
|-------------------|--------|----------------|
| Ground validity verification | ✅ Implemented | Checks grounds array exists (line 374) |
| Notice period calculation by ground | ⚠️ Partial | Only checks if period extracted, doesn't validate per-ground |
| Form 3 compliance check | ✅ Implemented | Regex detection of "form 3" and "section 8" |
| Mandatory vs discretionary grounds | ✅ Implemented | Ground 8 gets special handling (lines 409-422) |
| Evidence requirements per ground | ❌ Not Implemented | No ground-specific evidence checks |
| Rent arrears calculation (Ground 8) | ✅ Implemented | Full threshold calculation (lines 406-422) |
| Anti-social behavior documentation | ❌ Not Implemented | No ASB-specific checks |
| Court hearing date calculation | ❌ Not Implemented | No date calculation |

### Test Matrix - Section 8

**Should Pass**:
1. Valid Form 3 with Ground 8, £2000 monthly rent, £4500+ arrears → `ground_8_satisfied`
2. Valid Form 3 with Grounds 10, 11 (discretionary) → `discretionary_only`
3. Notice with all fields extracted, no risk factors

**Should Fail**:
| Scenario | Expected Codes |
|----------|----------------|
| Upload Wales notice | `S8-JURISDICTION-UNSUPPORTED` |
| No grounds cited in notice | `S8-GROUNDS-MISSING` |
| Ground 8 with insufficient arrears (£1500 on £1000/month) | Status: `discretionary_only` |
| Ground 8 cited but no rent amount | `S8-GROUND8-INCOMPLETE` |
| Scanned notice with poor extraction | Multiple warnings |

---

## 3. Wales Notice Validator (RHW16/RHW17/RHW23)

### Validator Summary Card

| Attribute | Value |
|-----------|-------|
| **Validator Key** | `wales_notice` |
| **Function** | `validateWalesNotice()` |
| **Location** | `src/lib/validators/legal-validators.ts:476-559` |
| **Jurisdiction** | Wales only |
| **Inputs** | PDF/image of RHW form |
| **Evidence Category** | `correspondence` |

**Extracted Fields** (from `analyze-evidence.ts:165-183`):
- `rhw_form_number`, `bilingual_text_present`, `notice_type`
- `date_served`, `expiry_date`, `contract_holder_details`
- `landlord_details`, `written_statement_referenced`
- `fitness_for_habitation_confirmed`, `deposit_protection_confirmed`
- `occupation_type`

**Confidence Rating**: **MEDIUM-LOW**
- Bilingual text detection is reasonably reliable (Welsh word markers)
- RHW form number extraction works via regex
- Compliance checks heavily depend on user answers

### Rules Table - Wales Notice

| Rule Name | Severity | Code | Trigger Condition | Location | Fix Guidance |
|-----------|----------|------|-------------------|----------|--------------|
| Wrong Jurisdiction | Blocker | `WLS-JURISDICTION-UNSUPPORTED` | `jurisdiction !== 'wales'` | lines 477-489 | Use correct validator |
| Not Bilingual | Blocker | `WLS-BILINGUAL` | `bilingual_text_present === 'no'` | lines 495-500 | Must be in English + Welsh |
| Written Statement Missing | Blocker | `WLS-WRITTEN-STATEMENT` | `written_statement_provided === 'no'` | lines 502-515 | Provide written statement |
| Deposit Not Protected | Blocker | `WLS-DEPOSIT` | `deposit_protected === 'no'` | lines 502-515 | Protect deposit |
| Occupation Type Unknown | Blocker | `WLS-OCCUPATION-TYPE` | `occupation_type_confirmed === 'no'` | lines 502-515 | Confirm contract type |
| Fitness Issues | Blocker | `WLS-FITNESS` | `fitness_for_habitation === 'yes'` (issues exist) | lines 517-522 | Resolve fitness issues |
| Bilingual Unknown | Warning | `WLS-BILINGUAL-UNKNOWN` | Cannot determine | lines 498-500 | Verify bilingual text |
| Retaliatory Eviction | Warning | `WLS-RETALIATORY` | `retaliatory_eviction === 'yes'` | lines 524-527 | Risk may apply |
| Council Involvement | Warning | `WLS-COUNCIL` | `council_involvement === 'yes'` | lines 529-532 | May delay proceedings |

### UI Promise Match - Wales Notice

| UI Feature Claimed | Status | Implementation |
|-------------------|--------|----------------|
| RHW16 no-fault notice check | ⚠️ Partial | Detects RHW form number but no specific form logic |
| RHW17 breach notice check | ⚠️ Partial | Detects RHW form number but no specific form logic |
| RHW23 landlord possession notice | ⚠️ Partial | Detects RHW form number but no specific form logic |
| Written statement compliance | ✅ Implemented | Checks `written_statement_provided` answer |
| Notice period verification | ❌ Not Implemented | No notice period calculation |
| Contract-holder rights check | ⚠️ Partial | Only checks occupation type confirmed |
| Fitness for human habitation | ✅ Implemented | Checks `fitness_for_habitation` answer |
| Deposit protection (Wales) | ✅ Implemented | Checks `deposit_protected` answer |

### Test Matrix - Wales Notice

**Should Pass**:
1. Valid RHW16 with Welsh+English text, all compliance answers = 'yes'
2. RHW17 with proper bilingual text and confirmed occupation type
3. Notice with confirmed fitness for habitation

**Should Fail**:
| Scenario | Expected Codes |
|----------|----------------|
| Upload England S21 notice | `WLS-JURISDICTION-UNSUPPORTED` |
| English-only notice | `WLS-BILINGUAL` |
| Written statement not provided | `WLS-WRITTEN-STATEMENT` |
| Unresolved fitness issues | `WLS-FITNESS` |
| Scanned form with no Welsh detected | `WLS-BILINGUAL-UNKNOWN` (warning) |

---

## 4. Scotland Notice to Leave Validator

### Validator Summary Card

| Attribute | Value |
|-----------|-------|
| **Validator Key** | `scotland_notice_to_leave` |
| **Function** | `validateScotlandNoticeToLeave()` |
| **Location** | `src/lib/validators/legal-validators.ts:561-676` |
| **Jurisdiction** | Scotland only |
| **Inputs** | PDF/image of Notice to Leave |
| **Evidence Category** | `correspondence` |

**Extracted Fields** (from `analyze-evidence.ts:185-202`):
- `ground_cited`, `ground_description`, `notice_period`
- `date_served`, `property_address`, `tenant_name`
- `ground_mandatory`, `ground_evidence_mentioned`
- `tenancy_start_date`, `tribunal_reference`

**Confidence Rating**: **MEDIUM-LOW**
- Ground detection works via regex (patterns for 18 grounds)
- PRT detection is reliable (regex markers)
- First-tier Tribunal references detected

### Rules Table - Scotland Notice to Leave

| Rule Name | Severity | Code | Trigger Condition | Location | Fix Guidance |
|-----------|----------|------|-------------------|----------|--------------|
| Wrong Jurisdiction | Blocker | `NTL-JURISDICTION-UNSUPPORTED` | `jurisdiction !== 'scotland'` | lines 562-574 | Use correct validator |
| Ground Missing | Blocker | `NTL-GROUND-MISSING` | `ground_cited` not found | lines 580-581 | Specify eviction ground |
| Tribunal Service Issue | Blocker | `NTL-TRIBUNAL-SERVICE` | `tribunal_served === 'no'` | lines 618-623 | Serve notice correctly |
| Notice Period Missing | Warning | `NTL-PERIOD-MISSING` | Not extracted | lines 584-586 | Verify notice period |
| Address Missing | Warning | `NTL-ADDRESS-MISSING` | Not extracted | lines 593-595 | Include property address |
| Tenant Missing | Warning | `NTL-TENANT-MISSING` | Not extracted | lines 602-604 | Include tenant name |
| Evidence Missing | Warning | `NTL-EVIDENCE-MISSING` | `ground_evidence === 'no'` | lines 606-611 | Provide supporting evidence |
| Evidence Unknown | Warning | `NTL-EVIDENCE-UNKNOWN` | Cannot determine | lines 609-611 | Confirm evidence available |
| Tenancy Length Unknown | Warning | `NTL-TENANCY-LENGTH` | `tenancy_length_confirmed === 'unknown'` | lines 613-616 | Confirm start date |
| Tribunal Unknown | Warning | `NTL-TRIBUNAL-UNKNOWN` | Cannot confirm service | lines 621-623 | Verify proper service |
| Covid Protections | Warning | `NTL-COVID` | `covid_protections === 'yes'` | lines 625-628 | May affect notice period |
| Rent Pressure Zone | Warning | `NTL-RPZ` | `rent_pressure_zone === 'yes'` | lines 630-633 | Rules may differ |
| Disrepair Issues | Warning | `NTL-DISREPAIR` | `disrepair === 'yes'` | lines 635-638 | May weaken grounds |

### UI Promise Match - Scotland Notice to Leave

| UI Feature Claimed | Status | Implementation |
|-------------------|--------|----------------|
| PRT ground verification | ✅ Implemented | Checks ground_cited exists |
| Notice period calculation | ⚠️ Partial | Extracts period but doesn't validate per-ground |
| Prescribed form compliance | ⚠️ Partial | Detects Notice to Leave but no form-specific validation |
| Rent arrears calculation | ❌ Not Implemented | No arrears threshold check |
| Anti-social behavior grounds | ❌ Not Implemented | No ASB-specific logic |
| Landlord selling/moving in | ❌ Not Implemented | No ground-specific checks |
| First-tier Tribunal readiness | ⚠️ Partial | Only checks tribunal_served |
| Evidence requirements | ⚠️ Partial | Generic evidence check, not ground-specific |

### Test Matrix - Scotland Notice to Leave

**Should Pass**:
1. Valid Notice to Leave with Ground 12 (rent arrears), evidence confirmed, tribunal served
2. Ground 1 (selling property) with proper documentation
3. Notice with all key fields extracted and evidence confirmed

**Should Fail**:
| Scenario | Expected Codes |
|----------|----------------|
| Upload England S21 notice | `NTL-JURISDICTION-UNSUPPORTED` |
| Notice with no ground specified | `NTL-GROUND-MISSING` |
| Notice not served to tribunal | `NTL-TRIBUNAL-SERVICE` |
| Missing evidence for ground | `NTL-EVIDENCE-MISSING` or `NTL-EVIDENCE-UNKNOWN` |
| Scanned notice with poor extraction | Multiple warnings |

---

## 5. Tenancy Agreement Validator

### Validator Summary Card

| Attribute | Value |
|-----------|-------|
| **Validator Key** | `tenancy_agreement` |
| **Function** | `validateTenancyAgreement()` |
| **Location** | `src/lib/validators/legal-validators.ts:678-732` |
| **Jurisdiction** | All (England/Wales/Scotland/NI) |
| **Inputs** | PDF/image of tenancy agreement |
| **Evidence Category** | `tenancy_agreement` |

**Extracted Fields** (from `analyze-evidence.ts:78-113`):
- `tenancy_type`, `start_date`, `end_date`, `rent_amount`
- `rent_frequency`, `deposit_amount`, `deposit_scheme`
- `property_address`, `tenant_names`, `landlord_name`
- `prohibited_fees_present`, `unfair_terms_present`, `missing_clauses`
- `jurisdiction`

**CTA/Upsell Logic** (lines 717-731):
- `needs_update` → `premium_tenancy_agreement` @ £14.99
- `non_compliant` → `premium_tenancy_agreement` @ £14.99
- `compliant` → `no_hard_sell` (suggest standard)

**Confidence Rating**: **LOW-MEDIUM**
- Compliance flags (prohibited_fees, unfair_terms) are entirely LLM-determined
- No deterministic rules for fee/term detection

### Rules Table - Tenancy Agreement

| Rule Name | Severity | Code | Trigger Condition | Location | Fix Guidance |
|-----------|----------|------|-------------------|----------|--------------|
| Jurisdiction Unknown | Warning | `TA-JURISDICTION-MISSING` | Not determined | lines 682-685 | Confirm property location |
| Tenancy Type Unknown | Warning | `TA-INTENDED-USE` | `intended_use` missing | lines 687-690 | Specify AST/PRT/OC |
| Prohibited Fees Found | Blocker | `TA-PROHIBITED-FEES` | `prohibited_fees_present === 'yes'` | lines 692-695 | Remove banned fees |
| Unfair Terms Found | Blocker | `TA-UNFAIR-TERMS` | `unfair_terms_present === 'yes'` | lines 697-700 | Remove unfair terms |
| Missing Clauses | Warning | `TA-MISSING-CLAUSES` | `missing_clauses === 'yes'` | lines 702-705 | Add required clauses |

### UI Promise Match - Tenancy Agreement

| UI Feature Claimed | Status | Implementation |
|-------------------|--------|----------------|
| Required clauses check | ⚠️ Partial | LLM-detected `missing_clauses` flag (non-deterministic) |
| Unfair terms identification | ⚠️ Partial | LLM-detected `unfair_terms_present` flag |
| Deposit protection terms | ❌ Not Implemented | No specific deposit clause check |
| Break clause validation | ❌ Not Implemented | No break clause analysis |
| Rent review provisions | ❌ Not Implemented | No rent review check |
| Notice periods compliance | ❌ Not Implemented | No notice period check |
| HMO-specific terms | ❌ Not Implemented | No HMO detection |
| PRT/Occupation Contract compliance | ⚠️ Partial | Only checks tenancy_type, no specific compliance rules |

### Test Matrix - Tenancy Agreement

**Should Pass**:
1. Valid AST with no prohibited fees, no unfair terms, all required clauses
2. Scotland PRT agreement with proper terms
3. Wales Occupation Contract with compliant structure

**Should Fail**:
| Scenario | Expected Codes |
|----------|----------------|
| Agreement with admin fee £100 | `TA-PROHIBITED-FEES` |
| Agreement with one-sided break clause | `TA-UNFAIR-TERMS` |
| Agreement missing deposit protection clause | `TA-MISSING-CLAUSES` |
| Generic document, no agreement detected | Multiple warnings |
| Jurisdiction not determinable | `TA-JURISDICTION-MISSING` |

---

## 6. Money Claim Validator

### Validator Summary Card

| Attribute | Value |
|-----------|-------|
| **Validator Key** | `money_claim` |
| **Function** | `validateMoneyClaim()` |
| **Location** | `src/lib/validators/legal-validators.ts:734-778` |
| **Jurisdiction** | All |
| **Inputs** | PDF/image of arrears documentation |
| **Evidence Category** | `rent_schedule` |

**Extracted Fields** (from `analyze-evidence.ts:204-226`):
- `claim_amount`, `arrears_breakdown`, `claim_period`
- `parties`, `rent_amount`, `rent_frequency`
- `payment_history`, `last_payment_date`, `outstanding_balance`
- `lba_sent`, `lba_date`, `response_received`, `payment_plan_offered`

**CTA/Upsell Logic** (lines 763-777):
- `claim_ready` → `money_claim_pack` @ £179.99
- `missing_steps` → `guidance_checklist`
- `high_risk` → `guidance_checklist`

**Confidence Rating**: **LOW**
- Very minimal validation logic
- Relies almost entirely on `pre_action_steps` answer

### Rules Table - Money Claim

| Rule Name | Severity | Code | Trigger Condition | Location | Fix Guidance |
|-----------|----------|------|-------------------|----------|--------------|
| Pre-Action Not Complete | Blocker | `MC-PRE-ACTION` | `pre_action_steps !== 'yes'` | lines 738-741 | Send LBA first |
| Joint Liability Unknown | Warning | `MC-JOINT-LIABILITY` | `joint_liability_confirmed === 'unknown'` | lines 743-746 | Confirm joint liability |
| Payments Since Notice | Warning | `MC-PAYMENTS-SINCE` | `payments_since === 'yes'` | lines 748-751 | May affect claim value |

### UI Promise Match - Money Claim

| UI Feature Claimed | Status | Implementation |
|-------------------|--------|----------------|
| Arrears schedule completeness | ❌ Not Implemented | No schedule validation |
| Pre-action protocol compliance | ✅ Implemented | Checks `pre_action_steps` |
| Letter before action check | ✅ Implemented | Part of pre_action_steps |
| Interest calculation | ❌ Not Implemented | No interest calculation |
| Evidence bundle review | ❌ Not Implemented | No evidence validation |
| Particulars of claim | ❌ Not Implemented | No PoC validation |
| N1/Form 3A compliance | ❌ Not Implemented | No form validation |
| Witness statement requirements | ❌ Not Implemented | No witness statement check |

### Test Matrix - Money Claim

**Should Pass**:
1. Pre-action steps completed (LBA sent), joint liability confirmed, no payments since
2. Rent schedule with clear arrears breakdown, LBA response received

**Should Fail**:
| Scenario | Expected Codes |
|----------|----------------|
| No LBA sent | `MC-PRE-ACTION` |
| Joint tenants but liability unknown | `MC-JOINT-LIABILITY` |
| Partial payments made since notice | `MC-PAYMENTS-SINCE` |
| Random document (not arrears related) | `MC-PRE-ACTION` (defaults to 'no') |
| Missing rent schedule | No specific blocker (weakness) |

---

## Risk Assessment & Weaknesses

### Critical Dependencies

1. **LLM Extraction (GPT-4o-mini)** - `analyze-evidence.ts:1489-1517, 1421-1483`
   - All field extraction beyond basic regex relies on OpenAI
   - If `OPENAI_API_KEY` missing, falls back to regex-only (limited fields)
   - Non-deterministic: same document may extract differently on retry
   - **Risk**: False positives/negatives possible

2. **Regex Fallback** - `analyze-evidence.ts:361-523, 546-748, 769-917, 939-1113`
   - Provides deterministic baseline for S21/S8/Wales/Scotland
   - Detects key markers: Form 6A, Section 21, RHW form numbers, Notice to Leave
   - Limited field extraction without LLM
   - **Risk**: May miss fields in non-standard documents

3. **User Answers** - `run-legal-validator.ts:282-401`
   - Critical compliance checks (deposit_protected, gas_safety, etc.) come from user answers
   - If user doesn't answer, defaults to 'unknown' which produces warnings
   - **Risk**: User can self-certify compliance falsely

4. **PDF Text Extraction** - `extract-pdf-text.ts` (referenced, not read)
   - Scanned PDFs produce "low text" triggering vision fallback
   - Vision extraction via Puppeteer PDF rendering + GPT-4o-mini
   - **Risk**: Scanned/image PDFs have lower accuracy

### Scenarios Where "Valid" Status May Be Wrong

1. **False Positive (Says valid, isn't)**:
   - User answers all compliance questions 'yes' falsely
   - LLM misses prohibited fees in tenancy agreement
   - Notice dates extracted incorrectly (wrong date format parsing)
   - Bilingual detection false positive (similar-looking words)

2. **False Negative (Says invalid, is)**:
   - Low-quality scan fails to extract Form 6A markers
   - Welsh language OCR errors break bilingual detection
   - Ground 8 arrears amount extracted incorrectly (currency parsing)

### Missing Checks That Reduce Confidence

1. **Section 21**: No EICR check (mentioned in UI, not implemented)
2. **Section 8**: No per-ground notice period validation, no ASB evidence checks
3. **Wales**: No RHW form-specific logic (RHW16 vs RHW17 vs RHW23)
4. **Scotland**: No per-ground validation, no 28-day vs 84-day period logic
5. **Tenancy Agreement**: No specific clause detection, entirely LLM-dependent
6. **Money Claim**: Minimal validation, no schedule/interest/form checks

---

## Final Scores & Recommendations

### Validator Coverage Scores

| Validator | Score | Rationale |
|-----------|-------|-----------|
| Section 21 | **8/10** | Most complete. 10+ rules, date calculation, multi-source extraction. Missing EICR. |
| Section 8 | **7/10** | Good Ground 8 logic. Missing per-ground period validation, ASB checks. |
| Wales Notice | **6/10** | Basic bilingual detection. No form-specific validation or period checks. |
| Scotland NTL | **6/10** | Ground detection works. No per-ground requirements or period calculation. |
| Tenancy Agreement | **5/10** | Entirely LLM-dependent. No deterministic clause checking. |
| Money Claim | **4/10** | Minimal. Only checks pre-action steps. Missing most UI-claimed features. |

### Top 5 Missing Rules (Would Increase Trust & Revenue)

1. **EICR Check for Section 21** - Required since July 2020. Would catch many invalid notices.
2. **Per-Ground Notice Period Validation (S8)** - 2 weeks vs 2 months depends on ground.
3. **RHW Form-Specific Logic (Wales)** - Different forms have different requirements.
4. **Scotland Ground-Specific Validation** - 18 grounds with different evidence/period requirements.
5. **Tenancy Agreement Clause Detection** - Deterministic detection of required clauses vs LLM-only.

### Top 5 Quick Wins (Small Changes, High Impact)

1. **Add EICR question** to Section 21 required checks (copy gas_safety pattern, ~10 lines)
2. **Enhance regex patterns** for date extraction to handle more UK date formats (DD Month YYYY)
3. **Add confidence indicators** to UI showing extraction quality (already tracked, not displayed)
4. **Add "unknown" default handling** - prompt users to answer rather than soft-fail with warnings
5. **Add document type mismatch detection** - warn if uploaded document doesn't match validator (e.g., S8 to S21)

---

## Appendix: Code Reference Quick Links

| Component | File | Key Lines |
|-----------|------|-----------|
| Section 21 Validator | `legal-validators.ts` | 215-353 |
| Section 8 Validator | `legal-validators.ts` | 355-474 |
| Wales Validator | `legal-validators.ts` | 476-559 |
| Scotland Validator | `legal-validators.ts` | 561-676 |
| Tenancy Validator | `legal-validators.ts` | 678-732 |
| Money Claim Validator | `legal-validators.ts` | 734-778 |
| Validator Router | `run-legal-validator.ts` | 403-564 |
| Evidence Analysis | `analyze-evidence.ts` | 1598-1959 |
| S21 Regex Extraction | `analyze-evidence.ts` | 361-523 |
| S8 Regex Extraction | `analyze-evidence.ts` | 546-748 |
| Wales Regex Extraction | `analyze-evidence.ts` | 769-917 |
| Scotland Regex Extraction | `analyze-evidence.ts` | 939-1113 |
| LLM Prompts | `analyze-evidence.ts` | 77-227 |
| CTA Mapper | `cta-mapper.ts` | 114-172 |
| Document Classifier | `classify-document.ts` | 162-368 |
| Merge Extracted Facts | `merge-extracted-facts.ts` | 223-323 |

---

*Audit completed 2026-01-07. No code modifications made.*
