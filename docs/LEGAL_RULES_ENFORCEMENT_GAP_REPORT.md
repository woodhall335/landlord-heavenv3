# Legal Rule Enforcement Audit (UK)

## Findings

### Jurisdiction configuration coverage gaps
- **England decision rules not wired into gating**: The jurisdiction config lists mandatory Section 8 grounds with required facts (e.g., rent_amount_monthly, arrears_amount, notice_given_before_tenancy, etc.), but gating only checks a Ground 8 arrears threshold and ignores all other required facts and eligibility rules. No loader consumes `decision_rules.yaml`, leaving Ground 1–7 and discretionary rules unenforced across wizard, preview, and document flows. 【F:config/jurisdictions/uk/england/decision_rules.yaml†L16-L120】
- **Deposit requirements defined but not enforced**: The England facts schema requires deposit_amount, deposit_protected, scheme selection, protection dates, and prescribed information when a deposit is taken, yet the gating logic only checks for amount/protection booleans and never enforces scheme selection or 30-day timing, allowing previews/documents without mandatory deposit compliance data. 【F:config/jurisdictions/uk/england/facts_schema.json†L40-L52】
- **Jurisdictional grounding missing for Scotland/NI/Wales**: Gating explicitly short-circuits for non-England/Wales jurisdictions, meaning Scotland and Northern Ireland configs are never consulted before preview or generation, violating jurisdiction-aware enforcement. 【F:src/lib/wizard/gating.ts†L148-L156】
- **Template-only rules not surfaced as questions**: Scotland and Wales configs define tenancy particulars (e.g., rent frequency, tenancy start, landlord registration) that appear in templates but lack guaranteed wizard prompts, allowing document placeholders to render. Mandatory fields like `landlord_registration_number` are absent from decision gating. 【F:config/jurisdictions/uk/scotland/templates/section-11.mst†L1-L120】【F:config/jurisdictions/uk/wales/templates/section-173.mst†L1-L160】

### Grounds enforcement gaps
- **Mandatory grounds beyond Ground 8 are ignored**: Required facts for Grounds 1–7 (e.g., notice_given_before_tenancy, mortgage_exists, demolition plans) never block the flow; users can generate notices without satisfying mandatory prerequisites because gating only inspects Ground 8 arrears. 【F:config/jurisdictions/uk/england/decision_rules.yaml†L33-L120】【F:src/lib/wizard/gating.ts†L158-L207】
- **Discretionary ground particulars not validated**: Ground 10/11 particulars are only checked for free-text presence, not for statutory content (dates, arrears totals). Missing structured particulars bypass preview generation, risking invalid notices. 【F:src/lib/wizard/gating.ts†L120-L188】
- **Ground selection not jurisdiction-filtered**: `section8_grounds` accepted from the client are never validated against the active jurisdiction’s allowed grounds list, enabling England-specific grounds to be used in Wales/Scotland previews. 【F:src/lib/wizard/gating.ts†L158-L207】【F:config/jurisdictions/uk/england/decision_rules.yaml†L16-L120】

### Preview/document generation bypass
- **Preview route relies on gating that skips jurisdictions**: Notice-only preview uses `evaluateWizardGate`, but because gating returns immediately for Scotland/NI and ignores most England rules, previews can be generated without the jurisdiction-config prerequisites despite config validation succeeding. 【F:src/app/api/notice-only/preview/[caseId]/route.ts†L86-L154】【F:src/lib/wizard/gating.ts†L148-L156】
- **Document rendering does not re-run gating**: PDF/template generation trusts previously stored answers; if answers are mutated via edits or API calls that skip gating, documents render with invalid grounds or missing deposit data. No last-mile guard exists in `src/lib/documents/noticeOnly.ts`. 【F:src/lib/documents/noticeOnly.ts†L24-L118】
- **Guest flows bypass credential checks**: Guest users (null user_id) can call preview routes; gating only checks facts, so authentication errors surface as “session expired”, violating UX safety and obscuring legal blocking reasons. 【F:src/app/api/notice-only/preview/[caseId]/route.ts†L86-L154】

## Fix plan
- **Centralize config-driven gating**: Implement a loader that ingests `config/jurisdictions/uk/<jurisdiction>/decision_rules.yaml` and `facts_schema.json`, translating required_facts and eligibility_rules into deterministic validators used by `evaluateWizardGate` before any preview/generation.
- **Expand jurisdiction handling**: Extend gating to honor Scotland, Wales, and Northern Ireland configs instead of early-returning; block previews when jurisdiction rules cannot be evaluated or required facts are missing.
- **Deposit compliance enforcement**: Enforce deposit scheme selection, protection dates, and prescribed information per facts schema when `deposit_taken` is true; block Section 21/notice previews when timing or scheme data is absent.
- **Grounds completeness**: For each selected ground, verify required_facts defined in config and eligibility_rules (e.g., prior notice, demolition evidence) and block if unmet.
- **API coverage**: Wire the config-driven gating into `/api/wizard/start`, `/api/wizard/answer`, `/api/wizard/next-question`, and all preview/document routes to prevent bypass by guest or authenticated users.
- **Document-layer guardrails**: Re-run gating inside document renderers (`noticeOnly`, tenancy packs) and fail closed if jurisdiction validators cannot be loaded or facts violate rules to prevent stale/edited data from generating PDFs.
- **Guest-aware error taxonomy**: Replace “session expired” on upstream errors with explicit jurisdiction/blocking errors, ensuring null-user flows still surface legal blocking reasons without implying authentication failure.

## Test requirements
- Add tests proving Ground 8 blocks when arrears < 2 months across England/Wales and that other mandatory grounds block when required facts are missing.
- Add deposit compliance tests requiring amount, protection status, scheme, and prescribed info before Section 21 or tenancy previews generate.
- Add regression tests ensuring guest (user_id null) flows hit the same gating and cannot preview without required jurisdiction data.
- Add preview/document tests that fail when jurisdiction configs are invalid or missing required facts, including Scotland and NI coverage.
- Add document renderer tests that re-run gating at generation time to catch post-answer mutations, including template placeholder detection for missing landlord registration/tenancy particulars.
