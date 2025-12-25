# England Eviction Packs Audit Report

**Audit Date:** 2025-12-25
**Auditor:** Claude Code Automated Audit
**Scope:** England-only Section 21 packs, N5B accelerated possession, court bundle compilation
**Branch:** `claude/audit-landlord-packs-LXa8X`

---

## Executive Summary

| Feature | Status | Risk | Evidence |
|---------|--------|------|----------|
| **Section 21 Notice (Form 6A)** | Partial | **HIGH** | Template exists but Form 6A deviations flagged in `NOTICE_TEMPLATE_LEGAL_AUDIT_REPORT.md` |
| **Section 21 Pack (Notice + Docs)** | Implemented | Medium | Notice + service instructions + checklist generated; see `notice-only-preview-merger.ts:44-137` |
| **S21 Compliance Dependencies** | Implemented | Medium | Deposit, PI, Gas, EPC, H2R, licensing checks enforced; see `evaluate-notice-compliance.ts:336-580` |
| **4-Month Bar Enforcement** | Implemented | Low | Hard block enforced; see `evaluate-notice-compliance.ts:532-546` |
| **N5B Accelerated Possession** | Implemented | **HIGH** | PDF form filling exists but 24+ field mappings may be incomplete; see `official-forms-filler.ts:367-574` |
| **N5B Field Mapping Tests** | Partial | **HIGH** | Basic field existence tests only; no end-to-end data flow validation; see `pdf-field-mapping.test.ts:101-116` |
| **Court Bundle Compilation** | Partial | **HIGH** | Bundle builder outputs TEXT files not PDFs; no actual PDF merging in production; see `bundles/index.ts:210-297` |
| **Multi-Document PDF Merge** | Partial | Medium | `notice-only-preview-merger.ts` merges notice PDFs only; no court bundle PDF merging |
| **Evidence/Upload Inclusion** | Missing | **HIGH** | Bundle spec lists evidence section but actual PDF inclusion not implemented |

---

## 1. Section 21 Pack Audit (England)

### 1.1 What Exists Today

#### Template Configuration

| Component | File Path | Status |
|-----------|-----------|--------|
| Template Registry | `src/lib/jurisdictions/capabilities/templateRegistry.ts` | Implemented |
| Capabilities Matrix | `src/lib/jurisdictions/capabilities/matrix.ts` | Implemented |
| Form 6A HBS Template | `config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/notice.hbs` | Implemented |
| Official Form 6A PDF | `public/official-forms/form_6a.pdf` | Present |
| Forms Manifest | `public/official-forms/forms-manifest.json` | Implemented |

#### Section 21 Generator Flow

```
UI → /api/documents/generate (route.ts:257-369)
   → wizardFactsToEnglandWalesEviction() (eviction-wizard-mapper.ts:298-308)
   → generateDocument() with template path
   → HTML-to-PDF conversion via template
```

**Key Files:**
- `src/app/api/documents/generate/route.ts:289-369` - Section 21 notice generation
- `src/lib/documents/eviction-wizard-mapper.ts:163-236` - Fact mapping to CaseData
- `src/lib/notices/evaluate-notice-compliance.ts:336-580` - England S21 compliance rules

#### Notice Pack Documents Included

For England Section 21 "notice_only" product:

| Document | Template Location | Included |
|----------|-------------------|----------|
| Section 21 Notice (Form 6A) | `notice_only/form_6a_section21/notice.hbs` | Yes |
| Service Instructions | `eviction/service_instructions_section_21.hbs` | Yes |
| Pre-Service Checklist | `eviction/checklist_section_21.hbs` | Yes |
| Compliance Checklist | `eviction/compliance_checklist.hbs` | Yes |
| Next Steps Guide | `eviction/next_steps_guide.hbs` | Yes |

**Evidence:** `src/lib/documents/notice-only-preview-merger.ts:18-23, 44-137`

### 1.2 Compliance Dependencies

#### What We Collect vs What We Enforce

| Compliance Field | Collected | Hard Block | Warning | Evidence |
|------------------|-----------|------------|---------|----------|
| `deposit_protected` | Yes | Yes (at preview/generate) | Yes (at wizard) | L349-391 |
| `prescribed_info_given` | Yes | Yes (at generate) | Yes (at preview) | L358-379 |
| `gas_certificate_provided` | Yes (if `has_gas_appliances`) | Yes | Yes | L460-482 |
| `epc_provided` | Yes | Yes | Yes | L485-502 |
| `how_to_rent_provided` | Yes | Yes | Yes | L504-521 |
| `property_licensing_status` | Yes | Yes (if `unlicensed`) | Yes | L441-458 |
| `recent_repair_complaints` | Yes | No | Yes (retaliatory warning) | L523-530 |
| `tenancy_start_date` | Yes | Yes (4-month bar) | No | L532-546 |
| `deposit_amount` / `rent_amount` | Yes | Yes (cap exceeded) | No | L398-438 |

**File Reference:** `src/lib/notices/evaluate-notice-compliance.ts:336-580`

#### 4-Month Bar Enforcement

```typescript
// Lines 532-546
if (service_date && wizardFacts.tenancy_start_date) {
  const fourMonthPoint = addMonths(start, 4);
  if (service < fourMonthPoint) {
    hardFailures.push({
      code: 'S21-FOUR-MONTH-BAR',
      // ...
    });
  }
}
```

**Status:** Implemented and enforced as hard block.

#### Expiry Date Auto-Calculation

```typescript
// Lines 548-579
const result = calculateSection21ExpiryDate({
  service_date,
  tenancy_start_date,
  fixed_term,
  fixed_term_end_date,
  rent_period,
});
computed.expiry_date = result.earliest_valid_date;
```

**Status:** Implemented. Validates entered expiry against calculated minimum.

### 1.3 Prescribed Form Fidelity (Form 6A)

#### Known Issues from Legal Audit

From `NOTICE_TEMPLATE_LEGAL_AUDIT_REPORT.md`:

| Issue | Severity | Status |
|-------|----------|--------|
| Missing/incomplete prescribed notes text | HIGH | Flagged |
| Tenant name fields may not match official form layout | MEDIUM | Flagged |
| Date format discrepancies | MEDIUM | Flagged |

**Risk:** Form 6A template (`notice.hbs`) may produce output that deviates from the prescribed statutory form, potentially invalidating the notice.

### 1.4 How to Verify

```bash
# Run Section 21 compliance tests
pnpm test -- --grep "section21\|Section 21\|S21"

# Run notice compliance evaluator tests
pnpm vitest run tests/notices/evaluate-notice-compliance.test.ts

# Run the audit script for notice-only PDFs
pnpm tsx scripts/audit-notice-only-pdfs.ts

# Check Form 6A field mapping
pnpm vitest run tests/documents/pdf-field-mapping.test.ts
```

---

## 2. Accelerated Possession Bundle Audit (N5B)

### 2.1 What Exists Today

#### N5B Form Filler

| Component | File Path | Status |
|-----------|-----------|--------|
| N5B PDF Template | `public/official-forms/n5b-eng.pdf` | Present (fillable) |
| N5B Form Filler | `src/lib/documents/official-forms-filler.ts:367-574` | Implemented |
| Wizard → CaseData Mapper | `src/lib/documents/eviction-wizard-mapper.ts:163-236` | Implemented |
| Data Flow Tests | `tests/complete-pack/england-complete-pack-dataflow.test.ts` | Partial |

#### N5B Field Mapping (fillN5BForm)

The `fillN5BForm` function at `official-forms-filler.ts:367-574` maps CaseData to N5B PDF fields:

**Critical N5B Fields Mapped:**

| N5B Field | CaseData Source | Status |
|-----------|-----------------|--------|
| Claimant names | `landlord_full_name`, `landlord_2_name` | Mapped |
| Defendant names | `tenant_full_name`, `tenant_2_name` | Mapped |
| Property address | `property_address`, lines split | Mapped |
| Tenancy date | `tenancy_start_date` | Mapped |
| Notice served date | `section_21_notice_date` | Mapped |
| Notice expiry date | `notice_expiry_date` | Mapped |
| Deposit amount | `deposit_amount` | Mapped |
| Deposit scheme | `deposit_scheme` | Mapped |
| Deposit protection date | `deposit_protection_date` | Mapped |
| Licensing (HMO) | `hmo_license_required`, `hmo_license_valid` | Mapped |
| Statement of Truth | `signatory_name`, `solicitor_firm` | Mapped |

#### Generation Entry Point

**N5B is NOT directly exposed in the API!**

Looking at `src/app/api/documents/generate/route.ts:42-54`:

```typescript
document_type: z.enum([
  'section8_notice',
  'section21_notice',  // ← Notice only, NOT N5B
  'ast_standard',
  'ast_premium',
  'notice_to_leave',
  'prt_agreement',
  'prt_premium',
  'private_tenancy',
  'private_tenancy_premium',
]),
```

**Critical Finding:** There is NO `n5b` document type in the API. The N5B form filler exists but is not wired to an API endpoint.

### 2.2 Missing or Partial Mappings

#### N5B Fields with Potential Issues

| N5B Field | Issue | Risk |
|-----------|-------|------|
| `10a How was the notice served` | Hardcoded to "By hand / First class post" | **HIGH** - Must reflect actual service method |
| `10c Who served the notice` | Uses `landlord_full_name` only | Medium - May be agent |
| `10d Who was the notice served on` | Uses `tenant_full_name` only | Medium - May be multiple tenants |
| `notice_expiry_date` | From wizard, not auto-calculated | **HIGH** - May be invalid |
| `deposit_reference` | Optional in CaseData | Medium - Required for N5B |
| Questions 9a-9g (AST verification) | All hardcoded to expected values | **HIGH** - Must reflect actual tenancy |

**File Reference:** `official-forms-filler.ts:481-489`

```typescript
// Lines 481-489 - All hardcoded!
checkBox(form, '9a Was the first tenancy...? Yes', true);
checkBox(form, '9b Was a notice served...? No', true);
checkBox(form, '9c Is there any provision...? No', true);
// etc.
```

### 2.3 Existing Tests

#### Test Coverage Analysis

| Test File | Coverage | Gaps |
|-----------|----------|------|
| `tests/documents/pdf-field-mapping.test.ts:101-116` | N5B field existence only | No data flow validation |
| `tests/complete-pack/england-complete-pack-dataflow.test.ts:96-163` | Section 21 → CaseData mapping | Does NOT test N5B fill |

**Critical Test Gap:** No test verifies that wizard facts correctly fill N5B fields end-to-end.

### 2.4 High-Value Test Recommendations

```typescript
// Recommended test: N5B End-to-End Data Flow
describe('N5B Form Filling', () => {
  it('fills notice expiry date from wizard facts', async () => {
    const wizardFacts = {
      selected_notice_route: 'section_21',
      notice_expiry_date: '2026-03-01',
      // ... other facts
    };
    const { caseData } = wizardFactsToEnglandWalesEviction('test', wizardFacts);
    const pdfBytes = await fillN5BForm(caseData);

    // Parse filled PDF and verify field value
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const dayField = form.getTextField('10e... Day');
    expect(dayField.getText()).toBe('01');
  });

  it('maps deposit scheme details correctly', async () => {
    // Test deposit_scheme, deposit_reference, deposit_protection_date
  });
});
```

### 2.5 How to Verify

```bash
# Run existing dataflow tests
pnpm vitest run tests/complete-pack/england-complete-pack-dataflow.test.ts

# Run PDF field mapping tests
pnpm vitest run tests/documents/pdf-field-mapping.test.ts

# Manual: Generate N5B and inspect (requires adding API endpoint)
# Currently N5B is not exposed via API
```

---

## 3. Court Bundle Compilation Audit

### 3.1 What Exists Today

#### Bundle Builder Module

| Component | File Path | Status |
|-----------|-----------|--------|
| Bundle Main API | `src/lib/bundles/index.ts` | Implemented (TEXT output) |
| Bundle Types | `src/lib/bundles/types.ts` | Implemented |
| Section Builder | `src/lib/bundles/sections.ts` | Implemented |
| Evidence Index | `src/lib/bundles/evidence-index.ts` | Implemented |
| Bundle Spec | `docs/BUNDLE_BUILDER_SPEC.md` | Documented |

#### Bundle Generation Functions

```typescript
// src/lib/bundles/index.ts
export async function generateCourtBundle(caseFacts, options): Promise<BundleResult>
export async function generateTribunalBundle(caseFacts, options): Promise<BundleResult>
export function validateBundleReadiness(caseFacts): ValidationResult
```

**Critical Finding:** Bundle output is **TEXT files, not PDFs**.

From `src/lib/bundles/index.ts:259-261`:
```typescript
// Write to file (text file as placeholder for PDF)
const bundlePath = path.join(bundleDir, 'bundle.txt');
fs.writeFileSync(bundlePath, bundleContent, 'utf8');
```

### 3.2 England Bundle Section Structure

From `sections.ts:19-129`:

| Tab | Section | Content Source | PDF Included |
|-----|---------|----------------|--------------|
| Index | Bundle Index | Auto-generated | No (text) |
| A | Case Summary | Case-intel narrative | No (text) |
| B | Particulars of Claim (N119) | Case-intel narrative | **No (placeholder)** |
| C | Ground Particulars | Case-intel ground narratives | No (text) |
| D | Tenancy Agreement | Document storage | **No (placeholder)** |
| E | Rent Schedule | Case-intel arrears narrative | No (text) |
| F | Notices | Document generation | **No (placeholder)** |
| G | Evidence | Evidence analysis | **No (placeholder)** |
| H | Chronology | Case-intel timeline | No (text) |

**Evidence of Placeholders** from `sections.ts:54-66`:
```typescript
// Section 5: Tenancy Agreement
sections.push({
  id: 'tenancy_agreement',
  title: 'Tenancy Agreement',
  content: {
    type: 'document',
    pdf_data: '', // Placeholder - actual implementation would fetch from storage
  },
});
```

### 3.3 Missing Production Features

From `docs/BUNDLE_BUILDER_SPEC.md:459-462`:

> ### Current Implementation
> - ⚠️ Output is `.txt` file (not PDF)
> - ⚠️ No actual form filling (placeholders)
> - ⚠️ No uploaded document inclusion

#### What's Missing for Production:

| Feature | Status | Impact |
|---------|--------|--------|
| PDF generation (pdf-lib/pdfkit) | Missing | Cannot produce court-ready bundle |
| N5/N119/N5B form embedding | Missing | Court forms not in bundle |
| Tenancy agreement fetch | Missing | AST not in bundle |
| Evidence PDF inclusion | Missing | Uploads not in bundle |
| PDF page numbering | Missing | No pagination |
| Tab dividers | Missing | No section markers |

### 3.4 Notice-Only PDF Merger (Exists)

For notice-only products, PDF merging IS implemented:

**File:** `src/lib/documents/notice-only-preview-merger.ts`

```typescript
export async function generateNoticeOnlyPreview(
  documents: NoticeOnlyDocument[],
  options: NoticeOnlyPreviewOptions
): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();
  // ... copies pages from individual PDFs into merged PDF
  const copiedPages = await mergedPdf.copyPages(docPdf, docPdf.getPageIndices());
}
```

**This merger is for notice packs only, not court bundles.**

### 3.5 API Endpoints

#### Existing Routes

| Endpoint | Purpose | Bundle Support |
|----------|---------|----------------|
| `/api/documents/generate` | Notice/agreement generation | No bundle |
| `/api/wizard/generate` | Wizard document generation | No bundle |

#### Missing Routes

- `/api/bundles/generate` - Not implemented (spec exists in `BUNDLE_BUILDER_SPEC.md:567-616`)
- `/api/bundles/download` - Not implemented

### 3.6 How to Verify

```bash
# No bundle tests exist - bundle functions not exposed via API

# Manually test bundle generation (requires importing functions directly):
pnpm tsx -e "
  import { generateCourtBundle, validateBundleReadiness } from './src/lib/bundles';
  // Would need to provide CaseFacts
"

# Check bundle builder module exists
ls -la src/lib/bundles/

# Review bundle spec
cat docs/BUNDLE_BUILDER_SPEC.md
```

---

## 4. Legal/Compliance Dependencies Summary

### 4.1 Collection vs Enforcement Matrix

| Compliance Area | Collected | Wizard Warning | Preview Block | Generate Block | API Block |
|-----------------|-----------|----------------|---------------|----------------|-----------|
| Deposit protected | Yes | Yes | Yes | Yes | Yes |
| Prescribed info given | Yes | Yes | No | Yes | Yes |
| Gas safety cert | Yes | Yes | Yes | Yes | Yes |
| EPC provided | Yes | Yes | Yes | Yes | Yes |
| How to Rent given | Yes | Yes | Yes | Yes | Yes |
| Property licensing | Yes | Yes | Yes | Yes | Yes |
| 4-month bar | Yes | No | Yes | Yes | Yes |
| Deposit cap (TFA 2019) | Yes | Yes | Yes | Yes | Yes |
| Retaliatory eviction | Yes | Yes (warning) | No | No | No |

**Evidence Files:**
- `src/lib/notices/evaluate-notice-compliance.ts` - Main compliance evaluator
- `src/app/api/wizard/generate/route.ts:144-288` - API-level enforcement
- `src/app/api/documents/generate/route.ts:289-336` - Document-level enforcement

### 4.2 Gaps in Enforcement

| Gap | Description | Risk |
|-----|-------------|------|
| Retaliatory eviction | Warning only, not hard block | **HIGH** - May produce invalid S21 |
| Service method validation | Hardcoded in N5B | Medium - May not reflect actual service |
| PI timing (30-day rule) | Collected but not validated | **HIGH** - Must be within 30 days |
| Gas cert expiry | Not validated | Medium - Must be current |

---

## 5. Next Engineering Tasks (Prioritized by Impact)

### Critical (Must Fix Before Production)

1. **[HIGH] Wire N5B to API endpoint**
   - Add `n5b` document type to `/api/documents/generate`
   - Ensure wizard → CaseData → N5B mapping is complete
   - Files: `route.ts`, `eviction-wizard-mapper.ts`

2. **[HIGH] Implement court bundle PDF generation**
   - Replace text file output with actual PDF (pdf-lib)
   - Embed filled N5/N5B/N119 forms
   - Files: `bundles/index.ts`

3. **[HIGH] Add end-to-end N5B tests**
   - Verify all 24+ critical fields are correctly filled
   - Test date formats, address splitting, deposit details
   - Files: new test file

4. **[HIGH] Fix Form 6A template deviations**
   - Address issues in `NOTICE_TEMPLATE_LEGAL_AUDIT_REPORT.md`
   - Ensure prescribed text is verbatim

### High (Should Fix Soon)

5. **[HIGH] Add N5B service method collection**
   - Currently hardcoded to "By hand / First class post"
   - Must collect from wizard

6. **[HIGH] Validate prescribed info timing**
   - 30-day rule from deposit protection
   - Add date validation

7. **[MEDIUM] Create bundle API endpoints**
   - `/api/bundles/generate`
   - `/api/bundles/download`

### Medium (Should Address)

8. **[MEDIUM] Add evidence PDF inclusion to bundles**
   - Fetch uploaded documents from storage
   - Merge into bundle PDF

9. **[MEDIUM] Add retaliatory eviction hard block**
   - Currently warning only
   - Should block if improvement notice served

10. **[MEDIUM] Validate gas certificate currency**
    - Check certificate date vs service date

---

## 6. Go/No-Go Recommendations

### England Section 21 Notice-Only

| Aspect | Status | Recommendation |
|--------|--------|----------------|
| Notice generation | Implemented | **CONDITIONAL GO** |
| Compliance checks | Implemented | Go |
| Form 6A fidelity | Flagged issues | **Requires review** |
| Pack documents | Implemented | Go |

**Recommendation:** CONDITIONAL GO - Review Form 6A template against `NOTICE_TEMPLATE_LEGAL_AUDIT_REPORT.md` findings before production use.

### England Accelerated Pack (N5B)

| Aspect | Status | Recommendation |
|--------|--------|----------------|
| N5B form filler | Implemented | Needs testing |
| API wiring | **Missing** | **NO-GO** |
| Field mapping | Partial (hardcoded values) | **NO-GO** |
| End-to-end tests | Missing | **NO-GO** |

**Recommendation:** **NO-GO** - N5B is not accessible via API and has hardcoded values that may not reflect actual case facts. Requires:
1. Add API endpoint
2. Remove hardcoded AST verification answers
3. Add service method collection
4. Create comprehensive tests

### England Court Bundle Compilation

| Aspect | Status | Recommendation |
|--------|--------|----------------|
| Bundle structure | Implemented | Go |
| PDF generation | **Missing** (text only) | **NO-GO** |
| Form embedding | **Missing** | **NO-GO** |
| Evidence inclusion | **Missing** | **NO-GO** |
| API endpoints | **Missing** | **NO-GO** |

**Recommendation:** **NO-GO** - Bundle builder produces text files only. Cannot produce court-ready PDF bundles. Requires:
1. Implement PDF generation
2. Embed filled court forms
3. Include evidence uploads
4. Create API endpoints

---

## Appendix A: Manual QA Checklist - England S21 + Accelerated Pack

### Section 21 Notice-Only QA

- [ ] Create new case with England jurisdiction
- [ ] Select Section 21 (no-fault) route
- [ ] Enter valid tenancy start date (> 4 months ago)
- [ ] Confirm deposit protected
- [ ] Confirm prescribed info given
- [ ] Confirm gas safety cert (if applicable)
- [ ] Confirm EPC provided
- [ ] Confirm How to Rent provided
- [ ] Set notice service date
- [ ] Verify expiry date is auto-calculated (≥ 2 months)
- [ ] Generate preview PDF
- [ ] Verify Form 6A contains all required fields
- [ ] Verify service instructions included
- [ ] Verify checklist included
- [ ] Download final pack after payment
- [ ] Verify no watermarks on final

### Compliance Blocking QA

- [ ] Attempt S21 with unprotected deposit → expect block
- [ ] Attempt S21 within 4 months of tenancy start → expect block
- [ ] Attempt S21 with unlicensed property → expect block
- [ ] Attempt S21 with deposit > 5 weeks rent → expect block (unless confirmed)

### N5B Accelerated Pack QA (Requires Implementation)

- [ ] **BLOCKED** - N5B not accessible via API
- [ ] When implemented:
  - [ ] Generate N5B with full case facts
  - [ ] Verify claimant/defendant names
  - [ ] Verify property address on all pages
  - [ ] Verify tenancy dates
  - [ ] Verify notice service date and expiry
  - [ ] Verify deposit scheme details
  - [ ] Verify AST verification answers reflect actual tenancy
  - [ ] Verify service method reflects actual method
  - [ ] Verify statement of truth signature

### Court Bundle QA (Requires Implementation)

- [ ] **BLOCKED** - Bundle produces text files only
- [ ] When implemented:
  - [ ] Generate bundle with all sections
  - [ ] Verify N5B/N5/N119 embedded correctly
  - [ ] Verify evidence PDFs included
  - [ ] Verify page numbers
  - [ ] Verify tab markers
  - [ ] Verify index page references correct

---

## Appendix B: Key File Reference

| Purpose | File Path |
|---------|-----------|
| Template Registry | `src/lib/jurisdictions/capabilities/templateRegistry.ts` |
| Capabilities Matrix | `src/lib/jurisdictions/capabilities/matrix.ts` |
| Section 21 Generator | `src/lib/documents/section21-generator.ts` |
| Eviction Pack Generator | `src/lib/documents/eviction-pack-generator.ts` |
| Eviction Wizard Mapper | `src/lib/documents/eviction-wizard-mapper.ts` |
| Official Forms Filler | `src/lib/documents/official-forms-filler.ts` |
| Compliance Evaluator | `src/lib/notices/evaluate-notice-compliance.ts` |
| Notice Preview Merger | `src/lib/documents/notice-only-preview-merger.ts` |
| Bundle Builder | `src/lib/bundles/index.ts` |
| Bundle Sections | `src/lib/bundles/sections.ts` |
| Bundle Spec | `docs/BUNDLE_BUILDER_SPEC.md` |
| Form 6A Template | `config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/notice.hbs` |
| Legal Audit Report | `NOTICE_TEMPLATE_LEGAL_AUDIT_REPORT.md` |
| PDF Field Mapping Tests | `tests/documents/pdf-field-mapping.test.ts` |
| Data Flow Tests | `tests/complete-pack/england-complete-pack-dataflow.test.ts` |

---

*Report generated by automated audit. All findings require human verification before production deployment.*
