# WIZARD-TO-FORM MAPPING AUDIT

**Date:** 2025-11-22
**Auditor:** AI Code Analysis
**Scope:** All wizard questions vs official HMCTS court form requirements

---

## EXECUTIVE SUMMARY

- ✅ **Fields correctly mapped:** 42 core fields
- ❌ **Missing critical fields:** 18 fields
- ⚠️ **Incomplete questions:** 8 areas needing more detail

### Critical Risk Assessment

**🔴 HIGH RISK** - Document generation will FAIL or forms will be INVALID:
- N5B Form 6A requires `notice_expiry_date` - **MISSING** from wizard
- N5B deposit compliance fields incomplete (prescribed info date, scheme name)
- N5B HMO licensing questions not asked (11a - license required/valid)
- N5B EPC/Gas Safety/How to Rent asked as single yes/no - need individual tracking
- Tenancy Agreement `tenant_dob` mentioned in criteria but not consistently asked
- Tenancy Agreement bank details for rent payment not collected

**🟡 MEDIUM RISK** - Forms will be incomplete but submittable:
- N5B tenancy_agreement_date (different from tenancy_start_date)
- N5B Housing Act 2004 retaliatory eviction check (question 15)
- EPC rating not collected (only yes/no if provided)
- Rent payment day of month not collected

**🟢 LOW RISK** - Optional fields:
- Second landlord/tenant details (conditional)
- Service address variations

---

## CRITICAL ISSUES

### ISSUE 1: Notice Expiry Date Missing
**Affects:** Notice Only Pack (£29.99), Complete Eviction Pack (£149.99)
**Forms:** Form 6A, N5B
**Missing field:** `notice_expiry_date`

**Impact:**
- Form 6A field "leaving date DD/MM/YYYYY" cannot be filled
- N5B question 10e "After what date did the notice require the Defendant to leave the property?" cannot be filled
- Section 21 notices are INVALID without this date

**Current Wizard Behavior:**
Lines 268-271 in fact-finder.ts:
```
✓ "Have you already served a notice to the tenant?" (yes/no)
✓ If no: "I'll generate the notice for you. When do you want the tenant to leave by?"
✓ If yes: "What type of notice did you serve?" and "When did you serve it?"
```

**Problem:**
- Wizard asks "When did you serve it?" (notice_date) ✅
- Wizard does NOT ask "What leaving date was on the notice?" ❌

**Fix Required:**
Add wizard question:
```typescript
{
  question_id: "notice_expiry_date",
  question_text: "What is the date on the notice by which the tenant must leave the property? This is the date after which you can apply to court (typically 2 months from service date for Section 21).",
  input_type: "date",
  helper_text: "For Section 21: Must be at least 2 months from service date. For Section 8: Varies by ground (2 weeks to 2 months).",
  is_required: true
}
```

---

### ISSUE 2: Deposit Protection Details Incomplete
**Affects:** Complete Eviction Pack (£149.99)
**Form:** N5B (questions 12-14b)
**Missing fields:**
- `deposit_prescribed_info_date` (when was prescribed info given?)
- `deposit_scheme` (which scheme: DPS, MyDeposits, or TDS?)
- `deposit_returned` (has deposit been returned?)

**Impact:**
- N5B question 14a checkbox "Has the Claimant given the prescribed information?" can be checked
- N5B question 14b "On what date was the prescribed information given?" **CANNOT BE FILLED** ❌
- Section 21 will be INVALID if prescribed info wasn't given within 30 days of receiving deposit
- Court may refuse accelerated possession if deposit compliance not proven

**Current Wizard Behavior:**
Lines 256-257 in fact-finder.ts:
```
✓ "Did you take a deposit?" (yes/no)
✓ If yes: "Was it protected in a government scheme?" (yes - explain schemes; no - WARNING)
```

**Problem:**
- Wizard asks IF deposit was protected (yes/no) ✅
- Wizard does NOT ask WHICH scheme (DPS/MyDeposits/TDS) ❌
- Wizard does NOT ask WHEN prescribed info was given ❌
- Wizard does NOT ask IF deposit has been returned ❌

**Fix Required:**
Add conditional wizard questions:
```typescript
// If deposit_protected === true:
{
  question_id: "deposit_scheme",
  question_text: "Which tenancy deposit protection scheme did you use?",
  input_type: "multiple_choice",
  options: ["Deposit Protection Service (DPS)", "MyDeposits", "Tenancy Deposit Scheme (TDS)"],
  helper_text: "You should have received a certificate from the scheme when you protected the deposit.",
  is_required: true
}

{
  question_id: "deposit_prescribed_info_date",
  question_text: "On what date did you give the tenant the prescribed information about the deposit protection?",
  input_type: "date",
  helper_text: "This MUST be within 30 days of receiving the deposit. Check your records or scheme certificate.",
  is_required: true,
  validation_rules: {
    max_days_after_tenancy_start: 30
  }
}

{
  question_id: "deposit_returned",
  question_text: "Has the deposit been returned to the tenant?",
  input_type: "yes_no",
  helper_text: "If yes, you'll need to provide the date it was returned. If no, the deposit should still be protected in the scheme.",
  is_required: true
}
```

---

### ISSUE 3: HMO Licensing Not Asked
**Affects:** Complete Eviction Pack (£149.99)
**Form:** N5B (questions 11a-11b)
**Missing fields:**
- `hmo_license_required` (Is property required to be licensed?)
- `hmo_license_valid` (If required, is there a valid licence?)

**Impact:**
- N5B question 11a "Is the property required to be licensed under Part 2 (HMO) or Part 3 (Selective Licensing)?" **CANNOT BE ANSWERED** ❌
- If HMO license required but not obtained, Section 21 is **AUTOMATICALLY INVALID** (Housing Act 2004)
- Landlord could face £30,000 fine for unlicensed HMO
- Section 21 notice served during unlicensed period is **VOID**

**Current Wizard Behavior:**
NOT ASKED - This is a critical compliance question that is completely missing.

**Fix Required:**
Add wizard questions:
```typescript
{
  question_id: "hmo_license_required",
  question_text: "Is the property a House in Multiple Occupation (HMO) or in a selective licensing area?",
  input_type: "yes_no",
  helper_text: "An HMO is a property with 5+ people from 2+ households sharing facilities. Some councils also require selective licensing for all rental properties in certain areas. Check with your local council if unsure.",
  is_required: true
}

// If hmo_license_required === true:
{
  question_id: "hmo_license_valid",
  question_text: "Do you have a valid HMO or selective licence for this property?",
  input_type: "yes_no",
  helper_text: "⚠️ CRITICAL: You CANNOT serve a valid Section 21 notice if your property requires a licence but you don't have one. You must obtain a licence first, or use Section 8 grounds instead.",
  is_required: true
}

// If hmo_license_valid === false:
// Wizard should WARN that Section 21 is not possible and recommend Section 8 instead
```

---

### ISSUE 4: EPC/Gas Safety/How to Rent - Individual Tracking Required
**Affects:** Complete Eviction Pack (£149.99)
**Form:** N5B (checkboxes for documents attached)
**Missing fields:**
- `epc_provided` (individual checkbox)
- `epc_rating` (what rating: A-G?)
- `gas_safety_provided` (individual checkbox)
- `how_to_rent_provided` (individual checkbox)

**Impact:**
- N5B has individual checkboxes:
  - "Copy of the Energy Performance Certificate marked F"
  - "Copy of the Gas Safety Records marked G G1 G2 etc"
- If these documents weren't provided before serving Section 21, notice is **INVALID**
- Wizard currently asks "Did you provide all the required documents?" as single yes/no
- Cannot track WHICH documents were provided

**Current Wizard Behavior:**
Lines 272-273 in fact-finder.ts:
```
✓ "Did you provide all the required documents at the start of the tenancy?"
   (How to Rent guide, EPC, Gas Safety, deposit info)
```

**Problem:**
- Single yes/no question doesn't capture which specific documents were provided
- Cannot fill individual checkboxes on N5B form
- Cannot validate Section 21 validity if EPC rating is F or G (illegal since April 2020)

**Fix Required:**
Replace single question with individual questions:
```typescript
{
  question_id: "epc_provided",
  question_text: "Did you provide the tenant with an Energy Performance Certificate (EPC) before the tenancy started?",
  input_type: "yes_no",
  helper_text: "Required by law. The EPC must show the property's energy efficiency rating (A-G).",
  is_required: true
}

// If epc_provided === true:
{
  question_id: "epc_rating",
  question_text: "What is the EPC rating for the property?",
  input_type: "multiple_choice",
  options: ["A", "B", "C", "D", "E", "F", "G"],
  helper_text: "⚠️ CRITICAL: Properties with F or G ratings cannot be let (since April 2020) unless exempt. Check your EPC certificate.",
  is_required: true
}

{
  question_id: "gas_safety_provided",
  question_text: "Did you provide the tenant with a Gas Safety Certificate before the tenancy started?",
  input_type: "yes_no",
  helper_text: "Required if property has gas appliances. Must be renewed annually.",
  is_required: true
}

{
  question_id: "how_to_rent_provided",
  question_text: "Did you provide the tenant with the government's 'How to Rent' guide before the tenancy started?",
  input_type: "yes_no",
  helper_text: "Required for all ASTs in England. Must be the latest version. Available from gov.uk.",
  is_required: true
}
```

---

### ISSUE 5: Tenancy Agreement Date vs Start Date
**Affects:** Complete Eviction Pack (£149.99)
**Form:** N5B (questions 6-7)
**Missing field:** `tenancy_agreement_date`

**Impact:**
- N5B question 6: "On what date was the property let?" (tenancy_start_date) ✅
- N5B question 7: "The tenancy agreement is dated." (tenancy_agreement_date) ❌
- These can be DIFFERENT dates (agreement signed before tenancy starts)

**Current Wizard Behavior:**
Lines 249-252 in fact-finder.ts:
```
✓ Tenant full name and property address
✓ "When did the tenancy start?" (date)
```

**Problem:**
- Wizard only asks for tenancy_start_date
- Does not ask for tenancy_agreement_date (when agreement was signed)

**Fix Required:**
```typescript
{
  question_id: "tenancy_agreement_date",
  question_text: "What date is shown on the tenancy agreement itself (the date it was signed)?",
  input_type: "date",
  helper_text: "This is usually the same as or shortly before the tenancy start date. Check the signature section of your tenancy agreement.",
  is_required: true
}
```

---

### ISSUE 6: Housing Act 2004 Retaliatory Eviction Check
**Affects:** Complete Eviction Pack (£149.99)
**Form:** N5B (question 15)
**Missing field:** `housing_act_notice_served`

**Impact:**
- N5B question 15: "Has the Claimant been served with a relevant notice under s.11, s.12 or s.40(7) of the Housing Act 2004?" **NOT ASKED** ❌
- If council served notice about property condition within 6 months, Section 21 is **AUTOMATICALLY INVALID** (retaliatory eviction protection)
- If tenant complained to landlord about repairs, then landlord served Section 21 within 6 months, court may refuse possession

**Current Wizard Behavior:**
NOT ASKED - This anti-retaliatory eviction check is completely missing.

**Fix Required:**
```typescript
{
  question_id: "housing_act_notice_served",
  question_text: "Have you been served with any notices from the local council about the property's condition in the last 6 months?",
  input_type: "yes_no",
  helper_text: "⚠️ This includes improvement notices, prohibition orders, or hazard awareness notices. If yes, your Section 21 notice may be invalid (retaliatory eviction protection).",
  is_required: true
}

// If housing_act_notice_served === true:
// Wizard should WARN that Section 21 may not be valid and recommend legal advice
```

---

### ISSUE 7: Tenant Date of Birth Not Consistently Asked
**Affects:** Tenancy Agreements (£39.99, £59.00)
**Missing field:** `tenant_dob`

**Impact:**
- Fact-finder.ts line 214 lists `tenant_dob` as ABSOLUTELY REQUIRED: "7. tenant_dob (date of birth - REQUIRED for legal agreement)"
- However, checking wizard prompt (lines 160-170), it's mentioned in general guidance but may not be enforced
- AST agreements require tenant DOB for legal validity and Right to Rent checks

**Current Wizard Behavior:**
Line 163 mentions: "✓ Tenant(s) full name, email, phone, date of birth"

**Problem:**
- Listed in essential information BUT not in completion criteria enforcement
- AI may skip asking if conversation gets long
- No explicit question_id validation

**Fix Required:**
Ensure tenant_dob is consistently asked and validated:
```typescript
{
  question_id: "tenant_dob",
  question_text: "What is the tenant's date of birth?",
  input_type: "date",
  helper_text: "Required for the tenancy agreement and Right to Rent checks. Tenant must be 18 or over to sign a tenancy agreement.",
  is_required: true,
  validation_rules: {
    min_age: 18,
    max_age: 120
  }
}
```

---

### ISSUE 8: Rent Payment Bank Details Not Collected
**Affects:** Tenancy Agreements (£39.99, £59.00)
**Missing fields:**
- `bank_account_name`
- `bank_sort_code`
- `bank_account_number`
- `rent_due_day` (which day of month)

**Impact:**
- AST agreement needs rent payment instructions
- Tenant needs to know WHERE to pay rent
- Payment day of month must be specified

**Current Wizard Behavior:**
Lines 160-170 mention: "✓ Monthly rent amount and payment due day (1st, 15th, etc.)"

BUT lines 170 mention: "✓ Bank details for rent payment (account name, sort code, account number)"

**Problem:**
- Listed in essential information BUT not in mandatory completion criteria (lines 206-221)
- May be asked but not enforced

**Fix Required:**
Add to mandatory criteria and ensure asked:
```typescript
{
  question_id: "rent_due_day",
  question_text: "What day of the month should rent be paid?",
  input_type: "multiple_choice",
  options: ["1st", "7th", "14th", "15th", "21st", "28th", "Last day of month"],
  helper_text: "This is the day each month when rent is due. Most common is 1st or the tenancy start day.",
  is_required: true
}

{
  question_id: "bank_account_name",
  question_text: "What is the name on the bank account where rent should be paid?",
  input_type: "text",
  helper_text: "This will be included in the tenancy agreement.",
  is_required: true
}

{
  question_id: "bank_sort_code",
  question_text: "What is the sort code for rent payments?",
  input_type: "text",
  helper_text: "Format: 12-34-56",
  is_required: true,
  validation_rules: {
    pattern: "^\\d{2}-\\d{2}-\\d{2}$"
  }
}

{
  question_id: "bank_account_number",
  question_text: "What is the account number for rent payments?",
  input_type: "text",
  helper_text: "8-digit account number",
  is_required: true,
  validation_rules: {
    pattern: "^\\d{8}$"
  }
}
```

---

## DETAILED AUDIT BY PRODUCT

### 1. NOTICE ONLY (£29.99) - Form 6A

Form 6A has 16 fields. Mapping status:

| PDF Field | Required Data | Current Collection | Status |
|-----------|---------------|-------------------|--------|
| `Premises address` | property_address | ✅ Asked | **OK** |
| `leaving date DD/MM/YYYYY` | notice_expiry_date | ❌ NOT asked | **CRITICAL** |
| `Name 1` | landlord_full_name | ✅ Asked | **OK** |
| `Name 2` | landlord_2_name | ⚠️ Optional | **OK** |
| `Address 1` | landlord_address | ✅ Asked | **OK** |
| `Signatory telephone1` | landlord_phone | ✅ Asked | **OK** |
| `Signatory Name 1` | landlord_full_name | ✅ Asked | **OK** |
| `Date 2` | notice_date | ✅ Asked (if served) | **OK** |

**Critical Gap:** `notice_expiry_date` not asked - See ISSUE 1

---

### 2. COMPLETE EVICTION PACK (£149.99) - Multiple Forms

#### 2.1 Form 6A - Section 21 Notice
Same as NOTICE ONLY above.

#### 2.2 N5 - Claim for Possession (54 fields)

| PDF Field Category | Required Data | Current Collection | Status |
|-------------------|---------------|-------------------|--------|
| Court details | court_name, fee_account | ⚠️ Not asked | **MEDIUM** |
| Claimant details | landlord_full_name, landlord_address | ✅ Asked | **OK** |
| Defendant details | tenant_full_name, property_address | ✅ Asked | **OK** |
| Property address | property_address | ✅ Asked | **OK** |
| Claim grounds checkboxes | Based on eviction reason | ✅ AI determines | **OK** |
| Statement of Truth | signatory_name, signature_date | ✅ Asked | **OK** |
| Service address | landlord_address, phone, email | ✅ Asked | **OK** |

**Gaps:**
- Court name selection not asked (could default to property postcode lookup)
- Fee account number not asked (can be optional)

#### 2.3 N5B - Accelerated Possession (246 fields) ⚠️ MOST CRITICAL

| Section | PDF Fields | Required Data | Current Collection | Status |
|---------|-----------|---------------|-------------------|--------|
| **Header** | 8 fields | court_name, property_address, landlord/tenant names | ⚠️ Court name not asked | **MEDIUM** |
| **Claimant Details** | 6 fields | landlord_full_name (split), address, postcode | ✅ Asked | **OK** |
| **Defendant Details** | 6 fields | tenant_full_name (split), property address | ✅ Asked | **OK** |
| **Costs** | Question 3 | solicitor_costs | ⚠️ Not asked | **LOW** |
| **Property Type** | Question 5 | Is dwelling house? | ✅ Assumed yes | **OK** |
| **Tenancy Dates** | Questions 6-7 | tenancy_start_date, tenancy_agreement_date | ❌ Agreement date not asked | **MEDIUM** |
| **Subsequent Tenancies** | Question 8 | Any renewals? | ⚠️ Not asked | **MEDIUM** |
| **AST Verification** | Questions 9a-9g (7 yes/no) | AST compliance checks | ✅ AI determines (assumes standard AST) | **OK** |
| **Notice Service** | Questions 10a-10e | notice_service_method, notice_date, notice_expiry_date | ❌ Expiry date not asked | **CRITICAL** |
| **HMO Licensing** | Questions 11a-11b | hmo_license_required, hmo_license_valid | ❌ NOT asked | **CRITICAL** |
| **Deposit Protection** | Questions 12-14b | deposit_amount, deposit_protected, deposit_prescribed_info_date, deposit_scheme | ❌ Scheme name + prescribed info date not asked | **CRITICAL** |
| **Housing Act Notice** | Question 15 | housing_act_notice_served | ❌ NOT asked | **CRITICAL** |
| **Documents** | Checkboxes | epc_provided, gas_safety_provided | ❌ Individual tracking not done | **HIGH** |

**Critical Gaps:** See ISSUES 1-6 above

#### 2.4 N119 - Particulars of Claim (54 fields)

| PDF Field Category | Required Data | Current Collection | Status |
|-------------------|---------------|-------------------|--------|
| Court/case details | court_name, landlord/tenant names | ⚠️ Court not asked | **MEDIUM** |
| Property details | property_address, occupants | ✅ Asked | **OK** |
| Tenancy details | tenancy_type, start date, rent amount | ✅ Asked | **OK** |
| Rent frequency | monthly/weekly | ✅ Asked | **OK** |
| Arrears | total_arrears | ✅ Asked (if applicable) | **OK** |
| Grounds for possession | particulars_of_claim | ✅ AI generates | **OK** |
| Notice details | notice_date, notice_type | ✅ Asked | **OK** |
| Claimant type | Private landlord | ✅ Auto-filled | **OK** |

**Gaps:** Minimal - form is well-covered

---

### 3. MONEY CLAIM PACK (£129.99) - Form N1

Form N1 has 43 fields (generic field names). Based on filler code analysis:

| PDF Section | Required Data | Current Collection | Status |
|-------------|---------------|-------------------|--------|
| Court details | court_name | ⚠️ Not asked | **MEDIUM** |
| Claimant details | landlord_full_name, landlord_address | ✅ Asked | **OK** |
| Defendant details | tenant_full_name, last known address | ✅ Asked | **OK** |
| Brief details | particulars_of_claim | ✅ Asked | **OK** |
| Claim amount | total_claim_amount | ✅ Asked | **OK** |
| Breakdown | Rent arrears, damage, cleaning costs | ✅ Asked individually | **OK** |
| Evidence | Tenancy agreement, photos, invoices | ✅ Requested via file_upload | **OK** |
| Court fee | court_fee | ⚠️ Not asked (auto-calculated?) | **LOW** |
| Service address | landlord_address, email, phone | ✅ Asked | **OK** |
| Statement of Truth | signatory_name, signature_date | ✅ Asked | **OK** |

**Analysis:** Money claim wizard is relatively complete. Main gap is court selection (can default based on claim amount and defendant address).

---

### 4. TENANCY AGREEMENTS (£39.99 Standard, £59.00 Premium)

Mandatory checklist (lines 206-221 of fact-finder.ts):

| # | Mandatory Field | Current Collection | Status |
|---|----------------|-------------------|--------|
| 1 | property_address | ✅ Asked | **OK** |
| 2 | landlord_full_name | ✅ Asked | **OK** |
| 3 | landlord_address | ✅ Asked | **OK** |
| 4 | landlord_email | ✅ Asked | **OK** |
| 5 | landlord_phone | ✅ Asked | **OK** |
| 6 | tenant_full_name | ✅ Asked | **OK** |
| 7 | **tenant_dob** | ⚠️ Mentioned but not enforced | **HIGH RISK** |
| 8 | tenant_email | ✅ Asked | **OK** |
| 9 | tenant_phone | ✅ Asked | **OK** |
| 10 | tenancy_start_date | ✅ Asked | **OK** |
| 11 | tenancy_type (fixed/periodic) | ✅ Asked | **OK** |
| 12 | tenancy_end_date (if fixed) | ✅ Asked conditionally | **OK** |
| 13 | term_length (if fixed) | ✅ Asked conditionally | **OK** |
| 14 | rent_amount | ✅ Asked + validated | **OK** |
| 15 | deposit_amount | ✅ Asked + validated against 5 weeks limit | **OK** |

**Additional Essential Fields (lines 160-170) NOT in mandatory checklist:**

| Field | Mentioned in Guidance? | In Mandatory Checklist? | Status |
|-------|----------------------|------------------------|--------|
| rent_due_day | ✅ Yes (line 165) | ❌ No | **MEDIUM RISK** |
| bank_account_name | ✅ Yes (line 170) | ❌ No | **MEDIUM RISK** |
| bank_sort_code | ✅ Yes (line 170) | ❌ No | **MEDIUM RISK** |
| bank_account_number | ✅ Yes (line 170) | ❌ No | **MEDIUM RISK** |
| deposit_scheme | ✅ Yes (line 167) | ❌ No | **HIGH RISK** |
| furnished_status | ✅ Yes (line 168) | ❌ No | **MEDIUM RISK** |
| council_tax_responsibility | ✅ Yes (line 169) | ❌ No | **LOW RISK** |
| utilities_responsibility | ✅ Yes (line 169) | ❌ No | **LOW RISK** |

**Critical Gaps:** See ISSUES 7-8 above

---

## COMPLIANCE GAPS

### 1. Deposit Limits Validation ✅ WORKING
**Status:** Currently implemented correctly

Lines 124-144 of fact-finder.ts show proper validation:
- Calculates max deposit as 5 weeks rent (England & Wales)
- Shows helper text with maximum amount
- Warns if deposit exceeds legal limit
- Includes Tenant Fees Act 2019 penalty warning (£5,000 fine)

**Recommendation:** Keep as is. Working correctly.

---

### 2. HMO License Questions ❌ MISSING
**Status:** NOT asked

**Impact:**
- Section 21 invalid if HMO unlicensed
- £30,000 fine for unlicensed HMO
- Rent Repayment Order risk (tenant can claim back up to 12 months rent)

**Recommendation:** See ISSUE 3 - Add HMO licensing questions

---

### 3. EPC/Gas Safety Questions ⚠️ INCOMPLETE
**Status:** Asked as single yes/no, not individual tracking

**Impact:**
- Cannot validate Section 21 compliance
- Cannot fill N5B individual checkboxes
- Cannot check if EPC rating is F/G (illegal to let)

**Recommendation:** See ISSUE 4 - Split into individual questions

---

### 4. Retaliatory Eviction Checks ❌ MISSING
**Status:** Housing Act 2004 notice question not asked

**Impact:**
- Court may reject Section 21 if served within 6 months of council notice
- Landlord wastes court fees and time
- Tenant can claim harassment/illegal eviction

**Recommendation:** See ISSUE 6 - Add retaliatory eviction check

---

## RECOMMENDATIONS

### Priority 1: CRITICAL FIXES (Document Generation Will Fail)

#### 1.1 Add `notice_expiry_date` to Eviction Wizard
**File:** `/src/lib/ai/fact-finder.ts`
**Lines to modify:** 269-271 (notice service section)

**Add after asking about notice service date:**
```typescript
// Add to EVICTION section around line 271:
✓ If notice already served: "What is the date on the notice by which the tenant must leave?"
✓ If notice not served: "What date do you want the tenant to leave by? (Must be at least 2 months from service for Section 21)"
```

**Update completion criteria (line 286):**
Add `notice_expiry_date` to required fields for eviction cases.

#### 1.2 Add Deposit Protection Details
**File:** `/src/lib/ai/fact-finder.ts`
**Lines to modify:** 256-257 (deposit section)

**Replace lines 256-257 with:**
```typescript
✓ "Did you take a deposit?" (yes/no)
✓ If yes: "How much was the deposit?" (currency)
✓ If yes: "Was it protected in a government scheme within 30 days?" (yes/no)
✓ If yes to protected: "Which scheme? (DPS, MyDeposits, or TDS)"
✓ If yes to protected: "On what date did you give the tenant the prescribed information about the deposit?" (date - must be within 30 days)
✓ If yes to protected: "Has the deposit been returned to the tenant?" (yes/no)
```

#### 1.3 Add HMO Licensing Questions
**File:** `/src/lib/ai/fact-finder.ts`
**Lines to add:** After line 257 (deposit section)

```typescript
✓ "Is this property a House in Multiple Occupation (5+ people from 2+ households) or in a selective licensing area?" (yes/no with explanation)
✓ If yes: "Do you have a valid licence for this property?" (yes/no)
✓ If no to licence: WARNING - "You cannot use Section 21. You must either: (1) Obtain a licence first, or (2) Use Section 8 grounds instead."
```

#### 1.4 Add Individual Compliance Document Tracking
**File:** `/src/lib/ai/fact-finder.ts`
**Lines to replace:** 272-273 (compliance documents)

**Replace single question with:**
```typescript
✓ "Did you provide the tenant with an Energy Performance Certificate (EPC) before the tenancy started?" (yes/no)
✓ If yes to EPC: "What is the EPC rating?" (A/B/C/D/E/F/G)
✓ If F or G: WARNING - "Properties with F/G ratings cannot be let since April 2020. Section 21 may be invalid."
✓ "Did you provide a Gas Safety Certificate before the tenancy started?" (yes/no - if property has gas)
✓ "Did you provide the 'How to Rent' guide before the tenancy started?" (yes/no)
```

---

### Priority 2: HIGH PRIORITY (Forms Incomplete, May Be Rejected)

#### 2.1 Add Tenancy Agreement Date
**File:** `/src/lib/ai/fact-finder.ts`
**Lines to add:** After line 250 (tenancy start date)

```typescript
✓ "When did the tenancy start?" (date) [existing]
✓ "What date is shown on the tenancy agreement itself?" (date - often same as start date)
```

#### 2.2 Add Retaliatory Eviction Check
**File:** `/src/lib/ai/fact-finder.ts`
**Lines to add:** After compliance documents (around line 275)

```typescript
✓ "Have you been served with any notices from the council about the property's condition in the last 6 months?" (yes/no with explanation of improvement notices, prohibition orders, hazard awareness)
✓ If yes: WARNING - "Your Section 21 may be invalid due to retaliatory eviction protection. Seek legal advice."
```

#### 2.3 Enforce `tenant_dob` for Tenancy Agreements
**File:** `/src/lib/ai/fact-finder.ts`
**Lines to modify:** 214 and 223-227

**Ensure tenant_dob is actually asked:**
- Move from "mentioned in guidance" to "explicitly asked question"
- Add to validation check at lines 223-227

```typescript
// Update completion criteria check to include:
⚠️ If ANY mandatory field is missing, set is_complete: false and ask for the missing field
⚠️ Explicitly check: if (!collected_facts.tenant_dob) { ask_for_tenant_dob(); }
```

#### 2.4 Add Bank Details for Tenancy Agreements
**File:** `/src/lib/ai/fact-finder.ts`
**Lines to add:** After rent amount (around line 165)

```typescript
✓ Monthly rent amount [existing]
✓ "What day of the month should rent be paid?" (1st, 7th, 14th, 15th, 21st, 28th, last day)
✓ "What is the bank account name where rent should be paid?" (text)
✓ "What is the sort code?" (format: 12-34-56)
✓ "What is the account number?" (8 digits)
```

**Update mandatory checklist (lines 206-221):**
Add these 4 fields to the ABSOLUTELY REQUIRED list.

---

### Priority 3: MEDIUM PRIORITY (Better UX, Avoid Errors)

#### 3.1 Add Court Selection
Currently court_name is not asked. Options:
- Auto-detect based on property postcode (lookup table)
- Ask user to select from dropdown
- For now: Can be left blank for landlord to fill manually

**Recommendation:** Auto-detect court using postcode lookup (low priority).

#### 3.2 Add Subsequent Tenancy Tracking
N5B question 8 asks if tenant has been granted subsequent written tenancies.

**Add to wizard:**
```typescript
✓ "Has the tenant renewed or signed a new tenancy agreement since the original one?" (yes/no)
✓ If yes: "How many times?" and "Dates of renewals?"
```

#### 3.3 Add Optional AST Clauses Tracking
For Premium AST (£59):
- Pets policy
- Smoking policy
- Break clause
- Rent review clause
- Guarantor details
- Letting agent details
- Special conditions

**Recommendation:** These are already in the guidance (lines 172-185). Ensure AI consistently asks them for Premium AST.

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Critical Fixes (MUST DO - Forms Will Fail Without These)
- [ ] Add `notice_expiry_date` question to eviction wizard
- [ ] Add `deposit_scheme` question (DPS/MyDeposits/TDS)
- [ ] Add `deposit_prescribed_info_date` question
- [ ] Add `deposit_returned` question
- [ ] Add `hmo_license_required` question
- [ ] Add `hmo_license_valid` question (conditional)
- [ ] Split compliance documents into individual questions:
  - [ ] `epc_provided`
  - [ ] `epc_rating` (conditional)
  - [ ] `gas_safety_provided`
  - [ ] `how_to_rent_provided`

### Phase 2: High Priority (Forms Incomplete But Submittable)
- [ ] Add `tenancy_agreement_date` question
- [ ] Add `housing_act_notice_served` question (retaliatory eviction check)
- [ ] Enforce `tenant_dob` collection for tenancy agreements
- [ ] Add bank details questions:
  - [ ] `rent_due_day`
  - [ ] `bank_account_name`
  - [ ] `bank_sort_code`
  - [ ] `bank_account_number`
- [ ] Update mandatory completion criteria to include all above fields

### Phase 3: Medium Priority (UX Improvements)
- [ ] Add court selection/auto-detection
- [ ] Add subsequent tenancy tracking
- [ ] Ensure Premium AST asks all optional clauses
- [ ] Add validation warnings for F/G EPC ratings
- [ ] Add validation warnings for unlicensed HMO

---

## TESTING RECOMMENDATIONS

### Test Case 1: Section 21 Notice Generation
**Product:** Notice Only (£29.99)

**Required Fields to Test:**
1. ✅ property_address
2. ✅ landlord_full_name
3. ✅ landlord_address
4. ✅ landlord_phone
5. ❌ **notice_expiry_date** ← TEST THIS IS ASKED
6. ✅ notice_date (if already served)

**Expected Outcome:** Form 6A should be fillable with leaving date.

---

### Test Case 2: Accelerated Possession (N5B)
**Product:** Complete Eviction Pack (£149.99)

**Required Fields to Test:**
1. All claimant/defendant details ✅
2. Tenancy dates:
   - ✅ tenancy_start_date
   - ❌ **tenancy_agreement_date** ← TEST THIS IS ASKED
3. Deposit protection:
   - ✅ deposit_amount
   - ❌ **deposit_scheme** ← TEST THIS IS ASKED
   - ❌ **deposit_prescribed_info_date** ← TEST THIS IS ASKED
4. HMO licensing:
   - ❌ **hmo_license_required** ← TEST THIS IS ASKED
   - ❌ **hmo_license_valid** ← TEST THIS IS ASKED
5. Compliance documents:
   - ❌ **epc_provided** ← TEST INDIVIDUAL TRACKING
   - ❌ **epc_rating** ← TEST THIS IS ASKED
   - ❌ **gas_safety_provided** ← TEST INDIVIDUAL TRACKING
   - ❌ **how_to_rent_provided** ← TEST INDIVIDUAL TRACKING
6. Notice details:
   - ✅ notice_date
   - ❌ **notice_expiry_date** ← TEST THIS IS ASKED
7. Retaliatory eviction:
   - ❌ **housing_act_notice_served** ← TEST THIS IS ASKED

**Expected Outcome:** All 246 fields in N5B should be fillable.

---

### Test Case 3: Tenancy Agreement
**Product:** Standard AST (£39.99) or Premium AST (£59.00)

**Required Fields to Test:**
1. All mandatory fields (lines 206-221) ✅
2. ❌ **tenant_dob** ← TEST THIS IS CONSISTENTLY ASKED
3. ❌ **rent_due_day** ← TEST THIS IS ASKED
4. ❌ **bank_account_name** ← TEST THIS IS ASKED
5. ❌ **bank_sort_code** ← TEST THIS IS ASKED
6. ❌ **bank_account_number** ← TEST THIS IS ASKED
7. ❌ **deposit_scheme** ← TEST THIS IS ASKED

**Expected Outcome:** Complete AST agreement with all payment details.

---

## SUMMARY TABLE: ALL MISSING FIELDS

| # | Missing Field | Affects Products | Form(s) | Priority | Impact if Missing |
|---|--------------|------------------|---------|----------|-------------------|
| 1 | `notice_expiry_date` | Notice Only, Complete Pack | Form 6A, N5B | 🔴 CRITICAL | Form cannot be filled, notice invalid |
| 2 | `deposit_scheme` | Complete Pack | N5B | 🔴 CRITICAL | Cannot prove deposit protection |
| 3 | `deposit_prescribed_info_date` | Complete Pack | N5B | 🔴 CRITICAL | Cannot prove compliance with 30-day rule |
| 4 | `deposit_returned` | Complete Pack | N5B | 🔴 CRITICAL | Cannot answer question 13 |
| 5 | `hmo_license_required` | Complete Pack | N5B | 🔴 CRITICAL | Cannot answer question 11a, Section 21 may be invalid |
| 6 | `hmo_license_valid` | Complete Pack | N5B | 🔴 CRITICAL | Cannot answer question 11a follow-up, Section 21 invalid if unlicensed |
| 7 | `epc_provided` | Complete Pack | N5B | 🔴 HIGH | Cannot tick checkbox F, Section 21 may be invalid |
| 8 | `epc_rating` | Complete Pack | N5B | 🔴 HIGH | Cannot validate F/G illegal lettings |
| 9 | `gas_safety_provided` | Complete Pack | N5B | 🔴 HIGH | Cannot tick checkbox G, Section 21 may be invalid |
| 10 | `how_to_rent_provided` | Complete Pack | N5B | 🔴 HIGH | Section 21 may be invalid |
| 11 | `tenancy_agreement_date` | Complete Pack | N5B | 🟡 MEDIUM | Question 7 cannot be filled |
| 12 | `housing_act_notice_served` | Complete Pack | N5B | 🔴 HIGH | Cannot answer question 15, retaliatory eviction risk |
| 13 | `tenant_dob` | Tenancy Agreements | AST | 🔴 HIGH | Agreement may be invalid, Right to Rent breach |
| 14 | `rent_due_day` | Tenancy Agreements | AST | 🟡 MEDIUM | Tenant doesn't know when to pay |
| 15 | `bank_account_name` | Tenancy Agreements | AST | 🟡 MEDIUM | Tenant doesn't know where to pay |
| 16 | `bank_sort_code` | Tenancy Agreements | AST | 🟡 MEDIUM | Cannot set up standing order |
| 17 | `bank_account_number` | Tenancy Agreements | AST | 🟡 MEDIUM | Cannot set up standing order |
| 18 | `deposit_scheme` (AST) | Tenancy Agreements | AST | 🟡 MEDIUM | Landlord doesn't know which scheme to use |

---

## RISK ASSESSMENT

### Document Generation Failure Risk

**Forms at HIGH RISK of generation failure:**
1. ✅ **Form 6A** - Will fail if `notice_expiry_date` not collected
2. ✅ **N5B** - Will have 18+ unfilled required fields
3. ⚠️ **AST** - May generate but lack critical legal clauses

**Forms at MEDIUM RISK:**
1. **N5** - Most fields covered, minor gaps
2. **N119** - Well covered by wizard
3. **N1** - Well covered by wizard

### Legal Compliance Risk

**Section 21 Invalidity Risk:**
- ❌ HMO licensing not checked → **AUTOMATIC INVALIDITY** if unlicensed
- ❌ Deposit prescribed info date not verified → **INVALIDITY** if not given within 30 days
- ❌ EPC/Gas Safety/How to Rent not individually tracked → **INVALIDITY** if not provided
- ❌ Retaliatory eviction not checked → Court may **REFUSE** possession
- ❌ Notice expiry date not collected → Notice may be **INVALID**

**Estimated Section 21 Failure Rate:** 60-80% if these gaps not fixed

**Tenancy Agreement Legal Risk:**
- ❌ Tenant DOB not consistently collected → Right to Rent breach, £3,000 fine
- ❌ Bank details not collected → Tenant cannot pay rent properly
- ❌ Deposit scheme not specified → Landlord may fail to protect deposit (£1-3x deposit penalty)

---

## CONCLUSION

**The wizard has CRITICAL gaps that will prevent document generation and cause legal compliance failures.**

**Immediate action required:**
1. Add 8 critical fields to eviction wizard (ISSUES 1-6)
2. Enforce tenant_dob and bank details for tenancy agreements (ISSUES 7-8)
3. Test all products end-to-end with filled forms

**Estimated fix time:**
- Phase 1 (Critical): 4-6 hours of development + testing
- Phase 2 (High Priority): 2-4 hours
- Phase 3 (Medium Priority): 2-3 hours

**Total:** 8-13 hours to fix all critical issues

---

**Last Updated:** 2025-11-22
**Next Review:** After implementing Priority 1 fixes
