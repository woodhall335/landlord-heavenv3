# Wales Fault-Based Breach Notice Compliance Architecture

**Product:** Notice Only - Wales
**Jurisdiction:** Wales
**Legislation:** Renting Homes (Wales) Act 2016
**Stage:** Pre-Service ONLY
**Version:** 1.0
**Date:** 2026-01-16

---

## Scope Constraint

This architecture applies ONLY to:
- Wales jurisdiction
- Notice Only journeys
- Fault-Based Breach Notices (Sections 157, 159, 161, 162)
- Pre-service stage ONLY

This document does NOT cover:
- Court application logic
- Possession order workflows
- Enforcement or bailiff stages
- Post-notice expiry actions
- England or non-Wales law (Housing Act 1988, Section 8, Form 6A, Section 21)

---

## DELIVERABLE 1: FORMAL COMPLIANCE SCHEMA (SOURCE OF TRUTH)

The following schema defines all pre-service compliance requirements for Wales fault-based breach notices.

```json
{
  "schema_version": "1.0",
  "jurisdiction": "wales",
  "product": "notice_only",
  "notice_type": "fault_based_breach",
  "legislation": "Renting Homes (Wales) Act 2016",
  "compliance_fields": [

    {
      "field_id": "rent_smart_wales_registered",
      "category": "landlord_registration",
      "label": "Rent Smart Wales Registration",
      "question_text": "Are you registered with Rent Smart Wales as a landlord?",
      "input_type": "boolean",
      "applies_if": null,
      "blocking_level": "HARD_BLOCK",
      "legal_basis": "Under the Housing (Wales) Act 2014, all landlords in Wales must be registered with Rent Smart Wales. An unregistered landlord cannot lawfully let property or serve valid notices.",
      "source_reference": "PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 1",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "rent_smart_wales_number",
      "category": "landlord_registration",
      "label": "Rent Smart Wales Registration Number",
      "question_text": "Enter your Rent Smart Wales registration number",
      "input_type": "text",
      "applies_if": "rent_smart_wales_registered === true",
      "blocking_level": "INFO_ONLY",
      "legal_basis": "Registration number required for audit trail and compliance verification.",
      "source_reference": "PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 1",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "written_statement_provided",
      "category": "occupation_contract",
      "label": "Written Statement Provided",
      "question_text": "Have you provided the contract-holder with a written statement of the occupation contract within 14 days of occupation commencing?",
      "input_type": "boolean",
      "applies_if": null,
      "blocking_level": "SOFT_BLOCK",
      "legal_basis": "Under RH(W)A 2016 s.31, the landlord must provide a written statement of the occupation contract within 14 days. Failure to comply may result in compensation claims and undermines notice validity.",
      "source_reference": "PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 2",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "written_statement_date",
      "category": "occupation_contract",
      "label": "Written Statement Date",
      "question_text": "When was the written statement provided to the contract-holder?",
      "input_type": "date",
      "applies_if": "written_statement_provided === true",
      "blocking_level": "INFO_ONLY",
      "legal_basis": "Date verification ensures the 14-day requirement was met.",
      "source_reference": "PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 2",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "deposit_taken",
      "category": "deposit",
      "label": "Deposit Taken",
      "question_text": "Did you take a deposit from the contract-holder?",
      "input_type": "boolean",
      "applies_if": null,
      "blocking_level": "INFO_ONLY",
      "legal_basis": "Determines whether deposit protection requirements apply under the Housing (Wales) Act 2014.",
      "source_reference": "PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 3",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "deposit_protected",
      "category": "deposit",
      "label": "Deposit Protected",
      "question_text": "Has the deposit been protected in a Welsh Government-approved tenancy deposit scheme?",
      "input_type": "boolean",
      "applies_if": "deposit_taken === true",
      "blocking_level": "SOFT_BLOCK",
      "legal_basis": "Under the Housing (Wales) Act 2014, deposits must be protected within 30 days. Failure to protect may expose landlord to compensation claims of up to 3x deposit amount. While not a statutory bar to fault-based notices, non-compliance creates defence opportunities.",
      "source_reference": "PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 3",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "deposit_scheme",
      "category": "deposit",
      "label": "Deposit Scheme",
      "question_text": "Which approved deposit scheme is the deposit protected with?",
      "input_type": "enum",
      "enum_values": ["mydeposits_wales", "dps", "tds"],
      "applies_if": "deposit_protected === true",
      "blocking_level": "INFO_ONLY",
      "legal_basis": "Only Welsh Government-approved schemes are valid.",
      "source_reference": "PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 3",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "prescribed_info_served",
      "category": "deposit",
      "label": "Prescribed Information Served",
      "question_text": "Have you served the prescribed information about the deposit on the contract-holder within 30 days of receiving the deposit?",
      "input_type": "boolean",
      "applies_if": "deposit_taken === true",
      "blocking_level": "SOFT_BLOCK",
      "legal_basis": "Prescribed information must be served within 30 days. Failure to comply may result in compensation awards and provide defence grounds.",
      "source_reference": "PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 3",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "prescribed_info_date",
      "category": "deposit",
      "label": "Prescribed Information Date",
      "question_text": "When was the prescribed information served on the contract-holder?",
      "input_type": "date",
      "applies_if": "prescribed_info_served === true",
      "blocking_level": "INFO_ONLY",
      "legal_basis": "Date verification ensures the 30-day requirement was met.",
      "source_reference": "PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 3",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "gas_supply_present",
      "category": "property_safety",
      "label": "Gas Supply Present",
      "question_text": "Does the property have a gas supply?",
      "input_type": "boolean",
      "applies_if": null,
      "blocking_level": "INFO_ONLY",
      "legal_basis": "Determines applicability of Gas Safety (Installation and Use) Regulations 1998.",
      "source_reference": "PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4.1",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "gas_safety_certificate_valid",
      "category": "property_safety",
      "label": "Valid Gas Safety Certificate",
      "question_text": "Do you have a valid Gas Safety Certificate (dated within the last 12 months)?",
      "input_type": "boolean",
      "applies_if": "gas_supply_present === true",
      "blocking_level": "SOFT_BLOCK",
      "legal_basis": "Under the Gas Safety (Installation and Use) Regulations 1998, landlords must have gas appliances checked annually. Non-compliance is a criminal offence and may undermine possession proceedings.",
      "source_reference": "PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4.1",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "gas_cert_expiry_date",
      "category": "property_safety",
      "label": "Gas Certificate Expiry Date",
      "question_text": "What is the expiry date of the current Gas Safety Certificate?",
      "input_type": "date",
      "applies_if": "gas_safety_certificate_valid === true",
      "blocking_level": "INFO_ONLY",
      "legal_basis": "Validates certificate is current at time of notice service.",
      "source_reference": "PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4.1",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "eicr_valid",
      "category": "property_safety",
      "label": "Valid EICR",
      "question_text": "Do you have a valid Electrical Installation Condition Report (EICR) dated within the last 5 years?",
      "input_type": "boolean",
      "applies_if": null,
      "blocking_level": "SOFT_BLOCK",
      "legal_basis": "The Renting Homes (Wales) Act 2016 requires electrical safety standards. An EICR must be valid (within 5 years) and show satisfactory condition.",
      "source_reference": "PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4.2",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "eicr_next_inspection_date",
      "category": "property_safety",
      "label": "EICR Next Inspection Date",
      "question_text": "What is the next inspection due date on the EICR?",
      "input_type": "date",
      "applies_if": "eicr_valid === true",
      "blocking_level": "INFO_ONLY",
      "legal_basis": "Ensures EICR will remain valid throughout notice period.",
      "source_reference": "PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4.2",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "smoke_alarms_installed",
      "category": "property_safety",
      "label": "Smoke Alarms Installed",
      "question_text": "Are working smoke alarms installed on each floor of the property?",
      "input_type": "boolean",
      "applies_if": null,
      "blocking_level": "SOFT_BLOCK",
      "legal_basis": "Under the Renting Homes (Fitness for Human Habitation) (Wales) Regulations 2022, smoke alarms must be installed and tested to confirm they are in working order at the start of each occupation.",
      "source_reference": "PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4.3",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "smoke_alarms_tested",
      "category": "property_safety",
      "label": "Smoke Alarms Tested",
      "question_text": "Have you tested the smoke alarms to confirm they are in working order?",
      "input_type": "boolean",
      "applies_if": "smoke_alarms_installed === true",
      "blocking_level": "INFO_ONLY",
      "legal_basis": "Testing requirement ensures alarms function correctly at occupation start.",
      "source_reference": "PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4.3",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "co_alarm_required",
      "category": "property_safety",
      "label": "CO Alarm Required",
      "question_text": "Does the property have a solid fuel burning appliance (e.g., wood burner, coal fire) or gas appliance in a room used as sleeping accommodation?",
      "input_type": "boolean",
      "applies_if": null,
      "blocking_level": "INFO_ONLY",
      "legal_basis": "Determines applicability of carbon monoxide alarm requirement.",
      "source_reference": "PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4.4",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "co_alarm_installed",
      "category": "property_safety",
      "label": "CO Alarm Installed",
      "question_text": "Is a working carbon monoxide alarm installed in the relevant rooms?",
      "input_type": "boolean",
      "applies_if": "co_alarm_required === true",
      "blocking_level": "SOFT_BLOCK",
      "legal_basis": "Carbon monoxide alarms are required in rooms with solid fuel appliances under Welsh fitness standards.",
      "source_reference": "PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4.4",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "property_fit_for_habitation",
      "category": "property_safety",
      "label": "Property Fit for Human Habitation",
      "question_text": "Is the property fit for human habitation under the Renting Homes (Fitness for Human Habitation) (Wales) Regulations 2022?",
      "input_type": "boolean",
      "applies_if": null,
      "blocking_level": "SOFT_BLOCK",
      "legal_basis": "Under RH(W)A 2016 and the Fitness Regulations, the landlord must ensure the dwelling is fit for human habitation. Non-compliance may provide defences to possession claims.",
      "source_reference": "PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4.5",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "retaliatory_eviction_complaint",
      "category": "eviction_safeguards",
      "label": "Retaliatory Eviction Protection",
      "question_text": "Has the contract-holder made a complaint about the condition of the property in the last 6 months?",
      "input_type": "boolean",
      "applies_if": null,
      "blocking_level": "SOFT_BLOCK",
      "legal_basis": "Section 217 RH(W)A 2016 provides protection against retaliatory eviction. If the contract-holder complained about property condition and the landlord served notice within 6 months, the court may refuse possession if it considers the notice was served in retaliation.",
      "source_reference": "SERVICE AND VALIDITY CHECKLIST - Wales, Safeguards Section",
      "feeds_documents": ["pre_service_checklist", "service_validity_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "complaint_date",
      "category": "eviction_safeguards",
      "label": "Complaint Date",
      "question_text": "When did the contract-holder make the complaint?",
      "input_type": "date",
      "applies_if": "retaliatory_eviction_complaint === true",
      "blocking_level": "INFO_ONLY",
      "legal_basis": "Date required to assess 6-month retaliatory eviction protection window.",
      "source_reference": "SERVICE AND VALIDITY CHECKLIST - Wales, Safeguards Section",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "local_authority_investigation",
      "category": "eviction_safeguards",
      "label": "Local Authority Investigation",
      "question_text": "Is there an ongoing local authority investigation or improvement notice relating to the property?",
      "input_type": "boolean",
      "applies_if": null,
      "blocking_level": "SOFT_BLOCK",
      "legal_basis": "An ongoing local authority investigation or enforcement action may trigger retaliatory eviction protections under s.217 RH(W)A 2016.",
      "source_reference": "SERVICE AND VALIDITY CHECKLIST - Wales, Safeguards Section",
      "feeds_documents": ["pre_service_checklist", "service_validity_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "wales_fault_grounds",
      "category": "fault_based_grounds",
      "label": "Statutory Ground Selection",
      "question_text": "Select the statutory ground(s) for the fault-based breach notice:",
      "input_type": "enum_multi",
      "enum_values": [
        "rent_arrears_serious",
        "rent_arrears_other",
        "antisocial_behaviour",
        "breach_of_contract",
        "false_statement",
        "domestic_abuse"
      ],
      "applies_if": null,
      "blocking_level": "HARD_BLOCK",
      "legal_basis": "At least one valid statutory ground must be selected under Sections 157, 159, 161, or 162 of RH(W)A 2016.",
      "source_reference": "Service Instructions for Fault-Based Breach Notice (Wales)",
      "feeds_documents": ["pre_service_checklist", "service_validity_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "evidence_exists",
      "category": "breach_evidence",
      "label": "Evidence Available",
      "question_text": "Do you have evidence to support the breach?",
      "input_type": "boolean",
      "applies_if": null,
      "blocking_level": "HARD_BLOCK",
      "legal_basis": "Evidence of the breach is essential for a possession claim. Without evidence, the court cannot be satisfied the ground is made out.",
      "source_reference": "Service Instructions for Fault-Based Breach Notice (Wales)",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "evidence_type",
      "category": "breach_evidence",
      "label": "Evidence Type",
      "question_text": "What type of evidence do you have? (Select all that apply)",
      "input_type": "enum_multi",
      "enum_values": [
        "rent_statement",
        "bank_statements",
        "payment_records",
        "incident_log",
        "witness_statements",
        "police_reports",
        "local_authority_reports",
        "photographs",
        "correspondence",
        "contract_documents",
        "other"
      ],
      "applies_if": "evidence_exists === true",
      "blocking_level": "INFO_ONLY",
      "legal_basis": "Evidence type must be appropriate to the ground relied upon.",
      "source_reference": "Service Instructions for Fault-Based Breach Notice (Wales)",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "arrears_amount",
      "category": "breach_evidence",
      "label": "Arrears Amount",
      "question_text": "What is the total amount of rent arrears outstanding?",
      "input_type": "number",
      "applies_if": "wales_fault_grounds.includes('rent_arrears_serious') || wales_fault_grounds.includes('rent_arrears_other')",
      "blocking_level": "HARD_BLOCK",
      "legal_basis": "Arrears amount required for Section 157/159 grounds. Section 157 requires at least 2 months (or 8 weeks) unpaid.",
      "source_reference": "Service Instructions for Fault-Based Breach Notice (Wales)",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "arrears_schedule",
      "category": "breach_evidence",
      "label": "Arrears Schedule",
      "question_text": "Upload or enter the rent arrears schedule showing payment history:",
      "input_type": "upload",
      "applies_if": "wales_fault_grounds.includes('rent_arrears_serious') || wales_fault_grounds.includes('rent_arrears_other')",
      "blocking_level": "SOFT_BLOCK",
      "legal_basis": "A detailed arrears schedule strengthens the possession claim and demonstrates the arrears threshold is met.",
      "source_reference": "Service Instructions for Fault-Based Breach Notice (Wales)",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "asb_incident_description",
      "category": "breach_evidence",
      "label": "ASB Incident Description",
      "question_text": "Describe the anti-social behaviour incidents (include dates, times, locations, and what occurred):",
      "input_type": "text",
      "applies_if": "wales_fault_grounds.includes('antisocial_behaviour')",
      "blocking_level": "HARD_BLOCK",
      "legal_basis": "Particulars of the anti-social behaviour must be provided to support a Section 161 claim.",
      "source_reference": "Service Instructions for Fault-Based Breach Notice (Wales)",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "asb_police_involved",
      "category": "breach_evidence",
      "label": "Police Involvement",
      "question_text": "Have the police been involved in any of the ASB incidents?",
      "input_type": "boolean",
      "applies_if": "wales_fault_grounds.includes('antisocial_behaviour')",
      "blocking_level": "INFO_ONLY",
      "legal_basis": "Police involvement strengthens evidence but is not mandatory.",
      "source_reference": "Service Instructions for Fault-Based Breach Notice (Wales)",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "asb_police_reference",
      "category": "breach_evidence",
      "label": "Police Reference Number",
      "question_text": "Enter the police crime reference number(s):",
      "input_type": "text",
      "applies_if": "asb_police_involved === true",
      "blocking_level": "INFO_ONLY",
      "legal_basis": "Reference numbers allow verification and strengthen evidence.",
      "source_reference": "Service Instructions for Fault-Based Breach Notice (Wales)",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "asb_witness_statements",
      "category": "breach_evidence",
      "label": "Witness Statements Available",
      "question_text": "Do you have witness statements supporting the ASB allegations?",
      "input_type": "boolean",
      "applies_if": "wales_fault_grounds.includes('antisocial_behaviour')",
      "blocking_level": "SOFT_BLOCK",
      "legal_basis": "Witness statements provide independent corroboration of ASB incidents.",
      "source_reference": "Service Instructions for Fault-Based Breach Notice (Wales)",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "breach_clause_identified",
      "category": "breach_evidence",
      "label": "Breached Clause Identified",
      "question_text": "Which clause or term of the occupation contract has been breached?",
      "input_type": "text",
      "applies_if": "wales_fault_grounds.includes('breach_of_contract')",
      "blocking_level": "HARD_BLOCK",
      "legal_basis": "The specific breached term must be identified for a Section 159 breach claim.",
      "source_reference": "Service Instructions for Fault-Based Breach Notice (Wales)",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "breach_description",
      "category": "breach_evidence",
      "label": "Breach Description",
      "question_text": "Describe how the contract-holder has breached this term:",
      "input_type": "text",
      "applies_if": "wales_fault_grounds.includes('breach_of_contract')",
      "blocking_level": "HARD_BLOCK",
      "legal_basis": "Particulars of the breach must be provided to support the claim.",
      "source_reference": "Service Instructions for Fault-Based Breach Notice (Wales)",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "false_statement_description",
      "category": "breach_evidence",
      "label": "False Statement Description",
      "question_text": "What false statement did the contract-holder make to obtain the contract?",
      "input_type": "text",
      "applies_if": "wales_fault_grounds.includes('false_statement')",
      "blocking_level": "HARD_BLOCK",
      "legal_basis": "The specific false statement must be identified for a Section 159 false statement claim.",
      "source_reference": "Service Instructions for Fault-Based Breach Notice (Wales)",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "false_statement_discovery_date",
      "category": "breach_evidence",
      "label": "Discovery Date",
      "question_text": "When did you discover the statement was false?",
      "input_type": "date",
      "applies_if": "wales_fault_grounds.includes('false_statement')",
      "blocking_level": "INFO_ONLY",
      "legal_basis": "Date of discovery relevant to timing and reasonableness.",
      "source_reference": "Service Instructions for Fault-Based Breach Notice (Wales)",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    },

    {
      "field_id": "user_declaration",
      "category": "breach_evidence",
      "label": "User Declaration",
      "question_text": "I confirm that the information provided is true and accurate to the best of my knowledge, and I understand that serving a notice without proper grounds or evidence may result in legal liability.",
      "input_type": "boolean",
      "applies_if": null,
      "blocking_level": "HARD_BLOCK",
      "legal_basis": "Declaration required for audit trail and user acknowledgment of responsibilities.",
      "source_reference": "Service Instructions for Fault-Based Breach Notice (Wales)",
      "feeds_documents": ["pre_service_checklist"],
      "appears_on_notice": false
    }
  ]
}
```

---

## DELIVERABLE 2: FAULT-BASED GROUNDS LOGIC (WALES)

### Ground Definitions

The following ground definitions extend the Compliance Schema and must integrate with the existing `WALES_FAULT_GROUNDS` array in `/src/lib/wales/grounds.ts`.

---

### SECTION 157 - Serious Rent Arrears

| Property | Value |
|----------|-------|
| **Ground Code** | `section_157` |
| **Internal Value** | `rent_arrears_serious` |
| **Label** | Serious rent arrears (8+ weeks) |
| **Section** | 157 |
| **Mandatory** | Yes (absolute ground) |
| **Notice Period** | 14 days |
| **Requires Arrears Schedule** | Yes |

#### Eligibility Conditions

```yaml
section_157_eligibility:
  conditions:
    - arrears_amount >= serious_arrears_threshold
    - threshold_calculation:
        weekly_or_fortnightly: "8 weeks rent"
        monthly_or_longer: "2 months rent"
  timing_requirement:
    - arrears_must_exist_at: "notice_date"
    - arrears_must_exist_at: "hearing_date"
```

#### Required Evidence

| Evidence Type | Required | Description |
|---------------|----------|-------------|
| Rent statement | REQUIRED | Full statement showing rent due and payments received |
| Rent due dates | REQUIRED | Clear record of when rent was due |
| Amount outstanding | REQUIRED | Total arrears at date of service |
| Bank statements | RECOMMENDED | Corroborating payment records |

#### Validation Rules

```typescript
{
  rule_id: "section_157_threshold",
  type: "HARD_BLOCK",
  condition: "arrears_amount < calculateSection157Threshold(rent_amount, rent_frequency)",
  message: "Arrears do not meet the Section 157 threshold of 2 months (or 8 weeks). Consider using Section 159 (Some Rent Arrears) instead.",
  action: "block_ground_selection"
}
```

---

### SECTION 159 - Some Rent Arrears

| Property | Value |
|----------|-------|
| **Ground Code** | `section_159` |
| **Internal Value** | `rent_arrears_other` |
| **Label** | Some rent arrears |
| **Section** | 159 |
| **Mandatory** | No (discretionary ground) |
| **Notice Period** | 56 days |
| **Requires Arrears Schedule** | Yes |

#### Eligibility Conditions

```yaml
section_159_some_arrears_eligibility:
  conditions:
    - arrears_amount > 0
    - arrears_amount < serious_arrears_threshold
  exclusion:
    - if arrears_amount >= serious_arrears_threshold:
        action: "redirect_to_section_157"
        message: "Arrears meet Section 157 threshold - use Section 157 instead"
```

#### Required Evidence

| Evidence Type | Required | Description |
|---------------|----------|-------------|
| Rent statement | REQUIRED | Full statement showing arrears |
| Payment history | RECOMMENDED | Context for court discretion |

#### Validation Rules

```typescript
{
  rule_id: "section_159_arrears_exists",
  type: "HARD_BLOCK",
  condition: "arrears_amount <= 0",
  message: "No rent arrears exist. Section 159 cannot be used without rent arrears.",
  action: "block_ground_selection"
},
{
  rule_id: "section_159_exceeds_threshold",
  type: "HARD_BLOCK",
  condition: "arrears_amount >= calculateSection157Threshold(rent_amount, rent_frequency)",
  message: "Arrears meet Section 157 threshold. You must use Section 157 (Serious Rent Arrears) for this level of arrears.",
  action: "redirect_to_section_157"
}
```

---

### SECTION 161 - Anti-Social Behaviour

| Property | Value |
|----------|-------|
| **Ground Code** | `section_161` |
| **Internal Value** | `antisocial_behaviour` |
| **Label** | Anti-social behaviour |
| **Section** | 161 |
| **Mandatory** | Yes (absolute ground) |
| **Notice Period** | 14 days |
| **Requires Arrears Schedule** | No |

#### Eligibility Conditions

```yaml
section_161_eligibility:
  conditions:
    - asb_incident_description is not empty
    - behaviour_type in:
        - "nuisance to neighbours"
        - "annoyance to locality"
        - "criminal conviction"
        - "using property for illegal purposes"
        - "harassment, alarm or distress"
```

#### Required Evidence

| Evidence Type | Required | Description |
|---------------|----------|-------------|
| Incident log | REQUIRED | Dated record of ASB incidents |
| Witness statements | RECOMMENDED | Independent corroboration |
| Police reports | OPTIONAL | Strengthens claim if available |
| Local authority reports | OPTIONAL | Environmental health, housing officers |
| Photographs/videos | OPTIONAL | Visual evidence of damage/disturbance |

#### Validation Rules

```typescript
{
  rule_id: "section_161_evidence_required",
  type: "HARD_BLOCK",
  condition: "asb_incident_description.trim().length === 0",
  message: "You must describe the anti-social behaviour incidents. Include dates, times, locations, and details of what occurred.",
  action: "block_ground_selection"
}
```

---

### SECTION 159/162 - Breach of Occupation Contract

| Property | Value |
|----------|-------|
| **Ground Code** | `section_159` |
| **Internal Value** | `breach_of_contract` |
| **Label** | Breach of occupation contract |
| **Section** | 159 (incorporating s.162 principles) |
| **Mandatory** | No (discretionary ground) |
| **Notice Period** | 56 days |
| **Requires Arrears Schedule** | No |

#### Eligibility Conditions

```yaml
section_162_breach_eligibility:
  conditions:
    - breach_clause_identified is not empty
    - breach_description is not empty
  breach_types:
    - unauthorized_occupant
    - unauthorized_pet
    - subletting_without_consent
    - property_damage
    - business_use_without_consent
    - false_statement_to_obtain_contract
    - other_contract_term_breach
```

#### Required Evidence

| Evidence Type | Required | Description |
|---------------|----------|-------------|
| Breached clause identification | REQUIRED | Specific term/clause that was breached |
| Supporting documentation | REQUIRED | Proof the breach occurred |
| Correspondence | RECOMMENDED | Warnings sent to contract-holder |
| Photographs | OPTIONAL | Visual evidence for property condition breaches |

#### Validation Rules

```typescript
{
  rule_id: "section_162_breach_specified",
  type: "HARD_BLOCK",
  condition: "breach_clause_identified.trim().length === 0 || breach_description.trim().length === 0",
  message: "You must identify the specific clause breached and describe how it was breached.",
  action: "block_ground_selection"
}
```

---

### Ground Logic Integration Requirements

```typescript
/**
 * Ground logic must integrate with:
 */

// 1. Compliance Schema - validates all pre-conditions
interface GroundValidation {
  validatePreConditions(facts: WizardFacts): ValidationResult;
  getRequiredEvidence(ground: string): EvidenceRequirement[];
  calculateNoticePeriod(grounds: string[]): number;
}

// 2. Evidence capture - adapts questions per ground
interface EvidenceCapture {
  getEvidenceQuestionsForGround(ground: string): ComplianceField[];
  validateEvidenceCompleteness(ground: string, facts: WizardFacts): boolean;
}

// 3. Service & Validity Checklist - populates checklist
interface ChecklistIntegration {
  getGroundSpecificChecklistItems(ground: string): ChecklistItem[];
  getEvidenceChecklistItems(ground: string, facts: WizardFacts): ChecklistItem[];
}
```

---

### Notice Period Calculation

```typescript
/**
 * Calculate minimum notice period for selected grounds.
 * Uses the shortest required period when multiple grounds selected.
 */
function calculateMinimumNoticePeriod(selectedGrounds: string[]): number {
  const periodMap: Record<string, number> = {
    'rent_arrears_serious': 14,    // Section 157
    'rent_arrears_other': 56,      // Section 159
    'antisocial_behaviour': 14,    // Section 161
    'breach_of_contract': 56,      // Section 159
    'false_statement': 56,         // Section 159
    'domestic_abuse': 14,          // Section 159
  };

  if (!selectedGrounds.length) return 60; // Default fallback

  return Math.min(...selectedGrounds.map(g => periodMap[g] || 60));
}
```

---

## DELIVERABLE 3: WIZARD QUESTION & BLOCKING MAP

### Tab Structure

| Tab Order | Tab Name | Fields | Purpose |
|-----------|----------|--------|---------|
| 1 | Landlord Details | rent_smart_wales_registered, rent_smart_wales_number | Verify landlord registration |
| 2 | Occupation Contract | written_statement_provided, written_statement_date | Contract compliance |
| 3 | Deposit | deposit_taken, deposit_protected, deposit_scheme, prescribed_info_served, prescribed_info_date | Deposit protection compliance |
| 4 | Property Compliance | gas_supply_present, gas_safety_certificate_valid, gas_cert_expiry_date, eicr_valid, eicr_next_inspection_date, smoke_alarms_installed, smoke_alarms_tested, co_alarm_required, co_alarm_installed, property_fit_for_habitation | Safety certificate verification |
| 5 | Breach Details | wales_fault_grounds, evidence_exists, evidence_type, [ground-specific fields] | Ground selection and evidence |
| 6 | Safeguards | retaliatory_eviction_complaint, complaint_date, local_authority_investigation | Eviction safeguard checks |
| 7 | Review & Declaration | user_declaration | Final review and sign-off |

---

### Field-to-Tab Mapping with Blocking Behaviour

#### Tab 1: Landlord Details

| Field ID | Label | Input Type | Blocking Level | Block Message |
|----------|-------|------------|----------------|---------------|
| `rent_smart_wales_registered` | Rent Smart Wales Registration | boolean | **HARD_BLOCK** | "You must be registered with Rent Smart Wales before serving any notice in Wales. Register at rentsmartswales.gov.wales before proceeding." |
| `rent_smart_wales_number` | Registration Number | text | INFO_ONLY | N/A |

#### Tab 2: Occupation Contract

| Field ID | Label | Input Type | Blocking Level | Block Message |
|----------|-------|------------|----------------|---------------|
| `written_statement_provided` | Written Statement Provided | boolean | **SOFT_BLOCK** | "The written statement of the occupation contract must be provided within 14 days. Proceeding without compliance may expose you to compensation claims. Do you wish to continue?" |
| `written_statement_date` | Written Statement Date | date | INFO_ONLY | N/A |

#### Tab 3: Deposit

| Field ID | Label | Input Type | Blocking Level | Block Message |
|----------|-------|------------|----------------|---------------|
| `deposit_taken` | Deposit Taken | boolean | INFO_ONLY | N/A |
| `deposit_protected` | Deposit Protected | boolean | **SOFT_BLOCK** | "The deposit has not been protected. While not a statutory bar to fault-based notices, this may expose you to compensation claims of up to 3x deposit and create defence opportunities. Do you wish to continue?" |
| `deposit_scheme` | Deposit Scheme | enum | INFO_ONLY | N/A |
| `prescribed_info_served` | Prescribed Information Served | boolean | **SOFT_BLOCK** | "Prescribed deposit information has not been served within 30 days. This may result in compensation claims. Do you wish to continue?" |
| `prescribed_info_date` | Prescribed Info Date | date | INFO_ONLY | N/A |

#### Tab 4: Property Compliance

| Field ID | Label | Input Type | Blocking Level | Block Message |
|----------|-------|------------|----------------|---------------|
| `gas_supply_present` | Gas Supply Present | boolean | INFO_ONLY | N/A |
| `gas_safety_certificate_valid` | Gas Safety Certificate | boolean | **SOFT_BLOCK** | "No valid Gas Safety Certificate. This is a criminal offence and may undermine your possession claim. Do you wish to continue?" |
| `gas_cert_expiry_date` | Gas Certificate Expiry | date | INFO_ONLY | N/A |
| `eicr_valid` | EICR Valid | boolean | **SOFT_BLOCK** | "No valid EICR. Electrical safety is required under Welsh law. Do you wish to continue?" |
| `eicr_next_inspection_date` | EICR Next Inspection | date | INFO_ONLY | N/A |
| `smoke_alarms_installed` | Smoke Alarms Installed | boolean | **SOFT_BLOCK** | "Smoke alarms must be installed on each floor. This is a fitness requirement under Welsh law. Do you wish to continue?" |
| `smoke_alarms_tested` | Smoke Alarms Tested | boolean | INFO_ONLY | N/A |
| `co_alarm_required` | CO Alarm Required | boolean | INFO_ONLY | N/A |
| `co_alarm_installed` | CO Alarm Installed | boolean | **SOFT_BLOCK** | "Carbon monoxide alarm required but not installed. Do you wish to continue?" |
| `property_fit_for_habitation` | Fit for Habitation | boolean | **SOFT_BLOCK** | "Property may not be fit for human habitation. This may provide defences to your possession claim. Do you wish to continue?" |

#### Tab 5: Breach Details

| Field ID | Label | Input Type | Blocking Level | Block Message |
|----------|-------|------------|----------------|---------------|
| `wales_fault_grounds` | Statutory Ground Selection | enum_multi | **HARD_BLOCK** | "You must select at least one statutory ground for the fault-based notice." |
| `evidence_exists` | Evidence Available | boolean | **HARD_BLOCK** | "You must have evidence to support the breach. Without evidence, your possession claim will fail." |
| `evidence_type` | Evidence Type | enum_multi | INFO_ONLY | N/A |
| `arrears_amount` | Arrears Amount | number | **HARD_BLOCK** | "You must specify the arrears amount for rent arrears grounds." |
| `arrears_schedule` | Arrears Schedule | upload | **SOFT_BLOCK** | "An arrears schedule is strongly recommended to support your claim. Do you wish to continue without one?" |
| `asb_incident_description` | ASB Description | text | **HARD_BLOCK** | "You must describe the anti-social behaviour incidents to proceed with Section 161." |
| `asb_police_involved` | Police Involved | boolean | INFO_ONLY | N/A |
| `asb_police_reference` | Police Reference | text | INFO_ONLY | N/A |
| `asb_witness_statements` | Witness Statements | boolean | **SOFT_BLOCK** | "Witness statements strengthen ASB claims. Do you wish to continue without them?" |
| `breach_clause_identified` | Breached Clause | text | **HARD_BLOCK** | "You must identify the specific clause breached to proceed with Section 159/162." |
| `breach_description` | Breach Description | text | **HARD_BLOCK** | "You must describe how the clause was breached." |
| `false_statement_description` | False Statement | text | **HARD_BLOCK** | "You must describe the false statement made." |
| `false_statement_discovery_date` | Discovery Date | date | INFO_ONLY | N/A |

#### Tab 6: Safeguards

| Field ID | Label | Input Type | Blocking Level | Block Message |
|----------|-------|------------|----------------|---------------|
| `retaliatory_eviction_complaint` | Recent Complaint | boolean | **SOFT_BLOCK** | "The contract-holder has complained about property condition in the last 6 months. The court may refuse possession if it considers this notice retaliatory under s.217 RH(W)A 2016. Do you wish to continue?" |
| `complaint_date` | Complaint Date | date | INFO_ONLY | N/A |
| `local_authority_investigation` | LA Investigation | boolean | **SOFT_BLOCK** | "An ongoing local authority investigation may trigger retaliatory eviction protections. Do you wish to continue?" |

#### Tab 7: Review & Declaration

| Field ID | Label | Input Type | Blocking Level | Block Message |
|----------|-------|------------|----------------|---------------|
| `user_declaration` | Declaration | boolean | **HARD_BLOCK** | "You must confirm the declaration to proceed." |

---

### Data Storage Confirmation

- All wizard answers are stored in the `wizard_facts` object for:
  - Audit trail
  - Pre-service checklist generation
  - Service & validity checklist population
- **No pre-service compliance data appears on the notice itself**
- All fields have `appears_on_notice: false`

---

## DELIVERABLE 4: GENERATED PRE-SERVICE COMPLIANCE CHECKLIST

### Template: Pre-Service Compliance Checklist (Wales - Fault-Based)

```handlebars
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Pre-Service Compliance Checklist - Wales Fault-Based Breach Notice</title>
  <style>
    /* === STYLING NORMALISATION (Deliverable 5) === */
    body {
      font-family: Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #000000;
      max-width: 210mm;
      margin: 0 auto;
      padding: 15mm;
    }

    h1 {
      font-size: 16pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 5px;
      color: #000000;
    }

    h2 {
      font-size: 13pt;
      font-weight: bold;
      margin-top: 20px;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 2px solid #000000;
      color: #000000;
    }

    h3 {
      font-size: 11pt;
      font-weight: bold;
      margin-top: 15px;
      margin-bottom: 8px;
      color: #000000;
    }

    .subtitle {
      text-align: center;
      font-size: 11pt;
      margin-bottom: 20px;
      color: #000000;
    }

    .legal-positioning {
      border: 2px solid #000000;
      padding: 12px;
      margin: 20px 0;
      background: #f5f5f5;
    }

    .legal-positioning p {
      margin: 0;
      font-size: 10pt;
      font-weight: bold;
    }

    .case-details {
      background: #f9f9f9;
      padding: 15px;
      margin: 15px 0;
      border: 1px solid #cccccc;
    }

    .case-details p {
      margin: 5px 0;
    }

    .case-details strong {
      display: inline-block;
      width: 180px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }

    th, td {
      border: 1px solid #000000;
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: #e0e0e0;
      font-weight: bold;
    }

    .status-compliant {
      font-weight: bold;
    }

    .status-non-compliant {
      font-weight: bold;
    }

    .status-na {
      font-style: italic;
    }

    .critical-label {
      font-weight: bold;
      text-transform: uppercase;
    }

    .required-label {
      font-weight: bold;
    }

    .declaration-box {
      border: 2px solid #000000;
      padding: 15px;
      margin: 25px 0;
    }

    .signature-line {
      margin-top: 30px;
    }

    .signature-line p {
      margin: 15px 0;
    }

    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #cccccc;
      font-size: 9pt;
      color: #333333;
      text-align: center;
    }

    @media print {
      body { padding: 10mm; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>

<h1>PRE-SERVICE COMPLIANCE CHECKLIST</h1>
<p class="subtitle">Wales - Fault-Based Breach Notice<br>Renting Homes (Wales) Act 2016</p>

<div class="legal-positioning">
  <p>This checklist records pre-service compliance confirmations and does not form part of the notice itself.</p>
</div>

<div class="case-details">
  <p><strong>Property Address:</strong> {{property_address}}</p>
  <p><strong>Landlord:</strong> {{landlord_full_name}}</p>
  <p><strong>Contract-Holder:</strong> {{contract_holder_full_name}}</p>
  <p><strong>Date Generated:</strong> {{generated_date}}</p>
  <p><strong>Selected Ground(s):</strong> {{selected_grounds_display}}</p>
</div>

<h2>1. Landlord Registration</h2>
<p class="critical-label">CRITICAL - MUST COMPLY</p>

<table>
  <thead>
    <tr>
      <th style="width: 50%">Requirement</th>
      <th style="width: 25%">Response</th>
      <th style="width: 25%">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Registered with Rent Smart Wales</td>
      <td>{{#if rent_smart_wales_registered}}Yes{{else}}No{{/if}}</td>
      <td class="{{#if rent_smart_wales_registered}}status-compliant{{else}}status-non-compliant{{/if}}">
        {{#if rent_smart_wales_registered}}COMPLIANT{{else}}NON-COMPLIANT{{/if}}
      </td>
    </tr>
    {{#if rent_smart_wales_registered}}
    <tr>
      <td>Registration Number</td>
      <td>{{rent_smart_wales_number}}</td>
      <td class="status-compliant">RECORDED</td>
    </tr>
    {{/if}}
  </tbody>
</table>

<h2>2. Occupation Contract</h2>
<p class="required-label">REQUIRED</p>

<table>
  <thead>
    <tr>
      <th style="width: 50%">Requirement</th>
      <th style="width: 25%">Response</th>
      <th style="width: 25%">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Written Statement provided within 14 days</td>
      <td>{{#if written_statement_provided}}Yes{{else}}No{{/if}}</td>
      <td class="{{#if written_statement_provided}}status-compliant{{else}}status-non-compliant{{/if}}">
        {{#if written_statement_provided}}COMPLIANT{{else}}NON-COMPLIANT{{/if}}
      </td>
    </tr>
    {{#if written_statement_date}}
    <tr>
      <td>Date Written Statement provided</td>
      <td>{{written_statement_date_formatted}}</td>
      <td class="status-compliant">RECORDED</td>
    </tr>
    {{/if}}
  </tbody>
</table>

<h2>3. Deposit Protection</h2>
<p class="required-label">REQUIRED (if deposit taken)</p>

<table>
  <thead>
    <tr>
      <th style="width: 50%">Requirement</th>
      <th style="width: 25%">Response</th>
      <th style="width: 25%">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Deposit taken</td>
      <td>{{#if deposit_taken}}Yes{{else}}No{{/if}}</td>
      <td class="status-compliant">RECORDED</td>
    </tr>
    {{#if deposit_taken}}
    <tr>
      <td>Deposit protected in approved scheme</td>
      <td>{{#if deposit_protected}}Yes{{else}}No{{/if}}</td>
      <td class="{{#if deposit_protected}}status-compliant{{else}}status-non-compliant{{/if}}">
        {{#if deposit_protected}}COMPLIANT{{else}}NON-COMPLIANT{{/if}}
      </td>
    </tr>
    {{#if deposit_protected}}
    <tr>
      <td>Deposit Scheme</td>
      <td>{{deposit_scheme_display}}</td>
      <td class="status-compliant">RECORDED</td>
    </tr>
    {{/if}}
    <tr>
      <td>Prescribed Information served within 30 days</td>
      <td>{{#if prescribed_info_served}}Yes{{else}}No{{/if}}</td>
      <td class="{{#if prescribed_info_served}}status-compliant{{else}}status-non-compliant{{/if}}">
        {{#if prescribed_info_served}}COMPLIANT{{else}}NON-COMPLIANT{{/if}}
      </td>
    </tr>
    {{else}}
    <tr>
      <td>Deposit protected in approved scheme</td>
      <td>N/A</td>
      <td class="status-na">NOT APPLICABLE</td>
    </tr>
    <tr>
      <td>Prescribed Information served within 30 days</td>
      <td>N/A</td>
      <td class="status-na">NOT APPLICABLE</td>
    </tr>
    {{/if}}
  </tbody>
</table>

<h2>4. Property Safety</h2>
<p class="required-label">REQUIRED</p>

<table>
  <thead>
    <tr>
      <th style="width: 50%">Requirement</th>
      <th style="width: 25%">Response</th>
      <th style="width: 25%">Status</th>
    </tr>
  </thead>
  <tbody>
    {{#if gas_supply_present}}
    <tr>
      <td>Valid Gas Safety Certificate (within 12 months)</td>
      <td>{{#if gas_safety_certificate_valid}}Yes{{else}}No{{/if}}</td>
      <td class="{{#if gas_safety_certificate_valid}}status-compliant{{else}}status-non-compliant{{/if}}">
        {{#if gas_safety_certificate_valid}}COMPLIANT{{else}}NON-COMPLIANT{{/if}}
      </td>
    </tr>
    {{else}}
    <tr>
      <td>Valid Gas Safety Certificate</td>
      <td>No gas supply</td>
      <td class="status-na">NOT APPLICABLE</td>
    </tr>
    {{/if}}
    <tr>
      <td>Valid EICR (within 5 years)</td>
      <td>{{#if eicr_valid}}Yes{{else}}No{{/if}}</td>
      <td class="{{#if eicr_valid}}status-compliant{{else}}status-non-compliant{{/if}}">
        {{#if eicr_valid}}COMPLIANT{{else}}NON-COMPLIANT{{/if}}
      </td>
    </tr>
    <tr>
      <td>Smoke alarms installed on each floor</td>
      <td>{{#if smoke_alarms_installed}}Yes{{else}}No{{/if}}</td>
      <td class="{{#if smoke_alarms_installed}}status-compliant{{else}}status-non-compliant{{/if}}">
        {{#if smoke_alarms_installed}}COMPLIANT{{else}}NON-COMPLIANT{{/if}}
      </td>
    </tr>
    {{#if co_alarm_required}}
    <tr>
      <td>Carbon monoxide alarm installed</td>
      <td>{{#if co_alarm_installed}}Yes{{else}}No{{/if}}</td>
      <td class="{{#if co_alarm_installed}}status-compliant{{else}}status-non-compliant{{/if}}">
        {{#if co_alarm_installed}}COMPLIANT{{else}}NON-COMPLIANT{{/if}}
      </td>
    </tr>
    {{else}}
    <tr>
      <td>Carbon monoxide alarm installed</td>
      <td>Not required</td>
      <td class="status-na">NOT APPLICABLE</td>
    </tr>
    {{/if}}
    <tr>
      <td>Property fit for human habitation</td>
      <td>{{#if property_fit_for_habitation}}Yes{{else}}No{{/if}}</td>
      <td class="{{#if property_fit_for_habitation}}status-compliant{{else}}status-non-compliant{{/if}}">
        {{#if property_fit_for_habitation}}COMPLIANT{{else}}NON-COMPLIANT{{/if}}
      </td>
    </tr>
  </tbody>
</table>

<h2>5. Eviction Safeguards</h2>
<p class="required-label">REQUIRED</p>

<table>
  <thead>
    <tr>
      <th style="width: 50%">Requirement</th>
      <th style="width: 25%">Response</th>
      <th style="width: 25%">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Contract-holder complaint in last 6 months</td>
      <td>{{#if retaliatory_eviction_complaint}}Yes{{else}}No{{/if}}</td>
      <td class="{{#unless retaliatory_eviction_complaint}}status-compliant{{else}}status-non-compliant{{/unless}}">
        {{#unless retaliatory_eviction_complaint}}NO COMPLAINT{{else}}COMPLAINT RECORDED{{/unless}}
      </td>
    </tr>
    <tr>
      <td>Ongoing local authority investigation</td>
      <td>{{#if local_authority_investigation}}Yes{{else}}No{{/if}}</td>
      <td class="{{#unless local_authority_investigation}}status-compliant{{else}}status-non-compliant{{/unless}}">
        {{#unless local_authority_investigation}}NO INVESTIGATION{{else}}INVESTIGATION ACTIVE{{/unless}}
      </td>
    </tr>
  </tbody>
</table>

<h2>6. Breach Evidence</h2>
<p class="critical-label">CRITICAL - MUST COMPLY</p>

<table>
  <thead>
    <tr>
      <th style="width: 50%">Requirement</th>
      <th style="width: 25%">Response</th>
      <th style="width: 25%">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Statutory ground selected</td>
      <td>{{selected_grounds_display}}</td>
      <td class="status-compliant">COMPLIANT</td>
    </tr>
    <tr>
      <td>Evidence exists and can be produced</td>
      <td>{{#if evidence_exists}}Yes{{else}}No{{/if}}</td>
      <td class="{{#if evidence_exists}}status-compliant{{else}}status-non-compliant{{/if}}">
        {{#if evidence_exists}}COMPLIANT{{else}}NON-COMPLIANT{{/if}}
      </td>
    </tr>
    <tr>
      <td>Evidence type(s)</td>
      <td>{{evidence_type_display}}</td>
      <td class="status-compliant">RECORDED</td>
    </tr>
    {{#if has_arrears_ground}}
    <tr>
      <td>Arrears amount at date of notice</td>
      <td>£{{arrears_amount}}</td>
      <td class="status-compliant">RECORDED</td>
    </tr>
    {{/if}}
  </tbody>
</table>

<div class="page-break"></div>

<h2>7. Declaration</h2>

<div class="declaration-box">
  <p>I confirm that:</p>
  <ol>
    <li>I have verified each of the above compliance requirements.</li>
    <li>The information provided is true and accurate to the best of my knowledge.</li>
    <li>I understand that serving a notice without proper grounds or evidence may result in legal liability.</li>
    <li>I am aware that this checklist does not constitute legal advice.</li>
  </ol>

  <div class="signature-line">
    <p><strong>Signed:</strong> _________________________________________________</p>
    <p><strong>Print Name:</strong> {{landlord_full_name}}</p>
    <p><strong>Date:</strong> _________________________________________________</p>
  </div>
</div>

<div class="footer">
  <p><strong>Legal Basis:</strong> Renting Homes (Wales) Act 2016, Sections 157, 159, 161, 162</p>
  <p><strong>Document Type:</strong> Pre-Service Compliance Record (Internal Use Only)</p>
  <p>Generated by Landlord Heaven | This checklist is for record-keeping purposes and does not constitute legal advice.</p>
</div>

</body>
</html>
```

---

## DELIVERABLE 5: STYLING & FORMATTING NORMALISATION

### Styling Rules Applied

| Rule | Implementation |
|------|----------------|
| Remove ALL red text | All text uses `color: #000000` (black) |
| Remove icons and emojis | No emoji characters in template |
| Remove colour-based emphasis | No red/green status colours; uses text labels only |
| Use bold headings | `font-weight: bold` on h1, h2, h3 |
| Use numbered sections | Sections numbered 1-7 |
| Professional tone | Court-document language throughout |

### Language Hierarchy

| Emphasis Level | Usage | CSS Class |
|----------------|-------|-----------|
| **CRITICAL - MUST COMPLY** | Hard blocking requirements | `.critical-label` |
| **REQUIRED** | Mandatory items with soft blocking | `.required-label` |
| **RECOMMENDED** | Optional but advised (not used in this template) | `.recommended-label` |

### Status Display

| Status | Display Text | Meaning |
|--------|--------------|---------|
| COMPLIANT | Bold text | Requirement met |
| NON-COMPLIANT | Bold text | Requirement not met |
| NOT APPLICABLE | Italic text | Requirement does not apply |
| RECORDED | Regular text | Information captured |

### Print Optimisation

- A4 page size with 10mm margins
- Page breaks between major sections
- No colour dependency for status indication

---

## IMPLEMENTATION NOTES / ASSUMPTIONS

### Integration with Existing Architecture

1. **Ground Definitions Source**: The schema references the existing `WALES_FAULT_GROUNDS` array in `/src/lib/wales/grounds.ts` as the single source of truth for ground logic.

2. **Wizard Integration**: Fields map to existing wizard fact keys where possible (e.g., `wales_fault_grounds`, `rent_smart_wales_registered`).

3. **Template Engine**: The generated checklist uses Handlebars syntax consistent with existing templates in `/config/jurisdictions/uk/wales/templates/`.

4. **Validation Layer**: Blocking rules integrate with the existing `validateNoticeOnlyBeforeRender()` function pattern.

### Assumptions

1. **Wales-Only**: This architecture assumes Wales jurisdiction exclusively. No England/Housing Act 1988 cross-references are permitted.

2. **Pre-Service Stage**: All compliance checks are pre-service. Post-notice and court-stage logic is explicitly excluded.

3. **Notice Only Product**: This applies to the Notice Only product tier, not full eviction pack generation.

4. **Private Landlords**: Estate management grounds (Section 160) are excluded by default as they apply only to community landlords.

5. **Ground Period Alignment**: Notice periods align with the existing ground definitions:
   - Section 157: 14 days
   - Section 159: 56 days (corrected from 30 days in some sources - aligned with codebase)
   - Section 161: 14 days

### Schema Versioning

- Schema version: 1.0
- Last updated: 2026-01-16
- Review cycle: 6 months or when legislation changes

### Testing Recommendations

1. Validate all field_id values match existing WizardFacts keys
2. Test conditional `applies_if` logic for all dependent fields
3. Verify blocking messages display correctly in wizard UI
4. Test generated checklist with edge cases (no deposit, no gas, etc.)
5. Ensure no England/Housing Act 1988 references in any output

### Future Considerations

1. **Section 173 Integration**: This schema could be extended to include no-fault notices, but that is out of scope for this deliverable.

2. **Multi-Language Support**: Welsh language versions may be required for official documents.

3. **Court Stage Extension**: If court-stage logic is added later, maintain separation from pre-service compliance.

---

## CHANGE LOG

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-16 | Compliance Architecture | Initial version |
