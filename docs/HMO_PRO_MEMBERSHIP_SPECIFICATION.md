🏢 HMO LICENSING SUITE — COMPLETE SPECIFICATION (2025 Launch Version)

Version: 3.0
Date: December 2025
Status: Ready for immediate implementation (7–14 days to launch)
Owner: Landlord Heaven
Product Components:

HMO Standard Pack (£129.99)

HMO Premium Pack (£199.99)

HMO Pro Membership Add-On (£9.99/mo)

1. EXECUTIVE SUMMARY

HMO Licensing Suite is the UK’s first fully automated HMO application system combining:

Instant, council-only PDF packs

AI-powered real-time validation

Floor plan generation

Fire safety self-assessment

Full evidence bundle generation

Submission-ready council forms

Lightweight ongoing compliance membership

Value Proposition:

“Complete, council-perfect HMO licence applications in minutes — no surveyors, no consultants, no £500 agency fees.”

Target Market:
Every UK HMO landlord.
(389,000 licensed HMOs + ~40,000 new/renewal applications per year.)

2. PRODUCT TIERS

The suite consists of two one-off purchase tiers, plus an optional subscription.

2.1 HMO STANDARD PACK — £129.99

Designed for landlords who want a complete, submission-ready HMO licence pack quickly.

What’s Included

Council-specific application form(s)

Fit & Proper Person declaration

Management arrangements statement

Amenity standards checklist

Compliance validation (Level 1 + Level 2)

Evidence checklist

Submission instructions

3-page watermarked preview before checkout

AI Validation

Room size requirements

Bathroom/kitchen ratio

Occupancy limits

Fire equipment presence

Contradictions detected

Missing data flagged

Delivery

Instant PDF download

~20–40 pages depending on council

PDF set includes multiple forms when required

2.2 HMO PREMIUM PACK — £199.99

Designed for landlords who want complete automation, including floor plans, fire safety, and enhanced AI QC.

Everything in Standard, plus:
🔥 Auto-Generated Floor Plan (PDF)

Vector-based diagram

Door/window positions

Room labels

Dimensions

Fire equipment markers

Council-approved layout style

🔥 Fire Safety Self-Assessment Pack

Fire risk scoring

Escape route diagram

Emergency lighting check

Fire door compliance report

Smoke/CO alarm mapping

Annual review template

🔥 Occupancy Matrix

Rooms

Tenants

Rent amounts

Amenity compliance checking

🔥 Evidence Bundle (ZIP)

Auto-compiled council-specific evidence

Correct naming conventions

🔥 Enhanced AI QC (Level 3)

Contradiction scans

Logical consistency

Fire vs floor plan validation

Amenity compliance scoring

Council rule matrix scoring

Delivery

Full application pack

Floor plan PDF

Fire safety pack PDF

Evidence bundle ZIP

Council-specific companion documents

Premium = full submission automation.

2.3 HMO PRO MEMBERSHIP — £9.99/mo (Optional Add-On)

This is now a lightweight ongoing service, not a core product.

Includes:

Unlimited tenancy agreement regeneration

Compliance reminders (90/30/7 days)

Licence expiry

Gas

EICR

Fire risk

Document vault

Tenant/room management

Compliance dashboard

First month £1 (upsell after pack purchase)

3. USER FLOW (2025 Funnel)
✔ Step 1 — User lands on a council SEO page

/hmo-licensing/manchester

✔ Step 2 — “Generate My HMO Pack”

Postcode input → council detection.

✔ Step 3 — 90s MQS wizard

Collects:

Property details

Rooms + dimensions

Bathrooms

Fire equipment

Occupants

Certificates

✔ Step 4 — AI QC (Level 1)

Live validation + success score.

✔ Step 5 — 3-page preview

Watermarked preview of council forms + compliance score.

✔ Step 6 — Choose Standard (£129.99) or Premium (£199.99)
✔ Step 7 — Stripe checkout

Instant pack generation.

✔ Step 8 — Thank-you page upsell

“HMO Pro Membership — £9.99/mo (first month £1)”

60–75% conversion expected.

4. TECHNICAL ARCHITECTURE
4.1 MQS Engine

Reuses eviction MQS framework.
Includes HMO-specific categories:

Room sizes

Fire equipment

Tenant count

Amenity standards

Heating

Fire doors

Alarm types

Electrical checks

Waste management

4.2 AI QC Engine (3 Levels)
Level 1 — Field Validation (Wizard)

Fundamental errors

Missing required data

Jurisdiction rules

Level 2 — Pre-Checkout Check (Preview)

Detect contradictions

Flag missing certificates

Validate ratios/sizes

Council rule mismatches

Outputs:
“81% compliant — 4 issues identified.”

Level 3 — Premium QC

Advanced checks including:

Fire map vs floor plan consistency

Amenity scoring

Electrical/fire certificate expiry alignment

Multi-floor compliance

Logical consistency scoring

Outputs:
“Meets all mandatory requirements for <Council> based on submitted data.”

(Non-legal, factual compliance.)

4.3 Council PDF Mapping Engine

361 councils supported

Some councils require 1 form

Some require up to 6 PDFs

Some require additional statements

Some are online portals only (generate upload-ready files)

Engine Logic:
postcode → council_code → licence_type → PDF mapping → field mapping → output bundle


PDFs stored under:
/public/official-hmo-forms/<council>
Mapped through pdf-lib templates.

4.4 Floor Plan Generator (Premium)

Inputs:

Rooms

Dimensions

Doors/windows

Fire equipment

Hallways

Floor count

Outputs:

PDF (final)

SVG (preview)

Engine:

Node-based vector engine using primitives

Grid snapping

Auto-labelling

Multi-floor layout

4.5 Fire Safety Generator (Premium)

Includes:

Fire risk scoring

Extinguisher points

Exit signage layout

Alarm/CO placements

Emergency lighting sheet

Yearly log template

4.6 Evidence Bundler (Premium)

Produces council-ready ZIP file containing:

Certificates

Photos

Required compliance documents

Council-specific attachments

Naming conventions auto-applied

5. WHAT EACH PACK PRODUCES
STANDARD (£129.99)

Application PDF(s)

Fit & Proper Person form

Amenity Checklist

Management Arrangements Policy

Evidence checklist

Submission notes

Preview

AI Validation (Level 1 & 2)

PREMIUM (£199.99)

Everything in Standard plus:

Floor plan PDF

Fire safety self-assessment pack

Occupancy matrix

Evidence bundle (ZIP)

Enhanced AI QC (Level 3)

Multi-floor support

Fire exit diagrams

Named file set for council portals

6. COMMERCIAL MODEL (UPDATED)
Product	Price	Type	Year-1 Revenue (expected)
Standard Pack	£129.99	Transactional	£350k–£600k
Premium Pack	£199.99	Transactional	£300k–£700k
Membership	£9.99/mo	Recurring	£180k–£300k
TOTAL YEAR 1			£1.0M – £1.6M
7. LAUNCH PLAN (7–14 Days)
Engineering:

 Pack generator (Standard + Premium)

 Floor plan engine

 Fire assessment module

 AI QC L1–L3

 Council PDF mapping

 Evidence bundler

 Upsell funnel

Content:

 SEO council pages (361)

 Pricing page

 Landing pages

 Preview examples

 Email sequences

Marketing:

 Launch to existing users

 FB landlord groups

 TikTok + YouTube walkthroughs

 £1k–£2k PPC

 Reddit + Property forums

8. SUCCESS METRICS
Metric	Target 30 Days	Target 90 Days	Target 12 Months
Pack Sales	500–700	1,200	6,000
AOV (Std+Prem)	£150–£175	£160–£180	£165–£185
Subs Added/mo	300–500	500–700	4,000–5,000
MRR	£3k–£5k	£9k–£14k	£45k
Year-1 Revenue	—	—	£1.0M–£1.6M