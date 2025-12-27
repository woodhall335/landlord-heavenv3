# Notice Flow Validation Audit Report

**Generated:** 2025-12-22
**Auditor:** Claude Code
**Scope:** England, Wales, Scotland notice-only flows

---

## Executive Summary

| Metric | Assessment |
|--------|------------|
| **Current wizard intelligence level** | SEMI-SMART |
| **Real-time route feedback** | PARTIAL |
| **Conditional question flow** | YES |
| **End validation with jump-to-fix** | PARTIAL |
| **Jurisdiction-specific logic** | YES |

### Key Findings

1. **The system HAS significant validation infrastructure** - Decision engine, compliance evaluator, inline validators, and issue filtering all exist
2. **Route availability IS tracked** - But feedback to users is indirect (guidance panels) rather than explicit route elimination banners
3. **Conditional questions ARE implemented** - `dependsOn` in MQS YAML works well for answer-based conditions
4. **Jump-to-question navigation EXISTS** - Implemented in `StructuredWizard.tsx` via `jumpToQuestion()` function
5. **BUT: Route-aware question filtering is NOT implemented** - Questions don't hide based on which routes are still available

---

## Vision vs Reality Gap Analysis

### Real-Time Route Elimination

| Feature | Vision | Current State | Gap |
|---------|--------|---------------|-----|
| Show when route eliminated | Immediate popup/banner | Inline guidance via `noticeOnlyGuidance` state | No explicit "Route X is now blocked" modal |
| Explain WHY eliminated | Legal citation + plain English | `legalBasis` field in guidance objects | Partially implemented - legal basis exists but not always shown prominently |
| Show remaining options | "Section 8 still available" | `routeSuggestion` object with `toRoute` field | Suggestion exists but not prominently displayed |
| Let user go back and change | Clear navigation | `jumpToQuestion()` function exists | Works but no automatic "Fix this" buttons on route elimination |

**Current Implementation:**
```typescript
// In StructuredWizard.tsx (lines 815-857)
const [noticeOnlyGuidance, setNoticeOnlyGuidance] = useState<InlineGuidance[]>([]);
const [noticeOnlyRouteSuggestion, setNoticeOnlyRouteSuggestion] = useState<{
  toRoute: string;
  reason: string;
} | null>(null);
const [flowNotAvailableDetails, setFlowNotAvailableDetails] = useState<{
  blockedRoute: string;
  reason: string;
  legalBasis?: string;
  alternativeRoutes: string[];
} | null>(null);
```

### Conditional Question Flow

| Feature | Vision | Current State | Gap |
|---------|--------|---------------|-----|
| Skip S21 questions if S21 eliminated | Auto-skip | NOT implemented | Questions show regardless of route availability |
| Skip arrears questions if no arrears | Auto-skip | YES via `dependsOn` in YAML | Working correctly |
| Route-aware question filtering | Built into MQS | NOT implemented | No `routes` filtering on question visibility |
| Answer-based filtering | dependsOn conditions | YES - working | Implemented and working |

**Example from England YAML (lines 289-295):**
```yaml
- id: deposit_protected_scheme
  dependsOn:
    questionId: deposit_taken
    value: true
```

### End Validation Summary

| Feature | Vision | Current State | Gap |
|---------|--------|---------------|-----|
| Show all blocking issues | Itemized list | YES - `blocking_issues` array | Available at preview stage |
| Legal basis for each block | Statute citation | YES - `legal_reason` field | Implemented in `ComplianceResult` |
| Jump to fix specific issue | Click → go to question | PARTIAL - `affected_question_id` exists | `jumpToQuestion()` exists but not wired to all issue displays |
| Show available alternatives | "Generate S8 instead" | PARTIAL - review page shows routes | Not prominently shown at issue level |

---

## Jurisdiction Deep Dives

### England

#### Current Question Flow Intelligence:

**Route selection (question `selected_notice_route`):**
- Appears early in flow (after landlord details)
- Options: `section_21` or `section_8`
- Subsequent questions use `dependsOn` to filter based on route

**Questions with `dependsOn` conditions:**
| Question ID | Depends On | Condition |
|-------------|------------|-----------|
| `fixed_term_end_date` | `is_fixed_term` | `value: true` |
| `deposit_amount` | `deposit_taken` | `value: true` |
| `deposit_reduced_to_legal_cap_confirmed` | `deposit_taken` AND `selected_notice_route` | `allOf` condition |
| `deposit_protected_scheme` | `deposit_taken` | `value: true` |
| `prescribed_info_given` | `deposit_taken` AND `deposit_protected_scheme` | `allOf` condition |
| `gas_safety_certificate` | `has_gas_appliances` | `value: true` |
| `section8_grounds_selection` | `selected_notice_route` | `value: section_8` |

#### Route Elimination Points:

| Answer | Eliminates | Currently Detected? | User Notified? |
|--------|------------|---------------------|----------------|
| `deposit_protected = false` | Section 21 | YES - in `evaluateNoticeCompliance()` | YES - inline guidance |
| `gas_safety_certificate = false` | Section 21 | YES - in `evaluateNoticeCompliance()` | YES - inline guidance |
| `epc_provided = false` | Section 21 | YES - in `evaluateNoticeCompliance()` | YES - inline guidance |
| `how_to_rent_provided = false` | Section 21 | YES - in `evaluateNoticeCompliance()` | YES - inline guidance |
| `property_licensing = unlicensed` | Section 21 | YES - in `evaluateNoticeCompliance()` | YES - inline guidance |
| tenancy < 4 months old | Section 21 | YES - 4-month bar calculation | YES - `S21-FOUR-MONTH-BAR` code |
| arrears < 2 months | Ground 8 | NO - not automatically checked | NO |

#### Compliance Codes (from `evaluate-notice-compliance.ts`):

- `S21-DEPOSIT-NONCOMPLIANT` - Deposit not protected
- `S21-PRESCRIBED-INFO-REQUIRED` - Prescribed info not confirmed
- `S21-GAS-CERT` - Gas safety certificate missing
- `S21-EPC` - EPC not provided
- `S21-H2R` - How to Rent not provided
- `S21-LICENSING` - Property unlicensed
- `S21-FOUR-MONTH-BAR` - Notice within 4 months
- `S21-RETALIATORY` - Retaliatory eviction risk
- `S21-DEPOSIT-CAP-EXCEEDED` - Deposit exceeds legal cap
- `S8-GROUNDS-REQUIRED` - No grounds selected
- `S8-NOTICE-PERIOD` - Invalid notice period

#### Questions That Should Be Conditional But Aren't:

| Question ID | Should Only Show For | Current State |
|-------------|---------------------|---------------|
| `gas_safety_certificate` | Section 21 (critical) | Shows for both routes |
| `epc_provided` | Section 21 (critical) | Shows for both routes |
| `how_to_rent_provided` | Section 21 (critical) | Shows for both routes |
| `property_licensing` | Section 21 | Shows for both routes |
| `prescribed_info_given` | Section 21 | Shows when deposit protected (not route-aware) |

### Wales

#### Current Question Flow Intelligence:

**Route selection (question `selected_notice_route`):**
- Options: `wales_section_173` or `wales_fault_based`
- Route guard implemented in `StructuredWizard.tsx` (lines 691-746)

**Contract Type Route Guard:**
```typescript
// Lines 706-727
if (contractCategory === 'supported_standard' || contractCategory === 'secure') {
  // Auto-switch to fault-based
  setCaseFacts((prev) => ({
    ...prev,
    selected_notice_route: 'wales_fault_based',
  }));
}
```

**Questions with `dependsOn` conditions:**
| Question ID | Depends On | Condition |
|-------------|------------|-----------|
| `wales_section173_blocked_info` | `selected_notice_route` AND `wales_contract_category` | `allOf` with `valueContains` |
| `rent_smart_wales_registered` | `selected_notice_route` | `value: wales_section_173` |
| `deposit_taken_wales` | `selected_notice_route` | `value: wales_section_173` |
| `deposit_protected_wales` | `selected_notice_route` AND `deposit_taken_wales` | `allOf` |
| `wales_fault_based_section` | `selected_notice_route` | `value: wales_fault_based` |
| `deposit_taken_fault` | `selected_notice_route` | `value: wales_fault_based` |

#### Route Elimination Points:

| Answer | Eliminates | Currently Detected? | User Notified? |
|--------|------------|---------------------|----------------|
| occupation < 6 months | Section 173 | YES - `S173-PERIOD-BAR` | YES - blocking issue |
| `rsw_registered = false` | Section 173 | YES - `S173-LICENSING` | YES - blocking issue |
| `wales_contract_category = supported_standard/secure` | Section 173 | YES - route guard | YES - auto-switch to fault-based |

#### Compliance Codes (from `evaluate-notice-compliance.ts`):

- `S173-LICENSING` - Not registered with Rent Smart Wales
- `S173-PERIOD-BAR` - Notice within 6-month prohibited period
- `S173-NOTICE-PERIOD-UNDETERMINED` - Missing dates for calculation

### Scotland

#### Current Question Flow Intelligence:

**No explicit route selection** - Scotland only has one notice type (Notice to Leave)

**Ground selection influences notice period:**
- Grounds 1-8: 28-day notice period
- Grounds 9-18: 84-day notice period

**Questions with `dependsOn` conditions:**
| Question ID | Depends On | Condition |
|-------------|------------|-----------|
| `arrears_amount` | `rent_arrears` | `value: "Yes"` |
| `pre_action_contact` | `rent_arrears` | `value: "Yes"` |
| `asb_description` | `asb_details` | `value: "Yes"` |

#### Ground-Specific Logic:

| Ground | Notice Period | Specific Validation | Currently Enforced? |
|--------|--------------|---------------------|---------------------|
| Ground 1 (rent arrears) | 28 days | 3+ months arrears + pre-action | YES |
| Ground 2 (breach) | 28 days | Breach description required | PARTIAL |
| Ground 3 (ASB) | 28 days | ASB description required | YES - via dependsOn |
| Ground 4-6 (landlord needs) | 84 days | Various requirements | NO |
| Ground 11-13 | Various | Specific conditions | NO |

#### Compliance Codes:

- `NTL-GROUND-REQUIRED` - No grounds selected
- `NTL-PRE-ACTION` - Pre-action requirements not met (Ground 1)
- `NTL-NOTICE-PERIOD` - Notice period too short
- `NTL-MIXED-GROUNDS` - Mixed grounds warning

---

## Technical Implementation Audit

### Where Route Tracking Lives

**Current Architecture:**

```
1. Decision Engine (src/lib/decision-engine/index.ts)
   └── Returns: recommended_routes, allowed_routes, blocked_routes, blocking_issues

2. Notice Compliance Evaluator (src/lib/notices/evaluate-notice-compliance.ts)
   └── Returns: hardFailures[], warnings[], computed dates

3. Notice-Only Inline Validator (src/lib/validation/noticeOnlyInlineValidator.ts)
   └── Returns: fieldErrors, guidance[], routeSuggestion

4. Wizard Issue Filter (src/lib/validation/wizardIssueFilter.ts)
   └── Returns: FilteredValidationIssue[] with friendlyAction, friendlyQuestionLabel

5. StructuredWizard.tsx State
   └── noticeOnlyGuidance, noticeOnlyRouteSuggestion, flowNotAvailableDetails
```

**Route Availability State in StructuredWizard.tsx:**
```typescript
// Lines 193-206 - Route recommendation state
const [routeRecommendation, setRouteRecommendation] = useState<{
  recommended_route: string;
  reasoning: string;
  blocked_routes: string[];
  blocking_issues: Array<{
    route: string;
    issue: string;
    description: string;
    action_required: string;
    legal_basis: string;
  }>;
  warnings: string[];
  allowed_routes: string[];
} | null>(null);
```

### Where Validation Rules Are Defined

| Rule Type | Location | Status |
|-----------|----------|--------|
| Hard bars | `src/lib/notices/notice-compliance-spec.ts` | Exists but arrays empty (causing test failures) |
| Inline validation | `src/lib/notices/evaluate-notice-compliance.ts` | Fully implemented |
| Route conditions | MQS YAML `dependsOn` | Answer-based only, not route-aware |
| Decision engine rules | `src/lib/decision-engine/index.ts` | Comprehensive |

### Notice Compliance Spec Structure (from `notice-compliance-spec.ts`):

```typescript
export interface NoticeComplianceSpec {
  route_id: string;
  jurisdiction: string;
  notice_type: string;
  hard_bars: HardBar[];  // Currently empty arrays
  inline_validation_rules: InlineValidationRule[];  // Currently empty arrays
  computed_fields: ComputedFieldSpec[];
  allow_mixed_grounds?: boolean;
}
```

**Issue:** Test failures occur because `hard_bars` and `inline_validation_rules` are empty. The actual validation logic is in `evaluate-notice-compliance.ts` instead.

### Jump-to-Question Implementation

**Located in StructuredWizard.tsx (lines 541-586):**

```typescript
const jumpToQuestion = useCallback(async (questionId: string) => {
  if (!caseId || !questionId) return;

  setLoading(true);
  setError(null);

  try {
    const response = await fetch(apiUrl('/api/wizard/next-question'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        case_id: caseId,
        mode: 'edit',
        include_answered: true,
        review_mode: true,
        target_question_id: questionId,
      }),
    });
    // ... handles response and initializes question
  }
}, [caseId, initializeQuestion]);
```

---

## MQS YAML Structure Analysis

### england.yaml Analysis

- **Total questions:** ~30
- **Questions with dependsOn:** 10
- **Questions with route filtering:** 0 (none use `routes` field)
- **Questions with legal validation:** Via inline validator

**Route-specific questions:**
| Question ID | Intended Route | Current `dependsOn` | Smart Filtering? |
|-------------|----------------|---------------------|------------------|
| `how_to_rent_provided` | Section 21 only | None | NO |
| `gas_safety_certificate` | Both (required S21) | `has_gas_appliances: true` | PARTIAL |
| `epc_provided` | Section 21 only | None | NO |
| `section8_grounds_selection` | Section 8 only | `selected_notice_route: section_8` | YES |
| `deposit_reduced_to_legal_cap_confirmed` | Section 21 only | `allOf` with route check | YES |

### wales.yaml Analysis

- **Total questions:** ~25
- **Questions with dependsOn:** 12
- **Questions with route filtering:** 8 (via `selected_notice_route`)
- **Has route guard:** YES (StructuredWizard.tsx)

**Route-specific questions:**
| Question ID | Intended Route | Current `dependsOn` | Smart Filtering? |
|-------------|----------------|---------------------|------------------|
| `rent_smart_wales_registered` | Section 173 only | `selected_notice_route: wales_section_173` | YES |
| `deposit_taken_wales` | Section 173 only | `selected_notice_route: wales_section_173` | YES |
| `wales_fault_based_section` | Fault-based only | `selected_notice_route: wales_fault_based` | YES |
| `deposit_taken_fault` | Fault-based only | `selected_notice_route: wales_fault_based` | YES |

### scotland.yaml Analysis

- **Total questions:** ~20
- **Questions with dependsOn:** 4
- **Questions with route filtering:** N/A (single route)
- **Has ground-based filtering:** PARTIAL

**Ground-specific questions:**
| Question ID | Applies When | Current `dependsOn` | Smart Filtering? |
|-------------|--------------|---------------------|------------------|
| `arrears_amount` | Rent arrears exist | `rent_arrears: "Yes"` | YES |
| `pre_action_contact` | Rent arrears exist | `rent_arrears: "Yes"` | YES |
| `asb_description` | ASB exists | `asb_details: "Yes"` | YES |

---

## API Response Structure Audit

### /api/wizard/answer Response

```json
{
  "ok": true,
  "answer_saved": true,
  "next_question": { /* ExtendedWizardQuestion */ },
  "progress": 45,
  "is_complete": false,

  // Validation fields (notice-only only):
  "wizard_warnings": [
    {
      "code": "S21-DEPOSIT-CAP-EXCEEDED",
      "severity": "blocking",
      "fields": ["deposit_amount"],
      "affected_question_id": "deposit_reduced_to_legal_cap_confirmed",
      "user_fix_hint": "Confirm deposit reduced to legal cap",
      "legal_reason": "Tenant Fees Act 2019 s3"
    }
  ],
  "preview_blocking_issues": [ /* same structure */ ],
  "preview_warnings": [ /* same structure */ ],
  "has_blocking_issues": true,
  "issue_counts": { "blocking": 1, "warnings": 0 }
}
```

### /api/wizard/checkpoint Response

```json
{
  "ok": true,
  "case_id": "...",
  "recommended_route": "section_8",
  "recommended_route_label": "Section 8",
  "blocking_issues": [
    {
      "route": "section_21",
      "issue": "deposit_not_protected",
      "description": "Deposit is not protected in an approved scheme",
      "action_required": "Protect the deposit before serving Section 21",
      "legal_basis": "Housing Act 2004 s.213-215",
      "severity": "blocking"
    }
  ],
  "warnings": ["..."],
  "allowed_routes": ["section_8"],
  "blocked_routes": ["section_21"]
}
```

### /api/wizard/analyze Response

```json
{
  "case_id": "...",
  "jurisdiction": "england",
  "case_type": "eviction",
  "product": "notice_only",
  "recommended_route": "section_8",
  "recommended_route_label": "Section 8 (Grounds-Based)",
  "case_strength_band": "moderate",
  "is_court_ready": false,
  "readiness_summary": "Your case has some issues that should be addressed...",
  "decision_engine": {
    "recommended_routes": ["section_8"],
    "allowed_routes": ["section_8"],
    "blocked_routes": ["section_21"],
    "blocking_issues": [ /* full blocking issue objects */ ],
    "warnings": ["..."],
    "recommended_grounds": [
      {
        "code": 8,
        "title": "Rent Arrears",
        "type": "mandatory",
        "description": "..."
      }
    ]
  },
  "red_flags": ["Deposit not protected"],
  "compliance_issues": ["Section 21 blocked due to deposit non-compliance"],
  "preview_documents": [ /* document list */ ]
}
```

---

## Current User Journeys (Actual Behavior)

### Journey 1: Landlord with Unprotected Deposit

**Step-by-step what ACTUALLY happens today:**

1. User reaches `deposit_protected_scheme` question
2. User selects "No"
3. **What happens:**
   - Answer is saved via `/api/wizard/answer`
   - Backend runs `runNoticeOnlyValidation()` which calls `validateStepInline()`
   - `evaluateNoticeCompliance()` generates `S21-DEPOSIT-NONCOMPLIANT` issue
   - Issue is returned in `wizard_warnings` array
4. **What user sees:**
   - Guidance panel shows warning about deposit protection
   - User can continue navigating (not blocked during wizard)
5. **At preview:**
   - `/api/notice-only/preview/{caseId}` runs full validation
   - Returns 422 with `blocking_issues` if Section 21 route selected
   - ValidationErrors component displays issues with links
6. **Can they generate a notice?**
   - Section 21: NO - blocked
   - Section 8: YES - deposit doesn't affect S8

### Journey 2: Landlord with 1 Month Arrears Wanting Ground 8

**Step-by-step what ACTUALLY happens today:**

1. User enters arrears amount (less than 2x rent)
2. User reaches `section8_grounds_selection` question
3. **Can they select Ground 8?** YES - no validation prevents selection
4. **What feedback do they get?**
   - Currently NONE inline
   - Ground 8 requires 2 months arrears but this isn't auto-validated
5. **What happens at generation?**
   - Ground 8 threshold check is NOT currently implemented
   - Notice may be generated with invalid ground

**Gap Identified:** Ground 8 threshold validation (2 months arrears) is not enforced.

### Journey 3: Wales Landlord Not RSW Registered

**Step-by-step what ACTUALLY happens today:**

1. User selects Wales jurisdiction (at wizard start)
2. User selects `wales_section_173` route
3. User reaches `rent_smart_wales_registered` question
4. User selects "No"
5. **What happens:**
   - Answer saved
   - `evaluateNoticeCompliance()` generates `S173-LICENSING` issue
   - Returned as blocking issue
6. **Are they blocked?**
   - Blocked at preview for Section 173
   - Can switch to fault-based route
7. **What do they see?**
   - Inline guidance warning
   - At preview: validation error with jump-to-fix link

---

## Recommendations

### To Achieve "Ultra-Smart Conditional Wizard":

#### Phase 1: Real-Time Route Tracking

1. **Add explicit route availability state**
   ```typescript
   const [availableRoutes, setAvailableRoutes] = useState<{
     section_21: { available: boolean; blockedBy: string[] };
     section_8: { available: boolean; blockedBy: string[] };
   }>({...});
   ```

2. **Show route elimination banners**
   - When user answers a disqualifying question, immediately show:
   ```
   ⚠️ Section 21 is no longer available
   Because: Deposit not protected (Housing Act 2004)
   ✅ Section 8 remains available
   [Continue with Section 8] [Go back and change]
   ```

3. **Wire blocking issues to route tracking**
   - After each answer save, update `availableRoutes` based on `blocking_issues`

#### Phase 2: Conditional Question Flow

1. **Add `routes` field to MQS YAML schema**
   ```yaml
   - id: gas_safety_certificate
     routes: ["section_21"]  # Only show for Section 21
   ```

2. **Update `questionIsApplicable()` in mqs-loader.ts**
   ```typescript
   if (question.routes && !question.routes.includes(currentRoute)) {
     return false;
   }
   ```

3. **Add route-aware question skipping**
   - If Section 21 is eliminated, auto-skip S21-only questions

#### Phase 3: End Validation with Jump-to-Fix

1. **Wire `jumpToQuestion()` to all blocking issue displays**
   - Preview page shows issues but doesn't link to `jumpToQuestion()`
   - Add "Fix this" buttons that call `jumpToQuestion(affected_question_id)`

2. **Add legal citations prominently**
   - Show `legal_reason` for each blocking issue
   - Format as: "Section 213-215, Housing Act 2004"

3. **Add "Generate alternative" buttons**
   - If S21 blocked but S8 available, show "Generate Section 8 instead"

#### Phase 4: Jurisdiction-Specific Intelligence

1. **Add Ground 8 threshold validation**
   - Check if arrears >= 2x monthly rent
   - If not, block Ground 8 selection or show warning

2. **Add Scotland ground-specific notice period calculation**
   - Auto-calculate 28 vs 84 day period based on ground selection
   - Show this prominently in UI

3. **Populate `notice-compliance-spec.ts` arrays**
   - Move validation rules from `evaluate-notice-compliance.ts` to spec arrays
   - Fixes test failures

---

## Priority Order

### CRITICAL (Blocking User Experience)

1. **Populate `notice-compliance-spec.ts` hard_bars and inline_validation_rules**
   - Currently empty, causing test failures
   - File: `src/lib/notices/notice-compliance-spec.ts`
   - Complexity: MEDIUM

2. **Add route elimination banners**
   - Show clear feedback when a route becomes unavailable
   - File: `src/components/wizard/StructuredWizard.tsx`
   - Complexity: MEDIUM

### HIGH (Major UX Improvement)

3. **Wire jump-to-question to preview validation errors**
   - Add "Fix this" buttons to ValidationErrors component
   - File: `src/app/wizard/preview/[caseId]/page.tsx`
   - Complexity: LOW

4. **Add Ground 8 threshold validation**
   - Check 2-month arrears requirement
   - File: `src/lib/notices/evaluate-notice-compliance.ts`
   - Complexity: LOW

### MEDIUM (Enhancement)

5. **Add `routes` field to MQS YAML**
   - Enable route-aware question filtering
   - Files: All YAML files in `config/mqs/notice_only/`
   - Complexity: HIGH (requires loader changes + YAML updates)

6. **Add route availability panel**
   - Persistent sidebar showing which routes are available/blocked
   - File: `src/components/wizard/StructuredWizard.tsx`
   - Complexity: MEDIUM

### LOW (Nice to Have)

7. **Add legal citation tooltips**
   - Hoverable citations for each compliance requirement
   - Complexity: LOW

8. **Add ground-specific notice period auto-calculation display**
   - Show calculated date inline
   - Complexity: MEDIUM

---

## Files That Need Changes

| File | Change Needed | Complexity |
|------|--------------|------------|
| `src/lib/notices/notice-compliance-spec.ts` | Populate hard_bars and inline_validation_rules arrays | MEDIUM |
| `src/components/wizard/StructuredWizard.tsx` | Add route elimination banners, wire jumpToQuestion | MEDIUM |
| `src/app/wizard/preview/[caseId]/page.tsx` | Add "Fix this" buttons to validation errors | LOW |
| `src/lib/notices/evaluate-notice-compliance.ts` | Add Ground 8 threshold validation | LOW |
| `config/mqs/notice_only/england.yaml` | Add `routes` field to compliance questions | HIGH |
| `config/mqs/notice_only/wales.yaml` | Already good - route-aware via dependsOn | LOW |
| `config/mqs/notice_only/scotland.yaml` | Add ground-specific conditional questions | MEDIUM |
| `src/lib/wizard/mqs-loader.ts` | Add route-aware filtering to `questionIsApplicable()` | MEDIUM |
| `src/components/ui/ValidationErrors.tsx` | Add jump-to-question links | LOW |

---

## Appendix: Code References

### Key Functions

- Route recommendation: `runDecisionEngine()` in `src/lib/decision-engine/index.ts`
- Compliance evaluation: `evaluateNoticeCompliance()` in `src/lib/notices/evaluate-notice-compliance.ts`
- Inline validation: `validateStepInline()` in `src/lib/validation/noticeOnlyInlineValidator.ts`
- Issue filtering: `filterWizardIssues()` in `src/lib/validation/wizardIssueFilter.ts`
- Question applicability: `questionIsApplicable()` in `src/lib/wizard/mqs-loader.ts`
- Jump to question: `jumpToQuestion()` in `src/components/wizard/StructuredWizard.tsx:541`

### Key State Variables in StructuredWizard.tsx

- `noticeOnlyGuidance` (line 247) - Inline guidance messages
- `noticeOnlyRouteSuggestion` (line 248) - Route switch suggestions
- `flowNotAvailableDetails` (line 254) - Blocked route details
- `routeRecommendation` (line 193) - Full recommendation object
- `previewBlockingIssues` (line 232) - Blocking issues for preview
- `previewWarnings` (line 233) - Warning issues for preview

### MQS YAML Schema

```yaml
questions:
  - id: question_id
    section: Section Name
    question: "Question text"
    inputType: text|yes_no|select|date|group|radio|multiselect|info|upload
    dependsOn:
      questionId: other_question_id
      value: expected_value
    # OR for complex conditions:
    dependsOn:
      allOf:
        - questionId: q1
          value: v1
        - questionId: q2
          value: v2
    validation:
      required: true|false
      min: number
      max: number
    routes: ["section_21", "section_8"]  # NOT CURRENTLY IMPLEMENTED
    maps_to:
      - fact_key
```
