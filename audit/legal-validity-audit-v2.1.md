# Legal Validity Audit v2.1

## Audit Summary
- Flows discovered: 13
- Templates resolved: 17
- PDFs found: 12
- Official form references: 11
- Candidate PDFs outside public: 2
- Manifest present: yes
- Blocking issues: 0

## Coverage table
| jurisdiction | product | route | status | officialForms | templateChecks | preconditions | noticeRules | mapperConsistency | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| england | eviction_pack | section_8 | PARTIAL | public/official-forms/n5-eng.pdf; public/official-forms/n119-eng.pdf | issues | ok | ok | ok | MEDIUM: Registry-only templates: uk/england/templates/notice_only/form_6a_section21/notice.hbs, uk/england/templates/notice_only/form_3_section8/notice.hbs |
| england | eviction_pack | section_21 | PARTIAL | public/official-forms/n5-eng.pdf; public/official-forms/n119-eng.pdf; public/official-forms/n5b-eng.pdf | issues | ok | ok | ok | MEDIUM: Registry-only templates: uk/england/templates/notice_only/form_6a_section21/notice.hbs, uk/england/templates/notice_only/form_3_section8/notice.hbs |
| england | money_claim | money_claim | PARTIAL | public/official-forms/N1_1224.pdf | issues | ok | ok | ok | MEDIUM: Registry-only templates: uk/england/templates/money_claims/pack_cover.hbs, uk/england/templates/money_claims/particulars_of_claim.hbs, uk/england/templates/money_claims/schedule_of_arrears.hbs, uk/england/templates/money_claims/interest_workings.hbs, uk/england/templates/money_claims/evidence_index.hbs, uk/england/templates/money_claims/hearing_prep_sheet.hbs, uk/england/templates/money_claims/letter_before_claim.hbs, uk/england/templates/money_claims/information_sheet_for_defendants.hbs, uk/england/templates/money_claims/reply_form.hbs, uk/england/templates/money_claims/financial_statement_form.hbs, uk/england/templates/money_claims/enforcement_guide.hbs, uk/england/templates/money_claims/filing_guide.hbs |
| england | notice_only | section_21 | PARTIAL | - | issues | ok | ok | ok | MEDIUM: Registry-only templates: uk/england/templates/notice_only/form_6a_section21/notice.hbs |
| england | notice_only | section_8 | PARTIAL | - | issues | ok | ok | ok | MEDIUM: Registry-only templates: uk/england/templates/notice_only/form_3_section8/notice.hbs |
| england | tenancy_agreement | tenancy_agreement | PARTIAL | - | issues | ok | ok | ok | MEDIUM: Registry-only templates: uk/england/templates/standard_ast_formatted.hbs, uk/england/templates/premium_ast_formatted.hbs |
| northern-ireland | tenancy_agreement | tenancy_agreement | PARTIAL | - | issues | ok | ok | ok | MEDIUM: Registry-only templates: uk/northern-ireland/templates/private_tenancy_agreement.hbs, uk/northern-ireland/templates/private_tenancy_premium.hbs |
| scotland | eviction_pack | notice_to_leave | PARTIAL | public/official-forms/scotland/notice_to_leave.pdf; public/official-forms/scotland/form_e_eviction.pdf | issues | ok | ok | ok | MEDIUM: Registry-only templates: uk/scotland/templates/eviction/notice_to_leave_official.hbs |
| scotland | money_claim | money_claim | PARTIAL | public/official-forms/scotland/form-3a.pdf; public/official-forms/scotland/simple_procedure_response_form.pdf | issues | ok | ok | ok | MEDIUM: Registry-only templates: uk/scotland/templates/money_claims/pack_cover.hbs, uk/scotland/templates/money_claims/simple_procedure_particulars.hbs, uk/scotland/templates/money_claims/schedule_of_arrears.hbs, uk/scotland/templates/money_claims/interest_calculation.hbs, uk/scotland/templates/money_claims/evidence_index.hbs, uk/scotland/templates/money_claims/hearing_prep_sheet.hbs, uk/scotland/templates/money_claims/pre_action_letter.hbs, uk/scotland/templates/money_claims/enforcement_guide_scotland.hbs, uk/scotland/templates/money_claims/filing_guide_scotland.hbs |
| scotland | notice_only | notice_to_leave | PARTIAL | public/official-forms/scotland/notice_to_leave.pdf | issues | ok | ok | ok | MEDIUM: Registry-only templates: uk/scotland/templates/eviction/notice_to_leave_official.hbs |
| scotland | tenancy_agreement | tenancy_agreement | PARTIAL | - | issues | ok | ok | ok | MEDIUM: Registry-only templates: uk/scotland/templates/prt_agreement.hbs, uk/scotland/templates/prt_agreement_premium.hbs |
| wales | eviction_pack | wales_section_173 | PARTIAL | public/official-forms/N5_WALES_1222.pdf; public/official-forms/N119_WALES_1222.pdf; public/official-forms/N5B_WALES_0323.pdf | issues | ok | ok | ok | MEDIUM: Registry-only templates: uk/wales/templates/notice_only/rhw16_notice_termination_6_months/notice.hbs |
| wales | eviction_pack | wales_fault_based | PARTIAL | public/official-forms/N5_WALES_1222.pdf; public/official-forms/N119_WALES_1222.pdf | issues | ok | ok | ok | MEDIUM: Registry-only templates: uk/wales/templates/notice_only/rhw16_notice_termination_6_months/notice.hbs |
| wales | money_claim | money_claim | PARTIAL | public/official-forms/N1_1224.pdf | issues | ok | ok | ok | MEDIUM: Registry-only templates: uk/england/templates/money_claims/pack_cover.hbs, uk/england/templates/money_claims/particulars_of_claim.hbs, uk/england/templates/money_claims/schedule_of_arrears.hbs, uk/england/templates/money_claims/interest_workings.hbs, uk/england/templates/money_claims/evidence_index.hbs, uk/england/templates/money_claims/hearing_prep_sheet.hbs, uk/england/templates/money_claims/letter_before_claim.hbs, uk/england/templates/money_claims/information_sheet_for_defendants.hbs, uk/england/templates/money_claims/reply_form.hbs, uk/england/templates/money_claims/financial_statement_form.hbs, uk/england/templates/money_claims/enforcement_guide.hbs, uk/england/templates/money_claims/filing_guide.hbs |
| wales | notice_only | wales_section_173 | PARTIAL | - | issues | ok | ok | ok | MEDIUM: Registry-only templates: uk/wales/templates/notice_only/rhw16_notice_termination_6_months/notice.hbs, uk/wales/templates/notice_only/rhw17_notice_termination_2_months/notice.hbs |
| wales | notice_only | wales_fault_based | PARTIAL | - | issues | ok | ok | ok | MEDIUM: Registry-only templates: uk/wales/templates/notice_only/rhw23_notice_before_possession_claim/notice.hbs |
| wales | tenancy_agreement | tenancy_agreement | PARTIAL | - | issues | ok | ok | ok | MEDIUM: Registry-only templates: uk/wales/templates/standard_occupation_contract.hbs, uk/wales/templates/premium_occupation_contract.hbs |

## Issues by severity
### HIGH
### MEDIUM
- england/section_8: Registry-only templates: uk/england/templates/notice_only/form_6a_section21/notice.hbs, uk/england/templates/notice_only/form_3_section8/notice.hbs
- england/section_21: Registry-only templates: uk/england/templates/notice_only/form_6a_section21/notice.hbs, uk/england/templates/notice_only/form_3_section8/notice.hbs
- england/money_claim: Registry-only templates: uk/england/templates/money_claims/pack_cover.hbs, uk/england/templates/money_claims/particulars_of_claim.hbs, uk/england/templates/money_claims/schedule_of_arrears.hbs, uk/england/templates/money_claims/interest_workings.hbs, uk/england/templates/money_claims/evidence_index.hbs, uk/england/templates/money_claims/hearing_prep_sheet.hbs, uk/england/templates/money_claims/letter_before_claim.hbs, uk/england/templates/money_claims/information_sheet_for_defendants.hbs, uk/england/templates/money_claims/reply_form.hbs, uk/england/templates/money_claims/financial_statement_form.hbs, uk/england/templates/money_claims/enforcement_guide.hbs, uk/england/templates/money_claims/filing_guide.hbs
- england/section_21: Registry-only templates: uk/england/templates/notice_only/form_6a_section21/notice.hbs
- england/section_8: Registry-only templates: uk/england/templates/notice_only/form_3_section8/notice.hbs
- england/tenancy_agreement: Registry-only templates: uk/england/templates/standard_ast_formatted.hbs, uk/england/templates/premium_ast_formatted.hbs
- northern-ireland/tenancy_agreement: Registry-only templates: uk/northern-ireland/templates/private_tenancy_agreement.hbs, uk/northern-ireland/templates/private_tenancy_premium.hbs
- scotland/notice_to_leave: Registry-only templates: uk/scotland/templates/eviction/notice_to_leave_official.hbs
- scotland/money_claim: Registry-only templates: uk/scotland/templates/money_claims/pack_cover.hbs, uk/scotland/templates/money_claims/simple_procedure_particulars.hbs, uk/scotland/templates/money_claims/schedule_of_arrears.hbs, uk/scotland/templates/money_claims/interest_calculation.hbs, uk/scotland/templates/money_claims/evidence_index.hbs, uk/scotland/templates/money_claims/hearing_prep_sheet.hbs, uk/scotland/templates/money_claims/pre_action_letter.hbs, uk/scotland/templates/money_claims/enforcement_guide_scotland.hbs, uk/scotland/templates/money_claims/filing_guide_scotland.hbs
- scotland/notice_to_leave: Registry-only templates: uk/scotland/templates/eviction/notice_to_leave_official.hbs
- scotland/tenancy_agreement: Registry-only templates: uk/scotland/templates/prt_agreement.hbs, uk/scotland/templates/prt_agreement_premium.hbs
- wales/wales_section_173: Registry-only templates: uk/wales/templates/notice_only/rhw16_notice_termination_6_months/notice.hbs
- wales/wales_fault_based: Registry-only templates: uk/wales/templates/notice_only/rhw16_notice_termination_6_months/notice.hbs
- wales/money_claim: Registry-only templates: uk/england/templates/money_claims/pack_cover.hbs, uk/england/templates/money_claims/particulars_of_claim.hbs, uk/england/templates/money_claims/schedule_of_arrears.hbs, uk/england/templates/money_claims/interest_workings.hbs, uk/england/templates/money_claims/evidence_index.hbs, uk/england/templates/money_claims/hearing_prep_sheet.hbs, uk/england/templates/money_claims/letter_before_claim.hbs, uk/england/templates/money_claims/information_sheet_for_defendants.hbs, uk/england/templates/money_claims/reply_form.hbs, uk/england/templates/money_claims/financial_statement_form.hbs, uk/england/templates/money_claims/enforcement_guide.hbs, uk/england/templates/money_claims/filing_guide.hbs
- wales/wales_section_173: Registry-only templates: uk/wales/templates/notice_only/rhw16_notice_termination_6_months/notice.hbs, uk/wales/templates/notice_only/rhw17_notice_termination_2_months/notice.hbs
- wales/wales_fault_based: Registry-only templates: uk/wales/templates/notice_only/rhw23_notice_before_possession_claim/notice.hbs
- wales/tenancy_agreement: Registry-only templates: uk/wales/templates/standard_occupation_contract.hbs, uk/wales/templates/premium_occupation_contract.hbs
### LOW

## Official Forms Coverage
- england/section_8: expected [public/official-forms/n5-eng.pdf, public/official-forms/n119-eng.pdf], mapped [public/official-forms/n5-eng.pdf, public/official-forms/n119-eng.pdf]
- england/section_21: expected [public/official-forms/n5-eng.pdf, public/official-forms/n119-eng.pdf, public/official-forms/n5b-eng.pdf], mapped [public/official-forms/n5-eng.pdf, public/official-forms/n119-eng.pdf, public/official-forms/n5b-eng.pdf]
- england/money_claim: expected [public/official-forms/N1_1224.pdf], mapped [public/official-forms/N1_1224.pdf]
- england/section_21: expected [public/official-forms/n5-eng.pdf, public/official-forms/n119-eng.pdf, public/official-forms/n5b-eng.pdf], mapped [-]
- england/section_8: expected [public/official-forms/n5-eng.pdf, public/official-forms/n119-eng.pdf], mapped [-]
- england/tenancy_agreement: expected [-], mapped [-]
- northern-ireland/tenancy_agreement: expected [-], mapped [-]
- scotland/notice_to_leave: expected [public/official-forms/scotland/notice_to_leave.pdf], mapped [public/official-forms/scotland/notice_to_leave.pdf, public/official-forms/scotland/form_e_eviction.pdf]
- scotland/money_claim: expected [public/official-forms/scotland/form-3a.pdf], mapped [public/official-forms/scotland/form-3a.pdf, public/official-forms/scotland/simple_procedure_response_form.pdf]
- scotland/notice_to_leave: expected [public/official-forms/scotland/notice_to_leave.pdf], mapped [public/official-forms/scotland/notice_to_leave.pdf]
- scotland/tenancy_agreement: expected [-], mapped [-]
- wales/wales_section_173: expected [public/official-forms/N5_WALES_1222.pdf, public/official-forms/N119_WALES_1222.pdf, public/official-forms/N5B_WALES_0323.pdf], mapped [public/official-forms/N5_WALES_1222.pdf, public/official-forms/N119_WALES_1222.pdf, public/official-forms/N5B_WALES_0323.pdf]
- wales/wales_fault_based: expected [public/official-forms/N5_WALES_1222.pdf, public/official-forms/N119_WALES_1222.pdf], mapped [public/official-forms/N5_WALES_1222.pdf, public/official-forms/N119_WALES_1222.pdf]
- wales/money_claim: expected [public/official-forms/N1_1224.pdf], mapped [public/official-forms/N1_1224.pdf]
- wales/wales_section_173: expected [public/official-forms/N5_WALES_1222.pdf, public/official-forms/N119_WALES_1222.pdf, public/official-forms/N5B_WALES_0323.pdf], mapped [-]
- wales/wales_fault_based: expected [public/official-forms/N5_WALES_1222.pdf, public/official-forms/N119_WALES_1222.pdf], mapped [-]
- wales/tenancy_agreement: expected [-], mapped [-]

## Official Form Candidates Found Outside /public/official-forms
- config/jurisdictions/uk/_official_form_sources/scotland/notice_to_leave_parts_1_3.pdf (notice-to-leave) [orphan]
- config/jurisdictions/uk/_official_form_sources/scotland/notice_to_leave_parts_1_3.pdf (notice-to-leave) [orphan]

Scanned /public/official-forms with total PDFs: 11