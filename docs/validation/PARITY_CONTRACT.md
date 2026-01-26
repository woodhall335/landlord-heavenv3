# Smart Validation Parity Contract

This document defines the contract for parity between the TypeScript validators and the YAML rules engine.

## What "Parity" Means

Parity is achieved when both systems produce **equivalent validation results** for the same input. Specifically:

### 1. Blocker ID Matching

- **Normalized IDs**: Rule IDs are normalized (lowercase, underscores) before comparison
- **Mapping**: YAML rule IDs map to TS codes via `TS_TO_YAML_ID_MAP` in `shadow-mode-adapter.ts`
- **Example**: TS `S21-DEPOSIT-NONCOMPLIANT` maps to YAML `s21_deposit_noncompliant`

### 2. Severity Matching

- **Blockers**: Must match exactly - both systems must agree on what blocks generation
- **Warnings**: Must match for parity score, but mismatches don't break generation

### 3. Blocker Count

- Both systems must produce the **same number of blockers** (after deduplication)
- A difference in blocker count indicates a parity failure

### 4. Deduplication Rules

When multiple rules fire for the same root cause:
- TS validator may consolidate into a single code
- YAML engine fires each rule independently
- Shadow mode adapter normalizes by mapping YAML IDs to TS equivalents

## Parity Thresholds by Jurisdiction

| Jurisdiction | Product | Required Parity | Notes |
|-------------|---------|-----------------|-------|
| England | notice_only | 100% | All rules must match |
| England | complete_pack | 100% | All rules must match |
| Wales | notice_only | 100%* | *See Wales Exception below |
| Scotland | notice_only | 100% | All rules must match |

## Wales S173 Exception: Extra Granular Blockers

**Intentional Divergence**: The Wales S173 YAML configuration may fire additional, more granular blockers that provide better UX feedback to users.

### Example

When dates are missing for Wales S173:
- **TS** fires: `S173-NOTICE-PERIOD-UNDETERMINED` (1 blocker)
- **YAML** fires:
  - `contract_start_date_required`
  - `notice_service_date_required`
  - `s173_notice_period_undetermined`

This is **acceptable** because:
1. YAML provides more actionable feedback to users
2. Both systems agree the case has blockers (cannot proceed)
3. The parity check considers this a match when TS blockers ≤ YAML blockers

### Contract for Wales Exception

```typescript
// Wales parity passes if:
// 1. Both have same blockers (exact match), OR
// 2. YAML has MORE blockers and they include all TS blockers (superset)
function walesParityCheck(ts: ValidationResult, yaml: ValidationResult): boolean {
  if (ts.blockers === yaml.blockers) return true;
  if (yaml.blockers > ts.blockers) {
    // YAML may fire extra granular rules - acceptable
    return ts.blockerIds.every(id => yaml.blockerIds.includes(id));
  }
  return false;
}
```

## Rule Count Expectations

These counts are tracked to detect unintentional changes:

| Jurisdiction | Product | Min Rules | Notes |
|-------------|---------|-----------|-------|
| England | notice_only | 25 | Full S21 + S8 coverage |
| England | complete_pack | 20 | Subset of notice_only rules |
| Wales | notice_only | 15 | S173 + fault-based |
| Scotland | notice_only | 10 | NTL only |

**CI Gate**: Rule count changes require an update to this document and explicit acknowledgment in the commit message.

## Parity Test Coverage

All parity tests are in `tests/validation/shadow-mode-parity.test.ts`:

### England Section 21 (notice_only)
- Deposit protection: `deposit_not_protected`, `prescribed_info_not_given`
- Safety compliance: `epc_not_provided`, `gas_cert_not_provided`, `how_to_rent_not_provided`
- Retaliatory eviction: `improvement_notice_served`
- Four-month bar: `four_month_bar`
- Valid case: fully compliant

### England Section 8 (notice_only)
- Grounds selection: `no_grounds_selected`
- Ground 8 threshold (TS doesn't check in notice_only)
- Mixed grounds: mandatory, discretionary, combined
- Valid cases: Ground 8, Ground 14, Ground 12

### England Complete Pack (S21 + S8)
- Common rules: `missing_landlord_name`, `missing_tenant_name`, `missing_property_address`
- Date rules: `missing_tenancy_start_date`, `missing_notice_service_date`
- S21 deposit: `s21_deposit_not_protected`, `s21_prescribed_info_missing`
- S21 safety: `s21_epc_missing`, `s21_gas_cert_missing`, `s21_how_to_rent_missing`
- S21 retaliatory: `s21_retaliatory_eviction_risk`
- S8 grounds: `s8_no_grounds`, `s8_no_particulars`, `s8_arrears_ground_no_data`
- Valid cases: fully compliant S21, fully compliant S8

### Wales Section 173 (notice_only)
- RSW registration: `s173_licensing`
- Six-month bar: `s173_period_bar`
- Notice period undetermined (with extra granular rules)
- Valid case: fully compliant

### Scotland Notice to Leave (notice_only)
- Grounds selection: `ntl_ground_required`
- Pre-action requirements: `ntl_pre_action`
- Non-arrears grounds: Ground 12
- Valid case: fully compliant

## Cutover Plan

See `docs/validation/CUTOVER_PLAN.md` for the production rollout strategy.

## Updating This Contract

1. Any changes to parity definitions require PR review
2. New exceptions must be documented with rationale
3. Rule count changes must update the table above
4. CI gates enforce this contract automatically
