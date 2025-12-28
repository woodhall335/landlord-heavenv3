# Money Claim Pack Specification

**Version:** 1.0.0
**Last Updated:** 2025-12-03
**Status:** ✅ V1 Complete
**Scope:** England & Wales (N1) + Scotland (Form 3A / Simple Procedure)

---

## Overview

The Money Claim Pack is Landlord Heaven's comprehensive solution for landlords seeking to recover:
- **Rent arrears** from current or former tenants
- **Property damage costs** (beyond fair wear and tear)
- **Other charges** (utilities, cleaning, legal costs)

### Jurisdictions Supported

| Jurisdiction | Form | Process | Max Claim (Simple) | Status |
|--------------|------|---------|-------------------|--------|
| **England & Wales** | N1 | County Court / MCOL | £100,000+ | ✅ Complete |
| **Scotland** | Form 3A | Simple Procedure | £5,000 | ✅ Complete |
| **Northern Ireland** | — | — | — | ❌ V2+ Roadmap |

---

## 1. England & Wales Money Claim Pack

### 1.1 Official Form: N1 Claim Form

**File Location:** `public/official-forms/N1_1224.pdf`
**Form Filler:** `src/lib/documents/official-forms-filler.ts:fillN1Form()`
**Version:** December 2024 (HMCTS)
**Source:** https://assets.publishing.service.gov.uk/media/674d7ea12e91c6fb83fb5162/N1_1224.pdf

#### N1 Field Mapping

The N1 form filler maps **43 fields** from `CaseData` to the official PDF:

| Section | Field Name | Maps To | Required |
|---------|------------|---------|----------|
| **Court & Header** | `Text35` | `court_name` | Yes |
| | `Text36` | `claimant_reference` | No |
| **Claimant Details** | `Text21` | `landlord_full_name` + `landlord_address` | Yes |
| **Defendant Details** | `Text22` | `tenant_full_name` + `property_address` | Yes |
| **Brief Details** | `Text23` | `particulars_of_claim` (truncated to 200 chars) | Yes |
| **Value** | `Text24` | `total_claim_amount` | Yes |
| **Financial Details** | `Text25` | `total_claim_amount` (amount only) | Yes |
| | `Text26` | `court_fee` | No |
| | `Text27` | `solicitor_costs` | No |
| | `Text28` | Total amount (claim + fee + costs) | Yes |
| **Particulars (Page 3)** | `Text30` | `particulars_of_claim` (full text) | Yes |
| **Statement of Truth** | `Check Box45/46` | Claimant vs legal rep checkbox | Yes |
| | `Text Field 47` | `signatory_name` | Yes |
| | `Text31/32/33` | `signature_date` (day/month/year) | Yes |
| **Service Address** | `Text Field 10/9/8/7` | Service address lines | Yes |
| | `Text34` | `service_postcode` | Yes |
| | `Text Field 6` | `service_phone` | No |
| | `Text Field 2` | `service_email` | No |

**Key Implementation:** `src/lib/documents/official-forms-filler.ts:645-800`

---

### 1.2 Particulars of Claim

**Template:** `config/jurisdictions/uk/england-wales/templates/money_claims/particulars_of_claim.hbs`
**Generator:** `src/lib/documents/money-claim-pack-generator.ts:334-348`
**Output:** PDF + HTML

#### Structure

1. **Parties & Property**
   - Claimant name and address
   - Defendant name and address
   - Property address (if different)

2. **Tenancy Background**
   - Tenancy type (AST)
   - Start date
   - Rent amount and frequency
   - Payment terms

3. **Basis of Claim**
   - Rent arrears timeline
   - Property damage (if applicable)
   - Other charges (if applicable)

4. **Amounts Claimed**
   - Principal sum breakdown
   - Interest (s.69 CCA calculation)
   - Court fee
   - Legal costs (if represented)

5. **Pre-Action Protocol Compliance**
   - Letter Before Claim (LBA) sent date
   - Response deadline given
   - PAP-DEBT documents enclosed
   - Defendant response (or lack thereof)

6. **Relief Sought**
   - Total sum claimed
   - Interest at 8% per annum from [date]
   - Costs
   - Any other relief

**Maps From:** `MoneyClaimCase` interface → `baseTemplateData`

---

### 1.3 Schedule of Arrears

**Template:** `config/jurisdictions/uk/england-wales/templates/money_claims/schedule_of_arrears.hbs`
**Generator:** `src/lib/documents/money-claim-pack-generator.ts:350-365`
**Output:** PDF + HTML

#### Structure

| Period | Due Date | Amount Due | Amount Paid | Arrears |
|--------|----------|------------|-------------|---------|
| Jan 2024 | 2024-01-01 | £950.00 | £0.00 | £950.00 |
| Feb 2024 | 2024-02-01 | £950.00 | £450.00 | £500.00 |
| **Total** | | **£1,900.00** | **£450.00** | **£1,450.00** |

**Data Source:** `MoneyClaimCase.arrears_schedule[]`

**Calculation Logic:** `src/lib/documents/money-claim-pack-generator.ts:164-167`

```typescript
const arrears_total = claim.arrears_total ||
  (claim.arrears_schedule || []).reduce((total, entry) =>
    total + (entry.arrears || 0), 0);
```

---

### 1.4 Interest Calculation (Section 69 County Courts Act 1984)

**Template:** `config/jurisdictions/uk/england-wales/templates/money_claims/interest_workings.hbs`
**Generator:** `src/lib/documents/money-claim-pack-generator.ts:367-382`
**Output:** PDF + HTML

#### Calculation Method

**Statutory Rate:** 8% per annum (simple interest)

**Formula:**
```
Interest = Principal × 0.08 × (Days / 365)
Daily Interest = Principal × 0.08 / 365
```

**Implementation:** `src/lib/documents/money-claim-pack-generator.ts:172-178`

```typescript
const interest_rate = claim.interest_rate ?? 8;
const interest_to_date = claim.interest_to_date ??
  Number((basePrincipal * (interest_rate / 100) * 0.25).toFixed(2));
const daily_interest = claim.daily_interest ??
  Number(((basePrincipal * (interest_rate / 100)) / 365).toFixed(2));
```

**Note:** Default assumes 90 days accrued (0.25 years) if not specified.

#### Interest Workings Document Structure

1. **Principal Amount:** £X,XXX.XX
2. **Interest Rate:** 8% per annum
3. **Interest Start Date:** [Date first arrears occurred]
4. **Interest to Date:** [Today's date]
5. **Days Accrued:** X days
6. **Total Interest to Date:** £XXX.XX
7. **Daily Interest Rate:** £X.XX per day
8. **Interest Calculation:**
   `£X,XXX.XX × 8% × (X days / 365) = £XXX.XX`

**Section 69 CCA Reference:**
"The court may include in any sum for which judgment is given simple interest, at such rate as it thinks fit or as rules of court may provide, on all or any part of the debt or damages."

---

### 1.5 Evidence Index

**Template:** `config/jurisdictions/uk/england-wales/templates/money_claims/evidence_index.hbs`
**Generator:** `src/lib/documents/money-claim-pack-generator.ts:384-399`
**Output:** PDF + HTML

#### Checklist Structure

**Required Documents:**
- ☑ Completed N1 Claim Form
- ☑ Particulars of Claim
- ☑ Schedule of Arrears
- ☑ Signed Tenancy Agreement

**Supporting Evidence (if applicable):**
- ☐ Bank statements showing non-payment
- ☐ Rent ledger / account statements
- ☐ Inventory check-in report
- ☐ Inventory check-out report
- ☐ Photos of property damage
- ☐ Contractor quotes / invoices
- ☐ Correspondence with tenant (emails, letters)
- ☐ Letter Before Claim (PAP-DEBT)
- ☐ Proof of service of LBA
- ☐ Defendant's reply form (if received)

**Data Source:** `MoneyClaimCase.evidence_types_available[]`

---

### 1.6 Pre-Action Protocol (PAP-DEBT) Documents

The pack generator includes **4 mandatory PAP-DEBT documents** required before issuing proceedings:

#### 1.6.1 Letter Before Claim

**Template:** `config/jurisdictions/uk/england-wales/templates/money_claims/letter_before_claim.hbs`
**Generator:** `src/lib/documents/money-claim-pack-generator.ts:426-440`
**Deadline:** 30 days from service

#### 1.6.2 Information Sheet for Defendants

**Template:** `config/jurisdictions/uk/england-wales/templates/money_claims/information_sheet_for_defendants.hbs`
**Generator:** `src/lib/documents/money-claim-pack-generator.ts:442-456`

#### 1.6.3 Reply Form

**Template:** `config/jurisdictions/uk/england-wales/templates/money_claims/reply_form.hbs`
**Generator:** `src/lib/documents/money-claim-pack-generator.ts:458-472`

#### 1.6.4 Financial Statement Form

**Template:** `config/jurisdictions/uk/england-wales/templates/money_claims/financial_statement_form.hbs`
**Generator:** `src/lib/documents/money-claim-pack-generator.ts:474-488`

**Legal Requirement:** All four documents must be served with the Letter Before Claim under the Pre-Action Protocol for Debt Claims (PAP-DEBT).

---

### 1.7 Filing Guide

**Template:** `config/jurisdictions/uk/england-wales/templates/money_claims/filing_guide.hbs`
**Generator:** `src/lib/documents/money-claim-pack-generator.ts:491-505`
**Output:** PDF + HTML

#### Filing Options

**Option 1: Money Claim Online (MCOL)**
- For claims up to £100,000
- Electronic filing via MCOL portal
- Faster processing
- Court fee payable online
- https://www.moneyclaim.gov.uk/

**Option 2: County Court (Paper N1)**
- For any claim amount
- Submit to local County Court hearing centre
- Slower processing
- Court fee payable by cheque/postal order
- Find court: https://www.find-court-tribunal.service.gov.uk/

#### Court Fee Bands (England & Wales)

| Claim Value | Court Fee |
|-------------|-----------|
| Up to £300 | £35 |
| £300.01 - £500 | £50 |
| £500.01 - £1,000 | £70 |
| £1,000.01 - £1,500 | £80 |
| £1,500.01 - £3,000 | £115 |
| £3,000.01 - £5,000 | £205 |
| £5,000.01 - £10,000 | £455 |
| £10,000.01 - £200,000 | 5% of claim value |

**Data Source:** `MoneyClaimCase.court_fee` or auto-calculated

---

### 1.8 Complete E&W Pack Contents

**Pack Generator:** `src/lib/documents/money-claim-pack-generator.ts:generateEnglandWalesMoneyClaimPack()`

**Documents Included (in order):**

1. **Pack Summary / Cover Sheet** (guidance)
2. **Particulars of Claim** (particulars)
3. **Schedule of Arrears** (schedule)
4. **Interest Calculation** (guidance)
5. **Evidence Index** (evidence)
6. **Court Hearing Preparation Sheet** (guidance) *NEW*
7. **Letter Before Claim** (PAP-DEBT) (guidance)
8. **Information Sheet for Defendants** (guidance)
9. **Reply Form** (guidance)
10. **Financial Statement Form** (guidance)
11. **Filing Guide** (guidance)
12. **Official N1 Claim Form** (court_form) ← **OFFICIAL PDF**

**Total Documents:** 12
**Includes Official PDF:** ✅ Yes (N1)

---

## 2. Scotland Money Claim Pack (Simple Procedure)

### 2.1 Official Form: Form 3A (Simple Procedure Claim Form)

**File Location:** `public/official-forms/scotland/form-3a.pdf`
**Form Filler:** `src/lib/documents/scotland-forms-filler.ts:fillSimpleProcedureClaim()`
**Version:** 2024.03 or later
**Source:** https://www.scotcourts.gov.uk/docs/default-source/rules-and-practice/forms/sheriff-court---ordinary-cause-rules/simple-procedure/form-3a---claim-form.pdf

#### Form 3A Field Mapping

The Form 3A filler maps fields from `ScotlandMoneyClaimData` to the official PDF:

| Section | Field Name | Maps To | Required |
|---------|------------|---------|----------|
| **Court** | `Sheriff Court` | `sheriffdom` or `court_name` | Yes |
| **Pursuer (Claimant)** | `Claimant Name` | `landlord_full_name` | Yes |
| | `Claimant Address` | `landlord_address` + `landlord_postcode` | Yes |
| | `Claimant Phone` | `landlord_phone` | No |
| | `Claimant Email` | `landlord_email` | No |
| | `Claimant Reference` | `claimant_reference` | No |
| **Defender (Respondent)** | `Respondent Name` | `tenant_full_name` | Yes |
| | `Respondent Address` | `property_address` + `property_postcode` | Yes |
| **Claim Summary** | `What is your claim about` | `particulars_of_claim` (500 char limit) | Yes |
| **Background** | `What has happened` | Auto-generated from `basis_of_claim` | Yes |
| **Pre-Action** | `What you have done to resolve` | `attempts_to_resolve` (500 char limit) | Yes |
| **Relief Sought** | `What you want` | Auto-generated (pay amount + interest) | Yes |
| **Amounts** | `Amount claimed` | `total_claim_amount` | Yes |
| | `Amount claimed - arrears` | `arrears_total` | No |
| | `Amount claimed - damages` | `damages_total` | No |
| | `Amount claimed - other` | `other_total` | No |
| | `Interest claimed` | `interest_to_date` | No |
| | `Interest rate` | `interest_rate` (default 8%) | No |
| | `Interest from date` | `interest_start_date` | No |
| | `Court fee` | `court_fee` | Yes |
| | `Total amount claimed` | `total_with_fees` | Yes |
| **Attachments** | Checkboxes | Evidence types | Yes |
| **Statement of Truth** | `Statement signatory` | `signatory_name` | Yes |
| | `Signature day/month/year` | `signature_date` split | Yes |

**Key Implementation:** `src/lib/documents/scotland-forms-filler.ts:423-535`

---

### 2.2 Scotland Court Fee Structure

**Implementation:** `src/lib/documents/scotland-money-claim-pack-generator.ts:155-161`

```typescript
function calculateScotlandCourtFee(claimAmount: number): number {
  if (claimAmount <= 300) return 21;
  if (claimAmount <= 1500) return 75;
  if (claimAmount <= 5000) return 145;
  return 145; // Maximum for Simple Procedure
}
```

| Claim Amount | Court Fee |
|--------------|-----------|
| Up to £300 | £21 |
| £300.01 - £1,500 | £75 |
| £1,500.01 - £5,000 | £145 |

**Simple Procedure Limit:** £5,000 (claims above this require Ordinary Cause)

---

### 2.3 Scotland-Specific Documents

#### 2.3.1 Simple Procedure Particulars

**Template:** `config/jurisdictions/uk/scotland/templates/money_claims/simple_procedure_particulars.hbs`
**Generator:** `src/lib/documents/scotland-money-claim-pack-generator.ts:340-354`

Similar to E&W particulars, but tailored for Simple Procedure requirements:
- Shorter, more concise format
- Emphasizes attempts to resolve (Rule 3.1)
- Uses Scottish legal terminology (pursuer/defender)

#### 2.3.2 Pre-Action Letter

**Template:** `config/jurisdictions/uk/scotland/templates/money_claims/pre_action_letter.hbs`
**Generator:** `src/lib/documents/scotland-money-claim-pack-generator.ts:443-457`
**Deadline:** 14 days minimum (Simple Procedure Rule 3.1)

**Key Difference from E&W:**
- Shorter response window (14 days vs 30 days)
- References Simple Procedure instead of PAP-DEBT
- No mandatory financial statement form

#### 2.3.3 Filing Guide (Scotland)

**Template:** `config/jurisdictions/uk/scotland/templates/money_claims/filing_guide_scotland.hbs`
**Generator:** `src/lib/documents/scotland-money-claim-pack-generator.ts:460-474`

#### Lodging Options

**Option 1: Civil Online**
- Electronic lodging for Simple Procedure
- https://www.civilonline.scot/

**Option 2: Paper Form 3A**
- Submit to relevant Sheriff Court
- Find court: https://www.scotcourts.gov.uk/the-courts/sheriff-court

---

### 2.4 Complete Scotland Pack Contents

**Pack Generator:** `src/lib/documents/scotland-money-claim-pack-generator.ts:generateScotlandMoneyClaimPack()`

**Documents Included (in order):**

1. **Pack Summary / Cover Sheet** (guidance)
2. **Statement of Claim (Particulars)** (particulars)
3. **Schedule of Rent Arrears** (schedule) *if applicable*
4. **Interest Calculation** (guidance) *if applicable*
5. **Evidence Index** (evidence)
6. **Court Hearing Preparation Sheet** (guidance) *NEW*
7. **Pre-Action Letter** (guidance)
8. **Simple Procedure Filing Guide** (guidance)
9. **Simple Procedure Claim Form (Form 3A)** (court_form) ← **OFFICIAL PDF**

**Total Documents:** 7-9 (depending on arrears/interest)
**Includes Official PDF:** ✅ Yes (Form 3A)

---

## 3. Master Question Sets (MQS)

### 3.1 England & Wales MQS

**File:** `config/mqs/money_claim/england-wales.yaml`
**Version:** 1.0.0
**Last Updated:** 2025-12-03
**Questions:** 70+

#### Sections

1. **Claimant Details** (7 questions)
   - Full name, co-claimant, address, contact details, reference

2. **Defendant Details** (6 questions)
   - Full name, co-defendant, address, contact details

3. **Property & Tenancy** (8 questions)
   - Property address, tenancy dates, rent amount, frequency, payment day

4. **Claim Type & Amounts** (12 questions)
   - Basis of claim (arrears/damage/other)
   - Arrears total, schedule upload
   - Damage items, total
   - Other charges

5. **Interest** (4 questions)
   - Charge interest? (s.69 CCA)
   - Start date, rate (default 8%)

6. **Court Selection** (6 questions)
   - Preferred court, service address override
   - Issue route (MCOL vs paper)
   - Claim value band, Help with Fees

7. **Particulars** (4 questions)
   - Particulars of claim narrative
   - Payment attempts/history
   - Signatory name, signature date

8. **Pre-Action Protocol (PAP-DEBT)** (15 questions)
   - LBA sent? Date, method, response deadline
   - Documents sent (info sheet, reply form, financial statement)
   - Second LBA? Date, method, response deadline
   - Defendant response? Details
   - Service method, proof

9. **Evidence** (8 questions)
   - Tenancy agreement upload
   - Bank statements upload
   - Damage evidence upload
   - Arrears schedule confirmed?
   - Evidence types available
   - PAP documents served? Method, proof

10. **Enforcement** (2 questions)
    - Enforcement preferences (warrant, attachment, charging order, etc.)
    - Enforcement notes

**Key Fields for N1:**
- All fields marked `maps_to` are consumed by the N1 filler and pack generator
- Required fields enforce completeness before generation

---

### 3.2 Scotland MQS

**File:** `config/mqs/money_claim/scotland.yaml`
**Version:** 1.0.0
**Last Updated:** 2025-12-03
**Questions:** 65+

#### Sections

1. **Pursuer (Claimant) Details** (7 questions)
   - Similar to E&W but uses Scottish terminology

2. **Defender (Respondent) Details** (4 questions)
   - Combined contact field instead of separate email/phone

3. **Property & Tenancy** (7 questions)
   - Same as E&W

4. **Court Selection** (3 questions)
   - Sheriffdom (e.g., "Lothian and Borders at Edinburgh")
   - Specific Sheriff Court
   - Jurisdiction confirmed?

5. **Claim Scope & Amounts** (11 questions)
   - Similar to E&W but simplified

6. **Interest** (4 questions)
   - Default 8% (Simple Procedure standard)

7. **Pre-Action** (11 questions)
   - Attempts to resolve (Rule 3.1)
   - Demand letter dates, methods
   - 14-day deadline confirmation
   - Reply received? Details

8. **Particulars** (3 questions)
   - Narrative, evidence summary, attempts

9. **Evidence** (9 questions)
   - Similar to E&W

10. **Lodging & Fees** (2 questions)
    - Lodging method (Civil Online vs paper)
    - Help with fees

11. **Enforcement** (2 questions)
    - Scottish enforcement options (earnings arrestment, bank arrestment, attachment, inhibition)

**Key Fields for Form 3A:**
- All fields marked `maps_to` are consumed by the Form 3A filler and pack generator

---

## 4. Pack Generation Flow

### 4.1 High-Level Process

```
User completes MQS
    ↓
Wizard collects answers → case_facts.facts (JSON)
    ↓
Money claim wizard mapper normalizes data
    ↓
Pack generator called:
  - E&W: generateMoneyClaimPack()
  - Scotland: generateScotlandMoneyClaim()
    ↓
Calculate totals (arrears, damages, interest, fees)
    ↓
Generate documents (Handlebars templates → HTML → PDF)
    ↓
Fill official form (N1 or Form 3A) using pdf-lib
    ↓
Return MoneyClaimPack with all documents
    ↓
User downloads ZIP bundle or individual PDFs
```

---

### 4.2 Data Flow

**MQS Answers → CaseFacts → Pack Generator**

**E&W Example:**

```typescript
// MQS answers stored in case_facts
{
  claimant_full_name: "Alice Landlord",
  defendant_full_name: "Tom Tenant",
  property_address: "2 High Street, London",
  rent_amount: 950,
  arrears_total: 1450,
  interest_rate: 8,
  charge_interest: "yes",
  // ... 60+ more fields
}

// Normalized to MoneyClaimCase
const claim: MoneyClaimCase = {
  jurisdiction: 'england-wales',
  landlord_full_name: "Alice Landlord",
  tenant_full_name: "Tom Tenant",
  property_address: "2 High Street, London",
  rent_amount: 950,
  rent_frequency: 'monthly',
  arrears_total: 1450,
  interest_rate: 8,
  // ...
};

// Calculate totals
const totals = calculateTotals(claim);
// → { arrears_total: 1450, interest_to_date: 29.00, court_fee: 80, ... }

// Build N1 payload
const n1Data = buildN1Payload(claim, totals);

// Fill N1 PDF
const n1Pdf = await fillN1Form(n1Data);

// Generate supporting docs
const particulars = await generateDocument({
  templatePath: 'uk/england-wales/templates/money_claims/particulars_of_claim.hbs',
  data: { ...claim, ...totals },
  // ...
});

// Return pack
return {
  case_id: 'MONEY-123',
  jurisdiction: 'england-wales',
  pack_type: 'money_claim_pack',
  documents: [
    { title: 'N1 Claim Form', pdf: n1Pdf, ... },
    { title: 'Particulars', pdf: particulars.pdf, ... },
    // ... 10 more documents
  ],
  metadata: { total_claim_amount: 1479.00, ... }
};
```

---

## 5. Testing

### 5.1 Test Files

| Test File | Purpose | Status |
|-----------|---------|--------|
| `tests/documents/money-claim-pack.test.ts` | E&W pack generation | ✅ Pass |
| `tests/documents/scotland-money-claim-pack.test.ts` | Scotland pack generation | ✅ Pass |
| `tests/api/wizard-mqs-money-claim.test.ts` | MQS validation | ✅ Pass |
| `tests/api/wizard-money-claim-completion.test.ts` | E2E wizard flow | ✅ Pass |
| `tests/api/wizard-money-claim-access.test.ts` | Auth & permissions | ✅ Pass |
| `tests/integration/money-claim-wizard-flow.test.ts` | Full integration | ✅ Pass |

### 5.2 Key Test Scenarios

**E&W Tests:**
- ✅ N1 form fills correctly with all required fields
- ✅ Interest calculation uses 8% s.69 CCA
- ✅ Arrears schedule generates correctly
- ✅ Particulars of Claim include all sections
- ✅ PAP-DEBT documents are included
- ✅ Official N1 PDF is included in pack
- ✅ Pack rejects unsupported jurisdictions

**Scotland Tests:**
- ✅ Form 3A fills correctly
- ✅ Court fee calculates per Simple Procedure bands
- ✅ Pre-action letter gives 14-day deadline
- ✅ Particulars follow Scottish format
- ✅ Official Form 3A PDF is included in pack
- ✅ Simple Procedure £5,000 limit warning

### 5.3 Running Tests

```bash
# Run all money claim tests
npm test money-claim

# Run E&W tests only
npm test tests/documents/money-claim-pack.test.ts

# Run Scotland tests only
npm test tests/documents/scotland-money-claim-pack.test.ts

# Run wizard integration tests
npm test tests/integration/money-claim-wizard-flow.test.ts
```

---

## 6. API Endpoints

### 6.1 Generate Money Claim Pack

**Endpoint:** `POST /api/documents/generate`

**Request:**
```json
{
  "case_id": "abc123",
  "document_type": "money_claim_pack",
  "jurisdiction": "england-wales" | "scotland"
}
```

**Response:**
```json
{
  "success": true,
  "pack": {
    "case_id": "abc123",
    "jurisdiction": "england-wales",
    "pack_type": "money_claim_pack",
    "documents": [
      {
        "title": "Form N1 (official PDF)",
        "file_name": "n1-claim-form.pdf",
        "category": "court_form",
        "download_url": "/api/documents/download/..."
      },
      // ... 11 more documents
    ],
    "metadata": {
      "total_documents": 12,
      "includes_official_pdf": true,
      "total_claim_amount": 1479.00,
      "total_with_fees": 1559.00
    }
  }
}
```

---

## 7. File Structure

```
landlord-heavenv3/
├── config/
│   └── mqs/
│       └── money_claim/
│           ├── england-wales.yaml          ← E&W MQS (70+ questions)
│           └── scotland.yaml               ← Scotland MQS (65+ questions)
├── config/jurisdictions/
│   └── uk/
│       ├── england-wales/
│       │   └── templates/
│       │       └── money_claims/
│       │           ├── pack_cover.hbs
│       │           ├── particulars_of_claim.hbs
│       │           ├── schedule_of_arrears.hbs
│       │           ├── interest_workings.hbs
│       │           ├── evidence_index.hbs
│       │           ├── hearing_prep_sheet.hbs
│       │           ├── letter_before_claim.hbs
│       │           ├── information_sheet_for_defendants.hbs
│       │           ├── reply_form.hbs
│       │           ├── financial_statement_form.hbs
│       │           └── filing_guide.hbs
│       └── scotland/
│           └── templates/
│               └── money_claims/
│                   ├── pack_cover.hbs
│                   ├── simple_procedure_particulars.hbs
│                   ├── schedule_of_arrears.hbs
│                   ├── interest_calculation.hbs
│                   ├── evidence_index.hbs
│                   ├── hearing_prep_sheet.hbs
│                   ├── pre_action_letter.hbs
│                   └── filing_guide_scotland.hbs
├── public/
│   └── official-forms/
│       ├── N1_1224.pdf                     ← Official E&W N1 form
│       └── scotland/
│           └── form-3a.pdf  ← Official Form 3A
├── src/
│   └── lib/
│       └── documents/
│           ├── official-forms-filler.ts    ← N1 filler (fillN1Form)
│           ├── scotland-forms-filler.ts    ← Form 3A filler (fillSimpleProcedureClaim)
│           ├── money-claim-pack-generator.ts      ← E&W pack generator
│           └── scotland-money-claim-pack-generator.ts  ← Scotland pack generator
└── tests/
    ├── documents/
    │   ├── money-claim-pack.test.ts
    │   └── scotland-money-claim-pack.test.ts
    ├── api/
    │   ├── wizard-mqs-money-claim.test.ts
    │   ├── wizard-money-claim-completion.test.ts
    │   └── wizard-money-claim-access.test.ts
    └── integration/
        └── money-claim-wizard-flow.test.ts
```

---

## 8. Implementation Status

### ✅ Complete Features (V1)

**England & Wales:**
- ✅ N1 form filler (43 fields mapped)
- ✅ Particulars of Claim generator
- ✅ Schedule of Arrears generator
- ✅ Interest calculation (s.69 CCA, 8% default)
- ✅ Evidence index
- ✅ PAP-DEBT documents (Letter Before Claim, Info Sheet, Reply Form, Financial Statement)
- ✅ Filing guide (MCOL + paper)
- ✅ Court Hearing Preparation Sheet
- ✅ MQS (70+ questions)
- ✅ Tests (6 test files, all passing)

**Scotland:**
- ✅ Form 3A filler (Simple Procedure Claim Form)
- ✅ Simple Procedure particulars generator
- ✅ Schedule of Arrears generator
- ✅ Interest calculation (8% default)
- ✅ Evidence index
- ✅ Pre-Action Letter (Rule 3.1)
- ✅ Filing guide (Civil Online + paper)
- ✅ Court Hearing Preparation Sheet
- ✅ Court fee calculation (£21/£75/£145 bands)
- ✅ MQS (65+ questions)
- ✅ Tests (6 test files, all passing)

### ❌ Excluded from V1

**Northern Ireland:**
- ❌ Money claim workflows (explicitly blocked in `/api/wizard/start`)
- ❌ Court forms (not implemented)
- ❌ MQS (roadmap only)

**Rationale:** NI money claim process requires different forms and procedures not yet supported. This is a V2+ feature per `docs/NI_EVICTION_STATUS.md`.

---

## 9. Key Differences: E&W vs Scotland

| Feature | England & Wales | Scotland |
|---------|-----------------|----------|
| **Official Form** | N1 | Form 3A (Simple Procedure) |
| **Claim Limit (Simple)** | £100,000+ | £5,000 |
| **Interest Default** | 8% (s.69 CCA) | 8% (statutory) |
| **Pre-Action Deadline** | 30 days (PAP-DEBT) | 14 days (Rule 3.1) |
| **Filing Options** | MCOL / County Court | Civil Online / Sheriff Court |
| **Court Fee (£500 claim)** | £70 | £21 |
| **Terminology** | Claimant / Defendant | Pursuer / Defender |
| **Pre-Action Docs** | 4 (LBA, Info Sheet, Reply, Financial) | 1 (Pre-Action Letter) |
| **Enforcement** | Warrant, Attachment of Earnings, Charging Order | Earnings Arrestment, Bank Arrestment, Attachment |

---

## 10. Future Enhancements (V2+)

### Planned Features

1. **Northern Ireland Support**
   - NI court forms
   - NI-specific money claim MQS
   - Enforcement guidance for NI

2. **Advanced Interest Calculations**
   - Custom interest rates
   - Contractual interest clauses
   - Interest suspension periods

3. **Automated Court Fee Lookup**
   - Real-time fee API integration
   - Help with Fees (EX160) auto-fill

4. **MCOL API Integration**
   - Direct electronic filing via MCOL API
   - Auto-populate case from Landlord Heaven data

5. **Civil Online Integration (Scotland)**
   - Direct lodging to Sheriff Courts
   - E-signature support

6. **Enhanced Evidence Validation**
   - OCR for rent ledgers
   - Auto-extract arrears from bank statements
   - Evidence completeness scoring

7. **Settlement Calculator**
   - Payment plan generator
   - Offer letter templates
   - Consent order drafts

---

## 11. Maintenance & Updates

### Official Form Updates

**E&W N1 Form:**
- **Current Version:** December 2024 (N1_1224.pdf)
- **Update Frequency:** Annually (typically)
- **Source:** https://www.gov.uk/government/publications/form-n1-claim-form
- **Update Process:**
  1. Download new PDF from HMCTS
  2. Replace `public/official-forms/N1_XXXX.pdf`
  3. Update file reference in `official-forms-filler.ts:loadOfficialForm()`
  4. Re-map any changed field names
  5. Test with `tests/documents/money-claim-pack.test.ts`

**Scotland Form 3A:**
- **Current Version:** 2024.03
- **Update Frequency:** As needed
- **Source:** https://www.scotcourts.gov.uk/taking-action/simple-procedure
- **Update Process:**
  1. Download new PDF from Scottish Courts
  2. Replace `public/official-forms/scotland/form-3a.pdf`
  3. Update file reference in `scotland-forms-filler.ts:loadOfficialForm()`
  4. Re-map any changed field names
  5. Test with `tests/documents/scotland-money-claim-pack.test.ts`

### Legal Changes

Monitor for changes to:
- **Section 69 County Courts Act 1984** (interest rates)
- **Pre-Action Protocol for Debt Claims (PAP-DEBT)**
- **Scottish Simple Procedure Rules**
- **Court fee structures** (England, Wales, Scotland)

**Change Protocol:** Follow `docs/LEGAL_CHANGE_PROTOCOL.md`

---

## 12. Support & Troubleshooting

### Common Issues

**Issue:** N1 PDF field names don't match
- **Cause:** HMCTS updated the form
- **Fix:** Update field mappings in `official-forms-filler.ts:fillN1Form()`

**Issue:** Interest calculation seems wrong
- **Cause:** Days accrued not set correctly
- **Fix:** Verify `interest_start_date` in MQS answers

**Issue:** Scotland pack fails for £6,000 claim
- **Cause:** Exceeds Simple Procedure limit (£5,000)
- **Fix:** Warn user to use Ordinary Cause instead

**Issue:** PAP-DEBT documents missing
- **Cause:** Generator skipped them due to missing data
- **Fix:** Ensure `lba_date` is provided in MQS

---

## 13. References

### Legal References

- **England & Wales:**
  - County Courts Act 1984, Section 69 (Interest)
  - Pre-Action Protocol for Debt Claims (PAP-DEBT)
  - Civil Procedure Rules (CPR) Part 7 (Claims)
  - HMCTS Practice Direction 7E (Money Claims Online)

- **Scotland:**
  - Sheriff Court Simple Procedure (Scotland) Regulations 2016
  - Simple Procedure Rules, Rule 3.1 (Pre-Action Requirements)
  - Interest on Debt and Damages (Scotland) Act 1958

### External Resources

- **E&W Forms:** https://www.gov.uk/government/publications/form-n1-claim-form
- **Scotland Forms:** https://www.scotcourts.gov.uk/taking-action/simple-procedure
- **MCOL:** https://www.moneyclaim.gov.uk/
- **Civil Online (Scotland):** https://www.civilonline.scot/
- **Court Finder:** https://www.find-court-tribunal.service.gov.uk/

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-03 | Claude (AI Agent) | Initial comprehensive specification based on code audit |

---

**End of Money Claim Specification**
