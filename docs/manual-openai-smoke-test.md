# Manual OpenAI Smoke Test (Local / Real API Key)

This checklist exercises the live Ask Heaven + wizard flows end-to-end using a real `OPENAI_API_KEY`.
Run locally only (never in CI). It complements `docs/V1_TESTING_PLAN.md` and focuses on AI plumbing + jurisdiction gating.

## Prerequisites
- `.env.local` contains a valid `OPENAI_API_KEY`.
- `npm install` completed.
- Start the app: `npm run dev` (Next.js dev server on http://localhost:3000).
- Use a fresh browser session (private window) to avoid cached state.

## Scenarios
Run each scenario in order. Expect Ask Heaven panels to return jurisdiction-aware suggested wording, missing information, evidence suggestions, and consistency flags. NI eviction/money-claim must remain blocked with roadmap messaging.

### 1) England & Wales eviction (notice/court pack)
- Navigate to `/wizard`.
- Select **Eviction Pack** → **England & Wales** → **Start Wizard**.
- Answer initial MQS questions until a free-text prompt appears.
- Confirm Ask Heaven panel renders:
  - Suggested wording tailored to England & Wales notices/court language.
  - Missing information list populated when inputs are incomplete.
  - Evidence suggestions (e.g., rent schedule, tenancy agreement).
  - Consistency flags empty or populated if conflicting facts provided.
- Complete flow to review/preview and ensure bundle generation is offered (no NI messaging).

### 2) Scotland eviction (tribunal)
- From `/wizard`, choose **Eviction Pack** → **Scotland**.
- Progress to a free-text question; verify Ask Heaven output uses tribunal terminology (e.g., Notice to Leave / Tribunal) and Scotland evidence requirements.
- Proceed to review and confirm tribunal-oriented outputs (no England & Wales defaults).

### 3) England & Wales money claim
- From `/wizard`, pick **Money Claim** → **England & Wales**.
- Provide basic claim facts (landlord/tenant names, property, arrears breakdown).
- Ensure Ask Heaven suggestions mention particulars of claim / interest where appropriate and that bundles/preview generation works without NI blocking.

### 4) Scotland money claim
- From `/wizard`, pick **Money Claim** → **Scotland**.
- Provide minimal facts; confirm the flow remains enabled for Scotland and Ask Heaven responses reference Scottish tribunal/claim context where relevant.

### 5) Tenancy agreements (England & Wales and Scotland)
- Start **Tenancy Agreement** with **England & Wales**, select Standard/Premium as needed.
- Verify Ask Heaven suggestions for free-text clauses are jurisdiction-aware and non-directive.
- Repeat for **Scotland** to confirm PRT terminology.

### 6) Northern Ireland gating
- Eviction: **Eviction Pack** → **Northern Ireland** should be blocked with message: “Only tenancy agreements are available for Northern Ireland. Eviction and money claim workflows are not currently supported. NI eviction/money claim planned for Q2 2026.”
- Money claim: **Money Claim** → **Northern Ireland** should show the same block.
- Tenancy agreement: **Tenancy Agreement** → **Northern Ireland** should proceed normally (wizard starts, Ask Heaven available when applicable).

## Expected outcomes & logging
- No OpenAI errors in the browser console; network tab shows calls to `/api/wizard/*` and OpenAI via the backend.
- Ask Heaven responses respect the structured format (suggested wording, missing information, evidence suggestions, consistency flags).
- Bundles generated with correct jurisdiction (England & Wales vs Scotland) and no silent fallbacks.
- NI eviction/money-claim flows consistently blocked across UI/API.

## Reporting
- Capture screenshots of Ask Heaven panels for E&W eviction and Scotland eviction.
- Note any discrepancies in wording, missing data detection, or jurisdiction handling and file them against V1 scope.
