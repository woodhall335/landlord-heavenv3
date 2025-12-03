# 🚦 Landlord Heaven – V1 Completion Checklist (Non-HMO, Non-NI Evictions/Money Claims)

**Scope:**  
This checklist is for **Claude Code** to complete and verify V1 of Landlord Heaven, **excluding**:

- HMO Licensing Suite (see `HMO_LICENSING_SUITE_SPECIFICATION.md`)  
- Northern Ireland **eviction** workflows  
- Northern Ireland **money claim** workflows  

Those are **explicit v2+/future** items. Everything else below is **in-scope for V1**.

---

## 0. Ground Rules for This Checklist

- ✅ **Source of truth for product/tech:** `MASTER_BLUEPRINT.md`
- ✅ **Source of truth for MQS state:** `MQS_AUDIT_REPORT.md`
- ✅ **Source of truth for DB schema:** `supabase_schema.MD` (NOT `DATABASE_SCHEMA.md`)
- ✅ **Source of truth for AI/Case Intel/Bundle Builder/Legal Change:**  
  - `ASK_HEAVEN_SYSTEM_PROMPT.md`  
  - `CASE_INTEL_SPEC.md`  
  - `BUNDLE_BUILDER_SPEC.md`  
  - `LEGAL_CHANGE_PROTOCOL.md`  
  - `adr-001-wizardfacts-casefacts.md`
- ✅ **Source of truth for Wizard UX / Frontend wiring:**  
  - `CONVERSATIONAL_WIZARD_SPECIFICATION.md`  
  - `FRONTEND_INTEGRATION_GUIDE.md`  
  - `MQS_INTEGRATION_COMPLETE.md`  
  - `EVICTION_AUDIT_IMPLEMENTATION_SUMMARY.md`

**Conventions**

- `[x]` = Done / already implemented and verified  
- `[~]` = Implemented but needs verification / polish / partial  
- `[ ]` = Not done yet / TODO  
- `//` comments tell you where to look and what to do

---

## 1. Documentation & Schema Alignment (Meta Layer)

These ensure all code work stays aligned with the docs and DB.

### 1.1 Canonical Docs Hook-Up

- [x] Confirm `MASTER_BLUEPRINT.md` is v10+ and in `/docs`
- [x] Confirm all key specs exist and are discoverable by tools:
  - [x] `ASK_HEAVEN_SYSTEM_PROMPT.md`
  - [x] `CASE_INTEL_SPEC.md`
  - [x] `BUNDLE_BUILDER_SPEC.md`
  - [x] `LEGAL_CHANGE_PROTOCOL.md`
  - [x] `MQS_INTEGRATION_COMPLETE.md`
  - [x] `EVICTION_AUDIT_IMPLEMENTATION_SUMMARY.md`
  - [x] `CONVERSATIONAL_WIZARD_SPECIFICATION.md`
  - [x] `FRONTEND_INTEGRATION_GUIDE.md`
  - [x] `adr-001-wizardfacts-casefacts.md`
  - [x] `NI_EVICTION_STATUS.md`
- [ ] Add this file as `docs/V1_COMPLETION_CHECKLIST.md` and commit

### 1.2 Database Schema Alignment (supabase_schema.MD)

- [x] `supabase_schema.MD` exists and is the **latest** schema export
- [ ] Do **not** rely on `DATABASE_SCHEMA.md` for schema; treat it as historical
- [ ] For each of the following tables in `supabase_schema.MD`, verify there is matching TS type + usage:

  - [ ] `cases`
  - [ ] `wizard_facts` (if separate from `case_facts`)
  - [ ] `case_facts` / `case_fact_snapshots` (naming may vary)
  - [ ] `documents` / `generated_documents`
  - [ ] `evidence` / `evidence_items`
  - [ ] `law_snapshots` / `law_profile` related tables
  - [ ] `users` / `profiles`
  - [ ] Any join tables used by decision engine or case-intel

- [ ] For each table:  
  - [ ] Compare columns + types with TS types in `src/types/` and `src/lib/supabase/`  
  - [ ] Fix any type mismatches (nullability, enums, JSON fields)  
  - [ ] Ensure Supabase Row/Insert/Update types are generated/hand-written correctly  

- [ ] Add a short doc section in `supabase_schema.MD` (or new `DB_NOTES.md`) that explains:
  - [ ] Which tables are core to wizard flows  
  - [ ] Which tables are used for law snapshots  
  - [ ] Which tables are used for evidence vault  

---

## 2. MQS Layer (All Products, All In-Scope Jurisdictions)

Reference: `MQS_AUDIT_REPORT.md`, `MQS_INTEGRATION_COMPLETE.md`, `MASTER_BLUEPRINT.md`

### 2.1 MQS Files – Metadata & Consistency

For all **9 MQS files** (notice_only, complete_pack, money_claim, tenancy_agreement × E&W/Scotland/NI):

- [ ] Add `__meta` block at the top of each MQS YAML:
  - [ ] `version` (e.g. `2.0.1`)
  - [ ] `effective_from`
  - [ ] `last_updated`
  - [ ] `legal_review_date`
  - [ ] `jurisdiction`
  - [ ] `product`
- [ ] Ensure question IDs follow consistent naming (e.g. `tenancy.basic_details`, `eviction.notice_type`, etc.)
- [ ] Ensure `depends_on` / `dependsOn` usage is consistent and supported by `mqs-loader.ts`
- [ ] Ensure `maps_to` fields reference valid CaseFacts paths

### 2.2 Scotland Eviction MQS Expansion

Files:

- `config/mqs/notice_only/scotland.yaml`
- `config/mqs/complete_pack/scotland.yaml`

Tasks:

- [ ] Add **ground-by-ground detail** questions for PRT grounds (1–4 and any others used):
  - [ ] For each ground, ensure:
    - [ ] A boolean or selection field indicating if ground is used
    - [ ] A text/structured field for detail (facts, dates, evidence)
    - [ ] Mapping to appropriate CaseFacts path
- [ ] Add all **Form E** required fields:
  - [ ] Applicant details (landlord)
  - [ ] Respondent details (tenant)
  - [ ] Property details
  - [ ] Notice details
  - [ ] Rent arrears schedule references
  - [ ] Evidence references
- [ ] Align question flow with blueprint Scotland section:
  - [ ] Pre-action steps
  - [ ] Arrears documentation
  - [ ] Tribunal selection / sheriffdom (if required here or in money claims)

### 2.3 Money Claims MQS (Verification)

Files (already COMPLETE per `MQS_AUDIT_REPORT.md`, but need **verification**):

- `config/mqs/money_claim/england-wales.yaml`
- `config/mqs/money_claim/scotland.yaml`

Tasks:

- [~] Confirm question coverage vs blueprint:
  - [x] Tenancy basics
  - [x] Arrears detail
  - [x] Damages
  - [x] Interest (Section 69 CCA, Scottish equivalent)
  - [x] Court route selection
  - [x] Evidence listing
  - [~] Particulars of Claim / narrative sections
- [ ] Ensure all N1 (E&W) and Form 3A (Scotland) fields have mapping questions:
  - [ ] No required field of N1/Form 3A missing a corresponding question
  - [ ] No question that maps to nowhere

### 2.4 Tenancy Agreement MQS (All Jurisdictions)

Files:

- `config/mqs/tenancy_agreement/england-wales.yaml`
- `config/mqs/tenancy_agreement/scotland.yaml`
- `config/mqs/tenancy_agreement/northern-ireland.yaml`

Status: COMPLETE per MQS audit; tasks:

- [ ] Re-verify legal fixes:
  - [ ] E&W Right to Rent questions present (and only there)
  - [ ] NI file does **not** contain Right to Rent fields
  - [ ] NI file has domestic rates and NI-specific notice period logic
- [ ] Ensure all questions required by AST/PRT/NI templates exist and are mapped
- [ ] Tag any HMO-specific tenancy questions clearly as `// HMO – future integration`  
  (We **keep** them if already there, but treat full HMO suite as v2+)

---

## 3. Evictions – England & Wales

Reference: `MASTER_BLUEPRINT.md` §3.1–3.2, `EVICTION_AUDIT_IMPLEMENTATION_SUMMARY.md`, `CASE_INTEL_SPEC.md`, `BUNDLE_BUILDER_SPEC.md`

### 3.1 MQS & Decision Engine

- [x] MQS files for `notice_only` and `complete_pack` (E&W) are comprehensive
- [x] Decision engine rules for Section 8/21 exist:
  - [x] Ground 8/10/11/14 logic
  - [x] Deposit protection checks
  - [x] Prescribed information / notice validity checks
- [ ] Add/verify **ground coverage** and error messages:
  - [ ] Confirm all Schedule 2 grounds are represented
  - [ ] For each ground, verify:
    - [ ] Fact fields exist
    - [ ] Decision engine uses them
    - [ ] Ask Heaven sees them in context

### 3.2 PDFs & Bundle Builder

- [ ] Verify **N5**, **N5B**, **N119** PDFs are correctly filled:
  - [ ] Cross-check each field with CaseFacts mapping
  - [ ] Ensure arrears schedule references match money-claim/eviction data
- [ ] Ensure bundle builder creates:
  - [ ] Cover sheet with case summary
  - [ ] Completed forms (N5/N5B/N119)
  - [ ] Notice copy
  - [ ] Rent schedule / evidence index
  - [ ] Case-intel narrative (timeline + score summary)
- [ ] Add tests:
  - [ ] Snapshot tests for filled PDFs (or key field assertions)
  - [ ] Bundle structure tests (correct documents included)

### 3.3 Wizard & Review Flow

- [ ] End-to-end E&W eviction test path:
  - [ ] `/wizard/start` with `notice_only` and `complete_pack`
  - [ ] `next-question` cycles correctly through MQS
  - [ ] `checkpoint` returns decision engine results (blocking issues, warnings)
  - [ ] `analyze` returns full case-intel/bundle recommendations
  - [ ] Review page shows:
    - [ ] Case strength
    - [ ] Key risks
    - [ ] Missing evidence
- [ ] Case strength widget:
  - [ ] Shown in **wizard** as user answers
  - [ ] Shown again on **review** page
  - [ ] Uses `CASE_INTEL_SPEC.md` scoring rules

---

## 4. Evictions – Scotland

Reference: `MASTER_BLUEPRINT.md` §3.1 (Scotland), `EVICTION_AUDIT_IMPLEMENTATION_SUMMARY.md`, `BUNDLE_BUILDER_SPEC.md`

### 4.1 MQS & Decision Engine

- [~] MQS exists for `notice_only` and `complete_pack` (Scotland) – partial
- [x] Decision engine rules for PRT grounds and pre-action steps exist
- [ ] After MQS expansion (Section 2.2), verify:
  - [ ] For each ground used, decision engine properly:
    - [ ] Assesses strength
    - [ ] Generates warnings if evidence is weak
    - [ ] Provides text reasons
- [ ] Ensure pre-action compliance logic uses new MQS fields correctly

### 4.2 Tribunal Bundle & Form E

- [ ] Validate **Form E** PDF filler:
  - [ ] Every Form E field has a CaseFacts source
  - [ ] No nulls in mandatory fields when wizard is “complete”
- [ ] Tribunal bundle:
  - [ ] Ensure `generateTribunalBundle()` includes:
    - [ ] Form E
    - [ ] Notice to Leave
    - [ ] Rent schedule (if relevant)
    - [ ] Evidence summary from case-intel
- [ ] Add tests:
  - [ ] At least 1 end-to-end Scotland eviction test
  - [ ] Bundle sanity test (all expected docs present)

---

## 5. Money Claims – England & Wales

Reference: `MASTER_BLUEPRINT.md` §3.3, `CASE_INTEL_SPEC.md`, `BUNDLE_BUILDER_SPEC.md`

### 5.1 Wizard & MQS Integration

- [x] MQS exists and is comprehensive (E&W) – ~90 questions
- [ ] Ensure wizard routes for products:
  - [ ] `money_claim` / `money_claim_england_wales` map to correct MQS
  - [ ] `start` → `next-question` → `checkpoint` → `analyze` flows are correct
  - [ ] Edge case: NI money claim blocked (see Section 8.2)

### 5.2 N1 Form & Supporting Docs

- [ ] Implement or verify **N1** PDF filler:
  - [ ] All required fields filled
  - [ ] Interest sections correct (Section 69 CCA)
  - [ ] Daily rate and running total logic implemented
- [ ] Arrears schedule & evidential docs:
  - [ ] `rent_arrears_schedule` generator:
    - [ ] Month-by-month breakdown
    - [ ] Running balance
  - [ ] Interest calculator:
    - [ ] 8% statutory interest on arrears
- [ ] Particulars of Claim:
  - [ ] Template or AI-assisted generator implemented
  - [ ] Uses case-intel facts and MQS answers
  - [ ] Includes interest wording and court request

### 5.3 Money Claim Bundle

- [ ] Add money claim bundle type in bundle builder:
  - [ ] N1 form
  - [ ] Particulars of claim
  - [ ] Arrears schedule
  - [ ] Evidence index
  - [ ] Guidance sheet (from blueprint, if specified)

- [ ] Add tests:
  - [ ] At least 1 end-to-end money claim E&W test
  - [ ] Bundle structure test

---

## 6. Money Claims – Scotland

Reference: Blueprint §3.3 (Scotland), `MQS_AUDIT_REPORT.md`

### 6.1 Wizard & MQS Integration

- [x] MQS exists and is comprehensive for Scotland money claims (~88 questions)
- [ ] Wizard routing:
  - [ ] `money_claim_scotland` product wired to MQS
  - [ ] Court route / sheriffdom selection implemented per MQS
  - [ ] Checkpoint & analyze endpoints support `money_claim` for Scotland

### 6.2 Form 3A & Bundle

- [ ] Implement or verify **Form 3A** PDF filler:
  - [ ] All simple procedure fields mapped
  - [ ] Interest and amounts correctly calculated
- [ ] Money claim bundle (Scotland):
  - [ ] Form 3A
  - [ ] Arrears schedule
  - [ ] Evidence index
  - [ ] Any additional forms required (per blueprint)

---

## 7. Tenancy Agreements – All Jurisdictions (AST / PRT / NI)

Reference: `MASTER_BLUEPRINT.md` §3.4, AST/PRT templates under `config/templates` or similar

### 7.1 Document Generation

- [ ] Verify AST generation (E&W):
  - [ ] Standard and Premium flows both work end-to-end
  - [ ] All clauses receive correct data from MQS
  - [ ] Right to Rent, deposit protection, rent details correct
- [ ] Verify PRT generation (Scotland):
  - [ ] All mandatory statutory terms present
  - [ ] Optional clauses handled correctly
- [ ] Verify NI tenancy generation:
  - [ ] Domestic rates handled correctly
  - [ ] NI-specific standards applied
  - [ ] No E&W-only clauses leaked in

### 7.2 Ask Heaven Integration (Tenancy)

- [ ] Tenancy-specific Ask Heaven prompts:
  - [ ] Clause-level suggestions where appropriate
  - [ ] Highlight risk clauses (fees, penalty clauses, unfair terms)
- [ ] Ensure safety checks:
  - [ ] Gas safety / EICR / smoke alarms flagged where required
  - [ ] Those facts flow back into CaseFacts and dashboards (for future compliance tracker)

> Note: HMO-specific tenancy questions are allowed but **HMO licensing packs** are out of scope here.

---

## 8. Jurisdiction Blocking & NI Handling

Reference: `NI_EVICTION_STATUS.md`, `MASTER_BLUEPRINT.md`

### 8.1 NI Evictions

- [x] NI evictions blocked in `/api/wizard/start`
- [ ] Update wording to make roadmap explicit:
  - [ ] Error message: “Northern Ireland **eviction workflows** are not yet supported (roadmap Q2 2026).”

### 8.2 NI Money Claims

- [ ] Clarify that NI **money claim** workflows are also blocked:
  - [ ] Update `/api/wizard/start` error text to say:
    - “Northern Ireland **eviction and money claim workflows** are not yet supported…”
  - [ ] Ensure supported matrix shows NI only has:
    - `[ 'tenancy_agreement' ]`

---

## 9. Ask Heaven / AI Integration

Reference: `ASK_HEAVEN_SYSTEM_PROMPT.md`, `FRONTEND_INTEGRATION_GUIDE.md`, `CASE_INTEL_SPEC.md`

### 9.1 Backend Integration

- [x] Advanced Ask Heaven wired with decision engine context
- [ ] For each case type (`eviction`, `money_claim`, `tenancy_agreement`):
  - [ ] Ensure `analyze` response includes:
    - [ ] Case strength
    - [ ] Key issues
    - [ ] Evidence gaps
  - [ ] Ensure prompt includes:
    - [ ] Jurisdiction
    - [ ] Product type
    - [ ] Decision engine outputs
    - [ ] Case-intel summary

### 9.2 Frontend UX

- [ ] AskHeavenPanel:
  - [ ] Available inside wizard
  - [ ] Shows relevant suggestions per step
  - [ ] Can be toggled / opened from review page
- [ ] Verify concurrency / throttling if multiple calls are made

---

## 10. Decision Engine & Legal Change

Reference: `LEGAL_CHANGE_PROTOCOL.md`, `CASE_INTEL_SPEC.md`, decision engine YAMLs

### 10.1 Decision Engine

- [x] Core engine implemented (`src/lib/decision-engine`)
- [ ] Add/verify **money claim** rules:
  - [ ] Arrears severity bands
  - [ ] Interest application checks
  - [ ] Evidence sufficiency for claim
- [ ] Ensure eviction rules use expanded Scotland MQS facts

### 10.2 Legal Change Framework

- [x] `law-profile` and metadata fields in YAML implemented
- [x] `law-monitor` scaffold and CLI exist
- [ ] Add minimal instructions in `LEGAL_CHANGE_PROTOCOL.md` on:
  - [ ] How to run law monitor manually (CLI command)
  - [ ] How to update `effective_from` and `last_reviewed` for MQS and rules YAML

---

## 11. Case Intelligence & Bundles

Reference: `CASE_INTEL_SPEC.md`, `BUNDLE_BUILDER_SPEC.md`

### 11.1 Case Intel

- [x] Scoring, evidence analysis, consistency checks implemented
- [ ] For each case type:
  - [ ] Eviction (E&W & Scotland):
    - [ ] Score correctly reflects grounds, evidence, and pre-action steps
  - [ ] Money claim (E&W & Scotland):
    - [ ] Score considers amount, documentation, and arrears age
  - [ ] Tenancy agreements:
    - [ ] Risk score for aggressive clauses / missing safety docs (if specified in spec)

### 11.2 Bundle Builder

- [x] Court & tribunal bundles implemented for evictions
- [ ] Implement money claim bundles (E&W N1, Scotland Form 3A)
- [ ] Ensure bundle builder receives:
  - [ ] CaseFacts
  - [ ] Decision engine results
  - [ ] Case-intel report
- [ ] Add doc to `BUNDLE_BUILDER_SPEC.md` summarizing:
  - [ ] Money claim bundle structure
  - [ ] Where to add new bundle types in future

---

## 12. Frontend – Wizard, Dashboard, Evidence

Reference: `CONVERSATIONAL_WIZARD_SPECIFICATION.md`, `FRONTEND_INTEGRATION_GUIDE.md`, `MASTER_BLUEPRINT.md` §10

### 12.1 Wizard UX

- [ ] Ensure **single** unified wizard container:
  - [ ] Uses MQS backend for all flows
  - [ ] Shows:
    - [ ] Question
    - [ ] Progress
    - [ ] Blocking issues (from checkpoint)
    - [ ] Warnings & hints
    - [ ] Case strength indicator (if available)
- [ ] Review page:
  - [ ] Shows:
    - [ ] Case summary
    - [ ] Case strength
    - [ ] Key issues & missing items
    - [ ] Button(s) to generate/download bundles

### 12.2 Dashboard MVP (V1)

- [ ] Implement `/dashboard` with at least:
  - [ ] Case list:
    - [ ] Case ID
    - [ ] Product
    - [ ] Jurisdiction
    - [ ] Status
  - [ ] Case detail:
    - [ ] Generated documents list with download buttons
    - [ ] Trigger regeneration of a document (where supported)
- [ ] Evidence vault (MVP):
  - [ ] List uploaded evidence for a case
  - [ ] Show basic metadata (type, uploaded_at, tags)

> NOTE: Full compliance tracker & fancy evidence UX can be v1.1+, but basic dashboard is V1.

---

## 13. Testing & QA

### 13.1 End-to-End Flows

- [ ] E&W eviction: Section 8
- [ ] E&W eviction: Section 21
- [ ] Scotland eviction: PRT ground, Tribunal flow
- [ ] E&W money claim: standard rent arrears claim
- [ ] Scotland money claim: simple procedure
- [ ] AST standard & premium (E&W)
- [ ] PRT (Scotland)
- [ ] NI tenancy agreement

### 13.2 Unit / Integration

- [ ] Decision engine integration tests for:
  - [ ] Eviction (E&W & Scotland)
  - [ ] Money claims (both jurisdictions)
- [ ] Case-intel integration tests:
  - [ ] Score calculation correctness
  - [ ] Evidence gap detection
- [ ] MQS navigation tests:
  - [ ] `getNextMQSQuestion` behaves correctly with `depends_on` logic

---

## 14. Out of Scope for This Checklist (Future Work)

These are **explicitly NOT part of V1** checklist:

- ❌ HMO Licensing Suite:
  - Council-specific rules
  - HMO pack generation
  - Fire risk scoring
- ❌ NI Eviction Workflows:
  - NI Notice to Quit
  - NI eviction bundles
- ❌ NI Money Claim Workflows
- ❌ Full Compliance Tracker & certificate reminders (beyond minimal evidence handling)
- ❌ Admin portal (template manager, AI logs, scraper control)
- ❌ SEO tools & free calculators

---

## 15. Done When…

You can mark V1 as **“Implementation Complete”** when:

- [ ] All `[ ]` items above that are **not** in the “Out of Scope” section are either:
  - [x] Completed and tested, or
  - [ ] Explicitly bumped to v1.1+ with a note in this file.
- [ ] All in-scope flows work **end-to-end**:
  - [ ] User can go from product page → wizard → review → bundle → PDF → download for:
    - [ ] E&W eviction
    - [ ] Scotland eviction
    - [ ] E&W money claim
    - [ ] Scotland money claim
    - [ ] AST/PRT/NI tenancy agreements
- [ ] Documentation & schema are in sync:
  - [ ] `MASTER_BLUEPRINT.md` reflects NI & HMO as future
  - [ ] `supabase_schema.MD` matches code
  - [ ] Key specs updated where necessary

Once those are ticked, you’re not “idea complete” – you’re **ship-ready** for non-HMO, non-NI workflows.
