# Wizard System Comprehensive Audit
**Date:** January 2026
**Auditor:** Claude Code
**Branch:** `claude/fix-wizard-p0-issues-QBMr9`

---

## EXECUTIVE SUMMARY

### Are we legally safe to ship across all wizards?

**Answer: MOSTLY YES** ✅ (with 3 critical gaps requiring immediate attention)

The system has **robust server-side payment enforcement** and **comprehensive validation coverage** for most legal requirements. However, three issues need addressing before full confidence:

| Status | Finding |
|--------|---------|
| ✅ SAFE | Payment cannot be bypassed - server-side `assertPaidEntitlement()` enforced |
| ✅ SAFE | Blocking issues cannot be acknowledged away (P0-1 fix in place) |
| ✅ SAFE | Document generation validates before generating |
| ⚠️ GAP | NoticeOnlySectionFlow unmount can lose pending saves (data loss risk) |
| ⚠️ GAP | Shallow merge in save-facts can overwrite nested data |
| ⚠️ GAP | Some validation only at generate-time (late validation) |

### Top 5 Risks

| # | Risk | Severity | Impact |
|---|------|----------|--------|
| 1 | **NoticeOnlySectionFlow unmount doesn't flush pending saves** | P0 | Data loss if user navigates during 500ms debounce window |
| 2 | **Shallow merge in save-facts overwrites nested objects** | P0 | Partial updates can destroy previously saved section data |
| 3 | **Scotland pre-action letter validation only at generate-time** | P1 | User pays, then discovers they can't generate docs |
| 4 | **Smart Review staleness after facts change** | P1 | Stale warnings shown to users |
| 5 | **No offline detection/fallback** | P2 | Failed saves show error but no queued retry |

### Top 5 Fastest Improvements

| # | Improvement | Effort | Impact |
|---|-------------|--------|--------|
| 1 | Add flush to NoticeOnlySectionFlow unmount cleanup | 5 min | Prevents data loss |
| 2 | Deep merge in save-facts for nested objects | 30 min | Prevents overwrites |
| 3 | Add Scotland pre-action inline validation | 2 hrs | Earlier blocker surfacing |
| 4 | Add save state indicator ("Saving...") consistently | 1 hr | Better user feedback |
| 5 | Invalidate Smart Review on facts change | 1 hr | Prevents stale warnings |

---

## A. LEGAL VALIDATION COVERAGE MATRIX

### England - Section 21 (No-Fault Eviction)

| Legal Requirement | Rule ID | Validator Source | Inline Step | ValidationContext | Review/Analyze | Server Generate | Severity |
|-------------------|---------|------------------|-------------|-------------------|----------------|-----------------|----------|
| Deposit protected in approved scheme | `s21_deposit_noncompliant` | notice_only_rules.yaml | Section21ComplianceSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| Prescribed information served | `s21_deposit_noncompliant` | notice_only_rules.yaml | Section21ComplianceSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| Deposit ≤ 5 weeks rent (6 if ≥£50k) | `s21_deposit_cap_exceeded` | notice_only_rules.yaml | ValidatedCurrencyInput | ⚠️ Warning only | ✅ Yes | ✅ Yes | **Blocker** |
| Gas safety cert current | `s21_gas_cert` | notice_only_rules.yaml | Section21ComplianceSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| Valid EPC provided | `s21_epc` | notice_only_rules.yaml | Section21ComplianceSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| How to Rent guide given | `s21_how_to_rent` | notice_only_rules.yaml | Section21ComplianceSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| Property licensed (if HMO/selective) | `s21_licensing` | notice_only_rules.yaml | Section21ComplianceSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| 4-month bar period elapsed | `s21_four_month_bar` | notice_only_rules.yaml | ❌ No | ⚠️ Late | ✅ Yes | ✅ Yes | **Blocker** |
| 2-month notice period | `s21_notice_period_short` | notice_only_rules.yaml | NoticeSection (date picker) | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| No retaliatory eviction | `s21_retaliatory_*` | notice_only_rules.yaml | ❌ No | ⚠️ Late | ✅ Yes | ✅ Yes | **Blocker** |

### England - Section 8 (Fault-Based Eviction)

| Legal Requirement | Rule ID | Validator Source | Inline Step | ValidationContext | Review/Analyze | Server Generate | Severity |
|-------------------|---------|------------------|-------------|-------------------|----------------|-----------------|----------|
| At least one ground selected | `s8_grounds_required` | eviction-rules-engine.ts | NoticeSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| Ground 8: ≥2 months arrears | `s8_ground_8_threshold` | arrears-engine.ts | Section8ArrearsSection | ✅ Yes (P0-4) | ✅ Yes | ✅ Yes | **Blocker** |
| Arrears schedule complete (if G8/10/11) | `arrears_schedule_incomplete` | Section8ArrearsSection | ✅ Yes (P0-4) | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| Notice period per ground | `s8_notice_period_short` | notice_only_rules.yaml | ❌ No | ⚠️ Late | ✅ Yes | ✅ Yes | **Blocker** |
| Signature date ≥ notice expiry | `court_signing_signature_date` | CourtSigningSection | ✅ Yes (P0-3) | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |

### Wales - Section 173 (No-Fault)

| Legal Requirement | Rule ID | Validator Source | Inline Step | ValidationContext | Review/Analyze | Server Generate | Severity |
|-------------------|---------|------------------|-------------|-------------------|----------------|-----------------|----------|
| Rent Smart Wales registration | `s173_licensing_required` | wales/compliance-schema.ts | WalesComplianceSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| Written statement provided | `s173_written_statement_missing` | wales/compliance-schema.ts | WalesComplianceSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| Deposit protected | `s173_deposit_not_protected` | wales/compliance-schema.ts | WalesComplianceSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| 6-month minimum notice | `s173_notice_period_short` | notice_only_rules.yaml | WalesNoticeSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| Not standard/supported contract | `s173_contract_type_incompatible` | wales/compliance-schema.ts | ❌ No | ⚠️ Late | ✅ Yes | ✅ Yes | **Blocker** |

### Scotland - Notice to Leave (PRT)

| Legal Requirement | Rule ID | Validator Source | Inline Step | ValidationContext | Review/Analyze | Server Generate | Severity |
|-------------------|---------|------------------|-------------|-------------------|----------------|-----------------|----------|
| Landlord registered | `ntl_landlord_not_registered` | scotland/grounds.ts | ScotlandComplianceSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| At least one ground selected | `ntl_ground_required` | scotland/grounds.ts | ScotlandGroundsSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| 6-month tenancy rule | `validateSixMonthRule` | scotland/grounds.ts | ScotlandNoticeSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| Pre-action letter (Ground 1 arrears) | `ntl_pre_action_letter_not_sent` | scotland/grounds.ts | ❌ No | ⚠️ Late | ✅ Yes | ✅ Yes | **Blocker** |
| Pre-action signposting (Ground 1) | `ntl_pre_action_signposting_missing` | scotland/grounds.ts | ❌ No | ⚠️ Late | ✅ Yes | ✅ Yes | **Blocker** |
| Notice period (28/84 days) | `ntl_notice_period_insufficient` | scotland/grounds.ts | ScotlandNoticeSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| Deposit protected | `ntl_deposit_not_protected` | scotland/grounds.ts | ScotlandComplianceSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |

### Money Claim (England Only)

| Legal Requirement | Rule ID | Validator Source | Inline Step | ValidationContext | Review/Analyze | Server Generate | Severity |
|-------------------|---------|------------------|-------------|-------------------|----------------|-----------------|----------|
| Claimant details complete | `validateClaimantSection` | money-claim-case-validator.ts | ClaimantSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| Defendant details complete | `validateDefendantSection` | money-claim-case-validator.ts | DefendantSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| Letter Before Claim sent | `validatePreActionSection` | money-claim-case-validator.ts | PreActionSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| Arrears schedule (if claiming rent) | `validateArrearsSection` | money-claim-case-validator.ts | ArrearsSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| Damages schedule (if claiming damages) | `validateDamagesSection` | money-claim-case-validator.ts | DamagesSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |

### Tenancy Agreements (All Jurisdictions)

| Legal Requirement | Rule ID | Validator Source | Inline Step | ValidationContext | Review/Analyze | Server Generate | Severity |
|-------------------|---------|------------------|-------------|-------------------|----------------|-----------------|----------|
| Property address complete | Section-level check | TenancySectionFlow | PropertySection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| Landlord details complete | Section-level check | TenancySectionFlow | LandlordSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| Tenant details complete | Section-level check | TenancySectionFlow | TenantsSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| Rent amount/frequency set | Section-level check | TenancySectionFlow | RentSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |
| Deposit protection confirmed | Section-level check | TenancySectionFlow | DepositSection | ✅ Yes | ✅ Yes | ✅ Yes | **Blocker** |

---

## B. SMART UX COVERAGE MATRIX

### Autosave & Error Recovery

| Flow | Autosave | Debounce | Retry Button | Offline Detection | Local Fallback |
|------|----------|----------|--------------|-------------------|----------------|
| EvictionSectionFlow | ✅ Yes | 500ms | ✅ Yes (P0-2) | ❌ No | ❌ No |
| MoneyClaimSectionFlow | ✅ Yes | 500ms | ✅ Yes (P0-2) | ❌ No | ❌ No |
| NoticeOnlySectionFlow | ✅ Yes | 500ms | ✅ Yes (P0-2) | ❌ No | ❌ No |
| TenancySectionFlow | ✅ Yes | direct | ✅ Yes (P0-2) | ❌ No | ❌ No |

### Error Message Quality

| Component | Generic Error | Actionable Message | howToFix | legalRef | helpUrl |
|-----------|---------------|--------------------|---------| ---------|---------|
| ValidatedField | ❌ | ✅ Field-specific | ❌ No | ❌ No | ❌ No |
| SmartReviewPanel | ❌ | ✅ Actionable | ✅ Yes | ❌ No | ❌ No |
| BlockerBanner | ❌ | ✅ Actionable | ❌ No | ❌ No | ❌ No |
| ComplianceTimingBlocker | ❌ | ✅ Sanitized labels | ❌ No | ❌ No | ❌ No |
| Phase 13 Messages | ❌ | ✅ Enhanced | ✅ Yes | ✅ Yes | ✅ Yes |

### Accessibility

| Component | ARIA Labels | Focus Management | Keyboard Nav | Touch Targets |
|-----------|-------------|------------------|--------------|---------------|
| ValidatedInput | ✅ aria-invalid, aria-describedby | ✅ Yes | ✅ Yes | ⚠️ No min-h set |
| ValidatedSelect | ✅ aria-invalid, aria-describedby | ✅ Yes | ✅ Yes | ⚠️ No min-h set |
| Button | ✅ aria-disabled | ✅ Focus ring | ✅ Yes | ✅ min-h-touch (44px) |
| Modal | ✅ role="dialog", aria-modal | ✅ Focus trap, Escape | ✅ Yes | ✅ Yes |
| Toast | ✅ role="alert" | ❌ No | ❌ No | ✅ Yes |
| SectionNav | ❌ No | ❌ No | ⚠️ Partial | ⚠️ Needs audit |

### Mobile Layout

| Flow | Responsive | Overflow Handling | Key Controls Sizing |
|------|------------|-------------------|---------------------|
| EvictionSectionFlow | ✅ Yes | ✅ Yes | ⚠️ Needs audit |
| MoneyClaimSectionFlow | ✅ Yes | ✅ Yes | ⚠️ Needs audit |
| NoticeOnlySectionFlow | ✅ Yes | ✅ Yes | ⚠️ Needs audit |
| TenancySectionFlow | ✅ Yes | ✅ Yes | ⚠️ Needs audit |

### Progress & Feedback

| Flow | Step Progress | Save Indicator | Loading State | Help Points |
|------|---------------|----------------|---------------|-------------|
| EvictionSectionFlow | ✅ "Step X of Y" | ⚠️ Only on error | ✅ Yes | ❌ No |
| MoneyClaimSectionFlow | ✅ "Step X of Y" | ⚠️ Only on error | ✅ Yes | ❌ No |
| NoticeOnlySectionFlow | ✅ "Step X of Y" | ⚠️ Only on error | ✅ Yes | ❌ No |
| TenancySectionFlow | ✅ "Step X of Y" | ⚠️ Only on error | ✅ Yes | ❌ No |

---

## C. BYPASS & INTEGRITY AUDIT

### Can users pay/generate with blockers?

| Bypass Vector | Exploitable? | Evidence | Mitigation |
|---------------|--------------|----------|------------|
| UI acknowledgement checkbox for blockers | ❌ No | review/page.tsx:238-242 - returns early if `hasBlockingIssues` | P0-1 fix removed checkbox bypass |
| Direct route to /wizard/review | ❌ No | Analysis re-runs on page load | Server validates before payment |
| Deep link to /checkout/create | ❌ No | checkout/create/route.ts:326-397 | Server-side validation gates |
| Direct POST to /api/documents/generate | ❌ No | generate/route.ts:705-932 | Multiple validation layers |
| Modify request body (is_preview=false) | ⚠️ Partial | Client controls is_preview flag | `assertPaidEntitlement()` still runs |
| Race condition: edit after checkout | ⚠️ Partial | No lock between validation & payment | Edit window enforcement helps |

### Server-Side Enforcement Gaps

| Endpoint | Should Enforce | Does Enforce | Gap |
|----------|----------------|--------------|-----|
| POST /api/checkout/create | ✅ All blockers | ✅ S21 preconditions, notice validation | ⚠️ Not all Scotland blockers |
| POST /api/documents/generate | ✅ All blockers | ✅ Yes | ❌ None |
| POST /api/orders/regenerate | ✅ All blockers | ✅ Yes (preflight validation) | ❌ None |
| POST /api/wizard/save-facts | N/A (save only) | N/A | N/A |

### Facts Consistency Issues

| Issue | Location | Impact | Status |
|-------|----------|--------|--------|
| Nested vs flat facts divergence | arrears_items accessed via 2 paths | Inconsistent reads | ⚠️ Medium risk |
| Shallow merge overwrites | save-facts/route.ts:67-78 | Partial updates destroy data | 🔴 High risk |
| NoticeOnlySectionFlow unmount | Line ~615 | Pending saves lost | 🔴 High risk |
| Smart Review staleness | MoneyClaimSectionFlow:387 | Stale warnings shown | ⚠️ Medium risk |

### Race Conditions

| Scenario | Risk | Current Mitigation |
|----------|------|-------------------|
| Debounce window + navigation | 500ms data loss window | Flush before review navigation |
| Debounce window + browser close | 500ms data loss window | ❌ No mitigation |
| Edit after checkout, before payment | Data inconsistency | Edit window enforcement |
| Concurrent saves from multiple tabs | Last write wins | ❌ No version/lock |

---

## D. GAPS & RECOMMENDATIONS

### P0 - Critical (Legal invalid docs possible / Payment possible / Data loss)

#### P0-A: NoticeOnlySectionFlow Unmount Data Loss
- **Files:** `src/components/wizard/flows/NoticeOnlySectionFlow.tsx:615`
- **Issue:** Unmount cleanup clears timeout but doesn't flush `pendingFactsRef.current`
- **Impact:** User changes lost if navigating away within 500ms of last edit
- **Fix:** Add `if (pendingFactsRef.current) { saveFactsToServer(pendingFactsRef.current); }` to cleanup
- **Test:** Unit test verifying cleanup flushes pending; manual test navigating rapidly
- **Risk of Change:** Low - matches EvictionSectionFlow pattern

#### P0-B: Shallow Merge Destroys Nested Data
- **Files:** `src/app/api/wizard/save-facts/route.ts:67-78`
- **Issue:** Spread operator overwrites entire keys instead of deep merging
- **Impact:** Partial section saves can overwrite other sections' data
- **Fix:** Use lodash `merge()` or custom deep merge for nested objects
- **Test:** Integration test saving partial facts then verifying other data persists
- **Risk of Change:** Medium - need to ensure merge semantics don't break anything

#### P0-C: Scotland Pre-Action Only at Generate Time
- **Files:** `src/lib/scotland/grounds.ts`
- **Issue:** Pre-action letter/signposting for Ground 1 only validated at generate
- **Impact:** User pays then can't generate documents
- **Fix:** Add inline validation in ScotlandGroundsSection when Ground 1 selected
- **Test:** E2E test selecting Ground 1 without pre-action confirmation
- **Risk of Change:** Low - additive validation

### P1 - High (Major confusion / High abandonment / Significant accessibility)

#### P1-A: Save State Indicator Missing During Normal Operation
- **Files:** All *SectionFlow.tsx
- **Issue:** "Saving..." indicator only shows on error/retry, not during normal saves
- **Impact:** Users don't know if changes are saved
- **Fix:** Add subtle "Saving..." / "Saved" indicator in UI
- **Test:** Visual check during typing
- **Risk of Change:** Low

#### P1-B: Smart Review Staleness
- **Files:** `src/components/wizard/flows/MoneyClaimSectionFlow.tsx:387-392`
- **Issue:** Smart Review loaded once, not invalidated when facts change
- **Impact:** Users see outdated warnings
- **Fix:** Invalidate `__smart_review` when facts change significantly
- **Test:** Change facts after Smart Review loads, verify warnings update
- **Risk of Change:** Low

#### P1-C: Section Navigation Missing ARIA
- **Files:** Section navigation components
- **Issue:** No `aria-current="step"` or navigation landmarks
- **Impact:** Screen reader users can't track position
- **Fix:** Add ARIA landmarks and current step indication
- **Test:** VoiceOver/NVDA testing
- **Risk of Change:** Low

#### P1-D: Four-Month Bar Not Validated Inline
- **Files:** Notice date picker components
- **Issue:** S21 four-month bar only checked at review/generate
- **Impact:** Late discovery of blocking issue
- **Fix:** Add inline check when notice date entered with tenancy start date
- **Test:** Set tenancy start < 4 months ago, verify inline warning
- **Risk of Change:** Low

### P2 - Polish (Nice-to-have)

#### P2-A: No Offline Detection/Queued Retry
- **Files:** All flows
- **Issue:** No `navigator.onLine` checks or queued retry for failed saves
- **Impact:** Poor UX on flaky connections
- **Fix:** Add offline banner and queue saves for retry
- **Test:** Disable network, verify queued retry on reconnect
- **Risk of Change:** Medium

#### P2-B: Touch Targets for Form Fields
- **Files:** ValidatedInput, ValidatedSelect
- **Issue:** No `min-h-touch` on form fields (only Button has it)
- **Impact:** WCAG AAA compliance gap on mobile
- **Fix:** Add `min-h-[44px]` to form controls
- **Test:** Mobile usability testing
- **Risk of Change:** Low

#### P2-C: Help Points in Complex Sections
- **Files:** Compliance sections, arrears sections
- **Issue:** No contextual help beyond error messages
- **Impact:** User confusion on complex legal requirements
- **Fix:** Add `?` tooltips linking to help articles
- **Test:** User testing for discoverability
- **Risk of Change:** Low

#### P2-D: Version Conflict Detection
- **Files:** save-facts endpoint
- **Issue:** No optimistic locking for concurrent edits
- **Impact:** Last write wins, potentially losing changes
- **Fix:** Add version field, reject stale updates
- **Test:** Two-tab concurrent edit scenario
- **Risk of Change:** Medium

---

## E. MINIMAL TEST PLAN

### Smoke Tests Per Wizard (Happy Path + Key Failures)

#### Eviction Complete Pack (England S21)
```
✅ Happy Path:
1. Create case → Parties → Property → Tenancy → S21 Compliance → Notice → Evidence → Court & Signing → Review
2. All fields complete, all compliance confirmed
3. Proceed to checkout → Payment succeeds → Documents generated

❌ Failure 1: Deposit Not Protected
1. In S21 Compliance, set deposit_protected = false
2. Expected: Blocker shown, Next disabled (if inline) OR Review shows blocker

❌ Failure 2: Arrears Schedule Invalid (if S8)
1. Select Section 8 with Ground 8
2. Enter arrears with start > end date
3. Expected: Inline error "Period X: Start date after end date", Next disabled

❌ Failure 3: Save Fails
1. Disable network after entering data
2. Expected: Error banner with "Retry" button appears
```

#### Notice Only (England S8)
```
✅ Happy Path:
1. Select Section 8 route → Select Ground 8 → Enter arrears ≥2 months → Review → Generate

❌ Failure 1: Ground 8 Threshold Not Met
1. Enter arrears < 2 months
2. Expected: "Ground 8 threshold not met" blocker

❌ Failure 2: Missing Grounds
1. Don't select any grounds
2. Expected: Cannot proceed past Notice section
```

#### Notice Only (Scotland)
```
✅ Happy Path:
1. Scotland → Select Ground → Enter notice date respecting 6-month rule → Review → Generate

❌ Failure 1: 6-Month Rule Violated
1. Set tenancy start < 6 months ago
2. Expected: Inline blocker preventing notice generation

❌ Failure 2: Ground 1 Without Pre-Action (KNOWN LATE VALIDATION)
1. Select Ground 1 (rent arrears)
2. Don't confirm pre-action letter sent
3. Expected: Blocker at generate time (currently late - see P0-C)
```

#### Money Claim (England)
```
✅ Happy Path:
1. Claimant → Defendant → Tenancy → Claim Details → Arrears → Pre-Action → Review → Checkout

❌ Failure 1: Missing Letter Before Claim
1. Don't confirm LBA sent
2. Expected: Blocker at Review

❌ Failure 2: Claiming Rent Without Schedule
1. Select "claiming rent arrears"
2. Don't complete arrears schedule
3. Expected: Blocker at Arrears section
```

#### Tenancy Agreement (All Jurisdictions)
```
✅ Happy Path:
1. Select product tier → Property → Landlord → Tenants → Tenancy → Rent → Deposit → Bills → Compliance → Terms → Review

❌ Failure 1: Missing Property Address
1. Leave property address blank
2. Expected: Cannot proceed past Property section
```

### Regression Tests for Shared Components

```
ValidatedField Regression:
- [ ] Error displays below field with red border
- [ ] aria-invalid set when error present
- [ ] Error clears on valid input
- [ ] Blocking message prevents Next (ValidatedYesNoToggle)

ValidationContext Regression:
- [ ] hasErrors = true when any severity='error' present
- [ ] hasErrors = false when only warnings
- [ ] Errors cleared on component unmount

Save/Autosave Regression:
- [ ] Changes saved after 500ms debounce
- [ ] Pending changes flushed before navigation to review
- [ ] Retry button works after save failure
- [ ] Multiple rapid changes consolidated into single save
```

### Go-Live Validation Checklist

#### Pre-Deploy
- [ ] All P0 issues fixed and merged
- [ ] TypeScript builds cleanly
- [ ] Lint passes (or only pre-existing warnings)
- [ ] Unit tests pass

#### Staging Environment
- [ ] Each wizard happy path completes successfully
- [ ] Payment integration test (Stripe test mode)
- [ ] Document generation produces valid PDFs
- [ ] Mobile responsive layout verified

#### Production Canary
- [ ] First 10 real cases monitored for errors
- [ ] Sentry/logging reviewed for new exceptions
- [ ] User feedback collected

---

## APPENDIX: Key File Locations

### Wizard Flows
| File | Purpose |
|------|---------|
| `src/components/wizard/flows/EvictionSectionFlow.tsx` | Eviction complete pack |
| `src/components/wizard/flows/MoneyClaimSectionFlow.tsx` | Money claim pack |
| `src/components/wizard/flows/NoticeOnlySectionFlow.tsx` | Notice-only products |
| `src/components/wizard/flows/TenancySectionFlow.tsx` | Tenancy agreements |

### Validation
| File | Purpose |
|------|---------|
| `src/components/wizard/ValidationContext.tsx` | React validation state |
| `src/components/wizard/ValidatedField.tsx` | Form field components |
| `src/lib/validation/noticeOnlyInlineValidator.ts` | Wizard inline validation |
| `src/lib/validation/eviction-rules-engine.ts` | YAML rule evaluation |
| `src/lib/decision-engine/index.ts` | Route/ground analysis |

### Rule Catalogs
| File | Purpose |
|------|---------|
| `config/legal-requirements/england/notice_only_rules.yaml` | England rules (150+) |
| `config/legal-requirements/wales/notice_only_rules.yaml` | Wales rules |
| `config/legal-requirements/scotland/notice_only_rules.yaml` | Scotland rules |
| `config/validation/phase13-messages.yaml` | Enhanced UX messages |

### API Endpoints
| Endpoint | Purpose |
|----------|---------|
| `src/app/api/wizard/save-facts/route.ts` | Save wizard facts |
| `src/app/api/checkout/create/route.ts` | Payment initiation |
| `src/app/api/documents/generate/route.ts` | Document generation |
| `src/app/api/orders/regenerate/route.ts` | Paid case regeneration |

---

*End of Audit Report*
