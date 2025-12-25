# England Complete Pack Smart Review Audit

**Audit Date:** 2025-12-25
**Last Updated:** 2025-12-25 (v2 - Corrections Applied)
**Auditor:** Claude Code
**Scope:** England Complete Pack (Section 8 & Section 21) Smart Review v1 + Hardening
**Status:** COMPLETE - WITH CRITICAL FINDING

---

## ⚠️ Audit Corrections (v2)

This section documents corrections made to the original audit after code verification.

### Corrections Applied

| Section | Original Claim | Verified Reality | Evidence |
|---------|---------------|------------------|----------|
| 1. Pack Inventory | "N5A Claim Form - Future scope" | **N5 (not N5A), N5B, N119 are actively generated** | `eviction-pack-generator.ts:672-689` |
| 1. Pack Inventory | "N5B - Future scope" | **N5B is generated for S21 route** | `eviction-pack-generator.ts:607-636` |
| 1. Pack Inventory | "Witness Statement - TBD" | **Witness Statement is AI-generated** | `eviction-pack-generator.ts:821-850` |
| 3. Upload Schema | "type: multi_file_upload" | **MQS uses `inputType: upload`** | `england.yaml:379-507` |
| 3. Upload Schema | "max_files: 5 in YAML" | **max_files is in FileUpload.tsx default (5)** | `FileUpload.tsx:26` |
| 5. UX Surface | "Warnings returned in API" | **CRITICAL: Warnings NOT consumed by UI** | See Critical Finding below |

### Critical Finding: Smart Review Warnings Not Surfaced

**Status:** 🔴 CRITICAL GAP

Smart Review warnings are returned in the API response (`smart_review_warnings`, `smart_review`) but:

1. **NO frontend component consumes these fields**
   - Searched all `.tsx` files: zero matches for `smart_review` or `smartReview`
   - `StructuredWizard.tsx` handles `preview_warnings` but NOT `smart_review_warnings`

2. **Warnings are NOT persisted to database**
   - `route.ts:1480-1484`: Warnings stored in `responseData.smart_review` (local variable)
   - `route.ts:1560-1561`: Returns in API response only
   - No DB write for Smart Review results

3. **After page refresh, all warnings are lost**
   - No cache or persistence mechanism
   - User must re-upload and re-trigger to see warnings (and even then, UI doesn't render them)

**Evidence:**
```bash
# Search for smart_review in frontend components
grep -r "smart_review\|smartReview" src/components/ src/app/ --include="*.tsx"
# Result: No matches found

# Wizard component only handles preview_warnings:
# StructuredWizard.tsx:1540-1541
setPreviewBlockingIssues(data.preview_blocking_issues || []);
setPreviewWarnings(data.preview_warnings || []);
# Note: NO handling of data.smart_review_warnings
```

---

## Executive Summary

This audit examines the England Complete Pack product, focusing on:
- Questions asked for Section 8 (fault-based) and Section 21 (no-fault) eviction routes
- Evidence upload categories and persistence
- Smart Review v1 pipeline (OCR/Vision extraction, fact comparison, warning generation)
- Claims vs. reality (what we can and cannot claim)

**Key Findings:**
- ✅ MQS config covers 47 questions across common, S8-only, and S21-only categories
- ✅ 10 structured evidence upload categories are defined with route gating
- ✅ Smart Review is warnings-only, never blocks document generation
- ✅ All warning messages pass safe language validation
- ✅ Notices correctly sourced from Notice Only templates
- ✅ All 331 tests pass
- 🔴 **CRITICAL: Smart Review warnings are NOT visible to users**

---

## 1. Pack Inventory (Generated Outputs) - CORRECTED

### Section 8 (Fault-Based) Route

| Document | Source Type | File Path / Function | Generator Location | Optional |
|----------|-------------|---------------------|-------------------|----------|
| Section 8 Notice (Form 3) | HBS Template | `templates/notice_only/form_3_section8/notice.hbs` | `generateSection8Notice()` - `section8-generator.ts` | No |
| N5 Claim for Possession | Official PDF Fill | `public/official-forms/N5.pdf` | `fillN5Form()` - `official-forms-filler.ts` | No |
| N119 Particulars of Claim | Official PDF Fill | `public/official-forms/N119.pdf` | `fillN119Form()` - `official-forms-filler.ts` | No |
| Eviction Roadmap | HBS Template | `templates/eviction/eviction_roadmap.hbs` | `generateEvictionRoadmap()` - `eviction-pack-generator.ts:249-288` | No |
| Expert Guidance | HBS Template | `templates/eviction/expert_guidance.hbs` | `generateExpertGuidance()` - `eviction-pack-generator.ts:364-395` | No |
| Timeline Expectations | HBS Template | `templates/eviction_timeline.hbs` | `generateTimelineExpectations()` - `eviction-pack-generator.ts:400-427` | No |
| Evidence Checklist | HBS Template | `templates/evidence_collection_checklist.hbs` | `generateEvidenceChecklist()` - `eviction-pack-generator.ts:293-327` | No |
| Proof of Service | HBS Template | `templates/proof_of_service.hbs` | `generateProofOfService()` - `eviction-pack-generator.ts:332-359` | No |
| Witness Statement | AI-Assisted + HBS | `templates/eviction/witness-statement.hbs` | `generateWitnessStatement()` - `eviction-pack-generator.ts:821-850` | Yes (try/catch) |
| Compliance Audit | AI-Assisted + HBS | `templates/eviction/compliance-audit.hbs` | `generateComplianceAudit()` - `eviction-pack-generator.ts:852-882` | Yes (try/catch) |
| Risk Assessment | HBS Template | `templates/eviction/risk-report.hbs` | `computeRiskAssessment()` - `eviction-pack-generator.ts:884-913` | Yes (try/catch) |
| Case Summary | HBS Template | `templates/eviction_case_summary.hbs` | Lines 916-934 | No |

### Section 21 (No-Fault) Route

| Document | Source Type | File Path / Function | Generator Location | Optional |
|----------|-------------|---------------------|-------------------|----------|
| Section 21 Notice (Form 6A) | HBS Template | `templates/notice_only/form_6a_section21/notice.hbs` | `generateSection21Notice()` - `section21-generator.ts` | No |
| N5B Accelerated Possession | Official PDF Fill | `public/official-forms/N5B.pdf` | `fillN5BForm()` - `official-forms-filler.ts` | No |
| N5 Claim for Possession | Official PDF Fill | `public/official-forms/N5.pdf` | `fillN5Form()` - `eviction-pack-generator.ts:672` | No |
| N119 Particulars of Claim | Official PDF Fill | `public/official-forms/N119.pdf` | `fillN119Form()` - `eviction-pack-generator.ts:682` | No |
| (Same guidance docs as S8) | - | - | - | - |

**Code Evidence:**
```typescript
// eviction-pack-generator.ts:607-636 - N5B generation for Section 21
if (evictionCase.case_type === 'no_fault') {
  // ... Section 21 Notice generation ...

  // Accelerated possession claim (N5B)
  const n5bPdf = await fillN5BForm({...});
  documents.push({
    title: 'N5B Accelerated Possession Claim',
    category: 'court_form',
    pdf: Buffer.from(n5bPdf),
    file_name: 'n5b_accelerated_possession.pdf',
  });
}

// eviction-pack-generator.ts:672-689 - N5 + N119 for both routes
const n5Pdf = await fillN5Form(enrichedCaseData);
documents.push({
  title: 'Form N5 - Claim for Possession',
  category: 'court_form',
  ...
});

const n119Pdf = await fillN119Form(enrichedCaseData);
documents.push({
  title: 'Form N119 - Particulars of Claim',
  category: 'court_form',
  ...
});
```

### Notice Template Verification

**Confirmed:** Notices use Notice Only templates (not legacy complete_pack paths)

```
# Section 8 Notice
File: config/jurisdictions/uk/england/templates/notice_only/form_3_section8/notice.hbs
Lines: 1-808

# Section 21 Notice
File: config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/notice.hbs
Lines: 1-614
```

---

## 2. MQS Question Coverage (What We Ask)

### MQS Source File
```
File: config/mqs/complete_pack/england.yaml
Version: 2.1.0
Last Updated: 2025-12-24
Lines: 1-523
```

### Common Questions (Both Routes)

| Question ID | Maps To | Required | DependsOn |
|-------------|---------|----------|-----------|
| `landlord_type` | `landlord_type` | Yes | - |
| `landlord_full_name` | `landlord_full_name` | Yes | - |
| `landlord_address` | `landlord_address_*` | Yes | - |
| `landlord_phone` | `landlord_phone` | No | - |
| `landlord_email` | `landlord_email` | No | - |
| `joint_landlord_exists` | `has_joint_landlord` | Yes | - |
| `joint_landlord_full_name` | `joint_landlord_full_name` | Conditional | `joint_landlord_exists=true` |
| `tenant_full_name` | `tenant_full_name` | Yes | - |
| `joint_tenants_exist` | `has_joint_tenants` | Yes | - |
| `additional_tenants` | `additional_tenant_names[]` | Conditional | `joint_tenants_exist=true` |
| `property_address` | `property_address_*` | Yes | - |
| `tenancy_type` | `tenancy_type` | Yes | - |
| `tenancy_start_date` | `tenancy_start_date` | Yes | - |
| `is_fixed_term` | `is_fixed_term` | Yes | - |
| `fixed_term_end_date` | `fixed_term_end_date` | Conditional | `is_fixed_term=true` |
| `rent_amount` | `rent_amount` | Yes | - |
| `rent_frequency` | `rent_frequency` | Yes | - |
| `eviction_route` | `selected_notice_route` | Yes | - |
| `notice_service_date` | `notice_service_date` | Yes | - |
| `notice_service_method` | `notice_service_method` | Yes | - |
| `notice_expiry_date` | `notice_expiry_date` | Yes | - |

### Section 8 Only Questions

| Question ID | Maps To | Required | Routes Gating |
|-------------|---------|----------|---------------|
| `section8_grounds` | `section8_grounds[]` | Yes | `routes: [section_8]` |
| `ground_particulars` | `ground_particulars{}` | Yes | `routes: [section_8]` |
| `total_arrears` | `total_arrears` | Conditional | `section8_grounds includes 8,10,11` |
| `arrears_at_notice_date` | `arrears_at_notice_date` | Conditional | `section8_grounds includes 8,10,11` |

### Section 21 Only Questions

| Question ID | Maps To | Required | Routes Gating |
|-------------|---------|----------|---------------|
| `deposit_taken` | `deposit_taken` | Yes | `routes: [section_21]` |
| `deposit_protected` | `deposit_protected` | Conditional | `deposit_taken=true` |
| `deposit_amount` | `deposit_amount` | Conditional | `deposit_taken=true` |
| `deposit_protection_date` | `deposit_protection_date` | Conditional | `deposit_protected=true` |
| `deposit_scheme_name` | `deposit_scheme_name` | Conditional | `deposit_protected=true` |
| `prescribed_info_served` | `prescribed_info_served` | Conditional | `deposit_protected=true` |
| `how_to_rent_served` | `how_to_rent_served` | Yes | `routes: [section_21]` |
| `epc_provided` | `epc_gas_cert_served` | Yes | `routes: [section_21]` |
| `has_gas_appliances` | `has_gas_appliances` | Yes | `routes: [section_21]` |
| `gas_safety_cert_provided` | `gas_safety_cert_provided` | Conditional | `has_gas_appliances=true` |

---

## 3. Upload Schema Audit (What Users Can Upload) - CORRECTED

### Upload Categories (10 Total)

**Source:** `config/mqs/complete_pack/england.yaml` (Lines 366-522)

| Category ID | Label | inputType | Route Gating | maps_to |
|-------------|-------|-----------|--------------|---------|
| `evidence_tenancy_agreement` | Tenancy Agreement | `upload` | Both | `evidence.tenancy_agreement_uploads` |
| `evidence_bank_statements` | Bank Statements / Rent Records | `upload` | Section 8 only | `evidence.bank_statements_uploads` |
| `evidence_deposit_protection` | Deposit Protection Certificate | `upload` | Section 21 only | `evidence.deposit_protection_uploads` |
| `evidence_prescribed_info` | Prescribed Information Proof | `upload` | Section 21 only | `evidence.prescribed_info_uploads` |
| `evidence_how_to_rent` | How to Rent Guide Proof | `upload` | Section 21 only | `evidence.how_to_rent_uploads` |
| `evidence_epc` | Energy Performance Certificate | `upload` | Section 21 only | `evidence.epc_uploads` |
| `evidence_gas_safety` | Gas Safety Certificate | `upload` | Section 21 only | `evidence.gas_safety_uploads` |
| `evidence_notice_service` | Notice Service Proof | `upload` | Both | `evidence.notice_service_uploads` |
| `evidence_correspondence` | Tenant Correspondence | `upload` | Both | `evidence.correspondence_uploads` |
| `evidence_other` | Other Supporting Documents | `upload` | Both | `evidence.other_uploads` |

**Plus:** `evidence_uploads` (deprecated, maps to `evidence.other_uploads`)

### Multiple Files Per Category

**Confirmed:** The UI supports multiple files per category.

```typescript
// src/components/wizard/FileUpload.tsx:16,26
maxFiles?: number;  // prop
maxFiles = 5,       // default value

// FileUpload.tsx:131
multiple={maxFiles > 1}  // enables multi-file selection
```

**Note:** `maxFiles` is NOT defined in MQS YAML - it's a component default.

### Upload Persistence

**Storage Path Pattern:**
```
cases/{caseId}/evidence/{category}/{filename}
```

**Persistence confirmed via:**
- `updateWizardFacts()` in `route.ts:1320`
- Files stored in database via wizard fact persistence
- Evidence bundle reconstructed in `route.ts:1421-1460`

---

## 4. Smart Review Pipeline Truth Table

### 4.1 When It Runs

**Trigger Point:**
```typescript
// src/app/api/wizard/answer/route.ts:1411-1416
if (
  (product === 'complete_pack' || product === 'eviction_pack') &&
  canonicalJurisdiction === 'england' &&
  isSmartReviewEnabled() &&
  question_id.startsWith('evidence_') // Only after evidence uploads
) {
```

**Feature Flags:**

| Flag | Default (Dev) | Default (Prod) | Purpose |
|------|---------------|----------------|---------|
| `ENABLE_SMART_REVIEW` | `true` | `false` | Master toggle |
| `ENABLE_VISION_OCR` | `true` | `false` | Vision API |

### 4.2 Processing Limits (v1 Hardening)

| Limit | Default | Env Variable |
|-------|---------|--------------|
| Files per run | 10 | `SMART_REVIEW_MAX_FILES_PER_RUN` |
| Pages per PDF | 3 | `SMART_REVIEW_MAX_PAGES_PER_PDF` |
| Total pages | 12 | `SMART_REVIEW_MAX_TOTAL_PAGES_PER_RUN` |
| Timeout per doc | 15s | `SMART_REVIEW_TIMEOUT_MS` |
| Throttle | 30s | `SMART_REVIEW_THROTTLE_MS` |

### 4.3 Extraction Methods

| File Type | Classification | Model Used |
|-----------|---------------|------------|
| Images (JPEG, PNG, etc.) | `image` | GPT-4o Vision |
| PDF with text layer | `pdf_text` | GPT-4o-mini |
| PDF without text (scanned) | `pdf_scan` | GPT-4o Vision |
| Unsupported | `unsupported` | Skipped |

### 4.4 Warning Taxonomy (36 codes)

**Categories:**
- Upload Missing: 7 codes (`UPLOAD_MISSING_CATEGORY_*`)
- Extraction: 5 codes (`EXTRACT_*`)
- Fact Mismatch: 10 codes (`FACT_MISMATCH_*`)
- Missing Proof: 6 codes (`FACT_MISSING_PROOF_*`)
- Contradictions: 3 codes (`FACT_CONTRADICTION_*`)
- Processing Limits: 3 codes (`SMART_REVIEW_LIMIT_*`)
- Privacy: 2 codes (`PRIVACY_*`)

---

## 5. UX/API Surface Audit - CRITICAL FINDING

### 🔴 Warnings NOT Surfaced to Users

**API Returns:**
```typescript
// route.ts:1559-1561
smart_review: responseData.smart_review ?? null,
smart_review_warnings: smartReviewWarnings,
```

**Frontend Does NOT Consume:**
```bash
# Zero matches in any React component
$ grep -r "smart_review" src/components/ src/app/ --include="*.tsx"
(no output)
```

**StructuredWizard.tsx handles other warnings but NOT smart_review:**
```typescript
// Lines 1540-1544 - What IS handled:
setPreviewBlockingIssues(data.preview_blocking_issues || []);
setPreviewWarnings(data.preview_warnings || []);
setWizardWarnings(data.wizard_warnings || []);
// Note: NO setSmartReviewWarnings(data.smart_review_warnings)
```

### Where Warnings SHOULD Appear (But Don't)

| Surface | Status | Evidence |
|---------|--------|----------|
| Wizard inline | ❌ NOT IMPLEMENTED | No component renders `smart_review_warnings` |
| Preview page | ❌ NOT IMPLEMENTED | `preview/[caseId]/page.tsx` has no smart_review handling |
| Dashboard | ❌ NOT IMPLEMENTED | No smart_review in dashboard components |
| API response | ✅ WORKS | `route.ts:1559-1561` |

### Persistence Status

| Data | Persisted | Location |
|------|-----------|----------|
| Wizard answers | ✅ Yes | Database via `updateWizardFacts()` |
| Uploaded files | ✅ Yes | Storage + database |
| Extraction results | 🔶 Cached only | SHA256 cache in memory |
| Smart Review warnings | ❌ No | Response only, lost on refresh |

### Minimal UI Implementation Plan (DO NOT IMPLEMENT - Audit Only)

To surface warnings, would need:

1. **Add state in StructuredWizard.tsx:**
   ```typescript
   const [smartReviewWarnings, setSmartReviewWarnings] = useState([]);
   // In response handler:
   setSmartReviewWarnings(data.smart_review_warnings || []);
   ```

2. **Create SmartReviewWarnings component:**
   - Display warnings grouped by severity
   - Link to affected upload categories
   - Show extracted vs. wizard values for mismatches

3. **Add to wizard layout:**
   - Either inline after evidence upload steps
   - Or in a collapsible panel

**Effort estimate:** Small (S) - mostly UI work, backend already works.

---

## 6. Claims vs Reality (Critical)

### ✅ We DO:

- Extract text from PDFs using GPT-4o-mini for text-layer PDFs
- Extract text from images/scans using GPT-4o Vision
- Compare extracted facts against user wizard answers
- Generate warnings for potential mismatches with safe language
- Enforce file/page limits and timeouts
- Cache extractions by SHA256
- Never block document generation based on Smart Review
- Return warnings in API response
- Generate court forms (N5, N5B, N119) for Complete Pack
- Generate AI-assisted witness statements and compliance audits

### ❌ We do NOT:

- **Surface Smart Review warnings to users** (critical gap)
- **Persist Smart Review results** (lost on refresh)
- Verify document authenticity
- Reconcile bank arrears calculations
- Guarantee court acceptance
- Provide legal advice
- Validate signatures
- Verify with external registries (DPS, EPC, Gas Safe)
- Run for Money Claims
- Run for non-England jurisdictions

---

## 7. Test Validation Results

### Test Execution

```bash
$ npm test -- tests/complete-pack/ tests/guardrails/
 ✓ tests/complete-pack/england-complete-pack-dataflow.test.ts (16 tests)
 ✓ tests/complete-pack/england-complete-pack.test.ts (24 tests)
 ✓ tests/complete-pack/pre-generation-check.test.ts (18 tests)
 ✓ tests/complete-pack/smart-review-hardening.test.ts (34 tests)
 ✓ tests/complete-pack/smart-review.test.ts (41 tests)
 ✓ tests/guardrails/england-notice-single-source-of-truth.test.ts (22 tests)
 ✓ tests/guardrails/smart-review-safe-language.test.ts (38 tests)
 ✓ tests/guardrails/section21-blocker-validation.test.ts (138 tests)

 Test Files  8 passed (8)
      Tests  331 passed (331)
   Duration  1.94s
```

**All tests pass.** No failures introduced or pre-existing.

---

## 8. Gaps + Recommendations

### Top Priority: Surface Smart Review Warnings

| Gap | Recommendation | Effort | Impact |
|-----|----------------|--------|--------|
| 🔴 Warnings not visible | Add UI component to render `smart_review_warnings` | S | Critical |
| 🔴 Warnings not persisted | Store in `case_facts.smart_review_result` | S | High |
| Warnings lost on refresh | Persist + re-fetch on page load | M | High |
| No re-review button | Add explicit "Re-run Smart Review" action | S | Medium |

### Lower Priority

| Gap | Recommendation | Effort |
|-----|----------------|--------|
| Category-specific prompts | Tune extraction per document type | M |
| Inline wizard warnings | Show relevant warnings next to questions | M |
| Extraction result audit trail | Store all extractions in DB | M |

---

## Appendix: Key Code Entry Points

| Component | File | Key Lines |
|-----------|------|-----------|
| Eviction Pack Generator | `src/lib/documents/eviction-pack-generator.ts` | 756-963 |
| Section 8 Generator | `src/lib/documents/section8-generator.ts` | - |
| Section 21 Generator | `src/lib/documents/section21-generator.ts` | - |
| Official Forms Filler | `src/lib/documents/official-forms-filler.ts` | N5, N5B, N119 |
| Smart Review Orchestrator | `src/lib/evidence/smart-review/orchestrator.ts` | 317-715 |
| Wizard Answer Route | `src/app/api/wizard/answer/route.ts` | 1411-1492 |
| Wizard UI (no SR handling) | `src/components/wizard/StructuredWizard.tsx` | 1540-1544 |
| File Upload Component | `src/components/wizard/FileUpload.tsx` | 16-131 |
| Warnings Definition | `src/lib/evidence/warnings.ts` | 54-101 |
| MQS Config | `config/mqs/complete_pack/england.yaml` | 366-522 |

---

## Conclusion

**Answer to primary question:**
> "Are we asking the right questions, collecting the right evidence uploads, and surfacing meaningful warnings—without overstating what we do?"

**Partial Yes:**
- ✅ Right questions: Comprehensive MQS for S8/S21
- ✅ Right evidence: 10 categorized upload fields with route gating
- ✅ Meaningful warnings: 36 codes with safe language
- 🔴 **NOT surfaced:** Warnings exist in API but never shown to users

**Critical Action Required:**
Smart Review warnings are computed but invisible. Users cannot benefit from the feature until UI rendering is implemented.
