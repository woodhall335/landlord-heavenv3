# Legal Compliance Audit Report – UK Document Generation

## Executive Summary
- Audit scope: Wales, Scotland, Northern Ireland, England (baseline) covering notice periods, statutory references, grounds coverage, deposit requirements, terminology, and rule/template consistency.
- Key risks: Wales Section 173 notice period misconfigured (6 days vs 6 months); Scotland eviction grounds dataset missing multiple statutory grounds while templates expect them; Wales templates retain tenancy/tenant terminology in places.
- Deposit protection timelines appear consistent for Northern Ireland (14/28 days) and England (30 days).

**Total issues found:** 3
- High: 2
- Medium: 1
- Low: 0

**Launch blockers:**
1. Wales Section 173 minimum notice set to 6 days in eviction_grounds.json (should be 6 months); conflicts with notice_periods.yaml and facts_schema validation.
2. Scotland eviction_grounds.json only defines 10 grounds (missing 8 statutory grounds), while templates reference broader set → generation risk for unsupported grounds.

## Findings Table
| Jurisdiction | Category | Issue | Severity | File(s) | Evidence (snippet) | Recommended Fix |
| --- | --- | --- | --- | --- | --- | --- |
| Wales | Notice periods / rule-template consistency | Section 173 minimum notice configured as 6 days, conflicting with 6-month requirement in notice_periods.yaml and facts_schema. Risk of issuing invalid no-fault notices. | High | `config/jurisdictions/uk/wales/eviction_grounds.json`【F:config/jurisdictions/uk/wales/eviction_grounds.json†L152-L157】; `config/jurisdictions/uk/wales/notice_periods.yaml`【F:config/jurisdictions/uk/wales/notice_periods.yaml†L7-L24】; `config/jurisdictions/uk/wales/facts_schema.json` (eligibility rule ≥182 days)【F:config/jurisdictions/uk/wales/facts_schema.json†L187-L193】 | Update `minimum_notice_period_days` to 180/182 to align with statute and other configs; ensure decision logic references consistent value. |
| Scotland | Grounds definitions / template coverage | eviction_grounds.json contains only 10 grounds (1,2,3,4,5,10,12,13,14,18); missing remaining statutory grounds while templates include placeholders for additional grounds (e.g., ground_6, 7, 8, 9, 11, 15, 16, 17). | High | `config/jurisdictions/uk/scotland/eviction_grounds.json` (missing ground keys)【F:config/jurisdictions/uk/scotland/eviction_grounds.json†L1-L120】; ground key list【50c431†L1-L10】; template references for ground_6 etc.【F:config/jurisdictions/uk/scotland/templates/eviction/notice_to_leave.hbs†L214-L300】【F:config/jurisdictions/uk/scotland/templates/eviction/notice_to_leave_official.hbs†L395-L481】 | Add missing Scottish Schedule 3 grounds with correct notice periods/statutory references, or remove template conditionals to match supported subset; align decision logic accordingly. |
| Wales | Terminology correctness | Some eviction templates still use “tenancy”/“tenant” phrasing instead of Wales-required “occupation contract”/“contract-holder” (e.g., deposit statement). Potential inconsistency with Renting Homes (Wales) terminology guidance. | Medium | `config/jurisdictions/uk/wales/templates/eviction/section173_landlords_notice.hbs` ("No deposit was taken for this tenancy.")【F:config/jurisdictions/uk/wales/templates/eviction/section173_landlords_notice.hbs†L100-L107】; other tenancy/tenant references flagged in grep【d20f79†L9-L16】 | Replace residual “tenancy/tenant” terms in Wales eviction templates with “occupation contract/contract-holder” where legally required; verify context to avoid UK-generic guidance conflicts. |

## Confirmed Compliance Table
| Jurisdiction | Check | Result | Evidence |
| --- | --- | --- | --- |
| Northern Ireland | Deposit protection deadlines | Config/templates consistently require protection within 14 days and prescribed information within 28 days. | `deposit_protection_certificate.hbs` showing 14/28 day requirements【F:config/jurisdictions/uk/northern-ireland/templates/deposit_protection_certificate.hbs†L5-L119】; `private_tenancy_agreement.hbs` reiterating 14-day protection【F:config/jurisdictions/uk/northern-ireland/templates/private_tenancy_agreement.hbs†L123-L264】; `decision_rules.yaml` description【F:config/jurisdictions/uk/northern-ireland/decision_rules.yaml†L25-L28】 |
| England | Deposit protection baseline | Templates require deposit protection and prescribed information within 30 days, consistent with Housing Act 2004 baseline. | `standard_ast_formatted.hbs` (30-day requirement)【F:config/jurisdictions/uk/england/templates/standard_ast_formatted.hbs†L958-L978】; `deposit_protection_certificate.hbs` (30-day confirmation)【F:config/jurisdictions/uk/england/templates/deposit_protection_certificate.hbs†L80-L127】 |
| Wales | Notice period table | notice_periods.yaml correctly captures 6-month Section 173 period and 14/56-day fault grounds. | `notice_periods.yaml` entries for Section 173, 157, 159【F:config/jurisdictions/uk/wales/notice_periods.yaml†L7-L33】 |

## Suggested Fix Plan
1. **Wales Section 173 notice period alignment (High)**
   - Update `minimum_notice_period_days` in `config/jurisdictions/uk/wales/eviction_grounds.json` to 180/182 days and cross-check any rule references.
   - Re-run Wales notice period validation checks and regenerate Section 173 notices.

2. **Scotland grounds completeness (High)**
   - Add missing Schedule 3 grounds (6,7,8,9,11,15,16,17) to `eviction_grounds.json` with correct notice periods and statute citations.
   - Verify `notice_to_leave` templates and decision rules reference only supported grounds; adjust accordingly.
   - Run notice generation tests for a sample of grounds including short-notice ones (28 days).

3. **Wales terminology cleanup (Medium)**
   - Replace residual “tenancy/tenant” with “occupation contract/contract-holder” in Wales eviction templates where legally required (e.g., deposit clauses).
   - Re-run terminology grep to confirm cleanup.

## Tests/Verification to Run After Fixes
- Wales: `grep -n "minimum_notice_period_days" config/jurisdictions/uk/wales/eviction_grounds.json` to confirm 6-month value; regenerate Section 173 notice preview.
- Scotland: lint JSON and run any notice generation/preview covering all grounds; ensure template conditionals match config.
- Wales terminology: `grep -rn "\btenancy\b" config/jurisdictions/uk/wales/templates --include="*.hbs"` to ensure only intentional references remain.

