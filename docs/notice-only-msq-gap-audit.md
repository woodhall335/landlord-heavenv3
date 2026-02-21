# Notice-Only MSQ Gap Audit

**Date:** 2025-12-22
**Scope:** notice_only product only
**Jurisdictions:** England (S21/S8), Wales (S173/fault-based), Scotland (NTL)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [England Section 21 - Have vs Need](#england-section-21---have-vs-need)
3. [England Section 8 - Have vs Need](#england-section-8---have-vs-need)
4. [Wales Section 173 - Have vs Need](#wales-section-173---have-vs-need)
5. [Wales Fault-Based - Have vs Need](#wales-fault-based---have-vs-need)
6. [Scotland Notice to Leave - Have vs Need](#scotland-notice-to-leave---have-vs-need)
7. [Identified Issues](#identified-issues)
8. [Route-Invalidating Rules Summary](#route-invalidating-rules-summary)

---

## Executive Summary

This audit examines the MSQ configurations in `config/mqs/notice_only/*.yaml` against the compliance rules enforced by:
- Decision Engine (`src/lib/decision-engine/index.ts`)
- Compliance Evaluator (`src/lib/notices/evaluate-notice-compliance.ts`)

### Key Findings

| Category | Count | Severity |
|----------|-------|----------|
| Incorrect `dependsOn` rules | 2 | High |
| Missing orphan fact clearing | 3 | Medium |
| Type inconsistencies | 1 | Low |
| Legacy UI components to remove | 1 | Medium |

---

## England Section 21 - Have vs Need

### Required Canonical Facts for Form 6A Compliance

| Fact Key | MSQ Question ID | Maps To | dependsOn | Status |
|----------|-----------------|---------|-----------|--------|
| `landlord_full_name` | `landlord_details` | `landlord_full_name` | None | ✅ Present |
| `landlord_address_line1` | `landlord_details` | `landlord_address_line1` | None | ✅ Present |
| `landlord_address_line2` | `landlord_details` | `landlord_address_line2` | None | ✅ Present |
| `landlord_city` | `landlord_details` | `landlord_city` | None | ✅ Present |
| `landlord_postcode` | `landlord_details` | `landlord_postcode` | None | ✅ Present |
| `landlord_phone` | `landlord_details` | `landlord_phone` | None | ✅ Present |
| `tenant_full_name` | `tenant_full_name` | `tenant_full_name` | None | ✅ Present |
| `property_address_*` | `property_details` | Various | None | ✅ Present |
| `tenancy_start_date` | `tenancy_start_date` | `tenancy_start_date` | None | ✅ Present |
| `is_fixed_term` | `is_fixed_term` | `is_fixed_term` | None | ✅ Present |
| `fixed_term_end_date` | `fixed_term_end_date` | `fixed_term_end_date` | `is_fixed_term=true` | ✅ Correct |
| `rent_amount` | `rent_terms` | `rent_amount` | None | ✅ Present |
| `rent_frequency` | `rent_terms` | `rent_frequency` | None | ✅ Present |
| `deposit_taken` | `deposit_taken` | `deposit_taken` | None | ✅ Present |
| `deposit_amount` | `deposit_amount` | `deposit_amount` | `deposit_taken=true` | ✅ Correct |
| `deposit_protected` | `deposit_protected_scheme` | `deposit_protected` | `deposit_taken=true` | ✅ Correct |
| `prescribed_info_given` | `prescribed_info_given` | `prescribed_info_given` | `deposit_taken=true` | ⚠️ **INCORRECT** |
| `deposit_reduced_to_legal_cap_confirmed` | `deposit_reduced_to_legal_cap_confirmed` | `deposit_reduced_to_legal_cap_confirmed` | `deposit_taken=true && route=section_21` | ⚠️ **NEEDS REFINEMENT** |
| `has_gas_appliances` | `has_gas_appliances` | `has_gas_appliances` | None | ✅ Present |
| `gas_certificate_provided` | `gas_safety_certificate` | `gas_certificate_provided` | `has_gas_appliances=true` | ✅ Correct |
| `epc_provided` | `epc_provided` | `epc_provided` | None | ✅ Present |
| `how_to_rent_provided` | `how_to_rent_provided` | `how_to_rent_provided` | None | ✅ Present |
| `property_licensing_status` | `property_licensing` | `property_licensing_status` | None | ✅ Present |
| `notice_service_date` | `notice_service` | `notice_service.notice_date` | None | ✅ Present |
| `notice_expiry_date` | `notice_service` | `notice_service.notice_expiry_date` | None | ✅ Present |
| `service_method` | `notice_service` | `notice_service.service_method` | None | ✅ Present |

### S21 Route-Invalidating Rules (from Decision Engine & Compliance Evaluator)

| Rule Code | Fact Dependencies | Blocking Condition | Source |
|-----------|-------------------|-------------------|--------|
| `S21-DEPOSIT-NONCOMPLIANT` | `deposit_taken`, `deposit_protected`, `prescribed_info_given` | `deposit_taken=true && (deposit_protected=false OR prescribed_info_given=false)` | evaluate-notice-compliance.ts:92-110 |
| `S21-GAS-CERT` | `has_gas_appliances`, `gas_certificate_provided` | `has_gas_appliances=true && gas_certificate_provided=false` | evaluate-notice-compliance.ts:138-152 |
| `S21-EPC` | `epc_provided` | `epc_provided=false` | evaluate-notice-compliance.ts:118-136 |
| `S21-H2R` | `how_to_rent_provided`, `tenancy_start_date` | `how_to_rent_provided=false` (post-Oct 2015 tenancy) | evaluate-notice-compliance.ts:154-172 |
| `S21-LICENSING` | `property_licensing_status` | `property_licensing_status='unlicensed'` | evaluate-notice-compliance.ts:174-192 |
| `S21-DEPOSIT-CAP-EXCEEDED` | `deposit_taken`, `deposit_amount`, `rent_amount`, `rent_frequency`, `deposit_reduced_to_legal_cap_confirmed` | `deposit_exceeds_cap && confirmation!='yes'` | evaluate-notice-compliance.ts:194-240 |
| `S21-FOUR-MONTH-BAR` | `tenancy_start_date`, `notice_service_date` | Service within first 4 months | evaluate-notice-compliance.ts:242-260 |
| `S21-MINIMUM-NOTICE` | `notice_service_date`, `notice_expiry_date` | Less than 2 months notice | evaluate-notice-compliance.ts:262-280 |

---

## England Section 8 - Have vs Need

### Required Canonical Facts

| Fact Key | MSQ Question ID | Maps To | dependsOn | Status |
|----------|-----------------|---------|-----------|--------|
| `section8_grounds` | `section8_grounds_selection` | `section8_grounds` | `selected_notice_route=section_8` | ✅ Present |
| `ground_particulars` | `ground_particulars` | `ground_particulars` / `section_8_particulars` | `selected_notice_route=section_8` | ✅ Present |
| `has_rent_arrears` | `has_rent_arrears` | `has_rent_arrears` | `selected_notice_route=section_8` | ✅ Present |
| `arrears_total` | `arrears_details` | `arrears_total` | `has_rent_arrears=true` | ✅ Correct |
| `arrears_from_date` | `arrears_details` | `arrears_from_date` | `has_rent_arrears=true` | ✅ Correct |
| `ground14_severity` | `ground14_severity` | `ground14_severity` | Contains "Ground 14" | ✅ Correct |
| `notice_strategy` | `notice_strategy` | `notice_strategy` | `selected_notice_route=section_8` | ✅ Present |
| `notice_service_date` | `notice_service` | `notice_service.notice_date` | None | ✅ Present |
| `notice_expiry_date` | `notice_service` | `notice_service.notice_expiry_date` | None | ✅ Present |

### S8 Route-Invalidating Rules

| Rule Code | Fact Dependencies | Blocking Condition | Source |
|-----------|-------------------|-------------------|--------|
| `S8-GROUNDS-REQUIRED` | `section8_grounds` | No grounds selected | evaluate-notice-compliance.ts:282-295 |
| `S8-NOTICE-PERIOD` | `section8_grounds`, `notice_expiry_date` | Notice period insufficient for selected grounds | evaluate-notice-compliance.ts:297-340 |
| `S8-PARTICULARS-INCOMPLETE` | `section8_grounds`, `ground_particulars` | Grounds selected but particulars missing | evaluate-notice-compliance.ts:342-360 |

### Ask Heaven Integration

The Section 8 flow integrates with Ask Heaven for ground particulars enhancement. This MUST be preserved:
- Question `ground_particulars` has `inputType: textarea` with AI enhancement capability
- No blocking validation should interfere with the Ask Heaven component
- `ground_particulars` is mapped separately per ground (e.g., `ground_8`, `ground_10`, `ground_14`)

---

## Wales Section 173 - Have vs Need

### Required Canonical Facts

| Fact Key | MSQ Question ID | Maps To | dependsOn | Status |
|----------|-----------------|---------|-----------|--------|
| `wales_contract_category` | `wales_contract_category` | `wales_contract_category` | None | ✅ Present |
| `rent_smart_wales_registered` | `rent_smart_wales_registered` | `rent_smart_wales_registered` | None | ✅ Present |
| `rent_smart_wales_number` | `rent_smart_wales_number` | `rent_smart_wales_number` | `rent_smart_wales_registered=true` | ✅ Correct |
| `contract_start_date` | `wales_contract_start_date` | `contract_start_date` | None | ✅ Present |
| `deposit_taken` | `deposit_taken` | `deposit_taken` | None | ✅ Present |
| `deposit_protected` | `deposit_protected` | `deposit_protected` | `deposit_taken=true` | ✅ Correct |
| `notice_service_date` | `notice_service` | `notice_service.notice_date` | None | ✅ Present |
| `notice_expiry_date` | `notice_service` | `notice_service.notice_expiry_date` | None | ✅ Present |

### S173 Route-Invalidating Rules

| Rule Code | Fact Dependencies | Blocking Condition | Source |
|-----------|-------------------|-------------------|--------|
| `S173-CONTRACT-TYPE` | `wales_contract_category` | `category='supported_standard' OR category='secure'` | decision-engine/index.ts:413-426 |
| `S173-LICENSING` | `rent_smart_wales_registered` | `rent_smart_wales_registered=false` | evaluate-notice-compliance.ts:362-380 |
| `S173-PERIOD-BAR` | `contract_start_date`, `notice_service_date` | Service within first 6 months | evaluate-notice-compliance.ts:382-400 |
| `S173-DEPOSIT-NONCOMPLIANT` | `deposit_taken`, `deposit_protected` | `deposit_taken=true && deposit_protected=false` | evaluate-notice-compliance.ts:402-420 |

---

## Wales Fault-Based - Have vs Need

### Required Canonical Facts

| Fact Key | MSQ Question ID | Maps To | dependsOn | Status |
|----------|-----------------|---------|-----------|--------|
| `wales_fault_grounds` | `wales_fault_based_section` | `wales_fault_grounds` | `selected_notice_route=wales_fault_based` | ✅ Present |
| `wales_breach_particulars` | `wales_fault_particulars` | `wales_breach_particulars` | `selected_notice_route=wales_fault_based` | ✅ Present |
| `notice_service_date` | `notice_service` | `notice_service.notice_date` | None | ✅ Present |
| `notice_expiry_date` | `notice_service` | `notice_service.notice_expiry_date` | None | ✅ Present |

### Fault-Based Route Rules

| Rule Code | Fact Dependencies | Blocking Condition | Source |
|-----------|-------------------|-------------------|--------|
| `RHW23-GROUND-REQUIRED` | `wales_fault_grounds` | No grounds selected | evaluate-notice-compliance.ts:422-435 |
| `RHW23-PARTICULARS-REQUIRED` | `wales_fault_grounds`, `wales_breach_particulars` | Grounds selected but no particulars | evaluate-notice-compliance.ts:437-450 |

---

## Scotland Notice to Leave - Have vs Need

### Required Canonical Facts

| Fact Key | MSQ Question ID | Maps To | dependsOn | Status |
|----------|-----------------|---------|-----------|--------|
| `scotland_ground_codes` | `scotland_grounds` | `scotland_ground_codes` | None | ✅ Present |
| `scotland_ground_particulars` | `scotland_ground_particulars` | `scotland_ground_particulars` | None | ✅ Present |
| `landlord_registration_number` | `scotland_landlord_registration` | `landlord_registration_number` | None | ✅ Present |
| `pre_action_confirmed` | `scotland_pre_action` | `issues.rent_arrears.pre_action_confirmed` | Ground 1 selected | ✅ Correct |
| `notice_service_date` | `notice_service` | `notice_service.notice_date` | None | ✅ Present |
| `notice_expiry_date` | `notice_service` | `notice_service.notice_expiry_date` | None | ✅ Present |

### NTL Route-Invalidating Rules

| Rule Code | Fact Dependencies | Blocking Condition | Source |
|-----------|-------------------|-------------------|--------|
| `NTL-GROUND-REQUIRED` | `scotland_ground_codes` | No grounds selected | evaluate-notice-compliance.ts:452-465 |
| `NTL-PRE-ACTION` | `scotland_ground_codes`, `pre_action_confirmed` | Ground 1 selected && `pre_action_confirmed=false` | evaluate-notice-compliance.ts:467-490 |
| `NTL-NOTICE-PERIOD` | `scotland_ground_codes`, `notice_expiry_date` | Notice period insufficient (28/84 days) | evaluate-notice-compliance.ts:492-520 |

---

## Identified Issues

### Issue 1: Incorrect `dependsOn` for `prescribed_info_given` (HIGH SEVERITY)

**File:** `config/mqs/notice_only/england.yaml`
**Question ID:** `prescribed_info_given`

**Current Behavior:**
```yaml
dependsOn:
  questionId: deposit_taken
  value: true
```

**Expected Behavior:**
```yaml
dependsOn:
  - questionId: deposit_taken
    value: true
  - questionId: deposit_protected_scheme
    value: true
```

**Problem:** Prescribed information is only relevant when:
1. A deposit was taken, AND
2. The deposit is protected in an approved scheme

Currently, if `deposit_taken=true` but `deposit_protected=false`, the wizard still asks about prescribed information. This is semantically incorrect—prescribed information can only be given alongside valid deposit protection.

**Impact:** User confusion; potential for collecting irrelevant data; compliance evaluator expects both conditions.

---

### Issue 2: `deposit_reduced_to_legal_cap_confirmed` Shows Unconditionally for S21 (MEDIUM SEVERITY)

**File:** `config/mqs/notice_only/england.yaml`
**Question ID:** `deposit_reduced_to_legal_cap_confirmed`

**Current Behavior:**
```yaml
dependsOn:
  - questionId: deposit_taken
    value: true
  - questionId: selected_notice_route
    value: section_21
```

**Expected Behavior:**
Should only show when deposit actually exceeds the cap (calculated from `rent_amount` and `rent_frequency`).

**Problem:** The question always appears for S21 with a deposit, even when the deposit is well under the legal cap. This creates unnecessary friction.

**Recommended Fix:** Either:
- A) Calculate cap dynamically in UI and hide if within cap (preferred)
- B) Show with clear context that it only applies if cap exceeded (current approach is okay but suboptimal)

---

### Issue 3: Missing Orphan Fact Clearing (MEDIUM SEVERITY)

**Files:** All MSQ configs + wizard save logic

**Problem:** When a controlling answer changes, dependent facts are not cleared.

| Controlling Fact | Dependent Facts That Should Clear |
|-----------------|----------------------------------|
| `deposit_taken=false` | `deposit_amount`, `deposit_protected`, `prescribed_info_given`, `deposit_reduced_to_legal_cap_confirmed` |
| `has_gas_appliances=false` | `gas_certificate_provided` |
| `is_fixed_term=false` | `fixed_term_end_date` |
| `has_rent_arrears=false` | `arrears_total`, `arrears_from_date` |

**Impact:**
- Stale data persists in `caseFacts`
- Compliance evaluator may reference orphaned facts
- Templates may include incorrect information

**Recommended Fix:** Implement a `clearDependentFacts()` function in the wizard save flow that removes orphaned facts when controlling answers change.

---

### Issue 4: Type Inconsistency for Numeric Facts (LOW SEVERITY)

**Affected Facts:** `deposit_amount`, `rent_amount`, `arrears_total`

**Problem:** MSQ uses `inputType: currency` which stores values as strings (e.g., `"2500"`). The compliance evaluator expects numbers.

**Current Mitigation:** `evaluate-notice-compliance.ts` has coercion logic at line 70-85.

**Recommendation:** Ensure all numeric coercion is robust; add tests for string inputs.

---

### Issue 5: Legacy "Fix Before Generating Notice" UI Component (MEDIUM SEVERITY)

**File:** `src/components/ui/ValidationErrors.tsx`

**Problem:** The `ValidationErrors` component renders a global list of issues with the title "📋 Fix before generating notice" for all products, including `notice_only`.

**Required Change:** For `product=notice_only`:
- Do NOT render the global list in the wizard
- Replace with step-scoped inline guidance
- Preview page should show a notice-only-specific message pointing back to relevant steps

**Location of Issue:** Lines 25-45 render the global validation list unconditionally.

---

## Route-Invalidating Rules Summary

### When to Block Next (After Save) - By Route

#### England Section 21

| Blocking Condition | Suggested Alternative Route | Modal Message |
|-------------------|----------------------------|---------------|
| `deposit_protected=false` (when `deposit_taken=true`) | Section 8 | "Deposit not protected in an approved scheme. You cannot use Section 21 without valid deposit protection." |
| `prescribed_info_given=false` (when deposit protected) | Section 8 | "Prescribed information was not provided to the tenant. Section 21 is blocked." |
| `gas_certificate_provided=false` (when `has_gas_appliances=true`) | Section 8 | "Gas safety certificate not provided. Section 21 requires this for properties with gas." |
| `epc_provided=false` | Section 8 | "EPC not provided to tenant. Section 21 is not valid." |
| `how_to_rent_provided=false` | Section 8 | "How to Rent guide not provided. Required for Section 21." |
| `property_licensing_status='unlicensed'` | Section 8 | "Property requires licensing but is unlicensed. Section 21 is blocked." |
| `deposit_exceeds_cap` without confirmation | Section 8 | "Deposit exceeds legal cap. Confirm reduction or use Section 8." |

#### England Section 8

| Blocking Condition | Modal Message |
|-------------------|---------------|
| No grounds selected | "You must select at least one ground for possession." |
| Particulars incomplete for selected grounds | "Please complete the particulars for all selected grounds." |

#### Wales Section 173

| Blocking Condition | Suggested Alternative Route | Modal Message |
|-------------------|----------------------------|---------------|
| `wales_contract_category='supported_standard'` or `'secure'` | Fault-based | "Section 173 is only available for standard occupation contracts." |
| `rent_smart_wales_registered=false` | Fault-based | "You must be registered with Rent Smart Wales to serve Section 173." |
| `deposit_protected=false` (when deposit taken) | Fault-based | "Deposit not protected. Section 173 is blocked." |
| Service within first 6 months | Wait or fault-based | "Cannot serve Section 173 within first 6 months of contract." |

#### Wales Fault-Based

| Blocking Condition | Modal Message |
|-------------------|---------------|
| No grounds selected | "You must select at least one breach or estate management ground." |

#### Scotland Notice to Leave

| Blocking Condition | Modal Message |
|-------------------|---------------|
| No grounds selected | "You must select at least one Schedule 3 ground." |
| `pre_action_confirmed=false` for Ground 1 | "Pre-action requirements must be completed for rent arrears eviction." |

---

## Appendix: MSQ Question Order by Jurisdiction

### England (`config/mqs/notice_only/england.yaml`)

1. `landlord_details` (group)
2. `selected_notice_route` (radio: section_21, section_8)
3. `tenant_full_name` (text)
4. `property_details` (group)
5. `tenancy_start_date` (date)
6. `is_fixed_term` (yes_no)
7. `fixed_term_end_date` (date) - dependsOn: is_fixed_term
8. `rent_terms` (group)
9. `section21_intro` (info) - dependsOn: route=section_21
10. `deposit_taken` (yes_no)
11. `deposit_amount` (currency) - dependsOn: deposit_taken
12. `deposit_reduced_to_legal_cap_confirmed` (select) - dependsOn: deposit_taken + route=section_21
13. `has_gas_appliances` (yes_no)
14. `deposit_protected_scheme` (yes_no) - dependsOn: deposit_taken
15. `prescribed_info_given` (yes_no) - dependsOn: deposit_taken ⚠️
16. `gas_safety_certificate` (yes_no) - dependsOn: has_gas_appliances
17. `epc_provided` (yes_no)
18. `how_to_rent_info` (info)
19. `how_to_rent_provided` (yes_no)
20. `property_licensing` (select)
21. `recent_repair_complaints_s21` (yes_no)
22. `has_rent_arrears` (yes_no) - dependsOn: route=section_8
23. `arrears_details` (group) - dependsOn: has_rent_arrears
24. `section8_grounds_selection` (multi_select) - dependsOn: route=section_8
25. `ground14_severity` (select) - dependsOn: Ground 14 selected
26. `ground_particulars` (textarea) - dependsOn: route=section_8
27. `notice_strategy` (select) - dependsOn: route=section_8
28. `notice_service` (group)

### Wales (`config/mqs/notice_only/wales.yaml`)

1. `landlord_details` (group)
2. `selected_notice_route` (radio: wales_section_173, wales_fault_based)
3. `wales_contract_category` (select)
4. `tenant_full_name` (text)
5. `property_details` (group)
6. `rent_smart_wales_registered` (yes_no)
7. `rent_smart_wales_number` (text) - dependsOn: registered=true
8. `wales_contract_start_date` (date)
9. `deposit_taken` (yes_no)
10. `deposit_amount` (currency) - dependsOn: deposit_taken
11. `deposit_protected` (yes_no) - dependsOn: deposit_taken
12. `prescribed_info_given` (yes_no) - dependsOn: deposit_taken
13. `wales_fault_based_section` (multi_select) - dependsOn: route=fault_based
14. `wales_fault_particulars` (textarea) - dependsOn: route=fault_based
15. `notice_service` (group)

### Scotland (`config/mqs/notice_only/scotland.yaml`)

1. `landlord_details` (group)
2. `scotland_landlord_registration` (text)
3. `tenant_full_name` (text)
4. `property_details` (group)
5. `scotland_tenancy_start_date` (date)
6. `deposit_taken` (yes_no)
7. `deposit_amount` (currency) - dependsOn: deposit_taken
8. `scotland_grounds` (multi_select)
9. `scotland_ground_particulars` (textarea)
10. `scotland_pre_action` (yes_no) - dependsOn: Ground 1 selected
11. `notice_service` (group)

---

## End of Audit

**Next Steps:**
1. Phase 1: Fix crash bugs in `normalizeFacts.ts` and `evaluate-notice-compliance.ts`
2. Phase 2: Implement step-scoped guidance and route-invalidating modal
3. Phase 3: Fix MSQ `dependsOn` rules and implement fact clearing
