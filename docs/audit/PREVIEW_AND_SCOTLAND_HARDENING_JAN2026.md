# Preview & Scotland Money Claim Hardening Audit

**Date**: January 2026
**Branch**: `claude/fix-pdf-preview-scotland-docs-VPV5c`

## Summary of Changes

This audit addresses two security/consistency issues identified in the Pack Output & Preview Enforcement Audit:

1. **Legacy PDF preview endpoint** - Security vulnerability allowing free PDF access
2. **Scotland Money Claim pack inconsistency** - Included documents removed from England/Wales pack

---

## Part A: Legacy PDF Preview Endpoint Removal

### Issue
The endpoint `/api/documents/preview/[id]` (file: `src/app/api/documents/preview/[id]/route.ts`) was:
- Allowing anonymous access to document previews
- Generating PDF previews (up to 2 pages) without watermarks
- **NOT** checking payment entitlement (`assertPaidEntitlement()` was missing)
- An attack vector contradicting our 1-page JPG-only preview policy

### Resolution
**DELETED** the entire endpoint directory: `src/app/api/documents/preview/`

### Proof: No Legacy Preview Exposure
```bash
# Search for code references to the legacy endpoint
grep -r "/api/documents/preview" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/
# Result: No matches found

# Verify endpoint directory is removed
ls -la src/app/api/documents/preview/
# Result: No such file or directory
```

### Impact
- Zero code dependencies on this endpoint (only documentation references existed)
- No migration required
- No breaking changes

---

## Part B: Scotland Money Claim Pack Alignment

### Issue
The Scotland Money Claim pack (`src/lib/documents/scotland-money-claim-pack-generator.ts`) included three documents that were explicitly removed from the England/Wales pack in the Jan 2026 restructure:

1. **Pack Summary** (pack_cover.hbs)
2. **Evidence Index** (evidence_index.hbs)
3. **Court Hearing Preparation Sheet** (hearing_prep_sheet.hbs)

### Analysis
- These documents are **NOT legally required** for Scottish Simple Procedure
- They were removed from England/Wales for pack streamlining
- Scotland should be aligned for consistency
- The `document-configs.ts` and product meta already don't advertise these documents

### Resolution
**REMOVED** these three documents from the Scotland Money Claim pack generator with comments:
```typescript
// PACK COVER - Removed as of Jan 2026 pack restructure
// Pack summary document no longer included in the money claim pack (aligned with England/Wales)

// EVIDENCE INDEX - Removed as of Jan 2026 pack restructure
// Evidence index document no longer included in the money claim pack (aligned with England/Wales)

// COURT HEARING PREPARATION SHEET - Removed as of Jan 2026 pack restructure
// Hearing prep sheet document no longer included in the money claim pack (aligned with England/Wales)
```

### Scotland Pack: Final Document List (Post-Change)
1. Particulars of claim (Statement of claim)
2. Schedule of rent arrears (conditional)
3. Interest calculation (conditional)
4. Pre-Action Letter
5. Enforcement Guide (Diligence)
6. Simple Procedure Filing Guide
7. Simple Procedure Claim Form (Form 3A)

This aligns with the England/Wales pack structure.

---

## Part C: Notice-Only Preview Route Clarification

### Issue
The endpoint `/api/notice-only/preview/[caseId]` has a misleading name - it's actually a **POST-PAYMENT** endpoint that returns final PDFs, not a free preview.

### Resolution
Added clarifying comments to prevent future confusion:
```typescript
/**
 * Notice Only Pack Generation API (POST-PAYMENT ENDPOINT)
 *
 * GET /api/notice-only/preview/[caseId]
 *
 * SECURITY NOTE: Despite the "preview" name (historical), this is a PAID endpoint.
 * - Requires `assertPaidEntitlement()` before returning any documents
 * - Returns complete, final PDFs suitable for court use
 * - No watermarks (removed as part of simplified UX post-payment)
 */
```

Also added a critical comment near the payment check:
```typescript
// CRITICAL: Payment verification MUST happen before returning any documents.
// This prevents free access to final PDFs. Do NOT remove or bypass this check.
await assertPaidEntitlement({ caseId, product: 'notice_only' });
```

---

## Part D: QA + Security Regression Checklist

### Pre-Deployment Verification

#### 1. JPG Preview Only (Page 1 Only)
- [ ] `/api/documents/thumbnail/[id]` returns JPG, not PDF
- [ ] Thumbnail is page 1 only, not multi-page
- [ ] Watermark applied to free previews (if applicable)

#### 2. No Free PDF Preview Endpoints
- [ ] `GET /api/documents/preview/[id]` returns 404 (endpoint deleted)
- [ ] No other endpoint returns PDF without `assertPaidEntitlement()`
- [ ] Grep search confirms no code references to deleted endpoint

#### 3. Paid Generation Still Works
- [ ] Notice Only pack generates after payment
- [ ] Money Claim pack generates after payment
- [ ] Complete Eviction pack generates after payment
- [ ] AST pack generates after payment

#### 4. Paid ZIP Still Works
- [ ] ZIP download endpoint returns all documents
- [ ] ZIP includes correct document count per pack type
- [ ] ZIP file is not corrupted

#### 5. Dashboard Regeneration Still Works
- [ ] "Regenerate" button triggers document generation
- [ ] Regenerated documents match original quality
- [ ] No errors in console during regeneration

#### 6. Scotland Money Claim Validation
- [ ] Scotland Simple Procedure pack generates without errors
- [ ] Pack contains 7 documents (Form 3A + 6 supporting docs)
- [ ] No Pack Summary in output
- [ ] No Evidence Index in output
- [ ] No Hearing Prep Sheet in output
- [ ] Pre-Action Letter included
- [ ] Filing Guide included
- [ ] Enforcement Guide included

---

## Files Modified

| File | Change |
|------|--------|
| `src/app/api/documents/preview/[id]/route.ts` | **DELETED** |
| `src/lib/documents/scotland-money-claim-pack-generator.ts` | Removed Pack Summary, Evidence Index, Hearing Prep Sheet |
| `src/app/api/notice-only/preview/[caseId]/route.ts` | Added security comments |

---

## Rollback Plan

If issues are discovered:

1. **Restore legacy preview endpoint**: `git checkout HEAD~1 -- src/app/api/documents/preview/`
2. **Restore Scotland pack documents**: Revert changes in `scotland-money-claim-pack-generator.ts`

---

## Sign-Off

- [ ] Security review complete
- [ ] QA checklist passed
- [ ] No regression in paid flows
- [ ] Scotland pack generates correctly
