# Money Claim Workflow End-to-End Audit Report

**Generated:** 2025-12-09
**Branch:** claude/audit-money-claim-wizard-01GjxEhfRS7ZnCjVPDxt1oM1

---

## Executive Summary

This audit examines the money claim workflow from wizard data collection through document generation, including:
- 11 wizard components capturing user input
- Facts normalization pipeline (wizard facts → case facts)
- Mapper layer (case facts → pack generator format)
- Pack generation with 11+ templates per jurisdiction
- AskHeaven AI integration for drafting assistance

**Key Findings:**
- ✅ All core mappings are present and functional
- ⚠️ Several wizard fields lack downstream consumers
- ⚠️ Property address field naming inconsistency (city vs town_city)
- ✅ All templates exist and are referenced correctly
- ⚠️ AskHeaven is invoked but NOT used to generate LBA/PoC/Evidence Index content

---

## 1. Wizard Components → Facts Mapping

### 1.1 ClaimDetailsSection
**File:** `src/components/wizard/money-claim/ClaimDetailsSection.tsx:18-173`

**Writes to `facts.money_claim`:**
- ✅ `basis_of_claim` (textarea)
- ✅ `other_amounts_summary` (textarea)
- ✅ `charge_interest` (boolean)
- ✅ `interest_start_date` (date)
- ✅ `interest_rate` (number)

**Status:** All fields are consumed by normalize.ts and pack generators.

---

### 1.2 ArrearsSection
**File:** `src/components/wizard/money-claim/ArrearsSection.tsx:10-83`

**Writes to:**
- ✅ `issues.rent_arrears.total_arrears`
- ✅ `money_claim.basis_of_claim` (duplicate of ClaimDetailsSection)
- ⚠️ `money_claim.other_charges_notes` (NOT consumed by mapper or generator)

**Issues:**
- `other_charges_notes` is written but never read by:
  - `wizardFactsToCaseFacts` (normalize.ts)
  - `mapCaseFactsToMoneyClaimCase` (money-claim-wizard-mapper.ts)
  - `generateEnglandWalesMoneyClaimPack` (money-claim-pack-generator.ts)

---

### 1.3 ClaimantSection
**File:** `src/components/wizard/money-claim/ClaimantSection.tsx:10-183`

**Writes to `parties.landlord`:**
- ✅ `name`
- ✅ `co_claimant`
- ✅ `email`
- ✅ `phone`
- ✅ `address_line1`
- ✅ `address_line2`
- ✅ `city`
- ✅ `postcode`

**Writes to `money_claim`:**
- ✅ `reference` (claimant_reference)

**Status:** All fields consumed correctly.

---

### 1.4 DamagesSection
**File:** `src/components/wizard/money-claim/DamagesSection.tsx:19-187`

**Writes to `money_claim`:**
- ✅ `damage_items` (array of `{id, category, description, amount}`)
- ⚠️ `other_costs_notes` (NOT consumed downstream)

**Issues:**
- `other_costs_notes` written but not read by normalize.ts or mappers.

---

### 1.5 EnforcementSection
**File:** `src/components/wizard/money-claim/EnforcementSection.tsx:13-80`

**Writes to `money_claim`:**
- ✅ `enforcement_preferences` (array of strings)

**Status:** Passed through to pack templates but NOT used by official forms.

---

### 1.6 DefendantSection
**File:** `src/components/wizard/money-claim/DefendantSection.tsx:10-103`

**Writes to `parties.tenants`:**
- ✅ `tenants[0].name`
- ✅ `tenants[0].email`
- ✅ `tenants[0].phone`
- ✅ `tenants[1].name` (optional co-defendant)

**Status:** All fields consumed.

---

### 1.7 EvidenceSection
**File:** `src/components/wizard/money-claim/EvidenceSection.tsx:15-63`

**Writes to `evidence`:**
- ✅ `files` (array of `EvidenceFileSummary`)

**Status:** Files tracked but not directly mapped into official forms (handled separately by evidence index).

---

### 1.8 TimelineSection
**File:** `src/components/wizard/money-claim/TimelineSection.tsx:15-246`

**Writes to `tenancy`:**
- ✅ `start_date`
- ✅ `end_date`
- ✅ `rent_amount`
- ✅ `rent_frequency`
- ✅ `rent_due_day`
- ✅ `deposit_amount`
- ✅ `deposit_scheme_name`
- ✅ `deposit_reference`

**Writes to `property`:**
- ✅ `address_line1`
- ✅ `address_line2`
- ✅ `city`
- ✅ `postcode`

**Status:** All fields consumed.

---

### 1.9 TenancySection
**File:** `src/components/wizard/money-claim/TenancySection.tsx:15-201`

**Writes to `property`:**
- ✅ `address_line1`
- ✅ `address_line2`
- ⚠️ `town_city` (should be `city`)
- ✅ `postcode`

**Writes to `tenancy`:**
- ✅ `start_date`
- ✅ `end_date`
- ✅ `rent_amount`
- ✅ `rent_frequency`
- ✅ `rent_due_day`
- ✅ `usual_payment_weekday`

**Issues:**
- Uses `property.town_city` instead of `property.city` (inconsistent with TimelineSection)
- `usual_payment_weekday` written but NOT consumed by normalize.ts

---

### 1.10 PreActionSection
**File:** `src/components/wizard/money-claim/PreActionSection.tsx:13-115`

**Writes to `money_claim`:**
- ✅ `lba_date`
- ✅ `lba_response_deadline`
- ✅ `lba_method` (array, split by comma)
- ✅ `pap_documents_sent` (array)

**Status:** All fields consumed by normalize.ts and used in templates.

---

### 1.11 ReviewSection
**File:** `src/components/wizard/money-claim/ReviewSection.tsx:13-102`

**API Calls:**
- Preview: `GET /api/money-claim/preview/{caseId}`
- Generate: `GET /api/money-claim/pack/{caseId}`

**Status:** No facts written, only triggers pack generation.

---

## 2. Facts Normalization (wizardFactsToCaseFacts)

**File:** `src/lib/case-facts/normalize.ts:383-1356`

### 2.1 Money Claim Fields Mapped

The normalize function maps wizard facts to CaseFacts structure. Key money_claim mappings:

| Wizard Key | CaseFacts Path | Status |
|------------|----------------|--------|
| `charge_interest` | `money_claim.charge_interest` | ✅ Mapped (lines 1031-1037) |
| `interest_start_date` | `money_claim.interest_start_date` | ✅ Mapped (lines 1038-1041) |
| `interest_rate` | `money_claim.interest_rate` | ✅ Mapped (lines 1042-1049) |
| `damage_items` | `money_claim.damage_items` | ✅ Mapped (lines 1006-1017) |
| `lba_date` | `money_claim.lba_date` | ✅ Mapped (lines 1067-1070) |
| `lba_method` | `money_claim.lba_method` | ✅ Mapped (lines 1071-1074) |
| `lba_response_deadline` | `money_claim.lba_response_deadline` | ✅ Mapped (lines 1075-1078) |
| `pap_documents_sent` | `money_claim.pap_documents_sent` | ✅ Mapped (lines 1079-1089) |
| `enforcement_preferences` | `money_claim.enforcement_preferences` | ✅ Mapped (lines 1243-1251) |
| `basis_of_claim` | `money_claim.basis_of_claim` | ✅ Mapped (lines 1172-1185) |

### 2.2 Unmapped Wizard Fields

**Missing from normalize.ts:**
- ❌ `money_claim.other_charges_notes` (written by ArrearsSection line 77)
- ❌ `money_claim.other_costs_notes` (written by DamagesSection line 62)
- ❌ `money_claim.other_amounts_summary` (written by ClaimDetailsSection line 30)
- ❌ `tenancy.usual_payment_weekday` (written by TenancySection line 186)

### 2.3 Property Address Inconsistency

**Issue:** Two different field names used:
- TimelineSection writes `property.city` (line 97)
- TenancySection writes `property.town_city` (line 81)
- normalize.ts maps both `property_city` and `property_address_town` to `property.city` (lines 428-433)

**Risk:** If user fills TenancySection, `town_city` may not be picked up.

---

## 3. CaseFacts → MoneyClaimCase Mapping

**File:** `src/lib/documents/money-claim-wizard-mapper.ts:24-139`

### 3.1 England & Wales Mapper (mapCaseFactsToMoneyClaimCase)

**Successfully Mapped Fields:**
- ✅ All landlord details (name, address, email, phone, co_claimant)
- ✅ All tenant details (name for tenant 1 & 2)
- ✅ Property address (address_line1, address_line2, city, postcode)
- ✅ Tenancy details (rent_amount, rent_frequency, payment_day, start_date, end_date)
- ✅ Arrears (total, schedule items)
- ✅ Damage items
- ✅ Interest (rate, start_date)
- ✅ Court fees, solicitor costs
- ✅ Service contact address

**Not Mapped:**
- ❌ `other_charges_notes` (not in CaseFacts schema)
- ❌ `other_costs_notes` (not in CaseFacts schema)
- ❌ `other_amounts_summary` (not in CaseFacts schema)
- ⚠️ `enforcement_preferences` - exists in CaseFacts but not mapped to MoneyClaimCase type

### 3.2 Scotland Mapper (mapCaseFactsToScotlandMoneyClaimCase)

**Successfully Mapped Fields:**
- ✅ All core fields from England & Wales mapper
- ✅ `sheriffdom` (Scotland-specific)
- ✅ `basis_of_claim` (mapped, line 131)
- ✅ `attempts_to_resolve` (mapped, line 132)
- ✅ `evidence_summary` (mapped, line 133)

**Not Mapped:**
- ❌ Same unmapped fields as England & Wales

---

## 4. Pack Generator → Template Mapping

### 4.1 England & Wales Pack Generator
**File:** `src/lib/documents/money-claim-pack-generator.ts:294-546`

**Templates Referenced (11 total):**

| Template Path | Exists | Status |
|---------------|--------|--------|
| `uk/england-wales/templates/money_claims/pack_cover.hbs` | ✅ | `config/jurisdictions/uk/england-wales/templates/money_claims/pack_cover.hbs` |
| `uk/england-wales/templates/money_claims/particulars_of_claim.hbs` | ✅ | Found |
| `uk/england-wales/templates/money_claims/schedule_of_arrears.hbs` | ✅ | Found |
| `uk/england-wales/templates/money_claims/interest_workings.hbs` | ✅ | Found |
| `uk/england-wales/templates/money_claims/evidence_index.hbs` | ✅ | Found |
| `uk/england-wales/templates/money_claims/hearing_prep_sheet.hbs` | ✅ | Found |
| `uk/england-wales/templates/money_claims/letter_before_claim.hbs` | ✅ | Found (PAP-DEBT) |
| `uk/england-wales/templates/money_claims/information_sheet_for_defendants.hbs` | ✅ | Found |
| `uk/england-wales/templates/money_claims/reply_form.hbs` | ✅ | Found |
| `uk/england-wales/templates/money_claims/financial_statement_form.hbs` | ✅ | Found |
| `uk/england-wales/templates/money_claims/filing_guide.hbs` | ✅ | Found |

**Official Forms:**
- ✅ N1_1224.pdf (assertion at line 508)

**Status:** All templates exist. No missing files.

### 4.2 Scotland Pack Generator
**File:** `src/lib/documents/scotland-money-claim-pack-generator.ts:294-516`

**Templates Referenced (9 total):**

| Template Path | Exists | Status |
|---------------|--------|--------|
| `uk/scotland/templates/money_claims/pack_cover.hbs` | ✅ | Found |
| `uk/scotland/templates/money_claims/simple_procedure_particulars.hbs` | ✅ | Found |
| `uk/scotland/templates/money_claims/schedule_of_arrears.hbs` | ✅ | Found |
| `uk/scotland/templates/money_claims/interest_calculation.hbs` | ✅ | Found |
| `uk/scotland/templates/money_claims/evidence_index.hbs` | ✅ | Found |
| `uk/scotland/templates/money_claims/hearing_prep_sheet.hbs` | ✅ | Found |
| `uk/scotland/templates/money_claims/pre_action_letter.hbs` | ✅ | Found |
| `uk/scotland/templates/money_claims/filing_guide_scotland.hbs` | ✅ | Found |

**Official Forms:**
- ✅ `scotland/simple_procedure_claim_form.pdf` (assertion at line 477)

**Status:** All templates exist. No missing files.

---

## 5. AskHeaven Integration

### 5.1 Panel Component
**File:** `src/components/wizard/AskHeavenPanel.tsx:38-461`

**Features:**
1. **Writing Helper** (lines 127-171)
   - Calls `/api/wizard/answer` with mode: 'enhance_only'
   - Returns `suggested_wording`, `missing_information`, `evidence_suggestions`, `consistency_flags`

2. **Q&A Helper** (lines 179-221)
   - Calls `/api/wizard/ask-heaven` with case context
   - Provides conversational guidance

### 5.2 API Integration
**File:** `src/app/api/wizard/answer/route.ts:704-734`

**AskHeaven Flow:**
1. User submits answer → saved to DB
2. `enhanceAnswer()` called with question context (line 707)
3. Enhanced response saved to conversations table (lines 722-733)
4. Returned to client in response (lines 755-772)

### 5.3 What AskHeaven Does vs Doesn't Do

**✅ Currently Used For:**
- Improving user's text answers in real-time
- Suggesting missing information
- Flagging inconsistencies
- Providing Q&A guidance

**❌ NOT Used For:**
- Generating Letter Before Action content
- Generating Particulars of Claim
- Generating Evidence Index descriptions
- Generating Schedule of Loss narratives

**Gap Analysis:**
The templates (letter_before_claim.hbs, particulars_of_claim.hbs, evidence_index.hbs) use simple Handlebars variable substitution. **AskHeaven AI is NOT used to draft these critical legal documents** despite being available in the system.

---

## 6. Critical Gaps & Missing Fields

### 6.1 Wizard → Normalize Gaps

**Unused Fields (written but never consumed):**

| Field | Written By | Line | Status |
|-------|------------|------|--------|
| `money_claim.other_charges_notes` | ArrearsSection | 77 | ❌ Not in normalize.ts |
| `money_claim.other_costs_notes` | DamagesSection | 62 | ❌ Not in normalize.ts |
| `money_claim.other_amounts_summary` | ClaimDetailsSection | 30 | ❌ Not in normalize.ts |
| `tenancy.usual_payment_weekday` | TenancySection | 186 | ❌ Not in normalize.ts |

**Recommendation:** Either:
- Add these fields to normalize.ts and CaseFacts schema, OR
- Remove them from wizard components if not needed

### 6.2 Property Address Inconsistency

**Problem:**
- TimelineSection (line 97): writes `property.city`
- TenancySection (line 81): writes `property.town_city`
- normalize.ts (lines 428-433): maps both to `property.city`, but direct wizard access may fail

**Fix:** Standardize on `property.city` in both components.

### 6.3 Interest Calculation (Section 69)

**Status:** ✅ Fully Implemented

**Evidence:**
- ClaimDetailsSection captures `charge_interest`, `interest_start_date`, `interest_rate` (lines 31-36)
- normalize.ts maps all interest fields (lines 1031-1049)
- Pack generator calculates interest_to_date and daily_interest (lines 174-178)
- Template `interest_workings.hbs` exists and is included in pack

**No gaps found.**

### 6.4 PAP (Pre-Action Protocol) Compliance

**Status:** ✅ Fully Implemented

**Evidence:**
- PreActionSection captures `lba_date`, `lba_response_deadline`, `lba_method`, `pap_documents_sent` (lines 44-111)
- Pack generator includes:
  - `letter_before_claim.hbs` (line 427)
  - `information_sheet_for_defendants.hbs` (line 443)
  - `reply_form.hbs` (line 459)
  - `financial_statement_form.hbs` (line 474)
- `buildPreActionSummary()` function generates PAP compliance narrative (lines 199-238)

**Gap:** AskHeaven NOT used to generate or review PAP content. Templates use static Handlebars only.

### 6.5 Enforcement Guidance

**Status:** ⚠️ Partially Implemented

**Evidence:**
- EnforcementSection captures preferences (attachment of earnings, warrant of control, charging order)
- Data passed to templates via `enforcement_preferences` (line 310)
- **BUT:** No dedicated enforcement guidance template found
- **BUT:** `enforcement_preferences` not mapped to MoneyClaimCase type definition (lines 99-100)

**Recommendation:** Create enforcement guidance template or remove section if not needed.

### 6.6 Scotland-Specific Forms

**Status:** ✅ Fully Implemented

**Evidence:**
- Scotland pack generator exists (`scotland-money-claim-pack-generator.ts`)
- Simple Procedure claim form referenced (line 477)
- Scotland-specific templates:
  - `simple_procedure_particulars.hbs`
  - `pre_action_letter.hbs` (Scotland version)
  - `filing_guide_scotland.hbs`

**No gaps found.**

---

## 7. TODOs / FIXMEs / HACKs

**Search Results:**
- ❌ No TODOs in wizard components
- ❌ No TODOs in money-claim mappers
- ❌ No TODOs in money-claim pack generators
- ❌ No TODOs in API routes

**Related TODOs found in PRODUCT_FLOWS_STATUS.md:**
```
Scotland PRT wizard-mapper files indicate fields not yet in CaseFacts schema:
- landlord_2_name
- landlord_reg_number
- registration_authority
- registration_expiry
- agent_reg_number
- agent_signs
```

These are Scotland PRT (Private Residential Tenancy) specific, NOT money claim specific.

**No blocking TODOs found for money claims.**

---

## 8. Missing Data / Broken Mappings Summary

### 8.1 Broken Mappings

**None identified.** All critical wizard fields flow through normalize.ts → mapper → pack generator.

### 8.2 Missing / Unused Fields

**Fields Written But Not Consumed:**
1. `money_claim.other_charges_notes` - written by ArrearsSection, never read
2. `money_claim.other_costs_notes` - written by DamagesSection, never read
3. `money_claim.other_amounts_summary` - written by ClaimDetailsSection, never read
4. `tenancy.usual_payment_weekday` - written by TenancySection, never read

**Impact:** Low. These are optional narrative fields that may have been intended for templates but are not currently used.

### 8.3 Inconsistent Naming

**Property Address Field:**
- TimelineSection uses `city`
- TenancySection uses `town_city`
- normalize.ts handles both, but direct access may break

**Impact:** Medium. If user only fills TenancySection, `property.city` may be undefined.

---

## 9. 'Filling Forms' vs Premium Spec Gaps

### 9.1 What Currently Happens

**England & Wales Money Claim Pack Includes:**
1. ✅ N1 official form (PDF filled)
2. ✅ Particulars of Claim (template)
3. ✅ Schedule of Arrears (template)
4. ✅ Interest Calculation (template)
5. ✅ Evidence Index (template)
6. ✅ Hearing Prep Sheet (template)
7. ✅ Letter Before Claim (PAP-DEBT, template)
8. ✅ Information Sheet for Defendants (PAP-DEBT, template)
9. ✅ Reply Form (PAP-DEBT, template)
10. ✅ Financial Statement Form (PAP-DEBT, template)
11. ✅ Filing Guide (template)

**Scotland Money Claim Pack Includes:**
1. ✅ Simple Procedure claim form (PDF filled)
2. ✅ Particulars (template)
3. ✅ Schedule of Arrears (template)
4. ✅ Interest Calculation (template)
5. ✅ Evidence Index (template)
6. ✅ Hearing Prep Sheet (template)
7. ✅ Pre-Action Letter (template)
8. ✅ Filing Guide (template)

### 9.2 Premium Spec Expectations

**Expected Premium Features (from pack_cover descriptions):**
- ✅ Pre-Action Protocol pack (Letter Before Claim + info sheets)
- ✅ Claim Pack (N1 + Particulars + Schedule)
- ✅ Post-Issue Pack (what happens next, enforcement)
- ⚠️ LBA drafted by AI (missing - templates only)
- ⚠️ Particulars of Claim drafted by AI (missing - templates only)
- ⚠️ Evidence Index drafted by AI (missing - templates only)

### 9.3 AI Drafting Gap

**Critical Finding:**

The pack generator calls templates that use **simple variable substitution**:
```handlebars
{{landlord_full_name}} seeks to recover {{arrears_total}} in rent arrears...
```

**AskHeaven is available** (enhanceAnswer function) but **is NOT called** to generate:
- Letter Before Action content
- Particulars of Claim narrative
- Evidence Index descriptions
- Schedule of Loss commentary

**Impact:** Pack is "filling forms" rather than "AI-drafted legal documents."

**Recommendation:** Integrate AskHeaven into pack generation:
1. Call `enhanceAnswer()` for each document section
2. Use AI to draft narratives based on collected facts
3. Keep templates as fallback for formatting

---

## 10. API Routes Audit

### 10.1 Money Claim Pack Generation
**File:** `src/app/api/money-claim/pack/[caseId]/route.ts:15-122`

**Flow:**
1. Fetch case from DB (lines 23-34)
2. Extract wizard_facts (lines 38-43)
3. wizardFactsToCaseFacts() → normalize (line 45)
4. mapCaseFactsToMoneyClaimCase() → mapper (line 46)
5. generateMoneyClaimPack() → generator (line 48)
6. Package as ZIP (lines 50-106)
7. Return ZIP download (lines 108-114)

**AskHeaven Usage:** ❌ Not called during pack generation

### 10.2 Wizard Answer Route
**File:** `src/app/api/wizard/answer/route.ts:504-782`

**AskHeaven Integration:**
- Lines 704-719: Calls `enhanceAnswer()` with question context
- Lines 722-733: Saves enhanced answer to conversations table
- Lines 755-772: Returns enhanced answer to client

**Usage:** ✅ Used for real-time answer enhancement, NOT for document drafting

---

## 11. Recommendations

### Priority 1: Critical Fixes

1. **Standardize Property Address Field**
   - Change TenancySection line 81 from `town_city` to `city`
   - Ensure consistency across all components

2. **Add Missing Fields to normalize.ts or Remove from Wizard**
   - `other_charges_notes`, `other_costs_notes`, `other_amounts_summary`, `usual_payment_weekday`
   - Decision: Keep them if templates need them later, or remove from wizard

### Priority 2: Premium Feature Enhancements

3. **Integrate AskHeaven into Pack Generation**
   - Modify `generateEnglandWalesMoneyClaimPack()` to call `enhanceAnswer()` for:
     - Letter Before Claim narrative
     - Particulars of Claim sections
     - Evidence Index descriptions
   - Keep templates as formatting wrappers around AI content

4. **Create Enforcement Guidance Template**
   - Add `uk/england-wales/templates/money_claims/enforcement_guide.hbs`
   - Add `uk/scotland/templates/money_claims/enforcement_guide_scotland.hbs`
   - Include in pack as "Post-Issue" guidance

### Priority 3: Data Quality

5. **Add Validation for Missing Enforcement Mapping**
   - Add `enforcement_preferences` to `MoneyClaimCase` type (currently exists in CaseFacts but not mapped)

6. **Consider Adding Notes Fields to Schema**
   - If `other_charges_notes`, `other_costs_notes`, `other_amounts_summary` are intended for AI context, add to CaseFacts and pass to AskHeaven

---

## 12. Conclusion

**Overall Health: 8/10**

**Strengths:**
- ✅ Complete wizard → facts → mapper → generator pipeline
- ✅ All templates exist and are referenced correctly
- ✅ Interest calculation (Section 69) fully implemented
- ✅ PAP-DEBT compliance fully implemented
- ✅ Scotland Simple Procedure fully implemented
- ✅ AskHeaven integrated for real-time answer enhancement

**Weaknesses:**
- ⚠️ Property address field naming inconsistency
- ⚠️ 4 wizard fields written but never consumed
- ⚠️ AskHeaven NOT used to draft legal documents (only form filling)
- ⚠️ Enforcement guidance captured but not output as a document

**Critical Path Forward:**
1. Fix property.city vs property.town_city inconsistency
2. Decide fate of unused wizard fields
3. Integrate AskHeaven into pack generation for premium AI drafting
4. Add enforcement guidance template

**Risk Level:** Low. Current implementation is functional and generates complete packs. Identified issues are enhancements, not blockers.

---

**End of Report**
