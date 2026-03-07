# Wizard UI/UX Audit Report

**Date**: January 2026
**Scope**: Core Product Wizards (Notices, Eviction Pack, Money Claim Pack, Tenancy Agreements)
**Prepared by**: Claude Code AI Audit

---

## Table of Contents

1. [Wizard Route/Step Maps](#1-wizard-routestep-maps)
2. [Key UX Risks by Wizard](#2-key-ux-risks-by-wizard)
3. [Validation/Error UX Findings](#3-validationerror-ux-findings)
4. [Mobile/Accessibility Findings](#4-mobileaccessibility-findings)
5. [Performance & Reliability Findings](#5-performance--reliability-findings)
6. [Prioritized Improvement Backlog (P0/P1/P2)](#6-prioritized-improvement-backlog)
7. [Quick Wins (<2 hours)](#7-quick-wins-2-hours)

---

## 1. Wizard Route/Step Maps

### 1.1 Notices Only Wizard (England/Wales/Scotland)

| Attribute | Details |
|-----------|---------|
| **Entry Route** | `/wizard?product=notice_only` |
| **Flow Route** | `/wizard/flow?type=eviction&jurisdiction={jur}&product=notice_only` |
| **Flow Component** | `src/components/wizard/flows/NoticeOnlySectionFlow.tsx` |
| **Key Data Model** | `WizardFacts` (flat schema in `src/lib/case-facts/schema.ts`) |

**Steps (England/Wales):**

| Step | Section | Component File | Required Fields |
|------|---------|----------------|-----------------|
| 1 | Case Basics | `sections/eviction/CaseBasicsSection.tsx` | jurisdiction, eviction_route |
| 2 | Parties | `sections/eviction/PartiesSection.tsx` | landlord_full_name, landlord_address, tenant_full_name |
| 3 | Property | `sections/eviction/PropertySection.tsx` | property_address_line1, property_postcode |
| 4 | Tenancy | `sections/eviction/TenancySection.tsx` | tenancy_start_date, rent_amount, rent_frequency |
| 5 | S21 Compliance | `sections/eviction/Section21ComplianceSection.tsx` | deposit_*, gas_safety_*, epc_served, how_to_rent_served |
| 6 | Notice Details | `sections/eviction/NoticeSection.tsx` | notice_service_date, notice_service_method |
| 7 | S8 Arrears | `sections/eviction/Section8ArrearsSection.tsx` | arrears_items[] (conditional) |
| 8 | Review | `/wizard/review` page | N/A |

**Steps (Scotland):**

| Step | Section | Component File | Required Fields |
|------|---------|----------------|-----------------|
| 1 | Case Basics | `sections/eviction/CaseBasicsSection.tsx` | jurisdiction=scotland |
| 2 | Parties | `sections/eviction/PartiesSection.tsx` | landlord_*, tenant_* |
| 3 | Property | `sections/eviction/PropertySection.tsx` | property_address_*, property_postcode |
| 4 | Tenancy | `sections/eviction/TenancySection.tsx` | tenancy_start_date (6-month rule) |
| 5 | Grounds | `sections/eviction/ScotlandGroundsSection.tsx` | scotland_ground |
| 6 | Notice | `sections/eviction/ScotlandNoticeSection.tsx` | notice_to_leave_date |
| 7 | Review | `/wizard/review` page | N/A |

---

### 1.2 Eviction Pack Wizard (England)

| Attribute | Details |
|-----------|---------|
| **Entry Route** | `/wizard?product=complete_pack` |
| **Flow Route** | `/wizard/flow?type=eviction&jurisdiction=england&product=complete_pack` |
| **Flow Component** | `src/components/wizard/flows/EvictionSectionFlow.tsx` |
| **Key Data Model** | `WizardFacts` + case_facts table |

**Steps:**

| Step | Section | Component File | Required Fields |
|------|---------|----------------|-----------------|
| 1 | Case Basics | `sections/eviction/CaseBasicsSection.tsx` | jurisdiction, eviction_route |
| 2 | Parties | `sections/eviction/PartiesSection.tsx` | All party details |
| 3 | Property | `sections/eviction/PropertySection.tsx` | Full address |
| 4 | Tenancy | `sections/eviction/TenancySection.tsx` | All tenancy details |
| 5 | Notice | `sections/eviction/NoticeSection.tsx` | Notice details |
| 6 | S21 Compliance | `sections/eviction/Section21ComplianceSection.tsx` | All compliance fields (S21) |
| 7 | S8 Arrears | `sections/eviction/Section8ArrearsSection.tsx` | Arrears schedule (S8) |
| 8 | Evidence | `sections/eviction/EvidenceSection.tsx` | Document uploads |
| 9 | Court & Signing | `sections/eviction/CourtSigningSection.tsx` | Court name, signatory |
| 10 | Review | `sections/eviction/ReviewSection.tsx` | Validate all |

---

### 1.3 Money Claim Pack Wizard (England)

| Attribute | Details |
|-----------|---------|
| **Entry Route** | `/wizard?product=money_claim` |
| **Flow Route** | `/wizard/flow?type=money_claim&jurisdiction=england&product=money_claim` |
| **Flow Component** | `src/components/wizard/flows/MoneyClaimSectionFlow.tsx` |
| **Key Data Model** | `WizardFacts` |

**Steps:**

| Step | Section | Component File | Required Fields |
|------|---------|----------------|-----------------|
| 1 | Claimant | `money-claim/ClaimantSection.tsx` | Landlord/company details |
| 2 | Defendant | `money-claim/DefendantSection.tsx` | Tenant details |
| 3 | Tenancy | `money-claim/TenancySection.tsx` | Start date, rent |
| 4 | Claim Details | `sections/money-claim/ClaimDetailsSection.tsx` | Claim types, amounts |
| 5 | Rent & Arrears | `money-claim/ArrearsSection.tsx` | Arrears breakdown |
| 6 | Damages & Costs | `money-claim/DamagesSection.tsx` | Additional claims |
| 7 | Pre-action Steps | `money-claim/PreActionSection.tsx` | Letter before action |
| 8 | Timeline & PAP | `money-claim/TimelineSection.tsx` | Pre-action protocol |
| 9 | Evidence | `money-claim/EvidenceSection.tsx` | Document uploads |
| 10 | Enforcement | `money-claim/EnforcementSection.tsx` | Preferences |
| 11 | Review | `money-claim/ReviewSection.tsx` | Validate all |

---

### 1.4 Tenancy Agreement Wizard (E/W/S/NI)

| Attribute | Details |
|-----------|---------|
| **Entry Route** | `/wizard?product=tenancy_agreement` |
| **Flow Route** | `/wizard/flow?type=tenancy_agreement&jurisdiction={jur}&product={tier}` |
| **Flow Component** | `src/components/wizard/flows/TenancySectionFlow.tsx` |
| **Key Data Model** | `WizardFacts` |

**Jurisdiction-Specific Terminology:**
- **England**: Assured Shorthold Tenancy (AST) - Standard/Premium
- **Wales**: Occupation Contract - Standard/Premium
- **Scotland**: Private Residential Tenancy (PRT) - Standard/Premium
- **Northern Ireland**: Private Tenancy - Standard/Premium

**Steps:**

| Step | Section | Required Fields |
|------|---------|-----------------|
| 1 | Product | tier selection (standard/premium) |
| 2 | Property | Address, property type |
| 3 | Landlord | Landlord contact, service address |
| 4 | Tenants | Tenant details |
| 5 | Tenancy | Start date, term, type |
| 6 | Rent | Amount, payment method |
| 7 | Deposit | Amount, protection |
| 8 | Bills | Utilities responsibility |
| 9 | Compliance | Safety certificates |
| 10 | Terms | Rules, access, maintenance |
| 11 | Premium Features | Premium clauses (if applicable) |
| 12 | Review | Final review |

---

## 2. Key UX Risks by Wizard

### 2.1 Notices Only Wizard

| Risk | Severity | Files Affected | Why It Causes Drop-Off |
|------|----------|----------------|------------------------|
| **Complex N5B AST Verification Questions** | HIGH | `Section21ComplianceSection.tsx:449-533` | 7 consecutive Yes/No toggles with inverted logic (TRUE=bad stored, UI shows positive). Users struggle with double-negative phrasing like "Q9(b): Was NO notice served stating the tenancy is not an AST?" |
| **Missing Jurisdiction Context for Route Selection** | MEDIUM | `CaseBasicsSection.tsx` | Users unfamiliar with legal terminology (S21 vs S8, S173) lack guidance on which route to choose |
| **No Progress Save Indicator** | MEDIUM | `NoticeOnlySectionFlow.tsx:795` | Debounced autosave happens silently; users unsure if data persists on refresh |
| **Section 21 Compliance Wall of Questions** | HIGH | `Section21ComplianceSection.tsx` | 20+ fields with complex conditional logic. High cognitive load. |

### 2.2 Eviction Pack Wizard

| Risk | Severity | Files Affected | Why It Causes Drop-Off |
|------|----------|----------------|------------------------|
| **Arrears Schedule Complexity** | HIGH | `Section8ArrearsSection.tsx` | Multi-row arrears table with date validation. Manual entry prone to errors. No import/paste option. |
| **Evidence Upload with No Guidance** | MEDIUM | `EvidenceSection.tsx` | No clear explanation of what documents are needed. Categories unclear. |
| **Court & Signing Step Missing Date Validation** | HIGH | `CourtSigningSection.tsx` | Signature date can be set incorrectly relative to notice dates, causing compliance timing errors at generate time |
| **Scotland Ground Selection Overwhelming** | MEDIUM | `ScotlandGroundsSection.tsx` | 18 grounds presented without filtering by common use case |

### 2.3 Money Claim Pack Wizard

| Risk | Severity | Files Affected | Why It Causes Drop-Off |
|------|----------|----------------|------------------------|
| **11 Sections Before Review** | MEDIUM | `MoneyClaimSectionFlow.tsx` | Longest wizard. Progress feels slow. |
| **Arrears Schedule Duplicated from Eviction** | LOW | `money-claim/ArrearsSection.tsx` | Same complexity issues as eviction arrears |
| **Pre-Action Steps Unclear** | MEDIUM | `PreActionSection.tsx` | Users unsure what "Letter Before Action" requires |
| **No Claim Amount Calculator** | MEDIUM | `DamagesSection.tsx` | Users must manually calculate interest, statutory interest at 8% |

### 2.4 Tenancy Agreement Wizard

| Risk | Severity | Files Affected | Why It Causes Drop-Off |
|------|----------|----------------|------------------------|
| **Premium Upsell Confusion** | MEDIUM | `TenancySectionFlow.tsx` | Standard vs Premium tier selection early in flow. Users unsure of value difference. |
| **No Clause Preview Before Payment** | MEDIUM | `TenancySectionFlow.tsx` | Users can't see HMO-specific or pet clauses until after purchase |
| **12 Sections** | MEDIUM | Flow | Long wizard with many optional fields |

---

## 3. Validation/Error UX Findings

### 3.1 Validation Trigger Patterns

| Pattern | Behavior | Files |
|---------|----------|-------|
| **Blur-based** | Errors appear after field loses focus. `touched` state tracks this. | `ValidatedField.tsx:106-115` |
| **Change-based** | `ValidatedTextarea` validates on keystroke unless `validateOnBlur` flag set | `ValidatedField.tsx:363-374` |
| **Section-based** | `ValidationContext` aggregates errors. `hasErrors` gates Next button. | `ValidationContext.tsx` |

### 3.2 Error Message Quality

| Issue | Severity | Example | Files |
|-------|----------|---------|-------|
| **Generic Required Messages** | MEDIUM | "This field is required." - No context | `ValidatedField.tsx:622` |
| **Blocking Messages Well-Written** | GOOD | "Section 21 cannot be used if the deposit is not protected." | `Section21ComplianceSection.tsx:149` |
| **Phase 13 Messages Underutilized** | HIGH | Enhanced messages with `title/howToFix/legalRef/helpUrl` exist but not surfaced in all inline contexts | `phase13-messages.ts` |

### 3.3 Server Error Handling

| Issue | Severity | Files |
|-------|----------|-------|
| **Generic "Failed to save" Error** | HIGH | `setError('Failed to save. Please try again.');` - No retry button, no detail | `EvictionSectionFlow.tsx:533` |
| **No Offline Detection** | MEDIUM | No check for navigator.onLine before save attempts | All flows |
| **Silent Failures in case_facts Update** | MEDIUM | If one table fails, continues without user notification | `/api/wizard/save-facts/route.ts` |

### 3.4 Blocked vs Warning Presentation

| State | Visual | Behavior |
|-------|--------|----------|
| **Blocking Issue** | Red border, red message, Next button disabled | `ValidatedYesNoToggle:653-655` |
| **Warning** | Amber background, shown but not blocking | `SmartReviewPanel.tsx:56-81` |
| **Info** | Blue background, informational only | Review panels |

### 3.5 Critical Finding: Payment with Blocking Issues

| Finding | Severity | Files |
|---------|----------|-------|
| **Acknowledge Checkbox Allows Proceed** | P0 | `review/page.tsx:238-239` - Users can proceed to payment after acknowledging blockers. Risk of paying for invalid documents. |

---

## 4. Mobile/Accessibility Findings

### 4.1 Touch Target Compliance

| Component | Status | Notes |
|-----------|--------|-------|
| **Button** | GOOD | `min-h-touch` (44px) enforced |
| **Input** | GOOD | `min-h-touch` on all inputs |
| **Yes/No Toggle** | NEEDS WORK | `px-4 py-2` = ~36px height, below 44px minimum |
| **DateInput Quick Options** | GOOD | `px-3 py-2` adequate for buttons |

### 4.2 ARIA Attributes

| Component | Status | Notes |
|-----------|--------|-------|
| **ValidatedInput** | GOOD | `aria-invalid`, `aria-describedby` properly linked |
| **ValidatedSelect** | GOOD | Same as above |
| **ValidatedYesNoToggle** | NEEDS WORK | Missing `aria-describedby` for error/helper text linkage |
| **SmartReviewPanel** | NEEDS WORK | Collapsible panel missing `aria-expanded` on button |
| **WarningCard** | NEEDS WORK | Expandable cards use `div onClick` instead of `button` |
| **MultipleSelection** | GOOD | Supports `aria-label` prop |

### 4.3 Keyboard Navigation

| Component | Status | Notes |
|-----------|--------|-------|
| **Modal** | GOOD | Escape key closes, backdrop click handled |
| **Dropdown** | GOOD | Enter/Escape handlers, click-outside detection |
| **Section Tabs** | NEEDS WORK | No keyboard navigation between tab buttons |
| **Arrears Schedule Table** | NEEDS WORK | Tab order through cells not tested |

### 4.4 Responsive/Overflow Issues

| Issue | Severity | Files |
|-------|----------|-------|
| **ConfirmationModal max-w-md** | LOW | Could overflow on screens <384px | `ConfirmationModal.tsx` |
| **Message Bubbles max-w-[80%]** | LOW | May overflow on very narrow screens (<320px) | `WizardContainer.tsx` |
| **Table horizontal scroll** | LOW | Works but no scroll indicator | `Table.tsx` |
| **Section21ComplianceSection** | LOW | Long form, but `space-y-8` provides good spacing |

### 4.5 Focus Management

| Issue | Severity | Notes |
|-------|----------|-------|
| **No focus trap in modals** | MEDIUM | User can tab out of modal to background elements |
| **No focus restoration** | LOW | After modal close, focus doesn't return to trigger |
| **Stepper navigation** | LOW | Focus not moved to new section on tab click |

---

## 5. Performance & Reliability Findings

### 5.1 Re-render Analysis

| Pattern | Status | Files |
|---------|--------|-------|
| **Debounced Save** | GOOD | 500ms debounce prevents API spam | `EvictionSectionFlow.tsx:550` |
| **useMemo for Validation** | GOOD | `ValidatedInput` uses `useMemo` for error computation | `ValidatedField.tsx:111-115` |
| **Context Re-renders** | NEEDS WORK | `ValidationContext` triggers re-renders on every error update |

### 5.2 State Persistence

| Pattern | Status | Notes |
|---------|--------|-------|
| **URL-based case_id** | GOOD | Case ID in URL allows refresh without loss |
| **Debounce Flush on Navigate** | GOOD | `handleComplete` flushes pending saves | `EvictionSectionFlow.tsx:617` |
| **No localStorage Backup** | NEEDS WORK | If API save fails, data is lost |
| **Back Button Behavior** | GOOD | Browser back navigates between sections |

### 5.3 API Call Patterns

| Issue | Severity | Notes |
|-------|----------|-------|
| **Single Save Endpoint** | GOOD | `/api/wizard/save-facts` handles all updates |
| **Analyze Call on Review Load** | GOOD | Single POST to `/api/wizard/analyze` |
| **No Request Deduplication** | LOW | Rapid navigation could trigger duplicate saves |

---

## 6. Prioritized Improvement Backlog

### P0 - Must Fix Before Go-Live

| ID | Issue | Impact | Effort | Files to Modify |
|----|-------|--------|--------|-----------------|
| **P0-1** | Users can pay with acknowledged blocking issues | Users may receive invalid documents they can't use | M | `src/app/wizard/review/page.tsx:238-250` - Remove or restrict acknowledge bypass for true blockers |
| **P0-2** | Generic "Failed to save" error with no retry | Users lose data, abandon flow | S | `EvictionSectionFlow.tsx:533`, `MoneyClaimSectionFlow.tsx:428`, `NoticeOnlySectionFlow.tsx:xxxx` - Add retry button and specific error messages |
| **P0-3** | Compliance timing errors only surface at generate time | Late-stage failure after full wizard completion | M | `CourtSigningSection.tsx` - Add inline date validation against notice dates |
| **P0-4** | Arrears schedule allows invalid date ranges | Section 8 Ground 8 calculation may be wrong | S | `Section8ArrearsSection.tsx` - Add date range validation |

### P1 - Should Fix in Next 1-2 Weeks

| ID | Issue | Impact | Effort | Files to Modify |
|----|-------|--------|--------|-----------------|
| **P1-1** | N5B questions double-negative phrasing | User confusion, incorrect answers | M | `Section21ComplianceSection.tsx:449-533` - Rewrite questions positively: "Is this a standard AST?" instead of "Was NO notice served that it's NOT an AST?" |
| **P1-2** | Phase 13 enhanced messages not surfaced inline | Users don't see helpful fix guidance | M | `ValidatedField.tsx`, `ValidationContext.tsx` - Integrate `phase13-messages.ts` lookup for known rule IDs |
| **P1-3** | No autosave indicator | Users unsure if data is saved | S | All flow components - Add "Saved" / "Saving..." indicator near navigation |
| **P1-4** | SmartReviewPanel missing ARIA attributes | Screen reader users can't navigate warnings | S | `SmartReviewPanel.tsx` - Add `aria-expanded`, change `div onClick` to `button` |
| **P1-5** | Yes/No Toggle touch targets too small | Mobile users may mis-tap | S | `ValidatedField.tsx:669-711` - Increase padding to achieve 44px minimum |
| **P1-6** | Scotland ground selection overwhelming | Drop-off at ground selection | M | `ScotlandGroundsSection.tsx` - Add "common reasons" filter or wizard-within-wizard |
| **P1-7** | Evidence section lacks upload guidance | Users unsure what to upload | S | `EvidenceSection.tsx` - Add category-specific help text |
| **P1-8** | No keyboard navigation for section tabs | Accessibility violation | S | Flow components - Add arrow key navigation between tabs |
| **P1-9** | Section 21 compliance section overwhelming | 20+ fields, high cognitive load | L | `Section21ComplianceSection.tsx` - Consider progressive disclosure or sub-accordions |

### P2 - Nice to Have (Polish)

| ID | Issue | Impact | Effort | Files to Modify |
|----|-------|--------|--------|-----------------|
| **P2-1** | Add localStorage backup for failed saves | Resilience | M | Flow components - Save to localStorage on API failure |
| **P2-2** | Add claim amount calculator | Convenience | M | `DamagesSection.tsx` - Add interest calculator |
| **P2-3** | Add arrears CSV/paste import | Convenience | L | `ArrearsSection.tsx` - Parse CSV or detect paste |
| **P2-4** | Modal focus trap | Accessibility polish | S | `Modal.tsx` - Implement focus-trap-react or similar |
| **P2-5** | Clause preview for Tenancy Premium | Conversion | M | `TenancySectionFlow.tsx` - Show sample clauses before tier selection |
| **P2-6** | Pre-action letter template preview | Clarity | S | `PreActionSection.tsx` - Show sample LBA |
| **P2-7** | Mobile stepper improvements | UX polish | M | Flow components - Horizontal scroll indicator for tabs |
| **P2-8** | Offline detection and queued saves | Resilience | M | All flows - Add navigator.onLine checks |

---

## 7. Quick Wins (<2 hours)

These improvements can be implemented quickly with high impact:

### QW-1: Add Retry Button to Save Errors
**Files**: `EvictionSectionFlow.tsx:815-819`, `MoneyClaimSectionFlow.tsx:777-781`, `TenancySectionFlow.tsx:554-558`
**Change**: Replace static error message with button that retries save
**Impact**: Reduces abandonment on transient network errors

```tsx
// Current
{error && <div className="text-red-600 text-sm">{error}</div>}

// Improved
{error && (
  <div className="flex items-center gap-2 text-red-600 text-sm">
    <span>{error}</span>
    <button onClick={handleSave} className="underline">Retry</button>
  </div>
)}
```

### QW-2: Add Autosave Indicator
**Files**: All flow components
**Change**: Add "Saving..." / "All changes saved" indicator
**Impact**: User confidence, reduced anxiety

### QW-3: Yes/No Toggle Touch Targets
**File**: `ValidatedField.tsx:671-710`
**Change**: Increase padding from `px-4 py-2` to `px-5 py-3`
**Impact**: Mobile accessibility compliance

### QW-4: SmartReviewPanel ARIA Fixes
**File**: `SmartReviewPanel.tsx:156-189`
**Change**: Add `aria-expanded={isExpanded}` to header button, change WarningCard `div onClick` to `button`
**Impact**: Screen reader accessibility

### QW-5: Add Helper Text to Evidence Upload Categories
**File**: `EvidenceSection.tsx`
**Change**: Add `helperText` to each category explaining what documents are needed
**Impact**: Reduces confusion, support tickets

### QW-6: ValidatedYesNoToggle ARIA Improvements
**File**: `ValidatedField.tsx:662-743`
**Change**: Add `aria-describedby` linking to error/helper text elements
**Impact**: Screen reader accessibility

### QW-7: Add "Most Common" Filter to Scotland Grounds
**File**: `ScotlandGroundsSection.tsx`
**Change**: Add toggle to show only grounds 1-4, 8, 12 (most common landlord grounds)
**Impact**: Reduces cognitive load

---

## Appendix A: Component Reference

### Shared Form Components

| Component | File | Purpose |
|-----------|------|---------|
| ValidatedInput | `components/wizard/ValidatedField.tsx` | Text/email/date input with validation |
| ValidatedSelect | `components/wizard/ValidatedField.tsx` | Dropdown with validation |
| ValidatedTextarea | `components/wizard/ValidatedField.tsx` | Multi-line with validation |
| ValidatedCurrencyInput | `components/wizard/ValidatedField.tsx` | £ prefixed input |
| ValidatedYesNoToggle | `components/wizard/ValidatedField.tsx` | Yes/No with blocking support |
| DateInput | `components/wizard/DateInput.tsx` | Date picker with quick options |
| CurrencyInput | `components/wizard/CurrencyInput.tsx` | Currency input standalone |
| TextInput | `components/wizard/TextInput.tsx` | Text input standalone |
| FileUpload | `components/wizard/FileUpload.tsx` | File upload with drag/drop |
| MultipleChoice | `components/wizard/MultipleChoice.tsx` | Radio button options |
| MultipleSelection | `components/wizard/MultipleSelection.tsx` | Checkbox options |

### Validation Files

| File | Purpose |
|------|---------|
| `lib/validation/mqs-field-validator.ts` | Field-level validation rules |
| `lib/validation/noticeOnlyInlineValidator.ts` | Notice-specific inline validation |
| `lib/validation/noticeOnlyWizardUxIssues.ts` | Route-invalidating issue detection |
| `lib/validation/money-claim-case-validator.ts` | Money claim validation |
| `lib/validation/phase13-messages.ts` | Enhanced error message catalog |
| `components/wizard/ValidationContext.tsx` | Context for aggregated validation state |

---

## Appendix B: Test Commands

```bash
# Run available tests (requires vitest installation)
npm install --save-dev vitest
npx vitest run

# Search for validation issues in wizard code
grep -r "TODO\|FIXME\|disabled\|error\|toast\|validation" src/components/wizard/

# Find hardcoded widths (potential responsive issues)
grep -r "w-\[.*px\]\|max-w-\[.*px\]" src/components/wizard/
```

---

## Appendix C: MQS Configuration Files

| Product | Jurisdiction | Config Path |
|---------|--------------|-------------|
| Notice Only | England | `config/mqs/notice_only/england.yaml` |
| Notice Only | Wales | `config/mqs/notice_only/wales.yaml` |
| Notice Only | Scotland | `config/mqs/notice_only/scotland.yaml` |
| Complete Pack | England | `config/mqs/complete_pack/england.yaml` |
| Money Claim | England | `config/mqs/money_claim/england.yaml` |
| Tenancy Agreement | England | `config/mqs/tenancy_agreement/england.yaml` |
| Tenancy Agreement | Wales | `config/mqs/tenancy_agreement/wales.yaml` |
| Tenancy Agreement | Scotland | `config/mqs/tenancy_agreement/scotland.yaml` |
| Tenancy Agreement | NI | `config/mqs/tenancy_agreement/northern-ireland.yaml` |

---

*End of Audit Report*
