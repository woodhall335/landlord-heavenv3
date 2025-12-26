# England Eviction Wizard Contract

This document defines the contract for the redesigned England Eviction Wizard (Complete Pack).

## Overview

The wizard collects all required data for generating court-ready eviction documents for England,
supporting both Section 8 (fault-based) and Section 21 (no-fault) eviction routes.

## Wizard Flow Structure

The wizard follows a logical, linear flow in 10 sections:

| Step | Section | Description |
|------|---------|-------------|
| 1 | Case Basics | Jurisdiction (England) and eviction route selection |
| 2 | Parties | Landlord(s) and tenant(s) with joint support |
| 3 | Property | Full rental property address |
| 4 | Tenancy | Start date, rent amount, frequency, due day |
| 5 | Notice | Service date, method, expiry, grounds (S8) |
| 6 | Section 21 Compliance | S21 only: deposit, prescribed info, gas, EPC, etc. |
| 7 | Section 8 Arrears | S8 only: detailed arrears schedule |
| 8 | Evidence | Upload supporting documents |
| 9 | Court & Signing | Court name, signatory details |
| 10 | Review | Blockers, warnings, document generation |

## Required Fields

### Common Fields (Both Routes)

| Field | MQS Key | Required | Description |
|-------|---------|----------|-------------|
| Landlord Name | `landlord_full_name` | Yes | Full legal name |
| Landlord Address | `landlord_address_line1`, `landlord_address_town`, `landlord_address_postcode` | Yes | Full address |
| Tenant Name | `tenant_full_name` | Yes | Full legal name |
| Property Address | `property_address_line1`, `property_address_town`, `property_address_postcode` | Yes | Full address |
| Tenancy Start Date | `tenancy_start_date` | Yes | Date tenancy began |
| Rent Amount | `rent_amount` | Yes | Monthly/weekly rent |
| Rent Frequency | `rent_frequency` | Yes | weekly/fortnightly/monthly |
| Rent Due Day | `rent_due_day` | Yes | Day rent is due (1-31 or 1-7) |
| Notice Served Date | `notice_served_date` | Yes | Date notice was served |
| Service Method | `notice_service_method` | Yes | How notice was delivered |
| Court Name | `court_name` | Yes | County Court handling claim |
| Signatory Name | `signatory_name` | Yes | Person signing court forms |
| Signatory Capacity | `signatory_capacity` | Yes | claimant/solicitor/agent |

### Section 21 Specific Fields

| Field | MQS Key | Required | Blocker if No |
|-------|---------|----------|---------------|
| Deposit Taken | `deposit_taken` | Yes | No |
| Deposit Amount | `deposit_amount` | If deposit taken | No |
| Deposit Protected | `deposit_protected` | If deposit taken | **Yes** |
| Deposit Scheme | `deposit_scheme_name` | If protected | No |
| Deposit Protection Date | `deposit_protection_date` | If protected | No |
| Prescribed Info Served | `prescribed_info_served` | If deposit taken | **Yes** |
| Has Gas Appliances | `has_gas_appliances` | Yes | No |
| Gas Safety Cert Served | `gas_safety_cert_served` | If gas appliances | **Yes** |
| EPC Served | `epc_served` | Yes | **Yes** |
| How to Rent Served | `how_to_rent_served` | Yes | **Yes** |
| Licensing Required | `licensing_required` | Yes | No |
| Has Valid Licence | `has_valid_licence` | If licensing required | **Yes** |

### Section 8 Specific Fields

| Field | MQS Key | Required | Description |
|-------|---------|----------|-------------|
| Selected Grounds | `section8_grounds` | Yes | Array of grounds (e.g., ["Ground 8"]) |
| Ground Particulars | `section8_details` | Yes | Facts supporting each ground |
| Arrears Items | `arrears_items` | For Grounds 8/10/11 | Period-by-period breakdown |
| Total Arrears | `total_arrears` | For arrears grounds | Calculated from schedule |

## Optional Fields

| Field | MQS Key | Description |
|-------|---------|-------------|
| Joint Landlord | `landlord2_name` | Second landlord name |
| Joint Tenants | `tenant2_name`, `tenant3_name`, `tenant4_name` | Additional tenant names |
| Landlord Email | `landlord_email` | Contact email |
| Landlord Phone | `landlord_phone` | Contact phone |
| Tenant Email | `tenant_email` | Contact email |
| Tenant Phone | `tenant_phone` | Contact phone |
| Fixed Term End Date | `fixed_term_end_date` | If fixed term tenancy |
| Court Address | `court_address` | For reference |
| Deposit Reference | `deposit_reference` | Scheme reference number |
| Notice Expiry Date | `notice_expiry_date` | Auto-calculated if blank |

## Evidence Categories

Evidence uploads map to N5B attachment checkboxes. Checkboxes are ONLY ticked if files are uploaded.

| Category | Enum Value | N5B Checkbox | Routes |
|----------|------------|--------------|--------|
| Tenancy Agreement | `TENANCY_AGREEMENT` | - | Both |
| Deposit Protection Cert | `DEPOSIT_PROTECTION_CERTIFICATE` | E | S21 |
| EPC | `EPC` | F | S21 |
| Gas Safety Cert | `GAS_SAFETY_CERTIFICATE` | G | S21 |
| Notice Service Proof | `NOTICE_SERVED_PROOF` | - | Both |
| Bank Statements | `BANK_STATEMENTS` | - | S8 |
| Correspondence | `CORRESPONDENCE` | - | Both |
| Other | `OTHER` | - | Both |

### Upload Truthfulness

**CRITICAL**: The N5B form checkboxes (E, F, G) declare that documents are ATTACHED to the claim.
Ticking these checkboxes without uploading the actual documents is a false statement.

The system enforces this via `hasUploadForCategory()` which checks `facts.evidence.files[]`:
- Checkbox E: Ticked only if file with category `deposit_protection_certificate` exists
- Checkbox F: Ticked only if file with category `epc` exists
- Checkbox G: Ticked only if file with category `gas_safety_certificate` exists

## Jurisdiction Assumptions

This wizard is designed for **England** under the Housing Act 1988.

### Notice Periods (England)

| Route | Ground | Minimum Notice |
|-------|--------|----------------|
| Section 21 | N/A | 2 months (60 days) |
| Section 8 | Ground 8 (serious arrears) | 14 days |
| Section 8 | Grounds 10, 11 | 2 months (60 days) |
| Section 8 | Ground 14 (nuisance) | 14 days |
| Section 8 | Other discretionary | 2 months (60 days) |

### Ground 8 Threshold

Ground 8 is a **mandatory ground** requiring:
- At least 2 months' rent arrears at the date of notice
- At least 2 months' rent arrears at the date of hearing

The arrears schedule (`arrears_items`) is validated using `validateGround8Eligibility()` from `arrears-engine.ts`.

## Documents Generated

### Section 21 Complete Pack
- Form 6A (Section 21 Notice)
- N5B (Claim form for accelerated possession)
- Eviction Roadmap (next steps guide)

### Section 8 Complete Pack
- Form 3 (Section 8 Notice)
- N5 (Claim form for possession)
- N119 (Particulars of claim)
- Arrears Schedule (if arrears grounds)
- Eviction Roadmap (next steps guide)

## Data Flow

1. User enters data in wizard sections
2. Data stored in `WizardFacts` (flat structure)
3. On generation, `wizardFactsToCaseFacts()` normalizes to `CaseFacts`
4. `wizardFactsToEnglandWalesEviction()` maps to `EvictionCase` and `CaseData`
5. `CaseData` populates court forms (N5, N5B, N119)
6. `EvictionCase` generates notice PDFs

## Blockers vs Warnings

### Blockers (Cannot Proceed)
- Missing required fields
- Section 21 compliance failures
- Ground 8 threshold not met (if Ground 8 selected)
- Unlicensed property requiring licence

### Warnings (Can Proceed with Risk)
- No evidence uploaded for key documents
- Short notice period

## Extensibility

The wizard architecture supports extension to Wales and Scotland:
- `jurisdiction` parameter controls section visibility
- Route-specific sections use `routes` array
- Ground definitions are config-driven
- Notice period calculations are jurisdiction-aware

## Files Changed

- `src/components/wizard/flows/EvictionSectionFlow.tsx` - Main flow component
- `src/components/wizard/sections/eviction/` - Section components
- `src/app/wizard/flow/page.tsx` - Updated to use new flow
- `config/mqs/complete_pack/england.yaml` - Updated MQS

## Tests

Run tests with:
```bash
npm test -- tests/complete-pack/england-eviction-wizard-redesign.test.ts
```

Tests verify:
- All required fields are collected
- Court form fields are populated (not just "pack generated")
- Arrears engine integration
- Joint parties handling
- Upload truthfulness

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.5.0 | 2024-12 | Complete wizard redesign with section-based flow |
| 2.4.0 | 2024-12 | Added rent_due_day, signatory details |
| 2.3.0 | 2024-12 | Added Section 8 date validation, joint tenants |
| 2.2.0 | 2024-12 | Added notice_service_method, court_name |
