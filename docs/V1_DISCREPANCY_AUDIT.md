# V1 Discrepancy Audit

This document captures observed gaps between the codebase and the authoritative V1 specs (MASTER_BLUEPRINT.md, V1_COMPLETION_CHECKLIST.md, V1_TESTING_PLAN.md, ASK_HEAVEN_SYSTEM_PROMPT.md, MQS_INTEGRATION_COMPLETE.md, CONVERSATIONAL_WIZARD_SPECIFICATION.md, supabase_schema.MD/DATABASE_SCHEMA.md, LEGAL_CHANGE_PROTOCOL.md, mapped-module-audit.md, law-monitor-findings.md). Items marked **Resolved in V1** were addressed in P0 fixes and are retained here for audit history.

## Law monitor scaffolding
- **Priority:** P1
- **Spec citations:** LEGAL_CHANGE_PROTOCOL.md (law change workflow expectations); law-monitor-findings.md (noted gaps).
- **Code locations:**
  - `src/lib/law-monitor/index.ts` (stubbed `fetchLawSource`, heuristic `compareSnapshotWithRules`, unimplemented `loadPreviousSnapshot`).
  - `scripts/law-monitor-run.ts` (CLI depends on stubbed functions and will throw).
- **Observed behaviour:** `fetchLawSource` intentionally throws; change detection and snapshot loading are TODOs; running `npm run law-monitor` would fail and cannot produce snapshots/reports as required.
- **Required behaviour:** Implement non-destructive fetching, hashing, snapshot storage, and heuristic comparison per LEGAL_CHANGE_PROTOCOL; generate reports without manual patching of rules.
- **Risk / impact:** Protocol-mandated legal monitoring is inoperative, blocking compliance and legal-change governance.
- **Concrete fix recommendation:** Implement real `fetchLawSource` (respectful HTTP fetch + HTML cleaning), snapshot persistence (data/law_snapshots), previous-snapshot lookup, and heuristic comparisons; ensure the CLI runs end-to-end and writes reports under docs/law-change-reports/ while remaining read-only.

## Manual OpenAI smoke test
- **Priority:** P0 — **Resolved in V1**
- **Spec citations:** V1_TESTING_PLAN.md (requires manual smoke); MASTER_BLUEPRINT.md (Ask Heaven integration expectations).
- **Code/docs locations:** Documented in `docs/manual-openai-smoke-test.md` and linked from `docs/V1_TESTING_PLAN.md`.
- **Observed behaviour (pre-fix):** No documented steps for running a live OpenAI smoke test with `npm run dev` + `OPENAI_API_KEY` to validate E&W/Scotland flows, bundles, and NI gating.
- **Current status:** A dedicated manual smoke-test checklist now covers E&W/Scotland eviction and money-claim flows (with Ask Heaven responses), tenancy agreements, bundle generation, and NI gating for local/dev with a real API key.
- **Risk / impact (pre-fix):** Ops could not validate production AI plumbing or jurisdictional wording before release, risking regressions that automated mocks may miss.
- **Resolution summary:** Added and linked a manual smoke-test checklist to satisfy V1 manual QA requirements.

## NI gating and HMO scope policing
- **Priority:** P0 — **Resolved in V1**
- **Spec citations:** MASTER_BLUEPRINT.md and V1_COMPLETION_CHECKLIST.md (NI eviction/money-claim blocked; NI tenancy allowed; HMO out-of-scope).
- **Code locations:**
  - API gating: `src/app/api/wizard/start/route.ts`, `src/app/api/wizard/answer/route.ts`, `src/app/api/wizard/analyze/route.ts`, `src/app/api/wizard/next-question/route.ts`, `src/app/api/wizard/checkpoint/route.ts`.
  - Wizard UI: `src/app/wizard/flow/page.tsx`, `src/components/wizard/**`.
  - Commerce: `src/lib/stripe/index.ts`, `src/lib/feature-flags.ts`, HMO endpoints under `src/app/api/hmo/**`.
- **Observed behaviour (pre-fix):** Start route blocked NI eviction/money-claim, but other wizard endpoints and UI were not uniformly gated; Stripe exposed HMO Pro price IDs and metadata, allowing out-of-scope HMO products.
- **Current status:** All wizard API routes enforce NI eviction/money-claim blocks while allowing NI tenancy agreements with explicit messaging; wizard UI surfaces start errors; HMO SKUs are feature-gated/blocked for V1 across Stripe and related endpoints.
- **Risk / impact (pre-fix):** Legal/UX risk from allowing NI eviction/money-claim starts or selling HMO products contrary to scope; inconsistent gating across layers.
- **Resolution summary:** Centralized NI gating across wizard APIs and UI, maintained NI tenancy allowance, and gated HMO products/flows per V1 scope.

## MQS boolean handling
- **Priority:** P0 — **Resolved in V1**
- **Spec citations:** mapped-module-audit.md (false must be treated as a valid answer); MQS_INTEGRATION_COMPLETE.md.
- **Code locations:** `src/lib/wizard/mqs-loader.ts` (`isTruthyValue`).
- **Observed behaviour (pre-fix):** `isTruthyValue(false)` returned true, causing boolean false answers to count as “answered,” while empty strings were the only falsy check.
- **Current status:** Truthiness predicate updated so `false` is treated as a valid answer; missing detection now keys on null/undefined/empty-string/empty-array only.
- **Risk / impact (pre-fix):** MQS could skip questions that should be asked (e.g., “Do you have a written tenancy agreement?” answered “No”) leading to incomplete facts and downstream decision-engine errors.
- **Resolution summary:** Refined MQS missing-answer logic to respect boolean false while still detecting genuinely missing inputs per spec.

## Court bundle jurisdiction defaults
- **Priority:** P0 — **Resolved in V1**
- **Spec citations:** MASTER_BLUEPRINT.md (jurisdiction fidelity); V1_COMPLETION_CHECKLIST.md (no NI fallback to E&W); law-monitor-findings.md.
- **Code locations:** `src/lib/bundles/index.ts` (court/tribunal bundle generation).
- **Observed behaviour (pre-fix):** Missing/unknown jurisdiction silently coerced to England & Wales (or Scotland), and NI only surfaced as a readiness issue rather than a hard block at entry points.
- **Current status:** Bundle generators require explicit jurisdiction, reject NI/unknown with clear errors, and no longer silently default to England & Wales/Scotland.
- **Risk / impact (pre-fix):** Incorrect jurisdictional outputs (forms/narratives) could be generated, creating legal risk and misfiled court documents.
- **Resolution summary:** Removed silent defaults and enforced explicit non-NI jurisdiction requirements in court/tribunal bundle generation per V1 scope.

## Ask Heaven decision-context robustness
- **Priority:** P1
- **Spec citations:** ASK_HEAVEN_SYSTEM_PROMPT.md (structured outputs, safe context handling); law-monitor-findings.md.
- **Code locations:** `src/lib/ai/ask-heaven.ts` (`buildDecisionEngineContext`, `extractConsistencyFlags`).
- **Observed behaviour:** Functions filter on `decision.blocking_issues` and others without guarding for undefined/empty structures beyond TypeScript assumptions; partial decision outputs could throw or omit required JSON sections.
- **Required behaviour:** Defensive handling when decision/case-intel context is partial; still return valid structured JSON with empty arrays/strings per spec.
- **Risk / impact:** Runtime errors or malformed Ask Heaven responses when upstream data is incomplete, undermining wizard UX and violating structured-output contract.
- **Concrete fix recommendation:** Add null/length guards and default fallbacks for all decision-context arrays/fields before formatting prompts; ensure outputs always include spec-required fields even with partial inputs.

## Supabase schema alignment
- **Priority:** P1
- **Spec citations:** supabase_schema.MD, DATABASE_SCHEMA.md (source of truth for tables/enums); MASTER_BLUEPRINT.md (data integrity).
- **Code locations:** `src/lib/supabase/database-types.ts` (currently limited tables/types), broader schema coverage needed for ai_usage, ai_usage_logs, orders, hmo_* tables, etc.
- **Observed behaviour:** Strict TypeScript definitions omit many schema tables/columns/enums present in the Supabase snapshot; consumers may rely on loose `any` from `types.ts`, risking drift and runtime mismatches.
- **Required behaviour:** Typed definitions should mirror full Supabase schema (all tables in supabase_schema.MD), including AI usage logs and HMO-related tables, to keep API interactions type-safe and spec-aligned.
- **Risk / impact:** Type drift and unnoticed schema changes can cause runtime errors or incorrect data handling, especially for AI usage tracking and gated HMO data.
- **Concrete fix recommendation:** Regenerate `database-types.ts` from the current Supabase schema, covering all tables/enums/nullable fields; update downstream code to adopt strict types gradually.

## Frontend Phase 2 / Part 4 wiring
- **Priority:** P1
- **Spec citations:** CONVERSATIONAL_WIZARD_SPECIFICATION.md; MASTER_BLUEPRINT.md (Ask Heaven assist layer); V1_COMPLETION_CHECKLIST.md (frontend/backend contract).
- **Code locations:** `src/app/wizard/flow/page.tsx`, `src/components/wizard/*` (conversation flow, Ask Heaven panel), `src/app/api/wizard/*` (question sequencing, analysis).
- **Observed behaviour:** Needs verification that UI fully defers to MQS outputs (no duplicated rule logic), invokes Ask Heaven only at allowed points with correct context, and renders structured outputs per spec; current code not yet line-audited against Part 4 guide.
- **Required behaviour:** Strict adherence to conversational wizard spec: MQS-driven questions, backend-dictated flow, Ask Heaven invoked on free-text with decision/case-intel context, structured rendering of suggested_wording/missing_information/evidence/consistency flags, no frontend legal rules.
- **Risk / impact:** Divergence can lead to inconsistent wizard steps, over/under-asking questions, or misrepresenting Ask Heaven outputs, harming compliance and UX.
- **Concrete fix recommendation:** Perform line-by-line comparison to Part 4 spec; refactor UI to consume backend responses verbatim, ensure Ask Heaven panel shows all required sections, and remove any duplicated legal logic.

## Decision engine / MQS alignment
- **Priority:** P1
- **Spec citations:** MQS_INTEGRATION_COMPLETE.md; MASTER_BLUEPRINT.md; V1_COMPLETION_CHECKLIST.md.
- **Code locations:** MQS YAMLs under `config/mqs/**`; CaseFacts schema/mappers; decision engine inputs/outputs; form fillers (N1, N5/N5B/N119, Scotland Form 3A); bundle assembly.
- **Observed behaviour:** No recent verification that each `maps_to` path aligns with CaseFacts schema and downstream decision-engine/form expectations; potential drift noted in mapped-module-audit.md.
- **Required behaviour:** One-to-one alignment of MQS → CaseFacts → decision engine → forms/bundles for all V1 products/jurisdictions; no orphaned or mis-mapped facts.
- **Risk / impact:** Misaligned facts cause incorrect legal determinations or broken form population, leading to invalid notices/bundles.
- **Concrete fix recommendation:** Crosswalk MQS YAMLs against CaseFacts schema and decision engine inputs; fix any path mismatches and add validations/tests to lock alignment.

## Testing plan coverage
- **Priority:** P2
- **Spec citations:** V1_TESTING_PLAN.md (QA/scenario coverage expectations).
- **Code locations:** Automated suites under `tests/**` vs. scenarios listed in V1_TESTING_PLAN.md.
- **Observed behaviour:** Automated tests are green but not explicitly mapped to all plan scenarios (e.g., NI gating, Scotland tribunal language, tenancy agreement variants, manual AI smoke); coverage gaps may exist.
- **Required behaviour:** Ensure automated tests or documented manual steps cover every scenario in V1_TESTING_PLAN.md; add missing tests where feasible.
- **Risk / impact:** Unverified behaviours may regress without detection, particularly jurisdictional gating and document outputs.
- **Concrete fix recommendation:** Create a traceability matrix mapping tests to plan scenarios; add/extend tests for any uncovered cases, and document manual steps where automation is impractical.
