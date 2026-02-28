# Smart Validation Upgrade Audit Report
## Notice Only + Complete Pack (Eviction) Products

**Report Date:** 2026-01-25
**Auditor:** Claude (Automated)
**Benchmark:** Money Claim Intelligence Layer
**Status:** Audit Complete - Ready for Implementation Planning

---

## EXECUTIVE SUMMARY

### Readiness Assessment: **PARTIALLY READY** ⚠️

| Product | Jurisdiction | Current State | Upgrade Effort |
|---------|-------------|---------------|----------------|
| Notice Only | England | Production-ready, validation exists | Medium |
| Notice Only | Wales | Production-ready, Section 173 + fault-based | Medium |
| Notice Only | Scotland | Production-ready, Notice to Leave | Medium |
| Complete Pack | England | Production-ready, S8/S21 complete | Medium-High |
| Complete Pack | Wales | MQS disabled, templates exist | High |
| Complete Pack | Scotland | MQS disabled, templates exist | High |

### Key Findings

**Strengths:**
- Comprehensive TypeScript validation logic already exists (`pre-generation-check.ts`, `noticeOnlyInlineValidator.ts`)
- Templates exist for all jurisdictions and routes
- Evidence upload infrastructure exists for Complete Pack
- SmartReviewPanel component already built
- Decision engine integration present

**Critical Gaps (vs Money Claim benchmark):**
1. **No YAML-driven validation rules** - Rules hardcoded in TypeScript vs YAML
2. **No evidence classifier** for eviction/notice products
3. **No "Fix now" navigation** mapping rules to wizard sections
4. **No evidence strength indicators**
5. **No tenant defence warnings** (preemptive legal guidance)
6. **Legal requirements YAMLs are minimal** (just form references, not rule definitions)

### Key Risks
1. Hardcoded validation logic makes maintenance difficult
2. No way to test rules without running full integration
3. Evidence upload exists but no classification or rule integration
4. Scotland/Wales Complete Pack MQS disabled

---

## PART A: INVENTORY & ENTRY POINTS

### 1. Flow Definitions

#### Notice Only Flows

| Jurisdiction | MQS File | Status | Routes | Questions |
|-------------|----------|--------|--------|-----------|
| England | `config/mqs/notice_only/england.yaml` | ✅ Active | section_21, section_8 | 25+ |
| Wales | `config/mqs/notice_only/wales.yaml` | ✅ Active | section_173, fault_based | 20+ |
| Scotland | `config/mqs/notice_only/scotland.yaml` | ✅ Active (v2.0.0) | notice_to_leave | 25+ |

**Flow Component:** `src/components/wizard/flows/NoticeOnlySectionFlow.tsx` (1,340 lines)
- Handles all three jurisdictions
- Section visibility gating by route
- Inline validation integration via `noticeOnlyInlineValidator.ts`

#### Complete Pack (Eviction) Flows

| Jurisdiction | MQS File | Status | Routes | Questions |
|-------------|----------|--------|--------|-----------|
| England | `config/mqs/complete_pack/england.yaml` | ✅ Active | section_21, section_8 | 200+ |
| Wales | `config/mqs/complete_pack/wales.yaml.DISABLED` | ⛔ Disabled | - | - |
| Scotland | `config/mqs/complete_pack/scotland.yaml.DISABLED` | ⛔ Disabled | - | - |

**Flow Component:** `src/components/wizard/flows/EvictionSectionFlow.tsx`
- Full court form generation support for England
- Wales/Scotland disabled at MQS level

### 2. Section Components

#### Notice Only Sections
| Section | File | Jurisdictions | Purpose |
|---------|------|---------------|---------|
| NoticeSection | `sections/eviction/NoticeSection.tsx` | England | Notice date, method, expiry |
| WalesNoticeSection | `sections/wales/WalesNoticeSection.tsx` | Wales | RHW form selection |
| ScotlandNoticeSection | `sections/eviction/ScotlandNoticeSection.tsx` | Scotland | Notice to Leave details |
| ScotlandGroundsSection | `sections/eviction/ScotlandGroundsSection.tsx` | Scotland | PRT grounds selection |
| ScotlandComplianceSection | `sections/eviction/ScotlandComplianceSection.tsx` | Scotland | Pre-action requirements |

#### Complete Pack Sections
| Section | File | Purpose |
|---------|------|---------|
| CaseBasicsSection | `sections/eviction/CaseBasicsSection.tsx` | Route selection (S8/S21) |
| PartiesSection | `sections/eviction/PartiesSection.tsx` | Landlord/tenant details |
| PropertySection | `sections/eviction/PropertySection.tsx` | Property address |
| TenancySection | `sections/eviction/TenancySection.tsx` | Tenancy dates, rent |
| Section21ComplianceSection | `sections/eviction/Section21ComplianceSection.tsx` | Deposit, EPC, gas, H2R |
| Section8ArrearsSection | `sections/eviction/Section8ArrearsSection.tsx` | Grounds, arrears schedule |
| CourtSigningSection | `sections/eviction/CourtSigningSection.tsx` | Signatory details |
| EvidenceSection | `sections/eviction/EvidenceSection.tsx` | Evidence uploads |
| ReviewSection | `sections/eviction/ReviewSection.tsx` | Final review |

### 3. Auto-Skip Logic

Current auto-skip logic in flows:

**Section 21 Route:**
- Skips: `Section8ArrearsSection`
- Shows: `Section21ComplianceSection`

**Section 8 Route:**
- Skips: `Section21ComplianceSection` (deposit/EPC not required for S8 validity)
- Shows: `Section8ArrearsSection`

**Scotland:**
- Shows: `ScotlandGroundsSection`, `ScotlandComplianceSection` (pre-action for Ground 1)
- Conditional: Pre-action questions only if Ground 1 (rent arrears) selected

---

## PART B: DOCUMENT GENERATION & TEMPLATES

### 4. Template Inventory

#### England Notice Only Templates
| Route | Template Path | Output |
|-------|--------------|--------|
| section_21 | `config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/notice.hbs` | Form 6A PDF |
| section_8 | `config/jurisdictions/uk/england/templates/notice_only/form_3_section8/notice.hbs` | Form 3 PDF |

#### England Complete Pack Templates
| Document | Template Path | Notes |
|----------|--------------|-------|
| N5 Claim | `templates/eviction/n5_claim.hbs` | Section 8 standard |
| N5B Claim | `templates/eviction/n5b_claim.hbs` | Section 21 accelerated |
| N119 Particulars | `templates/eviction/n119_particulars.hbs` | Section 8 |
| Witness Statement | `templates/eviction/witness-statement.hbs` | AI-generated |
| Service Instructions | `templates/eviction/service_instructions.hbs` | Common |
| Compliance Checklist | `templates/eviction/compliance_checklist.hbs` | Common |

#### Wales Notice Only Templates
| Route | Template Path | Form |
|-------|--------------|------|
| section_173 (6 months) | `templates/notice_only/rhw16_notice_termination_6_months/notice.hbs` | RHW16 |
| section_173 (2 months) | `templates/notice_only/rhw17_notice_termination_2_months/notice.hbs` | RHW17 |
| fault_based | `templates/notice_only/rhw23_notice_before_possession_claim/notice.hbs` | RHW23 |

#### Scotland Notice Only Templates
| Route | Template Path | Form |
|-------|--------------|------|
| notice_to_leave | `templates/notice_only/notice_to_leave_prt_2017/notice.hbs` | NTL |

### 5. Pack Contents Mapping

**File:** `src/lib/products/pack-contents.ts`

| Product | Jurisdiction | Route | Documents Included |
|---------|-------------|-------|-------------------|
| notice_only | england | section_21 | Form 6A, Service Instructions, Checklist |
| notice_only | england | section_8 | Form 3, Service Instructions, Checklist, Arrears Schedule (if applicable) |
| complete_pack | england | section_21 | All notice_only + N5B, Witness Statement, Court Filing Guide, Evidence Checklist, Proof of Service |
| complete_pack | england | section_8 | All notice_only + N5, N119, Witness Statement, Court Filing Guide, Evidence Checklist, Proof of Service |
| notice_only | scotland | notice_to_leave | Notice to Leave, Service Instructions, Pre-action Checklist |
| notice_only | wales | section_173 | RHW16/17, Service Instructions, Checklist |

---

## PART C: CURRENT VALIDATION STATE

### 6. Existing Validation Logic

#### TypeScript Validators (Hardcoded)

| Validator | File | Purpose | Severity Support |
|-----------|------|---------|------------------|
| noticeOnlyInlineValidator | `src/lib/validation/noticeOnlyInlineValidator.ts` | Step-by-step inline validation | blocker, warning, info |
| pre-generation-check | `src/lib/validation/pre-generation-check.ts` | Pre-doc generation checks | blocker, warning |
| notice-only-case-validator | `src/lib/validation/notice-only-case-validator.ts` | Full case validation | blocker, warning |
| evaluate-notice-compliance | `src/lib/notices/evaluate-notice-compliance.ts` | Notice period/compliance | pass, fail |

#### Rule Categories Implemented (TypeScript)

**Section 21 (England):**
- `S21_DEPOSIT_NOT_PROTECTED` - blocker
- `S21_PRESCRIBED_INFO_MISSING` - blocker
- `S21_HOW_TO_RENT_MISSING` - blocker
- `S21_EPC_MISSING` - blocker
- `S21_GAS_CERT_MISSING` - blocker
- `S21_RETALIATORY_EVICTION_RISK` - blocker
- `S21_DEPOSIT_CAP_EXCEEDED` - blocker (unless confirmed)
- `S21_FOUR_MONTH_BAR` - blocker

**Section 8 (England):**
- `S8_NO_GROUNDS` - blocker
- `S8_ARREARS_GROUND_NO_DATA` - blocker
- `GROUND_8_THRESHOLD_NOT_MET` - blocker
- `S8_NO_PARTICULARS` - blocker
- `S8_ASB_GROUND_NO_DATA` - warning
- `S8_BREACH_GROUND_NO_DATA` - warning

**Wales Section 173:**
- `WALES_S173_NOTICE_PERIOD_SHORT` - blocker
- `WALES_DEPOSIT_NOT_PROTECTED` - blocker
- `WALES_WRITTEN_STATEMENT_MISSING` - warning

**Wales Fault-Based:**
- `WALES_FAULT_NO_GROUNDS` - blocker
- `WALES_FAULT_NOTICE_PERIOD_SHORT` - blocker

**Scotland Notice to Leave:**
- `SCOTLAND_NO_GROUNDS` - blocker
- `SCOTLAND_LANDLORD_NOT_REGISTERED` - blocker
- `SCOTLAND_PRE_ACTION_NOT_COMPLETED` - blocker
- `SCOTLAND_NOTICE_PERIOD_SHORT` - blocker

#### Legal Requirements YAML Files (Minimal)

| File | Content | Status |
|------|---------|--------|
| `config/legal-requirements/england/section_21.yaml` | Form refs, legislation | ⚠️ Minimal |
| `config/legal-requirements/england/section_8.yaml` | Form refs, legislation | ⚠️ Minimal |
| `config/legal-requirements/scotland/notice_to_leave.yaml` | Form refs, legislation | ⚠️ Minimal |
| `config/legal-requirements/wales/wales_section_173.yaml` | Form refs, legislation | ⚠️ Minimal |
| `config/legal-requirements/wales/wales_fault_based.yaml` | Form refs, legislation | ⚠️ Minimal |

**Current YAML Structure (Example - section_21.yaml):**
```yaml
requiredOfficialForms:
  - public/official-forms/n5-eng.pdf
  - public/official-forms/n119-eng.pdf
  - public/official-forms/n5b-eng.pdf
optionalOfficialForms: []
requiredTextBlocks:
  - id: section21_notice
    description: "Section 21 prescribed wording"
requiredPreconditions:
  - id: deposit_protection
    mustBeValidatedInFlow: true
noticeRules:
  mustComputeExpiryDate: true
legislationReferences:
  - "Housing Act 1988"
```

**GAP:** No actual validation rules in YAML - all logic is hardcoded in TypeScript.

---

## PART D: EVIDENCE & INTELLIGENCE LAYER GAPS

### 7. Evidence Handling - Current State

#### Evidence Upload (Complete Pack Only)

**Component:** `src/components/wizard/sections/eviction/EvidenceSection.tsx`
**API:** `src/app/api/wizard/upload-evidence/route.ts`

**Categories Supported:**
| Category | Description | N5B Checkbox |
|----------|-------------|--------------|
| TENANCY_AGREEMENT | Signed AST | - |
| DEPOSIT_PROTECTION_CERTIFICATE | DPS/MyDeposits/TDS cert | E (N5B) |
| EPC | Energy Performance Certificate | F (N5B) |
| GAS_SAFETY_CERTIFICATE | CP12 certificate | G (N5B) |
| NOTICE_SERVED_PROOF | Delivery receipt/photo | - |
| BANK_STATEMENTS | Payment history | - |
| CORRESPONDENCE | Tenant communications | - |
| OTHER | Miscellaneous | - |

**Current Limitations:**
- ❌ No automatic classification (user must select category)
- ❌ No evidence-to-rule mapping
- ❌ No extraction of facts from uploaded documents
- ❌ No evidence strength indicators
- ❌ No evidence warnings in review panel

#### Money Claim Benchmark (for comparison)

**Evidence Classifier:** `src/lib/evidence/money-claim-evidence-classifier.ts`
- 60+ regex patterns for document detection
- Automatic category assignment
- Confidence scoring (0.3-0.9)
- 9 distinct evidence types

**Evidence Rules Integration:** `config/legal-requirements/england/money_claim_rules.yaml`
```yaml
- id: evidence_photo_missing_cleaning
  severity: warning
  applies_to: [cleaning]
  applies_when:
    - condition: "!evidenceContext?.has_photo_evidence"
  message: "No photo evidence uploaded. Courts value before/after photos..."
```

### 8. Intelligence Layer Gap Checklist

| Feature | Money Claim | Notice Only | Complete Pack |
|---------|-------------|-------------|---------------|
| YAML-driven rules | ✅ 815 lines, 59 rules | ❌ TypeScript only | ❌ TypeScript only |
| Rule severities (blocker/warning/suggestion) | ✅ All three | ⚠️ blocker/warning only | ⚠️ blocker/warning only |
| Rule grouping by section | ✅ 13 sections | ❌ | ❌ |
| Evidence classifier | ✅ 9 types | ❌ | ⚠️ Manual only |
| Evidence strength indicator | ✅ | ❌ | ❌ |
| Evidence-linked rules | ✅ | ❌ | ❌ |
| Review summary panel | ✅ Full | ⚠️ SmartReviewPanel exists | ⚠️ SmartReviewPanel exists |
| "Fix now" navigation | ✅ Field→Section mapping | ❌ | ❌ |
| Outcome confidence | ✅ | ❌ | ❌ |
| Court fee estimator | ✅ | ❌ | ❌ |
| Tenant defence warnings | ✅ 10 rules | ❌ | ❌ |
| Extraction suggestions | ✅ | ❌ | ❌ |
| Analytics tracking | ✅ | ⚠️ Basic | ⚠️ Basic |

---

## PART E: JURISDICTION & TERMINOLOGY CORRECTNESS

### 9. Terminology Audit

#### England - Correct ✅
| Term | Used In | Status |
|------|---------|--------|
| Section 21 | MQS, templates, components | ✅ Correct |
| Section 8 | MQS, templates, components | ✅ Correct |
| Assured Shorthold Tenancy (AST) | MQS, templates | ✅ Correct |
| Form 6A / Form 3 | Templates | ✅ Correct |
| N5, N5B, N119 | Pack contents, templates | ✅ Correct |
| Housing Act 1988 | Legal refs | ✅ Correct |
| Tenant Fees Act 2019 | Deposit cap validation | ✅ Correct |

#### Wales - Correct ✅
| Term | Used In | Status |
|------|---------|--------|
| Section 173 | MQS, templates | ✅ Correct |
| Renting Homes (Wales) Act 2016 | Legal refs, templates | ✅ Correct |
| Occupation Contract | MQS | ✅ Correct |
| Standard Occupation Contract | Contract type options | ✅ Correct |
| RHW16, RHW17, RHW23 | Template filenames | ✅ Correct |
| Rent Smart Wales | Registration validation | ✅ Correct |

#### Scotland - Correct ✅
| Term | Used In | Status |
|------|---------|--------|
| Notice to Leave | MQS, templates | ✅ Correct |
| Private Residential Tenancy (PRT) | MQS | ✅ Correct |
| Private Housing (Tenancies) (Scotland) Act 2016 | Legal refs | ✅ Correct |
| First-tier Tribunal (Housing) | Guidance templates | ✅ Correct |
| Scottish Landlord Registration | MQS validation | ✅ Correct |
| Pre-Action Requirements | Compliance section | ✅ Correct |

### 10. Potential Issues Found

| File | Issue | Severity | Recommendation |
|------|-------|----------|----------------|
| `pre-generation-check.ts:494` | Comment mentions `section8_grounds` as legacy fallback for Wales | Low | Document this in changelog |
| `noticeOnlyInlineValidator.ts:647` | Scotland pre-action codes include `pre_action_letter_not_sent` but MQS uses `pre_action_letter` | Low | Normalize ID conventions |
| `pack-contents.ts` | Northern Ireland returns empty array | Info | Expected - NI support limited |

### 11. Legislation References Check

| Jurisdiction | Legislation | Templates | Validators | Status |
|--------------|-------------|-----------|------------|--------|
| England | Housing Act 1988 | ✅ | ✅ | Correct |
| England | Tenant Fees Act 2019 | ✅ | ✅ | Correct |
| England | Deregulation Act 2015 | ✅ (retaliatory eviction) | ✅ | Correct |
| Wales | Renting Homes (Wales) Act 2016 | ✅ | ✅ | Correct |
| Scotland | Private Housing (Tenancies) (Scotland) Act 2016 | ✅ | ✅ | Correct |

---

## PART F: TEST COVERAGE AUDIT

### 12. Existing Test Files

#### Notice Only Tests
| Test File | Coverage | Status |
|-----------|----------|--------|
| `tests/audit/notice-only-inline-step-flow.test.ts` | Inline validation | ✅ |
| `tests/audit/notice-only-template-parity.test.ts` | Template consistency | ✅ |
| `tests/audit/notice-only-validation-audit.test.ts` | Validation rules | ✅ |
| `tests/lib/noticeOnlyInlineValidator.test.ts` | Inline validator unit | ✅ |
| `tests/lib/validation/notice-only-case-validator.test.ts` | Case validation | ✅ |
| `tests/notice-only-end-wizard-validation.test.ts` | E2E validation | ✅ |
| `tests/notice-only-section8-grounds.test.ts` | S8 grounds | ✅ |
| `tests/lib/wales/wales-notice-only-legal-validity.test.ts` | Wales validation | ✅ |
| `tests/lib/wales/wales-section173-notice-only.test.ts` | S173 specific | ✅ |
| `tests/lib/scotland/noticeNarrativeBuilder.test.ts` | Scotland narrative | ✅ |

#### Complete Pack Tests
| Test File | Coverage | Status |
|-----------|----------|--------|
| `tests/complete-pack/england-complete-pack.test.ts` | E2E flow | ✅ |
| `tests/complete-pack/england-complete-pack-dataflow.test.ts` | Data mapping | ✅ |
| `tests/complete-pack/pre-generation-check.test.ts` | Pre-gen validation | ✅ |
| `tests/complete-pack/smart-review.test.ts` | Smart review panel | ✅ |
| `tests/complete-pack/smart-review-hardening.test.ts` | Edge cases | ✅ |
| `tests/complete-pack/witness-statement-sections.test.ts` | Witness statement | ✅ |
| `tests/complete-pack/england-section8-ground8-mapping.test.ts` | Ground 8 mapping | ✅ |

### 13. Missing Tests (Top 10 ROI)

| Priority | Test to Add | Reason |
|----------|-------------|--------|
| 1 | YAML rules engine unit tests | Foundation for new architecture |
| 2 | Evidence classifier tests | Required for evidence integration |
| 3 | "Fix now" navigation mapping tests | Ensure all rules map to sections |
| 4 | Wales Complete Pack E2E | Currently disabled, needs coverage |
| 5 | Scotland Complete Pack E2E | Currently disabled, needs coverage |
| 6 | Cross-jurisdiction rule consistency | Ensure no leakage |
| 7 | Tenant defence rule coverage | New feature needs tests |
| 8 | Evidence strength calculation tests | New feature needs tests |
| 9 | Rule severity regression tests | Prevent blocker→warning downgrades |
| 10 | Template variable completeness | Ensure all facts map to templates |

---

## PART G: PHASED UPGRADE BLUEPRINT

### Phase 1: Foundation (No UX Change, Low Risk)

**Goal:** Introduce YAML rules engine without changing user experience

#### 1.1 Create YAML Rules Files

**Files to Create:**
```
config/legal-requirements/england/notice_only_rules.yaml
config/legal-requirements/england/complete_pack_rules.yaml
config/legal-requirements/wales/notice_only_rules.yaml
config/legal-requirements/scotland/notice_only_rules.yaml
```

**Rule Structure (matching Money Claim):**
```yaml
__meta:
  version: "1.0.0"
  product: "notice_only"
  jurisdiction: "england"

rules:
  # Section 21 Rules
  - id: s21_deposit_not_protected
    severity: blocker
    applies_to: [section_21]
    applies_when:
      - condition: "facts.deposit_taken === true && facts.deposit_protected !== true"
    message: "Deposit must be protected in an approved scheme"
    rationale: "Housing Act 2004 s213 requires protection within 30 days"
    field: deposit_protected_scheme
    section: deposit_compliance

  - id: s21_prescribed_info_missing
    severity: blocker
    applies_to: [section_21]
    applies_when:
      - condition: "facts.deposit_taken === true && facts.prescribed_info_given !== true"
    message: "Prescribed information must be served to tenant"
    rationale: "Housing Act 2004 s213(6)"
    field: prescribed_info_given
    section: deposit_compliance

summary:
  sections:
    - id: deposit_compliance
      label: "Deposit Compliance"
      rules: [s21_deposit_not_protected, s21_prescribed_info_missing]
    - id: safety_compliance
      label: "Safety Certificates"
      rules: [s21_epc_missing, s21_gas_cert_missing, s21_how_to_rent_missing]
```

**Estimated Rules Count:**
- England Notice Only: ~25 rules
- England Complete Pack: ~35 rules (includes witness statement guidance)
- Wales Notice Only: ~20 rules
- Scotland Notice Only: ~20 rules

#### 1.2 Create Rules Engine Adapter

**Files to Create:**
```
src/lib/validation/eviction-rules-engine.ts
src/lib/validation/eviction-client-validator.ts
```

**Reuse from Money Claim:**
- Allowlist-based condition validation
- Safe context binding
- Severity handling
- Section grouping

#### 1.3 Add Tests for Rules

**Files to Create:**
```
tests/lib/validation/eviction-rules-engine.test.ts
tests/lib/validation/notice-only-yaml-rules.test.ts
tests/lib/validation/complete-pack-yaml-rules.test.ts
```

**Test Coverage:**
- Each rule fires on expected conditions
- Rules don't fire on negative cases
- Severity levels are correct
- Section mappings are valid
- No security violations (condition allowlist)

#### 1.4 Parallel Run (Shadow Mode)

**Approach:**
1. Run YAML engine alongside existing TypeScript validation
2. Log discrepancies
3. Fix YAML rules until parity achieved
4. Switch primary validation to YAML engine

**Files to Modify:**
```
src/lib/validation/pre-generation-check.ts  # Add shadow mode
src/lib/validation/noticeOnlyInlineValidator.ts  # Add shadow mode
```

**Manual QA Checklist - Phase 1:**
- [ ] All existing blockers still fire
- [ ] All existing warnings still fire
- [ ] No new false positives
- [ ] No performance regression (< 100ms rule evaluation)
- [ ] CI passes with new tests

---

### Phase 2: UX Improvements (Medium Risk)

**Goal:** Add review panel enhancements and "Fix now" navigation

#### 2.1 Enhance Review Summary Panel

**Files to Modify:**
```
src/components/wizard/SmartReviewPanel.tsx
src/components/wizard/sections/eviction/ReviewSection.tsx
src/components/wizard/flows/EvictionSectionFlow.tsx
```

**New Components to Create:**
```
src/components/wizard/eviction/ValidationSummaryPanel.tsx
src/components/wizard/eviction/RuleCategoryList.tsx
```

**Features:**
- Display rules grouped by section
- Color-coded severity badges
- Rule count summary
- Expandable sections for details

#### 2.2 Implement "Fix Now" Navigation

**Files to Create:**
```
src/lib/validation/eviction-rule-navigation.ts
```

**Mapping Structure:**
```typescript
const RULE_TO_SECTION_MAP: Record<string, string> = {
  's21_deposit_not_protected': 'deposit_compliance',
  's21_prescribed_info_missing': 'deposit_compliance',
  's21_epc_missing': 'safety_compliance',
  's21_gas_cert_missing': 'safety_compliance',
  's8_no_grounds': 'grounds_selection',
  'ground_8_threshold_not_met': 'arrears_details',
  // ... etc
};
```

**Implementation:**
- Custom event: `wizard:navigate`
- Scroll-to-section on "Fix now" click
- Only show "Fix now" for blockers

#### 2.3 Add Evidence Upload Prompts

**Files to Modify:**
```
src/components/wizard/sections/eviction/EvidenceSection.tsx
```

**Features:**
- Show "recommended" vs "optional" evidence badges
- Add claim-type-aware guidance (S21 vs S8)
- Warn if key evidence missing (deposit cert for S21)

#### 2.4 Schema Additions for Facts

**Files to Modify:**
```
src/lib/case-facts/schema.ts
```

**New Fields (if needed):**
```typescript
// Evidence classification metadata
evidence_classification?: {
  has_deposit_certificate: boolean;
  has_epc: boolean;
  has_gas_certificate: boolean;
  has_tenancy_agreement: boolean;
  has_arrears_evidence: boolean;
};

// Rule evaluation cache
validation_snapshot?: {
  blockers: string[];
  warnings: string[];
  evaluated_at: string;
};
```

#### 2.5 Analytics Events

**Events to Add:**
```typescript
trackValidationPanelShown(product, jurisdiction, route, blockerCount, warningCount)
trackFixNowClicked(ruleId, targetSection)
trackEvidencePromptShown(evidenceType)
trackEvidenceUploaded(evidenceType, product)
```

**Manual QA Checklist - Phase 2:**
- [ ] Review panel shows grouped rules
- [ ] "Fix now" navigates to correct section
- [ ] Evidence prompts appear for right routes
- [ ] Analytics events fire correctly
- [ ] Mobile responsive layout works
- [ ] No layout regressions on existing flows

---

### Phase 3: Intelligence Layer (Higher Risk)

**Goal:** Add evidence classification, strength indicators, and tenant defence warnings

#### 3.1 Evidence Classifier for Eviction

**Files to Create:**
```
src/lib/evidence/eviction-evidence-classifier.ts
```

**Categories:**
```typescript
export enum EvictionEvidenceCategory {
  TENANCY_AGREEMENT = 'tenancy_agreement',
  DEPOSIT_CERTIFICATE = 'deposit_certificate',
  PRESCRIBED_INFO = 'prescribed_info',
  EPC = 'epc',
  GAS_CERTIFICATE = 'gas_certificate',
  HOW_TO_RENT = 'how_to_rent',
  NOTICE_SERVICE_PROOF = 'notice_service_proof',
  RENT_LEDGER = 'rent_ledger',
  BANK_STATEMENTS = 'bank_statements',
  CORRESPONDENCE = 'correspondence',
  ASB_EVIDENCE = 'asb_evidence',
  BREACH_EVIDENCE = 'breach_evidence',
}
```

**Pattern Matching:**
- Filename patterns (deposit, epc, gas, etc.)
- MIME type detection
- User category override

#### 3.2 Evidence Strength Indicator

**Files to Create:**
```
src/lib/evidence/eviction-evidence-strength.ts
src/components/wizard/eviction/EvidenceStrengthIndicator.tsx
```

**Strength Factors:**
- Has all required documents for route
- Has supporting correspondence
- Has payment history (for arrears)
- Has photos (for damage/ASB)

#### 3.3 Tenant Defence Warnings

**Add to YAML Rules:**
```yaml
# Preemptive defence warnings
- id: defence_deposit_not_protected_penalty
  severity: warning
  applies_to: [section_8]  # Warning even on S8
  applies_when:
    - condition: "facts.deposit_taken && !facts.deposit_protected"
  message: "Tenant may counterclaim up to 3x deposit if not protected"
  rationale: "Housing Act 2004 s214 - Penalty for non-protection"
  section: legal_warnings

- id: defence_retaliatory_eviction
  severity: warning
  applies_to: [section_21]
  applies_when:
    - condition: "facts.recent_repair_complaints"
  message: "Tenant may argue retaliatory eviction under Deregulation Act 2015"
  section: legal_warnings

- id: defence_service_defect
  severity: suggestion
  applies_to: [section_8, section_21]
  message: "Ensure notice served correctly - defects can invalidate proceedings"
  section: legal_warnings
```

**Defence Categories:**
- Deposit issues (non-protection, cap exceeded)
- Retaliatory eviction (repair complaints)
- Service defects (incorrect method, timing)
- Notice period errors
- Document compliance (EPC, gas, H2R)

#### 3.4 Extraction Suggestions (Optional)

**Files to Create:**
```
src/lib/evidence/eviction-extraction.ts
```

**Extraction Targets:**
- Tenancy start date from agreement
- Rent amount from agreement
- Deposit amount from certificate
- EPC rating from certificate

**Implementation Note:** Start with regex-based extraction, avoid LLM dependency for deterministic behavior.

**Manual QA Checklist - Phase 3:**
- [ ] Evidence classifier correctly categorizes uploaded files
- [ ] Evidence strength shows accurate assessment
- [ ] Tenant defence warnings appear appropriately
- [ ] No false defence warnings
- [ ] Extraction suggestions work for common document formats
- [ ] Performance acceptable (< 2s for classification)

---

## APPENDIX A: FILE CHANGE SUMMARY

### Files to Create

| Phase | File | Purpose |
|-------|------|---------|
| 1 | `config/legal-requirements/england/notice_only_rules.yaml` | England Notice Only YAML rules |
| 1 | `config/legal-requirements/england/complete_pack_rules.yaml` | England Complete Pack YAML rules |
| 1 | `config/legal-requirements/wales/notice_only_rules.yaml` | Wales Notice Only YAML rules |
| 1 | `config/legal-requirements/scotland/notice_only_rules.yaml` | Scotland Notice Only YAML rules |
| 1 | `src/lib/validation/eviction-rules-engine.ts` | Eviction rules engine |
| 1 | `src/lib/validation/eviction-client-validator.ts` | Client-side validator |
| 1 | `tests/lib/validation/eviction-rules-engine.test.ts` | Rules engine tests |
| 2 | `src/components/wizard/eviction/ValidationSummaryPanel.tsx` | Enhanced review panel |
| 2 | `src/lib/validation/eviction-rule-navigation.ts` | Fix now navigation mapping |
| 3 | `src/lib/evidence/eviction-evidence-classifier.ts` | Evidence classification |
| 3 | `src/lib/evidence/eviction-evidence-strength.ts` | Evidence strength scoring |
| 3 | `src/components/wizard/eviction/EvidenceStrengthIndicator.tsx` | Strength UI component |

### Files to Modify

| Phase | File | Changes |
|-------|------|---------|
| 1 | `src/lib/validation/pre-generation-check.ts` | Add shadow mode for YAML rules |
| 1 | `src/lib/validation/noticeOnlyInlineValidator.ts` | Add shadow mode for YAML rules |
| 2 | `src/components/wizard/SmartReviewPanel.tsx` | Add section grouping, expand/collapse |
| 2 | `src/components/wizard/sections/eviction/ReviewSection.tsx` | Integrate new validation panel |
| 2 | `src/components/wizard/sections/eviction/EvidenceSection.tsx` | Add prompts and guidance |
| 2 | `src/lib/case-facts/schema.ts` | Add evidence classification fields |
| 3 | YAML rules files | Add tenant defence warning rules |

---

## APPENDIX B: ESTIMATED EFFORT

| Phase | Effort | Risk | Dependencies |
|-------|--------|------|--------------|
| Phase 1 | 2-3 weeks | Low | None |
| Phase 2 | 2-3 weeks | Medium | Phase 1 complete |
| Phase 3 | 3-4 weeks | Medium-High | Phase 1+2 complete |

**Total Estimated Effort:** 7-10 weeks for full intelligence layer parity with Money Claim

---

## APPENDIX C: OPEN QUESTIONS

1. **Wales/Scotland Complete Pack:** Should we enable the disabled MQS files before or after the intelligence layer upgrade?

2. **Evidence Upload Notice Only:** Should Notice Only include evidence upload, or is that a Complete Pack differentiator?

3. **LLM Integration:** Should tenant defence warnings use LLM analysis for complex cases, or stay deterministic?

4. **Witness Statement AI:** Should AI-generated witness statements integrate with the new rules engine?

5. **Pricing Changes:** Does adding intelligence layer features justify pricing changes?

---

**Report Generated:** 2026-01-25
**Next Review:** After Phase 1 completion
