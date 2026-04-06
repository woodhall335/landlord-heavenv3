# Legal Validity Audit

## Audit Summary
- Flows discovered: 10
- Templates referenced: 33
- PDFs found (templates + official forms): 15
- Official form PDFs referenced via registry: 7
- Scan roots: config/jurisdictions/** and public/official-forms/**
- Blocking issues: 0
- Orphan templates: 0
- Orphan PDFs: 0

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
- None

## Legal vs Technical Risk
- Legal risk: jurisdiction/template mismatches, missing official PDFs
- Technical risk: orphan templates and registry gaps reduce determinism