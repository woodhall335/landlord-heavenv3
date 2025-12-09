📄 premium-legal-workflows-spec.md

Landlord Heaven — Premium Legal Workflows Specification
Money Claims & Eviction Packs (England & Wales + Scotland)

Version: 1.0
Author: ChatGPT (System Blueprint)
Last updated: 09/12/2025

📌 Overview

This document formalises the premium product architecture for:

Money Claims (E&W + Scotland)

Eviction Packs (E&W + Scotland)

Both workflows share:

Section-based wizard UX

Structured Ask Heaven drafting (JSON)

Backend template-driven PDF generation

Evidence management

Court-form mapping

Pre-action + claim/court phases

Professional ZIP bundle output

All AI outputs follow Option A → Structured JSON, and all PDFs follow Option 2 → backend templates, with Option B ZIP bundling.

This specification represents the solicitor-grade automation engine for Landlord Heaven.

=============================================================
1. MONEY CLAIM WORKFLOW (PREMIUM)
=============================================================
1.1 Workflow Phases
Phase 1 — Pre-Action Protocol Pack (Always Included)

Even when PAP is already done by the user.

Ask Heaven drafts:

Letter Before Action (LBA)

PAP Information Sheet

PAP Reply Form

PAP Financial Statement

Rent Schedule Annex

Evidence Summary Annex

PAP explanation & instructions

Compliance timeline

Phase 2 — Claim Pack

Ask Heaven drafts:

Full Particulars of Claim

Interest narrative

Tenancy summary statement

Case timeline

Evidence index

Evidence narratives

Failure-to-engage narrative (optional)

Backend generates:

N1 Claim Form (E&W)

Form 3 (Scotland)

Schedule of Loss

Statement of Truth

Phase 3 — Post-Issue Pack

Included by default:

What Happens Next

How to File (MCOL, paper court, tribunal)

Enforcement options

Ask Heaven case summary

Ask Heaven risk report

1.2 Money Claim Wizard Sections

The money claim wizard groups questions into:

Claimant Details

Defendant Details

Property & Tenancy

Rent, Arrears & Claim Breakdown

Pre-Action Compliance (PAP)

Evidence

Enforcement Preferences

Review & Ask Heaven Analysis

1.3 Ask Heaven — JSON Drafting Schemas (Money Claim)
Letter Before Action
{
  "lba": {
    "intro": "",
    "tenancy_history": "",
    "arrears_summary": "",
    "breach_description": "",
    "amount_due": "",
    "response_deadline": "",
    "payment_instructions": "",
    "consequences": "",
    "annexes": {
      "rent_schedule": true,
      "evidence_list": true
    }
  }
}

Particulars of Claim
{
  "particulars_of_claim": {
    "tenancy_background": "",
    "legal_basis": "",
    "rent_obligation": "",
    "arrears_calculation": "",
    "damage_items": "",
    "other_charges": "",
    "interest_claim": "",
    "pre_action_summary": "",
    "remedy_sought": ""
  }
}

Evidence Index
{
  "evidence_index": [
    { "tab": 1, "title": "Tenancy Agreement", "description": "" },
    { "tab": 2, "title": "Rent Schedule", "description": "" }
  ]
}

1.4 Money Claim ZIP Bundle Layout
Money-Claim-Premium/
│
├── Pre-Action-Protocol/
│   ├── Letter-Before-Action.pdf
│   ├── PAP-Information.pdf
│   ├── PAP-Reply-Form.pdf
│   ├── PAP-Financial-Statement.pdf
│   ├── Rent-Schedule.pdf
│   ├── Evidence-Summary.pdf
│   └── Service-Instructions.txt
│
├── Claim-Pack/
│   ├── N1-Claim-Form.pdf
│   ├── Particulars-of-Claim.pdf
│   ├── Schedule-of-Loss.pdf
│   ├── Evidence-Index.pdf
│   ├── Evidence-Bundle.pdf
│   └── Statement-of-Truth.pdf
│
└── Post-Issue/
    ├── What-Happens-Next.pdf
    ├── Enforcement-Guide.pdf
    ├── AskHeaven-Case-Summary.pdf
    └── Risk-Report.pdf

=============================================================
2. EVICTION WORKFLOW (PREMIUM)
=============================================================
2.1 Eviction Workflow Phases
⭐ Phase 1 — Pre-Eviction Stage

Ask Heaven drafts:

Tenancy Audit Report

Reports on:

Deposit protection

Prescribed information

EPC / Gas / EICR

Licensing compliance

Retaliatory eviction risk

Disrepair risk

Section 21 eligibility

Section 8 ground availability

Scotland ground availability

Pre-Eviction Letter

A solicitor-style warning letter.

Compliance Flags (JSON)
{
  "compliance": {
    "deposit_risk": "",
    "licensing_issue": false,
    "retaliatory_eviction_risk": "",
    "disrepair_risk": "",
    "s21_valid": true,
    "s8_grounds": ["8", "10"]
  }
}

⭐ Phase 2 — Notice Pack
England & Wales:

Section 21 (Form 6A)

Section 8 Notice (all grounds)

Ask Heaven ground narratives

Expiry date calculations

Scotland:

Notice to Leave

AT6

Ground justifications

⭐ Phase 3 — Court Pack
England & Wales:

N5

N119

N5B (accelerated)

Ask Heaven drafts:

Witness Statement

Case timeline

Ground justification narrative

Disrepair rebuttal

Evidence index

Scotland:

Tribunal Form (F-COS / E-COS)

Supporting submission

Written statement

2.2 Eviction Wizard Sections

Same UX grouping:

Landlord Details

Tenant Details

Tenancy Compliance Audit

Rent Arrears & Conduct

Notice Selection (Ask Heaven recommended)

Evidence Uploads

Court Preparation

Review & Ask Heaven Analysis

2.3 Ask Heaven — JSON Drafting Schemas (Eviction)
Tenancy Audit
{
  "tenancy_audit": {
    "deposit_protection": "",
    "licensing": "",
    "gas_safety": "",
    "electrical_safety": "",
    "epc": "",
    "h2r": "",
    "retaliatory_eviction": "",
    "disrepair_risk": "",
    "s21_valid": true,
    "s8_grounds": ["8", "10", "11"]
  }
}

Section 21 Draft
{
  "section21": {
    "compliance_summary": "",
    "expiry_date": "",
    "narrative": ""
  }
}

Section 8 Draft
{
  "section8": {
    "grounds": [
      { "ground_id": 8, "narrative": "", "evidence": [] }
    ]
  }
}

Notice to Leave (Scotland)
{
  "notice_to_leave": {
    "ground": "",
    "narrative": "",
    "timeline": ""
  }
}

Witness Statement
{
  "witness_statement": {
    "introduction": "",
    "tenancy_history": "",
    "rent_arrears": "",
    "conduct_issues": "",
    "grounds_summary": "",
    "timeline": "",
    "evidence_references": ""
  }
}

2.4 Eviction ZIP Bundle Layout
Eviction-Premium-Pack/
│
├── Pre-Eviction/
│   ├── Tenancy-Audit.pdf
│   ├── Pre-Eviction-Letter.pdf
│   ├── Compliance-Report.pdf
│   └── Risk-Assessment.pdf
│
├── Notice-Pack/
│   ├── Section-21.pdf
│   ├── Section-8.pdf
│   ├── Notice-to-Leave.pdf
│   └── AT6.pdf
│
├── Court-Pack/
│   ├── N5.pdf
│   ├── N119.pdf
│   ├── N5B.pdf
│   ├── Witness-Statement.pdf
│   ├── Evidence-Bundle.pdf
│   ├── Evidence-Index.pdf
│   └── Statement-of-Truth.pdf
│
└── Guidance/
    ├── Court-Filing-Instructions.pdf
    ├── Enforcement-Options.pdf
    ├── AskHeaven-Case-Summary.pdf
    └── AskHeaven-Risk-Report.pdf

=============================================================
3. Shared Ask Heaven Modes (Money Claim + Eviction)
=============================================================

Ask Heaven now supports:

1. Section Assistance Mode

Explains fields, checks missing items.

2. Drafting Mode

Generates solicitor-grade structured JSON for every document.

3. Consistency Check Mode

Detects contradictions, missing compliance, risk issues.

4. Evidence Analysis Mode

Suggests evidence and summarises uploads.

5. Final Case Review Mode

Provides warnings, readiness score, next steps.

=============================================================
4. PDF Template Requirements (Shared)
=============================================================

Backend must provide templates for:

Money Claims

LBA

PAP sheets

PoC

N1

Form 3 Scotland

Schedule of Loss

Evidence Index

Evictions

Section 21 Form 6A

Section 8

Notice to Leave

AT6

N5 / N119 / N5B

Tenancy Audit

Witness Statement

Compliance Report

=============================================================
5. Pricing Model (Recommended)
=============================================================
Money Claim Premium: £229

Includes full PAP pack, claim pack, and Ask Heaven drafting.

Eviction Premium: £249.99

Includes full tenancy audit, notice pack, court pack, and Ask Heaven drafting.

Both products now exceed typical solicitor deliverables.

END OF DOCUMENT