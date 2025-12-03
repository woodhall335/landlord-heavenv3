# V1 Completion Checklist (Non-HMO, Non-NI Eviction/Money-Claim)

**Scope:**  
This checklist tracks everything required to ship **V1 (non-HMO)** of Landlord Heaven:

- ✅ England & Wales: evictions, money claims, tenancy agreements  
- ✅ Scotland: evictions, money claims, tenancy agreements  
- ✅ Northern Ireland: *tenancy agreements only*  
- ❌ Northern Ireland evictions: **explicitly v2+ / blocked**  
- ❌ Northern Ireland money-claims: **explicitly v2+ / blocked**  
- ❌ HMO Licensing Suite: **explicitly v2+ / blocked**

**Canonical references:**

- `docs/MASTER_BLUEPRINT.md`
- `docs/supabase_schema.MD` ← **canonical schema snapshot**
- `docs/DB_SCHEMA_ALIGNMENT.md`
- `docs/ASK_HEAVEN_SYSTEM_PROMPT.md`
- `docs/CASE_INTEL_SPEC.md`
- `docs/BUNDLE_BUILDER_SPEC.md`
- `docs/CONVERSATIONAL_WIZARD_SPECIFICATION.md`
- `docs/FRONTEND_INTEGRATION_GUIDE.md`
- `docs/LEGAL_CHANGE_PROTOCOL.md`
- `docs/EVICTION_AUDIT_IMPLEMENTATION_SUMMARY.md`
- `docs/MQS_INTEGRATION_COMPLETE.md`
- `docs/MQS_AUDIT_REPORT.md`
- `docs/NI_EVICTION_STATUS.md`

> **Rule for Claude:**  
> For each item, either:
> - Implement/fix it and change `[ ]` → `[x]`, or  
> - If it’s *already* fully done in the codebase, just change `[ ]` → `[x]` and briefly note “verified”.  
> Use `docs/supabase_schema.MD` and the other specs as the source of truth.

---

## 0. Scope & Guardrails

- [ ] Confirm the following are **NOT** implemented for V1 (and are clearly blocked in UX/API):
  - [ ] HMO licensing flows (Standard/Premium packs, fire risk scoring, council-specific HMO logic)
  - [ ] Northern Ireland eviction workflows
  - [ ] Northern Ireland money-claim workflows
- [ ] Ensure blocking is:
  - [ ] Implemented in `/api/wizard/start`
  - [ ] Reflected in error messages (roadmap wording, “consult local solicitor”)
  - [ ] Documented in `docs/NI_EVICTION_STATUS.md`
  - [ ] Mentioned in `docs/MASTER_BLUEPRINT.md` as **v2+ roadmap**, not V1 feature

---

## 1. Database & Types (Supabase-Aligned)

### 1.1 Schema Snapshot

- [x] `docs/supabase_schema.MD` exists with a current `psql` schema dump  
- [ ] Verify `docs/DATABASE_SCHEMA.md` is either:
  - [ ] Updated to match `supabase_schema.MD`, **OR**
  - [ ] Clearly marked as “historical, see supabase_schema.MD for canonical schema”

### 1.2 TypeScript Type Alignment (Core Tables)

> Canonical: `docs/supabase_schema.MD`, `docs/DB_SCHEMA_ALIGNMENT.md`

Core tables (at minimum):

- `cases`
- `case_facts`
- `documents`
- `conversations` (if used in-app)
- (Optional for V1 core: `orders` / `payments` / `ai_usage`)

Tasks:

- [ ] Create strict row/insert/update types for core tables in **one place**, e.g.:
  - `src/lib/supabase/database-types.ts`
- [ ] For each table above, ensure strict types match `supabase_schema.MD`:
  - [ ] column names
  - [ ] types (text, jsonb, boolean, numeric, timestamptz, arrays)
  - [ ] nullability
  - [ ] enum-like fields (e.g. case status, jurisdiction, product)
- [ ] Update `src/lib/supabase/types.ts` to:
  - [ ] Re-export strict types (`CaseRow`, `CaseFactsRow`, `DocumentRow`, `ConversationRow`, etc.)
  - [ ] Keep `Database` interface in sync with `supabase_schema.MD`
  - [ ] (Optional) keep a permissive `GenericRow = any` for legacy code but mark as deprecated
- [ ] Update any obvious incorrect usages:
  - [ ] `row as any` patterns for core tables replaced with typed rows where low-risk
  - [ ] Obvious mismatches (e.g. treating jsonb as `string`) fixed

Documentation:

- [ ] Ensure `docs/DB_SCHEMA_ALIGNMENT.md` accurately describes the **current** state:
  - [ ] If strict types are actually implemented, reflect that.
  - [ ] If doc claims “✅ complete” but code is not aligned, update the doc and/or code so they match.

---

## 2. MQS (Master Question Sets)

> Canonical: `config/mqs/*`, `docs/MQS_AUDIT_REPORT.md`, `docs/MQS_INTEGRATION_COMPLETE.md`

### 2.1 MQS Inventory & Metadata

- [ ] Confirm **9 MQS files** exist:
  - [ ] `notice_only/england-wales.yaml`
  - [ ] `notice_only/scotland.yaml`
  - [ ] `complete_pack/england-wales.yaml`
  - [ ] `complete_pack/scotland.yaml`
  - [ ] `money_claim/england-wales.yaml`
  - [ ] `money_claim/scotland.yaml`
  - [ ] `tenancy_agreement/england-wales.yaml`
  - [ ] `tenancy_agreement/scotland.yaml`
  - [ ] `tenancy_agreement/northern-ireland.yaml`
- [ ] Add/verify `__meta` block at top of each MQS:
  ```yaml
  __meta:
    version: "X.Y.Z"
    effective_from: "YYYY-MM-DD"
    last_updated: "2025-12-03"
    legal_review_date: "YYYY-MM-DD"
    jurisdiction: "england-wales" | "scotland" | "northern-ireland"
    product: "notice_only" | "complete_pack" | "money_claim" | "tenancy_agreement"
 Re-run MQS audit if needed and update docs/MQS_AUDIT_REPORT.md to reflect current versions (v2.x where applicable).

2.2 Scotland Eviction MQS Expansion
 Upgrade notice_only/scotland.yaml and complete_pack/scotland.yaml so:

 Grounds are selected explicitly (PRT grounds)

 Ground-specific structured questions exist for at least:

 Ground 1 – Rent arrears

 Ground 2 – Breach of tenancy

 Ground 3 – Antisocial behaviour

 Ground 4 – Landlord intends to occupy

 Ground 5 – Landlord intends to sell

 Ground 6 – Substantial refurbishment/works

 Each such ground has:

 Essential structured facts (dates, durations, arrears, behaviour details, etc.)

 A free-text “tribunal narrative” field

 Proper depends_on logic so they display only when relevant

 maps_to paths that align with Scotland decision engine and Form E

 Ensure config/jurisdictions/uk/scotland/rules/decision_engine.yaml consumes these new fields:

 No references to now-nonexistent fields

 Ground strength / scoring uses structured facts, not just generic text

 Update docs/SCOTLAND_MQS_EXPANSION.md (create if needed) describing:

 New ground-specific fields

 Mapping to decision engine and Form E

2.3 Money Claim MQS Verification
 Confirm money_claim/england-wales.yaml and money_claim/scotland.yaml:

 Capture all the fields required for:

 N1 (E&W)

 Form 3A (Scotland)

 Have clear sectioning for:

 Tenancy & parties

 Rent history & arrears

 Damages (if any)

 Interest (rules & preferences)

 Evidence

 Court routing (county court / sheriff court)

 maps_to values align with CaseFacts required by forms & pack generators

 If any missing fields are found during money-claim work, update MQS accordingly and document in MONEY_CLAIM_SPEC.md.

2.4 Tenancy Agreement MQS (All Jurisdictions)
 Re-verify legal compliance tweaks:

 E&W has Right to Rent questions (and only E&W)

 Scotland and NI have no Right to Rent questions

 NI uses “Domestic rates” not “Council tax”

 NI has ni_notice_period_days / NI-specific notice logic

 Check all clauses required by AST/PRT/NI templates are mapped:

 Guarantor details (Premium)

 Late interest/fees

 Pets, smoking, HMO-related questions

 Tag clearly any HMO-related questions in tenancy MQS as:

 Commented or annotated # HMO – future integration (v2+)

3. Evictions – England & Wales
Canonical: MASTER_BLUEPRINT.md §3.1, EVICTION_AUDIT_IMPLEMENTATION_SUMMARY.md, BUNDLE_BUILDER_SPEC.md

3.1 Eviction MQS & DE Coverage
 Confirm:

 All Schedule 2 grounds are represented in MQS (where promised)

 decision_engine.yaml for E&W handles:

 Ground 8 (mandatory arrears)

 Grounds 10 & 11 (discretionary arrears)

 Behaviour/antisocial grounds

 Disrepair/counterclaim risks

 Deposit protection / gas safety / How to Rent checks

 Ensure MQS → CaseFacts → decision engine routes are consistent.

3.2 Forms & Bundles
 Verify N5, N5B, N119 fillers in src/lib/documents/official-forms-filler.ts:

 All required fields mapped

 No obvious placeholders left

 E2E bundle:

 generateCourtBundle includes:

 Correct notice

 Proof of service

 Rent schedule if relevant

 N5/N5B/N119 as appropriate

 Case-intel narrative where expected

3.3 End-to-End Testing / QA
 Add/update tests to cover:

 S8 arrears-only case E2E

 S21 accelerated case E2E

 Manual QA:

 Run at least 2–3 realistic landlord scenarios and inspect final PDF bundle.

4. Evictions – Scotland
Canonical: Scotland sections in MASTER_BLUEPRINT.md, SCOTLAND_MQS_EXPANSION.md

4.1 MQS + Decision Engine
 After MQS expansion (Section 2.2), confirm:

 All critical PRT grounds used in blueprint are supported

 Decision engine rules use the new structured fields and produce:

 Case strength scores

 Ground-specific warnings

 Pre-action compliance flags (especially arrears)

4.2 Form E & Tribunal Bundle
 Ensure Form E filler:

 Uses structured ground fields

 Correctly includes pre-action steps

 Includes rent arrears summary references

 Tribunal bundle:

 Generates Form E + supporting documents as described in blueprint

 Add tests:

 At least one Form E test case covering a common ground (e.g. arrears).

5. Money Claims – England & Wales (N1)
Canonical: MASTER_BLUEPRINT.md §3.3, BUNDLE_BUILDER_SPEC.md, CASE_INTEL_SPEC.md

Note: A lot of money-claim functionality is already implemented (MQS, pack generator, official forms). This section is about verification & finishing touches.

 Verify N1 filler (official-forms-filler.ts):

 Parties, claim value, rent arrears, interest, court fee fields mapped

 Arrears schedule:

 Confirm generator produces:

 Month-by-month breakdown

 Running total

 Used correctly in pack and (if promised) attached to N1

 Interest:

 Confirm Section 69 CCA 8% logic and daily rate

 Correctly written into:

 N1 fields

 Particulars of Claim wording

 Particulars of Claim:

 Generator exists and:

 Uses MQS + CaseFacts + case-intel

 Includes arrears narrative, interest wording, what the court should order

 Bundle:

 Money-claim bundle for E&W includes:

 N1

 POC

 Arrears schedule

 Evidence index/checklist

 Add tests or verify existing tests:

 At least one test filling N1 and asserting key fields.

6. Money Claims – Scotland (Form 3A / Simple Procedure)
Canonical: Scotland money-claim sections in MASTER_BLUEPRINT.md, BUNDLE_BUILDER_SPEC.md

 Verify Form 3A filler:

 Parties, sheriff court selection, claim value, arrears summary, narrative

 Based on MQS fields and CaseFacts

 Bundle:

 Scotland money-claim bundle includes:

 Form 3A

 Arrears schedule equivalent

 Evidence index/schedule

 Add tests:

 At least one test generating Form 3A and asserting key fields are correct.

7. Tenancy Agreements – AST / PRT / NI
Canonical: MASTER_BLUEPRINT.md §3.4, tenancy templates, Ask Heaven prompt

 Verify:

 AST Standard/Premium flows (E&W) are fully wired from product page → wizard → doc generator

 PRT (Scotland) flow works similarly

 NI Private Tenancy is generated with NI-specific clauses

 Confirm tests:

 AST Standard & Premium document tests pass

 PRT and NI tenancy mapping tests pass

 (Optional for V1) Tidy Ask Heaven clause refinement:

 Ask Heaven has enough context to comment on key clauses.

8. Northern Ireland – Gating (Eviction & Money Claim)
Canonical: docs/NI_EVICTION_STATUS.md

 In /api/wizard/start:

 If jurisdiction = northern-ireland and caseType ≠ tenancy_agreement:

 Return clear 400 error

 Error mentions both “eviction and money claim workflows”

 Supported matrix in response:

 Shows northern-ireland: ['tenancy_agreement'] only

 Shows all four products for E&W and Scotland

 NI status documented:

 NI_EVICTION_STATUS.md explains roadmap (e.g. Q2 2026)

 MASTER_BLUEPRINT marks NI eviction & money-claim as future phase, not current v1.

9. Ask Heaven / AI Integration
Canonical: ASK_HEAVEN_SYSTEM_PROMPT.md, FRONTEND_INTEGRATION_GUIDE.md, CASE_INTEL_SPEC.md

 Ensure:

 /api/wizard/analyze passes:

 jurisdiction

 decision-engine outputs

 case-intel outputs

 AskHeavenPanel is wired to show:

 Context-aware suggestions

 Warnings about missing evidence / issues

 Confirm prompt includes:

 Decision engine context section

 Jurisdiction-specific guidance

 Verify AskHeavenPanel appears:

 In wizard flow

 On review page (where promised)

10. Decision Engine & Case Intel
Canonical: CASE_INTEL_SPEC.md, LEGAL_CHANGE_PROTOCOL.md, jurisdiction rule YAMLs

 Decision engine:

 E&W rules implemented for evictions & money-claims

 Scotland rules implemented for evictions & money-claims

 NI rules intentionally absent / blocked

 Case-intel:

 Scoring, contradictions, evidence completeness implemented

 Outputs consumed by:

 Bundles

 Forms (where relevant)

 Ask Heaven

 Law monitor:

 Law profile metadata present in rules YAMLs

 Law monitor stub present (ok if manual for V1)

11. Bundles & Document Engine
Canonical: BUNDLE_BUILDER_SPEC.md, template files, /public/official-forms/

 Confirm official forms exist and are current:

 N5, N5B, N119, N1, Form 6A, Form E, Form 3A, etc.

 Bundle builder:

 Eviction court bundle (E&W)

 Tribunal bundle (Scotland)

 Money-claim bundles (E&W + Scotland)

 Templates:

 All .hbs templates referenced by doc generators exist

12. Wizard UX
Canonical: CONVERSATIONAL_WIZARD_SPECIFICATION.md, FRONTEND_INTEGRATION_GUIDE.md

 Wizard flow:

 Uses MQS for all products in scope

 Shows checkpoint banners (blocking issues, warnings, completeness)

 Can call /api/wizard/checkpoint mid-flow

 Review page:

 Shows:

 Case strength score

 Key issues/warnings

 Key documents available

 Provides a way to trigger bundle/doc generation

13. Dashboard & Evidence Vault
Canonical: MASTER_BLUEPRINT.md §10 (dashboard), future DASHBOARD_SPEC.md

 Dashboard MVP:

 /dashboard/cases lists user’s cases

 /dashboard/documents lists generated documents/bundles

 Each document row has a download link

 Optional: “Regenerate” button where safe

 Evidence:

 Evidence upload works

 Evidence is visible in a basic UI (even if simple list)

 HMO dashboard sections:

 Either hidden for V1 or clearly labelled as “Coming soon”

14. Testing & QA
 Unit tests pass (npm test / equivalent)

 Integration tests for:

 E&W eviction wizard → pack

 Scotland eviction wizard → pack

 E&W money-claim wizard → pack

 Scotland money-claim wizard → pack

 AST/PRT/NI tenancy flows

 At least a minimal E2E smoke test for:

 Eviction (E&W)

 Eviction (Scotland)

 Money-claim (E&W)

 Tenancy (E&W)

15. Documentation Sync
 MASTER_BLUEPRINT.md:

 Updated to clarify:

 NI eviction & money-claim are future roadmap

 HMO suite is future roadmap

 API_ROUTES.md:

 Includes:

 /api/wizard/checkpoint

 /api/wizard/analyze

 Any law-profile related endpoints

 DATABASE_SCHEMA.md:

 Updated or marked as non-canonical (see supabase_schema.MD)

 MONEY_CLAIM_SPEC.md:

 Exists and documents:

 N1 mapping

 Form 3A mapping

 Interest rules

 Bundles

 TENANCY_AGREEMENT_SPEC.md:

 Exists and documents:

 AST/PRT/NI template structure

 Clause mapping

 Ask Heaven clause integration

 (Optional, but ideal) DASHBOARD_SPEC.md:

 Exists and describes MVP dashboard modules.

End of Checklist

Claude: Work through this list item by item. After each chunk of work, update the checkboxes and briefly document what changed. Aim to keep code, tests, and docs in sync with MASTER_BLUEPRINT.md and supabase_schema.MD at all times.