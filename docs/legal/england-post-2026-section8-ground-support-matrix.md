# England Post-1 May 2026 Section 8 Ground Support Matrix

Last updated: 2026-04-26

Purpose: internal support-status matrix for the live England `notice_only` and `complete_pack` products on and after **1 May 2026**.

Primary legal baseline:
- [GOV.UK: Repossessing your privately rented property on or after 1 May 2026](https://www.gov.uk/guidance/renting-out-your-property-guidance-for-landlords-and-letting-agents/repossessing-your-privately-rented-property-on-or-after-1-may-2026)
- [GOV.UK: Standard possession claims](https://www.gov.uk/guidance/renting-out-your-property-guidance-for-landlords-and-letting-agents/standard-possession-claims)
- [GOV.UK: Assured tenancy forms for privately rented properties from 1 May 2026](https://www.gov.uk/guidance/assured-tenancy-forms-for-privately-rented-properties-from-1-may-2026)

Implementation sources:
- [ground-catalog.ts](/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/lib/england-possession/ground-catalog.ts:1)
- [ground-support-status.ts](/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/lib/england-possession/ground-support-status.ts:1)
- [NoticeSection.tsx](/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/components/wizard/sections/eviction/NoticeSection.tsx:1)
- [pack-drafting.ts](/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/lib/england-possession/pack-drafting.ts:1)
- [post-2026-validation.ts](/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/lib/england-possession/post-2026-validation.ts:1)

Status legend:
- `Full`: live wizard questions, validation, and output drafting are all wired for this ground
- `Partial`: ground is selectable but still relies on weak/generic collection or thin output
- `Blocked`: ground should not be selectable for court-ready generation

Current live status:
- All enabled grounds in the current England catalog are treated as `Full`
- Some grounds still carry profile, timing, or prior-notice restrictions, but those restrictions are validated rather than ignored

Core output contract for `Full` grounds:
- Form 3A particulars
- N119 particulars
- witness statement narrative
- evidence checklist items
- case summary narrative

## Ground Matrix

| Ground | Title | Status | Notice period | Mandatory / discretionary | Wizard coverage | Key validation / notes |
|--------|-------|--------|---------------|---------------------------|-----------------|------------------------|
| `1` | Occupation by landlord or family | Full | 4 months | Mandatory | Dedicated occupation panel | Cannot be used until at least 12 months after tenancy start. |
| `1A` | Sale of dwelling house | Full | 4 months | Mandatory | Dedicated sale panel | Cannot be used until at least 12 months after tenancy start. |
| `2` | Sale by mortgagee | Full | 4 months | Mandatory | Specialist ground panel | Mortgagee / sale evidence required. |
| `2ZA` | Possession when superior lease ends | Full | 4 months | Mandatory | Specialist ground panel | Landlord-profile restriction enforced. |
| `2ZB` | Possession when superior lease ends | Full | 4 months | Mandatory | Specialist ground panel | Superior-lease end evidence required. |
| `2ZC` | Possession by superior landlord | Full | 4 months | Mandatory | Specialist ground panel | Superior-landlord / section 18 change evidence required. |
| `2ZD` | Possession by superior landlord | Full | 4 months | Mandatory | Specialist ground panel | Superior-lease end evidence required. |
| `4` | Student accommodation | Full | 2 weeks | Mandatory | Specialist ground panel | University/college profile restriction enforced. |
| `4A` | Student accommodation for occupation by students | Full | 4 months | Mandatory | Specialist ground panel | Prior-notice prerequisite enforced. |
| `5` | Ministers of religion | Full | 2 months | Mandatory | Specialist ground panel | Minister-of-religion profile restriction enforced. |
| `5A` | Occupation by agricultural worker | Full | 2 months | Mandatory | Specialist ground panel | Agricultural-landlord profile restriction enforced. |
| `5B` | Occupation by person who meets employment requirements | Full | 2 months | Mandatory | Specialist ground panel | Employment-qualification evidence required. |
| `5C` | End of employment by landlord | Full | 2 months | Mandatory | Specialist ground panel | Employer-landlord profile restriction enforced. |
| `5E` | Occupation as supported accommodation | Full | 4 weeks | Mandatory | Specialist ground panel | Supported-accommodation profile restriction enforced. |
| `5F` | Dwelling-house occupied as supported accommodation | Full | 4 weeks | Mandatory | Specialist ground panel | Supported-accommodation profile restriction enforced. |
| `5G` | Tenancy granted for homelessness | Full | 4 weeks | Mandatory | Specialist ground panel | PRP / local-authority-owned-company profile restriction enforced. |
| `5H` | Occupation as stepping stone accommodation | Full | 2 months | Mandatory | Specialist ground panel | Scheme evidence required. |
| `6` | Redevelopment | Full | 4 months | Mandatory | Dedicated redevelopment panel | Works and possession-necessity evidence required. |
| `6B` | Compliance with enforcement action | Full | 4 months | Mandatory | Dedicated redevelopment / enforcement panel | Enforcement notice / compliance evidence required. |
| `7` | Death of tenant | Full | 2 months | Mandatory | Specialist ground panel | Death / succession evidence required. |
| `7A` | Severe antisocial or criminal behaviour | Full | Immediate application | Mandatory | Breach / conduct panel | Immediate-application route reflected in drafting and readiness warnings. |
| `7B` | No right to rent | Full | 2 weeks | Mandatory | Dedicated right-to-rent panel | Official Home Office / right-to-rent material required. |
| `8` | Rent arrears | Full | 4 weeks | Mandatory | Arrears schedule + Section 8 particulars panel | Post-1 May 2026 Ground 8 threshold enforced. |
| `9` | Suitable alternative accommodation | Full | 2 months | Discretionary | Dedicated alternative-accommodation panel | Suitability and affordability evidence required. |
| `10` | Any rent arrears | Full | 4 weeks | Discretionary | Arrears schedule + Section 8 particulars panel | Arrears schedule and chronology are expected. |
| `11` | Persistent arrears | Full | 4 weeks | Discretionary | Arrears schedule + Section 8 particulars panel | Arrears history and contact/engagement history are expected. |
| `12` | Breach of tenancy | Full | 2 weeks | Discretionary | Breach / conduct panel | Clause-specific breach facts collected. |
| `13` | Deterioration of property | Full | 2 weeks | Discretionary | Breach / conduct panel | Condition / causation evidence required. |
| `14` | Antisocial behaviour | Full | Immediate application | Discretionary | Breach / conduct panel | Immediate-application route reflected in drafting and readiness warnings. |
| `14A` | Domestic abuse | Full | 2 weeks | Discretionary | Breach / conduct panel | Relationship / conduct facts collected through ground details. |
| `14ZA` | Rioting | Full | 2 weeks | Discretionary | Breach / conduct panel | Criminal-conduct evidence required. |
| `15` | Deterioration of furniture | Full | 2 weeks | Discretionary | Breach / conduct panel | Furniture / damage evidence required. |
| `17` | False statement | Full | 2 weeks | Discretionary | Breach / conduct panel | Misrepresentation facts and evidence required. |
| `18` | Supported accommodation | Full | 4 weeks | Discretionary | Specialist ground panel | Supported-accommodation profile restriction enforced. |

## Practical Support Notes

### Dedicated panels
- Grounds `1`, `1A`, `6`, `6B`, `7B`, and `9` have dedicated ground-detail prompts tailored to the specific statutory route.

### Arrears grounds
- Grounds `8`, `10`, and `11` depend on the canonical arrears schedule and chronology model.
- Ground `8` also depends on the post-1 May 2026 statutory threshold validation.

### Specialist panel grounds
- Grounds `2`, `2ZA`, `2ZB`, `2ZC`, `2ZD`, `4`, `4A`, `5`, `5A`, `5B`, `5C`, `5E`, `5F`, `5G`, `5H`, `7`, and `18` use the specialist-ground panel.
- Those grounds are still treated as `Full` because the live flow collects the factual basis, qualifying category, trigger/status date, and evidence, and the drafting model has matching ground-specific output support.

### Conduct / breach grounds
- Grounds `12`, `13`, `14`, `14A`, `14ZA`, `15`, and `17` are supported through the Section 8 particulars plus breach/conduct detail collection and witness/evidence drafting.

## Operational Rule

If a future change weakens one of the following for any ground:
- wizard fact collection
- validator coverage
- Form 3A / N119 drafting
- witness / evidence / case-summary support

that ground must be downgraded from `Full` to `Partial` or `Blocked` in:
- [ground-support-status.ts](/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/lib/england-possession/ground-support-status.ts:1)
- this matrix

Do not leave a ground marked `Full` if the user can select it but the pack is no longer truly court-ready for that route.
