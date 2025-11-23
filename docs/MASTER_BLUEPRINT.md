# Landlord Heaven — Master Blueprint (2025–2026)
Version 7.0 — Definitive Product, Legal, and Technical Specification

Last updated: November 2025

1. Overview

Landlord Heaven is the UK’s first multi-jurisdictional eviction, money-claim, tenancy agreement, and HMO compliance platform with:

Official court form generation

Guided legal workflows

Ask Heaven™ — AI Legal Co-Pilot

Master Question Sets (MQS)

Dynamic law updates

Cloud document storage

Landlord portfolio management

The platform delivers solicitor-grade outputs at a fraction of the cost and powers the entire lifecycle of a tenancy:

Start a tenancy (agreements)

Manage a tenancy (HMO Pro)

End a tenancy (eviction)

Recover losses (money claim)

Store evidence (dashboard)

Auto-update compliance (scrapers)

The system is designed to be legally accurate, jurisdiction aware, and evidence driven, replacing 70–80% of what high-street solicitors do for landlords.

2. Mission & Positioning
Mission Statement

“To give every UK landlord the power to resolve legal issues faster, cheaper, and with greater confidence — without needing a solicitor.”

Market Position

Landlord Heaven sits between:

DIY template websites (too basic, often wrong)

Solicitors (expensive, slow)

Paralegal services (inconsistent quality)

Government forms (confusing, fragmented)

We offer:

solicitor-level accuracy

instant document generation

conversational support

predictable pricing

multi-jurisdiction coverage

automated updates

This is the first truly unified platform across E&W, Scotland, and NI.

3. Product Catalogue (with Pricing)
3.1 Notice Only (£39)

Fastest-selling, top-of-funnel product.

Includes:

Section 8 (E&W)

Section 21 (Form 6A)

Notice to Leave (Scotland)

Notice to Quit (Northern Ireland)

Expiry calculations

Legal ground selection

Ask Heaven guided drafting

Service instructions

Proof-of-service template

This is the “starter” legal action landlords need before progressing to court.

3.2 Complete Eviction Pack £199

Everything required from notice → possession order.

England & Wales

Section 8

Section 21

N5 Claim Form

N5B Accelerated Possession Form

N119 Particulars of Claim

Evidence index

Rent arrears schedule

Anti-social behaviour particulars

Breach particulars

Hearing preparation

Bailiff/HCEO guidance

Case-strength scoring

Scotland

Notice to Leave

Form E

Tribunal lodging guidance

Evidence requirements

Rent schedule

Sheriff officer guidance

Northern Ireland

Notice to Quit

Court pathway guidance

Evidence checklist

3.3 Money Claim Pack (£179)

Recover rent arrears + damages.

England & Wales

Official N1 Claim Form (Dec 2024)

Particulars of claim

Rent arrears schedule

Section 69 interest statement

Evidence index

Filing instructions (MCOL + paper)

Default judgment guidance

Enforcement tools

Scotland (Simple Procedure)

Form 3A Claim Form

Statement of claim

Arrears/damage schedule

Sheriffdom selection

Court fee calculation

Evidence index

Lodging instructions

Northern Ireland

❌ Not legally supported

3.4 Tenancy Agreements
Product	Price	Jurisdiction
AST Standard	£39	E&W
AST Premium	£59	E&W
PRT Standard	£39	Scotland
PRT Premium	£59	Scotland
NI Private Tenancy Standard	£39	NI
NI Private Tenancy Premium	£59	NI

Includes Ask Heaven guidance for custom clauses, safety compliance checks, deposit protection, HMO rules, and document storage.

3.5 HMO Pro (Recurring £19–£49/mo)

The long-term revenue engine.

Features:

Council-by-council licence rules

Renewal reminders

Evidence pack generation

Safety certificate logs

Portfolio management

Fire risk templates

Auto-scraped regulation updates

Document uploads

AI evidence analysis

4. Ask Heaven™ — AI Legal Co-Pilot

Ask Heaven is NOT the wizard.
It is the assistant that improves answers, warns of legal risks, and ensures clarity.

Ask Heaven responsibilities:

Summarise user statements

Highlight red flags

Suggest improved answers

Provide legal context

Never hallucinate

Never guess legal facts

Suggest what evidence should be uploaded

Pre-fill complex fields (e.g., “Describe ASB incidents”)

Improve language for court suitability

Ask Heaven persona:

Senior UK housing solicitor

Neutral, factual, risk-aware

Legally cautious

Evidence-driven

Jurisdiction specific

5. MQS — Master Question Sets

MQS replaces unpredictable AI-led wizards.

It is the single source of truth for all fields required to generate:

Notices

Court forms

Particulars

Evidence packs

Schedules

Case-strength scoring

Jurisdiction routing

Each product + jurisdiction has its own MQS file, for example:

Example: /config/mqs/eviction/england-wales.yaml

Includes:

case_overview
tenancy_type
tenancy_dates
rent_terms
rent_arrears
deposit_protection
safety_checks
HMO_checks
breach_evidence
asb_details
witnesses
notice_service
tenant_details
property_details
attempts_to_resolve
hearing_preferences
statement_of_truth

MQS Question definition:

Each question includes:

id: unique_field_name
question: what the user sees
type: text | date | currency | boolean | multi | upload
required: true | false
validation: regex | zod rule
suggestion: Ask Heaven prompt
maps_to: fields in documents
jurisdictions: [...]


This ensures no missing fields ever again.

6. Unified Conversational Flow
1. Product selection

From /products/*.

2. Jurisdiction selection

Blocks NI money-claim automatically.

3. “Tell us what’s going on”

Ask Heaven summarises + identifies missing info.

4. MQS question engine

Each question flows:

Display question

User answers

Ask Heaven suggests improvements

User accepts/edits

Save to collected_facts

5. Evidence upload

User can upload:

bank statements

tenancy agreements

rent ledgers

safety certs

crime reports

photos

Ask Heaven:

extracts structured fields

warns of missing evidence

updates case-strength score

6. Case-strength Score

Using decision engine + evidence.

7. Paywalled Preview

2-page preview behind Stripe.

8. Checkout

Different SKUs per jurisdiction.

9. Document Generation

Official PDFs filled:

N5, N5B, N119

N1

Form 3A

Form E

Section 21 Form 6A

Section 8

Notice to Leave

Notice to Quit

10. User Dashboard storage

Documents, evidence, timelines, next steps.

7. Decision Engine

The decision engine is responsible for:

Jurisdiction validation

Tenancy type inference

Selecting correct notice

Selecting correct court route

Selecting grounds

Calculating expiry periods

Assessing evidence completeness

Generating case-strength score

Rules stored in:

/config/jurisdictions/*/decision_rules.yaml

8. Document Engine

The engine produces must-have outputs:

Official PDF form fills

HTML previews

Evidence schedules

Interest calculations

Rent schedules

Guidance documents

Official forms stored in:

/public/official-forms/**


Mapped via:

official-forms-filler.ts
scotland-forms-filler.ts
northern-ireland-forms-filler.ts

9. User Dashboard Specification

User can:

View cases

View all generated documents

Download PDFs

Preview HTML

Upload additional evidence

Resume MQS

Regenerate documents

View case-strength score

Access timeline guidance

See expiry warnings

Manage subscription (HMO Pro)

10. Admin Portal Specification

Admin capabilities:

View all cases

View all users

View all generated documents

Override documents

Restart generation

View AI logs

Adjust prices

Enable/disable regions

Manage templates

View revenue

Manage discount codes

Manage HMO Pro rules

Manage law-scraper schedules

11. Technical Architecture

Frontend: Next.js 14

Backend: Next.js Server Actions / API Routes

Database: Supabase (Postgres)

Auth: Supabase Auth

Storage: Supabase storage

AI: Ask Heaven (GPT-4 mini for suggestions, GPT-4o for complex tasks)

Payments: Stripe

File generation: pdf-lib, Handlebars

Legal scrapers: CRON scripts running Node

Logging: Supabase Functions

Test suite: Vitest & Playwright

12. Legal Compliance

The blueprint ensures:

Notices follow statutory requirements

Court forms use official PDFs

Evidence requirements enforced

No advice outside legal information boundaries

Jurisdiction boundaries respected

NI money claims blocked

Ask Heaven prevents unlawful eviction steps

13. Commercial Strategy
Phase 1 (0–30 days)

Launch Notice Only

Launch Eviction Pack

Begin Paid Traffic

Organic TikTok + YouTube

Phase 2 (30–90 days)

Money Claim Pack (E&W + Scotland)

Price uplift

Bundle upsells

Phase 3 (3–12 months)

HMO Pro

Council advertising

Landlord insurance affiliate partnerships

14. Growth Forecast (Corrected)

Based on real market reality:

Conservative: £260k–£340k

Realistic: £350k–£500k

Stretch: £600k–£800k

HMO Pro scaling: £1.2M–£2.5M ARR by Year 3

15. Future Work

Auto-law updates (scrapers)

AI-driven evidence validation

Tenant communication templates

Smart timelines

VOICE-enabled Ask Heaven

API for letting agents

White-label version

End of Master Blueprint

This file is the central source of truth for all product, legal, technical, and operational decisions.