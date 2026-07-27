# Standard tenancy wizard-to-document traceability

Date: 27 July 2026

This records the customer questions that control the branded model-derived
agreements. Official documents are legal specifications only; they are not used
as customer-facing PDF overlays.

## Wales

| Wizard facts | Generated location |
|---|---|
| `is_fixed_term`, `term_length`, `tenancy_end_date` | Selects periodic or fixed template; fixed key matters |
| `occupation_exclusion_applies`, exclusion dates | Conditional Welsh key matter |
| landlord and joint-landlord details | Parties, statutory contact and execution |
| contract-holder details | Parties and execution |
| dwelling and occupation date | Key matters |
| rent, period, first payment/date and due day | Key matters |
| deposit amount and scheme | Key matters |
| Rent Smart Wales registration | Key matters |
| written-statement confirmation/date | Checkout validation and compliance workflow |

The standard flow does not collect a break clause, custom rent-review formula or
free-text bespoke legal terms.

## Scotland

| Wizard facts | Generated location |
|---|---|
| tenant names, addresses, email and telephone | Clause 1 key details and execution |
| landlord(s), address, contacts and registration | Clause 3 key details and execution |
| agent registration, services and contact matters | Clause 2 |
| `communication_method` | Clause 4 |
| property address/type; included/shared/excluded areas | Clause 5 |
| furnishing, RPZ and HMO status | Clause 5 |
| `tenancy_start_date` | Clause 6; always open-ended |
| rent period/timing, first payment and coverage | Clause 8 |
| rent-included services and payment method | Clause 8 |
| deposit amount, scheme and contact | Clause 11 |
| `inventory_delivery_method` | Clause 25 |
| `tenant_utility_accounts` | Clause 27 |

The standard flow does not collect a fixed term, minimum period, break clause,
rent formula, free-text additional legal terms or guarantor provision.

## Certification boundary

Automated tests verify template selection, required question IDs, Welsh variant
separation, the fixed Welsh 1–56 term sequence and the Scottish 7–39 clause
sequence. These checks do not replace jurisdiction-specific solicitor approval.
