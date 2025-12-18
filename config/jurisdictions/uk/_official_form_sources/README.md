# Official Form Sources (Reference Only)

**⚠️ IMPORTANT: These files are NOT used by the runtime template loader.**

This directory stores the original Word (.docx) prescribed form documents for reference purposes only.

## Purpose

- **Reference**: Keep official government prescribed forms as source material
- **Version Control**: Track which official form version templates are based on
- **Documentation**: Maintain audit trail of prescribed form requirements

## Structure

```
_official_form_sources/
├── england/
│   ├── form3_section8.docx          # Housing Act 1988 Form 3 (Section 8)
│   └── form6a_section21.docx        # Housing Act 1988 Form 6A (Section 21)
├── wales/
│   ├── rhw20_section173_bilingual.docx  # RHW20 Section 173 bilingual
│   └── fault_based_prescribed.docx      # Prescribed fault-based forms
└── scotland/
    └── notice_to_leave_parts_1_3.docx   # PRT Notice to Leave (statutory form)
```

## Runtime Template Location

The actual Handlebars templates used by the document generator are stored in:
- `config/jurisdictions/uk/england/templates/notice_only/`
- `config/jurisdictions/uk/wales/templates/notice_only/`
- `config/jurisdictions/uk/scotland/templates/notice_only/`

## Adding New Forms

When adding a new prescribed form:

1. Place the official .docx file in the appropriate jurisdiction folder
2. Convert to .hbs template in the corresponding `templates/notice_only/` folder
3. Update this README with the form details
4. Document the official source URL and effective date

## Official Sources

- **England**: https://www.gov.uk/government/publications/section-8-and-section-21-notices
- **Wales**: https://gov.wales/renting-homes-wales (Renting Homes (Wales) Act 2016)
- **Scotland**: https://www.mygov.scot/landlord-eviction (Private Housing (Tenancies) (Scotland) Act 2016)
