# Notice Only Support Matrix — Source of Truth

**Version:** 1.0.0
**Last Updated:** 2025-12-16
**Status:** Production-Grade Definition

This document defines the **complete** and **canonical** Notice Only support across all UK jurisdictions.

---

## Supported Jurisdictions

| Jurisdiction | Canonical ID | Notice Only Support | Routes |
|-------------|--------------|---------------------|---------|
| **England** | `england` | ✅ Full | `section_8`, `section_21` |
| **Wales** | `wales` | ✅ Full | `wales_section_173`, `wales_fault_based`* |
| **Scotland** | `scotland` | ✅ Full | `notice_to_leave` |
| Northern Ireland | `northern-ireland` | ❌ NOT SUPPORTED | N/A |

\* wales_fault_based implementation is in progress

---

## England — Notice Only Routes

### Route: `section_8` (Fault-Based)

**Legal Basis:** Housing Act 1988, Section 8

**MSQ File:**
```
config/mqs/notice_only/england.yaml
```

**Main Notice Template:**
```
config/jurisdictions/uk/england/templates/eviction/section8_notice.hbs
```

**Supporting Documents Rendered:**
1. **Service Instructions** - `config/jurisdictions/uk/england/templates/eviction/service_instructions.hbs`
2. **Compliance Checklist** - `config/jurisdictions/uk/england/templates/eviction/compliance_checklist.hbs`
3. **Next Steps Guide** - `config/jurisdictions/uk/england/templates/eviction/next_steps_guide.hbs`
4. **Compliance Audit** - `config/jurisdictions/uk/england/templates/eviction/compliance-audit.hbs`

**Supported Grounds:**
- Ground 1 (Landlord previously occupied)
- Ground 8 (Serious rent arrears - MANDATORY)
- Ground 10 (Some rent arrears)
- Ground 11 (Persistent rent delays)
- Ground 12 (Breach of tenancy obligations)
- Ground 13 (Deterioration of dwelling)
- Ground 14 (Nuisance/antisocial behaviour)
- Ground 14A (Domestic violence)

**Required Computed Dates:**
- `service_date` - Date notice is given (today or future date)
- `earliest_proceedings_date` - Earliest date court proceedings can begin
  - Mandatory grounds (Ground 8): 14 days after service
  - Discretionary grounds: 60 days after service (or end of fixed term if later)
- `expiry_date` - Same as earliest_proceedings_date

**Party Terminology:**
- Landlord: "landlord"
- Tenant: "tenant"

---

### Route: `section_21` (No-Fault)

**Legal Basis:** Housing Act 1988, Section 21 / Form 6A (prescribed form)

**MSQ File:**
```
config/mqs/notice_only/england.yaml
```

**Main Notice Template:**
```
config/jurisdictions/uk/england/templates/eviction/section21_form6a.hbs
```

**Supporting Documents Rendered:**
1. **Service Instructions** - `config/jurisdictions/uk/england/templates/eviction/service_instructions.hbs`
2. **Compliance Checklist** - `config/jurisdictions/uk/england/templates/eviction/compliance_checklist.hbs`
3. **Next Steps Guide** - `config/jurisdictions/uk/england/templates/eviction/next_steps_guide.hbs`
4. **Compliance Audit** - `config/jurisdictions/uk/england/templates/eviction/compliance-audit.hbs`

**Compliance Requirements (Strictly Enforced):**
- Deposit protection in approved scheme
- Prescribed information given within 30 days of deposit
- Gas Safety Certificate provided (if applicable)
- Energy Performance Certificate (EPC) provided
- "How to Rent" guide provided (for tenancies starting after 1 Oct 2015)
- No outstanding property licensing breaches
- No outstanding repair/improvement notices (Section 21(4ZA))

**Required Computed Dates:**
- `service_date` - Date notice is given
- `expiry_date` - Earliest date tenant must leave (2 months after service, or end of fixed term)
- `earliest_proceedings_date` - Same as expiry_date

**Party Terminology:**
- Landlord: "landlord"
- Tenant: "tenant"

---

## Wales — Notice Only Routes

### Route: `wales_section_173` (No-Fault)

**Legal Basis:** Renting Homes (Wales) Act 2016, Section 173

**MSQ File:**
```
config/mqs/notice_only/wales.yaml
```

**Main Notice Template:**
```
config/jurisdictions/uk/wales/templates/eviction/section173_landlords_notice.hbs
```

**Supporting Documents Rendered:**
1. **Service Instructions** - `config/jurisdictions/uk/england/templates/eviction/service_instructions.hbs` (with `jurisdiction: 'Wales'`)
2. **Compliance Checklist** - `config/jurisdictions/uk/england/templates/eviction/compliance_checklist.hbs` (with `is_wales: true`)
3. **Next Steps Guide** - `config/jurisdictions/uk/england/templates/eviction/next_steps_guide.hbs` (with Wales context)

**Contract Type Restrictions:**
- ✅ **Allowed:** Standard occupation contracts
- ❌ **Blocked:** Supported standard contracts, Secure contracts

**Compliance Requirements:**
- Rent Smart Wales registration (MANDATORY)
- Deposit protection (if applicable)
- 6-month prohibited period (cannot serve notice in first 6 months)

**Required Computed Dates:**
- `service_date` - Date notice is given
- `expiry_date` - 2 months after service (6 months if within first 4 years of occupation)
- `earliest_proceedings_date` - Same as expiry_date

**Party Terminology:**
- Landlord: "landlord"
- Tenant: "contract holder" (Welsh legal terminology)
- Tenancy: "occupation contract"

---

### Route: `wales_fault_based` (Fault-Based)

**Legal Basis:** Renting Homes (Wales) Act 2016, Sections 157, 159, 161, 162

**MSQ File:**
```
config/mqs/notice_only/wales.yaml
```

**Main Notice Template:**
```
⚠️ NOT YET IMPLEMENTED - Returns placeholder document
Future location: config/jurisdictions/uk/wales/templates/eviction/wales_fault_based_notice.hbs
```

**Supporting Documents Rendered:**
- Same as wales_section_173 (when implemented)

**Supported Sections:**
- Section 157 (Serious rent arrears - 8 weeks/2 months)
- Section 159 (Some rent arrears - 2 weeks/1 month)
- Section 161 (Antisocial behaviour)
- Section 162 (Breach of contract)

**Required Computed Dates:**
- `service_date`
- `expiry_date` (14 days for serious grounds, 2 months for other grounds)
- `earliest_proceedings_date`

**Party Terminology:**
- Landlord: "landlord"
- Tenant: "contract holder"
- Tenancy: "occupation contract"

---

## Scotland — Notice Only Routes

### Route: `notice_to_leave` (All Grounds)

**Legal Basis:** Private Housing (Tenancies) (Scotland) Act 2016

**MSQ File:**
```
config/mqs/notice_only/scotland.yaml
```

**Main Notice Template:**
```
config/jurisdictions/uk/scotland/templates/eviction/notice_to_leave.hbs
```

**Supporting Documents Rendered:**
1. **Service Instructions** - `config/jurisdictions/uk/scotland/templates/eviction/service_instructions.hbs`
2. **Pre-Action Checklist** - `config/jurisdictions/uk/scotland/templates/eviction/pre_action_checklist.hbs` (Ground 1 only)
3. **Tribunal Guide** - `config/jurisdictions/uk/scotland/templates/eviction/tribunal_guide.hbs`
4. **Compliance Audit** - `config/jurisdictions/uk/scotland/templates/eviction/compliance-audit.hbs`

**Supported Grounds (All Discretionary):**
- Ground 1 (Rent arrears - 3+ consecutive months or 3+ months over 6 months)
- Ground 2 (Breach of tenancy obligations)
- Ground 3 (Antisocial behaviour)
- Ground 4 (Landlord intends to occupy)
- Ground 5 (Landlord intends to sell)
- Ground 6 (Refurbishment works)
- Ground 11 (Landlord not registered)
- Ground 12 (Non-resident landlord HMO)
- Ground 13 (Overcrowding)
- Ground 18 (Other grounds approved by sheriff)

**Pre-Action Requirements:**
- **Mandatory for Ground 1** (rent arrears):
  - Written notice to tenant
  - Signposting to debt advice services
  - Reasonable attempts to contact tenant
  - Documented in `pre_action_contact` MSQ question

**Required Computed Dates:**
- `service_date` - Date notice is given
- `expiry_date` - Notice period expiry:
  - 28 days for serious grounds (Grounds 1, 2, 3)
  - 84 days for other grounds (Grounds 4, 5, 6, 11, 12, 13)
- `earliest_tribunal_application_date` - Same as expiry_date (Scotland uses Tribunal, not court)

**Tribunal Considerations:**
- All grounds are discretionary (subject to reasonableness test)
- Tribunal must consider proportionality, conduct of parties, alternatives
- Penalties for misuse: Up to 6 months' rent in damages

**Party Terminology:**
- Landlord: "landlord"
- Tenant: "tenant"
- Tenancy: "private residential tenancy" (PRT)

---

## Computed Date Functions

All date computations are handled by the decision engine and mappers.

### England/Wales Section 21 & Wales Section 173

**Function:** `calculateNoticeExpiryDate()`
**Logic:**
```
expiry_date = MAX(
  service_date + 2 months,
  fixed_term_end_date (if in fixed term)
)
```

### England Section 8

**Function:** `calculateEarliestProceedingsDate()`
**Logic:**
```
if (any ground is mandatory, e.g., Ground 8):
  earliest_proceedings_date = service_date + 14 days
else:
  earliest_proceedings_date = MAX(
    service_date + 60 days,
    fixed_term_end_date (if in fixed term)
  )
```

### Wales Fault-Based

**Logic:**
```
if (Section 157 - serious rent arrears):
  expiry_date = service_date + 14 days
else:
  expiry_date = service_date + 2 months
```

### Scotland Notice to Leave

**Function:** `calculateScotlandNoticeExpiryDate()`
**Logic:**
```
if (ground in [1, 2, 3]): // Serious grounds
  expiry_date = service_date + 28 days
else: // Other grounds
  expiry_date = service_date + 84 days
```

---

## Critical Template Variables (Required Fields)

### All Jurisdictions (Common)

These fields **must** render for every notice:

| Variable | Source | Notes |
|----------|--------|-------|
| `landlord_full_name` | MSQ: `landlord_full_name` | Primary landlord name |
| `landlord_address` | Concatenated: `landlord_address_line1` + `line2` + `city` + `postcode` | Full address with line breaks |
| `tenant_full_name` | MSQ: `tenant_full_name` | Primary tenant name |
| `property_address` | Concatenated: `property_address_line1` + `line2` + `city` + `postcode` | Full property address |
| `tenancy_start_date` | MSQ: `tenancy_start_date` | Formatted DD/MM/YYYY |
| `service_date` | Computed or MSQ | Date notice is given |
| `expiry_date` | Computed | Date tenant must leave (or earliest proceedings date) |

### England/Wales Specific

| Variable | Source | Required For |
|----------|--------|--------------|
| `deposit_protected_scheme` | MSQ: `deposit_protected_scheme` | Section 21, Section 173 |
| `prescribed_info_given` | MSQ: `prescribed_info_given` | Section 21 |
| `epc_provided` | MSQ: `epc_provided` | Section 21 |
| `how_to_rent_provided` | MSQ: `how_to_rent_provided` | Section 21 (post-2015) |
| `gas_safety_certificate` | MSQ: `gas_safety_certificate` | All routes (if gas present) |
| `selected_grounds` | MSQ: `section_8_grounds` (processed) | Section 8 |
| `rent_smart_wales_registered` | MSQ: `rent_smart_wales_registered` | Section 173 (Wales) |

### Scotland Specific

| Variable | Source | Required For |
|----------|--------|--------------|
| `eviction_grounds` | MSQ: `eviction_grounds` (multiselect) | All notices |
| `ground_particulars` | MSQ: `ground_particulars` | All notices |
| `rent_amount` | MSQ: `rent_amount` | Ground 1 (arrears) |
| `arrears_amount` | MSQ: `arrears_amount` | Ground 1 |
| `pre_action_contact` | MSQ: `pre_action_contact` | Ground 1 (mandatory) |
| `deposit_protected_scheme` | MSQ: `deposit_protection_scheme` | All notices |
| `landlord_reg_number` | MSQ: `landlord_reg_number` | All notices |

---

## Decision Engine Integration

The decision engine validates routes and blocks illegal combinations:

| Scenario | Decision | Notice Only Action |
|----------|----------|-------------------|
| England + Section 21 + No deposit protection | ❌ Blocked | Error: "Section 21 not available" |
| Wales + Section 173 + Supported contract | ❌ Blocked | Error: "Section 173 only for standard contracts" |
| Wales + Section 21 | ❌ Blocked | Error: "Section 21 abolished in Wales" |
| Scotland + Section 21 | ❌ Blocked | Error: "Section 21 does not exist in Scotland" |
| Scotland + Ground 1 + No pre-action | ⚠️ Warning | Pre-action checklist required |
| England + Section 8 + Ground 8 + No arrears | ❌ Blocked | Error: "Ground 8 requires 2+ months arrears" |

---

## Ask Heaven Integration

Ask Heaven is enabled for all **textarea/text/longtext** questions in Notice Only MSQs.

**Jurisdiction Context Provided:**
- Canonical jurisdiction (`england`, `wales`, `scotland`)
- Current route (`section_8`, `wales_section_173`, `notice_to_leave`, etc.)
- Decision engine output (blocking issues, recommended grounds)
- Full wizard facts (for consistency checking)

**Ask Heaven Responsibilities:**
- Suggest legally accurate wording for ground particulars
- Flag missing evidence
- Warn about illegal routes (e.g., Section 21 in Wales)
- Respect decision engine blocking (cannot override legal rules)

**Example Questions Enhanced:**
- `ground_particulars` (Scotland)
- `ground_8_particulars` (England)
- `antisocial_details` (all jurisdictions)

---

## PDF Preview Generation

**API Endpoint:** `GET /api/notice-only/preview/[caseId]`

**Output:** Single merged PDF with:
1. Table of contents (optional)
2. Main notice (with preview watermark)
3. Supporting documents (service instructions, compliance checklist, next steps guide)
4. Page numbers and watermarks on every page

**Watermark Text:**
```
"PREVIEW - Complete Purchase (£29.99) to Download"
```

**Header Band:** `"PREVIEW - NOT FOR COURT USE"`

**Footer:** `"PREVIEW ONLY"`

---

## Status Summary

| Jurisdiction | Route | MSQ | Template | Supporting Docs | Preview API | Status |
|-------------|-------|-----|----------|-----------------|-------------|--------|
| England | section_8 | ✅ | ✅ | ✅ (4 docs) | ✅ | **PRODUCTION** |
| England | section_21 | ✅ | ✅ | ✅ (4 docs) | ✅ | **PRODUCTION** |
| Wales | wales_section_173 | ✅ | ✅ | ✅ (3 docs) | ✅ | **PRODUCTION** |
| Wales | wales_fault_based | ✅ | ⚠️ Placeholder | ⚠️ Shared | ⚠️ Returns placeholder | **IN PROGRESS** |
| Scotland | notice_to_leave | ✅ | ✅ | ✅ (4 docs) | ✅ | **PRODUCTION** |

---

## Change Control

Any changes to Notice Only support **must**:
1. Update this matrix first
2. Implement code changes
3. Update field map (NOTICE_ONLY_FIELD_MAP.md)
4. Run E2E proof script
5. Generate PDFs for affected routes
6. Commit all changes together

This matrix is the **single source of truth** for Notice Only. Code that contradicts this matrix is **incorrect**.

---

**End of Support Matrix**
