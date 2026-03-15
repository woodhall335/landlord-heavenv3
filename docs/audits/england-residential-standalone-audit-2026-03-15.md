# England Residential Standalone Document Audit

Date: 15 March 2026
Scope: England-only residential standalone landlord documents
Products reviewed:

1. `guarantor_agreement`
2. `residential_sublet_agreement`
3. `lease_amendment`
4. `lease_assignment_agreement`
5. `rent_arrears_letter`
6. `repayment_plan_agreement`
7. `residential_tenancy_application`
8. `rental_inspection_report`
9. `inventory_schedule_condition`
10. `flatmate_agreement`
11. `renewal_tenancy_agreement`

## Executive Summary

This audit found three material issues in the original residential standalone set:

1. Several products were generated from a generic agreement shell and did not contain document-specific legal structure at paid-document standard.
2. The arrears-letter product used wording that overstated protocol compliance and risked aggressive or inaccurate pre-action language.
3. The wizard did not collect enough product-specific facts for several documents, and in some cases collected them under keys the generator did not read.

The codebase has now been upgraded so each standalone product has a stronger clause structure, better execution wording, and more complete wizard capture. The main remaining product-level redesign issue is `renewal_tenancy_agreement` because the Renters' Rights Act 2025 changes due on 1 May 2026 materially reduce the long-term suitability of a fixed-term renewal product for England assured tenancies.

## Compliance Summary

- Housing Act 1988: Supporting instruments are now framed around tenancy obligations and do not attempt to masquerade as prescribed notices.
- Landlord and Tenant Act 1985: Inspection and inventory products now read as evidential tenancy-management records rather than casual checklists.
- Protection from Eviction Act 1977: Arrears correspondence has been revised to remain professional and non-harassing.
- Consumer Rights Act 2015: Inventory wording and agreement drafting have been tightened to reduce unfair or overreaching consumer terms.
- Pre-Action Protocol for Debt Claims: The arrears-letter product now makes clear that a final warning is not automatically a full protocol-compliant Letter of Claim.
- Deposit protection rules: Assignment, renewal, repayment, and inventory outputs now flag proper deposit-scheme handling rather than assuming informal transfer mechanics.
- Common law variation and assignment principles: Amendment and assignment products now reference the original tenancy and preserve non-varied terms.

## Significant Redesign Flags

- `renewal_tenancy_agreement`
  Reason: from 1 May 2026, most new and existing PRS assured tenancies in England move into the assured periodic regime. This product should either be sunset, heavily caveated, or repositioned as a legacy/pre-1 May 2026 or specialist use document.
- `rent_arrears_letter`
  Reason: if the commercial promise is "letter before action" or "protocol-compliant debt letter", it needs a separate guided flow with annexes, statement of account logic, reply-form handling, and 30-day PAP timing.
- `inventory_schedule_condition`
  Reason: the current product is structurally strong as a professional blank/pro-form schedule, but the wizard still does not collect room-by-room item-level inventory data at solicitor-grade completion level.

## Document Audit

### 1. Guarantor Agreement

- Compliance assessment: materially improved. The product now reads as a deed of guarantee and indemnity with witness execution, continuing-liability language, and direct landlord recourse.
- Missing clauses or risks: still depends on user choice for any liability cap and continuation after variation. If the business wants deed-only output, the wizard should make execution as deed mandatory and explicit.
- Recommended legal improvements: keep joint and several wording, indemnity wording, and landlord direct enforcement wording. Retain caution that renewal/variation survival should be deliberate and transparent.
- Revised clause structure:
  1. Definitions and tenancy background
  2. Guarantor covenant
  3. Nature of liability
  4. Continuing guarantee and variations
  5. Notices and information
  6. Limitation or cap
  7. Governing law
  8. Execution as deed
- Additional wizard data:
  - `guarantee_cap_amount`
  - `guarantee_commencement_date`
  - `guarantee_continues_after_renewal`

### 2. Residential Sublet Agreement

- Compliance assessment: improved and now properly distinguishes the head tenancy and subtenancy.
- Missing clauses or risks: landlord consent detail remains critical. Without clear superior-consent facts, the document cannot guarantee lawful subletting.
- Recommended legal improvements: keep express head-tenant continuing liability, permitted-use wording, and termination mechanics tied to the head tenancy.
- Revised clause structure:
  1. Head tenancy and consent status
  2. Grant of subtenancy
  3. Rent, deposit, and payments
  4. Subtenant covenants and house rules
  5. Head tenant continuing liability
  6. Termination and consequences
  7. Governing law
- Additional wizard data:
  - `head_tenant_name`
  - `landlord_consent_reference`
  - `landlord_consent_date`
  - `sublet_rent`
  - `sublet_deposit`
  - richer permitted-use / house-rule capture if a more complete subletting product is desired

### 3. Lease Amendment

- Compliance assessment: improved. The product now references the original tenancy and is drafted as a targeted variation rather than an informal replacement.
- Missing clauses or risks: the user still needs to identify the clause being amended with enough precision to avoid ambiguity.
- Recommended legal improvements: preserve "all other terms remain unchanged", avoid language suggesting surrender and regrant, and encourage exact replacement text where possible.
- Revised clause structure:
  1. Existing tenancy details
  2. Effective date
  3. Clauses amended
  4. Replacement wording / agreed variation
  5. Confirmation all other terms remain unchanged
  6. Governing law
- Additional wizard data:
  - `amended_clauses_reference`
  - `replacement_clause_text`
  - `amendment_title`

### 4. Lease Assignment Agreement

- Compliance assessment: improved. The product now captures outgoing tenant, incoming tenant, assignment date, consent, and deposit handling.
- Missing clauses or risks: deposit-scheme mechanics remain a practical risk if the deposit is not handled in accordance with scheme rules and prescribed information.
- Recommended legal improvements: keep express incoming-tenant covenant, release logic, and apportionment / key-handover fields.
- Revised clause structure:
  1. Original tenancy and landlord consent
  2. Assignment
  3. Incoming tenant covenant
  4. Release of outgoing tenant
  5. Deposit, apportionments, and handover
  6. Records and governing law
- Additional wizard data:
  - `landlord_consent_reference`
  - `landlord_consent_date`
  - `release_outgoing_tenant`
  - `deposit_treatment`
  - `assignment_apportionments`
  - `assignment_key_handover`

### 5. Rent Arrears Letter

- Compliance assessment: substantially improved. The output is now a professional arrears demand / final warning rather than a pseudo-statutory notice.
- Missing clauses or risks: this is still not a full PAP Letter of Claim product. If marketed that way, the flow remains underpowered.
- Recommended legal improvements: keep arrears schedule, payment instructions, response deadline, and reserved-rights language. Avoid harassment, inflated threats, or false protocol statements.
- Revised clause structure:
  1. Letter metadata and parties
  2. Arrears summary
  3. Payment instructions
  4. Required action / deadlines
  5. Next steps
  6. Protocol note
  7. Closing
- Additional wizard data:
  - `arrears_letter_type`
  - `arrears_periods_missed`
  - `arrears_schedule_attached_reference`
  - `payment_method`
  - `payment_details`
  - if a true PAP product is later built: statement-of-account logic, annex generation, reply-form flow, document enclosure logic

### 6. Repayment Plan Agreement

- Compliance assessment: improved. The product now records arrears acknowledgement, instalments, default consequences, and reservation of rights.
- Missing clauses or risks: the plan remains only as good as the dates and payment method captured in the wizard.
- Recommended legal improvements: keep explicit non-waiver wording and default triggers tied to both instalments and ongoing rent.
- Revised clause structure:
  1. Acknowledgment of arrears
  2. Repayment schedule
  3. Ongoing rent and payment allocation
  4. Default
  5. Reservation of rights
  6. Governing law
- Additional wizard data:
  - `payment_method`
  - `payment_details`
  - `repayment_end_date`
  - `default_grace_days`
  - `default_consequences`

### 7. Residential Tenancy Application

- Compliance assessment: improved. The form now reads as a referencing and pre-tenancy assessment form rather than a sparse lead-capture sheet.
- Missing clauses or risks: if the business wants a more compliance-heavy referencing pack, privacy wording and retention controls may need a dedicated privacy notice cross-reference.
- Recommended legal improvements: keep applicant declaration, referencing authority, landlord-reference section, and adverse-credit disclosure.
- Revised clause structure:
  1. Applicant and proposed letting
  2. Employment and income
  3. Current accommodation and references
  4. Occupiers and disclosures
  5. Referencing and data use
  6. Applicant declaration
- Additional wizard data:
  - `applicant_date_of_birth`
  - `current_landlord_name`
  - `current_landlord_contact`
  - `current_rent_amount`
  - `length_of_occupation`
  - `reason_for_moving`
  - `additional_income_details`
  - `children_count`
  - `adverse_credit_details`

### 8. Rental Inspection Report

- Compliance assessment: improved and now suitable as a dated evidential tenancy-management record.
- Missing clauses or risks: if this product is expected to support deposit disputes routinely, photo and attendance references should be completed consistently.
- Recommended legal improvements: retain room-by-room observations, key and meter records, safety observations, defects, and occupier comments.
- Revised clause structure:
  1. Inspection particulars
  2. Property layout and areas inspected
  3. Keys, utilities, and safety
  4. Room-by-room observations
  5. Cleanliness, defects, and follow-up
  6. Use of report and governing law
  7. Certification and acknowledgement
- Additional wizard data:
  - `meter_reading_gas`
  - `meter_reading_electric`
  - `meter_reading_water`
  - `photo_schedule_reference`
  - `inspection_attended_by`

### 9. Inventory & Schedule of Condition

- Compliance assessment: improved as a professional pro-form. The product no longer relies on overreaching deemed-acceptance wording.
- Missing clauses or risks: the wizard still does not collect full itemised room inventory data, so the product remains strongest as a structured blank / partially completed schedule.
- Recommended legal improvements: keep tenant acknowledgement, key schedule, meter readings, and condition guidance. Avoid hard consumer-unfair silence-equals-acceptance wording.
- Revised clause structure:
  1. Property information
  2. Meter readings
  3. Condition guide
  4. Room-by-room inventory
  5. Keys and access devices
  6. General notes
  7. Signatures and acknowledgement
- Additional wizard data:
  - room-level `inventory.rooms[].items[]` capture if a fully pre-filled premium inventory is intended
  - separate key counts by key type
  - photo schedule reference
  - cleaner check / presentation fields if deposit-dispute use is core

### 10. Flatmate Agreement

- Compliance assessment: improved. The document now reads as an internal occupier-sharing agreement and properly avoids pretending to create a new landlord-facing tenancy.
- Missing clauses or risks: the commercial positioning must stay clear that this is an occupier arrangement, not a substitute for landlord consent or formal assignment.
- Recommended legal improvements: keep status-of-arrangement wording, rent/bills split, conduct rules, dispute handling, and exit arrangements.
- Revised clause structure:
  1. Status of arrangement
  2. Contributions and shared costs
  3. House rules and conduct
  4. Communication and dispute resolution
  5. Exit arrangements
  6. Governing law
- Additional wizard data:
  - `flatmate_names`
  - `room_allocation`
  - `flatmate_rent_split`
  - `cleaning_schedule`
  - `guest_rules`
  - `quiet_hours`
  - `dispute_resolution`
  - `replacement_occupier_process`

### 11. Renewal Tenancy Agreement

- Compliance assessment: legally sensitive. The drafting is stronger, but the product now carries a strategic England-law risk because of the 1 May 2026 assured periodic transition.
- Missing clauses or risks: fixed-term renewal logic may be inappropriate or misleading for many post-1 May 2026 England assured tenancies.
- Recommended legal improvements: maintain explicit reference to the earlier tenancy, changed rent, and continued terms. Keep prominent warning that the legal position must be checked for post-1 May 2026 use.
- Revised clause structure:
  1. Existing tenancy and renewal overview
  2. Renewed term
  3. Terms continuing and terms changed
  4. Deposit and compliance
  5. Relationship with existing tenancy
  6. Governing law
- Additional wizard data:
  - `current_tenancy_end_date`
  - `renewal_rent_amount`
  - `renewal_compliance_notes`
  - if retained long-term, a gateway question asking whether the tenancy can still lawfully be documented as a fixed-term renewal under current England law

## Wizard Integration Summary

The main wizard risks were not only missing questions but field-name mismatch. The following were corrected in the generator mapping or UI:

- `assignment_effective_date` now maps into assignment generation.
- `transfer_terms_summary` now feeds assignment / sublet detail.
- `bill_split_summary` and `house_rules_summary` now feed flatmate generation.
- `repayment_amount` and `repayment_start_date` now feed repayment-plan generation.
- `applicant_*` employment and reference fields now feed application generation.

## Recommended Product Decisions

- Keep and actively sell:
  - `guarantor_agreement`
  - `lease_amendment`
  - `lease_assignment_agreement`
  - `repayment_plan_agreement`
  - `residential_tenancy_application`
  - `rental_inspection_report`
  - `flatmate_agreement`
- Keep with positioning caveats:
  - `residential_sublet_agreement`
  - `inventory_schedule_condition`
  - `rent_arrears_letter`
- Review urgently before continued England marketing after 1 May 2026:
  - `renewal_tenancy_agreement`
