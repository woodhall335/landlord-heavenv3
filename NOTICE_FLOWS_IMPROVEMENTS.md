# Notice Flows Improvements - Implementation Summary

## Overview

This document summarizes the improvements made to notice flows (E&W + Scotland) to make them legally valid by default, obvious to users, and consistent across Notice Only + Complete Pack products.

## ✅ Completed: Part A - Auto-calculate expiry/leave dates

### What was implemented:

#### 1. **Comprehensive Date Calculation Library** (`src/lib/documents/notice-date-calculator.ts`)

Created a central library that handles all notice date calculations with full legal compliance:

- **Section 8 (E&W)**:
  - Calculates notice period based on grounds selected
  - Mandatory grounds (1-8) + Ground 14/14A: 14 days minimum
  - Discretionary grounds (10-17): 60 days recommended
  - Mixed grounds: Uses longest period for safety
  - Respects fixed-term end dates

- **Section 21 (E&W)**:
  - Minimum 2 months notice (60 days)
  - 4-month rule: Cannot expire before 4 months after tenancy start
  - Fixed term: Must expire on or after last day of fixed term
  - Periodic tenancy: Aligns expiry with end of rent period
  - Handles weekly, fortnightly, monthly, quarterly, yearly rent periods

- **Notice to Leave (Scotland)**:
  - Ground-specific notice periods (28 or 84 days)
  - Grounds 1-3, 9-13, 16, 18: 28 days
  - Grounds 4-8, 14-15, 17: 84 days
  - Multiple grounds: Uses longest period

#### 2. **Enhanced Document Generators**

Updated all three notice generators to use the new calculation library:

- **`src/lib/documents/section8-generator.ts`**:
  - Auto-calculates `earliest_possession_date` if not provided
  - Validates provided dates against legal minimums
  - Returns 422 error with precise explanation if invalid
  - Stores `earliest_possession_date_explanation` for UI display

- **`src/lib/documents/scotland/notice-to-leave-generator.ts`**:
  - Auto-calculates `earliest_leaving_date` if not provided
  - Validates provided dates against ground-specific minimums
  - Returns 422 error with precise explanation if invalid
  - Stores `earliest_leaving_date_explanation` for UI display

- **`src/lib/documents/section21-generator.ts`** (NEW):
  - Created dedicated Section 21 generator
  - Auto-calculates `expiry_date` with full compliance
  - Implements `validateSection21Eligibility()` for compliance checks
  - Returns 422 error with precise explanation if invalid
  - Stores `expiry_date_explanation` for UI display

#### 3. **Date Validation API** (`src/app/api/notices/validate-dates/route.ts`)

Created REST API for real-time date validation:

- **POST `/api/notices/validate-dates`**:
  - Accepts `notice_type` (section_8, section_21, notice_to_leave)
  - Accepts `proposed_date` and calculation parameters
  - Returns 200 if valid
  - Returns 422 if invalid with:
    - `errors`: Array of specific validation errors
    - `earliest_valid_date`: Calculated minimum legal date
    - `suggested_date`: Recommended date
    - Precise explanation of which rule failed

### Key Features:

1. **Plain English Explanations**: Each calculation includes human-readable explanation
   - Example: "We calculated this date by adding 60 days to your service date (15 January 2025). You have selected discretionary grounds, which require a minimum of 2 months notice."

2. **Legal References**: All calculations include legal basis
   - Example: "Housing Act 1988, Section 8(4)(b) - Discretionary grounds require reasonable notice"

3. **Validation with Precision**: Hard-fail (422) if dates invalid
   - Example: "The proposed expiry date is too early. The earliest legally valid date is 16 March 2025 (60 days from service date). Legal basis: Housing Act 1988, Section 21(4) - Minimum 2 months notice"

4. **Warnings for Edge Cases**:
   - Fixed term alignment
   - 4-month rule for Section 21
   - Rent period alignment for periodic tenancies

## 📝 Remaining Work

### Part B: Eligibility Gating

**Status**: Partially implemented in Section 21 generator

**Remaining work**:
1. Integrate `validateSection21Eligibility()` into decision engine
2. Update wizard flow to:
   - Call eligibility check before showing S21 option
   - Show clear message: "Section 21 isn't available because [reason]"
   - Auto-route to Section 8 with appropriate grounds
3. Update preview page to not show S21 documents if disallowed
4. Add regression tests for:
   - S21 allowed (all compliance met)
   - S21 blocked (deposit not protected)
   - S21 blocked (prescribed info missing)
   - S21 blocked (gas cert missing)
   - S21 blocked (How to Rent not provided)

### Part C: Fix Notice PDF Formatting + Footer Domain

**Status**: Not started

**Remaining work**:
1. Check if markdown (###, **) in templates is properly converted to HTML/styled PDF
2. Review generator.ts to ensure Puppeteer CSS styling handles headings and bold correctly
3. Search for `[object Object]` in template output (likely caused by unformatted address/party objects)
4. Add Handlebars helpers to format structured fields as strings
5. Find and update footer domain references to `landlordheaven.com`
6. Create centralized config for domain/footer

### Part D: Fix Preview Page (Product-Specific Copy + Pricing)

**Status**: Not started

**Location**: `src/app/wizard/preview/[caseId]/page.tsx`

**Remaining work**:
1. Update copy per product:
   - `notice_only`: "Notice Preview" + notice deliverables only
   - `complete_pack`: Show full eviction pack deliverables
   - Scotland: Use "Notice to Leave" language
2. Fix pricing to read from `src/config/pricing.ts`:
   - NOTICE_ONLY: £29.99
   - COMPLETE_PACK: £149.99
3. Ensure preview shows correct documents based on jurisdiction and product

### Part E: Improve Grounds UX + Ask Heaven

**Status**: Not started

**Remaining work**:
1. Add route recommendation card from decision engine
2. Improve Section 8 grounds selection UI:
   - Show plain-English descriptions per ground
   - Show evidence hints per ground
   - Suggest likely grounds based on earlier answers (arrears => 8/10/11)
   - Do NOT auto-select
3. Add "Describe what happened" textarea
4. Integrate Ask Heaven to enhance description
5. Store both raw and enhanced text
6. Use enhanced version in documents

### Part F: Add Tests

**Status**: Not started

**Remaining work**:

#### Unit Tests:
1. `src/lib/documents/__tests__/notice-date-calculator.test.ts`:
   - Test Section 8 date calculation for each ground
   - Test Section 21 with different tenancy scenarios
   - Test Scotland notice periods for all 18 grounds
   - Test validation functions return correct 422 errors
   - Test edge cases (fixed term, periodic, rent period alignment)

#### Integration Tests:
2. Test Notice Only + Complete Pack flow integration
3. Test shared generators work for both products

#### E2E Tests:
3. Complete Notice Only flow (E&W Section 8):
   - Create case
   - Answer wizard questions
   - Select grounds
   - Auto-calculate expiry date
   - Generate notice
   - Verify PDF
4. Complete Notice Only flow (Scotland):
   - Create case
   - Answer wizard questions
   - Select grounds
   - Auto-calculate leaving date
   - Generate notice
   - Verify PDF

## How to Verify (Manual Testing)

### Test 1: Section 8 Auto-calculation

1. Start wizard for eviction (E&W)
2. Select Section 8 route
3. Select mandatory grounds (e.g., Ground 8 - serious arrears)
4. Complete wizard
5. **Expected**: Earliest possession date is auto-calculated as service_date + 14 days
6. View explanation: "You have selected only mandatory grounds. The minimum legal notice period is 2 weeks (14 days)."

### Test 2: Section 21 with 4-month rule

1. Start wizard for eviction (E&W)
2. Select Section 21 route
3. Tenancy started: 1 January 2025
4. Service date: 15 February 2025
5. **Expected**: Expiry date is 1 May 2025 (4 months after tenancy start, not 15 April 2025 which would be 2 months from service)
6. View explanation mentions 4-month rule

### Test 3: Scotland with 84-day ground

1. Start wizard for eviction (Scotland)
2. Select Notice to Leave
3. Select Ground 4 (Landlord intends to occupy)
4. Complete wizard
5. **Expected**: Earliest leaving date is service_date + 84 days
6. View explanation: "Your selected grounds require 84 days notice (approximately 12 weeks)."

### Test 4: Date Validation (422 Error)

1. Call API: `POST /api/notices/validate-dates`
   ```json
   {
     "notice_type": "section_8",
     "proposed_date": "2025-01-20",
     "params": {
       "service_date": "2025-01-15",
       "grounds": [{"code": 10, "mandatory": false}]
     }
   }
   ```
2. **Expected**: 422 response with:
   - `valid: false`
   - `errors`: "The proposed expiry date is too early. The earliest legally valid date is 16 March 2025 (60 days from service date). Legal basis: Housing Act 1988, Section 8(4)(b) - Discretionary grounds require reasonable notice"

### Test 5: Section 21 Eligibility Blocking

1. Create case with deposit NOT protected
2. Try to generate Section 21 notice
3. **Expected**: `validateSection21Eligibility()` returns:
   - `eligible: false`
   - `blocking_issues`: ["Section 21 cannot be used because the deposit is not protected..."]

## Technical Notes

### New Files Created:

1. `/src/lib/documents/notice-date-calculator.ts` (600+ lines)
2. `/src/lib/documents/section21-generator.ts` (200+ lines)
3. `/src/app/api/notices/validate-dates/route.ts` (150+ lines)

### Modified Files:

1. `/src/lib/documents/section8-generator.ts`:
   - Added auto-calculation logic
   - Added validation with 422 errors
   - Deprecated old helper functions
   - Imports new date calculator

2. `/src/lib/documents/scotland/notice-to-leave-generator.ts`:
   - Added auto-calculation logic
   - Added validation with 422 errors
   - Deprecated old helper functions
   - Imports new date calculator

### Backward Compatibility:

- Old `calculateEarliestPossessionDate()` and `determineNoticePeriod()` functions are deprecated but still work
- New auto-calculation only activates if `earliest_possession_date` is NOT provided
- If provided, it validates and either accepts or returns 422

## Next Steps

1. **Immediate**: Test the auto-calculation in dev environment
2. **Short-term**: Complete Parts B-E (eligibility, PDF formatting, preview page, UX)
3. **Before production**: Complete Part F (comprehensive tests)

## Legal Compliance Notes

All date calculations implement current law as of January 2025:

- **England & Wales**:
  - Housing Act 1988 (as amended by Housing Act 1996)
  - Tenant Fees Act 2019 (deposit limits)
  - Deregulation Act 2015 (How to Rent requirement)
  - Energy Efficiency (Private Rented Property) Regulations 2015

- **Scotland**:
  - Private Housing (Tenancies) (Scotland) Act 2016
  - Pre-Action Requirements Regulations 2020

## Questions / Issues

If you encounter issues:

1. Check browser console for validation errors
2. Check server logs for 422 responses with detailed explanations
3. Verify date formats are ISO (YYYY-MM-DD)
4. Ensure grounds are correctly mapped with `code` or `number` field

---

**Last Updated**: 2025-12-13
**Author**: Claude (Landlord Heaven development team)
**Status**: Core date calculation complete, UX/testing pending
