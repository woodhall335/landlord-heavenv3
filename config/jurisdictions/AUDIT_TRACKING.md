# Jurisdiction Config Audit Tracking

This file records the current status of eviction notice configuration files. All jurisdictions should be reviewed by qualified counsel before production use.

| Jurisdiction | Scope folders/files | Status | Notes |
| --- | --- | --- | --- |
| England | `config/jurisdictions/uk/england/**` | Existing | Housing Act 1988 content in place; continue periodic checks for Renters Reform updates. |
| Wales | `config/jurisdictions/uk/wales/**` | Updated structure | Added facts schema, index, decision rules, and ground definitions aligned to Renting Homes (Wales) Act 2016; pending Welsh legal sign-off. |
| Scotland | `config/jurisdictions/uk/scotland/**` | Review needed | Not reviewed in this pass; ensure Private Housing (Tenancies) Act alignment. |
| Northern Ireland | `config/jurisdictions/uk/northern-ireland/**` | Review needed | Not reviewed in this pass; confirm Private Tenancies Act updates. |
| England-Wales shared | `config/jurisdictions/uk/england-wales/**` | Review needed | Legacy shared configs; ensure not used for Wales post-2022. |
