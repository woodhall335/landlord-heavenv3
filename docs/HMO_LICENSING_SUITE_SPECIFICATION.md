============================================================
🟦 FILE 1: HMO_LICENSING_SUITE_SPECIFICATION.md (Fully Updated)
============================================================
🏢 HMO LICENSING SUITE — COMPLETE SPECIFICATION (2025–2026 Edition)

Version: 4.0
Date: December 2025
Status: Complete & Engineering-Ready
Owner: Landlord Heaven
Product Tiering:

HMO Standard Pack — £169.99

HMO Premium Pack — £229.99

HMO Pro Membership (Add-On) — £14.99/mo (first month £1)

1. EXECUTIVE SUMMARY

The HMO Licensing Suite is the UK’s first fully automated, end-to-end HMO licence preparation system.
It produces council-ready submission packs, performs AI-driven compliance scoring, and—when upgraded—generates the full 2D floor plan and fire escape maps required by councils.

The suite combines:

Official council forms

Real-time multi-layer AI compliance checks

Fire safety scoring

Full council rule matrix

Evidence analysis + bundling

Auto-filled submissions

Premium-only 2D floor plan creation

Value Proposition

“Submit a council-ready HMO licence application in minutes — with expert-grade compliance checking and optional AI-generated floor plans.”

Target Market

All UK HMO landlords:

~389,000 licensed HMOs

~40,000 new/renewal applications yearly

tens of thousands more who need floor plans + fire maps

2. PRODUCT TIERS (FINAL 2025–26 MODEL)

This section outlines all inclusions with no shortcuts.

⭐ 2.1 HMO STANDARD PACK — £169.99
Purpose

A complete, council-ready HMO licence application bundle including all validation, scoring, and compliance checks, but without AI floor plan generation.

Included Features (Full Detail)
✔ 1. Multi-Layer Real-Time AI QC (Levels 1–3)

Level 1: Wizard Field Validation

Mandatory fields

Format checks

Certificate expiry

Tenancy details

Fire alarm type consistency

Level 2: Pre-Purchase Contradiction Scan

Cross-checks room sizes vs occupant count

Detects irreconcilable contradictions

Flags missing documents

Level 3: Global Document-Wide Consistency Engine

Aligns management details across all forms

Ensures all council-required schedules exist

Ensures occupancy is coherent across floors

Ensures certificates match stated equipment

Scores compliance level

✔ 2. Evidence Upload + AI Analysis

User may upload:

Gas safety certificate

EICR

PAT testing

Fire alarm log

Tenancy agreements

Utility bills

Management documents

Photos

AI extracts:

Expiry

Certificate type

Key dates

Addresses & names

Compliance metadata

✔ 3. Evidence ZIP Bundler (FULL version)

Included in BOTH tiers.

Produces:

Council-ready ZIP folder

Correct folder structure

File renaming to council conventions

Missing-evidence warnings

Summary sheet

✔ 4. Council Hard-Rule Matrix (ALL 361 councils)

Includes:

Mandatory/additional/selective logic

Amenity standards

Minimum bedroom sizes

Maximum occupancy

Facility requirements

Fire safety requirements

Specific council forms

Upload conventions

Extra declarations

All rules version-controlled in /config/hmo/councils/*.

✔ 5. Fire Safety Validation (NOT generation)

Checks smoke alarm locations

CO alarm requirements

Emergency lighting

Fire doors & self-closers

Extinguishers & blankets

Escape window identification

✔ 6. Fire Risk Scoring (Shared with Premium)

AI-generated score (0–100) + severity band:

Low

Medium

High

Includes:

Blockers for licensing

Recommended improvements

Missing equipment

Escape issues

Electrical safety notes

✔ 7. Full Floor Plan Validation (NO auto-generation)

Validates user-provided data:

Room sizes

Door positions

Window count

Egress compliance

Corridor lengths

Means of escape

If invalidities found:

Highlights in preview

Suggested fixes

✔ 8. Application Pass Score (Council-Specific)

Robust scoring engine with:

Mandatory rule checks

Recommended rule checks

Evidence completeness

Floor-level consistency

Output example:

“Your application meets all mandatory requirements for Manchester City Council. 3 recommended improvements identified.”

(Not legal advice — purely factual compliance analysis.)

✔ 9. Full Official PDF Pack Generation

Includes:

Council application form(s)

Fit & Proper Person form

Management arrangements

Amenity standards checklist

Occupancy schedule

Fire safety checklist

Evidence index

Naming-and-upload instructions

All documents are mapped from:

/public/official-hmo-forms/<council>/

✔ 10. Watermarked 3-Page Preview

Displayed pre-purchase.

⭐ 2.2 HMO PREMIUM PACK — £229.99

Everything in Standard PLUS:

🏠 1. AI-Generated 2D Floor Plan (PDF)

Full vector rendering engine:

Rooms auto-drawn from MQS inputs

Dimensions displayed

Doors and windows drawn

Beds, furniture optional

Fire extinguishers, alarms

Stairways

Multi-floor layouts

SVG preview + final PDF

Surveyor-quality format.

🔥 2. Fire Map Overlay (Auto-Generated)

Escape routes

Fire doors

Muster point

Alarm triggers

Extinguisher locations

Emergency lighting

Outputs:

PDF and SVG fire map layer

Council-compliant layout

📄 3. Auto-Generated Occupancy Matrix

Tenants per room

Rent per room

Communal space ratios

HMO classification logic

Amenity alignment report

🧠 4. Ask Heaven Premium Formatting Engine

Reformats long answers

Improves clarity for council review

Standardises tone

Fixes ambiguous language

(Not legal advice; purely factual formatting.)

⭐ 2.3 HMO PRO MEMBERSHIP — £14.99/mo

Add-on, not core.

Includes:

Unlimited tenancy agreement regeneration

Tenancy storage

90/30/7-day reminders (licence, gas, EICR, fire)

Compliance dashboard

Tenant/room management

Document vault

First month £1

3. USER FLOW (2025–2026 FUNNEL)

User lands on SEO council page

Clicks “Generate My HMO Pack”

Postcode → council detection

90-second MQS wizard

Real-time AI QC displayed

Watermarked preview

Pack selection (Standard or Premium)

Stripe checkout

Generation queue

Instant dashboard delivery

Premium upsell (if user bought Standard)

4. TECHNICAL ARCHITECTURE
4.1 MQS Wizard

Categories:

Property details

Rooms & dimensions

Tenancy/occupancy

Amenities

Fire equipment

Certificates

Management structures

Stored under:

/config/mqs/hmo/<jurisdiction>.yaml

4.2 AI QC Engine (L1–L3)

GPT-4o (heavy checks)

GPT-4o-mini (inline checks)

Outputs:

Scores

Issues

Recommended fixes

Council compliance mapping

4.3 Council PDF Mapping Engine

Logic:

postcode → council → licence type → required forms → field mapping → output bundle

4.4 Floor Plan Generator (Premium)

Node vector engine

Grid snapping

Multi-floor support

4.5 Fire Map Generator (Premium)

Overlay built on generated SVG.

4.6 Evidence Bundler (Both)

File renaming

Folder structure

Missing-items scan

5. COMMERCIAL MODEL (UPDATED)
Product	Price	Expected Year 1 Revenue
Standard Pack	£169.99	£400k–£650k
Premium Pack	£229.99	£350k–£700k
Membership	£14.99/mo	£180k–£300k
Total Year 1	—	£1.0M–£1.6M
6. LAUNCH PLAN (7–14 Days)

Engineering:

Floor plan generator

Fire map engine

AI QC L1–L3 final tuning

Council mapping QA

Content:

Council SEO templates

Pricing pages

Examples gallery

Marketing:

FB landlord groups

TikTok/YouTube demos

£1k PPC

Reddit

7. SUCCESS METRICS
Metric	30 Days	90 Days	12 Months
Packs Sold	400–600	1,100+	5,000–6,500
AOV	£190–£210	£200+	£210+
Subs Added	300–500	500–900	3,000–5,000
Year-1 Revenue	—	—	£1.0M–£1.6M
END OF HMO LICENSING SUITE SPECIFICATION