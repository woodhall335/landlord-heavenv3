# Section 21 (N5B) Route Lock & Compliance Improvements

## Summary

This PR ensures the "Complete Eviction Pack" Section 21 route (N5B accelerated possession) is legally valid, asks the right questions to fully complete N5B, and does not generate Section 8 / standard-procedure documents.

**Key Improvements:**
- Bulletproof inline validation for all Section 21 compliance requirements
- Trust-based document confirmations (no uploads required)
- Complete N5B form field coverage
- Conditional question logic matching Section 8 eviction packs

## Changes

### 1. Route Lock for Section 21 (N5B Only)

**File:** `src/lib/documents/eviction-pack-generator.ts`

**Problem:** Section 21 cases were incorrectly generating N5 and N119 court forms (Section 8 standard procedure documents).

**Fix:** Added conditional check to only generate N5/N119 when `evictionCase.grounds.length > 0` (Section 8 fault-based route). Section 21 (no-fault) cases now only generate:
- Form 6A (Section 21 Notice)
- N5B (Accelerated Possession Claim)
- Evidence checklist, proof of service, witness statement
- Guidance documents

This enforces the route-to-document mapping defined in `pack-contents.ts` as the single source of truth.

### 2. Compliance Gates for Section 21

**File:** `src/lib/notices/evaluate-notice-compliance.ts`

Added hard-block enforcement for:

#### a) Licensing (Housing Act 2004, s.75/s.98)
- New check: `S21-LICENSING-REQUIRED` - Hard-fails if property requires HMO/selective licensing but no valid licence exists
- Section 21 notices are INVALID for unlicensed properties that should be licensed

#### b) Retaliatory Eviction Bar (Deregulation Act 2015, s.33)
- New check: `S21-RETALIATORY-IMPROVEMENT-NOTICE` - Hard-fails if local authority served an improvement notice
- New check: `S21-RETALIATORY-EMERGENCY-ACTION` - Hard-fails if emergency remedial action taken
- New warning: `S21-RETALIATORY-RISK` - Warns if recent repair complaints exist (potential bar)
- 6-month protection period applies from date of notice/action

#### c) Prohibited Fees (Tenant Fees Act 2019, s.13)
- New check: `S21-PROHIBITED-FEES` - Hard-fails if prohibited fees charged to tenant
- New check: `S21-PROHIBITED-FEES-UNCONFIRMED` - Hard-fails if user doesn't confirm no prohibited fees
- Prohibited payments must be refunded before Section 21 is valid

### 3. MQS Questions for N5B Completeness

**File:** `config/mqs/complete_pack/england.yaml`

Added new required questions for Section 21 compliance:

#### Notice Service Method Detail
- New field: `notice_service_method_detail` - Required when "other" method selected
- Conditionally shown via `dependsOn` when `notice_service_method === "other"`
- Maps directly to N5B field 10a

#### Retaliatory Eviction Questions
- New field: `improvement_notice_served` - Hard-block validation (must be false to proceed)
- New field: `emergency_remedial_action` - Hard-block validation (must be false to proceed)

#### Prohibited Fees Confirmation
- New field: `no_prohibited_fees_confirmed` - Hard-block validation (must be true to proceed)

### 4. Centralized Service Method Resolution

**File:** `src/lib/case-facts/normalize.ts`

Added centralized resolution functions for notice service method:

- `resolveNoticeServiceMethod(wizard)` - Resolves canonical service method from multiple paths
- `resolveNoticeServiceMethodDetail(wizard)` - Resolves detail text for "other" method
- `normalizeServiceMethod(value)` - Normalizes aliases to canonical values
- `getServiceMethodLabel(method)` - Returns display label for UI rendering

**Supported paths checked in order:**
1. `notice_service_method` (direct MQS field)
2. `notice_service.service_method` (nested from maps_to)
3. `section21.service_method` (Section 21 specific)
4. `service_method` (legacy flat key)

**File:** `src/lib/documents/eviction-wizard-mapper.ts`

Updated `notice_service_method` mapping to use centralized resolution:
- Uses `resolveNoticeServiceMethod()` for single source of truth
- When method is "other", includes detail text: `"Other: {detail}"`

### 5. Smart Review Warnings in UI

**File:** `src/components/wizard/StructuredWizard.tsx`

Enhanced smart_review_warnings consumption:
- Primary source: `data.smart_review.warnings` from API response
- Fallback source: `data.smart_review_warnings` array (top-level convenience field)
- Warnings are now captured even if full smart_review object is missing
- Summary statistics computed from fallback when needed

### 6. Compliance Evaluator Scope Extension

**File:** `src/lib/notices/evaluate-notice-compliance.ts`

Extended evaluator to run for both products:
- Previously: Only ran for `notice_only` product
- Now: Runs for both `notice_only` and `complete_pack` products
- Ensures Section 21 compliance gates apply to complete eviction packs

## Tests Added

**File:** `tests/complete-pack/section21-route-lock.test.ts`

22 new tests covering:

### Route Lock Tests (4 tests)
- Section 21 pack must NOT include N5 claim form
- Section 21 pack must NOT include N119 particulars
- Section 21 pack MUST include N5B accelerated possession claim
- Section 21 pack MUST include Form 6A notice

### Licensing Compliance Tests (4 tests)
- Hard-fails when HMO licensing required but no valid licence
- Hard-fails when selective licensing required but no valid licence
- Passes when licensing not required
- Passes when licensing required AND valid licence exists

### Retaliatory Eviction Tests (4 tests)
- Hard-fails when improvement notice has been served
- Hard-fails when emergency remedial action has been taken
- Passes when no improvement notice or emergency action
- Shows warning for recent repair complaints (potential retaliatory bar)

### Prohibited Fees Tests (3 tests)
- Hard-fails when prohibited fees have been charged
- Hard-fails when no prohibited fees confirmation is explicitly false
- Passes when no prohibited fees confirmed

### Service Method Resolution Tests (7 tests)
- Resolves from direct field
- Resolves from nested path
- Normalizes service method aliases
- Returns null when not provided
- Resolves detail when "other" is selected
- Returns null for detail when not provided
- Resolves detail from nested path

## Legal References

- **Housing Act 2004, s.75** - HMO licensing requirement
- **Housing Act 2004, s.98** - Selective licensing requirement
- **Housing Act 2004, s.11** - Improvement notices
- **Housing Act 2004, s.40** - Emergency remedial action
- **Deregulation Act 2015, s.33** - Retaliatory eviction protection
- **Tenant Fees Act 2019, s.13** - Prohibited payments and Section 21 validity

### 7. MQS Questions Restructured (england.yaml)

**Duplicate Questions Removed:**
- Removed `no_retaliatory_notice` (now covered by explicit `improvement_notice_served` and `emergency_remedial_action`)
- Consolidated deposit questions to avoid redundancy

**Evidence Uploads Replaced with Trust-Based Confirmations:**
- `document_tenancy_agreement` - Confirm you have tenancy agreement copy (N5B Attachment A)
- `document_section21_notice` - Confirm you have Section 21 notice copy (N5B Attachment B)
- `document_proof_of_service` - Confirm you have proof of service (N5B Attachment B1)
- `document_deposit_certificate` - Confirm you have deposit certificate (N5B Attachment E)
- `document_epc` - Confirm you have EPC copy (N5B Attachment F)
- `document_gas_safety` - Confirm you have gas certificate copy (N5B Attachment G)

**New Inline Validation Questions:**
- `deposit_taken` - Whether a deposit was taken (controls conditional questions)
- `deposit_protected` - Must be YES with assertValue validation
- `deposit_protected_within_30_days` - Must be YES with assertValue validation
- `prescribed_info_served` - Must be YES with assertValue validation
- `deposit_returned` - For N5B Question 13
- `deposit_within_cap` - Tenant Fees Act 2019 deposit cap check
- `how_to_rent_served` - Must be YES with assertValue validation
- `epc_served` - Must be YES with assertValue validation
- `epc_rating` - EPC rating A-G with minimum E warning
- `tenancy_over_4_months` - 4-month restriction check (must be YES)
- `subsequent_tenancy` - For N5B Question 8
- `notice_service_description` - Free text for witness statement

**Conditional Logic:**
All Section 21 questions use `dependsOn` to show only when:
- `eviction_route === "section_21"` (base condition)
- `deposit_taken === true` (deposit-related questions)
- `has_gas_appliances === true` (gas certificate questions)
- `licensing_required !== "not_required"` (licensing questions)

## Migration Notes

- No database migrations required
- New MQS questions will appear for Section 21 cases on next wizard visit
- Existing cases without new fields will trigger generate-stage validation prompts
- Trust-based document confirmations replace file upload requirements
