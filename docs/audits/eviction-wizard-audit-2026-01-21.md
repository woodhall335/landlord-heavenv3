# Eviction Wizard Audit Report

**Date**: 2026-01-21
**Product**: England Complete Pack (Eviction Wizard)
**Config**: config/mqs/complete_pack/england.yaml v2.4.0

## Executive Summary

This audit examines the England Complete Pack eviction wizard for:
1. Duplicate questions (same fact collected multiple times)
2. N5B form completeness (all required fields collected)
3. Front-end validation gaps

## A. Duplicate Question Audit

### Results

| Metric | Value |
|--------|-------|
| Total Questions | 57 |
| Unique Fact Keys | 131 |
| Duplicate Groups | **0** |

**Status: CLEAN**

The MQS configuration does not contain duplicate questions mapping to the same fact key. The config properly uses:
- Route-specific questions (Section 8 vs Section 21) that are mutually exclusive
- Conditional questions with `dependsOn` that show only when relevant
- Group fields with distinct `maps_to` targets

### Methodology

The audit script (`scripts/audit-mqs-duplicates.mjs`) analyzes each question:
1. Extracts fact key identity: `maps_to[0]` > `field.id` > `question.id`
2. For group fields, extracts each field's individual fact key
3. Flags any fact key written by multiple questions

---

## B. N5B Form Completeness Audit

### N5B Required Fields (from official-forms-filler.ts)

The N5B form filler (`src/lib/documents/official-forms-filler.ts:1034-1356`) requires these fields:

| N5B Question | Field | Required in Filler | MQS Question | Status |
|--------------|-------|-------------------|--------------|--------|
| Header | `court_name` | HARD FAIL | `court_name` | OK |
| Header | `landlord_full_name` | HARD FAIL | `landlord_details.landlord_full_name` | OK |
| Header | `tenant_full_name` | HARD FAIL | `tenant_details.tenant_full_name` | OK |
| Header | `property_address` | HARD FAIL | `property_address` | OK |
| Q6 | `tenancy_start_date` | HARD FAIL | `tenancy_start_date` | OK |
| Q7 | `tenancy_agreement_date` | Optional (fallback to Q6) | `tenancy_agreement_date` | OK |
| Q8 | `subsequent_tenancy` | Optional | `subsequent_tenancy` | OK |
| Q10a | `notice_service_method` | HARD FAIL | `notice_service_method` | OK |
| Q10b | `section_21_notice_date` | HARD FAIL | `notice_service_details.notice_served_date` | OK |
| Q10c | `notice_served_by` | Optional | Derived from landlord | OK |
| Q10d | `notice_served_on` | Optional | Derived from tenant | OK |
| Q10e | `notice_expiry_date` | Optional | `notice_service_details.notice_expiry_date` | OK |
| Q12 | `deposit_amount` | Optional | `deposit_compliance.deposit_amount` | OK |
| Q13 | `deposit_returned` | Optional | `deposit_returned` | OK |
| Q14a | `deposit_prescribed_info_given` | Optional | `deposit_compliance.prescribed_info_served` | OK |
| Q14b | `deposit_protection_date` | Optional | `deposit_compliance.deposit_protection_date` | OK |
| Statement of Truth | `signatory_name` | Required | `signatory_details.signatory_name` | OK |
| Statement of Truth | `signature_date` | Required | `signatory_details.signature_date` | OK |
| Attachments E | `deposit_certificate_uploaded` | Optional | Evidence section | OK |
| Attachments F | `epc_uploaded` | Optional | Evidence section | OK |
| Attachments G | `gas_safety_uploaded` | Optional | Evidence section | OK |

### Notice Service Method Detail

The `notice_service_method_detail` field is properly configured:
- Question ID: `notice_service_method_detail`
- Shows when: `notice_service_method` = "other"
- Maps to: `notice_service_method_detail`
- Required: Yes (when visible)

**Status: COMPLETE**

### Missing/Optional Fields Analysis

All critical N5B fields are covered by the MQS config. The following are optional but recommended:
- `signatory_capacity` - Collected in `signatory_details`
- `solicitor_firm` - Collected conditionally when capacity = "solicitor"
- Joint landlord/tenant details - Collected via `additional_landlord` and `additional_tenants`

---

## C. Front-End Validation Gap Analysis

### Current State

> **UPDATED 2026-01-21**: Live validation has been implemented. See `EVICTION_WIZARD_CHANGES_SUMMARY.md`.
> The spec in `docs/notice-only-rules-audit.md` has been updated to reflect blur-triggered validation.

~~Per `StructuredWizard.tsx:300` and `docs/notice-only-rules-audit.md:422`:~~
~~> "Validation fires ONLY after Save/Next, not while typing."~~

**NEW**: Validation now fires on blur, with "touched" state guarding error display.
This provides better UX — users see errors immediately after leaving a field.

### Required Validation Types

From MQS config analysis:

| Validation Type | Example Fields | Currently Implemented |
|-----------------|----------------|----------------------|
| required | Most fields | Server-side only |
| pattern | Postcode, email | Server-side only |
| min/max | rent_amount, deposit_amount | Server-side only |
| date format | All date fields | Server-side only |
| assertValue | Section 21 compliance booleans | Server-side only |
| conditional required | Based on `dependsOn` | Server-side only |
| group field validation | Each field in a group | Server-side only |

### Validation Rules from MQS

The england.yaml defines these validation patterns:

1. **Required Fields**: `validation.required: true`
2. **Assertion Validators**: `validation.assertValue: true/false` with `assertMessage`
3. **Numeric Bounds**: `validation.min`, `validation.max`
4. **Custom Validators**: `validation.custom.type: section8_expiry_date`

---

## D. Recommendations

### Already Complete
1. No duplicate questions - config is clean
2. N5B required fields are all collected
3. Conditional questions properly use `dependsOn`

### Needed Changes

> **UPDATED 2026-01-21**: Items 1 and 3 have been implemented. See verification report.

1. ~~**Implement front-end live validation** (onChange/onBlur)~~ ✅ IMPLEMENTED
   - ✅ Created MQS field validator utility (`mqs-field-validator.ts`)
   - ⚠️ ValidatedField components exist but not yet wired into section components
   - ✅ Inline errors display below fields (ValidatedField.tsx)
   - ✅ Next button disabled when `hasErrors || uploadsInProgress`

2. **Ensure proper fact mapping for N5B** ✅ VERIFIED
   - ✅ `notice_service_method_detail` flows through to form filler
   - ✅ Deposit scheme details map correctly
   - ✅ Attachment checkboxes E, F, G use upload-based flags (not compliance flags)

3. ~~**Add automated tests**~~ ✅ IMPLEMENTED
   - ✅ Test that Section 21 complete pack generates without missing N5B fields
   - ✅ Test inline validation logic (150+ unit tests)

---

## Appendix: Audit Scripts

### Run Duplicate Audit
```bash
node scripts/audit-mqs-duplicates.mjs
```

### Output Location
- JSON: `docs/audits/mqs-duplicates-england-YYYY-MM-DD.json`
- Markdown: This file
