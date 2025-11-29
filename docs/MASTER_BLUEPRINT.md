🏛️ Landlord Heaven — Master Blueprint (2025–2026)

Version 8.0 — Definitive Product, Legal, and Technical Specification
Updated: December 2025

1. OVERVIEW

Landlord Heaven is the UK’s first end-to-end landlord legal automation platform covering:

🧾 Evictions (Section 8, Section 21, Tribunal)

💰 Money claims (rent arrears, damages)

🏘️ Tenancy agreements (AST, PRT, NI Private Tenancies)

🏢 HMO licensing (instant council-ready packs)

📂 Evidence & document storage

🔍 AI compliance checks (Ask Heaven)

⚙️ Automated legal workflows using MQS

The platform replaces 70–80% of what high-street solicitors and agents do, delivering:

Official court forms

Automated legal reasoning

Complete document bundles

Real-time compliance validation

Council- and jurisdiction-specific rules

Unlimited document regeneration

One unified system for every legal stage of a tenancy:

Start the tenancy → Agreements

Manage the tenancy → HMO Pro Membership

End the tenancy → Eviction

Recover losses → Money Claim Pack

Store evidence forever → Document vault

2. MISSION & POSITIONING
Mission Statement

“To give every UK landlord the power to resolve legal issues faster, cheaper, and with greater confidence — without needing a solicitor or agent.”

Market Position

Landlord Heaven sits between:

❌ DIY template sites (cheap but inaccurate)

❌ Solicitors (£600–£2,500 per case)

❌ Paralegals (inconsistent, unregulated)

❌ Government forms (confusing, fragmented)

We offer:

✔ Solicitor-level accuracy

✔ Official forms, not replicas

✔ AI-guided drafting & validation

✔ Instant documents

✔ Predictable fixed prices

✔ Multi-jurisdiction support (E&W, Scotland, NI)

✔ Auto-updated legal logic

This is the UK’s first full-stack landlord legal system.

3. PRODUCT CATALOGUE (2025 PRICING, UPDATED)
3.1 Notice Only — £19.99

The top-of-funnel product.

Includes:

Section 8 (E&W)

Section 21 (Form 6A)

Notice to Leave (Scotland)

Notice to Quit (NI)

Expiry calculation

Ground selection

Legal guidance (Ask Heaven)

Service instructions

Proof-of-service templates

3.2 Complete Eviction Pack — £199

Everything from notice → possession order.

England & Wales

Section 8

Section 21

N5 (claim form)

N5B (accelerated possession)

N119 (particulars of claim)

Evidence index

Arrears schedule

ASB particulars

Hearing guidance

Bailiff route

Case-strength scoring

Scotland

Notice to Leave

Form E

Tribunal pack

Rent schedule

Sheriff officer guidance

Northern Ireland

Notice to Quit

Court guidance

Evidence schedule

3.3 Money Claim Pack — £179

Recover rent arrears/damages.

England & Wales

Official N1 (Dec 2024) filled

Particulars of claim

Rent arrears schedule

Section 69 interest

Evidence index

Filing steps (MCOL & paper)

Default judgment guidance

Enforcement pathways

Scotland

Form 3A (Simple Procedure)

Statement of claim

Arrears/damage schedule

Sheriffdom routing

Court fee calculation

Northern Ireland

🚫 Not supported.

3.4 Tenancy Agreements (Updated 2025 Pricing)
Product	Price	Jurisdiction
AST Standard	£19.99	E&W
AST Premium	£29.99	E&W
PRT Standard	£19.99	Scotland
PRT Premium	£29.99	Scotland
NI Standard	£19.99	NI
NI Premium	£29.99	NI

Includes:

Custom clauses

Safety compliance checks

Deposit protection guidance

HMO integration

Unlimited regeneration

3.5 HMO Licensing Suite (Updated)
⭐ HMO Standard Pack — £129.99

Council-specific application

Fit & Proper declaration

Amenity standards checklist

Management arrangements

Level 1–2 AI QC

Evidence checklist

Submission instructions

⭐ HMO Premium Pack — £199.99

Everything in Standard, plus:

Auto-generated floor plan (PDF)

Fire safety self-assessment pack

Escape route diagram

Occupancy matrix

Evidence bundle ZIP

Level 3 AI QC

Multi-floor support

➕ HMO Pro Membership (light add-on) — £9.99/mo

Unlimited tenancy agreement regeneration

90/30/7-day reminders (gas, EICR, licence expiry)

Compliance dashboard

Tenant/room management

Document vault

First month £1

This replaces the old £19–£49 subscription.
Membership is now a lightweight upsell, not a core product.

4. ASK HEAVEN™ — AI LEGAL CO-PILOT

Ask Heaven enhances answers, improves clarity, and prevents user mistakes.

Responsibilities

Summarise user statements

Suggest improved, court-ready answers

Flag risks

Identify missing information

Check compliance

Provide examples

Never give actionable legal advice

Never hallucinate

Never pick legal strategies

Persona

Senior housing solicitor (E&W + Scotland + NI)

Evidence-focused

Cautious, neutral, factual

Non-advisory

Jurisdiction aware

5. MASTER QUESTION SETS (MQS)

MQS is now the single source of truth for:

Notices

Court forms

Tenancy agreements

HMO licensing

Evidence packs

Schedules

Case-strength scoring

Decision routing

Each product/jurisdiction has its own .yaml file.

MQS Question Definition
id: unique_field_name
question: displayed text
type: text|date|currency|boolean|multi|upload
required: true|false
validation: regex|zod|council_rule
suggestion: Ask Heaven prompt
maps_to: [...]
jurisdictions: [...]
conditions: [...]


Removes all guesswork.
Prevents missing fields permanently.

6. UNIFIED CONVERSATIONAL FLOW

User selects product

Jurisdiction chosen / validated

User describes situation (only free-text step)

Ask Heaven summarises & highlights missing facts

MQS begins

Ask Heaven suggests improvements

Real-time validation

Evidence upload

Case-strength or compliance score

Paywalled 2–3 page preview

Stripe checkout

Document bundle generation

Dashboard delivery & timeline

7. DECISION ENGINE

Responsible for:

Tenancy type inference

Correct route selection

Correct notice (s8/s21/n2L/NTQ)

Accelerated vs standard route (E&W)

Court path (MCOL, N5/N5B, Tribunal, NI)

Deposit protection checks

HMO licence type (mandatory/additional/selective)

Compliance scoring

Rules stored in:
/config/jurisdictions/<region>/decision_rules.yaml

8. DOCUMENT ENGINE

Outputs:

Official PDFs (N1, N5, N5B, N119, Form E, Form 3A, Form 6A)

HMO PDFs (council-specific)

Signature-ready documents

Watermarked previews

Evidence index

Rent/interest schedules

Court-ready particulars

Uses:

pdf-lib

Handlebars

Official form templates stored under /public/official-forms/**

9. USER DASHBOARD

Users can:

View cases

View generated documents

Resume wizards

Re-upload evidence

Regenerate packs

View compliance timelines

Manage HMO properties

Manage tenants

Download ZIP bundles

Manage subscription

10. ADMIN PORTAL

Admins can:

View all cases

View all documents

QA forms

Restart generation

Manage pricing

Manage templates

Update council/HMO rules

Override forms

View revenue breakdown

Manage discount codes

Review AI logs

Trigger law scraper updates

11. TECHNICAL ARCHITECTURE

Frontend: Next.js 14

Backend: Next.js Server Actions + API Routes

Database: Supabase (Postgres)

Auth: Supabase Auth

Storage: Supabase Storage

AI: GPT-4o + GPT-4o-mini (depending on task)

Billing: Stripe

PDF Generation: pdf-lib + council templates

Task Scheduling: CRON (Node)

Logging: Supabase Functions

Testing: Vitest + Playwright

12. LEGAL COMPLIANCE

The system ensures:

All notices comply with statutory forms

Court forms are official PDFs, never replicas

Evidence requirements are enforced

Advice boundaries respected

Tenancy deposit rules validated

NI money claims blocked

No strategy-level legal advice given

Ask Heaven suggestions are factual, not advisory

13. COMMERCIAL STRATEGY (UPDATED)
Phase 1 — 0–30 Days

Launch Notice Only

Launch Eviction Pack

Launch SEO for councils

TikTok / YouTube organic

Run small paid campaigns

Phase 2 — 30–90 Days

Launch Money Claim Pack (E&W + Scotland)

Tenancy agreements upsell

Begin affiliate partnerships

Phase 3 — 3–12 Months

Launch HMO Standard + Premium

Launch HMO Pro Membership

Council advertising

Landlord insurance partnerships

Letting agent white-label

14. GROWTH FORECAST (UPDATED FOR 2025–26)
Scenario	Revenue (Year 1)
Conservative	£260k–£340k
Realistic	£350k–£500k
Strong	£600k–£800k
⭐ With HMO Suite	£1.0M–£1.6M
HMO Pro Membership (Year 3)	£1.2M–£2.5M ARR
15. FUTURE WORK

Auto-law updates (via scrapers)

AI-driven evidence validation

Tenant communication templates

Smart timelines

Voice-enabled Ask Heaven

API for letting agents

White-label B2B version

END OF MASTER BLUEPRINT

This is now the authoritative source of truth for all product, legal, technical, and commercial decisions across Landlord Heaven.