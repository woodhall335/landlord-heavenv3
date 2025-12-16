# Notice Only E2E Fixes - Documentation

## Overview
This document describes the fixes applied to make the Notice Only E2E tests pass for all 5 routes:
- England: section_8, section_21
- Wales: wales_section_173, wales_fault_based
- Scotland: notice_to_leave

## Issues Fixed

### 1. Section 21 Data Mapping (`route.ts:207-230`)
**Problem:** Section 21 notice was using `caseFacts` instead of `templateData`, causing missing/improperly formatted addresses and dates.

**Fix:** Changed to use `templateData` which includes:
- Properly formatted landlord_address (concatenated multi-line)
- Properly formatted property_address
- UK-formatted dates (DD Month YYYY)
- Calculated possession_date

**Files Changed:**
- `src/app/api/notice-only/preview/[caseId]/route.ts`

---

### 2. Scotland Notice to Leave Data & Date Calculations (`route.ts:456-635`)
**Problem:**
- Scotland notices used `caseFacts` instead of enriched `templateData`
- Missing date calculations (notice_date, earliest_leaving_date, earliest_tribunal_date)
- Cover page showed wrong notice type ("Section 8 Notice" instead of "Notice to Leave")
- Landlord address was blank

**Fix:**
- Use `mapNoticeOnlyFacts()` to build properly formatted template data
- Calculate Scotland-specific dates:
  - `notice_date` from wizard facts or service_date
  - `earliest_leaving_date` = notice_date + notice_period (84 days for Ground 1 rent arrears, 28 days otherwise)
  - `earliest_tribunal_date` = same as earliest_leaving_date
- Process eviction grounds into structured format with legal_basis
- Handle pre-formatted landlord_address (Scotland uses multi-line string)
- Pass templateData to all Scotland document generators (notice, service instructions, pre-action checklist, tribunal guide)

**Helper Function Added:**
- `getScotlandGroundLegalBasis(groundNumber)` - Returns legal basis text for each Scotland eviction ground

**Files Changed:**
- `src/app/api/notice-only/preview/[caseId]/route.ts`

---

### 3. Cover Page Jurisdiction & Notice Type Labels (`notice-only-preview-merger.ts:175-224`)
**Problem:**
- Wales notices showed "Jurisdiction: England"
- Scotland notices showed "Notice Type: Section 8 Notice (Fault-Based)"

**Fix:**
- Improved jurisdiction detection to check both `jurisdiction` field and `notice_type`
- Added jurisdiction suffix to all notice type labels for clarity:
  - England: "Section 8 Notice (Fault-Based) - England"
  - Wales: "Section 173 Notice (No-Fault) - Wales"
  - Scotland: "Notice to Leave - Scotland (PRT)"

**Files Changed:**
- `src/lib/documents/notice-only-preview-merger.ts`

---

### 4. Wales Supporting Documents (`route.ts:369-506`)
**Problem:**
- Wales packs used England/Wales service instructions that cited Housing Act 1988 (wrong for Wales)
- Supporting docs showed "England" jurisdiction
- Wales fault-based notice template didn't exist

**Fix:**
- Created Wales-specific service instructions template referencing Renting Homes (Wales) Act 2016
- Created Wales fault-based notice template for breach of contract notices (Sections 157-162)
- Updated preview route to use Wales-specific templates
- Added Wales-specific flags (is_wales_section_173, is_wales_fault_based)
- Added breach type detection for rent arrears vs other breaches

**Files Created:**
- `config/jurisdictions/uk/wales/templates/eviction/fault_based_notice.hbs`
- `config/jurisdictions/uk/wales/templates/eviction/service_instructions.hbs`

**Files Changed:**
- `src/app/api/notice-only/preview/[caseId]/route.ts`

---

### 5. Scotland Landlord Address Handling (`normalize.ts:1899-1952`)
**Problem:**
- Scotland E2E test provides `landlord_address` as pre-formatted multi-line string:
  ```
  landlord_address: '50 Edinburgh Way\nEdinburgh\nEH1 1AA'
  ```
- Mapper was trying to split it into line1 instead of using it as-is

**Fix:**
- Detect pre-formatted addresses (contain newlines)
- If pre-formatted: use as-is and extract individual lines for fallback
- If separate fields: build from landlord_address_line1, landlord_city, etc.
- This supports both Scotland style (pre-formatted) and England/Wales style (separate fields)

**Files Changed:**
- `src/lib/case-facts/normalize.ts`

---

## Template Selection by Route

### England section_8
- **Notice:** `uk/england-wales/templates/eviction/section8_notice.hbs`
- **Supporting:** England/Wales service instructions, compliance checklist, next steps guide

### England section_21
- **Notice:** `uk/england-wales/templates/eviction/section21_form6a.hbs`
- **Supporting:** England/Wales service instructions, compliance checklist, next steps guide

### Wales wales_section_173
- **Notice:** `uk/wales/templates/eviction/section173_landlords_notice.hbs`
- **Supporting:** Wales service instructions, England/Wales compliance checklist (with is_wales flag), England/Wales next steps (with is_wales flag)

### Wales wales_fault_based
- **Notice:** `uk/wales/templates/eviction/fault_based_notice.hbs`
- **Supporting:** Wales service instructions, England/Wales compliance checklist (with is_wales flag), England/Wales next steps (with is_wales flag)

### Scotland notice_to_leave
- **Notice:** `uk/scotland/templates/eviction/notice_to_leave.hbs`
- **Supporting:** Scotland service instructions, pre-action checklist (Ground 1 only), tribunal guide

---

## Field Mapping for E2E Tests

All routes use `mapNoticeOnlyFacts()` in `src/lib/case-facts/normalize.ts` which:

1. Extracts wizard facts using flexible key lookups
2. Concatenates addresses into multi-line format
3. Maps Wales-specific fields (contract_holder_full_name, contract_start_date)
4. Maps Scotland-specific fields (landlord_reg_number, earliest_leaving_date)
5. Handles both pre-formatted addresses and separate field addresses

### Key Fields by Jurisdiction

**All Jurisdictions:**
- landlord_full_name, landlord_address, landlord_email, landlord_phone
- property_address (multi-line concatenated)
- rent_amount, rent_frequency
- service_date, notice_date

**England/Wales:**
- tenant_full_name
- tenancy_start_date
- grounds (for Section 8)

**Wales:**
- contract_holder_full_name (fallback to tenant_full_name)
- contract_start_date (fallback to tenancy_start_date)
- wales_contract_category
- rent_smart_wales_registered
- deposit_scheme_wales_s173 or deposit_scheme_wales_fault

**Scotland:**
- earliest_leaving_date (calculated)
- earliest_tribunal_date (calculated)
- notice_period_days (calculated: 84 for Ground 1, 28 otherwise)
- eviction_grounds (processed into structured format)

---

## Validation Checks

The E2E test (`scripts/prove-notice-only-e2e.ts`) validates:

1. **File exists and has minimum size** (>40KB)
2. **Valid PDF header** (%PDF-)
3. **Expected phrases present:**
   - Jurisdiction-specific legal references
   - Party names (landlord, tenant/contract-holder)
   - Property addresses
4. **Forbidden phrases absent:**
   - `undefined`, `{{`, `}}`
   - Wrong jurisdiction references (e.g., "Section 21" in Wales notice)
   - Wrong terminology (e.g., "tenant" in Wales should be "contract holder")

---

## Testing

Run the E2E test:
```bash
npx tsx scripts/prove-notice-only-e2e.ts
```

Expected output:
```
✅ PASS | england    | section_8
✅ PASS | england    | section_21
✅ PASS | wales      | wales_section_173
✅ PASS | wales      | wales_fault_based
✅ PASS | scotland   | notice_to_leave

📊 Results: 5/5 routes passed
```

Generated PDFs saved to: `artifacts/notice_only/{jurisdiction}/{route}.pdf`
