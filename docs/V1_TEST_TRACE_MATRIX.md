# V1 Test Trace Matrix

This matrix maps the scenarios in `docs/V1_TESTING_PLAN.md` to the automated Vitest suites (and noted gaps) to ensure every V1 flow is covered or explicitly tracked for follow-up.

## Jurisdictional gating
- **NI eviction/money-claim blocked; NI tenancy allowed:**
  - `tests/api/wizard-ni-gating.test.ts`
  - `tests/ui/wizard-ni-gating.test.tsx`
  - `tests/documents/documents-ni-gating.test.ts`
- **Gap:** none for API/UI gating; deeper decision-engine NI exclusions covered in bundle tests.

## Ask Heaven / AI flows
- **Mocked AI seam & structured outputs:**
  - `tests/ai/ask-heaven-advanced.test.ts` (fixtures for E&W/Scotland, consistency flags, safety checks)
  - `tests/api/wizard-money-claim-completion.test.ts` (API flow with injected AI client)
  - `tests/api/wizard-mqs-eviction.test.ts` (API flow with injected AI client)
- **Gap:** live OpenAI smoke is manual (see `docs/manual-openai-smoke-test.md`).

## Wizard MQS flows
- **Evictions:** `tests/api/wizard-mqs-eviction.test.ts`
- **Money claims:** `tests/api/wizard-mqs-money-claim.test.ts`
- **Tenancy agreements:** `tests/api/wizard-mqs-tenancy-agreement.test.ts`
- **Access control:** `tests/api/wizard-money-claim-access.test.ts`
- **Checkpoint/completion:** `tests/api/wizard-money-claim-completion.test.ts`
- **Gap:** none explicit; decision-engine alignment still tracked separately.

## Bundle generation (court + tribunal)
- **Court bundles (E&W):** `tests/bundles/bundle-generator.test.ts`
- **Tribunal bundles (Scotland):** `tests/bundles/bundle-generator.test.ts`
- **Gap:** readiness messaging vs. decision-engine edge cases not fully asserted (tracked in discrepancy audit).

## Document packs and official forms
- **AST Standard/Premium:** `tests/documents/ast-pack-standard.test.ts`, `tests/documents/ast-pack-premium.test.ts`
- **Money claim packs (E&W):** `tests/documents/money-claim-pack.test.ts`
- **Scotland Simple Procedure (Form 3A):** `tests/documents/scotland-money-claim-pack.test.ts`
- **Scotland Notice to Leave guardrails:** `tests/documents/scotland-form-guards.test.ts`
- **NI gating:** `tests/documents/documents-ni-gating.test.ts`
- **Gap:** none for primary V1 forms; tribunal narrative depth covered indirectly via bundle tests.

## Decision engine behaviours
- **Consistency & decision paths:** `tests/decision-engine/decision-engine.test.ts`
- **Gap:** mapped-module alignment vs. CaseFacts/schema not exhaustively asserted (tracked as P1 in discrepancy audit).

## Case intel / narratives
- **Narrative generation & AI seam:** `tests/bundles/bundle-generator.test.ts`
- **Gap:** tribunal narrative linguistic nuance not separately asserted.

## UI wiring (Conversational Wizard)
- **jsdom rendering + gating:** `tests/ui/wizard-ni-gating.test.tsx`
- **Gap:** Ask Heaven panel rendering and consistency_flags display rely on integration behaviour; no dedicated UI snapshot test.

## Integration / end-to-end smoke
- **Money claim integration:** `tests/api/wizard-money-claim-completion.test.ts`
- **Bundle + AI integration:** `tests/bundles/bundle-generator.test.ts`
- **Gap:** manual OpenAI smoke required for live model validation (see `docs/manual-openai-smoke-test.md`).
