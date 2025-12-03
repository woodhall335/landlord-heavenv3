# Scotland Eviction MQS Expansion - December 3, 2025

**Status:** ✅ Complete
**Scope:** Scotland eviction MQS files (notice_only + complete_pack)
**Reference:** V1_COMPLETION_CHECKLIST.md Sections 2.2, 4.1, 4.2

---

## Summary

Expanded Scotland eviction MQS files from basic capture to comprehensive ground-specific structured questions, bringing Scotland to parity with England & Wales eviction quality.

---

## Changes Made

### 1. `complete_pack/scotland.yaml` - v1.0.0 → v2.0.0

**Added 390+ lines** of ground-specific conditional questions:

#### Ground 1 - Rent Arrears
**New Fields:**
- `ground_1_arrears_months` (number) - How many consecutive months
- `ground_1_pre_action_met` (yes_no) - **MANDATORY** pre-action requirements
- `ground_1_pre_action_evidence` (textarea) - Documented pre-action steps
- `ground_1_arrears_narrative` (textarea) - Tribunal-ready narrative

**Maps To:**
- `rent_arrears_months` → decision_engine.yaml condition
- `pre_action_requirements_met` → decision_engine.yaml condition (Ground 1 rule)
- `ground_1_particulars` → Form E particulars

**Conditional:** Appears when "Ground 10 - Tenant in rent arrears" selected

#### Ground 2 - Breach of Tenancy
**New Fields:**
- `ground_2_breach_type` (multiselect) - Type of breach (subletting, pets, damage, etc.)
- `ground_2_breach_material` (yes_no) - Is breach serious/material?
- `ground_2_breach_continuing` (yes_no) - Continuing or likely to recur?
- `ground_2_breach_dates` (textarea) - Incident dates
- `ground_2_breach_clause` (textarea) - Which tenancy clauses breached
- `ground_2_narrative` (textarea) - Tribunal narrative

**Maps To:**
- `breach_of_tenancy` → decision_engine.yaml condition
- `breach_material` → decision_engine.yaml condition
- `breach_continuing` → decision_engine.yaml condition
- `ground_2_particulars` → Form E particulars

**Conditional:** Appears when "Ground 11 - Tenant in breach" selected

#### Ground 3 - Antisocial Behaviour
**New Fields:**
- `ground_3_asb_type` (multiselect) - Type of ASB (noise, violence, drugs, etc.)
- `ground_3_asb_incidents` (textarea) - Dated incident list
- `ground_3_evidence_available` (multiselect) - Evidence types (witnesses, police, photos)
- `ground_3_police_involved` (yes_no) - Police involvement?
- `ground_3_police_reference` (text) - Police reference numbers
- `ground_3_narrative` (textarea) - Tribunal narrative

**Maps To:**
- `antisocial_behavior` → decision_engine.yaml condition
- `evidence_available` → decision_engine.yaml condition
- `ground_3_particulars` → Form E particulars

**Conditional:** Appears when "Ground 12 - Antisocial behaviour" selected

#### Ground 4 - Landlord Intends to Occupy
**New Fields:**
- `ground_4_who_occupying` (select) - Landlord, spouse, child, parent, other
- `ground_4_occupation_date` (date) - When occupation will begin
- `ground_4_genuine_intention` (textarea) - Evidence of genuine intention
- `ground_4_alternative_accommodation` (yes_no) - Alternatives available?
- `ground_4_narrative` (textarea) - Tribunal narrative

**Maps To:**
- `landlord_intends_to_occupy` → decision_engine.yaml condition (Ground 4 rule)
- `genuine_intention` → decision_engine.yaml condition
- `no_alternative_accommodation` → decision_engine.yaml condition
- `ground_4_particulars` → Form E particulars

**Warning:** Cannot re-let within 3 months or face penalty (up to 6 months rent)

**Conditional:** Appears when "Ground 18 - Family member to move in" selected

#### Ground 5 - Landlord Intends to Sell
**New Fields:**
- `ground_5_sale_date` (date) - Target sale/marketing date
- `ground_5_valuation_obtained` (yes_no) - Property valued?
- `ground_5_estate_agent` (yes_no) - Agent instructed?
- `ground_5_estate_agent_name` (text) - Agent name
- `ground_5_valuation_amount` (currency) - Valuation/asking price
- `ground_5_sale_reason` (textarea) - Reason for sale
- `ground_5_narrative` (textarea) - Tribunal narrative

**Maps To:**
- `landlord_intends_to_sell` → decision_engine.yaml condition (Ground 5 rule)
- `sale_within_3_months` → decision_engine.yaml condition
- `evidence_of_intention` → decision_engine.yaml condition
- `ground_5_particulars` → Form E particulars

**Warning:** Must market within 3 months or face penalty (up to 6 months rent)

**Conditional:** Appears when "Ground 1 - Landlord intends to sell" selected

#### Ground 6 - Refurbishment
**New Fields:**
- `ground_6_works_description` (textarea) - Scope of works
- `ground_6_vacant_possession_required` (textarea) - Why vacant possession needed
- `ground_6_planning_obtained` (yes_no) - Planning permission/building warrant?
- `ground_6_funding_secured` (yes_no) - Funding secured?
- `ground_6_contractor_quotes` (yes_no) - Quotes obtained?
- `ground_6_works_cost` (currency) - Estimated cost
- `ground_6_works_duration` (text) - Expected duration
- `ground_6_architect_report` (yes_no) - Professional report?
- `ground_6_narrative` (textarea) - Tribunal narrative

**Maps To:**
- `substantial_works_planned` → decision_engine.yaml condition (Ground 6 rule)
- `vacant_possession_required` → decision_engine.yaml condition
- `planning_obtained` → decision_engine.yaml condition
- `funding_secured` → decision_engine.yaml condition
- `ground_6_particulars` → Form E particulars

**Conditional:** Appears when "Ground 3 - Landlord intends to refurbish" selected

---

### 2. `notice_only/scotland.yaml` - v1.0.0 → v2.0.0

**Added ground selection and particulars capture:**

#### New Questions:
- `eviction_grounds` (multiselect) - Which PRT grounds apply?
  - Ground 1 (rent arrears 3+ months)
  - Ground 2 (breach of tenancy)
  - Ground 3 (antisocial behaviour)
  - Ground 4 (landlord intends to occupy)
  - Ground 5 (landlord intends to sell)
  - Ground 6 (refurbishment required)
  - Ground 11 (not occupying as principal home)
  - Ground 12 (criminal conviction)
  - Ground 13 (mortgage lender repossession)
  - Other ground

- `ground_particulars` (textarea) - Specific details for each ground
  - Dates, amounts, incidents, or plans
  - Maps to Notice to Leave reason field

**Purpose:** Provides clearer Notice to Leave with proper ground-specific particulars

---

## Decision Engine Integration

All new fields map to expected fields in `config/jurisdictions/uk/scotland/rules/decision_engine.yaml`:

| Decision Engine Field | MQS Field(s) | Ground |
|---|---|---|
| `rent_arrears_months` | `ground_1_arrears_months` | Ground 1 |
| `pre_action_requirements_met` | `ground_1_pre_action_met` | Ground 1 |
| `breach_of_tenancy` | `ground_2_breach_material` | Ground 2 |
| `breach_material` | `ground_2_breach_material` | Ground 2 |
| `breach_continuing` | `ground_2_breach_continuing` | Ground 2 |
| `antisocial_behavior` | `ground_3_asb_type` (multiselect > 0) | Ground 3 |
| `evidence_available` | `ground_3_evidence_available` (multiselect > 0) | Ground 3 |
| `landlord_intends_to_occupy` | `ground_4_who_occupying` (not null) | Ground 4 |
| `genuine_intention` | `ground_4_genuine_intention` (text length > 0) | Ground 4 |
| `no_alternative_accommodation` | `ground_4_alternative_accommodation === "No"` | Ground 4 |
| `landlord_intends_to_sell` | `ground_5_sale_date` (not null) | Ground 5 |
| `sale_within_3_months` | `ground_5_sale_date < today + 3 months` | Ground 5 |
| `evidence_of_intention` | `ground_5_valuation_obtained === "Yes"` | Ground 5 |
| `substantial_works_planned` | `ground_6_works_description` (text length > 0) | Ground 6 |
| `vacant_possession_required` | `ground_6_vacant_possession_required` (text length > 0) | Ground 6 |
| `planning_obtained` | `ground_6_planning_obtained === "Yes"` | Ground 6 |
| `funding_secured` | `ground_6_funding_secured === "Yes"` | Ground 6 |

---

## Form E Integration

All Form E required fields now captured:

**Applicant (Landlord):**
- ✅ Full name, address, postcode, email, phone (already captured)
- ✅ Registration number (already captured)
- ✅ Second landlord (already captured)

**Respondent (Tenant):**
- ✅ Full name, email, phone (already captured)
- ✅ Second tenant (already captured)
- ✅ Occupants (already captured)

**Property:**
- ✅ Full address, postcode, property type (already captured)

**Tenancy:**
- ✅ Type, start date, rent amount, frequency (already captured)

**Grounds:**
- ✅ **NEW:** Structured ground-specific particulars for each PRT ground
- ✅ **NEW:** Tribunal-ready narratives for each ground

**Arrears:**
- ✅ Total arrears, arrears at notice date, schedule (already captured)

**Pre-action:**
- ✅ Letters sent, meetings, payment plans, summary (already captured)
- ✅ **NEW:** Ground 1 pre-action compliance flag

**Evidence:**
- ✅ Summary and uploads (already captured)

**Tribunal:**
- ✅ Sheriffdom, hearing preferences (already captured)

**Statement of Truth:**
- ✅ Signatory name, date (already captured)

---

## Ground Coverage

**Fully Covered (with structured questions):**
- ✅ Ground 1 - Rent arrears
- ✅ Ground 2 - Breach of tenancy
- ✅ Ground 3 - Antisocial behaviour
- ✅ Ground 4 - Landlord intends to occupy
- ✅ Ground 5 - Landlord intends to sell
- ✅ Ground 6 - Refurbishment

**Covered via existing fields + generic explanation:**
- Ground 7 - HMO licensing (via HMO questions + ground explanation)
- Ground 8 - Non-residential use (via property type + ground explanation)
- Ground 9 - Statutory overcrowding (via occupants + ground explanation)
- Ground 10 - Landlord not registered (captured in landlord_registration_number)
- Ground 11 - Not occupying as principal home (captured in ground explanation)
- Ground 12 - Criminal conviction (captured in ground explanation)
- Ground 13 - Mortgage repossession (captured in ground explanation)
- Ground 14-24 - Various (captured in ground explanation)

---

## Legal Compliance

**Pre-Action Requirements (Ground 1):**
- ✅ Explicit yes/no flag: `ground_1_pre_action_met`
- ✅ Evidence textarea: `ground_1_pre_action_evidence`
- ✅ Decision engine blocks Ground 1 if `pre_action_requirements_met === false`

**Penalties (Grounds 4 & 5):**
- ✅ Helper text warns about 3-month re-letting prohibition
- ✅ Helper text warns about 6 months rent penalty if breached

**Tribunal Discretion:**
- ✅ All grounds flagged as discretionary (tribunal has final say)
- ✅ Narratives encourage "reasonableness" explanations
- ✅ Evidence capture emphasized for tribunal assessment

---

## Suggestion Prompts (Ask Heaven Integration)

Each ground-specific question has tailored `suggestion_prompt` for Ask Heaven:

**Ground 1:** Emphasizes pre-action requirements documentation
**Ground 2:** Guides materiality assessment, continuing breach analysis
**Ground 3:** Stresses evidence types, multiple incidents, professional involvement
**Ground 4:** Helps prove genuine intention, warns about penalties
**Ground 5:** Guides evidence of sale preparations, warns about marketing deadline
**Ground 6:** Emphasizes substantial works, professional evidence, planning/funding

---

## Testing Requirements

**Manual Testing Needed:**
1. Start a Scotland complete_pack wizard
2. Select each ground (1-6) and verify conditional questions appear
3. Complete all ground-specific fields
4. Verify data flows to CaseFacts correctly
5. Generate Form E and verify all fields populated
6. Generate Notice to Leave and verify ground particulars included

**Automated Testing (Recommended):**
```bash
# Test MQS loading
npm run test -- mqs-loader.test.ts

# Test wizard flow
npm run test -- wizard-scotland.test.ts

# Test Form E generation
npm run test -- scotland-forms-filler.test.ts
```

---

## V1_COMPLETION_CHECKLIST.md Updates

**Section 2.2 - Scotland Eviction MQS Expansion:**
- [x] Ground-by-ground detail questions (Grounds 1-6)
- [x] Form E required fields
- [x] Alignment with blueprint Scotland section

**Section 4.1 - MQS & Decision Engine:**
- [x] Scotland MQS expanded to v2.0.0
- [x] All decision_engine.yaml fields captured
- [x] Pre-action compliance logic wired

**Section 4.2 - Tribunal Bundle & Form E:**
- [x] All Form E data captured in MQS
- [~] Runtime verification needed (scotland-forms-filler.ts mapping)

---

## File Changes Summary

**Modified Files:**
1. `config/mqs/complete_pack/scotland.yaml`
   - v1.0.0 → v2.0.0
   - +390 lines (ground-specific questions)
   - +6 ground sections (Ground 1-6)

2. `config/mqs/notice_only/scotland.yaml`
   - v1.0.0 → v2.0.0
   - +38 lines (ground selection + particulars)

3. `docs/V1_COMPLETION_CHECKLIST.md`
   - Section 2.2: Marked complete
   - Section 4.1: Marked complete (MQS + decision engine)
   - Section 4.2: Marked partial (needs runtime verification)

4. `docs/SCOTLAND_MQS_EXPANSION.md` (NEW)
   - This document

---

## Next Steps

**Immediate (V1):**
1. Manual testing of Scotland wizard flows
2. Verify Form E PDF generation with new fields
3. Verify Notice to Leave generation with ground particulars

**Future (V2+):**
1. Add ground-specific questions for Grounds 7-24 (if needed)
2. Enhanced validation rules per ground
3. Automated tests for all Scotland ground flows
4. Bundle builder integration verification

---

**Implementation Date:** December 3, 2025
**Implemented By:** Claude Code
**Version:** MQS v2.0.0 (Scotland evictions)
**Lines Added:** ~430 lines across 2 MQS files
**Grounds Covered:** 6 major PRT grounds with full structured capture
