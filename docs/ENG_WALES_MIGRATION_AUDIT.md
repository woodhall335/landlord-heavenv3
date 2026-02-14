# England/Wales Jurisdiction Migration Audit

## Touched files
- `src/lib/types/jurisdiction.ts` — added canonical derivation helper to normalise legacy `england-wales` values using property location hints and keep jurisdiction utilities canonical-first.
- `src/lib/decision-engine/config-loader.ts` — introduced explicit ruleset map so canonical jurisdictions resolve config paths without relying on `england-wales` keys.
- `config/jurisdictions/uk/england/index.json` — set jurisdiction metadata to canonical `england`.
- `config/jurisdictions/uk/england/rules/decision_engine.yaml` — updated jurisdiction key to `england`.
- `src/app/api/wizard/checkpoint/route.ts` — normalises incoming jurisdiction to canonical, blocks NI eviction/money-claim with explicit codes, and feeds canonical key into decision engine and completeness hints.
- `src/app/api/wizard/next-question/route.ts` — derives canonical jurisdiction for MQS loading and NI gating; prevents legacy keys in supported map.
- `src/app/api/wizard/answer/route.ts` — canonical jurisdiction derivation for gating, validation, MQS loading, and smart-guidance decision-engine calls (England/Wales handled via canonical keys).
- `src/app/api/documents/generate/route.ts` — canonicalises jurisdiction before preview generation, adds NI block code, routes templates via canonical keys, and stores canonical jurisdiction on documents.
- `src/app/api/checkout/create/route.ts` — product metadata now uses canonical jurisdictions; money-claim validation accepts canonical England/Wales only.
- `src/app/api/seo/generate/route.ts`, `src/app/api/seo/queue/route.ts`, `src/app/api/ask-heaven/chat/route.ts`, `src/app/api/ask-heaven/enhance-answer/route.ts` — public enums/defaults converted to canonical jurisdiction keys.
- `src/app/api/cases/stats/route.ts` — jurisdiction breakdown now reports canonical keys with a legacy bucket for `england-wales` cases.
- `src/app/api/wizard/save-facts/route.ts` — default meta jurisdiction set to canonical `england`.

## Notes
- Legacy `england-wales` remains supported only via canonical derivation and explicit ruleset mapping for stored cases.
- Northern Ireland eviction/money-claim previews now return `NI_EVICTION_MONEY_CLAIM_NOT_SUPPORTED` to fail closed.
