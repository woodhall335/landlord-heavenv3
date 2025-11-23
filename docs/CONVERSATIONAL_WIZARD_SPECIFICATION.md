# Conversational Wizard Specification  
### Landlord Heaven – Unified MQS + Ask Heaven Flow  
_Last updated: November 2025_

---

# 1. Purpose

This document defines the **complete architecture, flow, behaviour, and requirements** for the Landlord Heaven Conversational Wizard.

The wizard serves as the **guided interface** which:

- Collects all facts needed for notices, court forms, and document packs  
- Validates user input  
- Enhances answers with Ask Heaven  
- Ensures legal accuracy through MQS (Master Question Sets)  
- Supports evidence uploads  
- Delivers a paywalled preview  
- Triggers document generation  

The wizard does **not** generate free-form questions.  
All questions come from **deterministic MQS files** per jurisdiction and product.

Ask Heaven assists, MQS controls.

---

# 2. Core Components

The wizard is made of four interconnected systems:

1. **Master Question Sets (MQS)** – the deterministic question engine  
2. **Ask Heaven™** – the AI assistant offering suggestions  
3. **Wizard API** – handles input/output, validation, persistence  
4. **Case & Evidence Store** – persistent store in Supabase  

---

# 3. Wizard Flow (Universal Across All Products)

This flow applies to:

- Notice Only  
- Complete Eviction Pack  
- Money Claim Pack  
- Tenancy Agreements  
- HMO Pro onboarding  

## **Step 1 — Product + Jurisdiction Selection**
User either arrives via:

- `/wizard?product=complete_pack`
- `/wizard?product=notice_only`
- `/wizard?product=money_claim`
- `/wizard?product=ast_standard`, etc.

Jurisdiction is selected with blocking logic:

- NI cannot choose money-claim  
- All can choose tenancy agreements  
- Eviction flows apply jurisdiction-specific rules  

---

## **Step 2 — “Describe the situation”**
This is the only free-text step.

User writes:  

> “My tenant hasn’t paid rent for 3 months, won’t respond, and the tenancy started in 2021.”

Ask Heaven performs:

- Summary  
- Key missing facts  
- Legal risks  
- Timeline indication  
- Reassurance  

Nothing is stored except the raw text and AI summary.

---

## **Step 3 — Begin MQS**

MQS files determine:

- Order of questions  
- Data types  
- Validation  
- Required vs optional logic  
- Jurisdiction overrides  
- Conditional logic (e.g., Ground 8 questions only appear when “rent arrears” selected)

Each question is displayed with:

- **The question text**  
- **Input field** (text/date/upload/etc.)
- **Ask Heaven suggestion box**  
- **“Accept suggestion”** button  

When user submits:

- Validation runs  
- Input is saved to `collected_facts`  
- Decision engine may set flags (e.g. “ground_8_applicable: true”)  
- Wizard progresses to next MQS question  

The wizard automatically resumes where the user left off.

---

# 4. Master Question Set (MQS) Structure

Each MQS is a YAML file stored under:

/config/mqs/{product}/{jurisdiction}.yaml

makefile
Copy code

Example:

/config/mqs/eviction/england-wales.yaml
/config/mqs/money_claim/scotland.yaml
/config/mqs/notice_only/northern-ireland.yaml

yaml
Copy code

## MQS Field Structure

```yaml
- id: tenancy_start_date
  question: "When did the tenancy begin?"
  type: date
  required: true
  maps_to:
    - "tenancy.start_date"
    - "court_forms.N5.tenancy_start_date"
  validation:
    format: "YYYY-MM-DD"
  suggestion_prompt: "Help the user provide the correct tenancy start date according to the tenancy agreement."
  jurisdictions: ["england-wales"]
  conditions:
    depends_on: null
Field types supported:

text

textarea

date

currency

number

boolean

multiple_choice

upload (PDF, images, docs)

address

5. Evidence Upload Flow
At designated MQS points:

nginx
Copy code
upload_bank_statements
upload_tenancy_agreement
upload_safety_certificates
upload_rent_ledger
User uploads files.

Ask Heaven:

Extracts structured fields

Identifies missing evidence

Scans for compliance risks

Adds extracted data into collected_facts

All files are stored in:

bash
Copy code
/storage/cases/{case_id}/evidence/*
6. Case Strength Score
At the end of MQS:

Decision engine reviews all facts

Reviews evidence presence

Scores on:

Legal compliance

Notices viability

Deposit protection correctness

Document completeness

Evidence sufficiency

Jurisdiction pitfalls

Output:

makefile
Copy code
case_strength_score: 0–100
case_risks: [array]
recommendations: [array]
Displayed before paywall.

7. Paywalled Preview (2 Pages)
Before checkout, user sees:

HTML preview of first 1–2 pages

Non-downloadable

Watermarked

Locked after 2 page scroll

Stripe checkout required to unlock full pack.

8. Document Generation
After Stripe success:

Wizard triggers document generator

MQS → collected_facts → decision engine → route selection

Each form generated:

Official PDF forms (N1, N5, N5B, Form 3A, Form E)

HTML previews

Guidance docs

Schedules (arrears, interest, evidence index)

All stored in:

swift
Copy code
/storage/documents/{user_id}/{case_id}/*
9. Dashboard Behaviour
User can:

Resume wizard

View/download documents

Upload more evidence

Regenerate documents

View timeline steps

Access Ask Heaven aftercare

10. Ask Heaven Integration Rules
For every question:

Ask Heaven receives:

question text

user’s raw answer

jurisdiction

product type

collected_facts so far

Ask Heaven must:

Suggest improvements

Flag missing facts

Check legal risks

Provide examples suitable for courts

Never hallucinate

Never choose legal strategy

Never declare certainty

Suggestions are optional. The wizard moves forward on user confirmation.

11. API Endpoints (Overview)
/api/wizard/start
/api/wizard/next-question
/api/wizard/answer
/api/wizard/analyze
/api/wizard/upload-evidence
/api/wizard/complete

All accept/return structured JSON.

12. End of Specification
This file governs all wizard logic, design, data flow, and question handling.
It must remain consistent with the Master Blueprint and Ask Heaven system prompt.

yaml

---
