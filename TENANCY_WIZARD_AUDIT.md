# Tenancy Wizard Audit (End-to-End)

## Scope
Audited tenancy agreement collection, mapping, checkout gate, and fulfillment validation for:
- England AST (standard/premium/HMO)
- Scotland PRT
- Northern Ireland private tenancy
- Wales occupation contract (via AST generator jurisdiction mode)

---

## A) Required Facts Matrix (Source of Truth from Code)

## 1) Generator validation required fields

| Jurisdiction / Generator | Required fields in generator validation | Notes |
|---|---|---|
| England/Wales AST (`validateASTData`) | `landlord_full_name`, `landlord_address`, `landlord_email`, `landlord_phone`, `tenants[].full_name`, `tenants[].email`, `tenants[].phone`, `property_address`, `tenancy_start_date`, `rent_amount > 0`, `deposit_amount >= 0`; for fixed-term: `tenancy_end_date`, `term_length` | `deposit_amount = 0` is valid. |
| Scotland PRT (`validatePRTData`) | `landlord_full_name`, `landlord_address`, `property_address`, `tenancy_start_date`, `tenants[]` non-empty, `rent_amount > 0`, `deposit_amount >= 0`; tenant contact requires at least email or phone; deposit scheme required when deposit > 0 | Adds warning-level requirement for `landlord_reg_number` but still blocks because warnings are in same error array. |
| Northern Ireland (`validatePrivateTenancyData`) | `landlord.full_name`, `landlord.address`, `tenants[]` non-empty and tenant `full_name`, `property_address`, `agreement_date`, `tenancy_start_date`, fixed-term end date if fixed term, `rent_amount > 0`, `rent_due_day`, `payment_method`, `payment_details`, `deposit_amount >= 0` | Break clause terms required if break clause enabled. |

## 2) Mapper expected input paths (wizard/normalizer)

| Target generator field | Wizard path(s) consumed | Normalized `CaseFacts` path |
|---|---|---|
| Landlord name | `landlord_full_name` | `parties.landlord.name` |
| Landlord address | `landlord_address_line1/town/postcode` or `landlord_address` | `parties.landlord.address_line1/city/postcode` |
| Property address | `property_address_line1/town/postcode` | `property.address_line1/city/postcode` |
| Start date | `tenancy_start_date` | `tenancy.start_date` |
| End date | `tenancy_end_date` / `fixed_term_end_date` | `tenancy.end_date` |
| Rent | `rent_amount`, `rent_period`, `rent_due_day` | `tenancy.rent_amount`, `tenancy.rent_frequency`, `tenancy.rent_due_day` |
| Deposit | `deposit_amount`, `deposit_scheme_name` | `tenancy.deposit_amount`, `tenancy.deposit_scheme_name` |
| Tenants | `tenants.*` | `parties.tenants[]` |
| HMO flag | `is_hmo` | `property.is_hmo` |

## 3) Fulfillment / entitlement validation

- Checkout gate for tenancy products now uses shared validator for missing/invalid fields.
- Fulfillment pre-generation gate uses the same shared validator.
- Wizard review step now uses same validator as a final pre-check blocker.

---

## B) Wizard Step → Facts Mapping

| Wizard section | Main fields captured | Persists to |
|---|---|---|
| Property | `property_address_line1`, `property_address_town`, `property_address_postcode`, `property_type` | `cases.collected_facts.*` then normalized to `case_facts.property.*` |
| Landlord | `landlord_full_name`, `landlord_email`, `landlord_phone`, `landlord_address_line1/town/postcode`; Scotland `landlord_registration_number` | `collected_facts.*` -> `case_facts.parties.landlord.*` |
| Tenants | `number_of_tenants`, `tenants[i].full_name/dob/email/phone`, HMO signals | `collected_facts.tenants[]` -> `case_facts.parties.tenants[]` |
| Tenancy | `tenancy_start_date`, `is_fixed_term`, `tenancy_end_date`, `term_length` | `collected_facts.*` -> `case_facts.tenancy.*` |
| Rent | `rent_amount`, `rent_period`, `rent_due_day`, `payment_method`, `payment_details` | `collected_facts.*` -> `case_facts.tenancy.*` |
| Deposit | `deposit_amount`, `deposit_scheme_name` | `collected_facts.*` -> `case_facts.tenancy.*` |
| Review | now enforces shared validator as blocker | N/A |

---

## C) Failure Modes Table

| Failure mode | Origin step | Failure point | Best prevention |
|---|---|---|---|
| Missing `deposit_amount` | Deposit step skipped/incomplete | checkout 400 or fulfillment blocked | Wizard review blocker + checkout gate + fulfillment gate |
| `deposit_amount` as empty string/null | Deposit step | generator strict numeric checks | shared validator coerces/flags invalid/missing |
| `deposit_amount = 0` treated as missing | Deposit step | historical falsy checks | explicit null/undefined check in shared validator |
| Empty tenants array | Tenants step | generator validation fail | shared validator requires non-empty tenants |
| Tenant fields missing (`email/phone`) | Tenants step | AST generator hard fails | shared validator flags per-tenant required contact |
| Unparseable dates | Tenancy step | generator/date logic downstream | shared validator marks invalid date at boundary |
| Missing landlord details | Landlord step | generator hard fail | shared validator required strings with trim check |
| Missing property address components | Property step | generator hard fail | shared validator enforces line1/town/postcode |
| Fixed-term without end/term length | Tenancy step | AST/NI generator fail | shared validator conditional fixed-term checks |
| Scotland missing landlord registration | Landlord step | PRT generation compliance fail | shared validator jurisdiction-specific requirement |
| NI missing payment core fields | Rent step | NI generator fail | shared validator jurisdiction-specific requirement |

---

## D) Recommendations + Priority

### P0 (implemented)
1. Single shared tenancy validator used by wizard review, checkout, and fulfillment.
2. Stronger handling for empty-string required fields and invalid date/number types.
3. Preserve `deposit_amount = 0` validity.
4. Tenant array + per-tenant contact validation.

### P1
1. Add section-level inline blockers (not just review step) for invalid date/number format.
2. Add explicit HMO inference audit logging when inferred from tenant relationships.

### P2
1. Extend validator output to include expected JSON path metadata (`facts.tenancy.*`, etc.) for UX messaging.
2. Add telemetry for top missing/invalid field patterns to prioritize UX improvements.

---

## E) Implemented Code Changes Summary

- Replaced narrow tenancy required-field checker with shared multi-jurisdiction validator.
- Wired checkout `/api/checkout/create` tenancy gate to shared validator and return `invalid_fields`.
- Wired fulfillment tenancy pre-generation gate to same shared validator.
- Added review-step wizard blocker using same shared validator.
- Added unit tests for null/undefined/empty string/type/date/tenant handling and jurisdiction-specific requirements.
- Added checkout route-level test for 400 with `missing_fields`.
- Added generator smoke tests for England AST, Scotland PRT, Northern Ireland private tenancy.
