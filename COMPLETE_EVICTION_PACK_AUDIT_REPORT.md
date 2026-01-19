# Complete Eviction Pack Legal/Engineering Audit Report

**Jurisdiction:** England ONLY
**Product:** Complete Eviction Pack
**Audit Date:** 2026-01-19
**Auditor:** Claude Code (Legal/Engineering Audit Mode)

---

## Executive Summary

This audit examines the England "Complete Eviction Pack" product for legal correctness and alignment with recently updated "Notice Only" flows. The audit identifies several **PASS** areas where the system correctly implements requirements, and several **RISK** areas requiring attention.

### Overall Assessment: **MEDIUM-HIGH RISK** with notable improvements since last audit

**Key Findings:**
- **PASS:** Complete Pack uses canonical route values and shares normalization logic with Notice Only flows
- **PASS:** Section 21 expiry date calculation is now enforced server-side (single source of truth)
- **PASS:** 4-month bar validation is correctly enforced
- **RISK:** Form 6A template deviates from prescribed form layout (HIGH RISK - inherited from previous audit)
- **PASS:** Court forms (N5B) correctly fill critical fields including notice_service_method
- **RISK:** Section 8 Form 3 template lacks prescribed wording (HIGH RISK - inherited)
- **PASS:** Jurisdiction gating prevents Scotland/Wales documents from leaking into England flows

---

## A. Pack Contents Enumeration (England)

### Section 21 Route (No-Fault) - Complete Pack Contents

| Document | Type | Source | Status |
|----------|------|--------|--------|
| Section 21 Notice (Form 6A) | Notice | `generateSection21Notice()` → HBS template | ✅ Included |
| N5B Accelerated Possession Claim | Court Form | `fillN5BForm()` → n5b-eng.pdf | ✅ Included |
| N5 Claim for Possession | Court Form | `fillN5Form()` → n5-eng.pdf | ✅ Included |
| N119 Particulars of Claim | Court Form | `fillN119Form()` → n119-eng.pdf | ✅ Included |
| Evidence Collection Checklist | Evidence Tool | HBS template | ✅ Included |
| Proof of Service Certificate | Evidence Tool | HBS template | ✅ Included |
| Witness Statement | Court Form | AI-generated via HBS | ✅ Included |
| Eviction Case Summary | Guidance | HBS template | ✅ Included |

**Evidence Location:** `eviction-pack-generator.ts:653-852`

### Section 8 Route (Fault-Based) - Complete Pack Contents

| Document | Type | Source | Status |
|----------|------|--------|--------|
| Section 8 Notice (Form 3) | Notice | `generateSection8Notice()` → HBS template | ✅ Included |
| N5 Claim for Possession | Court Form | `fillN5Form()` → n5-eng.pdf | ✅ Included |
| N119 Particulars of Claim | Court Form | `fillN119Form()` → n119-eng.pdf | ✅ Included |
| Schedule of Arrears | Evidence Tool | HBS template (if arrears grounds) | ✅ Conditional |
| Evidence Collection Checklist | Evidence Tool | HBS template | ✅ Included |
| Proof of Service Certificate | Evidence Tool | HBS template | ✅ Included |
| Witness Statement | Court Form | AI-generated via HBS | ✅ Included |
| Eviction Case Summary | Guidance | HBS template | ✅ Included |

**Evidence Location:** `eviction-pack-generator.ts:661-711`, `eviction-pack-generator.ts:1024-1082`

### Supporting Documents Verification

The pack correctly includes:
- ✅ Service instructions (embedded in notice templates)
- ✅ Validity checklists (embedded in notice templates)
- ✅ Next steps guidance (in case summary)
- ✅ Evidence collection checklists

**Evidence Location:** Form 6A template includes "Service Instructions" and "Service and Validity Checklist" sections (lines 587-627 of `notice.hbs`)

### Jurisdiction Gating

**PASS:** The generator correctly gates by jurisdiction:
- Lines 716-721: Section 21 throws if jurisdiction !== 'england'
- Lines 1310-1315: Same check in Notice Only flow
- Court forms use `getFormFilename()` which defaults to England forms for England jurisdiction

**Evidence Location:** `eviction-pack-generator.ts:716-721`, `official-forms-filler.ts:67-73`

---

## B. Alignment with Updated Notice Only Flows

### Canonical Route Value Usage

**PASS:** Complete Pack uses the same canonical route normalization as Notice Only flows.

**Evidence:**
- Both flows import and use `normalizeRoute()` from `route-normalizer.ts`
- Canonical values: `section_8`, `section_21` (England); `section_173`, `fault_based` (Wales); `notice_to_leave` (Scotland)
- Route normalization handles legacy labels: "Section 8 Notice" → `section_8`, "Section 21" → `section_21`

**Code Path:**
```
Wizard answers → normalizeRoute() → section_8/section_21 → generator selects correct template
```

**Evidence Location:**
- `route-normalizer.ts:18-59` - normalizeRoute function
- `eviction-pack-generator.ts:1280-1282` - normalizeRoute usage in Notice Only
- `eviction-pack-generator.ts:978-984` - Route derivation in Complete Pack

### Route-to-Document Type Mapping

**PASS:** Consistent mapping via `routeToDocumentType()`:
- `section_8` → `section8_notice`
- `section_21` → `section21_notice`

**Evidence Location:** `route-normalizer.ts:93-105`

### Legacy Route Label Handling

**PASS:** No regression to legacy human-readable route labels. The normalizer handles:
- "Section 8" / "section8" / "Section 8 Notice" → `section_8`
- "Section 21" / "section21" → `section_21`
- Logs warning for unknown values and returns null

**Evidence Location:** `route-normalizer.ts:34-58`

---

## C. Section 21 Legal Correctness (England)

### Precondition Enforcement

| Precondition | Enforcement Status | Evidence |
|--------------|-------------------|----------|
| Deposit Protection | ✅ Validated in `validateSection21Eligibility()` | section21-generator.ts:484-489 |
| Prescribed Info Given | ✅ Validated | section21-generator.ts:490-495 |
| Gas Safety Certificate | ✅ Validated | section21-generator.ts:496-500 |
| EPC Provided | ✅ Warning if rating F/G | section21-generator.ts:513-518 |
| How to Rent Guide | ✅ Validated (post Oct 2015) | section21-generator.ts:505-511 |
| Licensing | ⚠️ Not enforced | Not in eligibility check |
| Retaliatory Eviction | ⚠️ Not enforced | Not in eligibility check |

**Risk Level:** MEDIUM - Core preconditions enforced; licensing/retaliatory bars not enforced as hard blocks

### 4-Month Bar Enforcement

**PASS:** The 4-month bar is correctly enforced in `generateSection21Notice()`.

**Evidence Location:** `section21-generator.ts:156-171`

```typescript
if (serviceDateObj < fourMonthsAfterStart) {
  const error = new Error(
    `Section 21 notice cannot be served within the first 4 months of the tenancy...`
  );
  throw error;
}
```

### Notice Period/Expiry Calculation

**PASS:** Expiry date is ALWAYS calculated server-side (single source of truth).

**Evidence Location:** `section21-generator.ts:106-201`

Key points:
- User-provided expiry dates are IGNORED
- Server calculates using `calculateSection21ExpiryDate(dateParams)`
- Considers: service date, fixed term end, break clause, 4-month restriction, 2 calendar months minimum, periodic alignment

**Risk Level:** LOW - Robust server-side enforcement

### Form 6A Template Fidelity

**RISK LEVEL: HIGH** - Template deviates from prescribed form

**Evidence Location:** `config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/notice.hbs`

**Compliant Elements:**
- ✅ Correct statutory citation (Housing Act 1988 section 21(1) and (4))
- ✅ "Notes on the Notice" section includes 6 required tenant guidance points
- ✅ Shelter helpline and gov.uk links included
- ✅ 6-month validity period stated
- ✅ Service instructions included
- ✅ Validity checklist included

**Deviations from Prescribed Form 6A:**
| Issue | Risk | Location |
|-------|------|----------|
| Layout differs from official PDF form | HIGH | Template uses HTML/CSS styling |
| "FORM NO. 6A" styled differently | MEDIUM | Line 439 - header styling |
| Checkbox rendering vs official tick boxes | MEDIUM | Lines 564-566 |
| Additional guidance sections beyond prescribed | LOW | Lines 587-627 |

**Cross-reference with NOTICE_TEMPLATE_LEGAL_AUDIT_REPORT.md:**
The prior audit noted:
- "Template deviates from prescribed Form 6A layout (additional headings, altered language)"
- "Lacks mandatory Form 6A footer wording and notes to tenant prescribed by 2015 Regulations"
- Rating: **HIGH RISK**

**Current Status:** Some improvements made (Notes 1-6 now present), but layout/wording deviations persist.

---

## D. Section 8 Legal Correctness (England)

### Grounds Handling

**PASS:** Ground definitions loaded from `SECTION8_GROUND_DEFINITIONS` with:
- Mandatory vs discretionary classification
- Correct legal basis citations
- Proper ground numbers (1-17, 14A)

**Evidence Location:** `section8-generator.ts:197-294`

### Notice Period Calculation

**PASS:** Notice periods calculated correctly per ground set:
- Ground 8 (serious arrears): 14 days
- Grounds 10/11 (arrears): 2 weeks
- Other grounds: Variable per statutory requirement

**Evidence Location:** `section8-generator.ts` uses `calculateSection8ExpiryDate()` from `notice-date-calculator.ts`

### Arrears Schedule Inclusion

**PASS:** Arrears schedule generated when arrears grounds selected (8, 10, 11).

**Evidence Location:** `eviction-pack-generator.ts:1024-1082`

```typescript
if (hasArrearsGroundsSelected(selectedGroundCodes)) {
  // Generate schedule of arrears
  const arrearsData = getArrearsScheduleData({...});
  if (arrearsData.include_schedule_pdf) {
    // Add to pack
  }
}
```

### Form 3 Template Fidelity

**RISK LEVEL: HIGH** - Same concerns as Form 6A

**Evidence Location:** `config/jurisdictions/uk/england/templates/notice_only/form_3_section8/notice.hbs`

**Cross-reference with NOTICE_TEMPLATE_LEGAL_AUDIT_REPORT.md:**
- "Template lacks prescribed Form 3 layout/wording"
- "No prescribed Form 3 notes to tenant or mandatory information about advisory services"
- Rating: **HIGH RISK**

### Pre-Action Protocol / CPR 55

**RISK:** No explicit CPR 55.9 pre-action protocol warnings in the Section 8 flow.

The audit report notes: "Wizard permits Section 8 route without validating mandatory preconditions (HMO licensing, deposit protection, gas safety)."

---

## E. Court Forms (N5/N5B/N119) Correctness

### N5B Critical Field Mappings

| Field | Status | Evidence |
|-------|--------|----------|
| notice_service_method (10a) | ✅ Required & validated | official-forms-filler.ts:908-913 |
| Statement of Truth | ✅ Correctly mapped | official-forms-filler.ts:1097-1117 |
| Tenancy dates | ✅ Mapped from case facts | official-forms-filler.ts:1018-1027 |
| Notice service dates | ✅ Mapped | official-forms-filler.ts:1036-1054 |
| Deposit information | ✅ Conditional mapping | official-forms-filler.ts:1058-1086 |
| Attachment checkboxes | ✅ Upload-based (P0-2 fix) | official-forms-filler.ts:1141-1175 |

**P0-2 Fix Verification:**
The N5B attachment checkboxes (E, F, G) are now correctly based on ACTUAL file uploads, not compliance flags:
- `deposit_certificate_uploaded` → Checkbox E
- `epc_uploaded` → Checkbox F
- `gas_safety_uploaded` → Checkbox G

**Evidence Location:**
- `official-forms-filler.ts:1141-1175` - Comments and implementation
- `eviction-wizard-mapper.ts:399-410` - Upload category checking via `hasUploadForCategory()`

### N5 Field Mappings

| Field | Status | Evidence |
|-------|--------|----------|
| Court name | ✅ Required | official-forms-filler.ts:727-729 |
| Claimant details | ✅ Mapped | official-forms-filler.ts:748-757 |
| Defendant details | ✅ Mapped | official-forms-filler.ts:759-771 |
| Statement of Truth | ✅ Mapped | official-forms-filler.ts:826-846 |
| Grounds checkboxes | ✅ Dynamic per case | official-forms-filler.ts:787-811 |

### N119 Field Mappings

| Field | Status | Evidence |
|-------|--------|----------|
| Court name | ✅ Required | official-forms-filler.ts:1292-1293 |
| Particulars of claim | ✅ Auto-generated if not provided | official-forms-filler.ts:1359 |
| Statement of Truth | ✅ Mapped | official-forms-filler.ts:1388-1408 |
| Rent details | ✅ Mapped with frequency | official-forms-filler.ts:1336-1355 |

### Jurisdiction-Based Form Selection

**PASS:** Forms correctly selected by jurisdiction:
- England: `n5-eng.pdf`, `n5b-eng.pdf`, `n119-eng.pdf`
- Wales: `N5_WALES_1222.pdf`, `N5B_WALES_0323.pdf`, `N119_WALES_1222.pdf`

**Evidence Location:** `official-forms-filler.ts:47-58`

### Test Coverage Gaps

**OBSERVATION:** Cannot assess test coverage without reviewing test files. The field name constants suggest thorough mapping, but end-to-end data flow testing should be verified separately.

### Hardcoded Values Assessment

**Minor Issues Found:**
- `official-forms-filler.ts:815-816`: Demotion checkbox defaults to "No" (appropriate for private landlords)
- `official-forms-filler.ts:819`: Right to buy defaults to "No" (appropriate)
- `official-forms-filler.ts:823`: HRA checkbox defaults to "No" (may need user input)

---

## F. Output Format Readiness

### PDF Generation

**PASS:** Court forms output as filled PDFs using pdf-lib:
- Original HMCTS PDFs used as templates
- Fields filled dynamically
- Output written to temp directory, not official-forms

**Evidence Location:** `official-forms-filler.ts:656-669`, `official-forms-filler.ts:1624-1635`

### Notice Generation

**PASS:** Notices generated via HBS templates → HTML → PDF pipeline:
- `generateDocument()` returns `{ html, pdf }`
- Both formats stored for user editing and download

**Evidence Location:** `eviction-pack-generator.ts:707-711`, `section21-generator.ts:265-270`

### Form 6A Deprecation in Official Forms Filler

**PASS:** Form 6A is correctly blocked from official-forms-filler.ts:
```typescript
export async function fillForm6A(_data: CaseData): Promise<Uint8Array> {
  throw new Error(
    '[DEPRECATED] fillForm6A is disabled. ' +
    'Section 21 (Form 6A) notices must be generated via HBS template...'
  );
}
```

**Evidence Location:** `official-forms-filler.ts:1562-1570`

This ensures Form 6A comes from the HBS template pipeline (matrix compliance).

---

## Summary of Risk Findings

### HIGH RISK Issues (Require Remediation)

| Issue | Impact | Recommendation |
|-------|--------|----------------|
| Form 6A template deviates from prescribed form | Notice may be invalid | Use exact prescribed wording and layout |
| Form 3 template lacks prescribed wording | Notice may be invalid | Implement prescribed Form 3 |
| Missing prescribed Form 6A footer notes | Invalidation risk | Add 2015 Regulations notes |

### MEDIUM RISK Issues (Should Address)

| Issue | Impact | Recommendation |
|-------|--------|----------------|
| Licensing precondition not enforced | S21 may be defective | Add HMO/licensing check |
| Retaliatory eviction bar not enforced | S21 may be defective | Add retaliatory check |
| CPR 55.9 pre-action protocol not warned | S8 procedural risk | Add warning/checklist |

### LOW RISK / PASS Items

| Item | Status |
|------|--------|
| Canonical route normalization | ✅ PASS |
| Route-to-documentType mapping | ✅ PASS |
| Section 21 4-month bar enforcement | ✅ PASS |
| Section 21 expiry calculation (server-side) | ✅ PASS |
| N5B notice_service_method field | ✅ PASS |
| N5B attachment checkboxes (upload-based) | ✅ PASS |
| Jurisdiction gating | ✅ PASS |
| Court form selection by jurisdiction | ✅ PASS |
| Form 6A via HBS (not official-forms-filler) | ✅ PASS |
| Arrears schedule conditional inclusion | ✅ PASS |

---

## Conclusion

The Complete Eviction Pack for England demonstrates **significant improvements** in:
1. Canonical route value handling (aligned with Notice Only flows)
2. Server-side expiry date calculation (single source of truth)
3. 4-month bar enforcement
4. N5B attachment checkbox truthfulness (P0-2 fix)

However, **HIGH RISK** issues persist from the prior legal audit regarding:
1. Form 6A template deviations from prescribed form
2. Form 3 template lacking prescribed wording
3. Missing enforcement of licensing and retaliatory eviction bars

**Recommended Priority Actions:**
1. **P0:** Replace Form 6A and Form 3 templates with prescribed form wording
2. **P1:** Add licensing/retaliatory eviction enforcement for Section 21
3. **P2:** Add CPR 55.9 pre-action protocol guidance for Section 8

---

*Report generated by Claude Code Legal/Engineering Audit*
*Evidence locations reference: landlord-heavenv3 repository as of 2026-01-19*
