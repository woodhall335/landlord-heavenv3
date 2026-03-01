# LandlordHeaven Site Inventory + Cannibalisation Audit (No Implementation)

## Method + limitations
- Used repository audit artifacts (`seo_audit_report.json`, `sitemap_entries.json`, `content-snapshot.json`) and route declarations (`src/app/sitemap.ts`).
- Live `robots.txt`/`sitemap.xml` crawl unavailable from this environment due to 403 tunnel restriction.

## 1) URL Inventory
| URL | Type | Jurisdiction focus | Primary topic | Index status | Last modified | Traffic priority guess |
|---|---|---|---|---|---|---|
| `/` | Other | UK-wide | Section 21 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/6-month-tenancy-agreement-template` | Template | UK-wide | AST | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/about` | Other | UK-wide | Other | indexable; canonical present | 2026-01-01T00:00:00.000Z | Med |
| `/apply-possession-order-landlord` | Other | England | Other | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/ask-heaven` | Q&A | UK-wide | AST | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/ask-heaven/accelerated-possession-costs-fees` | Q&A | England | Other | indexable; canonical present | 2026-02-10T17:48:06.231Z | High |
| `/ask-heaven/accelerated-possession-timetable-england` | Q&A | England | Section 21 | indexable; canonical present | 2026-02-10T17:48:04.404Z | High |
| `/ask-heaven/adding-tenant-to-existing-agreement` | Q&A | Unknown | Other | indexable; canonical present | 2026-02-10T17:48:08.133Z | Med |
| `/ask-heaven/ast-vs-periodic-tenancy-england` | Q&A | England | AST | indexable; canonical present | 2026-02-10T17:48:07.630Z | Med |
| `/ask-heaven/calculate-rent-arrears-and-interest` | Q&A | England | Other | indexable; canonical present | 2026-02-10T17:48:06.542Z | High |
| `/ask-heaven/can-i-evict-without-court-england` | Q&A | England | Other | indexable; canonical present | 2026-02-10T17:48:05.320Z | High |
| `/ask-heaven/claim-rent-arrears-from-deposit` | Q&A | England | Other | indexable; canonical present | 2026-02-10T17:48:07.401Z | High |
| `/ask-heaven/court-hearing-prepare-possession-england` | Q&A | England | Other | indexable; canonical present | 2026-02-10T17:48:04.804Z | High |
| `/ask-heaven/defended-possession-claim-s8-s21` | Q&A | England | Section 21 | indexable; canonical present | 2026-02-10T17:48:04.591Z | High |
| `/ask-heaven/guarantor-liability-for-rent-arrears` | Q&A | England | Other | indexable; canonical present | 2026-02-10T17:48:07.302Z | High |
| `/ask-heaven/how-to-serve-section-21-notice-england` | Q&A | England | Section 21 | indexable; canonical present | 2026-02-10T17:48:02.653Z | High |
| `/ask-heaven/joint-tenancy-ending-one-tenant-leaves` | Q&A | Unknown | Other | indexable; canonical present | 2026-02-10T17:48:08.027Z | Med |
| `/ask-heaven/mcol-process-for-rent-arrears-england` | Q&A | England | Money Claim | indexable; canonical present | 2026-02-10T17:48:07.046Z | High |
| `/ask-heaven/money-claim-after-tenant-moves-out` | Q&A | England | Money Claim | indexable; canonical present | 2026-02-10T17:48:07.220Z | High |
| `/ask-heaven/notice-seeking-possession-vs-eviction` | Q&A | England | Other | indexable; canonical present | 2026-02-10T17:48:06.121Z | High |
| `/ask-heaven/notice-to-leave-scotland-grounds` | Q&A | Scotland | AST | indexable; canonical present | 2026-02-10T17:48:09.200Z | High |
| `/ask-heaven/possession-order-what-happens-next` | Q&A | England | Other | indexable; canonical present | 2026-02-10T17:48:04.984Z | High |
| `/ask-heaven/renewing-fixed-term-tenancy-england` | Q&A | England | Other | indexable; canonical present | 2026-02-10T17:48:07.725Z | Med |
| `/ask-heaven/rent-arrears-and-section-8-grounds` | Q&A | England | Section 8 | indexable; canonical present | 2026-02-10T17:48:07.506Z | High |
| `/ask-heaven/rent-arrears-letter-before-action-england` | Q&A | England | Other | indexable; canonical present | 2026-02-10T17:48:06.452Z | High |
| `/ask-heaven/rent-increase-clause-best-practice-uk` | Q&A | UK-wide | Other | indexable; canonical present | 2026-02-10T17:48:08.225Z | Med |
| `/ask-heaven/repayment-plan-template-landlord-tenant` | Q&A | England | Other | indexable; canonical present | 2026-02-10T17:48:06.749Z | High |
| `/ask-heaven/scotland-eviction-court-process-tribunal` | Q&A | Scotland | AST | indexable; canonical present | 2026-02-10T17:48:09.408Z | High |
| `/ask-heaven/scotland-prt-notice-periods-2025` | Q&A | Scotland | AST | indexable; canonical present | 2026-02-10T17:48:09.295Z | High |
| `/ask-heaven/scotland-prt-vs-short-assured` | Q&A | Scotland | AST | indexable; canonical present | 2026-02-10T17:48:07.916Z | Med |
| `/ask-heaven/scotland-rent-arrears-prt-steps` | Q&A | Scotland | AST | indexable; canonical present | 2026-02-11T01:01:54.365Z | High |
| `/ask-heaven/scotland-serving-notice-to-leave` | Q&A | Scotland | Other | indexable; canonical present | 2026-02-10T17:48:09.500Z | High |
| `/ask-heaven/scotland-tenant-abandonment-prt` | Q&A | Scotland | AST | indexable; canonical present | 2026-02-10T17:48:09.603Z | High |
| `/ask-heaven/section-173-notice-wales-when-to-use` | Q&A | Wales | Other | indexable; canonical present | 2026-02-10T17:48:08.426Z | High |
| `/ask-heaven/section-173-validity-checklist-wales` | Q&A | Wales | Other | indexable; canonical present | 2026-02-10T17:48:08.995Z | High |
| `/ask-heaven/section-21-accelerated-possession-n5b-guide` | Q&A | England | Section 21 | indexable; canonical present | 2026-02-10T17:48:03.275Z | High |
| `/ask-heaven/section-21-after-fixed-term-periodic` | Q&A | England | Section 21 | indexable; canonical present | 2026-02-10T17:48:04.191Z | High |
| `/ask-heaven/section-21-and-deposit-protection-rules` | Q&A | England | Section 21 | indexable; canonical present | 2026-02-10T17:48:05.523Z | High |
| `/ask-heaven/section-21-gas-safety-epc-how-to-fix` | Q&A | England | Section 21 | indexable; canonical present | 2026-02-10T17:48:05.728Z | High |
| `/ask-heaven/section-21-reissue-after-expiry` | Q&A | England | Section 21 | indexable; canonical present | 2026-02-10T17:48:06.331Z | High |
| `/ask-heaven/section-21-validity-checklist-form-6a` | Q&A | England | Section 21 | indexable; canonical present | 2026-02-10T17:48:03.050Z | High |
| `/ask-heaven/section-8-ground-10-11-discretionary-arrears` | Q&A | England | Section 8 | indexable; canonical present | 2026-02-10T17:48:03.788Z | High |
| `/ask-heaven/section-8-ground-8-mandatory-arrears` | Q&A | England | Other | indexable; canonical present | 2026-02-10T17:48:03.578Z | High |
| `/ask-heaven/section-8-grounds-nuisance-anti-social` | Q&A | England | Section 8 | indexable; canonical present | 2026-02-10T17:48:05.934Z | High |
| `/ask-heaven/section-8-notice-periods-england-2025` | Q&A | England | Section 8 | indexable; canonical present | 2026-02-10T17:48:03.988Z | High |
| `/ask-heaven/small-claims-for-rent-arrears-evidence` | Q&A | England | Money Claim | indexable; canonical present | 2026-02-10T17:48:07.139Z | High |
| `/ask-heaven/tenancy-agreement-checklist-uk-landlord` | Q&A | UK-wide | AST | indexable; canonical present | 2026-02-10T17:48:08.330Z | Med |
| `/ask-heaven/wales-occupation-contract-notice-periods` | Q&A | Wales | AST | indexable; canonical present | 2026-02-10T17:48:08.517Z | High |
| `/ask-heaven/wales-occupation-contract-vs-tenancy` | Q&A | Wales | AST | indexable; canonical present | 2026-02-10T17:48:07.822Z | Med |
| `/ask-heaven/wales-occupation-contract-written-statement` | Q&A | Wales | AST | indexable; canonical present | 2026-02-10T17:48:08.712Z | High |
| `/ask-heaven/wales-possession-court-process-section-173` | Q&A | Wales | Other | indexable; canonical present | 2026-02-10T17:48:09.092Z | High |
| `/ask-heaven/wales-retaliatory-eviction-protection` | Q&A | Wales | Other | indexable; canonical present | 2026-02-10T17:48:08.617Z | High |
| `/ask-heaven/warrant-of-possession-bailiffs-eviction` | Q&A | England | Other | indexable; canonical present | 2026-02-10T17:48:05.118Z | High |
| `/ask-heaven/when-to-issue-money-claim-online-rent` | Q&A | England | Money Claim | indexable; canonical present | 2026-02-10T17:48:06.956Z | High |
| `/ask-heaven/when-to-use-section-8-form-3-grounds` | Q&A | England | Section 8 | indexable; canonical present | 2026-02-10T17:48:03.408Z | High |
| `/assured-shorthold-tenancy-agreement-template` | Template | England | AST | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/blog` | Blog | UK-wide | Section 21 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/blog/calculating-interest-tenant-debt` | Blog | Unknown | Money Claim | indexable; canonical present | 2026-01-15T00:00:00.000Z | High |
| `/blog/england-accelerated-possession` | Blog | England | Section 21 | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/england-assured-shorthold-tenancy-guide` | Blog | England | AST | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/england-bailiff-eviction` | Blog | England | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/england-county-court-forms` | Blog | England | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/england-deposit-protection` | Blog | England | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/england-hmo-licensing` | Blog | England | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/england-money-claim-online` | Blog | England/Wales | Money Claim | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/england-particulars-of-claim` | Blog | England | Money Claim | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/england-possession-hearing` | Blog | England | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/england-section-21-process` | Blog | England | Section 21 | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/england-section-8-ground-1` | Blog | England | Section 8 | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/england-section-8-ground-10-11` | Blog | England | Section 8 | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/england-section-8-ground-12` | Blog | England | Section 8 | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/england-section-8-ground-14` | Blog | England | Section 8 | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/england-section-8-ground-17` | Blog | England | Section 8 | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/england-section-8-ground-2` | Blog | England | Section 8 | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/england-section-8-ground-7` | Blog | England | Section 8 | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/england-section-8-ground-8` | Blog | England | Section 8 | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/england-section-8-process` | Blog | England | Section 21 | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/england-standard-possession` | Blog | England | Section 8 | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/fair-wear-tear-vs-tenant-damage` | Blog | Unknown | Other | indexable; canonical present | 2026-01-15T00:00:00.000Z | High |
| `/blog/how-long-does-eviction-take-uk` | Blog | UK-wide | Section 21 | indexable; canonical present | 2026-01-02T00:00:00.000Z | High |
| `/blog/how-long-does-money-claim-online-take` | Blog | Unknown | Money Claim | indexable; canonical present | 2026-01-15T00:00:00.000Z | High |
| `/blog/how-to-serve-eviction-notice` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-02T00:00:00.000Z | High |
| `/blog/how-to-write-letter-before-action-unpaid-rent` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-15T00:00:00.000Z | High |
| `/blog/northern-ireland-deposit-protection` | Blog | Northern Ireland | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/northern-ireland-eviction-process` | Blog | Northern Ireland | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/northern-ireland-landlord-registration` | Blog | Northern Ireland | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/northern-ireland-private-tenancies-order` | Blog | Northern Ireland | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/recovering-cleaning-costs-from-tenants` | Blog | Unknown | Other | indexable; canonical present | 2026-01-15T00:00:00.000Z | High |
| `/blog/rent-arrears-eviction-guide` | Blog | UK-wide | Section 8 | indexable; canonical present | 2026-01-02T00:00:00.000Z | High |
| `/blog/rent-smart-wales` | Blog | Wales | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/renters-reform-bill-what-landlords-need-to-know` | Blog | UK-wide | Section 21 | indexable; canonical present | 2026-01-02T00:00:00.000Z | High |
| `/blog/scotland-deposit-protection` | Blog | Scotland | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/scotland-eviction-ground-1` | Blog | Scotland | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/scotland-eviction-ground-11` | Blog | Scotland | AST | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/scotland-eviction-ground-12` | Blog | Scotland | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/scotland-eviction-ground-13` | Blog | Scotland | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/scotland-eviction-ground-14` | Blog | Scotland | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/scotland-eviction-ground-15` | Blog | Scotland | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/scotland-eviction-ground-3` | Blog | Scotland | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/scotland-eviction-ground-4` | Blog | Scotland | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/scotland-eviction-ground-6` | Blog | Scotland | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/scotland-eviction-ground-7` | Blog | Scotland | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/scotland-eviction-process` | Blog | Scotland | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/scotland-first-tier-tribunal` | Blog | Scotland | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/scotland-hmo-licensing` | Blog | Scotland | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/scotland-landlord-registration` | Blog | Scotland | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/scotland-notice-to-leave` | Blog | Scotland | AST | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/scotland-private-residential-tenancy` | Blog | Scotland | AST | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/scotland-repairing-standard` | Blog | Scotland | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/scotland-simple-procedure` | Blog | Scotland | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/section-21-vs-section-8` | Blog | UK-wide | Section 21 | indexable; canonical present | 2026-01-02T00:00:00.000Z | High |
| `/blog/should-you-accept-payment-plan-from-tenant` | Blog | Unknown | Other | indexable; canonical present | 2026-01-15T00:00:00.000Z | High |
| `/blog/small-claims-court-tips-landlords` | Blog | UK-wide | Money Claim | indexable; canonical present | 2026-01-15T00:00:00.000Z | High |
| `/blog/uk-buy-to-let-investment-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-corporate-letting-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-deposit-protection-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/uk-electrical-safety-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-electrical-safety-landlords` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/uk-end-of-tenancy-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/uk-epc-requirements-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-fire-safety-landlords` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/uk-furnished-unfurnished-letting-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-gas-safety-landlords` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/uk-guarantor-agreements-guide` | Blog | England/Wales | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-hmo-management-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-hmo-regulations-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/uk-holiday-let-regulations-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-landlord-associations-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-landlord-insurance-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/uk-landlord-licensing-guide` | Blog | Scotland | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-landlord-software-tools-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-landlord-tax-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/uk-landlord-tenant-communication` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-letting-agent-selection-guide` | Blog | England/Wales | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-money-claims-online-guide` | Blog | UK-wide | Money Claim | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-property-inspections-guide` | Blog | England/Wales | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/uk-property-inventory-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-property-maintenance-obligations` | Blog | England/Wales | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/uk-property-marketing-guide` | Blog | UK-wide | AST | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-property-portfolio-growth-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-rent-arrears-guide` | Blog | UK-wide | Section 8 | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/uk-rent-collection-methods-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-right-to-rent-checks` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/uk-right-to-rent-guide` | Blog | England | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-smoke-co-alarm-regulations-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-student-letting-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-tenancy-agreements-guide` | Blog | UK-wide | AST | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/uk-tenant-move-in-checklist-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-tenant-referencing-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/uk-tenant-retention-guide` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/uk-void-period-management-guide` | Blog | UK-wide | AST | indexable; canonical present | 2026-01-04T00:00:00.000Z | High |
| `/blog/wales-abandoned-property` | Blog | Wales | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/wales-anti-social-behaviour-possession` | Blog | Wales | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/wales-contract-holder-rights` | Blog | Wales | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/wales-deposit-protection` | Blog | Wales | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/wales-epc-requirements` | Blog | Wales | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/wales-eviction-process` | Blog | Wales | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/wales-fitness-human-habitation` | Blog | Wales | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/wales-gas-electrical-safety` | Blog | Wales | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/wales-hmo-licensing` | Blog | Wales | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/wales-joint-tenancies` | Blog | Wales | AST | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/wales-landlord-obligations-checklist` | Blog | Wales | AST | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/wales-notice-periods-landlords` | Blog | Wales | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/wales-possession-grounds` | Blog | Wales | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/wales-rent-increases` | Blog | Wales | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/wales-renting-homes-act` | Blog | Wales | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/wales-residential-property-tribunal` | Blog | Wales | Other | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/wales-standard-occupation-contract` | Blog | Wales | AST | indexable; canonical present | 2026-01-03T00:00:00.000Z | High |
| `/blog/what-is-county-court-judgment-landlords` | Blog | Unknown | Other | indexable; canonical present | 2026-01-15T00:00:00.000Z | High |
| `/blog/what-is-section-21-notice` | Blog | UK-wide | Section 21 | indexable; canonical present | 2026-01-02T00:00:00.000Z | High |
| `/blog/what-to-do-when-tenant-wont-pay` | Blog | UK-wide | Other | indexable; canonical present | 2026-01-15T00:00:00.000Z | High |
| `/blog/when-to-use-guarantor-clause-tenancy` | Blog | Unknown | AST | indexable; canonical present | 2026-01-15T00:00:00.000Z | High |
| `/contact` | Other | Unknown | Money Claim | indexable; canonical missing | - | Med |
| `/cookies` | Other | Unknown | Other | indexable; canonical missing | - | Low |
| `/county-court-claim-form-guide` | Guide | UK-wide | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/eicr-landlord-requirements` | Other | UK-wide | Other | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/eviction-cost-uk` | Guide | UK-wide | Other | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/eviction-notice` | Guide | England/Wales | Section 21 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/eviction-notice-template` | Template | UK-wide | Section 21 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/eviction-notice-uk` | Guide | Wales | Section 21 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/eviction-pack-england` | Guide | England | Section 21 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/eviction-process-england` | Guide | England | Section 21 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/eviction-process-scotland` | Guide | Scotland | Other | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/eviction-process-wales` | Guide | Wales | Other | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/fixed-term-periodic-tenancy-england` | Other | England | AST | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/fixed-term-tenancy-agreement-template` | Template | UK-wide | AST | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/form-3-section-8` | Other | England | Section 8 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/form-6a-section-21` | Other | England | Section 21 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/help` | Other | Unknown | AST | indexable; canonical missing | 2026-01-01T00:00:00.000Z | Med |
| `/how-to-evict-tenant` | Guide | England/Wales | Other | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/how-to-rent-guide` | Guide | UK-wide | Section 21 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/joint-tenancy-agreement-england` | Template | England | AST | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/joint-tenancy-agreement-template` | Template | England | AST | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/lodger-agreement-template` | Template | UK-wide | Other | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim` | Guide | England | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-abandoned-goods` | Guide | Unknown | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-appliance-damage` | Guide | Unknown | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-bathroom-damage` | Guide | Unknown | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-carpet-damage` | Guide | Unknown | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-ccj-enforcement` | Guide | Unknown | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-cleaning-costs` | Guide | Unknown | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-council-tax` | Guide | England | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-deposit-shortfall` | Guide | Unknown | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-early-termination` | Guide | England | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-former-tenant` | Guide | Unknown | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-garden-damage` | Guide | England | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-guarantor` | Guide | England | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-letter-before-action` | Guide | Unknown | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-n1-claim-form` | Guide | Unknown | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | Med |
| `/money-claim-online-mcol` | Guide | Unknown | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-pap-financial-statement` | Guide | Unknown | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | Med |
| `/money-claim-property-damage` | Guide | Unknown | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-schedule-of-debt` | Guide | Unknown | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | Med |
| `/money-claim-small-claims-landlord` | Guide | Unknown | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-tenant-defends` | Guide | Unknown | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-unpaid-bills` | Guide | England | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-unpaid-rent` | Guide | UK-wide | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-unpaid-utilities` | Guide | Unknown | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/money-claim-wall-damage` | Guide | Unknown | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/n5b-form-guide` | Guide | England | Other | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/ni-tenancy-agreement-template-free` | Template | Northern Ireland | AST | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/no-fault-eviction` | Guide | England | Section 21 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/northern-ireland-tenancy-agreement-template` | Template | Northern Ireland | AST | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/notice-to-quit-northern-ireland-guide` | Guide | Northern Ireland | Other | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/periodic-tenancy-agreement` | Template | UK-wide | AST | non-indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/possession-claim-guide` | Guide | England | Other | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/pre-action-protocol-debt` | Other | Unknown | Money Claim | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/pricing` | Other | Unknown | AST | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/privacy` | Other | Unknown | Other | indexable; canonical missing | - | Low |
| `/private-residential-tenancy-agreement-template` | Template | Scotland | AST | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/products/ast` | Product | England/Wales | AST | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/products/complete-pack` | Product | England | Section 21 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/products/money-claim` | Product | Unknown | Money Claim | non-indexable; canonical missing | 2026-01-01T00:00:00.000Z | Med |
| `/products/notice-only` | Product | England/Wales | AST | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/renew-tenancy-agreement-england` | Template | England | AST | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/rent-arrears-letter-template` | Template | UK-wide | Money Claim | indexable; canonical missing | 2026-01-01T00:00:00.000Z | High |
| `/rolling-tenancy-agreement` | Template | UK-wide | AST | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/scotland-eviction-notices` | Guide | Scotland | AST | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/scotland-notice-to-leave-template` | Template | Scotland | AST | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/section-21-ban` | Other | Unknown | Section 21 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/section-21-expired-what-next` | Guide | Unknown | Section 21 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/section-21-notice-template` | Template | England | Section 21 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/section-8-notice-template` | Template | England | Section 8 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/section-8-rent-arrears-eviction` | Guide | Unknown | Other | non-indexable; canonical missing | 2026-01-01T00:00:00.000Z | Med |
| `/section-8-vs-section-21` | Guide | Unknown | Section 21 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/tenancy-agreement-template-free` | Template | UK-wide | AST | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/tenant-damaging-property` | Other | UK-wide | Section 8 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/tenant-not-paying-rent` | Other | UK-wide | Section 8 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/tenant-wont-leave` | Other | England | Other | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/terms` | Other | Unknown | Other | indexable; canonical missing | - | Low |
| `/tools` | Tool | UK-wide | Other | indexable; canonical present | 2026-01-01T00:00:00.000Z | Med |
| `/tools/free-rent-demand-letter` | Tool | Unknown | Other | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/tools/free-section-21-notice-generator` | Tool | England | Section 21 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/tools/free-section-8-notice-generator` | Tool | England | Section 8 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/tools/hmo-license-checker` | Tool | England/Wales | Other | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/tools/rent-arrears-calculator` | Tool | UK-wide | Section 8 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/tools/validators` | Tool | Unknown | Section 21 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/tools/validators/section-21` | Tool | England | Section 21 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/tools/validators/section-8` | Tool | England | Section 8 | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/wales-eviction-notice-template` | Template | Wales | Other | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/wales-eviction-notices` | Guide | Wales | AST | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/wales-tenancy-agreement-template` | Template | Wales | AST | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |
| `/warrant-of-possession` | Other | UK-wide | Other | indexable; canonical present | 2026-01-01T00:00:00.000Z | High |

## 2) Cannibalisation Map
| Competing URL | Competes with product | Evidence (H1 + Title + Meta + Primary CTA proxy URL) | Severity | Why |
|---|---|---|---|---|
| `/6-month-tenancy-agreement-template` | `ast` | H1: 6 Month Tenancy Agreement Template<br>Title: 6 Month Tenancy Agreement Template UK 2026 — Short-Term AST | Landlord Heaven<br>Meta: Free 6 month tenancy agreement template for UK landlords. Short-term AST with notice periods, break clauses, and renewal options.<br>Primary CTA proxy: /tools | High | Transactional template/generator language; Primary routing not to matched product |
| `/ask-heaven` | `money-claim` | H1: Ask Heaven: Free UK Landlord Q&A Tool<br>Title: Free Landlord Legal Q&A | UK | Ask Heaven | Landlord Heaven<br>Meta: Free landlord Q&A for UK. Instant answers on evictions, rent arrears, tenancy agreements, and compliance across all jurisdictions.<br>Primary CTA proxy: /tools | High | Transactional template/generator language; Primary routing not to matched product |
| `/ask-heaven/accelerated-possession-timetable-england` | `notice-only` | H1: What is the accelerated possession timetable for England?<br>Title: What is the accelerated possession timetable for England? (England) | Ask Heaven | Landlord Heaven<br>Meta: Typical timelines for accelerated possession claims after Section 21 in England.<br>Primary CTA proxy: /products/complete-pack | High | Primary routing not to matched product |
| `/ask-heaven/defended-possession-claim-s8-s21` | `notice-only` | H1: What happens if my possession claim is defended?<br>Title: What happens if my possession claim is defended? (England) | Ask Heaven | Landlord Heaven<br>Meta: Guidance on defended possession claims under Section 8 or Section 21 in England.<br>Primary CTA proxy: /products/complete-pack | High | Primary routing not to matched product |
| `/ask-heaven/how-to-serve-section-21-notice-england` | `notice-only` | H1: How do I serve a Section 21 notice correctly in England?<br>Title: How do I serve a Section 21 notice correctly in England? (England) | Ask Heaven | Landlord Heaven<br>Meta: A practical overview of serving a valid Section 21 notice in England, with compliance checks and next steps.<br>Primary CTA proxy: /products/complete-pack | High | Primary routing not to matched product |
| `/ask-heaven/rent-arrears-and-section-8-grounds` | `notice-only` | H1: How do rent arrears affect Section 8 grounds?<br>Title: How do rent arrears affect Section 8 grounds? (England) | Ask Heaven | Landlord Heaven<br>Meta: Explains how arrears levels connect to Section 8 grounds in England.<br>Primary CTA proxy: /products/money-claim | High | Primary routing not to matched product |
| `/ask-heaven/scotland-rent-arrears-prt-steps` | `money-claim` | H1: What steps should I take for rent arrears in Scotland?<br>Title: What steps should I take for rent arrears in Scotland? (Scotland) | Ask Heaven | Landlord Heaven<br>Meta: Step-by-step guide for handling rent arrears under a Scotland PRT, including notices, evidence, negotiation, and tribunal next steps.<br>Primary CTA proxy: /products/ast | High | Primary routing not to matched product |
| `/ask-heaven/section-21-accelerated-possession-n5b-guide` | `notice-only` | H1: How does the N5B accelerated possession process work after Section 21?<br>Title: How does the N5B accelerated possession process work after Section 21? (England) | Ask Heaven | Landlord Heaven<br>Meta: Guide to the N5B accelerated possession route after serving Section 21 in England.<br>Primary CTA proxy: /products/complete-pack | High | Primary routing not to matched product |
| `/ask-heaven/section-21-after-fixed-term-periodic` | `notice-only` | H1: Can I serve Section 21 after a fixed term ends and the tenancy becomes periodic?<br>Title: Can I serve Section 21 after a fixed term ends and the tenancy becomes periodic? (England) | Ask Heaven | Landlord Heaven<br>Meta: Explains Section 21 use after a fixed term becomes periodic in England.<br>Primary CTA proxy: /products/complete-pack | High | Primary routing not to matched product |
| `/ask-heaven/section-21-and-deposit-protection-rules` | `notice-only` | H1: How does deposit protection affect Section 21 notices?<br>Title: How does deposit protection affect Section 21 notices? (England) | Ask Heaven | Landlord Heaven<br>Meta: Explains deposit protection requirements and Section 21 implications in England.<br>Primary CTA proxy: /products/complete-pack | High | Primary routing not to matched product |
| `/ask-heaven/section-21-gas-safety-epc-how-to-fix` | `notice-only` | H1: How do gas safety and EPC rules impact Section 21 in England?<br>Title: How do gas safety and EPC rules impact Section 21 in England? (England) | Ask Heaven | Landlord Heaven<br>Meta: Compliance checklist for gas safety and EPC before serving Section 21.<br>Primary CTA proxy: /products/complete-pack | High | Primary routing not to matched product |
| `/ask-heaven/section-21-reissue-after-expiry` | `notice-only` | H1: Can I reissue a Section 21 notice after it expires?<br>Title: Can I reissue a Section 21 notice after it expires? (England) | Ask Heaven | Landlord Heaven<br>Meta: Explains when and how to reissue Section 21 notices in England.<br>Primary CTA proxy: /products/complete-pack | High | Primary routing not to matched product |
| `/ask-heaven/section-21-validity-checklist-form-6a` | `notice-only` | H1: What is the Section 21 validity checklist for Form 6A?<br>Title: What is the Section 21 validity checklist for Form 6A? (England) | Ask Heaven | Landlord Heaven<br>Meta: A step-by-step checklist to ensure Form 6A Section 21 notices are valid in England.<br>Primary CTA proxy: /products/complete-pack | High | Primary routing not to matched product |
| `/ask-heaven/section-8-ground-10-11-discretionary-arrears` | `notice-only` | H1: How do Ground 10 and Ground 11 work for rent arrears?<br>Title: How do Ground 10 and Ground 11 work for rent arrears? (England) | Ask Heaven | Landlord Heaven<br>Meta: Explains discretionary rent arrears grounds under Section 8 in England.<br>Primary CTA proxy: /products/money-claim | High | Primary routing not to matched product |
| `/ask-heaven/section-8-grounds-nuisance-anti-social` | `notice-only` | H1: Can I use Section 8 for nuisance or anti-social behaviour?<br>Title: Can I use Section 8 for nuisance or anti-social behaviour? (England) | Ask Heaven | Landlord Heaven<br>Meta: Guidance on discretionary Section 8 grounds for nuisance in England.<br>Primary CTA proxy: /products/complete-pack | High | Primary routing not to matched product |
| `/ask-heaven/section-8-notice-periods-england-2025` | `notice-only` | H1: What notice periods apply to Section 8 in England?<br>Title: What notice periods apply to Section 8 in England? (England) | Ask Heaven | Landlord Heaven<br>Meta: A breakdown of Section 8 notice periods in England, updated for current rules.<br>Primary CTA proxy: /products/complete-pack | High | Primary routing not to matched product |
| `/ask-heaven/when-to-use-section-8-form-3-grounds` | `notice-only` | H1: When should I use a Section 8 notice (Form 3) and which grounds apply?<br>Title: When should I use a Section 8 notice (Form 3) and which grounds apply? (England) | Ask Heaven | Landlord Heaven<br>Meta: Overview of Section 8 Form 3 usage, with guidance on choosing the right grounds in England.<br>Primary CTA proxy: /products/complete-pack | High | Primary routing not to matched product |
| `/blog/calculating-interest-tenant-debt` | `money-claim` | H1: Calculating Interest on Tenant Debt: Landlord Guide<br>Title: Calculating Interest on Tenant Debt: Landlord Guide | Landlord Heaven<br>Meta: Learn how to calculate interest on tenant debt for court claims. Statutory 8% rate, calculation method, examples, and how to include in your money claim.<br>Primary CTA proxy: /products/notice-only | High | Primary routing not to matched product |
| `/blog/england-county-court-forms` | `complete-pack` | H1: County Court Eviction Forms Explained - N5, N5B, N119<br>Title: County Court Eviction Forms Explained - N5, N5B, N119 | Landlord Heaven<br>Meta: County court eviction forms explained. N5, N5B, N119, N325 forms for landlord possession claims. Which form to use and how to complete them correctly.<br>Primary CTA proxy: /products/notice-only | High | Primary routing not to matched product |
| `/blog/scotland-eviction-ground-11` | `ast` | H1: Scotland Ground 11 - Breach of Tenancy Agreement Guide<br>Title: Scotland Ground 11 - Breach of Tenancy Agreement Guide | Landlord Heaven<br>Meta: Scotland Ground 11 eviction guide for breach of tenancy. Learn what constitutes breach, evidence needed, and Tribunal process for . Get the Scotland steps an...<br>Primary CTA proxy: /products/notice-only | High | Primary routing not to matched product |
| `/blog/scotland-eviction-ground-12` | `money-claim` | H1: Scotland Ground 12 - Rent Arrears Eviction Guide<br>Title: Scotland Ground 12 - Rent Arrears Eviction Guide | Landlord Heaven<br>Meta: Scotland Ground 12 rent arrears eviction guide. Learn mandatory vs discretionary grounds, notice periods, and Tribunal process for . Get the Scotland steps a...<br>Primary CTA proxy: /products/notice-only | High | Primary routing not to matched product |
| `/blog/scotland-notice-to-leave` | `ast` | H1: Scotland Notice to Leave - Complete Guide<br>Title: Scotland Notice to Leave - Complete Guide | Landlord Heaven<br>Meta: How to serve a Notice to Leave in Scotland. Guide to notice periods, prescribed forms, service methods, and requirements for PRT evictions. Get the Scotland...<br>Primary CTA proxy: /products/notice-only | High | Primary routing not to matched product |
| `/blog/scotland-private-residential-tenancy` | `ast` | H1: Private Residential Tenancy (PRT) Guide - Scotland<br>Title: Private Residential Tenancy (PRT) Guide - Scotland | Landlord Heaven<br>Meta: Scotland Private Residential Tenancy (PRT) guide for landlords. Learn PRT rules, notice periods, rent increases, and eviction grounds in . Get the Scotland s...<br>Primary CTA proxy: /products/notice-only | High | Primary routing not to matched product |
| `/blog/scotland-simple-procedure` | `money-claim` | H1: Simple Procedure Scotland - Recovering Rent Arrears Guide<br>Title: Simple Procedure Scotland - Recovering Rent Arrears Guide | Landlord Heaven<br>Meta: Scotland Simple Procedure guide for landlords. Recover rent arrears up to ,000 through the Sheriff Court. Step-by-step process . Get the Scotland steps and c...<br>Primary CTA proxy: /products/notice-only | High | Primary routing not to matched product |
| `/blog/uk-property-marketing-guide` | `ast` | H1: UK Property Marketing - Complete Landlord Guide<br>Title: UK Property Marketing - Complete Landlord Guide | Landlord Heaven<br>Meta: UK property marketing guide for landlords . Photography tips, listing strategies, and proven tactics to find quality tenants faster. Get the UK steps and cho...<br>Primary CTA proxy: /products/notice-only | High | Primary routing not to matched product |
| `/blog/uk-void-period-management-guide` | `ast` | H1: UK Void Period Management - Complete Landlord Guide<br>Title: UK Void Period Management - Complete Landlord Guide | Landlord Heaven<br>Meta: UK void period management guide . Minimise empty property time, reduce lost rent, and find tenants faster with expert strategies for UK landlords.<br>Primary CTA proxy: /products/notice-only | High | Primary routing not to matched product |
| `/blog/wales-joint-tenancies` | `ast` | H1: Joint Occupation Contracts Wales - Complete Guide<br>Title: Joint Occupation Contracts Wales - Complete Guide | Landlord Heaven<br>Meta: Complete guide to joint occupation contracts in Wales. Joint liability, adding tenants, succession, and managing joint tenancies. Get the Wales steps and cho...<br>Primary CTA proxy: /products/notice-only | High | Primary routing not to matched product |
| `/blog/wales-landlord-obligations-checklist` | `ast` | H1: Wales Landlord Obligations - Complete Checklist<br>Title: Wales Landlord Obligations - Complete Checklist | Landlord Heaven<br>Meta: Complete checklist of Wales landlord obligations. Safety certificates, Rent Smart Wales, occupation contracts, and compliance requirements. Get the Wales ste...<br>Primary CTA proxy: /products/notice-only | High | Primary routing not to matched product |
| `/county-court-claim-form-guide` | `money-claim` | H1: County Court Claim Form Guide UK<br>Title: County Court Claim Form Guide UK 2026 — N1, N5, N5B Forms Explained | Landlord Heaven<br>Meta: Guide to county court claim forms for UK landlords. N1 for money claims, N5 for possession, N5B for accelerated. Fees and process explained.<br>Primary CTA proxy: /products/complete-pack | High | Primary routing not to matched product |
| `/eviction-notice` | `notice-only` | H1: Eviction Notice Generator<br>Title: Eviction Notice Generator 2026 | England, Wales & Scotland | £49.99 | Landlord Heaven<br>Meta: Generate procedurally correct eviction notices for England (Section 21, Section 8), Wales (Section 173/181 under Renting Homes Wales Act 2016), and Scotland (Notice to Leave). Correct notice type, statutory wording, and notice periods. Official forms included.<br>Primary CTA proxy: /tools | High | Transactional template/generator language; Primary routing not to matched product |
| `/eviction-notice-template` | `notice-only` | H1: Eviction Notice Template UK<br>Title: Eviction Notice Template UK - Possession Notice Download | Landlord Heaven<br>Meta: Download free UK eviction notice templates. Section 21 and Section 8 notices. Court-ready documents trusted by 10,000+ landlords.<br>Primary CTA proxy: /wizard?product=notice_only&src=template&topic=eviction | High | Transactional template/generator language; Primary routing not to matched product |
| `/eviction-pack-england` | `notice-only` | H1: Complete Eviction Bundle – England Only<br>Title: Complete Eviction Bundle 2026 – England | N5, N5B, N119 + Particulars of Claim | £199.99 | Landlord Heaven<br>Meta: End-to-end eviction paperwork for England: Section 21 notice + N5B, or Section 8 notice + N5 + N119 Particulars of Claim. We create the full court route — not just the notice. All forms mapped and validated.<br>Primary CTA proxy: /tools | High | Transactional template/generator language; Primary routing not to matched product |
| `/fixed-term-periodic-tenancy-england` | `ast` | H1: Fixed Term vs Periodic Tenancy<br>Title: Fixed Term vs Periodic Tenancy Agreement (England) | Which to Use | Landlord Heaven<br>Meta: Fixed term vs periodic tenancy agreements in England. Which type suits your letting situation and how to structure your AST.<br>Primary CTA proxy: /section-21-notice-template | High | Primary routing not to matched product |
| `/fixed-term-tenancy-agreement-template` | `ast` | H1: Fixed Term Tenancy Agreement Template<br>Title: Fixed Term Tenancy Agreement UK 2026 — AST Template & Guide | Landlord Heaven<br>Meta: Fixed term tenancy agreement template for UK landlords. 6, 12, and 24 month terms, break clauses, renewal, and end of term options.<br>Primary CTA proxy: /wizard?product=ast_standard&jurisdiction=england&src=template | High | Transactional template/generator language; Primary routing not to matched product |
| `/form-3-section-8` | `notice-only` | H1: Form 3: Section 8 Notice for England<br>Title: Form 3 Section 8 Notice | Download & Guide 2026 | Landlord Heaven<br>Meta: Form 3 is the prescribed Section 8 notice for England. Eviction grounds, notice periods, and how to complete it correctly.<br>Primary CTA proxy: /products/complete-pack | High | Transactional template/generator language; Primary routing not to matched product |
| `/how-to-rent-guide` | `notice-only` | H1: How to Rent Guide: Landlord Requirements<br>Title: How to Rent Guide | Landlord Requirements UK 2026 | Landlord Heaven<br>Meta: Guide to the How to Rent checklist for landlords. When to provide it, which version to use. Essential for valid Section 21 notices.<br>Primary CTA proxy: /tools | High | Primary routing not to matched product |
| `/joint-tenancy-agreement-england` | `ast` | H1: Joint Tenancy Agreement<br>Title: Joint Tenancy Agreement (England) | Multiple Tenants AST | Landlord Heaven<br>Meta: Create a joint tenancy agreement for multiple tenants in England. Includes joint and several liability protection for landlords letting to sharers.<br>Primary CTA proxy: /section-21-notice-template | High | Primary routing not to matched product |
| `/joint-tenancy-agreement-template` | `ast` | H1: Joint Tenancy Agreement Template<br>Title: Joint Tenancy Agreement Template UK 2026 | Multiple Tenants AST | Landlord Heaven<br>Meta: Create a joint tenancy agreement for multiple tenants in England. Joint and several liability clauses included. From £14.99.<br>Primary CTA proxy: /products/notice-only | High | Transactional template/generator language; Primary routing not to matched product |
| `/money-claim` | `money-claim` | H1: Money Claim Pack — England Only<br>Title: Money Claim Pack 2026 | Form N1 Generator | Daily Interest Rate | England Only | £99.99 | Landlord Heaven<br>Meta: Generate Form N1 claim form for rent arrears, property damage, cleaning costs, and contractual sums. England only. Automatic interest calculation with daily rate. Figures consistent across all documents. County court filing guide included.<br>Primary CTA proxy: /tools | High | Transactional template/generator language; Primary routing not to matched product |
| `/n5b-form-guide` | `complete-pack` | H1: N5B Form Guide — Accelerated Possession<br>Title: N5B Form Guide UK — Accelerated Possession Procedure (2026) | Landlord Heaven<br>Meta: Complete guide to Form N5B for accelerated possession in England. When to use it, how to fill it in, and what to expect from the court process.<br>Primary CTA proxy: /wizard?product=complete_pack&jurisdiction=england&src=guide&topic=eviction | High | Primary routing not to matched product |
| `/periodic-tenancy-agreement` | `ast` | H1: Rolling Tenancy Agreement UK<br>Title: Rolling Tenancy Agreement UK | Month-to-Month Guide 2026 | Landlord Heaven<br>Meta: Guide to rolling tenancy agreements (periodic tenancies) in the UK. How they work, notice periods, rent increases, and ending them.<br>Primary CTA proxy: /products/notice-only | High | Primary routing not to matched product |
| `/possession-claim-guide` | `complete-pack` | H1: Possession Claim Guide UK<br>Title: Possession Claim Guide UK — How to Apply for Court Possession (2026) | Landlord Heaven<br>Meta: Complete guide to applying for a court possession order in England. Form N5, N5B, hearing process, and timelines explained for UK landlords.<br>Primary CTA proxy: /wizard?product=complete_pack&jurisdiction=england&src=guide&topic=eviction | High | Primary routing not to matched product |
| `/pricing` | `notice-only` | H1: Simple, Transparent Pricing<br>Title: Pricing - Compare All Products | Landlord Heaven<br>Meta: Compare Landlord Heaven pricing. Eviction notices £49.99, tenancy agreements from £14.99. All one-time payments, no subscriptions.<br>Primary CTA proxy: /tools | High | Primary routing not to matched product |
| `/renew-tenancy-agreement-england` | `ast` | H1: Renewing or Updating a Tenancy Agreement<br>Title: Renewing or Updating a Tenancy Agreement (England) | Landlord Guide | Landlord Heaven<br>Meta: How to renew or update an AST in England. Learn when to issue a new agreement, how to change terms, and what documents to provide at renewal.<br>Primary CTA proxy: /tools | High | Primary routing not to matched product |
| `/rent-arrears-letter-template` | `money-claim` | H1: Rent Arrears Letter Template<br>Title: Rent Arrears Letter Template - Free Download | Landlord Heaven<br>Meta: Download a free rent arrears letter template. Formal demand letters for unpaid rent. Escalate to money claim or eviction. Trusted by 10,000+ UK landlords.<br>Primary CTA proxy: /products/complete-pack | High | Transactional template/generator language; Primary routing not to matched product |
| `/rolling-tenancy-agreement` | `ast` | H1: Rolling Tenancy Agreement UK<br>Title: Rolling Tenancy Agreement UK | Month-to-Month Guide 2026 | Landlord Heaven<br>Meta: Guide to rolling tenancy agreements (periodic tenancies) in the UK. How they work, notice periods, rent increases, and ending them.<br>Primary CTA proxy: /products/notice-only | High | Primary routing not to matched product |
| `/scotland-notice-to-leave-template` | `ast` | H1: Scotland Notice to Leave Template (PRT)<br>Title: Scotland Notice to Leave Template 2026 | PRT Eviction Landlords | Landlord Heaven<br>Meta: Scotland Notice to Leave template under the PRT. Generate notices citing 18 eviction grounds with correct notice periods.<br>Primary CTA proxy: /scotland-eviction-notices | High | Transactional template/generator language; Primary routing not to matched product |
| `/section-21-expired-what-next` | `notice-only` | H1: Section 21 Expired?Here's What to Do Next<br>Title: Section 21 Expired What Next? | Tenant Ignored Notice | Landlord Heaven | Landlord Heaven<br>Meta: Section 21 expired but tenant won't leave? Next steps: possession order, accelerated procedure, and bailiff enforcement.<br>Primary CTA proxy: /products/complete-pack | High | Primary routing not to matched product |
| `/tenant-damaging-property` | `notice-only` | H1: Tenant Damaging Property: Your Options<br>Title: Tenant Damaging Property | Landlord Rights & Actions UK 2026 | Landlord Heaven<br>Meta: What to do when a tenant damages your property. Learn about your legal options including Section 8 eviction, deposit deductions, and money claims for damages.<br>Primary CTA proxy: /products/money-claim | High | Primary routing not to matched product |
| `/tenant-not-paying-rent` | `notice-only` | H1: Tenant Not Paying Rent?<br>Title: Tenant Not Paying Rent? Your Options Explained (UK 2026) | Landlord Heaven<br>Meta: What to do when your tenant stops paying rent. Rent demand letters, Section 8 eviction, and money claims through court explained.<br>Primary CTA proxy: /products/money-claim | High | Primary routing not to matched product |
| `/tenant-wont-leave` | `notice-only` | H1: Tenant Won't Leave After Notice?<br>Title: Tenant Won't Leave After Notice? What to Do Next (UK) | Landlord Heaven<br>Meta: What to do when your tenant refuses to leave after an eviction notice in England. Legal options, court possession process, and bailiff enforcement explained.<br>Primary CTA proxy: /products/complete-pack | High | Primary routing not to matched product |
| `/tools` | `notice-only` | H1: Free Tools for UK Landlords<br>Title: Free Landlord Tools UK | Calculators, Generators & Checkers | Landlord Heaven<br>Meta: Free tools for UK landlords: rent arrears calculator, eviction notice generators, HMO checker, and notice validators.<br>Primary CTA proxy: /tools | High | Transactional template/generator language; Primary routing not to matched product |
| `/tools/free-rent-demand-letter` | `money-claim` | H1: Rent Demand Letter Generator<br>Title: Free Rent Demand Letter Template | Formal Arrears Letter Generator | Landlord Heaven<br>Meta: Generate a free rent demand letter for your tenant. Professional template that formally requests payment of rent arrears. Download as PDF or Word document.<br>Primary CTA proxy: /products/money-claim | High | Transactional template/generator language; Tool can substitute paid flow |
| `/tools/free-section-21-notice-generator` | `notice-only` | H1: Create a Section 21 Notice Template (England)<br>Title: Free Section 21 Notice Generator | Create Form 6A Online | Landlord Heaven<br>Meta: Generate a free Section 21 notice (Form 6A) for England. Our generator creates a valid no-fault eviction notice with correct notice periods. Download as PDF instantly.<br>Primary CTA proxy: /products/notice-only | High | Transactional template/generator language; Tool can substitute paid flow |
| `/tools/free-section-8-notice-generator` | `notice-only` | H1: Create a Section 8 Notice Template (England)<br>Title: Free Section 8 Notice Generator | Create Form 3 Online | Landlord Heaven<br>Meta: Generate a free Section 8 notice (Form 3) for England. Select your grounds, enter arrears details, and download a valid eviction notice. Covers Ground 8, 10, 11 and more.<br>Primary CTA proxy: /products/notice-only | High | Transactional template/generator language; Tool can substitute paid flow |
| `/tools/rent-arrears-calculator` | `notice-only` | H1: Rent Arrears Calculator<br>Title: Rent Arrears Calculator UK | Calculate What Your Tenant Owes | Landlord Heaven<br>Meta: Free rent arrears calculator for UK landlords. Calculate total arrears, statutory interest at 8%, and check if you meet Section 8 Ground 8 thresholds. Instant results.<br>Primary CTA proxy: /products/money-claim | High | Transactional template/generator language; Primary routing not to matched product |
| `/tools/validators` | `notice-only` | H1: Eviction Notice Validity Checker<br>Title: Eviction Notice Validity Checker | Check Your Notice is Valid | Landlord Heaven<br>Meta: Free eviction notice validity checker. Upload your Section 21 or Section 8 notice and we'll check it meets all legal requirements. Instant results with fix suggestions.<br>Primary CTA proxy: /tools | High | Transactional template/generator language; Primary routing not to matched product |
| `/ask-heaven/repayment-plan-template-landlord-tenant` | `money-claim` | H1: How should I structure a rent arrears repayment plan?<br>Title: How should I structure a rent arrears repayment plan? (England) | Ask Heaven | Landlord Heaven<br>Meta: Best-practice repayment plan guidance for landlords and tenants in England.<br>Primary CTA proxy: /products/money-claim | Med | Transactional template/generator language |
| `/assured-shorthold-tenancy-agreement-template` | `ast` | H1: Assured Shorthold Tenancy Agreement Template<br>Title: Assured Shorthold Tenancy Agreement Template 2026 | Legally Compliant AST | Landlord Heaven<br>Meta: Download an Assured Shorthold Tenancy Agreement (AST) template for England. Housing Act 1988 & Tenant Fees Act 2019 compliant. From £14.99.<br>Primary CTA proxy: /products/ast | Med | Transactional template/generator language |
| `/blog` | `notice-only` | H1: Landlord GuidesLandlord Guidesbuilt for confident decisionsbuilt for confident decisions<br>Title: Landlord Guides & Legal Resources | Landlord Heaven<br>Meta: Expert guides for UK landlords on evictions, Section 21, Section 8, tenancy law, rent arrears, and property management. Free legal advice from property experts.<br>Primary CTA proxy: /products/notice-only | Med | Transactional template/generator language |
| `/blog/how-to-write-letter-before-action-unpaid-rent` | `money-claim` | H1: How to Write a Letter Before Action for Unpaid Rent (<br>Title: How to Write a Letter Before Action for Unpaid Rent ( | Landlord Heaven<br>Meta: Write a compliant Letter Before Action for unpaid rent. Free template, examples, and step-by-step guide for UK landlords pursuing tenant debt through court.<br>Primary CTA proxy: /products/money-claim | Med | Transactional template/generator language |
| `/eviction-notice-uk` | `notice-only` | H1: Eviction Notice UK: Complete Guide for Landlords<br>Title: Eviction Notice UK | Types, Templates & How to Serve [2026] | Landlord Heaven<br>Meta: Guide to eviction notices in the UK. Covers Section 21, Section 8, Scotland Notice to Leave, and Wales notices. Free templates.<br>Primary CTA proxy: /products/notice-only | Med | Transactional template/generator language |
| `/form-6a-section-21` | `notice-only` | H1: Form 6A: Section 21 Notice for England<br>Title: Form 6A Section 21 Notice | Download & Guide 2026 | Landlord Heaven<br>Meta: Form 6A is the prescribed Section 21 notice for England. Download the official form or generate a pre-filled notice instantly.<br>Primary CTA proxy: /products/notice-only | Med | Transactional template/generator language |
| `/money-claim-letter-before-action` | `money-claim` | H1: Letter Before Action Guide<br>Title: Letter Before Action Template for Landlords 2026 | Pre-Action Protocol | Landlord Heaven<br>Meta: Free guide to writing a Letter Before Action for tenant debt claims. What to include, when to send, and Pre-Action Protocol requirements.<br>Primary CTA proxy: /products/money-claim | Med | Transactional template/generator language |
| `/money-claim-schedule-of-debt` | `money-claim` | H1: Schedule of Debt Guide<br>Title: Schedule of Debt Template for Landlords 2026 | Rent Arrears Breakdown | Landlord Heaven<br>Meta: How to create a Schedule of Debt for tenant money claims. Template and examples for rent arrears, damage costs, and other landlord claims.<br>Primary CTA proxy: /products/money-claim | Med | Transactional template/generator language |
| `/ni-tenancy-agreement-template-free` | `ast` | H1: Free NI Tenancy Agreement Templates: Are They Worth the Risk?<br>Title: Free Northern Ireland Tenancy Agreement Template 2026 | Comparison & Risks | Landlord Heaven<br>Meta: Looking for a free NI tenancy agreement template? Compare free vs professional options and understand the legal risks under the Private Tenancies Act 2022.<br>Primary CTA proxy: /products/ast | Med | Transactional template/generator language |
| `/northern-ireland-tenancy-agreement-template` | `ast` | H1: Northern Ireland Tenancy Agreement Template 2026<br>Title: Northern Ireland Tenancy Agreement Template 2026 | Private Tenancies Act Compliant | Landlord Heaven<br>Meta: Create a legally compliant NI tenancy agreement for 2026. Updated for the Private Tenancies Act (NI) 2022 with all prescribed terms.<br>Primary CTA proxy: /products/ast | Med | Transactional template/generator language |
| `/pre-action-protocol-debt` | `money-claim` | H1: Pre-Action Protocol for Debt Claims<br>Title: Pre-Action Protocol for Debt Claims | Landlord Guide 2026 | Landlord Heaven<br>Meta: Guide to the Pre-Action Protocol for Debt Claims. Required before money claims for rent arrears. Letter templates included.<br>Primary CTA proxy: /products/money-claim | Med | Transactional template/generator language |
| `/private-residential-tenancy-agreement-template` | `ast` | H1: Private Residential Tenancy Agreement Template<br>Title: Private Residential Tenancy Agreement Template Scotland 2026 | PRT Download | Landlord Heaven<br>Meta: Download a Private Residential Tenancy (PRT) agreement for Scotland. Private Housing (Tenancies) Act 2016 compliant. From £14.99.<br>Primary CTA proxy: /products/ast | Med | Transactional template/generator language |
| `/section-21-ban` | `notice-only` | H1: Section 21 Ends 1 May 2026<br>Title: Section 21 Ban 2026 - Act Before May | Landlord Heaven<br>Meta: Section 21 no-fault evictions end 1 May 2026. Generate your court-ready notice before the deadline. Only days left to act.<br>Primary CTA proxy: /products/notice-only | Med | Transactional template/generator language |
| `/section-21-notice-template` | `notice-only` | H1: Section 21 Notice Template (England) / Court-Ready Form 6A<br>Title: Section 21 Notice Template 2026 for Landlords | Free Form 6A | Landlord Heaven<br>Meta: Section 21 notice template for landlords. Build a court-ready Form 6A to avoid delays and invalid notices. Free template available.<br>Primary CTA proxy: /products/notice-only | Med | Transactional template/generator language |
| `/section-8-notice-template` | `notice-only` | H1: Section 8 Notice (Form 3) — Free Template for England<br>Title: Section 8 Notice Template 2026 for Landlords | Free Form 3 | Landlord Heaven<br>Meta: Section 8 notice template for grounds-based eviction. Avoid delays and compliance errors. Free Form 3 template included.<br>Primary CTA proxy: /products/notice-only | Med | Transactional template/generator language |
| `/section-8-vs-section-21` | `notice-only` | H1: Section 8 vs Section 21:Which Should You Use?<br>Title: Section 8 vs Section 21 | Which Eviction Notice to Use | Landlord Heaven | Landlord Heaven<br>Meta: Section 8 vs Section 21: which eviction notice should you use? Compare notice periods, court process, grounds, and costs. Get court-ready notices from £49.99.<br>Primary CTA proxy: /products/notice-only | Med | Transactional template/generator language |
| `/tenancy-agreement-template-free` | `ast` | H1: Free Tenancy Agreement Templates vs Paid: An Honest Comparison<br>Title: Free Tenancy Agreement Template UK vs Paid: What You Need to Know 2026 | Landlord Heaven<br>Meta: Comparing free tenancy agreement templates vs professionally drafted ASTs. What free templates miss and why £14.99 is worth it.<br>Primary CTA proxy: /products/ast | Med | Transactional template/generator language |
| `/tools/validators/section-21` | `notice-only` | H1: Check Your Section 21 Notice (England)<br>Title: Free Section 21 Validity Checker (England) – Check My Notice | Landlord Heaven<br>Meta: Free Section 21 checker for England. Upload your Form 6A for instant validation. Checks deposits, gas safety, EPC, and notice periods.<br>Primary CTA proxy: /products/notice-only | Med | Transactional template/generator language |
| `/tools/validators/section-8` | `notice-only` | H1: Check Your Section 8 Notice Grounds (England)<br>Title: Free Section 8 Notice Checker (England) – Check Your Grounds | Landlord Heaven<br>Meta: Free Section 8 checker for England. Upload your notice for instant validation. Checks Form 3, grounds for possession, and notice periods.<br>Primary CTA proxy: /products/notice-only | Med | Transactional template/generator language |
| `/wales-eviction-notice-template` | `notice-only` | H1: Wales Eviction Notice Template (Renting Homes Act)<br>Title: Wales Eviction Notice Template 2026 | Renting Homes Act Landlords | Landlord Heaven<br>Meta: Wales eviction notice template under the Renting Homes Act. Generate Section 173 or fault-based possession notices for Welsh landlords.<br>Primary CTA proxy: /products/notice-only | Med | Transactional template/generator language |
| `/wales-tenancy-agreement-template` | `ast` | H1: Wales Tenancy Agreement Template<br>Title: Wales Tenancy Agreement Template 2026 | Occupation Contract Download | Landlord Heaven<br>Meta: Download a tenancy agreement template for Wales. Occupation Contracts replaced ASTs in 2022. Renting Homes Act compliant. From £14.99.<br>Primary CTA proxy: /products/ast | Med | Transactional template/generator language |
| `/apply-possession-order-landlord` | `complete-pack` | H1: Apply for a Possession Order<br>Title: Apply for Possession Order | Landlord Court Forms N5B N5 | Landlord Heaven | Landlord Heaven<br>Meta: How to apply for a possession order in England. Step-by-step guide to Form N5B (accelerated) and Form N5 (standard). Court fees, timelines, and what to expect.<br>Primary CTA proxy: /products/complete-pack | Low | Informational overlap with product intent |
| `/ask-heaven/ast-vs-periodic-tenancy-england` | `ast` | H1: What is the difference between an AST and a periodic tenancy?<br>Title: What is the difference between an AST and a periodic tenancy? | Ask Heaven | Landlord Heaven<br>Meta: Explains how ASTs become periodic and what that means for landlords.<br>Primary CTA proxy: /products/ast | Low | Informational overlap with product intent |
| `/ask-heaven/calculate-rent-arrears-and-interest` | `money-claim` | H1: How do I calculate rent arrears and interest?<br>Title: How do I calculate rent arrears and interest? (England) | Ask Heaven | Landlord Heaven<br>Meta: Guidance on calculating rent arrears totals and interest for England claims.<br>Primary CTA proxy: /products/money-claim | Low | Informational overlap with product intent |
| `/ask-heaven/claim-rent-arrears-from-deposit` | `money-claim` | H1: Can I claim rent arrears from the deposit?<br>Title: Can I claim rent arrears from the deposit? (England) | Ask Heaven | Landlord Heaven<br>Meta: Guidance on using deposit funds for rent arrears in England.<br>Primary CTA proxy: /products/money-claim | Low | Informational overlap with product intent |
| `/ask-heaven/guarantor-liability-for-rent-arrears` | `money-claim` | H1: Is a guarantor liable for rent arrears?<br>Title: Is a guarantor liable for rent arrears? (England) | Ask Heaven | Landlord Heaven<br>Meta: Explains guarantor liability for rent arrears and enforcement steps in England.<br>Primary CTA proxy: /products/money-claim | Low | Informational overlap with product intent |
| `/ask-heaven/mcol-process-for-rent-arrears-england` | `money-claim` | H1: How does the MCOL process work for rent arrears?<br>Title: How does the MCOL process work for rent arrears? (England) | Ask Heaven | Landlord Heaven<br>Meta: Step-by-step explanation of the MCOL process in England for arrears.<br>Primary CTA proxy: /products/money-claim | Low | Informational overlap with product intent |
| `/ask-heaven/money-claim-after-tenant-moves-out` | `money-claim` | H1: Can I claim rent arrears after the tenant moves out?<br>Title: Can I claim rent arrears after the tenant moves out? (England) | Ask Heaven | Landlord Heaven<br>Meta: Explains how to pursue rent arrears after move-out in England.<br>Primary CTA proxy: /products/money-claim | Low | Informational overlap with product intent |
| `/ask-heaven/notice-to-leave-scotland-grounds` | `ast` | H1: What grounds can I use for a Notice to Leave in Scotland?<br>Title: What grounds can I use for a Notice to Leave in Scotland? (Scotland) | Ask Heaven | Landlord Heaven<br>Meta: Overview of Notice to Leave grounds for Scotland PRTs.<br>Primary CTA proxy: /products/ast | Low | Informational overlap with product intent |
| `/ask-heaven/possession-order-what-happens-next` | `complete-pack` | H1: What happens after I get a possession order in England?<br>Title: What happens after I get a possession order in England? (England) | Ask Heaven | Landlord Heaven<br>Meta: Explains the steps after a possession order, including enforcement options.<br>Primary CTA proxy: /products/complete-pack | Low | Informational overlap with product intent |
| `/ask-heaven/rent-arrears-letter-before-action-england` | `money-claim` | H1: Should I send a rent arrears letter before action?<br>Title: Should I send a rent arrears letter before action? (England) | Ask Heaven | Landlord Heaven<br>Meta: How to use a rent arrears letter before action in England to document arrears.<br>Primary CTA proxy: /products/money-claim | Low | Informational overlap with product intent |
| `/ask-heaven/scotland-eviction-court-process-tribunal` | `ast` | H1: How does the eviction tribunal process work in Scotland?<br>Title: How does the eviction tribunal process work in Scotland? (Scotland) | Ask Heaven | Landlord Heaven<br>Meta: Explains the Tribunal process for Scotland PRT possession claims.<br>Primary CTA proxy: /products/ast | Low | Informational overlap with product intent |
| `/ask-heaven/scotland-prt-notice-periods-2025` | `ast` | H1: What notice periods apply to Scotland PRTs?<br>Title: What notice periods apply to Scotland PRTs? (Scotland) | Ask Heaven | Landlord Heaven<br>Meta: Notice period guidance for Scotland PRT Notice to Leave steps.<br>Primary CTA proxy: /products/ast | Low | Informational overlap with product intent |
| `/ask-heaven/scotland-prt-vs-short-assured` | `ast` | H1: What is the difference between a PRT and a short assured tenancy in Scotland?<br>Title: What is the difference between a PRT and a short assured tenancy in Scotland? | Ask Heaven | Landlord Heaven<br>Meta: Explains Scotland’s PRT system compared to older short assured tenancies.<br>Primary CTA proxy: /products/ast | Low | Informational overlap with product intent |
| `/ask-heaven/scotland-tenant-abandonment-prt` | `ast` | H1: What should I do if a tenant abandons a PRT in Scotland?<br>Title: What should I do if a tenant abandons a PRT in Scotland? (Scotland) | Ask Heaven | Landlord Heaven<br>Meta: Guidance on handling possible abandonment in Scotland PRTs.<br>Primary CTA proxy: /products/ast | Low | Informational overlap with product intent |
| `/ask-heaven/section-8-ground-8-mandatory-arrears` | `money-claim` | H1: How do I rely on Ground 8 for rent arrears in England?<br>Title: How do I rely on Ground 8 for rent arrears in England? (England) | Ask Heaven | Landlord Heaven<br>Meta: Ground 8 overview for rent arrears, with evidence and notice tips for England.<br>Primary CTA proxy: /products/money-claim | Low | Informational overlap with product intent |
| `/ask-heaven/small-claims-for-rent-arrears-evidence` | `money-claim` | H1: What evidence do I need for a small claims rent arrears case?<br>Title: What evidence do I need for a small claims rent arrears case? (England) | Ask Heaven | Landlord Heaven<br>Meta: Evidence checklist for rent arrears cases in the small claims track.<br>Primary CTA proxy: /products/money-claim | Low | Informational overlap with product intent |
| `/ask-heaven/tenancy-agreement-checklist-uk-landlord` | `ast` | H1: What should be in a UK landlord tenancy agreement checklist?<br>Title: What should be in a UK landlord tenancy agreement checklist? | Ask Heaven | Landlord Heaven<br>Meta: Checklist of essential terms and compliance items for UK tenancy agreements.<br>Primary CTA proxy: /products/ast | Low | Informational overlap with product intent |
| `/ask-heaven/wales-occupation-contract-notice-periods` | `ast` | H1: What notice periods apply to Wales occupation contracts?<br>Title: What notice periods apply to Wales occupation contracts? (Wales) | Ask Heaven | Landlord Heaven<br>Meta: Notice period guidance for Wales occupation contracts and Section 173.<br>Primary CTA proxy: /products/ast | Low | Informational overlap with product intent |
| `/ask-heaven/wales-occupation-contract-vs-tenancy` | `ast` | H1: What is the difference between a Wales occupation contract and a tenancy?<br>Title: What is the difference between a Wales occupation contract and a tenancy? | Ask Heaven | Landlord Heaven<br>Meta: Summary of occupation contracts in Wales vs English tenancies.<br>Primary CTA proxy: /products/ast | Low | Informational overlap with product intent |
| `/ask-heaven/wales-occupation-contract-written-statement` | `ast` | H1: What is the written statement requirement for Wales occupation contracts?<br>Title: What is the written statement requirement for Wales occupation contracts? (Wales) | Ask Heaven | Landlord Heaven<br>Meta: Explains the written statement requirement under Renting Homes (Wales).<br>Primary CTA proxy: /products/ast | Low | Informational overlap with product intent |
| `/ask-heaven/warrant-of-possession-bailiffs-eviction` | `complete-pack` | H1: How do I get bailiffs after a possession order?<br>Title: How do I get bailiffs after a possession order? (England) | Ask Heaven | Landlord Heaven<br>Meta: Overview of warrants of possession and bailiff enforcement in England.<br>Primary CTA proxy: /products/complete-pack | Low | Informational overlap with product intent |
| `/ask-heaven/when-to-issue-money-claim-online-rent` | `money-claim` | H1: When should I issue a money claim online for rent arrears?<br>Title: When should I issue a money claim online for rent arrears? (England) | Ask Heaven | Landlord Heaven<br>Meta: Criteria for when to use MCOL for rent arrears in England.<br>Primary CTA proxy: /products/money-claim | Low | Informational overlap with product intent |
| `/blog/england-accelerated-possession` | `notice-only` | H1: Accelerated Possession Procedure England - Complete Guide<br>Title: Accelerated Possession Procedure England - Complete Guide | Landlord Heaven<br>Meta: Accelerated possession procedure explained for England landlords . Faster Section 21 evictions without court hearings. Learn the process, forms, and timelines.<br>Primary CTA proxy: /products/notice-only | Low | Informational overlap with product intent |
| `/blog/england-assured-shorthold-tenancy-guide` | `ast` | H1: Assured Shorthold Tenancy (AST) Guide - England<br>Title: Assured Shorthold Tenancy (AST) Guide - England | Landlord Heaven<br>Meta: Complete AST guide for England . Legal requirements, landlord obligations, deposit rules, and Renters Rights Act changes. Create compliant tenancy agreements.<br>Primary CTA proxy: /products/ast | Low | Informational overlap with product intent |
| `/blog/england-money-claim-online` | `money-claim` | H1: Money Claim Online (MCOL) - England & Wales Guide<br>Title: Money Claim Online (MCOL) - England & Wales Guide | Landlord Heaven<br>Meta: Use Money Claim Online to recover rent arrears from tenants. Complete MCOL guide for landlords covering claims, fees, and enforcement in . Get the England st...<br>Primary CTA proxy: /products/money-claim | Low | Informational overlap with product intent |
| `/blog/england-particulars-of-claim` | `money-claim` | H1: How to Write Particulars of Claim - Rent Arrears (England )<br>Title: How to Write Particulars of Claim - Rent Arrears (England ) | Landlord Heaven<br>Meta: Write effective particulars of claim for rent arrears. Step-by-step guide with examples for County Court money claims against tenants in England.<br>Primary CTA proxy: /products/money-claim | Low | Informational overlap with product intent |
| `/blog/england-section-21-process` | `notice-only` | H1: Section 21 Eviction Process Explained (England, )<br>Title: Section 21 Eviction Process Explained (England, ) | Landlord Heaven<br>Meta: Complete Section 21 eviction process guide for England. Step-by-step instructions, timeline, court forms, and deadline warning. Section 21 ends May .<br>Primary CTA proxy: /products/notice-only | Low | Informational overlap with product intent |
| `/blog/england-section-8-ground-1` | `notice-only` | H1: Section 8 Ground 1 Explained: Landlord Returning to<br>Title: Section 8 Ground 1 Explained: Landlord Returning to | Landlord Heaven<br>Meta: Section 8 Ground 1 explained. Recover your property to live in it as your home. Prior notice requirements, eligibility, and step-by-step England landlord guide.<br>Primary CTA proxy: /products/notice-only | Low | Informational overlap with product intent |
| `/blog/england-section-8-ground-10-11` | `notice-only` | H1: Section 8 Ground 10 & 11 Explained: Discretionary Rent<br>Title: Section 8 Ground 10 & 11 Explained: Discretionary Rent | Landlord Heaven<br>Meta: Section 8 Ground 10 and 11 explained for England landlords. Discretionary rent arrears eviction when Ground 8 fails. Court considerations and success strateg...<br>Primary CTA proxy: /products/notice-only | Low | Informational overlap with product intent |
| `/blog/england-section-8-ground-12` | `notice-only` | H1: Section 8 Ground 12 Explained: Breach of Tenancy Terms<br>Title: Section 8 Ground 12 Explained: Breach of Tenancy Terms | Landlord Heaven<br>Meta: Section 8 Ground 12 explained. Evict tenants for breach of tenancy terms in England. Evidence needed, notice periods, and step-by-step court process guide.<br>Primary CTA proxy: /products/notice-only | Low | Informational overlap with product intent |
| `/blog/england-section-8-ground-14` | `notice-only` | H1: Section 8 Ground 14 Explained: Antisocial Behaviour<br>Title: Section 8 Ground 14 Explained: Antisocial Behaviour | Landlord Heaven<br>Meta: Section 8 Ground 14 antisocial behaviour eviction guide. What counts as ASB, how to gather evidence, notice periods, and court requirements for England landl...<br>Primary CTA proxy: /products/notice-only | Low | Informational overlap with product intent |
| `/blog/england-section-8-ground-17` | `notice-only` | H1: Section 8 Ground 17 Explained: False Statement by Tenant<br>Title: Section 8 Ground 17 Explained: False Statement by Tenant | Landlord Heaven<br>Meta: Section 8 Ground 17 false statement eviction. Evict tenants who lied to get the tenancy. What counts as fraud, evidence needed, and landlord guide for England.<br>Primary CTA proxy: /products/notice-only | Low | Informational overlap with product intent |
| `/blog/england-section-8-ground-2` | `notice-only` | H1: Section 8 Ground 2 Explained: Mortgage Lender Repossession<br>Title: Section 8 Ground 2 Explained: Mortgage Lender Repossession | Landlord Heaven<br>Meta: Section 8 Ground 2 mortgage lender repossession explained. What happens when landlords default on mortgages. Guide for England landlords and affected tenants.<br>Primary CTA proxy: /products/notice-only | Low | Informational overlap with product intent |
| `/blog/england-section-8-ground-7` | `notice-only` | H1: Section 8 Ground 7 Explained: Death of Tenant (England)<br>Title: Section 8 Ground 7 Explained: Death of Tenant (England) | Landlord Heaven<br>Meta: Section 8 Ground 7 death of tenant explained. Regain possession after a tenant dies. Succession rights, 12-month time limit, and step-by-step guide for England.<br>Primary CTA proxy: /products/notice-only | Low | Informational overlap with product intent |
| `/blog/england-section-8-ground-8` | `notice-only` | H1: Section 8 Ground 8 Explained: Mandatory Rent Arrears<br>Title: Section 8 Ground 8 Explained: Mandatory Rent Arrears | Landlord Heaven<br>Meta: Section 8 Ground 8 rent arrears eviction guide. Mandatory possession for 2+ months arrears. Step-by-step process, evidence requirements, and tenant defences...<br>Primary CTA proxy: /products/notice-only | Low | Informational overlap with product intent |
| `/blog/england-section-8-process` | `notice-only` | H1: Section 8 Eviction Process Explained (England, )<br>Title: Section 8 Eviction Process Explained (England, ) | Landlord Heaven<br>Meta: Section 8 eviction guide for England . All grounds explained, notice periods, court process, and step-by-step instructions. Essential after Section 21 ends.<br>Primary CTA proxy: /products/notice-only | Low | Informational overlap with product intent |
| `/blog/england-standard-possession` | `notice-only` | H1: Standard Possession Procedure England - When You Need It (<br>Title: Standard Possession Procedure England - When You Need It ( | Landlord Heaven<br>Meta: Standard possession procedure England explained. Required for Section 8 claims and rent arrears recovery. Court hearings, forms, timelines, and expert tips.<br>Primary CTA proxy: /products/notice-only | Low | Informational overlap with product intent |
| `/blog/how-long-does-eviction-take-uk` | `notice-only` | H1: How Long Does Eviction Take in the UK? Complete Timeline<br>Title: How Long Does Eviction Take in the UK? Complete Timeline | Landlord Heaven<br>Meta: UK eviction timeline explained: Section 21 takes 4-6 months, Section 8 varies by ground. Get realistic timeframes for . Get the UK steps and choose the right...<br>Primary CTA proxy: /products/notice-only | Low | Informational overlap with product intent |
| `/blog/how-long-does-money-claim-online-take` | `money-claim` | H1: How Long Does Money Claim Online Take? MCOL Timeline Guide<br>Title: How Long Does Money Claim Online Take? MCOL Timeline Guide | Landlord Heaven<br>Meta: How long does MCOL take? Realistic timelines for Money Claim Online from submission to CCJ. Undefended vs defended claims, enforcement timeframes.<br>Primary CTA proxy: /products/money-claim | Low | Informational overlap with product intent |
| `/blog/how-to-serve-eviction-notice` | `notice-only` | H1: How to Serve an Eviction Notice in the UK: Step-by-Step<br>Title: How to Serve an Eviction Notice in the UK: Step-by-Step | Landlord Heaven<br>Meta: Step-by-step guide to serving eviction notices in the UK. Learn valid delivery methods, timing rules, and proof requirements for . Get the UK steps and choos...<br>Primary CTA proxy: /products/notice-only | Low | Informational overlap with product intent |
| `/blog/rent-arrears-eviction-guide` | `notice-only` | H1: Rent Arrears Eviction: Complete Guide for UK Landlords<br>Title: Rent Arrears Eviction: Complete Guide for UK Landlords | Landlord Heaven<br>Meta: Complete guide to evicting tenants for rent arrears in the UK. Learn about Section 8 Ground 8, timelines, and recovering unpaid rent. Get the UK steps and ch...<br>Primary CTA proxy: /products/notice-only | Low | Informational overlap with product intent |
| `/blog/renters-reform-bill-what-landlords-need-to-know` | `notice-only` | H1: Renters Reform Bill : What Every UK Landlord Must Know<br>Title: Renters Reform Bill : What Every UK Landlord Must Know | Landlord Heaven<br>Meta: Complete guide to the Renters Reform Bill . Section 21 ends May . Learn the changes, new grounds, and why landlords must start eviction proceedings now.<br>Primary CTA proxy: /products/notice-only | Low | Informational overlap with product intent |

## 3A) Funnel Scoreboard (top 50 non-product pages)
| URL | # product links above fold (proxy) | Total product links (top-target proxy) | Total links to non-product (top-target proxy) | Primary CTA destination (proxy) | Funnel score (0-100) |
|---|---:|---:|---:|---|---:|
| `/blog` | 1 | 8 | 5 | `/products/notice-only` | 100 |
| `/blog/england-section-21-process` | 1 | 18 | 7 | `/products/notice-only` | 100 |
| `/blog/england-section-8-ground-12` | 1 | 17 | 7 | `/products/notice-only` | 100 |
| `/blog/what-is-section-21-notice` | 1 | 16 | 9 | `/products/notice-only` | 100 |
| `/blog/england-accelerated-possession` | 1 | 14 | 9 | `/products/notice-only` | 100 |
| `/blog/england-section-8-ground-8` | 1 | 15 | 7 | `/products/notice-only` | 100 |
| `/blog/england-section-8-process` | 1 | 16 | 7 | `/products/notice-only` | 100 |
| `/blog/rent-arrears-eviction-guide` | 1 | 17 | 6 | `/products/notice-only` | 100 |
| `/blog/renters-reform-bill-what-landlords-need-to-know` | 1 | 18 | 8 | `/products/notice-only` | 100 |
| `/blog/england-assured-shorthold-tenancy-guide` | 1 | 16 | 7 | `/products/ast` | 100 |
| `/blog/england-section-8-ground-10-11` | 1 | 15 | 7 | `/products/notice-only` | 100 |
| `/blog/england-standard-possession` | 1 | 15 | 7 | `/products/notice-only` | 100 |
| `/blog/scotland-eviction-ground-11` | 1 | 15 | 7 | `/products/notice-only` | 95 |
| `/blog/section-21-vs-section-8` | 1 | 17 | 7 | `/products/notice-only` | 100 |
| `/blog/scotland-eviction-process` | 1 | 14 | 11 | `/products/notice-only` | 95 |
| `/blog/england-section-8-ground-1` | 1 | 14 | 11 | `/products/notice-only` | 100 |
| `/blog/england-section-8-ground-14` | 1 | 14 | 11 | `/products/notice-only` | 100 |
| `/blog/england-section-8-ground-17` | 1 | 14 | 11 | `/products/notice-only` | 100 |
| `/blog/england-section-8-ground-2` | 1 | 13 | 12 | `/products/notice-only` | 100 |
| `/blog/england-section-8-ground-7` | 1 | 14 | 11 | `/products/notice-only` | 100 |
| `/blog/scotland-eviction-ground-1` | 1 | 14 | 10 | `/products/notice-only` | 95 |
| `/blog/scotland-eviction-ground-12` | 1 | 15 | 7 | `/products/notice-only` | 95 |
| `/blog/scotland-eviction-ground-13` | 1 | 14 | 10 | `/products/notice-only` | 95 |
| `/blog/scotland-eviction-ground-14` | 1 | 14 | 10 | `/products/notice-only` | 95 |
| `/blog/scotland-eviction-ground-15` | 1 | 14 | 10 | `/products/notice-only` | 95 |
| `/blog/scotland-eviction-ground-3` | 1 | 14 | 10 | `/products/notice-only` | 95 |
| `/blog/scotland-eviction-ground-4` | 1 | 14 | 10 | `/products/notice-only` | 95 |
| `/blog/scotland-eviction-ground-6` | 1 | 14 | 10 | `/products/notice-only` | 95 |
| `/blog/scotland-eviction-ground-7` | 1 | 14 | 10 | `/products/notice-only` | 95 |
| `/blog/scotland-notice-to-leave` | 1 | 14 | 10 | `/products/notice-only` | 95 |
| `/blog/scotland-private-residential-tenancy` | 1 | 15 | 7 | `/products/notice-only` | 95 |
| `/blog/uk-rent-arrears-guide` | 1 | 13 | 7 | `/products/notice-only` | 100 |
| `/blog/wales-eviction-process` | 1 | 13 | 11 | `/products/notice-only` | 95 |
| `/blog/england-money-claim-online` | 1 | 16 | 7 | `/products/money-claim` | 100 |
| `/blog/england-particulars-of-claim` | 1 | 16 | 7 | `/products/money-claim` | 100 |
| `/blog/uk-corporate-letting-guide` | 1 | 17 | 7 | `/products/notice-only` | 95 |
| `/blog/uk-holiday-let-regulations-guide` | 1 | 17 | 7 | `/products/notice-only` | 95 |
| `/blog/uk-property-portfolio-growth-guide` | 1 | 17 | 7 | `/products/notice-only` | 95 |
| `/blog/uk-student-letting-guide` | 1 | 17 | 7 | `/products/notice-only` | 95 |
| `/blog/wales-anti-social-behaviour-possession` | 1 | 13 | 10 | `/products/notice-only` | 95 |
| `/blog/wales-contract-holder-rights` | 1 | 14 | 7 | `/products/notice-only` | 95 |
| `/blog/wales-notice-periods-landlords` | 1 | 13 | 10 | `/products/notice-only` | 95 |
| `/blog/wales-possession-grounds` | 1 | 13 | 10 | `/products/notice-only` | 95 |
| `/blog/what-to-do-when-tenant-wont-pay` | 1 | 13 | 6 | `/products/notice-only` | 95 |
| `/blog/england-bailiff-eviction` | 1 | 15 | 9 | `/products/notice-only` | 95 |
| `/blog/england-county-court-forms` | 1 | 15 | 9 | `/products/notice-only` | 95 |
| `/blog/england-possession-hearing` | 1 | 15 | 9 | `/products/notice-only` | 95 |
| `/blog/fair-wear-tear-vs-tenant-damage` | 1 | 13 | 6 | `/products/notice-only` | 95 |
| `/blog/how-long-does-eviction-take-uk` | 1 | 16 | 8 | `/products/notice-only` | 100 |
| `/blog/how-to-serve-eviction-notice` | 1 | 15 | 8 | `/products/notice-only` | 100 |

## 3B) Top 20 guide→guide loop examples (heuristic)
| Loop path | Should link to product instead |
|---|---|

## 4) Keyword/Intent overlap clusters
### Transactional template pages
- URLs (35): `/6-month-tenancy-agreement-template`, `/ask-heaven/repayment-plan-template-landlord-tenant`, `/assured-shorthold-tenancy-agreement-template`, `/blog/how-to-write-letter-before-action-unpaid-rent`, `/eviction-notice`, `/eviction-notice-template`, `/eviction-notice-uk`, `/eviction-pack-england`, `/fixed-term-tenancy-agreement-template`, `/form-3-section-8`, `/form-6a-section-21`, `/how-to-evict-tenant`, `/joint-tenancy-agreement-template`, `/lodger-agreement-template`, `/money-claim`, `/money-claim-letter-before-action`, `/money-claim-schedule-of-debt`, `/ni-tenancy-agreement-template-free`, `/northern-ireland-tenancy-agreement-template`, `/pre-action-protocol-debt`, `/private-residential-tenancy-agreement-template`, `/products/ast`, `/products/complete-pack`, `/products/notice-only`, `/rent-arrears-letter-template` ...
- Potential duplicates: `/eviction-notice`, `/eviction-notice-template`

### Informational guides
- URLs (48): `/ask-heaven/how-to-serve-section-21-notice-england`, `/ask-heaven/section-21-gas-safety-epc-how-to-fix`, `/blog/how-to-serve-eviction-notice`, `/blog/how-to-write-letter-before-action-unpaid-rent`, `/county-court-claim-form-guide`, `/eviction-cost-uk`, `/eviction-notice`, `/eviction-notice-uk`, `/eviction-pack-england`, `/eviction-process-england`, `/eviction-process-scotland`, `/eviction-process-wales`, `/how-to-evict-tenant`, `/how-to-rent-guide`, `/money-claim`, `/money-claim-abandoned-goods`, `/money-claim-appliance-damage`, `/money-claim-bathroom-damage`, `/money-claim-carpet-damage`, `/money-claim-ccj-enforcement`, `/money-claim-cleaning-costs`, `/money-claim-council-tax`, `/money-claim-deposit-shortfall`, `/money-claim-early-termination`, `/money-claim-former-tenant` ...
- Potential duplicates: None obvious

### Tools/generators
- URLs (8): `/tools/free-rent-demand-letter`, `/tools/free-section-21-notice-generator`, `/tools/free-section-8-notice-generator`, `/tools/hmo-license-checker`, `/tools/rent-arrears-calculator`, `/tools/validators`, `/tools/validators/section-21`, `/tools/validators/section-8`
- Potential duplicates: None obvious

### Money-claim variants
- URLs (36): `/ask-heaven/mcol-process-for-rent-arrears-england`, `/ask-heaven/money-claim-after-tenant-moves-out`, `/ask-heaven/when-to-issue-money-claim-online-rent`, `/blog/england-county-court-forms`, `/blog/england-money-claim-online`, `/blog/how-long-does-money-claim-online-take`, `/blog/uk-money-claims-online-guide`, `/county-court-claim-form-guide`, `/eviction-pack-england`, `/money-claim`, `/money-claim-abandoned-goods`, `/money-claim-appliance-damage`, `/money-claim-bathroom-damage`, `/money-claim-carpet-damage`, `/money-claim-ccj-enforcement`, `/money-claim-cleaning-costs`, `/money-claim-council-tax`, `/money-claim-deposit-shortfall`, `/money-claim-early-termination`, `/money-claim-former-tenant`, `/money-claim-garden-damage`, `/money-claim-guarantor`, `/money-claim-letter-before-action`, `/money-claim-n1-claim-form`, `/money-claim-online-mcol` ...
- Potential duplicates: None obvious

### Jurisdiction-specific explainers
- URLs (157): `/apply-possession-order-landlord`, `/ask-heaven/accelerated-possession-costs-fees`, `/ask-heaven/accelerated-possession-timetable-england`, `/ask-heaven/ast-vs-periodic-tenancy-england`, `/ask-heaven/calculate-rent-arrears-and-interest`, `/ask-heaven/can-i-evict-without-court-england`, `/ask-heaven/claim-rent-arrears-from-deposit`, `/ask-heaven/court-hearing-prepare-possession-england`, `/ask-heaven/defended-possession-claim-s8-s21`, `/ask-heaven/guarantor-liability-for-rent-arrears`, `/ask-heaven/how-to-serve-section-21-notice-england`, `/ask-heaven/mcol-process-for-rent-arrears-england`, `/ask-heaven/money-claim-after-tenant-moves-out`, `/ask-heaven/notice-seeking-possession-vs-eviction`, `/ask-heaven/notice-to-leave-scotland-grounds`, `/ask-heaven/possession-order-what-happens-next`, `/ask-heaven/renewing-fixed-term-tenancy-england`, `/ask-heaven/rent-arrears-and-section-8-grounds`, `/ask-heaven/rent-arrears-letter-before-action-england`, `/ask-heaven/repayment-plan-template-landlord-tenant`, `/ask-heaven/scotland-eviction-court-process-tribunal`, `/ask-heaven/scotland-prt-notice-periods-2025`, `/ask-heaven/scotland-prt-vs-short-assured`, `/ask-heaven/scotland-rent-arrears-prt-steps`, `/ask-heaven/scotland-serving-notice-to-leave` ...
- Potential duplicates: `/blog/scotland-notice-to-leave`, `/scotland-notice-to-leave-template`

## 5) Action Plan (no implementation)
| URL | Target product page | Recommended action | SEO risk | Expected conversion impact | Notes |
|---|---|---|---|---|---|
| `/6-month-tenancy-agreement-template` | `/products/ast` | Keep + add above-fold product CTA | Low | High | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven` | `/products/money-claim` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/accelerated-possession-timetable-england` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/defended-possession-claim-s8-s21` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/how-to-serve-section-21-notice-england` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/rent-arrears-and-section-8-grounds` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/scotland-rent-arrears-prt-steps` | `/products/money-claim` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/section-21-accelerated-possession-n5b-guide` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/section-21-after-fixed-term-periodic` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/section-21-and-deposit-protection-rules` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/section-21-gas-safety-epc-how-to-fix` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/section-21-reissue-after-expiry` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/section-21-validity-checklist-form-6a` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/section-8-ground-10-11-discretionary-arrears` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/section-8-grounds-nuisance-anti-social` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/section-8-notice-periods-england-2025` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/when-to-use-section-8-form-3-grounds` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/calculating-interest-tenant-debt` | `/products/money-claim` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/england-county-court-forms` | `/products/complete-pack` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/scotland-eviction-ground-11` | `/products/ast` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/scotland-eviction-ground-12` | `/products/money-claim` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/scotland-notice-to-leave` | `/products/ast` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/scotland-private-residential-tenancy` | `/products/ast` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/scotland-simple-procedure` | `/products/money-claim` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/uk-property-marketing-guide` | `/products/ast` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/uk-void-period-management-guide` | `/products/ast` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/wales-joint-tenancies` | `/products/ast` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/wales-landlord-obligations-checklist` | `/products/ast` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/county-court-claim-form-guide` | `/products/money-claim` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/eviction-notice` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/eviction-notice-template` | `/products/notice-only` | Keep + add above-fold product CTA | Low | High | Preserve existing ranking copy blocks/FAQ where present |
| `/eviction-pack-england` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/fixed-term-periodic-tenancy-england` | `/products/ast` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/fixed-term-tenancy-agreement-template` | `/products/ast` | Keep + add above-fold product CTA | Low | High | Preserve existing ranking copy blocks/FAQ where present |
| `/form-3-section-8` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/how-to-rent-guide` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/joint-tenancy-agreement-england` | `/products/ast` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/joint-tenancy-agreement-template` | `/products/ast` | Keep + add above-fold product CTA | Low | High | Preserve existing ranking copy blocks/FAQ where present |
| `/money-claim` | `/products/money-claim` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/n5b-form-guide` | `/products/complete-pack` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/periodic-tenancy-agreement` | `/products/ast` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/possession-claim-guide` | `/products/complete-pack` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/pricing` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/renew-tenancy-agreement-england` | `/products/ast` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/rent-arrears-letter-template` | `/products/money-claim` | Keep + add above-fold product CTA | Low | High | Preserve existing ranking copy blocks/FAQ where present |
| `/rolling-tenancy-agreement` | `/products/ast` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/scotland-notice-to-leave-template` | `/products/ast` | Keep + add above-fold product CTA | Low | High | Preserve existing ranking copy blocks/FAQ where present |
| `/section-21-expired-what-next` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/tenant-damaging-property` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/tenant-not-paying-rent` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/tenant-wont-leave` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/tools` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/tools/free-rent-demand-letter` | `/products/money-claim` | Keep + add above-fold product CTA | Low | High | Preserve existing ranking copy blocks/FAQ where present |
| `/tools/free-section-21-notice-generator` | `/products/notice-only` | Keep + add above-fold product CTA | Low | High | Preserve existing ranking copy blocks/FAQ where present |
| `/tools/free-section-8-notice-generator` | `/products/notice-only` | Keep + add above-fold product CTA | Low | High | Preserve existing ranking copy blocks/FAQ where present |
| `/tools/rent-arrears-calculator` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/tools/validators` | `/products/notice-only` | Consolidate with canonical | Med | High | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/repayment-plan-template-landlord-tenant` | `/products/money-claim` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/assured-shorthold-tenancy-agreement-template` | `/products/ast` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/blog` | `/products/notice-only` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/how-to-write-letter-before-action-unpaid-rent` | `/products/money-claim` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/eviction-notice-uk` | `/products/notice-only` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/form-6a-section-21` | `/products/notice-only` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/money-claim-letter-before-action` | `/products/money-claim` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/money-claim-schedule-of-debt` | `/products/money-claim` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/ni-tenancy-agreement-template-free` | `/products/ast` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/northern-ireland-tenancy-agreement-template` | `/products/ast` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/pre-action-protocol-debt` | `/products/money-claim` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/private-residential-tenancy-agreement-template` | `/products/ast` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/section-21-ban` | `/products/notice-only` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/section-21-notice-template` | `/products/notice-only` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/section-8-notice-template` | `/products/notice-only` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/section-8-vs-section-21` | `/products/notice-only` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/tenancy-agreement-template-free` | `/products/ast` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/tools/validators/section-21` | `/products/notice-only` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/tools/validators/section-8` | `/products/notice-only` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/wales-eviction-notice-template` | `/products/notice-only` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/wales-tenancy-agreement-template` | `/products/ast` | Keep + retitle/re-H1 to informational | Med | Med | Preserve existing ranking copy blocks/FAQ where present |
| `/apply-possession-order-landlord` | `/products/complete-pack` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/ast-vs-periodic-tenancy-england` | `/products/ast` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/calculate-rent-arrears-and-interest` | `/products/money-claim` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/claim-rent-arrears-from-deposit` | `/products/money-claim` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/guarantor-liability-for-rent-arrears` | `/products/money-claim` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/mcol-process-for-rent-arrears-england` | `/products/money-claim` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/money-claim-after-tenant-moves-out` | `/products/money-claim` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/notice-to-leave-scotland-grounds` | `/products/ast` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/possession-order-what-happens-next` | `/products/complete-pack` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/rent-arrears-letter-before-action-england` | `/products/money-claim` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/scotland-eviction-court-process-tribunal` | `/products/ast` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/scotland-prt-notice-periods-2025` | `/products/ast` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/scotland-prt-vs-short-assured` | `/products/ast` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/scotland-tenant-abandonment-prt` | `/products/ast` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/section-8-ground-8-mandatory-arrears` | `/products/money-claim` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/small-claims-for-rent-arrears-evidence` | `/products/money-claim` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/tenancy-agreement-checklist-uk-landlord` | `/products/ast` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/wales-occupation-contract-notice-periods` | `/products/ast` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/wales-occupation-contract-vs-tenancy` | `/products/ast` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/wales-occupation-contract-written-statement` | `/products/ast` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/warrant-of-possession-bailiffs-eviction` | `/products/complete-pack` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/ask-heaven/when-to-issue-money-claim-online-rent` | `/products/money-claim` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/england-accelerated-possession` | `/products/notice-only` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/england-assured-shorthold-tenancy-guide` | `/products/ast` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/england-money-claim-online` | `/products/money-claim` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/england-particulars-of-claim` | `/products/money-claim` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/england-section-21-process` | `/products/notice-only` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/england-section-8-ground-1` | `/products/notice-only` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/england-section-8-ground-10-11` | `/products/notice-only` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/england-section-8-ground-12` | `/products/notice-only` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/england-section-8-ground-14` | `/products/notice-only` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/england-section-8-ground-17` | `/products/notice-only` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/england-section-8-ground-2` | `/products/notice-only` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/england-section-8-ground-7` | `/products/notice-only` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/england-section-8-ground-8` | `/products/notice-only` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/england-section-8-process` | `/products/notice-only` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/england-standard-possession` | `/products/notice-only` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/how-long-does-eviction-take-uk` | `/products/notice-only` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/how-long-does-money-claim-online-take` | `/products/money-claim` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/how-to-serve-eviction-notice` | `/products/notice-only` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/rent-arrears-eviction-guide` | `/products/notice-only` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |
| `/blog/renters-reform-bill-what-landlords-need-to-know` | `/products/notice-only` | No change needed (monitor) | Low | Low | Preserve existing ranking copy blocks/FAQ where present |

## 6) Top 10 quick wins
### 1. `/6-month-tenancy-agreement-template` → `/products/ast`
- Current H1: 6 Month Tenancy Agreement Template
- Current Title: 6 Month Tenancy Agreement Template UK 2026 — Short-Term AST | Landlord Heaven
- Current Meta: Free 6 month tenancy agreement template for UK landlords. Short-term AST with notice periods, break clauses, and renewal options.
- Current primary CTA proxy: `/tools`
- Recommended CTA placement: **Above fold**
- Tracking params: `src=6-month-tenancy-agreement-template&topic=ast`

### 2. `/ask-heaven` → `/products/money-claim`
- Current H1: Ask Heaven: Free UK Landlord Q&A Tool
- Current Title: Free Landlord Legal Q&A | UK | Ask Heaven | Landlord Heaven
- Current Meta: Free landlord Q&A for UK. Instant answers on evictions, rent arrears, tenancy agreements, and compliance across all jurisdictions.
- Current primary CTA proxy: `/tools`
- Recommended CTA placement: **Above fold**
- Tracking params: `src=ask-heaven&topic=ast`

### 3. `/ask-heaven/accelerated-possession-timetable-england` → `/products/notice-only`
- Current H1: What is the accelerated possession timetable for England?
- Current Title: What is the accelerated possession timetable for England? (England) | Ask Heaven | Landlord Heaven
- Current Meta: Typical timelines for accelerated possession claims after Section 21 in England.
- Current primary CTA proxy: `/products/complete-pack`
- Recommended CTA placement: **Above fold**
- Tracking params: `src=ask-heaven_accelerated-possession-timetable-england&topic=section_21`

### 4. `/ask-heaven/defended-possession-claim-s8-s21` → `/products/notice-only`
- Current H1: What happens if my possession claim is defended?
- Current Title: What happens if my possession claim is defended? (England) | Ask Heaven | Landlord Heaven
- Current Meta: Guidance on defended possession claims under Section 8 or Section 21 in England.
- Current primary CTA proxy: `/products/complete-pack`
- Recommended CTA placement: **Above fold**
- Tracking params: `src=ask-heaven_defended-possession-claim-s8-s21&topic=section_21`

### 5. `/ask-heaven/how-to-serve-section-21-notice-england` → `/products/notice-only`
- Current H1: How do I serve a Section 21 notice correctly in England?
- Current Title: How do I serve a Section 21 notice correctly in England? (England) | Ask Heaven | Landlord Heaven
- Current Meta: A practical overview of serving a valid Section 21 notice in England, with compliance checks and next steps.
- Current primary CTA proxy: `/products/complete-pack`
- Recommended CTA placement: **Above fold**
- Tracking params: `src=ask-heaven_how-to-serve-section-21-notice-england&topic=section_21`

### 6. `/ask-heaven/rent-arrears-and-section-8-grounds` → `/products/notice-only`
- Current H1: How do rent arrears affect Section 8 grounds?
- Current Title: How do rent arrears affect Section 8 grounds? (England) | Ask Heaven | Landlord Heaven
- Current Meta: Explains how arrears levels connect to Section 8 grounds in England.
- Current primary CTA proxy: `/products/money-claim`
- Recommended CTA placement: **Above fold**
- Tracking params: `src=ask-heaven_rent-arrears-and-section-8-grounds&topic=section_8`

### 7. `/ask-heaven/scotland-rent-arrears-prt-steps` → `/products/money-claim`
- Current H1: What steps should I take for rent arrears in Scotland?
- Current Title: What steps should I take for rent arrears in Scotland? (Scotland) | Ask Heaven | Landlord Heaven
- Current Meta: Step-by-step guide for handling rent arrears under a Scotland PRT, including notices, evidence, negotiation, and tribunal next steps.
- Current primary CTA proxy: `/products/ast`
- Recommended CTA placement: **Above fold**
- Tracking params: `src=ask-heaven_scotland-rent-arrears-prt-steps&topic=ast`

### 8. `/ask-heaven/section-21-accelerated-possession-n5b-guide` → `/products/notice-only`
- Current H1: How does the N5B accelerated possession process work after Section 21?
- Current Title: How does the N5B accelerated possession process work after Section 21? (England) | Ask Heaven | Landlord Heaven
- Current Meta: Guide to the N5B accelerated possession route after serving Section 21 in England.
- Current primary CTA proxy: `/products/complete-pack`
- Recommended CTA placement: **Above fold**
- Tracking params: `src=ask-heaven_section-21-accelerated-possession-n5b-guide&topic=section_21`

### 9. `/ask-heaven/section-21-after-fixed-term-periodic` → `/products/notice-only`
- Current H1: Can I serve Section 21 after a fixed term ends and the tenancy becomes periodic?
- Current Title: Can I serve Section 21 after a fixed term ends and the tenancy becomes periodic? (England) | Ask Heaven | Landlord Heaven
- Current Meta: Explains Section 21 use after a fixed term becomes periodic in England.
- Current primary CTA proxy: `/products/complete-pack`
- Recommended CTA placement: **Above fold**
- Tracking params: `src=ask-heaven_section-21-after-fixed-term-periodic&topic=section_21`

### 10. `/ask-heaven/section-21-and-deposit-protection-rules` → `/products/notice-only`
- Current H1: How does deposit protection affect Section 21 notices?
- Current Title: How does deposit protection affect Section 21 notices? (England) | Ask Heaven | Landlord Heaven
- Current Meta: Explains deposit protection requirements and Section 21 implications in England.
- Current primary CTA proxy: `/products/complete-pack`
- Recommended CTA placement: **Above fold**
- Tracking params: `src=ask-heaven_section-21-and-deposit-protection-rules&topic=section_21`

## 7) Tracking plan
### UTM / query convention
- `src=<page_slug>`
- `topic=<section21|section8|money_claim|ast|other>`
- `destination_product=<notice-only|complete-pack|money-claim|ast>`

### GA4 events
- `product_cta_click` params: `src`, `topic`, `destination_product`
- `wizard_start` params: `src`, `topic`, `product`
- `preview_view` params: `src`, `product`, `jurisdiction`
- `purchase_complete` params: `src`, `product`, `order_value`

### GA4 report spec
1. Guide page → Product click rate (`product_cta_click` / page views by `src`).
2. Product visit → Purchase rate (sessions including product page + `purchase_complete`).
3. Assisted conversions by `src` (attribution path includes guide/tool before purchase).
