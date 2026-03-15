# UK Tenancy Agreement Court-Ready Audit

Date: 15 March 2026
Scope: Runtime tenancy agreement products for England, Wales, Scotland, and Northern Ireland

Templates reviewed:

1. `config/jurisdictions/uk/england/templates/standard_ast_formatted.hbs`
2. `config/jurisdictions/uk/england/templates/ast_hmo.hbs`
3. `config/jurisdictions/uk/wales/templates/standard_occupation_contract.hbs`
4. `config/jurisdictions/uk/wales/templates/occupation_contract_hmo.hbs`
5. `config/jurisdictions/uk/scotland/templates/prt_agreement.hbs`
6. `config/jurisdictions/uk/scotland/templates/prt_agreement_hmo_premium.hbs`
7. `config/jurisdictions/uk/northern-ireland/templates/private_tenancy_agreement.hbs`
8. `config/jurisdictions/uk/northern-ireland/templates/private_tenancy_premium.hbs`

Official-source benchmark set:

- England: GOV.UK Renters' Rights Act 2025 implementation roadmap and GOV.UK model agreement material
- Wales: gov.wales written statements for occupation contracts
- Scotland: gov.scot model agreement and easy-read-notes material for Private Residential Tenancies
- Northern Ireland: nidirect guidance on the Private Tenancies Act (Northern Ireland) 2022 and electrical safety standards

## Verdict Summary

- England: `RED`
- Wales: `AMBER`
- Scotland: `AMBER`
- Northern Ireland: `AMBER/RED`

## RAG Standard

- `GREEN`: suitable to market as court-ready for ordinary cases, subject to factual accuracy and correct wizard data
- `AMBER`: legally structured and often usable, but still needs material statutory/model-term reconciliation before being marketed as solicitor-grade
- `RED`: not safe to market as court-ready without major redesign because the product framework, core clauses, or statutory fit is materially wrong or unstable

## Executive Findings

### 1. England is no longer safe to market unqualified as a court-ready AST product

This is the clearest red issue in the whole stack. The current England runtime templates are still framed as Assured Shorthold Tenancy agreements with AST continuation logic and Section 21 wording. The GOV.UK Renters' Rights Act 2025 roadmap says the new private rented sector regime starts on `1 May 2026`. That makes the current England AST framing unsuitable as the core forward-looking tenancy product for new England lets after that date.

Practical effect:

- pre-`1 May 2026` legacy AST cases can still be serviced carefully
- post-`1 May 2026` England needs a redesigned assured periodic tenancy product
- any unqualified "court-ready England tenancy agreement" claim is too strong unless the product is date-gated and fact-gated

### 2. Wales and Scotland are closer to court-ready, but neither should yet be marketed as solicitor-grade without a line-by-line official-model reconciliation

Both Wales and Scotland are built around the right legal framework and terminology, which is a strong starting point. The remaining problem is not basic structure; it is statutory precision.

In Wales, the written statement of the occupation contract must accurately reflect the prescribed fundamental and supplementary terms. In Scotland, the PRT product should track the Scottish Government model agreement and easy-read-note framework closely enough that bespoke variations do not create avoidable defects or ambiguities.

### 3. Northern Ireland is structurally competent but still under-audited for current statutory information duties

The NI agreement is usable and broadly aligned to the 2022 Act framework, rent increase restrictions, and electrical safety. The main gap is that it does not clearly and explicitly embed the tenancy information notice / statutory information delivery obligation in the way a court-ready premium product should.

## Clause-Block Audit

### England

Overall verdict: `RED`

Core sources:

- Renters' Rights Act 2025 implementation roadmap
- GOV.UK model agreement for shorthold assured tenancies

Clause-block verdicts:

| Clause block | Rating | Reason |
| --- | --- | --- |
| Jurisdiction fit / tenancy type | RED | Product still framed as AST for England even though the core market changes from `1 May 2026`. |
| Parties / property / definitions | AMBER | Structurally acceptable, but definitions depend on an outdated tenancy form. |
| Term / continuation | RED | Fixed-term AST and statutory periodic continuation logic are not a safe forward-looking default for post-cutover England cases. |
| Landlord possession wording | RED | Section 21 wording makes the agreement framework date-sensitive and commercially risky. |
| Rent / payment mechanics | AMBER | Generally usable, but needs redesign around the new assured periodic regime and post-reform rent-change approach. |
| Deposit clauses | AMBER | Operationally serviceable, but not enough on their own to rescue the product if the underlying tenancy form is wrong. |
| Tenant / landlord obligations | AMBER | Normal drafting standard; not the main legal failure point. |
| General provisions / notices / governing law | AMBER | Fine as contract boilerplate. |
| Execution / signatures | AMBER | Acceptable for landlord product standard. |
| Premium/HMO runtime template quality | RED | The live England premium path still relies on an older template architecture with weaker presentation quality than the formatted standard AST. |

Specific findings:

1. `standard_ast_formatted.hbs` is only court-usable for legacy pre-`1 May 2026` England AST scenarios.
2. `ast_hmo.hbs` is materially below solicitor-grade presentation standard and should not be the long-term premium England runtime template.
3. England tenancy products need a product-level redesign, not just clause polishing.

Required remediation:

1. Replace AST framing with a post-reform England assured periodic product.
2. Remove dependence on Section 21 logic from the tenancy agreement itself.
3. Rebuild the premium/HMO England template on the same cleaner drafting system as the formatted standard path.
4. Gate the product by tenancy start date and legacy use case.

### Wales

Overall verdict: `AMBER`

Core sources:

- gov.wales written statements for occupation contracts

Clause-block verdicts:

| Clause block | Rating | Reason |
| --- | --- | --- |
| Jurisdiction fit / tenancy type | GREEN | Correctly uses occupation-contract terminology and Wales-only framing. |
| Parties / property / definitions | GREEN | Structurally strong and professionally laid out. |
| Written statement framing | AMBER | Correctly recognises the written statement requirement, but needs a precise term-by-term benchmark against current prescribed content. |
| Term / continuation / termination | AMBER | Uses section 173 and occupation-contract concepts appropriately, but statutory-term precision matters heavily in Wales. |
| Rent / rent increases | AMBER | Correct broad direction, but should be checked line-by-line against current Welsh statutory wording expectations. |
| Deposit / prescribed information | AMBER | Good operational drafting, but prescribed-term alignment still matters. |
| Tenant / landlord obligations | AMBER | Strong structure, but Wales is sensitive to which terms are fundamental, supplementary, or additional. |
| General provisions / notices / governing law | AMBER | Competent, but should be checked against the written-statement framework. |
| Execution / signatures | GREEN | Structurally fine. |
| Premium/HMO delta | AMBER | HMO provisions are commercially useful, but must not disturb prescribed occupation-contract structure improperly. |

Specific findings:

1. The Wales product is much closer to court-ready than England because it is built on the right legal model.
2. The remaining risk is statutory precision, not basic drafting competence.
3. A solicitor would expect a careful reconciliation against the current written-statement and prescribed-term structure before sign-off.

Required remediation:

1. Build a clause-by-clause parity matrix against the current official Welsh written statement / model content.
2. Separate clearly which terms are fundamental, supplementary, and additional.
3. Check HMO and additional rules against what can lawfully be added without contaminating prescribed occupation-contract structure.

### Scotland

Overall verdict: `AMBER`

Core sources:

- Scottish Government model agreement for a PRT
- Scottish Government easy-read notes for a PRT

Clause-block verdicts:

| Clause block | Rating | Reason |
| --- | --- | --- |
| Jurisdiction fit / tenancy type | GREEN | Correctly treats the product as a PRT with no fixed end date. |
| Parties / property / definitions | GREEN | Good structural quality and appropriate Scottish terminology. |
| Tenancy creation / security of tenure | GREEN | Good high-level alignment with the PRT regime. |
| Rent / Form 4 / review mechanics | AMBER | Substantively on the right track, but should be checked against current Scottish model wording and any current rent-control position. |
| Deposit / approved schemes | GREEN | Strong and appropriately Scotland-specific. |
| Tenant / landlord obligations | AMBER | Good substance, but still benefits from precise model-term comparison. |
| Ending the tenancy / tribunal process | AMBER | Generally right, but must stay closely aligned to current Scottish ground and process wording. |
| Easy-read / required information ecosystem | AMBER | Strong because the pack recognises easy-read notes, but the agreement and pack should be audited together. |
| Execution / signatures | GREEN | Structurally sound. |
| Premium/HMO delta | AMBER | Stronger than England, but still needs review of HMO/rent-zone/current-law specifics. |

Specific findings:

1. Scotland is the strongest substantive fit after Wales because the template is built on the right tenancy model.
2. The main residual risk is drift from the current Scottish Government model agreement and related official materials.
3. Rent Pressure Zone references and other current-regime notes should be checked for present-day accuracy before making solicitor-grade claims.

Required remediation:

1. Produce a clause parity table against the current Scottish Government PRT model.
2. Review rent-control / rent-zone references for current legal accuracy.
3. Audit the standard agreement and easy-read notes together as a single court-readiness package.

### Northern Ireland

Overall verdict: `AMBER/RED`

Core sources:

- nidirect guidance on the Private Tenancies Act (Northern Ireland) 2022
- nidirect electrical safety standards guidance

Clause-block verdicts:

| Clause block | Rating | Reason |
| --- | --- | --- |
| Jurisdiction fit / tenancy type | GREEN | Correctly framed as a Northern Ireland private tenancy. |
| Parties / property / definitions | GREEN | Structurally good. |
| Tenancy term / notice to quit framework | AMBER | The product recognises notice-period structure, but the statutory information ecosystem needs fuller treatment. |
| Rent / rent increases | GREEN | Correct high-level direction on 12-month restriction and 3-month notice. |
| Deposit / approved schemes | GREEN | Good NI-specific drafting. |
| Tenant / landlord obligations | AMBER | Competent, but some statutory information duties are not stated with enough emphasis. |
| Electrical safety / modern compliance | AMBER | Present, which is good, but should be integrated as part of a fuller statutory-compliance schedule. |
| Statutory information notice / required information | RED | No clear tenancy-information-notice style treatment, which weakens any solicitor-grade claim. |
| Ending the tenancy / County Court framing | AMBER | Broadly competent, but requires full statutory-process verification. |
| Execution / signatures | GREEN | Structurally acceptable. |
| Premium/HMO delta | AMBER | Better organised than England premium, but still needs deeper statutory audit. |

Specific findings:

1. NI is not fundamentally misframed like England, but it is missing enough statutory-information emphasis that "court-ready" is too strong today.
2. The agreement should expressly integrate the landlord's current statutory information obligations, not merely imply them.
3. The premium NI product is commercially stronger than the standard NI template, but it still needs a clean statutory-information checklist and delivery record.

Required remediation:

1. Add explicit statutory-information notice / delivery clauses and schedule references.
2. Build a Northern Ireland statutory information checklist into the pack and cross-reference it from the agreement.
3. Reconfirm notice, possession, and electrical safety wording against current NI guidance before using solicitor-grade marketing.

## Solicitor-Grade Assessment

Current position:

- England: `No`
- Wales: `Not yet`
- Scotland: `Not yet`
- Northern Ireland: `Not yet`

Reason:

The templates are now much better landlord products than they were, but "solicitor-grade" is a higher threshold. That label implies:

1. current legal-model fit
2. close parity with official prescribed or model wording where that matters
3. no material jurisdiction drift
4. no product-market mismatch
5. enough statutory-information scaffolding that a landlord can rely on the pack operationally

Only Wales and Scotland are close. England fails on product-market fit after `1 May 2026`. Northern Ireland fails on statutory-information completeness.

## Top Remediation Sequence

Highest-value order:

1. Redesign the England tenancy product for the post-`1 May 2026` assured periodic regime.
2. Run a clause-parity reconciliation for Wales against the current official written statement / prescribed terms.
3. Run a clause-parity reconciliation for Scotland against the current Scottish Government PRT model agreement and easy-read notes.
4. Add a statutory-information notice / delivery schedule to Northern Ireland.
5. Retire or rebuild the old England premium HMO template architecture.

## Commercial Positioning Recommendation

Current safe positioning:

- England: "legacy AST / specialist use only" until redesigned
- Wales: "strong guided occupation contract product" rather than solicitor-grade
- Scotland: "strong guided PRT product" rather than solicitor-grade
- Northern Ireland: "strong guided private tenancy product" rather than solicitor-grade

Unsafe positioning today:

- "court-ready solicitor-grade tenancy agreement across all UK jurisdictions"
- "fully solicitor-equivalent England tenancy agreement" without date and regime qualification

## Source Links

- GOV.UK Renters' Rights Act 2025 roadmap: https://www.gov.uk/government/publications/renters-rights-act-2025-implementation-roadmap/implementing-the-renters-rights-act-2025-our-roadmap-for-reforming-the-private-rented-sector
- GOV.UK model agreement for shorthold assured tenancies: https://www.gov.uk/government/publications/model-agreement-for-a-shorthold-assured-tenancy
- gov.wales written statements for occupation contracts: https://www.gov.wales/written-statements-occupation-contracts
- gov.scot model agreement for private residential tenancies: https://www.gov.scot/publications/private-residential-tenancy-model-agreement-private-landlords/
- gov.scot easy read notes for private residential tenancies: https://www.gov.scot/publications/private-residential-tenancy-easy-read-notes/
- nidirect Private Tenancies Act (Northern Ireland) 2022 guidance: https://www.nidirect.gov.uk/articles/private-tenancies-act-northern-ireland-2022
- nidirect electrical safety standards for private tenants: https://www.nidirect.gov.uk/articles/electrical-safety-standards-private-tenants
