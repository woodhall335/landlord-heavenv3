# Wizard Smart + Legal Validation Audit
**Date:** January 2026
**Scope:** All wizard flows, persistence, validation, and gating

---

## 1. Legal Gating Map (Per Wizard)

### Eviction Complete Pack (EvictionSectionFlow)

| Blocker Type | Location | Rule/Function | Timing |
|--------------|----------|---------------|--------|
| **Inline** | Section21ComplianceSection | deposit_protected, gas_cert, epc, how_to_rent | Edit-time |
| **Inline** | Section8ArrearsSection | dateRangeErrors, ground8Validation | Edit-time (P0-4 fix) |
| **Inline** | CourtSigningSection | signature_date vs notice_expiry | Edit-time (P0-3 fix) |
| **Review-time** | review/page.tsx | hasBlockingIssues from decision_engine | Review |
| **Generate-time** | /api/documents/generate | validateForGenerate(), S21 eligibility | Generate |
| **Checkout-time** | /api/checkout/create | validateSection21ForCheckout() | Checkout |

### Notice Only (NoticeOnlySectionFlow)

| Blocker Type | Location | Rule/Function | Timing |
|--------------|----------|---------------|--------|
| **Inline** | Section21ComplianceSection | deposit_protected, gas_cert, epc | Edit-time |
| **Inline** | WalesComplianceSection | rent_smart_wales, written_statement | Edit-time |
| **Inline** | ScotlandComplianceSection | landlord_registered | Edit-time |
| **Review-time** | review/page.tsx | hasBlockingIssues from decision_engine | Review |
| **Generate-time** | /api/documents/generate | validateNoticeOnlyCase() | Generate |
| **Checkout-time** | /api/checkout/create | validateNoticeOnlyCase() | Checkout |

**⚠️ Late Validation Gap (Scotland):**
- `pre_action_letter_sent` and `pre_action_signposting_confirmed` for Ground 1 arrears
- Currently only validated at generate-time in `scotland/notice-to-leave-generator.ts`
- Should be surfaced inline when Ground 1 is selected

### Money Claim (MoneyClaimSectionFlow)

| Blocker Type | Location | Rule/Function | Timing |
|--------------|----------|---------------|--------|
| **Inline** | ClaimantSection | validateClaimantSection() | Edit-time |
| **Inline** | DefendantSection | validateDefendantSection() | Edit-time |
| **Inline** | ArrearsSection | arrears schedule completeness | Edit-time |
| **Inline** | PreActionSection | lba_sent confirmation | Edit-time |
| **Review-time** | review/page.tsx | case_health.blockers | Review |
| **Generate-time** | /api/documents/generate | money-claim-validator.ts | Generate |
| **Checkout-time** | /api/checkout/create | (none specific) | Checkout |

### Tenancy Agreement (TenancySectionFlow)

| Blocker Type | Location | Rule/Function | Timing |
|--------------|----------|---------------|--------|
| **Inline** | PropertySection | address validation | Edit-time |
| **Inline** | LandlordSection | name/address validation | Edit-time |
| **Inline** | TenantsSection | tenant details | Edit-time |
| **Inline** | RentSection | rent amount/frequency | Edit-time |
| **Review-time** | review/page.tsx | buildTenancyValidation() | Review |
| **Generate-time** | /api/tenancy-agreement/generate | validation checks | Generate |

---

## 2. Bypass Analysis

### Server Enforcement (Authoritative)

| Endpoint | Blocker Check | Bypassable? |
|----------|--------------|-------------|
| POST /api/checkout/create | ✅ validateSection21ForCheckout(), validateNoticeOnlyCase() | No - server-side |
| POST /api/documents/generate | ✅ validateForGenerate(), assertPaidEntitlement() | No - server-side |
| POST /api/orders/regenerate | ✅ validateComplianceTiming(), edit window | No - server-side |

### Client-Side Bypass Vectors (All Mitigated)

| Vector | Status | Mitigation |
|--------|--------|------------|
| UI acknowledgement checkbox for blockers | ❌ Fixed | P0-1: removed checkbox bypass |
| Direct navigation to /wizard/review | ❌ Safe | Analysis re-runs on page load |
| Deep link to /checkout/create | ❌ Safe | Server validates before payment |
| is_preview flag manipulation | ⚠️ Partial | assertPaidEntitlement() still runs |

**Conclusion:** Server-side enforcement is authoritative. No bypass vectors found.

---

## 3. Data Integrity Analysis

### Autosave Debounce Windows

| Flow | Debounce | Flush on Review Nav | Flush on Unmount | Flush on Tab Close |
|------|----------|---------------------|------------------|-------------------|
| EvictionSectionFlow | 500ms | ✅ handleComplete() | ❌ **BUG** | ❌ None |
| NoticeOnlySectionFlow | 500ms | ✅ handleGenerateNotice() | ❌ **BUG** | ❌ None |
| MoneyClaimSectionFlow | 500ms | ✅ handleComplete() | ✅ Correct | ❌ None |
| TenancySectionFlow | Direct | N/A | N/A | N/A |

**Critical Bug:** EvictionSectionFlow and NoticeOnlySectionFlow clear timeout on unmount but don't flush pending facts.

### Facts Merging Semantics

**Current (save-facts/route.ts:69-78):**
```javascript
const mergedFacts = {
  ...existingFacts,
  ...facts,  // ⚠️ Shallow merge - overwrites nested objects entirely
  __meta: {...}
};
```

**High-Risk Nested Keys:**
- `issues.rent_arrears` - arrears data
- `money_claim.*` - claim details
- `compliance.*` - compliance confirmations
- `parties.*` - landlord/tenant details

**Impact:** Partial section saves can destroy data from other sections if they share nested keys.

---

## 4. Smart UX Analysis

### Smart Review Staleness

| Flow | Cached? | Invalidated on Change? | Status |
|------|---------|------------------------|--------|
| MoneyClaimSectionFlow | ✅ Yes (lines 358-360) | ❌ No | **BUG** |
| EvictionSectionFlow | ❌ No | N/A | OK |
| NoticeOnlySectionFlow | ❌ No | N/A | OK |

**Issue:** MoneyClaimSectionFlow hydrates `__smart_review` from persisted facts but never invalidates when facts change. Users see stale warnings.

### Error Recovery Patterns

| Pattern | Status |
|---------|--------|
| Retry button on save failure | ✅ Implemented (P0-2) |
| Offline detection | ❌ Not implemented |
| Local storage fallback | ❌ Not implemented |

### Inconsistent Patterns

1. **Unmount flush:** Only MoneyClaimSectionFlow does it correctly
2. **Deep merge in handleUpdate:** Only MoneyClaimSectionFlow does client-side deep merge (lines 482-484)
3. **Smart Review:** Only MoneyClaimSectionFlow uses it

---

## 5. Manual QA Checklist

### Eviction Complete Pack
- [ ] Complete all sections with valid data
- [ ] Verify blockers show inline (deposit not protected, gas cert missing)
- [ ] Verify Review page shows blockers
- [ ] Verify "Proceed" is disabled with blockers (P0-1)
- [ ] Verify payment blocked with blockers
- [ ] Verify signature date < notice expiry shows error (P0-3)

### Notice Only (England S8)
- [ ] Select Section 8 with Ground 8
- [ ] Enter arrears with invalid dates
- [ ] Verify date range errors show and block Next (P0-4)
- [ ] Verify Ground 8 threshold validation

### Notice Only (Scotland)
- [ ] Select Ground 1 (rent arrears)
- [ ] Verify pre-action letter requirement surfaced **[LATE - needs fix]**
- [ ] Complete with all requirements
- [ ] Verify generation succeeds

### Money Claim
- [ ] Complete claimant/defendant/tenancy
- [ ] Verify arrears schedule validation
- [ ] Verify LBA confirmation required
- [ ] Verify Smart Review shows (if evidence uploaded)

### Data Integrity
- [ ] Make rapid edits and navigate away
- [ ] Verify no data loss on navigation
- [ ] Test unmount during debounce window **[BUG to fix]**
- [ ] Test partial nested object saves **[BUG to fix]**

### Save/Retry
- [ ] Disable network, make changes
- [ ] Verify "Failed to save" shows with Retry
- [ ] Re-enable network, click Retry
- [ ] Verify save succeeds

---

## 6. Summary of Required Fixes

| Priority | Issue | Fix |
|----------|-------|-----|
| **P0** | NoticeOnlySectionFlow unmount doesn't flush | Add pendingFactsRef flush |
| **P0** | EvictionSectionFlow unmount doesn't flush | Add pendingFactsRef flush |
| **P0** | save-facts shallow merge | Implement deep merge helper |
| **P1** | Scotland pre-action late validation | Move to inline in ScotlandGroundsSection |
| **P1** | Smart Review staleness | Invalidate on facts change |

---

*End of Audit*
