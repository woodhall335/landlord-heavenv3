# Notice Only Rent Schedule Audit Report

**Date:** January 2026
**Scope:** Fix preview page to show dynamic document count including Rent Schedule when applicable

## Executive Summary

This audit documents the fix for the Notice Only preview page which was showing a hardcoded "3 documents" even when arrears grounds (8/10/11) were selected and arrears schedule data was present. The fix ensures the preview reflects the actual computed pack contents, including the Rent Schedule document when applicable.

---

## Audit Results

### Notice Only Pack

| Check | Status | Notes |
|-------|--------|-------|
| Rent schedule shown in preview when applicable | ✅ | Preview page now dynamically includes arrears-schedule document |
| Rent schedule generated post-payment | ✅ | Pack generation route generates arrears schedule document |
| Features bullet shows "Rent schedule (arrears breakdown)" | ✅ | Dynamically added when arrears schedule is included |
| Document count is dynamic (3 or 4) | ✅ | Based on actual document list length |

### Complete Eviction Pack

| Check | Status | Notes |
|-------|--------|-------|
| Rent schedule included for arrears cases | ✅ | Already implemented in eviction-pack-generator.ts (line 896-926) |
| Uses same arrears-schedule-mapper | ✅ | Centralized arrears data mapping |
| Preview matches pack generation | ✅ | getCompletePackDocuments includes arrears schedule via Evidence Tools |

---

## Source of Truth Locations

| Component | File | Purpose |
|-----------|------|---------|
| Document Config | `src/lib/documents/document-configs.ts` | UI document list (getNoticeOnlyDocuments, getCompletePackDocuments) |
| Pack Contents | `src/lib/documents/eviction-pack-contents.ts` | Pack structure definition (categories and conditions) |
| Arrears Mapper | `src/lib/documents/arrears-schedule-mapper.ts` | Single source of truth for arrears data conversion |
| Validation | `src/lib/validation/notice-only-case-validator.ts` | requiresRentSchedule() and computeIncludedGrounds() |
| Preview Page | `src/app/wizard/preview/[caseId]/page.tsx` | Client-side preview rendering |
| Pack Generation | `src/app/api/notice-only/preview/[caseId]/route.ts` | Server-side pack generation |

---

## Filtering Risks Found and Fixed

### Issue 1: Preview page using hardcoded document list

**Location:** `src/app/wizard/preview/[caseId]/page.tsx`

**Problem:** The preview page was calling `getNoticeOnlyDocuments(jurisdiction, noticeRoute)` without the `includeArrearsSchedule` option, resulting in always showing 3 documents.

**Fix Applied:**
- Added detection logic to check if arrears schedule should be included
- Passes `{ includeArrearsSchedule: true }` when conditions are met
- Dynamically adds "Rent schedule (arrears breakdown)" to features list

### Issue 2: Pack generation not including arrears schedule

**Location:** `src/app/api/notice-only/preview/[caseId]/route.ts`

**Problem:** The pack generation route was not generating the arrears schedule document even when arrears grounds were present.

**Fix Applied:**
- Added rent schedule generation for England Section 8 (lines 694-736)
- Added rent schedule generation for Wales fault-based (Section 157/159) (lines 970-1019)
- Added rent schedule generation for Scotland Ground 1 (lines 1217-1257)

---

## Condition Logic for Rent Schedule Inclusion

### England (Section 8)

```typescript
// Conditions:
// 1. Product is 'notice_only'
// 2. Route is 'section_8'
// 3. Arrears grounds (8/10/11) are included (via requiresRentSchedule)
// 4. Arrears data exists (arrears_items.length > 0)
```

### Wales (Fault-Based)

```typescript
// Conditions:
// 1. Route is 'wales_fault_based'
// 2. Breach type includes rent arrears OR Section 157/159 selected
// 3. Arrears data exists (arrears_items.length > 0)
```

### Scotland (Notice to Leave)

```typescript
// Conditions:
// 1. Eviction grounds include Ground 1 (rent arrears)
// 2. Arrears data exists (arrears_items.length > 0)
```

---

## Files Changed

1. `src/app/wizard/preview/[caseId]/page.tsx`
   - Added imports for requiresRentSchedule, computeIncludedGrounds, validateNoticeOnlyCase
   - Updated getDocumentTypesForProduct to accept includeArrearsSchedule option
   - Added shouldIncludeArrearsSchedule logic to getDocuments
   - Added dynamic features list with rent schedule bullet

2. `src/app/api/notice-only/preview/[caseId]/route.ts`
   - Added rent schedule generation for England Section 8
   - Added rent schedule generation for Wales fault-based
   - Added rent schedule generation for Scotland Ground 1

3. `tests/preview/notice-only-preview-documents.test.ts` (NEW)
   - Regression tests for document list rendering
   - Tests for arrears schedule inclusion logic

---

## Verification Checklist

- [x] No href/URL changes made
- [x] No styling refactors (only functional changes)
- [x] Footer untouched
- [x] No new dependencies added
- [x] API endpoints remain backwards compatible

---

## Manual QA Steps

To verify the fix:

1. Create a Notice Only case with:
   - Jurisdiction: England
   - Route: Section 8
   - Ground: Ground 8 (serious rent arrears)
   - Complete the arrears schedule with at least one entry

2. Navigate to the preview page

3. Verify:
   - Page shows "4 documents ready for instant download" (not 3)
   - Document list includes "Rent Schedule / Arrears Statement"
   - "Includes:" section shows "Rent schedule (arrears breakdown)"

4. Complete payment and download pack

5. Verify:
   - Downloaded pack includes the rent schedule document
   - Rent schedule shows the arrears data entered

---

## Regression Test Coverage

Tests added in `tests/preview/notice-only-preview-documents.test.ts`:

1. **Notice Only + Section 8 + Ground 8 + arrears data**
   - Preview shows 4 documents
   - Includes arrears schedule entry

2. **Notice Only + Section 8 + Ground 8 + NO arrears data**
   - Preview shows 3 documents
   - No arrears schedule shown

3. **Notice Only + Section 8 + non-arrears grounds**
   - Preview shows 3 documents
   - No arrears schedule shown

4. **Complete Pack document list**
   - Includes arrears schedule in evidence tools section

---

## Conclusion

The fix ensures the preview page accurately reflects the pack contents by:

1. Dynamically computing whether rent schedule should be included
2. Generating the rent schedule document in the pack when applicable
3. Updating the document count and features list accordingly

This maintains consistency between what users see in the preview and what they receive after payment.
