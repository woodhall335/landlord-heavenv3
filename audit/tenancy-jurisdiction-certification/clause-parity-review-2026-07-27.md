# Wales and Scotland standard agreement parity review

Date: 27 July 2026

Status: implementation complete; legal certification pending. Neither
jurisdiction is approved for public sale until the external solicitor gate is
recorded as passed.

## Authoritative baselines

- Wales periodic standard occupation contract: Welsh Government model updated 29 May 2026, 44 pages.
- Wales fixed-term standard occupation contract under seven years: Welsh Government model updated 29 May 2026, 42 pages.
- Scotland private residential tenancy: Scottish Government model published April 2024, 32 pages and 39 numbered clauses.

The exact downloaded PDFs and their SHA-256 hashes are recorded in
`config/mqs/tenancy_agreement/official_model_sources/certification-baselines.json`.

## Wales result

The customer agreement remains a Landlord Heaven HTML/PDF document. The
government PDF is not overlaid, populated or delivered as the agreement.

Two distinct branded templates are now selected by the wizard answer:

- `standard_occupation_contract.hbs` for periodic standard contracts;
- `fixed_term_standard_occupation_contract.hbs` for fixed terms under seven
  years.

Both templates are mechanically rebuilt from the pinned official Word source.
They include the full explanatory information, fundamental and supplementary
terms, classifications and annex. Key matters and signatures use the existing
Landlord Heaven document layout. The current provisions concerning children and
benefits claimants are present in both variants.

Wizard data is limited to key matters: contract type and dates, any occupation
exclusion, parties and contacts, dwelling, rent/payment, deposit and Rent Smart
Wales details. The standard flow no longer invites unreviewed break clauses,
rent formulas or bespoke legal terms.

Remaining gate: a Welsh housing solicitor must approve both generated samples,
the term numbering, permitted option handling and wizard-to-document mapping.

## Scotland result

The customer agreement remains a branded Landlord Heaven HTML/PDF. Its legal
body is rebuilt from the pinned April 2024 Scottish Government Word model.
Clause positions 7–39 are present and ordered in the generated template; clauses
1–6 are completed in the branded key-details section.

The wizard now supplies the model variables for:

- every tenant's name, correspondence address, email and telephone;
- up to two landlords, registration details and any letting agent;
- written communication method;
- included, shared and excluded property areas, furnishing, RPZ and HMO status;
- open-ended start date, rent frequency/timing, first-payment coverage and
  included services;
- deposit scheme, utilities and inventory delivery.

Fixed terms, minimum periods, break clauses and unreviewed additional terms are
not offered in the standard Scottish route. The exact official statutory
supporting-notes PDF remains a separate pack document.

Remaining gate: a Scottish housing solicitor must approve the completed sample,
the handling of discretionary model wording and the 39-clause mapping.

## Northern Ireland prescribed notice

The official Department for Communities Tenancy Information Notice and its
completion guidance are included in the pack. The checkout validation now
requires the landlord to confirm that they will complete, sign and provide the
official notice free of charge within 28 days. Customer next steps distinguish
the 28-day deposit-protection deadline from the 35-day prescribed-information
deadline.

This is an explicit completion workflow, not an assertion that the tenancy
agreement replaces the prescribed notice.
