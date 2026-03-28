# England Tenancy Agreements Compliance Matrix

Last updated: 2026-03-27

## Scope

This matrix tracks the modern England tenancy-agreement products against the post-1 May 2026 assured-tenancy written-information baseline and the product-specific resident-landlord route.

Products covered:

- `england_standard_tenancy_agreement`
- `england_premium_tenancy_agreement`
- `england_student_tenancy_agreement`
- `england_hmo_shared_house_tenancy_agreement`
- `england_lodger_agreement`

Notes:

- The assured-tenancy statutory layer applies to Standard, Premium, Student, and HMO / Shared House.
- Lodger is intentionally separate and should be reviewed against resident-landlord / excluded-occupier guidance, not the assured-tenancy baseline.
- This is an implementation and QA artifact, not a substitute for solicitor sign-off.

## Assured Tenancy Matrix

| Topic | Standard | Premium | Student | HMO / Shared | Primary implementation |
| --- | --- | --- | --- | --- | --- |
| Landlord, tenant, property, and start details | Yes | Yes | Yes | Yes | `buildEnglandAssuredSections()` main particulars block |
| Rent amount, period, due day, payment method | Yes | Yes | Yes | Yes | `buildEnglandAssuredSections()` rent block |
| Section 13-compatible rent increase wording | Yes | Yes | Yes | Yes | `buildEnglandAssuredSections()` rent block |
| Bills included and separate bill treatment | Yes | Yes | Yes | Yes | `buildEnglandAssuredSections()` bill treatment + separate bill bullets |
| Deposit amount, scheme, and reference placeholders | Yes | Yes | Yes | Yes | `buildEnglandAssuredSections()` deposit block + deposit support docs |
| Tenant notice wording | Yes | Yes | Yes | Yes | `buildEnglandAssuredSections()` tenant ending block |
| Landlord-ending / possession-process wording | Yes | Yes | Yes | Yes | `buildEnglandAssuredSections()` landlord ending block |
| Prior-notice grounds | Yes | Yes | Yes | Yes | `buildEnglandAssuredSections()` prior-notice block |
| Fitness for human habitation and repair wording | Yes | Yes | Yes | Yes | `buildEnglandAssuredSections()` repairs block |
| Electrical safety wording | Yes | Yes | Yes | Yes | `buildEnglandAssuredSections()` repairs block |
| Gas safety wording where relevant | Yes | Yes | Yes | Yes | `buildEnglandAssuredSections()` repairs block |
| Disability adaptations wording | Yes | Yes | Yes | Yes | `buildEnglandAssuredSections()` pets / adaptations block |
| Pets / unreasonable refusal wording | Yes | Yes | Yes | Yes | `buildEnglandAssuredSections()` pets / adaptations block |
| Pre-tenancy compliance checklist | Yes | Yes | Yes | Yes | `pre_tenancy_checklist_england` |
| Keys / handover support | Yes | Yes | Yes | Yes | `england_keys_handover_record` |
| Utilities / meter handover support | Yes | Yes | Yes | Yes | `england_utilities_handover_sheet` |
| Pet request support document | Yes | Yes | Yes | Yes | `england_pet_request_addendum` |
| Variation / update support document | Yes | Yes | Yes | Yes | `england_tenancy_variation_record` |
| Product-specific schedule depth | Baseline | Premium management schedule | Student move-out schedule | HMO rules appendix | product-specific support docs |

## Product-Specific Depth Matrix

| Product | Material differentiation target | Current implementation |
| --- | --- | --- |
| Standard | Ordinary whole-property baseline | Core assured-tenancy statutory layer plus baseline operational terms |
| Premium | Fuller ordinary-residential management drafting | Premium controls step, premium management schedule, repairs/access/key/handover detail |
| Student | Sharer, guarantor, replacement, and end-of-term workflow | Student-specific wizard fields, student clauses, move-out / guarantor schedule |
| HMO / Shared | Communal areas, sharers, house rules, and HMO operations | HMO-specific wizard fields, HMO clauses, house-rules appendix |
| Lodger | Resident-landlord room let and house rules | Separate lodger agreement, checklist, handover record, and house-rules appendix |

## Transition / Existing Tenancy Paths

| Path | Document strategy |
| --- | --- |
| `new_agreement` | Main agreement pack |
| `existing_verbal_tenancy` | `England Written Statement of Terms` plus support docs |
| `existing_written_tenancy` | `England Tenancy Transition Guidance` plus `Renters' Rights Act Information Sheet 2026` |

## Review Status

- Internal implementation pass completed: 2026-03-27
- Solicitor clause review: pending
- Marketing claim allowed: do not market as "solicitor-grade" until solicitor sign-off is recorded
