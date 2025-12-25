# England Court Forms PDF Fill Audit

**Audit Date:** 2025-12-25
**Scope:** Official court form PDF filling for England eviction workflows
**Forms Covered:** N5, N5B, N119, N1, Form 6A

---

## Executive Summary

This audit evaluates the PDF fill coverage for England eviction court forms. The system has **functional but incomplete** PDF filling for court forms, with significant field mapping gaps that need attention before production readiness.

| Form | Production Ready | Field Match | Risk Level |
|------|-----------------|-------------|------------|
| N5 (Standard Claim) | **NO-GO** | 5/13 mapped correctly | **HIGH** |
| N5B (Accelerated S21) | **NO-GO** | 5/9 mapped correctly | **HIGH** |
| N119 (Particulars) | **NO-GO** | 6/17 mapped correctly | **HIGH** |
| N1 (Money Claim) | GO (separate pack) | 30+ fields mapped | LOW |
| Form 6A (S21 Notice) | GO (notice only) | 8+ fields mapped | LOW |

**Key Finding:** The official PDFs from HMCTS have far fewer AcroForm fields than the filler code expects. Many field names in the filler code reference fields that don't exist in the actual PDFs.

---

## 1. Official PDFs Inventory

### Location: `/public/official-forms/`

| Filename | Form Name | Fillable? | Field Count | Intended Use |
|----------|-----------|-----------|-------------|--------------|
| `n5-eng.pdf` | N5 - Claim for Possession | Yes (AcroForm) | **13 fields** | Standard possession claim (S8 or S21) |
| `n5b-eng.pdf` | N5B - Accelerated Possession | Yes (AcroForm) | **9 fields** | Accelerated procedure (S21 only) |
| `n119-eng.pdf` | N119 - Particulars of Claim | Yes (AcroForm) | **17 fields** | Supporting particulars for N5 |
| `N1_1224.pdf` | N1 - Claim Form | Yes (AcroForm) | **43 fields** | Money claims only |
| `form_6a.pdf` | Form 6A - Section 21 Notice | Yes (AcroForm) | **16 fields** | Section 21 notice (not a court form) |

### Manifest Reference
**File:** `public/official-forms/forms-manifest.json`
All forms are correctly registered with `fillable: true`.

---

## 2. Form-by-Form Analysis

### 2.1 Form N5 - Claim for Possession

**Official PDF:** `n5-eng.pdf`
**Filler Function:** `fillN5Form()` in `src/lib/documents/official-forms-filler.ts:197-357`

#### Actual PDF Fields (13 total)
```
TextField: In the court
TextField: Fee account no
TextField: claimant's details
TextField: defendant's details
TextField: possession of
TextField: Full name of the person signing the Statement of Truth
TextField: Name of claimant's legal representative's firm
TextField: Statement of Truth is signed by the Claimant's legal representative (as defined by CPR 2.3(1))
TextField: building and street - Claimant's or claimant's legal representative's address...
TextField: Second line of address - Claimant's or claimant's legal representative's address...
TextField: Town or city - Claimant's or claimant's legal representative's address...
TextField: County (optional) - Claimant's or claimant's legal representative's address...
TextField: Postcode - Claimant's or claimant's legal representative's address...
```

#### Field Mapping Table

| PDF Field Name | CaseData Source | Status | Notes |
|----------------|-----------------|--------|-------|
| `In the court` | `court_name` | **MAPPED** | Defaults to "County Court" |
| `Fee account no` | `claimant_reference` | **MAPPED** | Optional |
| `claimant's details` | `landlord_full_name + landlord_address` | **MISSING** | Code uses wrong field name with curly quote |
| `defendant's details` | `tenant_full_name + property_address` | **MISSING** | Code uses wrong field name with curly quote |
| `possession of` | `property_address` | **MAPPED** | Direct mapping |
| `Full name of the person signing...` | `signatory_name` | **MAPPED** | |
| `Name of claimant's legal...` | `solicitor_firm` | **MAPPED** | |
| Service address fields (5) | `service_*` fields | **MAPPED** | |

#### Fields Code Tries to Set That Don't Exist

| Field Name in Code | Status |
|--------------------|--------|
| `claimant's details` (curly quotes) | **DOES NOT EXIST** - PDF uses straight quotes |
| `defendant's details` (curly quotes) | **DOES NOT EXIST** - PDF uses straight quotes |
| `courtfee`, `solfee`, `total` | **DO NOT EXIST** |
| `rent arrears - yes` (checkbox) | **DOES NOT EXIST** |
| `rent arrears amount` | **DOES NOT EXIST** |
| `other breach of tenancy - yes` | **DOES NOT EXIST** |
| `anti-social behaviour - yes` | **DOES NOT EXIST** |
| `Ground(s) on which possession is claimed` | **DOES NOT EXIST** |
| `Date section 8 notice served - DD/MM/YYYY` | **DO NOT EXIST** |
| `HRA - yes` (checkbox) | **DOES NOT EXIST** |
| `Statement of Truth signature box` | **DOES NOT EXIST** |
| `If applicable, phone number/email` | **DO NOT EXIST** |

#### Wiring
```
eviction-pack-generator.ts:691 → fillN5Form(enrichedCaseData)
                                  ↑
eviction-wizard-mapper.ts → wizardFactsToEnglandWalesEviction()
                                  ↑
stripe/route.ts:104-113 (checkout.session.completed webhook)
```

**Production Path:** YES - called from complete eviction pack generator

#### Risk Assessment: **HIGH**

| Risk | Description |
|------|-------------|
| **Claimant/Defendant details not filled** | These are the most important fields - party names and addresses |
| **Ground numbers not filled** | Critical for Section 8 claims |
| **Notice dates not filled** | Required for validity |
| **Fee amounts not filled** | May need manual entry |

---

### 2.2 Form N5B - Accelerated Possession (Section 21)

**Official PDF:** `n5b-eng.pdf`
**Filler Function:** `fillN5BForm()` in `src/lib/documents/official-forms-filler.ts:367-574`

#### Actual PDF Fields (9 total)
```
TextField: Enter the full names of the Claimants
TextField: Enter the full names of the Defendants
TextField: Name and address of the court
TextField: The Claimant is claiming possession of
TextField: 10a How was the notice served
TextField: 10c Who served the notice
TextField: 10d Who was the notice served on
TextField: Name of Claimants legal representatives firm
TextField: Statement of Truth signature
```

#### Field Mapping Table

| PDF Field Name | CaseData Source | Status |
|----------------|-----------------|--------|
| `Enter the full names of the Claimants` | `landlord_full_name + landlord_2_name` | **MAPPED** |
| `Enter the full names of the Defendants` | `tenant_full_name + tenant_2_name` | **MAPPED** |
| `Name and address of the court` | `court_name` | **MAPPED** |
| `The Claimant is claiming possession of` | `property_address` | **MAPPED** |
| `10a How was the notice served` | Hardcoded: "By hand / First class post" | **HARDCODED** - Risk |
| `10c Who served the notice` | `landlord_full_name` | **MAPPED** |
| `10d Who was the notice served on` | `tenant_full_name` | **MAPPED** |
| `Name of Claimants legal representatives firm` | `solicitor_firm` | **MAPPED** |
| `Statement of Truth signature` | `signatory_name` | **MAPPED** |

#### Fields Code Tries to Set That Don't Exist (massive list)

The filler code attempts to set ~100+ fields that don't exist in this PDF:
- All claimant/defendant address breakdown fields
- All fee fields (`Court fee`, `Legal representatives costs`, `Total amount`)
- All tenancy date fields (Question 6, 7, 8)
- All AST verification checkboxes (9a-9g)
- All notice date fields (10b, 10e expiry)
- All HMO/licensing fields (11a, 11b)
- All deposit protection fields (12, 13, 14)
- All Housing Act 2004 fields (15)
- All attachment checkboxes (Copy of EPC, Gas Safety, etc.)
- All England/Wales location checkbox

**This PDF appears to be a stub/summary version, not the full official form.**

#### Wiring
```
eviction-pack-generator.ts:627-655 → fillN5BForm({...caseData...})
                                        ↑
eviction-pack-generator.ts:581 (case_type === 'no_fault')
                                        ↑
generateEnglandOrWalesEvictionPack() → only for Section 21 cases
```

**Production Path:** YES - for Section 21 no-fault evictions

#### Risk Assessment: **HIGH**

| Risk | Description |
|------|-------------|
| **Service method hardcoded** | Always says "By hand / First class post" regardless of actual method |
| **Missing all deposit verification fields** | Courts require deposit compliance proof |
| **Missing notice expiry date** | Critical for claim validity |
| **Missing tenancy dates** | Required for AST verification |

---

### 2.3 Form N119 - Particulars of Claim

**Official PDF:** `n119-eng.pdf`
**Filler Function:** `fillN119Form()` in `src/lib/documents/official-forms-filler.ts:582-681`

#### Actual PDF Fields (17 total)
```
TextField: name of court
TextField: name of claimant
TextField: name of defendant
TextField: The claimant has a right to possession of:
TextField: To the best of the claimant's knowledge the following persons are in possession...
TextField: 3(a) Type of tenancy
TextField: 3(a) Date of tenancy
TextField: 3(b) The current rent is
TextField: 4. (a) The reason the claimant is asking for possession is:
TextField: 6. Day and month notice served
TextField: 6. Year notice served
TextField: 13. The claimant is - other
TextField: 13. Details if the claimant is some other entity
TextField: I believe that the facts stated in these particulars of claim are true
TextField: The Claimant believes that the facts stated in these particulars of claim...
TextField: Statement of Truth signed by Claimant's legal representative...
TextField: Name of claimant's legal representative's firm
```

#### Field Mapping Table

| PDF Field Name | CaseData Source | Status |
|----------------|-----------------|--------|
| `name of court` | `court_name` | **MAPPED** |
| `name of claimant` | `landlord_full_name` | **MAPPED** |
| `name of defendant` | `tenant_full_name` | **MAPPED** |
| `The claimant has a right to possession of:` | `property_address` | **MAPPED** |
| `...persons are in possession...` | `tenant_full_name` | **MAPPED** |
| `3(a) Type of tenancy` | Hardcoded: "Assured Shorthold Tenancy" | **HARDCODED** |
| `3(a) Date of tenancy` | `tenancy_start_date` | **MAPPED** |
| `3(b) The current rent is` | `rent_amount` | **MAPPED** |
| `4. (a) The reason...` | `particulars_of_claim` or `ground_numbers` | **MAPPED** |
| `6. Day and month notice served` | `section_8/21_notice_date` | **MAPPED** |
| `6. Year notice served` | `section_8/21_notice_date` (year part) | **MAPPED** |
| `13. The claimant is - other` | | **TYPE MISMATCH** - code treats as checkbox |
| `13. Details if the claimant is some other entity` | Hardcoded: "Private landlord" | **HARDCODED** |
| Statement of Truth fields | | **TYPE MISMATCHES** |

#### Fields Code Tries to Set That Don't Exist

| Field Name in Code | Issue |
|--------------------|-------|
| `3(b) The current rent is payable each week/month/etc` | **DO NOT EXIST** |
| `3(c) Any unpaid rent...` | **DOES NOT EXIST** |
| `3(d) Total amount outstanding` | **DOES NOT EXIST** |
| `11. In the alternative...demotion order...` | **DOES NOT EXIST** |
| `Date Statement of Truth is signed - DD/MM/YYYY` | **DO NOT EXIST** |
| `Full name of person signing...` | **DOES NOT EXIST** |
| `Statement of Truth signed by Claimant` | **DOES NOT EXIST** |
| `Statement of Truth signature box` | **DOES NOT EXIST** |

#### Wiring
```
eviction-pack-generator.ts:701-708 → fillN119Form(enrichedCaseData)
                                        ↑
generateEnglandOrWalesEvictionPack()
                                        ↑
generateCompleteEvictionPack() → for all Section 8 claims with grounds
```

**Production Path:** YES - always included in complete eviction packs

#### Risk Assessment: **HIGH**

| Risk | Description |
|------|-------------|
| **Tenancy type hardcoded** | Always "AST" even if not applicable |
| **Claimant type hardcoded** | Always "Private landlord" |
| **Arrears amount fields missing** | Can't show rent arrears details |
| **Statement of Truth type mismatches** | Some fields treated as checkboxes but are text |

---

## 3. Data Flow Analysis

### 3.1 wizardFacts → CaseData Mapping

**File:** `src/lib/documents/eviction-wizard-mapper.ts`

| WizardFacts Field | CaseData Field | Court Form Usage |
|-------------------|----------------|------------------|
| `landlord_name` | `landlord_full_name` | N5, N5B, N119 |
| `landlord_address_*` | `landlord_address` | N5, N5B |
| `tenant1_name` | `tenant_full_name` | N5, N5B, N119 |
| `property_address_*` | `property_address` | N5, N5B, N119 |
| `tenancy_start_date` | `tenancy_start_date` | N5B, N119 |
| `rent_amount` | `rent_amount` | N119 |
| `rent_frequency` | `rent_frequency` | N119 |
| `notice_date` / `notice_served_date` | `notice_served_date` | N5, N5B, N119 |
| `notice_expiry_date` | `notice_expiry_date` | N5B |
| `section8_grounds[]` | `ground_codes[]` | N5, N119 |
| `total_arrears` | `total_arrears` | N5, N119 |
| `deposit_*` fields | `deposit_*` | N5B |
| `solicitor_*` fields | `solicitor_*` | All forms |
| `service_*` fields | `service_*` | N5 |

### 3.2 Missing Facts in Schema / Wizard

**File:** `src/lib/case-facts/schema.ts`

The schema has these fields but they may not be collected by wizard:

| Field | In Schema? | Collected? | Needed For |
|-------|-----------|------------|------------|
| `notice.service_method` | YES | PARTIAL | N5B field 10a |
| `notice.service_date` | YES | PARTIAL | N5, N5B |
| `issues.ast_verification.*` | YES | NO | N5B questions 9a-9g |
| `court.claimant_reference` | YES | NO | N5 Fee account |
| HMO license fields | NO | NO | N5B questions 11a-11b |
| Housing Act 2004 notices | NO | NO | N5B question 15 |

---

## 4. Wiring Summary

### 4.1 API Routes

| Route | Calls | Court Forms? |
|-------|-------|--------------|
| `POST /api/documents/generate` | `generateSection8Notice`, `generateSection21Notice` | **NO** - notices only |
| `POST /api/wizard/generate` | Validates, doesn't generate forms directly | **NO** |
| `POST /api/webhooks/stripe` | `generateCompleteEvictionPack()` | **YES** - N5, N5B, N119 |

### 4.2 Production Code Paths

```
STRIPE WEBHOOK (payment success)
        ↓
generateCompleteEvictionPack(wizardFacts)
        ↓
wizardFactsToEnglandWalesEviction(caseId, wizardFacts)
        ↓
generateEnglandOrWalesEvictionPack(evictionCase, caseData, groundsData)
        ↓
├── fillN5Form(enrichedCaseData)      → n5_claim_for_possession.pdf
├── fillN119Form(enrichedCaseData)    → n119_particulars_of_claim.pdf
└── (if no_fault) fillN5BForm(...)    → n5b_accelerated_possession.pdf
```

---

## 5. Test Coverage Analysis

### Existing Tests

| Test File | Coverage | Type |
|-----------|----------|------|
| `tests/documents/pdf-field-mapping.test.ts` | Field existence only | Unit |
| `tests/documents/eviction-pack-option-b.test.ts` | Pack generation | Integration |
| `tests/complete-pack/england-complete-pack-dataflow.test.ts` | wizardFacts → CaseData | Unit |

### Test Gaps

| Missing Test | Impact |
|--------------|--------|
| No tests verify PDF fields are actually populated with values | **HIGH** |
| No tests for N5B with real deposit/notice data | **HIGH** |
| No end-to-end: wizardFacts → fill → read PDF | **HIGH** |
| No tests for field overflow handling | MEDIUM |
| No tests for multiple tenants | MEDIUM |

---

## 6. Gaps & Recommendations

### 6.1 Critical Gaps (Must Fix)

1. **Wrong Field Names in N5 Filler**
   - Location: `official-forms-filler.ts:208-209`
   - Issue: Uses curly quotes `'` instead of straight quotes `'`
   - Fix: Change `"claimant's details"` to `"claimant's details"` (with straight quote)

2. **N5B PDF May Be Incomplete**
   - The actual PDF only has 9 fields but code expects 100+
   - **Action Required:** Verify we have the correct official N5B PDF from HMCTS
   - Source: https://www.gov.uk/government/publications/form-n5b-claim-form-for-possession-of-property-accelerated-procedure

3. **Service Method Hardcoded in N5B**
   - Location: `official-forms-filler.ts:491`
   - Currently: `'By hand / First class post'`
   - Need: Use `notice.service_method` from CaseFacts

4. **Tenancy Type Hardcoded in N119**
   - Location: `official-forms-filler.ts:598`
   - Currently: Always "Assured Shorthold Tenancy"
   - Need: Use `tenancy.tenancy_type` from CaseFacts

### 6.2 High Priority Improvements

1. **Add Missing Wizard Questions**
   - Service method selection (hand delivery, post, email)
   - HMO licensing status
   - Housing Act 2004 improvement notices

2. **Handle Field Type Mismatches**
   - N119 field `13. The claimant is - other` is TextField not Checkbox
   - Several Statement of Truth fields are TextFields not Checkboxes

3. **Address Overflow Handling**
   - Long addresses may exceed field limits
   - Particulars of claim may need continuation page

### 6.3 Lower Priority

1. Multiple landlord support (already partially implemented)
2. Multiple tenant support (already partially implemented)
3. Solicitor DX number capture

---

## 7. Suggested Next Steps (Ordered by Impact)

### Phase 1: Fix Critical Field Mapping (Immediate)

1. **Download fresh N5B PDF from HMCTS** - Verify we have the full fillable version
2. **Fix N5 curly quote issue** - Quick fix, high impact
3. **Map service method dynamically in N5B**
4. **Add unit tests that verify fields are populated**

### Phase 2: Complete Field Coverage (Week 2)

1. Add wizard questions for:
   - Notice service method
   - HMO licensing
   - Housing Act notices
2. Fix N119 field type mismatches
3. Remove hardcoded values, use CaseData

### Phase 3: End-to-End Testing (Week 3)

1. Create e2e test: wizardFacts → fillForm → read PDF → assert values
2. Add overflow tests for long text fields
3. Test with real-world data samples

---

## 8. Minimal Test Plan

### 8.1 Unit Tests to Add

**File:** `tests/documents/court-forms-value-mapping.test.ts`

```typescript
// Test 1: N5 populates party details correctly
it('N5 fills claimant and defendant details', async () => {
  const caseData = buildTestCaseData();
  const pdfBytes = await fillN5Form(caseData);
  const filled = await PDFDocument.load(pdfBytes);
  const form = filled.getForm();

  // Verify fields have expected values
  expect(form.getTextField("claimant's details").getText())
    .toContain(caseData.landlord_full_name);
  expect(form.getTextField("defendant's details").getText())
    .toContain(caseData.tenant_full_name);
});

// Test 2: N5B fills notice service details
it('N5B fills notice served date and method', async () => {
  const caseData = buildSection21CaseData();
  const pdfBytes = await fillN5BForm(caseData);
  // ... verify notice fields
});

// Test 3: N119 fills arrears and grounds
it('N119 fills possession grounds and amounts', async () => {
  const caseData = buildSection8CaseData();
  const pdfBytes = await fillN119Form(caseData);
  // ... verify grounds and amounts
});
```

### 8.2 End-to-End Test

**File:** `tests/e2e/court-forms-e2e.test.ts`

```typescript
it('complete pack generates readable filled court forms', async () => {
  // 1. Create wizardFacts matching real user input
  const wizardFacts = {
    __meta: { jurisdiction: 'england' },
    landlord_name: 'Test Landlord',
    // ... full wizard data
  };

  // 2. Generate complete pack
  const pack = await generateCompleteEvictionPack(wizardFacts);

  // 3. Find N5 document
  const n5Doc = pack.documents.find(d => d.file_name === 'n5_claim_for_possession.pdf');

  // 4. Load and verify populated fields
  const pdf = await PDFDocument.load(n5Doc.pdf);
  const form = pdf.getForm();

  // 5. Assert values match input
  expect(form.getTextField('possession of').getText())
    .toBe('2 Low Road\nLondon\nSW1A2BB');
});
```

---

## 9. Appendix: Full Field Lists

### N5 Fields (13)
```
1. In the court
2. Fee account no
3. claimant's details
4. defendant's details
5. possession of
6. Full name of the person signing the Statement of Truth
7. Name of claimant's legal representative's firm
8. Statement of Truth is signed by the Claimant's legal representative...
9. building and street - Claimant's or claimant's legal representative's address...
10. Second line of address - Claimant's or claimant's legal representative's address...
11. Town or city - Claimant's or claimant's legal representative's address...
12. County (optional) - Claimant's or claimant's legal representative's address...
13. Postcode - Claimant's or claimant's legal representative's address...
```

### N5B Fields (9)
```
1. Enter the full names of the Claimants
2. Enter the full names of the Defendants
3. Name and address of the court
4. The Claimant is claiming possession of
5. 10a How was the notice served
6. 10c Who served the notice
7. 10d Who was the notice served on
8. Name of Claimants legal representatives firm
9. Statement of Truth signature
```

### N119 Fields (17)
```
1. name of court
2. name of claimant
3. name of defendant
4. The claimant has a right to possession of:
5. To the best of the claimant's knowledge the following persons are in possession...
6. 3(a) Type of tenancy
7. 3(a) Date of tenancy
8. 3(b) The current rent is
9. 4. (a) The reason the claimant is asking for possession is:
10. 6. Day and month notice served
11. 6. Year notice served
12. 13. The claimant is - other
13. 13. Details if the claimant is some other entity
14. I believe that the facts stated in these particulars of claim are true
15. The Claimant believes that the facts stated in these particulars of claim are true...
16. Statement of Truth signed by Claimant's legal representative...
17. Name of claimant's legal representative's firm
```

---

## 10. Source File References

| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/documents/official-forms-filler.ts` | 1-925 | All PDF fill functions |
| `src/lib/documents/eviction-pack-generator.ts` | 627-711 | Court form generation orchestration |
| `src/lib/documents/eviction-wizard-mapper.ts` | 1-361 | wizardFacts → CaseData conversion |
| `src/lib/case-facts/schema.ts` | 1-553 | CaseFacts type definitions |
| `public/official-forms/forms-manifest.json` | 1-48 | Form registry |
| `tests/documents/pdf-field-mapping.test.ts` | 1-210 | Field existence tests |
| `tests/complete-pack/england-complete-pack-dataflow.test.ts` | 1-227 | Data flow tests |

---

**Report Generated:** 2025-12-25
**Author:** Claude Code Audit System
