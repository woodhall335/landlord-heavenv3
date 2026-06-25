# Landlord Heaven to HRHeaven Backlink Opportunity Map

Audit date: 2026-06-25  
Audit scope: repository content, route files, SEO content registries, product pages, guide pages, and relevant configuration files.  
Status: audit only. No links added.

## Executive Summary

Landlord Heaven can safely send a small number of editorial links to HRHeaven, but only where the Landlord Heaven page already discusses property businesses, agents, staff, contractors, cleaners, maintenance teams, or employee-linked accommodation.

The safest strategy is not sitewide linking. Use a handful of contextual links inside relevant landlord-business content and create a small number of support articles where the HR topic is the main subject.

Recommended initial volume:

- Phase 1: 5 to 8 links across the strongest existing pages.
- Phase 2: 3 to 4 new Landlord Heaven support articles with one HRHeaven link each.
- Maximum per page: 1 HRHeaven link, occasionally 2 only where there are two genuinely different HR intents.

## Highest-Confidence Existing Opportunities

| Priority | Landlord Heaven page | Inspected source | Why the link is relevant | HRHeaven destination | Suggested anchor | Risk |
|---:|---|---|---|---|---|---|
| 1 | `/products/ast` | `src/app/(marketing)/products/ast/page.tsx` | This hub compares Standard, Premium, Student, HMO, and Lodger routes and speaks to landlords choosing the right setup. It includes HMO/shared-house and management wording, which naturally overlaps with property-business employment documents. | `https://hrheaven.co.uk/industry/real-estate` | `HR documents for property businesses` | Low |
| 2 | `/hmo-shared-house-tenancy-agreement` | `src/app/hmo-shared-house-tenancy-agreement/page.tsx` | The page discusses communal spaces, house rules, repair reporting, handover, utilities, cleaners, and day-to-day shared-house management. A small note for landlords who employ cleaners/caretakers would be genuinely useful. | `https://hrheaven.co.uk/industry/cleaning/cleaner-employment-contract` | `cleaner employment contract` | Low |
| 3 | `/standard-tenancy-agreement` | `src/app/standard-tenancy-agreement/page.tsx` | The page explicitly distinguishes lighter standard wording from Premium management wording and mentions inspections, repairs, keys, contractor access, and handover. Link only if adding a sentence about landlords who run a property business with staff. | `https://hrheaven.co.uk/industry/real-estate` | `employment documents for property businesses` | Low-medium |
| 4 | `/money-claim-cleaning-costs` | `src/app/money-claim-cleaning-costs/page.tsx` | This is the strongest cleaning-specific page. It talks about professional cleaners, invoices, quotes, cleaning assessments, and evidence. Useful to landlords who repeatedly use cleaners or employ cleaning staff. | `https://hrheaven.co.uk/industry/cleaning/cleaner-employment-contract` | `cleaner employment contract` | Low |
| 5 | `/money-claim-carpet-damage` | `src/app/money-claim-carpet-damage/page.tsx` | The page references professional cleaner assessment and cleaning quotes. Link should be secondary and only if a short “if you employ cleaning staff” sentence is added. | `https://hrheaven.co.uk/industry/cleaning/cleaner-employment-contract` | `employment contract for cleaning staff` | Medium |
| 6 | `/tenant-refusing-access` | `src/lib/seo/pass1-longform-content.ts` | This long-form content discusses access logs, urgent repairs, gas safety, contractor records, and repairs. The natural HR overlap is contractor-vs-employee boundaries for maintenance people. | `https://hrheaven.co.uk/employment-contract` | `employment contract` or `contractor or employee status` | Medium |
| 7 | `/county-court-claim-form-guide` | `src/app/county-court-claim-form-guide/page.tsx` | The page mentions landlord details, managing agent details, and claim routes. Only use a soft link in a “property businesses with staff” aside, not in the main court-form explanation. | `https://hrheaven.co.uk/industry/real-estate` | `HR documents for property businesses` | Medium |
| 8 | `/warrant-of-possession` | `src/app/warrant-of-possession/page.tsx` | The page suggests booking a cleaner and photographer after eviction. Link is relevant only if positioned around landlords who regularly manage cleaning/turnover teams. | `https://hrheaven.co.uk/industry/cleaning/cleaner-employment-contract` | `cleaner employment contract` | Medium |
| 9 | `/tenancy-agreements/wales` | `src/app/tenancy-agreements/wales/page.tsx` | The page has a clear “Letting agents” card. If this route remains commercially active, one letting-agency HR link could help. | `https://hrheaven.co.uk/industry/real-estate` | `employment contracts for letting agency staff` | Medium |
| 10 | `/tenancy-agreements/northern-ireland` | `src/app/tenancy-agreements/northern-ireland/page.tsx` | The page references letting agents and property managers. Use only if the NI page is still intended as active and accurate. | `https://hrheaven.co.uk/industry/real-estate` | `employment contracts for letting agency staff` | Medium |

## Strong New-Content Opportunities

These should be higher priority than forcing links into thinly related existing pages.

| Proposed Landlord Heaven article | Why it should exist | HRHeaven destination | Suggested anchor |
|---|---|---|---|
| `/landlords-hiring-staff-employee-or-contractor` | Fits landlord business operations and reduces misclassification risk. | `https://hrheaven.co.uk/employment-contract` | `employment contract` |
| `/hiring-a-property-manager-employment-contract-checklist` | Direct real-estate HR intent. Strongest fit for HRHeaven. | `https://hrheaven.co.uk/industry/real-estate/property-manager-employment-contract` | `employment contract for property managers` |
| `/employment-documents-for-property-management-businesses` | Broad but commercially relevant for portfolio landlords, agents, and property companies. | `https://hrheaven.co.uk/hr-document-pack` | `HR document pack` |
| `/do-letting-agencies-need-employee-handbooks` | Very natural bridge from letting-agent audience to HRHeaven. | `https://hrheaven.co.uk/employee-handbook` | `employee handbook for property businesses` |
| `/ground-16-form-3a-employee-accommodation` | Ground 16 config exists but no matching page was found. This is highly relevant to employment-linked accommodation. | `https://hrheaven.co.uk/employment-contract` | `employment contract linked to accommodation` |

## Conditional Opportunities

Use these only after adding genuinely useful supporting context.

| Landlord Heaven page | Condition before linking | HRHeaven destination |
|---|---|---|
| `/premium-tenancy-agreement` | Add a short paragraph about portfolio landlords or property companies with internal staff. | `/industry/real-estate` |
| `/tenant-damaging-property` | Link only if the page discusses employed maintenance teams or in-house repair staff. | `/employment-contract` |
| `/tenant-refusing-access` | Add a small note distinguishing contractors, agents, and employees in property maintenance operations. | `/employment-contract` |
| `/eviction-cost-uk` | Link only from a section about regular employed cleaning/turnover staff, not from one-off cleaning cost tables. | `/industry/cleaning/cleaner-employment-contract` |
| `/bailiff-eviction-process` | Same as warrant/enforcement pages: only if discussing repeated cleaning/turnover operations. | `/industry/cleaning/cleaner-employment-contract` |

## Recommended First Links

1. `/products/ast` to HRHeaven `/industry/real-estate`
   Anchor: `HR documents for property businesses`

2. `/hmo-shared-house-tenancy-agreement` to HRHeaven `/industry/cleaning/cleaner-employment-contract`
   Anchor: `cleaner employment contract`

3. `/money-claim-cleaning-costs` to HRHeaven `/industry/cleaning/cleaner-employment-contract`
   Anchor: `employment contract for cleaning staff`

4. New article `/hiring-a-property-manager-employment-contract-checklist` to HRHeaven `/industry/real-estate/property-manager-employment-contract`
   Anchor: `employment contract for property managers`

5. New article `/landlords-hiring-staff-employee-or-contractor` to HRHeaven `/employment-contract`
   Anchor: `employment contract`

## Notes

- Avoid exact repeated anchors.
- Avoid linking from every tenancy or eviction page.
- Avoid using commercial-only wording like “best HR contracts” or “HRHeaven property manager contract” as anchors.
- Keep links editorial and explanatory.
