# Notice-Only Validation UX Audit

**Date:** 2025-12-22
**Purpose:** Document all UI and logic that currently shows compliance/decision issues during the wizard for notice_only products.

---

## 1. Primary Validation Files

### 1.1 `src/lib/validation/noticeOnlyWizardUxIssues.ts` (809 lines)

**Purpose:** Extracts and classifies wizard-stage validation issues for notice_only products.

**Key Functions:**
- `extractWizardUxIssues(input)` - Main entry point that:
  - Runs decision engine (`runDecisionEngine()`)
  - Runs compliance evaluator (`evaluateNoticeCompliance()`)
  - Separates route-invalidating issues from inline warnings
  - Calculates deposit cap with computed values
  - Filters issues to only those triggered by the last saved question

**Key Types:**
```typescript
RouteInvalidatingIssue: {code, route, description, legalBasis, affectedQuestionId, userFixHint}
InlineWarning: {code, message, severity, legalBasis, affectedQuestionId, computedValues}
MissingRequiredFact: {code, questionId, message}
WizardUxIssuesResult: {routeInvalidatingIssues[], missingRequiredForCurrentRoute[], inlineWarnings[], alternativeRoutes[]}
```

**Critical Logic:**
- **Explicit Disqualifying Conditions (Lines 165-280):** Only shows modal when fact is explicitly set to disqualifying value, NOT when missing
- **Route-Invalidating Codes by Route:**
  - Section 21: `S21-DEPOSIT-NONCOMPLIANT`, `S21-PRESCRIBED-INFO-REQUIRED`, `S21-GAS-CERT`, `S21-EPC`, `S21-H2R`, `S21-LICENSING`, `S21-FOUR-MONTH-BAR`
  - Section 8: `S8-GROUNDS-REQUIRED`
  - Wales S173: various compliance codes
- **Deposit Cap (`S21-DEPOSIT-CAP-EXCEEDED`):** Inline-only, never blocks Next

### 1.2 `src/lib/validation/noticeOnlyInlineValidator.ts` (250+ lines)

**Purpose:** Inline validation for notice-only steps.

**Key Functions:**
- `validateStepInline()` - Per-step validation
- `calculateDepositCap()` - Deposit cap enforcement

### 1.3 `src/lib/validation/wizardIssueFilter.ts` (318 lines)

**Purpose:** Filters validation issues to only show relevant ones (wizard vs preview context).

**Key Functions:**
- `filterWizardIssues()` - Filters for WIZARD context (no future steps shown)
- `categorizeIssues()` - Separates blocking vs warning issues
- `transformIssuesWithFriendlyLabels()` - For PREVIEW context (all issues shown)

---

## 2. UI Components Displaying Compliance Issues

### 2.1 `src/components/wizard/StructuredWizard.tsx` (4000+ lines)

**The main wizard component with extensive notice-only validation UI.**

#### Key State Variables (Lines 260-275):
```typescript
noticeOnlyGuidance: InlineGuidance[]           // Non-blocking guidance messages
noticeOnlyRouteSuggestion: {toRoute, reason}?  // Route suggestion CTA
showFlowNotAvailableModal: boolean             // Modal visibility
flowNotAvailableDetails: {...}?                // Modal content/data
pendingRouteBlock: boolean                     // Hard-block flag for Next button
noticeComplianceError: {...}?                  // Inline compliance error panel
```

#### handleSaveAnswer() (Lines 1320-1544):
- Calls `extractWizardUxIssues()` after saving
- Detects route-invalidating issues
- Sets `pendingRouteBlock = true` when issues found
- Triggers `showFlowNotAvailableModal`
- Returns early to block navigation

#### Next Button Logic (Lines 2468-2473):
```typescript
const disableNextButton =
  loading ||
  uploadingEvidence ||
  uploadRequiredMissing ||
  pendingRouteBlock ||  // <-- HARD BLOCK when route-invalidating issue exists
  (!isUploadQuestion && !isInfoQuestion && (currentAnswer === null))
```

### 2.2 Flow Not Available Modal (StructuredWizard.tsx Lines 3963-4049)

**Trigger:** `showFlowNotAvailableModal && flowNotAvailableDetails`

**Content:**
- Header: "[Route] Not Available"
- Why is this blocked? - Shows reason
- Legal basis (expandable)
- Available alternatives with switch buttons
- "Edit my answer" button

### 2.3 Inline Warnings Display (StructuredWizard.tsx Lines 3199-3280)

- Route suggestion CTA (Lines 3203-3227)
- Inline guidance with expandable legal basis (Lines 3230-3280)

### 2.4 Notice Compliance Error Panel (StructuredWizard.tsx Lines 3081-3158)

- Title: "Notice May Be Non-Compliant"
- Blocking Issues section (must fix)
- Warnings section (review carefully)

### 2.5 `src/components/ui/ValidationErrors.tsx` (260 lines)

**Component for displaying "Fix before generating notice" panel at preview stage.**

- Title: "Fix before generating notice"
- "Will block preview" section (blocking)
- "Warnings" section (non-blocking)
- Each issue shows: action message, legal reason (expandable "Why?"), "Go to: [Question Label]" button

---

## 3. Modal Triggering Logic

### 3.1 When Modal Shows (Flow Not Available):

1. User selects "section_21" route
2. User answers a question that explicitly disqualifies Section 21
3. Backend returns route-invalidating issue from decision engine/compliance evaluator
4. Frontend detects issue and sets `pendingRouteBlock = true`
5. Next button becomes disabled
6. Modal appears with reason and alternative routes

### 3.2 Route Invalidation Triggers:

The following explicitly disqualifying conditions trigger the modal:
- `deposit_protected = false` (when `deposit_taken = true`)
- `epc_provided = false`
- `gas_certificate_provided = false`
- `how_to_rent_provided = false`
- `prescribed_info_given = false`

---

## 4. API Endpoints

### 4.1 `/api/wizard/answer` (route.ts)

- Returns 422 `NOTICE_NONCOMPLIANT` during wizard (non-blocking)
- Frontend handles gracefully, shows inline panel

### 4.2 `/api/wizard/generate` (route.ts)

**THE ULTIMATE HARD STOP**
- Returns 403 `LegalComplianceError` - Cannot be bypassed
- All compliance requirements enforced here

---

## 5. What Needs to Change (Phase 2)

For `product === 'notice_only'`:

1. **Remove/Disable:**
   - `pendingRouteBlock` logic in handleSaveAnswer
   - `showFlowNotAvailableModal` triggering during wizard steps
   - Next button disabling based on compliance issues
   - Inline compliance panels during wizard

2. **Keep:**
   - MSQ validation (required/type/range)
   - Conditional question visibility (dependsOn, routes)
   - Server-side hard stop at generate endpoint

---

## 6. Files to Modify

| File | Changes |
|------|---------|
| `src/components/wizard/StructuredWizard.tsx` | Remove modal triggering, pendingRouteBlock for notice_only |
| `src/lib/validation/noticeOnlyWizardUxIssues.ts` | May need adjustment for end-validator context |
| `src/lib/validation/wizardIssueFilter.ts` | Ensure proper filtering for end-validator |

---

## 7. End Validator Requirements (Phase 3)

The end validator should:
1. Call existing preview validation pipeline
2. Show all issues in a summary UI
3. Provide "Fix this" buttons that jump to specific questions
4. Support route switching if alternatives exist
5. Apply to ALL notice_only routes:
   - England: section_21, section_8
   - Wales: wales_section_173, wales_fault_based
   - Scotland: notice_to_leave
