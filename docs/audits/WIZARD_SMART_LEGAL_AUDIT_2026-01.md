# Wizard Smart + Legal Validation Audit
**Date:** January 2026
**Updated:** January 27, 2026
**Scope:** All wizard flows, persistence, validation, and gating

---

## Executive Summary

This audit covers all wizard flows (EvictionSectionFlow, NoticeOnlySectionFlow, MoneyClaimSectionFlow, TenancySectionFlow) for legal correctness, bypass resistance, data integrity, and UX quality.

### Ship Confidence: **YES** (with caveats)

**Top 3 Immediate Risks:**
1. Phase 13 enhanced help content (title, howToFix, legalRef, helpUrl) exists but is NOT surfaced in UI
2. TenancySectionFlow lacks debouncing (excessive API calls) and unmount flush (potential data loss)
3. Tab close during 500ms debounce window can lose data (no beforeunload handler)

**Top 3 Smallest High-Impact Improvements:**
1. Surface Phase 13 `howToFix[]` in ValidationErrors component (enhances user guidance significantly)
2. Add debouncing and unmount flush to TenancySectionFlow (align with other flows)
3. Add `visibilitychange` handler to flush pending saves on tab hide

---

## 1. Legal Gating Map (Per Wizard)

### Eviction Complete Pack (EvictionSectionFlow)

| Blocker Type | Location | Rule/Function | Timing | Status |
|--------------|----------|---------------|--------|--------|
| **Inline** | Section21ComplianceSection | deposit_protected, gas_cert, epc, how_to_rent | Edit-time | ✅ |
| **Inline** | Section8ArrearsSection | dateRangeErrors, ground8Validation | Edit-time | ✅ P0-4 fix |
| **Inline** | CourtSigningSection | signature_date vs notice_expiry | Edit-time | ✅ P0-3 fix |
| **Inline** | ScotlandGroundsSection | pre_action_letter_sent, signposting | Edit-time | ✅ B3 fix |
| **Review-time** | review/page.tsx | hasBlockingIssues from decision_engine | Review | ✅ |
| **Generate-time** | /api/documents/generate | validateForGenerate(), S21 eligibility | Generate | ✅ |
| **Checkout-time** | /api/checkout/create | validateSection21ForCheckout() | Checkout | ✅ |

### Notice Only (NoticeOnlySectionFlow)

| Blocker Type | Location | Rule/Function | Timing | Status |
|--------------|----------|---------------|--------|--------|
| **Inline** | Section21ComplianceSection | deposit_protected, gas_cert, epc | Edit-time | ✅ |
| **Inline** | WalesComplianceSection | rent_smart_wales, written_statement | Edit-time | ✅ |
| **Inline** | ScotlandComplianceSection | landlord_registered | Edit-time | ✅ |
| **Inline** | ScotlandGroundsSection | pre_action_letter_sent (Ground 1) | Edit-time | ✅ B3 fix |
| **Review-time** | review/page.tsx | hasBlockingIssues from decision_engine | Review | ✅ |
| **Generate-time** | /api/documents/generate | validateNoticeOnlyCase() | Generate | ✅ |
| **Checkout-time** | /api/checkout/create | validateNoticeOnlyCase() | Checkout | ✅ |

### Money Claim (MoneyClaimSectionFlow)

| Blocker Type | Location | Rule/Function | Timing | Status |
|--------------|----------|---------------|--------|--------|
| **Inline** | ClaimantSection | validateClaimantSection() | Edit-time | ✅ |
| **Inline** | DefendantSection | validateDefendantSection() | Edit-time | ✅ |
| **Inline** | ArrearsSection | arrears schedule completeness | Edit-time | ✅ |
| **Inline** | PreActionSection | lba_sent confirmation | Edit-time | ✅ |
| **Review-time** | review/page.tsx | case_health.blockers | Review | ✅ |
| **Generate-time** | /api/documents/generate | money-claim-validator.ts | Generate | ✅ |
| **Checkout-time** | /api/checkout/create | (via product validation) | Checkout | ✅ |

### Tenancy Agreement (TenancySectionFlow)

| Blocker Type | Location | Rule/Function | Timing | Status |
|--------------|----------|---------------|--------|--------|
| **Inline** | PropertySection | address validation | Edit-time | ✅ |
| **Inline** | LandlordSection | name/address validation | Edit-time | ✅ |
| **Inline** | TenantsSection | tenant details | Edit-time | ✅ |
| **Inline** | RentSection | rent amount/frequency | Edit-time | ✅ |
| **Review-time** | review/page.tsx | buildTenancyValidation() | Review | ✅ |
| **Generate-time** | /api/tenancy-agreement/generate | validation checks | Generate | ✅ |

---

## 2. Bypass Analysis

### Server Enforcement (Authoritative)

| Endpoint | Blocker Check | Bypassable? |
|----------|--------------|-------------|
| POST /api/checkout/create | ✅ validateSection21ForCheckout(), validateNoticeOnlyCase() | No - server-side |
| POST /api/documents/generate | ✅ validateForGenerate(), assertPaidEntitlement() | No - server-side |
| POST /api/orders/regenerate | ✅ validateComplianceTiming(), edit window | No - server-side |

### Client-Side Bypass Vectors

| Vector | Status | Mitigation |
|--------|--------|------------|
| UI acknowledgement checkbox for blockers | ✅ Fixed | P0-1: removed checkbox bypass |
| Direct navigation to /wizard/review | ✅ Safe | Analysis re-runs on page load |
| Deep link to /checkout/create | ✅ Safe | Server validates before payment |
| is_preview flag manipulation | ✅ Safe | assertPaidEntitlement() still runs |

**Conclusion:** Server-side enforcement is authoritative. No bypass vectors found.

---

## 3. Data Integrity Analysis

### Autosave Debounce Windows

| Flow | Debounce | Flush on Review Nav | Flush on Unmount | Flush on Tab Close |
|------|----------|---------------------|------------------|-------------------|
| EvictionSectionFlow | 500ms | ✅ handleComplete() | ✅ **FIXED** (B1) | ✅ **FIXED** |
| NoticeOnlySectionFlow | 500ms | ✅ handleGenerateNotice() | ✅ **FIXED** (B1) | ✅ **FIXED** |
| MoneyClaimSectionFlow | 500ms | ✅ handleComplete() | ✅ Correct | ✅ **FIXED** |
| TenancySectionFlow | 500ms | ✅ handleNext() | ✅ **FIXED** | ✅ **FIXED** |

**Fixed Issues:**
- ✅ B1: EvictionSectionFlow and NoticeOnlySectionFlow now flush pending facts on unmount
- ✅ TenancySectionFlow: Now has 500ms debouncing like other flows
- ✅ TenancySectionFlow: Now flushes pending saves on unmount
- ✅ All flows: visibilitychange handler flushes saves when tab becomes hidden

**Remaining Gaps:**
- None (all data integrity issues fixed)

### Facts Merging Semantics

**Fixed (B2):** `save-facts/route.ts` now uses `deepMergeFacts()` helper:
- Deep merges nested plain objects (issues, tenancy, parties, compliance)
- Arrays are treated as 'replace' (no element-wise merge)
- Null/undefined in source overwrites target value

**High-Risk Nested Keys (Now Protected):**
- `issues.rent_arrears` - arrears data ✅
- `money_claim.*` - claim details ✅
- `compliance.*` - compliance confirmations ✅
- `parties.*` - landlord/tenant details ✅

---

## 4. Smart UX Analysis

### Smart Review Staleness

| Flow | Cached? | Invalidated on Change? | Status |
|------|---------|------------------------|--------|
| MoneyClaimSectionFlow | ✅ Yes | ✅ **FIXED** (B4) | OK |
| EvictionSectionFlow | ❌ No | N/A | OK |
| NoticeOnlySectionFlow | ❌ No | N/A | OK |

**Fixed:** MoneyClaimSectionFlow now clears `smartReviewWarnings` when facts change.

### Error Recovery Patterns

| Pattern | Status |
|---------|--------|
| Retry button on save failure | ✅ Implemented (P0-2) |
| Offline detection | ❌ Not implemented |
| Local storage fallback | ❌ Not implemented |
| Save indicator (saving...) | ⚠️ Partial (only on error) |

### Phase 13 Enhanced Help Content

**Status: CRITICAL GAP - Content exists but is NOT surfaced in UI**

| Enhanced Field | Produced | Consumed in UI | Gap |
|---------------|----------|----------------|-----|
| **title** | ✅ phase13-messages.yaml | ❌ NOT shown | ValidationErrors shows only code |
| **howToFix[]** | ✅ phase13-messages.yaml | ❌ NOT shown | ValidationErrors shows only user_fix_hint |
| **legalRef** | ✅ phase13-messages.yaml | ❌ NOT shown | ValidationErrors shows only legal_reason |
| **helpUrl** | ✅ phase13-messages.yaml | ❌ NOT shown | No component displays help links |

**Files Involved:**
- Produces: `config/validation/phase13-messages.yaml`, `src/lib/validation/phase13-messages.ts`
- Should consume: `src/components/ui/ValidationErrors.tsx`, `src/components/wizard/SmartReviewPanel.tsx`

**Impact:** Users don't get actionable step-by-step guidance or legal citations despite content existing.

---

## 5. Validation Timing Matrix

### Inline Validation (Edit-time)

| Component | Field/Rule | Blocks Next? |
|-----------|-----------|--------------|
| Section21ComplianceSection | deposit_protected, gas_cert, epc, how_to_rent | ✅ Yes |
| Section8ArrearsSection | dateRangeErrors, ground8 threshold | ✅ Yes |
| CourtSigningSection | signature_date < notice_expiry | ✅ Yes |
| ScotlandGroundsSection | pre_action_letter_sent (Ground 1) | ✅ Yes |
| WalesComplianceSection | rent_smart_wales, written_statement | ✅ Yes |
| ClaimantSection | required fields | ✅ Yes |
| DefendantSection | required fields | ✅ Yes |
| PreActionSection | lba_sent | ✅ Yes |

### Review-time Validation

| API | Produces | Consumer |
|-----|----------|----------|
| /api/wizard/analyze | decision_engine issues | review/page.tsx |
| /api/wizard/validate | ValidationIssue[] | preview/page.tsx |

### Checkout-time Validation (Server)

| Product | Validator | Blocks Payment? |
|---------|-----------|----------------|
| notice_only | validateNoticeOnlyCase() | ✅ Yes |
| complete_pack | validateSection21ForCheckout() | ✅ Yes |
| money_claim | (via product validation) | ✅ Yes |

### Generate-time Validation (Server)

| Endpoint | Validator | Blocks Generation? |
|----------|-----------|-------------------|
| /api/documents/generate | validateForGenerate() | ✅ Yes |
| /api/documents/generate | assertPaidEntitlement() | ✅ Yes |
| /api/orders/regenerate | validateComplianceTiming() | ✅ Yes |

---

## 6. Prioritized Backlog

### P0 (Completed)
| Issue | Fix | Status |
|-------|-----|--------|
| NoticeOnlySectionFlow unmount doesn't flush | Added pendingFactsRef flush | ✅ DONE |
| EvictionSectionFlow unmount doesn't flush | Added pendingFactsRef flush | ✅ DONE |
| save-facts shallow merge | Implemented deepMergeFacts() | ✅ DONE |
| Scotland pre-action late validation | Moved to inline in ScotlandGroundsSection | ✅ DONE |
| Smart Review staleness | Invalidate on facts change | ✅ DONE |
| Arrears date range validation | Added inline validation with sorting | ✅ DONE |
| Signature date validation | Added inline timing check | ✅ DONE |
| Blocking issues bypass | Removed acknowledgement checkbox | ✅ DONE |
| Save retry on failure | Added retry button | ✅ DONE |

### P1 (Completed)

| Issue | File/Location | Fix | Status |
|-------|--------------|-----|--------|
| TenancySectionFlow no debouncing | `TenancySectionFlow.tsx:372-408` | Added 500ms debounce like other flows | ✅ DONE |
| TenancySectionFlow no unmount flush | `TenancySectionFlow.tsx:410-421` | Added cleanup effect with pendingFactsRef flush | ✅ DONE |
| No tab close protection | All flows | Added visibilitychange handler to flush saves | ✅ DONE |

### P1 (Remaining)

| Issue | File/Location | Fix | Effort |
|-------|--------------|-----|--------|
| Phase 13 content not surfaced | `ValidationErrors.tsx:1-359` | Add props for title, howToFix[], legalRef, helpUrl and render them | Medium |

### P2 (Future)

| Issue | File/Location | Fix | Effort |
|-------|--------------|-----|--------|
| No offline detection | All flows | Add navigator.onLine check with banner | Medium |
| No localStorage fallback | All flows | Queue saves to localStorage if offline | High |
| Save indicator always visible | All flows | Show "Saving..." during debounce | Low |

---

## 7. Manual QA Checklist

### Eviction Complete Pack (All P0 Fixes Verified)
- [x] Complete all sections with valid data
- [x] Verify blockers show inline (deposit not protected, gas cert missing)
- [x] Verify Review page shows blockers
- [x] Verify "Proceed" is disabled with blockers (P0-1 ✅)
- [x] Verify payment blocked with blockers
- [x] Verify signature date < notice expiry shows error (P0-3 ✅)
- [x] Verify unmount during debounce flushes saves (B1 ✅)

### Notice Only (England S8)
- [x] Select Section 8 with Ground 8
- [x] Enter arrears with invalid dates
- [x] Verify date range errors show and block Next (P0-4 ✅)
- [x] Verify Ground 8 threshold validation
- [x] Verify sorted overlap detection works

### Notice Only (Scotland)
- [x] Select Ground 1 (rent arrears)
- [x] Verify pre-action letter requirement surfaced inline (B3 ✅)
- [x] Verify pre-action checkboxes block Next until confirmed
- [x] Complete with all requirements
- [x] Verify generation succeeds

### Money Claim
- [x] Complete claimant/defendant/tenancy
- [x] Verify arrears schedule validation
- [x] Verify LBA confirmation required
- [x] Verify Smart Review invalidates on fact change (B4 ✅)

### Data Integrity (P0 Fixes)
- [x] Make rapid edits and navigate away
- [x] Verify no data loss on navigation
- [x] Test unmount during debounce window (B1 ✅)
- [x] Test partial nested object saves (B2 ✅)

### Save/Retry
- [x] Disable network, make changes
- [x] Verify "Failed to save" shows with Retry
- [x] Re-enable network, click Retry
- [x] Verify save succeeds

### Remaining QA (P1)
- [ ] Verify TenancySectionFlow rapid edits don't cause excessive API calls
- [ ] Verify tab close during debounce loses data (expected until P1 fix)
- [ ] Verify Phase 13 content would display if surfaced

---

## 8. Implementation Details (Completed Fixes)

### B1: Unmount Flush Fix
**Files:** `EvictionSectionFlow.tsx`, `NoticeOnlySectionFlow.tsx`
**Change:** Added cleanup useEffect that flushes `pendingFactsRef.current` before unmount
**Test:** Navigate away during debounce, verify no data loss

### B2: Deep Merge Fix
**File:** `src/app/api/wizard/save-facts/route.ts`
**Change:** Added `deepMergeFacts()` helper, replaced shallow merge
**Test:** Save nested object from one section, save from another, verify both preserved

### B3: Scotland Pre-action Inline Fix
**File:** `src/components/wizard/sections/eviction/ScotlandGroundsSection.tsx`
**Change:** Added pre-action requirements checkboxes when Ground 1 selected, registers blocking errors
**Test:** Select Ground 1, verify checkboxes appear and block Next until confirmed

### B4: Smart Review Staleness Fix
**File:** `src/components/wizard/flows/MoneyClaimSectionFlow.tsx`
**Change:** Clear `smartReviewWarnings` in `handleUpdate` when facts change
**Test:** Upload evidence for Smart Review, then change facts, verify warnings cleared

---

## 9. Appendix: Key File References

### Save/Persistence
- `src/app/api/wizard/save-facts/route.ts` - Server-side save with deep merge
- `src/lib/wizard/facts-client.ts` - Client-side save helper

### Validation
- `src/lib/validation/phase13-messages.ts` - Enhanced help content loader
- `src/lib/validation/shadow-mode-adapter.ts` - YAML validation wrapper
- `src/lib/validation/notice-only-case-validator.ts` - Notice validation
- `src/lib/validation/section21-checkout-validator.ts` - Checkout validation

### Wizard Flows
- `src/components/wizard/flows/EvictionSectionFlow.tsx`
- `src/components/wizard/flows/NoticeOnlySectionFlow.tsx`
- `src/components/wizard/flows/MoneyClaimSectionFlow.tsx`
- `src/components/wizard/flows/TenancySectionFlow.tsx`

### Inline Validation Sections
- `src/components/wizard/sections/eviction/Section8ArrearsSection.tsx`
- `src/components/wizard/sections/eviction/CourtSigningSection.tsx`
- `src/components/wizard/sections/eviction/ScotlandGroundsSection.tsx`
- `src/components/wizard/sections/eviction/Section21ComplianceSection.tsx`

### UI Components
- `src/components/ui/ValidationErrors.tsx` - Error display (needs Phase 13 integration)
- `src/components/wizard/ValidationContext.tsx` - Field validation state

---

*Last Updated: January 27, 2026*
*Audit Version: 2.0 (Post-P0 fixes)*
