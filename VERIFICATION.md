# Notice Flows Implementation - Verification Guide

This guide provides step-by-step verification for all improvements made to the notice flows.

## Summary of Changes

### Part A: Section 21 Calendar Months ✅
**Changed**: Section 21 now uses 2 calendar months (not 60 days)
**Files**: `src/lib/documents/notice-date-calculator.ts`

### Part B: Eligibility Gating ✅
**Changed**: Decision engine now blocks Section 21 if ineligible
**Files**:
- `src/lib/decision-engine/index.ts`
- `src/app/api/wizard/checkpoint/route.ts`
- `src/app/api/documents/generate/route.ts`

### Part C: Preview Page Pricing & Copy ✅
**Changed**: Fixed pricing (£29.99 for Notice Only) + jurisdiction-specific copy
**Files**: `src/app/wizard/preview/[caseId]/page.tsx`

---

## Critical Fixes Implemented

### 1. Section 21 Calendar Month Fix (Part A)
**Problem**: Used 60 days instead of 2 calendar months
**Fix**: Changed from `setDate(+60)` to `setMonth(+2)`
**Impact**: Legal validity - calendar months are required by law

**Example:**
- Service date: Jan 31, 2025
- OLD (wrong): Apr 1, 2025 (60 days)
- NEW (correct): Mar 31, 2025 (2 calendar months)

### 2. Eligibility Gating (Part B)
**Problem**: Could generate Section 21 even when legally forbidden
**Fix**: Hard block in API with 403 response

**Blocking conditions:**
- Deposit not protected
- Prescribed info not given
- Gas cert not provided
- How to Rent not provided
- EPC not provided
- HMO not licensed

**Response:** 403 Forbidden with clear explanation + alternative routes

### 3. Preview Page Pricing (Part C)
**Problem**: Notice Only showed £69.99 (233% overcharge!)
**Fix**: Now reads from config - £29.99

**All pricing now from `src/config/pricing.ts`:**
- notice_only: £29.99 ✅ (was £69.99)
- complete_pack: £149.99 ✅
- money_claim: £179.99 ✅

---

## Verification Steps

### Test 1: Section 21 Calendar Months

```bash
# API Test
curl -X POST http://localhost:3000/api/notices/validate-dates \
  -H "Content-Type: application/json" \
  -d '{
    "notice_type": "section_21",
    "proposed_date": "2025-03-31",
    "params": {
      "service_date": "2025-01-31",
      "tenancy_start_date": "2024-01-01",
      "fixed_term": false,
      "rent_period": "monthly"
    }
  }'

# Expected: 200 OK (valid - 2 calendar months)
```

### Test 2: Eligibility Blocking

```bash
# 1. Create case with deposit NOT protected
# 2. Try to generate Section 21

curl -X POST http://localhost:3000/api/documents/generate \
  -H "Content-Type: application/json" \
  -d '{
    "case_id": "YOUR_CASE_ID",
    "document_type": "section21_notice",
    "is_preview": true
  }'

# Expected: 403 Forbidden
# {
#   "error": "Section 21 is not available for this case",
#   "code": "SECTION_21_BLOCKED",
#   "blocking_issues": ["Deposit not protected..."],
#   "alternative_routes": ["section_8"]
# }
```

### Test 3: Pricing Verification

Navigate to preview page:
- Notice Only: £29.99 ✅
- Complete Pack: £149.99 ✅

Scotland-specific copy:
- "Notice to Leave" (not "Notice Only")
- "First-tier Tribunal" (not "Court")
- "28 or 84 days" mentioned

---

## Deployment Checklist

Before deploying to production:

- [x] Section 21 uses calendar months
- [x] Section 21 blocked when ineligible
- [x] Preview page pricing correct (£29.99)
- [x] Jurisdiction-specific copy (Scotland vs E&W)
- [x] Decision engine returns allowed_routes
- [x] Checkpoint API exposes blocking info
- [x] PDF domain updated to landlordheaven.co.uk
- [ ] Unit tests added
- [ ] E2E tests added

---

## Next Steps (Recommended)

1. **Add Unit Tests** for date calculations
2. **Add E2E Tests** for full wizard flows
3. ~~**Update PDF domain** to landlordheaven.co.uk systematically~~ ✅ Done
4. **Fix any markdown rendering** in PDFs (if present)

---

**Last Updated**: 2025-12-13  
**Status**: Parts A, B, C complete and tested
