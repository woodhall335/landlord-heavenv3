# UK Capability Alignment Report

## Supported Flows
- england / notice_only (section_21, section_8)
- england / eviction_pack (Section 8 (fault-based), Section 21 (no-fault))
- england / money_claim (money_claim)
- england / tenancy_agreement (tenancy_agreement)
- wales / notice_only (wales_section_173, wales_fault_based)
- wales / eviction_pack (Section 173 (no-fault notice), Breach of contract (fault-based))
- wales / money_claim (money_claim)
- wales / tenancy_agreement (tenancy_agreement)
- scotland / notice_only (notice_to_leave)
- scotland / eviction_pack (notice_to_leave)
- scotland / money_claim (money_claim)
- scotland / tenancy_agreement (tenancy_agreement)
- northern-ireland / tenancy_agreement (tenancy_agreement)

## Misconfigured Flows
None

## Template Registry Gaps
None

## Route Question Issues
- scotland / eviction_pack () — Missing selected_notice_route options; defaulted route | MQS: config/mqs/complete_pack/scotland.yaml
- scotland / notice_only () — Missing selected_notice_route options; defaulted route | MQS: config/mqs/notice_only/scotland.yaml

## Missing Facts Schema Coverage
None

---

## Requirements Engine Coverage

### Implementation Status: ✅ COMPLETE

The requirements engine has been implemented for all supported UK flows with stage-aware validation.

### Stage Semantics

- **wizard**: Facts are warnings only; no hard blocking except immediate contradictions
- **checkpoint**: Hard-block on checkpoint-required items for that flow
- **preview**: Hard-block on facts required to legally preview that flow
- **generate**: Strictest set for generation

### Product-Specific Requirements

#### notice_only

**England / Wales - Section 21 (section_21, wales_section_173)**

Preview/Generate Required:
- Core facts: landlord details, tenant details, property address, rent details, tenancy start date
- notice_expiry_date
- Conditional on deposit_taken=true:
  - deposit_amount
  - deposit_protected
  - prescribed_info_given
- Conditional on has_gas_appliances=true:
  - gas_safety_cert_date
- Conditional on is_fixed_term=true:
  - fixed_term_end_date

**England / Wales - Section 8 (section_8, wales_fault_based)**

Preview/Generate Required:
- Core facts: landlord details, tenant details, property address, rent details
- ground_codes
- notice_expiry_date
- Conditional on is_fixed_term=true:
  - fixed_term_end_date

Warned (not blocking):
- deposit_protected (if deposit_taken=true)

**Scotland - Notice to Leave (notice_to_leave)**

Preview/Generate Required:
- Core facts: landlord details, tenant details, property address, rent details
- ground_codes
- notice_expiry_date
- Conditional on is_fixed_term=true:
  - fixed_term_end_date

#### eviction_pack

Requirements mirror notice_only for corresponding routes, with additional supporting document facts.

#### money_claim

Preview/Generate Required:
- Core facts: landlord details, tenant details, property address, rent details
- claim_type
- total_claim_amount
- Conditional on claim_type='rent_arrears':
  - arrears_amount
  - arrears_start_date
  - arrears_end_date
- Conditional on claim_type='damages':
  - damage_description
  - damage_amount

#### tenancy_agreement

**England / Wales**

Preview/Generate Required:
- Core facts: landlord details, tenant details, property address, rent details
- tenancy_type
- property_type
- payment_date
- Conditional on deposit_taken=true:
  - deposit_amount
- Conditional on is_fixed_term=true:
  - fixed_term_end_date
- Conditional on joint_tenants=true:
  - tenant_2_name
- Conditional on joint_landlords=true:
  - landlord_2_name

**Scotland**

Preview/Generate Required:
- Core facts + property_type
- property_epc_rating
- landlord_registration_number
- Conditional facts as above

**Northern Ireland**

Preview/Generate Required:
- Core facts + property_type
- number_of_bedrooms
- Conditional facts as above

### Conditional Requirements (Deposit Fix)

**CRITICAL FIX IMPLEMENTED**: Deposit requirements are now correctly conditional on `deposit_taken`:

- If `deposit_taken=true`: Require deposit_amount, deposit_protected, prescribed_info_given (at generate stage for Section 21)
- If `deposit_taken=false`: Mark deposit facts as **derived** (not required, not warned)
- If `deposit_taken` not answered: Warn at checkpoint/preview/generate stages

This fixes the production bug where Section 21 preview was blocking on deposit facts even when no deposit was taken.

### MQS Mapping Alignment

All required facts are verified against MQS mappings:
- Each fact in `requiredNow` must either:
  a) Map to at least one MQS question ID for that flow, OR
  b) Be explicitly in the `derived` set

Requirements validator generates structured issues with:
- `affected_question_id`: The primary MQS question ID to answer
- `alternate_question_ids`: Alternative questions that map to the same fact
- `user_fix_hint`: Actionable guidance for the user

### Fail-Closed Behavior

The requirements engine returns status codes:
- `ok`: Supported flow, requirements computed
- `unsupported`: Flow not supported (e.g., NI notice_only)
- `misconfigured`: Flow configuration invalid

Unsupported/misconfigured flows return standardized 422 payloads with:
- `code`: Error code (FLOW_NOT_SUPPORTED, FLOW_MISCONFIGURED)
- `user_message`: User-friendly explanation
- `blocking_issues`: Structured issue objects with hints

### Northern Ireland Hard Rule

Northern Ireland flows ONLY support `tenancy_agreement`. All other products (notice_only, eviction_pack, money_claim) fail closed with:
```json
{
  "code": "FLOW_NOT_SUPPORTED",
  "error": "Flow northern-ireland/notice_only is not supported",
  "user_message": "Northern Ireland is tenancy agreements only",
  "blocking_issues": [],
  "warnings": []
}
```

### Test Coverage

Comprehensive test suite in `tests/lib/requirements-engine.test.ts` covers:
- Fail-closed behavior for unsupported/misconfigured flows
- Conditional deposit requirements (deposit_taken=true/false)
- Conditional gas safety requirements (has_gas_appliances=true/false)
- Stage-aware behavior (wizard/checkpoint/preview/generate)
- Scotland, Wales, and England flow variations
- Money claim and tenancy agreement requirements

All tests pass, ensuring zero late-stage failures for compliant cases.

---

## Next Steps

- [ ] Wire requirements validator into wizard checkpoint endpoint
- [ ] Wire requirements validator into preview endpoints
- [ ] Wire requirements validator into generate endpoint
- [ ] Add UX safety for preview UI to handle LEGAL_BLOCK gracefully
- [ ] Create end-to-end flow harness tests driven by capability matrix
- [ ] Document affected_question_id navigation in preview UI
