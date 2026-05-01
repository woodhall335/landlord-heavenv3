# Legal Validity Audit

## Audit Summary
- Flows discovered: 10
- Templates referenced: 33
- PDFs found (templates + official forms): 19
- Official form PDFs referenced via registry: 7
- Scan roots: config/jurisdictions/** and public/official-forms/**
- Blocking issues: 4
- Orphan templates: 6
- Orphan PDFs: 4

## Coverage
| jurisdiction | product | route | status | notes |
| --- | --- | --- | --- | --- |
| england | eviction_pack | section_8 | OK | - |
| england | money_claim | money_claim | OK | - |
| england | notice_only | section_8 | OK | - |
| england | tenancy_agreement | tenancy_agreement | OK | - |
| northern-ireland | tenancy_agreement | tenancy_agreement | OK | - |
| scotland | notice_only | notice_to_leave | OK | - |
| scotland | tenancy_agreement | tenancy_agreement | OK | - |
| wales | notice_only | wales_section_173 | OK | - |
| wales | notice_only | wales_fault_based | OK | - |
| wales | tenancy_agreement | tenancy_agreement | OK | - |

## Issues
- MEDIUM: orphan template config\jurisdictions\uk\england\templates\eviction\court_forms_guide.hbs
- MEDIUM: orphan template config\jurisdictions\uk\england\templates\eviction\evidence_checklist_court_stage.hbs
- MEDIUM: orphan template config\jurisdictions\uk\england\templates\eviction\service_record_notes.hbs
- MEDIUM: orphan template config\jurisdictions\uk\england\templates\eviction\what_happens_next_section_8.hbs
- MEDIUM: orphan template config\jurisdictions\uk\scotland\templates\eviction\court_bundle_index.hbs
- MEDIUM: orphan template config\jurisdictions\uk\scotland\templates\eviction\hearing_checklist.hbs
- MEDIUM: orphan PDF public\official-forms\Form_4A.pdf
- MEDIUM: orphan PDF public\official-forms\N215.pdf
- MEDIUM: orphan PDF public\official-forms\may\Form_3A_MAY.pdf
- MEDIUM: orphan PDF public\official-forms\may\Form_4A_MAY.pdf
- HIGH: orphan official form public\official-forms\Form_4A.pdf
- HIGH: orphan official form public\official-forms\N215.pdf
- HIGH: orphan official form public\official-forms\may\Form_3A_MAY.pdf
- HIGH: orphan official form public\official-forms\may\Form_4A_MAY.pdf

## Legal vs Technical Risk
- Legal risk: jurisdiction/template mismatches, missing official PDFs
- Technical risk: orphan templates and registry gaps reduce determinism