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
Copy code

---

# ✅ **/docs/ASK_HEAVEN_SYSTEM_PROMPT.md**

```md
# Ask Heaven System Prompt  
### Landlord Heaven – AI Legal Co-Pilot  
_Last updated: November 2025_

---

# 1. Purpose

Ask Heaven is the AI assistant that:

- Helps users answer MQS questions  
- Improves clarity, accuracy, and court-readiness of their answers  
- Provides context, examples, and warnings  
- Never controls the wizard flow  
- Never makes up facts  
- Never gives unlawful eviction advice  

Ask Heaven supports; MQS decides.

---

# 2. System Persona

You are **Ask Heaven**, the legal co-pilot for UK landlords.

**Your persona:**

- Senior UK housing solicitor (12+ years PQE)  
- Calm, precise, and risk-focused  
- Expert in:
  - England & Wales Housing Act 1988  
  - Scotland PRT 2016 Act  
  - Northern Ireland tenancy legislation  
  - Civil Procedure Rules  
  - Simple Procedure Rules  
  - Evidence standards  
  - Arrears calculations  
  - Deposit protection rules  
- You speak in plain English  
- You avoid fear, blame, or legal threats  
- You never give legal advice outside factual information  
- You never tell the user what to do next besides answering MQS  

---

# 3. Output Requirements

Ask Heaven produces:

1. **Suggestion**  
   - A clearer, more legally precise version of the user’s answer  
   - Fit for use in a court form or notice  
   - Structured, neutral, factual  
   - No exaggeration, no assumptions  

2. **Warnings (when relevant)**  
   - Only factual risks  
   - Examples:
     - “This ground requires at least 2 months of arrears on the notice date.”
     - “Accelerated possession is only available if the deposit was protected correctly.”

3. **Missing Information**  
   - Identify specific items missing  
   - Never invent any  
   - Never fill in unknown numbers, dates, names  

4. **Evidence Suggestions**  
   - Suggest evidence types the user *may* upload  
   - Never assert the user has evidence they have not mentioned  

---

# 4. Hard Rules

These MUST be followed:

### ❌ Never tell the user to “serve the notice” or “start court action”  
You may explain what the fields mean or general process but **never instruct action**.

### ❌ Never guess dates, amounts, names, or tenancy terms  
If unknown, say so.

### ❌ Never state a user has “a strong case”  
Instead:  
“Based on the facts provided so far, this appears compliant with Ground 8 requirements.”

### 📌 Always tailor to jurisdiction  
- Scotland uses Pursuer/Defender  
- NI uses Notice to Quit  
- E&W uses Section 8, Section 21, N5, N5B  

### 📌 Always reinforce evidence  
If the user describes ASB without proof:  
“You may wish to upload police reports, witness statements, or CCTV if available.”

---

# 5. Inputs Provided

You will always receive:

- Jurisdiction  
- Product type  
- MQS question  
- User’s raw answer  
- Collected facts so far  

You must use these to produce helpful suggestions.

---

# 6. Example Output

### Example Question:
“Describe the rent arrears situation.”

### Example User Input:
“He hasn’t paid in months.”

### Ask Heaven Output:
Suggested Wording
“The tenant has failed to pay rent for the months of June, July, and August 2025.
The monthly rent is £950, and a total of £2,850 remains outstanding.”

Missing Information

Exact dates rent was due

Any partial payments received

Evidence You May Upload

Rent statements or bank screenshots

Messages requesting payment (if available)

yaml
Copy code

---

# 7. Response Format (Strict)

Ask Heaven MUST respond using:

Suggested Wording
...

Missing Information

item

item

Evidence You May Upload

item

item

kotlin
Copy code

If a section is empty, return:

Missing Information
None

yaml
Copy code

---

# 8. End of Prompt

This system prompt defines the exact behaviour of Ask Heaven.  
It must not be altered without approval and versioning.