# Notice-Only Validation Rules Audit

**Audit Date**: 2025-12-21
**Purpose**: Definitive, jurisdiction-accurate rules map for ALL notice-only flows

---

## Executive Summary

This audit documents all notice-only validation flows, their rule sources, and identifies systemic problems to be addressed in the rebuild. The goal is to guarantee that notice-only outputs are legally correct per jurisdiction and per route.

---

## 1. Notice-Only Flows and Routes

### Jurisdiction: England

| Route Key | Product | MSQ File | Decision Engine | Templates |
|-----------|---------|----------|-----------------|-----------|
| `section_21` | notice_only | `config/mqs/notice_only/england.yaml` | `analyzeEnglandWales()` in `src/lib/decision-engine/index.ts` | `form_6a_section21/notice.hbs` |
| `section_8` | notice_only | `config/mqs/notice_only/england.yaml` | `analyzeEnglandWales()` in `src/lib/decision-engine/index.ts` | `form_3_section8/notice.hbs` |

### Jurisdiction: Wales

| Route Key | Product | MSQ File | Decision Engine | Templates |
|-----------|---------|----------|-----------------|-----------|
| `wales_section_173` | notice_only | `config/mqs/notice_only/wales.yaml` | `analyzeWales()` in `src/lib/decision-engine/index.ts` | `rhw16_notice_termination_6_months/notice.hbs`, `rhw17_notice_termination_2_months/notice.hbs` |
| `wales_fault_based` | notice_only | `config/mqs/notice_only/wales.yaml` | `analyzeWales()` in `src/lib/decision-engine/index.ts` | `rhw23_notice_before_possession_claim/notice.hbs` |

### Jurisdiction: Scotland

| Route Key | Product | MSQ File | Decision Engine | Templates |
|-----------|---------|----------|-----------------|-----------|
| `notice_to_leave` | notice_only | `config/mqs/notice_only/scotland.yaml` | `analyzeScotland()` in `src/lib/decision-engine/index.ts` | `notice_to_leave_prt_2017/notice.hbs` |

### Jurisdiction: Northern Ireland

| Route Key | Product | Status |
|-----------|---------|--------|
| N/A | notice_only | **UNSUPPORTED** - Only tenancy agreements supported |

---

## 2. Jurisdiction-Scoped Decision Engines

### Location
**Primary**: `src/lib/decision-engine/index.ts`

### Architecture
```
runDecisionEngine(input: DecisionInput)
    ├── jurisdiction === 'england' → analyzeEnglandWales()
    ├── jurisdiction === 'wales' → analyzeWales()
    ├── jurisdiction === 'scotland' → analyzeScotland()
    └── jurisdiction === 'northern-ireland' → UNSUPPORTED
```

### Key Interface
```typescript
interface DecisionInput {
  jurisdiction: 'england' | 'wales' | 'scotland' | 'northern-ireland';
  product: 'notice_only' | 'complete_pack' | 'money_claim';
  case_type: 'eviction';
  facts: DeepPartial<CaseFacts>;
  stage?: 'wizard' | 'checkpoint' | 'preview' | 'generate';
}

interface DecisionOutput {
  recommended_routes: string[];
  allowed_routes: string[];
  blocked_routes: string[];
  recommended_grounds: GroundRecommendation[];
  blocking_issues: BlockingIssue[];
  warnings: string[];
  route_explanations: Record<string, string>;
}
```

---

## 3. Authoritative Conditional Rules Map

### ENGLAND — Section 21

| Rule ID | Triggering Question(s) | Condition | Source of Truth | Current Enforcement |
|---------|------------------------|-----------|-----------------|---------------------|
| `S21-DEPOSIT-NONCOMPLIANT` | `deposit_taken`, `deposit_protected` | `deposit_taken=true AND deposit_protected=false` | Decision Engine | ✅ Correct |
| `S21-PRESCRIBED-INFO-REQUIRED` | `deposit_taken`, `prescribed_info_given` | `deposit_taken=true AND deposit_protected=true AND prescribed_info_given=false` | Decision Engine + Compliance Evaluator | ✅ Correct |
| `S21-DEPOSIT-CAP` | `deposit_amount`, `rent_amount`, `rent_frequency` | `deposit_amount > (5 or 6 weeks' rent based on annual rent > £50k)` | Decision Engine | ⚠️ Warning only (not blocking) |
| `S21-GAS-CERT` | `has_gas_appliances`, `gas_certificate_provided` | `has_gas_appliances=true AND gas_certificate_provided=false` | Decision Engine + Compliance Evaluator | ✅ Correct |
| `S21-EPC` | `epc_provided` | `epc_provided=false` | Decision Engine + Compliance Evaluator | ✅ Correct |
| `S21-H2R` | `how_to_rent_provided` | `how_to_rent_provided=false` | Compliance Evaluator | ✅ Correct |
| `S21-LICENSING` | `property_licensing_status` | `property_licensing_status='unlicensed'` | Decision Engine + Compliance Evaluator | ✅ Correct |
| `S21-FOUR-MONTH-BAR` | `tenancy_start_date`, `notice_service_date` | `notice_service_date < tenancy_start_date + 4 months` | Compliance Evaluator | ✅ Correct |
| `S21-RETALIATORY` | `recent_repair_complaints` | `recent_repair_complaints=true` | Compliance Evaluator | ⚠️ Warning only |
| `S21-DATE-TOO-SOON` | `notice_expiry_date` | `notice_expiry_date < computed_minimum` | Compliance Evaluator | ✅ Correct |

**Conditional Logic (MUST behave correctly)**:
- `deposit_taken=false` → NO deposit protection rules apply
- `has_gas_appliances=false` → NO gas safety rules apply
- `deposit_amount <= cap` → NO cap warning

### ENGLAND — Section 8

| Rule ID | Triggering Question(s) | Condition | Source of Truth | Current Enforcement |
|---------|------------------------|-----------|-----------------|---------------------|
| `S8-GROUNDS-REQUIRED` | `section8_grounds` | `section8_grounds.length === 0` | Compliance Evaluator | ✅ Correct |
| `S8-GROUND8-THRESHOLD` | `arrears_total`, `rent_amount`, `rent_frequency` | Ground 8 selected AND `arrears < 2 months' rent` | Gating Module | ✅ Correct |
| `S8-NOTICE-PERIOD` | `notice_expiry_date`, `section8_grounds` | `notice_expiry_date < min_period_for_grounds` | Compliance Evaluator | ✅ Correct |
| `GROUND_PARTICULARS_INCOMPLETE` | `ground_particulars` | Missing particulars for selected grounds | Gating Module | ✅ Correct |

**Important Notes**:
- Deposit protection does NOT block Section 8
- Ask Heaven enhancement for grounds particulars MUST be preserved

### WALES — Section 173

| Rule ID | Triggering Question(s) | Condition | Source of Truth | Current Enforcement |
|---------|------------------------|-----------|-----------------|---------------------|
| `S173-LICENSING` | `rent_smart_wales_registered` | `rent_smart_wales_registered !== true` | Decision Engine + Compliance Evaluator | ✅ Correct |
| `S173-PERIOD-BAR` | `contract_start_date`, `notice_service_date` | `notice_service_date < contract_start_date + 6 months` | Compliance Evaluator | ✅ Correct |
| `S173-CONTRACT-TYPE` | `wales_contract_category` | `wales_contract_category !== 'standard'` | Decision Engine | ✅ Correct |
| `S173-DEPOSIT` | `deposit_taken`, `deposit_protected` | `deposit_taken=true AND deposit_protected=false` | Decision Engine | ✅ Correct |
| `S173-NOTICE-PERIOD-UNDETERMINED` | Various | Missing required dates | Compliance Evaluator | ✅ Correct |

**Conditional Logic**:
- `wales_contract_category='supported_standard'` or `'secure'` → Section 173 NOT available, must use fault-based

### WALES — Fault-Based (Sections 157, 159, 161, 162)

| Rule ID | Triggering Question(s) | Condition | Source of Truth | Current Enforcement |
|---------|------------------------|-----------|-----------------|---------------------|
| `RHW23-GROUND-REQUIRED` | `wales_fault_based_section` | No section selected | Compliance Spec | ⚠️ May be missing |
| Ground-specific rules | Varies by section | See Wales MQS | Compliance Spec | ⚠️ Needs verification |

### SCOTLAND — Notice to Leave

| Rule ID | Triggering Question(s) | Condition | Source of Truth | Current Enforcement |
|---------|------------------------|-----------|-----------------|---------------------|
| `NTL-GROUND-REQUIRED` | `scotland_ground_codes` | `scotland_ground_codes.length === 0` | Compliance Evaluator | ✅ Correct |
| `NTL-PRE-ACTION` | `pre_action_contact`, `eviction_grounds` | Ground 1 selected AND `pre_action_confirmed !== true` | Decision Engine + Compliance Evaluator | ✅ Correct |
| `NTL-NOTICE-PERIOD` | `notice_expiry`, grounds | `notice_expiry < 28/84 days` based on ground | Compliance Evaluator | ✅ Correct |
| `NTL-MIXED-GROUNDS` | `eviction_grounds` | Multiple grounds selected, config disallows | Compliance Evaluator | ⚠️ May block unexpectedly |

**Conditional Logic**:
- Ground 1 (rent arrears) → Pre-action requirements MANDATORY
- Ground 3 (ASB) → 28 day period, no pre-action required
- Other grounds → Various periods, no pre-action required

---

## 4. Rule Sources (Layered Validation)

### Layer 1: MSQ (Multi-Step Questionnaire)
**Location**: `config/mqs/notice_only/{jurisdiction}.yaml`

**Responsibilities**:
- Field-level required validation
- Input format validation (dates, currency, etc.)
- Conditional question display (`dependsOn`)
- Maps to canonical fact keys

### Layer 2: Decision Engine
**Location**: `src/lib/decision-engine/index.ts`

**Responsibilities**:
- Route recommendations
- Route blocking (e.g., S21 blocked when deposit not protected)
- Ground recommendations
- Jurisdiction-specific compliance checks
- Stage-aware validation (wizard=warn, preview/generate=block)

### Layer 3: Compliance Evaluator
**Location**: `src/lib/notices/evaluate-notice-compliance.ts`

**Responsibilities**:
- Route-specific hard failures and warnings
- Date calculations (notice periods, expiry dates)
- Stage-aware enforcement
- Backward compatibility for legacy field names

### Layer 4: Wizard Gating
**Location**: `src/lib/wizard/gating.ts`

**Responsibilities**:
- Real-time UI blocking/warnings
- Ground 8 threshold validation
- Deposit consistency checks
- Particulars completeness

### Layer 5: Wizard Issue Filter (TO BE DEPRECATED)
**Location**: `src/lib/validation/wizardIssueFilter.ts`

**Current Issues**:
- Filters issues based on "touched" facts
- Complex logic that can hide relevant issues
- Should be replaced by new inline validation

### Layer 6: Preview Validation
**Location**: `src/lib/validation/previewValidation.ts`

**Responsibilities**:
- Unified validation before PDF generation
- Calls validateFlow which orchestrates all layers
- Hard stop for blocking issues

---

## 5. Systemic Problems Identified

### Problem 1: Multiple Enforcement Points
**Description**: Same rules enforced in multiple places with inconsistent behavior
- Decision Engine checks deposit protection
- Compliance Evaluator also checks deposit protection
- Gating module also checks deposit protection
- Leads to duplicate messages and potential inconsistencies

### Problem 2: Right-Side Panel Shows Future-Step Issues
**Description**: The compliance summary panel (`issueCounts`) shows issues for questions not yet answered
- `wizardIssueFilter` attempts to filter these but logic is complex
- UX confusion when user sees issues they can't yet fix

### Problem 3: Conditional Rules Not Consistently Applied
**Description**: Some conditional rules fire incorrectly
- Example: Gas safety warning shown when `has_gas_appliances=false` (not answered yet)
- Should only show when `has_gas_appliances=true AND gas_certificate_provided=false`

### Problem 4: Stage-Awareness Inconsistency
**Description**: Some validators are stage-aware, others are not
- Decision Engine uses `stage` parameter
- Compliance Evaluator uses `stage` parameter
- Gating module always returns same severity
- Legacy validators don't use stage

### Problem 5: Exception-Based Flow Control
**Description**: `assertNoticeOnlyValid()` throws exceptions
- Makes error handling unpredictable
- Preview API catches and handles, but pattern is fragile
- Should return structured validation results

### Problem 6: Cross-Jurisdiction Rule Leakage Risk
**Description**: Some validators check facts without verifying jurisdiction
- Example: How to Rent is England-only but not explicitly gated
- Wales uses different compliance requirements

---

## 6. Legacy Validators to Remove

### Files to Deprecate for Notice-Only:
1. `src/lib/validation/wizardIssueFilter.ts` - Replace with new inline validator
2. `src/lib/documents/noticeOnly.ts` - `validateNoticeOnlyBeforeRender()` - Wrapper around gating
3. Right-side panel in `StructuredWizard.tsx` (lines ~3031-3141)

### Files to Keep (Shared):
1. `src/lib/decision-engine/index.ts` - Core decision logic (used by all products)
2. `src/lib/notices/evaluate-notice-compliance.ts` - Core compliance evaluation
3. `src/lib/validation/validateFlow.ts` - Unified validation orchestrator
4. `src/lib/validation/previewValidation.ts` - Preview validation wrapper

---

## 7. New Architecture (Phase 2)

### New Module: `src/lib/validation/noticeOnlyInlineValidator.ts`

```typescript
interface InlineValidationResult {
  fieldErrors: {
    [factKey: string]: { message: string }
  };  // blocks Next

  guidance: Array<{
    message: string;
    severity: 'info' | 'warn';
  }>;  // non-blocking

  routeSuggestion?: {
    toRoute: string;
    reason: string;
  };
}

function validateStepInline(params: {
  jurisdiction: 'england' | 'wales' | 'scotland';
  route: string;
  msq: MQSQuestion;
  stepId: string;
  answers: Record<string, any>;
  derivedFacts: Record<string, any>;
  decisionResults: DecisionOutput;
}): InlineValidationResult;
```

### Key Principles:
1. Decision rules MUST be invoked, not re-implemented
2. Inline validation only (no right panel)
3. Preview is the ONLY hard stop
4. Return structured results (no exceptions)
5. Conditional rules respect question dependencies

---

## 8. Acceptance Criteria for Rebuild

For any `(jurisdiction, route)` combination, we can definitively answer:
1. ✅ Which answers invalidate this notice?
2. ✅ Why (which rule)?
3. ✅ Which decision engine function enforces it?
4. ✅ At what stage does it block (wizard/preview/generate)?
5. ✅ What conditional dependencies exist?

---

## Appendix A: Decision Engine Rule Summary by Jurisdiction

### England (`analyzeEnglandWales`)
- S21 blockers: deposit, prescribed info, gas, EPC, H2R, licensing
- S21 warnings: deposit cap, retaliatory
- S8 always available (needs grounds)
- Ground analysis for arrears, ASB, breach

### Wales (`analyzeWales`)
- S173 blockers: contract type, RSW registration, deposit
- S173 only for standard occupation contracts
- Fault-based always available (all contract types)
- Ground analysis for arrears (s157/159), ASB (s161), breach (s162)

### Scotland (`analyzeScotland`)
- Only route: Notice to Leave
- Pre-action required for rent arrears (Ground 1)
- All grounds discretionary
- 28/84 day notice periods

---

## Appendix B: File References

| File | Purpose |
|------|---------|
| `src/lib/decision-engine/index.ts` | Main decision engine |
| `src/lib/notices/evaluate-notice-compliance.ts` | Compliance evaluation |
| `src/lib/notices/notice-compliance-spec.ts` | Compliance specifications by route |
| `src/lib/wizard/gating.ts` | Wizard gating rules |
| `src/lib/validation/wizardIssueFilter.ts` | Issue filtering (TO BE DEPRECATED) |
| `src/lib/validation/validateFlow.ts` | Unified validation orchestrator |
| `src/lib/validation/previewValidation.ts` | Preview validation |
| `config/mqs/notice_only/*.yaml` | MSQ definitions |
| `src/components/wizard/StructuredWizard.tsx` | Wizard UI |
